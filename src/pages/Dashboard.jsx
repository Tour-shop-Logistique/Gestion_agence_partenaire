import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

// Import du hook personnalisé pour l'authentification
import { useAuth } from "../hooks/useAuth";

// Import du hook personnalisé pour l'agence
import { useAgency } from "../hooks/useAgency";

// Import du hook personnalisé pour les tarifs
import { useTarifs } from "../hooks/useTarifs";

const Dashboard = () => {
  // Utilisation du hook d'authentification
  const { currentUser, isAdmin } = useAuth();

  // Utilisation du hook personnalisé pour l'agence
  const {
    data: agencyData,
    users: agencyUsers,
    status: agencyStatus,
    fetchAgencyData,
    fetchUsers
  } = useAgency();

  // Utilisation du hook personnalisé pour les tarifs
  const {
    existingTarifs: tarifs,
    fetchAgencyTarifs
  } = useTarifs();

  // Chargement des données au montage du composant
  useEffect(() => {
    if (currentUser) {
      fetchAgencyData();
      fetchUsers();
      fetchAgencyTarifs();
    }
  }, [currentUser, fetchAgencyData, fetchUsers, fetchAgencyTarifs]);

  // Logique pour les agents (filtrer les utilisateurs de l'agence)
  const userAgents = Array.isArray(agencyUsers)
    ? agencyUsers.filter(agent => agent.agence_id === currentUser?.agence_id)
    : [];

  // Données fictives pour les statistiques d'expéditions
  const mockExpeditionStats = {
    total: 156,
    pickupInProgress: 12,
    dropoffInProgress: 8,
    inTransit: 23,
    deliveryInProgress: 15,
    delivered: 98,
    totalRevenue: 45750000,
    urgentRequests: 7,
    newRequests: 5
  };

  // Admin statistics
  const adminStats = [
    {
      title: "Agents actifs",
      value: userAgents.filter(agent => agent.status === "active").length,
      icon: "👥",
      color: "bg-blue-100 text-blue-600",
      description: "Agents dans votre équipe"
    },
    {
      title: "Nouvelles demandes",
      value: mockExpeditionStats.newRequests,
      icon: "📋",
      color: "bg-red-100 text-red-600",
      description: "Demandes en attente"
    },
    {
      title: "En cours",
      value: mockExpeditionStats.pickupInProgress + mockExpeditionStats.dropoffInProgress + mockExpeditionStats.inTransit + mockExpeditionStats.deliveryInProgress,
      icon: "🔄",
      color: "bg-orange-100 text-orange-600",
      description: "Expéditions en cours"
    },
    {
      title: "Livrées",
      value: mockExpeditionStats.delivered,
      icon: "✅",
      color: "bg-green-100 text-green-600",
      description: "Expéditions terminées"
    },
    {
      title: "Tarifs configurés",
      value: Array.isArray(tarifs) ? tarifs.length : 0,
      icon: "💰",
      color: "bg-purple-100 text-purple-600",
      description: "Tarifs disponibles"
    },
    {
      title: "Revenus",
      value: new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF"
      }).format(mockExpeditionStats.totalRevenue),
      icon: "💰",
      color: "bg-purple-100 text-purple-600",
      description: "Chiffre d'affaires"
    },
    {
      title: "Demandes urgentes",
      value: mockExpeditionStats.urgentRequests,
      icon: "🔥",
      color: "bg-red-100 text-red-600",
      description: "Priorité haute"
    }
  ];

  // Agent statistics
  const agentStats = [
    {
      title: "Expéditions assignées",
      value: mockExpeditionStats.total,
      icon: "📦",
      color: "bg-blue-100 text-blue-600",
      description: "Total des demandes"
    },
    {
      title: "En cours",
      value: mockExpeditionStats.pickupInProgress + mockExpeditionStats.dropoffInProgress + mockExpeditionStats.inTransit + mockExpeditionStats.deliveryInProgress,
      icon: "🔄",
      color: "bg-orange-100 text-orange-600",
      description: "Expéditions en cours"
    },
    {
      title: "Livrées",
      value: mockExpeditionStats.delivered,
      icon: "✅",
      color: "bg-green-100 text-green-600",
      description: "Expéditions terminées"
    },
    {
      title: "Revenus générés",
      value: new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF"
      }).format(mockExpeditionStats.totalRevenue),
      icon: "💰",
      color: "bg-purple-100 text-purple-600",
      description: "Chiffre d'affaires"
    }
  ];

  const stats = isAdmin ? adminStats : agentStats;

  // Vérifier si les données sont en cours de chargement
  const agencyLoading = agencyStatus === "loading";

  // Afficher un loader pendant le chargement initial
  if (agencyLoading && !agencyData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Titre de la page */}
      <div className="mb-6 md:mb-4">
        {(() => {
          const displayName = currentUser?.name 
            || [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(" ")
            || "Utilisateur";
          return (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenue, {displayName} !
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {isAdmin ? "Administrateur" : "Agent"}
              </span>
            </div>
          );
        })()}
        <p className="text-gray-600 mt-2 md:mt-1">
          {isAdmin 
            ? "Gérez votre équipe et suivez les performances de votre agence"
            : "Gérez vos expéditions et suivez vos performances"
          }
        </p>
      </div>

      {/* Alertes pour nouvelles demandes */}
      {isAdmin && mockExpeditionStats.newRequests > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {mockExpeditionStats.newRequests} nouvelle{mockExpeditionStats.newRequests > 1 ? "s" : ""} demande{mockExpeditionStats.newRequests > 1 ? "s" : ""} en attente
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Des demandes clients nécessitent votre attention.</p>
              </div>
              <div className="mt-4">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  Voir les demandes →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques - mobile-first grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <span className="text-lg sm:text-base">{stat.icon}</span>
                  </div>
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1 min-w-0">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-xl sm:text-lg font-semibold text-gray-900 truncate">
                      {stat.value}
                    </dd>
                    <dd className="text-xs text-gray-500 truncate">
                      {stat.description}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides - mobile-first */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 mb-6 sm:mb-8">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Actions rapides
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {isAdmin ? (
              <>
                <Link to="/agents" className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group">
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">👥</span>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">Gérer les agents</h4>
                    <p className="text-sm text-gray-500 truncate">Ajouter ou modifier des agents</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/tarifs" className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group">
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">💰</span>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">Gérer les tarifs</h4>
                    <p className="text-sm text-gray-500 truncate">Configurer les tarifs d'expédition</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/profile" className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group">
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">⚙️</span>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">Paramètres de l'agence</h4>
                    <p className="text-sm text-gray-500 truncate">Modifier les informations</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <Link to="/requests" className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group">
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">📋</span>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">Mes expéditions</h4>
                    <p className="text-sm text-gray-500 truncate">Voir mes expéditions assignées</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/profile" className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group">
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">👤</span>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">Mon profil</h4>
                    <p className="text-sm text-gray-500 truncate">Modifier mes informations</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default Dashboard;