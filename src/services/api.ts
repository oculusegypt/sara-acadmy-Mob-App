/**
 * src/services/api.ts — طبقة الخدمة الوحيدة للواجهة: كل قراءاتها وكتابتها عبر نقاط نهاية حقيقية
 * على الخادم المفصولة تخصصاته (Supabase PostgreSQL حي). لا بيانات وهمية، لا seed محلي،
 * ولا localStorage كمصدر للحقيقة — الفشل الصريح أفضل من العرض المزوَّر.
 */
import type { Course, LiveSession, Assignment, StudentSubmission, Enrollment, LessonProgress, Certificate, AuditEvent, PlaybackSessionToken } from '../shared/types';

// ===== الدورات =====
export async function getCourses(): Promise<Course[]> {
  const res = await fetch('/api/courses');
  if (!res.ok) throw new Error('تعذر تحميل الدورات من قاعدة البيانات الحية');
  return await res.json();
}

export async function saveCourse(course: Course & { updatedBy?: string; updatedByName?: string }): Promise<Course> {
  const res = await fetch(`/api/courses/${encodeURIComponent(course.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b?.message || 'تعذر حفظ الدورة في قاعدة البيانات');
  }
  return course;
}

// ===== المكتبة الرقمية =====
export async function getLibraryBooks() {
  const res = await fetch('/api/library/books');
  if (!res.ok) throw new Error('تعذر تحميل المكتبة الرقمية');
  return await res.json();
}

// ===== الجلسات المباشرة =====
export async function getLiveSessions(): Promise<LiveSession[]> {
  const res = await fetch('/api/live-sessions');
  if (!res.ok) throw new Error('تعذر تحميل جلسات البث المباشر');
  return await res.json();
}

// ===== الواجبات =====
export async function getAssignments(): Promise<Assignment[]> {
  const res = await fetch('/api/assignments');
  if (!res.ok) throw new Error('تعذر تحميل الواجبات');
  return await res.json();
}

// ===== التسليمات =====
export async function getSubmissions(filter?: { studentId?: string; assignmentId?: string }): Promise<StudentSubmission[]> {
  const q = new URLSearchParams();
  if (filter?.studentId) q.set('studentId', filter.studentId);
  if (filter?.assignmentId) q.set('assignmentId', filter.assignmentId);
  const res = await fetch(`/api/submissions${q.toString() ? '?' + q.toString() : ''}`);
  if (!res.ok) throw new Error('تعذر تحميل التسليمات');
  return await res.json();
}

export async function saveSubmission(sub: Omit<StudentSubmission, 'id' | 'submittedAt'>): Promise<StudentSubmission> {
  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'تعذر تسجيل التسليم في قاعدة البيانات');
  return { ...sub, id: data.id, submittedAt: data.submittedAt } as StudentSubmission;
}

export async function gradeSubmission(subId: string, grade: number, feedback: string, graderName?: string) {
  const res = await fetch(`/api/submissions/${encodeURIComponent(subId)}/grade`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade, feedback, graderName }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'تعذر رصد الدرجة');
  return data as { success: boolean; id: string; grade: number; status: string };
}

// ===== الشهادات — تُصدر من الخادم برمز تحقق موقّع HMAC =====
export async function getCertificates(userId?: string): Promise<Certificate[]> {
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await fetch(`/api/certificates${q}`);
  if (!res.ok) throw new Error('تعذر تحميل الشهادات');
  return await res.json();
}

export async function issueCertificate(certData: Omit<Certificate, 'id' | 'verificationCode' | 'issuedAt'>): Promise<Certificate> {
  const res = await fetch('/api/certificates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(certData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'تعذر إصدار الشهادة — تأكد من إتمام 60% من دروس الدورة أولاً');
  return { ...certData, id: data.id, verificationCode: data.verificationCode, issuedAt: data.issuedAt } as Certificate;
}

/** التحقق العام من شهادة برمزها — يقرأ من قاعدة البيانات ويتحقق من توقيع HMAC ميكانيكياً */
export async function verifyCertificateByCode(code: string): Promise<Certificate | null> {
  try {
    const res = await fetch(`/api/certificates/verify/${encodeURIComponent(code.trim().toUpperCase())}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.valid) return data.certificate as Certificate;
    return null; // غير موجودة أو التوقيع مكسور (شهادة مزوّرة)
  } catch {
    return null;
  }
}

