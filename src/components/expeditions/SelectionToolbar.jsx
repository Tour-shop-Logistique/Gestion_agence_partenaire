import React from 'react';
import { 
    XMarkIcon,
    DocumentArrowDownIcon,
    PrinterIcon,
    CheckCircleIcon,
    BanknotesIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

/**
 * 🎯 TOOLBAR DE SÉLECTION MULTIPLE
 * Style: Gmail / Google Drive
 * - Actions groupées
 * - Animation d'apparition
 * - Design moderne
 */

const SelectionToolbar = ({ 
    selectedCount, 
    onClearSelection,
    onExport,
    onPrint,
    onChangeStatus,
    onMarkAsPaid,
    onDelete
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-4 min-w-[320px]">
                <div className="flex items-center justify-between gap-4">
                    {/* Selection info */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClearSelection}
                            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="text-sm font-bold">
                                {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-slate-400">
                                Choisissez une action
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onExport}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                            title="Exporter"
                        >
                            <DocumentArrowDownIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={onPrint}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                            title="Imprimer"
                        >
                            <PrinterIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={onChangeStatus}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                            title="Changer le statut"
                        >
                            <CheckCircleIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={onMarkAsPaid}
                            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors"
                            title="Marquer comme payé"
                        >
                            <BanknotesIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={onDelete}
                            className="p-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors"
                            title="Supprimer"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectionToolbar;
