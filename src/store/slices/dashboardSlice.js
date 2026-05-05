import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardData } from '../../utils/api/dashboard';

// Thunk pour récupérer les données du dashboard
export const loadDashboardData = createAsyncThunk(
    'dashboard/loadData',
    async (silentRefresh = false, { rejectWithValue }) => {
        try {
            const response = await fetchDashboardData();
            return { data: response.data, silentRefresh };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement du dashboard');
        }
    }
);

const initialState = {
    operational: {
        colis_attente_reception_depart: 0,
        colis_attente_expedition_entrepot: 0,
        colis_en_transit_vers_agence: 0,
        colis_recus_aujourdhui: 0,
        colis_attente_retrait_livraison: 0,
        expeditions_creees_aujourdhui: 0,
        expeditions_attente_acceptation: 0
    },
    financial: {
        chiffre_affaires_mois: 0,
        statut_paiements: {
            paye: 0,
            impaye: 0
        },
        encours_a_recouvrer: 0,
        commissions_mois: 0
    },
    logistics: {
        top_destinations: [],
        volume_par_type: [],
        dernieres_expeditions: []
    },
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    isRefreshing: false, // Pour le rechargement silencieux
    error: null,
    lastUpdated: null
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadDashboardData.pending, (state, action) => {
                const silentRefresh = action.meta.arg;
                if (silentRefresh) {
                    // Rechargement silencieux : on garde le status actuel et on active isRefreshing
                    state.isRefreshing = true;
                } else {
                    // Chargement normal : on met le status à loading
                    state.status = 'loading';
                }
                state.error = null;
            })
            .addCase(loadDashboardData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isRefreshing = false;
                state.operational = action.payload.data.operational || initialState.operational;
                state.financial = action.payload.data.financial || initialState.financial;
                state.logistics = action.payload.data.logistics || initialState.logistics;
                state.lastUpdated = new Date().toISOString();
                state.error = null;
            })
            .addCase(loadDashboardData.rejected, (state, action) => {
                state.status = 'failed';
                state.isRefreshing = false;
                state.error = action.payload || 'Une erreur est survenue';
            });
    }
});

export const { clearDashboardError } = dashboardSlice.actions;

// Sélecteurs
export const selectDashboardState = (state) => state.dashboard;
export const selectOperationalData = (state) => state.dashboard.operational;
export const selectFinancialData = (state) => state.dashboard.financial;
export const selectLogisticsData = (state) => state.dashboard.logistics;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectIsRefreshing = (state) => state.dashboard.isRefreshing;

export default dashboardSlice.reducer;
