import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  MessageSquare, 
  FileText, 
  Bookmark, 
  Download, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Send, 
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Course, Lesson, LessonProgress, TutorMessage } from '../../shared/types';
import { getPlaybackToken, saveLessonProgress, recordAudit } from '../../services/api';
import { askSocraticTutor } from '../../services/geminiTutor';
import { SocraticAssistant } from './SocraticAssistant';

interface LessonPlayerShellProps {
  course: Course;
  currentLesson: Lesson;
  userId: string;
  isEnrolled: boolean;
  onSelectLesson: (lesson: Lesson) => void;
  onBackToCourse: () => void;
  onLaunchQuiz: (lesson: Lesson) => void;
  onLessonCompleted: (lessonId: string) => void;
}

export const LessonPlayerShell: React.FC<LessonPlayerShellProps> = ({
  course,
  currentLesson,
  userId,
  isEnrolled,
  onSelectLesson,
  onBackToCourse,
  onLaunchQuiz,
  onLessonCompleted,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(currentLesson.durationSeconds || 300);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [tokenStatus, setTokenStatus] = useState<{ authorized: boolean; token?: string; expiresAt?: string }>({
    authorized: false
  });

  // Active side tab: 'transcript' | 'tutor' | 'notes' | 'resources'
  const [activeTab, setActiveTab] = useState<'transcript' | 'tutor' | 'notes' | 'resources'>('transcript');

  // Socratic Tutor state
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `مرحباً بك! أنا "مساعد مدار السقراطي".
أنا هنا لمساعدتك على فهم وتفكيك مفاهيم درس "${currentLesson.title}".
أسلوبي يعتمد على الأسئلة التوجيهية والتلميحات المفاهيمية المستندة حصراً إلى محتوى الدورة. اطرح أي سؤال وسأرشدك خطوة بخطوة!`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);

  // Student Personal Notes state
  const [notes, setNotes] = useState<{ id: string; time: number; text: string; date: string }[]>(() => {
    try {
      const stored = localStorage.getItem(`orbit_notes_${currentLesson.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [newNoteText, setNewNoteText] = useState<string>('');

  // Fetch / verify short-lived playback token (FR-VIDEO-01)
  useEffect(() => {
    let isMounted = true;
    getPlaybackToken(currentLesson.id, userId, isEnrolled, currentLesson.isPreview)
      .then(tokenData => {
        if (isMounted) {
          setTokenStatus({
            authorized: true,
            token: tokenData.token,
            expiresAt: tokenData.expiresAt
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setTokenStatus({ authorized: false });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentLesson.id, userId, isEnrolled, currentLesson.isPreview]);

  // Video time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const jumpToTime = (seconds: number) => {
    setCurrentTime(seconds);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const skipSeconds = (delta: number) => {
    if (videoRef.current) {
      const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
      jumpToTime(target);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Mark Lesson Complete
  const handleMarkComplete = async () => {
    await saveLessonProgress(userId, currentLesson.id, Math.floor(currentTime), true);
    onLessonCompleted(currentLesson.id);
    await recordAudit({
      actorUserId: userId,
      actorName: 'متعلم',
      action: 'LESSON_COMPLETED',
      resourceType: 'lesson',
      resourceId: currentLesson.id,
      reason: `إكمال الدرس: ${currentLesson.title}`,
      correlationId: 'prog-' + Date.now(),
      safeMetadata: { progressSeconds: Math.floor(currentTime) }
    });
  };

  // Socratic Tutor Ask Question
  const handleSendTutorQuery = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isTutorLoading) return;

    const userMsg: TutorMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setTutorMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTutorLoading(true);

    try {
      const response = await askSocraticTutor({
        courseId: course.id,
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        message: textToSend,
        contextText: `${currentLesson.title}\n${currentLesson.bodyMarkdown || ''}\n${
          currentLesson.transcript?.map(t => `${t.speaker}: ${t.text}`).join('\n') || ''
        }`
      });

      const assistantMsg: TutorMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations
      };

      setTutorMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: TutorMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'تعذر الاتصال بالمساعد السقراطي حالياً. يمكنك إعادة المحاولة بعد لحظات.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setTutorMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // Add Personal Note
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const note = {
      id: 'note-' + Date.now(),
      time: Math.floor(currentTime),
      text: newNoteText.trim(),
      date: new Date().toLocaleDateString('ar-EG')
    };
    const updated = [note, ...notes];
    setNotes(updated);
    localStorage.setItem(`orbit_notes_${currentLesson.id}`, JSON.stringify(updated));
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`orbit_notes_${currentLesson.id}`, JSON.stringify(updated));
  };

  // All lessons flat array for prev/next
  const allLessons = course.sections.flatMap(s => s.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-elevated)] border border-[var(--line)] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCourse}
            className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
            title="العودة لصفحة الدورة"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[11px] font-semibold text-cyan-400">
              {course.title}
            </div>
            <h1 className="text-base font-bold text-[var(--ink)] line-clamp-1">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        {/* Playback Token Entitlement Badge */}
        <div className="flex items-center gap-2">
          {tokenStatus.authorized ? (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Token: مصرح (TTL: 5m)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>وضع المعاينة العامة</span>
            </span>
          )}

          <button
            onClick={handleMarkComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[var(--ink)] text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>تحديد الدرس كمنجز</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Video Player on right, Interactive Tabs on left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Video Player Column (7 cols on LG) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Video Container Shell */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--line)] shadow-2xl group">
            {currentLesson.videoUrl ? (
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleMarkComplete}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-inset)]">
                <FileText className="w-16 h-16 text-cyan-400/60 mb-3" />
                <h3 className="text-base font-bold text-[var(--ink)] mb-1">درس نصي / توثيقي</h3>
                <p className="text-xs text-[var(--ink-soft)] max-w-sm">
                  هذا الدرس يعتمد على التحليل النصي والمراجع المعمارية المرفقة في المنهج.
                </p>
              </div>
            )}

            {/* Custom Video Controls Overlay (visible on hover or pause) */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--hero-a)] via-slate-950/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              
              {/* Progress SeekBar */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-[var(--bg-inset)] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between text-xs text-[var(--ink)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg bg-cyan-500 text-[var(--ink)] hover:bg-cyan-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={() => skipSeconds(-10)}
                    className="p-1 hover:text-cyan-400 transition-colors"
                    title="رجوع 10 ثوانٍ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => skipSeconds(10)}
                    className="p-1 hover:text-cyan-400 transition-colors"
                    title="تقديم 10 ثوانٍ"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1 hover:text-cyan-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Time display */}
                  <span className="font-mono text-xs text-[var(--ink-soft)]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Speed options */}
                  <div className="flex items-center gap-1 bg-[var(--bg-elevated)]/80 rounded-lg p-0.5 border border-[var(--line-strong)] text-[11px] font-mono">
                    {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={`px-1.5 py-0.5 rounded ${
                          playbackSpeed === speed
                            ? 'bg-cyan-500 text-[var(--ink)] font-bold'
                            : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="p-1 hover:text-cyan-400 transition-colors"
                    title="ملء الشاشة"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Lesson Textual Notes / Architectural Theory */}
          {currentLesson.bodyMarkdown && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>ملخص المحتوى والمفاهيم المعمارية</span>
              </h3>
              <div className="text-xs text-[var(--ink-soft)] leading-relaxed whitespace-pre-line font-sans bg-[var(--bg-elevated)]/60 p-4 rounded-xl border border-slate-800/80">
                {currentLesson.bodyMarkdown}
              </div>
            </div>
          )}

          {/* Bottom Lesson Navigation */}
          <div className="flex items-center justify-between pt-2">
            {prevLesson ? (
              <button
                onClick={() => onSelectLesson(prevLesson)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] text-[var(--ink-soft)] hover:text-[var(--ink)] text-xs font-semibold border border-[var(--line)] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الدرس السابق: {prevLesson.title}</span>
              </button>
            ) : <div />}

            {currentLesson.quiz ? (
              <button
                onClick={() => onLaunchQuiz(currentLesson)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[var(--ink)] text-xs font-bold transition-all shadow-md shadow-amber-500/20"
              >
                <span>بدء اختبار الوحدة</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : nextLesson ? (
              <button
                onClick={() => onSelectLesson(nextLesson)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-colors"
              >
                <span>الدرس التالي: {nextLesson.title}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>وصلت إلى نهاية هذه الدورة!</span>
              </div>
            )}
          </div>

        </div>

        {/* Interactive Tabs Column (5 cols on LG) */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl flex flex-col h-[640px] shadow-xl overflow-hidden">
          
          {/* Tabs bar */}
          <div className="grid grid-cols-4 border-b border-[var(--line)] bg-[var(--bg-elevated)]/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'transcript'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>التفريغ النصي</span>
            </button>

            <button
              onClick={() => setActiveTab('tutor')}
              className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'tutor'
                  ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>مساعد مس سارة 💡</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>ملاحظاتي ({notes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'resources'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>الموارد</span>
            </button>
          </div>

          {/* Tab 1: Interactive Transcript */}
          {activeTab === 'transcript' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-[11px] text-[var(--ink-soft)] mb-2 flex items-center justify-between">
                <span>انقر فوق أي سطر للقفز إلى الدقيقة المحددة:</span>
                <span className="font-mono text-cyan-400">{formatTime(currentTime)}</span>
              </div>

              {currentLesson.transcript && currentLesson.transcript.length > 0 ? (
                currentLesson.transcript.map(line => {
                  const isCurrent = currentTime >= line.timeSeconds && currentTime < line.timeSeconds + 45;
                  return (
                    <div
                      key={line.id}
                      onClick={() => jumpToTime(line.timeSeconds)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 shadow-sm'
                          : 'bg-[var(--bg-elevated)]/40 border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-[var(--ink-soft)]">
                        <span className="text-cyan-400">{line.speaker}</span>
                        <span className="font-mono bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded text-[var(--ink-soft)]">
                          {formatTime(line.timeSeconds)}
                        </span>
                      </div>
                      <p className="leading-relaxed">{line.text}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-[var(--ink-faint)] text-xs">
                  لا يتوفر تفريغ نصي مسجل لهذا الدرس.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Socratic AI Tutor */}
          {activeTab === 'tutor' && (
            <div className="flex-1 overflow-hidden h-full">
              <SocraticAssistant
                lessonTitle={currentLesson.title}
                courseTitle={course.title}
                contextText={currentLesson.bodyMarkdown || currentLesson.description}
                className="h-full border-0 rounded-none bg-transparent p-3"
              />
            </div>
          )}

          {/* Tab 3: Notes & Bookmarks */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden p-4">
              {/* Existing notes */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {notes.length > 0 ? (
                  notes.map(note => (
                    <div
                      key={note.id}
                      className="bg-[var(--bg-inset)] border border-[var(--line)] p-3 rounded-xl text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[var(--ink-soft)]">
                        <button
                          onClick={() => jumpToTime(note.time)}
                          className="font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 hover:bg-cyan-500/20"
                        >
                          ⏱ {formatTime(note.time)}
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-[var(--ink-soft)] hover:text-red-400 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                      <p className="text-[var(--ink)] leading-relaxed">{note.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-[var(--ink-faint)] text-xs">
                    لم تسجل أي ملاحظات بعد. اكتب فكرتك أدناه لربطها بالدقيقة الحالية.
                  </div>
                )}
              </div>

              {/* Add Note Input */}
              <div className="border-t border-[var(--line)] pt-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--ink-soft)]">
                  <span>ربط الملاحظة بالدقيقة:</span>
                  <span className="font-mono text-cyan-400">{formatTime(currentTime)}</span>
                </div>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="اكتب ملاحظتك المعمارية هنا..."
                  rows={2}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--line-strong)] rounded-xl p-2.5 text-xs text-[var(--ink)] focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[var(--ink)] font-bold text-xs transition-colors"
                >
                  حفظ الملاحظة مع العلامة الزمنية
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Resources */}
          {activeTab === 'resources' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <h4 className="text-xs font-bold text-[var(--ink)] mb-2">المرفقات والملفات المعمارية:</h4>
              {currentLesson.resources && currentLesson.resources.length > 0 ? (
                currentLesson.resources.map(res => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-[var(--bg-inset)] border border-[var(--line)] flex items-center justify-between hover:border-[var(--line-strong)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xs font-bold font-mono uppercase">
                        {res.fileType}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--ink)]">{res.title}</div>
                        <div className="text-[10px] text-[var(--ink-soft)]">{res.fileSize}</div>
                      </div>
                    </div>

                    <a
                      href={res.url}
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`تم تنزيل المورد المعتمد: ${res.title}`);
                      }}
                      className="p-2 rounded-lg bg-[var(--bg-subtle)] hover:bg-cyan-500 hover:text-[var(--ink)] text-[var(--ink-soft)] text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-[var(--ink-faint)] text-xs">
                  لا توجد ملفات مرفقة إضافية لهذا الدرس.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
