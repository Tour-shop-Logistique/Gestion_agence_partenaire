import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Header de page standardisé : breadcrumb optionnel, bouton retour optionnel,
 * eyebrow/titre/badge/sous-titre à gauche, actions à droite.
 */
const PageHeader = ({
  title,
  subtitle,
  eyebrow,
  icon,
  badge,
  onBack,
  breadcrumb,
  actions,
  className = '',
}) => {
  return (
    <div className={className}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRightIcon className="w-3 h-3 text-slate-300 flex-shrink-0" />}
              {item.to && index < breadcrumb.length - 1 ? (
                <Link to={item.to} className="hover:text-slate-900 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
              {eyebrow}
            </p>
          )}
          <div className="flex items-center gap-2">
            {icon && (
              <div className="flex-shrink-0">{icon}</div>
            )}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Retour"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all flex-shrink-0"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 tracking-tight truncate">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <div className="text-xs sm:text-sm text-slate-600 mt-0.5">{subtitle}</div>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
