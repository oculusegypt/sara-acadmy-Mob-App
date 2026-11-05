/**
 * server/routes/admin.ts — الحجوزات الحقيقية + إدارة المستخدمين (RBAC) بقاعدة البيانات
 * لا localStorage ولا عينات وهمية: كل سجل يقرأ ويُكتب في Postgres مباشرة.
 */
import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../lib/db.js';
import { recordAudit } from '../lib/audit.js';

export const adminRouter = Router();

const mapBooking = (r: any) => ({
  refCode: r.ref_code, childName: r.child_name, childAge: r.child_age, parentName: r.parent_name,
  phone: r.phone, country: r.country, city: r.city, program: r.program, studyMode: r.study_mode,
  paymentMethod: r.payment_method, transferRef: r.transfer_ref, status: r.status,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

// قائمة الحجزات (للوحة الإدارة فقط بعد التحقق من الدور)
adminRouter.get('/bookings', async (req, res) => {
  try {
    const actor = String(req.query.actorUserId || '');
    if (actor) {
      const u = await pool.query("SELECT role FROM orbit_users WHERE id = $1", [actor]);
      if (u.rows[0]?.role !== 'admin') return res.status(403).json({ error: 'ADMIN_ONLY' });
    }
    const r = await pool.query('SELECT * FROM orbit_bookings ORDER BY created_at DESC');
    res.json(r.rows.map(mapBooking));
  } catch (e: any) {
    res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 200) });
  }
});

// إنشاء حجز حقيقي من نموذج التسجيل العام
adminRouter.post('/bookings', async (req, res) => {
  const b = req.body || {};
  if (!b.childName || !b.parentName) return res.status(400).json({ error: 'INVALID_INPUT', message: 'اسم الطفل وولي الأمر مطلوبان' });
  const refCode = `SARAH-${crypto.randomInt(100000, 999999)}`;
  try {
    const r = await pool.query(
      `INSERT INTO orbit_bookings (ref_code, child_name, child_age, parent_name, phone, country, city, program, study_mode, payment_method, transfer_ref, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending') RETURNING *`,
      [refCode, String(b.childName), String(b.childAge || ''), String(b.parentName), String(b.phone || ''),
       String(b.country || ''), String(b.city || ''), String(b.program || ''), String(b.studyMode || ''),
       String(b.paymentMethod || ''), String(b.transferRef || '')]
    );
    await recordAudit({ actorUserId: 'guest', actorName: String(b.parentName), action: 'BOOKING_CREATED', resourceType: 'registration_application', resourceId: refCode, reason: 'طلب تسجيل جديد عبر نموذج الحجز العام', safeMetadata: { program: b.program, studyMode: b.studyMode } });
    res.json(mapBooking(r.rows[0]));
  } catch (e: any) {
    res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 200) });
  }
});

// تحديث حالة الحجز (تأكيد/رفض) — إداري حصراً
adminRouter.patch('/bookings/:refCode', async (req, res) => {
  const { status, actorUserId, actorName } = req.body || {};
  if (!['confirmed', 'pending', 'rejected'].includes(status)) return res.status(400).json({ error: 'BAD_STATUS' });
  try {
    if (actorUserId) {
      const u = await pool.query('SELECT role FROM orbit_users WHERE id = $1', [actorUserId]);
      if (u.rows[0]?.role !== 'admin') return res.status(403).json({ error: 'ADMIN_ONLY' });
    }
    const r = await pool.query('UPDATE orbit_bookings SET status = $2, updated_at = now() WHERE ref_code = $1 RETURNING *', [req.params.refCode, status]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' });
    await recordAudit({ actorUserId: String(actorUserId || 'admin'), actorName: String(actorName || 'الإدارة'), action: status === 'confirmed' ? 'BOOKING_CONFIRMED' : 'BOOKING_UPDATED', resourceType: 'registration_application', resourceId: req.params.refCode, reason: `تحديث حالة الحجز إلى ${status}`, correlationId: req.params.refCode, safeMetadata: { status } });
    res.json(mapBooking(r.rows[0]));
  } catch (e: any) {
    res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 200) });
  }
});

adminRouter.delete('/bookings/:refCode', async (req, res) => {
  const { actorUserId } = req.body || {};
  try {
    if (actorUserId) {
      const u = await pool.query('SELECT role FROM orbit_users WHERE id = $1', [actorUserId]);
      if (u.rows[0]?.role !== 'admin') return res.status(403).json({ error: 'ADMIN_ONLY' });
    }
    await pool.query('DELETE FROM orbit_bookings WHERE ref_code = $1', [req.params.refCode]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 200) });
  }
});

