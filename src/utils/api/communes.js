import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Consultation en lecture seule des communes du backoffice du pays de
 * l'agence (référentiel géographique utilisé pour la tarification interville).
 */
export const communesApi = {
    async getCommunes() {
        try {
            const response = await apiService.get(API_ENDPOINTS.COMMUNES.LIST);
            return {
                success: response.success !== false,
                data: response.communes || response.data || [],
                message: response.message,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Impossible de récupérer les communes",
            };
        }
    },
};
