import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../utils/api';

const AuthContext = createContext();

// Tableau vide car nous n'utilisons plus de comptes de test
const TEST_ACCOUNTS = [];
const TEST_AGENTS = [];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [agencyData, setAgencyData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [agencyError, setAgencyError] = useState(null);

  // Charger les informations de l'agence
  const getAgencyShow = async () => {
    if (!currentUser?.id) return null;
    
    setAgencyLoading(true);
    setAgencyError(null);
    
    try {
      const response = await apiService.getAgencyProfile();
      if (response.success) {
        setAgencyData(response.data);
        localStorage.setItem('agencyData', JSON.stringify(response.data));
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors du chargement des données de l\'agence');
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'agence:', error);
      setAgencyError(error.message);
      return null;
    } finally {
      setAgencyLoading(false);
    }
  };

  // Vérifier si un utilisateur est déjà connecté
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('currentUser');
      
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          
          // Vérifier et charger les données d'agence en cache
          const savedAgencyData = localStorage.getItem('agencyData');
          if (savedAgencyData && savedAgencyData !== 'undefined') {
            try {
              const parsedAgencyData = JSON.parse(savedAgencyData);
              setAgencyData(parsedAgencyData);
            } catch (e) {
              console.warn('Erreur lors du parsing des données d\'agence:', e);
              // Nettoyer les données invalides
              localStorage.removeItem('agencyData');
            }
          }
          
          // On rafraîchit les données de l'agence en arrière-plan
          if (user.role === 'admin' || user.role === 'manager') {
            getAgencyShow();
          }
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        }
      }

      // Charger les agents
      const savedAgents = localStorage.getItem('agents');
      if (savedAgents) {
        setAgents(JSON.parse(savedAgents));
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (telephone, password) => {
    try {
      const response = await apiService.login(telephone, password);

      if (!response.success) {
        return { success: false, message: response.message || 'Identifiants incorrects' };
      }

      const user = response.user || {};
      // Persister l'utilisateur et le token
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Charger les données de l'agence si l'utilisateur est admin ou manager
      if (user.role === 'admin' || user.role === 'manager') {
        await getAgencyShow();
      }
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }

      return {
        success: true,
        message: 'Connexion réussie',
        user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la connexion'
      };
    }
  };

  const register = async (userData) => {
    try {
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      if (userData.token) {
        localStorage.setItem('authToken', userData.token);
      }
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Erreur lors de la connexion après inscription' };
        }
  };

  const logout = async () => {
    try {
      // Appeler l'API de déconnexion
      const response = await apiService.logout();
      
      if (!response.success) {
        console.warn('La déconnexion du serveur a échoué, mais la déconnexion locale sera effectuée');
      }
      
      return { success: true, message: 'Déconnexion réussie' };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Retourner quand même un succès car on va nettoyer localement
      return { success: false, message: 'Erreur lors de la déconnexion du serveur, mais vous avez été déconnecté localement' };
    } finally {
      // Nettoyer l'état d'authentification côté client dans tous les cas
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
  };

  const isAuthenticated = () => {
    return currentUser !== null;
  };

  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  const isAdmin = () => {
    return (
      currentUser?.role === 'admin' ||
      currentUser?.role === 'is_agence_admin' ||
      currentUser?.is_agence_admin === true
    );
  };

  const isAgent = () => {
    return (
      currentUser?.role === 'agent' ||
      currentUser?.role === 'is_agence_menber' ||
      currentUser?.is_agence_menber === true
    );
  };

  // Fonctions de gestion des agents
  const createAgent = async (agentData) => {
    try {
      const newAgent = {
        id: Date.now(),
        ...agentData,
        password: agentData.password || '123456', // Mot de passe par défaut
        agencyId: currentUser.id,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      const updatedAgents = [...agents, newAgent];
      setAgents(updatedAgents);
      localStorage.setItem('agents', JSON.stringify(updatedAgents));

      return {
        success: true,
        message: 'Agent créé avec succès',
        agent: newAgent
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la création de l\'agent'
      };
    }
  };

  const updateAgent = async (agentId, agentData) => {
    try {
      const updatedAgents = agents.map(agent => 
        agent.id === agentId ? { ...agent, ...agentData } : agent
      );
      setAgents(updatedAgents);
      localStorage.setItem('agents', JSON.stringify(updatedAgents));

      return {
        success: true,
        message: 'Agent mis à jour avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la mise à jour de l\'agent'
      };
    }
  };

  const deleteAgent = async (agentId) => {
    try {
      const updatedAgents = agents.filter(agent => agent.id !== agentId);
      setAgents(updatedAgents);
      localStorage.setItem('agents', JSON.stringify(updatedAgents));

      return {
        success: true,
        message: 'Agent supprimé avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la suppression de l\'agent'
      };
    }
  };

  const getAgentsByAgency = (agencyId) => {
    return agents.filter(agent => agent.agencyId === agencyId);
  };

  const value = {
    currentUser,
    agents,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    isAdmin,
    isAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    getAgentsByAgency,
    loading,
    // Ajout des propriétés manquantes
    getAgencyShow,
    agencyData,
    agencyLoading,
    agencyError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
