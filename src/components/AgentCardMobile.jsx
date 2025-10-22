import React from "react";

const AgentCardMobile = ({
  agents,
  onEdit,
  onDelete,
  onToggleStatus,
  updatingAgent,
  loading,
}) => {
  const getStatusBadge = (agent) => {
    if (updatingAgent === agent.id) {
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-500 text-xs">Mise à jour...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={agent.actif}
            onChange={() => onToggleStatus(agent)}
            className="sr-only peer"
            disabled={updatingAgent === agent.id}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-4 block lg:hidden">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Header avec gradient */}
          <div className="bg-indigo-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Avatar avec statut */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {(agent.nom || agent.name || "A").charAt(0).toUpperCase()}
                  </div>
                  {/* Badge de statut */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                      agent.actif ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center ${
                        agent.actif ? "bg-green-400" : "bg-red-400"
                      }`}
                    >
                      {agent.actif ? (
                        <svg
                          className="w-2 h-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-2 h-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg truncate">
                    {agent.nom && agent.prenoms
                      ? `${agent.nom} ${agent.prenoms}`
                      : agent.name || "Sans nom"}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        agent.actif
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.actif ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggle statut */}
              <div className="flex items-center">{getStatusBadge(agent)}</div>
            </div>
          </div>

          {/* Body du card */}
          <div className="p-4 space-y-3">
            {/* Informations de contact */}
            <div className="grid grid-cols-1 gap-3">
              {/* Email */}
              <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm text-gray-900 truncate">
                    {agent.email}
                  </p>
                </div>
              </div>

              {/* Téléphone */}
              <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Téléphone</p>
                  <p className="text-sm text-gray-900">
                    {agent.telephone || "Non défini"}
                  </p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => onEdit(agent)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all duration-200 active:scale-95 font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="text-sm">Modifier</span>
              </button>
              <button
                onClick={() => onDelete(agent)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="text-sm">Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentCardMobile;
