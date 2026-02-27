/**
 * Configuration de l'API pour l'application Agence Partenaire
 */

// Configuration de base de l'API (utilisation de la variable d'env ou du proxy en dev)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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

  // Expéditions
  EXPEDITIONS: {
    CREATE: "/expedition/agence/create",
    SIMULATE: "/expedition/agence/simulate",
    LIST: "/expedition/agence/list",
    LIST_DEMANDES: "/expedition/agence/list?is_demande_client=true&status=en_attente",
    ACCEPT: "/expedition/agence/accept/:id",
    REFUSE: "/expedition/agence/refuse/:id",
    CONFIRM_RECEPTION: "/expedition/agence/confirm-reception-depart/:id",
    LIST_COLIS: "/agence/list-colis",
    SHOW: "/expedition/agence/show/:id",
  },

  // Produits
  PRODUCTS: {
    LIST: "/produits/list",
    LIST_CATEGORIES: "/produits/list-categories",
  },
};

/**
 * Utilitaire pour formater l'URL du logo
 * @param {string} path - Chemin relatif du logo
 * @returns {string|null} - URL complète du logo
 */
export const getLogoUrl = (path) => {
  if (!path) return null;

  // Sécurité: si path n'est pas une chaîne (ex: objet File lors d'un upload en cours)
  if (typeof path !== 'string') {
    if (path instanceof File || path instanceof Blob) {
      try {
        return URL.createObjectURL(path);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Si c'est une URL absolue (contient http)
  if (path.startsWith("http")) {
    // Si c'est une URL Supabase, on la laisse telle quelle
    if (path.includes("supabase.co")) {
      return path;
    }
    // Si l'URL contient /storage/, on la transforme en chemin relatif pour passer par notre proxy local
    // Cela règle les problèmes de certificats SSL non valides sur les hostnames AWS EC2 par défaut
    if (path.includes("/storage/")) {
      const storageMatch = path.match(/\/storage\/(.*)/);
      if (storageMatch && storageMatch[1]) {
        return `/storage/${storageMatch[1]}`;
      }
    }
    return path;
  }

  if (path.startsWith("data:")) return path; // Pour les previews base64

  // Nettoyer le chemin pour éviter les doublons de /storage/
  let cleanPath = path;
  if (cleanPath.startsWith("/storage/")) {
    cleanPath = cleanPath.substring(9);
  } else if (cleanPath.startsWith("storage/")) {
    cleanPath = cleanPath.substring(8);
  }

  // S'assurer qu'il n'y a pas de slash au début de cleanPath
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }

  // Retourner un chemin relatif vers le proxy Vite (/storage/...)
  // Le proxy se chargera d'ajouter les headers nécessaires
  return `/storage/${cleanPath}`;
};


