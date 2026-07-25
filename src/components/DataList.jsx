import React from 'react';

/**
 * Composant DataList pour afficher des paires clé-valeur
 * 
 * @param {Array} items - Tableau d'objets { label, value, isAmount }
 * @param {String} layout - 'vertical' ou 'horizontal'
 */
const DataList = ({ 
  items = [], 
  layout = 'vertical',
  className = '' 
}) => {
  
  if (layout === 'horizontal') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <p className="data-label">{item.label}</p>
            <p className={item.isAmount ? 'data-value-amount' : 'data-value'}>
              {item.value || '—'}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`data-list ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="data-item">
          <span className="data-label">{item.label}</span>
          <span className={item.isAmount ? 'data-value-amount' : 'data-value'}>
            {item.value || '—'}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Composant DataCard pour afficher des données dans une card
 */
export const DataCard = ({ 
  title, 
  items = [], 
  layout = 'vertical',
  className = '' 
}) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className="card-body">
        <DataList items={items} layout={layout} />
      </div>
    </div>
  );
};

/**
 * Composant StatCard pour afficher une statistique
 */
export const StatCard = ({ 
  label, 
  value, 
  subtitle,
  icon,
  trend,
  variant = 'default',
  className = '' 
}) => {
  
  const variants = {
    default: 'bg-white border-gray-200',
    primary: 'bg-primary-50 border-primary-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textVariants = {
    default: 'text-gray-900',
    primary: 'text-primary-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
    info: 'text-blue-700'
  };

  return (
    <div className={`card ${variants[variant]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="data-label mb-2">{label}</p>
          <p className={`amount-lg ${textVariants[variant]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-body-sm text-gray-600 mt-2">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.direction === 'up' ? (
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={`text-label-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}
              </span>
              <span className="text-caption text-gray-500 ml-1">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataList;
