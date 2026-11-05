import React, { useState } from 'react';
import { Certificate } from '../../shared/types';
import { verifyCertificateByCode } from '../../services/api';
import { ShieldCheck, Search, CheckCircle, XCircle, Award, Calendar, User, BookOpen } from 'lucide-react';

interface CertificateVerifierProps {
  initialCode?: string;
  onViewCertificateDetails?: (cert: Certificate) => void;
}

export const CertificateVerifier: React.FC<CertificateVerifierProps> = ({
  initialCode = '',
  onViewCertificateDetails,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [result, setResult] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerify = async (queryCode?: string) => {
    const target = queryCode || code;
    if (!target.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const cert = await verifyCertificateByCode(target);
      setResult(cert);
    } finally {
      setLoading(false);
    }
  };

  const sampleCodes = [
    { code: 'ORB-2026-CYBER-89A2', title: 'شهادة الأمن السيبراني (عينة معتمدة)' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
          أداة التحقق من الشهادات والوثائق الأكاديمية
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)] max-w-lg mx-auto leading-relaxed">
          وفق متطلب المخطط التنفيذي (FR-CERT-01)، كل شهادة صادرة عن منصة مدار تحمل معرّفاً تشفيرياً فريداً يمكن التحقق من صحته فورياً دون كشف بيانات شخصية حساسة.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--line)] p-6 rounded-3xl shadow-xl space-y-4">
        <label className="block text-xs font-bold text-[var(--ink)]">
          أدخل رمز التحقق التشفيري (Verification Code):
        </label>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[var(--ink-soft)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="مثال: ORB-2026-CYBER-89A2"
              className="w-full bg-[var(--bg-inset)] border border-[var(--line-strong)] rounded-xl pr-10 pl-3 py-3 text-xs sm:text-sm font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || !code.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[var(--ink)] text-xs font-bold transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap"
          >
            {loading ? 'جاري الفحص...' : 'فحص صحة الشهادة'}
          </button>
        </div>

        {/* Sample Codes quick picks */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--ink-soft)]">
          <span className="text-[11px]">شهادات موثقة للتحقق السريع:</span>
          {sampleCodes.map(s => (
            <button
              key={s.code}
              onClick={() => {
                setCode(s.code);
                handleVerify(s.code);
              }}
              className="font-mono text-cyan-400 hover:text-cyan-300 bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--line-strong)] text-[11px] transition-colors"
            >
              {s.code}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Card */}
      {hasSearched && (
        <div>
          {result ? (
            <div className="bg-[var(--bg-elevated)] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400">شهادة معتمدة وموثقة رسمياً</span>
                    <h3 className="text-lg font-bold text-[var(--ink)]">{result.courseTitle}</h3>
                  </div>
                </div>

                <div className="text-left font-mono text-xs">
                  <span className="text-[var(--ink-soft)]">الدرجة: </span>
                  <span className="font-bold text-amber-400 text-sm">{result.gradePercentage}%</span>
                </div>
              </div>

              {/* Credential Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[var(--bg-elevated)]/60 p-3.5 rounded-xl border border-[var(--line)] flex items-center gap-3">
                  <User className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[var(--ink-soft)] text-[11px]">اسم المتخرج / الحاصل على الشهادة:</div>
                    <div className="font-bold text-[var(--ink)]">{result.userName}</div>
                  </div>
                </div>

                <div className="bg-[var(--bg-elevated)]/60 p-3.5 rounded-xl border border-[var(--line)] flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-[var(--ink-soft)] text-[11px]">تاريخ الإصدار والاعتماد:</div>
                    <div className="font-bold text-[var(--ink)]">
                      {new Date(result.issuedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-elevated)]/60 p-3.5 rounded-xl border border-[var(--line)] flex items-center gap-3">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[var(--ink-soft)] text-[11px]">المدرب المشرف:</div>
                    <div className="font-bold text-[var(--ink)]">{result.instructorName}</div>
                  </div>
                </div>

                <div className="bg-[var(--bg-elevated)]/60 p-3.5 rounded-xl border border-[var(--line)] flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[var(--ink-soft)] text-[11px]">المعرّف التشفيري:</div>
                    <div className="font-mono text-cyan-400">{result.verificationCode}</div>
                  </div>
                </div>
              </div>

              {/* Skills breakdown */}
              {result.skillsVerified && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-[var(--ink-soft)]">الكفاءات الهندسية المثبتة:</div>
                  <div className="flex flex-wrap gap-2">
                    {result.skillsVerified.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] text-[var(--ink-soft)] border border-[var(--line-strong)] font-mono"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA View Certificate */}
              {onViewCertificateDetails && (
                <div className="pt-4 border-t border-[var(--line)] text-left">
                  <button
                    onClick={() => onViewCertificateDetails(result)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-colors"
                  >
                    استعراض الوثيقة الأصلية كاملة
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--bg-elevated)] border border-red-500/40 rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--ink)]">لم يتم العثور على شهادة تطابق هذا الرمز</h3>
              <p className="text-xs text-[var(--ink-soft)] max-w-sm mx-auto">
                تأكد من إدخال الرمز بالكامل وبصيغته الصحيحة (بما في ذلك الأحرف والشرطات مثل ORB-2026-...).
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
