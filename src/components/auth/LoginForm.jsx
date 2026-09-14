import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const inputClasses = "block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors";
const labelClasses = "block text-sm font-medium text-slate-700 mb-1.5";

/**
 * Formulaire de connexion - vue interne du panneau d'auth (voir AuthPanel),
 * jamais monté seul dans une modale : switchToRegister/switchToForgotPassword
 * changent la vue affichée par le panneau parent plutôt que d'ouvrir une
 * modale par-dessus (pattern aligné sur le backoffice, voir WelcomePage.jsx).
 */
const LoginForm = ({ switchToRegister, switchToForgotPassword, successMessage }) => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "", // Peut être téléphone ou email
    password: "",
    type: "agence",
  });
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    try {
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

      const result = await login(credentials);

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
        console.error("[Login] Failed:", result.message || result.error);
        setLocalError(result.message || result.error || "Échec de la connexion");
      }
    } catch (err) {
      console.error("[Login] Exception:", err);
      setLocalError("Une erreur est survenue lors de la connexion");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {localError && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">
          {localError}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div>
        <label htmlFor="identifier" className={labelClasses}>
          Téléphone ou email
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          value={formData.identifier}
          onChange={handleChange}
          className={inputClasses}
          placeholder="0700000000 ou email@example.com"
        />
        <p className="mt-1.5 ml-1 text-xs text-slate-400">
          Téléphone sans indicatif, ex : 0700000000
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Mot de passe
          </label>
          <button
            type="button"
            onClick={switchToForgotPassword}
            className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
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
          className={inputClasses}
          placeholder="Votre mot de passe"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2.5 px-4 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:hover:bg-blue-700"
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <button
          type="button"
          onClick={switchToRegister}
          className="font-medium text-blue-700 hover:text-blue-800 transition-colors"
        >
          Créer un compte
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
