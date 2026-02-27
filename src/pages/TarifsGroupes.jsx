import React, { useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import TarifGroupageComponent from "../components/tarifGroupage";
import { useTarifs } from "../hooks/useTarifs";
import {
    BanknotesIcon,
    TableCellsIcon,
    ArrowTrendingUpIcon,
    AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

const TarifsGroupes = () => {
    const { existingGroupageTarifs, fetchTarifGroupageAgence } = useTarifs();

    useEffect(() => {
        fetchTarifGroupageAgence();
    }, [fetchTarifGroupageAgence]);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700">

                {/* --- SIMPLE HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                            Tarifs Groupage
                        </h1>
                        <p className="text-sm font-medium text-slate-500 max-w-lg">
                            Optimisez vos expéditions groupées. Gérez les tarifs par type de colis et mode de transport.
                        </p>
                    </div>
                </div>

                {/* --- ACTIONS HEADER --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <TableCellsIcon className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-bold text-slate-900 uppercase">Tarification Groupée</span>
                    </div>

                    <div className="flex items-center space-x-3 text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-xl">
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest italic">
                            Configuration par Modes
                        </span>
                    </div>
                </div>

                {/* --- DYNAMIC CONTENT --- */}
                <main className="relative animate-in slide-in-from-bottom-4 duration-500 mt-2">
                    <TarifGroupageComponent />
                </main>

            </div>
        </DashboardLayout>
    );
};

export default TarifsGroupes;
