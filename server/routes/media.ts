/**
 * server/routes/media.ts — رفع الوسائط الحقيقي (فيديوهات/ملفات) إلى القرص + بث Range HTTP
 * لا محاكاة: بايتات الملف تُكتب فعلياً، والرابط يخدم الملف نفسه بمقاطع Range (تشغيل/سحب وقت حقيقي).
 */
import { Router, raw } from 'express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pool } from '../lib/db.js';
import { recordAudit } from '../lib/audit.js';
import { uid } from '../lib/security.js';

export const mediaRouter = Router();

const MEDIA_DIR = process.env.MEDIA_DIR || path.join(process.cwd(), 'uploads');
fs.mkdirSync(MEDIA_DIR, { recursive: true });

const SAFE_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v', '.pdf', '.mp3', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MAX_BYTES = Number(process.env.MEDIA_MAX_MB || 200) * 1024 * 1024;

const MIME: Record<string, string> = {
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.m4v': 'video/x-m4v',
  '.pdf': 'application/pdf', '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
};

// جداول الوسائط والمكتبة والشورتس (فارغة — كل سجل من فعل حقيقي فقط)
async function ensureMediaSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS orbit_media_objects (
    id TEXT PRIMARY KEY, file_name TEXT NOT NULL, mime TEXT NOT NULL, bytes BIGINT NOT NULL,
    sha256 TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'file',
    uploaded_by TEXT, uploaded_by_name TEXT, course_id TEXT, lesson_id TEXT,
    public_read BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS orbit_library_books (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT, category TEXT, pages_count INT DEFAULT 0,
    cover_url TEXT, description TEXT, download_url TEXT, published_year INT, instructor_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS orbit_shorts (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, video_url TEXT, category TEXT, duration TEXT,
    thumbnail TEXT, views INT DEFAULT 0, likes INT DEFAULT 0, instructor_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now())`);
}
ensureMediaSchema().catch((e) => console.warn('media schema warning:', String(e).slice(0, 120)));

// تصريح رفع قصير الأمد — الخادم يوقّع، الواجهة لا تعرف السر أبداً
mediaRouter.post('/sign-upload', express.json(), async (req, res) => {
  try {
    const fileName = String(req.body?.fileName || 'file');
    const kind = String(req.body?.kind || 'file');
    const user = String(req.body?.user || 'anonymous');
    // التحقق من الجلسة الحقيقية عبر القاعدة (نفس أسلوب مسارات auth)
    const u = await pool.query('SELECT id, role FROM orbit_users WHERE id=$1', [user]).catch(() => null);
    if (!u || u.rows.length === 0) return res.status(401).json({ error: 'NO_SESSION', message: 'يلزم تسجيل الدخول للرفع' });
    if (!['instructor', 'admin'].includes(u.rows[0].role)) return res.status(403).json({ error: 'ROLE_NOT_ALLOWED', message: 'الرفع متاح للمدرّبين والإدارة فقط' });
    const ts = Date.now();
    const sig = crypto.createHmac('sha256', process.env.APP_SECRET || 'orbit-academy-secret-2026')
      .update(`${fileName}|${kind}|${user}|${ts}`).digest('hex');
    res.json({ ok: true, ts, sig, expiresInSec: 600 });
  } catch (e: any) { res.status(500).json({ error: 'SIGN_FAILED', message: String(e?.message || e).slice(0, 150) }); }
});

/** الرفع: جسم خام binary + استعلام تدقيق HMAC بسيط لمنع الاستخدام المجهول */
mediaRouter.post('/upload', raw({ type: '*/*', limit: `${Math.ceil(MAX_BYTES / (1024 * 1024))}mb` }), async (req, res) => {
  try {
    const fileName = String(req.query.name || 'file');
    const kind = String(req.query.kind || 'file'); // video | pdf | image | audio
    const uploaderId = String(req.query.user || 'anonymous');
    const ts = String(req.query.ts || '');
    const sig = String(req.query.sig || '');
    const expected = crypto.createHmac('sha256', process.env.APP_SECRET || 'orbit-academy-secret-2026')
      .update(`${fileName}|${kind}|${uploaderId}|${ts}`).digest('hex');
    if (!sig || sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return res.status(401).json({ error: 'BAD_SIGNATURE' });
    }
    if (Date.now() - Number(ts) > 10 * 60 * 1000) return res.status(401).json({ error: 'EXPIRED' });

    const ext = path.extname(fileName).toLowerCase();
    if (!SAFE_EXT.has(ext)) return res.status(415).json({ error: 'UNSUPPORTED_TYPE', allowed: [...SAFE_EXT] });
    const body = req.body as Buffer;
    if (!body || body.length === 0) return res.status(400).json({ error: 'EMPTY_FILE' });
    if (body.length > MAX_BYTES) return res.status(413).json({ error: 'TOO_LARGE', maxMb: MAX_BYTES / 1048576 });

    const id = 'med-' + Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex');
    const stored = id + ext;
    const sha256 = crypto.createHash('sha256').update(body).digest('hex');
    await fs.promises.writeFile(path.join(MEDIA_DIR, stored), body); // كتابة فعلية على القرص

    const url = `/media/${stored}`;
    await pool.query(
      `INSERT INTO orbit_media_objects (id, file_name, mime, bytes, sha256, kind, uploaded_by, uploaded_by_name, course_id, lesson_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, fileName.slice(0, 200), MIME[ext] || 'application/octet-stream', body.length, sha256, kind,
       uploaderId, String(req.query.uname || uploaderId).slice(0, 80), String(req.query.course || '') || null, String(req.query.lesson || '') || null],
    ).catch(() => {});
    await recordAudit({ actorUserId: uploaderId, actorName: String(req.query.uname || uploaderId), action: 'media.upload', resourceType: 'media', resourceId: id, safeMetadata: { fileName, bytes: body.length, sha256: sha256.slice(0, 12), kind } });

    res.json({ ok: true, id, url, bytes: body.length, sha256, mime: MIME[ext] || 'application/octet-stream' });
  } catch (e: any) {
    res.status(500).json({ error: 'UPLOAD_FAILED', message: String(e?.message || e).slice(0, 200) });
  }
});

