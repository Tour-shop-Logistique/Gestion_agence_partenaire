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

    const stats = useMemo(() => [
        {
            label: "Modes Actifs",
            value: existingGroupageTarifs?.length || 0,
            icon: ArrowTrendingUpIcon,
            color: "text-amber-600",
            bg: "bg-amber-50"
        }
    ], [existingGroupageTarifs]);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700">

                {/* --- PREMIUM HEADER --- */}
                <header className="relative overflow-hidden rounded-2xl bg-slate-950 px-6 py-8 md:px-8 md:py-10 shadow-xl">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-amber-500/20 rounded-lg backdrop-blur-md border border-amber-400/20">
                                    <BanknotesIcon className="w-5 h-5 text-amber-400" />
                                </div>
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Logistique</span>
                            </div>
                            <h1 className="text-xl sm:text-4xl font-bold text-white leading-tight tracking-tight mb-3">
                                Tarifs <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Groupage</span>
                            </h1>
                            <p className="hidden sm:block text-slate-400 text-sm font-medium max-w-lg leading-relaxed">
                                Optimisez vos expéditions groupées. Gérez les tarifs par type de colis et mode de transport pour maximiser vos revenus.
                            </p>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 gap-3 shrink-0">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/5 p-3 sm:p-5 rounded-xl transition-colors group px-8">
                                    <div className={`p-1.5 w-fit rounded-md ${stat.bg} ${stat.color} mb-2`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className="text-lg sm:text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </header>

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
