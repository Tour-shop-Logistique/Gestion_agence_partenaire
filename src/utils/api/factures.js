import { apiService } from "../apiService";
import { API_ENDPOINTS, API_BASE_URL } from "../apiConfig";

/**
 * Module de gestion de la facturation des expéditions de l'agence
 */
export const facturesApi = {
  async fetchForExpedition(expeditionId) {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.FACTURES.LIST}?expedition_id=${expeditionId}`
      );
      return {
        success: response.success !== false,
        facture: response.data?.[0] ?? null,
      };
    } catch (error) {
      return {
        success: false,
        facture: null,
        message: error.message || "Erreur lors de la récupération de la facture",
      };
    }
  },

  async generateFacture(expeditionId) {
    try {
      const endpoint = API_ENDPOINTS.FACTURES.GENERATE.replace(":expeditionId", expeditionId);
      const response = await apiService.post(endpoint);
      return {
        success: response.success !== false,
        facture: response.facture,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la génération de la facture",
      };
    }
  },

  async updateStatut(id, statut) {
    try {
      const endpoint = API_ENDPOINTS.FACTURES.UPDATE_STATUT.replace(":id", id);
      const response = await apiService.put(endpoint, { statut });
      return {
        success: response.success !== false,
        facture: response.facture,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du statut",
      };
    }
  },

  async sendEmail(id, email) {
    try {
      const endpoint = API_ENDPOINTS.FACTURES.SEND_EMAIL.replace(":id", id);
      const response = await apiService.post(endpoint, email ? { email } : {});
      return {
        success: response.success !== false,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de l'envoi de la facture",
      };
    }
  },

  /**
   * Télécharge le PDF en blob (apiService décode toujours en JSON, donc on
   * refait un fetch authentifié dédié ici pour récupérer le binaire).
   */
  async downloadPdf(id) {
    const endpoint = API_ENDPOINTS.FACTURES.DOWNLOAD.replace(":id", id);
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Accept: "application/pdf",
        "ngrok-skip-browser-warning": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement de la facture");
    }
    return response.blob();
  },
};

export default facturesApi;
