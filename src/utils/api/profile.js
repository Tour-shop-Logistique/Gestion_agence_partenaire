import apiService from "../apiService";
import { emailVerificationApi } from "./emailVerification";

/**
 * API pour la gestion du profil utilisateur (agent)
 */

/**
 * Récupérer le profil complet de l'utilisateur connecté
 * @returns {Promise} Profil utilisateur
 */
export const getProfile = async () => {
  try {
    console.log("🚀 API: Appel GET /profile/");
    // apiService.get retourne directement les données (pas response.data)
    const data = await apiService.get("/profile/");
    console.log("✅ API: Données reçues:", data);
    return data;
  } catch (error) {
    console.error("❌ API: Erreur lors de la récupération du profil:", error);
    throw error;
  }
};

/**
 * Mettre à jour les informations personnelles du profil
 * @param {Object} data - Données à mettre à jour
 * @param {string} data.nom - Nom de l'utilisateur (optionnel)
 * @param {string} data.prenoms - Prénoms de l'utilisateur (optionnel)
 * @param {string} data.telephone - Téléphone de l'utilisateur (optionnel)
 * @param {string} data.email - Email de l'utilisateur (optionnel)
 * @param {boolean} data.disponible - Disponibilité de l'utilisateur (optionnel)
 * @returns {Promise} Profil mis à jour
 */
export const updateProfile = async (data) => {
  try {
    // apiService.put retourne directement les données
    const result = await apiService.put("/profile/update", data);
    return result;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    throw error;
  }
};

/**
 * Changer le mot de passe de l'utilisateur
 * @param {Object} data - Données du changement de mot de passe
 * @param {string} data.current_password - Mot de passe actuel
 * @param {string} data.password - Nouveau mot de passe
 * @param {string} data.password_confirmation - Confirmation du nouveau mot de passe
 * @returns {Promise} Résultat du changement
 */
export const changePassword = async (data) => {
  try {
    // apiService.put retourne directement les données
    const result = await apiService.put("/profile/change-password", data);
    return result;
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    throw error;
  }
};

/**
 * Supprimer le compte utilisateur
 * @param {string} password - Mot de passe pour confirmer la suppression
 * @returns {Promise} Résultat de la suppression
 */
export const deleteAccount = async (password) => {
  try {
    // apiService.delete retourne directement les données
    const result = await apiService.delete("/profile/delete-account", {
      data: { password }
    });
    return result;
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    throw error;
  }
};

/**
 * Vérifier le code de validation d'email
 * @param {string} email - Email de l'utilisateur
 * @param {string} code - Code de vérification reçu par email
 * @returns {Promise} Résultat de la vérification
 */
export const verifyEmailCode = async (email, code) => {
  try {
    // Utiliser l'API de vérification email existante
    const result = await emailVerificationApi.verifyEmail(email, code);
    return result;
  } catch (error) {
    console.error("Erreur lors de la vérification du code email:", error);
    throw error;
  }
};
