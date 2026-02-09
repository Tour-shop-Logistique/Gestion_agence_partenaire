import React, { useState, useEffect } from 'react';
import { formatPrice } from '../utils/format';
import {
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    ScaleIcon,
    MapPinIcon
} from "@heroicons/react/24/outline";

const SingleInitializeModal = ({
    isOpen,
    onClose,
    tarif,
    onConfirm,
    loading,
    title = "Initialisation Rapide",
    subtitle = "Ajout d'un tarif individuel",
    initialPercentage = 15
}) => {
    const [percentage, setPercentage] = useState(initialPercentage);
    const [calculatedTotal, setCalculatedTotal] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setPercentage(initialPercentage);
        }
    }, [isOpen, initialPercentage]);

    useEffect(() => {
        if (tarif) {
            const montantBase = parseFloat(tarif.montant_base) || 0;
            const montantPrestation = (montantBase * percentage) / 100;
            setCalculatedTotal(montantBase + montantPrestation);
        }
    }, [tarif, percentage]);

    if (!isOpen || !tarif) return null;

    return (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

                <div className="relative inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all sm:my-8 sm:align-middle">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                <ScaleIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 space-y-6">
                        {/* Context Card */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg">
                                {tarif.indice}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Indice</span>
                                    <div className="h-4 w-px bg-slate-200"></div>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Modèle</span>
                                </div>
                                <p className="text-sm font-black text-slate-900 truncate leading-tight mb-1">
                                    {tarif.zone?.nom || tarif.nom_zone}
                                </p>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <MapPinIcon className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold">{tarif.zone_destination_id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Input Section */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                                    Pourcentage de Prestation (%)
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={percentage}
                                        onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                                        className="w-full h-12 px-4 bg-white border-2 border-slate-100 rounded-xl text-lg font-black text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        placeholder="15"
                                        autoFocus
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">%</div>
                                </div>
                            </div>

                            {/* Summary Table */}
                            <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                                <div className="px-4 py-3 flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Montant de Base</span>
                                    <span className="text-slate-900 font-bold">{formatPrice(tarif.montant_base, "XOF")}</span>
                                </div>
                                <div className="px-4 py-3 flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Frais Prestation (+{percentage}%)</span>
                                    <span className="text-indigo-600 font-black">+{formatPrice((tarif.montant_base * percentage) / 100, "XOF")}</span>
                                </div>
                                <div className="px-4 py-4 flex justify-between items-center bg-indigo-50/50">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Expédition</span>
                                    <span className="text-xl font-black text-indigo-700">{formatPrice(calculatedTotal, "XOF")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 h-11 text-sm font-black text-slate-500 hover:text-slate-700 hover:bg-white rounded-xl transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => onConfirm(percentage)}
                            disabled={loading}
                            className="flex-[1.5] h-11 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-sm font-black shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckIcon className="w-5 h-5" />
                                    Initialiser le Tarif
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleInitializeModal;
