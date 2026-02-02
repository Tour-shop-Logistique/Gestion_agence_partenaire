import { API_BASE_URL } from "./apiConfig";

/**
 * Service API centralisé pour gérer toutes les requêtes HTTP
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("auth_token");
  }

  /**
   * Définir le token d'authentification
   */
  setAuthToken(token) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  /**
   * Supprimer le token d'authentification
   */
  removeAuthToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  /**
   * Obtenir les headers par défaut
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
      ...customHeaders,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Gérer les erreurs de réponse
   */
  async handleResponse(response) {
    console.log(`[ApiService] Response from ${response.url}: ${response.status} ${response.statusText}`);
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    let data;
    const text = await response.text();
    console.log(`[ApiService] Raw body (first 100 chars):`, text.substring(0, 100));

    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.warn("[ApiService] JSON parse error:", e.message);
      data = { message: text || "Erreur de format de réponse" };
    }

    // Si la réponse n'est pas OK (status 4xx ou 5xx)
    if (!response.ok) {
      console.error(`Erreur API ${response.status}:`, data);
      const error = new Error(
        data?.message || data?.error || `Erreur HTTP: ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      error.success = false;
      throw error;
    }

    // Si la réponse contient success: false
    if (data && typeof data === "object" && data.success === false) {
      const error = new Error(data.message || "Une erreur est survenue");
      error.status = response.status;
      error.data = data;
      error.success = false;
      throw error;
    }

    console.log(data);

    return data;
  }

  /**
   * Requête GET
   */
  async get(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(options.headers),
        ...options,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Requête POST
   */
  async post(endpoint, data = {}, options = {}) {
    try {
      const isFormData = data instanceof FormData;
      const headers = this.getHeaders(options.headers);

      if (isFormData) {
        delete headers["Content-Type"];
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers,
        body: isFormData ? data : JSON.stringify(data),
        ...options,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Requête PUT
   */
  async put(endpoint, data = {}, options = {}) {
    try {
      const isFormData = data instanceof FormData;
      const headers = this.getHeaders(options.headers);

      if (isFormData) {
        delete headers["Content-Type"];
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers,
        body: isFormData ? data : JSON.stringify(data),
        ...options,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Requête PATCH
   */
  async patch(endpoint, data = {}, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PATCH",
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`PATCH ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Requête DELETE
   */
  async delete(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(options.headers),
        ...options,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Upload de fichiers (FormData)
   */
  async upload(endpoint, formData, options = {}) {
    try {
      // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
      const headers = {
        "ngrok-skip-browser-warning": "true",
        ...options.headers
      };
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
        ...options,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`UPLOAD ${endpoint} error:`, error);
      throw error;
    }
  }
}

// Export d'une instance unique
export const apiService = new ApiService();
export default apiService;
