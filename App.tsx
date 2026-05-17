import React, { useState, useEffect, lazy, Suspense, createContext, useContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { 
  LayoutDashboard, CloudUpload, School, Users, UserRoundCheck,
  Building2, BookOpen, BadgeDollarSign, GraduationCap, CalendarCheck,
  HeartPulse, Accessibility, FileChartColumnIncreasing, Settings, Bell, Menu,
  FileText, LogOut, ChevronRight, Sparkles, Globe, Calendar, Clock,
  HardDrive, Briefcase
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { AppSettings, AcademicYear, AcademicTerm, AcademicWeek, MonthlyPeriod } from './types';
import ErrorBoundary from './components/ErrorBoundary';
import BackupManager from './components/BackupManager';
import LandingPage from './components/LandingPage';
import SetupWizard from './components/SetupWizard';
import { getCurrentPeriod, getAcademicYears, getTermsForYear, getWeeksForTerm, getMonthsForTerm, getSettings, CurrentPeriod } from './services/academicService';
import { runArchiveCycle } from './services/archiveService';

const Dashboard = lazy(() => import('./components/Dashboard'));
const LearnerRegistry = lazy(() => import('./components/LearnerRegistry'));
const Assistant = lazy(() => import('./components/Assistant'));
const DataUpload = lazy(() => import('./components/DataUpload'));
const TeacherRegistry = lazy(() => import('./components/TeacherRegistry'));
const SchoolProfile = lazy(() => import('./components/SchoolProfile'));
const ZonalModule = lazy(() => import('./components/ZonalModule'));
const RecordsRegistry = lazy(() => import('./components/RecordsRegistry'));
const DepartmentManager = lazy(() => import('./components/DepartmentManager'));

// === Global Contexts ===
interface GlobalContextType {
  settings: AppSettings | null;
  currentPeriod: CurrentPeriod | null;
  academicYears: AcademicYear[];
  selectedYearId: number | null;
  selectedTermId: number | null;
  selectedWeekId: number | null;
  selectedMonth: string | null;
  selectedSchoolId: number | null;
  setSelectedYearId: (id: number) => void;
  setSelectedTermId: (id: number) => void;
  setSelectedWeekId: (id: number) => void;
  setSelectedMonth: (m: string) => void;
  setSelectedSchoolId: (id: number | null) => void;
  refreshPeriod: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType>(null!);
export const useGlobal = () => useContext(GlobalContext);

const GlobalAcademicSelector = () => {
  const { currentPeriod, academicYears, selectedYearId, selectedTermId, selectedWeekId, selectedMonth, setSelectedYearId, setSelectedTermId, setSelectedWeekId, setSelectedMonth } = useGlobal();
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [weeks, setWeeks] = useState<AcademicWeek[]>([]);
  const [months, setMonths] = useState<MonthlyPeriod[]>([]);

  useEffect(() => { if (selectedYearId) getTermsForYear(selectedYearId).then(setTerms); }, [selectedYearId]);
  useEffect(() => { if (selectedTermId) { getWeeksForTerm(selectedTermId).then(setWeeks); getMonthsForTerm(selectedTermId).then(setMonths); } }, [selectedTermId]);

  const year = academicYears.find(y => y.id === selectedYearId);
  const currentLabel = currentPeriod ? `${currentPeriod.academicYear.year} | ${currentPeriod.term.name} | ${currentPeriod.month.name} | Week ${currentPeriod.week.weekNumber}` : '';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-primary-default/90 px-3 py-1.5 rounded-md">
        <Calendar size={12} />
        <span className="text-white/70">Now:</span>
        <span>{currentLabel || 'N/A'}</span>
      </div>
      <select value={selectedYearId || ''} onChange={e => setSelectedYearId(Number(e.target.value))} className="erp-input h-7 text-[11px] px-2 min-w-[90px]">
        {academicYears.map(y => <option key={y.id} value={y.id!}>{y.year} ({y.status})</option>)}
      </select>
      <select value={selectedTermId || ''} onChange={e => setSelectedTermId(Number(e.target.value))} className="erp-input h-7 text-[11px] px-2 min-w-[80px]">
        {terms.map(t => <option key={t.id} value={t.id!}>{t.name}</option>)}
      </select>
      <select value={selectedMonth || ''} onChange={e => setSelectedMonth(e.target.value)} className="erp-input h-7 text-[11px] px-2 min-w-[90px]">
        {months.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
      </select>
      <select value={selectedWeekId || ''} onChange={e => setSelectedWeekId(Number(e.target.value))} className="erp-input h-7 text-[11px] px-2 min-w-[80px]">
        {weeks.map(w => <option key={w.id} value={w.id!}>Week {w.weekNumber}</option>)}
      </select>
    </div>
  );
};

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, active: boolean, collapsed: boolean }> = ({ to, icon, label, active, collapsed }) => (
  <Link to={to} className={`flex items-center group space-x-2.5 px-3 py-1.5 rounded transition-all duration-150 ${
    active ? 'bg-primary-default text-white shadow-md shadow-primary-default/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
  }`}>
    <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
      {React.cloneElement(icon as React.ReactElement, { size: 16 })}
    </div>
    {!collapsed && <span className="text-[13px] font-medium">{label}</span>}
  </Link>
);

const SectionHeader: React.FC<{ label: string, collapsed: boolean }> = ({ label, collapsed }) => (
  <div className={`mt-6 mb-1.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${collapsed ? 'text-center' : ''}`}>
    {collapsed ? '—' : label}
  </div>
);

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<CurrentPeriod | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);

  const schools = useLiveQuery(() => db.schools.toArray()) || [];
  const activeSchool = schools.find(s => s.id === selectedSchoolId) || schools[0] || null;

  useEffect(() => {
    if (!selectedSchoolId && schools.length > 0) {
      setSelectedSchoolId(schools[0].id!);
    }
  }, [schools, selectedSchoolId]);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const s = await getSettings();
    setSettings(s);
    if (!s || !s.setupComplete) {
      setShowSetup(true);
      return;
    }
    setShowSetup(false);
    const period = await getCurrentPeriod();
    setCurrentPeriod(period);
    const years = await getAcademicYears();
    setAcademicYears(years);
    if (period) {
      setSelectedYearId(period.academicYear.id);
      setSelectedTermId(period.term.id);
      setSelectedWeekId(period.week.id);
      setSelectedMonth(period.month.name);
    }
    await runArchiveCycle();
  };

  const refreshPeriod = useCallback(async () => {
    const period = await getCurrentPeriod();
    setCurrentPeriod(period);
    setAcademicYears(await getAcademicYears());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshPeriod, 60000);
    return () => clearInterval(interval);
  }, [refreshPeriod]);

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard', '/upload': 'Data Upload', '/learners': 'Learner Registry', '/hr': 'Teacher Registry',
    '/school-profile': 'School Profile', '/assistant': 'AI Assistant', '/infrastructure': 'Infrastructure',
    '/materials': 'Materials', '/finance': 'Finance', '/settings': 'Settings',
    '/publications': 'Publications', '/notices': 'Notices', '/backup': 'Backup & Restore',
    '/zonal/enrolment': 'Zonal Enrolment', '/zonal/infrastructure': 'Zonal Infrastructure',
    '/zonal/exams': 'Zonal Exams', '/zonal/attendance': 'Zonal Attendance',
    '/zonal/materials': 'Zonal Textbooks', '/zonal/health': 'Zonal Health',
    '/zonal/inclusion': 'Zonal Inclusion', '/zonal/finance': 'Zonal Finance',
    '/zonal/reports': 'Zonal Reports',
    '/department': 'Department Management',
  };

  useEffect(() => {
    document.title = `EMIS TDC — ${pageTitles[location.pathname] || 'Module'}`;
  }, [location.pathname]);

  if (!showApp) {
    return <LandingPage onEnter={() => setShowApp(true)} />;
  }

  if (showSetup) {
    return <SetupWizard onComplete={initApp} />;
  }

  const zonalName = settings?.zonalName || 'EMIS TDC';
  const isDashboard = location.pathname === '/';

  const navItems = [
    { to: '/', icon: <LayoutDashboard />, label: 'Dashboard', section: 'Main' },
    { to: '/upload', icon: <CloudUpload />, label: 'Data Upload', section: 'Main' },
    { to: '/department', icon: <Briefcase />, label: 'Department', section: 'Main' },
    { to: '/assistant', icon: <Sparkles />, label: 'Neural AI', section: 'Main' },
    { to: '/school-profile', icon: <School />, label: 'School Profile', section: 'Records' },
    { to: '/learners', icon: <Users />, label: 'Learners', section: 'Records' },
    { to: '/hr', icon: <UserRoundCheck />, label: 'Teachers', section: 'Records' },
    { to: '/zonal/enrolment', icon: <Users />, label: 'Enrolment', section: 'Zonal Aggregates' },
    { to: '/zonal/infrastructure', icon: <Building2 />, label: 'Infrastructure', section: 'Zonal Aggregates' },
    { to: '/zonal/exams', icon: <GraduationCap />, label: 'Exams & Results', section: 'Zonal Aggregates' },
    { to: '/zonal/attendance', icon: <CalendarCheck />, label: 'Attendance', section: 'Zonal Aggregates' },
    { to: '/zonal/materials', icon: <BookOpen />, label: 'Textbooks', section: 'Zonal Aggregates' },
    { to: '/zonal/health', icon: <HeartPulse />, label: 'Health & Nutrition', section: 'Zonal Aggregates' },
    { to: '/zonal/inclusion', icon: <Accessibility />, label: 'Special Needs', section: 'Zonal Aggregates' },
    { to: '/zonal/finance', icon: <BadgeDollarSign />, label: 'Zonal Finance', section: 'Zonal Aggregates' },
    { to: '/zonal/reports', icon: <FileChartColumnIncreasing />, label: 'Reports', section: 'Zonal Aggregates' },
    { to: '/settings', icon: <Settings />, label: 'Settings', section: 'Zonal Aggregates' },
    { to: '/publications', icon: <FileText />, label: 'Publications', section: 'Utilities' },
    { to: '/notices', icon: <Bell />, label: 'Notices', section: 'Utilities' },
    { to: '/backup', icon: <HardDrive />, label: 'Backup', section: 'Utilities' },
  ];

  return (
    <GlobalContext.Provider value={{
      settings, currentPeriod, academicYears,
      selectedYearId, selectedTermId, selectedWeekId, selectedMonth, selectedSchoolId,
      setSelectedYearId, setSelectedTermId, setSelectedWeekId, setSelectedMonth, setSelectedSchoolId,
      refreshPeriod
    }}>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-text-primary">
        <Toaster position="top-right" richColors />

        {/* Sidebar */}
        <aside className={`${collapsed ? 'w-14' : 'w-56'} bg-slate-900 transition-all duration-300 flex flex-col z-50 shadow-lg border-r border-slate-800 shrink-0`}>
          <div className="h-12 flex items-center justify-between px-3 shrink-0 border-b border-slate-800/50">
            <div className={`flex items-center space-x-2.5 ${collapsed ? 'hidden' : 'block'}`}>
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} className="h-6 w-auto" alt="Logo" />
              ) : (
                <div className="w-6 h-6 bg-primary-default rounded flex items-center justify-center text-white text-[9px] font-bold">Z</div>
              )}
              <div className="leading-tight">
                <h1 className="text-white font-bold text-[13px] tracking-tight">{zonalName.length > 18 ? zonalName.substring(0, 16) + '...' : zonalName}</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Zone EMIS</p>
              </div>
            </div>
            <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
              <Menu size={16} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
            {['Main', 'Records', 'Zonal Aggregates', 'Utilities'].map(section => (
              <React.Fragment key={section}>
                <SectionHeader label={section} collapsed={collapsed} />
                {navItems.filter(i => i.section === section).map(item => (
                  <SidebarItem key={item.to} {...item} active={location.pathname === item.to} collapsed={collapsed} />
                ))}
              </React.Fragment>
            ))}
          </nav>

          <div className="p-2 border-t border-slate-800">
            <button onClick={() => setShowApp(false)} className="flex items-center w-full space-x-2.5 px-3 py-1.5 rounded text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-[12px] uppercase tracking-wider">
              <LogOut size={16} /> {!collapsed && <span>Log Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg-default">
          {/* Persistent Header with Zonal Name + Academic Selector */}
          {location.pathname === '/' && (
          <header className="bg-white border-b border-border-default shrink-0 z-40">
            <div className="flex items-center justify-between px-5 h-[48px]">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-primary-default rounded-md flex items-center justify-center text-white">
                  <Globe size={14} />
                </div>
                <h1 className="text-[15px] font-bold text-text-primary leading-tight">{zonalName}</h1>
                {settings?.zoneCode && (
                  <span className="bg-primary-default/5 text-primary-default px-2 py-0.5 rounded text-[10px] font-bold border border-primary-default/20">{settings.zoneCode}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <GlobalAcademicSelector />
                <div className="h-5 w-px bg-border-default mx-1" />
                <div className="flex items-center space-x-2.5 group cursor-pointer">
                  <div className="flex flex-col items-end">
                    <p className="text-[11px] font-bold text-text-primary leading-none">Admin</p>
                    <p className="text-[9px] text-text-secondary mt-0.5 font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="w-7 h-7 bg-slate-50 border border-border-default rounded flex items-center justify-center text-primary-default font-bold text-[11px]">AD</div>
                </div>
              </div>
            </div>
          </header>
          )}

          {/* Viewport */}
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="erp-container">
              <ErrorBoundary>
                <Suspense fallback={<div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-2 border-primary-default border-t-transparent rounded-full animate-spin"></div></div>}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/upload" element={<DataUpload />} />
                    <Route path="/learners" element={<LearnerRegistry />} />
                    <Route path="/hr" element={<TeacherRegistry />} />
                    <Route path="/school-profile" element={<SchoolProfile />} />
                    <Route path="/assistant" element={<Assistant />} />
                    <Route path="/department" element={<DepartmentManager />} />
                    <Route path="/zonal/enrolment" element={<ZonalModule type="enrolment" />} />
                    <Route path="/zonal/infrastructure" element={<ZonalModule type="infrastructure" />} />
                    <Route path="/zonal/exams" element={<ZonalModule type="exams" />} />
                    <Route path="/zonal/attendance" element={<ZonalModule type="attendance" />} />
                    <Route path="/zonal/materials" element={<ZonalModule type="materials" />} />
                    <Route path="/zonal/health" element={<ZonalModule type="health" />} />
                    <Route path="/zonal/inclusion" element={<ZonalModule type="inclusion" />} />
                    <Route path="/zonal/finance" element={<ZonalModule type="finance" />} />
                    <Route path="/zonal/reports" element={<ZonalModule type="reports" />} />
                    <Route path="/settings" element={<ZonalModule type="settings" />} />
                    <Route path="/publications" element={<PublicationsView />} />
                    <Route path="/notices" element={<NoticesView />} />
                    <Route path="/backup" element={<BackupManager />} />
                    <Route path="*" element={<PlaceholderView />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </GlobalContext.Provider>
  );
};

const PlaceholderView = () => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <div className="erp-card p-12 flex flex-col items-center max-w-lg text-center">
      <div className="w-16 h-16 bg-bg-default rounded-full flex items-center justify-center mb-6">
        <School size={32} className="text-text-secondary/40" />
      </div>
      <h2 className="mb-2">Module under development</h2>
      <p className="text-text-secondary mb-8">This module is currently being finalized to meet MoES EMIS technical compliance standards.</p>
      <button className="erp-btn erp-btn-primary px-8">Check for updates <ChevronRight size={16} /></button>
    </div>
  </div>
);

const PublicationsView = () => (
  <div className="erp-container py-6 space-y-6 animate-in-fade">
    <header className="border-b border-border-default pb-4">
      <h1 className="text-[24px] font-bold text-text-primary">Publications Registry</h1>
      <p className="text-[12px] text-text-secondary">Official EMIS publications, circulars, and statistical bulletins</p>
    </header>
    <div className="flex flex-col items-center justify-center h-[40vh] text-center">
      <div className="w-16 h-16 bg-bg-default rounded-full flex items-center justify-center mb-6">
        <BookOpen size={32} className="text-text-secondary/40" />
      </div>
      <h3 className="text-[16px] font-bold text-text-primary mb-2">No publications yet</h3>
      <p className="text-[12px] text-text-secondary max-w-md">Publications will appear here once they are added to the system through the data management workflow.</p>
    </div>
  </div>
);

const NoticesView = () => (
  <div className="erp-container py-6 space-y-6 animate-in-fade">
    <header className="border-b border-border-default pb-4">
      <h1 className="text-[24px] font-bold text-text-primary">Notices & Announcements</h1>
      <p className="text-[12px] text-text-secondary">Ministry circulars, deadlines, and system notifications</p>
    </header>
    <div className="flex flex-col items-center justify-center h-[40vh] text-center">
      <div className="w-16 h-16 bg-bg-default rounded-full flex items-center justify-center mb-6">
        <Bell size={32} className="text-text-secondary/40" />
      </div>
      <h3 className="text-[16px] font-bold text-text-primary mb-2">No notices yet</h3>
      <p className="text-[12px] text-text-secondary max-w-md">System notices and ministry circulars will appear here when published.</p>
    </div>
  </div>
);

const AppRouter: React.FC = () => (
  <HashRouter><App /></HashRouter>
);

export default AppRouter;
