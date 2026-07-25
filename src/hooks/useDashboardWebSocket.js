import { useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { showToast } from '../utils/toast';

const FORCED_LOGOUT_DELAY_MS = 3000;

/**
 * Abonnement WebSocket du dashboard : notifie l'utilisateur et rafraîchit
 * les données à chaque événement métier reçu pour son agence.
 */
export function useDashboardWebSocket({ agenceId, enabled, navigate, refreshAll }) {
    const notifyAndRefresh = useCallback((message, type) => {
        if (message) {
            showToast(message, type);
        }
        refreshAll();
    }, [refreshAll]);

    useWebSocket(
        agenceId,
        {
            onExpeditionCreated: () => {
                // Les créations auto-générées (par l'agent lui-même) sont filtrées en amont :
                // il ne reste ici que les créations d'un collègue, à refléter sans notifier.
                notifyAndRefresh(null, null);
            },

            onExpeditionStatusChanged: (data, meta) => {
                notifyAndRefresh(`${meta.count} expédition(s) mise(s) à jour`, 'info');
            },

            onExpeditionPaymentConfirmed: (data, meta) => {
                notifyAndRefresh(`Paiement confirmé pour ${meta.references.join(', ')}`, 'success');
            },

            onExpeditionFraisUpdated: (data, meta) => {
                notifyAndRefresh(`Frais annexes mis à jour pour ${meta.references.join(', ')}`, 'info');
            },

            onColisControlled: (data, meta) => {
                const message = meta.count > 1
                    ? `${meta.count} colis contrôlés`
                    : `Colis ${meta.references[0]} contrôlé`;
                notifyAndRefresh(message, 'success');
            },

            onColisBlocked: (data, meta) => {
                notifyAndRefresh(`⚠️ ${meta.count} colis bloqué(s)`, 'warning');
            },

            onColisUnblocked: (data, meta) => {
                notifyAndRefresh(`${meta.count} colis débloqué(s)`, 'success');
            },

            onColisAssigned: (data, meta) => {
                notifyAndRefresh(`${meta.count} nouveau(x) colis assigné(s) à votre agence`, 'info');
            },

            onColisReceivedByBackoffice: (data, meta) => {
                notifyAndRefresh(`${meta.count} colis reçu(s) par le backoffice`, 'info');
            },

            onAgenceStatusChanged: (data) => {
                const agence = data[0];
                if (!agence.actif) {
                    showToast('⛔ Votre agence a été désactivée', 'error');
                    setTimeout(() => {
                        localStorage.clear();
                        navigate('/login');
                    }, FORCED_LOGOUT_DELAY_MS);
                } else {
                    notifyAndRefresh('✅ Votre agence a été réactivée', 'success');
                }
            },

            onTarifsUpdated: () => {
                showToast('Les tarifs ont été mis à jour', 'info');
            }
        },
        enabled
    );
}
