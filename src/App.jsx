import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "./hooks/useAuth";
import { useAgency } from "./hooks/useAgency";
import { useTarifs } from "./hooks/useTarifs";
import { useDashboard } from "./hooks/useDashboard";
import { getLogoUrl } from "./utils/apiConfig";

// Import des pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AgencyProfile from "./pages/AgencyProfile";
import Agents from "./pages/Agents";
import CreateExpedition from "./pages/CreateExpedition";
import TarifsSimples from "./pages/TarifsSimples";
import TarifsGroupes from "./pages/TarifsGroupes";
import Comptabilite from "./pages/Comptabilite";


import Expeditions from "./pages/Expeditions";
import Demandes from "./pages/Demandes";
import ExpeditionDetails from "./pages/ExpeditionDetails";
import Colis from "./pages/Colis";
import ReceptionColis from "./pages/ReceptionColis";
import ColisAReceptionner from "./pages/ColisAReceptionner";
import RetraitColis from "./pages/RetraitColis";
import Transactions from "./pages/Transactions";
import ToastManager from "./components/ToastManager";
import DashboardLayout from "./components/DashboardLayout";

// Composant pour gérer la redirection automatique
const AutoRedirect = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  useEffect(() => {
    // Si l'utilisateur est authentifié et sur la page d'accueil, rediriger vers le dashboard
    if (isAuthenticated && status === "succeeded" && location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, status, location.pathname, navigate]);

  return children;
};

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Composant pour les routes publiques
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppContent() {
  // Hooks pour charger les données de l'agence et tarifs
  const { fetchAgencyData, fetchUsers } = useAgency();
  const { checkAuth } = useAuth();
  const { isAuthenticated, status } = useSelector((state) => state.auth);
  const { fetchDashboard } = useDashboard();
  const hasLoadedDataRef = useRef(false);

  useEffect(() => {
    // Vérifier si un token existe au démarrage de l'application
    // Chargement en arrière-plan sans bloquer l'interface
    const token = localStorage.getItem("auth_token");
    if (token) {
      checkAuth();
    }
  }, [checkAuth]);

  // Charger les données de l'agence quand l'utilisateur est authentifié
  const { fetchAgencyTarifs, fetchTarifs, fetchTarifsGroupageBase, fetchTarifGroupageAgence } = useTarifs();

  useEffect(() => {
    if (isAuthenticated && status === "succeeded" && !hasLoadedDataRef.current) {
      hasLoadedDataRef.current = true;
      // Charger les données en arrière-plan de manière asynchrone
      // Sans bloquer l'affichage de l'interface
      // ✅ Précharger aussi les données du Dashboard pour éviter le loader
      Promise.all([
        fetchAgencyData(),
        fetchUsers(),
        fetchTarifs(),
        fetchAgencyTarifs(),
        fetchTarifsGroupageBase(),
        fetchTarifGroupageAgence(),
        fetchDashboard(false, true) // Préchargement silencieux du Dashboard
      ]).catch(err => console.error("Erreur lors du chargement des données:", err));
    }
  }, [isAuthenticated, status, fetchAgencyData, fetchUsers, fetchTarifs, fetchAgencyTarifs, fetchTarifsGroupageBase, fetchTarifGroupageAgence, fetchDashboard]);

  return (
    <AutoRedirect>
      <ToastManager />
      <Routes>
        {/* Routes publiques */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tarifs-simples" element={<TarifsSimples />} />
          <Route path="/tarifs-groupage" element={<TarifsGroupes />} />
          <Route path="/agency-profile" element={<AgencyProfile />} />
          <Route path="/comptabilite" element={<Comptabilite />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/expeditions" element={<Expeditions />} />
          <Route path="/demandes" element={<Demandes />} />
          <Route path="/colis" element={<Colis />} />
          <Route path="/reception-colis" element={<ReceptionColis />} />
          <Route path="/colis-a-receptionner" element={<ColisAReceptionner />} />
          <Route path="/expeditions/:id" element={<ExpeditionDetails />} />
          <Route path="/create-expedition" element={<CreateExpedition />} />
          <Route path="/retrait-colis" element={<RetraitColis />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>
        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AutoRedirect>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
