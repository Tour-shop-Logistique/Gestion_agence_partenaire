import React from 'react';
import { ArrowPathIcon, DocumentArrowDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

/**
 * 🎯 HEADER PREMIUM EXPEDITIONS
 * Style: Stripe Dashboard / Vercel
 * - Titre + sous-titre
 * - Actions rapides
 * - Indicateur temps réel
 * - Date / synchronisation
 */

const ExpeditionHeader = ({
    totalCount = 0,
    loading = false,
    lastSync = null,
    onRefresh,
    onExport,
    dateDebut,
    dateFin,
    onDateDebutChange,
    onDateFinChange,
    canExport = true
}) => {
    const navigate = useNavigate();

    const formatLastSync = () => {
        if (!lastSync) return 'Jamais';
        const diff = Date.now() - new Date(lastSync).getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (seconds < 60) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes}min`;
        if (hours < 24) return `Il y a ${hours}h`;
        return new Date(lastSync).toLocaleDateString('fr-FR');
    };

    return (
        <div className="relative bg-white border-b border-slate-200/80">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02]"></div>
            
            <div className="relative max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                    {/* Left: Title & Metadata */}
                    <div className="flex-1 min-w-0 space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                    Expéditions
                                </h1>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                                    <div className="relative flex h-2 w-2">
                                        <span className={`${loading ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75`}></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                        {loading ? 'Sync...' : 'Live'}
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-600">
                                Gérez et suivez vos {totalCount} expédition{totalCount !== 1 ? 's' : ''} en temps réel
                            </p>
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">
                                    {new Date().toLocaleDateString('fr-FR', { 
                                        weekday: 'long', 
                                        day: 'numeric', 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">
                                    Dernière sync: {formatLastSync()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        {/* Date Range Picker */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm hover:border-slate-300 transition-colors">
                            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="date"
                                value={dateDebut}
                                onChange={(e) => onDateDebutChange(e.target.value)}
                                className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none w-[110px] cursor-pointer"
                            />
                            <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <input
                                type="date"
                                value={dateFin}
                                onChange={(e) => onDateFinChange(e.target.value)}
                                className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none w-[110px] cursor-pointer"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onRefresh}
                                disabled={loading}
                                className="inline-flex items-center justify-center p-2.5 border border-slate-200 rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow active:scale-95"
                                title="Rafraîchir"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>

                            <button
                                onClick={onExport}
                                disabled={!canExport}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95 font-medium text-sm"
                                title="Exporter en PDF"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Export PDF</span>
                            </button>

                            <button
                                onClick={() => navigate('/create-expedition')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95 font-medium text-sm"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Nouvelle</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpeditionHeader;
