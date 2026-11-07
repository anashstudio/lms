<?php
/**
 * نمونه فایل پیکربندی پایگاه داده برای تنظیم دستی (اختیاری)
 * در صورت استفاده از فایل install.php این فایل به صورت خودکار با نام config.php ایجاد خواهد شد.
 */

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'org_lms_db');
define('DB_USER', 'org_lms_user');
define('DB_PASS', 'Your_Strong_Password_Here');
define('DB_CHARSET', 'utf8mb4');
define('APP_NAME', 'سامانه جامع مدیریت آموزش و توانمندسازی سازمانی');

function getDbConnection() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);
    }
    return $pdo;
}
