





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
  const [tariffs, setTariffs] = useState([]);
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

  // Charger tous les tarifs existants (tarification par défaut)
  const loadTariffs = useCallback(async (forceReload = false) => {
    try {
      // Ne charger que si nécessaire
      if (forceReload || tariffs.length === 0) {
        setLoading(true);
        const response = await apiService.get('/tarification/list');
        
        if (response.success && Array.isArray(response.tarifs)) {
          // Traiter et stocker les tarifs existants
          const processedTariffs = response.tarifs.map(tarif => ({
            ...tarif,
            prix_zones: (tarif.prix_zones || []).map(zone => ({
              zone_destination_id: zone.zone_destination_id || `z1`,
              nom_zone: zone.nom_zone || `Zone ${zone.zone_destination_id || 'Inconnue'}`,
              montant_base: parseFloat(zone.montant_base) || 0,
              pourcentage_prestation: parseFloat(zone.pourcentage_prestation) || 0,
              montant_prestation: parseFloat(zone.montant_prestation) || 0,
              montant_expedition: parseFloat(zone.montant_expedition) || 0
            }))
          }));
          
          setTariffs(processedTariffs);
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
      return tariffs;
    } catch (err) {
      console.error('Erreur lors du chargement des tarifs:', err);
      setError(err.message || 'Échec du chargement des tarifs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tariffs, selectedIndex]);

  // Gérer la sélection d'un indice de tarif existant
  const selectIndex = useCallback((index) => {
    // Normaliser l'index (gérer les chaînes numériques)
    const normalizeIndex = (idx) => {
      if (idx === 'new') return 'new';
      const num = typeof idx === 'string' ? parseFloat(idx) : idx;
      return isNaN(num) ? idx : num;
    };
    
    const normalizedIndex = normalizeIndex(index);
    const normalizedSelectedIndex = normalizeIndex(selectedIndex);
    
    if (normalizedIndex === normalizedSelectedIndex) return;
    
    if (normalizedIndex === 'new') {
      // Gérer la création d'un nouveau tarif
      setSelectedIndex('new');
      setEditingZones(JSON.parse(JSON.stringify(newTariff.prix_zones)));
      setError(null);
      return;
    }
    
    // Fonction de comparaison d'indices avec tolérance pour les nombres flottants
    const compareIndices = (a, b) => {
      const numA = typeof a === 'string' ? parseFloat(a) : a;
      const numB = typeof b === 'string' ? parseFloat(b) : b;
      
      if (isNaN(numA) || isNaN(numB)) return a === b;
      return Math.abs(numA - numB) < 0.0001; // Tolérance pour les nombres flottants
    };
    
    // Trouver le tarif avec l'index sélectionné
    const selectedTariff = tariffs.find(t => compareIndices(t.indice, normalizedIndex));
    
    if (selectedTariff) {
      // Si on a les données du tarif, les utiliser
      setSelectedIndex(selectedTariff.indice); // Conserver le format d'origine
      setEditingZones(JSON.parse(JSON.stringify(selectedTariff.prix_zones || [])));
      setError(null);
    } else {
      // Si on n'a pas les données du tarif, afficher une erreur
      console.warn(`Aucune donnée de tarif trouvée pour l'indice ${index}`);
      setError(`Aucune donnée disponible pour l'indice ${index}`);
      
      // Essayer de trouver l'index disponible le plus proche
      const availableIndices = [...new Set(tariffs.map(t => t.indice))]
        .sort((a, b) => {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return numA - numB;
        });
        
      if (availableIndices.length > 0) {
        // Trouver l'index le plus proche
        const currentNum = parseFloat(normalizedIndex) || 0;
        const closestIndex = availableIndices.reduce((prev, curr) => {
          const prevDiff = Math.abs((parseFloat(prev) || 0) - currentNum);
          const currDiff = Math.abs((parseFloat(curr) || 0) - currentNum);
          return currDiff < prevDiff ? curr : prev;
        });
        
        // Sélectionner l'index disponible le plus proche
        const closestTariff = tariffs.find(t => compareIndices(t.indice, closestIndex));
        if (closestTariff) {
          setSelectedIndex(closestTariff.indice);
          setEditingZones(JSON.parse(JSON.stringify(closestTariff.prix_zones || [])));
          setError(`Indice ${index} non trouvé. Affichage de l'indice ${closestTariff.indice} à la place.`);
        }
      }
    }
  }, [tariffs, selectedIndex, newTariff.prix_zones, setSelectedIndex, setEditingZones, setError]);
  
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
          ? Math.max(0, ...tariffs.map(t => t.indice)) + 1 
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
  }, [selectedIndex, tariffs, editingZones, loadTariffs, setIsSaving, setMessage, setSelectedIndex, setNewTariff]);

  // Obtenir les indices uniques des tarifs existants
  const getIndices = useCallback(() => {
    // Extraire tous les indices et les convertir en nombres si possible
    const allIndices = tariffs.map(t => {
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
  }, [tariffs]);

  // Obtenir le tarif actuellement sélectionné
  const getCurrentTariff = useCallback(() => {
    if (selectedIndex === null) return null;
    if (selectedIndex === 'new') return newTariff;
    
    return tariffs.find(tariff => {
      // Convertir les deux valeurs en nombres si possible pour la comparaison
      const tariffIndex = typeof tariff.indice === 'string' && !isNaN(tariff.indice) 
        ? parseFloat(tariff.indice) 
        : tariff.indice;
      
      const currentIndex = typeof selectedIndex === 'string' && !isNaN(selectedIndex)
        ? parseFloat(selectedIndex)
        : selectedIndex;
        
      return tariffIndex === currentIndex;
    });
  }, [tariffs, selectedIndex, newTariff]);

  // Obtenir les tarifs personnalisés de l'agence
  const fetchAgencyTariffs = useCallback(async () => {
    try {
      const response = await apiService.get('/agence/list-tarifs');
      
      if (response.success) {
        // Essayer plusieurs chemins possibles pour les données
        const tarifs = response?.data?.tarifs ?? response?.tarifs ?? [];
        
        if (tarifs.length > 0) {
          // Mettre à jour uniquement les tarifs existants s'il y a des tarifs personnalisés
          setExistingTariffs(tarifs);
          
          // Si aucun tarif n'est sélectionné, sélectionner le premier
          if (selectedIndex === null) {
            setSelectedIndex(tarifs[0].indice);
            setEditingZones(JSON.parse(JSON.stringify(tarifs[0].prix_zones || [])));
          }
          return true; // Indique que des tarifs personnalisés ont été chargés
        }
        return false; // Aucun tarif personnalisé
      } else {
        console.error("Erreur lors du chargement des tarifs de l'agence :", response.message);
        setError(response.message || "Erreur lors du chargement des tarifs de l'agence");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tarifs de l'agence :", error);
      setError("Erreur lors du chargement des tarifs de l'agence");
      return false;
    }
  }, []);
  

  // Charger les tarifs au montage
useEffect(() => {
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const hasCustomTariffs = await fetchAgencyTariffs();

      // Charger les tarifs par défaut uniquement si nécessaire
      if (!hasCustomTariffs) {
        await loadTariffs(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement initial des tarifs:', error);
    } finally {
      setLoading(false);
    }
  };

  loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


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
    tariffs,
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
    loadTariffs,
    fetchAgencyTariffs
  };

  return (
    <TariffContext.Provider value={contextValue}>
      {children}
    </TariffContext.Provider>
  );
};

export default TariffProvider;
