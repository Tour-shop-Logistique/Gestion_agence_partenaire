import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import apiService from '../utils/apiService';

window.Pusher = Pusher;

let echoInstance = null;

/**
 * Crée et retourne l'instance Echo pour WebSocket
 * @returns {Echo|null} Instance Echo ou null si pas de token
 */
export function getEcho() {
  if (echoInstance) {
    return echoInstance;
  }

  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn('[Echo] Impossible de créer Echo: pas de token disponible');
    return null;
  }

  console.log('[Echo] Initialisation de la connexion WebSocket...');

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    wssPort: import.meta.env.VITE_PUSHER_PORT,
    forceTLS: import.meta.env.VITE_PUSHER_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
    
    // Authentification custom via notre API existante
    authorizer: (channel) => ({
      authorize(socketId, callback) {
        apiService
          .post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((res) => {
            console.log('[Echo] Canal autorisé:', channel.name);
            callback(false, res);
          })
          .catch((err) => {
            console.error('[Echo] Erreur d\'autorisation:', err);
            callback(true, err);
          });
      },
    }),
  });

  // Événements de connexion
  echoInstance.connector.pusher.connection.bind('connected', () => {
    console.log('✅ [Echo] WebSocket connecté avec succès');
    console.log('📊 [Echo] Socket ID:', echoInstance.socketId());
  });

  echoInstance.connector.pusher.connection.bind('disconnected', () => {
    console.warn('⚠️ [Echo] WebSocket déconnecté');
  });

  echoInstance.connector.pusher.connection.bind('error', (err) => {
    console.error('❌ [Echo] Erreur WebSocket:', err);
  });

  echoInstance.connector.pusher.connection.bind('state_change', (states) => {
    console.log('🔄 [Echo] Changement d\'état:', states.previous, '→', states.current);
  });

  // Log de tous les messages reçus (debug)
  echoInstance.connector.pusher.connection.bind_global((eventName, data) => {
    console.log('🔔 [Echo] Événement global reçu:', eventName, data);
  });

  return echoInstance;
}

/**
 * Déconnecte et réinitialise l'instance Echo
 */
export function disconnectEcho() {
  if (echoInstance) {
    console.log('[Echo] Déconnexion en cours...');
    echoInstance.disconnect();
    echoInstance = null;
  }
}

/**
 * Réinitialise Echo (utile après un changement de token)
 */
export function resetEcho() {
  disconnectEcho();
  return getEcho();
}
