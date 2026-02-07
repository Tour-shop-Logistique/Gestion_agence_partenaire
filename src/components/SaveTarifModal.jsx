import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTarifs } from '../hooks/useTarifs';
import { formatPrice } from '../utils/format';
import {
  XMarkIcon,
  MapIcon,
  CheckIcon,
  ArrowPathIcon,
  TicketIcon
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

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIndex('');
      setEditedZones([]);
      setIsSavingLocal(false);
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
                <h3 className="text-base font-black text-slate-900 leading-tight">Initialisation de nouveau tarif</h3>
                <p className="text-xs font-medium text-slate-500">Sélectionnez un modèle de base pour commencer</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="max-w-md">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Choisir l'Indice Modèle</label>
              <select
                value={localSelectedIndex || ''}
                onChange={handleIndexChange}
                className="w-full px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50"
                disabled={isSavingLocal}
              >
                <option value="">-- Sélectionner un modèle --</option>
                {availableIndices.map((indexObj) => (
                  <option key={indexObj.value} value={indexObj.value}>{indexObj.label}</option>
                ))}
              </select>
            </div>

            {editedZones.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <MapIcon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Aperçu et Ajustement des Zones</span>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="px-6 py-3">Zone</th>
                        <th className="px-6 py-3">Base</th>
                        <th className="px-6 py-3">% Prest.</th>
                        <th className="px-6 py-3 text-right">Total Calculé</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editedZones.map((zone) => (
                        <tr key={zone.zone_destination_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3 text-sm font-black text-slate-900 leading-none">
                            Z{zone.zone_destination_id.replace(/z/i, "")}
                          </td>
                          <td className="px-6 py-3 text-xs font-medium text-slate-500">
                            {formatPrice(zone.montant_base, "XOF")}
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="number"
                              value={zone.pourcentage_prestation || ""}
                              onChange={(e) => handlePercentageChange(zone.zone_destination_id, e.target.value)}
                              className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded shadow-sm focus:border-indigo-500 outline-none"
                              disabled={isSavingLocal}
                            />
                          </td>
                          <td className="px-6 py-3 text-sm font-black text-indigo-600 text-right">
                            {formatPrice(zone.montant_expedition, "XOF")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              disabled={isSavingLocal}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSavingLocal || editedZones.length === 0 || !localSelectedIndex}
              className={`inline-flex items-center px-6 py-2 rounded-lg text-sm font-black text-white shadow-sm transition-all ${!isSavingLocal && editedZones.length > 0 && localSelectedIndex
                  ? "bg-slate-950 hover:bg-slate-800"
                  : "bg-slate-300 cursor-not-allowed"
                }`}
            >
              {isSavingLocal ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
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
  );
};

export default SaveTarifModal;
