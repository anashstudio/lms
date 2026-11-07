import React from 'react';
import { useApp, ActiveNavView } from '../../context/AppContext';
import { THEME_CONFIGS } from '../../utils/theme';
import { AppModule } from '../../types/models';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FolderArchive,
  HelpCircle,
  Video,
  FileSpreadsheet,
  Users,
  Settings,
  Terminal,
  ShieldCheck,
  Building2,
  Cpu,
  KeyRound,
  Award
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { settings, activeRole, activeView, setActiveView, hasPermission } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  interface NavItem {
    id: ActiveNavView;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    module?: AppModule;
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      title: 'پیشخوان مدیریتی',
      icon: LayoutDashboard
    },
    {
      id: 'courses',
      title: 'دوره‌ها و کلاس‌های آفلاین',
      icon: BookOpen,
      module: 'courses'
    },
    {
      id: 'content',
      title: 'محتوا و پودمان‌های درسی',
      icon: Layers,
      module: 'courses'
    },
    {
      id: 'resources',
      title: 'مرکز منابع و شایستگی‌ها',
      icon: FolderArchive,
      module: 'resources'
    },
    {
      id: 'exams',
      title: activeRole === 'learner' ? 'آزمون‌ها و سنجش دانش' : 'بانک سوالات و آزمون‌ها',
      icon: HelpCircle,
      module: 'exams'
    },
    {
      id: 'sessions',
      title: 'جلسات و پایش برخط',
      icon: Video,
      module: 'sessions'
    },
    {
      id: 'reports',
      title: 'مرکز گزارشات و اکسل',
      icon: FileSpreadsheet,
      module: 'reports'
    },
    {
      id: 'users',
      title: 'مدیریت کاربران و پرسنل',
      icon: Users,
      module: 'users'
    },
    {
      id: 'promotions',
      title: 'ترفیع و انتصابات سازمانی',
      icon: Award,
      module: 'promotions',
      badge: 'جدید'
    },
    {
      id: 'settings',
      title: 'تنظیمات و کنترل‌پنل',
      icon: Settings,
      module: 'settings'
    }
  ];

  const visibleItems = navItems.filter(item => {
    if (!item.module) return true;
    return hasPermission(item.module, 'view');
  });

  return (
    <aside className="w-64 bg-white border-l border-slate-200 hidden md:flex flex-col shrink-0 min-h-[calc(100vh-8rem)]">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Building2 className="w-3.5 h-3.5" />
          <span className="truncate">{settings.org_name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>سامانه کیفیت آموزش سازمانی</span>
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? `${theme.bgLight} ${theme.textLight} font-bold`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? theme.textLight : 'text-slate-400'}`} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] text-slate-400 font-normal">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/40">
        <div className="flex justify-between items-center mb-1.5">
          <span>شاخص تحقق اهداف آموزشی</span>
          <span className="font-mono tabular-nums font-semibold text-emerald-700">۹۴٪</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94%' }} />
        </div>
      </div>
    </aside>
  );
};
