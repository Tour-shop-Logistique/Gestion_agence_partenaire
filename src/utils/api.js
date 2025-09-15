// Configuration de l'API pour l'application Agence Partenaire
// Ce fichier contient toutes les fonctions pour communiquer avec le backend

// Configuration de base de l'API (Vite utilise import.meta.env)
// Utiliser toujours l'URL distante (ou VITE_API_BASE_URL si fournie)
// ATTENTION: Nécessite que le serveur distant expose les en-têtes CORS
const API_BASE_URL = (
  import.meta?.env?.VITE_API_BASE_URL || 'https://tourshop.nport.link/api'
);

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    ME: '/me',
  },
  // Divers / utilitaires
  MISC: {
    TEST_CORS: '/test-cors',
  },
  
  // Agences
  AGENCIES: {
    PROFILE: '/agencies/profile',
    UPDATE: '/agencies/update',
    LOGO: '/agencies/logo',
    LIST: '/agencies',
    GET_BY_ID: '/agencies/:id',
    CREATE_USER: '/agence/create-user',
    SETUP: '/agence/setup',
    SHOW: '/agence/show',
    LIST_USERS: '/agence/list-users',
    EDIT_USER: '/agence/edit-user/:user',
    UPDATE_AGENCE: '/agence/update',
  },
  
  // Tarifs
  TARIFFS: {
    LIST: '/tariffs',
    CREATE: '/tariffs',
    UPDATE: '/tariffs/:id',
    DELETE: '/tariffs/:id',
    BY_AGENCY: '/agence/list-tarifs',
    PUBLIC: '/tariffs/public',
  },
  
  // Statistiques
  STATS: {
    AGENCY_STATS: '/stats/agency/:id',
    EXPORT_STATS: '/stats/exports',
  },
};

// Classe principale pour les appels API
class ApiService {
  constructor(baseURL = API_BASE_URL) {
    // Retirer les slashs finaux pour éviter les // lors de la concaténation
    this.baseURL = (baseURL || '').replace(/\/+$/, '');
  }

  /**
   * Effectue une requête GET
   * @param {string} endpoint - L'endpoint de l'API
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Réponse de l'API
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * Effectue une requête POST
   * @param {string} endpoint - L'endpoint de l'API
   * @param {Object} data - Données à envoyer
   * @param {Object} options - Options supplémentaires de la requête
   * @returns {Promise<Object>} Réponse de l'API
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  }

  /**
   * Mettre à jour le profil d'une agence (admin)
   * Endpoint: PUT /api/agence/update
   */
  async updateAgency(agencyData) {
    try {
      const res = await this.request(API_ENDPOINTS.AGENCIES.UPDATE_AGENCE, {
        method: 'PUT',
        body: JSON.stringify(agencyData),
      });
      return { success: true, data: res, message: res?.message || 'Agence mise à jour avec succès' };
    } catch (error) {
      return { success: false, message: error.message || 'Erreur lors de la mise à jour de l\'agence' };
    }
  }

