import { useEffect, useRef, useCallback } from 'react';
import { getEcho, disconnectEcho } from '../services/echo';

// Stockage des références récemment créées pour éviter les notifications auto-générées
const recentlyCreatedRefs = new Set();

/**
 * Marque une référence comme récemment créée (pour ignorer sa notification WebSocket)
 * @param {string} reference - La référence de l'expédition/colis créé
 */
export function markAsRecentlyCreated(reference) {
  if (!reference) return;
  
  console.log(`🔇 [WebSocket] Marquage pour ignorer notification: ${reference}`);
  recentlyCreatedRefs.add(reference);
  
  // Retirer après 5 secondes (temps largement suffisant pour que le WebSocket arrive)
  setTimeout(() => {
    recentlyCreatedRefs.delete(reference);
    console.log(`🔊 [WebSocket] Réactivation notifications pour: ${reference}`);
  }, 5000);
}

/**
 * Vérifie si une notification doit être ignorée (auto-générée)
 * @param {Array} references - Liste des références dans le payload
 * @returns {boolean} true si au moins une référence est récente (à ignorer)
 */
function shouldIgnoreNotification(references) {
  if (!references || references.length === 0) return false;
  
  const shouldIgnore = references.some(ref => recentlyCreatedRefs.has(ref));
  if (shouldIgnore) {
    console.log(`🔇 [WebSocket] Notification ignorée (auto-générée):`, references);
  }
  return shouldIgnore;
}

/**
 * Hook personnalisé pour gérer les abonnements WebSocket
 * 
 * @param {string|null} agenceId - ID de l'agence à écouter
 * @param {Object} handlers - Objet contenant les gestionnaires d'événements
 * @param {Function} handlers.onExpeditionCreated - Gestionnaire pour les nouvelles expéditions créées
 * @param {Function} handlers.onExpeditionStatusChanged - Gestionnaire pour les changements de statut d'expédition
 * @param {Function} handlers.onExpeditionPaymentConfirmed - Gestionnaire pour les paiements d'expédition
 * @param {Function} handlers.onExpeditionFraisUpdated - Gestionnaire pour la mise à jour des frais
 * @param {Function} handlers.onColisControlled - Gestionnaire pour les colis contrôlés
 * @param {Function} handlers.onColisBlocked - Gestionnaire pour les colis bloqués
 * @param {Function} handlers.onColisUnblocked - Gestionnaire pour les colis débloqués
 * @param {Function} handlers.onColisAssigned - Gestionnaire pour les colis assignés
 * @param {Function} handlers.onColisReceivedByBackoffice - Gestionnaire pour les colis reçus par le backoffice
 * @param {Function} handlers.onAgenceStatusChanged - Gestionnaire pour les changements de statut d'agence
 * @param {Function} handlers.onTarifsUpdated - Gestionnaire pour les mises à jour de tarifs
 * @param {boolean} enabled - Active ou désactive l'écoute (par défaut: true)
 */
