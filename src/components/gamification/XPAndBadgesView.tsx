import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  Zap, 
  Award, 
  Flame, 
  CheckCircle2, 
  Lock, 
  Star, 
  ChevronRight, 
  HelpCircle, 
  Share2, 
  ArrowUpRight, 
  RotateCcw,
  Check,
  X,
  Clock,
  Compass
} from 'lucide-react';
import { playGamificationSound } from '../../utils/gamificationSound';

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'soroban' | 'reading' | 'streak' | 'mastery' | 'community';
  categoryLabel: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progressText?: string;
  quoteByTeacher: string;
  color: string;
  borderColor: string;
}

export interface LevelTier {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  icon: string;
  badgeName: string;
  color: string;
  description: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    level: 1,
    title: 'مستكشف عبقري',
    minXp: 0,
    maxXp: 200,
    icon: '🌱',
    badgeName: 'وسام البداية الذكية',
    color: 'from-emerald-400 to-teal-500',
    description: 'الخطوة الأولى في عالم العداد الصيني والتعلم بالفهم والمرح'
  },
  {
    level: 2,
    title: 'بطل السوروبان الصغير',
    minXp: 200,
    maxXp: 500,
    icon: '🧮',
    badgeName: 'وسام العداد السريع',
    color: 'from-cyan-400 to-blue-500',
    description: 'إتقان حركات الخرزات بالسبابة والإبهام وعمليات الجمع والطرح المباشر'
  },
  {
    level: 3,
    title: 'فارس الحساب الذهني',
    minXp: 500,
    maxXp: 950,
    icon: '⚡',
    badgeName: 'وسام سرعة البرق',
    color: 'from-amber-400 to-orange-500',
    description: 'حساب تخيلي سريع (Anzan) بدون لمس العداد وبثقة فائقة'
  },
  {
    level: 4,
    title: 'نجم الفصاحة والقرائية',
    minXp: 950,
    maxXp: 1500,
    icon: '📖',
    badgeName: 'وسام البيان العربي',
    color: 'from-purple-400 to-indigo-500',
    description: 'طلاقة القراءة بنور البيان وتفوق في مخارج الحروف والمدود'
  },
  {
    level: 5,
    title: 'أستاذ المنطق والعبقرية',
    minXp: 1500,
    maxXp: 2200,
    icon: '🏆',
    badgeName: 'وسام المعلم الصغير',
    color: 'from-rose-400 to-pink-500',
    description: 'حل مسائل أصدقاء العدد 5 و10 المركبة ومساعدة الزملاء'
  },
  {
    level: 6,
    title: 'سفير الأكاديمية المتوج',
    minXp: 2200,
    maxXp: 3500,
    icon: '👑',
    badgeName: 'تاج النجوم الذهبي',
    color: 'from-amber-300 via-yellow-400 to-orange-500',
    description: 'المرتبة العليا في أكاديمية مس سارة العربي: قدوة لكل الأبطال'
  }
];

