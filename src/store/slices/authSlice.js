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
      // const token = localStorage.getItem("auth_token");

      // if (!token) {
      //   return rejectWithValue("No token found");
      // }

      // // Définir le token dans le service API
      // apiService.setAuthToken(token);

      // Récupérer le profil utilisateur
      const result = await authApi.getProfile();

      if (!result.success) {
        // Token invalide, supprimer
        localStorage.removeItem("auth_token");
        apiService.removeAuthToken();
        return rejectWithValue(result.message);
      }

      return result.data;
    } catch (error) {
      // En cas d'erreur, nettoyer le token
      localStorage.removeItem("auth_token");
      apiService.removeAuthToken();
      return rejectWithValue(error.message || "Session invalide");
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
const authSlice = createSlice({
  name: "auth",
  initialState: {
    currentUser: null,
    isAuthenticated: false,
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
        state.currentUser = action.payload.user || action.payload;
        state.message = "Connexion réussie";

        // Sauvegarder le token
        if (action.payload.token) {
          apiService.setAuthToken(action.payload.token);
          localStorage.setItem("auth_token", action.payload.token);
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
        state.currentUser = action.payload.user || action.payload;
        state.message = "Inscription réussie";

        // Sauvegarder le token
        if (action.payload.token) {
          apiService.setAuthToken(action.payload.token);
          localStorage.setItem("auth_token", action.payload.token);
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
        state.status = "idle";
        state.isAuthenticated = false;
        state.currentUser = null;
        state.message = "Déconnexion réussie";

        // Supprimer le token
        apiService.removeAuthToken();
        localStorage.removeItem("auth_token");
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;

        // Même en cas d'erreur, on déconnecte l'utilisateur
        state.isAuthenticated = false;
        state.currentUser = null;
        apiService.removeAuthToken();
        localStorage.removeItem("auth_token");
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
        state.status = "idle";
        state.error = null;
        state.isAuthenticated = false;
        state.currentUser = null;
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
