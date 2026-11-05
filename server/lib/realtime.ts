/**
 * server/lib/realtime.ts — ORBIT Realtime Hub: بوابة بطاقات HMAC + إشارات WebRTC + دردشة حية
 * كل غرفة على قناة /realtime/<roomId>. لا اتصال يُقبل إلا ببطاقة صالحة موقّعة،
 * ويُتحقق من الاشتراك حيّاً من قاعدة البيانات لحظة الصعود وليس لحظة الإصدار فقط.
 */
import http from 'http';
import crypto from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { pool } from './db.js';
import { hmacSign } from './security.js';
import { TICKET_TTL_MINUTES } from '../config.js';
import { buildIceServers } from './turn.js';

export type RTUserLike = { id: string; name: string; role: string };
type EntryTicket = { rid: string; uid: string; name: string; role: string; exp: number; sv?: number; sig: string };
type RTClient = WebSocket & { roomId?: string; ticketUserId?: string; user?: RTUserLike };

const TICKET_TTL_MS = TICKET_TTL_MINUTES * 60 * 1000;

// ===== بطاقات الدخول الموقّعة (تُصدرها مسارات auth وتستهلكها بوابة WS) =====
export function issueTicket(t: Omit<EntryTicket, 'sig'>): string {
  const sig = hmacSign(JSON.stringify(t));
  return Buffer.from(JSON.stringify({ ...t, sig })).toString('base64url');
}

