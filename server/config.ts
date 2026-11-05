/**
 * server/config.ts — الإعدادات المركزية الوحيدة للخادم (لا أرقام سحرية مبعثرة)
 */
import 'dotenv/config';

export const PORT = Number(process.env.APP_PORT || 3000);

/** سرّ التطبيق: يوقّع بطاقات الدخول وقيود الدفع وتوكنات التشغيل. يجب ضبطه في الإنتاج. */
export const APP_SECRET = process.env.APP_SECRET || 'orbit-academy-secret-2026';

/** اتصال Supabase PostgreSQL الحي (تجميع Connections) */
export const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.iucpnsrfwkfsimktbmgv:zrRHVgoNuC9eulVL@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

/** مفتاح Gemini للمرشد التعليمي الحقيقي (اختياري — بدونه تُستخدم قاعدة المعرفة المحلية الحية) */
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/** أساس روابط وسائط التشغيل (Video-on-Progress) */
export const MEDIA_BASE_URL =
  process.env.MEDIA_BASE_URL || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';

/** صلاحية بطاقة دخول الغرفة بالدقائق */
export const TICKET_TTL_MINUTES = 60;

export const isProd = process.env.NODE_ENV === 'production';
