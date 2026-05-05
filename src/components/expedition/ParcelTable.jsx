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
                <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Désignation
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Poids
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Catégorie
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
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
                                <td className="px-6 py-4">
                                    <span className="text-sm font-mono font-bold text-slate-700">
                                        {parcel.code_colis || `COL-${idx + 1}`}
                                    </span>
                                </td>

                                {/* Désignation */}
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {parcel.designation}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                            {Array.isArray(parcel.articles) 
                                                ? parcel.articles.join(', ') 
                                                : parcel.articles || 'N/A'}
                                        </p>
                                    </div>
                                </td>

                                {/* Poids */}
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                                        <span className="text-sm font-bold text-blue-900">
                                            {parcel.poids}
                                        </span>
                                        <span className="text-xs font-bold text-blue-600">KG</span>
                                    </span>
                                </td>

                                {/* Catégorie */}
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-medium text-slate-600 uppercase">
                                        {parcel.category?.nom || '-'}
                                    </span>
                                </td>

                                {/* Frais */}
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-bold text-slate-900">
                                        {new Intl.NumberFormat('fr-FR').format(parcel.montant_colis_total || 0)}
                                    </span>
                                    <span className="text-xs text-slate-500 ml-1">CFA</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    {/* Footer avec totaux */}
                    <tfoot>
                        <tr className="bg-slate-100 border-t-2 border-slate-300">
                            <td colSpan="2" className="px-6 py-4">
                                <span className="text-sm font-bold text-slate-700 uppercase">
                                    Total ({colis.length} colis)
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg">
                                    <span className="text-sm font-bold text-blue-900">
                                        {totalWeight.toFixed(1)}
                                    </span>
                                    <span className="text-xs font-bold text-blue-700">KG</span>
                                </span>
                            </td>
                            <td className="px-6 py-4"></td>
                            <td className="px-6 py-4 text-right">
                                <span className="text-base font-bold text-indigo-600">
                                    {new Intl.NumberFormat('fr-FR').format(totalAmount)}
                                </span>
                                <span className="text-xs text-indigo-500 ml-1 font-bold">CFA</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default ParcelTable;