export function useWebSocket(agenceId, handlers = {}, enabled = true) {
  const channelRef = useRef(null);
  const handlersRef = useRef(handlers);

  // Mise à jour de la référence des handlers sans déclencher de re-render
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  // Gestionnaire unifié pour tous les événements
  const handleModelUpdate = useCallback((payload) => {
    console.log('📥 [WebSocket] Message reçu:', {
      model: payload.model,
      action: payload.action,
      count: payload.count,
      ids: payload.ids,
      references: payload.references,
      at: payload.at
    });
    console.log('📄 [WebSocket] Données complètes:', payload);

    const { model, action, data, ids, references, changes, count, at } = payload;

    // ✅ Pour les créations d'expéditions, vérifier si c'est auto-généré
    // Si OUI → Ignorer (l'utilisateur a déjà sa propre notification de succès)
    // Si NON → Refresh silencieux SANS notification (ne pas déranger les autres agents)
    const isSelfCreated = shouldIgnoreNotification(references);
    const isCreationEvent = (model === 'Expedition' && action === 'created');

    // Router vers le bon handler selon le model et l'action
    switch (model) {
      case 'Expedition':
        console.log(`🚚 [WebSocket] Expédition - Action: ${action}`);
        if (action === 'status_changed' && handlersRef.current.onExpeditionStatusChanged) {
          console.log('✅ [WebSocket] Handler onExpeditionStatusChanged appelé');
          handlersRef.current.onExpeditionStatusChanged(data, { ids, references, changes, count, at });
        } else if (action === 'payment_confirmed' && handlersRef.current.onExpeditionPaymentConfirmed) {
          console.log('✅ [WebSocket] Handler onExpeditionPaymentConfirmed appelé');
          handlersRef.current.onExpeditionPaymentConfirmed(data, { ids, references, changes, count, at });
        } else if (action === 'frais_annexes_updated' && handlersRef.current.onExpeditionFraisUpdated) {
          console.log('✅ [WebSocket] Handler onExpeditionFraisUpdated appelé');
          handlersRef.current.onExpeditionFraisUpdated(data, { ids, references, changes, count, at });
        } else if (action === 'created' && handlersRef.current.onExpeditionCreated) {
          if (isSelfCreated) {
            // C'est moi qui ai créé → Ignorer complètement (j'ai déjà ma notification de succès)
            console.log('🔇 [WebSocket] Création auto-générée ignorée (notification déjà affichée)');
          } else {
            // Créé par un collègue → Refresh silencieux SANS notification
            console.log('🔄 [WebSocket] Handler onExpeditionCreated appelé (refresh silencieux)');
            handlersRef.current.onExpeditionCreated(data, { ids, references, changes, count, at, silent: true });
          }
        } else {
          console.warn(`⚠️ [WebSocket] Action '${action}' non gérée pour Expedition ou handler manquant`);
        }
        break;

      case 'Colis':
        console.log(`📦 [WebSocket] Colis - Action: ${action}`);
        if (action === 'controlled' && handlersRef.current.onColisControlled) {
          console.log('✅ [WebSocket] Handler onColisControlled appelé');
          handlersRef.current.onColisControlled(data, { ids, references, changes, count, at });
        } else if (action === 'blocked' && handlersRef.current.onColisBlocked) {
          console.log('✅ [WebSocket] Handler onColisBlocked appelé');
          handlersRef.current.onColisBlocked(data, { ids, references, changes, count, at });
        } else if (action === 'unblocked' && handlersRef.current.onColisUnblocked) {
          console.log('✅ [WebSocket] Handler onColisUnblocked appelé');
          handlersRef.current.onColisUnblocked(data, { ids, references, changes, count, at });
        } else if (action === 'assigned' && handlersRef.current.onColisAssigned) {
          console.log('✅ [WebSocket] Handler onColisAssigned appelé');
          handlersRef.current.onColisAssigned(data, { ids, references, changes, count, at });
        } else if (action === 'received_by_backoffice' && handlersRef.current.onColisReceivedByBackoffice) {
          console.log('✅ [WebSocket] Handler onColisReceivedByBackoffice appelé');
          handlersRef.current.onColisReceivedByBackoffice(data, { ids, references, changes, count, at });
        } else {
          console.warn(`⚠️ [WebSocket] Action '${action}' non gérée pour Colis ou handler manquant`);
        }
        break;

      case 'Agence':
        console.log(`🏢 [WebSocket] Agence - Action: ${action}`);
        if (action === 'status_changed' && handlersRef.current.onAgenceStatusChanged) {
          console.log('✅ [WebSocket] Handler onAgenceStatusChanged appelé');
          handlersRef.current.onAgenceStatusChanged(data, { ids, references, changes, count, at });
        } else {
          console.warn(`⚠️ [WebSocket] Action '${action}' non gérée pour Agence ou handler manquant`);
        }
        break;

      case 'TarifSimple':
      case 'TarifGroupage':
        console.log(`💰 [WebSocket] Tarif - Model: ${model}, Action: ${action}`);
        if (action === 'updated' && handlersRef.current.onTarifsUpdated) {
          console.log('✅ [WebSocket] Handler onTarifsUpdated appelé');
          handlersRef.current.onTarifsUpdated(data, { model, ids, references, changes, count, at });
        } else {
          console.warn(`⚠️ [WebSocket] Action '${action}' non gérée pour ${model} ou handler manquant`);
        }
        break;

      default:
        console.warn(`⚠️ [WebSocket] Modèle '${model}' non reconnu, événement ignoré:`, { model, action });
    }
  }, []);

  useEffect(() => {
    // Ne pas s'abonner si désactivé ou pas d'ID d'agence
    if (!enabled || !agenceId) {
      console.log('[WebSocket] Abonnement désactivé:', { enabled, agenceId });
      return;
    }

    const echo = getEcho();
    if (!echo) {
      console.warn('[WebSocket] Impossible de s\'abonner: Echo non initialisé');
      return;
    }

    const channelName = `agence.${agenceId}`;
    console.log(`🔌 [WebSocket] Tentative d'abonnement au canal: ${channelName}`);

    // S'abonner au canal privé de l'agence
    const channel = echo.private(channelName);
    channelRef.current = channel;

    // Log de la souscription
    channel.subscribed(() => {
      console.log(`✅ [WebSocket] Abonné avec succès au canal: ${channelName}`);
    });

    channel.error((error) => {
      console.error(`❌ [WebSocket] Erreur sur le canal ${channelName}:`, error);
    });

    // Écouter l'événement model.updated
    console.log(`👂 [WebSocket] Écoute de l'événement '.model.updated' sur ${channelName}`);
    channel.listen('.model.updated', handleModelUpdate);

    // Nettoyage lors du démontage
    return () => {
      if (channelRef.current) {
        console.log(`🔌 [WebSocket] Désabonnement du canal: ${channelName}`);
        echo.leave(channelName);
        channelRef.current = null;
      }
    };
  }, [agenceId, enabled, handleModelUpdate]);

  return {
    // Fonction pour se désabonner manuellement si besoin
    disconnect: disconnectEcho,
  };
}

/**
 * Hook simplifié pour écouter uniquement les mises à jour génériques
 * Utile quand on veut juste rafraîchir les données sans logique complexe
 */
export function useWebSocketRefresh(agenceId, onUpdate, enabled = true) {
  const handleUpdate = useCallback((data, meta) => {
    if (onUpdate) {
      onUpdate(data, meta);
    }
  }, [onUpdate]);

  return useWebSocket(
    agenceId,
    {
      onExpeditionCreated: handleUpdate,
      onExpeditionStatusChanged: handleUpdate,
      onExpeditionPaymentConfirmed: handleUpdate,
      onExpeditionFraisUpdated: handleUpdate,
      onColisControlled: handleUpdate,
      onColisBlocked: handleUpdate,
      onColisUnblocked: handleUpdate,
      onColisAssigned: handleUpdate,
      onColisReceivedByBackoffice: handleUpdate,
      onAgenceStatusChanged: handleUpdate,
      onTarifsUpdated: handleUpdate,
    },
    enabled
  );
}
