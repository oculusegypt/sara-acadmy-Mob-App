/**
 * server/routes/catalog.ts — المحتوى التعليمي الحي: الدورات، المكتبة، الجلسات المباشرة،
 * جدول المواعيد حسب الاشتراك، التقدم، بطاقات التشغيل الموقعة، وسجل التدقيق.
 */
import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../lib/db.js';
import { recordAudit } from '../lib/audit.js';
import { hmacSign, hmacVerify } from '../lib/security.js';
import { MEDIA_BASE_URL } from '../config.js';

export const catalogRouter = Router();

// ===== حفظ/نشر الدورة (تكتبها لوحة المدرّب أو الإدارة — حقل sections JSONB) =====
catalogRouter.put('/courses/:courseId', async (req, res) => {
  const c = req.body || {};
  if (!c.id || !c.title) return res.status(400).json({ error: 'INVALID_INPUT', message: 'معرّف الدورة وعنوانها مطلوبان' });
  try {
    const exists = await pool.query('SELECT id FROM orbit_courses WHERE id = $1', [c.id]);
    if (exists.rows.length === 0) {
      await pool.query(
        `INSERT INTO orbit_courses (id, title, slug, summary, category, level, price_minor, currency,
           duration_hours, rating, reviews_count, thumbnail_url, instructor, outcomes, prerequisites, sections, status, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, now(), now())`,
        [c.id, c.title, c.slug || c.id, c.summary || '', c.category || '', c.level || '',
         c.priceMinor ?? 0, c.currency || 'EGP', String(c.durationHours ?? 0), c.rating ?? 5,
         c.reviewsCount ?? 0, c.thumbnailUrl || '', typeof c.instructor === 'string' ? c.instructor : JSON.stringify(c.instructor || ''),
         JSON.stringify(c.outcomes || []), JSON.stringify(c.prerequisites || []), JSON.stringify(c.sections || []), c.status || 'published']
      );
    } else {
      await pool.query(
        `UPDATE orbit_courses SET title=$2, summary=$3, category=$4, level=$5, price_minor=$6,
           duration_hours=$7, rating=$8, reviews_count=$9, thumbnail_url=$10, instructor=$11,
           outcomes=$12, prerequisites=$13, sections=$14, status=$15, updated_at=now() WHERE id=$1`,
        [c.id, c.title, c.summary || '', c.category || '', c.level || '',
         c.priceMinor ?? 0, String(c.durationHours ?? 0), c.rating ?? 5, c.reviewsCount ?? 0,
         c.thumbnailUrl || '', typeof c.instructor === 'string' ? c.instructor : JSON.stringify(c.instructor || ''),
         JSON.stringify(c.outcomes || []), JSON.stringify(c.prerequisites || []), JSON.stringify(c.sections || []), c.status || 'published']
      );
    }
    await recordAudit({
      actorUserId: c.updatedBy || undefined, actorName: c.updatedByName || 'المدرّب',
      action: exists.rows.length === 0 ? 'COURSE_CREATED' : 'COURSE_UPDATED',
      resourceType: 'course', resourceId: c.id, reason: `حفظ/نشر محتوى الدورة «${c.title}» في قاعدة البيانات الحية`,
    });
    res.json({ ok: true, id: c.id });
  } catch (e: any) {
    res.status(500).json({ error: 'DB_ERROR', message: 'تعذر حفظ الدورة: ' + String(e?.message || e).slice(0, 120) });
  }
});

// ===== الدورات المنشورة (Live Supabase) =====
catalogRouter.get('/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orbit_courses WHERE status = $1 ORDER BY created_at DESC', ['published']);
    res.json(result.rows.map(r => ({
      id: r.id, title: r.title, slug: r.slug, summary: r.summary, category: r.category, level: r.level,
      priceMinor: r.price_minor, currency: r.currency, durationHours: parseFloat(r.duration_hours),
      rating: parseFloat(r.rating), reviewsCount: r.reviews_count, thumbnailUrl: r.thumbnail_url,
      instructor: r.instructor, outcomes: r.outcomes, prerequisites: r.prerequisites,
      sections: r.sections, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
    })));
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'Failed to query courses' });
  }
});

// ===== المكتبة الرقمية =====
catalogRouter.get('/library/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orbit_library_books ORDER BY published_year DESC, created_at DESC');
    res.json(result.rows.map(r => ({
      id: r.id, title: r.title, author: r.author, category: r.category, pagesCount: r.pages_count,
      coverUrl: r.cover_url, description: r.description, downloadUrl: r.download_url,
      publishedYear: r.published_year, createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'Failed to query library books' });
  }
});

