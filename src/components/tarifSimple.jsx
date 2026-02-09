import React, { useState, useEffect, useCallback, useMemo } from "react";
import SaveTarifModal from "../components/SaveTarifModal";

import { formatPrice } from "../utils/format";
import { useTarifs } from "../hooks/useTarifs";
import {
  PlusIcon,
  CircleStackIcon,
  GlobeAltIcon,
  ScaleIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import SingleInitializeModal from "../components/SingleInitializeModal";


const TableSkeleton = () => (
  <div className="divide-y divide-slate-100">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="px-6 py-4 flex items-center space-x-4 animate-pulse">
        <div className="h-4 w-12 bg-slate-100 rounded"></div>
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


const TarifSimpleComponent = () => {
  const {
    loading,
    error,
    message,
    tarifs: baseTarifs,
    flatTarifs,
    existingTarifs,
    flatExistingTarifs,
    selectedIndex,
    editingZones,
    isSaving,
    fetchAgencyTarifs,
    fetchTarifs,
    saveTarif,
    selectIndex,
    updateZonePercentage,
    updateNewTarifZones,
    getCurrentTarif,
    updateSingleTarifZone,
    clearMessage,
    deleteTarifSimple,
    toggleTarifSimpleStatus,
  } = useTarifs();

  const [showIndexModal, setShowIndexModal] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showEditSingleModal, setShowEditSingleModal] = useState(false);
  const [selectedBaseTarif, setSelectedBaseTarif] = useState(null);
  const [selectedAgencyTarif, setSelectedAgencyTarif] = useState(null);
  const [activeTab, setActiveTab] = useState("agency");


  useEffect(() => {
    fetchTarifs();
    fetchAgencyTarifs();
  }, [fetchTarifs, fetchAgencyTarifs]);



  const handleZoneChange = useCallback((zoneId, value) => {
    const pourcentage = parseFloat(value) || 0;
    if (selectedIndex === "new") {
      updateNewTarifZones(zoneId, pourcentage); // Simplified if needed, but keeping logic for creation
    } else {
      updateZonePercentage(zoneId, pourcentage);
    }
  }, [selectedIndex, updateZonePercentage]);


  const handleSave = useCallback(async (index, zones) => {
    try {
      const payload = (index && zones) ? { indice: index, prix_zones: zones } : undefined;
      const result = await saveTarif(payload);
      if (result?.success) {
        await fetchAgencyTarifs(true);
        setShowIndexModal(false);
        return result;
      }
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      throw err;
    }
  }, [saveTarif, fetchAgencyTarifs]);


  const handleSaveZone = useCallback(async (zoneId, percentage) => {
    try {
      if (!zoneId) return;
      await updateSingleTarifZone(zoneId, percentage);
    } catch (err) {
      console.error("Erreur sauvegarde zone:", err);
    }
  }, [updateSingleTarifZone]);

  const handleNewTarif = useCallback(() => {
    selectIndex("new");
    setShowIndexModal(true);
  }, [selectIndex]);

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        fetchTarifs(true),
        fetchAgencyTarifs(true)
      ]);
    } catch (error) {
      console.error("Erreur refresh:", error);
    }
  }, [fetchTarifs, fetchAgencyTarifs]);

  const handleIndexSelect = useCallback((index) => {
    try {
      selectIndex(index);
      setShowIndexModal(false);
    } catch (error) {
      console.error("Error selecting tarif:", error);
      setShowIndexModal(false);
    }
  }, [selectIndex]);

  const handleZoneUpdate = useCallback((updatedZones) => {
    if (selectedIndex === "new") {
      updateNewTarifZones(updatedZones);
    } else {
      updatedZones.forEach((zone) => {
        updateZonePercentage(zone.zone_destination_id, zone.pourcentage_prestation);
      });
    }
  }, [selectedIndex, updateNewTarifZones, updateZonePercentage]);


  const handleDelete = useCallback(async (tarif) => {
    const label = tarif.zone?.nom || `Indice ${tarif.indice} - Zone ${tarif.zone_destination_id}`;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le tarif pour ${label} ? Cette action est irréversible.`)) {
      return;
    }
    try {
      if (tarif.id) {
        await deleteTarifSimple(tarif.id);
        await fetchAgencyTarifs(true);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      await fetchAgencyTarifs(true);
    }
  }, [deleteTarifSimple, fetchAgencyTarifs]);

  const handleStatus = useCallback(async (tarif) => {
    try {
      if (tarif.id) {
        await toggleTarifSimpleStatus(tarif.id);
        fetchAgencyTarifs(true);
      }
    } catch (error) {
      console.error("Erreur statut:", error);
      await fetchAgencyTarifs(true);
    }
  }, [toggleTarifSimpleStatus, fetchAgencyTarifs]);

  const handleInitializeSingle = useCallback((tarif) => {
    setSelectedBaseTarif(tarif);
    setShowSingleModal(true);
  }, []);

  const handleConfirmSingle = useCallback(async (percentage) => {
    if (!selectedBaseTarif) return;

    try {
      const result = await saveTarif({
        indice: selectedBaseTarif.indice,
        prix_zones: [{
          tarif_simple_id: selectedBaseTarif.id,
          pourcentage_prestation: percentage
        }]
      });

      if (result?.success) {
        await fetchAgencyTarifs(true);
        setShowSingleModal(false);
        setSelectedBaseTarif(null);
        setActiveTab("agency");
      }
    } catch (err) {
      console.error("Erreur initialisation individuelle:", err);
    }
  }, [selectedBaseTarif, saveTarif, fetchAgencyTarifs]);

  const handleEditSingle = useCallback((tarif) => {
    setSelectedAgencyTarif(tarif);
    setShowEditSingleModal(true);
  }, []);

  const handleConfirmEditSingle = useCallback(async (percentage) => {
    if (!selectedAgencyTarif) return;

    try {
      const result = await updateSingleTarifZone(selectedAgencyTarif.id, percentage);
      if (result?.success || result) {
        await fetchAgencyTarifs(true);
        setShowEditSingleModal(false);
        setSelectedAgencyTarif(null);
      }
    } catch (err) {
      console.error("Erreur modification individuelle:", err);
    }
  }, [selectedAgencyTarif, updateSingleTarifZone, fetchAgencyTarifs]);




  const currentData = activeTab === "agency" ? flatExistingTarifs : flatTarifs;

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
              Mes Tarifs Actifs
            </button>
            <button
              onClick={() => setActiveTab("base")}
              className={`flex-1 sm:flex-none px-6 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === "base" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Tous les Modèles
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

        <button
          onClick={handleNewTarif}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm group active:scale-95"
        >
          <PlusIcon className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" />
          Nouveau Tarif par Indice
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg border text-[11px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${message.includes("succès") ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${message.includes("succès") ? "bg-emerald-500" : "bg-rose-500"}`}></div>
          {message}
        </div>
      )}

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
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100/50">
                      Indice
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100/50">
                      Destination
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100/50">
                      Montant de Base
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100/50">
                      Frais Prestation
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-indigo-600 uppercase tracking-widest border-r border-slate-200 bg-indigo-50/30">
                      Total Expédition
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100/50 text-center">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData?.map((tarif) => (
                    <tr key={tarif.id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                      <td className="px-6 py-4 border-r border-slate-100/30">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-900 text-white text-[11px] font-bold leading-none">
                          {tarif.indice}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-100/30">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-900">{tarif.zone?.nom || tarif.nom_zone}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{tarif.zone_destination_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-100/30 font-medium text-slate-600 text-sm">
                        {formatPrice(tarif.montant_base, "XOF")}
                      </td>
                      <td className="px-6 py-4 border-r border-slate-100/30">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-600">+{tarif.pourcentage_prestation}%</span>
                          <span className="text-[10px] text-slate-400 font-medium">{formatPrice(tarif.montant_prestation, "XOF")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-200 bg-indigo-50/10 group-hover:bg-indigo-50/40 transition-colors">
                        <span className="text-sm font-bold text-slate-950">
                          {formatPrice(tarif.montant_expedition, "XOF")}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-100/30 text-center">
                        <StatusToggle
                          active={tarif.actif}
                          onClick={() => activeTab === "agency" && handleStatus(tarif)}
                          disabled={activeTab === "base"}
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {activeTab === "agency" && (
                            <>
                              <button
                                onClick={() => handleEditSingle(tarif)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-indigo-100 transition-all shadow-none hover:shadow-sm"
                                title="Modifier ce tarif"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(tarif)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-rose-100 transition-all shadow-none hover:shadow-sm"
                                title="Supprimer ce tarif"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}


                          {activeTab === "base" && (
                            <button
                              onClick={() => handleInitializeSingle(tarif)}
                              className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
                            >
                              Initialiser
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Enhanced Card List */}
            <div className="lg:hidden divide-y divide-slate-100">
              {currentData?.map((tarif) => (
                <div key={tarif.id} className="p-4 space-y-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {tarif.indice}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Indice</span>
                          <StatusToggle
                            active={tarif.actif}
                            onClick={() => activeTab === "agency" && handleStatus(tarif)}
                            disabled={activeTab === "base"}
                          />
                        </div>

                        <p className="text-[13px] font-bold text-slate-900">{tarif.zone?.nom || tarif.nom_zone}</p>
                      </div>
                    </div>
                    {activeTab === "agency" ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEditSingle(tarif)} className="p-2 bg-white text-indigo-600 rounded-lg border border-slate-200 active:scale-95 shadow-sm">
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(tarif)} className="p-2 bg-white text-rose-600 rounded-lg border border-slate-200 active:scale-95 shadow-sm">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (


                      <button
                        onClick={() => handleInitializeSingle(tarif)}
                        className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-sm active:scale-95"
                      >
                        Initialiser
                      </button>
                    )}

                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Base</p>
                      <p className="text-xs font-bold text-slate-900">{formatPrice(tarif.montant_base, "XOF")}</p>
                    </div>
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Prestation</p>
                      <p className="text-xs font-bold text-indigo-700">+{tarif.pourcentage_prestation}%</p>
                    </div>
                    <div className="col-span-2 p-3 bg-indigo-600 rounded-xl flex items-center justify-between shadow-sm">
                      <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Total Expédition</p>
                      <p className="text-base font-bold text-white">{formatPrice(tarif.montant_expedition, "XOF")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(!loading && currentData?.length === 0) && (
              <div className="p-16 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-300 shadow-inner">
                  <DocumentDuplicateIcon className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Aucun tarif trouvé</h3>
                <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">Vous n'avez pas encore configuré de tarifs pour cette catégorie.</p>
                <button
                  onClick={handleNewTarif}
                  className="inline-flex items-center px-8 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-indigo-200 transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  Démarrer la configuration
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <SaveTarifModal
        isOpen={showIndexModal}
        onClose={() => { setShowIndexModal(false); clearMessage(); }}
        onSave={handleSave}
        isSaving={isSaving}
        selectedIndex={selectedIndex}
        onIndexSelect={handleIndexSelect}
        onZoneUpdate={handleZoneUpdate}
      />



      <SingleInitializeModal
        isOpen={showSingleModal}
        onClose={() => {
          setShowSingleModal(false);
          setSelectedBaseTarif(null);
        }}
        tarif={selectedBaseTarif}
        onConfirm={handleConfirmSingle}
        loading={isSaving}
      />

      <SingleInitializeModal
        isOpen={showEditSingleModal}
        onClose={() => {
          setShowEditSingleModal(false);
          setSelectedAgencyTarif(null);
        }}
        tarif={selectedAgencyTarif}
        onConfirm={handleConfirmEditSingle}
        loading={isSaving}
        title="Modification Rapide"
        subtitle="Mise à jour d'un tarif individuel"
        initialPercentage={selectedAgencyTarif?.pourcentage_prestation || 0}
      />
    </div>


  );
}

export default TarifSimpleComponent;
