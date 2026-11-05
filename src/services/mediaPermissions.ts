/**
 * src/services/mediaPermissions.ts — إدارة صلاحيات الوسائط حسب سياسة كل نظام تشغيل
 *
 * لماذا هذا الملف موجود: سلوك الكاميرا/الميكروفون/مشاركة الشاشة يختلف جذرياً بين:
 *  - iOS Safari: لا يدعم getDisplayMedia إطلاقاً (مشاركة الشاشة من متصفح الجوال غير ممكنة)
 *    → يجب إظهار رسالة واضحة بدل زر لا يفعل شيئاً، واقتراح بديل (فتح الحصة من جهاز لوحي/حاسوب).
 *  - Android Chrome: getDisplayMedia مدعوم لكن يتطلب تفاعلاً مباشراً من المستخدم (gesture)
 *    وإلا يُرفض بـ NotAllowedError؛ كما أن الصوت في مشاركة الشاشة غالباً غير مدعوم → نطلبه
 *    بشكل اختياري حتى لا تفشل المشاركة كلها لعدم توفر صوت النظام.
 *  - Desktop (Win/mac/Linux): دعم كامل؛ على macOS تتطلب الكاميرا/الشاشة سماح نظام tcc
 *    أول مرة — رفض النظام يظهر كـ NotAllowedError ونوجّه المستخدم لإعدادات الخصوصية.
 *
 * كل دالة هنا تستدعي الـ API الحقيقي للمتصفح ولا تحاكي شيئاً؛ الحالة الناتجة تُقرأ
 * من Permissions API الفعلية حيثما كانت مدعومة، ومن محاولة الوصول الحيّة حيث لا تكون.
 */

export type MediaCapability = 'camera' | 'microphone' | 'screen';

export type DeviceProfile = {
  os: 'ios' | 'ipados' | 'android' | 'macos' | 'windows' | 'linux' | 'other';
  browser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'webview' | 'other';
  isMobile: boolean;
  supportsGetDisplayMedia: boolean;
  supportsUserMedia: boolean;
  secureContext: boolean; // getUserMedia/getDisplayMedia تتطلب HTTPS أو localhost
};

