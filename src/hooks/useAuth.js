import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  login,
  register,
  logout,
  fetchUserProfile,
  checkAuthState,
  // updateProfile,
  // changePassword,
  clearErrors,
  clearMessage,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
  selectAuthMessage,
  selectIsAdmin,
  selectIsAgent,
  selectHasAgency
} from '../store/slices/authSlice';

/**
 * Hook personnalisé pour gérer l'authentification avec Redux
 */
export const useAuth = () => {
  const dispatch = useDispatch();

  // Sélecteurs d'état
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);
  const isAdmin = useSelector(selectIsAdmin);
  const isAgent = useSelector(selectIsAgent);
  const hasAgency = useSelector(selectHasAgency);

  // Actions encapsulées
  const loginUser = useCallback(async (credentials) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  const registerUser = useCallback(async (userData) => {
    try {
      const result = await dispatch(register(userData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  const logoutUser = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && currentUser) {
      return { success: true, data: currentUser };
    }
    try {
      const result = await dispatch(fetchUserProfile()).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch, currentUser]);

  const checkAuth = useCallback(async () => {
    try {
      const result = await dispatch(checkAuthState()).unwrap();

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);


  const clearAuthErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearAuthMessage = useCallback(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  // Vérifications d'autorisation

  const checkIsAdmin = useCallback(() => {
    return isAdmin;
  }, [isAdmin]);

  const checkIsAgent = useCallback(() => {
    return isAgent;
  }, [isAgent]);

  const checkHasAgency = useCallback(() => {
    return hasAgency;
  }, [hasAgency]);

  return {
    // État
    currentUser,
    isAuthenticated,
    status,
    error,
    message,
    isLoading: status === 'loading',

    // Actions
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    fetchProfile,
    checkAuth,
    // updateProfile: updateUserProfile,
    // changePassword: changeUserPassword,
    clearErrors: clearAuthErrors,
    clearMessage: clearAuthMessage,

    // Vérifications d'autorisation
    isAdmin: checkIsAdmin(),
    isAgent: checkIsAgent(),
    hasAgency: checkHasAgency()
  };
};