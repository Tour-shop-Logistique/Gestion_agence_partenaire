import React from 'react';

/**
 * Composant Input du Design System
 */
const Input = ({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={`
            w-full px-3 py-2 bg-white border rounded-lg text-sm
            ${Icon ? 'pl-9' : ''}
            ${error ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'}
            focus:outline-none focus:ring-1 transition-all
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
};

/**
 * Select Input
 */
export const Select = ({ 
  label, 
  error, 
  children,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2 bg-white border rounded-lg text-sm
          ${error ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'}
          focus:outline-none focus:ring-1 transition-all
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
