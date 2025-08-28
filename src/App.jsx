import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RequestProvider } from './contexts/RequestContext';
import { TariffProvider } from './contexts/TariffContext';
import { AgencyProvider } from './contexts/AgencyContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Requests from './pages/Requests';
import Tariffs from './pages/Tariffs';
import Shipments from './pages/Shipments';
import AgencyProfile from './pages/AgencyProfile';

// Component to protect routes
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
};

// Main application component
const AppContent = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/agents" element={
              <ProtectedRoute>
                <Agents />
              </ProtectedRoute>
            } />
            <Route path="/requests" element={
              <ProtectedRoute>
                <Requests />
              </ProtectedRoute>
            } />
            <Route path="/tariffs" element={
              <ProtectedRoute>
                <Tariffs />
              </ProtectedRoute>
            } />
            <Route path="/shipments" element={
              <ProtectedRoute>
                <Shipments />
              </ProtectedRoute>
            } />
            <Route path="/agency-profile" element={
              <ProtectedRoute>
                <AgencyProfile />
              </ProtectedRoute>
            } />
            {/* Placeholder routes for remaining pages */}
            <Route path="/messages" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">💬</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
                    <p className="text-gray-600">Page en cours de développement</p>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Rapports</h1>
                    <p className="text-gray-600">Page en cours de développement</p>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">👤</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil</h1>
                    <p className="text-gray-600">Page en cours de développement</p>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// App component with providers
const App = () => {
  return (
    <AuthProvider>
      <AgencyProvider>
        <RequestProvider>
          <TariffProvider>
            <AppContent />
          </TariffProvider>
        </RequestProvider>
      </AgencyProvider>
    </AuthProvider>
  );
};

export default App;
