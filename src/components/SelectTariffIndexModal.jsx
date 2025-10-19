import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { TariffContext } from '../contexts/TariffContext';

const SelectTariffIndexModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  selectedIndex,
  onIndexSelect,
  zones = [],
  onZoneUpdate
}) => {
  const [editedZones, setEditedZones] = useState([]);
  const [localSelectedIndex, setLocalSelectedIndex] = useState(selectedIndex);
  const [isSavingLocal, setIsSaving] = useState(false);

  // Utiliser le contexte pour accéder aux données et méthodes
  const { 
    loading, 
    error, 
    tariffs,
    loadTariffs,
    editingZones,
    selectIndex,
    updateZonePercentage,
    saveTariff
  } = useContext(TariffContext);

  // Charger les tarifs au montage du composant et sélectionner le premier index
useEffect(() => {
  const fetchData = async () => {
    await loadTariffs();

    // Une seule fois après le chargement initial
    if (!localSelectedIndex && tariffs.length > 0) {
      const firstIndex = tariffs[0]?.indice;
      if (firstIndex) {
        setLocalSelectedIndex(firstIndex);
        const firstTariff = tariffs.find(t => t.indice === firstIndex);
        if (firstTariff?.prix_zones) {
          setEditedZones([...firstTariff.prix_zones]);
        }
      }
    }
  };

  fetchData();
  // 👇 vide pour exécution unique au montage
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);




  // Mettre à jour les zones éditées quand les props changent
  useEffect(() => {
    if (zones && zones.length > 0) {
      setEditedZones([...zones]);
    } else if (editingZones && editingZones.length > 0) {
      setEditedZones([...editingZones]);
    }
  }, [zones, editingZones]);

  // Mettre à jour l'index sélectionné localement
  useEffect(() => {
    setLocalSelectedIndex(selectedIndex);
  }, [selectedIndex]);

  // Récupérer les indices disponibles depuis les tarifs
  const availableIndices = useMemo(() => {
    if (!tariffs || !Array.isArray(tariffs)) return [];
    return tariffs.map(tarif => ({
      value: tarif?.indice,
      label: `Indice ${tarif?.indice}`
    })).filter(item => item.value);
  }, [tariffs]);

  const handleIndexChange = useCallback((e) => {
    const index = e.target.value;
    setLocalSelectedIndex(index);
    
    // Mettre à jour les zones avec celles du tarif sélectionné
    const selectedTariff = tariffs.find(t => t.indice.toString() === index.toString());
    if (selectedTariff?.prix_zones) {
      setEditedZones([...selectedTariff.prix_zones]);
    }
  }, [tariffs]);

  const handleBaseAmountChange = useCallback((zoneId, value) => {
    const baseAmount = parseFloat(value) || 0;
    
    setEditedZones(prevZones => 
      prevZones.map(zone => {
        if (zone.zone_destination_id === zoneId) {
          const pourcentage = parseFloat(zone.pourcentage_prestation) || 0;
          const montantPrestation = (baseAmount * pourcentage) / 100;
          const montantExpedition = baseAmount + montantPrestation;
          
          return {
            ...zone,
            montant_base: baseAmount,
            montant_prestation: parseFloat(montantPrestation.toFixed(2)),
            montant_expedition: parseFloat(montantExpedition.toFixed(2))
          };
        }
        return zone;
      })
    );
  }, []);

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
      setIsSaving(true);
      let result;
      
      // Mettre à jour le parent avec la sélection actuelle
      onIndexSelect(localSelectedIndex);
      
      // Si c'est un nouveau tarif
      if (localSelectedIndex === 'new') {
        // Créer un nouveau tarif avec les zones éditées
        const newTariff = {
          indice: localSelectedIndex,
          actif: true,
          prix_zones: editedZones
        };
        result = await saveTariff(newTariff);
      } else {
        // Mettre à jour les zones avant de sauvegarder
        if (onZoneUpdate) {
          onZoneUpdate(editedZones);
        }
        
        if (onSave) {
          result = await onSave(localSelectedIndex, editedZones);
        } else {
          // Si pas de callback onSave fourni, utiliser directement saveTariff
          const updatedTariff = {
            indice: localSelectedIndex,
            actif: true,
            prix_zones: editedZones
          };
          result = await saveTariff(updatedTariff);
        }
      }
      
      onClose();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setIsSaving(false);
    }
  }, [localSelectedIndex, editedZones, onSave, onClose, onIndexSelect, onZoneUpdate, saveTariff]);

  // Mémoizer les lignes du tableau pour éviter les re-rendus inutiles
  const tableRows = useMemo(() => {
    if (!editedZones || !Array.isArray(editedZones)) return null;
    
    return editedZones.map((zone) => {
      if (!zone) return null;
      
      return (
        <tr key={zone.zone_destination_id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {zone.nom_zone || `Zone ${zone.zone_destination_id || ''}`}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <input
              type="number"
              min="0"
              step="0.01"
              value={zone.montant_base || ''}
              onChange={(e) => handleBaseAmountChange(zone.zone_destination_id, e.target.value)}
              className="block w-24 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              disabled={isSavingLocal}
            />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                min="0"
                step="0.1"
                value={zone.pourcentage_prestation || ''}
                onChange={(e) => handlePercentageChange(zone.zone_destination_id, e.target.value)}
                className="block w-24 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                disabled={isSavingLocal}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {zone.montant_prestation ? 
              parseFloat(zone.montant_prestation).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) + ' €' : '0,00 €'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {zone.montant_expedition ? 
              parseFloat(zone.montant_expedition).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) + ' €' : '0,00 €'}
          </td>
        </tr>
      );
    });
  }, [editedZones, isSavingLocal, handleBaseAmountChange, handlePercentageChange]);

  // Ne pas rendre le modal s'il n'est pas ouvert
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedIndex === 'new' ? 'Nouveau tarif' : 'Configuration du tarif'}
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
              disabled={isSavingLocal}
            >
              <option value="">Sélectionner un indice</option>
              {availableIndices && availableIndices.map((indexObj) => (
                <option key={indexObj.value} value={indexObj.value}>
                  {indexObj.label}
                </option>
              ))}
              <option value="new">+ Nouveau tarif</option>
            </select>
          </div>
        </div>

        {editedZones.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configuration des tarifs pour l'indice: {localSelectedIndex === 'new' ? 'Nouveau' : localSelectedIndex}
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
                  {tableRows}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSavingLocal}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSavingLocal || editedZones.length === 0}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
              isSavingLocal ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSavingLocal ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectTariffIndexModal;
