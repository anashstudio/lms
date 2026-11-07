import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import { CourseResource, ResourceCategory, Course } from '../../types/models';
import {
  FolderArchive,
  BookOpen,
  Video,
  Volume2,
  FileSpreadsheet,
  FileText,
  Eye,
  Plus,
  Search,
  CheckCircle,
  X,
  Film,
  Presentation
} from 'lucide-react';
import { ResourceViewerModal } from './ResourceViewerModal';
import { ResourceFileUploadZone, UploadedFileInfo } from './ResourceFileUploadZone';

export const ResourceLibrary: React.FC = () => {
  const { settings, activeUser, triggerRefresh, hasPermission } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [resources, setResources] = useState<CourseResource[]>(() => db.getResourcesByCourse());
  const [courses] = useState<Course[]>(() => db.getCourses());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newCategory, setNewCategory] = useState<ResourceCategory>('books_handouts');
  const [newType, setNewType] = useState('pdf');
  const [newSize, setNewSize] = useState(2.5);
  const [newDesc, setNewDesc] = useState('');

  const [viewingResource, setViewingResource] = useState<CourseResource | null>(null);

  const canCreate = hasPermission('resources', 'create');

  const reload = () => {
    setResources(db.getResourcesByCourse());
    triggerRefresh();
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const res: CourseResource = {
      id: `res_${Date.now()}`,
      course_id: newCourseId,
      title: newTitle,
      category: newCategory,
      file_type: newType,
      file_size_mb: Number(newSize),
      download_url: '#',
      description: newDesc,
      uploaded_by: activeUser.full_name,
      created_at: new Date().toISOString()
    };

    db.addResource(res);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    reload();
  };

  const filtered = resources.filter(r => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesCourse = selectedCourse === 'all' || r.course_id === selectedCourse;
    const matchesSearch = r.title.includes(searchQuery) || r.description.includes(searchQuery);
    return matchesCat && matchesCourse && matchesSearch;
  });

  const categoryName = (cat: ResourceCategory) => {
    switch (cat) {
      case 'books_handouts': return 'کتب و جزوات آموزشی';
      case 'videos': return 'ویدئوهای تکمیلی';
      case 'powerpoints_slides': return 'پاورپوینت و اسلایدها';
      case 'audio_podcasts': return 'فایل‌های صوتی و پادکست';
      case 'templates_docs': return 'تمپلیت‌ها و فرم‌های کاربردی';
      case 'sample_questions': return 'نمونه سوالات و آزمون‌ها';
      case 'elearning_packages': return 'بسته‌های الکترونیکی و مالتی‌مدیا';
      default: return 'سایر منابع';
    }
  };

  const getCategoryIcon = (cat: ResourceCategory) => {
    switch (cat) {
      case 'books_handouts': return BookOpen;
      case 'videos': return Video;
      case 'powerpoints_slides': return Presentation;
      case 'audio_podcasts': return Volume2;
      case 'templates_docs': return FileSpreadsheet;
      case 'sample_questions': return FileText;
      case 'elearning_packages': return Film;
      default: return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-indigo-600" />
            <span>کتابخانه و مخزن جامع منابع چندرسانه‌ای دوره‌ها</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            دسترسی آنلاین و مطالعه متمرکز کلیه کتاب‌ها، جزوات، اسلایدها و مالتی‌مدیای آموزشی
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>بارگذاری منبع جدید</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در عنوان یا توضیحات منبع..."
            className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-white"
        >
          <option value="all">همه دسته‌بندی‌های موضوعی</option>
          <option value="books_handouts">کتب و جزوات آموزشی</option>
          <option value="videos">ویدئوهای آموزشی</option>
          <option value="powerpoints_slides">پاورپوینت و اسلایدهای ارائه (PPTX)</option>
          <option value="audio_podcasts">فایل‌های صوتی و پادکست</option>
          <option value="templates_docs">فرم‌ها و کاربرگ‌ها</option>
          <option value="sample_questions">نمونه سوالات</option>
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-white"
        >
          <option value="all">همه دوره‌های آموزشی</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            هیچ منبعی با مشخصات جستجو شده یافت نگردید.
          </div>
        ) : (
          filtered.map(res => {
            const Icon = getCategoryIcon(res.category);
            const course = courses.find(c => c.id === res.course_id);

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                      {res.file_type}
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                    {res.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {categoryName(res.category)}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    <span>{res.file_size_mb} MB</span>
                    <span className="mx-1.5">·</span>
                    <span className="truncate max-w-[120px] inline-block align-bottom">{course?.code || 'عمومی'}</span>
                  </div>

                  <button
                    onClick={() => setViewingResource(res)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold transition-colors text-[11px]"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>مطالعه آنلاین</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ResourceViewerModal
        resource={viewingResource}
        isOpen={!!viewingResource}
        onClose={() => setViewingResource(null)}
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">بارگذاری منبع آموزشی با دسته‌بندی موضوعی</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">دوره آموزشی مربوطه</label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">عنوان منبع *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="مثال: جزوه راهنمای ممیزی سیستم کیفیت"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">نوع فایل</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="pdf">PDF (کتاب و جزوه)</option>
                    <option value="mp4">MP4 (ویدئو)</option>
                    <option value="mp3">MP3 (پادکست)</option>
                    <option value="xlsx">XLSX (کاربرگ)</option>
                    <option value="docx">DOCX (فرم ورد)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">حجم تقریبی (مگابایت)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSize}
                    onChange={(e) => setNewSize(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">دسته‌بندی موضوعی</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ResourceCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="books_handouts">کتب و جزوات آموزشی</option>
                  <option value="videos">ویدئوهای تکمیلی</option>
                  <option value="audio_podcasts">فایل‌های صوتی و پادکست</option>
                  <option value="templates_docs">تمپلیت‌ها و فرم‌های کاربردی</option>
                  <option value="sample_questions">نمونه سوالات و آزمون‌ها</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">توضیحات و اهداف آموزشی</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="شرح کوتاه درباره سرفصل‌های پوشش داده شده در این منبع..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                >
                  ثبت منبع در مخزن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