/** كشف صادق لمنصة المستخدم الحالية — بلا تنصت على أي معلومة خارج UA القياسي */
export function detectDeviceProfile(): DeviceProfile {
  const ua = navigator.userAgent || '';
  const platform = (navigator as any).userAgentData?.platform || (navigator as any).platform || '';
  const isIpadOS = /Macintosh/.test(ua) && 'ontouchend' in document; // iPadOS يتخفى كـ Mac
  let os: DeviceProfile['os'] = 'other';
  if (/iPhone|iPad|iPod/.test(ua) || isIpadOS) os = isIpadOS ? 'ipados' : 'ios';
  else if (/Android/.test(ua)) os = 'android';
  else if (/Mac/.test(ua) || /Mac/.test(platform)) os = 'macos';
  else if (/Windows/.test(ua) || /Win/.test(platform)) os = 'windows';
  else if (/Linux/.test(ua) || /X11/.test(ua)) os = 'linux';

  let browser: DeviceProfile['browser'] = 'other';
  if (/FBAV|Instagram|Twitter|Snapchat|GSA/.test(ua)) browser = 'webview';
  else if (/Edg\//.test(ua)) browser = 'edge';
  else if (/OPR\//.test(ua)) browser = 'other';
  else if (/Firefox\//.test(ua)) browser = 'firefox';
  else if (/Version\/.*Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'safari';
  else if (/Chrome\//.test(ua)) browser = 'chrome';

  const isMobile = os === 'ios' || os === 'android' || (/iPad/.test(ua));

  return {
    os, browser, isMobile,
    supportsGetDisplayMedia: typeof navigator.mediaDevices?.getDisplayMedia === 'function',
    supportsUserMedia: typeof navigator.mediaDevices?.getUserMedia === 'function',
    secureContext: window.isSecureContext === true,
  };
}

/** حالة صلاحية فعلية من Permissions API إن كانت مدعومة — لمحاولة قراءة دون إزعاج المستخدم */
export async function queryPermissionState(name: 'camera' | 'microphone' | 'display-media'): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  try {
    if (!navigator.permissions?.query) return 'unsupported';
    const status = await navigator.permissions.query({ name: name as PermissionName });
    return status.state as any;
  } catch {
    return 'unsupported'; // Safari مثلاً لا يدعم display-media query — لا يعني رفضاً
  }
}

export type PermissionOutcome = {
  ok: boolean;
  error?: string;          // السبب الخام من المتصفح
  friendlyMessage: string; // رسالة عربية واضحة للمستخدم — بدون أي مبالغة أو ادعاء
  hint?: string;           // الخطوة التالية المطلوبة من المستخدم على نظامه تحديداً
};

const friendlyForError = (e: any, cap: MediaCapability, p: DeviceProfile): PermissionOutcome => {
  const name = e?.name || '';
  const capLabel = cap === 'camera' ? 'الكاميرا' : cap === 'microphone' ? 'الميكروفون' : 'مشاركة الشاشة';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    let hint = 'اسمح بالوصول عند مطالبة المتصفح ثم أعد المحاولة.';
    if (p.os === 'ios' || p.os === 'ipados') hint = `من إعدادات iPhone/iPad: Safari ← تسجيلات المواقع والإعدادات ← ${capLabel} ← «السؤال» أو «السماح»، وأعد تحميل الصفحة.`;
    else if (p.os === 'macos') hint = `من إعدادات النظام: الخصوصية والأمان ← ${capLabel} ← فعّل المتصفح، ثم أعد تشغيل التبويب.`;
    else if (p.os === 'android') hint = `من إعدادات الجهاز: التطبيقات ← المتصفح ← الأذونات ← ${capLabel} ← السماح.`;
    else hint = `انقر أيقونة القفل/الكاميرا في شريط العنوان ← إعدادات الموقع ← ${capLabel} ← السماح، ثم أعد التحميل.`;
    return { ok: false, error: name, friendlyMessage: `تم رفض إذن ${capLabel}.`, hint };
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return { ok: false, error: name, friendlyMessage: `لا يوجد جهاز ${capLabel} متاح لهذا المتصفح.`, hint: 'وصّل الكاميرا/الميكروفون ثم أعد المحاولة.' };
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return { ok: false, error: name, friendlyMessage: `${capLabel} مستخدم حالياً من تطبيق آخر (Zoom/Meet/تسجيل شاشة).`, hint: 'أغلق التطبيق الآخر ثم أعد المحاولة.' };
  }
  if (name === 'OverconstrainedError') {
    return { ok: false, error: name, friendlyMessage: 'الجهاز لا يدعم المواصفات المطلوبة للبث.', hint: 'سيتم التراجع تلقائياً عن القيود الصارمة.' };
  }
  if (name === 'SecurityError') {
    return { ok: false, error: name, friendlyMessage: 'المتصفح يمنع الوسائط لأن الصفحة ليست ضمن اتصال آمن.', hint: 'افتح الرابط عبر https:// فقط.' };
  }
  return { ok: false, error: name || 'UnknownError', friendlyMessage: `تعذر تشغيل ${capLabel}: ${e?.message || 'خطأ غير معروف'}`, hint: 'جرّب متصفحاً حديثاً (Chrome على أندرويد، Safari على آيفون).' };
};

/**
 * طلب كاميرا + ميكروفون وفق قيود متدرجة حسب المنصة:
 * على iOS نطلب الدقة الأساسية فقط (قيود frameRate العالية تفشل صامتة هناك)،
 * وعلى الجوال نطلب facingMode مناسباً. الطلب يتم دائماً استجابة لنقرة مستخدم.
 */
export async function requestCameraMic(profile = detectDeviceProfile()): Promise<{ stream?: MediaStream; outcome: PermissionOutcome }> {
  if (!profile.secureContext) {
    return { outcome: { ok: false, error: 'InsecureContext', friendlyMessage: 'البث المباشر يتطلب اتصالاً آمناً (HTTPS).', hint: 'استخدم رابط النشر الآمن.' } };
  }
  if (!profile.supportsUserMedia) {
    return { outcome: { ok: false, error: 'Unsupported', friendlyMessage: 'هذا المتصفح لا يدعم الكاميرا/الميكروفون.', hint: 'حدّث المتصفح أو استخدم Safari/Chrome.' } };
  }
  const video: MediaTrackConstraints = profile.isMobile
    ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    : { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
  const audio: MediaTrackConstraints = { echoCancellation: true, noiseSuppression: true };
  // محاولة أولى بالقيود الكاملة، ثم تراجع تلقائي بلا قيود إن فشل (Overconstrained)
  const attempts: MediaStreamConstraints[] = [
    { video, audio },
    { video: true, audio: true },
  ];
  let lastErr: any = null;
  for (const c of attempts) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(c);
      return { stream, outcome: { ok: true, friendlyMessage: 'تم منح الوصول للكاميرا والميكروفون.' } };
    } catch (e) {
      lastErr = e;
      if ((e as any)?.name === 'NotAllowedError' || (e as any)?.name === 'NotFoundError') break; // لا فائدة من إعادة المحاولة
    }
  }
  return { outcome: friendlyForError(lastErr, 'camera', profile) };
}

/**
 * طلب مشاركة الشاشة وفق واقع المنصة:
 * - iOS/iPadOS Safari: لا يدعم getDisplayMedia → رسالة صادقة + بديل، ولا زر وهمي.
 * - Android Chrome: مدعوم من الإصدارات الحديثة، مع صوت اختياري (فرض الصوت يفشل غالباً).
 * - Desktop: كامل مع خيار صوت التبويب/النظام.
 */
export async function requestScreenShare(profile = detectDeviceProfile()): Promise<{ stream?: MediaStream; outcome: PermissionOutcome }> {
  if (!profile.secureContext) {
    return { outcome: { ok: false, error: 'InsecureContext', friendlyMessage: 'مشاركة الشاشة تتطلب اتصالاً آمناً (HTTPS).', hint: 'استخدم رابط النشر الآمن.' } };
  }
  if (profile.os === 'ios') {
    return {
      outcome: {
        ok: false, error: 'UnsupportedByOS',
        friendlyMessage: 'نظام iOS لا يسمح لمتصفح Safari بمشاركة الشاشة من داخل صفحة ويب — هذه سياسة شركة Apple وليست عيباً في المنصة.',
        hint: 'البديل الفعلي: افتح نفس رابط الغرفة من حاسوب أو iPad (يدعم المشاركة) وشارك من هناك، أو استخدم بث الكاميرا من آيفون.',
      },
    };
  }
  if (!profile.supportsGetDisplayMedia) {
    return {
      outcome: {
        ok: false, error: 'Unsupported',
        friendlyMessage: 'متصفحك الحالي لا يدعم مشاركة الشاشة.',
        hint: profile.browser === 'webview'
          ? 'افتح الرابط في Chrome (أندرويد) أو Safari مباشرة — تطبيقات التواصل تمنع مشاركة الشاشة داخلها.'
          : 'استخدم نسخة حديثة من Chrome أو Edge أو Firefox.',
      },
    };
  }
  try {
    // الصوت اختياري تماماً: على أندرويد/كثير من setups رفض audio لا يجب أن يقتل المشاركة
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: profile.isMobile ? true : { frameRate: { ideal: 30 }, width: { ideal: 1920 } },
      audio: false,
      selfBrowserSurface: 'include',
      surfaceSwitching: 'include',
    } as DisplayMediaStreamOptions);
    const v = stream.getVideoTracks()[0];
    if (!v || v.readyState !== 'live') {
      stream.getTracks().forEach((t) => t.stop());
      return { outcome: { ok: false, error: 'EmptyStream', friendlyMessage: 'لم يختر المستخدم أي نافذة/شاشة للمشاركة.', hint: 'انقر «مشاركة» في النافذة المنبثقة بعد اختيار الشاشة.' } };
    }
    return { stream, outcome: { ok: true, friendlyMessage: 'تمت الموافقة على مشاركة الشاشة — البث يعمل الآن فعلياً.' } };
  } catch (e) {
    return { outcome: friendlyForError(e, 'screen', profile) };
  }
}

