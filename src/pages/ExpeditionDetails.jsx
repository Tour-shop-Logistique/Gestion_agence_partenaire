import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { useExpedition } from '../hooks/useExpedition';
import { toast } from '../utils/toast';
import { ArrowLeft, Copy } from 'lucide-react';
import { Button } from "../components/ui";
import {
    OperationalSummary,
    ActionBar,
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

    // États des modales
    const [isRefuseModalOpen, setIsRefuseModalOpen] = React.useState(false);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = React.useState(false);
    const [isConfirmReceptionModalOpen, setIsConfirmReceptionModalOpen] = React.useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = React.useState(false);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* 🎯 HEADER COMPACT */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={ArrowLeft}
                                onClick={() => navigate(-1)}
                                className="hover:bg-slate-100"
                            />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                                        Dossier Expédition
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs text-slate-500">
                                        {expedition.type_expedition?.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    {expedition.reference}
                                    <button 
                                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                                        onClick={() => {
                                            navigator.clipboard.writeText(expedition.reference);
                                            toast.success('Référence copiée');
                                        }}
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </h1>
                            </div>
                        </div>
                        <div className="text-sm text-slate-500">
                            Créé le {formatDate(expedition.created_at)}
                        </div>
                    </div>
                </div>

                {/* 🔥 RÉSUMÉ OPÉRATIONNEL */}
                <OperationalSummary 
                    expedition={expedition} 
                    formatCurrency={formatCurrency}
                />

                {/* ⚡ ACTIONS RAPIDES */}
                <ActionBar
                    expedition={expedition}
                    onAccept={() => setIsAcceptModalOpen(true)}
                    onRefuse={() => setIsRefuseModalOpen(true)}
                    onConfirmReception={() => setIsConfirmReceptionModalOpen(true)}
                    onRecordTransaction={handleRecordTransaction}
                />

                {/* 📊 CARTES KPI */}
                <KPICards 
                    expedition={expedition} 
                    formatCurrency={formatCurrency}
                />

                {/* LAYOUT PRINCIPAL */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* COLONNE PRINCIPALE (8/12) */}
                    <div className="lg:col-span-8 space-y-6">
                        
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

                    {/* COLONNE LATÉRALE (4/12) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* 👤 CONTACTS */}
                        <div className="space-y-4">
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
                            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">
                                        Ma Commission
                                    </h2>
                                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase rounded-lg">
                                        Vue Interne
                                    </span>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Enlèvement</p>
                                            <p className="text-lg font-bold text-white">
                                                {new Intl.NumberFormat('fr-FR').format(expedition.commission_details.enlevement?.agence || 0)}
                                                <span className="text-xs text-indigo-400 ml-1">CFA</span>
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Livraison</p>
                                            <p className="text-lg font-bold text-white">
                                                {new Intl.NumberFormat('fr-FR').format(expedition.commission_details.livraison?.agence || 0)}
                                                <span className="text-xs text-indigo-400 ml-1">CFA</span>
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Emballage</p>
                                            <p className="text-lg font-bold text-white">
                                                {new Intl.NumberFormat('fr-FR').format(expedition.commission_details.emballage?.agence || 0)}
                                                <span className="text-xs text-indigo-400 ml-1">CFA</span>
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Retards</p>
                                            <p className="text-lg font-bold text-white">
                                                {new Intl.NumberFormat('fr-FR').format(expedition.commission_details.retard?.agence || 0)}
                                                <span className="text-xs text-indigo-400 ml-1">CFA</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10"></div>

                                    <div className="text-right">
                                        <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Total Commission</p>
                                        <p className="text-3xl font-bold text-white">
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

            {/* MODALES */}
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Motif du refus
                    </label>
                    <textarea
                        value={motifRefus}
                        onChange={(e) => setMotifRefus(e.target.value)}
                        placeholder="Ex: Articles non autorisés, poids incorrect, etc..."
                        className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none"
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
                <div className="space-y-5">
                    <div className="border border-slate-200 rounded-lg px-4 py-3 bg-white">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">Montant</span>
                            <span className="text-base font-semibold text-slate-900">
                                {formatCurrency(
                                    transactionType === 'frais_annexes'
                                        ? expedition.frais_annexes
                                        : expedition.montant_expedition
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Type</span>
                        <span className="font-medium text-slate-700">
                            {transactionType === 'frais_annexes'
                                ? 'Frais annexes / HUB'
                                : 'Frais de transport'}
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">
                            Méthode de paiement
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm bg-white
                            focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                        >
                            <option value="cash">Espèces</option>
                            <option value="mobile_money">Mobile Money</option>
                        </select>
                    </div>

                    {paymentMethod === 'mobile_money' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600">
                                Référence transaction
                            </label>
                            <input
                                type="text"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                placeholder="Ex: OM-123456789"
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm font-mono
                                focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                            />
                        </div>
                    )}

                    <div className="text-sm text-slate-500 border-t pt-3">
                        Vérifiez que le paiement a bien été reçu avant validation.
                    </div>
                </div>
            </ConfirmationModal>
        </div>
    );
};

export default ExpeditionDetails;
