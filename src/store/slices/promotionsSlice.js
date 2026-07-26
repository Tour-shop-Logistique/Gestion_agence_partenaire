import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { promotionsApi } from '../../utils/api/promotions';

export const fetchPromotions = createAsyncThunk(
  'promotions/fetch',
  async (_, { rejectWithValue }) => {
    const result = await promotionsApi.listPromotions();
    if (!result.success) return rejectWithValue(result.message);
    return result.promotions;
  }
);

export const createPromotion = createAsyncThunk(
  'promotions/create',
  async (data, { rejectWithValue }) => {
    const result = await promotionsApi.createPromotion(data);
    if (!result.success) return rejectWithValue(result.message);
    return result.promotion;
  }
);

export const updatePromotion = createAsyncThunk(
  'promotions/update',
  async ({ id, data }, { rejectWithValue }) => {
    const result = await promotionsApi.updatePromotion(id, data);
    if (!result.success) return rejectWithValue(result.message);
    return result.promotion;
  }
);

export const deletePromotion = createAsyncThunk(
  'promotions/delete',
  async (id, { rejectWithValue }) => {
    const result = await promotionsApi.deletePromotion(id);
    if (!result.success) return rejectWithValue(result.message);
    return id;
  }
);

const promotionsSlice = createSlice({
  name: 'promotions',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    isSaving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromotions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createPromotion.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.isSaving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const selectPromotions = (state) => state.promotions.items;
export const selectPromotionsStatus = (state) => state.promotions.status;

export default promotionsSlice.reducer;
