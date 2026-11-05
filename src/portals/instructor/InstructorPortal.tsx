import React, { useState } from 'react';
import { 
  Course, 
  Lesson, 
  CourseSection, 
  CourseStatus, 
  LiveSession, 
  Assignment, 
  StudentSubmission, 
  User 
} from '../../shared/types';
import { 
  Layers, 
  UploadCloud, 
  Video, 
  FileCheck2, 
  BarChart3, 
  Plus, 
  Save, 
  CheckCircle, 
  Clock, 
  Edit3, 
  Radio, 
  Sparkles, 
  BookOpen, 
  Library, 
  Film, 
  Trash2, 
  Play, 
  Eye, 
  Download, 
  Star,
  Award,
  ChevronRight,
  ExternalLink,
  GripVertical,
  ChevronUp,
  ChevronDown,
  FileVideo,
  Check,
  Move,
  ArrowUpDown,
  FolderPlus,
  FileText,
  ThumbsUp,
  Heart,
  Search
} from 'lucide-react';
import { saveCourse, getLibraryBooks, createLibraryBook, deleteLibraryBook, getShorts, createShort, deleteShort, uploadMediaFile } from '../../services/api';
import type { LibraryBookItem as LiveBook } from '../../services/api';

// تحويل سجل القاعدة إلى نموذج الواجهة (views/likes أرقام → نص مختصر للعرض)
const fmtK = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : String(n || 0);

interface InstructorPortalProps {
  currentUser: User;
  courses: Course[];
  liveSessions: LiveSession[];
  assignments: Assignment[];
  submissions: StudentSubmission[];
  onCourseUpdated: (course: Course) => void;
  onLaunchLiveHost: (session: LiveSession) => void;
  onGradeSubmission: (subId: string, grade: number, feedback: string) => void;
  onSwitchPortal: (portal: string) => void;
}

type LibraryBook = LiveBook & { chapters?: any };

interface EducationalShort {
  id: string;
  title: string;
  duration: string;
  views: string;
  likes: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
}

