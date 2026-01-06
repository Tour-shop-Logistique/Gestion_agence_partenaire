import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion des agences
 * Contient toutes les fonctions liées aux agences partenaires
 */
export const agenciesApi = {
  /**
   * Configuration initiale de l'agence (première fois)
   * @param {Object} agencyData - Données de l'agence
   * @returns {Promise<Object>}
   */
  async setupAgency(agencyData) {
    try {
      let payload = agencyData;

      // Si on a un logo ou si on veut forcer FormData
      if (agencyData.logo instanceof File) {
        const formData = new FormData();
        Object.keys(agencyData).forEach(key => {
          if (agencyData[key] !== null && agencyData[key] !== undefined) {
            if (typeof agencyData[key] === 'object' && !(agencyData[key] instanceof File)) {
              formData.append(key, JSON.stringify(agencyData[key]));
            } else {
              formData.append(key, agencyData[key]);
            }
          }
        });
        payload = formData;
      }

      const response = await apiService.post(
        API_ENDPOINTS.AGENCIES.SETUP,
        payload
      );

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Agence configurée avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la configuration de l'agence",
      };
    }
  },

  /**
   * Récupérer les informations de l'agence
   * @returns {Promise<Object>}
   */
  async getAgency() {
    try {
      const response = await apiService.get(API_ENDPOINTS.AGENCIES.SHOW);
      console.log("Données de l'agence (agence/show):", response);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Informations de l'agence récupérées",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération de l'agence",
      };
    }
  },

  /**
   * Mettre à jour les informations de l'agence
   * @param {Object} agencyData - Données à mettre à jour
   * @returns {Promise<Object>}
   */
  async updateAgency(agencyData) {
    try {
      let payload = agencyData;

      // Si on a un logo ou si on veut forcer FormData
      if (agencyData.logo instanceof File) {
        const formData = new FormData();
        Object.keys(agencyData).forEach(key => {
          if (agencyData[key] !== null && agencyData[key] !== undefined) {
            if (typeof agencyData[key] === 'object' && !(agencyData[key] instanceof File)) {
              formData.append(key, JSON.stringify(agencyData[key]));
            } else {
              formData.append(key, agencyData[key]);
            }
          }
        });
        payload = formData;
      }

      const response = await apiService.put(
        API_ENDPOINTS.AGENCIES.UPDATE,
        payload
      );

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Agence mise à jour avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour de l'agence",
      };
    }
  },

  //   /**
  //    * Upload du logo de l'agence
  //    * @param {File} logoFile - Fichier du logo
  //    * @returns {Promise<Object>}
  //    */
  //   async uploadLogo(logoFile) {
  //     try {
  //       const formData = new FormData();
  //       formData.append('logo', logoFile);

  //       const response = await apiService.request(API_ENDPOINTS.AGENCIES.LOGO, {
  //         method: 'POST',
  //         body: formData,
  //         headers: {
  //           // Ne pas définir Content-Type, le navigateur le fera automatiquement avec boundary
  //         },
  //       });

  //       return {
  //         success: true,
  //         data: response,
  //         message: "Logo uploadé avec succès",
  //       };
  //     } catch (error) {
  //       return {
  //         success: false,
  //         message: error.message || "Erreur lors de l'upload du logo",
  //       };
  //     }
  //   },

  /**
   * Récupérer la liste des utilisateurs de l'agence
   * @returns {Promise<Object>}
   */
  async listUsers() {
    try {
      const response = await apiService.get(API_ENDPOINTS.AGENCIES.LIST_USERS);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Liste des utilisateurs récupérée",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des utilisateurs",
      };
    }
  },

  /**
   * Créer un nouvel utilisateur (agent)
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.AGENCIES.CREATE_USER,
        userData
      );

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Utilisateur créé avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création de l'utilisateur",
      };
    }
  },

  /**
   * Afficher les détails d'un utilisateur
   * @param {string|number} userId - ID de l'utilisateur
   * @returns {Promise<Object>}
   */
  async showUser(userId) {
    try {
      const endpoint = API_ENDPOINTS.AGENCIES.SHOW_USER.replace(
        ":user",
        String(userId)
      );
      const response = await apiService.get(endpoint);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Détails de l'utilisateur récupérés",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération de l'utilisateur",
      };
    }
  },

  /**
   * Modifier un utilisateur
   * @param {string|number} userId - ID de l'utilisateur
   * @param {Object} userData - Données à mettre à jour
   * @returns {Promise<Object>}
   */
  async editUser(userId, userData) {
    try {
      const endpoint = API_ENDPOINTS.AGENCIES.EDIT_USER.replace(
        ":user",
        String(userId)
      );
      const response = await apiService.put(endpoint, userData);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Utilisateur mis à jour avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la mise à jour de l'utilisateur",
      };
    }
  },

  /**
   * Supprimer un utilisateur
   * @param {string|number} userId - ID de l'utilisateur
   * @returns {Promise<Object>}
   */
  async deleteUser(userId) {
    try {
      const endpoint = API_ENDPOINTS.AGENCIES.DELETE_USER.replace(
        ":user",
        String(userId)
      );
      const response = await apiService.delete(endpoint);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Utilisateur supprimé avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression de l'utilisateur",
      };
    }
  },

  /**
   * Changer le statut d'un utilisateur (actif/inactif)
   * @param {string|number} userId - ID de l'utilisateur
   * @returns {Promise<Object>}
   */
  async toggleUserStatus(userId) {
    try {
      const endpoint = API_ENDPOINTS.AGENCIES.STATUS_USER.replace(
        ":user",
        String(userId)
      );
      const response = await apiService.put(endpoint);

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Statut de l'utilisateur modifié",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors du changement de statut",
      };
    }
  },
};
