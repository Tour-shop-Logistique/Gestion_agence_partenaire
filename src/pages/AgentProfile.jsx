import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import {
  User,
  Lock,
  Trash2,
  Mail,
  Phone,
  Shield,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  Calendar,
  History,
  BadgeCheck,
} from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-2 border-slate-200 border-t-indigo-600"></div>
          <p className="text-sm text-slate-500">Chargement du profil…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <button
              onClick={() => {
                console.log("🔄 Rechargement manuel du profil...");
                loadProfile();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 hover:text-slate-900 transition text-sm font-medium disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mon profil</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez vos informations personnelles et les paramètres de votre compte</p>
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">

          {/* Avatar et infos de base */}
          <div className="px-8 py-7 border-b border-slate-100">
            <div className="flex items-center gap-5">
              <div className="w-[72px] h-[72px] rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-semibold ring-4 ring-indigo-50 shrink-0">
                {profile?.nom?.charAt(0)}{profile?.prenoms?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1">
                  <h2 className="text-xl font-bold text-slate-900 truncate">
                    {profile?.nom} {profile?.prenoms}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      profile?.role === "is_agence_admin"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    {profile?.role === "is_agence_admin" && <Shield className="w-3 h-3" />}
                    {profile?.role === "is_agence_admin" ? "Administrateur" : "Agent"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {profile?.email}
                </p>
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                      profile?.disponible
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-slate-50 text-slate-500 ring-slate-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${profile?.disponible ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {profile?.disponible ? "Disponible" : "Indisponible"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire d'édition */}
          <div className="px-8 py-7">
            <form onSubmit={handleUpdateProfile}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-50 text-indigo-600">
                    <User className="w-4 h-4" />
                  </span>
                  Informations personnelles
                </h3>
                {!editMode && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm"
                  >
                    Modifier
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Nom */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Nom <span className="text-red-500 normal-case">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 transition focus:outline-none focus:ring-4 ${
                      errors.nom
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"
                    } ${editMode ? "bg-white" : "bg-slate-50 text-slate-500 cursor-not-allowed"}`}
                  />
                  {errors.nom && <p className="text-red-500 text-xs mt-1.5">{errors.nom}</p>}
                </div>

                {/* Prénoms */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Prénoms
                  </label>
                  <input
                    type="text"
                    name="prenoms"
                    value={formData.prenoms}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 transition focus:outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/10 ${
                      editMode ? "bg-white" : "bg-slate-50 text-slate-500 cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 transition focus:outline-none focus:ring-4 ${
                      errors.telephone
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"
                    } ${editMode ? "bg-white" : "bg-slate-50 text-slate-500 cursor-not-allowed"}`}
                  />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1.5">{errors.telephone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 transition focus:outline-none focus:ring-4 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"
                    } ${editMode ? "bg-white" : "bg-slate-50 text-slate-500 cursor-not-allowed"}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                  {editMode && profile?.email !== formData.email && (
                    <p className="text-amber-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Un code de vérification sera envoyé au nouvel email
                    </p>
                  )}
                </div>

                {/* Disponibilité */}
                <div className="md:col-span-2">
                  <label
                    className={`flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3.5 ${
                      editMode ? "cursor-pointer bg-slate-50/60" : "bg-slate-50/30"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">Disponibilité</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Je suis disponible pour prendre en charge des demandes
                      </p>
                    </div>
                    <span className="relative inline-flex shrink-0">
                      <input
                        type="checkbox"
                        name="disponible"
                        checked={formData.disponible}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="sr-only peer"
                      />
                      <span className="w-10 h-[22px] bg-slate-300 peer-checked:bg-emerald-500 rounded-full transition-colors peer-disabled:opacity-60"></span>
                      <span className="absolute left-[3px] top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-[18px]"></span>
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
                    className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Section Sécurité */}
          <div className="px-8 py-7 border-t border-slate-100">
            <h3 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2 mb-5">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-50 text-indigo-600">
                <Shield className="w-4 h-4" />
              </span>
              Sécurité et compte
            </h3>

            <div className="space-y-2.5">
              {/* Changer le mot de passe */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition">
                    <Lock className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">Changer le mot de passe</p>
                    <p className="text-xs text-slate-500">Modifier votre mot de passe actuel</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition" />
              </button>

              {/* Supprimer le compte (seulement pour les agents, pas les admins) */}
              {profile?.role !== "is_agence_admin" && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-slate-200 rounded-xl hover:border-red-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-red-100 transition">
                      <Trash2 className="w-4 h-4 text-slate-600 group-hover:text-red-600 transition" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-red-700 transition">Supprimer mon compte</p>
                      <p className="text-xs text-slate-500">Cette action est irréversible</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition" />
                </button>
              )}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Compte créé le</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(profile?.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Dernière modification</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(profile?.updated_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              {profile?.email_verified_at && (
                <div className="sm:col-span-2 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-emerald-800">
                    Email vérifié le {new Date(profile.email_verified_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl ring-1 ring-slate-200 animate-in zoom-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
                  <Lock className="w-4 h-4" />
                </span>
                Changer le mot de passe
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ current_password: "", password: "", password_confirmation: "" });
                  setErrors({});
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Mot de passe actuel <span className="text-red-500 normal-case">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, current_password: e.target.value }));
                    setErrors(prev => ({ ...prev, current_password: null }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-4 ${
                    errors.current_password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"
                  }`}
                />
                {errors.current_password && <p className="text-red-500 text-xs mt-1.5">{errors.current_password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Nouveau mot de passe <span className="text-red-500 normal-case">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, password: e.target.value }));
                    setErrors(prev => ({ ...prev, password: null }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-4 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"
                  }`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                <p className="text-xs text-slate-400 mt-1.5">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Confirmer le nouveau mot de passe <span className="text-red-500 normal-case">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }));
                    setErrors(prev => ({ ...prev, password_confirmation: null }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-4 ${
                    errors.password_confirmation
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"
                  }`}
                />
                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1.5">{errors.password_confirmation}</p>}
              </div>

              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Après le changement, tous vos tokens seront révoqués et vous devrez vous reconnecter.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ current_password: "", password: "", password_confirmation: "" });
                    setErrors({});
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl ring-1 ring-slate-200 animate-in zoom-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600">
                  <Trash2 className="w-4 h-4" />
                </span>
                Supprimer mon compte
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">Attention : cette action est irréversible</p>
                  <p className="text-sm text-red-700">
                    La suppression de votre compte entraînera la perte définitive de toutes vos données.
                    Cette action ne peut pas être annulée.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Confirmez avec votre mot de passe <span className="text-red-500 normal-case">*</span>
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl ring-1 ring-slate-200 animate-in zoom-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
                  <Mail className="w-4 h-4" />
                </span>
                Vérification de l'email
              </h3>
              <button
                onClick={() => {
                  setShowEmailVerifyModal(false);
                  setVerificationCode("");
                  setPendingEmailChange(false);
                  loadProfile(); // Recharger pour annuler les changements
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-sm text-indigo-900">
                Un code de vérification à 6 chiffres a été envoyé à votre nouvel email :
                <span className="font-semibold block mt-1">{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Code de vérification <span className="text-red-500 normal-case">*</span>
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition text-center text-2xl font-semibold tracking-[0.4em]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailVerifyModal(false);
                    setVerificationCode("");
                    setPendingEmailChange(false);
                    loadProfile();
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
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
