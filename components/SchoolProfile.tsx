import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  School, 
  MapPin, 
  ShieldCheck, 
  Info, 
  Save, 
  CheckCircle2, 
  Building,
  Activity,
  Plus, 
  Search, 
  Filter, 
  History, 
  LayoutDashboard, 
  Users, 
  ChevronRight, 
  TrendingUp, 
  X, 
  ArrowLeft, 
  FileText, 
  Home, 
  Droplets, 
  Zap, 
  Globe,
  Hash,
  ArrowRightLeft,
  Calendar,
  Layers,
  Shield,
  Truck,
  Navigation,
  Phone,
  User,
  Award,
  Stethoscope,
  Briefcase,
  FileSpreadsheet,
  GraduationCap,
  Wallet,
  Hammer,
  ClipboardCheck,
  Droplet,
  Library,
  Printer,
  Edit3,
  FileCheck,
  Users2,
  Sparkles,
  ShieldAlert,
  Calculator,
  Languages,
  Beaker
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
  AreaChart,
  Area
} from 'recharts';
import { db } from '../db';
import { 
  School as SchoolType
} from '../types';
import { 
  MALAWI_REGIONS, 
  MALAWI_DISTRICTS, 
  SCHOOL_LEVELS, 
  OWNERSHIP_TYPES, 
  ACCESSIBILITY_TYPES 
} from '../constants';
import KPICard from './KPICard';
import { GoogleGenAI } from '@google/genai';

const COLORS = ['#1b2e4b', '#00a1a1', '#e91e63', '#f59e0b', '#10b981'];

