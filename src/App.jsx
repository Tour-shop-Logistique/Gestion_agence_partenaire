import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "./hooks/useAuth";
import { useAgency } from "./hooks/useAgency";
import { useTarifs } from "./hooks/useTarifs";
import { apiService } from "./utils/apiService";

// Import des pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tarifs from "./pages/Tarifs";
import AgencyProfile from "./pages/AgencyProfile";
import Agents from "./pages/Agents";

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  // Afficher un loader pendant la vérification d'authentification
  // if (status === 'loading') {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Composant pour les routes publiques
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { checkAuth } = useAuth();
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  // Hooks pour charger les données de l'agence et tarifs
  const { fetchAgencyData, fetchUsers } = useAgency();
  const { fetchAgencyTarifs } = useTarifs();

  // État pour contrôler l'affichage du loader initial
  const [initialCheckDone, setInitialCheckDone] = React.useState(false);

  useEffect(() => {
    // Vérifier si un token existe au démarrage de l'application
    const token = localStorage.getItem("auth_token");
    console.log("Token:", token);
    if (token) {
      // Définir le token dans le service API
      apiService.setAuthToken(token);
      checkAuth().finally(() => {
        setInitialCheckDone(true);
      });
    } else {
      // Si pas de token ou déjà authentifié, marquer comme terminé
      setInitialCheckDone(true);
    }
  }, [checkAuth, isAuthenticated, status]);

  // Charger les données de l'agence quand l'utilisateur est authentifié
  useEffect(() => {
    if (isAuthenticated && status === "succeeded") {
      // Charger les données de l'agence, les utilisateurs et les tarifs
      fetchAgencyData();
      fetchUsers();
      fetchAgencyTarifs();
    }
  }, [isAuthenticated, status, fetchAgencyData, fetchUsers, fetchAgencyTarifs]);

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
    <Router>
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
    </Router>
  );
}

export default App;
