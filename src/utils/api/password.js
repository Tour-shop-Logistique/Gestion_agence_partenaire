import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion des mots de passe
 * Contient toutes les fonctions liées à la réinitialisation et modification de mot de passe
 */
export const passwordApi = {
  /**
   * Demande de réinitialisation de mot de passe
   * Envoie un code de vérification à l'email fourni
   * @param {string} email - Adresse email de l'utilisateur
   * @returns {Promise<{success: boolean, message: string, data?: any}>}
   */
  async forgotPassword(email) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
        type: "agence",
      });

      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || "Code de réinitialisation envoyé à votre email",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de l'envoi du code de réinitialisation",
        error: error,
      };
    }
  },

  /**
   * Vérification du code de réinitialisation
   * Vérifie que le code envoyé par email est valide
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} code - Code de vérification à 6 chiffres
   * @returns {Promise<{success: boolean, message: string, data?: any}>}
   */
  async verifyResetCode(email, code) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_RESET_CODE, {
        email,
        code,
        type: "agence",
      });

      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || "Code vérifié avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Code invalide ou expiré",
        error: error,
      };
    }
  },

  /**
   * Réinitialisation du mot de passe
   * Définit un nouveau mot de passe après vérification du code
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} code - Code de vérification validé
   * @param {string} password - Nouveau mot de passe
   * @param {string} passwordConfirmation - Confirmation du nouveau mot de passe
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async resetPassword(email, code, password, passwordConfirmation) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
        type: "agence",
      });

      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || "Mot de passe réinitialisé avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la réinitialisation du mot de passe",
        error: error,
      };
    }
  },

  /**
   * Modification du mot de passe pour un utilisateur authentifié
   * Nécessite le mot de passe actuel pour validation
   * @param {string} currentPassword - Mot de passe actuel
   * @param {string} newPassword - Nouveau mot de passe
   * @param {string} newPasswordConfirmation - Confirmation du nouveau mot de passe
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async changePassword(currentPassword, newPassword, newPasswordConfirmation) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
        type: "agence",
      });

      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || "Mot de passe modifié avec succès",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la modification du mot de passe",
        error: error,
      };
    }
  },
};
