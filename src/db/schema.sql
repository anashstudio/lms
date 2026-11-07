-- ========================================================
-- ISO 10015 & Kirkpatrick Enterprise LMS SQL Schema
-- Compatible with PostgreSQL, MySQL 8+, SQLite 3
-- ========================================================

-- 1. System Settings & White-Label Table
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(50) PRIMARY KEY,
    app_name VARCHAR(255) NOT NULL,
    org_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    theme_color VARCHAR(50) DEFAULT 'emerald',
    header_subtitle VARCHAR(255),
    footer_text TEXT,
    is_installed BOOLEAN DEFAULT FALSE,
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_email VARCHAR(255),
    db_engine VARCHAR(100) DEFAULT 'PostgreSQL Compatible',
    iso_standards_version VARCHAR(50) DEFAULT 'ISO 10015:2019'
);

-- 2. Users Table (با تفکیک کامل نام کاربری، کد ملی و هش کلمه عبور)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL, -- نام کاربری مستقل و منحصر به فرد
    national_id VARCHAR(10) UNIQUE NOT NULL, -- کد ملی ۱۰ رقمی مستقل
    password_hash VARCHAR(255) NOT NULL, -- هش امنیتی کلمه عبور
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) NOT NULL CHECK (role IN ('super_admin', 'class_manager', 'instructor', 'learner')),
    department VARCHAR(100),
    job_title VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    avatar_url TEXT,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ISO 10015 Training Needs Analysis (TNA) Table
CREATE TABLE IF NOT EXISTS tna_records (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_titles TEXT NOT NULL, -- JSON array of string job titles
    competency_gap TEXT NOT NULL,
    proposed_course_title VARCHAR(255) NOT NULL,
    target_trainees_count INT DEFAULT 1,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    year INT NOT NULL,
    status VARCHAR(20) DEFAULT 'in_review' CHECK (status IN ('approved', 'in_review', 'completed')),
    justification TEXT
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    duration_hours INT NOT NULL DEFAULT 8,
    instructor_id VARCHAR(50) REFERENCES users(id),
    instructor_name VARCHAR(150),
    class_manager_id VARCHAR(50) REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    iso_phase VARCHAR(30) DEFAULT 'execution' CHECK (iso_phase IN ('tna', 'design_planning', 'execution', 'evaluation')),
    target_audience TEXT,
    cover_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Offline Lessons / Sessions Table
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    session_number INT NOT NULL,
    description TEXT,
    video_url TEXT,
    audio_url TEXT,
    duration_minutes INT DEFAULT 45,
    slides_pdf_url TEXT,
    session_notes TEXT,
    order_index INT DEFAULT 1
);

-- 6. Course Resources (Categorized Library) Table
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('books_handouts', 'videos', 'audio_podcasts', 'templates_docs', 'sample_questions')),
    file_type VARCHAR(20) NOT NULL,
    file_size_mb DECIMAL(6,2) DEFAULT 0,
    download_url TEXT,
    description TEXT,
    uploaded_by VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Course Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_percent INT DEFAULT 0,
    attendance_percent INT DEFAULT 100,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
    final_grade DECIMAL(5,2)
);

-- 8. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    exam_type VARCHAR(30) NOT NULL CHECK (exam_type IN ('pre_test', 'post_test', 'final_exam', 'quiz')),
    duration_minutes INT DEFAULT 30,
    passing_score INT DEFAULT 70,
    total_questions INT DEFAULT 10,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    is_offline_exam BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Exam Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    exam_id VARCHAR(50) REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'descriptive')),
    options TEXT NOT NULL, -- JSON array of 4 options
    correct_option_index INT DEFAULT 0,
    score_weight INT DEFAULT 10,
    explanation TEXT
);

-- 10. Exam Attempts & Results Table
CREATE TABLE IF NOT EXISTS exam_attempts (
    id VARCHAR(50) PRIMARY KEY,
    exam_id VARCHAR(50) REFERENCES exams(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(150),
    score DECIMAL(5,2) NOT NULL,
    total_score DECIMAL(5,2) NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answers TEXT, -- JSON map of responses
    feedback TEXT
);

-- 11. Kirkpatrick Evaluations (Levels 1 to 4) Table
CREATE TABLE IF NOT EXISTS kirkpatrick_evaluations (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    course_title VARCHAR(255),
    user_id VARCHAR(50) REFERENCES users(id),
    user_name VARCHAR(150),
    level INT NOT NULL CHECK (level IN (1, 2, 3, 4)),
    respondent_type VARCHAR(30) CHECK (respondent_type IN ('learner', 'supervisor', 'evaluator')),
    scores TEXT NOT NULL, -- JSON formatted evaluation criteria
    comments TEXT,
    evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(50) PRIMARY KEY,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(150),
    course_id VARCHAR(50) REFERENCES courses(id),
    course_title VARCHAR(255),
    duration_hours INT DEFAULT 16,
    grade DECIMAL(5,2) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    iso_compliance_code VARCHAR(100) DEFAULT 'ISO-10015-CERT-2026',
    instructor_name VARCHAR(150),
    is_valid BOOLEAN DEFAULT TRUE
);

-- 13. System Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(30) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
