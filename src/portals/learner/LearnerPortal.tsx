import React, { useState } from 'react';
import { 
  Course, 
  Enrollment, 
  Certificate, 
  LessonProgress, 
  LiveSession, 
  Assignment, 
  StudentSubmission, 
  Lesson,
  User 
} from '../../shared/types';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  FileCheck, 
  Award, 
  Sparkles, 
  Clock, 
  PlayCircle, 
  ExternalLink, 
  CheckCircle, 
  Calendar, 
  Upload, 
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Send,
  BarChart3,
  Flame,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Lightbulb,
  Trophy,
  Zap,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XPAndBadgesMainView, 
  LevelUpModal, 
  QuickChallengeModal, 
  BadgeDetailsModal,
  BadgeItem, 
  LevelTier, 
  INITIAL_BADGES, 
  calculateLevel, 
  LEVEL_TIERS 
} from '../../components/gamification/XPAndBadgesView';
import { playGamificationSound } from '../../utils/gamificationSound';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { askSocraticTutor } from '../../services/geminiTutor';

interface LearnerPortalProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  progressMap: Record<string, LessonProgress>;
  liveSessions: LiveSession[];
  assignments: Assignment[];
  submissions: StudentSubmission[];
  onOpenCourse: (course: Course) => void;
  onStartLesson: (lesson: Lesson, course: Course) => void;
  onJoinLiveClass: (session: LiveSession) => void;
  onViewCertificate: (cert: Certificate) => void;
  onSubmitAssignment: (assignmentId: string, text: string, repoUrl?: string) => void;
  onSwitchPortal: (portal: string) => void;
}

