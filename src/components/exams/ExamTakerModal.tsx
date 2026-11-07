import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import { Exam, Question, ExamAttempt } from '../../types/models';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Printer,
  Sparkles
} from 'lucide-react';

interface ExamTakerModalProps {
  examId: string;
  onClose: () => void;
}

export const ExamTakerModal: React.FC<ExamTakerModalProps> = ({ examId, onClose }) => {
  const { activeUser, settings, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const exam = db.getExamById(examId);
  const questions: Question[] = exam ? db.getQuestionsByExam(exam.id) : [];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => (exam?.duration_minutes || 20) * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [attemptResult, setAttemptResult] = useState<ExamAttempt | null>(null);

  useEffect(() => {
    if (isFinished || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, timeLeftSeconds]);

  if (!exam || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
          <p className="text-xs text-slate-600 mb-4">آزمون مورد نظر یا سوالات آن در پایگاه‌داده یافت نشد.</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
            بستن
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIndex
    }));
  };

  const handleSubmitExam = () => {
    let earnedScore = 0;
    let totalScore = 0;

    questions.forEach(q => {
      totalScore += q.score_weight;
      if (selectedAnswers[q.id] === q.correct_option_index) {
        earnedScore += q.score_weight;
      }
    });

    const percent = Math.round((earnedScore / totalScore) * 100);
    const passed = percent >= exam.passing_score;

    const attempt: ExamAttempt = {
      id: `att_${Date.now()}`,
      exam_id: exam.id,
      user_id: activeUser.id,
      user_name: activeUser.full_name,
      score: earnedScore,
      total_score: totalScore,
      passed,
      submitted_at: new Date().toISOString(),
      answers: selectedAnswers,
      feedback: passed 
        ? `تبریک! آزمون با موفقیت گذرانده شد و ارزیابی سطح ۲ کرک‌پاتریک با نمره ${percent}٪ ثبت گردید.` 
        : `نمره شما ${percent}٪ می‌باشد که از حدنصاب قبولی (${exam.passing_score}٪) کمتر است.`
    };

    const saved = db.recordExamAttempt(attempt);
    setAttemptResult(saved);
    setIsFinished(true);
    triggerRefresh();
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] text-emerald-700 font-medium block">
              {exam.exam_type === 'pre_test' ? 'پیش‌آزمون اولیه' : 'سنجش یادگیری (سطح ۲ کرک‌پاتریک)'}
            </span>
            <h2 className="text-sm font-bold text-slate-900">{exam.title}</h2>
          </div>

          <div className="flex items-center gap-4">
            {!isFinished && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeFormatted}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {}
        <div className="p-6">
          {isFinished && attemptResult ? (

            <div className="text-center py-6 space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                attemptResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {attemptResult.passed ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {attemptResult.passed ? 'آزمون با موفقیت به پایان رسید' : 'آزمون پایان یافت'}
              </h3>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">نمره کسب‌شده:</span>
                  <strong className="font-mono text-slate-900 text-sm">
                    {attemptResult.score} از {attemptResult.total_score}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">درصد نهایی:</span>
                  <strong className="font-mono text-emerald-700 text-sm">
                    {Math.round((attemptResult.score / attemptResult.total_score) * 100)}٪
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">وضعیت:</span>
                  <span className={attemptResult.passed ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {attemptResult.passed ? 'قبول در آزمون' : 'نیازمند مطالعه تکمیلی'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {attemptResult.feedback}
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ کارنامه</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  بستن و بازگشت
                </button>
              </div>
            </div>
          ) : (

            <div className="space-y-6">
              {}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>سوال <strong className="font-mono text-slate-900">{currentIndex + 1}</strong> از <strong className="font-mono text-slate-900">{questions.length}</strong></span>
                <span>بارم نمره: <strong className="font-mono text-slate-800">{currentQ.score_weight} نمره</strong></span>
              </div>

              {}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 leading-relaxed">
                  {currentQ.question_text}
                </h3>

                {}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === oIdx;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center gap-3 text-xs ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-sm font-semibold text-slate-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0 ${
                          isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-slate-500'
                        }`}>
                          {oIdx + 1}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>سوال قبلی</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>سوال بعدی</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>پایان و ثبت آزمون</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