  /**
   * Mettre à jour un agent de l'agence
   * Endpoint: PUT /api/agence/edit-user/{user}
   * @param {string|number} userId
   * @param {Object} data { nom, prenoms, telephone, email, password? }
   */
  async updateAgencyUser(userId, data) {
    try {
      const endpoint = API_ENDPOINTS.AGENCIES.EDIT_USER.replace(':user', String(userId));
      const res = await this.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify({
          nom: data.nom,
          prenoms: data.prenoms,
          telephone: data.telephone || data.phone,
          email: data.email,
          ...(data.password ? { password: data.password, password_confirmation: data.password } : {}),
        }),
      });
      return { success: true, data: res, message: res?.message || 'Agent mis à jour avec succès' };
    } catch (error) {
      return { success: false, message: error.message || 'Erreur lors de la mise à jour de l\'agent' };
    }
  }

  /**
   * Récupérer la liste des agents de l'agence (admin)
   * Endpoint: GET /api/agence/liste-users
   */
  async getAgencyUsers() {
    try {
      const res = await this.request(API_ENDPOINTS.AGENCIES.LIST_USERS, {
        method: 'GET',
      });
      console.log("res‼️‼️‼️",res);
      return { success: true, data: res, message: res?.message };
    } catch (error) {
      console.log("error‼️‼️‼️",error);
      return { success: false, message: error.message || 'Impossible de récupérer la liste des agents' };
    }
  }

  /**
   * Récupérer les informations de l'agence configurée (admin)
   * Endpoint: GET /api/agence/show
   * @returns {Promise<Object>} Données de l'agence
   */
  async getAgencyShow() {
    try {
      console.log('Début de getAgencyShow - Appel à l\'endpoint:', API_ENDPOINTS.AGENCIES.SHOW);
      const response = await this.request(API_ENDPOINTS.AGENCIES.SHOW);
      
      console.log('Réponse brute de getAgencyShow:', response);
      
      if (!response) {
        console.error('La réponse de l\'API est vide');
        return {
          success: false,
          message: 'Aucune donnée reçue du serveur',
          data: null
        };
      }
      
      // Vérifier si la réponse contient directement les données de l'agence
      // ou si elles sont dans une propriété 'agence' ou 'data'
      const agencyData = response.agence || response.data || response;
      
      if (!agencyData) {
        console.error('Format de réponse inattendu:', response);
        return {
          success: false,
          message: 'Format de réponse inattendu',
          data: null
        };
      }
      
      console.log('Données de l\'agence extraites:', agencyData);
      
      return {
        success: true,
        data: agencyData,
        message: 'Données de l\'agence récupérées avec succès'
      };
      
    } catch (error) {
      console.error('Erreur dans getAgencyShow:', error);
      return { 
        success: false, 
        message: error.message || 'Erreur lors de la récupération des données de l\'agence',
        data: null
      };
    }
  }

  // Méthode générique pour faire des requêtes HTTP
  async request(endpoint, options = {}) {
    // S'assurer que l'endpoint commence par un /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${path}`;
    // Debug: journaliser l'URL finale (à retirer en prod si besoin)
    console.debug('[API] Request URL:', url);
    
    const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    };

    // Ajouter le token d'authentification si disponible
    const token = this.getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log(response);
      
      // Gérer les différents codes de statut
      if (response.status === 401) {
        this.removeAuthToken();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      if (response.status === 403) {
        throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      }
      if (response.status === 404) {
        throw new Error('Ressource non trouvée.');
      }
      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        // Essayer d'extraire un message utile
        const msg = errorData.message
          || errorData.error
          || (errorData.errors && Object.values(errorData.errors).flat().join('\n'))
          || 'Données invalides.';
        throw new Error(msg);
      }
      if (response.status >= 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.message
          || errorData.error
          || (errorData.errors && Object.values(errorData.errors).flat().join('\n'))
          || `Erreur HTTP: ${response.status}`;
        throw new Error(msg);
      }
      
      // Si la réponse est vide (pour DELETE par exemple)
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ===== FONCTIONS D'AUTHENTIFICATION =====

  /**
   * Inscription d'un compte agent
   * Requiert l'API POST /api/register avec le payload:
   * { nom, prenoms, telephone, email, password, password_confirmation, type }
   * @param {Object} userData - Données issues du formulaire
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
      const response = await this.request(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          nom: userData.firstName,
          prenoms: userData.lastName,
          telephone: userData.phone,
          email: userData.email,
          password: userData.password,
          password_confirmation: userData.confirmPassword,
          type: 'agence',
        }),
      });
      // Si l'enregistrement réussit, stocker le token
      console.log(response);
      if (response.token) {
        this.setAuthToken(response.token);
      }

      return {
        success: true,
        user: response.user || null,
        data: response,
        message: 'Compte créé avec succès !',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: error.message,
      };
    }
  }

  /**
   * Connecter un utilisateur
   * @param {string} telephone - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Réponse de l'API avec les données de l'utilisateur
   */
  async login(telephone, password) {
    try {
      const response = await this.request(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ telephone, password ,type: 'agence'}),
      });

      // Stocker le token d'authentification
      if (response.token) {
        this.setAuthToken(response.token);
      }

      // Normaliser la réponse
      const isSuccess = response.success !== false; // par défaut true si non présent
      const user = response.user || {};
      // Propage les flags éventuels au user pour faciliter la redirection côté UI
      if (typeof response.is_agence_admin !== 'undefined') user.is_agence_admin = response.is_agence_admin;
      if (typeof response.is_agence_menber !== 'undefined') user.is_agence_menber = response.is_agence_menber;
      // Mapper le role top-level si fourni
      if (typeof response.role === 'string') {
        if (response.role === 'is_agence_admin') user.is_agence_admin = true;
        if (response.role === 'is_agence_menber') user.is_agence_menber = true;
      }
      // Déduire user.role utilisé par isAdmin()/isAgent()
      if (!user.role) {
        if (user.is_agence_admin) user.role = 'admin';
        else if (user.is_agence_menber) user.role = 'agent';
      }

      if (isSuccess) {
        return {
          success: true,
          token: response.token,
          user,
          message: response.message || 'Connexion réussie !',
        };
      }

      return {
        success: false,
        error: response.error,
        message: response.message || 'Identifiants invalides',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Numero ou mot de passe incorrect',
      };
    }
  }

  /**
   * Déconnecter l'utilisateur
   * @returns {Promise<Object>} Réponse de l'API
   */
  async logout() {
    try {
      await this.request(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Toujours supprimer le token local
      this.removeAuthToken();
    }

    return {
      success: true,
      message: 'Déconnexion réussie',
    };
  }

  /**
   * Rafraîchir le token d'authentification
   * @returns {Promise<Object>} Nouveau token
   */
  async refreshToken() {
    try {
      const response = await this.request(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
      });

      if (response.token) {
        this.setAuthToken(response.token);
      }

      return {
        success: true,
        token: response.token,
      };
    } catch (error) {
      this.removeAuthToken();
      throw error;
    }
  }

  // ===== FONCTIONS POUR LES AGENCES =====

  /**
   * Obtenir le profil de l'agence connectée
   * @returns {Promise<Object>} Données du profil
   */
  async getAgencyProfile() {
    // Appel direct à la méthode getAgencyShow pour éviter la référence circulaire
    return this.getAgencyShow();
  }



  /**
   * Uploader un logo pour l'agence
   * @param {File} logoFile - Fichier du logo
   * @returns {Promise<Object>} URL du logo uploadé
   */
  async uploadAgencyLogo(logoFile) {
    const formData = new FormData();
    formData.append('logo', logoFile);

    return this.request(API_ENDPOINTS.AGENCIES.LOGO, {
      method: 'POST',
      headers: {
        // Ne pas définir Content-Type pour FormData
      },
      body: formData,
    });
  }

  /**
   * Créer/configurer le profil d'une agence via l'API backend
   * Endpoint: POST /api/agence/setup
   * Payload attendu:
   * {
   *   nom_agence, telephone, description, adresse, ville,
   *   commune, pays, latitude, longitude, horaires: [{jour, ouverture, fermeture}]
   * }
   */
  async setupAgency(agencyData) {
    try {
      console.log("agencyData‼️‼️‼️", agencyData);
      const res = await this.request(API_ENDPOINTS.AGENCIES.SETUP, {
        method: 'POST',
        body: JSON.stringify(agencyData),
      });
      console.log("res‼️‼️‼️", res);
      return { success: true, data: res, message: res?.message || 'Agence configurée avec succès' };
    } catch (error) {
      console.log("setupAgency error‼️‼️‼️", error);
      return { success: false, message: error.message || 'Erreur lors de la configuration de l\'agence' };
    }
  }

  // ===== FONCTIONS POUR LES TARIFS =====

  /**
   * Obtenir tous les tarifs publics
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Array>} Liste des tarifs
   */
  async getPublicTariffs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `${API_ENDPOINTS.TARIFFS.PUBLIC}?${queryParams}` : API_ENDPOINTS.TARIFFS.PUBLIC;
    
    return this.request(endpoint);
  }

  /**
   * Obtenir les tarifs de l'agence connectée
   * @returns {Promise<Array>} Liste des tarifs de l'agence
   */
  // async getAgencyTariffs() {
  //   return this.request(API_ENDPOINTS.TARIFFS.BY_AGENCY );
  // }

  /**
   * Créer un nouveau tarif
   * @param {Object} tariffData - Données du tarif
   * @returns {Promise<Object>} Tarif créé
   */
  async createTariff(tariffData) {
    return this.request(API_ENDPOINTS.TARIFFS.CREATE, {
      method: 'POST',
      body: JSON.stringify(tariffData),
    });
  }

  /**
   * Créer un utilisateur (agent) pour l'agence connectée via l'API backend.
   * Requiert le token admin déjà stocké (Authorization: Bearer <token> ajouté automatiquement).
   * @param {Object} data { nom, prenoms, telephone, email, password, password_confirmation }
   */
  async createAgencyUser(data) {
    try {
      const res = await this.request(API_ENDPOINTS.AGENCIES.CREATE_USER, {
        method: 'POST',
        body: JSON.stringify({
          nom: data.nom,
          prenoms: data.prenoms,
          telephone: data.telephone || data.phone,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation || data.password,
          type: 'agence',
        }),
      });
      console.log("res‼️‼️‼️",res);
      return { success: true, data: res, message: res?.message || 'Agent créé avec succès' };
    } catch (error) {
      console.log("error‼️‼️‼️",error);
      return { success: false, message: error.message || 'Erreur lors de la création de l\'agent' };
    }
  }

  /**
   * Mettre à jour un tarif existant
   * @param {string} tariffId - ID du tarif
   * @param {Object} tariffData - Nouvelles données du tarif
   * @returns {Promise<Object>} Tarif mis à jour
   */
  async updateTariff(tariffId, tariffData) {
    return this.request(API_ENDPOINTS.TARIFFS.UPDATE.replace(':id', tariffId), {
      method: 'PUT',
      body: JSON.stringify(tariffData),
    });
  }

  /**
   * Supprimer un tarif
   * @param {string} tariffId - ID du tarif
   * @returns {Promise<Object>} Confirmation de suppression
   */
  async deleteTariff(tariffId) {
    return this.request(API_ENDPOINTS.TARIFFS.DELETE.replace(':id', tariffId), {
      method: 'DELETE',
    });
  }

  // ===== FONCTIONS POUR LES STATISTIQUES =====

  /**
   * Obtenir les statistiques de l'agence
   * @returns {Promise<Object>} Statistiques de l'agence
   */
  async getAgencyStats() {
    return this.request(API_ENDPOINTS.STATS.AGENCY_STATS.replace(':id', 'me'));
  }

  /**
   * Obtenir les statistiques d'exportation globales
   * @returns {Promise<Object>} Statistiques globales
   */
  async getExportStats() {
    return this.request(API_ENDPOINTS.STATS.EXPORT_STATS);
  }

  // ===== UTILITAIRES D'AUTHENTIFICATION =====

  /**
   * Obtenir le token d'authentification stocké
   * @returns {string|null} Token d'authentification
   */
  getAuthToken() {
    // Support both new key 'authToken' and legacy 'token'
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  }

  /**
   * Stocker le token d'authentification
   * @param {string} token - Token d'authentification
   */
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  /**
   * Supprimer le token d'authentification
   */
  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean} True si authentifié
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  /**
   * Obtenir les informations de l'utilisateur depuis le token
   * @returns {Object|null} Informations de l'utilisateur
   */
  getCurrentUser() {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      // Décoder le token JWT (partie payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  /**
   * Tester un endpoint simple en GET pour valider la connectivité/CORS
   * @returns {Promise<Object>} Réponse brute du serveur
   */
  async testCors() {
    try {
      const res = await this.request(API_ENDPOINTS.MISC.TEST_CORS, {
        method: 'GET',
      });
      return { success: true, data: res };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Instance par défaut de l'API
export const apiService = new ApiService();

// Export de la classe pour utilisation personnalisée
export default ApiService;

// ===== FONCTIONS UTILITAIRES =====

/**
 * Formater un prix selon la devise
 * @param {number} price - Prix à formater
 * @param {string} currency - Devise (FCFA, USD, EUR)
 * @returns {string} Prix formaté
 */
export const formatPrice = (price, currency = 'FCFA') => {
  const currencyMap = {
    'FCFA': 'XOF',
    'USD': 'USD',
    'EUR': 'EUR',
  };

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyMap[currency] || 'XOF',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Valider un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si l'email est valide
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valider un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} Résultat de la validation
 */
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      tooShort: password.length < minLength,
      noUpperCase: !hasUpperCase,
      noLowerCase: !hasLowerCase,
      noNumbers: !hasNumbers,
    },
  };
};

/**
 * Gérer les erreurs API de manière uniforme
 * @param {Error} error - Erreur à traiter
 * @returns {string} Message d'erreur formaté
 */
export const handleApiError = (error) => {
  if (!error || !error.message) return 'Une erreur inattendue s\'est produite.';
  if (error.message.includes('Network Error')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet.';
  }
  if (error.message.includes('timeout')) {
    return 'La requête a pris trop de temps. Veuillez réessayer.';
  }
  return error.message || 'Une erreur inattendue s\'est produite.';
};