// ===== الاشتراكات الحقيقية (orbit_enrollments في Supabase) =====
export async function getEnrollments(userId: string): Promise<Enrollment[]> {
  try {
    const res = await fetch(`/api/enrollments/${encodeURIComponent(userId)}`);
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? rows.map((r: any) => ({
      id: r.id || 'enr-' + r.courseId, userId, courseId: r.courseId,
      status: r.status, source: r.source, enrolledAt: r.enrolledAt,
    })) : [];
  } catch {
    return []; // انقطاع الشبكة = قائمة فارغة صريحة، لا اشتراكات وهمية
  }
}

export async function enrollInCourse(userId: string, courseId: string, source: 'free' | 'purchase' = 'free', userName?: string): Promise<Enrollment> {
  const res = await fetch('/api/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, courseId, source, userName }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'تعذر تسجيل الاشتراك في الدورة');
  return { id: 'enr-' + Date.now(), userId, courseId, status: 'active', source, enrolledAt: new Date().toISOString() };
}

// ===== تقدم الدروس — مصدر الحقيقة قاعدة البيانات، مع دمج نسخة محلية للأوفلاين =====
const PROGRESS_KEY = 'orbit_progress_2026';

export async function getCourseProgress(userId: string, _courseId?: string): Promise<Record<string, LessonProgress>> {
  const map: Record<string, LessonProgress> = {};
  try {
    const res = await fetch(`/api/progress/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const rows: LessonProgress[] = await res.json();
      if (Array.isArray(rows)) rows.forEach(p => { map[p.lessonId] = p; });
    }
  } catch {}
  // المحلي يُدمج أسفل الخادم (الخادم مصدر الحقيقة)، ويُستخدم فقط أثناء الانقطاع
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (stored) {
    (JSON.parse(stored) as LessonProgress[]).filter(p => p.userId === userId).forEach(p => {
      if (!map[p.lessonId]) map[p.lessonId] = p;
    });
  }
  return map;
}

export async function saveLessonProgress(userId: string, lessonId: string, progressSeconds: number, completed: boolean): Promise<LessonProgress> {
  const item: LessonProgress = {
    userId, lessonId, progressSeconds, completed,
    completedAt: completed ? new Date().toISOString() : undefined,
    lastSeenAt: new Date().toISOString(),
  };
  // الكتابة الحية في Supabase أولاً — المصدر الحقيقي للتقدم
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, progressSeconds, completed }),
    });
    if (!res.ok) console.warn('progress: server rejected write');
  } catch {}
  // نسخة محلية احتياطية للاستخدام دون اتصال (دمج، لا استبدال)
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    const list: LessonProgress[] = stored ? JSON.parse(stored) : [];
    const idx = list.findIndex(p => p.userId === userId && p.lessonId === lessonId);
    if (idx >= 0) {
      const prev = list[idx];
      list[idx] = {
        ...item,
        progressSeconds: Math.max(prev.progressSeconds, progressSeconds),
        completed: prev.completed || completed,
        completedAt: (prev.completed || completed) ? (prev.completedAt || item.completedAt) : undefined,
      };
    } else list.push(item);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
  } catch {}
  return item;
}

/** مزامنة كاملة من الخادم — تكافئ getCourseProgress (الخادم هو الأساس) */
export async function getCourseProgressServer(userId: string): Promise<Record<string, LessonProgress>> {
  return await getCourseProgress(userId);
}

// ===== بطاقة الدفع: إصدار قيد حقيقي موقّع HMAC مع مفتاح تحصين فريد =====
export async function createCheckoutPayment(params: {
  userId: string;
  userName?: string;
  courseId: string;
  courseTitle: string;
  amountMinor: number;
  idempotencyKey: string;
}): Promise<{ paymentId: string; status: string; replayed?: boolean }> {
  const res = await fetch('/api/payments/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'تعذر إنشاء عملية الدفع');
  return data;
}

// جلب توقيع العملية من إيصال البوابة (يُعاد للخادم عند الالتقاط للتحقق المزدوج)
export async function getPaymentSignature(paymentId: string): Promise<string> {
  const res = await fetch(`/api/payments/${encodeURIComponent(paymentId)}/signature`);
  if (!res.ok) throw new Error('تعذر استلام توقيع العملية');
  const { signature } = await res.json();
  return signature;
}

// تأكيد الدفع: التحقق من التوقيع ثم الاشتراك الفعلي في نفس المعاملة الذرية
export async function capturePayment(paymentId: string, signature: string): Promise<{ ok: boolean; signatureVerified: boolean }> {
  const res = await fetch(`/api/payments/${encodeURIComponent(paymentId)}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signature }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'تعذر تأكيد عملية الدفع');
  return data;
}

// استرداد مالي حقيقي عبر الخادم وقاعدة البيانات
export async function refundPayment(paymentId: string, actor: { userId: string; name: string }, reason?: string): Promise<{ ok: boolean; refundedAmountMinor: number }> {
  const res = await fetch(`/api/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorUserId: actor.userId, actorName: actor.name, reason }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'تعذر تنفيذ الاسترداد');
  return data;
}

export type PaymentRecord = {
  id: string; userId: string; userName: string; courseId: string; courseTitle: string;
  amountMinor: number; currency: string; status: string; idempotencyKey: string; providerPaymentId?: string;
  createdAt: string; capturedAt: string | null;
};

export async function getPayments(): Promise<PaymentRecord[]> {
  const res = await fetch('/api/payments');
  if (!res.ok) throw new Error('تعذر تحميل سجل المدفوعات');
  return await res.json();
}

// ===== بطاقة التشغيل — موقعة HMAC من الخادم فقط؛ لا توكن وهمي عند فشل الاتصال =====
export async function getPlaybackToken(lessonId: string, userId: string, isEnrolled: boolean, isPreview: boolean): Promise<PlaybackSessionToken> {
  const res = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/playback-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, isEnrolled, isPreview }),
  });
  if (!res.ok) {
    let msg = 'تعذر إصدار بطاقة التشغيل';
    try { const b = await res.json(); msg = b.message || msg; } catch {}
    throw new Error(msg);
  }
  return await res.json();
}

// ===== سجل التدقيق الموحد — قراءة/كتابة حقيقيتان من/إلى قاعدة البيانات =====
export async function getAuditEvents(): Promise<AuditEvent[]> {
  const res = await fetch('/api/audit?limit=200');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function recordAudit(audit: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<AuditEvent> {
  const res = await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(audit),
  });
  const saved = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(saved?.message || 'تعذر تسجيل حدث التدقيق');
  return { ...audit, id: saved.id || 'aud-' + Date.now(), createdAt: new Date().toISOString() };
}

// ===== تهيئة الواجهة — لم تعد تكتب أي seed محلي؛ التحقق من صحة الخادم فقط =====
export async function initializeStorage(): Promise<void> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) console.warn('initializeStorage: server unhealthy');
  } catch {
    console.warn('initializeStorage: server unreachable');
  }
}

// ===== رفع الوسائط الحقيقي: توقيع HMAC قصير الأمد ثم رفع البايتات الفعلية =====
export type UploadResult = { ok: boolean; id: string; url: string; bytes: number; sha256: string; mime: string };

export async function uploadMediaFile(file: File, opts: { kind: 'video' | 'pdf' | 'image' | 'audio'; user: { id: string; name: string }; course?: string; lesson?: string }): Promise<UploadResult> {
  // طلب توقيع من الخادم (يتطلب جلسة مسجّلة) — لا توقيع محلي بالسر
  const signRes = await fetch('/api/media/sign-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, kind: opts.kind, user: opts.user.id }),
  });
  const sign = await signRes.json().catch(() => ({}));
  if (!signRes.ok) throw new Error(sign?.message || 'تعذر الحصول على تصريح الرفع');
  const q = new URLSearchParams({
    name: file.name, kind: opts.kind, user: opts.user.id, uname: opts.user.name,
    ts: String(sign.ts), sig: sign.sig,
  });
  if (opts.course) q.set('course', opts.course);
  if (opts.lesson) q.set('lesson', opts.lesson);
  const res = await fetch(`/api/media/upload?${q.toString()}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.error || 'فشل رفع الملف إلى الخادم');
  return data as UploadResult;
}

// ===== شورتس: CRUD حقيقي عبر القاعدة =====
export type ShortItem = { id: string; title: string; videoUrl: string; category: string; duration: string; thumbnail: string; views: number; likes: number };
export async function getShorts(): Promise<ShortItem[]> {
  const res = await fetch('/api/media/shorts');
  if (!res.ok) throw new Error('تعذر تحميل الشورتس');
  return await res.json();
}
export async function createShort(s: Omit<ShortItem, 'id' | 'views' | 'likes'> & { instructorId?: string }): Promise<{ ok: boolean; id: string }> {
  const res = await fetch('/api/media/shorts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d?.message || 'تعذر نشر الشورتس');
  return d;
}
export async function deleteShort(id: string): Promise<void> {
  const res = await fetch(`/api/media/shorts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('تعذر حذف الشورتس');
}
export async function bumpShort(id: string, action: 'view' | 'like'): Promise<void> {
  try { await fetch(`/api/media/shorts/${encodeURIComponent(id)}/${action}`, { method: 'POST' }); } catch {}
}

// ===== مكتبة: CRUD حقيقي عبر القاعدة =====
export type LibraryBookItem = { id: string; title: string; author: string; category: string; pagesCount: number; coverUrl: string; description: string; downloadUrl: string; publishedYear: number };
export async function createLibraryBook(b: Omit<LibraryBookItem, 'id'> & { instructorId?: string }): Promise<{ ok: boolean; id: string }> {
  const res = await fetch('/api/media/library/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d?.message || 'تعذر نشر الكتاب في المكتبة');
  return d;
}
export async function deleteLibraryBook(id: string): Promise<void> {
  const res = await fetch(`/api/media/library/books/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('تعذر حذف الكتاب');
}

// ===== الحجوزات الحقيقية (لوحة الإدارة) — قاعدة البيانات بدل localStorage =====
export type BookingItem = { refCode: string; childName: string; childAge?: string; parentName: string; phone?: string; country?: string; city?: string; program?: string; studyMode?: string; paymentMethod?: string; transferRef?: string; status: string; createdAt?: string };

export async function getBookings(actorUserId?: string): Promise<BookingItem[]> {
  const res = await fetch(`/api/admin/bookings${actorUserId ? `?actorUserId=${encodeURIComponent(actorUserId)}` : ''}`);
  if (!res.ok) throw new Error('تعذر تحميل طلبات الحجز من الخادم');
  return res.json();
}

export async function createBooking(b: Partial<BookingItem>): Promise<BookingItem> {
  const res = await fetch('/api/admin/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.message || 'فشل إنشاء الحجز');
  return j;
}

export async function updateBookingStatus(refCode: string, status: string, actor: { userId: string; name: string }): Promise<BookingItem> {
  const res = await fetch(`/api/admin/bookings/${refCode}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, actorUserId: actor.userId, actorName: actor.name }) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.message || 'فشل تحديث حالة الحجز');
  return j;
}

export async function deleteBooking(refCode: string, actorUserId: string): Promise<void> {
  const res = await fetch(`/api/admin/bookings/${refCode}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actorUserId }) });
  if (!res.ok) throw new Error('فشل حذف الحجز');
}

// ===== المستخدمون الحقيقيون + RBAC =====
export type AdminUserRow = { id: string; email: string; displayName: string; role: string; createdAt?: string };

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const res = await fetch('/api/admin/users');
  if (!res.ok) throw new Error('تعذر تحميل المستخدمين من قاعدة البيانات');
  return res.json();
}

// ملخص مالي حي من جدول orbit_payments (محسوب في Postgres — لا أرقام ثابتة)
export type FinanceSummary = {
  capturedCount: number; capturedMinor: number; currency: string;
  refundedCount: number; refundedMinor: number; pendingCount: number; webhookSignedCount: number;
};
export async function getFinanceSummary(): Promise<FinanceSummary> {
  const res = await fetch('/api/admin/finance/summary');
  if (!res.ok) throw new Error('تعذر تحميل الملخص المالي من قاعدة البيانات');
  return await res.json();
}

export async function revokeUserSession(id: string, actor: { userId: string; name: string }): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}/revoke-session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actorUserId: actor.userId, actorName: actor.name }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'تعذر إبطال الجلسة');
}

export async function changeUserRole(id: string, role: string, actor: { userId: string; name: string }): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, actorUserId: actor.userId, actorName: actor.name }) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.message || 'فشل تغيير الدور');
}
