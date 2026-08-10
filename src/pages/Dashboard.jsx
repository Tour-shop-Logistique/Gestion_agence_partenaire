import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

import { useAuth } from "../hooks/useAuth";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import { useDashboard } from "../hooks/useDashboard";
import { useDashboardWebSocket } from "../hooks/useDashboardWebSocket";

// Composants modulaires
import PageHeader from "../components/ui/PageHeader";
import ExchangeRateWidget from "../components/dashboard/ExchangeRateWidget";
import DemandesAlert from "../components/dashboard/DemandesAlert";
import PriorityActions from "../components/dashboard/PriorityActions";
import KPISection from "../components/dashboard/KPISection";
import RecentExpeditions from "../components/dashboard/RecentExpeditions";
import StatsCards from "../components/dashboard/StatsCards";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Au-delà de ce délai, les données en cache sont considérées comme périmées
// et un rechargement silencieux est déclenché en arrière-plan.
const STALE_DATA_THRESHOLD_SECONDS = 30;

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

    // Rafraîchissement forcé et silencieux du dashboard + des demandes
    const refreshAll = useCallback(() => {
        fetchDashboard(true, true);
        loadDemandes({ page: 1 }, true);
    }, [fetchDashboard, loadDemandes]);

    useDashboardWebSocket({
        agenceId: currentUser?.agence_id,
        enabled: !!currentUser?.agence_id,
        navigate,
        refreshAll
    });

    useEffect(() => {
        // Charger les données au montage initial
        const loadData = async () => {
            // Éviter les appels multiples pour le chargement initial
            if (hasFetchedRef.current) {
                return;
            }
            hasFetchedRef.current = true;

            // Si on a déjà des données en cache (préchargées par App.jsx)
            if (status === 'succeeded' && lastUpdated) {
                const lastUpdate = new Date(lastUpdated);
                const now = new Date();
                const diffSeconds = (now - lastUpdate) / 1000;

                // Pas de loader, on affiche directement les données
                setIsInitialLoad(false);

                // Si les données ont plus de STALE_DATA_THRESHOLD_SECONDS, on fait un refresh silencieux
                if (diffSeconds > STALE_DATA_THRESHOLD_SECONDS) {
                    refreshAll();
                }
                return;
            }

            // Chargement initial sans loader si possible
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
            refreshAll();
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
        <div className="relative max-w-[1600px] mx-auto space-y-5 sm:space-y-7 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-6 pt-1 animate-fade-in">

            <PageHeader
                title="Dashboard"
                subtitle={
                    isRefreshing
                        ? "Actualisation..."
                        : lastUpdated
                            ? `Mis à jour ${new Date(lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                            : undefined
                }
                actions={
                    <>
                        <ExchangeRateWidget />
                        <button
                            onClick={refreshAll}
                            disabled={isRefreshing}
                            aria-label="Actualiser le dashboard"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm active:scale-95 transition-all disabled:opacity-50"
                            title="Actualiser"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                        </button>
                    </>
                }
            />

            {showDemandesAlert && (
                <DemandesAlert
                    count={pendingDemandesCount}
                    onView={() => navigate('/demandes')}
                    onDismiss={() => setShowDemandesAlert(false)}
                />
            )}

            {/* ========== 1. ACTIONS PRIORITAIRES ========== */}
            <PriorityActions
                operational={operational}
            />

            {/* ========== 2. KPI PAR CATÉGORIES MÉTIER ========== */}
            <KPISection
                financial={financial}
                operational={operational}
            />

            {/* ========== 3. DERNIÈRES EXPÉDITIONS (Pleine largeur) ========== */}
            <RecentExpeditions expeditions={logistics.dernieres_expeditions} />

            {/* ========== 4. STATISTIQUES (En dessous) ========== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
                <StatsCards
                    logistics={logistics}
                    operational={operational}
                />
            </div>
        </div>
    );
};

export default Dashboard;
