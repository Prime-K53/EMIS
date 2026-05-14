
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Search, 
  Plus, 
  ArrowRightLeft, 
  LogOut, 
  ChevronRight,
  BarChart3,
  ClipboardList,
  ShieldCheck,
  User,
  Activity,
  ArrowLeft,
  CheckCircle,
  X,
  ArrowRight,
  Calculator,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../db';
import { Teacher, TeacherTransfer, TeacherLeave, School } from '../types';

import KPICard from './KPICard';

const TEACHING_GRADES = ['Auxiliary', 'Grade G', 'Grade F', 'Grade E', 'Grade D', 'Grade C', 'Grade B', 'Grade A'];
const LEAVE_TYPES = ['Sick', 'Maternity', 'Paternity', 'Study', 'Compassionate', 'Annual'] as const;

// Helper to keep component pure by moving side-effect to a function called inside handlers
const getTimestamp = () => Date.now();

const TeacherRegistry: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'registry' | 'tcm' | 'transfers' | 'leaves' | 'tools'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [isNewTeacherModalOpen, setIsNewTeacherModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  
  // Data Subscriptions
  const liveTeachers = useLiveQuery(() => db.teachers.toArray());
  const teachers = useMemo(() => liveTeachers || [], [liveTeachers]);
  
  const liveSchools = useLiveQuery(() => db.schools.toArray());
  const schools = useMemo(() => liveSchools || [], [liveSchools]);
  
  const liveTransfers = useLiveQuery(() => db.teacherTransfers.toArray());
  const transfers = useMemo(() => liveTransfers || [], [liveTransfers]);
  
  const liveLeaves = useLiveQuery(() => db.teacherLeaves.toArray());
  const leaves = useMemo(() => liveLeaves || [], [liveLeaves]);
  
  const liveLearners = useLiveQuery(() => db.learners.toArray());
  const learners = useMemo(() => liveLearners || [], [liveLearners]);

  // Form States
  const [teacherForm, setTeacherForm] = useState<Partial<Teacher>>({
    fullName: '', nin: '', gender: 'M', teachingGrade: 'Grade F', 
    highestQualification: 'Diploma', specialization: '', status: 'Active',
    dateOfBirth: '', phoneNumber: '', homeAddress: '', schoolId: undefined,
    assignedStandard: 'Standard 1'
  });

  const [transferForm, setTransferForm] = useState<Partial<TeacherTransfer>>({
    teacherId: undefined, sourceSchoolId: undefined, destinationSchoolId: undefined,
    reason: '', status: 'Pending'
  });

  const [leaveForm, setLeaveForm] = useState<Partial<TeacherLeave>>({
    teacherId: undefined, type: 'Annual', startDate: '', endDate: '',
    reason: '', status: 'Pending', collegeName: '', courseOfStudy: ''
  });

  const [isStaffingReportOpen, setIsStaffingReportOpen] = useState(false);

  // Handlers
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.fullName || !teacherForm.nin) return;
    
    await db.teachers.add({
      ...teacherForm,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    } as Teacher);
    
    toast.success('Personnel enrollment complete');
    setIsNewTeacherModalOpen(false);
    setTeacherForm({
      fullName: '', nin: '', gender: 'M', teachingGrade: 'Grade F', 
      highestQualification: 'Diploma', specialization: '', status: 'Active',
      dateOfBirth: '', phoneNumber: '', homeAddress: '', schoolId: undefined,
      assignedStandard: 'Standard 1'
    });
  };

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.teacherId || !transferForm.destinationSchoolId) return;

    await db.teacherTransfers.add({
      ...transferForm,
      initiatedDate: getTimestamp()
    } as TeacherTransfer);

    toast.success('Transfer request initiated and logged');
    setIsTransferModalOpen(false);
    setTransferForm({
      teacherId: undefined, sourceSchoolId: undefined, destinationSchoolId: undefined,
      reason: '', status: 'Pending'
    });
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.teacherId || !leaveForm.startDate || !leaveForm.endDate) return;

    await db.teacherLeaves.add({
      ...leaveForm,
      initiatedAt: getTimestamp()
    } as TeacherLeave);

    toast.success('Leave application submitted for approval');
    setIsLeaveModalOpen(false);
    setLeaveForm({
      teacherId: undefined, type: 'Annual', startDate: '', endDate: '',
      reason: '', status: 'Pending', collegeName: '', courseOfStudy: ''
    });
  };

  // Analytics Calculations
  const stats = useMemo(() => {
    const active = teachers.filter(t => t.status === 'Active').length;
    const leaveCount = teachers.filter(t => t.status === 'On Leave').length;
    const ptr = learners.length / (teachers.length || 1);
    
    return {
      total: teachers.length,
      active,
      onLeave: leaveCount,
      ptr: ptr.toFixed(1),
      tcmLicensed: teachers.filter(t => t.tcmLicenseNumber && (!t.tcmLicenseExpiryDate || new Date(t.tcmLicenseExpiryDate) > new Date())).length
    };
  }, [teachers, learners]);

  const teacherProfile = useMemo(() => {
    if (!selectedTeacherId) return null;
    return teachers.find(t => t.id === selectedTeacherId);
  }, [selectedTeacherId, teachers]);

  const calculateRetirement = (dob: string) => {
    const birthDate = new Date(dob);
    const retirementDate = new Date(birthDate.setFullYear(birthDate.getFullYear() + 60));
    return retirementDate.toLocaleDateString();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'registry', label: 'Profiles', icon: <Users size={18} /> },
    { id: 'tcm', label: 'TCM Compliance', icon: <ShieldCheck size={18} /> },
    { id: 'transfers', label: 'Deploy & Transfer', icon: <ArrowRightLeft size={18} /> },
    { id: 'leaves', label: 'Leave Portal', icon: <Calendar size={18} /> },
    { id: 'tools', label: 'Tools', icon: <ClipboardList size={18} /> }
  ];

  return (
    <div className="erp-container py-6 space-y-6 animate-in-fade">
      {/* Header & Sub-nav */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-none">Personnel Registry</h1>
          <p className="text-[12px] text-text-secondary mt-1">District master data and human resource intelligence system</p>
        </div>
        
        <div className="flex bg-gray-50 p-1 rounded border border-border-default shadow-sm overflow-x-auto max-w-full">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id as 'dashboard' | 'registry' | 'tcm' | 'transfers' | 'leaves' | 'tools'); setSelectedTeacherId(null); }}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded text-[13px] font-medium transition-all whitespace-nowrap ${
                activeView === item.id 
                  ? 'bg-white text-primary-default shadow-sm border border-border-default' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
              }`}
            >
              <div className="shrink-0">{React.cloneElement(item.icon as React.ReactElement, { size: 14 })}</div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Viewport */}
      <AnimatePresence mode="wait">
        {activeView === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <KPICard label="Active workforce" value={stats.active} icon={<Users size={18} />} />
             <KPICard label="TCM compliant" value={stats.tcmLicensed} icon={<ShieldCheck size={18} />} />
             <KPICard label="Student-teacher ratio" value={stats.ptr + ":1"} icon={<Activity size={18} />} />
             <KPICard label="On approved leave" value={stats.onLeave} icon={<LogOut size={18} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CTR / Understaffing Alert */}
              <div className="lg:col-span-2 erp-card p-0 overflow-hidden border-l-4 border-l-primary-default">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-border-default flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-[14px] font-bold text-text-primary tracking-tight">Operational Staffing Analysis</h3>
                  </div>
                  <button 
                    onClick={() => setIsStaffingReportOpen(true)}
                    className="text-[12px] font-semibold text-primary-default hover:underline"
                  >
                    Intelligence Report
                  </button>
                </div>
                
                <div className="p-6 space-y-6 bg-white">
                  {schools.slice(0, 5).map(school => {
                    const schoolTeachers = teachers.filter(t => t.schoolId === school.id).length;
                    const schoolLearners = learners.filter(l => l.schoolId === school.id).length;
                    const ratio = schoolLearners / (schoolTeachers || 1);
                    const statusText = ratio > 40 ? 'Critical' : ratio < 20 ? 'Surplus' : 'Optimal';
                    const color = ratio > 40 ? 'bg-error' : ratio < 20 ? 'bg-warning' : 'bg-success';
                    const lightColor = ratio > 40 ? 'bg-error/5 text-error border-error/20' : ratio < 20 ? 'bg-warning/5 text-warning border-warning/20' : 'bg-success/5 text-success border-success/20';

                    return (
                      <div key={school.id} className="flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                          <div className={`w-1 h-10 rounded-full ${color} opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                          <div>
                            <p className="text-[14px] font-semibold text-text-primary leading-none truncate max-w-[280px]">{school.name}</p>
                            <p className="text-[11px] text-text-secondary mt-1">{school.emisCode}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center space-x-6">
                          <div>
                            <p className="text-[20px] font-bold text-text-primary leading-none tracking-tight">{ratio.toFixed(0)}:1</p>
                            <p className="text-[10px] text-text-secondary mt-1 font-medium uppercase tracking-wider">PTR Index</p>
                          </div>
                          <div className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${lightColor}`}>
                            {statusText}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grade & Standard Distribution */}
              <div className="bg-slate-900 text-white p-6 rounded-md shadow-lg space-y-8">
                 <div>
                    <h3 className="text-[13px] font-bold uppercase tracking-wider mb-4 text-slate-400">Professional Grades</h3>
                    <div className="space-y-4">
                        {TEACHING_GRADES.slice().reverse().map(grade => {
                          const count = teachers.filter(t => t.teachingGrade === grade).length;
                          const percentage = (count / (teachers.length || 1)) * 100;
                          return (
                            <div key={grade} className="space-y-1.5">
                              <div className="flex justify-between text-[11px] font-semibold">
                                <span className="text-slate-200">{grade}</span>
                                <span className="text-slate-400">{count} Staff</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-default rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-[13px] font-bold uppercase tracking-wider mb-4 text-slate-400">Standard Allocation</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {['P-Klass', 'Std 1', 'Std 2', 'Std 3', 'Std 4', 'Std 5', 'Std 6', 'Std 7', 'Std 8'].map(std => {
                          const count = teachers.filter(t => t.assignedStandard === (std.startsWith('Std') ? std.replace('Std', 'Standard') : std)).length;
                          return (
                            <div key={std} className="p-2.5 bg-white/5 rounded border border-white/10 hover:border-white/20 transition-all group">
                               <p className="text-[10px] font-bold text-slate-400 mb-1.5 group-hover:text-primary-default transition-colors">{std}</p>
                               <div className="flex items-end justify-between">
                                  <span className="text-[16px] font-bold">{count}</span>
                                  <Users size={12} className="text-white/20 group-hover:text-white/40 transition-colors" />
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'registry' && (
          <motion.div key="registry" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {selectedTeacherId ? (
              <TeacherProfileView 
                teacher={teacherProfile!} 
                school={schools.find(s => s.id === teacherProfile?.schoolId)} 
                onBack={() => setSelectedTeacherId(null)}
                calculateRetirement={calculateRetirement}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 -track-y-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                    <input 
                      type="text"
                      placeholder="Search by TP number, NIN, or name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="erp-input w-full pl-9 h-9 text-[13px]"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <select 
                      value={filterGender}
                      onChange={e => setFilterGender(e.target.value as 'all' | 'M' | 'F')}
                      className="erp-input h-9 min-w-[120px] appearance-none cursor-pointer text-[13px]"
                    >
                      <option value="all">Any Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                    <select 
                      value={filterGrade}
                      onChange={e => setFilterGrade(e.target.value)}
                      className="erp-input h-9 min-w-[120px] appearance-none cursor-pointer text-[13px]"
                    >
                      <option value="all">Any Grade</option>
                      {TEACHING_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={() => setIsNewTeacherModalOpen(true)}
                    className="erp-btn erp-btn-primary h-9 w-full md:w-auto px-5 whitespace-nowrap text-[13px] font-medium"
                  >
                    <Plus size={16} />
                    <span>Enroll Personnel</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.filter(t => {
                    const matchesSearch = t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      t.tpNumber?.includes(searchQuery) ||
                      t.nin.includes(searchQuery);
                    const matchesGender = filterGender === 'all' || t.gender === filterGender;
                    const matchesGrade = filterGrade === 'all' || t.teachingGrade === filterGrade;
                    return matchesSearch && matchesGender && matchesGrade;
                  }).map(teacher => (
                    <TeacherCard 
                      key={teacher.id} 
                      teacher={teacher} 
                      onClick={() => setSelectedTeacherId(teacher.id!)}
                      schoolName={schools.find(s => s.id === teacher.schoolId)?.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeView === 'tcm' && (
          <motion.div key="tcm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="erp-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-gray-50/50">
               <div>
                 <h2 className="text-[16px] font-bold text-text-primary leading-tight">TCM Compliance Portal</h2>
                 <p className="text-[12px] text-text-secondary mt-1">Teaching Council of Malawi verification services</p>
               </div>
               <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                      loading: 'Connecting to TCM Database...',
                      success: 'Batch validation complete. All records current.',
                      error: 'TCM Sync failed'
                    })}
                    className="erp-btn erp-btn-primary h-9 px-5 text-[13px] font-medium"
                  >
                    Bulk Validate
                  </button>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-default bg-gray-50/30 text-text-secondary uppercase text-[10px] font-bold tracking-widest">
                    <th className="erp-table-header px-6 py-3">Personnel / Identifier</th>
                    <th className="erp-table-header px-6 py-3">TCM Registration</th>
                    <th className="erp-table-header px-6 py-3">License Number</th>
                    <th className="erp-table-header px-6 py-3">Standing</th>
                    <th className="erp-table-header px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[13px]">
                  {teachers.map(t => {
                    const isExpired = t.tcmLicenseExpiryDate && new Date(t.tcmLicenseExpiryDate) < new Date();
                    const isLicensed = !!t.tcmLicenseNumber && !isExpired;
                    const statusText = isLicensed ? 'Valid' : isExpired ? 'Expired' : 'Pending';
                    const colorClasses = isLicensed ? 'text-success bg-success/10 border-success/20' : isExpired ? 'text-error bg-error/10 border-error/20' : 'text-warning bg-warning/10 border-warning/20';

                    return (
                      <tr key={t.id} className="erp-table-row">
                        <td className="erp-table-cell px-6 py-3">
                          <p className="font-semibold text-text-primary leading-tight">{t.fullName}</p>
                          <p className="text-[11px] text-text-secondary mt-0.5">{t.tpNumber}</p>
                        </td>
                        <td className="erp-table-cell px-6 py-3 font-mono">{t.tcmRegistrationNumber || '---'}</td>
                        <td className="erp-table-cell px-6 py-3">
                          <div className="font-mono">{t.tcmLicenseNumber || '---'}</div>
                        </td>
                        <td className="erp-table-cell px-6 py-3">
                           <div className={`erp-badge text-[10px] py-0.5 px-2 ${colorClasses}`}>
                             {statusText}
                           </div>
                        </td>
                        <td className="erp-table-cell px-6 py-3 text-right">
                          <button className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-primary-default hover:bg-primary-default/10 rounded transition-all">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeView === 'transfers' && (
          <motion.div key="transfers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="erp-card p-4 bg-white flex items-center space-x-4">
                 <div className="w-10 h-10 rounded bg-primary-default/10 text-primary-default flex items-center justify-center">
                    <ArrowRightLeft size={20} />
                 </div>
                 <div>
                    <p className="text-[20px] font-bold text-text-primary leading-tight">{transfers.length}</p>
                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-tight">Active Requests</p>
                 </div>
              </div>
              <div className="erp-card p-4 bg-white flex items-center space-x-4">
                 <div className="w-10 h-10 rounded bg-success/10 text-success flex items-center justify-center">
                    <CheckCircle size={20} />
                 </div>
                 <div>
                    <p className="text-[20px] font-bold text-text-primary leading-tight">{transfers.filter(t => t.status === 'Completed').length}</p>
                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-tight">Processed This Term</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsTransferModalOpen(true)}
                className="erp-card p-4 border-dashed border-2 border-primary-default/20 bg-primary-default/5 hover:bg-primary-default/10 transition-all flex items-center justify-center space-x-2 text-primary-default font-semibold text-[13px]"
              >
                 <Plus size={16} />
                 <span>New Transfer Request</span>
              </button>
            </div>

            <div className="erp-card overflow-hidden">
               <div className="px-6 py-4 border-b border-border-default bg-gray-50/50">
                  <h3 className="text-[14px] font-bold text-text-primary">Transfer Management Queue</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-border-default bg-gray-50/30 text-text-secondary uppercase text-[10px] font-bold tracking-widest">
                       <th className="erp-table-header px-6 py-3">Personnel</th>
                       <th className="erp-table-header px-6 py-3">Current Station</th>
                       <th className="erp-table-header px-6 py-3">Target Station</th>
                       <th className="erp-table-header px-6 py-3">Priority / Type</th>
                       <th className="erp-table-header px-6 py-3">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 text-[13px]">
                     {transfers.sort((a,b) => b.requestDate.localeCompare(a.requestDate)).map(transfer => {
                       const teacher = teachers.find(t => t.id === transfer.teacherId);
                       const fromSchool = schools.find(s => s.id === transfer.fromSchoolId);
                       const toSchool = schools.find(s => s.id === transfer.toSchoolId);
                       return (
                         <tr key={transfer.id} className="erp-table-row">
                           <td className="erp-table-cell px-6 py-3">
                             <p className="font-semibold text-text-primary leading-tight">{teacher?.fullName || 'Unknown'}</p>
                             <p className="text-[11px] text-text-secondary mt-0.5">{teacher?.tpNumber}</p>
                           </td>
                           <td className="erp-table-cell px-6 py-3 text-text-primary">{fromSchool?.name || '---'}</td>
                           <td className="erp-table-cell px-6 py-3 text-text-primary">{toSchool?.name || '---'}</td>
                           <td className="erp-table-cell px-6 py-3">
                              <span className="font-medium text-text-primary">{transfer.reason}</span>
                              <p className="text-[11px] text-text-secondary mt-0.5">{new Date(transfer.requestDate).toLocaleDateString()}</p>
                           </td>
                           <td className="erp-table-cell px-6 py-3">
                             <div className={`erp-badge text-[10px] py-0.5 px-2 ${
                               transfer.status === 'Completed' ? 'bg-success/10 text-success border-success/20' :
                               transfer.status === 'Rejected' ? 'bg-error/10 text-error border-error/20' :
                               'bg-warning/10 text-warning border-warning/20'
                             }`}>
                               {transfer.status}
                             </div>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeView === 'leaves' && (
          <motion.div key="leaves" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="erp-card p-4 bg-white shadow-sm border border-border-default">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Total Applications</p>
                  <p className="text-[20px] font-bold text-text-primary">{leaves.length}</p>
               </div>
               <div className="erp-card p-4 bg-white shadow-sm border border-border-default">
                  <p className="text-[10px] font-bold text-warning uppercase tracking-wider mb-1">Pending Review</p>
                  <p className="text-[20px] font-bold text-warning">{leaves.filter(l => l.status === 'Pending').length}</p>
               </div>
               <div className="erp-card p-4 bg-white shadow-sm border border-border-default">
                  <p className="text-[10px] font-bold text-success uppercase tracking-wider mb-1">Current Absence</p>
                  <p className="text-[20px] font-bold text-success">{leaves.filter(l => l.status === 'Approved' && new Date(l.endDate) >= new Date()).length}</p>
               </div>
               <button 
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="erp-btn erp-btn-primary h-full justify-center text-[13px] font-medium"
               >
                  <Calendar size={16} />
                  <span>Submit Leave Application</span>
               </button>
            </div>

            <div className="erp-card overflow-hidden">
               <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex items-center justify-between">
                  <h3 className="text-[18px] font-bold text-text-primary">Leave registry & tracking</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-border-default bg-gray-50/30">
                       <th className="erp-table-header px-8 py-4">Personnel</th>
                       <th className="erp-table-header px-8 py-4">Category</th>
                       <th className="erp-table-header px-8 py-4">Duration</th>
                       <th className="erp-table-header px-8 py-4">Status</th>
                       <th className="erp-table-header px-8 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {leaves.sort((a,b) => b.startDate.localeCompare(a.startDate)).map(leave => {
                       const teacher = teachers.find(t => t.id === leave.teacherId);
                       return (
                         <tr key={leave.id} className="erp-table-row">
                           <td className="erp-table-cell px-8 py-5">
                             <p className="text-[14px] font-bold text-text-primary leading-tight">{teacher?.fullName || 'Unknown'}</p>
                             <p className="text-[12px] text-text-secondary mt-1">{teacher?.tpNumber}</p>
                           </td>
                           <td className="erp-table-cell px-8 py-5">
                             <span className="text-[13px] font-medium text-text-primary uppercase tracking-tight">{leave.type}</span>
                             <p className="text-[11px] text-text-secondary font-bold mt-1 uppercase tracking-wider truncate max-w-[200px]">{leave.reason}</p>
                           </td>
                           <td className="erp-table-cell px-8 py-5">
                             <div className="flex items-center space-x-3">
                                <div className="text-right">
                                   <p className="text-[13px] font-bold text-text-primary">{new Date(leave.startDate).toLocaleDateString()}</p>
                                   <p className="text-[10px] font-bold text-text-secondary uppercase">From</p>
                                </div>
                                <ArrowRight size={14} className="text-gray-300" />
                                <div>
                                   <p className="text-[13px] font-bold text-text-primary">{new Date(leave.endDate).toLocaleDateString()}</p>
                                   <p className="text-[10px] font-bold text-text-secondary uppercase">To</p>
                                </div>
                             </div>
                           </td>
                           <td className="erp-table-cell px-8 py-5">
                             <div className={`erp-badge ${
                               leave.status === 'Approved' ? 'bg-success/10 text-success border-success/20' :
                               leave.status === 'Rejected' ? 'bg-error/10 text-error border-error/20' :
                               'bg-warning/10 text-warning border-warning/20'
                             }`}>
                               {leave.status}
                             </div>
                           </td>
                           <td className="erp-table-cell px-8 py-5 text-right">
                             <button className="text-[11px] font-bold text-primary-default hover:underline">Download cert</button>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeView === 'tools' && (
          <motion.div key="tools" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard 
               title="Retirement Calculator" 
               description="Automated projection of personnel retirement dates based on statutory guidelines and age profiles."
               icon={Calculator}
               color="bg-slate-700"
            />
            <ToolCard 
               title="Staffing Audit" 
               description="Comprehensive verification of deployment status across all schools to identify anomalies."
               icon={ShieldCheck}
               color="bg-primary-default"
               onClick={() => setIsStaffingReportOpen(true)}
            />
            <ToolCard 
               title="Payroll Sync" 
               description="Maintain consistency between MSCE personnel records and national payroll data structures."
               icon={CreditCard}
               color="bg-emerald-600"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isNewTeacherModalOpen && (
          <Modal title="Teacher enrollment" onClose={() => setIsNewTeacherModalOpen(false)}>
            <form onSubmit={handleAddTeacher} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormItem label="Full name">
                  <input type="text" required value={teacherForm.fullName} onChange={e => setTeacherForm({...teacherForm, fullName: e.target.value})} className="erp-input w-full h-11" placeholder="Firstname Lastname" />
                </FormItem>
                <FormItem label="National ID (NIN)">
                  <input type="text" required value={teacherForm.nin} onChange={e => setTeacherForm({...teacherForm, nin: e.target.value})} className="erp-input w-full h-11 uppercase" placeholder="E.g. ZW-00-00-00" />
                </FormItem>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormItem label="Gender">
                  <select value={teacherForm.gender} onChange={e => setTeacherForm({...teacherForm, gender: e.target.value as 'M' | 'F'})} className="erp-input w-full h-11">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </FormItem>
                <FormItem label="Teaching grade">
                  <select value={teacherForm.teachingGrade} onChange={e => setTeacherForm({...teacherForm, teachingGrade: e.target.value as Teacher['teachingGrade']})} className="erp-input w-full h-11">
                    {TEACHING_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </FormItem>
                <FormItem label="Assigned level">
                  <select value={teacherForm.assignedStandard} onChange={e => setTeacherForm({...teacherForm, assignedStandard: e.target.value})} className="erp-input w-full h-11">
                    {['P-Klass', 'Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7', 'Standard 8'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormItem>
              </div>
              <FormItem label="Primary duty station">
                <select required value={teacherForm.schoolId} onChange={e => setTeacherForm({...teacherForm, schoolId: Number(e.target.value)})} className="erp-input w-full h-11">
                  <option value="">Select institution</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </FormItem>
              <div className="pt-4">
                <button type="submit" className="erp-btn erp-btn-primary w-full h-12 text-[14px]">
                  Complete registration
                </button>
              </div>
            </form>
          </Modal>
        )}

        {isTransferModalOpen && (
          <Modal title="Initiate transfer" onClose={() => setIsTransferModalOpen(false)}>
            <form onSubmit={handleInitiateTransfer} className="space-y-6">
              <FormItem label="Select personnel">
                <select required value={transferForm.teacherId} onChange={e => setTransferForm({...transferForm, teacherId: Number(e.target.value)})} className="erp-input w-full h-11">
                  <option value="">Select teacher...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName} ({t.tpNumber})</option>)}
                </select>
              </FormItem>
              <FormItem label="Destination station">
                <select required value={transferForm.destinationSchoolId} onChange={e => setTransferForm({...transferForm, destinationSchoolId: Number(e.target.value)})} className="erp-input w-full h-11">
                  <option value="">Select target institution...</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </FormItem>
              <FormItem label="Reason for deployment change">
                <textarea 
                  value={transferForm.reason} 
                  onChange={e => setTransferForm({...transferForm, reason: e.target.value})} 
                  className="erp-input w-full min-h-[100px] py-3" 
                  placeholder="Briefly explain the rationale for this deployment change..."
                ></textarea>
              </FormItem>
              <div className="pt-4">
                <button type="submit" className="erp-btn erp-btn-primary w-full h-12">Submit request</button>
              </div>
            </form>
          </Modal>
        )}

        {isLeaveModalOpen && (
          <Modal title="Apply for leave" onClose={() => setIsLeaveModalOpen(false)}>
            <form onSubmit={handleApplyLeave} className="space-y-6">
              <FormItem label="Select personnel">
                <select required value={leaveForm.teacherId} onChange={e => setLeaveForm({...leaveForm, teacherId: Number(e.target.value)})} className="erp-input w-full h-11">
                  <option value="">Select teacher...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
              </FormItem>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormItem label="Leave type">
                  <select value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value as TeacherLeave['type']})} className="erp-input w-full h-11">
                    {LEAVE_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </FormItem>
                <FormItem label="Start date">
                  <input type="date" required value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} className="erp-input w-full h-11" />
                </FormItem>
                <FormItem label="End date">
                  <input type="date" required value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} className="erp-input w-full h-11" />
                </FormItem>
              </div>
              
              {leaveForm.type === 'Study' && (
                <div className="bg-gray-50 p-6 rounded-[8px] border border-border-default space-y-4">
                  <p className="text-[11px] font-bold text-primary-default uppercase tracking-wider">Study leave specialization</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormItem label="Institution name">
                      <input type="text" value={leaveForm.collegeName} onChange={e => setLeaveForm({...leaveForm, collegeName: e.target.value})} className="erp-input w-full h-11 bg-white" placeholder="e.g. University of Malawi" />
                    </FormItem>
                    <FormItem label="Course of study">
                      <input type="text" value={leaveForm.courseOfStudy} onChange={e => setLeaveForm({...leaveForm, courseOfStudy: e.target.value})} className="erp-input w-full h-11 bg-white" placeholder="e.g. MA in Education" />
                    </FormItem>
                  </div>
                </div>
              )}

              <FormItem label="Additional comments">
                <textarea 
                  value={leaveForm.reason} 
                  onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} 
                  className="erp-input w-full min-h-[80px] py-3" 
                  placeholder="Provide any additional context for the approving officer..."
                ></textarea>
              </FormItem>
              <div className="pt-4">
                <button type="submit" className="erp-btn erp-btn-primary w-full h-12">Process deployment status</button>
              </div>
            </form>
          </Modal>
        )}

        {isStaffingReportOpen && (
          <Modal title="Staffing intelligence report" onClose={() => setIsStaffingReportOpen(false)}>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                 <div className="p-4 bg-gray-50 rounded-[8px] border border-border-default">
                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Optimal stations</p>
                    <p className="text-[24px] font-black text-success leading-none">{schools.filter(s => (learners.filter(l => l.schoolId === s.id).length / (teachers.filter(t => t.schoolId === s.id).length || 1)) <= 40).length}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-[8px] border border-border-default">
                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Understaffed</p>
                    <p className="text-[24px] font-black text-error leading-none">{schools.filter(s => (learners.filter(l => l.schoolId === s.id).length / (teachers.filter(t => t.schoolId === s.id).length || 1)) > 40).length}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-[8px] border border-border-default">
                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Target PTR</p>
                    <p className="text-[24px] font-black text-primary-default leading-none">40:1</p>
                 </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto pr-2 divide-y divide-gray-100 border border-border-default rounded-[8px] overflow-hidden">
                {schools.map(school => {
                  const sTeachers = teachers.filter(t => t.schoolId === school.id).length;
                  const sLearners = learners.filter(l => l.schoolId === school.id).length;
                  const ratio = sLearners / (sTeachers || 1);
                  return (
                    <div key={school.id} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-[14px] font-bold text-text-primary">{school.name}</p>
                        <p className="text-[11px] font-medium text-text-secondary mt-1">{sTeachers} teachers | {sLearners} learners</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[18px] font-bold ${ratio > 40 ? 'text-error' : 'text-success'}`}>{ratio.toFixed(1)}:1</p>
                        <p className="text-[10px] font-bold text-text-secondary uppercase">PTR</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white rounded-md shadow-2xl w-full max-w-xl overflow-hidden border border-border-default"
    >
      <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[18px] font-bold tracking-tight">{title}</h3>
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest leading-none">Institutional Module Context</p>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors text-white"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-8">
        {children}
      </div>
    </motion.div>
  </div>
);

const FormItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">{label}</label>
    {children}
  </div>
);

const TeacherCard = ({ teacher, onClick, schoolName }: { teacher: Teacher, onClick: () => void, schoolName?: string }) => (
  <div onClick={onClick} className="erp-card p-6 hover:border-primary-default transition-all group flex flex-col h-full bg-white cursor-pointer shadow-sm">
    <div className="flex items-start justify-between mb-6">
       <div className={`w-12 h-12 rounded flex items-center justify-center ${teacher.gender === 'F' ? 'bg-error/5 text-error border border-error/10' : 'bg-primary-default/5 text-primary-default border border-primary-default/10'}`}>
          <User size={24} />
       </div>
       <div className="text-right">
          <span className={`erp-badge uppercase text-[9px] tracking-widest px-2.5 py-0.5 border ${teacher.status === 'Active' ? 'bg-success/5 text-success border-success/20' : 'bg-warning/5 text-warning border-warning/20'}`}>
             {teacher.status}
          </span>
       </div>
    </div>
    <div className="space-y-1.5 flex-grow">
       <h4 className="text-[16px] font-bold text-text-primary tracking-tight group-hover:text-primary-default transition-colors">{teacher.fullName}</h4>
       <div className="flex items-center space-x-2 text-text-secondary">
          <MapPin size={12} className="shrink-0 opacity-60" />
          <span className="text-[12px] font-medium truncate">{schoolName || 'Unassigned Station'}</span>
       </div>
    </div>
    <div className="mt-6 pt-4 border-t border-border-default grid grid-cols-2 gap-4">
       <div>
          <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 opacity-60">TP Number</p>
          <p className="text-[13px] font-mono font-semibold text-text-primary tracking-tight">{teacher.tpNumber || '---'}</p>
       </div>
       <div className="text-right">
          <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 opacity-60">Grade</p>
          <p className="text-[13px] font-bold text-primary-default tracking-tight">{teacher.teachingGrade}</p>
       </div>
    </div>
  </div>
);

