import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Consultation en lecture seule d'agences autres que la sienne, pour le
 * choix de l'agence d'arrivée d'une expédition Interville (par l'agence de
 * départ, au contrôle) - voir AgenceExpeditionController::choisirAgenceArrivee.
 */
export const agencesApi = {
    /**
     * Agences actives d'une commune donnée.
     * @param {string} communeId
     * @returns {Promise<Object>}
     */
    async getAgencesByCommune(communeId) {
        try {
            const url = `${API_ENDPOINTS.AGENCIES.LIST}?commune_id=${encodeURIComponent(communeId)}&actif=1`;
            const response = await apiService.get(url);
            return {
                success: response.success !== false,
                data: response.agences || response.data || [],
                message: response.message,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Impossible de récupérer les agences de cette commune",
            };
        }
    },
};
