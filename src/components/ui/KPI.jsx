import React from 'react';

/**
 * Composant KPI Card du Design System
 */
const KPI = ({ 
  label, 
  value, 
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className = '' 
}) => {
  const variants = {
    default: 'bg-white border-slate-200',
    primary: 'bg-slate-900 border-slate-900 text-white',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-indigo-50 border-indigo-200'
  };
  
  const textColors = {
    default: 'text-slate-900',
    primary: 'text-white',
    success: 'text-emerald-900',
    warning: 'text-amber-900',
    info: 'text-indigo-900'
  };
  
  const subtitleColors = {
    default: 'text-slate-500',
    primary: 'text-slate-300',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    info: 'text-indigo-600'
  };
  
  return (
    <div className={`p-4 border rounded-xl shadow-sm ${variants[variant]} ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <p className={`text-xs font-semibold uppercase tracking-wide ${subtitleColors[variant]}`}>
          {label}
        </p>
        {Icon && (
          <Icon className={`w-4 h-4 ${subtitleColors[variant]} opacity-60`} />
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-bold ${textColors[variant]}`}>
          {value}
        </p>
        {trend && (
          <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className={`text-xs mt-1 ${subtitleColors[variant]}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KPI;
