import React, { useState, useMemo } from 'react';
import { Course, Enrollment } from '../../shared/types';
import { CourseCard } from './CourseCard';
import { Search, BookOpen, Layers, CheckCircle2, Sparkles, Video, Library } from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  enrollments: Enrollment[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onViewCourse: (course: Course) => void;
  onEnrollCourse: (course: Course) => void;
  onOpenLibrary: () => void;
  onOpenClassroom: () => void;
}

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  enrollments,
  searchQuery,
  onSearchChange,
  onViewCourse,
  onEnrollCourse,
  onOpenLibrary,
  onOpenClassroom,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const categories = [
    { id: 'all', label: 'جميع البرامج' },
    { id: 'الحساب الذهني وتنمية الذكاء', label: 'الحساب الذهني والعداد الصيني' },
    { id: 'تأسيس اللغة العربية والقرائية', label: 'تأسيس اللغة العربية والقرائية' },
    { id: 'الرياضيات الذكية والتفكير المنطقي', label: 'الرياضيات الذكية والتفكير' },
    { id: 'إعداد وتأهيل المدربين (TOT)', label: 'إعداد وتأهيل المدربين (TOT)' },
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (searchQuery.trim()) {
        const queryNorm = normalizeArabic(searchQuery);
        const titleNorm = normalizeArabic(course.title);
        const summaryNorm = normalizeArabic(course.summary);
        const categoryNorm = normalizeArabic(course.category);
        const instructorNorm = normalizeArabic(course.instructor.name);

        const matches = 
          titleNorm.includes(queryNorm) ||
          summaryNorm.includes(queryNorm) ||
          categoryNorm.includes(queryNorm) ||
          instructorNorm.includes(queryNorm);

        if (!matches) return false;
      }

      if (selectedCategory !== 'all' && course.category !== selectedCategory) return false;
      if (selectedLevel !== 'all' && course.level !== selectedLevel) return false;
      if (priceFilter === 'free' && course.priceMinor > 0) return false;
      if (priceFilter === 'paid' && course.priceMinor === 0) return false;

      return true;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel, priceFilter]);

  return (
    <div className="space-y-10">
      
      {/* Hero Showcase Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--hero-b)] via-slate-900/95 to-amber-950/40 border border-[var(--line)] p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>برامج أكاديمية أ / سارة العربي • تأسيس أطفال . حساب ذهني</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--ink)] tracking-tight leading-tight">
            دورات وبرامج أكاديمية سارة العربي في الحساب الذهني والتأسيس الممتع
          </h1>

          <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed max-w-2xl">
            منهج تفاعلي متقدم مصمم للأطفال من سن 6 إلى 14 سنة، يجمع بين متعة العداد الصيني (السوروبان)، الحساب التخيلي السريع، وتأسيس القراءة والرياضيات بالفهم واللعب!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const first = courses[0];
                if (first) onViewCourse(first);
              }}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[var(--ink)] font-bold text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>استعراض دبلوم الحساب الذهني</span>
            </button>

            <button
              onClick={onOpenClassroom}
              className="px-5 py-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] font-bold text-sm border border-[var(--line)] transition-all flex items-center gap-2"
            >
              <Video className="w-4 h-4 text-amber-400" />
              <span>فصول البث المباشر والشاشة</span>
            </button>

            <button
              onClick={onOpenLibrary}
              className="px-5 py-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] font-semibold text-sm border border-[var(--line-strong)] transition-all flex items-center gap-2"
            >
              <Library className="w-4 h-4 text-cyan-400" />
              <span>مكتبة المراجع والكتب</span>
            </button>
          </div>

          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 text-xs text-[var(--ink-soft)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>فيديو عالي الدقة وسلس</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>تفريغ نصي وملاحظات مرتبطة</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>مساعد ذكي لشرح المفاهيم</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>شهادات إتمام موثقة برمز QR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400 text-[var(--ink)] font-bold shadow-md shadow-amber-400/20'
                    : 'bg-[var(--bg-elevated)] border border-[var(--line)] text-[var(--ink-soft)] hover:border-amber-400/40 hover:text-[var(--ink)]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-elevated)]/60 border border-[var(--line)] p-4 rounded-2xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--ink-soft)]">المستوى:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-[var(--bg-subtle)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-amber-400"
              >
                <option value="all">جميع المستويات</option>
                <option value="beginner">مبتدئ</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--ink-soft)]">السعر:</span>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="bg-[var(--bg-subtle)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-amber-400"
              >
                <option value="all">الكل</option>
                <option value="free">برامج مجانية</option>
                <option value="paid">برامج مدفوعة</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-[var(--ink-soft)] font-medium">
            تم العثور على <span className="font-bold text-amber-400">{filteredCourses.length}</span> برنامج تدريبي
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollments.find(e => e.courseId === course.id)}
              onViewCourse={onViewCourse}
              onQuickEnroll={onEnrollCourse}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--bg-elevated)]/40 border border-[var(--line)] rounded-3xl p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-[var(--ink-faint)] mx-auto" />
          <h3 className="text-lg font-bold text-[var(--ink)]">لم يتم العثور على دورات تطابق معايير البحث</h3>
          <p className="text-xs text-[var(--ink-soft)] max-w-md mx-auto">
            جرب تعديل كلمات البحث لتصفح جميع دورات المنصة.
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              setSelectedCategory('all');
              setSelectedLevel('all');
              setPriceFilter('all');
            }}
            className="px-4 py-2 bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] text-xs font-semibold rounded-xl"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}

    </div>
  );
};
