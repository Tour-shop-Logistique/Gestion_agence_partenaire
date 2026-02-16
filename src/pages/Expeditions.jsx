import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useExpedition } from "../hooks/useExpedition";
import { useAgency } from "../hooks/useAgency";
import { Link } from "react-router-dom";
import PrintSuccessModal from "../components/Receipts/PrintSuccessModal";
import { getLogoUrl } from "../utils/apiConfig";
import { formatPriceDual } from "../utils/format";

const Expeditions = () => {
    const { expeditions, meta, loadExpeditions, status } = useExpedition();
    const { agencyData, fetchAgencyData } = useAgency();
    const [currentPage, setCurrentPage] = useState(1);

    // Helper to get today's date in YYYY-MM-DD
    const getTodayDate = () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    };

    // Helper to get first day of current month in YYYY-MM-DD
    const getFirstDayOfMonth = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    };

    const [dateDebut, setDateDebut] = useState(getFirstDayOfMonth());
    const [dateFin, setDateFin] = useState(getTodayDate());
    const [type, setType] = useState(""); // "" for all, "simple", "groupage"
    const [selectedExpedition, setSelectedExpedition] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadExpeditions({
            page: currentPage,
            date_debut: dateDebut,
            date_fin: dateFin
        });
    }, [currentPage, dateDebut, dateFin, loadExpeditions]);

    useEffect(() => {
        fetchAgencyData();
    }, [fetchAgencyData]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (meta?.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const handlePrintReceipt = (expedition) => {
        setSelectedExpedition(expedition);
        setShowPrintModal(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'en_attente':
                return 'bg-amber-50/80 text-amber-700 border-amber-200/50 shadow-amber-100/50';
            case 'accepted':
                return 'bg-emerald-50/80 text-emerald-700 border-emerald-200/50 shadow-emerald-100/50';
            case 'refused':
                return 'bg-red-50/80 text-red-700 border-red-200/50 shadow-red-100/50';
            case 'en_cours_enlevement':
            case 'en_cours_depot':
                return 'bg-sky-50/80 text-sky-700 border-sky-200/50 shadow-sky-100/50';
            case 'recu_agence_depart':
            case 'en_transit_entrepot':
                return 'bg-blue-50/80 text-blue-700 border-blue-200/50 shadow-blue-100/50';
            case 'depart_expedition_succes':
                return 'bg-indigo-50/80 text-indigo-700 border-indigo-200/50 shadow-indigo-100/50';
            case 'arrivee_expedition_succes':
            case 'recu_agence_destination':
                return 'bg-purple-50/80 text-purple-700 border-purple-200/50 shadow-purple-100/50';
            case 'en_cours_livraison':
                return 'bg-pink-50/80 text-pink-700 border-pink-200/50 shadow-pink-100/50';
            case 'termined':
            case 'delivered':
                return 'bg-emerald-100/80 text-emerald-800 border-emerald-200 shadow-emerald-100/50';
            default:
                return 'bg-slate-50/80 text-slate-700 border-slate-200/50 shadow-slate-100/50';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'en_attente': return 'En attente';
            case 'accepted': return 'Acceptée';
            case 'refused': return 'Refusée';
            case 'en_cours_enlevement': return 'En enlèvement';
            case 'en_cours_depot': return 'Dépôt en cours';
            case 'recu_agence_depart': return 'Reçu Agence Départ';
            case 'en_transit_entrepot': return 'Transit Entrepôt';
            case 'depart_expedition_succes': return 'En Transit (Air/Mer)';
            case 'arrivee_expedition_succes': return 'Arrivée Destination';
            case 'recu_agence_destination': return 'Reçu Agence Dest.';
            case 'en_cours_livraison': return 'En livraison';
            case 'termined':
            case 'delivered': return 'Terminée';
            default: return status?.replace(/_/g, ' ') || 'Inconnu';
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'simple':
                return 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100/50';
            case 'groupage_dhd_aerien':
                return 'bg-sky-50 text-sky-700 border-sky-200 shadow-sky-100/50';
            case 'groupage_dhd_maritine':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200 shadow-cyan-100/50';
            case 'groupage_afrique':
                return 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100/50';
            case 'groupage_ca':
                return 'bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100/50';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100/50';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'simple': return 'Simple';
            case 'groupage_dhd_aerien': return 'DHD Aérien';
            case 'groupage_dhd_maritine': return 'DHD Maritime';
            case 'groupage_afrique': return 'Afrique';
            case 'groupage_ca': return 'CA';
            default: return type || 'Inconnu';
        }
    };

    const getPaymentStatusStyle = (status) => {
        switch (status) {
            case 'paye':
                return 'bg-emerald-50/60 text-emerald-700 border-emerald-100';
            case 'en_attente':
                return 'bg-orange-50/60 text-orange-700 border-orange-100';
            case 'partiel':
                return 'bg-blue-50/60 text-blue-700 border-blue-100';
            default:
                return 'bg-slate-50/60 text-slate-700 border-slate-100';
        }
    };

    // Filter expeditions based on search query and type (Client-side)
    const filteredExpeditions = useMemo(() => {
        let result = expeditions;

        // Apply type filter
        if (type) {
            result = result.filter(exp => exp.type_expedition === type);
        }

        // Apply search filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(exp =>
                exp.reference?.toLowerCase().includes(lowerQuery) ||
                exp.expediteur?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
                exp.destinataire?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
                exp.pays_depart?.toLowerCase().includes(lowerQuery) ||
                exp.pays_destination?.toLowerCase().includes(lowerQuery) ||
                exp.type_expedition?.toLowerCase().includes(lowerQuery)
            );
        }

        return result;
    }, [expeditions, searchQuery, type]);

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-[1600px] mx-auto">
                {/* Premium Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
                            Expéditions
                        </h1>
                        <p className="text-sm font-medium text-slate-500 tracking-wide">
                            Gérez et suivez toutes vos expéditions en temps réel
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        {/* Date Filters */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative group flex-1 sm:w-40">
                                <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Du</span>
                                <input
                                    type="date"
                                    className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    value={dateDebut}
                                    onChange={(e) => {
                                        setDateDebut(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                            <div className="relative group flex-1 sm:w-40">
                                <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Au</span>
                                <input
                                    type="date"
                                    className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    value={dateFin}
                                    onChange={(e) => {
                                        setDateFin(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="relative group w-full sm:w-40">
                            <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Type</span>
                            <select
                                className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Tous les types</option>
                                <option value="simple">Simple</option>
                                <option value="groupage_dhd_aerien">Groupage DHD Aérien</option>
                                <option value="groupage_dhd_maritine">Groupage DHD Maritime</option>
                                <option value="groupage_afrique">Groupage Afrique</option>
                                <option value="groupage_ca">Groupage CA</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group w-full sm:w-64 lg:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
                                placeholder="Rechercher (réf, nom, ville)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="hidden sm:block group relative bg-gradient-to-br from-white to-slate-50/50 px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-[0.15em]">Total</span>
                                    <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">{meta?.total || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Data Card Container */}
                <div className="relative bg-gradient-to-br from-white via-white to-slate-50/30 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden backdrop-blur-sm">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none"></div>

                    <div className="relative overflow-x-auto">
                        {/* Mobile View (Cards) */}
                        <div className="block lg:hidden space-y-4 p-4">
                            {status === 'loading' ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-slate-100 rounded w-full"></div>
                                            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                                            <div className="h-8 bg-slate-200 rounded-lg w-8"></div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredExpeditions.length > 0 ? (
                                filteredExpeditions.map((exp) => (
                                    <div key={exp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>

                                        <div className="relative z-10 space-y-4">
                                            {/* Header Card */}
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900 tracking-tight">{exp.reference}</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border shadow-sm ${getTypeStyle(exp.type_expedition)}`}>
                                                            {getTypeLabel(exp.type_expedition)}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-400">{formatDate(exp.created_at)}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(exp.statut_expedition)}`}>
                                                        {getStatusLabel(exp.statut_expedition)}
                                                    </span>
                                                    <span className={`text-[9px] font-bold ${exp.statut_paiement === 'paye' ? 'text-emerald-600' : 'text-orange-500'}`}>
                                                        {exp.statut_paiement === 'en_attente' ? 'En attente' : 'Payé'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Trajet */}
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                                                <span className="truncate max-w-[40%]">{exp.pays_depart}</span>
                                                <div className="flex-1 flex items-center justify-center px-2">
                                                    <div className="h-px bg-slate-300 w-full flex relative items-center justify-center">
                                                        <div className="w-1 h-1 bg-slate-400 rounded-full absolute left-0"></div>
                                                        <svg className="w-3 h-3 text-indigo-400 absolute -top-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                        <div className="w-1 h-1 bg-slate-400 rounded-full absolute right-0"></div>
                                                    </div>
                                                </div>
                                                <span className="truncate max-w-[40%] text-indigo-600">{exp.pays_destination}</span>
                                            </div>

                                            {/* Acteurs */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expéditeur</span>
                                                    <p className="text-xs font-bold text-slate-700 truncate">{exp.expediteur?.nom_prenom}</p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Destinataire</span>
                                                    <p className="text-xs font-bold text-slate-700 truncate">{exp.destinataire?.nom_prenom}</p>
                                                </div>
                                            </div>

                                            {/* Footer Card */}
                                            <div className="pt-3 border-t border-slate-100 flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                                                    <span className="text-sm font-bold text-slate-900 tracking-tight tabular-nums">
                                                        {formatPriceDual(exp.montant_expedition)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handlePrintReceipt(exp)}
                                                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                    </button>
                                                    <Link
                                                        to={`/expeditions/${exp.id}`}
                                                        className="p-2 rounded-lg bg-indigo-600 text-white shadow-indigo-200 shadow-md"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 px-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">Aucune expédition trouvée</p>
                                </div>
                            )}
                        </div>

                        {/* Desktop View (Table) */}
                        <table className="hidden lg:table w-full text-left border-collapse">
                            {/* Sticky Premium Header */}
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60">
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Référence</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Expéditeur / Destinataire</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Trajet</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Montant</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Statuts</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {status === 'loading' ? (
                                    // Premium Skeleton Loading
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6">
                                                <div className="space-y-2.5">
                                                    <div className="h-4 bg-slate-200/60 rounded-lg w-32"></div>
                                                    <div className="h-3 bg-slate-100/60 rounded w-24"></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-slate-200/60 rounded-lg"></div>
                                                        <div className="h-3 bg-slate-200/60 rounded w-28"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-slate-100/60 rounded-lg"></div>
                                                        <div className="h-3 bg-slate-100/60 rounded w-28"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="h-16 bg-slate-100/60 rounded-xl w-24"></div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-slate-200/60 rounded w-24"></div>
                                                    <div className="h-3 bg-slate-100/60 rounded w-16"></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2">
                                                    <div className="h-6 bg-slate-200/60 rounded-full w-24"></div>
                                                    <div className="h-5 bg-slate-100/60 rounded-full w-28"></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end gap-2">
                                                    <div className="h-9 w-9 bg-slate-100/60 rounded-xl"></div>
                                                    <div className="h-9 w-9 bg-slate-100/60 rounded-xl"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredExpeditions.length > 0 ? (
                                    filteredExpeditions.map((exp) => (
                                        <tr
                                            key={exp.id}
                                            className="group relative hover:bg-slate-50/40 transition-all duration-200 ease-out border-l-2 border-transparent hover:border-indigo-500"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 tracking-tight">
                                                        {exp.reference}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                                                        {formatDate(exp.created_at)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/40 flex items-center justify-center">
                                                            <span className="text-[10px] font-bold text-blue-600">E</span>
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-700 tracking-tight">{exp.expediteur?.nom_prenom}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/40 flex items-center justify-center">
                                                            <span className="text-[10px] font-bold text-purple-600">D</span>
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-700 tracking-tight">{exp.destinataire?.nom_prenom}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5 bg-slate-100/60 rounded-md">
                                                            {exp.pays_depart}
                                                        </span>
                                                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                        </svg>
                                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider px-2 py-0.5 bg-indigo-50/60 rounded-md border border-indigo-100">
                                                            {exp.pays_destination}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-slate-900 tracking-tight tabular-nums">
                                                        {formatPriceDual(exp.montant_expedition)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">
                                                            {exp.colis?.length || 0} Colis
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border shadow-sm ${getTypeStyle(exp.type_expedition)}`}>
                                                            {getTypeLabel(exp.type_expedition)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex  gap-2">
                                                    <span className={`inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] border ${getStatusStyle(exp.statut_expedition)}`}>
                                                        {getStatusLabel(exp.statut_expedition)}
                                                    </span>
                                                    {/* <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-wider border ${getPaymentStatusStyle(exp.statut_paiement)}`}>
                                                        {exp.statut_paiement === 'en_attente' ? 'En attente' : exp.statut_paiement}
                                                    </span> */}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* View Details Button */}
                                                    <Link
                                                        to={`/expeditions/${exp.id}`}
                                                        className="group/btn relative p-2.5 hover:bg-white rounded-xl transition-all duration-200 text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50"
                                                        title="Voir les détails"
                                                    >
                                                        <svg className="w-5 h-5 transition-transform duration-200 group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <div className="absolute inset-0 rounded-xl bg-indigo-500/0 group-hover/btn:bg-indigo-500/5 transition-colors duration-200"></div>
                                                    </Link>

                                                    {/* Print Receipt Button */}
                                                    <button
                                                        onClick={() => handlePrintReceipt(exp)}
                                                        className="group/btn relative p-2.5 hover:bg-white rounded-xl transition-all duration-200 text-slate-400 hover:text-emerald-600 border border-transparent hover:border-slate-200 hover:shadow-lg hover:shadow-emerald-200/50"
                                                        title="Imprimer les reçus"
                                                    >
                                                        <svg className="w-5 h-5 transition-transform duration-200 group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                        </svg>
                                                        <div className="absolute inset-0 rounded-xl bg-emerald-500/0 group-hover/btn:bg-emerald-500/5 transition-colors duration-200"></div>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Premium Empty State
                                    <tr>
                                        <td colSpan="6" className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center max-w-md mx-auto">
                                                <div className="relative w-24 h-24 mb-6">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl rotate-6"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white rounded-3xl -rotate-6 shadow-lg"></div>
                                                    <div className="relative w-full h-full bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                                                        <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Aucune expédition</h3>
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                                    Commencez par créer votre première expédition pour suivre vos envois en temps réel.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Premium Pagination */}
                    {meta && meta.last_page > 1 && (
                        <div className="px-8 py-6 bg-slate-50/50 backdrop-blur-sm border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.15em]">
                                Page <span className="text-indigo-600 font-bold">{meta.current_page}</span> sur <span className="text-slate-900 font-bold">{meta.last_page}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(meta.current_page - 1)}
                                    disabled={meta.current_page === 1}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all duration-200 ${meta.current_page === 1
                                        ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                                        : 'text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5'
                                        }`}
                                >
                                    Précédent
                                </button>

                                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                <span className="px-2 text-slate-300 font-bold">···</span>
                                            )}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={`min-w-[2.75rem] h-11 rounded-xl text-xs font-bold transition-all duration-200 ${meta.current_page === page
                                                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                                    : 'text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    ))}

                                <button
                                    onClick={() => handlePageChange(meta.current_page + 1)}
                                    disabled={meta.current_page === meta.last_page}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all duration-200 ${meta.current_page === meta.last_page
                                        ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                                        : 'text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5'
                                        }`}
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print Modal */}
            {showPrintModal && selectedExpedition && (
                <PrintSuccessModal
                    expedition={selectedExpedition}
                    agency={{
                        ...(agencyData?.agence || agencyData),
                        logo: getLogoUrl(agencyData?.agence?.logo || agencyData?.logo)
                    }}
                    onClose={() => {
                        setShowPrintModal(false);
                        setSelectedExpedition(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default Expeditions;
