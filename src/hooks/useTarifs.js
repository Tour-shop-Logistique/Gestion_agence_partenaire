
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTarifs,
  fetchAgencyTarifs,
  saveTarif,
  selectIndex,
  updateZonePercentage,
  updateNewTarifZones,
  selectTarifsState,
  selectCurrentTarif,
  clearMessage
} from '../store/slices/tarifsSlice';

export const useTarifs = () => {
  const dispatch = useDispatch();
  
  // Sélecteurs Redux
  const {
    tarifs,
    existingTarifs,
    selectedIndex,
    editingZones,
    isSaving,
    loading,
    error,
    message
  } = useSelector(selectTarifsState);
  
  const currentTarifData = useSelector(selectCurrentTarif);
  
  // Actions encapsulées
  const fetchAllTarifs = useCallback(async () => {
    try {
      return await dispatch(fetchTarifs()).unwrap();
    } catch (error) {
      console.error('Erreur lors de la récupération des tarifs:', error);
      return { success: false, error };
    }
  }, [dispatch]);
  
  const fetchAgencyTarifsData = useCallback(async (forceRefresh = false) => {
    try {
      return await dispatch(fetchAgencyTarifs(forceRefresh)).unwrap();
    } catch (error) {
      console.error("Erreur lors de la récupération des tarifs de l'agence:", error);
      return { success: false, error };
    }
  }, [dispatch]);
  
  const saveTarifData = useCallback(async () => {
    try {
      return await dispatch(saveTarif()).unwrap();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du tarif:', error);
      return { success: false, error };
    }
  }, [dispatch]);
  
  const selectTarifIndex = useCallback((index) => {
    dispatch(selectIndex(index));
  }, [dispatch]);
  
  const updateZonePercentageValue = useCallback((zoneId, percentage) => {
    dispatch(updateZonePercentage({ zoneId, percentage }));
  }, [dispatch]);
  
  const updateZones = useCallback((zones) => {
    dispatch(updateNewTarifZones(zones));
  }, [dispatch]);
  
  const clearMessageNotification = useCallback(() => {
    dispatch(clearMessage());
  }, [dispatch]);
  
  const getCurrentTarif = useCallback(() => {
    return currentTarifData;
  }, [currentTarifData]);
  
  const getIndices = useCallback(() => {
    if (!tarifs || !Array.isArray(tarifs)) return [];
    
    return tarifs
      .filter(tarif => tarif?.indice)
      .map(tarif => ({
        value: tarif.indice,
        label: `Indice ${tarif.indice}`
      }));
  }, [tarifs]);
  
  return {
    // État
    loading,
    error,
    message,
    tarifs,
    existingTarifs,
    selectedIndex,
    editingZones,
    isSaving,
    
    // Actions
    fetchTarifs: fetchAllTarifs,
    fetchAgencyTarifs: fetchAgencyTarifsData,
    saveTarif: saveTarifData,
    selectIndex: selectTarifIndex,
    updateZonePercentage: updateZonePercentageValue,
    updateNewTarifZones: updateZones,
    clearMessage: clearMessageNotification,
    
    // Sélecteurs
    getCurrentTarif,
    getIndices
  };
};
