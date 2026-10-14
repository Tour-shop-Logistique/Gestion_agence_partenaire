import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAdmin } from "../store/slices/authSlice";
import { selectAgencyConfigured } from "../store/slices/agencySlice";
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
  TableCellsIcon,
  TruckIcon,
  InboxArrowDownIcon,
  UserCircleIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { getLogoUrl } from "../utils/apiConfig";
import { selectUnreadMessagesCount } from "../store/slices/messagesSlice";
import { canAccessPage as checkCanAccessPage } from "../utils/permissions";

// Doit rester synchronisé avec AgenceRoleController::AVAILABLE_PAGES côté backend.
const PAGE_KEY_BY_PATH = {
  "/dashboard": "dashboard",
  "/demandes": "demandes",
  "/expeditions": "expeditions",
  "/colis": "colis",
  "/colis-a-receptionner": "colis_a_receptionner",
  "/retrait-colis": "retrait_colis",
  "/comptabilite": "comptabilite",
  "/transactions": "transactions",
  "/tarifs-simples": "tarifs_simples",
  "/tarifs-groupage": "tarifs_groupage",
  "/tarifs-interville": "tarifs_interville",
  "/messages": "communication",
  "/agents": "agents",
  "/agency-profile": "agency_profile",
};

const Sidebar = ({ onClose }) => {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const agencyConfigured = useSelector(selectAgencyConfigured);
  const agencyStatus = useSelector((state) => state.agency.status);
  const location = useLocation();
  const { data: agencyData } = useAgency();
  const { demandesMeta } = useExpedition();

  const canAccessPage = (pageKey) => checkCanAccessPage(currentUser, isAdmin, pageKey);

  const demandesMetaDirect = useSelector((state) => state.expedition?.demandesMeta);
  const unreadMessagesCount = useSelector(selectUnreadMessagesCount);

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
        { path: "/tarifs-simples",  name: "International (LD)",  icon: CurrencyDollarIcon },
        { path: "/tarifs-groupage", name: "International (Groupage)", icon: TableCellsIcon },
        { path: "/tarifs-interville", name: "Interville (National)", icon: TruckIcon },
      ],
    },
    {
      section: "Communication",
      items: [
        { path: "/messages", name: "Messages", icon: ChatBubbleLeftRightIcon },
      ],
    },
    {
      section: "Configuration",
      items: [
        { path: "/agents",         name: "Équipe & Accès",  icon: UsersIcon },
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
        { path: "/tarifs-simples",  name: "International (LD)",  icon: CurrencyDollarIcon },
        { path: "/tarifs-groupage", name: "International (Groupage)", icon: TableCellsIcon },
        { path: "/tarifs-interville", name: "Interville (National)", icon: TruckIcon },
      ],
    },
    {
      section: "Communication",
      items: [
        { path: "/messages", name: "Messages", icon: ChatBubbleLeftRightIcon },
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

  const rawMenuItems = isAdminLike ? adminMenuItems : agentMenuItems;

  // Tant que l'agence n'est pas configurée (AgencySetupGuard bloque déjà
  // l'accès direct à toutes les autres pages, voir App.jsx), seul le lien
  // vers /agency-profile a un sens dans le menu - les autres mèneraient à
  // une redirection immédiate. Pendant le chargement initial (idle/loading),
  // ne rien filtrer : même garde-fou que AgencySetupGuard, pour éviter un
  // flash du menu réduit avant que les vraies données d'agence n'arrivent.
  const agencyStatusResolved = agencyStatus !== "loading" && agencyStatus !== "idle";

  const menuItems = rawMenuItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!canAccessPage(PAGE_KEY_BY_PATH[item.path])) return false;
        if (agencyStatusResolved && !agencyConfigured && item.path !== "/agency-profile") return false;
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Palette d'accent par item (purement visuelle, indexée par route) — chaque
  // rubrique garde sa propre couleur de repère, y compris à l'état actif.
  const ITEM_ACCENTS = {
    "/dashboard":              { icon: "#a5b4fc", chip: "rgba(99,102,241,0.16)",  ring: "rgba(99,102,241,0.35)",  accent: "#818cf8" },
    "/demandes":               { icon: "#7dd3fc", chip: "rgba(14,165,233,0.16)",  ring: "rgba(14,165,233,0.35)",  accent: "#38bdf8" },
    "/expeditions":            { icon: "#5eead4", chip: "rgba(20,184,166,0.16)",  ring: "rgba(20,184,166,0.35)",  accent: "#2dd4bf" },
    "/colis":                  { icon: "#93c5fd", chip: "rgba(59,130,246,0.16)",  ring: "rgba(59,130,246,0.35)",  accent: "#60a5fa" },
    "/colis-a-receptionner":   { icon: "#6ee7b7", chip: "rgba(16,185,129,0.16)",  ring: "rgba(16,185,129,0.35)",  accent: "#34d399" },
    "/retrait-colis":          { icon: "#e2e8f0", chip: "rgba(148,163,184,0.18)", ring: "rgba(148,163,184,0.35)", accent: "#cbd5e1" },
    "/comptabilite":           { icon: "#fcd34d", chip: "rgba(245,158,11,0.16)",  ring: "rgba(245,158,11,0.35)",  accent: "#fbbf24" },
    "/transactions":           { icon: "#c4b5fd", chip: "rgba(139,92,246,0.16)",  ring: "rgba(139,92,246,0.35)",  accent: "#a78bfa" },
    "/tarifs-simples":         { icon: "#86efac", chip: "rgba(34,197,94,0.16)",   ring: "rgba(34,197,94,0.35)",   accent: "#4ade80" },
    "/tarifs-groupage":        { icon: "#7dd3fc", chip: "rgba(2,132,199,0.18)",   ring: "rgba(2,132,199,0.35)",   accent: "#38bdf8" },
    "/tarifs-interville":      { icon: "#fdba74", chip: "rgba(234,88,12,0.16)",   ring: "rgba(234,88,12,0.35)",   accent: "#fb923c" },
    "/agents":                 { icon: "#fda4af", chip: "rgba(244,63,94,0.16)",   ring: "rgba(244,63,94,0.35)",   accent: "#fb7185" },
    "/agency-profile":         { icon: "#67e8f9", chip: "rgba(6,182,212,0.16)",   ring: "rgba(6,182,212,0.35)",   accent: "#22d3ee" },
    "/messages":               { icon: "#fdba74", chip: "rgba(249,115,22,0.16)",  ring: "rgba(249,115,22,0.35)",  accent: "#fb923c" },
    "/promotions":             { icon: "#f9a8d4", chip: "rgba(219,39,119,0.16)",  ring: "rgba(219,39,119,0.35)",  accent: "#ec4899" },
  };
  const DEFAULT_ACCENT = { icon: "#cbd5e1", chip: "rgba(148,163,184,0.14)", ring: "rgba(148,163,184,0.3)", accent: "#94a3b8" };

  return (
    <div
      className="flex flex-col h-full w-60 lg:mt-0 mt-0 relative overflow-hidden"
      style={{
        background: "#0f172a",
      }}
    >
      {/* Liseré d'accent sur le bord droit */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-[#9DC41A]/30 pointer-events-none" />

      {/* ── Branding Header ─────────────────────────────────────────────────── */}
      <div className="relative z-10 h-14 flex items-center px-4 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Logo container avec ombre et dégradé */}
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 bg-gradient-to-br from-white to-slate-100 shadow-lg shadow-black/20 ring-1 ring-white/10">
            {(agencyData?.agence?.logo || agencyData?.logo) ? (
              <img
                src={getLogoUrl(agencyData?.agence?.logo || agencyData?.logo)}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <TruckIcon className="w-5 h-5 text-slate-700" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className="font-bold text-white tracking-tight text-sm truncate block leading-tight"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {agencyData?.agence?.nom_agence || agencyData?.nom_agence || "Tous Shop"}
            </span>
            <span className="text-[10px] font-medium tracking-wide uppercase leading-tight" style={{ color: "#9DC41A" }}>
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
      <div className="relative z-10 flex-1 min-h-0">
        <nav
          className="h-full overflow-y-auto py-3 pl-3.5 pr-1.5 sidebar-scrollbar"
        >
          {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx} className={sectionIdx > 0 ? "mt-2.5" : ""}>
            <p
              className="px-2.5 mb-1 text-[10.5px] font-semibold tracking-[0.1em] text-slate-200/90 uppercase select-none"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
            >
              {section.section}
            </p>
            <div className="space-y-0">
              {section.items.map((item) => {
                const active = isActive(item.path);
                const showBadge =
                  (item.path === "/demandes" && pendingDemandesCount > 0) ||
                  (item.path === "/messages" && unreadMessagesCount > 0);
                const badgeCount = item.path === "/messages" ? unreadMessagesCount : pendingDemandesCount;
                const c = ITEM_ACCENTS[item.path] || DEFAULT_ACCENT;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      group flex items-center px-2 py-1.5 rounded-lg text-[14px] font-medium
                      transition-all duration-150 ease-out relative
                      ${active ? "text-white" : "text-slate-100 hover:bg-white/[0.06] hover:text-white"}
                    `}
                    style={{
                      textShadow: "0 1px 3px rgba(0,0,0,0.65)",
                      background: active
                        ? `linear-gradient(90deg, ${c.accent}29, ${c.accent}0d)`
                        : undefined,
                      boxShadow: active ? `inset 0 0 0 1px ${c.ring}` : undefined,
                    }}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg mr-2.5 shrink-0 transition-all duration-150"
                      style={{
                        background: active ? `${c.accent}33` : c.chip,
                        boxShadow: `inset 0 0 0 1px ${active ? c.accent + "66" : c.ring}`,
                      }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: active ? "#ffffff" : c.icon }} />
                    </span>

                    <span className="flex-1 truncate">{item.name}</span>

                    {showBadge && (
                      <span className="flex items-center justify-center min-w-[18px] h-4 px-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-bold rounded-full shadow-sm shadow-red-500/40 ring-1 ring-red-400/20">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}

                    {active && !showBadge && (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: c.accent, boxShadow: `0 0 6px ${c.accent}` }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        </nav>
      </div>

      {/* ── User Footer ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 p-2.5 shrink-0 border-t border-white/10">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.04] ring-1 ring-white/10 transition-colors duration-200 hover:bg-white/[0.07]">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/10"
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

          <div className="min-w-0 flex-1">
            <p
              className="text-[13.5px] font-semibold text-white truncate leading-tight"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.65)" }}
            >
              {currentUser?.name ||
                `${currentUser?.prenoms || ""} ${currentUser?.nom || ""}`.trim()}
            </p>
            <span className="text-[11px] text-slate-200 font-medium">
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