import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import PhoneInput from "../common/PhoneInput";

const inputClasses = "block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors";
const labelClasses = "block text-sm font-medium text-slate-700 mb-1.5";

/**
 * Formulaire d'inscription - vue interne du panneau d'auth (voir AuthPanel).
 * onVerificationRequired bascule vers la vue de vérification d'email plutôt
 * que d'ouvrir une modale par-dessus.
 */
const RegisterForm = ({ onVerificationRequired, switchToLogin }) => {
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dialCode: "",
    phone: "",
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

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (!formData.dialCode) {
      setLocalError("Veuillez sélectionner l'indicatif téléphonique");
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dialCode: formData.dialCode,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        type: formData.type,
      };

      const result = await register(userData);

      if (result.success) {
        onVerificationRequired(formData.email);
      } else {
        setLocalError(result.error || "Échec de l'inscription");
      }
    } catch (err) {
      setLocalError("Une erreur est survenue lors de la création du compte");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {localError && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">
          {localError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClasses}>
            Nom *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label htmlFor="lastName" className={labelClasses}>
            Prénom *
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Votre prénom"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClasses}>
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={inputClasses}
          placeholder="votre@email.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClasses}>
          Téléphone *
        </label>
        <PhoneInput
          dialCode={formData.dialCode}
          localNumber={formData.phone}
          onDialCodeChange={(dialCode) => setFormData((prev) => ({ ...prev, dialCode }))}
          onLocalNumberChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
          inputClassName={inputClasses}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className={labelClasses}>
            Mot de passe *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className={inputClasses}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClasses}>
            Confirmer *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className={inputClasses}
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2.5 px-4 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:hover:bg-blue-700"
      >
        {isLoading ? "Création..." : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <button
          type="button"
          onClick={switchToLogin}
          className="font-medium text-blue-700 hover:text-blue-800 transition-colors"
        >
          Se connecter
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
