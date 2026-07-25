import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion des notifications / annonces reçues du backoffice
 */
export const notificationsApi = {
  /**
   * Liste des notifications de l'agence
   * @returns {Promise<Object>}
   */
  async listNotifications() {
    try {
      const response = await apiService.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
      return {
        success: response.success !== false,
        notifications: response.notifications || [],
        nonLues: response.non_lues || 0,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        notifications: [],
        nonLues: 0,
        message: error.message || "Erreur lors de la récupération des notifications",
      };
    }
  },

  /**
   * Marquer une notification comme lue
   * @param {string|number} notificationId
   * @returns {Promise<Object>}
   */
  async markAsRead(notificationId) {
    try {
      const endpoint = API_ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(
        ":id",
        String(notificationId)
      );
      const response = await apiService.put(endpoint);
      return {
        success: response.success !== false,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors du marquage comme lue",
      };
    }
  },

  /**
   * Marquer toutes les notifications comme lues
   * @returns {Promise<Object>}
   */
  async markAllAsRead() {
    try {
      const response = await apiService.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      return {
        success: response.success !== false,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors du marquage global",
      };
    }
  },

  /**
   * Retirer une notification de la liste de l'agence
   * @param {string|number} notificationId
   * @returns {Promise<Object>}
   */
  async deleteNotification(notificationId) {
    try {
      const endpoint = API_ENDPOINTS.NOTIFICATIONS.DELETE.replace(
        ":id",
        String(notificationId)
      );
      const response = await apiService.delete(endpoint);
      return {
        success: response.success !== false,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression",
      };
    }
  },
};

export default notificationsApi;
