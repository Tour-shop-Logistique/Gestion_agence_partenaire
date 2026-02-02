import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

// Import du hook personnalisé pour l'authentification
import { useAuth } from "../hooks/useAuth";

// Import du hook personnalisé pour l'agence
import { useAgency } from "../hooks/useAgency";
import { getLogoUrl } from "../utils/apiConfig";

// Import du hook pour les expéditions
import { useExpedition } from "../hooks/useExpedition";
import AddExpeditionModal from "../components/AddExpeditionModal";

const Dashboard = () => {
  // Utilisation du hook d'authentification
  const { currentUser, isAdmin } = useAuth();

  // Utilisation du hook personnalisé pour l'agence
  const { data: agencyData, users: agencyUsers } = useAgency();

  // Utilisation du hook pour les expéditions
  const { expeditions, loadExpeditions, status: expeditionStatus } = useExpedition();

  // État pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les expéditions au montage
  useEffect(() => {
    if(!expeditions){
    loadExpeditions();}
  }, [loadExpeditions]);

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
    if (!dateString) return "N/A";
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

  // Statistiques calculées
  const expeditionsList = Array.isArray(expeditions) ? expeditions : [];

  const statsData = {
    total: expeditionsList.length,
    newRequests: expeditionsList.filter(e => e.statut_expedition === 'accepted' || e.statut_expedition === 'pending').length,
    inTransit: expeditionsList.filter(e => e.statut_expedition === 'in_transit').length,
    delivered: expeditionsList.filter(e => e.statut_expedition === 'delivered').length,
  };

  // Admin statistics
  const adminStats = [
    {
      title: "Nouvelles Demandes",
      value: statsData.newRequests,
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
      value: statsData.total,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgColor: "bg-blue-500",
      barColor: "bg-blue-500",
    },
    {
      title: "Revenu estimé",
      value: "Calcul en cours...",
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
      value: statsData.total,
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
      value: statsData.newRequests,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: "bg-green-500",
      barColor: "bg-green-500",
    },
    {
      title: "En Transit",
      value: statsData.inTransit,
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
      value: statsData.delivered,
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {agencyData?.agence?.logo && (
              <div className="flex-shrink-0">
                <img
                  src={getLogoUrl(agencyData.agence.logo)}
                  alt="Logo Agence"
                  className="h-16 w-16 object-contain rounded-xl border border-gray-100 shadow-sm bg-white p-2"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Bonjour, {displayName} 👋
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Ravi de vous revoir chez <span className="text-blue-600 font-bold">{agencyData?.agence?.nom_agence || "votre agence"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle Expédition
            </button>

            <div className="hidden lg:flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
              <div className="px-3 py-1.5 text-xs font-bold text-gray-500">{formatDateDisplay(startDate)}</div>
              <div className="text-gray-300">|</div>
              <div className="px-3 py-1.5 text-xs font-bold text-gray-500">{formatDateDisplay(endDate)}</div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-gray-200 transition-transform group-hover:scale-110 duration-300`}
                  >
                    {stat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-black text-gray-900 leading-none">
                      {stat.value}
                    </h3>
                  </div>
                </div>
                <div className={`w-1 h-12 ${stat.barColor} rounded-full opacity-20 group-hover:opacity-100 transition-opacity ml-4`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Analytics et Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analytics - Graphique circulaire (Simplified) */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-gray-900">Activité</h3>
              <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-56 h-56 transition-transform hover:scale-105 duration-500">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#2563eb" strokeWidth="12" strokeDasharray="210 300" strokeLinecap="round" transform="rotate(-90 50 50)" className="drop-shadow-sm" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-gray-900">70%</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Efficacité</span>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 w-full text-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Livrés</p>
                  <p className="text-lg font-black text-blue-600">82%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">En cours</p>
                  <p className="text-lg font-black text-yellow-500">18%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table des expéditions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Expéditions récentes</h3>
                <p className="text-xs text-gray-500">Vos dernières opérations enregistrées</p>
              </div>
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Destinataire</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expeditionsList.length > 0 ? (
                    [...expeditionsList].reverse().slice(0, 10).map((exp, idx) => (
                      <tr key={exp.id || idx} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                              {exp.type_expedition === 'simple' ? 'S' : 'G'}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{exp.reference || exp.code_suivi || `EXP-${String(exp.id).padStart(3, '0')}`}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">{exp.destinataire?.nom_prenom || exp.destinataire_nom_prenom}</span>
                            <span className="text-[10px] text-gray-400">{exp.destinataire?.ville || exp.destinataire_ville}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${exp.statut_expedition === 'delivered' ? 'bg-green-100 text-green-700' :
                            exp.statut_expedition === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {exp.statut_expedition || 'En attente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-500">
                          {formatDateDisplay(exp.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                          <svg className="w-5 h-5 ml-auto hover:text-blue-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📦</span>
                          </div>
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aucune expédition</p>
                          <p className="text-xs text-gray-400 mt-1">Commencez par ajouter votre premier colis</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {expeditionsList.length > 5 && (
              <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50">
                <Link to="/expeditions" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                  Voir tout l'historique →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'ajout d'expédition */}
      <AddExpeditionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
