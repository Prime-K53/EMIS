
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDebounce } from '../services/useDebounce';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Download, 
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { db } from '../db';
import { Learner } from '../types';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    transferred: 'bg-amber-50 text-amber-700 border-amber-100',
    promoted: 'bg-blue-50 text-blue-700 border-blue-100'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status as keyof typeof styles] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
      {status}
    </span>
  );
};

const LearnerRegistry: React.FC = () => {
  const learners = useLiveQuery(() => db.learners.orderBy('id').reverse().toArray());
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterClass, setFilterClass] = useState('All Standards');

  const filteredLearners = useMemo(() => {
    if (!learners) return [];
    return learners.filter((l) => {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = 
        l.firstName.toLowerCase().includes(searchLower) || 
        l.surname.toLowerCase().includes(searchLower) || 
        l.lin.toLowerCase().includes(searchLower) || 
        (l.nin && l.nin.toLowerCase().includes(searchLower));
      
      const matchesClass = filterClass === 'All Standards' || l.class === filterClass;
      
      return matchesSearch && matchesClass;
    });
  }, [learners, searchQuery, filterClass]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLearnerId, setEditingLearnerId] = useState<number | null>(null);
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [hasNin, setHasNin] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [newLearner, setNewLearner] = useState<Partial<Learner>>({
    firstName: '',
    surname: '',
    nin: '',
    gender: 'M',
    class: 'Standard 1',
    status: 'active',
    nationality: 'Malawi',
    isRefugee: false,
    parentDetails: {
      relationship: 'Parent',
      name: '',
      phone: ''
    }
  });

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingLearnerId(null);
    setRegStep(1);
    setHasNin(null);
    setIsVerified(false);
    setNewLearner({
      firstName: '',
      surname: '',
      nin: '',
      gender: 'M',
      class: 'Standard 1',
      status: 'active',
      nationality: 'Malawi',
      isRefugee: false,
      parentDetails: { relationship: 'Parent', name: '', phone: '' }
    });
  };

  const handleVerifyNin = () => {
    if (!newLearner.nin) return;
    setIsVerifying(true);
    // Simulate NIRA verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      // Mock data fill from NIRA
      setNewLearner(prev => ({
        ...prev,
        firstName: 'Sam',
        surname: 'Katungi',
        gender: 'M',
        dateOfBirth: '2018-05-12'
      }));
    }, 1500);
  };

  const handleExport = () => {
    if (!filteredLearners.length) {
      toast.error('No records to export');
      return;
    }
    
    const headers = ['LIN', 'NIN', 'Surname', 'First Name', 'Gender', 'Class', 'Date of Birth', 'Nationality', 'Status', 'SNE'];
    const rows = filteredLearners.map(l => [
      l.lin || '', l.nin || '', l.surname, l.firstName, l.gender, l.class,
      l.dateOfBirth, l.nationality, l.status, l.isSNE ? 'Yes' : 'No'
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learner_registry_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredLearners.length} learner records`);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLearnerId) {
      const { talents, ...safeUpdate } = newLearner;
      await db.learners.update(editingLearnerId, {
        ...safeUpdate,
        talents: talents || []
      });
      await db.auditLogs.add({
        schoolId: newLearner.schoolId || 1,
        action: 'update',
        content: `Updated learner: ${newLearner.firstName} ${newLearner.surname}`,
        performedBy: 'Administrator',
        timestamp: Date.now()
      });
      toast.success('Learner record updated');
    } else {
      const mockLin = `U${Math.floor(Math.random() * 99)}M${Math.floor(Math.random() * 9999)}A00${Math.floor(Math.random() * 1000)}`;
      await db.learners.add({
        ...newLearner,
        lin: mockLin,
        createdAt: Date.now()
      } as Learner);
      await db.auditLogs.add({
        schoolId: newLearner.schoolId || 1,
        action: 'create',
        content: `Enrolled learner: ${newLearner.firstName} ${newLearner.surname}`,
        performedBy: 'Administrator',
        timestamp: Date.now()
      });
      toast.success('Learner enrollment complete');
    }
    
    resetForm();
  };

  const handleDelete = async (id?: number) => {
    if (id && window.confirm('Are you sure you want to delete this learner record?')) {
      try {
        const learner = learners?.find(l => l.id === id);
        await db.learners.delete(id);
        if (learner) {
          await db.auditLogs.add({
            schoolId: learner.schoolId || 1,
            action: 'delete',
            content: `Deleted learner: ${learner.firstName} ${learner.surname} (${learner.lin})`,
            performedBy: 'Administrator',
            timestamp: Date.now()
          });
        }
        toast.success('Learner record deleted');
      } catch (error) {
        console.error("EMIS: Failed to delete learner record", error);
        toast.error('Failed to delete learner record');
      }
    }
  };

  const handleEdit = (learner: Learner) => {
    setNewLearner({
      firstName: learner.firstName,
      surname: learner.surname,
      nin: learner.nin || '',
      gender: learner.gender,
      class: learner.class,
      status: learner.status,
      nationality: learner.nationality,
      dateOfBirth: learner.dateOfBirth,
      isSNE: learner.isSNE,
      sneCategory: learner.sneCategory,
      isRefugee: learner.isRefugee,
      isOrphan: learner.isOrphan,
      parentDetails: learner.parentDetails,
      familiarLanguage: learner.familiarLanguage,
      talents: learner.talents,
      schoolId: learner.schoolId
    });
    setEditingLearnerId(learner.id!);
    setHasNin(learner.nin ? true : null);
    setIsVerified(!!learner.nin);
    setRegStep(2);
    setIsModalOpen(true);
  };

  if (!learners) return <div className="p-12 text-center text-text-secondary">Synchronizing records...</div>;

  return (
    <div className="erp-container py-6 space-y-6 animate-in-fade">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">Learner Registry</h1>
          <p className="text-[12px] text-text-secondary">National identification database for primary education enrollment</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="erp-btn erp-btn-secondary h-9 px-4 text-[13px] font-medium"
          >
            <Download size={14} />
            <span>Export Registry</span>
          </button>
          <button 
            onClick={() => { setEditingLearnerId(null); setIsModalOpen(true); }}
            className="erp-btn erp-btn-primary h-9 px-5 text-[13px] font-medium shadow-sm"
          >
            <Plus size={14} />
            <span>New Enrollment</span>
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="erp-card p-3 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search by LIN/NIN or Name" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="erp-input w-full pl-9 h-9 text-[13px]"
            />
          </div>
          <div className="h-6 w-px bg-border-default hidden md:block"></div>
          <div className="relative">
            <select 
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="erp-input h-9 min-w-[160px] pr-8 text-[13px] appearance-none cursor-pointer"
            >
              <option>All Standards</option>
              {['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7', 'Standard 8'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-text-secondary pointer-events-none" />
          </div>
        </div>

        <div className="erp-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border-default text-text-secondary uppercase text-[10px] font-bold tracking-widest">
                <th className="erp-table-header px-6 py-3">Full Name & Bio</th>
                <th className="erp-table-header px-6 py-3">Identifiers (LIN/NIN)</th>
                <th className="erp-table-header px-6 py-3 text-center">Level</th>
                <th className="erp-table-header px-6 py-3 text-center">Status</th>
                <th className="erp-table-header px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLearners.map((learner) => (
                <tr key={learner.id} className="erp-table-row group">
                  <td className="erp-table-cell px-6 py-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center text-text-secondary text-[12px] font-bold border border-border-default transition-all group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900">
                        {learner.surname[0]}{learner.firstName[0]}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-text-primary leading-tight">{learner.surname} {learner.firstName}</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">DOB: {new Date(learner.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="erp-table-cell px-6 py-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-bold text-primary-default bg-primary-default/5 px-1.5 py-0.5 rounded border border-primary-default/20 uppercase tracking-tight">LIN</span>
                        <span className="text-[13px] font-mono text-text-primary">{learner.lin}</span>
                      </div>
                      {learner.nin && (
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] font-bold text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded border border-border-default uppercase tracking-tight">NIN</span>
                          <span className="text-[13px] font-mono text-text-secondary">{learner.nin}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="erp-table-cell px-6 py-3 text-center">
                    <div className="space-y-0.5">
                       <div className="text-[13px] font-semibold text-text-primary">{learner.class}</div>
                        <div className="text-[11px] text-text-secondary">{learner.gender === 'M' ? 'Male' : 'Female'} • {learner.nationality}</div>
                    </div>
                  </td>
                  <td className="erp-table-cell px-6 py-3 text-center">
                    <StatusBadge status={learner.status} />
                  </td>
                  <td className="erp-table-cell px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        onClick={() => handleEdit(learner)}
                        className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-primary-default hover:bg-primary-default/10 rounded transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(learner.id)}
                        className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-error hover:bg-error/10 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLearners.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-gray-50 border border-border-default rounded flex items-center justify-center mx-auto mb-3">
                 <AlertCircle className="text-text-secondary opacity-30" size={24} />
              </div>
              <h3 className="text-[14px] font-semibold text-text-primary">No learners matched your criteria</h3>
              <p className="text-[13px] text-text-secondary mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-t border-border-default bg-gray-50/50">
          <p className="text-[12px] text-text-secondary font-medium">{Math.ceil(filteredLearners.length / 10)} Pages total</p>
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 flex items-center justify-center border border-border-default rounded hover:bg-gray-100 disabled:opacity-30 transition-colors" disabled>
              <ChevronLeft size={14} />
            </button>
            <div className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded text-[12px] font-bold">1</div>
            <button className="w-8 h-8 flex items-center justify-center border border-border-default rounded hover:bg-gray-100 disabled:opacity-30 transition-colors" disabled>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-xl overflow-hidden border border-border-default">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-[18px] font-bold tracking-tight">{editingLearnerId ? 'Edit Learner' : 'Learner Enrollment'}</h3>
                <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest leading-none">{editingLearnerId ? 'Update existing learner record' : 'Primary baseline registry protocol v3.4'}</p>
              </div>
              <button 
                onClick={resetForm} 
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step 1: NIN Choice & Validation */}
            {regStep === 1 && (
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Identification Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setHasNin(true)}
                      className={`p-6 rounded-md border-2 transition-all text-left flex flex-col justify-between h-36 group ${
                        hasNin === true ? 'border-primary-default bg-primary-default/5 shadow-inner' : 'border-border-default hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <CheckCircle2 className={`transition-all ${hasNin === true ? 'text-primary-default scale-110' : 'text-gray-300'}`} size={24} />
                      <div>
                         <span className="font-bold text-text-primary text-[14px] block leading-tight">National Identity (NIN)</span>
                         <p className="text-[11px] text-text-secondary mt-1">Automatic profile synchronization</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => { setHasNin(false); setIsVerified(false); }}
                      className={`p-6 rounded-md border-2 transition-all text-left flex flex-col justify-between h-36 group ${
                        hasNin === false ? 'border-warning bg-warning/5 shadow-inner' : 'border-border-default hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <AlertCircle className={`transition-all ${hasNin === false ? 'text-warning scale-110' : 'text-gray-300'}`} size={24} />
                      <div>
                         <span className="font-bold text-text-primary text-[14px] block leading-tight">Provisional Registry</span>
                         <p className="text-[11px] text-text-secondary mt-1">Learners without valid National ID</p>
                      </div>
                    </button>
                  </div>
                </div>

                {hasNin === true && (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                     <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">NIRA Database Entry</label>
                     <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={newLearner.nin}
                         onChange={(e) => setNewLearner({...newLearner, nin: e.target.value})}
                         className="flex-1 erp-input h-10 font-mono text-[16px] font-bold"
                         placeholder="CM000000000000"
                       />
                       <button 
                         onClick={handleVerifyNin}
                         disabled={isVerifying || !newLearner.nin}
                         className="erp-btn erp-btn-primary h-10 px-4 disabled:opacity-50 text-[13px]"
                       >
                         {isVerifying ? 'Validing...' : 'Verify NIN'}
                       </button>
                     </div>
                    {isVerified && (
                      <div className="p-3 bg-success/5 border border-success/10 rounded flex items-center space-x-3 text-success">
                        <CheckCircle2 size={18} />
                        <div className="space-y-0.5">
                           <p className="text-[13px] font-bold">Identity Confirmed</p>
                           <p className="text-[11px] font-medium opacity-80">NIRA synchronization complete.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {hasNin === false && (
                  <div className="p-6 bg-warning/5 rounded-md border border-warning/10 flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                       <h4 className="text-[14px] font-bold text-text-primary">Refugee or Foreign National?</h4>
                       <p className="text-[12px] text-text-secondary max-w-[300px]">Specific registration protocols apply.</p>
                    </div>
                    <button 
                       onClick={() => setNewLearner({...newLearner, isRefugee: !newLearner.isRefugee})}
                       className={`w-10 h-5 rounded-full transition-all relative ${newLearner.isRefugee ? 'bg-warning' : 'bg-gray-300'}`}
                    >
                       <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${newLearner.isRefugee ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                )}

                <div className="flex justify-end pt-6 border-t border-border-default">
                  <button 
                    onClick={() => setRegStep(2)}
                    disabled={hasNin === null || (hasNin === true && !isVerified)}
                    className="erp-btn erp-btn-primary h-10 px-6 disabled:opacity-50 text-[13px] font-medium"
                  >
                    <span>Enrollment Details</span>
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Extended Details */}
            {regStep === 2 && (
              <form onSubmit={handleRegister} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-5">
                   <h4 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider pl-3 border-l-4 border-primary-default">Personal Information</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <label className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Surname</label>
                       <input 
                         type="text" 
                         value={newLearner.surname}
                         onChange={(e) => setNewLearner({...newLearner, surname: e.target.value})}
                         readOnly={isVerified}
                         className={`erp-input h-10 w-full text-[13px] font-semibold ${isVerified ? 'bg-gray-50 text-text-secondary pointer-events-none' : 'bg-white'}`}
                         required
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Given Names</label>
                       <input 
                         type="text" 
                         value={newLearner.firstName}
                         onChange={(e) => setNewLearner({...newLearner, firstName: e.target.value})}
                         readOnly={isVerified}
                         className={`erp-input h-10 w-full text-[13px] font-semibold ${isVerified ? 'bg-gray-50 text-text-secondary pointer-events-none' : 'bg-white'}`}
                         required
                       />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <label className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Standard</label>
                       <select 
                         value={newLearner.class}
                         onChange={(e) => setNewLearner({...newLearner, class: e.target.value})}
                         className="erp-input h-10 w-full text-[13px] font-semibold"
                       >
                         {['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7', 'Standard 8'].map(s => (
                            <option key={s}>{s}</option>
                         ))}
                       </select>
                     </div>
                     <div className="space-y-1">
                       <label className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Date of Birth</label>
                       <input 
                         type="date" 
                         value={newLearner.dateOfBirth}
                         onChange={(e) => setNewLearner({...newLearner, dateOfBirth: e.target.value})}
                         className="erp-input h-10 w-full text-[13px] font-semibold"
                         required
                       />
                     </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-border-default space-y-4">
                  <h4 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider pl-3 border-l-4 border-gray-300">Secondary Profiling</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Instruction Language</label>
                      <input 
                        type="text" 
                        value={newLearner.familiarLanguage}
                        onChange={(e) => setNewLearner({...newLearner, familiarLanguage: e.target.value})}
                        className="erp-input h-10 w-full text-[13px] font-semibold"
                        placeholder="e.g. Chichewa, Tumbuka"
                      />
                    </div>
                    <div className="space-y-1 pt-5">
                      <label className="flex items-center justify-between cursor-pointer p-2.5 rounded bg-gray-50 border border-border-default hover:bg-white transition-all">
                         <span className="text-[12px] font-semibold text-text-primary">Special Protection</span>
                         <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-primary-default border-border-default focus:ring-primary-default" 
                          checked={newLearner.isOrphan}
                          onChange={(e) => setNewLearner({...newLearner, isOrphan: e.target.checked})}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Talents / Skills</label>
                    <input 
                      type="text" 
                      className="erp-input h-10 w-full text-[13px] font-semibold"
                      placeholder="List skills separated by commas..."
                      onChange={(e) => setNewLearner({...newLearner, talents: e.target.value.split(',').map(s => s.trim())})}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border-default space-y-4">
                  <h4 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider pl-3 border-l-4 border-gray-300">Guardianship</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Full Guardian Name</label>
                      <input 
                        type="text" 
                        className="erp-input h-10 w-full text-[13px] font-semibold"
                        required
                        onChange={(e) => setNewLearner({
                          ...newLearner, 
                          parentDetails: { ...newLearner.parentDetails!, name: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-primary uppercase tracking-tight">Contact Phone</label>
                      <input 
                        type="tel" 
                        className="erp-input h-10 w-full text-[13px] font-semibold"
                        required
                        placeholder="+265..."
                        onChange={(e) => setNewLearner({
                          ...newLearner, 
                          parentDetails: { ...newLearner.parentDetails!, phone: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-border-default">
                  <button 
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="erp-btn erp-btn-secondary h-10 px-6 text-[13px] font-medium"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    <span>Previous</span>
                  </button>
                  <button 
                    type="submit"
                    className="erp-btn erp-btn-primary h-10 px-10 text-[13px] font-medium shadow-md"
                  >
                    {editingLearnerId ? 'Update Learner' : 'Enroll Learner'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerRegistry;
