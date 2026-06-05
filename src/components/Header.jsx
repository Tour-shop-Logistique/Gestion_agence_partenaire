import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../store/slices/authSlice";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import { getLogoUrl } from "../utils/apiConfig";
import { Bell, Menu, Euro, RefreshCcw } from "lucide-react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const Header = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { data: agencyData } = useAgency();
  const { demandesMeta, loadDemandes } = useExpedition();

  const [showDropdown, setShowDropdown] = useState(false);
  const [agencyName, setAgencyName] = useState("Dashboard");
  const [agencyLogo, setAgencyLogo] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(localStorage.getItem('exchange_rate_cfa_eur') || '655.957');
  const [tempExchangeRate, setTempExchangeRate] = useState(exchangeRate);

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

  // Charger les demandes au montage pour avoir le compteur
  useEffect(() => {
    const fetchDemandes = async () => {
      const result = await loadDemandes({ page: 1 });
      console.log("Demandes loaded in Header:", result);
    };
    fetchDemandes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("demandesMeta in Header:", demandesMeta);
  }, [demandesMeta]);

  const handleLogout = () => dispatch(logout());

  const handleSaveRate = () => {
    const rate = parseFloat(tempExchangeRate);
    if (isNaN(rate) || rate <= 0) {
      alert('Veuillez entrer un taux valide');
      return;
    }
    localStorage.setItem('exchange_rate_cfa_eur', tempExchangeRate);
    setExchangeRate(tempExchangeRate);
    setShowRateModal(false);
    window.location.reload(); // Recharger pour appliquer le nouveau taux partout
  };

  const handleOpenModal = () => {
    setTempExchangeRate(exchangeRate);
    setShowRateModal(true);
  };

  const handleResetRate = () => {
    setTempExchangeRate('655.957');
  };

  const pendingDemandesCount = demandesMeta?.total || 0;

  const initials = (currentUser?.name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 sticky top-0 bg-white border-b border-gray-100 z-50">
      <div className="h-full px-6 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Burger - mobile only */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* Conversion Rate */}
          <button
            onClick={handleOpenModal}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            <Euro className="w-4 h-4 text-indigo-600" />
            <div className="hidden lg:block">
              <span className="text-xs font-semibold text-slate-900">1€ = {parseFloat(exchangeRate).toLocaleString('fr-FR')} CFA</span>
            </div>
            <div className="lg:hidden">
              <span className="text-xs font-semibold text-indigo-600">{parseFloat(exchangeRate).toLocaleString('fr-FR')}</span>
            </div>
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate('/demandes')}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {pendingDemandesCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center">
                  <span className="text-[10px] font-semibold text-white">{pendingDemandesCount > 9 ? '9+' : pendingDemandesCount}</span>
                </span>
              </span>
            )}
          </button>

          {/* Settings Icon */}
          <button className="p-2 rounded-lg hover:bg-slate-100 transition">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* USER */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                {initials}
              </div>

              {/* Name */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-900">
                  {currentUser?.name}
                </p>
              </div>

              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>

            {/* DROPDOWN */}
            {showDropdown && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                  {/* User card */}
                  <div className="p-3 rounded-lg bg-slate-50 mb-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {currentUser?.email}
                    </p>
                  </div>

                  {/* Actions */}
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm flex items-center gap-2 text-slate-700 transition-colors">
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg">👤</span>
                    Mon profil
                  </button>

                  <button
                    onClick={() => {
                      handleOpenModal();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm flex items-center gap-2 text-slate-700 transition-colors"
                  >
                    <span className="w-7 h-7 flex items-center justify-center bg-indigo-50 rounded-lg">
                      <Euro className="w-4 h-4 text-indigo-600" />
                    </span>
                    Taux de conversion EUR
                  </button>

                  <div className="h-px bg-slate-200 my-2" />

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-sm font-medium transition-colors"
                  >
                    🚪 Se déconnecter
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Taux de Conversion */}
      {showRateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowRateModal(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-56 h-56 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-full blur-3xl opacity-40" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Euro className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Taux de conversion</h3>
                    <p className="text-xs text-slate-500 font-medium">Euro vers CFA</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRateModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Rate Display */}
              <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Taux actuel</p>
                    <p className="text-2xl font-bold text-slate-900">
                      1 € = {parseFloat(exchangeRate).toLocaleString('fr-FR')} <span className="text-lg text-indigo-600">CFA</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <RefreshCcw className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 flex items-center justify-between">
                    <span>Nouveau taux (1 Euro =)</span>
                    <button
                      onClick={handleResetRate}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 normal-case"
                    >
                      Réinitialiser
                    </button>
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      step="0.001"
                      value={tempExchangeRate}
                      onChange={(e) => setTempExchangeRate(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all duration-300 pr-20"
                      placeholder="655.957"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 rounded-xl shadow-sm">
                      <span className="text-xs font-bold text-white">CFA</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 ml-1">
                    <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-slate-500">Le taux par défaut est <span className="font-semibold text-slate-700">655.957 CFA</span>. Ce taux sera utilisé pour toutes les conversions dans l'application.</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowRateModal(false)}
                    className="flex-1 py-3 px-6 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95 border-2 border-slate-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveRate}
                    className="flex-[1.5] py-3 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
