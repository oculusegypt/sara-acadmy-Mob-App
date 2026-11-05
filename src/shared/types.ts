export type CourseStatus = 'draft' | 'in_review' | 'published' | 'archived';
export type EnrollmentStatus = 'active' | 'completed' | 'refunded' | 'revoked';
export type MediaStatus = 'uploaded' | 'scanning' | 'processing' | 'ready' | 'failed' | 'archived';
export type PaymentStatus = 'created' | 'requires_action' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded' | 'disputed';
// الأدوار المعتمدة فعلياً في النظام كله: الواجهة والخادم وقاعدة البيانات تتطابق تماماً
// (كان 'reviewer' نوعاً ميتاً لا تستخدمه أي نقطة نهاية — أُزيل لمنع تضارب الصلاحيات)
export type UserRole = 'learner' | 'instructor' | 'admin';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  locale: string;
  avatarUrl?: string;
  organization?: string;
}

export interface ResourceAttachment {
  id: string;
  title: string;
  fileType: 'pdf' | 'zip' | 'code' | 'doc';
  fileSize: string;
  url: string;
}

export interface TranscriptLine {
  id: string;
  timeSeconds: number;
  speaker: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question?: string;
  prompt?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  hint?: string;
}

export interface QuizData {
  id: string;
  title: string;
  timeLimitMinutes?: number;
  passingScorePercent?: number;
  passingScore?: number;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  lessonKind: 'video' | 'text' | 'quiz' | 'resources';
  durationSeconds: number;
  position: number;
  isPreview: boolean;
  videoUrl?: string;
  bodyMarkdown?: string;
  description?: string;
  transcript?: TranscriptLine[];
  resources?: ResourceAttachment[];
  quiz?: QuizData;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  languageCode: string;
  level: CourseLevel;
  category: string;
  status: CourseStatus;
  priceMinor: number; // in cents/halalas/piastres, 0 = free
  currency: 'USD' | 'SAR' | 'EGP';
  version: number;
  rating: number;
  reviewsCount: number;
  durationHours: number;
  thumbnailUrl: string;
  instructor: {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatarUrl: string;
  };
  outcomes: string[];
  prerequisites: string[];
  sections: CourseSection[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  source: 'free' | 'purchase' | 'admin_grant';
  enrolledAt: string;
  completedAt?: string;
  currentLessonId?: string;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  progressSeconds: number;
  completed: boolean;
  completedAt?: string;
  lastSeenAt: string;
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  instructorName: string;
  verificationCode: string;
  issuedAt: string;
  gradePercentage: number;
  skillsVerified: string[];
  revokedAt?: string;
  revocationReason?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  provider: string;
  providerPaymentId: string;
  idempotencyKey: string;
  status: PaymentStatus;
  amountMinor: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  reason?: string;
  correlationId: string;
  safeMetadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PlaybackSessionToken {
  lessonId: string;
  token: string;
  playbackUrl: string;
  expiresAt: string;
  isAuthorized: boolean;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: {
    lessonTitle: string;
    timestampSeconds?: number;
    quote: string;
  }[];
  isReported?: boolean;
}

export interface LiveSession {
  id: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'upcoming' | 'live' | 'ended';
  attendeesCount: number;
  meetingCode: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  rubric: string[];
  dueDate: string;
  maxScore: number;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  textSubmission: string;
  repoUrl?: string;
  grade?: number;
  maxScore: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface ClassroomParticipant {
  id: string;
  name: string;
  // الأدوار الفعلية المتوافق عليها في النظام كله (مطابقة لـ UserRole وخادم realtime)
  role: Extract<UserRole, 'instructor' | 'learner' | 'admin'>;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  joinedAt: string;
}

export interface ClassroomMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'instructor' | 'learner';
  text: string;
  timestamp: string;
  isQuestion?: boolean;
  upvotes?: number;
}

