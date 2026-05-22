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
    labelColor: "text-sky-500",
    dot: "bg-sky-500",
    activeBg: "bg-sky-50",
    activeText: "text-sky-700",
    activeBorder: "border-l-[3px] border-sky-500",
    activeIcon: "text-sky-600",
    hoverBg: "hover:bg-sky-50/60",
    hoverText: "hover:text-sky-700",
    hoverIcon: "group-hover:text-sky-500",
  },
  Colis: {
    labelColor: "text-violet-500",
    dot: "bg-violet-500",
    activeBg: "bg-violet-50",
    activeText: "text-violet-700",
    activeBorder: "border-l-[3px] border-violet-500",
    activeIcon: "text-violet-600",
    hoverBg: "hover:bg-violet-50/60",
    hoverText: "hover:text-violet-700",
    hoverIcon: "group-hover:text-violet-500",
  },
  Finance: {
    labelColor: "text-emerald-600",
    dot: "bg-emerald-500",
    activeBg: "bg-emerald-50",
    activeText: "text-emerald-700",
    activeBorder: "border-l-[3px] border-emerald-500",
    activeIcon: "text-emerald-600",
    hoverBg: "hover:bg-emerald-50/60",
    hoverText: "hover:text-emerald-700",
    hoverIcon: "group-hover:text-emerald-500",
  },
  Tarifs: {
    labelColor: "text-amber-600",
    dot: "bg-amber-500",
    activeBg: "bg-amber-50",
    activeText: "text-amber-700",
    activeBorder: "border-l-[3px] border-amber-500",
    activeIcon: "text-amber-600",
    hoverBg: "hover:bg-amber-50/60",
    hoverText: "hover:text-amber-700",
    hoverIcon: "group-hover:text-amber-500",
  },
  Configuration: {
    labelColor: "text-rose-500",
    dot: "bg-rose-500",
    activeBg: "bg-rose-50",
    activeText: "text-rose-700",
    activeBorder: "border-l-[3px] border-rose-500",
    activeIcon: "text-rose-600",
    hoverBg: "hover:bg-rose-50/60",
    hoverText: "hover:text-rose-700",
    hoverIcon: "group-hover:text-rose-500",
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
        { path: "/colis",                name: "Gestion colis",  icon: CubeIcon },
        { path: "/colis-a-receptionner", name: "À réceptionner",  icon: InboxArrowDownIcon },
        { path: "/retrait-colis",        name: "Retrait",         icon: UserCircleIcon },
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
    <div className="flex flex-col h-full bg-white border-r border-slate-100 w-60 lg:mt-0 mt-0">

      {/* ── Branding Header ─────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-slate-900 p-1">
            {agencyData?.agence?.logo ? (
              <img
                src={getLogoUrl(agencyData.agence.logo)}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <TruckIcon className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 tracking-tight text-sm truncate block leading-tight">
              {agencyData?.agence?.nom_agence || "Tous Shop"}
            </span>
            <span className="text-[9px] font-semibold text-sky-500 uppercase tracking-widest">
              Expédition
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
        {menuItems.map((section, sectionIdx) => {
          const c = SECTION_COLORS[section.section] || DEFAULT_COLOR;

          return (
            <div key={sectionIdx}>
              {/* Section label */}
              <div className="flex items-center gap-1.5 px-2 mb-1.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                <p className={`text-[9px] font-bold uppercase tracking-widest ${c.labelColor}`}>
                  {section.section}
                </p>
              </div>

              {/* Items */}
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
                        group flex items-center px-3 py-2 rounded-lg text-sm font-medium
                        transition-all duration-150 relative
                        ${active
                          ? `${c.activeBg} ${c.activeText} ${c.activeBorder} shadow-sm`
                          : `text-slate-500 ${c.hoverBg} ${c.hoverText}`
                        }
                      `}
                    >
                      <item.icon
                        className={`w-4 h-4 mr-2.5 shrink-0 transition-colors ${
                          active ? c.activeIcon : `text-slate-400 ${c.hoverIcon}`
                        }`}
                      />
                      <span className="flex-1 truncate">{item.name}</span>

                      {showBadge && (
                        <span className="flex items-center justify-center min-w-[18px] h-4 px-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full">
                          {pendingDemandesCount > 99 ? "99+" : pendingDemandesCount}
                        </span>
                      )}

                      {active && !showBadge && (
                        <ChevronRightIcon className={`w-3 h-3 ${c.activeIcon} opacity-60`} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── User Footer ─────────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <div className="flex items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          {/* Avatar */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isAdminLike
                ? "bg-rose-500"
                : "bg-sky-500"
            }`}
          >
            <span className="text-white font-bold text-xs">
              {(currentUser?.name || currentUser?.nom || "U")[0].toUpperCase()}
            </span>
          </div>

          <div className="ml-2.5 min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
              {currentUser?.name ||
                `${currentUser?.prenoms || ""} ${currentUser?.nom || ""}`.trim()}
            </p>
            <span
              className={`inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 ${
                isAdminLike
                  ? "bg-rose-100 text-rose-600 border border-rose-200"
                  : "bg-sky-100 text-sky-600 border border-sky-200"
              }`}
            >
              {isAdminLike ? "Admin" : "Agent"}
            </span>
          </div>

          {/* Statut en ligne */}
          <div className="flex-shrink-0 ml-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
