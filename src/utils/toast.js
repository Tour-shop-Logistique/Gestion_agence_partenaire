
/**
 * Utility to trigger toast notifications via custom events
 */
export const showToast = (message, type = 'info', duration = 5000) => {
    const event = new CustomEvent('toast', {
        detail: { message, type, duration }
    });
    window.dispatchEvent(event);
};

export const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    chat: (msg, duration) => showToast(msg, 'chat', duration),
};
