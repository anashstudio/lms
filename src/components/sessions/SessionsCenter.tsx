import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { ClassSession, Course } from '../../types/models';
import { THEME_CONFIGS } from '../../utils/theme';
import { PersianDatePicker } from '../common/PersianDatePicker';
import {
  Video,
  Radio,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  PlayCircle,
  Edit2,
  Trash2,
  X,
  Building2,
  Activity
} from 'lucide-react';

export const SessionsCenter: React.FC = () => {
  const { settings, activeRole, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [sessions, setSessions] = useState<ClassSession[]>(() => db.getSessions());
  const [courses] = useState<Course[]>(() => db.getCourses());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
  const [sessionCode, setSessionCode] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionCourseId, setSessionCourseId] = useState(courses[0]?.id || '');
  const [sessionBranch, setSessionBranch] = useState(settings.org_name || 'مرکز آموزش');
  const [sessionStartDate, setSessionStartDate] = useState('۱۴۰۵/۰۲/۰۱');
  const [sessionEndDate, setSessionEndDate] = useState('۱۴۰۵/۰۲/۳۰');
  const [sessionType, setSessionType] = useState<'online_qa' | 'recorded' | 'workshop'>('online_qa');
  const [sessionIsLive, setSessionIsLive] = useState(false);
  const [sessionAttendees, setSessionAttendees] = useState(15);

  const [monitoringSession, setMonitoringSession] = useState<ClassSession | null>(null);

  const reloadSessions = () => {
    setSessions(db.getSessions());
    triggerRefresh();
  };

  const openNewModal = () => {
    setEditingSession(null);
    setSessionCode(`${Math.floor(10 + Math.random() * 90)}`);
    setSessionTitle('');
    setSessionCourseId(courses[0]?.id || '');
    setSessionBranch(settings.org_name || 'مرکز آموزش');
    setSessionStartDate('۱۴۰۵/۰۳/۰۱');
    setSessionEndDate('۱۴۰۵/۰۳/۳۱');
    setSessionType('online_qa');
    setSessionIsLive(false);
    setSessionAttendees(20);
    setIsModalOpen(true);
  };

  const openEditModal = (s: ClassSession) => {
    setEditingSession(s);
    setSessionCode(s.code);
    setSessionTitle(s.title);
    setSessionCourseId(s.course_id);
    setSessionBranch(s.branch);
    setSessionStartDate(s.start_date);
    setSessionEndDate(s.end_date);
    setSessionType(s.session_type);
    setSessionIsLive(s.is_live);
    setSessionAttendees(s.attendees_count);
    setIsModalOpen(true);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle || !sessionCode) return;

    const course = courses.find(c => c.id === sessionCourseId);

    if (editingSession) {
      db.updateSession(editingSession.id, {
        code: sessionCode,
        title: sessionTitle,
        course_id: sessionCourseId,
        course_title: course?.title || 'دوره آموزشی',
        branch: sessionBranch,
        start_date: sessionStartDate,
        end_date: sessionEndDate,
        session_type: sessionType,
        is_live: sessionIsLive,
        attendees_count: Number(sessionAttendees)
      });
    } else {
      const created: ClassSession = {
        id: `ses_${Date.now()}`,
        code: sessionCode,
        title: sessionTitle,
        course_id: sessionCourseId,
        course_title: course?.title || 'دوره آموزشی',
        branch: sessionBranch,
        start_date: sessionStartDate,
        end_date: sessionEndDate,
        session_type: sessionType,
        is_live: sessionIsLive,
        attendees_count: Number(sessionAttendees),
        instructors_count: 1,
        managers_count: 1,
        status: 'active'
      };
      db.addSession(created);
    }

    setIsModalOpen(false);
    reloadSessions();
  };

  const handleDeleteSession = (id: string, title: string) => {
    if (confirm(`آیا از حذف جلسه «${title}» اطمینان دارید؟`)) {
      db.deleteSession(id);
      reloadSessions();
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.includes(searchQuery) || s.code.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesType = typeFilter === 'all' || s.session_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sessionTypeLabel = (t: string) => {
    switch (t) {
      case 'online_qa': return 'جلسه رفع اشکال و پرسش و پاسخ';
      case 'workshop': return 'کارگاه تخصصی و تمرین عملی';
      case 'recorded': return 'کلاس ضبط‌شده و ویدئویی';
      default: return 'جلسه آموزشی';
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-blue-600 animate-pulse" />
            <h1 className="text-xl font-bold text-slate-900">جلسات آموزشی، کلاس‌های آنلاین و ضبط‌شده</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            زمان‌بندی کلاس‌های رفع اشکال، اتاق‌های وبینار آنلاین و مدیریت آرشیو ویدیوهای جلسات
          </p>
        </div>

        {activeRole !== 'learner' && (
          <div className="flex items-center gap-2">
            <button
              onClick={openNewModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>جلسه جدید</span>
            </button>
          </div>
        )}
      </div>

      {}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-lg border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-80 border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو در عنوان یا کد جلسه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none text-slate-800"
          />
        </div>

        {}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'همه جلسات' },
            { id: 'online_qa', label: 'رفع اشکال آنلاین' },
            { id: 'workshop', label: 'کارگاه‌های تعاملی' },
            { id: 'recorded', label: 'ویدیوهای ضبط‌شده' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">کد</th>
                <th className="py-3 px-4">عنوان جلسه</th>
                <th className="py-3 px-4">دوره مربوطه</th>
                <th className="py-3 px-4">شعبه / واحد</th>
                <th className="py-3 px-4">تاریخ شروع</th>
                <th className="py-3 px-4">تاریخ پایان</th>
                <th className="py-3 px-4">دسترسی و ظرفیت</th>
                <th className="py-3 px-4 text-center">وضعیت</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    هیچ جلسه‌ای با مشخصات جستجوشده یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredSessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {session.code}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        {session.is_live && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        )}
                        <span>{session.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {sessionTypeLabel(session.session_type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {session.course_title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {session.branch}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                      {session.start_date}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                      {session.end_date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-mono text-blue-700 font-semibold">
                        {session.attendees_count} فراگیر
                      </span>
                      <span className="text-slate-400 mx-1">|</span>
                      <span>{session.instructors_count} مدرس</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {session.is_live ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                          زنده / فعال
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                          برنامه‌ریزی‌شده
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {}
                        <button
                          onClick={() => setMonitoringSession(session)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                          title="پایش و نظارت کلاسی"
                        >
                          <Activity className="w-3 h-3 text-blue-600" />
                          <span>پایش</span>
                        </button>

                        {activeRole !== 'learner' && (
                          <>
                            <button
                              onClick={() => openEditModal(session)}
                              className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-100 transition-colors"
                              title="ویرایش جلسه"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session.id, session.title)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors"
                              title="حذف جلسه"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingSession ? `ویرایش جلسه کلاسی: ${editingSession.title}` : 'تعریف و زمان‌بندی جلسه آموزشی جدید'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">کد جلسه *</label>
                  <input
                    type="text"
                    required
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">شعبه یا محل برگزاری</label>
                  <input
                    type="text"
                    value={sessionBranch}
                    onChange={(e) => setSessionBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">عنوان جلسه آموزشی *</label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="مثال: جلسه پرسش و پاسخ آنلاین - رفع اشکال"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">دوره مربوطه</label>
                  <select
                    value={sessionCourseId}
                    onChange={(e) => setSessionCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">نوع جلسه</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="online_qa">رفع اشکال آنلاین</option>
                    <option value="workshop">کارگاه تمرین عملی</option>
                    <option value="recorded">کلاس ضبط‌شده آفلاین</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">تاریخ شروع (شمسی)</label>
                  <PersianDatePicker
                    value={sessionStartDate}
                    onChange={setSessionStartDate}
                    placeholder="۱۴۰۵/۰۳/۰۱"
                    className="w-full"
                    inputClassName="w-full text-right"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">تاریخ پایان (شمسی)</label>
                  <PersianDatePicker
                    value={sessionEndDate}
                    onChange={setSessionEndDate}
                    placeholder="۱۴۰۵/۰۳/۳۱"
                    className="w-full"
                    inputClassName="w-full text-right"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  id="isLiveCheck"
                  checked={sessionIsLive}
                  onChange={(e) => setSessionIsLive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isLiveCheck" className="text-slate-800 font-medium cursor-pointer">
                  جلسه در وضعیت آنلاین و آماده ورود کاربران قرار دارد (Live)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
                >
                  ذخیره جلسه در سامانه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {monitoringSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  پایش وضعیت کلاسی: {monitoringSession.title}
                </h3>
              </div>
              <button onClick={() => setMonitoringSession(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1">
                <div className="font-semibold">گزارش لحظه‌ای حضور و پایش:</div>
                <div>تعداد فراگیران آنلاین و حاضر: <strong className="font-mono text-blue-800">{monitoringSession.attendees_count} نفر</strong></div>
                <div>مدرس جلسه: <strong>استاد علی مهدوی</strong></div>
                <div>شعبه تحت نظارت: <strong>{monitoringSession.branch}</strong></div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="font-semibold text-slate-800">شاخص‌های کیفیت ارتباط جلسه:</div>
                <div className="flex justify-between text-slate-600">
                  <span>وضعیت استریم تصویر و صدا:</span>
                  <span className="text-emerald-700 font-bold">پایدار (HD)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>میزان تاخیر شبکه (Latency):</span>
                  <span className="font-mono text-slate-800">42 ms</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>پروتکل رمزنگاری و ثبت رویداد:</span>
                  <span className="font-mono text-slate-800">TLS 1.3 / Verified</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setMonitoringSession(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-xs"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
