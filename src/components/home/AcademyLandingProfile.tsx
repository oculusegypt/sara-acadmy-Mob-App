import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Star,
  BookOpen,
  Video,
  Phone,
  Mail,
  MapPin,
  Send,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  Monitor,
  PenTool,
  Users,
  Radio,
  Download,
  ThumbsUp,
  Palette,
  Moon,
  Sun
} from 'lucide-react';
import { Course } from '../../shared/types';
import { MentalMathChallenge } from './MentalMathChallenge';
import { LibraryBook } from '../library/data';

interface AcademyLandingProfileProps {
  courses: Course[];
  libraryBooks: LibraryBook[];
  onOpenBookingModal: (course?: Course) => void;
  onOpenCourse: (course: Course) => void;
  onOpenLibrary: () => void;
  onOpenClassroom: () => void;
  onOpenAuth: () => void;
  onOpenPortal: (portal: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const AcademyLandingProfile: React.FC<AcademyLandingProfileProps> = ({
  courses,
  libraryBooks,
  onOpenBookingModal,
  onOpenCourse,
  onOpenLibrary,
  onOpenClassroom,
  onOpenPortal,
  theme,
  toggleTheme,
}) => {
  // Hero Slide State
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      badge: 'تأسيس أطفال • حساب ذهني',
      title: 'الحساب الذهني والسوروبان للأطفال',
      highlight: 'سرعة خارقة وتركيز مضاعف بالعداد الصيني',
      description: 'نساعد طفلك من سن 6 إلى 14 سنة على إجراء العمليات الحسابية المعقدة في ثوانٍ معدودة بدون ورقة أو آلة حاسبة، مع تنمية نصفي الدماغ وحب مادة الرياضيات.',
      image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1920&q=85',
      actionText: 'احجز تقييم مستوى مجاني لطفلك 🎁',
      tag: 'الأكثر تميزاً للأطفال'
    },
    {
      id: 2,
      badge: 'تأسيس أطفال • حساب ذهني',
      title: 'تأسيس القراءة والكتابة والقرائية',
      highlight: 'من الحرف الأول إلى طلاقة القراءة بنور البيان',
      description: 'منهج مرح ومبتكر للأطفال من سن 4 إلى 9 سنوات للتغلب على صعوبات القراءة وتعديل مخارج الحروف وبناء حب القراءة التعبيرية بأسلوب قصصي تفاعلي.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1920&q=85',
      actionText: 'سجل في كورس القرائية الممتعة',
      tag: 'تأسيس متكامل'
    },
    {
      id: 3,
      badge: 'الرياضيات الممتعة 🔢',
      title: 'رياضيات الفهم وتنمية التفكير المنطقي',
      highlight: 'وداعاً لعقدة الرياضيات وخوف المسائل المدرسية',
      description: 'ألعاب حسابية وتطبيقات بصرية ذكية تحول الرياضيات من مادة معقدة إلى لعبة تحدي شيقة يحبها الطفل ويتفوق فيها في مدرسته.',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1920&q=85',
      actionText: 'استكشف تمارين الرياضيات الذكية',
      tag: 'تفوق دراسي'
    },
    {
      id: 4,
      badge: 'دبلوم معتمد 🎓',
      title: 'دبلوم تدريب المدربين المعتمد (TOT)',
      highlight: 'للمعلمات والأمهات لاحتراف تدريب الأطفال',
      description: 'برنامج تدريبي تطبيقي يؤهلك لافتتاح أكاديميتك وفصولك الخاصة لتعليم الحساب الذهني وتأسيس الأطفال، مع حقيبة تدريبية كاملة وشهادة معتمدة.',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=85',
      actionText: 'تفاصيل دبلوم المعلمات والأمهات',
      tag: 'للمعلمات والأمهات'
    }
  ];

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroSlides.length]);

  const activeSlide = heroSlides[currentSlide];

  // Shorts / Media videos state
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  const shortsList = [
    {
      id: 'sh-1',
      title: 'البطل يوسف (8 سنوات) يحل 15 مسألة في ثوانٍ بالعداد الصيني!',
      duration: '0:45',
      views: '14.2K',
      likes: '1.8K',
      category: 'حساب ذهني',
      thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      id: 'sh-2',
      title: 'شاهد فرحة جنى بقراءة أول قصة كاملة بمفردها!',
      duration: '1:12',
      views: '9.6K',
      likes: '1.2K',
      category: 'تأسيس قراءة',
      thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 'sh-3',
      title: 'كواليس الحصة الأونلاين التفاعلية ومسابقة السرعة بين أبطال مصر والسعودية',
      duration: '0:58',
      views: '18.5K',
      likes: '2.4K',
      category: 'فصول مباشرة',
      thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 'sh-4',
      title: 'تخريج دفعة معلمات الحساب الذهني المعتمدات (TOT) وتسليم الشهادات',
      duration: '1:30',
      views: '11.1K',
      likes: '1.5K',
      category: 'دبلوم TOT',
      thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      parentName: 'أم ياسين وأحمد',
      city: 'المنصورة، مصر',
      child: 'ياسين (8 سنوات) وأحمد (6 سنوات)',
      rating: 5,
      text: 'ما شاء الله تبارك الله، مس سارة عندها صبر عجيب مع الأطفال وطاقتها إيجابية جداً! ياسين كان بيخاف جداً من مادة الحساب، بعد شهرين من تدريب السوروبان بقى يحل المسائل في ثواني وهو بيضحك ومتحمس! ربنا يبارك فيها.'
    },
    {
      id: 2,
      parentName: 'أم ريتال',
      city: 'الرياض، المملكة العربية السعودية',
      child: 'ريتال (9 سنوات)',
      rating: 5,
      text: 'بنتي مشتركة مع مس سارة أونلاين من السعودية، الحصص قمة في التنظيم والتفاعل ومشاركة الشاشة والسبورة التفاعلية بتخلي الطفل كأنه قاعد قدامها في الفصل! أسلوبها مبني على الفهم مش الحفظ وده فرق جداً في ثقتها بنفسها.'
    },
    {
      id: 3,
      parentName: 'د. مروة الشربيني',
      city: 'القاهرة، مصر',
      child: 'عمر (10 سنوات)',
      rating: 5,
      text: 'من أفضل الدورات اللي اشتركت فيها لعمر.. كتاب التمارين اللي أعدته مس سارة منظم جداً والمتابعة الأسبوعية دقيقة. عمر فاز بالمركز الثاني في مسابقة الحساب الذهني بفضل الله ثم توجيهاتها.'
    },
    {
      id: 4,
      parentName: 'أ / إيمان عبد الرحمن (معلمة)',
      city: 'شربين، الدقهلية',
      child: 'دبلوم تدريب المدربين TOT',
      rating: 5,
      text: 'أخذت كورس إعداد المدربين TOT مع أستاذة سارة العربي، الشرح عملي وشامل من الصفر حتى فتح فصلي الخاص. كمية كرم في المعلومات ونقل الخبرة غير طبيعي!'
    }
  ];

  return (
    <div className="pb-16 font-sans bg-[var(--bg-elevated)] dark:bg-[var(--bg-inset)] text-[var(--ink)] dark:text-[var(--ink)] transition-colors" dir="rtl">

      {/* 1. HERO — FULL-WIDTH IMMERSIVE SLIDER */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
              currentSlide === idx ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
            aria-hidden={currentSlide !== idx}
          />
        ))}

        {/* Cinematic overlays keep hero readable in both themes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-a)] via-slate-950/55 to-slate-950/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent" />

        {/* Theme toggle floating on hero */}
        <button
          onClick={toggleTheme}
          className="absolute top-24 left-4 sm:left-8 z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] backdrop-blur-md border border-white/25 text-[var(--ink)] text-xs font-bold transition-all shadow-lg"
          title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'العودة للوضع النهاري'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
          <span>{theme === 'light' ? 'ليلي' : 'نهاري'}</span>
        </button>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-32 pb-24 text-right text-[var(--ink)]">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] backdrop-blur-md border border-[var(--line)] px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{activeSlide.badge}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">{activeSlide.tag}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--ink)] leading-tight tracking-tight drop-shadow-xl">
              {activeSlide.title}
            </h1>

            <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent drop-shadow">
              {activeSlide.highlight}
            </p>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl">
              {activeSlide.description}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenBookingModal()}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>{activeSlide.actionText}</span>
              </button>

              <a
                href="https://wa.me/201028340042?text=السلام%20عليكم%20مس%20سارة%2C%20حابب%20استفسر%20عن%20تفاصيل%20الكورسات%20وحجز%20تقييم%20مستوى%20لطفلي"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_15%,transparent)] backdrop-blur-md border border-[var(--line)] text-[var(--ink)] font-bold rounded-xl shadow-md flex items-center gap-2 text-xs sm:text-sm transition-all hover:scale-105"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>واتساب مباشر (01028340042)</span>
              </a>

              <button
                onClick={onOpenClassroom}
                className="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 text-[var(--ink)] font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 text-xs sm:text-sm transition-all hover:scale-105"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>ادخل الحصة المباشرة الآن 🔴</span>
              </button>
            </div>

            <div className="pt-6 border-t border-[var(--line)] flex flex-wrap items-center gap-6 text-xs text-[var(--ink-soft)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span><strong className="text-[var(--ink)] text-sm">+1,200</strong> بطل وبطلة متخرجين</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>المركز الأول ببطولات الحساب الذهني</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>مقر المنصورة • حصص أونلاين حول العالم</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-12 z-20 flex items-center gap-2 sm:gap-3">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 sm:w-10 bg-amber-400 shadow-md shadow-amber-400/50' : 'w-2 bg-[color-mix(in_srgb,var(--ink)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_70%,transparent)]'
              }`}
              aria-label={`انتقل للشريحة ${idx + 1}`}
            />
          ))}
        </div>

        <div className="hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 flex-col gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] backdrop-blur-md border border-[var(--line)] text-[var(--ink)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] backdrop-blur-md border border-[var(--line)] text-[var(--ink)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            aria-label="التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 pt-16">

        {/* 2. LIVE ONLINE CLASSES — REAL SCREEN SHARE & WHITEBOARD */}
        <section className="rounded-3xl overflow-hidden border border-amber-200 dark:border-[var(--line)] bg-gradient-to-l from-amber-50 via-white to-orange-50 dark:from-[var(--hero-b)] dark:via-slate-950 dark:to-[var(--hero-c)] shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-10 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 px-3.5 py-1.5 rounded-full">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                بث حي مباشر الآن
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] dark:text-[var(--ink)] leading-snug">
                حصص أونلاين حقيقية: كاميرا، مشاركة شاشة، وسبورة تفاعلية
              </h2>
              <p className="text-sm text-[var(--ink-soft)] dark:text-[var(--ink-soft)] leading-relaxed">
                طفلتك وطفلك قاعدين مع مس سارة في فصل افتراضي كامل: فيديو مباشر بالصوت والصورة، مشاركة شاشة حقيقية لعرض العداد التفاعلي والشيتات، وسبورة بيضاء يرسم عليها الجميع لحظياً، ودردشة وأسئلة مباشرة.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-[var(--ink)] dark:text-[var(--ink)]">
                <li className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>كاميرا وصوت مباشر HD</span>
                </li>
                <li className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>مشاركة شاشة فعلية (Screen Share)</span>
                </li>
                <li className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>سبورة تفاعلية بالرسم الحي</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>دردشة، رفع يد، وقائمة حضور</span>
                </li>
              </ul>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={onOpenClassroom}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-[var(--ink)] font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>جرب الفصل الافتراضي الآن مجاناً</span>
                </button>
                <button
                  onClick={() => onOpenBookingModal()}
                  className="px-5 py-3 bg-[var(--bg-elevated)] dark:bg-[var(--bg-subtle)] hover:bg-amber-50 dark:hover:bg-[var(--bg-inset)] border border-amber-300 dark:border-[var(--line-strong)] text-[var(--ink)] dark:text-[var(--ink)] font-bold rounded-xl text-xs sm:text-sm transition-all"
                >
                  احجز موعد حصة لابنك أولاً
                </button>
              </div>
            </div>

            {/* Live session visual card */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[var(--line-strong)] bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] shadow-xl">
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-rose-600 text-[var(--ink)] text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg-elevated)] animate-ping" />
                LIVE
              </div>
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80"
                alt="حصة مباشرة أونلاين مع مس سارة"
                className="w-full h-64 object-cover"
              />
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-black text-[var(--ink)] dark:text-[var(--ink)]">
                  حصة العداد الصيني المباشرة: أصدقاء العدد 5
                </h3>
                <div className="flex items-center justify-between text-[11px] text-[var(--ink-faint)] dark:text-[var(--ink-soft)] font-bold">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> 60 دقيقة</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan-500" /> 28 طالب متصل</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="text-[10px] bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 px-2 py-0.5 rounded-full font-bold">مشاركة شاشة</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">سبورة تفاعلية</span>
                  <span className="text-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-full font-bold">مسابقة حية</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. WHY "الفهم مش الحفظ" */}
        <section className="text-center space-y-10">
          <div className="max-w-2xl mx-auto space-y-2.5">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 px-3.5 py-1 rounded-full">
              فلسفة ومنهج مس سارة العربي 💡
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] dark:text-[var(--ink)] tracking-tight">
              لماذا تختار لأطفالك طريقة "الفهم مش الحفظ"؟
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-soft)] dark:text-[var(--ink-soft)] leading-relaxed">
              التعليم الحقيقي ليس حشو معلومات جافة، بل إيقاظ شغف الطفل وتدريب عقله على التخيل والمنطق
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-right">
            <div className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] border border-slate-200 dark:border-[var(--line)] p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-500/30 transition-all space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">🧠</div>
              <h3 className="text-base font-bold text-[var(--ink)] dark:text-[var(--ink)]">تنشيط وتكامل نصفي الدماغ</h3>
              <p className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)] leading-relaxed">
                السوروبان يجمع بين استخدام اليدين لتفعيل النصف الأيمن (الخيال والصور والإبداع) مع النصف الأيسر (المنطق والعمليات الحسابية)، مما يرفع معدل الذكاء العام للطفل.
              </p>
            </div>

            <div className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] border border-slate-200 dark:border-[var(--line)] p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">⚡</div>
              <h3 className="text-base font-bold text-[var(--ink)] dark:text-[var(--ink)]">سرعة بديهة وقوة تركيز خيالية</h3>
              <p className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)] leading-relaxed">
                خلال أسابيع قليلة يتحول الطفل من الاعتماد على الأصابع إلى حساب 10 عمليات متتالية في لمح البصر عقلياً، مما ينعكس على قوة استيعابه لجميع المواد المدرسية.
              </p>
            </div>

            <div className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] border border-slate-200 dark:border-[var(--line)] p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-500/30 transition-all space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">❤️</div>
              <h3 className="text-base font-bold text-[var(--ink)] dark:text-[var(--ink)]">كسر حاجز الخوف وبناء ثقة حديدية</h3>
              <p className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)] leading-relaxed">
                الطفل حين يرى نفسه يحل أسرع من الكبار يشعر بفخر وثقة هائلين في قدراته. نزرع فيه حب التعلم باللعب والمرح دون توبيخ أو مقارنات سلبية.
              </p>
            </div>
          </div>
        </section>

        {/* 4. LIVE MINI GAME */}
        <section>
          <MentalMathChallenge />
        </section>

        {/* 5. SERVICES & AGE TRACKS */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[var(--line)] pb-5">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full">
                مسارات الأكاديمية
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] dark:text-[var(--ink)] mt-2">خدماتنا التعليمية وبرامج التأسيس</h2>
            </div>
            <button
              onClick={() => onOpenBookingModal()}
              className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-400/10 hover:bg-amber-200 dark:hover:bg-amber-400/20 border border-amber-200 dark:border-amber-400/30 px-4 py-2 rounded-xl transition-all"
            >
              احجز اختبار تحديد مستوى مجاني 🎁
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: '🧮', ages: 'الأعمار: 6 - 14 سنة', ageColor: 'amber',
                title: 'الحساب الذهني والسوروبان',
                desc: 'منهج السوروبان للحساب الذهني: الجمع والطرح التخيلي، الأصدقاء، الضرب والقسمة بأسلوب مبهر.',
                points: ['عداد صيني مجاني', 'مسابقات وجوائز أسبوعية', 'شهادة اجتياز معتمدة'],
                btn: 'احجز مقعد في السوروبان', courseId: 'course-soroban-kids'
              },
              {
                emoji: '📖', ages: 'الأعمار: 4 - 9 سنوات', ageColor: 'emerald',
                title: 'تأسيس اللغة العربية والقرائية',
                desc: 'منهج نور البيان المعدل لعلاج صعوبات القراءة، مخارج الحروف، الحركات والمدود حتى القراءة بطلاقة.',
                points: ['شيتات عمل ملونة أسبوعية', 'قصص القراءة التفاعلية', 'متابعة صوتية خاصة للطفل'],
                btn: 'احجز مقعد في القرائية', courseId: 'course-arabic-reading'
              },
              {
                emoji: '🔢', ages: 'الأعمار: 7 - 14 سنة', ageColor: 'sky',
                title: 'الرياضيات وتنمية التفكير',
                desc: 'تبسيط المناهج المدرسية، حل المسائل اللفظية الصعبة، وألعاب الألغاز الرياضية التي تحبب الطفل في المادة.',
                points: ['تطبيق على مناهج المدارس', 'ألعاب تنمية الذكاء والمنطق', 'تدريب على الامتحانات بدون توتر'],
                btn: 'احجز كورس الرياضيات', courseId: 'course-fun-math'
              },
              {
                emoji: '🎓', ages: 'للمعلمات والأمهات', ageColor: 'rose',
                title: 'دبلوم تدريب المدربين TOT',
                desc: 'إعداد المعلمات والأمهات لتدريس السوروبان وتأسيس الأطفال باحترافية وإطلاق مشروعهم التعليمي الخاص.',
                points: ['شهادة مدرب معتمد رسمية', 'حقيبة تدريبية ومذكرات كاملة', 'استشارات مستمرة لفتح الأكاديمية'],
                btn: 'احجز مقعد في دبلوم TOT', courseId: 'course-tot-trainers'
              }
            ].map((s, i) => {
              const colorMap: Record<string, string> = {
                amber: 'text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20',
                emerald: 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20',
                sky: 'text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-400/10 border-sky-200 dark:border-sky-400/20',
                rose: 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-400/10 border-rose-200 dark:border-rose-400/20'
              };
              const btnMap: Record<string, string> = {
                amber: 'bg-amber-500 hover:bg-amber-400 text-[var(--ink)]',
                emerald: 'bg-emerald-500 hover:bg-emerald-400 text-[var(--ink)]',
                sky: 'bg-sky-500 hover:bg-sky-400 text-[var(--ink)]',
                rose: 'bg-rose-500 hover:bg-rose-400 text-[var(--ink)]'
              };
              return (
                <div key={i} className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-[var(--line)] shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
                  <div className="space-y-3.5">
                    <span className="text-3xl">{s.emoji}</span>
                    <span className={`text-[11px] font-bold border px-2.5 py-0.5 rounded-full inline-block ${colorMap[s.ageColor]}`}>
                      {s.ages}
                    </span>
                    <h3 className="text-base font-bold text-[var(--ink)] dark:text-[var(--ink)]">{s.title}</h3>
                    <p className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)] leading-relaxed">{s.desc}</p>
                    <ul className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)] space-y-2 pt-1">
                      {s.points.map((p, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-6">
                    <button
                      onClick={() => onOpenBookingModal(courses.find(c => c.id === s.courseId))}
                      className={`w-full py-2.5 px-4 ${btnMap[s.ageColor]} font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95`}
                    >
                      {s.btn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. FEATURED COURSES */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[var(--line)] pb-5">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full">
                برامج معتمدة
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] dark:text-[var(--ink)] mt-2">الكورسات والبرامج التدريبية</h2>
            </div>
            <button
              onClick={() => onOpenPortal('courses')}
              className="text-xs font-bold text-[var(--ink-soft)] dark:text-[var(--ink-soft)] hover:text-amber-600 dark:hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <span>عرض دليل الكورسات كاملاً</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] rounded-2xl border border-slate-200 dark:border-[var(--line)] overflow-hidden shadow-sm hover:border-amber-300 dark:hover:border-amber-400/30 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 right-4 bg-amber-500/95 backdrop-blur-md text-[var(--ink)] text-xs font-black px-3.5 py-1 rounded-full shadow-lg">
                      {c.category}
                    </div>
                    <div className="absolute bottom-4 right-4 text-[var(--ink)]">
                      <span className="text-[11px] text-amber-300 block">مع المدربة:</span>
                      <span className="text-sm font-bold">{c.instructor.name}</span>
                    </div>
                  </div>

                  <div className="p-7 space-y-4">
                    <div className="flex items-center justify-between text-xs text-[var(--ink-faint)] dark:text-[var(--ink-soft)]">
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{c.rating} ({c.reviewsCount} تقييم)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-sky-500" />
                        <span>{c.durationHours} ساعة تدريب</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--ink)] dark:text-[var(--ink)] group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">{c.title}</h3>
                    <p className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)] line-clamp-2 leading-relaxed">{c.summary}</p>

                    <div className="pt-2 flex flex-wrap gap-2">
                      {c.outcomes.slice(0, 3).map((out, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-50 dark:bg-[var(--bg-subtle)] border border-slate-200 dark:border-[var(--line-strong)] text-[var(--ink-soft)] dark:text-[var(--ink-soft)] px-3 py-1 rounded-xl">
                          ✓ {out.slice(0, 34)}…
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-7 pb-7 pt-4 border-t border-slate-200 dark:border-[var(--line)] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[var(--ink-faint)] dark:text-[var(--ink-soft)] block">رسوم الاشتراك:</span>
                    <div className="text-lg font-black text-amber-600 dark:text-amber-300">
                      {c.priceMinor > 0 ? (
                        <span>{c.priceMinor / 10} ج.م <span className="text-xs text-[var(--ink-faint)] dark:text-[var(--ink-soft)]">/ 180 ر.س</span></span>
                      ) : (
                        <span className="text-emerald-500 dark:text-emerald-400">مجاناً بالكامل</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => onOpenCourse(c)}
                      className="px-4 py-2.5 bg-[var(--bg-subtle)] dark:bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] dark:hover:bg-[var(--bg-inset)] text-[var(--ink)] dark:text-[var(--ink)] text-xs font-bold rounded-xl transition-colors"
                    >
                      التفاصيل
                    </button>
                    <button
                      onClick={() => onOpenBookingModal(c)}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] text-xs font-black rounded-xl shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95"
                    >
                      حجز واشتراك فوري
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. WORKBOOKS LIBRARY */}
        <section className="bg-slate-50 dark:bg-[var(--bg-elevated)] rounded-2xl p-5 sm:p-7 md:p-8 border border-slate-200 dark:border-[var(--line)] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[var(--line)] pb-5">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full">
                المؤلفات الحصرية
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] dark:text-[var(--ink)] mt-2">مكتبة المذكرات وكتب التدريب لمس سارة العربي</h2>
              <p className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)] mt-1">
                كتب تدريبية وشيتات عملية مصممة خصيصاً لأطفال الأكاديمية، متاحة للتحميل والطباعة والشحن المنزلي
              </p>
            </div>
            <button
              onClick={onOpenLibrary}
              className="px-4 py-2 bg-[var(--bg-elevated)] dark:bg-[var(--bg-subtle)] hover:bg-amber-50 dark:hover:bg-[var(--bg-inset)] border border-slate-200 dark:border-[var(--line-strong)] text-[var(--ink)] dark:text-[var(--ink)] font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>تصفح المكتبة الرقمية كاملة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {libraryBooks.slice(0, 3).map((book) => (
              <div key={book.id} className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-inset)] rounded-xl p-5 border border-slate-200 dark:border-[var(--line)] shadow-sm flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-400/30 transition-all">
                <div>
                  <div className="h-44 rounded-lg overflow-hidden mb-3 relative shadow-inner">
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 right-2.5 bg-[var(--bg-elevated)]/85 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      {book.pagesCount} صفحة ملونة
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 px-2 py-0.5 rounded inline-block mb-1.5">
                    {book.category}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--ink)] dark:text-[var(--ink)] line-clamp-1 mb-1">{book.title}</h3>
                  <p className="text-xs text-[var(--ink-faint)] dark:text-[var(--ink-soft)] line-clamp-2 leading-relaxed">{book.description}</p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-[var(--line)] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">متاح للتحميل والطباعة PDF</span>
                  <button
                    onClick={onOpenLibrary}
                    className="p-2 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 rounded-lg transition-colors"
                    title="عرض الكتاب"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. MEDIA STUDIO & SHORTS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[var(--line)] pb-5">
            <div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3 py-1 rounded-full">
                أبطال مس سارة 🌟
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] dark:text-[var(--ink)] mt-2">فيديوهات الأبطال والشورتس</h2>
              <p className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)] mt-1">شاهد أطفالنا وهم يحسبون بسرعة الصوت ويحصدون بطولات الحساب الذهني</p>
            </div>
            <a
              href="https://wa.me/201028340042?text=مس%20سارة%2C%20عايز%20فيديو%20اختبار%20مستوى%20لطفلي"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>شاركنا فيديو طفلك للتقييم</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {shortsList.map((short) => (
              <div
                key={short.id}
                onClick={() => setActiveVideoModal(short.videoUrl)}
                className="group cursor-pointer bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] rounded-2xl overflow-hidden border border-slate-200 dark:border-[var(--line)] shadow-sm hover:border-amber-300 dark:hover:border-amber-400/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[9/13] overflow-hidden bg-[var(--bg-subtle)] dark:bg-[var(--bg-inset)]">
                  <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-a)] via-slate-950/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/90 text-[var(--ink)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-slate-950 mr-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-[var(--bg-elevated)]/80 backdrop-blur-md text-[var(--ink)] text-[10px] font-bold px-2 py-0.5 rounded">{short.category}</div>
                  <div className="absolute top-2.5 left-2.5 bg-rose-500 text-[var(--ink)] text-[10px] font-bold px-1.5 py-0.5 rounded">{short.duration}</div>
                  <div className="absolute bottom-3 inset-x-3 text-right text-[var(--ink)]">
                    <h4 className="text-xs font-bold leading-snug line-clamp-2 drop-shadow">{short.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-[var(--ink-soft)] mt-1.5">
                      <span className="flex items-center gap-1 text-amber-300"><Play className="w-2.5 h-2.5" /><span>{short.views}</span></span>
                      <span className="flex items-center gap-1 text-rose-300"><ThumbsUp className="w-2.5 h-2.5" /><span>{short.likes}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. PARENT TESTIMONIALS */}
        <section className="bg-slate-50 dark:bg-[var(--bg-elevated)] rounded-2xl p-5 sm:p-7 md:p-8 border border-slate-200 dark:border-[var(--line)] shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full">
              شهادات نعتز بها ❤️
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] dark:text-[var(--ink)]">ماذا يقول أولياء الأمور عن أ / سارة العربي؟</h2>
            <p className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)]">قصص نجاح وتطور حقيقية لأطفال وأمهات من المنصورة وجميع المحافظات والدول العربية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-inset)] p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-[var(--line)] shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-300 dark:hover:border-amber-400/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-[var(--ink-soft)] font-bold">تقييم موثق ✓</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--ink)] dark:text-[var(--ink)] leading-relaxed">"{t.text}"</p>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-[var(--line)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)] dark:text-[var(--ink)]">{t.parentName}</h4>
                    <p className="text-[11px] text-[var(--ink-faint)] dark:text-[var(--ink-soft)]">{t.city} • <span className="text-amber-600 dark:text-amber-400">{t.child}</span></p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                    {t.parentName[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. PAYMENT METHODS */}
        <section className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-inset)] text-[var(--ink)] rounded-2xl p-5 sm:p-7 md:p-8 shadow-lg relative overflow-hidden space-y-8 border border-[var(--line)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-[var(--line)] pb-6">
            <div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">سهولة وأمان الدفع</span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] mt-2">طرق الدفع والتحويل المعتمدة محلياً ودولياً</h2>
              <p className="text-xs text-[var(--ink-soft)] mt-1 max-w-xl">نوفر جميع وسائل الدفع في مصر وخارجها لتسهيل التحاق طفلك بدون أي عوائق</p>
            </div>
            <button
              onClick={() => onOpenBookingModal()}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-[var(--ink)] font-bold rounded-xl shadow-md text-xs shrink-0 hover:scale-105 active:scale-95 transition-all"
            >
              افتح نافذة الحجز والدفع الفوري
            </button>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-elevated)]/70 border border-[var(--line-strong)] rounded-xl p-4 sm:p-5 space-y-1.5 hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-2xl">⚡</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded">لحظي</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)]">انستاباي (InstaPay)</h4>
              <p className="text-xs text-amber-300 font-mono" dir="ltr">Saraelarby96@instapay</p>
              <p className="text-[11px] text-[var(--ink-soft)]">أو بالتحويل على رقم: 01028340042</p>
            </div>

            <div className="bg-[var(--bg-elevated)]/70 border border-[var(--line-strong)] rounded-xl p-4 sm:p-5 space-y-1.5 hover:border-rose-400/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📱</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded">فودافون كاش</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)]">فودافون كاش</h4>
              <p className="text-xs sm:text-sm font-bold font-mono text-rose-400" dir="ltr">01028340042</p>
              <p className="text-[11px] text-[var(--ink-soft)]">تحويل كاش من أي محفظة أو فرع</p>
            </div>

            <div className="bg-[var(--bg-elevated)]/70 border border-[var(--line-strong)] rounded-xl p-4 sm:p-5 space-y-1.5 hover:border-purple-400/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-2xl">💼</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded">محافظ إلكترونية</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)]">أورنج كاش & وي باي</h4>
              <p className="text-[11px] font-mono text-[var(--ink-soft)]" dir="ltr">أورنج: 01283400420</p>
              <p className="text-[11px] font-mono text-[var(--ink-soft)]" dir="ltr">وي باي: 01028340042</p>
            </div>

            <div className="bg-[var(--bg-elevated)]/70 border border-[var(--line-strong)] rounded-xl p-4 sm:p-5 space-y-1.5 hover:border-emerald-400/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🇸🇦</span>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded">آيبان سعودي</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)]">تحويل بنكي من السعودية والخليج</h4>
              <p className="text-xs text-emerald-300">مصرف الراجحي</p>
              <p className="text-[11px] text-[var(--ink-soft)]">آيبان معتمد للطلاب من خارج مصر</p>
            </div>
          </div>
        </section>

        {/* 11. LOCATION & CONTACT + FOUNDER CARD */}
        <section className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] rounded-2xl p-5 sm:p-7 md:p-8 border border-slate-200 dark:border-[var(--line)] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full">
                يسعدنا تشريفكم وتواصلكم
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] dark:text-[var(--ink)]">أكاديمية أ / سارة العربي</h2>
              <p className="text-xs text-[var(--ink-soft)] dark:text-[var(--ink-soft)] leading-relaxed">
                معلمة تأسيس أطفال (عربي ورياضة) • مدربة حساب ذهني معتمدة • مدربة مدربين معتمدة (TOT).
                نستقبل الأطفال بمقرنا بالمنصورة أو عبر فصولنا التفاعلية المباشرة لجميع المحافظات والدول.
              </p>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2.5 text-[var(--ink-soft)] dark:text-[var(--ink-soft)]">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span>المنصورة، محافظة الدقهلية، جمهورية مصر العربية</span>
                </div>
                <div className="flex items-center gap-2.5 text-[var(--ink-soft)] dark:text-[var(--ink-soft)]">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex gap-2">
                    <a href="tel:01028340042" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-mono font-bold" dir="ltr">010 28340042</a>
                    <span>/</span>
                    <a href="tel:+201028340042" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-mono font-bold" dir="ltr">+20 10 28340042</a>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-[var(--ink-soft)] dark:text-[var(--ink-soft)]">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <a href="mailto:Saraelarby96@gmail.com" className="hover:text-sky-600 dark:hover:text-sky-400 font-mono" dir="ltr">Saraelarby96@gmail.com</a>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/201028340042"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-[var(--ink)] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-transform hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5 fill-white" />
                  <span>محادثة واتساب سريعة</span>
                </a>
                <a
                  href="tel:01028340042"
                  className="px-5 py-2.5 bg-[var(--bg-subtle)] dark:bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] dark:hover:bg-[var(--bg-inset)] text-[var(--ink)] dark:text-[var(--ink)] font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 dark:border-[var(--line-strong)] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                  <span>اتصل هاتفياً</span>
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-amber-50 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/15 border border-amber-200 dark:border-amber-400/20 rounded-2xl p-6 sm:p-7 text-center space-y-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"
                  alt="أ / سارة العربي"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--ink)] dark:text-[var(--ink)]">أ / سارة العربي</h3>
                <p className="text-xs text-amber-700 dark:text-amber-300 font-bold mt-0.5">صاحبة المنصة • تأسيس أطفال . حساب ذهني</p>
              </div>
              <p className="text-xs text-[var(--ink)] dark:text-[var(--ink-soft)] italic leading-relaxed">
                "رسالتي لكل أب وأم: كل طفل جواه عبقري مستني بس الطريقة الصح اللي تلمس شغفه وتخليه يفهم ويحب التعليم.. واحنا هنا عشان نوصله ده بكل حب 💡"
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onOpenBookingModal()}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-bold rounded-xl text-xs shadow-md shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95"
                >
                  انضم لعائلة أبطال مس سارة الآن
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/85 backdrop-blur-xl" onClick={() => setActiveVideoModal(null)}>
          <div className="relative w-full max-w-3xl bg-[var(--bg-elevated)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--line-strong)]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-[var(--bg-subtle)] text-[var(--ink)] flex items-center justify-center hover:bg-[var(--bg-inset)]"
            >
              ✕
            </button>
            <video src={activeVideoModal} controls autoPlay playsInline className="w-full aspect-video bg-black" />
          </div>
        </div>
      )}

    </div>
  );
};
