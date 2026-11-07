import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { ExcelService } from '../../services/excelService';
import { PersianDatePicker } from '../common/PersianDatePicker';
import {
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  FileSpreadsheet,
  Printer,
  Users,
  BookOpen,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Award,
  Filter
} from 'lucide-react';

interface ReportColumn {
  id: string;
  label: string;
}

export const ReportsCenter: React.FC = () => {
  const { settings, activeRole } = useApp();

  const [activeReportMode, setActiveReportMode] = useState<'audit_log' | 'class_activity' | 'kirkpatrick' | 'iso'>('audit_log');

  const [reportTitle, setReportTitle] = useState('گزارش رویدادنگاری سیستم');
  const [groupBy, setGroupBy] = useState('بر اساس کلاس');
  const [sortOrder, setSortOrder] = useState('صعودی نام خانوادگی');

  // فیلترهای گزارش رویدادنگاری مطابق با تصویر سامانه IdeaLms/Report/Log
  const [logBranch, setLogBranch] = useState('همه');
  const [logGroup, setLogGroup] = useState('همه');
  const [logUsername, setLogUsername] = useState('');
  const [logActivityType, setLogActivityType] = useState('همه');
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');

  const defaultAllColumns: ReportColumn[] = [
    { id: 'personnel_code', label: 'کد پرسنلی' },
    { id: 'first_name', label: 'نام' },
    { id: 'last_name', label: 'نام خانوادگی' },
    { id: 'course_code', label: 'کد کلاس' },
    { id: 'course_title', label: 'عنوان کلاس' },
    { id: 'branch', label: 'شعبه کاربر' },
    { id: 'exam_score', label: 'نمره آزمون' },
    { id: 'exam_status', label: 'نتیجه آزمون' },
    { id: 'progress', label: 'درصد پیشرفت' },
    { id: 'attendance', label: 'وضعیت حضور' },
    { id: 'completion_date', label: 'تاریخ اتمام' }
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'personnel_code',
    'last_name',
    'first_name',
    'course_title',
    'exam_score',
    'exam_status',
    'progress'
  ]);

  const [colSearch, setColSearch] = useState('');
  const [highlightedAvailable, setHighlightedAvailable] = useState<string | null>(null);
  const [highlightedSelected, setHighlightedSelected] = useState<string | null>(null);

  const [filterFirstName, setFilterFirstName] = useState('');
  const [filterLastName, setFilterLastName] = useState('');
  const [filterExamResult, setFilterExamResult] = useState('all');
  const [filterCourseCodes, setFilterCourseCodes] = useState('');
  const [filterContentType, setFilterContentType] = useState('all');
  const [filterBranch, setFilterBranch] = useState('پالایشگاه اصفهان');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterBranchBasis, setFilterBranchBasis] = useState<'learner' | 'class' | 'supervised'>('learner');
  const [filterAttendance, setFilterAttendance] = useState('all');
  const [showConditionsInReport, setShowConditionsInReport] = useState(false);

  const [isReportGenerated, setIsReportGenerated] = useState(true);

  const availableColumns = defaultAllColumns.filter(
    (c) =>
      !selectedColumns.includes(c.id) &&
      c.label.toLowerCase().includes(colSearch.toLowerCase())
  );

  const handleAddColumn = () => {
    if (highlightedAvailable && !selectedColumns.includes(highlightedAvailable)) {
      setSelectedColumns([...selectedColumns, highlightedAvailable]);
      setHighlightedAvailable(null);
    }
  };

  const handleRemoveColumn = () => {
    if (highlightedSelected) {
      setSelectedColumns(selectedColumns.filter((id) => id !== highlightedSelected));
      setHighlightedSelected(null);
    }
  };

  const handleMoveUp = () => {
    if (!highlightedSelected) return;
    const idx = selectedColumns.indexOf(highlightedSelected);
    if (idx > 0) {
      const copy = [...selectedColumns];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      setSelectedColumns(copy);
    }
  };

  const handleMoveDown = () => {
    if (!highlightedSelected) return;
    const idx = selectedColumns.indexOf(highlightedSelected);
    if (idx >= 0 && idx < selectedColumns.length - 1) {
      const copy = [...selectedColumns];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      setSelectedColumns(copy);
    }
  };

  const handleClearConditions = () => {
    setFilterFirstName('');
    setFilterLastName('');
    setFilterExamResult('all');
    setFilterCourseCodes('');
    setFilterContentType('all');
    setFilterBranch('پالایشگاه اصفهان');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterBranchBasis('learner');
    setFilterAttendance('all');
  };

  const users = db.getUsers().filter((u) => u.role === 'learner');
  const courses = db.getCourses();
  const attempts = db.getExamAttempts();
  const enrollments = db.getEnrollments();
  const evaluations = db.getKirkpatrickEvaluations();

  const reportRows = users.map((u, i) => {
    const course = courses[i % courses.length] || courses[0];
    const attempt = attempts.find((a) => a.user_id === u.id);
    const score = attempt ? Math.round((attempt.score / attempt.total_score) * 100) : 85 + (i % 12);
    const passed = score >= (course?.passing_grade || 60);

    return {
      personnel_code: u.national_id || `9900${10 + i}`,
      first_name: u.full_name.split(' ')[0] || u.full_name,
      last_name: u.full_name.split(' ').slice(1).join(' ') || 'کارمند',
      course_code: course?.code || '1115',
      course_title: course?.title || 'test',
      branch: u.department || 'پالایشگاه اصفهان',
      exam_score: `${score} از ۱۰۰`,
      exam_status: passed ? 'قبول' : 'مردود',
      progress: `${Math.min(100, 60 + i * 10)}٪`,
      attendance: 'حاضر',
      completion_date: '۱۴۰۵/۰۸/۰۹'
    };
  });

  const filteredReportRows = reportRows.filter((row) => {
    if (filterFirstName && !row.first_name.includes(filterFirstName)) return false;
    if (filterLastName && !row.last_name.includes(filterLastName)) return false;
    if (filterExamResult === 'passed' && row.exam_status !== 'قبول') return false;
    if (filterExamResult === 'failed' && row.exam_status !== 'مردود') return false;
    if (filterCourseCodes) {
      const codes = filterCourseCodes.split(',').map((c) => c.trim()).filter(Boolean);
      if (codes.length > 0 && !codes.includes(row.course_code)) return false;
    }
    return true;
  });


  const auditLogs = db.getAuditLogs();
  const filteredAuditLogs = auditLogs.filter(log => {
    if (logBranch !== 'همه' && log.branch && log.branch !== logBranch) return false;
    if (logGroup !== 'همه') {
      const roleMatches = 
        (logGroup === 'مدیر سیستم' && log.user_role === 'super_admin') ||
        (logGroup === 'مدیران' && (log.user_role === 'class_manager' || log.user_role === 'super_admin')) ||
        (logGroup === 'مدرسین' && log.user_role === 'instructor') ||
        (logGroup === 'فراگیران' && log.user_role === 'learner');
      if (!roleMatches) return false;
    }
    if (logUsername) {
      const q = logUsername.trim().toLowerCase();
      const match = 
        (log.employee_id && log.employee_id.toLowerCase().includes(q)) ||
        (log.username && log.username.toLowerCase().includes(q)) ||
        (log.user_name && log.user_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (logActivityType !== 'همه') {
      if (!log.action.includes(logActivityType)) return false;
    }
    return true;
  });

  const getActivityBadgeClass = (action: string) => {
    if (action.includes('ورود به سیستم') || action.includes('ورود موفق') || action.includes('ورود کاربر')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('ورود ناموفق') || action.includes('تلاش ناموفق')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('خروج')) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    if (action.includes('آزمون')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }
    if (action.includes('دانلود')) {
      return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    }
    if (action.includes('ویرایش') || action.includes('تنظیمات')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-4 text-slate-800 text-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>گزارش‌ها - {reportTitle}</span>
          <RotateCcw className="w-4 h-4 text-sky-600 cursor-pointer hover:rotate-180 transition-transform" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg flex-wrap">
          <button
            onClick={() => { setActiveReportMode('audit_log'); setReportTitle('گزارش رویدادنگاری (IdeaLms/Report/Log)'); }}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeReportMode === 'audit_log'
                ? 'bg-[#0288d1] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            گزارش رویدادنگاری (Log)
          </button>
          <button
            onClick={() => { setActiveReportMode('class_activity'); setReportTitle('گزارش فعالیت کلاسی فراگیران'); }}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeReportMode === 'class_activity'
                ? 'bg-[#0288d1] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            گزارش فعالیت کلاسی (سفارشی)
          </button>
          <button
            onClick={() => { setActiveReportMode('kirkpatrick'); setReportTitle('اثربخشی چهارسطحی کیرک‌پاتریک'); }}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeReportMode === 'kirkpatrick'
                ? 'bg-[#0288d1] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            اثربخشی چهارسطحی
          </button>
          <button
            onClick={() => { setActiveReportMode('iso'); setReportTitle('ماتریس شایستگی‌های شغلی ISO 10015'); }}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeReportMode === 'iso'
                ? 'bg-[#0288d1] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ماتریس شایستگی‌های شغلی
          </button>
        </div>
      </div>

      {activeReportMode === 'audit_log' && (
        <div className="space-y-3">
          {/* فیلترهای گزارش رویدادنگاری مطابق سامانه LMS */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-3">
            <div className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>فیلترهای گزارش رویدادنگاری (IdeaLms/Report/Log)</span>
              <span className="text-[11px] font-mono text-slate-500 font-normal">پالایشگاه نفت اصفهان</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">شعبه :</span>
                <select
                  value={logBranch}
                  onChange={(e) => setLogBranch(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="همه">همه شعب</option>
                  <option value="پالایشگاه اصفهان">پالایشگاه اصفهان</option>
                  <option value="مرکز آموزش فنی و تحقیقات">مرکز آموزش فنی و تحقیقات</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">گروه :</span>
                <select
                  value={logGroup}
                  onChange={(e) => setLogGroup(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="همه">همه گروه‌ها</option>
                  <option value="مدیر سیستم">مدیر سیستم</option>
                  <option value="مدرسین">مدرسین</option>
                  <option value="فراگیران">فراگیران</option>
                  <option value="مدیران">مدیران</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">نام کاربری :</span>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="کد پرسنلی یا نام کاربری..."
                  value={logUsername}
                  onChange={(e) => setLogUsername(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-mono text-left"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">نوع فعالیت :</span>
                <select
                  value={logActivityType}
                  onChange={(e) => setLogActivityType(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="همه">همه فعالیت‌ها</option>
                  <option value="ورود">ورود به سیستم</option>
                  <option value="خروج">خروج از سیستم</option>
                  <option value="ناموفق">ورود ناموفق</option>
                  <option value="آزمون">رویدادهای آزمون</option>
                  <option value="دانلود">دانلود فایل</option>
                  <option value="ویرایش">ویرایش تنظیمات</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">از تاریخ :</span>
                <PersianDatePicker
                  value={logDateFrom}
                  onChange={setLogDateFrom}
                  placeholder="۱۴۰۵/۰۱/۰۱"
                  inputClassName="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">تا تاریخ :</span>
                <PersianDatePicker
                  value={logDateTo}
                  onChange={setLogDateTo}
                  placeholder="۱۴۰۵/۱۲/۲۹"
                  inputClassName="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLogBranch('همه');
                    setLogGroup('همه');
                    setLogUsername('');
                    setLogActivityType('همه');
                    setLogDateFrom('');
                    setLogDateTo('');
                  }}
                  className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded transition-colors"
                >
                  حذف فیلترها
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => ExcelService.exportTableToExcel('audit-logs-table', 'گزارش_رویدادنگاری_LMS')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>خروجی اکسل</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-bold transition-colors shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ گزارش</span>
                </button>
              </div>
            </div>
          </div>

          {/* جدول گزارش رویدادنگاری */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span>تعداد کل رویدادها: <strong className="font-mono text-slate-900">{filteredAuditLogs.length}</strong> مورد ثبت شده</span>
              <span className="text-slate-400">سامانه یادگیری و آزمون الکترونیکی نفت</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs bg-white">
              <table id="audit-logs-table" className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3 w-12 text-center">ردیف</th>
                    <th className="py-2.5 px-3">نام کاربری</th>
                    <th className="py-2.5 px-3">نام و نام خانوادگی</th>
                    <th className="py-2.5 px-3">قسمت / بخش</th>
                    <th className="py-2.5 px-3 text-center">نوع فعالیت</th>
                    <th className="py-2.5 px-3">توضیحات</th>
                    <th className="py-2.5 px-3 text-center">تاریخ</th>
                    <th className="py-2.5 px-3 text-center">ساعت</th>
                    <th className="py-2.5 px-3 text-center">IP کاربر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        رویدادی با مشخصات جستجو شده یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log, idx) => (
                      <tr key={log.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-2 px-3 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {log.employee_id || log.username || '—'}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {log.user_name}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {log.department || 'پالایشگاه اصفهان'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${getActivityBadgeClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {log.details}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-600">
                          {log.shamsi_date || '۱۴۰۵/۰۸/۱۴'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-600">
                          {log.time_str || '۱۲:۰۰:۰۰'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-500">
                          {log.ip_address || '192.168.10.45'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReportMode === 'class_activity' && (
        <>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-3">
            <div className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
              گزارش فعالیت کلاسی فراگیران
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 space-y-3">
                <div className="grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 text-slate-700 font-semibold">عنوان گزارش :</span>
                  <div className="col-span-8">
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 text-slate-700 font-semibold">گروه بندی :</span>
                  <div className="col-span-8">
                    <select
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="بر اساس کلاس">بر اساس کلاس</option>
                      <option value="بر اساس واحد سازمانی">بر اساس واحد سازمانی</option>
                      <option value="بدون گروه بندی">بدون گروه بندی</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 text-slate-700 font-semibold">ترتیب نمایش :</span>
                  <div className="col-span-8">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="صعودی نام خانوادگی">صعودی نام خانوادگی</option>
                      <option value="نزولی نمره آزمون">نزولی نمره آزمون</option>
                      <option value="صعودی کد پرسنلی">صعودی کد پرسنلی</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 w-full space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>ستونهای انتخاب شده</span>
                    <span className="text-sky-700 font-mono">{selectedColumns.length} ستون</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="flex-1 h-36 border border-slate-300 rounded bg-white overflow-y-auto p-1 divide-y divide-slate-100">
                      {selectedColumns.map((colId) => {
                        const colDef = defaultAllColumns.find((c) => c.id === colId);
                        const isHigh = highlightedSelected === colId;
                        return (
                          <div
                            key={colId}
                            onClick={() => setHighlightedSelected(colId)}
                            className={`px-2 py-1 cursor-pointer text-xs rounded transition-colors ${
                              isHigh ? 'bg-[#0288d1] text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {colDef?.label || colId}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col justify-center gap-1">
                      <button
                        onClick={handleMoveUp}
                        className="p-1 border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
                        title="انتقال به بالا"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleMoveDown}
                        className="p-1 border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
                        title="انتقال به پایین"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 justify-center px-1">
                  <button
                    onClick={handleAddColumn}
                    className="p-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded shadow-xs"
                    title="افزودن به ستون‌های گزارش"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRemoveColumn}
                    className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded shadow-xs"
                    title="حذف از ستون‌های گزارش"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 w-full space-y-1">
                  <div className="flex items-center gap-1 border border-slate-300 rounded bg-white px-2 py-0.5">
                    <Search className="w-3 h-3 text-slate-400" />
                    <input
                      type="text"
                      value={colSearch}
                      onChange={(e) => setColSearch(e.target.value)}
                      placeholder="جستجوی ستون..."
                      className="w-full text-[11px] focus:outline-none"
                    />
                  </div>
                  <div className="h-30 border border-slate-300 rounded bg-white overflow-y-auto p-1 divide-y divide-slate-100">
                    {availableColumns.length === 0 ? (
                      <div className="p-2 text-center text-slate-400 text-[11px]">
                        ستون دیگری وجود ندارد
                      </div>
                    ) : (
                      availableColumns.map((c) => {
                        const isHigh = highlightedAvailable === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setHighlightedAvailable(c.id)}
                            className={`px-2 py-1 cursor-pointer text-xs rounded transition-colors ${
                              isHigh ? 'bg-[#0288d1] text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.label}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-3">
            <div className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
              محدوده شروط
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">نام :</span>
                <input
                  type="text"
                  value={filterFirstName}
                  onChange={(e) => setFilterFirstName(e.target.value)}
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-24">نام خانوادگی :</span>
                <input
                  type="text"
                  value={filterLastName}
                  onChange={(e) => setFilterLastName(e.target.value)}
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">نتیجه آزمون :</span>
                <select
                  value={filterExamResult}
                  onChange={(e) => setFilterExamResult(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="all">همه</option>
                  <option value="passed">قبول</option>
                  <option value="failed">مردود</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">کد کلاس :</span>
                <input
                  type="text"
                  value={filterCourseCodes}
                  onChange={(e) => setFilterCourseCodes(e.target.value)}
                  placeholder="با کاما جدا کنید..."
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded bg-white text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">نوع محتوا :</span>
                <select
                  value={filterContentType}
                  onChange={(e) => setFilterContentType(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="all">همه</option>
                  <option value="video">ویدیو</option>
                  <option value="scorm">چندرسانه‌ای تعاملی</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-24">شعبه کاربر :</span>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="پالایشگاه اصفهان">پالایشگاه اصفهان</option>
                  <option value="مرکز آموزش فنی و تحقیقات">مرکز آموزش فنی و تحقیقات</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">تاریخ کلاس :</span>
                <div className="flex items-center gap-1">
                  <PersianDatePicker
                    value={filterDateFrom}
                    onChange={setFilterDateFrom}
                    placeholder="از"
                    inputClassName="w-20"
                  />
                  <PersianDatePicker
                    value={filterDateTo}
                    onChange={setFilterDateTo}
                    placeholder="تا"
                    inputClassName="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0 w-20">وضعیت حضور :</span>
                <select
                  value={filterAttendance}
                  onChange={(e) => setFilterAttendance(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="all">همه</option>
                  <option value="present">حاضر</option>
                  <option value="absent">غایب</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <span className="text-slate-600 font-semibold">مبنای فیلتر شعبه :</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="branchBasis"
                    checked={filterBranchBasis === 'learner'}
                    onChange={() => setFilterBranchBasis('learner')}
                    className="text-[#0288d1] focus:ring-0"
                  />
                  <span>فراگیر</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="branchBasis"
                    checked={filterBranchBasis === 'class'}
                    onChange={() => setFilterBranchBasis('class')}
                    className="text-[#0288d1] focus:ring-0"
                  />
                  <span>کلاس</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="branchBasis"
                    checked={filterBranchBasis === 'supervised'}
                    onChange={() => setFilterBranchBasis('supervised')}
                    className="text-[#0288d1] focus:ring-0"
                  />
                  <span>تحت نظارت</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    checked={showConditionsInReport}
                    onChange={(e) => setShowConditionsInReport(e.target.checked)}
                    className="rounded text-[#0288d1] focus:ring-0"
                  />
                  <span>نمایش شرایط در گزارش</span>
                </label>

                <button
                  onClick={handleClearConditions}
                  className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded transition-colors"
                >
                  حذف شرایط
                </button>

                <button
                  onClick={() => setIsReportGenerated(true)}
                  className="px-5 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-bold rounded shadow-xs transition-colors"
                >
                  مشاهده گزارش
                </button>
              </div>
            </div>
          </div>

          {isReportGenerated && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span>نتایج گزارش: {filteredReportRows.length} ردیف یافت شد</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => ExcelService.exportTableToExcel('class-activity-table', 'گزارش_فعالیت_کلاسی')}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>خروجی اکسل</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>چاپ گزارش</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table id="class-activity-table" className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-300">
                      <th className="py-2.5 px-3 w-12 text-center">ردیف</th>
                      {selectedColumns.map((colId) => {
                        const colDef = defaultAllColumns.find((c) => c.id === colId);
                        return (
                          <th key={colId} className="py-2.5 px-3">
                            {colDef?.label || colId}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredReportRows.length === 0 ? (
                      <tr>
                        <td colSpan={selectedColumns.length + 1} className="py-8 text-center text-slate-400">
                          هیچ رکوردی منطبق با شرایط وارد شده پیدا نشد.
                        </td>
                      </tr>
                    ) : (
                      filteredReportRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-sky-50/50 transition-colors">
                          <td className="py-2 px-3 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          {selectedColumns.map((colId) => {
                            const val = (row as any)[colId] || '-';
                            return (
                              <td key={colId} className="py-2 px-3">
                                {colId === 'exam_status' ? (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                                      val === 'قبول'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}
                                  >
                                    {val === 'قبول' ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <XCircle className="w-3 h-3 text-rose-600" />
                                    )}
                                    <span>{val}</span>
                                  </span>
                                ) : (
                                  <span>{val}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeReportMode === 'kirkpatrick' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <span className="text-[11px] text-slate-500 block">سطح ۱: واکنش فراگیران</span>
              <div className="text-xl font-bold text-slate-800">۴.۸ از ۵</div>
              <span className="text-[11px] text-emerald-700 font-semibold">رضایت عالی از اساتید</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <span className="text-[11px] text-slate-500 block">سطح ۲: یادگیری و آزمون</span>
              <div className="text-xl font-bold text-slate-800">۸۸.۴٪ میانگین</div>
              <span className="text-[11px] text-emerald-700 font-semibold">نرخ قبولی بالای ۹۰٪</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <span className="text-[11px] text-slate-500 block">سطح ۳: تغییر رفتار شغلی</span>
              <div className="text-xl font-bold text-slate-800">۴.۲ از ۵</div>
              <span className="text-[11px] text-sky-700 font-semibold">ارزیابی مدیران واحد</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <span className="text-[11px] text-slate-500 block">سطح ۴: نتایج و ROI سازمانی</span>
              <div className="text-xl font-bold text-emerald-700">+۲۱۴٪ بازدهی</div>
              <span className="text-[11px] text-slate-600 font-semibold">کاهش حوادث صنعتی</span>
            </div>
          </div>
        </div>
      )}

      {activeReportMode === 'iso' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
            ماتریس شایستگی‌های شغلی و فرآیند پایش دوره‌ها
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2.5">عنوان شایستگی شغلی</th>
                  <th className="p-2.5">کد دوره مرتبط</th>
                  <th className="p-2.5">گروه هدف</th>
                  <th className="p-2.5">ساعت مصوب</th>
                  <th className="p-2.5">وضعیت پایش</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-800">{c.title}</td>
                    <td className="p-2 font-mono text-slate-600">{c.code}</td>
                    <td className="p-2 text-slate-600">{c.target_audience || 'کلیه پرسنل'}</td>
                    <td className="p-2 font-mono">{c.duration_hours} ساعت</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        تکمیل و ارزیابی شده
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400 font-mono">
        مدیریت یکپارچه آموزش و یادگیری ایده ( ۷.۵۰.۰۰.۸۸ )
      </div>
    </div>
  );
};
