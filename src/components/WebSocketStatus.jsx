import { useEffect, useState } from 'react';
import { getEcho } from '../services/echo';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Composant d'indicateur de statut de connexion WebSocket
 * Affiche un indicateur visuel de l'état de la connexion en temps réel
 */
const WebSocketStatus = ({ compact = false, className = '' }) => {
  const [status, setStatus] = useState('disconnected'); // 'connected' | 'connecting' | 'disconnected' | 'error'
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const echo = getEcho();
    if (!echo) {
      setStatus('disconnected');
      return;
    }

    const pusher = echo.connector.pusher;
    
    // Vérifier l'état initial
    const initialState = pusher.connection.state;
    setStatus(initialState === 'connected' ? 'connected' : 'connecting');

    // Écouter les changements d'état
    const handleConnected = () => {
      console.log('📡 [WebSocketStatus] Connecté');
      setStatus('connected');
    };

    const handleConnecting = () => {
      console.log('📡 [WebSocketStatus] Connexion en cours...');
      setStatus('connecting');
    };

    const handleDisconnected = () => {
      console.log('📡 [WebSocketStatus] Déconnecté');
      setStatus('disconnected');
    };

    const handleUnavailable = () => {
      console.log('📡 [WebSocketStatus] Indisponible');
      setStatus('error');
    };

    const handleError = (err) => {
      console.error('📡 [WebSocketStatus] Erreur:', err);
      setStatus('error');
    };

    // Binding des événements
    pusher.connection.bind('connected', handleConnected);
    pusher.connection.bind('connecting', handleConnecting);
    pusher.connection.bind('disconnected', handleDisconnected);
    pusher.connection.bind('unavailable', handleUnavailable);
    pusher.connection.bind('error', handleError);

    // Nettoyage
    return () => {
      pusher.connection.unbind('connected', handleConnected);
      pusher.connection.unbind('connecting', handleConnecting);
      pusher.connection.unbind('disconnected', handleDisconnected);
      pusher.connection.unbind('unavailable', handleUnavailable);
      pusher.connection.unbind('error', handleError);
    };
  }, []);

  // Styles selon le statut
  const getStatusStyles = () => {
    switch (status) {
      case 'connected':
        return {
          bg: 'bg-emerald-100',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          dot: 'bg-emerald-500',
          label: 'Connecté'
        };
      case 'connecting':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-300',
          text: 'text-amber-700',
          dot: 'bg-amber-500',
          label: 'Connexion...'
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-700',
          dot: 'bg-red-500',
          label: 'Erreur'
        };
      default:
        return {
          bg: 'bg-slate-100',
          border: 'border-slate-300',
          text: 'text-slate-700',
          dot: 'bg-slate-500',
          label: 'Déconnecté'
        };
    }
  };

  const styles = getStatusStyles();

  // Version compacte (juste un point coloré)
  if (compact) {
    return (
      <div
        className={`relative ${className}`}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        title={`WebSocket: ${styles.label}`}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${styles.dot} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
        
        {/* Tooltip au survol */}
        {showDetails && (
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
            Temps réel: {styles.label}
            <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
          </div>
        )}
      </div>
    );
  }

  // Version complète
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${styles.bg} ${styles.border} ${className}`}>
      {/* Icône */}
      {status === 'error' ? (
        <ExclamationTriangleIcon className={`w-4 h-4 ${styles.text}`} />
      ) : (
        <WifiIcon className={`w-4 h-4 ${styles.text}`} />
      )}
      
      {/* Point d'état animé */}
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${styles.dot} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
        {status === 'connected' && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${styles.dot} animate-ping opacity-75`} />
        )}
      </div>
      
      {/* Label */}
      <span className={`text-xs font-medium ${styles.text}`}>
        {styles.label}
      </span>
    </div>
  );
};

export default WebSocketStatus;
