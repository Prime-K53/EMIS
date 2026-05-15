
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus,
  Search,
  ChevronRight,
  ShieldCheck,
  School as SchoolIcon,
  Users,
  Clock,
  Building2,
  BookOpen,
  GraduationCap,
  HeartPulse,
  BadgeDollarSign,
  Accessibility,
  Save,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Hash
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { TermlyReport } from '../types';
import { recalculateZonalAggregates } from '../services/analyticsService';
import { validateTermlyReport } from '../services/validationService';

const TABS = [
  { id: 'enrolment', label: 'Enrolment', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  { id: 'infrastructure', label: 'Infrastructure', icon: Building2 },
  { id: 'textbooks', label: 'Textbooks', icon: BookOpen },
  { id: 'exams', label: 'Exams & Results', icon: Hash },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'finance', label: 'Finance', icon: BadgeDollarSign },
  { id: 'specialNeeds', label: 'Special Needs', icon: Accessibility }
];

const INITIAL_REPORT_DATA = (schoolId: number): Partial<TermlyReport> => ({
  schoolId,
  term: 'Term 1',
  year: 2024,
  status: 'Draft',
  lastSaved: Date.now(),
  completeness: 0,
  enrolment: {
    grade1: { m: 0, f: 0, overageM: 0, overageF: 0, underageM: 0, underageF: 0 },
    grade2: { m: 0, f: 0, overageM: 0, overageF: 0, underageM: 0, underageF: 0 },
    grade3: { m: 0, f: 0, overageM: 0, overageF: 0, underageM: 0, underageF: 0 },
    grade4: { m: 0, f: 0, overageM: 0, overageF: 0, underageM: 0, underageF: 0 },
    grade5: { m: 0, f: 0, overageM: 0, overageF: 0, underageM: 0, underageF: 0 },
    grade6: { m: 0, f: 0, overageM: 0, overageF: 0, underageM: 0, underageF: 0 },
    grade7: { m: 0, f: 0, overageM: 0, overageF: 0, underageM: 0, underageF: 0 },
    grade8: { m: 0, f: 0, overageM: 0, overageF: 0, underageM: 0, underageF: 0 },
  },
  attendance: { 
    weeklyTotals: [],
    teacherAttendance: [{ m: 0, f: 0, present: 0, total: 0 }]
  },
  teachers: { summary: [] },
  infrastructure: {
    classroomsPermanent: 0,
    classroomsTemporary: 0,
    toiletsBoys: 0,
    toiletsGirls: 0,
    toiletsStaff: 0,
    waterSource: 'None',
    electricity: false
  },
  textbooks: { items: [] },
  exams: { results: [] },
  health: { feedingProgramme: false, beneficiaries: 0, washStatus: 'Adequate' },
  finance: { grantsReceived: 0, grantsSpent: 0, expenditureCategories: [] },
  specialNeeds: { learners: [] }
});

