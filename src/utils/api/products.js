import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion des produits
 */
export const productsApi = {
    /**
     * Lister tous les produits disponibles
     * @returns {Promise<Object>}
     */
    async listProducts() {
        try {
            const response = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST);

            return {
                success: response.success !== false,
                data: response.data || response.produits || response,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des produits",
            };
        }
    }
};
