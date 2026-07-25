import { BellAlertIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Bandeau d'alerte pour les demandes en attente
 */
const DemandesAlert = ({ count, onView, onDismiss }) => {
    if (count <= 0) return null;

    return (
        <div className="bg-gradient-to-r from-amber-50 to-amber-50/60 border border-amber-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 shadow-sm animate-fade-in-down">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <BellAlertIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <p className="text-xs sm:text-sm text-amber-900 flex-1">
                <span className="font-bold">{count} demande{count > 1 ? 's' : ''}</span> en attente
            </p>
            <button
                onClick={onView}
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-amber-600 text-white text-[10px] sm:text-xs font-semibold rounded-md hover:bg-amber-700 active:scale-95 transition-all shadow-sm"
            >
                Voir
            </button>
            <button
                onClick={onDismiss}
                aria-label="Fermer l'alerte"
                className="p-1 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded transition-colors"
            >
                <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
        </div>
    );
};

export default DemandesAlert;
