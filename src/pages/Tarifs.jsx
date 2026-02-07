import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import TarifSimpleComponent from "../components/tarifSimple";
import TarifGroupageComponent from "../components/tarifGroupage";
import { useTarifs } from "../hooks/useTarifs";
import {
  BanknotesIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

const Tarifs = () => {
  const [selectedTarif, setSelectedTarif] = useState("simple");
  const { existingTarifs, existingGroupageTarifs, fetchAgencyTarifs, fetchTarifGroupageAgence } = useTarifs();

  useEffect(() => {
    fetchAgencyTarifs();
    fetchTarifGroupageAgence();
  }, [fetchAgencyTarifs, fetchTarifGroupageAgence]);

  const globalStats = useMemo(() => [
    {
      label: "Zones Actives",
      value: existingTarifs?.reduce((acc, t) => acc + (t.prix_zones?.length || 0), 0) || 0,
      icon: ChartBarIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      label: "Indices Simples",
      value: existingTarifs?.length || 0,
      icon: ShieldCheckIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      label: "Modes Groupage",
      value: existingGroupageTarifs?.length || 0,
      icon: ArrowTrendingUpIcon,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ], [existingTarifs, existingGroupageTarifs]);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">

        {/* --- PREMIUM HEADER --- */}
      <header className="relative overflow-hidden rounded-2xl bg-slate-950 px-6 py-8 md:px-8 md:py-10 shadow-xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-md border border-indigo-400/20">
                  <BanknotesIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Management</span>
              </div>
              <h1 className="text-xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-3">
                Gestion des <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Tarifs</span>
              </h1>
              <p className="hidden sm:block text-slate-400 text-sm font-medium max-w-lg leading-relaxed">
                Pilotez votre stratégie tarifaire avec précision. Ajustez vos marges prestation, gérez vos indices et synchronisez vos prix agence en temps réel.
              </p>
            </div>

            {/* Quick Stats Grid - Optimized for mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              {globalStats.map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/5 p-3 sm:p-5 rounded-xl transition-colors group">
                  <div className={`p-1.5 w-fit rounded-md ${stat.bg} ${stat.color} mb-2`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-lg sm:text-2xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* --- UX PREMIUM TABS --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex w-full sm:w-auto p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedTarif("simple")}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${selectedTarif === "simple"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span>SIMPLE</span>
            </button>
            <button
              onClick={() => setSelectedTarif("groupage")}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${selectedTarif === "groupage"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <TableCellsIcon className="w-4 h-4" />
              <span>GROUPAGE</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-xl">
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">
              Configuration {selectedTarif === 'simple' ? 'par Zones' : 'par Modes'}
            </span>
          </div>
        </div>

        {/* --- DYNAMIC CONTENT --- */}
        <main className="relative transition-all duration-500 mt-2">
          {selectedTarif === "simple" ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <TarifSimpleComponent />
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <TarifGroupageComponent />
            </div>
          )}
        </main>

      </div>
    </DashboardLayout>
  );
};

export default Tarifs;
