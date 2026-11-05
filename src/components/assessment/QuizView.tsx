import React, { useState } from 'react';
import { QuizData, Course, Lesson } from '../../shared/types';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Lightbulb, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { recordAudit } from '../../services/api';

interface QuizViewProps {
  quiz: QuizData;
  course: Course;
  lesson: Lesson;
  userId: string;
  userName: string;
  onPassQuiz: (scorePercent: number) => void;
  onBackToLesson: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quiz,
  course,
  lesson,
  userId,
  userName,
  onPassQuiz,
  onBackToLesson,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scorePercentage, setScorePercentage] = useState<number>(0);

  const currentQ = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleSelectOption = (qId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    quiz.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / totalQuestions) * 100);
    setScorePercentage(percent);
    setIsSubmitted(true);

    await recordAudit({
      actorUserId: userId,
      actorName: userName,
      action: 'QUIZ_SUBMITTED',
      resourceType: 'quiz',
      resourceId: quiz.id,
      reason: `تسليم اختبار: ${quiz.title} بنتيجة ${percent}%`,
      correlationId: 'quiz-' + Date.now(),
      safeMetadata: { percent, passingScore: quiz.passingScorePercent || quiz.passingScore || 80, correctCount, totalQuestions }
    });

    const passThreshold = quiz.passingScorePercent ?? quiz.passingScore ?? 80;
    if (percent >= passThreshold) {
      onPassQuiz(percent);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setShowHint(false);
  };

  const passThreshold = quiz.passingScorePercent ?? quiz.passingScore ?? 80;
  const isPassed = isSubmitted && scorePercentage >= passThreshold;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--line)] p-4 rounded-2xl">
        <button
          onClick={onBackToLesson}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى الدرس</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)]">
          <span className="flex items-center gap-1 bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>المدة المقترحة: {quiz.timeLimitMinutes} دقيقة</span>
          </span>
          <span className="font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
            درجة النجاح: {quiz.passingScorePercent}%
          </span>
        </div>
      </div>

      {/* Main Quiz Box */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Quiz Title & Progress */}
        <div className="space-y-2 border-b border-[var(--line)] pb-4">
          <div className="text-xs font-semibold text-cyan-400">{course.title}</div>
          <h2 className="text-xl font-bold text-[var(--ink)]">{quiz.title}</h2>
          
          {!isSubmitted && (
            <div className="flex items-center justify-between pt-2 text-xs text-[var(--ink-soft)]">
              <span>السؤال {currentQuestionIndex + 1} من {totalQuestions}</span>
              <div className="w-48 h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* If Not Submitted: Question Stepper */}
        {!isSubmitted ? (
          <div className="space-y-6">
            
            {/* Question Text */}
            <div className="text-base font-bold text-[var(--ink)] leading-relaxed">
              {currentQ.question}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full text-right p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500 text-[var(--ink)] shadow-sm shadow-cyan-500/10'
                        : 'bg-[var(--bg-elevated)]/60 border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono ${
                        isSelected ? 'border-cyan-400 bg-cyan-400 text-[var(--ink)] font-bold' : 'border-slate-600'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span>{option}</span>
                    </div>

                    <div className={`w-3.5 h-3.5 rounded-full border ${isSelected ? 'bg-cyan-400 border-cyan-400' : 'border-slate-600'}`} />
                  </button>
                );
              })}
            </div>

            {/* Socratic Hint Section */}
            {currentQ.hint && (
              <div className="pt-2">
                {showHint ? (
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-indigo-300 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">تلميح سقراطي: </span>
                      <span>{currentQ.hint}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>أحتاج تلميحاً مفاهيمياً</span>
                  </button>
                )}
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-[var(--line)]">
              <button
                onClick={() => {
                  setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
                  setShowHint(false);
                }}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] disabled:opacity-40 text-[var(--ink-soft)] text-xs font-semibold transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < totalQuestions}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[var(--ink)] text-xs font-bold transition-all shadow-lg shadow-cyan-500/25"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>تصحيح وتسليم الاختبار</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1));
                    setShowHint(false);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-colors"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        ) : (
          /* Submitted State: Detailed Review */
          <div className="space-y-6">
            
            {/* Score Banner */}
            <div className={`p-6 rounded-2xl border text-center space-y-3 ${
              isPassed 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}>
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-[var(--bg-elevated)]/80 border border-current">
                {isPassed ? (
                  <Award className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
              </div>

              <h3 className="text-xl font-bold text-[var(--ink)]">
                {isPassed ? 'تهانينا! لقد اجتزت الاختبار بنجاح' : 'لم تجتز درجة النجاح المطلوبة'}
              </h3>

              <div className="text-3xl font-black font-mono">
                {scorePercentage}%
              </div>

              <p className="text-xs max-w-md mx-auto text-[var(--ink-soft)] leading-relaxed">
                {isPassed
                  ? `أحسنت! نلت نسبة أعلى من الحد الأدنى (${quiz.passingScorePercent}%). تم توثيق إنجازك في سجل التدقيق وأصبحت مؤهلاً لإصدار شهادة مدار المعتمدة.`
                  : `الحد الأدنى للنجاح هو ${quiz.passingScorePercent}%. يمكنك مراجعة الأسئلة وتفسيراتها أدناه ثم إعادة المحاولة.`
                }
              </p>
            </div>

            {/* Question by Question Review */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[var(--ink)]">مراجعة الإجابات والتفسيرات المعمارية:</h4>
              {quiz.questions.map((q, idx) => {
                const userChoice = selectedAnswers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-3 ${
                      isCorrect 
                        ? 'bg-[var(--bg-elevated)]/60 border-emerald-500/30'
                        : 'bg-[var(--bg-elevated)]/60 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-[var(--ink)] flex items-start gap-2">
                        <span className="font-mono text-cyan-400">س{idx + 1}:</span>
                        <span>{q.question}</span>
                      </div>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 shrink-0">
                          <CheckCircle className="w-4 h-4" />
                          صحيحة
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 shrink-0">
                          <XCircle className="w-4 h-4" />
                          خاطئة
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-[var(--ink-soft)] bg-[var(--bg-elevated)]/60 p-3 rounded-lg">
                      <div>
                        <span className="text-[var(--ink-soft)]">إجابتك: </span>
                        <span className={isCorrect ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                          {userChoice !== undefined ? q.options[userChoice] : 'لم تجب'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="text-[var(--ink-soft)]">الإجابة الصحيحة: </span>
                          <span className="text-emerald-400 font-semibold">{q.options[q.correctIndex]}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-[var(--line)] text-[11px] text-[var(--ink-soft)] leading-relaxed">
                        <span className="font-semibold text-cyan-400">التفسير العلمي: </span>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة محاولة الاختبار</span>
              </button>

              <button
                onClick={onBackToLesson}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-colors"
              >
                <span>متابعة مسار الدورة</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
