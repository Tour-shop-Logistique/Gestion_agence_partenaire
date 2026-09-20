import React, { useEffect, useState, useMemo, useRef } from "react";
import { useExpedition } from "../hooks/useExpedition";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { Link } from "react-router-dom";
import { formatPriceDual } from "../utils/format";
import { toast, showToast } from "../utils/toast";
import soundNotification from "../utils/soundNotification";
import {
    CubeIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    IdentificationIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    QrCodeIcon
} from "@heroicons/react/24/outline";
import { MapPinned, Loader2 } from "lucide-react";
import QRScanner from "../components/QRScanner";
import ColisDetailsDrawer from "../components/common/ColisDetailsDrawer";
import PageHeader from "../components/ui/PageHeader";
import SearchableDropdown from "../components/common/SearchableDropdown";
import { getCountryName } from "../utils/countries";
import { expeditionsApi } from "../utils/api/expeditions";
import { agencesApi } from "../utils/api/agences";

const Colis = () => {
    const { currentUser } = useAuth();
    const {
        expeditions, meta, loadExpeditions, status, lastFilters,
        receiveColisDepart, sendColisToEntrepot, resetStatus, message, error
    } = useExpedition();
    const loadingColis = status === 'loading';
    const [currentPage, setCurrentPage] = useState(lastFilters?.page || 1);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    // Interville ne passe jamais par l'entrepôt (pas de backoffice dans son
    // cycle, cahier des charges §8.1) : son envoi se fait par expédition
    // (choix de l'agence d'arrivée + confirmation de départ), pas par
    // sélection multiple de colis comme Extraville - onglet séparé.
    const [activeTab, setActiveTab] = useState('extraville');
    const [detailsColis, setDetailsColis] = useState(null);
    
    // Suivre les colis déjà scannés pour éviter les messages en double
    const scannedCodesRef = useRef(new Set());

    // ========== WEBSOCKET INTEGRATION ==========
    useWebSocket(
        currentUser?.agence_id,
        {
            onColisControlled: (data, meta) => {
                console.log('✅ [Colis] Colis contrôlé(s):', meta.count);
                showToast(`${meta.count} colis contrôlé(s)`, 'success');
                fetchColisData(true);
            },
            
            onColisBlocked: (data, meta) => {
                console.log('🚫 [Colis] Colis bloqué(s):', meta.references);
                showToast(`⚠️ Colis bloqué(s): ${meta.references.join(', ')}`, 'warning');
                soundNotification.playAlert(); // Son d'alerte
                fetchColisData(true);
            },
            
            onColisUnblocked: (data, meta) => {
                console.log('✅ [Colis] Colis débloqué(s):', meta.references);
                showToast(`Colis débloqué(s): ${meta.references.join(', ')}`, 'success');
                fetchColisData(true);
            },
            
            onColisAssigned: (data, meta) => {
                console.log('📍 [Colis] Nouveau(x) colis assigné(s):', meta.count);
                showToast(`🎉 ${meta.count} nouveau(x) colis pour votre agence`, 'success');
                soundNotification.playSuccess(); // Son de succès
                fetchColisData(true);
            },
            
            onColisReceivedByBackoffice: (data, meta) => {
                console.log('📥 [Colis] Colis reçu(s) par le backoffice:', meta.references);
                showToast(`Backoffice a reçu: ${meta.references.join(', ')}`, 'info');
                fetchColisData(true);
            }
        },
        !!currentUser?.agence_id
    );

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]); // ✅ Retrait de loadExpeditions des dépendances

    useEffect(() => {
        if (message || error) {
            if (message) {
                // On ne rafraîchit plus systématiquement si le state Redux est déjà à jour
                // fetchColisData(true); 
                setSelectedCodes([]);
                // Réinitialiser le set des colis scannés après succès
                scannedCodesRef.current.clear();
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
    // qui ne sont PAS encore expédiés vers l'entrepôt. Extraville uniquement -
    // Interville n'a pas d'entrepôt dans son cycle (voir tabExpeditionsInterville).
    const tabColis = useMemo(() => {
        const filtered = allColis.filter(c =>
            c.expedition?.type_expedition !== 'interville' &&
            c.expedition_status === 'recu_agence_depart' && !c.is_sent
        );
        console.log("🚚 Colis reçus à envoyer:", {
            total: filtered.length,
            expeditions: [...new Set(filtered.map(c => c.expedition?.reference))],
        });
        return filtered;
    }, [allColis]);

    // Expéditions Interville à traiter : acceptées ou déjà reçues en agence,
    // pas encore parties - l'action se fait par expédition (agence d'arrivée
    // + confirmation de départ), pas par colis coché individuellement.
    const tabExpeditionsInterville = useMemo(() => {
        const map = new Map();
        allColis.forEach(c => {
            const exp = c.expedition;
            if (!exp || exp.type_expedition !== 'interville') return;
            if (!['accepted', 'recu_agence_depart'].includes(exp.statut_expedition)) return;
            if (!map.has(exp.id)) map.set(exp.id, { ...exp, colis: [] });
            map.get(exp.id).colis.push(c);
        });
        return Array.from(map.values());
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
            item.articles?.some(a => {
                const designation = a.designation || a;
                return String(designation).toLowerCase().includes(lowerQuery);
            })
        );
    }, [tabColis, searchQuery]);

    // Même filtre texte que l'onglet Extraville, appliqué ici par expédition
    // (référence, agence d'arrivée, trajet) et par colis contenu.
    const filteredExpeditionsInterville = useMemo(() => {
        if (!searchQuery) return tabExpeditionsInterville;
        const lowerQuery = searchQuery.toLowerCase();
        return tabExpeditionsInterville.filter(exp =>
            exp.reference?.toLowerCase().includes(lowerQuery) ||
            exp.agence_arrivee?.nom_agence?.toLowerCase().includes(lowerQuery) ||
            exp.commune_depart_nom?.toLowerCase().includes(lowerQuery) ||
            exp.commune_arrivee_nom?.toLowerCase().includes(lowerQuery) ||
            exp.colis.some(c =>
                c.code_colis?.toLowerCase().includes(lowerQuery) ||
                c.designation?.toLowerCase().includes(lowerQuery)
            )
        );
    }, [tabExpeditionsInterville, searchQuery]);

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
        // Jouer un son de succès après l'envoi
        if (!error) {
            soundNotification.playScanSound();
        }
        // Réinitialiser le set des colis scannés après envoi
        scannedCodesRef.current.clear();
        setProcessing(false);
    };

    // ========== INTERVILLE : agence d'arrivée + confirmation de départ ==========
    // État par expédition (pas un seul état global) : plusieurs expéditions
    // Interville peuvent être listées et traitées en même temps ici.
    const [agencesArriveeParExpedition, setAgencesArriveeParExpedition] = useState({});
    const [loadingAgencesExpeditionIds, setLoadingAgencesExpeditionIds] = useState(new Set());
    const [savingAgenceExpeditionId, setSavingAgenceExpeditionId] = useState(null);
    const [confirmingDepartExpeditionId, setConfirmingDepartExpeditionId] = useState(null);

    // Charge la liste d'agences d'arrivée disponibles pour chaque expédition
    // Interville affichée, une seule fois par expédition (pas à chaque render).
    useEffect(() => {
        tabExpeditionsInterville.forEach((exp) => {
            const communeArriveeId = exp?.destinataire?.commune_id;
            if (!communeArriveeId) return;
            if (agencesArriveeParExpedition[exp.id] || loadingAgencesExpeditionIds.has(exp.id)) return;

            setLoadingAgencesExpeditionIds(prev => new Set(prev).add(exp.id));
            agencesApi.getAgencesByCommune(communeArriveeId).then((result) => {
                if (result.success) {
                    setAgencesArriveeParExpedition(prev => ({ ...prev, [exp.id]: result.data }));
                } else {
                    toast.error(result.message);
                }
                setLoadingAgencesExpeditionIds(prev => {
                    const next = new Set(prev);
                    next.delete(exp.id);
                    return next;
                });
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabExpeditionsInterville]);

    const handleSaveAgenceArrivee = async (expeditionId, agenceId) => {
        setSavingAgenceExpeditionId(expeditionId);
        const result = await expeditionsApi.choisirAgenceArrivee(expeditionId, agenceId);
        if (result.success) {
            toast.success(result.message);
            fetchColisData(true);
        } else {
            toast.error(result.message);
        }
        setSavingAgenceExpeditionId(null);
    };

    const handleConfirmerDepartInterville = async (expeditionId) => {
        setConfirmingDepartExpeditionId(expeditionId);
        const result = await expeditionsApi.confirmerDepart(expeditionId);
        if (result.success) {
            toast.success(result.message);
            fetchColisData(true);
        } else {
            toast.error(result.message);
        }
        setConfirmingDepartExpeditionId(null);
    };

    const handleQRScan = (scannedData) => {
        // Interville : pas de sélection multiple ni de confirmation
        // automatique au scan (envoyer une expédition sans agence d'arrivée
        // choisie n'est de toute façon pas possible, mais on reste prudent) -
        // le scan localise seulement l'expédition, l'agent confirme
        // explicitement via le bouton dédié.
        if (activeTab === 'interville') {
            const exp = tabExpeditionsInterville.find(e =>
                (e.colis || []).some(c => c.code_colis === scannedData || scannedData.includes(c.code_colis))
                || e.id === scannedData
            );
            if (!exp) {
                soundNotification.playErrorSound();
                toast.error(`Aucune expédition Interville à traiter ne correspond au code scanné : ${scannedData}`);
                return;
            }
            soundNotification.playScanSound();
            toast.success(`Expédition ${exp.reference} trouvée. Confirmez le départ ci-dessous.`);
            setTimeout(() => {
                const element = document.getElementById(`expedition-interville-${exp.id}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            return;
        }

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
        
        if (foundColis) {
            const wasAlreadyScanned = scannedCodesRef.current.has(foundColis.code_colis);
            
            // Vérifier si le colis a déjà été expédié
            if (foundColis.is_sent) {
                // N'afficher le message qu'une seule fois
                if (!wasAlreadyScanned) {
                    soundNotification.playWarningSound();
                    toast.info(`Le colis ${foundColis.code_colis} a déjà été expédié vers l'entrepôt.`);
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
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header Section - Responsive */}
            <PageHeader
                title="Gestion des Colis - À envoyer"
                subtitle={activeTab === 'interville'
                    ? "Choisissez l'agence d'arrivée et confirmez le départ"
                    : "Envoyez les colis reçus vers l'entrepôt"}
                actions={
                    <>
                        <button
                            onClick={() => setScannerOpen(true)}
                            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                        >
                            <QrCodeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Scanner</span>
                        </button>
                        <button
                            onClick={() => fetchColisData(true)}
                            disabled={loadingColis}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-400 shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loadingColis ? 'animate-spin text-indigo-600' : 'text-slate-600'}`} />
                            <span className="uppercase tracking-wide">Actualiser</span>
                        </button>
                    </>
                }
            />

            {/* Onglets Extraville / Interville : deux mecaniques d'envoi
                differentes (entrepot + backoffice vs agence d'arrivee
                choisie directement), pas de selection multiple commune. */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                <button
                    onClick={() => setActiveTab('extraville')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                        activeTab === 'extraville' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Extraville
                    {tabColis.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                            {tabColis.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('interville')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                        activeTab === 'interville' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Interville
                    {tabExpeditionsInterville.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                            {tabExpeditionsInterville.length}
                        </span>
                    )}
                </button>
            </div>

            {/* QR Scanner Modal */}
            <QRScanner
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleQRScan}
            />

            {/* Search Bar - Responsive (les deux onglets, filtre par colis
                pour Extraville, par expédition pour Interville) */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-9 sm:pl-11 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {activeTab === 'extraville' && (
            <>
            {/* Selection Bar - Responsive */}
            {selectedCodes.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-2 sm:py-3 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm animate-fade-in-down">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-bold text-slate-700">
                            {selectedCodes.length} sélectionné{selectedCodes.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkAction}
                            disabled={processing}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                        >
                            {processing ? (
                                <>
                                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
                                    <span className="hidden sm:inline">Traitement...</span>
                                </>
                            ) : (
                                <>
                                    <IdentificationIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                                    Envoyer à l'entrepôt
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
                {loadingColis && allColis.length === 0 ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm animate-pulse space-y-2">
                            <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                            <div className="h-3 bg-slate-100 rounded w-full"></div>
                            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                        </div>
                    ))
                ) : groupedExpeditions.length > 0 ? (
                    groupedExpeditions.map((exp) => (
                        <div key={exp.id} className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                            {/* Bandeau expédition : même regroupement visuel que la vue
                                desktop, pour ne pas donner l'impression de deux listes
                                séparées (colis vs expéditions) */}
                            <Link
                                to={`/expeditions/${exp.id}`}
                                className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <span className="text-xs font-bold text-white truncate">{exp.reference}</span>
                                    <span className="text-[10px] font-medium text-white/70 truncate">
                                        {getCountryName(exp.code_pays_depart) || exp.pays_depart}
                                        {' → '}
                                        {getCountryName(exp.code_pays_destination) || exp.pays_destination}
                                    </span>
                                </div>
                                <span className="flex-shrink-0 px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold text-white">
                                    {exp.colis.length} colis
                                </span>
                            </Link>

                            <div className="divide-y divide-slate-100">
                                {exp.colis.map((item) => (
                                    <div
                                        key={item.id}
                                        id={`colis-${item.code_colis}`}
                                        className={`transition-all active:scale-[0.99] ${
                                            selectedCodes.includes(item.code_colis)
                                                ? 'bg-indigo-50/60'
                                                : item.is_sent
                                                    ? 'bg-emerald-50/30 opacity-60'
                                                    : ''
                                        }`}
                                        onClick={() => !item.is_sent && toggleSelect(item.code_colis)}
                                    >
                                        {/* Header Compact */}
                                        <div className="p-3 pb-2 flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                {/* Checkbox ou Icône de statut */}
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    {item.is_sent ? (
                                                        <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
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
                                                        {item.is_sent ? (
                                                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase border border-emerald-200">
                                                                ✓ Envoyé
                                                            </span>
                                                        ) : (
                                                            <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[8px] font-bold uppercase border border-blue-200">
                                                                → À envoyer
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                                                        {item.designation}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Poids */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-[9px] font-semibold text-slate-400 uppercase">Poids</p>
                                                <p className="text-xs font-bold text-slate-900">{parseFloat(item.poids)} kg</p>
                                            </div>
                                        </div>

                                        {/* Catégorie & Articles */}
                                        {item.category?.nom && (
                                            <div className="px-3 pb-2 flex flex-col gap-1">
                                                <span className="inline-flex px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-bold border border-indigo-100 uppercase w-fit">
                                                    {item.category.nom}
                                                </span>
                                                {item.articles?.length > 0 && (
                                                    <p className="text-[10px] text-slate-500 italic line-clamp-1">
                                                        {item.articles?.map(a => a.designation || a).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Footer Actions : le bouton Détails reste toujours visible,
                                            même une fois le colis envoyé - seul "Envoyer" disparaît. */}
                                        <div className="px-3 pb-3 pt-1 flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDetailsColis(item);
                                                }}
                                                className="px-2.5 py-1.5 bg-slate-900 text-white rounded text-[9px] font-bold uppercase hover:bg-slate-800 transition-all flex items-center gap-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                Détails
                                            </button>
                                            {!item.is_sent && (
                                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={handleBulkAction}
                                                        disabled={processing || !selectedCodes.includes(item.code_colis)}
                                                        className="px-2.5 py-1.5 bg-indigo-600 text-white rounded text-[9px] font-bold uppercase hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        <IdentificationIcon className="w-3 h-3" />
                                                        Envoyer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg border border-slate-100 shadow-sm px-6 py-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center">
                            <CubeIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600 mb-1">Aucun colis à envoyer</p>
                        <p className="text-xs text-slate-400">Les colis prêts à être envoyés vers l'entrepôt apparaîtront ici</p>
                    </div>
                )}
            </div>

            {/* Data Section */}
            <div className="relative">
                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                    <th className="px-4 py-3 w-12">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                            checked={selectableColis.length > 0 && selectedCodes.length === selectableColis.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Colis</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie & Détails</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Expédition</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Poids & Dimensions</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Montant</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {loadingColis && allColis.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center">
                                            <ArrowPathIcon className="mx-auto h-8 w-8 text-indigo-400 animate-spin" />
                                            <p className="mt-2 text-sm text-slate-500">Chargement...</p>
                                        </td>
                                    </tr>
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
                                                                    <span className="text-xs font-medium text-white/90">{getCountryName(exp.code_pays_depart) || exp.pays_depart}</span>
                                                                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                    </svg>
                                                                    <span className="text-xs font-medium text-white">{getCountryName(exp.code_pays_destination) || exp.pays_destination}</span>
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
                                                                ? 'bg-emerald-50/30 opacity-60' 
                                                                : selectedCodes.includes(item.code_colis) 
                                                                    ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-200' 
                                                                    : 'bg-white hover:bg-slate-50'
                                                            } 
                                                            ${idx !== expColis.length - 1 ? 'border-b border-slate-100' : 'border-b-2 border-slate-200'}
                                                            ${!item.is_sent ? 'cursor-pointer' : 'cursor-default'}
                                                            transition-all duration-150
                                                        `}
                                                        onClick={() => !item.is_sent && toggleSelect(item.code_colis)}
                                                    >
                                                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                            {item.is_sent ? (
                                                                <IdentificationIcon className="h-5 w-5 text-emerald-500" />
                                                            ) : (
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                                    checked={selectedCodes.includes(item.code_colis)}
                                                                    onChange={() => toggleSelect(item.code_colis)}
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center">
                                                                <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg ${
                                                                    item.is_sent ? 'bg-emerald-100' : 'bg-slate-100'
                                                                }`}>
                                                                    <CubeIcon className={`h-5 w-5 ${
                                                                        item.is_sent ? 'text-emerald-600' : 'text-slate-500'
                                                                    }`} />
                                                                </div>
                                                                <div className="ml-3">
                                                                    <div className="text-sm font-bold text-indigo-600">{item.code_colis}</div>
                                                                    <div className="text-sm text-slate-500">{item.designation}</div>
                                                                    <div className="text-xs text-slate-400 mt-0.5">Le {formatDate(item.created_at)}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col gap-1.5">
                                                                <span className="inline-flex px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase w-fit">
                                                                    {item.category?.nom}
                                                                </span>
                                                                <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                                                                    {item.articles?.map(a => a.designation || a).join(', ')}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Link to={`/expeditions/${item.expedition_id}`} className="group/exp">
                                                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg group-hover/exp:bg-indigo-600 group-hover/exp:text-white transition-all">
                                                                    {item.expedition?.reference}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 mt-1">
                                                                    <span>{getCountryName(item.expedition?.code_pays_depart) || item.expedition?.pays_depart}</span>
                                                                    <ArrowPathIcon className="w-2.5 h-2.5" />
                                                                    <span className="text-indigo-600">{getCountryName(item.expedition?.code_pays_destination) || item.expedition?.pays_destination}</span>
                                                                </div>
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-sm font-bold text-slate-900">{parseFloat(item.poids)} kg</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                    {parseFloat(item.longueur)}×{parseFloat(item.largeur)}×{parseFloat(item.hauteur)} cm
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className="text-sm font-bold text-slate-900">
                                                                {formatPriceDual(item.montant_colis_total)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailsColis(item)}
                                                                className="inline-flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                                                                title="Voir les détails"
                                                            >
                                                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                                Détails
                                                            </button>
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
                        <div className="bg-slate-900 text-white rounded-lg sm:rounded-lg px-3 sm:px-6 py-3 sm:py-4 shadow-2xl shadow-indigo-500/20 border border-slate-800 flex items-center justify-between gap-2 sm:gap-4">
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
                                className="px-3 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg sm:rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 sm:gap-2 group"
                            >
                                {processing ? (
                                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-500" />
                                )}
                                <span className="hidden sm:inline">
                                    "Envoyer à l'entrepôt"
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
                    <div className="mt-4 sm:mt-6 px-3 sm:px-8 py-4 sm:py-6 bg-white rounded-lg sm:rounded-lg border border-slate-200/60 shadow-lg shadow-slate-200/40 flex flex-col items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Page</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 text-xs font-bold">{meta.current_page} / {meta.last_page}</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => handlePageChange(meta.current_page - 1)}
                                disabled={meta.current_page === 1}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-lg text-[10px] font-bold uppercase border border-slate-200 bg-white text-slate-600 disabled:opacity-50 transition-all"
                            >
                                <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Précédent</span>
                                <span className="sm:hidden">Préc.</span>
                            </button>

                            <button
                                onClick={() => handlePageChange(meta.current_page + 1)}
                                disabled={meta.current_page === meta.last_page}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-lg text-[10px] font-bold uppercase bg-slate-900 text-white shadow-lg shadow-slate-200 disabled:opacity-50 transition-all"
                            >
                                <span className="hidden sm:inline">Suivant</span>
                                <span className="sm:hidden">Suiv.</span>
                                <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            </>
            )}

            {/* Onglet Interville : liste par expédition */}
            {activeTab === 'interville' && (
                <div className="space-y-3 pb-6">
                    {loadingColis && tabExpeditionsInterville.length === 0 ? (
                        Array(2).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm animate-pulse space-y-2">
                                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                                <div className="h-3 bg-slate-100 rounded w-full"></div>
                            </div>
                        ))
                    ) : filteredExpeditionsInterville.length === 0 ? (
                        <div className="bg-white rounded-lg border border-slate-100 shadow-sm px-6 py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center">
                                <CubeIcon className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600 mb-1">
                                {searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucune expédition Interville à traiter'}
                            </p>
                            <p className="text-xs text-slate-400">
                                {searchQuery ? 'Essayez un autre terme de recherche' : 'Les expéditions acceptées ou reçues en agence apparaîtront ici'}
                            </p>
                        </div>
                    ) : (
                        filteredExpeditionsInterville.map((exp) => {
                            const agencesArrivee = agencesArriveeParExpedition[exp.id] || [];
                            const isLoadingAgences = loadingAgencesExpeditionIds.has(exp.id);
                            const isSavingAgence = savingAgenceExpeditionId === exp.id;
                            const isConfirmingDepart = confirmingDepartExpeditionId === exp.id;
                            return (
                                <div key={exp.id} id={`expedition-interville-${exp.id}`} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600">
                                        <Link to={`/expeditions/${exp.id}`} className="flex items-center gap-2 min-w-0">
                                            <span className="text-xs font-bold text-white truncate">{exp.reference}</span>
                                            <span className="text-[10px] font-medium text-white/70">
                                                {exp.commune_depart_nom || getCountryName(exp.code_pays_depart) || exp.pays_depart}
                                                {' → '}
                                                {exp.commune_arrivee_nom || getCountryName(exp.code_pays_destination) || exp.pays_destination}
                                            </span>
                                        </Link>
                                        <span className="flex-shrink-0 px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold text-white">
                                            {exp.colis.length} colis
                                        </span>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPinned className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-bold text-slate-800">Agence d'arrivée</span>
                                            {!exp.agence_arrivee && (
                                                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase rounded">
                                                    À renseigner
                                                </span>
                                            )}
                                        </div>

                                        {isLoadingAgences ? (
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Chargement des agences...
                                            </div>
                                        ) : agencesArrivee.length === 0 ? (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                                                Aucune agence active n'est disponible dans la commune de destination.
                                            </div>
                                        ) : (
                                            <SearchableDropdown
                                                options={agencesArrivee.map((a) => ({ id: a.id, label: `${a.nom_agence} (${a.commune?.nom || a.pays})` }))}
                                                onSelect={(option) => handleSaveAgenceArrivee(exp.id, option.id)}
                                                placeholder={
                                                    exp.agence_arrivee
                                                        ? `${exp.agence_arrivee.nom_agence} (${exp.agence_arrivee.commune?.nom || ''})`
                                                        : "Sélectionner une agence..."
                                                }
                                                disabled={isSavingAgence}
                                            />
                                        )}

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleConfirmerDepartInterville(exp.id)}
                                                disabled={!exp.agence_arrivee || isConfirmingDepart}
                                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {isConfirmingDepart ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" /> Confirmation...
                                                    </>
                                                ) : "Confirmer le départ"}
                                            </button>
                                            <Link
                                                to={`/expeditions/${exp.id}`}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase hover:bg-slate-800 transition-all"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                Détails
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ColisDetailsDrawer */}
            <ColisDetailsDrawer colis={detailsColis} onClose={() => setDetailsColis(null)} />
        </div>
    );
};

export default Colis;
