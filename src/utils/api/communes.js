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

    /**
     * Variante publique, filtrée par pays - utilisable avant même que
     * l'agence n'existe (voir AgencyProfile.jsx : le pays vient d'être
     * choisi dans le formulaire, résoudre les communes via l'agence
     * (getCommunes) échouerait tant qu'elle n'est pas encore créée).
     * @param {string} codePays - Code pays ISO (ex: "CI")
     */
    async getCommunesByPays(codePays) {
        try {
            const response = await apiService.get(`${API_ENDPOINTS.COMMUNES.LIST_PUBLIC}?code_pays=${encodeURIComponent(codePays)}`);
            return {
                success: response.success !== false,
                data: response.communes || response.data || [],
                message: response.message,
            };
        } catch (error) {
            return {
                success: false,
                data: [],
                message: error.message || "Impossible de récupérer les communes",
            };
        }
    },
};
