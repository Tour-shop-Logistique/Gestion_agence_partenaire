import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createExpedition as createExpeditionThunk,
    simulateExpedition as simulateExpeditionThunk,
    fetchExpeditions,
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
    const { expeditions, meta, status, simulationStatus, simulationResult, currentExpedition, error, message } = useSelector(state => state.expedition);
    const { list: products, categories, status: productStatus } = useSelector(state => state.products);

    // Actions
    const createExpedition = useCallback((data) => dispatch(createExpeditionThunk(data)), [dispatch]);
    const simulateExpedition = useCallback((data) => dispatch(simulateExpeditionThunk(data)), [dispatch]);

    const loadExpeditions = useCallback((page = 1, forceRefresh = false) => {
        if (!forceRefresh && expeditions.length > 0 && meta.current_page === page && status === 'succeeded') {
            return;
        }
        return dispatch(fetchExpeditions(page));
    }, [dispatch, expeditions.length, meta.current_page, status]);

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
        simulating: simulationStatus === 'loading',

        // Actions
        createExpedition,
        simulateExpedition,
        loadExpeditions,
        getExpeditionDetails,
        resetStatus,
        cleanSimulation,
        loadProducts,
        loadCategories
    };
};
