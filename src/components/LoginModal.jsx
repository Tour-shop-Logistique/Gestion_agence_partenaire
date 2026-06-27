import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ForgotPasswordModal from "./ForgotPasswordModal";
import VerifyResetCodeModal from "./VerifyResetCodeModal";
import ResetPasswordModal from "./ResetPasswordModal";
import VerifyEmailModal from "./VerifyEmailModal";

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "", // Peut être téléphone ou email
    password: "",
    type: "agence",
  });
  const [localError, setLocalError] = useState("");
  
  // États pour le flux de réinitialisation du mot de passe
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  // États pour la vérification d'email
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setResetSuccessMessage("");

    try {
      // Déterminer si l'identifiant est un email ou un téléphone
      const isEmail = formData.identifier.includes("@");
      const credentials = {
        password: formData.password,
        type: formData.type,
      };

      if (isEmail) {
        credentials.email = formData.identifier;
      } else {
        credentials.telephone = formData.identifier;
      }

      console.log("[Login] Sending credentials:", { identifier: formData.identifier, isEmail, type: formData.type });
      const result = await login(credentials);
      console.log("[Login] Result:", result);

      if (result.success) {
        const user = result.data?.user || {};
        const isAdminLike = user.is_agence_admin || user.role === "admin" || user.role === "is_agence_admin";
        const hasAgencyLinked = !!user.agence_id;

        if (isAdminLike && !hasAgencyLinked) {
          navigate("/agency-profile");
        } else {
          navigate("/dashboard");
        }
      } else {
        // Vérifier si l'erreur est due à un email non vérifié
        const errorMessage = result.message || result.error || "";
        if (errorMessage.toLowerCase().includes("email") && 
            (errorMessage.toLowerCase().includes("vérif") || 
             errorMessage.toLowerCase().includes("verify") ||
             errorMessage.toLowerCase().includes("non vérifié"))) {
          // Ouvrir la modale de vérification d'email
          if (isEmail) {
            setUnverifiedEmail(formData.identifier);
            setShowEmailVerification(true);
          } else {
            setLocalError("Votre email n'est pas vérifié. Connectez-vous avec votre email pour le vérifier.");
          }
        } else {
          console.error("[Login] Failed:", result.message || result.error);
          setLocalError(result.message || result.error || "Échec de la connexion");
        }
      }
    } catch (err) {
      console.error("[Login] Exception:", err);
      setLocalError("Une erreur est survenue lors de la connexion");
    }
  };

  // Handlers pour le flux de réinitialisation
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleForgotPasswordSuccess = (email) => {
    setResetEmail(email);
    setShowForgotPassword(false);
    setShowVerifyCode(true);
  };

  const handleVerifyCodeSuccess = (code) => {
    setResetCode(code);
    setShowVerifyCode(false);
    setShowResetPassword(true);
  };

  const handleResetPasswordSuccess = () => {
    setShowResetPassword(false);
    setResetSuccessMessage("Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.");
    // Réinitialiser les états
    setResetEmail("");
    setResetCode("");
  };

  const handleBackToForgotPassword = () => {
    setShowVerifyCode(false);
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail("");
  };

  const handleCloseVerifyCode = () => {
    setShowVerifyCode(false);
    setResetEmail("");
  };

  const handleCloseResetPassword = () => {
    setShowResetPassword(false);
    setResetEmail("");
    setResetCode("");
  };

  const handleEmailVerificationSuccess = () => {
    setShowEmailVerification(false);
    setResetSuccessMessage("Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
    setUnverifiedEmail("");
  };

  const handleCloseEmailVerification = () => {
    setShowEmailVerification(false);
    setUnverifiedEmail("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-3xl font-bold text-white text-center mb-2">
            Connexion
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Connectez-vous à votre compte agence
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {localError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {localError}
              </div>
            )}

            {resetSuccessMessage && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
                {resetSuccessMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Téléphone ou Email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-2 bg-white/10 border border-gray-300/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0700000000 ou email@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-200"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-2 bg-white/10 border border-gray-300/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>

      {/* Modales de réinitialisation du mot de passe */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={handleCloseForgotPassword}
        onSuccess={handleForgotPasswordSuccess}
      />
      <VerifyResetCodeModal
        isOpen={showVerifyCode}
        onClose={handleCloseVerifyCode}
        email={resetEmail}
        onSuccess={handleVerifyCodeSuccess}
        onBack={handleBackToForgotPassword}
      />
      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={handleCloseResetPassword}
        email={resetEmail}
        code={resetCode}
        onSuccess={handleResetPasswordSuccess}
      />

      {/* Modale de vérification d'email */}
      <VerifyEmailModal
        isOpen={showEmailVerification}
        onClose={handleCloseEmailVerification}
        email={unverifiedEmail}
        onSuccess={handleEmailVerificationSuccess}
      />
    </div>
  );
};

export default LoginModal;