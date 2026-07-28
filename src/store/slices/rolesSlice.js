import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rolesApi } from '../../utils/api/roles';

export const fetchRoles = createAsyncThunk(
  'roles/fetch',
  async (_, { rejectWithValue }) => {
    const result = await rolesApi.listRoles();
    if (!result.success) return rejectWithValue(result.message);
    return result.roles;
  }
);

export const createRole = createAsyncThunk(
  'roles/create',
  async (data, { rejectWithValue }) => {
    const result = await rolesApi.createRole(data);
    if (!result.success) return rejectWithValue(result.message);
    return result.role;
  }
);

export const updateRole = createAsyncThunk(
  'roles/update',
  async ({ id, data }, { rejectWithValue }) => {
    const result = await rolesApi.updateRole(id, data);
    if (!result.success) return rejectWithValue(result.message);
    return result.role;
  }
);

export const deleteRole = createAsyncThunk(
  'roles/delete',
  async (id, { rejectWithValue }) => {
    const result = await rolesApi.deleteRole(id);
    if (!result.success) return rejectWithValue(result.message);
    return id;
  }
);

const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    isSaving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createRole.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isSaving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  },
});

export const selectRoles = (state) => state.roles.items;
export const selectRolesStatus = (state) => state.roles.status;

export default rolesSlice.reducer;
