import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import {
  RotateCcw,
  Check,
  Trash2,
  Plus,
  Folder,
  FileText,
  HelpCircle,
  BookOpen,
  Film,
  Download,
  Upload,
  AlertTriangle,
  Layers,
  ChevronRight,
  ChevronDown,
  Monitor,
  Settings,
  Library,
  Video,
  Clock,
  Printer,
  Calendar,
  Shuffle,
  Percent,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';
import { PersianDatePicker } from '../common/PersianDatePicker';
import { Question } from '../../types/models';

type TreeNodeType = 'package' | 'lesson' | 'exam' | 'folder';

interface TreeNode {
  id: string;
  title: string;
  type: TreeNodeType;
  children?: TreeNode[];
}

export const ContentManager: React.FC = () => {
  const courses = db.getCourses();

  const [activeCourseTitle, setActiveCourseTitle] = useState(courses[0]?.title || 'test');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('exam_2');
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'sequence'>('preview');

  const [contentTree, setContentTree] = useState<TreeNode[]>([
    {
      id: 'root_pkg',
      title: 'test',
      type: 'package',
      children: [
        { id: 'lesson_1', title: 'درس', type: 'lesson' },
        { id: 'exam_1', title: 'آزمون', type: 'exam' },
        {
          id: 'folder_1',
          title: 'پوشه جدید',
          type: 'folder',
          children: [{ id: 'exam_2', title: 'آزمون', type: 'exam' }]
        }
      ]
    }
  ]);

  const [lessonWidthL, setLessonWidthL] = useState('50');
  const [lessonWidthR, setLessonWidthR] = useState('50');
  const [lessonTitle, setLessonTitle] = useState('درس');
  const [lessonDescription, setLessonDescription] = useState('');
  const [videoPlayerType, setVideoPlayerType] = useState<'html5' | 'flv'>('html5');
  const [lessonViewLimit, setLessonViewLimit] = useState('0');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(8);

  const [examActiveTab, setExamActiveTab] = useState<'settings' | 'questions'>('settings');
  const [examPassingGrade, setExamPassingGrade] = useState('50');
  const [examTitle, setExamTitle] = useState('آزمون');
  const [examSubTab, setExamSubTab] = useState<'repeat' | 'time' | 'execution' | 'select_q' | 'start_end' | 'print'>('execution');

  // زیرتب ۱: تکرار آزمون
  const [examRepeatType, setExamRepeatType] = useState<'unlimited' | 'limited'>('unlimited');
  const [examMaxAttempts, setExamMaxAttempts] = useState<number>(3);
  const [examGradeCalculation, setExamGradeCalculation] = useState<'highest' | 'last' | 'average' | 'first'>('highest');
  const [examRepeatCooldownHours, setExamRepeatCooldownHours] = useState<number>(0);
  const [examRepeatCondition, setExamRepeatCondition] = useState<'always' | 'only_failed'>('always');
  const [examHideCorrectAnswersOnRepeat, setExamHideCorrectAnswersOnRepeat] = useState<boolean>(true);

  // زیرتب ۲: محدودیت زمانی
  const [examHasTimeLimit, setExamHasTimeLimit] = useState<boolean>(true);
  const [examDurationMinutes, setExamDurationMinutes] = useState<number>(30);
  const [examPerQuestionSeconds, setExamPerQuestionSeconds] = useState<number>(0);
  const [examShowCountdown, setExamShowCountdown] = useState<boolean>(true);
  const [examWarnFiveMinutes, setExamWarnFiveMinutes] = useState<boolean>(true);
  const [examAutoSubmitOnTimeOut, setExamAutoSubmitOnTimeOut] = useState<boolean>(true);
  const [examAllowResume, setExamAllowResume] = useState<boolean>(true);

  // زیرتب ۳: نحوه اجرا
  const [examDisplayMode, setExamDisplayMode] = useState<'question_by_question' | 'one_page'>('question_by_question');
  const [autoNextOnSelect, setAutoNextOnSelect] = useState(false);
  const [allowReviewPrevious, setAllowReviewPrevious] = useState(true);
  const [sendAnswerPerQuestion, setSendAnswerPerQuestion] = useState(true);
  const [verifyIdentity, setVerifyIdentity] = useState(false);
  const [navButtonText, setNavButtonText] = useState('علامت');
  const [optionMarker, setOptionMarker] = useState('پیش فرض');
  const [enableErrorReporting, setEnableErrorReporting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showQuestionCoefficient, setShowQuestionCoefficient] = useState(false);
  const [showResultAtEnd, setShowResultAtEnd] = useState(true);
  const [ltrForEnglish, setLtrForEnglish] = useState(false);
  const [sendResultToTrainingSystem, setSendResultToTrainingSystem] = useState(false);

  // زیرتب ۴: انتخاب سوال
  const [examQuestionSelection, setExamQuestionSelection] = useState<'all_fixed' | 'random_subset'>('all_fixed');
  const [examRandomSubsetCount, setExamRandomSubsetCount] = useState<number>(10);
  const [examRandomizeQuestionOrder, setExamRandomizeQuestionOrder] = useState<boolean>(true);
  const [examRandomizeOptionOrder, setExamRandomizeOptionOrder] = useState<boolean>(true);
  const [examNegativeMarking, setExamNegativeMarking] = useState<boolean>(false);
  const [examNegativeMarkRatio, setExamNegativeMarkRatio] = useState<string>('0.33');
  const [examDifficultyDistribution, setExamDifficultyDistribution] = useState<'balanced' | 'all' | 'hard'>('balanced');

  // زیرتب ۵: آغاز و پایان آزمون
  const [examScheduleType, setExamScheduleType] = useState<'scheduled' | 'unlimited'>('scheduled');
  const [examStartDate, setExamStartDate] = useState<string>('1405/08/10');
  const [examStartTime, setExamStartTime] = useState<string>('08:00');
  const [examEndDate, setExamEndDate] = useState<string>('1405/08/25');
  const [examEndTime, setExamEndTime] = useState<string>('16:00');
  const [examAllowLateApproval, setExamAllowLateApproval] = useState<boolean>(false);
  const [examDirectEntry, setExamDirectEntry] = useState<boolean>(true);
  const [examAutoLockOnEnd, setExamAutoLockOnEnd] = useState<boolean>(true);

  // زیرتب ۶: خروجی چاپی آزمون
  const [printHeaderOrg, setPrintHeaderOrg] = useState<string>('شرکت پالایش نفت اصفهان - مدیریت سامانه یادگیری و آزمون الکترونیکی');
  const [printColumns, setPrintColumns] = useState<'1' | '2'>('1');
  const [printIncludeAnswerKey, setPrintIncludeAnswerKey] = useState<boolean>(false);
  const [printIncludeCandidateBarcode, setPrintIncludeCandidateBarcode] = useState<boolean>(true);
  const [printIncludeSignatureBoxes, setPrintIncludeSignatureBoxes] = useState<boolean>(true);
  const [printFontSize, setPrintFontSize] = useState<'normal' | 'large'>('normal');
  const [printPreviewOpen, setPrintPreviewOpen] = useState<boolean>(false);

  // لیست سوالات آزمون
  const [examQuestions, setExamQuestions] = useState<Question[]>(() => {
    const fromDb = db.getQuestions();
    return fromDb.length > 0 ? fromDb.slice(0, 4) : [
      {
        id: 'qst_loc_1',
        exam_id: 'exam_2',
        question_text: 'هدف اصلی از استقرار چرخه یادگیری و مدیریت شایستگی در سازمان چیست؟',
        question_type: 'multiple_choice',
        options: [
          'تنها بایگانی فیزیکی گواهینامه‌ها',
          'ارتقای مستمر شایستگی شغلی و اثربخشی عملکرد پرسنل',
          'کاهش ساعت‌های آموزش اداری',
          'کنترل غیرضروری زمان حضور کارکنان'
        ],
        correct_option_index: 1,
        score_weight: 25,
        explanation: 'هدف اصلی توسعه توانمندی‌های منابع انسانی در راستای استراتژی سازمان است.'
      },
      {
        id: 'qst_loc_2',
        exam_id: 'exam_2',
        question_text: 'مبنای زمان‌بندی و بازه مجاز ورود فراگیر به آزمون در سیستم چیست؟',
        question_type: 'multiple_choice',
        options: [
          'تقویم رسمی جلالی سامانه و ساعت ثبت شده سرور',
          'ساعت محلی دستگاه فراگیر',
          'تماس تلفنی با پشتیبانی',
          'نرم‌افزار مرورگر اینترنت فراگیر'
        ],
        correct_option_index: 0,
        score_weight: 25,
        explanation: 'سامانه زمان‌بندی دقیق را از ساعت و تقویم متمرکز سرور استعلام می‌نماید.'
      }
    ];
  });

  // فرم افزودن سوال جدید
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQWeight, setNewQWeight] = useState(25);

  const [alertSaved, setAlertSaved] = useState(false);

  const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNode(n.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = findNode(contentTree, selectedNodeId) || {
    id: 'exam_2',
    title: 'آزمون',
    type: 'exam' as TreeNodeType
  };

  const handleAddNode = (type: TreeNodeType) => {
    const newId = `${type}_${Date.now().toString().slice(-4)}`;
    const titles: Record<TreeNodeType, string> = {
      package: 'بسته جدید',
      lesson: 'درس جدید',
      exam: 'آزمون جدید',
      folder: 'پوشه جدید'
    };

    const newNode: TreeNode = {
      id: newId,
      title: titles[type],
      type,
      children: type === 'folder' || type === 'package' ? [] : undefined
    };

    setContentTree((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as TreeNode[];
      if (copy[0]?.children) {
        copy[0].children.push(newNode);
      } else {
        copy.push(newNode);
      }
      return copy;
    });

    setSelectedNodeId(newId);
  };

  const handleDeleteSelected = () => {
    if (selectedNode.type === 'package') {
      alert('بسته اصلی قابل حذف نیست.');
      return;
    }
    if (confirm(`آیا از حذف آیتم «${selectedNode.title}» اطمینان دارید؟`)) {
      const filterTree = (nodes: TreeNode[]): TreeNode[] => {
        return nodes
          .filter((n) => n.id !== selectedNodeId)
          .map((n) => ({
            ...n,
            children: n.children ? filterTree(n.children) : undefined
          }));
      };
      setContentTree(filterTree(contentTree));
      setSelectedNodeId('lesson_1');
    }
  };

  const handleSave = () => {
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 3000);
  };

  const renderTreeItem = (node: TreeNode) => {
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    let icon = <BookOpen className="w-3.5 h-3.5 text-amber-700" />;
    if (node.type === 'folder') icon = <Folder className="w-3.5 h-3.5 text-amber-500" />;
    if (node.type === 'lesson') icon = <FileText className="w-3.5 h-3.5 text-sky-600" />;
    if (node.type === 'exam') icon = <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />;

    return (
      <div key={node.id} className="text-xs">
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? 'bg-[#e65100] text-white font-bold shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          {icon}
          <span className="truncate">{node.title}</span>
        </div>

        {hasChildren && (
          <div className="pr-4 border-r border-slate-200 mt-0.5 space-y-0.5">
            {node.children!.map((child) => renderTreeItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-4 text-slate-800 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-5 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-bold rounded shadow-xs transition-colors flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>ذخیره</span>
          </button>
          <button
            onClick={handleDeleteSelected}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>حذف</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>تدوین محتوا - {activeCourseTitle}</span>
          <RotateCcw className="w-4 h-4 text-sky-600 cursor-pointer hover:rotate-180 transition-transform" />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded flex items-center justify-between gap-2 mb-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>جهت بازسازی محتوا، دکمه 'ذخیره' را کلیک نمایید.</span>
        </div>
        {alertSaved && (
          <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
            تغییرات با موفقیت ذخیره شد
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-4">
          {selectedNode.type === 'lesson' ? (
            <div className="space-y-4">
              <div className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
                درس ( طراحی درس )
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5 flex items-center gap-2">
                  <span className="text-slate-700 font-semibold shrink-0">درصد عرض قاب ها :</span>
                  <input
                    type="text"
                    value={lessonWidthL}
                    onChange={(e) => setLessonWidthL(e.target.value)}
                    className="w-14 px-2 py-1 border border-slate-300 rounded text-center font-mono bg-white text-xs"
                  />
                  <span>|</span>
                  <input
                    type="text"
                    value={lessonWidthR}
                    onChange={(e) => setLessonWidthR(e.target.value)}
                    className="w-14 px-2 py-1 border border-slate-300 rounded text-center font-mono bg-white text-xs"
                  />
                </div>

                <div className="sm:col-span-7 flex items-center gap-2">
                  <span className="text-slate-700 font-semibold shrink-0">عنوان :</span>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="flex-1 px-3 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-slate-700 font-semibold shrink-0 pt-1">توضیحات :</span>
                <textarea
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-slate-700 font-semibold">نمایش ویدیو :</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="videoPlayer"
                      checked={videoPlayerType === 'html5'}
                      onChange={() => setVideoPlayerType('html5')}
                      className="text-[#0288d1] focus:ring-0"
                    />
                    <span className="font-bold">HTML5</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="videoPlayer"
                      checked={videoPlayerType === 'flv'}
                      onChange={() => setVideoPlayerType('flv')}
                      className="text-[#0288d1] focus:ring-0"
                    />
                    <span>FLV</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-semibold">محدودیت نمایش :</span>
                  <input
                    type="number"
                    value={lessonViewLimit}
                    onChange={(e) => setLessonViewLimit(e.target.value)}
                    className="w-16 px-2 py-0.5 border border-slate-300 rounded text-center font-mono bg-white text-xs"
                  />
                  <span>مرتبه</span>
                  <span className="text-[11px] text-slate-400">
                    (در صورت وارد نکردن مقدار، محدودیتی وجود نخواهد داشت)
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-500 mb-2">قالب</div>
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                  {[
                    'تک قاب کامل',
                    'دو ستون مساوی',
                    'سه ستون',
                    'هدر + بدنه',
                    'هدر + ۲ ستون',
                    'سایدبار راست + محتوا',
                    'سایدبار چپ + محتوا',
                    'چهارگانه متقارن',
                    'نمایش تمام صفحه ویدیویی'
                  ].map((tplName, index) => {
                    const isSelected = selectedTemplateIndex === index;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedTemplateIndex(index)}
                        className={`h-16 rounded border-2 p-1 flex flex-col justify-between transition-all bg-white hover:bg-sky-50/40 ${
                          isSelected
                            ? 'border-emerald-500 shadow-md ring-2 ring-emerald-200'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        title={tplName}
                      >
                        <div className="w-full h-8 bg-sky-100 rounded-xs flex items-center justify-center">
                          {index === 8 ? (
                            <Video className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Layers className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 truncate block text-center">
                          قالب {index + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-500 mb-2">محتوا</div>
                <div className="relative w-full h-64 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shadow-inner">
                      <Film className="w-10 h-10 text-sky-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      پخش‌کننده چندرسانه‌ای فعال (آماده بارگذاری ویدیو و اسلایدها)
                    </span>
                  </div>

                  <div className="absolute top-3 left-3 bg-white/95 border border-slate-200 rounded shadow-md p-1.5 flex flex-col gap-1 text-[11px]">
                    <button
                      onClick={() => alert('افزودن مدیا جدید')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-emerald-50 text-emerald-700 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ جدید</span>
                    </button>
                    <button
                      onClick={() => alert('انتخاب از منابع آموزشی')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-sky-50 text-[#0288d1] font-medium"
                    >
                      <Library className="w-3.5 h-3.5" />
                      <span>منابع آموزشی</span>
                    </button>
                    <button
                      onClick={() => alert('دانلود فایل')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود</span>
                    </button>
                    <button
                      onClick={() => alert('حذف رسانه')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-rose-50 text-rose-600 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
                <span>آزمون - {examTitle}</span>
                <span className="text-[11px] font-normal text-slate-500">کد آیتم: {selectedNode.id}</span>
              </div>

              <div className="bg-sky-50 border border-sky-200 text-[#0288d1] px-3 py-2 rounded text-xs font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#0288d1] shrink-0" />
                  <span>
                    {examRepeatType === 'unlimited'
                      ? 'تکرار این آزمون بدون محدودیت می باشد.'
                      : `تکرار این آزمون حداکثر به ${examMaxAttempts} مرتبه محدود می‌باشد.`}
                  </span>
                </div>
                <div className="text-[11px] text-sky-700 bg-white/80 px-2 py-0.5 rounded border border-sky-200">
                  نمره قبولی: {examPassingGrade} از ۱۰۰
                </div>
              </div>

              <div className="flex items-center gap-1 border-b border-slate-200">
                <button
                  onClick={() => setExamActiveTab('settings')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    examActiveTab === 'settings'
                      ? 'border-[#0288d1] text-[#0288d1]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>تنظیمات</span>
                </button>
                <button
                  onClick={() => setExamActiveTab('questions')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    examActiveTab === 'questions'
                      ? 'border-[#0288d1] text-[#0288d1]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>سوالات ({examQuestions.length})</span>
                </button>
              </div>

              {examActiveTab === 'settings' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4 flex items-center gap-2">
                      <span className="text-slate-700 font-semibold shrink-0">نمره قبولی :</span>
                      <input
                        type="number"
                        value={examPassingGrade}
                        onChange={(e) => setExamPassingGrade(e.target.value)}
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-center font-bold bg-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-8 flex items-center gap-2">
                      <span className="text-slate-700 font-semibold shrink-0">عنوان :</span>
                      <input
                        type="text"
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        className="flex-1 px-3 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* نوار زیرتب‌های ۶ گانه آزمون */}
                  <div className="flex flex-wrap items-center gap-1 border border-slate-200 rounded bg-slate-50 p-1">
                    {[
                      { id: 'repeat', label: 'تکرار آزمون', icon: RotateCcw },
                      { id: 'time', label: 'محدودیت زمانی', icon: Clock },
                      { id: 'execution', label: 'نحوه اجرا', icon: Monitor },
                      { id: 'select_q', label: 'انتخاب سوال', icon: Shuffle },
                      { id: 'start_end', label: 'آغاز و پایان آزمون', icon: Calendar },
                      { id: 'print', label: 'خروجی چاپی آزمون', icon: Printer }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setExamSubTab(st.id as any)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                          examSubTab === st.id
                            ? 'bg-white text-[#0288d1] shadow-xs border border-slate-200 font-extrabold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        <st.icon className="w-3.5 h-3.5" />
                        <span>{st.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* تب ۱: تکرار آزمون */}
                  {examSubTab === 'repeat' && (
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <RotateCcw className="w-3.5 h-3.5 text-[#0288d1]" />
                          <span>شرایط و محدودیت تکرار آزمون</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                              <input
                                type="radio"
                                name="repeatMode"
                                checked={examRepeatType === 'unlimited'}
                                onChange={() => setExamRepeatType('unlimited')}
                                className="text-[#0288d1] focus:ring-0"
                              />
                              <span>تکرار بدون محدودیت (امکان شرکت مکرر فراگیر)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                              <input
                                type="radio"
                                name="repeatMode"
                                checked={examRepeatType === 'limited'}
                                onChange={() => setExamRepeatType('limited')}
                                className="text-[#0288d1] focus:ring-0"
                              />
                              <span>محدود به دفعات مشخص :</span>
                            </label>

                            {examRepeatType === 'limited' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={examMaxAttempts}
                                  onChange={(e) => setExamMaxAttempts(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-20 px-2 py-1 border border-slate-300 rounded text-center font-bold bg-white text-xs"
                                />
                                <span className="text-slate-500 text-xs">مرتبه</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Percent className="w-3.5 h-3.5 text-[#0288d1]" />
                          <span>قوانین نمره‌دهی و وقفه بین تلاش‌ها</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-semibold shrink-0">روش محاسبه نمره در کارنامه :</span>
                            <select
                              value={examGradeCalculation}
                              onChange={(e) => setExamGradeCalculation(e.target.value as any)}
                              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                            >
                              <option value="highest">بالاترین نمره کسب شده (پیشنهادی)</option>
                              <option value="last">آخرین نمره ثبت شده</option>
                              <option value="average">میانگین تمام دفعات شرکت</option>
                              <option value="first">نمره نخستین تلاش</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-semibold shrink-0">وقفه زمانی بین هر بار شرکت :</span>
                            <input
                              type="number"
                              min="0"
                              value={examRepeatCooldownHours}
                              onChange={(e) => setExamRepeatCooldownHours(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center font-bold bg-white text-xs"
                            />
                            <span className="text-slate-500 text-xs">ساعت (۰ = بلافاصله)</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={examRepeatCondition === 'only_failed'}
                              onChange={(e) => setExamRepeatCondition(e.target.checked ? 'only_failed' : 'always')}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span>تکرار آزمون تنها در صورت عدم کسب نمره قبولی (رد شدن) مجاز باشد</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={examHideCorrectAnswersOnRepeat}
                              onChange={(e) => setExamHideCorrectAnswersOnRepeat(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span>عدم نمایش پاسخ‌های صحیح پس از اتمام آزمون در صورت وجود شانس تکرار (جلوگیری از افشای سوالات)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* تب ۲: محدودیت زمانی */}
                  {examSubTab === 'time' && (
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Clock className="w-3.5 h-3.5 text-[#0288d1]" />
                          <span>مدت زمان کل آزمون</span>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="checkbox"
                              checked={examHasTimeLimit}
                              onChange={(e) => setExamHasTimeLimit(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span>آزمون دارای محدودیت زمانی کل باشد</span>
                          </label>

                          {examHasTimeLimit && (
                            <div className="pr-6 flex items-center gap-3">
                              <span className="text-slate-700 font-semibold text-xs">مدت زمان پاسخگویی به کل آزمون :</span>
                              <input
                                type="number"
                                min="1"
                                max="300"
                                value={examDurationMinutes}
                                onChange={(e) => setExamDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-24 px-2 py-1.5 border border-slate-300 rounded text-center font-bold bg-white text-xs"
                              />
                              <span className="text-slate-500 text-xs">دقیقه</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Clock className="w-3.5 h-3.5 text-[#0288d1]" />
                          <span>زمان‌بندی هر سوال و رفتارهای تایمر</span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-700 font-semibold text-xs shrink-0">محدودیت زمان شناور هر سوال (ثانیه) :</span>
                            <input
                              type="number"
                              min="0"
                              max="600"
                              value={examPerQuestionSeconds}
                              onChange={(e) => setExamPerQuestionSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-24 px-2 py-1 border border-slate-300 rounded text-center font-bold bg-white text-xs"
                            />
                            <span className="text-slate-400 text-[11px]">(۰ = بدون محدودیت به تفکیک سوال)</span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={examShowCountdown}
                                onChange={(e) => setExamShowCountdown(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>نمایش ثانیه‌شمار معکوس در بالای آزمون</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={examWarnFiveMinutes}
                                onChange={(e) => setExamWarnFiveMinutes(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>اعلام هشدار دیداری در ۵ دقیقه پایانی آزمون</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={examAutoSubmitOnTimeOut}
                                onChange={(e) => setExamAutoSubmitOnTimeOut(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>ارسال خودکار پاسخ‌های ثبت‌شده با اتمام زمان</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={examAllowResume}
                                onChange={(e) => setExamAllowResume(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>امکان ادامه آزمون در صورت قطعی اینترنت فراگیر</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* تب ۳: نحوه اجرا */}
                  {examSubTab === 'execution' && (
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-white">
                        <div className="text-[11px] font-bold text-slate-500">نحوه نمایش</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                              <input
                                type="radio"
                                name="examDisp"
                                checked={examDisplayMode === 'question_by_question'}
                                onChange={() => setExamDisplayMode('question_by_question')}
                                className="text-[#0288d1] focus:ring-0"
                              />
                              <span>سوال به سوال</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                              <input
                                type="radio"
                                name="examDisp"
                                checked={examDisplayMode === 'one_page'}
                                onChange={() => setExamDisplayMode('one_page')}
                                className="text-[#0288d1] focus:ring-0"
                              />
                              <span>سوالات در یک صفحه</span>
                            </label>
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={autoNextOnSelect}
                                onChange={(e) => setAutoNextOnSelect(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>هدایت به سوال بعد با انتخاب گزینه پاسخ</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={allowReviewPrevious}
                                onChange={(e) => setAllowReviewPrevious(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>امکان مرور سوالات و بازگشت به سوال قبلی</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={sendAnswerPerQuestion}
                                onChange={(e) => setSendAnswerPerQuestion(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>ارسال پاسخ‌ها به سرور به‌صورت سوال به سوال</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={verifyIdentity}
                                onChange={(e) => setVerifyIdentity(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>تصدیق هویت شرکت‌کننده از طریق پرسش مشخصات فردی</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 shrink-0">متن دکمه‌های پیمایش :</span>
                            <select
                              value={navButtonText}
                              onChange={(e) => setNavButtonText(e.target.value)}
                              className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                            >
                              <option value="علامت">علامت</option>
                              <option value="متنی">متنی (بعدی / قبلی)</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 shrink-0">علامت گزینه‌های سوالات :</span>
                            <select
                              value={optionMarker}
                              onChange={(e) => setOptionMarker(e.target.value)}
                              className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                            >
                              <option value="پیش فرض">--- پیش فرض ---</option>
                              <option value="الف ب ج">الف، ب، ج، د</option>
                              <option value="1234">۱، ۲، ۳، ۴</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                        <div className="text-[11px] font-bold text-slate-500">نمایش جزئیات</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={enableErrorReporting}
                              onChange={(e) => setEnableErrorReporting(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span>فعال‌سازی گزارش خطا</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={showFeedback}
                              onChange={(e) => setShowFeedback(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span>نمایش بازخورد</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={showQuestionCoefficient}
                              onChange={(e) => setShowQuestionCoefficient(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span>نمایش ضریب سوال</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={showResultAtEnd}
                              onChange={(e) => setShowResultAtEnd(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span className="font-bold">نمایش نتیجه در پایان</span>
                          </label>
                        </div>

                        {!showResultAtEnd && (
                          <div className="text-[11px] text-rose-600 font-semibold pt-1">
                            در صورت غیرفعال نمودن این گزینه در پایان آزمون نمره محاسبه نمی‌شود و در پایش کلاس باید محاسبه نمره شود.
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-1 border-t border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={ltrForEnglish}
                            onChange={(e) => setLtrForEnglish(e.target.checked)}
                            className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                          />
                          <span>چیدمان ساختار کلی به صورت چپ چین برای آزمون انگلیسی</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={sendResultToTrainingSystem}
                            onChange={(e) => setSendResultToTrainingSystem(e.target.checked)}
                            className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                          />
                          <span>ارسال نتیجه هر فرد به سامانه مدیریت آموزش، پس از اتمام آزمون</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* تب ۴: انتخاب سوال */}
                  {examSubTab === 'select_q' && (
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Shuffle className="w-3.5 h-3.5 text-[#0288d1]" />
                          <span>نحوه چینش و استخراج سوالات</span>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="qSelectMode"
                              checked={examQuestionSelection === 'all_fixed'}
                              onChange={() => setExamQuestionSelection('all_fixed')}
                              className="text-[#0288d1] focus:ring-0"
                            />
                            <span>نمایش تمامی سوالات تعریف‌شده در آزمون (ترتیب پیش‌فرض طراح)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="qSelectMode"
                              checked={examQuestionSelection === 'random_subset'}
                              onChange={() => setExamQuestionSelection('random_subset')}
                              className="text-[#0288d1] focus:ring-0"
                            />
                            <span>استخراج تصادفی تعدادی سوال از بانک آزمون :</span>
                          </label>

                          {examQuestionSelection === 'random_subset' && (
                            <div className="pr-6 flex items-center gap-3">
                              <span className="text-slate-700 text-xs font-semibold">تعداد سوالات انتخابی برای هر فراگیر :</span>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={examRandomSubsetCount}
                                onChange={(e) => setExamRandomSubsetCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-20 px-2 py-1 border border-slate-300 rounded text-center font-bold bg-white text-xs"
                              />
                              <span className="text-slate-500 text-xs">سوال از کل بانک</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Shuffle className="w-3.5 h-3.5 text-[#0288d1]" />
                          <span>تصادفی‌سازی و کنترل تقلب (Randomization)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={examRandomizeQuestionOrder}
                              onChange={(e) => setExamRandomizeQuestionOrder(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span className="font-semibold">به هم ریختن تصادفی ترتیب سوالات برای هر فراگیر</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={examRandomizeOptionOrder}
                              onChange={(e) => setExamRandomizeOptionOrder(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span className="font-semibold">جابجایی تصادفی گزینه‌های پاسخ (الف، ب، ج، د)</span>
                          </label>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                              <input
                                type="checkbox"
                                checked={examNegativeMarking}
                                onChange={(e) => setExamNegativeMarking(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>اعمال نمره منفی برای پاسخ‌های نادرست</span>
                            </label>

                            {examNegativeMarking && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 text-xs">ضریب کسر نمره :</span>
                                <select
                                  value={examNegativeMarkRatio}
                                  onChange={(e) => setExamNegativeMarkRatio(e.target.value)}
                                  className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                                >
                                  <option value="0.33">یک‌سوم نمره (-۰.۳۳)</option>
                                  <option value="0.25">یک‌چهارم نمره (-۰.۲۵)</option>
                                  <option value="0.5">نصف نمره (-۰.۵۰)</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* تب ۵: آغاز و پایان آزمون */}
                  {examSubTab === 'start_end' && (
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Calendar className="w-3.5 h-3.5 text-[#0288d1]" />
                          <span>بازه زمانی دسترسی به آزمون</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                              <input
                                type="radio"
                                name="scheduleType"
                                checked={examScheduleType === 'scheduled'}
                                onChange={() => setExamScheduleType('scheduled')}
                                className="text-[#0288d1] focus:ring-0"
                              />
                              <span>دارای بازه تقویمی مشخص (آغاز و پایان)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                              <input
                                type="radio"
                                name="scheduleType"
                                checked={examScheduleType === 'unlimited'}
                                onChange={() => setExamScheduleType('unlimited')}
                                className="text-[#0288d1] focus:ring-0"
                              />
                              <span>بدون محدودیت تقویمی (دسترسی همیشگی)</span>
                            </label>
                          </div>

                          {examScheduleType === 'scheduled' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2">
                                <span className="font-bold text-slate-700 text-xs block">تاریخ و ساعت آغاز آزمون :</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 text-xs shrink-0">از تاریخ:</span>
                                  <div className="flex-1">
                                    <PersianDatePicker
                                      value={examStartDate}
                                      onChange={setExamStartDate}
                                    />
                                  </div>
                                  <span className="text-slate-500 text-xs shrink-0">ساعت:</span>
                                  <input
                                    type="text"
                                    value={examStartTime}
                                    onChange={(e) => setExamStartTime(e.target.value)}
                                    placeholder="08:00"
                                    className="w-20 px-2 py-1.5 border border-slate-300 rounded bg-white text-center font-mono text-xs"
                                  />
                                </div>
                              </div>

                              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2">
                                <span className="font-bold text-slate-700 text-xs block">تاریخ و ساعت پایان آزمون :</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 text-xs shrink-0">تا تاریخ:</span>
                                  <div className="flex-1">
                                    <PersianDatePicker
                                      value={examEndDate}
                                      onChange={setExamEndDate}
                                    />
                                  </div>
                                  <span className="text-slate-500 text-xs shrink-0">ساعت:</span>
                                  <input
                                    type="text"
                                    value={examEndTime}
                                    onChange={(e) => setExamEndTime(e.target.value)}
                                    placeholder="16:00"
                                    className="w-20 px-2 py-1.5 border border-slate-300 rounded bg-white text-center font-mono text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg p-3.5 space-y-2 bg-white">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0288d1]" />
                          <span>قوانین ورود و مجوزهای تاخیر</span>
                        </div>

                        <div className="space-y-2 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={examDirectEntry}
                              onChange={(e) => setExamDirectEntry(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span>ورود مستقیم فراگیر به محیط آزمون بدون نیاز به تایید مجدد در بازه فعال</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={examAllowLateApproval}
                              onChange={(e) => setExamAllowLateApproval(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span>امکان ورود و شرکت فراگیران با تاخیر صرفاً با تایید مدرس یا مدیر آموزش</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={examAutoLockOnEnd}
                              onChange={(e) => setExamAutoLockOnEnd(e.target.checked)}
                              className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                            />
                            <span>بستن و قفل خودکار آزمون در سرور راس موعد پایان</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* تب ۶: خروجی چاپی آزمون */}
                  {examSubTab === 'print' && (
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Printer className="w-3.5 h-3.5 text-[#0288d1]" />
                          <span>تنظیمات قالب چاپی برگه امتحانی استاندارد</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-slate-700 font-semibold text-xs shrink-0">عنوان سربرگ برگه آزمون :</span>
                            <input
                              type="text"
                              value={printHeaderOrg}
                              onChange={(e) => setPrintHeaderOrg(e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 text-xs shrink-0">چیدمان برگه :</span>
                              <select
                                value={printColumns}
                                onChange={(e) => setPrintColumns(e.target.value as any)}
                                className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                              >
                                <option value="1">تک‌ستونه (استاندارد سازمانی A4)</option>
                                <option value="2">دو ستونه (صرفه‌جویی در کاغذ)</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 text-xs shrink-0">اندازه قلم متن سوالات :</span>
                              <select
                                value={printFontSize}
                                onChange={(e) => setPrintFontSize(e.target.value as any)}
                                className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                              >
                                <option value="normal">استاندارد (قلم ۱۱)</option>
                                <option value="large">درشت (قلم ۱۳)</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={printIncludeCandidateBarcode}
                                onChange={(e) => setPrintIncludeCandidateBarcode(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>چاپ بارکد شناسایی و کد ملی شرکت‌کننده در سربرگ</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={printIncludeSignatureBoxes}
                                onChange={(e) => setPrintIncludeSignatureBoxes(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>چاپ کادر امضای مراقب، رئیس آموزش و نمره نهایی</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={printIncludeAnswerKey}
                                onChange={(e) => setPrintIncludeAnswerKey(e.target.checked)}
                                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
                              />
                              <span>چاپ کلید پاسخ‌نامه (Answer Key) در صفحه مجزا مخصوص مصحح</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPrintPreviewOpen(true)}
                          className="px-4 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>پیش‌نمایش برگه چاپی آزمون</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          <span>ارسال مستقیم به چاپگر (Print)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* تب سوالات آزمون */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-700 text-xs">
                      بانک سوالات اختصاصی آزمون ({examQuestions.length} سوال)
                    </span>
                    <button
                      onClick={() => setIsAddingQuestion(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن سوال جدید</span>
                    </button>
                  </div>

                  {isAddingQuestion && (
                    <div className="border-2 border-emerald-300 rounded-lg p-4 bg-emerald-50/30 space-y-3">
                      <span className="font-bold text-emerald-900 text-xs block">طراحی سوال چندگزینه‌ای جدید :</span>
                      <textarea
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        placeholder="متن کامل صورت سوال را اینجا بنویسید..."
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-xs"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {newQOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="newQCorrect"
                              checked={newQCorrect === idx}
                              onChange={() => setNewQCorrect(idx)}
                              title="انتخاب به عنوان گزینه صحیح"
                            />
                            <span className="font-bold text-xs text-slate-600">گزینه {idx + 1}:</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const copy = [...newQOptions];
                                copy[idx] = e.target.value;
                                setNewQOptions(copy);
                              }}
                              placeholder={`متن گزینه ${idx + 1}`}
                              className="flex-1 px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 text-xs">ضریب / بارم نمره:</span>
                          <input
                            type="number"
                            value={newQWeight}
                            onChange={(e) => setNewQWeight(parseInt(e.target.value) || 20)}
                            className="w-16 px-2 py-1 border border-slate-300 rounded bg-white text-center font-bold text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (!newQText.trim()) return;
                              const newQ: Question = {
                                id: `qst_${Date.now()}`,
                                exam_id: selectedNode.id,
                                question_text: newQText,
                                question_type: 'multiple_choice',
                                options: newQOptions.map((o, i) => o || `گزینه ${i + 1}`),
                                correct_option_index: newQCorrect,
                                score_weight: newQWeight
                              };
                              setExamQuestions([...examQuestions, newQ]);
                              setIsAddingQuestion(false);
                              setNewQText('');
                              setNewQOptions(['', '', '', '']);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs"
                          >
                            ثبت در آزمون
                          </button>
                          <button
                            onClick={() => setIsAddingQuestion(false)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs"
                          >
                            انصراف
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                    {examQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="border border-slate-200 rounded-lg p-3 bg-white hover:border-slate-300 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-sky-100 text-[#0288d1] font-bold flex items-center justify-center text-[11px] shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 text-xs leading-relaxed">
                              {q.question_text}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {q.score_weight} نمره
                            </span>
                            <button
                              onClick={() => setExamQuestions(examQuestions.filter((item) => item.id !== q.id))}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="حذف سوال"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-7 text-xs">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`px-2.5 py-1 rounded border text-[11px] flex items-center gap-1.5 ${
                                optIdx === q.correct_option_index
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="font-mono text-[10px]">
                                {optIdx === 0 ? 'الف)' : optIdx === 1 ? 'ب)' : optIdx === 2 ? 'ج)' : 'د)'}
                              </span>
                              <span>{opt}</span>
                              {optIdx === q.correct_option_index && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-auto shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 order-1 lg:order-2 border border-slate-300 rounded-lg p-3 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
              <span className="font-bold text-slate-700 text-xs">محتوا</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveRightTab('preview')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    activeRightTab === 'preview'
                      ? 'bg-[#0288d1] text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  پیش نمایش
                </button>
                <button
                  onClick={() => setActiveRightTab('sequence')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    activeRightTab === 'sequence'
                      ? 'bg-[#0288d1] text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  تعریف توالی
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-2 min-h-[360px] max-h-[480px] overflow-y-auto">
              {contentTree.map((node) => renderTreeItem(node))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block mb-1.5 text-center">
              + افزودن به ساختار محتوایی
            </span>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => handleAddNode('package')}
                className="py-1.5 px-1 bg-white hover:bg-sky-50 border border-slate-300 rounded text-center text-[11px] font-semibold text-slate-700 hover:text-sky-700 transition-colors"
              >
                + بسته
              </button>
              <button
                onClick={() => handleAddNode('lesson')}
                className="py-1.5 px-1 bg-white hover:bg-sky-50 border border-slate-300 rounded text-center text-[11px] font-semibold text-slate-700 hover:text-sky-700 transition-colors"
              >
                + درس
              </button>
              <button
                onClick={() => handleAddNode('exam')}
                className="py-1.5 px-1 bg-white hover:bg-sky-50 border border-slate-300 rounded text-center text-[11px] font-semibold text-slate-700 hover:text-sky-700 transition-colors"
              >
                + آزمون
              </button>
              <button
                onClick={() => handleAddNode('folder')}
                className="py-1.5 px-1 bg-white hover:bg-sky-50 border border-slate-300 rounded text-center text-[11px] font-semibold text-slate-700 hover:text-sky-700 transition-colors"
              >
                + پوشه
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400 font-mono">
        مدیریت یکپارچه آموزش و یادگیری ایده ( ۷.۵۰.۰۰.۸۸ )
      </div>

      {/* مدال پیش‌نمایش چاپی برگه آزمون */}
      {printPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-400" />
                <span className="font-bold text-sm">پیش‌نمایش برگه رسمی آزمون جهت چاپ و بایگانی</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ برگه (Print)</span>
                </button>
                <button
                  onClick={() => setPrintPreviewOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
              <div
                className={`bg-white border-2 border-slate-300 p-8 shadow-sm text-slate-900 w-full max-w-3xl space-y-6 ${
                  printFontSize === 'large' ? 'text-sm' : 'text-xs'
                }`}
                style={{ minHeight: '800px' }}
              >
                {/* سربرگ رسمی برگه امتحانی */}
                <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                  <div className="text-[11px] text-slate-500 font-mono">بسمه تعالی</div>
                  <h1 className="font-extrabold text-base text-slate-900">{printHeaderOrg}</h1>
                  <h2 className="font-bold text-sm text-sky-800">برگه ارزشیابی و آزمون کتبی: {examTitle}</h2>
                </div>

                {/* مشخصات شرکت‌کننده و آزمون */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border border-slate-300 rounded text-[11px]">
                  <div><span className="font-bold text-slate-600">نام و نام خانوادگی:</span> ....................</div>
                  <div><span className="font-bold text-slate-600">شماره پرسنلی:</span> ....................</div>
                  <div><span className="font-bold text-slate-600">تاریخ آزمون:</span> {examStartDate}</div>
                  <div><span className="font-bold text-slate-600">مدت زمان:</span> {examDurationMinutes} دقیقه</div>
                  <div><span className="font-bold text-slate-600">نمره قبولی:</span> {examPassingGrade} از ۱۰۰</div>
                  <div><span className="font-bold text-slate-600">تعداد سوالات:</span> {examQuestions.length} سوال</div>
                  {printIncludeCandidateBarcode && (
                    <div className="col-span-2 flex items-center justify-end gap-2 font-mono text-[10px] text-slate-500">
                      <span>کد رهگیری: ||| | |||| | ||| 90814</span>
                    </div>
                  )}
                </div>

                {/* سوالات آزمون */}
                <div className={`space-y-4 ${printColumns === '2' ? 'columns-2 gap-6' : ''}`}>
                  {examQuestions.map((q, idx) => (
                    <div key={q.id} className="break-inside-avoid space-y-2 pb-3 border-b border-dashed border-slate-200">
                      <div className="font-bold text-slate-800 flex items-start gap-1.5">
                        <span className="shrink-0">{idx + 1}-</span>
                        <span className="leading-relaxed">{q.question_text}</span>
                        <span className="text-[10px] text-slate-500 font-normal mr-auto shrink-0">({q.score_weight} نمره)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pr-4 text-[11px] text-slate-700">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shrink-0"></span>
                            <span className="font-bold font-mono">
                              {oIdx === 0 ? 'الف)' : oIdx === 1 ? 'ب)' : oIdx === 2 ? 'ج)' : 'د)'}
                            </span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* کادرهای امضا */}
                {printIncludeSignatureBoxes && (
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-slate-300 text-center text-xs">
                    <div className="border border-slate-300 rounded p-3 h-24 flex flex-col justify-between">
                      <span className="font-bold text-slate-700">امضای شرکت‌کننده</span>
                      <span className="text-slate-400 text-[10px]">تاریخ و اثر انگشت</span>
                    </div>
                    <div className="border border-slate-300 rounded p-3 h-24 flex flex-col justify-between">
                      <span className="font-bold text-slate-700">امضای مراقب آزمون</span>
                      <span className="text-slate-400 text-[10px]">تایید سلامت برگزاری</span>
                    </div>
                    <div className="border border-slate-300 rounded p-3 h-24 flex flex-col justify-between bg-slate-50">
                      <span className="font-bold text-slate-700">نمره نهایی (کتبی / سیستمی)</span>
                      <span className="text-slate-700 font-bold text-sm">..... / ۱۰۰</span>
                    </div>
                  </div>
                )}

                {/* صفحه کلید پاسخنامه در صورت فعال بودن */}
                {printIncludeAnswerKey && (
                  <div className="mt-8 pt-6 border-t-2 border-slate-900 break-before-page space-y-2">
                    <div className="font-bold text-sm text-slate-800 text-center">کلید رسمی پاسخ‌نامه (ویژه مصحح آزمون)</div>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs pt-2">
                      {examQuestions.map((q, idx) => (
                        <div key={idx} className="border border-slate-300 p-1.5 rounded bg-slate-50">
                          <span className="font-bold">سوال {idx + 1}: </span>
                          <span className="font-bold text-emerald-700">
                            {q.correct_option_index === 0 ? 'الف' : q.correct_option_index === 1 ? 'ب' : q.correct_option_index === 2 ? 'ج' : 'د'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
