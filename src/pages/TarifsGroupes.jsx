import { useEffect } from "react";
import TarifGroupageComponent from "../components/tarifGroupage";
import { useTarifs } from "../hooks/useTarifs";
import {
    TableCellsIcon,
    AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

const TarifsGroupes = () => {
    const { fetchTarifGroupageAgence } = useTarifs();

    useEffect(() => {
        fetchTarifGroupageAgence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-4 sm:space-y-8 px-3 sm:px-6 animate-in fade-in duration-700">

            {/* --- SIMPLE HEADER - Responsive --- */}
            <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 sm:pb-6">
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1 sm:mb-2">
                        Tarifs Groupage
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-lg">
                        Optimisez vos expéditions groupées par type et mode de transport
                    </p>
                </div>
            </div>

            {/* --- ACTIONS HEADER - Responsive --- */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm">
                    <TableCellsIcon className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 uppercase">Tarification Groupée</span>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 text-slate-400 bg-white border border-slate-200 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl">
                    <AdjustmentsHorizontalIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide italic">
                        Configuration par Modes
                    </span>
                </div>
            </div>

            {/* --- DYNAMIC CONTENT --- */}
            <main className="relative animate-in slide-in-from-bottom-4 duration-500 mt-2">
                <TarifGroupageComponent />
            </main>

        </div>
    );
};

export default TarifsGroupes;