const SchoolProfile: React.FC = () => {
    const liveSchools = useLiveQuery(() => db.schools.toArray());
    const schools = useMemo(() => liveSchools || [], [liveSchools]);
    const [view, setView] = useState<'dashboard' | 'list' | 'detail' | 'form'>('dashboard');
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('All');

    // Stats calculations
    const stats = useMemo(() => {
        const countsByLevel: Record<string, number> = {};
        const countsByRegion: Record<string, number> = {};
        
        schools.forEach(s => {
            countsByLevel[s.level] = (countsByLevel[s.level] || 0) + 1;
            countsByRegion[s.region] = (countsByRegion[s.region] || 0) + 1;
        });

        const levelData = Object.entries(countsByLevel).map(([name, value]) => ({ name, value }));
        const regionData = Object.entries(countsByRegion).map(([name, value]) => ({ name, value }));

        return { levelData, regionData, total: schools.length };
    }, [schools]);

    const filteredSchools = useMemo(() => {
        return schools.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                s.emisCode.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLevel = levelFilter === 'All' || s.level === levelFilter;
            return matchesSearch && matchesLevel;
        });
    }, [schools, searchQuery, levelFilter]);

    const selectedSchool = useMemo(() => 
        schools.find(s => s.id === selectedSchoolId), [schools, selectedSchoolId]
    );

    const handleViewDetail = (id: number) => {
        setSelectedSchoolId(id);
        setView('detail');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this school record?')) {
            toast.promise(
                (async () => {
                    await db.schools.delete(id);
                    if (selectedSchoolId === id) setSelectedSchoolId(null);
                    if (view === 'detail' || view === 'form') setView('list');
                })(),
                {
                    loading: 'Deleting institutional record...',
                    success: 'School record purged from registry',
                    error: 'Encountered error during deletion'
                }
            );
        }
    };

    return (
        <div className="space-y-8 animate-in-fade pb-10">
            {/* Module header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-default">
                <div>
                    <h1 className="text-[24px] font-bold text-text-primary">Institutional Registry</h1>
                    <p className="text-[13px] text-text-secondary mt-1">Malawi EMIS: Centralized educational institution database</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex p-1 bg-gray-100 rounded-md border border-border-default">
                        <button 
                            onClick={() => setView('dashboard')}
                            className={`px-4 py-1.5 rounded-md transition-all text-[13px] font-medium flex items-center space-x-2 ${view === 'dashboard' ? 'bg-white text-primary-default shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            <LayoutDashboard size={14} />
                            <span>Analytics</span>
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`px-4 py-1.5 rounded-md transition-all text-[13px] font-medium flex items-center space-x-2 ${view === 'list' ? 'bg-white text-primary-default shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            <Filter size={14} />
                            <span>Catalog</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => { setSelectedSchoolId(null); setView('form'); }}
                        className="erp-btn erp-btn-primary"
                    >
                        <Plus size={16} />
                        <span>Register Institution</span>
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {view === 'dashboard' && (
                    <motion.div 
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* KPI grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Institutions', value: stats.total, icon: <School size={18} className="text-primary-default" /> },
                                { label: 'Primary Level', value: stats.levelData.find(d => d.name === 'Primary')?.value || 0, icon: <TrendingUp size={18} className="text-primary-default" /> },
                                { label: 'Secondary Level', value: stats.levelData.find(d => d.name === 'Secondary')?.value || 0, icon: <TrendingUp size={18} className="text-primary-default" /> },
                                { label: 'Active Status', value: schools.filter(s => s.status === 'active').length, icon: <CheckCircle2 size={18} className="text-success" /> },
                            ].map((s, i) => (
                                <KPICard 
                                    key={i}
                                    label={s.label}
                                    value={s.value}
                                    icon={s.icon}
                                />
                            ))}
                        </div>

                        {/* Analysis section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="erp-card p-6 bg-white border-t-2 border-primary-default">
                                <div className="mb-6">
                                   <h3 className="text-[14px] font-semibold text-text-primary uppercase tracking-wider">Institutional Level Analysis</h3>
                                   <p className="text-[12px] text-text-secondary mt-1">Sector breakdown by academic tiers</p>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.levelData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '12px' }}
                                                cursor={{ fill: '#F9FAFB' }}
                                            />
                                            <Bar dataKey="value" fill="#0f172a" radius={[2, 2, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="erp-card p-6 bg-white border-t-2 border-success">
                                <div className="mb-6">
                                   <h3 className="text-[14px] font-semibold text-text-primary uppercase tracking-wider">Regional Concentration</h3>
                                   <p className="text-[12px] text-text-secondary mt-1">Geographic footprint across national regions</p>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.regionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {stats.regionData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                              contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '12px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'list' && (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Data controls */}
                        <div className="erp-card p-3 bg-white flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-[280px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search by institution name or EMIS code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="erp-input w-full h-9 pl-9"
                                />
                            </div>
                            <div className="relative">
                                <select 
                                    value={levelFilter}
                                    onChange={(e) => setLevelFilter(e.target.value)}
                                    className="erp-input h-9 min-w-[180px]"
                                >
                                    <option value="All">All Education Levels</option>
                                    {SCHOOL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Inventory table */}
                        <div className="erp-card overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                  <thead>
                                      <tr className="border-b border-border-default bg-gray-50/50">
                                          <th className="erp-table-header px-6 py-3">Institution Profile</th>
                                          <th className="erp-table-header px-6 py-3">Academic Tier</th>
                                          <th className="erp-table-header px-6 py-3">Governance Region</th>
                                          <th className="erp-table-header px-6 py-3 text-right">Actions</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                      {filteredSchools.map(s => (
                                          <tr key={s.id} className="erp-table-row">
                                              <td className="erp-table-cell px-6 py-3">
                                                  <div className="flex items-center space-x-3">
                                                      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border border-border-default ${s.level === 'Primary' ? 'bg-primary-default/5 text-primary-default' : 'bg-success/5 text-success'}`}>
                                                          <School size={16} />
                                                      </div>
                                                      <div>
                                                          <p className="text-[14px] font-semibold text-text-primary leading-tight">{s.name}</p>
                                                          <p className="text-[11px] font-medium text-text-secondary mt-0.5">EMIS: {s.emisCode}</p>
                                                      </div>
                                                  </div>
                                              </td>
                                              <td className="erp-table-cell px-6 py-3">
                                                  <span className={`erp-badge ${s.level === 'Primary' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>{s.level}</span>
                                              </td>
                                              <td className="erp-table-cell px-6 py-3">
                                                  <div className="space-y-0.5">
                                                     <p className="text-[13px] font-medium text-text-primary">{s.district}</p>
                                                     <p className="text-[11px] text-text-secondary">{s.region}</p>
                                                  </div>
                                              </td>
                                              <td className="erp-table-cell px-6 py-3 text-right">
                                                  <button onClick={() => handleViewDetail(s.id!)} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px]">View Profile</button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                            </div>
                            {filteredSchools.length === 0 && (
                                <div className="py-16 text-center">
                                    <h4 className="text-[16px] font-semibold text-text-primary mb-1">No schools found</h4>
                                    <p className="text-[13px] text-text-secondary">Try adjusting your search or filters.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {view === 'detail' && selectedSchool && (
                    <SchoolDetailView 
                        school={selectedSchool} 
                        onBack={() => setView('list')} 
                        onEdit={() => setView('form')}
                        onDelete={() => handleDelete(selectedSchool.id!)}
                    />
                )}

                {view === 'form' && (
                    <SchoolForm 
                        school={selectedSchool} 
                        onCancel={() => setView(selectedSchool ? 'detail' : 'list')}
                        onSuccess={() => { setView('list'); setSelectedSchoolId(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const SchoolDetailView = ({ school, onBack }: { school: SchoolType, onBack: () => void, onEdit: () => void, onDelete: () => void }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedData, setEditedData] = useState<Partial<SchoolType>>(school);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiSummary, setAiSummary] = useState(school.aiSummary || '');

    const schoolLearners = useLiveQuery(() => db.learners.where('schoolId').equals(school.id!).toArray()) || [];
    const schoolStaff = useLiveQuery(() => db.teachers.where('schoolId').equals(school.id!).toArray()) || [];
    const promotions = useLiveQuery(() => db.promotionRecords.where('schoolId').equals(school.id!).toArray()) || [];
    const standardExams = useLiveQuery(() => db.standardExams.where('schoolId').equals(school.id!).toArray()) || [];
    const assets = useLiveQuery(() => db.assets.where('schoolId').equals(school.id!).toArray()) || [];
    const financeSIG = useLiveQuery(() => db.financeSIG.where('schoolId').equals(school.id!).toArray()) || [];

    const tabs = [
        { id: 'dashboard', icon: <LayoutDashboard />, label: 'Overview', domain: 'Overview' },
        { id: 'identity', icon: <Info />, label: 'Legal Identity', domain: 'Admin' },
        { id: 'location', icon: <MapPin />, label: 'Geographic', domain: 'Admin' },
        { id: 'governance', icon: <ShieldCheck />, label: 'Governance', domain: 'Admin' },
        { id: 'enrollment', icon: <Users2 />, label: 'Enrollment', domain: 'Learners' },
        { id: 'registry', icon: <FileCheck />, label: 'Registry', domain: 'Learners' },
        { id: 'special_needs', icon: <Stethoscope />, label: 'SNE Table', domain: 'Learners' },
        { id: 'promotion', icon: <TrendingUp />, label: 'Promotion', domain: 'Learners' },
        { id: 'staff_registry', icon: <Users />, label: 'Staff Registry', domain: 'Staff' },
        { id: 'staff_support', icon: <ArrowRightLeft />, label: 'HR Support', domain: 'Staff' },
        { id: 'academics_junior', icon: <Briefcase />, label: 'Junior Results', domain: 'Academics' },
        { id: 'academics_standard', icon: <FileSpreadsheet />, label: 'Exam Scores', domain: 'Academics' },
        { id: 'academics_pslce', icon: <GraduationCap />, label: 'PSLCE Results', domain: 'Academics' },
        { id: 'finance', icon: <Wallet />, label: 'Finance SIG', domain: 'Resources' },
        { id: 'infrastructure', icon: <Building />, label: 'Infrastructure', domain: 'Resources' },
        { id: 'assets', icon: <Hammer />, label: 'Assets Account', domain: 'Resources' },
        { id: 'inspections', icon: <ClipboardCheck />, label: 'Inspections', domain: 'Quality' },
    ];

    const generateAISummary = async () => {
        setIsGeneratingAI(true);
        toast.info('Initializing Neural Performance Engine...');
        try {
            const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY!);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = `Generate a strategic EMIS performance summary for ${school.name} (${school.emisCode}). 
            Data provided:
            - Level: ${school.level}
            - Learners: ${schoolLearners.length}
            - Teachers: ${schoolStaff.length}
            - Infrastructure: ${JSON.stringify(school.infrastructure)}
            - Ownership: ${school.ownership}
            
            Focus on strengths (e.g. S/T ratio, infrastructure) and weaknesses. Keep it professional and actionable.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            setAiSummary(text);
            
            await db.schools.update(school.id!, { 
                aiSummary: text, 
                aiSummaryDate: Date.now() 
            });
            toast.success('Neural analysis synthesized successfully.');
        } catch (error) {
            console.error("AI Generation error:", error);
            toast.error('AI synthesis failed. Please check network connectivity.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleSave = async () => {
        toast.promise(
            (async () => {
                const finalData = {
                    ...school,
                    ...editedData,
                    updatedAt: Date.now()
                } as SchoolType;
                await db.schools.update(school.id!, finalData);
                await db.auditLogs.add({
                    schoolId: school.id!,
                    action: 'update',
                    content: `Institutional profile updated manually via dashboard.`,
                    performedBy: 'System Admin',
                    timestamp: Date.now()
                });
                setIsEditMode(false);
            })(),
            {
                loading: 'Synchronizing record with central registry...',
                success: 'Institutional record synchronized successfully.',
                error: 'Synchronization failed. Please try again.'
            }
        );
    };

    const handleAction = (label: string) => {
        toast.info(`Initiating protocol: ${label}`);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-[10px] overflow-hidden border border-border-default shadow-sm">
            {/* Master header */}
            <header className="bg-white border-b border-border-default px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-md transition-colors border border-border-default text-text-secondary">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-[20px] font-bold text-text-primary tracking-tight leading-none">{school.name}</h2>
                            <span className="bg-primary-default/10 text-primary-default text-[11px] px-2 py-0.5 rounded font-bold border border-primary-default/20">EMIS: {school.emisCode}</span>
                        </div>
                        <p className="text-[12px] text-text-secondary mt-1 font-medium">Zone: {school.zone || school.traditionalAuthority} • {school.district}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { window.print(); toast.success('Dispatching to print spooler...'); }} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px]">
                        <Printer size={14} />
                        <span>Print</span>
                    </button>
                    <button onClick={() => { setIsEditMode(!isEditMode); toast.info(isEditMode ? 'Exiting edit mode' : 'Editing mode enabled'); }} className={`erp-btn erp-btn-secondary h-8 px-3 text-[12px] ${isEditMode ? 'bg-amber-50 border-amber-200' : ''}`}>
                        <Edit3 size={14} />
                        <span>{isEditMode ? 'Exit Draft' : 'Edit'}</span>
                    </button>
                    <button onClick={handleSave} className="erp-btn erp-btn-primary h-8 px-4 text-[12px]">
                        <Save size={14} />
                        <span>Save Changes</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Section navigation */}
                <aside className="w-56 bg-gray-50 border-r border-border-default overflow-y-auto custom-scrollbar flex flex-col p-4 gap-4">
                    {['Overview', 'Admin', 'Learners', 'Staff', 'Academics', 'Resources', 'Quality'].map(domain => (
                        <div key={domain} className="space-y-1">
                            <h4 className="text-[10px] font-bold text-text-secondary px-2 py-1 uppercase tracking-wider opacity-60">{domain}</h4>
                            {tabs.filter(t => t.domain === domain).map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                                        activeTab === t.id 
                                        ? 'bg-primary-default text-white shadow-sm' 
                                        : 'text-text-secondary hover:bg-white hover:text-text-primary'
                                    }`}
                                >
                                    {React.cloneElement(t.icon as React.ReactElement, { size: 14 })}
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </aside>

                {/* Content viewport */}
                <main className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                        >
                            {activeTab === 'dashboard' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <KPICard label="Total Enrollment" value={schoolLearners.length} icon={<Users2 size={18} className="text-primary-default" />} />
                                        <KPICard label="Current Staff" value={schoolStaff.length} icon={<Users size={18} className="text-primary-default" />} />
                                        <KPICard label="S/T Ratio" value={schoolStaff.length ? (schoolLearners.length / schoolStaff.length).toFixed(1) : 'N/A'} icon={<TrendingUp size={18} className="text-primary-default" />} />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="erp-card p-6 bg-white border-t-2 border-primary-default">
                                            <h3 className="text-[14px] font-bold text-text-primary mb-4 flex items-center gap-2">
                                                <Sparkles size={16} className="text-primary-default" />
                                                Strategic Performance Summary
                                            </h3>
                                            <div>
                                                {aiSummary ? (
                                                    <div className="text-[13px] text-text-secondary leading-relaxed space-y-4">
                                                        <p className="whitespace-pre-wrap">{aiSummary}</p>
                                                        <p className="text-[11px] text-text-secondary font-medium pt-4 border-t border-border-default/50">Analysis Date: {new Date(school.aiSummaryDate || 0).toLocaleDateString()}</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10 bg-gray-50 rounded-md border border-dashed border-border-default">
                                                        <p className="text-[13px] text-text-secondary mb-4">No performance analysis recorded</p>
                                                        <button 
                                                            onClick={generateAISummary}
                                                            disabled={isGeneratingAI}
                                                            className="erp-btn erp-btn-primary h-8 px-4 text-[12px]"
                                                        >
                                                            {isGeneratingAI ? 'Processing...' : 'Generate AI Summary'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="erp-card p-6 bg-white">
                                            <h3 className="text-[14px] font-bold text-text-primary mb-4 uppercase tracking-wider">Enrollment Trajectory</h3>
                                            <div className="h-56">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={[
                                                        { name: 'Jan', count: 120 },
                                                        { name: 'Feb', count: 135 },
                                                        { name: 'Mar', count: 130 },
                                                        { name: 'Apr', count: 145 },
                                                        { name: 'May', count: 160 },
                                                    ]}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} />
                                                        <YAxis tick={{fontSize: 10, fill: '#64748b'}} />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="count" stroke="#1b2e4b" fill="#1b2e4b" fillOpacity={0.05} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'identity' && (
                                <div className="space-y-8">
                                    <div className="border-b border-border-default pb-4">
                                        <h3 className="text-[18px] font-bold text-text-primary">Legal Identity</h3>
                                        <p className="text-[13px] text-text-secondary">Statutory registration and ownership credentials</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-6 erp-card p-6 bg-white">
                                            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-l-2 border-primary-default pl-2">Registry Credentials</h4>
                                            <div className="space-y-4">
                                                <ProfileField label="Institutional Name" value={editedData.name || school.name} icon={<School size={16} />} isEditable={isEditMode} onEdit={(val) => setEditedData({...editedData, name: val})} />
                                                <ProfileField label="EMIS Index Code" value={editedData.emisCode || school.emisCode} icon={<Hash size={16} />} isEditable={isEditMode} onEdit={(val) => setEditedData({...editedData, emisCode: val})} />
                                                <ProfileField label="Registration Number" value={school.registrationNumber || 'N/A'} icon={<FileText size={16} />} />
                                                <ProfileField label="Academic Tier" value={school.level} icon={<ArrowRightLeft size={16} />} />
                                            </div>
                                        </div>
                                        <div className="space-y-6 erp-card p-6 bg-white">
                                            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-l-2 border-success pl-2">Ownership & Status</h4>
                                            <div className="space-y-4">
                                                <ProfileField label="Governance Structure" value={school.ownership} icon={<ShieldCheck size={16} />} />
                                                <ProfileField label="Operational Status" value={school.status} icon={<CheckCircle2 size={16} />} isBadge />
                                                <ProfileField label="Established Year" value={school.yearEstablished?.toString() || 'N/A'} icon={<Calendar size={16} />} />
                                                <ProfileField label="Last Verification" value={new Date(school.updatedAt!).toLocaleDateString()} icon={<History size={16} />} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'location' && (
                                <div className="space-y-8">
                                    <div className="border-b border-border-default pb-4">
                                        <h3 className="text-[18px] font-bold text-text-primary">Geographic Positioning</h3>
                                        <p className="text-[13px] text-text-secondary">Site coordinates and administrative positioning</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-6 erp-card p-6 bg-white">
                                            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-l-2 border-gray-400 pl-2">Administrative</h4>
                                            <div className="space-y-4">
                                                <ProfileField label="Registry Region" value={school.region} icon={<Globe size={16} />} />
                                                <ProfileField label="Jurisdictional District" value={school.district} icon={<MapPin size={16} />} />
                                                <ProfileField label="Zone / Cluster" value={school.zone || 'N/A'} icon={<Layers size={16} />} />
                                            </div>
                                        </div>
                                        <div className="space-y-6 erp-card p-6 bg-white">
                                            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-l-2 border-primary-default pl-2">Village Unit</h4>
                                            <div className="space-y-4">
                                                <ProfileField label="Traditional Authority" value={school.traditionalAuthority || 'N/A'} icon={<Shield size={16} />} />
                                                <ProfileField label="Village Locality" value={school.village || 'N/A'} icon={<Home size={16} />} />
                                                <ProfileField label="Accessibility" value={school.accessibility || 'N/A'} icon={<Truck size={16} />} />
                                            </div>
                                        </div>
                                        <div className="space-y-6 erp-card p-6 bg-white">
                                            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-l-2 border-warning pl-2">Geospatial</h4>
                                            <div className="space-y-4">
                                                <ProfileField label="Latitude (Y)" value={school.latitude?.toFixed(6) || '0.000000'} icon={<Navigation size={16} />} />
                                                <ProfileField label="Longitude (X)" value={school.longitude?.toFixed(6) || '0.000000'} icon={<Navigation size={16} />} />
                                                <ProfileField label="Town Proximity" value={`${school.distanceFromTown || 0} KM`} icon={<Activity size={16} />} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'governance' && (
                                <div className="space-y-8">
                                    <div className="border-b border-border-default pb-4">
                                        <h3 className="text-[18px] font-bold text-text-primary">Institutional Leadership</h3>
                                        <p className="text-[13px] text-text-secondary">Headship and board governance documentation</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-6 erp-card p-6 bg-white">
                                            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-l-2 border-primary-default pl-2">Executive Credentials</h4>
                                            <div className="space-y-4">
                                                <ProfileField label="Head Teacher" value={school.headTeacher?.name || 'N/A'} icon={<User size={16} />} />
                                                <ProfileField label="Qualification" value={school.headTeacher?.qualification || 'N/A'} icon={<Award size={16} />} />
                                                <ProfileField label="Appointment" value={school.headTeacher?.appointmentDate || 'N/A'} icon={<Calendar size={16} />} />
                                                <ProfileField label="Contact" value={school.headTeacher?.contact || 'N/A'} icon={<Phone size={16} />} />
                                            </div>
                                        </div>
                                        <div className="space-y-6 erp-card p-6 bg-white">
                                            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-l-2 border-warning pl-2">Board Annotations</h4>
                                            <div className="bg-gray-50 p-4 rounded-md border border-border-default min-h-[140px]">
                                                <p className="text-[13px] text-text-primary leading-relaxed">
                                                    {school.boardDetails || "No governance board annotations have been recorded for this fiscal cycle."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'enrollment' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-text-primary">Learner Enrollment Table</h3>
                                            <p className="text-[12px] text-text-secondary">Gender disaggregated data entry grid</p>
                                        </div>
                                        <button onClick={() => handleAction('Add Enrollment Record')} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px]">
                                            <Plus size={14} /> 
                                            <span>Add Record</span>
                                        </button>
                                    </div>
                                    <div className="erp-card overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-border-default">
                                                    <th className="erp-table-header px-6 py-2.5">Class Level</th>
                                                    <th className="erp-table-header px-6 py-2.5">Boys</th>
                                                    <th className="erp-table-header px-6 py-2.5">Girls</th>
                                                    <th className="erp-table-header px-6 py-2.5">Total</th>
                                                    <th className="erp-table-header px-6 py-2.5">Underage</th>
                                                    <th className="erp-table-header px-6 py-2.5">Overage</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {['P-Klass', 'Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7', 'Standard 8'].map(grade => (
                                                    <tr key={grade} className="erp-table-row">
                                                        <td className="erp-table-cell px-6 py-2 text-[13px] font-bold text-text-primary">{grade}</td>
                                                        <td className="erp-table-cell px-6 py-2"><input type="number" className="erp-input w-20 h-8 text-[12px]" defaultValue={25} /></td>
                                                        <td className="erp-table-cell px-6 py-2"><input type="number" className="erp-input w-20 h-8 text-[12px]" defaultValue={28} /></td>
                                                        <td className="erp-table-cell px-6 py-2 text-[13px] font-bold text-primary-default">53</td>
                                                        <td className="erp-table-cell px-6 py-2 text-[12px] text-text-secondary">4</td>
                                                        <td className="erp-table-cell px-6 py-2 text-[12px] text-text-secondary">2</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'registry' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-text-primary">National Admission Registry</h3>
                                            <p className="text-[12px] text-text-secondary">Comprehensive learner database</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                                                <input type="text" placeholder="Search LIN/Name..." className="erp-input h-8 pl-8 pr-3 text-[12px]" />
                                            </div>
                                            <button onClick={() => handleAction('Open Registry Filters')} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px]">Filter</button>
                                        </div>
                                    </div>
                                    <div className="erp-card overflow-hidden">
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left border-collapse">
                                              <thead>
                                                  <tr className="bg-gray-50 border-b border-border-default">
                                                      <th className="erp-table-header px-6 py-2.5">LIN / Name</th>
                                                      <th className="erp-table-header px-6 py-2.5">Gender</th>
                                                      <th className="erp-table-header px-6 py-2.5">Grade</th>
                                                      <th className="erp-table-header px-6 py-2.5">Status</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-100">
                                                  {schoolLearners.map(l => (
                                                      <tr key={l.id} className="erp-table-row">
                                                          <td className="erp-table-cell px-6 py-2.5">
                                                              <p className="text-[13px] font-bold text-text-primary">{l.firstName} {l.surname}</p>
                                                              <p className="text-[11px] text-text-secondary font-medium">LIN: {l.lin}</p>
                                                          </td>
                                                          <td className="erp-table-cell px-6 py-2.5 text-[13px]">{l.gender}</td>
                                                          <td className="erp-table-cell px-6 py-2.5 text-[13px]">{l.class}</td>
                                                          <td className="erp-table-cell px-6 py-2.5">
                                                              <span className="erp-badge bg-emerald-50 text-emerald-700">Active</span>
                                                          </td>
                                                      </tr>
                                                  ))}
                                              </tbody>
                                          </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'special_needs' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-text-primary">SNE Registry</h3>
                                            <p className="text-[12px] text-text-secondary">Special needs education profiling</p>
                                        </div>
                                        <button onClick={() => handleAction('Register SNE Condition')} className="erp-btn erp-btn-primary h-8">
                                            <Plus size={14} />
                                            <span>Add Record</span>
                                        </button>
                                    </div>
                                    <div className="erp-card overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-900 border-b border-slate-700">
                                                    <th className="erp-table-header px-6 py-3 !text-white opacity-80 uppercase tracking-widest leading-none">Learner Name</th>
                                                    <th className="erp-table-header px-6 py-3 !text-white opacity-80 uppercase tracking-widest leading-none">Standard</th>
                                                    <th className="erp-table-header px-6 py-3 !text-white opacity-80 uppercase tracking-widest leading-none">Condition</th>
                                                    <th className="erp-table-header px-6 py-3 !text-white opacity-80 uppercase tracking-widest leading-none">Sex</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {schoolLearners.filter(l => l.isSNE).map(l => (
                                                    <tr key={l.id} className="erp-table-row">
                                                        <td className="erp-table-cell px-6 py-3 text-[13px] font-bold text-text-primary">{l.firstName} {l.surname}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-[13px] font-medium text-text-primary">{l.class}</td>
                                                        <td className="erp-table-cell px-6 py-3">
                                                            <span className="erp-badge bg-warning/10 text-warning border-warning/20">Learning disability</span>
                                                        </td>
                                                        <td className="erp-table-cell px-8 py-5 text-[14px] font-medium text-text-primary">{l.gender}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'promotion' && (
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-[20px] font-black text-text-primary tracking-tight">Internal efficiency</h3>
                                            <p className="text-[13px] text-text-secondary font-bold uppercase tracking-wider">Promotion, repetition, and dropout rates by grade</p>
                                        </div>
                                    </div>
                                    <div className="erp-card overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-border-default">
                                                    <th className="erp-table-header px-8 py-5">Grade Unit</th>
                                                    <th className="erp-table-header px-8 py-5">Sex</th>
                                                    <th className="erp-table-header px-8 py-5 text-center">Promoted</th>
                                                    <th className="erp-table-header px-8 py-5 text-center">Repeated</th>
                                                    <th className="erp-table-header px-8 py-5 text-center">Dropped Out</th>
                                                    <th className="erp-table-header px-8 py-5 text-right">Academic Year</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {promotions.map((p, idx) => (
                                                    <tr key={idx} className="erp-table-row">
                                                        <td className="erp-table-cell px-8 py-5 text-[14px] font-bold text-text-primary">{p.grade}</td>
                                                        <td className="erp-table-cell px-8 py-5 text-[14px] font-medium text-text-secondary uppercase">{p.gender}</td>
                                                        <td className="erp-table-cell px-8 py-5 text-center text-success font-black">{p.promoted}</td>
                                                        <td className="erp-table-cell px-8 py-5 text-center text-warning font-black">{p.repeated}</td>
                                                        <td className="erp-table-cell px-8 py-5 text-center text-error font-black">{p.droppedOut}</td>
                                                        <td className="erp-table-cell px-8 py-5 text-right text-[12px] font-mono font-bold text-text-secondary uppercase">{p.academicYear || p.year}</td>
                                                    </tr>
                                                ))}
                                                {promotions.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="py-20 text-center text-text-secondary text-[13px] font-medium uppercase tracking-wider">No efficiency records synchronized for this cycle.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'staff_registry' && (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <KPICard label="Male staff" value={schoolStaff.filter(s => s.gender === 'M').length} icon={<Users />} />
                                        <KPICard label="Female staff" value={schoolStaff.filter(s => s.gender === 'F').length} icon={<Users />} />
                                        <KPICard label="Degree holders" value={schoolStaff.filter(s => s.highestQualification?.includes('Degree')).length} icon={<GraduationCap />} />
                                        <KPICard label="Vacancies" value={2} icon={<ShieldAlert />} />
                                    </div>
                                    <div className="erp-card overflow-hidden">
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left border-collapse">
                                              <thead>
                                                  <tr className="bg-gray-50 border-b border-border-default">
                                                      <th className="erp-table-header px-8 py-4">TP Number / Name</th>
                                                      <th className="erp-table-header px-8 py-4">Grade / Rank</th>
                                                      <th className="erp-table-header px-8 py-4">Assigned Standard</th>
                                                      <th className="erp-table-header px-8 py-4">Specialization</th>
                                                      <th className="erp-table-header px-8 py-4">TCM License</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-100">
                                                  {schoolStaff.map(s => (
                                                      <tr key={s.id} className="erp-table-row group">
                                                          <td className="erp-table-cell px-8 py-5">
                                                              <p className="text-[14px] font-bold text-text-primary underline decoration-border-default underline-offset-4 decoration-dashed">{s.fullName}</p>
                                                              <p className="text-[11px] text-text-secondary font-mono tracking-tight uppercase mt-1">TP: {s.tpNumber}</p>
                                                          </td>
                                                          <td className="erp-table-cell px-8 py-5">
                                                              <p className="text-[13px] font-bold text-text-primary leading-tight">{s.teachingGrade}</p>
                                                              <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">{s.responsibility || 'Class Teacher'}</p>
                                                          </td>
                                                          <td className="erp-table-cell px-8 py-5">
                                                              <span className="erp-badge bg-gray-100 text-text-primary border-border-default">{s.assignedStandard || 'N/A'}</span>
                                                          </td>
                                                          <td className="erp-table-cell px-8 py-5 text-[13px] font-medium text-text-secondary">{s.specialization}</td>
                                                          <td className="erp-table-cell px-8 py-5">
                                                              <div className="flex items-center gap-2">
                                                                  <div className="w-2 h-2 rounded-full bg-success"></div>
                                                                  <p className="text-[11px] font-mono font-bold text-text-primary">{s.tcmLicenseNumber || 'UNLICENSED'}</p>
                                                              </div>
                                                          </td>
                                                      </tr>
                                                  ))}
                                              </tbody>
                                          </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'staff_support' && (
                                <div className="space-y-6">
                                    <header className="flex justify-between items-center border-b border-border-default pb-3">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-text-primary">Staff Support & Mobility</h3>
                                            <p className="text-[12px] text-text-secondary">Personnel development and transfer status</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAction('Process Staff Transfer')} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px]">
                                                <ArrowRightLeft size={14} />
                                                <span>Process Transfer</span>
                                            </button>
                                            <button onClick={() => handleAction('Record Staff Leave')} className="erp-btn erp-btn-primary h-8 px-3 text-[12px]">
                                                <Calendar size={14} />
                                                <span>Record Leave</span>
                                            </button>
                                        </div>
                                    </header>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="erp-card bg-slate-900 text-white p-8 flex flex-col items-center justify-center text-center">
                                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                                <ArrowRightLeft size={24} className="text-primary-default" />
                                            </div>
                                            <h4 className="text-[16px] font-bold mb-1">Transfer Queue</h4>
                                            <p className="text-[13px] text-gray-400 mb-6">No pending personnel transfers detected.</p>
                                            <div className="erp-badge bg-white/10 text-white border-white/20 uppercase text-[10px]">Status: Compliant</div>
                                        </div>
                                        <div className="erp-card bg-white p-8 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-md border border-border-default shadow-sm"><Users size={18} className="text-primary-default" /></div>
                                                <div>
                                                    <h4 className="text-[14px] font-bold tracking-tight text-text-primary">Staff Attendance Summary</h4>
                                                    <p className="text-[11px] text-text-secondary font-bold uppercase tracking-wider opacity-60">Active session benchmarks</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-md border border-border-default shadow-sm">
                                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Avg. Presence</span>
                                                    <p className="text-[24px] font-bold text-text-primary tracking-tight leading-none mt-1">94.2%</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-md border border-border-default shadow-sm">
                                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Active Leaves</span>
                                                    <p className="text-[24px] font-bold text-text-primary tracking-tight leading-none mt-1">2</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'academics_junior' && (
                                <div className="space-y-6">
                                    <div className="p-3 bg-primary-default/5 border border-primary-default/10 rounded-md flex items-center gap-3">
                                        <Info size={16} className="text-primary-default" />
                                        <p className="text-[12px] font-medium text-primary-default">Junior Classes (Std 1-4) Performance Matrix</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <KPICard label="Avg Math Score" value="72%" icon={<Calculator size={18} />} />
                                        <KPICard label="Avg English Score" value="68%" icon={<Languages size={18} />} />
                                        <KPICard label="Avg Science Score" value="65%" icon={<Beaker size={18} />} />
                                        <KPICard label="Pass Rate" value="84%" icon={<CheckCircle2 size={18} />} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4'].map(grade => (
                                            <div key={grade} className="erp-card p-5 bg-white border border-border-default hover:border-primary-default transition-all group">
                                                <h4 className="text-[13px] font-bold text-text-primary mb-4 border-b border-border-default pb-2 group-hover:text-primary-default transition-colors">{grade}</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[11px] font-medium text-text-secondary uppercase">Sat</span>
                                                        <span className="text-[14px] font-bold text-text-primary">48</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-success">
                                                        <span className="text-[11px] font-medium uppercase">Passed</span>
                                                        <span className="text-[14px] font-bold">42</span>
                                                    </div>
                                                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-success" style={{ width: '87.5%' }}></div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-error">
                                                        <span className="text-[11px] font-medium uppercase">Failed</span>
                                                        <span className="text-[14px] font-bold">6</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'academics_standard' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-border-default pb-3">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-text-primary">Standardized Assessments</h3>
                                            <p className="text-[12px] text-text-secondary">End of term and annual national examination scores</p>
                                        </div>
                                        <button onClick={() => handleAction('Import Mass Assessment Data')} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px]">
                                            <Plus size={14} />
                                            <span>Import Mass Results</span>
                                        </button>
                                    </div>
                                    <div className="erp-card overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-border-default text-text-secondary uppercase text-[10px] font-bold tracking-widest">
                                                    <th className="erp-table-header px-6 py-3">Student Identity</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">Grade</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">CHI</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">ENG</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">MAT</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">PSCI</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">SES</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">Arts</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">Total</th>
                                                    <th className="erp-table-header px-6 py-3 text-right">Cycle</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {standardExams.map((e, idx) => (
                                                    <tr key={idx} className="erp-table-row">
                                                        <td className="erp-table-cell px-6 py-3">
                                                            <div>
                                                                <p className="text-[13px] font-semibold text-text-primary">{e.studentName}</p>
                                                                <p className="text-[10px] text-text-secondary font-medium uppercase mt-0.5">{e.gender}</p>
                                                            </div>
                                                        </td>
                                                        <td className="erp-table-cell px-6 py-3 text-center text-[12px] font-medium text-text-primary">{e.grade}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-center text-[12px] text-text-secondary">{e.chi}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-center text-[12px] text-text-secondary">{e.eng}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-center text-[12px] text-text-secondary">{e.mat}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-center text-[12px] text-text-secondary">{e.psci}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-center text-[12px] text-text-secondary">{e.ses}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-center text-[12px] text-text-secondary">{e.arts}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-center font-bold text-primary-default">{e.total}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-right font-medium text-[11px] text-text-secondary">T{e.term} | {e.year}</td>
                                                    </tr>
                                                ))}
                                                {standardExams.length === 0 && (
                                                    <tr>
                                                        <td colSpan={10} className="py-16 text-center text-text-secondary text-[13px]">No standardized exam results recorded.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'academics_pslce' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-border-default pb-3">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-text-primary">PSLCE National Results</h3>
                                            <p className="text-[12px] text-text-secondary">Primary School Leaving Certificate of Education outcomes</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-primary-default p-8 rounded-lg shadow-sm text-white">
                                            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">National Pass Rate</span>
                                            <p className="text-[36px] font-bold leading-none mt-2">88.4%</p>
                                            <div className="mt-4 flex items-center gap-2">
                                              <TrendingUp size={14} />
                                              <p className="text-[12px] font-medium opacity-90">+4.2% from previous cycle</p>
                                            </div>
                                        </div>
                                        <div className="col-span-2 erp-card p-8 flex flex-col items-center justify-center text-center bg-gray-50 border-border-default border-dashed">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-border-default">
                                                <Award size={24} className="text-text-secondary" />
                                            </div>
                                            <h4 className="text-[15px] font-bold text-text-primary mb-1">Merit Selections</h4>
                                            <p className="text-[13px] text-text-secondary max-w-md">
                                                National selection lists for secondary school placement are pending release by MANEB protocols.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'finance' && (
                                <div className="space-y-6">
                                    <header className="flex justify-between items-center border-b border-border-default pb-3">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-text-primary">SIG Grant Utilization</h3>
                                            <p className="text-[12px] text-text-secondary">School Improvement Grant disbursement and expenditure records</p>
                                        </div>
                                        <button onClick={() => handleAction('Record New SIG Disbursement')} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px]">
                                            <Plus size={14} />
                                            <span>Record Disbursement</span>
                                        </button>
                                    </header>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="erp-card p-6 bg-white border-l-4 border-l-success shadow-sm">
                                            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Total SIG Allocation (2024)</p>
                                            <h4 className="text-[24px] font-bold text-text-primary leading-tight">MWK 4,250,000</h4>
                                            <div className="mt-4 flex items-center gap-2 text-success">
                                                <CheckCircle2 size={16} />
                                                <p className="text-[11px] font-bold uppercase tracking-wider">Fully Disbursed</p>
                                            </div>
                                        </div>
                                        <div className="erp-card p-6 bg-white border-l-4 border-l-warning shadow-sm">
                                            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Current Utilization</p>
                                            <h4 className="text-[24px] font-bold text-text-primary leading-tight">MWK 2,840,000</h4>
                                            <div className="mt-4 flex items-center gap-2 text-warning">
                                                <Activity size={16} />
                                                <p className="text-[11px] font-bold uppercase tracking-wider">In-Cycle Expenditure</p>
                                            </div>
                                        </div>
                                        <div className="erp-card p-6 bg-white border-l-4 border-l-primary-default shadow-sm">
                                            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Net Balance</p>
                                            <h4 className="text-[24px] font-bold text-text-primary leading-tight">MWK 1,410,000</h4>
                                            <div className="mt-4 flex items-center gap-2 text-primary-default">
                                                <Wallet size={16} />
                                                <p className="text-[11px] font-bold uppercase tracking-wider">Reserved for Q4</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="erp-card overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-border-default text-text-secondary uppercase text-[10px] font-bold tracking-widest">
                                                    <th className="erp-table-header px-6 py-3">Disbursement Purpose</th>
                                                    <th className="erp-table-header px-6 py-3">Amount (MK)</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">Status</th>
                                                    <th className="erp-table-header px-6 py-3 text-right">Transaction Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {financeSIG.map((f, idx) => (
                                                    <tr key={idx} className="erp-table-row">
                                                        <td className="erp-table-cell px-6 py-3">
                                                          <p className="text-[13px] font-semibold text-text-primary leading-tight">{f.purpose}</p>
                                                          <p className="text-[10px] text-text-secondary font-medium uppercase mt-0.5">Voucher: SIG-{idx+1042}</p>
                                                        </td>
                                                        <td className="erp-table-cell px-6 py-3">
                                                            <span className="text-[13px] font-bold text-text-primary">{f.amount.toLocaleString()}</span>
                                                        </td>
                                                        <td className="erp-table-cell px-6 py-3 text-center">
                                                            <span className={`erp-badge py-0.5 px-2 text-[10px] ${
                                                                f.status === 'Spent' ? 'bg-success/10 text-success border-success/20' : 'bg-gray-100 text-text-secondary'
                                                            }`}>
                                                                {f.status}
                                                            </span>
                                                        </td>
                                                        <td className="erp-table-cell px-6 py-3 text-right text-[12px] text-text-secondary font-medium">{new Date(f.date).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {financeSIG.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="py-16 text-center text-text-secondary text-[13px]">No grant utilization records found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'infrastructure' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-border-default pb-3">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-text-primary">Institutional Infrastructure</h3>
                                            <p className="text-[12px] text-text-secondary">Physical plant assessment and essential utility inventory</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-white border border-border-default rounded-md shadow-sm space-y-3">
                                            <div className="w-8 h-8 bg-primary-default/10 text-primary-default rounded-md flex items-center justify-center"><Building size={18} /></div>
                                            <div>
                                              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Classrooms</span>
                                              <p className="text-[24px] font-bold text-text-primary mt-1">{school.infrastructure?.classrooms || 0}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white border border-border-default rounded-md shadow-sm space-y-3">
                                            <div className="w-8 h-8 bg-success/10 text-success rounded-md flex items-center justify-center"><Users size={18} /></div>
                                            <div>
                                              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Staff Housing</span>
                                              <p className="text-[24px] font-bold text-text-primary mt-1">{school.infrastructure?.staffHouses || 0}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white border border-border-default rounded-md shadow-sm space-y-3">
                                            <div className="w-8 h-8 bg-warning/10 text-warning rounded-md flex items-center justify-center"><Droplet size={18} /></div>
                                            <div>
                                              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Latrine Units</span>
                                              <p className="text-[24px] font-bold text-text-primary mt-1">{school.infrastructure?.latrines || 0}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white border border-border-default rounded-md shadow-sm space-y-3">
                                            <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-md flex items-center justify-center"><Library size={18} /></div>
                                            <div>
                                              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Resource Units</span>
                                              <p className="text-[24px] font-bold text-text-primary mt-1">{school.infrastructure?.libraries || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                        <div className="col-span-3 space-y-6 bg-white p-6 rounded-md border border-border-default shadow-sm">
                                            <h4 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider pl-3 border-l-4 border-primary-default">Essential Utilities</h4>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                                <ProfileField label="Water Source" value={school.infrastructure?.waterSource || 'N/A'} icon={<Droplets size={16} />} />
                                                <ProfileField label="Energy Source" value={school.infrastructure?.electricitySource || 'N/A'} icon={<Zap size={16} />} />
                                                <ProfileField label="Internet" value={school.infrastructure?.internetAccess ? 'Available' : 'None'} icon={<Globe size={16} />} />
                                                <ProfileField label="Fencing" value="Chain Link / Partial" icon={<Shield size={16} />} />
                                            </div>
                                        </div>
                                        <div className="col-span-2 space-y-6 bg-slate-900 p-6 rounded-md text-white shadow-md relative overflow-hidden">
                                            <div className="relative z-10 space-y-6">
                                                <h4 className="text-[12px] font-bold text-white/40 uppercase tracking-wider pl-3 border-l-4 border-white/20">Site Dimensions</h4>
                                                <div className="space-y-6">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-white/50 block uppercase tracking-wider mb-1">Land Parcel Size</span>
                                                        <p className="text-[28px] font-bold text-success leading-none">{school.infrastructure?.landSize || 0} Hectares</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-white/50 block uppercase tracking-wider mb-1">Tenure Status</span>
                                                        <p className="text-[28px] font-bold text-primary-default leading-none">{school.infrastructure?.landOwnership || 'Unspecified'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'assets' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-border-default pb-3">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-text-primary">Institutional Asset Registry</h3>
                                            <p className="text-[12px] text-text-secondary">Pedagogical and logistical capital equipment inventory</p>
                                        </div>
                                        <button onClick={() => handleAction('Audit New Asset Record')} className="erp-btn erp-btn-secondary h-8 px-3 text-[12px]">
                                            <Plus size={14} />
                                            <span>Audit New Asset</span>
                                        </button>
                                    </div>
                                    <div className="erp-card overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-border-default text-text-secondary uppercase text-[10px] font-bold tracking-widest">
                                                    <th className="erp-table-header px-6 py-3">Asset Identity</th>
                                                    <th className="erp-table-header px-6 py-3">Category</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">Qty</th>
                                                    <th className="erp-table-header px-6 py-3 text-center">Status</th>
                                                    <th className="erp-table-header px-6 py-3 text-right">Last Audit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {assets.map((a, idx) => (
                                                    <tr key={idx} className="erp-table-row">
                                                        <td className="erp-table-cell px-6 py-3">
                                                            <div>
                                                                <p className="text-[13px] font-semibold text-text-primary leading-tight">{a.name}</p>
                                                                <p className="text-[10px] text-text-secondary font-medium uppercase mt-0.5">{a.serialNumber || 'No ID'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="erp-table-cell px-6 py-3 text-[12px] font-medium text-text-secondary uppercase">{a.category}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-center font-bold text-[13px] text-text-primary">{a.quantity}</td>
                                                        <td className="erp-table-cell px-6 py-3 text-center">
                                                            <span className={`erp-badge py-0.5 px-2 text-[10px] ${
                                                                a.status === 'Good' ? 'bg-success/10 text-success border-success/20' : 
                                                                a.status === 'Repairable' ? 'bg-warning/10 text-warning border-warning/20' : 
                                                                'bg-error/10 text-error border-error/20'
                                                            }`}>
                                                                {a.status}
                                                            </span>
                                                        </td>
                                                        <td className="erp-table-cell px-6 py-3 text-right text-[11px] text-text-secondary font-medium">{new Date(a.lastAuditDate).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {assets.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="py-16 text-center text-text-secondary text-[13px]">No pedagogical assets recorded in the active ledger.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inspections' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="border-b border-border-default pb-3">
                                            <h3 className="text-[16px] font-bold text-text-primary tracking-tight flex items-center gap-2">
                                                <History size={18} className="text-text-secondary" />
                                                Inspection History
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { date: '2023-11-15', inspector: 'M. Phiri', score: 85, status: 'Exceptional' },
                                                { date: '2023-05-10', inspector: 'G. Banda', score: 62, status: 'Satisfactory' },
                                                { date: '2022-10-22', inspector: 'S. Nkhoma', score: 45, status: 'Needs Improvement' },
                                            ].map((insp, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 bg-white rounded-md border border-border-default hover:border-primary-default transition-all group shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${insp.score >= 80 ? 'bg-success' : insp.score >= 60 ? 'bg-warning' : 'bg-error'}`} />
                                                        <div>
                                                            <p className="text-[13px] font-bold text-text-primary leading-tight uppercase">{insp.status} • {insp.score}% Score</p>
                                                            <p className="text-[11px] text-text-secondary font-medium mt-0.5">Audit by {insp.inspector} on {insp.date}</p>
                                                        </div>
                                                    </div>
                                                    <button className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-50 text-text-secondary hover:bg-primary-default hover:text-white transition-all"><ChevronRight size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="erp-card p-8 bg-slate-900 border-none shadow-md relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                                            <Sparkles size={120} className="text-white" />
                                        </div>
                                        <div className="relative z-10 space-y-8">
                                            <div className="space-y-2">
                                                <h3 className="text-[20px] font-bold text-white tracking-tight">Quality Assurance Form</h3>
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                                  <p className="text-[11px] text-primary-default font-bold uppercase tracking-wider">Standard Inspection Framework v2.1</p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                {[
                                                    { label: 'Leadership & Management', icon: <Briefcase /> },
                                                    { label: 'Teaching & Learning Quality', icon: <GraduationCap /> },
                                                    { label: 'Community Participation', icon: <Users2 /> },
                                                ].map((field, i) => (
                                                    <div key={i} className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 text-white/80">
                                                                <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center">
                                                                  {React.cloneElement(field.icon as React.ReactElement, { size: 16 })}
                                                                </div>
                                                                <span className="text-[12px] font-bold uppercase tracking-wide">{field.label}</span>
                                                            </div>
                                                            <span className="text-[13px] font-bold text-primary-default">4 / 5</span>
                                                        </div>
                                                        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                          <div className="absolute top-0 left-0 h-full bg-primary-default rounded-full" style={{ width: '80%' }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="pt-4">
                                                   <button onClick={() => handleAction('Submit Quality Analysis')} className="w-full erp-btn erp-btn-primary h-12 text-[14px] font-bold shadow-lg">Submit Final Analysis</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* default fallback for other tabs */}
                            {!['dashboard', 'identity', 'location', 'governance', 'enrollment', 'registry', 'special_needs', 'promotion', 'staff_registry', 'staff_support', 'academics_junior', 'academics_standard', 'academics_pslce', 'finance', 'infrastructure', 'assets', 'inspections'].includes(activeTab) && (
                                <div className="space-y-12">
                                    <div className="text-center py-32 bg-gray-50 rounded-[12px] border-2 border-dashed border-border-default">
                                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-text-secondary border border-border-default">
                                           {React.cloneElement(tabs.find(t => t.id === activeTab)?.icon as React.ReactElement, { size: 32 })}
                                        </div>
                                        <h4 className="text-[18px] font-black text-text-primary mb-2 uppercase tracking-tight">Module under construction</h4>
                                        <p className="text-[13px] text-text-secondary max-w-xs mx-auto font-medium">This specific domain protocol is currently being provisioned for statutory compliance reporting.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            
            {/* Global Actions Style */}
            <style>{`
                .btn-action-header {
                    @apply flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all active:scale-95;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </motion.div>
    );
};

const SchoolForm = ({ school, onCancel, onSuccess }: { school?: SchoolType, onCancel: () => void, onSuccess: () => void }) => {
    const [formData, setFormData] = useState<Partial<SchoolType>>(school || {
        name: '',
        emisCode: '',
        registrationNumber: '',
        level: 'Primary',
        status: 'active',
        region: 'Central',
        district: 'Lilongwe',
        traditionalAuthority: '',
        village: '',
        latitude: 0,
        longitude: 0,
        accessibility: 'Tarred Road',
        distanceFromTown: 0,
        ownership: 'Government',
        headTeacher: { name: '', gender: 'F', qualification: '', appointmentDate: '', contact: '' },
        infrastructure: {
            classrooms: 0,
            offices: 0,
            staffHouses: 0,
            latrines: 0,
            libraries: 0,
            laboratories: 0,
            waterSource: 'Piped Water',
            electricitySource: 'Grid',
            internetAccess: false,
            landSize: 0,
            landOwnership: 'Government'
        },
        yearEstablished: new Date().getFullYear(),
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        toast.promise(
            (async () => {
                const finalData = {
                    ...formData,
                    updatedAt: Date.now()
                } as SchoolType;

                let schoolId: number;
                if (school?.id) {
                    await db.schools.update(school.id, finalData);
                    schoolId = school.id;
                    await db.auditLogs.add({
                        schoolId,
                        action: 'update',
                        content: `Modified school record: ${formData.name}`,
                        performedBy: 'System Admin',
                        timestamp: Date.now()
                    });
                } else {
                    finalData.createdAt = Date.now();
                    schoolId = await db.schools.add(finalData);
                    await db.auditLogs.add({
                        schoolId,
                        action: 'create',
                        content: `Registered new school: ${formData.name}`,
                        performedBy: 'System Admin',
                        timestamp: Date.now()
                    });
                }
                onSuccess();
            })(),
            {
                loading: 'Persisting institutional data...',
                success: 'Institutional record saved to registry',
                error: 'Registration protocol failed.'
            }
        ).finally(() => setIsSaving(false));
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 flex items-center justify-center font-sans shadow-2xl"
        >
            <div className="w-full max-w-5xl bg-white rounded-md shadow-2xl overflow-hidden my-auto border border-border-default flex flex-col max-h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                        <div className="space-y-1 relative z-10">
                            <h2 className="text-[18px] font-bold tracking-tight">
                                {school ? 'Institutional Record Sync' : 'New Institutional Enrollment'}
                            </h2>
                            <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest leading-none">EMIS regulatory compliance protocol v5.1</p>
                        </div>
                        <button type="button" onClick={onCancel} className="relative z-10 w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-all text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                        {/* Section 1: Identification */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border-default pb-2">
                                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-text-secondary"><Info size={14} /></div>
                                <h3 className="text-[12px] font-bold text-text-primary uppercase tracking-tight">Institutional Identification</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                  <FormField label="School Name" required>
                                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. St. Mary's Secondary School" />
                                  </FormField>
                                </div>
                                <FormField label="EMIS Code" required>
                                    <input type="text" required value={formData.emisCode} onChange={e => setFormData({...formData, emisCode: e.target.value})} maxLength={10} className="font-mono text-primary-default bg-primary-default/5" placeholder="8-digit code" />
                                </FormField>
                                <FormField label="Academic Level">
                                    <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as SchoolType['level']})}>
                                        {SCHOOL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Ownership">
                                    <select value={formData.ownership} onChange={e => setFormData({...formData, ownership: e.target.value})}>
                                        {OWNERSHIP_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Registration ID">
                                    <input type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} placeholder="REG-XXX-XXX" />
                                </FormField>
                            </div>
                        </section>

                        {/* Section 2: Location */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border-default pb-2">
                                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-text-secondary"><MapPin size={14} /></div>
                                <h3 className="text-[12px] font-bold text-text-primary uppercase tracking-tight">Geospatial Position</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FormField label="Region">
                                    <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value as SchoolType['region'], district: MALAWI_DISTRICTS[e.target.value as keyof typeof MALAWI_DISTRICTS][0]})}>
                                        {MALAWI_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="District">
                                    <select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>
                                        {MALAWI_DISTRICTS[formData.region as keyof typeof MALAWI_DISTRICTS].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="T/A">
                                    <input type="text" value={formData.traditionalAuthority} onChange={e => setFormData({...formData, traditionalAuthority: e.target.value})} placeholder="e.g. T/A Mazengera" />
                                </FormField>
                                <FormField label="Village">
                                    <input type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} placeholder="e.g. Chilinde" />
                                </FormField>
                                <FormField label="Latitude">
                                    <input type="number" step="0.000001" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} className="font-mono text-text-secondary" />
                                </FormField>
                                <FormField label="Longitude">
                                    <input type="number" step="0.000001" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} className="font-mono text-text-secondary" />
                                </FormField>
                                <FormField label="Accessibility">
                                    <select value={formData.accessibility} onChange={e => setFormData({...formData, accessibility: e.target.value as SchoolType['accessibility']})}>
                                        {ACCESSIBILITY_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Dist. to Town (KM)">
                                    <input type="number" value={formData.distanceFromTown} onChange={e => setFormData({...formData, distanceFromTown: parseInt(e.target.value)})} />
                                </FormField>
                            </div>
                        </section>

                        {/* Section 3: Governance */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border-default pb-2">
                                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-text-secondary"><ShieldCheck size={14} /></div>
                                <h3 className="text-[12px] font-bold text-text-primary uppercase tracking-tight">Governance & Leadership</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-md border border-border-default">
                                    <div className="md:col-span-2 border-b border-border-default pb-1 mb-2">
                                      <h4 className="text-[11px] font-bold text-text-secondary uppercase">Head Teacher Credentials</h4>
                                    </div>
                                    <div className="md:col-span-2">
                                      <FormField label="Full Name">
                                          <input type="text" value={formData.headTeacher?.name} onChange={e => setFormData({...formData, headTeacher: {...formData.headTeacher!, name: e.target.value}})} className="bg-white" />
                                      </FormField>
                                    </div>
                                    <FormField label="Gender">
                                        <select className="bg-white" value={formData.headTeacher?.gender} onChange={e => setFormData({...formData, headTeacher: {...formData.headTeacher!, gender: e.target.value as 'M' | 'F'}})}>
                                            <option value="F">Female</option>
                                            <option value="M">Male</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Rank/Qualification">
                                        <input type="text" className="bg-white" value={formData.headTeacher?.qualification} onChange={e => setFormData({...formData, headTeacher: {...formData.headTeacher!, qualification: e.target.value}})} />
                                    </FormField>
                                    <div className="md:col-span-2">
                                      <FormField label="Contact Number">
                                          <input type="text" className="bg-white font-mono" value={formData.headTeacher?.contact} onChange={e => setFormData({...formData, headTeacher: {...formData.headTeacher!, contact: e.target.value}})} placeholder="+265..." />
                                      </FormField>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <FormField label="School Status">
                                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as SchoolType['status']})}>
                                            <option value="active">Active (Compliance)</option>
                                            <option value="inactive">Inactive / Suspended</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Year Established">
                                        <input type="number" value={formData.yearEstablished} onChange={e => setFormData({...formData, yearEstablished: parseInt(e.target.value)})} />
                                    </FormField>
                                    <FormField label="Board Notes">
                                        <textarea 
                                            rows={3} 
                                            value={formData.boardDetails} 
                                            onChange={e => setFormData({...formData, boardDetails: e.target.value})}
                                            placeholder="Board membership or governance summary..."
                                            className="erp-input h-auto py-2"
                                        />
                                    </FormField>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Infrastructure */}
                        <section className="space-y-4 pb-6">
                            <div className="flex items-center gap-2 border-b border-border-default pb-2">
                                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-text-secondary"><Building size={14} /></div>
                                <h3 className="text-[12px] font-bold text-text-primary uppercase tracking-tight">Physical Infrastructure</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                <FormField label="Classrooms">
                                    <input type="number" value={formData.infrastructure?.classrooms} onChange={e => setFormData({...formData, infrastructure: {...formData.infrastructure!, classrooms: parseInt(e.target.value)}})} />
                                </FormField>
                                <FormField label="Latrines">
                                    <input type="number" value={formData.infrastructure?.latrines} onChange={e => setFormData({...formData, infrastructure: {...formData.infrastructure!, latrines: parseInt(e.target.value)}})} />
                                </FormField>
                                <FormField label="Staff Houses">
                                    <input type="number" value={formData.infrastructure?.staffHouses} onChange={e => setFormData({...formData, infrastructure: {...formData.infrastructure!, staffHouses: parseInt(e.target.value)}})} />
                                </FormField>
                                <FormField label="Libraries">
                                    <input type="number" value={formData.infrastructure?.libraries} onChange={e => setFormData({...formData, infrastructure: {...formData.infrastructure!, libraries: parseInt(e.target.value)}})} />
                                </FormField>
                                <FormField label="Land Size (Ha)">
                                    <input type="number" step="0.1" value={formData.infrastructure?.landSize} onChange={e => setFormData({...formData, infrastructure: {...formData.infrastructure!, landSize: parseFloat(e.target.value)}})} />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                                <FormField label="Water Source">
                                    <select value={formData.infrastructure?.waterSource} onChange={e => setFormData({...formData, infrastructure: {...formData.infrastructure!, waterSource: e.target.value}})}>
                                        <option value="Piped Water">Piped Water</option>
                                        <option value="Borehole">Borehole</option>
                                        <option value="River / Stream">River / Stream</option>
                                    </select>
                                </FormField>
                                <FormField label="Electric Source">
                                    <select value={formData.infrastructure?.electricitySource} onChange={e => setFormData({...formData, infrastructure: {...formData.infrastructure!, electricitySource: e.target.value}})}>
                                        <option value="Grid">National Grid (ESCOM)</option>
                                        <option value="Solar">Solar Array</option>
                                        <option value="Generator">Thermal Generator</option>
                                        <option value="None">None</option>
                                    </select>
                                </FormField>
                                <div className="flex bg-gray-50 p-4 rounded-md border border-border-default items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-2">
                                      <Globe size={16} className="text-text-secondary" />
                                      <span className="text-[11px] font-bold text-text-secondary uppercase">Internet Access</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={formData.infrastructure?.internetAccess}
                                            onChange={e => setFormData({...formData, infrastructure: {...formData.infrastructure!, internetAccess: e.target.checked}})}
                                        />
                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[16px] after:w-[16px] after:transition-all peer-checked:bg-primary-default"></div>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="px-8 py-4 bg-gray-50 border-t border-border-default flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 opacity-60">
                          <CheckCircle2 size={14} className="text-text-secondary" />
                          <p className="text-[11px] font-medium text-text-secondary max-w-sm leading-tight">Data submitted satisfies institutional reporting requirements as per EMIS Act.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                type="button" 
                                onClick={onCancel}
                                className="erp-btn erp-btn-secondary h-9 px-4 text-[12px] font-semibold"
                            >
                                Discard
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="erp-btn erp-btn-primary h-9 px-6 text-[12px] font-semibold shadow-md"
                            >
                                <Save size={16} className="mr-2" />
                                <span>{isSaving ? 'Saving...' : (school ? 'Update Record' : 'Register School')}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

const ProfileField = ({ label, value, icon, isBadge, isEditable, onEdit }: { label: string, value?: string, icon: React.ReactNode, isBadge?: boolean, isEditable?: boolean, onEdit?: (val: string) => void }) => (
    <div className="group transition-all">
        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block pl-1">{label}</label>
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-text-secondary border border-border-default group-hover:text-primary-default group-hover:border-primary-default/20 transition-all shadow-sm">
                {React.cloneElement(icon as React.ReactElement, { size: 16 })}
            </div>
            <div className="flex-1">
                {isEditable ? (
                    <input 
                        type="text" 
                        value={value || ''} 
                        onChange={(e) => onEdit?.(e.target.value)}
                        className="erp-input w-full h-8 px-3 text-[13px] font-semibold text-text-primary" 
                    />
                ) : (
                    isBadge ? (
                        <span className={`erp-badge uppercase px-2 py-0.5 text-[10px] font-bold border ${value === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-gray-100 text-text-secondary border-gray-200'}`}>
                            {value}
                        </span>
                    ) : (
                        <p className="text-[14px] font-bold text-text-primary tracking-tight leading-tight">{value || '---'}</p>
                    )
                )}
            </div>
        </div>
    </div>
);

const FormField = ({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-tight flex items-center space-x-1 pl-1">
            <span>{label}</span>
            {required && <span className="text-error font-bold ml-1">*</span>}
        </label>
        <div className="relative group">
            {React.cloneElement(children as React.ReactElement<{ className?: string }>, {
                className: `erp-input h-9 text-[13px] font-semibold px-3 bg-white border-border-default focus:border-primary-default transition-all ${ (children as React.ReactElement<{ className?: string }>).props.className || '' }`
            })}
        </div>
    </div>
);

export default SchoolProfile;