export const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'badge-soroban-starter',
    title: 'صانع معجزات العداد',
    description: 'إتمام أول 5 تمارين تفاعلية بالعداد الصيني وتحريك الخرزات بدقة',
    icon: '🧮',
    category: 'soroban',
    categoryLabel: 'العداد الصيني',
    xpReward: 100,
    unlocked: true,
    unlockedAt: 'منذ أسبوع',
    quoteByTeacher: 'حركتك للخرزات رشيقة جداً.. استمر وهتكون أسرع من الآلة الحاسبة! 💡',
    color: 'bg-cyan-500/10 text-cyan-400',
    borderColor: 'border-cyan-500/30'
  },
  {
    id: 'badge-flash-mind',
    title: 'سرعة البرق الذهنية',
    description: 'حل 3 مسائل حسابية تخيلية في أقل من 20 ثانية بدون العداد',
    icon: '⚡',
    category: 'soroban',
    categoryLabel: 'الحساب التخيلي',
    xpReward: 150,
    unlocked: true,
    unlockedAt: 'منذ 3 أيام',
    quoteByTeacher: 'خيالك واسع وعين عقلك شافت الخرزات بتتحرك بسرعة مذهلة! 🌟',
    color: 'bg-amber-500/10 text-amber-400',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'badge-reading-fluent',
    title: 'فصيح نور البيان',
    description: 'إتقان أصوات الحروف العربية والتمييز بين المدود والحركات القصيرة',
    icon: '📖',
    category: 'reading',
    categoryLabel: 'تأسيس القراءة',
    xpReward: 120,
    unlocked: true,
    unlockedAt: 'أمس',
    quoteByTeacher: 'صوتك الواضح ومخارج حروفك المتقنة تفرح قلب مس سارة! 💖',
    color: 'bg-emerald-500/10 text-emerald-400',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'badge-weekly-streak',
    title: 'شعلة الالتزام الأسبوعي',
    description: 'التدريب اليومي المستمر لمدة 7 أيام متتالية دون انقطاع',
    icon: '🔥',
    category: 'streak',
    categoryLabel: 'الالتزام والهمة',
    xpReward: 200,
    unlocked: true,
    unlockedAt: 'اليوم',
    quoteByTeacher: 'الاستمرار سر التفوق.. بطل حقيقي ملتزم بمستقبله! 🚀',
    color: 'bg-rose-500/10 text-rose-400',
    borderColor: 'border-rose-500/30'
  },
  {
    id: 'badge-zero-errors',
    title: 'الفهم أولاً',
    description: 'إكمال اختبار الوحدة التأسيسية بدون أي خطأ بالفهم والتركيز',
    icon: '💡',
    category: 'mastery',
    categoryLabel: 'الفهم والإتقان',
    xpReward: 120,
    unlocked: false,
    progressText: 'أكملت 80% من الاختبار التقييمي',
    quoteByTeacher: 'ركز على الفهم مش الحفظ وهتلاقي كل سؤال سهل وممتع! 💡',
    color: 'bg-amber-500/10 text-amber-400',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'badge-big-friends',
    title: 'قناص أصدقاء العدد 10',
    description: 'تطبيق قواعد الأصدقاء الكبار في مسائل الجمع والطرح المركبة',
    icon: '🎯',
    category: 'soroban',
    categoryLabel: 'العداد الصيني',
    xpReward: 180,
    unlocked: false,
    progressText: 'حللت 12 من 20 مسألة مركبة',
    quoteByTeacher: 'أصدقاء الـ 10 بيخلو الصعب سهل.. كمل تدريبك يا بطل! 🧮',
    color: 'bg-indigo-500/10 text-indigo-400',
    borderColor: 'border-indigo-500/30'
  },
  {
    id: 'badge-live-star',
    title: 'نجم الحصة التفاعلية',
    description: 'المشاركة الفعالة في الحصص المباشرة ومشاركة الشاشة مع مس سارة',
    icon: '🌟',
    category: 'community',
    categoryLabel: 'المشاركة الصفية',
    xpReward: 150,
    unlocked: false,
    progressText: 'احضر حصتك المباشرة القادمة',
    quoteByTeacher: 'مشاركتك في البث المباشر بتنور الفصل وتلهم أصحابك! 👩‍🏫',
    color: 'bg-teal-500/10 text-teal-400',
    borderColor: 'border-teal-500/30'
  },
  {
    id: 'badge-master-crown',
    title: 'التاج الذهبي للأكاديمية',
    description: 'الوصول للمستوى 5 وتخطي حاجز 1500 نقطة خبرة XP',
    icon: '👑',
    category: 'mastery',
    categoryLabel: 'الوسام الذهبي',
    xpReward: 500,
    unlocked: false,
    progressText: 'باقي نقاط للوصول للمستوى 5',
    quoteByTeacher: 'القمة تليق بأبطالنا.. وسام الشرف الأكبر في الأكاديمية! 🏆',
    color: 'bg-yellow-500/10 text-yellow-400',
    borderColor: 'border-yellow-500/30'
  }
];

