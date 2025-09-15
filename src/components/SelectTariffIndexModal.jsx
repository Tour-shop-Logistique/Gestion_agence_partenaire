import React, { useState, useEffect, useCallback } from "react";
import { useTariffs } from "../contexts/TariffContext";

const SelectTariffIndexModal = ({ isOpen, onClose, onSave, isSaving }) => {
  const { 
    existingTariffs, 
    newTariff, 
    selectedIndex, 
    selectIndex, 
    updateNewTariffZones,
    updateZonePercentage,
    editingZones,
    loadTariffs
  } = useTariffs();
  
  const [availableIndices, setAvailableIndices] = useState([]);
  const [editedTariff, setEditedTariff] = useState(null);

  // Mettre à jour les indices disponibles
  useEffect(() => {
    if (existingTariffs && existingTariffs.length > 0) {
      const indices = [...new Set(existingTariffs.map(t => t.indice))]
        .sort((a, b) => parseFloat(a) - parseFloat(b));
      setAvailableIndices(indices);
    } else {
      setAvailableIndices([]);
    }
  }, [existingTariffs]);

  // Mettre à jour le tarif édité lorsque l'index sélectionné change
  useEffect(() => {
    if (selectedIndex === 'new') {
      setEditedTariff({
        ...newTariff,
        prix_zones: newTariff.prix_zones?.map(zone => ({
          ...zone,
          montant_base: parseFloat(zone.montant_base) || 0,
          pourcentage_prestation: parseFloat(zone.pourcentage_prestation) || 0,
          montant_prestation: parseFloat(zone.montant_prestation) || 0,
          montant_expedition: parseFloat(zone.montant_expedition) || 0
        })) || []
      });
    } else if (selectedIndex) {
      const tariff = existingTariffs.find(t => t.indice.toString() === selectedIndex.toString());
      if (tariff) {
        setEditedTariff({
          ...tariff,
          prix_zones: tariff.prix_zones?.map(zone => ({
            ...zone,
            montant_base: parseFloat(zone.montant_base) || 0,
            pourcentage_prestation: parseFloat(zone.pourcentage_prestation) || 0,
            montant_prestation: parseFloat(zone.montant_prestation) || 0,
            montant_expedition: parseFloat(zone.montant_expedition) || 0
          })) || []
        });
      }
    } else {
      setEditedTariff(null);
    }
  }, [selectedIndex, existingTariffs, newTariff, setEditedTariff]);

  const handleIndexChange = useCallback((e) => {
    const index = e.target.value;
    selectIndex(index);
  }, [selectIndex]);

  const handleBaseAmountChange = useCallback((zoneId, value) => {
    const baseAmount = parseFloat(value) || 0;
    
    setEditedTariff(prev => ({
      ...prev,
      prix_zones: prev.prix_zones.map(z => 
        z.zone_destination_id === zoneId 
          ? { 
              ...z, 
              montant_base: baseAmount,
              montant_prestation: (baseAmount * (z.pourcentage_prestation || 0)) / 100,
              montant_expedition: baseAmount + ((baseAmount * (z.pourcentage_prestation || 0)) / 100)
            } 
          : z
      )
    }));
  }, []);

  const handlePercentageChange = useCallback((zoneId, value) => {
    const percentage = parseFloat(value) || 0;
    
    if (selectedIndex === 'new') {
      const updatedZones = newTariff.prix_zones.map(zone => {
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
      });
      
      updateNewTariffZones(updatedZones);
    } else {
      updateZonePercentage(zoneId, percentage);
    }
  }, [selectedIndex, newTariff.prix_zones, updateNewTariffZones, updateZonePercentage]);

  const handleSaveChanges = useCallback(async () => {
    try {
      const result = await onSave();
      if (result?.success) {
        await loadTariffs(true); // Recharger les tarifs après la sauvegarde
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, [onSave, loadTariffs, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedIndex === 'new' ? 'Nouveau tarif' : `Configuration du tarif`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Fermer</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="tariffIndex" className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un indice
          </label>
          <div className="relative">
            <select
              id="tariffIndex"
              value={selectedIndex || ''}
              onChange={handleIndexChange}
              className="block w-full max-w-md border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSaving}
            >
              <option value="">Sélectionner un indice</option>
              {availableIndices.map((index) => (
                <option key={index} value={index}>
                  {typeof index === 'number' ? `Indice ${index}` : index}
                </option>
              ))}
              <option value="new">+ Nouveau tarif</option>
            </select>
          </div>
        </div>

        {editedTariff && (
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configuration des tarifs pour l'indice: {editedTariff.indice || 'Nouveau'}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Base</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Prestation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Prestation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Expédition</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {editedTariff.prix_zones?.map((zone) => (
                    <tr key={zone.zone_destination_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {zone.nom_zone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={zone.montant_base}
                          onChange={(e) => handleBaseAmountChange(zone.zone_destination_id, e.target.value)}
                          className="block w-24 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={zone.pourcentage_prestation}
                            onChange={(e) => handlePercentageChange(zone.zone_destination_id, e.target.value)}
                            step="0.01"
                            min="0"
                            className="block w-24 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={zone.montant_prestation}
                            readOnly
                            className="block w-32 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-gray-100"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={zone.montant_expedition}
                            readOnly
                            className="block w-32 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-gray-100"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isSaving || !editedTariff}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 ${!editedTariff ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectTariffIndexModal;
