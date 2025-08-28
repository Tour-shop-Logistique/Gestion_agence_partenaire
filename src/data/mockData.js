// Statuts des colis pour les demandes
export const packageStatuses = [
  'En attente',
  'Acceptée',
  'Refusée',
  'En cours d\'enlèvement',
  'En cours de dépôt',
  'Collecté',
  'Enregistré',
  'En transit',
  'En cours de livraison',
  'Livré'
];

// Données mock pour les agences ivoiriennes d'exportation
export const mockAgencies = [
  {
    id: 1,
    name: "Côte d'Ivoire Express",
    email: "contact@cotedivoire-express.ci",
    password: "password123",
    location: "Abidjan, Côte d'Ivoire",
    hours: "Lun-Ven: 8h-18h, Sam: 9h-15h",
    logo: "🇨🇮",
    description: "Leader de l'exportation de produits ivoiriens vers l'Europe et l'Afrique",
    phone: "+225 27 22 49 50 00",
    address: "Zone 4, Marcory, Abidjan, Côte d'Ivoire"
  },
  {
    id: 2,
    name: "Afrikan Logistics",
    email: "info@afrikan-logistics.ci",
    password: "password123",
    location: "Yamoussoukro, Côte d'Ivoire",
    hours: "Lun-Ven: 7h-19h, Sam: 8h-16h",
    logo: "🚢",
    description: "Spécialiste du transport maritime pour l'exportation de produits diversifiés",
    phone: "+225 30 64 00 00",
    address: "Boulevard de la République, Yamoussoukro"
  },
  {
    id: 3,
    name: "Golden Coast Shipping",
    email: "export@goldencoast-shipping.ci",
    password: "password123",
    location: "San-Pédro, Côte d'Ivoire",
    hours: "Lun-Sam: 6h-20h",
    logo: "⚓",
    description: "Exportation de produits halieutiques et manufacturés du port de San-Pédro",
    phone: "+225 34 71 00 00",
    address: "Port Autonome de San-Pédro, Zone Industrielle"
  },
  {
    id: 4,
    name: "Ivory Trade Express",
    email: "contact@gmail.ci",
    password: "password123",
    location: "Bouaké, Côte d'Ivoire",
    hours: "Lun-Ven: 8h-17h",
    logo: "🌱",
    description: "Exportation de textiles et produits manufacturés vers l'Asie et l'Europe",
    phone: "+225 31 63 00 00",
    address: "Zone Industrielle, Bouaké, Vallée du Bandama"
  }
];

// Tarifs adaptés pour l'exportation ivoirienne
export const mockTariffs = [
  {
    id: 1,
    agencyId: 1,
    destination: "France",
    weight: "0-5kg",
    price: 45000,
    currency: "FCFA",
    deliveryTime: "3-5 jours",
    description: "Export express de produits manufacturés et textiles",
    serviceType: "Express",
    productType: "Textiles"
  },
  {
    id: 2,
    agencyId: 1,
    destination: "Allemagne",
    weight: "5-20kg",
    price: 85000,
    currency: "FCFA",
    deliveryTime: "5-7 jours",
    description: "Transport de produits manufacturés vers l'Europe centrale",
    serviceType: "Standard",
    productType: "Produits manufacturés"
  },
  {
    id: 3,
    agencyId: 2,
    destination: "États-Unis",
    weight: "20-50kg",
    price: 180000,
    currency: "FCFA",
    deliveryTime: "7-10 jours",
    description: "Export maritime de produits diversifiés vers l'Amérique du Nord",
    serviceType: "Maritime",
    productType: "Produits diversifiés"
  },
  {
    id: 4,
    agencyId: 2,
    destination: "Chine",
    weight: "50-100kg",
    price: 320000,
    currency: "FCFA",
    deliveryTime: "12-15 jours",
    description: "Transport de produits manufacturés vers l'Asie",
    serviceType: "Maritime",
    productType: "Produits manufacturés"
  },
  {
    id: 5,
    agencyId: 3,
    destination: "Maroc",
    weight: "0-5kg",
    price: 35000,
    currency: "FCFA",
    deliveryTime: "2-3 jours",
    description: "Export rapide de produits halieutiques vers l'Afrique du Nord",
    serviceType: "Express",
    productType: "Produits halieutiques"
  },
  {
    id: 6,
    agencyId: 3,
    destination: "Sénégal",
    weight: "5-20kg",
    price: 28000,
    currency: "FCFA",
    deliveryTime: "1-2 jours",
    description: "Transport terrestre vers l'Afrique de l'Ouest",
    serviceType: "Terrestre",
    productType: "Produits diversifiés"
  },
  {
    id: 7,
    agencyId: 4,
    destination: "Inde",
    weight: "20-50kg",
    price: 150000,
    currency: "FCFA",
    deliveryTime: "10-12 jours",
    description: "Export de textiles vers l'industrie textile indienne",
    serviceType: "Maritime",
    productType: "Textiles"
  },
  {
    id: 8,
    agencyId: 4,
    destination: "Nigeria",
    weight: "0-5kg",
    price: 22000,
    currency: "FCFA",
    deliveryTime: "1-2 jours",
    description: "Export rapide vers le marché nigérian",
    serviceType: "Express",
    productType: "Produits manufacturés"
  }
];



