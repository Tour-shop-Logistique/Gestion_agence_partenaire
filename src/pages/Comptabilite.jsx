import React, { useEffect, useState, useMemo } from "react";
import { useAccounting } from "../hooks/useAccounting";
import { useAgency } from "../hooks/useAgency";
import { 
  ArrowPathIcon, 
  MagnifyingGlassIcon, 
  BanknotesIcon,
  TruckIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  XMarkIcon,
  InformationCircleIcon,
  ReceiptPercentIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  UserIcon,
  MapPinIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const Comptabilite = () => {
  const { data, summary, status, loadAccounting, lastFilters } = useAccounting();
  const { fetchAgencyData } = useAgency();

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
  const [selectedExpedition, setSelectedExpedition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (!dateString) return "n/a";
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
        return 'text-emerald-600';
      case 'en_attente':
        return 'text-amber-600';
      default:
        return 'text-slate-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paye': return 'Payé';
      case 'en_attente': return 'En attente';
      default: return status || 'Inconnu';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0);
  };

  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? data : [];
    
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

  const handleRowClick = (expedition) => {
    setSelectedExpedition(expedition);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1700px] mx-auto px-1 sm:px-6 lg:px-8 py-1 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Comptabilité
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestion des flux financiers et répartition des revenus agence.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <input
              type="date"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 border-none focus:ring-0"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <div className="w-px h-4 bg-slate-200"></div>
            <input
              type="date"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 border-none focus:ring-0"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => loadAccounting({ date_debut: dateDebut, date_fin: dateFin }, true)}
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center w-9 h-9 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Client", value: summary.total_client_due, sub: "Chiffre d'affaires brut" },
          { label: "Part Agence", value: summary.total_agence, sub: "Revenu net agence", highlight: true },
          { label: "Part Backoffice", value: summary.total_backoffice, sub: "Commissions système" },
          { label: "Part Livreurs", value: summary.total_livreur, sub: "Prestations logistiques" }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-slate-200 transition-all">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {kpi.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(kpi.value)}
              </span>
              <span className="text-[10px] font-bold text-slate-400">FCFA</span>
            </div>
            {kpi.sub && <p className="text-[10px] text-slate-500 mt-1 font-medium">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Référence, expéditeur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-48">
          <select
            className="block w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="paye">Payé</option>
            <option value="en_attente">En attente</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FunnelIcon className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-normal">Expédition</th>
                <th scope="col" className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-normal">Date</th>
                <th scope="col" className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-normal">Destination</th>
                <th scope="col" className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-normal text-right">CA Client</th>
                <th scope="col" className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-normal text-right">Système</th>
                <th scope="col" className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-normal text-right">Part Agence</th>
                <th scope="col" className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-normal text-right">Livreur</th>
                <th scope="col" className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-normal text-center">Paiement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {status === 'loading' && filteredData.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4 whitespace-nowrap">
                        <div className="h-4 bg-slate-100 rounded w-full animate-pulse opacity-50"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 leading-tight">
                          {item.reference}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {item.expediteur?.nom_prenom || "n/a"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="text-slate-400">{item.pays_depart}</span>
                        <ChevronRightIcon className="w-3 h-3 text-slate-300" />
                        <span className="text-blue-600">{item.pays_destination}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-900 font-mono text-right">
                      {formatCurrency(item.accounting_details?.total_client_due)}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 font-mono text-right">
                      {formatCurrency(item.accounting_details?.backoffice)}
                    </td>
                    <td className="px-5 py-3 text-sm text-blue-600 font-bold font-mono text-right">
                      {formatCurrency(item.accounting_details?.agence)}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400 font-mono text-right">
                      {formatCurrency(item.accounting_details?.livreur)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[11px] font-bold ${getStatusStyle(item.statut_paiement)}`}>
                        {getStatusLabel(item.statut_paiement)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-slate-50 rounded-lg mb-3">
                        <BanknotesIcon className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">Aucune expédition trouvée.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accounting Details Modal */}
      {isModalOpen && selectedExpedition && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40">
          <div 
            className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Détails Financiers</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Réf: {selectedExpedition.reference} — {formatDate(selectedExpedition.created_at)}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Summary Section */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal mb-1">Chiffre d'affaires brut</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">
                      {formatCurrency(selectedExpedition.accounting_details?.total_client_due)} <span className="text-xs text-slate-400">FCFA</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal mb-1">Statut Paiement</p>
                    <span className={`text-xs font-bold ${getStatusStyle(selectedExpedition.statut_paiement)}`}>
                      {getStatusLabel(selectedExpedition.statut_paiement)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section Frais */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-normal border-b border-slate-100 pb-2 flex items-center gap-2">
                    <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400" />
                    Détail des Frais
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Montant de base", val: selectedExpedition.montant_base },
                      { label: "Frais Enlèvement", val: selectedExpedition.frais_enlevement_domicile },
                      { label: "Frais Livraison", val: selectedExpedition.frais_livraison_domicile },
                      { label: "Frais Emballage", val: selectedExpedition.frais_emballage },
                      { label: "Autres Frais", val: selectedExpedition.frais_annexes }
                    ].filter(f => parseFloat(f.val || 0) > 0).map((f, i) => (
                      <div key={i} className="flex justify-between text-xs py-1">
                        <span className="text-slate-500 font-medium">{f.label}</span>
                        <span className="text-slate-900 font-mono">{formatCurrency(f.val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Commissions */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-normal border-b border-slate-100 pb-2 flex items-center gap-2">
                    <ReceiptPercentIcon className="w-3.5 h-3.5 text-blue-500" />
                    Répartition Revenus
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs py-1 border-b border-dashed border-slate-100">
                      <span className="text-blue-600 font-bold">Ma Part (Agence)</span>
                      <span className="text-blue-600 font-bold font-mono">{formatCurrency(selectedExpedition.accounting_details?.agence)}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-slate-600 font-medium">Commissions Système</span>
                      <span className="text-slate-900 font-mono">{formatCurrency(selectedExpedition.accounting_details?.backoffice)}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-slate-600 font-medium">Prestations Livreurs</span>
                      <span className="text-slate-900 font-mono">{formatCurrency(selectedExpedition.accounting_details?.livreur)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                     <UserIcon className="w-3 h-3" /> Expéditeur
                   </div>
                   <p className="text-sm font-bold text-slate-800 leading-tight">{selectedExpedition.expediteur?.nom_prenom}</p>
                   <p className="text-xs text-slate-500">{selectedExpedition.expediteur?.telephone || "Sans téléphone"}</p>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                     <MapPinIcon className="w-3 h-3" /> Destinataire
                   </div>
                   <p className="text-sm font-bold text-slate-800 leading-tight">{selectedExpedition.destinataire?.nom_prenom}</p>
                   <p className="text-xs text-slate-500">{selectedExpedition.destinataire?.ville}, {selectedExpedition.pays_destination}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comptabilite;
