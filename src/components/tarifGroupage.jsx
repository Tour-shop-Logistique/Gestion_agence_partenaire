import React, { useState, useEffect, useMemo } from "react";
import { useTarifs } from "../hooks/useTarifs";
import AddAgencyTarifModal from "../components/groupageForm";
import {
  PlusIcon,
  ArchiveBoxIcon,
  GlobeAltIcon,
  TruckIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronRightIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const StatusToggle = ({ active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={active ? "Désactiver" : "Activer"}
    className={`
      relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
      ${active ? 'bg-emerald-500' : 'bg-slate-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
        ${active ? 'translate-x-4' : 'translate-x-0'}
      `}
    />
  </button>
);

const TarifGroupageComponent = () => {
  const [showTarifGroupage, setShowTarifGroupage] = useState(false);
  const [activeTab, setActiveTab] = useState("agency"); // Changed default to "agency"
  const [editingTarif, setEditingTarif] = useState(null);
  const [selectedBaseRate, setSelectedBaseRate] = useState(null);

  const {
    loading,
    error,
    message,
    groupageTarifs,
    existingGroupageTarifs,
    fetchTarifsGroupageBase,
    fetchTarifGroupageAgence,
    toggleTarifGroupageStatus,
    clearMessage
  } = useTarifs();

  useEffect(() => {
    fetchTarifsGroupageBase();
    fetchTarifGroupageAgence();
  }, [fetchTarifsGroupageBase, fetchTarifGroupageAgence]); // Added dependencies

  const groupRates = (rates) => {
    if (!rates || !Array.isArray(rates)) return [];
    const groups = {};
    rates.forEach((rate) => {
      const categoryName = rate.category?.nom || (rate.type_expedition === 'groupage_afrique' ? 'Expédition Afrique' : (rate.type_expedition === 'groupage_ca' ? 'Expédition CA' : 'Général'));
      const key = `${categoryName}-${rate.pays}-${rate.type_expedition}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          categoryName,
          pays: rate.pays,
          type_expedition: rate.type_expedition,
          modes: []
        };
      }
      groups[key].modes.push(rate);
    });
    return Object.values(groups);
  };

  const handleNewTarif = (baseRate = null) => {
    setEditingTarif(null);
    setSelectedBaseRate(baseRate);
    setShowTarifGroupage(true);
  };

  const handleEditTarif = (tarif) => {
    setEditingTarif(tarif);
    setSelectedBaseRate(null);
    setShowTarifGroupage(true);
  };

  const handleDeleteTarif = (tarif) => {
    setEditingTarif({ ...tarif, delete: true });
    setSelectedBaseRate(null);
    setShowTarifGroupage(true);
  };

  const handleToggleStatus = async (tarif) => {
    try {
      if (tarif.id) {
        await toggleTarifGroupageStatus(tarif.id);
        // La mise à jour est gérée par Redux, mais on peut forcer un refresh si besoin
      }
    } catch (error) {
      console.error("Erreur toggle status groupage:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchTarifsGroupageBase(true),
        fetchTarifGroupageAgence(true)
      ]);
    } catch (err) {
      console.error("Erreur refresh groupage:", err);
    }
  };

  const groupedBaseTarifs = useMemo(() => groupRates(groupageTarifs), [groupageTarifs]);
  const groupedAgencyTarifs = useMemo(() => groupRates(existingGroupageTarifs), [existingGroupageTarifs]);

  const kpis = [
    { label: "Tarifs Agence", value: existingGroupageTarifs?.length || 0, icon: ArchiveBoxIcon, color: "text-indigo-600" },
    { label: "Modèles Groupage", value: groupageTarifs?.length || 0, icon: GlobeAltIcon, color: "text-slate-600" },
    { label: "Modes Actifs", value: (existingGroupageTarifs?.length || 0), icon: TruckIcon, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-slate-50 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar - SaaS Style */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="inline-flex flex-1 sm:flex-none p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab("agency")}
              className={`flex-1 sm:flex-none px-4 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === "agency" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Mes Groupages
            </button>
            <button
              onClick={() => setActiveTab("base")}
              className={`flex-1 sm:flex-none px-4 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === "base" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Modèles
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-100 transition-all shadow-none hover:shadow-sm active:scale-95 ${loading ? 'opacity-50' : ''}`}
            title="Rafraîchir les données"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        <button
          onClick={() => handleNewTarif()}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau Tarif
        </button>
      </div>

      {/* Alerts - Refined */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center shadow-sm ${message.includes("succès")
          ? "bg-emerald-50 border-emerald-100 text-emerald-800"
          : "bg-blue-50 border-blue-100 text-blue-800"
          }`}>
          <div className={`mr-3 p-1 rounded-full ${message.includes("succès") ? "bg-emerald-100" : "bg-blue-100"}`}>
            <ArrowPathIcon className={`w-4 h-4 ${message.includes("succès") ? "text-emerald-600" : "text-blue-600"}`} />
          </div>
          <p className="text-xs font-bold">{message}</p>
        </div>
      )}

      {/* Main Grid / Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-4 w-32 bg-slate-100 rounded animate-pulse"></div>
                  <div className="h-24 bg-slate-50 rounded-2xl animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "agency" ? (
          existingGroupageTarifs?.length > 0 ? (
            <>
              {/* Desktop Table (Agency) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catégorie / Pays</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Modes configurés</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedAgencyTarifs.map((group) => (
                      <tr key={group.id} className="hover:bg-slate-50/50 transition-colors align-top">
                        <td className="px-6 py-5">
                          <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter shadow-sm border ${group.type_expedition?.includes('dhd') ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            group.type_expedition?.includes('afrique') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                            {group.type_expedition?.replace('groupage_', '').toUpperCase() || 'GROUPAGE'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{group.categoryName}</p>
                          <p className="text-xs font-medium text-slate-500">{group.pays}</p>
                        </td>
                        <td className="px-6 py-5 min-w-[300px]">
                          <div className="flex flex-col gap-2">
                            {group.modes.map((mode) => (
                              <div key={mode.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group/mode">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">
                                    {mode.mode} {mode.ligne ? `(${mode.ligne})` : ''}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">{mode.montant_expedition?.toLocaleString()}</span>
                                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">+{mode.pourcentage_prestation}%</span>
                                    <span className="text-[10px] font-medium text-slate-400">FCFA</span>
                                  </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover/mode:opacity-100 transition-opacity items-center">
                                  <StatusToggle
                                    active={mode.actif}
                                    onClick={() => handleToggleStatus(mode)}
                                  />
                                  <button onClick={() => handleEditTarif(mode)} className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded transition-colors" title="Modifier">
                                    <PencilSquareIcon className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteTarif(mode)} className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-50 rounded transition-colors" title="Supprimer">
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (Agency) - Premium Cards */}
              <div className="lg:hidden space-y-4 p-4 bg-slate-50/50">
                {groupedAgencyTarifs.map((group) => (
                  <div key={group.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-flex px-2 py-0.5 mb-2 rounded text-[8px] font-bold uppercase tracking-widest border ${group.type_expedition?.includes('dhd') ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          group.type_expedition?.includes('afrique') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                          {group.type_expedition?.replace('groupage_', '').toUpperCase() || 'GROUPAGE'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{group.categoryName}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{group.pays}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {group.modes.map((mode) => (
                        <div key={mode.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group">
                          <div>
                            <p className="text-[10px] font-bold text-slate-900 mb-1 flex items-center gap-2">
                              {mode.mode}
                              {mode.ligne && <span className="text-[9px] font-bold text-blue-500">{mode.ligne}</span>}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-slate-900 font-mono tracking-tighter">{mode.montant_expedition?.toLocaleString()}</span>
                              <span className="text-[10px] font-bold text-indigo-600 bg-white border border-indigo-100 px-1.5 py-0.5 rounded shadow-sm">+{mode.pourcentage_prestation}%</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <StatusToggle
                              active={mode.actif}
                              onClick={() => handleToggleStatus(mode)}
                            />
                            <button
                              onClick={() => handleEditTarif(mode)}
                              className="p-2 bg-white text-slate-600 border border-slate-200 rounded-lg shadow-sm"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTarif(mode)}
                              className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg shadow-sm"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState onAction={() => setActiveTab("base")} />
          )
        ) : (
          <>
            {/* Desktop Table (Base) */}
            <div className="hidden lg:block overflow-x-auto">
              {/* ... table content remains similar ... */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type d'expédition</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Détails modèle</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Modes disponibles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupedBaseTarifs.map((group) => (
                    <tr key={group.id} className="hover:bg-slate-50/50 transition-colors align-top">
                      <td className="px-6 py-5">
                        <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-tighter shadow-sm border border-slate-200">
                          {group.type_expedition?.replace('groupage_', '').toUpperCase() || 'MOCKED'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{group.categoryName}</p>
                        <p className="text-xs font-medium text-slate-500">{group.pays}</p>
                      </td>
                      <td className="px-6 py-5 min-w-[250px]">
                        <div className="flex flex-col gap-2">
                          {group.modes.map((mode) => (
                            <div key={mode.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 group/base">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{mode.mode}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-slate-900">{mode.montant_base?.toLocaleString()}</span>
                                  <span className="text-[10px] font-medium text-slate-400 uppercase">FCFA</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleNewTarif(mode)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-950 text-slate-950 hover:text-white text-[10px] font-bold rounded border border-slate-200 hover:border-slate-950 transition-all shadow-sm"
                              >
                                IMPORT
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (Base) */}
            <div className="lg:hidden space-y-4 p-4 bg-slate-50/50">
              {groupedBaseTarifs.map((group) => (
                <div key={group.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex px-2 py-0.5 mb-2 rounded text-[8px] font-bold text-slate-500 bg-slate-100 uppercase tracking-widest border border-slate-200">
                        {group.type_expedition?.replace('groupage_', '').toUpperCase() || 'MOCKED'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{group.categoryName}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{group.pays}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.modes.map((mode) => (
                      <div key={mode.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-900 mb-1 uppercase tracking-tighter">{mode.mode}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold text-slate-900 font-mono tracking-tighter">{mode.montant_base?.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">FCFA</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNewTarif(mode)}
                          className="px-4 py-2 bg-white text-slate-950 text-[10px] font-bold border border-slate-200 rounded-lg shadow-sm"
                        >
                          IMPORT
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showTarifGroupage && (
        <AddAgencyTarifModal
          show={showTarifGroupage}
          onClose={() => {
            setShowTarifGroupage(false);
            setEditingTarif(null);
            setSelectedBaseRate(null);
            clearMessage();
          }}
          editingTarif={editingTarif}
          selectedBaseRate={selectedBaseRate}
        />
      )}
    </div>
  );
};

const EmptyState = ({ onAction }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
      <ArchiveBoxIcon className="w-8 h-8 text-slate-300" />
    </div>
    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Aucun tarif personnalisé</h3>
    <p className="text-xs font-medium text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
      Vous n'avez pas encore configuré de marges pour les expéditions en groupage.
      Utilisez les modèles de base pour commencer.
    </p>
    <button
      onClick={onAction}
      className="inline-flex items-center px-6 py-2 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm"
    >
      VOIR LES MODÈLES
    </button>
  </div>
);

export default TarifGroupageComponent;
