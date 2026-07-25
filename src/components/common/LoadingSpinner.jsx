import Spinner from "./Spinner";

const SPINNER_SIZE = {
    small: "sm",
    medium: "lg",
    large: "xl",
};

/**
 * Loader plein écran / section, avec message et puces animées.
 * Pour un simple indicateur inline (bouton, table, header), utiliser `Spinner` directement.
 */
const LoadingSpinner = ({
    message = "Chargement en cours...",
    size = "large",
    fullScreen = false
}) => {
    const textSizeClasses = {
        small: "text-xs",
        medium: "text-sm",
        large: "text-base"
    };

    const containerClasses = fullScreen
        ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        : "flex items-center justify-center py-12";

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-4">
                <Spinner size={SPINNER_SIZE[size] || "xl"} color="indigo" />

                {/* Message */}
                {message && (
                    <div className="text-center">
                        <p className={`${textSizeClasses[size]} font-semibold text-slate-700`}>
                            {message}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Skeleton loader pour le dashboard
 */
export const DashboardSkeleton = () => {
    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6 animate-pulse">
            {/* Header */}
            <div className="h-12 bg-slate-100 rounded-lg w-full"></div>

            {/* Actions prioritaires */}
            <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded w-40"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-slate-100 rounded-lg"></div>
                    ))}
                </div>
            </div>

            {/* KPI */}
            <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded w-48"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded w-48"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>
                    ))}
                </div>
            </div>

            {/* Expéditions */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50">
                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                </div>
                <div className="divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="px-4 py-3 flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-slate-100 rounded w-32"></div>
                                <div className="h-2 bg-slate-100 rounded w-48"></div>
                            </div>
                            <div className="h-4 bg-slate-100 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-slate-100 rounded-lg"></div>
                ))}
            </div>
        </div>
    );
};

export default LoadingSpinner;
