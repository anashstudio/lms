import React, { useState } from 'react';
import { Course, User } from '../../types/models';
import { db } from '../../db/database';
import { ClassPersonnelModal } from './ClassPersonnelModal';
import { PersianDatePicker } from '../common/PersianDatePicker';
import {
  RotateCcw,
  Check,
  X,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  FileText,
  Users,
  Video,
  Share2,
  BarChart2,
  Folder,
  MessageSquare,
  Search,
  ExternalLink,
  QrCode,
  Copy,
  CheckCircle2,
  Sliders,
  Sparkles,
  Link2
} from 'lucide-react';

interface ClassModifyViewProps {
  initialCourse?: Course | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ClassModifyView: React.FC<ClassModifyViewProps> = ({
  initialCourse,
  onSave,
  onCancel
}) => {
  const allCourses = db.getCourses();

  const [code, setCode] = useState(initialCourse?.code || '1115');
  const [title, setTitle] = useState(initialCourse?.title || 'test');
  const [note, setNote] = useState(initialCourse?.target_audience || 'برگزار شده در پژوهشگاه');
  const [passingGrade, setPassingGrade] = useState(initialCourse?.passing_grade?.toString() || '60');
  const [category, setCategory] = useState(initialCourse?.category || 'کلیه کارکنان');
  const [nature, setNature] = useState('---------');
  const [branch, setBranch] = useState(initialCourse?.branch || 'پالایشگاه اصفهان');

  const [prereqCourseIds, setPrereqCourseIds] = useState<string[]>(initialCourse?.prerequisite_course_ids || []);
  const [description, setDescription] = useState(initialCourse?.description || '');
  const [showDescription, setShowDescription] = useState(true);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [startDate, setStartDate] = useState(initialCourse?.start_date || '۱۴۰۵/۰۸/۰۱');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState(initialCourse?.end_date || '۱۴۰۵/۰۹/۰۱');
  const [endTime, setEndTime] = useState('14:30');
  const [accessMode, setAccessMode] = useState<'unlimited' | 'first_login' | 'reg_date'>('unlimited');
  const [accessDays, setAccessDays] = useState('30');

  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [shareComments, setShareComments] = useState(false);

  const [contentLinked, setContentLinked] = useState(true);
  const [attachedResources, setAttachedResources] = useState(false);
  const [showProgressToLearner, setShowProgressToLearner] = useState(false);
  const [enableInstructorChat, setEnableInstructorChat] = useState(false);
  const [directExamAccess, setDirectExamAccess] = useState(false);
  const [requireCommitment, setRequireCommitment] = useState(true);
  const [showResultInProfile, setShowResultInProfile] = useState(true);
  const [dedicatedFolder, setDedicatedFolder] = useState(false);
  const [personalNotes, setPersonalNotes] = useState(false);
  const [newsFeed, setNewsFeed] = useState(false);

  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [personnelInitialRole, setPersonnelInitialRole] = useState<'learner' | 'instructor' | 'manager'>('learner');

  const [isPrereqModalOpen, setIsPrereqModalOpen] = useState(false);
  const [prereqSearch, setPrereqSearch] = useState('');

  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [welcomeTitle, setWelcomeTitle] = useState('به دوره تخصصی خوش آمدید');
  const [welcomeBody, setWelcomeBody] = useState(initialCourse?.welcome_message || 'همکار گرامی، ضمن آرزوی توفیق، خواهشمند است کلیه جلسات و آزمون‌های کلاس را با دقت مطالعه فرمایید.');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('پروژه ارزیابی میدانی');
  const [projectDeadline, setProjectDeadline] = useState('۱۴۰۵/۰۹/۱۵');
  const [projectDesc, setProjectDesc] = useState(initialCourse?.class_project_description || 'ارائه گزارش تحلیلی مرتبط با فرآیندهای عملیاتی واحد مربوطه');

  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [gradeExam, setGradeExam] = useState(50);
  const [gradeAttendance, setGradeAttendance] = useState(20);
  const [gradeActivity, setGradeActivity] = useState(15);
  const [gradeProject, setGradeProject] = useState(15);

  const [isForumModalOpen, setIsForumModalOpen] = useState(false);
  const [forumActive, setForumActive] = useState(true);
  const [allowLearnerTopics, setAllowLearnerTopics] = useState(true);

  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [onlinePlatform, setOnlinePlatform] = useState('skyroom');
  const [onlineUrl, setOnlineUrl] = useState(initialCourse?.online_meeting_url || 'https://lms.eorc.ir/live/class1115');
  const [onlinePass, setOnlinePass] = useState('EORC-1405');

  const [isMonitoringModalOpen, setIsMonitoringModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const prereqDisplay =
    prereqCourseIds.length === 0
      ? 'کلاسی انتخاب نشده است'
      : `${prereqCourseIds.length} کلاس انتخاب شده است`;

  const handleSave = () => {
    if (!title.trim()) {
      alert('لطفاً عنوان کلاس را وارد نمایید.');
      return;
    }

    if (initialCourse) {
      db.updateCourse(initialCourse.id, {
        code,
        title,
        target_audience: note,
        passing_grade: Number(passingGrade) || 60,
        category,
        branch,
        description,
        start_date: startDate,
        end_date: endDate,
        status: status === 'active' ? 'active' : 'draft',
        prerequisite_course_ids: prereqCourseIds,
        welcome_message: welcomeBody,
        class_project_description: projectDesc,
        grading_scheme: {
          exam_percent: gradeExam,
          attendance_percent: gradeAttendance,
          activity_percent: gradeActivity,
          project_percent: gradeProject
        },
        forum_access: forumActive,
        online_meeting_url: onlineUrl
      });
    } else {
      const newCourse: Course = {
        id: `crs_${Date.now()}`,
        code,
        title,
        category,
        description,
        duration_hours: 16,
        instructor_id: 'usr_inst_1',
        instructor_name: 'دکتر محمد رضایی',
        class_manager_id: 'usr_mgr_1',
        iso_phase: 'execution',
        target_audience: note,
        start_date: startDate,
        end_date: endDate,
        status: status === 'active' ? 'active' : 'draft',
        passing_grade: Number(passingGrade) || 60,
        branch,
        created_at: new Date().toISOString(),
        assigned_learner_ids: [],
        assigned_instructor_ids: ['usr_inst_1'],
        assigned_manager_ids: ['usr_mgr_1'],
        prerequisite_course_ids: prereqCourseIds,
        welcome_message: welcomeBody,
        class_project_description: projectDesc,
        grading_scheme: {
          exam_percent: gradeExam,
          attendance_percent: gradeAttendance,
          activity_percent: gradeActivity,
          project_percent: gradeProject
        },
        forum_access: forumActive,
        online_meeting_url: onlineUrl
      };
      db.addCourse(newCourse);
    }

    onSave();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://lms.eorc.ir/Training/Class/View/${code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentCourseMock: Course = initialCourse || {
    id: `crs_temp_${code}`,
    code,
    title,
    category,
    description,
    duration_hours: 16,
    instructor_id: 'usr_inst_1',
    instructor_name: 'مدرس انتخابی',
    class_manager_id: 'usr_mgr_1',
    status: 'active',
    iso_phase: 'execution',
    target_audience: note,
    created_at: new Date().toISOString()
  };

  const learnersCount = initialCourse?.assigned_learner_ids?.length || 2;
  const instructorsCount = initialCourse?.assigned_instructor_ids?.length || 1;
  const managersCount = initialCourse?.assigned_manager_ids?.length || 1;

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-4 text-slate-800 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-5 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-bold rounded shadow-xs transition-colors flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>ذخیره</span>
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded transition-colors"
          >
            انصراف
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>{title || 'کلاس جدید'}</span>
          <RotateCcw className="w-4 h-4 text-sky-600 cursor-pointer hover:rotate-180 transition-transform" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-3 order-3 lg:order-1 flex flex-col gap-3 border-r lg:border-r-0 lg:border-l border-slate-200 pl-0 lg:pl-4">
          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg space-y-1.5">
            <div className="text-[11px] font-bold text-sky-900 flex items-center justify-between">
              <span>تخصیص نفرات به کلاس:</span>
              <button
                type="button"
                onClick={() => {
                  setPersonnelInitialRole('learner');
                  setIsPersonnelModalOpen(true);
                }}
                className="text-sky-700 hover:underline font-bold text-[10px]"
              >
                [ویرایش دسترسی‌ها]
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-700 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPersonnelInitialRole('learner');
                  setIsPersonnelModalOpen(true);
                }}
                className="text-[#0288d1] hover:underline font-bold"
              >
                {learnersCount} فراگیر
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => {
                  setPersonnelInitialRole('instructor');
                  setIsPersonnelModalOpen(true);
                }}
                className="text-[#0288d1] hover:underline font-bold"
              >
                {instructorsCount} مدرس
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => {
                  setPersonnelInitialRole('manager');
                  setIsPersonnelModalOpen(true);
                }}
                className="text-[#0288d1] hover:underline font-bold"
              >
                {managersCount} مدیر
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsWelcomeModalOpen(true)}
              className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-[#0288d1] font-semibold border border-sky-200 rounded text-center transition-colors truncate"
            >
              خوش آمد گویی
            </button>
            <label className="flex items-center justify-between gap-1 py-1.5 px-2 bg-sky-50 border border-sky-200 rounded cursor-pointer text-[#0288d1] font-semibold">
              <span className="truncate">ارتباط محتوا</span>
              <input
                type="checkbox"
                checked={contentLinked}
                onChange={(e) => setContentLinked(e.target.checked)}
                className="rounded text-[#0288d1] focus:ring-0"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div></div>
            <label className="flex items-center justify-between gap-1 py-1.5 px-2 bg-sky-50 border border-sky-200 rounded cursor-pointer text-[#0288d1] font-semibold">
              <span className="truncate">منابع پیوست</span>
              <input
                type="checkbox"
                checked={attachedResources}
                onChange={(e) => setAttachedResources(e.target.checked)}
                className="rounded text-[#0288d1] focus:ring-0"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setIsProjectModalOpen(true)}
            className="w-full py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-[#0288d1] font-semibold border border-sky-200 rounded text-center transition-colors"
          >
            پروژه های آموزشی کلاسی
          </button>

          <button
            type="button"
            onClick={() => setIsGradingModalOpen(true)}
            className="w-full py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-[#0288d1] font-semibold border border-sky-200 rounded text-center transition-colors"
          >
            نحوه محاسبه نمره نهایی کلاس
          </button>

          <button
            type="button"
            onClick={() => setIsForumModalOpen(true)}
            className="w-full py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-[#0288d1] font-semibold border border-sky-200 rounded text-center transition-colors"
          >
            دسترسی انجمن
          </button>

          <button
            type="button"
            onClick={() => setIsOnlineModalOpen(true)}
            className="w-full py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-[#0288d1] font-semibold border border-sky-200 rounded text-center transition-colors"
          >
            جلسه آنلاین
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#0288d1] py-2 border-y border-slate-100 my-1">
            <button
              type="button"
              onClick={() => setIsMonitoringModalOpen(true)}
              className="hover:underline font-bold"
            >
              پایش نتایج
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="hover:underline font-bold"
            >
              مشاهده زمان بندی
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="hover:underline font-bold"
            >
              اشتراک گذاری
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={showProgressToLearner}
                onChange={(e) => setShowProgressToLearner(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
              />
              <span>نمایش پیشرفت آموزشی به فراگیر</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={enableInstructorChat}
                onChange={(e) => setEnableInstructorChat(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
              />
              <span>برقراری ارتباط فراگیران و اساتید</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={directExamAccess}
                onChange={(e) => setDirectExamAccess(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
              />
              <span>ورود مستقیم کاربر به کلاس (آزمون)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={requireCommitment}
                onChange={(e) => setRequireCommitment(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
              />
              <span>الزام فراگیر به تایید تعهدنامه عدم انتشار مطالب</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={showResultInProfile}
                onChange={(e) => setShowResultInProfile(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
              />
              <span>نمایش نتیجه آزمون در پروفایل فراگیر</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={dedicatedFolder}
                onChange={(e) => setDedicatedFolder(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
              />
              <span>پوشه اختصاصی کلاس</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
              />
              <span>یادداشت های شخصی</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={newsFeed}
                onChange={(e) => setNewsFeed(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
              />
              <span>اخبار</span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-3 order-2 flex flex-col items-center justify-start gap-4 px-2">
          <div className="w-full max-w-[240px] aspect-4/3 rounded-lg border border-sky-300 bg-sky-50/50 p-3 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
            <div className="w-24 h-24 relative flex items-center justify-center">
              <div className="w-16 h-12 bg-[#0288d1] rounded-md shadow-md flex items-center justify-center text-white">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -left-2 w-10 h-7 bg-amber-400 rounded-sm shadow"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                LMS
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 font-medium">تصویر نمایه کلاس</span>
          </div>

          <div className="w-full max-w-[240px] flex gap-1">
            <label className="flex-1 py-1 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded text-center cursor-pointer font-medium text-slate-700">
              <span>انتخاب فایل</span>
              <input type="file" className="hidden" accept="image/*" />
            </label>
          </div>

          <div className="w-full max-w-[240px] border border-slate-200 rounded p-2.5 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">ثبت نظرات</span>
              <div className="inline-flex rounded border border-slate-300 overflow-hidden bg-white text-[11px]">
                <button
                  type="button"
                  onClick={() => setCommentsEnabled(true)}
                  className={`px-3 py-0.5 ${commentsEnabled ? 'bg-[#0288d1] text-white font-bold' : 'text-slate-600'}`}
                >
                  فعال
                </button>
                <button
                  type="button"
                  onClick={() => setCommentsEnabled(false)}
                  className={`px-3 py-0.5 ${!commentsEnabled ? 'bg-slate-400 text-white font-bold' : 'text-slate-600'}`}
                >
                  غیرفعال
                </button>
              </div>
            </div>

            <label className="flex items-start gap-1.5 cursor-pointer text-[11px] text-slate-600 pt-1 leading-snug">
              <input
                type="checkbox"
                checked={shareComments}
                onChange={(e) => setShareComments(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0 mt-0.5"
              />
              <span>نمایش نظرات محتوای مشترک با سایر کلاس‌ها</span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-6 order-1 lg:order-3 space-y-3">
          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">کد :</span>
            <div className="col-span-9">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-rose-400 rounded focus:outline-none focus:border-rose-600 font-mono text-sm bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">عنوان :</span>
            <div className="col-span-9">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان کلاس را وارد نمایید..."
                className="w-full px-3 py-1.5 border border-sky-400 rounded focus:outline-none focus:border-sky-600 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">یادداشت :</span>
            <div className="col-span-9">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">نمره قبولی :</span>
            <div className="col-span-9">
              <input
                type="number"
                value={passingGrade}
                onChange={(e) => setPassingGrade(e.target.value)}
                className="w-24 px-3 py-1 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-xs text-center font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">گروه آموزشی :</span>
            <div className="col-span-9 flex items-center gap-1.5">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="کلیه کارکنان">کلیه کارکنان</option>
                <option value="مدیران و روسا">مدیران و روسا</option>
                <option value="کارشناسان فنی و مهندسی">کارشناسان فنی و مهندسی</option>
                <option value="ایمنی و HSE">ایمنی و HSE</option>
              </select>
              <button
                type="button"
                className="w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0"
                title="افزودن گروه جدید"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">ماهیت :</span>
            <div className="col-span-9 flex items-center gap-1.5">
              <select
                value={nature}
                onChange={(e) => setNature(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="---------">---------</option>
                <option value="الکترونیکی آفلاین">الکترونیکی آفلاین</option>
                <option value="کارگاه چندرسانه‌ای">کارگاه چندرسانه‌ای</option>
                <option value="شایستگی تخصصی">شایستگی تخصصی</option>
              </select>
              <button
                type="button"
                className="w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0"
                title="افزودن ماهیت جدید"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">شعبه :</span>
            <div className="col-span-9">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="پالایشگاه اصفهان">پالایشگاه اصفهان</option>
                <option value="مرکز آموزش فنی و تحقیقات">مرکز آموزش فنی و تحقیقات</option>
                <option value="دفتر مرکزی تهران">دفتر مرکزی تهران</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">کلاسهای پیش نیاز :</span>
            <div className="col-span-9">
              <button
                type="button"
                onClick={() => setIsPrereqModalOpen(true)}
                className="text-[#0288d1] hover:underline font-bold text-xs text-right flex items-center gap-1"
              >
                <span>انتخاب کلاس ( {prereqDisplay} )</span>
                <Link2 className="w-3.5 h-3.5 text-sky-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 items-start gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700 pt-1">توضیحات :</span>
            <div className="col-span-9">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="توضیحات و اهداف آموزشی دوره..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">نمایش توضیحات :</span>
            <div className="col-span-9 flex items-center gap-1">
              <div className="inline-flex rounded border border-slate-300 overflow-hidden bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setShowDescription(true)}
                  className={`px-4 py-1 ${showDescription ? 'bg-[#0288d1] text-white font-bold' : 'text-slate-600'}`}
                >
                  بلی
                </button>
                <button
                  type="button"
                  onClick={() => setShowDescription(false)}
                  className={`px-4 py-1 ${!showDescription ? 'bg-slate-400 text-white font-bold' : 'text-slate-600'}`}
                >
                  خیر
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">وضعیت کلاس :</span>
            <div className="col-span-9 flex items-center gap-1">
              <div className="inline-flex rounded border border-slate-300 overflow-hidden bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`px-4 py-1 ${status === 'active' ? 'bg-[#0288d1] text-white font-bold' : 'text-slate-600'}`}
                >
                  فعال
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={`px-4 py-1 ${status === 'inactive' ? 'bg-slate-400 text-white font-bold' : 'text-slate-600'}`}
                >
                  غیرفعال
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 mt-3">
            <div className="text-[11px] font-bold text-slate-500 mb-2">محدودیت زمان</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0">از تاریخ</span>
                <PersianDatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="۱۴۰۵/۰۸/۰۱"
                  className="flex-1"
                />
                <span className="text-slate-600 shrink-0">ساعت</span>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="08:00"
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-xs bg-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 shrink-0">تا تاریخ</span>
                <PersianDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="۱۴۰۵/۰۹/۰۱"
                  className="flex-1"
                />
                <span className="text-slate-600 shrink-0">ساعت</span>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="14:30"
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-xs bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-700">دسترسی فراگیران :</span>
              <div className="inline-flex rounded border border-slate-300 overflow-hidden bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setAccessMode('unlimited')}
                  className={`px-3 py-1 ${accessMode === 'unlimited' ? 'bg-[#0288d1] text-white font-bold' : 'text-slate-600'}`}
                >
                  بدون محدودیت
                </button>
                <button
                  type="button"
                  onClick={() => setAccessMode('first_login')}
                  className={`px-3 py-1 ${accessMode === 'first_login' ? 'bg-[#0288d1] text-white font-bold' : 'text-slate-600'}`}
                >
                  از اولین ورود
                </button>
                <button
                  type="button"
                  onClick={() => setAccessMode('reg_date')}
                  className={`px-3 py-1 ${accessMode === 'reg_date' ? 'bg-[#0288d1] text-white font-bold' : 'text-slate-600'}`}
                >
                  از تاریخ ثبت نام
                </button>
              </div>

              {accessMode !== 'unlimited' && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={accessDays}
                    onChange={(e) => setAccessDays(e.target.value)}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-xs bg-white font-mono"
                  />
                  <span className="text-slate-600 text-[11px]">روز</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400 font-mono">
        مدیریت یکپارچه آموزش و یادگیری ایده ( ۷.۵۰.۰۰.۸۸ )
      </div>

      {isPersonnelModalOpen && (
        <ClassPersonnelModal
          course={currentCourseMock}
          initialRole={personnelInitialRole}
          isOpen={true}
          onClose={() => setIsPersonnelModalOpen(false)}
          onSaved={() => {
            const reloaded = db.getCourseById(currentCourseMock.id);
            if (reloaded) {
              // updated
            }
          }}
        />
      )}

      {isPrereqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-lg w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">انتخاب کلاس‌های پیش‌نیاز</h3>
              <button onClick={() => setIsPrereqModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 border border-slate-300 rounded px-2.5 py-1 bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={prereqSearch}
                onChange={(e) => setPrereqSearch(e.target.value)}
                placeholder="جستجو در دوره‌ها..."
                className="w-full text-xs bg-transparent focus:outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded p-1">
              {allCourses
                .filter((c) => c.id !== initialCourse?.id && c.title.includes(prereqSearch))
                .map((c) => {
                  const isChecked = prereqCourseIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center justify-between p-2 hover:bg-sky-50 rounded cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setPrereqCourseIds(prereqCourseIds.filter((id) => id !== c.id));
                            } else {
                              setPrereqCourseIds([...prereqCourseIds, c.id]);
                            }
                          }}
                          className="rounded text-[#0288d1] focus:ring-0"
                        />
                        <span className="font-bold text-slate-800">{c.title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{c.code}</span>
                    </label>
                  );
                })}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsPrereqModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                تایید ({prereqCourseIds.length} کلاس انتخاب شده)
              </button>
            </div>
          </div>
        </div>
      )}

      {isWelcomeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-lg w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">پیکربندی پیام خوش‌آمدگویی کلاس</h3>
              <button onClick={() => setIsWelcomeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">عنوان پیام :</label>
                <input
                  type="text"
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">متن پیام خوش‌آمدگویی :</label>
                <textarea
                  rows={4}
                  value={welcomeBody}
                  onChange={(e) => setWelcomeBody(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsWelcomeModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                ذخیره پیام خوش‌آمدگویی
              </button>
            </div>
          </div>
        </div>
      )}

      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-lg w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">پروژه‌های آموزشی کلاسی</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">عنوان پروژه :</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">مهلت ارسال پروژه :</label>
                <PersianDatePicker
                  value={projectDeadline}
                  onChange={setProjectDeadline}
                  placeholder="۱۴۰۵/۰۹/۱۵"
                  className="w-full"
                  inputClassName="w-full text-right"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">دستورالعمل و ضوابط پروژه :</label>
                <textarea
                  rows={3}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                ذخیره مشخصات پروژه
              </button>
            </div>
          </div>
        </div>
      )}

      {isGradingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">نحوه محاسبه نمره نهایی کلاس</h3>
              <button onClick={() => setIsGradingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">نمره آزمون پایانی:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={gradeExam}
                    onChange={(e) => setGradeExam(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold"
                  />
                  <span>٪</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">نمره حضور و غیاب:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={gradeAttendance}
                    onChange={(e) => setGradeAttendance(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold"
                  />
                  <span>٪</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">تکالیف و فعالیت کلاسی:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={gradeActivity}
                    onChange={(e) => setGradeActivity(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold"
                  />
                  <span>٪</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">پروژه کلاسی:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={gradeProject}
                    onChange={(e) => setGradeProject(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold"
                  />
                  <span>٪</span>
                </div>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-xs">
                <span>مجموع ضرایب:</span>
                <span className={gradeExam + gradeAttendance + gradeActivity + gradeProject === 100 ? 'text-emerald-700' : 'text-rose-600'}>
                  {gradeExam + gradeAttendance + gradeActivity + gradeProject}٪
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsGradingModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                ثبت فرمول نمره نهایی
              </button>
            </div>
          </div>
        </div>
      )}

      {isForumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">دسترسی انجمن و پرسش و پاسخ</h3>
              <button onClick={() => setIsForumModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-2 bg-slate-50 border rounded cursor-pointer">
                <span>فعال بودن انجمن برای این کلاس</span>
                <input
                  type="checkbox"
                  checked={forumActive}
                  onChange={(e) => setForumActive(e.target.checked)}
                  className="rounded text-[#0288d1] focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between p-2 bg-slate-50 border rounded cursor-pointer">
                <span>امکان ایجاد تاپیک جدید توسط فراگیران</span>
                <input
                  type="checkbox"
                  checked={allowLearnerTopics}
                  onChange={(e) => setAllowLearnerTopics(e.target.checked)}
                  className="rounded text-[#0288d1] focus:ring-0"
                />
              </label>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsForumModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                ثبت تنظیمات انجمن
              </button>
            </div>
          </div>
        </div>
      )}

      {isOnlineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">تنظیمات جلسه آنلاین و وبینار</h3>
              <button onClick={() => setIsOnlineModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">پلتفرم وبینار :</label>
                <select
                  value={onlinePlatform}
                  onChange={(e) => setOnlinePlatform(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  <option value="skyroom">اسکای‌روم (Skyroom داخلی پالایشگاه)</option>
                  <option value="adobe">ادوبی کانکت (Adobe Connect)</option>
                  <option value="bbb">بیگ‌بلو‌باتن (BigBlueButton)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">لینک ورود به اتاق جلسه :</label>
                <input
                  type="text"
                  value={onlineUrl}
                  onChange={(e) => setOnlineUrl(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">رمز ورود به جلسه :</label>
                <input
                  type="text"
                  value={onlinePass}
                  onChange={(e) => setOnlinePass(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsOnlineModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                ثبت جلسه آنلاین
              </button>
            </div>
          </div>
        </div>
      )}

      {isMonitoringModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-2xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-600" />
                <span>پایش لحظه‌ای نتایج کلاس: {title}</span>
              </h3>
              <button onClick={() => setIsMonitoringModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 font-bold border-b">
                  <tr>
                    <th className="p-2">نام فراگیر</th>
                    <th className="p-2">کد پرسنلی</th>
                    <th className="p-2">پیشرفت</th>
                    <th className="p-2">نمره آزمون</th>
                    <th className="p-2">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 font-bold">علی محمدی</td>
                    <td className="p-2 font-mono">990012</td>
                    <td className="p-2 font-mono">100%</td>
                    <td className="p-2 font-mono font-bold text-emerald-700">88 از 100</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">قبول</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 font-bold">رضا احمدی</td>
                    <td className="p-2 font-mono">990013</td>
                    <td className="p-2 font-mono">75%</td>
                    <td className="p-2 font-mono font-bold text-sky-700">در حال ارزیابی</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-bold">در جریان</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsMonitoringModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-lg w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>زمان‌بندی و تقویم کلاس</span>
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border space-y-1">
                <div className="font-bold text-slate-800">جلسه اول: آشنایی و مبانی نظری</div>
                <div className="text-[11px] text-slate-500 font-mono">تاریخ: {startDate} ساعت ۰۸:۰۰ الی ۱۰:۰۰</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border space-y-1">
                <div className="font-bold text-slate-800">جلسه دوم: کارگاه عملی و حل سناریو</div>
                <div className="text-[11px] text-slate-500 font-mono">تاریخ: ۱۴۰۵/۰۸/۱۵ ساعت ۱۰:۰۰ الی ۱۲:۰۰</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border space-y-1">
                <div className="font-bold text-slate-800">جلسه پایانی: آزمون نهایی و سنجش صلاحیت</div>
                <div className="text-[11px] text-slate-500 font-mono">تاریخ: {endDate} ساعت ۱۴:۰۰ الی ۱۵:۰۰</div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-600" />
                <span>اشتراک‌گذاری و ثبت‌نام در کلاس</span>
              </h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">لینک مستقیم ورود به کلاس :</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    readOnly
                    value={`https://lms.eorc.ir/Training/Class/View/${code}`}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded font-mono text-[11px] bg-slate-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0288d1] rounded"
                    title="کپی لینک"
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center p-4 bg-slate-50 border rounded-lg">
                <div className="text-center space-y-2">
                  <QrCode className="w-24 h-24 mx-auto text-slate-800" />
                  <span className="text-[10px] text-slate-500 block">
                    اسکن بارکد جهت ورود مستقیم از تبلت و گوشی سازمانی
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
