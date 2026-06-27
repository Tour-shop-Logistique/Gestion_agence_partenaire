import React, { useState } from "react";
import { passwordApi } from "../utils/api/password";

const ForgotPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const result = await passwordApi.forgotPassword(email);
      
      if (result.success) {
        setSuccessMessage(result.message);
        // Attendre 1.5 secondes puis passer à l'étape suivante
        setTimeout(() => {
          onSuccess(email);
        }, 1500);
      } else {
        setError(result.message || "Erreur lors de l'envoi du code");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccessMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="relative w-full max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-3xl font-bold text-white text-center mb-2">
            Mot de passe oublié
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Entrez votre email pour recevoir un code de réinitialisation
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-2 bg-white/10 border border-gray-300/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="votre.email@example.com"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                {isLoading ? "Envoi en cours..." : "Envoyer le code"}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full flex justify-center py-2 px-4 bg-white/10 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/20 transition-all"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
