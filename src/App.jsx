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
import { selectAgencyConfigured } from "./store/slices/agencySlice";
import { selectCurrentUser, selectIsAdmin, setUser } from "./store/slices/authSlice";
import { notificationAdded } from "./store/slices/inAppNotificationsSlice";
import { classifyNotification } from "./utils/notificationClassifier";
import { canAccessPage } from "./utils/permissions";
import { autoCheckAndUpdate, handleChunkLoadError } from "./utils/versionChecker";
import { getEcho, disconnectEcho } from "./services/echo";
import { fetchNotifications, announcementReceived } from "./store/slices/notificationsSlice";
import { messageReceived, messageUpdated, messageDeleted } from "./store/slices/messagesSlice";
import { useWebSocket } from "./hooks/useWebSocket";
import { showToast } from "./utils/toast";
import soundNotification from "./utils/soundNotification";
import { requestNotificationPermission, showBrowserNotification } from "./utils/browserNotification";

// Import des pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AgencyProfile from "./pages/AgencyProfile";
import Agents from "./pages/Agents";
import AgentProfile from "./pages/AgentProfile";
import CreateExpeditionV2 from "./pages/CreateExpeditionV2";
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
import TransactionsPro from "./pages/TransactionsPro";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import ToastManager from "./components/ToastManager";
import DashboardLayout from "./components/DashboardLayout";
import WebSocketDebugPanel from "./components/WebSocketDebugPanel";

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

