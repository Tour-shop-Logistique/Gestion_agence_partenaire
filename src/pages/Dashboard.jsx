import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    PlusIcon,
    ArrowPathIcon,
    BellAlertIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

import { useAuth } from "../hooks/useAuth";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import { useDashboard } from "../hooks/useDashboard";
import { useWebSocket } from "../hooks/useWebSocket";
import { showToast } from "../utils/toast";

// Composants modulaires
import PriorityActions from "../components/dashboard/PriorityActions";
import KPISection from "../components/dashboard/KPISection";
import RecentExpeditions from "../components/dashboard/RecentExpeditions";
import StatsCards from "../components/dashboard/StatsCards";
import LoadingSpinner from "../components/common/LoadingSpinner";

/**
 * Dashboard Refactorisé - Version Professionnelle
 * 
 * Architecture modulaire orientée action et métier logistique
 * 
 * Structure :
 * 1. 🔥 Actions prioritaires (URGENT - compactes)
 * 2. 💰 KPI Financiers + 🚚 KPI Opérationnels
 * 3. 📦 Dernières expéditions (10 visibles, pleine largeur)
 * 4. 📊 Statistiques (Top destinations, Volume, Indicateurs)
 */
const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { data: agencyData, fetchAgencyData } = useAgency();
    const { demandes = [], demandesMeta, loadDemandes } = useExpedition();
    const { operational, financial, logistics, loading: dashboardLoading, status, isRefreshing, lastUpdated, fetchDashboard } = useDashboard();
    const [showDemandesAlert, setShowDemandesAlert] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const hasFetchedRef = useRef(false);

    // ========== WEBSOCKET INTEGRATION ==========
    useWebSocket(
        currentUser?.agence_id,
        {
            // Nouvelle expédition créée
            onExpeditionCreated: (data, meta) => {
                if (meta.silent) {
                    // Refresh silencieux sans notification (créé par un collègue)
                    console.log('🔄 [Dashboard] Expédition créée par un collègue (refresh silencieux)');
                    fetchDashboard(true, true); // Refresh silencieux
                } else {
                    // Ne devrait jamais arriver ici (les créations auto sont ignorées)
                    console.log('🎉 [Dashboard] Nouvelle(s) expédition(s) créée(s):', meta.count);
                    showToast(`${meta.count} nouvelle(s) expédition(s) créée(s)`, 'success');
                    fetchDashboard(true, true);
                }
            },
            
            // Mise à jour en temps réel du dashboard
            onExpeditionStatusChanged: (data, meta) => {
                console.log('📦 [Dashboard] Expédition(s) mise(s) à jour:', meta.count);
                showToast(`${meta.count} expédition(s) mise(s) à jour`, 'info');
                fetchDashboard(true, true); // Refresh silencieux
            },
            
            onExpeditionPaymentConfirmed: (data, meta) => {
                console.log('💰 [Dashboard] Paiement(s) confirmé(s):', meta.count);
                showToast(`Paiement confirmé pour ${meta.references.join(', ')}`, 'success');
                fetchDashboard(true, true);
            },
            
            onExpeditionFraisUpdated: (data, meta) => {
                console.log('💵 [Dashboard] Frais annexes mis à jour:', meta.count);
                showToast(`Frais annexes mis à jour pour ${meta.references.join(', ')}`, 'info');
                fetchDashboard(true, true);
            },
            
            onColisControlled: (data, meta) => {
                console.log('✅ [Dashboard] Colis contrôlé(s):', meta.count);
                if (meta.count > 1) {
                    showToast(`${meta.count} colis contrôlés`, 'success');
                } else {
                    showToast(`Colis ${meta.references[0]} contrôlé`, 'success');
                }
                fetchDashboard(true, true);
            },
            
            onColisBlocked: (data, meta) => {
                console.log('🚫 [Dashboard] Colis bloqué(s):', meta.count);
                showToast(`⚠️ ${meta.count} colis bloqué(s)`, 'warning');
                fetchDashboard(true, true);
            },
            
            onColisUnblocked: (data, meta) => {
                console.log('✅ [Dashboard] Colis débloqué(s):', meta.count);
                showToast(`${meta.count} colis débloqué(s)`, 'success');
                fetchDashboard(true, true);
            },
            
            onColisAssigned: (data, meta) => {
                console.log('📍 [Dashboard] Colis assigné(s):', meta.count);
                showToast(`${meta.count} nouveau(x) colis assigné(s) à votre agence`, 'info');
                fetchDashboard(true, true);
            },
            
            onColisReceivedByBackoffice: (data, meta) => {
                console.log('📥 [Dashboard] Colis reçu(s) par le backoffice:', meta.count);
                showToast(`${meta.count} colis reçu(s) par le backoffice`, 'info');
                fetchDashboard(true, true);
            },
            
            onAgenceStatusChanged: (data, meta) => {
                console.log('⚠️ [Dashboard] Statut agence changé:', data);
                const agence = data[0];
                if (!agence.actif) {
                    showToast('⛔ Votre agence a été désactivée', 'error');
                    // Déconnexion forcée après 3 secondes
                    setTimeout(() => {
                        localStorage.clear();
                        navigate('/login');
                    }, 3000);
                } else {
                    showToast('✅ Votre agence a été réactivée', 'success');
                    fetchDashboard(true, true);
                }
            },
            
            onTarifsUpdated: (data, meta) => {
                console.log('💲 [Dashboard] Tarifs mis à jour:', meta.model);
                showToast('Les tarifs ont été mis à jour', 'info');
                // On pourrait recharger les tarifs ici si nécessaire
            }
        },
        // Activer WebSocket uniquement si l'utilisateur est connecté et a une agence
        !!currentUser?.agence_id
    );

    useEffect(() => {
        // Charger les données au montage initial
        const loadData = async () => {
            // Éviter les appels multiples pour le chargement initial
            if (hasFetchedRef.current) {
                console.log('⏭️ Dashboard: Données déjà chargées, skip');
                return;
            }
            
            console.log('🔄 Dashboard: Début du chargement initial');
            hasFetchedRef.current = true;

            // ✅ Si on a déjà des données en cache (préchargées par App.jsx)
            if (status === 'succeeded' && lastUpdated) {
                const lastUpdate = new Date(lastUpdated);
                const now = new Date();
                const diffSeconds = (now - lastUpdate) / 1000;
                
                console.log(`⏰ Dashboard: Données en cache (${diffSeconds.toFixed(0)}s)`);
                
                // Pas de loader, on affiche directement les données
                setIsInitialLoad(false);
                
                // Si les données ont plus de 30 secondes, on fait un refresh silencieux
                if (diffSeconds > 30) {
                    console.log('🔄 Dashboard: Refresh silencieux (> 30s)');
                    fetchDashboard(true, true); // Rechargement silencieux en arrière-plan
                    loadDemandes({ page: 1 }, true);
                }
                return;
            }

            // ✅ Chargement initial sans loader si possible
            console.log('📊 Dashboard: Chargement initial des données');
            setIsInitialLoad(false);
            
            // Charger les données en arrière-plan
            fetchDashboard(false, true); // Silencieux pour éviter le loader
            loadDemandes({ page: 1 }, true);
            
            // Charger l'agence si nécessaire
            if (!agencyData) {
                fetchAgencyData();
            }
        };

        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Détecter si on revient avec un état de rechargement silencieux
    useEffect(() => {
        if (location.state?.silentRefresh && status === 'succeeded') {
            console.log('🔄 Dashboard: Silent refresh demandé via navigation state');
            // Recharger silencieusement les données
            fetchDashboard(true, true);
            loadDemandes({ page: 1 }, true);
            
            // Nettoyer le state pour éviter les rechargements répétés
            navigate(location.pathname, { replace: true, state: {} });
        }
    // Ajout de dépendances pour éviter les boucles : on ne se déclenche que si location.state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state?.silentRefresh]);

    // Réinitialiser le flag quand on quitte la page
    useEffect(() => {
        return () => {
            hasFetchedRef.current = false;
        };
    }, []);

    // Debug logs (seulement quand les demandes changent réellement)
    useEffect(() => {
        if (demandes && demandes.length > 0) {
            console.log("📊 Dashboard - demandes:", demandes);
            console.log("📊 Dashboard - demandesMeta:", demandesMeta);
            console.log("📊 Dashboard - pendingDemandesCount:", demandesMeta?.total || demandes?.length);
        }
    }, [demandesMeta?.total]); // Ne se déclenche que si le total change

    const displayName = currentUser?.name || 
                       [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(" ") || 
                       "Agent";

    // Récupérer le nombre de demandes depuis l'API des demandes
    // L'API ne retourne pas toujours meta, donc on utilise la longueur du tableau
    const pendingDemandesCount = demandesMeta?.total || demandes?.length || 0;

    // Loading state - Ne JAMAIS afficher le loader si on a déjà des données en cache
    // Même si c'est un "chargement initial", on affiche les données existantes
    const hasData = status === 'succeeded' || (operational && financial && logistics);
    const showLoader = isInitialLoad && dashboardLoading && !hasData;
    
    if (showLoader) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner 
                    message="Chargement du dashboard..." 
                    size="large"
                />
            </div>
        );
    }

    return (
        <div className="relative max-w-[1600px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-6">
            
            {/* ========== HEADER COMPACT ========== */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                        onClick={() => {
                            fetchDashboard(true, true); // forceRefresh=true, silentRefresh=true
                            loadDemandes({ page: 1 }, true);
                        }}
                        disabled={isRefreshing}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                        title="Actualiser"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <h1 className="text-base sm:text-lg font-bold text-slate-900">
                            Dashboard
                        </h1>
                        {isRefreshing && (
                            <span className="text-[10px] sm:text-xs text-indigo-600 font-medium animate-pulse">
                                Actualisation...
                            </span>
                        )}
                        {lastUpdated && !isRefreshing && (
                            <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">
                                • Mis à jour {new Date(lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/create-expedition')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5 sm:gap-2"
                >
                    <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Nouvelle expédition</span>
                    <span className="sm:hidden">Nouveau</span>
                </button>
            </div>

            {/* ========== ALERTE DEMANDES COMPACTE (si > 0) ========== */}
            {pendingDemandesCount > 0 && showDemandesAlert && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
                    <BellAlertIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-amber-900 flex-1">
                        <span className="font-bold">{pendingDemandesCount} demande{pendingDemandesCount > 1 ? 's' : ''}</span> en attente
                    </p>
                    <button
                        onClick={() => navigate('/demandes')}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-600 text-white text-[10px] sm:text-xs font-semibold rounded hover:bg-amber-700 transition-colors"
                    >
                        Voir
                    </button>
                    <button
                        onClick={() => setShowDemandesAlert(false)}
                        className="p-1 text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            )}

            {/* ========== 1. ACTIONS PRIORITAIRES ========== */}
            <PriorityActions 
                operational={operational} 
                pendingDemandesCount={pendingDemandesCount} 
            />

            {/* ========== 2. KPI PAR CATÉGORIES MÉTIER ========== */}
            <KPISection 
                financial={financial} 
                operational={operational} 
            />

            {/* ========== 3. DERNIÈRES EXPÉDITIONS (Pleine largeur) ========== */}
            <RecentExpeditions expeditions={logistics.dernieres_expeditions} />

            {/* ========== 4. STATISTIQUES (En dessous) ========== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <StatsCards 
                    logistics={logistics} 
                    operational={operational} 
                />
            </div>
        </div>
    );
};

export default Dashboard;
