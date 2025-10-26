import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SaveTarifModal from "../components/SaveTarifModal";
import TarifConfigModal from "../components/TarifConfigModal";
import { formatPrice } from "../utils/format";
import { useTarifs } from "../hooks/useTarifs";

const Tarifs = () => {
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
  } = useTarifs();

  const [showTarifForm, setShowTarifForm] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [localZones, setLocalZones] = useState([]);
  const [activeTab, setActiveTab] = useState("base");

  // Récupérer les données du tarif actuel
  const currentTarifData = useMemo(() => {
    return getCurrentTarif();
  }, [getCurrentTarif]);

  // Charger les tarifs de base au montage du composant
  useEffect(() => {
    fetchTarifs();
    fetchAgencyTarifs();
  }, [fetchTarifs, fetchAgencyTarifs]);

  // Mettre à jour les zones locales lorsque les zones d'édition ou le tarif sélectionné change
  useEffect(() => {
    if (selectedIndex && existingTarifs.length > 0) {
      const selectedTarif = existingTarifs.find(
        (t) => t.indice === selectedIndex
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

  const handleSave = useCallback(async () => {
    try {
      // Appeler la fonction de sauvegarde du contexte
      const result = await saveTarif();

      if (result?.success) {
        // Recharger les tarifs après la sauvegarde
        await fetchAgencyTarifs(true);

        // Fermer le modal après un court délai pour montrer le message de succès
        setTimeout(() => {
          setShowIndexModal(false);
        }, 1000);

        return result;
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du tarif:", err);
      throw err;
    }
  }, [saveTarif, fetchAgencyTarifs]);

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
        const selectedTarif = existingTarifs.find((t) => t.indice === index);

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

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Gestion des tarifs
            </h1>
            <p className="text-gray-600 mt-1 text-md">
              Configurez les tarifs d'expédition pour votre agence
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleNewTarif}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Ajouter un tarif
            </button>
          </div>
        </div>
      </div>

      {/* Section statistiques améliorée - mobile-first */}
      {(baseTarifs && baseTarifs.length > 0) ||
        (existingTarifs && existingTarifs.length > 0 && (
          <div className="mb-6 sm:mb-8">
            {/* Résumé rapide - responsive */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm sm:text-md text-gray-600 font-medium">
                      Tarifs agence: {existingTarifs?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm sm:text-md text-gray-600 font-medium">
                      Tarifs de base: {baseTarifs?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm sm:text-md text-gray-600 font-medium">
                      Total:{" "}
                      {(baseTarifs?.length || 0) +
                        (existingTarifs?.length || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("succès")
              ? "bg-green-50 border border-green-200 text-green-600"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Onglets pour séparer les tarifs de base et de l'agence */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("agency")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "agency"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tarifs agence ({existingTarifs?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("base")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "base"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tarifs de base ({baseTarifs?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Liste des tarifs - Design responsive : lignes sur desktop, cards sur mobile */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "base" && baseTarifs && baseTarifs.length > 0 ? (
          <>
            <div className="hidden lg:block">
              {(() => {
                // Créer les 8 zones fixes (Z1 à Z8)
                const fixedZones = Array.from(
                  { length: 8 },
                  (_, i) => `z${i + 1}`
                );
                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Indice
                          </th>
                          {fixedZones.map((zoneId) => (
                            <th
                              key={zoneId}
                              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Zone {zoneId.replace("z", "")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Tarifs de base */}
                        {baseTarifs &&
                          baseTarifs.map((tarif) => (
                            <tr
                              key={`base-${tarif.id}`}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center">
                                  Indice {tarif.indice || "N/A"}
                                </div>
                              </td>
                              {fixedZones.map((zoneId) => {
                                const zoneData = tarif.prix_zones?.find(
                                  (z) =>
                                    z.zone_destination_id ===
                                    zoneId.toUpperCase()
                                );
                                return (
                                  <td
                                    key={zoneId}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                  >
                                    {zoneData ? (
                                      <div className="space-y-1">
                                        <div className="text-sm font-semibold text-gray-900">
                                          {formatPrice(
                                            zoneData.montant_expedition || 0,
                                            "XOF"
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          Prix de base :{" "}
                                          {formatPrice(
                                            zoneData.montant_base || 0,
                                            "XOF"
                                          )}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                          +
                                          {formatPrice(
                                            zoneData.montant_prestation || 0,
                                            "XOF"
                                          )}{" "}
                                          (
                                          {zoneData.pourcentage_prestation || 0}
                                          %)
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
            <div className="lg:hidden divide-y divide-gray-100">
              {/* Tarifs de base */}
              {baseTarifs &&
                baseTarifs.map((tarif) => (
                  <div
                    key={`base-mobile-${tarif.id}`}
                    className="group p-4 hover:bg-gray-50/50 transition-all duration-200 active:bg-gray-100/50"
                  >
                    {/* Design mobile : Layout vertical optimisé */}
                    <div className="flex items-start justify-between space-x-3">
                      {/* Section informations principales */}
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* Avatar avec type */}
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            📋
                          </div>
                          {/* Badge de type */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-md bg-blue-500">
                            <div className="w-full h-full rounded-full flex items-center justify-center bg-blue-400">
                              <span className="text-xs text-white font-bold">
                                B
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Informations détaillées */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Nom et type */}
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900 truncate pr-2">
                              Indice {tarif.indice || "N/A"}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Tarif de base
                            </span>
                          </div>

                          {/* Prix par zones */}
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                              />
                            </svg>
                            <div className="flex flex-wrap gap-1">
                              {tarif.prix_zones &&
                                tarif.prix_zones
                                  .slice(0, 2)
                                  .map((zone, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                                    >
                                      Z
                                      {zone.zone_destination_id.replace(
                                        "z",
                                        ""
                                      )}
                                      :{" "}
                                      {formatPrice(
                                        zone.montant_expedition || 0,
                                        "XOF"
                                      )}
                                    </span>
                                  ))}
                              {tarif.prix_zones &&
                                tarif.prix_zones.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600">
                                    +{tarif.prix_zones.length - 2}
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Date de création */}
                          <div className="flex items-center text-xs text-gray-500">
                            <svg
                              className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>
                              Créé le{" "}
                              {tarif.created_at
                                ? new Date(tarif.created_at).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions - Design mobile compact */}
                      <div className="flex flex-col items-end space-y-2">
                        {/* Boutons d'action - Plus accessibles */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleIndexSelect(tarif.indice)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95"
                            title="Configurer le tarif"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : activeTab === "agency" &&
          existingTarifs &&
          existingTarifs.length > 0 ? (
          <>
            <div className="hidden lg:block">
              {(() => {
                const fixedZones = Array.from(
                  { length: 8 },
                  (_, i) => `z${i + 1}`
                );

                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Indice
                          </th>
                          {fixedZones.map((zoneId) => (
                            <th
                              key={zoneId}
                              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Zone {zoneId.replace("z", "")}
                            </th>
                          ))}
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {existingTarifs.map((tarif) => (
                          <tr
                            key={`agency-${tarif.id}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                Indice {tarif.indice || "N/A"}
                              </div>
                            </td>
                            {fixedZones.map((zoneId) => {
                              const zoneData = tarif.prix_zones?.find(
                                (z) =>
                                  z.zone_destination_id === zoneId.toUpperCase()
                              );
                              return (
                                <td
                                  key={zoneId}
                                  className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                  {zoneData ? (
                                    <div className="space-y-1">
                                      <div className="text-sm font-semibold text-gray-900">
                                        {formatPrice(
                                          zoneData.montant_expedition || 0,
                                          "XOF"
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        Prix de base :{" "}
                                        {formatPrice(
                                          zoneData.montant_base || 0,
                                          "XOF"
                                        )}
                                      </div>
                                      <div className="text-xs text-orange-600">
                                        +
                                        {formatPrice(
                                          zoneData.montant_prestation || 0,
                                          "XOF"
                                        )}{" "}
                                        ({zoneData.pourcentage_prestation || 0}
                                        %)
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() =>
                                    handleIndexSelect(tarif.indice)
                                  }
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95"
                                  title="Configurer le tarif"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50"
                                  title="Supprimer le tarif"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
            <div className="lg:hidden divide-y divide-gray-100">
              {existingTarifs.map((tarif) => (
                <div
                  key={`agency-mobile-${tarif.id}`}
                  className="group p-4 hover:bg-gray-50/50 transition-all duration-200 active:bg-gray-100/50"
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {tarif.indice || "T"}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-md ${
                            tarif.actif ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <div
                            className={`w-full h-full rounded-full flex items-center justify-center ${
                              tarif.actif ? "bg-green-400" : "bg-red-400"
                            }`}
                          >
                            {tarif.actif ? (
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-gray-900 truncate pr-2">
                            Indice {tarif.indice || "N/A"}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              tarif.actif
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {tarif.actif ? "Actif" : "Inactif"}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          <div className="flex flex-wrap gap-1">
                            {tarif.prix_zones &&
                              tarif.prix_zones
                                .slice(0, 2)
                                .map((zone, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                                  >
                                    Z{zone.zone_destination_id.replace("z", "")}
                                    :{" "}
                                    {formatPrice(
                                      zone.montant_expedition || 0,
                                      "XOF"
                                    )}
                                  </span>
                                ))}
                            {tarif.prix_zones &&
                              tarif.prix_zones.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600">
                                  +{tarif.prix_zones.length - 2}
                                </span>
                              )}
                          </div>
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <svg
                            className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            Créé le{" "}
                            {tarif.created_at
                              ? new Date(tarif.created_at).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleIndexSelect(tarif.indice)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95"
                          title="Modifier le tarif"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50"
                          title="Supprimer le tarif"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Aucun tarif configuré
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Commencez par créer votre premier tarif d'expédition pour
              commencer à gérer vos prix.
            </p>
            <button
              onClick={handleNewTarif}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Créer le premier tarif
            </button>
          </div>
        )}
      </div>

      {/* Formulaire de configuration des tarifs */}
      <TarifConfigModal
        isOpen={showTarifForm}
        onClose={() => setShowTarifForm(false)}
        selectedIndex={selectedIndex}
        editingZones={editingZones}
        loading={loading}
        onZoneChange={handleZoneChange}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <SaveTarifModal
        isOpen={showIndexModal}
        onClose={() => setShowIndexModal(false)}
        onSave={handleSave}
        isSaving={isSaving}
        selectedIndex={selectedIndex}
        onIndexSelect={handleIndexSelect}
        zones={localZones}
        onZoneUpdate={handleZoneUpdate}
      />
    </DashboardLayout>
  );
};

export default Tarifs;
