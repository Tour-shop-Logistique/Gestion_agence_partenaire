import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { useExpedition } from "../hooks/useExpedition";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { realtimeColisUpdated } from "../store/slices/expeditionSlice";
import { Link } from "react-router-dom";
import { toast, showToast } from "../utils/toast";
import soundNotification from "../utils/soundNotification";
import {
    InboxArrowDownIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    QrCodeIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import QRScanner from "../components/QRScanner";
import ColisDetailsDrawer from "../components/common/ColisDetailsDrawer";
import useHasPermission from "../hooks/useHasPermission";

const ColisAReceptionner = () => {
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const canReceive = useHasPermission("colis_a_receptionner.receive_destination");
    const {
        reception = [],
        receptionMeta = { current_page: 1, last_page: 1 },
        loadReception,
        status,
        message,
        error,
        receiveColisDestination,
        resetStatus
    } = useExpedition();
    const loading = status === 'loading';
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [scannerOpen, setScannerOpen] = useState(false);
    const [detailsColis, setDetailsColis] = useState(null);
    
    // Suivre les colis déjà scannés pour éviter les messages en double
    const scannedCodesRef = useRef(new Set());

    // ========== WEBSOCKET INTEGRATION ==========
    useWebSocket(
        currentUser?.agence_id,
        {
            onColisAssigned: (data, meta) => {
                console.log('📍 [Réception] Nouveau(x) colis à réceptionner:', meta.count);
                showToast(`🎉 ${meta.count} nouveau(x) colis à réceptionner`, 'success');
                soundNotification.playSuccess();
                dispatch(realtimeColisUpdated(data));
            },

            onColisReceivedByBackoffice: (data, meta) => {
                console.log('📥 [Réception] Colis arrivé(s) au backoffice:', meta.references);
                showToast(`Colis en transit: ${meta.references.join(', ')}`, 'info');
                dispatch(realtimeColisUpdated(data));
            },

            onColisBlocked: (data, meta) => {
                console.log('🚫 [Réception] Colis bloqué(s):', meta.references);
                showToast(`⚠️ Colis bloqué(s): ${meta.references.join(', ')}`, 'warning');
                soundNotification.playAlert();
                dispatch(realtimeColisUpdated(data));
            },

            onColisUnblocked: (data, meta) => {
                console.log('✅ [Réception] Colis débloqué(s):', meta.references);
                showToast(`Colis débloqué(s): ${meta.references.join(', ')}`, 'success');
                dispatch(realtimeColisUpdated(data));
            }
        },
        !!currentUser?.agence_id
    );

    const fetchReceptionData = (force = false) => {
        loadReception({
            page: currentPage,
        }, force);
    };

    useEffect(() => {
        fetchReceptionData();
    }, [currentPage]);

    useEffect(() => {
        if (error) {
            // Afficher uniquement les messages d'erreur
            const timer = setTimeout(() => resetStatus(), 3000);
            return () => clearTimeout(timer);
        }
        // Réinitialiser la sélection après une action réussie
        if (status === 'succeeded') {
            setSelectedCodes([]);
        }
    }, [status, error, resetStatus]);

    // Transformer les données en liste de colis à plat pour la recherche/filtre
    const flatColis = useMemo(() => {
        if (!reception || !Array.isArray(reception)) return [];
        
        // Si c'est déjà une liste de colis (le format envoyé par l'API maintenant)
        if (reception.length > 0 && !reception[0].colis) {
            return reception.map(item => ({
                ...item,
                is_received: item.is_received_by_agence_destination === true,
                is_received_by_backoffice: item.is_received_by_backoffice === true
            }));
        }

        // Ancien format : liste d'expéditions contenant des colis
        return reception.flatMap(exp =>
            (exp.colis || []).map(item => ({
                ...item,
                expedition: exp,
                expedition_id: exp.id,
                is_received: item.is_received_by_agence_destination === true,
                is_received_by_backoffice: item.is_received_by_backoffice === true
            }))
        );
    }, [reception]);

    // Regrouper les colis par expédition pour l'affichage structuré
    const groupedExpeditions = useMemo(() => {
        if (!reception || !Array.isArray(reception)) return [];

        // Si c'est déjà groupé (ancien format)
        if (reception.length > 0 && reception[0].colis) {
            return reception;
        }

        // Regrouper le format plat par expédition
        const groups = {};
        reception.forEach(item => {
            const expId = item.expedition_id || item.expedition?.id;
            if (!expId) return;
            
            if (!groups[expId]) {
                groups[expId] = {
                    ...(item.expedition || {}),
                    id: expId,
                    colis: []
                };
            }
            groups[expId].colis.push({
                ...item,
                is_received_by_backoffice: item.is_received_by_backoffice === true
            });
        });
        return Object.values(groups);
    }, [reception]);

    // Filtrer et trier les colis - En transit d'abord, puis non réceptionnés, puis réceptionnés
    const filteredColis = useMemo(() => {
        let filtered = flatColis;
        
        // Appliquer le filtre de recherche
        if (searchQuery) {
            const lowQuery = searchQuery.toLowerCase();
            filtered = flatColis.filter(item =>
                item.code_colis?.toLowerCase().includes(lowQuery) ||
                item.designation?.toLowerCase().includes(lowQuery) ||
                item.expedition?.reference?.toLowerCase().includes(lowQuery) ||
                item.expedition?.pays_depart?.toLowerCase().includes(lowQuery)
            );
        }
        
        // Trier : colis en transit (isReceivedByBackoffice=false) en premier, 
        // puis colis prêts à réceptionner (isReceivedByBackoffice=true & is_received=false),
        // puis colis déjà réceptionnés (is_received=true)
        return filtered.sort((a, b) => {
            // Ordre de priorité:
            // 1. En transit (isReceivedByBackoffice=false) = priorité 0
            // 2. Prêt à réceptionner (isReceivedByBackoffice=true & is_received=false) = priorité 1
            // 3. Déjà réceptionné (is_received=true) = priorité 2
            
            const getPriority = (item) => {
                if (item.is_received) return 2;
                if (!item.is_received_by_backoffice) return 0;
                return 1;
            };
            
            return getPriority(a) - getPriority(b);
        });
    }, [flatColis, searchQuery]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (receptionMeta?.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const toggleSelect = (code) => {
        // Ne permettre la sélection que si le colis est arrivé au backoffice et non réceptionné
        const colis = filteredColis.find(c => c.code_colis === code);
        if (!colis || colis.is_received || !colis.is_received_by_backoffice) return;
        
        setSelectedCodes(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const selectableColis = useMemo(() =>
        // Seuls les colis qui sont arrivés au backoffice (isReceivedByBackoffice=true) 
        // et qui ne sont pas encore réceptionnés (is_received=false) sont sélectionnables
        filteredColis.filter(c => !c.is_received && c.is_received_by_backoffice),
        [filteredColis]
    );

    const toggleSelectAll = () => {
        if (selectableColis.length === 0) return;
        if (selectedCodes.length === selectableColis.length) {
            setSelectedCodes([]);
        } else {
            setSelectedCodes(selectableColis.map(c => c.code_colis));
        }
    };

    const handleReceiveSelected = async () => {
        if (selectedCodes.length === 0) return;
        setProcessing(true);
        await receiveColisDestination(selectedCodes);
        // Jouer un son de succès après la validation multiple
        if (!error) {
            soundNotification.playScanSound();
        }
        // Réinitialiser le set des colis scannés après réception
        scannedCodesRef.current.clear();
        setProcessing(false);
    };

    const handleReceiveSingle = async (code) => {
        setProcessing(true);
        await receiveColisDestination([code]);
        // Jouer un son de succès après la validation
        if (!error) {
            soundNotification.playScanSound();
        }
        // Retirer le code du set des colis scannés
        scannedCodesRef.current.delete(code);
        setProcessing(false);
    };

    const handleQRScan = (scannedData) => {
        // Le QR code peut contenir soit le code_colis directement, soit l'ID de l'expédition
        // On va chercher dans la liste des colis
        
        // Chercher par code_colis exact
        let foundColis = filteredColis.find(c => c.code_colis === scannedData);
        
        // Si pas trouvé, chercher par code_colis partiel (au cas où le QR contient plus d'infos)
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
        
        if (foundColis) {
            const wasAlreadyScanned = scannedCodesRef.current.has(foundColis.code_colis);
            
            // Vérifier d'abord si le colis a déjà été réceptionné
            if (foundColis.is_received) {
                // N'afficher le message qu'une seule fois
                if (!wasAlreadyScanned) {
                    soundNotification.playWarningSound();
                    toast.info(`Le colis ${foundColis.code_colis} a déjà été réceptionné.`);
                    scannedCodesRef.current.add(foundColis.code_colis);
                }
            }
            // Vérifier si le colis est arrivé au backoffice
            else if (!foundColis.is_received_by_backoffice) {
                // N'afficher le message qu'une seule fois
                if (!wasAlreadyScanned) {
                    soundNotification.playWarningSound();
                    toast.warning(`Le colis ${foundColis.code_colis} est toujours en transit vers le backoffice.`);
                    scannedCodesRef.current.add(foundColis.code_colis);
                }
            }
            // Le colis peut être sélectionné
            else {
                // Vérifier si le colis n'est pas déjà sélectionné
                if (!selectedCodes.includes(foundColis.code_colis)) {
                    setSelectedCodes(prev => [...prev, foundColis.code_colis]);
                    // Jouer le son de succès pour le scan
                    soundNotification.playScanSound();
                    toast.success(`Colis ${foundColis.code_colis} sélectionné !`);
                    
                    // Marquer comme scanné
                    scannedCodesRef.current.add(foundColis.code_colis);
                } else {
                    // Colis déjà sélectionné - afficher le message une seule fois
                    if (!wasAlreadyScanned) {
                        soundNotification.playWarningSound();
                        toast.info(`Le colis ${foundColis.code_colis} est déjà sélectionné.`);
                        scannedCodesRef.current.add(foundColis.code_colis);
                    }
                }
                
                // Scroll vers le colis dans la liste
                setTimeout(() => {
                    const element = document.getElementById(`colis-${foundColis.code_colis}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        } else {
            // Colis non trouvé - toujours afficher l'erreur
            soundNotification.playErrorSound();
            toast.error(`Aucun colis trouvé avec le code scanné : ${scannedData}`);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-1 space-y-3 sm:space-y-6 animate-fade-in">
            {/* Header Section - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                    <button
                        onClick={() => fetchReceptionData(true)}
                        disabled={loading}
                        aria-label="Actualiser"
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm active:scale-95 transition-all disabled:opacity-50"
                        title="Actualiser"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                    <div>
                        <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                            Colis à réceptionner
                        </h1>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                            Gérez les colis en transit vers votre agence
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setScannerOpen(true)}
                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                    <QrCodeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Scanner</span>
                </button>
            </div>

            {/* QR Scanner Modal */}
            <QRScanner 
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleQRScan}
            />

            {/* Search Bar - Responsive */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-9 sm:pl-11 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Selection Bar - Responsive */}
            {selectedCodes.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-2 sm:py-3 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm animate-fade-in-down">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-bold text-slate-700">
                            {selectedCodes.length} sélectionné{selectedCodes.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReceiveSelected}
                            disabled={processing || !canReceive}
                            title={!canReceive ? "Permission requise" : undefined}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                        >
                            {processing ? (
                                <>
                                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
                                    <span className="hidden sm:inline">Traitement...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                                    Réceptionner
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setSelectedCodes([])}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Card View - Version Ultra-Compacte */}
            <div className="lg:hidden space-y-2 pb-20">
                {loading && (reception || []).length === 0 ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm animate-pulse space-y-2">
                            <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                            <div className="h-3 bg-slate-100 rounded w-full"></div>
                            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                        </div>
                    ))
                ) : filteredColis.length > 0 ? (
                    filteredColis.map((item) => {
                        // Déterminer l'état du colis
                        const isInTransit = !item.is_received_by_backoffice;
                        const isReadyToReceive = item.is_received_by_backoffice && !item.is_received;
                        const isReceived = item.is_received;
                        
                        return (
                        <div
                            key={item.id}
                            id={`colis-${item.code_colis}`}
                            className={`bg-white rounded-2xl border transition-all active:scale-[0.98] overflow-hidden ${
                                selectedCodes.includes(item.code_colis)
                                    ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-md'
                                    : isReceived
                                        ? 'border-emerald-200 bg-emerald-50/30 opacity-60'
                                        : isInTransit
                                            ? 'border-amber-200 bg-amber-50/30'
                                            : 'border-slate-100 shadow-sm hover:shadow-md'
                            }`}
                            onClick={() => isReadyToReceive && toggleSelect(item.code_colis)}
                        >
                            {/* Header Compact */}
                            <div className="p-3 border-b border-slate-100 flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {/* Checkbox ou Icône de statut */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        {isReceived ? (
                                            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <CheckCircleIcon className="w-4 h-4" />
                                            </div>
                                        ) : isInTransit ? (
                                            <div className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
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
                                            {isReceived ? (
                                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase border border-emerald-200">
                                                    ✓ Réceptionné
                                                </span>
                                            ) : isInTransit ? (
                                                <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[8px] font-bold uppercase border border-amber-200">
                                                    ⏱ En transit
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[8px] font-bold uppercase border border-blue-200 animate-pulse">
                                                    → À réceptionner
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                                            {item.designation || 'Sans désignation'}
                                        </p>
                                    </div>
                                </div>

                                {/* Expedition Badge */}
                                <Link 
                                    to={`/expeditions/${item.expedition?.id || item.expedition_id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-shrink-0 px-2 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-700 hover:bg-indigo-600 hover:text-white transition-all"
                                >
                                    {item.expedition?.reference}
                                </Link>
                            </div>

                            {/* Body Compact - Trajet & Poids */}
                            <div className="p-3">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 flex-1 min-w-0">
                                        <span className="truncate max-w-[100px]">{item.expedition?.pays_depart}</span>
                                        <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                        <span className="truncate max-w-[100px] text-indigo-600">{item.expedition?.pays_destination}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-semibold text-slate-400 uppercase">Poids</p>
                                        <p className="text-xs font-bold text-slate-900">{parseFloat(item.poids).toFixed(2)} kg</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    {/* Afficher le bouton de réception uniquement si le colis est arrivé au backoffice et non réceptionné */}
                                    {isReadyToReceive && canReceive && (
                                        <button
                                            onClick={() => handleReceiveSingle(item.code_colis)}
                                            disabled={processing}
                                            className="px-2.5 py-1.5 bg-indigo-600 text-white rounded text-[9px] font-bold uppercase hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-1"
                                        >
                                            <CheckCircleIcon className="w-3 h-3" />
                                            Réceptionner
                                        </button>
                                    )}
                                    {/* Message informatif pour les colis en transit */}
                                    {isInTransit && (
                                        <span className="px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold uppercase">
                                            En cours d'acheminement
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setDetailsColis(item)}
                                        className="p-1.5 rounded-lg bg-slate-900 text-white"
                                        title="Détails du colis"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center">
                            <InboxArrowDownIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600 mb-1">Aucun colis à réceptionner</p>
                        <p className="text-xs text-slate-400">Les colis en attente de réception apparaîtront ici</p>
                    </div>
                )}
            </div>

            {/* Table Section - Desktop Only */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-gradient-to-r from-slate-50 to-white">
                            <tr>
                                <th scope="col" className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectableColis.length > 0 && selectedCodes.length === selectableColis.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Colis
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Provenance
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Destination
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Poids
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">{loading && (reception || []).length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-4 py-12 text-center">
                                <ArrowPathIcon className="mx-auto h-8 w-8 text-indigo-400 animate-spin" />
                                <p className="mt-2 text-sm text-slate-500">Chargement...</p>
                            </td>
                        </tr>
                    ) : filteredColis.length > 0 ? (
                        groupedExpeditions.map((exp) => {
                            const expColis = (exp.colis || []).map(c => ({
                                ...c,
                                expedition: exp,
                                is_received: c.is_received_by_agence_destination === true,
                                is_received_by_backoffice: c.is_received_by_backoffice === true
                            })).filter(c => {
                                if (!searchQuery) return true;
                                const lowQuery = searchQuery.toLowerCase();
                                return c.code_colis?.toLowerCase().includes(lowQuery) ||
                                    c.designation?.toLowerCase().includes(lowQuery);
                            }).sort((a, b) => {
                                // Trier : en transit, puis prêts à réceptionner, puis réceptionnés
                                const getPriority = (item) => {
                                    if (item.is_received) return 2;
                                    if (!item.is_received_by_backoffice) return 0;
                                    return 1;
                                };
                                return getPriority(a) - getPriority(b);
                            });

                            if (expColis.length === 0) return null;

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
                                                    <span className="text-xs font-bold text-white">{exp.colis?.length}</span>
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
                                    {expColis.map((item, idx) => {
                                        // Déterminer l'état du colis
                                        const isInTransit = !item.is_received_by_backoffice;
                                        const isReadyToReceive = item.is_received_by_backoffice && !item.is_received;
                                        const isReceived = item.is_received;
                                        
                                        return (
                                        <tr
                                            key={item.id}
                                            id={`colis-${item.code_colis}`}
                                            onClick={() => isReadyToReceive && toggleSelect(item.code_colis)}
                                            className={`
                                                ${isReceived 
                                                    ? 'bg-emerald-50/30 opacity-60' 
                                                    : isInTransit
                                                        ? 'bg-amber-50/30'
                                                        : selectedCodes.includes(item.code_colis) 
                                                            ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-200' 
                                                            : 'bg-white hover:bg-slate-50'
                                                } 
                                                ${idx !== expColis.length - 1 ? 'border-b border-slate-100' : 'border-b-2 border-slate-200'}
                                                ${isReadyToReceive ? 'cursor-pointer' : 'cursor-default'}
                                                transition-all duration-150
                                            `}
                                        >
                                            <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                {isReceived ? (
                                                    <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                                                ) : isInTransit ? (
                                                    <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedCodes.includes(item.code_colis)}
                                                        onChange={() => toggleSelect(item.code_colis)}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg ${
                                                        isReceived ? 'bg-emerald-100' : isInTransit ? 'bg-amber-100' : 'bg-slate-100'
                                                    }`}>
                                                        <InboxArrowDownIcon className={`h-5 w-5 ${
                                                            isReceived ? 'text-emerald-600' : isInTransit ? 'text-amber-600' : 'text-slate-500'
                                                        }`} />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-bold text-slate-900">
                                                            {item.code_colis}
                                                        </div>
                                                        <div className="text-sm text-slate-500">
                                                            {item.designation || 'Sans désignation'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-700">{exp.pays_depart}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-700">{exp.pays_destination}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-slate-900">{parseFloat(item.poids).toFixed(2)} kg</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {isReceived ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        ✓ Réceptionné
                                                    </span>
                                                ) : isInTransit ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        ⏱ En transit
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                                                        → À réceptionner
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDetailsColis(item);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors whitespace-nowrap"
                                                    >
                                                        Détails
                                                    </button>
                                                    {/* Afficher le bouton uniquement si le colis est prêt à être réceptionné */}
                                                    {isReadyToReceive && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReceiveSingle(item.code_colis);
                                                            }}
                                                            disabled={processing}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                                                        >
                                                            Réceptionner
                                                        </button>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-6 py-16 text-center">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center">
                                    <InboxArrowDownIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-600 mb-1">Aucun colis</h3>
                                <p className="text-xs text-slate-400">
                                    Les colis en attente de réception apparaîtront ici.
                                </p>
                            </td>
                        </tr>
                    )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination - Responsive */}
            {receptionMeta && receptionMeta.last_page > 1 && (
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Préc.
                        </button>
                        <span className="text-xs font-semibold text-slate-600 flex items-center">
                            {receptionMeta.current_page}/{receptionMeta.last_page}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === receptionMeta.last_page}
                            className="ml-3 relative inline-flex items-center px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Suiv.
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-600">
                                Page <span className="font-bold text-slate-900">{receptionMeta.current_page}</span> sur{' '}
                                <span className="font-bold text-slate-900">{receptionMeta.last_page}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === receptionMeta.last_page}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            <ColisDetailsDrawer colis={detailsColis} onClose={() => setDetailsColis(null)} />
        </div>
    );
};

export default ColisAReceptionner;
