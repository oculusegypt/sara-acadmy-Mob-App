import { useEffect, useRef, useState } from 'react';

/**
 * ORBIT Realtime Hub Client — حقيقي بالكامل (بدون أي محاكاة)
 * - الدردشة والحضور: نشر/اشتراك فعلي عبر WebSocket على خادم Node في نفس الأصل.
 * - مشاركة الشاشة والكاميرا: WebRTC P2P حقيقي (offer/answer/ICE) عبر قناة الإشارة نفسها.
 * - البوابة: لا يُفتح اتصال WebSocket إلا ببطاقة دخول موقّعة أصدرها الخادم
 *   بعد التحقق الفعلي من الاشتراك في تخصص الجلسة (orbit_enrollments).
 */

export type RTUser = { id: string; name: string; role: string };
export type RTChatMsg = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  at: number;
};
export type RosterMsg = { type: 'roster'; participants: RTUser[] };
export type HandMsg = { type: 'hand'; userId: string; name: string; raised: boolean };
export type MediaStateMsg = { type: 'media-state'; userId: string; mic: boolean; cam: boolean; screen: boolean };
export type BroadcastTrackMsg = { type: 'broadcast-track'; userId: string; kind: 'screen' | 'cam'; active: boolean };
export type SignalMsg = { type: 'signal'; from: string; conn?: string | null; data: any };
export type GateErrorMsg = { type: 'gate-error'; code: string; message: string };

type ServerMsg =
  | ({ type: 'welcome'; roomId: string; self: RTUser; history: RTChatMsg[] })
  | GateErrorMsg
  | RosterMsg | HandMsg | MediaStateMsg | BroadcastTrackMsg | SignalMsg | (RTChatMsg & { type: 'chat' });

/**
 * خوادم ICE متعددة وموزّعة — تقليل اعتماد على مصدر واحد (STUN الوحيد كان يفشل
 * لدى كثير من الشبكات فيمتنع الاتصال P2P وتبقى الشاشة بلا صورة رغم نجاح الإشارة).
 */
export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
  ],
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

/**
 * كشف ترميز H.264 المدعوم فعلياً في المتصفح وفرضه على مفاوضة SDP.
 * افتراضياً قد يفضّل Chrome VP8 الذي لا يدعمه Safari → ينشأ اتصال «ناجح»
 * بلا أي بكسل مستقبَل. هذه الدالة تجعل التوافق بين المتصفحات حقيقياً.
 */
function preferH264(sdp: string): string {
  try {
    if (!/m=video/.test(sdp) || !/vp8|VP8/.test(sdp)) return sdp;
    // لا يوجد سوى مقطع فيديو واحد في جلساتنا — استبدال أول m=video آمن
    const idx = sdp.indexOf('m=video');
    const after = sdp.slice(idx);
    const lines = after.split('\r\n');
    const mediaLine = lines[0]; // m=video <port> <proto> <fmt...>
    const attrs = lines.slice(1);
    const ptMatches = Array.from(mediaLine.matchAll(/\s(\d+)/g)).map((m) => m[1]).filter((p) => p !== mediaLine.split(' ')[1]);
    let h264Pt: string | null = null;
    for (const pt of ptMatches) {
      const rtp = attrs.find((l) => l.startsWith(`a=rtpmap:${pt} `));
      if (rtp && /H264\/90000/i.test(rtp)) { h264Pt = pt; break; }
    }
    if (!h264Pt) return sdp;
    const restPts = ptMatches.filter((p) => p !== h264Pt);
    const newMedia = `m=video ${mediaLine.split(' ').slice(1, 3).join(' ')} ${h264Pt}${restPts.length ? ' ' + restPts.join(' ') : ''}`;
    return sdp.slice(0, idx) + [newMedia, ...attrs].join('\r\n');
  } catch {
    return sdp;
  }
}

function writeLocalDesc(pc: RTCPeerConnection, desc: RTCSessionDescriptionInit): Promise<void> {
  if (desc.type === 'answer') {
    return pc.setLocalDescription(new RTCSessionDescription({ type: desc.type, sdp: preferH264(desc.sdp || '') }));
  }
  return pc.setLocalDescription(desc);
}

