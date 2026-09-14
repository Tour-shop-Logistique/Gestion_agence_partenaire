import React, { useState } from "react";
import { emailVerificationApi } from "../../utils/api/emailVerification";

const labelClasses = "block text-sm font-medium text-slate-700 mb-1.5";

/**
 * Vérification du code envoyé par email après inscription (ou lors d'une
 * connexion avec email non vérifié) - vue interne du panneau d'auth.
 */
const VerifyEmailForm = ({ email, onSuccess }) => {
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

  return (
    <div>
      <div className="text-center mb-6">
        <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500">
          Un code à 6 chiffres a été envoyé à
        </p>
        <p className="text-sm font-medium text-blue-700 mt-0.5">
          {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm px-4 py-3 rounded-lg">
            {resendMessage}
          </div>
        )}

        <div>
          <label htmlFor="code" className={labelClasses}>
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
            className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors text-center text-2xl font-mono tabular-nums tracking-[0.5em] pl-6"
            placeholder="000000"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full flex justify-center py-2.5 px-4 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:hover:bg-blue-700"
          >
            {isLoading ? "Vérification..." : "Vérifier mon email"}
          </button>

          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1.5">
              Vous n'avez pas reçu le code ?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors disabled:opacity-50"
            >
              {isResending ? "Envoi en cours..." : "Renvoyer le code"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-slate-400 text-xs text-center">
          Pensez à vérifier vos courriers indésirables (spam)
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
