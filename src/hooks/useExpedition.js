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
    const { expeditions, status, error, message } = useSelector(state => state.expedition);
    const { list: products, status: productStatus } = useSelector(state => state.products);

    // Actions
    const createExpedition = (data) => dispatch(createExpeditionThunk(data));
    const loadExpeditions = () => dispatch(fetchExpeditions());
    const resetStatus = () => dispatch(clearExpeditionStatus());
    const loadProducts = () => dispatch(fetchProducts());

    return {
        // État
        expeditions,
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
