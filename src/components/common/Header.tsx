import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  User as UserIcon,
  Home,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  Send,
  Phone,
  Moon,
  Sun,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { User } from '../../shared/types';

interface HeaderProps {
  activePortal: 'home' | 'courses' | 'library' | 'classroom' | 'learner' | 'instructor' | 'admin';
  onSelectPortal: (portal: 'home' | 'courses' | 'library' | 'classroom' | 'learner' | 'instructor' | 'admin') => void;
  currentUser: User | null;
  onLogout?: () => void;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePortal,
  onSelectPortal,
  currentUser,
  onLogout,
  onOpenBooking,
  onOpenAuth,
  theme,
  toggleTheme,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger glassmorphic transition once scrolled past 24px
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-close mobile drawer when window resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // فصل التخصصات: روابط لوحة المدرّب والإدارة تظهر فقط حسب دور المستخدم الفعلي (مصدره قاعدة البيانات)
  const role = currentUser?.role;
  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'courses', label: 'الكورسات', icon: BookOpen },
    { id: 'classroom', label: 'الحصص المباشرة', icon: Video, highlight: true },
    { id: 'library', label: 'المكتبة والشيتات', icon: FileText },
    ...(role === 'learner' ? [{ id: 'learner', label: 'بوابة الطالب', icon: GraduationCap }] : []),
    ...(role === 'instructor' ? [{ id: 'instructor', label: 'استوديو المعلمة', icon: GraduationCap }] : []),
    ...(role === 'admin' ? [
      { id: 'admin', label: 'لوحة الإدارة', icon: GraduationCap },
      { id: 'instructor', label: 'استوديو المعلمة', icon: GraduationCap },
    ] : []),
  ];

  // Completely transparent only when on Home page and at the very top (not scrolled) and mobile menu closed
  const isTransparent = activePortal === 'home' && !isScrolled && !mobileMenuOpen;

  return (
    <>
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out font-sans ${
          isTransparent 
            ? 'bg-transparent backdrop-blur-[12px] border-b border-transparent py-3.5 sm:py-4 shadow-none text-[var(--ink)]' 
            : 'bg-[color-mix(in_srgb,var(--ink)_85%,transparent)] dark:bg-[var(--bg-elevated)]/80 backdrop-blur-[12px] border-b border-slate-200/70 dark:border-[var(--line)] shadow-lg shadow-slate-900/5 dark:shadow-black/25 py-2.5 sm:py-3'
        }`}
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        dir="rtl"
      >
        {/* Subtle specular ambient glow on bottom edge when scrolled */}
        {!isTransparent && (
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14">
            
            {/* Brand Logo - Playful, Child-Friendly & Prestigious in Tajawal */}
            <div 
              onClick={() => {
                onSelectPortal('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer group shrink-0 select-none"
            >
              <div className="relative">
                {/* Glowing ring */}
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 rounded-2xl blur-[2px] opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 border border-amber-300/50 dark:border-[var(--line-strong)] flex items-center justify-center shadow-lg transform group-hover:scale-105 group-active:scale-95 transition-transform">
                  <span className="text-xl select-none" role="img" aria-label="أكاديمية سارة العربي">💡</span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-[var(--ink)] dark:text-[var(--ink)] group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors drop-shadow-sm font-sans">
                    أكاديمية سارة العربي
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    <span>تأسيس أطفال . حساب ذهني</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Center Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
              {navItems.map(item => {
                const isActive = activePortal === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectPortal(item.id as any)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      isActive 
                        ? 'text-amber-300 bg-amber-400/15 border border-amber-400/30 shadow-sm shadow-amber-400/10 font-black' 
                        : item.highlight 
                        ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' 
                        : 'text-[var(--ink-soft)] dark:text-[var(--ink)] hover:text-amber-700 dark:hover:text-[var(--ink)] hover:bg-amber-50 dark:hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] active:bg-amber-100 dark:active:bg-[color-mix(in_srgb,var(--ink)_15%,transparent)]'
                    }`}
                  >
                    {item.highlight && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                      </span>
                    )}
                    <span>{item.label}</span>
                    {item.highlight && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-md font-extrabold mr-0.5">
                        مباشر
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Action Buttons: Booking CTA, User Persona, Hamburger Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Real Light/Dark Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 shrink-0 ${
                  isTransparent
                    ? 'bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] border-white/25 text-[var(--ink)]'
                    : 'bg-[var(--bg-subtle)] dark:bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] dark:hover:bg-[var(--bg-inset)] border-slate-200 dark:border-[var(--line-strong)] text-[var(--ink)] dark:text-amber-300'
                }`}
                title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'العودة للوضع النهاري'}
                aria-label="تبديل الوضع الداكن والنهاري"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500 dark:text-amber-300" />}
              </button>

              {/* Kids & Parents CTA Button: Book Child Seat */}
              <button
                onClick={onOpenBooking}
                className="hidden sm:inline-flex px-4 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:via-orange-400 hover:to-amber-400 text-[var(--ink)] font-black rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 items-center gap-2 text-xs sm:text-sm transition-all transform hover:scale-105 active:scale-95 group"
              >
                <Sparkles className="w-4 h-4 fill-slate-950 group-hover:rotate-12 transition-transform" />
                <span>احجز مقعد طفلك 🎁</span>
              </button>

              {/* Mobile Compact Booking Button */}
              <button
                onClick={onOpenBooking}
                className="sm:hidden px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-[var(--ink)] font-black rounded-xl text-xs shadow-md shadow-amber-500/25 flex items-center gap-1 active:scale-95"
                title="احجز مقعد طفلك"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>حجز 🎁</span>
              </button>

              {/* User Account Menu — فصل اللوحات حسب الدور + تسجيل خروج حقيقي */}
              <div className="relative">
                {currentUser ? (
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-1.5 bg-[var(--bg-subtle)]/80 hover:bg-[var(--bg-inset)] active:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] border border-slate-200 dark:border-[var(--line-strong)] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--ink)] backdrop-blur-md transition-all shadow-sm"
                    title="حسابي واللوحات المتاحة حسب الدور"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                    <span className="hidden md:inline truncate max-w-[90px] font-bold">
                      {currentUser.displayName.split(' ')[0]}
                    </span>
                    <span className="text-[10px] bg-amber-400/25 text-amber-700 dark:text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-md font-mono font-bold">
                      {currentUser.role === 'learner' ? 'طالب' : currentUser.role === 'instructor' ? 'معلمة' : 'إدارة'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-xl text-xs shadow-md shadow-amber-500/25 hover:from-amber-500 hover:to-orange-600 transition-all"
                  >
                    دخول / تسجيل
                  </button>
                )}

                {currentUser && userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute left-0 lg:right-0 lg:left-auto top-full mt-2 w-64 z-50 bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-pop)] p-2 text-right" dir="rtl">
                      <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                        <p className="text-xs font-black text-[var(--ink)]">{currentUser.displayName}</p>
                        <p className="text-[10px] text-[var(--ink-faint)] truncate">{currentUser.email}</p>
                      </div>
                      {currentUser.role === 'learner' && (
                        <button onClick={() => { onSelectPortal('learner'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
                          <GraduationCap className="w-4 h-4 text-emerald-500" /> بوابة الطالب (دوراتي وتقدمي)
                        </button>
                      )}
                      {currentUser.role === 'instructor' && (
                        <button onClick={() => { onSelectPortal('instructor'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
                          <GraduationCap className="w-4 h-4 text-amber-500" /> استوديو المعلمة (كورساتي وحصصي)
                        </button>
                      )}
                      {currentUser.role === 'admin' && (
                        <>
                          <button onClick={() => { onSelectPortal('admin'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
                            <ShieldCheck className="w-4 h-4 text-purple-500" /> لوحة الإدارة والعمليات
                          </button>
                          <button onClick={() => { onSelectPortal('instructor'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
                            <GraduationCap className="w-4 h-4 text-amber-500" /> استوديو المعلمة
                          </button>
                        </>
                      )}
                      <button onClick={() => { onOpenAuth(); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
                        <UserIcon className="w-4 h-4" /> تبديل الحساب
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); onLogout?.(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-t border-[var(--line)] mt-1 pt-2.5">
                        <LogOut className="w-4 h-4" /> تسجيل الخروج
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-[var(--ink)] dark:text-[var(--ink)] bg-[var(--bg-subtle)]/80 dark:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[var(--bg-inset)] dark:hover:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] active:bg-[color-mix(in_srgb,var(--ink)_25%,transparent)] border border-slate-200 dark:border-[var(--line-strong)] rounded-xl transition-all shadow-sm"
                aria-label="فتح القائمة الرئيسية"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay and Navigation Menu (Matching Glassmorphism) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[var(--bg-elevated)]/80 backdrop-blur-md z-40 lg:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-Down Drawer Container */}
          <div 
            className="fixed top-16 inset-x-3 sm:inset-x-6 max-w-lg mx-auto z-50 lg:hidden bg-[color-mix(in_srgb,var(--ink)_95%,transparent)] dark:bg-[var(--bg-elevated)]/90 backdrop-blur-2xl backdrop-saturate-150 border border-slate-200 dark:border-[var(--line-strong)] rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.25)] p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 font-sans"
            dir="rtl"
          >
            {/* Header info inside drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💡</span>
                <div>
                  <h4 className="font-black text-[var(--ink)] dark:text-[var(--ink)] text-sm">أكاديمية سارة العربي</h4>
                  <p className="text-[11px] text-amber-300 font-medium">تأسيس أطفال . حساب ذهني</p>
                </div>
              </div>
            </div>

            {/* Portal navigation links */}
            <div className="grid grid-cols-1 gap-1.5">
              {navItems.map(item => {
                const isActive = activePortal === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectPortal(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold text-right transition-all ${
                      isActive 
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/35 shadow-sm' 
                        : 'text-[var(--ink)] dark:text-[var(--ink)] hover:bg-amber-50 dark:hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] active:bg-amber-100 dark:active:bg-[color-mix(in_srgb,var(--ink)_15%,transparent)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300' : 'bg-[var(--bg-subtle)] dark:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-[var(--ink-faint)] dark:text-[var(--ink-soft)]'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {item.highlight && (
                      <span className="text-[10px] bg-rose-500 text-[var(--ink)] px-2 py-0.5 rounded-full font-bold animate-pulse">
                        بث مباشر
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Action CTAs */}
            <div className="pt-3 border-t border-slate-200 dark:border-[var(--line)] space-y-2.5">
              <button
                onClick={toggleTheme}
                className="w-full py-2.5 px-3 bg-[var(--bg-subtle)] dark:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[var(--bg-inset)] dark:hover:bg-[color-mix(in_srgb,var(--ink)_15%,transparent)] border border-slate-200 dark:border-[var(--line)] text-[var(--ink)] dark:text-[var(--ink)] font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>{theme === 'light' ? 'تفعيل الوضع الداكن' : 'العودة للوضع النهاري'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>احجز اختبار تحديد مستوى مجاني لطفلك 🎁</span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href="https://wa.me/201028340042?text=السلام%20عليكم%20مس%20سارة،%20حابب%20استفسر%20عن%20تفاصيل%20الكورسات%20وحجز%20تقييم%20مستوى%20لطفلي"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>واتساب مس سارة</span>
                </a>

                <a
                  href="tel:01028340042"
                  className="py-2.5 px-3 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_15%,transparent)] border border-[var(--line)] text-[var(--ink)] font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  <span>اتصال 01028340042</span>
                </a>
              </div>
            </div>

          </div>
        </>
      )}
    </>
  );
};
