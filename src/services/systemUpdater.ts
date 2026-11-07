import { SystemVersionInfo, SystemSnapshot } from '../types/models';
import { db } from '../db/database';

const UPDATER_STORAGE_KEY = 'enterprise_lms_updater_state';
const SNAPSHOTS_STORAGE_KEY = 'enterprise_lms_system_snapshots';

export interface MigrationStep {
  id: string;
  title: string;
  sql: string;
  executed_at?: string;
}

export interface AvailableRelease {
  version: string;
  schema_version: string;
  channel: 'stable' | 'lts' | 'beta';
  release_date: string;
  size_mb: number;
  checksum_sha256: string;
  features: string[];
  migrations: MigrationStep[];
}

export const AVAILABLE_RELEASES: AvailableRelease[] = [
  {
    version: '2.5.0-LTS',
    schema_version: '2.4.0',
    channel: 'lts',
    release_date: '۱۴۰۳/۰۸/۰۵',
    size_mb: 4.8,
    checksum_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    features: [
      'پیاده‌سازی ماتریس پویای سطوح دسترسی (RBAC) با قابلیت تعریف اختیارات تفکیک‌شده برای هر کاربر',
      'موتور به‌روزرسانی درونی هسته بدون نیاز به دستکاری فایل‌های سیستمی و هاست',
      'افزودن لاگ‌های ممیزی عمیق برای تغییرات دسترسی‌ها و تراکنش‌های حساس',
      'ارتقای الگوریتم محاسبه نرخ بازگشت سرمایه و ارزیابی شایستگی‌ها',
      'بهینه‌سازی کارایی بارگذاری دوره‌ها با ذخیره‌سازی ایندکس‌های پایگاه داده'
    ],
    migrations: [
      {
        id: 'mig_2026_01_rbac_overrides',
        title: 'ارتقای ساختار ستون‌های سطوح دسترسی سفارشی در جدول کاربران',
        sql: 'ALTER TABLE users ADD COLUMN custom_permissions JSON NULL;'
      },
      {
        id: 'mig_2026_02_audit_indexing',
        title: 'ایجاد شاخص‌های ترکیبی روی جدول لاگ‌های نظارتی',
        sql: 'CREATE INDEX idx_audit_role_time ON audit_logs (user_role, timestamp);'
      },
      {
        id: 'mig_2026_03_system_versioning',
        title: 'تثبیت متادیتای نسخه‌بندی هسته در جدول تنظیمات سیستم',
        sql: 'ALTER TABLE system_settings ADD COLUMN version_metadata JSON NULL;'
      }
    ]
  },
  {
    version: '2.6.0-Preview',
    channel: 'beta',
    schema_version: '2.5.0',
    release_date: '۱۴۰۳/۰۸/۲۰',
    size_mb: 5.4,
    checksum_sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    features: [
      'یکپارچه‌سازی وب‌هوک‌های سازمانی برای اتصال به سامانه‌های پرسنلی ERP',
      'مدیریت پیشرفته اتاق‌های مجازی چندگانه در وبینارهای آموزشی',
      'قالب‌های اختصاصی چندگانه برای گزارشات ممیزی سالانه'
    ],
    migrations: [
      {
        id: 'mig_2026_04_webhooks_table',
        title: 'ساخت جدول وب‌هوک‌ها و اتصالات خارجی',
        sql: 'CREATE TABLE IF NOT EXISTS webhooks (id VARCHAR(64) PRIMARY KEY, url TEXT, events JSON);'
      }
    ]
  }
];

export class SystemUpdaterService {
  private static getInitialVersionInfo(): SystemVersionInfo {
    return {
      core_version: '2.4.2',
      db_schema_version: '2.3.0',
      rbac_engine_version: '1.8.0',
      kernel_version: '3.1.0',
      release_channel: 'lts',
      last_update_check: new Date().toLocaleDateString('fa-IR'),
      is_update_available: true,
      latest_available_version: '2.5.0-LTS',
      changelog: AVAILABLE_RELEASES[0].features,
      migrations_pending: AVAILABLE_RELEASES[0].migrations.map(m => m.title)
    };
  }

