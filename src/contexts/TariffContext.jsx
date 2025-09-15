import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../utils/api';

// Création du contexte
export const TariffContext = createContext();

export const useTariffs = () => {
  const context = useContext(TariffContext);
  if (!context) {
    throw new Error('useTariffs must be used within a TariffProvider');
  }
  return context;
};

export const TariffProvider = ({ children }) => {
  // État pour les tarifs existants
  const [existingTariffs, setExistingTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  
  // État pour la sélection et l'édition
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editingZones, setEditingZones] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // État pour le nouveau tarif en cours de création
  const [newTariff, setNewTariff] = useState({
    indice: '',
    actif: true,
    prix_zones: [
      { zone_destination_id: 1, nom_zone: 'Zone 1', montant_base: 0, pourcentage_prestation: 0, montant_prestation: 0, montant_expedition: 0 },
      { zone_destination_id: 2, nom_zone: 'Zone 2', montant_base: 0, pourcentage_prestation: 0, montant_prestation: 0, montant_expedition: 0 },
      { zone_destination_id: 3, nom_zone: 'Zone 3', montant_base: 0, pourcentage_prestation: 0, montant_prestation: 0, montant_expedition: 0 }
    ]
  });

  // Charger tous les tarifs existants
  const loadTariffs = useCallback(async (forceReload = false) => {
    try {
      // Charger uniquement si forcé ou si on n'a pas encore de tarifs
      if (forceReload || existingTariffs.length === 0) {
        setLoading(true);
        const response = await apiService.get('/tarification/list');
        
        if (response.success && Array.isArray(response.tarifs)) {
          // Traiter et stocker les tarifs existants
          const processedTariffs = response.tarifs.map(tarif => ({
            ...tarif,
            // S'assurer que prix_zones est toujours un tableau avec la structure correcte
            prix_zones: (tarif.prix_zones || []).map(zone => ({
              zone_destination_id: zone.zone_destination_id || `z1`,
              nom_zone: zone.nom_zone || `Zone ${zone.zone_destination_id || 'Inconnue'}`,
              montant_base: parseFloat(zone.montant_base) || 0,
              pourcentage_prestation: parseFloat(zone.pourcentage_prestation) || 0,
              montant_prestation: parseFloat(zone.montant_prestation) || 0,
              montant_expedition: parseFloat(zone.montant_expedition) || 0
            }))
          }));
          
          setExistingTariffs(processedTariffs);
          setError(null);
          
          // Sélectionner le premier index par défaut si aucun n'est sélectionné
          if (processedTariffs.length > 0 && selectedIndex === null) {
            setSelectedIndex(processedTariffs[0].indice);
            setEditingZones(JSON.parse(JSON.stringify(processedTariffs[0].prix_zones)));
          }
          
          return processedTariffs;
        } else {
          throw new Error(response.message || 'Échec du chargement des tarifs');
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des tarifs:', err);
      setError(err.message || 'Échec du chargement des tarifs');
    } finally {
      setLoading(false);
    }
  }, [existingTariffs.length, selectedIndex, setExistingTariffs, setLoading, setError, setSelectedIndex, setEditingZones]);

  // Gérer la sélection d'un indice de tarif existant
  const selectIndex = useCallback((index) => {
    // Convertir l'index en nombre si c'est une chaîne numérique
    const indexValue = typeof index === 'string' && !isNaN(index) ? parseFloat(index) : index;
    
    if (indexValue === selectedIndex) return;
    
    if (indexValue === 'new') {
      // Gérer la création d'un nouveau tarif
      setSelectedIndex('new');
      
      // Utiliser les zones du nouveau tarif
      setEditingZones(JSON.parse(JSON.stringify(newTariff.prix_zones)));
      setError(null);
      return;
    }
    
    // Trouver le tarif avec l'index sélectionné
    const selectedTariff = existingTariffs.find(t => {
      // Gérer les comparaisons de chaînes et de nombres
      const tariffIndex = typeof t.indice === 'string' ? parseFloat(t.indice) : t.indice;
      return tariffIndex === indexValue;
    });
    
    if (selectedTariff) {
      // Si on a les données du tarif, les utiliser
      setSelectedIndex(indexValue);
      setEditingZones(JSON.parse(JSON.stringify(selectedTariff.prix_zones || [])));
      setError(null);
    } else {
      // Si on n'a pas les données du tarif, afficher une erreur
      console.warn(`Aucune donnée de tarif trouvée pour l'indice ${index}`);
      setError(`Aucune donnée disponible pour l'indice ${index}`);
      
      // Essayer de trouver l'index disponible le plus proche
      const availableIndices = [...new Set(existingTariffs.map(t => t.indice))].sort((a, b) => a - b);
      if (availableIndices.length > 0) {
        // Trouver l'index le plus proche
        const closestIndex = availableIndices.reduce((prev, curr) => 
          Math.abs(curr - index) < Math.abs(prev - index) ? curr : prev
        );
        
        // Sélectionner l'index disponible le plus proche
        const closestTariff = existingTariffs.find(t => t.indice === closestIndex);
        if (closestTariff) {
          setSelectedIndex(closestIndex);
          setEditingZones(JSON.parse(JSON.stringify(closestTariff.prix_zones || [])));
          setError(`Indice ${index} non trouvé. Affichage de l'indice ${closestIndex} à la place.`);
        }
      }
    }
  }, [existingTariffs, selectedIndex, newTariff.prix_zones, setSelectedIndex, setEditingZones, setError]);
  
  // Mettre à jour les zones du nouveau tarif
  const updateNewTariffZones = useCallback((zones) => {
    setNewTariff(prev => ({
      ...prev,
      prix_zones: zones
    }));
  }, []);

  // Update zone percentage
  const updateZonePercentage = useCallback((zoneId, percentage) => {
    setEditingZones(prevZones => 
      prevZones.map(zone => {
        if (zone.zone_destination_id === zoneId) {
          const pourcentage_prestation = parseFloat(percentage) || 0;
          const montant_prestation = Math.round((zone.montant_base * pourcentage_prestation) / 100);
          return {
            ...zone,
            pourcentage_prestation,
            montant_prestation,
            montant_expedition: zone.montant_base + montant_prestation
          };
        }
        return zone;
      })
    );
  }, [setEditingZones]);

  // Sauvegarder les modifications d'un tarif
  const saveTariff = useCallback(async () => {
    if (selectedIndex === null) return { success: false, message: 'Aucun tarif sélectionné' };
    
    try {
      setIsSaving(true);
      setMessage('');
      
      // Préparer les données à sauvegarder
      const dataToSave = {
        indice: selectedIndex === 'new' 
          ? Math.max(0, ...existingTariffs.map(t => t.indice)) + 1 
          : selectedIndex,
        actif: true,
        prix_zones: editingZones.map(zone => ({
          zone_destination_id: zone.zone_destination_id,
          nom_zone: zone.nom_zone,
          montant_base: parseFloat(zone.montant_base) || 0,
          pourcentage_prestation: parseFloat(zone.pourcentage_prestation) || 0,
          montant_prestation: Math.round((parseFloat(zone.montant_base) * parseFloat(zone.pourcentage_prestation || 0)) / 100),
          montant_expedition: Math.round(parseFloat(zone.montant_base) + 
            (parseFloat(zone.montant_base) * parseFloat(zone.pourcentage_prestation || 0)) / 100)
        }))
      };
      
      // Vérifier si on crée un nouveau tarif ou on en met un à jour un existant
      const isNewTariff = selectedIndex === 'new';
      
      const response = isNewTariff 
        ? await apiService.post('/tarification/create', dataToSave)
        : await apiService.put(`/tarification/update/${selectedIndex}`, dataToSave);
      
      if (response.success) {
        // Recharger la liste des tarifs existants
        await loadTariffs(true);
        setMessage(isNewTariff ? 'Tarif créé avec succès' : 'Tarif mis à jour avec succès');
        
        // Si c'était un nouveau tarif, sélectionner le tarif nouvellement créé
        if (isNewTariff && response.data && response.data.indice) {
          setSelectedIndex(response.data.indice);
          // Réinitialiser le nouveau tarif
          setNewTariff({
            indice: '',
            actif: true,
            prix_zones: [
              { zone_destination_id: 1, nom_zone: 'Zone 1', montant_base: 0, pourcentage_prestation: 0, montant_prestation: 0, montant_expedition: 0 },
              { zone_destination_id: 2, nom_zone: 'Zone 2', montant_base: 0, pourcentage_prestation: 0, montant_prestation: 0, montant_expedition: 0 },
              { zone_destination_id: 3, nom_zone: 'Zone 3', montant_base: 0, pourcentage_prestation: 0, montant_prestation: 0, montant_expedition: 0 }
            ]
          });
        }
        
        return { success: true, isNew: isNewTariff };
      } else {
        throw new Error(response.message || 'Erreur lors de la sauvegarde du tarif');
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du tarif:', err);
      setMessage(err.message || 'Erreur lors de la sauvegarde');
      return { success: false, message: err.message || 'Erreur lors de la sauvegarde' };
    } finally {
      setIsSaving(false);
    }
  }, [selectedIndex, existingTariffs, editingZones, loadTariffs, setIsSaving, setMessage, setSelectedIndex, setNewTariff]);

  // Obtenir les indices uniques des tarifs existants
  const getIndices = useCallback(() => {
    // Extraire tous les indices et les convertir en nombres si possible
    const allIndices = existingTariffs.map(t => {
      const num = parseFloat(t.indice);
      return isNaN(num) ? t.indice : num;
    });
    
    // Éliminer les doublons et trier
    const uniqueIndices = [...new Set(allIndices)];
    
    // Trier les indices numériquement
    return uniqueIndices.sort((a, b) => {
      // Si les deux sont des nombres, les comparer numériquement
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      // Sinon, les convertir en chaînes et les comparer comme texte
      return String(a).localeCompare(String(b));
    });
  }, [existingTariffs]);

  // Obtenir le tarif actuellement sélectionné
  const getCurrentTariff = useCallback(() => {
    if (selectedIndex === null) return null;
    if (selectedIndex === 'new') return newTariff;
    
    return existingTariffs.find(tariff => {
      // Convertir les deux valeurs en nombres si possible pour la comparaison
      const tariffIndex = typeof tariff.indice === 'string' && !isNaN(tariff.indice) 
        ? parseFloat(tariff.indice) 
        : tariff.indice;
      
      const currentIndex = typeof selectedIndex === 'string' && !isNaN(selectedIndex)
        ? parseFloat(selectedIndex)
        : selectedIndex;
        
      return tariffIndex === currentIndex;
    });
  }, [existingTariffs, selectedIndex, newTariff]);

  // Obtenir les tarifs de l'agence
  const fetchAgencyTariffs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/agence/list-tarifs');
      
      if (response.success) {
        // Essayer plusieurs chemins possibles pour les données
        const tarifs = response?.data?.tarifs ?? response?.tarifs ?? [];
        
        // Mettre à jour uniquement les tarifs existants
        setExistingTariffs(tarifs);
        
        // Si aucun tarif n'est sélectionné et qu'il y a des tarifs, sélectionner le premier
        if (selectedIndex === null && tarifs.length > 0) {
          setSelectedIndex(tarifs[0].indice);
          setEditingZones(JSON.parse(JSON.stringify(tarifs[0].prix_zones || [])));
        }
      } else {
        console.error("Erreur lors du chargement des tarifs de l'agence :", response.message);
        setError(response.message || "Erreur lors du chargement des tarifs de l'agence");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tarifs de l'agence :", error);
      setError("Erreur lors du chargement des tarifs de l'agence");
    } finally {
      setLoading(false);
    }
  }, [selectedIndex, setExistingTariffs, setSelectedIndex, setEditingZones, setLoading, setError]);
  

  // Load tariffs on mount
  useEffect(() => {
    loadTariffs();
  }, [loadTariffs]);
  
  // Fetch agency tariffs on mount
  useEffect(() => {
    fetchAgencyTariffs();
  }, [fetchAgencyTariffs]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  // Valeur du contexte
  const contextValue = {
    // États
    existingTariffs,
    newTariff,
    loading,
    error,
    message,
    selectedIndex,
    editingZones,
    isSaving,

    // Fonctions
    selectIndex,
    updateZonePercentage,
    saveTariff,
    getIndices,
    getCurrentTariff,
    updateNewTariffZones,
    loadTariffs
  };

  return (
    <TariffContext.Provider value={contextValue}>
      {children}
    </TariffContext.Provider>
  );
};

export default TariffProvider;