// قائمة وسائط المستخدم (للتدقيق في اللوحات)
mediaRouter.get('/list', async (req, res) => {
  try {
    const user = String(req.query.user || '');
    const r = await pool.query(
      'SELECT id, file_name, mime, bytes, kind, created_at FROM orbit_media_objects WHERE uploaded_by=$1 ORDER BY created_at DESC LIMIT 100',
      [user]);
    res.json(r.rows.map((x: any) => ({ ...x, url: `/media/${x.id}${path.extname(x.file_name).toLowerCase()}` })));
  } catch (e) { res.status(500).json({ error: 'DB_ERROR' }); }
});

// ===== CRUD المكتبة الرقمية (حقيقي — جدول orbit_library_books في Supabase) =====
mediaRouter.get('/library/books', async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM orbit_library_books ORDER BY created_at DESC');
    res.json(r.rows.map((x: any) => ({
      id: x.id, title: x.title, author: x.author, category: x.category, pagesCount: x.pages_count,
      coverUrl: x.cover_url, description: x.description, downloadUrl: x.download_url,
      publishedYear: x.published_year, createdAt: x.created_at,
    })));
  } catch (e) { res.status(500).json({ error: 'DB_ERROR' }); }
});
mediaRouter.post('/library/books', async (req, res) => {
  const b = req.body || {};
  if (!b.title) return res.status(400).json({ error: 'TITLE_REQUIRED' });
  const bookId = b.id || uid('book');
  try {
    await pool.query(
      `INSERT INTO orbit_library_books (id, title, author, category, pages_count, cover_url, description, download_url, published_year, instructor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [bookId, b.title, b.author || '', b.category || '', b.pagesCount || 0, b.coverUrl || '',
       b.description || '', b.downloadUrl || '', b.publishedYear || new Date().getFullYear(), b.instructorId || '']);
    await recordAudit({ actorUserId: b.instructorId, actorName: b.author || 'المدرّب', action: 'library.book.create', resourceType: 'library_book', resourceId: bookId, safeMetadata: { title: b.title, hasFile: !!b.downloadUrl } });
    res.json({ ok: true, id: bookId });
  } catch (e: any) { res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 150) }); }
});
mediaRouter.delete('/library/books/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orbit_library_books WHERE id=$1', [req.params.id]);
    await recordAudit({ actorName: 'المدرّب', action: 'library.book.delete', resourceType: 'library_book', resourceId: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'DB_ERROR' }); }
});

// ===== CRUD استوديو الشورتس (حقيقي — جدول orbit_shorts في Supabase) =====
mediaRouter.get('/shorts', async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM orbit_shorts ORDER BY created_at DESC');
    res.json(r.rows.map((x: any) => ({
      id: x.id, title: x.title, videoUrl: x.video_url, category: x.category, duration: x.duration,
      thumbnail: x.thumbnail, views: x.views, likes: x.likes, createdAt: x.created_at,
    })));
  } catch (e) { res.status(500).json({ error: 'DB_ERROR' }); }
});
mediaRouter.post('/shorts', async (req, res) => {
  const s = req.body || {};
  if (!s.title || !s.videoUrl) return res.status(400).json({ error: 'TITLE_AND_VIDEO_REQUIRED' });
  const shortId = s.id || uid('sh');
  try {
    await pool.query(
      `INSERT INTO orbit_shorts (id, title, video_url, category, duration, thumbnail, views, likes, instructor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [shortId, s.title, s.videoUrl, s.category || '', s.duration || '', s.thumbnail || '', s.views || 0, s.likes || 0, s.instructorId || '']);
    await recordAudit({ actorUserId: s.instructorId, actorName: 'المدرّب', action: 'short.create', resourceType: 'short', resourceId: shortId, safeMetadata: { title: s.title } });
    res.json({ ok: true, id: shortId });
  } catch (e: any) { res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 150) }); }
});
mediaRouter.delete('/shorts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orbit_shorts WHERE id=$1', [req.params.id]);
    await recordAudit({ actorName: 'المدرّب', action: 'short.delete', resourceType: 'short', resourceId: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'DB_ERROR' }); }
});
mediaRouter.post('/shorts/:id/view', async (req, res) => {
  try { await pool.query('UPDATE orbit_shorts SET views = views + 1 WHERE id=$1', [req.params.id]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: 'DB_ERROR' }); }
});
mediaRouter.post('/shorts/:id/like', async (req, res) => {
  try { await pool.query('UPDATE orbit_shorts SET likes = likes + 1 WHERE id=$1', [req.params.id]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: 'DB_ERROR' }); }
});

/** البث الحي مع دعم Range (كل المشغلات والمتصفحات تحتاجه لطلبات الفيديو الجزئية) */
export function serveMediaFile(res: any, absPath: string, mime: string) {
  let stat: fs.Stats;
  try { stat = fs.statSync(absPath); } catch { res.status(404).end('Not found'); return; }
  const range = res.req?.headers?.range as string | undefined;
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', mime);
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m && m[1] ? parseInt(m[1]) : 0;
    const end = m && m[2] ? parseInt(m[2]) : stat.size - 1;
    if (isNaN(start) || start >= stat.size || end >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); return res.end(); }
    res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
    fs.createReadStream(absPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': stat.size });
    fs.createReadStream(absPath).pipe(res);
  }
}
