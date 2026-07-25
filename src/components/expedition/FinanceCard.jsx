import React from 'react';
import { DollarSign, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * 💰 CARTE FINANCIÈRE
 * Résumé financier avec indicateurs de paiement
 */
const FinanceCard = ({ expedition, formatCurrency, onRecordTransaction }) => {
    const montantExpedition = parseFloat(expedition.montant_expedition || 0);
    const fraisAnnexes = parseFloat(expedition.frais_annexes || 0);
    const totalAmount = montantExpedition + fraisAnnexes;

    const expeditionPaid = expedition.statut_paiement_expedition === 'paye';
    const annexesPaid = expedition.statut_paiement_frais === 'paye';
    const isCredit = expedition.is_paiement_credit;

    // Calcul du pourcentage payé
    const amountPaid = (expeditionPaid ? montantExpedition : 0) + (annexesPaid ? fraisAnnexes : 0);
    const percentPaid = totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0;

    return (
        <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-green-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Résumé Financier
                            </h2>
                            <p className="text-xs text-slate-600 mt-0.5">État des paiements</p>
                        </div>
                    </div>
                    {isCredit && (
                        <span className="px-3 py-1 bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold uppercase rounded-lg">
                            Crédit
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Détail des montants */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Frais de transport</span>
                        <span className="font-bold text-slate-900">
                            {new Intl.NumberFormat('fr-FR').format(montantExpedition)} CFA
                        </span>
                    </div>
                    {fraisAnnexes > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium">Frais annexes (HUB)</span>
                            <span className="font-bold text-rose-600">
                                +{new Intl.NumberFormat('fr-FR').format(fraisAnnexes)} CFA
                            </span>
                        </div>
                    )}
                </div>

                <div className="h-px bg-slate-200"></div>

                {/* Total */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Total à encaisser</span>
                        <div className="text-right">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-900">
                                    {new Intl.NumberFormat('fr-FR').format(totalAmount)}
                                </span>
                                <span className="text-xs font-bold text-slate-600 uppercase">CFA</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                ≈ {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 2
                                }).format(totalAmount / 655.957)}
                            </p>
                        </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-slate-600">Progression paiement</span>
                            <span className="text-xs font-bold text-emerald-600">{percentPaid.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                                style={{ width: `${percentPaid}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Statuts de paiement */}
                <div className="space-y-3">
                    {/* Paiement Expédition */}
                    <div className={`
                        rounded-xl p-4 border-2 transition-all
                        ${expeditionPaid 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-amber-50 border-amber-200'
                        }
                    `}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {expeditionPaid ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                )}
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase">
                                        Frais de transport
                                    </p>
                                    <p className={`text-sm font-bold ${
                                        expeditionPaid ? 'text-emerald-700' : 'text-amber-700'
                                    }`}>
                                        {expeditionPaid ? 'Payé' : 'En attente'}
                                    </p>
                                </div>
                            </div>
                            {!expeditionPaid && !isCredit && (
                                <button
                                    onClick={() => onRecordTransaction('montant_expedition')}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase rounded-lg shadow-md transition-all hover:shadow-lg"
                                >
                                    Encaisser
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Paiement Frais Annexes */}
                    {fraisAnnexes > 0 && (
                        <div className={`
                            rounded-xl p-4 border-2 transition-all
                            ${annexesPaid 
                                ? 'bg-emerald-50 border-emerald-200' 
                                : 'bg-red-50 border-red-200'
                            }
                        `}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {annexesPaid ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-slate-600 uppercase">
                                            Frais annexes / Douane
                                        </p>
                                        <p className={`text-sm font-bold ${
                                            annexesPaid ? 'text-emerald-700' : 'text-red-700'
                                        }`}>
                                            {annexesPaid ? 'Réglé' : '⚠️ Bloquant'}
                                        </p>
                                    </div>
                                </div>
                                {!annexesPaid && (
                                    <button
                                        onClick={() => onRecordTransaction('frais_annexes')}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg shadow-md transition-all hover:shadow-lg animate-pulse"
                                    >
                                        Régler
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-200 text-center">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        Document certifié par Tous Shop
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FinanceCard;
