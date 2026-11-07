import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { CourseList } from './components/courses/CourseList';
import { CourseDetail } from './components/courses/CourseDetail';
import { ContentManager } from './components/content/ContentManager';
import { ResourceAndStandardsCenter } from './components/resources/ResourceAndStandardsCenter';
import { ExamList } from './components/exams/ExamList';
import { ExamTakerModal } from './components/exams/ExamTakerModal';
import { SessionsCenter } from './components/sessions/SessionsCenter';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { EnterpriseControlPanel } from './components/settings/EnterpriseControlPanel';
import { UserManagement } from './components/users/UserManagement';
import { SuperAdminAppearance } from './components/settings/SuperAdminAppearance';
import { SQLConsole } from './components/sql/SQLConsole';
import { SetupWizard } from './components/setup/SetupWizard';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { PermissionsMatrix } from './components/permissions/PermissionsMatrix';
import { SystemUpdaterCenter } from './components/updater/SystemUpdaterCenter';
import { PromotionCenter } from './components/promotions/PromotionCenter';
import { LoginView } from './components/auth/LoginView';

const MainLayout: React.FC = () => {
  const {
    settings,
    isAuthenticated,
    activeView,
    setActiveView,
    selectedCourseId,
    setSelectedCourseId,
    isSetupModalOpen,
    setIsSetupModalOpen
  } = useApp();

  const [takingExamId, setTakingExamId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <TopBar />

      <div className="flex-1 w-full max-w-[1700px] mx-auto flex flex-col">
        <main className="flex-1 p-3 sm:p-5 min-w-0">
          {activeView === 'dashboard' && <Dashboard />}

          {activeView === 'courses' && (
            <CourseList
              onSelectCourse={(id) => {
                setSelectedCourseId(id);
                setActiveView('course_detail');
              }}
            />
          )}

          {activeView === 'course_detail' && selectedCourseId && (
            <CourseDetail
              courseId={selectedCourseId}
              onBack={() => setActiveView('courses')}
              onTakeExam={(examId) => setTakingExamId(examId)}
            />
          )}

          {activeView === 'content' && <ContentManager />}

          {activeView === 'resources' && <ResourceAndStandardsCenter />}

          {activeView === 'exams' && (
            <ExamList onTakeExam={(examId) => setTakingExamId(examId)} />
          )}

          {activeView === 'sessions' && <SessionsCenter />}

          {activeView === 'reports' && <ReportsCenter />}

          {activeView === 'users' && <UserManagement />}
          
          {activeView === 'promotions' && <PromotionCenter />}

          {activeView === 'permissions' && <PermissionsMatrix />}

          {activeView === 'system_updater' && <SystemUpdaterCenter />}

          {activeView === 'settings' && <EnterpriseControlPanel />}

          {activeView === 'appearance' && <SuperAdminAppearance />}

          {activeView === 'sql_console' && <SQLConsole />}
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{settings.footer_text || 'کلیه حقوق مادی و معنوی متعلق به سامانه یادگیری و ارتقای شایستگی‌های شغلی می‌باشد.'}</span>
          <span className="text-[11px] text-slate-400">
            سامانه جامع آموزش، ارزیابی مستمر و آزمون‌های الکترونیکی
          </span>
        </div>
      </footer>

      <SetupWizard
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

      <UserProfileModal />

      {takingExamId && (
        <ExamTakerModal
          examId={takingExamId}
          onClose={() => setTakingExamId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
