/**
 * Configuration de l'API pour l'application Agence Partenaire
 */

// Configuration de base de l'API
export const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "https://tourshop.nport.link/api"|| "https://tourshop.loophole.site/api";

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
    LIST_BASE: "/tarification/list-simple",
    LIST: "/agence/list-tarifs-simple",
    CREATE_SIMPLE: "/agence/add-tarif-simple",
    UPDATE_SIMPLE: "/agence/edit-tarif-simple/:tarif",
    SHOW: "/agence/show-tarif-simple/:tarif",
    DELETE: "/agence/delete-tarif-simple/:tarif",
    STATUS: "/agence/status-tarif-simple/:tarif",
    List_GROUPAGE_Base: "/tarification/list-groupage",
    List_GROUPAGE: "/agence/list-tarifs-groupage",
    Create_GROUPAGE: "/agence/add-tarif-groupage",
    Update_GROUPAGE: "/agence/edit-tarif-groupage/:tarif",
    Show_GROUPAGE: "/agence/show-tarif-groupage/:tarif",
    Delete_GROUPAGE: "/agence/delete-tarif-groupage/:tarif",
    Status_GROUPAGE: "/agence/status-tarif-groupage/:tarif",

  },


};
