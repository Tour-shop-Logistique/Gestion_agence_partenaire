import React, { useState, useMemo, useEffect } from "react";
import {
    InboxArrowDownIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    CalendarIcon,
    CubeIcon,
    InformationCircleIcon,
    CheckIcon
} from "@heroicons/react/24/outline";
import { useExpedition } from "../hooks/useExpedition";
import { toast } from "../utils/toast";

const ReceptionColis = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedColis, setSelectedColis] = useState([]);
    const [localLoading, setLocalLoading] = useState(false);

    const {
        reception,
        loadReception,
        receiveColisDestination,
        loading,
        message,
        error,
        resetStatus
    } = useExpedition();

    // Fetch data on mount
    useEffect(() => {
        loadReception({ page: 1 }, true);
    }, [loadReception]);

    // Handle toast messages
    useEffect(() => {
        if (message) {
            toast.success(message);
            setSelectedColis([]);
            resetStatus();
        }
        if (error) {
            toast.error(error);
            resetStatus();
        }
    }, [message, error, resetStatus]);

    // Ensure reception is an array
    const colisList = Array.isArray(reception) ? reception : [];

    // Filter logic
    const filteredColis = useMemo(() => {
        if (!searchQuery) return colisList;
        const lowQuery = searchQuery.toLowerCase();
        return colisList.filter(item =>
            item.code_colis?.toLowerCase().includes(lowQuery) ||
            item.expedition?.reference?.toLowerCase().includes(lowQuery) ||
            item.expedition?.pays_depart?.toLowerCase().includes(lowQuery) ||
            item.designation?.toLowerCase().includes(lowQuery)
        );
    }, [colisList, searchQuery]);

    const handleValidateReception = async (code_colis) => {
        setLocalLoading(true);
        await receiveColisDestination([code_colis]);
        setLocalLoading(false);
    };

    const handleValidateMultiple = async () => {
        if (selectedColis.length === 0) return;
        setLocalLoading(true);
        await receiveColisDestination(selectedColis);
        setLocalLoading(false);
    };

    const toggleSelection = (code_colis) => {
        setSelectedColis(prev =>
            prev.includes(code_colis)
                ? prev.filter(c => c !== code_colis)
                : [...prev, code_colis]
        );
    };

    const selectAll = () => {
        const selectable = filteredColis
            .filter(c => !c.is_received_by_agence_destination)
            .map(c => c.code_colis);
        if (selectedColis.length === selectable.length && selectable.length > 0) {
            setSelectedColis([]);
        } else {
            setSelectedColis(selectable);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const isRefreshing = loading || localLoading;

    // Calculs de statistiques
    const statsEnAttente = colisList.filter(c => !c.is_received_by_agence_destination).length;
    const statsRecus = colisList.filter(c => c.is_received_by_agence_destination).length;
    const statsTotal = colisList.length;

    const completableList = filteredColis.filter(c => !c.is_received_by_agence_destination);

    return (
        <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-1 sm:px-0">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                            <InboxArrowDownIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                            Réception des Colis
                        </h1>
                    </div>
                    <p className="text-sm font-medium text-slate-500 tracking-wide ml-1 ml-14">
                        Gérez l'arrivée des colis à votre agence (Destination)
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    {/* Search Bar */}
                    <div className="relative group flex-1 sm:w-80 lg:w-96">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                            placeholder="Rechercher par code, pays, expédition..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => loadReception({ page: 1 }, true)}
                        disabled={isRefreshing}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "En attente à l'agence", count: statsEnAttente, color: "bg-amber-50 text-amber-700 border-amber-100" },
                    { label: "Colis reçus", count: statsRecus, color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
                    { label: "Total à traiter", count: statsTotal, color: "bg-slate-50 text-slate-700 border-slate-100" }
                ].map((stat, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${stat.color} flex items-center justify-between`}>
                        <span className="text-sm font-bold uppercase tracking-wider">{stat.label}</span>
                        <span className="text-2xl font-black">{stat.count}</span>
                    </div>
                ))}
            </div>

            {/* Bulk Actions */}
            {completableList.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={selectAll}
                            className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${selectedColis.length > 0 && selectedColis.length === completableList.length
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : 'bg-white border-slate-300 hover:border-indigo-400'
                                }`}
                        >
                            {selectedColis.length > 0 && selectedColis.length === completableList.length && (
                                <CheckIcon className="w-4 h-4 text-white" />
                            )}
                        </button>
                        <span className="text-sm font-bold text-slate-700">
                            {selectedColis.length} sélectionné(s)
                        </span>
                    </div>
                    {selectedColis.length > 0 && (
                        <button
                            onClick={handleValidateMultiple}
                            disabled={isRefreshing}
                            className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95 disabled:opacity-50"
                        >
                            {isRefreshing ? "Validation..." : "Valider la sélection"}
                        </button>
                    )}
                </div>
            )}

            {/* Main List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredColis.length > 0 ? (
                    filteredColis.map((item) => {
                        const isReceived = item.is_received_by_agence_destination;
                        const isSelected = selectedColis.includes(item.code_colis);

                        return (
                            <div
                                key={item.id || item.code_colis}
                                className={`relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isReceived ? 'border-indigo-100 bg-indigo-50/10' :
                                        isSelected ? 'border-indigo-400 ring-2 ring-indigo-400/20' : 'border-slate-200 hover:shadow-xl hover:shadow-slate-200/50'
                                    }`}
                            >
                                {/* Selection Toggle Mask */}
                                {!isReceived && (
                                    <button
                                        onClick={() => toggleSelection(item.code_colis)}
                                        className="absolute top-4 left-4 z-10 p-1"
                                    >
                                        <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                                        </div>
                                    </button>
                                )}

                                <div className="p-6 space-y-4">
                                    {/* Top Section: Badges and Code */}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 pl-8">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-indigo-600 tracking-wider uppercase">#{item.code_colis}</span>
                                                {isReceived && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        REÇU
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-lg font-bold text-slate-900 capitalize">{item.designation || 'Colis'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">
                                                {item.poids || 0} KG
                                            </span>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Exp: {item.expedition?.reference || '-'}</p>
                                        </div>
                                    </div>

                                    {/* Additional Info / Grid */}
                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 pl-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
                                                    <UserIcon className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Client</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">Contactez le Hub</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
                                                    <MapPinIcon className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Trajet</p>
                                                    <p className="text-sm font-bold text-slate-600 truncate">
                                                        {item.expedition?.pays_depart || '-'} → {item.expedition?.pays_destination || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
                                                    <CalendarIcon className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Création</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">{formatDate(item.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
                                                    <InformationCircleIcon className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Contenu</p>
                                                    <p className="text-xs font-bold text-slate-900 truncate">
                                                        {Array.isArray(item.articles) ? item.articles.join(', ') : (item.articles || '-')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex items-center justify-between pt-2 pl-8">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <InformationCircleIcon className="w-4 h-4" />
                                            <span className="text-[11px] font-medium italic">
                                                {isReceived ? 'Colis arrivé à destination.' : 'En attente de réception physique'}
                                            </span>
                                        </div>

                                        {!isReceived ? (
                                            <button
                                                onClick={() => handleValidateReception(item.code_colis)}
                                                disabled={isRefreshing}
                                                className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                Valider la réception
                                            </button>
                                        ) : (
                                            <div className="px-6 py-2.5 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100 flex items-center gap-2">
                                                <CheckCircleIcon className="w-4 h-4" />
                                                Colis réceptionné
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto">
                            <CubeIcon className="w-12 h-12 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-bold text-slate-900">
                                {isRefreshing ? 'Chargement en cours...' : 'Aucun colis trouvé'}
                            </p>
                            <p className="text-sm text-slate-500 font-medium">
                                {isRefreshing ? 'Veuillez patienter.' : 'Réessayez avec d\'autres termes de recherche ou rafraîchissez.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Help Footer */}
            <div className="bg-indigo-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden group">
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <h3 className="text-xl sm:text-2xl font-bold">Besoin d'aide avec la réception ?</h3>
                    <p className="text-indigo-100/80 text-sm font-medium leading-relaxed">
                        Cette page affiche la liste des colis rattachés aux expéditions en cours de transit vers votre agence.
                        Une fois qu'un colis arrive physiquement, vous pouvez valider sa réception. Le statut du colis
                        sera alors mis à jour sur tout le réseau.
                    </p>
                    <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white text-indigo-900 px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
                        Consulter le guide
                    </button>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
            </div>
        </div>
    );
};

export default ReceptionColis;