// Demandes client
export const mockClientRequests = [
  {
    id: 1,
    agencyId: 1,
    clientName: "Fatou Traoré",
    clientEmail: "fatou.traore@email.com",
    clientPhone: "+225 07 12 34 56 78",
    destination: "France",
    packageDetails: {
      weight: "3.5kg",
      dimensions: "30x20x15cm",
      description: "Textiles traditionnels ivoiriens",
      declaredValue: 75000,
      currency: "FCFA"
    },
    status: "En attente",
    requestDate: "2024-01-15T10:30:00Z",
    estimatedDelivery: "2024-01-20",
    tariffId: 1,
    originalPrice: 45000,
    finalPrice: 45000,
    notes: "Colis fragile, nécessite un traitement spécial",
    isUrgent: false
  },
  {
    id: 2,
    agencyId: 1,
    clientName: "Kouassi Yao",
    clientEmail: "kouassi.yao@email.com",
    clientPhone: "+225 05 98 76 54 32",
    destination: "Allemagne",
    packageDetails: {
      weight: "12kg",
      dimensions: "50x40x30cm",
      description: "Produits manufacturés en bois",
      declaredValue: 180000,
      currency: "FCFA"
    },
    status: "Acceptée",
    requestDate: "2024-01-14T14:20:00Z",
    estimatedDelivery: "2024-01-21",
    tariffId: 2,
    originalPrice: 85000,
    finalPrice: 85000,
    notes: "Vérification du poids requise",
    isUrgent: true
  },
  {
    id: 3,
    agencyId: 2,
    clientName: "Moussa Koné",
    clientEmail: "moussa.kone@email.com",
    clientPhone: "+225 08 11 22 33 44",
    destination: "États-Unis",
    packageDetails: {
      weight: "35kg",
      dimensions: "80x60x40cm",
      description: "Cosmétiques naturels",
      declaredValue: 450000,
      currency: "FCFA"
    },
    status: "En cours d'enlèvement",
    requestDate: "2024-01-13T09:15:00Z",
    estimatedDelivery: "2024-01-23",
    tariffId: 3,
    originalPrice: 180000,
    finalPrice: 195000,
    notes: "Poids réel supérieur au déclaré",
    isUrgent: false
  },
  {
    id: 4,
    agencyId: 3,
    clientName: "Aminata Diallo",
    clientEmail: "aminata.diallo@email.com",
    clientPhone: "+225 06 55 44 33 22",
    destination: "Maroc",
    packageDetails: {
      weight: "2kg",
      dimensions: "25x15x10cm",
      description: "Produits halieutiques séchés",
      declaredValue: 120000,
      currency: "FCFA"
    },
    status: "Collecté",
    requestDate: "2024-01-12T16:45:00Z",
    estimatedDelivery: "2024-01-15",
    tariffId: 5,
    originalPrice: 35000,
    finalPrice: 35000,
    notes: "Colis en bon état",
    isUrgent: true
  },
  {
    id: 5,
    agencyId: 4,
    clientName: "Bakary Sissoko",
    clientEmail: "bakary.sissoko@email.com",
    clientPhone: "+225 09 88 77 66 55",
    destination: "Inde",
    packageDetails: {
      weight: "28kg",
      dimensions: "70x50x35cm",
      description: "Textiles de luxe",
      declaredValue: 800000,
      currency: "FCFA"
    },
    status: "En transit",
    requestDate: "2024-01-11T11:30:00Z",
    estimatedDelivery: "2024-01-23",
    tariffId: 7,
    originalPrice: 150000,
    finalPrice: 150000,
    notes: "Colis assuré",
    isUrgent: false
  }
];