export const calculateLevel = (xp: number) => {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXp) {
      const currentTier = LEVEL_TIERS[i];
      const nextTier = LEVEL_TIERS[i + 1] || null;
      const span = nextTier ? nextTier.minXp - currentTier.minXp : 1000;
      const currentInTier = xp - currentTier.minXp;
      const progressPct = Math.min(100, Math.max(0, Math.round((currentInTier / span) * 100)));
      const xpNeeded = nextTier ? nextTier.minXp - xp : 0;
      return {
        tier: currentTier,
        nextTier,
        progressPct,
        xpNeeded
      };
    }
  }
  return {
    tier: LEVEL_TIERS[0],
    nextTier: LEVEL_TIERS[1],
    progressPct: 0,
    xpNeeded: 200
  };
};

// MINI CHALLENGE QUESTIONS FOR TESTING & INSTANT XP
export const MINI_CHALLENGES = [
  {
    id: 'mc-1',
    category: 'حساب ذهني بالعداد',
    question: 'في العداد الصيني، كم تساوي قيمة خرزة السماء العلوية الواحدة؟',
    options: ['1', '5', '10', '0'],
    correctIndex: 1,
    xpReward: 50,
    hint: 'فوق العارضة الفاصلة توجد خرزة واحدة تمثل رقم اليد كاملة ✋'
  },
  {
    id: 'mc-2',
    category: 'الجمع المباشر',
    question: 'احسب ذهنياً بحركة الأصابع: 12 + 15 = ؟',
    options: ['25', '27', '28', '29'],
    correctIndex: 1,
    xpReward: 50,
    hint: 'اجمع الآحاد (2 + 5 = 7) والعشرات (1 + 1 = 2) فيكون الناتج 27'
  },
  {
    id: 'mc-3',
    category: 'تأسيس نور البيان',
    question: 'ما هي حركة حرف الميم في كلمة (مِصْبَاح)؟',
    options: ['فتحة (مَ)', 'كسرة (مِ)', 'ضمة (مُ)', 'سكون (مْ)'],
    correctIndex: 1,
    xpReward: 60,
    hint: 'نكسر الفم للأسفل عند نطق الحرف: مِـ'
  },
  {
    id: 'mc-4',
    category: 'أصدقاء العدد 5',
    question: 'صديق العدد 3 الصغير في العدد 5 هو: (5 - 3 = ؟)',
    options: ['1', '2', '4', '0'],
    correctIndex: 1,
    xpReward: 50,
    hint: 'إذا كان معك 3، كم خرزة تحتاج لتصل إلى 5؟'
  },
  {
    id: 'mc-5',
    category: 'حساب سريع تخيلي',
    question: 'احسب بسرعة في عقلك: 35 + 24 = ؟',
    options: ['57', '58', '59', '61'],
    correctIndex: 2,
    xpReward: 70,
    hint: '30 + 20 = 50، و 5 + 4 = 9، المجموع 59!'
  }
];

