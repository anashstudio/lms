import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Video,
  FileText,
  FileSpreadsheet,
  Volume2,
  Presentation,
  Archive,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  VolumeX,
  Shield,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { ResourceCategory } from '../../types/models';

export interface UploadedFileInfo {
  name: string;
  sizeMb: number;
  type: string; // 'video' | 'pdf' | 'powerpoint' | 'audio' | 'spreadsheet' | 'document' | 'zip'
  category: ResourceCategory;
  dataUrl: string;
  durationSec?: number;
  slideCount?: number;
}

interface ResourceFileUploadZoneProps {
  initialFile?: {
    name?: string;
    sizeMb?: number;
    type?: string;
    url?: string;
    category?: ResourceCategory;
  } | null;
  watermarkText?: string;
  allowScrubbing?: boolean;
  allowDownload?: boolean;
  onFileChange: (fileInfo: UploadedFileInfo | null) => void;
  className?: string;
}

export const ResourceFileUploadZone: React.FC<ResourceFileUploadZoneProps> = ({
  initialFile,
  watermarkText = '-----------',
  allowScrubbing = true,
  allowDownload = true,
  onFileChange,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentFile, setCurrentFile] = useState<UploadedFileInfo | null>(() => {
    if (initialFile?.url) {
      return {
        name: initialFile.name || 'فایل منبع آموزشی',
        sizeMb: initialFile.sizeMb || 10,
        type: initialFile.type || 'video',
        category: initialFile.category || 'videos',
        dataUrl: initialFile.url,
        durationSec: 120,
        slideCount: 15
      };
    }
    return null;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // وضعیت اسلاید برای پاورپوینت
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const sampleSlides = [
    { title: 'سرفصل ۱: اصول و مبانی استاندارد آموزش', subtitle: 'تعاریف شایستگی، مدیریت دانش و متدولوژی یادگیری' },
    { title: 'سرفصل ۲: نیازسنجی آموزش بر مبنای TNA', subtitle: 'تحلیل شکاف مهارتی و ماتریس صلاحیت‌های شغلی' },
    { title: 'سرفصل ۳: برنامه‌ریزی، طراحی و تدوین پودمان‌ها', subtitle: 'تعیین اهداف SMART و گزینش شیوه‌های تدریس' },
    { title: 'سرفصل ۴: ارزشیابی ۴ سطحی کرک‌پاتریک', subtitle: 'سنجش واکنش، یادگیری، رفتار سازمانی و نتایج کسب‌وکار' },
    { title: 'سرفصل ۵: ممیزی و شاخص‌های بهبود مستمر', subtitle: 'فرآیند بازنگری مدیریت و مستندسازی عدم انطباق‌ها' }
  ];

  // تشخیص نوع فایل بر اساس پسوند
  const detectFileType = (fileName: string): { type: string; category: ResourceCategory } => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    if (['mp4', 'webm', 'ogg', 'mkv', 'mov', 'avi'].includes(ext)) {
      return { type: 'video', category: 'videos' };
    }
    if (ext === 'pdf') {
      return { type: 'pdf', category: 'books_handouts' };
    }
    if (['pptx', 'ppt'].includes(ext)) {
      return { type: 'powerpoint', category: 'powerpoints_slides' };
    }
    if (['mp3', 'wav', 'm4a', 'aac', 'flac'].includes(ext)) {
      return { type: 'audio', category: 'audio_podcasts' };
    }
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return { type: 'spreadsheet', category: 'templates_docs' };
    }
    if (['docx', 'doc', 'txt'].includes(ext)) {
      return { type: 'document', category: 'templates_docs' };
    }
    if (['zip', 'rar', 'scorm'].includes(ext)) {
      return { type: 'zip', category: 'elearning_packages' };
    }
    return { type: 'document', category: 'books_handouts' };
  };

  const handleProcessFile = (file: File) => {
    const { type, category } = detectFileType(file.name);
    const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

    // ایجاد Object URL برای استریم محلی بدون تاخیر
    const objectUrl = URL.createObjectURL(file);

    const fileInfo: UploadedFileInfo = {
      name: file.name,
      sizeMb,
      type,
      category,
      dataUrl: objectUrl,
      durationSec: type === 'video' ? 120 : type === 'audio' ? 300 : undefined,
      slideCount: type === 'powerpoint' ? 15 : undefined
    };

    setCurrentFile(fileInfo);
    setIsPlaying(false);
    setCurrentTime(0);
    onFileChange(fileInfo);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleClearFile = () => {
    if (currentFile?.dataUrl && currentFile.dataUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentFile.dataUrl);
    }
    setCurrentFile(null);
    setIsPlaying(false);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // کنترل‌های ویدیو
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!allowScrubbing) return;
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // تعیین متن واترمارک
  const renderWatermarkText = () => {
    if (!watermarkText || watermarkText === '-----------') return null;
    if (watermarkText === 'national_id') return 'کد ملی: ۰۰۷۸۹۱۲۳۴۵ · شرکت پالایش نفت اصفهان';
    if (watermarkText === 'logo') return 'سامانه یادگیری EORC · کلیه حقوق محفوظ است';
    return watermarkText;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.webm,.mkv,.mov,.avi,.pdf,.pptx,.ppt,.docx,.doc,.xlsx,.xls,.mp3,.wav,.zip,.scorm"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* اگر فایلی انتخاب نشده باشد: کادر آپلود تعاملی */}
      {!currentFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#0288d1] bg-sky-50 shadow-inner'
              : 'border-slate-300 hover:border-[#0288d1] hover:bg-slate-50/70 bg-white'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0288d1] flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>

            <p className="font-bold text-xs text-slate-800">
              برای بارگذاری فایل (ویدئو، PDF، پاورپوینت، صوت، سند) اینجا کلیک کنید یا فایل را بکشید و رها کنید
            </p>
            <p className="text-[11px] text-slate-400">
              فرمت‌های مجاز: MP4, WebM, MKV, PDF, PPTX, PPT, MP3, DOCX, XLSX, ZIP
            </p>

            <button
              type="button"
              className="mt-2 px-4 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              انتخاب فایل از رایانه
            </button>
          </div>
        </div>
      ) : (
        /* نمایش پیش‌نمایش و پلیر هوشمند فایل بارگذاری‌شده */
        <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
          
          {/* نوار بالایی مشخصات فایل */}
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {currentFile.type === 'video' && <Video className="w-4 h-4 text-rose-600 shrink-0" />}
              {currentFile.type === 'pdf' && <FileText className="w-4 h-4 text-red-600 shrink-0" />}
              {currentFile.type === 'powerpoint' && <Presentation className="w-4 h-4 text-amber-600 shrink-0" />}
              {currentFile.type === 'audio' && <Volume2 className="w-4 h-4 text-purple-600 shrink-0" />}
              {currentFile.type === 'spreadsheet' && <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />}
              {currentFile.type === 'document' && <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />}
              {currentFile.type === 'zip' && <Archive className="w-4 h-4 text-indigo-600 shrink-0" />}

              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-800 truncate" title={currentFile.name}>
                  {currentFile.name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {currentFile.type.toUpperCase()} · {currentFile.sizeMb} مگابایت
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition-colors"
              >
                تغییر فایل
              </button>
              <button
                type="button"
                onClick={handleClearFile}
                className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="حذف فایل"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* محتوای پلیر بسته به نوع فایل */}
          
          {/* ۱. پلیر ویدیو با واترمارک و کنترل جلو زدن */}
          {currentFile.type === 'video' && (
            <div className="relative bg-black group">
              <video
                ref={videoRef}
                src={currentFile.dataUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-56 sm:h-64 object-contain mx-auto bg-black cursor-pointer"
                onClick={togglePlay}
              />

              {/* واترمارک شناور روی ویدیو */}
              {renderWatermarkText() && (
                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-xs text-white/70 text-[10px] px-2.5 py-1 rounded font-mono pointer-events-none select-none border border-white/10 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>{renderWatermarkText()}</span>
                </div>
              )}

              {/* کنترل‌های اختصاصی ویدیو */}
              <div className="bg-slate-900/90 text-white p-2.5 flex flex-col gap-1.5 border-t border-slate-800">
                
                {/* نوار پیمایش (Scrub Bar) */}
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleScrub}
                    disabled={!allowScrubbing}
                    className={`flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0288d1] ${
                      !allowScrubbing ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  />
                  <span>{formatTime(duration)}</span>
                </div>

                {!allowScrubbing && (
                  <p className="text-[10px] text-amber-400 text-center font-sans">
                    * پیمایش سریع و جلو زدن این ویدیو توسط مدیر آموزش محدود شده است.
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          setCurrentTime(0);
                        }
                      }}
                      className="p-1 text-slate-300 hover:text-white"
                      title="پخش مجدد از ابتدا"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const rates = [1, 1.25, 1.5, 2];
                        const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
                        const nextRate = rates[nextIndex];
                        setPlaybackRate(nextRate);
                        if (videoRef.current) videoRef.current.playbackRate = nextRate;
                      }}
                      className="text-[10px] font-mono font-bold bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-sky-200"
                    >
                      {playbackRate}x
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted;
                          setIsMuted(!isMuted);
                        }
                      }}
                      className="p-1 text-slate-300 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          if (videoRef.current.requestFullscreen) {
                            videoRef.current.requestFullscreen();
                          }
                        }
                      }}
                      className="p-1 text-slate-300 hover:text-white"
                      title="تمام صفحه"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ۲. پیش‌نمایش کتاب و جزوه PDF */}
          {currentFile.type === 'pdf' && (
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-20 bg-white border border-slate-300 rounded shadow-md flex flex-col items-center justify-center text-red-600 p-2">
                <FileText className="w-8 h-8" />
                <span className="text-[9px] font-bold mt-1 font-mono">PDF</span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-800">{currentFile.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">آماده مطالعه آنلاین و دریافت توسط کاربران</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={currentFile.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>باز کردن در نمایشگر تمام‌صفحه PDF</span>
                </a>

                {allowDownload && (
                  <a
                    href={currentFile.dataUrl}
                    download={currentFile.name}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ۳. پیش‌نمایش اسلایدهای ارائه PowerPoint (PPTX) */}
          {currentFile.type === 'powerpoint' && (
            <div className="bg-slate-900 text-white p-4 space-y-3">
              <div className="bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg p-6 min-h-[160px] flex flex-col justify-between border border-amber-600/40 shadow-inner text-right">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-amber-950/60 px-2 py-0.5 rounded text-amber-200">
                    اسلاید {currentSlideIndex + 1} از {sampleSlides.length}
                  </span>
                  <Presentation className="w-5 h-5 text-amber-300" />
                </div>

                <div>
                  <h3 className="font-black text-sm text-white mb-1">
                    {sampleSlides[currentSlideIndex].title}
                  </h3>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {sampleSlides[currentSlideIndex].subtitle}
                  </p>
                </div>

                <div className="text-[10px] text-amber-300/70 font-mono">
                  {currentFile.name} · اسلاید پرزنتیشن سازمانی
                </div>
              </div>

              {/* کنترل‌های اسلاید شو */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-xs text-slate-300">
                    {currentSlideIndex + 1} / {sampleSlides.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex(Math.min(sampleSlides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === sampleSlides.length - 1}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {allowDownload && (
                  <a
                    href={currentFile.dataUrl}
                    download={currentFile.name}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود فایل PPTX</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ۴. پلیر صوت و پادکست */}
          {currentFile.type === 'audio' && (
            <div className="p-4 bg-purple-50/70 border-t border-purple-200 space-y-3">
              <audio ref={audioRef} src={currentFile.dataUrl} controls className="w-full" />
              <div className="flex items-center justify-between text-[11px] text-purple-900 font-medium">
                <span>پخش فایل صوتی و پادکست آموزشی</span>
                {allowDownload && (
                  <a
                    href={currentFile.dataUrl}
                    download={currentFile.name}
                    className="text-purple-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دریافت فایل MP3</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ۵. فایل‌های اکسل، ورد، زیپ */}
          {['spreadsheet', 'document', 'zip'].includes(currentFile.type) && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs text-slate-700">فایل آماده بهره‌برداری و اتصال به دوره می‌باشد.</span>
              </div>
              {allowDownload && (
                <a
                  href={currentFile.dataUrl}
                  download={currentFile.name}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود فایل منبع</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
