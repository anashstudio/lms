import React, { useState } from 'react';
import { CourseResource, ResourceCategory } from '../../types/models';
import { db } from '../../db/database';
import {
  RotateCcw,
  Check,
  X,
  Plus,
  Video,
  FileText,
  Image,
  ExternalLink,
  Search,
  BookOpen,
  Presentation,
  Volume2,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import { ResourceFileUploadZone, UploadedFileInfo } from './ResourceFileUploadZone';

interface ResourceModifyViewProps {
  initialResource?: CourseResource | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ResourceModifyView: React.FC<ResourceModifyViewProps> = ({
  initialResource,
  onSave,
  onCancel
}) => {
  const allResources = db.getResourcesByCourse();

  const [resId, setResId] = useState(initialResource?.id ? initialResource.id.replace('res_', '') : '1306');
  const [author, setAuthor] = useState(initialResource?.author || '');
  const [title, setTitle] = useState(initialResource?.title || 'تحول و تعالی سازمانی جلسه 21');
  const [group, setGroup] = useState('مدیران');
  const [nature, setNature] = useState(
    initialResource?.category === 'videos' ? 'ویدیوی ضبط شده دوره های آموزشی' :
    initialResource?.category === 'powerpoints_slides' ? 'اسلایدها و فایل ارائه پاورپوینت (PPTX)' :
    initialResource?.category === 'audio_podcasts' ? 'صوتی و پادکست' :
    initialResource?.category === 'books_handouts' ? 'کتاب و جزوه متنی PDF' :
    'ویدیوی ضبط شده دوره های آموزشی'
  );
  const [studyDuration, setStudyDuration] = useState(initialResource?.study_duration_min ? String(initialResource.study_duration_min) : '70');
  const [linkUrl, setLinkUrl] = useState(initialResource?.external_link || '');
  const [description, setDescription] = useState(initialResource?.description || '');

  const [branchMode, setBranchMode] = useState<'public' | 'branch'>(initialResource?.branch_mode || 'public');
  const [branch, setBranch] = useState(initialResource?.branch || 'پالایشگاه اصفهان');
  const [keywords, setKeywords] = useState(initialResource?.tags ? initialResource.tags.join(', ') : '');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [allowDownloadOnline, setAllowDownloadOnline] = useState(initialResource?.allow_download ?? false);
  const [watermark, setWatermark] = useState(initialResource?.watermark_type || '-----------');
  const [allowScrubbing, setAllowScrubbing] = useState(initialResource?.allow_scrubbing ?? true);

  // فایل بارگذاری شده
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(() => {
    if (initialResource?.download_url && initialResource.download_url !== '#') {
      return {
        name: initialResource.file_name || initialResource.title,
        sizeMb: initialResource.file_size_mb || 25,
        type: initialResource.file_type || 'video',
        category: initialResource.category || 'videos',
        dataUrl: initialResource.download_url,
        durationSec: 120,
        slideCount: 15
      };
    }
    return null;
  });

  const [isRelatedModalOpen, setIsRelatedModalOpen] = useState(false);
  const [relatedSearch, setRelatedSearch] = useState('');
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<string[]>([]);

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionCode, setRevisionCode] = useState('REV-01');
  const [revisionNotes, setRevisionNotes] = useState('بازنگری سالانه بر اساس سرفصل‌های جدید');

  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [coverUrl, setCoverUrl] = useState(initialResource?.cover_image_url || '');

  const handleFileChange = (fileInfo: UploadedFileInfo | null) => {
    setUploadedFile(fileInfo);
    if (fileInfo) {
      if (fileInfo.type === 'video') {
        setNature('ویدیوی ضبط شده دوره های آموزشی');
        setStudyDuration('45');
      } else if (fileInfo.type === 'pdf') {
        setNature('کتاب و جزوه متنی PDF');
        setStudyDuration('60');
      } else if (fileInfo.type === 'powerpoint') {
        setNature('اسلایدها و فایل ارائه پاورپوینت (PPTX)');
        setStudyDuration('35');
      } else if (fileInfo.type === 'audio') {
        setNature('صوتی و پادکست');
        setStudyDuration('25');
      } else if (fileInfo.type === 'spreadsheet' || fileInfo.type === 'document') {
        setNature('تمپلیت‌ها و فرم‌های کاربردی Word / Excel');
        setStudyDuration('20');
      }
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('لطفاً عنوان منبع را وارد نمایید.');
      return;
    }

    const determinedCategory: ResourceCategory =
      uploadedFile?.category ||
      (nature.includes('ویدیو') ? 'videos' :
       nature.includes('پاورپوینت') ? 'powerpoints_slides' :
       nature.includes('PDF') ? 'books_handouts' :
       nature.includes('صوت') ? 'audio_podcasts' :
       nature.includes('اسکورم') ? 'elearning_packages' :
       nature.includes('سوالات') ? 'sample_questions' : 'templates_docs');

    const determinedType =
      uploadedFile?.type ||
      (nature.includes('ویدیو') ? 'video' :
       nature.includes('پاورپوینت') ? 'powerpoint' :
       nature.includes('PDF') ? 'pdf' :
       nature.includes('صوت') ? 'audio' : 'document');

    const fileUrl = uploadedFile?.dataUrl || linkUrl || '#';
    const parsedDuration = parseInt(studyDuration, 10) || 45;
    const splitKeywords = keywords.split(',').map(s => s.trim()).filter(Boolean);

    if (initialResource) {
      db.updateResource(initialResource.id, {
        title,
        description,
        author,
        category: determinedCategory,
        file_type: determinedType,
        file_name: uploadedFile?.name || initialResource.file_name || `${title}.${determinedType === 'video' ? 'mp4' : determinedType === 'pdf' ? 'pdf' : 'pptx'}`,
        download_url: fileUrl,
        file_size_mb: uploadedFile?.sizeMb || initialResource.file_size_mb || 25,
        study_duration_min: parsedDuration,
        allow_download: allowDownloadOnline,
        watermark_type: watermark,
        allow_scrubbing: allowScrubbing,
        cover_image_url: coverUrl,
        external_link: linkUrl,
        branch,
        branch_mode: branchMode,
        tags: splitKeywords
      });
    } else {
      const courses = db.getCourses();
      const newRes: CourseResource = {
        id: `res_${Date.now()}`,
        title,
        course_id: courses[0]?.id || 'crs_01',
        category: determinedCategory,
        file_type: determinedType,
        file_name: uploadedFile?.name || `${title}.${determinedType === 'video' ? 'mp4' : determinedType === 'pdf' ? 'pdf' : 'pptx'}`,
        file_size_mb: uploadedFile?.sizeMb || 35,
        download_url: fileUrl,
        description,
        author,
        study_duration_min: parsedDuration,
        allow_download: allowDownloadOnline,
        watermark_type: watermark,
        allow_scrubbing: allowScrubbing,
        cover_image_url: coverUrl,
        external_link: linkUrl,
        branch,
        branch_mode: branchMode,
        tags: splitKeywords,
        uploaded_by: 'مدیر آموزش و یادگیری',
        created_at: new Date().toISOString()
      };
      db.addResource(newRes);
    }

    onSave();
  };

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
          <span>منابع - ویرایش {title}</span>
          <RotateCcw className="w-4 h-4 text-sky-600 cursor-pointer hover:rotate-180 transition-transform" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 order-2 lg:order-1 border-r lg:border-r-0 lg:border-l border-slate-200 pl-0 lg:pl-5 space-y-4">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-sky-100 text-[#0288d1] flex items-center justify-center shadow-xs">
              <Image className="w-8 h-8" />
            </div>
            <button
              type="button"
              onClick={() => setIsCoverModalOpen(true)}
              className="text-[#0288d1] hover:underline font-bold text-xs"
            >
              ویرایش تصویر جلد
            </button>
          </div>

          <label className="flex items-start gap-2 cursor-pointer text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
            <input
              type="checkbox"
              checked={allowDownloadOnline}
              onChange={(e) => setAllowDownloadOnline(e.target.checked)}
              className="rounded border-slate-300 text-[#0288d1] focus:ring-0 mt-0.5"
            />
            <span className="leading-snug">
              امکان دریافت فایل توسط کاربر وجود داشته باشد (فقط برای فایل هایی که امکان نمایش آنلاین دارند)
            </span>
          </label>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
            <div className="text-[11px] font-bold text-slate-500">ویدیو</div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 shrink-0">واترمارک :</span>
              <select
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
              >
                <option value="-----------">-----------</option>
                <option value="national_id">کد ملی و شماره پرسنلی کاربر</option>
                <option value="logo">لوگوی شرکت پالایش نفت اصفهان</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={allowScrubbing}
                onChange={(e) => setAllowScrubbing(e.target.checked)}
                className="rounded border-slate-300 text-[#0288d1] focus:ring-0"
              />
              <span className="font-semibold">اجازه پیمایش و جلو زدن ویدیو</span>
            </label>
          </div>

          {/* بخش اختصاصی بارگذاری ویدئو، PDF، پاورپوینت و انواع منابع آموزشی */}
          <div className="space-y-2 pt-1 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#0288d1]" />
                <span>بارگذاری و پیش‌نمایش فایل منبع آموزشی:</span>
              </span>
              {uploadedFile && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  آماده پخش و ذخیره
                </span>
              )}
            </div>

            <ResourceFileUploadZone
              initialFile={
                uploadedFile
                  ? {
                      name: uploadedFile.name,
                      sizeMb: uploadedFile.sizeMb,
                      type: uploadedFile.type,
                      category: uploadedFile.category,
                      url: uploadedFile.dataUrl
                    }
                  : undefined
              }
              watermarkText={watermark}
              allowScrubbing={allowScrubbing}
              allowDownload={allowDownloadOnline}
              onFileChange={handleFileChange}
            />
          </div>
        </div>

        <div className="lg:col-span-7 order-1 lg:order-2 space-y-3">
          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">کد شناسه :</span>
            <div className="col-span-9 flex items-center gap-2">
              <input
                type="text"
                value={resId}
                onChange={(e) => setResId(e.target.value)}
                className="w-32 px-3 py-1.5 border border-slate-300 rounded text-center font-mono bg-white text-xs"
              />
              <span className="font-semibold text-slate-700 pr-2">مؤلف :</span>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="نام مؤلف یا استاد..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
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
                className="w-full px-3 py-1.5 border-2 border-rose-400 rounded focus:outline-none focus:border-rose-600 font-bold bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">گروه آموزشی :</span>
            <div className="col-span-9 flex items-center gap-1.5">
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
              >
                <option value="مدیران">مدیران</option>
                <option value="عمومی">عمومی</option>
                <option value="فنی و تخصصی">فنی و تخصصی</option>
              </select>
              <button
                type="button"
                className="w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0"
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
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
              >
                <option value="ویدیوی ضبط شده دوره های آموزشی">ویدیوی ضبط شده دوره‌های آموزشی (MP4 / WebM / MKV)</option>
                <option value="کتاب و جزوه متنی PDF">کتاب و جزوه متنی (PDF)</option>
                <option value="اسلایدها و فایل ارائه پاورپوینت (PPTX)">اسلایدها و فایل ارائه پاورپوینت (PPT / PPTX)</option>
                <option value="صوتی و پادکست">صوتی و پادکست آموزشی (MP3 / WAV)</option>
                <option value="تمپلیت‌ها و فرم‌های کاربردی Word / Excel">تمپلیت‌ها و فرم‌های کاربردی (Word / Excel)</option>
                <option value="بسته الکترونیکی مالتی‌مدیا و اسکورم (SCORM)">بسته‌های الکترونیکی و مالتی‌مدیا (SCORM / ZIP)</option>
                <option value="نمونه سوالات و محتوای ارزیابی">بانک نمونه سوالات و آزمون‌ها</option>
              </select>
              <button
                type="button"
                className="w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">مدت مطالعه :</span>
            <div className="col-span-9 flex items-center gap-2">
              <input
                type="number"
                value={studyDuration}
                onChange={(e) => setStudyDuration(e.target.value)}
                className="w-24 px-3 py-1 border border-slate-300 rounded text-center font-bold bg-white text-xs"
              />
              <span className="text-slate-600">دقیقه</span>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">پیوند مطلب :</span>
            <div className="col-span-9">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-start gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700 pt-1">شرح :</span>
            <div className="col-span-9">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="شرح و خلاصه‌ای از محتوای این منبع..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">شعبه :</span>
            <div className="col-span-9 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="branchMode"
                  checked={branchMode === 'public'}
                  onChange={() => setBranchMode('public')}
                  className="text-[#0288d1] focus:ring-0"
                />
                <span className="font-semibold">دسترسی عمومی</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="branchMode"
                  checked={branchMode === 'branch'}
                  onChange={() => setBranchMode('branch')}
                  className="text-[#0288d1] focus:ring-0"
                />
                <span>مختص شعبه</span>
              </label>

              {branchMode === 'branch' && (
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="پالایشگاه اصفهان">پالایشگاه اصفهان</option>
                  <option value="مرکز آموزش فنی و تحقیقات">مرکز آموزش فنی و تحقیقات</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">کلمات کلیدی :</span>
            <div className="col-span-9">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="جهت وارد نمودن کلمات جدید از کاما ( , ) استفاده کنید"
                className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">عناوین مرتبط :</span>
            <div className="col-span-9 text-slate-600 flex items-center gap-2">
              <span>
                {selectedRelatedIds.length === 0
                  ? 'موردی انتخاب نشده است.'
                  : `${selectedRelatedIds.length} عنوان مرتبط انتخاب شده.`}
                {' '}جهت انتخاب و ویرایش عناوین مرتبط
              </span>
              <button
                type="button"
                onClick={() => setIsRelatedModalOpen(true)}
                className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>اینجا را کلیک نمایید</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-left font-semibold text-slate-700">بازنگری :</span>
            <div className="col-span-9 text-slate-600 flex items-center gap-2">
              <span>موردی انتخاب نشده است. جهت انتخاب و ویرایش مورد بازنگری شده</span>
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(true)}
                className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>اینجا را کلیک نمایید</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2 pt-2 border-t border-slate-200">
            <span className="col-span-3 text-left font-semibold text-slate-700">وضعیت :</span>
            <div className="col-span-9 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                className={`px-4 py-1 rounded border text-xs font-bold ${
                  status === 'active'
                    ? 'bg-white border-[#0288d1] text-[#0288d1]'
                    : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}
              >
                {status === 'active' ? 'فعال' : 'غیرفعال'}
              </button>

              <span className="text-[11px] text-slate-400">
                دسترسی به این منبع برای عموم مقدور است
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400 font-mono">
        مدیریت یکپارچه آموزش و یادگیری ایده ( ۷.۵۰.۰۰.۸۸ )
      </div>

      {isRelatedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-lg w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">انتخاب عناوین و منابع مرتبط</h3>
              <button onClick={() => setIsRelatedModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 border border-slate-300 rounded px-2.5 py-1 bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={relatedSearch}
                onChange={(e) => setRelatedSearch(e.target.value)}
                placeholder="جستجو در سایر منابع آموزشی..."
                className="w-full text-xs bg-transparent focus:outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded p-1">
              {allResources
                .filter((r) => r.title.includes(relatedSearch))
                .map((r) => {
                  const isChecked = selectedRelatedIds.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className="flex items-center justify-between p-2 hover:bg-sky-50 rounded cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedRelatedIds(selectedRelatedIds.filter((id) => id !== r.id));
                            } else {
                              setSelectedRelatedIds([...selectedRelatedIds, r.id]);
                            }
                          }}
                          className="rounded text-[#0288d1] focus:ring-0"
                        />
                        <span className="font-bold text-slate-800">{r.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase">{r.file_type}</span>
                    </label>
                  );
                })}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsRelatedModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                تایید عناوین مرتبط ({selectedRelatedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">ثبت و انتخاب بازنگری مدرک آموزشی</h3>
              <button onClick={() => setIsRevisionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">کد بازنگری (Revision Code) :</label>
                <input
                  type="text"
                  value={revisionCode}
                  onChange={(e) => setRevisionCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">شرح تغییرات و علت بازنگری :</label>
                <textarea
                  rows={3}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                ثبت نسخه بازنگری
              </button>
            </div>
          </div>
        </div>
      )}

      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">ویرایش و بارگذاری تصویر جلد</h3>
              <button onClick={() => setIsCoverModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-sky-300 rounded-lg p-6 text-center bg-sky-50/50">
                <Image className="w-12 h-12 text-sky-600 mx-auto mb-2" />
                <label className="px-4 py-2 bg-[#0288d1] hover:bg-sky-700 text-white rounded font-bold text-xs cursor-pointer inline-block">
                  انتخاب فایل تصویر از سیستم
                  <input type="file" className="hidden" accept="image/*" />
                </label>
                <span className="block text-[11px] text-slate-400 mt-2">فرمت‌های مجاز: JPG, PNG, WebP حداکثر ۲ مگابایت</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsCoverModalOpen(false)}
                className="px-4 py-1.5 bg-[#0288d1] text-white rounded text-xs font-semibold"
              >
                تایید تصویر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
