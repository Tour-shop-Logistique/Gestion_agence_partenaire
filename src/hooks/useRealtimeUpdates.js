import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';

/**
 * Hook simplifié pour les mises à jour en temps réel
 * 
 * Écoute automatiquement tous les événements pertinents et déclenche
 * une fonction de refresh quand des changements sont détectés.
 * 
 * @param {Function} onUpdate - Fonction appelée quand une mise à jour est détectée
 * @param {Object} options - Options de configuration
 * @param {boolean} options.showNotifications - Afficher les notifications toast (défaut: true)
 * @param {boolean} options.playSound - Jouer les sons (défaut: true)
 * @param {Array<string>} options.only - Écouter uniquement ces types d'événements (ex: ['expeditions', 'colis'])
 * @param {boolean} options.enabled - Activer/désactiver le hook (défaut: true)
 * 
 * @example
 * // Utilisation simple - Rafraîchir les données à chaque changement
 * useRealtimeUpdates(() => {
 *   fetchMyData();
 * });
 * 
 * @example
 * // Avec options
 * useRealtimeUpdates(
 *   () => fetchMyData(),
 *   {
 *     only: ['expeditions'], // Écouter seulement les expéditions
 *     showNotifications: false // Pas de toasts
 *   }
 * );
 */
export function useRealtimeUpdates(onUpdate, options = {}) {
  const { currentUser } = useAuth();
  
  const {
    showNotifications = true,
    playSound = true,
    only = null, // null = tous les événements
    enabled = true
  } = options;

  // Vérifier si on doit écouter ce type d'événement
  const shouldListen = useCallback((eventType) => {
    if (!only || only.length === 0) return true;
    return only.includes(eventType);
  }, [only]);

  // Gestionnaire unifié pour tous les événements
  const handleUpdate = useCallback((data, meta, eventType) => {
    console.log(`🔄 [RealtimeUpdates] ${eventType}:`, meta);
    
    // Appeler la fonction de mise à jour
    if (onUpdate && typeof onUpdate === 'function') {
      onUpdate(data, meta, eventType);
    }
  }, [onUpdate]);

  // Handlers pour chaque type d'événement
  const handlers = {
    // Expéditions
    onExpeditionStatusChanged: shouldListen('expeditions')
      ? (data, meta) => handleUpdate(data, meta, 'expedition.status_changed')
      : undefined,
    
    onExpeditionPaymentConfirmed: shouldListen('expeditions')
      ? (data, meta) => handleUpdate(data, meta, 'expedition.payment_confirmed')
      : undefined,
    
    onExpeditionFraisUpdated: shouldListen('expeditions')
      ? (data, meta) => handleUpdate(data, meta, 'expedition.frais_updated')
      : undefined,

    // Colis
    onColisControlled: shouldListen('colis')
      ? (data, meta) => handleUpdate(data, meta, 'colis.controlled')
      : undefined,
    
    onColisBlocked: shouldListen('colis')
      ? (data, meta) => handleUpdate(data, meta, 'colis.blocked')
      : undefined,
    
    onColisUnblocked: shouldListen('colis')
      ? (data, meta) => handleUpdate(data, meta, 'colis.unblocked')
      : undefined,
    
    onColisAssigned: shouldListen('colis')
      ? (data, meta) => handleUpdate(data, meta, 'colis.assigned')
      : undefined,
    
    onColisReceivedByBackoffice: shouldListen('colis')
      ? (data, meta) => handleUpdate(data, meta, 'colis.received_by_backoffice')
      : undefined,

    // Agence
    onAgenceStatusChanged: shouldListen('agence')
      ? (data, meta) => handleUpdate(data, meta, 'agence.status_changed')
      : undefined,

    // Tarifs
    onTarifsUpdated: shouldListen('tarifs')
      ? (data, meta) => handleUpdate(data, meta, 'tarifs.updated')
      : undefined,
  };

  // Utiliser le hook WebSocket principal
  useWebSocket(
    currentUser?.agence_id,
    handlers,
    enabled && !!currentUser?.agence_id
  );
}

/**
 * Hook pour écouter uniquement les mises à jour d'expéditions
 * 
 * @param {Function} onUpdate - Fonction appelée quand une expédition change
 * @param {boolean} enabled - Activer/désactiver (défaut: true)
 * 
 * @example
 * useRealtimeExpeditions(() => {
 *   fetchExpeditions();
 * });
 */
export function useRealtimeExpeditions(onUpdate, enabled = true) {
  return useRealtimeUpdates(onUpdate, {
    only: ['expeditions'],
    enabled
  });
}

/**
 * Hook pour écouter uniquement les mises à jour de colis
 * 
 * @param {Function} onUpdate - Fonction appelée quand un colis change
 * @param {boolean} enabled - Activer/désactiver (défaut: true)
 * 
 * @example
 * useRealtimeColis(() => {
 *   fetchColis();
 * });
 */
