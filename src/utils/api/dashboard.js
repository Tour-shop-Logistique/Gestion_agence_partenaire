import apiService from '../apiService';

/**
 * Récupère les données du dashboard de l'agence
 */
export const fetchDashboardData = async () => {
    try {
        const response = await apiService.get('/agence/dashboard');
        return response;
    } catch (error) {
        console.error('Erreur lors de la récupération des données du dashboard:', error);
        throw error;
    }
};