export const InstructorPortal: React.FC<InstructorPortalProps> = ({
  currentUser,
  courses,
  liveSessions,
  assignments,
  submissions,
  onCourseUpdated,
  onLaunchLiveHost,
  onGradeSubmission,
  onSwitchPortal,
}) => {
  // Navigation Tabs
  const [activeSection, setActiveSection] = useState<'curriculum' | 'library' | 'shorts' | 'live' | 'grading'>('curriculum');
  
  // Selected course for curriculum manager
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0] || null);

  // Course editing state
  const [courseTitle, setCourseTitle] = useState<string>(selectedCourse?.title || '');
  const [courseSummary, setCourseSummary] = useState<string>(selectedCourse?.summary || '');
  const [coursePrice, setCoursePrice] = useState<number>(selectedCourse?.priceMinor || 0);
  const [courseStatus, setCourseStatus] = useState<CourseStatus>(selectedCourse?.status || 'draft');

  // New Lesson Modal / Form State
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [newLessonDuration, setNewLessonDuration] = useState('420');
  const [newLessonIsPreview, setNewLessonIsPreview] = useState(false);
  const [newLessonTag, setNewLessonTag] = useState('حساب ذهني');

  // Video Lesson Preview inside studio
  const [previewLessonUrl, setPreviewLessonUrl] = useState<string | null>(null);

  // Drag and Drop State for Sections & Lessons
  const [draggedSectionIdx, setDraggedSectionIdx] = useState<number | null>(null);
  const [dragOverSectionIdx, setDragOverSectionIdx] = useState<number | null>(null);
  const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ sectionId: string; lessonIdx: number } | null>(null);
  const [dragOverLessonInfo, setDragOverLessonInfo] = useState<{ sectionId: string; lessonIdx: number } | null>(null);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  // Video Drag & Drop Uploader Dropzone State
  const [isDropzoneHovered, setIsDropzoneHovered] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedVideoFileName, setUploadedVideoFileName] = useState<string | null>(null);
  const [uploadTargetSectionId, setUploadTargetSectionId] = useState<string>('');

  // Digital Library Manager State
  const [libraryBooksList, setLibraryBooksList] = useState<LibraryBook[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  // تحميل المكتبة من قاعدة البيانات الحية عند فتح اللوحة
  React.useEffect(() => {
    let alive = true;
    getLibraryBooks().then(rows => { if (alive) { setLibraryBooksList(rows as LibraryBook[]); setLibraryLoading(false); } })
      .catch(e => { if (alive) { setLibraryError(String(e?.message || e)); setLibraryLoading(false); } });
    return () => { alive = false; };
  }, []);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('الحساب الذهني والسوروبان');
  const [newBookPages, setNewBookPages] = useState(80);
  const [newBookCover, setNewBookCover] = useState('https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80');
  const [newBookDesc, setNewBookDesc] = useState('');
  const [isBookDropzoneHovered, setIsBookDropzoneHovered] = useState(false);
  const [bookUploadProgress, setBookUploadProgress] = useState<number | null>(null);
  const [uploadedBookFileName, setUploadedBookFileName] = useState<string | null>(null);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [bookCategoryFilter, setBookCategoryFilter] = useState('all');

  // Educational Shorts & Reels Manager State
  const [shortsList, setShortsList] = useState<EducationalShort[]>([]);
  const [shortsLoading, setShortsLoading] = useState(true);
  const [shortsError, setShortsError] = useState<string | null>(null);

  // تحميل الشورتس من قاعدة البيانات الحية
  React.useEffect(() => {
    let alive = true;
    getShorts().then(rows => {
      if (!alive) return;
      setShortsList((rows as any[]).map(r => ({ ...r, views: fmtK(Number(r.views) || 0), likes: fmtK(Number(r.likes) || 0) })));
      setShortsLoading(false);
    }).catch(e => { if (alive) { setShortsError(String(e?.message || e)); setShortsLoading(false); } });
    return () => { alive = false; };
  }, []);
  const [isAddingShort, setIsAddingShort] = useState(false);
  const [newShortTitle, setNewShortTitle] = useState('');
  const [newShortVideoUrl, setNewShortVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [newShortCategory, setNewShortCategory] = useState('حساب ذهني');
  const [newShortDuration, setNewShortDuration] = useState('0:50');
  const [newShortThumbnail, setNewShortThumbnail] = useState('https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80');
  const [pendingBookFileUrl, setPendingBookFileUrl] = useState<string>('');
  const [pendingBookCover, setPendingBookCover] = useState<string>('');
  const [pendingShortVideoUrl, setPendingShortVideoUrl] = useState<string>('');
  const [pendingShortThumb, setPendingShortThumb] = useState<string>('');
  const [isShortsDropzoneHovered, setIsShortsDropzoneHovered] = useState(false);
  const [shortsUploadProgress, setShortsUploadProgress] = useState<number | null>(null);
  const [uploadedShortFileName, setUploadedShortFileName] = useState<string | null>(null);
  const [shortsCategoryFilter, setShortsCategoryFilter] = useState('all');

  // Grading Modal State
  const [gradingSub, setGradingSub] = useState<StudentSubmission | null>(null);
  const [gradeStars, setGradeStars] = useState<number>(5);
  const [gradeFeedback, setGradeFeedback] = useState<string>('ما شاء الله عليك يا بطل! تطبيق ممتاز لتمارين العداد الصيني، استمر في التدريب اليومي 🌟');

  const handleSelectCourse = (c: Course) => {
    setSelectedCourse(c);
    setCourseTitle(c.title);
    setCourseSummary(c.summary);
    setCoursePrice(c.priceMinor);
    setCourseStatus(c.status);
  };

  const handleSaveCourse = async () => {
    if (!selectedCourse) return;
    const updated: Course = {
      ...selectedCourse,
      title: courseTitle,
      summary: courseSummary,
      priceMinor: coursePrice,
      status: courseStatus,
      version: selectedCourse.version + 1,
      updatedAt: new Date().toISOString()
    };
    await saveCourse(updated);
    onCourseUpdated(updated);
    setSelectedCourse(updated);
    alert('تم حفظ تفاصيل وتعديلات الدورة بنجاح!');
  };

  // Add Section to Course
  const handleAddSection = async () => {
    if (!selectedCourse) return;
    const newSec: CourseSection = {
      id: 'sec-' + Date.now(),
      courseId: selectedCourse.id,
      title: `الوحدة ${selectedCourse.sections.length + 1}: مهارات تفاعلية جديدة (تأسيس أطفال . حساب ذهني)`,
      position: selectedCourse.sections.length + 1,
      lessons: []
    };
    const updated: Course = {
      ...selectedCourse,
      sections: [...selectedCourse.sections, newSec]
    };
    await saveCourse(updated);
    onCourseUpdated(updated);
    setSelectedCourse(updated);
  };

  // Add Lesson to Section
  const handleCreateLesson = async () => {
    if (!selectedCourse || !targetSectionId || !newLessonTitle.trim()) return;

    const newLes: Lesson = {
      id: 'les-' + Date.now(),
      sectionId: targetSectionId,
      title: newLessonTitle.trim(),
      lessonKind: 'video',
      durationSeconds: parseInt(newLessonDuration, 10) || 300,
      position: 1,
      isPreview: newLessonIsPreview,
      videoUrl: newLessonVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      bodyMarkdown: `### الدرس: ${newLessonTitle}\nمع مس سارة العربي 💡\nتأسيس أطفال . حساب ذهني.. تدرب بالعداد خطوة بخطوة!`
    };

    const updatedSections = selectedCourse.sections.map(sec => {
      if (sec.id === targetSectionId) {
        return {
          ...sec,
          lessons: [...sec.lessons, newLes]
        };
      }
      return sec;
    });

    const updatedCourse: Course = {
      ...selectedCourse,
      sections: updatedSections,
      updatedAt: new Date().toISOString()
    };

    await saveCourse(updatedCourse);
    onCourseUpdated(updatedCourse);
    setSelectedCourse(updatedCourse);
    setIsAddingLesson(false);
    setNewLessonTitle('');
    alert('تمت إضافة وتثبيت الفيديو التعليمي بنجاح!');
  };

  const showToast = (msg: string) => {
    setReorderSuccessMsg(msg);
    setTimeout(() => {
      setReorderSuccessMsg(null);
    }, 3500);
  };

  // Section Reorder Drag & Drop
  const handleSectionDrop = async (targetIdx: number) => {
    if (draggedSectionIdx === null || draggedSectionIdx === targetIdx || !selectedCourse) {
      setDraggedSectionIdx(null);
      setDragOverSectionIdx(null);
      return;
    }
    const newSections = [...selectedCourse.sections];
    const [moved] = newSections.splice(draggedSectionIdx, 1);
    newSections.splice(targetIdx, 0, moved);
    newSections.forEach((s, i) => { s.position = i + 1; });
    const updated: Course = { ...selectedCourse, sections: newSections, updatedAt: new Date().toISOString() };
    await saveCourse(updated);
    onCourseUpdated(updated);
    setSelectedCourse(updated);
    setDraggedSectionIdx(null);
    setDragOverSectionIdx(null);
    showToast('تم تحديث وترتيب وحدات الكورس بنجاح! 🧮');
  };

  const handleMoveSection = async (fromIdx: number, toIdx: number) => {
    if (!selectedCourse || toIdx < 0 || toIdx >= selectedCourse.sections.length) return;
    const newSections = [...selectedCourse.sections];
    const [moved] = newSections.splice(fromIdx, 1);
    newSections.splice(toIdx, 0, moved);
    newSections.forEach((s, i) => { s.position = i + 1; });
    const updated: Course = { ...selectedCourse, sections: newSections, updatedAt: new Date().toISOString() };
    await saveCourse(updated);
    onCourseUpdated(updated);
    setSelectedCourse(updated);
    showToast('تم نقل الوحدة بنجاح!');
  };

  // Lesson Reorder Drag & Drop
  const handleLessonDrop = async (targetSectionId: string, targetLessonIdx: number) => {
    if (!draggedLessonInfo || !selectedCourse) {
      setDraggedLessonInfo(null);
      setDragOverLessonInfo(null);
      return;
    }
    const { sectionId: srcSectionId, lessonIdx: srcLessonIdx } = draggedLessonInfo;
    if (srcSectionId === targetSectionId && srcLessonIdx === targetLessonIdx) {
      setDraggedLessonInfo(null);
      setDragOverLessonInfo(null);
      return;
    }

    const newSections = selectedCourse.sections.map(sec => ({
      ...sec,
      lessons: [...sec.lessons]
    }));

    const srcSec = newSections.find(s => s.id === srcSectionId);
    const destSec = newSections.find(s => s.id === targetSectionId);
    if (!srcSec || !destSec) return;

    const [movedLesson] = srcSec.lessons.splice(srcLessonIdx, 1);
    movedLesson.sectionId = targetSectionId;
    destSec.lessons.splice(targetLessonIdx, 0, movedLesson);

    destSec.lessons.forEach((l, i) => { l.position = i + 1; });
    if (srcSec !== destSec) {
      srcSec.lessons.forEach((l, i) => { l.position = i + 1; });
    }

    const updated: Course = { ...selectedCourse, sections: newSections, updatedAt: new Date().toISOString() };
    await saveCourse(updated);
    onCourseUpdated(updated);
    setSelectedCourse(updated);
    setDraggedLessonInfo(null);
    setDragOverLessonInfo(null);
    showToast('تم حفظ ترتيب الدروس والفيديوهات تلقائياً! 🎬');
  };

  const handleMoveLesson = async (sectionId: string, fromIdx: number, toIdx: number) => {
    if (!selectedCourse) return;
    const newSections = selectedCourse.sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      if (toIdx < 0 || toIdx >= sec.lessons.length) return sec;
      const updatedLessons = [...sec.lessons];
      const [moved] = updatedLessons.splice(fromIdx, 1);
      updatedLessons.splice(toIdx, 0, moved);
      updatedLessons.forEach((l, i) => { l.position = i + 1; });
      return { ...sec, lessons: updatedLessons };
    });

    const updated: Course = { ...selectedCourse, sections: newSections, updatedAt: new Date().toISOString() };
    await saveCourse(updated);
    onCourseUpdated(updated);
    setSelectedCourse(updated);
    showToast('تم تغيير ترتيب الدرس بنجاح!');
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!selectedCourse || !confirm('هل أنتِ متأكدة من حذف هذا الدرس من المنهج؟')) return;
    const newSections = selectedCourse.sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        lessons: sec.lessons.filter(l => l.id !== lessonId)
      };
    });
    const updated: Course = { ...selectedCourse, sections: newSections, updatedAt: new Date().toISOString() };
    await saveCourse(updated);
    onCourseUpdated(updated);
    setSelectedCourse(updated);
    showToast('تم حذف الدرس بنجاح');
  };

  // Video Drag & Drop Uploader Simulation
  const handleVideoFileDrop = (e: React.DragEvent<HTMLDivElement>, sectionId?: string) => {
    e.preventDefault();
    setIsDropzoneHovered(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processVideoUpload(files[0], sectionId);
    }
  };

  const processVideoUpload = async (file: File | { name: string; size?: number }, sectionId?: string) => {
    const targetSec = sectionId || uploadTargetSectionId || selectedCourse?.sections[0]?.id;
    if (!targetSec) {
      alert('برجاء تحديد وحدة لإضافة الفيديو إليها أولاً');
      return;
    }
    if (!(file instanceof File)) {
      alert('يلزم اختيار ملف فيديو حقيقي من الجهاز');
      return;
    }
    setUploadedVideoFileName(file.name);
    setUploadProgress(1);
    try {
      // رفع فعلي للبايتات إلى الخادم — بدون أي محاكاة تقدم وهمية
      const up = await uploadMediaFile(file, { kind: 'video', user: { id: currentUser.id, name: currentUser.displayName }, course: selectedCourse?.id, lesson: undefined });
      setUploadProgress(90);
      const dur = await new Promise<number>((resolve) => {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => resolve(Math.round(v.duration) || 0);
        v.onerror = () => resolve(0);
        v.src = up.url;
        setTimeout(() => resolve(Math.round(v.duration) || 0), 4000);
      });
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const newLes: Lesson = {
        id: 'les-' + Date.now(),
        sectionId: targetSec,
        title: `درس: ${cleanTitle}`,
        lessonKind: 'video',
        durationSeconds: dur || 420,
        position: 99,
        isPreview: false,
        videoUrl: up.url,
        bodyMarkdown: `### ${cleanTitle}\nمع أ / سارة العربي 💡\nفيديو تعليمي حقيقي مرفوع (${(up.bytes / 1048576).toFixed(1)}MB، بصمة ${up.sha256.slice(0, 10)}) عبر استوديو الرفع.`
      };
      if (selectedCourse) {
        const updatedSections = selectedCourse.sections.map(sec => sec.id === targetSec ? { ...sec, lessons: [...sec.lessons, newLes] } : sec);
        const updatedCourse: Course = { ...selectedCourse, sections: updatedSections, updatedAt: new Date().toISOString() };
        await saveCourse({ ...updatedCourse, updatedBy: currentUser.id, updatedByName: currentUser.displayName } as any);
        onCourseUpdated(updatedCourse);
        setSelectedCourse(updatedCourse);
      }
      setUploadProgress(null);
      setUploadedVideoFileName(null);
      showToast(`تم رفع الفيديو الحقيقي «${cleanTitle}» (${(up.bytes / 1048576).toFixed(1)}MB) وإضافته للمنهج! 🚀`);
    } catch (e: any) {
      setUploadProgress(null);
      setUploadedVideoFileName(null);
      alert('فشل الرفع الحقيقي: ' + String(e?.message || e));
    }
  };

  // Library: Add Book
  const handleCreateBook = async () => {
    if (!newBookTitle.trim()) return;
    try {
      const created = await createLibraryBook({
        title: newBookTitle.trim(),
        author: 'أ / سارة العربي',
        category: newBookCategory,
        pagesCount: Number(newBookPages) || 60,
        coverUrl: pendingBookCover || newBookCover || 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
        description: newBookDesc || 'مذكرة تدريب وشيتات عمل تفاعلية للأطفال مصممة خصيصاً لتعزيز الفهم والتطبيق العملي.',
        downloadUrl: pendingBookFileUrl || '#',
        publishedYear: 2026,
        instructorId: currentUser.id,
      });
      const rows = await getLibraryBooks();
      setLibraryBooksList(rows as LibraryBook[]);
      setIsAddingBook(false);
      setNewBookTitle('');
      setNewBookDesc('');
      setPendingBookFileUrl('');
      setPendingBookCover('');
      showToast('تم نشر المذكرة / الكتاب في المكتبة الرقمية بقاعدة البيانات بنجاح!');
    } catch (e: any) {
      alert('فشل النشر في قاعدة البيانات: ' + String(e?.message || e));
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذا الكتاب من المكتبة؟')) return;
    try {
      await deleteLibraryBook(id);
      setLibraryBooksList(prev => prev.filter(b => b.id !== id));
      showToast('تم حذف الكتاب من قاعدة البيانات');
    } catch (e: any) {
      alert('تعذر الحذف: ' + String(e?.message || e));
    }
  };

  // Shorts: Add Short
  const handleCreateShort = async () => {
    if (!newShortTitle.trim()) return;
    try {
      await createShort({
        title: newShortTitle.trim(),
        videoUrl: pendingShortVideoUrl || newShortVideoUrl,
        category: newShortCategory,
        duration: newShortDuration,
        thumbnail: pendingShortThumb || newShortThumbnail,
        instructorId: currentUser.id,
      });
      const rows = await getShorts();
      setShortsList((rows as any[]).map(r => ({ ...r, views: fmtK(Number(r.views) || 0), likes: fmtK(Number(r.likes) || 0) })));
      setIsAddingShort(false);
      setNewShortTitle('');
      setPendingShortVideoUrl('');
      setPendingShortThumb('');
      showToast('تم نشر فيديو الشورتس في استوديو الأبطال بقاعدة البيانات!');
    } catch (e: any) {
      alert('فشل النشر: ' + String(e?.message || e));
    }
  };

  const handleDeleteShort = async (id: string) => {
    try {
      await deleteShort(id);
      setShortsList(prev => prev.filter(x => x.id !== id));
      showToast('تم حذف الشورتس من قاعدة البيانات');
    } catch (e: any) {
      alert('تعذر الحذف: ' + String(e?.message || e));
    }
  };

  // Drag & Drop Uploader for Library Books and Educational Worksheets (PDF)
  const handleBookFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsBookDropzoneHovered(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processBookUpload(files[0]);
    }
  };

  // أزرار «النماذج السريعة»: تُولّد ملف PDF حقيقياً من نص عربي بسيط ثم تُرفعه فعلياً للخادم
  const makeQuickPdf = (text: string): File => {
    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const lines = text.split('\n');
    let stream = 'BT /F1 12 Tf 40 780 Td 16 TL\n';
    lines.forEach((ln, i) => { stream += `(${esc(i === 0 ? ln : '  ' + ln)}) Tj T*\n`; });
    stream += 'ET';
    const objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];
    let pdf = '%PDF-1.4\n';
    const offs: number[] = [];
    objs.forEach((o, i) => { offs.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('');
    pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new File([pdf], 'sheet.pdf', { type: 'application/pdf' });
  };

  const processBookUpload = async (file: File | { name: string; category?: string; pages?: number; cover?: string }) => {
    if (!(file instanceof File)) {
      // نموذج سريع: توليد ورفع PDF حقيقي بدل أي محاكاة
      const qf = file as any;
      const generated = makeQuickPdf(`${qf.name}\nمذكرة تدريب وشيتات عمل - منصة ORBIT Learn\nالفئة: ${qf.category || 'عام'}\nعدد الصفحات التقريبي: ${qf.pages || 40}`);
      setPendingBookCover(qf.cover || '');
      setNewBookCategory(qf.category || newBookCategory);
      setNewBookPages(Number(qf.pages) || 60);
      await processBookUpload(generated);
      return;
    }
    setUploadedBookFileName(file.name);
    setBookUploadProgress(1);
    try {
      const up = await uploadMediaFile(file, { kind: 'pdf', user: { id: currentUser.id, name: currentUser.displayName } });
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setPendingBookFileUrl(up.url);
      setNewBookTitle(prev => prev || (`مذكرة: ${cleanTitle}`));
      setBookUploadProgress(null);
      setUploadedBookFileName(null);
      showToast(`تم رفع المذكرة (${(up.bytes / 1024).toFixed(0)}KB) على القرص — اضغطي «نشر» لتثبيتها في المكتبة 📚`);
    } catch (e: any) {
      setBookUploadProgress(null);
      setUploadedBookFileName(null);
      alert('فشل رفع الملف: ' + String(e?.message || e));
    }
  };

  // Drag & Drop Uploader for Shorts and Reels Videos
  const handleShortsFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsShortsDropzoneHovered(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processShortsUpload(files[0]);
    }
  };

  // ملف WebM قصير حقيقي (إطار ملوّن متحرك) لتوليد شورتس فعلي من أزرار النماذج السريعة
  const makeQuickVideo = async (hue: number): Promise<File | null> => {
    try {
      if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported('video/webm')) return null;
      const canvas = document.createElement('canvas');
      canvas.width = 360; canvas.height = 640;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(15);
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      const done = new Promise<Blob>(res => { rec.onstop = () => res(new Blob(chunks, { type: 'video/webm' })); });
      rec.start();
      await new Promise<void>(resolve => {
        let frames = 0;
        const iv = setInterval(() => {
          frames++;
          ctx.fillStyle = `hsl(${(hue + frames * 8) % 360} 70% 55%)`;
          ctx.fillRect(0, 0, 360, 640);
          ctx.fillStyle = '#fff'; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('ORBIT Learn', 180, 320);
          ctx.font = '24px sans-serif'; ctx.fillText(`${frames}`, 180, 370);
          if (frames >= 30) { clearInterval(iv); resolve(); }
        }, 66);
      });
      rec.stop();
      const blob = await done;
      return new File([blob], 'short.webm', { type: 'video/webm' });
    } catch { return null; }
  };

  const processShortsUpload = async (file: File | { name: string; category?: string; duration?: string; thumbnail?: string }) => {
    if (!(file instanceof File)) {
      // نموذج سريع: توليد فيديو WebM حقيقي قصير ورفعه فعلياً (لا محاكاة)
      const qf = file as any;
      const generated = await makeQuickVideo(Math.floor(Math.random() * 360));
      if (!generated) { alert('متصفحك لا يدعم توليد الفيديو السريع — ارفعي ملفاً من جهازك 📁'); return; }
      setNewShortTitle(qf.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      if (qf.duration) setNewShortDuration(qf.duration);
      await processShortsUpload(generated);
      return;
    }
    setUploadedShortFileName(file.name);
    setShortsUploadProgress(1);
    try {
      const up = await uploadMediaFile(file, { kind: 'video', user: { id: currentUser.id, name: currentUser.displayName } });
      const dur = await new Promise<number>((resolve) => {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => resolve(Math.round(v.duration) || 0);
        v.onerror = () => resolve(0);
        v.src = up.url;
        setTimeout(() => resolve(0), 4000);
      });
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setPendingShortVideoUrl(up.url);
      if (dur > 0) setNewShortDuration(`${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}`);
      setNewShortTitle(prev => prev || (`فيديو: ${cleanTitle}`));
      setShortsUploadProgress(null);
      setUploadedShortFileName(null);
      showToast(`تم رفع فيديو الشورتس (${(up.bytes / 1048576).toFixed(1)}MB) — اضغطي «نشر» لتثبيته في الاستوديو 🌟`);
    } catch (e: any) {
      setShortsUploadProgress(null);
      setUploadedShortFileName(null);
      alert('فشل رفع الفيديو: ' + String(e?.message || e));
    }
  };

  const navTabs = [
    { id: 'curriculum', label: 'إدارة الكورسات والفيديوهات', icon: Layers },
    { id: 'library', label: 'المكتبة الرقمية والشيتات', icon: Library, badge: libraryBooksList.length },
    { id: 'shorts', label: 'استوديو الشورتس والأبطال', icon: Film, badge: shortsList.length },
    { id: 'live', label: 'استوديو البث وحصص الشاشة', icon: Video, badge: liveSessions.length },
    { id: 'grading', label: 'تصحيح واجبات الأطفال', icon: FileCheck2, badge: submissions.filter(s => s.status === 'submitted').length },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start text-[var(--ink)] font-sans" dir="rtl">
      
      {/* Instructor Studio Sidebar */}
      <aside className="w-full lg:w-72 bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 shrink-0 shadow-2xl space-y-6">
        
        {/* Profile Card */}
        <div className="flex items-center gap-3 pb-5 border-b border-[var(--line)]">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg shadow-amber-500/20 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80" 
              alt="أ / سارة العربي" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-black text-[var(--ink)] truncate">أ / سارة العربي</h3>
            <p className="text-[11px] text-amber-400 font-bold">استوديو إدارة المحتوى والتعليم</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[var(--ink)] shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-[var(--bg-inset)] text-amber-700' : 'bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] text-[var(--ink-soft)]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Philosophy Motto */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 space-y-1">
          <span className="font-bold block">شعارنا مع الأطفال:</span>
          <p className="text-[11px] text-[var(--ink-soft)]">"تأسيس أطفال . حساب ذهني 💡 نصنع أبطالاً يستمتعون بالعلم"</p>
        </div>

      </aside>

      {/* Main Studio Workspace Canvas */}
      <div className="flex-1 w-full space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: CURRICULUM & INTERACTIVE VIDEO LESSONS MANAGER     */}
        {/* ========================================================= */}
        {activeSection === 'curriculum' && (
          <div className="space-y-6">
            
            {/* Header with Course Selector */}
            <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  إدارة المناهج والفيديوهات
                </span>
                <h2 className="text-xl font-black text-[var(--ink)] mt-2">
                  تعديل محتوى الدروس ورفع الفيديوهات التعليمية
                </h2>
                <p className="text-xs text-[var(--ink-soft)] mt-1">
                  رتّبي الوحدات والدروس بالسحب والإفلات أو الأسهم، وارفعي فيديوهات الشرح مباشرة
                </p>
              </div>

              {/* Course Selector Dropdown */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedCourse?.id}
                  onChange={(e) => {
                    const c = courses.find(item => item.id === e.target.value);
                    if (c) handleSelectCourse(c);
                  }}
                  className="w-full sm:w-64 bg-[var(--bg-inset)] border border-[var(--line-strong)] rounded-xl py-2.5 px-3 text-xs text-[var(--ink)] font-bold focus:outline-none focus:border-amber-400"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notification Toast for Reorder / Upload */}
            {reorderSuccessMsg && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{reorderSuccessMsg}</span>
                </div>
                <button onClick={() => setReorderSuccessMsg(null)} className="text-emerald-400 hover:text-[var(--ink)]">✕</button>
              </div>
            )}

            {/* Showcase KPI Metric Cards Tailored to Kids Educational Programs */}
            {selectedCourse && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[var(--hero-b)] to-amber-950/30 border border-[var(--line)] rounded-2xl p-4 shadow-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                    <span>الوحدات الدراسية</span>
                    <span className="text-lg">🧮</span>
                  </div>
                  <div className="text-2xl font-black text-[var(--ink)] font-mono">{selectedCourse.sections.length}</div>
                  <div className="text-[11px] text-amber-400 font-bold">وحدات تدريبية متسلسلة</div>
                </div>

                <div className="bg-gradient-to-br from-[var(--hero-b)] to-orange-950/30 border border-[var(--line)] rounded-2xl p-4 shadow-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                    <span>الدروس والفيديوهات</span>
                    <span className="text-lg">🎬</span>
                  </div>
                  <div className="text-2xl font-black text-[var(--ink)] font-mono">
                    {selectedCourse.sections.reduce((acc, s) => acc + s.lessons.length, 0)}
                  </div>
                  <div className="text-[11px] text-orange-400 font-bold">شرح عملي ومبسط</div>
                </div>

                <div className="bg-gradient-to-br from-[var(--hero-b)] to-amber-950/30 border border-[var(--line)] rounded-2xl p-4 shadow-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                    <span>إجمالي مدة الشرح</span>
                    <span className="text-lg">⏱️</span>
                  </div>
                  <div className="text-2xl font-black text-[var(--ink)] font-mono">
                    {Math.round(selectedCourse.sections.reduce((acc, s) => acc + s.lessons.reduce((lAcc, l) => lAcc + l.durationSeconds, 0), 0) / 60)} دقيقة
                  </div>
                  <div className="text-[11px] text-amber-400 font-bold">تدريب تفاعلي ممتع</div>
                </div>

                <div className="bg-gradient-to-br from-[var(--hero-b)] to-emerald-950/30 border border-[var(--line)] rounded-2xl p-4 shadow-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                    <span>معاينات مجانية للأطفال</span>
                    <span className="text-lg">🎁</span>
                  </div>
                  <div className="text-2xl font-black text-[var(--ink)] font-mono">
                    {selectedCourse.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.isPreview).length, 0)}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold">متاحة قبل الاشتراك</div>
                </div>
              </div>
            )}

            {/* Dedicated Drag and Drop Video Upload Dropzone */}
            {selectedCourse && (
              <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      <span>منطقة السحب والإفلات لرفع الفيديوهات التعليمية (Drag & Drop)</span>
                    </h3>
                    <p className="text-[11px] text-[var(--ink-soft)]">
                      اسحبي أي فيديو تعليمي من جهازك وأفلتيه مباشرة ليتم ربطه بالمنهج
                    </p>
                  </div>

                  {/* Target Section Selector for Upload */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--ink-soft)] font-bold">إضافة إلى:</span>
                    <select
                      value={uploadTargetSectionId || (selectedCourse.sections[0]?.id || '')}
                      onChange={(e) => setUploadTargetSectionId(e.target.value)}
                      className="bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--ink)] font-bold focus:border-amber-400"
                    >
                      {selectedCourse.sections.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dropzone Card */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDropzoneHovered(true);
                  }}
                  onDragLeave={() => setIsDropzoneHovered(false)}
                  onDrop={(e) => handleVideoFileDrop(e)}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                    isDropzoneHovered 
                      ? 'border-amber-400 bg-amber-500/15 scale-[1.01] shadow-2xl shadow-amber-500/20' 
                      : 'border-[var(--line)] bg-[var(--bg-elevated)]/60 hover:border-amber-400/40 hover:bg-[var(--bg-elevated)]/80'
                  }`}
                  onClick={() => {
                    const input = document.getElementById('studio-video-file-input') as HTMLInputElement;
                    if (input) input.click();
                  }}
                >
                  <input
                    id="studio-video-file-input"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        processVideoUpload(e.target.files[0]);
                      }
                    }}
                  />

                  {uploadProgress !== null ? (
                    <div className="max-w-md mx-auto space-y-3 py-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                        <span>جاري رفع ومعالجة الفيديو للأطفال: {uploadedVideoFileName}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-3 bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--line)]">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 rounded-full shadow-lg shadow-amber-500/50" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[var(--ink-soft)] animate-pulse">
                        يتم الآن تجهيز المشغل الذكي والتفريغ الصوتي التفاعلي...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/10">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[var(--ink)]">
                          اسحبي وأفلتي ملف الفيديو هنا للرفع المباشر
                        </h4>
                        <p className="text-xs text-[var(--ink-soft)] mt-1">
                          يدعم صيغ MP4, MOV, WebM فائقة الدقة حتى 2GB • مشفر ومحمي للطلاب
                        </p>
                      </div>
                      <div className="pt-1">
                        <span className="px-4 py-1.5 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] text-[var(--ink)] rounded-xl text-xs font-bold border border-[var(--line)] transition-colors inline-block">
                          أو انقري لاختيار فيديو من جهازك 📁
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sample One-Click Demo Video Presets for Teacher */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-[var(--ink-soft)] font-bold">فيديوهات نموذجية سريعة:</span>
                  <button
                    onClick={() => processVideoUpload({ name: 'شرح_قواعد_أصدقاء_العدد_5_بالسوروبان.mp4' })}
                    className="px-3 py-1 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-amber-400/20 text-[var(--ink-soft)] hover:text-amber-300 border border-[var(--line)] rounded-xl transition-colors"
                  >
                    + درس العداد الصيني (أصدقاء 5)
                  </button>
                  <button
                    onClick={() => processVideoUpload({ name: 'تأسيس_حركة_الفتح_ونور_البيان.mp4' })}
                    className="px-3 py-1 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-amber-400/20 text-[var(--ink-soft)] hover:text-amber-300 border border-[var(--line)] rounded-xl transition-colors"
                  >
                    + درس حركة الفتح بالقصص
                  </button>
                  <button
                    onClick={() => processVideoUpload({ name: 'تحدي_الحساب_التخيلي_السريع.mp4' })}
                    className="px-3 py-1 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-amber-400/20 text-[var(--ink-soft)] hover:text-amber-300 border border-[var(--line)] rounded-xl transition-colors"
                  >
                    + تحدي الحساب التخيلي السريع
                  </button>
                </div>
              </div>
            )}

            {/* Course Settings and Basic Metadata */}
            {selectedCourse && (
              <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>البيانات الأساسية للدورة</span>
                  </h3>
                  <button
                    onClick={handleSaveCourse}
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-transform hover:scale-105"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ التعديلات</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[var(--ink-soft)] mb-1 font-bold">عنوان الدورة:</label>
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--ink-soft)] mb-1 font-bold">سعر الدورة (ج.م):</label>
                    <input
                      type="number"
                      value={coursePrice / 10}
                      onChange={(e) => setCoursePrice(Number(e.target.value) * 10)}
                      className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[var(--ink-soft)] mb-1 font-bold">ملخص الدورة وأهدافها للأطفال وأولياء الأمور:</label>
                    <textarea
                      rows={2}
                      value={courseSummary}
                      onChange={(e) => setCourseSummary(e.target.value)}
                      className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Sections & Lessons Management with Drag and Drop Canvas */}
                <div className="pt-6 border-t border-[var(--line)] space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-[var(--ink)]">الوحدات والدروس المرئية</h4>
                        <span className="text-[11px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                          ✨ يدعم السحب والإفلات (Drag & Drop)
                        </span>
                      </div>
                      <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                        اسحبي مقبض السحب (⋮⋮) لإعادة ترتيب أي وحدة أو درس، أو استخدمي أزرار الأسهم
                      </p>
                    </div>

                    <button
                      onClick={handleAddSection}
                      className="px-4 py-2 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_15%,transparent)] text-[var(--ink)] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-[var(--line)]"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>إضافة وحدة جديدة</span>
                    </button>
                  </div>

                  {/* Drag-and-Drop Sections List */}
                  <div className="space-y-5">
                    {selectedCourse.sections.map((sec, secIdx) => {
                      const isSecDragged = draggedSectionIdx === secIdx;
                      const isSecOver = dragOverSectionIdx === secIdx;

                      return (
                        <div 
                          key={sec.id} 
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverSectionIdx(secIdx);
                          }}
                          onDragLeave={() => {
                            if (dragOverSectionIdx === secIdx) setDragOverSectionIdx(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedSectionIdx !== null) {
                              handleSectionDrop(secIdx);
                            }
                          }}
                          className={`bg-[var(--bg-elevated)]/75 border transition-all duration-200 rounded-3xl p-5 sm:p-6 space-y-4 ${
                            isSecOver 
                              ? 'border-amber-400 bg-amber-500/10 scale-[1.01] shadow-2xl shadow-amber-500/20' 
                              : isSecDragged 
                              ? 'opacity-40 border-dashed border-amber-400/60 scale-[0.99]' 
                              : 'border-[var(--line)] hover:border-[var(--line-strong)]'
                          }`}
                        >
                          {/* Section Header with Drag Handle & Order Controls */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                            <div className="flex items-center gap-3">
                              
                              {/* Section Drag Handle */}
                              <div
                                draggable
                                onDragStart={() => setDraggedSectionIdx(secIdx)}
                                onDragEnd={() => {
                                  setDraggedSectionIdx(null);
                                  setDragOverSectionIdx(null);
                                }}
                                className="cursor-grab active:cursor-grabbing p-1.5 rounded-xl bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-amber-400/20 text-[var(--ink-soft)] hover:text-amber-300 transition-colors"
                                title="اسحبي لتغيير ترتيب هذه الوحدة"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>

                              {/* Up / Down Order Shift Buttons */}
                              <div className="flex flex-col gap-0.5">
                                <button
                                  disabled={secIdx === 0}
                                  onClick={() => handleMoveSection(secIdx, secIdx - 1)}
                                  className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] disabled:opacity-30 disabled:hover:bg-transparent text-[var(--ink-soft)] hover:text-amber-300"
                                  title="تحريك لأعلى"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={secIdx === selectedCourse.sections.length - 1}
                                  onClick={() => handleMoveSection(secIdx, secIdx + 1)}
                                  className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] disabled:opacity-30 disabled:hover:bg-transparent text-[var(--ink-soft)] hover:text-amber-300"
                                  title="تحريك لأسفل"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Section Title and Order Pill */}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
                                    الوحدة {secIdx + 1}
                                  </span>
                                  <h4 className="text-sm sm:text-base font-black text-[var(--ink)]">
                                    {sec.title}
                                  </h4>
                                </div>
                                <span className="text-[11px] text-[var(--ink-soft)]">
                                  {sec.lessons.length} دروس تعليمية للأطفال
                                </span>
                              </div>

                            </div>

                            {/* Section Action Buttons */}
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                onClick={() => {
                                  setTargetSectionId(sec.id);
                                  setIsAddingLesson(true);
                                }}
                                className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة درس</span>
                              </button>
                            </div>
                          </div>

                          {/* Lessons List in Section - Draggable and Reorderable */}
                          <div className="space-y-2.5">
                            {sec.lessons.length === 0 ? (
                              <div className="text-center py-6 border border-dashed border-[var(--line)] rounded-2xl text-xs text-[var(--ink-soft)] space-y-1">
                                <p>لا توجد دروس في هذه الوحدة حتى الآن.</p>
                                <p className="text-amber-300 text-[11px]">انقري "إضافة درس" أو اسحبي ملف فيديو هنا 📥</p>
                              </div>
                            ) : (
                              sec.lessons.map((les, lesIdx) => {
                                const isLessonDragged = draggedLessonInfo?.sectionId === sec.id && draggedLessonInfo.lessonIdx === lesIdx;
                                const isLessonOver = dragOverLessonInfo?.sectionId === sec.id && dragOverLessonInfo.lessonIdx === lesIdx;

                                return (
                                  <div 
                                    key={les.id}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDragOverLessonInfo({ sectionId: sec.id, lessonIdx: lesIdx });
                                    }}
                                    onDragLeave={(e) => {
                                      e.stopPropagation();
                                      if (dragOverLessonInfo?.sectionId === sec.id && dragOverLessonInfo.lessonIdx === lesIdx) {
                                        setDragOverLessonInfo(null);
                                      }
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (draggedLessonInfo) {
                                        handleLessonDrop(sec.id, lesIdx);
                                      }
                                    }}
                                    className={`p-3.5 bg-[var(--bg-elevated)]/90 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                      isLessonOver 
                                        ? 'border-amber-400 bg-amber-500/15 scale-[1.01] shadow-lg shadow-amber-500/20' 
                                        : isLessonDragged 
                                        ? 'opacity-40 border-dashed border-amber-400/60' 
                                        : 'border-[var(--line)] hover:border-amber-400/40'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      
                                      {/* Lesson Drag Grip Handle */}
                                      <div
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          setDraggedLessonInfo({ sectionId: sec.id, lessonIdx: lesIdx });
                                        }}
                                        onDragEnd={(e) => {
                                          e.stopPropagation();
                                          setDraggedLessonInfo(null);
                                          setDragOverLessonInfo(null);
                                        }}
                                        className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-amber-400/20 text-[var(--ink-soft)] hover:text-amber-300 transition-colors shrink-0"
                                        title="اسحبي لتغيير ترتيب هذا الدرس"
                                      >
                                        <GripVertical className="w-4 h-4" />
                                      </div>

                                      {/* Order Badge and Video Icon */}
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-[var(--ink-soft)] bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] border border-[var(--line)] px-2 py-0.5 rounded-md font-mono">
                                          #{lesIdx + 1}
                                        </span>
                                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                                          <Video className="w-4 h-4" />
                                        </div>
                                      </div>

                                      {/* Lesson Title and Metadata */}
                                      <div>
                                        <h5 className="font-bold text-[var(--ink)] text-xs sm:text-sm line-clamp-1">
                                          {les.title}
                                        </h5>
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--ink-soft)] mt-0.5">
                                          <span>⏱️ {Math.floor(les.durationSeconds / 60)} دقيقة</span>
                                          <span>•</span>
                                          <span className={les.isPreview ? 'text-emerald-400 font-bold' : 'text-[var(--ink-soft)]'}>
                                            {les.isPreview ? '🎁 معاينة مجانية للأطفال' : '🔒 مغلق للمشتركين'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Controls: Preview, Move Up/Down, Delete */}
                                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                      
                                      {/* Quick Up/Down buttons for touch devices */}
                                      <div className="flex items-center gap-0.5 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] border border-[var(--line)] rounded-lg p-0.5">
                                        <button
                                          disabled={lesIdx === 0}
                                          onClick={() => handleMoveLesson(sec.id, lesIdx, lesIdx - 1)}
                                          className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] disabled:opacity-30 disabled:hover:bg-transparent text-[var(--ink-soft)] hover:text-amber-300"
                                          title="تحريك لأعلى"
                                        >
                                          <ChevronUp className="w-3 h-3" />
                                        </button>
                                        <button
                                          disabled={lesIdx === sec.lessons.length - 1}
                                          onClick={() => handleMoveLesson(sec.id, lesIdx, lesIdx + 1)}
                                          className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] disabled:opacity-30 disabled:hover:bg-transparent text-[var(--ink-soft)] hover:text-amber-300"
                                          title="تحريك لأسفل"
                                        >
                                          <ChevronDown className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {/* Preview Button */}
                                      <button
                                        onClick={() => setPreviewLessonUrl(les.videoUrl || null)}
                                        className="px-3 py-1.5 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-amber-400/20 hover:text-amber-300 text-[var(--ink)] rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors"
                                      >
                                        <Play className="w-3 h-3 text-amber-400" />
                                        <span>معاينة</span>
                                      </button>

                                      {/* Delete Lesson Button */}
                                      <button
                                        onClick={() => handleDeleteLesson(sec.id, les.id)}
                                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors"
                                        title="حذف الدرس"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* In-Section Quick Video Drop Helper */}
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragOverSectionIdx(secIdx);
                            }}
                            onDragLeave={(e) => {
                              e.stopPropagation();
                              if (dragOverSectionIdx === secIdx) setDragOverSectionIdx(null);
                            }}
                            onDrop={(e) => {
                              e.stopPropagation();
                              handleVideoFileDrop(e, sec.id);
                            }}
                            className="border border-dashed border-[var(--line)] hover:border-amber-400/50 rounded-2xl py-2.5 px-4 text-center text-[11px] text-[var(--ink-soft)] hover:text-amber-300 hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] transition-colors cursor-pointer"
                            onClick={() => {
                              setUploadTargetSectionId(sec.id);
                              const input = document.getElementById('studio-video-file-input') as HTMLInputElement;
                              if (input) input.click();
                            }}
                          >
                            <span>📥 اسحبي وأفلت فيديو هنا لإضافته فوراً إلى {sec.title}</span>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            )}

            {/* Modal: Add New Lesson */}
            {isAddingLesson && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/80 backdrop-blur-md">
                <div className="bg-[var(--bg-elevated)] border border-[var(--line-strong)] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <h4 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>إضافة درس وفيديو تعليمي جديد</span>
                    </h4>
                    <button onClick={() => setIsAddingLesson(false)} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">✕</button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[var(--ink-soft)] mb-1 font-bold">عنوان الدرس:</label>
                      <input
                        type="text"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        placeholder="مثال: أصدقاء العدد 5 - الجمع بالخرزة العلوية"
                        className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[var(--ink-soft)] mb-1 font-bold">رابط الفيديو (أو سيرفر التحميل):</label>
                      <input
                        type="text"
                        value={newLessonVideoUrl}
                        onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                        className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                        dir="ltr"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[var(--ink-soft)] mb-1 font-bold">مدة الفيديو (بالثواني):</label>
                        <input
                          type="number"
                          value={newLessonDuration}
                          onChange={(e) => setNewLessonDuration(e.target.value)}
                          className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[var(--ink-soft)] mb-1 font-bold">معاينة مجانية؟</label>
                        <select
                          value={newLessonIsPreview ? 'yes' : 'no'}
                          onChange={(e) => setNewLessonIsPreview(e.target.value === 'yes')}
                          className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] font-bold"
                        >
                          <option value="no">مغلق (للمشتركين فقط)</option>
                          <option value="yes">نعم (متاح كمعاينة مجانية)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={handleCreateLesson}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-black rounded-xl text-xs transition-transform hover:scale-105"
                    >
                      تأكيد وحفظ الدرس
                    </button>
                    <button
                      onClick={() => setIsAddingLesson(false)}
                      className="px-4 py-3 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-xl text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Preview Modal */}
            {previewLessonUrl && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/85 backdrop-blur-md">
                <div className="relative w-full max-w-3xl bg-[var(--bg-elevated)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--line-strong)]">
                  <button
                    onClick={() => setPreviewLessonUrl(null)}
                    className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-[var(--bg-subtle)] text-[var(--ink)] flex items-center justify-center hover:bg-[var(--bg-inset)]"
                  >
                    ✕
                  </button>
                  <video src={previewLessonUrl} controls autoPlay className="w-full aspect-video bg-black" />
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DIGITAL LIBRARY & WORKSHEETS MANAGER               */}
        {/* ========================================================= */}
        {activeSection === 'library' && (
          <div className="space-y-6">
            
            {/* Header & Main Actions */}
            <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  المكتبة والشيتات التفاعلية للأطفال
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] mt-2">
                  إدارة المذكرات وكتب التدريب وأوراق العمل 📚
                </h2>
                <p className="text-xs text-[var(--ink-soft)] mt-1">
                  ارفعي كتب السوروبان وشيتات نور البيان التفاعلية للأطفال بالسحب والإفلات أو التحميل المباشر
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingBook(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مذكرة / كتاب جديد</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Showcase for Kids Worksheets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[var(--hero-b)] to-amber-950/30 border border-amber-500/20 rounded-3xl p-4 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                  <span>إجمالي المذكرات والكتب</span>
                  <span className="text-lg">📚</span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">{libraryBooksList.length}</div>
                <div className="text-[11px] text-amber-300 font-bold">جاهزة للطباعة والتحميل</div>
              </div>

              <div className="bg-gradient-to-br from-[var(--hero-b)] to-emerald-950/30 border border-emerald-500/20 rounded-3xl p-4 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                  <span>شيتات نور البيان والقراءة</span>
                  <span className="text-lg">📖</span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">
                  {libraryBooksList.filter(b => b.category.includes('قراءة') || b.category.includes('عربية')).length}
                </div>
                <div className="text-[11px] text-emerald-300 font-bold">قصص وحركات الحروف</div>
              </div>

              <div className="bg-gradient-to-br from-[var(--hero-b)] to-sky-950/30 border border-sky-500/20 rounded-3xl p-4 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                  <span>كتب العداد الصيني والسوروبان</span>
                  <span className="text-lg">🧮</span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">
                  {libraryBooksList.filter(b => b.category.includes('سوروبان') || b.category.includes('حساب')).length}
                </div>
                <div className="text-[11px] text-sky-300 font-bold">تمارين سرعة متدرجة</div>
              </div>

              <div className="bg-gradient-to-br from-[var(--hero-b)] to-rose-950/30 border border-rose-500/20 rounded-3xl p-4 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                  <span>حقائب تدريب المدربين TOT</span>
                  <span className="text-lg">🎓</span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">
                  {libraryBooksList.filter(b => b.category.includes('TOT') || b.category.includes('مدرب')).length}
                </div>
                <div className="text-[11px] text-rose-300 font-bold">للمعلمات والأمهات</div>
              </div>
            </div>

            {/* Drag & Drop File Uploader Zone for Worksheets & Books */}
            <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>منطقة السحب والإفلات لرفع المذكرات والشيتات (Drag & Drop PDF)</span>
                  </h3>
                  <p className="text-[11px] text-[var(--ink-soft)]">
                    اسحبي أي ملف PDF أو وورد أو شيت عمل من جهازك وأفلتيه مباشرة ليضاف لمكتبة الأطفال
                  </p>
                </div>
                <span className="hidden sm:inline-block text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                  ⚡ يدعم التحميل الفوري
                </span>
              </div>

              {/* Dropzone Card */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsBookDropzoneHovered(true);
                }}
                onDragLeave={() => setIsBookDropzoneHovered(false)}
                onDrop={(e) => handleBookFileDrop(e)}
                className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  isBookDropzoneHovered 
                    ? 'border-emerald-400 bg-emerald-500/15 scale-[1.01] shadow-2xl shadow-emerald-500/20' 
                    : 'border-[var(--line)] bg-[var(--bg-elevated)]/60 hover:border-amber-400/40 hover:bg-[var(--bg-elevated)]/80'
                }`}
                onClick={() => {
                  const input = document.getElementById('studio-book-file-input') as HTMLInputElement;
                  if (input) input.click();
                }}
              >
                <input
                  id="studio-book-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processBookUpload(e.target.files[0]);
                    }
                  }}
                />

                {bookUploadProgress !== null ? (
                  <div className="max-w-md mx-auto space-y-3 py-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span>جاري رفع ومعالجة المذكرة للأطفال: {uploadedBookFileName}</span>
                      <span>{bookUploadProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--line)]">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 transition-all duration-300 rounded-full shadow-lg shadow-emerald-500/50" 
                        style={{ width: `${bookUploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[var(--ink-soft)] animate-pulse">
                      يتم الآن تجهيز الغلاف ورابط التحميل الآمن عالي الجودة للطباعة...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/10">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[var(--ink)]">
                        اسحبي وأفلتي ملف المذكرة أو شيت العمل هنا
                      </h4>
                      <p className="text-xs text-[var(--ink-soft)] mt-1">
                        يدعم ملفات PDF والشيتات المصورة حتى 50MB • متاح للطباعة المباشرة والتحميل
                      </p>
                    </div>
                    <div className="pt-1">
                      <span className="px-4 py-1.5 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] text-[var(--ink)] rounded-xl text-xs font-bold border border-[var(--line)] transition-colors inline-block">
                        أو انقري لاختيار ملف من جهازك 📁
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* One-Click Quick Presets for Teacher */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[var(--ink-soft)] font-bold">شيتات نموذجية سريعة:</span>
                <button
                  onClick={() => processBookUpload({
                    name: 'شيت_عمل_أصدقاء_العدد_5_الملون_للسوروبان.pdf',
                    category: 'الحساب الذهني والسوروبان',
                    pages: 45,
                    cover: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80'
                  })}
                  className="px-3 py-1.5 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-amber-400/20 text-[var(--ink-soft)] hover:text-amber-300 border border-[var(--line)] rounded-xl transition-colors"
                >
                  + شيت أصدقاء 5 الملون (PDF)
                </button>
                <button
                  onClick={() => processBookUpload({
                    name: 'كراسة_تأسيس_نور_البيان_وقصص_الحروف.pdf',
                    category: 'تأسيس لغة عربية وقراءة',
                    pages: 60,
                    cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80'
                  })}
                  className="px-3 py-1.5 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-emerald-400/20 text-[var(--ink-soft)] hover:text-emerald-300 border border-[var(--line)] rounded-xl transition-colors"
                >
                  + كراسة نور البيان لقصص الحروف (PDF)
                </button>
                <button
                  onClick={() => processBookUpload({
                    name: 'تمارين_تحدي_السرعة_100_مسألة_ذهنية.pdf',
                    category: 'تأسيس رياضيات',
                    pages: 50,
                    cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80'
                  })}
                  className="px-3 py-1.5 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-sky-400/20 text-[var(--ink-soft)] hover:text-sky-300 border border-[var(--line)] rounded-xl transition-colors"
                >
                  + تحدي 100 مسألة حسابية ممتعة
                </button>
              </div>
            </div>

            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--bg-elevated)]/60 p-4 rounded-2xl border border-[var(--line)]">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setBookCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    bookCategoryFilter === 'all'
                      ? 'bg-amber-400 text-[var(--ink)] shadow-md font-black'
                      : 'bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-[var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]'
                  }`}
                >
                  الكل ({libraryBooksList.length})
                </button>
                <button
                  onClick={() => setBookCategoryFilter('الحساب الذهني والسوروبان')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    bookCategoryFilter === 'الحساب الذهني والسوروبان'
                      ? 'bg-amber-400 text-[var(--ink)] font-black'
                      : 'bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-[var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]'
                  }`}
                >
                  حساب ذهني 🧮
                </button>
                <button
                  onClick={() => setBookCategoryFilter('تأسيس لغة عربية وقراءة')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    bookCategoryFilter === 'تأسيس لغة عربية وقراءة'
                      ? 'bg-emerald-400 text-[var(--ink)] font-black'
                      : 'bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-[var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]'
                  }`}
                >
                  نور البيان وقراءة 📖
                </button>
                <button
                  onClick={() => setBookCategoryFilter('تأسيس رياضيات')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    bookCategoryFilter === 'تأسيس رياضيات'
                      ? 'bg-sky-400 text-[var(--ink)] font-black'
                      : 'bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-[var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]'
                  }`}
                >
                  رياضيات ذكية 🔢
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث باسم المذكرة..."
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl pr-9 pl-3 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Child-Friendly Rounded Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {libraryBooksList
                .filter(b => {
                  const matchCat = bookCategoryFilter === 'all' || b.category === bookCategoryFilter;
                  const matchSearch = !bookSearchQuery || b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) || b.description.toLowerCase().includes(bookSearchQuery.toLowerCase());
                  return matchCat && matchSearch;
                })
                .map((book) => {
                  // Vibrant accent color according to category
                  const isMath = book.category.includes('حساب') || book.category.includes('سوروبان');
                  const isArabic = book.category.includes('عربية') || book.category.includes('قراءة');
                  const isFunMath = book.category.includes('رياضيات');

                  const accentBg = isMath 
                    ? 'border-amber-400/30 hover:border-amber-400/60' 
                    : isArabic 
                    ? 'border-emerald-400/30 hover:border-emerald-400/60' 
                    : isFunMath 
                    ? 'border-sky-400/30 hover:border-sky-400/60' 
                    : 'border-rose-400/30 hover:border-rose-400/60';

                  const badgeColor = isMath 
                    ? 'bg-amber-400/15 text-amber-300 border-amber-400/30' 
                    : isArabic 
                    ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30' 
                    : isFunMath 
                    ? 'bg-sky-400/15 text-sky-300 border-sky-400/30' 
                    : 'bg-rose-400/15 text-rose-300 border-rose-400/30';

                  return (
                    <div 
                      key={book.id}
                      className={`bg-[var(--bg-elevated)]/80 backdrop-blur-xl border ${accentBg} rounded-[2rem] p-6 shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group`}
                    >
                      <div className="space-y-3.5">
                        <div className="h-48 rounded-2xl overflow-hidden relative shadow-inner">
                          <img 
                            src={book.coverUrl} 
                            alt={book.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-a)] via-transparent to-transparent opacity-80" />
                          
                          <span className="absolute top-2.5 right-2.5 bg-[var(--bg-elevated)]/85 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-md border border-[var(--line)] flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-amber-400" />
                            <span>{book.pagesCount} صفحة ملونة</span>
                          </span>

                          <span className="absolute bottom-2.5 right-2.5 text-[11px] font-bold text-[var(--ink)] drop-shadow">
                            إعداد: {book.author}
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold border px-3 py-1 rounded-full inline-block ${badgeColor}`}>
                          {book.category}
                        </span>

                        <h4 className="text-sm font-black text-[var(--ink)] line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {book.title}
                        </h4>

                        <p className="text-xs text-[var(--ink-soft)] line-clamp-2 leading-relaxed font-normal">
                          {book.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[var(--line)] flex items-center justify-between">
                        <button
                          onClick={() => {
                            showToast(`تم بدء تحميل مذكرة: "${book.title}" بنجاح! 📥`);
                          }}
                          className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                          title="تحميل المذكرة"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل PDF</span>
                        </button>

                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                          title="حذف الكتاب من المكتبة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal: Add Book */}
            {isAddingBook && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/80 backdrop-blur-md">
                <div className="bg-[var(--bg-elevated)] border border-[var(--line-strong)] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <h4 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>إضافة مذكرة تدريب أو كتاب جديد للأطفال</span>
                    </h4>
                    <button onClick={() => setIsAddingBook(false)} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">✕</button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[var(--ink-soft)] mb-1 font-bold">اسم الكتاب أو المذكرة:</label>
                      <input
                        type="text"
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                        placeholder="مثال: كراسة تمارين السوروبان الملونة - المستوى الثاني 💡"
                        className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[var(--ink-soft)] mb-1 font-bold">القسم:</label>
                        <select
                          value={newBookCategory}
                          onChange={(e) => setNewBookCategory(e.target.value)}
                          className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] font-bold"
                        >
                          <option value="الحساب الذهني والسوروبان">الحساب الذهني والسوروبان</option>
                          <option value="تأسيس لغة عربية وقراءة">تأسيس لغة عربية وقراءة</option>
                          <option value="تأسيس رياضيات">تأسيس رياضيات</option>
                          <option value="تدريب المدربين TOT">تدريب المدربين TOT</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[var(--ink-soft)] mb-1 font-bold">عدد الصفحات:</label>
                        <input
                          type="number"
                          value={newBookPages}
                          onChange={(e) => setNewBookPages(Number(e.target.value))}
                          className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[var(--ink-soft)] mb-1 font-bold">رابط صورة الغلاف:</label>
                      <input
                        type="text"
                        value={newBookCover}
                        onChange={(e) => setNewBookCover(e.target.value)}
                        className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] font-mono text-[11px]"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-[var(--ink-soft)] mb-1 font-bold">الوصف:</label>
                      <textarea
                        rows={2}
                        value={newBookDesc}
                        onChange={(e) => setNewBookDesc(e.target.value)}
                        placeholder="نبذة عن المذكرة وتطبيقاتها للطفل..."
                        className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={handleCreateBook}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 text-[var(--ink)] font-black rounded-xl text-xs shadow-md transition-transform active:scale-95"
                    >
                      نشر الكتاب في المكتبة
                    </button>
                    <button
                      onClick={() => setIsAddingBook(false)}
                      className="px-4 py-3 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] text-[var(--ink-soft)] rounded-xl text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EDUCATIONAL SHORTS & REELS MANAGER                 */}
        {/* ========================================================= */}
        {activeSection === 'shorts' && (
          <div className="space-y-6">
            
            {/* Header with Title and Add Button */}
            <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                  استوديو الشورتس والأبطال
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] mt-2">
                  إدارة فيديوهات أبطال مس سارة (الشورتس والريلز) 🎬
                </h2>
                <p className="text-xs text-[var(--ink-soft)] mt-1">
                  رفع ونشر مقاطع قصيرة لإنجازات وسرعة الأطفال في الحساب الذهني بالسحب والإفلات
                </p>
              </div>

              <button
                onClick={() => setIsAddingShort(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 text-[var(--ink)] font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فيديو شورتس جديد</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[var(--hero-b)] to-rose-950/30 border border-rose-500/20 rounded-3xl p-4 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                  <span>إجمالي مقاطع الشورتس</span>
                  <span className="text-lg">🎬</span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">{shortsList.length}</div>
                <div className="text-[11px] text-rose-300 font-bold">فيديوهات قصيرة محفزة</div>
              </div>

              <div className="bg-gradient-to-br from-[var(--hero-b)] to-amber-950/30 border border-amber-500/20 rounded-3xl p-4 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                  <span>إجمالي المشاهدات</span>
                  <span className="text-lg">👁️</span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">43.8K+</div>
                <div className="text-[11px] text-amber-300 font-bold">مشاهدات حقيقية ملهمة</div>
              </div>

              <div className="bg-gradient-to-br from-[var(--hero-b)] to-emerald-950/30 border border-emerald-500/20 rounded-3xl p-4 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                  <span>أبطال متألقين</span>
                  <span className="text-lg">🌟</span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">120+</div>
                <div className="text-[11px] text-emerald-300 font-bold">شاركوا إنجازاتهم بالفيديو</div>
              </div>

              <div className="bg-gradient-to-br from-[var(--hero-b)] to-sky-950/30 border border-sky-500/20 rounded-3xl p-4 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between text-[var(--ink-soft)] text-xs">
                  <span>تفاعل وإعجاب</span>
                  <span className="text-lg">❤️</span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">5.6K+</div>
                <div className="text-[11px] text-sky-300 font-bold">تشجيع مستمر للأطفال</div>
              </div>
            </div>

            {/* Drag & Drop Upload Zone for Vertical Shorts & Reels */}
            <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-rose-400" />
                    <span>منطقة السحب والإفلات لرفع فيديوهات الشورتس والريلز (Drag & Drop Video)</span>
                  </h3>
                  <p className="text-[11px] text-[var(--ink-soft)]">
                    اسحبي أي فيديو رأسي (MP4/MOV) لأبطالك وأفلتيه مباشرة للنشر في استوديو الشورتس
                  </p>
                </div>
                <span className="hidden sm:inline-block text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full font-bold">
                  📱 صيغة 9:16 للشاشات الذكية
                </span>
              </div>

              {/* Dropzone Card */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsShortsDropzoneHovered(true);
                }}
                onDragLeave={() => setIsShortsDropzoneHovered(false)}
                onDrop={(e) => handleShortsFileDrop(e)}
                className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  isShortsDropzoneHovered 
                    ? 'border-rose-400 bg-rose-500/15 scale-[1.01] shadow-2xl shadow-rose-500/20' 
                    : 'border-[var(--line)] bg-[var(--bg-elevated)]/60 hover:border-rose-400/40 hover:bg-[var(--bg-elevated)]/80'
                }`}
                onClick={() => {
                  const input = document.getElementById('studio-shorts-file-input') as HTMLInputElement;
                  if (input) input.click();
                }}
              >
                <input
                  id="studio-shorts-file-input"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processShortsUpload(e.target.files[0]);
                    }
                  }}
                />

                {shortsUploadProgress !== null ? (
                  <div className="max-w-md mx-auto space-y-3 py-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                      <span>جاري رفع ونشر فيديو الشورتس للأبطال: {uploadedShortFileName}</span>
                      <span>{shortsUploadProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--line)]">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 transition-all duration-300 rounded-full shadow-lg shadow-rose-500/50" 
                        style={{ width: `${shortsUploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[var(--ink-soft)] animate-pulse">
                      يتم الآن تحسين دقة الفيديو وضبط مقاسات الريلز للهواتف الذكية...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 shadow-lg shadow-rose-500/10">
                      <Film className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[var(--ink)]">
                        اسحبي وأفلتي مقطع فيديو الشورتس هنا
                      </h4>
                      <p className="text-xs text-[var(--ink-soft)] mt-1">
                        يدعم صيغ MP4, MOV بمدة من 15 إلى 90 ثانية • معالجة فورية وميزة التشغيل التلقائي
                      </p>
                    </div>
                    <div className="pt-1">
                      <span className="px-4 py-1.5 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] text-[var(--ink)] rounded-xl text-xs font-bold border border-[var(--line)] transition-colors inline-block">
                        أو انقري لاختيار فيديو من جهازك 📁
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* One-Click Presets for Shorts */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[var(--ink-soft)] font-bold">فيديوهات شورتس سريعة:</span>
                <button
                  onClick={() => processShortsUpload({
                    name: 'البطلة_ملك_تحل_15_مسألة_في_6_ثوان_بالسوروبان.mp4',
                    category: 'حساب ذهني',
                    duration: '0:48',
                    thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80'
                  })}
                  className="px-3 py-1.5 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-rose-400/20 text-[var(--ink-soft)] hover:text-rose-300 border border-[var(--line)] rounded-xl transition-colors"
                >
                  + فيديو سرعة بالعداد (ملك)
                </button>
                <button
                  onClick={() => processShortsUpload({
                    name: 'فرحة_الطفل_حمزة_بتهجي_وقراءة_أول_قصة.mp4',
                    category: 'تأسيس قراءة',
                    duration: '0:55',
                    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80'
                  })}
                  className="px-3 py-1.5 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-emerald-400/20 text-[var(--ink-soft)] hover:text-emerald-300 border border-[var(--line)] rounded-xl transition-colors"
                >
                  + فرحة حمزة بقراءة أول قصة
                </button>
                <button
                  onClick={() => processShortsUpload({
                    name: 'كواليس_تحدي_السرعة_بين_أبطال_المنصورة_والسعودية.mp4',
                    category: 'فصول تفاعلية',
                    duration: '1:02',
                    thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'
                  })}
                  className="px-3 py-1.5 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:bg-amber-400/20 text-[var(--ink-soft)] hover:text-amber-300 border border-[var(--line)] rounded-xl transition-colors"
                >
                  + كواليس التحدي الأونلاين المباشر
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-[var(--bg-elevated)]/60 p-3 rounded-2xl border border-[var(--line)]">
              <button
                onClick={() => setShortsCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  shortsCategoryFilter === 'all'
                    ? 'bg-rose-500 text-[var(--ink)] font-black shadow-md'
                    : 'bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-[var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]'
                }`}
              >
                جميع الفيديوهات ({shortsList.length})
              </button>
              <button
                onClick={() => setShortsCategoryFilter('حساب ذهني')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  shortsCategoryFilter === 'حساب ذهني'
                    ? 'bg-amber-400 text-[var(--ink)] font-black'
                    : 'bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-[var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]'
                }`}
              >
                أبطال السوروبان 🧮
              </button>
              <button
                onClick={() => setShortsCategoryFilter('تأسيس قراءة')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  shortsCategoryFilter === 'تأسيس قراءة'
                    ? 'bg-emerald-400 text-[var(--ink)] font-black'
                    : 'bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-[var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]'
                }`}
              >
                أبطال القراءة 📖
              </button>
              <button
                onClick={() => setShortsCategoryFilter('فصول تفاعلية')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  shortsCategoryFilter === 'فصول تفاعلية'
                    ? 'bg-sky-400 text-[var(--ink)] font-black'
                    : 'bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-[var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]'
                }`}
              >
                كواليس الحصص المباشرة 🎥
              </button>
            </div>

            {/* Shorts Cards Grid (9:16 Aspect Ratio) with Child-Friendly Rounded Styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shortsList
                .filter(s => shortsCategoryFilter === 'all' || s.category === shortsCategoryFilter)
                .map((short) => (
                  <div 
                    key={short.id} 
                    className="bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-[2rem] overflow-hidden shadow-xl flex flex-col justify-between hover:border-rose-400/40 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div 
                      className="relative aspect-[9/13] bg-[var(--bg-inset)] overflow-hidden cursor-pointer"
                      onClick={() => setPreviewLessonUrl(short.videoUrl)}
                    >
                      <img 
                        src={short.thumbnail} 
                        alt={short.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-a)] via-slate-950/20 to-transparent" />
                      
                      {/* Play overlay button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-rose-500/90 text-[var(--ink)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white mr-0.5" />
                        </div>
                      </div>

                      <span className="absolute top-3 right-3 bg-[var(--bg-elevated)]/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-[var(--line)]">
                        {short.category}
                      </span>

                      <span className="absolute top-3 left-3 bg-rose-600 text-[var(--ink)] text-[10px] font-bold px-2 py-0.5 rounded-xl shadow">
                        {short.duration}
                      </span>

                      <div className="absolute bottom-3 inset-x-3 text-right">
                        <h4 className="text-xs font-bold text-[var(--ink)] leading-snug line-clamp-2 drop-shadow">
                          {short.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-[var(--ink-soft)] mt-2 font-mono">
                          <span className="flex items-center gap-1 text-amber-300">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{short.views}</span>
                          </span>
                          <span className="flex items-center gap-1 text-rose-300">
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                            <span>{short.likes}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-[var(--line)] flex items-center justify-between bg-[var(--bg-elevated)]/50">
                      <button
                        onClick={() => setPreviewLessonUrl(short.videoUrl)}
                        className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-rose-300" />
                        <span>تشغيل ومعاينة</span>
                      </button>

                      <button
                        onClick={() => handleDeleteShort(short.id)}
                        className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                        title="حذف الفيديو"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal: Add Short */}
            {isAddingShort && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/80 backdrop-blur-md">
                <div className="bg-[var(--bg-elevated)] border border-[var(--line-strong)] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <h4 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                      <Film className="w-4 h-4 text-rose-400" />
                      <span>إضافة فيديو شورتس جديد للأبطال</span>
                    </h4>
                    <button onClick={() => setIsAddingShort(false)} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">✕</button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[var(--ink-soft)] mb-1 font-bold">عنوان الفيديو:</label>
                      <input
                        type="text"
                        value={newShortTitle}
                        onChange={(e) => setNewShortTitle(e.target.value)}
                        placeholder="مثال: البطلة مريم تحسب 20 عملية في 10 ثوانٍ بالعداد!"
                        className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[var(--ink-soft)] mb-1 font-bold">رابط الفيديو:</label>
                      <input
                        type="text"
                        value={newShortVideoUrl}
                        onChange={(e) => setNewShortVideoUrl(e.target.value)}
                        className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] font-mono text-[11px]"
                        dir="ltr"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[var(--ink-soft)] mb-1 font-bold">القسم:</label>
                        <select
                          value={newShortCategory}
                          onChange={(e) => setNewShortCategory(e.target.value)}
                          className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] font-bold"
                        >
                          <option value="حساب ذهني">حساب ذهني وسوروبان</option>
                          <option value="تأسيس قراءة">تأسيس قراءة وقرائية</option>
                          <option value="رياضيات ذكية">رياضيات ذكية</option>
                          <option value="فصول تفاعلية">فصول تفاعلية مباشرة</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[var(--ink-soft)] mb-1 font-bold">المدة التقريبية:</label>
                        <input
                          type="text"
                          value={newShortDuration}
                          onChange={(e) => setNewShortDuration(e.target.value)}
                          placeholder="مثال: 0:50"
                          className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={handleCreateShort}
                      className="flex-1 py-3 bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 text-[var(--ink)] font-black rounded-xl text-xs shadow-md transition-transform active:scale-95"
                    >
                      نشر الفيديو فوراً
                    </button>
                    <button
                      onClick={() => setIsAddingShort(false)}
                      className="px-4 py-3 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] text-[var(--ink-soft)] rounded-xl text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LIVE CLASSES STUDIO                                */}
        {/* ========================================================= */}
        {activeSection === 'live' && (
          <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                  فصول البث المباشر
                </span>
                <h2 className="text-xl font-black text-[var(--ink)] mt-2">
                  حصص البث المباشر ومشاركة الشاشة التفاعلية
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {liveSessions.map((session) => (
                <div 
                  key={session.id}
                  className="bg-[var(--bg-elevated)]/70 border border-[var(--line)] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <h4 className="text-base font-bold text-[var(--ink)]">{session.title}</h4>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full">
                        كود: {session.meetingCode}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)]">{session.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[var(--ink-soft)]">
                      <span>المدة: {session.durationMinutes} دقيقة</span>
                      <span>الحاضرون: {session.attendeesCount} طالب</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onLaunchLiveHost(session)}
                    className="px-6 py-3 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-[var(--ink)] font-black rounded-xl text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-transform hover:scale-105"
                  >
                    <Video className="w-4 h-4" />
                    <span>بدء البث ومشاركة الشاشة الآن</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: GRADING & EXERCISES FEEDBACK                       */}
        {/* ========================================================= */}
        {activeSection === 'grading' && (
          <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-[2rem] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-[var(--line)] pb-4">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                تصحيح الواجبات
              </span>
              <h2 className="text-xl font-black text-[var(--ink)] mt-2">
                واجبات وتمارين الأطفال المشتركين
              </h2>
            </div>

            <div className="space-y-4">
              {submissions.map((sub) => (
                <div 
                  key={sub.id} 
                  className="bg-[var(--bg-elevated)]/70 border border-[var(--line)] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌟</span>
                      <h4 className="text-sm font-bold text-[var(--ink)]">{sub.studentName}</h4>
                      <span className="text-xs text-amber-300 font-mono">({sub.assignmentTitle})</span>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] font-mono bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-white/5">
                      حل الطالب: "{sub.textSubmission}"
                    </p>
                    {sub.feedback && (
                      <p className="text-xs text-emerald-400 font-medium">
                        ملاحظة المعلمة: {sub.feedback}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.status === 'graded' ? (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>تم التصحيح ({sub.grade}/{sub.maxScore})</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setGradingSub(sub);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[var(--ink)] font-black rounded-xl text-xs transition-transform hover:scale-105"
                      >
                        تصحيح وإرسال تشجيع
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Grading Modal */}
            {gradingSub && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-elevated)]/80 backdrop-blur-md">
                <div className="bg-[var(--bg-elevated)] border border-[var(--line-strong)] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
                  <div className="border-b border-[var(--line)] pb-3">
                    <h4 className="text-base font-bold text-[var(--ink)]">تصحيح واجب البطل: {gradingSub.studentName}</h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[var(--ink-soft)] mb-1 font-bold">الدرجة (من {gradingSub.maxScore}):</label>
                      <input
                        type="number"
                        defaultValue={gradingSub.maxScore}
                        id="grade-val"
                        className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)] font-mono text-base font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[var(--ink-soft)] mb-1 font-bold">كلمات التشجيع والتحفيز للطفل:</label>
                      <textarea
                        rows={3}
                        value={gradeFeedback}
                        onChange={(e) => setGradeFeedback(e.target.value)}
                        className="w-full bg-[var(--bg-inset)] border border-[var(--line)] rounded-xl p-3 text-[var(--ink)]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={() => {
                        const inputEl = document.getElementById('grade-val') as HTMLInputElement;
                        const score = Number(inputEl?.value) || gradingSub.maxScore;
                        onGradeSubmission(gradingSub.id, score, gradeFeedback);
                        setGradingSub(null);
                        alert('تم تسجيل الدرجة وإرسال التشجيع للطفل بنجاح! 🌟');
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-[var(--ink)] font-black rounded-xl text-xs"
                    >
                      إرسال التقييم
                    </button>
                    <button
                      onClick={() => setGradingSub(null)}
                      className="px-4 py-3 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] text-[var(--ink-soft)] rounded-xl text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
