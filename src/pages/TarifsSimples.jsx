import React, { useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import TarifSimpleComponent from "../components/tarifSimple";
import { useTarifs } from "../hooks/useTarifs";
import {
    BanknotesIcon,
    Squares2X2Icon,
    ChartBarIcon,
    ShieldCheckIcon,
    AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

const TarifsSimples = () => {
    const { existingTarifs, fetchAgencyTarifs } = useTarifs();

    useEffect(() => {
        fetchAgencyTarifs();
    }, [fetchAgencyTarifs]);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700">

                {/* --- SIMPLE HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                            Tarifs Simples
                        </h1>
                        <p className="text-sm font-medium text-slate-500 max-w-lg">
                            Gérez vos tarifs d'expédition standard par zones et par indices.
                        </p>
                    </div>
                </div>

                {/* --- ACTIONS HEADER --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <Squares2X2Icon className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-bold text-slate-900 uppercase">Catalogue Simple</span>
                    </div>

                    <div className="flex items-center space-x-3 text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-xl">
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest italic">
                            Configuration par Zones
                        </span>
                    </div>
                </div>

                {/* --- DYNAMIC CONTENT --- */}
                <main className="relative animate-in slide-in-from-bottom-4 duration-500 mt-2">
                    <TarifSimpleComponent />
                </main>

            </div>
        </DashboardLayout>
    );
};

export default TarifsSimples;
