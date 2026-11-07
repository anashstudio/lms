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
  ClassSession,
  OrgUnit,
  JobProfile,
  PromotionPlan
} from '../types/models';

export const INITIAL_SETTINGS: SystemSettings = {
  app_name: 'سامانه یادگیری و آزمون الکترونیکی',
  org_name: 'شرکت پالایش نفت اصفهان',
  logo_url: '',
  theme_color: 'emerald',
  header_subtitle: 'مدیریت یکپارچه آموزش و یادگیری ایده (نسخه ۷.۵۰.۰۰.۸۸)',
  footer_text: 'مدیریت یکپارچه آموزش و یادگیری ایده (۷.۵۰.۰۰.۸۸) · شرکت پالایش نفت اصفهان',
  is_installed: true,
  installed_at: '2026-01-15T08:30:00Z',
  admin_email: 'admin@eorc.ir',
  db_engine: 'PostgreSQL Compatible',
  iso_standards_version: 'نسخه سازمانی ۷.۵۰',
  enable_captcha: true,
  session_timeout_min: 40,
  max_login_attempts: 5,
  lockout_minutes: 15,
  captcha_chars_count: 6,
  org_slogan: 'آموزش مداوم، تعالی سازمانی و ارتقای شایستگی‌های تخصصی صنعت نفت'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_super_admin',
    username: 'admin',
    employee_id: '965505',
    national_id: '0078912345',
    password: 'Admin@123456',
    full_name: 'محمدرضا امیر یوسفی',
    email: 'm.yousefi@eorc.ir',
    phone: '09121112233',
    role: 'super_admin',
    department: 'مدیریت ارشد آموزش و منابع انسانی',
    job_title: 'مدیر کل آموزش و سامانه یادگیری',
    status: 'active',
    created_at: '2026-01-15T09:00:00Z',
    last_login_at: '2026-04-18T08:30:00Z'
  },
  {
    id: 'usr_class_mgr',
    username: 's.sadeghi',
    employee_id: '965744',
    national_id: '0065432198',
    password: 'Manager@123',
    full_name: 'دکتر سارا صادقی',
    email: 's.sadeghi@eorc.ir',
    phone: '09122223344',
    role: 'class_manager',
    department: 'اداره برنامه‌ریزی و ارزیابی آموزشی',
    job_title: 'سرپرست هماهنگی کلاس‌ها و دوره‌ها',
    status: 'active',
    created_at: '2026-01-16T10:15:00Z',
    last_login_at: '2026-04-17T11:00:00Z'
  },
  {
    id: 'usr_instructor',
    username: 'a.mahdavi',
    employee_id: '964819',
    national_id: '0054321678',
    password: 'Teacher@123',
    full_name: 'استاد علی مهدوی',
    email: 'a.mahdavi@eorc.ir',
    phone: '09123334455',
    role: 'instructor',
    department: 'دپارتمان سیستم‌های مدیریت کیفیت و فرآیند',
    job_title: 'مدرس ارشد دوره‌های ایمنی و فرآیند',
    status: 'active',
    created_at: '2026-01-17T11:30:00Z',
    last_login_at: '2026-04-16T14:20:00Z'
  },
  {
    id: 'usr_learner_1',
    username: 'm.rezaei',
    employee_id: '965780',
    national_id: '0043218765',
    password: 'User@123',
    full_name: 'محمد رضایی',
    email: 'm.rezaei@eorc.ir',
    phone: '09124445566',
    role: 'learner',
    department: 'واحد تضمین کیفیت و مهندسی صنایع',
    job_title: 'کارشناس ارشد ممیزی فرآیند',
    status: 'active',
    created_at: '2026-01-18T14:20:00Z',
    last_login_at: '2026-04-15T09:10:00Z'
  },
  {
    id: 'usr_learner_2',
    username: 'm.kazemi',
    national_id: '0032145698',
    password: 'User@123',
    full_name: 'مریم کاظمی',
    email: 'm.kazemi@sadra-lms.ir',
    phone: '09125556677',
    role: 'learner',
    department: 'واحد توسعه منابع انسانی',
    job_title: 'کارشناس نیازسنجی و شایستگی شغلی',
    status: 'active',
    created_at: '2026-01-18T15:00:00Z',
    last_login_at: '2026-04-14T16:00:00Z'
  },
  {
    id: 'usr_learner_3',
    username: 'h.rostami',
    national_id: '0021354789',
    password: 'User@123',
    full_name: 'حسین رستمی',
    email: 'h.rostami@sadra-lms.ir',
    phone: '09126667788',
    role: 'learner',
    department: 'واحد فناوری اطلاعات و زیرساخت',
    job_title: 'مهندس امنیت شبکه',
    status: 'active',
    created_at: '2026-01-19T09:45:00Z',
    last_login_at: '2026-04-13T10:45:00Z'
  }
];

