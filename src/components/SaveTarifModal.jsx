import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTarifs } from '../hooks/useTarifs';
import { formatPrice } from '../utils/format';

const SaveTarifModal = ({
  isOpen,
  onClose,
  onSave,
  isSavingProp,
  selectedIndex: selectedIndexProp,
  onIndexSelect,
  zones: zonesProp,
  editingZones: editingZonesProp,
  onZoneUpdate
}) => {
  const {
    tarifs: baseTarifs,
    existingTarifs: tarifs,
    isSaving: isSavingContext,
    saveTarif: saveTarifContext
  } = useTarifs();

  const [localSelectedIndex, setLocalSelectedIndex] = useState(selectedIndexProp || '');
  const [editedZones, setEditedZones] = useState([]);
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  // Réinitialiser les champs à l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIndex('');
      setEditedZones([]);
      setIsSavingLocal(false);
    }
  }, [isOpen]);

  // Utiliser le isSaving du contexte ou des props
  useEffect(() => {
    setIsSavingLocal(isSavingProp || isSavingContext);
  }, [isSavingProp, isSavingContext]);

  // Récupérer les indices disponibles depuis les tarifs de base
  const availableIndices = useMemo(() => {
    if (!baseTarifs || !Array.isArray(baseTarifs)) return [];
    return baseTarifs.map(tarif => ({
      value: tarif?.indice,
      label: `Indice ${tarif?.indice}`
    })).filter(item => item.value);
  }, [baseTarifs]);

  const handleIndexChange = useCallback((e) => {
    const index = e.target.value;
    setLocalSelectedIndex(index);

    // Mettre à jour les zones avec celles du tarif sélectionné depuis les tarifs de base
    const selectedTarif = baseTarifs.find(t => t.indice.toString() === index.toString());
    if (selectedTarif?.prix_zones) {
      setEditedZones([...selectedTarif.prix_zones]);
    }
  }, [baseTarifs]);

  const handlePercentageChange = useCallback((zoneId, value) => {
    const percentage = parseFloat(value) || 0;

    setEditedZones(prevZones =>
      prevZones.map(zone => {
        if (zone.zone_destination_id === zoneId) {
          const montantBase = parseFloat(zone.montant_base) || 0;
          const montantPrestation = (montantBase * percentage) / 100;
          const montantExpedition = montantBase + montantPrestation;

          return {
            ...zone,
            pourcentage_prestation: percentage,
            montant_prestation: parseFloat(montantPrestation.toFixed(2)),
            montant_expedition: parseFloat(montantExpedition.toFixed(2))
          };
        }
        return zone;
      })
    );
  }, []);

  const handleSaveChanges = useCallback(async () => {
    try {
      setIsSavingLocal(true);
      let result;

      // Mettre à jour le parent avec la sélection actuelle
      onIndexSelect(localSelectedIndex);

      // Si c'est un nouveau tarif
      if (localSelectedIndex === 'new') {
        // Créer un nouveau tarif avec les zones éditées
        const newTarif = {
          indice: localSelectedIndex,
          actif: true,
          prix_zones: editedZones
        };
        await saveTarifContext(newTarif);
      } else {
        // Mettre à jour les zones avant de sauvegarder
        if (onZoneUpdate) {
          onZoneUpdate(editedZones);
        }

        if (onSave) {
          await onSave(localSelectedIndex, editedZones);
        } else {
          // Si pas de callback onSave fourni, utiliser directement saveTarif
          const updatedTarif = {
            indice: localSelectedIndex,
            actif: true,
            prix_zones: editedZones
          };
          await saveTarifContext(updatedTarif);
        }
      }

      onClose();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setIsSavingLocal(false);
    }
  }, [localSelectedIndex, editedZones, onSave, onClose, onIndexSelect, onZoneUpdate, saveTarifContext]);

  // Ne pas rendre le modal s'il n'est pas ouvert
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
                      Sélection de l'indice de tarif
                    </h3>
                    <p className="text-blue-100 text-xs">
                      Choisissez un indice parmi les tarifs de base disponibles
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
              {/* Sélection de l'indice */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h4 className="text-lg font-medium text-gray-900">
                    Sélection de l'indice
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="tarifIndex"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Indice <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tarifIndex"
                      value={localSelectedIndex || ''}
                      onChange={handleIndexChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                      disabled={isSavingLocal}
                    >
                      <option value="">Sélectionner un indice</option>
                      {availableIndices && availableIndices.map((indexObj) => (
                        <option key={indexObj.value} value={indexObj.value}>
                          {indexObj.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tableau des zones */}
              {editedZones.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                    <h4 className="text-lg font-medium text-gray-900">
                      Configuration des tarifs
                    </h4>
                  </div>

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
                        {editedZones.map((zone) => (
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
                                    handlePercentageChange(
                                      zone.zone_destination_id,
                                      e.target.value
                                    )
                                  }
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={isSavingLocal}
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
                  </div>
                </div>
              )}

              {/* Footer avec boutons */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isSavingLocal}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSavingLocal || editedZones.length === 0 || !localSelectedIndex}
                  className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    isSavingLocal ? 'animate-pulse' : ''
                  }`}
                >
                  {isSavingLocal ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      Créer le tarif
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SelectTarifIndexModal;

