/**
 * server/lib/db.ts — تجمينغ Supabase PostgreSQL الحي (مصدر واحد للاتصال)
 */
import { Pool } from 'pg';
import { DATABASE_URL } from '../config.js';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('⚠️ Supabase connection warning:', err.message);
  } else {
    console.log('✅ Connected live to Supabase PostgreSQL at:', res.rows[0].now);
  }
});

/**
 * تهيئة مخطط الجداول الحية عند الإقلاع — بدون أي seed وهمي للبيانات:
 * الجداول تُنشأ فارغة، وكل سجل فيها يُكتب فقط عبر أفعال حقيقية (اشتراك/حضور/تسليم).
 */
export async function ensureLiveSchema() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_enrollments (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, course_id TEXT NOT NULL,
      status TEXT DEFAULT 'active', source TEXT DEFAULT 'free',
      enrolled_at TIMESTAMPTZ DEFAULT now(), UNIQUE(user_id, course_id))`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_session_attendance (
      id TEXT PRIMARY KEY, session_id TEXT NOT NULL, user_id TEXT NOT NULL,
      user_name TEXT NOT NULL, role TEXT NOT NULL,
      joined_at TIMESTAMPTZ DEFAULT now(), left_at TIMESTAMPTZ,
      UNIQUE (session_id, user_id))`);
    // ALTER يضمن وجود العمود حتى للجدول المُهيَّأ سابقاً (CREATE IF NOT EXISTS لا يعدل الأقدم)
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'learner', password_hash TEXT, created_at TIMESTAMPTZ DEFAULT now())`);
    await pool.query(`ALTER TABLE orbit_users ADD COLUMN IF NOT EXISTS password_hash TEXT`).catch(() => {});
    await pool.query(`ALTER TABLE orbit_users ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0`).catch(() => {});
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_payments (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, user_name TEXT,
      course_id TEXT NOT NULL, course_title TEXT,
      amount_minor INT NOT NULL, currency TEXT DEFAULT 'EGP',
      idempotency_key TEXT UNIQUE NOT NULL,
      signature TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT now(), captured_at TIMESTAMPTZ)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_lesson_progress (
      user_id TEXT NOT NULL, lesson_id TEXT NOT NULL,
      progress_seconds INT DEFAULT 0, completed BOOLEAN DEFAULT false,
      completed_at TIMESTAMPTZ, last_seen_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (user_id, lesson_id))`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_library_books (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT, category TEXT, pages_count INT DEFAULT 0,
      cover_url TEXT, description TEXT, download_url TEXT, published_year INT, instructor_id TEXT,
      created_at TIMESTAMPTZ DEFAULT now())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_shorts (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, video_url TEXT, category TEXT, duration TEXT,
      thumbnail TEXT, views INT DEFAULT 0, likes INT DEFAULT 0, instructor_id TEXT,
      created_at TIMESTAMPTZ DEFAULT now())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_media_objects (
      id TEXT PRIMARY KEY, file_name TEXT NOT NULL, mime TEXT NOT NULL, bytes BIGINT NOT NULL,
      sha256 TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'file',
      uploaded_by TEXT, uploaded_by_name TEXT, course_id TEXT, lesson_id TEXT,
      public_read BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_audit_events (
      id TEXT PRIMARY KEY, actor_user_id TEXT, actor_name TEXT NOT NULL,
      action TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id TEXT,
      reason TEXT, correlation_id TEXT, safe_metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orbit_bookings (
      ref_code TEXT PRIMARY KEY, child_name TEXT NOT NULL, child_age TEXT, parent_name TEXT,
      phone TEXT, country TEXT, city TEXT, program TEXT, study_mode TEXT,
      payment_method TEXT, transfer_ref TEXT, status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ)`);
    // عمود الغرف العامة (يُسمح بالانضمام الحر لها فقط) — يُنشأ عند الإقلاع بأمان
    await pool.query(`ALTER TABLE orbit_live_sessions ADD COLUMN IF NOT EXISTS open_room BOOLEAN DEFAULT false`).catch(() => {});
    // تصفير عدادات الحضور — العداد الآن حي من جدول الحضور فقط
    await pool.query(`UPDATE orbit_live_sessions SET attendees_count =
      (SELECT COUNT(DISTINCT user_id) FROM orbit_session_attendance sa WHERE sa.session_id = orbit_live_sessions.id AND sa.left_at IS NULL)`).catch(() => {});
    console.log('✅ Live schema ready (users / enrollments / attendance / payments / progress / audit)');
  } catch (e) {
    console.warn('Schema init warning:', e);
  }
}
