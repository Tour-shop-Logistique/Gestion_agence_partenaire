import React, { useState, useEffect, useMemo } from "react";
import { useTarifs } from "../hooks/useTarifs";
import { useAuth } from "../hooks/useAuth";
import AddAgencyTarifModal from "../components/groupageForm";
import {
  PlusIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  XMarkIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { toast } from "../utils/toast";

const TableSkeleton = () => (
  <div className="divide-y divide-slate-100">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="px-6 py-4 flex items-center space-x-4 animate-pulse">
        <div className="h-4 w-16 bg-slate-100 rounded"></div>
        <div className="h-4 w-32 bg-slate-100 rounded"></div>
        <div className="h-4 w-20 bg-slate-100 rounded"></div>
        <div className="h-4 w-24 bg-slate-100 rounded"></div>
        <div className="h-4 w-20 bg-slate-100 rounded"></div>
        <div className="h-4 w-16 bg-slate-100 rounded ml-auto"></div>
      </div>
    ))}
  </div>
);

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

const typeBadgeClasses = (typeExpedition) => {
  if (typeExpedition?.includes('afrique')) return 'bg-amber-50 text-amber-700 border border-amber-100';
  if (typeExpedition?.includes('dhd_aerien')) return 'bg-blue-50 text-blue-700 border border-blue-100';
  if (typeExpedition?.includes('dhd_maritime')) return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
  if (typeExpedition?.includes('ca')) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

const TarifGroupageComponent = () => {
  const { isAgent } = useAuth();
  const [showTarifGroupage, setShowTarifGroupage] = useState(false);
  const [activeTab, setActiveTab] = useState("agency"); // "agency" or "base"
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

  const flattenedAgencyTarifs = useMemo(() => {
    if (!existingGroupageTarifs || !Array.isArray(existingGroupageTarifs)) return [];
    return existingGroupageTarifs;
  }, [existingGroupageTarifs]);

  const flattenedBaseTarifs = useMemo(() => {
    if (!groupageTarifs || !Array.isArray(groupageTarifs)) return [];
    return groupageTarifs;
  }, [groupageTarifs]);

  // Filtrage par recherche et par type d'expédition
  const currentData = useMemo(() => {
    let result = activeTab === "agency" ? flattenedAgencyTarifs : flattenedBaseTarifs;

    if (selectedExpeditionType !== "Tous les types d'expedition") {
      result = result.filter(t => t.type_expedition?.toLowerCase().includes(selectedExpeditionType.toLowerCase()));
    }

    if (searchQuery.trim()) {
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
  }, [flattenedAgencyTarifs, flattenedBaseTarifs, activeTab, selectedExpeditionType, searchQuery]);

  const expeditionTypes = useMemo(() => {
    const types = new Set();
    const sourceData = activeTab === "agency" ? flattenedAgencyTarifs : flattenedBaseTarifs;
    sourceData.forEach(t => {
      if (t.type_expedition) types.add(t.type_expedition);
    });
    return ["Tous les types d'expedition", ...Array.from(types)];
  }, [flattenedAgencyTarifs, flattenedBaseTarifs, activeTab]);

  // Répartition par type d'expédition, pour la vue actuellement affichée
  const statsByType = useMemo(() => {
    const sourceData = activeTab === "agency" ? flattenedAgencyTarifs : flattenedBaseTarifs;
    const counts = new Map();
    sourceData.forEach(t => {
      if (!t.type_expedition) return;
      counts.set(t.type_expedition, (counts.get(t.type_expedition) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [flattenedAgencyTarifs, flattenedBaseTarifs, activeTab]);

  return (
    <div className="space-y-4">
      {/* Premium Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="inline-flex flex-1 sm:flex-none p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab("agency")}
              className={`flex-1 sm:flex-none px-6 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === "agency" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Tarif Agence
            </button>
            <button
              onClick={() => setActiveTab("base")}
              className={`flex-1 sm:flex-none px-6 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === "base" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Tarif de Base
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-none hover:shadow-sm active:scale-95 ${loading ? 'opacity-50' : ''}`}
            title="Rafraîchir les données"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {!isAgent && (
          <button
            onClick={() => handleNewTarif()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm group active:scale-95"
          >
            <PlusIcon className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" />
            Ajouter un tarif groupage
          </button>
        )}
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-indigo-500/80 uppercase tracking-wide mb-1">Tarif Agence</p>
            <p className="text-2xl font-bold text-slate-900">{flattenedAgencyTarifs.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">
            <TableCellsIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-amber-600/80 uppercase tracking-wide mb-1">Tarif de Base</p>
            <p className="text-2xl font-bold text-slate-900">{flattenedBaseTarifs.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
            <DocumentDuplicateIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="col-span-2 bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Répartition par type ({activeTab === "agency" ? "Tarif Agence" : "Tarif de Base"})
          </p>
          {statsByType.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {statsByType.map(({ type, count }) => (
                <span
                  key={type}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${typeBadgeClasses(type)}`}
                >
                  {type.replace('groupage_', '').replace('_', ' ')}
                  <span className="px-1.5 py-0.5 rounded bg-white/60 text-[10px]">{count}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Search Bar + Filtre type d'expédition */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par pays, catégorie, mode, ligne..."
              className="w-full pl-10 pr-10 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                title="Effacer la recherche"
              >
                <XMarkIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={selectedExpeditionType}
              onChange={(e) => setSelectedExpeditionType(e.target.value)}
              className="h-full pl-4 pr-8 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-slate-50 cursor-pointer min-w-[180px] text-slate-600 font-medium"
            >
              {expeditionTypes.map(type => (
                <option key={type} value={type}>
                  {type === "Tous les types d'expedition" ? type : type.replace('groupage_', '').toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        {searchQuery && (
          <div className="mt-2 text-xs text-slate-500">
            <span className="font-semibold text-indigo-600">{currentData?.length || 0}</span> résultat{(currentData?.length || 0) > 1 ? 's' : ''} trouvé{(currentData?.length || 0) > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        {loading && (!currentData || currentData.length === 0) ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-r border-slate-100/50">
                      Type
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-r border-slate-100/50">
                      Catégorie / Pays
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-r border-slate-100/50">
                      Montant de Base
                    </th>
                    {activeTab === "agency" && (
                      <>
                        <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-r border-slate-100/50">
                          Frais Prestation
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold text-indigo-600 uppercase tracking-wide border-r border-slate-200 bg-indigo-50/30">
                          Total Expédition
                        </th>
                        <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-r border-slate-100/50 text-center">
                          Statut
                        </th>
                      </>
                    )}
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData?.map((tarif, index) => {
                    const montantBase = tarif.montant_base || 0;
                    const pourcentage = tarif.pourcentage_prestation || 0;
                    const montantPrestation = Math.round(montantBase * pourcentage / 100);
                    const total = activeTab === "agency" ? (tarif.montant_expedition || 0) : (montantBase + montantPrestation);

                    return (
                      <tr key={`${activeTab}-tarif-${tarif.id || index}`} className="hover:bg-slate-50/80 transition-all duration-200 group">
                        <td className="px-6 py-4 border-r border-slate-100/30">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex w-fit items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${typeBadgeClasses(tarif.type_expedition)}`}>
                              {tarif.type_expedition?.replace('groupage_', '').replace('_', ' ').toUpperCase() || 'N/A'}
                            </span>
                            {tarif.mode && (
                              <span className="text-[11px] font-medium text-slate-500">
                                {tarif.mode?.toUpperCase()} {tarif.ligne ? `→ ${tarif.ligne.toUpperCase()}` : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100/30">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-900">{tarif.category?.nom || 'N/A'}</span>
                            <span className="text-[9px] font-medium text-slate-400">{tarif.pays || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-100/30 font-medium text-slate-600 text-sm">
                          {montantBase.toLocaleString()} FCFA
                        </td>
                        {activeTab === "agency" && (
                          <>
                            <td className="px-6 py-4 border-r border-slate-100/30">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-indigo-600">+{pourcentage}%</span>
                                <span className="text-[10px] text-slate-400 font-medium">{montantPrestation.toLocaleString()} FCFA</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 border-r border-slate-200 bg-indigo-50/10 group-hover:bg-indigo-50/40 transition-colors">
                              <span className="text-sm font-bold text-slate-950">
                                {total.toLocaleString()} FCFA
                              </span>
                            </td>
                            <td className="px-6 py-4 border-r border-slate-100/30 text-center">
                              <StatusToggle
                                active={tarif.actif}
                                onClick={() => !isAgent && handleToggleStatus(tarif)}
                                disabled={isAgent}
                              />
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {activeTab === "agency" && !isAgent && (
                              <>
                                <button
                                  onClick={() => handleEditTarif(tarif)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-indigo-100 transition-all shadow-none hover:shadow-sm"
                                  title="Modifier ce tarif"
                                >
                                  <PencilSquareIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTarif(tarif)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-rose-100 transition-all shadow-none hover:shadow-sm"
                                  title="Supprimer ce tarif"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {activeTab === "base" && !isAgent && (
                              <button
                                onClick={() => handleNewTarif(tarif)}
                                className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
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

            {/* Mobile View - Enhanced Card List */}
            <div className="lg:hidden divide-y divide-slate-100">
              {currentData?.map((tarif, index) => {
                const montantBase = tarif.montant_base || 0;
                const pourcentage = tarif.pourcentage_prestation || 0;
                const montantPrestation = Math.round(montantBase * pourcentage / 100);
                const total = activeTab === "agency" ? (tarif.montant_expedition || 0) : (montantBase + montantPrestation);

                return (
                  <div key={`${activeTab}-mobile-${tarif.id || index}`} className="p-4 space-y-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${typeBadgeClasses(tarif.type_expedition)}`}>
                            {tarif.type_expedition?.replace('groupage_', '').replace('_', ' ').toUpperCase() || 'N/A'}
                          </span>
                          <p className="text-[13px] font-bold text-slate-900">{tarif.category?.nom || 'N/A'}</p>
                          <span className="text-[9px] font-medium text-slate-400">{tarif.pays || 'N/A'}</span>
                          {tarif.mode && (
                            <span className="text-[11px] font-medium text-slate-500">
                              {tarif.mode?.toUpperCase()} {tarif.ligne ? `→ ${tarif.ligne.toUpperCase()}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      {activeTab === "agency" ? (
                        <div className="flex items-center gap-1.5">
                          {!isAgent && (
                            <>
                              <button onClick={() => handleEditTarif(tarif)} className="p-2 bg-white text-indigo-600 rounded-lg border border-slate-200 active:scale-95 shadow-sm">
                                <PencilSquareIcon className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDeleteTarif(tarif)} className="p-2 bg-white text-rose-600 rounded-lg border border-slate-200 active:scale-95 shadow-sm">
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        !isAgent && (
                          <button
                            onClick={() => handleNewTarif(tarif)}
                            className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-sm active:scale-95"
                          >
                            Configurer
                          </button>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Base</p>
                        <p className="text-xs font-bold text-slate-900">{montantBase.toLocaleString()} FCFA</p>
                      </div>
                      {activeTab === "agency" && (
                        <>
                          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Prestation</p>
                            <p className="text-xs font-bold text-indigo-700">+{pourcentage}%</p>
                          </div>
                          <div className="col-span-2 p-3 bg-indigo-600 rounded-xl flex items-center justify-between shadow-sm">
                            <p className="text-[10px] font-semibold text-indigo-100 uppercase tracking-wide">Total Expédition</p>
                            <p className="text-base font-bold text-white">{total.toLocaleString()} FCFA</p>
                          </div>
                          <div className="col-span-2 flex items-center justify-between pt-1">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Statut</span>
                            <StatusToggle
                              active={tarif.actif}
                              onClick={() => !isAgent && handleToggleStatus(tarif)}
                              disabled={isAgent}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {(!loading && currentData?.length === 0) && (
              <div className="p-16 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-300 shadow-inner">
                  <DocumentDuplicateIcon className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Aucun tarif groupage trouvé</h3>
                <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
                  {isAgent
                    ? "Aucun tarif groupage n'est configuré pour le moment."
                    : "Vous n'avez pas encore configuré de tarifs pour les expéditions en groupage."}
                </p>
                {!isAgent && (
                  <button
                    onClick={() => handleNewTarif()}
                    className="inline-flex items-center px-8 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-indigo-200 transition-all hover:-translate-y-1 active:translate-y-0"
                  >
                    Ajouter un tarif groupage
                  </button>
                )}
              </div>
            )}
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

export default TarifGroupageComponent;
