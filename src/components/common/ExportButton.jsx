import React, { useState, useRef, useEffect } from 'react';
import { ArrowDownTrayIcon, ChevronDownIcon, TableCellsIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { exportToExcel } from '../../utils/excelHelper';
import { exportTableToPDF } from '../../utils/pdfExport';

/**
 * Bouton d'export Excel/PDF réutilisable, sur le modèle des boutons de
 * PageHeader existants. Ne connaît aucun store Redux : la page appelante
 * fournit columns/rows déjà résolus (valeurs aplaties, pas d'objets
 * imbriqués) - voir excelHelper.js/pdfExport.js pour le format attendu.
 *
 * Filet de sécurité anti-incident (miroir du backoffice-app) : permet à
 * toute agence de garder une copie de sa configuration (agents, rôles,
 * tarifs affichés) hors de la base de données.
 */
const ExportButton = ({ columns, rows, filename, title, subtitle = '', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDisabled = disabled || !rows || rows.length === 0;

  const handleExportExcel = () => {
    setIsOpen(false);
    exportToExcel(columns, rows, filename, title);
  };

  const handleExportPDF = async () => {
    setIsOpen(false);
    setIsExporting(true);
    try {
      exportTableToPDF(columns, rows, { title, subtitle, filename });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isDisabled || isExporting}
        className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        title="Exporter"
      >
        <ArrowDownTrayIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 sm:mr-2" />
        <span className="hidden sm:inline">Exporter</span>
        <ChevronDownIcon className={`hidden sm:inline w-3.5 h-3.5 ml-1.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 py-1.5 bg-white border border-slate-200 rounded-lg shadow-xl shadow-slate-200/50 z-[100] overflow-hidden min-w-[180px]">
          <button
            type="button"
            onClick={handleExportExcel}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <TableCellsIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            Exporter en Excel
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4 text-rose-600 shrink-0" />
            Exporter en PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
