import React, { createContext, useContext, useState, useEffect } from 'react';

const AgencyContext = createContext();

// Agences de test prédéfinies
const TEST_AGENCIES = [
  {
    id: 1,
    name: 'Agence Express Côte d\'Ivoire',
    code: 'AECI001',
    address: '123 Avenue des Banques, Plateau, Abidjan',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    phone: '+225 27 22 49 50 00',
    email: 'contact@agence-express-ci.com',
    website: 'www.agence-express-ci.com',
    managerName: 'Kouassi Jean',
    managerEmail: 'admin@agence.com',
    managerPhone: '+225 27 22 49 50 01',
    businessHours: 'Lun-Ven: 8h-18h, Sam: 9h-16h',
    services: ['Livraison express', 'Envoi international', 'Suivi en temps réel'],
    logo: null,
    description: 'Agence partenaire spécialisée dans l\'expédition et la livraison express en Côte d\'Ivoire et à l\'international.',
    status: 'active',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  }
];

export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};

export const AgencyProvider = ({ children }) => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialiser les agences de test dans localStorage
  useEffect(() => {
    const existingAgencies = localStorage.getItem('agencies');
    if (!existingAgencies) {
      localStorage.setItem('agencies', JSON.stringify(TEST_AGENCIES));
    }
    
    const savedAgencies = localStorage.getItem('agencies');
    if (savedAgencies) {
      setAgencies(JSON.parse(savedAgencies));
    }
    
    setLoading(false);
  }, []);

  // Créer une nouvelle agence
  const createAgency = async (agencyData) => {
    try {
      const newAgency = {
        id: Date.now(),
        ...agencyData,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedAgencies = [...agencies, newAgency];
      setAgencies(updatedAgencies);
      localStorage.setItem('agencies', JSON.stringify(updatedAgencies));

      return {
        success: true,
        message: 'Agence créée avec succès',
        agency: newAgency
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la création de l\'agence'
      };
    }
  };

  // Mettre à jour une agence
  const updateAgency = async (agencyId, agencyData) => {
    try {
      const updatedAgencies = agencies.map(agency => 
        agency.id === agencyId 
          ? { 
              ...agency, 
              ...agencyData, 
              updatedAt: new Date().toISOString() 
            } 
          : agency
      );
      setAgencies(updatedAgencies);
      localStorage.setItem('agencies', JSON.stringify(updatedAgencies));

      return {
        success: true,
        message: 'Agence mise à jour avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la mise à jour de l\'agence'
      };
    }
  };

  // Obtenir une agence par ID
  const getAgencyById = (agencyId) => {
    return agencies.find(agency => agency.id === agencyId);
  };

  // Obtenir une agence par email du manager
  const getAgencyByManagerEmail = (managerEmail) => {
    return agencies.find(agency => agency.managerEmail === managerEmail);
  };

  // Supprimer une agence
  const deleteAgency = async (agencyId) => {
    try {
      const updatedAgencies = agencies.filter(agency => agency.id !== agencyId);
      setAgencies(updatedAgencies);
      localStorage.setItem('agencies', JSON.stringify(updatedAgencies));

      return {
        success: true,
        message: 'Agence supprimée avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la suppression de l\'agence'
      };
    }
  };

  // Générer un code d'agence unique
  const generateAgencyCode = () => {
    const prefix = 'AECI';
    const existingCodes = agencies.map(a => a.code);
    let counter = 1;
    let newCode = `${prefix}${counter.toString().padStart(3, '0')}`;
    
    while (existingCodes.includes(newCode)) {
      counter++;
      newCode = `${prefix}${counter.toString().padStart(3, '0')}`;
    }
    
    return newCode;
  };

  const value = {
    agencies,
    loading,
    createAgency,
    updateAgency,
    getAgencyById,
    getAgencyByManagerEmail,
    deleteAgency,
    generateAgencyCode
  };

  return (
    <AgencyContext.Provider value={value}>
      {children}
    </AgencyContext.Provider>
  );
};
