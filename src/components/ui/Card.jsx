import React from 'react';

/**
 * Composant Card du Design System
 */
const Card = ({ children, className = '', padding = true, ...props }) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header
 */
export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Card Section
 */
export const CardSection = ({ children, className = '' }) => {
  return (
    <div className={`py-4 border-t border-slate-100 first:border-t-0 first:pt-0 last:pb-0 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
