import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import { ThemeColor, UserRole } from '../../types/models';
import {
  Settings,
  Users,
  Shield,
  Palette,
  Database,
  Terminal,
  Copy,
  Upload,
  RefreshCw,
  CheckCircle,
  FileSpreadsheet,
  Building2,
  Lock,
  Sliders,
  AlertTriangle,
  Layers,
  Sparkles,
  Server,
  HardDrive,
  FolderTree,
  FileText,
  Cloud,
  ShieldCheck,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  FileSignature,
  FileCheck,
  KeyRound,
  Eye,
  Trash2
} from 'lucide-react';
import { ExcelUserImport } from '../users/ExcelUserImport';
import { PermissionsMatrix } from '../permissions/PermissionsMatrix';

export const EnterpriseControlPanel: React.FC = () => {
  const {
    settings,
    updateSettings,
    activeRole,
    activeUser,
    setActiveView,
    setIsSetupModalOpen,
    triggerRefresh
  } = useApp();

  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  // تب فعال در کنترل‌پنل تنظیمات (حذف کنسول دیتابیس فنی)
  const [activeTab, setActiveTab] = useState<'security' | 'access_control' | 'nda' | 'excel_import' | 'branding'>('security');

  // شعار آموزشی قابل تغییر از تنظیمات
  const [orgSlogan, setOrgSlogan] = useState(
    settings.org_slogan || 'آموزش مداوم، تعالی سازمانی و ارتقای شایستگی‌های تخصصی صنعت نفت'
  );

  // --- تنظیمات قوانین امنیتی و کپچا (مطابق تصویر 782ab592) ---
  const [loginTimeFrom, setLoginTimeFrom] = useState('');
  const [loginTimeTo, setLoginTimeTo] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(settings.max_login_attempts || 5);
  const [lockoutMin, setLockoutMin] = useState(settings.lockout_minutes || 15);
  const [sessionTimeout, setSessionTimeout] = useState(settings.session_timeout_min || 40);
  const [requireProfilePhoto, setRequireProfilePhoto] = useState(true);
  const [directPortalEntry, setDirectPortalEntry] = useState(false);
  const [disconnectAllUsers, setDisconnectAllUsers] = useState(false);

  // رمز عبور
  const [pwdMinLen, setPwdMinLen] = useState(8);
  const [pwdMaxLen, setPwdMaxLen] = useState(20);
  const [pwdRequireDigits, setPwdRequireDigits] = useState(true);
  const [pwdRequireLower, setPwdRequireLower] = useState(true);
  const [pwdRequireUpper, setPwdRequireUpper] = useState(true);
  const [pwdRequireSpecial, setPwdRequireSpecial] = useState(true);
  const [pwdEnforceChangeOnLogin, setPwdEnforceChangeOnLogin] = useState(false);
  const [pwdPreventReuseCount, setPwdPreventReuseCount] = useState(0);
  const [pwdExpireDays, setPwdExpireDays] = useState(0);
  const [pwdExpireWarnDays, setPwdExpireWarnDays] = useState(0);
  const [recoveryViaSms, setRecoveryViaSms] = useState(true);
  const [recoveryViaEmail, setRecoveryViaEmail] = useState(true);
  const [enable2FA, setEnable2FA] = useState(false);

  // ساختار عبارت امنیتی کپچا
  const [enableCaptcha, setEnableCaptcha] = useState<boolean>(settings.enable_captcha !== false);
  const [captchaCharsCount, setCaptchaCharsCount] = useState(settings.captcha_chars_count || 6);
  const [captchaCharType, setCaptchaCharType] = useState<'digits' | 'alphanumeric'>('digits');
  const [captchaLightColor, setCaptchaLightColor] = useState('FFFFFF');
  const [captchaDarkColor, setCaptchaDarkColor] = useState('FFAB00');

  // موارد رویدادنگاری
  const [logEvents, setLogEvents] = useState({
    login: true,
    logout: true,
    loginFailed: true,
    create: true,
    edit: true,
    delete: true,
    examStart: true,
    examEnd: true,
    userKick: true,
    sendMessage: true,
    sendClassScore: true,
    downloadFile: true
  });

  // --- متن تعهدنامه عدم افشاء (مطابق تصویر 9f19b40d) ---
  const [ndaText, setNdaText] = useState(
    settings.nda_text ||
    `امیدوارم حفظ و رعایت اسرار تجاری نزد کوشندگان اقتصادی و شرکتها و بطور کلی در اقتصاد و بازرگانی و کسب و کار ایران و ایرانی بیش از پیش مورد توجه قرار گیرد و در اسناد و فرایندهای آنان جایگاهی در خور و شایسته پیدا کند.

اینجانب، فرزند به شماره شناسنامه صادره از متولد شناسه (کد) ملی شناسه (کد) پستی به نشانی: که از تاریخ در شرکت (سهامی خاص) بکار مشغول هستم به موجب این سند، اقرار و اذعان می نمایم که به اهمیت و جایگاه حفظ اسرار اداری، صنعتی و تجاری در شرکت (سهامی خاص) آگاه و توجه شده ام و متعهد می گردم که در نهایت رازداری و با عمل به اصول امانت داری، اسرار تجاری، اداری و صنعتی در شرکت (سهامی خاص) را حفظ نمایم و از هر گونه انتشار، انتقال، رونوشت برداری (کپی) بیان و مبادله اطلاعات، اعداد و ارقام مالی، بودجه ای، فرمولهای تولیدی و تجاری شرکت و مشتریان و ذینفعان، اطلاعات مربوط به نوع و میزان و کیفیت مواد اولیه و زمان و محل واردات و صادرات و نگهداری آنها، اطلاعات و آمار و ارقام مربوط به میزان تولید، فروش و سود، هر گونه اطلاعات مربوط به شیوه ها و روشهای بازاریابی، مدیریت، فروش، مدیریت مالی، فناوری، اداری و استخدامی، تعداد و نوع روابط با ذینفعان و مشتریان و تلفن تماس یا رایانامه (ایمیل) یا نشانی آنها، میزان مطالبات یا دیون و سرمایه و دارائی شرکت (سهامی خاص) و کارکنان و مدیران آن، هر گونه اطلاعات مربوط به نوع و کیفیت بسته بندی محصول و فرایندهای خاص راجع به عرضه و توزیع و ارائه محصولات و خدمات، هر گونه اطلاعات (مربوط به شرکت سهامی خاص) مربوط به محتوای مذاکرات پرونده ها و اسناد تجاری و دعاوی قضایی و غیر قضایی، پرونده ها و اسناد تجاری و اداری، تجاری، بانکی، صنعتی، داد و ستدها و رفت و آمدها تحت هر شرایطی به هر شخص غیر مجازی اعم از کارکنان و مدیران و سهامداران پیشین (قبلی) یا کنونی (فعلی) شرکت یا رقبا یا افراد غیر از اینها باشد خودداری نمایم.

آگاه هستم که دسترسی افراد به اطلاعات و اسناد و ارقام و آمار فوق در شرکت (سهامی خاص) دارای محدودیت و سامانه خاص خود می باشد.

آگاه و توجیه شده ام که صرفاً مدیر عامل شرکت (سهامی خاص) و افرادی که از سوی ایشان به گونه کتبی به من معرفی شده باشند به همان میزان که مدیر عامل شرکت (سهامی خاص) تعیین می کند مجاز به دسترسی به اطلاعات و اسناد و ارقام تعیین شده هستند.

تعهد می نمایم که از اطلاعات و اسناد و آماری که به اقتضاء مسئولیت شغلی یا به سبب آن در اختیارم قرار گرفته در قبال هر گونه انتشار یا خطر نابودی و خدشه دار شدن، مراقبت و نگهداری نمایم.

تعهد می نمایم در صورتی که رابطه همکاری من و شرکت (سهامی خاص) به هر دلیلی در هر زمانی پایان پذیرفت نیز ضمن بازگرداندن فوری اسنادی که از شرکت (سهامی خاص) نزد خود دارم اسرار و اطلاعات موصوف در بالا را همچنان محرمانه نگه دارم و از انتشار و انتقال آن به اشخاص غیر مجاز از جمله کارفرمای بعدی خود، پرهیز کنم.

می پذیرم که وجه التزام تخلف از تعهدات بالا به اندازه ده برابر کل حقوق مزایا و وجوهی است که تا تاریخ مطالبه وجه التزام بوسیله شرکت (سهامی خاص) دریافت کرده ام و این علاوه بر حق شرکت (سهامی خاص) برای مطالبه خسارت وارده به خود از طریق مراجع قانونی است.`
  );

  // تنظیمات برندینگ و ذخیره‌سازی
  const [appName, setAppName] = useState(settings.app_name);
  const [orgName, setOrgName] = useState(settings.org_name);
  const [logoUrl, setLogoUrl] = useState(settings.logo_url);
  const [headerSubtitle, setHeaderSubtitle] = useState(settings.header_subtitle);
  const [footerText, setFooterText] = useState(settings.footer_text);
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>(settings.theme_color);
  const [storageDriver, setStorageDriver] = useState<'local' | 'subdomain' | 's3'>('local');

  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSaveSecuritySettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings({
      enable_captcha: enableCaptcha,
      max_login_attempts: maxAttempts,
      lockout_minutes: lockoutMin,
      session_timeout_min: sessionTimeout,
      captcha_chars_count: captchaCharsCount,
      nda_text: ndaText
    });
    triggerRefresh();
    showNotice(
      `تنظیمات امنیتی ذخیره شد. کد امنیتی کپچا اکنون: ${enableCaptcha ? 'فعال' : 'غیرفعال'} می‌باشد.`
    );
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      app_name: appName,
      org_name: orgName,
      logo_url: logoUrl,
      header_subtitle: headerSubtitle,
      footer_text: footerText,
      theme_color: selectedTheme,
      org_slogan: orgSlogan
    });
    triggerRefresh();
    showNotice('مشخصات سازمان، شعار آموزشی و برندینگ با موفقیت ذخیره گردید.');
  };

  const handleCopySqlDump = () => {
    const dump = db.exportSQLDump();
    navigator.clipboard.writeText(dump);
    showNotice('اسکریپت SQL Dump با موفقیت در کلیپ‌بورد کپی شد.');
  };

  const handleResetToDefaults = () => {
    if (confirm('آیا از بازنشانی کامل دیتابیس به مقادیر اولیه کارخانه اطمینان دارید؟ تمام تغییرات اخیر بازنویسی خواهد شد.')) {
      db.resetToFactoryDefaults();
      triggerRefresh();
      showNotice('پایگاه‌داده با داده‌های اولیه کارخانه بازنشانی شد.');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* سربرگ کنترل‌پنل تنظیمات سازمانی */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0288d1]" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              کنترل‌پنل تنظیمات و مدیریت راهبردی سامانه (ControlPanel)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            پیکربندی قوانین امنیتی، کپچا، تعهدنامه، سطوح دسترسی، ورود کاربران از اکسل و کنسول دیتابیس
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
            EORC-LMS · نسخه ۷.۵۰.۰۰.۸۸
          </span>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* نوار تب‌های اختصاصی کنترل‌پنل */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-white text-[#0288d1] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>قوانین امنیتی و کپچا</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('access_control')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'access_control'
              ? 'bg-white text-[#0288d1] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>سطوح دسترسی و مجوزهای سازمانی (RBAC)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('excel_import')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'excel_import'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>ورود پرسنل از فایل اکسل</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nda')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'nda'
              ? 'bg-white text-[#0288d1] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSignature className="w-4 h-4" />
          <span>تعهدنامه عدم افشاء و انتشار مطالب</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'branding'
              ? 'bg-white text-[#0288d1] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>مشخصات سازمان و شعار آموزشی</span>
        </button>
      </div>

      {/* ۱. تب قوانین امنیتی و تنظیمات کپچا (مطابق تصویر 782ab592) */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6 text-xs">
          
          {/* فرم ملاحظات ورود و دسترسی */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>ملاحظات ورود و دسترسی</span>
              <button
                type="button"
                onClick={handleSaveSecuritySettings}
                className="px-4 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded font-bold transition-colors shadow-2xs"
              >
                ذخیره تنظیمات
              </button>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
              <div className="flex items-center gap-2">
                <span>ورود به برنامه از ساعت</span>
                <input
                  type="text"
                  placeholder="08:00"
                  value={loginTimeFrom}
                  onChange={(e) => setLoginTimeFrom(e.target.value)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-mono"
                />
                <span>تا</span>
                <input
                  type="text"
                  placeholder="22:00"
                  value={loginTimeTo}
                  onChange={(e) => setLoginTimeTo(e.target.value)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-mono"
                />
                <span>ممکن باشد.</span>
              </div>

              <div className="flex items-center gap-2">
                <span>در فرم ورود، پس از</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="w-14 px-2 py-1 border border-slate-300 rounded text-center font-mono"
                />
                <span>مرتبه ورود ناموفق، حساب به مدت</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={lockoutMin}
                  onChange={(e) => setLockoutMin(Number(e.target.value))}
                  className="w-14 px-2 py-1 border border-slate-300 rounded text-center font-mono"
                />
                <span>دقیقه قفل شود.</span>
              </div>

              <div className="col-span-full flex items-center gap-2">
                <span>مدت نشست (Session) کاربر</span>
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-mono font-bold"
                />
                <span>دقیقه باشد.</span>
                <span className="text-[11px] text-slate-400">
                  (توجه: تغییر مدت نشست، منجر به خروج اجباری کاربران آنلاین فعلی خواهد شد.)
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={requireProfilePhoto}
                  onChange={(e) => setRequireProfilePhoto(e.target.checked)}
                  className="rounded text-[#0288d1]"
                />
                <span>الزام فراگیر به بارگذاری تصویر پروفایل در صورت عدم وجود</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={directPortalEntry}
                  onChange={(e) => setDirectPortalEntry(e.target.checked)}
                  className="rounded text-[#0288d1]"
                />
                <span>ورود مستقیم کاربران به پرتال آموزش</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-rose-700 font-bold">
                <input
                  type="checkbox"
                  checked={disconnectAllUsers}
                  onChange={(e) => setDisconnectAllUsers(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>قطع ارتباط همه کاربران از سامانه (خروج اضطراری)</span>
              </label>
            </div>
          </div>

          {/* قوانین رمز ورود */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
              قوانین رمز ورود و الزامات پیچیدگی
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="flex items-center gap-2">
                <span>طول رمز باید بین</span>
                <input
                  type="number"
                  value={pwdMinLen}
                  onChange={(e) => setPwdMinLen(Number(e.target.value))}
                  className="w-14 px-2 py-1 border border-slate-300 rounded text-center font-mono"
                />
                <span>تا</span>
                <input
                  type="number"
                  value={pwdMaxLen}
                  onChange={(e) => setPwdMaxLen(Number(e.target.value))}
                  className="w-14 px-2 py-1 border border-slate-300 rounded text-center font-mono"
                />
                <span>کاراکتر باشد.</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold">استفاده از:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={pwdRequireDigits} onChange={(e) => setPwdRequireDigits(e.target.checked)} />
                  <span>اعداد</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={pwdRequireLower} onChange={(e) => setPwdRequireLower(e.target.checked)} />
                  <span>حروف کوچک</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={pwdRequireUpper} onChange={(e) => setPwdRequireUpper(e.target.checked)} />
                  <span>حروف بزرگ</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={pwdRequireSpecial} onChange={(e) => setPwdRequireSpecial(e.target.checked)} />
                  <span>علائم مجاز (!@#$%)</span>
                </label>
              </div>
            </div>
          </div>

          {/* بخش کلیدی: ساختار عبارت امنیتی کپچا (CAPTCHA) */}
          <div className="space-y-3 pt-3 border-t-2 border-[#0288d1]/30 bg-sky-50/40 p-4 rounded-xl border">
            <div className="flex items-center justify-between pb-2 border-b border-sky-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0288d1]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  ساختار عبارت امنیتی کپچا (CAPTCHA) در صفحه ورود
                </h3>
              </div>

              {/* چک‌باکس فعال‌سازی/غیرفعال‌سازی کپچا */}
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-sky-300 shadow-2xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={enableCaptcha}
                  onChange={(e) => setEnableCaptcha(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0288d1] accent-[#0288d1]"
                />
                <span>به صورت پیش‌فرض در صفحه ورود فعال باشد</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-700">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">تعداد کاراکترها:</label>
                <input
                  type="number"
                  min="4"
                  max="8"
                  value={captchaCharsCount}
                  onChange={(e) => setCaptchaCharsCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">نوع کاراکترها:</label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="charType"
                      checked={captchaCharType === 'digits'}
                      onChange={() => setCaptchaCharType('digits')}
                    />
                    <span>عدد</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="charType"
                      checked={captchaCharType === 'alphanumeric'}
                      onChange={() => setCaptchaCharType('alphanumeric')}
                    />
                    <span>حرف و عدد</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">رنگ ناحیه روشن:</label>
                <input
                  type="text"
                  value={captchaLightColor}
                  onChange={(e) => setCaptchaLightColor(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-center uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">رنگ ناحیه تاریک:</label>
                <input
                  type="text"
                  value={captchaDarkColor}
                  onChange={(e) => setCaptchaDarkColor(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-center uppercase"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              * در صورت غیرفعال کردن تیک بالا، فراگیران و پرسنل بدون نیاز به وارد کردن کد کپچا و مستقیماً با «کد پرسنلی» و رمز عبور وارد سامانه می‌شوند.
            </p>
          </div>

          {/* موارد رویدادنگاری (Audit Logging Events) */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
              موارد رویدادنگاری (ثبت گزارش فعالیت‌های پرسنل)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 text-slate-700">
              {[
                { key: 'login', label: 'ورود کاربر' },
                { key: 'logout', label: 'خروج کاربر' },
                { key: 'loginFailed', label: 'ورود ناموفق کاربر' },
                { key: 'create', label: 'جدید' },
                { key: 'edit', label: 'ویرایش' },
                { key: 'delete', label: 'حذف' },
                { key: 'examStart', label: 'آغاز آزمون' },
                { key: 'examEnd', label: 'پایان آزمون' },
                { key: 'userKick', label: 'اخراج کاربر' },
                { key: 'sendMessage', label: 'ارسال پیغام' },
                { key: 'sendClassScore', label: 'ارسال نمره کلاس' },
                { key: 'downloadFile', label: 'دانلود فایل' }
              ].map((ev) => (
                <label key={ev.key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(logEvents as any)[ev.key]}
                    onChange={(e) => setLogEvents({ ...logEvents, [ev.key]: e.target.checked })}
                    className="rounded text-[#0288d1]"
                  />
                  <span>{ev.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSaveSecuritySettings}
              className="px-6 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره تغییرات امنیتی و کپچا</span>
            </button>
          </div>
        </div>
      )}

      {/* ۲. تب سطوح دسترسی و مجوزهای سازمانی (RBAC) */}
      {activeTab === 'access_control' && (
        <div className="space-y-4">
          <PermissionsMatrix />
        </div>
      )}

      {/* ۳. تب ورود پرسنل از فایل اکسل */}
      {activeTab === 'excel_import' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <ExcelUserImport onSuccess={() => showNotice('کاربران فایل اکسل به سیستم اضافه شدند.')} />
        </div>
      )}

      {/* ۴. تب تعهدنامه عدم افشاء و انتشار مطالب (مطابق تصویر 9f19b40d) */}
      {activeTab === 'nda' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">متن رسمی تعهدنامه عدم افشاء و انتشار مطالب</h3>
              <p className="text-slate-500 text-[11px]">الزام فراگیران به مطالعه و تایید قبل از ورود به آزمون‌ها و دوره‌ها</p>
            </div>
            <button
              type="button"
              onClick={() => {
                updateSettings({ nda_text: ndaText });
                triggerRefresh();
                showNotice('متن تعهدنامه عدم افشاء با موفقیت ذخیره گردید.');
              }}
              className="px-5 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded font-bold shadow-2xs"
            >
              ذخیره تعهدنامه
            </button>
          </div>

          <textarea
            rows={16}
            value={ndaText}
            onChange={(e) => setNdaText(e.target.value)}
            className="w-full p-4 border border-slate-300 rounded-xl leading-relaxed text-slate-800 text-xs font-sans outline-none focus:border-[#0288d1] focus:ring-1 focus:ring-[#0288d1]"
          />
        </div>
      )}

      {/* ۶. تب مشخصات سازمان و ذخیره‌سازی */}
      {activeTab === 'branding' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5 text-xs">
          <form onSubmit={handleSaveBranding} className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              مشخصات سازمان و عناوین سربرگ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نام سامانه:</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نام سازمان / شرکت:</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">زیرعنوان سربرگ:</label>
                <input
                  type="text"
                  value={headerSubtitle}
                  onChange={(e) => setHeaderSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">متن پانویس (فوتر):</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  شعار آموزشی صفحه پیشخوان (نمایش در نوار سبز رنگ بالای داشبورد):
                </label>
                <input
                  type="text"
                  value={orgSlogan}
                  onChange={(e) => setOrgSlogan(e.target.value)}
                  placeholder="مثال: آموزش مداوم، تعالی سازمانی و ارتقای شایستگی‌های تخصصی صنعت نفت"
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-slate-900 bg-emerald-50/20 font-bold text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  این متن مستقیماً در نوار سبز رنگ بالای پیشخوان تمامی کاربران و مدیران نمایش داده می‌شود.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg font-bold shadow-2xs"
              >
                ذخیره مشخصات سازمان
              </button>
            </div>
          </form>

          {/* مخزن نگهداری فایل‌ها */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#0288d1]" />
              <span>مخزن ذخیره‌سازی فایل‌ها و رسانه‌های آموزشی (Storage Vault)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setStorageDriver('local')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  storageDriver === 'local' ? 'border-[#0288d1] bg-sky-50/50 shadow-xs' : 'border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 mb-1">حافظه محلی هاست (cPanel / Server)</div>
                <p className="text-[11px] text-slate-500">ذخیره مستقیم در دایرکتوری public_html/uploads هاست</p>
              </div>

              <div
                onClick={() => setStorageDriver('subdomain')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  storageDriver === 'subdomain' ? 'border-[#0288d1] bg-sky-50/50 shadow-xs' : 'border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 mb-1">هاست دانلود مجزا (Subdomain)</div>
                <p className="text-[11px] text-slate-500">ارسال ویدیوهای سنگین به ساب‌دامین اختصاصی dl.domain.ir</p>
              </div>

              <div
                onClick={() => setStorageDriver('s3')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  storageDriver === 's3' ? 'border-[#0288d1] bg-sky-50/50 shadow-xs' : 'border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 mb-1">استوریج ابری S3 / MinIO</div>
                <p className="text-[11px] text-slate-500">ذخیره در مخازن آبجکت استوریج با توکن‌های امن موقت</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
