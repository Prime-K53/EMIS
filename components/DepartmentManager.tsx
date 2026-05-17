
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, Trash2, Users, UserCheck, Briefcase, X, Save } from 'lucide-react';
import { db } from '../db';
import { Department } from '../types';

const DepartmentManager: React.FC = () => {
  const departments = useLiveQuery(() => db.departments.toArray()) || [];
  const teachers = useLiveQuery(() => db.teachers.toArray()) || [];
  const schools = useLiveQuery(() => db.schools.toArray()) || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDeptId, setEditDeptId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{ name: string; executiveMembers: { teacherId: number; role: string }[]; boardMembers: { teacherId: number; role: string }[] }>({
    name: '',
    executiveMembers: [],
    boardMembers: []
  });
  const [activeMemberTab, setActiveMemberTab] = useState<'executive' | 'board'>('executive');

  const filteredDepartments = useMemo(() => {
    if (!searchQuery) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(d => d.name.toLowerCase().includes(q));
  }, [departments, searchQuery]);

  const availableTeachers = useMemo(() => {
    const usedIds = new Set<number>();
    formData.executiveMembers.forEach(m => usedIds.add(m.teacherId));
    formData.boardMembers.forEach(m => usedIds.add(m.teacherId));
    return teachers.filter(t => !usedIds.has(t.id!));
  }, [teachers, formData.executiveMembers, formData.boardMembers]);

  const handleOpenAdd = () => {
    setEditDeptId(null);
    setFormData({ name: '', executiveMembers: [], boardMembers: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditDeptId(dept.id!);
    setFormData({
      name: dept.name,
      executiveMembers: [...(dept.executiveMembers || [])],
      boardMembers: [...(dept.boardMembers || [])]
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    const data = {
      name: formData.name.trim(),
      executiveMembers: formData.executiveMembers,
      boardMembers: formData.boardMembers,
      createdAt: Date.now()
    };

    if (editDeptId) {
      await db.departments.update(editDeptId, data as any);
      toast.success('Department updated');
    } else {
      await db.departments.add(data as Department);
      toast.success('Department created');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this department?')) {
      await db.departments.delete(id);
      toast.success('Department deleted');
    }
  };

  const addMember = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    const member = { teacherId, role: '' };
    if (activeMemberTab === 'executive') {
      setFormData({ ...formData, executiveMembers: [...formData.executiveMembers, member] });
    } else {
      setFormData({ ...formData, boardMembers: [...formData.boardMembers, member] });
    }
  };

  const removeMember = (type: 'executive' | 'board', idx: number) => {
    if (type === 'executive') {
      setFormData({ ...formData, executiveMembers: formData.executiveMembers.filter((_, i) => i !== idx) });
    } else {
      setFormData({ ...formData, boardMembers: formData.boardMembers.filter((_, i) => i !== idx) });
    }
  };

  const updateMemberRole = (type: 'executive' | 'board', idx: number, role: string) => {
    if (type === 'executive') {
      const next = [...formData.executiveMembers];
      next[idx] = { ...next[idx], role };
      setFormData({ ...formData, executiveMembers: next });
    } else {
      const next = [...formData.boardMembers];
      next[idx] = { ...next[idx], role };
      setFormData({ ...formData, boardMembers: next });
    }
  };

  return (
    <div className="erp-container py-6 space-y-6 animate-in-fade">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-default">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded flex items-center justify-center shadow-md">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-tight">Department Management</h1>
            <p className="text-[12px] text-text-secondary">Manage departments, executive committees, and board members</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="erp-btn erp-btn-primary h-9 px-4 text-[13px] font-medium"
        >
          <Plus size={14} />
          <span>Add Department</span>
        </button>
      </header>

      <div className="erp-card p-3 flex items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="erp-input w-full pl-9 h-9 text-[13px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map(dept => (
          <div key={dept.id} className="erp-card bg-white border border-border-default overflow-hidden group">
            <div className="p-5 border-b border-border-default bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded flex items-center justify-center">
                    <Briefcase size={18} />
                  </div>
                  <h3 className="text-[15px] font-bold text-text-primary">{dept.name}</h3>
                </div>
                <button
                  onClick={() => handleDelete(dept.id!)}
                  className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-error hover:bg-error/10 rounded transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                  <UserCheck size={14} /> Executive Members ({dept.executiveMembers?.length || 0})
                </div>
                <div className="space-y-1.5">
                  {(dept.executiveMembers || []).map((m, idx) => {
                    const teacher = teachers.find(t => t.id === m.teacherId);
                    const school = teacher ? schools.find(s => s.id === teacher.schoolId) : null;
                    return (
                      <div key={idx} className="text-[12px] bg-slate-50 px-3 py-2 rounded space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary">{teacher?.fullName || 'Unknown'}</span>
                          {m.role && <span className="text-[10px] font-bold text-primary-default uppercase">{m.role}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                          {teacher?.phoneNumber && <span>{teacher.phoneNumber}</span>}
                          {school?.name && <span>{school.name}</span>}
                        </div>
                      </div>
                    );
                  })}
                  {(dept.executiveMembers || []).length === 0 && (
                    <p className="text-[11px] text-text-secondary italic">No executive members assigned</p>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                  <Users size={14} /> Board Members ({dept.boardMembers?.length || 0})
                </div>
                <div className="space-y-1.5">
                  {(dept.boardMembers || []).map((m, idx) => {
                    const teacher = teachers.find(t => t.id === m.teacherId);
                    const school = teacher ? schools.find(s => s.id === teacher.schoolId) : null;
                    return (
                      <div key={idx} className="text-[12px] bg-slate-50 px-3 py-2 rounded space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary">{teacher?.fullName || 'Unknown'}</span>
                          {m.role && <span className="text-[10px] font-bold text-primary-default uppercase">{m.role}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                          {teacher?.phoneNumber && <span>{teacher.phoneNumber}</span>}
                          {school?.name && <span>{school.name}</span>}
                        </div>
                      </div>
                    );
                  })}
                  {(dept.boardMembers || []).length === 0 && (
                    <p className="text-[11px] text-text-secondary italic">No board members assigned</p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50/30 border-t border-border-default">
              <button
                onClick={() => handleOpenEdit(dept)}
                className="text-[11px] font-bold text-primary-default hover:underline uppercase tracking-tight"
              >
                Edit Department
              </button>
            </div>
          </div>
        ))}
        {filteredDepartments.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase size={32} className="text-slate-300" />
            </div>
            <h3 className="text-[16px] font-bold text-text-primary mb-1">No departments yet</h3>
            <p className="text-[12px] text-text-secondary mb-6">Create your first department to start assigning members.</p>
            <button onClick={handleOpenAdd} className="erp-btn erp-btn-primary px-6 h-9 text-[13px]">
              <Plus size={14} /> Create Department
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden border border-border-default flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-[18px] font-bold tracking-tight">{editDeptId ? 'Edit Department' : 'New Department'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Science Department"
                  className="erp-input w-full h-10 text-[13px]"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border-default pb-2">
                  <button
                    onClick={() => setActiveMemberTab('executive')}
                    className={`px-4 py-1.5 rounded text-[12px] font-bold transition-all ${activeMemberTab === 'executive' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
                  >
                    <UserCheck size={14} className="inline mr-1" /> Executive Members
                  </button>
                  <button
                    onClick={() => setActiveMemberTab('board')}
                    className={`px-4 py-1.5 rounded text-[12px] font-bold transition-all ${activeMemberTab === 'board' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
                  >
                    <Users size={14} className="inline mr-1" /> Board Members
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Current {activeMemberTab === 'executive' ? 'Executive' : 'Board'} Members</p>
                  {(activeMemberTab === 'executive' ? formData.executiveMembers : formData.boardMembers).length === 0 ? (
                    <p className="text-[12px] text-text-secondary italic">No members added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(activeMemberTab === 'executive' ? formData.executiveMembers : formData.boardMembers).map((m, idx) => {
                        const teacher = teachers.find(t => t.id === m.teacherId);
                        return (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 border border-border-default rounded px-3 py-2">
                            <div className="flex-1">
                              <span className="text-[13px] font-medium text-text-primary">{teacher?.fullName || 'Unknown'}</span>
                            </div>
                            <input
                              type="text"
                              placeholder="Role (e.g. Chairperson)"
                              value={m.role}
                              onChange={e => updateMemberRole(activeMemberTab, idx, e.target.value)}
                              className="erp-input h-8 w-40 text-[11px]"
                            />
                            <button
                              onClick={() => removeMember(activeMemberTab, idx)}
                              className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-error hover:bg-error/10 rounded"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Add from Teacher List</p>
                  <select
                    value=""
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val) { addMember(val); }
                    }}
                    className="erp-input w-full h-10 text-[13px]"
                  >
                    <option value="">Select a teacher...</option>
                    {availableTeachers.map(t => (
                      <option key={t.id} value={t.id!}>{t.fullName} ({t.tpNumber || t.nin})</option>
                    ))}
                  </select>
                  {availableTeachers.length === 0 && (
                    <p className="text-[11px] text-text-secondary italic">All teachers have been assigned to this department</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-8 py-4 bg-gray-50 border-t border-border-default shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="erp-btn erp-btn-secondary h-10 px-6">Cancel</button>
              <button onClick={handleSave} className="erp-btn erp-btn-primary h-10 px-6"><Save size={14} className="mr-1" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;
