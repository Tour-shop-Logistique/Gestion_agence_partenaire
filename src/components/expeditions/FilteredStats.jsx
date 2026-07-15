import React from 'react';

/**
 * 📈 STATISTIQUES FILTRÉES
 * Style: Stripe Dashboard
 * - Affichage des résultats filtrés
 * - Métriques clés
 * - Design compact
 */

const FilteredStats = ({ expeditions, getAgencyCommission }) => {
    if (!expeditions || expeditions.length === 0) return null;

    const totalCount = expeditions.length;
    const totalAmount = expeditions.reduce((sum, e) => sum + parseFloat(e.montant_expedition || 0), 0);
    const totalCommission = expeditions.reduce((sum, e) => sum + getAgencyCommission(e), 0);
    const totalColis = expeditions.reduce((sum, e) => sum + (e.colis?.length || 0), 0);
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl border border-indigo-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                    Statistiques de sélection
                </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Total résultats */}
                <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Résultats
                    </p>
                    <p className="text-xl font-bold text-slate-900 tabular-nums">
                        {totalCount}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        expéditions
                    </p>
                </div>

                {/* Montant total */}
                <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Montant
                    </p>
                    <p className="text-xl font-bold text-purple-600 tabular-nums">
                        {formatCurrency(totalAmount)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        CFA total
                    </p>
                </div>

                {/* Commission */}
                <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Commission
                    </p>
                    <p className="text-xl font-bold text-indigo-600 tabular-nums">
                        {formatCurrency(totalCommission)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        CFA agence
                    </p>
                </div>

                {/* Nombre de colis */}
                <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Colis
                    </p>
                    <p className="text-xl font-bold text-emerald-600 tabular-nums">
                        {totalColis}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        total
                    </p>
                </div>

                {/* Montant moyen */}
                <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Moyenne
                    </p>
                    <p className="text-xl font-bold text-amber-600 tabular-nums">
                        {formatCurrency(averageAmount)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        CFA/exp
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FilteredStats;
