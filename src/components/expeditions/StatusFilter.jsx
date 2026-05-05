import React from 'react';
import { 
    ClockIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    TruckIcon,
    BuildingOfficeIcon,
    GlobeAltIcon,
    MapPinIcon,
    FlagIcon
} from '@heroicons/react/24/outline';

/**
 * 🎯 FILTRE PAR STATUT
 * Composant de filtrage avancé par statut avec multi-select
 */

const STATUS_CONFIG = {
    en_attente: {
        label: 'En attente',
        icon: ClockIcon,
        color: 'amber',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        hoverColor: 'hover:bg-amber-100'
    },
    accepted: {
        label: 'Acceptée',
        icon: CheckCircleIcon,
        color: 'emerald',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        hoverColor: 'hover:bg-emerald-100'
    },
    refused: {
        label: 'Refusée',
        icon: XCircleIcon,
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        hoverColor: 'hover:bg-red-100'
    },
    recu_agence_depart: {
        label: 'Reçu Agence',
        icon: BuildingOfficeIcon,
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        hoverColor: 'hover:bg-blue-100'
    },
    en_transit_entrepot: {
        label: 'Transit Entrepôt',
        icon: TruckIcon,
        color: 'indigo',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700',
        borderColor: 'border-indigo-200',
        hoverColor: 'hover:bg-indigo-100'
    },
    depart_expedition_succes: {
        label: 'En Transit',
        icon: GlobeAltIcon,
        color: 'purple',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:bg-purple-100'
    },
    arrivee_expedition_succes: {
        label: 'Arrivée',
        icon: MapPinIcon,
        color: 'pink',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-700',
        borderColor: 'border-pink-200',
        hoverColor: 'hover:bg-pink-100'
    },
    recu_agence_destination: {
        label: 'Reçu Destination',
        icon: BuildingOfficeIcon,
        color: 'violet',
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-700',
        borderColor: 'border-violet-200',
        hoverColor: 'hover:bg-violet-100'
    },
    en_cours_livraison: {
        label: 'En livraison',
        icon: TruckIcon,
        color: 'cyan',
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-700',
        borderColor: 'border-cyan-200',
        hoverColor: 'hover:bg-cyan-100'
    },
    termined: {
        label: 'Terminée',
        icon: FlagIcon,
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        hoverColor: 'hover:bg-green-100'
    }
};

const StatusFilter = ({ selectedStatuses, onStatusChange, expeditions }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Compter les expéditions par statut
    const statusCounts = React.useMemo(() => {
        const counts = {};
        expeditions.forEach(exp => {
            const status = exp.statut_expedition;
            counts[status] = (counts[status] || 0) + 1;
        });
        return counts;
    }, [expeditions]);

    const toggleStatus = (status) => {
        if (selectedStatuses.includes(status)) {
            onStatusChange(selectedStatuses.filter(s => s !== status));
        } else {
            onStatusChange([...selectedStatuses, status]);
        }
    };

    const clearAll = () => {
        onStatusChange([]);
        setIsOpen(false);
    };

    const selectAll = () => {
        onStatusChange(Object.keys(STATUS_CONFIG));
    };

    return (
        <div className="relative">
            {/* Bouton principal */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                    selectedStatuses.length > 0
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm font-bold">
                    Statut {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
                </span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                Filtrer par statut
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={selectAll}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase"
                                >
                                    Tout
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                    onClick={clearAll}
                                    className="text-xs font-bold text-slate-500 hover:text-slate-700 uppercase"
                                >
                                    Aucun
                                </button>
                            </div>
                        </div>

                        {/* Liste des statuts */}
                        <div className="max-h-96 overflow-y-auto p-2">
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                                const Icon = config.icon;
                                const count = statusCounts[key] || 0;
                                const isSelected = selectedStatuses.includes(key);

                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggleStatus(key)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                            isSelected
                                                ? `${config.bgColor} ${config.borderColor} border-2`
                                                : 'hover:bg-slate-50 border-2 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Checkbox */}
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                                isSelected
                                                    ? `${config.borderColor} ${config.bgColor}`
                                                    : 'border-slate-300'
                                            }`}>
                                                {isSelected && (
                                                    <svg className={`w-3 h-3 ${config.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Icône */}
                                            <div className={`w-8 h-8 rounded-lg ${config.bgColor} ${config.borderColor} border flex items-center justify-center`}>
                                                <Icon className={`w-4 h-4 ${config.textColor}`} />
                                            </div>

                                            {/* Label */}
                                            <span className={`text-sm font-bold ${isSelected ? config.textColor : 'text-slate-700'}`}>
                                                {config.label}
                                            </span>
                                        </div>

                                        {/* Count */}
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            isSelected
                                                ? `${config.bgColor} ${config.textColor}`
                                                : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                {selectedStatuses.length} statut{selectedStatuses.length > 1 ? 's' : ''} sélectionné{selectedStatuses.length > 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StatusFilter;
export { STATUS_CONFIG };