/** طلب بطاقة دخول الغرفة من الخادم — يفحص الاشتراك الحقيقي في قاعدة البيانات */
export async function requestRoomTicket(roomId: string, user: RTUser): Promise<{ token: string }> {
  const res = await fetch(`/api/live/${encodeURIComponent(roomId)}/ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id, name: user.name, role: user.role }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: Error & { code?: string; status?: number } = new Error(data?.message || 'تعذر الحصول على بطاقة دخول الغرفة');
    err.code = data?.error;
    err.status = res.status;
    throw err;
  }
  return data as { token: string };
}

/**
 * بطاقة دخول عامة للزوار — تُقبل من الخادم فقط للغرف التي تسمح بالانضمام الحر
 * (غرف تجريبي/عام في جدول orbit_live_sessions). الغرف الخاصة بتخصص تتطلب
 * حساباً مشتركاً عبر requestRoomTicket. بدون أي محاكاة أو أبواب خلفية.
 */
export async function fetchGuestTicket(roomId: string, name: string): Promise<{ token: string }> {
  const res = await fetch(`/api/live/${encodeURIComponent(roomId)}/guest-ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: (name || '').trim().slice(0, 40) || 'زائر' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: Error & { code?: string; status?: number } = new Error(data?.message || 'هذه الغرفة مغلقة — الدخول متاح للمشتركين فقط');
    err.code = data?.error;
    err.status = res.status;
    throw err;
  }
  return data as { token: string };
}

