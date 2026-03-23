import React, { useState, useMemo, useEffect } from "react";
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
    ShieldCheckIcon,
    ChevronRightIcon,
    XMarkIcon
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
    const [isPaid, setIsPaid] = useState(false);

    const hasPendingPayment = useMemo(() => {
        return searchResults.some(item => selectedColis.includes(item.code_colis) && item.expedition?.statut_paiement === 'en_attente');
    }, [searchResults, selectedColis]);

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
            setIsPaid(false); // Reset for modal
            setIsOtpModalOpen(true);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error("Veuillez saisir le code OTP");
            return;
        }
        setLocalLoading(true);
        const res = await verifyRecupColis({ 
            codes: selectedColis, 
            otp,
            statut_paiement: isPaid ? 'paye' : null
        });
        setLocalLoading(false);
        if (res?.meta?.requestStatus === 'fulfilled') {
            setIsOtpModalOpen(false);
            setOtp("");
            setSelectedColis([]);
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
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 leading-none">
                        Retrait Colis
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Validation de la remise physique des colis aux clients après authentification.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                            placeholder="Rechercher (Tél ou Code)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isRefreshing || !searchQuery}
                        className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                         {isRefreshing ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : <ArrowPathIcon className="w-4 h-4 mr-2" />}
                        Actualiser
                    </button>
                </form>
            </div>

            {/* Results Section */}
            {searchResults.length > 0 ? (
                <div className="space-y-4">
                    {/* Bulk Action Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox"
                                checked={selectedColis.length > 0 && selectedColis.length === searchResults.length}
                                onChange={selectAll}
                                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500 cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                                {selectedColis.length} colis sélectionné(s) sur {searchResults.length}
                            </span>
                        </div>
                        {selectedColis.length > 0 && (
                            <button
                                onClick={handleInitiateRecup}
                                disabled={isRefreshing}
                                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors flex items-center gap-2"
                            >
                                Initier le retrait ({selectedColis.length})
                                <ArrowRightCircleIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* List of Colis (ERP Style) */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {searchResults.map((item) => {
                                const isSelected = selectedColis.includes(item.code_colis);
                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => toggleSelection(item.code_colis)}
                                        className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 transition-colors cursor-pointer hover:bg-slate-50 ${isSelected ? 'bg-slate-50/80' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 sm:flex-[0_0_auto]">
                                            <input 
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500 cursor-pointer"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">#{item.code_colis}</span>
                                                <span className="text-sm font-semibold text-slate-900">{item.designation}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Client</span>
                                                <span className="text-xs font-semibold text-slate-700">{item.expedition?.destinataire_nom_prenom || 'n/a'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Téléphone</span>
                                                <span className="text-xs font-semibold text-slate-700">{item.expedition?.destinataire_telephone || 'n/a'}</span>
                                            </div>
                                            <div className="flex flex-col sm:items-end">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Poids</span>
                                                <span className="text-xs font-semibold text-slate-900">{item.poids} kg</span>
                                            </div>
                                        </div>

                                        <div className="sm:w-32 flex sm:justify-end items-center">
                                            <span className={`text-[11px] font-bold ${item.expedition?.statut_paiement === 'paye' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {item.expedition?.statut_paiement === 'paye' ? 'PAYÉ' : 'À PAYER'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-lg">
                    <CubeIcon className="w-10 h-10 text-slate-200 mb-4" />
                    <p className="text-sm font-medium text-slate-500">
                        Entrez un numéro de téléphone ou un code colis pour commencer.
                    </p>
                </div>
            )}

            {/* OTP Modal (Professional Version) */}
            {isOtpModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">Validation Sécurisée</h3>
                            <button onClick={() => setIsOtpModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="text-xs text-slate-600 leading-relaxed font-medium">
                                Un code OTP à 6 chiffres a été envoyé au client. Saisissez-le ci-dessous pour confirmer la remise physique des colis.
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Code de validation (OTP)</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full text-center text-3xl font-mono py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 tracking-[0.2em]"
                                    placeholder="000000"
                                />
                            </div>

                            {hasPendingPayment && (
                                <div className="pt-4 border-t border-slate-100">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox"
                                            checked={isPaid}
                                            onChange={() => setIsPaid(!isPaid)}
                                            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-800">Confirmer le paiement reçu</span>
                                            <span className="text-[10px] text-slate-500 font-medium">Le statut de l'expédition passera à "Payé"</span>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsOtpModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleVerifyOtp}
                                disabled={isRefreshing || !otp}
                                className="px-5 py-2 bg-slate-900 text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50"
                            >
                                {isRefreshing ? "Validation..." : "Confirmer le retrait"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RetraitColis;
