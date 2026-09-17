import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAgency } from "../hooks/useAgency";
import { selectIsAdmin } from "../store/slices/authSlice";
import { selectAgencyConfigured } from "../store/slices/agencySlice";
import { getLogoUrl } from "../utils/apiConfig";
import { toast } from "../utils/toast";
import ErrorBoundary from "../components/ErrorBoundary";
import SearchableDropdown from "../components/common/SearchableDropdown";
import PhoneInput from "../components/common/PhoneInput";
import { getCountryName } from "../utils/countries";
import { agenciesApi } from "../utils/api/agencies";
import { splitPhoneNumber, joinPhoneNumber } from "../utils/phoneCountries";
import { communesApi } from "../utils/api/communes";
import { exportAgencyProfilePDF } from "../utils/pdfExport";

import {
  BuildingOffice2Icon,
  MapPinIcon,
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
  PhotoIcon,
  TrashIcon,
  PlusIcon,
  SparklesIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

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

/**
 * En-tête de section : plus d'action locale (le seul bouton d'édition est
 * désormais global, en haut de page) - juste une icône, un titre, et une
 * légende optionnelle qui explique ce que fait la section.
 */
const SectionHeader = ({ icon: Icon, title, hint }) => (
  <div className="flex items-start gap-2.5 mb-5">
    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-indigo-600" />
    </div>
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
  </div>
);

/** Carte de section */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-lg p-5 sm:p-6 ${className}`}>
    {children}
  </div>
);

/**
 * Barre de sauvegarde fixe, affichée pendant l'édition du profil (toute la
 * page bascule ensemble - plus d'édition par onglet isolé, voir isEditing).
 */
const SaveBar = ({ saving, onCancel }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 lg:left-60">
    <div className="bg-white border-t border-slate-200 px-4 py-3 sm:px-6">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
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
            <span className="hidden sm:inline">{saving ? "Enregistrement…" : "Enregistrer les modifications"}</span>
            <span className="sm:hidden">{saving ? "…" : "Enregistrer"}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

/** Visionneuse plein écran pour parcourir les photos de l'agence */
const ImageLightbox = ({ images, index, onClose, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate]);

  if (index == null || !images[index]) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/90 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
          className="absolute left-2 sm:left-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}

      <img
        src={images[index]}
        alt={`Photo ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
            className="absolute right-2 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
          <span className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-white/70 bg-white/10 px-3 py-1 rounded-full">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
};

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

  // Un seul état d'édition pour toute la page : plus d'édition "par onglet"
  // qui cachait certains contrôles (logo, photos, message d'accueil)
  // derrière le bouton Modifier d'une carte sans rapport visible. Cliquer
  // "Modifier le profil" active tous les champs de la page d'un coup.
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    name: "", code_agence: "", address: "",
    code_pays: "CI", email: "", website: "",
    latitude: "", longitude: "", description: "", commune: "", commune_id: "",
    horaires: defaultHoraires, logo: null, zone_couverture_km: "10",
  });

  // Téléphone et WhatsApp restent chacun un seul champ côté backend
  // (Agence.telephone / Agence.whatsapp), mais s'affichent en deux parties
  // (indicatif + numéro local, voir PhoneInput) - fusionnées avant l'envoi
  // (voir handleSubmit) et séparées ici au chargement des données de l'agence.
  const [telDialCode, setTelDialCode] = useState('');
  const [telLocalNumber, setTelLocalNumber] = useState('');
  const [waDialCode, setWaDialCode] = useState('');
  const [waLocalNumber, setWaLocalNumber] = useState('');

  // Communes du backoffice du pays de l'agence, pour le select "Commune"
  // (référentiel utilisé par la tarification interville). Tant que l'agence
  // n'est pas encore configurée, getCommunes() (authentifié, résout le
  // backoffice via l'agence déjà rattachée à l'utilisateur) échouerait
  // toujours - on utilise alors la variante publique filtrée par le pays
  // choisi dans le formulaire (formData.code_pays), refetchée à chaque
  // changement de pays. Une fois l'agence configurée, le pays est fixe et
  // getCommunes() (déjà correct côté backend) reste utilisé.
  const [communes, setCommunes] = useState([]);
  useEffect(() => {
    if (agencyConfigured) {
      communesApi.getCommunes().then((res) => {
        if (res.success) setCommunes(res.data || []);
      });
      return;
    }

    if (!formData.code_pays) {
      setCommunes([]);
      return;
    }

    communesApi.getCommunesByPays(formData.code_pays).then((res) => {
      if (res.success) setCommunes(res.data || []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyConfigured, formData.code_pays]);

  // Pays disposant d'un backoffice actif : une agence ne peut être
  // rattachée qu'à l'un de ces pays (le backend rejette tout autre pays à
  // la sauvegarde - voir AgenceController::add()/edit()), le sélecteur ne
  // propose donc que ceux-là plutôt que tous les pays du monde.
  const [countryOptions, setCountryOptions] = useState([]);
  useEffect(() => {
    agenciesApi.listPaysDisponibles().then((res) => {
      if (res.success) {
        setCountryOptions(res.data.map((p) => ({ id: p.code_pays, label: p.nom })));
      }
    });
  }, []);

  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);

  const [existingPhotos, setExistingPhotos] = useState([]); // URLs déjà en ligne
  const [photosToRemove, setPhotosToRemove] = useState([]); // chemins bruts à retirer
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);   // nouveaux File à uploader
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]); // previews base64 des nouveaux
  const [viewerIndex, setViewerIndex] = useState(null); // index ouvert dans la visionneuse plein écran

  /* Ouvrir l'édition automatiquement si pas encore configuré */
  useEffect(() => {
    if (!agencyConfigured && isAdmin) setIsEditing(true);
  }, [agencyConfigured, isAdmin]);

  /* Remplir le formulaire depuis Redux */
  useEffect(() => {
    if (agencyData?.agence) {
      const a = agencyData.agence;
      const next = { ...formData };
      if (a.nom_agence)  next.name        = a.nom_agence;
      if (a.code_agence) next.code_agence = a.code_agence;
      if (a.adresse)     next.address     = a.adresse;
      if (a.code_pays)   next.code_pays   = a.code_pays;
      if (a.email)       next.email       = a.email;
      if (a.website)     next.website     = a.website;
      if (a.description) next.description = a.description;
      if (a.commune)     next.commune     = a.commune;
      if (a.commune_id)  next.commune_id  = a.commune_id;
      if (a.logo)        next.logo        = a.logo;
      if (a.zone_couverture_km != null) next.zone_couverture_km = String(a.zone_couverture_km);
      if (a.latitude  != null) next.latitude  = String(a.latitude);
      if (a.longitude != null) next.longitude = String(a.longitude);

      if (a.telephone) {
        const tel = splitPhoneNumber(a.telephone);
        setTelDialCode(tel.dialCode);
        setTelLocalNumber(tel.localNumber);
      }
      if (a.whatsapp) {
        const wa = splitPhoneNumber(a.whatsapp);
        setWaDialCode(wa.dialCode);
        setWaLocalNumber(wa.localNumber);
      }

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
    // code_agence est toujours stocké en majuscules (voir Agence::
    // codeAgence() côté backend) - converti dès la saisie plutôt qu'à
    // l'enregistrement, pour que l'utilisateur voie immédiatement la forme
    // finale du code qu'il choisit.
    const nextValue = name === "code_agence" ? value.toUpperCase() : value;
    setFormData((p) => ({ ...p, [name]: nextValue }));
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

    const hasIdCheck = !!(agencyData?.agence?.id || agencyData?.id);
    if (!hasIdCheck && !formData.code_agence.trim()) {
      toast.error("Veuillez renseigner un code agence.");
      return;
    }

    if (!telDialCode || !telLocalNumber) {
      toast.error("Veuillez renseigner un numéro de téléphone complet (indicatif + numéro).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nom_agence:  formData.name,
        telephone:   joinPhoneNumber(telDialCode, telLocalNumber),
        whatsapp:    joinPhoneNumber(waDialCode, waLocalNumber) || null,
        email:       formData.email,
        description: formData.description,
        adresse:     formData.address,
        commune:     formData.commune,
        commune_id:  formData.commune_id || null,
        code_pays:   formData.code_pays,
        latitude:    formData.latitude  === "" ? null : parseFloat(formData.latitude),
        longitude:   formData.longitude === "" ? null : parseFloat(formData.longitude),
        horaires:    formData.horaires.map((h) => ({ ...h, jour: h.jour.toLowerCase() })),
      };
      if (logoFile) payload.logo = logoFile;
      if (newPhotoFiles.length) payload.photos = newPhotoFiles;
      if (photosToRemove.length) payload.photos_to_remove = photosToRemove;

      const hasId = !!(agencyData?.agence?.id || agencyData?.id);
      // code_agence n'est envoyé qu'à la création : choisi une seule fois
      // par l'agence, immuable ensuite (le backend l'ignore de toute façon
      // sur une mise à jour, mais on évite même de l'envoyer).
      if (!hasId) payload.code_agence = formData.code_agence.trim();

      const result = hasId ? await updateAgencyData(payload) : await setupAgency(payload);

      if (result.type?.includes("fulfilled") || result.success) {
        toast.success("Profil agence mis à jour.");
        setIsEditing(false);
        setPhotosToRemove([]);
        setNewPhotoFiles([]);
        setNewPhotoPreviews([]);
        await fetchAgencyData(true);
      } else {
        toast.error(result.payload || result.message || "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      toast.error(err?.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (originalFormData) setFormData({ ...originalFormData });
      setPhotosToRemove([]);
      setNewPhotoFiles([]);
      setNewPhotoPreviews([]);
      setLogoFile(null);
      setLogoPreview(null);
      setIsEditing(false);
    } else {
      setOriginalFormData({ ...formData });
      setIsEditing(true);
    }
  };

  // Liste combinée (existantes + nouvelles) pour la navigation dans la visionneuse
  const viewerImages = [
    ...existingPhotos.filter((url) => !photosToRemove.includes(url)),
    ...newPhotoPreviews,
  ];

  /* ── Render ── */
  return (
    <ErrorBoundary>
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 space-y-4 sm:space-y-6 animate-fade-in">

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

      {/* ── En-tête identité : logo, nom, statut, actions ── */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 shadow-sm">
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-7">

          {/* Logo - toujours cliquable en mode édition, quel que soit
              l'endroit de la page où le clic Modifier a eu lieu. */}
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-white/20 bg-white flex items-center justify-center overflow-hidden shadow-lg">
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
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer">
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  Actif
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-300">
              {formData.code_agence && (
                <span className="flex items-center gap-1.5">
                  <BriefcaseIcon className="w-4 h-4" />
                  {formData.code_agence}
                </span>
              )}
              {(formData.commune_id || formData.code_pays) && (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4" />
                  {[
                    communes.find((c) => String(c.id) === String(formData.commune_id))?.nom,
                    getCountryName(formData.code_pays),
                  ].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        exportAgencyProfilePDF({
                          ...formData,
                          pays: getCountryName(formData.code_pays),
                          telephone: joinPhoneNumber(telDialCode, telLocalNumber),
                          whatsapp: joinPhoneNumber(waDialCode, waLocalNumber),
                        });
                      } catch (error) {
                        toast.error("Erreur lors de l'export de la fiche agence");
                      }
                    }}
                    className="p-2.5 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                    title="Exporter la fiche en PDF"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => { setRefreshing(true); await fetchAgencyData(true); setRefreshing(false); }}
                    className="p-2.5 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                    title="Actualiser"
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  </button>
                </>
              )}
              {agencyConfigured && (
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isEditing
                      ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                      : "bg-white text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {isEditing
                    ? <><XMarkIcon className="w-4 h-4" /> Annuler</>
                    : <><PencilSquareIcon className="w-4 h-4" /> Modifier le profil</>
                  }
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Corps : toutes les sections visibles ensemble, plus d'onglets
          à état caché (voir isEditing, unique pour toute la page) ── */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

        {/* Coordonnées + Localisation */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
          <Card>
            <SectionHeader icon={BuildingOffice2Icon} title="Informations générales" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Nom de l'agence</FieldLabel>
                <Field name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} placeholder="Ex : Agence Centrale Abidjan" />
              </div>
              <div>
                <FieldLabel>Code agence</FieldLabel>
                <Field
                  name="code_agence"
                  value={formData.code_agence}
                  onChange={handleChange}
                  disabled={agencyConfigured || !isEditing}
                  placeholder="Ex : AGC-001"
                />
                {!agencyConfigured && (
                  <p className="mt-1 text-xs text-slate-400">
                    Choisissez librement ce code : il ne pourra plus être modifié après la création de l'agence.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Téléphone</FieldLabel>
                <PhoneInput
                  dialCode={telDialCode}
                  localNumber={telLocalNumber}
                  onDialCodeChange={setTelDialCode}
                  onLocalNumberChange={setTelLocalNumber}
                  disabled={!isEditing}
                  inputClassName="w-full pl-3 pr-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-900 disabled:cursor-default transition-colors placeholder:text-slate-300"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>WhatsApp <span className="text-slate-400 font-normal">(optionnel)</span></FieldLabel>
                <PhoneInput
                  dialCode={waDialCode}
                  localNumber={waLocalNumber}
                  onDialCodeChange={setWaDialCode}
                  onLocalNumberChange={setWaLocalNumber}
                  required={false}
                  disabled={!isEditing}
                  inputClassName="w-full pl-3 pr-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-900 disabled:cursor-default transition-colors placeholder:text-slate-300"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Adresse email</FieldLabel>
                <Field icon={EnvelopeIcon} type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} placeholder="contact@agence.com" required />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between mb-5">
              <SectionHeader icon={MapPinSolidIcon} title="Localisation" />
              {isEditing && (
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors shrink-0"
                >
                  Détecter ma position
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FieldLabel>Pays</FieldLabel>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <SearchableDropdown
                    options={countryOptions}
                    onSelect={(pays) => setFormData((p) => (
                      // Changer de pays invalide la commune déjà choisie
                      // (référentiel propre à chaque backoffice/pays) - on
                      // la réinitialise pour ne jamais envoyer une commune
                      // d'un autre pays que celui finalement retenu.
                      { ...p, code_pays: pays.id, commune_id: "", commune: "" }
                    ))}
                    placeholder={getCountryName(formData.code_pays) || "Sélectionnez un pays"}
                    disabled={!isEditing}
                    className="w-full"
                    buttonClassName="h-11 pl-9 pr-3 text-sm text-slate-800 rounded-lg"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Seuls les pays où Tour Shop opère déjà sont proposés : votre agence est toujours rattachée au backoffice de son pays.
                </p>
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Commune</FieldLabel>
                <SearchableDropdown
                  options={communes.map((c) => ({ id: c.id, label: c.nom }))}
                  onSelect={(commune) => setFormData((p) => ({ ...p, commune_id: commune.id, commune: commune.label }))}
                  placeholder={
                    communes.find((c) => String(c.id) === String(formData.commune_id))?.nom
                    || formData.commune
                    || "Sélectionnez une commune"
                  }
                  disabled={!isEditing}
                  className="w-full"
                  buttonClassName="h-11 pl-3 pr-3 text-sm text-slate-800 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Adresse</FieldLabel>
                <Field name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} placeholder="Rue, quartier…" />
              </div>
              <div>
                <FieldLabel>Latitude</FieldLabel>
                <Field name="latitude" value={formData.latitude} onChange={handleChange} disabled={!isEditing} placeholder="5.354722" />
              </div>
              <div>
                <FieldLabel>Longitude</FieldLabel>
                <Field name="longitude" value={formData.longitude} onChange={handleChange} disabled={!isEditing} placeholder="-4.008256" />
              </div>
            </div>
          </Card>
        </div>

        {/* Description : devient éditable avec le reste de la page, plus de
            dépendance cachée à un bouton d'une carte voisine. */}
        <Card>
          <SectionHeader icon={SparklesIcon} title="Description" hint="Visible par vos clients lors de la prise de commande." />
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Présentez votre agence en quelques lignes…"
            className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
              disabled:bg-slate-50 disabled:text-slate-900 disabled:cursor-default
              transition-colors placeholder:text-slate-300 resize-none"
          />
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-5">
            <SectionHeader icon={PhotoIcon} title="Photos de l'agence" hint={`Jusqu'à ${MAX_PHOTOS} photos, visibles par les clients qui consultent votre agence.`} />
            {isEditing && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors shrink-0">
                <PlusIcon className="w-3.5 h-3.5" />
                Ajouter
                <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotosChange} />
              </label>
            )}
          </div>
          {(() => {
            const visibleExisting = existingPhotos.filter((url) => !photosToRemove.includes(url));
            const totalCount = visibleExisting.length + newPhotoPreviews.length;

            if (totalCount === 0) {
              return isEditing ? (
                <label className="flex flex-col items-center justify-center gap-2.5 py-10 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer">
                  <div className="h-11 w-11 rounded-full bg-indigo-100 flex items-center justify-center">
                    <PhotoIcon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-sm font-semibold text-indigo-700">Ajoutez vos premières photos</p>
                  <p className="text-xs text-slate-400">Cliquez ou déposez des images ici — jusqu'à {MAX_PHOTOS} photos</p>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotosChange} />
                </label>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2.5 py-10 rounded-lg border border-dashed border-slate-200 bg-slate-50/60">
                  <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center">
                    <PhotoIcon className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">Aucune photo pour l'instant</p>
                  <p className="text-xs text-slate-400">Ajoutez des photos de vos locaux pour rassurer vos clients.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-6 gap-3">
                {visibleExisting.map((url, i) => (
                  <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={url}
                      alt="Photo agence"
                      onClick={() => setViewerIndex(i)}
                      className="w-full h-full object-cover cursor-zoom-in"
                    />
                    {isEditing && (
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
                    <img
                      src={src}
                      alt="Nouvelle photo"
                      onClick={() => setViewerIndex(visibleExisting.length + i)}
                      className="w-full h-full object-cover cursor-zoom-in"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-600 text-white">
                      Nouveau
                    </span>
                    {isEditing && (
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
                {isEditing && totalCount < MAX_PHOTOS && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                    <PlusIcon className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-400">Ajouter</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotosChange} />
                  </label>
                )}
              </div>
            );
          })()}
        </Card>

        {/* Horaires */}
        <Card>
          <SectionHeader icon={ClockIcon} title="Horaires d'ouverture" />
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
                    {isEditing && (
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
                      disabled={!isEditing}
                      className="flex-1 px-2 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:cursor-default"
                    />
                    <span className="text-slate-300 text-xs">–</span>
                    <input
                      type="time"
                      value={h.fermeture}
                      onChange={(e) => handleHoraireChange(i, "fermeture", e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-2 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:cursor-default"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {isEditing && (
          <SaveBar saving={saving} onCancel={handleEditToggle} />
        )}
      </form>

      {viewerIndex != null && (
        <ImageLightbox
          images={viewerImages}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={(delta) =>
            setViewerIndex((i) => (i + delta + viewerImages.length) % viewerImages.length)
          }
        />
      )}
    </div>
    </ErrorBoundary>
  );
};

export default AgencyProfile;
