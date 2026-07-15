import React, { useMemo } from 'react';
import {
    CubeIcon,
    ClockIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
    BanknotesIcon,
    BuildingLibraryIcon
} from '@heroicons/react/24/outline';

/**
 * 📊 CARTES KPI DASHBOARD
 * Style: Stripe / Linear / Notion
 * - Cartes cliquables pour filtrer
 * - Animations au hover
 * - Icônes + couleurs
 * - Valeurs + évolution
 */

const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color, 
    bgColor, 
    borderColor,
    onClick,
    active = false,
    subtitle
}) => {
    return (
        <button
            onClick={onClick}
            className={`relative group overflow-hidden bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] ${
                active 
                    ? `${borderColor} shadow-lg scale-[1.02]` 
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
        >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${bgColor}`}></div>
            
            <div className="relative p-5 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${bgColor} ${borderColor} border group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    
                    {active && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">Actif</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-slate-400 font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom accent bar */}
            <div className={`h-1 ${bgColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
        </button>
    );
};

const StatsCards = ({ expeditions, onFilter, activeFilters = {} }) => {
    const stats = useMemo(() => {
        const total = expeditions.length;
        const enAttente = expeditions.filter(e => e.statut_expedition === 'en_attente').length;
        const enTransit = expeditions.filter(e => 
            ['en_cours_enlevement', 'en_cours_depot', 'recu_agence_depart', 'en_transit_entrepot', 
             'depart_expedition_succes', 'arrivee_expedition_succes', 'recu_agence_destination', 
             'en_cours_livraison'].includes(e.statut_expedition)
        ).length;
        const livrees = expeditions.filter(e => ['termined', 'delivered'].includes(e.statut_expedition)).length;
        const refusees = expeditions.filter(e => e.statut_expedition === 'refused').length;
        
        const chiffreAffaires = expeditions.reduce((sum, e) => sum + parseFloat(e.montant_expedition || 0), 0);
        
        const commissionAgence = expeditions.reduce((sum, exp) => {
            // Utiliser montant_prestation si disponible
            if (exp.montant_prestation !== undefined && exp.montant_prestation !== null) {
                return sum + (parseFloat(exp.montant_prestation) || 0);
            }
            
            // Fallback sur commission_details
            if (!exp.commission_details) return sum;
            const c = exp.commission_details;
            return sum + (c.enlevement?.agence || 0) + 
                   (c.livraison?.agence || 0) + 
                   (c.emballage?.agence || 0) + 
                   (c.retard?.agence || 0);
        }, 0);

        return {
            total,
            enAttente,
            enTransit,
            livrees,
            refusees,
            chiffreAffaires,
            commissionAgence
        };
    }, [expeditions]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount);
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
            <StatCard
                icon={CubeIcon}
                label="Total"
                value={stats.total}
                color="text-indigo-600"
                bgColor="from-indigo-50 to-indigo-100/50"
                borderColor="border-indigo-200"
                onClick={() => onFilter('all')}
                active={activeFilters.type === 'all'}
                subtitle="expéditions"
            />

            <StatCard
                icon={ClockIcon}
                label="En attente"
                value={stats.enAttente}
                color="text-amber-600"
                bgColor="from-amber-50 to-amber-100/50"
                borderColor="border-amber-200"
                onClick={() => onFilter('en_attente')}
                active={activeFilters.status === 'en_attente'}
                subtitle="à traiter"
            />

            <StatCard
                icon={TruckIcon}
                label="En transit"
                value={stats.enTransit}
                color="text-blue-600"
                bgColor="from-blue-50 to-blue-100/50"
                borderColor="border-blue-200"
                onClick={() => onFilter('en_transit')}
                active={activeFilters.status === 'en_transit'}
                subtitle="en cours"
            />

            <StatCard
                icon={CheckCircleIcon}
                label="Livrées"
                value={stats.livrees}
                color="text-emerald-600"
                bgColor="from-emerald-50 to-emerald-100/50"
                borderColor="border-emerald-200"
                onClick={() => onFilter('delivered')}
                active={activeFilters.status === 'delivered'}
                subtitle="complétées"
            />

            <StatCard
                icon={XCircleIcon}
                label="Refusées"
                value={stats.refusees}
                color="text-red-600"
                bgColor="from-red-50 to-red-100/50"
                borderColor="border-red-200"
                onClick={() => onFilter('refused')}
                active={activeFilters.status === 'refused'}
                subtitle="rejetées"
            />

            <StatCard
                icon={BanknotesIcon}
                label="CA Total"
                value={`${formatCurrency(stats.chiffreAffaires)}`}
                color="text-purple-600"
                bgColor="from-purple-50 to-purple-100/50"
                borderColor="border-purple-200"
                onClick={() => {}}
                subtitle="CFA"
            />

            <StatCard
                icon={BuildingLibraryIcon}
                label="Commission"
                value={`${formatCurrency(stats.commissionAgence)}`}
                color="text-cyan-600"
                bgColor="from-cyan-50 to-cyan-100/50"
                borderColor="border-cyan-200"
                onClick={() => {}}
                subtitle="CFA"
            />
        </div>
    );
};

export default StatsCards;
