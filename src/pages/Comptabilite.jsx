import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  ChevronRightIcon,
  InboxIcon,
  ArrowDownLeftIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";

const Comptabilite = () => {
  const navigate = useNavigate();
  const { data, summary, status, loadAccounting, lastFilters } = useAccounting();
  const { fetchAgencyData, data: agencyData } = useAgency();

  // Helper to get today's date in YYYY-MM-DD
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Helper to get first day of current month in YYYY-MM-DD
  const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  };

  const [dateDebut, setDateDebut] = useState(() => {
    const saved = sessionStorage.getItem('accounting_date_debut');
    return saved || lastFilters?.date_debut || getFirstDayOfMonth();
  });
  const [dateFin, setDateFin] = useState(() => {
    const saved = sessionStorage.getItem('accounting_date_fin');
    return saved || lastFilters?.date_fin || getTodayDate();
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedExpedition, setSelectedExpedition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (dateDebut) sessionStorage.setItem('accounting_date_debut', dateDebut);
    if (dateFin) sessionStorage.setItem('accounting_date_fin', dateFin);
    
    loadAccounting({
      date_debut: dateDebut,
      date_fin: dateFin
    });
  }, [dateDebut, dateFin, loadAccounting]);

  useEffect(() => {
    fetchAgencyData();
  }, [fetchAgencyData]);

  const formatDate = (dateString, showTime = false) => {
    if (!dateString) return "n/a";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(showTime && { hour: '2-digit', minute: '2-digit' })
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paye': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'en_attente': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
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

  const handleExportExcel = () => {
    setIsExportDropdownOpen(false);
    if (!filteredData || filteredData.length === 0) return;

    // Prepare data for Excel
    const dataToExport = filteredData.map(item => ({
      "Référence": item.reference,
      "Expéditeur": item.expediteur?.nom_prenom || "---",
      "Destinataire": item.destinataire?.nom_prenom || "---",
      "Montant Total (CFA)": item.accounting_details?.total_client_due || 0,
      "Commission Agence": item.accounting_details?.agence || 0,
      "Part Backoffice / HUB": item.accounting_details?.backoffice || 0,
      "Part Livreur": item.accounting_details?.livreur || 0,
      "Frais Base": item.montant_base || 0,
      "Enlèvement": item.frais_enlevement_domicile || 0,
      "Livraison": item.frais_livraison_domicile || 0,
      "Emballage": item.frais_emballage || 0,
      "Annexes/Assurance": item.frais_annexes || 0,
      "Statut Paiement": getStatusLabel(item.statut_paiement),
      "Date": formatDate(item.created_at, true)
    }));

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comptabilité");

    // Save File
    const fileName = `Export_Compta_${dateDebut}_au_${dateFin}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  const formatCurrencyForPDF = (amount) => {
    // Normal format might include non-breaking spaces that jsPDF doesn't like
    const formatted = new Intl.NumberFormat('fr-FR').format(amount || 0);
    return formatted.replace(/\s/g, ' '); // Replace any space (including non-breaking) with regular space
  };

  const handleExportPDF = async () => {
    setIsExportDropdownOpen(false);
    if (!filteredData || filteredData.length === 0) return;

    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // -- Header Section --
    // Header Dark Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Logo (if available)
    let logoBase64 = null;
    if (agencyData?.logo) {
      try {
        logoBase64 = await getBase64ImageFromURL(agencyData.logo);
      } catch (e) {
        console.error("Error loading logo for PDF", e);
      }
    }

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("RAPPORT COMPTABLE AGENCE", 40, 22);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(agencyData?.nom?.toUpperCase() || "TOUR SHOP", 40, 32);
    } else {
      // Title without logo offset
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("RAPPORT COMPTABLE AGENCE", 15, 22);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(agencyData?.nom?.toUpperCase() || "TOUR SHOP", 15, 32);
    }

    // Right Header Info
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    const dateText = `PERIODE : DU ${formatDate(dateDebut)} AU ${formatDate(dateFin)}`;
    const countryText = `PAYS : ${agencyData?.pays || "FRANCE"}`;
    const issueDate = `EDITE LE : ${formatDate(new Date())}`;
    
    doc.text(dateText, pageWidth - 15, 18, { align: 'right' });
    doc.text(countryText, pageWidth - 15, 26, { align: 'right' });
    doc.text(issueDate, pageWidth - 15, 34, { align: 'right' });

    // -- Summary Cards Section --
    // -- Summary Cards Section --
    const cardY = 55;
    const cardMargin = 4;
    const totalCardWidth = pageWidth - 30; // 180mm
    const cardWidth = (totalCardWidth - (3 * cardMargin)) / 4;
    const cardHeight = 28;

    const cards = [
      { label: "POTENTIEL (DO)", value: formatCurrencyForPDF(summary.potential?.total_client_due), sub: "CFA", color: [248, 250, 252], borderColor: [226, 232, 240] },
      { label: "PART BACKOFFICE", value: formatCurrencyForPDF(summary.potential?.total_backoffice), sub: "CFA", color: [30, 41, 59], textColor: [255, 255, 255], borderColor: [15, 23, 42] },
      { label: "PART AGENCE", value: formatCurrencyForPDF(summary.potential?.total_agence), sub: "CFA", color: [248, 250, 252], borderColor: [226, 232, 240] },
      { label: "VOL. EXPEDITIONS", value: `${filteredData.length}`, sub: "EXP.", color: [248, 250, 252], borderColor: [226, 232, 240] }
    ];

    cards.forEach((card, i) => {
      const x = 15 + i * (cardWidth + cardMargin);
      
      // Card BG
      doc.setFillColor(...card.color);
      doc.setDrawColor(...(card.borderColor || [226, 232, 240]));
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');
      
      // Card Label
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(card.textColor ? 200 : 100, card.textColor ? 200 : 116, card.textColor ? 200 : 139);
      doc.text(card.label, x + 6, cardY + 9);
      
      // Card Value
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(card.textColor ? 255 : 30, card.textColor ? 255 : 41, card.textColor ? 255 : 59);
      const valText = card.value;
      const metrics = doc.getTextDimensions(valText);
      doc.text(valText, x + 6, cardY + 20);
      
      // Card Sub (CFA / EXP)
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(card.sub, x + 6 + metrics.w + 2, cardY + 20);
    });

    // -- Table Section --
    const tableData = filteredData.map(item => [
      { content: item.reference + "\n" + (item.expediteur?.nom_prenom || "---"), styles: { fontStyle: 'normal' } },
      formatDate(item.created_at) + "\n" + (agencyData?.nom || "---"),
      { content: formatCurrencyForPDF(item.accounting_details?.total_client_due), styles: { halign: 'right', fontStyle: 'bold' } },
      { content: formatCurrencyForPDF(item.accounting_details?.backoffice), styles: { halign: 'right', fontStyle: 'bold' } },
      { content: formatCurrencyForPDF(item.accounting_details?.agence), styles: { halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] } },
      { content: formatCurrencyForPDF(item.accounting_details?.livreur), styles: { halign: 'right' } },
      `Exp: ${item.statut_paiement === 'paye' ? 'REGLE' : 'NON REGLE'}\nFrais: ${item.statut_paiement === 'paye' ? 'REGLE' : 'NON REGLE'}`
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['Expédition', 'Date / Agence', 'À Percevoir', 'Part Backoffice', 'Part Agence', 'Part Livreurs', 'État Règlements']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4,
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
        0: { cellWidth: 38 }, // Expédition
        1: { cellWidth: 26 }, // Date / Agence
        2: { cellWidth: 24, halign: 'right' }, // À Percevoir
        3: { cellWidth: 24, halign: 'right' }, // Part Backoffice
        4: { cellWidth: 24, halign: 'right' }, // Part Agence
        5: { cellWidth: 20, halign: 'right' }, // Part Livreurs
        6: { cellWidth: 24, fontSize: 6.5, textColor: [100, 116, 139] } // État
      },
      alternateRowStyles: {
        fillColor: [252, 254, 255]
      },
      margin: { left: 15, right: 15, bottom: 20 },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    });

    // Save PDF
    doc.save(`Rapport_Compta_${dateDebut}_au_${dateFin}.pdf`);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Comptabilité & Flux</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Analyse des revenus agence et répartition des commissions par période.</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className={`h-9 px-4 flex items-center gap-2 border rounded-md text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                isExportDropdownOpen 
                ? 'bg-slate-100 border-slate-300 text-slate-900' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              disabled={!filteredData || filteredData.length === 0}
            >
              <ArrowDownLeftIcon className={`w-3.5 h-3.5 rotate-45 transition-transform ${isExportDropdownOpen ? 'scale-110' : ''}`} />
              Exporter
              <ChevronDownIcon className={`w-3 h-3 ml-1 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-1">
                  <button
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                  >
                    <div className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-md">
                      <TableCellsIcon className="w-4 h-4" />
                    </div>
                    <span>Format Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
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
            onClick={() => navigate("/transactions")}
            className="h-9 px-4 flex items-center gap-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <BanknotesIcon className="w-4 h-4" />
            Historique
          </button>

          <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="flex items-center px-3 py-1.5 gap-2 border-r border-slate-100">
              <input
                type="date"
                className="text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="flex items-center px-3 py-1.5 gap-2 border-r border-slate-100">
              <input
                type="date"
                className="text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>
          
          <button
            onClick={() => loadAccounting({ date_debut: dateDebut, date_fin: dateFin }, true)}
            disabled={status === 'loading'}
            className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 text-slate-500 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            title="Actualiser les données"
          >
            <ArrowPathIcon className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Potentiel Stats */}
        {[
          { label: "Commission Agence (Total)", value: summary.potential?.total_agence, sub: "Déjà perçu + Attendue", color: "text-blue-600", bg: "bg-blue-50/50", icon: BuildingOfficeIcon, isMain: true },
          { label: "CA Client Global", value: summary.potential?.total_client_due, sub: "Montant total facturé", color: "text-slate-900", bg: "bg-slate-50", icon: ShoppingBagIcon },
          { label: "Réel Encaissé en Agence", value: summary.real?.total_cash_received, sub: "Physiquement perçu", color: "text-emerald-600", bg: "bg-emerald-50/50", icon: CheckCircleIcon, indicator: "bg-emerald-500" },
          { label: "Part Backoffice / HUB", value: summary.potential?.total_backoffice, sub: "Frais de service système", color: "text-slate-600", bg: "bg-slate-50", icon: BanknotesIcon }
        ].map((kpi, idx) => (
          <div key={idx} className={`p-4 rounded-lg border border-slate-200 bg-white shadow-sm relative overflow-hidden`}>
            {kpi.indicator && <div className={`absolute top-0 left-0 w-1 h-full ${kpi.indicator}`} />}
            <div className="flex justify-between items-start mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">{kpi.label}</p>
              <kpi.icon className={`w-4 h-4 ${kpi.color} opacity-40`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold tabular-nums ${kpi.color}`}>
                {formatCurrency(kpi.value)}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">CFA</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Combined Table Area */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        
        {/* Table Toolbar */}
        <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition-all font-medium"
              placeholder="Rechercher par référence, expéditeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center p-0.5 bg-white border border-slate-200 rounded-md shadow-xs">
            {['', 'paye', 'en_attente'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-[4px] text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === s 
                  ? 'bg-slate-100 text-slate-900 border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s === '' ? 'Tous les flux' : getStatusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Référence</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">CA Client</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Part Agence</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">HUB / Syst.</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Paiement</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Date</th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {status === 'loading' && filteredData.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan="7" className="px-5 py-5 animate-pulse"><div className="h-4 bg-slate-50 rounded" /></td></tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{item.reference}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{item.expediteur?.nom_prenom || "Client Standard"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-700 tabular-nums text-sm">
                      {formatCurrency(item.accounting_details?.total_client_due)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-blue-600 tabular-nums text-sm">
                      {formatCurrency(item.accounting_details?.agence)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-500 tabular-nums text-sm">
                      {formatCurrency(item.accounting_details?.backoffice)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getStatusStyle(item.statut_paiement)}`}>
                        {getStatusLabel(item.statut_paiement)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs font-medium text-slate-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-2 py-3.5 text-right">
                      <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-20 text-center">
                    <div className="opacity-40 flex flex-col items-center gap-2">
                       <InboxIcon className="w-8 h-8 text-slate-300" />
                       <p className="text-xs font-semibold">Aucun flux financier sur cette période</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Detail Modal */}
      {isModalOpen && selectedExpedition && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[1px]">
          <div 
            className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Détails comptables</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="flex justify-between items-end border-b border-slate-100 pb-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Encaissé</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(selectedExpedition.accounting_details?.total_client_due)} <span className="text-xs text-slate-400">CFA</span>
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border ${getStatusStyle(selectedExpedition.statut_paiement)}`}>
                  {getStatusLabel(selectedExpedition.statut_paiement)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase flex items-center gap-1.5 opacity-50">
                    <ReceiptPercentIcon className="w-3 h-3" /> Distribution
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-blue-600">
                      <span>Ma Part</span>
                      <span className="tabular-nums">{formatCurrency(selectedExpedition.accounting_details?.agence)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>HUB / Syst.</span>
                      <span className="tabular-nums">{formatCurrency(selectedExpedition.accounting_details?.backoffice)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Transport</span>
                      <span className="tabular-nums">{formatCurrency(selectedExpedition.accounting_details?.livreur)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase flex items-center gap-1.5 opacity-50">
                    <InformationCircleIcon className="w-3 h-3" /> Composition
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Base", val: selectedExpedition.montant_base },
                      { label: "Enlèvemt.", val: selectedExpedition.frais_enlevement_domicile },
                      { label: "Livraison", val: selectedExpedition.frais_livraison_domicile },
                      { label: "Emball.", val: selectedExpedition.frais_emballage },
                      { label: "Autres", val: selectedExpedition.frais_annexes }
                    ].filter(f => parseFloat(f.val || 0) > 0).map((f, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-slate-500">{f.label}</span>
                        <span className="text-slate-700 font-medium tabular-nums">{formatCurrency(f.val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                   <UserIcon className="w-3 h-3" /> Expéditeur: <span className="text-slate-700 ml-1">{selectedExpedition.expediteur?.nom_prenom}</span>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                   <MapPinIcon className="w-3 h-3" /> Destination: <span className="text-slate-700 ml-1">{selectedExpedition.pays_destination}</span>
                 </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-slate-900 text-white rounded text-xs font-bold uppercase hover:bg-slate-800 transition-all">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comptabilite;
