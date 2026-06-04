import React, { useState } from 'react';
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { STATUS_CONFIG } from './StatusFilter';

/**
 * 🎛️ PANNEAU DE FILTRES LATÉRAL
 * Reproduit l'effet "sidebar filters" style e-commerce (Toner/Velzon)
 * Sections repliables : Statuts, Type, Dates, Recherche
 */

const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-slate-100 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-3 px-4 hover:bg-slate-50/60 transition-colors group"
            >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                    {title}
                </span>
                {open
                    ? <ChevronUpIcon className="w-3.5 h-3.5 text-slate-400" />
                    : <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
                }
            </button>
            {open && (
                <div className="px-4 pb-4">
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
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm font-bold text-slate-800">Filtres</span>
                    {hasFilters && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
                            {(selectedStatuses.length > 0 ? 1 : 0) + (type ? 1 : 0) + (searchQuery ? 1 : 0)}
                        </span>
                    )}
                </div>
                {hasFilters && (
                    <button
                        onClick={onResetAll}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wide flex items-center gap-1 transition-colors"
                    >
                        <XMarkIcon className="w-3.5 h-3.5" />
                        Effacer
                    </button>
                )}
            </div>

            {/* Recherche */}
            <FilterSection title="Recherche" defaultOpen={true}>
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Référence, nom, pays..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-slate-400 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </FilterSection>

            {/* Type d'expédition */}
            <FilterSection title="Type d'expédition" defaultOpen={true}>
                <div className="space-y-1">
                    {typeOptions.map((opt) => {
                        const count = opt.id === '' ? expeditions.length : (typeCounts[opt.id] || 0);
                        const isActive = type === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => onTypeChange(opt.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                                    isActive
                                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-sm leading-none">{opt.icon}</span>
                                    <span className="text-xs font-semibold">{opt.label}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isActive
                                        ? 'bg-indigo-100 text-indigo-600'
                                        : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </FilterSection>

            {/* Statuts */}
            <FilterSection title="Statut" defaultOpen={true}>
                <div className="space-y-1">
                    {/* Tout sélectionner / Aucun */}
                    <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
                        <button
                            onClick={() => onStatusChange(Object.keys(STATUS_CONFIG))}
                            className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wide transition-colors"
                        >
                            Tout
                        </button>
                        <button
                            onClick={() => onStatusChange([])}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide transition-colors"
                        >
                            Aucun
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
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                    isSelected
                                        ? `${config.bgColor} border ${config.borderColor}`
                                        : 'hover:bg-slate-50 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    {/* Checkbox custom */}
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                        isSelected
                                            ? `${config.borderColor.replace('border-', 'border-')} ${config.bgColor}`
                                            : 'border-slate-300 bg-white'
                                    }`}>
                                        {isSelected && (
                                            <svg className={`w-2.5 h-2.5 ${config.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Icon + Label */}
                                    <div className={`w-6 h-6 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
                                    </div>
                                    <span className={`text-xs font-semibold ${isSelected ? config.textColor : 'text-slate-600'}`}>
                                        {config.label}
                                    </span>
                                </div>

                                {/* Count badge */}
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                                    isSelected
                                        ? `${config.bgColor} ${config.textColor}`
                                        : 'bg-slate-100 text-slate-500'
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
