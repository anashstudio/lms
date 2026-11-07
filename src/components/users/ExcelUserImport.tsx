import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../../db/database';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types/models';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  FileCheck,
  RefreshCw,
  Trash2,
  Check,
  ArrowRight
} from 'lucide-react';

export interface ParsedExcelUser {
  employee_id: string;
  national_id: string;
  username: string;
  full_name: string;
  department: string;
  job_title: string;
  role: UserRole;
  phone: string;
  password?: string;
  isValid: boolean;
  validationError?: string;
}

interface ExcelUserImportProps {
  onSuccess?: () => void;
  className?: string;
}

export const ExcelUserImport: React.FC<ExcelUserImportProps> = ({ onSuccess, className = '' }) => {
  const { triggerRefresh } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedUsers, setParsedUsers] = useState<ParsedExcelUser[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; skipCount: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // نقش‌های معتبر
  const parseRole = (roleStr: any): UserRole => {
    if (!roleStr) return 'learner';
    const s = String(roleStr).trim().toLowerCase();
    if (s.includes('مدیر ارشد') || s.includes('super_admin') || s.includes('ادمین')) return 'super_admin';
    if (s.includes('مدیر') || s.includes('manager')) return 'class_manager';
    if (s.includes('مدرس') || s.includes('استاد') || s.includes('instructor') || s.includes('teacher')) return 'instructor';
    return 'learner';
  };

  // دانلود فایل نمونه استاندارد اکسل
  const handleDownloadSample = () => {
    const sampleRows = [
      {
        'کد پرسنلی *': '965801',
        'کد ملی *': '0089123456',
        'نام و نام خانوادگی *': 'علیرضا صادقیان',
        'واحد سازمانی': 'واحد بهره‌برداری و تقطیر',
        'سمت شغلی': 'کارشناس ارشد مهندسی فرآیند',
        'نقش کاربری': 'فراگیر',
        'تلفن همراه': '09131112233',
        'کلمه عبور': 'User@123'
      },
      {
        'کد پرسنلی *': '965802',
        'کد ملی *': '0076543210',
        'نام و نام خانوادگی *': 'دکتر بهمن کریمی',
        'واحد سازمانی': 'دپارتمان آموزش و پژوهش',
        'سمت شغلی': 'مدرس تخصصی ایمنی پالایشگاه',
        'نقش کاربری': 'مدرس',
        'تلفن همراه': '09132223344',
        'کلمه عبور': 'Teacher@123'
      },
      {
        'کد پرسنلی *': '965803',
        'کد ملی *': '0065432198',
        'نام و نام خانوادگی *': 'فاطمه موسوی',
        'واحد سازمانی': 'اداره منابع انسانی و خدمات آموزشی',
        'سمت شغلی': 'کارشناس هماهنگی کلاس‌ها',
        'نقش کاربری': 'مدیر آموزش',
        'تلفن همراه': '09133334455',
        'کلمه عبور': 'Manager@123'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'پرسنل و فراگیران');

    // تنظیم عرض ستون‌ها
    ws['!cols'] = [
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 25 },
      { wch: 25 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 }
    ];

    XLSX.writeFile(wb, 'Sample_Users_Import_Template.xlsx');
  };

  // پردازش فایل اکسل آپلود شده
  const processExcelFile = (file: File) => {
    setErrorMsg(null);
    setImportResult(null);
    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonRows || jsonRows.length === 0) {
          setErrorMsg('فایل اکسل انتخاب‌شده حاوی داده یا سطری نمی‌باشد.');
          setIsProcessing(false);
          return;
        }

        const existingUsers = db.getUsers();
        const existingEmpIds = new Set(existingUsers.map(u => (u.employee_id || '').trim().toLowerCase()));
        const existingNatIds = new Set(existingUsers.map(u => (u.national_id || '').trim()));

        const parsed: ParsedExcelUser[] = jsonRows.map((row, idx) => {
          // استخراج هوشمند ستون‌ها
          const employeeId = String(
            row['کد پرسنلی *'] ||
            row['کد پرسنلی'] ||
            row['کدپرسنلی'] ||
            row['employee_id'] ||
            row['EmpID'] ||
            ''
          ).trim();

          const nationalId = String(
            row['کد ملی *'] ||
            row['کد ملی'] ||
            row['کدملی'] ||
            row['national_id'] ||
            row['NationalID'] ||
            ''
          ).trim();

          const fullName = String(
            row['نام و نام خانوادگی *'] ||
            row['نام و نام خانوادگی'] ||
            row['نام و نام‌خانوادگی'] ||
            row['نام'] ||
            row['full_name'] ||
            ''
          ).trim();

          const department = String(row['واحد سازمانی'] || row['بخش'] || row['دپارتمان'] || 'پالایشگاه اصفهان').trim();
          const jobTitle = String(row['سمت شغلی'] || row['عنوان شغل'] || row['شغل'] || 'کارشناس').trim();
          const role = parseRole(row['نقش کاربری'] || row['نقش'] || row['سطح دسترسی']);
          const phone = String(row['تلفن همراه'] || row['شماره تماس'] || row['موبایل'] || '09120000000').trim();
          const password = String(row['کلمه عبور'] || row['رمز عبور'] || 'User@123').trim();

          let isValid = true;
          let validationError = '';

          if (!employeeId) {
            isValid = false;
            validationError = 'کد پرسنلی خالی است';
          } else if (existingEmpIds.has(employeeId.toLowerCase())) {
            isValid = false;
            validationError = 'کد پرسنلی تکراری است';
          } else if (!fullName) {
            isValid = false;
            validationError = 'نام و نام خانوادگی خالی است';
          }

          const username = employeeId || `user_${Date.now()}_${idx}`;

          return {
            employee_id: employeeId,
            national_id: nationalId || '0000000000',
            username,
            full_name: fullName,
            department,
            job_title: jobTitle,
            role,
            phone,
            password,
            isValid,
            validationError
          };
        });

        setParsedUsers(parsed);
        setIsProcessing(false);
      } catch (err: any) {
        console.error('Excel parse error:', err);
        setErrorMsg('خطا در خواندن فایل اکسل. لطفاً از فرمت معتبر xlsx یا xls استفاده فرمایید.');
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('خطا در بارگذاری فایل از دیسک.');
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  // تأیید و افزودن کاربران به پایگاه داده
  const handleConfirmImport = () => {
    const validUsers = parsedUsers.filter(u => u.isValid);
    if (validUsers.length === 0) {
      alert('هیچ کاربر معتبری برای وارد کردن به سامانه وجود ندارد.');
      return;
    }

    let addedCount = 0;
    validUsers.forEach((u, i) => {
      const newUser: User = {
        id: `usr_imp_${Date.now()}_${i}`,
        username: u.employee_id || u.username,
        employee_id: u.employee_id,
        national_id: u.national_id,
        password: u.password || 'User@123',
        full_name: u.full_name,
        email: `${u.employee_id}@eorc.ir`,
        phone: u.phone,
        role: u.role,
        department: u.department,
        job_title: u.job_title,
        status: 'active',
        created_at: new Date().toISOString()
      };
      db.addUser(newUser);
      addedCount++;
    });

    setImportResult({
      successCount: addedCount,
      skipCount: parsedUsers.length - addedCount
    });

    triggerRefresh();
    if (onSuccess) onSuccess();
  };

  const handleReset = () => {
    setFileName(null);
    setParsedUsers([]);
    setImportResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedUsers.filter(u => u.isValid).length;
  const invalidCount = parsedUsers.length - validCount;

  return (
    <div className={`space-y-4 text-xs ${className}`}>
      {/* سربرگ معرفی ابزار اکسل */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              ورود دسته‌جمعی پرسنل و کاربران از فایل اکسل (Excel Bulk Import)
            </h3>
            <p className="text-slate-600 text-[11px] mt-0.5">
              بارگذاری اکسل پرسنلی، تطبیق خودکار ستون‌ها بر مبنای «کد پرسنلی»، اعتبارسنجی تکراری‌ها و ثبت مستقیم در پایگاه داده
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-100/70 text-emerald-800 rounded-lg font-bold transition-colors shadow-2xs shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>دانلود فایل اکسل نمونه</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* اگر فایلی انتخاب نشده باشد: دراپ‌زون */}
      {parsedUsers.length === 0 && !importResult && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-600 bg-emerald-50/80 shadow-inner'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-white'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6 animate-pulse" />
            </div>

            <p className="font-bold text-slate-800 text-sm">
              فایل اکسل پرسنل (.xlsx یا .xls) را اینجا بکشید و رها کنید یا کلیک نمایید
            </p>
            <p className="text-slate-400 text-[11px]">
              ستون‌های پیشنهادی: کد پرسنلی، کد ملی، نام و نام خانوادگی، واحد سازمانی، سمت، نقش کاربری
            </p>

            <button
              type="button"
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-xs"
            >
              انتخاب فایل اکسل از سیستم
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-bold">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* گزارش نتیجه پس از ثبت */}
      {importResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>عملیات ورود پرسنل با موفقیت به پایان رسید.</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <span className="text-slate-500 block mb-0.5">کاربران افزوده شده به دیتابیس:</span>
              <strong className="text-emerald-700 font-mono text-base">{importResult.successCount} نفر</strong>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <span className="text-slate-500 block mb-0.5">موارد رد شده (تکراری/ناقص):</span>
              <strong className="text-slate-700 font-mono text-base">{importResult.skipCount} ردیف</strong>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors"
            >
              وارد کردن فایل اکسل جدید
            </button>
          </div>
        </div>
      )}

      {/* پیش‌نمایش جدول اطلاعات استخراج‌شده */}
      {parsedUsers.length > 0 && !importResult && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">پیش‌نمایش اطلاعات فایل: {fileName}</span>
              <span className="text-slate-400 font-mono">({parsedUsers.length} سطر شناسایی شد)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-100">
                {validCount} سطر معتبر و آماده ورود
              </span>
              {invalidCount > 0 && (
                <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-100">
                  {invalidCount} سطر دارای خطا یا تکراری
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-100 rounded-lg">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-2.5">وضعیت</th>
                  <th className="p-2.5">کد پرسنلی</th>
                  <th className="p-2.5">نام و نام خانوادگی</th>
                  <th className="p-2.5">کد ملی</th>
                  <th className="p-2.5">واحد سازمانی</th>
                  <th className="p-2.5">سمت شغلی</th>
                  <th className="p-2.5">نقش</th>
                  <th className="p-2.5">تلفن همراه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedUsers.map((u, i) => (
                  <tr key={i} className={u.isValid ? 'hover:bg-slate-50/70' : 'bg-rose-50/40'}>
                    <td className="p-2.5">
                      {u.isValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>معتبر</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[10px]" title={u.validationError}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{u.validationError}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">{u.employee_id || '—'}</td>
                    <td className="p-2.5 font-medium text-slate-900">{u.full_name}</td>
                    <td className="p-2.5 font-mono text-slate-600">{u.national_id}</td>
                    <td className="p-2.5 text-slate-700">{u.department}</td>
                    <td className="p-2.5 text-slate-700">{u.job_title}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {u.role === 'super_admin' ? 'مدیر ارشد' : u.role === 'class_manager' ? 'مدیر آموزش' : u.role === 'instructor' ? 'مدرس' : 'فراگیر'}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-slate-600">{u.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>انصراف و انتخاب مجدد فایل</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={validCount === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>تأیید و وارد کردن {validCount} کاربر به سامانه</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
