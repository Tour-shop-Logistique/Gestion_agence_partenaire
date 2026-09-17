import React, { useMemo, useState } from 'react';
import { CubeIcon } from '@heroicons/react/24/outline';
import { STATUS_CONFIG } from './StatusFilter';

/**
 * Cartes de comptage par statut, séparées par rôle de l'agence sur
 * l'expédition (départ = elle l'a créée/reçue à envoyer, arrivée = elle
 * doit la réceptionner). Affichées via onglets plutôt que les deux
 * groupes empilés : un même statut compte différemment selon le rôle,
 * mais montrer les 2x7 cartes d'un coup était trop dense.
 */

const ACCENT_BAR = {
    indigo: 'bg-indigo-600',
    blue: 'bg-blue-600',
    sky: 'bg-sky-600',
    cyan: 'bg-cyan-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600',
    violet: 'bg-violet-600',
    green: 'bg-green-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
};

const ACCENT_TEXT = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    sky: 'text-sky-600',
    cyan: 'text-cyan-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
    violet: 'text-violet-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
};

const StatCard = ({ icon: Icon, label, value, color, onClick, active = false }) => {
    const accentBar = ACCENT_BAR[color] || 'bg-slate-500';
    const accentText = ACCENT_TEXT[color] || 'text-slate-500';

    return (
        <button
            onClick={onClick}
            className={`flex items-start gap-2.5 bg-white border rounded-lg pl-3 pr-3 py-3 text-left transition-colors min-w-0 ${
                active ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-400'
            }`}
        >
            <span className={`self-stretch w-1 rounded-sm shrink-0 ${accentBar}`} aria-hidden="true" />
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${accentText}`} />
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide leading-snug break-words">
                    {label}
                </p>
                <p className="text-xl font-bold text-slate-900 tabular-nums leading-tight">
                    {value}
                </p>
            </div>
        </button>
    );
};

// Statuts pertinents côté arrivée : avant "arrivee_expedition_succes" le
// colis n'est même pas encore chez l'agence destinataire (recu_agence_depart,
// en_transit_entrepot, depart_expedition_succes ne concernent que l'agence
// de départ), donc inutiles à afficher ici. Côté départ on garde tout : on
// peut vouloir suivre l'expédition jusqu'au bout même après l'avoir envoyée.
const ARRIVEE_STATUSES = ['arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison', 'termined'];

const StatsCards = ({ expeditions, currentAgenceId, onFilter, activeFilters = {} }) => {
    const [activeTab, setActiveTab] = useState('depart');

    const { total, departTotal, arriveeTotal, departCounts, arriveeCounts } = useMemo(() => {
        const departCounts = {};
        const arriveeCounts = {};
        let departTotal = 0;
        let arriveeTotal = 0;

        expeditions.forEach(exp => {
            const s = exp.statut_expedition;
            const estDepart = exp.agence_id === currentAgenceId;
            const estArrivee = !estDepart && exp.colis?.some(c => c.agence_destination_id === currentAgenceId);

            if (estDepart) {
                departCounts[s] = (departCounts[s] || 0) + 1;
                departTotal += 1;
            } else if (estArrivee) {
                arriveeCounts[s] = (arriveeCounts[s] || 0) + 1;
                arriveeTotal += 1;
            }
        });

        return { total: expeditions.length, departTotal, arriveeTotal, departCounts, arriveeCounts };
    }, [expeditions, currentAgenceId]);

    const counts = activeTab === 'depart' ? departCounts : arriveeCounts;
    const visibleStatuses = activeTab === 'depart'
        ? Object.entries(STATUS_CONFIG)
        : Object.entries(STATUS_CONFIG).filter(([key]) => ARRIVEE_STATUSES.includes(key));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                    onClick={() => onFilter('all')}
                    className={`flex items-center gap-2.5 bg-white border rounded-lg px-3 py-2 transition-colors ${
                        activeFilters.type === 'all' ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-400'
                    }`}
                >
                    <CubeIcon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</span>
                    <span className="text-base font-bold text-slate-900 tabular-nums">{total}</span>
                </button>

                <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('depart')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'depart' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Départ <span className="text-xs font-bold">({departTotal})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('arrivee')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'arrivee' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Arrivée <span className="text-xs font-bold">({arriveeTotal})</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {visibleStatuses.map(([key, config]) => (
                    <StatCard
                        key={`${activeTab}-${key}`}
                        icon={config.icon}
                        label={config.label}
                        value={counts[key] || 0}
                        color={config.color}
                        onClick={() => onFilter(key, activeTab)}
                        active={activeFilters.status === key && activeFilters.role === activeTab}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatsCards;