export function useRealtimeColis(onUpdate, enabled = true) {
  return useRealtimeUpdates(onUpdate, {
    only: ['colis'],
    enabled
  });
}

/**
 * Hook pour écouter uniquement les mises à jour de tarifs
 * 
 * @param {Function} onUpdate - Fonction appelée quand les tarifs changent
 * @param {boolean} enabled - Activer/désactiver (défaut: true)
 * 
 * @example
 * useRealtimeTarifs(() => {
 *   fetchTarifs();
 * });
 */
export function useRealtimeTarifs(onUpdate, enabled = true) {
  return useRealtimeUpdates(onUpdate, {
    only: ['tarifs'],
    enabled
  });
}

/**
 * Hook pour détecter quand l'agence est désactivée
 * 
 * @param {Function} onDeactivated - Fonction appelée quand l'agence est désactivée
 * @param {boolean} enabled - Activer/désactiver (défaut: true)
 * 
 * @example
 * useAgenceDeactivation(() => {
 *   // Déconnecter l'utilisateur
 *   logout();
 *   navigate('/login');
 * });
 */
export function useAgenceDeactivation(onDeactivated, enabled = true) {
  const { currentUser } = useAuth();

  useWebSocket(
    currentUser?.agence_id,
    {
      onAgenceStatusChanged: (data, meta) => {
        const agence = data[0];
        if (!agence.actif && onDeactivated) {
          console.warn('⚠️ [AgenceDeactivation] Agence désactivée');
          onDeactivated(data, meta);
        }
      }
    },
    enabled && !!currentUser?.agence_id
  );
}

/**
 * Hook avec notifications et sons automatiques
 * 
 * Version enrichie qui affiche automatiquement des notifications
 * et joue des sons selon le type d'événement.
 * 
 * @param {Function} onUpdate - Fonction appelée quand une mise à jour est détectée
 * @param {Object} options - Options de configuration
 * 
 * @example
 * useRealtimeWithNotifications(() => {
 *   fetchData();
 * });
 */
export function useRealtimeWithNotifications(onUpdate, options = {}) {
  const { showToast } = require('../utils/toast');
  const soundNotification = require('../utils/soundNotification').default;

  const handleUpdate = useCallback((data, meta, eventType) => {
    // Notifications personnalisées selon le type d'événement
    switch (eventType) {
      case 'expedition.status_changed':
        showToast(`${meta.count} expédition(s) mise(s) à jour`, 'info');
        break;

      case 'expedition.payment_confirmed':
        showToast(`💰 Paiement confirmé: ${meta.references.join(', ')}`, 'success');
        break;

      case 'colis.controlled':
        showToast(`✅ ${meta.count} colis contrôlé(s)`, 'success');
        break;

      case 'colis.blocked':
        showToast(`⚠️ Colis bloqué(s): ${meta.references.join(', ')}`, 'warning');
        soundNotification.playAlert();
        break;

      case 'colis.assigned':
        showToast(`🎉 ${meta.count} nouveau(x) colis assigné(s)`, 'success');
        soundNotification.playSuccess();
        break;

      case 'agence.status_changed':
        const agence = data[0];
        if (!agence.actif) {
          showToast('⛔ Votre agence a été désactivée', 'error');
        }
        break;

      default:
        showToast('Mise à jour reçue', 'info');
    }

    // Appeler le callback personnalisé
    if (onUpdate) {
      onUpdate(data, meta, eventType);
    }
  }, [onUpdate, showToast, soundNotification]);

  return useRealtimeUpdates(handleUpdate, {
    showNotifications: false, // On gère manuellement
    ...options
  });
}

/**
 * Hook pour auto-refresh périodique avec temps réel
 * 
 * Combine un refresh automatique périodique avec les mises à jour temps réel.
 * Utile pour les pages qui doivent rester à jour même sans événement.
 * 
 * @param {Function} onRefresh - Fonction de refresh
 * @param {number} intervalMs - Intervalle de refresh automatique en ms (défaut: 60000 = 1 min)
 * @param {boolean} enabled - Activer/désactiver (défaut: true)
 * 
 * @example
 * useAutoRefreshWithRealtime(
 *   () => fetchData(),
 *   30000 // Refresh auto toutes les 30 secondes
 * );
 */
export function useAutoRefreshWithRealtime(onRefresh, intervalMs = 60000, enabled = true) {
  // Refresh périodique
  useEffect(() => {
    if (!enabled || !onRefresh) return;

    const interval = setInterval(() => {
      console.log('⏰ [AutoRefresh] Refresh périodique');
      onRefresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [onRefresh, intervalMs, enabled]);

  // Refresh temps réel
  useRealtimeUpdates(
    () => {
      console.log('🔄 [AutoRefresh] Refresh temps réel');
      onRefresh();
    },
    { enabled }
  );
}

export default useRealtimeUpdates;
