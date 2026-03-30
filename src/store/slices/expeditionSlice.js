import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { expeditionsApi } from "../../utils/api/expeditions";
import { agenciesApi } from "../../utils/api/agencies";

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

// Lister les demandes clients
export const fetchDemandesClients = createAsyncThunk(
    "expedition/fetchDemandes",
    async (params = { page: 1 }, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.listDemandes(params);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return {
                data: result.data,
                meta: result.meta
            };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors du chargement des demandes");
        }
    }
);

// Accepter une demande client
export const acceptDemandeClient = createAsyncThunk(
    "expedition/acceptDemande",
    async (id, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.acceptDemande(id);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return { id, message: result.message };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de l'acceptation");
        }
    }
);

// Refuser une demande client
export const refuseDemandeClient = createAsyncThunk(
    "expedition/refuseDemande",
    async ({ id, data = {} }, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.refuseDemande(id, data);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return { id, message: result.message };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors du refus");
        }
    }
);

// Confirmer la réception départ
export const confirmExpeditionReception = createAsyncThunk(
    "expedition/confirmReception",
    async (id, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.confirmReception(id);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return { id, message: result.message };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de la confirmation");
        }
    }
);

// Marquer des colis comme reçus au départ
export const receiveColisDepart = createAsyncThunk(
    "expedition/receiveColisDepart",
    async (codes, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.receiveColisDepart(codes);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return { codes, message: result.message };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de la réception des colis");
        }
    }
);

// Lister les expéditions à réceptionner
export const fetchExpeditionsReception = createAsyncThunk(
    "expedition/fetchReception",
    async (params = { page: 1 }, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.listExpeditionsReception(params);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return {
                data: result.data,
                meta: result.meta
            };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de la récupération des expéditions à réceptionner");
        }
    }
);

// Marquer des colis comme reçus à destination
export const receiveColisDestination = createAsyncThunk(
    "expedition/receiveColisDestination",
    async (codes, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.receiveColisDestination(codes);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return { codes, message: result.message };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de la réception des colis à destination");
        }
    }
);

// Envoyer des colis à l'entrepôt
export const sendColisToEntrepot = createAsyncThunk(
    "expedition/sendColisToEntrepot",
    async (codes, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.sendColisToEntrepot(codes);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return { codes, message: result.message };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de l'envoi vers l'entrepôt");
        }
    }
);

// Initier le retrait client
export const initiateRecupColis = createAsyncThunk(
    "expedition/initiateRecup",
    async (codes, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.initiateRecupColis(codes);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return { codes, message: result.message };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de l'envoi du code");
        }
    }
);

// Vérifier le retrait client
export const verifyRecupColis = createAsyncThunk(
    "expedition/verifyRecup",
    async ({ codes, otp, statut_paiement }, { rejectWithValue }) => {
        try {
            const result = await expeditionsApi.verifyRecupColis(codes, otp, statut_paiement);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return { codes, message: result.message };
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de la validation");
        }
    }
);

