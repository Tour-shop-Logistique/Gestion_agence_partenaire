import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../store/slices/authSlice";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import { getLogoUrl } from "../utils/apiConfig";
import { Bell, Menu, Plus } from "lucide-react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import WebSocketStatus from "./WebSocketStatus";
import { selectUnreadCount } from "../store/slices/notificationsSlice";
import { selectInAppUnreadCount } from "../store/slices/inAppNotificationsSlice";
import NotificationDropdown from "./NotificationDropdown";
import useHasPermission from "../hooks/useHasPermission";

const Header = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const canCreateExpedition = useHasPermission("expeditions.create");
  const { data: agencyData } = useAgency();
  const { demandesMeta, loadDemandes } = useExpedition();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
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

  // Charger les demandes au montage pour avoir le compteur
  // Utiliser un ref pour éviter les appels multiples
  const hasLoadedDemandesRef = React.useRef(false);
  
  useEffect(() => {
    const fetchDemandes = async () => {
      // Éviter les appels multiples
      if (hasLoadedDemandesRef.current) {
        console.log('⏭️ Header: Demandes déjà chargées, skip');
        return;
      }
      
      hasLoadedDemandesRef.current = true;
      console.log('📞 Header: Chargement des demandes pour le compteur');
      const result = await loadDemandes({ page: 1 });
      console.log("✅ Header: Demandes chargées:", result);
    };
    fetchDemandes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nettoyer le ref quand le composant est démonté
  useEffect(() => {
    return () => {
      hasLoadedDemandesRef.current = false;
    };
  }, []);

  useEffect(() => {
    console.log("demandesMeta in Header:", demandesMeta);
  }, [demandesMeta]);

  const handleLogout = () => dispatch(logout());

  const pendingDemandesCount = demandesMeta?.total || 0;
  const unreadAnnouncementsCount = useSelector(selectUnreadCount);
  const unreadInAppCount = useSelector(selectInAppUnreadCount);
  const unreadNotifTotal = unreadAnnouncementsCount + unreadInAppCount;

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

          {/* WebSocket Status Indicator */}
          <WebSocketStatus compact={true} />

          {/* Nouvelle expédition - accessible depuis n'importe quelle page */}
          {canCreateExpedition && (
            <button
              onClick={() => navigate('/create-expedition')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:from-indigo-700 hover:to-indigo-600 active:scale-[0.98] transition-all shadow-sm hover:shadow-md hover:shadow-indigo-200"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Nouvelle expédition</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          )}

          {/* Notifications / Annonces */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown((v) => !v)}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadNotifTotal > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center">
                    <span className="text-[10px] font-semibold text-white">{unreadNotifTotal > 9 ? '9+' : unreadNotifTotal}</span>
                  </span>
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                <NotificationDropdown onClose={() => setShowNotifDropdown(false)} />
              </>
            )}
          </div>

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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-50">
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
                  <button 
                    onClick={() => {
                      navigate('/agent-profile');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm flex items-center gap-2 text-slate-700 transition-colors"
                  >
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg">👤</span>
                    Mon profil
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

    </header>
  );
};

export default Header;
