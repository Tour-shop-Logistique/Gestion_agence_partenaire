import React from 'react';

/**
 * Composant PageHeader avec typographie standardisée
 * 
 * @param {String} title - Titre principal de la page
 * @param {String} description - Description optionnelle
 * @param {ReactNode} actions - Boutons d'action à droite
 * @param {ReactNode} breadcrumb - Fil d'Ariane optionnel
 */
const PageHeader = ({ 
  title, 
  description, 
  actions,
  breadcrumb,
  className = ''
}) => {
  return (
    <div className={`page-header ${className}`}>
      {breadcrumb && (
        <div className="mb-3">
          {breadcrumb}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="page-title">{title}</h1>
          {description && (
            <p className="page-description">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Composant SectionHeader pour les sous-sections
 */
export const SectionHeader = ({ 
  title, 
  subtitle, 
  actions,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="section-title">{title}</h2>
          {subtitle && (
            <p className="section-subtitle">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Composant Breadcrumb
 */
export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {item.href ? (
              <a 
                href={item.href} 
                className="text-label-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-label-sm text-gray-900 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default PageHeader;
