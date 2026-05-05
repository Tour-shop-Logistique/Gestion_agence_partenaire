import React from 'react';
import { STATUS_CONFIG } from './StatusFilter';

/**
 * ⚡ FILTRES RAPIDES PAR STATUT
 * Boutons rapides pour filtrer par statut courant
 */

const QuickStatusFilters = ({ expeditions, selectedStatuses, onStatusChange }) => {
    // Compter les expéditions par statut
    const statusCounts = React.useMemo(() => {
        const counts = {};
        expeditions.forEach(exp => {
            const status = exp.statut_expedition;
            counts[status] = (counts[status] || 0) + 1;
        });
        return counts;
    }, [expeditions]);

    // Statuts prioritaires à afficher en raccourci
    const quickStatuses = [
        'en_attente',
        'accepted',
        'depart_expedition_succes',
        'arrivee_expedition_succes',
        'termined'
    ];

    const toggleStatus = (status) => {
        if (selectedStatuses.includes(status)) {
            onStatusChange(selectedStatuses.filter(s => s !== status));
        } else {
            onStatusChange([status]);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Filtres rapides :
            </span>

            {quickStatuses.map(status => {
                const config = STATUS_CONFIG[status];
                const count = statusCounts[status] || 0;
                const isActive = selectedStatuses.includes(status);

                if (count === 0) return null;

                const Icon = config.icon;

                return (
                    <button
                        key={status}
                        onClick={() => toggleStatus(status)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                            isActive
                                ? `${config.bgColor} ${config.borderColor} ${config.textColor} shadow-md scale-105`
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? config.textColor : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{config.label}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isActive
                                ? 'bg-white/30'
                                : 'bg-slate-100'
                        }`}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default QuickStatusFilters;
