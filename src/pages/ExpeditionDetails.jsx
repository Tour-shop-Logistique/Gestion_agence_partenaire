import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { useExpedition } from '../hooks/useExpedition';
import { useAgency } from '../hooks/useAgency';
import PrintSuccessModal from '../components/Receipts/PrintSuccessModal';
import { getLogoUrl } from '../utils/apiConfig';
import { toast } from '../utils/toast';
import { ArrowLeft, Copy } from 'lucide-react';
import { Button } from "../components/ui";
import {
    OperationalSummary,
    KPICards,
    LogisticsFlow,
    ParcelTable,
    ContactCard,
    FinanceCard
} from '../components/expedition';

/**
 * 🚀 PAGE DÉTAIL EXPÉDITION - VERSION REFACTORISÉE
 * 
 * Objectifs :
 * - Ultra lisible (< 3 secondes)
 * - Orientée ACTION
 * - Structurée par logique métier
 * - Design moderne SaaS
 */
const ExpeditionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        currentExpedition: expedition,
        getExpeditionDetails,
        acceptDemande,
        refuseDemande,
        confirmReception,
        status,
        message,
        error,
        resetStatus,
        recordTransaction
    } = useExpedition();
    const { data: agencyData, fetchAgencyData } = useAgency();

    // États des modales
    const [isRefuseModalOpen, setIsRefuseModalOpen] = React.useState(false);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = React.useState(false);
    const [isConfirmReceptionModalOpen, setIsConfirmReceptionModalOpen] = React.useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = React.useState(false);
    const [showPrintModal, setShowPrintModal] = React.useState(false);
    const [transactionType, setTransactionType] = React.useState(null);
    const [paymentMethod, setPaymentMethod] = React.useState('cash');
    const [paymentReference, setPaymentReference] = React.useState("");
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [motifRefus, setMotifRefus] = React.useState("");

    // Chargement des données
    useEffect(() => {
        if (id) {
            getExpeditionDetails(id);
        }
    }, [id, getExpeditionDetails]);

    useEffect(() => {
        fetchAgencyData();
    }, [fetchAgencyData]);

    // Gestion des transactions
    const handleRecordTransaction = (type) => {
        setTransactionType(type);
        setPaymentReference("");
        setIsTransactionModalOpen(true);
    };

    const confirmTransaction = async () => {
        setIsProcessing(true);
        try {
            const amount = transactionType === 'frais_annexes' 
                ? expedition.frais_annexes 
                : expedition.montant_expedition;

            const result = await recordTransaction({
                expedition_id: expedition.id,
                amount: amount,
                payment_method: paymentMethod,
                reference: paymentMethod === 'mobile_money' ? paymentReference : null,
                payment_object: transactionType,
                type: "encaissement"
            });

            if (result.payload?.success || !result.error) {
                toast.success("Transaction enregistrée avec succès");
                getExpeditionDetails(expedition.id);
                setIsTransactionModalOpen(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Gestion des messages
    useEffect(() => {
        if (message) {
            toast.success(message);
            resetStatus();
        }
    }, [message, resetStatus]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            resetStatus();
        }
    }, [error, resetStatus]);

    // Formatage
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        const cfa = new Intl.NumberFormat('fr-FR').format(amount || 0) + ' CFA';
        const eur = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format((amount || 0) / 655.957);
        return `${cfa} (${eur})`;
    };

    // Normalisation des données
    const expediteur = expedition?.expediteur || {
        nom_prenom: expedition?.expediteur_nom_prenom,
        telephone: expedition?.expediteur_telephone,
        email: expedition?.expediteur_email,
        adresse: expedition?.expediteur_adresse,
        ville: expedition?.expediteur_ville
    };

    const destinataire = expedition?.destinataire || {
        nom_prenom: expedition?.destinataire_nom_prenom,
        telephone: expedition?.destinataire_telephone,
        email: expedition?.destinataire_email,
        adresse: expedition?.destinataire_adresse,
        ville: expedition?.destinataire_ville
    };

    // Loading state
    if (status === 'loading' || !expedition) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-sm font-medium text-slate-500">Chargement des données...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

                {/* 🎯 HEADER COMPACT - Mobile Optimized */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>

                            {/* Infos expédition */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-indigo-600 uppercase">
                                        Expédition
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-gray-500 truncate">
                                        {expedition.type_expedition?.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                                        {expedition.reference}
                                    </h1>
                                    <button
                                        className="flex-shrink-0 text-gray-400 hover:text-indigo-600 transition-colors p-1"
                                        onClick={() => {
                                            navigator.clipboard.writeText(expedition.reference);
                                            toast.success('Référence copiée');
                                        }}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Créé le {formatDate(expedition.created_at)}
                                </div>
                            </div>

                            {/* Actions rapides inline */}
                            <div className="flex-shrink-0 flex flex-wrap items-center gap-2">
                                {/* Bouton imprimer le reçu - toujours visible */}
                                <button
                                    onClick={() => setShowPrintModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                    title="Imprimer les reçus"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    <span className="hidden sm:inline">Reçu</span>
                                </button>
                                {expedition.statut_expedition === 'en_attente' && (
                                    <>
                                        <button
                                            onClick={() => setIsRefuseModalOpen(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            <span className="hidden sm:inline">Refuser</span>
                                        </button>
                                        <button
                                            onClick={() => setIsAcceptModalOpen(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            <span className="hidden sm:inline">Accepter</span>
                                        </button>
                                    </>
                                )}

                                {expedition.statut_expedition === 'accepted' && (
                                    <button
                                        onClick={() => setIsConfirmReceptionModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 8-4-4" /></svg>
                                        <span className="hidden sm:inline">Confirmer réception</span>
                                    </button>
                                )}

                                {expedition.statut_paiement_expedition !== 'paye' && !expedition.is_paiement_credit && (
                                    <button
                                        onClick={() => handleRecordTransaction('montant_expedition')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="hidden sm:inline">Encaisser transport</span>
                                    </button>
                                )}

                                {parseFloat(expedition.frais_annexes || 0) > 0 && expedition.statut_paiement_frais !== 'paye' && (
                                    <button
                                        onClick={() => handleRecordTransaction('frais_annexes')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="hidden sm:inline">Encaisser annexes</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔥 RÉSUMÉ OPÉRATIONNEL */}
                <OperationalSummary 
                    expedition={expedition} 
                    formatCurrency={formatCurrency}
                />

                {/* 📊 CARTES KPI */}
                <KPICards 
                    expedition={expedition} 
                    formatCurrency={formatCurrency}
                />

                {/* LAYOUT PRINCIPAL - Mobile First */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                    {/* COLONNE PRINCIPALE - Full width on mobile */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        
                        {/* 🔄 FLUX LOGISTIQUE */}
                        <LogisticsFlow 
                            expedition={expedition}
                            formatDate={formatDate}
                        />

                        {/* 📦 TABLE DES COLIS */}
                        <ParcelTable 
                            colis={expedition.colis || []}
                            formatCurrency={formatCurrency}
                        />

                    </div>

                    {/* COLONNE LATÉRALE - Stack on mobile */}
                    <div className="lg:col-span-1 space-y-4 sm:space-y-6">

                        {/* 👤 CONTACTS */}
                        <div className="space-y-3 sm:space-y-4">
                            <ContactCard 
                                type="shipper"
                                contact={expediteur}
                                country={expedition.pays_depart}
                            />
                            <ContactCard 
                                type="receiver"
                                contact={destinataire}
                                country={expedition.pays_destination}
                            />
                        </div>

                        {/* 💰 FINANCE */}
                        <FinanceCard
                            expedition={expedition}
                            formatCurrency={formatCurrency}
                            onRecordTransaction={handleRecordTransaction}
                        />

                        {/* 💼 COMMISSIONS AGENCE (si disponible) */}
                        {expedition.commission_details && Object.keys(expedition.commission_details).length > 0 && (
                            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-sm">
                                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold text-indigo-400 uppercase">
                                        Ma Commission
                                    </h2>
                                    <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium rounded">
                                        Interne
                                    </span>
                                </div>
                                <div className="p-4 sm:p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                                            <p className="text-xs font-medium text-gray-400 mb-1 sm:mb-2">Enlèvement</p>
                                            <p className="text-base sm:text-lg font-semibold text-white">
                                                {new Intl.NumberFormat('fr-FR').format(expedition.commission_details.enlevement?.agence || 0)}
                                                <span className="text-xs text-indigo-400 ml-1">CFA</span>
                                            </p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                                            <p className="text-xs font-medium text-gray-400 mb-1 sm:mb-2">Livraison</p>
                                            <p className="text-base sm:text-lg font-semibold text-white">
                                                {new Intl.NumberFormat('fr-FR').format(expedition.commission_details.livraison?.agence || 0)}
                                                <span className="text-xs text-indigo-400 ml-1">CFA</span>
                                            </p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                                            <p className="text-xs font-medium text-gray-400 mb-1 sm:mb-2">Emballage</p>
                                            <p className="text-base sm:text-lg font-semibold text-white">
                                                {new Intl.NumberFormat('fr-FR').format(expedition.commission_details.emballage?.agence || 0)}
                                                <span className="text-xs text-indigo-400 ml-1">CFA</span>
                                            </p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                                            <p className="text-xs font-medium text-gray-400 mb-1 sm:mb-2">Retards</p>
                                            <p className="text-base sm:text-lg font-semibold text-white">
                                                {new Intl.NumberFormat('fr-FR').format(expedition.commission_details.retard?.agence || 0)}
                                                <span className="text-xs text-indigo-400 ml-1">CFA</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10"></div>

                                    <div className="text-right">
                                        <p className="text-xs font-medium text-indigo-400 uppercase mb-2">Total Commission</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-white">
                                            {new Intl.NumberFormat('fr-FR').format(
                                                (expedition.commission_details.enlevement?.agence || 0) +
                                                (expedition.commission_details.livraison?.agence || 0) +
                                                (expedition.commission_details.emballage?.agence || 0) +
                                                (expedition.commission_details.retard?.agence || 0)
                                            )}
                                            <span className="text-sm text-indigo-400 ml-2">CFA</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>

            {/* MODALES - Mobile Optimized */}
            <ConfirmationModal
                isOpen={isRefuseModalOpen}
                onClose={() => {
                    setIsRefuseModalOpen(false);
                    setMotifRefus("");
                }}
                onConfirm={async () => {
                    setIsProcessing(true);
                    await refuseDemande(expedition.id, { motif_refus: motifRefus });
                    await getExpeditionDetails(expedition.id);
                    setIsProcessing(false);
                    setIsRefuseModalOpen(false);
                    setMotifRefus("");
                }}
                title="Refuser la demande"
                message="Êtes-vous sûr de vouloir refuser cette demande ? Veuillez indiquer le motif du refus ci-dessous."
                confirmText="Confirmer le refus"
                type="danger"
                isLoading={isProcessing}
            >
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 uppercase">
                        Motif du refus
                    </label>
                    <textarea
                        value={motifRefus}
                        onChange={(e) => setMotifRefus(e.target.value)}
                        placeholder="Ex: Articles non autorisés, poids incorrect, etc..."
                        className="w-full h-24 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    />
                </div>
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={isAcceptModalOpen}
                onClose={() => setIsAcceptModalOpen(false)}
                onConfirm={async () => {
                    setIsProcessing(true);
                    await acceptDemande(expedition.id);
                    await getExpeditionDetails(expedition.id);
                    setIsProcessing(false);
                    setIsAcceptModalOpen(false);
                }}
                title="Accepter la demande"
                message="Voulez-vous accepter cette demande d'expédition ? Elle passera en statut 'Acceptée'."
                confirmText="Accepter la demande"
                type="success"
                isLoading={isProcessing}
            />

            <ConfirmationModal
                isOpen={isConfirmReceptionModalOpen}
                onClose={() => setIsConfirmReceptionModalOpen(false)}
                onConfirm={async () => {
                    setIsProcessing(true);
                    await confirmReception(expedition.id);
                    await getExpeditionDetails(expedition.id);
                    setIsProcessing(false);
                    setIsConfirmReceptionModalOpen(false);
                }}
                title="Confirmer la réception"
                message="Confirmez-vous que les colis de cette expédition ont bien été reçus à l'agence de départ ?"
                confirmText="Confirmer la réception"
                type="info"
                isLoading={isProcessing}
            />

            <ConfirmationModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onConfirm={confirmTransaction}
                title="Enregistrer un encaissement"
                message={`Confirmez-vous l'encaissement de ${formatCurrency(
                    transactionType === 'frais_annexes'
                        ? expedition.frais_annexes
                        : expedition.montant_expedition
                )} au titre de : ${
                    transactionType === 'frais_annexes'
                        ? 'Frais annexes / HUB'
                        : 'Frais de transport'
                } ?`}
                confirmText="Confirmer"
                type="success"
                isLoading={isProcessing}
            >
                <div className="space-y-4 sm:space-y-5">
                    <div className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-white">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">Montant</span>
                            <span className="text-sm sm:text-base font-semibold text-gray-900">
                                {formatCurrency(
                                    transactionType === 'frais_annexes'
                                        ? expedition.frais_annexes
                                        : expedition.montant_expedition
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Type</span>
                        <span className="font-medium text-gray-700">
                            {transactionType === 'frais_annexes'
                                ? 'Frais annexes / HUB'
                                : 'Frais de transport'}
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">
                            Méthode de paiement
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        >
                            <option value="cash">Espèces</option>
                            <option value="mobile_money">Mobile Money</option>
                        </select>
                    </div>

                    {paymentMethod === 'mobile_money' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">
                                Référence transaction
                            </label>
                            <input
                                type="text"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                placeholder="Ex: OM-123456789"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                    )}

                    <div className="text-xs sm:text-sm text-gray-500 border-t border-gray-200 pt-3">
                        Vérifiez que le paiement a bien été reçu avant validation.
                    </div>
                </div>
            </ConfirmationModal>
            {showPrintModal && expedition && (
                <PrintSuccessModal
                    expedition={expedition}
                    agency={{
                        ...(agencyData?.agence || agencyData),
                        logo: getLogoUrl(agencyData?.agence?.logo || agencyData?.logo)
                    }}
                    onClose={() => setShowPrintModal(false)}
                />
            )}
        </div>
    );
};

export default ExpeditionDetails;
