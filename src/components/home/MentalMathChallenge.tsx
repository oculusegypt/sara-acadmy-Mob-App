import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Trophy, 
  Flame, 
  Brain,
  Star,
  Zap
} from 'lucide-react';

interface MentalMathChallengeProps {
  onSuccess?: (score: number) => void;
}

type Difficulty = 'beginner' | 'champion' | 'genius';

export const MentalMathChallenge: React.FC<MentalMathChallengeProps> = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'answering' | 'result'>('idle');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [numbersSequence, setNumbersSequence] = useState<number[]>([]);
  const [currentDisplayNumber, setCurrentDisplayNumber] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Configuration by difficulty
  const config = {
    beginner: { count: 3, min: 1, max: 5, delay: 1200, label: 'مستوى العصافير (6-8 سنوات)', stars: 1 },
    champion: { count: 5, min: 1, max: 9, delay: 900, label: 'مستوى الأبطال (8-11 سنة)', stars: 2 },
    genius: { count: 6, min: 2, max: 15, delay: 700, label: 'مستوى العباقرة الصغار (11-14 سنة)', stars: 3 },
  };

  const startChallenge = () => {
    const { count, min, max } = config[difficulty];
    const seq: number[] = [];
    let runningSum = 0;

    for (let i = 0; i < count; i++) {
      let num = Math.floor(Math.random() * (max - min + 1)) + min;
      // 50% chance of subtraction if running sum > num
      if (i > 0 && Math.random() > 0.5 && runningSum - num >= 0) {
        num = -num;
      }
      runningSum += num;
      seq.push(num);
    }

    setNumbersSequence(seq);
    setCurrentStep(0);
    setUserAnswer('');
    setIsCorrect(null);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    if (currentStep < numbersSequence.length) {
      setCurrentDisplayNumber(numbersSequence[currentStep]);
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, config[difficulty].delay);
      return () => clearTimeout(timer);
    } else {
      // Sequence finished, prompt for answer
      setCurrentDisplayNumber(null);
      setGameState('answering');
    }
  }, [gameState, currentStep, numbersSequence, difficulty]);

  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim()) return;

    const actualSum = numbersSequence.reduce((acc, curr) => acc + curr, 0);
    const parsed = parseInt(userAnswer, 10);

    if (parsed === actualSum) {
      setIsCorrect(true);
      const points = difficulty === 'beginner' ? 10 : difficulty === 'champion' ? 20 : 35;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setIsCorrect(false);
      setStreak(0);
    }
    setGameState('result');
  };

  const actualSum = numbersSequence.reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-2xl border border-[var(--line)] rounded-2xl p-5 sm:p-8 shadow-lg relative overflow-hidden text-[var(--ink)]">
      
      {/* Decorative background shapes */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-lg shadow-sm">
              🧮
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
              تحدي عباقرة الحساب الذهني السريع
            </h3>
            <span className="text-[10px] sm:text-[11px] bg-amber-400/10 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/20">
              جرب مهارة طفلك! 💡
            </span>
          </div>
          <p className="text-xs text-[var(--ink-soft)]">
            شاهد الأرقام تظهر وتختفي سريعاً في ثوانٍ، واحسب المجموع في خيالك مثل أبطال السوروبان!
          </p>
        </div>

        {/* Score & Streak counter */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] border border-[var(--line)] px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold text-[var(--ink)]">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>النقاط: <span className="font-mono text-amber-300 text-sm">{score}</span></span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-xl shadow-sm text-xs font-bold text-rose-300 animate-bounce">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>{streak} متتالية!</span>
            </div>
          )}
        </div>
      </div>

      {/* Difficulty Selectors (Only shown when not playing) */}
      {gameState === 'idle' && (
        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--ink-soft)] mb-3">
              اختر مستوى التحدي المناسب لسن طفلك:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {(['beginner', 'champion', 'genius'] as Difficulty[]).map((level) => {
                const isSelected = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`p-4 sm:p-5 rounded-2xl text-right transition-all border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[var(--ink)] border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-[var(--bg-elevated)]/60 text-[var(--ink)] border-[var(--line)] hover:border-amber-400/30 hover:bg-[var(--bg-elevated)]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1">
                        {Array.from({ length: config[level].stars }).map((_, idx) => (
                          <Star key={idx} className={`w-3.5 h-3.5 ${isSelected ? 'fill-slate-950 text-[var(--ink)]' : 'fill-amber-400 text-amber-400'}`} />
                        ))}
                      </div>
                      <span className="text-xl">
                        {level === 'beginner' ? '🐣' : level === 'champion' ? '🦁' : '⚡'}
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-extrabold block">{config[level].label}</span>
                    <span className={`text-[11px] mt-1 ${isSelected ? 'text-[var(--ink)] font-bold' : 'text-[var(--ink-soft)]'}`}>
                      {config[level].count} أرقام تظهر بسرعة {config[level].delay / 1000} ثانية
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-elevated)]/60 border border-[var(--line)] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center text-xl shrink-0">
                💡
              </div>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                <strong className="text-amber-300 font-bold">نصيحة مس سارة العربي:</strong> درب طفلك على تخيل العداد الصيني في خياله وهو يرى الأرقام، وحرك أصابعك كأنك ترفع خرزة الآحاد أو تنزل خرزة الـ 5!
              </p>
            </div>

            <button
              onClick={startChallenge}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>ابدأ التحدي الآن</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Flashing State */}
      {gameState === 'playing' && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-amber-300 font-bold mb-4 flex items-center gap-2">
            <span className="animate-spin text-sm">⏳</span>
            <span>احفظ وركز في عقلك... الرقم {currentStep + 1} من {numbersSequence.length}</span>
          </div>

          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[var(--bg-inset)] border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
            <span className="text-5xl sm:text-6xl font-black text-[var(--ink)] font-mono tracking-wider">
              {currentDisplayNumber !== null ? (currentDisplayNumber > 0 ? `+${currentDisplayNumber}` : currentDisplayNumber) : ''}
            </span>
          </div>

          <div className="w-48 sm:w-56 bg-[var(--bg-subtle)] h-2 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / numbersSequence.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Answering State */}
      {gameState === 'answering' && (
        <div className="py-8 max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 mx-auto flex items-center justify-center text-3xl shadow-md">
            🤔
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-black text-[var(--ink)] mb-1.5">
              ما هو الناتج الإجمالي في خيالك؟
            </h4>
            <p className="text-xs text-[var(--ink-soft)]">
              اكتب الرقم الذي جمعته في عقلك بدون ورقة أو آلة حاسبة:
            </p>
          </div>

          <form onSubmit={handleSubmitAnswer} className="flex gap-2.5 justify-center">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="اكتب الناتج"
              autoFocus
              className="w-36 text-center text-2xl font-black font-mono py-2.5 px-3 bg-[var(--bg-inset)] border border-amber-400 rounded-xl text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-amber-400/30 shadow-inner"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-bold rounded-xl shadow-md text-xs sm:text-sm flex items-center gap-1.5 active:scale-95"
            >
              <span>تحقق</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Result State */}
      {gameState === 'result' && (
        <div className="py-8 max-w-lg mx-auto text-center space-y-4">
          {isCorrect ? (
            <div className="space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 mx-auto flex items-center justify-center text-4xl shadow-md animate-bounce">
                🎉
              </div>
              <h4 className="text-2xl font-black text-emerald-300">
                ما شاء الله! إجابة عبقرية صحيحة!
              </h4>
              <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
                الناتج هو بالفعل <strong className="text-emerald-300 font-mono text-base">{actualSum}</strong>. طفلك يمتلك سرعة بديهة متميزة! 🌟
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 mx-auto flex items-center justify-center text-4xl shadow-md">
                💡
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
                محاولة رائعة! قربت جداً من الحل
              </h4>
              <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
                الناتج الصحيح هو <strong className="text-amber-300 font-mono text-base">{actualSum}</strong>، وأنت كتبت <span className="font-mono text-[var(--ink-soft)]">{userAnswer}</span>. 
                مع تمارين العداد الصيني اليومية مع مس سارة، ستصل لدقة 100% في وقت قياسي!
              </p>
            </div>
          )}

          {/* Sequence Breakdown */}
          <div className="p-3 bg-[var(--bg-elevated)]/80 rounded-xl border border-[var(--line)] inline-flex flex-wrap items-center justify-center gap-1.5 text-xs font-mono">
            <span className="text-[var(--ink-soft)] font-sans">العملية:</span>
            {numbersSequence.map((num, i) => (
              <span key={i} className="font-bold text-[var(--ink)]">
                {num > 0 && i > 0 ? `+ ${num}` : num}
              </span>
            ))}
            <span className="text-amber-400 font-bold">= {actualSum}</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={startChallenge}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-bold rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>جولة ثانية</span>
            </button>

            <button
              onClick={() => setGameState('idle')}
              className="px-5 py-2.5 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] border border-[var(--line)] text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_20%,transparent)] font-bold rounded-xl transition-all text-xs"
            >
              <span>تغيير المستوى</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
