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
    const labelsA4Ref = useRef(null);
    const [labelFormat, setLabelFormat] = React.useState('thermal'); // 'thermal' or 'a4'

    const handlePrintA4 = useReactToPrint({
        contentRef: componentRefA4,
        documentTitle: `Recu_Client_${expedition.id}`,
    });

    const handlePrintAllLabels = useReactToPrint({
        contentRef: labelFormat === 'thermal' ? labelsRef : labelsA4Ref,
        documentTitle: `Etiquettes_Expedition_${expedition.id}`,
    });

    // Internal component for printing thermal labels
    const ThermalPrinter = ({ colis, index }) => {
        const ref = useRef(null);
        const refA4 = useRef(null);
        const print = useReactToPrint({
            contentRef: labelFormat === 'thermal' ? ref : refA4,
            documentTitle: `Etiquette_${colis.code_colis}`,
        });

        return (
            <div className="group flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all duration-150">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        <Squares2X2Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {colis.designation || 'Colis'} · <span className="text-slate-600">{colis.poids}kg</span>
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                            {colis.code_colis}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => print()}
                    className="p-2 bg-slate-100 hover:bg-slate-900 rounded-lg text-slate-600 hover:text-white transition-colors"
                    title="Imprimer l'étiquette"
                >
                    <PrinterIcon className="w-4 h-4" />
                </button>

                {/* Hidden thermal component */}
                <div className="hidden">
                    <ReceiptThermal ref={ref} expedition={expedition} colis={colis} agency={agency} />
                </div>
                
                {/* Hidden A4 component */}
                <div className="hidden">
                    <div ref={refA4}>
                        <ReceiptThermal expedition={expedition} colis={colis} agency={agency} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 my-4">
                
                {/* Professional Header */}
                <div className="relative px-6 py-4 bg-white border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                                <CheckCircleIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Expédition créée avec succès
                                </h2>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Référence : <span className="font-semibold text-slate-900">#{expedition.reference || expedition.id}</span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Fermer"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Professional Body - Two Column Layout */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-slate-50">

                    {/* A4 Receipt Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                                <DocumentTextIcon className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Reçu Client</h3>
                                <p className="text-xs text-slate-500">Format A4 standard</p>
                            </div>
                        </div>

                        {/* Professional Preview */}
                        <div
                            onClick={() => handlePrintA4()}
                            className="group relative aspect-[1/1.4] bg-white rounded-xl border-2 border-slate-200 hover:border-slate-400 overflow-hidden cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                                <div className="text-center space-y-3">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto">
                                        <PrinterIcon className="w-7 h-7 text-slate-900" />
                                    </div>
                                    <p className="text-sm font-semibold text-white">Cliquer pour imprimer</p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="absolute inset-0 flex items-center justify-center p-2">
                                <div className="w-full h-full bg-white overflow-hidden flex items-center justify-center">
                                    <div className="scale-[0.35] origin-center">
                                        <ReceiptA4 expedition={expedition} agency={agency} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handlePrintA4()}
                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            Imprimer le reçu
                        </button>
                    </div>

                    {/* Labels Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                                    <Squares2X2Icon className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Étiquettes Colis
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {expedition.colis?.length || 0} étiquette{(expedition.colis?.length || 0) > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {expedition.colis?.length > 1 && (
                                <button
                                    onClick={() => handlePrintAllLabels()}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                >
                                    Tout imprimer
                                </button>
                            )}
                        </div>

                        {/* Format Selector - Professional */}
                        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-xs font-semibold text-slate-600 mr-1">Format :</span>
                            <div className="flex gap-2 flex-1">
                                <button
                                    onClick={() => setLabelFormat('thermal')}
                                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                                        labelFormat === 'thermal'
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    Thermique 58mm
                                </button>
                                <button
                                    onClick={() => setLabelFormat('a4')}
                                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                                        labelFormat === 'a4'
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    A4 (2 par page)
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        {expedition.colis && expedition.colis.length > 0 && (
                            <div className="relative bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                <div className="flex justify-center py-2">
                                    <div className="scale-[0.5] origin-center">
                                        <ReceiptThermal expedition={expedition} colis={expedition.colis[0]} agency={agency} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium text-center pb-2">
                                    Aperçu {expedition.colis.length > 1 ? `(1/${expedition.colis.length})` : ''}
                                </p>
                            </div>
                        )}

                        {/* Colis List - Professional */}
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {expedition.colis && expedition.colis.length > 0 ? (
                                expedition.colis.map((c, i) => (
                                    <ThermalPrinter key={i} colis={c} index={i} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-lg border border-slate-200">
                                    <Squares2X2Icon className="w-10 h-10 text-slate-300 mb-2" />
                                    <p className="text-sm font-semibold text-slate-500">Aucun colis</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Professional Footer */}
                <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="font-medium">Expédition enregistrée</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Fermer
                        </button>
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Tableau de bord
                        </button>
                    </div>
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

                {/* Hidden batch print for A4 labels (2 per page) */}
                <div className="hidden">
                    <div ref={labelsA4Ref}>
                        {expedition.colis?.reduce((pages, colis, index) => {
                            const pageIndex = Math.floor(index / 2);
                            if (!pages[pageIndex]) {
                                pages[pageIndex] = [];
                            }
                            pages[pageIndex].push(colis);
                            return pages;
                        }, []).map((pageColis, pageIdx) => (
                            <div 
                                key={pageIdx} 
                                style={{ 
                                    pageBreakAfter: pageIdx < Math.ceil((expedition.colis?.length || 0) / 2) - 1 ? 'always' : 'auto',
                                    width: '210mm',
                                    height: '297mm',
                                    padding: '10mm',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '10mm',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center'
                                }}
                            >
                                {pageColis.map((c, idx) => (
                                    <div 
                                        key={idx}
                                        style={{
                                            flex: '0 0 auto',
                                            width: '90mm'
                                        }}
                                    >
                                        <ReceiptThermal expedition={expedition} colis={c} agency={agency} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintSuccessModal;
