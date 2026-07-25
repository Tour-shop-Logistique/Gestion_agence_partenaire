import React, { useEffect, useState, useMemo, useCallback } from "react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useExpedition } from "../hooks/useExpedition";
import { useAgency } from "../hooks/useAgency";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import PrintSuccessModal from "../components/Receipts/PrintSuccessModal";
import { getLogoUrl } from "../utils/apiConfig";
import { formatPriceDual } from "../utils/format";
import { showToast } from "../utils/toast";
import { getStatusLabel } from "../utils/expeditionHelpers";

// Import des nouveaux composants premium
import {
    ExpeditionHeader,
    StatsCards,
    ExpeditionRow,
    ExpeditionMobileCard,
    FilteredStats,
    SortableHeader,
    FiltersPanel
} from '../components/expeditions';

/**
 * 🎯 PAGE EXPEDITIONS PREMIUM
 * Inspiration: Stripe Dashboard / Linear / Notion / Vercel
 * - Design moderne et élégant
 * - Recherche intelligente
 * - Filtres rapides (chips)
 * - KPI Dashboard cliquables
 * - Timeline de statut
 * - Actions rapides
 * - Sélection multiple
 * - WebSocket temps réel
 * - Responsive premium
 */

const ExpeditionsPremium = () => {
    const { currentUser } = useAuth();
    const { expeditions, meta, loadExpeditions, status, lastFilters } = useExpedition();
    const { data: agencyData, fetchAgencyData } = useAgency();

    // ========== HELPERS ==========
    const getTodayDate = () => new Date().toISOString().split('T')[0];
    const getFirstDayOfMonth = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    };


    // ========== STATES ==========
    const [currentPage, setCurrentPage] = useState(lastFilters?.page || 1);
    const [dateDebut, setDateDebut] = useState(() => {
        const saved = sessionStorage.getItem('expeditions_date_debut');
        return saved || lastFilters?.date_debut || getFirstDayOfMonth();
    });
    const [dateFin, setDateFin] = useState(() => {
        const saved = sessionStorage.getItem('expeditions_date_fin');
        return saved || lastFilters?.date_fin || getTodayDate();
    });
    const [type, setType] = useState("");
    const [selectedExpedition, setSelectedExpedition] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [quickFilter, setQuickFilter] = useState('all');
    const [quickFilterFn, setQuickFilterFn] = useState(null);
    const [activeKpiFilter, setActiveKpiFilter] = useState({});
    const [lastSync, setLastSync] = useState(new Date());

    // ========== WEBSOCKET INTEGRATION ==========
    useWebSocket(
        currentUser?.agence_id,
        {
            onExpeditionCreated: (data, meta) => {
                setLastSync(new Date());
                if (meta.silent) {
                    console.log('🔄 [Expeditions] Refresh silencieux');
                    loadExpeditions({
                        page: currentPage,
                        date_debut: dateDebut,
                        date_fin: dateFin,
                        type: type
                    }, true);
                } else {
                    console.log('🎉 [Expeditions] Nouvelle(s) expédition(s):', meta.count);
                    showToast(`${meta.count} nouvelle(s) expédition(s)`, 'success');
                    loadExpeditions({
                        page: currentPage,
                        date_debut: dateDebut,
                        date_fin: dateFin,
                        type: type
                    }, true);
                }
            },
            
            
            onExpeditionStatusChanged: (data, meta) => {
                setLastSync(new Date());
                console.log('📦 [Expeditions] Statut changé:', meta.count);
                showToast(`${meta.count} expédition(s) mise(s) à jour`, 'info');
                loadExpeditions({
                    page: currentPage,
                    date_debut: dateDebut,
                    date_fin: dateFin,
                    type: type
                }, true);
            },
            
            onExpeditionPaymentConfirmed: (data, meta) => {
                setLastSync(new Date());
                console.log('💰 [Expeditions] Paiement confirmé:', meta.references);
                showToast(`Paiement confirmé: ${meta.references.join(', ')}`, 'success');
                loadExpeditions({
                    page: currentPage,
                    date_debut: dateDebut,
                    date_fin: dateFin,
                    type: type
                }, true);
            },
            
            onExpeditionFraisUpdated: (data, meta) => {
                setLastSync(new Date());
                console.log('💵 [Expeditions] Frais mis à jour:', meta.references);
                showToast(`Frais mis à jour: ${meta.references.join(', ')}`, 'info');
                loadExpeditions({
                    page: currentPage,
                    date_debut: dateDebut,
                    date_fin: dateFin,
                    type: type
                }, true);
            }
        },
        !!currentUser?.agence_id
    );

    // ========== EFFECTS ==========
    useEffect(() => {
        if (dateDebut) sessionStorage.setItem('expeditions_date_debut', dateDebut);
        if (dateFin) sessionStorage.setItem('expeditions_date_fin', dateFin);
        
        loadExpeditions({
            page: currentPage,
            date_debut: dateDebut,
            date_fin: dateFin,
            type: type
        });
    }, [currentPage, dateDebut, dateFin, type]);

    useEffect(() => {
        fetchAgencyData();
    }, []);

    // ========== UTILITY FUNCTIONS ==========
    const getAgencyCommission = (exp) => {
        // Utiliser montant_prestation si disponible, sinon fallback sur commission_details
        if (exp.montant_prestation !== undefined && exp.montant_prestation !== null) {
            return parseFloat(exp.montant_prestation) || 0;
        }
        
        // Fallback sur l'ancien calcul si montant_prestation n'existe pas
        if (!exp.commission_details) return 0;
        const c = exp.commission_details;
        return (c.enlevement?.agence || 0) + 
               (c.livraison?.agence || 0) + 
               (c.emballage?.agence || 0) + 
               (c.retard?.agence || 0);
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

    // ========== HANDLERS ==========
    const handleRefresh = useCallback(() => {
        setLastSync(new Date());
        loadExpeditions({
            page: currentPage,
            date_debut: dateDebut,
            date_fin: dateFin,
            type: type
        }, true);
    }, [currentPage, dateDebut, dateFin, type]);

    const handlePrintReceipt = (expedition) => {
        setSelectedExpedition(expedition);
        setShowPrintModal(true);
    };

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    const handleKpiFilter = (filterType) => {
        setQuickFilter('all');
        setQuickFilterFn(null);
        
        switch (filterType) {
            case 'all':
                setSelectedStatuses([]);
                setActiveKpiFilter({ type: 'all' });
                break;
            case 'en_attente':
                setSelectedStatuses(['en_attente']);
                setActiveKpiFilter({ status: 'en_attente' });
                break;
            case 'en_transit':
                setSelectedStatuses(['en_cours_enlevement', 'en_cours_depot', 'recu_agence_depart', 
                                    'en_transit_entrepot', 'depart_expedition_succes', 
                                    'arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison']);
                setActiveKpiFilter({ status: 'en_transit' });
                break;
            case 'delivered':
                setSelectedStatuses(['termined', 'delivered']);
                setActiveKpiFilter({ status: 'delivered' });
                break;
            case 'refused':
                setSelectedStatuses(['refused']);
                setActiveKpiFilter({ status: 'refused' });
                break;
            default:
                setSelectedStatuses([]);
                setActiveKpiFilter({});
        }
    };

    const handleQuickFilter = (filterId, filterFunction) => {
        setQuickFilter(filterId);
        setQuickFilterFn(() => filterFunction);
        setSelectedStatuses([]);
        setActiveKpiFilter({});
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (meta?.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    // ========== FILTERED & SORTED EXPEDITIONS ==========
    const filteredExpeditions = useMemo(() => {
        let result = expeditions;
        
        // 1. Quick filter function (chips)
        if (quickFilterFn) {
            result = result.filter(quickFilterFn);
        }
        
        // 2. Type filter
        if (type) {
            result = result.filter(exp => exp.type_expedition === type);
        }
        
        // 3. Status filter
        if (selectedStatuses.length > 0) {
            result = result.filter(exp => selectedStatuses.includes(exp.statut_expedition));
        }
        
        // 4. Search query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase().trim();
            result = result.filter(exp =>
                exp.reference?.toLowerCase().includes(lowerQuery) ||
                exp.expediteur?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
                exp.destinataire?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
                exp.expediteur?.telephone?.toLowerCase().includes(lowerQuery) ||
                exp.destinataire?.telephone?.toLowerCase().includes(lowerQuery) ||
                exp.pays_depart?.toLowerCase().includes(lowerQuery) ||
                exp.pays_destination?.toLowerCase().includes(lowerQuery) ||
                exp.ville_destination?.toLowerCase().includes(lowerQuery) ||
                exp.type_expedition?.toLowerCase().includes(lowerQuery) ||
                exp.numero_colis?.toLowerCase().includes(lowerQuery) ||
                exp.statut_paiement_expedition?.toLowerCase().includes(lowerQuery)
            );
        }
        
        // 5. Sort
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
    }, [expeditions, type, selectedStatuses, searchQuery, sortConfig, quickFilterFn]);



    // ========== EXPORT PDF ==========
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

        // Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 45, 'F');

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

        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        const dateText = `PERIODE : DU ${new Date(dateDebut).toLocaleDateString('fr-FR')} AU ${new Date(dateFin).toLocaleDateString('fr-FR')}`;
        doc.text(dateText, pageWidth - 15, 18, { align: 'right' });
        doc.text(`PAYS : ${agencyData?.pays || "FRANCE"}`, pageWidth - 15, 26, { align: 'right' });
        doc.text(`EDITE LE : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 15, 34, { align: 'right' });

        const totalCommission = filteredExpeditions.reduce((sum, exp) => sum + getAgencyCommission(exp), 0);
        const totalMontant = filteredExpeditions.reduce((sum, exp) => sum + parseFloat(exp.montant_expedition || 0), 0);

        const tableData = filteredExpeditions.map(exp => ([
            exp.reference,
            getTypeLabel(exp.type_expedition),
            `${exp.pays_depart || 'N/A'}\n↓\n${exp.pays_destination || 'N/A'}`,
            exp.expediteur?.nom_prenom || "---",
            exp.destinataire?.nom_prenom || "---",
            formatCurrencyForPDF(exp.montant_expedition),
            formatCurrencyForPDF(getAgencyCommission(exp)),
            getStatusLabel(exp.statut_expedition)
        ]));

        autoTable(doc, {
            startY: 55,
            head: [['Référence', 'Type', 'Trajet', 'Expéditeur', 'Destinataire', 'Montant', 'Com. Agence', 'Statut']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 7.5,
                cellPadding: 3,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle'
            },
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center'
            },
            didDrawPage: (data) => {
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        });

        doc.save(`Rapport_Expeditions_${dateDebut}_au_${dateFin}.pdf`);
        showToast('Export PDF réussi', 'success');
    };

    // ========== RENDER ==========
    return (
        <>
            {/* Header Premium */}
            <ExpeditionHeader
                totalCount={filteredExpeditions.length}
                loading={status === 'loading'}
                lastSync={lastSync}
                onRefresh={handleRefresh}
                onExport={handleExportPDF}
                dateDebut={dateDebut}
                dateFin={dateFin}
                onDateDebutChange={(v) => { setDateDebut(v); setCurrentPage(1); }}
                onDateFinChange={(v) => { setDateFin(v); setCurrentPage(1); }}
                canExport={filteredExpeditions.length > 0}
            />

            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">

                {/* KPI Dashboard */}
                <StatsCards
                    expeditions={expeditions}
                    onFilter={handleKpiFilter}
                    activeFilters={activeKpiFilter}
                />

                {/* Layout avec filtres à gauche */}
                <div className="flex gap-5 items-start">
                    {/* LEFT : Panneau de Filtres (sidebar gauche) */}
                    <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-4">
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
                            onResetAll={() => {
                                setSelectedStatuses([]);
                                setSearchQuery('');
                                setType('');
                                setDateDebut(getFirstDayOfMonth());
                                setDateFin(getTodayDate());
                                setSortConfig({ key: null, direction: 'asc' });
                                setCurrentPage(1);
                                setQuickFilter('all');
                                setQuickFilterFn(null);
                                setActiveKpiFilter({});
                            }}
                        />
                    </aside>

                    {/* RIGHT : Contenu principal */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Filtered Stats (si filtres actifs) */}
                        {(searchQuery || selectedStatuses.length > 0 || type || quickFilter !== 'all') && (
                            <FilteredStats
                                expeditions={filteredExpeditions}
                                getAgencyCommission={getAgencyCommission}
                            />
                        )}

                        {/* Table Container */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b-2 border-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-5 py-4 text-left">
                                        <SortableHeader 
                                            label="Référence" 
                                            sortKey="reference" 
                                            currentSort={sortConfig} 
                                            onSort={handleSort}
                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                                        />
                                    </th>
                                    <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Expéditeur / Destinataire
                                    </th>
                                    <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Trajet
                                    </th>
                                    <th className="px-5 py-4 text-left">
                                        <SortableHeader 
                                            label="Montant" 
                                            sortKey="montant" 
                                            currentSort={sortConfig} 
                                            onSort={handleSort}
                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                                        />
                                    </th>
                                    <th className="px-5 py-4 text-left">
                                        <SortableHeader 
                                            label="Statut" 
                                            sortKey="statut" 
                                            currentSort={sortConfig} 
                                            onSort={handleSort}
                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                                        />
                                    </th>
                                    <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Paiement
                                    </th>
                                    <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {status === 'loading' && expeditions.length === 0 ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-5 py-4" colSpan="8">
                                                <div className="h-16 bg-slate-100 rounded"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredExpeditions.length > 0 ? (
                                    filteredExpeditions.map((exp) => (
                                        <ExpeditionRow
                                            key={exp.id}
                                            expedition={exp}
                                            onPrint={handlePrintReceipt}
                                            getStatusBorderColor={getStatusBorderColor}
                                            getTypeStyle={getTypeStyle}
                                            getTypeLabel={getTypeLabel}
                                            formatPriceDual={formatPriceDual}
                                            getAgencyCommission={getAgencyCommission}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                    {/* Mobile Cards */}
                    <div className="block lg:hidden space-y-3 p-3">
                        {status === 'loading' && expeditions.length === 0 ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 animate-pulse">
                                    <div className="h-20 bg-slate-100 rounded"></div>
                                </div>
                            ))
                        ) : filteredExpeditions.length > 0 ? (
                            filteredExpeditions.map((exp) => (
                                <ExpeditionMobileCard
                                    key={exp.id}
                                    expedition={exp}
                                    onPrint={handlePrintReceipt}
                                    getStatusBorderColor={getStatusBorderColor}
                                    getTypeStyle={getTypeStyle}
                                    getTypeLabel={getTypeLabel}
                                    getAgencyCommission={getAgencyCommission}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-xs font-bold text-slate-500">Aucune expédition trouvée</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {meta && meta.last_page > 1 && (
                        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Page <span className="text-indigo-600">{meta.current_page}</span> sur <span className="text-slate-900">{meta.last_page}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(meta.current_page - 1)}
                                    disabled={meta.current_page === 1}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                        meta.current_page === 1
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : 'text-slate-600 hover:bg-white hover:shadow-md'
                                    }`}
                                >
                                    ← Précédent
                                </button>

                                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                <span className="px-2 text-slate-300">···</span>
                                            )}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={`min-w-[2.75rem] h-11 rounded-xl text-xs font-bold transition-all ${
                                                    meta.current_page === page
                                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg scale-105'
                                                        : 'text-slate-600 hover:bg-white hover:shadow-md'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    ))}

                                <button
                                    onClick={() => handlePageChange(meta.current_page + 1)}
                                    disabled={meta.current_page === meta.last_page}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                        meta.current_page === meta.last_page
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : 'text-slate-600 hover:bg-white hover:shadow-md'
                                    }`}
                                >
                                    Suivant →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                    </div>
                </div>
            </div>

            {/* Print Modal */}
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

export default ExpeditionsPremium;
