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
     * Lister les expéditions de l'agence
     * @returns {Promise<Object>}
     */
    async listExpeditions() {
        try {
            const response = await apiService.get(API_ENDPOINTS.EXPEDITIONS.LIST);

            return {
                success: response.success !== false,
                data: response.data || response,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des expéditions",
            };
        }
    }
};
