import React, { useEffect, useState, useMemo } from "react";
import { useExpedition } from "../hooks/useExpedition";
import { Link } from "react-router-dom";
import { formatPriceDual } from "../utils/format";
import {
    InboxArrowDownIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    QrCodeIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";
import { 
    Button, 
    Input, 
    Badge, 
    Table, 
    TableHeader, 
    TableHeaderCell, 
    TableBody, 
    TableRow, 
    TableCell,
    TableEmpty,
    TableLoading,
    PageHeader 
} from "../components/ui";

const ColisAReceptionner = () => {
    const {
        reception = [],
        receptionMeta = { current_page: 1, last_page: 1 },
        loadReception,
        status,
        message,
        error,
        receiveColisDestination,
        resetStatus
    } = useExpedition();
    const loading = status === 'loading';
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchReceptionData = (force = false) => {
        loadReception({
            page: currentPage,
        }, force);
    };

    useEffect(() => {
        fetchReceptionData();
    }, [currentPage]);

    useEffect(() => {
        if (message || error) {
            if (message) {
                // fetchReceptionData(true); // Redux s'occupe de la mise à jour instantanée
                setSelectedCodes([]);
            }
            const timer = setTimeout(() => resetStatus(), 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error, resetStatus]);

    // Transformer les données en liste de colis à plat pour la recherche/filtre
    const flatColis = useMemo(() => {
        if (!reception || !Array.isArray(reception)) return [];
        
        // Si c'est déjà une liste de colis (le format envoyé par l'API maintenant)
        if (reception.length > 0 && !reception[0].colis) {
            return reception.map(item => ({
                ...item,
                is_received: item.is_received_by_agence_destination === true
            }));
        }

        // Ancien format : liste d'expéditions contenant des colis
        return reception.flatMap(exp =>
            (exp.colis || []).map(item => ({
                ...item,
                expedition: exp,
                expedition_id: exp.id,
                is_received: item.is_received_by_agence_destination === true
            }))
        );
    }, [reception]);

    // Regrouper les colis par expédition pour l'affichage structuré
    const groupedExpeditions = useMemo(() => {
        if (!reception || !Array.isArray(reception)) return [];

        // Si c'est déjà groupé (ancien format)
        if (reception.length > 0 && reception[0].colis) {
            return reception;
        }

        // Regrouper le format plat par expédition
        const groups = {};
        reception.forEach(item => {
            const expId = item.expedition_id || item.expedition?.id;
            if (!expId) return;
            
            if (!groups[expId]) {
                groups[expId] = {
                    ...(item.expedition || {}),
                    id: expId,
                    colis: []
                };
            }
            groups[expId].colis.push(item);
        });
        return Object.values(groups);
    }, [reception]);

    // Filtrer les colis basés sur la recherche
    const filteredColis = useMemo(() => {
        if (!searchQuery) return flatColis;
        const lowQuery = searchQuery.toLowerCase();
        return flatColis.filter(item =>
            item.code_colis?.toLowerCase().includes(lowQuery) ||
            item.designation?.toLowerCase().includes(lowQuery) ||
            item.expedition?.reference?.toLowerCase().includes(lowQuery) ||
            item.expedition?.pays_depart?.toLowerCase().includes(lowQuery)
        );
    }, [flatColis, searchQuery]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (receptionMeta?.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const toggleSelect = (code) => {
        setSelectedCodes(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const selectableColis = useMemo(() =>
        filteredColis.filter(c => !c.is_received),
        [filteredColis]
    );

    const toggleSelectAll = () => {
        if (selectableColis.length === 0) return;
        if (selectedCodes.length === selectableColis.length) {
            setSelectedCodes([]);
        } else {
            setSelectedCodes(selectableColis.map(c => c.code_colis));
        }
    };

    const handleReceiveSelected = async () => {
        if (selectedCodes.length === 0) return;
        setProcessing(true);
        await receiveColisDestination(selectedCodes);
        setProcessing(false);
    };

    const handleReceiveSingle = async (code) => {
        setProcessing(true);
        await receiveColisDestination([code]);
        setProcessing(false);
    };

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
            {/* Header Section */}
            <PageHeader
                title="Colis à réceptionner"
                subtitle="Expéditions en transit entrant dans votre pays"
                icon={InboxArrowDownIcon}
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            icon={ArrowPathIcon}
                            onClick={() => fetchReceptionData(true)}
                            disabled={loading}
                        >
                            Actualiser
                        </Button>
                        <Button
                            variant="primary"
                            icon={QrCodeIcon}
                        >
                            Scan QR Code
                        </Button>
                    </div>
                }
            />

            {/* Search Bar */}
            <Input
                type="text"
                placeholder="Rechercher un colis à réceptionner..."
                icon={MagnifyingGlassIcon}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Selection Bar */}
            {selectedCodes.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Badge variant="info">
                            {selectedCodes.length} sélectionné(s)
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="indigo"
                            icon={processing ? ArrowPathIcon : CheckCircleIcon}
                            onClick={handleReceiveSelected}
                            disabled={processing}
                            className="flex-1 sm:flex-none"
                        >
                            Réceptionner la sélection
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setSelectedCodes([])}
                            className="flex-1 sm:flex-none"
                        >
                            Annuler
                        </Button>
                    </div>
                </div>
            )}

            {/* Table Section */}
            <Table>
                <TableHeader>
                    <tr>
                        <TableHeaderCell className="w-10">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                checked={selectableColis.length > 0 && selectedCodes.length === selectableColis.length}
                                onChange={toggleSelectAll}
                            />
                        </TableHeaderCell>
                        <TableHeaderCell>Colis / Désignation</TableHeaderCell>
                        <TableHeaderCell>Provenance</TableHeaderCell>
                        <TableHeaderCell>Destination</TableHeaderCell>
                        <TableHeaderCell>Poids</TableHeaderCell>
                        <TableHeaderCell align="right">Action</TableHeaderCell>
                    </tr>
                </TableHeader>
                <TableBody>
                    {loading && (reception || []).length === 0 ? (
                        <TableLoading rows={5} cols={6} />
                    ) : filteredColis.length > 0 ? (
                        groupedExpeditions.map((exp) => {
                            const expColis = (exp.colis || []).map(c => ({
                                ...c,
                                expedition: exp,
                                is_received: c.is_received_by_agence_destination === true
                            })).filter(c => {
                                if (!searchQuery) return true;
                                const lowQuery = searchQuery.toLowerCase();
                                return c.code_colis?.toLowerCase().includes(lowQuery) ||
                                    c.designation?.toLowerCase().includes(lowQuery);
                            });

                            if (expColis.length === 0) return null;

                            return (
                                <React.Fragment key={exp.id}>
                                    {/* Expedition Header Row */}
                                    <tr className="bg-slate-50">
                                        <td className="px-6 py-3"></td>
                                        <td colSpan="4" className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-2">
                                                    <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-xs font-semibold text-slate-700">{exp.reference}</span>
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {exp.pays_depart} → {exp.pays_destination}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-3 text-xs">
                                                <span className="text-slate-500">Total:</span>
                                                <span className="font-semibold text-indigo-600">{formatPriceDual(exp.montant_total)}</span>
                                                <Badge variant={exp.statut_paiement === 'paye' ? 'success' : 'warning'}>
                                                    {exp.statut_paiement === 'paye' ? 'Payé' : 'Impayé'}
                                                </Badge>
                                                <span className="text-slate-400">{exp.colis?.length} colis</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {expColis.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            onClick={() => !item.is_received && toggleSelect(item.code_colis)}
                                            className={`${item.is_received ? 'bg-emerald-50/30' : selectedCodes.includes(item.code_colis) ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                {!item.is_received ? (
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                        checked={selectedCodes.includes(item.code_colis)}
                                                        onChange={() => toggleSelect(item.code_colis)}
                                                    />
                                                ) : (
                                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                        <InboxArrowDownIcon className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-semibold text-slate-900">{item.code_colis}</p>
                                                        <p className="text-xs text-slate-500">{item.designation || 'Désignation non spécifiée'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <InboxArrowDownIcon className="w-4 h-4 text-slate-400 rotate-180" />
                                                    <span className="text-sm text-slate-700">{exp.pays_depart}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <InboxArrowDownIcon className="w-4 h-4 text-indigo-600" />
                                                    <span className="text-sm text-slate-700">{exp.pays_destination}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-semibold text-slate-900">{parseFloat(item.poids).toFixed(2)} kg</span>
                                            </TableCell>
                                            <TableCell align="right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/expeditions/${exp.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            Détails
                                                        </Button>
                                                    </Link>
                                                    {!item.is_received ? (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            icon={InboxArrowDownIcon}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReceiveSingle(item.code_colis);
                                                            }}
                                                            disabled={processing}
                                                        >
                                                            Réceptionner
                                                        </Button>
                                                    ) : (
                                                        <Badge variant="success" className="flex items-center gap-1">
                                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                                            Reçu
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <TableEmpty 
                            message="Aucun colis à réceptionner"
                            description="Les colis en attente de réception à destination apparaîtront ici."
                            icon={InboxArrowDownIcon}
                        />
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {receptionMeta && receptionMeta.last_page > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-xl">
                    <p className="text-sm text-slate-500">
                        Page <span className="font-semibold text-slate-900">{receptionMeta.current_page}</span> sur <span className="font-semibold text-slate-900">{receptionMeta.last_page}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={ChevronLeftIcon}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                        <Button
                            variant="primary"
                            size="sm"
                            icon={ChevronRightIcon}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === receptionMeta.last_page}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColisAReceptionner;
