import React from 'react';

/**
 * Composant Table du Design System
 */
const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left border-collapse ${className}`}>
        {children}
      </table>
    </div>
  );
};

/**
 * Table Header
 */
export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-slate-50 border-b border-slate-200">
      {children}
    </thead>
  );
};

/**
 * Table Header Cell
 */
export const TableHeaderCell = ({ children, align = 'left', className = '' }) => {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <th className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide ${alignments[align]} ${className}`}>
      {children}
    </th>
  );
};

/**
 * Table Body
 */
export const TableBody = ({ children }) => {
  return (
    <tbody className="divide-y divide-slate-100">
      {children}
    </tbody>
  );
};

/**
 * Table Row
 */
export const TableRow = ({ children, onClick, className = '' }) => {
  return (
    <tr 
      className={`hover:bg-slate-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

/**
 * Table Cell
 */
export const TableCell = ({ children, align = 'left', className = '' }) => {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <td className={`px-4 py-3 text-sm text-slate-700 ${alignments[align]} ${className}`}>
      {children}
    </td>
  );
};

/**
 * Empty State
 */
export const TableEmpty = ({ message = "Aucune donnée disponible", icon: Icon }) => {
  return (
    <tr>
      <td colSpan="100" className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          {Icon && (
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-slate-400" />
            </div>
          )}
          <p className="text-sm text-slate-500 font-medium">{message}</p>
        </div>
      </td>
    </tr>
  );
};

/**
 * Loading State
 */
export const TableLoading = ({ rows = 5, cols = 5 }) => {
  return (
    <>
      {Array(rows).fill(0).map((_, i) => (
        <tr key={i}>
          {Array(cols).fill(0).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-slate-100 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default Table;
