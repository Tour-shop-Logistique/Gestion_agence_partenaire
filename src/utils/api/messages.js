import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion de la messagerie avec le backoffice
 */
export const messagesApi = {
  /**
   * Affiche la conversation de l'agence avec le backoffice
   * @returns {Promise<Object>}
   */
  async showConversation() {
    try {
      const response = await apiService.get(API_ENDPOINTS.MESSAGES.SHOW);
      return {
        success: response.success !== false,
        conversationId: response.conversation_id,
        messages: response.messages || [],
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        messages: [],
        message: error.message || "Erreur lors de la récupération de la conversation",
      };
    }
  },

  /**
   * Envoie un message (texte et/ou pièces jointes) au backoffice
   * @param {{ body?: string, attachments?: File[] }} params
   * @returns {Promise<Object>}
   */
  async sendMessage({ body, attachments } = {}) {
    try {
      const formData = new FormData();
      if (body) formData.append("body", body);
      (attachments || []).forEach((file) => formData.append("attachments[]", file));

      const response = await apiService.upload(API_ENDPOINTS.MESSAGES.SEND, formData);
      return {
        success: response.success !== false,
        sentMessage: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de l'envoi du message",
      };
    }
  },
};

export default messagesApi;
