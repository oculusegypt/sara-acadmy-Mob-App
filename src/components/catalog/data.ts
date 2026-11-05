import { Course } from '../../shared/types';

export const INSTRUCTOR_SARA = {
  id: 'inst-sara-elarby',
  name: 'أ / سارة العربي',
  title: 'معلمة تأسيس أطفال (عربي ورياضة) ومدربة حساب ذهني معتمدة',
  bio: 'متخصصة في تأسيس الأطفال في القراءة واللغة العربية والحساب الذهني بالمنصورة. شعارنا: تأسيس أطفال . حساب ذهني 💡 وبطريقة ممتعة وسهلة للأطفال.',
  avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  phone: '010 28340042',
  whatsapp: '+201028340042',
  email: 'Saraelarby96@gmail.com',
  location: 'المنصورة، الدقهلية، مصر'
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-soroban-kids',
    slug: 'soroban-mental-math-for-kids',
    title: 'دبلوم الحساب الذهني وتنمية الذكاء للأطفال (Soroban & Mental Math)',
    summary: 'منهج تفاعلي شيق وممتع للأطفال لتعلم الحساب الذهني باستخدام العداد الصيني، ومضاعفة سرعة التركيز والتخيل وإجراء العمليات الحسابية بسرعة خارقة بدون آلة حاسبة.',
    languageCode: 'ar',
    level: 'beginner',
    category: 'الحساب الذهني وتنمية الذكاء',
    status: 'published',
    priceMinor: 2500, // 250 EGP
    currency: 'EGP',
    version: 2,
    rating: 4.98,
    reviewsCount: 184,
    durationHours: 12.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80',
    instructor: INSTRUCTOR_SARA,
    outcomes: [
      'التعرف على أجزاء العداد الصيني (السوروبان) وقيمة كل خرزة في الآحاد والعشرات',
      'إتقان عمليات الجمع والطرح المباشر بحركات الأصابع السريعة (السبابة والإبهام)',
      'تطبيق قواعد أصدقاء العدد 5 الصغار (Small Friends) باحتراف وسهولة',
      'تطبيق قواعد أصدقاء العدد 10 الكبار (Big Friends) في المسائل المركبة',
      'الحساب التخيلي (Anzan) بدون استخدام العداد الحقيقي وبسرعة مبهرة',
      'مضاعفة التركيز البصري والسمعي وسرعة البديهة وحب مادة الرياضيات'
    ],
    prerequisites: [
      'معرفة الطفل بالأرقام وقراءتها وكتابتها من 0 إلى 20',
      'حماس الطفل للتعلم باللعب والتجربة، وتوفير عداد صيني صغير للتدريب العملي'
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-10-25T14:30:00Z',
    publishedAt: '2026-01-15T10:00:00Z',
    sections: [
      {
        id: 'sec-soroban-1',
        courseId: 'course-soroban-kids',
        title: 'الوحدة الأولى: التعرف على العداد الصيني والجمع والطرح المباشر',
        position: 1,
        lessons: [
          {
            id: 'les-soroban-1-1',
            sectionId: 'sec-soroban-1',
            title: 'الدرس 1: رحلة في عالم العداد الصيني وقصة الخرزات السحرية',
            lessonKind: 'video',
            durationSeconds: 420,
            position: 1,
            isPreview: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            bodyMarkdown: `### مرحباً بكم يا أبطال مع مس سارة العربي 💡
            
العداد الصيني (السوروبان) هو أداة يابانية وصينية عبقرية تساعد عقل الطفل على تخيل الأرقام كأشكال ملموسة بدلاً من مجرد أرقام جافة!

#### مكونات العداد:
1. **الإطار الخارجي (Frame):** يحمي الخرزات.
2. **العارضة الفاصلة (Beam):** تفصل بين الخرزات العلوية والسفلية، وقراءة الأرقام تحدث فقط عندما تلمس الخرزة هذه العارضة.
3. **الخرزة العلوية (Upper Bead):** خرزة السماء وقيمتها = **5**.
4. **الخرزات الأربعة السفلية (Lower Beads):** خرزات الأرض وقيمة كل واحدة منها = **1**.
5. **نقطة البداية (Unit Dot):** عمود الآحاد.

> قاعدة مس سارة الذهبية: "تأسيس أطفال . حساب ذهني.. حرك الخرزات بحب وشوف النتيجة قدام عينيك!"`,
            transcript: [
              { id: 't1', timeSeconds: 0, speaker: 'أ/ سارة العربي', text: 'أهلاً بيكم يا أبطال في أول حصة من حصص الحساب الذهني الممتعة مع مس سارة!' },
              { id: 't2', timeSeconds: 25, speaker: 'أ/ سارة العربي', text: 'شايفين العداد الجميل ده؟ ده مش مجرد لعبة، ده مفتاح سحري هيخليك تحسب أسرع من الآلة الحاسبة!' },
              { id: 't3', timeSeconds: 80, speaker: 'أ/ سارة العربي', text: 'العارضة الفاصلة دي هي خط القراءة.. أي خرزة تلمسها بنحسبها على طول.' },
              { id: 't4', timeSeconds: 160, speaker: 'أ/ سارة العربي', text: 'الخرزة الفوقانية لوحدها بتساوي 5، والأربعة اللي تحت كل واحدة بـ 1.' },
              { id: 't5', timeSeconds: 280, speaker: 'أ/ سارة العربي', text: 'يلا نجرب نرفع خرزة واحدة بإصبع الإبهام.. كده بقى معانا 1! شطار يا عباقرة!' }
            ],
            resources: [
              { id: 'r1', title: 'ورقة عمل ملونة: التعرف على أجزاء العداد وتلوين الخرزات (PDF)', fileType: 'pdf', fileSize: '1.2 MB', url: '#' },
              { id: 'r2', title: 'دليل ولي الأمر لمتابعة تمارين العداد في المنزل', fileType: 'pdf', fileSize: '850 KB', url: '#' }
            ],
            quiz: {
              id: 'quiz-soroban-1',
              title: 'اختبار العباقرة الصغار: التعرف على العداد الصيني',
              passingScore: 80,
              questions: [
                {
                  id: 'q1',
                  prompt: 'كم تساوي الخرزة العلوية الواحدة (خرزة السماء) في عمود الآحاد؟',
                  options: ['1', '5', '10', '0'],
                  correctIndex: 1,
                  explanation: 'شاطر يا بطل! الخرزة العلوية في السوروبان تساوي دائماً 5.'
                },
                {
                  id: 'q2',
                  prompt: 'متى يتم احتساب قيمة الخرزة على العداد الصيني؟',
                  options: ['عندما تلمس العارضة الفاصلة', 'عندما تبتعد عن العارضة', 'عندما تسقط لأسفل الإطار', 'في أي وقت'],
                  correctIndex: 0,
                  explanation: 'ممتاز! لا تقرأ قيمة الخرزة إلا إذا لامست العارضة الفاصلة في المنتصف.'
                },
                {
                  id: 'q3',
                  prompt: 'أي إصبع نستخدمه لرفع الخرزات السفلية للأعلى في الجمع؟',
                  options: ['الخنصر', 'الإبهام', 'الوسطى', 'راحة اليد'],
                  correctIndex: 1,
                  explanation: 'برافو عليك! نستخدم إصبع الإبهام لرفع الخرزات السفلية لأعلى نحو العارضة.'
                }
              ]
            }
          },
          {
            id: 'les-soroban-1-2',
            sectionId: 'sec-soroban-1',
            title: 'الدرس 2: الجمع والطرح المباشر على عمود الآحاد',
            lessonKind: 'video',
            durationSeconds: 490,
            position: 2,
            isPreview: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            bodyMarkdown: `### الجمع والطرح المباشر (Direct Operations)

الجمع المباشر يعني أن الخرزات المطلوبة متاحة بالفعل ولا نحتاج لمساعدة أحد!

#### أمثلة تدريبية عملية:
- **1 + 2 = 3**: نرفع خرزة واحدة بالإبهام، ثم نرفع خرزتين إضافيتين.
- **3 + 1 = 4**: نرفع خرزة واحدة ليصبح المجموع 4.
- **4 - 2 = 2**: ننزل خرزتين بالسبابة بعيداً عن العارضة.
- **2 + 5 = 7**: ننزل الخرزة العلوية (5) بالسبابة لتلمس العارضة، مع الخرزتين السابقتين = 7.`,
            transcript: [
              { id: 't6', timeSeconds: 0, speaker: 'أ/ سارة العربي', text: 'أهلاً بكم يا شطار! في درس اليوم هنتعلم إزاي نجمع ونطرح مباشر في ثواني.' },
              { id: 't7', timeSeconds: 45, speaker: 'أ/ سارة العربي', text: 'الإبهام بيرفع لفوق في الجمع، والسبابة بتنزل لتحت في الطرح.. ركزوا في حركة إيدي.' },
              { id: 't8', timeSeconds: 140, speaker: 'أ/ سارة العربي', text: 'يلا مسألة سريعة: 1 زائد 1 زائد 2.. الإجمالي 4! برافو عليكم!' }
            ],
            resources: [
              { id: 'r3', title: 'كراسة تمارين: 50 مسألة جمع وطرح مباشر مع مس سارة', fileType: 'pdf', fileSize: '1.8 MB', url: '#' }
            ]
          }
        ]
      },
      {
        id: 'sec-soroban-2',
        courseId: 'course-soroban-kids',
        title: 'الوحدة الثانية: أصدقاء العدد 5 الصغار (Small Friends)',
        position: 2,
        lessons: [
          {
            id: 'les-soroban-2-1',
            sectionId: 'sec-soroban-2',
            title: 'الدرس 3: قصة أصدقاء العدد 5 وسر الخرزة الكبيرة (+1, +2, +3, +4)',
            lessonKind: 'video',
            durationSeconds: 540,
            position: 1,
            isPreview: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            bodyMarkdown: `### من هم أصدقاء العدد 5 الصغار؟
عندما نريد إضافة رقم ولا نجد خرزات سفلية كافية، نطلب مساعدة الصديق الكبير (الخرزة 5)!

#### أصدقاء العدد 5:
- صديق الـ 4 هو **1** (لأن 4 + 1 = 5)
- صديق الـ 3 هو **2** (لأن 3 + 2 = 5)
- صديق الـ 2 هو **3** (لأن 2 + 3 = 5)
- صديق الـ 1 هو **4** (لأن 1 + 4 = 5)

#### قاعدة الإضافة:
- لإضافة 4 = نزل الـ 5 واطرد الـ 1 (+5 - 1)
- لإضافة 3 = نزل الـ 5 واطرد الـ 2 (+5 - 2)
- لإضافة 2 = نزل الـ 5 واطرد الـ 3 (+5 - 3)
- لإضافة 1 = نزل الـ 5 واطرد الـ 4 (+5 - 4)`,
            transcript: [
              { id: 't9', timeSeconds: 0, speaker: 'أ/ سارة العربي', text: 'لو عندنا 4 خرزات وعايزين نضيف 1 كمان ومافيش مكان.. نعمل إيه؟' },
              { id: 't10', timeSeconds: 30, speaker: 'أ/ سارة العربي', text: 'بننادي على ماما الخمسة الكبيرة! ننزل الـ 5 ونطرد صديق الـ 1 اللي هو الـ 4!' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-arabic-foundations',
    slug: 'arabic-foundations-nour-al-bayan',
    title: 'تأسيس اللغة العربية والقرائية الممتعة للأطفال (نور البيان والفهم السريع)',
    summary: 'تأسيس شامل وممتع للأطفال في القراءة والكتابة ومخارج الحروف بنور البيان، بنعلم الطفل يتهجى ويفهم الكلمات بسهولة ومن غير تعقيد ولا حفظ أعمى 💡.',
    languageCode: 'ar',
    level: 'beginner',
    category: 'تأسيس اللغة العربية والقرائية',
    status: 'published',
    priceMinor: 2000,
    currency: 'EGP',
    version: 1,
    rating: 4.97,
    reviewsCount: 145,
    durationHours: 10.5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    instructor: INSTRUCTOR_SARA,
    outcomes: [
      'التعرف على أصوات الحروف الهجائية ومخارجها الصوتية الصحيحة بأشكالها المتعددة',
      'إتقان حركة الفتح السحرية وقراءة وكتابة الكلمات الثلاثية بالتهجي السريع',
      'إتقان حركتي الكسر والضم ودمج الأصوات بطلاقة تامة وبفهم المعنى',
      'التمييز البصري والسمعي بين الحركات القصيرة والمدود الطويلة (أ، و، ي)',
      'التحليل الصوتي للكلمات وتركيب المقاطع والتفريق بين الحروف المتشابهة'
    ],
    prerequisites: [
      'مناسب للأطفال من عمر 4 سنوات فما فوق',
      'لا يشترط معرفة مسبقة بالحروف'
    ],
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z',
    publishedAt: '2026-02-10T10:00:00Z',
    sections: [
      {
        id: 'sec-arabic-1',
        courseId: 'course-arabic-foundations',
        title: 'الوحدة الأولى: أصوات الحروف وحركة الفتح السحرية',
        position: 1,
        lessons: [
          {
            id: 'les-arabic-1-1',
            sectionId: 'sec-arabic-1',
            title: 'الدرس 1: حكاية حركة الفتح السحرية وقراءة أول كلمة',
            lessonKind: 'video',
            durationSeconds: 480,
            position: 1,
            isPreview: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            bodyMarkdown: `### حكاية حركة الفتح مع مس سارة العربي 💡

حركة الفتح هي شرطة مايلة صغيرة بتطير فوق الحرف، وأول ما تقف عليه بتخليه يفتح فمه ويبتسم ابتسامة جميلة!

- أَ : أَرنب سعيد 🐇
- بَ : بَطة جميلة 🦆
- تَ : تَمر لذيذ 🌴

#### كلمة اليوم بالفتح:
- كَـ + تَـ + بَ = **كَتَبَ**
- قَـ + رَ + أَ = **قَرَأَ**

> نصيحة مس سارة: "نطق صوت الحرف هو المفتاح.. اسمع الصوت صح وانطقه بابتسامة!"`,
            transcript: [
              { id: 'ta1', timeSeconds: 0, speaker: 'أ/ سارة العربي', text: 'السلام عليكم يا أبطال القراءة واللغة العربية مع مس سارة!' },
              { id: 'ta2', timeSeconds: 30, speaker: 'أ/ سارة العربي', text: 'النهارده معانا حركة الفتح السحرية.. بتخلي الحرف يفتح فمه ويقول: آآه!' },
              { id: 'ta3', timeSeconds: 90, speaker: 'أ/ سارة العربي', text: 'شوفوا كده: بَ.. تَ.. ثَ.. شطار يا حلوين!' }
            ],
            resources: [
              { id: 'ra1', title: 'كروت الحروف الملونة بحركة الفتح للتلوين والقص (PDF)', fileType: 'pdf', fileSize: '2.1 MB', url: '#' }
            ],
            quiz: {
              id: 'quiz-arabic-1',
              title: 'تحدي القراءة السريعة بالفتح مع مس سارة',
              passingScore: 80,
              questions: [
                {
                  id: 'qa1',
                  prompt: 'أين توضع حركة الفتح؟',
                  options: ['فوق الحرف', 'تحت الحرف', 'داخل الحرف', 'بعد الكلمة'],
                  correctIndex: 0,
                  explanation: 'برافو! الفتحة شرطة مائلة صغيرة تطير دائماً فوق الحرف.'
                },
                {
                  id: 'qa2',
                  prompt: 'ما هي الكلمة الناتجة عن دمج أصوات: ذَ + هَ + بَ ؟',
                  options: ['ذَهَبَ', 'شَرِبَ', 'لَعِبَ', 'كَتَبَ'],
                  correctIndex: 0,
                  explanation: 'شاطر جداً! ذَ + هَ + بَ = ذَهَبَ.'
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'course-smart-math',
    slug: 'smart-math-kids-foundations',
    title: 'تأسيس الرياضيات الذكية والممتعة للأطفال (Smart Math)',
    summary: 'منهج شيق لتأسيس مفاهيم الحساب والقيمة المكانية والأنماط الهندسية، مع ألعاب وتحديات تركز على الفهم والاستنتاج وليس الحفظ الأعمى للقوانين 💡.',
    languageCode: 'ar',
    level: 'beginner',
    category: 'الرياضيات الذكية والتفكير المنطقي',
    status: 'published',
    priceMinor: 2200,
    currency: 'EGP',
    version: 1,
    rating: 4.96,
    reviewsCount: 92,
    durationHours: 8.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?auto=format&fit=crop&w=1200&q=80',
    instructor: INSTRUCTOR_SARA,
    outcomes: [
      'فهم القيمة المكانية للأعداد (بيت الآحاد وبيت العشرات) من خلال قصص ممتعة',
      'استراتيجيات الجمع والطرح الذهني ومكونات العدد 10 بدون العد على الأصابع',
      'حل المسائل الكلامية الحياتية بتحليل خطواتها بالفهم والتطبيق الواقعي',
      'اكتشاف الأنماط والتسلسلات وتنمية مهارات التفكير الناقد وحل المشكلات'
    ],
    prerequisites: ['مناسب لسن 5 إلى 9 سنوات'],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    publishedAt: '2026-02-20T10:00:00Z',
    sections: [
      {
        id: 'sec-math-1',
        courseId: 'course-smart-math',
        title: 'الوحدة الأولى: بيت الآحاد وبيت العشرات ومكونات الأعداد',
        position: 1,
        lessons: [
          {
            id: 'les-math-1-1',
            sectionId: 'sec-math-1',
            title: 'الدرس 1: قصة بيت الآحاد الصغير وقصر العشرات الفخم',
            lessonKind: 'video',
            durationSeconds: 380,
            position: 1,
            isPreview: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            bodyMarkdown: `### قصة القيمة المكانية مع مس سارة 💡

- **بيت الآحاد:** بيت طيب وبسيط، كل رقم يدخل جواه يخرج بنفس قيمته! الـ 3 تخرج 3 والـ 7 تخرج 7.
- **قصر العشرات:** قصر غني وكريم جداً، أي رقم يدخل جواه يديله صفر هدية! الـ 3 تصبح 30 والـ 5 تصبح 50.`,
            transcript: [
              { id: 'tm1', timeSeconds: 0, speaker: 'أ/ سارة العربي', text: 'أهلاً بكم يا شطار! النهارده هنزور بيتين مشهورين أوي في عالم الرياضيات.' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-tot-trainers',
    slug: 'tot-certified-mental-math-trainer',
    title: 'دبلوم تدريب وإعداد مدربي الحساب الذهني المعتمدين (TOT للأمهات والمعلمات)',
    summary: 'برنامج تدريب مدربين احترافي معتمد من برنامج العباقرة الصغار، لإعداد معلمات وأمهات محترفات في تدريس الحساب الذهني والسوروبان للأطفال بأساليب تعليمية نشطة وجذابة.',
    languageCode: 'ar',
    level: 'intermediate',
    category: 'إعداد وتأهيل المدربين - العباقرة الصغار',
    status: 'published',
    priceMinor: 4500,
    currency: 'EGP',
    version: 1,
    rating: 5.0,
    reviewsCount: 78,
    durationHours: 15.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    instructor: INSTRUCTOR_SARA,
    outcomes: [
      'إتقان تدريس جميع مستويات السوروبان (المباشر، أصدقاء 5، أصدقاء 10، الميكس، الضرب والقسمة)',
      'سيكولوجية تعليم الأطفال واستراتيجيات جذب الانتباه والتغلب على التشتت وصعوبات التعلم',
      'تصميم أنشطة اللعب الحركي والمسابقات التنافسية الإيجابية داخل قاعة التدريس',
      'إدارة حصة الحساب الذهني والتواصل الفعال مع أولياء الأمور لمتابعة التطور المنزلي',
      'الحصول على شهادة مدرب معتمد تؤهل لفتح فصول وأكاديميات حساب ذهني متخصصة'
    ],
    prerequisites: ['متاح للمعلمات، الأخصائيات، والأمهات الراغبات في احتراف تدريب الأطفال'],
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-10-22T10:00:00Z',
    publishedAt: '2026-03-10T10:00:00Z',
    sections: [
      {
        id: 'sec-tot-1',
        courseId: 'course-tot-trainers',
        title: 'الوحدة الأولى: منهجية برنامج العباقرة الصغار وسيكولوجية تدريب الأطفال',
        position: 1,
        lessons: [
          {
            id: 'les-tot-1-1',
            sectionId: 'sec-tot-1',
            title: 'الدرس 1: أسرار تدريب الأطفال وتحويل الرياضيات إلى متعة وشغف',
            lessonKind: 'video',
            durationSeconds: 610,
            position: 1,
            isPreview: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
            bodyMarkdown: `### فلسفة التدريب مع المدربة سارة العربي 💡

الطفل يتعلم بما يلمسه ويراه ويعيشه كشغف! في برنامج العباقرة الصغار:
1. لا نطلب من الطفل حفظ القوانين، بل نجعله يكتشف حركتها على العداد.
2. نستخدم التحفيز الإيجابي المستمر وجداول الإنجاز اليومية.
3. دمج الحساب التخيلي من الأسبوع الثاني لبناء الثقة والسرعة.`,
            transcript: [
              { id: 'tt1', timeSeconds: 0, speaker: 'أ/ سارة العربي', text: 'أهلاً بكم زميلاتي وأمهاتنا الفضليات في دبلوم إعداد مدربي الحساب الذهني.' }
            ]
          }
        ]
      }
    ]
  }
];