// -------------------------------------------------------------
// COMPONENT 1: LEVEL UP CELEBRATION MODAL (Framed with Framer Motion)
// -------------------------------------------------------------
export const LevelUpModal: React.FC<{
  isOpen: boolean;
  tier: LevelTier;
  onClose: () => void;
  earnedXp: number;
}> = ({ isOpen, tier, onClose, earnedXp }) => {
  useEffect(() => {
    if (isOpen) {
      playGamificationSound('levelUp');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate 24 floating particles with random angles
  const particles = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * 2 * Math.PI;
    const distance = 120 + Math.random() * 90;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const size = 12 + Math.random() * 16;
    const emojis = ['⭐', '🌟', '✨', '🎉', '🏆', '💎', '💡'];
    const emoji = emojis[i % emojis.length];
    return { id: i, x, y, size, emoji };
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/85 backdrop-blur-md overflow-hidden select-none" dir="rtl">
        {/* Background Radial Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.4, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-yellow-300/30 blur-3xl pointer-events-none"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.6, y: 50, opacity: 0, rotate: -3 }}
          animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="relative max-w-md w-full bg-[var(--bg-elevated)] border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(245,158,11,0.25)] text-center space-y-6 overflow-visible"
        >
          {/* Confetti & Particle Burst */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: [1, 1, 0],
                scale: [0, 1.4, 0.8],
                rotate: [0, Math.random() * 360]
              }}
              transition={{
                duration: 1.6 + Math.random() * 0.6,
                ease: 'easeOut',
                delay: 0.1
              }}
              className="absolute top-1/2 left-1/2 pointer-events-none text-xl z-20"
              style={{ fontSize: `${p.size}px` }}
            >
              {p.emoji}
            </motion.div>
          ))}

          {/* Glowing Trophy Icon with continuous bounce */}
          <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
            {/* Animated Pulsing Ring */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.6, 0.2, 0.6]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 blur-xl"
            />

            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [-2, 2, -2]
              }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-400 p-0.5 shadow-2xl flex items-center justify-center"
            >
              <div className="w-full h-full bg-[var(--bg-elevated)]/90 rounded-[22px] flex items-center justify-center text-5xl">
                {tier.icon}
              </div>
            </motion.div>

            {/* Level Badge Pip */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[var(--ink)] font-black text-xs shadow-md border border-[var(--line-strong)]"
            >
              المستوى {tier.level}
            </motion.div>
          </div>

          {/* Level Up Announcement */}
          <div className="space-y-2">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ترقية استثنائية جديدة! 🎉</span>
            </motion.div>

            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-2xl sm:text-3xl font-black text-[var(--ink)]"
            >
              ألف مبروك يا بطل! 🌟
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm font-bold text-amber-300"
            >
              لقب جديد: {tier.title} ({tier.badgeName})
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-[var(--ink-soft)] max-w-xs mx-auto leading-relaxed"
            >
              {tier.description}
            </motion.p>
          </div>

          {/* XP Rewards summary box */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-4 rounded-2xl bg-[var(--bg-elevated)]/70 border border-[var(--line)] flex items-center justify-around text-xs"
          >
            <div className="text-center">
              <span className="text-[var(--ink-soft)] text-[11px] block">إجمالي النقاط</span>
              <span className="text-lg font-black text-amber-400 font-mono">+{earnedXp} XP</span>
            </div>
            <div className="w-px h-8 bg-[var(--bg-subtle)]" />
            <div className="text-center">
              <span className="text-[var(--ink-soft)] text-[11px] block">المستوى الحالي</span>
              <span className="text-lg font-black text-emerald-400 font-mono">Level {tier.level}</span>
            </div>
            <div className="w-px h-8 bg-[var(--bg-subtle)]" />
            <div className="text-center">
              <span className="text-[var(--ink-soft)] text-[11px] block">هدية مس سارة</span>
              <span className="text-lg font-black text-cyan-400">وسام فخري 🏅</span>
            </div>
          </motion.div>

          {/* Claim Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playGamificationSound('click');
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>استلام الجائزة ومواصلة التدريب 🚀</span>
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// -------------------------------------------------------------
// COMPONENT 2: QUICK CHALLENGE MODAL (Solve & Earn Instant XP)
// -------------------------------------------------------------
export const QuickChallengeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAwardXp: (amount: number, reason: string) => void;
}> = ({ isOpen, onClose, onAwardXp }) => {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setChallengeIndex(Math.floor(Math.random() * MINI_CHALLENGES.length));
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = MINI_CHALLENGES[challengeIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setIsCorrect(true);
      playGamificationSound('correct');
      onAwardXp(currentQ.xpReward, `إجابة صحيحة في ${currentQ.category}`);
    } else {
      setIsCorrect(false);
      playGamificationSound('click');
    }
  };

  const handleNextChallenge = () => {
    const nextIdx = (challengeIndex + 1) % MINI_CHALLENGES.length;
    setChallengeIndex(nextIdx);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/80 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-lg w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                ⚡
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <span>تحدي كسب XP السريع</span>
                  <span className="text-[10px] bg-amber-400/15 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                    +{currentQ.xpReward} XP
                  </span>
                </h3>
                <p className="text-xs text-[var(--ink-soft)]">{currentQ.category}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[var(--bg-subtle)] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Question Text */}
          <div className="bg-[var(--bg-elevated)]/70 border border-slate-800/80 p-5 rounded-2xl text-center space-y-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">سؤال التحدي:</span>
            <p className="text-base sm:text-lg font-bold text-[var(--ink)] leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isRight = idx === currentQ.correctIndex;

              let btnStyle = 'bg-[var(--bg-inset)] border-[var(--line)] text-[var(--ink)] hover:border-amber-400/40 hover:bg-[var(--bg-elevated)]/60';
              if (isAnswered) {
                if (isRight) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                } else if (isSelected && !isRight) {
                  btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold';
                } else {
                  btnStyle = 'bg-[var(--bg-elevated)]/50 border-[var(--line)] text-[var(--ink-faint)] opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isRight && <Check className="w-4 h-4 text-emerald-400" />}
                  {isAnswered && isSelected && !isRight && <X className="w-4 h-4 text-rose-400" />}
                </button>
              );
            })}
          </div>

          {/* Feedback & Hint Banner */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCorrect ? '🎉 إجابة عبقرية وصحيحة!' : '💡 حاول مرة أخرى ولا تقلق!'}
              </div>
              <p className="text-[var(--ink-soft)] leading-relaxed">
                {currentQ.hint}
              </p>
            </motion.div>
          )}

          {!isAnswered && (
            <div className="flex items-center justify-between text-xs text-[var(--ink-soft)] pt-1">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'إخفاء التلميح' : 'محتاج تلميح مس سارة؟'}</span>
              </button>

              <span className="text-[11px] text-[var(--ink-faint)] font-mono">اختر الإجابة لكسب النقاط فوراً</span>
            </div>
          )}

          {showHint && !isAnswered && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed">
              💡 {currentQ.hint}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink-soft)] text-xs font-semibold"
            >
              إغلاق
            </button>

            {isAnswered && (
              <button
                onClick={handleNextChallenge}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <span>تحدٍ آخر (+XP)</span>
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// -------------------------------------------------------------
// COMPONENT 3: BADGE DETAILS INSPECTOR MODAL
// -------------------------------------------------------------
export const BadgeDetailsModal: React.FC<{
  badge: BadgeItem | null;
  onClose: () => void;
}> = ({ badge, onClose }) => {
  if (!badge) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/80 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-sm w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 shadow-2xl text-center space-y-5"
        >
          {/* Big Badge Icon with Radial Glow */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${badge.unlocked ? 'bg-amber-400' : 'bg-[var(--bg-inset)]'}`} />
            <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-2 ${
              badge.unlocked 
                ? 'bg-gradient-to-tr from-amber-400/20 to-orange-500/20 border-amber-400/50' 
                : 'bg-[var(--bg-inset)] border-[var(--line)] opacity-60 grayscale'
            }`}>
              {badge.icon}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-lg font-black text-[var(--ink)]">{badge.title}</h3>
              {badge.unlocked ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  مكتمل 🌟
                </span>
              ) : (
                <span className="text-[10px] bg-[var(--bg-subtle)] text-[var(--ink-soft)] border border-[var(--line-strong)] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <Lock className="w-2.5 h-2.5" />
                  قيد الإنجاز
                </span>
              )}
            </div>
            <p className="text-xs text-amber-300 font-medium">{badge.categoryLabel}</p>
          </div>

          <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
            {badge.description}
          </p>

          {/* Teacher Sara's Encouraging Quote */}
          <div className="bg-[var(--bg-elevated)]/80 border border-amber-400/20 p-3.5 rounded-2xl text-xs text-amber-200 text-right space-y-1">
            <span className="text-[10px] text-amber-400 font-bold block">👩‍🏫 كلمة تشجيعية من مس سارة العربي:</span>
            <p className="italic leading-relaxed">"{badge.quoteByTeacher}"</p>
          </div>

          {/* Reward Details */}
          <div className="p-3 bg-[var(--bg-inset)] rounded-2xl border border-[var(--line)] flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--ink-soft)]">مكافأة الوسام:</span>
            <span className="text-amber-400 font-bold">+{badge.xpReward} XP</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// -------------------------------------------------------------
// COMPONENT 4: FULL DEDICATED XP & BADGES ARENA (Tab View)
// -------------------------------------------------------------
export const XPAndBadgesMainView: React.FC<{
  xp: number;
  streakDays: number;
  badges: BadgeItem[];
  history: { id: string; text: string; amount: number; time: string }[];
  onOpenQuickChallenge: () => void;
  onSelectBadge: (b: BadgeItem) => void;
}> = ({ xp, streakDays, badges, history, onOpenQuickChallenge, onSelectBadge }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const levelInfo = calculateLevel(xp);

  const filteredBadges = badges.filter(b => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-8 select-none" dir="rtl">
      
      {/* Hero Level Banner with Glassmorphism and Animated Progress */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--hero-b)] via-indigo-950/40 to-[var(--hero-c)] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Avatar and Current Tier Title */}
          <div className="flex items-center gap-4 text-right w-full md:w-auto">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-400 p-1 shadow-xl shrink-0"
            >
              <div className="w-full h-full bg-[var(--bg-inset)] rounded-[20px] flex items-center justify-center text-4xl sm:text-5xl">
                {levelInfo.tier.icon}
              </div>
              <span className="absolute -bottom-2 -left-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-[var(--ink)] font-black text-[11px] shadow">
                Lv {levelInfo.tier.level}
              </span>
            </motion.div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  المستوى {levelInfo.tier.level}: {levelInfo.tier.title}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                  <Flame className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{streakDays} أيام التزام 🔥</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-[var(--ink)]">
                {levelInfo.tier.badgeName}
              </h2>

              <p className="text-xs text-[var(--ink-soft)] max-w-md leading-relaxed">
                {levelInfo.tier.description}
              </p>
            </div>
          </div>

          {/* Quick Challenge CTA Button */}
          <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onOpenQuickChallenge}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-black text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>تحدي حساب ذهني سريع (+50 XP) ⚡</span>
            </button>
          </div>

        </div>

        {/* Level XP Progress Bar with Motion */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[var(--ink)] font-bold text-sm">{xp} XP</span>
              <span className="text-[var(--ink-soft)]">/ {levelInfo.nextTier ? levelInfo.nextTier.minXp : 3500} XP</span>
            </div>

            <span className="text-amber-300 font-bold text-xs">
              {levelInfo.nextTier 
                ? `متبقي ${levelInfo.xpNeeded} XP للوصول إلى المستوى ${levelInfo.nextTier.level} (${levelInfo.nextTier.title})`
                : 'وصلت إلى قمة المراتب الأكاديمية! 👑'}
            </span>
          </div>

          {/* Animated Bar */}
          <div className="relative w-full h-4 bg-[var(--bg-inset)] rounded-full overflow-hidden p-0.5 border border-[var(--line)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progressPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-orange-500 relative"
            >
              {/* Shimmer animation highlight */}
              <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] animate-pulse rounded-full" />
            </motion.div>
          </div>
        </div>

      </div>

      {/* Levels Road Map (Interactive Path from Lv 1 to Lv 6) */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-[var(--ink)]">خريطة مراتب العباقرة (Levels Road)</h3>
          </div>
          <span className="text-xs text-[var(--ink-soft)] font-mono">
            المستوى {levelInfo.tier.level} من {LEVEL_TIERS.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEVEL_TIERS.map(tier => {
            const isCompleted = xp >= tier.maxXp;
            const isCurrent = levelInfo.tier.level === tier.level;
            const isLocked = xp < tier.minXp;

            return (
              <motion.div
                key={tier.level}
                whileHover={{ y: -3 }}
                className={`relative p-4 rounded-2xl border transition-all text-center space-y-2 ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10'
                    : isCompleted
                    ? 'bg-[var(--bg-elevated)]/80 border-emerald-500/30'
                    : 'bg-[var(--bg-elevated)]/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="text-3xl mx-auto">{tier.icon}</div>
                <div className="font-bold text-xs text-[var(--ink)] truncate">{tier.title}</div>
                <div className="text-[10px] text-[var(--ink-soft)] font-mono">{tier.minXp} XP</div>

                {isCurrent && (
                  <span className="inline-block text-[9px] bg-amber-400 text-[var(--ink)] font-black px-2 py-0.5 rounded-full">
                    مستواك الحالي ⭐
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-block text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    مكتمل ✓
                  </span>
                )}
                {isLocked && (
                  <span className="inline-block text-[9px] text-[var(--ink-faint)] font-mono">
                    مقفل 🔒
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Badges Vault Section */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        
        {/* Badges Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
              🏆
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <span>خزينة الأوسمة والشهادات التقديرية</span>
                <span className="text-xs bg-[var(--bg-subtle)] text-amber-300 font-mono px-2 py-0.5 rounded-md">
                  {unlockedCount} / {badges.length}
                </span>
              </h3>
              <p className="text-xs text-[var(--ink-soft)]">
                أوسمة تكريمية مميزة تمنحها المعلمة سارة العربي لتقدير التميز والاجتهاد
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-inset)] p-1 rounded-2xl border border-[var(--line)] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === 'all' ? 'bg-amber-400 text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              جميع الأوسمة ({badges.length})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === 'unlocked' ? 'bg-amber-400 text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              المكتسبة 🌟 ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === 'locked' ? 'bg-amber-400 text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              قيد الإنجاز 🔒 ({badges.length - unlockedCount})
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBadges.map(badge => (
            <motion.div
              key={badge.id}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => onSelectBadge(badge)}
              className={`cursor-pointer p-5 rounded-2xl border transition-all text-center space-y-3 relative group flex flex-col justify-between ${
                badge.unlocked
                  ? 'bg-[var(--bg-elevated)]/80 border-amber-400/30 hover:border-amber-400 shadow-lg'
                  : 'bg-[var(--bg-elevated)]/40 border-[var(--line)] opacity-60 hover:opacity-90'
              }`}
            >
              {/* Category pill */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[var(--ink-soft)]">{badge.categoryLabel}</span>
                <span className="text-amber-400 font-mono font-bold">+{badge.xpReward} XP</span>
              </div>

              {/* Big Icon */}
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                {badge.unlocked && (
                  <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md group-hover:blur-lg transition-all" />
                )}
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                  badge.unlocked ? 'bg-[var(--bg-elevated)] border border-amber-400/40' : 'bg-[var(--bg-elevated)] border border-[var(--line)] grayscale'
                }`}>
                  {badge.icon}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--ink)] group-hover:text-amber-300 transition-colors">
                  {badge.title}
                </h4>
                <p className="text-[11px] text-[var(--ink-soft)] line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Footer status */}
              <div className="pt-2 border-t border-[var(--line)] flex items-center justify-center text-[10px]">
                {badge.unlocked ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مكتسب ({badge.unlockedAt})</span>
                  </span>
                ) : (
                  <span className="text-[var(--ink-faint)] font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>{badge.progressText || 'مقفل'}</span>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Recent XP Activity Log */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-[var(--ink)]">سجل نقاط الخبرة (XP Activity Feed)</h3>
          </div>
          <span className="text-xs text-[var(--ink-soft)] font-mono">آخر التمارين المكتملة</span>
        </div>

        <div className="space-y-2">
          {history.slice(0, 5).map(item => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[var(--bg-elevated)]/70 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-bold">
                  ⚡
                </span>
                <span className="text-[var(--ink)] font-medium">{item.text}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-mono font-bold">+{item.amount} XP</span>
                <span className="text-[10px] text-[var(--ink-faint)]">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
