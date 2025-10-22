import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion de l'authentification
 * Contient toutes les fonctions liées à l'authentification des utilisateurs
 */
export const authApi = {
  /**
   * Inscription d'un compte agent
   * @param {Object} userData - Données de l'utilisateur
   * @param {string} userData.firstName - Nom
   * @param {string} userData.lastName - Prénoms
   * @param {string} userData.phone - Téléphone
   * @param {string} userData.email - Email
   * @param {string} userData.password - Mot de passe
   * @param {string} userData.confirmPassword - Confirmation du mot de passe
   * @returns {Promise<Object>} Réponse de l'API
   */
  async register(userData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, {
        nom: userData.firstName,
        prenoms: userData.lastName,
        telephone: userData.phone,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.confirmPassword,
        type: "agence",
      });

      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || "Inscription réussie",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de l'inscription",
        error: error,
      };
    }
  },

  /**
   * Connexion d'un utilisateur
   * @param {string} telephone - Téléphone de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Données de l'utilisateur et token
   */
  async login(telephone, password, type) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, {
        telephone,
        password,
        type,
      });

      // Sauvegarder le token
      if (response.token) {
        apiService.setAuthToken(response.token);
      }

      return {
        success: response.success !== false,
        data: response,
        message: response.message || "Connexion réussie",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la connexion",
        error: error,
      };
    }
  },

  /**
   * Déconnexion de l'utilisateur
   * @returns {Promise<Object>}
   */
  async logout() {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
      apiService.removeAuthToken();

      return {
        success: response.success !== false,
        message: response.message || "Déconnexion réussie",
      };
    } catch (error) {
      // Même si la déconnexion échoue côté serveur, on déconnecte le client
      apiService.removeAuthToken();
      return {
        success: false,
        message: error.message || "Erreur lors de la déconnexion",
        error: error,
      };
    }
  },

  /**
   * Récupérer le profil de l'utilisateur connecté
   * @returns {Promise<Object>} Données du profil
   */
  async getProfile() {
    try {
      const response = await apiService.get(API_ENDPOINTS.AUTH.ME);

      return {
        success: response.success !== false,
        data: response.data || response.user || response,
        message: response.message || "Profil récupéré avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération du profil",
        error: error,
      };
    }
  },
};
