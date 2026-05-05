import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    PlusIcon,
    ArrowPathIcon,
    BellAlertIcon,
    XMarkIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";

import { useAuth } from "../hooks/useAuth";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import { useDashboard } from "../hooks/useDashboard";
import { getLogoUrl } from "../utils/apiConfig";

// Composants modulaires
import PriorityActions from "../components/dashboard/PriorityActions";
import KPISection from "../components/dashboard/KPISection";
import RecentExpeditions from "../components/dashboard/RecentExpeditions";
import StatsCards from "../components/dashboard/StatsCards";
import LoadingSpinner, { DashboardSkeleton } from "../components/common/LoadingSpinner";

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
    const { demandesMeta, loadDemandes } = useExpedition();
    const { operational, financial, logistics, loading: dashboardLoading, status, isRefreshing, lastUpdated, fetchDashboard } = useDashboard();
    const [showDemandesAlert, setShowDemandesAlert] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        // Charger les données au montage initial
        const loadData = async () => {
            // Éviter les appels multiples pour le chargement initial
            if (hasFetchedRef.current) {
                return;
            }
            hasFetchedRef.current = true;

            // Si on a déjà des données en cache
            if (status === 'succeeded' && dashboardState.lastUpdated) {
                const lastUpdate = new Date(dashboardState.lastUpdated);
                const now = new Date();
                const diffSeconds = (now - lastUpdate) / 1000;
                
                // Si les données ont plus de 30 secondes, on fait un refresh silencieux
                if (diffSeconds > 30) {
                    setIsInitialLoad(false);
                    await fetchDashboard(true, true); // Rechargement silencieux
                    await loadDemandes({ page: 1 }, true);
                } else {
                    // Données récentes, pas besoin de recharger
                    setIsInitialLoad(false);
                }
                return;
            }

            // Chargement initial complet avec loader
            await fetchDashboard();
            await loadDemandes({ page: 1 });
            
            // Charger l'agence si nécessaire
            if (!agencyData) {
                await fetchAgencyData();
            }

            setIsInitialLoad(false);
        };

        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Détecter si on revient avec un état de rechargement silencieux
    useEffect(() => {
        if (location.state?.silentRefresh && status === 'succeeded') {
            // Recharger silencieusement les données
            fetchDashboard(true, true);
            loadDemandes({ page: 1 }, true);
            
            // Nettoyer le state pour éviter les rechargements répétés
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, status, fetchDashboard, loadDemandes, navigate, location.pathname]);

    // Réinitialiser le flag quand on quitte la page
    useEffect(() => {
        return () => {
            hasFetchedRef.current = false;
        };
    }, []);

    const displayName = currentUser?.name || 
                       [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(" ") || 
                       "Agent";

    const pendingDemandesCount = demandesMeta?.total || 0;

    // Loading state - Afficher le loader seulement au chargement initial
    // Si les données sont en cache, on affiche directement le dashboard
    const showLoader = isInitialLoad && dashboardLoading && status !== 'succeeded';
    
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
        <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6">
            
            {/* ========== HEADER COMPACT ========== */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold text-slate-900">
                            Dashboard
                        </h1>
                        {isRefreshing && (
                            <span className="text-xs text-indigo-600 font-medium animate-pulse">
                                Actualisation...
                            </span>
                        )}
                        {lastUpdated && !isRefreshing && (
                            <span className="text-xs text-slate-400">
                                • Mis à jour {new Date(lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/create-expedition')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Nouvelle expédition
                </button>
            </div>

            {/* ========== ALERTE DEMANDES COMPACTE (si > 0) ========== */}
            {pendingDemandesCount > 0 && showDemandesAlert && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
                    <BellAlertIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-900 flex-1">
                        <span className="font-bold">{pendingDemandesCount} demande{pendingDemandesCount > 1 ? 's' : ''}</span> en attente
                    </p>
                    <button
                        onClick={() => navigate('/demandes')}
                        className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition-colors"
                    >
                        Voir
                    </button>
                    <button
                        onClick={() => setShowDemandesAlert(false)}
                        className="p-1 text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCards 
                    logistics={logistics} 
                    operational={operational} 
                />
            </div>
        </div>
    );
};

export default Dashboard;
