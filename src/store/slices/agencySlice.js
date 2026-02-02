
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { agenciesApi } from '../../utils/api/agencies';

/**
 * Thunks asynchrones pour les agences
 */

// Configuration initiale de l'agence
export const setupAgency = createAsyncThunk(
  'agency/setup',
  async (agencyData, { rejectWithValue }) => {
    try {
      const result = await agenciesApi.setupAgency(agencyData);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la configuration');
    }
  }
);

// Récupérer les informations de l'agence
export const fetchAgency = createAsyncThunk(
  'agency/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const result = await agenciesApi.getAgency();
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération');
    }
  }
);

// Mettre à jour l'agence
export const updateAgency = createAsyncThunk(
  'agency/update',
  async (agencyData, { rejectWithValue }) => {
    try {
      const result = await agenciesApi.updateAgency(agencyData);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la mise à jour');
    }
  }
);

// Uploader le logo
export const uploadLogo = createAsyncThunk(
  'agency/uploadLogo',
  // async (logoFile, { rejectWithValue }) => {
  //   try {
  //     const result = await agenciesApi.uploadLogo(logoFile);
  //     if (!result.success) {
  //       return rejectWithValue(result.message);
  //     }
  //     return result.data;
  //   } catch (error) {
  //     return rejectWithValue(error.message || "Erreur lors de l'upload du logo");
  //   }
  // }
);

// Récupérer la liste des utilisateurs
export const fetchUsers = createAsyncThunk(
  'agency/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const result = await agenciesApi.listUsers();
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération des utilisateurs');
    }
  }
);

// Créer un utilisateur
export const createUser = createAsyncThunk(
  'agency/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await agenciesApi.createUser(userData);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || "Erreur lors de la création de l'utilisateur");
    }
  }
);

// Modifier un utilisateur
export const editUser = createAsyncThunk(
  'agency/editUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const result = await agenciesApi.editUser(userId, userData);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || "Erreur lors de la modification de l'utilisateur");
    }
  }
);

// Supprimer un utilisateur
export const deleteUser = createAsyncThunk(
  'agency/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await agenciesApi.deleteUser(userId);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || "Erreur lors de la suppression de l'utilisateur");
    }
  }
);

// Changer le statut d'un utilisateur
export const toggleUserStatus = createAsyncThunk(
  'agency/toggleUserStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await agenciesApi.toggleUserStatus(userId);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors du changement de statut');
    }
  }
);

const initialState = {
  data: null,
  users: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  usersStatus: 'idle',
  error: null,
  usersError: null,
};

const agencySlice = createSlice({
  name: 'agency',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.usersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Setup Agency
      .addCase(setupAgency.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(setupAgency.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(setupAgency.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Agency Data
      .addCase(fetchAgency.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAgency.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        // Sauvegarder les données de l'agence en localStorage
        if (action.payload) {
          localStorage.setItem('agencyData', JSON.stringify(action.payload));
        }
      })
      .addCase(fetchAgency.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update Agency Data
      .addCase(updateAgency.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAgency.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(updateAgency.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Upload Logo
      .addCase(uploadLogo.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadLogo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.data) {
          state.data.logo = action.payload.logo;
        }
      })
      .addCase(uploadLogo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersStatus = 'loading';
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded';
        state.users = action.payload.users || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.usersError = action.payload;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.usersStatus = 'loading';
        state.usersError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded';
        state.users.push(action.payload.user || action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.usersError = action.payload;
      })

      // Edit User
      .addCase(editUser.pending, (state) => {
        state.usersError = null;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded';
        const index = state.users.findIndex(u => u.id === action.payload.user.id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })
      .addCase(editUser.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.usersError = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.usersError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded';
        // Supprimer l'utilisateur de la liste
        state.users = state.users.filter(u => u.id !== action.payload.user?.id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.usersError = action.payload;
      })

      // Toggle User Status
      .addCase(toggleUserStatus.pending, (state) => {
        state.usersError = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded';
        const index = state.users.findIndex(u => u.id === action.payload.user.id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.usersError = action.payload;
      });
  },
});

export const { clearError } = agencySlice.actions;

// Sélecteurs
export const selectAgency = (state) => state.agency.data;
export const selectAgencyStatus = (state) => state.agency.status;
export const selectAgencyError = (state) => state.agency.error;
export const selectAgencyUsers = (state) => state.agency.users;
export const selectUsersStatus = (state) => state.agency.usersStatus;
export const selectUsersError = (state) => state.agency.usersError;

export default agencySlice.reducer;

