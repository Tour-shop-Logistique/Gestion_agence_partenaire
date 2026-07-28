import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion des rôles et permissions de l'agence
 */
export const rolesApi = {
  async listRoles() {
    try {
      const response = await apiService.get(API_ENDPOINTS.ROLES.LIST);
      return {
        success: response.success !== false,
        roles: response.roles || [],
      };
    } catch (error) {
      return {
        success: false,
        roles: [],
        message: error.message || "Erreur lors de la récupération des rôles",
      };
    }
  },

  async createRole(data) {
    try {
      const response = await apiService.post(API_ENDPOINTS.ROLES.CREATE, data);
      return {
        success: response.success !== false,
        role: response.role,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création du rôle",
      };
    }
  },

  async updateRole(id, data) {
    try {
      const endpoint = API_ENDPOINTS.ROLES.UPDATE.replace(":id", id);
      const response = await apiService.put(endpoint, data);
      return {
        success: response.success !== false,
        role: response.role,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la modification du rôle",
      };
    }
  },

  async deleteRole(id) {
    try {
      const endpoint = API_ENDPOINTS.ROLES.DELETE.replace(":id", id);
      const response = await apiService.delete(endpoint);
      return {
        success: response.success !== false,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du rôle",
      };
    }
  },
};

export default rolesApi;