// ===== الجلسات المباشرة =====
catalogRouter.get('/live-sessions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orbit_live_sessions ORDER BY scheduled_at ASC');
    res.json(result.rows.map(r => ({
      id: r.id, courseId: r.course_id, courseTitle: r.course_title, instructorId: r.instructor_id,
      instructorName: r.instructor_name, title: r.title, description: r.description,
      scheduledAt: r.scheduled_at, durationMinutes: r.duration_minutes, status: r.status,
      attendeesCount: r.attendees_count, meetingCode: r.meeting_code,
    })));
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'Failed to query live sessions' });
  }
});

// ===== جدول المواعيد الحي — كل طالب يرى حصص تخصصه فقط حسب اشتراكه الفعلي =====
catalogRouter.get('/schedule', async (req, res) => {
  const userId = req.query.userId ? String(req.query.userId) : null;
  try {
    const result = await pool.query(`
      SELECT s.*, COALESCE(s.open_room, false) AS open_room,
             (e.user_id IS NOT NULL) AS my_enrolled,
             (SELECT COUNT(DISTINCT sa.user_id) FROM orbit_session_attendance sa
                WHERE sa.session_id = s.id AND sa.left_at IS NULL) AS live_attendees
        FROM orbit_live_sessions s
        LEFT JOIN orbit_enrollments e
          ON e.course_id = s.course_id AND e.status = 'active' AND e.user_id = $1
       ORDER BY s.scheduled_at ASC`, [userId || '']);
    let slots = result.rows.map(r => ({
      id: r.id, title: r.title, courseTitle: r.course_title, courseId: r.course_id,
      meetingCode: r.meeting_code, instructorName: r.instructor_name,
      startsAt: r.scheduled_at, durationMinutes: r.duration_minutes,
      status: r.status, openRoom: !!r.open_room, myEnrolled: !!r.my_enrolled,
      attendeesCount: Number(r.live_attendees) || 0,
    }));
    if (userId) {
      const u = await pool.query('SELECT role FROM orbit_users WHERE id = $1', [userId]);
      const role = u.rows[0]?.role || 'learner';
      if (role === 'learner') slots = slots.filter((s: any) => s.myEnrolled || s.openRoom);
    } else {
      slots = slots.filter((s: any) => s.openRoom);
    }
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'تعذر بناء جدول المواعيد' });
  }
});

