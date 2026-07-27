import { ArrowPathIcon } from "@heroicons/react/24/outline";
import ExchangeRateWidget from "./ExchangeRateWidget";

/**
 * Header du dashboard : titre, statut de rafraîchissement, taux de conversion
 */
const DashboardHeader = ({ isRefreshing, lastUpdated, onRefresh }) => {
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
                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
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

            <ExchangeRateWidget />
        </div>
    );
};

export default DashboardHeader;
