import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { User, Lock, Trash2, Mail, Phone, Shield, AlertCircle, CheckCircle, X } from "lucide-react";
import { getProfile, updateProfile, changePassword, deleteAccount, verifyEmailCode } from "../utils/api/profile";
import { showToast } from "../utils/toast";

const AgentProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // États pour les données du profil
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // États pour le formulaire d'édition
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    telephone: "",
    email: "",
    disponible: true
  });

  // États pour le changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });

  // États pour la suppression du compte
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // États pour la vérification d'email
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmailChange, setPendingEmailChange] = useState(false);

  // États pour le chargement et les erreurs
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Charger le profil au montage
  useEffect(() => {
    loadProfile();
  }, []);

  // Fonction pour charger le profil
  const loadProfile = async () => {
    try {
      console.log("🔄 Début du chargement du profil...");
      setLoading(true);
      const data = await getProfile();
      console.log("📥 Données brutes reçues de l'API:", data);
      console.log("📥 Type de data:", typeof data);
      console.log("📥 data.success:", data?.success);
      console.log("📥 data.user:", data?.user);
      
      // getProfile retourne response.data qui contient {success: true, user: {...}}
      if (data && data.success && data.user) {
        console.log("✅ Conditions validées, mise à jour du state...");
        setProfile(data.user);
        setFormData({
          nom: data.user.nom || "",
          prenoms: data.user.prenoms || "",
          telephone: data.user.telephone || "",
          email: data.user.email || "",
          disponible: data.user.disponible ?? true
        });
        console.log("✅ Profil chargé avec succès:", data.user);
        console.log("✅ FormData mis à jour");
      } else {
        console.warn("⚠️ Conditions non remplies:");
        console.warn("  - data existe?", !!data);
        console.warn("  - data.success?", data?.success);
        console.warn("  - data.user existe?", !!data?.user);
      }
    } catch (error) {
      showToast("Erreur lors du chargement du profil", "error");
      console.error("❌ Erreur dans loadProfile:", error);
      console.error("❌ error.response:", error.response);
    } finally {
      setLoading(false);
      console.log("🏁 Fin du chargement");
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Valider le formulaire de profil
  const validateProfileForm = () => {
    const newErrors = {};
    if (!formData.nom || formData.nom.trim() === "") {
      newErrors.nom = "Le nom est requis";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre la mise à jour du profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    try {
      setSubmitting(true);
      const data = await updateProfile(formData);
      
      if (data && data.success) {
        // Vérifier si un email a été modifié
        if (formData.email !== profile.email) {
          setPendingEmailChange(true);
          setShowEmailVerifyModal(true);
          showToast("Un code de vérification a été envoyé à votre nouvel email", "info");
        } else {
          setProfile(data.user);
          setEditMode(false);
          showToast("Profil mis à jour avec succès", "success");
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la mise à jour";
      showToast(message, "error");
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Vérifier le code email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim() === "") {
      showToast("Veuillez entrer le code de vérification", "error");
      return;
    }

    try {
      setSubmitting(true);
      // Passer l'email et le code
      const data = await verifyEmailCode(formData.email, verificationCode);
      
      if (data && data.success) {
        showToast("Email vérifié avec succès", "success");
        setShowEmailVerifyModal(false);
        setPendingEmailChange(false);
        setVerificationCode("");
        setEditMode(false);
        loadProfile(); // Recharger le profil
      } else {
        showToast(data.message || "Code invalide", "error");
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Code invalide";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Valider le formulaire de mot de passe
  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.current_password) {
      newErrors.current_password = "Le mot de passe actuel est requis";
    }
    if (!passwordData.password || passwordData.password.length < 8) {
      newErrors.password = "Le nouveau mot de passe doit contenir au moins 8 caractères";
    }
    if (passwordData.password !== passwordData.password_confirmation) {
      newErrors.password_confirmation = "Les mots de passe ne correspondent pas";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Changer le mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      setSubmitting(true);
      const data = await changePassword(passwordData);
      
      if (data && data.success) {
        showToast("Mot de passe changé avec succès. Vous allez être déconnecté.", "success");
        setShowPasswordModal(false);
        setPasswordData({
          current_password: "",
          password: "",
          password_confirmation: ""
        });
        
        // Déconnecter l'utilisateur après 2 secondes
        setTimeout(() => {
          dispatch(logout());
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors du changement de mot de passe";
      showToast(message, "error");
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer le compte
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      showToast("Veuillez entrer votre mot de passe", "error");
      return;
    }

    try {
      setSubmitting(true);
      const data = await deleteAccount(deletePassword);
      
      if (data && data.success) {
        showToast("Compte supprimé avec succès", "success");
        setShowDeleteModal(false);
        
        // Déconnecter l'utilisateur
        setTimeout(() => {
          dispatch(logout());
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la suppression du compte";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      nom: profile.nom || "",
      prenoms: profile.prenoms || "",
      telephone: profile.telephone || "",
      email: profile.email || "",
      disponible: profile.disponible ?? true
    });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <button
              onClick={() => {
                console.log("🔄 Rechargement manuel du profil...");
                loadProfile();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Chargement..." : "Actualiser"}
            </button>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
          <p className="text-slate-600 mt-2">Gérez vos informations personnelles et paramètres de compte</p>
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          
          {/* Debug Panel - À retirer en production */}
          {!profile && !loading && (
            <div className="px-8 py-6 bg-amber-50 border-b border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-bold text-amber-900 mb-2">⚠️ Aucune donnée de profil chargée</p>
                  <p className="text-sm text-amber-800 mb-3">
                    Les données ont été reçues de l'API mais ne sont pas affichées. Vérifiez la console pour les logs détaillés.
                  </p>
                  <button
                    onClick={() => {
                      console.log("🐛 État actuel:");
                      console.log("  - profile:", profile);
                      console.log("  - formData:", formData);
                      console.log("  - loading:", loading);
                    }}
                    className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition"
                  >
                    Afficher l'état dans la console
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Avatar et infos de base */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                {profile?.nom?.charAt(0)}{profile?.prenoms?.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {profile?.nom} {profile?.prenoms}
                </h2>
                <p className="text-indigo-100 mt-1">{profile?.email}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    profile?.disponible 
                      ? "bg-green-400/30 text-white border border-green-400/50" 
                      : "bg-red-400/30 text-white border border-red-400/50"
                  }`}>
                    {profile?.disponible ? "Disponible" : "Indisponible"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
                    {profile?.role === "is_agence_admin" ? "Administrateur" : "Agent"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire d'édition */}
          <div className="px-8 py-6">
            <form onSubmit={handleUpdateProfile}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Informations Personnelles
                </h3>
                {!editMode && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold"
                  >
                    Modifier
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.nom ? "border-red-500" : "border-slate-300"
                    } ${editMode ? "bg-white" : "bg-slate-50"} focus:outline-none focus:border-indigo-500 transition`}
                  />
                  {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                </div>

                {/* Prénoms */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Prénoms
                  </label>
                  <input
                    type="text"
                    name="prenoms"
                    value={formData.prenoms}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg border border-slate-300 ${
                      editMode ? "bg-white" : "bg-slate-50"
                    } focus:outline-none focus:border-indigo-500 transition`}
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.telephone ? "border-red-500" : "border-slate-300"
                    } ${editMode ? "bg-white" : "bg-slate-50"} focus:outline-none focus:border-indigo-500 transition`}
                  />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? "border-red-500" : "border-slate-300"
                    } ${editMode ? "bg-white" : "bg-slate-50"} focus:outline-none focus:border-indigo-500 transition`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  {editMode && profile?.email !== formData.email && (
                    <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Un code de vérification sera envoyé au nouvel email
                    </p>
                  )}
                </div>

                {/* Disponibilité */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="disponible"
                      checked={formData.disponible}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      Je suis disponible pour prendre en charge des demandes
                    </span>
                  </label>
                </div>
              </div>

              {/* Boutons d'action */}
              {editMode && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Section Sécurité */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-indigo-600" />
              Sécurité et Compte
            </h3>

            <div className="space-y-4">
              {/* Changer le mot de passe */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition">
                    <Lock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Changer le mot de passe</p>
                    <p className="text-xs text-slate-500">Modifier votre mot de passe actuel</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Supprimer le compte (seulement pour les agents, pas les admins) */}
              {profile?.role !== "is_agence_admin" && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-red-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-red-900">Supprimer mon compte</p>
                      <p className="text-xs text-red-600">Cette action est irréversible</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-red-400 group-hover:text-red-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="px-8 py-6 border-t border-slate-200 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Compte créé le:</span>
                <span className="ml-2 font-semibold text-slate-900">
                  {new Date(profile?.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Dernière modification:</span>
                <span className="ml-2 font-semibold text-slate-900">
                  {new Date(profile?.updated_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {profile?.email_verified_at && (
                <div className="md:col-span-2 flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Email vérifié le {new Date(profile.email_verified_at).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-6 h-6 text-indigo-600" />
                Changer le mot de passe
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ current_password: "", password: "", password_confirmation: "" });
                  setErrors({});
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mot de passe actuel <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, current_password: e.target.value }));
                    setErrors(prev => ({ ...prev, current_password: null }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.current_password ? "border-red-500" : "border-slate-300"
                  } focus:outline-none focus:border-indigo-500 transition`}
                />
                {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, password: e.target.value }));
                    setErrors(prev => ({ ...prev, password: null }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-slate-300"
                  } focus:outline-none focus:border-indigo-500 transition`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                <p className="text-xs text-slate-500 mt-1">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }));
                    setErrors(prev => ({ ...prev, password_confirmation: null }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password_confirmation ? "border-red-500" : "border-slate-300"
                  } focus:outline-none focus:border-indigo-500 transition`}
                />
                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
              </div>

              <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Après le changement, tous vos tokens seront révoqués et vous devrez vous reconnecter.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ current_password: "", password: "", password_confirmation: "" });
                    setErrors({});
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Modification...
                    </>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Suppression du compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-600" />
                Supprimer mon compte
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-900 mb-2">Attention : Cette action est irréversible !</p>
                  <p className="text-sm text-red-700">
                    La suppression de votre compte entraînera la perte définitive de toutes vos données.
                    Cette action ne peut pas être annulée.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmez avec votre mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Suppression...
                    </>
                  ) : (
                    "Supprimer définitivement"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vérification Email */}
      {showEmailVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-6 h-6 text-indigo-600" />
                Vérification de l'email
              </h3>
              <button
                onClick={() => {
                  setShowEmailVerifyModal(false);
                  setVerificationCode("");
                  setPendingEmailChange(false);
                  loadProfile(); // Recharger pour annuler les changements
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-sm text-indigo-900">
                Un code de vérification à 6 chiffres a été envoyé à votre nouvel email : 
                <span className="font-bold block mt-1">{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Code de vérification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Entrez le code reçu"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 transition text-center text-2xl font-bold tracking-widest"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailVerifyModal(false);
                    setVerificationCode("");
                    setPendingEmailChange(false);
                    loadProfile();
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Vérification...
                    </>
                  ) : (
                    "Vérifier"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentProfile;
