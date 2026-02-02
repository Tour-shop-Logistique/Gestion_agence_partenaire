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

// Lister les expéditions avec pagination
export const fetchExpeditions = createAsyncThunk(
    "expedition/fetchAll",
    async (page = 1, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.listExpeditions(page);
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

const expeditionSlice = createSlice({
    name: "expedition",
    initialState: {
        expeditions: [],
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0
        },
        currentExpedition: null,
        status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        message: null,
    },
    reducers: {
        clearExpeditionStatus: (state) => {
            state.status = "idle";
            state.error = null;
            state.message = null;
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
                // Optionnel : ajouter à la liste locale si besoin
            })
            .addCase(createExpedition.rejected, (state, action) => {
                state.status = "failed";
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
            })
            .addCase(fetchExpeditions.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearExpeditionStatus, setCurrentExpedition } = expeditionSlice.actions;

export default expeditionSlice.reducer;
