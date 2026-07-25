import React from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

/**
 * 💳 BADGE DE PAIEMENT
 * Style: Stripe / Shopify
 * - États de paiement clairs
 * - Couleurs cohérentes
 * - Icônes expressives
 */

const PaymentBadge = ({ 
    paymentStatus, 
    fraisAnnexes = 0, 
    fraisStatus = null,
    compact = false 
}) => {
    const isMainPaid = paymentStatus === 'paye';
    const hasFrais = parseFloat(fraisAnnexes || 0) > 0;
    const isFraisPaid = fraisStatus === 'paye';

    // Style pour le paiement principal
    const getMainPaymentStyle = () => {
        if (isMainPaid) {
            return {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-700',
                icon: CheckCircleIcon,
                iconColor: 'text-emerald-500',
                label: 'Payé'
            };
        }
        return {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-700',
            icon: ClockIcon,
            iconColor: 'text-orange-500',
            label: 'Impayé'
        };
    };

    // Style pour les frais annexes
    const getFraisStyle = () => {
        if (isFraisPaid) {
            return {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-700',
                icon: CheckCircleIcon,
                iconColor: 'text-emerald-500',
                label: 'Payé'
            };
        }
        return {
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            text: 'text-rose-700',
            icon: ExclamationCircleIcon,
            iconColor: 'text-rose-500',
            label: 'Bloqué'
        };
    };

    const mainStyle = getMainPaymentStyle();
    const fraisStyle = getFraisStyle();
    const MainIcon = mainStyle.icon;
    const FraisIcon = fraisStyle.icon;

    // Mode compact (pour mobile ou tableaux serrés)
    if (compact) {
        return (
            <div className="flex items-center gap-1.5">
                {/* Main payment dot */}
                <div 
                    className={`w-2 h-2 rounded-full ${isMainPaid ? 'bg-emerald-400' : 'bg-orange-400'}`}
                    title={`Transport: ${mainStyle.label}`}
                />
                
                {/* Frais dot if applicable */}
                {hasFrais && (
                    <div 
                        className={`w-2 h-2 rounded-full ${isFraisPaid ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        title={`Frais annexes: ${fraisStyle.label}`}
                    />
                )}
            </div>
        );
    }

    // Mode normal (pour desktop)
    return (
        <div className="flex flex-col gap-1.5">
            {/* Paiement principal */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${mainStyle.bg} ${mainStyle.border}`}>
                <MainIcon className={`w-3.5 h-3.5 ${mainStyle.iconColor}`} />
                <span className={`text-xs font-semibold ${mainStyle.text}`}>
                    {mainStyle.label}
                </span>
            </div>

            {/* Frais annexes si présents */}
            {hasFrais && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${fraisStyle.bg} ${fraisStyle.border}`}>
                    <FraisIcon className={`w-3.5 h-3.5 ${fraisStyle.iconColor}`} />
                    <div className="flex items-baseline gap-1">
                        <span className={`text-[10px] font-medium ${fraisStyle.text}`}>
                            Frais:
                        </span>
                        <span className={`text-xs font-semibold ${fraisStyle.text}`}>
                            {fraisStyle.label}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentBadge;
