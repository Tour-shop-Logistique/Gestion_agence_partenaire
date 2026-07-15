import React, { useState } from 'react';
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { STATUS_CONFIG } from './StatusFilter';

/**
 * 🎛️ PANNEAU DE FILTRES LATÉRAL AMÉLIORÉ
 * Design moderne et épuré avec meilleure ergonomie visuelle
 * Sections repliables : Recherche, Type, Statuts
 */

const FilterSection = ({ title, children, defaultOpen = true, icon: Icon }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-slate-200/60 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 px-5 hover:bg-indigo-50/30 transition-all group"
            >
                <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                        {title}
                    </span>
                </div>
                {open
                    ? <ChevronUpIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    : <ChevronDownIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                }
            </button>
            {open && (
                <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

const FiltersPanel = ({
    expeditions,
    selectedStatuses,
    onStatusChange,
    type,
    onTypeChange,
    dateDebut,
    dateFin,
    onDateDebutChange,
    onDateFinChange,
    searchQuery,
    onSearchChange,
    onResetAll,
}) => {
    // Compter les expéditions par statut
    const statusCounts = React.useMemo(() => {
        const counts = {};
        expeditions.forEach(exp => {
            const s = exp.statut_expedition;
            counts[s] = (counts[s] || 0) + 1;
        });
        return counts;
    }, [expeditions]);

    // Compter par type
    const typeCounts = React.useMemo(() => {
        const counts = {};
        expeditions.forEach(exp => {
            const t = exp.type_expedition || 'unknown';
            counts[t] = (counts[t] || 0) + 1;
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

    const typeOptions = [
        { id: '', label: 'Tout', icon: '📦' },
        { id: 'simple', label: 'Simple', icon: '📮' },
        { id: 'groupage_dhd_aerien', label: 'DHD Aérien', icon: '✈️' },
        { id: 'groupage_dhd_maritine', label: 'DHD Maritime', icon: '🚢' },
        { id: 'groupage_afrique', label: 'Afrique', icon: '🌍' },
        { id: 'groupage_ca', label: 'CA', icon: '📋' },
    ];

    const hasFilters =
        selectedStatuses.length > 0 ||
        type !== '' ||
        searchQuery !== '';

    return (
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden flex flex-col sticky top-4">
            {/* Panel Header avec gradient */}
            <div className="relative px-5 py-4 border-b-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <FunnelIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Filtres</h3>
                            {hasFilters && (
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    {(selectedStatuses.length > 0 ? 1 : 0) + (type ? 1 : 0) + (searchQuery ? 1 : 0)} actif(s)
                                </p>
                            )}
                        </div>
                    </div>
                    {hasFilters && (
                        <button
                            onClick={onResetAll}
                            className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg uppercase tracking-wide flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                        >
                            <XMarkIcon className="w-3.5 h-3.5" />
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Recherche */}
            <FilterSection title="Recherche rapide" defaultOpen={true} icon={MagnifyingGlassIcon}>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Référence, nom, pays..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder-slate-400 transition-all hover:border-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </FilterSection>

            {/* Type d'expédition */}
            <FilterSection 
                title="Type d'expédition" 
                defaultOpen={true}
                icon={() => <span className="text-base">📦</span>}
            >
                <div className="space-y-1.5">
                    {typeOptions.map((opt) => {
                        const count = opt.id === '' ? expeditions.length : (typeCounts[opt.id] || 0);
                        const isActive = type === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => onTypeChange(opt.id)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all group ${
                                    isActive
                                        ? 'bg-indigo-500 border-2 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-2 border-transparent hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg leading-none">{opt.icon}</span>
                                    <span className="text-xs font-bold">{opt.label}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </FilterSection>

            {/* Statuts */}
            <FilterSection 
                title="Statut des expéditions" 
                defaultOpen={true}
                icon={() => <span className="text-base">📊</span>}
            >
                <div className="space-y-2">
                    {/* Tout sélectionner / Aucun */}
                    <div className="flex items-center gap-2 pb-3 mb-2 border-b-2 border-slate-200">
                        <button
                            onClick={() => onStatusChange(Object.keys(STATUS_CONFIG))}
                            className="flex-1 px-3 py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg uppercase tracking-wide transition-all hover:scale-105"
                        >
                            ✓ Tout sélectionner
                        </button>
                        <button
                            onClick={() => onStatusChange([])}
                            className="flex-1 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg uppercase tracking-wide transition-all hover:scale-105"
                        >
                            ✕ Aucun
                        </button>
                    </div>

                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        const count = statusCounts[key] || 0;
                        const isSelected = selectedStatuses.includes(key);

                        return (
                            <button
                                key={key}
                                onClick={() => toggleStatus(key)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                                    isSelected
                                        ? `${config.bgColor} border-2 ${config.borderColor} shadow-md`
                                        : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Checkbox modernisé */}
                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                        isSelected
                                            ? `${config.borderColor} ${config.bgColor} shadow-sm`
                                            : 'border-slate-300 bg-white group-hover:border-slate-400'
                                    }`}>
                                        {isSelected && (
                                            <svg className={`w-3 h-3 ${config.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Icon + Label */}
                                    <div className={`w-7 h-7 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0 ${
                                        isSelected ? 'shadow-sm' : ''
                                    }`}>
                                        <Icon className={`w-4 h-4 ${config.textColor}`} />
                                    </div>
                                    <span className={`text-xs font-bold ${isSelected ? config.textColor : 'text-slate-700'}`}>
                                        {config.label}
                                    </span>
                                </div>

                                {/* Count badge modernisé */}
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center shadow-sm ${
                                    isSelected
                                        ? 'bg-white/90 text-slate-700'
                                        : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </FilterSection>

            {/* Période */}
            {/* Les filtres de date sont gérés dans le header de la page */}
        </div>
    );
};

export default FiltersPanel;
