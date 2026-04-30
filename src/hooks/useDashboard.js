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
    selectDashboardError
} from '../store/slices/dashboardSlice';

/**
 * Hook personnalisé pour gérer les données du dashboard
 */
export const useDashboard = () => {
    const dispatch = useDispatch();

    // Sélecteurs
    const dashboardState = useSelector(selectDashboardState);
    const operational = useSelector(selectOperationalData);
    const financial = useSelector(selectFinancialData);
    const logistics = useSelector(selectLogisticsData);
    const status = useSelector(selectDashboardStatus);
    const error = useSelector(selectDashboardError);

    // Actions
    const fetchDashboard = useCallback((forceRefresh = false) => {
        // Éviter de recharger si déjà en cours
        if (!forceRefresh && status === 'loading') {
            return;
        }
        // Éviter de recharger si déjà chargé récemment (moins de 30 secondes)
        if (!forceRefresh && status === 'succeeded' && dashboardState.lastUpdated) {
            const lastUpdate = new Date(dashboardState.lastUpdated);
            const now = new Date();
            const diffSeconds = (now - lastUpdate) / 1000;
            if (diffSeconds < 30) {
                return Promise.resolve({ payload: dashboardState });
            }
        }
        return dispatch(loadDashboardData());
    }, [dispatch, status, dashboardState]);

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
        lastUpdated: dashboardState.lastUpdated,

        // Actions
        fetchDashboard,
        clearError
    };
};
