import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    PlusIcon,
    ArrowUpRightIcon,
    ArrowDownRightIcon,
    CalendarIcon,
    AdjustmentsHorizontalIcon,
    CubeIcon,
    TruckIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ArrowPathIcon,
    MapPinIcon,
    UserGroupIcon,
    ArchiveBoxIcon,
    QrCodeIcon,
    ArrowRightIcon,
    BellAlertIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

import { useAuth } from "../hooks/useAuth";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import { useDashboard } from "../hooks/useDashboard";
import { getLogoUrl } from "../utils/apiConfig";
import { formatPriceDual } from "../utils/format";

const Dashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { data: agencyData, fetchAgencyData } = useAgency();
    const { demandesMeta, loadDemandes } = useExpedition();
    const { operational, financial, logistics, loading: dashboardLoading, fetchDashboard } = useDashboard();
    const [showDemandesAlert, setShowDemandesAlert] = useState(true);

    // Helper helpers
    const getTodayDate = () => new Date().toISOString().split('T')[0];
    const getFirstDayOfMonth = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    };

    // -- Dates Configuration --
    const [dateDebut] = useState(() => {
        const saved = sessionStorage.getItem('expeditions_date_debut');
        return saved || getFirstDayOfMonth();
    });
    const [dateFin] = useState(() => {
        const saved = sessionStorage.getItem('expeditions_date_fin');
        return saved || getTodayDate();
    });

    useEffect(() => {
        fetchAgencyData();
        loadDemandes({ page: 1 });
        fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const displayName = currentUser?.name || 
                       [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(" ") || 
                       "Agent";

    const pendingDemandesCount = demandesMeta?.total || 0;

    const isLoading = dashboardLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse p-6">
                <div className="h-20 w-full bg-slate-100 rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
                </div>
                <div className="h-96 bg-slate-50 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6">
            
            {/* Alerte Demandes en attente */}
            {pendingDemandesCount > 0 && showDemandesAlert && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in slide-in-from-top duration-500">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <BellAlertIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-amber-900 mb-1">
                            {pendingDemandesCount} {pendingDemandesCount === 1 ? 'demande en attente' : 'demandes en attente'}
                        </h3>
                        <p className="text-xs text-amber-700 mb-3">
                            Des clients ont soumis des demandes d'expédition qui nécessitent votre validation.
                        </p>
                        <button
                            onClick={() => navigate('/demandes')}
                            className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                        >
                            Voir les demandes
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowDemandesAlert(false)}
                        className="flex-shrink-0 p-1 text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* --- 1. HERO SECTION (SOBRE) --- */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {agencyData?.agence?.logo ? (
                            <img src={getLogoUrl(agencyData.agence.logo)} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
                                <span className="text-xl font-bold text-white">{(agencyData?.agence?.nom_agence || "A")[0]}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                            Bonjour, {displayName}
                        </h1>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">
                            Gestionnaire - {agencyData?.agence?.nom_agence || "Agence Partenaire"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fetchDashboard(true)}
                        disabled={dashboardLoading}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                        title="Actualiser les données"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${dashboardLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => navigate('/create-expedition')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[3]" />
                        Créer une expédition
                    </button>
                </div>
            </div>

            {/* --- 2. KPI CARDS (SAS B2B) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { 
                        label: "Commission Totale", 
                        value: `${new Intl.NumberFormat('fr-FR').format(financial.commissions_mois || 0)} CFA`, 
                        icon: <CurrencyDollarIcon />, 
                        sub: "Ce mois", 
                        status: "ok" 
                    },
                    { 
                        label: "À Réceptionner", 
                        value: operational.colis_attente_reception_depart || 0, 
                        icon: <ArchiveBoxIcon />, 
                        sub: "En attente hub", 
                        status: (operational.colis_attente_reception_depart || 0) > 10 ? "urgent" : "attention" 
                    },
                    { 
                        label: "À Remettre", 
                        value: operational.colis_attente_retrait_livraison || 0, 
                        icon: <TruckIcon />, 
                        sub: "Prêt en agence", 
                        status: (operational.colis_attente_retrait_livraison || 0) > 5 ? "attention" : "ok" 
                    },
                    { 
                        label: "Créées Aujourd'hui", 
                        value: operational.expeditions_creees_aujourdhui || 0, 
                        icon: <CubeIcon />, 
                        sub: "Nouvelles expéditions", 
                        status: "ok" 
                    }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                                <div className="w-5 h-5">{stat.icon}</div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                stat.status === 'urgent' ? 'bg-red-50 text-red-600 border-red-100' :
                                stat.status === 'attention' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                                {stat.sub}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- 3. ACTIONS PRIORITAIRES --- */}
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest px-1">Actions Prioritaires</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { 
                            title: "Colis à réceptionner", 
                            count: operational.colis_attente_reception_depart || 0, 
                            link: "/colis-a-receptionner", 
                            color: "amber", 
                            urgent: (operational.colis_attente_reception_depart || 0) > 10 
                        },
                        { 
                            title: "Colis à remettre", 
                            count: operational.colis_attente_retrait_livraison || 0, 
                            link: "/retrait-colis", 
                            color: "emerald", 
                            urgent: (operational.colis_attente_retrait_livraison || 0) > 5 
                        },
                        { 
                            title: "Demandes en attente", 
                            count: operational.expeditions_attente_acceptation || 0, 
                            link: "/demandes", 
                            color: "indigo", 
                            urgent: (operational.expeditions_attente_acceptation || 0) > 0 
                        }
                    ].map((action, i) => (
                        <Link 
                            key={i} 
                            to={action.link}
                            className="bg-white group p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${action.color}-50 text-${action.color}-600 border border-${action.color}-100`}>
                                    <span className="text-lg font-bold">{action.count}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700">{action.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {action.urgent && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                )}
                                <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* --- 4. INDICATEURS FINANCIERS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chiffre d'affaires</h3>
                        <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                        {new Intl.NumberFormat('fr-FR').format(financial.chiffre_affaires_mois || 0)} CFA
                    </p>
                    <p className="text-xs text-slate-400 font-medium">Ce mois</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Paiements</h3>
                        <CheckCircleIcon className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-semibold">Payé</span>
                            <span className="text-sm font-bold text-emerald-600">
                                {new Intl.NumberFormat('fr-FR').format(financial.statut_paiements?.paye || 0)} CFA
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-semibold">Impayé</span>
                            <span className="text-sm font-bold text-red-600">
                                {new Intl.NumberFormat('fr-FR').format(financial.statut_paiements?.impaye || 0)} CFA
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">À recouvrer</h3>
                        <ClockIcon className="w-5 h-5 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                        {new Intl.NumberFormat('fr-FR').format(financial.encours_a_recouvrer || 0)} CFA
                    </p>
                    <p className="text-xs text-slate-400 font-medium">En cours</p>
                </div>
            </div>

            {/* --- 5. STATISTIQUES OPÉRATIONNELLES --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Suivi Opérationnel</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: "Reçus aujourd'hui", value: operational.colis_recus_aujourdhui || 0, icon: <CheckCircleIcon className="w-5 h-5" />, color: "emerald" },
                        { label: "En transit", value: operational.colis_en_transit_vers_agence || 0, icon: <TruckIcon className="w-5 h-5" />, color: "blue" },
                        { label: "Vers entrepôt", value: operational.colis_attente_expedition_entrepot || 0, icon: <ArchiveBoxIcon className="w-5 h-5" />, color: "amber" },
                        { label: "Créées aujourd'hui", value: operational.expeditions_creees_aujourdhui || 0, icon: <CubeIcon className="w-5 h-5" />, color: "indigo" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-${item.color}-50 text-${item.color}-600`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
