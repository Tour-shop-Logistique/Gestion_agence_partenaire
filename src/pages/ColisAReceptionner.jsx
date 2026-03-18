import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
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
        <DashboardLayout>
            <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-1 sm:px-0">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                                <InboxArrowDownIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                                Colis à réceptionner
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-slate-500 tracking-wide ml-14">
                            Expéditions en transit entrant dans votre pays
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <button
                            onClick={() => fetchReceptionData(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            ACTUALISER
                        </button>
                        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95">
                            <QrCodeIcon className="w-4 h-4" />
                            SCAN QR CODE
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
                        placeholder="Rechercher un colis à réceptionner..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Selection Bar (only if items are selected) */}
                {selectedCodes.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border-2 border-indigo-500 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                                {selectedCodes.length} SÉLECTIONNÉ(S)
                            </span>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <button
                                onClick={handleReceiveSelected}
                                disabled={processing}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                {processing && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                                RÉCEPTIONNER LA SÉLECTION
                            </button>
                            <button
                                onClick={() => setSelectedCodes([])}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                ANNULER
                            </button>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="overflow-x-auto rounded-[2rem]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200">
                                    <th className="px-6 py-6 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                            checked={selectableColis.length > 0 && selectedCodes.length === selectableColis.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Colis / Désignation</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Provenance</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Destination</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Poids</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading && (reception || []).length === 0 ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-8" colSpan="6">
                                                <div className="h-16 bg-slate-50 rounded-2xl w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredColis.length > 0 ? (
                                    // Grouping display like the image
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
                                                <tr className="bg-slate-50/30 border-t border-slate-100">
                                                    <td className="px-6 py-3"></td>
                                                    <td colSpan="4" className="px-6 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-2">
                                                                <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400" />
                                                                <span className="text-[10px] font-black text-slate-700">{exp.reference}</span>
                                                            </div>
                                                            <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                                {exp.pays_depart} → {exp.pays_destination}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-3 text-[10px] font-black">
                                                            <span className="text-slate-400">TOTAL EXPÉDITION</span>
                                                            <span className="text-indigo-600">{formatPriceDual(exp.montant_total)}</span>
                                                            <span className={`px-2 py-0.5 rounded ${exp.statut_paiement === 'paye' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} uppercase`}>
                                                                {exp.statut_paiement === 'paye' ? 'PAYÉ' : 'IMPAYÉ'}
                                                            </span>
                                                            <span className="text-slate-400">{exp.colis?.length} COLIS</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expColis.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${item.is_received ? 'bg-emerald-50/30' : selectedCodes.includes(item.code_colis) ? 'bg-indigo-50/20' : ''}`}
                                                        onClick={() => !item.is_received && toggleSelect(item.code_colis)}
                                                    >
                                                        <td className="px-6 py-8" onClick={(e) => e.stopPropagation()}>
                                                            {!item.is_received ? (
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                                                    checked={selectedCodes.includes(item.code_colis)}
                                                                    onChange={() => toggleSelect(item.code_colis)}
                                                                />
                                                            ) : (
                                                                <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200/50 group-hover:bg-white transition-colors">
                                                                    <InboxArrowDownIcon className="w-6 h-6 text-slate-400" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-black text-slate-900 tracking-tight">{item.code_colis}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.designation || 'DÉSIGNATION NON SPÉCIFIÉE'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8">
                                                            <div className="flex items-center gap-2">
                                                                <InboxArrowDownIcon className="w-4 h-4 text-slate-400 rotate-180" />
                                                                <span className="text-xs font-black text-slate-700 uppercase">{exp.pays_depart}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8">
                                                            <div className="flex items-center gap-2">
                                                                <InboxArrowDownIcon className="w-4 h-4 text-indigo-600" />
                                                                <span className="text-xs font-black text-slate-700 uppercase">{exp.pays_destination}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8">
                                                            <span className="text-xs font-black text-slate-900">{parseFloat(item.poids).toFixed(2)} kg</span>
                                                        </td>
                                                        <td className="px-6 py-8 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <Link
                                                                    to={`/expeditions/${exp.id}`}
                                                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                                >
                                                                    DÉTAILS
                                                                </Link>
                                                                {!item.is_received ? (
                                                                    <button
                                                                        onClick={() => handleReceiveSingle(item.code_colis)}
                                                                        disabled={processing}
                                                                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                                                                    >
                                                                        <InboxArrowDownIcon className="w-3.5 h-3.5" />
                                                                        RÉCEPTIONNER
                                                                    </button>
                                                                ) : (
                                                                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                        REÇU
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="space-y-4">
                                                <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto">
                                                    <InboxArrowDownIcon className="w-12 h-12 text-slate-200" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-black text-slate-900">Désolé aucune donnée disponible</p>
                                                    <p className="text-sm text-slate-400 font-medium">Les colis en attente de réception à destination apparaîtront ici.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {
                        receptionMeta && receptionMeta.last_page > 1 && (
                            <div className="flex items-center justify-between px-8 py-6 bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40">
                                <p className="text-xs font-bold text-slate-400">
                                    AFFICHAGE DE LA PAGE <span className="text-slate-900">{receptionMeta.current_page}</span> SUR <span className="text-slate-900">{receptionMeta.last_page}</span>
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === receptionMeta.last_page}
                                        className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-30 transition-all shadow-lg shadow-slate-200"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ColisAReceptionner;
