
import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Users, 
  Building2, 
  GraduationCap, 
  CalendarCheck, 
  BookOpen, 
  HeartPulse, 
  Accessibility, 
  BadgeDollarSign, 
  FileBarChart, 
  Settings as SettingsIcon,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserRoundCheck,
  ClipboardCheck,
  Eye,
  Calendar,
  CalendarDays,
  CalendarRange,
  UserCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import KPICard from './KPICard';

interface ZonalModuleProps {
  type: string;
}

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ZonalModule: React.FC<ZonalModuleProps> = ({ type }) => {
  const getHeaderInfo = () => {
    switch (type) {
      case 'enrolment': return { title: 'Zonal Enrolment Aggregates', icon: <Users /> };
      case 'infrastructure': return { title: 'Zonal Infrastructure Aggregates', icon: <Building2 /> };
      case 'exams': return { title: 'Zonal Examinations & Results', icon: <GraduationCap /> };
      case 'attendance': return { title: 'Zonal Attendance Rates', icon: <CalendarCheck /> };
      case 'materials': return { title: 'Zonal Textbooks & Materials', icon: <BookOpen /> };
      case 'health': return { title: 'Zonal Health & Nutrition', icon: <HeartPulse /> };
      case 'inclusion': return { title: 'Zonal Special Needs / Inclusion', icon: <Accessibility /> };
      case 'finance': return { title: 'Zonal School Finance Aggregates', icon: <BadgeDollarSign /> };
      case 'reports': return { title: 'Zonal Analytics Reports', icon: <FileBarChart /> };
      case 'settings': return { title: 'Zonal System Configuration', icon: <SettingsIcon /> };
      default: return { title: 'Zonal Aggregate View', icon: <FileBarChart /> };
    }
  };

  const { title, icon } = getHeaderInfo();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.info('Initiating zonal data synchronization...');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
    toast.success('Zonal aggregate data refreshed successfully');
  };

  const handleExport = (format: string, reportName?: string) => {
    const name = reportName || title;
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Generating ${format} for ${name}...`,
        success: `${name} exported as ${format}`,
        error: 'Export failed'
      }
    );
  };

  const handleGenericAction = (action: string) => {
    toast.info(`Action initiated: ${action}`);
  };

  const renderEnrolment = () => (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Total Zonal Enrolment" value={14250} icon={<Users />} trend="+4.2% YoY" />
        <KPICard label="Boys / Girls" value="7,200 / 7,050" icon={<Users />} trend="GPI: 0.98" />
        <KPICard label="Overage (Global)" value="12.5%" icon={<AlertCircle className="text-warning" />} trend="Std 8 Critical" />
        <KPICard label="Underage (Global)" value="4.2%" icon={<AlertCircle className="text-blue-500" />} trend="Valid Entry" />
        <KPICard label="Net Enrolment Rate" value="94.8%" icon={<CheckCircle2 className="text-success" />} trend="Target: 95%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolment by Grade and Sex Chart */}
        <div className="erp-card p-6 lg:col-span-2">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Enrolment by Grade & Sex</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { grade: 'Std 1', boys: 1200, girls: 1180, repeaters: 150 },
                { grade: 'Std 2', boys: 1150, girls: 1120, repeaters: 120 },
                { grade: 'Std 3', boys: 1100, girls: 1080, repeaters: 90 },
                { grade: 'Std 4', boys: 1050, girls: 1030, repeaters: 80 },
                { grade: 'Std 5', boys: 980, girls: 960, repeaters: 70 },
                { grade: 'Std 6', boys: 900, girls: 880, repeaters: 60 },
                { grade: 'Std 7', boys: 850, girls: 830, repeaters: 50 },
                { grade: 'Std 8', boys: 750, girls: 740, repeaters: 45 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Bar dataKey="boys" name="Boys" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="girls" name="Girls" fill="#ec4899" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Year Trend */}
        <div className="erp-card p-6">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">5-Year Enrolment Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { year: '2020', total: 12500 },
                { year: '2021', total: 13100 },
                { year: '2022', total: 13450 },
                { year: '2023', total: 13800 },
                { year: '2024', total: 14250 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#0f172a" fill="#0f172a" fillOpacity={0.05} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institutional Enrolment Ranking */}
        <div className="erp-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border-default bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Institutional Enrolment Ranking</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="erp-table-header">School Name</th>
                <th className="erp-table-header text-right">M</th>
                <th className="erp-table-header text-right">F</th>
                <th className="erp-table-header text-right">Total</th>
                <th className="erp-table-header text-center">GPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Lilongwe Demonstration Primary', boys: 850, girls: 820, total: 1670, gpi: 0.96 },
                { name: 'Mphandula Primary', boys: 420, girls: 445, total: 865, gpi: 1.06 },
                { name: 'Chisapo 1 Primary', boys: 1200, girls: 1250, total: 2450, gpi: 1.04 },
                { name: 'Kawale Primary', boys: 600, girls: 580, total: 1180, gpi: 0.97 },
              ].map((s, i) => (
                <tr key={i} className="erp-table-row">
                  <td className="erp-table-cell font-bold">{s.name}</td>
                  <td className="erp-table-cell text-right">{s.boys}</td>
                  <td className="erp-table-cell text-right">{s.girls}</td>
                  <td className="erp-table-cell text-right font-bold">{s.total}</td>
                  <td className="erp-table-cell text-center">
                    <span className={`erp-badge ${s.gpi < 0.97 || s.gpi > 1.03 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      {s.gpi.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Age-Grade Distribution */}
        <div className="erp-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border-default bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Age-Grade Distribution (Zone)</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="erp-table-header">Grade</th>
                <th className="erp-table-header text-right">Underage</th>
                <th className="erp-table-header text-right">On-Age</th>
                <th className="erp-table-header text-right">Overage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {['Std 1', 'Std 2', 'Std 3', 'Std 4', 'Std 5', 'Std 6', 'Std 7', 'Std 8'].map((grade, i) => (
                <tr key={i} className="erp-table-row">
                  <td className="erp-table-cell font-bold">{grade}</td>
                  <td className="erp-table-cell text-right text-blue-600">{(5 - i * 0.5).toFixed(1)}%</td>
                  <td className="erp-table-cell text-right font-medium">85.0%</td>
                  <td className="erp-table-cell text-right text-amber-600">{(10 + i * 2.5).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInfrastructure = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Total Classrooms" value={214} icon={<Building2 />} trend="15 under construction" />
        <KPICard label="Avg. Pupil-to-Classroom" value="67:1" icon={<Users />} trend="Threshold: 60:1" />
        <KPICard label="Water Access" value="75%" icon={<CheckCircle2 className="text-emerald-500" />} trend="9/12 Schools" />
        <KPICard label="Grid Electricity" value="42%" icon={<CheckCircle2 className="text-blue-500" />} trend="5/12 Schools" />
        <KPICard label="Sanitation Index" value="1:45" icon={<AlertCircle className="text-amber-500" />} trend="PCR: 1:67" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="erp-card p-6 lg:col-span-2">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Infrastructure Condition by School</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'LW-001', permanent: 12, temporary: 4, open: 2 },
                { name: 'LW-002', permanent: 8, temporary: 2, open: 0 },
                { name: 'LW-003', permanent: 15, temporary: 8, open: 5 },
                { name: 'LW-004', permanent: 10, temporary: 3, open: 1 },
                { name: 'LW-005', permanent: 14, temporary: 5, open: 2 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="permanent" name="Permanent" stackId="a" fill="#0f172a" />
                <Bar dataKey="temporary" name="Temporary" stackId="a" fill="#3b82f6" />
                <Bar dataKey="open" name="Open/None" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="erp-card p-6">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Zonal Utility Coverage</h3>
          <div className="space-y-6 mt-8">
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold uppercase">
                <span>Safe Water Access</span>
                <span>75%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[75%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold uppercase">
                <span>Grid Connectivity</span>
                <span>42%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[42%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold uppercase">
                <span>Handwashing Points</span>
                <span>58%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[58%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold uppercase">
                <span>Boundary Fencing</span>
                <span>15%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[15%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="erp-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-default bg-gray-50/50">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">School Facility Audit Profile</h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="erp-table-header">EMIS Code</th>
              <th className="erp-table-header">School Name</th>
              <th className="erp-table-header text-center">Perm. Class</th>
              <th className="erp-table-header text-center">Temp. Class</th>
              <th className="erp-table-header text-center">PCR</th>
              <th className="erp-table-header text-center">Water</th>
              <th className="erp-table-header text-center">Power</th>
              <th className="erp-table-header text-center">Desk Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { code: 'LW-001', name: 'Demo Primary', perm: 12, temp: 4, pcr: 62, water: 'Borehole', power: 'Grid', desk: '1:3' },
              { code: 'LW-002', name: 'Mphandula', perm: 8, temp: 2, pcr: 45, water: 'None', power: 'Solar', desk: '1:2' },
              { code: 'LW-003', name: 'Chisapo 1', perm: 15, temp: 8, pcr: 88, water: 'Piped', power: 'Grid', desk: '1:4' },
              { code: 'LW-004', name: 'Kawale', perm: 10, temp: 3, pcr: 55, water: 'Piped', power: 'Grid', desk: '1:3' },
            ].map((s, i) => (
              <tr key={i} className="erp-table-row">
                <td className="erp-table-cell font-mono text-[11px]">{s.code}</td>
                <td className="erp-table-cell font-bold">{s.name}</td>
                <td className="erp-table-cell text-center">{s.perm}</td>
                <td className="erp-table-cell text-center">{s.temp}</td>
                <td className="erp-table-cell text-center">
                  <span className={`font-bold ${s.pcr > 60 ? 'text-red-600' : 'text-emerald-600'}`}>1:{s.pcr}</span>
                </td>
                <td className="erp-table-cell text-center">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.water === 'None' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{s.water}</span>
                </td>
                <td className="erp-table-cell text-center">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 underline underline-offset-2">{s.power}</span>
                </td>
                <td className="erp-table-cell text-center text-text-secondary">{s.desk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExams = () => (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Zonal Pass Rate" value="76.4%" icon={<GraduationCap />} trend="+2.1% YoY" />
        <KPICard label="Candidates (B/G)" value="1,240 / 1,180" icon={<Users />} trend="PSLCE 2024" />
        <KPICard label="Top Performer" value="LW-001" icon={<BadgeDollarSign />} trend="94% Success" />
        <KPICard label="Repetition Rate" value="8.5%" icon={<AlertCircle className="text-amber-500" />} trend="Highest: Std 1" />
        <KPICard label="Dropout Rate" value="3.2%" icon={<AlertCircle className="text-error" />} trend="Zonal Average" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="erp-card p-6 lg:col-span-2">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Zonal Pass Rate Trends (3-Year)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { year: '2022', boys: 72, girls: 68 },
                { year: '2023', boys: 74, girls: 71 },
                { year: '2024', boys: 78, girls: 75 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="boys" name="Boys %" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="girls" name="Girls %" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="erp-card p-6">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Subject Benchmark Analysis</h3>
          <div className="space-y-5">
            {[
              { subject: 'English', score: 72, color: 'bg-slate-900' },
              { subject: 'Mathematics', score: 58, color: 'bg-red-500' },
              { subject: 'Science', score: 65, color: 'bg-blue-500' },
              { subject: 'Chichewa', score: 82, color: 'bg-emerald-500' },
              { subject: 'Social Studies', score: 78, color: 'bg-amber-500' },
            ].map((s, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>{s.subject}</span>
                  <span>{s.score}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color}`} style={{ width: `${s.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="erp-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-default bg-gray-50/50">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">National Exam Performance (PSLCE)</h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="erp-table-header">School Name</th>
              <th className="erp-table-header text-right">Candidates</th>
              <th className="erp-table-header text-right">Passed</th>
              <th className="erp-table-header text-right">Failed</th>
              <th className="erp-table-header text-right">Pass Rate</th>
              <th className="erp-table-header text-center">Top Subject</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { name: 'Demo Primary', cand: 154, passed: 145, failed: 9, rate: 94.2, top: 'Science' },
              { name: 'Mphandula', cand: 82, passed: 58, failed: 24, rate: 70.7, top: 'Chichewa' },
              { name: 'Chisapo 1', cand: 245, passed: 188, failed: 57, rate: 76.7, top: 'Social Stud.' },
              { name: 'Kawale', cand: 110, passed: 85, failed: 25, rate: 77.3, top: 'English' },
            ].map((s, i) => (
              <tr key={i} className="erp-table-row">
                <td className="erp-table-cell font-bold">{s.name}</td>
                <td className="erp-table-cell text-right">{s.cand}</td>
                <td className="erp-table-cell text-right text-emerald-600 font-medium">{s.passed}</td>
                <td className="erp-table-cell text-right text-red-600">{s.failed}</td>
                <td className="erp-table-cell text-right font-bold">{s.rate}%</td>
                <td className="erp-table-cell text-center">
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">{s.top}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Learner Attendance" value="92.4%" icon={<CalendarCheck />} trend="Daily average" />
        <KPICard label="Teacher Attendance" value="96.8%" icon={<CalendarCheck />} trend="Compliance high" />
        <KPICard label="Zonal Absentees" value="542" icon={<Users />} trend="Learners today" />
        <KPICard label="Teacher Present" value="185/192" icon={<UserRoundCheck className="text-primary-default" />} trend="96% Zonal Rate" />
        <KPICard label="Days Held" value="185/190" icon={<Clock />} trend="Academic Year Totals" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="erp-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Learner vs Teacher Attendance Trends</h3>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-1.5">
                 <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                 <span className="text-[10px] font-bold text-text-secondary uppercase">Learner</span>
               </div>
               <div className="flex items-center space-x-1.5">
                 <div className="w-2 h-2 rounded-full bg-primary-default"></div>
                 <span className="text-[10px] font-bold text-text-secondary uppercase">Teacher</span>
               </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Sep', learner: 94, teacher: 98 },
                { month: 'Oct', learner: 93, teacher: 97 },
                { month: 'Nov', learner: 91, teacher: 96 },
                { month: 'Dec', learner: 88, teacher: 94 },
                { month: 'Jan', learner: 92, teacher: 97 },
                { month: 'Feb', learner: 94, teacher: 98 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="learner" name="Learner Attendance %" stroke="#0f172a" fill="#0f172a" fillOpacity={0.05} strokeWidth={2} />
                <Area type="monotone" dataKey="teacher" name="Teacher Attendance %" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="erp-card p-6">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Primary Reasons for Absence</h3>
          <div className="space-y-6">
            {[
              { reason: 'Illness', percent: 45, color: 'bg-red-500' },
              { reason: 'Domestic Duties', percent: 22, color: 'bg-amber-500' },
              { reason: 'Market Days', percent: 18, color: 'bg-blue-500' },
              { reason: 'Teacher Workshops', percent: 10, color: 'bg-slate-900' },
              { reason: 'Other', percent: 5, color: 'bg-gray-400' },
            ].map((r, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`w-2.5 h-2.5 rounded-full ${r.color}`}></div>
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>{r.reason}</span>
                    <span>{r.percent}%</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color}`} style={{ width: `${r.percent}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="erp-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-default bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Institutional Attendance Profile (Recent Week)</h3>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Last Synced:</span>
            <span className="text-[10px] font-bold text-success uppercase">Today, 08:30</span>
          </div>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="erp-table-header text-left">School Name</th>
              <th className="erp-table-header text-center">Learner Rate</th>
              <th className="erp-table-header text-center">Teacher Rate</th>
              <th className="erp-table-header text-center">M (Pres)</th>
              <th className="erp-table-header text-center">F (Pres)</th>
              <th className="erp-table-header text-center">Total Est.</th>
              <th className="erp-table-header text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 italic-none">
            {[
              { name: 'Demo Primary', learner: 96.2, teacher: 98.5, m: 18, f: 22, total: 41 },
              { name: 'Mphandula', learner: 88.5, teacher: 92.0, m: 10, f: 12, total: 24 },
              { name: 'Chisapo 1', learner: 93.8, teacher: 97.4, m: 25, f: 30, total: 57 },
              { name: 'Kawale', learner: 91.2, teacher: 95.8, m: 15, f: 18, total: 35 },
            ].map((s, i) => (
              <tr key={i} className="erp-table-row hover:bg-slate-50/50 transition-colors">
                <td className="erp-table-cell px-6 py-3 font-bold text-slate-900">{s.name}</td>
                <td className="erp-table-cell px-6 py-3 text-center">
                  <span className={`font-bold ${s.learner > 92 ? 'text-emerald-600' : 'text-amber-600'}`}>{s.learner}%</span>
                </td>
                <td className="erp-table-cell px-6 py-3 text-center font-bold text-primary-default">{s.teacher}%</td>
                <td className="erp-table-cell px-6 py-3 text-center">{s.m}</td>
                <td className="erp-table-cell px-6 py-3 text-center">{s.f}</td>
                <td className="erp-table-cell px-6 py-3 text-center font-medium bg-slate-50/50">{s.total}</td>
                <td className="erp-table-cell px-6 py-3 text-center">
                  <div className={`w-2 h-2 rounded-full mx-auto ${s.teacher > 95 ? 'bg-success ring-4 ring-success/10' : 'bg-amber-400 ring-4 ring-amber-400/10'}`}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMaterials = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Avg Pupil-to-Book" value="3:1" icon={<BookOpen />} trend="Target: 1:1" />
        <KPICard label="Total Core Books" value="48,200" icon={<BookOpen />} trend="Active inventory" />
        <KPICard label="Book Gap" value="24,500" icon={<AlertCircle className="text-error" />} trend="Core subjects only" />
        <KPICard label="Redistrib. Needed" value="4 Schools" icon={<TrendingUp />} trend="Surplus detected" />
        <KPICard label="Condition (Good)" value="68%" icon={<CheckCircle2 />} trend="Wear rate: 12%/yr" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Textbook Ratio by Subject & Grade */}
        <div className="erp-card p-6 lg:col-span-2">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Textbook Ratio by Subject & Grade</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { grade: 'Std 1', math: 2.1, eng: 2.4, sci: 3.5 },
                { grade: 'Std 2', math: 2.3, eng: 2.6, sci: 3.8 },
                { grade: 'Std 3', math: 2.5, eng: 2.8, sci: 4.1 },
                { grade: 'Std 4', math: 2.8, eng: 3.1, sci: 4.5 },
                { grade: 'Std 5', math: 3.2, eng: 3.5, sci: 5.2 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Pupils per Book', angle: -90, position: 'insideLeft', fontSize: 10 }} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="math" name="Math" fill="#0f172a" radius={[2, 2, 0, 0]} />
                <Bar dataKey="eng" name="English" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="sci" name="Science" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Textbook Distribution Trend Line Chart */}
        <div className="erp-card p-6">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Distribution Trend (Zonal)</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={[
                 { year: '2021', books: 32000 },
                 { year: '2022', books: 38000 },
                 { year: '2023', books: 42000 },
                 { year: '2024', books: 48200 },
               ]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                 <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                 <Tooltip />
                 <Line type="monotone" dataKey="books" name="Total Books" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="erp-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-default bg-gray-50/50">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Institutional Textbook Deficit Ranking</h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="erp-table-header">School Name</th>
              <th className="erp-table-header text-right">Enrollment</th>
              <th className="erp-table-header text-right">Total Books</th>
              <th className="erp-table-header text-right">Deficit</th>
              <th className="erp-table-header text-right">Ratio</th>
              <th className="erp-table-header text-center">Urgency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { name: 'Demo Primary', enr: 1670, books: 620, deficit: 1050, ratio: 2.7 },
              { name: 'Mphandula', enr: 865, books: 210, deficit: 655, ratio: 4.1 },
              { name: 'Chisapo 1', enr: 2450, books: 820, deficit: 1630, ratio: 3.0 },
              { name: 'Kawale', enr: 1180, books: 440, deficit: 740, ratio: 2.6 },
            ].map((s, i) => (
              <tr key={i} className="erp-table-row">
                <td className="erp-table-cell font-bold">{s.name}</td>
                <td className="erp-table-cell text-right">{s.enr}</td>
                <td className="erp-table-cell text-right">{s.books}</td>
                <td className="erp-table-cell text-right text-red-600 font-medium">-{s.deficit}</td>
                <td className="erp-table-cell text-right font-bold">{s.ratio}:1</td>
                <td className="erp-table-cell text-center">
                  <span className={`erp-badge ${s.ratio > 3 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    {s.ratio > 3 ? 'CRITICAL' : 'HIGH'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHealth = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Feeding Coverage" value="82%" icon={<HeartPulse />} trend="10/12 schools active" />
        <KPICard label="Screening Hits" value="1.2%" icon={<AlertCircle />} trend="Stunting/Wasting" />
        <KPICard label="WASH Rank" value="A-" icon={<CheckCircle2 />} trend="Zone Top 3" />
        <KPICard label="Deworming" value="94.5%" icon={<ShieldCheck />} trend="Term 1 data" />
        <KPICard label="Clean Water" value="75%" icon={<CheckCircle2 />} trend="9 Schools" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="erp-card p-6">
           <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Feeding Beneficiaries by School</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { school: 'School A', count: 450 },
                  { school: 'School B', count: 320 },
                  { school: 'School C', count: 680 },
                  { school: 'School D', count: 290 },
                ]}>
                  <XAxis dataKey="school" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
        <div className="erp-card p-6">
            <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Deworming Strategy Coverage</h3>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: 'Completed', value: 94 },
                    { name: 'Pending', value: 6 },
                  ]} dataKey="value" stroke="none" innerRadius={60} outerRadius={80}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center absolute">
                <p className="text-[24px] font-bold">94%</p>
                <p className="text-[10px] text-text-secondary font-bold uppercase">Coverage</p>
              </div>
            </div>
        </div>
      </div>

      <div className="erp-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-default bg-gray-50/50">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">School Feeding & Health Summary</h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="erp-table-header">School Name</th>
              <th className="erp-table-header text-right">Beneficiaries</th>
              <th className="erp-table-header text-right">Fuel Source</th>
              <th className="erp-table-header text-right">Clean Water</th>
              <th className="erp-table-header text-right">Sanitation</th>
              <th className="erp-table-header text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { name: 'Demo Primary', ben: 1250, fuel: 'Firewood', water: 'Yes', san: 'Good' },
              { name: 'Mphandula', ben: 620, fuel: 'Briquettes', water: 'No', san: 'Fair' },
              { name: 'Chisapo 1', ben: 1840, fuel: 'Firewood', water: 'Yes', san: 'Excellent' },
            ].map((s, i) => (
              <tr key={i} className="erp-table-row">
                <td className="erp-table-cell font-bold">{s.name}</td>
                <td className="erp-table-cell text-right font-medium">{s.ben}</td>
                <td className="erp-table-cell text-right text-text-secondary">{s.fuel}</td>
                <td className="erp-table-cell text-right">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.water === 'Yes' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{s.water}</span>
                </td>
                <td className="erp-table-cell text-right font-medium">{s.san}</td>
                <td className="erp-table-cell text-center">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInclusion = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="SNE Learners" value={425} icon={<Accessibility />} trend="Zonal Total" />
        <KPICard label="Specialist Teachers" value={18} icon={<Users />} trend="1:24 Ratio" />
        <KPICard label="Accessibility Index" value="62%" icon={<Building2 />} trend="Ramp compliance" />
        <KPICard label="Resource Units" value={4} icon={<BookOpen />} trend="Full capacity" />
        <KPICard label="Inclusion Rank" value="#2" icon={<TrendingUp />} trend="District-wide" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="erp-card p-6">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Disability Type Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { type: 'Visual', count: 120 },
                { type: 'Hearing', count: 85 },
                { type: 'Physical', count: 95 },
                { type: 'Intellectual', count: 110 },
                { type: 'Multiple', count: 15 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="erp-card p-6">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Accessibility Feature Audit</h3>
          <div className="space-y-6">
            {[
              { label: 'Permanent Ramps', val: 12, target: 45, color: 'bg-emerald-500' },
              { label: 'Adapted Toilets', val: 8, target: 24, color: 'bg-blue-500' },
              { label: 'Braille Materials', val: 145, target: 500, color: 'bg-purple-500' },
              { label: 'Hearing Aids', val: 12, target: 85, color: 'bg-amber-500' },
            ].map((f, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                  <span>{f.label}</span>
                  <span>{f.val} / {f.target}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className={`h-full ${f.color}`} style={{ width: `${(f.val / f.target) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="erp-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-default bg-gray-50/50">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Special Needs Learner Enrollment Profile</h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="erp-table-header">School Name</th>
              <th className="erp-table-header text-right">Total SNE</th>
              <th className="erp-table-header text-right">B</th>
              <th className="erp-table-header text-right">G</th>
              <th className="erp-table-header text-right">Spec. Teachers</th>
              <th className="erp-table-header text-center">Equipment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {[
               { name: 'Demo Primary', total: 42, b: 20, g: 22, teachers: 3, equip: 'Fair' },
               { name: 'Mphandula', total: 18, b: 10, g: 8, teachers: 1, equip: 'Poor' },
               { name: 'Chisapo 1', total: 65, b: 35, g: 30, teachers: 4, equip: 'Good' },
             ].map((s, i) => (
               <tr key={i} className="erp-table-row">
                 <td className="erp-table-cell font-bold">{s.name}</td>
                 <td className="erp-table-cell text-right font-bold text-purple-600">{s.total}</td>
                 <td className="erp-table-cell text-right">{s.b}</td>
                 <td className="erp-table-cell text-right">{s.g}</td>
                 <td className="erp-table-cell text-right font-medium">{s.teachers}</td>
                 <td className="erp-table-cell text-center">
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.equip === 'Poor' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{s.equip}</span>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Zonal Grant Receipts" value="MK 1.25B" icon={<BadgeDollarSign />} trend="98% Received" />
        <KPICard label="Total Expenditure" value="MK 1.10B" icon={<TrendingUp />} trend="88% Utilization" />
        <KPICard label="Avg. Grant / School" value="MK 104M" icon={<BadgeDollarSign />} trend="Weighted by enr" />
        <KPICard label="Pending Reports" value="3" icon={<AlertCircle className="text-warning" />} trend="Schools Overdue" />
        <KPICard label="Compliant Schools" value="9/12" icon={<CheckCircle2 />} trend="Last audit cycle" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="erp-card p-6">
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Expediture by Category (Zone)</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Learning Materials', value: 45000000 },
                  { name: 'Maintenance', value: 32000000 },
                  { name: 'Administration', value: 12000000 },
                  { name: 'WASH/Health', value: 15000000 },
                ]} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={5}>
                  {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="erp-card p-6">
           <h3 className="text-[12px] font-bold uppercase tracking-wider mb-6 text-text-secondary">Audit Status Summary</h3>
           <div className="space-y-6 mt-4">
             {[
               { label: 'Unqualified Opinion', val: 9, total: 12, color: 'bg-emerald-500' },
               { label: 'Qualified Opinion', val: 2, total: 12, color: 'bg-amber-500' },
               { label: 'Adverse Opinion', val: 1, total: 12, color: 'bg-red-500' },
             ].map((a, i) => (
               <div key={i} className="flex items-center space-x-4">
                 <div className={`w-3 h-3 rounded-full ${a.color}`}></div>
                 <div className="flex-1">
                   <div className="flex justify-between text-[11px] font-bold mb-1.5 uppercase">
                     <span>{a.label}</span>
                     <span>{a.val} Schools</span>
                   </div>
                   <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className={`h-full ${a.color}`} style={{ width: `${(a.val / a.total) * 100}%` }}></div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="erp-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-default bg-gray-50/50">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Institutional Grant Disbursement Profile</h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="erp-table-header">School Name</th>
              <th className="erp-table-header text-right">Grant Received (MK)</th>
              <th className="erp-table-header text-right">Spent (MK)</th>
              <th className="erp-table-header text-right">Balance (MK)</th>
              <th className="erp-table-header text-right">Util. %</th>
              <th className="erp-table-header text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { name: 'Demo Primary', grant: 120000000, spent: 115200000, bal: 4800000, util: 96.0 },
              { name: 'Mphandula', grant: 45000000, spent: 38250000, bal: 6750000, util: 85.0 },
              { name: 'Chisapo 1', grant: 185000000, spent: 172050000, bal: 12950000, util: 93.0 },
            ].map((s, i) => (
              <tr key={i} className="erp-table-row">
                <td className="erp-table-cell font-bold">{s.name}</td>
                <td className="erp-table-cell text-right font-mono font-bold">{s.grant.toLocaleString()}</td>
                <td className="erp-table-cell text-right font-mono">{s.spent.toLocaleString()}</td>
                <td className="erp-table-cell text-right font-mono text-text-secondary">{s.bal.toLocaleString()}</td>
                <td className="erp-table-cell text-right font-bold text-blue-600">{s.util}%</td>
                <td className="erp-table-cell text-center">
                  <span className={`erp-badge ${s.util < 90 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {s.util < 90 ? 'RE-ALLOCATE' : 'ON-TRACK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-8">
      {/* Report Filter Bar */}
      <div className="erp-card p-4 bg-slate-50/50 border-dashed flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Academic Year</label>
          <select className="erp-input w-full !h-8 text-[12px]">
            <option>2024 / 2025</option>
            <option>2023 / 2024</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Term</label>
          <select className="erp-input w-full !h-8 text-[12px]">
            <option>Term 1 (Current)</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Institutional Filter</label>
          <select className="erp-input w-full !h-8 text-[12px]">
            <option>All Schools (Zonal)</option>
            <option>Urban Schools only</option>
            <option>Rural Schools only</option>
          </select>
        </div>
        <div className="flex items-end">
          <button 
            onClick={() => handleGenericAction('Apply Filters')}
            className="erp-btn erp-btn-primary !h-8 px-6"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Teachers Daily Attendance', desc: 'Detailed tracking of teacher presence and absenteeism trends', icon: <UserCheck />, status: 'Ready' },
          { title: 'IFA Report', desc: 'Instructional Functional Analysis of classroom teaching standard compliance', icon: <ClipboardCheck />, status: 'Ready' },
          { title: 'Staff Return', desc: 'Consolidated records of staff arrival, departure, and deployment', icon: <UserRoundCheck />, status: 'Ready' },
          { title: 'Supervision', desc: 'Zonal and school-level supervision and inspection observation records', icon: <Eye />, status: 'Ready' },
          { title: 'Monthly Report', desc: 'Monthly summary of zonal performance and administrative actions', icon: <Calendar />, status: 'Ready' },
          { title: 'Quarterly Report', desc: 'Three-month performance review and resource utilization audit', icon: <CalendarDays />, status: 'Draft' },
          { title: 'Termly Report', desc: 'Full end-of-term academic and institutional status analysis', icon: <CalendarRange />, status: 'Ready' },
          { title: 'Zonal Summary Report', desc: 'One-page snapshot of all key indicators across all schools', icon: <FileBarChart />, status: 'Ready' },
          { title: 'Enrolment Detailed Report', desc: 'Full enrolment tables by grade, sex, school', icon: <Users />, status: 'Ready' },
          { title: 'Data Completeness Audit', desc: 'Verification of school submissions and data integrity status', icon: <AlertCircle />, status: 'Review' },
        ].map((report, i) => (
          <div key={i} className="erp-card p-6 hover:border-primary-default transition-all group cursor-pointer shadow-sm relative overflow-hidden">
            {report.status !== 'Ready' && (
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold border-b border-l border-amber-100 rounded-bl">
                {report.status}
              </div>
            )}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded bg-slate-50 border border-border-default flex items-center justify-center text-text-secondary group-hover:text-primary-default group-hover:bg-primary-default/5 transition-all">
                {report.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-bold text-text-primary leading-tight mb-1">{report.title}</h3>
                <p className="text-[12px] text-text-secondary leading-normal h-8 line-clamp-2">{report.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleExport('PDF', report.title); }}
                      className="text-[10px] font-bold text-primary-default uppercase tracking-wider hover:underline"
                    >
                      PDF
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleExport('XLSX', report.title); }}
                      className="text-[10px] font-bold text-primary-default uppercase tracking-wider hover:underline"
                    >
                      XLSX
                    </button>
                  </div>
                  <span className="text-[10px] text-text-secondary font-medium opacity-50">Last: 2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="erp-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-default bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-wider">Institutional List Management</h2>
            <button 
              onClick={() => handleGenericAction('Add New School')}
              className="erp-btn erp-btn-primary !h-8 text-[11px]"
            >
              Add New School
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {[
              { name: 'Lilongwe Demonstration Primary', code: 'LW-001', head: 'Dr. John Phiri', location: 'Urban', status: 'Active' },
              { name: 'Mphandula Primary', code: 'LW-002', head: 'Mary Banda', location: 'Rural', status: 'Active' },
              { name: 'Chisapo 1 Primary', code: 'LW-003', head: 'F. Kumwenda', location: 'Semi-Urban', status: 'Active' },
              { name: 'Kawale Primary', code: 'LW-004', head: 'T. Chunga', location: 'Urban', status: 'Inactive' },
            ].map((school, i) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500">{school.name[0]}</div>
                  <div>
                    <h4 className="text-[13px] font-bold flex items-center">
                      {school.name}
                      <span className="text-[10px] font-mono ml-2 opacity-50">{school.code}</span>
                    </h4>
                    <p className="text-[11px] text-text-secondary">{school.head} • {school.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`erp-badge ${school.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {school.status}
                  </span>
                  <button className="text-gray-400 hover:text-primary-default"><SettingsIcon size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="erp-card p-6">
          <h2 className="text-[13px] font-bold uppercase tracking-wider border-b border-border-default pb-3 mb-6">Zone Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Zone Name</label>
                <input type="text" defaultValue="Lilongwe Central Zone" className="erp-input w-full" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Zone Code</label>
                <input type="text" defaultValue="MW-LW-CEN" className="erp-input w-full font-mono" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Education Division</label>
                <input type="text" defaultValue="Central Western Division" className="erp-input w-full" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Supervising Officer</label>
                <input type="text" defaultValue="Martha Phiri" className="erp-input w-full" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Contact Number</label>
                <input type="text" defaultValue="+265 99 123 4567" className="erp-input w-full" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">District</label>
                <input type="text" defaultValue="Lilongwe City" className="erp-input w-full" />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => handleGenericAction('Update Policy Configuration')}
              className="erp-btn erp-btn-primary"
            >
              Update Policy Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="erp-card p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-6">Academic Period Control</h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-md border border-border-default mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold">2024 / 2025</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded uppercase">Current</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-secondary">Active Term:</span>
                <span className="text-[11px] font-bold text-slate-900">Term 1</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Collection Window</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2"><Clock size={14} className="text-blue-500" /> Opens:</span>
                  <span className="font-medium">May 01, 2026</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2"><Clock size={14} className="text-red-500" /> Deadline:</span>
                  <span className="font-medium text-red-600">June 15, 2026</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-default">
              <button 
                onClick={() => handleGenericAction('Configure Window')}
                className="w-full erp-btn erp-btn-secondary !h-8 text-[11px] mb-2"
              >
                Configure Collection Windows
              </button>
              <button 
                onClick={() => handleGenericAction('View Historical Years')}
                className="w-full erp-btn erp-btn-secondary !h-8 text-[11px]"
              >
                View Historical Years
              </button>
            </div>
          </div>
        </div>

        <div className="erp-card p-6 bg-slate-900 text-white">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <ShieldCheck size={14} /> Security Protocol
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-[10px]">AD</div>
              <div>
                <p className="text-[12px] font-bold">Zonal IT Officer</p>
                <p className="text-[10px] text-slate-400">Registry Permissions: Full</p>
              </div>
            </div>
            <button 
              onClick={() => handleGenericAction('Change Credentials')}
              className="w-full h-8 bg-white text-slate-900 rounded font-bold text-[11px] uppercase tracking-wider hover:bg-slate-200 transition-all"
            >
              Change Credentials
            </button>
            <button 
              onClick={() => handleGenericAction('View Audit Log')}
              className="w-full h-8 bg-white/5 border border-white/10 text-white rounded font-bold text-[11px] uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              View Activity Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded flex items-center justify-center shadow-lg">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 24 }) : icon}
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-text-primary tracking-tight leading-tight">{title}</h1>
            <div className="flex items-center space-x-3 mt-1.5">
              <span className="flex items-center text-[11px] text-text-secondary font-medium"><MapPin size={12} className="mr-1" /> Lilongwe Central Zone</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center text-[11px] text-text-secondary font-medium"><Clock size={12} className="mr-1" /> 2024 / 2025 Term 1</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => handleExport('PDF')}
            className="erp-btn erp-btn-secondary !h-9 text-[12px] font-bold"
          >
            <FileBarChart size={16} />
            Export Context
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`erp-btn erp-btn-primary !h-9 text-[12px] font-bold ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSyncing ? 'Syncing...' : 'Sync Fresh Data'}
          </button>
        </div>
      </div>

      {/* Module Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {type === 'enrolment' && renderEnrolment()}
        {type === 'infrastructure' && renderInfrastructure()}
        {type === 'exams' && renderExams()}
        {type === 'attendance' && renderAttendance()}
        {type === 'materials' && renderMaterials()}
        {type === 'health' && renderHealth()}
        {type === 'inclusion' && renderInclusion()}
        {type === 'finance' && renderFinance()}
        {type === 'reports' && renderReports()}
        {type === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default ZonalModule;
