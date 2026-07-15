import React from 'react';

/**
 * 🏷️ FILTRES RAPIDES (CHIPS)
 * Style: Gmail / Notion
 * - Chips cliquables
 * - Filtres instantanés
 * - Design moderne
 */

const FilterChip = ({ label, active, onClick, icon, count }) => {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                    : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-md hover:scale-[1.02]'
            }`}
        >
            {icon && <span className="text-base leading-none">{icon}</span>}
            <span>{label}</span>
            {count !== undefined && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    active 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 text-slate-500'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
};

const QuickFiltersChips = ({ expeditions, activeFilter, onFilterChange }) => {
    const getFilterCount = (filterFn) => {
        return expeditions.filter(filterFn).length;
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const isToday = (date) => {
        const d = new Date(date);
        return d.toDateString() === today.toDateString();
    };

    const isYesterday = (date) => {
        const d = new Date(date);
        return d.toDateString() === yesterday.toDateString();
    };

    const isThisWeek = (date) => {
        const d = new Date(date);
        return d >= weekAgo && d <= today;
    };

    const isThisMonth = (date) => {
        const d = new Date(date);
        return d >= monthAgo && d <= today;
    };

    const filters = [
        {
            id: 'all',
            label: 'Toutes',
            icon: '📦',
            count: expeditions.length,
            filterFn: () => true
        },
        {
            id: 'today',
            label: 'Aujourd\'hui',
            icon: '🌅',
            count: getFilterCount((e) => isToday(e.created_at)),
            filterFn: (e) => isToday(e.created_at)
        },
        {
            id: 'yesterday',
            label: 'Hier',
            icon: '🌄',
            count: getFilterCount((e) => isYesterday(e.created_at)),
            filterFn: (e) => isYesterday(e.created_at)
        },
        {
            id: 'week',
            label: 'Cette semaine',
            icon: '📅',
            count: getFilterCount((e) => isThisWeek(e.created_at)),
            filterFn: (e) => isThisWeek(e.created_at)
        },
        {
            id: 'month',
            label: 'Ce mois',
            icon: '📆',
            count: getFilterCount((e) => isThisMonth(e.created_at)),
            filterFn: (e) => isThisMonth(e.created_at)
        },
        {
            id: 'pending',
            label: 'En attente',
            icon: '🟡',
            count: getFilterCount((e) => e.statut_expedition === 'en_attente'),
            filterFn: (e) => e.statut_expedition === 'en_attente'
        },
        {
            id: 'transit',
            label: 'Transit',
            icon: '🚚',
            count: getFilterCount((e) => 
                ['en_cours_enlevement', 'en_cours_depot', 'recu_agence_depart', 'en_transit_entrepot', 
                 'depart_expedition_succes', 'arrivee_expedition_succes', 'recu_agence_destination', 
                 'en_cours_livraison'].includes(e.statut_expedition)
            ),
            filterFn: (e) => 
                ['en_cours_enlevement', 'en_cours_depot', 'recu_agence_depart', 'en_transit_entrepot', 
                 'depart_expedition_succes', 'arrivee_expedition_succes', 'recu_agence_destination', 
                 'en_cours_livraison'].includes(e.statut_expedition)
        },
        {
            id: 'delivered',
            label: 'Livrée',
            icon: '✅',
            count: getFilterCount((e) => ['termined', 'delivered'].includes(e.statut_expedition)),
            filterFn: (e) => ['termined', 'delivered'].includes(e.statut_expedition)
        },
        {
            id: 'unpaid',
            label: 'Impayée',
            icon: '💳',
            count: getFilterCount((e) => e.statut_paiement_expedition !== 'paye'),
            filterFn: (e) => e.statut_paiement_expedition !== 'paye'
        },
        {
            id: 'paid',
            label: 'Payée',
            icon: '💰',
            count: getFilterCount((e) => e.statut_paiement_expedition === 'paye'),
            filterFn: (e) => e.statut_paiement_expedition === 'paye'
        },
        {
            id: 'simple',
            label: 'Simple',
            icon: '📮',
            count: getFilterCount((e) => e.type_expedition === 'simple'),
            filterFn: (e) => e.type_expedition === 'simple'
        },
        {
            id: 'maritime',
            label: 'Maritime',
            icon: '🚢',
            count: getFilterCount((e) => e.type_expedition === 'groupage_dhd_maritine'),
            filterFn: (e) => e.type_expedition === 'groupage_dhd_maritine'
        },
        {
            id: 'aerien',
            label: 'Aérien',
            icon: '✈️',
            count: getFilterCount((e) => e.type_expedition === 'groupage_dhd_aerien'),
            filterFn: (e) => e.type_expedition === 'groupage_dhd_aerien'
        },
        {
            id: 'afrique',
            label: 'Afrique',
            icon: '🌍',
            count: getFilterCount((e) => e.type_expedition === 'groupage_afrique'),
            filterFn: (e) => e.type_expedition === 'groupage_afrique'
        },
        {
            id: 'ca',
            label: 'CA',
            icon: '📋',
            count: getFilterCount((e) => e.type_expedition === 'groupage_ca'),
            filterFn: (e) => e.type_expedition === 'groupage_ca'
        }
    ];

    return (
        <div className="relative">
            {/* Scroll container */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {filters.map((filter) => (
                    <FilterChip
                        key={filter.id}
                        label={filter.label}
                        icon={filter.icon}
                        count={filter.count}
                        active={activeFilter === filter.id}
                        onClick={() => onFilterChange(filter.id, filter.filterFn)}
                    />
                ))}
            </div>

            {/* Gradient fade at edges */}
            <div className="absolute top-0 right-0 bottom-2 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
    );
};

export default QuickFiltersChips;
