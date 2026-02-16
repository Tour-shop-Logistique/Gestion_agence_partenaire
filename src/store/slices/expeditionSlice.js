import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { expeditionsApi } from "../../utils/api/expeditions";

/**
 * Thunks asynchrones
 */

// Créer une expédition
export const createExpedition = createAsyncThunk(
    "expedition/create",
    async (expeditionData, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.createExpedition(expeditionData);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return result.data;
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de la création");
        }
    }
);

// Lister les expéditions avec pagination et filtres
export const fetchExpeditions = createAsyncThunk(
    "expedition/fetchAll",
    async (params = { page: 1 }, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.listExpeditions(params);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return {
                data: result.data,
                meta: result.meta
            };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors du chargement");
        }
    }
);

// Récupérer les détails d'une expédition
export const fetchExpeditionById = createAsyncThunk(
    "expedition/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.getExpedition(id);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return result.data;
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors du chargement des détails");
        }
    }
);

// Simuler une expédition
export const simulateExpedition = createAsyncThunk(
    "expedition/simulate",
    async (expeditionData, { rejectWithValue }) => {
        console.log("Simulation data:", expeditionData);
        try {
            const result = await expeditionsApi.simulateExpedition(expeditionData);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return result.data;
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de la simulation");
        }
    }
);

// Lister tous les colis avec pagination et filtres
export const fetchColis = createAsyncThunk(
    "expedition/fetchColis",
    async (params = { page: 1 }, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.listColis(params);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return {
                data: result.data,
                meta: result.meta
            };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors du chargement des colis");
        }
    }
);

const expeditionSlice = createSlice({
    name: "expedition",
    initialState: {
        expeditions: [],
        colis: [],
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0
        },
        colisMeta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0
        },
        currentExpedition: null,
        simulationResult: null,
        simulationStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        message: null,
        lastFilters: null,
        lastColisFilters: null,
    },
    reducers: {
        clearExpeditionStatus: (state) => {
            state.status = "idle";
            state.colisStatus = "idle";
            state.simulationStatus = "idle";
            state.error = null;
            state.message = null;
        },
        clearSimulation: (state) => {
            state.simulationResult = null;
            state.simulationStatus = "idle";
        },
        setCurrentExpedition: (state, action) => {
            state.currentExpedition = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Expedition
            .addCase(createExpedition.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(createExpedition.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = "Expédition créée avec succès";
                // Handle different response structures
                // action.payload could be the expedition directly, or nested in data
                const expeditionData = action.payload?.expedition || action.payload?.data || action.payload;
                console.log("Expedition data in fulfilled:", expeditionData);
                state.currentExpedition = expeditionData;
                state.simulationResult = null; // Clear simulation on success
            })
            .addCase(createExpedition.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Simulate Expedition
            .addCase(simulateExpedition.pending, (state) => {
                state.simulationStatus = "loading";
                state.error = null;
            })
            .addCase(simulateExpedition.fulfilled, (state, action) => {
                state.simulationStatus = "succeeded";
                state.simulationResult = action.payload;
            })
            .addCase(simulateExpedition.rejected, (state, action) => {
                state.simulationStatus = "failed";
                state.error = action.payload;
            })

            // Fetch Expeditions
            .addCase(fetchExpeditions.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchExpeditions.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.expeditions = action.payload.data;
                state.meta = action.payload.meta || state.meta;
                state.lastFilters = action.meta.arg; // The params passed to the thunk
            })
            .addCase(fetchExpeditions.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Fetch Colis
            .addCase(fetchColis.pending, (state) => {
                state.colisStatus = "loading";
                state.error = null;
            })
            .addCase(fetchColis.fulfilled, (state, action) => {
                state.colisStatus = "succeeded";
                state.colis = action.payload.data;
                state.colisMeta = action.payload.meta || state.colisMeta;
                state.lastColisFilters = action.meta.arg;
            })
            .addCase(fetchColis.rejected, (state, action) => {
                state.colisStatus = "failed";
                state.error = action.payload;
            })

            // Fetch Expedition Details
            .addCase(fetchExpeditionById.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchExpeditionById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.currentExpedition = action.payload;
            })
            .addCase(fetchExpeditionById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearExpeditionStatus, setCurrentExpedition, clearSimulation } = expeditionSlice.actions;

export default expeditionSlice.reducer;
