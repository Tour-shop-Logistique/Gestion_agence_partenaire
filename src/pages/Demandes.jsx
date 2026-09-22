import { useEffect, useState, useRef } from "react";
import { useExpedition } from "../hooks/useExpedition";
import { useAgency } from "../hooks/useAgency";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatPriceDual, getCurrencyLabel } from "../utils/format";
import { Link, useNavigate } from "react-router-dom";
import { toast, showToast } from "../utils/toast";
import soundNotification from "../utils/soundNotification";
import { Check, X, Eye, Package, Calendar, MapPin, User, ArrowRight, Loader2, RefreshCw, Search, CheckSquare, Square, CheckCircle2 } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import Spinner from '../components/common/Spinner';
import useHasPermission from "../hooks/useHasPermission";
import PageHeader from "../components/ui/PageHeader";
import { getCountryName } from "../utils/countries";

const Demandes = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const canAccept = useHasPermission("demandes.accept");
    const canRefuse = useHasPermission("demandes.refuse");
    const {
        demandes,
        demandesMeta,
        status,
        loadDemandes,
        acceptDemande,
        refuseDemande,
        message,
        error,
        resetStatus,
        expeditions,
        loadExpeditions,
        receiveColisDepart
    } = useExpedition();
    const { fetchAgencyData } = useAgency();
    const [currentPage, setCurrentPage] = useState(1);
    const [processingId, setProcessingId] = useState(null);
    const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [idToRefuse, setIdToRefuse] = useState(null);
    const [idToAccept, setIdToAccept] = useState(null);
    const [motifRefus, setMotifRefus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState('demandes'); // 'demandes' or 'en-agence'
    const [selectedColisCodes, setSelectedColisCodes] = useState([]);
    const [isReceiving, setIsReceiving] = useState(false);
    const [receivingCode, setReceivingCode] = useState(null);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [codesToReceive, setCodesToReceive] = useState([]);
    // Etat local dedie au clic "Actualiser" : `status` est partage par tous
    // les thunks du slice (websocket inclus), donc s'appuyer dessus peut
    // griser le bouton indefiniment si une requete en arriere-plan traine.
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Utiliser un ref pour éviter les appels multiples au montage
    const hasLoadedInitialDataRef = useRef(false);
    
    // ========== WEBSOCKET INTEGRATION ==========
    useWebSocket(
        currentUser?.agence_id,
        {
            onExpeditionCreated: (data, meta) => {
                if (meta.silent) {
                    // Refresh silencieux sans notification (créé par un collègue)
                    // Vérifier si c'est une demande
                    const hasNewDemande = data.some(exp => exp.statut_expedition === 'en_attente');
                    if (hasNewDemande) {
                        console.log('🔄 [Demandes] Nouvelle demande créée par un collègue (refresh silencieux)');
                        loadDemandes({ page: currentPage }, true);
                    }
                } else {
                    // Ne devrait jamais arriver ici (les créations auto sont ignorées)
                    const hasNewDemande = data.some(exp => exp.statut_expedition === 'en_attente');
                    if (hasNewDemande) {
                        console.log('🎉 [Demandes] Nouvelle(s) demande(s) créée(s):', meta.count);
                        showToast(`📋 ${meta.count} nouvelle(s) demande(s) d'expédition`, 'info');
                        soundNotification.playSuccess();
                        loadDemandes({ page: currentPage }, true);
                    }
                }
            },
            
            onExpeditionStatusChanged: (data, meta) => {
                // Recharger si le statut change vers "en_attente" (nouvelle demande)
                const hasNewDemande = data.some(exp => exp.statut_expedition === 'en_attente');
                if (hasNewDemande) {
                    console.log('📋 [Demandes] Nouvelle(s) demande(s) reçue(s)');
                    showToast(`📋 Nouvelle(s) demande(s) d'expédition`, 'info');
                    soundNotification.playSuccess();
                    loadDemandes({ page: currentPage }, true);
                } else {
                    // Refresh pour mettre à jour les demandes acceptées/refusées
                    loadDemandes({ page: currentPage }, true);
                }
            },
            
            onExpeditionPaymentConfirmed: (data, meta) => {
                console.log('💰 [Demandes] Paiement confirmé:', meta.references);
                showToast(`Paiement confirmé: ${meta.references.join(', ')}`, 'success');
                loadExpeditions({ page: 1 }, true);
            }
        },
        !!currentUser?.agence_id
    );
    
    // Charger les demandes lorsque la page change
    useEffect(() => {
        console.log('📄 Demandes page: Chargement page', currentPage);
        loadDemandes({ page: currentPage });
    }, [currentPage]); // Ne pas inclure loadDemandes dans les dépendances

    // Charger les données initiales une seule fois au montage
    useEffect(() => {
        if (hasLoadedInitialDataRef.current) {
            console.log('⏭️ Demandes page: Données initiales déjà chargées, skip');
            return;
        }
        
        console.log('🔄 Demandes page: Chargement initial');
        hasLoadedInitialDataRef.current = true;
        fetchAgencyData();
        loadExpeditions({ page: 1 });
    }, []); // Tableau vide = exécution uniquement au montage

    useEffect(() => {
        if (message) {
            toast.success(message);
            resetStatus();
        }
    }, [message, resetStatus]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            resetStatus();
        }
    }, [error, resetStatus]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (demandesMeta?.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const handleAccept = (id) => {
        setIdToAccept(id);
        setIsAcceptModalOpen(true);
    };

    const confirmAccept = async () => {
        if (!idToAccept) return;
        setProcessingId(idToAccept);
        await acceptDemande(idToAccept);
        // La demande acceptée bascule dans "En agence" (alimenté par
        // `expeditions`, pas par `demandes`) : sans ce rechargement explicite,
        // l'onglet "En agence" ne se met à jour qu'au prochain rechargement
        // manuel de la page, car le websocket seul ne suffit pas toujours.
        await loadExpeditions({ page: 1 }, true);
        setProcessingId(null);
        setIsAcceptModalOpen(false);
        setIdToAccept(null);
    };

    const handleRefuse = (id) => {
        setIdToRefuse(id);
        setIsRefuseModalOpen(true);
    };

    const confirmRefuse = async () => {
        if (!idToRefuse) return;
        setProcessingId(idToRefuse);
        await refuseDemande(idToRefuse, { motif_refus: motifRefus });
        setProcessingId(null);
        setIsRefuseModalOpen(false);
        setIdToRefuse(null);
        setMotifRefus("");
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

    const getTypeStyle = (type) => {
        switch (type) {
            case 'simple':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'groupage_dhd_aerien':
                return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'groupage_dhd_maritine':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            case 'groupage_afrique':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'groupage_ca':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'interville':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'simple': return 'Simple';
            case 'groupage_dhd_aerien': return 'DHD Aérien';
            case 'groupage_dhd_maritine': return 'DHD Maritime';
            case 'groupage_afrique': return 'Afrique';
            case 'groupage_ca': return 'CA';
            case 'interville': return 'Interville';
            default: return type || 'Inconnu';
        }
    };

    // Un colis n'a pas de champ "produit_nom" côté API : sa désignation
    // libre (`designation`) ou celle de ses articles structurés
    // (`articles[].designation`, résolue côté backend depuis produit_id)
    // sont les seules sources de texte lisible.
    const getColisProduitLabel = (colis) => {
        if (colis.designation) return colis.designation;
        if (Array.isArray(colis.articles) && colis.articles.length > 0) {
            return colis.articles.map(a => a.designation).filter(Boolean).join(', ');
        }
        return '';
    };

    // Interville : départ et arrivée sont dans le même pays, donc on affiche
    // les communes résolues côté backend (commune_depart_nom/commune_arrivee_nom)
    // plutôt que le pays répété deux fois (ex: "Espagne → Espagne").
    const getTrajet = (demande) => {
        const estInterville = demande.type_expedition === 'interville';
        if (estInterville) {
            return {
                depart: demande.commune_depart_nom || getCountryName(demande.code_pays_depart) || demande.pays_depart || '',
                arrivee: demande.commune_arrivee_nom || getCountryName(demande.code_pays_destination) || demande.pays_destination || ''
            };
        }
        return {
            depart: getCountryName(demande.code_pays_depart) || demande.pays_depart || '',
            arrivee: getCountryName(demande.code_pays_destination) || demande.pays_destination || ''
        };
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // "Demandes" et "En agence" sont alimentés par deux sources distinctes
            // (demandes vs expeditions) : actualiser doit recharger celle affichée.
            if (activeTab === 'demandes') {
                await loadDemandes({ page: currentPage }, true);
            } else {
                await loadExpeditions({ page: 1 }, true);
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    // Filtrer les demandes basé sur la recherche
    const filteredDemandes = demandes.filter(demande => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        const clientName = demande.expediteur?.nom_prenom?.toLowerCase() || '';
        const destination = (getCountryName(demande.code_pays_destination) || demande.pays_destination || '').toLowerCase();
        const origin = (getCountryName(demande.code_pays_depart) || demande.pays_depart || '').toLowerCase();
        const type = getTypeLabel(demande.type_expedition).toLowerCase();

        return clientName.includes(query) ||
               destination.includes(query) ||
               origin.includes(query) ||
               type.includes(query);
    });

    // Récupérer les colis en agence depuis les expéditions (colis acceptés non encore reçus)
    const colisEnAgence = expeditions ? expeditions.flatMap(exp =>
        (exp.colis || []).filter(colis => 
            exp.statut_expedition === 'accepted' && !colis.is_received_by_agence_depart
        ).map(colis => ({
            ...colis,
            expedition: exp,
            expedition_id: exp.id,
            expedition_status: exp.statut_expedition
        }))
    ) : [];

    // Filtrer les colis en agence selon la recherche
    const filteredColisEnAgence = colisEnAgence.filter(colis => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        const code = colis.code_colis?.toLowerCase() || '';
        const reference = colis.expedition?.reference?.toLowerCase() || '';
        const produit = getColisProduitLabel(colis).toLowerCase();
        const destination = (getCountryName(colis.expedition?.code_pays_destination) || colis.expedition?.pays_destination || '').toLowerCase();
        
        return code.includes(query) ||
               reference.includes(query) ||
               produit.includes(query) ||
               destination.includes(query);
    });

    const toggleSelectColis = (code) => {
        setSelectedColisCodes(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const toggleSelectAllColis = () => {
        if (selectedColisCodes.length === filteredColisEnAgence.length) {
            setSelectedColisCodes([]);
        } else {
            setSelectedColisCodes(filteredColisEnAgence.map(c => c.code_colis));
        }
    };

    const handleReceiveSelected = () => {
        if (selectedColisCodes.length === 0) return;
        setCodesToReceive(selectedColisCodes);
        setIsReceiveModalOpen(true);
    };

    const handleReceiveOne = (code) => {
        setCodesToReceive([code]);
        setIsReceiveModalOpen(true);
    };

    const confirmReceive = async () => {
        if (codesToReceive.length === 0) return;
        const isBulk = codesToReceive.length > 1;
        if (isBulk) setIsReceiving(true);
        else setReceivingCode(codesToReceive[0]);

        await receiveColisDepart(codesToReceive);

        setSelectedColisCodes(prev => prev.filter(c => !codesToReceive.includes(c)));
        setIsReceiving(false);
        setReceivingCode(null);
        setIsReceiveModalOpen(false);
        setCodesToReceive([]);
    };

    return (
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header Section - Responsive */}
            <PageHeader
                title="Demandes Clients"
                subtitle="Gérez les demandes d'expédition effectuées par les clients"
                actions={
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`w-3.5 sm:w-4 h-3.5 sm:h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Actualiser</span>
                    </button>
                }
            />

            {/* Barre outils : onglets compacts + recherche, alignés sur une rangée en desktop */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-2 flex flex-col sm:flex-row sm:items-center gap-2">
                {/* Tabs - taille au contenu, jamais étirés en pleine largeur */}
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
                    <button
                        onClick={() => { setActiveTab('demandes'); setSelectedColisCodes([]); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'demandes'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" />
                            <span>Demandes</span>
                            {demandesMeta?.total > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    activeTab === 'demandes'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {demandesMeta.total}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('en-agence'); setSelectedColisCodes([]); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'en-agence'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" />
                            <span>À réceptionner</span>
                            {colisEnAgence.length > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    activeTab === 'en-agence'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {colisEnAgence.length}
                                </span>
                            )}
                        </div>
                    </button>
                </div>

                {/* Recherche - largeur bornée, ne s'étire plus sur toute la ligne en desktop */}
                <div className="relative sm:max-w-xs sm:ml-auto w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={activeTab === 'demandes'
                            ? "Client, destination, origine..."
                            : "Code colis, référence..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-8 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    )}
                </div>
            </div>
            {searchQuery && (
                <div className="-mt-2 text-xs text-slate-500 px-1">
                    <span className="font-semibold text-indigo-600">
                        {activeTab === 'demandes' ? filteredDemandes.length : filteredColisEnAgence.length}
                    </span> résultat{(activeTab === 'demandes' ? filteredDemandes.length : filteredColisEnAgence.length) > 1 ? 's' : ''} trouvé{(activeTab === 'demandes' ? filteredDemandes.length : filteredColisEnAgence.length) > 1 ? 's' : ''}
                </div>
            )}

            {/* Main Content Card */}
            {activeTab === 'demandes' ? (
            <div className="relative bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                {/* Loading Overlay */}
                {isRefreshing && demandes.length > 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <Spinner size="xl" color="indigo" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-900">Actualisation en cours...</p>
                                <p className="text-xs text-slate-500 mt-1">Récupération des dernières demandes</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative overflow-x-auto">
                    {/* Mobile view: Cards - Ultra-Compact */}
                    <div className="lg:hidden p-3 sm:p-4 space-y-3">
                        {status === 'loading' && demandes.length === 0 ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white p-3 rounded-lg border border-slate-100 animate-pulse space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                        <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                </div>
                            ))
                        ) : filteredDemandes.length > 0 ? (
                            filteredDemandes.map((demande) => (
                                <div key={demande.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.99] overflow-hidden">
                                    {/* Header Compact */}
                                    <div className="p-3 border-b border-slate-100">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{demande.expediteur?.nom_prenom}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{formatDate(demande.created_at).split(' ')[0]}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${getTypeStyle(demande.type_expedition)}`}>
                                                {getTypeLabel(demande.type_expedition)}
                                            </span>
                                        </div>

                                        {(() => {
                                            const { depart, arrivee } = getTrajet(demande);
                                            return (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                    <span className="truncate">{depart}</span>
                                                    <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                    <span className="text-indigo-600 truncate">{arrivee}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Body - 2 Columns */}
                                    <div className="p-3 grid grid-cols-2 gap-3 text-center border-b border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Colis</p>
                                            <div className="flex items-center justify-center gap-1 text-sm font-bold text-slate-700">
                                                <Package className="w-3.5 h-3.5 text-slate-400" />
                                                {demande.colis?.length || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Montant</p>
                                            <p className="text-sm font-bold text-slate-900 tabular-nums">
                                                {new Intl.NumberFormat('fr-FR').format(demande.montant_expedition || 0)} {getCurrencyLabel(demande.devise_origine)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Actions - Compact */}
                                    <div className="p-2.5 flex items-center gap-1.5">
                                        <Link
                                            to={`/expeditions/${demande.id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Détails
                                        </Link>
                                        {canRefuse && (
                                        <button
                                            onClick={() => handleRefuse(demande.id)}
                                            disabled={processingId === demande.id}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        )}
                                        {canAccept && (
                                        <button
                                            onClick={() => handleAccept(demande.id)}
                                            disabled={processingId === demande.id}
                                            className="flex-[1.5] flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
                                        >
                                            {processingId === demande.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="w-3.5 h-3.5" /> Accepter
                                                </>
                                            )}
                                        </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-8 rounded-lg text-center border border-slate-100">
                                <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Package className="w-8 h-8 text-amber-300" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">
                                    {searchQuery ? 'Aucun résultat' : 'Aucune demande'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Les nouvelles demandes apparaîtront ici'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Desktop view: Table */}
                    <table className="hidden lg:table w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[20%]">Client / Date</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[12%]">Type</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[18%]">Trajet</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[16%]">Détails Colis</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[14%]">Montant</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right w-[20%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-300">
                            {status === 'loading' && demandes.length === 0 ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse border-b-2 border-slate-200">
                                        <td className="px-4 py-5"><div className="h-4 bg-slate-200 rounded w-32 mb-2"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                                        <td className="px-4 py-5"><div className="h-6 bg-slate-200 rounded-lg w-20"></div></td>
                                        <td className="px-4 py-5"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                                        <td className="px-4 py-5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                        <td className="px-4 py-5"><div className="h-5 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-4 py-5 text-right"><div className="flex justify-end gap-2"><div className="h-8 w-16 bg-slate-200 rounded-lg"></div><div className="h-8 w-20 bg-slate-200 rounded-lg"></div></div></td>
                                    </tr>
                                ))
                            ) : filteredDemandes.length > 0 ? (
                                filteredDemandes.map((demande) => (
                                    <tr key={demande.id} className="group hover:bg-indigo-50/30 transition-all duration-200 border-b-2 border-slate-200 cursor-pointer">
                                        <td 
                                            onClick={() => navigate(`/expeditions/${demande.id}`)}
                                            className="px-4 py-4"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                                                        <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                                        {demande.expediteur?.nom_prenom}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-medium text-slate-400 ml-9">
                                                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="truncate">{formatDate(demande.created_at)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td
                                            onClick={() => navigate(`/expeditions/${demande.id}`)}
                                            className="px-4 py-4"
                                        >
                                            <span className={`inline-flex self-start px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border shadow-sm ${getTypeStyle(demande.type_expedition)}`}>
                                                {getTypeLabel(demande.type_expedition)}
                                            </span>
                                        </td>
                                        <td
                                            onClick={() => navigate(`/expeditions/${demande.id}`)}
                                            className="px-4 py-4"
                                        >
                                            {(() => {
                                                const { depart, arrivee } = getTrajet(demande);
                                                return (
                                                    <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                                                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                        <span className="truncate">{depart} <ArrowRight className="inline w-3 h-3 text-slate-400 mx-0.5" /> {arrivee}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td 
                                            onClick={() => navigate(`/expeditions/${demande.id}`)}
                                            className="px-4 py-4"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                                    <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    <span>{demande.colis?.length || 0} Colis</span>
                                                </div>
                                                <div className="text-xs text-slate-400 font-medium truncate">
                                                    {demande.colis?.map(c => getColisProduitLabel(c)).filter(Boolean).join(', ')}
                                                </div>
                                            </div>
                                        </td>
                                        <td
                                            onClick={() => navigate(`/expeditions/${demande.id}`)}
                                            className="px-4 py-4"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-base font-bold text-slate-900 tabular-nums">
                                                    {new Intl.NumberFormat('fr-FR').format(demande.montant_expedition || 0)}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 uppercase">{getCurrencyLabel(demande.devise_origine)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                {canRefuse && (
                                                <button
                                                    onClick={() => handleRefuse(demande.id)}
                                                    disabled={processingId === demande.id}
                                                    className="group/btn relative px-3 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Refuser la demande"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {processingId === demande.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <X className="w-4 h-4" />
                                                        )}
                                                        <span className="text-xs font-bold">Refuser</span>
                                                    </div>
                                                </button>
                                                )}
                                                {canAccept && (
                                                <button
                                                    onClick={() => handleAccept(demande.id)}
                                                    disabled={processingId === demande.id}
                                                    className="group/btn relative px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Accepter la demande"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {processingId === demande.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Check className="w-4 h-4" />
                                                        )}
                                                        <span className="text-xs font-bold">Accepter</span>
                                                    </div>
                                                </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center max-w-md mx-auto">
                                            <div className="relative w-20 h-20 mb-4">
                                                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-lg rotate-6"></div>
                                                <div className="relative w-full h-full bg-white rounded-lg shadow-lg flex items-center justify-center border border-amber-100">
                                                    <Package className="w-8 h-8 text-amber-200" />
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                {searchQuery ? 'Aucun résultat trouvé' : 'Aucune demande en attente'}
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">
                                                {searchQuery 
                                                    ? 'Essayez avec d\'autres mots-clés de recherche'
                                                    : 'Les nouvelles demandes d\'expédition de vos clients apparaîtront ici.'
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Responsive */}
                {demandesMeta && demandesMeta.last_page > 1 && (
                    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Page <span className="text-indigo-600 font-bold">{demandesMeta.current_page}</span> sur <span className="text-slate-900 font-bold">{demandesMeta.last_page}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(demandesMeta.current_page - 1)}
                                disabled={demandesMeta.current_page === 1}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-600 disabled:text-slate-300 hover:bg-white rounded-lg sm:rounded-lg transition-all"
                            >
                                Préc.
                            </button>
                            <button
                                onClick={() => handlePageChange(demandesMeta.current_page + 1)}
                                disabled={demandesMeta.current_page === demandesMeta.last_page}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-600 disabled:text-slate-300 hover:bg-white rounded-lg sm:rounded-lg transition-all"
                            >
                                Suiv.
                            </button>
                        </div>
                    </div>
                )}
            </div>
            ) : (
            /* Section "En agence" - Liste des colis acceptés à réceptionner */
            <div className="relative bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                {/* Loading Overlay - retour visuel de l'actualisation, absent avant ce correctif */}
                {isRefreshing && colisEnAgence.length > 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Spinner size="xl" color="indigo" />
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-900">Actualisation en cours...</p>
                                <p className="text-xs text-slate-500 mt-1">Récupération des colis en agence</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Barre d'action - sélection groupée */}
                {canAccept && filteredColisEnAgence.length > 0 && (
                    <div className="px-3 sm:px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
                        <button
                            onClick={toggleSelectAllColis}
                            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                            {selectedColisCodes.length > 0 && selectedColisCodes.length === filteredColisEnAgence.length ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                                <Square className="w-4 h-4" />
                            )}
                            <span>
                                {selectedColisCodes.length > 0
                                    ? `${selectedColisCodes.length} colis sélectionné${selectedColisCodes.length > 1 ? 's' : ''}`
                                    : 'Tout sélectionner'}
                            </span>
                        </button>
                        {selectedColisCodes.length > 0 && (
                            <button
                                onClick={handleReceiveSelected}
                                disabled={isReceiving}
                                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
                            >
                                {isReceiving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                )}
                                <span>Marquer reçu{selectedColisCodes.length > 1 ? 's' : ''}</span>
                            </button>
                        )}
                    </div>
                )}
                <div className="relative overflow-x-auto">
                    {/* Mobile view: Cards */}
                    <div className="lg:hidden p-3 sm:p-4 space-y-3">
                        {filteredColisEnAgence.length > 0 ? (
                            filteredColisEnAgence.map((colis) => {
                                const { depart, arrivee } = getTrajet(colis.expedition || {});
                                const isSelected = selectedColisCodes.includes(colis.code_colis);
                                return (
                                <div
                                    key={colis.id}
                                    onClick={() => canAccept && toggleSelectColis(colis.code_colis)}
                                    className={`bg-white rounded-lg border shadow-sm transition-all overflow-hidden ${canAccept ? 'cursor-pointer' : ''} ${isSelected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}
                                >
                                    <div className="p-3 border-b border-slate-100">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {canAccept && (
                                                    isSelected ? (
                                                        <CheckSquare className="w-5 h-5 text-indigo-600 shrink-0" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-slate-300 shrink-0" />
                                                    )
                                                )}
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{colis.expedition?.expediteur?.nom_prenom || 'N/A'}</p>
                                                    <p className="text-xs text-slate-400 font-medium truncate">{colis.code_colis} · {colis.expedition?.reference}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${getTypeStyle(colis.expedition?.type_expedition)}`}>
                                                {getTypeLabel(colis.expedition?.type_expedition)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{depart}</span>
                                            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                            <span className="text-indigo-600 truncate">{arrivee}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 grid grid-cols-2 gap-3 text-center border-b border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Poids</p>
                                            <p className="text-sm font-bold text-slate-900">{colis.poids || 0} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Montant</p>
                                            <p className="text-sm font-bold text-slate-900 tabular-nums truncate">{new Intl.NumberFormat('fr-FR').format(colis.montant_colis_total || 0)}</p>
                                        </div>
                                    </div>
                                    {canAccept && (
                                        <div className="p-2.5" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleReceiveOne(colis.code_colis)}
                                                disabled={receivingCode === colis.code_colis || isReceiving}
                                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
                                            >
                                                {receivingCode === colis.code_colis ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                )}
                                                <span>Réceptionner</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                );
                            })
                        ) : (
                            <div className="bg-white p-8 rounded-lg text-center border border-slate-100">
                                <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Package className="w-8 h-8 text-blue-300" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">
                                    {searchQuery ? 'Aucun résultat' : 'Aucun colis en agence'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Les colis des expéditions acceptées apparaîtront ici'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Desktop view: Table */}
                    <table className="hidden lg:table w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {canAccept && (
                                    <th className="px-4 py-4 w-[4%]">
                                        <button onClick={toggleSelectAllColis} className="flex items-center">
                                            {selectedColisCodes.length > 0 && selectedColisCodes.length === filteredColisEnAgence.length ? (
                                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-slate-400" />
                                            )}
                                        </button>
                                    </th>
                                )}
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[16%]">Client / Réf.</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[12%]">Type</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[16%]">Trajet</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[16%]">Colis</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[10%]">Poids</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[13%]">Montant</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right w-[9%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-300">
                            {filteredColisEnAgence.length > 0 ? (
                                filteredColisEnAgence.map((colis) => {
                                    const { depart, arrivee } = getTrajet(colis.expedition || {});
                                    const isSelected = selectedColisCodes.includes(colis.code_colis);
                                    return (
                                    <tr
                                        key={colis.id}
                                        onClick={() => navigate(`/expeditions/${colis.expedition_id}`)}
                                        className={`group transition-all duration-200 border-b-2 border-slate-200 cursor-pointer ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-blue-50/30'}`}
                                    >
                                        {canAccept && (
                                            <td className="px-4 py-4" onClick={(e) => { e.stopPropagation(); toggleSelectColis(colis.code_colis); }}>
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-slate-300" />
                                                )}
                                            </td>
                                        )}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                                        <User className="w-3.5 h-3.5 text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                        {colis.expedition?.expediteur?.nom_prenom || 'N/A'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-medium text-slate-400 ml-9 truncate">{colis.expedition?.reference}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex self-start px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border shadow-sm ${getTypeStyle(colis.expedition?.type_expedition)}`}>
                                                {getTypeLabel(colis.expedition?.type_expedition)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                                                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                <span className="truncate">{depart} <ArrowRight className="inline w-3 h-3 text-slate-400 mx-0.5" /> {arrivee}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-900 truncate">{colis.code_colis}</span>
                                                    <span className="text-xs text-slate-400 truncate">{getColisProduitLabel(colis)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-bold text-slate-900">{colis.poids || 0} kg</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                    {new Intl.NumberFormat('fr-FR').format(colis.montant_colis_total || 0)}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 uppercase">{getCurrencyLabel(colis.expedition?.devise_origine)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            {canAccept && (
                                                <button
                                                    onClick={() => handleReceiveOne(colis.code_colis)}
                                                    disabled={receivingCode === colis.code_colis || isReceiving}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
                                                    title="Marquer ce colis comme réceptionné"
                                                >
                                                    {receivingCode === colis.code_colis ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    )}
                                                    <span>Réceptionner</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={canAccept ? 8 : 7} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center max-w-md mx-auto">
                                            <div className="relative w-20 h-20 mb-4">
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-lg rotate-6"></div>
                                                <div className="relative w-full h-full bg-white rounded-lg shadow-lg flex items-center justify-center border border-blue-100">
                                                    <Package className="w-8 h-8 text-blue-200" />
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                {searchQuery ? 'Aucun résultat trouvé' : 'Aucun colis en agence'}
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">
                                                {searchQuery
                                                    ? 'Essayez avec d\'autres mots-clés de recherche'
                                                    : 'Les colis des expéditions acceptées à réceptionner apparaîtront ici.'
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            <ConfirmationModal
                isOpen={isRefuseModalOpen}
                onClose={() => {
                    setIsRefuseModalOpen(false);
                    setIdToRefuse(null);
                    setMotifRefus("");
                }}
                onConfirm={confirmRefuse}
                title="Refuser la demande"
                message="Êtes-vous sûr de vouloir refuser cette demande d'expédition ? Veuillez indiquer le motif du refus ci-dessous."
                confirmText="Refuser la demande"
                type="danger"
                isLoading={processingId === idToRefuse}
            >
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Motif du refus
                    </label>
                    <textarea
                        value={motifRefus}
                        onChange={(e) => setMotifRefus(e.target.value)}
                        placeholder="Ex: Articles non autorisés, poids incorrect, etc..."
                        className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none"
                    />
                </div>
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={isAcceptModalOpen}
                onClose={() => {
                    setIsAcceptModalOpen(false);
                    setIdToAccept(null);
                }}
                onConfirm={confirmAccept}
                title="Accepter la demande"
                message="Voulez-vous accepter cette demande d'expédition ? Elle sera ajoutée à votre liste d'expéditions actives."
                confirmText="Accepter la demande"
                type="success"
                isLoading={processingId === idToAccept}
            />

            <ConfirmationModal
                isOpen={isReceiveModalOpen}
                onClose={() => {
                    setIsReceiveModalOpen(false);
                    setCodesToReceive([]);
                }}
                onConfirm={confirmReceive}
                title={codesToReceive.length > 1 ? 'Réceptionner les colis' : 'Réceptionner le colis'}
                message={codesToReceive.length > 1
                    ? `Confirmez-vous la réception de ces ${codesToReceive.length} colis à l'agence ? L'expédition passera au statut "Reçu" lorsque tous ses colis seront réceptionnés.`
                    : "Confirmez-vous la réception de ce colis à l'agence ? L'expédition passera au statut \"Reçu\" lorsque tous ses colis seront réceptionnés."}
                confirmText={codesToReceive.length > 1 ? 'Réceptionner les colis' : 'Réceptionner le colis'}
                type="success"
                isLoading={isReceiving || receivingCode !== null}
            />
        </div>
    );
};

export default Demandes;
