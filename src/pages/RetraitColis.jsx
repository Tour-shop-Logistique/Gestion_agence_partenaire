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
    const [hasSearched, setHasSearched] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [isPaid, setIsPaid] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paymentReference, setPaymentReference] = useState("");

    const hasPendingPayment = useMemo(() => {
        return searchResults.some(item => 
            selectedColis.includes(item.code_colis) && 
            item.expedition?.statut_paiement !== 'paye'
        );
    }, [searchResults, selectedColis]);

    const totalAmountToPay = useMemo(() => {
        const uniqueExpeditions = new Map();
        searchResults.forEach(item => {
            if (selectedColis.includes(item.code_colis)) {
                const exp = item.expedition;
                if (!exp) return;

                // Si le statut de paiement n'est pas "paye", calculer le montant dû
                if (exp.statut_paiement !== 'paye') {
                    let due = parseFloat(exp.montant_expedition || 0);
                    uniqueExpeditions.set(exp.id, due);
                }
            }
        });
        return Array.from(uniqueExpeditions.values()).reduce((sum, amount) => sum + amount, 0);
    }, [searchResults, selectedColis]);

    const {
        loadColis,
        initiateRecupColis,
        verifyRecupColis,
        recordTransaction,
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
        setHasSearched(true);
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
            setPaymentMethod("cash");
            setPaymentReference("");
            setIsOtpModalOpen(true);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error("Veuillez saisir le code OTP");
            return;
        }
        setLocalLoading(true);

        // Si le paiement est à confirmer, on enregistre d'abord la transaction
        if (isPaid && hasPendingPayment) {
            const uniqueExpeditions = [];
            const processedIds = new Set();
            const amountsMap = new Map();

            searchResults.forEach(item => {
                if (selectedColis.includes(item.code_colis) && 
                    !processedIds.has(item.expedition?.id)) {
                    
                    const exp = item.expedition;
                    if (exp.statut_paiement !== 'paye') {
                        const due = parseFloat(exp.montant_expedition || 0);
                        uniqueExpeditions.push(exp);
                        processedIds.add(exp.id);
                        amountsMap.set(exp.id, due);
                    }
                }
            });

            for (const exp of uniqueExpeditions) {
                await recordTransaction({
                    expedition_id: exp.id,
                    amount: amountsMap.get(exp.id),
                    payment_method: paymentMethod,
                    payment_object: "montant_expedition",
                    type: "encaissement",
                    reference: paymentMethod === 'mobile_money' ? paymentReference : null,
                    description: "Paiement à la livraison finalisé"
                });
            }
        }

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

                    {/* Grouped List of Colis (Same style as ColisAReceptionner) */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="divide-y-0">
                            {(() => {
                                // Grouper les colis par expédition
                                const groupedByExpedition = {};
                                searchResults.forEach(item => {
                                    const expId = item.expedition?.id || item.expedition_id;
                                    if (!expId) return;
                                    
                                    if (!groupedByExpedition[expId]) {
                                        groupedByExpedition[expId] = {
                                            expedition: item.expedition,
                                            colis: []
                                        };
                                    }
                                    groupedByExpedition[expId].colis.push(item);
                                });

                                return Object.entries(groupedByExpedition).map(([expId, group], groupIndex) => (
                                    <React.Fragment key={expId}>
                                        {/* ══ SÉPARATEUR ENTRE EXPÉDITIONS ══ */}
                                        {groupIndex > 0 && (
                                            <div className="h-3 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-t-4 border-slate-200"></div>
                                        )}

                                        {/* 📦 EXPEDITION HEADER - Design Card-like avec ombre */}
                                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg px-5 py-3.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {/* Badge référence */}
                                                    <div className="flex items-center gap-2.5">
                                                        <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                        </svg>
                                                        <span className="text-sm font-bold text-white tracking-wide">
                                                            {group.expedition?.reference || 'N/A'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Séparateur vertical */}
                                                    <div className="w-px h-5 bg-white/30"></div>
                                                    
                                                    {/* Trajet */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-white/90">{group.expedition?.pays_depart || '?'}</span>
                                                        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                        <span className="text-xs font-medium text-white">{group.expedition?.pays_destination || '?'}</span>
                                                    </div>
                                                </div>

                                                {/* Compteur colis */}
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30">
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <span className="text-xs font-bold text-white">{group.colis.length}</span>
                                                    <span className="text-xs font-medium text-white/80">colis</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Ligne de transition header → colis (bordure fine) ── */}
                                        <div className="h-0.5 bg-indigo-100 border-b border-indigo-200"></div>

                                        {/* 📋 COLIS ROWS */}
                                        {group.colis.map((item, idx) => {
                                            const isSelected = selectedColis.includes(item.code_colis);
                                            const isLastColis = idx === group.colis.length - 1;
                                            
                                            return (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => toggleSelection(item.code_colis)}
                                                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-all cursor-pointer ${
                                                        isSelected 
                                                            ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-200' 
                                                            : 'bg-white hover:bg-slate-50'
                                                    } ${
                                                        isLastColis 
                                                            ? 'border-b-2 border-slate-200' 
                                                            : 'border-b border-slate-100'
                                                    }`}
                                                >
                                                    {/* Checkbox */}
                                                    <div className="flex-shrink-0">
                                                        <input 
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            readOnly
                                                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                                        />
                                                    </div>

                                                    {/* Colis Info */}
                                                    <div className="flex flex-col min-w-[140px] sm:min-w-[180px]">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-0.5">Colis</span>
                                                        <span className="text-xs sm:text-sm font-bold text-indigo-600 leading-tight">#{item.code_colis}</span>
                                                        <span className="text-[10px] sm:text-xs font-semibold text-slate-600 truncate mt-0.5">{item.designation || 'Sans désignation'}</span>
                                                    </div>

                                                    {/* Code Validation */}
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-0.5">Code Validation</span>
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <ShieldCheckIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                            <span className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                                                                {item.code_validation_retrait || 'N/A'}
                                                            </span>
                                                        </div>
                                                        {item.date_limite_retrait && (
                                                            <span className="text-[9px] text-amber-600 font-medium mt-0.5">
                                                                Limite: {new Date(item.date_limite_retrait).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Poids */}
                                                    <div className="flex flex-col items-end min-w-[70px]">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-0.5">Poids</span>
                                                        <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                                                            {parseFloat(item.poids || 0).toFixed(2)} kg
                                                        </span>
                                                    </div>

                                                    {/* Statut Paiement */}
                                                    <div className="flex-shrink-0 flex items-center justify-center min-w-[80px]">
                                                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border-2 whitespace-nowrap ${
                                                            item.expedition?.statut_paiement === 'paye'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}>
                                                            {item.expedition?.statut_paiement === 'paye' ? 'OUVERT' : 'BLOCAGE'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            ) : hasSearched ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-lg">
                    <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                        <InformationCircleIcon className="w-7 h-7 text-amber-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                        Aucun colis trouvé
                    </p>
                    <p className="text-xs text-slate-500 text-center max-w-md">
                        Ce contact n'a pas de colis en agence ou le numéro/code saisi est incorrect.
                    </p>
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
                                <div className="pt-4 border-t border-slate-100 space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox"
                                            checked={isPaid}
                                            onChange={() => setIsPaid(!isPaid)}
                                            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-800">Confirmer le paiement reçu</span>
                                            <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                                                Total à encaisser : <span className="text-emerald-600 font-bold">{new Intl.NumberFormat('fr-FR').format(totalAmountToPay)} CFA</span>
                                            </span>
                                        </div>
                                    </label>

                                    {isPaid && (
                                        <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                            <div className="space-y-3">
                                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mode de paiement</label>
                                                 <div className="grid grid-cols-2 gap-2">
                                                     <button
                                                        type="button"
                                                        onClick={() => setPaymentMethod('cash')}
                                                        className={`py-2 text-[10px] font-bold uppercase rounded border transition-all ${paymentMethod === 'cash' ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                                     >
                                                         Cash / Espèces
                                                     </button>
                                                     <button
                                                        type="button"
                                                        onClick={() => setPaymentMethod('mobile_money')}
                                                        className={`py-2 text-[10px] font-bold uppercase rounded border transition-all ${paymentMethod === 'mobile_money' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                                     >
                                                         Mobile Money
                                                     </button>
                                                 </div>
                                            </div>

                                            {paymentMethod === 'mobile_money' && (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Référence Transaction</label>
                                                    <input 
                                                        type="text"
                                                        value={paymentReference}
                                                        onChange={(e) => setPaymentReference(e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                        placeholder="Ex: OM-123456789"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
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
