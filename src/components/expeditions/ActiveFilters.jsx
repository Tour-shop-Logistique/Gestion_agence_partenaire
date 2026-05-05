import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { STATUS_CONFIG } from './StatusFilter';

/**
 * 🏷️ FILTRES ACTIFS
 * Affiche les filtres actifs sous forme de tags supprimables
 */

const ActiveFilters = ({ 
    selectedStatuses, 
    onRemoveStatus, 
    searchQuery, 
    onClearSearch,
    type,
    onClearType,
    dateDebut,
    dateFin,
    onClearDates,
    onResetAll 
}) => {
    const hasFilters = selectedStatuses.length > 0 || searchQuery || type || (dateDebut && dateFin);

    if (!hasFilters) return null;

    const getTypeLabel = (typeValue) => {
        const labels = {
            'simple': 'Simple',
            'groupage_dhd_aerien': 'DHD Aérien',
            'groupage_dhd_maritine': 'DHD Maritime',
            'groupage_afrique': 'Afrique',
            'groupage_ca': 'CA'
        };
        return labels[typeValue] || typeValue;
    };

    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Filtres actifs
                </h3>
                <button
                    onClick={onResetAll}
                    className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wide flex items-center gap-1"
                >
                    <XMarkIcon className="w-4 h-4" />
                    Tout effacer
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {/* Filtres de statut */}
                {selectedStatuses.map(status => {
                    const config = STATUS_CONFIG[status];
                    if (!config) return null;

                    return (
                        <button
                            key={status}
                            onClick={() => onRemoveStatus(status)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${config.bgColor} ${config.borderColor} ${config.textColor} hover:opacity-80 transition-all group`}
                        >
                            <span className="text-xs font-bold">{config.label}</span>
                            <XMarkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    );
                })}

                {/* Filtre de recherche */}
                {searchQuery && (
                    <button
                        onClick={onClearSearch}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-blue-50 border-blue-200 text-blue-700 hover:opacity-80 transition-all group"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-xs font-bold">"{searchQuery}"</span>
                        <XMarkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                )}

                {/* Filtre de type */}
                {type && (
                    <button
                        onClick={onClearType}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-purple-50 border-purple-200 text-purple-700 hover:opacity-80 transition-all group"
                    >
                        <span className="text-xs font-bold">Type: {getTypeLabel(type)}</span>
                        <XMarkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                )}

                {/* Filtre de dates */}
                {dateDebut && dateFin && (
                    <button
                        onClick={onClearDates}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-orange-50 border-orange-200 text-orange-700 hover:opacity-80 transition-all group"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-bold">
                            {new Date(dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - {new Date(dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                        <XMarkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ActiveFilters;
