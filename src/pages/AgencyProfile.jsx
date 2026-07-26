import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAgency } from "../hooks/useAgency";
import { selectIsAdmin } from "../store/slices/authSlice";
import { selectAgencyConfigured } from "../store/slices/agencySlice";
import { getLogoUrl } from "../utils/apiConfig";
import { toast } from "../utils/toast";
import ErrorBoundary from "../components/ErrorBoundary";
import CoverageMap from "../components/CoverageMap";

import {
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  MapPinIcon as MapPinSolidIcon,
  BriefcaseIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  TrashIcon,
  PlusIcon,
  IdentificationIcon,
  SparklesIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

/* ─────────────────────────────────────────────
   Liste des pays
───────────────────────────────────────────── */
const PAYS_LISTE = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola",
  "Antigua-et-Barbuda", "Arabie Saoudite", "Argentine", "Arménie", "Australie", "Autriche",
  "Azerbaïdjan", "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin",
  "Bhoutan", "Biélorussie", "Birmanie", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil",
  "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge", "Cameroun", "Canada", "Cap-Vert",
  "Centrafrique", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Congo", "Congo (RDC)",
  "Corée du Nord", "Corée du Sud", "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba", "Danemark",
  "Djibouti", "Dominique", "Égypte", "Émirats arabes unis", "Équateur", "Érythrée", "Espagne",
  "Estonie", "Eswatini", "États-Unis", "Éthiopie", "Fidji", "Finlande", "France", "Gabon",
  "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", "Guinée équatoriale",
  "Guinée-Bissau", "Guyana", "Haïti", "Honduras", "Hongrie", "Inde", "Indonésie", "Irak", "Iran",
  "Irlande", "Islande", "Israël", "Italie", "Jamaïque", "Japon", "Jordanie", "Kazakhstan", "Kenya",
  "Kirghizistan", "Kiribati", "Kosovo", "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Liberia",
  "Libye", "Liechtenstein", "Lituanie", "Luxembourg", "Macédoine du Nord", "Madagascar", "Malaisie",
  "Malawi", "Maldives", "Mali", "Malte", "Maroc", "Marshall", "Maurice", "Mauritanie", "Mexique",
  "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro", "Mozambique", "Namibie", "Nauru",
  "Népal", "Nicaragua", "Niger", "Nigeria", "Norvège", "Nouvelle-Zélande", "Oman", "Ouganda",
  "Ouzbékistan", "Pakistan", "Palaos", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay",
  "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal", "Qatar", "République dominicaine",
  "République tchèque", "Roumanie", "Royaume-Uni", "Russie", "Rwanda", "Saint-Christophe-et-Niévès",
  "Sainte-Lucie", "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Salomon", "Salvador", "Samoa",
  "São Tomé-et-Príncipe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie",
  "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname",
  "Syrie", "Tadjikistan", "Tanzanie", "Tchad", "Thaïlande", "Timor oriental", "Togo", "Tonga",
  "Trinité-et-Tobago", "Tunisie", "Turkménistan", "Turquie", "Tuvalu", "Ukraine", "Uruguay",
  "Vanuatu", "Vatican", "Venezuela", "Viêt Nam", "Yémen", "Zambie", "Zimbabwe"
];

/* ─────────────────────────────────────────────
   Composants utilitaires
───────────────────────────────────────────── */

/** Label de champ */
const FieldLabel = ({ children }) => (
  <label className="block text-xs font-medium text-slate-500 mb-1.5">
    {children}
  </label>
);

/** Input standard */
const Field = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    )}
    <input
      {...props}
      className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
        disabled:bg-slate-50 disabled:text-slate-900 disabled:cursor-default
        transition-colors placeholder:text-slate-300`}
    />
  </div>
);

/** En-tête de section */
const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2.5">
      <Icon className="w-4 h-4 text-slate-400" />
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
    </div>
    {action}
  </div>
);

/** Carte de section */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-5 sm:p-6 ${className}`}>
    {children}
  </div>
);

