import React, { useState, useMemo } from 'react';
import { Course, User, UserRole } from '../../types/models';
import { db } from '../../db/database';
import {
  X,
  Search,
  UserCheck,
  UserPlus,
  Trash2,
  Check,
  Users,
  GraduationCap,
  ShieldCheck,
  Building2,
  Briefcase,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface ClassPersonnelModalProps {
  course: Course;
  initialRole?: 'learner' | 'instructor' | 'manager';
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ClassPersonnelModal: React.FC<ClassPersonnelModalProps> = ({
  course,
  initialRole = 'learner',
  isOpen,
  onClose,
  onSaved
}) => {
  if (!isOpen) return null;

  const allUsers = db.getUsers();
  const existingEnrollments = db.getEnrollments(undefined, course.id);

  const [activeTab, setActiveTab] = useState<'learner' | 'instructor' | 'manager'>(initialRole);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const initialLearnerIds = useMemo(() => {
    if (course.assigned_learner_ids && course.assigned_learner_ids.length > 0) {
      return [...course.assigned_learner_ids];
    }
    const fromEnrollments = existingEnrollments.map((e) => e.user_id);
    if (fromEnrollments.length > 0) return fromEnrollments;
    return allUsers.filter((u) => u.role === 'learner').slice(0, 2).map((u) => u.id);
  }, [course, existingEnrollments, allUsers]);

  const initialInstructorIds = useMemo(() => {
    if (course.assigned_instructor_ids && course.assigned_instructor_ids.length > 0) {
      return [...course.assigned_instructor_ids];
    }
    if (course.instructor_id) return [course.instructor_id];
    return [];
  }, [course]);

  const initialManagerIds = useMemo(() => {
    if (course.assigned_manager_ids && course.assigned_manager_ids.length > 0) {
      return [...course.assigned_manager_ids];
    }
    if (course.class_manager_id) return [course.class_manager_id];
    const managers = allUsers.filter((u) => u.role === 'super_admin' || u.role === 'class_manager');
    return managers.slice(0, 1).map((m) => m.id);
  }, [course, allUsers]);

  const [assignedLearners, setAssignedLearners] = useState<string[]>(initialLearnerIds);
  const [assignedInstructors, setAssignedInstructors] = useState<string[]>(initialInstructorIds);
  const [assignedManagers, setAssignedManagers] = useState<string[]>(initialManagerIds);

  const currentAssignedList =
    activeTab === 'learner'
      ? assignedLearners
      : activeTab === 'instructor'
      ? assignedInstructors
      : assignedManagers;

  const setCurrentAssignedList = (newList: string[]) => {
    if (activeTab === 'learner') setAssignedLearners(newList);
    else if (activeTab === 'instructor') setAssignedInstructors(newList);
    else setAssignedManagers(newList);
  };

  const departments = useMemo(() => {
    const set = new Set<string>();
    allUsers.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (selectedDept !== 'all' && u.department !== selectedDept) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        (u.national_id && u.national_id.includes(q)) ||
        (u.employee_id && u.employee_id.includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.job_title && u.job_title.toLowerCase().includes(q))
      );
    });
  }, [allUsers, selectedDept, searchQuery]);

  const toggleUserAssignment = (userId: string) => {
    if (currentAssignedList.includes(userId)) {
      setCurrentAssignedList(currentAssignedList.filter((id) => id !== userId));
    } else {
      setCurrentAssignedList([...currentAssignedList, userId]);
    }
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredUsers.map((u) => u.id);
    const combined = Array.from(new Set([...currentAssignedList, ...filteredIds]));
    setCurrentAssignedList(combined);
  };

  const deselectAllFiltered = () => {
    const filteredIds = new Set(filteredUsers.map((u) => u.id));
    const remaining = currentAssignedList.filter((id) => !filteredIds.has(id));
    setCurrentAssignedList(remaining);
  };

  const handleSave = () => {
    db.updateCourse(course.id, {
      assigned_learner_ids: assignedLearners,
      assigned_instructor_ids: assignedInstructors,
      assigned_manager_ids: assignedManagers,
      instructor_id: assignedInstructors[0] || course.instructor_id,
      class_manager_id: assignedManagers[0] || course.class_manager_id
    });

    const enrolledUserIds = new Set(existingEnrollments.map((e) => e.user_id));
    assignedLearners.forEach((userId) => {
      if (!enrolledUserIds.has(userId)) {
        db.addEnrollment({
          id: `enr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          course_id: course.id,
          user_id: userId,
          enrolled_at: new Date().toISOString(),
          progress_percent: 0,
          attendance_percent: 100,
          status: 'enrolled'
        });
      }
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col text-slate-800 text-xs overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#0288d1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>تخصیص و مدیریت دسترسی‌های کلاس: {course.title}</span>
                <span className="text-[11px] font-mono bg-sky-700/80 px-2 py-0.5 rounded border border-sky-400/40">
                  کد: {course.code}
                </span>
              </h2>
              <p className="text-[11px] text-sky-100 mt-0.5">
                انتخاب نفرات از میان کل پرسنل سازمان جهت شرکت در کلاس، تدریس یا نظارت مدیریتی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('learner')}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'learner'
                ? 'border-[#0288d1] text-[#0288d1] bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>فراگیران کلاس</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-sky-100 text-[#0288d1] font-mono">
              {assignedLearners.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('instructor')}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'instructor'
                ? 'border-[#0288d1] text-[#0288d1] bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>مدرسان کلاس</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-sky-100 text-[#0288d1] font-mono">
              {assignedInstructors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('manager')}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'manager'
                ? 'border-[#0288d1] text-[#0288d1] bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>مدیران کلاس</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-sky-100 text-[#0288d1] font-mono">
              {assignedManagers.length}
            </span>
          </button>
        </div>

        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus-within:border-sky-500 shadow-inner">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی پرسنل بر اساس نام، کدملی، شماره پرسنلی، شغل یا واحد..."
              className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-700"
              >
                <option value="all">تمام واحدهای سازمانی</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={selectAllFiltered}
              className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0288d1] rounded-lg text-xs font-semibold"
            >
              افزودن همه فیلترشده‌ها
            </button>

            <button
              onClick={deselectAllFiltered}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
            >
              حذف همه فیلترشده‌ها
            </button>
          </div>
        </div>

        {currentAssignedList.length > 0 && (
          <div className="p-2.5 bg-sky-50/50 border-b border-sky-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-sky-950 shrink-0">
              تخصیص‌یافته‌ها ({currentAssignedList.length} نفر):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentAssignedList.map((uid) => {
                const user = allUsers.find((u) => u.id === uid);
                if (!user) return null;
                return (
                  <span
                    key={uid}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-sky-300 text-sky-900 text-[11px] font-medium shadow-xs"
                  >
                    <span>{user.full_name}</span>
                    <button
                      onClick={() => toggleUserAssignment(uid)}
                      className="text-slate-400 hover:text-rose-600 mr-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 sticky top-0 z-10 shadow-xs">
                <th className="py-2 px-3 w-12 text-center">انتخاب</th>
                <th className="py-2 px-3">نام و نام خانوادگی</th>
                <th className="py-2 px-3 w-28">کد ملی / پرسنلی</th>
                <th className="py-2 px-3 w-40">واحد سازمانی</th>
                <th className="py-2 px-3 w-36">عنوان شغلی</th>
                <th className="py-2 px-3 w-24 text-center">وضعیت دسترسی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    هیچ کاربری با مشخصات جستجو شده یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAssigned = currentAssignedList.includes(user.id);
                  return (
                    <tr
                      key={user.id}
                      onClick={() => toggleUserAssignment(user.id)}
                      className={`cursor-pointer transition-colors ${
                        isAssigned ? 'bg-sky-50/80 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => toggleUserAssignment(user.id)}
                          className="rounded text-[#0288d1] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {user.full_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.full_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">
                        {user.national_id || user.employee_id || '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{user.department || 'عمومی'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{user.job_title || 'کارشناس'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {isAssigned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>تخصیص‌یافته</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">تخصیص‌نیافته</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-600">
            تعداد کل تخصیص‌یافتگان: {assignedLearners.length} فراگیر | {assignedInstructors.length} مدرس | {assignedManagers.length} مدیر
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors"
            >
              انصراف
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره و ثبت دسترسی‌ها</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
