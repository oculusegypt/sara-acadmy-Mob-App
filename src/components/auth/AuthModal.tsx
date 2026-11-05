import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  Sliders, 
  ShieldCheck, 
  User as UserIcon, 
  Lock, 
  Mail, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { User, UserRole } from '../../shared/types';
import { registerAccount, loginAccount } from '../../services/liveApi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('learner');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // حسابات جاهزة حقيقية — تُنشأ مرة واحدة في قاعدة البيانات بكلمة مرور فعلية ثم تُستخدم للدخول الفعلي
  const seedAccounts = [
    {
      role: 'learner' as UserRole,
      title: 'حساب طالب / ولي أمر',
      name: 'أحمد بن فهد الدوسري (طالب 9 سنوات)',
      email: 'ahmed.student@orbit.learn',
      password: 'Orbit@2026',
      icon: GraduationCap,
      color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      desc: 'بوابة الطالب، التمارين، السوروبان، ولوحة قياس التقدم'
    },
    {
      role: 'instructor' as UserRole,
      title: 'حساب المعلمة / المدربة',
      name: 'أ / سارة العربي (المدربة المعتمدة)',
      email: 'Saraelarby96@gmail.com',
      password: 'Orbit@2026',
      icon: Sliders,
      color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      desc: 'إدارة الكورسات، الفصول المباشرة والشاشة، والمكتبة والشورتس'
    },
    {
      role: 'admin' as UserRole,
      title: 'حساب الإدارة والعمليات',
      name: 'إدارة المنصة المالية والتشغيلية',
      email: 'admin@orbit.learn',
      password: 'Orbit@2026',
      icon: ShieldCheck,
      color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      desc: 'مراجعة التحويلات، اعتماد الكورسات، وسجلات الأمان 2026'
    }
  ];

  const toUser = (u: { id: string; email: string; displayName: string; role: string }): User => ({
    id: u.id,
    displayName: u.displayName,
    email: u.email,
    role: u.role as UserRole,
    locale: 'ar'
  });

  const handleQuickLogin = async (acc: typeof seedAccounts[0]) => {
    setBusy(true);
    setFormError(null);
    try {
      // دخول حقيقي بكلمة المرور؛ إن لم يكن الحساب موجوداً يُنشأ فعلياً في قاعدة البيانات ثم يُستخدم
      let user;
      try {
        user = await loginAccount(acc.email, acc.password);
      } catch (e: any) {
        if (e?.error === 'NO_ACCOUNT') {
          user = await registerAccount(acc.name, acc.email, acc.role, acc.password);
        } else throw e;
      }
      onLoginSuccess(toUser(user));
      onClose();
    } catch (e: any) {
      setFormError(e?.message || 'تعذر تسجيل الدخول — تحقق من الاتصال');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'register' && !displayName.trim()) return;
    if (password.length < 6) { setFormError('كلمة المرور يجب ألا تقل عن 6 أحرف'); return; }
    setBusy(true);
    setFormError(null);
    try {
      const user = mode === 'register'
        ? await registerAccount(displayName.trim(), email, role, password)
        : await loginAccount(email, password);
      onLoginSuccess(toUser(user));
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'تعذر إتمام العملية — حاول مرة أخرى');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[var(--bg-elevated)]/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--line)] text-[var(--ink)] rounded-2xl shadow-2xl p-5 sm:p-8 my-6 text-right overflow-hidden font-sans"
        dir="rtl"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-60 h-28 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-[var(--ink)] mx-auto flex items-center justify-center text-2xl shadow-md shadow-amber-500/25 mb-2.5">
            💡
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
            {mode === 'login' ? 'تسجيل الدخول إلى المنصة' : 'إنشاء حساب جديد'}
          </h3>
          <p className="text-xs text-[var(--ink-soft)] mt-1">
            أكاديمية أ / سارة العربي للتعليم الذكي وتأسيس الأطفال
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-[var(--bg-elevated)]/90 p-1 rounded-xl grid grid-cols-3 gap-1 mb-5 border border-[var(--line)]">
          <button
            type="button"
            onClick={() => setRole('learner')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === 'learner'
                ? 'bg-amber-400 text-[var(--ink)] font-black shadow-sm'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>طالب</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('instructor')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === 'instructor'
                ? 'bg-amber-400 text-[var(--ink)] font-black shadow-sm'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>معلمة</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === 'admin'
                ? 'bg-amber-400 text-[var(--ink)] font-black shadow-sm'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>إدارة</span>
          </button>
        </div>

        {/* Quick Demo Switcher Cards */}
        <div className="mb-4 space-y-2">
          <span className="text-[11px] font-bold text-[var(--ink-soft)] block">
            دخول فوري مباشر للحسابات المجهزة:
          </span>
          <div className="space-y-1.5">
            {seedAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleQuickLogin(acc)}
                disabled={busy}
                className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between group ${
                  role === acc.role
                    ? 'border-amber-400/50 bg-[var(--bg-inset)] shadow-sm'
                    : 'border-[var(--line)] hover:border-[var(--line-strong)] bg-[var(--bg-elevated)]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${acc.color} flex items-center justify-center shrink-0`}>
                    <acc.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--ink)] block group-hover:text-amber-300 transition-colors">
                      {acc.name}
                    </span>
                    <span className="text-[10px] text-[var(--ink-soft)] block">{acc.desc}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md shrink-0">
                  دخول فوري
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--line)]" />
          </div>
          <div className="relative flex justify-center text-[10px] text-[var(--ink-soft)] font-bold">
            <span className="bg-[var(--bg-elevated)] px-3">أو المتابعة ببياناتك</span>
          </div>
        </div>

        {/* Standard Email / Password Form */}
        {formError && (
          <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-2">
            <X className="w-3.5 h-3.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">الاسم بالكامل:</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[var(--ink-soft)] absolute right-3 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="اسم المستخدم أو ولي الأمر"
                  className="w-full text-xs py-2.5 pr-9 pl-3 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">البريد الإلكتروني أو الهاتف:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--ink-soft)] absolute right-3 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com أو 010XXXXXXXX"
                className="w-full text-xs py-2.5 pr-9 pl-3 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">كلمة المرور:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--ink-soft)] absolute right-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs py-2.5 pr-9 pl-3 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-transform hover:scale-[1.01] active:scale-[0.99] mt-1 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {busy ? 'جارٍ التحقق من هويتك...' : (mode === 'login' ? 'دخول إلى حسابي' : 'إنشاء الحساب والتأكيد')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs text-amber-300 hover:text-amber-200 font-bold transition-colors"
          >
            {mode === 'login' ? 'ليس لديك حساب بعد؟ سجّل الآن كطالب أو معلمة' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
          </button>
        </div>

      </div>
    </div>
  );
};
