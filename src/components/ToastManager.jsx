import { Toaster } from 'sonner';

/**
 * Point de montage unique du système de toast (moteur: sonner).
 * L'API publique reste `utils/toast.js` (toast.success/error/info/warning/chat) —
 * ce composant ne fait que déclarer le rendu visuel et le thème.
 */
const ToastManager = () => {
  return (
    <Toaster
      position="top-right"
      visibleToasts={4}
      closeButton
      gap={12}
      toastOptions={{
        duration: 5000,
        className: 'font-sans',
        classNames: {
          toast:
            'rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border backdrop-blur-md px-4 py-3.5',
          title: 'text-sm font-semibold tracking-tight',
          description: 'text-sm text-slate-500',
          closeButton: 'opacity-60 hover:opacity-100',
        },
      }}
      style={{
        '--normal-bg': '#ffffff',
        '--normal-border': '#e2e8f0',
        '--normal-text': '#1e293b',
        '--success-bg': '#ecfdf5',
        '--success-border': '#a7f3d0',
        '--success-text': '#065f46',
        '--error-bg': '#fff1f2',
        '--error-border': '#fecdd3',
        '--error-text': '#9f1239',
        '--warning-bg': '#fffbeb',
        '--warning-border': '#fde68a',
        '--warning-text': '#92400e',
        '--info-bg': '#eef2ff',
        '--info-border': '#c7d2fe',
        '--info-text': '#3730a3',
      }}
    />
  );
};

export default ToastManager;
