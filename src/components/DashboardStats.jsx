import React from 'react';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import Card from './Card';
import { Link } from 'react-router-dom';

const DashboardStats = () => {
  const { currentUser, getAgentsByAgency } = useAuth();
  const { 
    getRequestsByAgency, 
    getTotalUnreadMessages,
    getRequestsByStatus 
  } = useRequests();

  const requests = getRequestsByAgency(currentUser?.id);
  const pendingRequests = getRequestsByStatus(currentUser?.id, 'pending');
  const acceptedRequests = getRequestsByStatus(currentUser?.id, 'accepted');
  const completedRequests = getRequestsByStatus(currentUser?.id, 'completed');
  const totalUnreadMessages = getTotalUnreadMessages(currentUser?.id);
  
  const agents = getAgentsByAgency(currentUser?.id);
  const activeAgents = agents.filter(agent => agent.status === 'active');

  const totalRevenue = completedRequests.reduce((sum, req) => sum + (req.finalPrice || 0), 0);

  const stats = [
    {
      title: "Demandes totales",
      value: requests.length,
      icon: "📋",
      color: "bg-blue-500",
      description: "Toutes les demandes reçues",
      link: "/requests"
    },
    {
      title: "Agents actifs",
      value: activeAgents.length,
      icon: "👥",
      color: "bg-purple-500",
      description: "Agents dans votre agence",
      link: "/dashboard?tab=agents"
    },
    {
      title: "En attente",
      value: pendingRequests.length,
      icon: "⏳",
      color: "bg-yellow-500",
      description: "Demandes en attente de réponse",
      link: "/requests?status=pending"
    },
    {
      title: "Chiffre d'affaires",
      value: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(totalRevenue),
      icon: "💰",
      color: "bg-orange-500",
      description: "Revenus des demandes complétées",
      link: "/requests?status=completed"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link} className="block">
            <Card className="text-center hover:shadow-lg transition-shadow p-3 sm:p-6 group cursor-pointer">
              <div className={`w-10 h-10 sm:w-16 sm:h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 text-white text-lg sm:text-2xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">{stat.title}</p>
              <p className="text-xs text-gray-500 hidden sm:block">{stat.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Actions rapides</h3>
          {totalUnreadMessages > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Nouveaux messages:</span>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {totalUnreadMessages}
              </span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/requests">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📋</div>
                <div>
                  <h4 className="font-medium text-gray-900">Voir les demandes</h4>
                  <p className="text-sm text-gray-600">{requests.length} demande{requests.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/requests?status=pending">
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 hover:from-yellow-100 hover:to-yellow-200 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⏳</div>
                <div>
                  <h4 className="font-medium text-gray-900">Demandes en attente</h4>
                  <p className="text-sm text-gray-600">{pendingRequests.length} en attente</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/dashboard?tab=tariffs">
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:from-green-100 hover:to-green-200 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💰</div>
                <div>
                  <h4 className="font-medium text-gray-900">Gérer les tarifs</h4>
                  <p className="text-sm text-gray-600">Ajouter/modifier</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Activité récente</h3>
          <Link to="/requests" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Voir tout →
          </Link>
        </div>
        
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">👤</div>
                  <div>
                    <p className="font-medium text-gray-900">{request.clientName}</p>
                    <p className="text-sm text-gray-600">{request.destination}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    request.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-gray-500">Aucune activité récente</p>
            <p className="text-sm text-gray-400 mt-1">Les demandes apparaîtront ici</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardStats;
