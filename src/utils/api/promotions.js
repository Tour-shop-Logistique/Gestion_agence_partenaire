import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion des promotions/offres spéciales de l'agence
 */
export const promotionsApi = {
  async listPromotions() {
    try {
      const response = await apiService.get(API_ENDPOINTS.PROMOTIONS.LIST);
      return {
        success: response.success !== false,
        promotions: response.promotions || [],
      };
    } catch (error) {
      return {
        success: false,
        promotions: [],
        message: error.message || "Erreur lors de la récupération des promotions",
      };
    }
  },

  async createPromotion(data) {
    try {
      const response = await apiService.post(API_ENDPOINTS.PROMOTIONS.CREATE, data);
      return {
        success: response.success !== false,
        promotion: response.promotion,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création de la promotion",
      };
    }
  },

  async updatePromotion(id, data) {
    try {
      const endpoint = API_ENDPOINTS.PROMOTIONS.UPDATE.replace(":id", id);
      const response = await apiService.put(endpoint, data);
      return {
        success: response.success !== false,
        promotion: response.promotion,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la modification de la promotion",
      };
    }
  },

  async deletePromotion(id) {
    try {
      const endpoint = API_ENDPOINTS.PROMOTIONS.DELETE.replace(":id", id);
      const response = await apiService.delete(endpoint);
      return {
        success: response.success !== false,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression de la promotion",
      };
    }
  },
};

export default promotionsApi;
