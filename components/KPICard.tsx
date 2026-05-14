import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon, trend }) => {
  return (
    <div className="erp-card p-4 bg-white border border-border-default hover:border-primary-default transition-all group shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <label className="text-[11px] font-bold text-text-secondary mb-1.5 block uppercase tracking-wider opacity-60 leading-none">{label}</label>
          <div className="text-[20px] font-bold text-text-primary leading-tight tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {trend && (
            <div className="flex items-center mt-2.5">
              <span className="text-[10px] font-bold text-primary-default uppercase tracking-tight opacity-80">{trend}</span>
            </div>
          )}
        </div>
        <div className="w-9 h-9 rounded bg-slate-50 border border-border-default flex items-center justify-center text-text-secondary group-hover:text-primary-default group-hover:border-primary-default/20 transition-all">
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 18 }) : icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
