import React, { useState } from 'react';
import { Course, Enrollment, Lesson, LessonProgress } from '../../shared/types';
import { 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Download,
  Lock,
  Award
} from 'lucide-react';

interface CourseDetailProps {
  course: Course;
  enrollment?: Enrollment;
  progressMap: Record<string, LessonProgress>;
  onBackToCatalog: () => void;
  onStartLesson: (lesson: Lesson) => void;
  onEnroll: (course: Course) => void;
  onOpenCheckout: (course: Course) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({
  course,
  enrollment,
  progressMap,
  onBackToCatalog,
  onStartLesson,
  onEnroll,
  onOpenCheckout,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Expand first section by default
    const map: Record<string, boolean> = {};
    course.sections.forEach((s, idx) => {
      map[s.id] = idx === 0;
    });
    return map;
  });

  const isEnrolled = !!enrollment && enrollment.status === 'active';
  const isFree = course.priceMinor === 0;

  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedLessons = Object.values(progressMap).filter(p => p.completed).length;
  const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const firstLesson = course.sections[0]?.lessons[0];

  return (
    <div className="space-y-10">
      
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCatalog}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-soft)] hover:text-cyan-400 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى كتالوج الدورات</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--ink-soft)] bg-[var(--bg-elevated)] border border-[var(--line)] px-2 py-0.5 rounded">
            إصدار المعمارية: v{course.version}.0
          </span>
        </div>
      </div>

      {/* Main Course Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-elevated)] border border-[var(--line)] p-6 sm:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Details 2 Cols */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {course.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[var(--bg-subtle)] text-[var(--ink-soft)] border border-[var(--line-strong)]">
                المستوى: {course.level === 'advanced' ? 'متقدم' : course.level === 'intermediate' ? 'متوسط' : 'مبتدئ'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                مدعوم بمساعد مدار السقراطي
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed">
              {course.summary}
            </p>

            {/* Metrics & Meta */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[var(--ink-soft)]">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm">{course.rating.toFixed(2)}</span>
                <span className="text-[var(--ink-soft)] font-normal">({course.reviewsCount} تقييم موثق)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{course.durationHours} ساعة تدريبية</span>
              </div>

              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>{totalLessons} درساً مقسماً</span>
              </div>
            </div>

            {/* Instructor Summary */}
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--line)]">
              <img
                src={course.instructor.avatarUrl}
                alt={course.instructor.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/40"
              />
              <div>
                <h4 className="text-sm font-bold text-[var(--ink)]">{course.instructor.name}</h4>
                <p className="text-xs text-[var(--ink-soft)]">{course.instructor.title}</p>
              </div>
            </div>
          </div>

          {/* Right Action / Enrollment Card */}
          <div className="bg-[var(--bg-elevated)]/80 border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-[var(--bg-elevated)] border border-[var(--line)] group">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[var(--bg-elevated)]/40 flex items-center justify-center">
                  {firstLesson && (
                    <button
                      onClick={() => onStartLesson(firstLesson)}
                      className="w-12 h-12 rounded-full bg-cyan-500 text-[var(--ink)] flex items-center justify-center hover:scale-110 shadow-lg shadow-cyan-500/30 transition-all"
                      title="معاينة الدرس الأول"
                    >
                      <PlayCircle className="w-7 h-7" />
                    </button>
                  )}
                </div>
              </div>

              {/* Price or Progress display */}
              {isEnrolled ? (
                <div className="space-y-2 bg-[var(--bg-elevated)]/80 p-3 rounded-xl border border-[var(--line)]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ink-soft)] font-semibold">نسبة التقدم في الدورة</span>
                    <span className="font-bold text-cyan-400">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[var(--ink-soft)]">
                    أنجزت {completedLessons} من {totalLessons} درساً
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[var(--ink-soft)]">تكلفة الدورة:</span>
                  <div className="text-2xl font-black text-[var(--ink)]">
                    {isFree ? (
                      <span className="text-emerald-400">مجانية بالكامل</span>
                    ) : (
                      <span>${(course.priceMinor / 100).toFixed(0)} <span className="text-xs text-[var(--ink-soft)] font-normal">USD</span></span>
                    )}
                  </div>
                </div>
              )}

              {/* Guarantee bullets */}
              <div className="space-y-2 text-xs text-[var(--ink-soft)] pt-2 border-t border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>شهادة إتمام معتمدة برمز تحقق تشفيري</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>وصول كامل ودائم لمواد الدورة والتحديثات</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>مساعد مدار السقراطي للأسئلة والتوجيه</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              {isEnrolled ? (
                <button
                  onClick={() => {
                    if (firstLesson) onStartLesson(firstLesson);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-[var(--ink)] font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>متابعة التعلم الآن</span>
                </button>
              ) : isFree ? (
                <button
                  onClick={() => onEnroll(course)}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[var(--ink)] font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>التحاق فوري مجاناً</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenCheckout(course)}
                  className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>شراء الدورة (دفع محصن Idempotent)</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Course Curriculum & Syllabus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Syllabus 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--ink)] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>المنهج الدراسي والوحدات التعليمية</span>
            </h2>
            <span className="text-xs text-[var(--ink-soft)]">
              {course.sections.length} وحدات • {totalLessons} درساً
            </span>
          </div>

          <div className="space-y-4">
            {course.sections.map((section, sIdx) => {
              const isExpanded = !!expandedSections[section.id];
              return (
                <div 
                  key={section.id}
                  className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl overflow-hidden transition-colors"
                >
                  {/* Section Accordion Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 flex items-center justify-between text-right hover:bg-[var(--bg-elevated)]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xs font-bold font-mono">
                        {sIdx + 1}
                      </div>
                      <span className="text-sm font-bold text-[var(--ink)]">{section.title}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)]">
                      <span>{section.lessons.length} دروس</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--ink-faint)]" />
                      )}
                    </div>
                  </button>

                  {/* Section Lessons List */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 divide-y divide-slate-800/60 bg-[var(--bg-elevated)]/40">
                      {section.lessons.map((lesson, lIdx) => {
                        const progress = progressMap[lesson.id];
                        const isCompleted = progress?.completed;
                        const canAccess = isEnrolled || lesson.isPreview;

                        return (
                          <div
                            key={lesson.id}
                            className="p-4 flex items-center justify-between hover:bg-[var(--bg-elevated)]/60 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {/* Lesson Kind Icon */}
                              <div className="text-[var(--ink-soft)] group-hover:text-cyan-400 transition-colors">
                                {lesson.lessonKind === 'video' ? (
                                  <PlayCircle className="w-4 h-4" />
                                ) : lesson.lessonKind === 'quiz' ? (
                                  <HelpCircle className="w-4 h-4 text-amber-400" />
                                ) : (
                                  <FileText className="w-4 h-4 text-indigo-400" />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--ink)] transition-colors">
                                    {lesson.title}
                                  </span>
                                  {lesson.isPreview && !isEnrolled && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                      معاينة مجانية
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[var(--ink-faint)] mt-0.5">
                                  {Math.round(lesson.durationSeconds / 60)} دقيقة
                                  {lesson.quiz && ` • اختبار ${lesson.quiz.questions.length} أسئلة`}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {isCompleted && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  منجز
                                </span>
                              )}

                              {canAccess ? (
                                <button
                                  onClick={() => onStartLesson(lesson)}
                                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-[var(--ink)] text-xs font-semibold transition-all flex items-center gap-1"
                                >
                                  <span>تشغيل</span>
                                  <PlayCircle className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div className="text-[var(--ink-soft)] flex items-center gap-1 text-xs" title="يتطلب التسجيل في الدورة">
                                  <Lock className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Learning Outcomes detailed block */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>ماذا ستتعلم في هذه الدورة؟ (مخرجات التعلم)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.outcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[var(--ink-soft)] leading-relaxed bg-[var(--bg-elevated)]/60 p-3 rounded-xl border border-slate-800/80">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>المتطلبات السابقة المعمارية</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[var(--ink-soft)] leading-relaxed">
              {course.prerequisites.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar Info (Instructor Details & Policy) */}
        <div className="space-y-6">
          
          {/* Detailed Instructor Card */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--ink)]">مدرب الدورة</h3>
            <div className="flex items-center gap-3">
              <img
                src={course.instructor.avatarUrl}
                alt={course.instructor.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/50"
              />
              <div>
                <h4 className="text-base font-bold text-[var(--ink)]">{course.instructor.name}</h4>
                <p className="text-xs text-cyan-400">{course.instructor.title}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              {course.instructor.bio}
            </p>
          </div>

          {/* Socratic AI Tutor Guarantee Card */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-[var(--hero-c)] border border-indigo-900/60 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[var(--ink)]">حوكمة الذكاء الاصطناعي (FR-AI-01)</h3>
            </div>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              هذه الدورة مزودة بمساعد تعليمي سقراطي مؤصّل: يستند حصراً إلى محتوى الدورة، ولا يقدم إجابات الاختبارات الجاهزة، ويرفض الهلوسة بامتناع صريح عند غياب الأدلة.
            </p>
          </div>

          {/* Refund & Security Policy */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-6 space-y-3 text-xs text-[var(--ink-soft)]">
            <h3 className="text-sm font-bold text-[var(--ink)]">الضمان وسياسة الاسترداد</h3>
            <p className="leading-relaxed">
              وفق المخطط التنفيذي (FR-REFUND-01)، يمكنك طلب استرداد المبلغ خلال 14 يوماً مع توثيق السبب وإدراجه في سجل التدقيق المالي الموحد.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