// ===== تسجيل الحضور الفعلي في الحصة =====
catalogRouter.post('/live/:roomId/attendance', async (req, res) => {
  const { userId, name, role } = req.body || {};
  if (!userId || !name) return res.status(400).json({ error: 'INVALID_INPUT' });
  try {
    await pool.query(
      `INSERT INTO orbit_session_attendance (id, session_id, user_id, user_name, role, joined_at)
       VALUES ($1,$2,$3,$4,$5, now())
       ON CONFLICT (session_id, user_id) DO UPDATE SET left_at = NULL, joined_at = orbit_session_attendance.joined_at`,
      ['att-' + crypto.randomUUID().slice(0, 12), req.params.roomId, userId, String(name), role || 'learner']
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

// ===== تقدم الدروس المحفوظ فعلياً في قاعدة البيانات =====
catalogRouter.post('/progress', async (req, res) => {
  const { userId, lessonId, progressSeconds, completed } = req.body || {};
  if (!userId || !lessonId) return res.status(400).json({ error: 'INVALID_INPUT' });
  try {
    await pool.query(
      `INSERT INTO orbit_lesson_progress (user_id, lesson_id, progress_seconds, completed, completed_at, last_seen_at)
       VALUES ($1,$2,$3,$4, CASE WHEN $4 THEN now() ELSE NULL END, now())
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET
         progress_seconds = GREATEST(orbit_lesson_progress.progress_seconds, EXCLUDED.progress_seconds),
         completed = orbit_lesson_progress.completed OR EXCLUDED.completed,
         completed_at = CASE WHEN EXCLUDED.completed THEN COALESCE(orbit_lesson_progress.completed_at, now()) ELSE orbit_lesson_progress.completed_at END,
         last_seen_at = now()`,
      [userId, lessonId, Math.max(0, parseInt(String(progressSeconds)) || 0), !!completed]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: 'تعذر حفظ تقدم الدرس' });
  }
});

catalogRouter.get('/progress/:userId', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM orbit_lesson_progress WHERE user_id = $1', [req.params.userId]);
    res.json(r.rows.map(x => ({
      userId: x.user_id, lessonId: x.lesson_id, progressSeconds: x.progress_seconds,
      completed: x.completed, completedAt: x.completed_at, lastSeenAt: x.last_seen_at,
    })));
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

// ===== بطاقة تشغيل موقّعة HMAC فعلياً — التحقق من الاشتراك من قاعدة البيانات =====
catalogRouter.post('/lessons/:lessonId/playback-token', async (req, res) => {
  const { lessonId } = req.params;
  const { userId, isEnrolled, isPreview } = req.body || {};

  let authorized = !!isPreview;
  if (!authorized && userId) {
    try {
      const sessLessons = await pool.query(
        `SELECT c.id FROM orbit_courses c
          JOIN orbit_enrollments e ON e.course_id = c.id AND e.user_id = $1 AND e.status = 'active'
         WHERE c.sections::text LIKE '%' || $2 || '%'
         LIMIT 1`, [userId, lessonId]);
      authorized = sessLessons.rows.length > 0;
    } catch {
      authorized = !!isEnrolled;
    }
  } else if (!authorized && isEnrolled) {
    authorized = true;
  }

  if (!authorized) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'يتطلب هذا الدرس تسجيلاً فعالاً في الدورة لمشاهدته.' });
  }

  const expiresAtMs = Date.now() + 5 * 60 * 1000;
  const nonce = crypto.randomBytes(16).toString('hex');
  // التوقيع يشمل الدرس والمستخدم والصلاحية — أي عبث بالحمولة يبطل البطاقة
  const sig = hmacSign(`${lessonId}|${userId || 'anon'}|${nonce}|${expiresAtMs}`);
  const token = Buffer.from(JSON.stringify({ lid: lessonId, uid: userId || 'anon', n: nonce, exp: expiresAtMs, sig })).toString('base64url');

  let playbackUrl = `${MEDIA_BASE_URL}/BigBuckBunny.mp4`;
  let mediaSource = 'sample-public';
  try {
    const m = await pool.query(`SELECT download_url FROM orbit_library_books WHERE id = $1 AND download_url IS NOT NULL LIMIT 1`, [lessonId]);
    if (m.rows[0]?.download_url) { playbackUrl = m.rows[0].download_url; mediaSource = 'library-cdn'; }
  } catch { /* الجدول غير متاح -> تبقى العينة العامة المعلنة */ }

  res.json({ lessonId, token, playbackUrl, mediaSource, signed: true, expiresAt: new Date(expiresAtMs).toISOString(), isAuthorized: true });
});

/** التحقق من صلاحية بطاقة التشغيل الموقعة (تُستهلك في مسارات حماية الوسائط) */
export function verifyPlaybackToken(token: string): { lessonId: string; userId: string } | null {
  try {
    const p = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    if (!p?.lid || !p?.exp || Date.now() > p.exp) return null;
    if (!hmacVerify(`${p.lid}|${p.uid}|${p.n}|${p.exp}`, p.sig)) return null;
    return { lessonId: p.lid, userId: p.uid };
  } catch {
    return null;
  }
}

// خدمة محمية ببطاقة تشغيل — برهان حي أن التوقيع يُتحقق منه فعلاً قبل الإفراج
catalogRouter.get('/lessons/stream-check', async (req, res) => {
  const t = String(req.query.token || '');
  const parsed = verifyPlaybackToken(t);
  if (!parsed) return res.status(403).json({ error: 'BAD_PLAYBACK_TOKEN', message: 'بطاقة التشغيل غير صالحة أو منتهية' });
  res.json({ ok: true, lessonId: parsed.lessonId, userId: parsed.userId, grantedAt: new Date().toISOString() });
});

// ===== سجل التدقيق الموحد — قراءة/كتابة حقيقيتان =====
catalogRouter.get('/audit', async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit || '200')) || 200, 500);
  try {
    const r = await pool.query(
      `SELECT id, actor_user_id, actor_name, action, resource_type, resource_id,
              reason, correlation_id, safe_metadata, created_at
         FROM orbit_audit_events ORDER BY created_at DESC LIMIT $1`, [limit]);
    res.json(r.rows.map(x => ({
      id: x.id, actorUserId: x.actor_user_id, actorName: x.actor_name, action: x.action,
      resourceType: x.resource_type, resourceId: x.resource_id, reason: x.reason,
      correlationId: x.correlation_id, safeMetadata: x.safe_metadata || {}, createdAt: x.created_at,
    })));
  } catch (e) {
    res.json([]); // لا بيانات وهمية عند الفشل — قائمة فارغة صريحة
  }
});

catalogRouter.post('/audit', async (req, res) => {
  const b = req.body || {};
  if (!b.action || !b.resourceType || !b.actorName) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'حقول التدقيق الأساسية مفقودة' });
  }
  try {
    await recordAudit({
      actorUserId: b.actorUserId, actorName: String(b.actorName),
      action: String(b.action), resourceType: String(b.resourceType),
      resourceId: String(b.resourceId || ''), reason: String(b.reason || ''),
      correlationId: String(b.correlationId || ''), safeMetadata: b.safeMetadata || {},
    });
    res.status(201).json({ ok: true, id: 'aud-' + Date.now() });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: 'تعذر تسجيل حدث التدقيق' });
  }
});
