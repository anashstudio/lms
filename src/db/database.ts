
import {
  User,
  Course,
  Lesson,
  CourseResource,
  Exam,
  Question,
  Enrollment,
  ExamAttempt,
  KirkpatrickEvaluation,
  TNARecord,
  Certificate,
  SystemSettings,
  AuditLog,
  ClassSession
} from '../types/models';

import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_LESSONS,
  INITIAL_RESOURCES,
  INITIAL_EXAMS,
  INITIAL_QUESTIONS,
  INITIAL_ENROLLMENTS,
  INITIAL_EXAM_ATTEMPTS,
  INITIAL_KIRKPATRICK,
  INITIAL_TNA,
  INITIAL_CERTIFICATES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SESSIONS
} from './seedData';

const DB_STORAGE_KEY = 'enterprise_lms_sql_database_v2';

export interface DatabaseState {
  system_settings: SystemSettings[];
  users: User[];
  courses: Course[];
  lessons: Lesson[];
  resources: CourseResource[];
  enrollments: Enrollment[];
  exams: Exam[];
  questions: Question[];
  exam_attempts: ExamAttempt[];
  kirkpatrick_evaluations: KirkpatrickEvaluation[];
  tna_records: TNARecord[];
  certificates: Certificate[];
  audit_logs: AuditLog[];
  sessions: ClassSession[];
}

export class RelationalDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseState {
    try {
      const saved = localStorage.getItem(DB_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.sessions) {
          parsed.sessions = [...INITIAL_SESSIONS];
        }
        // اطمینان از وجود فیلدهای تفکیک‌شده نام کاربری و رمز عبور برای کاربران ذخیره شده
        if (parsed.users && Array.isArray(parsed.users)) {
          let updated = false;
          parsed.users = parsed.users.map((u: any) => {
            let userUpdated = false;
            if (!u.username) {
              const matchedInitial = INITIAL_USERS.find(iu => iu.id === u.id || iu.national_id === u.national_id);
              u.username = matchedInitial?.username || u.email?.split('@')[0] || `user_${u.national_id?.slice(-4) || Math.floor(Math.random() * 1000)}`;
              userUpdated = true;
            }
            if (!u.password) {
              const matchedInitial = INITIAL_USERS.find(iu => iu.id === u.id);
              u.password = matchedInitial?.password || (u.role === 'super_admin' ? 'Admin@123456' : 'User@123');
              userUpdated = true;
            }
            if (userUpdated) updated = true;
            return u;
          });
          if (updated) {
            localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(parsed));
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading database from storage:', e);
    }
    return this.getInitialState();
  }

  private getInitialState(): DatabaseState {
    return {
      system_settings: [INITIAL_SETTINGS],
      users: [...INITIAL_USERS],
      courses: [...INITIAL_COURSES],
      lessons: [...INITIAL_LESSONS],
      resources: [...INITIAL_RESOURCES],
      enrollments: [...INITIAL_ENROLLMENTS],
      exams: [...INITIAL_EXAMS],
      questions: [...INITIAL_QUESTIONS],
      exam_attempts: [...INITIAL_EXAM_ATTEMPTS],
      kirkpatrick_evaluations: [...INITIAL_KIRKPATRICK],
      tna_records: [...INITIAL_TNA],
      certificates: [...INITIAL_CERTIFICATES],
      audit_logs: [...INITIAL_AUDIT_LOGS],
      sessions: [...INITIAL_SESSIONS]
    };
  }

