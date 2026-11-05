import React from 'react';
import { Clock, Star, BookOpen, CheckCircle, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { Course, Enrollment } from '../../shared/types';

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  onViewCourse: (course: Course) => void;
  onQuickEnroll: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  enrollment,
  onViewCourse,
  onQuickEnroll,
}) => {
  const isEnrolled = !!enrollment && enrollment.status === 'active';

  const levelLabels: Record<string, { label: string; color: string }> = {
    beginner: { label: 'مبتدئ', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    intermediate: { label: 'متوسط', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    advanced: { label: 'متقدم', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    all_levels: { label: 'جميع المستويات', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  };

  const levelInfo = levelLabels[course.level] || levelLabels.all_levels;
  const isFree = course.priceMinor === 0;

  return (
    <div className="group bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all flex flex-col justify-between">
      
      {/* Top Banner / Image */}
      <div>
        <div className="relative h-48 overflow-hidden bg-[var(--bg-subtle)]">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-a)] via-slate-950/40 to-transparent" />
          
          {/* Level badge */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border backdrop-blur-md ${levelInfo.color}`}>
              {levelInfo.label}
            </span>
          </div>

          {/* Enrolled Status or Price Tag */}
          <div className="absolute top-3 left-3">
            {isEnrolled ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/90 text-[var(--ink)] shadow-md">
                <CheckCircle className="w-3.5 h-3.5" />
                ملتحق
              </span>
            ) : isFree ? (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                دورة مجانية
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                ${(course.priceMinor / 100).toFixed(0)} USD
              </span>
            )}
          </div>

          {/* Duration & Lessons count badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-[var(--ink-soft)] font-medium">
            <span className="flex items-center gap-1 bg-[var(--bg-elevated)]/80 px-2 py-0.5 rounded backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {course.durationHours} ساعة
            </span>
            <span className="flex items-center gap-1 bg-[var(--bg-elevated)]/80 px-2 py-0.5 rounded backdrop-blur-sm">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} درساً
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="text-[11px] font-semibold text-cyan-400 mb-1.5 flex items-center gap-1.5">
            <span>{course.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[var(--ink-soft)]">
              <Sparkles className="w-3 h-3 text-amber-400" />
              مساعد سقراطي
            </span>
          </div>

          <h3 
            onClick={() => onViewCourse(course)}
            className="text-base font-bold text-[var(--ink)] hover:text-cyan-300 cursor-pointer transition-colors line-clamp-1 mb-2"
          >
            {course.title}
          </h3>

          <p className="text-xs text-[var(--ink-soft)] line-clamp-2 leading-relaxed mb-4">
            {course.summary}
          </p>

          {/* Key Outcomes preview */}
          <div className="space-y-1.5 mb-4 bg-[var(--bg-elevated)]/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider">مخرجات التعلم الأساسية:</div>
            {course.outcomes.slice(0, 2).map((outcome, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-[var(--ink-soft)]">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{outcome}</span>
              </div>
            ))}
          </div>

          {/* Instructor & Rating */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <img
                src={course.instructor.avatarUrl}
                alt={course.instructor.name}
                className="w-7 h-7 rounded-full object-cover border border-[var(--line-strong)]"
              />
              <span className="text-[var(--ink-soft)] font-medium truncate max-w-[120px]">
                {course.instructor.name}
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{course.rating.toFixed(2)}</span>
              <span className="text-[var(--ink-soft)] font-normal text-[11px]">({course.reviewsCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-5 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewCourse(course)}
            className="w-full py-2 px-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>التفاصيل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {isEnrolled ? (
            <button
              onClick={() => onViewCourse(course)}
              className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[var(--ink)] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>متابعة التعلم</span>
            </button>
          ) : (
            <button
              onClick={() => onQuickEnroll(course)}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <span>{isFree ? 'التحاق مجاني' : 'شراء الدورة'}</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
