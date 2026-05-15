
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { 
  LayoutDashboard, 
  UploadCloud, 
  School, 
  Users, 
  UserRoundCheck,
  Building2,
  BookOpen,
  BadgeDollarSign,
  GraduationCap,
  CalendarCheck,
  HeartPulse,
  Accessibility,
  FileBarChart,
  Settings,
  Bell,
  Menu,
  FileText,
  LogOut,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  Newspaper,
  SlidersHorizontal
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { seedDatabase, db } from './db';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
const Dashboard = lazy(() => import('./components/Dashboard'));
const LearnerRegistry = lazy(() => import('./components/LearnerRegistry')); 
const Assistant = lazy(() => import('./components/Assistant'));
const DataUpload = lazy(() => import('./components/DataUpload'));
const TeacherRegistry = lazy(() => import('./components/TeacherRegistry'));
const SchoolProfile = lazy(() => import('./components/SchoolProfile'));
const ZonalModule = lazy(() => import('./components/ZonalModule'));
const RecordsRegistry = lazy(() => import('./components/RecordsRegistry'));

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, active: boolean, collapsed: boolean }> = ({ to, icon, label, active, collapsed }) => (
  <Link 
    to={to} 
    className={`flex items-center group space-x-2.5 px-3 py-1.5 rounded transition-all duration-150 ${
      active 
        ? 'bg-primary-default text-white shadow-md shadow-primary-default/20' 
        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
    }`}
  >
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
  const location = useLocation();

  const schools = useLiveQuery(() => db.schools.toArray()) || [];
  const activeSchool = schools[0];

  useEffect(() => {
    seedDatabase();
  }, []);

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard', '/upload': 'Data Upload', '/learners': 'Learner Registry', '/hr': 'Teacher Registry',
    '/school-profile': 'School Profile', '/assistant': 'AI Assistant', '/infrastructure': 'Infrastructure',
    '/materials': 'Materials', '/finance': 'Finance', '/settings': 'Settings',
    '/publications': 'Publications', '/notices': 'Notices',
    '/zonal/enrolment': 'Zonal Enrolment', '/zonal/infrastructure': 'Zonal Infrastructure',
    '/zonal/exams': 'Zonal Exams', '/zonal/attendance': 'Zonal Attendance',
    '/zonal/materials': 'Zonal Textbooks', '/zonal/health': 'Zonal Health',
    '/zonal/inclusion': 'Zonal Inclusion', '/zonal/finance': 'Zonal Finance',
    '/zonal/reports': 'Zonal Reports',
  };
  useEffect(() => {
    document.title = `EMIS TDC — ${pageTitles[location.pathname] || 'Module'}`;
  }, [location.pathname]);

  if (!showApp) {
    return <LandingPage onEnter={() => setShowApp(true)} />;
  }

  const isDashboard = location.pathname === '/';

  const navItems = [
    { to: '/', icon: <LayoutDashboard />, label: 'Dashboard', section: 'Main' },
    { to: '/upload', icon: <UploadCloud />, label: 'Data Upload', section: 'Main' },
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
    { to: '/zonal/reports', icon: <FileBarChart />, label: 'Reports', section: 'Zonal Aggregates' },
    { to: '/settings', icon: <Settings />, label: 'Settings', section: 'Zonal Aggregates' },

    { to: '/publications', icon: <FileText />, label: 'Publications', section: 'Utilities' },
    { to: '/notices', icon: <Bell />, label: 'Notices', section: 'Utilities' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-text-primary">
      <Toaster position="top-right" richColors />
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-14' : 'w-56'} bg-slate-900 transition-all duration-300 flex flex-col z-50 shadow-lg border-r border-slate-800 shrink-0`}>
        <div className="h-12 flex items-center justify-between px-3 shrink-0 border-b border-slate-800/50">
          <div className={`flex items-center space-x-2.5 ${collapsed ? 'hidden' : 'block'}`}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Coat_of_arms_of_Malawi.svg/1200px-Coat_of_arms_of_Malawi.svg.png" className="h-6 w-auto" alt="Logo" />
            <div className="leading-tight">
              <h1 className="text-white font-bold text-[13px] tracking-tight">EMIS TDC</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Malawi ERP</p>
            </div>
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
            <Menu size={16} />
          </button>
        </div>

        {!collapsed && schools.length > 0 && (
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <select
                value={activeSchool?.id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) window.location.hash = '/school-profile';
                }}
                className="w-full h-8 px-2 bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-200 font-medium outline-none focus:border-blue-500 cursor-pointer appearance-none"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name.length > 28 ? s.name.substring(0, 26) + '...' : s.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronRight size={12} className="text-slate-500 rotate-90" />
              </div>
            </div>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
          {['Main', 'Records', 'Zonal Aggregates', 'Utilities'].map(section => (
            <React.Fragment key={section}>
              <SectionHeader label={section} collapsed={collapsed} />
              {navItems.filter(i => i.section === section).map(item => (
                <SidebarItem 
                  key={item.to}
                  {...item}
                  active={location.pathname === item.to}
                  collapsed={collapsed}
                />
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-800">
          <button 
            onClick={() => setShowApp(false)}
            className="flex items-center w-full space-x-2.5 px-3 py-1.5 rounded text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-[12px] uppercase tracking-wider"
          >
            <LogOut size={16} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

        {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg-default">
        {/* Persistent Header */}
        <header className="h-[48px] bg-white border-b border-border-default flex items-center justify-between px-5 shrink-0 z-40">
            <div className="flex items-center space-x-3">
               <h1 className="text-[14px] font-bold text-text-primary leading-tight">{activeSchool?.name || 'Select School'}</h1>
               <span className="bg-primary-default/5 text-primary-default px-2 py-0.5 rounded text-[10px] font-bold border border-primary-default/20">{activeSchool?.emisCode || '----'}</span>
            </div>

            <div className="flex items-center space-x-5">
               <div className="flex flex-col items-end mr-1">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest opacity-40">Sync status</span>
                  <span className="text-[11px] font-bold text-success leading-none mt-1">Synced: 16:35 CAT</span>
               </div>

               <div className="h-5 w-px bg-border-default"></div>

               <div className="flex items-center space-x-2.5 group cursor-pointer">
                  <div className="flex flex-col items-end">
                     <p className="text-[12px] font-bold text-text-primary leading-none">Admin Account</p>
                     <p className="text-[10px] text-text-secondary mt-1 font-medium opacity-60">Management Console</p>
                  </div>
                  <div className="w-7 h-7 bg-slate-50 border border-border-default rounded flex items-center justify-center text-primary-default font-bold text-[11px]">
                    AD
                  </div>
               </div>
            </div>
          </header>

        {/* View Viewport */}
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
              
              {/* Record Routes */}
              <Route path="/infrastructure" element={<RecordsRegistry type="infrastructure" />} />
              <Route path="/materials" element={<RecordsRegistry type="materials" />} />
              <Route path="/finance" element={<RecordsRegistry type="finance" />} />
              
              {/* Zonal Routes */}
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

              <Route path="*" element={<PlaceholderView />} />
            </Routes>
            </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
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
        <button className="erp-btn erp-btn-primary px-8">
          Check for updates
          <ChevronRight size={16} />
        </button>
    </div>
  </div>
);

const PublicationsView = () => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <div className="erp-card p-12 flex flex-col items-center max-w-lg text-center">
      <div className="w-16 h-16 bg-bg-default rounded-full flex items-center justify-center mb-6">
        <FileSpreadsheet size={32} className="text-text-secondary/40" />
      </div>
      <h2 className="mb-2">Publications Registry</h2>
      <p className="text-text-secondary mb-8">Official EMIS publications, circulars, and statistical bulletins.</p>
      <button className="erp-btn erp-btn-primary px-8">
        Browse Publications
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

const NoticesView = () => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <div className="erp-card p-12 flex flex-col items-center max-w-lg text-center">
      <div className="w-16 h-16 bg-bg-default rounded-full flex items-center justify-center mb-6">
        <Newspaper size={32} className="text-text-secondary/40" />
      </div>
      <h2 className="mb-2">Notices & Announcements</h2>
      <p className="text-text-secondary mb-8">Ministry circulars, deadlines, and system notifications.</p>
      <button className="erp-btn erp-btn-primary px-8">
        View Notices
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

const AppRouter: React.FC = () => (
  <HashRouter>
    <App />
  </HashRouter>
);

export default AppRouter;