export const INITIAL_TNA: TNARecord[] = [
  {
    id: 'tna_001',
    code: 'TNA-2026-Q1-01',
    department: 'تضمین کیفیت و سیستم‌ها',
    job_titles: ['کارشناس ممیزی', 'مدیر تضمین کیفیت', 'کارشناس استاندارد'],
    competency_gap: 'عدم تسلط کافی بر آخرین بازنگری راهنمای مدیریت آموزش بر اساس استاندارد ISO 10015:2019',
    proposed_course_title: 'تشریح مبانی، الزامات و ممیزی سیستم آموزش بر مبنای استاندارد ISO 10015',
    target_trainees_count: 24,
    priority: 'high',
    year: 2026,
    status: 'approved',
    justification: 'الزام سازمان ملی استاندارد و بهبود فرآیند ممیزی‌های داخلی سالانه'
  },
  {
    id: 'tna_002',
    code: 'TNA-2026-Q1-02',
    department: 'منابع انسانی و آموزش',
    job_titles: ['کارشناس آموزش', 'مدیر آموزش'],
    competency_gap: 'نیاز به سنجش سطح ۳ و ۴ اثربخشی آموزش و محاسبه بازگشت سرمایه (ROI) آموزشی',
    proposed_course_title: 'کارگاه ارزیابی جامع اثربخشی آموزش به روش مدل ۴ سطحی کرک‌پاتریک و فیلیپس',
    target_trainees_count: 15,
    priority: 'high',
    year: 2026,
    status: 'completed',
    justification: 'جلوگیری از اتلاف بودجه آموزشی و ارائه گزارش تحلیلی به هیئت مدیره'
  },
  {
    id: 'tna_003',
    code: 'TNA-2026-Q2-03',
    department: 'عملیات و فنی مهندسی',
    job_titles: ['سرپرست کارگاه', 'کارشناس ایمنی'],
    competency_gap: 'آشنایی ناکافی با دستورالعمل‌های بازرسی ایمنی کار و کاهش حوادث ناشی از کار',
    proposed_course_title: 'اصول مدیریت ایمنی، بهداشت شغلی و محیط زیست (HSE-MS)',
    target_trainees_count: 35,
    priority: 'medium',
    year: 2026,
    status: 'in_review',
    justification: 'ارتقای شاخص‌های ایمنی و پیشگیری از حوادث احتمالی'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs_iso_10015',
    code: 'CRS-ISO-101',
    title: 'دوره جامع تشریح، استقرار و ممیزی سیستم مدیریت کیفیت آموزش ISO 10015:2019',
    category: 'استانداردها و مدیریت کیفیت',
    description: 'آشنایی جامع با چرخه ۴ مرحله‌ای آموزش: نیازسنجی شایستگی (TNA)، طراحی و برنامه‌ریزی، تامین و اجرای آموزش و ارزشیابی اثربخشی نتایج آموزشی منطبق با راهنمای ایزو ۱۰۰۱۵.',
    duration_hours: 24,
    instructor_id: 'usr_instructor',
    instructor_name: 'استاد علی مهدوی',
    class_manager_id: 'usr_class_mgr',
    status: 'active',
    iso_phase: 'execution',
    target_audience: 'مدیران آموزش، کارشناسان منابع انسانی و ممیزان کیفیت',
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'crs_kirkpatrick',
    code: 'CRS-KIRK-202',
    title: 'کارگاه تخصصی مدل ۴ سطحی کرک‌پاتریک و محاسبه بازگشت سرمایه آموزشی (ROI)',
    category: 'ارزیابی اثربخشی آموزش',
    description: 'بررسی عملیاتی ۴ سطح سنجش اثربخشی: واکنش فراگیر، میزان یادگیری، تغییرات رفتاری در محیط کار و نتایج سازمانی و مالی با ابزارها و فرم‌های استاندارد.',
    duration_hours: 16,
    instructor_id: 'usr_instructor',
    instructor_name: 'استاد علی مهدوی',
    class_manager_id: 'usr_class_mgr',
    status: 'active',
    iso_phase: 'evaluation',
    target_audience: 'مسئولین آموزش، سرپرستان خطوط و ارزیابان عملکرد سازمان',
    created_at: '2026-01-25T10:00:00Z'
  },
  {
    id: 'crs_hse_safety',
    code: 'CRS-HSE-303',
    title: 'اصول مدیریت ایمنی، بهداشت شغلی و ارزیابی ریسک در محیط کار (HSE)',
    category: 'ایمنی و بهداشت حرفه‌ای',
    description: 'شناسایی خطرات، تکنیک‌های ارزیابی ریسک FMEA، الزامات حفاظت فردی و اقدامات واکنش در شرایط اضطراری در واحدهای صنعتی و ستادی.',
    duration_hours: 18,
    instructor_id: 'usr_instructor',
    instructor_name: 'استاد علی مهدوی',
    class_manager_id: 'usr_class_mgr',
    status: 'active',
    iso_phase: 'design_planning',
    target_audience: 'کلیه کارکنان، سرپرستان کارگاه و کارشناسان فنی',
    created_at: '2026-02-01T09:00:00Z'
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lsn_01',
    course_id: 'crs_iso_10015',
    title: 'جلسه ۱: مقدمه، تعاریف شایستگی و تاریخچه بازنگری ISO 10015:2019',
    session_number: 1,
    description: 'بررسی تغییرات کلیدی در ویرایش ۲۰۱۹ استاندارد ایزو ۱۰۰۱۵ نسبت به نسخه پیشین، یکپارچه‌سازی با ایزو ۹۰۰۱ و مفهوم شکاف شایستگی سازمانی.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    audio_url: '',
    duration_minutes: 50,
    slides_pdf_url: '/materials/session1_slides.pdf',
    session_notes: 'نکته کلیدی: در ویرایش ۲۰۱۹، واژه مدیریت شایستگی و آموزش پرسنل جایگزین راهنمای آموزش شده است و تمرکز بر مدیریت دانش است.',
    order_index: 1
  },
  {
    id: 'lsn_02',
    course_id: 'crs_iso_10015',
    title: 'جلسه ۲: متدولوژی نیازسنجی آموزشی (TNA) و تدوین ماتریس مهارت',
    session_number: 2,
    description: 'شناسایی نیازهای آموزشی در سه سطح سازمان، شغل و فرد، روش‌های تحلیل شکاف شایستگی و مستندسازی در فرمت‌های استاندارد.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration_minutes: 65,
    slides_pdf_url: '/materials/session2_tna.pdf',
    session_notes: 'تمرین آفلاین: شرکت‌کنندگان باید فرم ماتریس مهارت یک شغل در واحد خود را تکمیل و در بخش تکالیف بارگذاری کنند.',
    order_index: 2
  },
  {
    id: 'lsn_03',
    course_id: 'crs_iso_10015',
    title: 'جلسه ۳: طراحی، برنامه‌ریزی و تدوین تقویم اجرایی آموزش سالانه',
    session_number: 3,
    description: 'تعیین اهداف رفتاری و یادگیری SMART، انتخاب روش اجرای آموزش (حضوری، آفلاین، استاد-شاگردی) و برآورد بودجه و منابع.',
    duration_minutes: 45,
    slides_pdf_url: '/materials/session3_planning.pdf',
    session_notes: 'روش‌های اثربخش در زمان‌بندی تقویم آموزش سازمانی بدون تداخل با شیفت‌های کاری حساس.',
    order_index: 3
  },
  {
    id: 'lsn_04',
    course_id: 'crs_iso_10015',
    title: 'جلسه ۴: ارزشیابی اثربخشی نتایج آموزش و چرخه بهبود مستمر (PDCA)',
    session_number: 4,
    description: 'نحوه اندازه‌گیری شاخص‌های کلیدی عملکرد آموزش (KPI)، پایش مداوم فرآیند آموزش و تهیه گزارش ممیزی داخلی سیستم آموزش.',
    duration_minutes: 55,
    slides_pdf_url: '/materials/session4_audit.pdf',
    session_notes: 'مستندات حاصل از این مرحله ورودی مستقیم جلسه بازنگری مدیریت در بند ۹.۳ استاندارد ISO 9001 می‌باشد.',
    order_index: 4
  },
  {
    id: 'lsn_05',
    course_id: 'crs_kirkpatrick',
    title: 'جلسه ۱: تشریح ۴ سطح ارزیابی کرک‌پاتریک و سنجش سطح ۱ (واکنش)',
    session_number: 1,
    description: 'اصول طراحی پرسشنامه‌های سنجش واکنش فراگیر، فرم‌های طیف لیکرت ۵ گزینه‌ای و راهکارهای افزایش نرخ مشارکت در نظرسنجی‌ها.',
    duration_minutes: 40,
    slides_pdf_url: '/materials/kirk_level1.pdf',
    session_notes: 'رضایت بالای فراگیر به تنهایی نشان‌دهنده یادگیری واقعی نیست، اما پیش‌نیاز حیاتی پذیرش محتواست.',
    order_index: 1
  },
  {
    id: 'lsn_06',
    course_id: 'crs_kirkpatrick',
    title: 'جلسه ۲: سنجش سطح ۲ (یادگیری) و آزمون‌های سنجش مهارت',
    session_number: 2,
    description: 'روش اجرای پیش‌آزمون و پس‌آزمون (Pre-Test & Post-Test)، محاسبه درصد رشد یادگیری و طراحی سوالات تفسیری و عملکردی.',
    duration_minutes: 50,
    slides_pdf_url: '/materials/kirk_level2.pdf',
    session_notes: 'فرمول رشد یادگیری: (نمره پس‌آزمون منهای پیش‌آزمون) تقسیم بر (حداکثر نمره منهای پیش‌آزمون) ضرب در ۱۰۰.',
    order_index: 2
  }
];

