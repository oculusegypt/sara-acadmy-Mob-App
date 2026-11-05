/**
 * server/lib/turn.ts — موزّع TURN حقيقي (HMAC-Turn REST API) بدون أي محاكاة.
 *
 * لماذا: مشاركة الشاشة بين أجهزة بعيدة خلف NAT صارم (شبكات موبايل 4G/5G، راوترات منزلية)
 * لا يمكن أن تنجح بـ STUN وحده — تحتاج وسيط TURN فعلي يمر عبره تدفق الوسائط على المنفذ 443.
 *
 * كيف يعمل مع OpenRelay (مزوّد TURN عام بمعايير ARC/STUN/TURN REST API):
 *   1) لكل طلب ICE نولّد إ凭اءً مؤقتاً: username = "<unix_expiry>:orbit-<rand>"
 *   2) credential = base64(HMAC-SHA1(APP_SECRET, username))  ← نفس خوارزمية RFC 7885
 *   3) الصلاحية تُحسب ميكانيكياً من التوقيع — لا حساب مسجل ولا مفتاح API مطلوب.
 *   كل ضيف يحصل على إ凭اء فريد ينتهي بعد دقائق (سياسة خصوصية: لا إ凭اءات دائمة).
 *
 * إن لم يكن TURN_HOST مضبوطاً في البيئة تُستخدم خوادم STUN العامة فقط مع كشف صادق
 * للحالة (لا رسائل «متصل» وهمية — المتصفح نفسه يتحقق من type=relay قبل تأكيد الوسيط).
 */
import crypto from 'crypto';
import { APP_SECRET } from '../config.js';

// ملاحظة مُتحقَّق منها حيّاً (2026-11): النطاق القديم openrelay-metro-cluster-g4... غير قابل للحل DNS،
// وopenrelay-turn.gencdn.com على 443 يخدم HTTPS CDN فقط (يرد 302) وليس TURN.
// لذلك الافتراضي الآن: عدم إرسال TURN حتى يُضبط TURN_HOST لخدمة حقيقية موثوقة —
// تُوزَّع STUN فقط مع كشف صادق للحالة في الواجهة (لا رسائل وسيط وهمية).
const TURN_HOST = process.env.TURN_HOST || '';
const TURN_PORT = Number(process.env.TURN_PORT || 443); // 443 يعبر معظم الجدران النارية
const TURN_TTL_SECONDS = Number(process.env.TURN_TTL || 600);

export type IceServerEntry = { urls: string[]; username?: string; credential?: string };

export function generateTurnCredentials(userId = 'anon'): { username: string; credential: string } | null {
  try {
    // لا يوجد خادم TURN خاص مضبوط → لا نرسل أي إ凭اءات (وليس إ凭اءات وهمية لخدمة ميتة).
    // الواجهة تعرض بصدق: «وسيط TURN غير متاح — الاتصال مباشر P2P».
    if (!TURN_HOST) return null;
    const expiry = Math.floor(Date.now() / 1000) + TURN_TTL_SECONDS;
    const rand = crypto.randomBytes(8).toString('hex');
    const username = `${expiry}:orbit-${String(userId).slice(0, 24)}-${rand}`;
    const credential = crypto.createHmac('sha1', APP_SECRET).update(username).digest('base64');
    return { username, credential };
  } catch {
    return null;
  }
}

/** قائمة ICE كاملة تُعطى للعميل لحظة الانضمام: STUN عام احتياطي + TURN وسيط موقّع */
export function buildIceServers(userId: string): { servers: IceServerEntry[]; hasTurn: boolean } {
  const servers: IceServerEntry[] = [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:global.stun.twilio.com:3478',
        'stun:stun.cloudflare.com:3478',
      ],
    },
  ];
  const turn = generateTurnCredentials(userId);
  if (turn) {
    const url = `turn:${TURN_HOST}:${TURN_PORT}?transport=udp`;
    const urlTls = `turns:${TURN_HOST}:${TURN_PORT}`;
    servers.push({ urls: [url, urlTls], username: turn.username, credential: turn.credential });
  }
  return { servers, hasTurn: !!turn };
}

/** فحص صحي مباشر لخادم TURN (بروتوكول STUN Binding فوق UDP) — لا ادعاء بلا إثبات */
export async function probeTurnReachability(timeoutMs = 2500): Promise<{ reachable: boolean; latencyMs?: number; error?: string }> {
  const dgram = await import('dgram');
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: { reachable: boolean; latencyMs?: number; error?: string }) => { if (!settled) { settled = true; resolve(v); } };
    const t0 = Date.now();
    let sock: ReturnType<typeof dgram.createSocket> | null = null;
    try {
      sock = dgram.createSocket('udp4');
      // رأس STUN Binding Request: magic cookie + transaction id عشوائي
      const txn = crypto.randomBytes(12);
      const req = Buffer.concat([Buffer.from([0x00, 0x01, 0x00, 0x00]), Buffer.from([0x21, 0xa4, 0x2c, 0x42]), txn]);
      sock.once('message', () => done({ reachable: true, latencyMs: Date.now() - t0 }));
      sock.once('error', (e: Error) => done({ reachable: false, error: e.message }));
      setTimeout(() => done({ reachable: false, error: 'timeout' }), timeoutMs);
      sock.send(req, 0, req.length, TURN_PORT, TURN_HOST, (err) => { if (err) done({ reachable: false, error: err.message }); });
    } catch (e) {
      done({ reachable: false, error: String(e) });
    }
  });
}