const DataUpload: React.FC = () => {
  const schools = useLiveQuery(() => db.schools.toArray());
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('enrolment');
  const [report, setReport] = useState<Partial<TermlyReport> | null>(null);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const schoolsList = useMemo(() => schools || [], [schools]);

  const selectedSchool = useMemo(() => 
    schoolsList.find(s => s.id === selectedSchoolId), [schoolsList, selectedSchoolId]
  );

  const handleLoadBaseline = () => {
    if (!selectedSchool || !report) return;
    
    // Logical projection: Distribute school capacity across grades
    const capacity = (selectedSchool.infrastructure?.classrooms || 8) * 45;
    const perGrade = Math.floor(capacity / 8);
    const perGender = Math.floor(perGrade / 2);
    
    const baselineEnrolment: Record<string, { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number }> = {};
    const grades = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'grade8'];
    
    grades.forEach(g => {
        baselineEnrolment[g] = { 
            m: perGender, 
            f: perGender, 
            overageM: Math.floor(perGender * 0.1), 
            overageF: Math.floor(perGender * 0.1), 
            underageM: Math.floor(perGender * 0.05), 
            underageF: Math.floor(perGender * 0.05) 
        };
    });

    const baselineInfrastructure = {
        classroomsPermanent: selectedSchool.infrastructure.classrooms || 8,
        classroomsTemporary: 0,
        toiletsBoys: Math.floor(selectedSchool.infrastructure.latrines / 2) || 4,
        toiletsGirls: Math.ceil(selectedSchool.infrastructure.latrines / 2) || 4,
        toiletsStaff: 2,
        waterSource: 'Borehole',
        electricity: false
    };

    setReport({
        ...report,
        enrolment: baselineEnrolment as TermlyReport['enrolment'],
        infrastructure: baselineInfrastructure
    });
  };

  // Validate whenever report changes
  const validationResults = useMemo(() => {
    if (!report) return [];
    return validateTermlyReport(report);
  }, [report]);

  // Load report when school changes
  useEffect(() => {
    if (selectedSchoolId) {
      const reportId = `${selectedSchoolId}-Term1-2024`;
      db.termlyReports.get(reportId).then(existingReport => {
        if (existingReport) {
          setReport(existingReport);
        } else {
          const newData = INITIAL_REPORT_DATA(selectedSchoolId);
          newData.id = reportId;
          setReport(newData);
        }
      });
    }
  }, [selectedSchoolId]);

  const calculateCompleteness = useCallback((data: Partial<TermlyReport>): number => {
    let sectionsFilled = 0;
    const totalSections = TABS.length;
    
    if (data.enrolment && Object.values(data.enrolment).some(g => g.m > 0 || g.f > 0)) sectionsFilled++;
    if (data.attendance?.weeklyTotals && (data.attendance.weeklyTotals.length > 0 || (data.attendance.teacherAttendance && data.attendance.teacherAttendance.length > 0))) sectionsFilled++;
    if (data.teachers?.summary && data.teachers.summary.length > 0) sectionsFilled++;
    if (data.infrastructure?.classroomsPermanent && data.infrastructure.classroomsPermanent > 0) sectionsFilled++;
    if (data.textbooks?.items && data.textbooks.items.length > 0) sectionsFilled++;
    if (data.exams?.results && data.exams.results.length > 0) sectionsFilled++;
    if (data.health && (data.health.beneficiaries! > 0 || data.health.feedingProgramme)) sectionsFilled++;
    if (data.finance?.grantsReceived && data.finance.grantsReceived > 0) sectionsFilled++;
    if (data.specialNeeds?.learners && data.specialNeeds.learners.length > 0) sectionsFilled++;
    
    return sectionsFilled / totalSections;
  }, []);

  const handleAutoSave = useCallback(async (currentReport: Partial<TermlyReport>) => {
    if (!currentReport || !currentReport.id) return;
    
    const updatedReport = {
      ...currentReport,
      lastSaved: Date.now(),
      completeness: calculateCompleteness(currentReport)
    };
    
    await db.termlyReports.put(updatedReport as TermlyReport);
    setReport(updatedReport);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  }, [calculateCompleteness]);

  const handleTabChange = (newTab: string) => {
    if (report && report.status !== 'Submitted') {
      handleAutoSave(report);
    }
    setActiveTab(newTab);
  };

  const handleSubmit = async () => {
    if (!report) return;
    
    // Final validation check
    const errors = validateTermlyReport(report);
    if (errors.some(e => e.type === 'error')) {
        alert("Cannot commit submission. Please resolve the critical data errors highlighted in the validation panel.");
        return;
    }

    const finalized = {
      ...report,
      status: 'Submitted' as const,
      lastSaved: Date.now()
    };
    
    await db.termlyReports.put(finalized as TermlyReport);
    setReport(finalized);

    // Recalculate Zonal Aggregates
    const agg = await recalculateZonalAggregates(finalized.term, finalized.year);
    
    // Update School Profile & Audit
    if (selectedSchool) {
        await db.schools.update(selectedSchool.id!, {
            updatedAt: Date.now(),
            infrastructure: {
                ...selectedSchool.infrastructure,
                classrooms: finalized.infrastructure?.classroomsPermanent || selectedSchool.infrastructure.classrooms,
                latrines: (finalized.infrastructure?.toiletsBoys || 0) + (finalized.infrastructure?.toiletsGirls || 0)
            }
        });
        
        await db.auditLogs.add({
            schoolId: selectedSchool.id!,
            action: 'update',
            content: `Termly data submitted for ${finalized.term} ${finalized.year}. Validation metrics cleared. Schools submitted: ${agg.schoolsSubmitted}/${agg.totalSchools}`,
            performedBy: 'Administrator',
            timestamp: Date.now()
        });
    }
  };

  const handleUnlock = async () => {
    if (!report) return;
    const unlocked = { ...report, status: 'Draft' as const };
    await db.termlyReports.put(unlocked as TermlyReport);
    setReport(unlocked);
  };

  if (!selectedSchoolId) {
    return (
      <div className="space-y-6">
        <header className="pb-6 border-b border-border-default">
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">Institutional Data Lifecycle</h1>
          <p className="text-[12px] font-medium text-text-secondary mt-1">Operational compliance and quarterly reporting lifecycle</p>
        </header>

        <div className="max-w-2xl mx-auto py-16 text-center space-y-8">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-lg flex items-center justify-center mx-auto shadow-lg relative">
            <SchoolIcon size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-[20px] font-bold text-text-primary tracking-tight">Select Targeted Institution</h2>
            <p className="text-[13px] text-text-secondary max-w-sm mx-auto leading-relaxed">Identify the administrative registry entry to initialize quarterly data synchronization and validation protocols.</p>
          </div>
          
          <div className="relative max-w-md mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-default transition-all" size={18} />
            <select 
              onChange={(e) => {
                setSelectedSchoolId(Number(e.target.value));
                setReport(null);
              }}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-border-default rounded-md outline-none focus:border-primary-default focus:ring-4 focus:ring-primary-default/5 transition-all text-[13px] font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
            >
              <option value="">Search EMIS Active Registry...</option>
              {schoolsList.map(school => (
                <option key={school.id} value={school.id}>{school.name} ({school.emisCode})</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover:translate-x-1 transition-transform" size={20} />
          </div>
        </div>
      </div>
    );
  }

  const isReadOnly = report?.status === 'Submitted';

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-default">
         <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedSchoolId(null)}
              className="w-9 h-9 rounded bg-white border border-border-default text-text-secondary flex items-center justify-center hover:bg-gray-50 hover:text-primary-default transition-all shadow-sm group"
            >
              <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="space-y-0.5">
               <div className="flex items-center space-x-3">
                  <h1 className="text-[20px] font-bold text-text-primary tracking-tight leading-none">{selectedSchool?.name}</h1>
                  <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-bold tracking-wider leading-none">EMIS: {selectedSchool?.emisCode}</span>
               </div>
               <p className="text-[12px] font-medium text-text-secondary leading-none mt-1">
                   2024 Academic Year • Term 1 Cycle • <span className={report?.status === 'Submitted' ? 'text-success' : 'text-warning'}>{report?.status} Registry</span>
               </p>
            </div>
         </div>
         
         <div className="flex items-center space-x-4">
             {!isReadOnly && (
                <button 
                  onClick={handleLoadBaseline}
                  className="erp-btn bg-white border-primary-default/20 text-primary-default hover:bg-primary-default/5 h-9 px-4 text-[12px] font-bold uppercase tracking-wider hidden lg:flex"
                >
                    <Plus size={16} />
                    <span>Project Baseline</span>
                </button>
             )}
             <div className="text-right hidden sm:block border-l border-border-default pl-4">
                 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">Sync Protocol Alpha</p>
                 <p className="text-[11px] font-semibold text-text-primary mt-0.5">{report?.lastSaved ? new Date(report.lastSaved).toLocaleTimeString() : 'N/A'}</p>
             </div>
             {isReadOnly ? (
                 <button onClick={handleUnlock} className="erp-btn bg-slate-800 text-white hover:bg-slate-700 h-9 px-4 text-[13px] font-medium">
                     <Unlock size={16} />
                     <span>Reactivate Records</span>
                 </button>
             ) : (
                 <div className="flex items-center space-x-4">
                     {showSaveMessage && (
                        <span className="text-[11px] font-bold text-success uppercase tracking-widest animate-pulse">
                            Auto-sync Active
                        </span>
                     )}
                     <button onClick={handleSubmit} className="erp-btn erp-btn-primary h-9 px-6 text-[13px] font-medium shadow-sm">
                        <CheckCircle2 size={16} />
                        <span>Commit Submission</span>
                     </button>
                 </div>
             )}
         </div>
      </div>

      <div className="space-y-6">
        {/* Validation Dashboard */}
        {validationResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border flex items-start space-x-4 bg-white shadow-sm ${validationResults.some(r => r.type === 'error') ? 'border-error/20' : 'border-warning/20'}`}>
              <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${validationResults.some(r => r.type === 'error') ? 'bg-error text-white' : 'bg-warning text-white'}`}>
                {validationResults.some(r => r.type === 'error') ? <AlertCircle size={20} /> : <AlertCircle size={20} className="rotate-180" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-text-primary uppercase tracking-tight">QA Compliance Status</h4>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${validationResults.some(r => r.type === 'error') ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}`}>
                    {validationResults.filter(r => r.type === 'error').length} Errors • {validationResults.filter(r => r.type === 'warning').length} Warnings
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1 font-medium italic">Data validation protocols identified structural discrepancies in the current registry entry.</p>
              </div>
            </div>

            <div className="erp-card bg-gray-50 border border-border-default h-[120px] overflow-y-auto no-scrollbar p-3 space-y-2">
               {validationResults.slice(0, 5).map((res) => (
                 <div key={res.id} className="flex items-start space-x-3 text-[11px] font-medium leading-relaxed">
                   <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${res.type === 'error' ? 'bg-error' : 'bg-warning'}`}></div>
                   <div>
                     <span className="text-text-primary font-bold">[{res.section}]</span> {res.message}
                     {res.suggestion && <p className="text-primary-default mt-0.5 font-bold animate-pulse">💡 Suggestion: {res.suggestion}</p>}
                   </div>
                 </div>
               ))}
               {validationResults.length > 5 && (
                 <p className="text-[10px] text-text-secondary text-right font-bold uppercase tracking-widest">+ {validationResults.length - 5} more issues detected</p>
               )}
            </div>
          </div>
        )}

        {/* Horizontal Sticky Module Navigation */}
        <div className="sticky top-0 z-30 bg-bg-default/80 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 border-b border-border-default/50">
            <div className="flex items-center space-x-1.5 p-1 bg-gray-100/50 rounded-lg border border-border-default overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-[12px] font-semibold transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                                ? 'bg-white text-primary-default shadow-sm border border-border-default/50' 
                                : 'text-text-secondary hover:text-text-primary hover:bg-gray-200/50'
                        }`}
                    >
                        <tab.icon size={14} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Main Content Area */}
        <div className="erp-card relative min-h-[500px] bg-white shadow-sm border border-border-default">
            {isReadOnly && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                    <div className="bg-slate-900 text-white px-8 py-4 rounded-lg flex items-center space-x-3 shadow-xl border border-white/10">
                        <Lock size={20} className="text-warning" />
                        <div>
                            <p className="text-[13px] font-bold tracking-tight leading-none uppercase tracking-wide">Record Canonicalized</p>
                            <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1.5 font-semibold">Locked for quality assurance protocols</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="p-8">
                <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 bg-slate-50 border border-border-default rounded flex items-center justify-center text-primary-default shadow-inner">
                        {React.createElement(TABS.find(t => t.id === activeTab)?.icon || Users, { size: 24 })}
                    </div>
                    <div>
                        <h2 className="text-[20px] font-bold text-text-primary tracking-tight leading-none">{TABS.find(t => t.id === activeTab)?.label}</h2>
                        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest opacity-60 mt-2">Institutional sync context v2.4</p>
                    </div>
                </div>
                
                {report ? (
                    <TabContent activeTab={activeTab} report={report} setReport={setReport} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-12 h-12 border-2 border-primary-default border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest opacity-60">Synchronizing industrial records...</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};



const TabContent: React.FC<{ activeTab: string, report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }> = ({ activeTab, report, setReport }) => {
    const totalEnrolment = Object.values(report.enrolment || {}).reduce<number>((acc, curr) => {
        const item = curr as { m: number, f: number };
        return acc + (Number(item.m) || 0) + (Number(item.f) || 0);
    }, 0);
    const totalTeachers = report.teachers?.summary?.length || 0;
    const totalLatrines = (report.infrastructure?.toiletsBoys || 0) + (report.infrastructure?.toiletsGirls || 0);

    const ptr = totalTeachers > 0 ? Math.round(totalEnrolment / totalTeachers) : 0;
    const pcr = (report.infrastructure?.classroomsPermanent || 0) > 0 ? Math.round(totalEnrolment / report.infrastructure!.classroomsPermanent) : 0;
    const plr = totalLatrines > 0 ? Math.round(totalEnrolment / totalLatrines) : 0;

    return (
        <div className="space-y-6">
            {/* Real-time KPI Tracker */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-gray-50 border border-border-default rounded flex items-center space-x-3">
                    <Users size={16} className="text-primary-default" />
                    <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Enrolment</p>
                        <p className="text-[14px] font-bold text-text-primary leading-tight">{totalEnrolment.toLocaleString()}</p>
                    </div>
                </div>
                <div className="p-3 bg-gray-50 border border-border-default rounded flex items-center space-x-3">
                    <GraduationCap size={16} className="text-primary-default" />
                    <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">PTR</p>
                        <p className={`text-[14px] font-bold leading-tight ${ptr > 50 ? 'text-error' : 'text-success'}`}>{ptr}:1</p>
                    </div>
                </div>
                <div className="p-3 bg-gray-50 border border-border-default rounded flex items-center space-x-3">
                    <Building2 size={16} className="text-primary-default" />
                    <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">PCR</p>
                        <p className={`text-[14px] font-bold leading-tight ${pcr > 60 ? 'text-error' : 'text-success'}`}>{pcr}:1</p>
                    </div>
                </div>
                <div className="p-3 bg-gray-50 border border-border-default rounded flex items-center space-x-3">
                    <Accessibility size={16} className="text-primary-default" />
                    <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Latrine Ratio</p>
                        <p className={`text-[14px] font-bold leading-tight ${plr > 45 ? 'text-error' : 'text-success'}`}>{plr}:1</p>
                    </div>
                </div>
            </div>

            {(() => {
                switch (activeTab) {
                    case 'enrolment':
                        return <EnrolmentSection report={report} setReport={setReport} />;
                    case 'attendance':
                        return <AttendanceSection report={report} setReport={setReport} />;
                    case 'teachers':
                        return <TeachersSection report={report} setReport={setReport} />;
                    case 'infrastructure':
                        return <InfrastructureSection report={report} setReport={setReport} />;
                    case 'textbooks':
                        return <TextbooksSection report={report} setReport={setReport} />;
                    case 'exams':
                        return <ExamsSection report={report} setReport={setReport} />;
                    case 'health':
                        return <HealthSection report={report} setReport={setReport} />;
                    case 'finance':
                        return <FinanceSection report={report} setReport={setReport} />;
                    case 'specialNeeds':
                        return <SpecialNeedsSection report={report} setReport={setReport} />;
                    default:
                        return (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                                    <AlertCircle size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-slate-800">Section Under Integration</h4>
                                    <p className="text-sm text-slate-400">MoES technical standard v2.1 requires finalized schemas for this module.</p>
                                </div>
                            </div>
                        )
                }
            })()}
        </div>
    );
}

const AttendanceSection = ({ report, setReport }: { report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }) => {
  const grades = useMemo(() => ['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7', 'Standard 8'], []);
    
    // Initialize if empty
    useEffect(() => {
        const needsLearner = !report.attendance?.weeklyTotals || report.attendance.weeklyTotals.length === 0;
        const needsTeacher = !report.attendance?.teacherAttendance || report.attendance.teacherAttendance.length === 0;
        
        if (needsLearner || needsTeacher) {
            setReport({
                ...report,
                attendance: { 
                    weeklyTotals: needsLearner ? grades.map(g => ({ grade: g, m: 0, f: 0 })) : (report.attendance?.weeklyTotals || []),
                    teacherAttendance: needsTeacher ? [{ m: 0, f: 0, present: 0, total: 0 }] : (report.attendance?.teacherAttendance || [])
                }
            });
        }
    }, [report, setReport, grades]); 

    const updateGrade = (idx: number, field: 'm' | 'f', value: number) => {
        const next = [...(report.attendance?.weeklyTotals || [])];
        next[idx] = { ...next[idx], [field]: value };
        setReport({ ...report, attendance: { ...report.attendance!, weeklyTotals: next } });
    };

    const updateTeacher = (field: 'm' | 'f' | 'present' | 'total', value: number) => {
        const next = [...(report.attendance?.teacherAttendance || [{ m: 0, f: 0, present: 0, total: 0 }])];
        next[0] = { ...next[0], [field]: value };
        setReport({ ...report, attendance: { ...report.attendance!, teacherAttendance: next } });
    };

    const syncWithEnrolment = () => {
        if (!report.enrolment) return;
        const enrolmentGrades = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'grade8'];
        const gradesMapping = ['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7', 'Standard 8'];
        
        const attendanceSync = gradesMapping.map((label, idx) => {
            const eKey = enrolmentGrades[idx] as keyof NonNullable<TermlyReport['enrolment']>;
            const eData = report.enrolment?.[eKey] as { m: number; f: number } | undefined;
            return {
                grade: label,
                m: eData?.m || 0,
                f: eData?.f || 0
            };
        });

        setReport({
            ...report,
            attendance: {
                ...report.attendance!,
                weeklyTotals: attendanceSync
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between p-3 bg-primary-default/[0.02] border border-primary-default/10 rounded">
                <p className="text-[13px] font-medium text-text-secondary leading-relaxed max-w-2xl">Capture average weekly attendance totals. Data is synchronized with digital attendance registers for verified auditing.</p>
                <button 
                  onClick={syncWithEnrolment}
                  className="erp-btn bg-white border border-border-default text-text-primary h-8 px-3 text-[11px] font-bold uppercase hover:bg-gray-50 shrink-0"
                >
                    <Clock size={14} />
                    <span>Sync 100% Attendance</span>
                </button>
            </div>
            
            {/* Learner Attendance Section */}
            <div className="space-y-4">
                <h3 className="text-[14px] font-bold text-text-primary px-3 border-l-4 border-primary-default uppercase tracking-tight">Learner Attendance Matrix</h3>
                <div className="overflow-hidden border border-border-default rounded">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-border-default">
                                <th className="erp-table-header px-6 py-3">Academic Level</th>
                                <th className="erp-table-header px-6 py-3 text-center">Male Attendance</th>
                                <th className="erp-table-header px-6 py-3 text-center">Female Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 italic-none">
                            {(report.attendance?.weeklyTotals || []).map((row, idx) => (
                                <tr key={idx} className="erp-table-row hover:bg-gray-50/50">
                                    <td className="erp-table-cell px-6 py-3 font-semibold text-text-primary">{row.grade}</td>
                                    <td className="erp-table-cell px-6 py-3 text-center">
                                        <input type="number" value={row.m} onChange={e => updateGrade(idx, 'm', Number(e.target.value))} className="w-20 erp-input text-center h-9" />
                                    </td>
                                    <td className="erp-table-cell px-6 py-3 text-center">
                                        <input type="number" value={row.f} onChange={e => updateGrade(idx, 'f', Number(e.target.value))} className="w-20 erp-input text-center h-9" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Teacher Attendance Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-[14px] font-bold text-text-primary px-3 border-l-4 border-slate-900 uppercase tracking-tight">Teacher Attendance Registry</h3>
                <div className="p-6 bg-slate-50 border border-border-default rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Male (Present)</label>
                            <input 
                                type="number" 
                                value={report.attendance?.teacherAttendance?.[0]?.m || 0} 
                                onChange={e => updateTeacher('m', Number(e.target.value))}
                                className="w-full erp-input h-10 text-center font-bold" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Female (Present)</label>
                            <input 
                                type="number" 
                                value={report.attendance?.teacherAttendance?.[0]?.f || 0} 
                                onChange={e => updateTeacher('f', Number(e.target.value))}
                                className="w-full erp-input h-10 text-center font-bold" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Total Present</label>
                            <div className="w-full erp-input h-10 bg-white/50 flex items-center justify-center font-bold text-primary-default">
                                {(report.attendance?.teacherAttendance?.[0]?.m || 0) + (report.attendance?.teacherAttendance?.[0]?.f || 0)}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Establishment Total</label>
                            <input 
                                type="number" 
                                value={report.attendance?.teacherAttendance?.[0]?.total || 0} 
                                onChange={e => updateTeacher('total', Number(e.target.value))}
                                className="w-full erp-input h-10 text-center font-bold" 
                            />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-[12px] text-text-secondary font-medium italic">Note: Verification against biometric logs or manual registers is mandatory.</p>
                        <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-text-secondary uppercase">Attendance Rate:</span>
                            <span className={`text-[13px] font-bold ${((((report.attendance?.teacherAttendance?.[0]?.m || 0) + (report.attendance?.teacherAttendance?.[0]?.f || 0)) / (report.attendance?.teacherAttendance?.[0]?.total || 1)) * 100) < 75 ? 'text-error' : 'text-success'}`}>
                                {report.attendance?.teacherAttendance?.[0]?.total ? Math.round((((report.attendance?.teacherAttendance?.[0]?.m || 0) + (report.attendance?.teacherAttendance?.[0]?.f || 0)) / report.attendance?.teacherAttendance?.[0]?.total) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeachersSection = ({ report, setReport }: { report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }) => {
    const addTeacher = () => {
        const summary = report.teachers?.summary || [];
        setReport({
            ...report,
            teachers: { summary: [...summary, { name: '', qualification: 'T2', subject: '', employmentType: 'Permanent', gender: 'M' }] }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-[16px] font-bold text-text-primary leading-tight">Faculty Registry Summary</h3>
                   <p className="text-[13px] text-text-secondary mt-1">Capture current active teaching staff at this institution.</p>
                </div>
                <button onClick={addTeacher} className="erp-btn erp-btn-primary h-9 px-4 text-[13px]">
                    <Plus size={16} />
                    <span>Add Faculty Member</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {(report.teachers?.summary || []).length === 0 ? (
                    <div className="p-10 border-2 border-dashed border-border-default rounded text-center text-text-secondary">
                        <p className="text-[14px]">No faculty records found for this term</p>
                    </div>
                ) : (
                    (report.teachers?.summary || []).map((t, idx) => (
                        <div key={idx} className="flex flex-wrap items-end gap-4 bg-gray-50/50 p-4 rounded border border-border-default group hover:border-primary-default transition-all">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Full Name</label>
                                <input type="text" value={t.name} onChange={e => {
                                    const next = [...(report.teachers?.summary || [])];
                                    next[idx].name = e.target.value;
                                    setReport({...report, teachers: { summary: next }});
                                }} className="w-full erp-input h-9" />
                            </div>
                            <div className="w-28">
                               <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Gender</label>
                               <select value={t.gender} onChange={e => {
                                    const next = [...(report.teachers?.summary || [])];
                                    next[idx].gender = e.target.value as 'M' | 'F';
                                    setReport({...report, teachers: { summary: next }});
                               }} className="w-full erp-input h-9 outline-none cursor-pointer">
                                   <option value="M">Male</option>
                                   <option value="F">Female</option>
                               </select>
                            </div>
                            <div className="w-40">
                               <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Qualification</label>
                               <input type="text" value={t.qualification} onChange={e => {
                                    const next = [...(report.teachers?.summary || [])];
                                    next[idx].qualification = e.target.value;
                                    setReport({...report, teachers: { summary: next }});
                               }} className="w-full erp-input h-9" />
                            </div>
                            <button 
                                onClick={() => {
                                    const next = (report.teachers?.summary || []).filter((_, i) => i !== idx);
                                    setReport({...report, teachers: { summary: next }});
                                }}
                                className="w-9 h-9 rounded flex items-center justify-center text-text-secondary hover:bg-error/10 hover:text-error transition-all"
                            >
                                <AlertCircle size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const TextbooksSection = ({ report, setReport }: { report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }) => {
    const addItem = () => {
        const items = report.textbooks?.items || [];
        setReport({
            ...report,
            textbooks: { items: [...items, { subject: '', grade: 'Std 1', available: 0, needed: 0 }] }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-[16px] font-bold text-text-primary px-3 border-l-4 border-primary-default">Textbook Inventory Matrix</h3>
                </div>
                <button onClick={addItem} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px] font-medium">
                    <Plus size={14} />
                    <span>Register Subject Line</span>
                </button>
            </div>

            <div className="overflow-hidden border border-border-default rounded">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-border-default">
                            <th className="erp-table-header px-4 py-3">Subject / Domain</th>
                            <th className="erp-table-header px-4 py-3 text-center">Grade Level</th>
                            <th className="erp-table-header px-4 py-3 text-center">Available Units</th>
                            <th className="erp-table-header px-4 py-3 text-center">Deficit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(report.textbooks?.items || []).map((item, idx) => (
                            <tr key={idx} className="erp-table-row hover:bg-gray-50/50">
                                <td className="erp-table-cell px-4 py-3">
                                    <input type="text" placeholder="e.g. Mathematics" value={item.subject} onChange={e => {
                                        const next = [...(report.textbooks?.items || [])];
                                        next[idx].subject = e.target.value;
                                        setReport({...report, textbooks: { items: next }});
                                    }} className="erp-input h-9 w-full text-[13px]" />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input type="text" value={item.grade} onChange={e => {
                                        const next = [...(report.textbooks?.items || [])];
                                        next[idx].grade = e.target.value;
                                        setReport({...report, textbooks: { items: next }});
                                    }} className="erp-input h-9 w-24 text-center text-[13px]" />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input type="number" value={item.available} onChange={e => {
                                        const next = [...(report.textbooks?.items || [])];
                                        next[idx].available = Number(e.target.value);
                                        setReport({...report, textbooks: { items: next }});
                                    }} className="erp-input h-9 w-20 text-center text-[13px]" />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input type="number" value={item.needed} onChange={e => {
                                        const next = [...(report.textbooks?.items || [])];
                                        next[idx].needed = Number(e.target.value);
                                        setReport({...report, textbooks: { items: next }});
                                    }} className="erp-input h-9 w-20 text-center text-[13px]" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ExamsSection = ({ report, setReport }: { report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }) => {
    const addItem = () => {
        const items = report.exams?.results || [];
        setReport({
            ...report,
            exams: { results: [...items, { grade: 'Std 8', subject: '', mPass: 0, mFail: 0, fPass: 0, fFail: 0 }] }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-text-primary px-3 border-l-4 border-primary-default">Quarterly Assessments Registry</h3>
                <button onClick={addItem} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px] font-medium">
                    <Plus size={14} />
                    <span>Log Results</span>
                </button>
            </div>

            <div className="overflow-hidden border border-border-default rounded">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-border-default">
                            <th className="erp-table-header px-4 py-3">Level & Subject</th>
                            <th className="erp-table-header px-4 py-3 text-center">M (Pass)</th>
                            <th className="erp-table-header px-4 py-3 text-center">M (Fail)</th>
                            <th className="erp-table-header px-4 py-3 text-center bg-primary-default/[0.02]">F (Pass)</th>
                            <th className="erp-table-header px-4 py-3 text-center bg-primary-default/[0.02]">F (Fail)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[13px]">
                        {(report.exams?.results || []).map((res, idx) => (
                            <tr key={idx} className="erp-table-row hover:bg-gray-50/50">
                                <td className="erp-table-cell px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                        <input type="text" placeholder="Grade" value={res.grade} onChange={e => {
                                            const next = [...(report.exams?.results || [])];
                                            next[idx].grade = e.target.value;
                                            setReport({...report, exams: { results: next }});
                                        }} className="w-16 erp-input h-9 font-bold" />
                                        <input type="text" placeholder="Subject Name" value={res.subject} onChange={e => {
                                            const next = [...(report.exams?.results || [])];
                                            next[idx].subject = e.target.value;
                                            setReport({...report, exams: { results: next }});
                                        }} className="flex-1 erp-input h-9" />
                                    </div>
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input type="number" value={res.mPass} onChange={e => {
                                        const next = [...(report.exams?.results || [])];
                                        next[idx].mPass = Number(e.target.value);
                                        setReport({...report, exams: { results: next }});
                                    }} className="w-14 erp-input h-9 text-center" />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input type="number" value={res.mFail} onChange={e => {
                                        const next = [...(report.exams?.results || [])];
                                        next[idx].mFail = Number(e.target.value);
                                        setReport({...report, exams: { results: next }});
                                    }} className="w-14 erp-input h-9 text-center text-error" />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center bg-primary-default/[0.01]">
                                    <input type="number" value={res.fPass} onChange={e => {
                                        const next = [...(report.exams?.results || [])];
                                        next[idx].fPass = Number(e.target.value);
                                        setReport({...report, exams: { results: next }});
                                    }} className="w-14 erp-input h-9 text-center" />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center bg-primary-default/[0.01]">
                                    <input type="number" value={res.fFail} onChange={e => {
                                        const next = [...(report.exams?.results || [])];
                                        next[idx].fFail = Number(e.target.value);
                                        setReport({...report, exams: { results: next }});
                                    }} className="w-14 erp-input h-9 text-center text-error" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SpecialNeedsSection = ({ report, setReport }: { report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }) => {
    const addItem = () => {
        const learners = report.specialNeeds?.learners || [];
        setReport({
            ...report,
            specialNeeds: { learners: [...learners, { type: 'Physical', m: 0, f: 0 }] }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-text-primary px-3 border-l-4 border-primary-default">SNE (Special Needs Education) Matrix</h3>
                <button onClick={addItem} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px] font-medium">
                    <Plus size={14} />
                    <span>Register SNE Category</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {(report.specialNeeds?.learners || []).length === 0 ? (
                    <div className="p-10 border-2 border-dashed border-border-default rounded text-center text-text-secondary">
                        <p className="text-[14px]">Zero SNE learners reported currently</p>
                    </div>
                ) : (
                    (report.specialNeeds?.learners || []).map((sne, idx) => (
                        <div key={idx} className="flex items-end space-x-4 bg-gray-50/50 p-4 rounded border border-border-default hover:border-primary-default transition-all">
                            <div className="flex-1">
                                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Disability Classification</label>
                                <input type="text" placeholder="e.g. Visual impairment" value={sne.type} onChange={e => {
                                    const next = [...(report.specialNeeds?.learners || [])];
                                    next[idx].type = e.target.value;
                                    setReport({...report, specialNeeds: { learners: next }});
                                }} className="w-full erp-input h-9 text-[13px]" />
                            </div>
                            <div className="w-28 text-center">
                               <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Male (N)</label>
                               <input type="number" value={sne.m} onChange={e => {
                                    const next = [...(report.specialNeeds?.learners || [])];
                                    next[idx].m = Number(e.target.value);
                                    setReport({...report, specialNeeds: { learners: next }});
                               }} className="w-full erp-input h-9 text-center text-[13px]" />
                            </div>
                            <div className="w-28 text-center">
                               <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Female (N)</label>
                               <input type="number" value={sne.f} onChange={e => {
                                    const next = [...(report.specialNeeds?.learners || [])];
                                    next[idx].f = Number(e.target.value);
                                    setReport({...report, specialNeeds: { learners: next }});
                               }} className="w-full erp-input h-9 text-center text-[13px]" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const EnrolmentSection = ({ report, setReport }: { report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }) => {
    const grades = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'grade8'];
    
    const updateGrade = (grade: string, field: string, value: number) => {
        setReport({
            ...report,
            enrolment: {
                ...report.enrolment,
                [grade]: { ...report.enrolment?.[grade as keyof typeof report.enrolment], [field]: value }
            }
        });
    };

    const totalEnrolment = Object.values(report.enrolment || {}).reduce((acc, curr) => acc + (curr.m || 0) + (curr.f || 0), 0);
    const totalMale = Object.values(report.enrolment || {}).reduce((acc, curr) => acc + (curr.m || 0), 0);
    const totalFemale = Object.values(report.enrolment || {}).reduce((acc, curr) => acc + (curr.f || 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 bg-primary-default/[0.02] p-4 rounded border border-primary-default/10">
                    <div className="w-8 h-8 bg-primary-default text-white rounded flex items-center justify-center shadow-sm">
                        <ShieldCheck size={16} />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-text-primary leading-none mb-1">Standardized Population</p>
                        <p className="text-[11px] text-text-secondary font-medium">Auto-calculated Enrolment</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded border border-border-default flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Male Aggregate</p>
                        <p className="text-[18px] font-bold text-slate-800 leading-none">{totalMale.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Female Aggregate</p>
                        <p className="text-[18px] font-bold text-slate-800 leading-none">{totalFemale.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-slate-900 text-white p-4 rounded border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Grand Total</p>
                        <p className="text-[18px] font-bold leading-none">{totalEnrolment.toLocaleString()}</p>
                    </div>
                    <CheckCircle2 size={20} className="text-success" />
                </div>
            </div>

            <div className="overflow-hidden border border-border-default rounded">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-border-default">
                            <th className="erp-table-header px-4 py-3">Registry Standard</th>
                            <th className="erp-table-header px-4 py-3 text-center">Male (N)</th>
                            <th className="erp-table-header px-4 py-3 text-center">Female (N)</th>
                            <th className="erp-table-header px-4 py-3 text-center">Overage (M)</th>
                            <th className="erp-table-header px-4 py-3 text-center">Overage (F)</th>
                            <th className="erp-table-header px-4 py-3 text-center">Underage (M)</th>
                            <th className="erp-table-header px-4 py-3 text-center">Underage (F)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[13px]">
                        {grades.map(grade => (
                            <tr key={grade} className="erp-table-row hover:bg-gray-50/50">
                                <td className="erp-table-cell px-4 py-3 font-semibold text-text-primary uppercase tracking-tight">{grade.replace('grade', 'Std ')}</td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input 
                                        type="number" 
                                        value={report.enrolment?.[grade as keyof typeof report.enrolment]?.m || 0}
                                        onChange={(e) => updateGrade(grade, 'm', Number(e.target.value))}
                                        className="w-14 erp-input text-center h-9"
                                    />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input 
                                        type="number" 
                                        value={report.enrolment?.[grade as keyof typeof report.enrolment]?.f || 0}
                                        onChange={(e) => updateGrade(grade, 'f', Number(e.target.value))}
                                        className="w-14 erp-input text-center h-9"
                                    />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input 
                                        type="number" 
                                        value={report.enrolment?.[grade as keyof typeof report.enrolment]?.overageM || 0}
                                        onChange={(e) => updateGrade(grade, 'overageM', Number(e.target.value))}
                                        className="w-14 erp-input text-center h-9"
                                    />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input 
                                        type="number" 
                                        value={report.enrolment?.[grade as keyof typeof report.enrolment]?.overageF || 0}
                                        onChange={(e) => updateGrade(grade, 'overageF', Number(e.target.value))}
                                        className="w-14 erp-input text-center h-9"
                                    />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input 
                                        type="number" 
                                        value={report.enrolment?.[grade as keyof typeof report.enrolment]?.underageM || 0}
                                        onChange={(e) => updateGrade(grade, 'underageM', Number(e.target.value))}
                                        className="w-14 erp-input text-center h-9"
                                    />
                                </td>
                                <td className="erp-table-cell px-4 py-3 text-center">
                                    <input 
                                        type="number" 
                                        value={report.enrolment?.[grade as keyof typeof report.enrolment]?.underageF || 0}
                                        onChange={(e) => updateGrade(grade, 'underageF', Number(e.target.value))}
                                        className="w-14 erp-input text-center h-9"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const InfrastructureSection = ({ report, setReport }: { report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div className="space-y-6">
                <h3 className="text-[15px] font-bold text-text-primary px-3 border-l-4 border-primary-default">Learning Environments</h3>
                <div className="space-y-4">
                    <InputField 
                        label="Permanent Classrooms" 
                        value={report.infrastructure?.classroomsPermanent || 0} 
                        onChange={(v) => setReport({...report, infrastructure: {...report.infrastructure!, classroomsPermanent: Number(v)}})} 
                    />
                    <InputField 
                        label="Temporary Structures" 
                        value={report.infrastructure?.classroomsTemporary || 0} 
                        onChange={(v) => setReport({...report, infrastructure: {...report.infrastructure!, classroomsTemporary: Number(v)}})} 
                    />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-[15px] font-bold text-text-primary px-3 border-l-4 border-primary-default">WASH Infrastructure</h3>
                <div className="space-y-4">
                    <InputField 
                        label="Toilets (Boys)" 
                        value={report.infrastructure?.toiletsBoys || 0} 
                        onChange={(v) => setReport({...report, infrastructure: {...report.infrastructure!, toiletsBoys: Number(v)}})} 
                    />
                    <InputField 
                        label="Toilets (Girls)" 
                        value={report.infrastructure?.toiletsGirls || 0} 
                        onChange={(v) => setReport({...report, infrastructure: {...report.infrastructure!, toiletsGirls: Number(v)}})} 
                    />
                    <InputField 
                        label="Staff Sanitary Units" 
                        value={report.infrastructure?.toiletsStaff || 0} 
                        onChange={(v) => setReport({...report, infrastructure: {...report.infrastructure!, toiletsStaff: Number(v)}})} 
                    />
                </div>
            </div>

            <div className="md:col-span-2 p-6 bg-gray-50/50 rounded border border-border-default flex flex-col md:flex-row md:items-center justify-between gap-6 mt-2">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white rounded border border-border-default flex items-center justify-center text-text-secondary shadow-sm">
                        <HeartPulse size={20} />
                    </div>
                    <div>
                        <h5 className="text-[14px] font-bold text-text-primary leading-none mb-1">Utility Connectivity</h5>
                        <p className="text-[11px] text-text-secondary font-medium">Verify active utility grid status</p>
                    </div>
                </div>
                <div className="flex items-center space-x-8">
                   <div className="flex items-center space-x-3">
                      <label className="text-[13px] font-medium text-text-primary">Electricity available</label>
                      <button 
                        onClick={() => setReport({...report, infrastructure: {...report.infrastructure!, electricity: !report.infrastructure?.electricity}})}
                        className={`w-10 h-5 rounded-full transition-all relative ${report.infrastructure?.electricity ? 'bg-success' : 'bg-gray-300'}`}
                      >
                         <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${report.infrastructure?.electricity ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                   </div>
                   <div className="w-px h-6 bg-border-default"></div>
                   <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-tight mb-1">Water Source</label>
                      <select 
                        value={report.infrastructure?.waterSource} 
                        onChange={(e) => setReport({...report, infrastructure: {...report.infrastructure!, waterSource: e.target.value}})}
                        className="erp-input h-9 px-3 min-w-[140px] text-[13px]"
                      >
                        <option value="Piped">Piped system</option>
                        <option value="Borehole">Standard borehole</option>
                        <option value="Tanker">Mobile tanker</option>
                        <option value="None">None available</option>
                      </select>
                   </div>
                </div>
            </div>
        </div>
    );
};

const HealthSection = ({ report, setReport }: { report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-primary-default/[0.02] border border-primary-default/10 rounded flex flex-col items-center text-center space-y-4">
                <div className={`w-12 h-12 rounded flex items-center justify-center transition-all ${report.health?.feedingProgramme ? 'bg-primary-default text-white shadow-sm' : 'bg-white text-text-secondary border border-border-default shadow-inner'}`}>
                    <HeartPulse size={24} />
                </div>
                <div className="space-y-1">
                    <h5 className="text-[16px] font-bold text-text-primary tracking-tight leading-tight">Nutritional Feeding Programme</h5>
                    <p className="text-[12px] text-text-secondary leading-normal max-w-[280px]">Active nutritional support protocols for during the current cycle.</p>
                </div>
                <button 
                    onClick={() => setReport({...report, health: {...report.health!, feedingProgramme: !report.health?.feedingProgramme}})}
                    className={`px-6 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${report.health?.feedingProgramme ? 'bg-primary-default text-white shadow-sm' : 'bg-white text-text-secondary border border-border-default hover:bg-gray-50'}`}
                >
                    {report.health?.feedingProgramme ? 'Active Registry' : 'Mark Inactive'}
                </button>
            </div>

            <div className="space-y-6 py-2">
                <FormField label="Standard Beneficiary Count">
                    <input 
                        type="number" 
                        value={report.health?.beneficiaries || 0} 
                        onChange={(e) => setReport({...report, health: {...report.health!, beneficiaries: Number(e.target.value)}})}
                        className="erp-input h-10 w-full"
                    />
                </FormField>
                <FormField label="WASH Compliance Rating">
                    <select 
                        value={report.health?.washStatus} 
                        onChange={(e) => setReport({...report, health: {...report.health!, washStatus: e.target.value}})}
                        className="erp-input h-10 w-full outline-none cursor-pointer"
                    >
                        <option value="Adequate">Standard (Adequate)</option>
                        <option value="Critical">Critical (Immediate Intervention)</option>
                        <option value="Insufficient">Sub-standard (Insufficient)</option>
                    </select>
                </FormField>
            </div>
        </div>
    </div>
);

const FinanceSection = ({ report, setReport }: { report: Partial<TermlyReport>, setReport: (d: Partial<TermlyReport>) => void }) => {
    const addExpense = () => {
        const categories = report.finance?.expenditureCategories || [];
        setReport({
            ...report,
            finance: { ...report.finance!, expenditureCategories: [...categories, { category: '', amount: 0 }] }
        });
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-primary-default/[0.03] border border-primary-default/10 rounded space-y-4">
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-default text-white rounded flex items-center justify-center shadow-sm">
                            <BadgeDollarSign size={20} />
                        </div>
                        <h5 className="text-[11px] font-bold text-primary-default uppercase tracking-widest">Inflow Matrix (MWK)</h5>
                     </div>
                     <input 
                        type="number" 
                        placeholder="Expected disbursements..."
                        value={report.finance?.grantsReceived || 0}
                        onChange={(e) => setReport({...report, finance: {...report.finance!, grantsReceived: Number(e.target.value)}})}
                        className="w-full text-2xl font-bold bg-transparent border-none outline-none text-text-primary placeholder:text-gray-300"
                     />
                </div>
                <div className="p-6 bg-slate-900 rounded space-y-4 shadow-md">
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/10 text-white rounded flex items-center justify-center">
                            <Save size={20} />
                        </div>
                        <h5 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Outflow Matrix (MWK)</h5>
                     </div>
                     <p className="text-2xl font-bold text-white tracking-tight">
                        { (report.finance?.expenditureCategories || []).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString() }
                     </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="text-[12px] font-bold text-text-secondary uppercase tracking-widest leading-none">Expenditure Granularity</h4>
                    <button onClick={addExpense} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px] font-medium">
                        <Plus size={14} />
                        <span>Allocate Line Item</span>
                    </button>
                </div>
                
                <div className="space-y-3">
                    {(report.finance?.expenditureCategories || []).map((exp, idx) => (
                        <div key={idx} className="flex items-center space-x-4">
                            <input 
                                type="text" 
                                placeholder="Allocation target..."
                                value={exp.category}
                                onChange={(e) => {
                                    const next = [...(report.finance?.expenditureCategories || [])];
                                    next[idx].category = e.target.value;
                                    setReport({...report, finance: {...report.finance!, expenditureCategories: next}});
                                }}
                                className="flex-1 erp-input h-10 text-[13px]"
                            />
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-[11px]">MWK</span>
                                <input 
                                    type="number" 
                                    value={exp.amount}
                                    onChange={(e) => {
                                        const next = [...(report.finance?.expenditureCategories || [])];
                                        next[idx].amount = Number(e.target.value);
                                        setReport({...report, finance: {...report.finance!, expenditureCategories: next}});
                                    }}
                                    className="w-40 erp-input h-10 pl-14 font-mono font-bold text-[13px]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const InputField = ({ label, value, onChange }: { label: string, value: number | string, onChange: (v: string) => void }) => (
    <div className="space-y-1.5">
        <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider ml-1">{label}</label>
        <input 
            type="number" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="erp-input h-9 w-full text-[13px]"
        />
    </div>
);

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider ml-1">{label}</label>
        {children}
    </div>
);

export default DataUpload;
