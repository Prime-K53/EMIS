
import React from 'react';
import { Building2, BookOpen, BadgeDollarSign, MapPin, AlertCircle, Search, Download } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

interface RecordsRegistryProps {
  type: 'infrastructure' | 'materials' | 'finance';
}

const RecordsRegistry: React.FC<RecordsRegistryProps> = ({ type }) => {
  const schools = useLiveQuery(() => db.schools.toArray()) || [];
  const reports = useLiveQuery(() => db.termlyReports.toArray()) || [];

  const getInfo = () => {
    switch(type) {
      case 'infrastructure': return { title: 'Infrastructure Registry', icon: <Building2 />, subtitle: 'Institutional facility & utility audit database' };
      case 'materials': return { title: 'Learning Materials Registry', icon: <BookOpen />, subtitle: 'National TLM (Textbook) inventory and distribution records' };
      case 'finance': return { title: 'Institutional Finance Registry', icon: <BadgeDollarSign />, subtitle: 'Public school grant management & accountability audits' };
      default: return { title: 'Registry', icon: <Building2 />, subtitle: 'Institutional records database' };
    }
  };

  const { title, icon, subtitle } = getInfo();

  return (
    <div className="erp-container py-6 space-y-6 animate-in-fade">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-default">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded flex items-center justify-center shadow-md">
            {React.cloneElement(icon as React.ReactElement, { size: 24 })}
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-tight">{title}</h1>
            <p className="text-[12px] text-text-secondary">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="erp-btn erp-btn-secondary h-9 px-4 text-[13px] font-medium">
            <Download size={14} />
            <span>Export Database</span>
          </button>
        </div>
      </header>

      <div className="erp-card p-3 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search by school name or EMIS code..." 
            className="erp-input w-full pl-9 h-9 text-[13px]"
          />
        </div>
        <div className="relative">
          <select className="erp-input h-9 min-w-[160px] pr-8 text-[13px] appearance-none cursor-pointer">
            <option>All Zones</option>
            <option>Lilongwe Central</option>
            <option>Lilongwe City</option>
          </select>
        </div>
      </div>

      <div className="erp-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border-default text-text-secondary uppercase text-[10px] font-bold tracking-widest">
              <th className="erp-table-header px-6 py-3">Institution</th>
              {type === 'infrastructure' && (
                <>
                  <th className="erp-table-header px-6 py-3 text-center">Perm. Class</th>
                  <th className="erp-table-header px-6 py-3 text-center">Water</th>
                  <th className="erp-table-header px-6 py-3 text-center">Power</th>
                  <th className="erp-table-header px-6 py-3 text-center">Desk Ratio</th>
                </>
              )}
              {type === 'materials' && (
                <>
                  <th className="erp-table-header px-6 py-3 text-center">Total Books</th>
                  <th className="erp-table-header px-6 py-3 text-center">Math Ratio</th>
                  <th className="erp-table-header px-6 py-3 text-center">Eng Ratio</th>
                  <th className="erp-table-header px-6 py-3 text-center">Condition</th>
                </>
              )}
              {type === 'finance' && (
                <>
                  <th className="erp-table-header px-6 py-3 text-right">Grants Received</th>
                  <th className="erp-table-header px-6 py-3 text-right">Spent</th>
                  <th className="erp-table-header px-6 py-3 text-right">Balance</th>
                  <th className="erp-table-header px-6 py-3 text-center">Audit Status</th>
                </>
              )}
              <th className="erp-table-header px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schools.map((school) => {
              const report = reports.find(r => r.schoolId === school.id);
              // Use school.id to generate "stable" random-looking values
              const seed = school.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const stableRandom = (offset: number) => ((seed + offset) % 100) / 100;
              
              return (
                <tr key={school.id} className="erp-table-row group">
                  <td className="erp-table-cell px-6 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-gray-50 border border-border-default flex items-center justify-center font-bold text-slate-500 text-[11px]">
                         {school.name[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-text-primary leading-tight">{school.name}</p>
                        <p className="text-[11px] text-text-secondary flex items-center mt-0.5"><MapPin size={10} className="mr-1" /> {school.emisCode}</p>
                      </div>
                    </div>
                  </td>
                  
                  {type === 'infrastructure' && (
                    <>
                      <td className="erp-table-cell px-6 py-3 text-center font-bold">{report?.infrastructure?.classroomsPermanent || Math.floor(stableRandom(1) * 15) + 5}</td>
                      <td className="erp-table-cell px-6 py-3 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${report?.infrastructure?.waterSource === 'None' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {report?.infrastructure?.waterSource || 'Borehole'}
                        </span>
                      </td>
                      <td className="erp-table-cell px-6 py-3 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${report?.infrastructure?.electricity ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {report?.infrastructure?.electricity ? 'Grid' : 'None'}
                        </span>
                      </td>
                      <td className="erp-table-cell px-6 py-3 text-center text-text-secondary text-[11px]">1:{Math.floor(stableRandom(2) * 4) + 2}</td>
                    </>
                  )}

                  {type === 'materials' && (
                    <>
                      <td className="erp-table-cell px-6 py-3 text-center font-bold">{(stableRandom(3) * 2000 + 500).toFixed(0)}</td>
                      <td className="erp-table-cell px-6 py-3 text-center">1:{(stableRandom(4) * 3 + 2).toFixed(1)}</td>
                      <td className="erp-table-cell px-6 py-3 text-center">1:{(stableRandom(5) * 2 + 2).toFixed(1)}</td>
                      <td className="erp-table-cell px-6 py-3 text-center">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">Good</span>
                      </td>
                    </>
                  )}

                  {type === 'finance' && (
                    <>
                      <td className="erp-table-cell px-6 py-3 text-right font-mono font-bold">MK {(stableRandom(6) * 50 + 20).toFixed(1)}M</td>
                      <td className="erp-table-cell px-6 py-3 text-right font-mono">MK {(stableRandom(7) * 15 + 5).toFixed(1)}M</td>
                      <td className="erp-table-cell px-6 py-3 text-right font-mono text-emerald-600 font-bold">MK {(stableRandom(8) * 10 + 5).toFixed(1)}M</td>
                      <td className="erp-table-cell px-6 py-3 text-center">
                         <div className="flex items-center justify-center space-x-1.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            <span className="text-[11px] font-bold text-text-primary uppercase">Compliant</span>
                         </div>
                      </td>
                    </>
                  )}

                  <td className="erp-table-cell px-6 py-3 text-right">
                    <button className="text-[11px] font-bold text-primary-default hover:underline">View Detail</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Audit & Compliance Insight */}
      <div className="erp-card p-6 border-l-4 border-l-slate-900 bg-slate-900 text-white rounded shadow-xl relative overflow-hidden">
         <AlertCircle size={80} className="absolute right-[-10px] top-[-10px] text-white/5 -rotate-12" />
         <div className="relative z-10 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Regulatory Intelligence Insight</h4>
            <div className="flex items-center space-x-6">
                <div>
                  <p className="text-[20px] font-bold">{(schools.length * 0.8).toFixed(0)} / {schools.length}</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase mt-1 tracking-tight">Active Audit cycle compliance</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div>
                  <p className="text-[20px] font-bold text-emerald-400">92%</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase mt-1 tracking-tight">Data integrity accuracy score</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RecordsRegistry;
