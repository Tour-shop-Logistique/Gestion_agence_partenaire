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
        background: "linear-gradient(180deg, #182642 0%, #223a63 50%, #182642 100%)",
      }}
    >
      {/* ========== FOND — THÈME "ROUTES D'EXPÉDITION" ========== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <defs>
            {/* Grille de repère fine, façon carte de navigation */}
            <pattern id="nav-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1.2" fill="#a5f3fc" />
            </pattern>

            {/* Ligne de route maritime/aérienne avec points d'étape */}
            <pattern id="shipping-lane" x="0" y="0" width="240" height="200" patternUnits="userSpaceOnUse">
              <path
                d="M-20,150 C40,90 90,190 150,110 S 250,40 280,60"
                fill="none"
                stroke="#67e8f9"
                strokeWidth="1.4"
                strokeDasharray="1,6"
                strokeLinecap="round"
                opacity="0.95"
              />
              <path
                d="M-30,40 C30,70 70,10 140,45 S 230,90 270,55"
                fill="none"
                stroke="#a5b4fc"
                strokeWidth="1.4"
                strokeDasharray="1,6"
                strokeLinecap="round"
                opacity="0.85"
              />
              {/* Points d'étape (waypoints) */}
              <circle cx="150" cy="110" r="3" fill="#67e8f9" opacity="1" />
              <circle cx="150" cy="110" r="6.5" fill="none" stroke="#67e8f9" strokeWidth="0.8" opacity="0.5" />
              <circle cx="140" cy="45" r="3" fill="#a5b4fc" opacity="1" />
              <circle cx="140" cy="45" r="6.5" fill="none" stroke="#a5b4fc" strokeWidth="0.8" opacity="0.5" />
              <circle cx="20" cy="105" r="2" fill="#5eead4" opacity="0.9" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#nav-grid)" opacity="0.14" />
          <rect width="100%" height="100%" fill="url(#shipping-lane)" opacity="0.4" />
        </svg>

        {/* Lueurs douces en haut / en bas, ancrées à l'accent de la marque */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-cyan-400/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-indigo-400/20 via-transparent to-transparent" />

        {/* Halos ambiants */}
        <div className="absolute -top-10 -left-10 w-56 h-56 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-10 w-56 h-56 bg-indigo-400/10 rounded-full blur-3xl" />

        {/* Liseré d'accent sur le bord gauche */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />
      </div>

      {/* Voile de lisibilité : assombrit légèrement les motifs sous le texte sans les effacer */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0f1c33]/55 via-[#0f1c33]/25 to-[#0f1c33]/55" />

      {/* ── Branding Header ─────────────────────────────────────────────────── */}
      <div className="relative z-10 h-20 flex items-center px-5 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Logo container avec ombre et dégradé */}
          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 bg-gradient-to-br from-white to-slate-100 shadow-lg shadow-black/20 ring-1 ring-white/10">
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
            <span
              className="font-bold text-white tracking-tight text-[15px] truncate block leading-tight"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {agencyData?.agence?.nom_agence || "Tous Shop"}
            </span>
            <span className="text-[11px] text-cyan-200 font-medium tracking-wide uppercase">
              Gestion d'expéditions
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav
        className="relative z-10 flex-1 overflow-y-auto py-5 px-3.5 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx} className={sectionIdx > 0 ? "mt-5" : ""}>
            <p
              className="px-2.5 mb-2 text-[10.5px] font-semibold tracking-[0.12em] text-slate-300/80 uppercase select-none"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
            >
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                const showBadge = item.path === "/demandes" && pendingDemandesCount > 0;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      group flex items-center px-2.5 py-2.5 rounded-lg text-sm font-medium
                      transition-colors duration-150 ease-out relative
                      ${
                        active
                          ? "bg-gradient-to-r from-cyan-500/[0.16] to-indigo-500/[0.1] text-white"
                          : "text-slate-200/90 hover:bg-white/[0.06] hover:text-white"
                      }
                    `}
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.45)" }}
                  >
                    {/* Repère vertical d'état actif */}
                    <span
                      className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full transition-opacity duration-150 ${
                        active ? "bg-gradient-to-b from-cyan-400 to-indigo-400 opacity-100" : "opacity-0"
                      }`}
                    />

                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-md mr-3 shrink-0 transition-colors duration-150 ${
                        active ? "bg-cyan-400/15 text-cyan-300" : "text-slate-300 group-hover:text-slate-100"
                      }`}
                    >
                      <item.icon className="w-[18px] h-[18px]" />
                    </span>

                    <span className="flex-1 truncate">{item.name}</span>

                    {showBadge && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full shadow-sm shadow-red-500/40 ring-1 ring-red-400/20">
                        {pendingDemandesCount > 99 ? "99+" : pendingDemandesCount}
                      </span>
                    )}

                    {active && !showBadge && (
                      <ChevronRightIcon className="w-4 h-4 text-cyan-400/70" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User Footer ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 p-3.5 shrink-0 border-t border-white/10">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.06] ring-1 ring-white/10 transition-colors duration-200 hover:bg-white/[0.09]">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/10"
            style={{
              background: isAdminLike
                ? "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
                : "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
            }}
          >
            <span className="text-white font-bold text-xs">
              {(currentUser?.name || currentUser?.nom || "U")[0].toUpperCase()}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-semibold text-white truncate leading-tight"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.45)" }}
            >
              {currentUser?.name ||
                `${currentUser?.prenoms || ""} ${currentUser?.nom || ""}`.trim()}
            </p>
            <span className="text-[11px] text-slate-300 font-medium">
              {isAdminLike ? "Administrateur" : "Agent"}
            </span>
          </div>

          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
