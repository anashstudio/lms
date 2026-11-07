import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { ExcelService } from '../../services/excelService';
import { Course } from '../../types/models';
import { ClassModifyView } from './ClassModifyView';
import { ClassPersonnelModal } from './ClassPersonnelModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileText,
  FileSpreadsheet,
  File,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface CourseListProps {
  onSelectCourse: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ onSelectCourse }) => {
  const { activeRole, triggerRefresh } = useApp();

  const [courses, setCourses] = useState<Course[]>(() => db.getCourses());
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [personnelModalCourse, setPersonnelModalCourse] = useState<Course | null>(null);
  const [personnelModalRole, setPersonnelModalRole] = useState<'learner' | 'instructor' | 'manager'>('learner');

  const openPersonnelModal = (course: Course, role: 'learner' | 'instructor' | 'manager') => {
    setPersonnelModalCourse(course);
    setPersonnelModalRole(role);
  };

  const [filterMode, setFilterMode] = useState<'single' | 'multi_comma'>('multi_comma');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'inactive'>('active');
  const [filterYear, setFilterYear] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterNature, setFilterNature] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [flagFreeLearning, setFlagFreeLearning] = useState(true);
  const [flagNoContent, setFlagNoContent] = useState(false);
  const [flagDirectEntry, setFlagDirectEntry] = useState(false);

  const reloadCourses = () => {
    setCourses(db.getCourses());
    triggerRefresh();
  };

  const handleDeleteCourse = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`آیا از حذف کلاس «${title}» اطمینان دارید؟`)) {
      db.deleteCourse(id);
      reloadCourses();
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (activeStatus === 'active' && c.status !== 'active') return false;
    if (activeStatus === 'inactive' && c.status === 'active') return false;

    if (filterBranch !== 'all' && (c.branch || 'پالایشگاه اصفهان') !== filterBranch) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      if (filterMode === 'multi_comma') {
        const parts = q.split(',').map((p) => p.trim()).filter(Boolean);
        if (parts.length > 0) {
          const matched = parts.some(
            (part) =>
              c.title.toLowerCase().includes(part) ||
              c.code.toLowerCase().includes(part) ||
              (c.target_audience && c.target_audience.toLowerCase().includes(part))
          );
          if (!matched) return false;
        }
      } else {
        const matched =
          c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.target_audience && c.target_audience.toLowerCase().includes(q));
        if (!matched) return false;
      }
    }

    return true;
  });

  const totalRows = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + pageSize);

  const exportExcel = () => {
    ExcelService.exportCoursesToExcel(filteredCourses);
  };

  if (isCreatingNew || editingCourse) {
    return (
      <ClassModifyView
        initialCourse={editingCourse}
        onSave={() => {
          setIsCreatingNew(false);
          setEditingCourse(null);
          reloadCourses();
        }}
        onCancel={() => {
          setIsCreatingNew(false);
          setEditingCourse(null);
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-4 text-slate-800 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
        <div className="flex items-center gap-2">
          {activeRole !== 'learner' && (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="px-4 py-1.5 bg-[#43a047] hover:bg-[#388e3c] text-white font-bold rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ کلاس جدید</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
          <span>کلاس‌ها و دوره‌های آموزشی</span>
          <button
            onClick={reloadCourses}
            title="بروزرسانی جدول"
            className="p-1 hover:bg-slate-100 rounded text-sky-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4 hover:rotate-180 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 mb-3">
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as any)}
          className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none"
        >
          <option value="multi_comma">فیلتر بیش از یک مورد با , (ویرگول)</option>
          <option value="single">جستجوی ساده</option>
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="عنوان / کد کلاس"
          className="flex-1 min-w-[200px] px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-sky-500"
        />

        <button
          onClick={() => setCurrentPage(1)}
          className="px-5 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-bold rounded text-xs transition-colors"
        >
          جستجو
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-2 rounded border border-slate-200 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">وضعیت :</span>
          <div className="inline-flex rounded border border-slate-300 overflow-hidden bg-white text-xs">
            <button
              onClick={() => {
                setActiveStatus('active');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 ${activeStatus === 'active' ? 'bg-[#0288d1] text-white font-bold' : 'text-slate-600'}`}
            >
              فعال
            </button>
            <button
              onClick={() => {
                setActiveStatus('inactive');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 ${activeStatus === 'inactive' ? 'bg-[#0288d1] text-white font-bold' : 'text-slate-600'}`}
            >
              غیرفعال
            </button>
            <button
              onClick={() => {
                setActiveStatus('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 ${activeStatus === 'all' ? 'bg-[#0288d1] text-white font-bold' : 'text-slate-600'}`}
            >
              همه
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">سال:</span>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="all">همه</option>
              <option value="1405">۱۴۰۵</option>
              <option value="1404">۱۴۰۴</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">ماه:</span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="all">همه</option>
              <option value="08">آبان</option>
              <option value="09">آذر</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">شعبه:</span>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="all">همه</option>
              <option value="پالایشگاه اصفهان">پالایشگاه اصفهان</option>
              <option value="مرکز آموزش فنی و تحقیقات">مرکز آموزش فنی و تحقیقات</option>
              <option value="دفتر مرکزی تهران">دفتر مرکزی تهران</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">گروه آموزشی:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="all">همه</option>
              <option value="کلیه کارکنان">کلیه کارکنان</option>
              <option value="مدیران و روسا">مدیران و روسا</option>
              <option value="کارشناسان فنی و مهندسی">کارشناسان فنی و مهندسی</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">ماهیت:</span>
            <select
              value={filterNature}
              onChange={(e) => setFilterNature(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="all">همه</option>
              <option value="---------">---------</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
              <th className="py-2.5 px-3 w-28">کد</th>
              <th className="py-2.5 px-3">عنوان</th>
              <th className="py-2.5 px-3 w-28">شروع</th>
              <th className="py-2.5 px-3 w-28">پایان</th>
              <th className="py-2.5 px-3 w-44">دسترسی</th>
              <th className="py-2.5 px-3 w-20 text-center">وضعیت</th>
              <th className="py-2.5 px-3 w-36">شعبه</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {paginatedCourses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  هیچ کلاسی مطابق فیلترهای انتخابی یافت نشد.
                </td>
              </tr>
            ) : (
              paginatedCourses.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-sky-50/60 transition-colors cursor-pointer group"
                  onClick={() => onSelectCourse(c.id)}
                >
                  <td className="py-2 px-3 font-mono text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sky-900">{c.code}</span>
                      {activeRole !== 'learner' && (
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCourse(c);
                            }}
                            className="p-1 text-slate-500 hover:text-sky-600 rounded"
                            title="ویرایش کلاس"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteCourse(c.id, c.title, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="حذف کلاس"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>{c.title}</span>
                    </div>
                    {c.target_audience && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.target_audience}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">
                    {c.start_date || '۱۴۰۵/۰۸/۰۱'}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">
                    {c.end_date || '۱۴۰۵/۰۹/۰۱'}
                  </td>
                  <td className="py-2 px-3 text-[11px]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <button
                        onClick={() => openPersonnelModal(c, 'learner')}
                        className="text-[#0288d1] hover:underline font-bold transition-colors"
                        title="مدیریت و افزودن فراگیران به این کلاس"
                      >
                        {c.assigned_learner_ids ? c.assigned_learner_ids.length : 2} فراگیر
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => openPersonnelModal(c, 'instructor')}
                        className="text-[#0288d1] hover:underline font-bold transition-colors"
                        title="مدیریت و افزودن مدرسان به این کلاس"
                      >
                        {c.assigned_instructor_ids ? c.assigned_instructor_ids.length : (c.instructor_id ? 1 : 0)} مدرس
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => openPersonnelModal(c, 'manager')}
                        className="text-[#0288d1] hover:underline font-bold transition-colors"
                        title="مدیریت و تخصیص مدیران به این کلاس"
                      >
                        {c.assigned_manager_ids ? c.assigned_manager_ids.length : 1} مدیر
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{c.status === 'active' ? 'فعال' : 'پیش‌نویس'}</span>
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 text-xs">
                    {c.branch || 'پالایشگاه اصفهان'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>نمایش</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
          >
            <option value={10}>۱۰ از {totalRows === 0 ? 0 : startIndex + 1} تا {Math.min(startIndex + pageSize, totalRows)} از {totalRows} ردیف</option>
            <option value={20}>۲۰ ردیف در هر صفحه</option>
            <option value={50}>۵۰ ردیف در هر صفحه</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(1)}
            className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-30"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-7 h-7 rounded font-mono text-xs font-bold ${
                currentPage === i + 1
                  ? 'bg-[#0288d1] text-white shadow-xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-30"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => alert('خروجی PDF آماده شد.')}
              className="w-7 h-7 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 flex items-center justify-center font-bold text-xs"
              title="خروجی PDF"
            >
              PDF
            </button>
            <button
              onClick={exportExcel}
              className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-xs"
              title="خروجی Excel"
            >
              XLS
            </button>
            <button
              onClick={() => alert('خروجی Word آماده شد.')}
              className="w-7 h-7 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs"
              title="خروجی Word"
            >
              DOC
            </button>
          </div>

          <div className="flex items-center gap-2 border-r border-slate-200 pr-2">
            <label className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={flagFreeLearning}
                onChange={(e) => setFlagFreeLearning(e.target.checked)}
                className="rounded text-amber-600 focus:ring-0 w-3 h-3"
              />
              <span>یادگیری آزاد</span>
            </label>

            <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={flagNoContent}
                onChange={(e) => setFlagNoContent(e.target.checked)}
                className="rounded text-[#0288d1] focus:ring-0 w-3 h-3"
              />
              <span>بدون محتوا</span>
            </label>

            <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={flagDirectEntry}
                onChange={(e) => setFlagDirectEntry(e.target.checked)}
                className="rounded text-[#0288d1] focus:ring-0 w-3 h-3"
              />
              <span>ورود مستقیم</span>
            </label>
          </div>
        </div>
      </div>

      {personnelModalCourse && (
        <ClassPersonnelModal
          course={personnelModalCourse}
          initialRole={personnelModalRole}
          isOpen={true}
          onClose={() => setPersonnelModalCourse(null)}
          onSaved={() => reloadCourses()}
        />
      )}
    </div>
  );
};
