import React from 'react';
import { CheckCircle2, XCircle, DollarSign, Package } from 'lucide-react';
import { Button } from '../ui';

/**
 * ⚡ BARRE D'ACTIONS RAPIDES
 * Boutons d'action toujours visibles et accessibles
 */
const ActionBar = ({ 
    expedition, 
    onAccept, 
    onRefuse, 
    onConfirmReception,
    onRecordTransaction 
}) => {
    const actions = [];

    // Actions selon le statut
    if (expedition.statut_expedition === 'en_attente') {
        actions.push(
            {
                key: 'refuse',
                label: 'Refuser la demande',
                icon: XCircle,
                variant: 'danger',
                onClick: onRefuse,
                priority: 'secondary'
            },
            {
                key: 'accept',
                label: 'Accepter la demande',
                icon: CheckCircle2,
                variant: 'success',
                onClick: onAccept,
                priority: 'primary'
            }
        );
    }

    if (expedition.statut_expedition === 'accepted') {
        actions.push({
            key: 'confirm',
            label: 'Confirmer réception colis',
            icon: Package,
            variant: 'indigo',
            onClick: onConfirmReception,
            priority: 'primary'
        });
    }

    // Actions de paiement
    if (expedition.statut_paiement_expedition !== 'paye' && !expedition.is_paiement_credit) {
        actions.push({
            key: 'pay_expedition',
            label: 'Encaisser frais transport',
            icon: DollarSign,
            variant: 'warning',
            onClick: () => onRecordTransaction('montant_expedition'),
            priority: 'primary'
        });
    }

    if (parseFloat(expedition.frais_annexes || 0) > 0 && expedition.statut_paiement_frais !== 'paye') {
        actions.push({
            key: 'pay_annexes',
            label: 'Encaisser frais annexes',
            icon: DollarSign,
            variant: 'warning',
            onClick: () => onRecordTransaction('frais_annexes'),
            priority: 'primary'
        });
    }

    if (actions.length === 0) {
        return null;
    }

    // Séparer actions primaires et secondaires
    const primaryActions = actions.filter(a => a.priority === 'primary');
    const secondaryActions = actions.filter(a => a.priority === 'secondary');

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-lg">⚡</span>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Actions rapides</h3>
                    <p className="text-xs text-indigo-600">Actions disponibles pour cette expédition</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {primaryActions.map(action => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={action.key}
                            variant={action.variant}
                            size="md"
                            onClick={action.onClick}
                            className="flex-1 min-w-[200px] justify-center gap-2 font-bold shadow-md hover:shadow-xl transition-all"
                        >
                            <Icon className="w-5 h-5" />
                            {action.label}
                        </Button>
                    );
                })}
                {secondaryActions.map(action => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={action.key}
                            variant={action.variant}
                            size="md"
                            onClick={action.onClick}
                            className="flex-1 min-w-[200px] justify-center gap-2 font-bold"
                        >
                            <Icon className="w-5 h-5" />
                            {action.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default ActionBar;
