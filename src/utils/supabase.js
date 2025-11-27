// Configuration Supabase pour l'intégration future
// Ce fichier sera utilisé quand le backend sera implémenté

// Exemple de configuration Supabase
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Fonctions utilitaires pour l'API future
export const apiEndpoints = {
  // Authentification
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  
  // Agences
  agencies: {
    profile: '/agencies/profile',
    update: '/agencies/update',
    logo: '/agencies/logo',
  },
  
  // Tarifs
  tariffs: {
    list: '/tariffs',
    create: '/tariffs',
    update: '/tariffs/:id',
    delete: '/tariffs/:id',
    byAgency: '/tariffs/agency/:id',
  },
};

// Exemple de service API
export class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Méthodes d'authentification
  async login(email, password) {
    return this.request(apiEndpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request(apiEndpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Méthodes pour les tarifs
  async getTariffs() {
    return this.request(apiEndpoints.tariffs.list);
  }

  async createTariff(tariffData) {
    return this.request(apiEndpoints.tariffs.create, {
      method: 'POST',
      body: JSON.stringify(tariffData),
    });
  }

  async updateTariff(id, tariffData) {
    return this.request(apiEndpoints.tariffs.update.replace(':id', id), {
      method: 'PUT',
      body: JSON.stringify(tariffData),
    });
  }

  async deleteTariff(id) {
    return this.request(apiEndpoints.tariffs.delete.replace(':id', id), {
      method: 'DELETE',
    });
  }

  // Méthodes pour le profil
  async updateProfile(profileData) {
    return this.request(apiEndpoints.agencies.update, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

// Instance par défaut (à configurer avec les vraies URLs)
export const apiService = new ApiService(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

// Utilitaires pour la gestion des tokens
export const tokenUtils = {
  getToken() {
    return localStorage.getItem('authToken');
  },

  setToken(token) {
    localStorage.setItem('authToken', token);
  },

  removeToken() {
    localStorage.removeItem('authToken');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

// Intercepteur pour ajouter automatiquement le token d'authentification
export const setupAuthInterceptor = (apiService) => {
  const originalRequest = apiService.request.bind(apiService);
  
  apiService.request = async (endpoint, options = {}) => {
    const token = tokenUtils.getToken();
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    
    return originalRequest(endpoint, options);
  };
};

// Configuration pour l'upload d'images
export const uploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  uploadEndpoint: '/upload',
};

// Validation des fichiers d'upload
export const validateFile = (file) => {
  if (file.size > uploadConfig.maxSize) {
    throw new Error('Le fichier est trop volumineux (max 5MB)');
  }
  
  if (!uploadConfig.allowedTypes.includes(file.type)) {
    throw new Error('Type de fichier non autorisé');
  }
  
  return true;
};
