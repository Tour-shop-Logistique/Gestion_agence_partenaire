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
    "/agents":                 { icon: "#fda4af", chip: "rgba(244,63,94,0.16)",   ring: "rgba(244,63,94,0.35)",   accent: "#fb7185" },
    "/agency-profile":         { icon: "#67e8f9", chip: "rgba(6,182,212,0.16)",   ring: "rgba(6,182,212,0.35)",   accent: "#22d3ee" },
  };
  const DEFAULT_ACCENT = { icon: "#cbd5e1", chip: "rgba(148,163,184,0.14)", ring: "rgba(148,163,184,0.3)", accent: "#94a3b8" };

  return (
    <div
      className="flex flex-col h-full w-64 lg:mt-0 mt-0 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #070a14 0%, #10152a 50%, #070a14 100%)",
      }}
    >
      {/* ========== FOND — MOSAÏQUE GÉOMÉTRIQUE ========== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <defs>
            {/* Grille de repère fine en fond, façon carte de navigation */}
            <pattern id="nav-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1.2" fill="#a5f3fc" />
            </pattern>

            {/* Mosaïque géométrique : tuiles losange en pointe-de-diamant */}
            <pattern id="mosaic-tiles" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
              <polygon points="28,0 56,28 28,28" fill="#67e8f9" opacity="0.55" />
              <polygon points="56,28 28,56 28,28" fill="#818cf8" opacity="0.5" />
              <polygon points="28,56 0,28 28,28" fill="#2dd4bf" opacity="0.45" />
              <polygon points="0,28 28,0 28,28" fill="#a5b4fc" opacity="0.4" />
              <polygon
                points="28,0 56,28 28,56 0,28"
                fill="none"
                stroke="#e0f2fe"
                strokeWidth="0.6"
                opacity="0.35"
              />
            </pattern>

            {/* Second calque, décalé et à plus grande échelle, pour la profondeur */}
            <pattern
              id="mosaic-tiles-lg"
              x="28"
              y="28"
              width="112"
              height="112"
              patternUnits="userSpaceOnUse"
            >
              <polygon points="56,0 112,56 56,56" fill="#5eead4" opacity="0.3" />
              <polygon points="112,56 56,112 56,56" fill="#67e8f9" opacity="0.28" />
              <polygon points="56,112 0,56 56,56" fill="#818cf8" opacity="0.26" />
              <polygon points="0,56 56,0 56,56" fill="#a5b4fc" opacity="0.24" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#nav-grid)" opacity="0.1" />
          <rect width="100%" height="100%" fill="url(#mosaic-tiles-lg)" opacity="0.12" />
          <rect width="100%" height="100%" fill="url(#mosaic-tiles)" opacity="0.16" />
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
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#060811]/65 via-[#060811]/35 to-[#060811]/65" />

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
              className="font-bold text-white tracking-tight text-base truncate block leading-tight"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {agencyData?.agence?.nom_agence || "Tous Shop"}
            </span>
            <span className="text-xs text-cyan-100 font-medium tracking-wide uppercase">
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
              className="px-2.5 mb-2 text-[11.5px] font-semibold tracking-[0.1em] text-slate-200/90 uppercase select-none"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
            >
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                const showBadge = item.path === "/demandes" && pendingDemandesCount > 0;
                const c = ITEM_ACCENTS[item.path] || DEFAULT_ACCENT;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      group flex items-center px-2 py-2.5 rounded-xl text-[15px] font-medium
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
                      className="flex items-center justify-center w-9 h-9 rounded-lg mr-3 shrink-0 transition-all duration-150"
                      style={{
                        background: active ? `${c.accent}33` : c.chip,
                        boxShadow: `inset 0 0 0 1px ${active ? c.accent + "66" : c.ring}`,
                      }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: active ? "#ffffff" : c.icon }} />
                    </span>

                    <span className="flex-1 truncate">{item.name}</span>

                    {showBadge && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full shadow-sm shadow-red-500/40 ring-1 ring-red-400/20">
                        {pendingDemandesCount > 99 ? "99+" : pendingDemandesCount}
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

      {/* ── User Footer ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 p-3.5 shrink-0 border-t border-white/10">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-colors duration-200 hover:bg-white/[0.07]">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/10"
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
              className="text-[15px] font-semibold text-white truncate leading-tight"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.65)" }}
            >
              {currentUser?.name ||
                `${currentUser?.prenoms || ""} ${currentUser?.nom || ""}`.trim()}
            </p>
            <span className="text-xs text-slate-200 font-medium">
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