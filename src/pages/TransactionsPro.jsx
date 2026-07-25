import { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  fetchTransactions, 
  selectTransactions, 
  selectTransactionsSummary, 
  selectTransactionsStatus 
} from '../store/slices/agencySlice';
import { useExpedition } from '../hooks/useExpedition';
import { useAgency } from '../hooks/useAgency';
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
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  ScaleIcon,
  ChevronDownIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RecordTransactionModal } from '../components/transaction';

const TransactionsPro = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recordTransaction } = useExpedition();
  const { fetchAgencyData, data: agencyData } = useAgency();
  
  const transactions = useSelector(selectTransactions);
  const summary = useSelector(selectTransactionsSummary);
  const status = useSelector(selectTransactionsStatus);

  // Helper functions
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  };

  // États principaux
  const [dateDebut, setDateDebut] = useState(getFirstDayOfMonth());
  const [dateFin, setDateFin] = useState(getTodayDate());
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard | journal | analyses
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // États des filtres avancés
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // all | encaissement | decaissement
    statut: 'all', // all | validee | en_attente | annulee | remboursee
    categorie: 'all',
    payment_method: 'all',
    montant_min: '',
    montant_max: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Charger les données
  useEffect(() => {
    dispatch(fetchTransactions({ date_debut: dateDebut, date_fin: dateFin }));
    fetchAgencyData();
  }, [dispatch, dateDebut, dateFin, fetchAgencyData]);

  // Fermer dropdown export au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    dispatch(fetchTransactions({ date_debut: dateDebut, date_fin: dateFin }));
    toast.success('Données actualisées');
  };

  // Gestion nouvelle transaction
  const handleNewTransactionSubmit = async (transactionData) => {
    try {
      const resultAction = await recordTransaction(transactionData);
      
      if (resultAction.type && resultAction.type.endsWith('/fulfilled')) {
        toast.success('Transaction enregistrée avec succès');
        setIsNewTransactionModalOpen(false);
        setTimeout(() => handleRefresh(), 500);
      } else {
        const errorMessage = resultAction.payload || resultAction.error?.message || 'Erreur lors de l\'enregistrement';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
      throw error;
    }
  };

  // Formattage
  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0);
  
  const formatDate = (dateString, showTime = false) => {
    if (!dateString) return "n/a";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(showTime && { hour: '2-digit', minute: '2-digit' })
    });
  };

  // Catégories prédéfinies
  const categories = [
    { value: 'expedition', label: 'Expédition', icon: '📦', color: 'blue' },
    { value: 'livraison', label: 'Livraison', icon: '🚚', color: 'green' },
    { value: 'emballage', label: 'Emballage', icon: '📦', color: 'purple' },
    { value: 'reversement_hub', label: 'Reversement HUB', icon: '🏢', color: 'orange' },
    { value: 'fournitures', label: 'Fournitures', icon: '✏️', color: 'pink' },
    { value: 'carburant', label: 'Carburant', icon: '⛽', color: 'red' },
    { value: 'salaire', label: 'Salaire', icon: '💼', color: 'emerald' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'yellow' },
    { value: 'admin', label: 'Admin', icon: '📄', color: 'gray' },
    { value: 'divers', label: 'Divers', icon: '🔀', color: 'slate' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Espèces', icon: '💵' },
    { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
    { value: 'bank_transfer', label: 'Virement', icon: '🏦' },
    { value: 'carte_bancaire', label: 'Carte', icon: '💳' },
    { value: 'other', label: 'Autre', icon: '❓' }
  ];

  // Transactions filtrées
  const filteredTransactions = useMemo(() => {
    let result = Array.isArray(transactions) ? [...transactions] : [];
    
    // Filtre de recherche
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.reference?.toLowerCase().includes(q) ||
        t.expedition?.reference?.toLowerCase().includes(q) ||
        t.expedition?.expediteur?.nom_prenom?.toLowerCase().includes(q) ||
        t.payment_object?.toLowerCase().includes(q)
      );
    }
    
    // Filtre type
    if (filters.type !== 'all') {
      result = result.filter(t => t.type === filters.type);
    }
    
    // Filtre statut (à implémenter côté backend)
    if (filters.statut !== 'all') {
      result = result.filter(t => t.statut === filters.statut);
    }
    
    // Filtre catégorie (à implémenter côté backend)
    if (filters.categorie !== 'all') {
      result = result.filter(t => t.categorie === filters.categorie);
    }
    
    // Filtre moyen de paiement
    if (filters.payment_method !== 'all') {
      result = result.filter(t => t.payment_method === filters.payment_method);
    }
    
    // Filtre montant min
    if (filters.montant_min && parseFloat(filters.montant_min) > 0) {
      result = result.filter(t => t.amount >= parseFloat(filters.montant_min));
    }
    
    // Filtre montant max
    if (filters.montant_max && parseFloat(filters.montant_max) > 0) {
      result = result.filter(t => t.amount <= parseFloat(filters.montant_max));
    }
    
    // Trier par date décroissante
    result.sort((a, b) => {
      const dateA = new Date(a.recorded_at || a.created_at);
      const dateB = new Date(b.recorded_at || b.created_at);
      return dateB - dateA;
    });
    
    return result;
  }, [transactions, searchQuery, filters]);

  // Calcul du solde courant
  const transactionsWithBalance = useMemo(() => {
    let balance = 0;
    return filteredTransactions.map(t => {
      const amount = t.type === 'encaissement' ? +t.amount : -t.amount;
      balance += amount;
      return { ...t, running_balance: balance };
    });
  }, [filteredTransactions]);

  // 📊 NOUVEAUX KPI FINANCIERS
  const financialKPIs = useMemo(() => {
    const encaissements = filteredTransactions.filter(t => t.type === 'encaissement');
    const decaissements = filteredTransactions.filter(t => t.type === 'decaissement');
    
    const totalEncaissements = encaissements.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalDecaissements = decaissements.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const soldeCaisse = totalEncaissements - totalDecaissements;
    
    const nombreTransactions = {
      total: filteredTransactions.length,
      encaissements: encaissements.length,
      decaissements: decaissements.length
    };
    
    const moyenneEncaissement = encaissements.length > 0 
      ? totalEncaissements / encaissements.length 
      : 0;
    const moyenneDecaissement = decaissements.length > 0 
      ? totalDecaissements / decaissements.length 
      : 0;
    
    const plusGrosEncaissement = encaissements.length > 0 
      ? Math.max(...encaissements.map(t => t.amount || 0))
      : 0;
    const plusGrosDecaissement = decaissements.length > 0 
      ? Math.max(...decaissements.map(t => t.amount || 0))
      : 0;
    
    return {
      soldeCaisse,
      totalEncaissements,
      totalDecaissements,
      nombreTransactions,
      moyenneEncaissement,
      moyenneDecaissement,
      plusGrosEncaissement,
      plusGrosDecaissement
    };
  }, [filteredTransactions]);

  // 📊 Statistiques par moyen de paiement
  const paymentMethodStats = useMemo(() => {
    const stats = {};
    filteredTransactions.forEach(t => {
      const method = t.payment_method || 'other';
      if (!stats[method]) {
        stats[method] = { count: 0, total: 0, method };
      }
      stats[method].count++;
      stats[method].total += t.amount || 0;
    });
    
    return Object.values(stats).map(stat => ({
      ...stat,
      label: paymentMethods.find(pm => pm.value === stat.method)?.label || stat.method,
      icon: paymentMethods.find(pm => pm.value === stat.method)?.icon || '❓',
      percentage: filteredTransactions.length > 0 
        ? (stat.count / filteredTransactions.length * 100).toFixed(1)
        : 0
    }));
  }, [filteredTransactions]);

  // 📊 Données pour le graphique circulaire des moyens de paiement
  const paymentPieData = useMemo(() => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];
    return paymentMethodStats.map((stat, index) => ({
      name: stat.label,
      value: stat.total,
      count: stat.count,
      color: colors[index % colors.length]
    }));
  }, [paymentMethodStats]);

  // 🔔 Système d'alertes
  const alerts = useMemo(() => {
    const alertList = [];
    
    // Solde négatif
    if (financialKPIs.soldeCaisse < 0) {
      alertList.push({
        type: 'critical',
        icon: ExclamationTriangleIcon,
        message: 'Solde de caisse négatif',
        value: formatCurrency(financialKPIs.soldeCaisse) + ' CFA'
      });
    }
    
    // Transaction inhabituelle (> 3x la moyenne)
    const transactionsUnusuelles = filteredTransactions.filter(t => 
      t.amount > (financialKPIs.moyenneEncaissement * 3) && t.type === 'encaissement'
    );
    if (transactionsUnusuelles.length > 0) {
      alertList.push({
        type: 'warning',
        icon: BellAlertIcon,
        message: `${transactionsUnusuelles.length} transaction(s) inhabituellement élevée(s)`,
        value: 'Vérification recommandée'
      });
    }
    
    // Décaissement élevé
    const decaissementsEleves = filteredTransactions.filter(t => 
      t.amount > 100000 && t.type === 'decaissement'
    );
    if (decaissementsEleves.length > 0) {
      alertList.push({
        type: 'warning',
        icon: ArrowTrendingDownIcon,
        message: `${decaissementsEleves.length} décaissement(s) important(s)`,
        value: '> 100 000 CFA'
      });
    }
    
    // Transactions sans référence expédition (simulation - à adapter)
    const sansReference = filteredTransactions.filter(t => !t.expedition_id);
    if (sansReference.length > 5) {
      alertList.push({
        type: 'info',
        icon: InformationCircleIcon,
        message: `${sansReference.length} transactions sans référence d'expédition`,
        value: 'Documentation incomplète'
      });
    }
    
    return alertList;
  }, [filteredTransactions, financialKPIs]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return transactionsWithBalance.slice(startIndex, endIndex);
  }, [transactionsWithBalance, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(transactionsWithBalance.length / itemsPerPage);

  // 📥 Export Excel professionnel
  const handleExportExcel = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;

    const dataToExport = filteredTransactions.map((t, index) => ({
      "#": index + 1,
      "Date": formatDate(t.recorded_at || t.created_at, true),
      "Type": t.type === 'encaissement' ? 'Entrée' : 'Sortie',
      "Référence": t.reference || '---',
      "Catégorie": t.categorie || 'Non catégorisé',
      "Objet": t.payment_object?.replace(/_/g, ' ') || '---',
      "Mode Paiement": t.payment_method === 'cash' ? 'Espèces' : t.payment_method?.replace(/_/g, ' '),
      "Montant": t.amount || 0,
      "Devise": t.currency || 'CFA',
      "Référence Expédition": t.expedition?.reference || '---',
      "Client": t.expedition?.expediteur?.nom_prenom || '---',
      "Destination": t.expedition?.pays_destination || '---'
    }));

    // Ajouter une ligne de synthèse
    dataToExport.push({
      "#": "",
      "Date": "SYNTHÈSE PÉRIODE",
      "Type": "",
      "Référence": "",
      "Catégorie": "",
      "Objet": "",
      "Mode Paiement": "",
      "Montant": "",
      "Devise": "",
      "Référence Expédition": "",
      "Client": "",
      "Destination": ""
    });
    
    dataToExport.push({
      "#": "",
      "Date": "Total Encaissements",
      "Montant": financialKPIs.totalEncaissements,
      "Devise": "CFA"
    });
    
    dataToExport.push({
      "#": "",
      "Date": "Total Décaissements",
      "Montant": financialKPIs.totalDecaissements,
      "Devise": "CFA"
    });
    
    dataToExport.push({
      "#": "",
      "Date": "Solde Net",
      "Montant": financialKPIs.soldeCaisse,
      "Devise": "CFA"
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const fileName = `Transactions_Professionnelles_${dateDebut}_au_${dateFin}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Export Excel généré avec succès');
  };

  // 📄 Export PDF professionnel
  const handleExportPDF = async () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;

    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("RAPPORT TRANSACTIONS FINANCIÈRES", 15, 22);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(agencyData?.nom?.toUpperCase() || "TOUR SHOP", 15, 32);

    // Infos période
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(`PÉRIODE : DU ${formatDate(dateDebut)} AU ${formatDate(dateFin)}`, pageWidth - 15, 18, { align: 'right' });
    doc.text(`PAYS : ${agencyData?.pays || "FRANCE"}`, pageWidth - 15, 26, { align: 'right' });
    doc.text(`ÉDITÉ LE : ${formatDate(new Date(), true)}`, pageWidth - 15, 34, { align: 'right' });

    // Cartes KPI
    const cardY = 55;
    const cardMargin = 4;
    const totalCardWidth = pageWidth - 30;
    const cardWidth = (totalCardWidth - (4 * cardMargin)) / 5;
    const cardHeight = 28;

    const cards = [
      { label: "ENCAISSEMENTS", value: formatCurrency(financialKPIs.totalEncaissements), sub: "CFA" },
      { label: "DÉCAISSEMENTS", value: formatCurrency(financialKPIs.totalDecaissements), sub: "CFA" },
      { label: "SOLDE NET", value: formatCurrency(financialKPIs.soldeCaisse), sub: "CFA" },
      { label: "TRANSACTIONS", value: `${financialKPIs.nombreTransactions.total}`, sub: "OPS" },
      { label: "MOYENNE ENC.", value: formatCurrency(Math.round(financialKPIs.moyenneEncaissement)), sub: "CFA" }
    ];

    cards.forEach((card, i) => {
      const x = 15 + i * (cardWidth + cardMargin);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');
      
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(card.label, x + 6, cardY + 9);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(card.value, x + 6, cardY + 20);
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const metrics = doc.getTextDimensions(card.value);
      doc.text(card.sub, x + 6 + metrics.w + 2, cardY + 20);
    });

    // Tableau des transactions
    const tableData = filteredTransactions.slice(0, 50).map((t, i) => [
      i + 1,
      formatDate(t.recorded_at || t.created_at, true),
      t.type === 'encaissement' ? 'ENTRÉE' : 'SORTIE',
      t.payment_object?.replace(/_/g, ' ').toUpperCase() || 'N/A',
      t.payment_method === 'cash' ? 'ESPÈCES' : t.payment_method?.replace(/_/g, ' ').toUpperCase(),
      formatCurrency(t.amount),
      t.expedition?.reference || '---'
    ]);

    autoTable(doc, {
      startY: 90,
      head: [['#', 'Date & Heure', 'Type', 'Objet', 'Mode Paiement', 'Montant (CFA)', 'Réf. Expéd.']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 30, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [252, 254, 255]
      },
      margin: { left: 15, right: 15, bottom: 20 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    });

    doc.save(`Rapport_Transactions_${dateDebut}_au_${dateFin}.pdf`);
    toast.success('Rapport PDF généré avec succès');
  };

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 bg-slate-50/30 min-h-screen">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => navigate('/dashboard')} className="hover:text-slate-900 transition-colors">
          Tableau de bord
        </button>
        <ChevronRightIcon className="w-3 h-3" />
        <span className="text-slate-900 font-medium">Transactions Professionnelles</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              💼 Gestion Financière
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Journal de trésorerie et analyses financières professionnelles
            </p>
          </div>
        </div>
        
        {/* Barre d'actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNewTransactionModalOpen(true)}
            className="h-9 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all shadow-sm active:scale-95 text-xs font-semibold"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nouvelle transaction</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className={`h-9 px-4 flex items-center gap-2 border rounded-md text-xs font-semibold transition-all shadow-sm ${
                isExportDropdownOpen 
                ? 'bg-slate-100 border-slate-300 text-slate-900' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Exporter</span>
              <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-1">
                  <button
                    onClick={() => { handleExportExcel(); setIsExportDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-md"
                  >
                    <div className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-md">
                      <TableCellsIcon className="w-4 h-4" />
                    </div>
                    <span>Format Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => { handleExportPDF(); setIsExportDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-md"
                  >
                    <div className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-600 rounded-md">
                      <DocumentArrowDownIcon className="w-4 h-4" />
                    </div>
                    <span>Rapport PDF (.pdf)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={status === 'loading'}
            className="h-9 px-4 flex items-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-all disabled:opacity-50 text-xs font-medium"
          >
            <ArrowPathIcon className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 px-4 flex items-center gap-2 rounded-md transition-all text-xs font-medium ${
              showFilters 
              ? 'bg-blue-50 border-2 border-blue-200 text-blue-700' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filtres avancés</span>
            {Object.values(filters).filter(f => f !== 'all' && f !== '').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                {Object.values(filters).filter(f => f !== 'all' && f !== '').length}
              </span>
            )}
          </button>

          <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden ml-auto">
            <div className="flex items-center px-3 py-2 gap-2 border-r border-slate-100">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                className="text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 p-0"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="flex items-center px-3 py-2 gap-2">
              <input
                type="date"
                className="text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 p-0"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Onglets de vue */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: Squares2X2Icon },
            { id: 'journal', label: 'Journal', icon: TableCellsIcon },
            { id: 'analyses', label: 'Analyses', icon: ChartBarIcon }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${
                activeView === view.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <view.icon className="w-4 h-4" />
              <span>{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panneau de filtres avancés */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FunnelIcon className="w-4 h-4" />
              Filtres avancés
            </h3>
            <button
              onClick={() => setFilters({
                type: 'all',
                statut: 'all',
                categorie: 'all',
                payment_method: 'all',
                montant_min: '',
                montant_max: ''
              })}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tous</option>
                <option value="encaissement">Encaissements</option>
                <option value="decaissement">Décaissements</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Moyen de paiement</label>
              <select
                value={filters.payment_method}
                onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tous</option>
                {paymentMethods.map(pm => (
                  <option key={pm.value} value={pm.value}>{pm.icon} {pm.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Catégorie</label>
              <select
                value={filters.categorie}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="all">Toutes</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Montant minimum</label>
              <input
                type="number"
                value={filters.montant_min}
                onChange={(e) => setFilters({ ...filters, montant_min: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Montant maximum</label>
              <input
                type="number"
                value={filters.montant_max}
                onChange={(e) => setFilters({ ...filters, montant_max: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
                placeholder="Illimité"
              />
            </div>

            <div className="flex items-end">
              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                <strong className="text-slate-900">{filteredTransactions.length}</strong> résultat(s) trouvé(s)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 VUE TABLEAU DE BORD */}
      {activeView === 'dashboard' && (
        <>
          {/* 🔔 Centre d'alertes */}
          {alerts.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BellAlertIcon className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-bold text-orange-900">Alertes Financières</h3>
                <span className="ml-auto px-2 py-0.5 bg-orange-600 text-white text-xs font-bold rounded-full">
                  {alerts.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border-2 ${
                      alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                      alert.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <alert.icon className={`w-5 h-5 flex-shrink-0 ${
                        alert.type === 'critical' ? 'text-red-600' :
                        alert.type === 'warning' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900">{alert.message}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{alert.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📊 Cartes KPI Principaux */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Solde de Caisse */}
            <div className={`p-4 rounded-lg border-2 ${
              financialKPIs.soldeCaisse >= 0 
              ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200' 
              : 'bg-gradient-to-br from-rose-50 to-white border-rose-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${
                  financialKPIs.soldeCaisse >= 0 ? 'bg-emerald-100' : 'bg-rose-100'
                }`}>
                  <ScaleIcon className={`w-5 h-5 ${
                    financialKPIs.soldeCaisse >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`} />
                </div>
                {financialKPIs.soldeCaisse >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <p className="text-xs font-medium text-slate-500 mb-1">Solde de Caisse</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${
                  financialKPIs.soldeCaisse >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {formatCurrency(Math.abs(financialKPIs.soldeCaisse))}
                </span>
                <span className="text-xs text-slate-400 font-medium">CFA</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {financialKPIs.soldeCaisse >= 0 ? 'Positif ✓' : 'Négatif ⚠️'}
              </p>
            </div>

            {/* Nombre de Transactions */}
            <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-100">
                  <CalculatorIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-1">Transactions</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-blue-600">
                  {financialKPIs.nombreTransactions.total}
                </span>
                <span className="text-xs text-slate-400 font-medium">OPS</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {financialKPIs.nombreTransactions.encaissements}↗ / {financialKPIs.nombreTransactions.decaissements}↘
              </p>
            </div>

            {/* Moyenne Encaissement */}
            <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <ArrowDownLeftIcon className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-1">Moy. Encaissement</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(Math.round(financialKPIs.moyenneEncaissement))}
                </span>
                <span className="text-xs text-slate-400 font-medium">CFA</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Par transaction
              </p>
            </div>

            {/* Plus Gros Encaissement */}
            <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-violet-50 to-white border-violet-200">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-violet-100">
                  <CurrencyDollarIcon className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-1">Max. Encaissement</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-violet-600">
                  {formatCurrency(financialKPIs.plusGrosEncaissement)}
                </span>
                <span className="text-xs text-slate-400 font-medium">CFA</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Transaction la plus élevée
              </p>
            </div>

            {/* Plus Gros Décaissement */}
            <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-orange-50 to-white border-orange-200">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-orange-100">
                  <ArrowUpRightIcon className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-1">Max. Décaissement</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(financialKPIs.plusGrosDecaissement)}
                </span>
                <span className="text-xs text-slate-400 font-medium">CFA</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Sortie la plus importante
              </p>
            </div>
          </div>

          {/* 💳 Statistiques par Moyen de Paiement */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-blue-600" />
              Répartition par Moyen de Paiement
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tableau */}
              <div className="space-y-2">
                {paymentMethodStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{stat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{stat.label}</p>
                        <p className="text-xs text-slate-500">{stat.count} transaction(s) • {stat.percentage}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(stat.total)}</p>
                      <p className="text-xs text-slate-400">CFA</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Graphique circulaire */}
              <div className="flex items-center justify-center">
                {paymentPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={paymentPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {paymentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value) + ' CFA'}
                        contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 py-12">
                    <InboxIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune donnée</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mini aperçu du journal */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Dernières Transactions</h3>
              <button
                onClick={() => setActiveView('journal')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir tout →
              </button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {paginatedTransactions.slice(0, 5).map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      t.type === 'encaissement' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {t.type === 'encaissement' ? (
                        <ArrowDownLeftIcon className="w-5 h-5" />
                      ) : (
                        <ArrowUpRightIcon className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {t.payment_object?.replace(/_/g, ' ') || 'Transaction'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(t.recorded_at || t.created_at, true)} • {
                          t.payment_method === 'cash' ? '💵' : '📱'
                        } {paymentMethods.find(pm => pm.value === t.payment_method)?.label}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        t.type === 'encaissement' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {t.type === 'encaissement' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-xs text-slate-400">CFA</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 📋 VUE JOURNAL */}
      {activeView === 'journal' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {/* Barre de recherche */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Rechercher par référence, client, expédition..."
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:bg-white focus:border-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tableau desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase text-center w-12">Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Date & Heure</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Objet</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Moyen</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Référence</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase text-right">Montant</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase text-right">Solde après</th>
                  <th className="px-2 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {status === 'loading' && paginatedTransactions.length === 0 ? (
                  Array(10).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="8" className="px-4 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center ${
                          t.type === 'encaissement' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {t.type === 'encaissement' ? (
                            <ArrowDownLeftIcon className="w-4 h-4" />
                          ) : (
                            <ArrowUpRightIcon className="w-4 h-4" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-700">
                          {formatDate(t.recorded_at || t.created_at, true)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-900">
                          {t.payment_object?.replace(/_/g, ' ') || 'Transaction'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-700">
                          {t.payment_method === 'cash' ? '💵' : '📱'} {
                            paymentMethods.find(pm => pm.value === t.payment_method)?.label
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-500">
                          {t.expedition?.reference || t.reference || '---'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-bold ${
                            t.type === 'encaissement' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {t.type === 'encaissement' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                          <span className="text-xs text-slate-400">CFA</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-bold ${
                            t.running_balance >= 0 ? 'text-slate-900' : 'text-rose-600'
                          }`}>
                            {formatCurrency(Math.abs(t.running_balance))}
                          </span>
                          <span className="text-xs text-slate-400">
                            {t.running_balance >= 0 ? '✓' : '⚠'}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => {
                            setSelectedTransaction(t);
                            setIsDrawerOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <InboxIcon className="w-12 h-12 text-slate-400" />
                        <p className="text-sm mt-2 font-medium">Aucune transaction sur cette période</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="lg:hidden divide-y divide-slate-100">
            {paginatedTransactions.map((t) => (
              <div key={t.id} className="p-4 active:bg-slate-50" onClick={() => {
                setSelectedTransaction(t);
                setIsDrawerOpen(true);
              }}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    t.type === 'encaissement' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {t.type === 'encaissement' ? (
                      <ArrowDownLeftIcon className="w-5 h-5" />
                    ) : (
                      <ArrowUpRightIcon className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {t.payment_object?.replace(/_/g, ' ') || 'Transaction'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(t.recorded_at || t.created_at, true)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                        {t.payment_method === 'cash' ? '💵' : '📱'}
                      </span>
                      {t.expedition?.reference && (
                        <span className="text-xs text-slate-500 font-mono">
                          {t.expedition.reference}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      t.type === 'encaissement' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {t.type === 'encaissement' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <p className="text-xs text-slate-400">CFA</p>
                    <p className={`text-xs font-medium mt-1 ${
                      t.running_balance >= 0 ? 'text-slate-600' : 'text-rose-600'
                    }`}>
                      Solde: {formatCurrency(Math.abs(t.running_balance))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-slate-200 rounded text-xs"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-xs text-slate-500">
                  {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, transactionsWithBalance.length)} sur {transactionsWithBalance.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ««
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <span className="px-3 py-1 text-xs font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📊 VUE ANALYSES */}
      {activeView === 'analyses' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
              Analyses Financières Détaillées
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Répartition Encaissements/Décaissements */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Répartition des flux</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Encaissements', value: financialKPIs.totalEncaissements, color: '#10b981' },
                        { name: 'Décaissements', value: financialKPIs.totalDecaissements, color: '#ef4444' }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value) + ' CFA'}
                      contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Statistiques comparatives */}
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs font-medium text-emerald-700 mb-1">Total Encaissements</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {formatCurrency(financialKPIs.totalEncaissements)} <span className="text-sm font-normal">CFA</span>
                  </p>
                  <p className="text-xs text-emerald-600 mt-2">
                    {financialKPIs.nombreTransactions.encaissements} opération(s)
                  </p>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-xs font-medium text-rose-700 mb-1">Total Décaissements</p>
                  <p className="text-2xl font-bold text-rose-900">
                    {formatCurrency(financialKPIs.totalDecaissements)} <span className="text-sm font-normal">CFA</span>
                  </p>
                  <p className="text-xs text-rose-600 mt-2">
                    {financialKPIs.nombreTransactions.decaissements} opération(s)
                  </p>
                </div>

                <div className={`p-4 border rounded-lg ${
                  financialKPIs.soldeCaisse >= 0 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-orange-50 border-orange-200'
                }`}>
                  <p className={`text-xs font-medium mb-1 ${
                    financialKPIs.soldeCaisse >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`}>
                    Solde Net
                  </p>
                  <p className={`text-2xl font-bold ${
                    financialKPIs.soldeCaisse >= 0 ? 'text-blue-900' : 'text-orange-900'
                  }`}>
                    {formatCurrency(Math.abs(financialKPIs.soldeCaisse))} <span className="text-sm font-normal">CFA</span>
                  </p>
                  <p className={`text-xs mt-2 ${
                    financialKPIs.soldeCaisse >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {financialKPIs.soldeCaisse >= 0 ? 'Situation saine ✓' : 'Attention requise ⚠'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Indicateurs de performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CalculatorIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Moyennes</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Moy. Encaissement</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {formatCurrency(Math.round(financialKPIs.moyenneEncaissement))} CFA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Moy. Décaissement</span>
                  <span className="text-sm font-bold text-rose-600">
                    {formatCurrency(Math.round(financialKPIs.moyenneDecaissement))} CFA
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Maximum</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Plus gros +</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {formatCurrency(financialKPIs.plusGrosEncaissement)} CFA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Plus gros -</span>
                  <span className="text-sm font-bold text-rose-600">
                    {formatCurrency(financialKPIs.plusGrosDecaissement)} CFA
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Période</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Du</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatDate(dateDebut)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Au</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatDate(dateFin)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nouvelle transaction */}
      <RecordTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        onSubmit={handleNewTransactionSubmit}
        expeditionId=""
        expeditionReference=""
        defaultAmount={0}
        defaultType="encaissement"
        defaultObject="autre"
      />

      {/* Drawer détails transaction (à implémenter) */}
      {isDrawerOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-slate-900">Détails Transaction</h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Type */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Type</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  selectedTransaction.type === 'encaissement' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-rose-100 text-rose-700'
                }`}>
                  {selectedTransaction.type === 'encaissement' ? (
                    <ArrowDownLeftIcon className="w-4 h-4" />
                  ) : (
                    <ArrowUpRightIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {selectedTransaction.type === 'encaissement' ? 'Encaissement' : 'Décaissement'}
                  </span>
                </div>
              </div>

              {/* Montant */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Montant</p>
                <p className={`text-2xl font-bold ${
                  selectedTransaction.type === 'encaissement' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {selectedTransaction.type === 'encaissement' ? '+' : '-'}
                  {formatCurrency(selectedTransaction.amount)} CFA
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Date & Heure</p>
                <p className="text-sm text-slate-900">
                  {formatDate(selectedTransaction.recorded_at || selectedTransaction.created_at, true)}
                </p>
              </div>

              {/* Moyen de paiement */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Moyen de paiement</p>
                <p className="text-sm text-slate-900">
                  {selectedTransaction.payment_method === 'cash' ? '💵' : '📱'}{' '}
                  {paymentMethods.find(pm => pm.value === selectedTransaction.payment_method)?.label}
                </p>
              </div>

              {/* Objet */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Objet</p>
                <p className="text-sm text-slate-900">
                  {selectedTransaction.payment_object?.replace(/_/g, ' ') || 'Non spécifié'}
                </p>
              </div>

              {/* Référence */}
              {selectedTransaction.reference && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Référence</p>
                  <p className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">
                    {selectedTransaction.reference}
                  </p>
                </div>
              )}

              {/* Expédition */}
              {selectedTransaction.expedition && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Expédition liée</p>
                  <button
                    onClick={() => navigate(`/expeditions/${selectedTransaction.expedition_id}`)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedTransaction.expedition.reference} →
                  </button>
                </div>
              )}

              {/* Solde après opération */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Solde après opération</p>
                <p className={`text-lg font-bold ${
                  selectedTransaction.running_balance >= 0 ? 'text-slate-900' : 'text-rose-600'
                }`}>
                  {formatCurrency(Math.abs(selectedTransaction.running_balance))} CFA
                  <span className="text-sm ml-2">
                    {selectedTransaction.running_balance >= 0 ? '✓' : '⚠'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPro;
