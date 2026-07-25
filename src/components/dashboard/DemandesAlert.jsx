import { BellAlertIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Bandeau d'alerte pour les demandes en attente
 */
const DemandesAlert = ({ count, onView, onDismiss }) => {
    if (count <= 0) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
            <BellAlertIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-amber-900 flex-1">
                <span className="font-bold">{count} demande{count > 1 ? 's' : ''}</span> en attente
            </p>
            <button
                onClick={onView}
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-600 text-white text-[10px] sm:text-xs font-semibold rounded hover:bg-amber-700 transition-colors"
            >
                Voir
            </button>
            <button
                onClick={onDismiss}
                aria-label="Fermer l'alerte"
                className="p-1 text-amber-400 hover:text-amber-600 transition-colors"
            >
                <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
        </div>
    );
};

export default DemandesAlert;
