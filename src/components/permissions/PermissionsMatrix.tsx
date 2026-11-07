import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import { MODULE_LABELS, ACTION_LABELS } from '../../utils/rbac';
import { AppModule, PermissionAction, UserRole, User } from '../../types/models';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  RotateCcw,
  UserCheck,
  Search,
  Lock,
  Unlock,
  Sliders,
  Check
} from 'lucide-react';

const ROLE_NAMES: Record<UserRole, string> = {
  super_admin: 'مدیر ارشد سامانه (Super Admin)',
  class_manager: 'مدیر آموزش و کلاس‌ها (Training Manager)',
  instructor: 'مدرس / استاد (Instructor)',
  learner: 'فراگیر / کارمند (Learner)'
};

const MODULE_LIST: AppModule[] = [
  'courses',
  'exams',
  'resources',
  'sessions',
  'reports',
  'users',
  'permissions',
  'settings',
  'system_updater',
  'sql_console'
];

const ACTION_LIST: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'export'];

export const PermissionsMatrix: React.FC = () => {
  const { settings, rolePermissions, updateRolePermission, updateUserCustomPermission, resetRolePermissions, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [activeTab, setActiveTab] = useState<'matrix' | 'user_overrides' | 'audit'>('matrix');
  const [selectedRole, setSelectedRole] = useState<UserRole>('class_manager');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [saveToast, setSaveToast] = useState(false);

  const users = db.getUsers();
  const filteredUsers = users.filter(u =>
    u.full_name.includes(userSearch) ||
    u.national_id.includes(userSearch) ||
    u.job_title?.includes(userSearch)
  );

  const selectedUser = users.find(u => u.id === selectedUserId) || filteredUsers[0];

  const handleRoleToggle = (role: UserRole, module: AppModule, action: PermissionAction, currentValue: boolean) => {
    if (role === 'super_admin') return;
    updateRolePermission(role, module, action, !currentValue);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleUserToggle = (userId: string, module: AppModule, action: PermissionAction, currentValue: boolean) => {
    updateUserCustomPermission(userId, module, action, !currentValue);
    triggerRefresh();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              مدیریت سطوح دسترسی و مجوزهای سازمانی (RBAC)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              تعیین دقیق اختیارات مشاهده، ایجاد، ویرایش، حذف و استخراج اطلاعات برای هر نقش و پرسنل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveToast && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-lg animate-in fade-in duration-200">
              <Check className="w-4 h-4" />
              <span>تغییرات ذخیره شد</span>
            </div>
          )}
          <button
            onClick={resetRolePermissions}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بازنشانی به پیش‌فرض</span>
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'matrix'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>ماتریس جامع مجوزهای نقش‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('user_overrides')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'user_overrides'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>دسترسی‌های سفارشی اختصاصی پرسنل</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>گزارش و ممیزی تفکیک وظایف (SoD)</span>
        </button>
      </div>

      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(ROLE_NAMES) as UserRole[]).map(role => {
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-xl text-right transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{ROLE_NAMES[role]}</div>
                  <div className={`text-[11px] mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {role === 'super_admin' ? 'دسترسی نامحدود سیستمی' : 'اختیارات محدود سازمانی'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  جدول مجوزهای تفصیلی برای: {ROLE_NAMES[selectedRole]}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedRole === 'super_admin'
                    ? 'مدیر ارشد دارای تمامی مجوزهای عملیاتی بدون محدودیت است و امکان غیرفعال‌سازی وجود ندارد.'
                    : 'با کلیک بر روی هر خانه می‌توانید دسترسی را فوراً فعال یا غیرفعال فرمایید.'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> مجاز
                </span>
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <XCircle className="w-4 h-4 text-slate-300" /> غیرمجاز
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4 w-64">بخش و ماژول سازمانی</th>
                    {ACTION_LIST.map(action => (
                      <th key={action} className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${ACTION_LABELS[action].color}`}>
                          {ACTION_LABELS[action].title}
                        </span>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center">وضعیت دسترسی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MODULE_LIST.map(module => {
                    const moduleInfo = MODULE_LABELS[module];
                    const currentPerms = rolePermissions[selectedRole]?.[module] || {
                      view: false,
                      create: false,
                      edit: false,
                      delete: false,
                      export: false
                    };
                    const isSuper = selectedRole === 'super_admin';
                    const allowedCount = Object.values(currentPerms).filter(Boolean).length;

                    return (
                      <tr key={module} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 text-xs">{moduleInfo.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{moduleInfo.description}</div>
                        </td>

                        {ACTION_LIST.map(action => {
                          const isAllowed = isSuper || currentPerms[action];
                          return (
                            <td key={action} className="py-3.5 px-4 text-center">
                              <button
                                disabled={isSuper}
                                onClick={() => handleRoleToggle(selectedRole, module, action, isAllowed)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                  isAllowed
                                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 hover:bg-emerald-600'
                                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                } ${isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer active:scale-95'}`}
                                title={`${ACTION_LABELS[action].title} در ${moduleInfo.title}: ${isAllowed ? 'مجاز' : 'غیرمجاز'}`}
                              >
                                {isAllowed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </button>
                            </td>
                          );
                        })}

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuper || allowedCount === 5
                                ? 'bg-indigo-50 text-indigo-700'
                                : allowedCount > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isSuper || allowedCount === 5 ? 'کامل' : allowedCount > 0 ? `${allowedCount} از ۵` : 'مسدود'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'user_overrides' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>انتخاب کاربر جهت تفویض دسترسی ویژه</span>
            </h3>

            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="جستجوی نام، کدملی یا سمت..."
                className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
              {filteredUsers.map(user => {
                const isSelected = selectedUser?.id === user.id;
                const hasCustom = Boolean(user.custom_permissions && Object.keys(user.custom_permissions).length > 0);
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full p-3 rounded-xl text-right transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{user.full_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {user.job_title} · {ROLE_NAMES[user.role]?.split('(')[0]}
                      </div>
                    </div>
                    {hasCustom && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">
                        سفارشی
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            {selectedUser ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      تنظیم اختیارات اختصاصی برای: {selectedUser.full_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      نقش پیش‌فرض: <strong className="text-indigo-600">{ROLE_NAMES[selectedUser.role]}</strong> | کد پرسنلی: {selectedUser.employee_id || 'ندارد'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {MODULE_LIST.map(module => {
                    const moduleInfo = MODULE_LABELS[module];
                    const roleDefault = rolePermissions[selectedUser.role]?.[module] || {
                      view: false,
                      create: false,
                      edit: false,
                      delete: false,
                      export: false
                    };
                    const custom = selectedUser.custom_permissions?.[module] || {};

                    return (
                      <div key={module} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800 text-xs">{moduleInfo.title}</span>
                            <span className="text-[11px] text-slate-400 mr-2">{moduleInfo.description}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {ACTION_LIST.map(action => {
                            const isOverridden = custom[action] !== undefined;
                            const isAllowed = isOverridden ? Boolean(custom[action]) : Boolean(roleDefault[action]);

                            return (
                              <button
                                key={action}
                                onClick={() => handleUserToggle(selectedUser.id, module, action, isAllowed)}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                                  isAllowed
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                              >
                                <span className="font-medium text-[11px]">{ACTION_LABELS[action].title}</span>
                                {isAllowed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-slate-300" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                لطفاً از ستون کناری یک کاربر را انتخاب نمایید.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">ممیزی تفکیک وظایف و کنترل ریسک سازمانی (Segregation of Duties)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تطبیق پیکربندی دسترسی‌ها با استانداردهای مدیریت آموزش سازمانی و پیشگیری از تداخل اختیارات
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>کنترل نقش طراح و مصحح آزمون</span>
                <span className="text-emerald-600 font-black text-[11px]">انطباق کامل</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                اساتید امکان ایجاد و ویرایش آزمون‌های دوره خود را داشته اما به تنظیمات کلان سامانه و لاگ‌های ممیزی دسترسی ندارند.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>حریم خصوصی نتایج و کارنامه‌ها</span>
                <span className="text-emerald-600 font-black text-[11px]">محافظت‌شده</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                فراگیران تنها مجاز به مشاهده نتایج و گواهینامه‌های شخص خود هستند و دسترسی به ویرایش نمرات مسدود است.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>ممیزی ارتقا و تغییرات هسته</span>
                <span className="text-indigo-600 font-black text-[11px]">انحصاری سوپرادمین</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ارتقای ساختار دیتابیس، اجرای اسکریپت‌ها و دسترسی به کنسول پایگاه‌داده منحصراً در اختیار مدیر ارشد قرار دارد.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
