import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../utils/api";

const LoginModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    telephone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.telephone, formData.password);
      if (result.success) {
        const user = result.user || {};
        const isAdminLike = user.is_agence_admin || user.role === "admin" || result.role === "is_agence_admin";
        const hasAgencyLinked = !!user.agence_id;
        if (isAdminLike && !hasAgencyLinked) {
          navigate("/agency-profile");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-xl">
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
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="telephone"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                autoComplete="tel"
                required
                value={formData.telephone}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-2 bg-white/10 border border-gray-300/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+225 66 66 66 66"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Mot de passe
              </label>
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
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;