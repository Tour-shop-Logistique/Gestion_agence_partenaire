import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import {
  PlusIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  CalendarIcon,
  ArrowRightIcon,
  AdjustmentsHorizontalIcon,
  CubeIcon,
  TruckIcon,
  ShoppingBagIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

// Import du hook personnalisé pour l'authentification
import { useAuth } from "../hooks/useAuth";
// Import du hook personnalisé pour l'agence
import { useAgency } from "../hooks/useAgency";
import { getLogoUrl } from "../utils/apiConfig";
// Import du hook pour les expéditions
import { useExpedition } from "../hooks/useExpedition";

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const { data: agencyData } = useAgency();
  const { expeditions, loadExpeditions, status: expeditionStatus } = useExpedition();

  const [startDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });

  const [endDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    if (!expeditions || expeditions.length === 0) {
      loadExpeditions({
        date_debut: startDate,
        date_fin: endDate
      });
    }
  }, [loadExpeditions, startDate, endDate, expeditions]);

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const expeditionsList = Array.isArray(expeditions) ? expeditions : [];

  const statsData = {
    total: expeditionsList.length,
    newRequests: expeditionsList.filter(e => e.statut_expedition === 'accepted' || e.statut_expedition === 'pending').length,
    inTransit: expeditionsList.filter(e => e.statut_expedition === 'in_transit').length,
    delivered: expeditionsList.filter(e => e.statut_expedition === 'delivered').length,
  };

  const stats = [
    {
      title: isAdmin ? "Demandes" : "Mes Expéditions",
      value: isAdmin ? statsData.newRequests : statsData.total,
      trend: "+12%",
      isUp: true,
      icon: isAdmin ? <ShoppingBagIcon /> : <CubeIcon />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: isAdmin ? "Total Cargo" : "En Transit",
      value: isAdmin ? statsData.total : statsData.inTransit,
      trend: "+5%",
      isUp: true,
      icon: isAdmin ? <CubeIcon /> : <TruckIcon />,
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200"
    },
    {
      title: "Revenu",
      value: "2.4M",
      trend: "+8%",
      isUp: true,
      icon: <ArrowUpRightIcon />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      title: "Volume",
      value: "84%",
      trend: "-2%",
      isUp: false,
      icon: <AdjustmentsHorizontalIcon />,
      color: "text-slate-500",
      bg: "bg-slate-50",
      border: "border-slate-200"
    }
  ];

  const displayName = currentUser?.name ||
    [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(" ") ||
    "Utilisateur";

  if (expeditionStatus === 'loading') {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">

        {/* --- COMPACT HEADER --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
              {agencyData?.agence?.logo ? (
                <img
                  src={getLogoUrl(agencyData.agence.logo)}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{(agencyData?.agence?.nom_agence || "T")[0]}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Bonjour, {displayName.split(' ')[0]} 👋
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                {agencyData?.agence?.nom_agence || "Tous Shop"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{formatDateDisplay(startDate)}</span>
              <span className="text-slate-300 mx-1">—</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{formatDateDisplay(endDate)}</span>
            </div>

            <Link
              to="/create-expedition"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Expédition
            </Link>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-all group"
            >
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${stat.bg} ${stat.border} flex items-center justify-center ${stat.color} shadow-sm`}>
                  <div className="w-4 h-4 md:w-5 md:h-5">{stat.icon}</div>
                </div>
                <div className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {stat.trend}
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{stat.title}</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* --- CONTENT SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity Donut (Simple) - Hidden on very small screens to save space, shown from sm up */}
          <div className="hidden sm:flex bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex-col items-center">
            <div className="w-full flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Performance</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#f8fafc" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="8"
                  strokeDasharray="276"
                  initial={{ strokeDashoffset: 276 }}
                  animate={{ strokeDashoffset: 276 * 0.3 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-bold text-slate-900 tracking-tighter">70%</span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Succès</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 w-full pt-6 border-t border-slate-50">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Livrés</p>
                <p className="text-base font-bold text-slate-900">82.4%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">En cours</p>
                <p className="text-base font-bold text-slate-900">17.6%</p>
              </div>
            </div>
          </div>

          {/* Recent Table / Cards on mobile */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dernières Expéditions</h3>
              </div>
              <Link to="/expeditions" className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Tout voir</Link>
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destinataire</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expeditionsList.length > 0 ? (
                    [...expeditionsList].reverse().slice(0, 6).map((exp, idx) => (
                      <tr key={exp.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-900">
                            {exp.reference || `EXP-${String(exp.id).padStart(4, '0')}`}
                          </span>
                          <div className="text-[9px] text-slate-400 uppercase font-medium mt-0.5">
                            {formatDateDisplay(exp.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{exp.destinataire?.nom_prenom || exp.destinataire_nom_prenom}</span>
                            <span className="text-[10px] text-slate-400">{exp.destinataire?.ville || exp.destinataire_ville || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          {(() => {
                            const statut = (exp.statut_expedition || 'pending').toLowerCase();
                            const variants = {
                              delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
                              in_transit: "bg-blue-50 text-blue-700 border-blue-100",
                              accepted: "bg-sky-50 text-sky-700 border-sky-100",
                              pending: "bg-amber-50 text-amber-700 border-amber-100"
                            };
                            return (
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-tighter ${variants[statut] || variants.pending}`}>
                                {statut.replace('_', ' ')}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Link to={`/expeditions/${exp.id}`} className="inline-flex p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all">
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Aucune donnée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {expeditionsList.length > 0 ? (
                [...expeditionsList].reverse().slice(0, 5).map((exp, idx) => (
                  <Link
                    key={exp.id || idx}
                    to={`/expeditions/${exp.id}`}
                    className="block p-4 active:bg-slate-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                          {exp.reference || `EXP-${String(exp.id).padStart(4, '0')}`}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {exp.destinataire?.nom_prenom || exp.destinataire_nom_prenom}
                        </span>
                      </div>
                      {(() => {
                        const statut = (exp.statut_expedition || 'pending').toLowerCase();
                        const variants = {
                          delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
                          in_transit: "bg-blue-50 text-blue-700 border-blue-100",
                          accepted: "bg-sky-50 text-sky-700 border-sky-100",
                          pending: "bg-amber-50 text-amber-700 border-amber-100"
                        };
                        return (
                          <span className={`px-2 py-0.5 text-[8px] font-bold rounded border uppercase ${variants[statut] || variants.pending}`}>
                            {statut.replace('_', ' ')}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-medium">{exp.destinataire?.ville || exp.destinataire_ville || '—'}</span>
                      <span className="font-bold uppercase">{formatDateDisplay(exp.created_at)}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-10 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aucune donnée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
