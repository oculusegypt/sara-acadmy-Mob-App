export interface BlueprintDocument {
  id: string;
  category: 'core' | 'docs' | 'architecture' | 'database' | 'api' | 'agents' | 'diagrams';
  title: string;
  badge: string;
  description: string;
  content: string;
}

export const BLUEPRINT_DOCUMENTS: BlueprintDocument[] = [
  {
    id: 'readme',
    category: 'core',
    title: 'الميثاق العام للمخطط التنفيذي 2026',
    badge: 'README',
    description: 'الرؤية العامة، فلسفة المنصة، مبدأ الجودة 9.5/10، والافتراضات المبدئية.',
    content: `# ORBIT Learn 2026 — المخطط التنفيذي لمنصة تعلم رقمية حديثة

**الإصدار:** 1.0.0-draft · **التاريخ:** 2026-11-01 · **اللغة:** العربية أولًا مع بنية متعددة اللغات.

## الرؤية
منصة تعليم إلكتروني عربية RTL وحديثة تجمع: اكتشاف الدورات، مسارات تعلم، فيديو متكيف، دروس مباشرة، اختبارات، مشاريع، شهادات قابلة للتحقق، مجتمع تعلّم، لوحة للمدرس، تحليلات تعلم مسؤولة، ومساعد تعليمي بالذكاء الاصطناعي يستند إلى محتوى الدورة المصرح به ولا يخترع إجابات.

## مبدأ الجودة الصارم
هدف التصميم هو بلوغ مستوى مراجعة 9.5/10 في كل محور قبل الإطلاق، لكن لا تُمنح هذه الدرجة فعليًا إلا بعد تنفيذ الاختبارات، وإغلاق المخاطر الحرجة، وقياس الأداء، ومراجعة الأمن والإتاحة. لا تُعرض الأهداف كإنجازات مثبتة دون أدلة.

## افتراضات مبدئية
- واجهة ويب متجاوبة، PWA اختيارية، مع العربية RTL من اليوم الأول.
- تطبيق أحادي معياري (Modular Monolith) في البداية بدل Microservices المبكرة.
- PostgreSQL كمصدر الحقيقة، وتخزين كائنات للوسائط، وCDN متخصص للفيديو.
- مزود فيديو ودفع خلف واجهات Adapters لمنع الارتهان لمزود واحد.
- لا تُخزن بيانات بطاقات الدفع نهائياً، وتُتحقق webhooks بتوقيع ومفتاح Idempotency.`
  },
  {
    id: 'charter',
    category: 'docs',
    title: '01 — الميثاق التنفيذي والشرائح',
    badge: 'CHARTER',
    description: 'الهدف، شرائح المستخدمين، ومبادئ الأمان والخصوصية غير القابلة للتفاوض.',
    content: `# 01 — الميثاق التنفيذي

## شرائح المستخدمين
- **متعلم:** يكتشف دورة، يشتري أو يلتحق، يتابع الدروس، ينجز الاختبارات والمشاريع، ويرى تقدمه وشهاداته.
- **مدرس/صانع محتوى:** ينشئ دورة ووحدات ودروسًا، يرفع وسائط، يبني تقييمات، ويتابع التعلم دون الوصول إلى بيانات غير لازمة.
- **مراجع محتوى:** يراجع الدقة والحقوق والإتاحة قبل النشر.
- **مشرف المنصة:** يدير الحسابات والسياسات والبلاغات والاستردادات والتدقيق ضمن صلاحيات محددة.
- **مساعد تعليمي AI:** يساعد في الشرح والتلخيص والتوجيه استنادًا إلى مصادر مصرح بها؛ لا يصدر قرارات مالية أو أكاديمية نهائية.`
  },
  {
    id: 'requirements',
    category: 'docs',
    title: '02 — متطلبات المنتج ومعايير القبول (P0/P1)',
    badge: 'PRD',
    description: 'المتطلبات الوظيفية الصارمة، قواعد التحصين، وتتبع التقدم والتصحيح.',
    content: `# 02 — متطلبات المنتج ومعايير القبول

## P0 — حسابات وصلاحيات
- **FR-AUTH-01:** تسجيل آمن، رابط تحقق أحادي الاستخدام، عدم كشف وجود الحساب عند استعادة الوصول.
- **FR-AUTH-02:** صلاحيات تُطبق على الخادم لكل عملية، لا بمجرد إخفاء عناصر الواجهة.

## P0 — الدورات والوسائط
- **FR-COURSE-01:** دورة حياة منضبطة: Draft → In Review → Published → Archived.
- **FR-MEDIA-01:** رفع الوسائط في مساحة مؤقتة وفحص الفيروسات والأبعاد قبل النشر (READY).
- **FR-VIDEO-01:** تحقق الخادم من أهلية المتعلم قبل إصدار Playback Token قصير العمر.

## P0 — الالتحاق والدفع
- **FR-ENROLL-01:** لا ينشأ الالتحاق المدفوع النهائي اعتمادًا على redirect من المتصفح بل عبر Webhook موثق server-to-server.
- **FR-PAY-01:** معيار Idempotency Key وسجل أحداث دفع Append-Only لمنع الخصم المزدوج.
- **FR-REFUND-01:** الاسترداد عملية مالية مستقلة بسجل تدقيق وموافقة مسببة.

## P0 — التعلم والشهادات
- **FR-PROGRESS-01:** حفظ التقدم بشكل Idempotent ومزامنة متعددة الأجهزة.
- **FR-QUIZ-01:** التصحيح Server-side حصراً وتدوير الأسئلة لمنع الغش.
- **FR-CERT-01:** شهادة فورية بمرجع تحقق عام وفريد (Verification Code) قابل للإبطال المبرر.`
  },
  {
    id: 'ai-tutor',
    category: 'docs',
    title: '06 — حوكمة الذكاء الاصطناعي والمساعد السقراطي',
    badge: 'AI GOVERNANCE',
    description: 'قواعد التأصيل Groundedness، منع تسريب أسئلة الاختبارات، ومكافحة Prompt Injection.',
    content: `# 06 — حوكمة الذكاء الاصطناعي والمساعد التعليمي

## معمارية المساعد
1. تحقق الخادم من هوية المستخدم وأحقيته في الوصول إلى الدورة.
2. استرجاع سياق محدود من المحتوى المعتمد للدورة مع بيانات المصدر والدقيقة.
3. معالجة النصوص كبيانات غير موثوقة (Untrusted Data).
4. إرسال الحد الأدنى عبر محوّل النموذج (Model Adapter).
5. فحص المخرجات للتأكد من وجود الاستشهاد ومنع الهلوسة.

## حواجز السلامة
- لا يسمح للنموذج بحل الواجبات والاختبارات المفتوحة مباشرة بل يقدم توجيهات وتلميحات سقراطية.
- عند غياب مصدر كافٍ: يصرح المساعد بـ «لا أملك دليلاً كافياً من مواد الدورة» بدلاً من اختلاق إجابات.
- منع كشف مفاتيح الإجابات أو بيانات الطلاب الآخرين.`
  },
  {
    id: 'scorecard',
    category: 'docs',
    title: '12 — بطاقة تقييم الجودة وبوابات 9.5/10',
    badge: 'SCORECARD',
    description: 'بوابات الإطلاق الصارمة، قواعد التوقف الإلزامية (No-Go)، والأدلة المطلوبة.',
    content: `# 12 — بطاقة تقييم الجودة وبوابات 9.5/10

## أوزان محاور التقييم
- صحة المتطلبات والمنتج: 10%
- المعمارية: 10%
- الأمن وحماية البيانات: 15%
- الخصوصية والحذف: 10%
- التعلم وجودة المحتوى: 8%
- تجربة المستخدم وRTL: 10%
- الدفع والعمليات المالية: 10%
- الأداء وزمن الاستجابة: 8%
- الموثوقية والتشغيل SRE: 7%
- حوكمة الذكاء الاصطناعي: 7%
- جودة الشيفرة وسلسلة التوريد: 5%

## قواعد التوقف الإلزامية (No-Go)
- أي ثغرة Critical أو High مفتوحة = No-Go.
- إمكانية الوصول لفيديو مدفوع دون Entitlement = No-Go.
- إمكانية تكرار الرسوم المالية = No-Go.
- مشكلة إتاحة أو RTL تمنع إتمام رحلة حرجة = No-Go.`
  },
  {
    id: 'sql-schema',
    category: 'database',
    title: 'مخطط قاعدة البيانات العلائقي (PostgreSQL DDL)',
    badge: 'SQL DDL',
    description: 'جداول المستخدمين، الدورات، الوسائط، الالتحاق، التقدم، المدفوعات، الشهادات، والتدقيق.',
    content: `-- ORBIT Learn 2026 — PostgreSQL Relational Schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE course_status AS ENUM ('draft','in_review','published','archived');
CREATE TYPE enrollment_status AS ENUM ('active','completed','refunded','revoked');
CREATE TYPE media_status AS ENUM ('uploaded','scanning','processing','ready','failed','archived');
CREATE TYPE payment_status AS ENUM ('created','requires_action','processing','succeeded','failed','refunded','partially_refunded','disputed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  locale TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'ar',
  level TEXT NOT NULL DEFAULT 'beginner',
  status course_status NOT NULL DEFAULT 'draft',
  price_minor BIGINT NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  version INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(course_id, position)
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES course_sections(id),
  title TEXT NOT NULL,
  lesson_kind TEXT NOT NULL,
  media_asset_id UUID,
  body_markdown TEXT,
  position INTEGER NOT NULL,
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  status enrollment_status NOT NULL DEFAULT 'active',
  source TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE TABLE lesson_progress (
  user_id UUID NOT NULL REFERENCES users(id),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY(user_id, lesson_id)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  idempotency_key TEXT NOT NULL,
  status payment_status NOT NULL DEFAULT 'created',
  amount_minor BIGINT NOT NULL,
  currency CHAR(3) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, idempotency_key)
);

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL UNIQUE REFERENCES enrollments(id),
  verification_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT
);

CREATE TABLE audit_events (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  reason TEXT,
  correlation_id TEXT,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
  },
  {
    id: 'openapi-spec',
    category: 'api',
    title: 'عقد واجهات برمجة التطبيقات (OpenAPI 3.1.0)',
    badge: 'OPENAPI',
    description: 'مواصفات مسارات الكتالوج، جلسات الفوترة والتحصين، توكنات الفيديو، ومسار المساعد السقراطي.',
    content: `openapi: 3.1.0
info:
  title: ORBIT Learn API
  version: 0.1.0
paths:
  /courses:
    get:
      summary: List published courses with filters
  /courses/{courseId}:
    get:
      summary: Get course detail and syllabus
  /me/enrollments:
    get:
      summary: Get current authenticated learner enrollments
  /courses/{courseId}/checkout:
    post:
      summary: Create hosted checkout session with Idempotency-Key
      parameters:
        - in: header
          name: Idempotency-Key
          required: true
  /lessons/{lessonId}/playback-token:
    post:
      summary: Issue short-lived playback token after entitlement check
  /lessons/{lessonId}/progress:
    put:
      summary: Idempotently update learner progress
  /ai/tutor/messages:
    post:
      summary: Socratic AI Tutor grounded question answering
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [courseId, message]
              properties:
                courseId: { type: string }
                lessonId: { type: string }
                message: { type: string }`
  },
  {
    id: 'diagram-architecture',
    category: 'diagrams',
    title: 'مخطط المعمارية الشاملة (System Architecture)',
    badge: 'MERMAID',
    description: 'توصيف تدفق البيانات بين الواجهة، النواة المعيارية، قاعدة البيانات، والعمال غير المتزامنين.',
    content: `flowchart TB
  U[Learner / Instructor / Admin] --> WEB[Web App: React + TypeScript RTL]
  WEB --> API[Application API / Modular Monolith]
  API --> IAM[Identity & Authorization]
  API --> CAT[Catalog & Course Authoring]
  API --> LEARN[Enrollment / Progress / Assessment]
  API --> BILL[Billing & Refunds]
  API --> MEDIA[Media Entitlement Adapter]
  API --> AIT[AI Tutor Gateway]
  API --> AUDIT[Audit & Privacy Controls]
  CAT --> DB[(PostgreSQL)]
  LEARN --> DB
  BILL --> DB
  IAM --> DB
  AUDIT --> DB
  API --> OUTBOX[Transactional Outbox]
  OUTBOX --> Q[Managed Queue]
  Q --> WORKERS[Workers: email, reports, media events]
  MEDIA --> VIDEO[Video Provider / CDN]
  BILL --> PAY[Payment Provider]
  AIT --> RETRIEVE[Authorized Retrieval Index]
  RETRIEVE --> CONTENT[(Approved Course Content)]
  AIT --> MODEL[AI Model Provider Adapter]`
  },
  {
    id: 'diagram-payment',
    category: 'diagrams',
    title: 'مخطط تتابع الدفع والتحصين (Payment Sequence)',
    badge: 'MERMAID',
    description: 'تتابع طلب الدفع، مفتاح Idempotency، التحقق من التوقيع في الـ Webhook، وحماية الإيراد.',
    content: `sequenceDiagram
  participant L as Learner Browser
  participant A as Application API
  participant P as Payment Provider
  participant DB as PostgreSQL
  participant W as Webhook Handler
  L->>A: Create checkout + Idempotency-Key
  A->>DB: Validate server-side price; create pending payment
  A->>P: Create hosted checkout
  P-->>A: Checkout URL + provider reference
  A-->>L: Redirect URL (not proof of payment)
  P->>W: Signed payment event
  W->>W: Verify signature, timestamp, unique event ID
  W->>DB: Transaction: record event, update payment, create enrollment/outbox
  DB-->>W: Commit
  W-->>P: 2xx after durable processing
  L->>A: Refresh course access
  A->>DB: Read enrollment
  A-->>L: Access only if entitlement is active`
  }
];
