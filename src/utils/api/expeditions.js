import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion des expéditions
 */
export const expeditionsApi = {
    /**
     * Créer une nouvelle expédition
     * @param {Object} expeditionData - Données de l'expédition et des colis
     * @returns {Promise<Object>}
     */
    async createExpedition(expeditionData) {
        try {
            const response = await apiService.post(
                API_ENDPOINTS.EXPEDITIONS.CREATE,
                expeditionData
            );

            console.log("API Response for createExpedition:", response);

            return {
                success: response.success !== false,
                data: response.data || response,
                message: response.message || "Expédition créée avec succès",
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la création de l'expédition",
            };
        }
    },

    /**
     * Simuler le tarif d'une expédition
     * @param {Object} expeditionData - Données de simulation
     * @returns {Promise<Object>}
     */
    async simulateExpedition(expeditionData) {
        try {
            const response = await apiService.post(
                API_ENDPOINTS.EXPEDITIONS.SIMULATE,
                expeditionData
            );

            return {
                success: response.success !== false,
                data: response.data || response,
                message: response.message,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la simulation",
            };
        }
    },

    /**
     * Lister les expéditions de l'agence avec pagination
     * @param {number} page - Numéro de la page
     * @returns {Promise<Object>}
     */
    async listExpeditions(page = 1) {
        try {
            const response = await apiService.get(`${API_ENDPOINTS.EXPEDITIONS.LIST}?page=${page}`);
            console.log("response Liste Expeditions", response);

            return {
                success: response.success !== false,
                data: response.data || [],
                meta: response.meta || null,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des expéditions",
            };
        }
    },

    /**
     * Récupérer les détails d'une expédition
     * @param {string} id - ID de l'expédition
     * @returns {Promise<Object>}
     */
    async getExpedition(id) {
        try {
            const url = API_ENDPOINTS.EXPEDITIONS.SHOW.replace(':id', id);
            const response = await apiService.get(url);

            return {
                success: response.success !== false,
                data: response.data || response,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des détails",
            };
        }
    }
};
