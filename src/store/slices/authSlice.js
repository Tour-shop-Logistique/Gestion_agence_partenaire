import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../utils/api/auth";
import { apiService } from "../../utils/apiService";

/**
 * Thunks asynchrones pour l'authentification
 */

// Vérifier et restaurer la session utilisateur
export const checkAuthState = createAsyncThunk(
  "auth/checkAuthState",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        return rejectWithValue("No token found");
      }

      // S'assurer que le token est présent dans le service API
      apiService.setAuthToken(token);

      // Récupérer le profil utilisateur pour valider le token
      const result = await authApi.getProfile();

      if (!result.success) {
        // On ne déconnecte que si c'est une erreur d'authentification (401/403)
        // ou si l'API nous dit explicitement que le token est invalide
        const isAuthError = result.error?.status === 401 || result.error?.status === 403;

        if (isAuthError) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          apiService.removeAuthToken();
          return rejectWithValue(result.message);
        }

        // Pour les autres erreurs (500, réseau, etc.), on garde la session locale
        // mais on rejette pour informer le composant
        return rejectWithValue({
          message: result.message,
          keepSession: true
        });
      }

      // Sauvegarder le profil mis à jour
      localStorage.setItem("auth_user", JSON.stringify(result.data));
      return result.data;
    } catch (error) {
      const isAuthError = error.status === 401 || error.status === 403;

      if (isAuthError) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        apiService.removeAuthToken();
      }

      return rejectWithValue({
        message: error.message || "Session invalide",
        keepSession: !isAuthError
      });
    }
  }
);

// Connexion
export const login = createAsyncThunk(
  "auth/login",
  async ({ telephone, password, type }, { rejectWithValue }) => {
    try {
      const result = await authApi.login(telephone, password, type);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || "Erreur lors de la connexion");
    }
  }
);

// Inscription
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const result = await authApi.register(userData);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || "Erreur lors de l'inscription");
    }
  }
);

// Déconnexion
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || "Erreur lors de la déconnexion");
    }
  }
);

// Récupérer le profil utilisateur
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const result = await authApi.getProfile();
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Erreur lors de la récupération du profil"
      );
    }
  }
);

/**
 * Slice Redux pour l'authentification
 */
const getInitialUser = () => {
  try {
    const user = localStorage.getItem("auth_user");
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    currentUser: getInitialUser(),
    isAuthenticated: !!localStorage.getItem("auth_token"),
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    message: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuth: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        const user = action.payload.user || action.payload;
        state.currentUser = user;
        state.message = "Connexion réussie";

        // Sauvegarder le token et l'utilisateur
        if (action.payload.token) {
          apiService.setAuthToken(action.payload.token);
          localStorage.setItem("auth_token", action.payload.token);
          localStorage.setItem("auth_user", JSON.stringify(user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        const user = action.payload.user || action.payload;
        state.currentUser = user;
        state.message = "Inscription réussie";

        // Sauvegarder le token et l'utilisateur
        if (action.payload.token) {
          apiService.setAuthToken(action.payload.token);
          localStorage.setItem("auth_token", action.payload.token);
          localStorage.setItem("auth_user", JSON.stringify(user));
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "succeeded";
        state.isAuthenticated = false;
        state.currentUser = null;
        state.message = "Déconnexion réussie";

        // Supprimer le token et l'utilisateur
        apiService.removeAuthToken();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;

        // Même en cas d'erreur, on déconnecte l'utilisateur
        state.isAuthenticated = false;
        state.currentUser = null;
        apiService.removeAuthToken();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
        state.currentUser = null;
      })

      // Check Auth State
      .addCase(checkAuthState.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        // On ne remet à zéro que si keepSession n'est pas vrai
        if (!action.payload?.keepSession) {
          state.isAuthenticated = false;
          state.currentUser = null;
          state.status = "idle";
        } else {
          // Si on garde la session, on marque l'état comme succeeded car 
          // on a quand même les infos locales
          state.status = "succeeded";
          state.error = action.payload.message;
        }
      });
  },
});

export const { clearErrors, clearMessage, setUser, clearAuth } =
  authSlice.actions;

// Sélecteurs
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthMessage = (state) => state.auth.message;

// Sélecteurs de rôles
export const selectIsAdmin = (state) => {
  const user = state.auth.currentUser;
  return (
    user?.role === "admin" ||
    user?.role === "is_agence_admin" ||
    user?.is_agence_admin === true
  );
};

export const selectIsAgent = (state) => {
  const user = state.auth.currentUser;
  return (
    user?.role === "agent" ||
    user?.role === "is_agence_member" ||
    user?.is_agence_member === true
  );
};

export const selectHasAgency = (state) => {
  const user = state.auth.currentUser;
  return !!user?.agence_id;
};

export default authSlice.reducer;
