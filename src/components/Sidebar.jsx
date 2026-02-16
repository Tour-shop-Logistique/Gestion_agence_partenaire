import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAdmin } from "../store/slices/authSlice";
import { useAgency } from "../hooks/useAgency";
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
  TruckIcon
} from "@heroicons/react/24/outline";
import { getLogoUrl } from "../utils/apiConfig";


const Sidebar = ({ onClose }) => {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();
  const { data: agencyData } = useAgency();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const adminMenuItems = [
    {
      path: "/dashboard",
      name: "Tableau de bord",
      icon: ChartBarIcon,
    },
    {
      path: "/requests",
      name: "Demandes",
      icon: ClipboardDocumentListIcon,
    },
    {
      path: "/expeditions",
      name: "Expéditions",
      icon: TruckIcon,
    },
    {
      path: "/colis",
      name: "Colis",
      icon: CubeIcon,
    },
    {
      path: "/tarifs-simples",
      name: "Tarifs Simples",
      icon: CurrencyDollarIcon,
    },
    {
      path: "/tarifs-groupage",
      name: "Tarifs Groupage",
      icon: TableCellsIcon,
    },

    {
      path: "/agents",
      name: "Équipe & Agents",
      icon: UsersIcon,
    },
    {
      path: "/agency-profile",
      name: "Configuration Agence",
      icon: BuildingOffice2Icon,
    },
  ];

  const agentMenuItems = [
    {
      path: "/dashboard",
      name: "Tableau de bord",
      icon: ChartBarIcon,
    },
    {
      path: "/requests",
      name: "Demandes",
      icon: ClipboardDocumentListIcon,
    },
    {
      path: "/expeditions",
      name: "Expéditions",
      icon: TruckIcon,
    },
    {
      path: "/colis",
      name: "Colis",
      icon: CubeIcon,
    },
    {
      path: "/tarifs-simples",
      name: "Tarifs Simples",
      icon: CurrencyDollarIcon,
    },
    {
      path: "/tarifs-groupage",
      name: "Tarifs Groupage",
      icon: TableCellsIcon,
    },

    {
      path: "/agency-profile",
      name: "Info Agence",
      icon: BuildingOffice2Icon,
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
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</p>
        </div>
        {menuItems.map((item) => {
          const Active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${Active
                ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <item.icon className={`w-5 h-5 mr-3 shrink-0 ${Active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span className="flex-1">{item.name}</span>
              {Active && <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User Section - Footer Pattern */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            <span className="text-slate-600 font-bold text-xs">
              {(currentUser?.name || currentUser?.nom || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {currentUser?.name || `${currentUser?.prenoms || ''} ${currentUser?.nom || ''}`}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border ${isAdminLike ? "bg-red-50 text-red-700 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"
                }`}>
                {isAdminLike ? "Administrateur" : "Agent Agence"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
