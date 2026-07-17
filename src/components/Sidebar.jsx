import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAdmin } from "../store/slices/authSlice";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOffice2Icon,
  XMarkIcon,
  ChevronRightIcon,
  TableCellsIcon,
  TruckIcon,
  InboxArrowDownIcon,
  UserCircleIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { getLogoUrl } from "../utils/apiConfig";

const Sidebar = ({ onClose }) => {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();
  const { data: agencyData } = useAgency();
  const { demandesMeta } = useExpedition();

  const demandesMetaDirect = useSelector((state) => state.expedition?.demandesMeta);

  const isActive = (path) => location.pathname === path;
  const pendingDemandesCount = demandesMeta?.total || 0;

  React.useEffect(() => {
    console.log("demandesMeta from hook:", demandesMeta);
    console.log("demandesMeta direct from Redux:", demandesMetaDirect);
    console.log("pendingDemandesCount:", pendingDemandesCount);
  }, [demandesMeta, demandesMetaDirect, pendingDemandesCount]);

  const adminMenuItems = [
    {
      section: "Principal",
      items: [
        { path: "/dashboard",   name: "Tableau de bord", icon: ChartBarIcon },
        { path: "/demandes",    name: "Demandes",         icon: ClipboardDocumentListIcon },
        { path: "/expeditions", name: "Expéditions",      icon: TruckIcon },
      ],
    },
    {
      section: "Colis",
      items: [
        { path: "/colis",                name: "À envoyer",  icon: CubeIcon },
        { path: "/colis-a-receptionner", name: "À réceptionner",  icon: InboxArrowDownIcon },
        { path: "/retrait-colis",        name: "À retirer",         icon: UserCircleIcon },
      ],
    },
    {
      section: "Finance",
      items: [
        { path: "/comptabilite", name: "Comptabilité", icon: BanknotesIcon },
        { path: "/transactions", name: "Transactions", icon: ArrowsRightLeftIcon },
      ],
    },
    {
      section: "Tarifs",
      items: [
        { path: "/tarifs-simples",  name: "Simples",  icon: CurrencyDollarIcon },
        { path: "/tarifs-groupage", name: "Groupage", icon: TableCellsIcon },
      ],
    },
    {
      section: "Configuration",
      items: [
        { path: "/agents",         name: "Équipe",  icon: UsersIcon },
        { path: "/agency-profile", name: "Agence",  icon: BuildingOffice2Icon },
      ],
    },
  ];

  const agentMenuItems = [
    {
      section: "Principal",
      items: [
        { path: "/dashboard",   name: "Tableau de bord", icon: ChartBarIcon },
        { path: "/demandes",    name: "Demandes",         icon: ClipboardDocumentListIcon },
        { path: "/expeditions", name: "Expéditions",      icon: TruckIcon },
      ],
    },
    {
      section: "Colis",
      items: [
        { path: "/colis",                name: "Tous les colis", icon: CubeIcon },
        { path: "/colis-a-receptionner", name: "À réceptionner", icon: InboxArrowDownIcon },
        { path: "/retrait-colis",        name: "Retrait",        icon: UserCircleIcon },
      ],
    },
    {
      section: "Finance",
      items: [
        { path: "/comptabilite", name: "Comptabilité", icon: BanknotesIcon },
        { path: "/transactions", name: "Transactions", icon: ArrowsRightLeftIcon },
      ],
    },
    {
      section: "Tarifs",
      items: [
        { path: "/tarifs-simples",  name: "Simples",  icon: CurrencyDollarIcon },
        { path: "/tarifs-groupage", name: "Groupage", icon: TableCellsIcon },
      ],
    },
    {
      section: "Configuration",
      items: [
        { path: "/agency-profile", name: "Agence", icon: BuildingOffice2Icon },
      ],
    },
  ];

  const isAdminLike =
    isAdmin ||
    currentUser?.role === "is_agence_admin" ||
    currentUser?.is_agence_admin === true;

  const menuItems = isAdminLike ? adminMenuItems : agentMenuItems;

  return (
    <div 
      className="flex flex-col h-full w-64 lg:mt-0 mt-0 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      }}
    >
      {/* ========== FOND MODERNE AVEC MOTIFS PLUS VISIBLES ========== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dégradé subtil de profondeur */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-slate-900/20 to-slate-800/30" />
        
        {/* Motifs géométriques modernes (opacité augmentée) */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Motif de grille minimaliste */}
              <pattern id="modern-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Cercles concentriques */}
                <circle cx="40" cy="40" r="20" fill="none" stroke="#06b6d4" strokeWidth="0.8" opacity="0.7"/>
                <circle cx="40" cy="40" r="12" fill="none" stroke="#6366f1" strokeWidth="0.8" opacity="0.6"/>
                <circle cx="40" cy="40" r="6" fill="#14b8a6" opacity="0.5"/>
                
                {/* Lignes diagonales douces */}
                <line x1="0" y1="40" x2="80" y2="40" stroke="#06b6d4" strokeWidth="0.5" opacity="0.4"/>
                <line x1="40" y1="0" x2="40" y2="80" stroke="#6366f1" strokeWidth="0.5" opacity="0.4"/>
                
                {/* Points lumineux aux coins */}
                <circle cx="0" cy="0" r="2.5" fill="#14b8a6" opacity="0.6"/>
                <circle cx="80" cy="0" r="2.5" fill="#06b6d4" opacity="0.6"/>
                <circle cx="0" cy="80" r="2.5" fill="#6366f1" opacity="0.6"/>
                <circle cx="80" cy="80" r="2.5" fill="#14b8a6" opacity="0.6"/>
              </pattern>

              {/* Motif de connexions (type tech/network) */}
              <pattern id="network-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                {/* Nœuds */}
                <circle cx="20" cy="20" r="3" fill="#06b6d4" opacity="0.7"/>
                <circle cx="80" cy="30" r="3" fill="#6366f1" opacity="0.7"/>
                <circle cx="50" cy="70" r="3" fill="#14b8a6" opacity="0.7"/>
                <circle cx="30" cy="90" r="3" fill="#06b6d4" opacity="0.7"/>
                
                {/* Lignes de connexion */}
                <line x1="20" y1="20" x2="80" y2="30" stroke="#06b6d4" strokeWidth="0.8" opacity="0.4" strokeDasharray="3,3"/>
                <line x1="80" y1="30" x2="50" y2="70" stroke="#6366f1" strokeWidth="0.8" opacity="0.4" strokeDasharray="3,3"/>
                <line x1="50" y1="70" x2="30" y2="90" stroke="#14b8a6" strokeWidth="0.8" opacity="0.4" strokeDasharray="3,3"/>
              </pattern>

              {/* Motif de vagues subtiles */}
              <pattern id="wave-pattern" x="0" y="0" width="100" height="40" patternUnits="userSpaceOnUse">
                <path d="M0,20 Q25,10 50,20 T100,20" fill="none" stroke="#06b6d4" strokeWidth="0.8" opacity="0.5"/>
                <path d="M0,25 Q25,15 50,25 T100,25" fill="none" stroke="#6366f1" strokeWidth="0.8" opacity="0.4"/>
                <circle cx="50" cy="20" r="2" fill="#14b8a6" opacity="0.6"/>
              </pattern>
            </defs>
            
            {/* Application des patterns */}
            <rect width="100%" height="100%" fill="url(#modern-grid)"/>
          </svg>
        </div>

        {/* Overlay avec pattern secondaire (plus visible) */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#network-pattern)"/>
          </svg>
        </div>

        {/* Pattern de vagues en bas (plus visible) */}
        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-[0.08]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="url(#wave-pattern)"/>
          </svg>
        </div>

        {/* Lueur douce en haut (plus prononcée) */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-cyan-500/8 via-transparent to-transparent" />
        
        {/* Lueur douce en bas (plus prononcée) */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-indigo-500/8 via-transparent to-transparent" />
        
        {/* Bordure gauche accent avec pattern (plus visible) */}
        <div className="absolute left-0 top-0 bottom-0 w-px">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
          <svg width="1" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
            <defs>
              <pattern id="border-dots" x="0" y="0" width="1" height="30" patternUnits="userSpaceOnUse">
                <circle cx="0.5" cy="15" r="0.6" fill="#06b6d4" opacity="0.6"/>
              </pattern>
            </defs>
            <rect width="1" height="100%" fill="url(#border-dots)"/>
          </svg>
        </div>

        {/* Éclats lumineux (style particules - plus visibles) */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-cyan-400 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-40 h-40 bg-indigo-400 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-32 h-32 bg-teal-400 rounded-full blur-3xl" />
        </div>
      </div>

      {/* ── Branding Header Premium ─────────────────────────────────────────────────── */}
      <div className="relative z-10 h-20 flex items-center px-5 shrink-0 border-b border-white/5">
        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
          {/* Logo container premium avec ombre et dégradé */}
          <div
            className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 bg-gradient-to-br from-white to-slate-50 shadow-lg ring-1 ring-white/20"
          >
            {agencyData?.agence?.logo ? (
              <img
                src={getLogoUrl(agencyData.agence.logo)}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <TruckIcon className="w-6 h-6 text-slate-700" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-white tracking-tight text-base truncate block leading-tight">
              {agencyData?.agence?.nom_agence || "Tous Shop"}
            </span>
            <span className="text-xs text-slate-400 font-medium">Gestion d'expéditions</span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Navigation Moderne avec Transitions Fluides ──────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.items.map((item) => {
              const active = isActive(item.path);
              const showBadge = item.path === "/demandes" && pendingDemandesCount > 0;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group flex items-center px-3.5 py-3 rounded-lg text-sm font-medium mb-1
                    transition-all duration-200 ease-out relative overflow-hidden
                    ${active
                      ? "bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-white shadow-lg shadow-cyan-500/5 border-l-2 border-cyan-400"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5"
                    }
                  `}
                  style={{
                    transitionProperty: 'all',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Effet de lueur subtil sur l'élément actif avec transition */}
                  {active && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-indigo-400/5 pointer-events-none transition-opacity duration-200"
                      style={{
                        animation: 'fadeIn 0.2s ease-out',
                      }}
                    />
                  )}
                  
                  <item.icon
                    className={`w-5 h-5 mr-3.5 shrink-0 transition-all duration-200 ease-out ${
                      active 
                        ? "text-cyan-400 scale-110" 
                        : "text-slate-400 group-hover:text-slate-200 group-hover:scale-105 group-hover:rotate-3"
                    }`}
                  />
                  <span 
                    className="flex-1 truncate relative z-10 transition-all duration-200"
                    style={{
                      transform: active ? 'translateX(0)' : 'translateX(0)',
                    }}
                  >
                    {item.name}
                  </span>

                  {showBadge && (
                    <span 
                      className="flex items-center justify-center min-w-[20px] h-5 px-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full shadow-lg shadow-red-500/30 ring-2 ring-red-400/20 transition-all duration-200 hover:scale-110"
                    >
                      {pendingDemandesCount > 99 ? "99+" : pendingDemandesCount}
                    </span>
                  )}

                  {active && !showBadge && (
                    <ChevronRightIcon 
                      className="w-4 h-4 text-cyan-400/60 transition-all duration-200"
                      style={{
                        animation: 'slideInRight 0.2s ease-out',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Styles d'animation pour les transitions fluides */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      {/* ── User Footer Premium ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 p-4 shrink-0 border-t border-white/5">
        <div
          className="flex items-center p-3 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/60 backdrop-blur-sm shadow-lg ring-1 ring-white/5 transition-all duration-300 hover:shadow-xl hover:ring-white/10"
        >
          {/* Avatar Premium */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/10 transition-transform duration-300 hover:scale-105"
            style={{
              background: isAdminLike 
                ? "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)" 
                : "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
            }}
          >
            <span className="text-white font-bold text-sm">
              {(currentUser?.name || currentUser?.nom || "U")[0].toUpperCase()}
            </span>
          </div>

          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {currentUser?.name ||
                `${currentUser?.prenoms || ""} ${currentUser?.nom || ""}`.trim()}
            </p>
            <span className="text-xs text-slate-400 font-medium">
              {isAdminLike ? "Administrateur" : "Agent"}
            </span>
          </div>

          {/* Status dot Premium */}
          <div className="flex-shrink-0 ml-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
