import { apiService } from "../apiService";
import { API_ENDPOINTS } from "../apiConfig";

/**
 * Module de gestion de la vérification d'email
 * Contient toutes les fonctions liées à la vérification d'email lors de l'inscription
 */
export const emailVerificationApi = {
  /**
   * Vérification de l'email avec le code reçu
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} code - Code de vérification à 6 chiffres
   * @returns {Promise<{success: boolean, message: string, data?: any}>}
   */
  async verifyEmail(email, code) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        email,
        code,
        type: "agence",
      });

      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || "Email vérifié avec succès",
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
   * Renvoyer le code de vérification par email
   * @param {string} email - Adresse email de l'utilisateur
   * @returns {Promise<{success: boolean, message: string, data?: any}>}
   */
  async resendVerificationCode(email) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.RESEND_EMAIL_VERIFICATION, {
        email,
        type: "agence",
      });

      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || "Code de vérification renvoyé à votre email",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de l'envoi du code",
        error: error,
      };
    }
  },
};
