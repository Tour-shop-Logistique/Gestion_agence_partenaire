import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paiementsApi } from '../../utils/api/paiements';

export const fetchMoyensPaiement = createAsyncThunk(
  'paiements/fetchMoyens',
  async (_, { rejectWithValue }) => {
    const result = await paiementsApi.listMoyensPaiement();
    if (!result.success) return rejectWithValue(result.message);
    return result.moyensPaiement;
  }
);

export const createMoyenPaiement = createAsyncThunk(
  'paiements/createMoyen',
  async (data, { rejectWithValue }) => {
    const result = await paiementsApi.createMoyenPaiement(data);
    if (!result.success) return rejectWithValue(result.message);
    return result.moyenPaiement;
  }
);

export const updateMoyenPaiement = createAsyncThunk(
  'paiements/updateMoyen',
  async ({ id, data }, { rejectWithValue }) => {
    const result = await paiementsApi.updateMoyenPaiement(id, data);
    if (!result.success) return rejectWithValue(result.message);
    return result.moyenPaiement;
  }
);

export const deleteMoyenPaiement = createAsyncThunk(
  'paiements/deleteMoyen',
  async (id, { rejectWithValue }) => {
    const result = await paiementsApi.deleteMoyenPaiement(id);
    if (!result.success) return rejectWithValue(result.message);
    return id;
  }
);

export const fetchPreuvesExpedition = createAsyncThunk(
  'paiements/fetchPreuves',
  async (expeditionId, { rejectWithValue }) => {
    const result = await paiementsApi.listPreuvesParExpedition(expeditionId);
    if (!result.success) return rejectWithValue(result.message);
    return { expeditionId, preuves: result.preuves };
  }
);

export const deciderPreuve = createAsyncThunk(
  'paiements/deciderPreuve',
  async ({ id, action, motifRejet }, { rejectWithValue }) => {
    const result = await paiementsApi.deciderPreuve(id, action, motifRejet);
    if (!result.success) return rejectWithValue(result.message);
    return { preuve: result.preuve, message: result.message };
  }
);

export const payerLivreur = createAsyncThunk(
  'paiements/payerLivreur',
  async (params, { rejectWithValue }) => {
    const result = await paiementsApi.payerLivreur(params);
    if (!result.success) return rejectWithValue(result.message);
    return { preuve: result.preuve, message: result.message };
  }
);

export const fetchFluxFinanciers = createAsyncThunk(
  'paiements/fetchFlux',
  async (params, { rejectWithValue }) => {
    const result = await paiementsApi.listFluxFinanciers(params);
    if (!result.success) return rejectWithValue(result.message);
    return result.flux;
  }
);

export const payerFlux = createAsyncThunk(
  'paiements/payerFlux',
  async (params, { rejectWithValue }) => {
    const result = await paiementsApi.payerFlux(params);
    if (!result.success) return rejectWithValue(result.message);
    return { flux: result.flux, message: result.message };
  }
);

const paiementsSlice = createSlice({
  name: 'paiements',
  initialState: {
    moyensPaiement: [],
    moyensStatus: 'idle',
    // Preuves de l'expédition actuellement consultée uniquement : ce
    // panneau est toujours rouvert depuis le détail d'une expédition, pas
    // besoin de conserver un cache par expédition.
    preuves: [],
    preuvesExpeditionId: null,
    preuvesStatus: 'idle',
    flux: [],
    fluxStatus: 'idle',
    isSaving: false,
    message: null,
    error: null,
  },
  reducers: {
    resetPaiementsStatus: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMoyensPaiement.pending, (state) => {
        state.moyensStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchMoyensPaiement.fulfilled, (state, action) => {
        state.moyensStatus = 'succeeded';
        state.moyensPaiement = action.payload;
      })
      .addCase(fetchMoyensPaiement.rejected, (state, action) => {
        state.moyensStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(createMoyenPaiement.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createMoyenPaiement.fulfilled, (state, action) => {
        state.isSaving = false;
        state.moyensPaiement.unshift(action.payload);
        state.message = 'Moyen de paiement ajouté.';
      })
      .addCase(createMoyenPaiement.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      .addCase(updateMoyenPaiement.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateMoyenPaiement.fulfilled, (state, action) => {
        state.isSaving = false;
        const idx = state.moyensPaiement.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.moyensPaiement[idx] = action.payload;
        state.message = 'Moyen de paiement mis à jour.';
      })
      .addCase(updateMoyenPaiement.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      .addCase(deleteMoyenPaiement.fulfilled, (state, action) => {
        state.moyensPaiement = state.moyensPaiement.filter((m) => m.id !== action.payload);
        state.message = 'Moyen de paiement supprimé.';
      })
      .addCase(deleteMoyenPaiement.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchPreuvesExpedition.pending, (state) => {
        state.preuvesStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchPreuvesExpedition.fulfilled, (state, action) => {
        state.preuvesStatus = 'succeeded';
        state.preuves = action.payload.preuves;
        state.preuvesExpeditionId = action.payload.expeditionId;
      })
      .addCase(fetchPreuvesExpedition.rejected, (state, action) => {
        state.preuvesStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(deciderPreuve.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deciderPreuve.fulfilled, (state, action) => {
        state.isSaving = false;
        const idx = state.preuves.findIndex((p) => p.id === action.payload.preuve?.id);
        if (idx !== -1) state.preuves[idx] = { ...state.preuves[idx], ...action.payload.preuve };
        state.message = action.payload.message;
      })
      .addCase(deciderPreuve.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      .addCase(payerLivreur.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(payerLivreur.fulfilled, (state, action) => {
        state.isSaving = false;
        state.message = action.payload.message;
      })
      .addCase(payerLivreur.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      .addCase(fetchFluxFinanciers.pending, (state) => {
        state.fluxStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchFluxFinanciers.fulfilled, (state, action) => {
        state.fluxStatus = 'succeeded';
        state.flux = action.payload;
      })
      .addCase(fetchFluxFinanciers.rejected, (state, action) => {
        state.fluxStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(payerFlux.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(payerFlux.fulfilled, (state, action) => {
        state.isSaving = false;
        const idx = state.flux.findIndex((f) => f.id === action.payload.flux?.id);
        if (idx !== -1) state.flux[idx] = { ...state.flux[idx], ...action.payload.flux };
        state.message = action.payload.message;
      })
      .addCase(payerFlux.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });
  },
});

export const { resetPaiementsStatus } = paiementsSlice.actions;

export const selectMoyensPaiement = (state) => state.paiements.moyensPaiement;
export const selectPreuvesPaiement = (state) => state.paiements.preuves;
export const selectFluxFinanciers = (state) => state.paiements.flux;

export default paiementsSlice.reducer;
