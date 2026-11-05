import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  ArrowUp
} from 'lucide-react';

interface FloatingActionControlsProps {
  onOpenBooking: () => void;
}

export const FloatingActionControls: React.FC<FloatingActionControlsProps> = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    /* Moved to the other side (right-4 sm:right-6) as requested by user */
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-center gap-2.5" dir="rtl">
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[var(--bg-elevated)]/90 hover:bg-[var(--bg-subtle)] text-[var(--ink)] shadow-xl border border-[var(--line)] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 backdrop-blur-md active:scale-95"
          aria-label="العودة للأعلى"
          title="العودة لأعلى الصفحة"
        >
          <ArrowUp className="w-4 h-4 text-amber-400" />
        </button>
      )}

      {/* Floating Direct Call Button */}
      <a
        href="tel:01028340042"
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[var(--bg-elevated)]/90 hover:bg-[var(--bg-subtle)] text-[var(--ink)] shadow-xl border border-[var(--line)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md group"
        title="اتصل بـ مس سارة العربي هاتفياً (01028340042)"
      >
        <Phone className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
      </a>

      {/* Floating WhatsApp Button with Authentic WhatsApp Icon & Internal Contained Pulse */}
      <div className="relative">
        
        {/* Tooltip positioned inwards to the left of the button so it never clips off-screen */}
        {showTooltip && (
          <div className="hidden sm:flex absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[var(--bg-elevated)]/95 text-[var(--ink)] text-xs font-bold py-2 px-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-right-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>مس سارة متصلة الآن 💡 تواصل معنا</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-[var(--ink-soft)] hover:text-[var(--ink)] text-[11px] mr-1 px-1 rounded hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]"
              aria-label="إغلاق التنبيه"
            >
              ✕
            </button>
          </div>
        )}

        <a
          href="https://wa.me/201028340042?text=السلام%20عليكم%20مس%20سارة%20العربي%20🌸%20أود%20الاستفسار%20عن%20برامج%20التأسيس%20والحساب%20الذهني%20وحجز%20تقييم%20لطفلي"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-400 text-[var(--ink)] shadow-2xl shadow-emerald-500/40 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group border border-emerald-300/30"
          title="تواصل مباشرة عبر واتساب مس سارة العربي"
        >
          {/* Authentic WhatsApp SVG Icon (Phone inside notched speech bubble) */}
          <svg 
            className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--ink)] fill-current drop-shadow-md group-hover:scale-110 transition-transform" 
            viewBox="0 0 24 24" 
            aria-hidden="true"
          >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.69 12.05 3.69C14.25 3.69 16.31 4.55 17.87 6.11C19.42 7.67 20.28 9.73 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15ZM16.57 14.33C16.32 14.21 15.1 13.61 14.88 13.53C14.65 13.44 14.49 13.4 14.32 13.65C14.16 13.89 13.69 14.45 13.55 14.61C13.4 14.77 13.26 14.79 13.01 14.67C12.76 14.54 11.97 14.28 11.03 13.45C10.3 12.8 9.8 12 9.66 11.75C9.52 11.51 9.65 11.37 9.77 11.25C9.88 11.14 10.02 10.96 10.14 10.82C10.27 10.68 10.31 10.57 10.39 10.41C10.47 10.25 10.43 10.1 10.37 9.98C10.31 9.86 9.82 8.65 9.61 8.16C9.42 7.68 9.21 7.74 9.06 7.73C8.92 7.73 8.76 7.72 8.59 7.72C8.43 7.72 8.16 7.78 7.94 8.02C7.71 8.27 7.08 8.86 7.08 10.06C7.08 11.26 7.96 12.42 8.08 12.58C8.21 12.74 9.8 15.19 12.24 16.24C12.82 16.49 13.27 16.64 13.62 16.75C14.2 16.94 14.74 16.91 15.16 16.85C15.63 16.78 16.61 16.26 16.81 15.69C17.02 15.12 17.02 14.63 16.96 14.53C16.9 14.42 16.82 14.45 16.57 14.33Z" />
          </svg>

          {/* Pulse element contained SAFELY INSIDE the button so it never clips off-screen */}
          <span className="absolute top-1.5 left-1.5 flex h-3 w-3 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border border-emerald-800" />
          </span>
        </a>
      </div>

    </div>
  );
};
