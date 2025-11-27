
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import agencyReducer from './slices/agencySlice';
import tarifsReducer from './slices/tarifsSlice';

/**
 * Configuration du store Redux
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    agency: agencyReducer,
    tarifs: tarifsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer ces chemins pour les vérifications de sérialisation
        ignoredActions: ['auth/login/fulfilled'],
        ignoredPaths: ['auth.currentUser'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
