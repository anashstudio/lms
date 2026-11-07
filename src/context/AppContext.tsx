import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SystemSettings, AppModule, PermissionAction, RolePermissionsMap } from '../types/models';
import { db } from '../db/database';
import { DEFAULT_ROLE_PERMISSIONS, checkPermission } from '../utils/rbac';

export type ActiveNavView = 
  | 'dashboard' 
  | 'courses' 
  | 'course_detail'
  | 'content'
  | 'resources' 
  | 'exams' 
  | 'sessions' 
  | 'reports' 
  | 'users' 
  | 'promotions'
  | 'permissions'
  | 'system_updater'
  | 'settings' 
  | 'appearance' 
  | 'sql_console';

export type ResourceCenterTab = 'library' | 'quality_cycle' | 'evaluation';

const RBAC_STORAGE_KEY = 'enterprise_lms_rbac_matrix_v1';
const AUTH_SESSION_KEY = 'enterprise_lms_auth_session_v2';

interface AppContextType {
  settings: SystemSettings;
  updateSettings: (updates: Partial<SystemSettings>) => void;
  isAuthenticated: boolean;
  login: (identifier: string, passwordAttempt: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => boolean;
  activeUser: User;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  switchUser: (user: User) => void;
  activeView: ActiveNavView;
  setActiveView: (view: ActiveNavView) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  isSetupModalOpen: boolean;
  setIsSetupModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  resourceTab: ResourceCenterTab;
  setResourceTab: (tab: ResourceCenterTab) => void;
  navigateToResourceCenter: (tab?: ResourceCenterTab) => void;
  rolePermissions: RolePermissionsMap;
  updateRolePermission: (role: UserRole, module: AppModule, action: PermissionAction, allowed: boolean) => void;
  updateUserCustomPermission: (userId: string, module: AppModule, action: PermissionAction, allowed: boolean) => void;
  resetRolePermissions: () => void;
  hasPermission: (module: AppModule, action: PermissionAction) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => db.getSettings());
  const [users, setUsers] = useState<User[]>(() => db.getUsers());

  // بازیابی نشست احراز هویت شده (Authentication Session)
  const [authSession, setAuthSession] = useState<{ userId: string; token: string; rememberMe: boolean } | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [activeUser, setActiveUser] = useState<User>(() => {
    const all = db.getUsers();
    if (authSession?.userId) {
      const matched = all.find(u => u.id === authSession.userId);
      if (matched) return matched;
    }
    return all.find(u => u.role === 'super_admin') || all[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authSession !== null && db.getUserById(authSession.userId) !== undefined;
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => activeUser?.role || 'super_admin');
  const [activeView, setActiveViewState] = useState<ActiveNavView>('dashboard');
  const [resourceTab, setResourceTab] = useState<ResourceCenterTab>('library');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(() => !settings.is_installed);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(() => {
    try {
      const stored = localStorage.getItem(RBAC_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  });

  const savePermissions = (perms: RolePermissionsMap) => {
    setRolePermissions(perms);
    try {
      localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(perms));
    } catch (e) {
      console.error(e);
    }
  };

  const updateRolePermission = (role: UserRole, module: AppModule, action: PermissionAction, allowed: boolean) => {
    const updated = JSON.parse(JSON.stringify(rolePermissions)) as RolePermissionsMap;
    if (!updated[role]) {
      updated[role] = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[role]));
    }
    if (!updated[role][module]) {
      updated[role][module] = { view: false, create: false, edit: false, delete: false, export: false };
    }
    updated[role][module][action] = allowed;
    savePermissions(updated);
    db.logAudit(activeUser.full_name, activeRole, 'تغییر مجوزهای نقش', 'permissions', `مجوز ${action} برای ماژول ${module} در نقش ${role} به ${allowed ? 'مجاز' : 'غیرمجاز'} تغییر یافت.`);
    triggerRefresh();
  };

  const updateUserCustomPermission = (userId: string, module: AppModule, action: PermissionAction, allowed: boolean) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const customs = targetUser.custom_permissions || {};
    if (!customs[module]) {
      customs[module] = {};
    }
    customs[module]![action] = allowed;
    const updatedUser = db.updateUser(userId, { custom_permissions: customs });
    if (updatedUser) {
      setUsers(db.getUsers());
      if (activeUser.id === userId) {
        setActiveUser(updatedUser);
      }
      db.logAudit(activeUser.full_name, activeRole, 'تعریف دسترسی سفارشی کاربر', 'permissions', `دسترسی ${action} ماژول ${module} برای ${targetUser.full_name} تنظیم شد.`);
    }
  };

