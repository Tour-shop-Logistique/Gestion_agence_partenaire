// Configuration de l'API pour l'application Agence Partenaire
// Ce fichier contient toutes les fonctions pour communiquer avec le backend

// Configuration de base de l'API
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Agences
  AGENCIES: {
    PROFILE: '/agencies/profile',
    UPDATE: '/agencies/update',
    LOGO: '/agencies/logo',
    LIST: '/agencies',
    GET_BY_ID: '/agencies/:id',
  },
  
  // Tarifs
  TARIFFS: {
    LIST: '/tariffs',
    CREATE: '/tariffs',
    UPDATE: '/tariffs/:id',
    DELETE: '/tariffs/:id',
    BY_AGENCY: '/tariffs/agency/:id',
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
    this.baseURL = baseURL;
  }

  // Méthode générique pour faire des requêtes HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
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
      
      // Gérer les différents codes de statut
      if (response.status === 401) {
        // Token expiré ou invalide
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Données invalides.');
      }
      
      if (response.status >= 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
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
   * Enregistrer un nouvel utilisateur/agence
   * @param {Object} userData - Données de l'utilisateur
   * @param {string} userData.name - Nom de l'agence
   * @param {string} userData.email - Email de l'agence
   * @param {string} userData.password - Mot de passe
   * @param {string} userData.location - Localisation
   * @param {string} userData.hours - Horaires d'ouverture
   * @param {string} userData.phone - Téléphone
   * @param {string} userData.address - Adresse complète
   * @param {string} userData.description - Description de l'agence
   * @returns {Promise<Object>} Réponse de l'API avec les données de l'utilisateur créé
   */
  async register(userData) {
    try {
      const response = await this.request(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          location: userData.location,
          hours: userData.hours,
          phone: userData.phone,
          address: userData.address,
          description: userData.description,
        }),
      });

      // Si l'enregistrement réussit, stocker le token
      if (response.token) {
        this.setAuthToken(response.token);
      }

      return {
        success: true,
        user: response.user,
        message: 'Agence enregistrée avec succès !',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de l\'enregistrement',
      };
    }
  }

  /**
   * Connecter un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Réponse de l'API avec les données de l'utilisateur
   */
  async login(email, password) {
    try {
      const response = await this.request(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Stocker le token d'authentification
      if (response.token) {
        this.setAuthToken(response.token);
      }

      return {
        success: true,
        user: response.user,
        message: 'Connexion réussie !',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Email ou mot de passe incorrect',
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
    return this.request(API_ENDPOINTS.AGENCIES.PROFILE);
  }

  /**
   * Mettre à jour le profil de l'agence
   * @param {Object} profileData - Nouvelles données du profil
   * @returns {Promise<Object>} Profil mis à jour
   */
  async updateAgencyProfile(profileData) {
    return this.request(API_ENDPOINTS.AGENCIES.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
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
  async getAgencyTariffs() {
    return this.request(API_ENDPOINTS.TARIFFS.BY_AGENCY.replace(':id', 'me'));
  }

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
    return localStorage.getItem('authToken');
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
  if (error.message.includes('Network Error')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet.';
  }
  
  if (error.message.includes('timeout')) {
    return 'La requête a pris trop de temps. Veuillez réessayer.';
  }
  
  return error.message || 'Une erreur inattendue s\'est produite.';
};