/** ملخص حالة كل القدرات لعرضه صادقاً في واجهة الغرفة قبل الدخول */
export async function capabilityReport(): Promise<Record<MediaCapability, { available: boolean; state: string; note: string }>> {
  const p = detectDeviceProfile();
  const camState = await queryPermissionState('camera');
  const micState = await queryPermissionState('microphone');
  return {
    camera: { available: p.supportsUserMedia && p.secureContext, state: camState, note: p.supportsUserMedia ? 'متاح — سيُطلب الإذن عند التشغيل' : 'غير مدعوم في هذا المتصفح' },
    microphone: { available: p.supportsUserMedia && p.secureContext, state: micState, note: p.supportsUserMedia ? 'متاح — سيُطلب الإذن عند التشغيل' : 'غير مدعوم في هذا المتصفح' },
    screen: {
      available: p.supportsGetDisplayMedia && p.secureContext,
      state: 'prompt',
      note: p.os === 'ios' ? 'iOS يمنع مشاركة الشاشة من المتصفح (سياسة النظام) — استخدم حاسوباً/IPad'
        : p.supportsGetDisplayMedia ? 'متاح — ستظهر نافذة اختيار النافذة/الشاشة'
        : 'هذا المتصفح لا يدعم مشاركة الشاشة',
    },
  };
}
