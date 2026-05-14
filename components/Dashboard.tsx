
import React from 'react';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserRoundCheck, 
  School, 
  ChevronRight, 
  UploadCloud,
  AlertCircle,
  Activity,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ZonalAggregate } from '../services/analyticsService';

import KPICard from './KPICard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const learnerCount = useLiveQuery(() => db.learners.count()) || 0;
  const teacherCount = useLiveQuery(() => db.teachers.count()) || 0;
  const schoolCount = useLiveQuery(() => db.schools.count()) || 0;
  const submittedReports = useLiveQuery(() => db.termlyReports.where('status').equals('Submitted').count()) || 0;
  
  const auditLogs = useLiveQuery(() => db.auditLogs.limit(5).reverse().sortBy('timestamp')) || [];

  // Read zonal aggregate from local storage for the demo
  const [zonalAggregate] = React.useState<ZonalAggregate | null>(() => {
    const data = localStorage.getItem('zonal_aggregate_Term 1_2024');
    return data ? JSON.parse(data) : null;
  });

  const handleAction = (label: string, route?: string) => {
    if (route) {
      navigate(route);
    } else {
      toast.info(`Navigating to: ${label}`);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome & Context Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-6">
        <div>
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">System Overview</h1>
          <p className="text-[13px] text-text-secondary mt-1">Malawi Educational Management Information System central dashboard</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={() => handleAction('Analytics Explorer', '/zonal/reports')}
              className="erp-btn erp-btn-secondary h-9 px-4 text-[13px]"
            >
               <Activity size={16} />
               <span>Analytics Explorer</span>
            </button>
            <button 
              onClick={() => handleAction('Bulk Data Registry', '/upload')}
              className="erp-btn erp-btn-primary h-9 px-4 text-[13px]"
            >
               <UploadCloud size={16} />
               <span>Bulk Data Registry</span>
            </button>
        </div>
      </div>

      {/* Global Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard 
          label="Institutional Registry" 
          value={schoolCount} 
          icon={<School className="text-primary-default" size={18} />} 
          trend="Validated schools"
        />
        <KPICard 
          label="Total Enrollment" 
          value={zonalAggregate ? zonalAggregate.totalEnrolment : learnerCount} 
          icon={<Users className="text-success" size={18} />} 
          trend={zonalAggregate ? `${zonalAggregate.schoolsSubmitted} reports active` : "Registry database total"}
        />
        <KPICard 
          label="Certified Educators" 
          value={zonalAggregate ? zonalAggregate.totalTeachers : teacherCount} 
          icon={<UserRoundCheck className="text-warning" size={18} />} 
          trend="Active staff registry"
        />
        <KPICard 
          label="Reporting Cycle" 
          value={`${submittedReports}/${schoolCount}`} 
          icon={<AlertCircle className="text-error" size={18} />} 
          trend="Termly submission rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Statistical Visual */}
        <div className="lg:col-span-2 space-y-6">
          {zonalAggregate && (
            <div className="erp-card p-0 border-l-4 border-l-primary-default overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-3 border-b border-border-default flex items-center justify-between">
                    <h3 className="text-[13px] font-semibold text-text-primary">Collection Aggregates</h3>
                    <span className="erp-badge bg-primary-default text-white">Live data</span>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-8 bg-white">
                    <div>
                        <p className="text-[12px] font-medium text-text-secondary mb-1">Boys Enrolled</p>
                        <p className="text-[28px] font-bold text-text-primary tracking-tight">{zonalAggregate.boysEnrolment.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-text-secondary mb-1">Girls Enrolled</p>
                        <p className="text-[28px] font-bold text-text-primary tracking-tight">{zonalAggregate.girlsEnrolment.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-text-secondary mb-1">Gender Parity Index</p>
                        <p className="text-[28px] font-bold text-text-primary tracking-tight">{(zonalAggregate.girlsEnrolment / Math.max(1, zonalAggregate.boysEnrolment)).toFixed(2)}</p>
                    </div>
                </div>
            </div>
          )}
          
          <div className="erp-card p-0 overflow-hidden">
             <div className="px-6 py-4 border-b border-border-default bg-gray-50/30 flex items-center justify-between">
                <div>
                   <h2 className="text-[16px] font-semibold text-text-primary">National Enrollment Trend</h2>
                   <p className="text-[12px] text-text-secondary">Annual student growth matrix (EMIS 2024)</p>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                    <span className="text-[11px] font-semibold text-success uppercase tracking-wider">Live Session</span>
                </div>
             </div>
             <div className="p-6 h-[280px] bg-white">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={[
                       { name: 'Jan', val: 400 }, { name: 'Feb', val: 300 }, { name: 'Mar', val: 600 }, 
                       { name: 'Apr', val: 800 }, { name: 'May', val: 500 }, { name: 'Jun', val: 900 }
                   ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '13px' }} 
                        cursor={{ fill: '#F9FAFB' }}
                      />
                      <Bar dataKey="val" fill="#0f172a" radius={[2, 2, 0, 0]} barSize={32} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <KPICard 
                label="Geographical Reach" 
                value={28} 
                icon={<MapPin className="text-secondary-default" size={18} />} 
                trend="100% National coverage"
             />
             <KPICard 
                label="Infrastructure Health" 
                value="Standard" 
                icon={<Activity className="text-emerald-500" size={18} />} 
                trend="Compliant threshold"
             />
          </div>
        </div>

        {/* Action Center & Audit Trail Sidebar */}
        <div className="space-y-4">
            <div className="bg-slate-900 px-6 py-6 rounded-md text-white relative overflow-hidden shadow-lg border border-slate-800 group">
                <ShieldCheck size={100} className="absolute right-[-5%] bottom-[-5%] text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-3">Security Protocol</h4>
                  <p className="text-[18px] font-bold text-white mb-1.5 leading-tight">Data Encryption Active</p>
                  <p className="text-white/50 text-[12px] mb-5 leading-relaxed font-medium">Operational session is secured and audited per ISO standards.</p>
                  <button 
                    onClick={() => handleAction('System Audit Logs', '/settings')}
                    className="w-full h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-bold text-[11px] uppercase tracking-wider transition-all"
                  >
                    System Audit Logs
                  </button>
                </div>
            </div>

            <div className="erp-card bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-border-default flex items-center justify-between bg-gray-50/50">
                  <h2 className="text-[11px] font-bold text-text-primary uppercase tracking-wider opacity-70">Recent Activity</h2>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
                <div className="divide-y divide-border-default/50 text-[13px]">
                    {auditLogs.map((log, i) => (
                        <div key={i} className="px-4 py-3 transition-all hover:bg-gray-50/50 cursor-pointer">
                            <div className="flex gap-3">
                              <div className="w-0.5 h-7 bg-primary-default/20 rounded-full shrink-0"></div>
                              <div className="min-w-0">
                                <p className="font-semibold text-text-primary leading-tight truncate">{log.content}</p>
                                <p className="text-[11px] text-text-secondary mt-1 flex items-center opacity-70">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Registry Event
                                </p>
                              </div>
                            </div>
                        </div>
                    ))}
                    {auditLogs.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-[12px] text-text-secondary opacity-40">No activity records</p>
                        </div>
                    )}
                </div>
                <div className="p-2.5 bg-gray-50/30 border-t border-border-default text-center">
                  <button 
                    onClick={() => handleAction('All Registry Logs', '/settings')}
                    className="text-[11px] font-bold text-primary-default hover:underline uppercase tracking-tight"
                  >
                    View All Registry Logs
                  </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
