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
            console.log("Response Products API:", response);

            // Extraction robuste : gère response.data, response.products, response.produits
            // et gère aussi le cas où la réponse est paginée (Laravel) avec data.data
            let productsData = response.data || response.products || response.produits || response;
            
            if (productsData && !Array.isArray(productsData) && productsData.data && Array.isArray(productsData.data)) {
                productsData = productsData.data;
            }

            return {
                success: response.success !== false,
                data: Array.isArray(productsData) ? productsData : [],
            };
        } catch (error) {
            console.error("Error in listProducts:", error);
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des produits",
            };
        }
    },
    /**
     * Lister toutes les catégories disponibles
     * @returns {Promise<Object>}
     */
    async listCategories() {
        try {
            const response = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST_CATEGORIES);
            console.log("Response Categories API:", response);

            let categoriesData = response.categories || response.data || response;
            
            if (categoriesData && !Array.isArray(categoriesData) && categoriesData.data && Array.isArray(categoriesData.data)) {
                categoriesData = categoriesData.data;
            }

            return {
                success: response.success !== false,
                data: Array.isArray(categoriesData) ? categoriesData : [],
            };
        } catch (error) {
            console.error("Error in listCategories:", error);
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des catégories",
            };
        }
    }
};
