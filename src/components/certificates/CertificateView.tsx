import React, { useRef } from 'react';
import { Certificate } from '../../shared/types';
import { Award, ShieldCheck, Printer, Copy, CheckCircle2, ArrowRight, QrCode, ExternalLink } from 'lucide-react';

interface CertificateViewProps {
  certificate: Certificate;
  onBack: () => void;
  onOpenVerifier: (code: string) => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  certificate,
  onBack,
  onOpenVerifier,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);
  const certRef = useRef<HTMLDivElement | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(certificate.verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--line)] p-4 rounded-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمسار التعليمي</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] text-xs font-semibold transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ رمز التحقق'}</span>
          </button>

          <button
            onClick={() => onOpenVerifier(certificate.verificationCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-cyan-300 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فحص في السجل العام</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[var(--ink)] text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة / حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Luxury Certificate Card Container */}
      <div 
        ref={certRef}
        className="relative bg-gradient-to-b from-[var(--hero-b)] via-slate-950 to-[var(--hero-c)] border-4 border-amber-500/30 rounded-3xl p-8 sm:p-14 shadow-2xl overflow-hidden print:border-[var(--line)] print:text-black print:bg-white"
      >
        {/* Subtle Watermark & Orbit Emblem */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Award className="w-96 h-96 text-cyan-400" />
        </div>

        {/* Outer Guilloche Border Frame simulation */}
        <div className="border border-amber-500/20 rounded-2xl p-6 sm:p-10 space-y-8 relative z-10">
          
          {/* Certificate Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-2">
              <span className="text-2xl font-black text-[var(--ink)]">M</span>
            </div>

            <div className="text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono">
              ORBIT LEARN 2026 • DIGITAL CREDENTIAL LEDGER
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-slate-100 to-cyan-300">
              شهادة إتمام معتمدة
            </h1>

            <p className="text-xs text-[var(--ink-soft)] max-w-lg">
              تشهد منصة مدار للتعلم الرقمي بأن المتعلم قد أتم كافة متطلبات الدورة واجتاز التقييمات المعمارية بنجاح.
            </p>
          </div>

          {/* Student Name */}
          <div className="text-center py-4 border-y border-slate-800/80">
            <div className="text-xs text-[var(--ink-soft)] mb-1">تُمنح هذه الشهادة بكل فخر إلى:</div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-wide">
              {certificate.userName}
            </div>
          </div>

          {/* Course Title & Verification statement */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs text-[var(--ink-soft)]">نظير إكماله واجتيازه المتطلبات الهندسية للدورة التخصصية:</div>
            <div className="text-xl sm:text-2xl font-bold text-cyan-300">
              {certificate.courseTitle}
            </div>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              بدرجة تقييم نهائية بلغت <span className="font-bold text-amber-400 font-mono">{certificate.gradePercentage}%</span>، وبناءً على معايير الحوكمة والجودة 9.5/10 المنصوص عليها في المخطط التنفيذي 2026.
            </p>
          </div>

          {/* Skills Verified Badges */}
          {certificate.skillsVerified && certificate.skillsVerified.length > 0 && (
            <div className="space-y-2 text-center pt-2">
              <div className="text-[11px] font-bold text-[var(--ink-soft)]">المهارات والمعايير المحققة:</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {certificate.skillsVerified.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--line)] text-[var(--ink)] font-mono"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Signatures & Tamper-Evident Hash Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-6 pt-8 border-t border-slate-800/80 text-xs">
            
            {/* Instructor Signature */}
            <div className="text-center sm:text-right space-y-1">
              <div className="font-bold text-[var(--ink)]">{certificate.instructorName}</div>
              <div className="text-[var(--ink-soft)] text-[11px]">كبير مهندسي النظم / مدرب الدورة</div>
              <div className="font-mono text-[10px] text-cyan-400 pt-1">التوقيع الرقمي: معتمد ✓</div>
            </div>

            {/* Verification QR Preview */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-16 h-16 bg-[var(--bg-elevated)] p-1 rounded-lg flex items-center justify-center shadow">
                <QrCode className="w-14 h-14 text-[var(--ink)]" />
              </div>
              <div className="text-[10px] font-mono text-[var(--ink-soft)]">امسح للتحقق الفوري</div>
            </div>

            {/* Issuance Date & Unique Hash */}
            <div className="text-center sm:text-left space-y-1">
              <div className="text-[var(--ink-soft)] text-[11px]">
                تاريخ الإصدار: {new Date(certificate.issuedAt).toLocaleDateString('ar-EG')}
              </div>
              <div className="text-[var(--ink-soft)] text-[11px]">رمز التحقق التشفيري:</div>
              <div className="font-mono font-bold text-cyan-400 text-xs tracking-wider bg-[var(--bg-elevated)] px-2 py-1 rounded border border-[var(--line)] inline-block">
                {certificate.verificationCode}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