// Messages de chat
export const mockChatMessages = [
  {
    id: 1,
    requestId: 1,
    sender: "client",
    senderName: "Fatou Traoré",
    message: "Bonjour, j'aimerais savoir si mon colis a été accepté ?",
    timestamp: "2024-01-15T10:35:00Z",
    isRead: true
  },
  {
    id: 2,
    requestId: 1,
    sender: "agency",
    senderName: "Côte d'Ivoire Express",
    message: "Bonjour Fatou, votre demande est en cours d'examen. Nous vous répondrons dans les 24h.",
    timestamp: "2024-01-15T10:40:00Z",
    isRead: true
  },
  {
    id: 3,
    requestId: 2,
    sender: "client",
    senderName: "Kouassi Yao",
    message: "Mon colis est-il prêt pour l'enlèvement ?",
    timestamp: "2024-01-15T14:20:00Z",
    isRead: false
  },
  {
    id: 4,
    requestId: 3,
    sender: "agency",
    senderName: "Afrikan Logistics",
    message: "Moussa, nous avons noté une différence de poids. Le prix final sera ajusté.",
    timestamp: "2024-01-15T09:30:00Z",
    isRead: true
  },
  {
    id: 5,
    requestId: 3,
    sender: "client",
    senderName: "Moussa Koné",
    message: "D'accord, je comprends. Quand pouvez-vous venir récupérer ?",
    timestamp: "2024-01-15T09:35:00Z",
    isRead: true
  }
];

// Factures
export const mockInvoices = [
  {
    id: 1,
    requestId: 1,
    invoiceNumber: "FACT-2024-001",
    issueDate: "2024-01-15",
    dueDate: "2024-01-22",
    clientName: "Fatou Traoré",
    clientEmail: "fatou.traore@email.com",
    clientAddress: "Cocody, Abidjan, Côte d'Ivoire",
    items: [
      {
        description: "Transport express vers France",
        quantity: 1,
        unitPrice: 45000,
        total: 45000
      }
    ],
    subtotal: 45000,
    tax: 0,
    total: 45000,
    currency: "FCFA",
    status: "En attente",
    paymentMethod: "À définir"
  },
  {
    id: 2,
    requestId: 2,
    invoiceNumber: "FACT-2024-002",
    issueDate: "2024-01-14",
    dueDate: "2024-01-21",
    clientName: "Kouassi Yao",
    clientEmail: "kouassi.yao@email.com",
    clientAddress: "Yopougon, Abidjan, Côte d'Ivoire",
    items: [
      {
        description: "Transport standard vers Allemagne",
        quantity: 1,
        unitPrice: 85000,
        total: 85000
      }
    ],
    subtotal: 85000,
    tax: 0,
    total: 85000,
    currency: "FCFA",
    status: "Payée",
    paymentMethod: "Virement bancaire"
  },
  {
    id: 3,
    requestId: 3,
    invoiceNumber: "FACT-2024-003",
    issueDate: "2024-01-13",
    dueDate: "2024-01-20",
    clientName: "Moussa Koné",
    clientEmail: "moussa.kone@email.com",
    clientAddress: "Marcory, Abidjan, Côte d'Ivoire",
    items: [
      {
        description: "Transport maritime vers États-Unis",
        quantity: 1,
        unitPrice: 180000,
        total: 180000
      },
      {
        description: "Ajustement poids supplémentaire",
        quantity: 1,
        unitPrice: 15000,
        total: 15000
      }
    ],
    subtotal: 195000,
    tax: 0,
    total: 195000,
    currency: "FCFA",
    status: "En attente",
    paymentMethod: "À définir"
  }
];