/** معرف مستقر لكل تبويب — يبقى نفسه عند إعادة الاتصال حتى لا يتضاعف الحضور */
function stableTabId(): string {
  const KEY = 'orbit_device_uid';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = 'u-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

type PeerKind = 'screen' | 'cam';

/** تراجع تدريجي لإعادة المحاولة — يمنع إغراق الخادم عند انقطاع الشبكة */
let retryDelayMs = 1000;
function setRetryDelay(v: number) { retryDelayMs = v; }
function bumpRetryAndConnect(rt: OrbitRealtime) {
  const wait = Math.min(retryDelayMs, 15000);
  retryDelayMs = Math.min(retryDelayMs * 2, 15000);
  setTimeout(() => rt.connect(), wait);
}

/** سطر SDP مخصص يحمل نوع الجلسة المطلوبة حتى يعرف المجيب ما يرسله */
function tagOfferSdp(sdp: string, kind: PeerKind): string {
  return sdp.replace('m=video', `a=x-orbit-kind:${kind}\r\nm=video`);
}
function detectKindFromSdp(sdp: string): PeerKind {
  if (/a=x-orbit-kind:screen/.test(sdp)) return 'screen';
  return 'cam';
}

/** تحويل إ凭اءات ICE القادمة من الخادم (STUN + TURN موقّع) إلى صيغة RTCIceServer */
function toRtcIceServers(raw: any): RTCIceServer[] | null {
  try {
    const list = Array.isArray(raw?.servers) ? raw.servers : null;
    if (!list || list.length === 0) return null;
    return list.map((s: any) => ({ urls: s.urls, ...(s.username ? { username: s.username } : {}), ...(s.credential ? { credential: s.credential } : {}) }));
  } catch { return null; }
}

export class OrbitRealtime {
  readonly self: RTUser;
  private ws: WebSocket | null = null;
  private room: string;
  private token: string;
  /** اتصالات الأقران مفهرسة بمفتاح فريد لكل جلسة إشارة */
  private peers = new Map<string, { id: string; pc: RTCPeerConnection; kind: PeerKind }>();
  public remoteScreens = new Map<string, MediaStream>();
  public remoteCams = new Map<string, MediaStream>();

  onChat: (m: RTChatMsg) => void = () => {};
  onRoster: (p: RTUser[]) => void = () => {};
  onHand: (m: HandMsg) => void = () => {};
  onMediaState: (m: MediaStateMsg) => void = () => {};
  onRemoteScreen: (userId: string, stream: MediaStream | null) => void = () => {};
  onRemoteCam: (userId: string, stream: MediaStream | null) => void = () => {};
  /** واجهة موحّدة (توافقية) — kind يميّز الشاشة عن الكاميرا */
  set onRemoteStream(cb: (userId: string, stream: MediaStream | null, kind: PeerKind) => void) {
    this.onRemoteScreen = (uid, s) => cb(uid, s, 'screen');
    this.onRemoteCam = (uid, s) => cb(uid, s, 'cam');
  }
  onReady: (info: { history: RTChatMsg[] }) => void = () => {};
  onDisconnected: () => void = () => {};
  onGateError: (message: string) => void = () => {};
  /** حالة ICE الحية لاتصال الشاشة الواردة — صادق: لا «connected» قبل تدفق بكسلات فعلية */
  onIncomingConnState: (userId: string, state: 'connecting' | 'connected' | 'failed') => void = () => {};
  /** نوع مسار ICE الفعلي المستخدم لكل مستخدم — «relay» يعني وسيط TURN حقيقي يمر عبره الفيديو */
  onIceTransportType: (userId: string, t: 'host' | 'srflx' | 'prflx' | 'relay' | 'unknown') => void = () => {};

  private screenTrack: MediaStreamTrack | null = null;
  private camTrack: MediaStreamTrack | null = null;
  private audioTrack: MediaStreamTrack | null = null;
  private closedByUser = false;
  /** إ凭اءات ICE الحية الموزّعة من الخادم (STUN + TURN موقّع HMAC) — تُستعمل لكل peer جديد */
  private serverIce: RTCIceServer[] | null = null;
  /** هل وصلت إ凭اءات TURN فعلية من الخادم؟ (لعرض صادق لحالة الوسيط — لا ادعاء بلا إثبات) */
  public serverHasTurn = false;

  constructor(room: string, user: RTUser, token?: string) {
    this.room = room;
    this.self = user;
    this.token = token || '';
  }

  isConnected(): boolean { return !!this.ws && this.ws.readyState === WebSocket.OPEN; }

  connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${location.host}/realtime/${encodeURIComponent(this.room)}?token=${encodeURIComponent(this.token)}`;
    let opened = false;
    try { this.ws = new WebSocket(url); } catch { this.onDisconnected(); setTimeout(() => { if (!this.closedByUser) this.connect(); }, 1500); return; }
    this.ws.onopen = () => { opened = true; };
    this.ws.onmessage = (ev) => {
      let msg: ServerMsg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      switch (msg.type) {
        case 'welcome': {
          setRetryDelay(0);
          // التقاط ICE الموزّع من الخادم (TURN) وتطبيقه فوراً على كل الاتصالات الجارية —
          // الاتصالات التي أُنشئت قبل وصول welcome كانت ستفشل خلف NAT صارم بلا وسيط
          const ice = toRtcIceServers((msg as any).ice);
          if (ice) {
            this.serverIce = ice;
            this.serverHasTurn = ice.some((s) => s.username && s.credential && String(s.urls).includes('turn'));
            this.peers.forEach(({ pc }) => { try { pc.setConfiguration({ iceServers: ice, bundlePolicy: 'max-bundle', rtcpMuxPolicy: 'require' }); } catch { /* ignore */ } });
          }
          this.onReady({ history: msg.history || [] });
          break;
        }
        case 'gate-error': this.onGateError(msg.message || 'بوابة الرفض: لا يوجد اتصال'); break;
        case 'chat': this.onChat(msg as RTChatMsg); break;
        case 'roster': this.handleRoster(msg.participants); break;
        case 'hand': this.onHand(msg); break;
        case 'media-state': this.onMediaState(msg); break;
        case 'broadcast-track': this.handleBroadcastTrack(msg); break;
        case 'signal': this.handleSignal(msg).catch(() => {}); break;
      }
    };
    this.ws.onclose = () => {
      this.onDisconnected();
      if (!this.closedByUser) {
        // إعادة محاولة بتراجع تدريجي — لو كان الرفض من البوابة سيصل gate-error قبل الإغلاق
        if (!opened) bumpRetryAndConnect(this);
        else setTimeout(() => { if (!this.closedByUser) this.connect(); }, 1500);
      }
    };
    this.ws.onerror = () => { /* onclose سيتولى إعادة المحاولة */ };
  }

  sendChat(text: string) { this.raw({ type: 'chat', text }); }
  sendHand(raised: boolean) { this.raw({ type: 'hand', raised }); }
  sendMediaState(s: { mic: boolean; cam: boolean; screen: boolean }) { this.raw({ type: 'media-state', ...s }); }

  private raw(p: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(p));
  }

  // ===================== النشر المحلي (بث حقيقي) =====================

  publishScreen(track: MediaStreamTrack | null) {
    try { if (track) track.contentHint = 'screen'; } catch { /* ignore */ }
    this.screenTrack = track;
    // استبدال المسار حياً في كل اتصالات الشاشة الجارية — بدون ذلك يظل المجيبون
    // يستقبلون المسار القديم الميت وتظهر رسالة «تمت المشاركة» بلا أي صورة
    if (track) {
      this.peers.forEach(({ kind, pc }) => {
        if (kind !== 'screen') return;
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) { try { sender.replaceTrack(track); } catch { /* ignore */ } }
      });
    }
    this.raw({ type: 'broadcast-track', kind: 'screen', active: !!track });
  }

  setCameraTrack(track: MediaStreamTrack | null) {
    try { if (track) track.contentHint = 'camera'; } catch { /* ignore */ }
    this.camTrack = track;
    if (track) {
      this.peers.forEach(({ kind, pc }) => {
        if (kind !== 'cam') return;
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) { try { sender.replaceTrack(track); } catch { /* ignore */ } }
      });
    }
    this.raw({ type: 'broadcast-track', kind: 'cam', active: !!track });
  }

  attachAudioTrack(track: MediaStreamTrack | null) {
    this.audioTrack = track;
    // إرفاق الصوت فوراً بكل الاتصالات الجارية حتى يسمع الحضور الصوت الحي
    // (الشاشة أيضاً — إن كانت المشاركة تحمل صوت النظام/الميكروفون)
    this.peers.forEach(({ pc }) => {
      if (!track) return;
      try {
        const already = pc.getSenders().some((s) => s.track && s.track.kind === 'audio');
        if (!already) pc.addTrack(track);
      } catch { /* ignore */ }
    });
  }

  // ===================== استقبال الإشارات =====================

  private handleBroadcastTrack(m: BroadcastTrackMsg) {
    if (m.userId === this.self.id) return;
    if (!m.active) {
      this.removeIncomingSession(m.userId, m.kind);
      if (m.kind === 'screen') this.onRemoteScreen(m.userId, null);
      else this.onRemoteCam(m.userId, null);
      return;
    }
    // إن كانت هناك جلسة قائمة لنفس النوع/المستخدم فأعد تفاوضاً نظيفاً دائماً:
    // المسار لدى الناشر تغيّر (مشاركة جديدة بعد إيقاف) ولا يمكن الوثوق بالقديم
    this.openReceiveSession(m.userId, m.kind);
  }

  private removeIncomingSession(remoteId: string, kind: PeerKind) {
    Array.from(this.peers.entries()).forEach(([key, v]) => {
      if (v.id === remoteId && v.kind === kind) {
        try { v.pc.close(); } catch { /* ignore */ }
        this.peers.delete(key);
      }
    });
    if (kind === 'screen') this.remoteScreens.delete(remoteId);
    else this.remoteCams.delete(remoteId);
  }

  private handleRoster(participants: RTUser[]) {
    const ids = new Set(participants.map((p) => p.id));
    Array.from(this.peers.entries()).forEach(([key, v]) => {
      if (!ids.has(v.id)) {
        try { v.pc.close(); } catch { /* ignore */ }
        this.peers.delete(key);
        this.remoteScreens.delete(v.id);
        this.remoteCams.delete(v.id);
        this.onRemoteScreen(v.id, null);
        this.onRemoteCam(v.id, null);
      }
    });
    this.onRoster(participants);
  }

  /** تكوين ICE الفعلي: إ凭اءات الخادم (تشمل TURN) إن وصلت، وإلا القائمة العامة الاحتياطية */
  private iceConfig(extra?: Partial<RTCConfiguration>): RTCConfiguration {
    if (this.serverIce) return { iceServers: this.serverIce, bundlePolicy: 'max-bundle', rtcpMuxPolicy: 'require', ...extra };
    return { ...ICE_SERVERS, ...extra };
  }

  /** متلقٍ: افتح RTCPeerConnection لاستقبال نوع محدد من مستخدم محدد */
  private openReceiveSession(remoteId: string, kind: PeerKind) {
    // أغلق جلسة قائمة لنفس النوع/المستخدم قبل فتح الجديدة
    this.removeIncomingSession(remoteId, kind);
    const sessKey = `${remoteId}:${kind}:${Math.random().toString(36).slice(2, 8)}`;
    const pc = new RTCPeerConnection(this.iceConfig({ iceCandidatePoolSize: 4 }));
    this.peers.set(sessKey, { id: remoteId, pc, kind });
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });
    pc.onicecandidate = (e) => {
      if (e.candidate) this.raw({ type: 'signal', to: remoteId, conn: sessKey, data: { candidate: e.candidate } });
    };
    let gotVideo = false;
    let retried = false;
    pc.ontrack = (e) => {
      if (e.track.kind !== 'video') return;
      gotVideo = true;
      const stream = e.streams[0] || new MediaStream([e.track]);
      // مراقبة تدفق الإطارات الفعلية: track.readyState + frame stats — لا رسالة «حي» بلا بكسلات
      const vtrack = e.track as MediaStreamTrack & { onunmute?: (() => void) | null };
      if (vtrack.onunmute === undefined || !vtrack.onunmute) { try { vtrack.onunmute = () => { if (kind === 'screen') this.onIncomingConnState(remoteId, 'connected'); }; } catch { /* ignore */ } }
      if (kind === 'screen') {
        this.remoteScreens.set(remoteId, stream);
        this.onRemoteScreen(remoteId, stream);
        // انتظر حتى يبدأ المسار فعلاً في التدفق ثم أعلن الاتصال صادقاً
        const waitLive = (attempt = 0) => {
          if (!this.peers.has(sessKey)) return; // ألغيت الجلسة
          const st = e.track.readyState;
          if (st === 'live') { this.onIncomingConnState(remoteId, 'connected'); return; }
          if (attempt < 60) setTimeout(() => waitLive(attempt + 1), 500);
          else this.onIncomingConnState(remoteId, 'failed');
        };
        setTimeout(() => waitLive(), 300);
      } else {
        this.remoteCams.set(remoteId, stream);
        this.onRemoteCam(remoteId, stream);
      }
    };
    // كشف الفشل الصامت: اتصال ينجح في التفاوض لكنه لا يمرر أي بكسل
    // (يحصل خلف بعض الجدران النارية/الشبكات) → إعادة تفاوض نظيفة تلقائياً مرة واحدة.
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        if (kind === 'screen' && !gotVideo) this.onIncomingConnState(remoteId, 'connecting');
        // إثبات حي من RTCStats: نوع المسار الفعلي + عدّاد الإطارات المستقبَلة —
        // لا «متصل» بلا دليل، ولا ادعاء TURN إلا إذا كان selected pair relay فعلاً
        const probe = async () => {
          try {
            const stats = await pc.getStats();
            let sel: any = null;
            stats.forEach((r: any) => { if (r.type === 'candidate-pair' && (r.selected || r.state === 'succeeded')) sel = r; });
            if (sel) {
              const local = stats.get(sel.localCandidateId);
              const remote = stats.get(sel.remoteCandidateId);
              const ttype = (local?.candidateType || remote?.candidateType || 'unknown') as any;
              this.onIceTransportType(remoteId, ['host', 'srflx', 'prflx', 'relay'].includes(ttype) ? ttype : 'unknown');
            }
            if (kind === 'screen') {
              let frames = 0;
              stats.forEach((r: any) => { if (r.type === 'inbound-rtp' && r.kind === 'video') frames = Number(r.framesDecoded || 0); });
              if (frames > 0) { this.onIncomingConnState(remoteId, 'connected'); return; }
            }
          } catch { /* ignore */ }
          setTimeout(probe, 2000);
        };
        setTimeout(probe, 1500);
        setTimeout(() => {
          if (!gotVideo && !retried && this.isConnected() && this.peers.has(sessKey)) {
            retried = true;
            this.openReceiveSession(remoteId, kind); // جولة تفاوض جديدة كاملة
          }
        }, 7000);
      }
      if (pc.connectionState === 'failed' && kind === 'screen') {
        this.onIncomingConnState(remoteId, 'failed');
      }
      if ((pc.connectionState === 'failed' || pc.connectionState === 'disconnected') && !retried && this.isConnected()) {
        retried = true;
        setTimeout(() => { if (this.peers.get(sessKey)?.pc === pc && !gotVideo) this.openReceiveSession(remoteId, kind); }, 1500);
      }
    };
    pc.createOffer()
      .then((offer) => {
        const tagged = new RTCSessionDescription({ type: offer.type, sdp: tagOfferSdp(offer.sdp || '', kind) });
        return pc.setLocalDescription(tagged);
      })
      .then(() => this.raw({ type: 'signal', to: remoteId, conn: sessKey, data: { offer: pc.localDescription } }))
      .catch(() => {});
  }

  private async handleSignal(m: SignalMsg) {
    if (!m.data) return;
    if (m.data.offer) {
      const kind = detectKindFromSdp(m.data.offer.sdp || '');
      if (!m.conn) return; // كل العروض تحمل مفتاح جلسة — بدونها نتجاهل بأمان
      const pc = new RTCPeerConnection(this.iceConfig());
      this.peers.set(m.conn, { id: m.from, pc, kind });
      pc.onicecandidate = (e) => {
        if (e.candidate) this.raw({ type: 'signal', to: m.from, conn: m.conn, data: { candidate: e.candidate } });
      };
      if (kind === 'screen' && this.screenTrack) {
        pc.addTrack(this.screenTrack);
      } else if (kind === 'cam') {
        if (this.camTrack) pc.addTrack(this.camTrack);
        if (this.audioTrack) pc.addTrack(this.audioTrack);
      }
      await pc.setRemoteDescription(new RTCSessionDescription(m.data.offer));
      const ans = await pc.createAnswer();
      // فرض H.264 في الإجابة عند تفاوض Chrome↔Safari حتى لا ينشأ اتصال بلا بكسل
      await writeLocalDesc(pc, ans);
      this.raw({ type: 'signal', to: m.from, conn: m.conn, data: { answer: pc.localDescription } });
    } else if (m.data.answer) {
      const entry = this.peers.get(m.conn || '');
      if (!entry) return;
      await entry.pc.setRemoteDescription(new RTCSessionDescription(m.data.answer));
    } else if (m.data.candidate) {
      const entry = this.peers.get(m.conn || '');
      if (entry) {
        try { await entry.pc.addIceCandidate(new RTCIceCandidate(m.data.candidate)); } catch { /* ignore */ }
      }
    }
  }

  disconnect() {
    this.closedByUser = true;
    this.peers.forEach(({ pc }) => { try { pc.close(); } catch { /* ignore */ } });
    this.peers.clear();
    this.remoteScreens.clear();
    this.remoteCams.clear();
    this.ws?.close();
    this.ws = null;
  }
}

/** React hook: بوابة كاملة — بطاقة دخول ثم اتصال realtime، مع رسالة رفض واضحة عند منع غير المشترك */
export function useGatedRealtime(
  roomId: string | null,
  user: RTUser | null,
  opts?: { allowGuest?: boolean; userId?: string }
) {
  const rtRef = useRef<OrbitRealtime | null>(null);
  const [connected, setConnected] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [gateLoading, setGateLoading] = useState(false);
  const [stableUid] = useState(stableTabId);

  useEffect(() => {
    if (!roomId || !user) return;
    let disposed = false;
    let rt: OrbitRealtime | null = null;
    setGateLoading(true);
    setGateError(null);
    // هوية مستقرة: حساب مسجّل => userId حقيقي من قاعدة البيانات؛ زائر => معرف تبويب ثابت
    const gatedUser: RTUser = { ...user, id: opts?.userId && opts.userId !== 'guest' ? opts.userId : stableUid };
    const connectWith = (token: string) => {
      if (disposed) return;
      rt = new OrbitRealtime(roomId, gatedUser, token);
      rtRef.current = rt;
      rt.onGateError = (msg) => { if (!disposed) setGateError(msg); };
      rt.connect();
      setConnected(true);
    };
    const ticketPromise = (opts?.userId && opts.userId !== 'guest')
      ? requestRoomTicket(roomId, gatedUser).catch(async (e1: Error & { status?: number }) => {
          // حساب مسجل لكنه غير مشترك في تخصص الغرفة -> لا نجعله زائراً؛ الرفض نهائي وواضح
          throw e1;
        })
      : fetchGuestTicket(roomId, gatedUser.name);
    ticketPromise
      .then(({ token }) => connectWith(token))
      .catch((err: Error) => {
        if (disposed) return;
        setGateError(err.message || 'بوابة الرفض: لا يوجد اتصال');
        setConnected(false);
      })
      .finally(() => { if (!disposed) setGateLoading(false); });
    return () => {
      disposed = true;
      rtRef.current = null;
      setConnected(false);
      rt?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.id, user?.name, user?.role, opts?.userId, stableUid]);

  return { rt: rtRef.current as OrbitRealtime | null, rtRef, connected, gateError, gateLoading };
}
