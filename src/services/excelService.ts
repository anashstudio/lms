import * as XLSX from 'xlsx';
import {
  User,
  Course,
  Question,
  ExamAttempt,
  KirkpatrickEvaluation,
  TNARecord,
  Certificate
} from '../types/models';

function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(workbook, fileName, { bookType: 'xlsx', type: 'binary' });
}

export const ExcelService = {
  async parseUsersFile(file: File): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

          const parsedUsers: User[] = rawRows.map((row, index) => {
            const nationalId = String(row['کد ملی'] || row['national_id'] || row['NationalId'] || `999${index}`).trim();
            const fullName = String(row['نام و نام خانوادگی'] || row['نام'] || row['full_name'] || `کاربر جدید ${index + 1}`).trim();
            const email = String(row['ایمیل'] || row['email'] || `user${index + 1}@organization.ir`).trim();
            const phone = String(row['تلفن همراه'] || row['تلفن'] || row['phone'] || '09120000000').trim();
            const username = String(row['نام کاربری'] || row['username'] || email.split('@')[0] || `user_${nationalId.slice(-4) || index}`).trim().toLowerCase();
            const password = String(row['رمز عبور'] || row['password'] || 'User@123').trim();
            const roleRaw = String(row['نقش'] || row['role'] || 'learner').toLowerCase().trim();

            let role: any = 'learner';
            if (roleRaw.includes('admin') || roleRaw.includes('مدیر ارشد')) role = 'super_admin';
            else if (roleRaw.includes('class') || roleRaw.includes('مدیر کلاس') || roleRaw.includes('مدیر آموزش')) role = 'class_manager';
            else if (roleRaw.includes('instruct') || roleRaw.includes('مدرس') || roleRaw.includes('استاد')) role = 'instructor';

            return {
              id: `usr_${Date.now()}_${index}`,
              username,
              national_id: nationalId,
              password,
              full_name: fullName,
              email: email,
              phone: phone,
              role,
              department: String(row['واحد سازمانی'] || row['department'] || 'عمومی'),
              job_title: String(row['عنوان شغلی'] || row['job_title'] || 'کارشناس'),
              status: (row['وضعیت'] === 'inactive' || row['status'] === 'inactive') ? 'inactive' : 'active',
              created_at: new Date().toISOString()
            };
          });

          resolve(parsedUsers);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  exportUsers(users: User[]): void {
    const data = users.map(u => ({
      'شناسه سیستمی': u.id,
      'نام کاربری (Username)': u.username || '',
      'کد ملی (National ID)': u.national_id,
      'نام و نام خانوادگی': u.full_name,
      'پست الکترونیکی': u.email,
      'شماره تماس': u.phone,
      'نقش کاربری': u.role === 'super_admin' ? 'مدیر ارشد' : u.role === 'class_manager' ? 'مدیر کلاس' : u.role === 'instructor' ? 'مدرس' : 'فراگیر',
      'واحد سازمانی': u.department,
      'سمت شغلی': u.job_title,
      'وضعیت حساب': u.status === 'active' ? 'فعال' : 'غیرفعال',
      'تاریخ عضویت': u.created_at.split('T')[0]
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'کاربران_سامانه');
    downloadWorkbook(workbook, `گزارش_کاربران_LMS_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  async parseCoursesFile(file: File): Promise<Partial<Course>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

          const parsedCourses: Partial<Course>[] = rawRows.map((row, idx) => ({
            id: `crs_${Date.now()}_${idx}`,
            code: String(row['کد دوره'] || row['code'] || `CRS-${Date.now()}-${idx}`).trim(),
            title: String(row['عنوان دوره آموزشی'] || row['عنوان'] || row['title'] || `دوره جدید ${idx + 1}`).trim(),
            category: String(row['دسته‌بندی موضوعی'] || row['category'] || 'عمومی').trim(),
            description: String(row['توضیحات دوره'] || row['description'] || '').trim(),
            duration_hours: Number(row['مدت دوره (ساعت)'] || row['duration_hours'] || 16),
            instructor_id: 'usr_instructor',
            instructor_name: 'استاد علی مهدوی',
            class_manager_id: 'usr_class_mgr',
            status: 'active',
            iso_phase: 'execution',
            target_audience: String(row['مخاطبان هدف'] || row['target_audience'] || 'کلیه پرسنل'),
            created_at: new Date().toISOString()
          }));

          resolve(parsedCourses);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  exportCourses(courses: Course[]): void {
    const data = courses.map(c => ({
      'کد دوره': c.code,
      'عنوان دوره': c.title,
      'دسته‌بندی': c.category,
      'مدت (ساعت)': c.duration_hours,
      'مدرس': c.instructor_name,
      'فاز استاندارد': c.iso_phase === 'tna' ? 'نیازسنجی شایستگی' : c.iso_phase === 'design_planning' ? 'طراحی و برنامه‌ریزی' : c.iso_phase === 'execution' ? 'تامین و اجرا' : 'ارزشیابی اثربخشی',
      'وضعیت دوره': c.status === 'active' ? 'درحال برگزاری' : c.status === 'completed' ? 'تکمیل شده' : 'پیش‌نویس',
      'مخاطبان': c.target_audience
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'لیست_دوره‌ها');
    downloadWorkbook(workbook, `گزارش_دوره‌های_آموزشی_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  async parseQuestionsFile(file: File, examId: string): Promise<Question[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

          const questions: Question[] = rawRows.map((row, idx) => {
            const opt1 = String(row['گزینه ۱'] || row['opt1'] || 'گزینه اول');
            const opt2 = String(row['گزینه ۲'] || row['opt2'] || 'گزینه دوم');
            const opt3 = String(row['گزینه ۳'] || row['opt3'] || 'گزینه سوم');
            const opt4 = String(row['گزینه ۴'] || row['opt4'] || 'گزینه چهارم');
            const correctNum = Number(row['شماره گزینه صحیح (1 تا 4)'] || row['correct'] || 1);
            const correctIndex = Math.max(0, Math.min(3, correctNum - 1));

            return {
              id: `qst_${Date.now()}_${idx}`,
              exam_id: examId,
              question_text: String(row['متن سوال'] || row['question'] || `سوال شماره ${idx + 1}`),
              question_type: (row['نوع سوال'] === 'descriptive') ? 'descriptive' : 'multiple_choice',
              options: [opt1, opt2, opt3, opt4],
              correct_option_index: correctIndex,
              score_weight: Number(row['بارم نمره'] || row['score'] || 20),
              explanation: String(row['توضیحات پاسخ'] || row['explanation'] || '')
            };
          });

          resolve(questions);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  exportExamResults(attempts: ExamAttempt[], examTitle: string): void {
    const data = attempts.map(a => ({
      'شناسه آزمون‌دهنده': a.user_id,
      'نام فراگیر': a.user_name,
      'نمره کسب شده': a.score,
      'نمره کل آزمون': a.total_score,
      'درصد موفقیت': `${Math.round((a.score / a.total_score) * 100)}%`,
      'نتیجه': a.passed ? 'قبول' : 'مردود',
      'تاریخ ثبت': a.submitted_at.split('T')[0],
      'بازخورد سیستمی': a.feedback || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'نتایج_آزمون');
    downloadWorkbook(workbook, `کارنامه_آزمون_${examTitle.substring(0, 20)}_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  exportKirkpatrickReport(evaluations: KirkpatrickEvaluation[]): void {
    const level1Data = evaluations.filter(e => e.level === 1).map(e => ({
      'عنوان دوره': e.course_title,
      'نام ارزیابی‌شونده': e.user_name,
      'رضایت کلی (۱ تا ۵)': e.scores.satisfaction || 0,
      'کیفیت تدریس مدرس': e.scores.instructor_rating || 0,
      'کیفیت محتوا و منابع': e.scores.material_quality || 0,
      'کاربردی بودن دوره': e.scores.applicability || 0,
      'دیدگاه و نظرات': e.comments,
      'تاریخ ثبت': e.evaluation_date.split('T')[0]
    }));

    const level2Data = evaluations.filter(e => e.level === 2).map(e => ({
      'عنوان دوره': e.course_title,
      'نام فراگیر': e.user_name,
      'نمره پیش‌آزمون (%)': e.scores.pre_test_score || 0,
      'نمره پس‌آزمون (%)': e.scores.post_test_score || 0,
      'درصد رشد دانش و یادگیری': `${Math.round((e.scores.post_test_score || 0) - (e.scores.pre_test_score || 0))}%`,
      'گزارش ممتحن': e.comments,
      'تاریخ ارزیابی': e.evaluation_date.split('T')[0]
    }));

    const level3Data = evaluations.filter(e => e.level === 3).map(e => ({
      'عنوان دوره': e.course_title,
      'نام پرسنل': e.user_name,
      'امتیاز تغییر رفتار در محیط کار (۱ تا ۵)': e.scores.behavior_change_score || 0,
      'میزان پیاده‌سازی مهارت در وظایف روزمره': e.scores.workplace_implementation || 0,
      'نظر سرپرست مستقیم': e.comments,
      'تاریخ ارزیابی ۳۰/۶۰ روزه': e.evaluation_date.split('T')[0]
    }));

    const level4Data = evaluations.filter(e => e.level === 4).map(e => ({
      'عنوان دوره': e.course_title,
      'شاخص اثرگذاری بر KPI سازمانی (%)': `${e.scores.kpi_impact_percent || 0}%`,
      'درصد بازگشت سرمایه آموزشی (ROI)': `${e.scores.roi_percent || 0}%`,
      'شواهد ملموس سازمانی': e.comments,
      'تاریخ محاسبه': e.evaluation_date.split('T')[0]
    }));

    const workbook = XLSX.utils.book_new();
    if (level1Data.length > 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(level1Data), 'سطح۱_واکنش');
    if (level2Data.length > 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(level2Data), 'سطح۲_یادگیری');
    if (level3Data.length > 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(level3Data), 'سطح۳_رفتار');
    if (level4Data.length > 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(level4Data), 'سطح۴_نتایج_و_ROI');

    downloadWorkbook(workbook, `گزارش_جامع_اثربخشی_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  exportISO10015Audit(tnaList: TNARecord[], courses: Course[], certificates: Certificate[]): void {
    const tnaSheet = XLSX.utils.json_to_sheet(tnaList.map(t => ({
      'کد نیازسنجی': t.code,
      'واحد سازمانی': t.department,
      'مشاغل هدف': t.job_titles.join('، '),
      'شکاف شایستگی شناسایی‌شده': t.competency_gap,
      'عنوان دوره پیشنهادی': t.proposed_course_title,
      'تعداد پرسنل هدف': t.target_trainees_count,
      'اولویت': t.priority === 'high' ? 'بالا' : t.priority === 'medium' ? 'متوسط' : 'پایین',
      'سال اجرا': t.year,
      'وضعیت تاییدیه': t.status === 'approved' ? 'مصوب' : t.status === 'completed' ? 'تکمیل شده' : 'درحال بررسی',
      'توجیه استراتژیک': t.justification
    })));

    const coursesSheet = XLSX.utils.json_to_sheet(courses.map(c => ({
      'کد دوره': c.code,
      'عنوان دوره': c.title,
      'فاز استاندارد': c.iso_phase,
      'مدت (ساعت)': c.duration_hours,
      'مدرس': c.instructor_name,
      'وضعیت اجرا': c.status
    })));

    const certsSheet = XLSX.utils.json_to_sheet(certificates.map(cert => ({
      'شماره گواهینامه معتبر': cert.certificate_number,
      'نام دارنده مدرک': cert.user_name,
      'عنوان دوره استاندارد': cert.course_title,
      'ساعت دوره': cert.duration_hours,
      'نمره نهایی': cert.grade,
      'کد انطباق استاندارد': cert.iso_compliance_code,
      'مدرس صادرکننده': cert.instructor_name,
      'تاریخ صدور': cert.issue_date.split('T')[0],
      'اعتبار ممیزی': cert.is_valid ? 'معتبر' : 'منقضی'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, tnaSheet, 'مرحله۱_نیازسنجی_TNA');
    XLSX.utils.book_append_sheet(workbook, coursesSheet, 'مرحله۲و۳_برنامه‌ریزی_و_اجرا');
    XLSX.utils.book_append_sheet(workbook, certsSheet, 'مرحله۴_گواهینامه‌ها');

    downloadWorkbook(workbook, `دفترچه_ممیزی_سیستم_آموزش_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  exportCoursesToExcel(courses: Course[]): void {
    const sheetData = courses.map((c) => ({
      'کد کلاس': c.code,
      'عنوان کلاس': c.title,
      'گروه آموزشی': c.category,
      'شروع': c.start_date || '۱۴۰۵/۰۸/۰۱',
      'پایان': c.end_date || '۱۴۰۵/۰۹/۰۱',
      'شعبه': c.branch || 'پالایشگاه اصفهان',
      'وضعیت': c.status === 'active' ? 'فعال' : 'پیش‌نویس',
      'مخاطبین': c.target_audience || 'کلیه کارکنان'
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheetData), 'کلاس‌ها');
    downloadWorkbook(workbook, `فهرست_کلاس‌ها_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  exportTableToExcel(tableId: string, fileName: string): void {
    const table = document.getElementById(tableId);
    if (!table) return;
    const workbook = XLSX.utils.table_to_book(table);
    downloadWorkbook(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};
