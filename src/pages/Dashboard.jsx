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
    ArrowRightIcon
} from "@heroicons/react/24/outline";

import { useAuth } from "../hooks/useAuth";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import { getLogoUrl } from "../utils/apiConfig";
import { formatPriceDual } from "../utils/format";

const Dashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { data: agencyData, fetchAgencyData } = useAgency();
    const { expeditions, meta, loadExpeditions, status: expeditionStatus } = useExpedition();

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
        loadExpeditions({
            date_debut: dateDebut,
            date_fin: dateFin,
            per_page: 50 
        });
        fetchAgencyData();
    }, [loadExpeditions, fetchAgencyData, dateDebut, dateFin]);

    const expeditionsList = useMemo(() => Array.isArray(expeditions) ? expeditions : [], [expeditions]);

    // -- Advanced Stats Calculation --
    const stats = useMemo(() => {
        const totals = {
            count: expeditionsList.length,
            commissions: 0,
            toReceive: 0, 
            toDeliver: 0, 
            pendingPayment: 0
        };

        expeditionsList.forEach(exp => {
            if (exp.commission_details) {
                const c = exp.commission_details;
                totals.commissions += (c.enlevement?.agence || 0) + 
                                     (c.livraison?.agence || 0) + 
                                     (c.emballage?.agence || 0) + 
                                     (c.retard?.agence || 0);
            }
            if (exp.statut_expedition === 'accepted') totals.toReceive++;
            if (exp.statut_expedition === 'recu_agence_destination' || exp.statut_expedition === 'arrivee_expedition_succes') totals.toDeliver++;
            if (exp.statut_paiement_expedition !== 'paye') totals.pendingPayment++;
        });

        return totals;
    }, [expeditionsList]);

    const displayName = currentUser?.name || 
                       [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(" ") || 
                       "Agent";

    const isLoading = expeditionStatus === 'loading' && expeditionsList.length === 0;

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
                    { label: "Commission Totale", value: `${new Intl.NumberFormat('fr-FR').format(stats.commissions)} CFA`, icon: <CurrencyDollarIcon />, sub: "Ce mois", status: "ok" },
                    { label: "À Réceptionner", value: stats.toReceive, icon: <ArchiveBoxIcon />, sub: "En attente hub", status: stats.toReceive > 10 ? "urgent" : "attention" },
                    { label: "À Remettre", value: stats.toDeliver, icon: <TruckIcon />, sub: "Prêt en agence", status: stats.toDeliver > 5 ? "attention" : "ok" },
                    { label: "Volume Global", value: stats.count, icon: <CubeIcon />, sub: "Expéditions total", status: "ok" }
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
                        { title: "Colis à réceptionner", count: stats.toReceive, link: "/colis-a-receptionner", color: "amber", urgent: stats.toReceive > 10 },
                        { title: "Colis à remettre", count: stats.toDeliver, link: "/retrait-colis", color: "emerald", urgent: stats.toDeliver > 5 },
                        { title: "Paiements à récupérer", count: stats.pendingPayment, link: "/comptabilite", color: "red", urgent: stats.pendingPayment > 0 }
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

            {/* --- 4. FLUX DE TRAVAIL & ACTIVITÉS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Activities Table (ERP STYLE) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/10">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Dernières Activités</h3>
                        <Link to="/expeditions" className="text-xs font-bold text-indigo-600">Voir tout</Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réf / Date</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trajet</th>
                                    <th className="px-8 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Montant</th>
                                    <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expeditionsList.slice(0, 6).map((exp) => (
                                    <tr 
                                        key={exp.id} 
                                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/expeditions/${exp.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{exp.reference}</span>
                                                <span className="text-[10px] font-medium text-slate-400">{new Date(exp.created_at).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                <span className="truncate max-w-[80px]">{exp.pays_depart}</span>
                                                <ArrowRightIcon className="w-3 h-3 text-slate-300" />
                                                <span className="text-slate-900 truncate max-w-[80px]">{exp.pays_destination}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-bold text-slate-900 tabular-nums">{formatPriceDual(exp.montant_expedition)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border shadow-sm ${
                                                exp.statut_expedition === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                exp.statut_expedition === 'accepted' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {exp.statut_expedition?.replace(/_/g, ' ') || 'En cours'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Analyse Section (DATA-DRIVEN) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
                        <div className="w-full flex items-center justify-between mb-8">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Efficacité</h3>
                            <div className="text-[10px] font-bold text-slate-400">Mensuel</div>
                        </div>
                        
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                <circle
                                    cx="50" cy="50" r="42" fill="none" stroke="#6366f1" strokeWidth="10" strokeDasharray="264"
                                    strokeDashoffset={264 * (1 - (stats.count > 0 ? (stats.count - stats.toReceive - stats.toDeliver) / stats.count : 0.8))}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute text-center">
                                <span className="text-3xl font-bold text-slate-900 tracking-tighter">
                                    {stats.count > 0 ? Math.round(((stats.count - stats.toReceive - stats.toDeliver) / stats.count) * 100) : '--'}%
                                </span>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Livrées</p>
                            </div>
                        </div>

                        <div className="w-full mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Expéditions</p>
                                <p className="text-lg font-bold text-slate-900 tracking-tight">{stats.count}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">En cours</p>
                                <p className="text-lg font-bold text-slate-900 tracking-tight">{stats.toReceive + stats.toDeliver}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-110 transition-transform"></div>
                        <h4 className="text-sm font-bold mb-2">Conseil de gestion</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            La réception rapide des colis au hub réduit les délais de commission de 24h en moyenne.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
