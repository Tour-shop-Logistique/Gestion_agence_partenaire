import React, { createContext, useContext, useState, useEffect } from 'react';

const TariffContext = createContext();

// Tarifs de test prédéfinis
const TEST_TARIFFS = [
  {
    id: 1,
    destination: 'France',
    weightRange: '0-5 kg',
    price: 25000,
    currency: 'XOF',
    deliveryTime: '3-5 jours',
    agencyId: 1,
    isActive: true,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    id: 2,
    destination: 'France',
    weightRange: '5-10 kg',
    price: 45000,
    currency: 'XOF',
    deliveryTime: '3-5 jours',
    agencyId: 1,
    isActive: true,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    id: 3,
    destination: 'Canada',
    weightRange: '0-5 kg',
    price: 35000,
    currency: 'XOF',
    deliveryTime: '5-7 jours',
    agencyId: 1,
    isActive: true,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    id: 4,
    destination: 'États-Unis',
    weightRange: '0-5 kg',
    price: 40000,
    currency: 'XOF',
    deliveryTime: '5-8 jours',
    agencyId: 1,
    isActive: true,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    id: 5,
    destination: 'Allemagne',
    weightRange: '0-5 kg',
    price: 30000,
    currency: 'XOF',
    deliveryTime: '4-6 jours',
    agencyId: 1,
    isActive: true,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    id: 6,
    destination: 'Belgique',
    weightRange: '0-5 kg',
    price: 28000,
    currency: 'XOF',
    deliveryTime: '3-5 jours',
    agencyId: 1,
    isActive: true,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  }
];

export const useTariffs = () => {
  const context = useContext(TariffContext);
  if (!context) {
    throw new Error('useTariffs must be used within a TariffProvider');
  }
  return context;
};

export const TariffProvider = ({ children }) => {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialiser les tarifs de test dans localStorage
  useEffect(() => {
    const existingTariffs = localStorage.getItem('tariffs');
    if (!existingTariffs) {
      localStorage.setItem('tariffs', JSON.stringify(TEST_TARIFFS));
    }
    
    const savedTariffs = localStorage.getItem('tariffs');
    if (savedTariffs) {
      setTariffs(JSON.parse(savedTariffs));
    }
    
    setLoading(false);
  }, []);

  // Créer un nouveau tarif
  const createTariff = async (tariffData) => {
    try {
      const newTariff = {
        id: Date.now(),
        ...tariffData,
        currency: tariffData.currency || 'XOF',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedTariffs = [...tariffs, newTariff];
      setTariffs(updatedTariffs);
      localStorage.setItem('tariffs', JSON.stringify(updatedTariffs));

      return {
        success: true,
        message: 'Tarif créé avec succès',
        tariff: newTariff
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la création du tarif'
      };
    }
  };

  // Mettre à jour un tarif
  const updateTariff = async (tariffId, tariffData) => {
    try {
      const updatedTariffs = tariffs.map(tariff => 
        tariff.id === tariffId 
          ? { 
              ...tariff, 
              ...tariffData, 
              updatedAt: new Date().toISOString() 
            } 
          : tariff
      );
      setTariffs(updatedTariffs);
      localStorage.setItem('tariffs', JSON.stringify(updatedTariffs));

      return {
        success: true,
        message: 'Tarif mis à jour avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la mise à jour du tarif'
      };
    }
  };

  // Supprimer un tarif
  const deleteTariff = async (tariffId) => {
    try {
      const updatedTariffs = tariffs.filter(tariff => tariff.id !== tariffId);
      setTariffs(updatedTariffs);
      localStorage.setItem('tariffs', JSON.stringify(updatedTariffs));

      return {
        success: true,
        message: 'Tarif supprimé avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la suppression du tarif'
      };
    }
  };

  // Activer/Désactiver un tarif
  const toggleTariffStatus = async (tariffId) => {
    try {
      const updatedTariffs = tariffs.map(tariff => 
        tariff.id === tariffId 
          ? { 
              ...tariff, 
              isActive: !tariff.isActive,
              updatedAt: new Date().toISOString() 
            } 
          : tariff
      );
      setTariffs(updatedTariffs);
      localStorage.setItem('tariffs', JSON.stringify(updatedTariffs));

      return {
        success: true,
        message: `Tarif ${updatedTariffs.find(t => t.id === tariffId)?.isActive ? 'activé' : 'désactivé'} avec succès`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la modification du statut'
      };
    }
  };

  // Obtenir les tarifs par agence
  const getTariffsByAgency = (agencyId) => {
    return tariffs.filter(tariff => tariff.agencyId === agencyId);
  };

  // Obtenir les tarifs actifs par agence
  const getActiveTariffsByAgency = (agencyId) => {
    return tariffs.filter(tariff => tariff.agencyId === agencyId && tariff.isActive);
  };

  // Calculer le prix pour une destination et un poids
  const calculatePrice = (destination, weight, agencyId) => {
    const agencyTariffs = getActiveTariffsByAgency(agencyId);
    const matchingTariffs = agencyTariffs.filter(tariff => 
      tariff.destination === destination
    );

    if (matchingTariffs.length === 0) {
      return null;
    }

    // Trouver le tarif correspondant au poids
    for (const tariff of matchingTariffs) {
      const [minWeight, maxWeight] = tariff.weightRange.split('-').map(w => parseFloat(w));
      if (weight >= minWeight && weight <= maxWeight) {
        return {
          price: tariff.price,
          currency: tariff.currency,
          deliveryTime: tariff.deliveryTime,
          tariffId: tariff.id
        };
      }
    }

    return null;
  };

  // Obtenir les destinations disponibles
  const getDestinations = (agencyId) => {
    const agencyTariffs = getActiveTariffsByAgency(agencyId);
    return [...new Set(agencyTariffs.map(tariff => tariff.destination))];
  };

  // Obtenir les plages de poids disponibles
  const getWeightRanges = () => {
    return [
      '0-5 kg',
      '5-10 kg',
      '10-15 kg',
      '15-20 kg',
      '20-25 kg',
      '25-30 kg'
    ];
  };

  // Formater le prix
  const formatPrice = (price, currency = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const value = {
    tariffs,
    loading,
    createTariff,
    updateTariff,
    deleteTariff,
    toggleTariffStatus,
    getTariffsByAgency,
    getActiveTariffsByAgency,
    calculatePrice,
    getDestinations,
    getWeightRanges,
    formatPrice
  };

  return (
    <TariffContext.Provider value={value}>
      {children}
    </TariffContext.Provider>
  );
};
 