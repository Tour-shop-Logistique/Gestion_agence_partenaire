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
    confirmExpeditionReception,
    receiveColisDepart as receiveColisDepartThunk,
    fetchExpeditionsReception,
    receiveColisDestination as receiveColisDestinationThunk,
    sendColisToEntrepot as sendColisToEntrepotThunk,
    initiateRecupColis as initiateRecupColisThunk,
    verifyRecupColis as verifyRecupColisThunk
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
        demandes, demandesMeta,
        reception, receptionMeta, lastReceptionFilters
    } = useSelector(state => state.expedition);
    const { list: products, categories, status: productStatus } = useSelector(state => state.products);

    // Actions
    const createExpedition = useCallback((data) => dispatch(createExpeditionThunk(data)), [dispatch]);
    const simulateExpedition = useCallback((data) => dispatch(simulateExpeditionThunk(data)), [dispatch]);

    const loadExpeditions = useCallback((params = { page: 1 }, forceRefresh = false) => {
        // Optimisation : ne pas recharger si les filtres sont identiques et qu'on a déjà une réponse (même vide) ou chargement en cours
        const isSameParams = lastFilters &&
            String(params.page) === String(lastFilters.page) &&
            String(params.date_debut) === String(lastFilters.date_debut) &&
            String(params.date_fin) === String(lastFilters.date_fin);

        if (!forceRefresh && lastFilters && isSameParams && (status === 'succeeded' || status === 'loading')) {
            return; // On ne fait rien, les données sont déjà là (qu'elles soient vides ou pas), ou en cours de chargement
        }
        return dispatch(fetchExpeditions(params));
    }, [dispatch, lastFilters, status]);

    const loadColis = useCallback((params = { page: 1 }, forceRefresh = false) => {
        const isSameParams = lastColisFilters &&
            String(params.page) === String(lastColisFilters.page) &&
            params.date_debut === lastColisFilters.date_debut &&
            params.date_fin === lastColisFilters.date_fin;

        if (!forceRefresh && lastColisFilters && isSameParams && (colisStatus === 'succeeded' || colisStatus === 'loading')) {
            return Promise.resolve({ payload: { data: colis, meta: colisMeta } });
        }
        return dispatch(fetchColis(params));
    }, [dispatch, colis, colisMeta, lastColisFilters, colisStatus]);

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
        reception,
        receptionMeta,
        lastReceptionFilters,
        lastFilters,
        lastColisFilters,
        lastDemandesFilters,
        loading: status === 'loading',
        loadingColis: colisStatus === 'loading',
        simulating: simulationStatus === 'loading',

        // Actions
        createExpedition,
        simulateExpedition,
        loadExpeditions,
        loadColis,
        getExpeditionDetails,
        cleanSimulation,
        clearCurrentExpedition: useCallback(() => dispatch(clearCurrentExpedition()), [dispatch]),
        loadProducts,
        loadCategories,
        loadDemandes: useCallback((params = { page: 1 }, forceRefresh = false) => {
            const isSameParams = lastDemandesFilters &&
                String(params.page) === String(lastDemandesFilters.page);

            if (!forceRefresh && lastDemandesFilters && isSameParams && (status === 'succeeded' || status === 'loading')) {
                return Promise.resolve({ payload: { data: demandes, meta: demandesMeta } });
            }
            return dispatch(fetchDemandesClients(params));
        }, [dispatch, demandes, demandesMeta, lastDemandesFilters, status]),
        acceptDemande: useCallback((id) => dispatch(acceptDemandeClient(id)), [dispatch]),
        refuseDemande: useCallback((id, data) => dispatch(refuseDemandeClient({ id, data })), [dispatch]),
        confirmReception: useCallback((id) => dispatch(confirmExpeditionReception(id)), [dispatch]),
        receiveColisDepart: useCallback((codes) => dispatch(receiveColisDepartThunk(codes)), [dispatch]),
        loadReception: useCallback((params = { page: 1 }, forceRefresh = false) => {
            const isSameParams = lastReceptionFilters &&
                String(params.page) === String(lastReceptionFilters.page);

            if (!forceRefresh && lastReceptionFilters && isSameParams && (status === 'succeeded' || status === 'loading')) {
                return Promise.resolve({ payload: { data: reception, meta: receptionMeta } });
            }
            return dispatch(fetchExpeditionsReception(params));
        }, [dispatch, reception, receptionMeta, lastReceptionFilters, status]),
        receiveColisDestination: useCallback((codes) => dispatch(receiveColisDestinationThunk(codes)), [dispatch]),
        sendColisToEntrepot: useCallback((codes) => dispatch(sendColisToEntrepotThunk(codes)), [dispatch]),
        initiateRecupColis: useCallback((codes) => dispatch(initiateRecupColisThunk(codes)), [dispatch]),
        verifyRecupColis: useCallback((data) => dispatch(verifyRecupColisThunk(data)), [dispatch]),
        resetStatus: useCallback(() => dispatch(clearExpeditionStatus()), [dispatch]),
    };
};
