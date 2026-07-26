import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { facturesApi } from '../../utils/api/factures';

export const fetchFactureForExpedition = createAsyncThunk(
  'factures/fetchForExpedition',
  async (expeditionId, { rejectWithValue }) => {
    const result = await facturesApi.fetchForExpedition(expeditionId);
    if (!result.success) return rejectWithValue(result.message);
    return { expeditionId, facture: result.facture };
  }
);

export const generateFacture = createAsyncThunk(
  'factures/generate',
  async (expeditionId, { rejectWithValue }) => {
    const result = await facturesApi.generateFacture(expeditionId);
    if (!result.success) return rejectWithValue(result.message);
    return { expeditionId, facture: result.facture };
  }
);

export const updateFactureStatut = createAsyncThunk(
  'factures/updateStatut',
  async ({ id, statut }, { rejectWithValue }) => {
    const result = await facturesApi.updateStatut(id, statut);
    if (!result.success) return rejectWithValue(result.message);
    return result.facture;
  }
);

export const sendFactureEmail = createAsyncThunk(
  'factures/sendEmail',
  async ({ id, email }, { rejectWithValue }) => {
    const result = await facturesApi.sendEmail(id, email);
    if (!result.success) return rejectWithValue(result.message);
    return result.message;
  }
);

const factureSlice = createSlice({
  name: 'factures',
  initialState: {
    // Facture courante par expedition_id : { [expeditionId]: Facture | null }
    byExpedition: {},
    isLoading: false,
    isGenerating: false,
    isSending: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFactureForExpedition.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFactureForExpedition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.byExpedition[action.payload.expeditionId] = action.payload.facture;
      })
      .addCase(fetchFactureForExpedition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(generateFacture.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateFacture.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.byExpedition[action.payload.expeditionId] = action.payload.facture;
      })
      .addCase(generateFacture.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
      })
      .addCase(updateFactureStatut.fulfilled, (state, action) => {
        const facture = action.payload;
        const expeditionId = facture.expedition_id;
        if (state.byExpedition[expeditionId]) {
          state.byExpedition[expeditionId] = facture;
        }
      })
      .addCase(sendFactureEmail.pending, (state) => {
        state.isSending = true;
      })
      .addCase(sendFactureEmail.fulfilled, (state) => {
        state.isSending = false;
      })
      .addCase(sendFactureEmail.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      });
  },
});

export default factureSlice.reducer;
