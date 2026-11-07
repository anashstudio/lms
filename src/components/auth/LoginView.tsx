import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SecurityCaptcha, SecurityCaptchaRef } from './SecurityCaptcha';
import {
  Shield,
  Lock,
  User as UserIcon,
  CreditCard,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Flame,
  KeyRound,
  FileText
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, settings } = useApp();

  const isCaptchaEnabled = settings.enable_captcha !== false;

  // شیوه ورود: اولویت با کد پرسنلی، کد ملی و نام کاربری
  const [loginMethod, setLoginMethod] = useState<'employee_id' | 'national_id' | 'username'>('employee_id');
  const [identifier, setIdentifier] = useState('965505');
  const [password, setPassword] = useState('Admin@123456');
  const [captchaInput, setCaptchaInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [recoveryNationalId, setRecoveryNationalId] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'success'>('idle');

  const captchaRef = useRef<SecurityCaptchaRef>(null);

  // شمارش معکوس قفل امنیتی در صورت تلاش‌های مکرر ناموفق
  useEffect(() => {
    let interval: any;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lockoutTimer > 0) {
      setErrorMessage(`به دلیل تلاش‌های مکرر ناموفق، حساب برای ${lockoutTimer} ثانیه موقتاً قفل است.`);
      return;
    }

    if (!identifier.trim()) {
      setErrorMessage(
        loginMethod === 'employee_id'
          ? 'لطفاً کد پرسنلی را وارد نمایید.'
          : loginMethod === 'national_id'
          ? 'لطفاً کد ملی ۱۰ رقمی را وارد نمایید.'
          : 'لطفاً نام کاربری را وارد نمایید.'
      );
      return;
    }

    if (loginMethod === 'national_id' && !/^\d{10}$/.test(identifier.trim())) {
      setErrorMessage('کد ملی باید دقیقاً ۱۰ رقم عددی باشد.');
      return;
    }

    if (!password) {
      setErrorMessage('لطفاً رمز عبور را وارد نمایید.');
      return;
    }

    // تایید اعتبار کپچای ضد ربات (فقط در صورت فعال بودن در تنظیمات)
    if (isCaptchaEnabled) {
      if (!captchaInput.trim()) {
        setErrorMessage('لطفاً کد امنیتی کپچا را وارد فرمایید.');
        return;
      }

      const isCaptchaValid = captchaRef.current?.verify(captchaInput);
      if (!isCaptchaValid) {
        setErrorMessage('کد امنیتی (کپچا) نامعتبر است. لطفاً کد جدید را وارد نمایید.');
        captchaRef.current?.refresh();
        setCaptchaInput('');
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password, rememberMe);
      setIsLoading(false);

      if (!res.success) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 4) {
          setLockoutTimer(30);
          setErrorMessage('به دلیل بیش از ۳ بار تلاش ناموفق، دسترسی برای ۳۰ ثانیه محدود شد.');
        } else {
          setErrorMessage(res.error || 'کد پرسنلی یا رمز عبور اشتباه است.');
        }

        // تولید کد جدید کپچا بعد از شکست لاگین
        if (isCaptchaEnabled) {
          captchaRef.current?.refresh();
          setCaptchaInput('');
        }
      } else {
        setFailedAttempts(0);
      }
    }, 400);
  };

  // پر کردن خودکار جهت تست و بررسی سریع مدیران
  const fillPreset = (userType: 'admin' | 'manager' | 'instructor' | 'learner') => {
    setErrorMessage(null);
    if (userType === 'admin') {
      if (loginMethod === 'employee_id') setIdentifier('965505');
      else if (loginMethod === 'username') setIdentifier('admin');
      else setIdentifier('0078912345');
      setPassword('Admin@123456');
    } else if (userType === 'manager') {
      if (loginMethod === 'employee_id') setIdentifier('965744');
      else if (loginMethod === 'username') setIdentifier('s.sadeghi');
      else setIdentifier('0065432198');
      setPassword('Manager@123');
    } else if (userType === 'instructor') {
      if (loginMethod === 'employee_id') setIdentifier('964819');
      else if (loginMethod === 'username') setIdentifier('a.mahdavi');
      else setIdentifier('0054321678');
      setPassword('Teacher@123');
    } else {
      if (loginMethod === 'employee_id') setIdentifier('965780');
      else if (loginMethod === 'username') setIdentifier('m.rezaei');
      else setIdentifier('0043218765');
      setPassword('User@123');
    }

    // همگام‌سازی کپچا برای راحتی تست
    if (isCaptchaEnabled) {
      setTimeout(() => {
        if (captchaRef.current) {
          setCaptchaInput(captchaRef.current.getCode());
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c4a6e] via-[#0284c7] to-[#0369a1] flex flex-col justify-between p-4 sm:p-6 text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-900">
      
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between text-white py-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Flame className="w-7 h-7 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight">{settings.org_name || 'شرکت پالایش نفت اصفهان'}</h1>
            <p className="text-xs text-sky-100 font-medium">{settings.app_name || 'سامانه یادگیری و آزمون الکترونیکی'}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-mono text-sky-100">
          <Shield className="w-3.5 h-3.5 text-emerald-300" />
          <span>امنیت هسته: فعال (کپچا + تفکیک کد ملی)</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md w-full mx-auto my-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#0288d1] to-[#01579b] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-md">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-lg font-black">ورود به سامانه یادگیری و آزمون</h2>
          <p className="text-xs text-sky-100 mt-1">احراز هویت دومنظوره پرسنل و فراگیران سازمانی</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* شیوه ورود: اولویت با کد پرسنلی */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              شیوه شناسایی و ورود به سامانه:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('employee_id');
                  setIdentifier('965505');
                  setErrorMessage(null);
                }}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all ${
                  loginMethod === 'employee_id'
                    ? 'bg-white text-[#0288d1] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-[#0288d1]" />
                <span>کد پرسنلی</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('national_id');
                  setIdentifier('0078912345');
                  setErrorMessage(null);
                }}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all ${
                  loginMethod === 'national_id'
                    ? 'bg-white text-[#0288d1] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>کد ملی</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('username');
                  setIdentifier('admin');
                  setErrorMessage(null);
                }}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all ${
                  loginMethod === 'username'
                    ? 'bg-white text-[#0288d1] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>نام کاربری</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* فیلد ورودی شناسه کاربری */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  {loginMethod === 'employee_id' ? (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-[#0288d1]" />
                      <span>کد پرسنلی (Employee ID)</span>
                    </>
                  ) : loginMethod === 'national_id' ? (
                    <>
                      <FileText className="w-3.5 h-3.5 text-[#0288d1]" />
                      <span>کد ملی ۱۰ رقمی (National ID)</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-3.5 h-3.5 text-[#0288d1]" />
                      <span>نام کاربری سازمانی (Username)</span>
                    </>
                  )}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {loginMethod === 'employee_id'
                    ? 'ارقام کد پرسنلی'
                    : loginMethod === 'national_id'
                    ? '۱۰ رقم بدون خط تیره'
                    : 'حروف یا ارقام لاتین'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={loginMethod === 'username' ? 'text' : 'tel'}
                  dir="ltr"
                  maxLength={loginMethod === 'national_id' ? 10 : 30}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    loginMethod === 'employee_id'
                      ? 'کد پرسنلی را وارد نمایید (مثال: 965505)'
                      : loginMethod === 'national_id'
                      ? 'کد ملی ۱۰ رقمی (مثال: 0078912345)'
                      : 'نام کاربری (مثال: admin)'
                  }
                  disabled={lockoutTimer > 0 || isLoading}
                  className="w-full text-left font-mono font-bold text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20 outline-none transition-all placeholder:text-slate-400 placeholder:font-sans bg-slate-50/50"
                  required
                />
              </div>
            </div>

            {/* رمز عبور */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0288d1]" />
                  <span>رمز عبور (Password)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[11px] text-[#0288d1] hover:underline"
                >
                  فراموشی رمز؟
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={lockoutTimer > 0 || isLoading}
                  className="w-full text-left font-mono text-sm px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* کد امنیتی ضد ربات (CAPTCHA) - وابسته به تنظیمات سیستم */}
            {isCaptchaEnabled ? (
              <div className="pt-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>کد امنیتی ضد ربات (CAPTCHA)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">حساس به حروف بزرگ و کوچک نیست</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={6}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    placeholder="کد کپچا"
                    disabled={lockoutTimer > 0 || isLoading}
                    className="w-32 text-center uppercase font-mono tracking-widest font-black text-base px-3 py-2 rounded-xl border border-slate-300 focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20 outline-none transition-all placeholder:text-xs placeholder:tracking-normal placeholder:font-normal bg-slate-50/50"
                    required
                  />
                  <SecurityCaptcha ref={captchaRef} length={5} className="flex-1 justify-end" />
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>اعتبارسنجی کپچا:</span>
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                  ورود مستقیم بدون کپچا (غیرفعال در تنظیمات)
                </span>
              </div>
            )}

            {/* مرا به خاطر بسپار */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0288d1] focus:ring-[#0288d1]"
                />
                <span>مرا در این رایانه به خاطر بسپار</span>
              </label>
            </div>

            {/* پیام خطا */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* هشدار قفل موقت */}
            {lockoutTimer > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 text-xs">
                <span className="flex items-center gap-2 font-bold">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>قفل امنیتی ضد نفوذ:</span>
                </span>
                <span className="font-mono font-black text-sm bg-amber-200 px-2 py-0.5 rounded">
                  {lockoutTimer} ثانیه
                </span>
              </div>
            )}

            {/* دکمه ورود */}
            <button
              type="submit"
              disabled={isLoading || lockoutTimer > 0}
              className={`w-full py-3 px-4 rounded-xl font-black text-sm text-white shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 ${
                isLoading || lockoutTimer > 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0288d1] to-[#0277bd] hover:from-[#0277bd] hover:to-[#01579b] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال بررسی اعتبار و مجوزها...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>ورود امن به سامانه</span>
                </>
              )}
            </button>
          </form>

          {/* نوار انتخاب سریع کاربران دمو (Quick autofill for evaluation) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>حساب‌های پیش‌فرض تست و ارزیابی:</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillPreset('admin')}
                className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-right transition-colors flex items-center justify-between"
              >
                <span>مدیر سیستم (Admin)</span>
                <span className="text-[10px] text-rose-600 font-mono font-bold">965505</span>
              </button>

              <button
                type="button"
                onClick={() => fillPreset('manager')}
                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-right transition-colors flex items-center justify-between"
              >
                <span>مدیر آموزش (Manager)</span>
                <span className="text-[10px] text-amber-600 font-mono font-bold">965744</span>
              </button>

              <button
                type="button"
                onClick={() => fillPreset('instructor')}
                className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-right transition-colors flex items-center justify-between"
              >
                <span>مدرس (Instructor)</span>
                <span className="text-[10px] text-sky-600 font-mono font-bold">964819</span>
              </button>

              <button
                type="button"
                onClick={() => fillPreset('learner')}
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-right transition-colors flex items-center justify-between"
              >
                <span>فراگیر (Learner)</span>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">965780</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-100 p-3 text-center text-[11px] text-slate-500">
          <span>استاندارد ایزو ۱۰۰۱۵ · مجهز به الگوریتم اعتبارسنجی کپچا و حفاظت در برابر Brute-force</span>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-sky-100/80 py-2">
        <p>{settings.footer_text || 'مدیریت یکپارچه آموزش و یادگیری سازمانی. کلیه حقوق محفوظ است.'}</p>
      </footer>

      {/* Password Recovery Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#0288d1]" />
              <span>بازیابی رمز عبور سازمانی</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              جهت بازیابی رمز عبور، کد ملی ۱۰ رقمی ثبت‌شده در پرونده پرسنلی خود را وارد نمایید تا رمز موقت برای شماره همراه متصل پیامک گردد.
            </p>

            {recoveryStatus === 'success' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs mb-4">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>درخواست بازیابی ثبت شد</span>
                </p>
                <p>
                  در محیط دمو، رمز عبور پیش‌فرض مدیران <code className="font-mono font-bold">Admin@123456</code> و سایر پرسنل <code className="font-mono font-bold">User@123</code> می‌باشد.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد ملی ۱۰ رقمی:</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={recoveryNationalId}
                    onChange={(e) => setRecoveryNationalId(e.target.value)}
                    placeholder="مثال: 0078912345"
                    className="w-full font-mono text-center text-sm px-3 py-2 rounded-xl border border-slate-300 focus:border-[#0288d1] outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setRecoveryStatus('idle');
                  setRecoveryNationalId('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                بستن
              </button>
              {recoveryStatus !== 'success' && (
                <button
                  type="button"
                  onClick={() => {
                    if (recoveryNationalId.length === 10) {
                      setRecoveryStatus('success');
                    }
                  }}
                  disabled={recoveryNationalId.length !== 10}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0288d1] hover:bg-sky-700 text-white disabled:opacity-50"
                >
                  ارسال پیامک بازیابی
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