export const INITIAL_RESOURCES: CourseResource[] = [
  {
    id: 'res_001',
    course_id: 'crs_iso_10015',
    title: 'متن استاندارد بین‌المللی ISO 10015:2019 (فارسی و انگلیسی)',
    category: 'books_handouts',
    file_type: 'pdf',
    file_name: 'ISO_10015_Standard_Farsi.pdf',
    file_size_mb: 4.2,
    download_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'ترجمه رسمی الزامات راهنمای مدیریت شایستگی و توسعه افراد در سازمان به همراه اصطلاحات مرجع.',
    author: 'کمیته فنی تدوین استانداردهای مدیریت کیفیت',
    study_duration_min: 90,
    allow_download: true,
    watermark_type: 'national_id',
    uploaded_by: 'استاد علی مهدوی',
    created_at: '2026-01-21T10:00:00Z',
    branch: 'پالایشگاه اصفهان',
    branch_mode: 'public',
    tags: ['استاندارد', 'شایستگی', 'ایزو ۱۰۰۱۵']
  },
  {
    id: 'res_002',
    course_id: 'crs_iso_10015',
    title: 'فیلم وبینار انتقال تجارب ممیزی فرآیند آموزش در شرکت‌های پیشرو',
    category: 'videos',
    file_type: 'mp4',
    file_name: 'Audit_Simulation_Webinar.mp4',
    file_size_mb: 145.0,
    download_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    video_duration_sec: 596,
    study_duration_min: 60,
    allow_download: false,
    watermark_type: 'national_id',
    allow_scrubbing: true,
    description: 'ویدئوی مستندسازی شده از جلسه شبیه‌سازی ممیزی سرسختانه سر ممیز و نحوه پاسخ‌دهی به عدم انطباق‌ها با پلیر پیشرفته و واترمارک امنیتی.',
    author: 'دکتر سارا صادقی',
    uploaded_by: 'دکتر سارا صادقی',
    created_at: '2026-01-22T14:30:00Z',
    branch: 'پالایشگاه اصفهان',
    branch_mode: 'public',
    tags: ['ویدئو', 'ممیزی', 'وبینار']
  },
  {
    id: 'res_003',
    course_id: 'crs_iso_10015',
    title: 'پاورپوینت جامع کارگاه: استقرار سیستم مدیریت شایستگی و آموزش سازمانی',
    category: 'powerpoints_slides',
    file_type: 'pptx',
    file_name: 'ISO10015_Competency_Workshop_Presentation.pptx',
    file_size_mb: 24.8,
    slide_count: 36,
    download_url: '#',
    description: 'اسلایدهای تعاملی و پرزنتیشن رسمی کارگاه آموزش الزامات استاندارد ISO 10015 با دیاگرام‌های فرآیندی و ماتریس‌های شایستگی.',
    author: 'مهندس آرش رادمنش',
    study_duration_min: 45,
    allow_download: true,
    watermark_type: 'logo',
    uploaded_by: 'مهندس آرش رادمنش',
    created_at: '2026-01-23T09:00:00Z',
    branch: 'پالایشگاه اصفهان',
    branch_mode: 'public',
    tags: ['پاورپوینت', 'اسلاید', 'کارگاه']
  },
  {
    id: 'res_004',
    course_id: 'crs_iso_10015',
    title: 'پادکست صوتی: اشتباهات رایج در نیازسنجی آموزشی سازمان‌ها',
    category: 'audio_podcasts',
    file_type: 'mp3',
    file_name: 'TNA_Common_Mistakes_Podcast.mp3',
    file_size_mb: 28.5,
    download_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'تحلیل صوتی ۲۰ دقیقه‌ای در خصوص تفاوت نیازهای آموزشی سلیقه‌ای با شکاف‌های واقعی شایستگی شغلی.',
    author: 'استاد علی مهدوی',
    study_duration_min: 20,
    allow_download: true,
    uploaded_by: 'استاد علی مهدوی',
    created_at: '2026-01-23T11:15:00Z',
    branch: 'پالایشگاه اصفهان',
    branch_mode: 'public',
    tags: ['پادکست', 'نیازسنجی', 'صوت']
  },
  {
    id: 'res_005',
    course_id: 'crs_iso_10015',
    title: 'مجموعه فرم‌های اکسل استاندارد TNA و تقویم آموزشی (فرمت آماده)',
    category: 'templates_docs',
    file_type: 'xlsx',
    file_name: 'TNA_Matrix_Templates_2026.xlsx',
    file_size_mb: 1.8,
    download_url: '#',
    description: 'قالب‌های فرمول‌نویسی شده نیازسنجی، ماتریس مهارت پرسنل، شناسنامه شغل و برآورد ساعات دوره.',
    author: 'دکتر سارا صادقی',
    study_duration_min: 30,
    allow_download: true,
    uploaded_by: 'مهندس آرش رادمنش',
    created_at: '2026-01-24T09:20:00Z',
    branch: 'پالایشگاه اصفهان',
    branch_mode: 'public',
    tags: ['اکسل', 'تمپلیت', 'فرمول']
  },
  {
    id: 'res_006',
    course_id: 'crs_iso_10015',
    title: 'بانک نمونه سوالات تشریحی و تستی آزمون‌های سرممیزی ایزو ۱۰۰۱۵',
    category: 'sample_questions',
    file_type: 'pdf',
    file_name: 'Audit_Sample_Exams_QBank.pdf',
    file_size_mb: 3.1,
    download_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'مجموعه ۵۰ سوال تستی چهارگزینه‌ای و ۵ سناریوی حل مسئله ممیزی به همراه پاسخ تشریحی جامع.',
    author: 'استاد علی مهدوی',
    study_duration_min: 40,
    allow_download: true,
    uploaded_by: 'استاد علی مهدوی',
    created_at: '2026-01-26T16:00:00Z',
    branch: 'پالایشگاه اصفهان',
    branch_mode: 'public',
    tags: ['سوالات', 'آزمون', 'نمونه']
  },
  {
    id: 'res_007',
    course_id: 'crs_kirkpatrick',
    title: 'فرم اکسل محاسبه خودکار بازگشت سرمایه آموزشی (ROI Calculator)',
    category: 'templates_docs',
    file_type: 'xlsx',
    file_name: 'Phillips_ROI_Calculator_Pro.xlsx',
    file_size_mb: 2.4,
    download_url: '#',
    description: 'ابزار استاندارد فلیپس برای ثبت هزینه‌های مستقیم/غیرمستقیم و منافع ملموس/ناملموس به دست آمده.',
    author: 'دکتر سارا صادقی',
    study_duration_min: 25,
    allow_download: true,
    uploaded_by: 'دکتر سارا صادقی',
    created_at: '2026-01-27T10:45:00Z',
    branch: 'پالایشگاه اصفهان',
    branch_mode: 'public',
    tags: ['ROI', 'اکسل', 'سودآوری']
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exm_iso_pre',
    course_id: 'crs_iso_10015',
    title: 'پیش‌آزمون سنجش سطح آگاهی اولیه (Pre-Test) الزامات ISO 10015',
    exam_type: 'pre_test',
    duration_minutes: 20,
    passing_score: 50,
    total_questions: 4,
    status: 'published',
    is_offline_exam: false,
    created_at: '2026-01-20T08:30:00Z'
  },
  {
    id: 'exm_iso_post',
    course_id: 'crs_iso_10015',
    title: 'پس‌آزمون نهایی سنجش یادگیری (Post-Test & Kirkpatrick Level 2)',
    exam_type: 'post_test',
    duration_minutes: 30,
    passing_score: 70,
    total_questions: 5,
    status: 'published',
    is_offline_exam: true,
    created_at: '2026-01-20T09:00:00Z'
  },
  {
    id: 'exm_kirk_quiz',
    course_id: 'crs_kirkpatrick',
    title: 'کوئیز ارزیابی ابزارهای سنجش رفتار و نتایج سازمانی',
    exam_type: 'quiz',
    duration_minutes: 15,
    passing_score: 60,
    total_questions: 3,
    status: 'published',
    is_offline_exam: false,
    created_at: '2026-01-26T11:00:00Z'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'qst_01',
    exam_id: 'exm_iso_pre',
    question_text: 'هدف اصلی از تدوین استاندارد راهنمای ISO 10015 چیست؟',
    question_type: 'multiple_choice',
    options: [
      'کنترل و نظارت مالی بر قراردادهای آموزشی سازمان',
      'مدیریت شایستگی و آموزش و توسعه افراد جهت دستیابی به اهداف سازمانی',
      'صدور گواهینامه رانندگی و ایمنی برای پرسنل',
      'تنها طراحی دوره‌های آموزش از راه دور'
    ],
    correct_option_index: 1,
    score_weight: 25,
    explanation: 'استاندارد ISO 10015 راهنمایی برای مدیریت شایستگی و توسعه سیستماتیک افراد بر مبنای نیازهای کسب‌وکار است.'
  },
  {
    id: 'qst_02',
    exam_id: 'exm_iso_pre',
    question_text: 'چهار مرحله اصلی چرخه آموزش در استاندارد ایزو ۱۰۰۱۵ کدامند؟',
    question_type: 'multiple_choice',
    options: [
      'بودجه‌بندی، استخدام، آموزش، ترفیع شغلی',
      'نیازسنجی، طراحی و برنامه‌ریزی، تامین و اجرای آموزش، ارزیابی اثربخشی',
      'امتحان ورودی، تدریس، نمره‌دهی، فارغ‌التحصیلی',
      'تحلیل بازار، تبلیغات دوره، فروش، پشتیبانی'
    ],
    correct_option_index: 1,
    score_weight: 25,
    explanation: 'چرخه چهارگانه استاندارد شامل: ۱. تعیین نیازهای آموزشی ۲. طراحی و برنامه‌ریزی ۳. ارائه آموزش ۴. ارزیابی نتایج آموزش می‌باشد.'
  },
  {
    id: 'qst_03',
    exam_id: 'exm_iso_post',
    question_text: 'تعریف شایستگی (Competence) بر اساس استانداردهای بین‌المللی مدیریت کیفیت چیست؟',
    question_type: 'multiple_choice',
    options: [
      'تنها داشتن مدرک دانشگاهی معتبر از مراجع آموزش عالی',
      'توانایی به‌کارگیری دانش، مهارت‌ها و رفتارهای لازم جهت دستیابی به نتایج مورد انتظار',
      'سابقه کار بیش از ۱۰ سال در یک پست ثابت سازمانی',
      'عضویت در نظام‌های مهندسی یا تشکل‌های صنفی'
    ],
    correct_option_index: 1,
    score_weight: 20,
    explanation: 'شایستگی ترکیبی از دانش (Knowledge)، مهارت (Skills) و نگرش/رفتارها در محیط عملیاتی است.'
  },
  {
    id: 'qst_04',
    exam_id: 'exm_iso_post',
    question_text: 'در مرحله نیازسنجی آموزشی (TNA)، شکاف شایستگی چگونه شناسایی می‌شود؟',
    question_type: 'multiple_choice',
    options: [
      'با مقایسه شایستگی‌های مورد نیاز شغل با شایستگی‌های موجود شاغل',
      'با قرعه‌کشی میان پرسنل واحدهای مختلف',
      'صرفاً بر مبنای علاقه شخصی کارمند به گذراندن کلاس',
      'بر اساس میزان بودجه باقیمانده در انتهای سال مالی'
    ],
    correct_option_index: 0,
    score_weight: 20,
    explanation: 'شکاف شایستگی حاصل تفاضل صلاحیت‌های استاندارد شناسنامه شغل از وضعیت فعلی دارنده شغل است.'
  },
  {
    id: 'qst_05',
    exam_id: 'exm_iso_post',
    question_text: 'کدام گزینه ارزیابی سطح ۳ (رفتار) مدل کرک‌پاتریک را به درستی توصیف می‌کند؟',
    question_type: 'multiple_choice',
    options: [
      'تکمیل فرم نظرسنجی رضایت در روز آخر کلاس',
      'برگزاری امتحان کتبی بلافاصله پس از اتمام تدریس',
      'بررسی میزان به‌کارگیری آموخته‌ها در عملکرد روزمره شغلی پس از ۳۰ الی ۹۰ روز توسط سرپرست مستقیم',
      'محاسبه سود سهام شرکت در مجمع عمومی سالانه'
    ],
    correct_option_index: 2,
    score_weight: 20,
    explanation: 'سطح ۳ کرک‌پاتریک رفتار فراگیر در محیط کار را پس از گذشت زمان معقول (معمولاً ۱ تا ۳ ماه) ارزیابی می‌نماید.'
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr_01',
    course_id: 'crs_iso_10015',
    user_id: 'usr_learner_1',
    enrolled_at: '2026-01-20T10:00:00Z',
    progress_percent: 100,
    attendance_percent: 100,
    status: 'completed',
    final_grade: 92
  },
  {
    id: 'enr_02',
    course_id: 'crs_iso_10015',
    user_id: 'usr_learner_2',
    enrolled_at: '2026-01-20T10:15:00Z',
    progress_percent: 75,
    attendance_percent: 90,
    status: 'in_progress',
    final_grade: 84
  },
  {
    id: 'enr_03',
    course_id: 'crs_kirkpatrick',
    user_id: 'usr_learner_1',
    enrolled_at: '2026-01-26T09:00:00Z',
    progress_percent: 80,
    attendance_percent: 95,
    status: 'in_progress',
    final_grade: 88
  }
];

