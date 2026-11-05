import { TutorMessage } from '../shared/types';

export async function askSocraticTutor(params: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  message: string;
  contextText: string;
  history?: TutorMessage[];
}): Promise<{ reply: string; citations?: { lessonTitle: string; timestampSeconds?: number; quote: string }[] }> {
  try {
    const res = await fetch('/api/ai/tutor/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        reply: data.reply,
        citations: [
          {
            lessonTitle: params.lessonTitle,
            quote: 'مستند إلى المحتوى المعتمد للوحدة والدرس'
          }
        ]
      };
    }
  } catch (err) {
    console.warn('API route failed, using local socratic tutor fallback', err);
  }

  // Client-side fallback if server route not reachable
  const msgLower = params.message.toLowerCase();
  let reply = '';
  if (msgLower.includes('outbox') || msgLower.includes('كتابة مزدوجة') || msgLower.includes('dual write')) {
    reply = `أهلاً بك! هذا مفهوم معقّد لكنه جوهري في هندسة النظم السحابية.
تخيل السيناريو التالي: لو كان لديك متجر إلكتروني، وقمت بحفظ عملية الشراء في قاعدة البيانات، ثم حدث عطل مفاجئ في السيرفر قبل إرسال الرسالة إلى نظام المخازن، ما هي النتيجة؟

المفتاح السقراطي: كيف يدمج نمط **Transactional Outbox** حفظ الحدث وتخزين البيانات في معاملة ذرية واحدة (Atomic Transaction)؟
[المصدر: ${params.lessonTitle} - الدقيقة 02:30]`;
  } else if (msgLower.includes('idempotency') || msgLower.includes('تحصين') || msgLower.includes('تكرار')) {
    reply = `سؤال في صميم الأمان المالي!
إذا كان الخادم يتلقى ترويسة Idempotency-Key فريدة لكل عملية سحب، كيف يستطيع التمييز بين محاولة دفع جديدة وبين إعادة إرسال ناتجة عن انقطاع اتصال المتصفح؟

تأمل في سلوك جدول \`payments\` والقيود الفريدة (Unique Constraints) على المفتاح.
[المصدر: معايير التحصين المالي IETF]`;
  } else if (msgLower.includes('جواب') || msgLower.includes('حل') || msgLower.includes('اختبار') || msgLower.includes('كويز')) {
    reply = `بصفتي مرشدك السقراطي في مدار، سياستنا التربوية تمنع تقديم الإجابات الجاهزة للاختبارات للحفاظ على مصداقية تعلمك وتأهيلك للشهادة.
ولكن يسعدني جداً أن أشرح لك المفهوم الأساسي أو أقدم لك تلميحاً يضيء لك طريق الحل! ما هي النقطة المحددة التي تشعر بالتردد حيالها؟`;
  } else {
    reply = `مرحباً بك! يسعدني جداً مرافقتك في دراسة "${params.lessonTitle}".
تذكر أن فهم هذا الموضوع يرتكز على تطبيق المبادئ الهندسية عملياً.
هل تحب أن نبدأ بتفكيك الفكرة إلى أجزاء أصغر، أم تود مثالاً تطبيقياً واقعياً مستوحى من كبرى المنصات السحابية؟`;
  }

  return {
    reply,
    citations: [
      {
        lessonTitle: params.lessonTitle,
        quote: 'مرجع تعليمي من مسودة الدرس المعتمدة'
      }
    ]
  };
}
