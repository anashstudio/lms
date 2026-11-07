/**
 * سامانه مدیریت یادگیری و آزمون الکترونیکی سازمانی
 * فایل پیکربندی مستقیم هاست - بدون نیاز به کامپایل مجدد در هاست
 * جهت تغییر آدرس‌ها، عنوان، یا مسیرهای فایل در cPanel می‌توانید این فایل را مستقیماً ویرایش نمایید.
 */
window.__LMS_HOST_CONFIG__ = {
  // عنوان رسمی سامانه
  systemTitle: "مدیریت سامانه یادگیری و آزمون الکترونیکی",
  
  // مسیر پوشه آپلودها در هاست
  uploadBaseUrl: "/uploads",
  
  // نقطه پایانی ارتباط با وب‌سرویس PHP و پایگاه‌داده MySQL
  apiBaseUrl: "/api.php",
  
  // فعال‌بودن حالت ذخیره‌سازی نامحدود فایل و فولدر روی هاست
  unlimitedHostStorage: true,
  
  // حداکثر حجم مجاز آپلود به مگابایت (تنظیم شده در .htaccess و php.ini)
  maxUploadSizeMB: 2048,
  
  // ساختار دسته‌بندی پیش‌فرض فولدرها روی هاست
  defaultStorageFolders: [
    { key: "videos", label: "ویدئوهای آموزشی (MP4, WebM)", path: "/uploads/videos" },
    { key: "documents", label: "جزوات، اسناد و PDF", path: "/uploads/documents" },
    { key: "scorm", label: "بسته‌های تعاملی SCORM و HTML5", path: "/uploads/scorm" },
    { key: "images", label: "تصاویر، کاورها و نشان‌ها", path: "/uploads/images" },
    { key: "audio", label: "فایل‌های صوتی و پادکست", path: "/uploads/audio" }
  ]
};
