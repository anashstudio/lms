import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { ExcelService } from '../../services/excelService';
import { THEME_CONFIGS } from '../../utils/theme';
import { TNARecord, Course, Certificate } from '../../types/models';
import {
  ShieldCheck,
  Award,
  Layers,
  FileSpreadsheet,
  Plus,
  CheckCircle,
  Clock,
  Printer,
  Calendar,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';

export const ISO10015Portal: React.FC = () => {
  const { settings, activeRole, activeUser, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [activeTab, setActiveTab] = useState<'cycle' | 'tna' | 'audit' | 'certificates'>('cycle');
  const [tnaList, setTnaList] = useState<TNARecord[]>(() => db.getTNARecords());
  const [courses] = useState<Course[]>(() => db.getCourses());
  const [certificates, setCertificates] = useState<Certificate[]>(() => db.getCertificates());

  const [isTnaModalOpen, setIsTnaModalOpen] = useState(false);
  const [tnaCode, setTnaCode] = useState(`TNA-${new Date().getFullYear()}-Q${Math.floor(Math.random() * 4) + 1}-0${tnaList.length + 1}`);
  const [tnaDept, setTnaDept] = useState('واحد تضمین کیفیت');
  const [tnaJobTitles, setTnaJobTitles] = useState('کارشناس ارشد ممیزی، سرپرست کیفیت');
  const [tnaGap, setTnaGap] = useState('');
  const [tnaCourse, setTnaCourse] = useState('');
  const [tnaTrainees, setTnaTrainees] = useState(15);
  const [tnaPriority, setTnaPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [tnaJustification, setTnaJustification] = useState('');

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certLearnerId, setCertLearnerId] = useState('usr_learner_1');
  const [certCourseId, setCertCourseId] = useState(courses[0]?.id || '');
  const [certGrade, setCertGrade] = useState(90);

  const reload = () => {
    setTnaList(db.getTNARecords());
    setCertificates(db.getCertificates());
    triggerRefresh();
  };

  const handleCreateTNA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tnaGap || !tnaCourse) return;

    const tna: TNARecord = {
      id: `tna_${Date.now()}`,
      code: tnaCode,
      department: tnaDept,
      job_titles: tnaJobTitles.split(',').map(s => s.trim()),
      competency_gap: tnaGap,
      proposed_course_title: tnaCourse,
      target_trainees_count: Number(tnaTrainees),
      priority: tnaPriority,
      year: new Date().getFullYear(),
      status: 'approved',
      justification: tnaJustification || 'انطباق با الزامات استانداردهای بین‌المللی'
    };

    db.addTNARecord(tna);
    setIsTnaModalOpen(false);
    setTnaGap('');
    setTnaCourse('');
    reload();
  };

  const handleIssueCert = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.getUserById(certLearnerId);
    const course = db.getCourseById(certCourseId);

    if (!user || !course) return;

    const cert: Certificate = {
      id: `cert_${Date.now()}`,
      certificate_number: `ISO10015-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: user.id,
      user_name: user.full_name,
      course_id: course.id,
      course_title: course.title,
      duration_hours: course.duration_hours,
      grade: Number(certGrade),
      issue_date: new Date().toISOString(),
      iso_compliance_code: 'ISO-10015:2019-AUDIT-VERIFIED',
      instructor_name: course.instructor_name,
      is_valid: true
    };

    db.issueCertificate(cert);
    setIsCertModalOpen(false);
    reload();
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              سیستم مدیریت کیفیت آموزش مبتنی بر راهنمای ISO 10015:2019
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            چرخه سیستماتیک نیازسنجی شایستگی (TNA)، برنامه‌ریزی، تامین و اجرای آموزش و ارزشیابی اثربخشی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => ExcelService.exportISO10015Audit(tnaList, courses, certificates)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>خروجی دفترچه ممیزی اکسل (۳ فاز)</span>
          </button>
        </div>
      </div>

      {}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('cycle')}
          className={`px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'cycle'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          چرخه ۴ گانه ISO 10015
        </button>
        <button
          onClick={() => setActiveTab('tna')}
          className={`px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'tna'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          نیازسنجی شایستگی (TNA) ({tnaList.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          چک‌لیست ممیزی کیفیت
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'certificates'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          گواهینامه‌های رسمی صادره ({certificates.length})
        </button>
      </div>

      {}
      {activeTab === 'cycle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              num: '۱',
              title: 'مرحله ۱: نیازسنجی شایستگی (TNA)',
              desc: 'تحلیل نیازهای سازمان، تحلیل الزامات شغل و ارزیابی شایستگی‌های موجود پرسنل جهت استخراج شکاف مهارت.',
              status: `${tnaList.length} نیازسنجی مصوب`,
              badge: 'بند ۴ استاندارد'
            },
            {
              num: '۲',
              title: 'مرحله ۲: طراحی و برنامه‌ریزی',
              desc: 'تعیین اهداف یادگیری SMART، تدوین برنامه زمان‌بندی تقویم آموزش، انتخاب سرفصل‌ها و برآورد بودجه.',
              status: `${courses.length} دوره تدوین‌شده`,
              badge: 'بند ۵ استاندارد'
            },
            {
              num: '۳',
              title: 'مرحله ۳: تدارک و اجرای آموزش',
              desc: 'برگزاری کلاس‌های آفلاین، بارگذاری محتوای چندرسانه‌ای و منابع موضوعی و حضور و غیاب سیستمی.',
              status: 'درحال اجرا در سامانه',
              badge: 'بند ۶ استاندارد'
            },
            {
              num: '۴',
              title: 'مرحله ۴: ارزشیابی اثربخشی',
              desc: 'سنجش ۴ سطحی کرک‌پاتریک (واکنش، یادگیری، رفتار و نتایج سازمانی) و صدور گواهینامه‌های رسمی.',
              status: `${certificates.length} گواهی صادرشده`,
              badge: 'بند ۷ استاندارد'
            }
          ].map(phase => (
            <div
              key={phase.num}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
                    {phase.num}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {phase.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {phase.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {phase.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{phase.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {activeTab === 'tna' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">ماتریس نیازسنجی آموزشی سازمانی (TNA)</h3>
              <p className="text-slate-500 mt-0.5">ثبت نیازهای شناسایی‌شده بر مبنای تحلیل شغل و شکاف مهارت کارکنان</p>
            </div>

            {(activeRole === 'super_admin' || activeRole === 'class_manager') && (
              <button
                onClick={() => setIsTnaModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت فرم نیازسنجی جدید</span>
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">کد سند</th>
                    <th className="py-3 px-4">واحد سازمانی</th>
                    <th className="py-3 px-4">مشاغل هدف</th>
                    <th className="py-3 px-4">شکاف شایستگی شناسایی‌شده</th>
                    <th className="py-3 px-4">عنوان دوره پیشنهادی</th>
                    <th className="py-3 px-4">تعداد پرسنل</th>
                    <th className="py-3 px-4">اولویت</th>
                    <th className="py-3 px-4">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tnaList.map(tna => (
                    <tr key={tna.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-700 font-semibold">{tna.code}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{tna.department}</td>
                      <td className="py-3 px-4 text-slate-600">{tna.job_titles.join('، ')}</td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs">{tna.competency_gap}</td>
                      <td className="py-3 px-4 text-emerald-800 font-medium">{tna.proposed_course_title}</td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-800">{tna.target_trainees_count} نفر</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${
                          tna.priority === 'high' ? 'text-rose-700' : 'text-amber-700'
                        }`}>
                          {tna.priority === 'high' ? 'بالا' : 'متوسط'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-700 font-medium">
                          {tna.status === 'approved' ? 'مصوب' : tna.status === 'completed' ? 'تکمیل شده' : 'بررسی'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">چک‌لیست خودارزیابی ممیزی داخلی سیستم آموزش (ISO 10015:2019)</h3>
            <p className="text-slate-500 mt-1">بررسی انطباق مستندات و فرآیندهای آموزش سازمان با بندهای مرجع راهنما</p>
          </div>

          <div className="space-y-3">
            {[
              {
                clause: 'بند ۴.۱',
                title: 'فرآیند سیستماتیک نیازسنجی آموزشی (TNA)',
                desc: 'آیا نیازسنجی بر مبنای تحلیل شکاف شایستگی‌های مورد نیاز شغل و عملکرد پرسنل انجام و ثبت شده است؟',
                status: 'منطبق (مستندات TNA در سامانه ثبت است)'
              },
              {
                clause: 'بند ۵.۲',
                title: 'طراحی دوره‌ها و اهداف یادگیری قابل سنجش',
                desc: 'آیا اهداف دوره‌ها، سرفصل‌ها و مدت زمان کلاس‌ها مشخص و منطبق بر اولویت‌های استراتژیک است؟',
                status: 'منطبق (سیلابس دوره‌ها در پایگاه‌داده تدوین شده)'
              },
              {
                clause: 'بند ۶.۱',
                title: 'تدارک و دسترسی به منابع آموزشی آفلاین',
                desc: 'آیا فراگیران به اسلایدهای آموزشی، ویدئوهای جلسات و فایل‌های تکمیلی با دسته‌بندی موضوعی دسترسی دارند؟',
                status: 'منطبق (کتابخانه موضوعی فعال است)'
              },
              {
                clause: 'بند ۷.۱',
                title: 'ارزیابی اثربخشی نتایج آموزش',
                desc: 'آیا ارزیابی حداقل در سطوح واکنش (سطح ۱)، یادگیری (سطح ۲) و رفتار شغلی (سطح ۳) انجام می‌پذیرد؟',
                status: 'منطبق (پشتیبانی کامل از مدل کرک‌پاتریک)'
              },
              {
                clause: 'بند ۷.۳',
                title: 'نگهداری سوابق و صدور گواهینامه‌های معتبر',
                desc: 'آیا سوابق آموزشی پرسنل و گواهینامه‌های دارای شماره رهگیری یکتا در پایگاه‌داده ثبت و قابل استعلام هستند؟',
                status: 'منطبق (ثبت در دیتابیس رابطه‌ای SQL)'
              }
            ].map((chk, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-800 font-bold">{chk.clause}</span>
                    <span aria-hidden="true">·</span>
                    <h4 className="font-bold text-slate-900">{chk.title}</h4>
                  </div>
                  <p className="text-slate-600">{chk.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 font-bold shrink-0">
                  <CheckCircle className="w-4 h-4" />
                  <span>{chk.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">گواهینامه‌های رسمی صادرشده استاندارد ISO 10015</h3>
              <p className="text-slate-500 mt-0.5">صدور مدرک معتبر با کد انطباق بین‌المللی و امضای مدرس</p>
            </div>

            {(activeRole === 'super_admin' || activeRole === 'class_manager') && (
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>صدور گواهی جدید</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map(cert => (
              <div
                key={cert.id}
                className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">گواهی شایستگی و گذراندن دوره</span>
                      <h4 className="text-sm font-bold text-slate-900">{cert.user_name}</h4>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded">
                    نمره: {cert.grade} از ۱۰۰
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="font-semibold text-slate-900">{cert.course_title}</div>
                  <div>مدت دوره: <span className="font-mono">{cert.duration_hours} ساعت</span></div>
                  <div>شماره گواهینامه: <span className="font-mono text-slate-900 font-semibold">{cert.certificate_number}</span></div>
                  <div>کد استاندارد: <span className="font-mono text-emerald-700">{cert.iso_compliance_code}</span></div>
                  <div>مدرس دوره: {cert.instructor_name}</div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono tabular-nums">{cert.issue_date.split('T')[0]}</span>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>چاپ رسمی گواهی</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {isTnaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">ثبت فرم نیازسنجی آموزشی شایستگی (TNA)</h3>
              <button onClick={() => setIsTnaModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateTNA} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">کد سند نیازسنجی *</label>
                  <input
                    type="text"
                    required
                    value={tnaCode}
                    onChange={(e) => setTnaCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">واحد سازمانی *</label>
                  <input
                    type="text"
                    required
                    value={tnaDept}
                    onChange={(e) => setTnaDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">عناوین مشاغل هدف (جداشده با ویرگول)</label>
                <input
                  type="text"
                  value={tnaJobTitles}
                  onChange={(e) => setTnaJobTitles(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">شکاف شایستگی شناسایی‌شده *</label>
                <textarea
                  rows={2}
                  required
                  value={tnaGap}
                  onChange={(e) => setTnaGap(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="شرح مهارت‌ها یا استانداردهایی که پرسنل در آن نیازمند ارتقا هستند..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">عنوان دوره آموزشی پیشنهادی *</label>
                <input
                  type="text"
                  required
                  value={tnaCourse}
                  onChange={(e) => setTnaCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="مثال: دوره تخصصی ممیزی داخلی سیستم مدیریت کیفیت"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">تعداد پرسنل هدف</label>
                  <input
                    type="number"
                    value={tnaTrainees}
                    onChange={(e) => setTnaTrainees(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">اولویت سازمانی</label>
                  <select
                    value={tnaPriority}
                    onChange={(e) => setTnaPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="high">بالا (الزام ممیزی / فوری)</option>
                    <option value="medium">متوسط (توسعه دوره‌ای)</option>
                    <option value="low">پایین (عمومی)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTnaModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  ثبت در ماتریس TNA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">صدور گواهینامه رسمی ISO 10015</h3>
              <button onClick={() => setIsCertModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleIssueCert} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">فراگیر واجد شرایط</label>
                <select
                  value={certLearnerId}
                  onChange={(e) => setCertLearnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  {db.getUsers().filter(u => u.role === 'learner').map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">دوره گذرانده شده</label>
                <select
                  value={certCourseId}
                  onChange={(e) => setCertCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">نمره نهایی فراگیر (از ۱۰۰)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={certGrade}
                  onChange={(e) => setCertGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  صدور گواهینامه معتبر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
