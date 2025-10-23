/**
 * Configuration de l'API pour l'application Agence Partenaire
 */

// Configuration de base de l'API
export const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000/api" || "https://tourshop.nport.link/api";

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: "/login",
    LOGOUT: "/logout",
    REGISTER: "/register",
    // FORGOT_PASSWORD: "/forgot-password",
    // RESET_PASSWORD: "/reset-password",
    ME: "/profil",
  },

  // Divers / utilitaires
  MISC: {
    TEST_CORS: "/test-cors",
  },

  // Agences
  AGENCIES: {
    SETUP: "/agence/setup",
    SHOW: "/agence/show",
    UPDATE: "/agence/update",
    // LOGO: "/agence/upload-logo",

    LIST_USERS: "/agence/list-users",
    CREATE_USER: "/agence/create-user",
    EDIT_USER: "/agence/edit-user/:user",
    DELETE_USER: "/agence/delete-user/:user",
    SHOW_USER: "/agence/show-user/:user",
    STATUS_USER: "/agence/status-user/:user",
  },

  // Tarifs
  TARIFS: {
    LIST_BASE: "/tarification/list",
    LIST: "/agence/list-tarifs",
    CREATE_SIMPLE: "/agence/add-tarif-simple",
    UPDATE_SIMPLE: "/agence/edit-tarif-simple/:tarif",
    SHOW: "/agence/show-tarif/:tarif",
    DELETE: "/agence/delete-tarif/:tarif",
    STATUS: "/agence/status-tarif/:tarif",
  },


};
