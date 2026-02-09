import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../store/slices/authSlice";
import { useAgency } from "../hooks/useAgency";
import { getLogoUrl } from "../utils/apiConfig";
import { Bell, ChevronDown, Menu } from "lucide-react";

const Header = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const { data: agencyData } = useAgency();

  const [showDropdown, setShowDropdown] = useState(false);
  const [agencyName, setAgencyName] = useState("Dashboard");
  const [agencyLogo, setAgencyLogo] = useState(null);

  useEffect(() => {
    const getAgencyData = () => {
      try {
        const storedAgencyData = localStorage.getItem("agencyData");
        return storedAgencyData ? JSON.parse(storedAgencyData) : null;
      } catch {
        return null;
      }
    };

    if (agencyData?.agence?.nom_agence) {
      setAgencyName(agencyData.agence.nom_agence);
      setAgencyLogo(getLogoUrl(agencyData.agence.logo));
    } else {
      const storedData = getAgencyData();
      if (storedData?.agence?.nom_agence) {
        setAgencyName(storedData.agence.nom_agence);
        setAgencyLogo(getLogoUrl(storedData.agence.logo));
      }
    }
  }, [agencyData]);

  const handleLogout = () => dispatch(logout());

  const initials = (currentUser?.name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 fixed top-0 left-0 right-0 z-50 
    bg-white/80 backdrop-blur-xl border-b border-slate-200/60">

      <div className="h-full px-6 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4 min-w-0">

          {/* Burger */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>

          {/* Agency */}
          <div className="flex items-center gap-3">
            {agencyLogo && (
              <div className="p-1 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100">
                <img
                  src={agencyLogo}
                  alt="logo"
                  className="w-9 h-9 rounded-lg object-contain"
                />
              </div>
            )}

            <div className="leading-tight">
              <h1 className="text-lg font-bold text-slate-900 truncate">
                {agencyName}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestion d'agence
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* USER */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-slate-100 transition"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow text-white font-bold text-sm">
                {initials}
              </div>

              {/* Infos */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-900">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {currentUser?.role === "admin"
                    ? "Administrateur"
                    : "Agent"}
                </p>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* DROPDOWN */}
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 
              bg-white rounded-2xl shadow-xl border border-slate-200 p-2">

                {/* User card */}
                <div className="p-3 rounded-xl bg-slate-50 mb-2">
                  <p className="font-semibold text-slate-900">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentUser?.email}
                  </p>
                </div>

                {/* Actions */}
                <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-sm">
                  👤 Mon profil
                </button>

                <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-sm">
                  ⚙️ Paramètres
                </button>

                <div className="h-px bg-slate-200 my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-sm font-medium"
                >
                  🚪 Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
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
