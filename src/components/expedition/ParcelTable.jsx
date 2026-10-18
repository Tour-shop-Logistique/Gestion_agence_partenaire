import React, { useState } from 'react';
import { Package, X } from 'lucide-react';
import { getCurrencyLabel } from '../../utils/format';

/**
 * 📦 TABLE DES COLIS AMÉLIORÉE
 * Zebra rows, highlight, résumé
 */
const ParcelTable = ({ colis = [], formatCurrency, devise }) => {
    // Photo du colis agrandie (renseignée par le client à la demande).
    const [photoOuverte, setPhotoOuverte] = useState(null);

    const totalWeight = colis.reduce((sum, c) => sum + parseFloat(c.poids || 0), 0);
    const totalAmount = colis.reduce((sum, c) => sum + parseFloat(c.montant_colis_total || 0), 0);
    const totalEstimation = colis.reduce((sum, c) => sum + parseFloat(c.prix_estimation || 0), 0);

    if (colis.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Inventaire des Colis
                    </h2>
                </div>
                <div className="p-12 text-center">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-400">Aucun colis enregistré</p>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {/* Header avec résumé */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Inventaire des Colis
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {colis.length} colis • {totalWeight.toFixed(1)} KG total
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Total frais</p>
                        <p className="text-lg font-bold text-indigo-600">
                            {new Intl.NumberFormat('fr-FR').format(totalAmount)} {getCurrencyLabel(devise)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[12%]">
                                Code
                            </th>
                            <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[28%]">
                                Désignation
                            </th>
                            <th className="px-3 py-3 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[10%]">
                                Poids
                            </th>
                            <th className="px-3 py-3 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[15%]">
                                Catégorie
                            </th>
                            <th className="px-3 py-3 text-right text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[15%]">
                                Valeur estimée
                            </th>
                            <th className="px-3 py-3 text-right text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[20%]">
                                Frais
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {colis.map((parcel, idx) => (
                            <tr 
                                key={parcel.id} 
                                className={`
                                    border-b border-slate-100 transition-colors hover:bg-indigo-50/30
                                    ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                                `}
                            >
                                {/* Code */}
                                <td className="px-3 py-3">
                                    <span className="text-xs font-mono font-bold text-slate-700 block truncate">
                                        {parcel.code_colis || `COL-${idx + 1}`}
                                    </span>
                                </td>

                                {/* Désignation */}
                                <td className="px-3 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {parcel.photo_url && (
                                            <button
                                                type="button"
                                                onClick={() => setPhotoOuverte({ url: parcel.photo_url, code: parcel.code_colis })}
                                                title="Voir la photo du colis"
                                                className="shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-400 hover:ring-2 hover:ring-indigo-100 transition-all"
                                            >
                                                <img
                                                    src={parcel.photo_url}
                                                    alt={`Photo du colis ${parcel.code_colis || idx + 1}`}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {parcel.designation}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                                {Array.isArray(parcel.articles)
                                                    ? parcel.articles
                                                        .map(a => (typeof a === 'string' ? a : a?.designation))
                                                        .filter(Boolean)
                                                        .join(', ') || 'N/A'
                                                    : parcel.articles || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Poids */}
                                <td className="px-3 py-3 text-center">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg whitespace-nowrap">
                                        <span className="text-xs font-bold text-blue-900">
                                            {parcel.poids}
                                        </span>
                                        <span className="text-[10px] font-bold text-blue-600">KG</span>
                                    </span>
                                </td>

                                {/* Catégorie */}
                                <td className="px-3 py-3 text-center">
                                    <span className="text-xs font-medium text-slate-600 uppercase truncate block">
                                        {parcel.category?.nom || '-'}
                                    </span>
                                </td>

                                {/* Valeur estimée */}
                                <td className="px-3 py-3 text-right">
                                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                                        {new Intl.NumberFormat('fr-FR').format(parcel.prix_estimation || 0)} <span className="text-[9px] text-slate-500 font-bold">{getCurrencyLabel(devise)}</span>
                                    </span>
                                </td>

                                {/* Frais */}
                                <td className="px-3 py-3 text-right">
                                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                                        {new Intl.NumberFormat('fr-FR').format(parcel.montant_colis_total || 0)} <span className="text-[9px] text-slate-500 font-bold">{getCurrencyLabel(devise)}</span>
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    {/* Footer avec totaux */}
                    <tfoot>
                        <tr className="bg-slate-100 border-t-2 border-slate-300">
                            <td colSpan="2" className="px-3 py-3">
                                <span className="text-xs font-bold text-slate-700 uppercase">
                                    Total ({colis.length} colis)
                                </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 border border-blue-300 rounded-lg whitespace-nowrap">
                                    <span className="text-xs font-bold text-blue-900">
                                        {totalWeight.toFixed(1)}
                                    </span>
                                    <span className="text-[10px] font-bold text-blue-700">KG</span>
                                </span>
                            </td>
                            <td className="px-3 py-3"></td>
                            <td className="px-3 py-3 text-right">
                                <span className="text-base font-bold text-slate-700 tabular-nums">
                                    {new Intl.NumberFormat('fr-FR').format(totalEstimation)} <span className="text-[10px] text-slate-500 font-bold">{getCurrencyLabel(devise)}</span>
                                </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                                <span className="text-base font-bold text-indigo-600 tabular-nums">
                                    {new Intl.NumberFormat('fr-FR').format(totalAmount)} <span className="text-[10px] text-indigo-500 font-bold">{getCurrencyLabel(devise)}</span>
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        {photoOuverte && (
            <div
                className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
                onClick={() => setPhotoOuverte(null)}
            >
                <button
                    type="button"
                    onClick={() => setPhotoOuverte(null)}
                    aria-label="Fermer"
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="max-w-full max-h-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <img
                        src={photoOuverte.url}
                        alt={`Photo du colis ${photoOuverte.code || ''}`}
                        className="max-w-full max-h-[85vh] object-contain rounded-lg"
                    />
                    {photoOuverte.code && (
                        <span className="text-xs font-mono font-bold text-white/80">{photoOuverte.code}</span>
                    )}
                </div>
            </div>
        )}
        </>
    );
};

export default ParcelTable;