export const INITIAL_EXAM_ATTEMPTS: ExamAttempt[] = [
  {
    id: 'att_01',
    exam_id: 'exm_iso_pre',
    user_id: 'usr_learner_1',
    user_name: 'محمد رضایی',
    score: 50,
    total_score: 100,
    passed: true,
    submitted_at: '2026-01-20T09:00:00Z',
    answers: { qst_01: 1, qst_02: 0 },
    feedback: 'پیش‌آزمون با موفقیت ثبت شد (پایه یادگیری سنجیده شد).'
  },
  {
    id: 'att_02',
    exam_id: 'exm_iso_post',
    user_id: 'usr_learner_1',
    user_name: 'محمد رضایی',
    score: 95,
    total_score: 100,
    passed: true,
    submitted_at: '2026-01-28T17:30:00Z',
    answers: { qst_03: 1, qst_04: 0, qst_05: 2 },
    feedback: 'رشد یادگیری معادل ۹۰٪ محاسبه گردید. واجد شرایط دریافت گواهینامه معتبر صلاحیت شغلی.'
  }
];

export const INITIAL_KIRKPATRICK: KirkpatrickEvaluation[] = [
  {
    id: 'kirk_01',
    course_id: 'crs_iso_10015',
    course_title: 'دوره جامع مهندسی فرآیند و سیستم‌های تعالی سازمانی',
    user_id: 'usr_learner_1',
    user_name: 'محمد رضایی',
    level: 1,
    respondent_type: 'learner',
    scores: {
      satisfaction: 4.8,
      instructor_rating: 4.9,
      material_quality: 4.7,
      applicability: 4.8
    },
    comments: 'محتوای دوره بسیار کاربردی و منطبق با نیازهای تخصصی سازمان ما بود.',
    evaluation_date: '2026-01-28T18:00:00Z'
  },
  {
    id: 'kirk_02',
    course_id: 'crs_iso_10015',
    course_title: 'دوره جامع مهندسی فرآیند و سیستم‌های تعالی سازمانی',
    user_id: 'usr_learner_1',
    user_name: 'محمد رضایی',
    level: 2,
    respondent_type: 'evaluator',
    scores: {
      pre_test_score: 50,
      post_test_score: 95
    },
    comments: 'سنجش دانش: رشد ۴۵ نمره‌ای در نمرات پس‌آزمون نسبت به پیش‌آزمون (افزایش ۹۰ درصدی مهارت).',
    evaluation_date: '2026-01-29T10:00:00Z'
  },
  {
    id: 'kirk_03',
    course_id: 'crs_iso_10015',
    course_title: 'دوره جامع مهندسی فرآیند و سیستم‌های تعالی سازمانی',
    user_id: 'usr_learner_1',
    user_name: 'محمد رضایی',
    level: 3,
    respondent_type: 'supervisor',
    scores: {
      behavior_change_score: 4.6,
      workplace_implementation: 4.7
    },
    comments: 'ارزیابی ۶۰ روزه سرپرست: فراگیر فرآیندهای واحد را به‌طور کامل بازنگری و مستندسازی کرد.',
    evaluation_date: '2026-03-20T11:00:00Z'
  },
  {
    id: 'kirk_04',
    course_id: 'crs_iso_10015',
    course_title: 'دوره جامع مهندسی فرآیند و سیستم‌های تعالی سازمانی',
    user_id: 'usr_learner_1',
    user_name: 'محمد رضایی',
    level: 4,
    respondent_type: 'evaluator',
    scores: {
      kpi_impact_percent: 32, 
      roi_percent: 240 
    },
    comments: 'نتایج سازمانی: کاهش ۳۲ درصدی خطاهای عملیاتی و صرفه‌جویی در هزینه‌های مشاوره‌ای.',
    evaluation_date: '2026-04-15T09:30:00Z'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert_001',
    certificate_number: 'CERT-EDU-2026-089',
    user_id: 'usr_learner_1',
    user_name: 'محمد رضایی',
    course_id: 'crs_iso_10015',
    course_title: 'دوره جامع مهندسی فرآیند و سیستم‌های تعالی سازمانی',
    duration_hours: 24,
    grade: 92,
    issue_date: '2026-01-30T12:00:00Z',
    iso_compliance_code: 'VERIFIED-ID-9842',
    instructor_name: 'استاد علی مهدوی',
    is_valid: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    user_name: 'محمدرضا امیر یوسفی',
    user_role: 'super_admin',
    employee_id: '965505',
    username: '965505',
    department: 'اداره فناوری اطلاعات و ارتباطات',
    branch: 'پالایشگاه اصفهان',
    action: 'ورود به سیستم',
    entity: 'صفحه ورود',
    details: 'ورود موفق به پنل مدیریت سامانه با کد پرسنلی ۹۶۵۵۰۵',
    ip_address: '192.168.10.45',
    shamsi_date: '۱۴۰۵/۰۸/۱۴',
    time_str: '۱۴:۰۹:۰۴',
    timestamp: '2026-11-05T10:39:04Z'
  },
  {
    id: 'log_02',
    user_name: 'محمدرضا امیر یوسفی',
    user_role: 'super_admin',
    employee_id: '965505',
    username: '965505',
    department: 'اداره فناوری اطلاعات و ارتباطات',
    branch: 'پالایشگاه اصفهان',
    action: 'ویرایش تنظیمات امنیتی',
    entity: 'قوانین امنیتی و کپچا',
    details: 'بروزرسانی ساختار عبارت امنیتی کپچا و فعال‌سازی احراز هویت با کد پرسنلی',
    ip_address: '192.168.10.45',
    shamsi_date: '۱۴۰۵/۰۸/۱۴',
    time_str: '۱۴:۰۸:۲۲',
    timestamp: '2026-11-05T10:38:22Z'
  },
  {
    id: 'log_03',
    user_name: 'دکتر سارا صادقی',
    user_role: 'class_manager',
    employee_id: '965744',
    username: '965744',
    department: 'اداره آموزش و تجهیز نیروی انسانی',
    branch: 'پالایشگاه اصفهان',
    action: 'ارسال نمره کلاس',
    entity: 'کلاس‌های آموزشی',
    details: 'ثبت و نهایی‌سازی نمرات کلاسی دوره جامع ایمنی پالایشگاهی',
    ip_address: '192.168.10.60',
    shamsi_date: '۱۴۰۵/۰۸/۱۴',
    time_str: '۱۳:۴۵:۱۲',
    timestamp: '2026-11-05T10:15:12Z'
  },
  {
    id: 'log_04',
    user_name: 'استاد علی مهدوی',
    user_role: 'instructor',
    employee_id: '964819',
    username: '964819',
    department: 'دپارتمان مهندسی شیمی و فرآیند',
    branch: 'پالایشگاه اصفهان',
    action: 'بارگذاری محتوا',
    entity: 'منابع آموزشی چندرسانه‌ای',
    details: 'بارگذاری ویدیوی آموزشی جلسه چهارم و جزوه تکمیلی دوره',
    ip_address: '192.168.12.10',
    shamsi_date: '۱۴۰۵/۰۸/۱۴',
    time_str: '۱۱:۲۰:۱۸',
    timestamp: '2026-11-05T07:50:18Z'
  },
  {
    id: 'log_05',
    user_name: 'محمد رضایی',
    user_role: 'learner',
    employee_id: '965780',
    username: '965780',
    department: 'واحد تعمیرات و نگهداری مکانیک',
    branch: 'پالایشگاه اصفهان',
    action: 'پایان آزمون',
    entity: 'آزمون آنلاین',
    details: 'پایان موفقیت‌آمیز آزمون جامع ایمنی صنعتی و ثبت پاسخنامه',
    ip_address: '192.168.14.22',
    shamsi_date: '۱۴۰۵/۰۸/۱۴',
    time_str: '۱۰:۴۲:۳۰',
    timestamp: '2026-11-05T07:12:30Z'
  },
  {
    id: 'log_06',
    user_name: 'محمد رضایی',
    user_role: 'learner',
    employee_id: '965780',
    username: '965780',
    department: 'واحد تعمیرات و نگهداری مکانیک',
    branch: 'پالایشگاه اصفهان',
    action: 'آغاز آزمون',
    entity: 'آزمون آنلاین',
    details: 'شروع آزمون جامع ایمنی صنعتی و پاسخ‌گویی به سوالات چهارگزینه‌ای',
    ip_address: '192.168.14.22',
    shamsi_date: '۱۴۰۵/۰۸/۱۴',
    time_str: '۱۰:۱۵:۰۲',
    timestamp: '2026-11-05T06:45:02Z'
  },
  {
    id: 'log_07',
    user_name: 'علی اکبری',
    user_role: 'learner',
    employee_id: '965781',
    username: '965781',
    department: 'واحد تقطیر و فرآورش نفت',
    branch: 'پالایشگاه اصفهان',
    action: 'دانلود فایل',
    entity: 'منابع درسی',
    details: 'دانلود فایل PDF استاندارد ISO 10015 و راهنمای فرآیند',
    ip_address: '192.168.14.35',
    shamsi_date: '۱۴۰۵/۰۸/۱۴',
    time_str: '۰۹:۱۱:۴۰',
    timestamp: '2026-11-05T05:41:40Z'
  },
  {
    id: 'log_08',
    user_name: 'کاربر ناشناس',
    user_role: 'guest' as any,
    employee_id: '965999',
    username: '965999',
    department: 'نامشخص',
    branch: 'پالایشگاه اصفهان',
    action: 'ورود ناموفق',
    entity: 'کنترل امنیتی ورود',
    details: 'تلاش ناموفق برای ورود با رمز نادرست برای کد ۹۶۵۹۹۹',
    ip_address: '192.168.10.88',
    shamsi_date: '۱۴۰۵/۰۸/۱۴',
    time_str: '۰۸:۵۰:۱۴',
    timestamp: '2026-11-05T05:20:14Z'
  }
];

