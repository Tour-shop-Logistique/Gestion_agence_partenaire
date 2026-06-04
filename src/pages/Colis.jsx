import React, { useEffect, useState, useMemo } from "react";
import { useExpedition } from "../hooks/useExpedition";
import { Link } from "react-router-dom";
import { formatPriceDual } from "../utils/format";
import { toast } from "../utils/toast";
import {
    CubeIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    IdentificationIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    QrCodeIcon
} from "@heroicons/react/24/outline";
import QRScanner from "../components/QRScanner";

const Colis = () => {
    const {
        expeditions, meta, loadExpeditions, status, lastFilters,
        receiveColisDepart, sendColisToEntrepot, resetStatus, message, error
    } = useExpedition();
    const loadingColis = status === 'loading';
    const [currentPage, setCurrentPage] = useState(lastFilters?.page || 1);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);

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
        const colis = expeditions.flatMap(exp =>
            (exp.colis || []).map(item => ({
                ...item,
                expedition: exp,
                expedition_id: exp.id,
                expedition_status: exp.statut_expedition,
                // Déterminer l'état de réception basé sur le statut de l'expédition
                is_received_depart: item.is_received_by_agence_depart === true || exp.statut_expedition === 'recu_agence_depart',
                is_received_destination: item.is_received_by_agence_destination === true,
                is_received: item.is_received_by_agence_depart === true || item.is_received_by_agence_destination === true || item.is_received_by_agence === true || exp.statut_expedition === 'recu_agence_depart',
                is_sent: item.is_expedie_vers_entrepot === true
            }))
        );
        
        return colis;
    }, [expeditions]);

    // Filtrer uniquement les colis "Envoi pour expédition" : Colis avec statut expédition "recu_agence_depart"
    // qui ne sont PAS encore expédiés vers l'entrepôt
    const tabColis = useMemo(() => {
        const filtered = allColis.filter(c => 
            c.expedition_status === 'recu_agence_depart' && !c.is_sent
        );
        console.log("🚚 Colis reçus à envoyer:", {
            total: filtered.length,
            expeditions: [...new Set(filtered.map(c => c.expedition?.reference))],
        });
        return filtered;
    }, [allColis]);

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

    // Grouper les colis par expédition pour l'affichage structuré
    const groupedExpeditions = useMemo(() => {
        const groups = {};
        filteredColis.forEach(item => {
            const expId = item.expedition_id || item.expedition?.id;
            if (!expId) return;
            
            if (!groups[expId]) {
                groups[expId] = {
                    ...(item.expedition || {}),
                    id: expId,
                    colis: []
                };
            }
            groups[expId].colis.push(item);
        });
        return Object.values(groups);
    }, [filteredColis]);

    const selectableColis = useMemo(() =>
        filteredColis.filter(c => !c.is_sent),
        [filteredColis]);

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
        await sendColisToEntrepot(selectedCodes);
        setProcessing(false);
    };

    const handleQRScan = (scannedData) => {
        // Chercher le colis dans la liste filtrée
        let foundColis = filteredColis.find(c => c.code_colis === scannedData);
        
        // Si pas trouvé, chercher par code_colis partiel
        if (!foundColis) {
            foundColis = filteredColis.find(c => scannedData.includes(c.code_colis));
        }
        
        // Si pas trouvé, chercher par ID d'expédition
        if (!foundColis) {
            foundColis = filteredColis.find(c => 
                c.expedition_id === parseInt(scannedData) || 
                c.expedition?.id === parseInt(scannedData)
            );
        }
        
        // Vérifier si le colis peut être sélectionné
        const isProcessed = foundColis?.is_sent;
        
        if (foundColis && !isProcessed) {
            // Sélectionner le colis trouvé
            if (!selectedCodes.includes(foundColis.code_colis)) {
                setSelectedCodes(prev => [...prev, foundColis.code_colis]);
            }
            
            // Afficher un message de succès
            toast.success(`Colis ${foundColis.code_colis} sélectionné !`);
            
            // Scroll vers le colis dans la liste
            setTimeout(() => {
                const element = document.getElementById(`colis-${foundColis.code_colis}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } else if (foundColis && isProcessed) {
            toast.info(`Le colis ${foundColis.code_colis} a déjà été expédié.`);
        } else {
            toast.error(`Aucun colis trouvé avec le code scanné : ${scannedData}`);
        }
    };

    return (
        <div className="space-y-3 sm:space-y-4 max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
            {/* Header Section - Responsive */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                            Gestion des Colis - À envoyer
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2">
                            Envoyez les colis reçus vers l'entrepôt
                        </p>
                        {selectedCodes.length > 0 && (
                            <span className="inline-block mt-1 sm:mt-2 text-indigo-600 font-medium text-xs sm:text-sm">
                                {selectedCodes.length} colis sélectionné(s)
                            </span>
                        )}
                    </div>
                </div>

                {/* Scanner Row */}
                <div className="flex items-center gap-2">
                    {/* Search Bar */}
                    <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    {/* Scanner Button */}
                    <button
                        onClick={() => setScannerOpen(true)}
                        className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-indigo-700 transition-all gap-1.5 sm:gap-2 flex-shrink-0"
                    >
                        <QrCodeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Scanner</span>
                    </button>
                </div>
            </div>

            {/* QR Scanner Modal */}
            <QRScanner 
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleQRScan}
            />

            {/* Info Banner pour clarifier les statuts
            <div className={`rounded-xl p-4 flex items-start gap-3 border ${
                activeTab === 'agence' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-purple-50 border-purple-200'
            }`}>
                <div className={`p-1 rounded-lg shrink-0 ${
                    activeTab === 'agence' 
                        ? 'bg-blue-100' 
                        : 'bg-purple-100'
                }`}>
                    <IdentificationIcon className={`w-5 h-5 ${
                        activeTab === 'agence' 
                            ? 'text-blue-600' 
                            : 'text-purple-600'
                    }`} />
                </div>
                <div className="flex-1">
                    {activeTab === 'agence' ? (
                        <>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-blue-900">
                                    📦 Expéditions acceptées à réceptionner
                                </p>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                    {tabColis.length} colis
                                </span>
                            </div>
                            <p className="text-xs text-blue-700">
                                Affiche uniquement les colis des expéditions avec le <strong>statut "Acceptée"</strong> qui 
                                n'ont pas encore été réceptionnés à votre agence. Sélectionnez les colis reçus pour confirmer leur réception.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-purple-900">
                                    🚚 Colis reçus prêts pour l'expédition
                                </p>
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                    {tabColis.length} colis
                                </span>
                            </div>
                            <p className="text-xs text-purple-700">
                                Affiche les colis avec le <strong>statut "Reçu agence départ"</strong> qui sont prêts à être 
                                envoyés vers l'entrepôt. Sélectionnez les colis à expédier pour initier leur envoi.
                            </p>
                        </>
                    )}
                </div>
            </div> */}

            {/* Data Section */}
            <div className="relative">
                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b-2 border-slate-200">
                                    <th className="px-4 py-5 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                            checked={selectableColis.length > 0 && selectedCodes.length === selectableColis.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Colis Info</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Catégorie & Détails</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Expédition</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-center">Dimensions & Poids</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-right">Montant Total</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-right">Détails</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-0">
                                {loadingColis && allColis.length === 0 ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-6" colSpan="7">
                                                <div className="h-12 bg-slate-50 rounded-xl w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : groupedExpeditions.length > 0 ? (
                                    groupedExpeditions.map((exp) => {
                                        const expColis = exp.colis || [];
                                        return (
                                            <React.Fragment key={exp.id}>
                                                {/* ══ SÉPARATEUR ENTRE EXPÉDITIONS ══ */}
                                                <tr className="h-3 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100">
                                                    <td colSpan="7" className="border-t-4 border-slate-200"></td>
                                                </tr>

                                                {/* 📦 EXPEDITION HEADER - Design Card-like avec ombre */}
                                                <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg">
                                                    <td className="px-5 py-3.5" colSpan="7">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                {/* Badge référence */}
                                                                <div className="flex items-center gap-2.5">
                                                                    <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                                    </svg>
                                                                    <span className="text-sm font-bold text-white tracking-wide">
                                                                        {exp.reference}
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Séparateur vertical */}
                                                                <div className="w-px h-5 bg-white/30"></div>
                                                                
                                                                {/* Trajet */}
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-medium text-white/90">{exp.pays_depart}</span>
                                                                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                    </svg>
                                                                    <span className="text-xs font-medium text-white">{exp.pays_destination}</span>
                                                                </div>
                                                            </div>

                                                            {/* Compteur colis */}
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30">
                                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                                <span className="text-xs font-bold text-white">{expColis.length}</span>
                                                                <span className="text-xs font-medium text-white/80">colis</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* ── Ligne de transition header → colis (bordure fine) ── */}
                                                <tr className="h-0.5 bg-indigo-100">
                                                    <td colSpan="7" className="border-b border-indigo-200"></td>
                                                </tr>

                                                {/* 📋 COLIS ROWS */}
                                                {expColis.map((item, idx) => (
                                                    <tr
                                                        key={item.id}
                                                        id={`colis-${item.code_colis}`}
                                                        className={`
                                                            ${item.is_sent 
                                                                ? 'bg-emerald-50/30' 
                                                                : selectedCodes.includes(item.code_colis) 
                                                                    ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-200' 
                                                                    : 'bg-white hover:bg-slate-50'
                                                            } 
                                                            ${idx !== expColis.length - 1 ? 'border-b border-slate-100' : 'border-b-2 border-slate-200'}
                                                            cursor-pointer transition-all duration-150
                                                        `}
                                                        onClick={() => !item.is_sent && toggleSelect(item.code_colis)}
                                                    >
                                                        <td className="px-4 py-6" onClick={(e) => e.stopPropagation()}>
                                                            {item.is_sent ? (
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
                                                                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wide hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                                            >
                                                                Détails
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="7" className="py-20 text-center font-bold text-slate-400 italic">Aucun colis trouvé</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Multi-select Action Bar - Responsive */}
                {selectedCodes.length > 0 && (
                    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl animate-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-slate-900 text-white rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 shadow-2xl shadow-indigo-500/20 border border-slate-800 flex items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="bg-indigo-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                                    {selectedCodes.length}
                                </div>
                                <button
                                    onClick={() => setSelectedCodes([])}
                                    className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                            <button
                                onClick={handleBulkAction}
                                disabled={processing}
                                className="px-3 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 sm:gap-2 group"
                            >
                                {processing ? (
                                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-500" />
                                )}
                                <span className="hidden sm:inline">
                                    {activeTab === 'agence' ? "Confirmer la réception" : "Envoyer à l'entrepôt"}
                                </span>
                                <span className="sm:hidden">
                                    Envoyer
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile & Tablet Card View - Version Ultra-Compacte */}
                <div className="lg:hidden space-y-2 pb-20">
                    {loadingColis && allColis.length === 0 ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm animate-pulse space-y-2">
                                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                                <div className="h-3 bg-slate-100 rounded w-full"></div>
                                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                            </div>
                        ))
                    ) : filteredColis.length > 0 ? (
                        filteredColis.map((item) => {
                            const isProcessed = item.is_sent;
                            return (
                                <div
                                    key={item.id}
                                    id={`colis-${item.code_colis}`}
                                    className={`bg-white rounded-xl border transition-all active:scale-[0.98] overflow-hidden ${selectedCodes.includes(item.code_colis) ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-md' : 'border-slate-200 shadow-sm'}`}
                                    onClick={() => !isProcessed && toggleSelect(item.code_colis)}
                                >
                                    {/* Header Compact */}
                                    <div className="p-3 border-b border-slate-100 flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            {/* Checkbox */}
                                            <div onClick={(e) => e.stopPropagation()}>
                                                {isProcessed ? (
                                                    <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <IdentificationIcon className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedCodes.includes(item.code_colis)}
                                                        onChange={() => toggleSelect(item.code_colis)}
                                                    />
                                                )}
                                            </div>
                                            
                                            {/* Code & Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-xs font-bold text-indigo-600 truncate">{item.code_colis}</span>
                                                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[8px] font-bold uppercase border border-indigo-100 whitespace-nowrap">
                                                        {item.category?.nom}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">{item.designation}</p>
                                            </div>
                                        </div>

                                        {/* Expedition Badge */}
                                        <Link 
                                            to={`/expeditions/${item.expedition_id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-shrink-0 px-2 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-700 hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            {item.expedition?.reference}
                                        </Link>
                                    </div>

                                    {/* Body Compact */}
                                    <div className="p-3 grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-[9px] font-semibold text-slate-400 uppercase">Poids</p>
                                            <p className="text-xs font-bold text-slate-900">{parseFloat(item.poids)} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-semibold text-slate-400 uppercase">Dimensions</p>
                                            <p className="text-[10px] font-bold text-slate-900 tabular-nums">
                                                {parseFloat(item.longueur)}x{parseFloat(item.largeur)}x{parseFloat(item.hauteur)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-semibold text-slate-400 uppercase">Montant</p>
                                            <p className="text-xs font-bold text-slate-900">
                                                {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(item.montant_colis_total || 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="p-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                                            <span className="truncate max-w-[80px]">{item.expedition?.pays_depart}</span>
                                            <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                            <span className="truncate max-w-[80px] text-indigo-600">{item.expedition?.pays_destination}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            {isProcessed ? (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold uppercase border border-emerald-100">
                                                    <IdentificationIcon className="w-3 h-3" />
                                                    Expédié
                                                </span>
                                            ) : selectedCodes.length === 0 && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedCodes([item.code_colis]);
                                                        handleBulkAction();
                                                    }}
                                                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold uppercase hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                                                >
                                                    Envoyer
                                                </button>
                                            )}
                                            <Link
                                                to={`/expeditions/${item.expedition_id}`}
                                                className="p-1.5 rounded-lg bg-slate-900 text-white"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CubeIcon className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-xs font-bold text-slate-400">Aucun colis trouvé</p>
                        </div>
                    )}
                </div>

                {/* Multi-select Action Bar - Responsive */}
                {selectedCodes.length > 0 && (
                    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl animate-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-slate-900 text-white rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 shadow-2xl shadow-indigo-500/20 border border-slate-800 flex items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="bg-indigo-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                                    {selectedCodes.length}
                                </div>
                                <button
                                    onClick={() => setSelectedCodes([])}
                                    className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                            <button
                                onClick={handleBulkAction}
                                disabled={processing}
                                className="px-3 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 sm:gap-2 group"
                            >
                                {processing ? (
                                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-500" />
                                )}
                                <span className="hidden sm:inline">
                                    {activeTab === 'agence' ? "Confirmer la réception" : "Envoyer à l'entrepôt"}
                                </span>
                                <span className="sm:hidden">
                                    Envoyer
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Pagination - Responsive */}
                {meta && meta.last_page > 1 && (
                    <div className="mt-4 sm:mt-6 px-3 sm:px-8 py-4 sm:py-6 bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 flex flex-col items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Page</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 text-xs font-bold">{meta.current_page} / {meta.last_page}</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => handlePageChange(meta.current_page - 1)}
                                disabled={meta.current_page === 1}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] font-bold uppercase border border-slate-200 bg-white text-slate-600 disabled:opacity-50 transition-all"
                            >
                                <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Précédent</span>
                                <span className="sm:hidden">Préc.</span>
                            </button>

                            <button
                                onClick={() => handlePageChange(meta.current_page + 1)}
                                disabled={meta.current_page === meta.last_page}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] font-bold uppercase bg-slate-900 text-white shadow-lg shadow-slate-200 disabled:opacity-50 transition-all"
                            >
                                <span className="hidden sm:inline">Suivant</span>
                                <span className="sm:hidden">Suiv.</span>
                                <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Colis;
