import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import agencyReducer from './slices/agencySlice';
import tarifsReducer from './slices/tarifsSlice';
import expeditionReducer from './slices/expeditionSlice';
import productReducer from './slices/productSlice';

/**
 * Root Reducer avec logique de reset
 */
const appReducer = combineReducers({
  auth: authReducer,
  agency: agencyReducer,
  tarifs: tarifsReducer,
  expedition: expeditionReducer,
  products: productReducer,
});

const rootReducer = (state, action) => {
  // Détecter la déconnexion (fulfilled ou rejected car on nettoie dans les deux cas dans authSlice)
  if (action.type === 'auth/logout/fulfilled' || action.type === 'auth/logout/rejected') {
    // Réinitialiser tout le state à undefined force Redux à utiliser les initialState de chaque slice
    state = undefined;
  }
  return appReducer(state, action);
};

/**
 * Configuration du store Redux
 */
export const store = configureStore({
  reducer: rootReducer,
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