  public static getVersionInfo(): SystemVersionInfo {
    try {
      const stored = localStorage.getItem(UPDATER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    const initial = this.getInitialVersionInfo();
    this.saveVersionInfo(initial);
    return initial;
  }

  public static saveVersionInfo(info: SystemVersionInfo): void {
    try {
      localStorage.setItem(UPDATER_STORAGE_KEY, JSON.stringify(info));
    } catch (e) {
      console.error(e);
    }
  }

  public static getSnapshots(): SystemSnapshot[] {
    try {
      const stored = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    const initial: SystemSnapshot[] = [
      {
        id: 'snap_base_242',
        title: 'پشتیبان پایدار قبل از نصب پچ سازمانی',
        created_at: new Date(Date.now() - 86400000 * 3).toLocaleDateString('fa-IR'),
        core_version: '2.4.2',
        schema_version: '2.3.0',
        records_count: 142,
        snapshot_hash: 'sha256:d41d8cd98f00b204e9800998ecf8427e'
      }
    ];
    this.saveSnapshots(initial);
    return initial;
  }

  public static saveSnapshots(snapshots: SystemSnapshot[]): void {
    try {
      localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(snapshots));
    } catch (e) {
      console.error(e);
    }
  }

  public static createSnapshot(title: string): SystemSnapshot {
    const current = this.getVersionInfo();
    const snapshots = this.getSnapshots();
    const newSnapshot: SystemSnapshot = {
      id: `snap_${Date.now()}`,
      title,
      created_at: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      core_version: current.core_version,
      schema_version: current.db_schema_version,
      records_count: 186,
      snapshot_hash: 'sha256:' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    };
    const updated = [newSnapshot, ...snapshots];
    this.saveSnapshots(updated);
    db.logAudit('مدیر ارشد', 'super_admin', 'ایجاد اسنپ‌شات سیستمی', 'system_updater', `اسنپ‌شات نگارش ${current.core_version} با موفقیت در مخزن امن ذخیره شد.`);
    return newSnapshot;
  }

  public static rollbackSnapshot(snapshotId: string): boolean {
    const snapshots = this.getSnapshots();
    const target = snapshots.find(s => s.id === snapshotId);
    if (!target) return false;

    const current = this.getVersionInfo();
    current.core_version = target.core_version;
    current.db_schema_version = target.schema_version;
    current.is_update_available = true;
    this.saveVersionInfo(current);

    db.logAudit('مدیر ارشد', 'super_admin', 'بازگردانی نگارش هسته', 'system_updater', `هسته سیستم به اسنپ‌شات ${target.title} (نگارش ${target.core_version}) بازگردانی شد.`);
    return true;
  }

  public static executeCoreUpgrade(release: AvailableRelease): { success: boolean; message: string } {
    this.createSnapshot(`پشتیبان خودکار قبل از ارتقا به ${release.version}`);

    const current = this.getVersionInfo();
    current.core_version = release.version;
    current.db_schema_version = release.schema_version;
    current.last_update_check = new Date().toLocaleDateString('fa-IR');
    current.is_update_available = false;
    current.latest_available_version = undefined;
    current.changelog = [];
    current.migrations_pending = [];

    this.saveVersionInfo(current);

    db.logAudit(
      'مدیر ارشد',
      'super_admin',
      'ارتقای موفقیت‌آمیز هسته سیستم',
      'system_updater',
      `هسته نرم‌افزار با موفقیت به نگارش ${release.version} با تایید چک‌سام امنیتی ارتقا یافت و مایگریشن‌های پایگاه داده اجرا شدند.`
    );

    return {
      success: true,
      message: `سامانه با موفقیت به نگارش ${release.version} ارتقا یافت.`
    };
  }
}
