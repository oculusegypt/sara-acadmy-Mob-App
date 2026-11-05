// InstallPrompt.tsx — بانر/زر "تثبيت التطبيق" يظهر فقط عندما يكون التثبيت ممكناً
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { canInstall, promptInstall, onPWAState } from '../../services/pwa';

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa_banner_dismissed') === '1');

  useEffect(() => {
    const off = onPWAState((ok) => setVisible(ok && !sessionStorage.getItem('pwa_banner_dismissed')));
    return off;
  }, []);

  if (!visible || dismissed || !canInstall()) return null;

  const close = () => {
    sessionStorage.setItem('pwa_banner_dismissed', '1');
    setDismissed(true);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 z-[90] mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white">
          <Download size={20} />
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-extrabold text-[var(--fg)]">ثبّت تطبيق الأكاديمية</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
            افتح الحصص المباشرة والمكتبة كتطبيق مستقل على جهازك — أسرع وأخفّ من المتصفح.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => promptInstall()}
              className="rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
            >
              تثبيت الآن
            </button>
            <button
              onClick={close}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-2)]"
            >
              لاحقاً
            </button>
          </div>
        </div>
        <button onClick={close} aria-label="إغلاق" className="text-[var(--muted)] hover:text-[var(--fg)]">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