export const INITIAL_SESSIONS: ClassSession[] = [
  {
    id: 'ses_01',
    code: '10',
    title: 'جلسه پرسش و پاسخ ۲ - رفع اشکال کلاسی',
    course_id: 'crs_iso_10015',
    course_title: 'دوره جامع مهندسی فرآیند و سیستم‌های تعالی سازمانی',
    branch: 'پالایشگاه اصفهان',
    start_date: '۱۴۰۴/۰۲/۲۱',
    end_date: '۱۴۰۵/۰۲/۳۱',
    session_type: 'online_qa',
    is_live: true,
    attendees_count: 2,
    instructors_count: 0,
    managers_count: 1,
    status: 'active'
  },
  {
    id: 'ses_02',
    code: '12',
    title: 'تست جلسات آنلاین - رفع اشکال',
    course_id: 'crs_iso_10015',
    course_title: 'دوره جامع مهندسی فرآیند و سیستم‌های تعالی سازمانی',
    branch: 'پالایشگاه اصفهان',
    start_date: '۱۴۰۵/۰۲/۲۲',
    end_date: '۱۴۰۵/۰۴/۳۱',
    session_type: 'workshop',
    is_live: false,
    attendees_count: 14,
    instructors_count: 1,
    managers_count: 1,
    status: 'active'
  },
  {
    id: 'ses_03',
    code: '14',
    title: 'کارگاه ممیزی فرآیند و ایمنی پیشرفته',
    course_id: 'crs_iso_10015',
    course_title: 'دوره جامع مهندسی فرآیند و سیستم‌های تعالی سازمانی',
    branch: 'پالایشگاه اصفهان',
    start_date: '۱۴۰۵/۰۵/۱۰',
    end_date: '۱۴۰۵/۰۶/۲۰',
    session_type: 'recorded',
    is_live: false,
    attendees_count: 32,
    instructors_count: 1,
    managers_count: 1,
    status: 'completed'
  }
];

