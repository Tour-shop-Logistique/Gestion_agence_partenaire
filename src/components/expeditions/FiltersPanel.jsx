import React, { useState } from 'react';
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * 🎛️ PANNEAU DE FILTRES LATÉRAL AMÉLIORÉ
 * Design moderne et épuré avec meilleure ergonomie visuelle
 * Sections repliables : Recherche, Type
 * Le filtre par statut est redondant avec les cartes KPI cliquables de la
 * page (un seul statut actif à la fois dans les deux cas) : retiré ici.
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
    type,
    onTypeChange,
    dateDebut,
    dateFin,
    onDateDebutChange,
    onDateFinChange,
    searchQuery,
    onSearchChange,
    onResetAll,
    onClose,
    resultCount,
    variant = 'sidebar',
}) => {
    const isDrawer = variant === 'drawer';
    // Compter par type
    const typeCounts = React.useMemo(() => {
        const counts = {};
        expeditions.forEach(exp => {
            const t = exp.type_expedition || 'unknown';
            counts[t] = (counts[t] || 0) + 1;
        });
        return counts;
    }, [expeditions]);

    const typeOptions = [
        { id: '', label: 'Tout', icon: '📦' },
        { id: 'simple', label: 'Simple', icon: '📮' },
        { id: 'groupage_dhd_aerien', label: 'DHD Aérien', icon: '✈️' },
        { id: 'groupage_dhd_maritine', label: 'DHD Maritime', icon: '🚢' },
        { id: 'groupage_afrique', label: 'Afrique', icon: '🌍' },
        { id: 'groupage_ca', label: 'CA', icon: '📋' },
        { id: 'interville', label: 'Interville', icon: '🛣️' },
    ];

    const hasFilters =
        selectedStatuses.length > 0 ||
        type !== '' ||
        searchQuery !== '';

    const activeCount = (selectedStatuses.length > 0 ? 1 : 0) + (type ? 1 : 0) + (searchQuery ? 1 : 0);

    return (
        <div className={
            isDrawer
                ? 'bg-white h-full flex flex-col shadow-2xl'
                : 'bg-white rounded-lg border-2 border-slate-200 shadow-xl overflow-hidden flex flex-col sticky top-4'
        }>
            {/* Panel Header avec gradient */}
            <div className={`relative flex-shrink-0 px-5 py-4 border-b-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 ${isDrawer ? 'pt-[calc(env(safe-area-inset-top)+1rem)]' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                            <FunnelIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-800">Filtres</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                {hasFilters ? `${activeCount} filtre(s) actif(s)` : 'Aucun filtre actif'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {hasFilters && (
                            <button
                                onClick={onResetAll}
                                className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg uppercase tracking-wide flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                                <span className={isDrawer ? 'hidden sm:inline' : ''}>Réinitialiser</span>
                            </button>
                        )}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
                                title="Fermer"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={isDrawer ? 'flex-1 overflow-y-auto overscroll-contain' : ''}>

            {/* Recherche */}
            <FilterSection title="Recherche rapide" defaultOpen={true} icon={MagnifyingGlassIcon}>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Référence, code colis, nom, pays..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder-slate-400 transition-all hover:border-slate-400"
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
                defaultOpen={false}
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
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all group ${
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

            {/* Période */}
            {/* Les filtres de date sont gérés dans le header de la page */}
            </div>

            {/* Pied de tiroir : compteur de résultats + bouton de validation (drawer uniquement) */}
            {isDrawer && (
                <div className="flex-shrink-0 px-5 py-4 border-t-2 border-slate-200 bg-white pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        Voir {typeof resultCount === 'number' ? `${resultCount} résultat${resultCount !== 1 ? 's' : ''}` : 'les résultats'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FiltersPanel;
