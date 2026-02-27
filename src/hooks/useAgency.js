
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  setupAgency,
  fetchAgency,
  updateAgency,
  uploadLogo,
  fetchUsers,
  createUser,
  editUser,
  deleteUser,
  toggleUserStatus,
  clearError,
  selectAgency,
  selectAgencyStatus,
  selectAgencyError,
  selectAgencyUsers,
  selectUsersStatus,
  selectUsersError
} from '../store/slices/agencySlice';

/**
 * Hook personnalisé pour gérer l'agence avec Redux
 * Conforme au slice agencySlice
 */
export const useAgency = () => {
  const dispatch = useDispatch();

  // Sélecteurs d'état depuis le slice
  const agencyData = useSelector(selectAgency);
  const status = useSelector(selectAgencyStatus);
  const error = useSelector(selectAgencyError);
  const users = useSelector(selectAgencyUsers);
  const usersStatus = useSelector(selectUsersStatus);
  const usersError = useSelector(selectUsersError);

  // États dérivés pour l'agence
  const loading = status === 'loading';
  const isIdle = status === 'idle';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // États dérivés pour les utilisateurs
  const usersLoading = usersStatus === 'loading';
  const usersIsIdle = usersStatus === 'idle';
  const usersIsSuccess = usersStatus === 'succeeded';
  const usersIsError = usersStatus === 'failed';

  // Actions pour l'agence
  const setupAgencyData = useCallback((agencyData) => {
    return dispatch(setupAgency(agencyData));
  }, [dispatch]);

  const fetchAgencyData = useCallback((forceRefresh = false) => {
    return dispatch(fetchAgency());
  }, [dispatch]);

  const updateAgencyData = useCallback((agencyData) => {
    return dispatch(updateAgency(agencyData));
  }, [dispatch]);

  const uploadAgencyLogo = useCallback((logoFile) => {
    return dispatch(uploadLogo(logoFile));
  }, [dispatch]);

  // Actions pour les utilisateurs
  const fetchAgencyUsers = useCallback((forceRefresh = false) => {
    return dispatch(fetchUsers());
  }, [dispatch]);

  const createAgencyUser = useCallback((userData) => {
    return dispatch(createUser(userData));
  }, [dispatch]);

  const editAgencyUser = useCallback((userId, userData) => {
    return dispatch(editUser({ userId, userData }));
  }, [dispatch]);

  const deleteAgencyUser = useCallback((userId) => {
    return dispatch(deleteUser(userId));
  }, [dispatch]);

  const toggleAgencyUserStatus = useCallback((userId) => {
    return dispatch(toggleUserStatus(userId));
  }, [dispatch]);

  // Action pour nettoyer les erreurs
  const clearAgencyError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // État de l'agence
    data: agencyData,
    status,
    error,
    loading,
    isIdle,
    isSuccess,
    isError,

    // État des utilisateurs
    users,
    usersStatus,
    usersError,
    usersLoading,
    usersIsIdle,
    usersIsSuccess,
    usersIsError,

    // Actions de l'agence
    setupAgency: setupAgencyData,
    fetchAgencyData,
    updateAgencyData,
    uploadLogo: uploadAgencyLogo,

    // Actions des utilisateurs
    fetchUsers: fetchAgencyUsers,
    createUser: createAgencyUser,
    editUser: editAgencyUser,
    deleteUser: deleteAgencyUser,
    toggleUserStatus: toggleAgencyUserStatus,

    // Utilitaires
    clearError: clearAgencyError,
    dispatch
  };
};
