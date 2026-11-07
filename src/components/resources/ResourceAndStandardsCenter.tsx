import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { ExcelService } from '../../services/excelService';
import { THEME_CONFIGS } from '../../utils/theme';
import {
  CourseResource,
  ResourceCategory,
  Course,
  TNARecord,
  Certificate,
  KirkpatrickEvaluation
} from '../../types/models';
import {
  FolderArchive,
  BookOpen,
  Video,
  Volume2,
  FileSpreadsheet,
  FileText,
  Eye,
  Plus,
  Search,
  Filter,
  CheckCircle,
  X,
  Edit2,
  Trash2,
  ShieldCheck,
  Award,
  BarChart3,
  TrendingUp,
  Clock,
  Printer,
  Smile,
  GraduationCap,
  Briefcase,
  DollarSign,
  Calculator
} from 'lucide-react';

import { ResourceModifyView } from './ResourceModifyView';
import { ResourceViewerModal } from './ResourceViewerModal';

interface ResourceAndStandardsCenterProps {
  initialTab?: 'library' | 'quality_cycle' | 'evaluation' | 'iso10015' | 'kirkpatrick' | 'modify';
}

export const ResourceAndStandardsCenter: React.FC<ResourceAndStandardsCenterProps> = ({ initialTab = 'library' }) => {
  const { settings, activeRole, activeUser, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const normalizedInitialTab =
    initialTab === 'iso10015' ? 'quality_cycle' :
    initialTab === 'kirkpatrick' ? 'evaluation' : initialTab;

  const [activeTab, setActiveTab] = useState<'library' | 'quality_cycle' | 'evaluation' | 'modify'>(normalizedInitialTab);
  const [selectedModifyResource, setSelectedModifyResource] = useState<CourseResource | null>(null);

  const [resources, setResources] = useState<CourseResource[]>(() => db.getResourcesByCourse());
  const [courses] = useState<Course[]>(() => db.getCourses());
  const [tnaList, setTnaList] = useState<TNARecord[]>(() => db.getTNARecords());
  const [certificates, setCertificates] = useState<Certificate[]>(() => db.getCertificates());
  const [evaluations, setEvaluations] = useState<KirkpatrickEvaluation[]>(() => db.getKirkpatrickEvaluations());

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<CourseResource | null>(null);
  const [resTitle, setResTitle] = useState('');
  const [resCourseId, setResCourseId] = useState(courses[0]?.id || '');
  const [resCategory, setResCategory] = useState<ResourceCategory>('books_handouts');
  const [resType, setResType] = useState('pdf');
  const [resSize, setResSize] = useState(2.5);
  const [resDesc, setResDesc] = useState('');
  const [selectedResourceForView, setSelectedResourceForView] = useState<CourseResource | null>(null);

  const [cycleSubTab, setCycleSubTab] = useState<'cycle' | 'tna' | 'audit' | 'certificates'>('cycle');
  const [isTnaModalOpen, setIsTnaModalOpen] = useState(false);
  const [editingTna, setEditingTna] = useState<TNARecord | null>(null);
  const [tnaCode, setTnaCode] = useState('');
  const [tnaDept, setTnaDept] = useState('');
  const [tnaJobTitles, setTnaJobTitles] = useState('');
  const [tnaGap, setTnaGap] = useState('');
  const [tnaCourse, setTnaCourse] = useState('');
  const [tnaTrainees, setTnaTrainees] = useState(15);
  const [tnaPriority, setTnaPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [tnaStatus, setTnaStatus] = useState<'approved' | 'in_review' | 'completed'>('approved');

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [certLearnerId, setCertLearnerId] = useState('usr_learner_1');
  const [certCourseId, setCertCourseId] = useState(courses[0]?.id || '');
  const [certNumber, setCertNumber] = useState('');
  const [certGrade, setCertGrade] = useState(90);

  const [activeEvalLevel, setActiveEvalLevel] = useState<1 | 2 | 3 | 4>(1);
  const [selectedEvalCourseId, setSelectedEvalCourseId] = useState<string>('all');
  const [editingEval, setEditingEval] = useState<KirkpatrickEvaluation | null>(null);
  const [evalSatisfaction, setEvalSatisfaction] = useState(5);
  const [evalInstructor, setEvalInstructor] = useState(5);
  const [evalMaterials, setEvalMaterials] = useState(4);
  const [evalApplicability, setEvalApplicability] = useState(5);
  const [evalComments, setEvalComments] = useState('');
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  const canEdit = activeRole === 'super_admin' || activeRole === 'class_manager' || activeRole === 'instructor';
  const isAdmin = activeRole === 'super_admin' || activeRole === 'class_manager';

  const reloadData = () => {
    setResources(db.getResourcesByCourse());
    setTnaList(db.getTNARecords());
    setCertificates(db.getCertificates());
    setEvaluations(db.getKirkpatrickEvaluations());
    triggerRefresh();
  };

  const openNewResourceModal = () => {
    setSelectedModifyResource(null);
    setActiveTab('modify');
  };

  const openEditResourceModal = (r: CourseResource) => {
    setSelectedModifyResource(r);
    setActiveTab('modify');
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle) return;

    if (editingResource) {
      db.updateResource(editingResource.id, {
        title: resTitle,
        course_id: resCourseId,
        category: resCategory,
        file_type: resType,
        file_size_mb: Number(resSize),
        description: resDesc
      });
    } else {
      const created: CourseResource = {
        id: `res_${Date.now()}`,
        course_id: resCourseId,
        title: resTitle,
        category: resCategory,
        file_type: resType,
        file_size_mb: Number(resSize),
        download_url: '#',
        description: resDesc,
        uploaded_by: activeUser.full_name,
        created_at: new Date().toISOString()
      };
      db.addResource(created);
    }

    setIsResourceModalOpen(false);
    reloadData();
  };

  const handleDeleteResource = (id: string, title: string) => {
    if (confirm(`آیا از حذف منبع «${title}» اطمینان دارید؟`)) {
      db.deleteResource(id);
      reloadData();
    }
  };

  const openNewTnaModal = () => {
    setEditingTna(null);
    setTnaCode(`TNA-${new Date().getFullYear()}-0${tnaList.length + 1}`);
    setTnaDept('واحد مدیریت دانش و مهارت');
    setTnaJobTitles('کارشناس تحلیل عملیات');
    setTnaGap('');
    setTnaCourse('');
    setTnaTrainees(15);
    setTnaPriority('high');
    setTnaStatus('approved');
    setIsTnaModalOpen(true);
  };

  const openEditTnaModal = (t: TNARecord) => {
    setEditingTna(t);
    setTnaCode(t.code);
    setTnaDept(t.department);
    setTnaJobTitles(t.job_titles.join(', '));
    setTnaGap(t.competency_gap);
    setTnaCourse(t.proposed_course_title);
    setTnaTrainees(t.target_trainees_count);
    setTnaPriority(t.priority);
    setTnaStatus(t.status);
    setIsTnaModalOpen(true);
  };

  const handleSaveTNA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tnaGap || !tnaCourse) return;

    if (editingTna) {
      db.updateTNARecord(editingTna.id, {
        code: tnaCode,
        department: tnaDept,
        job_titles: tnaJobTitles.split(',').map(s => s.trim()),
        competency_gap: tnaGap,
        proposed_course_title: tnaCourse,
        target_trainees_count: Number(tnaTrainees),
        priority: tnaPriority,
        status: tnaStatus
      });
    } else {
      const created: TNARecord = {
        id: `tna_${Date.now()}`,
        code: tnaCode,
        department: tnaDept,
        job_titles: tnaJobTitles.split(',').map(s => s.trim()),
        competency_gap: tnaGap,
        proposed_course_title: tnaCourse,
        target_trainees_count: Number(tnaTrainees),
        priority: tnaPriority,
        year: new Date().getFullYear(),
        status: tnaStatus,
        justification: 'انطباق با نیازمندی‌های توسعه شایستگی شغلی سازمان'
      };
      db.addTNARecord(created);
    }

    setIsTnaModalOpen(false);
    reloadData();
  };

  const handleDeleteTNA = (id: string, code: string) => {
    if (confirm(`آیا از حذف فرم نیازسنجی کد ${code} اطمینان دارید؟`)) {
      db.deleteTNARecord(id);
      reloadData();
    }
  };

  const openNewCertModal = () => {
    setEditingCert(null);
    setCertLearnerId(db.getUsers().find(u => u.role === 'learner')?.id || '');
    setCertCourseId(courses[0]?.id || '');
    setCertNumber(`CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCertGrade(90);
    setIsCertModalOpen(true);
  };

  const openEditCertModal = (c: Certificate) => {
    setEditingCert(c);
    setCertLearnerId(c.user_id);
    setCertCourseId(c.course_id);
    setCertNumber(c.certificate_number);
    setCertGrade(c.grade);
    setIsCertModalOpen(true);
  };

  const handleSaveCert = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.getUserById(certLearnerId);
    const course = db.getCourseById(certCourseId);
    if (!user || !course) return;

    if (editingCert) {
      db.updateCertificate(editingCert.id, {
        user_id: user.id,
        user_name: user.full_name,
        course_id: course.id,
        course_title: course.title,
        certificate_number: certNumber,
        grade: Number(certGrade)
      });
    } else {
      const created: Certificate = {
        id: `cert_${Date.now()}`,
        certificate_number: certNumber,
        user_id: user.id,
        user_name: user.full_name,
        course_id: course.id,
        course_title: course.title,
        duration_hours: course.duration_hours,
        grade: Number(certGrade),
        issue_date: new Date().toISOString(),
        iso_compliance_code: 'CERT-VERIFIED-SYSTEM',
        instructor_name: course.instructor_name,
        is_valid: true
      };
      db.issueCertificate(created);
    }

    setIsCertModalOpen(false);
    reloadData();
  };

  const handleDeleteCert = (id: string, num: string) => {
    if (confirm(`آیا از ابطال و حذف گواهینامه ${num} اطمینان دارید؟`)) {
      db.deleteCertificate(id);
      reloadData();
    }
  };

  const openEditEvalModal = (ev: KirkpatrickEvaluation) => {
    setEditingEval(ev);
    setEvalSatisfaction(ev.scores.satisfaction || 5);
    setEvalInstructor(ev.scores.instructor_rating || 5);
    setEvalMaterials(ev.scores.material_quality || 4);
    setEvalApplicability(ev.scores.applicability || 5);
    setEvalComments(ev.comments);
    setIsEvalModalOpen(true);
  };

  const handleSaveEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEval) return;

    db.updateKirkpatrickEvaluation(editingEval.id, {
      scores: {
        ...editingEval.scores,
        satisfaction: Number(evalSatisfaction),
        instructor_rating: Number(evalInstructor),
        material_quality: Number(evalMaterials),
        applicability: Number(evalApplicability)
      },
      comments: evalComments
    });

    setIsEvalModalOpen(false);
    reloadData();
  };

  const filteredResources = resources.filter(r => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesCourse = selectedCourse === 'all' || r.course_id === selectedCourse;
    const matchesSearch = r.title.includes(searchQuery) || r.description.includes(searchQuery);
    return matchesCat && matchesCourse && matchesSearch;
  });

  const filteredEvals = evaluations.filter(e => {
    const matchesCourse = selectedEvalCourseId === 'all' || e.course_id === selectedEvalCourseId;
    const matchesLevel = e.level === activeEvalLevel;
    return matchesCourse && matchesLevel;
  });

  const categoryName = (cat: ResourceCategory) => {
    switch (cat) {
      case 'books_handouts': return 'کتب و جزوات آموزشی';
      case 'videos': return 'ویدئوهای تکمیلی';
      case 'powerpoints_slides': return 'پاورپوینت و اسلایدهای ارائه';
      case 'audio_podcasts': return 'فایل‌های صوتی و پادکست';
      case 'templates_docs': return 'تمپلیت‌ها و فرم‌های کاربردی';
      case 'sample_questions': return 'نمونه سوالات و آزمون‌ها';
      case 'elearning_packages': return 'بسته‌های الکترونیکی و چندرسانه‌ای';
      default: return 'سایر منابع';
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              مرکز جامع منابع یادگیری و سنجش اثربخشی آموزش
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            یکپارچه‌سازی کتابخانه منابع موضوعی، فرآیند چرخه کیفیت و شایستگی شغلی و سنجش چندسطحی نتایج آموزش
          </p>
        </div>

        {}
        <div className="flex items-center gap-2">
          {activeTab === 'quality_cycle' && (
            <button
              onClick={() => ExcelService.exportISO10015Audit(tnaList, courses, certificates)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>خروجی اکسل ماتریس شایستگی‌ها</span>
            </button>
          )}

          {activeTab === 'evaluation' && (
            <button
              onClick={() => ExcelService.exportKirkpatrickReport(evaluations)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>خروجی اکسل ارزیابی اثربخشی</span>
            </button>
          )}
        </div>
      </div>

      {}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${
            activeTab === 'library'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#0288d1]" />
          <span>کتابخانه و مخزن منابع ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('modify')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${
            activeTab === 'modify'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit2 className="w-4 h-4 text-[#0288d1]" />
          <span>فرم ویرایش منبع (مطابق سامانه)</span>
        </button>

        <button
          onClick={() => setActiveTab('quality_cycle')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${
            activeTab === 'quality_cycle'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>فرآیند چرخه کیفیت و شایستگی شغلی</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${
            activeTab === 'evaluation'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>ارزیابی اثربخشی آموزش و نتایج سازمانی</span>
        </button>
      </div>

      {activeTab === 'modify' && (
        <ResourceModifyView
          initialResource={selectedModifyResource}
          onSave={() => {
            reloadData();
            setActiveTab('library');
          }}
          onCancel={() => setActiveTab('library')}
        />
      )}

      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-80 border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-emerald-500">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو در عنوان یا متن منبع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full focus:outline-none text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="all">تمام دوره‌های آموزشی</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>

                {canEdit && (
                  <button
                    onClick={openNewResourceModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shrink-0 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن منبع</span>
                  </button>
                )}
              </div>
            </div>

            {}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
              {[
                { id: 'all', label: 'همه دسته‌ها' },
                { id: 'books_handouts', label: 'کتب و جزوات' },
                { id: 'videos', label: 'ویدئوهای آموزشی' },
                { id: 'powerpoints_slides', label: 'پاورپوینت و اسلایدها' },
                { id: 'audio_podcasts', label: 'پادکست‌ها' },
                { id: 'templates_docs', label: 'تمپلیت‌ها' },
                { id: 'sample_questions', label: 'نمونه سوالات' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedCategory === tab.id
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                منبعی در این دسته‌بندی یافت نشد.
              </div>
            ) : (
              filteredResources.map(res => {
                const course = courses.find(c => c.id === res.course_id);
                return (
                  <div
                    key={res.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-emerald-700 font-semibold">{categoryName(res.category)}</span>
                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <>
                              <button
                                onClick={() => openEditResourceModal(res)}
                                className="text-slate-400 hover:text-emerald-700 p-1 rounded transition-colors"
                                title="ویرایش منبع"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteResource(res.id, res.title)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                                title="حذف منبع"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <span className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold font-mono text-[10px] uppercase mr-1">
                            {res.file_type}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {res.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                        {res.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        <span>{res.file_size_mb} MB</span>
                        <span className="mx-1.5">·</span>
                        <span className="truncate max-w-[110px] inline-block align-bottom">{course?.code || 'عمومی'}</span>
                      </div>

                      <button
                        onClick={() => setSelectedResourceForView(res)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>مشاهده محتوا</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {}
      {activeTab === 'quality_cycle' && (
        <div className="space-y-4">
          {}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto">
            <button
              onClick={() => setCycleSubTab('cycle')}
              className={`px-3.5 py-2 font-medium rounded-md transition-colors ${
                cycleSubTab === 'cycle' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              چرخه ۴ گانه کیفیت آموزش
            </button>
            <button
              onClick={() => setCycleSubTab('tna')}
              className={`px-3.5 py-2 font-medium rounded-md transition-colors ${
                cycleSubTab === 'tna' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نیازسنجی شایستگی شغلی (TNA) ({tnaList.length})
            </button>
            <button
              onClick={() => setCycleSubTab('audit')}
              className={`px-3.5 py-2 font-medium rounded-md transition-colors ${
                cycleSubTab === 'audit' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              چک‌لیست ممیزی داخلی
            </button>
            <button
              onClick={() => setCycleSubTab('certificates')}
              className={`px-3.5 py-2 font-medium rounded-md transition-colors ${
                cycleSubTab === 'certificates' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              گواهینامه‌های رسمی پایان دوره ({certificates.length})
            </button>
          </div>

          {}
          {cycleSubTab === 'cycle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { num: '۱', title: 'فاز ۱: نیازسنجی شایستگی (TNA)', desc: 'تحلیل نیازهای راهبردی سازمان، بررسی الزامات شغلی و استخراج شکاف شایستگی پرسنل.', status: `${tnaList.length} سند مصوب`, badge: 'مرحله اول' },
                { num: '۲', title: 'فاز ۲: طراحی و تدوین دوره', desc: 'تعیین اهداف یادگیری کاربردی، تقویم زمان‌بندی آموزش، پودمان‌ها و سرفصل‌ها.', status: `${courses.length} دوره فعال`, badge: 'مرحله دوم' },
                { num: '۳', title: 'فاز ۳: تدارک و اجرای آموزش', desc: 'برگزاری جلسات آفلاین، ارائه منابع موضوعی، آزمونک‌ها و پایش حضور پرسنل.', status: 'درحال آموزش', badge: 'مرحله سوم' },
                { num: '۴', title: 'فاز ۴: سنجش اثربخشی و صدور مدرک', desc: 'سنجش جامع نتایج آموزش، تحلیل رفتار شغلی و صدور گواهینامه‌های معتبر.', status: `${certificates.length} گواهی صادره`, badge: 'مرحله چهارم' }
              ].map(phase => (
                <div key={phase.num} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">{phase.num}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{phase.badge}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{phase.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{phase.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{phase.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {}
          {cycleSubTab === 'tna' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">ماتریس نیازسنجی آموزشی سازمانی (TNA)</h3>
                  <p className="text-slate-500 mt-0.5">شناسایی شکاف شایستگی‌های شغلی و دوره‌های پیشنهادی واحدها</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={openNewTnaModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ثبت فرم نیازسنجی جدید</span>
                  </button>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">کد سند</th>
                        <th className="py-3 px-4">واحد سازمانی</th>
                        <th className="py-3 px-4">مشاغل هدف</th>
                        <th className="py-3 px-4">شکاف شایستگی</th>
                        <th className="py-3 px-4">دوره پیشنهادی</th>
                        <th className="py-3 px-4">تعداد پرسنل</th>
                        <th className="py-3 px-4">اولویت</th>
                        <th className="py-3 px-4">وضعیت</th>
                        {isAdmin && <th className="py-3 px-4 text-center">عملیات</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tnaList.map(tna => (
                        <tr key={tna.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono text-slate-700 font-semibold">{tna.code}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">{tna.department}</td>
                          <td className="py-3 px-4 text-slate-600">{tna.job_titles.join('، ')}</td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs">{tna.competency_gap}</td>
                          <td className="py-3 px-4 text-emerald-800 font-medium">{tna.proposed_course_title}</td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-800">{tna.target_trainees_count} نفر</td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${tna.priority === 'high' ? 'text-rose-700' : 'text-amber-700'}`}>
                              {tna.priority === 'high' ? 'بالا' : 'متوسط'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-emerald-700 font-medium">
                            {tna.status === 'approved' ? 'مصوب' : tna.status === 'completed' ? 'تکمیل' : 'بررسی'}
                          </td>
                          {isAdmin && (
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openEditTnaModal(tna)}
                                  className="text-slate-500 hover:text-emerald-700 p-1.5 rounded hover:bg-slate-100 transition-colors"
                                  title="ویرایش نیازسنجی"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTNA(tna.id, tna.code)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-slate-100 transition-colors"
                                  title="حذف نیازسنجی"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {}
          {cycleSubTab === 'audit' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">چک‌لیست خودارزیابی ممیزی داخلی سیستم آموزش</h3>
                <p className="text-slate-500 mt-1">انطباق مستندات، فرآیندهای یادگیری و ارزیابی شایستگی</p>
              </div>

              <div className="space-y-3">
                {[
                  { clause: 'بند ۱', title: 'فرآیند سیستماتیک نیازسنجی آموزشی (TNA)', desc: 'آیا نیازسنجی بر مبنای تحلیل شکاف شایستگی‌های شغل انجام شده است؟', status: 'منطبق' },
                  { clause: 'بند ۲', title: 'طراحی دوره‌ها و اهداف یادگیری', desc: 'آیا اهداف دوره‌ها، سرفصل‌ها و مدت زمان کلاس‌ها مشخص و مصوب است؟', status: 'منطبق' },
                  { clause: 'بند ۳', title: 'تدارک و دسترسی به منابع آموزشی آفلاین', desc: 'آیا فراگیران به اسلایدهای آموزشی، ویدئوها و فایل‌های تکمیلی دسترسی دارند؟', status: 'منطبق' },
                  { clause: 'بند ۴', title: 'ارزیابی اثربخشی نتایج آموزش', desc: 'آیا ارزیابی حداقل در سطوح واکنش، یادگیری و رفتار شغلی انجام می‌پذیرد؟', status: 'منطبق' },
                  { clause: 'بند ۵', title: 'نگهداری سوابق و صدور گواهینامه‌های معتبر', desc: 'آیا سوابق آموزشی پرسنل و گواهینامه‌ها در پایگاه‌داده SQL ثبت و قابل ردیابی هستند؟', status: 'منطبق' }
                ].map((chk, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-800 font-bold">{chk.clause}</span>
                        <span aria-hidden="true">·</span>
                        <h4 className="font-bold text-slate-900">{chk.title}</h4>
                      </div>
                      <p className="text-slate-600">{chk.desc}</p>
                    </div>
                    <span className="text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-4 h-4" />
                      {chk.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {cycleSubTab === 'certificates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">گواهینامه‌های رسمی پایان دوره و شایستگی</h3>
                  <p className="text-slate-500 mt-0.5">صدور و ویرایش مدارک با کد اعتبارسنجی یکتا</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={openNewCertModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>صدور گواهی جدید</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map(cert => (
                  <div key={cert.id} className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">گواهی رسمی شایستگی</span>
                          <h4 className="text-sm font-bold text-slate-900">{cert.user_name}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditCertModal(cert)}
                              className="text-slate-400 hover:text-emerald-700 p-1.5 rounded transition-colors"
                              title="ویرایش گواهینامه"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCert(cert.id, cert.certificate_number)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                              title="حذف گواهینامه"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded mr-1">
                          نمره: {cert.grade}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                      <div className="font-semibold text-slate-900">{cert.course_title}</div>
                      <div>شماره گواهینامه: <span className="font-mono text-slate-900 font-semibold">{cert.certificate_number}</span></div>
                      <div>مدرس دوره: <span className="font-semibold text-slate-800">{cert.instructor_name}</span></div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono tabular-nums">{cert.issue_date.split('T')[0]}</span>
                      <button onClick={() => window.print()} className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold">
                        <Printer className="w-3.5 h-3.5" />
                        <span>چاپ مدرک</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {}
      {activeTab === 'evaluation' && (
        <div className="space-y-4">
          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { level: 1 as const, title: 'مرحله ۱: واکنش و رضایت', metric: '۴.۸ / ۵', icon: Smile, subtitle: 'سنجش نظر فراگیران نسبت به مدرس و محتوا' },
              { level: 2 as const, title: 'مرحله ۲: یادگیری و دانش', metric: '+۴۵٪ رشد', icon: GraduationCap, subtitle: 'سنجش تفاوت پیش‌آزمون و پس‌آزمون' },
              { level: 3 as const, title: 'مرحله ۳: رفتار و عملکرد', metric: '۴.۶ / ۵', icon: Briefcase, subtitle: 'به‌کارگیری مهارت در محیط واقعی کار' },
              { level: 4 as const, title: 'مرحله ۴: نتایج و بازگشت سرمایه', metric: '۲۴۰٪ بازگشت', icon: DollarSign, subtitle: 'بهره‌وری سازمانی و شاخص ROI' }
            ].map(item => {
              const Icon = item.icon;
              const isSelected = activeEvalLevel === item.level;
              return (
                <div
                  key={item.level}
                  onClick={() => setActiveEvalLevel(item.level)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected ? 'border-slate-800 bg-white ring-2 ring-slate-800 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-lg font-bold font-mono text-slate-900 block">{item.metric}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">{item.subtitle}</span>
                </div>
              );
            })}
          </div>

          {}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                ارزیابی‌های ثبت‌شده برای مرحله {activeEvalLevel} اثربخشی آموزش
              </h3>
              <span className="text-slate-500">قابلیت ویرایش امتیازات و توضیحات تحلیلی</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">عنوان دوره</th>
                    <th className="py-3 px-4">شخص ارزیابی‌شونده</th>
                    <th className="py-3 px-4">امتیازات ثبت‌شده</th>
                    <th className="py-3 px-4">دیدگاه و تحلیل</th>
                    <th className="py-3 px-4">تاریخ ثبت</th>
                    {canEdit && <th className="py-3 px-4 text-center">عملیات</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvals.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{ev.course_title}</td>
                      <td className="py-3 px-4 text-slate-600">{ev.user_name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {ev.level === 1 && `رضایت: ${ev.scores.satisfaction || 0} از ۵`}
                        {ev.level === 2 && `پیش: ${ev.scores.pre_test_score}٪ / پس: ${ev.scores.post_test_score}٪`}
                        {ev.level === 3 && `رفتار: ${ev.scores.behavior_change_score || 0} از ۵`}
                        {ev.level === 4 && `ROI: ${ev.scores.roi_percent || 0}٪`}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{ev.comments}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{ev.evaluation_date.split('T')[0]}</td>
                      {canEdit && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openEditEvalModal(ev)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                            title="ویرایش ارزیابی"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingResource ? 'ویرایش منبع یادگیری' : 'افزودن منبع یادگیری جدید'}
              </h3>
              <button onClick={() => setIsResourceModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">عنوان منبع *</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">دوره مرتبط</label>
                  <select
                    value={resCourseId}
                    onChange={(e) => setResCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">دسته‌بندی موضوعی</label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="books_handouts">کتب و جزوات آموزشی</option>
                    <option value="videos">ویدئوهای تکمیلی</option>
                    <option value="audio_podcasts">فایل‌های صوتی و پادکست</option>
                    <option value="templates_docs">تمپلیت‌ها و فرم‌های کاربردی</option>
                    <option value="sample_questions">نمونه سوالات و آزمون‌ها</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">فرمت فایل</label>
                  <input
                    type="text"
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">حجم فایل (MB)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={resSize}
                    onChange={(e) => setResSize(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">توضیحات</label>
                <textarea
                  rows={2}
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResourceModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  ذخیره منبع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isTnaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingTna ? 'ویرایش فرم نیازسنجی شایستگی' : 'ثبت فرم نیازسنجی جدید (TNA)'}
              </h3>
              <button onClick={() => setIsTnaModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTNA} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">کد سند</label>
                  <input
                    type="text"
                    required
                    value={tnaCode}
                    onChange={(e) => setTnaCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">واحد سازمانی</label>
                  <input
                    type="text"
                    required
                    value={tnaDept}
                    onChange={(e) => setTnaDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">مشاغل هدف (با ویرگول جدا کنید)</label>
                <input
                  type="text"
                  required
                  value={tnaJobTitles}
                  onChange={(e) => setTnaJobTitles(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">شکاف شایستگی شناسایی‌شده *</label>
                <textarea
                  rows={2}
                  required
                  value={tnaGap}
                  onChange={(e) => setTnaGap(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">عنوان دوره پیشنهادی *</label>
                <input
                  type="text"
                  required
                  value={tnaCourse}
                  onChange={(e) => setTnaCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">تعداد پرسنل</label>
                  <input
                    type="number"
                    min="1"
                    value={tnaTrainees}
                    onChange={(e) => setTnaTrainees(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">اولویت</label>
                  <select
                    value={tnaPriority}
                    onChange={(e) => setTnaPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="high">بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="low">عادی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">وضعیت</label>
                  <select
                    value={tnaStatus}
                    onChange={(e) => setTnaStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="approved">مصوب</option>
                    <option value="in_review">درحال بررسی</option>
                    <option value="completed">تکمیل شده</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTnaModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  ذخیره فرم نیازسنجی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingCert ? 'ویرایش اطلاعات گواهینامه' : 'صدور گواهینامه جدید'}
              </h3>
              <button onClick={() => setIsCertModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">فراگیر / دریافت‌کننده مدرک</label>
                <select
                  value={certLearnerId}
                  onChange={(e) => setCertLearnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  {db.getUsers().map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.employee_id || u.national_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">دوره آموزشی</label>
                <select
                  value={certCourseId}
                  onChange={(e) => setCertCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">شماره سریال گواهینامه</label>
                  <input
                    type="text"
                    required
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">نمره نهایی (از ۱۰۰)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={certGrade}
                    onChange={(e) => setCertGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  ذخیره و ثبت گواهی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isEvalModalOpen && editingEval && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                ویرایش امتیازات ارزیابی: {editingEval.course_title}
              </h3>
              <button onClick={() => setIsEvalModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEval} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">امتیاز رضایت کلی (۱ تا ۵)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={evalSatisfaction}
                    onChange={(e) => setEvalSatisfaction(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ارزیابی عملکرد مدرس (۱ تا ۵)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={evalInstructor}
                    onChange={(e) => setEvalInstructor(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">توضیحات و دیدگاه تحلیلی</label>
                <textarea
                  rows={3}
                  value={evalComments}
                  onChange={(e) => setEvalComments(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEvalModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  ثبت تغییرات ارزیابی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ResourceViewerModal
        resource={selectedResourceForView}
        isOpen={!!selectedResourceForView}
        onClose={() => setSelectedResourceForView(null)}
        onEdit={(res) => {
          setSelectedModifyResource(res);
          setActiveTab('modify');
        }}
      />
    </div>
  );
};
