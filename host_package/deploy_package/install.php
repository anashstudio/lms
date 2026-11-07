<?php
/**
 * ====================================================================
 * سامانه مدیریت یکپارچه آموزش سازمانی - فایل هوشمند نصب و راه‌اندازی هاست
 * Enterprise LMS Smart Host Installation Wizard
 * ====================================================================
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

$lock_file = __DIR__ . '/install.lock';
$config_file = __DIR__ . '/config.php';
$sql_file = __DIR__ . '/database.sql';

// بررسی در صورت اتمام نصب قبلی
$already_installed = file_exists($lock_file) && file_exists($config_file);

// تعیین مرحله فعلی
$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
if ($step < 1 || $step > 4) $step = 1;

$error = '';
$success = '';

// بررسی پیش‌نیازهای سرور
$reqs = [
    'php_version' => [
        'name' => 'نسخه PHP (حداقل 7.4، پیشنهادی 8.1 یا 8.2)',
        'status' => version_compare(PHP_VERSION, '7.4.0', '>='),
        'current' => PHP_VERSION,
        'required' => '7.4+'
    ],
    'pdo' => [
        'name' => 'اکستنشن PHP PDO',
        'status' => extension_loaded('pdo'),
        'current' => extension_loaded('pdo') ? 'فعال' : 'غیرفعال',
        'required' => 'فعال'
    ],
    'pdo_mysql' => [
        'name' => 'درایور PDO MySQL',
        'status' => extension_loaded('pdo_mysql'),
        'current' => extension_loaded('pdo_mysql') ? 'فعال' : 'غیرفعال',
        'required' => 'فعال'
    ],
    'json' => [
        'name' => 'اکستنشن JSON',
        'status' => extension_loaded('json'),
        'current' => extension_loaded('json') ? 'فعال' : 'غیرفعال',
        'required' => 'فعال'
    ],
    'writable' => [
        'name' => 'دسترسی نوشتن در پوشه جاری',
        'status' => is_writable(__DIR__),
        'current' => is_writable(__DIR__) ? 'قابل نوشتن (Writeable)' : 'غیرقابل نوشتن',
        'required' => 'Writeable'
    ],
    'sql_exists' => [
        'name' => 'وجود فایل پایگاه‌داده (database.sql)',
        'status' => file_exists($sql_file),
        'current' => file_exists($sql_file) ? 'موجود است' : 'یافت نشد',
        'required' => 'موجود'
    ]
];

$all_reqs_passed = true;
foreach ($reqs as $r) {
    if (!$r['status']) {
        $all_reqs_passed = false;
        break;
    }
}

// پردازش فرم اتصال به دیتابیس و نصب
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'install') {
        $db_host = trim($_POST['db_host'] ?? 'localhost');
        $db_port = trim($_POST['db_port'] ?? '3306');
        $db_name = trim($_POST['db_name'] ?? '');
        $db_user = trim($_POST['db_user'] ?? '');
        $db_pass = $_POST['db_pass'] ?? '';
        
        $admin_name = trim($_POST['admin_name'] ?? 'مدیر ارشد سامانه');
        $admin_national_id = trim($_POST['admin_national_id'] ?? '0011223344');
        $admin_email = trim($_POST['admin_email'] ?? 'admin@organization.ir');
        $admin_mobile = trim($_POST['admin_mobile'] ?? '09120000000');
        $admin_password = $_POST['admin_password'] ?? '';
        $org_title = trim($_POST['org_title'] ?? 'سامانه جامع مدیریت آموزش و توانمندسازی سازمانی');

        if (empty($db_name) || empty($db_user)) {
            $error = 'لطفاً نام پایگاه‌داده و نام کاربر دیتابیس را وارد نمایید.';
        } elseif (empty($admin_national_id) || empty($admin_password)) {
            $error = 'کد ملی و کلمه عبور مدیر ارشد الزامی است.';
        } elseif (strlen($admin_password) < 6) {
            $error = 'کلمه عبور مدیر ارشد باید حداقل ۶ کاراکتر باشد.';
        } else {
            try {
                // تست اتصال PDO
                $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
                $pdo = new PDO($dsn, $db_user, $db_pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]);

                // خواندن و اجرای کوئری‌های database.sql
                if (file_exists($sql_file)) {
                    $sql_content = file_get_contents($sql_file);
                    // جداسازی کوئری‌ها بر اساس سمی‌کالن
                    $pdo->exec($sql_content);
                }

                // ثبت یا بروزرسانی مدیر ارشد سفارشی
                $hashed_pw = password_hash($admin_password, PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("
                    INSERT INTO `users` (`id`, `name`, `national_id`, `email`, `mobile`, `role`, `department`, `job_title`, `personnel_code`, `password_hash`, `status`)
                    VALUES ('u_admin', :name, :national_id, :email, :mobile, 'super_admin', 'مدیریت ارشد آموزش', 'سرپرست راهبری آموزش سازمانی', 'EMP-1001', :password_hash, 'active')
                    ON DUPLICATE KEY UPDATE 
                        `name` = VALUES(`name`),
                        `national_id` = VALUES(`national_id`),
                        `email` = VALUES(`email`),
                        `mobile` = VALUES(`mobile`),
                        `password_hash` = VALUES(`password_hash`)
                ");
                $stmt->execute([
                    ':name' => $admin_name,
                    ':national_id' => $admin_national_id,
                    ':email' => $admin_email,
                    ':mobile' => $admin_mobile,
                    ':password_hash' => $hashed_pw
                ]);

                // ثبت نام سازمان در تنظیمات
                $stmtSettings = $pdo->prepare("
                    INSERT INTO `settings` (`key`, `value`)
                    VALUES ('org_name', :org_name)
                    ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)
                ");
                $stmtSettings->execute([':org_name' => $org_title]);

                // تولید فایل config.php
                $config_content = "<?php\n";
                $config_content .= "// پیکربندی اتصال به پایگاه داده سامانه جامع آموزش سازمانی\n";
                $config_content .= "// تاریخ ایجاد: " . date('Y-m-d H:i:s') . "\n\n";
                $config_content .= "define('DB_HOST', " . var_export($db_host, true) . ");\n";
                $config_content .= "define('DB_PORT', " . var_export($db_port, true) . ");\n";
                $config_content .= "define('DB_NAME', " . var_export($db_name, true) . ");\n";
                $config_content .= "define('DB_USER', " . var_export($db_user, true) . ");\n";
                $config_content .= "define('DB_PASS', " . var_export($db_pass, true) . ");\n";
                $config_content .= "define('DB_CHARSET', 'utf8mb4');\n";
                $config_content .= "define('APP_NAME', " . var_export($org_title, true) . ");\n";
                $config_content .= "define('INSTALLED_AT', " . var_export(date('Y-m-d H:i:s'), true) . ");\n\n";
                $config_content .= "function getDbConnection() {\n";
                $config_content .= "    static \$pdo = null;\n";
                $config_content .= "    if (\$pdo === null) {\n";
                $config_content .= "        \$dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;\n";
                $config_content .= "        \$pdo = new PDO(\$dsn, DB_USER, DB_PASS, [\n";
                $config_content .= "            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n";
                $config_content .= "            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC\n";
                $config_content .= "        ]);\n";
                $config_content .= "    }\n";
                $config_content .= "    return \$pdo;\n";
                $config_content .= "}\n";

                file_put_contents($config_file, $config_content);
                file_put_contents($lock_file, date('Y-m-d H:i:s'));

                // ساخت خودکار پوشه‌های آپلود روی هاست بدون محدودیت
                $upload_dirs = [
                    __DIR__ . '/uploads',
                    __DIR__ . '/uploads/videos',
                    __DIR__ . '/uploads/documents',
                    __DIR__ . '/uploads/scorm',
                    __DIR__ . '/uploads/images',
                    __DIR__ . '/uploads/audio',
                ];
                foreach ($upload_dirs as $udir) {
                    if (!file_exists($udir)) {
                        @mkdir($udir, 0755, true);
                    }
                }
                // ساخت htaccess محافظت‌شده برای uploads
                $uploads_htaccess = __DIR__ . '/uploads/.htaccess';
                if (!file_exists($uploads_htaccess)) {
                    $uht = "Options -Indexes +FollowSymLinks\n";
                    $uht .= "<IfModule mod_headers.c>\n    Header set Access-Control-Allow-Origin \"*\"\n    Header set Accept-Ranges bytes\n</IfModule>\n";
                    $uht .= "<FilesMatch \"\\.(php|phtml|pl|py|cgi|sh)\$\">\n    Order Deny,Allow\n    Deny from all\n</FilesMatch>\n";
                    @file_put_contents($uploads_htaccess, $uht);
                }

                $success = 'نصب سامانه با موفقیت به پایان رسید!';
                $step = 4; // گام پایانی
            } catch (Exception $ex) {
                $error = 'خطا در اتصال به پایگاه داده یا اجرای اسکریپت: ' . htmlspecialchars($ex->getMessage());
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نصب سامانه جامع مدیریت آموزش سازمانی</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0284c7;
            --primary-dark: #0369a1;
            --primary-light: #e0f2fe;
            --success: #10b981;
            --danger: #ef4444;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Vazirmatn', sans-serif; }
        body { background: var(--bg); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 2.5rem 1rem; }
        .installer-container { width: 100%; max-width: 820px; background: var(--card-bg); border-radius: 20px; box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid var(--border); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%); color: #ffffff; padding: 2rem 2.5rem; }
        .header h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem; }
        .header p { color: #94a3b8; font-size: 0.95rem; }
        
        .steps-bar { display: flex; background: #f1f5f9; border-bottom: 1px solid var(--border); }
        .step-item { flex: 1; padding: 1rem 0.5rem; text-align: center; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); border-bottom: 3px solid transparent; }
        .step-item.active { color: var(--primary); border-bottom-color: var(--primary); background: #ffffff; }
        .step-item.completed { color: var(--success); }

        .content { padding: 2.5rem; }
        
        .alert { padding: 1rem 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.6; }
        .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        .alert-success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
        .alert-warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }

        .req-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        .req-table th, .req-table td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border); text-align: right; font-size: 0.9rem; }
        .req-table th { background: #f8fafc; color: var(--text-muted); font-weight: 700; }
        .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
        .badge-pass { background: #dcfce7; color: #15803d; }
        .badge-fail { background: #fee2e2; color: #b91c1c; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full { grid-column: span 2; }
        label { font-size: 0.85rem; font-weight: 600; color: #334155; }
        input[type="text"], input[type="password"], input[type="email"], select {
            width: 100%; padding: 0.75rem 1rem; border: 1.5px solid var(--border); border-radius: 10px; font-size: 0.9rem;
            outline: none; transition: border-color 0.2s, box-shadow 0.2s; background: #ffffff;
        }
        input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15); }
        .hint { font-size: 0.75rem; color: var(--text-muted); }

        .actions { margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; }
        .btn { padding: 0.8rem 1.8rem; border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; border: none; transition: 0.2s; }
        .btn-primary { background: var(--primary); color: #ffffff; }
        .btn-primary:hover { background: var(--primary-dark); }
        .btn-secondary { background: #e2e8f0; color: #334155; }
        .btn-secondary:hover { background: #cbd5e1; }
        .btn-success { background: var(--success); color: #ffffff; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .finish-card { text-align: center; padding: 2rem 1rem; }
        .finish-icon { width: 72px; height: 72px; border-radius: 50%; background: #dcfce7; color: var(--success); display: inline-flex; align-items: center; justify-content: center; font-size: 2.2rem; margin-bottom: 1rem; }
        .guide-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 14px; padding: 1.25rem; text-align: right; margin: 1.5rem 0; font-size: 0.85rem; line-height: 1.8; color: #475569; }
    </style>
</head>
<body>

<div class="installer-container">
    <div class="header">
        <h1>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            راهنمای هوشمند راه‌اندازی و نصب سامانه آموزش
        </h1>
        <p>نصب خودکار جداول پایگاه‌داده MySQL، ایجاد کاربر مدیر ارشد و تولید پیکربندی هاست</p>
    </div>

    <div class="steps-bar">
        <div class="step-item <?= $step === 1 ? 'active' : ($step > 1 ? 'completed' : '') ?>">۱. بررسی پیش‌نیازها</div>
        <div class="step-item <?= $step === 2 ? 'active' : ($step > 2 ? 'completed' : '') ?>">۲. اتصال پایگاه‌داده MySQL</div>
        <div class="step-item <?= $step === 3 ? 'active' : ($step > 3 ? 'completed' : '') ?>">۳. اطلاعات مدیر و سازمان</div>
        <div class="step-item <?= $step === 4 ? 'active' : '' ?>">۴. نهایی‌سازی و ورود</div>
    </div>

    <div class="content">
        <?php if ($already_installed && $step !== 4): ?>
            <div class="alert alert-warning">
                <strong>توجه:</strong> به نظر می‌رسد این سامانه قبلاً با موفقیت نصب شده است (فایل <code>config.php</code> و <code>install.lock</code> موجود است).
                <br>در صورتی که قصد نصب مجدد دارید، فایل <code>install.lock</code> را از هاست خود حذف نمایید.
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <a href="./index.html" class="btn btn-primary">رفتن به سامانه آموزش سازمانی</a>
            </div>
        <?php else: ?>

            <?php if (!empty($error)): ?>
                <div class="alert alert-error">
                    <?= $error ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($success)): ?>
                <div class="alert alert-success">
                    <?= $success ?>
                </div>
            <?php endif; ?>

            <!-- گام ۱: بررسی پیش‌نیازها -->
            <?php if ($step === 1): ?>
                <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: #1e293b;">بررسی وضعیت سرور و هاست</h3>
                <p class="hint">تمام نیازمندی‌ها برای اجرای بدون مشکل سامانه در جدول زیر بررسی شده‌اند:</p>

                <table class="req-table">
                    <thead>
                        <tr>
                            <th>آیتم مورد بررسی</th>
                            <th>نیاز سامانه</th>
                            <th>وضعیت فعلی سرور</th>
                            <th>نتیجه</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($reqs as $key => $item): ?>
                        <tr>
                            <td><strong><?= htmlspecialchars($item['name']) ?></strong></td>
                            <td><?= htmlspecialchars($item['required']) ?></td>
                            <td><?= htmlspecialchars($item['current']) ?></td>
                            <td>
                                <?php if ($item['status']): ?>
                                    <span class="badge badge-pass">✓ تأیید</span>
                                <?php else: ?>
                                    <span class="badge badge-fail">✗ ناموفق</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <div class="actions">
                    <div></div>
                    <?php if ($all_reqs_passed): ?>
                        <a href="?step=2" class="btn btn-primary">
                            ادامه به مرحله بعد
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                        </a>
                    <?php else: ?>
                        <button class="btn btn-secondary" disabled>پیش‌نیازها تکمیل نشده است</button>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <!-- گام ۲ و ۳: اطلاعات دیتابیس و مدیر ارشد -->
            <?php if ($step === 2 || $step === 3): ?>
                <form method="POST" action="?step=4">
                    <input type="hidden" name="action" value="install">

                    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: #1e293b;">۱. مشخصات اتصال به پایگاه‌داده MySQL</h3>
                    <p class="hint">اطلاعات دیتابیسی که در کنترل پنل هاست خود (cPanel یا DirectAdmin) ساخته‌اید را وارد کنید:</p>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>آدرس هاست دیتابیس (DB Host)</label>
                            <input type="text" name="db_host" value="<?= htmlspecialchars($_POST['db_host'] ?? 'localhost') ?>" required>
                            <span class="hint">در ۹۹٪ هاست‌های اشتراکی localhost است</span>
                        </div>

                        <div class="form-group">
                            <label>پورت دیتابیس</label>
                            <input type="text" name="db_port" value="<?= htmlspecialchars($_POST['db_port'] ?? '3306') ?>" required>
                            <span class="hint">پیش‌فرض: 3306</span>
                        </div>

                        <div class="form-group">
                            <label>نام پایگاه داده (Database Name)</label>
                            <input type="text" name="db_name" placeholder="مثال: org_lms_db" value="<?= htmlspecialchars($_POST['db_name'] ?? '') ?>" required>
                        </div>

                        <div class="form-group">
                            <label>نام کاربری پایگاه داده (DB User)</label>
                            <input type="text" name="db_user" placeholder="مثال: org_lms_user" value="<?= htmlspecialchars($_POST['db_user'] ?? '') ?>" required>
                        </div>

                        <div class="form-group full">
                            <label>کلمه عبور پایگاه داده (DB Password)</label>
                            <input type="password" name="db_pass" placeholder="رمز عبور ایجاد شده در دیتابیس هاست" value="<?= htmlspecialchars($_POST['db_pass'] ?? '') ?>">
                        </div>
                    </div>

                    <div style="margin: 2.5rem 0 1.5rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
                        <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: #1e293b;">۲. تعریف مدیر ارشد و سازمان</h3>
                        <p class="hint">با این حساب کاربری تمام دسترسی‌های راهبری، نظارت، گزارش‌گیری و صدور گواهی فعال خواهند شد:</p>
                    </div>

                    <div class="form-grid">
                        <div class="form-group full">
                            <label>عنوان سامانه یا نام سازمان</label>
                            <input type="text" name="org_title" value="<?= htmlspecialchars($_POST['org_title'] ?? 'سامانه جامع مدیریت آموزش و توانمندسازی سازمانی') ?>" required>
                        </div>

                        <div class="form-group">
                            <label>نام و نام‌خانوادگی مدیر ارشد</label>
                            <input type="text" name="admin_name" value="<?= htmlspecialchars($_POST['admin_name'] ?? 'مدیر ارشد سامانه') ?>" required>
                        </div>

                        <div class="form-group">
                            <label>کد ملی مدیر (شناسه ورود)</label>
                            <input type="text" name="admin_national_id" value="<?= htmlspecialchars($_POST['admin_national_id'] ?? '0011223344') ?>" maxlength="10" required>
                        </div>

                        <div class="form-group">
                            <label>ایمیل سازمانی</label>
                            <input type="email" name="admin_email" value="<?= htmlspecialchars($_POST['admin_email'] ?? 'admin@organization.ir') ?>" required>
                        </div>

                        <div class="form-group">
                            <label>شماره تماس همراه</label>
                            <input type="text" name="admin_mobile" value="<?= htmlspecialchars($_POST['admin_mobile'] ?? '09120000000') ?>" required>
                        </div>

                        <div class="form-group full">
                            <label>کلمه عبور اختصاصی مدیر ارشد</label>
                            <input type="password" name="admin_password" placeholder="حداقل ۶ کاراکتر با امنیت بالا" required>
                        </div>
                    </div>

                    <div class="actions">
                        <a href="?step=1" class="btn btn-secondary">بازگشت</a>
                        <button type="submit" class="btn btn-primary">
                            شروع فرایند ایجاد جداول و نصب سامانه
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                    </div>
                </form>
            <?php endif; ?>

            <!-- گام ۴: تبریک و اتمام موفق -->
            <?php if ($step === 4): ?>
                <div class="finish-card">
                    <div class="finish-icon">✓</div>
                    <h2 style="font-size: 1.4rem; color: #1e293b; margin-bottom: 0.5rem;">نصب و پیکربندی با موفقیت کامل شد!</h2>
                    <p style="color: var(--text-muted); max-width: 540px; margin: 0 auto;">تمام ۱۴ جدول پایگاه داده MySQL ایجاد شدند، کاربر مدیر ارشد با موفقیت ثبت شد و فایل <code>config.php</code> در سرور ذخیره گردید.</p>

                    <div class="guide-box">
                        <strong style="color: #0f172a;">نکات مهم پس از نصب:</strong><br>
                        ۱. جهت حفظ امنیت سامانه، برای اجرای مجدد فایل <code>install.lock</code> به صورت خودکار ایجاد گردید.<br>
                        ۲. توصیه می‌شود پس از اطمینان از عملکرد، دسترسی فایل <code>install.php</code> را مسدود یا آن را حذف نمایید.<br>
                        ۳. اکنون با کد ملی و رمز عبوری که در مرحله قبل ثبت نمودید می‌توانید به سامانه وارد شوید.
                    </div>

                    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                        <a href="./index.html" class="btn btn-success" style="padding: 1rem 2.5rem; font-size: 1.05rem;">
                            ورود به پنل کاربری سامانه
                        </a>
                    </div>
                </div>
            <?php endif; ?>

        <?php endif; ?>
    </div>
</div>

<footer style="margin-top: 2rem; font-size: 0.8rem; color: #94a3b8; text-align: center;">
    سامانه مدیریت آموزش و توانمندسازی سازمانی &bull; نسخه ۲.۵ ویژه هاست‌های اشتراکی و سرورهای اختصاصی
</footer>

</body>
</html>
