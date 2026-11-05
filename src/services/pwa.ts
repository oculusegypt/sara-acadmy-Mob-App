// pwa.ts — تسجيل Service Worker وإدارة زر/بانر "تثبيت التطبيق" (PWA)
// يستخدم workbox-window للتحقق الآمن من دعم المتصفح دون تنفيذ SW داخل صفحة المطور.
import { Workbox } from 'workbox-window';

let wb: Workbox | null = null;
let deferredPrompt: any = null;
const listeners = new Set<(canInstall: boolean) => void>();

export function initPWA(): void {
  if (typeof window === 'undefined') return;
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!('serviceWorker' in navigator) || !isSecure) return;

  wb = new Workbox('/sw.js', { scope: '/' });

  wb.addEventListener('installed', (event: any) => {
    // إذا كان أول تثبيت → نعيد التحميل لتفعيل التحكم الكامل
    if (event.isFirstServiceWorkerInstalled) {
      window.location.reload();
    } else if (event.isUpdate) {
      // تحديث جديد متاح: لا نُجبر المستخدم، نبلّغ المستمعين فقط
      notify('update');
    }
  });

  wb.register().catch(() => {
    wb = null;
  });

  // التقاط حدث beforeinstallprompt قبل أن تبتلعه المتصفحات القديمة
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    emit(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    emit(false);
  });

  // إن كان المستخدم شغّل التطبيق أصلاً كـ PWA فلا داعٍ للبانر
  const standalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (navigator as any).standalone === true;
  if (standalone) deferredPrompt = null;
}

export function canInstall(): boolean {
  return !!deferredPrompt;
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed' }));
  deferredPrompt = null;
  emit(false);
  return choice?.outcome === 'accepted' ? 'accepted' : 'dismissed';
}

export function onPWAState(cb: (canInstall: boolean) => void): () => void {
  listeners.add(cb);
  cb(canInstall());
  return () => listeners.delete(cb);
}

function emit(canInstall: boolean) {
  listeners.forEach((cb) => cb(canInstall));
}

type PWANotice = 'update';
function notify(kind: PWANotice) {
  window.dispatchEvent(new CustomEvent('pwa-notice', { detail: kind }));
}

/** إبقاء الشاشة يقظة أثناء الحصص المباشرة (مفيد للجوال) */
export async function keepAwake(on: boolean): Promise<void> {
  try {
    const st = (navigator as any).wakeLock;
    if (!st) return;
    if (on) await st.request('screen');
    else (window as any).__wakelock?.release?.();
  } catch {
    /* غير مدعوم — تجاهل بأمان */
  }
}
