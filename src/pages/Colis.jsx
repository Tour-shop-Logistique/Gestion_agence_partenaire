import React, { useEffect, useState, useMemo } from "react";
import { useExpedition } from "../hooks/useExpedition";
import { Link } from "react-router-dom";
import { formatPriceDual } from "../utils/format";
import {
    CubeIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    IdentificationIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";

const Colis = () => {
    const {
        expeditions, meta, loadExpeditions, status, lastFilters,
        receiveColisDepart, sendColisToEntrepot, resetStatus, message, error
    } = useExpedition();
    const loadingColis = status === 'loading';
    const [currentPage, setCurrentPage] = useState(lastFilters?.page || 1);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('agence'); // 'agence' or 'entrepot'

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

    const [searchQuery, setSearchQuery] = useState("");

    const fetchColisData = (force = false) => {
        loadExpeditions({
            page: currentPage,
            date_debut: lastFilters?.date_debut || getFirstDayOfMonth(),
            date_fin: lastFilters?.date_fin || getTodayDate()
        }, force);
    };

    useEffect(() => {
        fetchColisData();
    }, [currentPage, loadExpeditions]);

    useEffect(() => {
        if (message || error) {
            if (message) {
                // On ne rafraîchit plus systématiquement si le state Redux est déjà à jour
                // fetchColisData(true); 
                setSelectedCodes([]);
            }
            const timer = setTimeout(() => resetStatus(), 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error, resetStatus]);

    // Transformer les expéditions en liste de colis
    const allColis = useMemo(() => {
        if (!expeditions) return [];
        return expeditions.flatMap(exp =>
            (exp.colis || []).map(item => ({
                ...item,
                expedition: exp,
                expedition_id: exp.id,
                expedition_status: exp.statut_expedition,
                is_received: item.is_received_by_agence_depart === true || item.is_received_by_agence_destination === true || item.is_received_by_agence === true,
                is_sent: item.is_expedie_vers_entrepot === true
            }))
        );
    }, [expeditions]);

    // Filtrer les colis selon l'onglet actif
    const tabColis = useMemo(() => {
        if (activeTab === 'agence') {
            // Onglet "En agence" : uniquement les colis NON reçus ET avec statut expédition "accepted"
            return allColis.filter(c => !c.is_received && c.expedition_status === 'accepted');
        } else {
            // Onglet "Envoi pour expédition" : uniquement les colis déjà reçus
            return allColis.filter(c => c.is_received);
        }
    }, [allColis, activeTab]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (meta?.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Filter parcels based on search query (local filter for instant response)
    const filteredColis = useMemo(() => {
        if (!searchQuery) return tabColis;
        const lowerQuery = searchQuery.toLowerCase();
        return tabColis.filter(item =>
            item.code_colis?.toLowerCase().includes(lowerQuery) ||
            item.designation?.toLowerCase().includes(lowerQuery) ||
            item.expedition?.reference?.toLowerCase().includes(lowerQuery) ||
            item.category?.nom?.toLowerCase().includes(lowerQuery) ||
            item.articles?.some(a => String(a).toLowerCase().includes(lowerQuery))
        );
    }, [tabColis, searchQuery]);

    const selectableColis = useMemo(() =>
        filteredColis.filter(c => activeTab === 'agence' ? !c.is_received : !c.is_sent),
        [filteredColis, activeTab]);

    const toggleSelect = (code) => {
        setSelectedCodes(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const toggleSelectAll = () => {
        if (selectedCodes.length === selectableColis.length) {
            setSelectedCodes([]);
        } else {
            setSelectedCodes(selectableColis.map(c => c.code_colis));
        }
    };

    const handleBulkAction = async () => {
        if (selectedCodes.length === 0) return;
        setProcessing(true);
        if (activeTab === 'agence') {
            await receiveColisDepart(selectedCodes);
        } else {
            await sendColisToEntrepot(selectedCodes);
        }
        setProcessing(false);
    };

    return (
        <div className="space-y-4 sm:space-y-8 max-w-[1600px] mx-auto px-1 sm:px-0">
            {/* Premium Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg shrink-0">
                            <CubeIcon className="w-5 h-5 sm:w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                                Gestion des Colis
                            </h1>
                            {selectedCodes.length > 0 && (
                                <span className="text-indigo-600 font-bold text-xs mt-1 animate-pulse">
                                    {selectedCodes.length} colis sélectionné(s)
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide ml-10 sm:ml-12">
                        {activeTab === 'agence'
                            ? "Confirmez la réception des colis des expéditions acceptées arrivant à l'agence"
                            : "Préparez et initiez l'envoi des colis vers l'entrepôt"}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 self-start lg:self-center">
                    <button
                        onClick={() => { setActiveTab('agence'); setSelectedCodes([]); }}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'agence' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        En agence
                    </button>
                    <button
                        onClick={() => { setActiveTab('entrepot'); setSelectedCodes([]); }}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'entrepot' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Envoi pour expedition
                    </button>
                </div>

                <div className="flex flex-col gap-3 w-full lg:w-auto">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative group w-full sm:w-64 lg:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Banner pour l'onglet "En agence"
            {activeTab === 'agence' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-lg shrink-0">
                        <IdentificationIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                            Colis des expéditions acceptées uniquement
                        </p>
                        <p className="text-xs text-blue-700">
                            Seuls les colis des expéditions avec le statut "Acceptée" sont affichés ici. 
                            Les expéditions en attente ou refusées ne peuvent pas être réceptionnées.
                        </p>
                    </div>
                </div>
            )} */}

            {/* Data Section */}
            <div className="relative">
                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200">
                                    <th className="px-4 py-5 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                            checked={selectableColis.length > 0 && selectedCodes.length === selectableColis.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Colis Info</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Catégorie & Détails</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expédition</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Dimensions & Poids</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Montant Total</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Détails</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingColis && allColis.length === 0 ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-6" colSpan="7">
                                                <div className="h-12 bg-slate-50 rounded-xl w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredColis.length > 0 ? (
                                    filteredColis.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-slate-50/30 transition-colors group ${selectedCodes.includes(item.code_colis) ? 'bg-indigo-50/30' : ''}`}
                                            onClick={() => toggleSelect(item.code_colis)}
                                        >
                                            <td className="px-4 py-6" onClick={(e) => e.stopPropagation()}>
                                                {(activeTab === 'agence' ? item.is_received : item.is_sent) ? (
                                                    <div className="flex justify-center">
                                                        <div className="p-1 px-2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            <IdentificationIcon className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                                        checked={selectedCodes.includes(item.code_colis)}
                                                        onChange={() => toggleSelect(item.code_colis)}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-6 font-bold text-slate-900">
                                                <div className="flex flex-col">
                                                    <span className="text-indigo-600">{item.code_colis}</span>
                                                    <span className="text-xs font-semibold text-slate-500">{item.designation}</span>
                                                    <span className="text-[10px] text-slate-400 mt-1">Le {formatDate(item.created_at)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="inline-flex px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase w-fit">
                                                        {item.category?.nom}
                                                    </span>
                                                    <p className="text-[11px] text-slate-600 line-clamp-1 italic">{item.articles?.join(', ')}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <Link to={`/expeditions/${item.expedition_id}`} className="group/exp">
                                                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg group-hover/exp:bg-indigo-600 group-hover/exp:text-white transition-all">
                                                        {item.expedition?.reference}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 mt-1">
                                                        <span>{item.expedition?.pays_depart}</span>
                                                        <ArrowPathIcon className="w-2.5 h-2.5" />
                                                        <span className="text-indigo-600">{item.expedition?.pays_destination}</span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-xs font-bold text-slate-900">{parseFloat(item.poids)} kg</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {parseFloat(item.longueur)}x{parseFloat(item.largeur)}x{parseFloat(item.hauteur)} cm
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                        {formatPriceDual(item.montant_colis_total)}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase italic">
                                                        Prestation: {formatPriceDual(item.montant_colis_prestation)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <Link
                                                    to={`/expeditions/${item.expedition_id}`}
                                                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                                >
                                                    Détails
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className="py-20 text-center font-bold text-slate-400 italic">Aucun colis trouvé</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Multi-select Action Bar */}
                {selectedCodes.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl animate-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-slate-900 text-white rounded-2xl px-6 py-4 shadow-2xl shadow-indigo-500/20 border border-slate-800 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                    {selectedCodes.length} sélectionnés
                                </div>
                                <button
                                    onClick={() => setSelectedCodes([])}
                                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                            <button
                                onClick={handleBulkAction}
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group"
                            >
                                {processing ? (
                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                )}
                                <span>
                                    {activeTab === 'agence' ? "Confirmer la réception" : "Envoyer à l'entrepôt"}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile & Tablet Card View */}
                <div className="lg:hidden space-y-4">
                    {loadingColis && allColis.length === 0 ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-3">
                                <div className="h-5 bg-slate-100 rounded w-1/3"></div>
                                <div className="h-4 bg-slate-100 rounded w-full"></div>
                                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                            </div>
                        ))
                    ) : filteredColis.length > 0 ? (
                        <div className="space-y-4 pb-20">
                            {filteredColis.map((item) => {
                                const isProcessed = activeTab === 'agence' ? item.is_received : item.is_sent;
                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-white rounded-2xl border transition-all active:scale-[0.98] overflow-hidden ${selectedCodes.includes(item.code_colis) ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-slate-200/60 shadow-sm'}`}
                                        onClick={() => !isProcessed && toggleSelect(item.code_colis)}
                                    >
                                        <div className="p-4 sm:p-5 border-b border-slate-50 bg-slate-50/40 flex items-start gap-4">
                                            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                                                {isProcessed ? (
                                                    <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <IdentificationIcon className="w-5 h-5" />
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                                        checked={selectedCodes.includes(item.code_colis)}
                                                        onChange={() => toggleSelect(item.code_colis)}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-indigo-600 tracking-tight">{item.code_colis}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ref: {item.expedition?.reference}</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase border border-indigo-100">
                                                        {item.category?.nom}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.designation}</h3>
                                                <p className="text-[11px] text-slate-500 line-clamp-1 font-medium italic mt-1">{item.articles?.join(', ')}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 sm:p-5 grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Dimensions</p>
                                                <p className="text-xs font-bold text-slate-900 tabular-nums">
                                                    {parseFloat(item.hauteur)}x{parseFloat(item.largeur)}x{parseFloat(item.longueur)} cm
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">{parseFloat(item.volume).toLocaleString()} cm³</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Poids</p>
                                                <p className="text-xs font-bold text-slate-900 uppercase">{parseFloat(item.poids)} KG</p>
                                            </div>
                                            <div className="space-y-1 col-span-2 pt-2 border-t border-slate-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Montant Total</p>
                                                <div className="flex items-baseline justify-between">
                                                    <p className="text-sm font-bold text-slate-900 tabular-nums">
                                                        {formatPriceDual(item.montant_colis_total)}
                                                    </p>
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        {isProcessed ? (
                                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold uppercase border border-emerald-100">
                                                                <IdentificationIcon className="w-3.5 h-3.5" />
                                                                {activeTab === 'agence' ? 'Reçu' : 'Expédié'}
                                                            </span>
                                                        ) : selectedCodes.length === 0 && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedCodes([item.code_colis]);
                                                                    handleBulkAction();
                                                                }}
                                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm"
                                                            >
                                                                {activeTab === 'agence' ? 'Recevoir' : 'Envoyer'}
                                                            </button>
                                                        )}
                                                        <Link
                                                            to={`/expeditions/${item.expedition_id}`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-slate-200"
                                                        >
                                                            Détails
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm italic text-slate-400 font-bold">
                            Désolé aucune donnée disponible
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="mt-6 sm:mt-8 px-4 sm:px-8 py-5 sm:py-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 text-xs font-bold">{meta.current_page} / {meta.last_page}</span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => handlePageChange(meta.current_page - 1)}
                                disabled={meta.current_page === 1}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase border border-slate-200 bg-white text-slate-600 disabled:opacity-50 transition-all font-bold"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                <span>Précédent</span>
                            </button>

                            <button
                                onClick={() => handlePageChange(meta.current_page + 1)}
                                disabled={meta.current_page === meta.last_page}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase bg-slate-900 text-white shadow-lg shadow-slate-200 disabled:opacity-50 transition-all font-bold"
                            >
                                <span>Suivant</span>
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Colis;
