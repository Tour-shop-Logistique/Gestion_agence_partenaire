import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAccounting, clearAccountingStatus, resetAccountingFilters } from "../store/slices/accountingSlice";

/**
 * Hook personnalisé pour gérer la comptabilité
 */
export const useAccounting = () => {
  const dispatch = useDispatch();

  // Sélecteurs de l'état
  const {
    data,
    summary,
    filters,
    status,
    error,
    lastFilters
  } = useSelector((state) => state.accounting);

  // Actions
  const loadAccounting = useCallback(
    (params = {}, forceRefresh = false) => {
      // Si on est déjà en cours de chargement, on ne relance pas l'appel (sauf forceRefresh)
      if (!forceRefresh && status === "loading") {
        return;
      }

      // Optimisation : ne pas recharger si les mêmes filtres et qu'on a déjà réussi
      const isSameParams =
        lastFilters &&
        params.date_debut === lastFilters.date_debut &&
        params.date_fin === lastFilters.date_fin;

      if (!forceRefresh && isSameParams && status === "succeeded") {
        return;
      }
      return dispatch(fetchAccounting(params));
    },
    [dispatch, lastFilters, status]
  );

  const resetStatus = useCallback(() => dispatch(clearAccountingStatus()), [dispatch]);
  const resetFilters = useCallback(() => dispatch(resetAccountingFilters()), [dispatch]);

  return {
    // État
    data,
    summary,
    filters,
    status,
    error,
    lastFilters,
    loading: status === "loading",
    
    // Actions
    loadAccounting,
    resetStatus,
    resetFilters
  };
};
