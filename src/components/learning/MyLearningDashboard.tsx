import React from 'react';
import { Course, Enrollment, Certificate, LessonProgress } from '../../shared/types';
import { BookOpen, Award, CheckCircle, Clock, PlayCircle, ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';

interface MyLearningDashboardProps {
  courses: Course[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  progressMap: Record<string, LessonProgress>;
  onSelectCourse: (course: Course) => void;
  onViewCertificate: (cert: Certificate) => void;
  onOpenCatalog: () => void;
}

export const MyLearningDashboard: React.FC<MyLearningDashboardProps> = ({
  courses,
  enrollments,
  certificates,
  progressMap,
  onSelectCourse,
  onViewCertificate,
  onOpenCatalog,
}) => {
  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const enrolledCourses = courses.filter(c => activeEnrollments.some(e => e.courseId === c.id));

  const totalLessonsInEnrolled = enrolledCourses.reduce(
    (acc, c) => acc + c.sections.reduce((sAcc, s) => sAcc + s.lessons.length, 0),
    0
  );

  const completedCount = Object.values(progressMap).filter(p => p.completed).length;

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Stats Banner */}
      <div className="bg-gradient-to-r from-[var(--hero-b)] via-[var(--hero-b)] to-indigo-950/60 border border-[var(--line)] p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>لوحة مسار التعلم الشخصي • ORBIT Learner 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)]">مرحباً بك في مسارك الهندسي</h1>
            <p className="text-xs text-[var(--ink-soft)] max-w-md leading-relaxed">
              تابع دروسك، وتفاعل مع المساعد السقراطي، وحقق متطلبات إصدار شهادات مدار الموثقة تشفيرياً.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-[var(--bg-elevated)]/80 border border-[var(--line)] p-4 rounded-2xl text-center min-w-[100px]">
              <div className="text-2xl font-black text-cyan-400 font-mono">{enrolledCourses.length}</div>
              <div className="text-[11px] text-[var(--ink-soft)] mt-0.5">دورات ملتحق بها</div>
            </div>

            <div className="bg-[var(--bg-elevated)]/80 border border-[var(--line)] p-4 rounded-2xl text-center min-w-[100px]">
              <div className="text-2xl font-black text-emerald-400 font-mono">{completedCount}</div>
              <div className="text-[11px] text-[var(--ink-soft)] mt-0.5">دروس منجزة</div>
            </div>

            <div className="bg-[var(--bg-elevated)]/80 border border-[var(--line)] p-4 rounded-2xl text-center min-w-[100px]">
              <div className="text-2xl font-black text-amber-400 font-mono">{certificates.length}</div>
              <div className="text-[11px] text-[var(--ink-soft)] mt-0.5">شهادات موثقة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>دوراتي ومساراتي النشطة ({enrolledCourses.length})</span>
          </h2>

          <button
            onClick={onOpenCatalog}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>استكشاف المزيد من الدورات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map(course => {
              const allLessons = course.sections.flatMap(s => s.lessons);
              const courseCompletedCount = allLessons.filter(l => progressMap[l.id]?.completed).length;
              const percent = allLessons.length > 0 ? Math.round((courseCompletedCount / allLessons.length) * 100) : 0;

              return (
                <div
                  key={course.id}
                  className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-5 space-y-4 hover:border-cyan-500/40 transition-colors shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-cyan-400">{course.category}</span>
                        <h3 className="text-base font-bold text-[var(--ink)] mt-1 line-clamp-1">{course.title}</h3>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {percent}%
                      </span>
                    </div>

                    <p className="text-xs text-[var(--ink-soft)] line-clamp-2 leading-relaxed">
                      {course.summary}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-[var(--ink-soft)] flex items-center justify-between">
                        <span>أنجزت {courseCompletedCount} من {allLessons.length} درساً</span>
                        <span className="text-[var(--ink-soft)]">{course.durationHours} ساعة</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
                      <img
                        src={course.instructor.avatarUrl}
                        alt={course.instructor.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-[var(--ink-soft)]">{course.instructor.name}</span>
                    </div>

                    <button
                      onClick={() => onSelectCourse(course)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>متابعة الدرس</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-6 space-y-3">
            <BookOpen className="w-10 h-10 text-[var(--ink-faint)] mx-auto" />
            <h3 className="text-base font-bold text-[var(--ink)]">لم تلتحق بأي دورة بعد</h3>
            <p className="text-xs text-[var(--ink-soft)] max-w-sm mx-auto">
              تصفح كتالوج الدورات والتحق بالدورات المجانية أو المدفوعة لبدء رحلتك.
            </p>
            <button
              onClick={onOpenCatalog}
              className="px-5 py-2 bg-cyan-500 text-[var(--ink)] text-xs font-bold rounded-xl"
            >
              استعراض كتالوج الدورات
            </button>
          </div>
        )}
      </div>

      {/* Earned Certificates Section */}
      <div className="space-y-4 pt-6 border-t border-[var(--line)]">
        <h2 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>شهاداتي المعتمدة في السجل التشفيري ({certificates.length})</span>
        </h2>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map(cert => (
              <div
                key={cert.id}
                className="bg-[var(--bg-elevated)] border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-lg flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      درجة {cert.gradePercentage}%
                    </span>
                    <span className="text-xs text-[var(--ink-soft)]">
                      {new Date(cert.issuedAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--ink)]">{cert.courseTitle}</h4>
                  <div className="font-mono text-xs text-cyan-400">{cert.verificationCode}</div>
                </div>

                <button
                  onClick={() => onViewCertificate(cert)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] hover:text-[var(--ink)] text-xs font-semibold border border-[var(--line-strong)] transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>عرض الشهادة</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-6 text-center text-xs text-[var(--ink-soft)]">
            أكمل جميع دروس الدورة واجتز الاختبار النهائي بنسبة 70% أو أكثر لإصدار شهادتك المعتمدة تلقائياً.
          </div>
        )}
      </div>

    </div>
  );
};