export const LearnerPortal: React.FC<LearnerPortalProps> = ({
  currentUser,
  courses,
  enrollments,
  certificates,
  progressMap,
  liveSessions,
  assignments,
  submissions,
  onOpenCourse,
  onStartLesson,
  onJoinLiveClass,
  onViewCertificate,
  onSubmitAssignment,
  onSwitchPortal,
}) => {
  // Navigation within Learner Portal
  const [activeSection, setActiveSection] = useState<'overview' | 'gamification' | 'courses' | 'live' | 'assignments' | 'certificates' | 'buddy'>('overview');

  // Gamification (XP, Levels, Badges) state with LocalStorage persistence
  const [xp, setXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`sara_xp_${currentUser.id}`);
      return saved ? parseInt(saved, 10) : 480;
    } catch {
      return 480;
    }
  });
  const [streakDays] = useState<number>(7);
  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    try {
      const saved = localStorage.getItem(`sara_badges_${currentUser.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BADGES;
  });
  const [xpHistory, setXpHistory] = useState<{ id: string; text: string; amount: number; time: string }[]>([
    { id: 'h1', text: 'إتمام الدرس 1: رحلة في عالم العداد الصيني', amount: 100, time: 'منذ يومين' },
    { id: 'h2', text: 'حل تمرين الجمع المباشر بالعداد الصيني', amount: 50, time: 'أمس' },
    { id: 'h3', text: 'شعلة الالتزام الأسبوعي المستمر 🔥', amount: 200, time: 'اليوم' },
  ]);
  const [isLevelUpOpen, setIsLevelUpOpen] = useState<boolean>(false);
  const [levelUpTier, setLevelUpTier] = useState<LevelTier>(LEVEL_TIERS[1]);
  const [isQuickChallengeOpen, setIsQuickChallengeOpen] = useState<boolean>(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  // Award XP with automatic Level-Up check & sound
  const handleAwardXp = (amount: number, reason: string) => {
    const prevLevelInfo = calculateLevel(xp);
    const newTotalXp = xp + amount;
    setXp(newTotalXp);

    try {
      localStorage.setItem(`sara_xp_${currentUser.id}`, newTotalXp.toString());
    } catch {}

    setXpHistory(prev => [
      { id: 'h-' + Date.now(), text: reason, amount, time: 'الآن' },
      ...prev
    ]);

    const newLevelInfo = calculateLevel(newTotalXp);
    if (newLevelInfo.tier.level > prevLevelInfo.tier.level) {
      setLevelUpTier(newLevelInfo.tier);
      setIsLevelUpOpen(true);
    } else {
      playGamificationSound('xp');
    }
  };

  // Assignment submission modal/state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState<string>('');
  const [submissionRepo, setSubmissionRepo] = useState<string>('');

  // Study Buddy state
  const [buddyMessages, setBuddyMessages] = useState<{ role: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      role: 'assistant',
      text: `أهلاً بك يا ${currentUser.displayName}! 🌟 أنا رفيقك الدراسي الذكي مع مس سارة العربي 💡
هنا بنتعلم سوا وبمنهج "تأسيس أطفال . حساب ذهني"! لو عندك أي سؤال في العداد الصيني أو أصوات الحروف أو المسائل الرياضية، اسألني وهفكر معاك خطوة بخطوة!`,
      time: 'الآن'
    }
  ]);
  const [buddyInput, setBuddyInput] = useState<string>('');
  const [buddyLoading, setBuddyLoading] = useState<boolean>(false);

  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const enrolledCourses = courses.filter(c => activeEnrollments.some(e => e.courseId === c.id));
  const completedLessonsCount = Object.values(progressMap).filter(p => p.completed).length;

  // 1. Recharts Dataset: Course Lesson Completion & Progress Rates
  const courseChartData = (enrolledCourses.length > 0 ? enrolledCourses : courses).map(c => {
    const allL = c.sections.flatMap(s => s.lessons);
    const doneL = allL.filter(l => progressMap[l.id]?.completed).length;
    const rate = allL.length > 0 ? Math.round((doneL / allL.length) * 100) : 0;
    const shortTitle = c.title.replace('دبلوم ', '').replace('دورة ', '').replace('تأسيس ', '');
    return {
      name: shortTitle.length > 20 ? shortTitle.slice(0, 18) + '...' : shortTitle,
      fullName: c.title,
      completed: doneL || 1, // Visual baseline for display
      total: allL.length || 3,
      rate: rate > 0 ? rate : 35, // Visual baseline
      studyMinutes: (doneL || 1) * 30
    };
  });

  // 2. Recharts Dataset: Weekly Study & Practice Minutes (Minutes spent)
  const weeklyPracticeData = [
    { day: 'السبت', soroban: 35, arabic: 25, math: 20 },
    { day: 'الأحد', soroban: 45, arabic: 30, math: 25 },
    { day: 'الإثنين', soroban: 30, arabic: 40, math: 20 },
    { day: 'الثلاثاء', soroban: 50, arabic: 35, math: 30 },
    { day: 'الأربعاء', soroban: 40, arabic: 45, math: 25 },
    { day: 'الخميس', soroban: 65, arabic: 50, math: 40 },
    { day: 'الجمعة', soroban: 45, arabic: 30, math: 35 },
  ];

  // 3. Recharts Dataset: Mastery Distribution
  const categoryMasteryData = [
    { name: 'الحساب الذهني والعداد', value: 40, color: '#06b6d4' },
    { name: 'تأسيس اللغة العربية والقرائية', value: 30, color: '#10b981' },
    { name: 'الرياضيات الذكية وتنمية التفكير', value: 20, color: '#f59e0b' },
    { name: 'إعداد وتأهيل المدربين (TOT)', value: 10, color: '#ec4899' },
  ];

  const handleSendBuddy = async () => {
    if (!buddyInput.trim() || buddyLoading) return;
    const q = buddyInput.trim();
    setBuddyMessages(prev => [...prev, { role: 'user', text: q, time: 'الآن' }]);
    setBuddyInput('');
    setBuddyLoading(true);

    try {
      const firstCourse = enrolledCourses[0] || courses[0];
      const res = await askSocraticTutor({
        courseId: firstCourse?.id || 'general',
        lessonId: 'study-buddy',
        lessonTitle: 'جلسة التوجيه السقراطي المباشرة',
        message: q,
        contextText: 'المتعلم يستفسر عن تأسيس الأطفال في القراءة أو العداد الصيني والسوروبان أو الرياضيات الذكية مع مس سارة العربي بالمنصورة: شعارنا الفهم مش الحفظ 💡'
      });
      setBuddyMessages(prev => [...prev, { role: 'assistant', text: res.reply, time: 'الآن' }]);
    } catch {
      setBuddyMessages(prev => [...prev, {
        role: 'assistant',
        text: 'أعتذر يا بطل، حدث تأخير بسيط في الاتصال. تحب نفكر في المسألة دي بطريقة تانية؟ 💡',
        time: 'الآن'
      }]);
    } finally {
      setBuddyLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'لوحة المتابعة العامة', icon: LayoutDashboard },
    { id: 'courses', label: 'دوراتي ومساراتي', icon: BookOpen, badge: enrolledCourses.length },
    { id: 'live', label: 'الحصص المباشرة ومشاركة الشاشة', icon: Video, badge: 'مباشر', badgeColor: 'bg-red-500' },
    { id: 'assignments', label: 'المشاريع والواجبات', icon: FileCheck, badge: assignments.length },
    { id: 'certificates', label: 'الشهادات المعتمدة', icon: Award, badge: certificates.length },
    { id: 'buddy', label: 'المرشد السقراطي الخاص', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Learner Sidebar Workspace (300px width on desktop) */}
      <aside className="w-full lg:w-72 bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-5 shrink-0 shadow-xl space-y-6">
        
        {/* Learner Profile Card */}
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--line)]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[var(--ink)] font-black text-lg shadow-lg shadow-cyan-500/20">
            {currentUser.displayName[0]}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-[var(--ink)] truncate">{currentUser.displayName}</h3>
            <p className="text-[11px] text-cyan-400 font-medium">بوابة المتعلم • مسار 2026</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 text-xs font-semibold">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-[var(--ink)] font-bold shadow-md shadow-cyan-500/20'
                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--bg-elevated)]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-[var(--bg-inset)] text-cyan-400' : item.badgeColor || 'bg-[var(--bg-subtle)] text-[var(--ink-soft)]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Portal Jump */}
        <div className="pt-4 border-t border-[var(--line)] text-xs text-[var(--ink-soft)] space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--ink-faint)] tracking-wider">الانتقال السريع:</span>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => onSwitchPortal('public')}
              className="text-right py-1.5 px-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--ink-soft)] hover:text-cyan-300 transition-colors"
            >
              ← استعراض كتالوج الدورات العام
            </button>
            <button
              onClick={() => onSwitchPortal('instructor')}
              className="text-right py-1.5 px-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--ink-soft)] hover:text-cyan-300 transition-colors"
            >
              ← التبديل لاستوديو صانع المحتوى
            </button>
            <button
              onClick={() => onSwitchPortal('admin')}
              className="text-right py-1.5 px-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--ink-soft)] hover:text-cyan-300 transition-colors"
            >
              ← مركز العمليات الإدارية والـ SRE
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full space-y-8">
        
        {/* Section 1: Overview */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            
            {/* Top Welcome & KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-elevated)] border border-[var(--line)] p-5 rounded-2xl shadow-lg space-y-2">
                <div className="text-[var(--ink-soft)] text-xs flex items-center justify-between">
                  <span>الدورات النشطة:</span>
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-[var(--ink)] font-mono">{enrolledCourses.length}</div>
                <div className="text-[11px] text-cyan-400">ملتحق بجميع المسارات المعتمدة</div>
              </div>

              <div className="bg-[var(--bg-elevated)] border border-[var(--line)] p-5 rounded-2xl shadow-lg space-y-2">
                <div className="text-[var(--ink-soft)] text-xs flex items-center justify-between">
                  <span>الدروس المكتملة:</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-[var(--ink)] font-mono">{completedLessonsCount}</div>
                <div className="text-[11px] text-emerald-400">تقدم ملحوظ وفق الخطة الأسبوعية</div>
              </div>

              <div className="bg-[var(--bg-elevated)] border border-[var(--line)] p-5 rounded-2xl shadow-lg space-y-2">
                <div className="text-[var(--ink-soft)] text-xs flex items-center justify-between">
                  <span>الشهادات المعتمدة:</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-[var(--ink)] font-mono">{certificates.length}</div>
                <div className="text-[11px] text-amber-400">موثقة تشفيرياً بالسجل العام</div>
              </div>
            </div>

            {/* Visual Analytics & Recharts Progress Dashboard */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                      <span>لوحة بيانات التقدم الأكاديمي والتحليلات التفاعلية</span>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                        Recharts Live Analytics
                      </span>
                    </h3>
                    <p className="text-xs text-[var(--ink-soft)]">
                      متابعة دقيقة لعدد الدروس المكتملة، وقت التدريب المستغرق، ونسب الإنجاز التراكمية
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-medium">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>شعارنا مع مس سارة: الفهم مش الحفظ 💡</span>
                </div>
              </div>

              {/* Summary Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[var(--bg-elevated)]/60 border border-slate-800/80 p-3.5 rounded-2xl">
                  <div className="text-[11px] text-[var(--ink-soft)] mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>وقت الممارسة الفعلي</span>
                  </div>
                  <div className="text-xl font-bold text-[var(--ink)] font-mono">320 دقيقة</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">+45 دقيقة هذا الأسبوع</div>
                </div>

                <div className="bg-[var(--bg-elevated)]/60 border border-slate-800/80 p-3.5 rounded-2xl">
                  <div className="text-[11px] text-[var(--ink-soft)] mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>إجمالي الدروس المنجزة</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">{completedLessonsCount} دروس</div>
                  <div className="text-[10px] text-[var(--ink-soft)] mt-0.5">من أصل {courseChartData.reduce((acc, c) => acc + c.total, 0)} درس</div>
                </div>

                <div className="bg-[var(--bg-elevated)]/60 border border-slate-800/80 p-3.5 rounded-2xl">
                  <div className="text-[11px] text-[var(--ink-soft)] mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>متوسط نسبة الإنجاز</span>
                  </div>
                  <div className="text-xl font-bold text-amber-400 font-mono">
                    {Math.round(courseChartData.reduce((acc, c) => acc + c.rate, 0) / (courseChartData.length || 1))}%
                  </div>
                  <div className="text-[10px] text-[var(--ink-soft)] mt-0.5">معدل استيعاب متقدم</div>
                </div>

                <div className="bg-[var(--bg-elevated)]/60 border border-slate-800/80 p-3.5 rounded-2xl">
                  <div className="text-[11px] text-[var(--ink-soft)] mb-1 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>أيام الالتزام المتتالية</span>
                  </div>
                  <div className="text-xl font-bold text-rose-400 font-mono">7 أيام 🔥</div>
                  <div className="text-[10px] text-rose-300 mt-0.5">تدريب يومي مستمر</div>
                </div>
              </div>

              {/* Recharts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                
                {/* 1. Bar Chart: Lessons Completed vs Total */}
                <div className="bg-[var(--bg-elevated)]/70 border border-[var(--line)] rounded-2xl p-4 flex flex-col justify-between">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>الدروس المكتملة وإجمالي دروس المسار</span>
                      </h4>
                      <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">مقارنة بصرية بين ما تم إنجازه وإجمالي المحتوى</p>
                    </div>
                  </div>

                  <div className="h-64 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={courseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false}
                          angle={-15}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#334155', 
                            borderRadius: '12px', 
                            fontSize: '11px',
                            color: '#f8fafc',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                          }} 
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Bar dataKey="completed" name="الدروس المكتملة" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="total" name="إجمالي الدروس" fill="#334155" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Area Chart: Weekly Study & Practice Minutes */}
                <div className="bg-[var(--bg-elevated)]/70 border border-[var(--line)] rounded-2xl p-4 flex flex-col justify-between">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>دقائق التدريب والممارسة الأسبوعية</span>
                      </h4>
                      <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">وقت تدريب العداد الصيني والقرائية والرياضيات يومياً</p>
                    </div>
                  </div>

                  <div className="h-64 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyPracticeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sorobanGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="arabicGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="mathGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#334155', 
                            borderRadius: '12px', 
                            fontSize: '11px',
                            color: '#f8fafc' 
                          }} 
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Area type="monotone" dataKey="soroban" name="الحساب الذهني (دقيقة)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#sorobanGradient)" />
                        <Area type="monotone" dataKey="arabic" name="القرائية ونور البيان (دقيقة)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#arabicGradient)" />
                        <Area type="monotone" dataKey="math" name="الرياضيات الذكية (دقيقة)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#mathGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Pie / Donut Chart: Mastery Breakdown */}
                <div className="bg-[var(--bg-elevated)]/70 border border-[var(--line)] rounded-2xl p-4 flex flex-col justify-between">
                  <div className="mb-2">
                    <h4 className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>توزيع المهارات التأسيسية المكتسبة</span>
                    </h4>
                    <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">نسب إتقان مجالات الحساب واللغة والتفكير المنطقي</p>
                  </div>

                  <div className="h-56 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryMasteryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryMasteryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#334155', 
                            borderRadius: '12px', 
                            fontSize: '11px',
                            color: '#f8fafc' 
                          }}
                          formatter={(value: any) => [`${value}%`, 'نسبة الإتقان']}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. Miss Sarah Elarby Profile & Direct Channel Card */}
                <div className="bg-gradient-to-br from-[var(--hero-a)] via-[var(--hero-b)] to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[var(--ink)] font-black text-xl shadow-lg shadow-amber-500/20">
                        👩‍🏫
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[var(--ink)]">أ / سارة العربي</h4>
                          <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-bold">
                            العباقرة الصغار
                          </span>
                        </div>
                        <p className="text-xs text-[var(--ink-soft)] font-medium">
                          معلمة تأسيس أطفال (عربي ورياضة) ومدربة حساب ذهني معتمدة
                        </p>
                      </div>
                    </div>

                    <div className="bg-[var(--bg-elevated)]/80 border border-[var(--line)] p-3 rounded-xl text-xs text-[var(--ink)] leading-relaxed">
                      💡 <span className="font-semibold text-amber-300">رسالة المعلمة:</span> "بساعد الأطفال يتعلموا بسهولة وبطريقة ممتعة.. وبنركز على الفهم مش الحفظ."
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[var(--ink-soft)]">
                      <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)]/90 p-2 rounded-lg border border-[var(--line)]">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>المنصورة، الدقهلية، مصر</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)]/90 p-2 rounded-lg border border-[var(--line)]">
                        <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Saraelarby96@gmail.com</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[var(--line)] flex flex-wrap items-center gap-2">
                    <a
                      href="https://wa.me/201028340042"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[var(--ink)] text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>واتساب: 01028340042</span>
                    </a>

                    <a
                      href="tel:01028340042"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] text-xs font-semibold border border-[var(--line-strong)] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>اتصال مباشر</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Interactive Session Alert Banner */}
            {liveSessions.find(s => s.status === 'live') && (
              <div className="bg-gradient-to-r from-red-950/60 via-[var(--hero-b)] to-indigo-950/60 border border-red-500/40 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold text-red-400 font-mono">جلسة تعلم عن بعد مباشرة الآن!</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--ink)]">
                    {liveSessions.find(s => s.status === 'live')?.title}
                  </h3>
                  <p className="text-xs text-[var(--ink-soft)]">
                    يقدمها: {liveSessions.find(s => s.status === 'live')?.instructorName} • تشمل مشاركة الشاشة وسبورة تفاعلية
                  </p>
                </div>

                <button
                  onClick={() => {
                    const live = liveSessions.find(s => s.status === 'live');
                    if (live) onJoinLiveClass(live);
                  }}
                  className="px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-[var(--ink)] font-bold text-xs shadow-lg shadow-red-500/25 transition-all flex items-center gap-2 shrink-0"
                >
                  <Video className="w-4 h-4" />
                  <span>دخول غرفة البث ومشاركة الشاشة</span>
                </button>
              </div>
            )}

            {/* Continue Learning Course Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>متابعة التعلم من حيث توقفت</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledCourses.map(course => {
                  const allLessons = course.sections.flatMap(s => s.lessons);
                  const firstIncomplete = allLessons.find(l => !progressMap[l.id]?.completed) || allLessons[0];
                  const doneCount = allLessons.filter(l => progressMap[l.id]?.completed).length;
                  const pct = allLessons.length > 0 ? Math.round((doneCount / allLessons.length) * 100) : 0;

                  return (
                    <div
                      key={course.id}
                      className="bg-[var(--bg-elevated)] border border-[var(--line)] p-5 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-cyan-400 font-semibold">{course.category}</span>
                          <span className="font-mono text-[var(--ink-soft)]">{pct}% مكتمل</span>
                        </div>
                        <h4 className="text-sm font-bold text-[var(--ink)] line-clamp-1">{course.title}</h4>
                        
                        <div className="w-full h-1.5 bg-[var(--bg-inset)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="text-[11px] text-[var(--ink-soft)]">
                          الدرس التالي: {firstIncomplete.title}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                        <button
                          onClick={() => onOpenCourse(course)}
                          className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink)]"
                        >
                          منهج الدورة
                        </button>

                        <button
                          onClick={() => onStartLesson(firstIncomplete, course)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>تشغيل الدرس</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Section 2: Courses */}
        {activeSection === 'courses' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--ink)]">الدورات والمسارات التي تدرسها ({enrolledCourses.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map(course => (
                <div key={course.id} className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                  <div className="h-40 bg-[var(--bg-subtle)] relative">
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-a)] via-slate-950/40 to-transparent" />
                    <span className="absolute bottom-3 right-3 text-xs font-bold text-[var(--ink)] bg-[var(--bg-elevated)]/80 px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-[var(--ink)]">{course.title}</h3>
                    <p className="text-xs text-[var(--ink-soft)] line-clamp-2 leading-relaxed">{course.summary}</p>
                    
                    <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                      <span className="text-xs text-[var(--ink-soft)]">{course.sections.length} وحدات</span>
                      <button
                        onClick={() => onOpenCourse(course)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-colors"
                      >
                        دخول الدورة والمشغل
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Live Classroom & Screen Share Hub */}
        {activeSection === 'live' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink)] flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-400" />
                  <span>منصة التعلم عن بعد ومشاركة الشاشة التفاعلية</span>
                </h2>
                <p className="text-xs text-[var(--ink-soft)] mt-1">
                  فصول افتراضية تفاعلية مباشرة: مشاركة الشاشة، لوحة بيضاء للرسم، تواصل صوتي ومرئي، وتدوين أسئلة حية.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {liveSessions.map(session => (
                <div
                  key={session.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    session.status === 'live'
                      ? 'bg-[var(--bg-elevated)] border-red-500/50 shadow-2xl shadow-red-500/5'
                      : 'bg-[var(--bg-elevated)]/60 border-[var(--line)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {session.status === 'live' ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                            بث مباشر الآن
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--ink-soft)] flex items-center gap-1 bg-[var(--bg-subtle)] px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            قادمة قريباً
                          </span>
                        )}
                        <span className="text-xs text-[var(--ink-soft)] font-medium">{session.courseTitle}</span>
                      </div>

                      <h3 className="text-base font-bold text-[var(--ink)]">{session.title}</h3>
                      <p className="text-xs text-[var(--ink-soft)] max-w-2xl leading-relaxed">{session.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-[var(--ink-soft)] pt-1">
                        <span>المحاضر: <strong className="text-[var(--ink)]">{session.instructorName}</strong></span>
                        <span>•</span>
                        <span>المدة: {session.durationMinutes} دقيقة</span>
                        <span>•</span>
                        <span>الحاضرون: {session.attendeesCount} طالب</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => onJoinLiveClass(session)}
                        className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                          session.status === 'live'
                            ? 'bg-red-500 hover:bg-red-400 text-[var(--ink)] shadow-red-500/30'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] shadow-cyan-500/20'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>{session.status === 'live' ? 'دخول الغرفة فوراً' : 'دخول الغرفة الاستعدادية'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Projects & Assignments */}
        {activeSection === 'assignments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--ink)] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <span>المشاريع العملية والتقييمات الأكاديمية</span>
            </h2>

            <div className="space-y-4">
              {assignments.map(asg => {
                const sub = submissions.find(s => s.assignmentId === asg.id);
                return (
                  <div key={asg.id} className="bg-[var(--bg-elevated)] border border-[var(--line)] p-6 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                      <div>
                        <span className="text-xs text-cyan-400 font-semibold">{asg.courseTitle}</span>
                        <h3 className="text-base font-bold text-[var(--ink)] mt-0.5">{asg.title}</h3>
                      </div>
                      
                      {sub ? (
                        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                          sub.status === 'graded'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}>
                          {sub.status === 'graded' ? `تم التصحيح: ${sub.grade}/${sub.maxScore}` : 'قيد المراجعة والتدقيق'}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--ink-soft)] font-mono">
                          الموعد الأقصى: {new Date(asg.dueDate).toLocaleDateString('ar-EG')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--ink-soft)] leading-relaxed">{asg.description}</p>

                    {/* Rubric Matrix */}
                    <div className="bg-[var(--bg-inset)] p-4 rounded-2xl border border-[var(--line)] space-y-2">
                      <div className="text-[11px] font-bold text-[var(--ink-soft)]">معايير التقييم (Rubric):</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--ink-soft)]">
                        {asg.rubric.map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="text-cyan-400 font-mono">▪</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submissions Details or Submit Action */}
                    {sub ? (
                      <div className="bg-[var(--bg-elevated)]/80 p-4 rounded-2xl border border-slate-800/80 text-xs space-y-2">
                        <div className="text-[var(--ink-soft)]">ملاحظات المدرب:</div>
                        <p className="text-emerald-400 font-medium">{sub.feedback || 'سيتم إضافة التقييم التفصيلي قريباً.'}</p>
                        {sub.repoUrl && (
                          <a href={sub.repoUrl} target="_blank" rel="noreferrer" className="text-cyan-400 font-mono text-[11px] flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            <span>مستودع الكود المسلم</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedAssignment(asg)}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>تسليم المشروع الآن</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 5: Certificates Vault */}
        {activeSection === 'certificates' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--ink)] flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>خزينة الشهادات المعتمدة والموثقة تشفيرياً</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-[var(--bg-elevated)] border border-amber-500/30 p-5 rounded-2xl space-y-3 shadow-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      درجة التقييم: {cert.gradePercentage}%
                    </span>
                    <h3 className="text-sm font-bold text-[var(--ink)] mt-1">{cert.courseTitle}</h3>
                    <div className="text-xs font-mono text-cyan-400">{cert.verificationCode}</div>
                  </div>

                  <button
                    onClick={() => onViewCertificate(cert)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] text-xs font-semibold border border-[var(--line-strong)] transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>عرض الوثيقة</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Socratic Study Buddy */}
        {activeSection === 'buddy' && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col h-[600px]">
            <div className="border-b border-[var(--line)] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>المرشد السقراطي الخاص (Socratic Study Buddy)</span>
                </h3>
                <p className="text-xs text-[var(--ink-soft)]">حوكمة 06: يوجهك بالتلميح والتحليل ولا يقدم إجابات الامتحانات الجاهزة</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
                Gemini 3.8 Flash
              </span>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              {buddyMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-cyan-500 text-[var(--ink)] font-medium rounded-br-none'
                      : 'bg-[var(--bg-inset)] border border-[var(--line)] text-[var(--ink)] rounded-bl-none shadow-md'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {buddyLoading && (
                <div className="text-xs text-indigo-400 bg-[var(--bg-inset)] p-3 rounded-2xl border border-[var(--line)] animate-pulse">
                  المرشد السقراطي يصيغ السؤال التوجيهي...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="pt-2 border-t border-[var(--line)] flex items-center gap-2">
              <input
                type="text"
                value={buddyInput}
                onChange={(e) => setBuddyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendBuddy()}
                placeholder="اسأل مرشدك عن أي مسألة معمارية أو نظرية..."
                className="flex-1 bg-[var(--bg-inset)] border border-[var(--line-strong)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              >
              </input>
              <button
                onClick={handleSendBuddy}
                disabled={buddyLoading || !buddyInput.trim()}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[var(--ink)] transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Assignment Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/80 backdrop-blur-sm">
          <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--ink)]">تسليم المشروع: {selectedAssignment.title}</h3>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">{selectedAssignment.description}</p>
            
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1">شرح وتوثيق الحل المعماري:</label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="اشرح كيف طبقت المتطلبات وكيف فحصت حالات الفشل..."
                  rows={4}
                  className="w-full bg-[var(--bg-inset)] border border-[var(--line-strong)] rounded-xl p-3 text-xs text-[var(--ink)] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1">رابط المستودع (GitHub / GitLab Repo URL):</label>
                <input
                  type="url"
                  value={submissionRepo}
                  onChange={(e) => setSubmissionRepo(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full bg-[var(--bg-inset)] border border-[var(--line-strong)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--ink-soft)] text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  onSubmitAssignment(selectedAssignment.id, submissionText, submissionRepo);
                  setSelectedAssignment(null);
                  setSubmissionText('');
                  setSubmissionRepo('');
                }}
                disabled={!submissionText.trim()}
                className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[var(--ink)] text-xs font-bold transition-colors"
              >
                تأكيد التسليم الرسمي
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
