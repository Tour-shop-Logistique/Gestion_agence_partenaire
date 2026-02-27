import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion des expéditions
 */
export const expeditionsApi = {
    /**
     * Créer une nouvelle expédition
     * @param {Object} expeditionData - Données de l'expédition et des colis
     * @returns {Promise<Object>}
     */
    async createExpedition(expeditionData) {
        try {
            const response = await apiService.post(
                API_ENDPOINTS.EXPEDITIONS.CREATE,
                expeditionData
            );

            console.log("API Response for createExpedition:", response);

            return {
                success: response.success !== false,
                data: response.data || response,
                message: response.message || "Expédition créée avec succès",
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la création de l'expédition",
            };
        }
    },

    /**
     * Simuler le tarif d'une expédition
     * @param {Object} expeditionData - Données de simulation
     * @returns {Promise<Object>}
     */
    async simulateExpedition(expeditionData) {
        try {
            const response = await apiService.post(
                API_ENDPOINTS.EXPEDITIONS.SIMULATE,
                expeditionData
            );

            return {
                success: response.success !== false,
                data: response.data || response,
                message: response.message,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la simulation",
            };
        }
    },

    /**
     * Lister les expéditions de l'agence avec pagination et filtres
     * @param {Object} params - Paramètres de filtrage (page, date_debut, date_fin)
     * @returns {Promise<Object>}
     */
    async listExpeditions(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.date_debut) queryParams.append('date_debut', params.date_debut);
            if (params.date_fin) queryParams.append('date_fin', params.date_fin);

            const queryString = queryParams.toString();
            const url = `${API_ENDPOINTS.EXPEDITIONS.LIST}${queryString ? `?${queryString}` : ''}`;

            const response = await apiService.get(url);
            console.log("response Liste Expeditions", response);

            return {
                success: response.success !== false,
                data: response.data || [],
                meta: response.meta || null,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des expéditions",
            };
        }
    },

    /**
     * Récupérer les détails d'une expédition
     * @param {string} id - ID de l'expédition
     * @returns {Promise<Object>}
     */
    async getExpedition(id) {
        try {
            const url = API_ENDPOINTS.EXPEDITIONS.SHOW.replace(':id', id);
            const response = await apiService.get(url);

            return {
                success: response.success !== false,
                data: response.data || response,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des détails",
            };
        }
    },

    /**
     * Lister tous les colis de l'agence avec pagination et filtres
     * @param {Object} params - Paramètres de filtrage (page, date_debut, date_fin)
     * @returns {Promise<Object>}
     */
    async listColis(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.date_debut) queryParams.append('date_debut', params.date_debut);
            if (params.date_fin) queryParams.append('date_fin', params.date_fin);

            const queryString = queryParams.toString();
            const url = `${API_ENDPOINTS.EXPEDITIONS.LIST_COLIS}${queryString ? `?${queryString}` : ''}`;

            const response = await apiService.get(url);
            console.log("response Liste Colis", response);

            return {
                success: response.success !== false,
                data: response.data || [],
                meta: response.meta || null,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des colis",
            };
        }
    },

    /**
     * Lister les demandes d'expédition des clients
     * @param {Object} params - Paramètres de filtrage (page)
     * @returns {Promise<Object>}
     */
    async listDemandes(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);

            const queryString = queryParams.toString();
            // L'URL LIST_DEMANDES contient déjà les filtres is_demande_client=true&status=en_attente
            const url = `${API_ENDPOINTS.EXPEDITIONS.LIST_DEMANDES}${queryString ? `&${queryString}` : ''}`;

            const response = await apiService.get(url);
            console.log("response Liste Demandes Clients", response);

            return {
                success: response.success !== false,
                data: response.data || [],
                meta: response.meta || null,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la récupération des demandes",
            };
        }
    },

    /**
     * Accepter une demande d'expédition
     * @param {string} id - ID de l'expédition
     * @returns {Promise<Object>}
     */
    async acceptDemande(id) {
        try {
            const url = API_ENDPOINTS.EXPEDITIONS.ACCEPT.replace(':id', id);
            const response = await apiService.put(url, {});

            return {
                success: response.success !== false,
                data: response.data || response,
                message: response.message || "Demande acceptée avec succès"
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de l'acceptation de la demande",
            };
        }
    },

    /**
     * Refuser une demande d'expédition
     * @param {string} id - ID de l'expédition
     * @returns {Promise<Object>}
     */
    async refuseDemande(id, data = {}) {
        try {
            const url = API_ENDPOINTS.EXPEDITIONS.REFUSE.replace(':id', id);
            const response = await apiService.put(url, data);

            return {
                success: response.success !== false,
                data: response.data || response,
                message: response.message || "Demande refusée avec succès"
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors du refus de la demande",
            };
        }
    },

    /**
     * Confirmer la réception d'une expédition
     * @param {string} id - ID de l'expédition
     * @returns {Promise<Object>}
     */
    async confirmReception(id) {
        try {
            const url = API_ENDPOINTS.EXPEDITIONS.CONFIRM_RECEPTION.replace(':id', id);
            const response = await apiService.put(url, {});

            return {
                success: response.success !== false,
                data: response.data || response,
                message: response.message || "Réception confirmée avec succès"
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Erreur lors de la confirmation de la réception",
            };
        }
    }
};
