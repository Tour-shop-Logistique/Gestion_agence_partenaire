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

const Expeditions = () => {
    const navigate = useNavigate();
    const { expeditions, meta, loadExpeditions, status, lastFilters } = useExpedition();
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
        const tableData = filteredExpeditions.map(exp => [
            exp.reference,
            getTypeLabel(exp.type_expedition),
            exp.pays_depart + " → " + exp.pays_destination,
            exp.expediteur?.nom_prenom || "---",
            exp.destinataire?.nom_prenom || "---",
            formatCurrencyForPDF(exp.montant_expedition),
            formatCurrencyForPDF(getAgencyCommission(exp)),
            getStatusLabel(exp.statut_expedition)
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['Référence', 'Type', 'Trajet', 'Expéditeur', 'Destinataire', 'Montant', 'Com. Agence', 'Statut']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 7,
                cellPadding: 2.5,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle',
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontSize: 7,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 32, halign: 'left', fontStyle: 'bold' },
                1: { cellWidth: 20, halign: 'center', fontSize: 6.5 },
                2: { cellWidth: 40, halign: 'left' },
                3: { cellWidth: 30, halign: 'left' },
                4: { cellWidth: 30, halign: 'left' },
                5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
                6: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] },
                7: { cellWidth: 28, halign: 'center', fontSize: 6, textColor: [100, 116, 139] }
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

        doc.save(`Rapport_Expeditions_${dateDebut}_au_${dateFin}.pdf`);
    };

    const filteredExpeditions = useMemo(() => {
        let result = expeditions;
        if (type) {
            result = result.filter(exp => exp.type_expedition === type);
        }
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(exp =>
                exp.reference?.toLowerCase().includes(lowerQuery) ||
                exp.expediteur?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
                exp.destinataire?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
                exp.pays_depart?.toLowerCase().includes(lowerQuery) ||
                exp.pays_destination?.toLowerCase().includes(lowerQuery) ||
                exp.type_expedition?.toLowerCase().includes(lowerQuery)
            );
        }
        return result;
    }, [expeditions, searchQuery, type]);

    return (
        <>
            <div className="space-y-8 max-w-[1600px] mx-auto">
                {/* Premium Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
                            Expéditions
                        </h1>
                        <p className="text-sm font-medium text-slate-500 tracking-wide">
                            Gérez et suivez toutes vos expéditions en temps réel
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        {/* Date Filters */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative group flex-1 sm:w-40">
                                <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Du</span>
                                <input
                                    type="date"
                                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    value={dateDebut}
                                    onChange={(e) => {
                                        setDateDebut(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                            <div className="relative group flex-1 sm:w-40">
                                <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Au</span>
                                <input
                                    type="date"
                                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    value={dateFin}
                                    onChange={(e) => {
                                        setDateFin(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group w-full sm:w-64 lg:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
                                placeholder="Rechercher (réf, nom, ville)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => loadExpeditions({ page: currentPage, date_debut: dateDebut, date_fin: dateFin }, true)}
                            disabled={status === 'loading'}
                            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            title="Rafraîchir"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Export PDF Button */}
                        <button
                            onClick={handleExportPDF}
                            disabled={!filteredExpeditions || filteredExpeditions.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Exporter en PDF"
                        >
                            <DocumentArrowDownIcon className="w-5 h-5" />
                            <span className="text-sm font-bold hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>

                {/* Sub-Header Toolbar with Type Filter */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 p-1 rounded-2xl border border-slate-200/50">
                    <div className="flex items-center p-1 bg-slate-100/50 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                        {[
                            { id: '', label: 'Tout', icon: '📦', color: 'indigo' },
                            { id: 'simple', label: 'Simple', icon: '📮', color: 'blue' },
                            { id: 'groupage_dhd_aerien', label: 'Aérien', icon: '✈️', color: 'sky' },
                            { id: 'groupage_dhd_maritine', label: 'Maritime', icon: '🚢', color: 'cyan' },
                            { id: 'groupage_afrique', label: 'Afrique', icon: '🌍', color: 'orange' },
                            { id: 'groupage_ca', label: 'CA', icon: '📋', color: 'purple' }
                        ].map((btn) => {
                            const isActive = type === btn.id;
                            const colorClasses = {
                                indigo: {
                                    active: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200',
                                    inactive: 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                                },
                                blue: {
                                    active: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200',
                                    inactive: 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                                },
                                sky: {
                                    active: 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-200',
                                    inactive: 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
                                },
                                cyan: {
                                    active: 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-200',
                                    inactive: 'text-slate-500 hover:text-cyan-600 hover:bg-cyan-50'
                                },
                                orange: {
                                    active: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200',
                                    inactive: 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'
                                },
                                purple: {
                                    active: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200',
                                    inactive: 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'
                                }
                            };
                            
                            return (
                                <button
                                    key={btn.id}
                                    onClick={() => {
                                        setType(btn.id);
                                        setCurrentPage(1);
                                    }}
                                    className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${
                                        isActive
                                            ? colorClasses[btn.color].active
                                            : colorClasses[btn.color].inactive
                                    }`}
                                    title={btn.id === 'groupage_dhd_aerien' ? 'DHD Aérien' : btn.id === 'groupage_dhd_maritine' ? 'DHD Maritime' : btn.label}
                                >
                                    <span className={`text-sm ${isActive ? 'scale-110' : ''} transition-transform`}>{btn.icon}</span>
                                    {btn.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 px-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Global</span>
                            <span className="text-sm font-bold text-slate-900 tracking-tight leading-none">{meta?.total || 0}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <div className="flex items-center gap-1.5 text-emerald-500">
                             <div className="relative flex h-1.5 w-1.5">
                                <span className={`${status === 'loading' ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75`}></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{status === 'loading' ? 'Actualisation...' : 'À jour'}</span>
                        </div>
                    </div>
                </div>

                {/* Premium Data Card Container */}
                <div className="relative bg-gradient-to-br from-white via-white to-slate-50/30 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden backdrop-blur-sm">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none"></div>

                    <div className="relative overflow-x-auto">
                        {/* Mobile View (Cards) */}
                        <div className="block lg:hidden space-y-4 p-4">
                            {status === 'loading' && expeditions.length === 0 ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-slate-100 rounded w-full"></div>
                                            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                                            <div className="h-8 bg-slate-200 rounded-lg w-8"></div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredExpeditions.length > 0 ? (
                                filteredExpeditions.map((exp) => (
                                    <div key={exp.id} className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group border-l-4 ${getStatusBorderColor(exp.statut_expedition)}`}>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>

                                        <div className="relative z-10 space-y-4">
                                            {/* Header Card */}
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900 tracking-tight">{exp.reference}</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border shadow-sm ${getTypeStyle(exp.type_expedition)}`}>
                                                            {getTypeLabel(exp.type_expedition)}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-400">{formatDate(exp.created_at)}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(exp.statut_expedition)}`}>
                                                        {getStatusLabel(exp.statut_expedition)}
                                                    </span>
                                                    <div className="flex flex-col items-end">
                                                        <span className={`text-[8px] font-black uppercase tracking-tighter ${exp.statut_paiement_expedition === 'paye' ? 'text-emerald-600' : 'text-orange-500'}`}>
                                                            T: {exp.statut_paiement_expedition === 'paye' ? 'Payé' : 'En attente'}
                                                        </span>
                                                        {parseFloat(exp.frais_annexes || 0) > 0 && (
                                                            <span className={`text-[8px] font-black uppercase tracking-tighter ${exp.statut_paiement_frais === 'paye' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                F: {exp.statut_paiement_frais === 'paye' ? 'Payé' : 'Bloqué'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Trajet */}
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                                                <span className="truncate max-w-[40%]">{exp.pays_depart}</span>
                                                <div className="flex-1 flex items-center justify-center px-2">
                                                    <div className="h-px bg-slate-300 w-full flex relative items-center justify-center">
                                                        <div className="w-1 h-1 bg-slate-400 rounded-full absolute left-0"></div>
                                                        <svg className="w-3 h-3 text-indigo-400 absolute -top-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                        <div className="w-1 h-1 bg-slate-400 rounded-full absolute right-0"></div>
                                                    </div>
                                                </div>
                                                <span className="truncate max-w-[40%] text-indigo-600">{exp.pays_destination}</span>
                                            </div>

                                            {/* Acteurs */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expéditeur</span>
                                                    <p className="text-xs font-bold text-slate-700 truncate">{exp.expediteur?.nom_prenom}</p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Destinataire</span>
                                                    <p className="text-xs font-bold text-slate-700 truncate">{exp.destinataire?.nom_prenom}</p>
                                                </div>
                                            </div>

                                            {/* Footer Card */}
                                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-end justify-between gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Total</span>
                                                    <span className="text-sm font-bold text-slate-900 tracking-tight tabular-nums">
                                                        {formatPriceDual(exp.montant_expedition)}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-col items-center px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                                                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-tight">Ma Com.</span>
                                                    <span className="text-xs font-black text-indigo-600 tracking-tight">
                                                        {new Intl.NumberFormat('fr-FR').format(getAgencyCommission(exp))} <span className="text-[8px]">CFA</span>
                                                    </span>
                                                </div>

                                                <div className="flex gap-1.5 ml-auto">
                                                    <button
                                                        onClick={() => handlePrintReceipt(exp)}
                                                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm transition-transform active:scale-90"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                    </button>
                                                    <Link
                                                        to={`/expeditions/${exp.id}`}
                                                        className="p-2 rounded-lg bg-indigo-600 text-white shadow-indigo-200 shadow-md"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 px-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">Aucune expédition trouvée</p>
                                </div>
                            )}
                        </div>

                        {/* Desktop View (Table) */}
                        <table className="hidden lg:table w-full text-left border-collapse">
                            {/* Sticky Premium Header */}
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60">
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[12%]">Référence</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[18%]">Expéditeur / Destinataire</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[10%]">Trajet</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[14%]">Montant</th>
                                    <th className="px-6 py-5 text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50/30 w-[13%]">Commission</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[18%]">Statut</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide text-right w-[15%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {status === 'loading' && expeditions.length === 0 ? (
                                    // Premium Skeleton Loading
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6">
                                                <div className="space-y-2.5">
                                                    <div className="h-4 bg-slate-200/60 rounded-lg w-32"></div>
                                                    <div className="h-3 bg-slate-100/60 rounded w-24"></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-slate-200/60 rounded-lg"></div>
                                                        <div className="h-3 bg-slate-200/60 rounded w-28"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-slate-100/60 rounded-lg"></div>
                                                        <div className="h-3 bg-slate-100/60 rounded w-28"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="h-16 bg-slate-100/60 rounded-xl w-24"></div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-slate-200/60 rounded w-24"></div>
                                                    <div className="h-3 bg-slate-100/60 rounded w-16"></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2">
                                                    <div className="h-6 bg-slate-200/60 rounded-full w-24"></div>
                                                    <div className="h-5 bg-slate-100/60 rounded-full w-28"></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="h-9 bg-slate-100/60 rounded-xl w-24"></div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end gap-2">
                                                    <div className="h-9 w-9 bg-slate-100/60 rounded-xl"></div>
                                                    <div className="h-9 w-9 bg-slate-100/60 rounded-xl"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredExpeditions.length > 0 ? (
                                    filteredExpeditions.map((exp) => (
                                        <tr
                                            key={exp.id}
                                            className={`group relative hover:bg-slate-50/40 transition-all duration-200 ease-out border-l-4 ${getStatusBorderColor(exp.statut_expedition)} cursor-pointer`}
                                            onClick={() => navigate(`/expeditions/${exp.id}`)}
                                        >
                                            <td className="px-6 py-7">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 leading-tight">
                                                        {exp.reference}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400 leading-tight">
                                                        {formatDate(exp.created_at)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/40 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold text-blue-600">E</span>
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700 leading-tight">{exp.expediteur?.nom_prenom}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/40 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold text-purple-600">D</span>
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700 leading-tight">{exp.destinataire?.nom_prenom}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className="flex items-center justify-center">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide px-2.5 py-1 bg-slate-100/60 rounded-md whitespace-nowrap">
                                                            {exp.pays_depart}
                                                        </span>
                                                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                        </svg>
                                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide px-2.5 py-1 bg-indigo-50/60 rounded-md border border-indigo-100 whitespace-nowrap">
                                                            {exp.pays_destination}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-base font-bold text-slate-900 tabular-nums leading-tight">
                                                        {formatPriceDual(exp.montant_expedition)}
                                                    </span>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                            {exp.colis?.length || 0} Colis
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shadow-sm whitespace-nowrap ${getTypeStyle(exp.type_expedition)}`}>
                                                            {getTypeLabel(exp.type_expedition)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7 bg-indigo-50/10">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-base font-black text-indigo-600 tabular-nums leading-tight whitespace-nowrap">
                                                        {new Intl.NumberFormat('fr-FR').format(getAgencyCommission(exp))} <span className="text-xs font-bold">CFA</span>
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Votre gain</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className="flex flex-col gap-2.5">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${getStatusStyle(exp.statut_expedition)}`}>
                                                        {getStatusLabel(exp.statut_expedition)}
                                                    </span>
                                                    <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-100/60">
                                                        <span className={`text-[10px] font-bold uppercase whitespace-nowrap ${exp.statut_paiement_expedition === 'paye' ? 'text-emerald-600' : 'text-orange-500'}`}>
                                                            T: {exp.statut_paiement_expedition === 'paye' ? 'Payé' : 'Attente'}
                                                        </span>
                                                        {parseFloat(exp.frais_annexes || 0) > 0 && (
                                                            <span className={`text-[10px] font-bold uppercase whitespace-nowrap ${exp.statut_paiement_frais === 'paye' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                H: {exp.statut_paiement_frais === 'paye' ? 'Payé' : 'Bloqué'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handlePrintReceipt(exp)}
                                                        className="group/btn relative p-2.5 hover:bg-white rounded-xl transition-all duration-200 text-slate-400 hover:text-emerald-600 border border-transparent hover:border-slate-200 hover:shadow-lg hover:shadow-emerald-200/50"
                                                        title="Imprimer les reçus"
                                                    >
                                                        <svg className="w-5 h-5 transition-transform duration-200 group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center max-w-md mx-auto">
                                                <div className="relative w-24 h-24 mb-6">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl rotate-6"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white rounded-3xl -rotate-6 shadow-lg"></div>
                                                    <div className="relative w-full h-full bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                                                        <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Aucune expédition</h3>
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                                    Aucune donnée ne correspond à vos critères.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Premium Pagination */}
                    {meta && meta.last_page > 1 && (
                        <div className="px-8 py-6 bg-slate-50/50 backdrop-blur-sm border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.15em]">
                                Page <span className="text-indigo-600 font-bold">{meta.current_page}</span> sur <span className="text-slate-900 font-bold">{meta.last_page}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(meta.current_page - 1)}
                                    disabled={meta.current_page === 1}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all duration-200 ${meta.current_page === 1
                                        ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                                        : 'text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5'
                                        }`}
                                >
                                    Précédent
                                </button>

                                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                <span className="px-2 text-slate-300 font-bold">···</span>
                                            )}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={`min-w-[2.75rem] h-11 rounded-xl text-xs font-bold transition-all duration-200 ${meta.current_page === page
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
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all duration-200 ${meta.current_page === meta.last_page
                                        ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                                        : 'text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5'
                                        }`}
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
