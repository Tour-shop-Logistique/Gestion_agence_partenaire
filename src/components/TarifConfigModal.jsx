import React from "react";
import { formatPrice } from "../utils/format";

const TarifConfigModal = ({
  isOpen,
  onClose,
  selectedIndex,
  editingZones,
  loading,
  onZoneChange,
  onSave,
  isSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay avec blur - mobile-first */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block w-full max-w-4xl mx-4 sm:mx-auto transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:align-middle">
          <form>
            {/* Header avec gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Configuration du tarif - Indice {selectedIndex}
                    </h3>
                    <p className="text-blue-100 text-xs">
                      Définissez les pourcentages de prestation pour chaque zone
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full p-1.5 bg-white/20 text-white hover:bg-white/30 transition-colors"
                  onClick={onClose}
                >
                  <span className="sr-only">Fermer</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body du formulaire */}
            <div className="px-6 py-4 space-y-4">
              {/* Tableau des zones */}
              <div className="mt-6">
                {loading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Zone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant Base
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % Prestation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant Prestation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant Expédition
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editingZones.map((zone) => (
                          <tr
                            key={zone.zone_destination_id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Zone {zone.zone_destination_id.replace("z", "")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatPrice(zone.montant_base || 0, "XOF")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={zone.pourcentage_prestation || ""}
                                  onChange={(e) =>
                                    onZoneChange(
                                      zone.zone_destination_id,
                                      e.target.value
                                    )
                                  }
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <span className="ml-2">%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatPrice(
                                zone.montant_prestation || 0,
                                "XOF"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatPrice(
                                zone.montant_expedition || 0,
                                "XOF"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={onClose}
                        className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={onSave}
                        disabled={isSaving || editingZones.length === 0}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          !isSaving && editingZones.length > 0
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {isSaving
                          ? "Enregistrement..."
                          : selectedIndex === "new"
                          ? "Créer le tarif"
                          : "Enregistrer les modifications"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TarifConfigModal;