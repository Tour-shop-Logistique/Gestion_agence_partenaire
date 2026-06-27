import React, { useState } from "react";
import { passwordApi } from "../utils/api/password";

const VerifyResetCodeModal = ({ isOpen, onClose, email, onSuccess, onBack }) => {
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

  const handleClose = () => {
    setCode("");
    setError("");
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
            Vérification du code
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Entrez le code à 6 chiffres envoyé à {email}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {error}
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
                {isLoading ? "Vérification..." : "Vérifier le code"}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full flex justify-center py-2 px-4 bg-white/10 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/20 transition-all"
              >
                Retour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCodeModal;
