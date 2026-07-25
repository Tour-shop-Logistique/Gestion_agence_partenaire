import React from 'react';
import { 
    CubeIcon, 
    CurrencyDollarIcon, 
    ChartBarIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { STATUS_CONFIG } from './StatusFilter';

/**
 * 📈 RÉSUMÉ DES EXPÉDITIONS
 * Affiche les indicateurs clés et le résumé par statut
 */

const ExpeditionsSummary = ({ expeditions, getAgencyCommission }) => {
    // Calculs des totaux
    const totalExpeditions = expeditions.length;
    const totalMontant = expeditions.reduce((sum, exp) => sum + parseFloat(exp.montant_expedition || 0), 0);
    const totalCommission = expeditions.reduce((sum, exp) => sum + getAgencyCommission(exp), 0);

    // Comptage par statut
    const statusCounts = React.useMemo(() => {
        const counts = {};
        expeditions.forEach(exp => {
            const status = exp.statut_expedition;
            counts[status] = (counts[status] || 0) + 1;
        });
        return counts;
    }, [expeditions]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
    };

    return (
        <div className="space-y-4">
            {/* Cartes KPI principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Expéditions */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-5 border-2 border-indigo-200 shadow-lg shadow-indigo-100/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <CubeIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Total</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-indigo-900 tracking-tight">{totalExpeditions}</p>
                        <p className="text-xs font-medium text-indigo-600">Expédition{totalExpeditions > 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Montant Total */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border-2 border-emerald-200 shadow-lg shadow-emerald-100/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                            <CurrencyDollarIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Montant</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-emerald-900 tracking-tight">{formatCurrency(totalMontant)}</p>
                        <p className="text-xs font-medium text-emerald-600">CFA</p>
                    </div>
                </div>

                {/* Commission Agence */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border-2 border-purple-200 shadow-lg shadow-purple-100/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                            <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Commission</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-purple-900 tracking-tight">{formatCurrency(totalCommission)}</p>
                        <p className="text-xs font-medium text-purple-600">CFA</p>
                    </div>
                </div>

                {/* Taux de commission */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border-2 border-amber-200 shadow-lg shadow-amber-100/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Taux</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-amber-900 tracking-tight">
                            {totalMontant > 0 ? ((totalCommission / totalMontant) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs font-medium text-amber-600">Commission</p>
                    </div>
                </div>
            </div>

            {/* Résumé par statut */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-lg">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Répartition par statut
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const count = statusCounts[key] || 0;
                        const percentage = totalExpeditions > 0 ? ((count / totalExpeditions) * 100).toFixed(0) : 0;
                        const Icon = config.icon;

                        if (count === 0) return null;

                        return (
                            <div
                                key={key}
                                className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className={`w-4 h-4 ${config.textColor}`} />
                                    <span className={`text-xs font-bold ${config.textColor} uppercase tracking-wide`}>
                                        {config.label}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-2xl font-bold ${config.textColor}`}>{count}</span>
                                    <span className={`text-xs font-medium ${config.textColor} opacity-70`}>
                                        ({percentage}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Barre de progression globale */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Progression globale</span>
                        <span className="text-xs font-bold text-slate-900">
                            {statusCounts.termined || 0} / {totalExpeditions} terminées
                        </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                            style={{ 
                                width: `${totalExpeditions > 0 ? ((statusCounts.termined || 0) / totalExpeditions) * 100 : 0}%` 
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpeditionsSummary;
