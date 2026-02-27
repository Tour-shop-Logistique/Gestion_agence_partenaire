import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createExpedition as createExpeditionThunk,
    simulateExpedition as simulateExpeditionThunk,
    fetchExpeditions,
    fetchColis,
    fetchExpeditionById,
    clearSimulation,
    clearExpeditionStatus,
    setCurrentExpedition,
    fetchDemandesClients,
    acceptDemandeClient,
    refuseDemandeClient,
    clearCurrentExpedition,
    confirmExpeditionReception
} from "../store/slices/expeditionSlice";
import { fetchProducts, fetchCategories } from "../store/slices/productSlice";

/**
 * Hook personnalisé pour gérer les expéditions
 */
export const useExpedition = () => {
    const dispatch = useDispatch();

    // Sélecteurs de l'état
    const {
        expeditions, meta, status,
        colis, colisMeta, colisStatus,
        simulationStatus, simulationResult,
        currentExpedition, error, message,
        lastFilters, lastColisFilters, lastDemandesFilters,
        demandes, demandesMeta
    } = useSelector(state => state.expedition);
    const { list: products, categories, status: productStatus } = useSelector(state => state.products);

    // Actions
    const createExpedition = useCallback((data) => dispatch(createExpeditionThunk(data)), [dispatch]);
    const simulateExpedition = useCallback((data) => dispatch(simulateExpeditionThunk(data)), [dispatch]);

    const loadExpeditions = useCallback((params = { page: 1 }, forceRefresh = false) => {
        return dispatch(fetchExpeditions(params));
    }, [dispatch]);

    const loadColis = useCallback((params = { page: 1 }, forceRefresh = false) => {
        return dispatch(fetchColis(params));
    }, [dispatch]);

    const getExpeditionDetails = useCallback((id) => {
        // Optimisation : si l'expédition est déjà dans l'une des listes, on l'utilise directement
        const existingExpedition = expeditions.find(e => String(e.id) === String(id)) ||
            demandes.find(d => String(d.id) === String(id));

        if (existingExpedition) {
            dispatch(setCurrentExpedition(existingExpedition));
            // On lance quand même un refresh en arrière-plan pour avoir les toutes dernières infos
            dispatch(fetchExpeditionById(id));
            return Promise.resolve({ payload: existingExpedition });
        }
        // Sinon on la récupère depuis l'API
        return dispatch(fetchExpeditionById(id));
    }, [dispatch, expeditions, demandes]);

    const resetStatus = useCallback(() => dispatch(clearExpeditionStatus()), [dispatch]);
    const cleanSimulation = useCallback(() => dispatch(clearSimulation()), [dispatch]);

    const loadProducts = useCallback((forceRefresh = false) => {
        if (!forceRefresh && products && products.length > 0 && productStatus === 'succeeded') {
            return;
        }
        return dispatch(fetchProducts());
    }, [dispatch, products, productStatus]);

    const loadCategories = useCallback((forceRefresh = false) => {
        if (!forceRefresh && categories && categories.length > 0 && productStatus === 'succeeded') {
            return;
        }
        return dispatch(fetchCategories());
    }, [dispatch, categories, productStatus]);

    return {
        // État
        expeditions,
        meta,
        colis,
        colisMeta,
        colisStatus,
        products,
        categories,
        status,
        simulationStatus,
        simulationResult,
        currentExpedition,
        productStatus,
        error,
        message,
        demandes,
        demandesMeta,
        loading: status === 'loading',
        loadingColis: colisStatus === 'loading',
        simulating: simulationStatus === 'loading',

        // Actions
        createExpedition,
        simulateExpedition,
        loadExpeditions,
        loadColis,
        getExpeditionDetails,
        resetStatus,
        cleanSimulation,
        clearCurrentExpedition: useCallback(() => dispatch(clearCurrentExpedition()), [dispatch]),
        loadProducts,
        loadCategories,
        loadDemandes: useCallback((params = { page: 1 }, forceRefresh = false) => {
            return dispatch(fetchDemandesClients(params));
        }, [dispatch]),
        acceptDemande: useCallback((id) => dispatch(acceptDemandeClient(id)), [dispatch]),
        refuseDemande: useCallback((id, data) => dispatch(refuseDemandeClient({ id, data })), [dispatch]),
        confirmReception: useCallback((id) => dispatch(confirmExpeditionReception(id)), [dispatch]),
    };
};
