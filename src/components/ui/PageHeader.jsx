import React from 'react';

/**
 * Composant PageHeader du Design System
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  actions,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 ${className}`}>
      <div>
        <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
