import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createExpedition as createExpeditionThunk,
    simulateExpedition as simulateExpeditionThunk,
    fetchExpeditions,
    fetchColis,
    fetchExpeditionById,
    clearExpeditionStatus,
    clearSimulation,
    setCurrentExpedition
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
        lastFilters, lastColisFilters
    } = useSelector(state => state.expedition);
    const { list: products, categories, status: productStatus } = useSelector(state => state.products);

    // Actions
    const createExpedition = useCallback((data) => dispatch(createExpeditionThunk(data)), [dispatch]);
    const simulateExpedition = useCallback((data) => dispatch(simulateExpeditionThunk(data)), [dispatch]);

    const loadExpeditions = useCallback((params = { page: 1 }, forceRefresh = false) => {
        // Optimisation : ne pas recharger si les paramètres sont identiques
        const filtersMatch = JSON.stringify(params) === JSON.stringify(lastFilters);

        if (!forceRefresh && status === 'succeeded' && expeditions.length > 0 && filtersMatch) {
            return;
        }
        return dispatch(fetchExpeditions(params));
    }, [dispatch, expeditions.length, lastFilters, status]);

    const loadColis = useCallback((params = { page: 1 }, forceRefresh = false) => {
        const filtersMatch = JSON.stringify(params) === JSON.stringify(lastColisFilters);

        if (!forceRefresh && colisStatus === 'succeeded' && colis.length > 0 && filtersMatch) {
            return;
        }
        return dispatch(fetchColis(params));
    }, [dispatch, colis.length, lastColisFilters, colisStatus]);

    const getExpeditionDetails = useCallback((id) => {
        // Optimisation : si l'expédition est déjà dans la liste, on l'utilise directement
        const existingExpedition = expeditions.find(e => e.id === id);
        if (existingExpedition) {
            dispatch(setCurrentExpedition(existingExpedition));
            return Promise.resolve({ payload: existingExpedition });
        }
        // Sinon on la récupère depuis l'API
        return dispatch(fetchExpeditionById(id));
    }, [dispatch, expeditions]);

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
        loadProducts,
        loadCategories
    };
};
