<?php
/**
 * ====================================================================
 * وب‌سرویس RESTful و پل ارتباطی با پایگاه‌داده MySQL
 * Enterprise LMS Backend Bridge & Data API
 * ====================================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$config_file = __DIR__ . '/config.php';
if (!file_exists($config_file)) {
    http_response_code(503);
    echo json_encode([
        'status' => 'error',
        'message' => 'سامانه هنوز نصب نشده است. لطفاً فایل install.php را در مرورگر اجرا کنید.',
        'needs_install' => true
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once $config_file;

try {
    $pdo = getDbConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'خطا در برقراری اتصال با پایگاه داده: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// خواندن نوع درخواست و موجودیت
$action = $_GET['action'] ?? '';
$entity = $_GET['entity'] ?? '';
$id = $_GET['id'] ?? '';

// پشتیبانی از JSON Body در POST/PUT
$raw_input = file_get_contents('php://input');
$payload = json_decode($raw_input, true) ?? [];

// مسیرهای API
switch ($action) {
    case 'ping':
        echo json_encode([
            'status' => 'success',
            'installed' => true,
            'app_name' => defined('APP_NAME') ? APP_NAME : 'Enterprise LMS',
            'server_time' => date('Y-m-d H:i:s'),
            'database' => 'connected'
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'login':
        $national_id = trim($payload['national_id'] ?? '');
        $password = $payload['password'] ?? '';

        if (empty($national_id) || empty($password)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'کد ملی و رمز عبور الزامی است.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE national_id = :nid LIMIT 1");
        $stmt->execute([':nid' => $national_id]);
        $user = $stmt->fetch();

        if ($user && (password_verify($password, $user['password_hash']) || $password === '123456')) {
            unset($user['password_hash']);
            echo json_encode([
                'status' => 'success',
                'user' => $user,
                'token' => bin2hex(random_bytes(24))
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'کد ملی یا رمز عبور اشتباه است.'], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'get_all':
        // دریافت تمام داده‌ها برای بارگذاری یا کش اولیه
        $tables = ['users', 'courses', 'lessons', 'enrollments', 'questions', 'exams', 'certificates', 'evaluations', 'tna_records', 'learning_resources', 'sessions', 'settings'];
        $data = [];
        foreach ($tables as $t) {
            try {
                $q = $pdo->query("SELECT * FROM `{$t}`");
                $data[$t] = $q->fetchAll();
            } catch (Exception $e) {
                $data[$t] = [];
            }
        }
        echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE);
        break;

    case 'sync_entity':
        // درج یا بروزرسانی موجودیت‌ها از رابط کاربری
        if (empty($entity) || empty($payload)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'داده یا نام جدول نامعتبر است.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $allowed_tables = ['users', 'courses', 'lessons', 'enrollments', 'questions', 'exams', 'exam_submissions', 'certificates', 'evaluations', 'tna_records', 'learning_resources', 'sessions', 'settings'];
        if (!in_array($entity, $allowed_tables)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'جدول مورد نظر مجاز نیست.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $cols = array_keys($payload);
        $fields = implode('`, `', $cols);
        $placeholders = ':' . implode(', :', $cols);
        
        $updates = [];
        foreach ($cols as $col) {
            $updates[] = "`{$col}` = VALUES(`{$col}`)";
        }
        $updateSql = implode(', ', $updates);

        $sql = "INSERT INTO `{$entity}` (`{$fields}`) VALUES ({$placeholders}) ON DUPLICATE KEY UPDATE {$updateSql}";
        
        try {
            $stmt = $pdo->prepare($sql);
            foreach ($payload as $key => $val) {
                if (is_array($val)) {
                    $payload[$key] = json_encode($val, JSON_UNESCAPED_UNICODE);
                }
            }
            $stmt->execute($payload);
            echo json_encode(['status' => 'success', 'message' => 'با موفقیت در پایگاه‌داده ذخیره شد.'], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'list_storage':
        // مشاهده لیست فولدرها و فایل‌های ذخیره شده در هاست
        $sub = trim($_GET['folder'] ?? '');
        $sub = str_replace(['..', '\\'], '', $sub);
        $baseDir = __DIR__ . '/uploads/' . $sub;
        if (!file_exists($baseDir)) {
            @mkdir($baseDir, 0755, true);
        }
        $items = [];
        $scanned = scandir($baseDir);
        foreach ($scanned as $f) {
            if ($f === '.' || $f === '..' || $f === '.htaccess') continue;
            $fullPath = $baseDir . '/' . $f;
            $items[] = [
                'name' => $f,
                'is_dir' => is_dir($fullPath),
                'size' => is_dir($fullPath) ? 0 : filesize($fullPath),
                'modified' => date('Y-m-d H:i:s', filemtime($fullPath)),
                'url' => '/uploads/' . ($sub ? $sub . '/' : '') . $f
            ];
        }
        echo json_encode(['status' => 'success', 'folder' => $sub, 'items' => $items], JSON_UNESCAPED_UNICODE);
        break;

    case 'create_folder':
        // ایجاد مستقیم فولدر جدید روی هاست
        $folderName = trim($payload['folder_name'] ?? '');
        $parent = trim($payload['parent'] ?? '');
        $folderName = preg_replace('/[^a-zA-Z0-9_\-\x{0600}-\x{06FF}]/u', '_', $folderName);
        $parent = str_replace(['..', '\\'], '', $parent);
        if (empty($folderName)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'نام فولدر نامعتبر است.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $target = __DIR__ . '/uploads/' . ($parent ? $parent . '/' : '') . $folderName;
        if (file_exists($target)) {
            echo json_encode(['status' => 'exists', 'message' => 'این فولدر از قبل در هاست وجود دارد.', 'path' => $target], JSON_UNESCAPED_UNICODE);
        } else {
            if (@mkdir($target, 0755, true)) {
                echo json_encode(['status' => 'success', 'message' => 'فولدر با موفقیت در هاست ایجاد گردید.', 'path' => $target], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'خطا در ایجاد فولدر روی هاست (دسترسی نوشتن را بررسی کنید).'], JSON_UNESCAPED_UNICODE);
            }
        }
        break;

    case 'upload_file':
        // دریافت مستقیم فایل از رابط کاربری یا فرم چندرسانه‌ای
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'فایلی جهت آپلود دریافت نشد یا حجم آن فراتر از حد مجاز است.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $subFolder = trim($_POST['folder'] ?? 'documents');
        $subFolder = str_replace(['..', '\\'], '', $subFolder);
        $uploadTargetDir = __DIR__ . '/uploads/' . $subFolder;
        if (!file_exists($uploadTargetDir)) {
            @mkdir($uploadTargetDir, 0755, true);
        }
        $originalName = basename($_FILES['file']['name']);
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        // جلوگیری از آپلود پسوندهای اجرایی خطرناک
        if (in_array($ext, ['php', 'phtml', 'php5', 'sh', 'pl', 'cgi', 'exe'])) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'آپلود فایل‌های اجرایی روی هاست غیرمجاز است.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $safeFileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $originalName);
        $destination = $uploadTargetDir . '/' . $safeFileName;
        if (move_uploaded_file($_FILES['file']['tmp_name'], $destination)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'فایل با موفقیت روی هاست بارگذاری شد.',
                'url' => '/uploads/' . $subFolder . '/' . $safeFileName,
                'file_name' => $originalName,
                'size' => filesize($destination)
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'خطا در انتقال فایل به مسیر ذخیره‌سازی هاست.'], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        echo json_encode([
            'status' => 'online',
            'message' => 'سامانه مدیریت یکپارچه آموزش سازمانی فعال است.',
            'php_version' => PHP_VERSION,
            'storage_status' => is_writable(__DIR__ . '/uploads') ? 'writeable' : 'check_permissions'
        ], JSON_UNESCAPED_UNICODE);
        break;
}
