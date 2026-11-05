import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Lightbulb, 
  HelpCircle, 
  Smile, 
  Brain, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { askSocraticTutor } from '../../services/geminiTutor';
import { TutorMessage } from '../../shared/types';

interface SocraticAssistantProps {
  lessonTitle: string;
  courseTitle: string;
  studentName?: string;
  contextText?: string;
  className?: string;
}

export const SocraticAssistant: React.FC<SocraticAssistantProps> = ({
  lessonTitle,
  courseTitle,
  studentName = 'صديقي الصغير',
  contextText,
  className = '',
}) => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `أهلاً بك يا ${studentName}! 🌟
أنا المساعد الذكي لمس سارة العربي 💡
هنا بنتعلم سوا بطريقة ممتعة: "تأسيس أطفال . حساب ذهني"! 
لو في حاجة مش فاهمها في درس "${lessonTitle}" اسألني، وهفكر معاك ونديك تلميحات حلوة توصلك للحل بنفسك! 🧠✨`,
      timestamp: 'الآن'
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Quick Socratic thought-starter prompts
  const quickPrompts = [
    '💡 ساعدني أفهم الفكرة ببساطة',
    '🧮 وريني تلميح للحل',
    '🎯 اديني لغز أو سؤال يختبر فهمي',
    '⭐ إزاي أتدرب عليها بسرعة؟'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || loading) return;

    const userMsg: TutorMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // Socratic instructions emphasizing Sarah El-Araby's motto: "الفهم مش الحفظ"
      const res = await askSocraticTutor({
        courseId: 'sarah-platform',
        lessonId: 'lesson-active',
        lessonTitle,
        message: query.trim(),
        contextText: `أنت المساعد التعليمي السقراطي للأستاذة سارة العربي (معلمة تأسيس أطفال عربي وحساب ذهني بالمنصورة).
شعار المنصة: "تأسيس أطفال . حساب ذهني 💡".
طريقة الرد:
1. أسلوب سقراطي ودود، مشجع، مليء بالإيجابية والرموز التعبيرية المناسبة للأطفال والأمهات.
2. لا تعطِ الإجابة المباشرة الجاهزة، بل اطرح سؤالاً موجهاً أو تلميحاً ذكياً يدفع الطفل للتفكير والوصول للحل بنفسه.
3. إذا كان السؤال عن الحساب الذهني أو العداد الصيني، وضح حركة الخرزات وتخيل العداد.
4. إذا كان السؤال عن الحروف أو القراءة، وضح صوت الحرف وحركته بالفتح أو الضم أو الكسر بمثال بسيط.
محتوى الدرس: ${contextText || lessonTitle}`
      });

      const tutorReply: TutorMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, tutorReply]);
    } catch {
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'يا بطل، حصل تأخير بسيط في الاتصال. جرب تسألني تاني وأنا معاك خطوة بخطوة! 💡',
        timestamp: 'الآن'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col overflow-hidden ${className || 'h-[560px]'}`}>
      
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-[var(--ink)] font-black shadow-md shadow-amber-500/20">
            💡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-[var(--ink)]">المساعد الذكي مع مس سارة</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                تأسيس أطفال . حساب ذهني
              </span>
            </div>
            <p className="text-[11px] text-[var(--ink-soft)]">توجيه سقراطي وتلميحات ذكية للأطفال • Gemini AI</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
          title="بدء محادثة جديدة"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-500 text-[var(--ink)] font-bold rounded-br-none'
                  : 'bg-[var(--bg-inset)] border border-[var(--line)] text-[var(--ink)] rounded-bl-none shadow-md'
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
            <span className="text-[10px] text-[var(--ink-faint)] mt-1 px-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-[var(--bg-inset)] p-3 rounded-2xl border border-[var(--line)] animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>مس سارة بتفكر في سؤال وتلميح ذكي يوصلك للحل... 💡</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Chips */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink-soft)] hover:text-[var(--ink)] whitespace-nowrap border border-slate-700/80 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اسأل مس سارة عن تلميح أو مسألة..."
            className="flex-1 bg-[var(--bg-inset)] border border-[var(--line-strong)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-[var(--ink)] font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
