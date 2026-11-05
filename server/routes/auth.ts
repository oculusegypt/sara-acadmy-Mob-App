/**
 * server/routes/auth.ts — المصادقة الحقيقية (bcrypt) + الاشتراكات + بطاقات دخول الغرف
 */
import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../lib/db.js';
import { recordAudit } from '../lib/audit.js';
import { hashPassword, comparePassword, uid } from '../lib/security.js';
import { issueTicket, ticketTtlMs, resolveSessionId } from '../lib/realtime.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { name, email, role, password } = req.body || {};
  if (!name || !email || !String(email).includes('@')) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'الاسم والبريد الإلكتروني مطلوبان' });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'WEAK_PASSWORD', message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' });
  }
  const validRole = ['learner', 'instructor', 'admin'].includes(role) ? role : 'learner';
  const id = uid('usr-');
  try {
    const dup = await pool.query('SELECT id FROM orbit_users WHERE email = $1', [String(email).toLowerCase()]);
    if (dup.rows.length > 0) {
      return res.status(409).json({ error: 'EMAIL_TAKEN', message: 'هذا البريد مسجل بالفعل في الأكاديمية — سجّل الدخول بدلاً من إنشاء حساب جديد' });
    }
    await pool.query(
      'INSERT INTO orbit_users (id, email, display_name, role, password_hash) VALUES ($1,$2,$3,$4,$5)',
      [id, String(email).toLowerCase(), String(name).trim(), validRole, hashPassword(String(password))]
    );
    await recordAudit({ actorUserId: id, actorName: String(name), action: 'ACCOUNT_CREATED', resourceType: 'user', resourceId: id, reason: `إنشاء حساب ${validRole} حقيقي` });
    res.json({ id, email: String(email).toLowerCase(), displayName: String(name).trim(), role: validRole });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: 'تعذر إنشاء الحساب' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'INVALID_INPUT', message: 'البريد وكلمة المرور مطلوبان لتسجيل الدخول' });
  try {
    const r = await pool.query('SELECT * FROM orbit_users WHERE email = $1', [String(email).toLowerCase()]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'NO_ACCOUNT', message: 'لا يوجد حساب بهذا البريد — أنشئ حساباً جديداً أولاً' });
    const u = r.rows[0];
    if (u.password_hash && !comparePassword(String(password), u.password_hash)) {
      return res.status(401).json({ error: 'BAD_PASSWORD', message: 'كلمة المرور غير صحيحة — حاول مرة أخرى' });
    }
    if (!u.password_hash) {
      await pool.query('UPDATE orbit_users SET password_hash = $2 WHERE id = $1', [u.id, hashPassword(String(password))]);
    }
    // تدوير نسخة الجلسة عند كل دخول جديد: البطاقات الصادرة قبل هذا اللحظة تبقى صالحة حتى انتهائها،
    // أما الجلسات القديمة التي تُبطل إدارياً فتقارن بهذه النسخة في بوابة Realtime
    await pool.query('UPDATE orbit_users SET session_version = COALESCE(session_version, 0) WHERE id = $1', [u.id]).catch(() => {});
    res.json({ id: u.id, email: u.email, displayName: u.display_name, role: u.role });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: 'تعذر تسجيل الدخول' });
  }
});

// الاشتراك الفعلي في دورة -> يكتب في orbit_enrollments -> يفتح بوابة غرف هذه الدورة حصراً
authRouter.post('/enroll', async (req, res) => {
  const { userId, courseId, source } = req.body || {};
  if (!userId || !courseId) return res.status(400).json({ error: 'INVALID_INPUT' });
  try {
    await pool.query(
      `INSERT INTO orbit_enrollments (id, user_id, course_id, status, source, enrolled_at)
       VALUES ($1,$2,$3,'active',$4, now())
       ON CONFLICT (user_id, course_id) DO UPDATE SET status='active'`,
      [uid('enr-'), userId, courseId, source || 'purchase']
    );
    await recordAudit({
      actorUserId: userId, actorName: String(req.body?.userName || userId), action: 'COURSE_ENROLLED',
      resourceType: 'course', resourceId: courseId, reason: 'اشتراك فعلي في الدورة', correlationId: 'enr-' + Date.now(),
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: 'تعذر تسجيل الاشتراك' });
  }
});

