import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadDashboardData,
    clearDashboardError,
    selectDashboardState,
    selectOperationalData,
    selectFinancialData,
    selectLogisticsData,
    selectDashboardStatus,
    selectDashboardError,
    selectIsRefreshing
} from '../store/slices/dashboardSlice';

/**
 * Hook personnalisé pour gérer les données du dashboard
 */
export const useDashboard = () => {
    const dispatch = useDispatch();

    // Sélecteurs
    const operational = useSelector(selectOperationalData);
    const financial = useSelector(selectFinancialData);
    const logistics = useSelector(selectLogisticsData);
    const status = useSelector(selectDashboardStatus);
    const error = useSelector(selectDashboardError);
    const isRefreshing = useSelector(selectIsRefreshing);
    // Sélecteur direct sur lastUpdated (primitif) plutôt que de lire
    // selectDashboardState().lastUpdated - voir le commentaire sur
    // fetchDashboard ci-dessous pour la raison.
    const lastUpdated = useSelector((state) => selectDashboardState(state).lastUpdated);

    // Actions
    //
    // IMPORTANT : ne JAMAIS dépendre de l'objet dashboardState entier ici -
    // il change de référence à chaque fetch réussi (nouveau payload Redux),
    // ce qui recréait fetchDashboard à chaque fois. Dashboard.jsx l'utilise
    // comme dépendance de refreshAll (useCallback), elle-même dépendance
    // d'un useEffect et passée à useDashboardWebSocket - toute la chaîne
    // était donc recréée et redéclenchée en boucle après chaque fetch
    // ("charge, recharge, recharge encore" observé sur le dashboard). Seuls
    // status/isRefreshing/lastUpdated (primitifs) sont réellement lus ici,
    // donc seuls eux doivent entrer dans les dépendances.
    const fetchDashboard = useCallback((forceRefresh = false, silentRefresh = false) => {
        // Éviter de recharger si déjà en cours (sauf si silentRefresh)
        if (!forceRefresh && !silentRefresh && (status === 'loading' || isRefreshing)) {
            return Promise.resolve();
        }
        // Éviter de recharger si déjà chargé récemment (moins de 30 secondes)
        if (!forceRefresh && !silentRefresh && status === 'succeeded' && lastUpdated) {
            const lastUpdate = new Date(lastUpdated);
            const now = new Date();
            const diffSeconds = (now - lastUpdate) / 1000;
            if (diffSeconds < 30) {
                return Promise.resolve();
            }
        }
        return dispatch(loadDashboardData(silentRefresh));
    }, [dispatch, status, isRefreshing, lastUpdated]);

    const clearError = useCallback(() => {
        dispatch(clearDashboardError());
    }, [dispatch]);

    return {
        // État
        operational,
        financial,
        logistics,
        status,
        error,
        loading: status === 'loading',
        isRefreshing,
        lastUpdated,

        // Actions
        fetchDashboard,
        clearError
    };
};
