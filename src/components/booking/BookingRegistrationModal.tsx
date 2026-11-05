import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Phone, 
  Upload, 
  Copy, 
  CreditCard, 
  Wallet, 
  Sparkles, 
  Building2, 
  Calendar, 
  Send,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Download,
  Clock,
  MapPin,
  Check
} from 'lucide-react';
import { Course } from '../../shared/types';
import { createBooking } from '../../services/api';

interface BookingRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourse?: Course | null;
  onBookingSuccess?: (bookingDetails: any) => void;
}

type PaymentProvider = 'instapay' | 'vodafone' | 'orange' | 'wepay' | 'saudi_iban' | 'on_site';

export const BookingRegistrationModal: React.FC<BookingRegistrationModalProps> = ({
  isOpen,
  onClose,
  preselectedCourse,
  onBookingSuccess,
}) => {
  if (!isOpen) return null;

  // Form Fields
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('8');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('مصر');
  const [city, setCity] = useState('المنصورة');
  const [program, setProgram] = useState(
    preselectedCourse ? preselectedCourse.title : 'دبلوم الحساب الذهني والسوروبان للأطفال (برنامج العباقرة الصغار)'
  );
  const [studyMode, setStudyMode] = useState<'online_live' | 'branch_mansoura' | 'recorded'>('online_live');
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('instapay');
  const [transferRef, setTransferRef] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRefCode, setBookingRefCode] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !parentName.trim() || !phone.trim()) {
      alert('يرجى كتابة اسم الطفل واسم ولي الأمر ورقم الهاتف للتواصل.');
      return;
    }

    const refCode = 'SARAH-' + Math.floor(100000 + Math.random() * 900000);
    const timeNow = new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
    setBookingRefCode(refCode);
    setSubmittedAt(timeNow);

    const bookingData = {
      refCode,
      childName,
      childAge,
      parentName,
      phone,
      country,
      city,
      program,
      studyMode,
      paymentMethod,
      transferRef,
      receiptFileName,
      createdAt: new Date().toISOString()
    };

    // حفظ حقيقي في قاعدة البيانات عبر نقطة نهاية الخادم (لا localStorage)
    try {
      const created = await createBooking({ childName, childAge, parentName, phone, country, city, program, studyMode, paymentMethod, transferRef } as any);
      setBookingRefCode(created.refCode);
      setSubmittedAt(new Date(created.createdAt || Date.now()).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }));
    } catch (e: any) {
      alert('فشل تسجيل الحجز في الخادم: ' + String(e?.message || e));
      return;
    }

    if (onBookingSuccess) {
      onBookingSuccess(bookingData);
    }

    setIsSubmitted(true);
  };

  // WhatsApp quick confirmation link
  const generateWhatsAppLink = () => {
    const text = encodeURIComponent(
      `السلام عليكم أ / سارة العربي 🌸\n` +
      `أنا ولي أمر الطالب: ${childName} (${childAge} سنوات)\n` +
      `أود تأكيد حجز مقعد في: ${program}\n` +
      `نظام الدراسة: ${studyMode === 'online_live' ? 'أونلاين مباشر (فصول تفاعلية)' : studyMode === 'branch_mansoura' ? 'حضور في مقر المنصورة' : 'كورس مسجل'}\n` +
      `طريقة الدفع: ${paymentMethod}\n` +
      `رقم كود الحجز المعتمد: ${bookingRefCode}\n` +
      `رقم الهاتف / واتساب: ${phone}\n` +
      `المحافظة / الدولة: ${city} - ${country}`
    );
    return `https://wa.me/201028340042?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[var(--bg-elevated)]/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--line)] text-[var(--ink)] rounded-2xl shadow-2xl p-5 sm:p-8 my-6 text-right overflow-hidden font-sans"
        dir="rtl"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Modal Header */}
            <div className="mb-6 border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-[var(--ink)] flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
                  💡
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
                    حجز مقعد وتسجيل في الأكاديمية
                  </h3>
                </div>
              </div>
              <p className="text-xs text-amber-300 font-bold">
                أكاديمية أ / سارة العربي • تأسيس أطفال . حساب ذهني
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Child info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                    اسم الطفل الثلاثي: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="مثال: يوسف أحمد السعيد"
                    className="w-full text-xs py-2.5 px-3.5 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                    سن الطفل: <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-none focus:border-amber-400 font-bold"
                  >
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, '16+ (معلمات/أمهات)'].map((age) => (
                      <option key={age} value={age} className="bg-[var(--bg-elevated)] text-[var(--ink)]">
                        {typeof age === 'number' ? `${age} سنوات` : age}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Parent info & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                    اسم ولي الأمر (الأب / الأم): <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="مثال: أحمد السعيد"
                    className="w-full text-xs py-2.5 px-3.5 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                    رقم الهاتف والواتساب: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX أو مع كود الدولة"
                    className="w-full text-xs py-2.5 px-3.5 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Row 3: Location & Study Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                    الدولة:
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (e.target.value === 'السعودية' || e.target.value === 'الإمارات' || e.target.value === 'الكويت') {
                        setPaymentMethod('saudi_iban');
                        setStudyMode('online_live');
                      }
                    }}
                    className="w-full text-xs py-2.5 px-3 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-none focus:border-amber-400"
                  >
                    <option value="مصر" className="bg-[var(--bg-elevated)]">مصر 🇪🇬</option>
                    <option value="السعودية" className="bg-[var(--bg-elevated)]">المملكة العربية السعودية 🇸🇦</option>
                    <option value="الإمارات" className="bg-[var(--bg-elevated)]">الإمارات العربية المتحدة 🇦🇪</option>
                    <option value="الكويت" className="bg-[var(--bg-elevated)]">الكويت 🇰🇼</option>
                    <option value="عمان" className="bg-[var(--bg-elevated)]">سلطنة عمان 🇴🇲</option>
                    <option value="قطر" className="bg-[var(--bg-elevated)]">قطر 🇶🇦</option>
                    <option value="دولة أخرى" className="bg-[var(--bg-elevated)]">دولة أخرى 🌍</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                    المحافظة / المدينة:
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="المنصورة، الرياض، القاهرة..."
                    className="w-full text-xs py-2.5 px-3.5 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                    نظام الحضور المفضل:
                  </label>
                  <select
                    value={studyMode}
                    onChange={(e) => setStudyMode(e.target.value as any)}
                    className="w-full text-xs py-2.5 px-3 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-none focus:border-amber-400"
                  >
                    <option value="online_live" className="bg-[var(--bg-elevated)]">أونلاين مباشر (فصول تفاعلية وشاشة)</option>
                    <option value="branch_mansoura" className="bg-[var(--bg-elevated)]">حضور في مقر المنصورة</option>
                    <option value="recorded" className="bg-[var(--bg-elevated)]">كورس مسجل على المنصة</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Program Selection */}
              <div>
                <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                  الكورس أو المسار التعليمي:
                </label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="دبلوم الحساب الذهني والسوروبان للأطفال (برنامج العباقرة الصغار)" className="bg-[var(--bg-elevated)]">
                    🧮 دبلوم الحساب الذهني والسوروبان للأطفال (برنامج العباقرة الصغار 6-14 سنة)
                  </option>
                  <option value="منهج تأسيس اللغة العربية والقرائية للأطفال (نور البيان)" className="bg-[var(--bg-elevated)]">
                    📖 منهج تأسيس القراءة والكتابة والقرائية (نور البيان والأصوات 4-9 سنوات)
                  </option>
                  <option value="تأسيس الرياضيات الممتعة وتنمية التفكير المنطقي" className="bg-[var(--bg-elevated)]">
                    🔢 تأسيس الرياضيات الممتعة وتنمية التفكير المنطقي (7-14 سنة)
                  </option>
                  <option value="دبلوم تدريب المدربين المعتمد (TOT للأمهات والمعلمات)" className="bg-[var(--bg-elevated)]">
                    🎓 دبلوم تدريب المدربين المعتمد (TOT للأمهات والمعلمات)
                  </option>
                  <option value="جلسة تقييم مستوى مجانية وتحديد المسار المناسب" className="bg-[var(--bg-elevated)]">
                    🎁 جلسة تقييم مستوى واختبار ذكاء أولي مجاني لطفلك
                  </option>
                </select>
              </div>

              {/* Row 5: Payment Providers */}
              <div className="pt-3 border-t border-[var(--line)]">
                <label className="block text-xs font-bold text-[var(--ink)] mb-2">
                  طريقة السداد وتأكيد الحجز:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('instapay')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                      paymentMethod === 'instapay'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold shadow-sm'
                        : 'bg-[var(--bg-elevated)]/60 text-[var(--ink-soft)] border-[var(--line)] hover:border-amber-400/40'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs">انستاباي (InstaPay)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('vodafone')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                      paymentMethod === 'vodafone'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-400 font-bold shadow-sm'
                        : 'bg-[var(--bg-elevated)]/60 text-[var(--ink-soft)] border-[var(--line)] hover:border-rose-400/40'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-xs">فودافون كاش</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('saudi_iban')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                      paymentMethod === 'saudi_iban'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold shadow-sm'
                        : 'bg-[var(--bg-elevated)]/60 text-[var(--ink-soft)] border-[var(--line)] hover:border-emerald-400/40'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs">آيبان سعودي / خليجي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                      paymentMethod === 'orange'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-400 font-bold shadow-sm'
                        : 'bg-[var(--bg-elevated)]/60 text-[var(--ink-soft)] border-[var(--line)] hover:border-orange-400/40'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="text-xs">أورنج كاش</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wepay')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                      paymentMethod === 'wepay'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-400 font-bold shadow-sm'
                        : 'bg-[var(--bg-elevated)]/60 text-[var(--ink-soft)] border-[var(--line)] hover:border-purple-400/40'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-xs">وي باي (WE Pay)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('on_site')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                      paymentMethod === 'on_site'
                        ? 'bg-[var(--bg-subtle)] text-[var(--ink)] border-white/30 font-bold shadow-sm'
                        : 'bg-[var(--bg-elevated)]/60 text-[var(--ink-soft)] border-[var(--line)] hover:border-white/25'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs">في مقر المنصورة</span>
                  </button>
                </div>

                {/* Active Payment Details Box */}
                <div className="bg-[var(--bg-elevated)]/90 border border-[var(--line)] rounded-xl p-3.5 text-xs space-y-2">
                  {paymentMethod === 'instapay' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-bold text-amber-300">
                        <span>بيانات التحويل عبر انستاباي (InstaPay):</span>
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono">لحظي معتمد</span>
                      </div>
                      <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-2.5 rounded-lg border border-[var(--line)]">
                        <div>
                          <span className="text-[var(--ink-soft)] block text-[10px]">عنوان الدفع اللحظي (IPA):</span>
                          <span className="font-mono font-bold text-[var(--ink)] text-xs">Saraelarby96@instapay</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('Saraelarby96@instapay', 'ipa')}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-md font-bold flex items-center gap-1 transition-colors text-xs"
                        >
                          {copiedKey === 'ipa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'ipa' ? 'تم النسخ!' : 'نسخ'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[var(--ink-soft)]">
                        أو التحويل برقم الهاتف المسجل: <strong className="text-[var(--ink)] font-mono">01028340042</strong>
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'vodafone' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-bold text-rose-300">
                        <span>رقم محفظة فودافون كاش:</span>
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">فودافون كاش</span>
                      </div>
                      <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-2.5 rounded-lg border border-[var(--line)]">
                        <div>
                          <span className="text-[var(--ink-soft)] block text-[10px]">رقم المحفظة المعتمد:</span>
                          <span className="font-mono font-bold text-rose-400 text-sm">01028340042</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('01028340042', 'voda')}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-md font-bold flex items-center gap-1 transition-colors text-xs"
                        >
                          {copiedKey === 'voda' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'voda' ? 'تم النسخ!' : 'نسخ'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'saudi_iban' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-bold text-emerald-300">
                        <span>التحويل البنكي والآيبان السعودي (مصرف الراجحي):</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">IBAN Verified</span>
                      </div>
                      <div className="bg-[var(--bg-elevated)] p-2.5 rounded-lg border border-[var(--line)] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--ink-soft)]">المستفيد: <strong className="text-[var(--ink)]">أ / سارة العربي</strong></span>
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Al Rajhi Bank</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]">
                          <div>
                            <span className="text-[var(--ink-soft)] block text-[10px]">رقم الآيبان (IBAN):</span>
                            <span className="font-mono font-bold text-emerald-300 text-xs tracking-wider" dir="ltr">
                              SA4480000412608010123456
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('SA4480000412608010123456', 'iban')}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-md font-bold flex items-center gap-1 transition-colors text-xs"
                          >
                            {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'iban' ? 'تم النسخ!' : 'نسخ'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'orange' && (
                    <div className="space-y-2">
                      <div className="font-bold text-orange-300">محفظة أورنج كاش:</div>
                      <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-2.5 rounded-lg border border-[var(--line)]">
                        <span className="font-mono font-bold text-orange-400 text-sm">01283400420</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('01283400420', 'orange')}
                          className="px-2.5 py-1 bg-orange-500/20 text-orange-300 rounded-md font-bold flex items-center gap-1 text-xs"
                        >
                          {copiedKey === 'orange' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'orange' ? 'تم النسخ!' : 'نسخ'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'wepay' && (
                    <div className="space-y-2">
                      <div className="font-bold text-purple-300">محفظة وي باي (WE Pay):</div>
                      <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-2.5 rounded-lg border border-[var(--line)]">
                        <span className="font-mono font-bold text-purple-400 text-sm">01028340042</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('01028340042', 'we')}
                          className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-md font-bold flex items-center gap-1 text-xs"
                        >
                          {copiedKey === 'we' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'we' ? 'تم النسخ!' : 'نسخ'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'on_site' && (
                    <div className="text-[var(--ink-soft)] space-y-1">
                      <div className="font-bold text-[var(--ink)] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>مقر الأكاديمية: المنصورة، محافظة الدقهلية</span>
                      </div>
                      <p className="text-[11px] text-[var(--ink-soft)]">
                        يمكنك تأكيد حجز المقعد الآن إلكترونياً وسداد الرسوم عند الحضور لجلسة التقييم الأولى وتسلّم العداد الصيني والكتب.
                      </p>
                    </div>
                  )}
                </div>

                {/* Transfer Reference & Receipt Upload */}
                {paymentMethod !== 'on_site' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                        رقم العملية أو اسم الحساب المحوّل منه:
                      </label>
                      <input
                        type="text"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="اسم المحول أو آخر 4 أرقام"
                        className="w-full text-xs py-2 px-3 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--ink-soft)] mb-1">
                        إرفاق صورة الإيصال (اختياري):
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setReceiptFileName(e.target.files[0].name);
                            }
                          }}
                          className="hidden"
                          id="receipt-upload"
                        />
                        <label
                          htmlFor="receipt-upload"
                          className="w-full py-2 px-3 bg-[var(--bg-elevated)]/80 hover:bg-[var(--bg-elevated)]/80 border border-dashed border-[var(--line-strong)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-[var(--ink-soft)] text-xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span className="truncate max-w-[150px]">
                            {receiptFileName ? receiptFileName : 'اختر صورة الإيصال'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-[var(--ink)] font-black rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-xs sm:text-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>تأكيد الحجز وتسجيل المقعد فورياً 🎁</span>
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Confirmation Success Screen - Pristine Cohesive Design */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 animate-bounce">
              🎉
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
                تم استلام طلب التسجيل بنجاح!
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] mt-2">
                أهلاً بك يا بطل في أكاديمية سارة العربي 💡
              </h3>
              <p className="text-xs text-[var(--ink-soft)] mt-1 max-w-md mx-auto">
                تم تسجيل بيانات الطفل <strong className="text-[var(--ink)]">{childName}</strong> بنجاح في <strong className="text-amber-300">{program}</strong>.
              </p>
            </div>

            {/* Reference Ticket Box */}
            <div className="p-4 bg-[var(--bg-elevated)]/80 border border-[var(--line)] rounded-xl max-w-md mx-auto space-y-2">
              <span className="text-[10px] text-[var(--ink-soft)] block">كود الحجز المرجعي المعتمد:</span>
              <div className="text-2xl font-black font-mono text-amber-300 tracking-wider">
                {bookingRefCode}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--ink-soft)] border-t border-[var(--line)] pt-2">
                <span>تاريخ التسجيل: <strong className="text-[var(--ink)] font-mono">{submittedAt}</strong></span>
                <span>الهاتف: <strong className="text-[var(--ink)] font-mono" dir="ltr">{phone}</strong></span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 max-w-md mx-auto space-y-2">
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-[var(--ink)] font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-xs transition-transform hover:scale-105"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>إرسال إشعار الحجز مباشرة لمس سارة عبر الواتساب</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_15%,transparent)] text-[var(--ink)] font-bold rounded-xl text-xs transition-colors"
              >
                إغلاق والعودة للمنصة
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
