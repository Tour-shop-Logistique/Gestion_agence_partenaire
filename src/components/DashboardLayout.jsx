import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Les données de l'agence sont maintenant chargées dans App.jsx au niveau global
  // Plus besoin de les charger ici pour éviter les appels multiples

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - fixed position for desktop only */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200">
        <div className="h-full overflow-hidden">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out shadow-xl lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!sidebarOpen}
      >
        <div className="h-full overflow-hidden">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-72">
        <div className="flex flex-col min-h-screen">
          <Header onToggleSidebar={() => setSidebarOpen(open => !open)} />
          <main className="flex-1 overflow-y-auto pt-16 pb-4">
            <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
