import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../utils/api";
import AuthLayout from "../components/AuthLayout";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    telephone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testMsg, setTestMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestCors = async () => {
    setTestMsg("");
    setTestLoading(true);
    try {
      const res = await apiService.testCors();
      if (res.success) {
        setTestMsg(
          "Test CORS OK: " +
            (typeof res.data === "string" ? res.data : "Réponse reçue")
        );
      } else {
        setTestMsg("Test CORS échoué: " + (res.message || "Erreur inconnue"));
      }
    } catch (e) {
      setTestMsg("Test CORS échoué: " + (e.message || "Erreur inconnue"));
    } finally {
      setTestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.telephone, formData.password);
      console.log(result);
      if (result.success) {
        const user = result.user || {};
        // Si admin et pas encore d'agence liée, diriger vers la configuration d'agence
        const isAdminLike =
          user.is_agence_admin ||
          user.role === "admin" ||
          result.role === "is_agence_admin";
        const hasAgencyLinked = !!user.agence_id; // si besoin, ajouter d'autres checks
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

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto px-4 pt-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            Connexion
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Connectez-vous à votre compte agence ou agent
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
              <div className="mt-1">
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
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Mot de passe
              </label>
              <div className="mt-1">
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
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                S'inscrire
              </Link>
            </p>
          </div>

          {/* Test CORS section */}
          <div className="mt-6">
            {testMsg && (
              <div
                className={`mb-3 text-sm ${
                  testMsg.startsWith("Test CORS OK")
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {testMsg}
              </div>
            )}
            <button
              type="button"
              onClick={handleTestCors}
              disabled={testLoading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {testLoading ? "Test en cours..." : "Tester API (/test-cors)"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
