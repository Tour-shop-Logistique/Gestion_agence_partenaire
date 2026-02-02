
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTarifs,
  fetchAgencyTarifs,
  fetchTarifsGroupage,
  fetchTarifGroupageAgence,
  createTarifGroupage,
  updateTarifGroupage,
  deleteTarifGroupage,
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
    groupageTarifs,
    existingGroupageTarifs,
    selectedIndex,
    editingZones,
    isSaving,
    loading,
    error,
    message
  } = useSelector(selectTarifsState);

  const currentTarifData = useSelector(selectCurrentTarif);

  // Actions encapsulées
  const fetchAllTarifs = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && tarifs && tarifs.length > 0) {
      return { success: true, data: tarifs };
    }
    try {
      return await dispatch(fetchTarifs()).unwrap();
    } catch (error) {
      console.error('Erreur lors de la récupération des tarifs:', error);
      return { success: false, error };
    }
  }, [dispatch, tarifs]);

  const fetchAgencyTarifsData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && existingTarifs && existingTarifs.length > 0) {
      return { success: true, data: existingTarifs };
    }
    try {
      return await dispatch(fetchAgencyTarifs(forceRefresh)).unwrap();
    } catch (error) {
      console.error("Erreur lors de la récupération des tarifs de l'agence:", error);
      return { success: false, error };
    }
  }, [dispatch, existingTarifs]);

  // === TARIFS GROUPAGE ===
  const fetchAllTarifsGroupageBase = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && groupageTarifs && groupageTarifs.length > 0) {
      return { success: true, data: groupageTarifs };
    }
    try {
      return await dispatch(fetchTarifsGroupage()).unwrap();
    } catch (error) {
      console.error("Erreur lors du chargement des tarifs groupage:", error);
      return { success: false, error };
    }
  }, [dispatch, groupageTarifs]);

  const fetchAgencyTarifsGroupage = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && existingGroupageTarifs && existingGroupageTarifs.length > 0) {
      return { success: true, data: existingGroupageTarifs };
    }
    try {
      return await dispatch(fetchTarifGroupageAgence()).unwrap();
    } catch (error) {
      console.error("Erreur lors du chargement des tarifs groupage agence:", error);
      return { success: false, error };
    }
  }, [dispatch, existingGroupageTarifs]);
  const saveGroupageTarifData = useCallback(async (payload) => {
    try {
      return await dispatch(createTarifGroupage(payload)).unwrap();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du tarif:', error);
      return { success: false, error };
    }
  }, [dispatch]);

  const updateGroupageTarifData = useCallback(
    async (id, payload) => {
      try {
        return await dispatch(updateTarifGroupage({ id, data: payload })).unwrap();
      } catch (error) {
        console.error("Erreur lors de la mise à jour du tarif:", error);
        return { success: false, error };
      }
    },
    [dispatch]
  );



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

  const deleteGroupageTarifData = useCallback(async (id) => {
    try {
      return await dispatch(deleteTarifGroupage(id)).unwrap();
    } catch (error) {
      console.error('Erreur lors de la suppression du tarif:', error);
      return { success: false, error };
    }
  }, [dispatch]);

  return {
    // État
    loading,
    error,
    message,
    tarifs,
    existingTarifs,
    groupageTarifs,
    existingGroupageTarifs,
    selectedIndex,
    editingZones,
    isSaving,

    // Actions
    fetchTarifs: fetchAllTarifs,
    fetchAgencyTarifs: fetchAgencyTarifsData,
    fetchTarifsGroupageBase: fetchAllTarifsGroupageBase,
    fetchTarifGroupageAgence: fetchAgencyTarifsGroupage,
    createTarifGroupage: saveGroupageTarifData,
    updateTarifGroupage: updateGroupageTarifData,
    deleteTarifGroupage: deleteGroupageTarifData,
    saveTarif: saveTarifData,
    selectIndex: selectTarifIndex,
    updateZonePercentage: updateZonePercentageValue,
    updateNewTarifZones: updateZones,
    clearMessage: clearMessageNotification,

    // Selecteurs
    getCurrentTarif,
    getIndices
  };
};
