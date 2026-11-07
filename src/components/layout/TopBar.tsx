import React, { useState, useEffect } from 'react';
import { useApp, ActiveNavView } from '../../context/AppContext';
import { UserRole } from '../../types/models';
import {
  BookOpen,
  Layers,
  FolderArchive,
  HelpCircle,
  Video,
  FileSpreadsheet,
  Settings,
  Search,
  Power,
  Bell,
  RefreshCw,
  Cpu,
  KeyRound,
  Database,
  LayoutDashboard,
  Flame,
  CheckCircle2,
  ChevronDown,
  Calendar,
  X
} from 'lucide-react';
import { PersianDatePicker } from '../common/PersianDatePicker';

export const TopBar: React.FC = () => {
  const {
    settings,
    activeUser,
    activeRole,
    switchRole,
    logout,
    activeView,
    setActiveView,
    setIsProfileModalOpen,
    setIsSetupModalOpen,
    hasPermission,
    triggerRefresh
  } = useApp();

  const [currentDateStr, setCurrentDateStr] = useState('۱۴۰۵/۰۸/۰۹');
  const [currentTimeStr, setCurrentTimeStr] = useState('۰۹:۰۶:۳۲');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isCalendarPopupOpen, setIsCalendarPopupOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pDate = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(now);

      const pTime = new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);

      setCurrentDateStr(pDate);
      setCurrentTimeStr(pTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<UserRole, { title: string; color: string }> = {
    super_admin: { title: 'مدیر ارشد سامانه', color: 'bg-rose-50 text-rose-700' },
    class_manager: { title: 'مدیر آموزش', color: 'bg-amber-50 text-amber-700' },
    instructor: { title: 'مدرس', color: 'bg-sky-50 text-sky-700' },
    learner: { title: 'فراگیر', color: 'bg-emerald-50 text-emerald-700' }
  };

  interface NavTabItem {
    id: ActiveNavView;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    allowedRoles: UserRole[];
    badge?: string;
  }

  const primaryTabs: NavTabItem[] = [
    {
      id: 'dashboard',
      title: 'پیشخوان',
      icon: LayoutDashboard,
      allowedRoles: ['super_admin', 'class_manager', 'instructor', 'learner']
    },
    {
      id: 'courses',
      title: 'کلاس',
      icon: BookOpen,
      allowedRoles: ['super_admin', 'class_manager', 'instructor', 'learner']
    },
    {
      id: 'content',
      title: 'محتوا',
      icon: Layers,
      allowedRoles: ['super_admin', 'class_manager', 'instructor', 'learner']
    },
    {
      id: 'resources',
      title: 'منابع',
      icon: FolderArchive,
      allowedRoles: ['super_admin', 'class_manager', 'instructor', 'learner']
    },
    {
      id: 'exams',
      title: activeRole === 'learner' ? 'آزمون‌ها' : 'سوالات',
      icon: HelpCircle,
      allowedRoles: ['super_admin', 'class_manager', 'instructor', 'learner']
    },
    {
      id: 'sessions',
      title: 'جلسات',
      icon: Video,
      allowedRoles: ['super_admin', 'class_manager', 'instructor']
    },
    {
      id: 'reports',
      title: 'گزارش',
      icon: FileSpreadsheet,
      allowedRoles: ['super_admin', 'class_manager', 'instructor', 'learner']
    },
    {
      id: 'settings',
      title: 'تنظیمات',
      icon: Settings,
      allowedRoles: ['super_admin']
    }
  ];

  const visiblePrimaryTabs = primaryTabs.filter((t) => t.allowedRoles.includes(activeRole));

  return (
    <header className="sticky top-0 z-40 w-full shadow-md select-none">
      <div className="bg-[#0288d1] text-white px-4 sm:px-6 py-2">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center p-1.5 shadow-inner shrink-0">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="لوگو"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Flame className="w-6 h-6 text-amber-300 drop-shadow" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                {settings.app_name || 'مدیریت سامانه یادگیری و آزمون الکترونیکی'}
              </span>
              <span className="text-xs text-sky-100 font-medium leading-tight mt-0.5">
                {settings.org_name || 'شرکت پالایش نفت اصفهان'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCalendarPopupOpen(!isCalendarPopupOpen)}
                className="hidden xl:flex flex-col items-center justify-center px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[11px] font-mono text-sky-100 leading-tight transition-colors cursor-pointer"
                title="مشاهده و انتخاب تقویم شمسی سامانه"
              >
                <span className="font-bold text-white tracking-wider">{currentDateStr}</span>
                <span className="text-[10px] opacity-90">{currentTimeStr}</span>
              </button>

              {isCalendarPopupOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-xl shadow-2xl border border-slate-300 p-2 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between border-b pb-1.5 mb-1 px-1">
                    <span className="text-xs font-bold text-slate-700">تقویم هجری شمسی</span>
                    <button
                      type="button"
                      onClick={() => setIsCalendarPopupOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <PersianDatePicker
                    value={currentDateStr}
                    onChange={(newDate) => {
                      setCurrentDateStr(newDate);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#0091ea]/80 border border-sky-300/40 rounded-full text-xs font-semibold text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>۱ کاربر آنلاین</span>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-colors relative"
              title="اعلان‌ها"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                title="تغییر نقش کاربری یا پروفایل"
              >
                <div className="w-6 h-6 rounded bg-[#2e7d32] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {activeUser.full_name.charAt(0)}
                </div>
                <span className="hidden md:inline font-bold">{activeUser.full_name}</span>
                <span className="hidden lg:inline text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-sky-100">
                  {roleLabels[activeRole].title}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-sky-200" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{activeUser.full_name}</p>
                    <div className="mt-1 space-y-0.5 text-[11px] font-mono text-slate-500">
                      <p className="flex items-center justify-between">
                        <span className="font-sans text-[10px] text-slate-400">نام کاربری:</span>
                        <span className="font-bold text-[#0288d1]">{activeUser.username || '---'}</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="font-sans text-[10px] text-slate-400">کد ملی:</span>
                        <span className="text-slate-700 font-bold">{activeUser.national_id}</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">تغییر محیط نقش:</span>
                    {(['super_admin', 'class_manager', 'instructor', 'learner'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-right px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          activeRole === r ? 'bg-sky-50 text-sky-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{roleLabels[r].title}</span>
                        {activeRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-1 mt-1 px-1.5 space-y-1">
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full text-right px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      ویرایش پروفایل من
                    </button>
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-between"
                    >
                      <span>خروج از حساب کاربری</span>
                      <Power className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
              title="جستجو در سامانه"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                logout();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/80 border border-white/20 flex items-center justify-center text-white transition-colors"
              title="خروج از سامانه"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="max-w-[1700px] mx-auto mt-2 pt-2 border-t border-white/20 flex items-center gap-2">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="جستجو در کلاس‌ها، محتوا، پودمان‌ها، سوالات و پرسنل..."
              className="flex-1 bg-white text-slate-800 text-xs px-3 py-2 rounded-lg border border-transparent focus:outline-none shadow-inner placeholder:text-slate-400"
              autoFocus
            />
            <button
              onClick={() => {
                setActiveView('courses');
                setIsSearchOpen(false);
              }}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold"
            >
              یافتن
            </button>
          </div>
        )}
      </div>

      <nav className="bg-white border-b border-slate-300 px-4 sm:px-6 shadow-xs">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-1 sm:gap-2">
            {visiblePrimaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                activeView === tab.id ||
                (tab.id === 'courses' && activeView === 'course_detail');

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-[#0288d1] text-[#0288d1] bg-sky-50/70 shadow-xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0288d1]' : 'text-slate-400'}`} />
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 mr-2 shrink-0">
            <button
              onClick={() => triggerRefresh()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-slate-50 text-xs font-semibold shadow-2xs"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline text-[11px]">بروزرسانی اطلاعات</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
