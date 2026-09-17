import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import VerifyResetCodeForm from "./VerifyResetCodeForm";
import ResetPasswordForm from "./ResetPasswordForm";
import VerifyEmailForm from "./VerifyEmailForm";

/**
 * Repère de trajet - signature visuelle du panneau d'auth : deux points
 * reliés par une ligne pointillée, écho discret du suivi de colis (le
 * "trajet" d'une connexion/inscription), sans illustration de colis/camion
 * clichée.
 */
const RouteMark = () => (
  <svg width="40" height="12" viewBox="0 0 40 12" fill="none" className="mb-5" aria-hidden="true">
    <circle cx="3" cy="6" r="3" fill="#1D4ED8" />
    <line x1="8" y1="6" x2="32" y2="6" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="1 4" strokeLinecap="round" />
    <circle cx="37" cy="6" r="3" fill="#0F1E3D" />
  </svg>
);

/**
 * Repère de trajet à 3 points - variante utilisée pour le flux de
 * réinitialisation (3 étapes : email -> code -> nouveau mot de passe), le
 * point atteint marque l'étape courante en surbrillance bleue.
 */
const RouteMarkSteps = ({ active }) => (
  <svg width="56" height="12" viewBox="0 0 56 12" fill="none" className="mb-5" aria-hidden="true">
    <circle cx="3" cy="6" r="3" fill={active >= 1 ? "#1D4ED8" : "#CBD5E1"} />
    <line x1="8" y1="6" x2="24" y2="6" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="1 4" strokeLinecap="round" />
    <circle cx="28" cy="6" r="3" fill={active >= 2 ? "#1D4ED8" : "#CBD5E1"} />
    <line x1="32" y1="6" x2="48" y2="6" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="1 4" strokeLinecap="round" />
    <circle cx="53" cy="6" r="3" fill={active >= 3 ? "#0F1E3D" : "#CBD5E1"} />
  </svg>
);

const viewCopy = {
  login: {
    title: "Connexion",
    subtitle: "Accédez à l'espace de gestion de votre agence",
  },
  register: {
    title: "Créer un compte admin",
    subtitle: "Créez votre compte administrateur pour gérer votre agence",
  },
  forgot: {
    title: "Mot de passe oublié",
    subtitle: "Entrez votre email pour recevoir un code de réinitialisation",
  },
  "verify-code": {
    title: "Vérification du code",
    subtitle: "",
  },
  "reset-password": {
    title: "Nouveau mot de passe",
    subtitle: "Créez votre nouveau mot de passe",
  },
  "verify-email": {
    title: "Vérification de l'email",
    subtitle: "",
  },
};

/**
 * Panneau d'authentification : une seule carte dont la vue interne bascule
 * (login/register/forgot/verify-code/reset-password/verify-email) au lieu
 * d'empiler des modales les unes par-dessus les autres - aligné sur le
 * pattern du backoffice (voir WelcomePage.jsx côté backoffice-app).
 */
const AuthPanel = ({ initialView = "login" }) => {
  const [view, setView] = useState(initialView);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [loginSuccessMessage, setLoginSuccessMessage] = useState("");

  const goToLogin = (message = "") => {
    setLoginSuccessMessage(message);
    setView("login");
  };

  // L'inscription a deux fois plus de champs (nom/prénom, mot de passe/
  // confirmation côte à côte) : une carte plus large lui évite d'écraser ces
  // paires sur desktop, les autres vues (plus courtes) restent en max-w-md.
  const isWide = view === "register";

  return (
    <div className={`w-full transition-[max-width] duration-200 ${isWide ? "max-w-lg" : "max-w-md"}`}>
      <div className="bg-white rounded-lg p-6 sm:p-8 shadow-2xl shadow-slate-900/20">
        {view === "verify-code" || view === "reset-password" ? (
          <RouteMarkSteps active={view === "verify-code" ? 2 : 3} />
        ) : (
          <RouteMark />
        )}

        {viewCopy[view].title && (
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {viewCopy[view].title}
          </h2>
        )}
        {viewCopy[view].subtitle && (
          <p className="text-sm text-slate-500 mb-6">
            {viewCopy[view].subtitle}
          </p>
        )}
        {!viewCopy[view].subtitle && viewCopy[view].title && <div className="mb-6" />}

        {view === "login" && (
          <LoginForm
            switchToRegister={() => setView("register")}
            switchToForgotPassword={() => setView("forgot")}
            successMessage={loginSuccessMessage}
          />
        )}

        {view === "register" && (
          <RegisterForm
            onVerificationRequired={(email) => {
              setPendingVerificationEmail(email);
              setView("verify-email");
            }}
            switchToLogin={() => goToLogin()}
          />
        )}

        {view === "forgot" && (
          <ForgotPasswordForm
            onSuccess={(email) => {
              setResetEmail(email);
              setView("verify-code");
            }}
            switchToLogin={() => goToLogin()}
          />
        )}

        {view === "verify-code" && (
          <VerifyResetCodeForm
            email={resetEmail}
            onSuccess={(code) => {
              setResetCode(code);
              setView("reset-password");
            }}
            onBack={() => setView("forgot")}
          />
        )}

        {view === "reset-password" && (
          <ResetPasswordForm
            email={resetEmail}
            code={resetCode}
            onSuccess={() => {
              setResetEmail("");
              setResetCode("");
              goToLogin("Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.");
            }}
          />
        )}

        {view === "verify-email" && (
          <VerifyEmailForm
            email={pendingVerificationEmail}
            onSuccess={() => {
              setPendingVerificationEmail("");
              goToLogin("Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPanel;
