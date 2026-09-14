import React, { useState } from "react";
import { passwordApi } from "../../utils/api/password";

const inputClasses = "block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors";
const labelClasses = "block text-sm font-medium text-slate-700 mb-1.5";

/**
 * Étape 1/3 du flux de réinitialisation - vue interne du panneau d'auth.
 * onSuccess(email) fait basculer AuthPanel vers la vue de vérification du
 * code, sans jamais ouvrir de modale par-dessus une autre.
 */
const ForgotPasswordForm = ({ onSuccess, switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await passwordApi.forgotPassword(email);

      if (result.success) {
        onSuccess(email);
      } else {
        setError(result.message || "Erreur lors de l'envoi du code");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className={labelClasses}>
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
          className={inputClasses}
          placeholder="votre.email@example.com"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:hover:bg-blue-700"
        >
          {isLoading ? "Envoi en cours..." : "Envoyer le code"}
        </button>

        <button
          type="button"
          onClick={switchToLogin}
          className="w-full flex justify-center py-2.5 px-4 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
