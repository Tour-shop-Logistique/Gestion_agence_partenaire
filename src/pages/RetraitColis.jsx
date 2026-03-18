import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    MagnifyingGlassIcon,
    ArrowPathIcon,
    UserIcon,
    PhoneIcon,
    CubeIcon,
    InformationCircleIcon,
    CheckIcon,
    UserCircleIcon,
    ArrowRightCircleIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { useExpedition } from "../hooks/useExpedition";
import { toast } from "../utils/toast";
import ConfirmationModal from "../components/ConfirmationModal";

const RetraitColis = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedColis, setSelectedColis] = useState([]);
    const [localLoading, setLocalLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otp, setOtp] = useState("");

    const {
        loadColis,
        initiateRecupColis,
        verifyRecupColis,
        loading,
        message,
        error,
        resetStatus
    } = useExpedition();

    // Handle toast messages
    useEffect(() => {
        if (message) {
            toast.success(message);
            resetStatus();
        }
        if (error) {
            toast.error(error);
            resetStatus();
        }
    }, [message, error, resetStatus]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery) return;

        setLocalLoading(true);
        // On utilise loadColis avec search et is_collected=false
        const result = await loadColis({ 
            search: searchQuery, 
            is_collected: false 
        }, true);
        
        if (result && result.payload) {
            setSearchResults(result.payload.data || []);
            setSelectedColis([]);
        }
        setLocalLoading(false);
    };

    const handleInitiateRecup = async () => {
        if (selectedColis.length === 0) return;
        setLocalLoading(true);
        const res = await initiateRecupColis(selectedColis);
        setLocalLoading(false);
        if (res?.meta?.requestStatus === 'fulfilled') {
            setIsOtpModalOpen(true);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error("Veuillez saisir le code OTP");
            return;
        }
        setLocalLoading(true);
        const res = await verifyRecupColis({ codes: selectedColis, otp });
        setLocalLoading(false);
        if (res?.meta?.requestStatus === 'fulfilled') {
            setIsOtpModalOpen(false);
            setOtp("");
            setSelectedColis([]);
            // Refresh search results
            handleSearch();
        }
    };

    const toggleSelection = (code_colis) => {
        setSelectedColis(prev =>
            prev.includes(code_colis)
                ? prev.filter(c => c !== code_colis)
                : [...prev, code_colis]
        );
    };

    const selectAll = () => {
        const selectable = searchResults.map(c => c.code_colis);
        if (selectedColis.length === selectable.length && selectable.length > 0) {
            setSelectedColis([]);
        } else {
            setSelectedColis(selectable);
        }
    };

    const isRefreshing = loading || localLoading;

    return (
        <DashboardLayout>
            <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-1 sm:px-0">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                                <UserCircleIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                                Retrait Client
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-slate-500 tracking-wide ml-14">
                            Validez la remise physique des colis aux clients
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                        <div className="relative group flex-1 sm:w-80 lg:w-96">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                                placeholder="Téléphone client ou Code Colis..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isRefreshing || !searchQuery}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Rechercher
                        </button>
                    </form>
                </div>

                {/* Main Content Areas */}
                {searchResults.length > 0 ? (
                    <div className="space-y-6">
                        {/* Summary & Bulk Action */}
                        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={selectAll}
                                    className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${selectedColis.length > 0 && selectedColis.length === searchResults.length
                                            ? 'bg-emerald-600 border-emerald-600'
                                            : 'bg-white border-slate-300 hover:border-emerald-400'
                                        }`}
                                >
                                    {selectedColis.length > 0 && selectedColis.length === searchResults.length && (
                                        <CheckIcon className="w-4 h-4 text-white" />
                                    )}
                                </button>
                                <span className="text-sm font-bold text-emerald-800">
                                    {selectedColis.length} colis sélectionné(s) sur {searchResults.length} trouvé(s)
                                </span>
                            </div>
                            {selectedColis.length > 0 && (
                                <button
                                    onClick={handleInitiateRecup}
                                    disabled={isRefreshing}
                                    className="px-6 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 flex items-center gap-2"
                                >
                                    <ArrowRightCircleIcon className="w-5 h-5" />
                                    Initier le retrait
                                </button>
                            )}
                        </div>

                        {/* Results Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {searchResults.map((item) => {
                                const isSelected = selectedColis.includes(item.code_colis);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleSelection(item.code_colis)}
                                        className={`cursor-pointer bg-white p-6 rounded-3xl border transition-all duration-300 flex flex-col gap-4 relative ${
                                            isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/5' : 'border-slate-200 hover:shadow-xl'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'}`}>
                                                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className="text-xs font-black text-emerald-600 uppercase">#{item.code_colis}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900">{item.designation}</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Expédition</span>
                                                <p className="text-xs font-bold text-slate-900">{item.expedition?.reference || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 py-3 border-y border-slate-50">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-700">{item.expedition?.destinataire_telephone || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-700">{item.expedition?.destinataire_nom_prenom || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="w-px h-8 bg-slate-100"></div>
                                            <div className="flex-1 text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Poids</p>
                                                <span className="text-sm font-black text-slate-900">{item.poids} KG</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                            <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                                            <span>Statut d'expédition : <span className="text-slate-900 font-bold">{item.expedition?.statut_expedition?.replace(/_/g, ' ')}</span></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-24 text-center space-y-6">
                        <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto">
                            <CubeIcon className="w-16 h-16 text-slate-300" />
                        </div>
                        <div className="max-w-md mx-auto space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900">Prêt pour un retrait ?</h2>
                            <p className="text-slate-500 font-medium">
                                Recherchez un numéro de téléphone ou un code colis pour lister les articles éligibles au retrait.
                            </p>
                        </div>
                    </div>
                )}

                {/* OTP Modal */}
                <ConfirmationModal
                    isOpen={isOtpModalOpen}
                    onClose={() => setIsOtpModalOpen(false)}
                    onConfirm={handleVerifyOtp}
                    title="Validation du retrait"
                    confirmText="Confirmer le retrait"
                    type="success"
                    isLoading={isRefreshing}
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl flex gap-3 items-start">
                            <ShieldCheckIcon className="w-6 h-6 text-emerald-600 shrink-0" />
                            <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                                Un code de validation à 6 chiffres a été envoyé au client par SMS/Email. 
                                Veuillez le saisir pour finaliser la remise des {selectedColis.length} colis.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Code de validation (OTP)</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                placeholder="000000"
                            />
                        </div>
                    </div>
                </ConfirmationModal>
            </div>
        </DashboardLayout>
    );
};

export default RetraitColis;
