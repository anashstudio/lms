import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Briefcase, 
  Building2, 
  Award, 
  BookOpen, 
  CheckCircle,
  Save
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const { 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    activeUser, 
    settings, 
    changePassword,
    triggerRefresh 
  } = useApp();

  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'certificates' | 'security'>('info');
  const [phone, setPhone] = useState(activeUser.phone);
  const [email, setEmail] = useState(activeUser.email);
  const [jobTitle, setJobTitle] = useState(activeUser.job_title);
  const [department, setDepartment] = useState(activeUser.department);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // تغییر رمز عبور
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isProfileModalOpen) return null;

  const enrollments = db.getEnrollments(activeUser.id);
  const certificates = db.getCertificates(activeUser.id);
  const courses = db.getCourses();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateUser(activeUser.id, {
      phone,
      email,
      job_title: jobTitle,
      department
    });
    setSavedSuccess(true);
    triggerRefresh();
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!oldPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'لطفاً تمامی فیلدهای رمز عبور را تکمیل فرمایید.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'رمز عبور جدید و تکرار آن یکسان نیستند.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
      return;
    }

    const success = changePassword(oldPassword, newPassword);
    if (success) {
      setPasswordMsg({ type: 'success', text: 'رمز عبور با موفقیت تغییر یافت.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: 'رمز عبور فعلی نادرست است.' });
    }
  };

  const roleNameMap: Record<string, string> = {
    super_admin: 'مدیر ارشد سامانه و آموزش',
    class_manager: 'مدیر هماهنگی کلاس‌ها و دوره‌ها',
    instructor: 'مدرس و استاد آموزشی',
    learner: 'فراگیر / دانش‌پذیر سازمانی'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {}
        <div className={`p-6 ${theme.primary} text-white relative`}>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-4 left-4 p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border-2 border-white/40">
              {activeUser.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{activeUser.full_name}</h2>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
                  {roleNameMap[activeUser.role]}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1">
                {activeUser.job_title} · {activeUser.department}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'info'
                ? `border-slate-900 text-slate-900 font-bold`
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            مشخصات فردی و شغلی
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security'
                ? `border-slate-900 text-slate-900 font-bold`
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>امنیت و رمز عبور</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'courses'
                ? `border-slate-900 text-slate-900 font-bold`
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            دوره‌ها و پیشرفت آموزشی ({enrollments.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'certificates'
                ? `border-slate-900 text-slate-900 font-bold`
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            گواهینامه‌های رسمی ISO ({certificates.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {activeTab === 'info' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">نام کاربری سازمانی (Username)</label>
                  <div className="flex items-center justify-between p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-900 font-mono">
                    <span className="font-bold">{activeUser.username || '---'}</span>
                    <span className="text-[10px] text-sky-600 font-sans">شناسه لاگین</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">کد ملی ۱۰ رقمی (National ID)</label>
                  <div className="flex items-center justify-between p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono">
                    <span className="font-bold">{activeUser.national_id}</span>
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">پست الکترونیکی</label>
                  <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded-lg focus-within:ring-1 focus-within:ring-emerald-500">
                    <Mail className="w-4 h-4 text-slate-400 mr-1" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">تلفن همراه</label>
                  <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded-lg focus-within:ring-1 focus-within:ring-emerald-500">
                    <Phone className="w-4 h-4 text-slate-400 mr-1" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-slate-800 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">سمت سازمانی</label>
                  <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded-lg focus-within:ring-1 focus-within:ring-emerald-500">
                    <Briefcase className="w-4 h-4 text-slate-400 mr-1" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">واحد سازمانی</label>
                  <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded-lg focus-within:ring-1 focus-within:ring-emerald-500">
                    <Building2 className="w-4 h-4 text-slate-400 mr-1" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>تغییرات پروفایل با موفقیت ذخیره شد.</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره مشخصات</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md mx-auto">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 text-[11px] leading-relaxed">
                جهت حفظ امنیت حساب کاربری در سامانه یادگیری، از انتخاب رمزهای ساده و تکراری خودداری فرمایید. رمز عبور باید حداقل ۶ نویسه باشد.
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">رمز عبور فعلی *</label>
                <input
                  type="password"
                  dir="ltr"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">رمز عبور جدید *</label>
                <input
                  type="password"
                  dir="ltr"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">تکرار رمز عبور جدید *</label>
                <input
                  type="password"
                  dir="ltr"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تکرار رمز جدید"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-lg font-bold shadow-sm transition-colors"
                >
                  ثبت تغییر رمز عبور
                </button>
              </div>
            </form>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-3">
              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  درحال حاضر در هیچ دوره‌ای ثبت‌نام نشده است.
                </div>
              ) : (
                enrollments.map(enr => {
                  const course = courses.find(c => c.id === enr.course_id);
                  return (
                    <div
                      key={enr.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {course?.title || 'عنوان دوره نامشخص'}
                          </h4>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
                          <span>پیشرفت: <strong className="text-slate-800 font-mono">{enr.progress_percent}٪</strong></span>
                          <span>حضور و غیاب: <strong className="text-slate-800 font-mono">{enr.attendance_percent}٪</strong></span>
                          {enr.final_grade && (
                            <span>نمره نهایی: <strong className="text-emerald-700 font-mono">{enr.final_grade}</strong></span>
                          )}
                        </div>
                      </div>

                      <span className={`text-[11px] px-2.5 py-1 rounded font-medium shrink-0 ${
                        enr.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {enr.status === 'completed' ? 'تکمیل شده' : 'درحال آموزش'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-3">
              {certificates.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  گواهینامه رسمی ثبت‌شده‌ای برای این کاربر یافت نشد.
                </div>
              ) : (
                certificates.map(cert => (
                  <div
                    key={cert.id}
                    className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <Award className="w-6 h-6 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{cert.course_title}</h4>
                        <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                          <div>شماره گواهی: <span className="font-mono text-slate-800 font-semibold">{cert.certificate_number}</span></div>
                          <div>کد انطباق استاندارد: <span className="font-mono text-emerald-700">{cert.iso_compliance_code}</span></div>
                          <div>نمره نهایی: <span className="font-mono font-bold text-slate-900">{cert.grade} از ۱۰۰</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold block mb-2">
                        دارای اعتبار رسمی
                      </span>
                      <button
                        onClick={() => window.print()}
                        className="text-xs text-slate-700 hover:text-slate-900 font-medium underline"
                      >
                        چاپ گواهی
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
