import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserRoundCheck, 
  School, 
  ChevronRight, 
  CloudUpload,
  CircleAlert,
  Activity,
  MapPin,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  Calendar,
  Clock,
  Globe,
  TriangleAlert,
  ChartBar,
  Lock,
  Archive,
  ListFilter,
  UserCheck,
  CalendarDays
} from 'lucide-react';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ZonalAggregate } from '../services/analyticsService';
import { useGlobal } from '../App';
import { detectMissingReports, getTermsForYear, getWeeksForTerm, getMonthsForTerm } from '../services/academicService';
import { aggregateWeekToMonth, aggregateMonthToTerm } from '../services/aggregationService';
import { runArchiveCycle, getArchiveStatus } from '../services/archiveService';
import { AcademicTerm, AcademicWeek, MonthlyPeriod } from '../types';

import KPICard from './KPICard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { settings, currentPeriod, selectedYearId, selectedTermId } = useGlobal();
  const learnerCount = useLiveQuery(() => db.learners.count()) || 0;
  const teacherCount = useLiveQuery(() => db.teachers.count()) || 0;
  const schoolCount = useLiveQuery(() => db.schools.count()) || 0;
  const submittedReports = useLiveQuery(() => db.termlyReports.where('status').equals('Submitted').count()) || 0;
  const allLearners = useLiveQuery(() => db.learners.toArray()) || [];
  const allTeachers = useLiveQuery(() => db.teachers.toArray()) || [];
  const allSchools = useLiveQuery(() => db.schools.toArray()) || [];
  const allReports = useLiveQuery(() => db.termlyReports.toArray()) || [];
  const auditLogs = useLiveQuery(() => db.auditLogs.orderBy('timestamp').reverse().limit(5).toArray()) || [];
  const [missingSchools, setMissingSchools] = useState<Array<{ schoolId: number; schoolName: string }>>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState({ expiredWeeks: 0, lockedWeeks: 0, archivedYears: 0, activeYears: 0 });
  const [aggregating, setAggregating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [priorTerms, setPriorTerms] = useState<{ term: AcademicTerm; weeks: AcademicWeek[]; months: MonthlyPeriod[] }[]>([]);

  useEffect(() => {
    detectMissingReports().then(setMissingSchools);
  }, [currentPeriod]);

  useEffect(() => {
    getArchiveStatus().then(setArchiveStatus);
  }, []);

  useEffect(() => {
    if (!currentPeriod) return;
    const yearId = currentPeriod.academicYear.id;
    getTermsForYear(yearId).then(async terms => {
      const result = [];
      for (const term of terms) {
        if (term.id === currentPeriod.term.id) continue;
        const [weeks, months] = await Promise.all([
          getWeeksForTerm(term.id!),
          getMonthsForTerm(term.id!)
        ]);
        result.push({ term, weeks, months });
      }
      setPriorTerms(result);
    });
  }, [currentPeriod]);

  const handleAggregate = useCallback(async () => {
    setAggregating(true);
    try {
      if (currentPeriod) {
        const months = await getMonthsForTerm(currentPeriod.term.id);
        for (const m of months) {
          await aggregateWeekToMonth(currentPeriod.term.id, m.id!);
        }
        await aggregateMonthToTerm(currentPeriod.term.id);
      }
      toast.success('Aggregation complete');
    } catch { toast.error('Aggregation failed'); }
    setAggregating(false);
  }, [currentPeriod]);

  const handleArchive = useCallback(async () => {
    setArchiving(true);
    try {
      const { locked } = await runArchiveCycle();
      getArchiveStatus().then(setArchiveStatus);
      toast.success(`${locked} weeks locked`);
    } catch { toast.error('Archive cycle failed'); }
    setArchiving(false);
  }, []);

  const enrollmentTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentYear = now.getFullYear();
    return months.slice(0, now.getMonth() + 1).map((name, idx) => ({
      name,
      val: allLearners.filter(l => {
        const created = new Date(l.createdAt);
        return created.getMonth() === idx && created.getFullYear() === currentYear;
      }).length
    }));
  }, [allLearners]);

  const liveTotalEnrolment = useMemo(() => 
    allLearners.length + (allReports.reduce((sum, r) => {
      if (r.enrolment) {
        Object.values(r.enrolment).forEach((g: { m: number; f: number }) => {
          sum += (g.m || 0) + (g.f || 0);
        });
      }
      return sum;
    }, 0)),
    [allLearners, allReports]
  );

  const liveTotalTeachers = useMemo(() => 
    allTeachers.length + allReports.reduce((sum, r) => sum + (r.teachers?.summary?.length || 0), 0),
    [allTeachers, allReports]
  );

  const zonalAggregate = useMemo<ZonalAggregate | null>(() => {
    const term = currentPeriod?.term.name || 'Term 1';
    const year = currentPeriod?.academicYear.year || 0;
    const tryData = localStorage.getItem(`zonal_aggregate_${term}_${year}`);
    if (tryData) {
      try { return JSON.parse(tryData); } catch { /* ignore */ }
    }
    const submitted = allReports.filter(r => r.status === 'Submitted');
    return {
      totalEnrolment: allLearners.length,
      totalTeachers: allTeachers.length,
      boysEnrolment: allLearners.filter(l => l.gender === 'M').length,
      girlsEnrolment: allLearners.filter(l => l.gender === 'F').length,
      term,
      year,
      schoolsSubmitted: submitted.length,
      totalSchools: allSchools.length,
    };
  }, [allLearners, allTeachers, allSchools, allReports, currentPeriod]);

  const uniqueDistricts = useMemo(() => new Set(allSchools.map(s => s.district)).size, [allSchools]);
  const retiringTeachers = useMemo(() => {
    const fourMonthsFromNow = new Date();
    fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4);
    return allTeachers.filter(t => {
      if (!t.dateOfBirth) return false;
      const dob = new Date(t.dateOfBirth);
      const retirementDate = new Date(dob);
      retirementDate.setFullYear(dob.getFullYear() + 60);
      return retirementDate > new Date() && retirementDate <= fourMonthsFromNow;
    }).map(t => {
      const dob = new Date(t.dateOfBirth);
      const retirementDate = new Date(dob);
      retirementDate.setFullYear(dob.getFullYear() + 60);
      return { ...t, retirementDate };
    });
  }, [allTeachers]);

  const avgInfraHealth = useMemo(() => {
    if (!allSchools.length) return 'N/A';
    const scores = allSchools.map(s => {
      let score = 0;
      if (s.infrastructure?.waterSource && s.infrastructure.waterSource !== 'None') score += 25;
      if (s.infrastructure?.electricitySource && s.infrastructure.electricitySource !== 'None') score += 25;
      if (s.infrastructure?.internetAccess) score += 25;
      if ((s.infrastructure?.classrooms || 0) > 0) score += 25;
      return score;
    });
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg >= 80 ? 'Excellent' : avg >= 60 ? 'Standard' : avg >= 40 ? 'Fair' : 'Poor';
  }, [allSchools]);

  const handleAction = (label: string, route?: string) => {
    if (route) { navigate(route); }
    else { toast.info(`Navigating to: ${label}`); }
  };

  const zonalName = settings?.zonalName || 'EMIS TDC';
  const periodLabel = currentPeriod ? `${currentPeriod.academicYear.year} / ${currentPeriod.term.name} / Week ${currentPeriod.week.weekNumber}` : '—';

  return (
    <div className="space-y-6 pb-10">
      {/* Zonal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-default rounded-lg flex items-center justify-center text-white shadow-sm">
              <Globe size={18} />
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-text-primary tracking-tight">{zonalName}</h1>
              <p className="text-[12px] text-text-secondary">Zonal Education Management Information System</p>
            </div>
          </div>
          {currentPeriod && (
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary bg-gray-50 px-3 py-1 rounded-md border border-border-default">
                <Calendar size={12} className="text-primary-default" />
                Academic Year: <span className="font-bold text-text-primary">{currentPeriod.academicYear.year}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary bg-gray-50 px-3 py-1 rounded-md border border-border-default">
                <Clock size={12} className="text-primary-default" />
                {currentPeriod.term.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary bg-gray-50 px-3 py-1 rounded-md border border-border-default">
                <Activity size={12} className="text-primary-default" />
                Week {currentPeriod.week.weekNumber}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {missingSchools.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-warning bg-amber-50 px-4 py-2 rounded-md border border-amber-200">
              <TriangleAlert size={14} />
              <span>{missingSchools.length} schools missing Week {currentPeriod?.week.weekNumber} reports</span>
            </div>
          )}
          <button onClick={() => handleAction('Analytics Explorer', '/zonal/reports')} className="erp-btn erp-btn-secondary h-9 px-4 text-[13px]">
            <ChartBar size={16} /> <span>Analytics</span>
          </button>
          <button onClick={() => handleAction('Bulk Data Registry', '/upload')} className="erp-btn erp-btn-primary h-9 px-4 text-[13px]">
            <CloudUpload size={16} /> <span>Data Entry</span>
          </button>
        </div>
      </div>

      {/* Archive & Aggregation Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={handleAggregate} disabled={aggregating} className="erp-btn erp-btn-secondary h-8 px-3 text-[11px]">
          <Database size={13} /> {aggregating ? 'Aggregating...' : 'Aggregate Reports'}
        </button>
        <button onClick={handleArchive} disabled={archiving} className="erp-btn erp-btn-secondary h-8 px-3 text-[11px]">
          <Lock size={13} /> {archiving ? 'Archiving...' : 'Run Archive Cycle'}
        </button>
        <button onClick={() => setShowTimeline(!showTimeline)} className={`erp-btn h-8 px-3 text-[11px] ${showTimeline ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
          <ListFilter size={13} /> {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
        </button>
        <span className="text-[10px] text-text-secondary font-medium flex items-center gap-1.5">
          <Archive size={11} /> {archiveStatus.lockedWeeks} locked / {archiveStatus.expiredWeeks} expired
        </span>
      </div>

      {/* Timeline Sidebar (expandable) */}
      {showTimeline && priorTerms.length > 0 && (
        <div className="erp-card p-4 border-l-4 border-l-primary-default">
          <h3 className="text-[12px] font-bold text-text-primary mb-3 flex items-center gap-2">
            <Clock size={14} /> Prior Periods — {currentPeriod?.academicYear.year}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {priorTerms.map(pt => (
              <div key={pt.term.id} className="border border-border-default rounded p-3 bg-gray-50/30">
                <p className="text-[12px] font-bold text-text-primary">{pt.term.name}</p>
                <p className="text-[10px] text-text-secondary">{pt.term.startDate} → {pt.term.endDate}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded">{pt.weeks.length} weeks</span>
                  <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded">{pt.months.length} months</span>
                </div>
                <button 
                  onClick={() => toast.info(`${pt.term.name} data available for review`)}
                  className="text-[10px] font-bold text-primary-default mt-1.5 hover:underline"
                >
                  Review Period →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
          value={zonalAggregate ? zonalAggregate.totalEnrolment : liveTotalEnrolment || learnerCount} 
          icon={<Users className="text-success" size={18} />} 
          trend={zonalAggregate ? `${zonalAggregate.schoolsSubmitted} reports active` : "Registry database total"}
        />
        <KPICard 
          label="Certified Educators" 
          value={zonalAggregate ? zonalAggregate.totalTeachers : liveTotalTeachers || teacherCount} 
          icon={<UserRoundCheck className="text-warning" size={18} />} 
          trend="Active staff registry"
        />
        <KPICard 
          label="Reporting Cycle" 
          value={`${submittedReports}/${schoolCount}`} 
          icon={<CircleAlert className="text-error" size={18} />} 
          trend="Termly submission rate"
        />
      </div>

      {/* Data Completeness Dashboard */}
      <div className="erp-card p-5 border-l-4 border-l-primary-default">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database size={18} className="text-primary-default" />
            <h3 className="text-[14px] font-bold text-text-primary">Data Completeness Dashboard</h3>
          </div>
          <span className="text-[11px] text-text-secondary font-medium">
            {[
              { label: 'Learners', count: learnerCount, target: 100 },
              { label: 'Teachers', count: teacherCount, target: 50 },
              { label: 'Schools', count: schoolCount, target: 100 },
              { label: 'Reports', count: submittedReports, target: schoolCount || 1 },
            ].map(d => ({ ...d, pct: Math.min(100, Math.round((d.count / (d.target || 1)) * 100)) })).filter(d => d.pct < 60).length > 0 ? 'Some modules need attention' : 'All modules healthy'}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Learners', count: learnerCount, target: 100, icon: <Users size={14} />, color: 'bg-blue-500' },
            { label: 'Teachers', count: teacherCount, target: 50, icon: <UserRoundCheck size={14} />, color: 'bg-emerald-500' },
            { label: 'Schools', count: schoolCount, target: 100, icon: <School size={14} />, color: 'bg-amber-500' },
            { label: 'Reports', count: submittedReports, target: schoolCount || 1, icon: <FileSpreadsheet size={14} />, color: 'bg-purple-500' },
          ].map(d => {
            const pct = Math.min(100, Math.round((d.count / (d.target || 1)) * 100));
            return (
              <div key={d.label} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 text-text-secondary">{d.icon} {d.label}</span>
                  <span className={pct >= 80 ? 'text-success' : pct >= 40 ? 'text-warning' : 'text-error'}>{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                </div>
                <p className="text-[10px] text-text-secondary">{d.count} / {d.target}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Statistical Visual */}
        <div className="lg:col-span-2 space-y-6">
          {zonalAggregate && (
            <div className="erp-card p-0 border-l-4 border-l-primary-default overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-3 border-b border-border-default flex items-center justify-between">
                    <h3 className="text-[13px] font-semibold text-text-primary">Collection Aggregates <span className="text-[11px] font-normal text-text-secondary">({periodLabel})</span></h3>
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
                   <p className="text-[12px] text-text-secondary">Annual student growth matrix ({currentPeriod?.academicYear.year || '-'})</p>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                    <span className="text-[11px] font-semibold text-success uppercase tracking-wider">{periodLabel}</span>
                </div>
             </div>
             <div className="p-6 h-[280px] bg-white">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={enrollmentTrend.length > 0 ? enrollmentTrend : []}>
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
                value={uniqueDistricts} 
                icon={<MapPin className="text-secondary-default" size={18} />} 
                trend={`${allSchools.length} schools across ${uniqueDistricts} districts`}
             />
              <KPICard 
                label="Infrastructure Health" 
                value={avgInfraHealth} 
                icon={<Activity className="text-emerald-500" size={18} />} 
                trend={`${allSchools.filter(s => s.infrastructure?.waterSource).length} with water access`}
             />
          </div>
        </div>

        {/* Action Center & Audit Trail Sidebar */}
        <div className="space-y-4">
            <div className="bg-slate-900 px-6 py-6 rounded-md text-white relative overflow-hidden shadow-lg border border-slate-800">
                <CalendarDays size={100} className="absolute right-[-5%] bottom-[-5%] text-white/5 rotate-12" />
                <div className="relative z-10">
                  <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] mb-3">Retirement Notice</h4>
                  <p className="text-[18px] font-bold text-white mb-1.5 leading-tight">{retiringTeachers.length} Teacher{retiringTeachers.length !== 1 ? 's' : ''} Retiring</p>
                  <p className="text-white/50 text-[12px] mb-5 leading-relaxed font-medium">Within the next 4 months based on statutory retirement age (60).</p>
                  <div className="space-y-2 mb-5 max-h-[180px] overflow-y-auto">
                    {retiringTeachers.length > 0 ? retiringTeachers.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded px-3 py-2">
                        <div className="flex items-center gap-2">
                          <UserCheck size={14} className="text-amber-400" />
                          <span className="text-[12px] font-medium text-white">{t.fullName}</span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-bold">{t.retirementDate.toLocaleDateString()}</span>
                      </div>
                    )) : (
                      <p className="text-white/40 text-[12px] italic">No teachers scheduled for retirement in the next 4 months.</p>
                    )}
                  </div>
                  <button 
                    onClick={() => handleAction('Personnel Registry', '/hr')}
                    className="w-full h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-bold text-[11px] uppercase tracking-wider transition-all"
                  >
                    View Personnel Registry
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
