import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ReceiptA4 from './ReceiptA4';
import ReceiptThermal from './ReceiptThermal';
import {
    PrinterIcon,
    DocumentTextIcon,
    Squares2X2Icon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const PrintSuccessModal = ({ expedition, agency, onClose }) => {
    const componentRefA4 = useRef(null);
    const labelsRef = useRef(null);

    const handlePrintA4 = useReactToPrint({
        contentRef: componentRefA4,
        documentTitle: `Recu_Client_${expedition.id}`,
    });

    const handlePrintAllLabels = useReactToPrint({
        contentRef: labelsRef,
        documentTitle: `Etiquettes_Expedition_${expedition.id}`,
    });

    // Internal component for printing thermal labels
    const ThermalPrinter = ({ colis, index }) => {
        const ref = useRef(null);
        const print = useReactToPrint({
            contentRef: ref,
            documentTitle: `Etiquette_${colis.code_colis}`,
        });

        return (
            <div className="group flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Squares2X2Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">
                            {colis.designation || 'Colis'} · {colis.poids}kg
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                            {colis.code_colis}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => print()}
                    className="p-2 bg-slate-50 hover:bg-slate-900 rounded-lg text-slate-600 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Imprimer l'étiquette"
                >
                    <PrinterIcon className="w-4 h-4" />
                </button>

                {/* Hidden thermal component */}
                <div className="hidden">
                    <ReceiptThermal ref={ref} expedition={expedition} colis={colis} agency={agency} />
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-200 my-4">

                {/* Compact Header */}
                <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <CheckCircleIcon className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                Expédition créée
                            </h2>
                            <p className="text-xs font-medium text-slate-500">
                                Réf. <span className="font-bold text-indigo-600">#{expedition.reference || expedition.id}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Compact Body - Two Column */}
                <div className="p-6 grid grid-cols-2 gap-6">

                    {/* A4 Receipt with Preview */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                            <h3 className="text-sm font-bold text-slate-900">Reçu Client A4</h3>
                        </div>

                        {/* Compact Preview with Click Action */}
                        <div
                            onClick={() => handlePrintA4()}
                            className="group relative aspect-[1/1.3] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 hover:border-indigo-300 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl"
                        >
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto">
                                        <PrinterIcon className="w-7 h-7 text-slate-900" />
                                    </div>
                                    <p className="text-xs font-bold text-white uppercase">Cliquer pour imprimer</p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="absolute inset-0">
                                <div className="w-full h-full bg-white overflow-hidden flex justify-center">
                                    <div className="scale-[0.27] origin-top">
                                        <ReceiptA4 expedition={expedition} agency={agency} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handlePrintA4()}
                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Imprimer Reçu A4
                        </button>
                    </div>

                    {/* Thermal Labels - Simplified */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Squares2X2Icon className="w-5 h-5 text-slate-600" />
                                <h3 className="text-sm font-bold text-slate-900">
                                    Étiquettes ({expedition.colis?.length || 0})
                                </h3>
                            </div>

                            {expedition.colis?.length > 1 && (
                                <button
                                    onClick={() => handlePrintAllLabels()}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wide"
                                >
                                    Tout imprimer
                                </button>
                            )}
                        </div>

                        {/* Compact Thermal Preview */}
                        {expedition.colis && expedition.colis.length > 0 && (
                            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 overflow-hidden p-3">
                                <div className="flex justify-center">
                                    <div className="scale-[0.55] origin-center">
                                        <ReceiptThermal expedition={expedition} colis={expedition.colis[0]} agency={agency} />
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide text-center mt-1">
                                    Aperçu {expedition.colis.length > 1 ? `(1/${expedition.colis.length})` : ''}
                                </p>
                            </div>
                        )}

                        {/* Compact Colis List */}
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                            {expedition.colis && expedition.colis.length > 0 ? (
                                expedition.colis.map((c, i) => (
                                    <ThermalPrinter key={i} colis={c} index={i} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Squares2X2Icon className="w-10 h-10 text-slate-300 mb-2" />
                                    <p className="text-sm font-bold text-slate-500">Aucun colis</p>
                                </div>
                            )}
                        </div>

                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide text-center">
                            Format 58mm
                        </p>
                    </div>

                </div>

                {/* Compact Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg uppercase tracking-wide transition-all"
                    >
                        Fermer
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl"
                    >
                        Tableau de bord
                    </button>
                </div>

                {/* Real hidden components for printing */}
                <div className="hidden">
                    <ReceiptA4 ref={componentRefA4} expedition={expedition} agency={agency} />
                </div>

                {/* Hidden batch print for labels */}
                <div className="hidden">
                    <div ref={labelsRef}>
                        {expedition.colis?.map((c, i) => (
                            <div key={i} style={{ pageBreakAfter: 'always' }}>
                                <ReceiptThermal expedition={expedition} colis={c} agency={agency} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintSuccessModal;
