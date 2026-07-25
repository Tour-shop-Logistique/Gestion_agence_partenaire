import React from 'react';
import { Link } from 'react-router-dom';
import StatusTimeline from './StatusTimeline';
import PaymentBadge from './PaymentBadge';

/**
 * 📱 CARTE MOBILE EXPEDITIONS
 * Style: Ultra-compact SaaS Premium
 * - Design minimaliste
 * - Actions accessibles
 * - Navigation fluide
 */

const ExpeditionMobileCard = ({ 
    expedition, 
    onPrint,
    getStatusBorderColor,
    getTypeStyle,
    getTypeLabel,
    getAgencyCommission
}) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
    };

    return (
        <Link
            to={`/expeditions/${expedition.id}`}
            className={`block bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-lg transition-all active:scale-[0.98] border-l-4 ${getStatusBorderColor(expedition.statut_expedition)}`}
        >
            {/* Header - Référence + Type */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-bold text-slate-900 truncate">
                        {expedition.reference}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border shadow-sm whitespace-nowrap ${getTypeStyle(expedition.type_expedition)}`}>
                        {getTypeLabel(expedition.type_expedition)}
                    </span>
                </div>
            </div>

            {/* Timeline */}
            <div className="mb-3">
                <StatusTimeline currentStatus={expedition.statut_expedition} compact={true} />
            </div>

            {/* Trajet */}
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold">
                <span className="truncate max-w-[40%] text-slate-600">
                    {expedition.pays_depart}
                </span>
                <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="truncate max-w-[40%] text-indigo-600">
                    {expedition.pays_destination}
                </span>
            </div>

            {/* Footer - Montant + Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-slate-900 tabular-nums">
                        {formatCurrency(expedition.montant_expedition)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">CFA</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Paiement indicator */}
                    <PaymentBadge
                        paymentStatus={expedition.statut_paiement_expedition}
                        fraisAnnexes={expedition.frais_annexes}
                        fraisStatus={expedition.statut_paiement_frais}
                        compact={true}
                    />

                    {/* Commission badge */}
                    <div className="flex items-baseline gap-1 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <span className="text-[9px] font-semibold text-indigo-400">Com.</span>
                        <span className="text-[11px] font-bold text-indigo-600 tabular-nums">
                            {new Intl.NumberFormat('fr-FR').format(getAgencyCommission(expedition))}
                        </span>
                    </div>

                    {/* Print button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onPrint(expedition);
                        }}
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 active:scale-90 transition-transform"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </button>

                    {/* Arrow icon */}
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
};

export default ExpeditionMobileCard;
