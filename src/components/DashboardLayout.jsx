import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OrnamentalBackground from './OrnamentalBackground';
import PushNotificationPrompt from './PushNotificationPrompt';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* ========== FOND ORNAMENTAL GLOBAL ========== */}
      <OrnamentalBackground />

      {/* Sidebar - fixed position for desktop only */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5">
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
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/5 transition-transform duration-300 ease-in-out shadow-xl lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        inert={!sidebarOpen ? true : undefined}
      >
        <div className="h-full overflow-hidden">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-64 relative z-10">
        <div className="flex flex-col min-h-screen">
          <Header onToggleSidebar={() => setSidebarOpen(open => !open)} />
          <main className="flex-1 overflow-y-auto pt-1 pb-4 bg-transparent">
            <PushNotificationPrompt />
            <div className="px-4 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5 max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
