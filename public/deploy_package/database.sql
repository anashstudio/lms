-- ========================================================
-- پایگاه داده جامع سامانه مدیریت آموزش و توانمندسازی سازمانی
-- Collation: utf8mb4_persian_ci
-- سازگار با MySQL 5.7+ و MariaDB 10.3+ و MySQL 8.0+
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- 1. جدول کاربران (مدیران، مدرسان، فراگیران)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `national_id` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(191) NULL,
  `mobile` VARCHAR(20) NULL,
  `role` ENUM('learner', 'instructor', 'course_manager', 'super_admin') NOT NULL DEFAULT 'learner',
  `department` VARCHAR(191) NULL,
  `job_title` VARCHAR(191) NULL,
  `personnel_code` VARCHAR(50) NULL,
  `avatar` TEXT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_national_id` (`national_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 2. جدول دوره‌های آموزشی
CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `duration_hours` INT UNSIGNED NOT NULL DEFAULT 0,
  `instructor_id` VARCHAR(64) NULL,
  `instructor_name` VARCHAR(191) NULL,
  `status` ENUM('draft', 'scheduled', 'in_progress', 'completed', 'archived') NOT NULL DEFAULT 'draft',
  `capacity` INT UNSIGNED NOT NULL DEFAULT 30,
  `enrolled_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `start_date` VARCHAR(20) NULL,
  `end_date` VARCHAR(20) NULL,
  `min_pass_score` DECIMAL(5,2) NOT NULL DEFAULT 70.00,
  `description` TEXT NULL,
  `objectives` TEXT NULL,
  `target_audience` VARCHAR(255) NULL,
  `cover_image` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_courses_instructor` (`instructor_id`),
  INDEX `idx_courses_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 3. جدول سرفصل‌ها و درس‌های آموزشی
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` VARCHAR(64) NOT NULL,
  `course_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `order_index` INT UNSIGNED NOT NULL DEFAULT 1,
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 45,
  `type` ENUM('video', 'scorm', 'pdf', 'interactive', 'virtual_class') NOT NULL DEFAULT 'video',
  `content_url` TEXT NULL,
  `description` TEXT NULL,
  `is_mandatory` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_lessons_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 4. جدول ثبت‌نام فراگیران در دوره‌ها
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` VARCHAR(64) NOT NULL,
  `course_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `progress_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `score` DECIMAL(5,2) NULL,
  `status` ENUM('enrolled', 'in_progress', 'completed', 'failed', 'dropped') NOT NULL DEFAULT 'enrolled',
  `enrolled_date` VARCHAR(20) NOT NULL,
  `completed_date` VARCHAR(20) NULL,
  `certificate_issued` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course` (`user_id`, `course_id`),
  INDEX `idx_enrollments_course` (`course_id`),
  INDEX `idx_enrollments_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 5. جدول بانک سوالات