export function verifyTicket(token: string): EntryTicket | null {
  let t: EntryTicket;
  try { t = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')); } catch { return null; }
  if (!t || !t.rid || !t.uid || !t.exp) return null;
  if (Date.now() > t.exp) return null;
  const { sig, ...rest } = t;
  if (hmacSign(JSON.stringify(rest)) !== sig) return null;
  return t;
}

export const ticketTtlMs = TICKET_TTL_MS;

// ===== فحص صلاحية الانضمام من قاعدة البيانات =====
async function isAuthorizedForRoom(roomId: string, userId: string, role: string, sessionVersion?: number): Promise<boolean> {
  try {
    // إبطال الجلسة الفعلي (Revoke): بطاقة تحمل نسخة جلسة أقدم من الحالية في القاعدة تُرفض ميكانيكياً
    if (!String(userId).startsWith('guest-')) {
      const sv = await pool.query('SELECT COALESCE(session_version, 0) AS sv FROM orbit_users WHERE id = $1', [userId]);
      if (sv.rows.length > 0 && typeof sessionVersion === 'number' && sessionVersion < Number(sv.rows[0].sv)) return false;
    }
    const sess = await pool.query('SELECT id, course_id, instructor_id FROM orbit_live_sessions WHERE id = $1 OR meeting_code = $1', [roomId]);
    if (sess.rows.length === 0) return false;
    const s = sess.rows[0];
    if (role === 'admin') return true;
    if (role === 'guest' || String(userId).startsWith('guest-')) {
      const open = await pool.query('SELECT COALESCE(open_room, false) AS open_room FROM orbit_live_sessions WHERE id = $1 OR meeting_code = $1', [roomId]);
      return !!open.rows[0]?.open_room;
    }
    if (role === 'instructor') {
      if (s.instructor_id === userId) return true;
      const owner = await pool.query("SELECT 1 FROM orbit_users WHERE id = $1 AND role IN ('instructor','admin')", [userId]);
      return owner.rows.length > 0;
    }
    const enr = await pool.query(
      "SELECT 1 FROM orbit_enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'active' LIMIT 1",
      [userId, s.course_id]
    );
    return enr.rows.length > 0;
  } catch {
    return false; // فشل قاعدة البيانات = رفض الدخول (لا أبواب خلفية)
  }
}

/** تطبيع الغرفة: meeting_code أو معرف الجلسة -> المعرف الفعلي */
export async function resolveSessionId(roomRef: string): Promise<{ id: string; title: string; courseTitle: string; openRoom: boolean } | null> {
  const r = await pool.query('SELECT id, title, course_title, COALESCE(open_room, false) AS open_room FROM orbit_live_sessions WHERE id = $1 OR meeting_code = $1', [roomRef]);
  if (r.rows.length === 0) return null;
  const s = r.rows[0];
  return { id: s.id, title: s.title, courseTitle: s.course_title, openRoom: !!s.open_room };
}

export function attachRealtime(server: http.Server) {
  const wss = new WebSocketServer({ noServer: true });
  const roomHistory = new Map<string, any[]>();
  const roomClients = new Map<string, Set<RTClient>>();

  const clientsInRoom = (roomId: string) => Array.from(roomClients.get(roomId) || []);
  const broadcast = (roomId: string, payload: any, except?: RTClient) => {
    const data = JSON.stringify(payload);
    clientsInRoom(roomId).forEach((c) => {
      if (c.readyState === WebSocket.OPEN && c !== except) c.send(data);
    });
  };

  const updateLiveCount = (roomId: string) => {
    pool.query(
      `UPDATE orbit_live_sessions SET attendees_count =
         (SELECT COUNT(DISTINCT user_id) FROM orbit_session_attendance WHERE session_id = $1 AND left_at IS NULL)
       WHERE id = $1 OR meeting_code = $1`, [roomId]
    ).catch(() => {});
  };

  server.on('upgrade', async (req, socket, head) => {
    const url = new URL(req.url || '', 'http://localhost');
    // إعادة توجيه WebSocket عبر Cloudflare Tunnel قد تحمل مسار النفق قبل المسار الحقيقي
    let pathname = url.pathname;
    const fwdMatch = pathname.match(/^\/[A-Za-z0-9-]+(\/realtime\/[\w.-]+)/);
    if (fwdMatch && !pathname.startsWith('/realtime/')) pathname = fwdMatch[1];
    const match = pathname.match(/^\/realtime\/([\w.-]+)/);
    if (!match) { socket.destroy(); return; }
    const requestedRoom = match[1];
    const token = url.searchParams.get('token') || '';

    const reject = (code: number, label: string) => {
      try { socket.write(`HTTP/1.1 ${code} ${label}\r\n\r\n`); } catch { /* ignore */ }
      socket.destroy();
    };

    const ticket = verifyTicket(token);
    if (!ticket) return reject(440, 'Unauthorized Realtime Handshake');

    const roomId = ticket.rid;
    if (requestedRoom !== roomId) {
      try {
        const norm = await pool.query('SELECT id FROM orbit_live_sessions WHERE id = $1 OR meeting_code = $1', [requestedRoom]);
        if (norm.rows.length === 0 || norm.rows[0].id !== roomId) return reject(440, 'Unauthorized Realtime Handshake');
      } catch {
        return reject(503, 'DB Unavailable');
      }
    }

    wss.handleUpgrade(req, socket as any, head, async (ws) => {
      const client = ws as RTClient;
      client.roomId = roomId;
      client.ticketUserId = ticket.uid;
      client.user = { id: ticket.uid, name: ticket.name, role: ticket.role };
      const ok = await isAuthorizedForRoom(roomId, ticket.uid, ticket.role, ticket.sv);
      if (!ok) {
        try { client.send(JSON.stringify({ type: 'gate-error', code: 'NOT_ENROLLED', message: `بوابة الرفض: لا تملك اشتراكاً فعالاً في تخصص هذه الحصة (${roomId}).` })); } catch { /* ignore */ }
        setTimeout(() => { try { client.close(4401, 'NOT_ENROLLED'); } catch { /* ignore */ } }, 50);
        return;
      }
      wss.emit('connection', client, req);
    });
  });

  wss.on('connection', (client: RTClient) => {
    const roomId = client.roomId!;
    if (!roomClients.has(roomId)) roomClients.set(roomId, new Set());
    roomClients.get(roomId)!.add(client);

    const send = (p: any) => { if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(p)); };

    // تسجيل حضور حقيقي في قاعدة البيانات + تحديث عداد الحضور الحي
    if (client.user) {
      pool.query(
        `INSERT INTO orbit_session_attendance (id, session_id, user_id, user_name, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (session_id, user_id) DO UPDATE SET left_at = NULL, joined_at = now(), user_name = EXCLUDED.user_name`,
        ['att-' + crypto.randomUUID(), roomId, client.user.id, client.user.name, client.user.role]
      ).then(() => updateLiveCount(roomId)).catch(() => {});
    }

    // توزيع ICE حقيقي من الخادم: STUN عام + TURN وسيط موقّع HMAC لكل ضيف —
    // بدون TURN لا يمكن مشاركة الشاشة بين أجهزة بعيدة خلف NAT صارم (موبايل/شبكات مغلقة)
    let icePayload: { servers: any[]; hasTurn: boolean } | null = null;
    try { icePayload = buildIceServers(client.user?.id || 'anon'); } catch { icePayload = null; }
    send({ type: 'welcome', roomId, self: client.user, history: roomHistory.get(roomId) || [], ice: icePayload || undefined });

    const buildRoster = (exclude?: RTClient): RTUserLike[] => {
      const seen = new Map<string, RTUserLike>();
      clientsInRoom(roomId).forEach((c) => {
        if (c === exclude || !c.user) return;
        seen.set(c.user.id, { id: c.user.id, name: c.user.name, role: c.user.role });
      });
      return Array.from(seen.values());
    };
    broadcast(roomId, { type: 'roster', participants: buildRoster() });

    client.on('message', (raw) => {
      let msg: any;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      if (!msg || typeof msg.type !== 'string' || !client.user) return;

      switch (msg.type) {
        case 'chat': {
          const entry = {
            type: 'chat',
            id: 'm-' + crypto.randomUUID(),
            senderId: client.user.id,
            senderName: client.user.name,
            senderRole: client.user.role,
            text: String(msg.text || '').slice(0, 2000),
            at: Date.now(),
          };
          const hist = roomHistory.get(roomId) || [];
          hist.push(entry);
          if (hist.length > 200) hist.shift();
          roomHistory.set(roomId, hist);
          broadcast(roomId, entry);
          break;
        }
        case 'signal': {
          // غلاف إشارة WebRTC: { to, data:{ offer|answer|candidate } } — يوجّه لكل اتصالات المستخدم
          const targets = clientsInRoom(roomId).filter((c) => c.user?.id === msg.to && c !== client);
          for (const target of targets) {
            if (target.readyState === WebSocket.OPEN) {
              target.send(JSON.stringify({ type: 'signal', from: client.user.id, conn: msg.conn || null, data: msg.data }));
            }
          }
          break;
        }
        case 'hand':
          broadcast(roomId, { type: 'hand', userId: client.user.id, name: client.user.name, raised: !!msg.raised }, client);
          break;
        case 'media-state':
          broadcast(roomId, { type: 'media-state', userId: client.user.id, mic: !!msg.mic, cam: !!msg.cam, screen: !!msg.screen }, client);
          break;
        case 'broadcast-track':
          broadcast(roomId, { type: 'broadcast-track', userId: client.user.id, kind: msg.kind, active: !!msg.active }, client);
          break;
        default:
          break;
      }
    });

    client.on('close', () => {
      roomClients.get(roomId)?.delete(client);
      const stillHere = clientsInRoom(roomId).some((c) => c.ticketUserId === client.ticketUserId);
      if (!stillHere && client.user) {
        pool.query('UPDATE orbit_session_attendance SET left_at = now() WHERE session_id = $1 AND user_id = $2 AND left_at IS NULL', [roomId, client.user.id])
          .then(() => updateLiveCount(roomId))
          .catch(() => {});
      }
      broadcast(roomId, { type: 'roster', participants: buildRoster(client) });
    });
  });

  return { wss };
}
