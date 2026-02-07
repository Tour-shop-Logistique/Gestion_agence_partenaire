import React, { useState, useEffect, useCallback, useMemo } from "react";
import SaveTarifModal from "../components/SaveTarifModal";
import TarifConfigModal from "../components/TarifConfigModal";
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
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const TarifSimpleComponent = () => {


  const {
    loading,
    error,
    message,
    tarifs: baseTarifs,
    existingTarifs,
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

  const [showTarifForm, setShowTarifForm] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [localZones, setLocalZones] = useState([]);
  const [activeTab, setActiveTab] = useState("agency"); // Default to agency for B2B tools

  // Récupérer les données du tarif actuel
  const currentTarifData = useMemo(() => {
    return getCurrentTarif();
  }, [getCurrentTarif]);

  // Charger les tarifs de base au montage du composant
  useEffect(() => {
    fetchTarifs();
    // fetchAgencyTarifs();
  }, [fetchTarifs]);

  useEffect(() => {
    fetchAgencyTarifs();
  }, [fetchAgencyTarifs]);

  // Mettre à jour les zones locales lorsque les zones d'édition ou le tarif sélectionné change
  useEffect(() => {
    if (selectedIndex && existingTarifs.length > 0) {
      const selectedTarif = existingTarifs.find(
        (t) => String(t.indice) === String(selectedIndex)
      );
      if (selectedTarif?.prix_zones) {
        setLocalZones([...selectedTarif.prix_zones]);
      }
    } else if (editingZones && editingZones.length > 0) {
      setLocalZones([...editingZones]);
    }
  }, [editingZones, selectedIndex, existingTarifs]);

  const handleZoneChange = useCallback(
    (zoneId, value) => {
      const pourcentage = parseFloat(value) || 0;

      // Mettre à jour les zones locales
      const updatedZones = localZones.map((zone) => {
        if (zone.zone_destination_id === zoneId) {
          const montantBase = parseFloat(zone.montant_base) || 0;
          const montantPrestation = (montantBase * pourcentage) / 100;

          return {
            ...zone,
            pourcentage_prestation: pourcentage,
            montant_prestation: parseFloat(montantPrestation.toFixed(2)),
            montant_expedition: parseFloat(
              (montantBase + montantPrestation).toFixed(2)
            ),
          };
        }
        return zone;
      });

      setLocalZones(updatedZones);

      // Si c'est un nouveau tarif, mettre à jour le contexte
      if (selectedIndex === "new") {
        updateNewTarifZones(updatedZones);
      } else {
        // Pour un tarif existant, mettre à jour le contexte
        updateZonePercentage(zoneId, pourcentage);
      }
    },
    [localZones, selectedIndex, updateNewTarifZones, updateZonePercentage]
  );

  const handleSave = useCallback(async (index, zones) => {
    console.log("handleSave called with:", index, zones);
    try {
      // Utiliser les paramètres explicites s'ils sont fournis (cas du SaveTarifModal)
      // sinon le thunk utilisera le state (cas du TarifConfigModal)
      const payload = (index && zones) ? { indice: index, prix_zones: zones } : undefined;
      const result = await saveTarif(payload);
      console.log("Save result:", result);
      if (result?.success) {
        // Le reducer met à jour le state localement, pas besoin de recharger toute la liste
        // await fetchAgencyTarifs(true);
        // Fermer les deux modales possibles
        setShowIndexModal(false);
        setShowTarifForm(false);
        return result;
      }
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      throw err;
    }
  }, [saveTarif]);

  const handleSaveZone = useCallback(async (zoneId, percentage) => {
    try {
      if (!zoneId) {
        console.error("Zone ID missing");
        return;
      }
      const result = await updateSingleTarifZone(zoneId, percentage);
      /* 
      if (result?.success) {
        // Refresh potentially needed, but reducers should handle local state update
        // await fetchAgencyTarifs(true);
      } 
      */
    } catch (err) {
      console.error("Erreur sauvegarde zone:", err);
    }
  }, [updateSingleTarifZone]);

  const handleNewTarif = useCallback(() => {
    selectIndex("new");
    setShowIndexModal(true);
  }, [selectIndex]);

  const handleIndexSelect = useCallback(
    (index) => {
      try {
        // Call selectIndex to update the context state with the selected tarif
        selectIndex(index);

        // Find the selected tarif in existingTarifs
        const selectedTarif = existingTarifs.find((t) => String(t.indice) === String(index));

        // If we found the tarif, update local zones
        if (selectedTarif && selectedTarif.prix_zones) {
          setLocalZones([...selectedTarif.prix_zones]);
        }

        // Show the tarif form and close the modal
        setShowTarifForm(true);
        setShowIndexModal(false);
      } catch (error) {
        console.error("Error selecting tarif:", error);
        // Still close the modal even if there was an error
        setShowIndexModal(false);
      }
    },
    [selectIndex, existingTarifs]
  );

  const handleZoneUpdate = useCallback(
    (updatedZones) => {
      setLocalZones(updatedZones);

      if (selectedIndex === "new") {
        updateNewTarifZones(updatedZones);
      } else {
        updatedZones.forEach((zone) => {
          updateZonePercentage(
            zone.zone_destination_id,
            zone.pourcentage_prestation
          );
        });
      }
    },
    [selectedIndex, updateNewTarifZones, updateZonePercentage]
  );

  const handleDelete = useCallback(async (tarif) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le tarif pour l'indice ${tarif.indice} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      // Optimistic update: on n'attend pas le rechargement pour mettre à jour l'UI si possible
      // Mais ici deleteTarifSimple est un thunk qui peut être géré par Redux pour l'UI optimiste
      // Cependant, pour garantir une UX fluide, on supprime et on recharge silencieusement

      if (tarif.prix_zones && tarif.prix_zones.length > 0) {
        const promises = tarif.prix_zones.map(zone => deleteTarifSimple(zone.id));
        await Promise.all(promises);

        // On recharge les données pour être sûr, mais l'utilisateur verra potentiellement un état intermédiaire géré par Redux
        // Si les reducers gèrent bien la suppression locale, l'UI se mettra à jour immédiatement
        await fetchAgencyTarifs(true);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      // En cas d'erreur, on recharge pour remettre l'état correct
      await fetchAgencyTarifs(true);
    }
  }, [deleteTarifSimple, fetchAgencyTarifs]);

  const handleStatus = useCallback(async (tarif) => {
    try {
      if (tarif.prix_zones && tarif.prix_zones.length > 0) {
        // Appliquer optimisme ici si nécessaire manuellement via Redux, 
        // mais le thunk update déjà le state local au fulfilled.

        const promises = tarif.prix_zones.map(zone => toggleTarifSimpleStatus(zone.id));
        await Promise.all(promises);

        // Pas besoin de recharger toutes les données si le Reducer fait bien son travail
        // On peut faire un fetch silencieux en arrière plan si on veut être puriste
        fetchAgencyTarifs(true);
      }
    } catch (error) {
      console.error("Erreur statut:", error);
      // Revert if error
      await fetchAgencyTarifs(true);
    }
  }, [toggleTarifSimpleStatus, fetchAgencyTarifs]);

  const kpis = [
    { label: "Tarifs Agence", value: existingTarifs?.length || 0, icon: CircleStackIcon, color: "text-indigo-600" },
    { label: "Modèles de Base", value: baseTarifs?.length || 0, icon: GlobeAltIcon, color: "text-slate-600" },
    { label: "Indices actifs", value: [...new Set([...(existingTarifs || []), ...(baseTarifs || [])].map(t => t.indice))].length, icon: ScaleIcon, color: "text-blue-600" },
  ];

  const fixedZones = Array.from({ length: 8 }, (_, i) => `Z${i + 1}`);


  return (

    <div className="space-y-6">
      {/* KPI Section - SaaS Style */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-slate-50 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Action Bar - Stacked on small screens */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm gap-3">
        <div className="inline-flex w-full sm:w-auto p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab("agency")}
            className={`flex-1 sm:flex-none px-4 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === "agency" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
          >
            Mes Tarifs
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
          onClick={handleNewTarif}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau Tarif
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border text-xs font-bold flex items-center gap-2 ${message.includes("succès") ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${message.includes("succès") ? "bg-emerald-500" : "bg-rose-500"}`}></div>
          {message}
        </div>
      )}

      {/* Data Grid Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-4">
            <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse"></div>)}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table (Hidden on small devices) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50 sticky left-0 z-10 border-r border-slate-200">
                      Indice
                    </th>
                    {fixedZones.map((z) => (
                      <th key={z} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center border-r border-slate-100 last:border-r-0">
                        {z.replace(/Z/i, 'Zone ')}
                      </th>
                    ))}
                    {activeTab === "agency" && (
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeTab === "agency" ? existingTarifs : baseTarifs)?.map((tarif) => (
                    <tr key={tarif.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4 bg-white group-hover:bg-indigo-50/30 sticky left-0 z-10 border-r border-slate-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                          <span className="font-bold text-slate-900">{tarif.indice}</span>
                        </div>
                      </td>
                      {fixedZones.map((zoneId) => {
                        const zoneData = tarif.prix_zones?.find(z => z.zone_destination_id?.toUpperCase() === zoneId);
                        return (
                          <td key={zoneId} className="px-6 py-4 text-center border-r border-slate-50 last:border-r-0">
                            {zoneData ? (
                              <div className="space-y-0.5">
                                <div className="text-[13px] font-bold text-slate-900">
                                  {formatPrice(zoneData.montant_expedition, "XOF")}
                                </div>
                                <div className="text-[10px] font-medium text-slate-400">
                                  Base: {formatPrice(zoneData.montant_base, "XOF")}
                                </div>
                                <div className="text-[10px] font-bold text-indigo-600">
                                  +{zoneData.pourcentage_prestation}%
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-200 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                      {activeTab === "agency" && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleStatus(tarif)}
                                className={`p-1 rounded transition-all ${tarif.actif
                                  ? "text-emerald-600 hover:bg-emerald-50"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-slate-50"
                                  }`}
                                title={tarif.actif ? "Désactiver" : "Activer"}
                              >
                                {tarif.actif ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleIndexSelect(tarif.indice)}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                                title="Modifier"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(tarif)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                title="Supprimer"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (Detailed & Optimized) */}
            <div className="lg:hidden divide-y divide-slate-100">
              {(activeTab === "agency" ? existingTarifs : baseTarifs)?.map((tarif) => (
                <div key={tarif.id} className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-sm ring-4 ring-slate-50">
                        {tarif.indice}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Indice</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${tarif.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {tarif.actif ? 'ACTIF' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">Config. Tarifaire</p>
                      </div>
                    </div>
                    {activeTab === "agency" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatus(tarif)}
                          className={`p-2 rounded-lg border ${tarif.actif
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}
                        >
                          {tarif.actif ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleIndexSelect(tarif.indice)}
                          className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tarif)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-200"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Zone Details - Balanced Grid */}
                  <div className="grid grid-cols-2 gap-3 pb-2">
                    {tarif.prix_zones?.slice(0, 8).map((zone, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between h-16">
                        <div className="flex justify-between items-start">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Zone {zone.zone_destination_id.replace(/Z/i, '')}
                          </p>
                          <span className="text-[8px] font-bold text-indigo-500 bg-white px-1 rounded shadow-sm">+{zone.pourcentage_prestation}%</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 font-mono">
                          {formatPrice(zone.montant_expedition, "XOF")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {(!loading && (activeTab === "agency" ? existingTarifs : baseTarifs)?.length === 0) && (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-300">
                  <DocumentDuplicateIcon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Aucun tarif configuré</h3>
                <p className="text-xs text-slate-500 mb-6">Commencez par initialiser vos tarifs agence depuis les modèles.</p>
                <button
                  onClick={handleNewTarif}
                  className="inline-flex items-center px-4 py-2 bg-slate-950 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Ajouter maintenant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Formulaire de configuration des tarifs */}
      <TarifConfigModal
        isOpen={showTarifForm}
        onClose={() => {
          setShowTarifForm(false);
          clearMessage();
        }}
        selectedIndex={selectedIndex}
        editingZones={editingZones}
        loading={loading}
        onZoneChange={handleZoneChange}
        onSave={handleSave}
        onSaveZone={handleSaveZone}
        isSaving={isSaving}
      />

      <SaveTarifModal
        isOpen={showIndexModal}
        onClose={() => {
          setShowIndexModal(false);
          clearMessage();
        }}
        onSave={handleSave}
        isSaving={isSaving}
        selectedIndex={selectedIndex}
        onIndexSelect={handleIndexSelect}
        zones={localZones}
        onZoneUpdate={handleZoneUpdate}
      />
    </div>

  )
}
export default TarifSimpleComponent;