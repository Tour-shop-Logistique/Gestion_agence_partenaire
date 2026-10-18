import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../store/slices/authSlice";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import { getLogoUrl } from "../utils/apiConfig";
import { Bell, Menu, Plus } from "lucide-react";
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

    // agenciesApi.getAgency() retourne l'objet agence directement (voir
    // utils/api/agencies.js) : agencyData EST l'agence, agencyData.agence
    // n'existe pas. Fallback pour rester robuste si le backend change un
    // jour de forme (objet enveloppé vs direct) - même règle que
    // AgencyProfile.jsx/selectAgencyConfigured.
    const a = agencyData?.agence || agencyData;
    if (a?.nom_agence) {
      setAgencyName(a.nom_agence);
      setAgencyLogo(getLogoUrl(a.logo));
    } else {
      const storedData = getAgencyData();
      const stored = storedData?.agence || storedData;
      if (stored?.nom_agence) {
        setAgencyName(stored.nom_agence);
        setAgencyLogo(getLogoUrl(stored.logo));
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

  const displayName = currentUser?.name || `${currentUser?.prenoms || ""} ${currentUser?.nom || ""}`.trim() || "?";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <header className="h-16 sticky top-0 z-50 relative" style={{ background: "linear-gradient(90deg, #003d47 0%, #005566 50%, #003d47 100%)", borderBottom: "1px solid rgba(0,180,200,0.25)" }}>
      {/* Mosaïque losanges — même motif que le sidebar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <defs>
            <pattern id="hdr-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1.2" fill="#7ff0ff" />
            </pattern>
            <pattern id="hdr-mosaic" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
              <polygon points="28,0 56,28 28,28" fill="#00d4e8" opacity="0.45" />
              <polygon points="56,28 28,56 28,28" fill="#00b4c8" opacity="0.4" />
              <polygon points="28,56 0,28 28,28" fill="#009ab0" opacity="0.38" />
              <polygon points="0,28 28,0 28,28" fill="#00c8dc" opacity="0.35" />
              <polygon points="28,0 56,28 28,56 0,28" fill="none" stroke="#b2f0f8" strokeWidth="0.6" opacity="0.3" />
            </pattern>
            <pattern id="hdr-mosaic-lg" x="14" y="0" width="112" height="112" patternUnits="userSpaceOnUse">
              <polygon points="56,0 112,56 56,56" fill="#00b4c8" opacity="0.22" />
              <polygon points="112,56 56,112 56,56" fill="#00c8dc" opacity="0.2" />
              <polygon points="56,112 0,56 56,56" fill="#009ab0" opacity="0.18" />
              <polygon points="0,56 56,0 56,56" fill="#00d4e8" opacity="0.16" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hdr-grid)" opacity="0.08" />
          <rect width="100%" height="100%" fill="url(#hdr-mosaic-lg)" opacity="0.12" />
          <rect width="100%" height="100%" fill="url(#hdr-mosaic)" opacity="0.14" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-[#002833]/30 to-[#002833]/10" />
      </div>
      <div className="relative z-10 h-full px-6 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Burger - mobile only */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
          >
            <Menu className="w-6 h-6 text-white" />
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
              className="relative p-2 rounded-lg hover:bg-white/10 transition"
            >
              <Bell className="w-5 h-5 text-white/80" />
              {unreadNotifTotal > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center ring-2 ring-[#003d47]">
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

          {/* Séparateur */}
          <div className="w-px h-6 bg-white/20" />

          {/* Profil */}
          <button
            onClick={() => navigate('/agent-profile')}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/10 transition"
            title={currentUser?.name}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00b4c8] to-[#007a8a] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
            <span className="hidden md:block text-sm font-semibold text-white leading-tight">
              {displayName}
            </span>
          </button>

          {/* Séparateur */}
          <div className="w-px h-6 bg-white/20" />

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/10 transition group"
            title="Se déconnecter"
          >
            <svg className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

    </header>

  );
};

export default Header;