// Enregistrer une transaction
export const recordTransaction = createAsyncThunk(
    "expedition/recordTransaction",
    async (transactionData, { rejectWithValue }) => {
        try {
            const result = await agenciesApi.recordTransaction(transactionData);
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return result.data;
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors de l'enregistrement");
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
        status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        message: null,
        lastFilters: null,
        lastColisFilters: null,
        lastDemandesFilters: null,
        demandes: [],
        demandesMeta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0
        },
        reception: [],
        receptionMeta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0
        },
        lastReceptionFilters: null,
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
        },
        clearCurrentExpedition: (state) => {
            state.currentExpedition = null;
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
                if (!state.expeditions || state.expeditions.length === 0) {
                    state.status = "loading";
                }
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
                if (!state.colis || state.colis.length === 0) {
                    state.colisStatus = "loading";
                }
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
            .addCase(fetchExpeditionById.pending, (state, action) => {
                // On ne met le status en loading que si on n'a pas déjà l'expédition courante
                // ou si l'ID est différent
                const idRequested = action.meta.arg;
                if (!state.currentExpedition || String(state.currentExpedition.id) !== String(idRequested)) {
                    state.status = "loading";
                }
                state.error = null;
            })
            .addCase(fetchExpeditionById.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Unwrap potentially nested expedition data from API response
                const expeditionData = action.payload?.expedition || action.payload?.data || action.payload;
                state.currentExpedition = expeditionData;
            })
            .addCase(fetchExpeditionById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Fetch Demandes Clients
            .addCase(fetchDemandesClients.pending, (state) => {
                if (!state.demandes || state.demandes.length === 0) {
                    state.status = "loading";
                }
                state.error = null;
            })
            .addCase(fetchDemandesClients.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.demandes = action.payload.data;
                state.demandesMeta = action.payload.meta || state.demandesMeta;
                state.lastDemandesFilters = action.meta.arg;
            })
            .addCase(fetchDemandesClients.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Accept Demande
            .addCase(acceptDemandeClient.pending, (state) => {
                state.status = "loading";
            })
            .addCase(acceptDemandeClient.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = action.payload.message;
                state.demandes = state.demandes.filter(d => d.id !== action.payload.id);
                if (state.demandesMeta) state.demandesMeta.total -= 1;
            })
            .addCase(acceptDemandeClient.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Refuse Demande
            .addCase(refuseDemandeClient.pending, (state) => {
                state.status = "loading";
            })
            .addCase(refuseDemandeClient.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = action.payload.message;
                state.demandes = state.demandes.filter(d => d.id !== action.payload.id);
                if (state.demandesMeta) state.demandesMeta.total -= 1;
            })
            .addCase(refuseDemandeClient.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Confirm Reception
            .addCase(confirmExpeditionReception.pending, (state) => {
                state.status = "loading";
            })
            .addCase(confirmExpeditionReception.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = action.payload.message;
                // Si on est sur une liste, on peut mettre à jour localement ou recharger
                // Pour l'instant on se contente du message
            })
            .addCase(confirmExpeditionReception.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            .addCase(receiveColisDepart.pending, (state) => {
                state.status = "loading";
            })
            .addCase(receiveColisDepart.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = action.payload.message;
                const { codes } = action.payload;

                if (state.expeditions && codes) {
                    state.expeditions = state.expeditions.map(exp => ({
                        ...exp,
                        colis: exp.colis.map(c =>
                            codes.includes(c.code_colis)
                                ? { ...c, is_received_by_agence_depart: true }
                                : c
                        )
                    }));
                }
            })
            .addCase(receiveColisDepart.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Fetch Expeditions Reception
            .addCase(fetchExpeditionsReception.pending, (state) => {
                if (!state.reception || state.reception.length === 0) {
                    state.status = "loading";
                }
                state.error = null;
            })
            .addCase(fetchExpeditionsReception.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.reception = action.payload.data;
                state.receptionMeta = action.payload.meta || state.receptionMeta;
                state.lastReceptionFilters = action.meta.arg;
            })
            .addCase(fetchExpeditionsReception.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Receive Colis Destination
            .addCase(receiveColisDestination.pending, (state) => {
                state.status = "loading";
            })
            .addCase(receiveColisDestination.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = action.payload.message;
                const { codes } = action.payload;

                // Mise à jour de l'onglet réception
                if (state.reception && codes) {
                    state.reception = state.reception.map(colis =>
                        codes.includes(colis.code_colis)
                            ? { ...colis, is_received_by_agence_destination: true }
                            : colis
                    );
                }

                // Mise à jour de la liste générale des expéditions
                if (state.expeditions && codes) {
                    state.expeditions = state.expeditions.map(exp => ({
                        ...exp,
                        colis: exp.colis.map(c =>
                            codes.includes(c.code_colis)
                                ? { ...c, is_received_by_agence_destination: true }
                                : c
                        )
                    }));
                }
            })
            .addCase(receiveColisDestination.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Send Colis To Entrepot
            .addCase(sendColisToEntrepot.pending, (state) => {
                state.status = "loading";
            })
            .addCase(sendColisToEntrepot.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = action.payload.message;
                const { codes } = action.payload;

                if (state.expeditions && codes) {
                    state.expeditions = state.expeditions.map(exp => ({
                        ...exp,
                        colis: exp.colis.map(c =>
                            codes.includes(c.code_colis)
                                ? { ...c, is_expedie_vers_entrepot: true }
                                : c
                        )
                    }));
                }
            })
            .addCase(sendColisToEntrepot.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Initiate Recovery
            .addCase(initiateRecupColis.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(initiateRecupColis.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = action.payload.message;
            })
            .addCase(initiateRecupColis.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Verify Recovery
            .addCase(verifyRecupColis.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(verifyRecupColis.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = action.payload.message;
                const { codes } = action.payload;

                // On peut mettre à jour localement si besoin
                if (state.expeditions && codes) {
                    state.expeditions = state.expeditions.map(exp => ({
                        ...exp,
                        colis: exp.colis.map(c =>
                            codes.includes(c.code_colis)
                                ? { ...c, is_collected_by_client: true }
                                : c
                        )
                    }));
                }
            })
            .addCase(verifyRecupColis.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Record Transaction
            .addCase(recordTransaction.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(recordTransaction.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.message = action.payload.message || "Paiement enregistré avec succès";
            })
            .addCase(recordTransaction.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearExpeditionStatus, setCurrentExpedition, clearSimulation, clearCurrentExpedition } = expeditionSlice.actions;

export default expeditionSlice.reducer;
