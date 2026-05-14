
import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { seedDatabase } from './db';
import Dashboard from './components/Dashboard';
import LearnerRegistry from './components/LearnerRegistry'; 
import Assistant from './components/Assistant';
import DataUpload from './components/DataUpload';
import TeacherRegistry from './components/TeacherRegistry';
import LandingPage from './components/LandingPage';
import SchoolProfile from './components/SchoolProfile';
import ZonalModule from './components/ZonalModule';
import RecordsRegistry from './components/RecordsRegistry';

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

  useEffect(() => {
    seedDatabase();
  }, []);

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
        {/* Header - Only on Dashboard */}
        {isDashboard && (
          <header className="h-[48px] bg-white border-b border-border-default flex items-center justify-between px-5 shrink-0 z-40">
            <div className="flex items-center space-x-3">
               <h1 className="text-[14px] font-bold text-text-primary leading-tight">Lilongwe Demonstration School</h1>
               <span className="bg-primary-default/5 text-primary-default px-2 py-0.5 rounded text-[10px] font-bold border border-primary-default/20">MW-CE-001</span>
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
        )}

        {/* View Viewport */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="erp-container">
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

              <Route path="*" element={<PlaceholderView />} />
            </Routes>
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

const AppRouter: React.FC = () => (
  <HashRouter>
    <App />
  </HashRouter>
);

export default AppRouter;
