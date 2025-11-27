import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../store/slices/authSlice";
import { useAgency } from "../hooks/useAgency";

const Header = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const { data: agencyData } = useAgency();

  const [showDropdown, setShowDropdown] = useState(false);
  const [agencyName, setAgencyName] = useState(agencyData?.agence?.nom_agence ?? "Dashboard");

  useEffect(() => {
    // Fonction pour récupérer les données de l'agence depuis localStorage
    const getAgencyData = () => {
      try {
        const storedAgencyData = localStorage.getItem("agencyData");
        if (storedAgencyData) {
          const parsedData = JSON.parse(storedAgencyData);
          return parsedData;
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données de l'agence:",
          error
        );
      }
      return null;
    };
    console.log("agencyData:", agencyData);
    // Mettre à jour le nom de l'agence quand agencyData change
    if (agencyData?.agence?.nom_agence) {
      setAgencyName(agencyData.agence.nom_agence);
    } else {
      // Essayer de récupérer depuis localStorage si pas disponible dans Redux
      const storedData = getAgencyData();
      if (storedData?.agence?.nom_agence) {
        setAgencyName(storedData.agence.nom_agence);
      } else {
        setAgencyName("Dashboard"); // Revenir à "Dashboard" si aucune donnée disponible
      }
    }
  }, [agencyData]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const initials = (currentUser?.name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <div className="flex items-center min-w-0 flex-1">
          {/* Mobile hamburger - always visible on mobile/tablet */}
          <button
            onClick={() => onToggleSidebar && onToggleSidebar()}
            className="lg:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Agency name - responsive text size */}
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {agencyName}
          </h1>
        </div>

        {/* Actions utilisateur - mobile-first layout */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications - hidden on very small screens */}
          <button className="hidden sm:block relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="text-lg">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profil utilisateur - compact on mobile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-haspopup="true"
              aria-expanded={showDropdown}
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {initials}
                </span>
              </div>
              {/* User info hidden on mobile, shown on larger screens */}
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser?.role === "admin" ? "Administrateur" : "Agent"}
                </p>
              </div>
              <span className="text-gray-400 text-sm">▼</span>
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigation vers le profil
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  👤 Mon profil
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigation vers les paramètres
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ⚙️ Paramètres
                </button>

                <div className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    🚪 Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default Header;
