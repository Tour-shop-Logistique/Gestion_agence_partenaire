import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createExpedition as createExpeditionThunk,
    fetchExpeditions,
    clearExpeditionStatus
} from "../store/slices/expeditionSlice";
import { fetchProducts } from "../store/slices/productSlice";

/**
 * Hook personnalisé pour gérer les expéditions
 */
export const useExpedition = () => {
    const dispatch = useDispatch();

    // Sélecteurs de l'état
    const { expeditions, meta, status, error, message } = useSelector(state => state.expedition);
    const { list: products, status: productStatus } = useSelector(state => state.products);

    // Actions
    const createExpedition = useCallback((data) => dispatch(createExpeditionThunk(data)), [dispatch]);

    const loadExpeditions = useCallback((page = 1, forceRefresh = false) => {
        if (!forceRefresh && expeditions.length > 0 && meta.current_page === page && status === 'succeeded') {
            return;
        }
        return dispatch(fetchExpeditions(page));
    }, [dispatch, expeditions.length, meta.current_page, status]);

    const resetStatus = useCallback(() => dispatch(clearExpeditionStatus()), [dispatch]);

    const loadProducts = useCallback((forceRefresh = false) => {
        if (!forceRefresh && products && products.length > 0 && productStatus === 'succeeded') {
            return;
        }
        return dispatch(fetchProducts());
    }, [dispatch, products, productStatus]);

    return {
        // État
        expeditions,
        meta,
        products,
        status,
        productStatus,
        error,
        message,
        loading: status === 'loading',

        // Actions
        createExpedition,
        loadExpeditions,
        resetStatus,
        loadProducts
    };
};
