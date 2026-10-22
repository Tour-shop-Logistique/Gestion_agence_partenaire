import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Moyens de paiement de l'agence, preuves de paiement et flux financiers
 * avec le backoffice. Aucun argent ne transite par la plateforme : les
 * paiements se font hors application (cash, mobile money, virement) et
 * seules les preuves sont enregistrées ici.
 */
export const paiementsApi = {
  async listMoyensPaiement() {
    try {
      const response = await apiService.get(API_ENDPOINTS.MOYENS_PAIEMENT.LIST);
      return {
        success: response.success !== false,
        moyensPaiement: response.moyens_paiement || [],
      };
    } catch (error) {
      return {
        success: false,
        moyensPaiement: [],
        message: error.message || "Erreur lors de la récupération des moyens de paiement",
      };
    }
  },

  async createMoyenPaiement(data) {
    try {
      const response = await apiService.post(API_ENDPOINTS.MOYENS_PAIEMENT.CREATE, data);
      return {
        success: response.success !== false,
        moyenPaiement: response.moyen_paiement,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de l'ajout du moyen de paiement",
      };
    }
  },

  async updateMoyenPaiement(id, data) {
    try {
      const endpoint = API_ENDPOINTS.MOYENS_PAIEMENT.UPDATE.replace(":id", id);
      const response = await apiService.put(endpoint, data);
      return {
        success: response.success !== false,
        moyenPaiement: response.moyen_paiement,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la modification du moyen de paiement",
      };
    }
  },

  async deleteMoyenPaiement(id) {
    try {
      const endpoint = API_ENDPOINTS.MOYENS_PAIEMENT.DELETE.replace(":id", id);
      const response = await apiService.delete(endpoint);
      return {
        success: response.success !== false,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du moyen de paiement",
      };
    }
  },

  async listPreuvesParExpedition(expeditionId) {
    try {
      const endpoint = API_ENDPOINTS.PREUVES_PAIEMENT.BY_EXPEDITION.replace(":expeditionId", expeditionId);
      const response = await apiService.get(endpoint);
      return {
        success: response.success !== false,
        preuves: response.preuves || [],
      };
    } catch (error) {
      return {
        success: false,
        preuves: [],
        message: error.message || "Erreur lors de la récupération des preuves de paiement",
      };
    }
  },

  /**
   * @param {'confirmer'|'rejeter'} action
   */
  async deciderPreuve(id, action, motifRejet = null) {
    try {
      const endpoint = API_ENDPOINTS.PREUVES_PAIEMENT.DECISION.replace(":id", id);
      const response = await apiService.post(endpoint, {
        action,
        ...(motifRejet ? { motif_rejet: motifRejet } : {}),
      });
      return {
        success: response.success !== false,
        preuve: response.preuve,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors du traitement de la preuve de paiement",
      };
    }
  },

  /**
   * Enregistre la preuve du paiement d'un livreur par l'agence.
   * @param {{missionId: string, montant: number, methodePaiement: string, referenceTransaction?: string, photo: File}} params
   */
  async payerLivreur({ missionId, montant, methodePaiement, referenceTransaction, photo }) {
    try {
      const formData = new FormData();
      formData.append("mission_id", missionId);
      formData.append("montant", montant);
      formData.append("methode_paiement", methodePaiement);
      if (referenceTransaction) formData.append("reference_transaction", referenceTransaction);
      formData.append("photo", photo);

      const response = await apiService.post(API_ENDPOINTS.PREUVES_PAIEMENT.PAYER_LIVREUR, formData);
      return {
        success: response.success !== false,
        preuve: response.preuve,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de l'enregistrement du paiement du livreur",
      };
    }
  },

  async listFluxFinanciers(params = {}) {
    try {
      const query = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
      ).toString();
      const endpoint = query
        ? `${API_ENDPOINTS.FLUX_FINANCIERS.LIST}?${query}`
        : API_ENDPOINTS.FLUX_FINANCIERS.LIST;

      const response = await apiService.get(endpoint);
      return {
        success: response.success !== false,
        flux: response.flux?.data || [],
        pagination: response.flux || null,
      };
    } catch (error) {
      return {
        success: false,
        flux: [],
        pagination: null,
        message: error.message || "Erreur lors de la récupération des flux financiers",
      };
    }
  },

  /**
   * Marque un flux comme réglé, avec preuve facultative.
   * @param {{id: string, notes?: string, referenceTransaction?: string, photo?: File}} params
   */
  async payerFlux({ id, notes, referenceTransaction, photo }) {
    try {
      const endpoint = API_ENDPOINTS.FLUX_FINANCIERS.PAYER.replace(":id", id);

      const formData = new FormData();
      if (notes) formData.append("notes", notes);
      if (referenceTransaction) formData.append("reference_transaction", referenceTransaction);
      if (photo) formData.append("photo", photo);

      const response = await apiService.post(endpoint, formData);
      return {
        success: response.success !== false,
        flux: response.flux,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de l'enregistrement du règlement",
      };
    }
  },
};

export default paiementsApi;
