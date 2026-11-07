import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import { ThemeColor } from '../../types/models';
import { 
  Database, 
  CheckCircle2, 
  Settings, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  Server,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, triggerRefresh } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [dbEngine, setDbEngine] = useState<'PostgreSQL Compatible' | 'SQLite Relational' | 'MySQL Compatible'>(
    settings.db_engine || 'PostgreSQL Compatible'
  );
  const [appName, setAppName] = useState(settings.app_name || 'سامانه مدیریت یادگیری صدرا');
  const [orgName, setOrgName] = useState(settings.org_name || 'سازمان توسعه و آموزش منابع انسانی صدرا');
  const [adminName, setAdminName] = useState('مهندس آرش رادمنش');
  const [adminEmail, setAdminEmail] = useState(settings.admin_email || 'admin@sadra-lms.ir');
  const [adminNationalId, setAdminNationalId] = useState('0078912345');
  const [adminPhone, setAdminPhone] = useState('09121112233');
  const [themeColor, setThemeColor] = useState<ThemeColor>(settings.theme_color || 'emerald');
  const [seedDemoData, setSeedDemoData] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationSuccess, setInstallationSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFinishInstallation = () => {
    setIsInstalling(true);
    setTimeout(() => {
      db.initializeSetup({
        app_name: appName,
        org_name: orgName,
        admin_name: adminName,
        admin_email: adminEmail,
        admin_national_id: adminNationalId,
        admin_phone: adminPhone,
        theme_color: themeColor,
        db_engine: dbEngine,
        seed_demo_data: seedDemoData
      });
      setIsInstalling(false);
      setInstallationSuccess(true);
      triggerRefresh();
    }, 1200);
  };

  const colorsList: { id: ThemeColor; name: string; bg: string }[] = [
    { id: 'emerald', name: 'زمردی سازمانی', bg: 'bg-emerald-600' },
    { id: 'blue', name: 'آبی رسمی', bg: 'bg-blue-600' },
    { id: 'indigo', name: 'نیلی مدرن', bg: 'bg-indigo-600' },
    { id: 'violet', name: 'بنفش فاخر', bg: 'bg-violet-600' },
    { id: 'amber', name: 'کهربایی پویا', bg: 'bg-amber-600' },
    { id: 'slate', name: 'سربی فنی', bg: 'bg-slate-800' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ویزارد نصب و راه‌اندازی اولیه سامانه مدیریت یادگیری
              </h2>
              <p className="text-xs text-slate-500">
                پیکربندی پایگاه‌داده رابطه‌ای SQL، چرخه کیفیت آموزش و الگوهای سنجش اثربخشی
              </p>
            </div>
          </div>
          {settings.is_installed && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          {[
            { num: 1, title: 'اتصال دیتابیس SQL' },
            { num: 2, title: 'هویت سامانه و مدیر' },
            { num: 3, title: 'چرخه کیفیت آموزش' },
            { num: 4, title: 'نصب و بهره‌برداری' }
          ].map(step => (
            <div key={step.num} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === step.num
                    ? 'bg-emerald-600 text-white'
                    : currentStep > step.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.num}
              </div>
              <span className={currentStep === step.num ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {}
        <div className="p-6">
          {installationSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                پیکربندی و نصب با موفقیت انجام شد!
              </h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                تمام جدول‌های رابطه‌ای در موتور {dbEngine} ایجاد گردید و ساختار چرخه کیفیت آموزش به همراه شاخص‌های ارزیابی اثربخشی مستقر شدند.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  ورود به پیشخوان سامانه
                </button>
              </div>
            </div>
          ) : (
            <>
              {}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      انتخاب موتور و مشخصات پایگاه‌داده SQL
                    </h3>
                    <p className="text-xs text-slate-500">
                      سامانه بر مبنای ساختار رابطه‌ای نرمال طراحی شده و کدهای DDL آن با تمامی سیستم‌های مدیریت پایگاه داده استاندارد سازگار است.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'PostgreSQL Compatible', label: 'PostgreSQL 14+', desc: 'مناسب سازمان‌های بزرگ و خوشه‌های ابری' },
                      { id: 'SQLite Relational', label: 'SQLite 3 (محلی/وب)', desc: 'بدون نیاز به سرور جداگانه، سریع و سبک' },
                      { id: 'MySQL Compatible', label: 'MySQL 8 / MariaDB', desc: 'پایگاه‌داده رابطه‌ای متداول سازمانی' }
                    ].map(engine => (
                      <div
                        key={engine.id}
                        onClick={() => setDbEngine(engine.id as any)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          dbEngine === engine.id
                            ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-slate-800">
                          <Server className="w-4 h-4 text-emerald-600" />
                          <span>{engine.label}</span>
                        </div>
                        <p className="text-xs text-slate-500">{engine.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                    <div className="text-slate-500">جداول شناسایی شده جهت ایجاد خودکار:</div>
                    <div className="text-emerald-700 font-semibold">
                      CREATE TABLE: system_settings, users, courses, lessons, resources, enrollments, exams, questions, exam_attempts, kirkpatrick_evaluations, tna_records, certificates, audit_logs.
                    </div>
                  </div>
                </div>
              )}

              {}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      هویت سامانه و حساب مدیر ارشد (Super Admin)
                    </h3>
                    <p className="text-xs text-slate-500">
                      این اطلاعات در سربرگ، گواهینامه‌ها و گزارشات ممیزی استاندارد ایزو ۱۰۰۱۵ درج خواهند شد.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">نام سامانه آموزشی (LMS)</label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">نام سازمان / شرکت</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">نام و نام خانوادگی مدیر ارشد</label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">ایمیل مدیر ارشد</label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">کد ملی مدیر ارشد</label>
                      <input
                        type="text"
                        value={adminNationalId}
                        onChange={(e) => setAdminNationalId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">شماره تماس مدیر ارشد</label>
                      <input
                        type="text"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {}
                  <div>
                    <label className="block text-slate-700 font-medium mb-2 text-xs">رنگ سازمانی و قالب پیش‌فرض</label>
                    <div className="flex flex-wrap gap-2">
                      {colorsList.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setThemeColor(c.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            themeColor === c.id
                              ? 'border-slate-800 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      فرآیند چرخه کیفیت آموزش و الگوهای ارزیابی اثربخشی
                    </h3>
                    <p className="text-xs text-slate-500">
                      پیکربندی چرخه ۴ مرحله‌ای توسعه شایستگی و فرم‌های ارزیابی اثربخشی آموزش.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">چرخه مدیریت کیفیت و شایستگی شغلی</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          شامل فرم‌های نیازسنجی شایستگی (TNA)، طراحی و برنامه‌ریزی تقویم، اجرای کلاس‌های آفلاین و ممیزی فرآیند.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                      <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">روش ارزیابی ۴ مرحله‌ای اثربخشی آموزش</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          مرحله ۱ (واکنش و رضایت)، مرحله ۲ (رشد یادگیری و آزمون)، مرحله ۳ (تغییر رفتار در محیط کار)، مرحله ۴ (نتایج کسب‌وکار و بازگشت سرمایه).
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-medium">
                        <input
                          type="checkbox"
                          checked={seedDemoData}
                          onChange={(e) => setSeedDemoData(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                        />
                        <span>بارگذاری داده‌های اولیه و نمونه استاندارد (دوره‌ها، ویدئوهای آفلاین، بانک سوالات و آزمون‌ها)</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mr-6 mt-0.5">
                        توصیه می‌شود جهت آشنایی با امکانات سیستم و چرخه کامل، این گزینه فعال باشد.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {}
              {currentStep === 4 && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    آماده ایجاد جداول دیتابیس و اجرای نهایی
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    تمام تنظیمات آماده است. با کلیک بر روی دکمه زیر، ساختار پایگاه‌داده رابطه‌ای ایجاد شده و دسترسی ۴ نقش کاربری پیکربندی می‌گردد.
                  </p>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 text-right space-y-1.5 max-w-md mx-auto">
                    <div><strong>نام سامانه:</strong> {appName}</div>
                    <div><strong>موتور دیتابیس:</strong> {dbEngine}</div>
                    <div><strong>مدیر ارشد:</strong> {adminName} ({adminEmail})</div>
                    <div><strong>داده‌های نمونه:</strong> {seedDemoData ? 'فعال (پیشنهادی)' : 'خام و خالی'}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {}
        {!installationSuccess && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <span>مرحله بعد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isInstalling}
                onClick={handleFinishInstallation}
                className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {isInstalling ? (
                  <span>درحال اجرای دستورات ساخت دیتابیس...</span>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>تایید و راه‌اندازی سامانه</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
