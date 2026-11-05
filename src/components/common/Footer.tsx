import React from 'react';
import { 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  BookOpen, 
  Library, 
  Video, 
  Award, 
  Heart,
  Wallet,
  Building2,
  ShieldCheck
} from 'lucide-react';

interface FooterProps {
  onOpenLibrary: () => void;
  onOpenLive: () => void;
  onOpenVerify: () => void;
  onOpenCatalog: () => void;
  onOpenBooking?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLibrary,
  onOpenLive,
  onOpenVerify,
  onOpenCatalog,
  onOpenBooking,
}) => {
  return (
    <footer className="bg-[var(--bg-elevated)] text-[var(--ink)] border-t border-amber-500/20 pt-16 pb-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[var(--line)]">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[var(--ink)] font-black text-xl shadow-lg shadow-amber-500/20">
                💡
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--ink)]">أكاديمية سارة العربي</h3>
                <p className="text-[11px] text-amber-400 font-medium">تأسيس أطفال . حساب ذهني</p>
              </div>
            </div>

            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              معلمة تأسيس أطفال (عربي ورياضة) ومدربة حساب ذهني معتمدة. بنساعد الأطفال يتعلموا بسهولة وبطريقة ممتعة، بمنهج <strong>تأسيس أطفال . حساب ذهني</strong>.
            </p>

            <div className="pt-1">
              <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold inline-block">
                مقر المنصورة • وحصص أونلاين تفاعلية حول العالم
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              المسارات والكورسات
            </h4>
            <ul className="space-y-2 text-xs text-[var(--ink-soft)]">
              <li>
                <button onClick={onOpenCatalog} className="hover:text-amber-400 transition-colors">
                  دبلوم الحساب الذهني والسوروبان للأطفال
                </button>
              </li>
              <li>
                <button onClick={onOpenCatalog} className="hover:text-amber-400 transition-colors">
                  منهج تأسيس القراءة والكتابة (نور البيان)
                </button>
              </li>
              <li>
                <button onClick={onOpenCatalog} className="hover:text-amber-400 transition-colors">
                  الرياضيات الممتعة وتنمية التفكير المنطقي
                </button>
              </li>
              <li>
                <button onClick={onOpenCatalog} className="hover:text-amber-400 transition-colors">
                  دبلوم تدريب المدربين المعتمد (TOT للأمهات والمعلمات)
                </button>
              </li>
              {onOpenBooking && (
                <li>
                  <button onClick={onOpenBooking} className="text-amber-400 font-bold hover:underline">
                    احجز اختبار تحديد مستوى مجاني 🎁
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Platform Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              الموارد والخدمات
            </h4>
            <ul className="space-y-2 text-xs text-[var(--ink-soft)]">
              <li>
                <button onClick={onOpenLibrary} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Library className="w-3.5 h-3.5 text-amber-400" />
                  <span>مكتبة المذكرات وكتب التدريب الحصرية</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenLive} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>فصول البث المباشر ومشاركة الشاشة</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenVerify} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>التحقق من الشهادات المعتمدة برقم الكود</span>
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <span className="text-[11px] text-[var(--ink-soft)] block mb-1.5">وسائل الدفع المعتمدة:</span>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-[var(--ink-soft)]">
                <span className="bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--line-strong)]">InstaPay</span>
                <span className="bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--line-strong)]">Vodafone Cash</span>
                <span className="bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--line-strong)]">Orange Cash</span>
                <span className="bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--line-strong)]">WE Pay</span>
                <span className="bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--line-strong)]">Saudi IBAN</span>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              تواصل مع مس سارة العربي
            </h4>
            
            <div className="space-y-2 text-xs text-[var(--ink-soft)]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>المنصورة، محافظة الدقهلية، مصر</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:01028340042" className="hover:text-emerald-400 font-mono font-bold" dir="ltr">
                  010 28340042 / +20 10 28340042
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href="mailto:Saraelarby96@gmail.com" className="hover:text-sky-400 font-mono">
                  Saraelarby96@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/201028340042?text=السلام%20عليكم%20مس%20سارة%20العربي"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-[var(--ink)] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-105"
              >
                <Send className="w-3.5 h-3.5 fill-white" />
                <span>تواصل عبر واتساب مباشرة</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-faint)]">
          <div className="flex items-center gap-1">
            <span>جميع الحقوق محفوظة © 2026</span>
            <span className="text-amber-400 font-bold">لأكاديمية أ / سارة العربي</span>
            <span>• تأسيس أطفال . حساب ذهني</span>
          </div>

          <div className="flex items-center gap-2 text-[var(--ink-soft)] text-[11px]">
            <span>صُممت بحب للأطفال والأمهات والمعلمات</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>

      </div>
    </footer>
  );
};
