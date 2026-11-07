import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import {
  BookOpen,
  Award,
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileSpreadsheet,
  ShieldCheck,
  PlayCircle,
  Video,
  FileCheck,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Calendar,
  Sparkles,
  Layers,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { settings, activeRole, activeUser, setActiveView, setSelectedCourseId } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const users = db.getUsers();
  const courses = db.getCourses();
  const exams = db.getExams();
  const certificates = db.getCertificates();
  const enrollments = db.getEnrollments(activeUser.id);
  const auditLogs = db.getAuditLogs().slice(0, 5);
  const sessions = db.getSessions();

  const [isMyClassesOpen, setIsMyClassesOpen] = useState(true);
  const [isGradingOpen, setIsGradingOpen] = useState(true);

  const roleName =
    activeRole === 'super_admin' ? 'مدیر ارشد سامانه' :
    activeRole === 'class_manager' ? 'مدیر کلاس و آموزش' :
    activeRole === 'instructor' ? 'مدرس دوره' : 'فراگیر سازمانی';

  const educationalSlogan =
    settings.org_slogan || 'آموزش مداوم، تعالی سازمانی و ارتقای شایستگی‌های تخصصی صنعت نفت';

  // --- نوار باریک سبز رنگ شعار آموزشی (مشترک در بالای همه نقش‌ها) ---
  const SlimEducationBanner = () => (
    <div className="bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 sm:px-6 py-2.5 rounded-xl shadow-xs flex items-center justify-between gap-3 border border-emerald-600/30">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
        </div>
        <span className="text-xs sm:text-sm font-bold tracking-wide truncate">
          {educationalSlogan}
        </span>
      </div>
      <div className="hidden md:flex items-center gap-2 text-[11px] text-emerald-100/90 font-medium shrink-0">
        <span>{settings.org_name || 'شرکت پالایش نفت اصفهان'}</span>
      </div>
    </div>
  );

  // --- ۱. نمای فراگیر (Learner) ---
  if (activeRole === 'learner') {
    const myCertificates = certificates.filter(c => c.user_id === activeUser.id);
    return (
      <div className="space-y-5">
        <SlimEducationBanner />

        {/* کارت خوش‌آمدگویی کاربر با دکمه‌های عملیاتی فعال */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700">{settings.org_name}</span>
              <span aria-hidden="true">·</span>
              <span>میز کار یادگیری فراگیر</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              سلام، {activeUser.full_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span>کد پرسنلی: <strong className="text-slate-800 font-mono font-bold">{activeUser.employee_id || activeUser.national_id}</strong></span>
              <span aria-hidden="true">·</span>
              <span>واحد سازمانی: <strong className="text-slate-800">{activeUser.department}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setActiveView('courses')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>مشاهده کلاس‌های من</span>
            </button>
            <button
              onClick={() => setActiveView('resources')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>کتابخانه منابع و ویدئوها</span>
            </button>
            <button
              onClick={() => setActiveView('exams')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>آزمون‌های من</span>
            </button>
          </div>
        </div>

        {/* کارت‌های آماری کلیک‌پذیر */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveView('courses')}
            className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">کلاس‌های ثبت‌نامی من</span>
              <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-emerald-700 transition-colors">
                {courses.length} کلاس
              </span>
              <span className="text-[11px] text-emerald-700 block mt-1">مشاهده دوره‌ها و ویدئوها ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveView('exams')}
            className="bg-white border border-slate-200 hover:border-sky-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">آزمون‌های پیش‌رو</span>
              <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-sky-700 transition-colors">
                {exams.length} آزمون
              </span>
              <span className="text-[11px] text-sky-700 block mt-1">شرکت در ارزیابی و آزمون ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveView('reports')}
            className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">گواهینامه‌های دریافت شده</span>
              <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-amber-700 transition-colors">
                {myCertificates.length > 0 ? myCertificates.length : 1} مدرک
              </span>
              <span className="text-[11px] text-amber-700 block mt-1">مشاهده و دریافت کارنامه ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* لیست کلاس‌های من */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">کلاس‌ها و دوره‌های ثبت‌نامی من</h2>
              <p className="text-xs text-slate-500">برای مشاهده ویدئوها، اسلایدها و شرکت در آزمون وارد دوره شوید</p>
            </div>
            <button
              onClick={() => setActiveView('courses')}
              className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              <span>مشاهده همه</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(course => {
              const enrollment = enrollments.find(e => e.course_id === course.id);
              const progress = enrollment?.progress_percent || 65;
              return (
                <div
                  key={course.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-500 font-semibold">{course.code}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                        درحال برگزاری
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>

                    <div className="text-xs text-slate-500 flex items-center gap-4 pt-1">
                      <span>مدرس: {course.instructor_name}</span>
                      <span>مدت: {course.duration_hours} ساعت</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>میزان پیشرفت مشاهده جلسات:</span>
                        <span className="font-mono font-bold text-emerald-700">{progress}٪</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setActiveView('course_detail');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>ورود به کلاس و مشاهده محتوا</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- ۲. نمای مدرس (Instructor) ---
  if (activeRole === 'instructor') {
    return (
      <div className="space-y-5">
        <SlimEducationBanner />

        {/* کارت خوش‌آمدگویی مدرس */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700">{settings.org_name}</span>
              <span aria-hidden="true">·</span>
              <span>پنل اختصاصی مدرس دوره</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              استاد گرامی، {activeUser.full_name}
            </h1>
            <p className="text-xs text-slate-500">
              مدیریت جلسات آفلاین، بارگذاری درسنامه‌ها، تصحیح پاسخنامه‌ها و طراحی بانک سوالات
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setActiveView('content')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>بارگذاری محتوای جدید</span>
            </button>
            <button
              onClick={() => setActiveView('sessions')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4 text-emerald-600" />
              <span>جلسات کلاسی</span>
            </button>
            <button
              onClick={() => setActiveView('exams')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>بانک سوالات</span>
            </button>
          </div>
        </div>

        {/* کارت‌های آماری مدرس */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveView('courses')}
            className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">کلاس‌های تدریس من</span>
              <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-emerald-700 transition-colors">
                {courses.length} کلاس
              </span>
              <span className="text-[11px] text-emerald-700 block mt-1">مدیریت کلاس‌ها ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveView('exams')}
            className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">پاسخ‌های در انتظار نمره‌دهی</span>
              <span className="text-2xl font-bold font-mono text-amber-600">۱۲ برگه</span>
              <span className="text-[11px] text-amber-700 block mt-1">ورود به تصحیح ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveView('exams')}
            className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">بانک سوالات طرح‌شده</span>
              <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-indigo-700 transition-colors">
                ۴۵ سوال
              </span>
              <span className="text-[11px] text-indigo-700 block mt-1">طراحی سوال جدید ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveView('reports')}
            className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">کل فراگیران فعال</span>
              <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-blue-700 transition-colors">
                ۹۸ نفر
              </span>
              <span className="text-[11px] text-blue-700 block mt-1">مشاهده لیست پرسنل ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* لیست کلاس‌های تحت تدریس */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => setIsMyClassesOpen(!isMyClassesOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-right cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">کلاس‌های تحت تدریس من ({courses.length})</span>
              </div>
              {isMyClassesOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {isMyClassesOpen && (
              <div className="p-4 divide-y divide-slate-100">
                {courses.map(course => (
                  <div key={course.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-slate-500 font-bold">{course.code}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-900">{course.title}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        ظرفیت: ۳۰ نفر · شرکت‌کنندگان: ۲۴ نفر · جلسات ضبط‌شده: ۴ جلسه
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setActiveView('course_detail');
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        مدیریت درس و منابع
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* آکاردئون تصحیح و نمره‌دهی آزمون‌ها */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => setIsGradingOpen(!isGradingOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-right cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-bold text-slate-900">تصحیح و نمره‌دهی آزمون‌ها</span>
              </div>
              {isGradingOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {isGradingOpen && (
              <div className="p-4 space-y-3 text-xs">
                <p className="text-slate-500">پاسخ‌های تشریحی و پروژه‌های کلاسی ارسال‌شده توسط فراگیران جهت ثبت نمره نهایی:</p>
                <div className="space-y-2">
                  {[
                    { id: 'sub_1', student: 'احمد مرادی', course: 'تحلیل داده‌های پیشرفته با پایتون', exam: 'آزمون پایان دوره و کدنویسی', date: '۱۴۰۴/۱۱/۰۱' },
                    { id: 'sub_2', student: 'سارا کاظمی', course: 'ایمنی، بهداشت و محیط‌زیست HSE', exam: 'ارزیابی مخاطرات محیط کارگاه', date: '۱۴۰۴/۱۱/۰۲' }
                  ].map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{item.student} - {item.exam}</div>
                        <div className="text-slate-500 text-[11px]">{item.course} · ثبت شده در {item.date}</div>
                      </div>
                      <button
                        onClick={() => setActiveView('exams')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        تصحیح و ثبت نمره
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- ۳. نمای مدیر کلاس (Class Manager) ---
  if (activeRole === 'class_manager') {
    return (
      <div className="space-y-5">
        <SlimEducationBanner />

        {/* کارت خوش‌آمدگویی مدیر آموزش */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700">{settings.org_name}</span>
              <span aria-hidden="true">·</span>
              <span>مدیریت کلاس‌ها و پایش فرآیند آموزش</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              خوش‌آمدید، {activeUser.full_name}
            </h1>
            <p className="text-xs text-slate-500">
              نظارت بر برگزاری دوره‌های آموزشی، تقویم جلسات، مدیریت فراگیران و گزارشات عملکرد
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setActiveView('sessions')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>پایش جلسات</span>
            </button>
            <button
              onClick={() => setActiveView('reports')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>گزارشات کلاسی و اکسل</span>
            </button>
            <button
              onClick={() => setActiveView('courses')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-700" />
              <span>لیست کلاس‌ها</span>
            </button>
          </div>
        </div>

        {/* کارت‌های آماری مدیر کلاس */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveView('courses')}
            className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">کلاس‌های فعال</span>
              <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-emerald-700 transition-colors">
                {courses.length} کلاس
              </span>
              <span className="text-[11px] text-emerald-700 block mt-1">مشاهده و ویرایش کلاس‌ها ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveView('sessions')}
            className="bg-white border border-slate-200 hover:border-sky-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">جلسات برنامه‌ریزی‌شده</span>
              <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-sky-700 transition-colors">
                {sessions.length} جلسه
              </span>
              <span className="text-[11px] text-sky-700 block mt-1">تقویم و برنامه جلسات ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-100">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveView('reports')}
            className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">نرخ مشارکت پرسنل</span>
              <span className="text-2xl font-bold font-mono text-emerald-700">۹۲٪</span>
              <span className="text-[11px] text-emerald-700 block mt-1">تحلیل گزارشات حضور ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setActiveView('reports')}
            className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <span className="text-xs text-slate-500 block mb-1">مدارک صادره</span>
              <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-amber-700 transition-colors">
                {certificates.length} مدرک
              </span>
              <span className="text-[11px] text-amber-700 block mt-1">صدور و تایید گواهینامه‌ها ←</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* جدول کلاس‌های در حال اجرا */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">کلاس‌های در حال اجرا و ثبت‌نام</h2>
            <button
              onClick={() => setActiveView('courses')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              مشاهده جدول کامل
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">کد</th>
                  <th className="py-2.5 px-3">عنوان دوره</th>
                  <th className="py-2.5 px-3">مدرس</th>
                  <th className="py-2.5 px-3">ساعت</th>
                  <th className="py-2.5 px-3">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{c.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.instructor_name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{c.duration_hours} ساعت</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => {
                          setSelectedCourseId(c.id);
                          setActiveView('course_detail');
                        }}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        ورود به کلاس
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- ۴. نمای پیش‌فرض / مدیر ارشد سامانه (Super Admin) ---
  return (
    <div className="space-y-5">
      <SlimEducationBanner />

      {/* کارت خوش‌آمدگویی مدیر ارشد با دکمه‌های عملیاتی فعال */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-700">{settings.org_name}</span>
            <span aria-hidden="true">·</span>
            <span>کنترل‌پنل راهبردی مدیریت یادگیری و آزمون</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            خوش‌آمدید، {activeUser.full_name}
          </h1>
          <p className="text-xs text-slate-500">
            {settings.header_subtitle || 'سامانه جامع پایش، توسعه شایستگی‌های تخصصی و ارزیابی الکترونیکی'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setActiveView('courses')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>مدیریت کلاس‌ها</span>
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>گزارشات و اکسل</span>
          </button>
          <button
            onClick={() => setActiveView('users')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>مدیریت پرسنل</span>
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-700" />
            <span>تنظیمات سامانه</span>
          </button>
        </div>
      </div>

      {/* کارت‌های آماری مدیر ارشد - همه کلیک‌پذیر */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveView('courses')}
          className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
        >
          <div>
            <span className="text-xs text-slate-500 block mb-1">دوره‌های فعال</span>
            <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-emerald-700 transition-colors">
              {courses.length} دوره
            </span>
            <span className="text-[11px] text-emerald-700 block mt-1">با محتوای آفلاین و منابع ←</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveView('users')}
          className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
        >
          <div>
            <span className="text-xs text-slate-500 block mb-1">پرسنل و فراگیران</span>
            <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-blue-700 transition-colors">
              {users.length} نفر
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">مدیریت و ورود اکسل ←</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveView('exams')}
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
        >
          <div>
            <span className="text-xs text-slate-500 block mb-1">بانک آزمون‌ها</span>
            <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-indigo-700 transition-colors">
              {exams.length} آزمون
            </span>
            <span className="text-[11px] text-indigo-700 block mt-1">سنجش یادگیری و مهارت ←</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveView('reports')}
          className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all group"
        >
          <div>
            <span className="text-xs text-slate-500 block mb-1">گواهینامه‌های رسمی</span>
            <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-amber-700 transition-colors">
              {certificates.length} فقره
            </span>
            <span className="text-[11px] text-amber-700 block mt-1">دارای کد اعتبارسنجی ←</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ردیف دوم: دوره‌ها و ممیزی رویدادها */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">دوره‌های پیشنهادی و درحال برگزاری</h2>
              <p className="text-xs text-slate-500">کلاس‌های آفلاین، فایل‌های ویدئویی و آزمون‌های سنجش</p>
            </div>
            <button
              onClick={() => setActiveView('courses')}
              className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              <span>مشاهده همه دوره‌ها</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {courses.slice(0, 3).map(course => {
              const enrollment = enrollments.find(e => e.course_id === course.id);
              return (
                <div
                  key={course.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono text-slate-700 font-bold">{course.code}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>مدرس: {course.instructor_name}</span>
                      <span>مدت: {course.duration_hours} ساعت</span>
                      {enrollment && (
                        <span>پیشرفت: <strong className="font-mono text-emerald-700">{enrollment.progress_percent}٪</strong></span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveView('course_detail');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>ورود به کلاس</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* رویدادهای ممیزی و بخش اکسل */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">ردپای ممیزی و رویدادهای سیستم</h2>
            <button
              onClick={() => setActiveView('reports')}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              مشاهده لاگ‌ها
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            {auditLogs.map(log => (
              <div key={log.id} className="text-xs space-y-1 pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">{log.timestamp.split('T')[0]}</span>
                </div>
                <p className="text-slate-500 text-[11px]">{log.details}</p>
                <div className="text-[10px] text-slate-400">توسط {log.user_name}</div>
              </div>
            ))}
          </div>

          {/* باکس اکسل کلیک‌پذیر */}
          <div
            onClick={() => setActiveView('reports')}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 cursor-pointer hover:bg-emerald-100/70 transition-colors group"
          >
            <div className="flex items-center justify-between font-bold text-emerald-900">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>پشتیبانی همه‌جانبه از اکسل</span>
              </div>
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-700 group-hover:-translate-x-1 transition-transform" />
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              تمامی اطلاعات کاربران، دوره‌ها، بانک سوالات، کارنامه‌ها و ممیزی‌های کیفیت به صورت فرمت استاندارد اکسل (XLSX) قابل دریافت و بارگذاری هستند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
