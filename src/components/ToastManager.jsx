import React, { useState, useEffect } from 'react';
import Toast from './Toast';

const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Écouter les événements de notification
    const handleNewMessage = (event) => {
      const { requestId, clientName } = event.detail;
      addToast({
        id: Date.now(),
        message: `Nouveau message de ${clientName}`,
        type: 'chat',
        duration: 6000,
        onClick: () => {
          // Rediriger vers la page des demandes avec focus sur le chat
          window.location.href = `/requests?chat=${requestId}`;
        }
      });
    };

    const handleRequestUpdate = (event) => {
      const { status, clientName } = event.detail;
      const statusMessages = {
        'accepted': `Demande de ${clientName} acceptée`,
        'rejected': `Demande de ${clientName} rejetée`,
        'in_progress': `Demande de ${clientName} en cours`,
        'completed': `Demande de ${clientName} terminée`
      };

      if (statusMessages[status]) {
        addToast({
          id: Date.now(),
          message: statusMessages[status],
          type: status === 'accepted' || status === 'completed' ? 'success' : 'info',
          duration: 5000
        });
      }
    };

    const handleToast = (event) => {
      const { message, type, duration } = event.detail;
      addToast({
        id: Date.now(),
        message: message || 'Notification',
        type: type || 'info',
        duration: duration || 5000
      });
    };

    window.addEventListener('new-message', handleNewMessage);
    window.addEventListener('request-update', handleRequestUpdate);
    window.addEventListener('toast', handleToast);

    return () => {
      window.removeEventListener('new-message', handleNewMessage);
      window.removeEventListener('request-update', handleRequestUpdate);
      window.removeEventListener('toast', handleToast);
    };
  }, []);

  const addToast = (toast) => {
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
          onClick={toast.onClick}
        />
      ))}
    </div>
  );
};

export default ToastManager;
