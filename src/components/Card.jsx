import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  headerActions,
  footer,
  ...props 
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle || headerActions) && (
        <div className="card-header">
          <div className="flex justify-between items-start">
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
            {headerActions && (
              <div className="flex gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
