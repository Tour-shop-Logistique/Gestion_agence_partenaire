import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAccounting } from "../hooks/useAccounting";
import { useAgency } from "../hooks/useAgency";
import { Link } from "react-router-dom";
import { formatPriceDual } from "../utils/format";
import { 
  ArrowPathIcon, 
  MagnifyingGlassIcon, 
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

const Comptabilite = () => {
  const { data, summary, status, loadAccounting, lastFilters } = useAccounting();
  const { agencyData, fetchAgencyData } = useAgency();

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

  const [dateDebut, setDateDebut] = useState(lastFilters?.date_debut || getFirstDayOfMonth());
  const [dateFin, setDateFin] = useState(lastFilters?.date_fin || getTodayDate());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadAccounting({
      date_debut: dateDebut,
      date_fin: dateFin
    });
  }, [dateDebut, dateFin, loadAccounting]);

  useEffect(() => {
    fetchAgencyData();
  }, [fetchAgencyData]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paye':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'en_attente':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paye': return 'Payé';
      case 'en_attente': return 'En attente';
      default: return status || 'Inconnu';
    }
  };

  const filteredData = useMemo(() => {
    let result = data;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.reference?.toLowerCase().includes(lowerQuery) ||
        item.expediteur?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
        item.destinataire?.nom_prenom?.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (statusFilter) {
      result = result.filter(item => item.statut_paiement === statusFilter);
    }
    
    return result;
  }, [data, searchQuery, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Gestion Comptable
            </h1>
            <p className="text-slate-500 font-medium">
              Suivi des revenus, commissions et répartition des gains
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative">
                <input
                  type="date"
                  className="pl-3 pr-2 py-2 text-sm font-bold bg-transparent border-none focus:ring-0 cursor-pointer"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                />
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="relative">
                <input
                  type="date"
                  className="pl-3 pr-2 py-2 text-sm font-bold bg-transparent border-none focus:ring-0 cursor-pointer"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>
            </div>
            
            <button
              onClick={() => loadAccounting({ date_debut: dateDebut, date_fin: dateFin }, true)}
              disabled={status === 'loading'}
              className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Client Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                <BanknotesIcon className="w-6 h-6" />
              </div>
              <div className="flex items-center text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                <span className="text-xs font-bold">Total</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Client</p>
              <h3 className="text-2xl font-black text-slate-900 tabular-nums">
                {summary.total_client_due ? new Intl.NumberFormat('fr-FR').format(summary.total_client_due) : 0} <span className="text-sm font-bold text-slate-400">FCFA</span>
              </h3>
            </div>
          </div>

          {/* Part Agence Card (Highlighted) */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl shadow-slate-200/50 hover:translate-y-[-4px] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                  <BuildingOfficeIcon className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  Principal
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Part Agence</p>
                <h3 className="text-2xl font-black text-white tabular-nums">
                  {summary.total_agence ? new Intl.NumberFormat('fr-FR').format(summary.total_agence) : 0} <span className="text-sm font-bold text-slate-500">FCFA</span>
                </h3>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter mt-2 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                  Gains nets de l'agence
                </p>
              </div>
            </div>
          </div>

          {/* Part Backoffice Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 group-hover:scale-110 transition-transform font-bold">
                BO
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Part Backoffice</p>
              <h3 className="text-2xl font-black text-slate-900 tabular-nums">
                {summary.total_backoffice ? new Intl.NumberFormat('fr-FR').format(summary.total_backoffice) : 0} <span className="text-sm font-bold text-slate-400">FCFA</span>
              </h3>
            </div>
          </div>

          {/* Part Livreurs Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
                <TruckIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Part Livreurs</p>
              <h3 className="text-2xl font-black text-slate-900 tabular-nums">
                {summary.total_livreur ? new Intl.NumberFormat('fr-FR').format(summary.total_livreur) : 0} <span className="text-sm font-bold text-slate-400">FCFA</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative group w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm group-hover:shadow-md"
              placeholder="Rechercher par référence, expéditeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:w-48">
              <select
                className="block w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="paye">Payé</option>
                <option value="en_attente">En attente</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Expédition</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trajet</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Montant Client</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Revenu BO</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Part Agence</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Part Livreur</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {status === 'loading' && data.length === 0 ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(8).fill(0).map((_, j) => (
                        <td key={j} className="px-6 py-6">
                          <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.reference}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {item.expediteur?.nom_prenom || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-bold text-slate-600 text-sm whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter">
                          <span className="text-slate-500">{item.pays_depart}</span>
                          <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="text-blue-600">{item.pays_destination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-black text-slate-900 text-sm tabular-nums">
                        {new Intl.NumberFormat('fr-FR').format(item.accounting_details?.total_client_due || 0)}
                      </td>
                      <td className="px-6 py-6 font-black text-slate-500 text-sm tabular-nums">
                        {new Intl.NumberFormat('fr-FR').format(item.accounting_details?.backoffice || 0)}
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-black text-blue-600 tabular-nums">
                          {new Intl.NumberFormat('fr-FR').format(item.accounting_details?.agence || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-6 font-black text-slate-400 text-sm tabular-nums text-center lg:text-left">
                        {new Intl.NumberFormat('fr-FR').format(item.accounting_details?.livreur || 0)}
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(item.statut_paiement)}`}>
                          {getStatusLabel(item.statut_paiement)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center max-w-xs mx-auto">
                        <div className="p-4 bg-slate-50 rounded-3xl mb-4">
                          <BanknotesIcon className="w-10 h-10 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">Aucune transaction</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          Il n'y a pas encore de données comptables sur cette période.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View - Cards Layout (Hidden on Desktop) */}
        <div className="lg:hidden space-y-4">
          {filteredData.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900">{item.reference}</span>
                  <span className="text-[10px] font-bold text-slate-400">{formatDate(item.created_at)}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(item.statut_paiement)}`}>
                  {getStatusLabel(item.statut_paiement)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</p>
                  <p className="text-sm font-black text-slate-900">
                    {new Intl.NumberFormat('fr-FR').format(item.accounting_details?.total_client_due || 0)} <span className="text-[10px]">CFA</span>
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Ma Part</p>
                  <p className="text-sm font-black text-blue-600">
                    {new Intl.NumberFormat('fr-FR').format(item.accounting_details?.agence || 0)} <span className="text-[10px]">CFA</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Comptabilite;
