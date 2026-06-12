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
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import { toast } from "../utils/toast";

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
  const [mainTab, setMainTab] = useState("agency"); // "agency" or "base"
  const [activeTab, setActiveTab] = useState("tous");
  const [editingTarif, setEditingTarif] = useState(null);
  const [selectedBaseRate, setSelectedBaseRate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpeditionType, setSelectedExpeditionType] = useState("Tous les types d'expedition");

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
  }, [fetchTarifsGroupageBase, fetchTarifGroupageAgence]);

  // Trigger Toasts for messages and errors
  useEffect(() => {
    if (message) {
      if (message.toLowerCase().includes("erreur") || message.toLowerCase().includes("désolé") || message.toLowerCase().includes("impossible")) {
        toast.error(message);
      } else {
        toast.success(message);
      }
      clearMessage();
    }
    if (error) {
      toast.error(typeof error === 'string' ? error : "Une erreur est survenue");
      clearMessage();
    }
  }, [message, error, clearMessage]);



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

  // Flatten rates for table view
  const flattenedAgencyTarifs = useMemo(() => {
    if (!existingGroupageTarifs || !Array.isArray(existingGroupageTarifs)) return [];
    return existingGroupageTarifs;
  }, [existingGroupageTarifs]);

  const flattenedBaseTarifs = useMemo(() => {
    if (!groupageTarifs || !Array.isArray(groupageTarifs)) return [];
    return groupageTarifs;
  }, [groupageTarifs]);

  // Filter tarifs based on search, active tab, and expedition type
  const filteredTarifs = useMemo(() => {
    let result = mainTab === "agency" ? flattenedAgencyTarifs : flattenedBaseTarifs;

    // Filter by status tab (only for agency tarifs)
    if (mainTab === "agency") {
      if (activeTab === "actives") {
        result = result.filter(t => t.actif === true);
      } else if (activeTab === "inactives") {
        result = result.filter(t => t.actif === false);
      }
    }

    // Filter by expedition type
    if (selectedExpeditionType !== "Tous les types d'expedition") {
      result = result.filter(t => {
        const typeMatch = t.type_expedition?.toLowerCase().includes(selectedExpeditionType.toLowerCase());
        return typeMatch;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.pays?.toLowerCase().includes(query) ||
        t.category?.nom?.toLowerCase().includes(query) ||
        t.mode?.toLowerCase().includes(query) ||
        t.ligne?.toLowerCase().includes(query) ||
        t.type_expedition?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [flattenedAgencyTarifs, flattenedBaseTarifs, mainTab, activeTab, selectedExpeditionType, searchQuery]);

  // Get unique expedition types for filter dropdown
  const expeditionTypes = useMemo(() => {
    const types = new Set();
    const sourceData = mainTab === "agency" ? flattenedAgencyTarifs : flattenedBaseTarifs;
    sourceData.forEach(t => {
      if (t.type_expedition) {
        types.add(t.type_expedition);
      }
    });
    return ["Tous les types d'expedition", ...Array.from(types)];
  }, [flattenedAgencyTarifs, flattenedBaseTarifs, mainTab]);

  // Count by status
  const statusCounts = useMemo(() => {
    return {
      tous: flattenedAgencyTarifs.length,
      actives: flattenedAgencyTarifs.filter(t => t.actif === true).length,
      inactives: flattenedAgencyTarifs.filter(t => t.actif === false).length
    };
  }, [flattenedAgencyTarifs]);

  const kpis = [
    { 
      label: mainTab === "agency" ? "Tarifs Agence" : "Tarifs Base", 
      value: mainTab === "agency" ? statusCounts.tous : flattenedBaseTarifs.length, 
      icon: ArchiveBoxIcon, 
      color: "text-indigo-600" 
    },
    { 
      label: mainTab === "agency" ? "Actifs" : "Modèles Disponibles", 
      value: mainTab === "agency" ? statusCounts.actives : flattenedBaseTarifs.length, 
      icon: GlobeAltIcon, 
      color: "text-emerald-600" 
    },
    { 
      label: mainTab === "agency" ? "Inactifs" : "Types Expédition", 
      value: mainTab === "agency" ? statusCounts.inactives : expeditionTypes.length - 1, 
      icon: TruckIcon, 
      color: "text-slate-600" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-slate-50 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Tab Selector */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="inline-flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => {
              setMainTab("agency");
              setActiveTab("tous");
            }}
            className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
              mainTab === "agency" 
                ? "bg-white text-slate-950 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Mes Groupages
          </button>
          <button
            onClick={() => {
              setMainTab("base");
              setActiveTab("tous");
            }}
            className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
              mainTab === "base" 
                ? "bg-white text-slate-950 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Tarifs de Base
          </button>
        </div>
      </div>

      {/* Action Bar - Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Top Row: Search + Filters + Actions */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par pays ou catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedExpeditionType}
              onChange={(e) => setSelectedExpeditionType(e.target.value)}
              className="pl-10 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer min-w-[200px]"
            >
              {expeditionTypes.map(type => (
                <option key={type} value={type}>
                  {type === "Tous les types d'expedition" ? type : type.replace('groupage_', '').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-100 transition-all shadow-none hover:shadow-sm active:scale-95 ${loading ? 'opacity-50' : ''}`}
              title="Rafraîchir"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              onClick={() => handleNewTarif()}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {mainTab === "agency" ? "Ajouter" : "Nouveau depuis Base"}
            </button>
          </div>
        </div>

        {/* Tabs Row - Only for Agency */}
        {mainTab === "agency" && (
          <div className="flex items-center gap-2 border-b border-slate-200 pb-0">
            <button
              onClick={() => setActiveTab("tous")}
              className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-[1px] ${
                activeTab === "tous"
                  ? "text-slate-900 border-slate-900"
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              Toutes ({statusCounts.tous})
            </button>
            <button
              onClick={() => setActiveTab("actives")}
              className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-[1px] ${
                activeTab === "actives"
                  ? "text-emerald-600 border-emerald-600"
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              Actives ({statusCounts.actives})
            </button>
            <button
              onClick={() => setActiveTab("inactives")}
              className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-[1px] ${
                activeTab === "inactives"
                  ? "text-slate-600 border-slate-600"
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              Inactives ({statusCounts.inactives})
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && !filteredTarifs.length ? (
          <div className="p-10">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : filteredTarifs.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wide">Type / Catégorie</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wide">Itinéraire / Pays</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wide text-right">
                      {mainTab === "agency" ? "Montant Base" : "Montant Base"}
                    </th>
                    {mainTab === "agency" && (
                      <>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wide text-right">Prestation</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wide text-right">Total</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wide text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTarifs.map((tarif, index) => {
                    const montantBase = mainTab === "agency" ? (tarif.montant_expedition || 0) : (tarif.montant_base || 0);
                    const pourcentage = tarif.pourcentage_prestation || 0;
                    const montantPrestation = Math.round(montantBase * pourcentage / 100);
                    const total = montantBase + montantPrestation;

                    return (
                      <tr key={`${mainTab}-tarif-${tarif.id || index}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                              tarif.type_expedition?.includes('afrique') 
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : tarif.type_expedition?.includes('dhd_aerien')
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : tarif.type_expedition?.includes('dhd_maritime')
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : tarif.type_expedition?.includes('ca')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {tarif.type_expedition?.replace('groupage_', '').replace('_', ' ').toUpperCase() || 'N/A'}
                            </span>
                            {tarif.mode && (
                              <p className="text-xs font-medium text-slate-600">
                                {tarif.mode} {tarif.ligne ? `→ ${tarif.ligne}` : ''}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-900">
                              {tarif.category?.nom || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {tarif.pays || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-slate-900">
                            {montantBase.toLocaleString()} <span className="text-xs text-slate-500 font-normal">FCFA</span>
                          </span>
                        </td>
                        {mainTab === "agency" && (
                          <>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                  {pourcentage}%
                                </span>
                                <span className="text-sm text-slate-600 font-medium">
                                  ({montantPrestation.toLocaleString()} <span className="text-xs text-slate-400">FCFA</span>)
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-base font-bold text-slate-900">
                                {total.toLocaleString()} <span className="text-xs text-slate-500 font-medium">FCFA</span>
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {mainTab === "agency" ? (
                              <>
                                <StatusToggle
                                  active={tarif.actif}
                                  onClick={() => handleToggleStatus(tarif)}
                                />
                                <button
                                  onClick={() => handleEditTarif(tarif)}
                                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Modifier"
                                >
                                  <PencilSquareIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTarif(tarif)}
                                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleNewTarif(tarif)}
                                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                Configurer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-4">
              {filteredTarifs.map((tarif, index) => {
                const montantBase = mainTab === "agency" ? (tarif.montant_expedition || 0) : (tarif.montant_base || 0);
                const pourcentage = tarif.pourcentage_prestation || 0;
                const montantPrestation = Math.round(montantBase * pourcentage / 100);
                const total = montantBase + montantPrestation;

                return (
                  <div key={`${mainTab}-mobile-${tarif.id || index}`} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                          tarif.type_expedition?.includes('afrique') 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : tarif.type_expedition?.includes('dhd')
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : tarif.type_expedition?.includes('ca')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {tarif.type_expedition?.replace('groupage_', '').replace('_', ' ').toUpperCase() || 'N/A'}
                        </span>
                        <p className="text-sm font-bold text-slate-900">
                          {tarif.category?.nom || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tarif.pays || 'N/A'}
                        </p>
                      </div>
                      {mainTab === "agency" && (
                        <StatusToggle
                          active={tarif.actif}
                          onClick={() => handleToggleStatus(tarif)}
                        />
                      )}
                    </div>

                    {/* Mode info */}
                    {tarif.mode && (
                      <div className="text-xs font-medium text-slate-600 pb-2 border-b border-slate-100">
                        {tarif.mode} {tarif.ligne ? `→ ${tarif.ligne}` : ''}
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Montant Base</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {montantBase.toLocaleString()} FCFA
                        </span>
                      </div>
                      {mainTab === "agency" && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium">Prestation</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                {pourcentage}%
                              </span>
                              <span className="text-sm text-slate-600">
                                {montantPrestation.toLocaleString()} FCFA
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-sm font-bold text-slate-900">Total</span>
                            <span className="text-base font-bold text-slate-900">
                              {total.toLocaleString()} FCFA
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    {mainTab === "agency" ? (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEditTarif(tarif)}
                          className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100 hover:bg-blue-100 transition-all"
                        >
                          <PencilSquareIcon className="w-4 h-4 inline mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteTarif(tarif)}
                          className="flex-1 py-2 px-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-100 hover:bg-rose-100 transition-all"
                        >
                          <TrashIcon className="w-4 h-4 inline mr-1" />
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleNewTarif(tarif)}
                        className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all"
                      >
                        Configurer ce tarif
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState onAction={() => handleNewTarif()} />
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
    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Aucun tarif groupage</h3>
    <p className="text-xs font-medium text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
      Vous n'avez pas encore configuré de tarifs pour les expéditions en groupage.
      Commencez par ajouter un nouveau tarif.
    </p>
    <button
      onClick={onAction}
      className="inline-flex items-center px-6 py-2 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm"
    >
      <PlusIcon className="w-4 h-4 mr-2" />
      AJOUTER UN TARIF
    </button>
  </div>
);

export default TarifGroupageComponent;
