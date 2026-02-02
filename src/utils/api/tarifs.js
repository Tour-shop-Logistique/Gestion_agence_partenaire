import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion des tarifs
 * Contient toutes les fonctions liées aux tarifs de l'agence
 */
export const tarifsApi = {
  /**
   * Récupérer tous les tarifs de l'agence
   * @returns {Promise<Object>}
   */
  async getTarifs() {
    try {
      const response = await apiService.get(API_ENDPOINTS.TARIFS.LIST);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarifs récupérés avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Impossible de récupérer les tarifs",
      };
    }
  },

  /**
   * Récupérer tous les tarifs groupage de base
   * @returns {Promise<Object>}
   */
  async getTarifsGroupageBase() {
    try {
      const response = await apiService.get(API_ENDPOINTS.TARIFS.List_GROUPAGE_Base);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarifs de base récupérés avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Impossible de récupérer les tarifs de base groupage",
      };
    }
  },

  /**
   * Récupérer tous les tarifs groupage de l'agence
   * @returns {Promise<Object>}
   */
  async getTarifsGroupage() {
    try {
      const response = await apiService.get(API_ENDPOINTS.TARIFS.List_GROUPAGE);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarifs groupage récupérés avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Impossible de récupérer les tarifs groupage de l'agence",
      };
    }
  },

  /**
   * Créer un nouveau tarif groupage
   * @param {Object} tarifData - Données du tarif
   * @returns {Promise<Object>}
   */
  async createTarifGroupage(tarifData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.TARIFS.Create_GROUPAGE,
        tarifData
      );

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarif groupage créé avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création du tarif groupage",
      };
    }
  },




  /**
   * Mettre à jour un tarif groupage
   * @param {string|number} tarifId - ID du tarif
   * @param {Object} tarifData - Données à mettre à jour
   * @returns {Promise<Object>}
   */
  async updateTarifGroupage(tarifId, tarifData) {
    try {
      const endpoint = API_ENDPOINTS.TARIFS.Update_GROUPAGE.replace(
        ":tarif",
        String(tarifId)
      );
      const response = await apiService.put(endpoint, tarifData);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarif groupage mis à jour avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du tarif groupage",
      };
    }
  },

  /**
   * Supprimer un tarif groupage
   * @param {string|number} tarifId - ID du tarif
   * @returns {Promise<Object>}
   */
  async deleteTarifGroupage(tarifId) {
    try {
      const endpoint = API_ENDPOINTS.TARIFS.Delete_GROUPAGE.replace(
        ":tarif",
        String(tarifId)
      );
      const response = await apiService.delete(endpoint);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarif groupage supprimé avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du tarif groupage",
      };
    }
  },

  /**
   * Obtenir tous les tarifs publics avec filtres optionnels
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Object>}
   */
  async getTarifsBase() {
    try {
      const response = await apiService.get(API_ENDPOINTS.TARIFS.LIST_BASE);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarifs publics récupérés avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Impossible de récupérer les tarifs publics",
      };
    }
  },

  /**
   * Créer un nouveau tarif simple
   * @param {Object} tarifData - Données du tarif
   * @returns {Promise<Object>}
   */
  async createTarifSimple(tarifData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.TARIFS.CREATE_SIMPLE,
        tarifData
      );

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarif créé avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création du tarif",
      };
    }
  },

  /**
   * Mettre à jour un tarif existant
   * @param {string|number} tarifId - ID du tarif
   * @param {Object} tarifData - Données à mettre à jour
   * @returns {Promise<Object>}
   */
  async updateTarifSimple(tarifId, tarifData) {
    try {
      const endpoint = API_ENDPOINTS.TARIFS.UPDATE_SIMPLE.replace(
        ":tarif",
        String(tarifId)
      );
      const response = await apiService.put(endpoint, tarifData);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarif mis à jour avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du tarif",
      };
    }
  },

  /**
   * Afficher les détails d'un tarif
   * @param {string|number} tarifId - ID du tarif
   * @returns {Promise<Object>}
   */
  async showTarif(tarifId) {
    try {
      const endpoint = API_ENDPOINTS.TARIFS.SHOW.replace(
        ":tarif",
        String(tarifId)
      );
      const response = await apiService.get(endpoint);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Détails du tarif récupérés",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération du tarif",
      };
    }
  },

  /**
   * Supprimer un tarif
   * @param {string|number} tarifId - ID du tarif
   * @returns {Promise<Object>}
   */
  async deleteTarif(tarifId) {
    try {
      const endpoint = API_ENDPOINTS.TARIFS.DELETE.replace(
        ":tarif",
        String(tarifId)
      );
      const response = await apiService.delete(endpoint);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Tarif supprimé avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du tarif",
      };
    }
  },

  /**
   * Changer le statut d'un tarif (actif/inactif)
   * @param {string|number} tarifId - ID du tarif
   * @returns {Promise<Object>}
   */
  async toggleTarifStatus(tarifId) {
    try {
      const endpoint = API_ENDPOINTS.TARIFS.STATUS.replace(
        ":tarif",
        String(tarifId)
      );
      const response = await apiService.put(endpoint);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Statut du tarif modifié",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors du changement de statut",
      };
    }
  },
};