// Composant pour les routes protégées (vérifie uniquement l'authentification).
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Garde de page : redirige vers /dashboard si l'agent connecté n'a pas accès
// à cette page (rôle assigné dont les pages n'incluent pas pageKey).
const PageGuard = ({ children, pageKey }) => {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);

  if (!canAccessPage(currentUser, isAdmin, pageKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Composant pour les routes publiques
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

/**
 * Guard : redirige vers /agency-profile si le profil agence n'est pas encore configuré.
 * S'applique à toutes les routes protégées SAUF /agency-profile elle-même.
 * Attend que le fetch agence soit terminé (status !== 'loading') avant de décider.
 */
const AgencySetupGuard = ({ children }) => {
  const agencyConfigured = useSelector(selectAgencyConfigured);
  const agencyStatus = useSelector((state) => state.agency.status);
  const location = useLocation();

  // Laisser passer la page de configuration elle-même
  if (location.pathname === "/agency-profile") {
    return children;
  }

  // Pendant le chargement initial, ne pas rediriger (évite un flash)
  if (agencyStatus === "loading" || agencyStatus === "idle") {
    return children;
  }

  // Si le profil n'est pas configuré, forcer la redirection
  if (!agencyConfigured) {
    return <Navigate to="/agency-profile" replace />;
  }

  return children;
};

function AppContent() {
  // Hooks pour charger les données de l'agence et tarifs
  const { fetchAgencyData, fetchUsers } = useAgency();
  const { checkAuth, currentUser } = useAuth();
  const { isAuthenticated, status } = useSelector((state) => state.auth);
  const { fetchDashboard } = useDashboard();
  const hasLoadedDataRef = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ========== INITIALISATION WEBSOCKET ==========
  useEffect(() => {
    if (isAuthenticated && status === "succeeded") {
      // Initialiser Echo quand l'utilisateur est authentifié
      console.log('🔌 [App] Initialisation de la connexion WebSocket');
      const echo = getEcho();

      if (!echo) {
        console.warn('⚠️ [App] Impossible d\'initialiser WebSocket');
      }

      // Nettoyer la connexion à la déconnexion
      return () => {
        console.log('🔌 [App] Nettoyage de la connexion WebSocket');
        disconnectEcho();
      };
    }
  }, [isAuthenticated, status]);

  // Demande la permission d'afficher des notifications systeme une fois
  // l'utilisateur authentifie (le navigateur exige un geste/contexte utilisateur).
  useEffect(() => {
    if (isAuthenticated && status === "succeeded") {
      requestNotificationPermission();
    }
  }, [isAuthenticated, status]);

  // Ecoute globale des annonces backoffice : active sur toute l'app (pas
  // seulement la page Notifications) pour que l'agent recoive la notification
  // systeme meme s'il consulte une autre page au moment de l'envoi.
  useWebSocket(currentUser?.agence_id, {
    onAnnouncementCreated: (data) => {
      dispatch(announcementReceived(data));
      const announcement = Array.isArray(data) ? data[0] : data;
      showToast("📢 Nouvelle annonce du backoffice", "info");
      soundNotification.playSuccess();
      showBrowserNotification(announcement?.titre || "Nouvelle annonce", {
        body: announcement?.message,
        onClick: () => navigate("/notifications"),
      });
    },
    onColisAssigned: (data) => {
      const entry = classifyNotification('Colis', 'assigned', data);
      if (!entry) return;
      dispatch(notificationAdded(entry));
      showToast(`📦 ${entry.message}`, "info");
      soundNotification.playSuccess();
      showBrowserNotification(entry.title, { body: entry.message, onClick: () => navigate(entry.link) });
    },
    onColisReceivedByBackoffice: (data) => {
      const entry = classifyNotification('Colis', 'received_by_backoffice', data);
      if (!entry) return;
      dispatch(notificationAdded(entry));
      showToast(`📦 ${entry.message}`, "info");
      soundNotification.playSuccess();
      showBrowserNotification(entry.title, { body: entry.message, onClick: () => navigate(entry.link) });
    },
    onColisBlocked: (data) => {
      const entry = classifyNotification('Colis', 'blocked', data);
      if (!entry) return;
      dispatch(notificationAdded(entry));
      showToast(`⚠️ ${entry.message}`, "warning");
      soundNotification.playAlert();
      showBrowserNotification(entry.title, { body: entry.message, onClick: () => navigate(entry.link) });
    },
    onColisUnblocked: (data) => {
      const entry = classifyNotification('Colis', 'unblocked', data);
      if (!entry) return;
      dispatch(notificationAdded(entry));
      showToast(`✅ ${entry.message}`, "success");
      soundNotification.playSuccess();
      showBrowserNotification(entry.title, { body: entry.message, onClick: () => navigate(entry.link) });
    },
    onMessageReceived: (data) => {
      const message = Array.isArray(data) ? data[0] : data;
      if (!message) return;
      dispatch(messageReceived(message));
      // N'affiche pas de toast pour ses propres messages (déjà ajoutés localement à l'envoi)
      if (message.sender?.type === "agence") return;
      showToast("💬 Nouveau message du backoffice", "info");
      soundNotification.playSuccess();
      showBrowserNotification(message.sender?.name || "Backoffice", {
        body: message.body || "Pièce jointe",
        onClick: () => navigate("/messages"),
      });
    },
    onMessageUpdated: (data) => {
      const message = Array.isArray(data) ? data[0] : data;
      if (message) dispatch(messageUpdated(message));
    },
    onMessageDeleted: (data) => {
      const item = Array.isArray(data) ? data[0] : data;
      if (item?.id) dispatch(messageDeleted(item.id));
    },
    onUserRoleChanged: (data) => {
      const item = Array.isArray(data) ? data[0] : data;
      if (item?.id && item.id === currentUser?.id) {
        dispatch(setUser({ ...currentUser, role_id: item.role_id, role_details: item.role_details }));
        localStorage.setItem("auth_user", JSON.stringify({ ...currentUser, role_id: item.role_id, role_details: item.role_details }));
        showToast("Vos permissions d'accès ont été mises à jour.", "info");
      }
    },
  });

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
  const agencyConfigured = useSelector(selectAgencyConfigured);
  const agencyStatus = useSelector((state) => state.agency.status);

  useEffect(() => {
    if (isAuthenticated && status === "succeeded" && !hasLoadedDataRef.current) {
      hasLoadedDataRef.current = true;
      
      // 1. Charger d'abord UNIQUEMENT le profil d'agence pour vérifier la configuration
      const agencyPromise = fetchAgencyData(true); // forceRefresh = true pour s'assurer d'avoir une Promise
      
      // Gérer le cas où fetchAgencyData retourne undefined (déjà chargé)
      if (!agencyPromise) {
        // Les données sont déjà chargées, vérifier directement la configuration
        const state = dispatch((dispatch, getState) => getState());
        const isAgencyConfigured = selectAgencyConfigured(state);
        
        if (isAgencyConfigured) {
          console.log("✅ Agence déjà configurée - Chargement de toutes les données");
          Promise.all([
            fetchUsers(),
            fetchTarifs(),
            fetchAgencyTarifs(),
            fetchTarifsGroupageBase(),
            fetchTarifGroupageAgence(),
            fetchDashboard(false, true),
            dispatch(fetchNotifications())
          ]).catch(err => console.error("Erreur lors du chargement des données:", err));
        } else {
          console.log("⚠️ Agence non configurée - Redirection vers la page de configuration");
        }
        return;
      }
      
      // Si on a une Promise, attendre sa résolution
      agencyPromise
        .then(() => {
          // 2. Récupérer l'état de configuration depuis Redux
          const state = dispatch((dispatch, getState) => getState());
          const isAgencyConfigured = selectAgencyConfigured(state);
          
          // 3. Ne charger les autres APIs QUE si l'agence est configurée
          if (isAgencyConfigured) {
            console.log("✅ Agence configurée - Chargement de toutes les données");
            Promise.all([
              fetchUsers(),
              fetchTarifs(),
              fetchAgencyTarifs(),
              fetchTarifsGroupageBase(),
              fetchTarifGroupageAgence(),
              fetchDashboard(false, true), // Préchargement silencieux du Dashboard
              dispatch(fetchNotifications())
            ]).catch(err => console.error("Erreur lors du chargement des données:", err));
          } else {
            console.log("⚠️ Agence non configurée - Redirection vers la page de configuration");
            // Les autres APIs ne seront pas lancées
            // La redirection sera gérée par AgencySetupGuard
          }
        })
        .catch(err => {
          console.error("❌ Erreur lors du chargement du profil d'agence:", err);
        });
    }
  }, [isAuthenticated, status, fetchAgencyData, fetchUsers, fetchTarifs, fetchAgencyTarifs, fetchTarifsGroupageBase, fetchTarifGroupageAgence, fetchDashboard, dispatch, agencyStatus]);

  return (
    <AutoRedirect>
      <ToastManager />
      {/* Debug Panel WebSocket (DEV ONLY - Ctrl+Shift+D pour ouvrir) */}
      {import.meta.env.DEV && <WebSocketDebugPanel />}
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
          <Route path="/dashboard" element={<AgencySetupGuard><PageGuard pageKey="dashboard"><Dashboard /></PageGuard></AgencySetupGuard>} />
          <Route path="/tarifs-simples" element={<AgencySetupGuard><PageGuard pageKey="tarifs_simples"><TarifsSimples /></PageGuard></AgencySetupGuard>} />
          <Route path="/tarifs-groupage" element={<AgencySetupGuard><PageGuard pageKey="tarifs_groupage"><TarifsGroupes /></PageGuard></AgencySetupGuard>} />
          <Route path="/agency-profile" element={<PageGuard pageKey="agency_profile"><AgencyProfile /></PageGuard>} />
          <Route path="/agent-profile" element={<AgentProfile />} />
          <Route path="/comptabilite" element={<AgencySetupGuard><PageGuard pageKey="comptabilite"><Comptabilite /></PageGuard></AgencySetupGuard>} />
          <Route path="/agents" element={<AgencySetupGuard><PageGuard pageKey="agents"><Agents /></PageGuard></AgencySetupGuard>} />
          <Route path="/expeditions" element={<AgencySetupGuard><PageGuard pageKey="expeditions"><Expeditions /></PageGuard></AgencySetupGuard>} />
          <Route path="/demandes" element={<AgencySetupGuard><PageGuard pageKey="demandes"><Demandes /></PageGuard></AgencySetupGuard>} />
          <Route path="/colis" element={<AgencySetupGuard><PageGuard pageKey="colis"><Colis /></PageGuard></AgencySetupGuard>} />
          <Route path="/reception-colis" element={<AgencySetupGuard><PageGuard pageKey="colis"><ReceptionColis /></PageGuard></AgencySetupGuard>} />
          <Route path="/colis-a-receptionner" element={<AgencySetupGuard><PageGuard pageKey="colis_a_receptionner"><ColisAReceptionner /></PageGuard></AgencySetupGuard>} />
          <Route path="/expeditions/:id" element={<AgencySetupGuard><PageGuard pageKey="expeditions"><ExpeditionDetails /></PageGuard></AgencySetupGuard>} />
          <Route path="/create-expedition" element={<AgencySetupGuard><PageGuard pageKey="expeditions"><CreateExpeditionV2 /></PageGuard></AgencySetupGuard>} />
          <Route path="/retrait-colis" element={<AgencySetupGuard><PageGuard pageKey="retrait_colis"><RetraitColis /></PageGuard></AgencySetupGuard>} />
          <Route path="/transactions" element={<AgencySetupGuard><PageGuard pageKey="transactions"><TransactionsPro /></PageGuard></AgencySetupGuard>} />
          <Route path="/transactions-legacy" element={<AgencySetupGuard><PageGuard pageKey="transactions"><Transactions /></PageGuard></AgencySetupGuard>} />
          <Route path="/notifications" element={<AgencySetupGuard><Notifications /></AgencySetupGuard>} />
          <Route path="/messages" element={<AgencySetupGuard><PageGuard pageKey="communication"><Messages /></PageGuard></AgencySetupGuard>} />
        </Route>
        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AutoRedirect>
  );
}

function App() {
  // Vérifier les mises à jour au démarrage
  useEffect(() => {
    autoCheckAndUpdate();
  }, []);

  // Gestion des erreurs de chargement de chunks (page blanche en production)
  useEffect(() => {
    const handleError = (event) => {
      const error = event.error || event.reason;
      
      // Gestion des erreurs de chunk loading
      if (handleChunkLoadError(error)) {
        event.preventDefault();
        return;
      }

      // Gestion des erreurs DOM de React (insertBefore, removeChild, etc.)
      if (
        error?.message?.includes('insertBefore') ||
        error?.message?.includes('removeChild') ||
        error?.message?.includes('Failed to execute') ||
        error?.message?.includes('Node')
      ) {
        console.error('DOM manipulation error detected:', error);
        event.preventDefault();
        
        // Recharger la page après un court délai pour permettre à React de se stabiliser
        setTimeout(() => {
          console.warn('Reloading page due to DOM error...');
          window.location.reload();
        }, 500);
      }
    };

    const handleUnhandledRejection = (event) => {
      const error = event.reason;
      
      if (handleChunkLoadError(error)) {
        event.preventDefault();
        return;
      }

      // Gestion des erreurs DOM dans les promesses
      if (
        error?.message?.includes('insertBefore') ||
        error?.message?.includes('removeChild') ||
        error?.message?.includes('Failed to execute')
      ) {
        console.error('DOM manipulation error in promise:', error);
        event.preventDefault();
        
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
