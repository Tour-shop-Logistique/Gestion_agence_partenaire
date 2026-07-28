/**
 * Configuration de l'API pour l'application Agence Partenaire
 */

// Configuration de base de l'API : en dev, on passe par le proxy Vite (/api,
// voir vite.config.js) ; en prod, on appelle directement l'URL du backend,
// en ajoutant le préfixe /api ici plutôt que de l'exiger dans VITE_API_URL
// (source d'erreurs silencieuses si oublié). Même pattern que backoffice-app.
export const API_BASE_URL = import.meta.env.DEV ? "/api" : `${import.meta.env.VITE_API_URL}/api`;

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: "/login",
    LOGOUT: "/logout",
    REGISTER: "/register",
    VERIFY_EMAIL: "/verify-email",
    RESEND_EMAIL_VERIFICATION: "/resend-email-verification",
    FORGOT_PASSWORD: "/forgot-password",
    VERIFY_RESET_CODE: "/verify-reset-code",
    RESET_PASSWORD: "/reset-password",
    CHANGE_PASSWORD: "/change-password",
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
    RECORD_TRANSACTION: "/agence/record-transaction",
    LIST_TRANSACTIONS: "/agence/list-transactions",
  },

  // Promotions et offres spéciales
  PROMOTIONS: {
    LIST: "/agence/promotions",
    CREATE: "/agence/promotions",
    UPDATE: "/agence/promotions/:id",
    DELETE: "/agence/promotions/:id",
  },

  // Rôles et permissions
  ROLES: {
    LIST: "/agence/roles",
    CREATE: "/agence/roles",
    UPDATE: "/agence/roles/:id",
    DELETE: "/agence/roles/:id",
  },

  // Facturation
  FACTURES: {
    LIST: "/agence/factures",
    GENERATE: "/agence/factures/expedition/:expeditionId",
    DOWNLOAD: "/agence/factures/:id/download",
    UPDATE_STATUT: "/agence/factures/:id/statut",
    SEND_EMAIL: "/agence/factures/:id/send-email",
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

  EXPEDITIONS: {
    CREATE: "/expedition/agence/create",
    SIMULATE: "/expedition/agence/simulate",
    LIST: "/expedition/agence/list",
    LIST_DEMANDES: "/expedition/agence/list?is_demande_client=true&status=en_attente",
    ACCEPT: "/expedition/agence/accept/:id",
    REFUSE: "/expedition/agence/refuse/:id",
    CONFIRM_RECEPTION: "/expedition/agence/confirm-reception-depart/:id",
    RECEIVE_COLIS_DEPART: "/agence/receive-colis-depart",
    LIST_COLIS: "/agence/list-colis",
    LIST_RECEPTION: "/agence/list-colis?a_receptionner=true",
    RECEIVE_COLIS_DESTINATION: "/agence/receive-colis-destination",
    SEND_COLIS_TO_ENTREPOT: "/agence/send-colis-to-entrepot",
    INITIATE_RECUP: "/agence/initier-retrait-colis",
    VERIFY_RECUP: "/agence/valider-retrait-colis",
    SHOW: "/expedition/agence/show/:id",
  },

  // Produits
  PRODUCTS: {
    LIST: "/produits/list",
    LIST_CATEGORIES: "/produits/list-categories",
  },

  // Comptabilité
  ACCOUNTING: {
    GET_STATS: "/agence/accounting",
  },

  // Notifications / annonces reçues du backoffice
  NOTIFICATIONS: {
    LIST: "/agence/notifications",
    MARK_READ: "/agence/notifications/:id/lue",
    MARK_ALL_READ: "/agence/notifications/marquer-toutes-lues",
    DELETE: "/agence/notifications/:id",
  },

  // Messagerie avec le backoffice
  MESSAGES: {
    SHOW: "/agence/messages",
    SEND: "/agence/messages",
    SEARCH: "/agence/messages/search",
    UPDATE: "/agence/messages/:id",
    DELETE: "/agence/messages/:id",
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


