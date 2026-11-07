import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { ExcelService } from '../../services/excelService';
import { THEME_CONFIGS } from '../../utils/theme';
import { Exam, ExamType, Course, Question } from '../../types/models';
import {
  HelpCircle,
  Plus,
  FileSpreadsheet,
  Upload,
  Search,
  Clock,
  CheckCircle,
  PlayCircle,
  Award,
  X,
  Edit2,
  Trash2,
  ListChecks
} from 'lucide-react';

interface ExamListProps {
  onTakeExam: (examId: string) => void;
}

export const ExamList: React.FC<ExamListProps> = ({ onTakeExam }) => {
  const { settings, activeRole, activeUser, triggerRefresh, hasPermission } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [exams, setExams] = useState<Exam[]>(() => db.getExams());
  const [courses] = useState<Course[]>(() => db.getCourses());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [isQuestionImportOpen, setIsQuestionImportOpen] = useState(false);
  const [targetExamId, setTargetExamId] = useState<string>(exams[0]?.id || '');
  const [importCount, setImportCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newType, setNewType] = useState<ExamType>('post_test');
  const [newDuration, setNewDuration] = useState(30);
  const [newPassing, setNewPassing] = useState(70);

  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editType, setEditType] = useState<ExamType>('post_test');
  const [editDuration, setEditDuration] = useState(30);
  const [editPassing, setEditPassing] = useState(70);

  const startEditExam = (e: Exam) => {
    setEditingExam(e);
    setEditTitle(e.title);
    setEditCourseId(e.course_id);
    setEditType(e.exam_type);
    setEditDuration(e.duration_minutes);
    setEditPassing(e.passing_score);
  };

  const handleSaveEditExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam || !editTitle) return;

    db.updateExam(editingExam.id, {
      title: editTitle,
      course_id: editCourseId,
      exam_type: editType,
      duration_minutes: Number(editDuration),
      passing_score: Number(editPassing)
    });

    setEditingExam(null);
    reloadExams();
  };

  const handleDeleteExam = (id: string, title: string) => {
    if (confirm(`آیا از حذف آزمون «${title}» اطمینان دارید؟`)) {
      db.deleteExam(id);
      reloadExams();
    }
  };

  const reloadExams = () => {
    setExams(db.getExams());
    triggerRefresh();
  };

  const [managingExam, setManagingExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qText, setQText] = useState('');
  const [qOpt0, setQOpt0] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qCorrectIdx, setQCorrectIdx] = useState<number>(0);
  const [qScoreWeight, setQScoreWeight] = useState<number>(20);
  const [qExplanation, setQExplanation] = useState('');

  const openManageQuestions = (exam: Exam) => {
    setManagingExam(exam);
    setExamQuestions(db.getQuestionsByExam(exam.id));
    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
  };

  const openAddQuestionForm = () => {
    setEditingQuestion(null);
    setQText('');
    setQOpt0('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQCorrectIdx(0);
    setQScoreWeight(20);
    setQExplanation('');
    setIsQuestionFormOpen(true);
  };

  const startEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQText(q.question_text);
    setQOpt0(q.options[0] || '');
    setQOpt1(q.options[1] || '');
    setQOpt2(q.options[2] || '');
    setQOpt3(q.options[3] || '');
    setQCorrectIdx(q.correct_option_index);
    setQScoreWeight(q.score_weight || 20);
    setQExplanation(q.explanation || '');
    setIsQuestionFormOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingExam || !qText || !qOpt0 || !qOpt1) return;

    const options = [qOpt0, qOpt1, qOpt2 || 'گزینه ج', qOpt3 || 'گزینه د'];

    if (editingQuestion) {
      db.updateQuestion(editingQuestion.id, {
        question_text: qText,
        options,
        correct_option_index: Number(qCorrectIdx),
        score_weight: Number(qScoreWeight),
        explanation: qExplanation
      });
    } else {
      const newQ: Question = {
        id: `q_${Date.now()}`,
        exam_id: managingExam.id,
        question_text: qText,
        question_type: 'multiple_choice',
        options,
        correct_option_index: Number(qCorrectIdx),
        score_weight: Number(qScoreWeight),
        explanation: qExplanation
      };
      db.addQuestion(newQ);
    }

    const updated = db.getQuestionsByExam(managingExam.id);
    setExamQuestions(updated);
    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
    reloadExams();
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!managingExam) return;
    if (confirm('آیا از حذف این سوال اطمینان دارید؟')) {
      db.deleteQuestion(qId);
      setExamQuestions(db.getQuestionsByExam(managingExam.id));
      reloadExams();
    }
  };

  const handleImportQuestions = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetExamId) return;
    try {
      const parsed = await ExcelService.parseQuestionsFile(file, targetExamId);
      db.addQuestionsBatch(parsed);
      setImportCount(parsed.length);
      reloadExams();
    } catch (err) {
      alert('خطا در پردازش فایل اکسل سوالات');
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const exam: Exam = {
      id: `exm_${Date.now()}`,
      course_id: newCourseId,
      title: newTitle,
      exam_type: newType,
      duration_minutes: Number(newDuration),
      passing_score: Number(newPassing),
      total_questions: 5,
      status: 'published',
      is_offline_exam: true,
      created_at: new Date().toISOString()
    };

    db.addExam(exam);
    setIsNewExamModalOpen(false);
    setNewTitle('');
    reloadExams();
  };

  const handleExportResults = (exam: Exam) => {
    const attempts = db.getExamAttempts(exam.id);
    if (attempts.length === 0) {
      alert('هنوز هیچ آزمون‌دهنده‌ای در این آزمون شرکت نکرده است.');
      return;
    }
    ExcelService.exportExamResults(attempts, exam.title);
  };

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.includes(searchQuery);
    const matchesType = typeFilter === 'all' || e.exam_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const examTypeLabel = (t: ExamType) => {
    switch (t) {
      case 'pre_test': return 'پیش‌آزمون اولیه';
      case 'post_test': return 'پس‌آزمون سنجش یادگیری';
      case 'final_exam': return 'آزمون جامع پایان‌دوره';
      case 'quiz': return 'کوئیز میان‌دوره';
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">آزمون‌ها و سنجش یادگیری فراگیران</h1>
          <p className="text-xs text-slate-500 mt-1">
            ارزیابی میزان یادگیری، بانک سوالات با پشتیبانی کامل از ایمپورت و اکسپورت اکسل
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasPermission('exams', 'create') && (
            <>
              <button
                onClick={() => setIsQuestionImportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>ایمپورت سوالات از اکسل</span>
              </button>

              <button
                onClick={() => setIsNewExamModalOpen(true)}
                className={`flex items-center gap-1.5 px-4 py-2 ${theme.primary} ${theme.primaryHover} text-white rounded-lg text-xs font-semibold shadow-sm transition-colors`}
              >
                <Plus className="w-4 h-4" />
                <span>طراحی آزمون جدید</span>
              </button>
            </>
          )}
        </div>
      </div>

      {}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-80 border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-emerald-500">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو در آزمون‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'همه آزمون‌ها' },
            { id: 'pre_test', label: 'پیش‌آزمون' },
            { id: 'post_test', label: 'پس‌آزمون (کرک‌پاتریک)' },
            { id: 'final_exam', label: 'آزمون پایان‌دوره' },
            { id: 'quiz', label: 'کوئیز' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExams.map(exam => {
          const course = courses.find(c => c.id === exam.course_id);
          const questions = db.getQuestionsByExam(exam.id);
          const attempts = db.getExamAttempts(exam.id);
          const userAttempt = attempts.find(a => a.user_id === activeUser.id);

          return (
            <div
              key={exam.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold">{examTypeLabel(exam.exam_type)}</span>
                  <span className="font-mono text-slate-500 tabular-nums">{exam.duration_minutes} دقیقه</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-500 truncate">
                  دوره: {course?.title || 'دوره مستقل'}
                </p>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>بانک سوالات:</span>
                    <strong className="font-mono text-slate-800">{questions.length} سوال تستی</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>حدنصاب قبولی:</span>
                    <strong className="font-mono text-slate-800">{exam.passing_score}٪</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>تعداد آزمون‌دهندگان:</span>
                    <strong className="font-mono text-slate-800">{attempts.length} نفر</strong>
                  </div>
                </div>

                {userAttempt && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span>نمره شما:</span>
                    <strong className="font-mono font-bold text-slate-900">{userAttempt.score} از {userAttempt.total_score}</strong>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {hasPermission('exams', 'edit') && (
                    <>
                      <button
                        onClick={() => openManageQuestions(exam)}
                        className="text-slate-500 hover:text-indigo-600 p-1.5 rounded hover:bg-slate-100 transition-colors"
                        title="مدیریت و ویرایش سوالات آزمون"
                      >
                        <ListChecks className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startEditExam(exam)}
                        className="text-slate-500 hover:text-emerald-700 p-1.5 rounded hover:bg-slate-100 transition-colors"
                        title="ویرایش مشخصات آزمون"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {hasPermission('exams', 'delete') && (
                    <button
                      onClick={() => handleDeleteExam(exam.id, exam.title)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-slate-100 transition-colors"
                      title="حذف آزمون"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleExportResults(exam)}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium mr-1"
                    title="خروجی نتایج و کارنامه‌ها به اکسل"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>اکسل</span>
                  </button>
                </div>

                <button
                  onClick={() => onTakeExam(exam.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>{userAttempt ? 'آزمون مجدد' : 'شرکت در آزمون'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {}
      {isQuestionImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">ایمپورت سوالات از فایل اکسل</h3>
              <button onClick={() => { setIsQuestionImportOpen(false); setImportCount(null); }}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">آزمون مقصد را انتخاب کنید *</label>
                <select
                  value={targetExamId}
                  onChange={(e) => setTargetExamId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-700 font-medium">فایل اکسل بانک سوالات را بارگذاری کنید</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleImportQuestions}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  انتخاب فایل اکسل
                </button>
              </div>

              {importCount !== null && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{importCount} سوال با موفقیت به بانک سوالات آزمون اضافه گردید.</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => { setIsQuestionImportOpen(false); setImportCount(null); }}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-xs"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {isNewExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">طراحی و ایجاد آزمون جدید</h3>
              <button onClick={() => setIsNewExamModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">عنوان آزمون *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="مثال: پس‌آزمون ارزیابی شایستگی‌های ممیزی داخلی"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">دوره مربوطه</label>
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">نوع آزمون</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="pre_test">پیش‌آزمون اولیه</option>
                    <option value="post_test">پس‌آزمون (سطح ۲ کرک‌پاتریک)</option>
                    <option value="final_exam">آزمون جامع نهایی</option>
                    <option value="quiz">کوئیز مرحله‌ای</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">مدت زمان (دقیقه)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">حدنصاب قبولی (درصد)</label>
                  <input
                    type="number"
                    value={newPassing}
                    onChange={(e) => setNewPassing(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewExamModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  ثبت آزمون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">ویرایش آزمون: {editingExam.title}</h3>
              </div>
              <button onClick={() => setEditingExam(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEditExam} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">عنوان آزمون *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">دوره آموزشی</label>
                  <select
                    value={editCourseId}
                    onChange={(e) => setEditCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">نوع آزمون</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="pre_test">پیش‌آزمون اولیه</option>
                    <option value="post_test">پس‌آزمون (سطح ۲ کرک‌پاتریک)</option>
                    <option value="final_exam">آزمون جامع نهایی</option>
                    <option value="quiz">کوئیز مرحله‌ای</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">مدت زمان (دقیقه)</label>
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">حدنصاب قبولی (درصد)</label>
                  <input
                    type="number"
                    value={editPassing}
                    onChange={(e) => setEditPassing(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  ذخیره ویرایش آزمون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {managingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    بانک سوالات آزمون: {managingExam.title}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    مجموع {examQuestions.length} سوال تستی ثبت‌شده در دیتابیس
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setManagingExam(null); setIsQuestionFormOpen(false); setEditingQuestion(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {}
            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {}
              <div className="flex items-center justify-between bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
                <span className="text-indigo-900 font-medium">
                  {isQuestionFormOpen
                    ? (editingQuestion ? 'درحال ویرایش سوال انتخابی:' : 'تعریف سوال جدید:')
                    : 'فهرست سوالات و گزینه‌ها جهت ویرایش یا افزودن:'}
                </span>
                {!isQuestionFormOpen && (
                  <button
                    onClick={openAddQuestionForm}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن سوال جدید</span>
                  </button>
                )}
              </div>

              {}
              {isQuestionFormOpen && (
                <form onSubmit={handleSaveQuestion} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">متن صورت سوال *</label>
                    <textarea
                      rows={2}
                      required
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      placeholder="متن کامل سوال چهارگزینه‌ای را وارد نمایید..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">گزینه ۱ (الف) *</label>
                      <input
                        type="text"
                        required
                        value={qOpt0}
                        onChange={(e) => setQOpt0(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">گزینه ۲ (ب) *</label>
                      <input
                        type="text"
                        required
                        value={qOpt1}
                        onChange={(e) => setQOpt1(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">گزینه ۳ (ج)</label>
                      <input
                        type="text"
                        value={qOpt2}
                        onChange={(e) => setQOpt2(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">گزینه ۴ (د)</label>
                      <input
                        type="text"
                        value={qOpt3}
                        onChange={(e) => setQOpt3(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">گزینه صحیح آزمون</label>
                      <select
                        value={qCorrectIdx}
                        onChange={(e) => setQCorrectIdx(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold text-emerald-800"
                      >
                        <option value={0}>گزینه ۱ (الف)</option>
                        <option value={1}>گزینه ۲ (ب)</option>
                        <option value={2}>گزینه ۳ (ج)</option>
                        <option value={3}>گزینه ۴ (د)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">بارم / وزن نمره</label>
                      <input
                        type="number"
                        value={qScoreWeight}
                        onChange={(e) => setQScoreWeight(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">تحلیل و توضیحات پاسخ صحیح (اختیاری)</label>
                    <input
                      type="text"
                      value={qExplanation}
                      onChange={(e) => setQExplanation(e.target.value)}
                      placeholder="توضیحات تکمیلی یا رفرنس استاندارد..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setIsQuestionFormOpen(false); setEditingQuestion(null); }}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
                    >
                      {editingQuestion ? 'ذخیره ویرایش سوال' : 'ثبت سوال جدید'}
                    </button>
                  </div>
                </form>
              )}

              {}
              <div className="space-y-3">
                {examQuestions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    هنوز سوالی برای این آزمون ثبت نشده است. از دکمه بالا برای افزودن سوال استفاده کنید.
                  </div>
                ) : (
                  examQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-bold font-mono flex items-center justify-center shrink-0 text-xs">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-900 leading-snug">
                            {q.question_text}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEditQuestion(q)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                            title="ویرایش سوال"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                            title="حذف سوال"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correct_option_index === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                                isCorrect
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && (
                                <span className="text-[10px] text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                                  پاسخ صحیح
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="text-[11px] text-slate-500 pt-1">
                          <strong className="text-slate-700">توضیح: </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => { setManagingExam(null); setIsQuestionFormOpen(false); setEditingQuestion(null); }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors"
              >
                بستن پنجره مدیریت سوالات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
