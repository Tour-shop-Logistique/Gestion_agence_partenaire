import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAdmin } from "../store/slices/authSlice";

const Sidebar = ({ onClose }) => {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const adminMenuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: "📊",
      description: "Vue d'ensemble",
    },
    {
      path: "/requests",
      name: "Demandes",
      icon: "📋",
      description: "Gérer les demandes",
    },
    {
      path: "/shipments",
      name: "Expéditions",
      icon: "📦",
      description: "Suivre les colis",
    },
    {
      path: "/tarifs",
      name: "Tarifs",
      icon: "💰",
      description: "Configurer les prix",
    },
    {
      path: "/agents",
      name: "Gestion des agents",
      icon: "👥",
      description: "Gérer votre équipe",
    },
    {
      path: "/agency-profile",
      name: "Profil de l'agence",
      icon: "🏢",
      description: "Informations de l'agence",
    },
  ];

  const agentMenuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: "📊",
      description: "Vue d'ensemble",
    },
    {
      path: "/requests",
      name: "Demandes",
      icon: "📋",
      description: "Gérer les demandes",
    },
    {
      path: "/shipments",
      name: "Expéditions",
      icon: "📦",
      description: "Suivre les colis",
    },
    {
      path: "/tarifs",
      name: "Tarifs",
      icon: "💰",
      description: "Consulter les prix",
    },
    {
      path: "/agency-profile",
      name: "Profil de l'agence",
      icon: "🏢",
      description: "Informations de l'agence",
    },
    // {
    //   path: "/messages",
    //   name: "Messages",
    //   icon: "💬",
    //   description: "Communiquer avec les clients",
    // },
  ];

  // Accepter à la fois la normalisation (role === 'admin' ou flag is_agence_admin)
  // et le rôle brut renvoyé par l'API ('is_agence_admin')
  const isAdminLike =
    isAdmin ||
    currentUser?.role === "is_agence_admin" ||
    currentUser?.is_agence_admin === true;

  // Si admin: donner accès à tous les onglets (admin + agent) sans doublons
  const menuItems = (() => {
    const map = new Map();

    if (!isAdminLike) {
      for (const item of agentMenuItems) {
        map.set(item.path, item);
      }
    } else {
      for (const item of adminMenuItems) {
        map.set(item.path, item);
      }
    }

    return Array.from(map.values());
  })();

  return (
    <div className="bg-white h-full w-72 mt-20">
      {/* Header section with close button - mobile-first */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        {/* Close button - always visible on mobile/tablet */}
        {onClose && (
          <div className="p-4 lg:hidden">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-sm font-medium">Fermer</span>
            </button>
          </div>
        )}

        {/* User info section - compact on mobile */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-semibold text-sm">
                {currentUser?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() ||
                  [currentUser?.nom, currentUser?.prenoms]
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentUser?.name ||
                  [currentUser?.nom, currentUser?.prenoms]
                    .filter(Boolean)
                    .join(" ")}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.email || currentUser?.telephone}
              </p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  isAdminLike
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {isAdminLike ? "Admin" : "Agent"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation menu - mobile-optimized */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-primary-50 text-primary-900 border-l-4 border-blue-800 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
                }`}
              >
                <span className="text-xl mr-4 flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.description}
                  </div>
                </div>
                {isActive(item.path) && (
                  <div className="w-2 h-2 bg-indigo-800 rounded-full flex-shrink-0"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
