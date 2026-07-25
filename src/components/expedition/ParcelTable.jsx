import React from 'react';
import { Package } from 'lucide-react';

/**
 * 📦 TABLE DES COLIS AMÉLIORÉE
 * Zebra rows, highlight, résumé
 */
const ParcelTable = ({ colis = [], formatCurrency }) => {
    const totalWeight = colis.reduce((sum, c) => sum + parseFloat(c.poids || 0), 0);
    const totalAmount = colis.reduce((sum, c) => sum + parseFloat(c.montant_colis_total || 0), 0);

    if (colis.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
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
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Header avec résumé */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                            Inventaire des Colis
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            {colis.length} colis • {totalWeight.toFixed(1)} KG total
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Total frais</p>
                        <p className="text-lg font-bold text-indigo-600">
                            {new Intl.NumberFormat('fr-FR').format(totalAmount)} CFA
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[15%]">
                                Code
                            </th>
                            <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[35%]">
                                Désignation
                            </th>
                            <th className="px-3 py-3 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[12%]">
                                Poids
                            </th>
                            <th className="px-3 py-3 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[18%]">
                                Catégorie
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
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {parcel.designation}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                            {Array.isArray(parcel.articles) 
                                                ? parcel.articles.join(', ') 
                                                : parcel.articles || 'N/A'}
                                        </p>
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

                                {/* Frais */}
                                <td className="px-3 py-3 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                                            {new Intl.NumberFormat('fr-FR').format(parcel.montant_colis_total || 0)}
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-bold">CFA</span>
                                    </div>
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
                                <div className="flex flex-col items-end">
                                    <span className="text-base font-bold text-indigo-600 tabular-nums">
                                        {new Intl.NumberFormat('fr-FR').format(totalAmount)}
                                    </span>
                                    <span className="text-[10px] text-indigo-500 font-bold">CFA</span>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default ParcelTable;
