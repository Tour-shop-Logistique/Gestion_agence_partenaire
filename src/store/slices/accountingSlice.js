import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../utils/apiService";
import { API_ENDPOINTS } from "../../utils/apiConfig";

/**
 * Thunk pour récupérer les données comptables
 */
export const fetchAccounting = createAsyncThunk(
  "accounting/fetchAccounting",
  async (params, { rejectWithValue }) => {
    try {
      const { date_debut, date_fin } = params || {};
      let url = API_ENDPOINTS.ACCOUNTING.GET_STATS;
      
      const queryParams = new URLSearchParams();
      if (date_debut) queryParams.append("date_debut", date_debut);
      if (date_fin) queryParams.append("date_fin", date_fin);
      
      const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
      
      const response = await apiService.get(fullUrl);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Une erreur est survenue");
    }
  }
);

const initialState = {
  data: [],
  summary: {
    count: 0,
    potential: {
      total_backoffice: 0,
      total_agence: 0,
      total_livreur: 0,
      total_client_due: 0,
      details_agence: {
        marge_prestation: 0,
        com_enlevement: 0,
        com_emballage: 0,
        com_livraison: 0,
        com_retard: 0
      }
    },
    real: {
      total_cash_received: 0,
      count_transactions: 0
    }
  },
  filters: {
    date_debut: "",
    date_fin: "",
    agence_id: ""
  },
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastFilters: null
};

const accountingSlice = createSlice({
  name: "accounting",
  initialState,
  reducers: {
    clearAccountingStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    resetAccountingFilters: (state) => {
      state.filters = initialState.filters;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounting.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchAccounting.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data || [];
        state.summary = action.payload.summary || initialState.summary;
        state.filters = action.payload.filters || state.filters;
        state.lastFilters = action.meta.arg;
        state.error = null;
      })
      .addCase(fetchAccounting.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearAccountingStatus, resetAccountingFilters } = accountingSlice.actions;

export default accountingSlice.reducer;
