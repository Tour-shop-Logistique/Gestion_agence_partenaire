import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

/**
 * Header du dashboard : titre, statut de rafraîchissement, actions principales
 */
const DashboardHeader = ({ isRefreshing, lastUpdated, onRefresh, onCreateExpedition }) => {
    return (
        <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    aria-label="Actualiser le dashboard"
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                    title="Actualiser"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <div className="flex items-center gap-1 sm:gap-2">
                    <h1 className="text-base sm:text-lg font-bold text-slate-900">
                        Dashboard
                    </h1>
                    {isRefreshing && (
                        <span className="text-[10px] sm:text-xs text-indigo-600 font-medium animate-pulse">
                            Actualisation...
                        </span>
                    )}
                    {lastUpdated && !isRefreshing && (
                        <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">
                            • Mis à jour {new Date(lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={onCreateExpedition}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5 sm:gap-2"
            >
                <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Nouvelle expédition</span>
                <span className="sm:hidden">Nouveau</span>
            </button>
        </div>
    );
};

export default DashboardHeader;
