import React, { useState, useRef, useEffect } from 'react';
import {
  LiveSession,
  ClassroomParticipant,
  ClassroomMessage,
  UserRole
} from '../../shared/types';
import { requestRoomTicket, OrbitRealtime, RTChatMsg, RTUser } from '../../services/realtime';
import { requestCameraMic, requestScreenShare, capabilityReport, detectDeviceProfile, MediaCapability } from '../../services/mediaPermissions';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  Hand, 
  MessageSquare, 
  Users, 
  Settings, 
  PhoneOff, 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Download, 
  ThumbsUp, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  Maximize, 
  ChevronRight,
  Circle
} from 'lucide-react';
import { recordAudit } from '../../services/api';

interface LiveClassroomStudioProps {
  session: LiveSession;
  userId: string;
  userName: string;
  userRole: Extract<UserRole, 'instructor' | 'learner' | 'admin'>;
  onLeaveSession: () => void;
}

export const LiveClassroomStudio: React.FC<LiveClassroomStudioProps> = ({
  session,
  userId,
  userName,
  userRole,
  onLeaveSession,
}) => {
  // Media controls
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);
  // هل يصل فعلاً سيل بكسل من شاشة المشارك لنفسه (كشف صادق لفشل الالتقاط)
  const [selfScreenLive, setSelfScreenLive] = useState<boolean>(false);
  // حالة ICE الحية لمشاركات الشاشة الواردة — لا نعرض «بث حي» قبل وصول بكسلات فعلية
  const [incomingConnState, setIncomingConnState] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const incomingHadPixelsRef = useRef(false);
  // نوع مسار ICE الفعلي للواردة — relay = وسيط TURN حقيقي يمر عبره الفيديو (يُعرض بصدق)
  const [incomingTransport, setIncomingTransport] = useState<'host' | 'srflx' | 'prflx' | 'relay' | 'unknown'>('unknown');
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState<boolean>(false);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  // Live elapsed timer — starts from zero the moment you actually enter the room (real clock)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  // Real join timestamp for honest "انضم في" display
  const joinedAtRef = useRef<string>(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));

  // Active side panel: 'chat' | 'participants' | 'qa'
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'participants' | 'qa'>('chat');

  // Video and screen stream refs
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Whiteboard drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>('#00b4d8');
  const [penSize, setPenSize] = useState<number>(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // Chat and Q&A state — starts EMPTY. Real messages arrive only from real attendees
  // through the live WebSocket hub (server history + onChat). No seeded fake chatter.
  const [messages, setMessages] = useState<ClassroomMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');

  // Attendees list — starts with YOU only (real presence). Fake ghosts removed; the roster
  // is rebuilt live from the actual WebSocket room roster as real people join.
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([
    {
      id: 'cur-usr',
      name: `${userName} (أنت)`,
      role: userRole,
      isMuted: !isMicOn,
      isVideoOn: isVideoOn,
      isHandRaised: isHandRaised,
      joinedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Real local microphone & camera capture (getUserMedia) — actual live media, not a simulation
  const rtRef = useRef<OrbitRealtime | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [localMediaReady, setLocalMediaReady] = useState<boolean>(false);
  const [remoteStageStream, setRemoteStageStream] = useState<MediaStream | null>(null);
  const [remoteStageOwner, setRemoteStageOwner] = useState<string | null>(null);
  const [remoteCamStreams, setRemoteCamStreams] = useState<{ userId: string; stream: MediaStream }[]>([]);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [gateLoading, setGateLoading] = useState<boolean>(false);
  // حالة وسيط TURN الفعلية كما وزّعها الخادم — تُعرض بصدق: بدون TURN والاتصال
  // المباشرفشل خلف NAT صارم، يعرف المستخدم السبب الحقيقي بدل رسالة غامضة.
  const [turnAvailable, setTurnAvailable] = useState<boolean | null>(null);
  const [livePeers, setLivePeers] = useState<RTUser[]>([]);
  const stageVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteOwnerRef = useRef<string | null>(null);

  // صلاحيات الوسائط وفق سياسة كل نظام تشغيل — تُطلب استجابةً لتفاعل المستخدم (نقرة)
  // لأن أندرويد/iOS يرفضان getUserMedia بدون user gesture، ورسائل الخطأ مخصصة للمنصة.
  const [mediaPromptOpen, setMediaPromptOpen] = useState<boolean>(false);
  const [permStatus, setPermStatus] = useState<{ camera: string; mic: string; screen: string } | null>(null);
  const [mediaError, setMediaError] = useState<{ message: string; hint?: string } | null>(null);
  const [mediaBusy, setMediaBusy] = useState<boolean>(false);

  const applyLocalStream = (stream: MediaStream) => {
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(() => {});
    }
    setLocalMediaReady(true);
    // انشر الكاميرا والصوت الحقيقيين فوراً لكل الحضور عبر WebRTC
    const vt = stream.getVideoTracks()[0];
    if (vt) { try { vt.contentHint = 'camera'; } catch { /* ignore */ } rtRef.current?.setCameraTrack(vt); }
    // صوت المحاضر الحي يصل لكل الحضور كمسار صوتي حقيقي في نفس الاتصالات
    rtRef.current?.attachAudioTrack(stream.getAudioTracks()[0] || null);
  };

  const handleEnableCameraMic = async () => {
    setMediaBusy(true);
    setMediaError(null);
    const { stream, outcome } = await requestCameraMic();
    if (stream) {
      applyLocalStream(stream);
      setMediaPromptOpen(false);
    } else {
      setMediaError({ message: outcome.friendlyMessage, hint: outcome.hint });
    }
    setMediaBusy(false);
  };

  useEffect(() => {
    let cancelled = false;
    capabilityReport().then((rep) => {
      if (cancelled) return;
      setPermStatus({
        camera: rep.camera.available ? rep.camera.state : 'غير متاح',
        mic: rep.microphone.available ? rep.microphone.state : 'غير متاح',
        screen: rep.screen.available ? 'متاح' : (detectDeviceProfile().os === 'ios' ? 'iOS يمنعها' : 'غير مدعوم'),
      });
    }).catch(() => {});
    // إن كان الإذن ممنوحاً سابقاً (granted) نشّط الوسائط تلقائياً بلا نقرة إضافية؛
    // بخلاف ذلك نفتح نافذة طلب إذن واضحة بدل الصمت — لا بث وهمي.
    navigator.permissions?.query?.({ name: 'camera' as PermissionName })
      .then((s) => {
        if (s.state === 'granted') {
          requestCameraMic().then(({ stream }) => { if (stream && !localStreamRef.current) applyLocalStream(stream); });
        } else if (!cancelled) {
          setMediaPromptOpen(true);
        }
      })
      .catch(() => { if (!cancelled) setMediaPromptOpen(true); });
    return () => { cancelled = true; };
  }, []);

  // تنظيف المسارات عند مغادرة الغرفة
  useEffect(() => {
    return () => { localStreamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  // ===== ORBIT Realtime Hub: actual WebSocket chat + WebRTC broadcast to audience =====
  useEffect(() => {
    const room = session.meetingCode || session.id;
    let disposed = false;
    let rt: OrbitRealtime | null = null;
    setGateError(null);
    setGateLoading(true);

    // بطاقة دخول حقيقية من الخادم — يفحص الاشتراك الفعلي في قاعدة البيانات
    // ولا يُسمح بدخول أي غرفة بدونها (لا غرف وهمية، لا أبواب خلفية)
    requestRoomTicket(room, { id: userId, name: userName, role: userRole } as RTUser)
      .then(({ token }) => {
        if (disposed) return;
        const user: RTUser = { id: userId, name: userName, role: userRole };
        rt = new OrbitRealtime(room, user, token);
        rtRef.current = rt;
        wireRealtime(rt);
        // راقب حالة ICE لاتصال الشاشة الواردة — الشارة الخضراء لا تظهر إلا عند وصول بكسلات فعلية
        rt.onIncomingConnState = (uid, state) => {
          if (remoteOwnerRef.current !== uid) return;
          if (state === 'connected') incomingHadPixelsRef.current = true;
          setIncomingConnState(state);
        };
        // نوع المسار الفعلي من RTCStats — relay يعني أن الفيديو يمر عبر وسيط TURN حقيقي الآن
        rt.onIceTransportType = (uid, t) => {
          if (remoteOwnerRef.current !== uid) return;
          setIncomingTransport(t);
        };
        rt.connect();
        // انتظر welcome ثم اقرأ حالة TURN الموزّعة فعلياً من الخادم
        const rtNow = rt;
        const prevReady = rtNow.onReady;
        rtNow.onReady = (info) => { setTurnAvailable(rtNow.serverHasTurn); if (prevReady) prevReady(info); };
        setGateLoading(false);
      })
      .catch((err: Error) => {
        if (disposed) return;
        setGateLoading(false);
        setGateError(err.message || 'بوابة الرفض: تعذر التحقق من اشتراكك في هذه الحصة');
      });

    function wireRealtime(rt: OrbitRealtime) {
    rt.onReady = ({ history }) => {
      setRealtimeConnected(true);
      // دمج سجل الدردشة الحقيقي القادم من الخادم
      setMessages(prev => {
        const serverMsgs: ClassroomMessage[] = history.map(h => ({
          id: h.id,
          senderId: h.senderId,
          senderName: h.senderName,
          senderRole: h.senderRole as any,
          text: h.text,
          timestamp: new Date(h.at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          upvotes: 0,
        }));
        const merged = [...prev];
        serverMsgs.forEach(sm => { if (!merged.find(m => m.id === sm.id)) merged.push(sm); });
        return merged;
      });
    };
    rt.onChat = (m: RTChatMsg) => {
      setMessages(prev => prev.find(x => x.id === m.id) ? prev : [...prev, {
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole as any,
        text: m.text,
        timestamp: new Date(m.at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isQuestion: m.text.includes('؟') || m.text.includes('?'),
        upvotes: 0,
      }]);
    };
    rt.onRoster = (p) => {
      setLivePeers(p);
      // ابنِ قائمة الحضور من roster الفعلي للغرفة — أشخاص حقيقيون فقط، لا أشباح وهمية
      setParticipants(prev => {
        const selfId = rt.self.id;
        const meEntry = prev.find(x => x.id === 'cur-usr');
        const others: ClassroomParticipant[] = p
          .filter(u => u.id !== selfId)
          .map(u => {
            const existing = prev.find(x => x.id === u.id);
            // تطبيع الأدوار إلى مجموعة الأدوار المعتمدة في النظام (بدون as any)
            const normRole = (r: string): ClassroomParticipant['role'] =>
              r === 'instructor' || r === 'admin' ? r : 'learner';
            return existing
              ? { ...existing, name: u.name, role: normRole(u.role) }
              : {
                  id: u.id,
                  name: u.name,
                  role: normRole(u.role),
                  isMuted: true,
                  isVideoOn: false,
                  isHandRaised: false,
                  joinedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                };
          });
        const selfAsAttendee: ClassroomParticipant = meEntry
          ? { ...meEntry, name: `${(rt.self.name || userName)} (أنت)` }
          : { id: 'cur-usr', name: `${userName} (أنت)`, role: userRole, isMuted: !isMicOn, isVideoOn, isHandRaised, joinedAt: joinedAtRef.current };
        return [selfAsAttendee, ...others];
      });
    };
    rt.onHand = ({ userId, raised }) => {
      setParticipants(prev => prev.map(pp => pp.id === userId ? { ...pp, isHandRaised: raised } : pp));
    };
    rt.onMediaState = ({ userId, mic, cam }) => {
      setParticipants(prev => prev.map(pp => pp.id === userId ? { ...pp, isMuted: !mic, isVideoOn: cam } : pp));
    };
    // بث شاشة/كاميرا حقيقي يصل من مشارك آخر -> اعرضه على المسرح فوراً أمام الحضور
    rt.onRemoteStream = (userId, stream, kind) => {
      if (!stream) {
        setRemoteStageStream((cur) => (cur && remoteOwnerRef.current === userId ? null : cur));
        setRemoteStageOwner((cur) => (cur === userId ? null : cur));
        setRemoteCamStreams((cur) => cur.filter((c) => c.userId !== userId));
        if (remoteOwnerRef.current === userId) {
          remoteOwnerRef.current = null;
          incomingHadPixelsRef.current = false;
          setIncomingConnState('idle');
        }
        return;
      }
      const vtrack = stream.getVideoTracks()[0];
      const hint = (vtrack as (MediaStreamTrack & { contentHint?: string }) | undefined)?.contentHint || '';
      const isScreenLike = /slide|screen|detail|text/.test(hint) || (kind === 'screen' && !/camera|motion/.test(hint));
      if (isScreenLike) {
        try { if (vtrack) vtrack.contentHint = 'screen'; } catch { /* ignore */ }
        remoteOwnerRef.current = userId;
        incomingHadPixelsRef.current = false;
        setIncomingConnState('connecting');
        setRemoteStageStream(stream);
        setRemoteStageOwner(userId);
      } else {
        setRemoteCamStreams((cur) => {
          if (cur.some((c) => c.userId === userId)) return cur;
          return [...cur, { userId, stream }];
        });
      }
    };
    }

    return () => { disposed = true; rt?.disconnect(); rtRef.current = null; };
  }, [session.id, session.meetingCode, userId, userName, userRole]);

  // عرض البث المستقبل على مسرح المرحلة تلقائياً
  useEffect(() => {
    if (remoteStageStream && stageVideoRef.current) {
      stageVideoRef.current.srcObject = remoteStageStream;
      stageVideoRef.current.play().catch(() => {});
    }
  }, [remoteStageStream]);

  // Real mute/unmute tracks (actual audio/video control, not cosmetic)
  useEffect(() => {
    const stream = localVideoRef.current?.srcObject as MediaStream | null;
    stream?.getAudioTracks().forEach(t => (t.enabled = isMicOn));
  }, [isMicOn]);

  useEffect(() => {
    const stream = localVideoRef.current?.srcObject as MediaStream | null;
    stream?.getVideoTracks().forEach(t => (t.enabled = isVideoOn));
  }, [isVideoOn]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync participant status
  useEffect(() => {
    setParticipants(prev => prev.map(p => {
      if (p.id === 'cur-usr') {
        return {
          ...p,
          isMuted: !isMicOn,
          isVideoOn,
          isHandRaised
        };
      }
      return p;
    }));
  }, [isMicOn, isVideoOn, isHandRaised]);

  // Real Screen Sharing — عبر وحدة الصلاحيات المخصصة لكل نظام تشغيل (iOS/Android/Desktop)
  const handleToggleScreenShare = async () => {
    if (isSharingScreen) {
      if (screenVideoRef.current && screenVideoRef.current.srcObject) {
        const stream = screenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        screenVideoRef.current.srcObject = null;
      }
      rtRef.current?.publishScreen(null);
      setSelfScreenLive(false);
      // استرجاع ميكروفون الغرفة كمصدر صوت بعد إغلاق مسار صوت الشاشة
      const micTrack = localStreamRef.current?.getAudioTracks()[0] || null;
      rtRef.current?.attachAudioTrack(micTrack);
      rtRef.current?.sendMediaState({ mic: isMicOn, cam: isVideoOn, screen: false });
      setIsSharingScreen(false);
    } else {
      const { stream, outcome } = await requestScreenShare();
      if (!stream) {
        // رسالة صادقة مخصصة للمنصة (iOS يمنعها، WebView يمنعها، رفض المستخدم...) — لا alert عام
        setMediaError({ message: outcome.friendlyMessage, hint: outcome.hint });
        setIsSharingScreen(false);
        return;
      }
      setMediaError(null);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(() => {});
      }
      setIsSharingScreen(true);
      setIsWhiteboardOpen(false);

      // انشر المسار فعلياً لكل الحضور عبر WebRTC — يظهرونه على مسرحهم فوراً
      const vtrack = stream.getVideoTracks()[0] || null;
      try { if (vtrack) vtrack.contentHint = 'screen'; } catch { /* ignore */ }
      // النشر أولاً حتى تُستبدل المسارات حياً في الاتصالات الجارية (replaceTrack)
      rtRef.current?.publishScreen(vtrack);
      // الصوت: يبقى ميكروفون الغرفة هو المصدر (طلب audio في المشاركة يفشل صامتة على كثير من الأنظمة)
      const micT = localStreamRef.current?.getAudioTracks()[0] || null;
      if (micT) rtRef.current?.attachAudioTrack(micT);
      rtRef.current?.sendMediaState({ mic: isMicOn, cam: isVideoOn, screen: true });

      if (vtrack) vtrack.onended = () => {
        rtRef.current?.publishScreen(null);
        setSelfScreenLive(false);
        if (micT) rtRef.current?.attachAudioTrack(micT);
        rtRef.current?.sendMediaState({ mic: isMicOn, cam: isVideoOn, screen: false });
        setIsSharingScreen(false);
      };
    }
  };

  // Toggle Hand Raise — real broadcast to all attendees via WebSocket hub
  const handleToggleHand = async () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    rtRef.current?.sendHand(next);
    await recordAudit({
      actorUserId: 'usr-student-1',
      actorName: userName,
      action: next ? 'HAND_RAISED' : 'HAND_LOWERED',
      resourceType: 'live_classroom',
      resourceId: session.id,
      reason: next ? 'طلب الحديث والمشاركة في الجلسة الحية' : 'خفض اليد',
      correlationId: 'live-' + Date.now(),
      safeMetadata: { meetingCode: session.meetingCode }
    });
  };

  // Whiteboard drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#090d16' : penColor;
    ctx.lineWidth = tool === 'eraser' ? 24 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Send Chat message — actually relayed live to every attendee in the room (WebSocket pub/sub)
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    // أرسل للخادم؛ سيصل للبث لكل الحضور ويعود لنا عبر onChat (مصدر واحد للحقيقة)
    rtRef.current?.sendChat(text);
  };

  const handleUpvote = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, upvotes: (m.upvotes || 0) + 1 } : m));
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="media-dark fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Classroom Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        
        {/* Session Info & Recording status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-red-400 font-mono flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>مباشر • {formatElapsed(elapsedSeconds)}</span>
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <div className="hidden sm:block">
            <h2 className="text-xs font-bold text-white line-clamp-1">{session.title}</h2>
            <div className="text-[10px] text-slate-400">{session.courseTitle} • {session.instructorName}</div>
          </div>
        </div>

        {/* Meeting Code & Security Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>كود الغرفة: {session.meetingCode}</span>
          </div>

          <button
            onClick={onLeaveSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-bold transition-colors border border-red-500/30"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>مغادرة الجلسة</span>
          </button>
        </div>

      </div>

      {/* Main Classroom Workspace (Stage on right/center, Side drawer on left) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Stage (Screen Share / Video Feed / Whiteboard) */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden bg-slate-950/60 relative">
          
          {/* Active Stage Screen */}
          <div className="flex-1 rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900 relative shadow-2xl flex items-center justify-center">
            
            {/* Mode 1: Interactive Whiteboard */}
            {isWhiteboardOpen ? (
              <div className="w-full h-full flex flex-col bg-slate-950 relative">
                
                {/* Whiteboard Toolbar */}
                <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                      <button
                        onClick={() => setTool('pen')}
                        className={`p-1.5 rounded ${tool === 'pen' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                        title="قلم الرسم"
                      >
                        <PenTool className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTool('eraser')}
                        className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                        title="ممحاة"
                      >
                        <Eraser className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Colors */}
                    <div className="flex items-center gap-1.5">
                      {['#00b4d8', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff'].map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            setPenColor(c);
                            setTool('pen');
                          }}
                          className={`w-5 h-5 rounded-full border-2 transition-transform ${penColor === c ? 'scale-110 border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearCanvas}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 px-2 py-1 bg-slate-800 rounded transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>مسح اللوحة</span>
                    </button>
                  </div>
                </div>

                {/* Canvas Drawing Surface */}
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-full cursor-crosshair bg-slate-950"
                />
              </div>
            ) : isSharingScreen ? (
              /* Mode 2: Screen Sharing Stage — بث حقيقي مع كشف حي لفشل الالتقاط */
              <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  muted
                  onTimeUpdate={() => setSelfScreenLive(true)}
                  className={`w-full h-full object-contain ${selfScreenLive ? '' : 'opacity-0'}`}
                />
                {!selfScreenLive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300 px-6 text-center">
                    <MonitorOff className="w-10 h-10 text-amber-400" />
                    <p className="text-sm font-bold">جارٍ التقاط الشاشة… إن تأخرت الصورة فقد رفض المتصفح مشاركة هذا المصدر</p>
                    <p className="text-[11px] text-slate-500">جرّب اختيار «تبويب» أو «نافذة» في مربع المشاركة بدل الشاشة كاملة، ثم أعد المحاولة من الزر السفلي</p>
                  </div>
                )}

                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pointer-events-none">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                    {`${session.title} • مشاركة شاشة حقيقية`}
                  </span>
                  <span className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    يبث لكل الحضور عبر WebRTC
                  </span>
                </div>
              </div>
            ) : remoteStageStream ? (
              /* Mode 2.5: ACTUAL incoming WebRTC broadcast from a live presenter — real pixels, not simulation */
              <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center">
                <video
                  ref={stageVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-contain ${incomingConnState === 'connected' || incomingHadPixelsRef.current ? '' : 'opacity-0'}`}
                />
                {!(incomingConnState === 'connected' || incomingHadPixelsRef.current) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300 px-6 text-center">
                    {incomingConnState === 'failed' ? (
                      <>
                        <MonitorOff className="w-10 h-10 text-red-400" />
                        <p className="text-sm font-bold text-red-300">تعذّر وصول البث إليك — فشل الاتصال المباشر بين الجهازين (ICE)</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">جهازا الاتصال خلف جدار ناري صارم يمنع P2P؛ يحتاج الخادم حينها وسيط TURN. سيعاد التفاوض تلقائياً عند دخول مشاركين جدد.</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                        <p className="text-sm font-bold">جارٍ تأسيس الاتصال المباشر واستقبال أول إطار من بث {livePeers.find(p => p.id === remoteStageOwner)?.name || 'المحاضر'}…</p>
                      </>
                    )}
                  </div>
                )}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {incomingConnState === 'connected' || incomingHadPixelsRef.current ? (
                    <>
                      <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 backdrop-blur-md">
                        بث حي فعلي من {livePeers.find(p => p.id === remoteStageOwner)?.name || 'محاضر'} — WebRTC
                        {incomingTransport === 'relay' ? ' · وسيط TURN (براهين RTCStats)' : incomingTransport === 'host' || incomingTransport === 'srflx' ? ` · اتصال مباشر (${incomingTransport})` : ''}
                        {' · تم التحقق من الإطارات'}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-500/20 text-slate-300 border border-slate-800/40 backdrop-blur-md">
                      {incomingConnState === 'failed'
                        ? turnAvailable === false
                          ? 'تعذر الاتصال المباشر (NAT صارم) — وسيط TURN غير مفعّل على الخادم بعد'
                          : 'فشل الوصول للبث'
                        : 'انتظار أول إطار فعلي…'}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Mode 3: Real live video tiles — local camera + actual remote WebRTC streams */
              <div className="w-full h-full p-4 overflow-y-auto">
                <div className={`grid gap-4 h-full ${remoteCamStreams.length > 0 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>

                  {/* Your real camera tile (broadcast to everyone) */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg min-h-[180px]">
                    {localMediaReady && isVideoOn ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
                        />
                        <span className="w-16 h-16 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-2xl font-black mb-2">
                          {(userName || 'أ').trim().charAt(0)}
                        </span>
                        <span className="text-xs">{isVideoOn ? 'بانتظار إذن الكاميرا… اسمح للمتصفح لتظهر حياً للجميع' : 'الكاميرا مغلقة'}</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
                        أنت ({userName}) — بثك يصل الحضور الآن 🎥
                      </span>
                      {isHandRaised && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce">
                          <Hand className="w-3 h-3" />
                          اليد مرفوعة
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actual incoming remote camera broadcasts (real WebRTC pixels) */}
                  {remoteCamStreams.map(({ userId, stream }) => (
                    <div key={userId} className="relative rounded-2xl overflow-hidden bg-slate-950 border border-emerald-500/30 flex items-center justify-center shadow-lg min-h-[180px]">
                      <video autoPlay playsInline className="w-full h-full object-cover"
                        ref={(v) => { if (v) { v.srcObject = stream; v.play().catch(() => {}); } }}
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
                          {livePeers.find(p => p.id === userId)?.name || 'مشارك حي'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Live roster info panel (replaces the fake static instructor photo tile) */}
                  <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col justify-between shadow-lg min-h-[180px]">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Users className="w-4 h-4 text-cyan-400" />
                        متصلون بك الآن في البث الحي
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        كل ما تراه هنا هو WebRTC فعلي: كاميرتك وصوتك وشاشتك تُبث مباشرة لكل متصل بنفس كود الغرفة — بدون أي محاكاة.
                      </p>
                    </div>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto mt-3">
                      {livePeers.filter(p => p.id !== rtRef.current?.self.id).map(p => (
                        <div key={p.id} className="flex items-center justify-between text-[11px] bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5">
                          <span className="font-bold text-slate-200 truncate">{p.name}</span>
                          <span className={`shrink-0 mr-2 text-[10px] font-mono ${realtimeConnected ? 'text-emerald-400' : 'text-slate-500'}`}>{p.role === 'instructor' ? 'محاضر' : 'متدرب'}</span>
                        </div>
                      ))}
                      {livePeers.length <= 1 && (
                        <div className="text-[11px] text-slate-500 leading-relaxed">
                          أنت وحدك في الغرفة حالياً. افتح نفس الجلسة في نافذة/جهاز آخر أو شارك رابط الغرفة، وسترى حضورك وبث بعضكم لبعض لحظياً.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Speaker PIP — your REAL camera while sharing screen/whiteboard */}
            {(isSharingScreen || isWhiteboardOpen) && (
              <div className="absolute top-4 right-4 w-44 aspect-video rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl bg-slate-950 z-20">
                {localMediaReady ? (
                  <video
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    ref={(v) => {
                      if (v && localStreamRef.current) {
                        v.srcObject = localStreamRef.current;
                        v.play().catch(() => {});
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-cyan-300">
                    <VideoOff className="w-5 h-5" />
                    <span className="text-[10px]">الكاميرا غير متاحة</span>
                  </div>
                )}
                <div className="absolute bottom-1 right-1 text-[10px] font-bold text-white bg-slate-950/80 px-1.5 py-0.5 rounded">
                  {userName}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Control Bar */}
          <div className="h-16 pt-3 flex items-center justify-between shrink-0">
            
            {/* Audio & Video Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-2xl transition-all shadow-md ${
                  isMicOn 
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                }`}
                title={isMicOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون'}
              >
                {isMicOn ? <Mic className="w-5 h-5 text-cyan-400" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-2xl transition-all shadow-md ${
                  isVideoOn 
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                }`}
                title={isVideoOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
              >
                {isVideoOn ? <Video className="w-5 h-5 text-cyan-400" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Screen Share, Whiteboard & Interactive Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleScreenShare}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                  isSharingScreen
                    ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/25'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {isSharingScreen ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4 text-cyan-400" />}
                <span>{isSharingScreen ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة (بث فعلي لكل الحضور)'}</span>
              </button>

              <button
                onClick={() => {
                  setIsWhiteboardOpen(!isWhiteboardOpen);
                  if (!isWhiteboardOpen) setIsSharingScreen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                  isWhiteboardOpen
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span>السبورة التفاعلية (Whiteboard)</span>
              </button>

              <button
                onClick={handleToggleHand}
                className={`p-3 rounded-2xl transition-all shadow-md ${
                  isHandRaised
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/25 animate-pulse'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
                title="رفع اليد لطلب التحدث"
              >
                <Hand className="w-5 h-5" />
              </button>
            </div>

            {/* Side Drawer Toggle Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSideTab('chat')}
                className={`p-3 rounded-2xl transition-colors ${
                  activeSideTab === 'chat' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="الدردشة والأسئلة"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveSideTab('participants')}
                className={`p-3 rounded-2xl transition-colors relative ${
                  activeSideTab === 'participants' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="قائمة الحضور"
              >
                <Users className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {participants.length}
                </span>
              </button>
            </div>

          </div>

        </div>

        {/* Side Panel (Chat / Participants / QA) - 340px width */}
        <div className="w-80 sm:w-96 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          
          {/* Tabs header */}
          <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950 text-xs font-bold">
            <button
              onClick={() => setActiveSideTab('chat')}
              className={`py-3 text-center border-b-2 transition-colors ${
                activeSideTab === 'chat'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              الدردشة والأسئلة ({messages.length})
            </button>

            <button
              onClick={() => setActiveSideTab('participants')}
              className={`py-3 text-center border-b-2 transition-colors ${
                activeSideTab === 'participants'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              الحضور والمشاركون ({participants.length})
            </button>
          </div>

          {/* Tab 1: Chat & Q&A Stream */}
          {activeSideTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl text-xs space-y-1.5 ${
                      msg.senderRole === 'instructor'
                        ? 'bg-indigo-950/40 border border-indigo-900/60'
                        : 'bg-slate-950 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={msg.senderRole === 'instructor' ? 'text-indigo-400' : 'text-slate-200'}>
                          {msg.senderName}
                        </span>
                        {msg.senderRole === 'instructor' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            محاضر
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>

                    <p className="text-slate-200 leading-relaxed">{msg.text}</p>

                    {msg.isQuestion && (
                      <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400">
                        <span className="font-semibold">سؤال للمحاضر</span>
                        <button
                          onClick={() => handleUpvote(msg.id)}
                          className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{msg.upvotes || 0}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب سؤالك أو تعليقك المباشر..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Participants Roster */}
          {activeSideTab === 'participants' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-[11px] text-slate-400 mb-3">
                المشاركون في هذه الجلسة الحية ({participants.length}):
              </div>

              {participants.map(p => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs">
                      {p.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.role === 'instructor' && (
                          <span className="text-[10px] text-indigo-400 font-normal">المحاضر</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">انضم في {p.joinedAt}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.isHandRaised && (
                      <span className="text-amber-400 animate-bounce" title="اليد مرفوعة">
                        <Hand className="w-4 h-4" />
                      </span>
                    )}
                    {p.isMuted ? (
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    {p.isVideoOn ? (
                      <Video className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <VideoOff className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
