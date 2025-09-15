import React, { useState, useEffect, useCallback } from 'react';
import { useTariffs } from '../contexts/TariffContext';
import DashboardLayout from '../components/DashboardLayout';
import SelectTariffIndexModal from '../components/SelectTariffIndexModal';
import { formatPrice } from '../utils/format';


const Tariffs = () => {
  const {
    loading,
    error,
    message,
    selectedIndex,
    editingZones,
    isSaving,
    selectIndex,
    updateZonePercentage,
    saveTariff,
    getIndices,
    getCurrentTariff,
    existingTariffs,
    newTariff,
    loadTariffs,
    updateNewTariffZones
  } = useTariffs();
  
  const [availableIndices, setAvailableIndices] = useState([]);
  const [currentTariffData, setCurrentTariffData] = useState(null);

  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showTariffForm, setShowTariffForm] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);

  // Charger les tarifs au montage du composant
  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        await loadTariffs();
        // Mettre à jour les indices disponibles après le chargement
        const indices = getIndices();
        setAvailableIndices(indices);
      } catch (err) {
        console.error('Erreur lors du chargement des tarifs:', err);
      }
    };
    
    fetchTariffs();
  }, [loadTariffs, getIndices]);
  
  // Mettre à jour le tarif courant lorsque l'indice sélectionné change
  useEffect(() => {
    const updateSelectedTariff = async () => {
      if (selectedIndex === 'new') {
        // Utiliser les données du nouveau tarif depuis le contexte
        setCurrentTariffData(newTariff);
        setShowTariffForm(true);
        setShowSaveButton(true); // Activer le bouton de sauvegarde pour les nouveaux tarifs
      } else if (selectedIndex) {
        // Pour un tarif existant
        const tariff = getCurrentTariff();
        if (tariff) {
          setCurrentTariffData(tariff);
          setShowTariffForm(true);
          setShowSaveButton(false); // Désactiver le bouton jusqu'à ce qu'une modification soit faite
        }
      } else {
        // Aucun tarif sélectionné
        setShowTariffForm(false);
        setShowSaveButton(false);
      }
    };

    updateSelectedTariff();
  }, [selectedIndex, getCurrentTariff, newTariff, setShowSaveButton, setShowTariffForm, setCurrentTariffData]);

  const handleZoneChange = useCallback((zoneId, value) => {
    if (selectedIndex === 'new') {
      // Mettre à jour les zones du nouveau tarif dans le contexte
      const updatedZones = newTariff.prix_zones.map(zone => {
        if (zone.zone_destination_id === zoneId) {
          const pourcentage = parseFloat(value) || 0;
          const montantBase = parseFloat(zone.montant_base) || 0;
          const montantPrestation = (montantBase * pourcentage) / 100;
          
          return {
            ...zone,
            pourcentage_prestation: pourcentage,
            montant_prestation: parseFloat(montantPrestation.toFixed(2)),
            montant_expedition: parseFloat((montantBase + montantPrestation).toFixed(2))
          };
        }
        return zone;
      });
      
      updateNewTariffZones(updatedZones);
    } else {
      // Mettre à jour les zones d'un tarif existant
      updateZonePercentage(zoneId, value);
    }
    setShowSaveButton(true);
  }, [selectedIndex, newTariff.prix_zones, updateNewTariffZones, updateZonePercentage]);

  const handleSave = useCallback(async () => {
    try {
      // Appeler la fonction de sauvegarde du contexte
      const result = await saveTariff();
      
      if (result?.success) {
        // Recharger les tarifs après la sauvegarde
        await loadTariffs(true);
        
        // Mettre à jour la liste des indices disponibles
        const indices = getIndices();
        setAvailableIndices(indices);
        
        // Fermer le modal après un court délai pour montrer le message de succès
        setTimeout(() => {
          setShowIndexModal(false);
          setShowSaveButton(false);
        }, 1000);
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du tarif:', err);
    }
  }, [saveTariff, loadTariffs, getIndices, setShowIndexModal, setShowSaveButton]);

  const handleNewTariff = useCallback(() => {
    setShowIndexModal(true);
  }, []);

  const handleIndexSelect = useCallback((selectedIndex) => {
    selectIndex(selectedIndex);
    setShowIndexModal(false);
    setShowTariffForm(true);
  }, [selectIndex, setShowIndexModal, setShowTariffForm]);

  const currentTariff = getCurrentTariff();
  const indices = getIndices();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur ! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          {/* En-tête avec titre et messages */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des tarifs</h2>
              <button
                onClick={handleNewTariff}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                + Ajouter un tarif
              </button>
            </div>
            
            {message && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{message}</span>
              </div>
            )}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>

          {/* Liste des tarifs existants */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Tarifs existants</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Liste des configurations de tarifs existantes pour votre agence
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indice
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de création
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {existingTariffs.length > 0 ? (
                    existingTariffs.map((tariff) => (
                      <tr key={tariff.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tariff.id ? String(tariff.id).substring(0, 8) + '...' : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Indice {tariff.indice || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tariff.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {tariff.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tariff.created_at ? new Date(tariff.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleIndexSelect(tariff.indice)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Configurer
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun tarif configuré pour le moment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formulaire de configuration des tarifs */}
          <div className="mt-6">
            {showTariffForm && (
              <div className="bg-white shadow rounded-lg overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedIndex === 'new' ? 'Nouveau tarif' : `Configuration du tarif`}
                  </h2>
                  <button
                    onClick={() => setShowTariffForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tableau des zones */}
                {currentTariffData && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Configuration des zones pour l'indice {selectedIndex}
                    </h3>
                    
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
                              <tr key={zone.zone_destination_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  Zone {zone.zone_destination_id.replace('z', '')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatPrice(zone.montant_base, 'XOF')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      value={zone.pourcentage_prestation || ''}
                                      onChange={(e) => handleZoneChange(zone.zone_destination_id, e.target.value)}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatPrice(zone.montant_prestation || 0, 'XOF')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatPrice(zone.montant_expedition || 0, 'XOF')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setShowTariffForm(false)}
                            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={isSaving || (selectedIndex !== 'new' && !showSaveButton)}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${selectedIndex === 'new' || showSaveButton ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                          >
                            {isSaving ? 'Enregistrement...' : selectedIndex === 'new' ? 'Créer le tarif' : 'Enregistrer les modifications'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <SelectTariffIndexModal
        isOpen={showIndexModal}
        onClose={() => setShowIndexModal(false)}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </DashboardLayout>
  );
};

export default Tariffs;


