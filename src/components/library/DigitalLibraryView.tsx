import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  Clock, 
  User, 
  CheckCircle, 
  X, 
  Layers, 
  ChevronRight, 
  Bookmark,
  Share2
} from 'lucide-react';

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  pagesCount: number;
  coverUrl: string;
  description: string;
  downloadUrl: string;
  publishedYear: number;
  chapters?: { number: number; title: string; pages: string }[];
}

interface DigitalLibraryViewProps {
  books: LibraryBook[];
}

export const DigitalLibraryView: React.FC<DigitalLibraryViewProps> = ({ books }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [savedBooks, setSavedBooks] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'جميع المراجع وأوراق العمل' },
    { id: 'الحساب الذهني وتنمية الذكاء', label: 'الحساب الذهني والعداد الصيني' },
    { id: 'تأسيس اللغة العربية والقرائية', label: 'تأسيس اللغة العربية ونور البيان' },
    { id: 'الرياضيات الذكية والتفكير المنطقي', label: 'الرياضيات الذكية (Smart Math)' },
    { id: 'إعداد وتأهيل المدربين - العباقرة الصغار', label: 'إعداد وتأهيل المدربين (TOT)' },
  ];

  const filteredBooks = books.filter(b => {
    if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleSaveBook = (bookId: string) => {
    setSavedBooks(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[var(--hero-b)] via-[var(--hero-b)] to-amber-950/40 border border-[var(--line)] p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="text-xs font-semibold text-amber-300 flex items-center gap-2">
            <span>مكتبة التأسيس والمراجع الرقمية • أ / سارة العربي</span>
            <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded text-amber-200">تأسيس أطفال . حساب ذهني</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] leading-tight">
            مكتبة المراجع وأوراق العمل التفاعلية للأطفال
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed">
            استعرض وحمّل كراسات تدريب العداد الصيني، بطاقات نور البيان الصوتية، وأدلة تدريب المدربين المعتمدة لمساندة طفلك في رحلة تأسيس أطفال وحساب ذهني ممتعة.
          </p>
        </div>

        <div className="bg-[var(--bg-elevated)]/80 border border-[var(--line)] p-5 rounded-2xl text-center min-w-[140px] shrink-0">
          <div className="text-3xl font-black text-amber-400 font-mono">{books.length}</div>
          <div className="text-xs text-[var(--ink-soft)] mt-1">مراجع وكتيبات معتمدة</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Categories row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-cyan-500 text-[var(--ink)] font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-[var(--bg-elevated)] text-[var(--ink-soft)] hover:text-[var(--ink)] border border-[var(--line)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[var(--ink-soft)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالعنوان أو اسم المؤلف أو الموضوع..."
            className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded-xl pr-10 pl-4 py-2.5 text-xs text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBooks.map(book => {
          const isSaved = savedBooks.has(book.id);
          return (
            <div
              key={book.id}
              className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-lg hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
            >
              {/* Book Cover */}
              <div className="relative aspect-[3/4] bg-[var(--bg-subtle)] overflow-hidden">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-a)] via-slate-950/20 to-transparent" />
                
                <button
                  onClick={() => toggleSaveBook(book.id)}
                  className={`absolute top-3 left-3 p-2 rounded-xl backdrop-blur-md transition-colors ${
                    isSaved ? 'bg-cyan-500 text-[var(--ink)]' : 'bg-[var(--bg-elevated)]/80 text-[var(--ink-soft)] hover:text-[var(--ink)]'
                  }`}
                  title={isSaved ? 'إزالة من قائمة القراءة' : 'حفظ في قائمة القراءة'}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>

                <div className="absolute bottom-3 right-3 text-[11px] text-[var(--ink-soft)] font-mono bg-[var(--bg-elevated)]/90 px-2 py-0.5 rounded backdrop-blur-md">
                  {book.pagesCount} صفحة
                </div>
              </div>

              {/* Book Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-cyan-400 font-semibold mb-1">{book.category}</div>
                  <h3 className="text-sm font-bold text-[var(--ink)] line-clamp-2 leading-snug">{book.title}</h3>
                  <div className="text-xs text-[var(--ink-soft)] mt-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[var(--ink-faint)]" />
                    <span>{book.author}</span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-soft)] line-clamp-2 leading-relaxed mt-2">
                    {book.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedBook(book);
                      setActiveChapterIndex(0);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>تصفح الفهرس</span>
                  </button>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`تم بدء تنزيل النسخة الرقمية لكتاب: ${book.title}`);
                    }}
                    className="p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 hover:text-[var(--ink)] text-cyan-300 transition-colors"
                    title="تحميل المرجع PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Book Reader / Chapters Preview Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
              <div className="space-y-1">
                <span className="text-xs text-cyan-400 font-semibold">{selectedBook.category}</span>
                <h2 className="text-lg font-bold text-[var(--ink)]">{selectedBook.title}</h2>
                <div className="text-xs text-[var(--ink-soft)] flex items-center gap-3">
                  <span>المؤلف: {selectedBook.author}</span>
                  <span>•</span>
                  <span>{selectedBook.pagesCount} صفحة</span>
                  <span>•</span>
                  <span>سنة النشر: {selectedBook.publishedYear}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBook(null)}
                className="p-1.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chapters list and Preview */}
            <div className="flex-1 overflow-y-auto space-y-4">
              <h3 className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider">
                فهرس الفصول والمواضيع المعتمدة:
              </h3>

              <div className="space-y-2">
                {selectedBook.chapters?.map((chap, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      activeChapterIndex === idx
                        ? 'bg-cyan-500/15 border-cyan-500 text-[var(--ink)]'
                        : 'bg-[var(--bg-inset)] border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center font-mono text-[11px] font-bold text-cyan-400">
                        {chap.number}
                      </span>
                      <span className="font-semibold">{chap.title}</span>
                    </div>

                    <span className="text-[11px] text-[var(--ink-faint)] font-mono">صفحات {chap.pages}</span>
                  </div>
                ))}
              </div>

              {/* Sample Excerpt Reader Box */}
              <div className="bg-[var(--bg-inset)] p-4 rounded-2xl border border-[var(--line)] space-y-2">
                <div className="text-[11px] font-bold text-cyan-400">
                  مقتطف من {selectedBook.chapters?.[activeChapterIndex]?.title || 'المقدمة'}:
                </div>
                <p className="text-xs text-[var(--ink-soft)] leading-relaxed font-sans">
                  "إن بناء الأنظمة الرقمية الحديثة يتطلب توازناً دقيقاً بين سهولة القراءة البرمجية والصلابة التشغيلية. في هذا الفصل، نركز على كيفية تطبيق المعايير العلمية خطوة بخطوة وتفادي الأخطاء الشائعة في بيئات الإنتاج الحية..."
                </p>
              </div>
            </div>

            {/* Modal Bottom Action */}
            <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--ink-soft)] text-xs font-semibold"
              >
                إغلاق
              </button>

              <button
                onClick={() => {
                  alert(`تم بدء تحميل ملف الكتاب الكامل (${selectedBook.title}.pdf)`);
                  setSelectedBook(null);
                }}
                className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>تحميل النسخة الكاملة (PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
