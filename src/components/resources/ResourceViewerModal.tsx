import React, { useState, useRef } from 'react';
import { CourseResource, ResourceCategory } from '../../types/models';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  Shield,
  Download,
  Presentation,
  FileText,
  Video,
  Volume2 as AudioIcon,
  FileSpreadsheet,
  Edit2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  BookOpen,
  Calendar,
  User,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

interface ResourceViewerModalProps {
  resource: CourseResource | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (resource: CourseResource) => void;
}

export const ResourceViewerModal: React.FC<ResourceViewerModalProps> = ({
  resource,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen || !resource) return null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // وضعیت اسلاید برای پاورپوینت
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const sampleSlides = [
    {
      title: 'سرفصل ۱: مبانی و ساختار سیستم مدیریت آموزش',
      points: [
        'تعریف استاندارد شایستگی و تحلیل نقش‌های کلیدی سازمان',
        'فرآیند یکپارچه آموزش در شرکت پالایش نفت اصفهان (EORC)',
        'تعریف اهداف قابل اندازه‌گیری بر اساس متد SMART'
      ],
      slideNum: 1
    },
    {
      title: 'سرفصل ۲: ماتریس شناسایی شکاف شایستگی (TNA)',
      points: [
        'تحلیل شایستگی‌های عمومی، مدیریتی و تخصصی مشاغل',
        'ارزیابی وضعیت موجود کارشناسان در مقایسه با استاندارد شغل',
        'طراحی پودمان‌های جبران شکاف مهارت‌ها'
      ],
      slideNum: 2
    },
    {
      title: 'سرفصل ۳: الگوهای تدریس و منابع چندرسانه‌ای',
      points: [
        'بهره‌گیری از ویدئوهای شبیه‌سازی عملیات در پالایشگاه',
        'تعامل مربی و فراگیر در کارگاه‌های مهارت‌افزایی',
        'مستندسازی و کنترل نسخه‌های آموزشی'
      ],
      slideNum: 3
    },
    {
      title: 'سرفصل ۴: الگوی ۴ سطحی ارزیابی کرک‌پاتریک',
      points: [
        'سطح ۱: واکنش و سنجش رضایت فراگیران از مدرس و محتوا',
        'سطح ۲: یادگیری و ارزیابی رشد علمی از طریق پیش‌آزمون/پس‌آزمون',
        'سطح ۳: انتقال رفتار و عملکرد در محیط واقعی کار (۶۰ روزه)',
        'سطح ۴: نتایج کلیدی، شاخص‌های KPI و بازگشت سرمایه آموزش (ROI)'
      ],
      slideNum: 4
    },
    {
      title: 'سرفصل ۵: ممیزی، بازنگری و بهبود مستمر',
      points: [
        'چک‌لیست خودارزیابی دوره‌ای الزامات ISO 10015',
        'صدور گواهینامه‌های رسمی شایستگی با کد اعتبارسنجی یکتا',
        'برنامه‌ریزی اقدامات اصلاحی و ارتقای شایستگی سازمانی'
      ],
      slideNum: 5
    }
  ];

  // تشخیص نوع مدیا
  const isVideo =
    resource.category === 'videos' ||
    resource.file_type === 'mp4' ||
    resource.file_type === 'webm' ||
    resource.file_type === 'mkv';

  const isPowerPoint =
    resource.category === 'powerpoints_slides' ||
    resource.file_type === 'pptx' ||
    resource.file_type === 'ppt';

  const isAudio =
    resource.category === 'audio_podcasts' ||
    resource.file_type === 'mp3' ||
    resource.file_type === 'wav';

  const isPdf =
    resource.category === 'books_handouts' ||
    resource.file_type === 'pdf';

  const effectiveVideoUrl =
    resource.video_url ||
    (resource.download_url && resource.download_url !== '#' ? resource.download_url : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

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
    if (resource.allow_scrubbing === false) return;
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

  const getWatermarkText = () => {
    if (resource.watermark_type === 'national_id') {
      return 'کد ملی: ۰۰۷۸۹۱۲۳۴۵ · شرکت پالایش نفت اصفهان';
    }
    if (resource.watermark_type === 'logo') {
      return 'سامانه یادگیری الکترونیکی EORC';
    }
    if (resource.watermark_type && resource.watermark_type !== '-----------') {
      return resource.watermark_type;
    }
    return 'شرکت پالایش نفت اصفهان · نسخه رسمی';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* نوار سربرگ مدال */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0288d1] flex items-center justify-center shrink-0">
              {isVideo && <Video className="w-5 h-5 text-rose-600" />}
              {isPowerPoint && <Presentation className="w-5 h-5 text-amber-600" />}
              {isAudio && <AudioIcon className="w-5 h-5 text-purple-600" />}
              {isPdf && <BookOpen className="w-5 h-5 text-[#0288d1]" />}
              {!isVideo && !isPowerPoint && !isAudio && !isPdf && <FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={resource.title}>
                {resource.title}
              </h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                <span>شناسه: {resource.id.replace('res_', '')}</span>
                <span>·</span>
                <span className="uppercase font-bold text-slate-700">{resource.file_type}</span>
                <span>·</span>
                <span>{resource.file_size_mb} MB</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(resource);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                title="ویرایش این منبع در فرم مطابق سامانه"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#0288d1]" />
                <span className="hidden sm:inline">ویرایش منبع</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* بدنه محتوای رسانه */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          
          {/* ۱. پخش‌کننده اختصاصی ویدئو با واترمارک و کنترل جلو زدن */}
          {isVideo && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black shadow-lg">
              <div className="relative group">
                <video
                  ref={videoRef}
                  src={effectiveVideoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-64 sm:h-96 object-contain mx-auto bg-black cursor-pointer"
                  onClick={togglePlay}
                  poster={resource.cover_image_url}
                />

                {/* واترمارک روی ویدئو */}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-xs text-white/80 text-[11px] px-3 py-1 rounded-md font-mono pointer-events-none select-none border border-white/10 flex items-center gap-1.5 shadow-md">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>{getWatermarkText()}</span>
                </div>

                {/* دکمه بزرگ پخش در مرکز هنگام توقف */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 hover:bg-[#0288d1] text-white flex items-center justify-center transition-all shadow-xl group-hover:scale-110"
                  >
                    <Play className="w-8 h-8 mr-1 text-white" />
                  </button>
                )}
              </div>

              {/* کنترل‌های پلیر ویدیو */}
              <div className="bg-slate-900 text-white p-3 space-y-2 border-t border-slate-800">
                <div className="flex items-center gap-2.5 text-xs font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleScrub}
                    disabled={resource.allow_scrubbing === false}
                    className={`flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0288d1] ${
                      resource.allow_scrubbing === false ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  />
                  <span>{formatTime(duration)}</span>
                </div>

                {resource.allow_scrubbing === false && (
                  <p className="text-[11px] text-amber-300 text-center font-sans bg-amber-950/40 py-1 rounded border border-amber-800/50">
                    * پیمایش سریع و جلو زدن این ویدیو توسط مدیر آموزش محدود شده است (مشاهده کامل الزامی است).
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
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
                      className="p-1.5 text-slate-300 hover:text-white"
                      title="پخش مجدد از ابتدا"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const rates = [1, 1.25, 1.5, 2];
                        const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
                        setPlaybackRate(nextRate);
                        if (videoRef.current) videoRef.current.playbackRate = nextRate;
                      }}
                      className="text-xs font-mono font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded text-sky-200"
                    >
                      {playbackRate}x
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted;
                          setIsMuted(!isMuted);
                        }
                      }}
                      className="p-1.5 text-slate-300 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current && videoRef.current.requestFullscreen) {
                          videoRef.current.requestFullscreen();
                        }
                      }}
                      className="p-1.5 text-slate-300 hover:text-white"
                      title="تمام صفحه"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ۲. نمایشگر پرزنتیشن و اسلایدهای پاورپوینت (PPTX) */}
          {isPowerPoint && (
            <div className="bg-slate-900 text-white rounded-xl overflow-hidden border border-amber-600/30 shadow-lg space-y-3 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-amber-800 via-amber-900 to-slate-900 rounded-xl p-6 sm:p-8 min-h-[260px] flex flex-col justify-between border border-amber-500/30 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-5 h-5 text-amber-300" />
                    <span className="font-bold text-xs text-amber-100">
                      پرزنتیشن تعاملی سازمانی · استاندارد ISO 10015
                    </span>
                  </div>
                  <span className="text-xs font-mono bg-amber-950/80 px-2.5 py-1 rounded-md text-amber-300 border border-amber-700/50">
                    اسلاید {currentSlideIndex + 1} از {sampleSlides.length}
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  <h3 className="font-black text-base sm:text-lg text-white">
                    {sampleSlides[currentSlideIndex].title}
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-amber-100/90 leading-relaxed list-disc list-inside">
                    {sampleSlides[currentSlideIndex].points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-amber-300/80 font-mono">
                  <span>شرکت پالایش نفت اصفهان · مدیریت آموزش و یادگیری</span>
                  <span>کد ماژول: PPT-MOD-2026</span>
                </div>
              </div>

              {/* کنترل‌های اسلاید شو */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <span className="font-mono text-xs text-slate-300 px-2">
                    {currentSlideIndex + 1} / {sampleSlides.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex(Math.min(sampleSlides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === sampleSlides.length - 1}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {resource.allow_download !== false && (
                    <a
                      href={resource.download_url !== '#' ? resource.download_url : '#'}
                      download={resource.file_name || `${resource.title}.pptx`}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود فایل PPTX ({resource.file_size_mb} MB)</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ۳. مطالعه کتاب و جزوه PDF */}
          {isPdf && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-28 bg-white border border-slate-300 rounded-lg shadow-md flex flex-col items-center justify-center text-red-600 p-3">
                <FileText className="w-10 h-10" />
                <span className="text-[10px] font-bold mt-2 font-mono">PDF DOCUMENT</span>
              </div>

              <div className="max-w-md space-y-1">
                <h4 className="font-bold text-sm text-slate-900">{resource.title}</h4>
                <p className="text-xs text-slate-500">
                  متن استاندارد و جزوه رسمی به همراه فهرست عناوین و محتوای قابل چاپ
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <a
                  href={resource.download_url !== '#' ? resource.download_url : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>نمایشگر تمام‌صفحه و مطالعه آنلاین</span>
                </a>

                {resource.allow_download !== false && (
                  <a
                    href={resource.download_url !== '#' ? resource.download_url : '#'}
                    download={resource.file_name || `${resource.title}.pdf`}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>دانلود مستقیم ({resource.file_size_mb} MB)</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ۴. پخش‌کننده فایل صوتی و پادکست */}
          {isAudio && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <AudioIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{resource.title}</h4>
                  <p className="text-[11px] text-purple-700 mt-0.5">پادکست صوتی آموزش و مدیریت شایستگی</p>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={resource.download_url !== '#' ? resource.download_url : ''}
                controls
                className="w-full mt-2"
              />

              {resource.allow_download !== false && (
                <div className="flex justify-end pt-1">
                  <a
                    href={resource.download_url !== '#' ? resource.download_url : '#'}
                    download={resource.file_name || `${resource.title}.mp3`}
                    className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دریافت فایل صوتی MP3</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* اطلاعات تکمیلی و توضیحات منبع */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0288d1]" />
              <span>مشخصات و الزامات بهره‌برداری سازمانی</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">بارگذاری توسط</span>
                <span className="font-bold text-slate-800">{resource.uploaded_by || resource.author || 'مدیر آموزش'}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">مدت مطالعه / مشاهده</span>
                <span className="font-bold text-slate-800">{resource.study_duration_min || 45} دقیقه</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">امکان دانلود</span>
                <span className={`font-bold ${resource.allow_download !== false ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {resource.allow_download !== false ? 'مجاز' : 'غیرمجاز (فقط آنلاین)'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">شعبه / دسترسی</span>
                <span className="font-bold text-slate-800">{resource.branch || 'پالایشگاه اصفهان'}</span>
              </div>
            </div>

            {resource.description && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[11px] text-slate-400 block mb-1">شرح و اهداف آموزشی:</span>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                  {resource.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* پاورقی مدال */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            شرکت پالایش نفت اصفهان · مدیریت یکپارچه آموزش و یادگیری ایده
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
