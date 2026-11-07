export type UserRole = 'super_admin' | 'class_manager' | 'instructor' | 'learner';

export type AppModule = 
  | 'courses'
  | 'exams'
  | 'resources'
  | 'sessions'
  | 'reports'
  | 'users'
  | 'permissions'
  | 'settings'
  | 'system_updater'
  | 'sql_console';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export';

export type ModulePermissions = Record<PermissionAction, boolean>;

export type RolePermissionsMap = Record<UserRole, Record<AppModule, ModulePermissions>>;

export interface UserPermissionOverride {
  userId: string;
  permissions: Partial<Record<AppModule, Partial<Record<PermissionAction, boolean>>>>;
}

export interface User {
  id: string;
  username: string; // نام کاربری مستقل و منحصر به فرد
  national_id: string; // کد ملی ۱۰ رقمی مستقل
  employee_id?: string;
  password?: string; // رمز عبور سامانه
  password_hash?: string; // هش امنیتی رمز عبور
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  job_title: string;
  status: 'active' | 'inactive';
  avatar_url?: string;
  created_at: string;
  last_login_at?: string;
  custom_permissions?: Partial<Record<AppModule, Partial<Record<PermissionAction, boolean>>>>;
}

export interface AuthSession {
  userId: string;
  token: string;
  loginAt: string;
  expiresAt: string;
  rememberMe: boolean;
}

export interface LoginCredentials {
  identifier: string; // نام کاربری یا کد ملی
  password: string;
  captchaInput: string;
  rememberMe?: boolean;
}

export type ResourceCategory = 
  | 'books_handouts' 
  | 'videos' 
  | 'powerpoints_slides'
  | 'audio_podcasts' 
  | 'templates_docs' 
  | 'sample_questions'
  | 'elearning_packages';

export interface CourseResource {
  id: string;
  course_id: string;
  title: string;
  category: ResourceCategory;
  file_type: string; // 'video' | 'pdf' | 'powerpoint' | 'audio' | 'document' | 'spreadsheet' | 'zip' | 'scorm'
  file_name?: string;
  file_data_url?: string; // base64 or blob URL for uploaded files
  video_url?: string;
  video_duration_sec?: number;
  file_size_mb: number;
  download_url: string;
  description: string;
  uploaded_by: string;
  created_at: string;
  type?: string;
  author?: string;
  study_duration_min?: number;
  allow_download?: boolean;
  watermark_type?: string;
  allow_scrubbing?: boolean;
  cover_image_url?: string;
  external_link?: string;
  slide_count?: number;
  tags?: string[];
  branch?: string;
  branch_mode?: 'public' | 'branch';
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  session_number: number;
  description: string;
  video_url?: string;
  audio_url?: string;
  duration_minutes: number;
  slides_pdf_url?: string;
  session_notes?: string;
  order_index: number;
}

export type ISOPhase = 'tna' | 'design_planning' | 'execution' | 'evaluation';

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  duration_hours: number;
  instructor_id: string;
  instructor_name: string;
  class_manager_id: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  iso_phase: ISOPhase;
  target_audience: string;
  cover_image?: string;
  created_at: string;
  branch?: string;
  start_date?: string;
  end_date?: string;
  passing_grade?: number;
  assigned_learner_ids?: string[];
  assigned_instructor_ids?: string[];
  assigned_manager_ids?: string[];
  prerequisite_course_ids?: string[];
  welcome_message?: string;
  class_project_description?: string;
  grading_scheme?: {
    exam_percent: number;
    attendance_percent: number;
    activity_percent: number;
    project_percent: number;
  };
  forum_access?: boolean;
  online_meeting_url?: string;
  online_meeting_password?: string;
  online_meeting_date?: string;
}

export type QuestionType = 'multiple_choice' | 'descriptive';

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: QuestionType;
  options: string[];
  correct_option_index: number;
  score_weight: number;
  explanation?: string;
}

export type ExamType = 'pre_test' | 'post_test' | 'final_exam' | 'quiz';

export interface Exam {
  id: string;
  course_id: string;
  title: string;
  exam_type: ExamType;
  duration_minutes: number;
  passing_score: number;
  total_questions: number;
  status: 'published' | 'draft';
  is_offline_exam: boolean;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  user_name: string;
  score: number;
  total_score: number;
  passed: boolean;
  submitted_at: string;
  answers: { [questionId: string]: number | string };
  feedback?: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  progress_percent: number;
  attendance_percent: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  final_grade?: number;
}

export interface KirkpatrickEvaluation {
  id: string;
  course_id: string;
  course_title: string;
  user_id: string;
  user_name: string;
  level: 1 | 2 | 3 | 4;
  respondent_type: 'learner' | 'supervisor' | 'evaluator';
  scores: {
    satisfaction?: number;
    instructor_rating?: number;
    material_quality?: number;
    applicability?: number;
    pre_test_score?: number;
    post_test_score?: number;
    behavior_change_score?: number;
    workplace_implementation?: number;
    kpi_impact_percent?: number;
    roi_percent?: number;
  };
  comments: string;
  evaluation_date: string;
}

export interface TNARecord {
  id: string;
  code: string;
  department: string;
  job_titles: string[];
  competency_gap: string;
  proposed_course_title: string;
  target_trainees_count: number;
  priority: 'high' | 'medium' | 'low';
  year: number;
  status: 'approved' | 'in_review' | 'completed';
  justification: string;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  user_id: string;
  user_name: string;
  course_id: string;
  course_title: string;
  duration_hours: number;
  grade: number;
  issue_date: string;
  iso_compliance_code: string;
  instructor_name: string;
  is_valid: boolean;
}

export type ThemeColor = 'emerald' | 'blue' | 'indigo' | 'violet' | 'amber' | 'slate';

export interface SystemVersionInfo {
  core_version: string;
  db_schema_version: string;
  rbac_engine_version: string;
  kernel_version: string;
  release_channel: 'stable' | 'lts' | 'beta';
  last_update_check: string;
  is_update_available: boolean;
  latest_available_version?: string;
  changelog?: string[];
  migrations_pending?: string[];
}

export interface SystemSettings {
  app_name: string;
  org_name: string;
  logo_url: string;
  theme_color: ThemeColor;
  header_subtitle: string;
  footer_text: string;
  is_installed: boolean;
  installed_at: string;
  admin_email: string;
  db_engine: 'SQLite Relational' | 'PostgreSQL Compatible' | 'MySQL Compatible';
  iso_standards_version: string;
  version_info?: SystemVersionInfo;
  enable_captcha?: boolean;
  session_timeout_min?: number;
  max_login_attempts?: number;
  lockout_minutes?: number;
  captcha_chars_count?: number;
  nda_text?: string;
  org_slogan?: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  user_role: UserRole;
  employee_id?: string;
  username?: string;
  department?: string;
  branch?: string;
  ip_address?: string;
  shamsi_date?: string;
  time_str?: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
}

export interface ClassSession {
  id: string;
  code: string;
  title: string;
  course_id: string;
  course_title: string;
  branch: string;
  start_date: string;
  end_date: string;
  session_type: 'online_qa' | 'recorded' | 'workshop';
  is_live: boolean;
  attendees_count: number;
  instructors_count: number;
  managers_count: number;
  recording_url?: string;
  status: 'active' | 'completed' | 'scheduled';
}

export interface SystemSnapshot {
  id: string;
  title: string;
  created_at: string;
  core_version: string;
  schema_version: string;
  records_count: number;
  snapshot_hash: string;
}
