import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

// Import du hook personnalisé pour l'authentification
import { useAuth } from "../hooks/useAuth";

// Import du hook personnalisé pour l'agence
import { useAgency } from "../hooks/useAgency";
import { getLogoUrl } from "../utils/apiConfig";

const Dashboard = () => {
  // Utilisation du hook d'authentification
  const { currentUser, isAdmin } = useAuth();

  // Utilisation du hook personnalisé pour l'agence
  const { data: agencyData, users: agencyUsers } = useAgency();

  // États pour les dates
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Premier jour du mois
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Fonction pour formater la date au format dd-mm-yyyy
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Logique pour les agents (filtrer les utilisateurs de l'agence)
  const userAgents = Array.isArray(agencyUsers)
    ? agencyUsers.filter((agent) => agent.agence_id === currentUser?.agence_id)
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
    newRequests: 5,
  };

  // Admin statistics - Design exact de l'image
  const adminStats = [
    {
      title: "Nouvelles Demandes",
      value: mockExpeditionStats.newRequests,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: "bg-green-500",
      barColor: "bg-green-500",
    },
    {
      title: "Total Expéditions",
      value: mockExpeditionStats.total,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgColor: "bg-blue-500",
      barColor: "bg-blue-500",
    },

    {
      title: "Revenu mensuel",
      value: "1 036 000 FCFA",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: "bg-yellow-400",
      barColor: "bg-yellow-400",
    },
    {
      title: "Visites Aujourd'hui",
      value: "78.41k",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            fillRule="evenodd"
            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: "bg-red-500",
      barColor: "bg-red-500",
    },
  ];

  // Agent statistics
  const agentStats = [
    {
      title: "Mes Expéditions",
      value: mockExpeditionStats.total,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgColor: "bg-blue-500",
      barColor: "bg-blue-500",
    },
    {
      title: "Nouvelles Demandes",
      value: mockExpeditionStats.newRequests,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: "bg-green-500",
      barColor: "bg-green-500",
    },
    {
      title: "Expéditions Actives",
      value:
        mockExpeditionStats.pickupInProgress +
        mockExpeditionStats.dropoffInProgress +
        mockExpeditionStats.inTransit +
        mockExpeditionStats.deliveryInProgress,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: "bg-yellow-500",
      barColor: "bg-yellow-500",
    },
    {
      title: "Expéditions Livrées",
      value: mockExpeditionStats.delivered,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-orange-500",
      barColor: "bg-orange-500",
    },
  ];

  const stats = isAdmin ? adminStats : agentStats;

  const displayName =
    currentUser?.name ||
    [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(" ") ||
    "Utilisateur";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header avec salutation et logo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {agencyData?.agence?.logo && (
              <div className="flex-shrink-0">
                <img
                  src={getLogoUrl(agencyData.agence.logo)}
                  alt="Logo Agence"
                  className="h-16 w-16 object-contain rounded-lg border border-gray-100 shadow-sm bg-white p-1"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bonjour, {displayName} 👋
              </h1>
              <p className="text-md text-gray-500 mt-1">
                Bienvenue dans votre espace {agencyData?.agence?.nom_agence || "agence"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Date de début */}
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="sr-only"
                id="start-date-input"
              />
              <label
                htmlFor="start-date-input"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <span>{formatDateDisplay(startDate)}</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </label>
            </div>

            {/* Date de fin */}
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="sr-only"
                id="end-date-input"
              />
              <label
                htmlFor="end-date-input"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <span>{formatDateDisplay(endDate)}</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </label>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Partie gauche: icône + contenu */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Icône circulaire */}
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm`}
                  >
                    {stat.icon}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                  </div>
                </div>

                {/* Barre verticale à droite */}
                <div
                  className={`w-1 h-16 ${stat.barColor} rounded-full ml-4`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Analytics et Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analytics - Graphique circulaire */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray="70 100"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">70%</span>
                  <span className="text-sm text-gray-500">Conversion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reports - Tableau résumé */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Expéditions récentes</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expédition
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      EXP-001
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Livré
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      15 Juin 2023
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      2500 XOF
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      EXP-002
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        En cours
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      16 Juin 2023
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      3200 XOF
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      EXP-003
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        En transit
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      17 Juin 2023
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      1800 XOF
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
