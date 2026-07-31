import React from 'react';
import { DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * 💰 CARTE FINANCIÈRE
 * Bandeau pleine largeur, compact : tous les indicateurs (montants, total,
 * progression, statuts de paiement) alignés sur une seule rangée plutôt
 * qu'empilés, pour minimiser la hauteur occupée.
 */
const FinanceCard = ({ expedition, formatCurrency, onRecordTransaction, onOpenFraisDecision }) => {
    const montantExpedition = parseFloat(expedition.montant_expedition || 0);
    const fraisAnnexes = parseFloat(expedition.frais_annexes || 0);
    const totalAmount = montantExpedition + fraisAnnexes;

    const expeditionPaid = expedition.statut_paiement_expedition === 'paye';
    const annexesPaid = expedition.statut_paiement_frais === 'paye';
    const isCredit = expedition.is_paiement_credit;
    // Une fois la décision agence prise (payé maintenant OU à percevoir à
    // l'arrivée), il n'y a plus d'urgence à signaler même si le montant n'est
    // pas encore réellement encaissé - seule l'absence de décision est bloquante.
    const decisionAgencePrise = expedition.frais_decision_agence_prise;

    const amountPaid = (expeditionPaid ? montantExpedition : 0) + (annexesPaid ? fraisAnnexes : 0);
    const percentPaid = totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0;

    const StatusPill = ({ label, paid, urgent, decisionAttente, aPercevoirArrivee, onClick, buttonLabel = 'Encaisser' }) => (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border shrink-0 ${
            paid
                ? 'bg-emerald-50 border-emerald-200'
                : decisionAttente
                    ? 'bg-red-50 border-red-200'
                    : aPercevoirArrivee
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-amber-50 border-amber-200'
        }`}>
            {paid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
                <AlertCircle className={`w-4 h-4 shrink-0 ${decisionAttente ? 'text-red-600 animate-pulse' : aPercevoirArrivee ? 'text-slate-400' : 'text-amber-600'}`} />
            )}
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight truncate">{label}</p>
                <p className={`text-xs font-bold leading-tight ${
                    paid ? 'text-emerald-700' : decisionAttente ? 'text-red-700' : aPercevoirArrivee ? 'text-slate-600' : 'text-amber-700'
                }`}>
                    {paid ? 'Payé' : decisionAttente ? 'Décision requise' : aPercevoirArrivee ? "À percevoir à l'arrivée" : 'En attente'}
                </p>
            </div>
            {/* Pas de bouton une fois "à percevoir à l'arrivée" décidé : c'est
                l'agence de destination qui encaissera auprès du destinataire,
                l'agence de départ n'a plus rien à faire ici. */}
            {!paid && !aPercevoirArrivee && onClick && (
                <button
                    onClick={onClick}
                    className={`ml-1 px-2.5 py-1 text-white text-[10px] font-bold uppercase rounded-md shrink-0 transition-all ${
                        decisionAttente ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    );

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Icône + titre */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Résumé Financier</h2>
                        {isCredit && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-rose-100 border border-rose-300 text-rose-700 text-[9px] font-bold uppercase rounded">
                                Crédit
                            </span>
                        )}
                    </div>
                </div>

                <div className="hidden sm:block w-px h-10 bg-slate-200 shrink-0" />

                {/* Montants */}
                <div className="flex items-center gap-4 shrink-0">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Frais expédition</p>
                        <p className="text-sm font-bold text-slate-900 tabular-nums">
                            {new Intl.NumberFormat('fr-FR').format(montantExpedition)} <span className="text-[10px] text-slate-500">CFA</span>
                        </p>
                    </div>
                    {fraisAnnexes > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Frais annexes</p>
                            <p className="text-sm font-bold text-rose-600 tabular-nums">
                                +{new Intl.NumberFormat('fr-FR').format(fraisAnnexes)} <span className="text-[10px] text-rose-400">CFA</span>
                            </p>
                        </div>
                    )}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                        <p className="text-base font-bold text-slate-900 tabular-nums">
                            {new Intl.NumberFormat('fr-FR').format(totalAmount)} <span className="text-[10px] text-slate-500">CFA</span>
                        </p>
                    </div>
                </div>

                <div className="hidden sm:block w-px h-10 bg-slate-200 shrink-0" />

                {/* Progression */}
                <div className="flex-1 min-w-[140px]">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Progression</span>
                        <span className="text-[10px] font-bold text-emerald-600">{percentPaid.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                            style={{ width: `${percentPaid}%` }}
                        />
                    </div>
                </div>

                <div className="hidden sm:block w-px h-10 bg-slate-200 shrink-0" />

                {/* Statuts de paiement */}
                <div className="flex flex-wrap items-center gap-2">
                    <StatusPill
                        label="Frais expédition"
                        paid={expeditionPaid}
                        onClick={!isCredit ? () => onRecordTransaction('montant_expedition') : null}
                    />
                    {fraisAnnexes > 0 && (
                        <StatusPill
                            label="Annexes"
                            paid={annexesPaid}
                            decisionAttente={!decisionAgencePrise}
                            // Décision prise + pas payé + statut toujours
                            // en_attente = "à percevoir à l'arrivée" (le
                            // contrôleur backend passe directement
                            // statut_paiement_frais à PAYE quand la décision
                            // est "payé maintenant", donc en_attente ici ne
                            // peut correspondre qu'à l'autre choix).
                            aPercevoirArrivee={decisionAgencePrise && !annexesPaid}
                            // Tant que l'agence n'a pas choisi entre "payé
                            // maintenant" et "à percevoir à l'arrivée", on
                            // ouvre l'écran de décision (pas directement
                            // l'encaissement) - sinon l'agence n'a jamais
                            // l'occasion de choisir "à percevoir à l'arrivée"
                            // depuis cette page.
                            buttonLabel="Décider"
                            onClick={!decisionAgencePrise ? onOpenFraisDecision : null}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinanceCard;
