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

            return {
                success: response.success !== false,
                data: response,
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
    }
};
