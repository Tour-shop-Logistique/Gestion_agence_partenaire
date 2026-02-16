import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useExpedition } from "../hooks/useExpedition";
import { Link } from "react-router-dom";
import { formatPriceDual } from "../utils/format";
import {
    CubeIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    TableCellsIcon,
    IdentificationIcon,
    BanknotesIcon,
    ClockIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";

const Colis = () => {
    const { colis, colisMeta, loadColis, loadingColis } = useExpedition();
    const [currentPage, setCurrentPage] = useState(1);

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

    const [dateDebut, setDateDebut] = useState(getFirstDayOfMonth());
    const [dateFin, setDateFin] = useState(getTodayDate());
    const [searchQuery, setSearchQuery] = useState("");

    const fetchColisData = (force = false) => {
        loadColis({
            page: currentPage,
            date_debut: dateDebut,
            date_fin: dateFin
        }, force);
    };

    useEffect(() => {
        fetchColisData();
    }, [currentPage, dateDebut, dateFin, loadColis]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (colisMeta?.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const handleRefresh = () => {
        fetchColisData(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Filter parcels based on search query (local filter for instant response)
    const filteredColis = useMemo(() => {
        if (!searchQuery) return colis;
        const lowerQuery = searchQuery.toLowerCase();
        return colis.filter(item =>
            item.code_colis?.toLowerCase().includes(lowerQuery) ||
            item.designation?.toLowerCase().includes(lowerQuery) ||
            item.expedition?.reference?.toLowerCase().includes(lowerQuery) ||
            item.category?.nom?.toLowerCase().includes(lowerQuery) ||
            item.articles?.some(a => a.toLowerCase().includes(lowerQuery))
        );
    }, [colis, searchQuery]);

    return (
        <DashboardLayout>
            <div className="space-y-4 sm:space-y-8 max-w-[1600px] mx-auto px-1 sm:px-0">
                {/* Premium Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg shrink-0">
                                <CubeIcon className="w-5 h-5 sm:w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                                Liste des Colis
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide ml-10 sm:ml-12">
                            Visualisez et gérez l'ensemble des colis expédiés par votre agence
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full lg:w-auto">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Date Filters */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative group flex-1 sm:w-36 lg:w-40">
                                    <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Du</span>
                                    <input
                                        type="date"
                                        className="block w-full px-2 sm:px-3 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[12px] sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                        value={dateDebut}
                                        onChange={(e) => {
                                            setDateDebut(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                                <div className="relative group flex-1 sm:w-36 lg:w-40">
                                    <span className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Au</span>
                                    <input
                                        type="date"
                                        className="block w-full px-2 sm:px-3 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[12px] sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                        value={dateFin}
                                        onChange={(e) => {
                                            setDateFin(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative group w-full sm:w-64 lg:w-80">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                className="hidden sm:flex p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all group"
                                title="Rafraîchir"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${loadingColis ? 'animate-spin text-indigo-600' : 'group-active:rotate-180 transition-transform duration-500'}`} />
                            </button>
                        </div>

                        {/* Mobile Stats & Refresh */}
                        <div className="flex sm:hidden items-center justify-between gap-3">
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total:</span>
                                <span className="text-sm font-bold text-slate-900">{colisMeta?.total || 0}</span>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm active:bg-slate-50"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${loadingColis ? 'animate-spin text-indigo-600' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Section */}
                <div className="relative">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Colis Info</th>
                                        <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Catégorie & Détails</th>
                                        <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expédition</th>
                                        <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Dimensions & Poids</th>
                                        <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Montant Total</th>
                                        <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loadingColis ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-6" colSpan="6">
                                                    <div className="h-12 bg-slate-50 rounded-xl w-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredColis.length > 0 ? (
                                        filteredColis.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-6 py-6 font-bold text-slate-900">
                                                    <div className="flex flex-col">
                                                        <span className="text-indigo-600">{item.code_colis}</span>
                                                        <span className="text-xs font-semibold text-slate-500">{item.designation}</span>
                                                        <span className="text-[10px] text-slate-400 mt-1">Le {formatDate(item.created_at)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="inline-flex px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase w-fit">
                                                            {item.category?.nom}
                                                        </span>
                                                        <p className="text-[11px] text-slate-600 line-clamp-1 italic italic">{item.articles?.join(', ')}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <Link to={`/expeditions/${item.expedition_id}`} className="group/exp">
                                                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg group-hover/exp:bg-indigo-600 group-hover/exp:text-white transition-all">
                                                            {item.expedition?.reference}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 mt-1">
                                                            <span>{item.expedition?.pays_depart}</span>
                                                            <ArrowPathIcon className="w-2.5 h-2.5" />
                                                            <span className="text-indigo-600">{item.expedition?.pays_destination}</span>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs font-bold text-slate-900">{parseFloat(item.poids)} kg</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            {parseFloat(item.longueur)}x{parseFloat(item.largeur)}x{parseFloat(item.hauteur)} cm
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                            {formatPriceDual(item.montant_colis_total)}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase italic">
                                                            Prestation: {formatPriceDual(item.montant_colis_prestation)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <Link
                                                        to={`/expeditions/${item.expedition_id}`}
                                                        className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <ArrowPathIcon className="w-5 h-5 rotate-45" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="py-20 text-center font-bold text-slate-400 italic">Aucun colis trouvé</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile & Tablet Card View */}
                    <div className="lg:hidden space-y-4">
                        {loadingColis ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-3">
                                    <div className="h-5 bg-slate-100 rounded w-1/3"></div>
                                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                </div>
                            ))
                        ) : filteredColis.length > 0 ? (
                            filteredColis.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden active:scale-[0.98] transition-all">
                                    <div className="p-4 sm:p-5 border-b border-slate-50 bg-slate-50/40">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-indigo-600 tracking-tight">{item.code_colis}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ref: {item.expedition?.reference}</span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase border border-indigo-100">
                                                {item.category?.nom}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.designation}</h3>
                                        <p className="text-[11px] text-slate-500 line-clamp-1 font-medium italic mt-1">{item.articles?.join(', ')}</p>
                                    </div>

                                    <div className="p-4 sm:p-5 grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Dimensions</p>
                                            <p className="text-xs font-bold text-slate-900 tabular-nums">
                                                {parseFloat(item.hauteur)}x{parseFloat(item.largeur)}x{parseFloat(item.longueur)} cm
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">{parseFloat(item.volume).toLocaleString()} cm³</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Poids</p>
                                            <p className="text-xs font-bold text-slate-900 uppercase">{parseFloat(item.poids)} KG</p>
                                        </div>
                                        <div className="space-y-1 col-span-2 pt-2 border-t border-slate-50">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Montant Total</p>
                                            <div className="flex items-baseline justify-between">
                                                <p className="text-sm font-bold text-slate-900 tabular-nums">
                                                    {formatPriceDual(item.montant_colis_total)}
                                                </p>
                                                <Link
                                                    to={`/expeditions/${item.expedition_id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-slate-200"
                                                >
                                                    Détails
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm italic text-slate-400 font-bold">
                                Aucun colis trouvé
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {colisMeta && colisMeta.last_page > 1 && (
                        <div className="mt-6 sm:mt-8 px-4 sm:px-8 py-5 sm:py-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page</span>
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 text-xs font-bold">{colisMeta.current_page} / {colisMeta.last_page}</span>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => handlePageChange(colisMeta.current_page - 1)}
                                    disabled={colisMeta.current_page === 1}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase border border-slate-200 bg-white text-slate-600 disabled:opacity-50 transition-all font-bold"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                    <span>Précédent</span>
                                </button>

                                <button
                                    onClick={() => handlePageChange(colisMeta.current_page + 1)}
                                    disabled={colisMeta.current_page === colisMeta.last_page}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase bg-slate-900 text-white shadow-lg shadow-slate-200 disabled:opacity-50 transition-all font-bold"
                                >
                                    <span>Suivant</span>
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Colis;
