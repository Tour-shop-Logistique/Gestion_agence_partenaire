import React, { useState } from "react";
import { emailVerificationApi } from "../utils/api/emailVerification";

const VerifyEmailModal = ({ isOpen, onClose, email, onSuccess }) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResendMessage("");
    setIsLoading(true);

    try {
      const result = await emailVerificationApi.verifyEmail(email, code);
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || "Code invalide ou expiré");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setResendMessage("");
    setIsResending(true);

    try {
      const result = await emailVerificationApi.resendVerificationCode(email);
      
      if (result.success) {
        setResendMessage("Code renvoyé avec succès ! Vérifiez votre email.");
      } else {
        setError(result.message || "Erreur lors de l'envoi du code");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setError("");
    setResendMessage("");
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

          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Vérification de l'email
            </h2>
            <p className="text-gray-300">
              Un code à 6 chiffres a été envoyé à
            </p>
            <p className="text-blue-400 font-medium mt-1">
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {resendMessage && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
                {resendMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Code de vérification
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="appearance-none block w-full px-4 py-2 bg-white/10 border border-gray-300/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full flex justify-center py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                {isLoading ? "Vérification..." : "Vérifier mon email"}
              </button>

              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Vous n'avez pas reçu le code ?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  {isResending ? "Envoi en cours..." : "Renvoyer le code"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-600/20">
            <p className="text-gray-400 text-xs text-center">
              💡 Astuce : Vérifiez aussi vos courriers indésirables (spam)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailModal;
