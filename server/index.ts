/**
 * server/index.ts — نقطة دخول الخادم المفصولة التخصصات (HTTP + Realtime WS)
 * الطبقات: config / lib(db, security, audit, realtime) / routes(auth, catalog, learning, payments, ai)
 */
import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PORT, isProd } from './config.js';
import { pool, ensureLiveSchema } from './lib/db.js';
import { attachRealtime } from './lib/realtime.js';
import { authRouter } from './routes/auth.js';
import { catalogRouter } from './routes/catalog.js';
import { learningRouter } from './routes/learning.js';
import { paymentsRouter } from './routes/payments.js';
import { aiRouter } from './routes/ai.js';
import { mediaRouter, serveMediaFile } from './routes/media.js';
import { adminRouter } from './routes/admin.js';

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '1mb' }));

// ===== فحص الصحة الحي — يقيس زمن استجابة قاعدة البيانات الحقيقية =====
app.get('/api/health', async (_req, res) => {
  const t0 = Date.now();
  try {
    const r = await pool.query('SELECT NOW() AS now');
    res.json({
      ok: true,
      uptimeSec: Math.round(process.uptime()),
      db: { connected: true, serverTime: r.rows[0].now, latencyMs: Date.now() - t0 },
      realtime: { transport: 'websocket', channelPrefix: '/realtime/' },
    });
  } catch (e: any) {
    res.status(503).json({ ok: false, db: { connected: false, error: String(e?.message || e).slice(0, 200) } });
  }
});

// ===== تركيب الوحدات حسب التخصص =====
app.use('/api/auth', authRouter);                 // register/login (+ enroll/enrollments بالمسار القديم للتوافق)
app.use('/api/live', authRouter);                 // :roomId/ticket + guest-ticket (بوابة البطاقات)
app.use('/api/live', catalogRouter);              // :roomId/attendance (تسجيل الحضور الفعلي)
app.use('/api', authRouter);                      // /enroll + /enrollments/:userId
app.use('/api', catalogRouter);                   // courses/library/live-sessions/schedule/progress/audit/playback/stream-check
app.use('/api/admin', adminRouter);              // bookings + users RBAC (حقيقيان بقاعدة البيانات)
app.use('/api', learningRouter);                  // assignments/submissions/certificates(+verify)
app.use('/api/payments', paymentsRouter);         // checkout/capture/signature/refund/list
app.use('/api/ai', aiRouter);                     // tutor/messages
app.use('/api/media', mediaRouter);               // upload حقيقي إلى القرص + مكتبة/شورتس CRUD

// بث ملفات الوسائط المرفوعة فعلياً مع دعم Range (قبل SPA fallback)
const MEDIA_DIR = process.env.MEDIA_DIR || path.join(process.cwd(), 'uploads');
app.get('/media/:file', (req, res) => {
  const file = path.basename(String(req.params.file)); // منع path traversal
  if (!/^[\w.-]+$/.test(file)) return res.status(400).end('Bad name');
  const ext = path.extname(file).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.pdf': 'application/pdf',
    '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  };
  serveMediaFile(res, path.join(MEDIA_DIR, file), mimeMap[ext] || 'application/octet-stream');
});

// تهيئة المخطط الحي عند الإقلاع (جداول فارغة — كل سجل يُكتب بفعل حقيقي فقط)
ensureLiveSchema().catch((e) => console.warn('Schema init warning:', e));

// بوابة Realtime: بطاقات HMAC + إشارات WebRTC + دردشة + حضور حي في القاعدة
attachRealtime(server);

// ===== واجهة المستخدم: Vite dev middleware أو ملفات dist في الإنتاج =====
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true as any },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(import.meta.dirname, '../dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ORBIT Learn Server (modular: HTTP + Realtime WS) running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
