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
    const { demandes = [], demandesMeta, loadDemandes } = useExpedition();
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

            // ✅ Si on a déjà des données en cache (préchargées par App.jsx)
            if (status === 'succeeded' && lastUpdated) {
                const lastUpdate = new Date(lastUpdated);
                const now = new Date();
                const diffSeconds = (now - lastUpdate) / 1000;
                
                // Pas de loader, on affiche directement les données
                setIsInitialLoad(false);
                
                // Si les données ont plus de 30 secondes, on fait un refresh silencieux
                if (diffSeconds > 30) {
                    fetchDashboard(true, true); // Rechargement silencieux en arrière-plan
                    loadDemandes({ page: 1 }, true);
                }
                return;
            }

            // ✅ Chargement initial sans loader si possible
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

    // Récupérer le nombre de demandes depuis l'API des demandes
    // L'API ne retourne pas toujours meta, donc on utilise la longueur du tableau
    const pendingDemandesCount = demandesMeta?.total || demandes?.length || 0;
    
    // Debug: afficher demandesMeta dans la console
    console.log("📊 Dashboard - demandes:", demandes);
    console.log("📊 Dashboard - demandesMeta:", demandesMeta);
    console.log("📊 Dashboard - pendingDemandesCount:", pendingDemandesCount);

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
        <div className="relative min-h-screen">
            {/* ========== MOTIFS DE FOND GÉOMÉTRIQUES ========== */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Fond de base avec dégradé subtil */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
                
                {/* Motifs géométriques marocains - Coin supérieur droit */}
                <div className="absolute -top-20 -right-20 w-[500px] h-[500px] opacity-[0.15]">
                    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                        {/* Étoile à 8 branches centrale */}
                        <g transform="translate(250, 250)">
                            <path d="M0,-100 L20,-20 L100,0 L20,20 L0,100 L-20,20 L-100,0 L-20,-20 Z" 
                                  fill="#4f46e5" stroke="#6366f1" strokeWidth="2"/>
                            <circle cx="0" cy="0" r="40" fill="#6366f1" opacity="0.5"/>
                            
                            {/* Petites étoiles autour */}
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                                const rad = (angle * Math.PI) / 180;
                                const x = Math.cos(rad) * 140;
                                const y = Math.sin(rad) * 140;
                                return (
                                    <g key={i} transform={`translate(${x}, ${y})`}>
                                        <path d="M0,-15 L5,-5 L15,0 L5,5 L0,15 L-5,5 L-15,0 L-5,-5 Z" 
                                              fill="#14b8a6" opacity="0.6"/>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>

                {/* Motifs géométriques - Coin inférieur gauche */}
                <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] opacity-[0.12] rotate-45">
                    <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="moroccan-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <circle cx="50" cy="50" r="30" fill="none" stroke="#4f46e5" strokeWidth="2"/>
                                <path d="M50,20 L65,50 L50,80 L35,50 Z" fill="#6366f1" opacity="0.5"/>
                                <circle cx="50" cy="50" r="10" fill="#14b8a6"/>
                            </pattern>
                        </defs>
                        <rect width="600" height="600" fill="url(#moroccan-pattern)"/>
                    </svg>
                </div>

                {/* Petites étoiles décoratives dispersées */}
                <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] opacity-[0.15]">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        {[...Array(6)].map((_, i) => {
                            const x = (i % 3) * 70 + 30;
                            const y = Math.floor(i / 3) * 70 + 30;
                            return (
                                <g key={i} transform={`translate(${x}, ${y})`}>
                                    <path d="M0,-12 L4,-4 L12,0 L4,4 L0,12 L-4,4 L-12,0 L-4,-4 Z" 
                                          fill="#f59e0b" opacity="0.8"/>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Cercles géométriques - Côté droit */}
                <div className="absolute top-1/2 right-10 w-[300px] h-[300px] opacity-[0.1]">
                    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="150" cy="150" r="140" fill="none" stroke="#4f46e5" strokeWidth="2"/>
                        <circle cx="150" cy="150" r="100" fill="none" stroke="#6366f1" strokeWidth="2"/>
                        <circle cx="150" cy="150" r="60" fill="none" stroke="#14b8a6" strokeWidth="3"/>
                        <circle cx="150" cy="150" r="20" fill="#f59e0b" opacity="0.5"/>
                    </svg>
                </div>

                {/* Étoile secondaire - Milieu gauche */}
                <div className="absolute top-1/3 left-20 w-[150px] h-[150px] opacity-[0.12]">
                    <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(75, 75)">
                            <path d="M0,-50 L10,-10 L50,0 L10,10 L0,50 L-10,10 L-50,0 L-10,-10 Z" 
                                  fill="#14b8a6" stroke="#10b981" strokeWidth="2"/>
                            <circle cx="0" cy="0" r="15" fill="#f59e0b" opacity="0.6"/>
                        </g>
                    </svg>
                </div>

                {/* Motif grille subtile sur toute la page */}
                <div className="absolute inset-0 opacity-[0.03]" 
                     style={{
                         backgroundImage: `
                             linear-gradient(to right, #4f46e5 1px, transparent 1px),
                             linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
                         `,
                         backgroundSize: '40px 40px'
                     }}
                />
            </div>

            {/* ========== CONTENU DU DASHBOARD ========== */}
            <div className="relative z-10 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-6">
            
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
        </div>
    );
};

export default Dashboard;
