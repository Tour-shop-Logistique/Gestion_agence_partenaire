import React, { useEffect, useState } from "react";
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

// Import des pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tarifs from "./pages/Tarifs";
import AgencyProfile from "./pages/AgencyProfile";
import Agents from "./pages/Agents";

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
  const { checkAuth } = useAuth();
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  // Hooks pour charger les données de l'agence et tarifs
  const { fetchAgencyData, fetchUsers } = useAgency();
  const { fetchAgencyTarifs } = useTarifs();

  // État pour contrôler l'affichage du loader initial
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Vérifier si un token existe au démarrage de l'application
    const token = localStorage.getItem("auth_token");
    console.log("Token au démarrage:", token);
    
    if (token) {
      // Si un token existe, vérifier son authenticité
      checkAuth().finally(() => {
        setInitialCheckDone(true);
      });
    } else {
      // Si pas de token, marquer comme terminé
      setInitialCheckDone(true);
    }
  }, [checkAuth]);

  // Charger les données de l'agence quand l'utilisateur est authentifié
  useEffect(() => {
    if (isAuthenticated && status === "succeeded") {
      console.log("Utilisateur authentifié, chargement des données...");
      // Charger les données de l'agence et les tarifs
      fetchAgencyData();
      fetchUsers();
      fetchAgencyTarifs();
    }
  }, [isAuthenticated, status]); // Retirer les dépendances des fonctions pour éviter les re-renders

  // Afficher un loader pendant la vérification initiale
  if (!initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Vérification de la connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AutoRedirect>
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tarifs"
          element={
            <ProtectedRoute>
              <Tarifs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agency-profile"
          element={
            <ProtectedRoute>
              <AgencyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <Agents />
            </ProtectedRoute>
          }
        />

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
