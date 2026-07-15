import { useEffect, useState } from 'react';
import { getEcho } from '../services/echo';
import { useAuth } from '../hooks/useAuth';
import { XMarkIcon, SignalIcon, ClockIcon, ServerIcon } from '@heroicons/react/24/outline';

/**
 * Panel de débogage WebSocket (DEV ONLY)
 * Affiche des informations détaillées sur la connexion et les événements reçus
 */
const WebSocketDebugPanel = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [connectionState, setConnectionState] = useState('unknown');
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    connected: false,
    connectedAt: null,
    socketId: null,
    agenceId: null,
    eventsReceived: 0,
    lastEventAt: null
  });

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const pusher = echo.connector.pusher;
    
    // Mettre à jour l'état initial
    setConnectionState(pusher.connection.state);
    setStats(prev => ({
      ...prev,
      agenceId: currentUser?.agence_id,
      socketId: pusher.connection.socket_id
    }));

    // Écouter les changements d'état
    const handleStateChange = (states) => {
      setConnectionState(states.current);
      
      if (states.current === 'connected') {
        setStats(prev => ({
          ...prev,
          connected: true,
          connectedAt: new Date().toISOString(),
          socketId: pusher.connection.socket_id
        }));
      } else {
        setStats(prev => ({
          ...prev,
          connected: false
        }));
      }
    };

    pusher.connection.bind('state_change', handleStateChange);

    // Écouter tous les messages (pour debug)
    if (currentUser?.agence_id) {
      const channelName = `private-agence.${currentUser.agence_id}`;
      
      try {
        // S'abonner si pas déjà fait
        let channel = pusher.channel(channelName);
        if (!channel) {
          channel = echo.private(`agence.${currentUser.agence_id}`);
        }

        // Vérifier que le canal est valide avant d'écouter
        if (channel && typeof channel.listen === 'function') {
          // Intercepter tous les événements
          const handleEvent = (eventName) => (payload) => {
            const event = {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              eventName,
              payload,
              channel: channelName
            };

            setEvents(prev => [event, ...prev].slice(0, 50)); // Garder les 50 derniers
            setStats(prev => ({
              ...prev,
              eventsReceived: prev.eventsReceived + 1,
              lastEventAt: new Date().toISOString()
            }));
          };

          // Écouter l'événement principal
          channel.listen('.model.updated', handleEvent('.model.updated'));
        }
      } catch (error) {
        console.error('[WebSocketDebugPanel] Erreur d\'abonnement:', error);
      }
    }

    return () => {
      pusher.connection.unbind('state_change', handleStateChange);
    };
  }, [currentUser?.agence_id]);

  // Afficher uniquement en dev ou si CTRL+SHIFT+D
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-slate-900 text-white rounded-lg shadow-lg text-xs font-mono hover:bg-slate-800 transition-colors"
        title="Ouvrir le panel de débogage WebSocket (Ctrl+Shift+D)"
      >
        🔌 WS Debug
      </button>
    );
  }

  const getStateColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-600 bg-green-50';
      case 'connecting': return 'text-yellow-600 bg-yellow-50';
      case 'disconnected': return 'text-gray-600 bg-gray-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SignalIcon className="w-5 h-5" />
          <h3 className="font-bold text-sm">WebSocket Debug</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-slate-800 rounded transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">État:</span>
          <span className={`px-2 py-1 rounded font-mono font-bold ${getStateColor()}`}>
            {connectionState}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Socket ID:</span>
          <span className="font-mono text-slate-900">
            {stats.socketId || 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Agence ID:</span>
          <span className="font-mono text-slate-900">
            {stats.agenceId || 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Événements reçus:</span>
          <span className="font-mono text-indigo-600 font-bold">
            {stats.eventsReceived}
          </span>
        </div>

        {stats.connectedAt && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Connecté depuis:</span>
            <span className="text-slate-900 text-[10px]">
              {new Date(stats.connectedAt).toLocaleTimeString('fr-FR')}
            </span>
          </div>
        )}
      </div>

      {/* Events Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-700">Événements récents</h4>
          {events.length > 0 && (
            <button
              onClick={() => setEvents([])}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Effacer
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Aucun événement reçu
          </div>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-indigo-600">
                  {event.eventName}
                </span>
                <span className="text-slate-400 text-[10px]">
                  {new Date(event.timestamp).toLocaleTimeString('fr-FR')}
                </span>
              </div>
              
              {event.payload && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-500">Model:</span>
                    <span className="font-bold text-slate-900">{event.payload.model}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-500">Action:</span>
                    <span className="font-bold text-slate-900">{event.payload.action}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-500">Count:</span>
                    <span className="font-bold text-indigo-600">{event.payload.count}</span>
                  </div>
                  {event.payload.references && event.payload.references.length > 0 && (
                    <div className="flex items-start gap-2 text-[10px]">
                      <span className="text-slate-500">Refs:</span>
                      <span className="font-mono text-slate-900">
                        {event.payload.references.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Payload complet (replié) */}
              <details className="mt-2">
                <summary className="cursor-pointer text-[10px] text-slate-500 hover:text-slate-700">
                  Voir le payload complet
                </summary>
                <pre className="mt-2 p-2 bg-slate-900 text-green-400 rounded text-[9px] overflow-x-auto">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </details>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-[10px] text-slate-500 text-center">
        Appuyez sur <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded">Ctrl+Shift+D</kbd> pour fermer
      </div>
    </div>
  );
};

export default WebSocketDebugPanel;
