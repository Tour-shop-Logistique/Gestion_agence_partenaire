import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  fetchTransactions, 
  selectTransactions, 
  selectTransactionsSummary, 
  selectTransactionsStatus 
} from '../store/slices/agencySlice';
import { useExpedition } from '../hooks/useExpedition';
import { toast } from '../utils/toast';
import { 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  BanknotesIcon,
  CalendarIcon,
  InboxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { RecordTransactionModal } from '../components/transaction';

const Transactions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recordTransaction } = useExpedition();
  
  const transactions = useSelector(selectTransactions);
  const summary = useSelector(selectTransactionsSummary);
  const status = useSelector(selectTransactionsStatus);

  // Date states
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  };

  const [dateDebut, setDateDebut] = useState(getFirstDayOfMonth());
  const [dateFin, setDateFin] = useState(getTodayDate());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions({ date_debut: dateDebut, date_fin: dateFin }));
  }, [dispatch, dateDebut, dateFin]);

  const handleRefresh = () => {
    dispatch(fetchTransactions({ date_debut: dateDebut, date_fin: dateFin }));
  };

  const handleNewTransactionSubmit = async (transactionData) => {
    try {
      const resultAction = await recordTransaction(transactionData);
      
      // Vérifier si l'action a réussi
      if (resultAction.type && resultAction.type.endsWith('/fulfilled')) {
        toast.success('Transaction enregistrée avec succès');
        setIsNewTransactionModalOpen(false);
        // Rafraîchir la liste après un court délai
        setTimeout(() => {
          handleRefresh();
        }, 500);
      } else {
        // L'action a été rejetée
        const errorMessage = resultAction.payload || resultAction.error?.message || 'Erreur lors de l\'enregistrement';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      const errorMessage = error.message || 'Erreur lors de l\'enregistrement de la transaction';
      toast.error(errorMessage);
      throw error; // Re-throw pour que le modal puisse gérer l'erreur
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "n/a";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportExcel = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;

    // Prepare data for Excel
    const dataToExport = filteredTransactions.map(t => ({
      "Type": t.type === 'encaissement' ? 'Entrée' : 'Sortie',
      "Objet": t.payment_object?.replace(/_/g, ' ') || '---',
      "Référence Transaction": t.reference || '---',
      "Référence Expédition": t.expedition?.reference || '---',
      "Client / Partenaire": t.expedition?.expediteur?.nom_prenom || t.user?.nom || '---',
      "Mode de Paiement": t.payment_method === 'cash' ? 'Espèces' : t.payment_method?.replace(/_/g, ' '),
      "Montant": t.amount || 0,
      "Devise": t.currency || 'CFA',
      "Date": formatDate(t.recorded_at || t.created_at, true)
    }));

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Save File
    const fileName = `Transactions_${dateDebut}_au_${dateFin}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const filteredTransactions = useMemo(() => {
    let result = Array.isArray(transactions) ? transactions : [];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.reference?.toLowerCase().includes(q) ||
        t.expediteur?.nom_prenom?.toLowerCase().includes(q) ||
        t.expedition?.reference?.toLowerCase().includes(q) ||
        t.payment_object?.toLowerCase().includes(q)
      );
    }
    
    if (typeFilter !== "all") {
      result = result.filter(t => t.type === typeFilter);
    }
    
    return result;
  }, [transactions, searchQuery, typeFilter]);

  const stats = [
    { 
      label: "Entrées", 
      value: summary?.total_encaissements || 0, 
      icon: ArrowDownLeftIcon, 
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    { 
      label: "Sorties", 
      value: summary?.total_decaissements || 0, 
      icon: ArrowUpRightIcon, 
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    { 
      label: "Solde Net", 
      value: summary?.solde_net || 0, 
      icon: BanknotesIcon, 
      color: "text-slate-900",
      bg: "bg-slate-50",
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 bg-slate-50/30 min-h-screen">
      
      {/* Breadcrumbs / Back - Responsive */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
        <button onClick={() => navigate('/dashboard')} className="hover:text-slate-900 transition-colors hidden sm:inline">Tableau de bord</button>
        <ChevronRightIcon className="w-3 h-3 hidden sm:inline" />
        <span className="text-slate-900 font-medium">Transactions</span>
      </div>

      {/* Header - Responsive */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">Historique financier</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nouvelle Transaction Button */}
          <button
            onClick={() => setIsNewTransactionModalOpen(true)}
            className="h-8 sm:h-9 px-3 flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all shadow-sm active:scale-95 text-xs font-semibold"
          >
            <PlusIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">Nouvelle transaction</span>
            <span className="sm:hidden">Nouveau</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportExcel}
            className="h-8 sm:h-9 px-3 flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-all disabled:opacity-50 text-xs font-medium"
            disabled={!filteredTransactions || filteredTransactions.length === 0}
          >
            <ArrowDownLeftIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 rotate-45" />
            <span className="hidden sm:inline">Exporter</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={status === 'loading'}
            className="h-8 sm:h-9 px-3 flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-all disabled:opacity-50 text-xs font-medium"
          >
            <ArrowPathIcon className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          {/* Date Selector - Responsive */}
          <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden flex-1 sm:flex-none">
            <div className="flex items-center px-2 sm:px-3 py-1.5 gap-1 sm:gap-2 border-r border-slate-100">
              <CalendarIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 hidden sm:block" />
              <input
                type="date"
                className="text-[11px] sm:text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 p-0 w-full"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="flex items-center px-2 sm:px-3 py-1.5 gap-1 sm:gap-2">
              <input
                type="date"
                className="text-[11px] sm:text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 p-0 w-full"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-3 sm:p-4 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">{stat.label}</p>
                <div className="flex items-baseline gap-0.5 sm:gap-1 mt-1">
                  <span className={`text-base sm:text-xl font-semibold tabular-nums ${stat.color}`}>
                    {formatCurrency(stat.value)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">CFA</span>
                </div>
              </div>
              <div className={`p-1.5 sm:p-2 rounded-md ${stat.bg} flex-shrink-0`}>
                <stat.icon className={`w-3 sm:w-4 h-3 sm:h-4 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        
        {/* Table Toolbar - Responsive */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 flex flex-col gap-3 sm:gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-slate-300 transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center p-0.5 bg-slate-50 rounded-md border border-slate-200 overflow-x-auto">
            {[
              { id: 'all', label: 'Tout' },
              { id: 'encaissement', label: 'Entrées' },
              { id: 'decaissement', label: 'Sorties' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-[4px] text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                  typeFilter === type.id 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {status === 'loading' && filteredTransactions.length === 0 ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-3 animate-pulse space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
              </div>
            ))
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="p-3 hover:bg-slate-50/80 transition-colors active:scale-[0.99]"
              >
                {/* Header */}
                <div className="flex items-start gap-2 mb-2">
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                    t.type === 'encaissement' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {t.type === 'encaissement' ? <ArrowDownLeftIcon className="w-4 h-4" /> : <ArrowUpRightIcon className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-medium text-slate-900 truncate">
                        {t.payment_object?.replace(/_/g, ' ')?.charAt(0).toUpperCase() + t.payment_object?.replace(/_/g, ' ')?.slice(1) || 'Paiement'}
                      </span>
                      {t.reference && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded flex-shrink-0">
                          #{t.reference}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{t.payment_method === 'cash' ? '💵 Espèces' : `📱 ${t.payment_method?.replace(/_/g, ' ')}`}</span>
                      {t.expedition?.reference && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{t.expedition?.reference}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className={`text-sm font-semibold tabular-nums ${
                      t.type === 'encaissement' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {t.type === 'encaissement' ? '+' : '-'}{new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(t.amount)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">CFA</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-medium text-slate-700 truncate">
                      {t.expedition?.expediteur?.nom_prenom || t.user?.nom || '---'}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate">
                      {t.expedition?.pays_destination || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {formatDate(t.recorded_at || t.created_at).split(' ')[0]}
                    </span>
                    {t.expedition_id && (
                      <button 
                        onClick={() => navigate(`/expeditions/${t.expedition_id}`)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors"
                      >
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center opacity-40">
                <InboxIcon className="w-8 h-8 text-slate-400" />
                <p className="text-xs mt-2 font-medium">Aucune donnée</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center w-12">Flux</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Objet & Détails</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Référence Expéd.</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Partenaire / Client</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Date & Heure</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Montant</th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {status === 'loading' && filteredTransactions.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7" className="px-4 py-4">
                      <div className="h-4 bg-slate-50 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center">
                      <div className={`w-7 h-7 rounded mx-auto flex items-center justify-center ${
                        t.type === 'encaissement' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {t.type === 'encaissement' ? <ArrowDownLeftIcon className="w-3.5 h-3.5" /> : <ArrowUpRightIcon className="w-3.5 h-3.5" />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 leading-none">
                          {t.payment_object?.replace(/_/g, ' ')?.charAt(0).toUpperCase() + t.payment_object?.replace(/_/g, ' ')?.slice(1) || 'Paiement'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            {t.payment_method === 'cash' ? '💵 Espèces' : `📱 ${t.payment_method?.replace(/_/g, ' ')}`}
                          </span>
                          {t.reference && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded">
                              #{t.reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {t.expedition?.reference || '---'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">
                          {t.expedition?.expediteur?.nom_prenom || t.user?.nom || '---'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          {t.expedition?.pays_destination || 'Destination non spécifiée'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs text-slate-600 font-medium">
                        {formatDate(t.recorded_at || t.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-semibold tabular-nums ${
                          t.type === 'encaissement' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {t.type === 'encaissement' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">CFA</span>
                      </div>
                    </td>
                    <td className="px-2 py-3.5 text-right">
                      <button 
                        onClick={() => navigate(`/expeditions/${t.expedition_id}`)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors"
                        title="Détails de l'expédition"
                      >
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <InboxIcon className="w-8 h-8 text-slate-400" />
                      <p className="text-xs mt-2 font-medium">Aucune donnée sur cette période</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
             Système audité en temps réel
           </div>
           <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-emerald-100 border border-emerald-200" />
                <span>Encaissement</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-rose-100 border border-rose-200" />
                <span>Décaissement</span>
              </div>
           </div>
        </div>
      </div>

      {/* Modal de nouvelle transaction */}
      <RecordTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        onSubmit={handleNewTransactionSubmit}
        expeditionId="" // Vide pour une transaction générale
        expeditionReference=""
        defaultAmount={0}
        defaultType="encaissement"
        defaultObject="autre"
      />
    </div>
  );
};

export default Transactions;