// Notifications
export const mockNotifications = [
  {
    id: 1,
    type: "new_request",
    title: "Nouvelle demande client",
    message: "Fatou Traoré a soumis une nouvelle demande d'exportation",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
    requestId: 1
  },
  {
    id: 2,
    type: "status_update",
    title: "Statut mis à jour",
    message: "Le colis de Kouassi Yao est maintenant 'Acceptée'",
    timestamp: "2024-01-15T14:20:00Z",
    isRead: false,
    requestId: 2
  },
  {
    id: 3,
    type: "price_adjustment",
    title: "Ajustement de prix",
    message: "Le prix du colis de Moussa Koné a été ajusté à 195,000 FCFA",
    timestamp: "2024-01-15T09:30:00Z",
    isRead: true,
    requestId: 3
  },
  {
    id: 4,
    type: "new_message",
    title: "Nouveau message",
    message: "Kouassi Yao a envoyé un message concernant son colis",
    timestamp: "2024-01-15T14:20:00Z",
    isRead: false,
    requestId: 2
  }
];

// Destinations adaptées pour l'exportation ivoirienne
export const destinations = [
  // Europe
  "France", "Allemagne", "Belgique", "Pays-Bas", "Suisse", "Italie", "Espagne", "Royaume-Uni",
  // Afrique
  "Nigeria", "Ghana", "Sénégal", "Mali", "Burkina Faso", "Maroc", "Algérie", "Tunisie", "Égypte", "Afrique du Sud",
  // Amérique
  "États-Unis", "Canada", "Brésil", "Mexique",
  // Asie
  "Chine", "Japon", "Inde", "Corée du Sud", "Singapour", "Malaisie", "Thaïlande",
  // Moyen-Orient
  "Émirats Arabes Unis", "Arabie Saoudite", "Turquie",
  // Océanie
  "Australie", "Nouvelle-Zélande"
];

// Poids adaptés pour l'exportation
export const weightRanges = [
  "0-5kg",
  "5-20kg",
  "20-50kg",
  "50-100kg",
  "100-500kg",
  "500kg-1 tonne",
  "1-5 tonnes",
  "5+ tonnes"
];

// Types de services d'exportation
export const serviceTypes = [
  "Express",
  "Standard",
  "Maritime",
  "Terrestre",
  "Aérien",
  "Multimodal"
];

// Produits d'exportation ivoiriens diversifiés
export const exportProducts = [
  "Textiles",
  "Produits manufacturés",
  "Produits halieutiques",
  "Produits cosmétiques",
  "Produits artisanaux",
  "Produits technologiques",
  "Produits pharmaceutiques",
  "Produits alimentaires transformés",
  "Produits de beauté",
  "Produits de construction",
  "Produits électriques",
  "Produits chimiques",
  "Produits métallurgiques",
  "Autres"
];

// Motifs de refus
export const rejectionReasons = [
  "Poids/dimensions incorrects",
  "Produit interdit",
  "Documentation incomplète",
  "Prix insuffisant",
  "Destination non desservie",
  "Capacité d'expédition atteinte",
  "Problème de sécurité",
  "Autre"
];
