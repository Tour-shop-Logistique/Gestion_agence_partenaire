import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useExpedition } from "../hooks/useExpedition";
import { useAgency } from "../hooks/useAgency";
import PrintSuccessModal from "../components/Receipts/PrintSuccessModal";
import { getLogoUrl } from "../utils/apiConfig";
import { formatPriceDual } from "../utils/format";
import { ArrowPathIcon, MagnifyingGlassIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import {
    SortableHeader,
    FiltersPanel
} from '../components/expeditions';

const Expeditions = () => {
    const navigate = useNavigate();
    const { expeditions, meta, loadExpeditions, status, lastFilters } = useExpedition();
    const { data: agencyData, fetchAgencyData } = useAgency();

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

    const [currentPage, setCurrentPage] = useState(lastFilters?.page || 1);

    const [dateDebut, setDateDebut] = useState(() => {
        const saved = sessionStorage.getItem('expeditions_date_debut');
        return saved || lastFilters?.date_debut || getFirstDayOfMonth();
    });
    const [dateFin, setDateFin] = useState(() => {
        const saved = sessionStorage.getItem('expeditions_date_fin');
        return saved || lastFilters?.date_fin || getTodayDate();
    });
    const [type, setType] = useState(""); // "" for all, "simple", "groupage"
    const [selectedExpedition, setSelectedExpedition] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Nouveaux états pour filtrage avancé et tri
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    useEffect(() => {
        if (dateDebut) sessionStorage.setItem('expeditions_date_debut', dateDebut);
        if (dateFin) sessionStorage.setItem('expeditions_date_fin', dateFin);
        
        loadExpeditions({
            page: currentPage,
            date_debut: dateDebut,
            date_fin: dateFin,
            type: type
        });
    }, [currentPage, dateDebut, dateFin, type, loadExpeditions]);

    useEffect(() => {
        fetchAgencyData();
    }, [fetchAgencyData]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (meta?.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const handlePrintReceipt = (expedition) => {
        setSelectedExpedition(expedition);
        setShowPrintModal(true);
    };

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    const resetAllFilters = () => {
        setSelectedStatuses([]);
        setSearchQuery('');
        setType('');
        setDateDebut(getFirstDayOfMonth());
        setDateFin(getTodayDate());
        setSortConfig({ key: null, direction: 'asc' });
        setCurrentPage(1);
    };

    const getStatusBorderColor = (status) => {
        switch (status) {
            case 'en_attente':
                return 'border-l-amber-400 hover:bg-amber-50/30';
            case 'accepted':
                return 'border-l-emerald-400 hover:bg-emerald-50/30';
            case 'refused':
                return 'border-l-red-400 hover:bg-red-50/30';
            case 'en_cours_enlevement':
            case 'en_cours_depot':
                return 'border-l-sky-400 hover:bg-sky-50/30';
            case 'recu_agence_depart':
                return 'border-l-blue-500 hover:bg-blue-50/30';
            case 'en_transit_entrepot':
                return 'border-l-indigo-400 hover:bg-indigo-50/30';
            case 'depart_expedition_succes':
                return 'border-l-indigo-500 hover:bg-indigo-50/30';
            case 'arrivee_expedition_succes':
            case 'recu_agence_destination':
                return 'border-l-purple-500 hover:bg-purple-50/30';
            case 'en_cours_livraison':
                return 'border-l-pink-500 hover:bg-pink-50/30';
            case 'termined':
            case 'delivered':
                return 'border-l-emerald-600 hover:bg-emerald-50/30';
            default:
                return 'border-l-slate-300 hover:bg-slate-50/30';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'en_attente':
                return 'bg-amber-50/80 text-amber-700 border-amber-200/50 shadow-amber-100/50';
            case 'accepted':
                return 'bg-emerald-50/80 text-emerald-700 border-emerald-200/50 shadow-emerald-100/50';
            case 'refused':
                return 'bg-red-50/80 text-red-700 border-red-200/50 shadow-red-100/50';
            case 'en_cours_enlevement':
            case 'en_cours_depot':
                return 'bg-sky-50/80 text-sky-700 border-sky-200/50 shadow-sky-100/50';
            case 'recu_agence_depart':
            case 'en_transit_entrepot':
                return 'bg-blue-50/80 text-blue-700 border-blue-200/50 shadow-blue-100/50';
            case 'depart_expedition_succes':
                return 'bg-indigo-50/80 text-indigo-700 border-indigo-200/50 shadow-indigo-100/50';
            case 'arrivee_expedition_succes':
            case 'recu_agence_destination':
                return 'bg-purple-50/80 text-purple-700 border-purple-200/50 shadow-purple-100/50';
            case 'en_cours_livraison':
                return 'bg-pink-50/80 text-pink-700 border-pink-200/50 shadow-pink-100/50';
            case 'termined':
            case 'delivered':
                return 'bg-emerald-100/80 text-emerald-800 border-emerald-200 shadow-emerald-100/50';
            default:
                return 'bg-slate-50/80 text-slate-700 border-slate-200/50 shadow-slate-100/50';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'en_attente': return 'En attente';
            case 'accepted': return 'Acceptée';
            case 'refused': return 'Refusée';
            case 'en_cours_enlevement': return 'En enlèvement';
            case 'en_cours_depot': return 'Dépôt en cours';
            case 'recu_agence_depart': return 'Reçu Agence Départ';
            case 'en_transit_entrepot': return 'Transit Entrepôt';
            case 'depart_expedition_succes': return 'En Transit (Air/Mer)';
            case 'arrivee_expedition_succes': return 'Arrivée Destination';
            case 'recu_agence_destination': return 'Reçu Agence Dest.';
            case 'en_cours_livraison': return 'En livraison';
            case 'termined':
            case 'delivered': return 'Terminée';
            default: return status?.replace(/_/g, ' ') || 'Inconnu';
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'simple':
                return 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100/50';
            case 'groupage_dhd_aerien':
                return 'bg-sky-50 text-sky-700 border-sky-200 shadow-sky-100/50';
            case 'groupage_dhd_maritine':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200 shadow-cyan-100/50';
            case 'groupage_afrique':
                return 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100/50';
            case 'groupage_ca':
                return 'bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100/50';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100/50';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'simple': return 'Simple';
            case 'groupage_dhd_aerien': return 'DHD Aérien';
            case 'groupage_dhd_maritine': return 'DHD Maritime';
            case 'groupage_afrique': return 'Afrique';
            case 'groupage_ca': return 'CA';
            default: return type || 'Inconnu';
        }
    };

    const getAgencyCommission = (exp) => {
        if (!exp.commission_details) return 0;
        const c = exp.commission_details;
        return (c.enlevement?.agence || 0) + 
               (c.livraison?.agence || 0) + 
               (c.emballage?.agence || 0) + 
               (c.retard?.agence || 0);
    };

    const formatCurrencyForPDF = (amount) => {
        const formatted = new Intl.NumberFormat('fr-FR').format(amount || 0);
        return formatted.replace(/\s/g, ' ');
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

    const handleExportPDF = async () => {
        if (!filteredExpeditions || filteredExpeditions.length === 0) return;

        const doc = new jsPDF({
            orientation: 'l',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Header Dark Background
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Logo
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
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text("RAPPORT EXPEDITIONS", 40, 22);
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(agencyData?.nom?.toUpperCase() || "TOUR SHOP", 40, 32);
        } else {
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text("RAPPORT EXPEDITIONS", 15, 22);
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(agencyData?.nom?.toUpperCase() || "TOUR SHOP", 15, 32);
        }

        // Right Header Info
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        const dateText = `PERIODE : DU ${formatDate(dateDebut).split(' ')[0]} AU ${formatDate(dateFin).split(' ')[0]}`;
        const countryText = `PAYS : ${agencyData?.pays || "FRANCE"}`;
        const issueDate = `EDITE LE : ${formatDate(new Date()).split(' ')[0]}`;
        
        doc.text(dateText, pageWidth - 15, 18, { align: 'right' });
        doc.text(countryText, pageWidth - 15, 26, { align: 'right' });
        doc.text(issueDate, pageWidth - 15, 34, { align: 'right' });

        // Summary Cards
        const cardY = 55;
        const cardMargin = 4;
        const totalCardWidth = pageWidth - 30;
        const cardWidth = (totalCardWidth - (2 * cardMargin)) / 3;
        const cardHeight = 28;

        const totalCommission = filteredExpeditions.reduce((sum, exp) => sum + getAgencyCommission(exp), 0);
        const totalMontant = filteredExpeditions.reduce((sum, exp) => sum + parseFloat(exp.montant_expedition || 0), 0);

        const cards = [
            { label: "TOTAL EXPEDITIONS", value: `${filteredExpeditions.length}`, sub: "EXP.", color: [248, 250, 252], borderColor: [226, 232, 240] },
            { label: "MONTANT TOTAL", value: formatCurrencyForPDF(totalMontant), sub: "CFA", color: [30, 41, 59], textColor: [255, 255, 255], borderColor: [15, 23, 42] },
            { label: "COMMISSION AGENCE", value: formatCurrencyForPDF(totalCommission), sub: "CFA", color: [239, 246, 255], borderColor: [191, 219, 254], textColor: [30, 64, 175] }
        ];

        cards.forEach((card, i) => {
            const x = 15 + i * (cardWidth + cardMargin);
            
            doc.setFillColor(...card.color);
            doc.setDrawColor(...(card.borderColor || [226, 232, 240]));
            doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');
            
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(card.textColor ? card.textColor[0] : 100, card.textColor ? card.textColor[1] : 116, card.textColor ? card.textColor[2] : 139);
            doc.text(card.label, x + 6, cardY + 9);
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(card.textColor ? card.textColor[0] : 30, card.textColor ? card.textColor[1] : 41, card.textColor ? card.textColor[2] : 59);
            const valText = card.value;
            const metrics = doc.getTextDimensions(valText);
            doc.text(valText, x + 6, cardY + 20);
            
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text(card.sub, x + 6 + metrics.w + 2, cardY + 20);
        });

        // Table Data
        const tableData = filteredExpeditions.map(exp => {
            // Format trajet vertical : Départ en haut, Arrivée en bas
            const trajet = `${exp.pays_depart || 'N/A'}\n↓\n${exp.pays_destination || 'N/A'}`;
            
            return [
                exp.reference,
                getTypeLabel(exp.type_expedition),
                trajet,
                exp.expediteur?.nom_prenom || "---",
                exp.destinataire?.nom_prenom || "---",
                formatCurrencyForPDF(exp.montant_expedition),
                formatCurrencyForPDF(getAgencyCommission(exp)),
                getStatusLabel(exp.statut_expedition)
            ];
        });

        autoTable(doc, {
            startY: 90,
            head: [['Référence', 'Type', 'Trajet', 'Expéditeur', 'Destinataire', 'Montant', 'Com. Agence', 'Statut']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 7.5,
                cellPadding: 3,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle',
                lineColor: [226, 232, 240],
                lineWidth: 0.1,
                minCellHeight: 12
            },
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 35, halign: 'left', fontStyle: 'bold', fontSize: 7 },
                1: { cellWidth: 25, halign: 'center', fontSize: 7 },
                2: { cellWidth: 45, halign: 'center', fontSize: 7, fontStyle: 'bold', valign: 'middle' },
                3: { cellWidth: 35, halign: 'left', fontSize: 7 },
                4: { cellWidth: 35, halign: 'left', fontSize: 7 },
                5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', fontSize: 7.5 },
                6: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235], fontSize: 7.5 },
                7: { cellWidth: 35, halign: 'center', fontSize: 6.5, textColor: [100, 116, 139] }
            },
            alternateRowStyles: {
                fillColor: [252, 254, 255]
            },
            margin: { left: 10, right: 10, bottom: 20 },
            tableWidth: 'auto',
            didDrawPage: (data) => {
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        });

        doc.save(`Rapport_Expeditions_${dateDebut}_au_${dateFin}.pdf`);
    };

    const filteredExpeditions = useMemo(() => {
        let result = expeditions;
        
        // 1. Filtre par type
        if (type) {
            result = result.filter(exp => exp.type_expedition === type);
        }
        
        // 2. Filtre par statut (NOUVEAU)
        if (selectedStatuses.length > 0) {
            result = result.filter(exp => selectedStatuses.includes(exp.statut_expedition));
        }
        
        // 3. Filtre par recherche (amélioré)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase().trim();
            result = result.filter(exp =>
                exp.reference?.toLowerCase().includes(lowerQuery) ||
                exp.expediteur?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
                exp.destinataire?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
                exp.pays_depart?.toLowerCase().includes(lowerQuery) ||
                exp.pays_destination?.toLowerCase().includes(lowerQuery) ||
                exp.type_expedition?.toLowerCase().includes(lowerQuery)
            );
        }
        
        // 4. Tri (NOUVEAU)
        if (sortConfig.key) {
            result = [...result].sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'montant':
                        aValue = parseFloat(a.montant_expedition || 0);
                        bValue = parseFloat(b.montant_expedition || 0);
                        break;
                    case 'date':
                        aValue = new Date(a.created_at);
                        bValue = new Date(b.created_at);
                        break;
                    case 'reference':
                        aValue = a.reference || '';
                        bValue = b.reference || '';
                        break;
                    case 'statut':
                        aValue = a.statut_expedition || '';
                        bValue = b.statut_expedition || '';
                        break;
                    case 'commission':
                        aValue = getAgencyCommission(a);
                        bValue = getAgencyCommission(b);
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        return result;
    }, [expeditions, type, selectedStatuses, searchQuery, sortConfig]);

    return (
        <>
            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 space-y-4">
                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                    <div className="flex-shrink-0">
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Expéditions</h1>
                        <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                            Gérez et suivez toutes vos expéditions en temps réel
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {/* Date range filters - inline in header */}
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="date"
                                value={dateDebut}
                                onChange={(e) => { setDateDebut(e.target.value); setCurrentPage(1); }}
                                className="text-xs text-gray-700 bg-transparent border-none outline-none w-[110px] cursor-pointer"
                            />
                            <span className="text-gray-300 text-xs font-medium">→</span>
                            <input
                                type="date"
                                value={dateFin}
                                onChange={(e) => { setDateFin(e.target.value); setCurrentPage(1); }}
                                className="text-xs text-gray-700 bg-transparent border-none outline-none w-[110px] cursor-pointer"
                            />
                        </div>
                        {/* Refresh */}
                        <button
                            onClick={() => loadExpeditions({ page: currentPage, date_debut: dateDebut, date_fin: dateFin }, true)}
                            disabled={status === 'loading'}
                            className="inline-flex items-center p-2 border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                            title="Rafraîchir"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
                        </button>
                        {/* Export PDF */}
                        <button
                            onClick={handleExportPDF}
                            disabled={!filteredExpeditions || filteredExpeditions.length === 0}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Exporter en PDF"
                        >
                            <DocumentArrowDownIcon className="w-4 h-4" />
                            <span className="text-xs font-bold hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>

                {/* ── 2-Column Layout : Filters sidebar + Content ── */}
                <div className="flex gap-5 items-start">

                    {/* ── LEFT : Filters Panel (hidden on mobile, shown via toggle) ── */}
                    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-4">
                        <FiltersPanel
                            expeditions={expeditions}
                            selectedStatuses={selectedStatuses}
                            onStatusChange={(v) => { setSelectedStatuses(v); setCurrentPage(1); }}
                            type={type}
                            onTypeChange={(v) => { setType(v); setCurrentPage(1); }}
                            dateDebut={dateDebut}
                            dateFin={dateFin}
                            onDateDebutChange={(v) => { setDateDebut(v); setCurrentPage(1); }}
                            onDateFinChange={(v) => { setDateFin(v); setCurrentPage(1); }}
                            searchQuery={searchQuery}
                            onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
                            onResetAll={resetAllFilters}
                        />
                    </aside>

                    {/* ── RIGHT : Content area ── */}
                    <div className="flex-1 min-w-0 space-y-3">

                        {/* Mobile filters bar (visible only on small screens) */}
                        <div className="flex lg:hidden gap-2 overflow-x-auto no-scrollbar pb-1">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[160px]">
                                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-8 pr-3 py-2 bg-white border-2 border-gray-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Mobile type tabs */}
                        <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-1.5 pb-1">
                            {[
                                { id: '', label: 'Tout', icon: '📦' },
                                { id: 'simple', label: 'Simple', icon: '📮' },
                                { id: 'groupage_dhd_aerien', label: 'Aérien', icon: '✈️' },
                                { id: 'groupage_dhd_maritine', label: 'Maritime', icon: '🚢' },
                                { id: 'groupage_afrique', label: 'Afrique', icon: '🌍' },
                                { id: 'groupage_ca', label: 'CA', icon: '📋' },
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => { setType(btn.id); setCurrentPage(1); }}
                                    className={`whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all flex-shrink-0 ${
                                        type === btn.id
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300'
                                    }`}
                                >
                                    <span>{btn.icon}</span>
                                    <span>{btn.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Toolbar : result count + live indicator */}
                        <div className="flex items-center justify-between bg-white/70 rounded-xl border border-slate-200/60 px-4 py-2.5">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-900">
                                    {filteredExpeditions?.length || 0}
                                    <span className="font-normal text-slate-500 ml-1">expédition{filteredExpeditions?.length !== 1 ? 's' : ''}</span>
                                </span>
                                {(selectedStatuses.length > 0 || type || searchQuery) && (
                                    <button
                                        onClick={resetAllFilters}
                                        className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                                    >
                                        <XMarkIcon className="w-3.5 h-3.5" />
                                        Effacer les filtres
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-500">
                                <div className="relative flex h-1.5 w-1.5">
                                    <span className={`${status === 'loading' ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75`}></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </div>
                                <span className="text-[10px] font-semibold uppercase tracking-wide">
                                    {status === 'loading' ? 'Actualisation...' : 'À jour'}
                                </span>
                            </div>
                        </div>

                {/* Premium Data Card Container */}
                <div className="relative bg-gradient-to-br from-white via-white to-slate-50/30 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden backdrop-blur-sm">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none"></div>

                    <div className="relative overflow-x-auto">
                        {/* Mobile View (Cards) - Version Ultra-Compacte SaaS */}
                        <div className="block lg:hidden space-y-2 p-2">
                            {status === 'loading' && expeditions.length === 0 ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 animate-pulse space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                                            <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded w-2/3"></div>
                                        <div className="flex justify-between items-center pt-1">
                                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                            <div className="h-6 bg-slate-200 rounded-lg w-6"></div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredExpeditions.length > 0 ? (
                                filteredExpeditions.map((exp) => (
                                    <Link
                                        key={exp.id}
                                        to={`/expeditions/${exp.id}`}
                                        className={`block bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-[0.98] border-l-4 ${getStatusBorderColor(exp.statut_expedition)}`}
                                    >
                                        {/* Header - Référence + Statut */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                <span className="text-xs font-bold text-slate-900 truncate">{exp.reference}</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border shadow-sm whitespace-nowrap ${getTypeStyle(exp.type_expedition)}`}>
                                                    {getTypeLabel(exp.type_expedition)}
                                                </span>
                                            </div>
                                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase border whitespace-nowrap ${getStatusStyle(exp.statut_expedition)}`}>
                                                {getStatusLabel(exp.statut_expedition)}
                                            </span>
                                        </div>

                                        {/* Trajet Compact */}
                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 mb-2">
                                            <span className="truncate max-w-[35%]">{exp.pays_depart}</span>
                                            <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                            <span className="truncate max-w-[35%] text-indigo-600">{exp.pays_destination}</span>
                                        </div>

                                        {/* Footer - Montant + Actions */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                    {new Intl.NumberFormat('fr-FR').format(exp.montant_expedition || 0)}
                                                </span>
                                                <span className="text-[8px] font-semibold text-slate-400">CFA</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {/* Commission Badge */}
                                                <div className="flex items-baseline gap-0.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded">
                                                    <span className="text-[8px] font-semibold text-indigo-400">Com.</span>
                                                    <span className="text-[10px] font-bold text-indigo-600">
                                                        {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(getAgencyCommission(exp))}
                                                    </span>
                                                </div>

                                                {/* Print Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handlePrintReceipt(exp);
                                                    }}
                                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 active:scale-90 transition-transform"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
                                                </button>

                                                {/* Arrow Icon */}
                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 px-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">Aucune expédition trouvée</p>
                                </div>
                            )}
                        </div>

                        {/* Desktop View (Table) */}
                        <table className="hidden lg:table w-full text-left border-collapse">
                            {/* Table Header */}
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50 border-b-2 border-slate-100">
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[18%]">
                                        <SortableHeader label="Référence" sortKey="reference" currentSort={sortConfig} onSort={handleSort} />
                                    </th>
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[20%]">
                                        Expéditeur / Destinataire
                                    </th>
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[14%]">
                                        Trajet
                                    </th>
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[14%]">
                                        <SortableHeader label="Montant" sortKey="montant" currentSort={sortConfig} onSort={handleSort} />
                                    </th>
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[18%]">
                                        <SortableHeader label="Statut" sortKey="statut" currentSort={sortConfig} onSort={handleSort} />
                                    </th>
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[16%]">
                                        Paiement
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {status === 'loading' && expeditions.length === 0 ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-5 py-4"><div className="space-y-2"><div className="h-3.5 bg-slate-100 rounded w-24"></div><div className="h-3 bg-slate-100 rounded w-32"></div></div></td>
                                            <td className="px-5 py-4"><div className="space-y-2.5"><div className="h-3.5 bg-slate-100 rounded w-32"></div><div className="h-3.5 bg-slate-100 rounded w-28"></div></div></td>
                                            <td className="px-5 py-4"><div className="flex flex-col items-center gap-1"><div className="h-5 bg-slate-100 rounded-full w-16"></div><div className="h-3 bg-slate-100 rounded w-3"></div><div className="h-5 bg-slate-100 rounded-full w-16"></div></div></td>
                                            <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                            <td className="px-5 py-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                                            <td className="px-5 py-4"><div className="h-5 bg-slate-100 rounded w-16"></div></td>
                                        </tr>
                                    ))
                                ) : filteredExpeditions.length > 0 ? (
                                    filteredExpeditions.map((exp) => (
                                        <tr
                                            key={exp.id}
                                            onClick={() => navigate(`/expeditions/${exp.id}`)}
                                            className={`group hover:bg-indigo-50/40 transition-all duration-150 cursor-pointer border-l-[3px] ${getStatusBorderColor(exp.statut_expedition)}`}
                                        >
                                            {/* Référence + date */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors tabular-nums tracking-tight">
                                                        {exp.reference}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {formatDate(exp.created_at)}
                                                    </span>
                                                    <span className={`mt-1 self-start px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getTypeStyle(exp.type_expedition)}`}>
                                                        {getTypeLabel(exp.type_expedition)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Expéditeur / Destinataire */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0">E</span>
                                                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">{exp.expediteur?.nom_prenom || '—'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-md bg-violet-100 text-violet-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0">D</span>
                                                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">{exp.destinataire?.nom_prenom || '—'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Trajet */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-full whitespace-nowrap">
                                                        {exp.pays_depart}
                                                    </span>
                                                    <svg className="w-3 h-3 text-indigo-300 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                    </svg>
                                                    <span className="text-[11px] font-semibold text-indigo-600 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full whitespace-nowrap">
                                                        {exp.pays_destination}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Montant */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                        {formatPriceDual(exp.montant_expedition)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {exp.colis?.length || 0} colis
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Statut */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(exp.statut_expedition)}`}>
                                                    {getStatusLabel(exp.statut_expedition)}
                                                </span>
                                            </td>

                                            {/* Paiement */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${exp.statut_paiement_expedition === 'paye' ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
                                                        <span className={`text-[10px] font-semibold ${exp.statut_paiement_expedition === 'paye' ? 'text-emerald-600' : 'text-orange-500'}`}>
                                                            Transport {exp.statut_paiement_expedition === 'paye' ? 'Payé' : 'Impayé'}
                                                        </span>
                                                    </div>
                                                    {parseFloat(exp.frais_annexes || 0) > 0 && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${exp.statut_paiement_frais === 'paye' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                                            <span className={`text-[10px] font-semibold ${exp.statut_paiement_frais === 'paye' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                Annexes {exp.statut_paiement_frais === 'paye' ? 'Payé' : 'Bloqué'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center max-w-md mx-auto">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100">
                                                    <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-700 mb-1">Aucune expédition</h3>
                                                <p className="text-xs text-slate-400">Aucun résultat ne correspond à vos critères.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Premium Pagination */}
                    {meta && meta.last_page > 1 && (
                        <div className="px-3 sm:px-8 py-4 sm:py-6 bg-slate-50/50 backdrop-blur-sm border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-[0.15em]">
                                Page <span className="text-indigo-600 font-bold">{meta.current_page}</span> sur <span className="text-slate-900 font-bold">{meta.last_page}</span>
                            </span>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                    onClick={() => handlePageChange(meta.current_page - 1)}
                                    disabled={meta.current_page === 1}
                                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] transition-all duration-200 ${meta.current_page === 1
                                        ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                                        : 'text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5'
                                        }`}
                                >
                                    <span className="hidden sm:inline">Précédent</span>
                                    <span className="sm:hidden">‹</span>
                                </button>

                                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                <span className="px-1 sm:px-2 text-slate-300 font-bold text-xs sm:text-base">···</span>
                                            )}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={`min-w-[2rem] sm:min-w-[2.75rem] h-8 sm:h-11 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 ${meta.current_page === page
                                                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                                    : 'text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    ))}

                                <button
                                    onClick={() => handlePageChange(meta.current_page + 1)}
                                    disabled={meta.current_page === meta.last_page}
                                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] transition-all duration-200 ${meta.current_page === meta.last_page
                                        ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                                        : 'text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5'
                                        }`}
                                >
                                    <span className="hidden sm:inline">Suivant</span>
                                    <span className="sm:hidden">›</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>{/* end Premium Data Card */}
                </div>{/* end flex-1 content area */}
                </div>{/* end flex gap-5 layout */}
            </div>{/* end max-w container */}

            {showPrintModal && selectedExpedition && (
                <PrintSuccessModal
                    expedition={selectedExpedition}
                    agency={{
                        ...(agencyData?.agence || agencyData),
                        logo: getLogoUrl(agencyData?.agence?.logo || agencyData?.logo)
                    }}
                    onClose={() => {
                        setShowPrintModal(false);
                        setSelectedExpedition(null);
                    }}
                />
            )}
        </>
    );
};

export default Expeditions;
