import { toast as sonnerToast } from 'sonner';
import { createElement } from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Façade au-dessus de sonner : garde la même API publique (showToast/toast.*)
 * pour ne pas avoir à toucher tous les appelants existants.
 */
export const showToast = (message, type = 'info', duration = 5000) => {
    const options = { duration };

    switch (type) {
        case 'success':
            return sonnerToast.success(message, options);
        case 'error':
            return sonnerToast.error(message, options);
        case 'warning':
            return sonnerToast.warning(message, options);
        case 'chat':
            return sonnerToast(message, {
                ...options,
                icon: createElement(MessageCircle, { className: 'w-4 h-4 text-indigo-600' }),
            });
        case 'info':
        default:
            return sonnerToast.info(message, options);
    }
};

export const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    chat: (msg, duration) => showToast(msg, 'chat', duration),
};
