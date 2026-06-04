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

/* ─── Palette par section ───────────────────────────────────────────────────
   Chaque section a :
   - labelColor  : couleur du titre de section
   - dot         : couleur du petit rond
   - activeBg    : fond de l'onglet actif
   - activeText  : texte de l'onglet actif
   - activeBorder: bordure gauche de l'onglet actif
   - activeIcon  : couleur de l'icône active
   - hoverBg     : fond au survol
   - hoverText   : texte au survol
   - hoverIcon   : icône au survol
────────────────────────────────────────────────────────────────────────────── */
const SECTION_COLORS = {
  Principal: {
    labelColor: "text-sky-400",
    dot: "bg-sky-400",
    activeBg: "bg-sky-500/20",
    activeText: "text-sky-300",
    activeBorder: "border-l-[3px] border-sky-400",
    activeIcon: "text-sky-400",
    hoverBg: "hover:bg-white/5",
    hoverText: "hover:text-sky-200",
    hoverIcon: "group-hover:text-sky-400",
  },
  Colis: {
    labelColor: "text-violet-400",
    dot: "bg-violet-400",
    activeBg: "bg-violet-500/20",
    activeText: "text-violet-300",
    activeBorder: "border-l-[3px] border-violet-400",
    activeIcon: "text-violet-400",
    hoverBg: "hover:bg-white/5",
    hoverText: "hover:text-violet-200",
    hoverIcon: "group-hover:text-violet-400",
  },
  Finance: {
    labelColor: "text-emerald-400",
    dot: "bg-emerald-400",
    activeBg: "bg-emerald-500/20",
    activeText: "text-emerald-300",
    activeBorder: "border-l-[3px] border-emerald-400",
    activeIcon: "text-emerald-400",
    hoverBg: "hover:bg-white/5",
    hoverText: "hover:text-emerald-200",
    hoverIcon: "group-hover:text-emerald-400",
  },
  Tarifs: {
    labelColor: "text-amber-400",
    dot: "bg-amber-400",
    activeBg: "bg-amber-500/20",
    activeText: "text-amber-300",
    activeBorder: "border-l-[3px] border-amber-400",
    activeIcon: "text-amber-400",
    hoverBg: "hover:bg-white/5",
    hoverText: "hover:text-amber-200",
    hoverIcon: "group-hover:text-amber-400",
  },
  Configuration: {
    labelColor: "text-rose-400",
    dot: "bg-rose-400",
    activeBg: "bg-rose-500/20",
    activeText: "text-rose-300",
    activeBorder: "border-l-[3px] border-rose-400",
    activeIcon: "text-rose-400",
    hoverBg: "hover:bg-white/5",
    hoverText: "hover:text-rose-200",
    hoverIcon: "group-hover:text-rose-400",
  },
};

const DEFAULT_COLOR = {
  labelColor: "text-slate-400",
  dot: "bg-slate-400",
  activeBg: "bg-slate-100",
  activeText: "text-slate-800",
  activeBorder: "border-l-[3px] border-slate-500",
  activeIcon: "text-slate-700",
  hoverBg: "hover:bg-slate-50",
  hoverText: "hover:text-slate-700",
  hoverIcon: "group-hover:text-slate-500",
};

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
      className="flex flex-col h-full w-60 lg:mt-0 mt-0"
      style={{
        background: "#1e293b",
      }}
    >
      {/* ── Branding Header ─────────────────────────────────────────────────── */}
      <div className="relative z-10 h-16 flex items-center px-4 shrink-0 border-b border-white/10">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Logo container */}
          <div
            className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 bg-white"
          >
            {agencyData?.agence?.logo ? (
              <img
                src={getLogoUrl(agencyData.agence.logo)}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <TruckIcon className="w-5 h-5 text-slate-700" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-white tracking-tight text-sm truncate block">
              {agencyData?.agence?.nom_agence || "Tous Shop"}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                    group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium mb-1
                    transition-all duration-150 relative
                    ${active
                      ? "bg-slate-700/60 text-white"
                      : "text-slate-300 hover:bg-slate-700/40 hover:text-white"
                    }
                  `}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 shrink-0 transition-colors ${
                      active ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span className="flex-1 truncate">{item.name}</span>

                  {showBadge && (
                    <span className="flex items-center justify-center min-w-[18px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {pendingDemandesCount > 99 ? "99+" : pendingDemandesCount}
                    </span>
                  )}

                  {active && !showBadge && (
                    <ChevronRightIcon className="w-4 h-4 text-slate-400 opacity-60" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User Footer ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 p-3 shrink-0 border-t border-white/10">
        <div
          className="flex items-center p-2.5 rounded-lg"
          style={{
            background: "rgba(0,0,0,0.2)",
          }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: isAdminLike ? "#dc2626" : "#3b82f6",
            }}
          >
            <span className="text-white font-bold text-xs">
              {(currentUser?.name || currentUser?.nom || "U")[0].toUpperCase()}
            </span>
          </div>

          <div className="ml-2.5 min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate leading-tight">
              {currentUser?.name ||
                `${currentUser?.prenoms || ""} ${currentUser?.nom || ""}`.trim()}
            </p>
            <span className="text-[10px] text-slate-400">
              {isAdminLike ? "Administrateur" : "Agent"}
            </span>
          </div>

          {/* Status dot */}
          <div className="flex-shrink-0 ml-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
