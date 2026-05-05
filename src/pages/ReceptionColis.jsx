import { useState, useMemo, useEffect } from "react";
import {
    InboxArrowDownIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    MapPinIcon,
    CalendarIcon,
    CubeIcon,
    InformationCircleIcon,
    CheckIcon
} from "@heroicons/react/24/outline";
import { useExpedition } from "../hooks/useExpedition";
import { toast } from "../utils/toast";

const ReceptionColis = () => {
    // Version: 2.0 - Tableau avec tri automatique
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

    // Filter and sort logic - Non réceptionnés en premier
    const filteredColis = useMemo(() => {
        let filtered = colisList;
        
        // Appliquer le filtre de recherche
        if (searchQuery) {
            const lowQuery = searchQuery.toLowerCase();
            filtered = colisList.filter(item =>
                item.code_colis?.toLowerCase().includes(lowQuery) ||
                item.expedition?.reference?.toLowerCase().includes(lowQuery) ||
                item.expedition?.pays_depart?.toLowerCase().includes(lowQuery) ||
                item.designation?.toLowerCase().includes(lowQuery)
            );
        }
        
        // Trier : colis non réceptionnés en premier
        const sorted = filtered.sort((a, b) => {
            const aReceived = a.is_received_by_agence_destination ? 1 : 0;
            const bReceived = b.is_received_by_agence_destination ? 1 : 0;
            return aReceived - bReceived;
        });
        
        // Debug : afficher l'ordre des colis
        console.log('📦 Colis triés (non réceptionnés en premier):', sorted.map(c => ({
            code: c.code_colis,
            receptionne: c.is_received_by_agence_destination,
            ordre: c.is_received_by_agence_destination ? '2-Reçu' : '1-En attente'
        })));
        
        return sorted;
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
        <div className="space-y-6 sm:space-y-8 max-w-[1800px] mx-auto px-4 sm:px-6">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-300/50">
                            <InboxArrowDownIcon className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                            Réception des Colis 📦 [NOUVEAU]
                        </h1>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 tracking-wide ml-14">
                        Gérez l'arrivée des colis à votre agence (Destination)
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    {/* Search Bar */}
                    <div className="relative group flex-1 sm:w-80 lg:w-96">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-slate-300"
                            placeholder="Rechercher par code, pays, expédition..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => loadReception({ page: 1 }, true)}
                        disabled={isRefreshing}
                        className="p-3.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-lg hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    { label: "En attente à l'agence", count: statsEnAttente, color: "bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-800 border-amber-200", icon: "⏳" },
                    { label: "Colis reçus", count: statsRecus, color: "bg-gradient-to-br from-green-50 to-green-100/50 text-green-800 border-green-200", icon: "✓" },
                    { label: "Total à traiter", count: statsTotal, color: "bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-800 border-indigo-200", icon: "📦" }
                ].map((stat, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border-2 ${stat.color} flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{stat.icon}</span>
                            <span className="text-sm font-bold uppercase tracking-wide">{stat.label}</span>
                        </div>
                        <span className="text-3xl font-bold">{stat.count}</span>
                    </div>
                ))}
            </div>

            {/* Bulk Actions */}
            {completableList.length > 0 && (
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-indigo-50/30 border-2 border-indigo-200 rounded-2xl shadow-md">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={selectAll}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${selectedColis.length > 0 && selectedColis.length === completableList.length
                                    ? 'bg-indigo-600 border-indigo-600 shadow-md'
                                    : 'bg-white border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
                                }`}
                        >
                            {selectedColis.length > 0 && selectedColis.length === completableList.length && (
                                <CheckIcon className="w-5 h-5 text-white" />
                            )}
                        </button>
                        <span className="text-sm font-bold text-slate-800">
                            {selectedColis.length} colis sélectionné{selectedColis.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    {selectedColis.length > 0 && (
                        <button
                            onClick={handleValidateMultiple}
                            disabled={isRefreshing}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-300/50 active:scale-95 disabled:opacity-50"
                        >
                            {isRefreshing ? "Validation..." : "Valider la sélection"}
                        </button>
                    )}
                </div>
            )}

            {/* Main List - Tableau amélioré */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg overflow-hidden">
                {filteredColis.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                                    {completableList.length > 0 && (
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={selectAll}
                                                className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${selectedColis.length > 0 && selectedColis.length === completableList.length
                                                        ? 'bg-indigo-600 border-indigo-600'
                                                        : 'bg-white border-slate-300 hover:border-indigo-400'
                                                    }`}
                                            >
                                                {selectedColis.length > 0 && selectedColis.length === completableList.length && (
                                                    <CheckIcon className="w-4 h-4 text-white" />
                                                )}
                                            </button>
                                        </th>
                                    )}
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Code Colis</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Désignation</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Poids</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Expédition</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Trajet</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date Création</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Contenu</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-100">
                                {filteredColis.map((item) => {
                                    const isReceived = item.is_received_by_agence_destination;
                                    const isSelected = selectedColis.includes(item.code_colis);

                                    return (
                                        <tr
                                            key={item.id || item.code_colis}
                                            className={`transition-all duration-200 ${isReceived 
                                                    ? 'bg-green-50/30 hover:bg-green-50/50' 
                                                    : isSelected 
                                                        ? 'bg-indigo-50 hover:bg-indigo-100/70' 
                                                        : 'hover:bg-slate-50'
                                                } border-l-4 ${isReceived 
                                                    ? 'border-l-green-500' 
                                                    : isSelected 
                                                        ? 'border-l-indigo-500' 
                                                        : 'border-l-transparent hover:border-l-slate-300'
                                                }`}
                                        >
                                            {/* Checkbox de sélection */}
                                            {!isReceived && (
                                                <td className="px-6 py-5">
                                                    <button
                                                        onClick={() => toggleSelection(item.code_colis)}
                                                        className="p-0.5"
                                                    >
                                                        <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 hover:border-indigo-400'}`}>
                                                            {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                                                        </div>
                                                    </button>
                                                </td>
                                            )}
                                            {isReceived && completableList.length > 0 && <td className="px-6 py-5"></td>}

                                            {/* Code Colis */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-indigo-600 uppercase">#{item.code_colis}</span>
                                                </div>
                                            </td>

                                            {/* Désignation */}
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-semibold text-slate-900 capitalize">{item.designation || 'Colis'}</span>
                                            </td>

                                            {/* Poids */}
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg uppercase">
                                                    {item.poids || 0} KG
                                                </span>
                                            </td>

                                            {/* Expédition */}
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-semibold text-slate-700">{item.expedition?.reference || '-'}</span>
                                            </td>

                                            {/* Trajet */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {item.expedition?.pays_depart || '-'} → {item.expedition?.pays_destination || '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Date Création */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-semibold text-slate-700">{formatDate(item.created_at)}</span>
                                                </div>
                                            </td>

                                            {/* Contenu */}
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-medium text-slate-600 line-clamp-2">
                                                    {Array.isArray(item.articles) ? item.articles.join(', ') : (item.articles || '-')}
                                                </span>
                                            </td>

                                            {/* Statut */}
                                            <td className="px-6 py-5">
                                                {isReceived ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        REÇU
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                                                        ⏳ EN ATTENTE
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action */}
                                            <td className="px-6 py-5 text-center">
                                                {!isReceived ? (
                                                    <button
                                                        onClick={() => handleValidateReception(item.code_colis)}
                                                        disabled={isRefreshing}
                                                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md shadow-indigo-300/50 active:scale-95 disabled:opacity-50"
                                                    >
                                                        Valider
                                                    </button>
                                                ) : (
                                                    <span className="text-xs font-semibold text-green-600">✓ Validé</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="p-5 bg-slate-50 rounded-full w-fit mx-auto">
                            <CubeIcon className="w-16 h-16 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold text-slate-900">
                                {isRefreshing ? 'Chargement en cours...' : 'Aucun colis trouvé'}
                            </p>
                            <p className="text-sm text-slate-500 font-semibold">
                                {isRefreshing ? 'Veuillez patienter.' : 'Réessayez avec d\'autres termes de recherche ou rafraîchissez.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Help Footer */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-5 max-w-3xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <InformationCircleIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold">Besoin d'aide avec la réception ?</h3>
                    </div>
                    <p className="text-indigo-100 text-base font-medium leading-relaxed">
                        Cette page affiche la liste des colis rattachés aux expéditions en cours de transit vers votre agence.
                        Une fois qu'un colis arrive physiquement, vous pouvez valider sa réception. Le statut du colis
                        sera alors mis à jour sur tout le réseau.
                    </p>
                    <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide bg-white text-indigo-900 px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                        📖 Consulter le guide
                    </button>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default ReceptionColis;
