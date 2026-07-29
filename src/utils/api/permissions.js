import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de récupération des ressources/actions granulaires disponibles
 * pour la configuration des rôles (source de vérité unique côté backend).
 */
export const permissionsApi = {
  async listAvailablePermissions() {
    try {
      const response = await apiService.get(API_ENDPOINTS.ROLES.AVAILABLE_PERMISSIONS);
      return {
        success: response.success !== false,
        resources: response.resources || [],
      };
    } catch (error) {
      return {
        success: false,
        resources: [],
        message: error.message || "Erreur lors de la récupération des permissions disponibles",
      };
    }
  },
};

export default permissionsApi;
