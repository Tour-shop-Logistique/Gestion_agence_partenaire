import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { currentUser, isAdmin, isAgent } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const adminMenuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'Vue d\'ensemble'
    },
    {
      path: '/agency-profile',
      name: 'Profil de l\'agence',
      icon: '🏢',
      description: 'Informations de l\'agence'
    },
    {
      path: '/agents',
      name: 'Gestion des agents',
      icon: '👥',
      description: 'Gérer votre équipe'
    },
    {
      path: '/requests',
      name: 'Demandes clients',
      icon: '📋',
      description: 'Suivre les demandes'
    },
    {
      path: '/tariffs',
      name: 'Gestion des tarifs',
      icon: '💰',
      description: 'Configurer les prix'
    },
    {
      path: '/reports',
      name: 'Rapports',
      icon: '📈',
      description: 'Statistiques et analyses'
    }
  ];

  const agentMenuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'Vue d\'ensemble'
    },
    {
      path: '/requests',
      name: 'Demandes clients',
      icon: '📋',
      description: 'Gérer les demandes'
    },
    {
      path: '/shipments',
      name: 'Expéditions',
      icon: '📦',
      description: 'Suivre les colis'
    },
    {
      path: '/tariffs',
      name: 'Tarifs',
      icon: '💰',
      description: 'Consulter les prix'
    },
    {
      path: '/messages',
      name: 'Messages',
      icon: '💬',
      description: 'Communiquer avec les clients'
    }
  ];

  // Accepter à la fois la normalisation (role === 'admin' ou flag is_agence_admin)
  // et le rôle brut renvoyé par l'API ('is_agence_admin')
  const isAdminLike = isAdmin() || currentUser?.role === 'is_agence_admin' || currentUser?.is_agence_admin === true;
  // Si admin: donner accès à tous les onglets (admin + agent) sans doublons
  const menuItems = (() => {
    if (!isAdminLike) {
      // Restreindre l'agent: pas d'accès à gestion des agents ni aux tarifs
      const forbidden = new Set(['/agents', '/tariffs']);
      return agentMenuItems.filter(item => !forbidden.has(item.path));
    }
    // Utiliser une Map pour dédupliquer par path et prioriser les items admin
    const map = new Map();
    // D'abord les items admin (prioritaires)
    for (const item of adminMenuItems) {
      map.set(item.path, item);
    }
    // Puis ajouter les items agent seulement s'ils n'existent pas déjà
    for (const item of agentMenuItems) {
      if (!map.has(item.path)) {
        map.set(item.path, item);
      }
    }
    return Array.from(map.values());
  })();

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen fixed left-0 top-0 z-50">
      {/* Logo et titre */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">AP</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Agence Partenaire</h1>
            <p className="text-xs text-gray-500">
              {isAdmin() ? 'Administration' : 'Espace Agent'}
            </p>
          </div>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-primary-600 font-medium">
              {currentUser?.name?.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser?.name || [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(' ')}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentUser?.email || currentUser?.telephone}
            </p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
              isAdminLike 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isAdminLike ? 'Administrateur' : 'Agent'}
            </span>
          </div>
        </div>
      </div>

      {/* Menu de navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Section profil */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <Link
          to="/profile"
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive('/profile')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <span className="text-lg mr-3">👤</span>
          <div>
            <div className="font-medium">Profil</div>
            <div className="text-xs text-gray-500">Paramètres du compte</div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
