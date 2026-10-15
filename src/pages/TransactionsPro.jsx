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
import { getCurrencyLabel } from '../utils/format';
import { toast } from '../utils/toast';
import { 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ArrowRightIcon,
  BanknotesIcon,
  InboxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  InformationCircleIcon,
  CalculatorIcon,
  ScaleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RecordTransactionModal } from '../components/transaction';
import PageHeader from '../components/ui/PageHeader';
import { getCountryName } from '../utils/countries';

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
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // États des filtres - menus déroulants directement au niveau du tableau
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
        value: formatCurrency(financialKPIs.soldeCaisse) + ' ' + getCurrencyLabel()
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
        value: `> 100 000 ${getCurrencyLabel()}`
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
      "Devise": t.currency || getCurrencyLabel(),
      "Référence Expédition": t.expedition?.reference || '---',
      "Client": t.expedition?.expediteur?.nom_prenom || '---',
      "Destination": getCountryName(t.expedition?.code_pays_destination) || t.expedition?.pays_destination || '---'
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
      "Devise": getCurrencyLabel()
    });

    dataToExport.push({
      "#": "",
      "Date": "Total Décaissements",
      "Montant": financialKPIs.totalDecaissements,
      "Devise": getCurrencyLabel()
    });

    dataToExport.push({
      "#": "",
      "Date": "Solde Net",
      "Montant": financialKPIs.soldeCaisse,
      "Devise": getCurrencyLabel()
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

    // Intl.NumberFormat('fr-FR') insère un espace fine insécable (U+202F)
    // entre les milliers - jsPDF/helvetica (police PDF standard, sans ce
    // glyphe) le rend comme un caractère cassé affiché "/" dans le PDF (ex.
    // "6 400" devenait "6/400"). Formatteur dédié au PDF avec un espace
    // normal, qu'helvetica sait afficher.
    const formatCurrencyPDF = (amount) => formatCurrency(amount).replace(/ | /g, ' ');

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
      { label: "ENCAISSEMENTS", value: formatCurrencyPDF(financialKPIs.totalEncaissements), sub: getCurrencyLabel() },
      { label: "DÉCAISSEMENTS", value: formatCurrencyPDF(financialKPIs.totalDecaissements), sub: getCurrencyLabel() },
      { label: "SOLDE NET", value: formatCurrencyPDF(financialKPIs.soldeCaisse), sub: getCurrencyLabel() },
      { label: "TRANSACTIONS", value: `${financialKPIs.nombreTransactions.total}`, sub: "OPS" },
      { label: "MOYENNE ENC.", value: formatCurrencyPDF(Math.round(financialKPIs.moyenneEncaissement)), sub: getCurrencyLabel() }
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
      formatCurrencyPDF(t.amount),
      t.expedition?.reference || '---'
    ]);

    autoTable(doc, {
      startY: 90,
      head: [['#', 'Date & Heure', 'Type', 'Objet', 'Mode Paiement', `Montant (${getCurrencyLabel()})`, 'Réf. Expéd.']],
      body: tableData,
      theme: 'grid',
      // Largeur totale fixée à la largeur de page utile (marges 15mm de
      // chaque côté) avec cellWidth 'auto' sur les colonnes variables :
      // jsPDF-autotable répartit l'espace restant entre elles plutôt que de
      // laisser le tableau plus étroit que la page (les largeurs fixes en
      // mm ne totalisaient que 195mm sur les ~267mm disponibles en paysage).
      tableWidth: pageWidth - 30,
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
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 'auto', halign: 'center' }
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
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Header - seule l'action principale (nouvelle transaction) reste sur
          la ligne du titre ; dates deplacees sur la ligne suivante a gauche,
          export/actualiser a droite de cette meme ligne. */}
      <PageHeader
        title="Gestion Financière"
        subtitle="Journal de trésorerie et analyses financières professionnelles"
        actions={
          <button
            onClick={() => setIsNewTransactionModalOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm active:scale-95 text-xs font-semibold"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle transaction</span>
          </button>
        }
      />

      <div className="space-y-4 sm:space-y-6">

        {/* Dates a gauche, actions secondaires (export/actualiser) a droite -
            plus de systeme d'onglets, tableau de bord et journal s'enchainent
            sur la meme page ; plus de "Filtres avances", les filtres sont
            desormais des menus deroulants au niveau du tableau. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5">
              <span className="text-[11px] sm:text-xs font-medium text-slate-400">Du</span>
              <input
                type="date"
                className="text-[11px] sm:text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer w-full"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5">
              <span className="text-[11px] sm:text-xs font-medium text-slate-400">au</span>
              <input
                type="date"
                className="text-[11px] sm:text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer w-full"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className={`h-8 sm:h-9 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border rounded-lg text-xs font-semibold transition-all shadow-sm ${
                  isExportDropdownOpen
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-1">
                    <button
                      onClick={() => { handleExportExcel(); setIsExportDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <div className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg">
                        <TableCellsIcon className="w-4 h-4" />
                      </div>
                      <span>Format Excel (.xlsx)</span>
                    </button>
                    <button
                      onClick={() => { handleExportPDF(); setIsExportDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <div className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-600 rounded-lg">
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
              className="h-8 sm:h-9 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 text-xs font-medium"
            >
              <ArrowPathIcon className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🎯 TABLEAU DE BORD */}
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

          {/* 📊 Cartes KPI Principaux - même pattern que StatsCards.jsx
              (barre d'accent + icône + label/valeur sur fond blanc uni) plutôt
              que des cartes pleines dégradées, pour rester cohérent avec le
              reste de l'app. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Solde de Caisse */}
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg pl-3 pr-3 py-3 min-w-0">
              <span className={`self-stretch w-1 rounded-sm shrink-0 ${financialKPIs.soldeCaisse >= 0 ? 'bg-emerald-600' : 'bg-rose-600'}`} aria-hidden="true" />
              <ScaleIcon className={`w-8 h-8 shrink-0 ${financialKPIs.soldeCaisse >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide leading-snug">Solde de Caisse</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold tabular-nums leading-tight ${financialKPIs.soldeCaisse >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(Math.abs(financialKPIs.soldeCaisse))}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{getCurrencyLabel()}</span>
                </div>
              </div>
            </div>

            {/* Nombre de Transactions */}
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg pl-3 pr-3 py-3 min-w-0">
              <span className="self-stretch w-1 rounded-sm shrink-0 bg-blue-600" aria-hidden="true" />
              <CalculatorIcon className="w-8 h-8 shrink-0 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide leading-snug">Transactions</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-blue-600 tabular-nums leading-tight">
                    {financialKPIs.nombreTransactions.total}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Opérations</span>
                </div>
              </div>
            </div>

            {/* Total Encaissement */}
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg pl-3 pr-3 py-3 min-w-0">
              <span className="self-stretch w-1 rounded-sm shrink-0 bg-emerald-600" aria-hidden="true" />
              <ArrowDownLeftIcon className="w-8 h-8 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide leading-snug">Total Encaissement</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-emerald-600 tabular-nums leading-tight">
                    {formatCurrency(financialKPIs.totalEncaissements)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{getCurrencyLabel()}</span>
                </div>
              </div>
            </div>

            {/* Total Décaissement */}
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg pl-3 pr-3 py-3 min-w-0">
              <span className="self-stretch w-1 rounded-sm shrink-0 bg-orange-600" aria-hidden="true" />
              <ArrowUpRightIcon className="w-8 h-8 shrink-0 text-orange-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide leading-snug">Total Décaissement</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-orange-600 tabular-nums leading-tight">
                    {formatCurrency(financialKPIs.totalDecaissements)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{getCurrencyLabel()}</span>
                </div>
              </div>
            </div>
          </div>

      </>

      {/* 📋 JOURNAL DES TRANSACTIONS */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {/* Barre de recherche + filtres (catégorie, moyen de paiement,
              type d'opération) directement au niveau du tableau - remplace
              l'ancien panneau "Filtres avancés" et l'ancien bloc
              "Répartition par moyen de paiement". */}
          <div className="px-4 py-3 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par référence, client, expédition..."
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-300"
              >
                <option value="all">Type : Tous</option>
                <option value="encaissement">Encaissements</option>
                <option value="decaissement">Décaissements</option>
              </select>

              <select
                value={filters.payment_method}
                onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-300"
              >
                <option value="all">Moyen : Tous</option>
                {paymentMethods.map(pm => (
                  <option key={pm.value} value={pm.value}>{pm.icon} {pm.label}</option>
                ))}
              </select>

              <select
                value={filters.categorie}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-300"
              >
                <option value="all">Catégorie : Toutes</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>

              {Object.values(filters).some(f => f !== 'all' && f !== '') && (
                <button
                  onClick={() => setFilters({
                    type: 'all',
                    statut: 'all',
                    categorie: 'all',
                    payment_method: 'all',
                    montant_min: '',
                    montant_max: ''
                  })}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  Réinitialiser
                </button>
              )}
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
                    <tr
                      key={t.id}
                      onClick={() => { setSelectedTransaction(t); setIsDrawerOpen(true); }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
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
                        <span className={`text-sm font-bold ${
                          t.type === 'encaissement' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {t.type === 'encaissement' ? '+' : '-'}{formatCurrency(t.amount)}
                          <span className="text-xs font-medium text-slate-400 ml-1">{getCurrencyLabel()}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-bold ${
                            t.running_balance >= 0 ? 'text-slate-900' : 'text-rose-600'
                          }`}>
                            {formatCurrency(Math.abs(t.running_balance))}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <ChevronRightIcon className="w-4 h-4 text-slate-400" />
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
                    <p className="text-xs text-slate-400">{getCurrencyLabel()}</p>
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

      {/* Drawer détails transaction */}
      {isDrawerOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête coloré type ticket : montant en évidence, type en badge */}
            <div className={`sticky top-0 p-5 pb-6 text-white ${
              selectedTransaction.type === 'encaissement'
              ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
              : 'bg-gradient-to-br from-rose-600 to-rose-700'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm">
                  {selectedTransaction.type === 'encaissement' ? (
                    <ArrowDownLeftIcon className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRightIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="text-xs font-semibold">
                    {selectedTransaction.type === 'encaissement' ? 'Encaissement' : 'Décaissement'}
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs font-medium text-white/70 mb-1">Montant</p>
              <p className="text-3xl font-bold tracking-tight text-white">
                {selectedTransaction.type === 'encaissement' ? '+' : '-'}
                {formatCurrency(selectedTransaction.amount)}
                <span className="text-lg font-semibold ml-1 text-white/80">{getCurrencyLabel()}</span>
              </p>
              <p className="text-xs text-white/70 mt-1">
                {formatDate(selectedTransaction.recorded_at || selectedTransaction.created_at, true)}
              </p>
            </div>

            {/* Corps : lignes label/valeur groupées dans une carte, pas de
                sections isolées empilées sans hiérarchie. */}
            <div className="p-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg divide-y divide-slate-200">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-medium text-slate-500">Moyen de paiement</span>
                  <span className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <span>{selectedTransaction.payment_method === 'cash' ? '💵' : '📱'}</span>
                    {paymentMethods.find(pm => pm.value === selectedTransaction.payment_method)?.label}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-medium text-slate-500">Objet</span>
                  <span className="text-sm font-semibold text-slate-900 text-right capitalize">
                    {selectedTransaction.payment_object?.replace(/_/g, ' ') || 'Non spécifié'}
                  </span>
                </div>

                {selectedTransaction.reference && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs font-medium text-slate-500">Référence</span>
                    <span className="text-xs font-mono font-semibold text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded">
                      {selectedTransaction.reference}
                    </span>
                  </div>
                )}

                {selectedTransaction.expedition && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs font-medium text-slate-500">Expédition liée</span>
                    <button
                      onClick={() => navigate(`/expeditions/${selectedTransaction.expedition_id}`)}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      {selectedTransaction.expedition.reference}
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Solde après opération - mis à part, c'est le résultat de
                  l'opération, pas une simple propriété au même niveau. */}
              <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-xs font-medium text-slate-500">Solde après opération</span>
                <span className={`text-base font-bold flex items-center gap-1.5 ${
                  selectedTransaction.running_balance >= 0 ? 'text-slate-900' : 'text-rose-600'
                }`}>
                  {formatCurrency(Math.abs(selectedTransaction.running_balance))} {getCurrencyLabel()}
                  {selectedTransaction.running_balance >= 0 ? (
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <span className="text-rose-500">⚠</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPro;
