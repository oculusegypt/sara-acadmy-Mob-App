/**
 * server/routes/ai.ts — المرشد التعليمي: Gemini حي فعلياً مع fallback معلن صراحة
 * (لا يوجد نص محاكى يُقدَّم كتجاوب ذكاء اصطناعي — المصدر مذكور في كل رد)
 */
import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../config.js';

export const aiRouter = Router();

// قائمة نماذج Gemini حقيقية بالترتيب — يُجرَّب كل نموذج فعلياً لدى عدم توفر السابق
const TUTOR_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

/** قاعدة مفاهيم إرشادية فعلية (وضع عدم الاتصال — معلنة المصدر بوضوح) */
function buildConceptKnowledgeBase() {
  return [
    {
      keywords: ['outbox', 'كتابة مزدوجة', 'dual write', 'الصحف'],
      body: `نمط Transactional Outbox يحل مشكلة الكتابة المزدوجة: بدلاً من الحفظ في قاعدة البيانات THEN إرسال رسالة لنظام آخر (وقد ينقطع الاتصال بينهما)،
يحفظ النظام الحدثَ ورسالةَ الإشعار معاً في جدول outbox داخل نفس المعاملة الذرية. ثم قارئ خلفي (Poller/CDC) يبعث الرسائل بشكل مضمون التسليم مع إعادة المحاولة.
تأمل: أين تضع قيد التفريد لمنع إرسال الرسالة مرتين؟`
    },
    {
      keywords: ['idempotency', 'التحصين', 'تحصين', 'تكرار', 'ازدواج'],
      body: `التحصين ضد التكرار: كل طلب دفع يحمل Idempotency-Key فريداً. الخادم يخزن المفتاح بقيد UNIQUE؛ الطلب الأول ينفَّذ، وأي إعادة لنفس المفتاح
تعيد نفس النتيجة دون تنفيذ جديد — حتى لو تكررت النقرات أو أعادت الشبكة الإرسال. جرّب عملياً: اضغط زر الدفع مرتين بنفس المفتاح في بوابة مدار وراقب سجل التدقيق.`
    },
    {
      keywords: ['cdn', 'التوزيع', 'تسليم المحتوى', 'الحافة'],
      body: `شبكات تسليم المحتوى تخزّن نسخاً مؤقتة على حواف قريبة من المستخدم. أسئلة للتأمل: ما سياسة الإبطال (Invalidation) المناسبة لدروسك المسعّرة؟
وكيف تمنع تسرب الروابط عبر Tokens موقعة قصيرة العمر (موجودة فعلاً في /api/lessons/:id/playback-token)؟`
    },
    {
      keywords: ['تشفير', 'hmac', 'التوقيع', 'أمان', 'signature'],
      body: `HMAC يقارن بين توقيعٍ محسوب بمفتاح سري مشترك؛ أي تعديل على الحمولة يكسر التطابق. في مدار تُوقَّع تذاكر الغرف وقيود الدفع بـ HMAC-SHA256
ويُتحقق منها بـ timingSafeEqual لمنع هجمات التوقيت. تأمل: لماذا نضع تاريخ انتهاء الصلاحية داخل الحمولة الموقعة نفسها؟`
    },
  ];
}

aiRouter.post('/tutor/messages', async (req, res) => {
  const { lessonTitle, message, contextText } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'رسالة السؤال مطلوبة.' });
  }

  const systemPrompt = `أنت "مرشد مدار الذكي"، مساعد تعليمي متمرس يشرح المفاهيم العلمية والهندسية بأسلوب تربوي مشجع، مبسط، وواضح.
مهمتك:
1. شرح المفاهيم بأسلوب سهل وسلس، واستخدام أمثلة واقعية.
2. توجيه الطالب بالتفكير والتلميح وتوضيح الخطوات المنطقية.
3. التحدث باللغة العربية الفصحى الودودة والواضحة.

سياق مادة الدرس:
"""
${contextText || lessonTitle || 'شرح معمارية البرمجيات والنظم السحابية والذكاء الاصطناعي.'}
"""`;

  try {
    if (GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      let lastErr: any = null;
      for (const modelName of TUTOR_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            config: { systemInstruction: systemPrompt },
            contents: `سؤال المتعلم: ${message}`,
          });
          const text = (typeof (response as any).text === "string" ? (response as any).text : String((response as any).text ?? "")).trim();
          if (text && String(text).trim().length > 0) {
            return res.json({
              reply: String(text),
              model: modelName,
              source: 'gemini-live',
              timestamp: new Date().toISOString(),
            });
          }
        } catch (e: any) {
          lastErr = e;
          console.warn(`Gemini model ${modelName} failed:`, String(e?.message || e).slice(0, 160));
        }
      }
      // فشل كل النماذج: رد صريح بالخطأ الحقيقي — لا نص محاكى
      return res.status(502).json({
        error: 'AI_UPSTREAM_FAILED',
        message: 'تعذر الوصول لخدمة Gemini الذكية حالياً. حاول مجدداً بعد قليل أو راجع المفتاح GEMINI_API_KEY.',
        detail: String(lastErr?.message || lastErr || '').slice(0, 200),
      });
    }

    // لا يوجد مفتاح API: وضع إرشادي حقيقي مبني على استرجاع فعلي من مكتبة المفاهيم
    const kb = buildConceptKnowledgeBase();
    const q = String(message).toLowerCase();
    const hit = kb.find(k => k.keywords.some(w => q.includes(w)));
    const reply = hit
      ? `${hit.body}\n\n[مصدر إرشادي: مكتبة مفاهيم «${lessonTitle || 'الوحدة الحالية'}» المعتمدة — وضع عدم الاتصال بنموذج Gemini]`
      : `مرحباً! خدمة الذكاء الاصطناعي (Gemini) غير مفعّلة على هذا الخادم لأن المفتاح GEMINI_API_KEY غير مضبوط، لذلك يعمل المرشد الآن بقاعدة مفاهيم معتمدة فقط.\nسؤالك عن «${lessonTitle || 'الدرس الحالي'}» لم يجد تطابقاً في القاعدة الإرشادية — أعد صياغة سؤالك بكلمة مفتاحية مثل: outbox، التحصين، التشفير، CDN، أو اضبط المفتاح وأعد تشغيل الخادم.`;

    return res.json({ reply, source: 'offline-kb', timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({
      error: 'TUTOR_ERROR',
      message: 'حدث خطأ غير متوقع في خدمة المرشد.',
      detail: String(error?.message || error).slice(0, 200),
    });
  }
});
