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

export const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'book-mental-math-1',
    title: 'سلسلة العباقرة: الحساب الذهني وتدريبات العداد الصيني (المستوى الأول)',
    author: 'أ / سارة العربي',
    category: 'الحساب الذهني والسروبان',
    pagesCount: 96,
    coverUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
    description: 'كتاب تدريبي شامل للأطفال لتعلم أساسيات العداد الصيني (السوروبان)، والجمع والطرح البسيط بالخرزات، وتنمية التخيل وسرعة البديهة والتركيز.',
    downloadUrl: '#',
    publishedYear: 2026,
    chapters: [
      { number: 1, title: 'التعرف على أجزاء العداد وتصفيره', pages: '1-18' },
      { number: 2, title: 'تمثيل الأعداد من 1 إلى 9 وقواعد تحريك الخرزات', pages: '19-42' },
      { number: 3, title: 'الجمع والطرح البسيط بدون أصدقاء', pages: '43-70' },
      { number: 4, title: 'التخيل الذهني بدون استخدام العداد وتحديات السرعة', pages: '71-96' }
    ]
  },
  {
    id: 'book-arabic-foundation',
    title: 'تأسيس القراءة العربية الممتعة: من الحرف إلى الطلاقة',
    author: 'أ / سارة العربي',
    category: 'تأسيس لغة عربية وقراءة',
    pagesCount: 120,
    coverUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    description: 'منهج تأسيسي مرح يعتمد على الفهم والأصوات بدلاً من الحفظ الجاف، يغطي مخارج الحروف، الحركات القصيرة والطويلة، والمدود والتنوين بأسلوب قصصي محبب للأطفال.',
    downloadUrl: '#',
    publishedYear: 2026,
    chapters: [
      { number: 1, title: 'أصوات الحروف وأشكالها في أول ووسط وآخر الكلمة', pages: '1-30' },
      { number: 2, title: 'حكاية الحركات القصيرة: الفتحة والكسرة والضمة', pages: '31-62' },
      { number: 3, title: 'عائلة المدود: مد بالألف والواو والياء', pages: '63-95' },
      { number: 4, title: 'قصص القراءة التفاعلية للأطفال والتعبير الذاتي', pages: '96-120' }
    ]
  },
  {
    id: 'book-kids-math',
    title: 'رياضيات الفهم الذكي للأطفال: ألعاب ومهارات الأرقام والمنطق',
    author: 'أ / سارة العربي',
    category: 'تأسيس رياضيات',
    pagesCount: 88,
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    description: 'تمارين وألعاب تفاعلية لتبسيط مفاهيم الأرقام، المقارنات، الجمع والطرح الذهني، وتفكيك المسائل اللفظية بطريقة بصرية ذكية.',
    downloadUrl: '#',
    publishedYear: 2026,
    chapters: [
      { number: 1, title: 'القيمة المكانية والعد القفزي بطرق ممتعة', pages: '1-24' },
      { number: 2, title: 'ألعاب الجمع الذكي ومكونات الأعداد حتى 10 و20', pages: '25-50' },
      { number: 3, title: 'حل المسائل الكلامية التخيلية بالرسم والقصص', pages: '51-72' },
      { number: 4, title: 'الأشكال الهندسية والأنماط التفكيرية', pages: '73-88' }
    ]
  },
  {
    id: 'book-tot-trainer',
    title: 'دليل مدرب الحساب الذهني والتأسيس المعتمد (برنامج العباقرة الصغار)',
    author: 'أ / سارة العربي (مدربة معتمدة)',
    category: 'إعداد المعلمات والأمهات (TOT)',
    pagesCount: 150,
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    description: 'دليل شامل وموجه للمعلمات وأولياء الأمور لتطبيق استراتيجيات تدريس الحساب الذهني، وتصميم بيئات تعلم محفزة للأطفال تركز على الفهم والتفكير الإبداعي.',
    downloadUrl: '#',
    publishedYear: 2026,
    chapters: [
      { number: 1, title: 'علم نفس الطفل وأساليب التدريس النشط', pages: '1-38' },
      { number: 2, title: 'منهجية تدريب العداد الصيني خطوة بخطوة', pages: '39-85' },
      { number: 3, title: 'إدارة الفصول الافتراضية وحصص البث المباشر الممتعة', pages: '86-120' },
      { number: 4, title: 'بناء خطط التعلم ومتابعة تقدم الطالب التراكمي', pages: '121-150' }
    ]
  }
];
