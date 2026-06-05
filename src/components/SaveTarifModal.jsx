import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTarifs } from '../hooks/useTarifs';
import { formatPrice } from '../utils/format';
import {
  XMarkIcon,
  MapIcon,
  CheckIcon,
  ArrowPathIcon,
  TicketIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline";

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
  const [globalPercentage, setGlobalPercentage] = useState('');
  const [showGlobalInput, setShowGlobalInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIndex('');
      setEditedZones([]);
      setIsSavingLocal(false);
      setGlobalPercentage('');
      setShowGlobalInput(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsSavingLocal(isSavingProp || isSavingContext);
  }, [isSavingProp, isSavingContext]);

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

  const applyGlobalPercentage = useCallback(() => {
    const percentage = parseFloat(globalPercentage) || 0;
    setEditedZones(prevZones =>
      prevZones.map(zone => {
        const montantBase = parseFloat(zone.montant_base) || 0;
        const montantPrestation = (montantBase * percentage) / 100;
        const montantExpedition = montantBase + montantPrestation;
        return {
          ...zone,
          pourcentage_prestation: percentage,
          montant_prestation: parseFloat(montantPrestation.toFixed(2)),
          montant_expedition: parseFloat(montantExpedition.toFixed(2))
        };
      })
    );
    setShowGlobalInput(false);
    setGlobalPercentage('');
  }, [globalPercentage]);

  const incrementPercentage = useCallback((zoneId, step = 5) => {
    setEditedZones(prevZones =>
      prevZones.map(zone => {
        if (zone.zone_destination_id === zoneId) {
          const newPercentage = (parseFloat(zone.pourcentage_prestation) || 0) + step;
          const montantBase = parseFloat(zone.montant_base) || 0;
          const montantPrestation = (montantBase * newPercentage) / 100;
          const montantExpedition = montantBase + montantPrestation;
          return {
            ...zone,
            pourcentage_prestation: newPercentage,
            montant_prestation: parseFloat(montantPrestation.toFixed(2)),
            montant_expedition: parseFloat(montantExpedition.toFixed(2))
          };
        }
        return zone;
      })
    );
  }, []);

  const decrementPercentage = useCallback((zoneId, step = 5) => {
    setEditedZones(prevZones =>
      prevZones.map(zone => {
        if (zone.zone_destination_id === zoneId) {
          const newPercentage = Math.max(0, (parseFloat(zone.pourcentage_prestation) || 0) - step);
          const montantBase = parseFloat(zone.montant_base) || 0;
          const montantPrestation = (montantBase * newPercentage) / 100;
          const montantExpedition = montantBase + montantPrestation;
          return {
            ...zone,
            pourcentage_prestation: newPercentage,
            montant_prestation: parseFloat(montantPrestation.toFixed(2)),
            montant_expedition: parseFloat(montantExpedition.toFixed(2))
          };
        }
        return zone;
      })
    );
  }, []);

  const totalMontantBase = useMemo(() => {
    return editedZones.reduce((sum, zone) => sum + (parseFloat(zone.montant_base) || 0), 0);
  }, [editedZones]);

  const totalMontantPrestation = useMemo(() => {
    return editedZones.reduce((sum, zone) => sum + (parseFloat(zone.montant_prestation) || 0), 0);
  }, [editedZones]);

  const totalMontantExpedition = useMemo(() => {
    return editedZones.reduce((sum, zone) => sum + (parseFloat(zone.montant_expedition) || 0), 0);
  }, [editedZones]);

  const handleSaveChanges = useCallback(async () => {
    try {
      setIsSavingLocal(true);
      onIndexSelect(localSelectedIndex);
      if (localSelectedIndex === 'new') {
        const newTarif = { indice: localSelectedIndex, actif: true, prix_zones: editedZones };
        await saveTarifContext(newTarif);
      } else {
        if (onZoneUpdate) onZoneUpdate(editedZones);
        if (onSave) await onSave(localSelectedIndex, editedZones);
        else {
          const updatedTarif = { indice: localSelectedIndex, actif: true, prix_zones: editedZones };
          await saveTarifContext(updatedTarif);
        }
      }
      onClose();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    } finally {
      setIsSavingLocal(false);
    }
  }, [localSelectedIndex, editedZones, onSave, onClose, onIndexSelect, onZoneUpdate, saveTarifContext]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={onClose}></div>

        <div className="relative inline-block w-full max-w-4xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all">
          {/* Header */}
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <TicketIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">Initialisation de nouveau tarif</h3>
                <p className="text-xs font-medium text-slate-500">Sélectionnez un modèle de base pour commencer</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="max-w-md">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Choisir l'Indice Modèle</label>
              <select
                value={localSelectedIndex || ''}
                onChange={handleIndexChange}
                className="w-full px-4 py-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed hover:border-slate-300"
                disabled={isSavingLocal}
              >
                <option value="">-- Sélectionner un modèle --</option>
                {availableIndices.map((indexObj) => (
                  <option key={indexObj.value} value={indexObj.value}>{indexObj.label}</option>
                ))}
              </select>
            </div>

            {editedZones.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <MapIcon className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Aperçu et Ajustement des Zones</span>
                  </div>
                  
                  {!showGlobalInput ? (
                    <button
                      onClick={() => setShowGlobalInput(true)}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-colors"
                    >
                      <CalculatorIcon className="w-3.5 h-3.5 mr-1.5" />
                      Appliquer % Global
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={globalPercentage}
                        onChange={(e) => setGlobalPercentage(e.target.value)}
                        placeholder="Ex: 10"
                        className="w-20 px-3 py-1.5 text-xs font-bold border-2 border-indigo-200 rounded-lg shadow-sm focus:border-indigo-500 outline-none"
                        disabled={isSavingLocal}
                      />
                      <button
                        onClick={applyGlobalPercentage}
                        disabled={!globalPercentage}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        Appliquer
                      </button>
                      <button
                        onClick={() => {
                          setShowGlobalInput(false);
                          setGlobalPercentage('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="overflow-hidden border-2 border-slate-200 rounded-xl shadow-sm">
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                          <th className="px-6 py-4">Zone</th>
                          <th className="px-6 py-4">Base</th>
                          <th className="px-6 py-4 text-center">% Prestation</th>
                          <th className="px-6 py-4">Frais Prest.</th>
                          <th className="px-6 py-4 text-right">Total Calculé</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {editedZones.map((zone, index) => (
                          <tr key={zone.zone_destination_id} className={`hover:bg-indigo-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 leading-none">
                                  {zone.zone?.nom || zone.nom_zone || `Zone ${zone.zone_destination_id}`}
                                </span>
                                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-1">
                                  {zone.zone?.id ? `ID: ${zone.zone.id.substring(0, 8)}...` : zone.zone_destination_id}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-600">{formatPrice(zone.montant_base, "XOF")}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => decrementPercentage(zone.zone_destination_id, 5)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  disabled={isSavingLocal}
                                  title="Diminuer de 5%"
                                >
                                  <MinusCircleIcon className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  value={zone.pourcentage_prestation || ""}
                                  onChange={(e) => handlePercentageChange(zone.zone_destination_id, e.target.value)}
                                  className="w-16 px-2 py-1.5 text-xs font-bold text-center border-2 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                  disabled={isSavingLocal}
                                  placeholder="0"
                                />
                                <button
                                  onClick={() => incrementPercentage(zone.zone_destination_id, 5)}
                                  className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                  disabled={isSavingLocal}
                                  title="Augmenter de 5%"
                                >
                                  <PlusCircleIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-indigo-600">{formatPrice(zone.montant_prestation, "XOF")}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm">
                                {formatPrice(zone.montant_expedition, "XOF")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="sticky bottom-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                        <tr className="border-t-2 border-indigo-500">
                          <td className="px-6 py-4 text-xs font-bold uppercase tracking-wide">Total</td>
                          <td className="px-6 py-4 text-xs font-bold">{formatPrice(totalMontantBase, "XOF")}</td>
                          <td className="px-6 py-4 text-center text-xs font-bold">-</td>
                          <td className="px-6 py-4 text-xs font-bold">{formatPrice(totalMontantPrestation, "XOF")}</td>
                          <td className="px-6 py-4 text-right text-sm font-bold">{formatPrice(totalMontantExpedition, "XOF")}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <CalculatorIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-indigo-900 mb-1">Astuce Rapide</h4>
                      <p className="text-[11px] text-indigo-700 leading-relaxed">
                        Utilisez les boutons <span className="font-bold">+ / -</span> pour ajuster rapidement par pas de 5%, 
                        ou le bouton <span className="font-bold">"% Global"</span> pour appliquer le même pourcentage à toutes les zones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500">Zones configurées:</span>
              <span className="inline-flex items-center px-2.5 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
                {editedZones.length}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isSavingLocal}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSavingLocal || editedZones.length === 0 || !localSelectedIndex}
                className={`inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg transition-all ${!isSavingLocal && editedZones.length > 0 && localSelectedIndex
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-indigo-200 hover:-translate-y-0.5"
                    : "bg-slate-300 cursor-not-allowed"
                  }`}
              >
                {isSavingLocal ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Créer le Tarif Agence
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveTarifModal;
