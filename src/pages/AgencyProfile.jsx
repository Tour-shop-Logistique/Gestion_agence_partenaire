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
import Switch from "../components/common/Switch";
import { getCountryName } from "../utils/countries";
import { agenciesApi } from "../utils/api/agencies";
import { splitPhoneNumber, joinPhoneNumber } from "../utils/phoneCountries";
import { communesApi } from "../utils/api/communes";
import { exportAgencyProfilePDF } from "../utils/pdfExport";
import MoyensPaiementSection from "../components/paiements/MoyensPaiementSection";

import {
  BuildingOffice2Icon,
  MapPinIcon,
  ClockIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  GlobeAltIcon,
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
  BanknotesIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

/* ─────────────────────────────────────────────
   Composants utilitaires
───────────────────────────────────────────── */

const SECTIONS = [
  { id: "coordonnees", label: "Coordonnées", icon: BuildingOffice2Icon, tint: "bg-cyan-50 text-[#005566]" },
  { id: "localisation", label: "Localisation", icon: MapPinIcon, tint: "bg-sky-50 text-sky-700" },
  { id: "presentation", label: "Présentation", icon: SparklesIcon, tint: "bg-violet-50 text-violet-700" },
  { id: "photos", label: "Photos", icon: PhotoIcon, tint: "bg-amber-50 text-amber-700" },
  { id: "horaires", label: "Horaires", icon: ClockIcon, tint: "bg-emerald-50 text-emerald-700" },
  { id: "paiement", label: "Paiement", icon: BanknotesIcon, tint: "bg-orange-50 text-orange-700" },
];

const INPUT =
  "w-full h-11 px-3.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl " +
  "focus:outline-none focus:ring-2 focus:ring-[#005566]/25 focus:border-[#005566] " +
  "disabled:bg-slate-100 disabled:text-slate-500 transition placeholder:text-slate-400";

/** Libellé d'un champ en édition */
const EditLabel = ({ children, hint }) => (
  <span className="block text-xs font-semibold text-slate-700 mb-1.5">
    {children} {hint && <span className="font-normal text-slate-400">{hint}</span>}
  </span>
);

/** Valeur en lecture : grande et contrastée, plus un champ grisé. */
const Info = ({ label, children, className = "" }) => (
  <div className={className}>
    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
    <dd className="mt-1 text-[15px] font-semibold text-slate-900 break-words">
      {children || <span className="font-normal italic text-slate-400">Non renseigné</span>}
    </dd>
  </div>
);

/** Boutons Annuler / Enregistrer d'une rubrique en cours de modification. */
const BoutonsEdition = ({ saving, onCancel, libelle = "Enregistrer" }) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
    <button
      type="button"
      onClick={onCancel}
      disabled={saving}
      className="h-11 px-5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition"
    >
      Annuler
    </button>
    <button
      type="submit"
      disabled={saving}
      className="h-11 px-6 inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#005566] hover:bg-[#00434f] disabled:opacity-60 rounded-xl transition"
    >
      {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
      {saving ? "Enregistrement…" : libelle}
    </button>
  </div>
);

/**
 * Carte de rubrique, ancrée pour la navigation. Chaque rubrique se modifie
 * séparément : bouton Modifier dans l'en-tête, Annuler/Enregistrer en pied.
 */
const Section = ({ id, title, hint, action, editing, onEdit, onCancel, saving, children }) => {
  const meta = SECTIONS.find((x) => x.id === id);
  const Icon = meta.icon;
  return (
    <section
      id={id}
      className={`scroll-mt-36 lg:scroll-mt-24 bg-white rounded-2xl border shadow-sm transition-colors ${
        editing ? "border-[#005566]/40 ring-2 ring-[#005566]/10" : "border-slate-200"
      }`}
    >
      <header className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-5 pb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.tint}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 pt-0.5">
            <span className="block text-base font-bold text-slate-900">{title}</span>
            {hint && <span className="block text-xs text-slate-500 mt-0.5">{hint}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          {onEdit && !editing && (
            <button
              type="button"
              onClick={onEdit}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-bold text-[#005566] bg-cyan-50 hover:bg-cyan-100 transition"
            >
              <PencilSquareIcon className="w-4 h-4" /> Modifier
            </button>
          )}
        </div>
      </header>
      <div className="px-4 sm:px-6 pb-6">{children}</div>
      {editing && onCancel && (
        <footer className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl">
          <BoutonsEdition saving={saving} onCancel={onCancel} />
        </footer>
      )}
    </section>
  );
};

/** Statut d'ouverture actuel, calculé depuis les horaires (lundi = 0). */
const indexAujourdhui = () => (new Date().getDay() + 6) % 7;
const statutOuverture = (horaires) => {
  const h = horaires[indexAujourdhui()];
  if (!h || h.ferme) return { ouvert: false, texte: "Fermé aujourd'hui" };
  const now = new Date().toTimeString().slice(0, 5);
  if (now < h.ouverture) return { ouvert: false, texte: `Ouvre à ${h.ouverture}` };
  if (now >= h.fermeture) return { ouvert: false, texte: "Fermé pour aujourd'hui" };
  return { ouvert: true, texte: `Ouvert jusqu'à ${h.fermeture}` };
};

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
  const moyensPaiement = useSelector((state) => state.paiements.moyensPaiement);

  // Une rubrique se modifie à la fois. Tant que l'agence n'est pas encore
  // créée, tout le formulaire est ouvert et s'enregistre d'un bloc.
  const [editingSection, setEditingSection] = useState(null);
  const enEdition = (id) => isAdmin && (!agencyConfigured || editingSection === id);
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

  // Communes du backoffice du pays CHOISI DANS LE FORMULAIRE (pas celui déjà
  // enregistré en base) - toujours la variante publique filtrée par pays :
  // getCommunes() (authentifié) résout le backoffice depuis le pays déjà en
  // base et ignorerait un changement de pays non encore sauvegardé.
  const [communes, setCommunes] = useState([]);
  useEffect(() => {
    if (!formData.code_pays) {
      setCommunes([]);
      return;
    }

    communesApi.getCommunesByPays(formData.code_pays).then((res) => {
      if (res.success) setCommunes(res.data || []);
    });
  }, [formData.code_pays]);

  // Pays disposant d'un backoffice actif : une agence ne peut être
  // rattachée qu'à l'un de ces pays (le backend rejette tout autre pays).
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

  const [sectionActive, setSectionActive] = useState(SECTIONS[0].id);

  /* Remplir le formulaire depuis Redux */
  useEffect(() => {
    // agenciesApi.getAgency() retourne déjà l'objet agence directement ;
    // même fallback que selectAgencyConfigured() si la forme change.
    const a = agencyData?.agence || agencyData;
    if (a?.nom_agence) {
      const next = { ...formData };
      if (a.nom_agence)  next.name        = a.nom_agence;
      if (a.code_agence) next.code_agence = a.code_agence;
      if (a.adresse)     next.address     = a.adresse;
      if (a.code_pays)   next.code_pays   = a.code_pays;
      if (a.email)       next.email       = a.email;
      if (a.website)     next.website     = a.website;
      if (a.description) next.description = a.description;
      // a.commune est la relation Eloquent chargée ({id, nom}) : commune_id
      // fait foi, le nom sert de repli d'affichage.
      if (a.commune?.nom) next.commune     = a.commune.nom;
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

  // Surligne dans la navigation la rubrique en cours de lecture.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibles = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibles[0]) setSectionActive(visibles[0].target.id);
      },
      { rootMargin: "-120px 0px -55% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* Handlers */
  const handleChange = (e) => {
    const { name, value } = e.target;
    // code_agence est toujours stocké en majuscules (voir Agence::codeAgence()).
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
      // code_agence n'est envoyé qu'à la création : immuable ensuite.
      if (!hasId) payload.code_agence = formData.code_agence.trim();

      const result = hasId ? await updateAgencyData(payload) : await setupAgency(payload);

      if (result.type?.includes("fulfilled") || result.success) {
        toast.success("Profil agence mis à jour.");
        setEditingSection(null);
        setLogoFile(null);
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

  // Ouvrir une rubrique en annule une autre déjà ouverte : tout le
  // formulaire est envoyé à l'enregistrement, il ne doit contenir que les
  // changements de la rubrique en cours.
  const annulerEdition = () => {
    if (originalFormData) {
      const { _tel, ...form } = originalFormData;
      setFormData(form);
      if (_tel) {
        setTelDialCode(_tel[0]); setTelLocalNumber(_tel[1]);
        setWaDialCode(_tel[2]); setWaLocalNumber(_tel[3]);
      }
    }
    setPhotosToRemove([]);
    setNewPhotoFiles([]);
    setNewPhotoPreviews([]);
    setLogoFile(null);
    setLogoPreview(null);
    setEditingSection(null);
  };

  const commencerEdition = (id) => {
    // Si une autre rubrique était ouverte, son instantané reste la référence
    // (formData contient encore ses changements non enregistrés).
    const instantane = editingSection && originalFormData
      ? originalFormData
      : { ...formData, _tel: [telDialCode, telLocalNumber, waDialCode, waLocalNumber] };
    if (editingSection) annulerEdition();
    setOriginalFormData(instantane);
    setEditingSection(id);
  };

  // Props communes des rubriques modifiables.
  const editionProps = (id) => ({
    editing: enEdition(id),
    onEdit: isAdmin && agencyConfigured ? () => commencerEdition(id) : undefined,
    onCancel: agencyConfigured ? annulerEdition : undefined,
    saving,
  });

  const allerA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* Valeurs dérivées pour l'affichage */
  const visiblePhotos = existingPhotos.filter((url) => !photosToRemove.includes(url));
  const totalPhotos = visiblePhotos.length + newPhotoPreviews.length;
  // Liste combinée (existantes + nouvelles) pour la navigation dans la visionneuse
  const viewerImages = [...visiblePhotos, ...newPhotoPreviews];

  const communeNom = communes.find((c) => String(c.id) === String(formData.commune_id))?.nom || formData.commune;
  const telephone = joinPhoneNumber(telDialCode, telLocalNumber);
  const whatsapp = joinPhoneNumber(waDialCode, waLocalNumber);
  const ouverture = statutOuverture(formData.horaires);
  const mapsUrl = formData.latitude && formData.longitude
    ? `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`
    : null;

  // Ce qui manque encore pour qu'un client trouve, contacte et paie l'agence.
  const completude = {
    coordonnees: !!(formData.name && telLocalNumber && formData.email),
    localisation: !!(formData.commune_id && formData.address && formData.latitude && formData.longitude),
    presentation: !!formData.description?.trim(),
    photos: totalPhotos > 0,
    horaires: formData.horaires.some((h) => !h.ferme),
    paiement: moyensPaiement.some((m) => m.actif),
  };

  /* ── Render ── */
  return (
    <ErrorBoundary>
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-in">
      <div className="lg:flex lg:gap-6 lg:items-start">

        {/* ── Navigation des rubriques ──
            Fixe (pas sticky : <main> est en overflow-y-auto, ce qui casse
            position: sticky). La colonne couvre toute la hauteur de la page
            pour que le menu ne chevauche jamais l'en-tête. */}
        <div className="h-12 mb-4 lg:mb-0 lg:h-auto lg:w-52 lg:shrink-0">
          <nav
            aria-label="Rubriques du profil"
            className="fixed top-16 inset-x-0 z-30 px-3 py-2 bg-white/95 backdrop-blur border-b border-slate-200 lg:top-24 lg:inset-x-auto lg:w-52 lg:p-2 lg:rounded-2xl lg:border lg:shadow-sm"
          >
            <ul className="flex lg:flex-col gap-1 overflow-x-auto">
              {SECTIONS.map((x) => {
                const Icon = x.icon;
                const actif = sectionActive === x.id;
                return (
                  <li key={x.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => allerA(x.id)}
                      aria-current={actif ? "true" : undefined}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 lg:py-2.5 rounded-xl text-sm font-semibold transition ${
                        actif ? "bg-[#005566] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">{x.label}</span>
                      {!completude[x.id] && (
                        <span className="ml-auto w-2 h-2 rounded-full shrink-0 bg-amber-400" title="À compléter" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="space-y-4 sm:space-y-5 min-w-0 lg:flex-1">

      {/* ── Bannière setup requis ── */}
      {!agencyConfigured && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-900">Configuration requise</p>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Renseignez les informations de votre agence et enregistrez pour accéder à toutes les fonctionnalités.
            </p>
          </div>
        </div>
      )}

      {/* ── En-tête de page, même gabarit que les autres pages ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profil de l'agence</h1>
          <span className="block text-sm text-slate-500 mt-0.5">
            Les informations que vos clients voient avant de vous confier un colis.
          </span>
        </div>
        {isAdmin && agencyConfigured && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  exportAgencyProfilePDF({ ...formData, pays: getCountryName(formData.code_pays), telephone, whatsapp });
                } catch (error) {
                  toast.error("Erreur lors de l'export de la fiche agence");
                }
              }}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
            >
              <ArrowDownTrayIcon className="w-4 h-4" /> Fiche PDF
            </button>
            <button
              type="button"
              onClick={async () => { setRefreshing(true); await fetchAgencyData(true); setRefreshing(false); }}
              className="h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
              title="Actualiser"
              aria-label="Actualiser"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* ── Carte d'identité : l'agence telle que la voient ses clients ── */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-[#005566] via-cyan-500 to-emerald-400" />
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            {logoPreview || formData.logo ? (
              <img src={logoPreview || getLogoUrl(formData.logo)} alt="Logo agence" className="w-full h-full object-contain" />
            ) : (
              <BuildingOffice2Icon className="w-9 h-9 text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
                {formData.name || "Nouvelle agence"}
              </span>
              {formData.code_agence && (
                <span className="px-2 py-0.5 rounded-md text-xs font-bold tracking-wider bg-cyan-50 text-[#005566] border border-cyan-100">
                  {formData.code_agence}
                </span>
              )}
            </div>
            {(communeNom || formData.code_pays) && (
              <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPinIcon className="w-4 h-4 shrink-0 text-slate-400" />
                {[communeNom, getCountryName(formData.code_pays)].filter(Boolean).join(", ")}
              </span>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {agencyConfigured && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  ouverture.ouvert ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${ouverture.ouvert ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  {ouverture.texte}
                </span>
              )}
              {telephone && (
                <a href={`tel:${telephone}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition">
                  <PhoneIcon className="w-3.5 h-3.5" /> {telephone}
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition">
                  <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" /> WhatsApp
                </a>
              )}
              {formData.email && (
                <a href={`mailto:${formData.email}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition max-w-full">
                  <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{formData.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Coordonnées */}
            <Section id="coordonnees" title="Coordonnées" hint="Comment vos clients vous identifient et vous joignent." {...editionProps("coordonnees")}>
              {enEdition("coordonnees") ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {logoPreview || formData.logo ? (
                        <img src={logoPreview || getLogoUrl(formData.logo)} alt="Logo agence" className="w-full h-full object-contain" />
                      ) : (
                        <BuildingOffice2Icon className="w-7 h-7 text-slate-300" />
                      )}
                    </div>
                    <label className="h-10 px-4 inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-[#005566] bg-cyan-50 hover:bg-cyan-100 cursor-pointer transition">
                      <CameraIcon className="w-4 h-4" />
                      {formData.logo || logoPreview ? "Changer le logo" : "Ajouter un logo"}
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                  </div>
                  <label className="block">
                    <EditLabel>Nom de l'agence</EditLabel>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Ex : Agence Centrale Abidjan" className={INPUT} />
                  </label>
                  <label className="block">
                    <EditLabel hint={agencyConfigured ? "(non modifiable)" : undefined}>Code agence</EditLabel>
                    <input
                      name="code_agence"
                      value={formData.code_agence}
                      onChange={handleChange}
                      disabled={agencyConfigured}
                      placeholder="Ex : AGC-001"
                      className={`${INPUT} font-bold tracking-wider`}
                    />
                    {!agencyConfigured && (
                      <span className="mt-1 block text-xs text-slate-500">Il ne pourra plus être modifié après la création de l'agence.</span>
                    )}
                  </label>
                  <div>
                    <EditLabel>Téléphone</EditLabel>
                    <PhoneInput
                      dialCode={telDialCode}
                      localNumber={telLocalNumber}
                      onDialCodeChange={setTelDialCode}
                      onLocalNumberChange={setTelLocalNumber}
                      inputClassName={INPUT}
                    />
                  </div>
                  <div>
                    <EditLabel hint="(optionnel)">WhatsApp</EditLabel>
                    <PhoneInput
                      dialCode={waDialCode}
                      localNumber={waLocalNumber}
                      onDialCodeChange={setWaDialCode}
                      onLocalNumberChange={setWaLocalNumber}
                      required={false}
                      inputClassName={INPUT}
                    />
                  </div>
                  <label className="block sm:col-span-2">
                    <EditLabel>Adresse email</EditLabel>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@agence.com" required className={INPUT} />
                  </label>
                </div>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <Info label="Nom de l'agence">{formData.name}</Info>
                  <Info label="Code agence">{formData.code_agence}</Info>
                  <Info label="Téléphone">{telephone}</Info>
                  <Info label="WhatsApp">{whatsapp}</Info>
                  <Info label="Adresse email" className="sm:col-span-2">{formData.email}</Info>
                </dl>
              )}
            </Section>

            {/* Localisation */}
            <Section
              id="localisation"
              title="Localisation"
              hint="Où vos clients déposent et retirent leurs colis."
              {...editionProps("localisation")}
              action={enEdition("localisation") ? (
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition shrink-0"
                >
                  <MapPinIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Détecter ma position</span>
                  <span className="sm:hidden">Ma position</span>
                </button>
              ) : mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition shrink-0"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Voir sur la carte
                </a>
              )}
            >
              {enEdition("localisation") ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <EditLabel>Pays</EditLabel>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <SearchableDropdown
                        options={countryOptions}
                        onSelect={(pays) => setFormData((p) => (
                          // Changer de pays invalide la commune déjà choisie
                          // (référentiel propre à chaque backoffice/pays).
                          { ...p, code_pays: pays.id, commune_id: "", commune: "" }
                        ))}
                        placeholder={getCountryName(formData.code_pays) || "Sélectionnez un pays"}
                        className="w-full"
                        buttonClassName="h-11 pl-9 pr-3 text-sm text-slate-900 rounded-xl"
                      />
                    </div>
                    <span className="mt-1 block text-xs text-slate-500">Seuls les pays où Tour Shop opère sont proposés.</span>
                  </div>
                  <div>
                    <EditLabel>Commune</EditLabel>
                    <SearchableDropdown
                      options={communes.map((c) => ({ id: c.id, label: c.nom }))}
                      onSelect={(commune) => setFormData((p) => ({ ...p, commune_id: commune.id, commune: commune.label }))}
                      placeholder={communeNom || "Sélectionnez une commune"}
                      className="w-full"
                      buttonClassName="h-11 pl-3 pr-3 text-sm text-slate-900 rounded-xl"
                    />
                  </div>
                  <label className="block sm:col-span-2">
                    <EditLabel>Adresse</EditLabel>
                    <input name="address" value={formData.address} onChange={handleChange} placeholder="Quartier, rue, repère…" className={INPUT} />
                  </label>
                  <label className="block">
                    <EditLabel>Latitude</EditLabel>
                    <input name="latitude" inputMode="decimal" value={formData.latitude} onChange={handleChange} placeholder="5.354722" className={`${INPUT} tabular-nums`} />
                  </label>
                  <label className="block">
                    <EditLabel>Longitude</EditLabel>
                    <input name="longitude" inputMode="decimal" value={formData.longitude} onChange={handleChange} placeholder="-4.008256" className={`${INPUT} tabular-nums`} />
                  </label>
                </div>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <Info label="Adresse" className="sm:col-span-2">{formData.address}</Info>
                  <Info label="Commune">{communeNom}</Info>
                  <Info label="Pays">{getCountryName(formData.code_pays)}</Info>
                  <Info label="Coordonnées GPS" className="sm:col-span-2">
                    {formData.latitude && formData.longitude && (
                      <span className="tabular-nums">{formData.latitude}, {formData.longitude}</span>
                    )}
                  </Info>
                </dl>
              )}
            </Section>

            {/* Présentation */}
            <Section id="presentation" title="Présentation" hint="Visible par vos clients lors de la prise de commande." {...editionProps("presentation")}>
              {enEdition("presentation") ? (
                <>
                  <textarea
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={1000}
                    placeholder="Présentez votre agence : spécialités, destinations, années d'expérience…"
                    className={`${INPUT} h-auto py-3 leading-relaxed resize-y`}
                  />
                  <p className="mt-1 text-right text-xs text-slate-400 tabular-nums">{formData.description?.length || 0}/1000</p>
                </>
              ) : formData.description ? (
                <blockquote className="rounded-xl bg-violet-50/60 border-l-4 border-violet-300 px-4 py-3.5 text-[15px] leading-relaxed text-slate-800 whitespace-pre-line">
                  {formData.description}
                </blockquote>
              ) : (
                <p className="text-sm italic text-slate-400">Aucune présentation pour l'instant.</p>
              )}
            </Section>

            {/* Photos */}
            <Section
              id="photos"
              title="Photos de l'agence"
              hint={`${totalPhotos}/${MAX_PHOTOS} photos, visibles par les clients qui consultent votre agence.`}
              {...editionProps("photos")}
            >
              {totalPhotos === 0 && !enEdition("photos") ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                  <PhotoIcon className="w-8 h-8 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">Aucune photo pour l'instant</p>
                  <p className="text-xs text-slate-400">Des photos de vos locaux rassurent vos clients.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {visiblePhotos.map((url, i) => (
                    <div key={url} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 group">
                      <img
                        src={url}
                        alt={`Photo ${i + 1} de l'agence`}
                        onClick={() => setViewerIndex(i)}
                        className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-300"
                      />
                      {enEdition("photos") && (
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(url)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 text-rose-600 shadow flex items-center justify-center hover:bg-rose-600 hover:text-white transition"
                          aria-label="Retirer la photo"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {newPhotoPreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-cyan-50 ring-2 ring-[#005566]/40">
                      <img
                        src={src}
                        alt="Nouvelle photo"
                        onClick={() => setViewerIndex(visiblePhotos.length + i)}
                        className="w-full h-full object-cover cursor-zoom-in"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#005566] text-white">Nouvelle</span>
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(i)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 text-rose-600 shadow flex items-center justify-center hover:bg-rose-600 hover:text-white transition"
                        aria-label="Retirer la photo"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {enEdition("photos") && totalPhotos < MAX_PHOTOS && (
                    <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-amber-700">
                      <PlusIcon className="w-6 h-6" />
                      <span className="text-xs font-bold">Ajouter des photos</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotosChange} />
                    </label>
                  )}
                </div>
              )}
            </Section>

            {/* Horaires */}
            <Section id="horaires" title="Horaires d'ouverture" hint="Affichés aux clients avant qu'ils se déplacent." {...editionProps("horaires")}>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                {formData.horaires.map((h, i) => {
                  const estAujourdhui = i === indexAujourdhui();
                  const interrupteur = (
                    <Switch
                      checked={!h.ferme}
                      onChange={(ouvert) => handleHoraireChange(i, "ferme", !ouvert)}
                      label={`${h.jour} : ouvert`}
                    />
                  );
                  return (
                    <li
                      key={`horaire-${h.jour}`}
                      className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 ${estAujourdhui ? "bg-emerald-50/70" : "bg-white"}`}
                    >
                      <div className="flex items-center justify-between sm:justify-start gap-3 sm:w-48 shrink-0">
                        <span className={`text-sm font-bold ${h.ferme ? "text-slate-400" : "text-slate-900"}`}>
                          {h.jour}
                          {estAujourdhui && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white align-middle">
                              Aujourd'hui
                            </span>
                          )}
                        </span>
                        {enEdition("horaires") && (
                          <span className="flex items-center gap-2 sm:hidden">
                            <span className="text-xs font-semibold text-slate-500">{h.ferme ? "Fermé" : "Ouvert"}</span>
                            {interrupteur}
                          </span>
                        )}
                      </div>

                      {enEdition("horaires") ? (
                        <div className="flex items-center gap-3 flex-1">
                          <span className="hidden sm:flex items-center gap-2 w-24 shrink-0">
                            {interrupteur}
                            <span className="text-xs font-semibold text-slate-500">{h.ferme ? "Fermé" : "Ouvert"}</span>
                          </span>
                          {!h.ferme && (
                            <div className="flex items-center gap-2 flex-1 sm:flex-none">
                              <input
                                type="time"
                                value={h.ouverture}
                                onChange={(e) => handleHoraireChange(i, "ouverture", e.target.value)}
                                aria-label={`${h.jour} : ouverture`}
                                className={`${INPUT} h-10 sm:w-32 tabular-nums`}
                              />
                              <span className="text-slate-400 text-sm">à</span>
                              <input
                                type="time"
                                value={h.fermeture}
                                onChange={(e) => handleHoraireChange(i, "fermeture", e.target.value)}
                                aria-label={`${h.jour} : fermeture`}
                                className={`${INPUT} h-10 sm:w-32 tabular-nums`}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`text-sm tabular-nums ${h.ferme ? "text-slate-400 italic" : "font-semibold text-slate-800"}`}>
                          {h.ferme ? "Fermé" : `${h.ouverture} – ${h.fermeture}`}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>

            {/* Création de l'agence : tout s'enregistre d'un bloc. */}
            {isAdmin && !agencyConfigured && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#005566] hover:bg-[#00434f] disabled:opacity-60 rounded-xl transition"
                >
                  {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                  {saving ? "Enregistrement…" : "Créer mon agence"}
                </button>
              </div>
            )}
          </form>

          {/* Hors du formulaire principal : chaque moyen de paiement
              s'enregistre immédiatement. */}
          <Section
            id="paiement"
            title="Moyens de paiement"
            hint="Les numéros sur lesquels vos clients vous paient à distance. Enregistrés immédiatement."
          >
            <MoyensPaiementSection canEdit={isAdmin} />
          </Section>
        </div>
      </div>

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