export const INITIAL_ORG_UNITS: OrgUnit[] = [
  {
    id: 'unit_ops',
    code: 'OPS-100',
    name: 'مدیریت عملیات و پالایش نفت',
    manager_name: 'مهندس محمدرضا امیریوسفی',
    description: 'واحدهای تقطیر در اتمسفر و خلاء، هیدروکراکینگ، ایزومریزاسیون و بازیابی گوگرد',
    employee_count: 145
  },
  {
    id: 'unit_hse',
    code: 'HSE-200',
    name: 'اداره سلامت، ایمنی و محیط‌زیست (HSE)',
    manager_name: 'دکتر علیرضا کاویانی',
    description: 'مدیریت ایمنی فرآیند (PSM)، آتش‌نشانی، پدافند غیرعامل و کنترل آلاینده‌های زیست‌محیطی',
    employee_count: 52
  },
  {
    id: 'unit_maint',
    code: 'MNT-300',
    name: 'مدیریت نگهداری و تعمیرات فنی (نت)',
    manager_name: 'مهندس حسام داوودی',
    description: 'تعمیرات اساسی، ماشین‌آلات دوار، برق و ابزاردقیق، بازرسی فنی و پایش وضعیت CBM',
    employee_count: 110
  },
  {
    id: 'unit_process',
    code: 'ENG-400',
    name: 'مهندسی فرآیند و کنترل کیفیت',
    manager_name: 'مهندس فرناز سپهری',
    description: 'شبیه‌سازی فرآیندی، بهینه‌سازی کاتالیست‌ها، موازنه انرژی و کنترل کیفیت فرآورده‌ها',
    employee_count: 38
  },
  {
    id: 'unit_hrd',
    code: 'HRD-500',
    name: 'توسعه منابع انسانی و آموزش',
    manager_name: 'دکتر بهرام سرمد',
    description: 'برنامه‌ریزی شایستگی‌های شغلی، جانشین‌پروری، سنجش اثربخشی و ارتقای شایستگی پرسنل',
    employee_count: 24
  }
];

