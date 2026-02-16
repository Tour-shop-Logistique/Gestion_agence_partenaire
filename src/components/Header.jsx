import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../store/slices/authSlice";
import { useAgency } from "../hooks/useAgency";
import { getLogoUrl } from "../utils/apiConfig";
import { Bell, ChevronDown, Menu, Euro, RefreshCcw } from "lucide-react";

const Header = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const { data: agencyData } = useAgency();

  const [showDropdown, setShowDropdown] = useState(false);
  const [agencyName, setAgencyName] = useState("Dashboard");
  const [agencyLogo, setAgencyLogo] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(localStorage.getItem('exchange_rate_cfa_eur') || '655.957');

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

  const handleSaveRate = () => {
    localStorage.setItem('exchange_rate_cfa_eur', exchangeRate);
    setShowRateModal(false);
    window.location.reload(); // Recharger pour appliquer le nouveau taux partout
  };

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
        <div className="flex items-center gap-4">

          {/* Conversion Rate Pill */}
          <button
            onClick={() => setShowRateModal(true)}
            className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-white hover:shadow-sm hover:border-indigo-200 transition-all group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Euro className="w-4 h-4" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight pr-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taux de conversion</span>
              <span className="text-xs font-black text-slate-900">1€ = {exchangeRate} CFA</span>
            </div>
            <div className="md:hidden flex flex-col items-start leading-tight">
              <span className="text-[10px] font-bold text-indigo-600">1€ = {exchangeRate}</span>
            </div>
          </button>

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
                <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-sm flex items-center gap-2">
                  <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg">👤</span>
                  Mon profil
                </button>

                <button
                  onClick={() => {
                    setShowRateModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-sm flex items-center gap-2"
                >
                  <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg">⚙️</span>
                  Taux de conversion EUR
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

      {/* Modal Taux de Conversion */}
      {showRateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowRateModal(false)}
          />
          <div className="relative bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />

            <div className="relative">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
                <RefreshCcw className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">Configuration</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">Définissez le taux de conversion Euro vers CFA pour les simulations.</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Valeur pour 1 Euro
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      step="0.001"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-black text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all duration-300 pr-16"
                      placeholder="655.957"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-indigo-100 rounded-lg">
                      <span className="text-[10px] font-black text-indigo-700">CFA</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic ml-1">* Le taux par défaut est 655.957 CFA</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRateModal(false)}
                    className="flex-1 py-4 px-6 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-50 transition-all active:scale-95 border border-slate-100"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={handleSaveRate}
                    className="flex-[1.5] py-4 px-6 rounded-2xl text-xs font-black bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-slate-900 hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
