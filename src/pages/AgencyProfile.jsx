import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../components/DashboardLayout";
import { useAgency } from "../hooks/useAgency";
import { selectIsAdmin } from "../store/slices/authSlice";
import { getLogoUrl } from "../utils/apiConfig";

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
  MapIcon,
  BriefcaseIcon,
  CameraIcon
} from "@heroicons/react/24/outline";

const AgencyProfile = () => {
  const {
    data: agencyData,
    error: agencyError,
    fetchAgencyData,
    updateAgencyData,
    setupAgency,
  } = useAgency();

  const isAdmin = useSelector(selectIsAdmin);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    code_agence: "",
    address: "",
    ville: "",
    pays: "Côte d'Ivoire",
    telephone: "",
    email: "",
    website: "",
    latitude: "",
    longitude: "",
    businessHours: "",
    description: "",
    commune: "",
    services: [],
    horaires: [
      { jour: "lundi", ouverture: "08:00", fermeture: "18:00", ferme: false },
      { jour: "mardi", ouverture: "08:00", fermeture: "18:00", ferme: false },
      { jour: "mercredi", ouverture: "08:00", fermeture: "18:00", ferme: false },
      { jour: "jeudi", ouverture: "08:00", fermeture: "18:00", ferme: false },
      { jour: "vendredi", ouverture: "08:00", fermeture: "18:00", ferme: false },
      { jour: "samedi", ouverture: "08:00", fermeture: "12:00", ferme: false },
    ],
    logo: null,
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);

  useEffect(() => {
    if (agencyData && agencyData.agence) {
      const agence = agencyData.agence;
      const newFormData = { ...formData };

      if (agence.nom_agence) newFormData.name = agence.nom_agence;
      if (agence.code_agence) newFormData.code_agence = agence.code_agence;
      if (agence.adresse) newFormData.address = agence.adresse;
      if (agence.ville) newFormData.ville = agence.ville;
      if (agence.pays) newFormData.pays = agence.pays;
      if (agence.telephone) newFormData.telephone = agence.telephone;
      if (agence.email) newFormData.email = agence.email;
      if (agence.website) newFormData.website = agence.website;
      if (agence.description) newFormData.description = agence.description;
      if (agence.commune) newFormData.commune = agence.commune;
      if (agence.logo) newFormData.logo = agence.logo;

      if (agence.latitude !== undefined && agence.latitude !== null) {
        newFormData.latitude = String(agence.latitude);
      }
      if (agence.longitude !== undefined && agence.longitude !== null) {
        newFormData.longitude = String(agence.longitude);
      }

      if (Array.isArray(agence.horaires) && agence.horaires.length > 0) {
        const horairesMap = {};
        agence.horaires.forEach((h) => {
          if (h.jour) horairesMap[h.jour] = h;
        });

        newFormData.horaires = newFormData.horaires.map((horaire) => {
          const updatedHoraire = horairesMap[horaire.jour];
          if (updatedHoraire) {
            return {
              ...horaire,
              ouverture: updatedHoraire.ouverture || horaire.ouverture,
              fermeture: updatedHoraire.fermeture || horaire.fermeture,
              ferme: updatedHoraire.ferme !== undefined ? updatedHoraire.ferme : horaire.ferme,
            };
          }
          return horaire;
        });
      }

      setFormData(newFormData);
      if (!originalFormData && agencyData?.agence) {
        setOriginalFormData({ ...newFormData });
      }
    }
  }, [agencyData, originalFormData]);

  useEffect(() => {
    if (agencyError) {
      setMessage({ type: "error", text: agencyError });
    }
  }, [agencyError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleHoraireChange = (index, field, value) => {
    const newHoraires = [...formData.horaires];
    newHoraires[index] = { ...newHoraires[index], [field]: value };
    setFormData((prev) => ({ ...prev, horaires: newHoraires }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setMessage({ type: "info", text: "Récupération de votre position..." });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
          setMessage({ type: "success", text: "Localisation récupérée avec succès !" });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        },
        () => {
          setMessage({ type: "error", text: "Impossible de récupérer la localisation." });
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const agencyPayload = {
        nom_agence: formData.name,
        code_agence: formData.code_agence,
        telephone: formData.telephone,
        description: formData.description,
        adresse: formData.address,
        ville: formData.ville,
        commune: formData.commune,
        pays: formData.pays,
        latitude: formData.latitude === "" ? null : parseFloat(formData.latitude),
        longitude: formData.longitude === "" ? null : parseFloat(formData.longitude),
        horaires: formData.horaires,
      };

      if (logoFile) agencyPayload.logo = logoFile;

      const hasAgencyId = !!(agencyData?.agence?.id || agencyData?.id);
      const result = hasAgencyId ? await updateAgencyData(agencyPayload) : await setupAgency(agencyPayload);

      if (result.type?.includes("fulfilled") || result.success) {
        setMessage({ type: "success", text: "Profil agence mis à jour avec succès !" });
        setIsEditing(false);
        await fetchAgencyData();
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (originalFormData) setFormData({ ...originalFormData });
      setIsEditing(false);
      setMessage({ type: "", text: "" });
    } else {
      setOriginalFormData({ ...formData });
      setIsEditing(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

        {/* --- PREMIUM HERO HEADER --- */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
          {/* Banner Gradient */}
          <div className="h-32 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          </div>

          <div className="px-8 pb-8 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6 -mt-12 relative z-10">
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6">
              {/* Logo Wrapper */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
                  {logoPreview || (agencyData?.agence?.logo) ? (
                    <img
                      src={logoPreview || getLogoUrl(agencyData?.agence?.logo)}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <BuildingOffice2Icon className="w-16 h-16 text-slate-200" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <CameraIcon className="w-8 h-8 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                  </label>
                )}
              </div>

              <div className="space-y-1 py-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-3">{formData.name || "Nouvelle Agence"}</h1>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">Actif</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 font-bold text-sm">
                  <span className="flex items-center gap-1.5"><BriefcaseIcon className="w-4 h-4" /> {formData.code_agence || "CODE-000"}</span>
                  <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {formData.ville}, {formData.pays}</span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    setRefreshing(true);
                    await fetchAgencyData(true);
                    setRefreshing(false);
                  }}
                  className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                  title="Actualiser"
                >
                  <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${isEditing
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-slate-950 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
                    }`}
                >
                  {isEditing ? <XMarkIcon className="w-5 h-5" /> : <PencilSquareIcon className="w-5 h-5" />}
                  {isEditing ? "ANNULER" : "MODIFIER LE PROFIL"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        {message.text && (
          <div className={`p-4 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
            message.type === "error" ? "bg-rose-50 border-rose-100 text-rose-800" :
              "bg-indigo-50 border-indigo-100 text-indigo-800"
            }`}>
            <div className={`p-2 rounded-xl ${message.type === "success" ? "bg-emerald-100" :
              message.type === "error" ? "bg-rose-100" : "bg-indigo-100"
              }`}>
              {message.type === "success" ? <CheckIcon className="w-5 h-5" /> : <ArrowPathIcon className="w-5 h-5" />}
            </div>
            <p className="text-sm font-bold uppercase tracking-tight">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Info Column */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <BuildingOffice2Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Informations Générales</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Désignation Officielle</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60 disabled:bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Code Agence (Identification)</label>
                    <input
                      type="text" name="code_agence" value={formData.code_agence} onChange={handleInputChange} disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Adresse Physique Complète</label>
                    <input
                      type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Ville</label>
                    <input
                      type="text" name="ville" value={formData.ville} onChange={handleInputChange} disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Commune / District</label>
                    <input
                      type="text" name="commune" value={formData.commune} onChange={handleInputChange} disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Contact Téléphonique</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange} disabled={!isEditing}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Pays d'Opération</label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text" name="pays" value={formData.pays} onChange={handleInputChange} disabled={!isEditing}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-slate-50 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                      <MapIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Positionnement GPS</h3>
                  </div>
                  {isEditing && (
                    <button
                      type="button" onClick={getCurrentLocation}
                      className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                    >
                      Auto-Détecter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Latitude</label>
                    <input
                      type="text" name="latitude" value={formData.latitude} onChange={handleInputChange} disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Longitude</label>
                    <input
                      type="text" name="longitude" value={formData.longitude} onChange={handleInputChange} disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Info Column */}
            <div className="space-y-8">
              <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-900 space-y-8 h-full">
                <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                  <div className="p-2 bg-white/10 rounded-lg text-white">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">Horaires</h3>
                </div>

                <div className="space-y-4">
                  {formData.horaires.map((horaire, index) => (
                    <div key={index} className="group relative">
                      <div className={`p-4 rounded-2xl border transition-all ${horaire.ferme ? 'bg-white/10 border-white/10 opacity-50' : 'bg-white/10 border-white/10 active:bg-white/15'
                        }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold uppercase tracking-[0.2em]">{horaire.jour}</span>
                          <div className="flex items-center gap-2">
                            {isEditing && (
                              <input
                                type="checkbox" checked={horaire.ferme} onChange={(e) => handleHoraireChange(index, "ferme", e.target.checked)}
                                className="accent-indigo-500 w-4 h-4"
                              />
                            )}
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${horaire.ferme ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                              {horaire.ferme ? 'Fermé' : 'Ouvert'}
                            </span>
                          </div>
                        </div>

                        {!horaire.ferme && (
                          <div className="flex items-center gap-3">
                            <input
                              type="time" value={horaire.ouverture} onChange={(e) => handleHoraireChange(index, "ouverture", e.target.value)}
                              disabled={!isEditing}
                              className="flex-1 bg-black/20 border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-white/20 font-bold">/</span>
                            <input
                              type="time" value={horaire.fermeture} onChange={(e) => handleHoraireChange(index, "fermeture", e.target.value)}
                              disabled={!isEditing}
                              className="flex-1 bg-black/20 border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Description Section Full Width */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <BriefcaseIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Description Agence</h3>
            </div>
            <textarea
              name="description" rows={4} value={formData.description} onChange={handleInputChange} disabled={!isEditing}
              placeholder="Rédigez un court message de présentation..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
            />
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
              Cette description sera visible par vos clients lors de la prise de commande et dans l'annuaire des partenaires.
            </p>
          </section>
        </form>

        {/* Floating Action Button for saving (visible only if editing) */}
        {isEditing && (
          <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-bottom-10">
            <button
              type="button" onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-slate-400"
            >
              {saving ? (
                <ArrowPathIcon className="w-6 h-6 animate-spin" />
              ) : (
                <CheckIcon className="w-6 h-6" />
              )}
              <span>SAUVEGARDER LES MODIFICATIONS</span>
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AgencyProfile;
