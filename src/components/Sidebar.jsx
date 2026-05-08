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
  ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";
import { getLogoUrl } from "../utils/apiConfig";


const Sidebar = ({ onClose }) => {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();
  const { data: agencyData } = useAgency();
  const { demandesMeta } = useExpedition();
  
  // Sélecteur direct depuis Redux pour debug
  const demandesMetaDirect = useSelector(state => state.expedition?.demandesMeta);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const pendingDemandesCount = demandesMeta?.total || 0;

  // Debug log
  React.useEffect(() => {
    console.log("demandesMeta from hook:", demandesMeta);
    console.log("demandesMeta direct from Redux:", demandesMetaDirect);
    console.log("pendingDemandesCount:", pendingDemandesCount);
  }, [demandesMeta, demandesMetaDirect, pendingDemandesCount]);

  const adminMenuItems = [
    {
      section: "Principal",
      items: [
        {
          path: "/dashboard",
          name: "Tableau de bord",
          icon: ChartBarIcon,
        },
        {
          path: "/demandes",
          name: "Demandes",
          icon: ClipboardDocumentListIcon,
        },
        {
          path: "/expeditions",
          name: "Expéditions",
          icon: TruckIcon,
        },
      ]
    },
    {
      section: "Colis",
      items: [
        {
          path: "/colis",
          name: "Tous les colis",
          icon: CubeIcon,
        },
        {
          path: "/colis-a-receptionner",
          name: "À réceptionner",
          icon: InboxArrowDownIcon,
        },
        {
          path: "/retrait-colis",
          name: "Retrait",
          icon: UserCircleIcon,
        },
      ]
    },
    {
      section: "Finance",
      items: [
        {
          path: "/comptabilite",
          name: "Comptabilité",
          icon: BanknotesIcon,
        },
        {
          path: "/transactions",
          name: "Transactions",
          icon: ArrowsRightLeftIcon,
        },
      ]
    },
    {
      section: "Tarifs",
      items: [
        {
          path: "/tarifs-simples",
          name: "Simples",
          icon: CurrencyDollarIcon,
        },
        {
          path: "/tarifs-groupage",
          name: "Groupage",
          icon: TableCellsIcon,
        },
      ]
    },
    {
      section: "Configuration",
      items: [
        {
          path: "/agents",
          name: "Équipe",
          icon: UsersIcon,
        },
        {
          path: "/agency-profile",
          name: "Agence",
          icon: BuildingOffice2Icon,
        },
      ]
    },
  ];

  const agentMenuItems = [
    {
      section: "Principal",
      items: [
        {
          path: "/dashboard",
          name: "Tableau de bord",
          icon: ChartBarIcon,
        },
        {
          path: "/demandes",
          name: "Demandes",
          icon: ClipboardDocumentListIcon,
        },
        {
          path: "/expeditions",
          name: "Expéditions",
          icon: TruckIcon,
        },
      ]
    },
    {
      section: "Colis",
      items: [
        {
          path: "/colis",
          name: "Tous les colis",
          icon: CubeIcon,
        },
        {
          path: "/colis-a-receptionner",
          name: "À réceptionner",
          icon: InboxArrowDownIcon,
        },
        {
          path: "/retrait-colis",
          name: "Retrait",
          icon: UserCircleIcon,
        },
      ]
    },
    {
      section: "Finance",
      items: [
        {
          path: "/comptabilite",
          name: "Comptabilité",
          icon: BanknotesIcon,
        },
        {
          path: "/transactions",
          name: "Transactions",
          icon: ArrowsRightLeftIcon,
        },
      ]
    },
    {
      section: "Tarifs",
      items: [
        {
          path: "/tarifs-simples",
          name: "Simples",
          icon: CurrencyDollarIcon,
        },
        {
          path: "/tarifs-groupage",
          name: "Groupage",
          icon: TableCellsIcon,
        },
      ]
    },
    {
      section: "Configuration",
      items: [
        {
          path: "/agency-profile",
          name: "Agence",
          icon: BuildingOffice2Icon,
        },
      ]
    },
  ];

  const isAdminLike =
    isAdmin ||
    currentUser?.role === "is_agence_admin" ||
    currentUser?.is_agence_admin === true;

  const menuItems = isAdminLike ? adminMenuItems : agentMenuItems;

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-72 lg:mt-0 mt-0">
      {/* Branding Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center p-1 overflow-hidden">
            {agencyData?.agence?.logo ? (
              <img
                src={getLogoUrl(agencyData.agence.logo)}
                alt="Logo"
                className="w-full h-full object-contain "
              />
            ) : (
              <BuildingOffice2Icon className="w-5 h-5 text-white" />
            )}

          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">
            {agencyData?.agence?.nom_agence || "Tous Shop"}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden ml-auto p-2 text-slate-400 hover:text-slate-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <div className="px-3 mb-1.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{section.section}</p>
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Active = isActive(item.path);
                const showBadge = item.path === "/demandes" && pendingDemandesCount > 0;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${Active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    <item.icon className={`w-4 h-4 mr-2.5 shrink-0 ${Active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <span className="flex-1 truncate">{item.name}</span>
                    {showBadge && (
                      <span className="flex items-center justify-center min-w-[18px] h-4 px-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full">
                        {pendingDemandesCount > 99 ? '99+' : pendingDemandesCount}
                      </span>
                    )}
                    {Active && !showBadge && <ChevronRightIcon className="w-3 h-3 text-slate-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section - Footer Pattern */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            <span className="text-slate-600 font-bold text-xs">
              {(currentUser?.name || currentUser?.nom || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="ml-2.5 min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentUser?.name || `${currentUser?.prenoms || ''} ${currentUser?.nom || ''}`}
            </p>
            <span className={`inline-block text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border ${isAdminLike ? "bg-red-50 text-red-700 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"
              }`}>
              {isAdminLike ? "Admin" : "Agent"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