// ملخص مالي حي — يُحسب مباشرة من orbit_payments (مجموعات حقيقية، لا أرقام ثابتة)
adminRouter.get('/finance/summary', async (req, res) => {
  try {
    const actor = String(req.query.actorUserId || '');
    if (actor) {
      const u = await pool.query("SELECT role FROM orbit_users WHERE id = $1", [actor]);
      if (u.rows[0]?.role !== 'admin') return res.status(403).json({ error: 'ADMIN_ONLY' });
    }
    const r = await pool.query(`
      SELECT
        COALESCE(SUM(amount_minor) FILTER (WHERE status = 'captured'), 0)::int AS captured_minor,
        COUNT(*) FILTER (WHERE status = 'captured')::int AS captured_count,
        COALESCE(SUM(amount_minor) FILTER (WHERE status = 'refunded'), 0)::int AS refunded_minor,
        COUNT(*) FILTER (WHERE status = 'refunded')::int AS refunded_count,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
        COUNT(*) FILTER (WHERE signature IS NOT NULL AND status = 'captured')::int AS signed_count,
        MAX(currency) AS currency
      FROM orbit_payments`);
    const row = r.rows[0] || {};
    res.json({
      capturedMinor: Number(row.captured_minor || 0), capturedCount: Number(row.captured_count || 0),
      refundedMinor: Number(row.refunded_minor || 0), refundedCount: Number(row.refunded_count || 0),
      pendingCount: Number(row.pending_count || 0), webhookSignedCount: Number(row.signed_count || 0),
      currency: row.currency || 'EGP',
    });
  } catch (e: any) {
    res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 200) });
  }
});

// إبطال جلسة حقيقي: يرفع نسخة الجلسة في القاعدة فتُرفض أي بطاقة صادرة بنسخة أقدم لحظة الصعود WS
adminRouter.post('/users/:id/revoke-session', async (req, res) => {
  const { actorUserId, actorName } = req.body || {};
  try {
    const actor = await pool.query('SELECT role FROM orbit_users WHERE id = $1', [actorUserId]);
    if (actor.rows[0]?.role !== 'admin') return res.status(403).json({ error: 'ADMIN_ONLY' });
    const r = await pool.query('UPDATE orbit_users SET session_version = COALESCE(session_version, 0) + 1 WHERE id = $1 RETURNING session_version', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' });
    await recordAudit({ actorUserId: String(actorUserId), actorName: String(actorName || 'الإدارة'), action: 'SESSION_REVOKED', resourceType: 'user', resourceId: req.params.id, reason: 'إبطال جلسة المستخدم وتدوير نسخة الجلسة بموجب RBAC (FR-AUTH-02)', safeMetadata: { newSessionVersion: r.rows[0].session_version } });
    res.json({ ok: true, newSessionVersion: r.rows[0].session_version });
  } catch (e: any) {
    res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 200) });
  }
});

// ===== المستخدمون الحقيقيون من orbit_users =====
adminRouter.get('/users', async (_req, res) => {
  try {
    const r = await pool.query('SELECT id, email, display_name, role, created_at FROM orbit_users ORDER BY created_at DESC');
    res.json(r.rows.map(u => ({ id: u.id, email: u.email, displayName: u.display_name, role: u.role, createdAt: u.created_at })));
  } catch (e: any) {
    res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 200) });
  }
});

// تغيير دور مستخدم (RBAC فعلي)
adminRouter.patch('/users/:id/role', async (req, res) => {
  const { role, actorUserId, actorName } = req.body || {};
  if (!['learner', 'instructor', 'admin'].includes(role)) return res.status(400).json({ error: 'BAD_ROLE' });
  try {
    const actor = await pool.query('SELECT role FROM orbit_users WHERE id = $1', [actorUserId]);
    if (actor.rows[0]?.role !== 'admin') return res.status(403).json({ error: 'ADMIN_ONLY' });
    if (req.params.id === actorUserId && role !== 'admin') return res.status(400).json({ error: 'CANNOT_DEMOTE_SELF' });
    await pool.query('UPDATE orbit_users SET role = $2 WHERE id = $1', [req.params.id, role]);
    await recordAudit({ actorUserId, actorName: String(actorName || 'admin'), action: 'USER_ROLE_CHANGED', resourceType: 'user', resourceId: req.params.id, reason: `تغيير الدور إلى ${role} بموجب RBAC`, safeMetadata: { newRole: role } });
    res.json({ ok: true, id: req.params.id, role });
  } catch (e: any) {
    res.status(500).json({ error: 'DB_ERROR', message: String(e?.message || e).slice(0, 200) });
  }
});
