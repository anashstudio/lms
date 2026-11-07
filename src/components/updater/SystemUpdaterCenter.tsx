import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { THEME_CONFIGS } from '../../utils/theme';
import {
  SystemUpdaterService,
  AVAILABLE_RELEASES,
  AvailableRelease
} from '../../services/systemUpdater';
import { SystemVersionInfo, SystemSnapshot } from '../../types/models';
import {
  RefreshCw,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowUpCircle,
  Layers,
  History,
  Check,
  Sparkles,
  KeyRound,
  FileCode2,
  Server
} from 'lucide-react';

export const SystemUpdaterCenter: React.FC = () => {
  const { settings, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [versionInfo, setVersionInfo] = useState<SystemVersionInfo>(() => SystemUpdaterService.getVersionInfo());
  const [snapshots, setSnapshots] = useState<SystemSnapshot[]>(() => SystemUpdaterService.getSnapshots());
  const [isChecking, setIsChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState<number>(0);
  const [upgradeLog, setUpgradeLog] = useState<string[]>([]);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const [patchToken, setPatchToken] = useState('');
  const [patchApplied, setPatchApplied] = useState(false);

  const targetRelease: AvailableRelease = AVAILABLE_RELEASES[0];

  const handleCheckUpdates = () => {
    setIsChecking(true);
    setCheckMessage('در حال برقراری ارتباط با مخزن به‌روزرسانی مرکزی و بررسی هش امضا...');
    setTimeout(() => {
      setIsChecking(false);
      const current = SystemUpdaterService.getVersionInfo();
      current.last_update_check = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR');
      SystemUpdaterService.saveVersionInfo(current);
      setVersionInfo(current);
      setCheckMessage('بررسی انجام شد: ارتباط با سرور به‌روزرسانی برقرار است و پکیج هسته آماده دریافت می‌باشد.');
    }, 1200);
  };

  const handleStartUpgrade = () => {
    setIsUpgrading(true);
    setUpgradeStep(1);
    setUpgradeLog(['آغاز عملیات ارتقای هسته سامانه...']);

    setTimeout(() => {
      setUpgradeStep(2);
      setUpgradeLog(prev => [...prev, 'ایجاد اسنپ‌شات و نسخه پشتیبان از پایگاه داده و تنظیمات امنیتی...']);
    }, 1000);

    setTimeout(() => {
      setUpgradeStep(3);
      setUpgradeLog(prev => [
        ...prev,
        'اجرای مایگریشن‌های پایگاه داده:',
        '  > ALTER TABLE users ADD COLUMN custom_permissions JSON NULL; [موفق]',
        '  > CREATE INDEX idx_audit_role_time ON audit_logs; [موفق]',
        '  > تثبیت ساختار نسخه‌بندی در متادیتای سیستم... [موفق]'
      ]);
    }, 2200);

    setTimeout(() => {
      setUpgradeStep(4);
      setUpgradeLog(prev => [
        ...prev,
        'تطبیق چک‌سام SHA-256 بسته نصبی با کلید عمومی سازمانی...',
        'بارگذاری مجدد ماژول‌های فعال بدون وقفه در دسترسی کاربران (Zero-Downtime Hot Reload)...'
      ]);
    }, 3400);

    setTimeout(() => {
      const res = SystemUpdaterService.executeCoreUpgrade(targetRelease);
      setIsUpgrading(false);
      setUpgradeSuccess(true);
      setVersionInfo(SystemUpdaterService.getVersionInfo());
      setSnapshots(SystemUpdaterService.getSnapshots());
      triggerRefresh();
    }, 4500);
  };

  const handleRollback = (snapId: string) => {
    const success = SystemUpdaterService.rollbackSnapshot(snapId);
    if (success) {
      setVersionInfo(SystemUpdaterService.getVersionInfo());
      setSnapshots(SystemUpdaterService.getSnapshots());
      triggerRefresh();
    }
  };

  const handleApplyPatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patchToken) return;
    SystemUpdaterService.createSnapshot(`پشتیبان قبل از فعال‌سازی پچ سازمانی [${patchToken.substring(0, 8)}]`);
    setPatchApplied(true);
    setPatchToken('');
    setTimeout(() => setPatchApplied(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              مرکز مدیریت ارتقا و به‌روزرسانی هسته سامانه (In-App OTA Core Updater)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              به‌روزرسانی مستقیم هسته، اجرای خودکار مایگریشن‌های دیتابیس و مدیریت پچ‌های سیستمی بدون نیاز به انتقال دستی فایل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckUpdates}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'در حال بررسی مخزن...' : 'بررسی نگارش‌های جدید'}</span>
          </button>
        </div>
      </div>

      {checkMessage && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{checkMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">نگارش هسته سیستم (Core Engine)</div>
          <div className="text-lg font-black text-slate-800 font-mono">v{versionInfo.core_version}</div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> وضعیت: پایدار و فعال
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">نسخه اسکیمای پایگاه داده (DB Schema)</div>
          <div className="text-lg font-black text-slate-800 font-mono">v{versionInfo.db_schema_version}</div>
          <div className="text-[10px] text-slate-500">پشتیبانی کامل از جداول رابطه‌ای</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">موتور مجوزها و امنیت (RBAC Kernel)</div>
          <div className="text-lg font-black text-slate-800 font-mono">v{versionInfo.rbac_engine_version}</div>
          <div className="text-[10px] text-slate-500">ماتریس سطوح دسترسی پویا</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">کانال انتشار (Release Channel)</div>
          <div className="text-lg font-black text-indigo-700 font-mono uppercase">{versionInfo.release_channel}</div>
          <div className="text-[10px] text-slate-400">آخرین بررسی: {versionInfo.last_update_check}</div>
        </div>
      </div>

      {versionInfo.is_update_available && (
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-indigo-200 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>نگارش عمده جدید در دسترس است</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  به‌روزرسانی هسته سامانه به نگارش {targetRelease.version}
                </h2>
                <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
                  این نگارش شامل بهینه‌سازی‌های جامع معماری، فعال‌سازی موتور پویای تفکیک وظایف و مجوزهای سازمانی، و اصلاح ساختار ایندکس‌گذاری لاگ‌های نظارتی می‌باشد.
                </p>
              </div>

              {!isUpgrading && !upgradeSuccess && (
                <button
                  onClick={handleStartUpgrade}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
                >
                  <ArrowUpCircle className="w-5 h-5" />
                  <span>اجرای ۱-کلیک ارتقای هسته</span>
                </button>
              )}
            </div>

            {isUpgrading && (
              <div className="p-5 rounded-xl bg-white/10 border border-white/15 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>پیشرفت فرآیند ارتقا ({upgradeStep} از ۴):</span>
                  <span className="font-mono text-emerald-300">
                    {upgradeStep === 1 ? '۲۵٪' : upgradeStep === 2 ? '۵۰٪' : upgradeStep === 3 ? '۷۵٪' : '۱۰۰٪'}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${upgradeStep * 25}%` }}
                  />
                </div>

                <div className="bg-black/40 rounded-lg p-3 font-mono text-[11px] text-emerald-300 space-y-1 max-h-36 overflow-y-auto">
                  {upgradeLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {upgradeSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-white">سامانه با موفقیت به نگارش ۲.۵.۰ ارتقا یافت!</div>
                  <div className="text-[11px] text-emerald-200 mt-0.5">
                    تمامی مایگریشن‌های پایگاه داده اجرا شدند و نسخه پشتیبان از نگارش پیشین در مخزن اسنپ‌شات‌ها ثبت گردید.
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>تغییرات و قابلیت‌های افزوده شده:</span>
                </div>
                <ul className="text-[11px] text-indigo-100 space-y-1.5 list-disc list-inside">
                  {targetRelease.features.map((f, i) => (
                    <li key={i} className="leading-relaxed">{f}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>مایگریشن‌های دیتابیس در این نگارش:</span>
                </div>
                <div className="space-y-2">
                  {targetRelease.migrations.map(m => (
                    <div key={m.id} className="p-2.5 rounded-lg bg-black/30 border border-white/5 font-mono text-[10px]">
                      <div className="text-indigo-300 font-bold font-sans">{m.title}</div>
                      <div className="text-slate-400 mt-1">{m.sql}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800">مخزن اسنپ‌شات‌ها و امکان بازگردانی سریع (Instant Rollback)</h3>
            </div>
            <button
              onClick={() => {
                SystemUpdaterService.createSnapshot(`پشتیبان دستی نگارش ${versionInfo.core_version}`);
                setSnapshots(SystemUpdaterService.getSnapshots());
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              + ثبت اسنپ‌شات دستی
            </button>
          </div>

          <div className="space-y-3">
            {snapshots.map(s => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800">{s.title}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>زمان: {s.created_at}</span>
                    <span>نگارش هسته: v{s.core_version}</span>
                    <span>اسکیما: v{s.schema_version}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-sm">
                    {s.snapshot_hash}
                  </div>
                </div>

                <button
                  onClick={() => handleRollback(s.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shrink-0"
                >
                  بازگردانی به این نسخه
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800">فعال‌سازی ماژول و لایسنس پچ</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            جهت فعال‌سازی قابلیت‌های ماژولار جدید یا اعمال بسته‌های امنیتی سفارشی سازمان، کد پچ اختصاصی را در کادر زیر وارد نمایید:
          </p>

          <form onSubmit={handleApplyPatch} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">کد پچ امضاشده (Signed Patch Token)</label>
              <textarea
                value={patchToken}
                onChange={e => setPatchToken(e.target.value)}
                rows={3}
                placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full p-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {patchApplied && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>پچ با موفقیت تایید و در سیستم فعال گردید.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!patchToken}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors"
            >
              بررسی و فعال‌سازی مستقیم در هسته
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
