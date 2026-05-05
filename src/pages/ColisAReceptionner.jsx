import React, { useEffect, useState, useMemo } from "react";
import { useExpedition } from "../hooks/useExpedition";
import { Link } from "react-router-dom";
import { toast } from "../utils/toast";
import {
    InboxArrowDownIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    QrCodeIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    InformationCircleIcon,
    MapPinIcon,
    CheckIcon
} from "@heroicons/react/24/outline";
import QRScanner from "../components/QRScanner";
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
    const [scannerOpen, setScannerOpen] = useState(false);

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

    // Filtrer et trier les colis - Non réceptionnés en premier
    const filteredColis = useMemo(() => {
        let filtered = flatColis;
        
        // Appliquer le filtre de recherche
        if (searchQuery) {
            const lowQuery = searchQuery.toLowerCase();
            filtered = flatColis.filter(item =>
                item.code_colis?.toLowerCase().includes(lowQuery) ||
                item.designation?.toLowerCase().includes(lowQuery) ||
                item.expedition?.reference?.toLowerCase().includes(lowQuery) ||
                item.expedition?.pays_depart?.toLowerCase().includes(lowQuery)
            );
        }
        
        // Trier : colis non réceptionnés en premier
        return filtered.sort((a, b) => {
            const aReceived = a.is_received ? 1 : 0;
            const bReceived = b.is_received ? 1 : 0;
            return aReceived - bReceived;
        });
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

    const handleQRScan = (scannedData) => {
        // Le QR code peut contenir soit le code_colis directement, soit l'ID de l'expédition
        // On va chercher dans la liste des colis
        
        // Chercher par code_colis exact
        let foundColis = filteredColis.find(c => c.code_colis === scannedData);
        
        // Si pas trouvé, chercher par code_colis partiel (au cas où le QR contient plus d'infos)
        if (!foundColis) {
            foundColis = filteredColis.find(c => scannedData.includes(c.code_colis));
        }
        
        // Si pas trouvé, chercher par ID d'expédition
        if (!foundColis) {
            foundColis = filteredColis.find(c => 
                c.expedition_id === parseInt(scannedData) || 
                c.expedition?.id === parseInt(scannedData)
            );
        }
        
        if (foundColis && !foundColis.is_received) {
            // Sélectionner le colis trouvé
            if (!selectedCodes.includes(foundColis.code_colis)) {
                setSelectedCodes(prev => [...prev, foundColis.code_colis]);
            }
            
            // Afficher un message de succès
            toast.success(`Colis ${foundColis.code_colis} sélectionné !`);
            
            // Scroll vers le colis dans la liste
            setTimeout(() => {
                const element = document.getElementById(`colis-${foundColis.code_colis}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } else if (foundColis && foundColis.is_received) {
            toast.info(`Le colis ${foundColis.code_colis} a déjà été réceptionné.`);
        } else {
            toast.error(`Aucun colis trouvé avec le code scanné : ${scannedData}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header Section - Design SaaS Minimaliste */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Colis à réceptionner
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gérez les colis en transit vers votre agence
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchReceptionData(true)}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                    <button 
                        onClick={() => setScannerOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <QrCodeIcon className="w-4 h-4 mr-2" />
                        Scanner
                    </button>
                </div>
            </div>

            {/* QR Scanner Modal */}
            <QRScanner 
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleQRScan}
            />

            {/* Search Bar - Design SaaS Minimaliste */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    placeholder="Rechercher par code, désignation, référence..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Selection Bar - Design SaaS Minimaliste */}
            {selectedCodes.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">
                            {selectedCodes.length} sélectionné{selectedCodes.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReceiveSelected}
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {processing ? (
                                <>
                                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                    Réceptionner
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setSelectedCodes([])}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Table Section - Design SaaS Minimaliste */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectableColis.length > 0 && selectedCodes.length === selectableColis.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Colis
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Provenance
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Destination
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Poids
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">{loading && (reception || []).length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-4 py-12 text-center">
                                <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                                <p className="mt-2 text-sm text-gray-500">Chargement...</p>
                            </td>
                        </tr>
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
                            }).sort((a, b) => {
                                // Trier : non réceptionnés en premier
                                const aReceived = a.is_received ? 1 : 0;
                                const bReceived = b.is_received ? 1 : 0;
                                return aReceived - bReceived;
                            });

                            if (expColis.length === 0) return null;

                            return (
                                <React.Fragment key={exp.id}>
                                    {/* Expedition Header Row - Minimaliste */}
                                    <tr className="bg-gray-50">
                                        <td className="px-4 py-2"></td>
                                        <td colSpan="6" className="px-4 py-2">
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="font-medium text-gray-900">{exp.reference}</span>
                                                <span className="text-gray-500">•</span>
                                                <span className="text-gray-600">{exp.pays_depart} → {exp.pays_destination}</span>
                                                <span className="text-gray-500">•</span>
                                                <span className="text-gray-500">{exp.colis?.length} colis</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {expColis.map((item) => (
                                        <tr
                                            key={item.id}
                                            id={`colis-${item.code_colis}`}
                                            onClick={() => !item.is_received && toggleSelect(item.code_colis)}
                                            className={`${
                                                item.is_received 
                                                    ? 'bg-gray-50' 
                                                    : selectedCodes.includes(item.code_colis) 
                                                        ? 'bg-indigo-50' 
                                                        : 'hover:bg-gray-50'
                                            } cursor-pointer transition-colors`}
                                        >
                                            <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                {!item.is_received ? (
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedCodes.includes(item.code_colis)}
                                                        onChange={() => toggleSelect(item.code_colis)}
                                                    />
                                                ) : (
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg">
                                                        <InboxArrowDownIcon className="h-5 w-5 text-gray-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.code_colis}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {item.designation || 'Sans désignation'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{exp.pays_depart}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{exp.pays_destination}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{parseFloat(item.poids).toFixed(2)} kg</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {item.is_received ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                                        Reçu
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        En attente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/expeditions/${exp.id}`}>
                                                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                                                            Détails
                                                        </button>
                                                    </Link>
                                                    {!item.is_received && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReceiveSingle(item.code_colis);
                                                            }}
                                                            disabled={processing}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                                        >
                                                            Réceptionner
                                                        </button>
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
                            <td colSpan="7" className="px-4 py-12 text-center">
                                <InboxArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun colis</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Les colis en attente de réception apparaîtront ici.
                                </p>
                            </td>
                        </tr>
                    )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination - Design SaaS Minimaliste */}
            {receptionMeta && receptionMeta.last_page > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === receptionMeta.last_page}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Page <span className="font-medium">{receptionMeta.current_page}</span> sur{' '}
                                <span className="font-medium">{receptionMeta.last_page}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === receptionMeta.last_page}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColisAReceptionner;
