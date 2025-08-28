import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Comptes de test prédéfinis
const TEST_ACCOUNTS = [
  {
    id: 1,
    name: 'Admin Test',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin',
    company: 'Agence Test Admin',
    phone: '+225 27 22 49 50 00'
  },
  {
    id: 2,
    name: 'Manager Test',
    email: 'manager@test.com',
    password: '123456',
    role: 'manager',
    company: 'Agence Test Manager',
    phone: '+225 27 22 49 50 01'
  },
  {
    id: 3,
    name: 'Agent Test',
    email: 'agent@test.com',
    password: '123456',
    role: 'agent',
    company: 'Agence Test Agent',
    phone: '+225 27 22 49 50 02'
  }
];

// Agents de test prédéfinis
const TEST_AGENTS = [
  {
    id: 101,
    name: 'Marie Koné',
    email: 'marie.kone@agence.com',
    password: '123456',
    role: 'agent',
    phone: '+225 27 22 49 50 10',
    status: 'active',
    agencyId: 1,
    createdAt: '2024-01-15'
  },
  {
    id: 102,
    name: 'Jean Traoré',
    email: 'jean.traore@agence.com',
    password: '123456',
    role: 'agent',
    phone: '+225 27 22 49 50 11',
    status: 'active',
    agencyId: 1,
    createdAt: '2024-01-20'
  },
  {
    id: 103,
    name: 'Fatou Diallo',
    email: 'fatou.diallo@agence.com',
    password: '123456',
    role: 'agent',
    phone: '+225 27 22 49 50 12',
    status: 'inactive',
    agencyId: 1,
    createdAt: '2024-02-01'
  }
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialiser les comptes de test et agents dans localStorage
  useEffect(() => {
    const existingAccounts = localStorage.getItem('testAccounts');
    if (!existingAccounts) {
      localStorage.setItem('testAccounts', JSON.stringify(TEST_ACCOUNTS));
    }
    
    const existingAgents = localStorage.getItem('agents');
    if (!existingAgents) {
      localStorage.setItem('agents', JSON.stringify(TEST_AGENTS));
    }
    
    // Vérifier si un utilisateur est déjà connecté
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Charger les agents
    const savedAgents = localStorage.getItem('agents');
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Récupérer les comptes de test
      const accounts = JSON.parse(localStorage.getItem('testAccounts') || '[]');
      const savedAgents = JSON.parse(localStorage.getItem('agents') || '[]');
      
      // Chercher l'utilisateur dans les comptes de test
      let user = accounts.find(account => 
        account.email === email && account.password === password
      );

      // Si pas trouvé, chercher dans les agents
      if (!user) {
        user = savedAgents.find(agent => 
          agent.email === email && agent.password === password
        );
      }

      if (user) {
        // Créer un objet utilisateur sans le mot de passe
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        return {
          success: true,
          message: 'Connexion réussie',
          user: userWithoutPassword
        };
      } else {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la connexion'
      };
    }
  };

  const register = async (userData) => {
    try {
      const accounts = JSON.parse(localStorage.getItem('testAccounts') || '[]');
      
      // Vérifier si l'email existe déjà
      const existingUser = accounts.find(account => account.email === userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'Un compte avec cet email existe déjà'
        };
      }

      // Créer le nouvel utilisateur
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'admin', // Par défaut, les nouveaux comptes sont admin
        company: userData.company,
        phone: userData.phone || ''
      };

      // Ajouter aux comptes
      accounts.push(newUser);
      localStorage.setItem('testAccounts', JSON.stringify(accounts));

      // Connecter l'utilisateur
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return {
        success: true,
        message: 'Compte créé avec succès',
        user: userWithoutPassword
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la création du compte'
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAuthenticated = () => {
    return currentUser !== null;
  };

  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const isAgent = () => {
    return currentUser?.role === 'agent';
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
