import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import { ThemeColor } from '../../types/models';
import {
  Palette,
  ShieldAlert,
  Save,
  CheckCircle,
  Building2,
  Image,
  Upload,
  Sparkles,
  RotateCcw,
  GraduationCap
} from 'lucide-react';

export const SuperAdminAppearance: React.FC = () => {
  const { settings, updateSettings, activeRole, triggerRefresh } = useApp();

  if (activeRole !== 'super_admin') {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-8 text-center max-w-lg mx-auto my-12 space-y-3">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">دسترسی محدود به مدیر ارشد (Super Admin)</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          تنظیمات ظاهری، تغییر نام نرم‌افزار، لوگو و تم رنگی اختصاصاً در اختیار مدیر ارشد سامانه است. جهت تست، می‌توانید از منوی بالای صفحه نقش خود را به «مدیر ارشد» تغییر دهید.
        </p>
      </div>
    );
  }

  const [appName, setAppName] = useState(settings.app_name);
  const [orgName, setOrgName] = useState(settings.org_name);
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '');
  const [themeColor, setThemeColor] = useState<ThemeColor>(settings.theme_color);
  const [headerSubtitle, setHeaderSubtitle] = useState(settings.header_subtitle || '');
  const [footerText, setFooterText] = useState(settings.footer_text || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = THEME_CONFIGS[themeColor] || THEME_CONFIGS.emerald;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      app_name: appName,
      org_name: orgName,
      logo_url: logoUrl,
      theme_color: themeColor,
      header_subtitle: headerSubtitle,
      footer_text: footerText
    });
    setSavedSuccess(true);
    triggerRefresh();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const colorsList: { id: ThemeColor; name: string; bg: string; border: string }[] = [
    { id: 'emerald', name: 'زمردی سازمانی (پیش‌فرض استاندارد)', bg: 'bg-emerald-600', border: 'border-emerald-600' },
    { id: 'blue', name: 'آبی سرمه‌ای رسمی', bg: 'bg-blue-600', border: 'border-blue-600' },
    { id: 'indigo', name: 'نیلی مدرن', bg: 'bg-indigo-600', border: 'border-indigo-600' },
    { id: 'violet', name: 'بنفش سلطنتی', bg: 'bg-violet-600', border: 'border-violet-600' },
    { id: 'amber', name: 'کهربایی پویا', bg: 'bg-amber-600', border: 'border-amber-600' },
    { id: 'slate', name: 'سربی فنی و صنعتی', bg: 'bg-slate-800', border: 'border-slate-800' }
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-slate-800" />
          <h1 className="text-xl font-bold text-slate-900">
            شخصی‌سازی ظاهری، نام نرم‌افزار و برندینگ (White-Labeling)
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          تنظیمات هویت سازمانی، لوگوی رسمی، پالت رنگ و عناوین سربرگ سامانه (مختص مدیر ارشد)
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs">
          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                نام اختصاصی نرم‌افزار / سامانه (LMS) *
              </label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                placeholder="مثال: سامانه مدیریت یادگیری صدرا"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                این عنوان در سربرگ، عنوان تب مرورگر و صفحات کاربری نمایش داده می‌شود.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                نام رسمی سازمان یا شرکت *
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                placeholder="مثال: سازمان توسعه و آموزش منابع انسانی صدرا"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                در گواهینامه‌های رسمی ایزو ۱۰۰۱۵ و پاورقی درج می‌گردد.
              </span>
            </div>
          </div>

          {}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-bold mb-1.5">
              لوگوی اختصاصی سامانه
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className={`w-14 h-14 rounded-xl ${theme.primary} flex items-center justify-center text-white shadow-sm shrink-0 overflow-hidden`}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1 bg-white" />
                ) : (
                  <GraduationCap className="w-7 h-7" />
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="آدرس اینترنتی مستقیم لوگو (URL)..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none font-mono text-[11px]"
                />
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>بارگذاری تصویر لوگو</span>
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-slate-500 hover:text-rose-600 font-medium underline"
                    >
                      حذف و بازگشت به آیکون پیش‌فرض
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-bold mb-2">
              پالت رنگ اصلی و پوسته سامانه
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {colorsList.map(c => {
                const isSelected = themeColor === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setThemeColor(c.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800 shadow-sm font-bold text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${c.bg} shrink-0`} />
                    <span className="flex-1">{c.name}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-slate-900" />}
                  </div>
                );
              })}
            </div>
          </div>

          {}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                زیرنویس توضیحی سربرگ
              </label>
              <input
                type="text"
                value={headerSubtitle}
                onChange={(e) => setHeaderSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                متن حق کپی‌رایت و پاورقی سامانه
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>تنظیمات ظاهری و برندینگ سامانه با موفقیت در دیتابیس ذخیره شد.</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات ظاهری</span>
            </button>
          </div>
        </div>

        {}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              پیش‌نمایش زنده سربرگ با تنظیمات جدید
            </h3>

            {}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-inner bg-slate-50">
              <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate">
                  <div className={`w-8 h-8 rounded-lg ${theme.primary} flex items-center justify-center text-white shrink-0`}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                    ) : (
                      <GraduationCap className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-bold text-slate-900 truncate">{appName}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${theme.badge}`}>
                  {themeColor}
                </span>
              </div>
              <div className="p-3 text-[11px] text-slate-500">
                <div>سازمان: <strong className="text-slate-800">{orgName}</strong></div>
                <div className="mt-1">{headerSubtitle}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div><strong>نکته امنیتی:</strong> این تب فقط توسط مدیر ارشد قابل مشاهده است.</div>
              <div>سایر نقش‌ها (مدرسین، مدیران کلاس و فراگیران) ظاهر یکدست سازمانی را بدون امکان دستکاری مشاهده می‌کنند.</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