export const INITIAL_JOB_PROFILES: JobProfile[] = [
  {
    id: 'job_ops_01',
    job_code: 'JOB-OPS-01',
    title: 'کارشناس فرآیند تقطیر و تفکیک نفت خام',
    org_unit_id: 'unit_ops',
    org_unit_name: 'مدیریت عملیات و پالایش نفت',
    grade_level: 'رده ۱۱ - کارشناسی',
    education_requirement: 'کارشناسی مهندسی شیمی / نفت / صنایع پتروشیمی',
    experience_years_required: 2,
    general_competencies: ['کار تیمی در محیط‌های صنعتی', 'ارتباطات اثربخش شیفت', 'گزارش‌نویسی فنی'],
    technical_competencies: ['موازنه‌های جرمی و حرارتی برج تقطیر', 'نقشه‌خوانی استانداردهای P&ID', 'عملکرد پمپ‌ها و تجهیزات تبادل حرارت'],
    next_promotion_job_ids: ['job_ops_02'],
    created_at: '۱۴۰۴/۱۰/۰۱',
    required_courses: [
      {
        id: 'req_c1',
        course_name: 'اصول بهره‌برداری برج‌های تقطیر اتمسفری و خلاء',
        duration_hours: 24,
        category: 'تخصصی',
        is_mandatory: true,
        min_score: 75,
        description: 'آشنایی با متغیرهای عملیاتی رفلاکس، فشار، پروفایل دمایی سینی‌ها و تفکیک برش‌ها'
      },
      {
        id: 'req_c2',
        course_name: 'مبانی ایمنی فرآیند و دستورالعمل پروانه‌های کار (PTW)',
        duration_hours: 16,
        category: 'ایمنی و HSE',
        is_mandatory: true,
        min_score: 80,
        description: 'قوانین ورود به فضاهای بسته، ایزولاسیون مکانیکی و گازسنجی مخازن هیدروکربوری'
      },
      {
        id: 'req_c3',
        course_name: 'کنترل عملیاتی پمپ‌ها، توربین‌ها و کمپرسورهای فرآیندی',
        duration_hours: 20,
        category: 'تخصصی',
        is_mandatory: true,
        min_score: 70,
        description: 'عیب‌یابی کاویتاسیون، سرج کمپرسور و پایش متغیرهای ارتعاشی در سایت عملیات'
      }
    ]
  },
  {
    id: 'job_ops_02',
    job_code: 'JOB-OPS-02',
    title: 'کارشناس ارشد اتاق کنترل عملیات (DCS)',
    org_unit_id: 'unit_ops',
    org_unit_name: 'مدیریت عملیات و پالایش نفت',
    grade_level: 'رده ۱۳ - کارشناسی ارشد',
    education_requirement: 'کارشناسی یا کارشناسی ارشد مهندسی شیمی / نفت',
    experience_years_required: 5,
    general_competencies: ['مدیریت استرس در شرایط اضطراری', 'حل مسئله و تصمیم‌گیری سریع', 'هماهنگی تیم‌های سایت'],
    technical_competencies: ['سیستم‌های کنترل توزیع‌شده DCS یوکوگاوا و هانیول', 'منطق‌های اینترلاک و ESD', 'کنترل پیشرفته فرآیند APC'],
    next_promotion_job_ids: ['job_ops_03'],
    created_at: '۱۴۰۴/۱۰/۰۱',
    required_courses: [
      {
        id: 'req_c4',
        course_name: 'مدیریت آلارم‌ها و سناریوهای اضطراری در سیستم DCS',
        duration_hours: 32,
        category: 'تخصصی',
        is_mandatory: true,
        min_score: 80,
        description: 'بررسی ریشه‌ای حوادث، پایش سیل آلارم‌ها و اقدامات فوری پایدارسازی فرآیند'
      },
      {
        id: 'req_c5',
        course_name: 'تحلیل مخاطرات فرآیندی و ممیزی ایمنی به روش HAZOP & LOPA',
        duration_hours: 24,
        category: 'ایمنی و HSE',
        is_mandatory: true,
        min_score: 75,
        description: 'شناسایی انحرافات عملیاتی، عوامل ایجاد خطر و ارزیابی لایه‌های حفاظتی مستقل'
      },
      {
        id: 'req_c6',
        course_name: 'بهینه‌سازی راکتورهای هیدروکراکینگ و واکنش‌های کاتالیستی',
        duration_hours: 28,
        category: 'تخصصی',
        is_mandatory: true,
        min_score: 75,
        description: 'کنترل دمای راکتورهای تحت فشار هیدروژن، مهار واکنش‌های گرمازای شدید و افزایش طول عمر کاتالیست'
      },
      {
        id: 'req_c7',
        course_name: 'سیستم‌های توقف اضطراری ESD و استانداردهای IEC 61511',
        duration_hours: 20,
        category: 'تخصصی',
        is_mandatory: true,
        min_score: 80,
        description: 'طراحی سطوح یکپارچگی ایمنی SIL و مکانیزم‌های قطع سریع جریان خوراک'
      }
    ]
  },
  {
    id: 'job_ops_03',
    job_code: 'JOB-OPS-03',
    title: 'سرپرست شیفت عملیات و بهره‌برداری پالایشگاه',
    org_unit_id: 'unit_ops',
    org_unit_name: 'مدیریت عملیات و پالایش نفت',
    grade_level: 'رده ۱۵ - سرپرستی ارشد',
    education_requirement: 'کارشناسی یا بالاتر مهندسی با حداقل ۸ سال سابقه عملیاتی',
    experience_years_required: 8,
    general_competencies: ['رهبری تیم‌های نوبت‌کاری', 'مدیریت منابع در شیفت‌های شب', 'مذاکره و حل تعارض سازمانی'],
    technical_competencies: ['فرماندهی حوادث صنعتی پالایشگاهی', 'ممیزی جامع ایمنی شیفت', 'پایش شاخص‌های عملکرد روزانه کل واحدها'],
    next_promotion_job_ids: ['job_ops_04'],
    created_at: '۱۴۰۴/۱۰/۰۱',
    required_courses: [
      {
        id: 'req_c8',
        course_name: 'مهارت‌های نوین سرپرستی و رهبری تیم‌های عملیاتی شیفت',
        duration_hours: 36,
        category: 'مدیریتی و سرپرستی',
        is_mandatory: true,
        min_score: 80,
        description: 'روانشناسی محیط کار نوبت‌کاری، انگیزش پرسنل و انتقال شفاف اطلاعات در تعویض شیفت'
      },
      {
        id: 'req_c9',
        course_name: 'فرماندهی صحنه حادثه و مدیریت بحران‌های صنعتی (ICS 300)',
        duration_hours: 30,
        category: 'ایمنی و HSE',
        is_mandatory: true,
        min_score: 85,
        description: 'طرح واکنش در شرایط اضطراری ERP، تخلیه اضطراری، کنترل نشت گاز سمی H2S و هماهنگی آتش‌نشانی'
      },
      {
        id: 'req_c10',
        course_name: 'قوانین کار، ایمنی کارگاهی و ارزیابی شایستگی‌های عملکرد پرسنل',
        duration_hours: 20,
        category: 'مدیریتی و سرپرستی',
        is_mandatory: true,
        min_score: 75,
        description: 'آیین‌نامه‌های انضباطی، بازخورددهی سازنده و مستندسازی تخلفات و تشویق‌های کارکنان'
      },
      {
        id: 'req_c11',
        course_name: 'مدیریت ریسک دارایی‌های فیزیکی و پایش توقفات ناخواسته (RCFA)',
        duration_hours: 24,
        category: 'تخصصی',
        is_mandatory: true,
        min_score: 75,
        description: 'تحلیل علل ریشه‌ای از کار افتادگی تجهیزات، کاهش ضایعات فلرینگ و ارتقای ضریب در دسترس بودن'
      }
    ]
  },
  {
    id: 'job_ops_04',
    job_code: 'JOB-OPS-04',
    title: 'رئیس واحد پالایش و تقطیر نفت خام',
    org_unit_id: 'unit_ops',
    org_unit_name: 'مدیریت عملیات و پالایش نفت',
    grade_level: 'رده ۱۷ - مدیریت پایه',
    education_requirement: 'کارشناسی ارشد مهندسی شیمی / نفت / MBA مدیریت اجرایی با ۱۲ سال سابقه',
    experience_years_required: 12,
    general_competencies: ['برنامه‌ریزی استراتژیک تولید', 'تفکر سیستمی و بهبود بهره‌وری', 'رهبری تحول سازمانی'],
    technical_competencies: ['مدیریت زنجیره ارزش پالایشگاه', 'استاندارد مدیریت دارایی‌های فیزیکی ISO 55001', 'مدیریت بودجه عملیاتی OPEX'],
    next_promotion_job_ids: [],
    created_at: '۱۴۰۴/۱۰/۰۱',
    required_courses: [
      {
        id: 'req_c12',
        course_name: 'بودجه‌ریزی بر مبنای عملکرد و مدیریت هزینه‌های عملیاتی در صنعت نفت',
        duration_hours: 32,
        category: 'مدیریتی و سرپرستی',
        is_mandatory: true,
        min_score: 80,
        description: 'کنترل هزینه‌های تعمیراتی، مدیریت مصرف انرژی و تحلیل سودآوری پالایشگاه'
      },
      {
        id: 'req_c13',
        course_name: 'مدیریت استراتژیک عملیات و شاخص‌های کلیدی بهره‌وری (KPIs)',
        duration_hours: 30,
        category: 'مدیریتی و سرپرستی',
        is_mandatory: true,
        min_score: 80,
        description: 'طراحی داشبوردهای مدیریتی، پایش راندمان حرارتی و سنجش عملکرد واحدهای تقطیر'
      },
      {
        id: 'req_c14',
        course_name: 'پیاده‌سازی استاندارد بین‌المللی مدیریت دارایی‌های فیزیکی ISO 55000',
        duration_hours: 24,
        category: 'مدیریتی و سرپرستی',
        is_mandatory: true,
        min_score: 75,
        description: 'چرخه عمر تجهیزات، استراتژی‌های تعویض و بازسازی تاسیسات فرآیندی'
      }
    ]
  },
  {
    id: 'job_hse_01',
    job_code: 'JOB-HSE-01',
    title: 'کارشناس ایمنی، بهداشت و حفاظت فنی',
    org_unit_id: 'unit_hse',
    org_unit_name: 'اداره سلامت، ایمنی و محیط‌زیست (HSE)',
    grade_level: 'رده ۱۱ - کارشناسی',
    education_requirement: 'کارشناسی مهندسی بهداشت حرفه‌ای / مهندسی ایمنی صنعتی / محیط زیست',
    experience_years_required: 2,
    general_competencies: ['دقت بالا در ممیزی میدانی', 'قاطعیت در اجرای استانداردهای ایمنی', 'آموزش پرسنل کارگاهی'],
    technical_competencies: ['بازرسی فنی سیستم‌های اطفای حریق', 'گازسنجی پرتابل و آنلاین', 'ممیزی کار در ارتفاع و فضاهای محصور'],
    next_promotion_job_ids: ['job_hse_02'],
    created_at: '۱۴۰۴/۱۰/۰۱',
    required_courses: [
      {
        id: 'req_h1',
        course_name: 'الزامات جامع پروانه‌های کار گرم، سرد و تشعشع (PTW)',
        duration_hours: 20,
        category: 'ایمنی و HSE',
        is_mandatory: true,
        min_score: 85,
        description: 'صدور، تمدید و ابطال انواع مجوزهای کاری پالایشگاهی و کنترل ریسک‌های همزمان'
      },
      {
        id: 'req_h2',
        course_name: 'سیستم‌های گازسنجی و پایش اتمسفرهای خطرناک هیدروکربوری و H2S',
        duration_hours: 18,
        category: 'ایمنی و HSE',
        is_mandatory: true,
        min_score: 80,
        description: 'کالیبراسیون دتکتورها، حد مجاز LEL و اقدامات حفاظتی هنگام مواجهه با گازهای کشنده'
      },
      {
        id: 'req_h3',
        course_name: 'روش‌های اطفا حریق مخازن ذخیره نفت خام و تاسیسات فرآیندی',
        duration_hours: 24,
        category: 'ایمنی و HSE',
        is_mandatory: true,
        min_score: 75,
        description: 'کار با سیستم‌های فوم دلکتور، کولینگ بدنه مخازن و پمپ‌های آتش‌نشانی پرفشار'
      }
    ]
  },
  {
    id: 'job_hse_02',
    job_code: 'JOB-HSE-02',
    title: 'کارشناس ارشد ایمنی فرآیند (PSM) و ارزیابی ریسک',
    org_unit_id: 'unit_hse',
    org_unit_name: 'اداره سلامت، ایمنی و محیط‌زیست (HSE)',
    grade_level: 'رده ۱۴ - کارشناسی ارشد',
    education_requirement: 'کارشناسی ارشد ایمنی صنعتی / مهندسی شیمی با ۵ سال سابقه',
    experience_years_required: 5,
    general_competencies: ['تحلیل داده‌های آماری حوادث', 'مستندسازی گزارشات رسمی ممیزی', 'مذاکره فنی با مدیران تولید'],
    technical_competencies: ['پیاده‌سازی ۱۴ عنصر OSHA PSM', 'نرم‌افزارهای شبیه‌سازی انتشار گاز و انفجار Phast', 'ارزیابی ریسک به روش Bow-Tie'],
    next_promotion_job_ids: [],
    created_at: '۱۴۰۴/۱۰/۰۱',
    required_courses: [
      {
        id: 'req_h4',
        course_name: 'استقرار جامع مدیریت ایمنی فرآیند (OSHA 1910.119 PSM)',
        duration_hours: 40,
        category: 'ایمنی و HSE',
        is_mandatory: true,
        min_score: 85,
        description: 'مدیریت تغییر (MOC)، یکپارچگی مکانیکی، مشارکت کارکنان و پیشگیری از حوادث فرآیندی'
      },
      {
        id: 'req_h5',
        course_name: 'مدل‌سازی و تحلیل پیامد حوادث انفجار و نشت با نرم‌افزار Phast',
        duration_hours: 32,
        category: 'تخصصی',
        is_mandatory: true,
        min_score: 80,
        description: 'شبیه‌سازی حریق استخری، BLEVE و ابر بخار آتش‌گیر VCE در مجاورت شهرک‌های مسکونی'
      },
      {
        id: 'req_h6',
        course_name: 'تکنیک‌های پیشرفته ارزیابی ریسک به روش Bow-Tie و تحلیل مانع',
        duration_hours: 24,
        category: 'تخصصی',
        is_mandatory: true,
        min_score: 80,
        description: 'ترسیم دیاگرام‌های پاپیونی، موانع پیشگیرانه و موانع کاهش اثرات پیامدهای وخیم'
      }
    ]
  }
];

