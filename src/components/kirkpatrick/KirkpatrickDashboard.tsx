import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { ExcelService } from '../../services/excelService';
import { THEME_CONFIGS } from '../../utils/theme';
import { KirkpatrickEvaluation, Course } from '../../types/models';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  Users,
  Target,
  Calculator,
  Smile,
  GraduationCap,
  Briefcase,
  DollarSign,
  X
} from 'lucide-react';

export const KirkpatrickDashboard: React.FC = () => {
  const { settings, activeRole, activeUser, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | 4>(1);
  const [courses] = useState<Course[]>(() => db.getCourses());
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [evaluations, setEvaluations] = useState<KirkpatrickEvaluation[]>(() => db.getKirkpatrickEvaluations());

  const [isLevel1ModalOpen, setIsLevel1ModalOpen] = useState(false);
  const [surveyCourseId, setSurveyCourseId] = useState(courses[0]?.id || '');
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [instructorScore, setInstructorScore] = useState(5);
  const [materialsScore, setMaterialsScore] = useState(4);
  const [applicabilityScore, setApplicabilityScore] = useState(5);
  const [surveyComments, setSurveyComments] = useState('');

  const [isLevel3ModalOpen, setIsLevel3ModalOpen] = useState(false);
  const [supervisorCourseId, setSupervisorCourseId] = useState(courses[0]?.id || '');
  const [behaviorScore, setBehaviorScore] = useState(4);
  const [workplaceScore, setWorkplaceScore] = useState(5);
  const [supervisorComments, setSupervisorComments] = useState('');

  const [isRoiModalOpen, setIsRoiModalOpen] = useState(false);
  const [roiCourseId, setRoiCourseId] = useState(courses[0]?.id || '');
  const [trainingCost, setTrainingCost] = useState(45000000); 
  const [trainingBenefit, setTrainingBenefit] = useState(135000000); 
  const [kpiImpact, setKpiImpact] = useState(28); 
  const [roiComments, setRoiComments] = useState('صرفه‌جویی در هزینه‌های دوباره‌کاری و کاهش ۳۲٪ زمان ممیزی');

  const reload = () => {
    setEvaluations(db.getKirkpatrickEvaluations());
    triggerRefresh();
  };

  const handleSaveLevel1 = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === surveyCourseId);
    const newEval: KirkpatrickEvaluation = {
      id: `kirk_${Date.now()}`,
      course_id: surveyCourseId,
      course_title: course?.title || 'دوره آموزشی',
      user_id: activeUser.id,
      user_name: activeUser.full_name,
      level: 1,
      respondent_type: 'learner',
      scores: {
        satisfaction: Number(satisfactionScore),
        instructor_rating: Number(instructorScore),
        material_quality: Number(materialsScore),
        applicability: Number(applicabilityScore)
      },
      comments: surveyComments || 'نظرسنجی رضایت با موفقیت ثبت شد.',
      evaluation_date: new Date().toISOString()
    };
    db.addKirkpatrickEvaluation(newEval);
    setIsLevel1ModalOpen(false);
    reload();
  };

  const handleSaveLevel3 = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === supervisorCourseId);
    const newEval: KirkpatrickEvaluation = {
      id: `kirk_${Date.now()}`,
      course_id: supervisorCourseId,
      course_title: course?.title || 'دوره آموزشی',
      user_id: activeUser.id,
      user_name: activeUser.full_name,
      level: 3,
      respondent_type: 'supervisor',
      scores: {
        behavior_change_score: Number(behaviorScore),
        workplace_implementation: Number(workplaceScore)
      },
      comments: supervisorComments || 'ارزیابی رفتار شغلی در محیط کار ثبت شد.',
      evaluation_date: new Date().toISOString()
    };
    db.addKirkpatrickEvaluation(newEval);
    setIsLevel3ModalOpen(false);
    reload();
  };

  const handleSaveLevel4 = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === roiCourseId);
    const calculatedRoi = Math.round(((trainingBenefit - trainingCost) / trainingCost) * 100);

    const newEval: KirkpatrickEvaluation = {
      id: `kirk_${Date.now()}`,
      course_id: roiCourseId,
      course_title: course?.title || 'دوره آموزشی',
      user_id: activeUser.id,
      user_name: activeUser.full_name,
      level: 4,
      respondent_type: 'evaluator',
      scores: {
        kpi_impact_percent: Number(kpiImpact),
        roi_percent: calculatedRoi
      },
      comments: roiComments,
      evaluation_date: new Date().toISOString()
    };
    db.addKirkpatrickEvaluation(newEval);
    setIsRoiModalOpen(false);
    reload();
  };

  const filteredEvals = evaluations.filter(e => {
    const matchesCourse = selectedCourseId === 'all' || e.course_id === selectedCourseId;
    const matchesLevel = e.level === activeLevel;
    return matchesCourse && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">سنجش اثربخشی آموزش به روش مدل ۴ سطحی کرک‌پاتریک</h1>
          <p className="text-xs text-slate-500 mt-1">
            ارزیابی استاندارد واکنش، یادگیری، رفتار در محیط کار و نتایج سازمانی و بازگشت سرمایه (ROI)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => ExcelService.exportKirkpatrickReport(evaluations)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>خروجی جامع اکسل (۴ سطح)</span>
          </button>
        </div>
      </div>

      {}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">فیلتر دوره آموزشی:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="all">تمامی دوره‌ها و کلاس‌ها</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500">
          تعداد ارزیابی‌های ثبت‌شده: <strong className="font-mono text-slate-800">{evaluations.length}</strong> رکورد
        </span>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            level: 1 as const,
            title: 'سطح ۱: واکنش (Reaction)',
            desc: 'میزان رضایت، درک محتوا و جذابیت تدریس مدرس',
            metric: '۴.۸ از ۵',
            sub: 'میانگین رضایت فراگیران',
            icon: Smile,
            color: 'emerald'
          },
          {
            level: 2 as const,
            title: 'سطح ۲: یادگیری (Learning)',
            desc: 'مقایسه نمرات پیش‌آزمون و پس‌آزمون دوره‌ها',
            metric: '+۴۵٪',
            sub: 'رشد میانگین یادگیری مهارت',
            icon: GraduationCap,
            color: 'blue'
          },
          {
            level: 3 as const,
            title: 'سطح ۳: رفتار (Behavior)',
            desc: 'به‌کارگیری دانش در شغل توسط سرپرست مستقیم',
            metric: '۴.۶ از ۵',
            sub: 'تحقق شایستگی در محیط کار',
            icon: Briefcase,
            color: 'indigo'
          },
          {
            level: 4 as const,
            title: 'سطح ۴: نتایج و ROI (Results)',
            desc: 'کاهش خطاها و بازگشت سرمایه آموزش سازمانی',
            metric: '۲۴۰٪',
            sub: 'ضریب بازگشت مالی (ROI)',
            icon: DollarSign,
            color: 'amber'
          }
        ].map(item => {
          const Icon = item.icon;
          const isCurrent = activeLevel === item.level;
          return (
            <div
              key={item.level}
              onClick={() => setActiveLevel(item.level)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isCurrent
                  ? 'border-slate-800 bg-white ring-2 ring-slate-800 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{item.title}</span>
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`} />
              </div>
              <p className="text-[11px] text-slate-500 mb-3">{item.desc}</p>
              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900">{item.metric}</span>
                <span className="text-[10px] text-slate-400">{item.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {activeLevel === 1 && 'ارزیابی سطح ۱: نظرسنجی و واکنش فراگیران (Reaction Evaluation)'}
              {activeLevel === 2 && 'ارزیابی سطح ۲: سنجش دانش و رشد یادگیری (Learning Evaluation)'}
              {activeLevel === 3 && 'ارزیابی سطح ۳: سنجش رفتار در محیط کار (Behavior Evaluation)'}
              {activeLevel === 4 && 'ارزیابی سطح ۴: نتایج کسب‌وکار و محاسبه بازگشت سرمایه (Results & ROI)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeLevel === 1 && 'پرسشنامه‌های طیف ۵ گزینه‌ای لیکرت تکمیل‌شده پس از اتمام دوره'}
              {activeLevel === 2 && 'مقایسه عملکرد شرکت‌کنندگان در پیش‌آزمون و پس‌آزمون نهایی دوره'}
              {activeLevel === 3 && 'ارزیابی میدانی سرپرست مستقیم پس از گذشت ۳۰ تا ۹۰ روز از اتمام آموزش'}
              {activeLevel === 4 && 'سنجش بهبود شاخص‌های بهره‌وری، کاهش حوادث و سودآوری سازمان'}
            </p>
          </div>

          <div>
            {activeLevel === 1 && (
              <button
                onClick={() => setIsLevel1ModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت فرم نظرسنجی واکنش (فراگیر)</span>
              </button>
            )}

            {activeLevel === 3 && (
              <button
                onClick={() => setIsLevel3ModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت ارزیابی رفتار شغلی (سرپرست)</span>
              </button>
            )}

            {activeLevel === 4 && (
              <button
                onClick={() => setIsRoiModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Calculator className="w-4 h-4" />
                <span>محاسبه‌گر ROI و شاخص‌های نتیجه</span>
              </button>
            )}
          </div>
        </div>

        {}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">عنوان دوره</th>
                <th className="py-3 px-4">شخص ارزیابی‌شونده / ارزیاب</th>
                {activeLevel === 1 && (
                  <>
                    <th className="py-3 px-4">رضایت کلی</th>
                    <th className="py-3 px-4">کیفیت تدریس</th>
                    <th className="py-3 px-4">کیفیت منابع</th>
                    <th className="py-3 px-4">کاربردی بودن</th>
                  </>
                )}
                {activeLevel === 2 && (
                  <>
                    <th className="py-3 px-4">پیش‌آزمون</th>
                    <th className="py-3 px-4">پس‌آزمون</th>
                    <th className="py-3 px-4">رشد یادگیری</th>
                  </>
                )}
                {activeLevel === 3 && (
                  <>
                    <th className="py-3 px-4">تغییر رفتار شغلی</th>
                    <th className="py-3 px-4">اجرا در محیط کار</th>
                  </>
                )}
                {activeLevel === 4 && (
                  <>
                    <th className="py-3 px-4">بهبود KPI سازمانی</th>
                    <th className="py-3 px-4">ضریب بازگشت سرمایه (ROI)</th>
                  </>
                )}
                <th className="py-3 px-4">دیدگاه / تحلیل</th>
                <th className="py-3 px-4">تاریخ ثبت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    رکوردی برای این سطح ارزیابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredEvals.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.course_title}</td>
                    <td className="py-3 px-4 text-slate-600">{item.user_name}</td>
                    {activeLevel === 1 && (
                      <>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{item.scores.satisfaction} / ۵</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{item.scores.instructor_rating} / ۵</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{item.scores.material_quality} / ۵</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{item.scores.applicability} / ۵</td>
                      </>
                    )}
                    {activeLevel === 2 && (
                      <>
                        <td className="py-3 px-4 font-mono text-slate-600">{item.scores.pre_test_score}٪</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.scores.post_test_score}٪</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          +{(item.scores.post_test_score || 0) - (item.scores.pre_test_score || 0)}٪
                        </td>
                      </>
                    )}
                    {activeLevel === 3 && (
                      <>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">{item.scores.behavior_change_score} / ۵</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{item.scores.workplace_implementation} / ۵</td>
                      </>
                    )}
                    {activeLevel === 4 && (
                      <>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">+{item.scores.kpi_impact_percent}٪</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-700">{item.scores.roi_percent}٪</td>
                      </>
                    )}
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{item.comments}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {item.evaluation_date.split('T')[0]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {isLevel1ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">نظرسنجی ارزیابی واکنش (سطح ۱ کرک‌پاتریک)</h3>
              <button onClick={() => setIsLevel1ModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveLevel1} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">دوره آموزشی</label>
                <select
                  value={surveyCourseId}
                  onChange={(e) => setSurveyCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 font-medium">میزان رضایت کلی از دوره:</span>
                    <strong className="font-mono text-emerald-700">{satisfactionScore} از ۵</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={satisfactionScore}
                    onChange={(e) => setSatisfactionScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 font-medium">تسلط و نحوه تدریس مدرس:</span>
                    <strong className="font-mono text-emerald-700">{instructorScore} از ۵</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={instructorScore}
                    onChange={(e) => setInstructorScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 font-medium">کیفیت اسلایدها و منابع تکمیلی:</span>
                    <strong className="font-mono text-emerald-700">{materialsScore} از ۵</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={materialsScore}
                    onChange={(e) => setMaterialsScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 font-medium">کاربردی بودن محتوا در وظایف شغلی:</span>
                    <strong className="font-mono text-emerald-700">{applicabilityScore} از ۵</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={applicabilityScore}
                    onChange={(e) => setApplicabilityScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">نظرات و پیشنهادات جهت بهبود:</label>
                <textarea
                  rows={2}
                  value={surveyComments}
                  onChange={(e) => setSurveyComments(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="دیدگاه‌های خود را بنویسید..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLevel1ModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  ثبت نظرسنجی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isLevel3ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">ارزیابی رفتار شغلی در محیط کار (سطح ۳)</h3>
              <button onClick={() => setIsLevel3ModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveLevel3} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">دوره آموزشی گذرانده شده</label>
                <select
                  value={supervisorCourseId}
                  onChange={(e) => setSupervisorCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 font-medium">میزان تغییر مثبت در رفتار و عملکرد شاغل:</span>
                    <strong className="font-mono text-indigo-700">{behaviorScore} از ۵</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={behaviorScore}
                    onChange={(e) => setBehaviorScore(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 font-medium">پیاده‌سازی چک‌لیست‌ها و دستورالعمل‌های نوین:</span>
                    <strong className="font-mono text-indigo-700">{workplaceScore} از ۵</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={workplaceScore}
                    onChange={(e) => setWorkplaceScore(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">ارزیابی کیفی سرپرست مستقیم:</label>
                <textarea
                  rows={2}
                  value={supervisorComments}
                  onChange={(e) => setSupervisorComments(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="مشاهدات عینی سرپرست از پیاده‌سازی مهارت‌ها..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLevel3ModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  ثبت ارزیابی سرپرست
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isRoiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">محاسبه بازگشت سرمایه آموزشی (ROI سطح ۴)</h3>
              <button onClick={() => setIsRoiModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveLevel4} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">دوره آموزشی</label>
                <select
                  value={roiCourseId}
                  onChange={(e) => setRoiCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">هزینه کل دوره (تومان)</label>
                  <input
                    type="number"
                    value={trainingCost}
                    onChange={(e) => setTrainingCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">منافع ملموس حاصله (تومان)</label>
                  <input
                    type="number"
                    value={trainingBenefit}
                    onChange={(e) => setTrainingBenefit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">درصد بهبود شاخص‌های کلیدی (KPI)</label>
                <input
                  type="number"
                  value={kpiImpact}
                  onChange={(e) => setKpiImpact(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  placeholder="مثال: ۲۵٪ کاهش خطای ممیزی"
                />
              </div>

              {}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center justify-between">
                <span>ضریب بازگشت سرمایه تخمینی:</span>
                <strong className="text-base font-mono font-bold">
                  {Math.round(((trainingBenefit - trainingCost) / trainingCost) * 100)}٪
                </strong>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">مستندات و توضیحات شاخص‌های مالی:</label>
                <textarea
                  rows={2}
                  value={roiComments}
                  onChange={(e) => setRoiComments(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoiModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  محاسبه و ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