/** Bouton Modifier/Annuler propre à une section */
const SectionEditButton = ({ isEditing, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
      isEditing
        ? "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
        : "border-slate-800 bg-slate-800 text-white hover:bg-slate-700"
    }`}
  >
    {isEditing
      ? <><XMarkIcon className="w-3.5 h-3.5" /> Annuler</>
      : <><PencilSquareIcon className="w-3.5 h-3.5" /> Modifier</>
    }
  </button>
);

/** Barre de sauvegarde fixe, affichée pendant l'édition d'un onglet */
const SaveBar = ({ saving, onCancel }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 lg:left-60">
    <div className="bg-white border-t border-slate-200 px-4 py-3 sm:px-6">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500 hidden sm:block">
          Les modifications ne sont pas encore enregistrées.
        </p>
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 rounded-lg transition-colors"
          >
            {saving
              ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
              : <CheckIcon className="w-4 h-4" />
            }
            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TABS = [
  { key: "identite", label: "Identité", icon: IdentificationIcon },
  { key: "vitrine", label: "Vitrine", icon: SparklesIcon },
  { key: "horaires", label: "Horaires", icon: ClockIcon },
];

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */

const AgencyProfile = () => {
  const {
    data: agencyData,
    error: agencyError,
    fetchAgencyData,
    updateAgencyData,
    setupAgency,
  } = useAgency();

  const isAdmin = useSelector(selectIsAdmin);
  const agencyConfigured = useSelector(selectAgencyConfigured);

  // Un état d'édition indépendant par onglet : on ne modifie qu'une
  // section à la fois (identité, vitrine ou horaires).
  const [editingTab, setEditingTab] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("identite");

  const defaultHoraires = [
    { jour: "Lundi",    ouverture: "08:00", fermeture: "18:00", ferme: false },
    { jour: "Mardi",    ouverture: "08:00", fermeture: "18:00", ferme: false },
    { jour: "Mercredi", ouverture: "08:00", fermeture: "18:00", ferme: false },
    { jour: "Jeudi",    ouverture: "08:00", fermeture: "18:00", ferme: false },
    { jour: "Vendredi", ouverture: "08:00", fermeture: "18:00", ferme: false },
    { jour: "Samedi",   ouverture: "08:00", fermeture: "12:00", ferme: false },
    { jour: "Dimanche", ouverture: "08:00", fermeture: "12:00", ferme: true },
  ];

  const [formData, setFormData] = useState({
    name: "", code_agence: "", address: "", ville: "",
    pays: "Côte d'Ivoire", telephone: "", email: "", website: "",
    latitude: "", longitude: "", description: "", commune: "",
    horaires: defaultHoraires, logo: null, message_accueil: "", zone_couverture_km: "10",
  });

  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);

  const [existingPhotos, setExistingPhotos] = useState([]); // URLs déjà en ligne
  const [photosToRemove, setPhotosToRemove] = useState([]); // chemins bruts à retirer
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);   // nouveaux File à uploader
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]); // previews base64 des nouveaux

  /* Ouvrir l'édition automatiquement si pas encore configuré */
  useEffect(() => {
    if (!agencyConfigured && isAdmin) setEditingTab("identite");
  }, [agencyConfigured, isAdmin]);

  /* Remplir le formulaire depuis Redux */
  useEffect(() => {
    if (agencyData?.agence) {
      const a = agencyData.agence;
      const next = { ...formData };
      if (a.nom_agence)  next.name        = a.nom_agence;
      if (a.code_agence) next.code_agence = a.code_agence;
      if (a.adresse)     next.address     = a.adresse;
      if (a.ville)       next.ville       = a.ville;
      if (a.pays)        next.pays        = a.pays;
      if (a.telephone)   next.telephone   = a.telephone;
      if (a.email)       next.email       = a.email;
      if (a.website)     next.website     = a.website;
      if (a.description) next.description = a.description;
      if (a.commune)     next.commune     = a.commune;
      if (a.logo)        next.logo        = a.logo;
      if (a.message_accueil != null) next.message_accueil = a.message_accueil;
      if (a.zone_couverture_km != null) next.zone_couverture_km = String(a.zone_couverture_km);
      if (a.latitude  != null) next.latitude  = String(a.latitude);
      if (a.longitude != null) next.longitude = String(a.longitude);

      if (Array.isArray(a.photos)) setExistingPhotos(a.photos);

      if (Array.isArray(a.horaires) && a.horaires.length > 0) {
        const map = {};
        a.horaires.forEach((h) => { if (h.jour) map[h.jour.toLowerCase()] = h; });
        next.horaires = next.horaires.map((h) => {
          const upd = map[h.jour.toLowerCase()];
          return upd
            ? { ...h, ouverture: upd.ouverture || h.ouverture, fermeture: upd.fermeture || h.fermeture, ferme: upd.ferme ?? h.ferme }
            : h;
        });
      }

      setFormData(next);
      if (!originalFormData) setOriginalFormData({ ...next });
    }
  }, [agencyData]); // eslint-disable-line

  useEffect(() => {
    if (agencyError) toast.error(agencyError);
  }, [agencyError]);

  /* Handlers */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const MAX_PHOTOS = 8;

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = MAX_PHOTOS - (existingPhotos.length - photosToRemove.length) - newPhotoFiles.length;
    const accepted = files.slice(0, Math.max(0, remainingSlots));
    if (accepted.length < files.length) {
      toast.info(`Maximum ${MAX_PHOTOS} photos, seules les ${accepted.length} premières ont été ajoutées.`);
    }

    setNewPhotoFiles((p) => [...p, ...accepted]);
    accepted.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setNewPhotoPreviews((p) => [...p, reader.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeExistingPhoto = (url) => {
    setPhotosToRemove((p) => [...p, url]);
  };

  const removeNewPhoto = (index) => {
    setNewPhotoFiles((p) => p.filter((_, i) => i !== index));
    setNewPhotoPreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleHoraireChange = (index, field, value) => {
    setFormData((p) => {
      const h = [...p.horaires];
      h[index] = { ...h[index], [field]: value };
      return { ...p, horaires: h };
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    toast.info("Récupération de votre position…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData((p) => ({
          ...p,
          latitude:  coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        }));
        toast.success("Position récupérée.");
      },
      () => toast.error("Impossible de récupérer la localisation.")
    );
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    try {
      const payload = {
        nom_agence:  formData.name,
        code_agence: formData.code_agence,
        telephone:   formData.telephone,
        email:       formData.email,
        description: formData.description,
        adresse:     formData.address,
        ville:       formData.ville,
        commune:     formData.commune,
        pays:        formData.pays,
        latitude:    formData.latitude  === "" ? null : parseFloat(formData.latitude),
        longitude:   formData.longitude === "" ? null : parseFloat(formData.longitude),
        horaires:    formData.horaires,
        message_accueil: formData.message_accueil,
      };
      if (logoFile) payload.logo = logoFile;
      if (newPhotoFiles.length) payload.photos = newPhotoFiles;
      if (photosToRemove.length) payload.photos_to_remove = photosToRemove;

      const hasId = !!(agencyData?.agence?.id || agencyData?.id);
      const result = hasId ? await updateAgencyData(payload) : await setupAgency(payload);

      if (result.type?.includes("fulfilled") || result.success) {
        toast.success("Profil agence mis à jour.");
        setEditingTab(null);
        setPhotosToRemove([]);
        setNewPhotoFiles([]);
        setNewPhotoPreviews([]);
        await fetchAgencyData(true);
      }
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = (tabKey) => {
    if (editingTab === tabKey) {
      if (originalFormData) setFormData({ ...originalFormData });
      setPhotosToRemove([]);
      setNewPhotoFiles([]);
      setNewPhotoPreviews([]);
      setEditingTab(null);
    } else {
      setOriginalFormData({ ...formData });
      setEditingTab(tabKey);
    }
  };

  /* ── Render ── */
  return (
    <ErrorBoundary>
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 pb-24 space-y-4 sm:space-y-6">

      {/* ── Bannière setup requis ── */}
      {!agencyConfigured && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-lg">
          <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Configuration requise</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Renseignez les informations de votre agence et sauvegardez pour accéder à toutes les fonctionnalités.
            </p>
          </div>
        </div>
      )}

      {/* ── En-tête identité (bandeau dégradé, pleine largeur) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 shadow-sm">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-7">

          {/* Logo */}
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white/20 bg-white flex items-center justify-center overflow-hidden shadow-lg">
              {logoPreview || agencyData?.agence?.logo ? (
                <img
                  src={logoPreview || getLogoUrl(agencyData?.agence?.logo)}
                  alt="Logo agence"
                  className="w-full h-full object-contain"
                />
              ) : (
                <BuildingOffice2Icon className="w-9 h-9 text-slate-300" />
              )}
            </div>
            {editingTab === "identite" && (
              <label className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <CameraIcon className="w-5 h-5 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </label>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                {formData.name || "Nouvelle agence"}
              </h1>
              {agencyConfigured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  Actif
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-indigo-100">
              {formData.code_agence && (
                <span className="flex items-center gap-1.5">
                  <BriefcaseIcon className="w-4 h-4" />
                  {formData.code_agence}
                </span>
              )}
              {(formData.ville || formData.pays) && (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4" />
                  {[formData.ville, formData.pays].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={async () => { setRefreshing(true); await fetchAgencyData(true); setRefreshing(false); }}
                className="p-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                title="Actualiser"
              >
                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Corps : navigation par onglets (sidebar) + contenu ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 sm:gap-6 items-start">

        {/* Navigation par onglets */}
        <div className="lg:sticky lg:top-6 flex lg:flex-col gap-1.5 bg-white border border-slate-200 rounded-xl p-2 overflow-x-auto lg:overflow-visible">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="min-w-0">

        {/* Onglet : Identité (+ Localisation) */}
        {activeTab === "identite" && (
          <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
            <Card>
              <SectionHeader
                icon={BuildingOffice2Icon}
                title="Informations générales"
                action={
                  <SectionEditButton
                    isEditing={editingTab === "identite"}
                    onClick={() => handleEditToggle("identite")}
                  />
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Nom de l'agence</FieldLabel>
                  <Field name="name" value={formData.name} onChange={handleChange} disabled={editingTab !== "identite"} placeholder="Ex : Agence Centrale Abidjan" />
                </div>
                <div>
                  <FieldLabel>Code agence</FieldLabel>
                  <Field name="code_agence" value={formData.code_agence} disabled placeholder="Ex : AGC-001" />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Adresse</FieldLabel>
                  <Field name="address" value={formData.address} onChange={handleChange} disabled={editingTab !== "identite"} placeholder="Rue, quartier…" />
                </div>
                <div>
                  <FieldLabel>Ville</FieldLabel>
                  <Field name="ville" value={formData.ville} onChange={handleChange} disabled={editingTab !== "identite"} placeholder="Ex : Abidjan" />
                </div>
                <div>
                  <FieldLabel>Commune</FieldLabel>
                  <Field name="commune" value={formData.commune} onChange={handleChange} disabled={editingTab !== "identite"} placeholder="Ex : Cocody" />
                </div>
                <div>
                  <FieldLabel>Téléphone</FieldLabel>
                  <Field icon={PhoneIcon} type="tel" name="telephone" value={formData.telephone} onChange={handleChange} disabled={editingTab !== "identite"} placeholder="+225 07 00 00 00 00" />
                </div>
                <div>
                  <FieldLabel>Adresse email</FieldLabel>
                  <Field icon={EnvelopeIcon} type="email" name="email" value={formData.email} onChange={handleChange} disabled={editingTab !== "identite"} placeholder="contact@agence.com" required />
                </div>
                <div>
                  <FieldLabel>Pays</FieldLabel>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <select
                      name="pays"
                      value={formData.pays}
                      onChange={handleChange}
                      disabled={editingTab !== "identite"}
                      className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                        disabled:bg-slate-50 disabled:text-slate-900 disabled:cursor-default
                        transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionnez un pays</option>
                      {PAYS_LISTE.map((pays) => (
                        <option key={pays} value={pays}>
                          {pays}
                        </option>
                      ))}
                    </select>
                    {/* Flèche dropdown personnalisée */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeader
                icon={MapPinSolidIcon}
                title="Localisation"
                action={
                  editingTab === "identite" ? (
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                    >
                      Détecter ma position
                    </button>
                  ) : null
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Latitude</FieldLabel>
                  <Field name="latitude" value={formData.latitude} onChange={handleChange} disabled={editingTab !== "identite"} placeholder="5.354722" />
                </div>
                <div>
                  <FieldLabel>Longitude</FieldLabel>
                  <Field name="longitude" value={formData.longitude} onChange={handleChange} disabled={editingTab !== "identite"} placeholder="-4.008256" />
                </div>
              </div>

              <div className="mt-4">
                <CoverageMap
                  latitude={formData.latitude === "" ? null : parseFloat(formData.latitude)}
                  longitude={formData.longitude === "" ? null : parseFloat(formData.longitude)}
                  radiusKm={parseFloat(formData.zone_couverture_km) || 0}
                  editable={editingTab === "identite"}
                  onPositionChange={([lat, lng]) =>
                    setFormData((p) => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))
                  }
                />
                {editingTab === "identite" && (
                  <p className="text-xs text-slate-400 mt-1.5">Cliquez sur la carte pour repositionner votre agence.</p>
                )}
              </div>
            </Card>
          </div>

          {editingTab === "identite" && (
            <SaveBar saving={saving} onCancel={() => handleEditToggle("identite")} />
          )}
          </>
        )}

        {/* Onglet : Vitrine (description, message d'accueil, photos) */}
        {activeTab === "vitrine" && (
          <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
            <Card>
              <SectionHeader
                icon={BriefcaseIcon}
                title="Description"
                action={
                  <SectionEditButton
                    isEditing={editingTab === "vitrine"}
                    onClick={() => handleEditToggle("vitrine")}
                  />
                }
              />
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                disabled={editingTab !== "vitrine"}
                placeholder="Présentez votre agence en quelques lignes…"
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                  disabled:bg-slate-50 disabled:text-slate-900 disabled:cursor-default
                  transition-colors placeholder:text-slate-300 resize-none"
              />
              <p className="mt-2 text-xs text-slate-400">
                Visible par vos clients lors de la prise de commande.
              </p>
            </Card>

            <Card>
              <SectionHeader icon={ChatBubbleLeftRightIcon} title="Message d'accueil" />
              <textarea
                name="message_accueil"
                rows={3}
                value={formData.message_accueil}
                onChange={handleChange}
                disabled={editingTab !== "vitrine"}
                placeholder="Ex : Bienvenue chez nous ! Nous sommes ravis de vous accompagner dans vos expéditions."
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                  disabled:bg-slate-50 disabled:text-slate-900 disabled:cursor-default
                  transition-colors placeholder:text-slate-300 resize-none"
              />
              <p className="mt-2 text-xs text-slate-400">
                Un mot personnalisé affiché aux clients qui découvrent votre agence.
              </p>
            </Card>

            <Card className="xl:col-span-2">
              <SectionHeader
                icon={PhotoIcon}
                title="Photos de l'agence"
                action={
                  editingTab === "vitrine" && (
                    <label className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors">
                      <PlusIcon className="w-3.5 h-3.5" />
                      Ajouter
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotosChange} />
                    </label>
                  )
                }
              />
              {(() => {
                const visibleExisting = existingPhotos.filter((url) => !photosToRemove.includes(url));
                const totalCount = visibleExisting.length + newPhotoPreviews.length;

                if (totalCount === 0) {
                  return (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      Aucune photo pour l'instant. Ajoutez des photos de vos locaux pour rassurer vos clients.
                    </p>
                  );
                }

                return (
                  <div className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-6 gap-3">
                    {visibleExisting.map((url) => (
                      <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={url} alt="Photo agence" className="w-full h-full object-cover" />
                        {editingTab === "vitrine" && (
                          <button
                            type="button"
                            onClick={() => removeExistingPhoto(url)}
                            className="absolute inset-0 flex items-center justify-center bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon className="w-5 h-5 text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                    {newPhotoPreviews.map((src, i) => (
                      <div key={`new-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-indigo-200 bg-indigo-50">
                        <img src={src} alt="Nouvelle photo" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-600 text-white">
                          Nouveau
                        </span>
                        {editingTab === "vitrine" && (
                          <button
                            type="button"
                            onClick={() => removeNewPhoto(i)}
                            className="absolute inset-0 flex items-center justify-center bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon className="w-5 h-5 text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
              <p className="mt-3 text-xs text-slate-400">
                Jusqu'à {MAX_PHOTOS} photos, visibles par les clients qui consultent votre agence.
              </p>
            </Card>
          </div>

          {editingTab === "vitrine" && (
            <SaveBar saving={saving} onCancel={() => handleEditToggle("vitrine")} />
          )}
          </>
        )}

        {/* Onglet : Horaires */}
        {activeTab === "horaires" && (
          <div className="space-y-5">
            <Card>
              <SectionHeader
                icon={ClockIcon}
                title="Horaires d'ouverture"
                action={
                  <SectionEditButton
                    isEditing={editingTab === "horaires"}
                    onClick={() => handleEditToggle("horaires")}
                  />
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {formData.horaires.map((h, i) => (
                  <div
                    key={`horaire-${h.jour}-${i}`}
                    className={`rounded-lg border px-3 py-2.5 transition-colors ${
                      h.ferme ? "bg-slate-50 border-slate-100" : "bg-white border-slate-200"
                    }`}
                  >
                    {/* Ligne jour + statut */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${h.ferme ? "text-slate-400" : "text-slate-700"}`}>
                        {h.jour}
                      </span>
                      <div className="flex items-center gap-2">
                        {editingTab === "horaires" && (
                          <input
                            type="checkbox"
                            checked={h.ferme}
                            onChange={(e) => handleHoraireChange(i, "ferme", e.target.checked)}
                            className="w-3.5 h-3.5 accent-slate-700 cursor-pointer"
                            title="Marquer comme fermé"
                          />
                        )}
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          h.ferme
                            ? "bg-slate-100 text-slate-400"
                            : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {h.ferme ? "Fermé" : "Ouvert"}
                        </span>
                      </div>
                    </div>

                    {/* Plage horaire */}
                    {!h.ferme && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <input
                          type="time"
                          value={h.ouverture}
                          onChange={(e) => handleHoraireChange(i, "ouverture", e.target.value)}
                          disabled={editingTab !== "horaires"}
                          className="flex-1 px-2 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:cursor-default"
                        />
                        <span className="text-slate-300 text-xs">–</span>
                        <input
                          type="time"
                          value={h.fermeture}
                          onChange={(e) => handleHoraireChange(i, "fermeture", e.target.value)}
                          disabled={editingTab !== "horaires"}
                          className="flex-1 px-2 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:cursor-default"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {editingTab === "horaires" && (
              <SaveBar saving={saving} onCancel={() => handleEditToggle("horaires")} />
            )}
          </div>
        )}
        </div>
      </form>
    </div>
    </ErrorBoundary>
  );
};

export default AgencyProfile;
