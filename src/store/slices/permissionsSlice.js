import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { permissionsApi } from '../../utils/api/permissions';

export const fetchAvailablePermissions = createAsyncThunk(
  'permissions/fetchAvailable',
  async (_, { rejectWithValue }) => {
    const result = await permissionsApi.listAvailablePermissions();
    if (!result.success) return rejectWithValue(result.message);
    return result.resources;
  }
);

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState: {
    resources: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailablePermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailablePermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasLoaded = true;
        state.resources = action.payload;
      })
      .addCase(fetchAvailablePermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const selectAvailablePermissions = (state) => state.permissions.resources;
export const selectPermissionsLoading = (state) => state.permissions.isLoading;
export const selectPermissionsHasLoaded = (state) => state.permissions.hasLoaded;

export default permissionsSlice.reducer;
