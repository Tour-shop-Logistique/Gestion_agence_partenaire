import React, { useState } from "react";
import { passwordApi } from "../../utils/api/password";

const labelClasses = "block text-sm font-medium text-slate-700 mb-1.5";

/**
 * Étape 2/3 du flux de réinitialisation - vue interne du panneau d'auth.
 * onSuccess(code) fait basculer AuthPanel vers la saisie du nouveau mot de
 * passe.
 */
const VerifyResetCodeForm = ({ email, onSuccess, onBack }) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await passwordApi.verifyResetCode(email, code);

      if (result.success) {
        onSuccess(code);
      } else {
        setError(result.message || "Code invalide ou expiré");
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

      <div className="flex flex-col gap-2.5">
        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full flex justify-center py-2.5 px-4 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:hover:bg-blue-700"
        >
          {isLoading ? "Vérification..." : "Vérifier le code"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full flex justify-center py-2.5 px-4 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          Retour
        </button>
      </div>
    </form>
  );
};

export default VerifyResetCodeForm;
