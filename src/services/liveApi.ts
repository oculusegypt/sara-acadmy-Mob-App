/**
 * liveApi.ts — واجهة برمجية حية بالكامل (لا localStorage للبيانات الجوهرية)
 * كل العمليات تمر عبر Express → Supabase PostgreSQL. عند تعذر الاتصال
 * تظهر حالة انصال صريحة (online=false) بدلاً من إرجاع بيانات وهمية.
 */

export type LiveUser = { id: string; email: string; displayName: string; role: 'learner' | 'instructor' | 'admin' };
export type EnrollmentRecord = { courseId: string; status: string; source: string; enrolledAt: string };
export type TicketResult = { token: string; roomId: string; roomTitle: string; guest?: boolean };
export type ApiError = { error: string; message: string; status: number };

const SESSION_KEY = 'sara_live_session_v1';

let lastOnline = true;
export function isLiveOnline() { return lastOnline; }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let body: any = {};
    try { body = await res.json(); } catch { /* ignore */ }
    lastOnline = true; // الخادم يرد — الاتصال سليم والرفض منطقي
    throw { error: body.error || 'REQUEST_FAILED', message: body.message || `تعذر إتمام العملية (${res.status})`, status: res.status } as ApiError;
  }
  lastOnline = true;
  return res.json();
}

function markOffline(e: any) {
  if (e instanceof TypeError) { lastOnline = false; } // فشل شبكة صريح
}

// ===== الجلسة المحلية (هوية المستخدم فقط — بقية البيانات من السيرفر) =====
export function getSavedSession(): LiveUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveSession(user: LiveUser, remember = true) {
  const data = JSON.stringify(user);
  sessionStorage.setItem(SESSION_KEY, data);
  if (remember) localStorage.setItem(SESSION_KEY, data);
  else localStorage.removeItem(SESSION_KEY);
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// ===== المصادقة الحقيقية =====
export async function registerAccount(name: string, email: string, role: string, password?: string): Promise<LiveUser> {
  try {
    const u = await request<LiveUser>('/api/auth/register', {
      method: 'POST', body: JSON.stringify({ name, email, role, password }),
    });
    saveSession(u);
    return u;
  } catch (e) { markOffline(e); throw e; }
}

export async function loginAccount(email: string, password?: string): Promise<LiveUser> {
  try {
    const u = await request<LiveUser>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    saveSession(u);
    return u;
  } catch (e) { markOffline(e); throw e; }
}

// ===== الاشتراكات الحية =====
export async function enrollInCourse(userId: string, courseId: string, userName: string, source = 'purchase'): Promise<{ ok: boolean }> {
  try {
    return await request('/api/enroll', {
      method: 'POST', body: JSON.stringify({ userId, courseId, userName, source }),
    });
  } catch (e) { markOffline(e); throw e; }
}

export async function fetchEnrollments(userId: string): Promise<EnrollmentRecord[]> {
  try {
    return await request<EnrollmentRecord[]>(`/api/enrollments/${encodeURIComponent(userId)}`);
  } catch (e) { markOffline(e); return []; }
}

// ===== بطاقات دخول غرف البث =====
export async function requestRoomTicket(roomId: string, user: LiveUser): Promise<TicketResult> {
  return await request<TicketResult>(`/api/live/${encodeURIComponent(roomId)}/ticket`, {
    method: 'POST', body: JSON.stringify({ userId: user.id, name: user.displayName, role: user.role }),
  });
}

export async function requestGuestTicket(roomId: string, name: string): Promise<TicketResult> {
  return await request<TicketResult>(`/api/live/${encodeURIComponent(roomId)}/guest-ticket`, {
    method: 'POST', body: JSON.stringify({ name }),
  });
}

// ===== جدول المواعيد الحي حسب اشتراك الطالب =====
export type ScheduleSlot = {
  id: string; title: string; courseTitle: string; courseId: string;
  meetingCode: string; instructorName: string; startsAt: string; durationMinutes: number;
  status: string; openRoom: boolean; myEnrolled: boolean; attendeesCount: number;
};

export async function fetchSchedule(userId: string | null): Promise<ScheduleSlot[]> {
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  try {
    return await request<ScheduleSlot[]>(`/api/schedule${q}`);
  } catch (e) { markOffline(e); return []; }
}

export async function recordAttendance(sessionId: string, user: LiveUser): Promise<void> {
  try {
    await request(`/api/live/${encodeURIComponent(sessionId)}/attendance`, {
      method: 'POST', body: JSON.stringify({ userId: user.id, name: user.displayName, role: user.role }),
    });
  } catch { /* حضور بلا تسجيل لا يجب أن يكسر الجلسة */ }
}