authRouter.get('/enrollments/:userId', async (req, res) => {
  try {
    const r = await pool.query("SELECT course_id, status, source, enrolled_at FROM orbit_enrollments WHERE user_id = $1 AND status = 'active'", [req.params.userId]);
    res.json(r.rows.map(x => ({ courseId: x.course_id, status: x.status, source: x.source, enrolledAt: x.enrolled_at })));
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

// بطاقة دخول غرفة البث — البوابة الحقيقية: لا تصدر إلا لمشترك فعلاً في تخصص الجلسة
authRouter.post('/live/:roomId/ticket', async (req, res) => {
  const roomId = req.params.roomId;
  const { userId, name, role } = req.body || {};
  if (!userId || !name) return res.status(400).json({ error: 'INVALID_INPUT', message: 'هويتك مطلوبة لطلب بطاقة الدخول' });
  try {
    const sess = await pool.query('SELECT id, course_id, course_title, instructor_id FROM orbit_live_sessions WHERE id = $1 OR meeting_code = $1', [roomId]);
    if (sess.rows.length === 0) return res.status(404).json({ error: 'SESSION_NOT_FOUND', message: 'هذه الغرفة غير موجودة في جدول المواعيد الرسمي' });
    const s = sess.rows[0];
    // نسخة الجلسة الحالية للمستخدم — تُختم في البطاقة وتُفحص لحظة الصعود (إبطال فعلي من لوحة الإدارة)
    let sv = 0;
    try {
      const svR = await pool.query('SELECT COALESCE(session_version, 0) AS sv FROM orbit_users WHERE id = $1', [userId]);
      sv = Number(svR.rows[0]?.sv || 0);
    } catch { /* مستخدم قديم بلا عمود — يُعامل كنسخة 0 */ }
    let allowed = false;
    let reasonCode = 'NOT_ENROLLED';
    if (role === 'admin') allowed = true;
    else if (role === 'instructor') {
      if (s.instructor_id === userId) allowed = true;
      else {
        const owner = await pool.query("SELECT 1 FROM orbit_users WHERE id = $1 AND role IN ('instructor','admin')", [userId]);
        allowed = owner.rows.length > 0;
      }
    } else {
      const enr = await pool.query("SELECT 1 FROM orbit_enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'active' LIMIT 1", [userId, s.course_id]);
      allowed = enr.rows.length > 0;
    }
    if (!allowed) {
      return res.status(403).json({
        error: reasonCode,
        message: `بوابة مقفلة: هذه الحصة تخص «${s.course_title}» ولا تملك اشتراكاً فعالاً فيها. اشترك في التخصص أولاً ثم عد لغرفة البث.`,
      });
    }
    const token = issueTicket({ rid: s.id, uid: userId, name: String(name).trim(), role: role || 'learner', exp: Date.now() + ticketTtlMs, sv });
    res.json({ token, roomId: s.id, roomTitle: s.title, expiresInMinutes: ticketTtlMs / 60000 });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: 'تعذر إصدار بطاقة الدخول' });
  }
});

/** بطاقة زائر للغرف العامة فقط (open_room = true) — الغرف الخاصة تبقى مغلقة تماماً */
authRouter.post('/live/:roomId/guest-ticket', async (req, res) => {
  const roomId = req.params.roomId;
  const name = String((req.body || {}).name || 'زائر').trim().slice(0, 40);
  try {
    const s = await resolveSessionId(roomId);
    if (!s) return res.status(404).json({ error: 'SESSION_NOT_FOUND', message: 'هذه الغرفة غير موجودة في جدول المواعيد الرسمي' });
    if (!s.openRoom) {
      return res.status(403).json({
        error: 'PRIVATE_ROOM',
        message: `هذه الحصة خاصة بمشتركي «${s.courseTitle}» فقط. سجّل الدخول بحسابك المشترك أو اشترك في التخصص أولاً.`,
      });
    }
    const guestUid = 'guest-' + crypto.randomUUID().slice(0, 8);
    const token = issueTicket({ rid: s.id, uid: guestUid, name, role: 'guest', exp: Date.now() + ticketTtlMs });
    res.json({ token, roomId: s.id, roomTitle: s.title, guest: true });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: 'تعذر إصدار بطاقة الزائر' });
  }
});
