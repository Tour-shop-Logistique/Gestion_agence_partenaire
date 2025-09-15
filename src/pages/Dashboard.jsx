import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestContext';
import { useTariffs } from '../contexts/TariffContext';
import { useAgency } from '../contexts/AgencyContext';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, getAgentsByAgency, isAdmin, isAgent } = useAuth();
  const { getRequestStats, getNewRequests } = useRequests();
  const { tariffs, loading: tariffsLoading, error: tariffsError } = useTariffs();
  const { getAgencyByManagerEmail } = useAgency();

  const userAgents = getAgentsByAgency(currentUser?.id);
  const requestStats = getRequestStats(currentUser?.id);
  const newRequests = getNewRequests(currentUser?.id);

  // Admin statistics
  const adminStats = [
    {
      title: 'Agents actifs',
      value: userAgents.filter(agent => agent.status === 'active').length,
      icon: '👥',
      color: 'bg-blue-100 text-blue-600',
      description: 'Agents dans votre équipe'
    },
    {
      title: 'Nouvelles demandes',
      value: newRequests.length,
      icon: '📋',
      color: 'bg-red-100 text-red-600',
      description: 'Demandes en attente'
    },
    {
      title: 'En cours',
      value: requestStats.pickupInProgress + requestStats.dropoffInProgress + requestStats.inTransit + requestStats.deliveryInProgress,
      icon: '🔄',
      color: 'bg-orange-100 text-orange-600',
      description: 'Expéditions en cours'
    },
    {
      title: 'Livrées',
      value: requestStats.delivered,
      icon: '✅',
      color: 'bg-green-100 text-green-600',
      description: 'Expéditions terminées'
    },
    {
      title: 'Tarifs configurés',
      value: Array.isArray(tariffs) ? tariffs.length : 0,
      icon: '💰',
      color: 'bg-purple-100 text-purple-600',
      description: 'Tarifs disponibles'
    },
    {
      title: 'Revenus',
      value: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(requestStats.totalRevenue),
      icon: '💰',
      color: 'bg-purple-100 text-purple-600',
      description: 'Chiffre d\'affaires'
    },
    {
      title: 'Demandes urgentes',
      value: requestStats.urgentRequests,
      icon: '🔥',
      color: 'bg-red-100 text-red-600',
      description: 'Priorité haute'
    }
  ];

  // Agent statistics
  const agentStats = [
    {
      title: 'Expéditions assignées',
      value: requestStats.total,
      icon: '📦',
      color: 'bg-blue-100 text-blue-600',
      description: 'Total des demandes'
    },
    {
      title: 'En cours',
      value: requestStats.pickupInProgress + requestStats.dropoffInProgress + requestStats.inTransit + requestStats.deliveryInProgress,
      icon: '🔄',
      color: 'bg-orange-100 text-orange-600',
      description: 'Expéditions en cours'
    },
    {
      title: 'Livrées',
      value: requestStats.delivered,
      icon: '✅',
      color: 'bg-green-100 text-green-600',
      description: 'Expéditions terminées'
    },
    {
      title: 'Revenus générés',
      value: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(requestStats.totalRevenue),
      icon: '💰',
      color: 'bg-purple-100 text-purple-600',
      description: 'Chiffre d\'affaires'
    }
  ];

  const stats = isAdmin() ? adminStats : agentStats;

  return (
    <DashboardLayout>
      {/* Titre de la page */}
      <div className="mb-8">
        {(() => {
          const displayName = currentUser?.name 
            || [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(' ')
            || 'Utilisateur';
          return (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenue, {displayName} !
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isAdmin() ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isAdmin() ? 'Administrateur' : 'Agent'}
              </span>
            </div>
          );
        })()}
        <p className="text-gray-600 mt-2">
          {isAdmin() 
            ? 'Gérez votre équipe et suivez les performances de votre agence'
            : 'Gérez vos expéditions et suivez vos performances'
          }
        </p>
      </div>

      {/* Alertes pour nouvelles demandes */}
      {isAdmin() && newRequests.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {newRequests.length} nouvelle{newRequests.length > 1 ? 's' : ''} demande{newRequests.length > 1 ? 's' : ''} en attente
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Des demandes clients nécessitent votre attention.</p>
              </div>
              <div className="mt-4">
                <Link
                  to="/requests"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  Voir les demandes →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                    <dd className="text-xs text-gray-500">
                      {stat.description}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Actions rapides
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isAdmin() ? (
              <>
                <Link to="/agents" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl mr-3">👥</span>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Gérer les agents</h4>
                    <p className="text-sm text-gray-500">Ajouter ou modifier des agents</p>
                  </div>
                </Link>
                <Link to="/requests" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl mr-3">📋</span>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Voir les demandes</h4>
                    <p className="text-sm text-gray-500">Consulter les demandes clients</p>
                  </div>
                </Link>
                <Link to="/tariffs" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl mr-3">💰</span>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Configurer les tarifs</h4>
                    <p className="text-sm text-gray-500">Gérer les prix d'expédition</p>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/requests" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl mr-3">📋</span>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Nouvelles demandes</h4>
                    <p className="text-sm text-gray-500">Traiter les demandes clients</p>
                  </div>
                </Link>
                <Link to="/shipments" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl mr-3">📦</span>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Suivre les expéditions</h4>
                    <p className="text-sm text-gray-500">Mettre à jour les statuts</p>
                  </div>
                </Link>
                <Link to="/tariffs" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl mr-3">💰</span>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Consulter les tarifs</h4>
                    <p className="text-sm text-gray-500">Voir les prix d'expédition</p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section récente pour admin */}
      {isAdmin() && userAgents.length > 0 && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Agents récents
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAgents.slice(0, 3).map((agent) => (
                <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-500">{agent.email}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                        agent.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {agent.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section récente pour agent */}
      {isAgent() && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Dernières activités
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-600 mr-3">✅</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Demande acceptée</p>
                  <p className="text-xs text-gray-500">Colis #1234 - Client: Jean Dupont</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600 mr-3">📦</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Expédition mise à jour</p>
                  <p className="text-xs text-gray-500">Colis #1235 - Statut: En transit</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-600 mr-3">⏳</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Nouvelle demande</p>
                  <p className="text-xs text-gray-500">Colis #1236 - En attente de traitement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informations supplémentaires pour admin */}
      {isAdmin() && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations de l'agence */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Informations de l'agence</h3>
                <Link
                  to="/agency-profile"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Modifier
                </Link>
              </div>
            </div>
            <div className="p-6">
              {(() => {
                const userAgency = getAgencyByManagerEmail(currentUser?.email);
                if (userAgency) {
                  return (
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Nom</span>
                        <p className="text-sm font-medium">{userAgency.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Code</span>
                        <p className="text-sm font-medium">{userAgency.code}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Ville</span>
                        <p className="text-sm font-medium">{userAgency.city}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Téléphone</span>
                        <p className="text-sm font-medium">{userAgency.phone}</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">Aucune information d'agence</p>
                      <Link
                        to="/agency-profile"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Configurer l'agence
                      </Link>
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          {/* Résumé des tarifs */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Résumé des tarifs</h3>
            </div>
            <div className="p-6">
              {tariffsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : tariffsError ? (
                <div className="text-red-500 text-sm">Erreur lors du chargement des tarifs</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total tarifs</span>
                    <span className="text-sm font-medium">{tariffs?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tarifs actifs</span>
                    <span className="text-sm font-medium">
                      {tariffs?.filter(t => t?.actif)?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Indices uniques</span>
                    <span className="text-sm font-medium">
                      {tariffs?.length ? [...new Set(tariffs.map(t => t?.indice))].length : 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Résumé des demandes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Résumé des demandes</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total demandes</span>
                  <span className="text-sm font-medium">{requestStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">En attente</span>
                  <span className="text-sm font-medium">{requestStats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">En cours</span>
                  <span className="text-sm font-medium">{requestStats.pickupInProgress + requestStats.dropoffInProgress + requestStats.inTransit + requestStats.deliveryInProgress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Livrées</span>
                  <span className="text-sm font-medium">{requestStats.delivered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenus totaux</span>
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF'
                    }).format(requestStats.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