  const resetRolePermissions = () => {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
    savePermissions(defaults);
    db.logAudit(activeUser.full_name, activeRole, 'بازنشانی مجوزها', 'permissions', 'تمام مجوزهای سیستم به مقادیر پیش‌فرض بازنشانی شدند.');
    triggerRefresh();
  };

  const hasPermission = (module: AppModule, action: PermissionAction): boolean => {
    return checkPermission(activeUser, rolePermissions, module, action);
  };

  const setActiveView = (view: ActiveNavView | 'iso10015' | 'kirkpatrick') => {
    if ((view as any) === 'iso10015') {
      setResourceTab('quality_cycle');
      setActiveViewState('resources');
      return;
    }
    if ((view as any) === 'kirkpatrick') {
      setResourceTab('evaluation');
      setActiveViewState('resources');
      return;
    }

    if (view === 'settings' || view === 'appearance' || view === 'sql_console' || view === 'system_updater' || view === 'permissions') {
      const allowedModule: AppModule = 
        view === 'system_updater' ? 'system_updater' :
        view === 'permissions' ? 'permissions' :
        view === 'sql_console' ? 'sql_console' : 'settings';

      if (!hasPermission(allowedModule, 'view')) {
        setActiveViewState('dashboard');
        return;
      }
    }

    if (view === 'users' && !hasPermission('users', 'view')) {
      setActiveViewState('dashboard');
      return;
    }

    setActiveViewState(view as ActiveNavView);
  };

  const navigateToResourceCenter = (tab: ResourceCenterTab = 'library') => {
    setResourceTab(tab);
    setActiveViewState('resources');
  };

  const triggerRefresh = () => {
    setSettings(db.getSettings());
    setUsers(db.getUsers());
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUpdateSettings = (updates: Partial<SystemSettings>) => {
    const updated = db.updateSettings(updates);
    setSettings(updated);
  };

  const handleSwitchRole = (role: UserRole) => {
    setActiveRole(role);
    const candidate = users.find(u => u.role === role);
    if (candidate) {
      setActiveUser(candidate);
    }
    if (role !== 'super_admin' && (activeView === 'settings' || activeView === 'appearance' || activeView === 'sql_console' || activeView === 'system_updater' || activeView === 'permissions')) {
      setActiveViewState('dashboard');
    }
  };

  const handleSwitchUser = (user: User) => {
    setActiveUser(user);
    setActiveRole(user.role);
    if (user.role !== 'super_admin' && (activeView === 'settings' || activeView === 'appearance' || activeView === 'sql_console' || activeView === 'system_updater' || activeView === 'permissions')) {
      setActiveViewState('dashboard');
    }
  };

  const handleLogin = (identifier: string, passwordAttempt: string, rememberMe = true): { success: boolean; error?: string } => {
    const user = db.authenticateUser(identifier, passwordAttempt);
    if (!user) {
      return { success: false, error: 'نام کاربری/کد ملی یا رمز عبور اشتباه است.' };
    }

    const sessionData = {
      userId: user.id,
      token: `token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      rememberMe
    };

    try {
      if (rememberMe) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      } else {
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch (e) {
      console.error(e);
    }

    setAuthSession(sessionData);
    setActiveUser(user);
    setActiveRole(user.role);
    setIsAuthenticated(true);
    setActiveViewState('dashboard');
    return { success: true };
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch (e) {
      console.error(e);
    }
    setAuthSession(null);
    setIsAuthenticated(false);
  };

  const handleChangePassword = (oldPass: string, newPass: string): boolean => {
    if (!activeUser) return false;
    const ok = db.changeUserPassword(activeUser.id, oldPass, newPass);
    if (ok) {
      const updated = db.getUserById(activeUser.id);
      if (updated) setActiveUser(updated);
      triggerRefresh();
    }
    return ok;
  };

  useEffect(() => {
    if (!settings.is_installed) {
      setIsSetupModalOpen(true);
    }
  }, [settings.is_installed]);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings: handleUpdateSettings,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        changePassword: handleChangePassword,
        activeUser,
        activeRole,
        switchRole: handleSwitchRole,
        switchUser: handleSwitchUser,
        activeView,
        setActiveView,
        selectedCourseId,
        setSelectedCourseId,
        isSetupModalOpen,
        setIsSetupModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        refreshTrigger,
        triggerRefresh,
        resourceTab,
        setResourceTab,
        navigateToResourceCenter,
        rolePermissions,
        updateRolePermission,
        updateUserCustomPermission,
        resetRolePermissions,
        hasPermission
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
