import React from 'react';

/**
 * Composant Table professionnel avec typographie standardisée
 * 
 * @param {Array} columns - Définition des colonnes [{ key, label, align, render }]
 * @param {Array} data - Données à afficher
 * @param {Function} onRowClick - Callback au clic sur une ligne
 * @param {String} emptyMessage - Message si pas de données
 * @param {Boolean} loading - État de chargement
 */
const Table = ({ 
  columns = [], 
  data = [], 
  onRowClick,
  emptyMessage = "Aucune donnée disponible",
  loading = false,
  className = ""
}) => {
  
  const getAlignmentClass = (align) => {
    switch (align) {
      case 'center':
        return 'table-header-cell-center';
      case 'right':
        return 'table-header-cell-right';
      default:
        return 'table-header-cell-left';
    }
  };

  const getCellAlignmentClass = (align, isAmount = false) => {
    if (isAmount) return 'table-cell-amount';
    
    switch (align) {
      case 'center':
        return 'table-cell-center';
      case 'right':
        return 'table-cell-right';
      default:
        return 'table-cell-left';
    }
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-body text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-body text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={column.key || index} 
                className={getAlignmentClass(column.align)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              className={`table-row ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={`${rowIndex}-${column.key || colIndex}`}
                  className={getCellAlignmentClass(column.align, column.isAmount)}
                >
                  {column.render 
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key] || '—'
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
