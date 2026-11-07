import { AppModule, PermissionAction, RolePermissionsMap, User, UserRole } from '../types/models';

export const MODULE_LABELS: Record<AppModule, { title: string; description: string }> = {
  courses: {
    title: 'دوره‌ها و سرفصل‌ها',
    description: 'مدیریت برنامه درسی، جلسات آموزشی و مشخصات سرفصل‌ها'
  },
  exams: {
    title: 'آزمون‌ها و ارزیابی',
    description: 'طراحی آزمون، بانک سوالات تستی و تشریحی و ثبت نمرات'
  },
  resources: {
    title: 'بانک منابع و محتوا',
    description: 'کتب، مقالات، ویدئوها و آیین‌نامه‌های آموزشی سازمانی'
  },
  sessions: {
    title: 'کلاس‌ها و جلسات',
    description: 'برگزاری و زمان‌بندی جلسات حضوری و وبینارهای آنلاین'
  },
  reports: {
    title: 'گزارشات و اثربخشی',
    description: 'تحلیل داده‌های یادگیری، ارزیابی نتایج و کارنامه‌ها'
  },
  users: {
    title: 'کاربران و پرسنل',
    description: 'مدیریت حساب‌های کاربری فراگیران، اساتید و مدیران'
  },
  permissions: {
    title: 'سطوح دسترسی و مجوزها',
    description: 'تنظیم ماتریس مجوزهای نقش‌ها و تفویض اختیارات ویژه'
  },
  settings: {
    title: 'تنظیمات و شخصی‌سازی',
    description: 'پیکربندی هویت سازمان، رنگ‌بندی و پارامترهای اصلی'
  },
  system_updater: {
    title: 'ارتقا و نگارش‌های هسته',
    description: 'بررسی به‌روزرسانی‌های نرم‌افزار، مایگریشن و پچ‌های امنیتی'
  },
  sql_console: {
    title: 'کنسول پایگاه داده',
    description: 'اجرای کوئری‌های SQL و نظارت بر ساختار جداول سیستم'
  }
};

export const ACTION_LABELS: Record<PermissionAction, { title: string; color: string }> = {
  view: { title: 'مشاهده', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  create: { title: 'افزودن', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  edit: { title: 'ویرایش', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  delete: { title: 'حذف', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  export: { title: 'خروجی', color: 'bg-purple-50 text-purple-700 border-purple-200' }
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMap = {
  super_admin: {
    courses: { view: true, create: true, edit: true, delete: true, export: true },
    exams: { view: true, create: true, edit: true, delete: true, export: true },
    resources: { view: true, create: true, edit: true, delete: true, export: true },
    sessions: { view: true, create: true, edit: true, delete: true, export: true },
    reports: { view: true, create: true, edit: true, delete: true, export: true },
    users: { view: true, create: true, edit: true, delete: true, export: true },
    permissions: { view: true, create: true, edit: true, delete: true, export: true },
    settings: { view: true, create: true, edit: true, delete: true, export: true },
    system_updater: { view: true, create: true, edit: true, delete: true, export: true },
    sql_console: { view: true, create: true, edit: true, delete: true, export: true }
  },
  class_manager: {
    courses: { view: true, create: true, edit: true, delete: true, export: true },
    exams: { view: true, create: true, edit: true, delete: true, export: true },
    resources: { view: true, create: true, edit: true, delete: true, export: true },
    sessions: { view: true, create: true, edit: true, delete: true, export: true },
    reports: { view: true, create: false, edit: false, delete: false, export: true },
    users: { view: true, create: true, edit: true, delete: false, export: true },
    permissions: { view: false, create: false, edit: false, delete: false, export: false },
    settings: { view: false, create: false, edit: false, delete: false, export: false },
    system_updater: { view: false, create: false, edit: false, delete: false, export: false },
    sql_console: { view: false, create: false, edit: false, delete: false, export: false }
  },
  instructor: {
    courses: { view: true, create: false, edit: true, delete: false, export: true },
    exams: { view: true, create: true, edit: true, delete: false, export: true },
    resources: { view: true, create: true, edit: false, delete: false, export: true },
    sessions: { view: true, create: false, edit: true, delete: false, export: true },
    reports: { view: true, create: false, edit: false, delete: false, export: true },
    users: { view: true, create: false, edit: false, delete: false, export: false },
    permissions: { view: false, create: false, edit: false, delete: false, export: false },
    settings: { view: false, create: false, edit: false, delete: false, export: false },
    system_updater: { view: false, create: false, edit: false, delete: false, export: false },
    sql_console: { view: false, create: false, edit: false, delete: false, export: false }
  },
  learner: {
    courses: { view: true, create: false, edit: false, delete: false, export: false },
    exams: { view: true, create: false, edit: false, delete: false, export: false },
    resources: { view: true, create: false, edit: false, delete: false, export: false },
    sessions: { view: true, create: false, edit: false, delete: false, export: false },
    reports: { view: true, create: false, edit: false, delete: false, export: false },
    users: { view: false, create: false, edit: false, delete: false, export: false },
    permissions: { view: false, create: false, edit: false, delete: false, export: false },
    settings: { view: false, create: false, edit: false, delete: false, export: false },
    system_updater: { view: false, create: false, edit: false, delete: false, export: false },
    sql_console: { view: false, create: false, edit: false, delete: false, export: false }
  }
};

export function checkPermission(
  user: User | null | undefined,
  rolePermissions: RolePermissionsMap,
  module: AppModule,
  action: PermissionAction
): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  if (user.custom_permissions?.[module]?.[action] !== undefined) {
    return Boolean(user.custom_permissions[module]![action]);
  }

  const roleConfig = rolePermissions[user.role];
  if (!roleConfig) return false;

  const moduleConfig = roleConfig[module];
  if (!moduleConfig) return false;

  return Boolean(moduleConfig[action]);
}
