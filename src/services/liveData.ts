import { LiveSession, Assignment, StudentSubmission } from '../shared/types';

export const INITIAL_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live-session-1',
    courseId: 'course-soroban-kids',
    courseTitle: 'دبلوم الحساب الذهني وتنمية الذكاء للأطفال',
    instructorId: 'inst-sara-elarby',
    instructorName: 'أ / سارة العربي',
    title: 'حصة العداد الصيني المباشرة: تدريب تفاعلي على أصدقاء العدد 5 ومشاركة الشاشة',
    description: 'بث مباشر تفاعلي مع مس سارة العربي: مشاركة شاشة العداد التفاعلي، حل مسائل جماعية، ورسم الحركات على السبورة البيضاء.',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(), // Live / upcoming right now
    durationMinutes: 60,
    status: 'live',
    attendeesCount: 28,
    meetingCode: 'SARA-SOROBAN-LIVE'
  },
  {
    id: 'live-session-2',
    courseId: 'course-arabic-foundations',
    courseTitle: 'تأسيس اللغة العربية والقرائية الممتعة للأطفال',
    instructorId: 'inst-sara-elarby',
    instructorName: 'أ / سارة العربي',
    title: 'ورشة القراءة الصوتية للأمهات والمعلمات: كيف نعلّم الطفل التحليل الصوتي بالفهم',
    description: 'جلسة تدريبية مباشرة مع مس سارة تركز على مخارج الحروف، التمييز بين المدود والحركات، ودمج المقاطع الصوتية بدون تشتت.',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    durationMinutes: 75,
    status: 'upcoming',
    attendeesCount: 45,
    meetingCode: 'SARA-NOUR-BAYAN'
  },
  {
    id: 'live-session-3',
    courseId: 'course-tot-trainers',
    courseTitle: 'دبلوم تدريب وإعداد مدربي الحساب الذهني المعتمدين (TOT)',
    instructorId: 'inst-sara-elarby',
    instructorName: 'أ / سارة العربي',
    title: 'لقاء مدربي العباقرة الصغار: استراتيجيات تحفيز الطفل وتصميم أنشطة الحصة',
    description: 'مناقشة حية لخطط التدريب، حل مشكلات تشتت انتباه الأطفال، ومحاكاة عملية لشرح قواعد الـ Big Friends.',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    durationMinutes: 90,
    status: 'upcoming',
    attendeesCount: 36,
    meetingCode: 'SARA-TOT-GENIUS'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-soroban-practice',
    courseId: 'course-soroban-kids',
    courseTitle: 'دبلوم الحساب الذهني وتنمية الذكاء للأطفال',
    title: 'تحدي العباقرة الصغار: حل 20 مسألة على العداد الصيني مع تسجيل فيديو دقيقة',
    description: 'يقوم البطل بحل ورقة التمارين المرفقة باستخدام العداد الصيني (أو الحساب التخيلي)، مع كتابة النواتج وتصوير مقطع فيديو قصير لحركة الأصابع.',
    rubric: [
      'استخدام الإبهام والسبابة بالحركة الصحيحة (30 درجة)',
      'صحة النواتج الرياضية (40 درجة)',
      'السرعة والثقة أثناء التحريك (30 درجة)'
    ],
    dueDate: '2026-11-10T23:59:59Z',
    maxScore: 100
  },
  {
    id: 'asg-arabic-analysis',
    courseId: 'course-arabic-foundations',
    courseTitle: 'تأسيس اللغة العربية والقرائية الممتعة للأطفال',
    title: 'واجب التحليل الصوتي: تحليل 10 كلمات إلى مقاطع صوتية بالفتح والكسر',
    description: 'قراءة الكلمات بصوت واضح، ثم تفكيك كل كلمة إلى مقاطعها الصوتية وفق قواعد نور البيان وتوضيح المد والممدود.',
    rubric: [
      'التهجي الصحيح ومخارج الأصوات (40 درجة)',
      'التحليل الصوتي للمقاطع (40 درجة)',
      'جمال ونظافة خط الكتابة (20 درجة)'
    ],
    dueDate: '2026-11-15T23:59:59Z',
    maxScore: 100
  }
];

export const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-01',
    assignmentId: 'asg-soroban-practice',
    assignmentTitle: 'تحدي العباقرة الصغار: حل 20 مسألة على العداد الصيني',
    studentId: 'usr-student-1',
    studentName: 'ياسين أحمد (بطل العباقرة)',
    submittedAt: '2026-10-28T18:30:00Z',
    textSubmission: 'حليت كل المسائل يا مس سارة بالعداد الصيني وبالتخيل الذهني، وطلعت النواتج في 3 دقائق بس! شكراً ليكي يا أحسن معلمة 🌟💡',
    repoUrl: 'https://wa.me/201028340042',
    grade: 98,
    maxScore: 100,
    feedback: 'ما شاء الله عليك يا ياسين يا بطل! حركة أصابعك سريعة ودقيقة جداً، وتخيلك للخرزات رائع.. استمر في التدريب اليومي 💡👏',
    status: 'graded'
  }
];