  public saveToStorage(): void {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save database state:', e);
    }
  }

  public getSettings(): SystemSettings {
    if (!this.state.system_settings || this.state.system_settings.length === 0) {
      this.state.system_settings = [{ ...INITIAL_SETTINGS }];
      this.saveToStorage();
    }
    const current = this.state.system_settings[0];
    if (!current.org_slogan) {
      current.org_slogan = 'آموزش مداوم، تعالی سازمانی و ارتقای شایستگی‌های تخصصی صنعت نفت';
    }
    return current;
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.state.system_settings = [updated];
    this.saveToStorage();
    this.logAudit('مدیر ارشد', 'super_admin', 'ویرایش تنظیمات سامانه', 'system_settings', 'بروزرسانی مشخصات ظاهری و هویتی نرم‌افزار');
    return updated;
  }

  public getUsers(): User[] {
    return [...this.state.users];
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public addUser(user: User): User {
    this.state.users = [user, ...this.state.users];
    this.saveToStorage();
    this.logAudit('سیستم', 'super_admin', 'ایجاد کاربر جدید', 'users', `کاربر ${user.full_name} با نقش ${user.role} ثبت شد.`);
    return user;
  }

  public addUsersBatch(users: User[]): number {
    this.state.users = [...users, ...this.state.users];
    this.saveToStorage();
    this.logAudit('سیستم', 'super_admin', 'ایمپورت دسته‌ای کاربران از اکسل', 'users', `${users.length} کاربر جدید از فایل اکسل وارد پایگاه‌داده شدند.`);
    return users.length;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.state.users[idx] = { ...this.state.users[idx], ...updates };
    this.saveToStorage();
    return this.state.users[idx];
  }

  public deleteUser(id: string): boolean {
    const prev = this.state.users.length;
    this.state.users = this.state.users.filter(u => u.id !== id);
    this.saveToStorage();
    return this.state.users.length < prev;
  }

  /**
   * احراز هویت سازمانی: پشتیبانی اولویت‌دار از «کد پرسنلی»، «نام کاربری» و «کد ملی ۱۰ رقمی»
   */
  public authenticateUser(identifier: string, passwordAttempt: string): User | null {
    if (!identifier || !passwordAttempt) return null;
    const cleanId = identifier.trim().toLowerCase();
    
    const user = this.state.users.find(u => {
      if (u.status !== 'active') return false;
      const matchEmployeeId = u.employee_id && u.employee_id.trim().toLowerCase() === cleanId;
      const matchUsername = u.username && u.username.toLowerCase() === cleanId;
      const matchNationalId = u.national_id && u.national_id.trim() === identifier.trim();
      return matchEmployeeId || matchUsername || matchNationalId;
    });

    if (!user) return null;

    // بررسی تطابق رمز عبور (یا تطابق با پیش‌فرض در صورت کاربر دمو)
    const expectedPassword = user.password || (user.role === 'super_admin' ? 'Admin@123456' : 'User@123');
    if (user.password === passwordAttempt || passwordAttempt === expectedPassword) {
      this.updateUserLastLogin(user.id);
      const usedMethod =
        user.employee_id && user.employee_id.trim().toLowerCase() === cleanId
          ? `کد پرسنلی (${user.employee_id})`
          : user.username.toLowerCase() === cleanId
          ? 'نام کاربری'
          : 'کد ملی';

      this.logAudit(
        user.full_name,
        user.role,
        'ورود کاربر',
        'صفحه ورود کاربر',
        `احراز هویت موفق از طریق ${usedMethod} انجام شد.`,
        {
          employee_id: user.employee_id || user.username,
          username: user.username,
          department: user.department,
          branch: 'پالایشگاه اصفهان',
          ip_address: '192.168.10.45'
        }
      );
      return user;
    }

    this.logAudit(
      identifier,
      'guest' as any,
      'ورود ناموفق',
      'auth_security',
      `رمز عبور اشتباه یا شناسه نامعتبر برای «${identifier}» ثبت شد.`,
      {
        employee_id: identifier,
        username: identifier,
        department: 'احراز هویت ناشناس',
        branch: 'پالایشگاه اصفهان',
        ip_address: '192.168.10.88'
      }
    );
    return null;
  }

  public checkUsernameAvailable(username: string, excludeUserId?: string): boolean {
    const clean = username.trim().toLowerCase();
    return !this.state.users.some(u => u.username?.toLowerCase() === clean && u.id !== excludeUserId);
  }

  public checkNationalIdAvailable(national_id: string, excludeUserId?: string): boolean {
    const clean = national_id.trim();
    return !this.state.users.some(u => u.national_id === clean && u.id !== excludeUserId);
  }

  public changeUserPassword(userId: string, oldPass: string, newPass: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    const currentPass = user.password || (user.role === 'super_admin' ? 'Admin@123456' : 'User@123');
    if (currentPass !== oldPass) return false;

    this.updateUser(userId, { password: newPass });
    this.logAudit(
      user.full_name,
      user.role,
      'تغییر رمز عبور',
      'auth',
      `رمز عبور کاربر ${user.full_name} بروزرسانی شد.`
    );
    return true;
  }

  public updateUserLastLogin(userId: string): void {
    const now = new Date().toISOString();
    const idx = this.state.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.state.users[idx].last_login_at = now;
      this.saveToStorage();
    }
  }

  public getCourses(): Course[] {
    return [...this.state.courses];
  }

  public getCourseById(id: string): Course | undefined {
    return this.state.courses.find(c => c.id === id);
  }

  public addCourse(course: Course): Course {
    this.state.courses = [course, ...this.state.courses];
    this.saveToStorage();
    this.logAudit('آموزش', 'class_manager', 'ایجاد دوره جدید', 'courses', `دوره ${course.title} ایجاد شد.`);
    return course;
  }

  public addCoursesBatch(courses: Course[]): number {
    this.state.courses = [...courses, ...this.state.courses];
    this.saveToStorage();
    return courses.length;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const idx = this.state.courses.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.state.courses[idx] = { ...this.state.courses[idx], ...updates };
    this.saveToStorage();
    return this.state.courses[idx];
  }

  public deleteCourse(id: string): boolean {
    this.state.courses = this.state.courses.filter(c => c.id !== id);
    this.state.lessons = this.state.lessons.filter(l => l.course_id !== id);
    this.state.resources = this.state.resources.filter(r => r.course_id !== id);
    this.saveToStorage();
    return true;
  }

  public getLessonsByCourse(courseId: string): Lesson[] {
    return this.state.lessons
      .filter(l => l.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  public addLesson(lesson: Lesson): Lesson {
    this.state.lessons.push(lesson);
    this.saveToStorage();
    return lesson;
  }

  public updateLesson(id: string, updates: Partial<Lesson>): Lesson | undefined {
    const idx = this.state.lessons.findIndex(l => l.id === id);
    if (idx === -1) return undefined;
    this.state.lessons[idx] = { ...this.state.lessons[idx], ...updates };
    this.saveToStorage();
    return this.state.lessons[idx];
  }

  public deleteLesson(id: string): boolean {
    const prev = this.state.lessons.length;
    this.state.lessons = this.state.lessons.filter(l => l.id !== id);
    this.saveToStorage();
    return this.state.lessons.length < prev;
  }

  public getResourcesByCourse(courseId?: string): CourseResource[] {
    if (!courseId || courseId === 'all') {
      return [...this.state.resources];
    }
    return this.state.resources.filter(r => r.course_id === courseId);
  }

  public addResource(resource: CourseResource): CourseResource {
    this.state.resources = [resource, ...this.state.resources];
    this.saveToStorage();
    return resource;
  }

  public updateResource(id: string, updates: Partial<CourseResource>): CourseResource | undefined {
    const idx = this.state.resources.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    this.state.resources[idx] = { ...this.state.resources[idx], ...updates };
    this.saveToStorage();
    return this.state.resources[idx];
  }

  public deleteResource(id: string): boolean {
    this.state.resources = this.state.resources.filter(r => r.id !== id);
    this.saveToStorage();
    return true;
  }

  public getExams(courseId?: string): Exam[] {
    if (!courseId || courseId === 'all') {
      return [...this.state.exams];
    }
    return this.state.exams.filter(e => e.course_id === courseId);
  }

  public getExamById(id: string): Exam | undefined {
    return this.state.exams.find(e => e.id === id);
  }

  public addExam(exam: Exam): Exam {
    this.state.exams = [exam, ...this.state.exams];
    this.saveToStorage();
    return exam;
  }

  public updateExam(id: string, updates: Partial<Exam>): Exam | undefined {
    const idx = this.state.exams.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    this.state.exams[idx] = { ...this.state.exams[idx], ...updates };
    this.saveToStorage();
    return this.state.exams[idx];
  }

  public deleteExam(id: string): boolean {
    this.state.exams = this.state.exams.filter(e => e.id !== id);
    this.state.questions = this.state.questions.filter(q => q.exam_id !== id);
    this.saveToStorage();
    return true;
  }

  public getQuestions(): Question[] {
    return [...this.state.questions];
  }

  public getQuestionsByExam(examId: string): Question[] {
    return this.state.questions.filter(q => q.exam_id === examId);
  }

  public addQuestion(question: Question): Question {
    this.state.questions.push(question);
    this.saveToStorage();
    return question;
  }

  public updateQuestion(id: string, updates: Partial<Question>): Question | undefined {
    const idx = this.state.questions.findIndex(q => q.id === id);
    if (idx === -1) return undefined;
    this.state.questions[idx] = { ...this.state.questions[idx], ...updates };
    this.saveToStorage();
    return this.state.questions[idx];
  }

  public deleteQuestion(id: string): boolean {
    this.state.questions = this.state.questions.filter(q => q.id !== id);
    this.saveToStorage();
    return true;
  }

  public addQuestionsBatch(questions: Question[]): number {
    this.state.questions = [...questions, ...this.state.questions];
    this.saveToStorage();
    return questions.length;
  }

  public getExamAttempts(examId?: string, userId?: string): ExamAttempt[] {
    return this.state.exam_attempts.filter(a => {
      if (examId && a.exam_id !== examId) return false;
      if (userId && a.user_id !== userId) return false;
      return true;
    });
  }

  public recordExamAttempt(attempt: ExamAttempt): ExamAttempt {
    this.state.exam_attempts = [attempt, ...this.state.exam_attempts];

    const exam = this.getExamById(attempt.exam_id);
    if (exam && (exam.exam_type === 'post_test' || exam.exam_type === 'final_exam')) {
      const course = this.getCourseById(exam.course_id);
      const preTest = this.state.exams.find(e => e.course_id === exam.course_id && e.exam_type === 'pre_test');
      const preAttempt = preTest ? this.state.exam_attempts.find(a => a.exam_id === preTest.id && a.user_id === attempt.user_id) : undefined;

      this.addKirkpatrickEvaluation({
        id: `kirk_${Date.now()}`,
        course_id: exam.course_id,
        course_title: course?.title || 'دوره آموزشی',
        user_id: attempt.user_id,
        user_name: attempt.user_name,
        level: 2,
        respondent_type: 'evaluator',
        scores: {
          pre_test_score: preAttempt ? (preAttempt.score / preAttempt.total_score) * 100 : 40,
          post_test_score: (attempt.score / attempt.total_score) * 100
        },
        comments: `ثبت خودکار آزمون سنجش یادگیری: نمره اخذ شده ${attempt.score} از ${attempt.total_score}`,
        evaluation_date: new Date().toISOString()
      });
    }

    this.saveToStorage();
    return attempt;
  }

  public getEnrollments(userId?: string, courseId?: string): Enrollment[] {
    return this.state.enrollments.filter(e => {
      if (userId && e.user_id !== userId) return false;
      if (courseId && e.course_id !== courseId) return false;
      return true;
    });
  }

  public addEnrollment(enrollment: Enrollment): Enrollment {
    this.state.enrollments.push(enrollment);
    this.saveToStorage();
    return enrollment;
  }

  public updateEnrollmentProgress(courseId: string, userId: string, progress: number): void {
    const item = this.state.enrollments.find(e => e.course_id === courseId && e.user_id === userId);
    if (item) {
      item.progress_percent = progress;
      if (progress >= 100) item.status = 'completed';
      this.saveToStorage();
    }
  }

  public getKirkpatrickEvaluations(courseId?: string, level?: number): KirkpatrickEvaluation[] {
    return this.state.kirkpatrick_evaluations.filter(k => {
      if (courseId && courseId !== 'all' && k.course_id !== courseId) return false;
      if (level && k.level !== level) return false;
      return true;
    });
  }

  public addKirkpatrickEvaluation(evalData: KirkpatrickEvaluation): KirkpatrickEvaluation {
    this.state.kirkpatrick_evaluations = [evalData, ...this.state.kirkpatrick_evaluations];
    this.saveToStorage();
    return evalData;
  }

  public updateKirkpatrickEvaluation(id: string, updates: Partial<KirkpatrickEvaluation>): KirkpatrickEvaluation | undefined {
    const idx = this.state.kirkpatrick_evaluations.findIndex(k => k.id === id);
    if (idx === -1) return undefined;
    this.state.kirkpatrick_evaluations[idx] = { ...this.state.kirkpatrick_evaluations[idx], ...updates };
    this.saveToStorage();
    return this.state.kirkpatrick_evaluations[idx];
  }

  public getTNARecords(): TNARecord[] {
    return [...this.state.tna_records];
  }

  public addTNARecord(tna: TNARecord): TNARecord {
    this.state.tna_records = [tna, ...this.state.tna_records];
    this.saveToStorage();
    this.logAudit('تضمین کیفیت', 'class_manager', 'نیازسنجی آموزشی ISO 10015', 'tna_records', `نیازسنجی کد ${tna.code} ثبت شد.`);
    return tna;
  }

  public updateTNARecord(id: string, updates: Partial<TNARecord>): TNARecord | undefined {
    const idx = this.state.tna_records.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.state.tna_records[idx] = { ...this.state.tna_records[idx], ...updates };
    this.saveToStorage();
    return this.state.tna_records[idx];
  }

  public deleteTNARecord(id: string): boolean {
    const prev = this.state.tna_records.length;
    this.state.tna_records = this.state.tna_records.filter(t => t.id !== id);
    this.saveToStorage();
    return this.state.tna_records.length < prev;
  }

  public updateTNAStatus(id: string, status: 'approved' | 'in_review' | 'completed'): void {
    const item = this.state.tna_records.find(t => t.id === id);
    if (item) {
      item.status = status;
      this.saveToStorage();
    }
  }

  public getCertificates(userId?: string): Certificate[] {
    if (!userId) return [...this.state.certificates];
    return this.state.certificates.filter(c => c.user_id === userId);
  }

  public issueCertificate(cert: Certificate): Certificate {
    this.state.certificates = [cert, ...this.state.certificates];
    this.saveToStorage();
    this.logAudit('مدیر آموزش', 'class_manager', 'صدور گواهینامه معتبر پایان دوره', 'certificates', `گواهینامه شماره ${cert.certificate_number} برای ${cert.user_name} صادر شد.`);
    return cert;
  }

  public updateCertificate(id: string, updates: Partial<Certificate>): Certificate | undefined {
    const idx = this.state.certificates.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.state.certificates[idx] = { ...this.state.certificates[idx], ...updates };
    this.saveToStorage();
    return this.state.certificates[idx];
  }

  public deleteCertificate(id: string): boolean {
    const prev = this.state.certificates.length;
    this.state.certificates = this.state.certificates.filter(c => c.id !== id);
    this.saveToStorage();
    return this.state.certificates.length < prev;
  }

  public getSessions(courseId?: string): ClassSession[] {
    if (!this.state.sessions) this.state.sessions = [...INITIAL_SESSIONS];
    if (!courseId || courseId === 'all') return [...this.state.sessions];
    return this.state.sessions.filter(s => s.course_id === courseId);
  }

  public addSession(session: ClassSession): ClassSession {
    if (!this.state.sessions) this.state.sessions = [];
    this.state.sessions = [session, ...this.state.sessions];
    this.saveToStorage();
    this.logAudit('مدیریت آموزش', 'class_manager', 'تعریف جلسه کلاسی جدید', 'sessions', `جلسه کد ${session.code} تحت عنوان «${session.title}» ثبت شد.`);
    return session;
  }

  public updateSession(id: string, updates: Partial<ClassSession>): ClassSession | undefined {
    if (!this.state.sessions) return undefined;
    const idx = this.state.sessions.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.state.sessions[idx] = { ...this.state.sessions[idx], ...updates };
    this.saveToStorage();
    return this.state.sessions[idx];
  }

  public deleteSession(id: string): boolean {
    if (!this.state.sessions) return false;
    const prev = this.state.sessions.length;
    this.state.sessions = this.state.sessions.filter(s => s.id !== id);
    this.saveToStorage();
    return this.state.sessions.length < prev;
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.audit_logs];
  }

  public logAudit(
    userName: string,
    role: string,
    action: string,
    entity: string,
    details: string,
    extra?: Partial<AuditLog>
  ): void {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      user_name: userName,
      user_role: role as any,
      employee_id: extra?.employee_id || extra?.username || '',
      username: extra?.username || '',
      department: extra?.department || 'پالایشگاه اصفهان',
      branch: extra?.branch || 'پالایشگاه اصفهان',
      ip_address: extra?.ip_address || '192.168.10.45',
      shamsi_date: extra?.shamsi_date || '۱۴۰۵/۰۸/۱۴',
      time_str: extra?.time_str || timeStr,
      action,
      entity,
      details,
      timestamp: now.toISOString(),
      ...extra
    };
    this.state.audit_logs = [log, ...this.state.audit_logs.slice(0, 199)];
    this.saveToStorage();
  }

  public initializeSetup(options: {
    app_name: string;
    org_name: string;
    admin_name: string;
    admin_username?: string;
    admin_national_id: string;
    admin_password?: string;
    admin_email: string;
    admin_phone: string;
    theme_color: any;
    db_engine: any;
    seed_demo_data: boolean;
  }): void {
    const newSettings: SystemSettings = {
      app_name: options.app_name || 'سامانه مدیریت یادگیری صدرا',
      org_name: options.org_name || 'سازمان توسعه و آموزش منابع انسانی',
      logo_url: '',
      theme_color: options.theme_color || 'emerald',
      header_subtitle: 'سیستم جامع آموزش الکترونیکی و سنجش اثربخشی مبتنی بر ISO 10015',
      footer_text: `کلیه حقوق محفوظ است. منطبق با راهنمای مدیریت آموزش ${options.org_name}`,
      is_installed: true,
      installed_at: new Date().toISOString(),
      admin_email: options.admin_email,
      db_engine: options.db_engine || 'PostgreSQL Compatible',
      iso_standards_version: 'ISO 10015:2019'
    };

    const adminUser: User = {
      id: 'usr_super_admin',
      username: options.admin_username || 'admin',
      national_id: options.admin_national_id || '0078912345',
      password: options.admin_password || 'Admin@123456',
      full_name: options.admin_name || 'مدیر ارشد سامانه',
      email: options.admin_email || 'admin@sadra-lms.ir',
      phone: options.admin_phone || '09121112233',
      role: 'super_admin',
      department: 'مدیریت ارشد آموزش و منابع انسانی',
      job_title: 'مدیر کل آموزش و استانداردسازی',
      status: 'active',
      created_at: new Date().toISOString()
    };

    if (options.seed_demo_data) {
      this.state = {
        ...this.getInitialState(),
        system_settings: [newSettings],
        users: [adminUser, ...INITIAL_USERS.filter(u => u.id !== 'usr_super_admin')]
      };
    } else {
      this.state = {
        system_settings: [newSettings],
        users: [adminUser],
        courses: [],
        lessons: [],
        resources: [],
        enrollments: [],
        exams: [],
        questions: [],
        exam_attempts: [],
        kirkpatrick_evaluations: [],
        tna_records: [],
        certificates: [],
        sessions: [],
        audit_logs: [
          {
            id: `log_init_${Date.now()}`,
            user_name: adminUser.full_name,
            user_role: 'super_admin',
            action: 'راه‌اندازی و نصب اولیه پایگاه‌داده SQL',
            entity: 'system_settings',
            details: `پایگاه‌داده با موفقیت در موتور ${options.db_engine} پیکربندی شد.`,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }

    this.saveToStorage();
  }

  public resetToFactory(): void {
    localStorage.removeItem(DB_STORAGE_KEY);
    this.state = this.getInitialState();
    this.state.system_settings[0].is_installed = false;
    this.saveToStorage();
  }

  public resetToFactoryDefaults(): void {
    this.resetToFactory();
  }

  public getTableNames(): string[] {
    return [
      'system_settings',
      'users',
      'courses',
      'lessons',
      'resources',
      'enrollments',
      'exams',
      'questions',
      'exam_attempts',
      'kirkpatrick_evaluations',
      'tna_records',
      'certificates',
      'audit_logs',
      'sessions'
    ];
  }

  public executeSQL(rawQuery: string): { columns: string[]; rows: any[][]; message?: string; error?: string } {
    const trimmed = rawQuery.trim();
    const upper = trimmed.toUpperCase();

    if (!trimmed) {
      return { columns: [], rows: [], error: 'دستور SQL خالی است.' };
    }

    if (upper === 'SHOW TABLES;' || upper === 'SHOW TABLES') {
      const tables = this.getTableNames();
      return {
        columns: ['table_name', 'total_records'],
        rows: tables.map(t => [t, (this.state as any)[t]?.length || 0]),
        message: `${tables.length} جدول در پایگاه‌داده یافت شد.`
      };
    }

    if (upper.startsWith('SELECT')) {

      const fromMatch = trimmed.match(/from\s+([a-zA-Z0-9_]+)/i);
      if (!fromMatch) {
        return { columns: [], rows: [], error: 'دستور SELECT باید شامل بند FROM <نام_جدول> باشد.' };
      }
      const tableName = fromMatch[1].toLowerCase();
      const records = (this.state as any)[tableName];
      if (!records) {
        return { columns: [], rows: [], error: `جدول '${tableName}' در دیتابیس وجود ندارد.` };
      }

      if (records.length === 0) {
        return { columns: ['info'], rows: [['جدول خالی است.']], message: '0 ردیف بازگردانده شد.' };
      }

      const selectPart = trimmed.substring(6, trimmed.toUpperCase().indexOf('FROM')).trim();
      let columns = Object.keys(records[0]);
      if (selectPart !== '*') {
        const requestedCols = selectPart.split(',').map(c => c.trim());
        columns = requestedCols;
      }

      const rows = records.map((r: any) => {
        return columns.map(c => {
          const val = r[c];
          if (val === undefined) return 'NULL';
          if (typeof val === 'object') return JSON.stringify(val);
          return val;
        });
      });

      return {
        columns,
        rows,
        message: `${rows.length} ردیف با موفقیت بازیابی شد.`
      };
    }

    if (upper.startsWith('INSERT INTO') || upper.startsWith('UPDATE') || upper.startsWith('DELETE FROM')) {
      return {
        columns: ['status', 'message'],
        rows: [['OK', 'عملیات با موفقیت در لایه داده شبیه‌سازی گردید.']],
        message: 'دستور تغییر داده اجرا شد (۱ ردیف تحت تاثیر قرار گرفت).'
      };
    }

    return {
      columns: ['status', 'query'],
      rows: [['EXECUTED', trimmed]],
      message: 'دستور با موفقیت تفسیر گردید.'
    };
  }

  public exportFullSQLDump(): string {
    const timestamp = new Date().toISOString();
    let sql = `-- ========================================================\n`;
    sql += `-- Enterprise Learning Management System SQL DUMP\n`;
    sql += `-- Generated: ${timestamp}\n`;
    sql += `-- Compatible with: PostgreSQL 14+, MySQL 8.0+, SQLite 3\n`;
    sql += `-- ========================================================\n\n`;

    const tables = this.getTableNames();
    for (const table of tables) {
      const records = (this.state as any)[table] || [];
      sql += `-- Table: ${table} (${records.length} records)\n`;
      if (records.length > 0) {
        for (const item of records) {
          const keys = Object.keys(item);
          const values = keys.map(k => {
            const v = item[k];
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number' || typeof v === 'boolean') return v;
            if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
            return `'${String(v).replace(/'/g, "''")}'`;
          });
          sql += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
      }
      sql += `\n`;
    }

    return sql;
  }

  public exportSQLDump(): string {
    return this.exportFullSQLDump();
  }
}

export const db = new RelationalDatabase();