export const INITIAL_PROMOTION_PLANS: PromotionPlan[] = [
  {
    id: 'prp_001',
    personnel_id: 'usr_learner_1',
    personnel_name: 'احمد مرادی',
    employee_id: 'EMP-4482',
    national_id: '1289945120',
    department: 'مدیریت عملیات و پالایش نفت',
    current_job_id: 'job_ops_01',
    current_job_title: 'کارشناس فرآیند تقطیر و تفکیک نفت خام',
    target_job_id: 'job_ops_02',
    target_job_title: 'کارشناس ارشد اتاق کنترل عملیات (DCS)',
    planning_horizon: 'بازه ۶ ماهه (۱۴۰۵/۰۹/۰۱ لغایت ۱۴۰۶/۰۲/۳۰)',
    start_date: '۱۴۰۵/۰۹/۰۱',
    end_date: '۱۴۰۶/۰۲/۳۰',
    readiness_score: 45,
    total_hours_required: 104,
    completed_hours: 48,
    status: 'in_progress',
    created_at: '۱۴۰۵/۰۸/۱۵',
    approved_by: 'مهندس محمدرضا امیریوسفی',
    notes: 'نامبرده در کانون ارزیابی شایستگی‌های اتاق کنترل نمره بالایی اخذ نموده و جهت احراز پست DCS دوره‌های مربوطه برنامه‌ریزی شد.',
    courses_schedule: [
      {
        id: 'psch_1',
        course_name: 'مدیریت آلارم‌ها و سناریوهای اضطراری در سیستم DCS',
        duration_hours: 32,
        category: 'تخصصی',
        planned_start_date: '۱۴۰۵/۰۹/۰۵',
        planned_end_date: '۱۴۰۵/۱۰/۱۰',
        target_quarter: 'ماه اول و دوم',
        status: 'completed',
        priority: 'high',
        instructor_name: 'مهندس حسام داوودی',
        passed_grade: 88,
        notes: 'دوره با موفقیت گذرانده شد.'
      },
      {
        id: 'psch_2',
        course_name: 'تحلیل مخاطرات فرآیندی و ممیزی ایمنی به روش HAZOP & LOPA',
        duration_hours: 24,
        category: 'ایمنی و HSE',
        planned_start_date: '۱۴۰۵/۱۰/۱۵',
        planned_end_date: '۱۴۰۵/۱۱/۲۰',
        target_quarter: 'ماه دوم و سوم',
        status: 'in_progress',
        priority: 'high',
        instructor_name: 'دکتر علیرضا کاویانی',
        notes: 'جلسات کارگاهی در حال برگزاری است.'
      },
      {
        id: 'psch_3',
        course_name: 'بهینه‌سازی راکتورهای هیدروکراکینگ و واکنش‌های کاتالیستی',
        duration_hours: 28,
        category: 'تخصصی',
        planned_start_date: '۱۴۰۵/۱۱/۲۵',
        planned_end_date: '۱۴۰۵/۱۲/۲۸',
        target_quarter: 'ماه سوم و چهارم',
        status: 'not_started',
        priority: 'medium',
        instructor_name: 'مهندس فرناز سپهری'
      },
      {
        id: 'psch_4',
        course_name: 'سیستم‌های توقف اضطراری ESD و استانداردهای IEC 61511',
        duration_hours: 20,
        category: 'تخصصی',
        planned_start_date: '۱۴۰۶/۰۱/۱۵',
        planned_end_date: '۱۴۰۶/۰۲/۲۰',
        target_quarter: 'ماه پنجم و ششم',
        status: 'not_started',
        priority: 'high',
        instructor_name: 'مهندس محمدرضا امیریوسفی'
      }
    ]
  },
  {
    id: 'prp_002',
    personnel_id: 'usr_learner_2',
    personnel_name: 'سارا کاظمی',
    employee_id: 'EMP-5921',
    national_id: '1270034891',
    department: 'اداره سلامت، ایمنی و محیط‌زیست (HSE)',
    current_job_id: 'job_hse_01',
    current_job_title: 'کارشناس ایمنی، بهداشت و حفاظت فنی',
    target_job_id: 'job_hse_02',
    target_job_title: 'کارشناس ارشد ایمنی فرآیند (PSM) و ارزیابی ریسک',
    planning_horizon: 'بازه ۹ ماهه (۱۴۰۵/۰۹/۰۱ لغایت ۱۴۰۶/۰۵/۳۰)',
    start_date: '۱۴۰۵/۰۹/۰۱',
    end_date: '۱۴۰۶/۰۵/۳۰',
    readiness_score: 25,
    total_hours_required: 96,
    completed_hours: 24,
    status: 'in_progress',
    created_at: '۱۴۰۵/۰۸/۲۰',
    approved_by: 'دکتر بهرام سرمد',
    notes: 'طرح توسعه شایستگی تخصصی ایمنی فرآیند جهت ارتقا به رتبه ۱۴ سازمانی.',
    courses_schedule: [
      {
        id: 'psch_5',
        course_name: 'استقرار جامع مدیریت ایمنی فرآیند (OSHA 1910.119 PSM)',
        duration_hours: 40,
        category: 'ایمنی و HSE',
        planned_start_date: '۱۴۰۵/۰۹/۱۰',
        planned_end_date: '۱۴۰۵/۱۱/۱۰',
        target_quarter: 'سه ماهه اول',
        status: 'in_progress',
        priority: 'high',
        instructor_name: 'دکتر علیرضا کاویانی'
      },
      {
        id: 'psch_6',
        course_name: 'مدل‌سازی و تحلیل پیامد حوادث انفجار و نشت با نرم‌افزار Phast',
        duration_hours: 32,
        category: 'تخصصی',
        planned_start_date: '۱۴۰۵/۱۱/۱۵',
        planned_end_date: '۱۴۰۶/۰۲/۱۵',
        target_quarter: 'سه ماهه دوم',
        status: 'not_started',
        priority: 'high',
        instructor_name: 'مهندس فرناز سپهری'
      },
      {
        id: 'psch_7',
        course_name: 'تکنیک‌های پیشرفته ارزیابی ریسک به روش Bow-Tie و تحلیل مانع',
        duration_hours: 24,
        category: 'تخصصی',
        planned_start_date: '۱۴۰۶/۰۲/۲۰',
        planned_end_date: '۱۴۰۶/۰۵/۲۰',
        target_quarter: 'سه ماهه سوم',
        status: 'not_started',
        priority: 'medium',
        instructor_name: 'دکتر علیرضا کاویانی'
      }
    ]
  }
];