const TeacherProfileView = ({ teacher, school, onBack, calculateRetirement }: { teacher: Teacher, school?: School, onBack: () => void, calculateRetirement: (dob: string) => string }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
     <button onClick={onBack} className="flex items-center space-x-2 text-text-secondary hover:text-text-primary font-bold text-[11px] uppercase tracking-wider transition-all group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        <span>Personnel Registry</span>
     </button>

     <div className="erp-card bg-white overflow-hidden shadow-md">
        <div className="bg-slate-900 px-8 py-10 flex flex-col lg:flex-row items-center gap-8 text-white relative">
           <div className="shrink-0 relative z-10">
              <div className="w-32 h-32 bg-white/5 backdrop-blur-md rounded-lg flex items-center justify-center text-white/20 border border-white/10 shadow-inner">
                 <User size={80} strokeWidth={1} />
              </div>
           </div>
           <div className="flex-1 text-center lg:text-left relative z-10">
              <h2 className="text-[28px] font-bold text-white tracking-tight leading-none">{teacher.fullName}</h2>
              <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                 <span className="px-3 py-1 bg-primary-default text-white rounded text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {teacher.teachingGrade}
                 </span>
                 <span className="px-3 py-1 bg-white/10 text-white rounded text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {teacher.tpNumber}
                 </span>
                 <span className="px-3 py-1 bg-emerald-500/20 text-emerald-100 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                    Active Personnel
                 </span>
              </div>
           </div>
           <div className="flex flex-col gap-2.5 shrink-0 relative z-10 w-full lg:w-48">
              <button 
                onClick={() => toast.info('Generating Secure Digital Personnel Identity...')}
                className="erp-btn bg-white text-slate-900 border-none hover:bg-gray-100 font-bold text-[12px] uppercase tracking-wider h-10 shadow-sm"
              >
                Digital ID
              </button>
              <button 
                onClick={() => toast.info('Edit mode enabled for: ' + (teacher?.fullName || 'Personnel'))}
                className="erp-btn bg-white/10 text-white border border-white/20 hover:bg-white/20 font-bold text-[12px] uppercase tracking-wider h-10"
              >
                Modify Profile
              </button>
           </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <ProfileGroup label="Identification & Milestones">
                <ProfileItem label="National ID (NIN)" value={teacher.nin} mono />
                <ProfileItem label="Employment No (TP)" value={teacher.tpNumber} mono />
                <ProfileItem label="MoE Reg Number" value={teacher.registrationNumber || 'Pending'} />
                <ProfileItem label="Retirement Target" value={calculateRetirement(teacher.dateOfBirth)} color="text-error" />
            </ProfileGroup>

            <ProfileGroup label="Duty Station Assignment">
                <ProfileItem label="Current Duty Station" value={school?.name || 'Not assigned'} />
                <ProfileItem label="Assigned Level" value={teacher.assignedStandard || 'Unspecified'} />
                <ProfileItem label="EMIS Code" value={school?.emisCode || 'N/A'} mono />
                <ProfileItem label="Responsibility" value={teacher.responsibility || 'Class Teacher'} />
            </ProfileGroup>

            <ProfileGroup label="Academic & Professional">
                <ProfileItem label="Highest Qualification" value={teacher.highestQualification} />
                <ProfileItem label="Specialization" value={teacher.specialization || 'General Studies'} />
                <ProfileItem label="1st Appointment" value={teacher.dateOfFirstAppointment || '---'} />
                <ProfileItem label="Grade Seniority" value={teacher.dateOfAppointmentToCurrentGrade || '---'} />
            </ProfileGroup>

            <div className="bg-emerald-50 p-6 rounded border border-emerald-100 space-y-6">
              <ProfileGroup label="Legal & TCM Compliance">
                  <ProfileItem label="TCM Reg Number" value={teacher.tcmRegistrationNumber || 'Pending'} />
                  <ProfileItem label="License Number" value={teacher.tcmLicenseNumber || 'Not issued'} color={teacher.tcmLicenseNumber ? 'text-success font-bold' : 'text-warning font-bold'} />
                  <ProfileItem label="License Expiry" value={teacher.tcmLicenseExpiryDate || 'N/A'} />
                  <div className="pt-1 flex items-center space-x-2 text-emerald-700">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                          Compliance Verified
                      </span>
                  </div>
              </ProfileGroup>
            </div>
        </div>
     </div>
  </motion.div>
);

const ProfileGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="space-y-6">
     <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em] pl-3 border-l-4 border-slate-900 leading-none">{label}</h4>
     <div className="space-y-5">
        {children}
     </div>
  </div>
);

const ProfileItem = ({ label, value, mono, color }: { label: string, value?: string, mono?: boolean, color?: string }) => (
  <div>
     <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 opacity-60">{label}</p>
     <p className={`text-[15px] font-bold tracking-tight ${color || 'text-text-primary'} ${mono ? 'font-mono' : ''}`}>
        {value || '---'}
     </p>
  </div>
);

const ToolCard = ({ title, description, icon: Icon, color, onClick }: { title: string, description: string, icon: React.ComponentType<{ size?: number | string }>, color: string, onClick?: () => void }) => (
  <div onClick={onClick} className="erp-card p-8 hover:border-primary-default transition-all group flex flex-col h-full bg-white cursor-pointer shadow-sm">
     <div className={`w-12 h-12 rounded ${color} text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`}>
        <Icon size={24} />
     </div>
     <h3 className="text-[18px] font-bold text-text-primary leading-tight mb-2.5 group-hover:text-primary-default transition-colors">{title}</h3>
     <p className="text-[13px] text-text-secondary leading-relaxed flex-grow">{description}</p>
     <div className="mt-6 flex items-center space-x-2 text-primary-default text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
        <span>Launch Module</span>
        <ChevronRight size={14} />
     </div>
  </div>
);

export default TeacherRegistry;
