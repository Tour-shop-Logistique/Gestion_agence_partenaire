import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAgency } from "../hooks/useAgency";
import { selectIsAdmin } from "../store/slices/authSlice";
import { selectAgencyConfigured } from "../store/slices/agencySlice";
import { getLogoUrl } from "../utils/apiConfig";
import { toast } from "../utils/toast";

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
        disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-default
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
  ];

  const [formData, setFormData] = useState({
    name: "", code_agence: "", address: "", ville: "",
    pays: "Côte d'Ivoire", telephone: "", email: "", website: "",
    latitude: "", longitude: "", description: "", commune: "",
    horaires: defaultHoraires, logo: null,
  });

  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);

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
      if (a.ville)       next.ville       = a.ville;
      if (a.pays)        next.pays        = a.pays;
      if (a.telephone)   next.telephone   = a.telephone;
      if (a.email)       next.email       = a.email;
      if (a.website)     next.website     = a.website;
      if (a.description) next.description = a.description;
      if (a.commune)     next.commune     = a.commune;
      if (a.logo)        next.logo        = a.logo;
      if (a.latitude  != null) next.latitude  = String(a.latitude);
      if (a.longitude != null) next.longitude = String(a.longitude);

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
        description: formData.description,
        adresse:     formData.address,
        ville:       formData.ville,
        commune:     formData.commune,
        pays:        formData.pays,
        latitude:    formData.latitude  === "" ? null : parseFloat(formData.latitude),
        longitude:   formData.longitude === "" ? null : parseFloat(formData.longitude),
        horaires:    formData.horaires,
      };
      if (logoFile) payload.logo = logoFile;

      const hasId = !!(agencyData?.agence?.id || agencyData?.id);
      const result = hasId ? await updateAgencyData(payload) : await setupAgency(payload);

      if (result.type?.includes("fulfilled") || result.success) {
        toast.success("Profil agence mis à jour.");
        setIsEditing(false);
        await fetchAgencyData(true);
      }
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (originalFormData) setFormData({ ...originalFormData });
      setIsEditing(false);
    } else {
      setOriginalFormData({ ...formData });
      setIsEditing(true);
    }
  };

  /* ── Render ── */
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 space-y-5">

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

      {/* ── En-tête identité ── */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          {/* Logo */}
          <div className="relative group flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
              {logoPreview || agencyData?.agence?.logo ? (
                <img
                  src={logoPreview || getLogoUrl(agencyData?.agence?.logo)}
                  alt="Logo agence"
                  className="w-full h-full object-contain"
                />
              ) : (
                <BuildingOffice2Icon className="w-8 h-8 text-slate-300" />
              )}
            </div>
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <CameraIcon className="w-5 h-5 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </label>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-semibold text-slate-800 truncate">
                {formData.name || "Nouvelle agence"}
              </h1>
              {agencyConfigured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Actif
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
              {formData.code_agence && (
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="w-3.5 h-3.5" />
                  {formData.code_agence}
                </span>
              )}
              {(formData.ville || formData.pays) && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5" />
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
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                title="Actualiser"
              >
                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={handleEditToggle}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors border ${
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
            </div>
          )}
        </div>
      </Card>

      {/* ── Corps du formulaire ── */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">

            {/* Informations générales */}
            <Card>
              <SectionHeader icon={BuildingOffice2Icon} title="Informations générales" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Nom de l'agence</FieldLabel>
                  <Field name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} placeholder="Ex : Agence Centrale Abidjan" />
                </div>
                <div>
                  <FieldLabel>Code agence</FieldLabel>
                  <Field name="code_agence" value={formData.code_agence} onChange={handleChange} disabled={!isEditing} placeholder="Ex : AGC-001" />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Adresse</FieldLabel>
                  <Field name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} placeholder="Rue, quartier…" />
                </div>
                <div>
                  <FieldLabel>Ville</FieldLabel>
                  <Field name="ville" value={formData.ville} onChange={handleChange} disabled={!isEditing} placeholder="Ex : Abidjan" />
                </div>
                <div>
                  <FieldLabel>Commune</FieldLabel>
                  <Field name="commune" value={formData.commune} onChange={handleChange} disabled={!isEditing} placeholder="Ex : Cocody" />
                </div>
                <div>
                  <FieldLabel>Téléphone</FieldLabel>
                  <Field icon={PhoneIcon} type="tel" name="telephone" value={formData.telephone} onChange={handleChange} disabled={!isEditing} placeholder="+225 07 00 00 00 00" />
                </div>
                <div>
                  <FieldLabel>Pays</FieldLabel>
                  <Field icon={GlobeAltIcon} name="pays" value={formData.pays} onChange={handleChange} disabled={!isEditing} placeholder="Côte d'Ivoire" />
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <SectionHeader icon={BriefcaseIcon} title="Description" />
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Présentez votre agence en quelques lignes…"
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                  disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-default
                  transition-colors placeholder:text-slate-300 resize-none"
              />
              <p className="mt-2 text-xs text-slate-400">
                Visible par vos clients lors de la prise de commande.
              </p>
            </Card>

            {/* GPS */}
            <Card>
              <SectionHeader
                icon={MapPinSolidIcon}
                title="Coordonnées GPS"
                action={
                  isEditing && (
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                    >
                      Détecter ma position
                    </button>
                  )
                }
              />
              <div className="grid grid-cols-2 gap-4">
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

          {/* Colonne horaires */}
          <div>
            <Card className="h-full">
              <SectionHeader icon={ClockIcon} title="Horaires d'ouverture" />
              <div className="space-y-2">
                {formData.horaires.map((h, i) => (
                  <div
                    key={i}
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
          </div>
        </div>

        {/* ── Barre de sauvegarde fixe ── */}
        {isEditing && (
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:left-60">
            <div className="bg-white border-t border-slate-200 px-4 py-3 sm:px-6">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500 hidden sm:block">
                  Les modifications ne sont pas encore enregistrées.
                </p>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleEditToggle}
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
        )}
      </form>
    </div>
  );
};

export default AgencyProfile;
