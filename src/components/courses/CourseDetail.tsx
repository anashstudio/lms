import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import { Course, Lesson, CourseResource, ResourceCategory } from '../../types/models';
import {
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Clock,
  User,
  Eye,
  Plus,
  CheckCircle,
  HelpCircle,
  FolderArchive,
  BarChart3,
  Award,
  Play,
  Volume2,
  FileSpreadsheet,
  X,
  File,
  Edit2,
  Trash2
} from 'lucide-react';

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
  onTakeExam: (examId: string) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack, onTakeExam }) => {
  const { settings, activeRole, activeUser, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const course = db.getCourseById(courseId);
  const [activeTab, setActiveTab] = useState<'lessons' | 'resources' | 'exams' | 'kirkpatrick'>('lessons');
  const [lessons, setLessons] = useState<Lesson[]>(() => db.getLessonsByCourse(courseId));
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(() => lessons[0] || null);
  const [resources, setResources] = useState<CourseResource[]>(() => db.getResourcesByCourse(courseId));
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>('all');

  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(45);
  const [newLessonVideo, setNewLessonVideo] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [newLessonNotes, setNewLessonNotes] = useState('');

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonDesc, setEditLessonDesc] = useState('');
  const [editLessonDuration, setEditLessonDuration] = useState(45);
  const [editLessonVideo, setEditLessonVideo] = useState('');
  const [editLessonNotes, setEditLessonNotes] = useState('');

  const startEditLesson = (lesson: Lesson, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLesson(lesson);
    setEditLessonTitle(lesson.title);
    setEditLessonDesc(lesson.description);
    setEditLessonDuration(lesson.duration_minutes);
    setEditLessonVideo(lesson.video_url || '');
    setEditLessonNotes(lesson.session_notes || '');
  };

  const handleSaveEditLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !editLessonTitle) return;

    db.updateLesson(editingLesson.id, {
      title: editLessonTitle,
      description: editLessonDesc,
      duration_minutes: Number(editLessonDuration),
      video_url: editLessonVideo,
      session_notes: editLessonNotes
    });

    const updated = db.getLessonsByCourse(courseId);
    setLessons(updated);
    if (selectedLesson?.id === editingLesson.id) {
      setSelectedLesson(updated.find(l => l.id === editingLesson.id) || null);
    }
    setEditingLesson(null);
    triggerRefresh();
  };

  const handleDeleteLesson = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('آیا از حذف این جلسه آفلاین اطمینان دارید؟')) {
      db.deleteLesson(id);
      const updated = db.getLessonsByCourse(courseId);
      setLessons(updated);
      if (selectedLesson?.id === id) {
        setSelectedLesson(updated[0] || null);
      }
      triggerRefresh();
    }
  };

  const [isNewResourceModalOpen, setIsNewResourceModalOpen] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResCategory, setNewResCategory] = useState<ResourceCategory>('books_handouts');
  const [newResType, setNewResType] = useState('pdf');
  const [newResSize, setNewResSize] = useState(3.5);
  const [newResDesc, setNewResDesc] = useState('');

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">دوره مورد نظر یافت نشد.</p>
        <button onClick={onBack} className="text-xs text-emerald-700 underline font-semibold">
          بازگشت به فهرست دوره‌ها
        </button>
      </div>
    );
  }

  const exams = db.getExams(courseId);
  const enrollment = db.getEnrollments(activeUser.id, courseId)[0];

  const handleMarkLessonComplete = () => {
    if (!enrollment) {
      db.addEnrollment({
        id: `enr_${Date.now()}`,
        course_id: courseId,
        user_id: activeUser.id,
        enrolled_at: new Date().toISOString(),
        progress_percent: 25,
        attendance_percent: 100,
        status: 'in_progress'
      });
    } else {
      const newProgress = Math.min(100, enrollment.progress_percent + 25);
      db.updateEnrollmentProgress(courseId, activeUser.id, newProgress);
    }
    triggerRefresh();
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle) return;

    const lesson: Lesson = {
      id: `lsn_${Date.now()}`,
      course_id: courseId,
      title: newLessonTitle,
      session_number: lessons.length + 1,
      description: newLessonDesc,
      video_url: newLessonVideo,
      duration_minutes: Number(newLessonDuration),
      session_notes: newLessonNotes,
      order_index: lessons.length + 1
    };

    db.addLesson(lesson);
    const updated = db.getLessonsByCourse(courseId);
    setLessons(updated);
    if (!selectedLesson) setSelectedLesson(lesson);
    setIsNewLessonModalOpen(false);
    setNewLessonTitle('');
    setNewLessonDesc('');
    triggerRefresh();
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle) return;

    const res: CourseResource = {
      id: `res_${Date.now()}`,
      course_id: courseId,
      title: newResTitle,
      category: newResCategory,
      file_type: newResType,
      file_size_mb: Number(newResSize),
      download_url: '#',
      description: newResDesc,
      uploaded_by: activeUser.full_name,
      created_at: new Date().toISOString()
    };

    db.addResource(res);
    setResources(db.getResourcesByCourse(courseId));
    setIsNewResourceModalOpen(false);
    setNewResTitle('');
    setNewResDesc('');
    triggerRefresh();
  };

  const filteredResources = resources.filter(r => {
    if (resourceCategoryFilter === 'all') return true;
    return r.category === resourceCategoryFilter;
  });

  const categoryName = (cat: ResourceCategory) => {
    switch (cat) {
      case 'books_handouts': return 'کتب و جزوات آموزشی';
      case 'videos': return 'ویدئوهای تکمیلی';
      case 'audio_podcasts': return 'فایل‌های صوتی و پادکست';
      case 'templates_docs': return 'تمپلیت‌ها و فرم‌های کاربردی';
      case 'sample_questions': return 'نمونه سوالات و آزمون‌ها';
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-3 font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فهرست دوره‌ها</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-mono text-slate-700 font-semibold">{course.code}</span>
              <span aria-hidden="true">·</span>
              <span>{course.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">منطبق با ISO 10015:2019</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
              {course.title}
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              {course.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                مدرس: <strong className="text-slate-800">{course.instructor_name}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                مدت دوره: <strong className="font-mono text-slate-800">{course.duration_hours} ساعت</strong>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2">
            {enrollment ? (
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">
                  میزان پیشرفت شما: <strong className="font-mono text-emerald-700 font-bold">{enrollment.progress_percent}٪</strong>
                </div>
                <div className="w-48 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${enrollment.progress_percent}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleMarkLessonComplete}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                ثبت‌نام در این کلاس
              </button>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'lessons'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4 text-slate-500" />
          <span>کلاس‌های آفلاین و سرفصل‌ها ({lessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'resources'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderArchive className="w-4 h-4 text-slate-500" />
          <span>منابع و اسناد موضوعی ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'exams'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>آزمون‌ها و کوئیزها ({exams.length})</span>
        </button>
      </div>

      {}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 space-y-4">
            {selectedLesson ? (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {}
                <div className="aspect-video bg-slate-950 relative flex items-center justify-center">
                  {selectedLesson.video_url ? (
                    <video
                      controls
                      src={selectedLesson.video_url}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400 p-6">
                      <Play className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs">فایل ویدئویی این جلسه به صورت صوتی یا اسلاید ارائه شده است.</p>
                    </div>
                  )}
                </div>

                {}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-700 font-semibold">
                      جلسه شماره {selectedLesson.session_number}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      مدت جلسه: {selectedLesson.duration_minutes} دقیقه
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900">
                    {selectedLesson.title}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedLesson.description}
                  </p>

                  {selectedLesson.session_notes && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                      <span className="font-bold block text-slate-900 mb-1">یادداشت‌های مدرس جلسه:</span>
                      <p>{selectedLesson.session_notes}</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <button
                      onClick={handleMarkLessonComplete}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>تکمیل جلسه و ثبت حضور</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
                جلسه‌ای انتخاب نشده است.
              </div>
            )}
          </div>

          {}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">فهرست جلسات آفلاین</h3>
              {(activeRole === 'super_admin' || activeRole === 'class_manager' || activeRole === 'instructor') && (
                <button
                  onClick={() => setIsNewLessonModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن جلسه</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {lessons.map(lesson => {
                const isSelected = selectedLesson?.id === lesson.id;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {lesson.session_number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {lesson.title}
                          </h4>
                          {(activeRole === 'super_admin' || activeRole === 'class_manager' || activeRole === 'instructor') && (
                            <div className="flex items-center gap-1 shrink-0 mr-1">
                              <button
                                onClick={(e) => startEditLesson(lesson, e)}
                                className="text-slate-400 hover:text-emerald-700 p-0.5 rounded transition-colors"
                                title="ویرایش جلسه"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteLesson(lesson.id, e)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                                title="حذف جلسه"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration_minutes} دقیقه</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
            {}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
              {[
                { id: 'all', label: 'همه منابع' },
                { id: 'books_handouts', label: 'کتب و جزوات' },
                { id: 'videos', label: 'ویدئوها' },
                { id: 'audio_podcasts', label: 'پادکست‌ها' },
                { id: 'templates_docs', label: 'تمپلیت‌ها' },
                { id: 'sample_questions', label: 'نمونه سوالات' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setResourceCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    resourceCategoryFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {(activeRole === 'super_admin' || activeRole === 'class_manager' || activeRole === 'instructor') && (
              <button
                onClick={() => setIsNewResourceModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${theme.primary} ${theme.primaryHover} text-white rounded-lg font-semibold transition-colors shrink-0 shadow-sm`}
              >
                <Plus className="w-4 h-4" />
                <span>افزودن منبع جدید</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                منبعی در این دسته‌بندی موضوعی بارگذاری نشده است.
              </div>
            ) : (
              filteredResources.map(res => (
                <div
                  key={res.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {res.file_type}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-emerald-700 font-medium block mb-0.5">
                        {categoryName(res.category)}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {res.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {res.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono tabular-nums">
                        <span>حجم: {res.file_size_mb} MB</span>
                        <span aria-hidden="true">·</span>
                        <span>توسط {res.uploaded_by}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 bg-slate-50 shrink-0 text-xs flex items-center gap-1 font-medium"
                    title="مشاهده آنلاین پیوست"
                  >
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span>مشاهده</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exams.map(exam => {
              const questions = db.getQuestionsByExam(exam.id);
              const attempts = db.getExamAttempts(exam.id, activeUser.id);
              const lastAttempt = attempts[0];

              const typeLabel = 
                exam.exam_type === 'pre_test' ? 'پیش‌آزمون (Pre-Test)' :
                exam.exam_type === 'post_test' ? 'پس‌آزمون سنجش یادگیری (Post-Test)' : 'آزمون پایانی';

              return (
                <div
                  key={exam.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-emerald-700 block">
                      {typeLabel}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {exam.title}
                    </h3>
                    <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                      <div>مدت آزمون: <strong className="font-mono text-slate-800">{exam.duration_minutes} دقیقه</strong></div>
                      <div>تعداد سوالات: <strong className="font-mono text-slate-800">{questions.length || exam.total_questions} سوال</strong></div>
                      <div>حدنصاب قبولی: <strong className="font-mono text-slate-800">{exam.passing_score}٪</strong></div>
                    </div>

                    {lastAttempt && (
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 mt-2">
                        آخرین نمره: <strong className="font-mono font-bold">{lastAttempt.score}</strong> از {lastAttempt.total_score} ({lastAttempt.passed ? 'قبول' : 'نیاز به تلاش مجدد'})
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-2">
                    <button
                      onClick={() => onTakeExam(exam.id)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      {lastAttempt ? 'شرکت مجدد در آزمون' : 'شروع آزمون'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      {isNewLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">افزودن جلسه کلاس آفلاین</h3>
              <button onClick={() => setIsNewLessonModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddLesson} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">عنوان جلسه *</label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="مثال: جلسه ۳: اصول ارزیابی ریسک"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">شرح جلسه</label>
                <textarea
                  rows={2}
                  value={newLessonDesc}
                  onChange={(e) => setNewLessonDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">مدت زمان (دقیقه)</label>
                  <input
                    type="number"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">لینک یا مسیر ویدئوی آفلاین</label>
                  <input
                    type="text"
                    value={newLessonVideo}
                    onChange={(e) => setNewLessonVideo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">یادداشت‌های مدرس</label>
                <textarea
                  rows={2}
                  value={newLessonNotes}
                  onChange={(e) => setNewLessonNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewLessonModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  ذخیره جلسه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isNewResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">افزودن منبع موضوعی به دوره</h3>
              <button onClick={() => setIsNewResourceModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddResource} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">عنوان منبع آموزشی *</label>
                <input
                  type="text"
                  required
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="مثال: جزوه راهنمای ممیزی داخلی"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">دسته‌بندی موضوعی</label>
                  <select
                    value={newResCategory}
                    onChange={(e) => setNewResCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="books_handouts">کتب و جزوات آموزشی</option>
                    <option value="videos">ویدئوهای تکمیلی</option>
                    <option value="audio_podcasts">فایل‌های صوتی و پادکست</option>
                    <option value="templates_docs">تمپلیت‌ها و فرم‌های کاربردی</option>
                    <option value="sample_questions">نمونه سوالات و آزمون‌ها</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">پسوند فایل</label>
                  <select
                    value={newResType}
                    onChange={(e) => setNewResType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase"
                  >
                    <option value="pdf">PDF</option>
                    <option value="xlsx">XLSX (اکسل)</option>
                    <option value="docx">DOCX (ورد)</option>
                    <option value="mp4">MP4 (ویدئو)</option>
                    <option value="mp3">MP3 (صوت)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">توضیحات و محتوای منبع</label>
                <textarea
                  rows={2}
                  value={newResDesc}
                  onChange={(e) => setNewResDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewResourceModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  ثبت منبع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">ویرایش جلسه: {editingLesson.title}</h3>
              </div>
              <button onClick={() => setEditingLesson(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveEditLesson} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">عنوان جلسه *</label>
                <input
                  type="text"
                  required
                  value={editLessonTitle}
                  onChange={(e) => setEditLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">شرح جلسه</label>
                <textarea
                  rows={2}
                  value={editLessonDesc}
                  onChange={(e) => setEditLessonDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">مدت زمان (دقیقه)</label>
                  <input
                    type="number"
                    value={editLessonDuration}
                    onChange={(e) => setEditLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">لینک ویدئو</label>
                  <input
                    type="text"
                    value={editLessonVideo}
                    onChange={(e) => setEditLessonVideo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">یادداشت‌های مدرس</label>
                <textarea
                  rows={2}
                  value={editLessonNotes}
                  onChange={(e) => setEditLessonNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  ذخیره ویرایش جلسه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