CREATE TABLE IF NOT EXISTS `questions` (
  `id` VARCHAR(64) NOT NULL,
  `course_id` VARCHAR(64) NULL,
  `question_text` TEXT NOT NULL,
  `type` ENUM('multiple_choice', 'true_false', 'descriptive') NOT NULL DEFAULT 'multiple_choice',
  `options_json` LONGTEXT NULL,
  `correct_answer` TEXT NOT NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `taxonomic_level` VARCHAR(50) NOT NULL DEFAULT 'کاربرد',
  `points` DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  `created_by` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_questions_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 6. جدول آزمون‌ها
CREATE TABLE IF NOT EXISTS `exams` (
  `id` VARCHAR(64) NOT NULL,
  `course_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 30,
  `total_score` DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  `pass_score` DECIMAL(5,2) NOT NULL DEFAULT 70.00,
  `questions_count` INT UNSIGNED NOT NULL DEFAULT 20,
  `start_window` VARCHAR(30) NULL,
  `end_window` VARCHAR(30) NULL,
  `shuffle_questions` TINYINT(1) NOT NULL DEFAULT 1,
  `shuffle_options` TINYINT(1) NOT NULL DEFAULT 1,
  `max_attempts` INT UNSIGNED NOT NULL DEFAULT 1,
  `status` ENUM('draft', 'active', 'closed') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_exams_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 7. جدول پاسخ‌های آزمون
CREATE TABLE IF NOT EXISTS `exam_submissions` (
  `id` VARCHAR(64) NOT NULL,
  `exam_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `answers_json` LONGTEXT NULL,
  `score` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `passed` TINYINT(1) NOT NULL DEFAULT 0,
  `attempt_number` INT UNSIGNED NOT NULL DEFAULT 1,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_submissions_exam` (`exam_id`),
  INDEX `idx_submissions_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 8. جدول گواهینامه‌های دوره‌ها
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` VARCHAR(64) NOT NULL,
  `certificate_number` VARCHAR(100) NOT NULL UNIQUE,
  `user_id` VARCHAR(64) NOT NULL,
  `user_name` VARCHAR(191) NOT NULL,
  `course_id` VARCHAR(64) NOT NULL,
  `course_title` VARCHAR(255) NOT NULL,
  `duration_hours` INT UNSIGNED NOT NULL,
  `issue_date` VARCHAR(20) NOT NULL,
  `expiry_date` VARCHAR(20) NULL,
  `grade` VARCHAR(20) NOT NULL DEFAULT 'عالی',
  `qr_verify_url` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_certificates_user` (`user_id`),
  INDEX `idx_certificates_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 9. جدول ارزیابی اثربخشی و بازخورد دوره‌ها
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` VARCHAR(64) NOT NULL,
  `course_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `level` ENUM('satisfaction', 'learning', 'behavioral', 'organizational') NOT NULL DEFAULT 'satisfaction',
  `metrics_json` LONGTEXT NOT NULL,
  `average_score` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  `feedback_text` TEXT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_evaluations_course` (`course_id`),
  INDEX `idx_evaluations_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 10. جدول نیازسنجی و برنامه‌ریزی شایستگی
CREATE TABLE IF NOT EXISTS `tna_records` (
  `id` VARCHAR(64) NOT NULL,
  `job_title` VARCHAR(191) NOT NULL,
  `department` VARCHAR(191) NOT NULL,
  `required_competency` VARCHAR(255) NOT NULL,
  `current_level` ENUM('low', 'medium', 'good') NOT NULL DEFAULT 'low',
  `target_level` ENUM('medium', 'good', 'expert') NOT NULL DEFAULT 'expert',
  `recommended_course` VARCHAR(255) NOT NULL,
  `target_learners_count` INT UNSIGNED NOT NULL DEFAULT 10,
  `priority` ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'high',
  `status` ENUM('pending', 'approved', 'in_progress', 'fulfilled') NOT NULL DEFAULT 'approved',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 11. جدول منابع و مخزن محتوا
CREATE TABLE IF NOT EXISTS `learning_resources` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('pdf', 'video', 'scorm', 'software', 'link') NOT NULL DEFAULT 'pdf',
  `category` VARCHAR(100) NOT NULL,
  `size_mb` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `file_url` TEXT NOT NULL,
  `download_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `course_id` VARCHAR(64) NULL,
  `uploaded_by` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 12. جدول جلسات آنلاین و کارگاه‌های وبینار
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(64) NOT NULL,
  `course_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `instructor_id` VARCHAR(64) NOT NULL,
  `date` VARCHAR(20) NOT NULL,
  `start_time` VARCHAR(10) NOT NULL,
  `end_time` VARCHAR(10) NOT NULL,
  `platform` ENUM('skyroom', 'adobe_connect', 'bbb', 'internal') NOT NULL DEFAULT 'skyroom',
  `room_url` TEXT NOT NULL,
  `status` ENUM('scheduled', 'live', 'ended', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `recording_url` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sessions_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 13. جدول تنظیمات سیستمی
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(100) NOT NULL,
  `value` LONGTEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 14. جدول لاگ‌های امنیتی و رویدادهای سامانه
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(64) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(64) NULL,
  `ip_address` VARCHAR(50) NULL,
  `details` TEXT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- داده‌های پایه اولیه (Seed Initial Data)
-- ========================================================

-- مدیر ارشد پیش‌فرض سامانه (رمز عبور موقت: 123456)
INSERT INTO `users` (`id`, `name`, `national_id`, `email`, `mobile`, `role`, `department`, `job_title`, `personnel_code`, `password_hash`, `status`)
VALUES ('u_admin', 'مدیر ارشد سامانه', '0011223344', 'admin@organization.ir', '09120000000', 'super_admin', 'مدیریت منابع انسانی و آموزش', 'سرپرست راهبری آموزش سازمانی', 'EMP-1001', '$2y$10$e8wF4r2Mek3nUvK3f3wWq.Z8oWJ7mZ7mRz5rB7XF1n4K5pL6wQy1K', 'active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- نمونه مدرس
INSERT INTO `users` (`id`, `name`, `national_id`, `email`, `mobile`, `role`, `department`, `job_title`, `personnel_code`, `password_hash`, `status`)
VALUES ('u_inst1', 'دکتر علیرضا رضایی', '0011223355', 'rezaei@organization.ir', '09121111111', 'instructor', 'فناوری اطلاعات و تحول دیجیتال', 'مدرس ارشد سامانه‌های سازمانی', 'EMP-2045', '$2y$10$e8wF4r2Mek3nUvK3f3wWq.Z8oWJ7mZ7mRz5rB7XF1n4K5pL6wQy1K', 'active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- نمونه فراگیر
INSERT INTO `users` (`id`, `name`, `national_id`, `email`, `mobile`, `role`, `department`, `job_title`, `personnel_code`, `password_hash`, `status`)
VALUES ('u_learn1', 'سارا حسینی', '0011223366', 'hosseini@organization.ir', '09122222222', 'learner', 'مهندسی فرآیند و عملیات', 'کارشناس ارشد پایش فرآیند', 'EMP-3012', '$2y$10$e8wF4r2Mek3nUvK3f3wWq.Z8oWJ7mZ7mRz5rB7XF1n4K5pL6wQy1K', 'active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- تنظیمات عمومی سامانه
INSERT INTO `settings` (`key`, `value`) VALUES
('org_name', 'سامانه جامع مدیریت آموزش و توانمندسازی سازمانی'),
('min_pass_score_default', '70'),
('allow_self_enrollment', 'true'),
('certificate_auto_issue', 'true'),
('system_version', '2.5.0')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
