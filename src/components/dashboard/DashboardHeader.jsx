import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

/**
 * Header du dashboard : titre, statut de rafraîchissement, actions principales
 */
const DashboardHeader = ({ isRefreshing, lastUpdated, onRefresh, onCreateExpedition }) => {
    return (
        <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    aria-label="Actualiser le dashboard"
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm active:scale-95 transition-all disabled:opacity-50"
                    title="Actualiser"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                    <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
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
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:from-indigo-700 hover:to-indigo-600 active:scale-[0.98] transition-all shadow-sm hover:shadow-md hover:shadow-indigo-200 flex items-center gap-1.5 sm:gap-2"
            >
                <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Nouvelle expédition</span>
                <span className="sm:hidden">Nouveau</span>
            </button>
        </div>
    );
};

export default DashboardHeader;
