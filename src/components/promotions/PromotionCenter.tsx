import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import {
  JobProfile,
  JobRequiredCourse,
  OrgUnit,
  PromotionPlan,
  PromotionCourseSchedule,
  User
} from '../../types/models';
import { ExcelService } from '../../services/excelService';
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  X,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';

export const PromotionCenter: React.FC = () => {
  const { settings, activeRole, activeUser, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [activeTab, setActiveTab] = useState<'overview' | 'org_and_jobs' | 'planner' | 'plans_list' | 'excel'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // داده‌های دیتابیس
  const orgUnits = db.getOrgUnits();
  const jobProfiles = db.getJobProfiles();
  const promotionPlans = db.getPromotionPlans();
  const allUsers = db.getUsers();

  // فیلترها و جستجو
  const [jobSearch, setJobSearch] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [planSearch, setPlanSearch] = useState('');

  // استیت‌های مودال تعریف/ویرایش شناسنامه شغلی
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<{
    job_code: string;
    title: string;
    org_unit_name: string;
    grade_level: string;
    education_requirement: string;
    experience_years_required: number;
    general_competencies_str: string;
    technical_competencies_str: string;
    next_promotion_job_title: string;
    required_courses: { id: string; course_name: string; duration_hours: number; category: any; is_mandatory: boolean }[];
  }>({
    job_code: '',
    title: '',
    org_unit_name: 'مدیریت عملیات و پالایش نفت',
    grade_level: 'رده ۱۲ - کارشناسی',
    education_requirement: 'کارشناسی مهندسی نفت / شیمی',
    experience_years_required: 3,
    general_competencies_str: 'کار تیمی, مدیریت بحران, گزارش‌نویسی',
    technical_competencies_str: 'کنترل فرآیند, استانداردهای نفت و گاز',
    next_promotion_job_title: '',
    required_courses: [
      { id: '1', course_name: 'اصول ایمنی فرآیند و مجوزهای کار PTW', duration_hours: 24, category: 'ایمنی و HSE', is_mandatory: true }
    ]
  });

  // استیت‌های برنامه‌ریزی انتصاب پرسنل (Planner)
  const [plannerUserId, setPlannerUserId] = useState<string>(allUsers.find(u => u.role === 'learner')?.id || allUsers[0]?.id || '');
  const [plannerTargetJobId, setPlannerTargetJobId] = useState<string>(jobProfiles[1]?.id || '');
  const [plannerHorizon, setPlannerHorizon] = useState<'6months' | '9months' | '12months' | 'custom'>('6months');
  const [customStartDate, setCustomStartDate] = useState('۱۴۰۵/۰۹/۰۱');
  const [customEndDate, setCustomEndDate] = useState('۱۴۰۶/۰۲/۳۰');
  const [plannerNotes, setPlannerNotes] = useState('');

  // لیست دوره‌های تنظیم‌شده توسط کاربر در فرم برنامه‌ریزی (نام و ساعت دوره کاملا توسط کاربر قابل تعیین است)
  const [configuredCourses, setConfiguredCourses] = useState<
    { id: string; course_name: string; duration_hours: number; category: string; target_quarter: string; priority: 'high' | 'medium' | 'low'; instructor_name: string }[]
  >([]);

  // استیت مشاهده سند چاپی رسمی
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);

  // استیت آپلود اکسل
  const [excelImportLoading, setExcelImportLoading] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // انجام تحلیل شکاف شایستگی به محض تغییر پرسنل یا شغل هدف
  const gapAnalysis = useMemo(() => {
    if (!plannerUserId || !plannerTargetJobId) return null;
    return db.analyzePromotionGap(plannerUserId, plannerTargetJobId);
  }, [plannerUserId, plannerTargetJobId]);

  // پر کردن اولیه دوره‌های فرم برنامه‌ریزی بر اساس پیشنهاد سیستم
  const handleLoadRecommendedCourses = () => {
    if (!gapAnalysis || !gapAnalysis.targetJob) return;

    // توزیع دوره‌ها در طول بازه زمانی انتخابی
    const quarters =
      plannerHorizon === '6months'
        ? ['ماه اول', 'ماه دوم و سوم', 'ماه چهارم و پنجم', 'ماه ششم']
        : plannerHorizon === '9months'
        ? ['سه ماهه اول', 'سه ماهه دوم', 'سه ماهه سوم']
        : ['فصل بهار', 'فصل تابستان', 'فصل پاییز', 'فصل زمستان'];

    const newConfigured = gapAnalysis.missingCourses.map((req, idx) => ({
      id: `cfg_${Date.now()}_${idx}`,
      course_name: req.course_name,
      duration_hours: req.duration_hours || 24,
      category: req.category || 'تخصصی',
      target_quarter: quarters[idx % quarters.length],
      priority: (idx === 0 ? 'high' : 'medium') as 'high' | 'medium' | 'low',
      instructor_name: 'مرکز آموزش پالایشگاه'
    }));

    // اگر همه گذرانده شده بودند، تمام دوره‌های شغل را برای بازآموزی بیاور
    if (newConfigured.length === 0 && gapAnalysis.requiredCourses.length > 0) {
      gapAnalysis.requiredCourses.forEach((req, idx) => {
        newConfigured.push({
          id: `cfg_${Date.now()}_${idx}`,
          course_name: req.course_name,
          duration_hours: req.duration_hours || 24,
          category: req.category || 'تخصصی',
          target_quarter: quarters[idx % quarters.length],
          priority: 'medium',
          instructor_name: 'مرکز آموزش پالایشگاه'
        });
      });
    }

    setConfiguredCourses(newConfigured);
    showToast('دوره‌های پیشنهادی شغل هدف در جدول زمان‌بندی بارگذاری شدند. می‌توانید نام و ساعت را ویرایش نمایید.');
  };

  // افزودن دوره دستی توسط خود کاربر
  const handleAddCustomCourseToPlanner = () => {
    setConfiguredCourses([
      ...configuredCourses,
      {
        id: `custom_${Date.now()}`,
        course_name: 'دوره جدید شایستگی تخصصی',
        duration_hours: 24,
        category: 'تخصصی',
        target_quarter: 'ماه سوم',
        priority: 'high',
        instructor_name: 'استاد مدعو'
      }
    ]);
  };

  // حذف دوره از برنامه ریز
  const handleRemovePlannerCourse = (id: string) => {
    setConfiguredCourses(configuredCourses.filter(c => c.id !== id));
  };

  // ویرایش فیلدهای دوره در برنامه‌ریز
  const handleUpdatePlannerCourse = (id: string, field: string, val: any) => {
    setConfiguredCourses(
      configuredCourses.map(c => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  // ثبت و ذخیره برنامه آموزشی انتصاب پرسنل
  const handleSavePromotionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const user = allUsers.find(u => u.id === plannerUserId);
    const targetJob = jobProfiles.find(j => j.id === plannerTargetJobId);

    if (!user || !targetJob) {
      showToast('خطا: لطفاً پرسنل و انتصاب هدف را انتخاب کنید.');
      return;
    }

    if (configuredCourses.length === 0) {
      showToast('خطا: حداقل یک دوره آموزشی برای برنامه انتصاب باید تعریف یا تایید شود.');
      return;
    }

    const horizonLabel =
      plannerHorizon === '6months'
        ? `بازه ۶ ماهه (${customStartDate} الی ${customEndDate})`
        : plannerHorizon === '9months'
        ? `بازه ۹ ماهه (${customStartDate} الی ${customEndDate})`
        : plannerHorizon === '12months'
        ? `بازه یک ساله ۱۴۰۵ (${customStartDate} الی ${customEndDate})`
        : `بازه سفارشی (${customStartDate} الی ${customEndDate})`;

    const totalHours = configuredCourses.reduce((sum, c) => sum + Number(c.duration_hours || 0), 0);

    const scheduleItems: PromotionCourseSchedule[] = configuredCourses.map((c, idx) => ({
      id: `psch_${Date.now()}_${idx}`,
      course_name: c.course_name,
      duration_hours: Number(c.duration_hours || 24),
      category: c.category,
      planned_start_date: customStartDate,
      planned_end_date: customEndDate,
      target_quarter: c.target_quarter,
      status: 'not_started',
      priority: c.priority,
      instructor_name: c.instructor_name
    }));

    db.addPromotionPlan({
      personnel_id: user.id,
      personnel_name: user.full_name,
      employee_id: user.employee_id || user.national_id,
      national_id: user.national_id,
      department: user.department,
      current_job_id: 'job_current',
      current_job_title: user.job_title || 'کارشناس',
      target_job_id: targetJob.id,
      target_job_title: targetJob.title,
      planning_horizon: horizonLabel,
      start_date: customStartDate,
      end_date: customEndDate,
      readiness_score: 15,
      total_hours_required: totalHours,
      completed_hours: 0,
      status: 'in_progress',
      approved_by: activeUser.full_name,
      notes: plannerNotes || `برنامه شایستگی‌های ارتقا به پست ${targetJob.title} تنظیم گردید.`,
      courses_schedule: scheduleItems
    });

    triggerRefresh();
    showToast(`برنامه آموزشی ارتقای شغلی برای «${user.full_name}» با موفقیت ثبت شد.`);
    setActiveTab('plans_list');
  };

  // ذخیره شناسنامه شغلی جدید یا ویرایشی
  const handleSaveJobProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.job_code.trim()) {
      showToast('لطفاً عنوان و کد شغل را وارد نمایید.');
      return;
    }

    const genComp = jobForm.general_competencies_str.split(/[,،]/).map(s => s.trim()).filter(Boolean);
    const techComp = jobForm.technical_competencies_str.split(/[,،]/).map(s => s.trim()).filter(Boolean);

    const targetJobObj = jobProfiles.find(j => j.title === jobForm.next_promotion_job_title);
    const nextJobIds = targetJobObj ? [targetJobObj.id] : [];

    if (editingJobId) {
      db.updateJobProfile(editingJobId, {
        job_code: jobForm.job_code,
        title: jobForm.title,
        org_unit_name: jobForm.org_unit_name,
        grade_level: jobForm.grade_level,
        education_requirement: jobForm.education_requirement,
        experience_years_required: Number(jobForm.experience_years_required),
        general_competencies: genComp,
        technical_competencies: techComp,
        next_promotion_job_ids: nextJobIds,
        required_courses: jobForm.required_courses
      });
      showToast('شناسنامه شغلی با موفقیت ویرایش شد.');
    } else {
      db.addJobProfile({
        job_code: jobForm.job_code,
        title: jobForm.title,
        org_unit_id: 'unit_custom',
        org_unit_name: jobForm.org_unit_name,
        grade_level: jobForm.grade_level,
        education_requirement: jobForm.education_requirement,
        experience_years_required: Number(jobForm.experience_years_required),
        general_competencies: genComp,
        technical_competencies: techComp,
        next_promotion_job_ids: nextJobIds,
        required_courses: jobForm.required_courses
      });
      showToast('شناسنامه شغلی جدید با موفقیت ثبت گردید.');
    }

    setIsJobModalOpen(false);
    setEditingJobId(null);
    triggerRefresh();
  };

  // مدیریت آپلود اکسل شناسنامه‌ها
  const handleProcessExcel = async () => {
    if (!excelFile) {
      showToast('لطفاً ابتدا یک فایل اکسل انتخاب کنید.');
      return;
    }

    setExcelImportLoading(true);
    try {
      const parsed = await ExcelService.parseJobProfilesFile(excelFile);
      if (parsed.length === 0) {
        showToast('هیچ شناسنامه شغلی در فایل اکسل یافت نشد.');
      } else {
        parsed.forEach(p => db.addJobProfile(p));
        triggerRefresh();
        showToast(`تعداد ${parsed.length} شناسنامه شغلی به همراه شایستگی‌ها و دوره‌ها از فایل اکسل اضافه گردید.`);
        setExcelFile(null);
        setActiveTab('org_and_jobs');
      }
    } catch (err: any) {
      showToast('خطا در پردازش فایل اکسل: ' + (err?.message || 'قالب نامعتبر است'));
    } finally {
      setExcelImportLoading(false);
    }
  };

  // آمار کلیدی
  const readyCandidatesCount = promotionPlans.filter(p => p.readiness_score >= 80).length;
  const inProgressPlansCount = promotionPlans.filter(p => p.status === 'in_progress').length;
  const totalPlannedHours = promotionPlans.reduce((sum, p) => sum + (p.total_hours_required || 0), 0);

  // فیلتر کردن شغل‌ها
  const filteredJobProfiles = jobProfiles.filter(j => {
    const matchSearch = j.title.includes(jobSearch) || j.job_code.includes(jobSearch) || j.education_requirement.includes(jobSearch);
    const matchUnit = selectedUnitFilter === 'all' || j.org_unit_name.includes(selectedUnitFilter);
    return matchSearch && matchUnit;
  });

  return (
    <div className="space-y-6">
      {/* پیام بازخورد (Toast) */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* سربرگ اختصاصی مدیریت ترفیع و انتصابات */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-sm shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{settings.org_name || 'شرکت پالایش نفت اصفهان'}</span>
              <span aria-hidden="true">·</span>
              <span>سامانه سرمایه انسانی و شایستگی‌ها</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              مدیریت ترفیع، انتصابات و شناسنامه‌های شغلی
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ثبت شرایط احراز شغل، تحلیل گپ شایستگی پرسنل، پیشنهاد خودکار و برنامه‌ریزی دوره‌های مورد نیاز جهت انتصاب بعدی
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setActiveTab('planner');
              if (gapAnalysis && configuredCourses.length === 0) {
                handleLoadRecommendedCourses();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>برنامه‌ریزی انتصاب جدید</span>
          </button>
          <button
            onClick={() => {
              setEditingJobId(null);
              setIsJobModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>تعریف شناسنامه شغلی</span>
          </button>
        </div>
      </div>

      {/* نوار کارت‌های آماری کلیدی */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block mb-1">شناسنامه‌های شغلی فعال</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{jobProfiles.length} شغل</span>
            <span className="text-[11px] text-emerald-700 block mt-1">دارای شرایط احراز و دوره‌های معین</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block mb-1">طرح‌های فعال برنامه‌ریزی انتصاب</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{inProgressPlansCount} پرسنل</span>
            <span className="text-[11px] text-sky-700 block mt-1">درحال گذراندن دوره‌های شایستگی</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block mb-1">پرسنل واجد شرایط و آماده انتصاب</span>
            <span className="text-2xl font-bold font-mono text-emerald-700">{readyCandidatesCount} نفر</span>
            <span className="text-[11px] text-emerald-700 block mt-1">آمادگی بالای ۸۰٪ جهت ترفیع</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block mb-1">مجموع ساعات دوره‌های برنامه‌ریزی</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{totalPlannedHours} ساعت</span>
            <span className="text-[11px] text-amber-700 block mt-1">در قالب تقویم شایستگی‌ها</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* تب‌های ناوبری اصلی بخش ترفیع و انتصابات */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-[#0288d1] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>میز کار و داشبورد ترفیعات</span>
        </button>

        <button
          onClick={() => setActiveTab('org_and_jobs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'org_and_jobs'
              ? 'bg-white text-[#0288d1] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>ساختار سازمانی و شناسنامه‌های شغلی</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('planner');
            if (configuredCourses.length === 0) {
              handleLoadRecommendedCourses();
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'planner'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>برنامه‌ریزی دوره‌های انتصاب (پیشنهاد و زمان‌بندی)</span>
        </button>

        <button
          onClick={() => setActiveTab('plans_list')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'plans_list'
              ? 'bg-white text-[#0288d1] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>طرح‌های فعال انتصاب و کارنامه آمادگی</span>
        </button>

        <button
          onClick={() => setActiveTab('excel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'excel'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>ورود و خروجی اکسل (Excel Center)</span>
        </button>
      </div>

      {/* ۱. تب پیشخوان ترفیعات و کارنامه آمادگی */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* کارت وضعیت ارتقای شغلی با فیلتر */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">مسیرهای ارتقای فعال پرسنل در سازمان</h2>
                <p className="text-xs text-slate-500">پایش درصد آمادگی و دوره‌های گذرانده‌شده هر پرسنل به ازای انتصاب بعدی</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('planner');
                  handleLoadRecommendedCourses();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تعریف برنامه انتصاب برای پرسنل</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotionPlans.map(plan => {
                const completedCount = plan.courses_schedule.filter(c => c.status === 'completed').length;
                const totalCount = plan.courses_schedule.length;
                const isReady = plan.readiness_score >= 80;

                return (
                  <div
                    key={plan.id}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-4 space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{plan.personnel_name}</span>
                          <span className="font-mono text-slate-500 text-[11px]">({plan.employee_id})</span>
                        </div>
                        <span className="text-xs text-slate-500">{plan.department}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {isReady ? 'واجد شرایط انتصاب' : 'در حال اجرای طرح'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>پست فعلی: <strong className="text-slate-800">{plan.current_job_title}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>انتصاب هدف: {plan.target_job_title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>بازه زمانی: {plan.planning_horizon}</span>
                        <span>دوره‌ها: {completedCount} از {totalCount} گذرانده شد</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>شاخص آمادگی احراز شغل (Readiness Index):</span>
                        <span className="font-mono font-bold text-emerald-700">{plan.readiness_score}٪</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isReady ? 'bg-emerald-600' : 'bg-[#0288d1]'
                          }`}
                          style={{ width: `${plan.readiness_score}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <button
                        onClick={() => setViewingPlanId(plan.id)}
                        className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-bold cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>مشاهده و چاپ سند انتصاب</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('plans_list');
                        }}
                        className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                      >
                        <span>ثبت نمرات و وضعیت ←</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ۲. تب ساختار سازمانی و شناسنامه‌های شغلی */}
      {activeTab === 'org_and_jobs' && (
        <div className="space-y-6">
          {/* بخش واحدهای سازمانی */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0288d1]" />
                <h2 className="text-sm font-bold text-slate-900">واحدهای سازمانی و چارت مدیریت‌ها</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">{orgUnits.length} واحد فعال</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orgUnits.map(unit => (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnitFilter(selectedUnitFilter === unit.name ? 'all' : unit.name)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedUnitFilter === unit.name
                      ? 'border-[#0288d1] bg-sky-50/60 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{unit.name}</span>
                    <span className="font-mono text-[10px] text-slate-500 px-1.5 py-0.5 bg-white rounded border border-slate-200">
                      {unit.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{unit.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <span>مدیر: {unit.manager_name}</span>
                    <span>پرسنل: {unit.employee_count} نفر</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* فهرست شناسنامه‌های شغلی و شرایط احراز */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">شناسنامه‌های شغلی، شرایط احراز و دوره‌های الزامی</h2>
                <p className="text-xs text-slate-500">
                  به ازای هر شغل، شایستگی‌ها، پیش‌نیازهای تحصیلی و فهرست دوره‌های آموزشی با ذکر ساعت تعریف شده است
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={e => setJobSearch(e.target.value)}
                    placeholder="جستجوی شغل یا کد..."
                    className="w-48 sm:w-60 text-xs px-3 py-1.5 pr-8 border border-slate-300 rounded-lg"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2" />
                </div>

                <button
                  onClick={() => {
                    setEditingJobId(null);
                    setJobForm({
                      job_code: `JOB-${Date.now().toString().slice(-4)}`,
                      title: '',
                      org_unit_name: orgUnits[0]?.name || 'مدیریت عملیات',
                      grade_level: 'رده ۱۱ - کارشناسی',
                      education_requirement: 'کارشناسی مهندسی',
                      experience_years_required: 3,
                      general_competencies_str: 'حل مسئله, کار تیمی',
                      technical_competencies_str: 'دانش فنی پالایشگاهی',
                      next_promotion_job_title: '',
                      required_courses: [
                        { id: '1', course_name: 'اصول ایمنی فرآیند در پالایشگاه', duration_hours: 24, category: 'ایمنی و HSE', is_mandatory: true }
                      ]
                    });
                    setIsJobModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن شناسنامه شغل</span>
                </button>
              </div>
            </div>

            {selectedUnitFilter !== 'all' && (
              <div className="flex items-center gap-2 text-xs text-sky-800 bg-sky-50 px-3 py-1.5 rounded-lg">
                <span>فیلتر فعال: <strong>{selectedUnitFilter}</strong></span>
                <button
                  onClick={() => setSelectedUnitFilter('all')}
                  className="text-xs text-rose-600 hover:underline mr-auto cursor-pointer"
                >
                  حذف فیلتر
                </button>
              </div>
            )}

            <div className="space-y-4">
              {filteredJobProfiles.map(job => {
                const totalCourseHours = job.required_courses.reduce((sum, c) => sum + c.duration_hours, 0);

                return (
                  <div
                    key={job.id}
                    className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/40 hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                            {job.job_code}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                          <span className="text-xs text-slate-500 font-medium">({job.grade_level})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>واحد: <strong>{job.org_unit_name}</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>حداقل مدرک: <strong>{job.education_requirement}</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>سابقه کار الزامی: <strong>{job.experience_years_required} سال</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingJobId(job.id);
                            setJobForm({
                              job_code: job.job_code,
                              title: job.title,
                              org_unit_name: job.org_unit_name,
                              grade_level: job.grade_level,
                              education_requirement: job.education_requirement,
                              experience_years_required: job.experience_years_required,
                              general_competencies_str: job.general_competencies.join(', '),
                              technical_competencies_str: job.technical_competencies.join(', '),
                              next_promotion_job_title:
                                jobProfiles.find(j => j.id === job.next_promotion_job_ids[0])?.title || '',
                              required_courses: [...job.required_courses]
                            });
                            setIsJobModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="ویرایش شناسنامه شغلی"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (jobProfiles.length <= 1) {
                              showToast('امکان حذف آخرین شناسنامه شغلی وجود ندارد.');
                              return;
                            }
                            db.deleteJobProfile(job.id);
                            triggerRefresh();
                            showToast(`شناسنامه شغلی ${job.title} حذف گردید.`);
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف شغل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* شایستگی‌ها */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-700 block">شایستگی‌های عمومی و رفتاری:</span>
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                          {job.general_competencies.map((gc, i) => (
                            <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                              {gc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-700 block">شایستگی‌های تخصصی و مهارتی:</span>
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                          {job.technical_competencies.map((tc, i) => (
                            <span key={i} className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-medium">
                              {tc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* جدول دوره‌های الزامی این شغل با ساعت‌های مشخص */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          دوره‌های آموزشی الزامی این شغل ({job.required_courses.length} دوره · مجموع {totalCourseHours} ساعت آموزش):
                        </span>
                        {job.next_promotion_job_ids.length > 0 && (
                          <span className="text-emerald-700 font-bold">
                            مسیر ارتقای بعدی: {jobProfiles.find(j => j.id === job.next_promotion_job_ids[0])?.title || 'پست سرپرستی'}
                          </span>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs bg-white rounded-lg overflow-hidden border border-slate-200">
                          <thead className="bg-slate-100 text-slate-600 font-bold">
                            <tr>
                              <th className="py-2 px-3">ردیف</th>
                              <th className="py-2 px-3">عنوان دوره آموزشی</th>
                              <th className="py-2 px-3">ساعت دوره</th>
                              <th className="py-2 px-3">گروه شایستگی</th>
                              <th className="py-2 px-3">حداقل نمره قبولی</th>
                              <th className="py-2 px-3">شرح سرفصل</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {job.required_courses.map((req, rIdx) => (
                              <tr key={req.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono">{rIdx + 1}</td>
                                <td className="py-2 px-3 font-bold text-slate-900">{req.course_name}</td>
                                <td className="py-2 px-3 font-mono font-bold text-emerald-700">{req.duration_hours} ساعت</td>
                                <td className="py-2 px-3">{req.category}</td>
                                <td className="py-2 px-3 font-mono">{req.min_score || 70} از ۱۰۰</td>
                                <td className="py-2 px-3 text-[11px] text-slate-500">{req.description || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ۳. تب برنامه‌ریزی دوره‌های انتصاب پرسنل (پیشنهاد هوشمند، تنظیم بازه و ساعت) */}
      {activeTab === 'planner' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              برنامه‌ریزی دوره‌های آموزشی ارتقا و انتصاب پرسنل
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              سیستم به ازای پرسنل و انتصاب هدف، دوره‌های کسری را پیشنهاد می‌دهد؛ سپس بازه زمانی، اسم و ساعت دوره‌ها را تنظیم و برنامه نهایی را ثبت کنید.
            </p>
          </div>

          <form onSubmit={handleSavePromotionPlan} className="space-y-6 text-xs">
            {/* انتخاب پرسنل و انتصاب هدف */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  ۱. انتخاب پرسنل متقاضی یا کاندیدای ارتقا:
                </label>
                <select
                  value={plannerUserId}
                  onChange={e => {
                    setPlannerUserId(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} — کد پرسنلی: {u.employee_id || u.national_id} ({u.job_title || 'کارشناس'} / {u.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  ۲. تعیین پست و انتصاب بعدی مورد هدف (Target Promotion):
                </label>
                <select
                  value={plannerTargetJobId}
                  onChange={e => {
                    setPlannerTargetJobId(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                >
                  {jobProfiles.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.grade_level}) — واحد {j.org_unit_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* جعبه پیشنهاد خودکار و تحلیل شکاف شایستگی سیستم */}
            {gapAnalysis && gapAnalysis.targetJob && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-bold text-emerald-950 text-sm">
                      تحلیل شکاف شایستگی و دوره‌های پیشنهادی سیستم برای احراز شغل: {gapAnalysis.targetJob.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleLoadRecommendedCourses}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>بارگذاری دوره‌های پیشنهادی در جدول برنامه</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                    <span className="text-slate-500 block mb-0.5">آمادگی فعلی پرسنل:</span>
                    <span className="text-lg font-bold font-mono text-emerald-700">{gapAnalysis.readinessPercent}٪</span>
                    <span className="text-[10px] text-slate-500 block">بر مبنای دوره‌های سپری‌شده</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                    <span className="text-slate-500 block mb-0.5">دوره‌های پیش‌نیاز گذرانده‌شده:</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{gapAnalysis.completedCourses.length} دوره</span>
                    <span className="text-[10px] text-emerald-700 block">منطبق با شرایط احراز</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                    <span className="text-slate-500 block mb-0.5">کسری دوره‌ها جهت انتصاب:</span>
                    <span className="text-lg font-bold font-mono text-amber-700">{gapAnalysis.missingCourses.length} دوره</span>
                    <span className="text-[10px] text-slate-500 block">مجموع {gapAnalysis.totalHoursNeeded} ساعت کسری آموزش</span>
                  </div>
                </div>

                {gapAnalysis.missingCourses.length > 0 ? (
                  <div className="text-xs text-emerald-900">
                    <span className="font-bold">دوره‌های پیشنهادی سیستم: </span>
                    {gapAnalysis.missingCourses.map(c => c.course_name).join(' · ')}
                  </div>
                ) : (
                  <div className="text-xs text-emerald-800 font-bold">
                    ✓ پرسنل منتخب تمامی دوره‌های این شغل را سپری کرده و دارای شایستگی کامل جهت انتصاب است.
                  </div>
                )}
              </div>
            )}

            {/* تعیین بازه زمانی توسط کاربر */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900">
                ۳. تعیین بازه زمانی برنامه‌ریزی (توسط کاربر):
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <label
                  onClick={() => {
                    setPlannerHorizon('6months');
                    setCustomStartDate('۱۴۰۵/۰۹/۰۱');
                    setCustomEndDate('۱۴۰۶/۰۲/۳۰');
                  }}
                  className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${
                    plannerHorizon === '6months' ? 'border-[#0288d1] bg-sky-50 font-bold text-sky-900' : 'border-slate-300 bg-white'
                  }`}
                >
                  <input type="radio" name="horizon" checked={plannerHorizon === '6months'} readOnly className="sr-only" />
                  <span>بازه ۶ ماهه</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">۶ ماه قبل از موعد انتصاب</span>
                </label>

                <label
                  onClick={() => {
                    setPlannerHorizon('9months');
                    setCustomStartDate('۱۴۰۵/۰۹/۰۱');
                    setCustomEndDate('۱۴۰۶/۰۵/۳۰');
                  }}
                  className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${
                    plannerHorizon === '9months' ? 'border-[#0288d1] bg-sky-50 font-bold text-sky-900' : 'border-slate-300 bg-white'
                  }`}
                >
                  <input type="radio" name="horizon" checked={plannerHorizon === '9months'} readOnly className="sr-only" />
                  <span>بازه ۹ ماهه</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">طرح فشرده ارتقای شایستگی</span>
                </label>

                <label
                  onClick={() => {
                    setPlannerHorizon('12months');
                    setCustomStartDate('۱۴۰۵/۰۹/۰۱');
                    setCustomEndDate('۱۴۰۶/۰۸/۳۰');
                  }}
                  className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${
                    plannerHorizon === '12months' ? 'border-[#0288d1] bg-sky-50 font-bold text-sky-900' : 'border-slate-300 bg-white'
                  }`}
                >
                  <input type="radio" name="horizon" checked={plannerHorizon === '12months'} readOnly className="sr-only" />
                  <span>بازه یک ساله (۱۴۰۵)</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">تقویم سالانه آموزش پرسنل</span>
                </label>

                <label
                  onClick={() => setPlannerHorizon('custom')}
                  className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${
                    plannerHorizon === 'custom' ? 'border-[#0288d1] bg-sky-50 font-bold text-sky-900' : 'border-slate-300 bg-white'
                  }`}
                >
                  <input type="radio" name="horizon" checked={plannerHorizon === 'custom'} readOnly className="sr-only" />
                  <span>بازه زمانی دلخواه</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">انتخاب تاریخ‌های اختصاصی</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-600 mb-1">تاریخ شروع بازه آموزشی:</label>
                  <input
                    type="text"
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">تاریخ هدف پایان و زمان انتصاب:</label>
                  <input
                    type="text"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* جدول دوره‌های برنامه‌ریزی با امکان ویرایش نام دوره و ساعت دوره توسط خود کاربر */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    ۴. جدول دوره‌های آموزشی اختصاصی پرسنل (نام و ساعت دوره‌ها را می‌توانید تغییر دهید):
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    کاربر به صورت کامل می‌تواند اسم دوره، ساعت دوره و فصل برگزاری را مشخص کند یا دوره دلخواه اضافه کند.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomCourseToPlanner}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>افزودن دوره دلخواه دیگر</span>
                </button>
              </div>

              {configuredCourses.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-3">
                  <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-slate-600">هنوز دوره‌ای در جدول قرار نگرفته است.</p>
                  <button
                    type="button"
                    onClick={handleLoadRecommendedCourses}
                    className="px-4 py-2 bg-[#0288d1] text-white rounded-lg font-bold text-xs"
                  >
                    بارگذاری خودکار دوره‌های پیشنهادی شغل
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">ردیف</th>
                        <th className="py-2.5 px-3 min-w-[240px]">نام دوره آموزشی (قابل ویرایش)</th>
                        <th className="py-2.5 px-3 w-28">ساعت دوره</th>
                        <th className="py-2.5 px-3 w-36">بازه هدف در طول دوره</th>
                        <th className="py-2.5 px-3 w-28">اولویت</th>
                        <th className="py-2.5 px-3 w-36">مدرس / مرکز</th>
                        <th className="py-2.5 px-3 w-16">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {configuredCourses.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.course_name}
                              onChange={e => handleUpdatePlannerCourse(item.id, 'course_name', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded font-bold text-slate-900"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="4"
                                max="200"
                                value={item.duration_hours}
                                onChange={e => handleUpdatePlannerCourse(item.id, 'duration_hours', Number(e.target.value))}
                                className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center text-emerald-700"
                              />
                              <span className="text-[11px] text-slate-500">ساعت</span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.target_quarter}
                              onChange={e => handleUpdatePlannerCourse(item.id, 'target_quarter', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={item.priority}
                              onChange={e => handleUpdatePlannerCourse(item.id, 'priority', e.target.value)}
                              className="w-full px-1.5 py-1 border border-slate-300 rounded text-center"
                            >
                              <option value="high">ضروری</option>
                              <option value="medium">متوسط</option>
                              <option value="low">عادی</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.instructor_name}
                              onChange={e => handleUpdatePlannerCourse(item.id, 'instructor_name', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-slate-700"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemovePlannerCourse(item.id)}
                              className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                              title="حذف دوره"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* توضیحات و یادداشت کانون ارزیابی */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                توضیحات و مصوبات کانون ارزیابی شایستگی / کمیته انتصابات:
              </label>
              <textarea
                rows={2}
                value={plannerNotes}
                onChange={e => setPlannerNotes(e.target.value)}
                placeholder="یادداشت‌های ارزیابی، نقاط قوت، الزامات ارتقا و مصوبه کمیته انتصابات سازمانی..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>تولید و ثبت نهایی برنامه آموزشی انتصاب</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ۴. تب طرح‌های فعال انتصاب و رهگیری پیشرفت */}
      {activeTab === 'plans_list' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">طرح‌های آموزشی ثبت‌شده انتصابات پرسنل</h2>
              <p className="text-xs text-slate-500">رهگیری دوره‌های گذرانده‌شده، ثبت نمره و چاپ سند رسمی ارتقا</p>
            </div>

            <button
              onClick={() => ExcelService.exportPromotionPlans(promotionPlans)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>خروجی اکسل برنامه ترفیعات</span>
            </button>
          </div>

          <div className="space-y-4">
            {promotionPlans.map(plan => (
              <div
                key={plan.id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-slate-900 text-base">{plan.personnel_name}</span>
                      <span className="text-xs font-mono text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                        {plan.employee_id}
                      </span>
                      <span className="text-xs text-slate-500">واحد: {plan.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                      <span>پست فعلی: <strong>{plan.current_job_title}</strong></span>
                      <span aria-hidden="true">←</span>
                      <span className="text-emerald-800 font-bold">انتصاب هدف: {plan.target_job_title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <span className="text-[11px] text-slate-500 block">آمادگی احراز:</span>
                      <span className="text-xl font-bold font-mono text-emerald-700">{plan.readiness_score}٪</span>
                    </div>
                    <button
                      onClick={() => setViewingPlanId(plan.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>مشاهده و چاپ سند</span>
                    </button>
                    <button
                      onClick={() => {
                        db.deletePromotionPlan(plan.id);
                        triggerRefresh();
                        showToast(`برنامه انتصاب ${plan.personnel_name} حذف شد.`);
                      }}
                      className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="حذف طرح"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* فهرست دوره‌های زمان‌بندی‌شده با قابلیت تغییر وضعیت و ثبت نمره */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span className="font-bold">برنامه زمان‌بندی دوره‌ها ({plan.planning_horizon}):</span>
                    <span>ساعات تکمیل‌شده: {plan.completed_hours} از {plan.total_hours_required} ساعت</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {plan.courses_schedule.map(c => (
                      <div
                        key={c.id}
                        className={`p-3 rounded-lg border flex flex-col justify-between gap-2 ${
                          c.status === 'completed'
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : c.status === 'in_progress'
                            ? 'bg-sky-50/70 border-sky-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 line-clamp-1">{c.course_name}</span>
                          <span className="font-mono text-emerald-800 font-bold shrink-0">{c.duration_hours} ساعت</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>بازه: {c.target_quarter}</span>
                          <span>مدرس: {c.instructor_name || '-'}</span>
                          {c.passed_grade && <span className="font-mono font-bold text-emerald-700">نمره: {c.passed_grade}</span>}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-400">تغییر وضعیت دوره:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                db.updatePromotionCourseStatus(plan.id, c.id, 'not_started');
                                triggerRefresh();
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.status === 'not_started' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              شروع‌نشده
                            </button>
                            <button
                              onClick={() => {
                                db.updatePromotionCourseStatus(plan.id, c.id, 'in_progress');
                                triggerRefresh();
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.status === 'in_progress' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              درحال گذراندن
                            </button>
                            <button
                              onClick={() => {
                                const grade = prompt('نمره نهایی دوره را وارد نمایید (از ۱۰۰):', '85');
                                db.updatePromotionCourseStatus(plan.id, c.id, 'completed', grade ? Number(grade) : 85);
                                triggerRefresh();
                                showToast(`دوره ${c.course_name} به عنوان گذرانده شده ثبت شد.`);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              تکمیل و قبولی
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ۵. تب ورود و خروجی اکسل شناسنامه‌های شغلی و انتصابات */}
      {activeTab === 'excel' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              مرکز تبادل اکسل شناسنامه‌های شغلی، شایستگی‌ها و برنامه‌های انتصاب
            </h2>
            <p className="text-slate-500 mt-1">
              امکان دریافت شناسنامه‌های شغلی، شایستگی‌ها، شرایط احراز و دوره‌های مربوطه از طریق فایل استاندارد اکسل به صورت مجزا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* بخش دریافت الگوی اکسل و ورود فایل */}
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>بارگذاری و ورود شناسنامه‌های شغلی از اکسل</span>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                برای ورود انبوه شغل‌ها، می‌توانید از الگوی از پیش آماده شرکت استفاده نمایید. فایل حاوی ستون‌های: کد شغل، عنوان شغل، واحد سازمانی، مدرک تحصیلی، سابقه، شایستگی‌ها، نام دوره‌ها و ساعت هر دوره می‌باشد.
              </p>

              <button
                type="button"
                onClick={() => ExcelService.downloadJobProfileTemplate()}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>دانلود الگوی استاندارد اکسل شناسنامه شغلی (XLSX)</span>
              </button>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <label className="block text-slate-700 font-bold">انتخاب فایل اکسل تکمیل‌شده:</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={e => setExcelFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-0 file:ml-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0288d1] file:text-white hover:file:bg-[#0277bd]"
                />

                <button
                  type="button"
                  disabled={!excelFile || excelImportLoading}
                  onClick={handleProcessExcel}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{excelImportLoading ? 'درحال خواندن و درج در دیتابیس...' : 'بارگذاری و ثبت شناسنامه‌ها در سامانه'}</span>
                </button>
              </div>
            </div>

            {/* بخش خروجی‌های رسمی اکسل */}
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                <span>گزارش‌گیری و خروجی‌های اکسل سازمانی</span>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                دریافت گزارشات رسمی در قالب شیت‌های تفکیک‌شده اکسل جهت ارائه به مدیریت منابع انسانی، کانون ارزیابی و ممیزی‌های کیفی ISO 10015.
              </p>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => ExcelService.exportJobProfiles(jobProfiles)}
                  className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#0288d1]" />
                    <span>خروجی اکسل کامل شناسنامه‌های شغلی و دوره‌ها</span>
                  </span>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => ExcelService.exportPromotionPlans(promotionPlans)}
                  className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>خروجی اکسل طرح‌های ارتقا، بازه زمانی و ساعات</span>
                  </span>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعریف یا ویرایش شناسنامه شغلی */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingJobId ? 'ویرایش شناسنامه شغلی' : 'تعریف شناسنامه شغلی جدید'}
              </h3>
              <button onClick={() => setIsJobModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJobProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">کد شغل:</label>
                  <input
                    type="text"
                    required
                    value={jobForm.job_code}
                    onChange={e => setJobForm({ ...jobForm, job_code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">عنوان شغل سازمانی:</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">واحد سازمانی مربوطه:</label>
                  <select
                    value={jobForm.org_unit_name}
                    onChange={e => setJobForm({ ...jobForm, org_unit_name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    {orgUnits.map(u => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رده سازمانی / سطح شایستگی:</label>
                  <input
                    type="text"
                    value={jobForm.grade_level}
                    onChange={e => setJobForm({ ...jobForm, grade_level: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">شرایط تحصیلی الزامی:</label>
                  <input
                    type="text"
                    value={jobForm.education_requirement}
                    onChange={e => setJobForm({ ...jobForm, education_requirement: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">حداقل سابقه کار (سال):</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={jobForm.experience_years_required}
                    onChange={e => setJobForm({ ...jobForm, experience_years_required: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">شایستگی‌های عمومی (جداشده با کاما):</label>
                  <input
                    type="text"
                    value={jobForm.general_competencies_str}
                    onChange={e => setJobForm({ ...jobForm, general_competencies_str: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">شایستگی‌های تخصصی (جداشده با کاما):</label>
                  <input
                    type="text"
                    value={jobForm.technical_competencies_str}
                    onChange={e => setJobForm({ ...jobForm, technical_competencies_str: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">پست انتصاب بعدی در مسیر ارتقا:</label>
                  <select
                    value={jobForm.next_promotion_job_title}
                    onChange={e => setJobForm({ ...jobForm, next_promotion_job_title: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="">-- بدون انتصاب بعدی مشخص --</option>
                    {jobProfiles.filter(j => j.id !== editingJobId).map(j => (
                      <option key={j.id} value={j.title}>
                        {j.title} ({j.grade_level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* دوره‌های الزامی این شغل */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    دوره‌های آموزشی الزامی این شغل (تعیین نام دوره و ساعت دوره):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setJobForm({
                        ...jobForm,
                        required_courses: [
                          ...jobForm.required_courses,
                          {
                            id: `c_${Date.now()}`,
                            course_name: 'دوره جدید',
                            duration_hours: 24,
                            category: 'تخصصی',
                            is_mandatory: true
                          }
                        ]
                      });
                    }}
                    className="text-xs text-[#0288d1] font-bold hover:underline cursor-pointer"
                  >
                    + افزودن سطر دوره
                  </button>
                </div>

                <div className="space-y-2">
                  {jobForm.required_courses.map((c, cIdx) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="نام دوره آموزشی"
                        value={c.course_name}
                        onChange={e => {
                          const updated = [...jobForm.required_courses];
                          updated[cIdx].course_name = e.target.value;
                          setJobForm({ ...jobForm, required_courses: updated });
                        }}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded font-bold"
                      />
                      <input
                        type="number"
                        min="4"
                        max="200"
                        placeholder="ساعت"
                        value={c.duration_hours}
                        onChange={e => {
                          const updated = [...jobForm.required_courses];
                          updated[cIdx].duration_hours = Number(e.target.value);
                          setJobForm({ ...jobForm, required_courses: updated });
                        }}
                        className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center font-mono"
                      />
                      <select
                        value={c.category}
                        onChange={e => {
                          const updated = [...jobForm.required_courses];
                          updated[cIdx].category = e.target.value as any;
                          setJobForm({ ...jobForm, required_courses: updated });
                        }}
                        className="w-28 px-2 py-1.5 border border-slate-300 rounded bg-white"
                      >
                        <option value="تخصصی">تخصصی</option>
                        <option value="ایمنی و HSE">ایمنی و HSE</option>
                        <option value="مدیریتی و سرپرستی">مدیریتی</option>
                        <option value="عمومی و مهارتی">عمومی</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setJobForm({
                            ...jobForm,
                            required_courses: jobForm.required_courses.filter((_, idx) => idx !== cIdx)
                          });
                        }}
                        className="p-1.5 text-rose-600 hover:text-rose-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg font-bold shadow-2xs"
                >
                  ذخیره شناسنامه شغلی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال نمایش و پرینت سند رسمی انتصاب */}
      {viewingPlanId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                  EORC
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">{settings.org_name || 'شرکت پالایش نفت اصفهان'}</h2>
                  <p className="text-[11px] text-slate-500">سند رسمی برنامه‌ریزی توسعه شایستگی و انتصاب شغلی پرسنل</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0288d1] text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ رسمی (Print / PDF)</span>
                </button>
                <button
                  onClick={() => setViewingPlanId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {(() => {
              const plan = promotionPlans.find(p => p.id === viewingPlanId);
              if (!plan) return null;

              return (
                <div className="space-y-6">
                  {/* اطلاعات پرسنلی */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[11px]">نام و نام خانوادگی:</span>
                      <strong className="text-slate-900 text-sm">{plan.personnel_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">کد پرسنلی / ملی:</span>
                      <strong className="font-mono text-slate-900">{plan.employee_id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">پست سازمانی فعلی:</span>
                      <strong className="text-slate-900">{plan.current_job_title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">پست انتصاب هدف:</span>
                      <strong className="text-emerald-800">{plan.target_job_title}</strong>
                    </div>
                  </div>

                  {/* بازه و شاخص */}
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span>بازه زمانی تعیین‌شده: <strong>{plan.planning_horizon}</strong></span>
                    <span>شاخص آمادگی فعلی: <strong className="font-mono text-emerald-800">{plan.readiness_score}٪</strong></span>
                    <span>مجموع ساعات دوره‌ها: <strong className="font-mono">{plan.total_hours_required} ساعت</strong></span>
                  </div>

                  {/* جدول رسمی دوره‌ها */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">جدول دوره‌های آموزشی مصوب جهت احراز انتصاب:</h4>
                    <table className="w-full text-right text-xs border border-slate-300">
                      <thead className="bg-slate-100 font-bold border-b border-slate-300">
                        <tr>
                          <th className="py-2 px-3 border-l border-slate-300">ردیف</th>
                          <th className="py-2 px-3 border-l border-slate-300">عنوان دوره آموزشی مصوب</th>
                          <th className="py-2 px-3 border-l border-slate-300">مدت دوره</th>
                          <th className="py-2 px-3 border-l border-slate-300">بازه زمانی اجرا</th>
                          <th className="py-2 px-3 border-l border-slate-300">مدرس / مرکز مجری</th>
                          <th className="py-2 px-3 border-l border-slate-300">وضعیت</th>
                          <th className="py-2 px-3">نمره اخذ شده</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {plan.courses_schedule.map((c, idx) => (
                          <tr key={c.id}>
                            <td className="py-2 px-3 border-l border-slate-200 font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 border-l border-slate-200 font-bold">{c.course_name}</td>
                            <td className="py-2 px-3 border-l border-slate-200 font-mono font-bold text-emerald-700">{c.duration_hours} ساعت</td>
                            <td className="py-2 px-3 border-l border-slate-200">{c.target_quarter}</td>
                            <td className="py-2 px-3 border-l border-slate-200">{c.instructor_name || '-'}</td>
                            <td className="py-2 px-3 border-l border-slate-200 font-bold">
                              {c.status === 'completed' ? 'گذرانده شده' : c.status === 'in_progress' ? 'درحال اجرا' : 'برنامه‌ریزی‌شده'}
                            </td>
                            <td className="py-2 px-3 font-mono">{c.passed_grade || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* بخش امضاها */}
                  <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="block font-bold text-slate-800 mb-8">رئیس اداره آموزش و توسعه شایستگی</span>
                      <span className="text-[11px] text-slate-400">امضا و تاریخ</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800 mb-8">مدیر واحد سازمانی مربوطه</span>
                      <span className="text-[11px] text-slate-400">امضا و تاریخ</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800 mb-8">دبیر کمیته انتصابات و ترفیعات</span>
                      <span className="text-[11px] text-slate-400">امضا و تاریخ</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
