import React, { createContext, useContext, useState, useEffect } from 'react';

const RequestContext = createContext();

// Demandes de test prédéfinies avec nouveaux statuts
const TEST_REQUESTS = [
  {
    id: 1,
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@email.com',
    clientPhone: '+225 27 22 49 50 20',
    destination: 'France',
    weight: 5.5,
    dimensions: '30x20x15 cm',
    description: 'Colis contenant des vêtements et accessoires',
    status: 'pending', // pending, accepted, rejected, pickup_in_progress, dropoff_in_progress, collected, registered, in_transit, delivery_in_progress, delivered
    price: 45000,
    originalPrice: 45000,
    finalPrice: 45000,
    agentId: null,
    agencyId: 1,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00',
    notes: '',
    rejectionReason: '',
    pickupDate: null,
    deliveryDate: null,
    invoiceNumber: null,
    isUrgent: false,
    specialInstructions: 'Fragile, manipuler avec précaution'
  },
  {
    id: 2,
    clientName: 'Marie Koné',
    clientEmail: 'marie.kone@email.com',
    clientPhone: '+225 27 22 49 50 21',
    destination: 'Canada',
    weight: 12.0,
    dimensions: '40x30x25 cm',
    description: 'Documents importants et cadeaux',
    status: 'accepted',
    price: 85000,
    originalPrice: 85000,
    finalPrice: 85000,
    agentId: 101,
    agencyId: 1,
    createdAt: '2024-01-14T14:20:00',
    updatedAt: '2024-01-15T09:15:00',
    notes: 'Client régulier, priorité haute',
    rejectionReason: '',
    pickupDate: '2024-01-16T10:00:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-001',
    isUrgent: true,
    specialInstructions: 'Documents confidentiels'
  },
  {
    id: 3,
    clientName: 'Pierre Traoré',
    clientEmail: 'pierre.traore@email.com',
    clientPhone: '+225 27 22 49 50 22',
    destination: 'États-Unis',
    weight: 8.2,
    dimensions: '35x25x20 cm',
    description: 'Produits artisanaux locaux',
    status: 'in_transit',
    price: 65000,
    originalPrice: 65000,
    finalPrice: 65000,
    agentId: 102,
    agencyId: 1,
    createdAt: '2024-01-13T16:45:00',
    updatedAt: '2024-01-16T11:30:00',
    notes: 'Fragile, manipuler avec précaution',
    rejectionReason: '',
    pickupDate: '2024-01-15T14:00:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-002',
    isUrgent: false,
    specialInstructions: 'Produits artisanaux, éviter l\'humidité'
  },
  {
    id: 4,
    clientName: 'Fatou Diallo',
    clientEmail: 'fatou.diallo@email.com',
    clientPhone: '+225 27 22 49 50 23',
    destination: 'Allemagne',
    weight: 3.8,
    dimensions: '25x15x10 cm',
    description: 'Livres et documents',
    status: 'delivered',
    price: 35000,
    originalPrice: 35000,
    finalPrice: 35000,
    agentId: 101,
    agencyId: 1,
    createdAt: '2024-01-10T08:15:00',
    updatedAt: '2024-01-18T14:20:00',
    notes: 'Livraison réussie',
    rejectionReason: '',
    pickupDate: '2024-01-12T09:00:00',
    deliveryDate: '2024-01-18T14:20:00',
    invoiceNumber: 'INV-2024-003',
    isUrgent: false,
    specialInstructions: 'Livres, éviter les chocs'
  },
  {
    id: 5,
    clientName: 'Amadou Ouattara',
    clientEmail: 'amadou.ouattara@email.com',
    clientPhone: '+225 27 22 49 50 24',
    destination: 'Belgique',
    weight: 15.5,
    dimensions: '50x40x30 cm',
    description: 'Équipements électroniques',
    status: 'rejected',
    price: 120000,
    originalPrice: 120000,
    finalPrice: 120000,
    agentId: 102,
    agencyId: 1,
    createdAt: '2024-01-12T12:00:00',
    updatedAt: '2024-01-15T16:45:00',
    notes: 'Poids trop élevé pour cette destination',
    rejectionReason: 'Poids dépassant la limite autorisée pour cette destination',
    pickupDate: null,
    deliveryDate: null,
    invoiceNumber: null,
    isUrgent: false,
    specialInstructions: 'Équipements sensibles'
  },
  {
    id: 6,
    clientName: 'Aissatou Bamba',
    clientEmail: 'aissatou.bamba@email.com',
    clientPhone: '+225 27 22 49 50 25',
    destination: 'Suisse',
    weight: 2.1,
    dimensions: '20x15x8 cm',
    description: 'Médicaments et documents médicaux',
    status: 'pickup_in_progress',
    price: 28000,
    originalPrice: 28000,
    finalPrice: 28000,
    agentId: 101,
    agencyId: 1,
    createdAt: '2024-01-16T09:00:00',
    updatedAt: '2024-01-17T08:30:00',
    notes: 'Urgent - médicaments pour traitement',
    rejectionReason: '',
    pickupDate: '2024-01-17T10:00:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-004',
    isUrgent: true,
    specialInstructions: 'Médicaments, température contrôlée requise'
  },
  {
    id: 7,
    clientName: 'Kouassi Yao',
    clientEmail: 'kouassi.yao@email.com',
    clientPhone: '+225 27 22 49 50 26',
    destination: 'Espagne',
    weight: 6.8,
    dimensions: '30x25x18 cm',
    description: 'Produits cosmétiques et parfums',
    status: 'dropoff_in_progress',
    price: 55000,
    originalPrice: 55000,
    finalPrice: 58000,
    agentId: 102,
    agencyId: 1,
    createdAt: '2024-01-15T11:20:00',
    updatedAt: '2024-01-17T14:15:00',
    notes: 'Prix ajusté après vérification du poids',
    rejectionReason: '',
    pickupDate: '2024-01-16T15:00:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-005',
    isUrgent: false,
    specialInstructions: 'Produits cosmétiques, éviter la chaleur'
  },
  {
    id: 8,
    clientName: 'Mariam Coulibaly',
    clientEmail: 'mariam.coulibaly@email.com',
    clientPhone: '+225 27 22 49 50 27',
    destination: 'Italie',
    weight: 4.2,
    dimensions: '28x20x12 cm',
    description: 'Vêtements et accessoires de mode',
    status: 'collected',
    price: 42000,
    originalPrice: 42000,
    finalPrice: 42000,
    agentId: 101,
    agencyId: 1,
    createdAt: '2024-01-14T13:45:00',
    updatedAt: '2024-01-17T16:20:00',
    notes: 'Colis collecté avec succès',
    rejectionReason: '',
    pickupDate: '2024-01-17T09:30:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-006',
    isUrgent: false,
    specialInstructions: 'Vêtements, éviter les plis'
  },
  {
    id: 9,
    clientName: 'Bakary Sanogo',
    clientEmail: 'bakary.sanogo@email.com',
    clientPhone: '+225 27 22 49 50 28',
    destination: 'Pays-Bas',
    weight: 9.5,
    dimensions: '35x28x22 cm',
    description: 'Instruments de musique traditionnels',
    status: 'registered',
    price: 75000,
    originalPrice: 75000,
    finalPrice: 75000,
    agentId: 102,
    agencyId: 1,
    createdAt: '2024-01-13T10:15:00',
    updatedAt: '2024-01-18T09:45:00',
    notes: 'Instruments fragiles, manipulation spéciale',
    rejectionReason: '',
    pickupDate: '2024-01-16T11:00:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-007',
    isUrgent: false,
    specialInstructions: 'Instruments de musique, très fragile'
  },
  {
    id: 10,
    clientName: 'Fatimata Keita',
    clientEmail: 'fatimata.keita@email.com',
    clientPhone: '+225 27 22 49 50 29',
    destination: 'Royaume-Uni',
    weight: 1.8,
    dimensions: '18x12x6 cm',
    description: 'Bijoux et accessoires précieux',
    status: 'delivery_in_progress',
    price: 95000,
    originalPrice: 95000,
    finalPrice: 95000,
    agentId: 101,
    agencyId: 1,
    createdAt: '2024-01-11T15:30:00',
    updatedAt: '2024-01-19T10:20:00',
    notes: 'Valeur élevée, assurance spéciale',
    rejectionReason: '',
    pickupDate: '2024-01-13T14:00:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-008',
    isUrgent: true,
    specialInstructions: 'Bijoux précieux, signature obligatoire'
  },
  {
    id: 11,
    clientName: 'Souleymane Diabaté',
    clientEmail: 'souleymane.diabate@email.com',
    clientPhone: '+225 27 22 49 50 30',
    destination: 'Portugal',
    weight: 7.2,
    dimensions: '32x24x16 cm',
    description: 'Produits alimentaires locaux',
    status: 'pending',
    price: 48000,
    originalPrice: 48000,
    finalPrice: 48000,
    agentId: null,
    agencyId: 1,
    createdAt: '2024-01-18T08:45:00',
    updatedAt: '2024-01-18T08:45:00',
    notes: 'Nouvelle demande en attente',
    rejectionReason: '',
    pickupDate: null,
    deliveryDate: null,
    invoiceNumber: null,
    isUrgent: false,
    specialInstructions: 'Produits alimentaires, respecter la chaîne du froid'
  },
  {
    id: 12,
    clientName: 'Aminata Touré',
    clientEmail: 'aminata.toure@email.com',
    clientPhone: '+225 27 22 49 50 31',
    destination: 'Suède',
    weight: 3.5,
    dimensions: '26x18x10 cm',
    description: 'Livres et documents académiques',
    status: 'pending',
    price: 38000,
    originalPrice: 38000,
    finalPrice: 38000,
    agentId: null,
    agencyId: 1,
    createdAt: '2024-01-18T12:30:00',
    updatedAt: '2024-01-18T12:30:00',
    notes: 'Documents académiques importants',
    rejectionReason: '',
    pickupDate: null,
    deliveryDate: null,
    invoiceNumber: null,
    isUrgent: true,
    specialInstructions: 'Documents académiques, éviter l\'humidité'
  },
  {
    id: 13,
    clientName: 'Moussa Konaté',
    clientEmail: 'moussa.konate@email.com',
    clientPhone: '+225 27 22 49 50 32',
    destination: 'Norvège',
    weight: 11.8,
    dimensions: '45x35x25 cm',
    description: 'Équipements de sport et vêtements',
    status: 'accepted',
    price: 92000,
    originalPrice: 92000,
    finalPrice: 92000,
    agentId: 102,
    agencyId: 1,
    createdAt: '2024-01-17T16:20:00',
    updatedAt: '2024-01-18T13:45:00',
    notes: 'Équipements pour compétition sportive',
    rejectionReason: '',
    pickupDate: '2024-01-19T09:00:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-009',
    isUrgent: false,
    specialInstructions: 'Équipements de sport, éviter les chocs'
  },
  {
    id: 14,
    clientName: 'Hawa Cissé',
    clientEmail: 'hawa.cisse@email.com',
    clientPhone: '+225 27 22 49 50 33',
    destination: 'Danemark',
    weight: 2.8,
    dimensions: '22x16x8 cm',
    description: 'Produits de beauté et cosmétiques',
    status: 'pickup_in_progress',
    price: 32000,
    originalPrice: 32000,
    finalPrice: 32000,
    agentId: 101,
    agencyId: 1,
    createdAt: '2024-01-16T14:10:00',
    updatedAt: '2024-01-18T15:30:00',
    notes: 'Produits de beauté pour salon',
    rejectionReason: '',
    pickupDate: '2024-01-19T11:00:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-010',
    isUrgent: false,
    specialInstructions: 'Produits cosmétiques, température ambiante'
  },
  {
    id: 15,
    clientName: 'Ibrahim Fofana',
    clientEmail: 'ibrahim.fofana@email.com',
    clientPhone: '+225 27 22 49 50 34',
    destination: 'Finlande',
    weight: 5.6,
    dimensions: '30x22x15 cm',
    description: 'Outils et équipements techniques',
    status: 'in_transit',
    price: 68000,
    originalPrice: 68000,
    finalPrice: 72000,
    agentId: 102,
    agencyId: 1,
    createdAt: '2024-01-12T09:30:00',
    updatedAt: '2024-01-18T12:15:00',
    notes: 'Prix ajusté après vérification des dimensions',
    rejectionReason: '',
    pickupDate: '2024-01-14T13:00:00',
    deliveryDate: null,
    invoiceNumber: 'INV-2024-011',
    isUrgent: false,
    specialInstructions: 'Outils techniques, éviter l\'humidité'
  }
];

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Initialiser les demandes de test dans localStorage
  useEffect(() => {
    const existingRequests = localStorage.getItem('requests');
    if (!existingRequests) {
      localStorage.setItem('requests', JSON.stringify(TEST_REQUESTS));
    }
    
    const savedRequests = localStorage.getItem('requests');
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    }
    
    setLoading(false);
  }, []);

  // Générer un numéro de facture
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const existingInvoices = requests.filter(r => r.invoiceNumber && r.invoiceNumber.startsWith(`INV-${year}`));
    const nextNumber = existingInvoices.length + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  // Créer une nouvelle demande
  const createRequest = async (requestData) => {
    try {
      const newRequest = {
        id: Date.now(),
        ...requestData,
        status: 'pending',
        agentId: null,
        originalPrice: requestData.price,
        finalPrice: requestData.price,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: '',
        rejectionReason: '',
        pickupDate: null,
        deliveryDate: null,
        invoiceNumber: null,
        isUrgent: requestData.isUrgent || false,
        specialInstructions: requestData.specialInstructions || ''
      };

      const updatedRequests = [...requests, newRequest];
      setRequests(updatedRequests);
      localStorage.setItem('requests', JSON.stringify(updatedRequests));

      // Ajouter une notification
      addNotification('Nouvelle demande', `Demande #${newRequest.id} reçue de ${newRequest.clientName}`, 'info');

      return {
        success: true,
        message: 'Demande créée avec succès',
        request: newRequest
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la création de la demande'
      };
    }
  };

  // Mettre à jour une demande
  const updateRequest = async (requestId, requestData) => {
    try {
      const updatedRequests = requests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              ...requestData, 
              updatedAt: new Date().toISOString() 
            } 
          : request
      );
      setRequests(updatedRequests);
      localStorage.setItem('requests', JSON.stringify(updatedRequests));

      return {
        success: true,
        message: 'Demande mise à jour avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la mise à jour de la demande'
      };
    }
  };

  // Accepter une demande
  const acceptRequest = async (requestId, agentId, notes = '') => {
    try {
      const invoiceNumber = generateInvoiceNumber();
      const updatedRequests = requests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'accepted',
              agentId,
              notes,
              invoiceNumber,
              updatedAt: new Date().toISOString() 
            } 
          : request
      );
      setRequests(updatedRequests);
      localStorage.setItem('requests', JSON.stringify(updatedRequests));

      // Ajouter une notification
      const request = updatedRequests.find(r => r.id === requestId);
      addNotification('Demande acceptée', `Demande #${requestId} acceptée par l'agent`, 'success');

      return {
        success: true,
        message: 'Demande acceptée avec succès',
        invoiceNumber
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'acceptation de la demande'
      };
    }
  };

  // Refuser une demande
  const rejectRequest = async (requestId, agentId, rejectionReason) => {
    try {
      const updatedRequests = requests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'rejected',
              agentId,
              rejectionReason,
              updatedAt: new Date().toISOString() 
            } 
          : request
      );
      setRequests(updatedRequests);
      localStorage.setItem('requests', JSON.stringify(updatedRequests));

      // Ajouter une notification
      addNotification('Demande refusée', `Demande #${requestId} refusée`, 'warning');

      return {
        success: true,
        message: 'Demande refusée avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du refus de la demande'
      };
    }
  };

  // Mettre à jour le statut d'une demande
  const updateRequestStatus = async (requestId, status, notes = '', additionalData = {}) => {
    try {
      const updatedRequests = requests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status,
              notes: notes || request.notes,
              ...additionalData,
              updatedAt: new Date().toISOString() 
            } 
          : request
      );
      setRequests(updatedRequests);
      localStorage.setItem('requests', JSON.stringify(updatedRequests));

      // Ajouter une notification
      const request = updatedRequests.find(r => r.id === requestId);
      addNotification('Statut mis à jour', `Demande #${requestId} : ${getStatusLabel(status)}`, 'info');

      return {
        success: true,
        message: 'Statut mis à jour avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la mise à jour du statut'
      };
    }
  };

  // Ajuster le prix d'une demande
  const adjustPrice = async (requestId, newPrice, reason = '') => {
    try {
      const updatedRequests = requests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              finalPrice: newPrice,
              notes: reason ? `${request.notes}\nAjustement prix: ${reason}` : request.notes,
              updatedAt: new Date().toISOString() 
            } 
          : request
      );
      setRequests(updatedRequests);
      localStorage.setItem('requests', JSON.stringify(updatedRequests));

      // Ajouter une notification
      addNotification('Prix ajusté', `Prix de la demande #${requestId} ajusté`, 'info');

      return {
        success: true,
        message: 'Prix ajusté avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'ajustement du prix'
      };
    }
  };

  // Supprimer une demande
  const deleteRequest = async (requestId) => {
    try {
      const updatedRequests = requests.filter(request => request.id !== requestId);
      setRequests(updatedRequests);
      localStorage.setItem('requests', JSON.stringify(updatedRequests));

      return {
        success: true,
        message: 'Demande supprimée avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la suppression de la demande'
      };
    }
  };

  // Obtenir les demandes par agence
  const getRequestsByAgency = (agencyId) => {
    return requests.filter(request => request.agencyId === agencyId);
  };

  // Obtenir les demandes par agent
  const getRequestsByAgent = (agentId) => {
    return requests.filter(request => request.agentId === agentId);
  };

  // Obtenir les demandes par statut
  const getRequestsByStatus = (status) => {
    return requests.filter(request => request.status === status);
  };

  // Obtenir les nouvelles demandes (en attente)
  const getNewRequests = (agencyId) => {
    return getRequestsByAgency(agencyId).filter(request => request.status === 'pending');
  };

  // Obtenir les statistiques
  const getRequestStats = (agencyId) => {
    const agencyRequests = getRequestsByAgency(agencyId);
    return {
      total: agencyRequests.length,
      pending: agencyRequests.filter(r => r.status === 'pending').length,
      accepted: agencyRequests.filter(r => r.status === 'accepted').length,
      rejected: agencyRequests.filter(r => r.status === 'rejected').length,
      pickupInProgress: agencyRequests.filter(r => r.status === 'pickup_in_progress').length,
      dropoffInProgress: agencyRequests.filter(r => r.status === 'dropoff_in_progress').length,
      collected: agencyRequests.filter(r => r.status === 'collected').length,
      registered: agencyRequests.filter(r => r.status === 'registered').length,
      inTransit: agencyRequests.filter(r => r.status === 'in_transit').length,
      deliveryInProgress: agencyRequests.filter(r => r.status === 'delivery_in_progress').length,
      delivered: agencyRequests.filter(r => r.status === 'delivered').length,
      totalRevenue: agencyRequests
        .filter(r => r.status === 'delivered')
        .reduce((sum, r) => sum + r.finalPrice, 0),
      urgentRequests: agencyRequests.filter(r => r.isUrgent).length
    };
  };

  // Obtenir le label du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'pickup_in_progress': return 'En cours d\'enlèvement';
      case 'dropoff_in_progress': return 'En cours de dépôt';
      case 'collected': return 'Collecté';
      case 'registered': return 'Enregistré';
      case 'in_transit': return 'En transit';
      case 'delivery_in_progress': return 'En cours de livraison';
      case 'delivered': return 'Livré';
      default: return status;
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pickup_in_progress': return 'bg-purple-100 text-purple-800';
      case 'dropoff_in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'collected': return 'bg-green-100 text-green-800';
      case 'registered': return 'bg-teal-100 text-teal-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivery_in_progress': return 'bg-pink-100 text-pink-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'pickup_in_progress': return '🚚';
      case 'dropoff_in_progress': return '📦';
      case 'collected': return '📥';
      case 'registered': return '📋';
      case 'in_transit': return '✈️';
      case 'delivery_in_progress': return '🚛';
      case 'delivered': return '🎉';
      default: return '📋';
    }
  };

  // Obtenir le prochain statut possible
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': ['accepted', 'rejected'],
      'accepted': ['pickup_in_progress'],
      'pickup_in_progress': ['collected', 'dropoff_in_progress'],
      'dropoff_in_progress': ['collected'],
      'collected': ['registered'],
      'registered': ['in_transit'],
      'in_transit': ['delivery_in_progress'],
      'delivery_in_progress': ['delivered'],
      'delivered': []
    };
    return statusFlow[currentStatus] || [];
  };

  // Ajouter une notification
  const addNotification = (title, message, type = 'info') => {
    const notification = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Garder max 10 notifications
  };

  // Marquer une notification comme lue
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Obtenir les notifications non lues
  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.isRead);
  };

  // Générer une facture
  const generateInvoice = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return null;

    return {
      invoiceNumber: request.invoiceNumber,
      date: new Date().toISOString(),
      client: {
        name: request.clientName,
        email: request.clientEmail,
        phone: request.clientPhone
      },
      items: [{
        description: request.description,
        destination: request.destination,
        weight: request.weight,
        dimensions: request.dimensions,
        quantity: 1,
        unitPrice: request.finalPrice,
        total: request.finalPrice
      }],
      subtotal: request.finalPrice,
      tax: 0,
      total: request.finalPrice,
      currency: 'XOF',
      status: request.status,
      specialInstructions: request.specialInstructions
    };
  };

  const value = {
    requests,
    loading,
    notifications,
    createRequest,
    updateRequest,
    acceptRequest,
    rejectRequest,
    updateRequestStatus,
    adjustPrice,
    deleteRequest,
    getRequestsByAgency,
    getRequestsByAgent,
    getRequestsByStatus,
    getNewRequests,
    getRequestStats,
    getStatusLabel,
    getStatusColor,
    getStatusIcon,
    getNextStatus,
    addNotification,
    markNotificationAsRead,
    getUnreadNotifications,
    generateInvoice
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};
