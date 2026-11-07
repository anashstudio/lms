import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { ExcelService } from '../../services/excelService';
import { THEME_CONFIGS } from '../../utils/theme';
import { User, UserRole } from '../../types/models';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

import { ExcelUserImport } from './ExcelUserImport';

export const UserManagement: React.FC = () => {
  const { settings, activeRole, triggerRefresh, hasPermission } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newPassword, setNewPassword] = useState('User@123');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('learner');
  const [newDepartment, setNewDepartment] = useState('واحد تضمین کیفیت');
  const [newJobTitle, setNewJobTitle] = useState('کارشناس');
  const [formError, setFormError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editNationalId, setEditNationalId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('learner');
  const [editDepartment, setEditDepartment] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditEmployeeId(user.employee_id || '');
    setEditUsername(user.username || '');
    setEditNationalId(user.national_id);
    setEditPassword(user.password || '');
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditRole(user.role);
    setEditDepartment(user.department);
    setEditJobTitle(user.job_title);
    setEditStatus(user.status);
    setFormError(null);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(null);

    const cleanUsername = editUsername.trim().toLowerCase();
    const cleanNationalId = editNationalId.trim();
    const cleanEmployeeId = editEmployeeId.trim();

    if (!cleanUsername) {
      setFormError('نام کاربری نمی‌تواند خالی باشد.');
      return;
    }

    if (!/^\d{10}$/.test(cleanNationalId)) {
      setFormError('کد ملی باید دقیقاً ۱۰ رقم عددی باشد.');
      return;
    }

    if (!db.checkUsernameAvailable(cleanUsername, editingUser.id)) {
      setFormError(`نام کاربری «${cleanUsername}» قبلاً توسط کاربر دیگری ثبت شده است.`);
      return;
    }

    if (!db.checkNationalIdAvailable(cleanNationalId, editingUser.id)) {
      setFormError(`کد ملی «${cleanNationalId}» قبلاً ثبت شده است.`);
      return;
    }

    db.updateUser(editingUser.id, {
      full_name: editFullName,
      employee_id: cleanEmployeeId || editingUser.employee_id,
      username: cleanUsername,
      national_id: cleanNationalId,
      password: editPassword || editingUser.password,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      department: editDepartment,
      job_title: editJobTitle,
      status: editStatus
    });

    setEditingUser(null);
    reloadUsers();
  };

  const reloadUsers = () => {
    const list = db.getUsers();
    setUsers(list);
    triggerRefresh();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmployeeId = newEmployeeId.trim();
    const cleanUsername = (newUsername.trim() || cleanEmployeeId || `user_${newNationalId.slice(-4)}`).toLowerCase();
    const cleanNationalId = newNationalId.trim();

    if (!newFullName || !cleanNationalId || !newEmail) {
      setFormError('لطفاً فیلدهای ستاره‌دار را تکمیل فرمایید.');
      return;
    }

    if (!/^\d{10}$/.test(cleanNationalId)) {
      setFormError('کد ملی باید دقیقاً ۱۰ رقم عددی باشد.');
      return;
    }

    if (!db.checkUsernameAvailable(cleanUsername)) {
      setFormError(`نام کاربری «${cleanUsername}» قبلاً ثبت شده است. لطفاً نام کاربری دیگری انتخاب کنید.`);
      return;
    }

    if (!db.checkNationalIdAvailable(cleanNationalId)) {
      setFormError(`کد ملی «${cleanNationalId}» قبلاً در سامانه ثبت شده است.`);
      return;
    }

    const created: User = {
      id: `usr_${Date.now()}`,
      employee_id: cleanEmployeeId || cleanUsername,
      username: cleanUsername,
      national_id: cleanNationalId,
      password: newPassword || 'User@123',
      full_name: newFullName,
      email: newEmail,
      phone: newPhone || '09120000000',
      role: newRole,
      department: newDepartment,
      job_title: newJobTitle,
      status: 'active',
      created_at: new Date().toISOString()
    };

    db.addUser(created);
    setIsNewUserModalOpen(false);
    setNewFullName('');
    setNewEmployeeId('');
    setNewUsername('');
    setNewNationalId('');
    setNewPassword('User@123');
    setNewEmail('');
    setNewPhone('');
    setFormError(null);
    reloadUsers();
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`آیا از حذف کاربر ${name} اطمینان دارید؟`)) {
      db.deleteUser(id);
      reloadUsers();
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      u.full_name.toLowerCase().includes(q) || 
      (u.employee_id && u.employee_id.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) || 
      u.national_id.includes(searchQuery) ||
      u.department.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'مدیر ارشد';
      case 'class_manager': return 'مدیر کلاس';
      case 'instructor': return 'مدرس';
      case 'learner': return 'فراگیر';
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">مدیریت کاربران و سطوح دسترسی</h1>
          <p className="text-xs text-slate-500 mt-1">
            ورود و خروج دسته‌ای کاربران از طریق اکسل و تعیین نقش‌های ۴ گانه
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasPermission('users', 'create') && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>ایمپورت از اکسل</span>
            </button>
          )}

          {hasPermission('users', 'export') && (
            <button
              onClick={() => ExcelService.exportUsers(users)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>خروجی کامل اکسل</span>
            </button>
          )}

          {hasPermission('users', 'create') && (
            <button
              onClick={() => setIsNewUserModalOpen(true)}
              className={`flex items-center gap-1.5 px-4 py-2 ${theme.primary} ${theme.primaryHover} text-white rounded-lg text-xs font-semibold shadow-sm transition-colors`}
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت کاربر جدید</span>
            </button>
          )}
        </div>
      </div>

      {}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-80 border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-emerald-500">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، کدملی، واحد یا ایمیل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none text-slate-800"
          />
        </div>

        {}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'همه نقش‌ها' },
            { id: 'super_admin', label: 'مدیر ارشد' },
            { id: 'class_manager', label: 'مدیر کلاس' },
            { id: 'instructor', label: 'مدرس' },
            { id: 'learner', label: 'فراگیر' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                roleFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* جدول کاربران */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">نام و مشخصات</th>
                <th className="py-3 px-4">کد پرسنلی (شناسه ورود)</th>
                <th className="py-3 px-4">نام کاربری (Username)</th>
                <th className="py-3 px-4">کد ملی (National ID)</th>
                <th className="py-3 px-4">پست الکترونیکی</th>
                <th className="py-3 px-4">واحد و سمت سازمانی</th>
                <th className="py-3 px-4">نقش سیستمی</th>
                <th className="py-3 px-4">وضعیت</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    کاربری با معیارهای جستجو یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.full_name.charAt(0)}
                      </div>
                      <span>{u.full_name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                        {u.employee_id || u.username || '---'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#0288d1]">
                      <span className="bg-sky-50 text-[#0288d1] px-2 py-0.5 rounded border border-sky-100">
                        {u.username || '---'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-medium tabular-nums">
                      <span className="bg-slate-50 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {u.national_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.email}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="text-slate-800 font-medium">{u.department}</div>
                      <div className="text-[11px] text-slate-400">{u.job_title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={u.status === 'active' ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                        {u.status === 'active' ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {hasPermission('users', 'edit') && (
                          <button
                            onClick={() => startEditUser(u)}
                            className="text-slate-500 hover:text-emerald-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                            title="ویرایش مشخصات کاربر"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('users', 'delete') && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.full_name)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                            title="حذف کاربر"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>تعداد کل کاربران: <strong className="font-mono text-slate-800">{filteredUsers.length}</strong> نفر</span>
          <span>منطبق با جدول کاربران در پایگاه‌داده SQL</span>
        </div>
      </div>

      {/* مدال ایمپورت دسته‌ای اکسل با ExcelUserImport */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">ورود اطلاعات کاربران از اکسل</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[80vh] overflow-y-auto">
              <ExcelUserImport
                onSuccess={() => {
                  reloadUsers();
                  setTimeout(() => setIsImportModalOpen(false), 1200);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">تعریف و راه‌اندازی کاربر جدید</h3>
              </div>
              <button
                onClick={() => setIsNewUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="مثال: سهراب حسینی"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    کد پرسنلی (Employee ID) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={newEmployeeId}
                    onChange={(e) => setNewEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="مثال: 965505"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">شناسه اصلی لاگین سازمانی</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    نام کاربری سازمانی (Username) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="مثال: 965505 یا s.hosseini"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">شناسه لاگین پرسنلی</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    کد ملی ۱۰ رقمی (National ID) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={10}
                    required
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="0012345678"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">۱۰ رقم بدون خط تیره</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">رمز عبور اولیه *</label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="User@123"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">پست الکترونیکی *</label>
                  <input
                    type="email"
                    dir="ltr"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="user@sadra-lms.ir"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">شماره تماس همراه</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="09121234567"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">نقش کاربری در سامانه</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="learner">فراگیر / دانش‌پذیر</option>
                    <option value="instructor">مدرس / استاد</option>
                    <option value="class_manager">مدیر کلاس و آموزش</option>
                    <option value="super_admin">مدیر ارشد سامانه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">واحد سازمانی</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">سمت / شغل</label>
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
                >
                  ذخیره کاربر در پایگاه‌داده
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">ویرایش مشخصات کاربر: {editingUser.full_name}</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">کد پرسنلی (Employee ID) *</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editEmployeeId}
                    onChange={(e) => setEditEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="965505"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">شناسه اصلی لاگین سازمانی</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">نام کاربری سازمانی (Username) *</label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">شناسه لاتین منحصر به فرد جهت لاگین</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">کد ملی ۱۰ رقمی (National ID) *</label>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={10}
                    required
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">۱۰ رقم بدون خط تیره</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">تغییر رمز عبور کاربر</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="در صورت عدم تمایل به تغییر، خالی بگذارید"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">پست الکترونیکی *</label>
                  <input
                    type="email"
                    dir="ltr"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">شماره تماس</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">نقش کاربری در سامانه</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="learner">فراگیر / دانش‌پذیر</option>
                    <option value="instructor">مدرس / استاد</option>
                    <option value="class_manager">مدیر کلاس و آموزش</option>
                    <option value="super_admin">مدیر ارشد سامانه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">وضعیت حساب</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">واحد سازمانی</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">سمت / شغل</label>
                  <input
                    type="text"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm transition-colors"
                >
                  ذخیره ویرایش‌ها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
