import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MapPin, Check } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import VerifyEmailForm from "../components/auth/VerifyEmailForm";
import PhoneInput from "../components/common/PhoneInput";
import SearchableDropdown from "../components/common/SearchableDropdown";
import { authApi } from "../utils/api/auth";
import { agenciesApi } from "../utils/api/agencies";
import { communesApi } from "../utils/api/communes";
import { joinPhoneNumber } from "../utils/phoneCountries";
import { useAuth } from "../hooks/useAuth";

const INPUT = "block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors";
const LABEL = "block text-sm font-medium text-slate-700 mb-1.5";

const ETAPES = [
  { titre: "Votre compte", detail: "Vos accès d'administrateur" },
  { titre: "Votre agence", detail: "Où vos clients vous trouvent" },
  { titre: "Vérification", detail: "Code reçu par email" },
];

// Champs de l'étape 1 : une erreur serveur sur l'un d'eux y ramène.
const CHAMPS_ADMIN = ["nom", "prenoms", "telephone", "indicatif_telephone", "whatsapp_number", "email", "password"];

/** Suivi d'étapes vertical (desktop), même trait pointillé que RouteMark. */
const SuiviEtapes = ({ etape }) => (
  <ol className="space-y-0">
    {ETAPES.map((e, i) => {
      const n = i + 1;
      const fait = etape > n;
      const actif = etape === n;
      return (
        <li key={e.titre} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className={`w-8 h-8 rounded-full grid place-items-center text-sm font-semibold transition-colors ${
              fait ? "bg-blue-500 text-white" : actif ? "bg-white text-[#0F1E3D]" : "border border-white/30 text-white/50"
            }`}>
              {fait ? <Check className="w-4 h-4" /> : n}
            </span>
            {n < ETAPES.length && <span className="w-px h-10 border-l-2 border-dotted border-white/25" />}
          </div>
          <div className="pt-1">
            <p className={`text-sm font-semibold ${actif || fait ? "text-white" : "text-white/50"}`}>{e.titre}</p>
            <p className="text-xs text-white/50">{e.detail}</p>
          </div>
        </li>
      );
    })}
  </ol>
);

const Inscription = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [etape, setEtape] = useState(1);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [voirMdp, setVoirMdp] = useState(false);

  const [admin, setAdmin] = useState({
    nom: "", prenoms: "", email: "", password: "",
    dialCode: "", phone: "", waIdentique: true, waDialCode: "", waPhone: "",
  });
  const [agence, setAgence] = useState({
    nom_agence: "", code_agence: "", code_pays: "", commune_id: "",
    adresse: "", latitude: "", longitude: "",
  });

  const majAdmin = (champ, valeur) => setAdmin((p) => ({ ...p, [champ]: valeur }));
  const majAgence = (champ, valeur) => setAgence((p) => ({ ...p, [champ]: valeur }));

  // Pays disposant d'un backoffice actif : seuls pays acceptés par le backend.
  const [pays, setPays] = useState([]);
  useEffect(() => {
    agenciesApi.listPaysDisponibles().then((res) => {
      if (!res.success) return;
      setPays(res.data.map((p) => ({ id: p.code_pays, label: p.nom })));
      if (res.data.length === 1) majAgence("code_pays", res.data[0].code_pays);
    });
  }, []);

  const [communes, setCommunes] = useState([]);
  useEffect(() => {
    setCommunes([]);
    if (!agence.code_pays) return;
    communesApi.getCommunesByPays(agence.code_pays).then((res) => {
      if (res.success) setCommunes(res.data || []);
    });
  }, [agence.code_pays]);

  const [gpsEnCours, setGpsEnCours] = useState(false);
  const [gpsManuel, setGpsManuel] = useState(false);
  const localiser = () => {
    if (!navigator.geolocation) {
      setErreur("La géolocalisation n'est pas disponible sur cet appareil. Saisissez les coordonnées.");
      setGpsManuel(true);
      return;
    }
    setGpsEnCours(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setAgence((p) => ({ ...p, latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) }));
        setGpsEnCours(false);
      },
      () => {
        setErreur("Position introuvable. Autorisez la localisation ou saisissez les coordonnées.");
        setGpsEnCours(false);
        setGpsManuel(true);
      }
    );
  };

  const validerEtape1 = (e) => {
    e.preventDefault();
    setErreur("");
    if (!admin.dialCode || !admin.phone) return setErreur("Renseignez votre numéro de téléphone avec l'indicatif.");
    if (!admin.waIdentique && (!admin.waDialCode || !admin.waPhone)) return setErreur("Renseignez votre numéro WhatsApp.");
    if (admin.password.length < 8) return setErreur("Le mot de passe doit contenir au moins 8 caractères.");
    setEtape(2);
  };

  const creerCompte = async (e) => {
    e.preventDefault();
    setErreur("");
    if (!agence.code_pays || !agence.commune_id) return setErreur("Choisissez le pays et la commune de l'agence.");
    if (!agence.latitude || !agence.longitude) return setErreur("Indiquez la position GPS de l'agence.");

    const telephone = joinPhoneNumber(admin.dialCode, admin.phone);
    const whatsapp = admin.waIdentique ? telephone : joinPhoneNumber(admin.waDialCode, admin.waPhone);

    setEnvoi(true);
    const res = await authApi.registerAgence({
      nom: admin.nom,
      prenoms: admin.prenoms,
      email: admin.email,
      password: admin.password,
      password_confirmation: admin.password,
      indicatif_telephone: admin.dialCode,
      telephone: admin.phone,
      whatsapp_number: whatsapp,
      // Contacts de l'agence = ceux de l'admin, modifiables ensuite dans le profil.
      entite: {
        ...agence,
        telephone,
        whatsapp,
        email: admin.email,
        latitude: parseFloat(agence.latitude),
        longitude: parseFloat(agence.longitude),
      },
    });
    setEnvoi(false);

    if (res.success) {
      setEtape(3);
      return;
    }
    setErreur(res.message);
    if (Object.keys(res.errors).some((k) => CHAMPS_ADMIN.includes(k))) setEtape(1);
  };

  // Email vérifié : connexion directe avec les identifiants déjà saisis.
  const apresVerification = async () => {
    const res = await login({ email: admin.email, password: admin.password, type: "agence" });
    navigate(res.success ? "/dashboard" : "/connexion", { replace: true });
  };

  const aside = (
    <>
      <h1 className="text-3xl font-bold leading-tight mb-3">Ouvrez votre agence sur Tour Shop</h1>
      <p className="text-white/70 mb-10 max-w-sm">
        Deux étapes, quelques minutes. Horaires, photos et moyens de paiement se complètent ensuite depuis votre profil.
      </p>
      <SuiviEtapes etape={etape} />
    </>
  );

  return (
    <AuthLayout aside={aside}>
      {/* Progression mobile */}
      <div className="lg:hidden flex gap-1.5 mb-6">
        {ETAPES.map((e, i) => (
          <span key={e.titre} className={`h-1 flex-1 rounded-full ${etape > i ? "bg-blue-600" : "bg-slate-200"}`} />
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
        Étape {etape} sur {ETAPES.length}
      </p>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">
        {etape === 1 ? "Créez votre compte" : etape === 2 ? "Présentez votre agence" : "Vérifiez votre email"}
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        {etape === 1 && "Ce compte administre l'agence et ses agents."}
        {etape === 2 && "Ces informations permettent aux clients de vous trouver."}
        {etape === 3 && `Saisissez le code envoyé à ${admin.email}.`}
      </p>

      {erreur && etape !== 3 && (
        <div role="alert" className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
          {erreur}
        </div>
      )}

      {etape === 1 && (
        <form onSubmit={validerEtape1} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom" className={LABEL}>Nom</label>
              <input id="nom" required autoComplete="family-name" value={admin.nom} onChange={(e) => majAdmin("nom", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label htmlFor="prenoms" className={LABEL}>Prénom</label>
              <input id="prenoms" required autoComplete="given-name" value={admin.prenoms} onChange={(e) => majAdmin("prenoms", e.target.value)} className={INPUT} />
            </div>
          </div>
          <div>
            <label htmlFor="email" className={LABEL}>Email</label>
            <input id="email" type="email" required autoComplete="email" value={admin.email} onChange={(e) => majAdmin("email", e.target.value)} className={INPUT} placeholder="vous@exemple.com" />
          </div>
          <div>
            <label className={LABEL}>Téléphone</label>
            <PhoneInput
              dialCode={admin.dialCode}
              localNumber={admin.phone}
              onDialCodeChange={(v) => majAdmin("dialCode", v)}
              onLocalNumberChange={(v) => majAdmin("phone", v)}
              inputClassName={INPUT}
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={admin.waIdentique} onChange={(e) => majAdmin("waIdentique", e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              Ce numéro est aussi mon WhatsApp
            </label>
          </div>
          {!admin.waIdentique && (
            <div>
              <label className={LABEL}>WhatsApp</label>
              <PhoneInput
                dialCode={admin.waDialCode}
                localNumber={admin.waPhone}
                onDialCodeChange={(v) => majAdmin("waDialCode", v)}
                onLocalNumberChange={(v) => majAdmin("waPhone", v)}
                inputClassName={INPUT}
              />
            </div>
          )}
          <div>
            <label htmlFor="password" className={LABEL}>Mot de passe</label>
            <div className="relative">
              <input
                id="password"
                type={voirMdp ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={admin.password}
                onChange={(e) => majAdmin("password", e.target.value)}
                className={`${INPUT} pr-11`}
                placeholder="8 caractères minimum"
              />
              <button type="button" onClick={() => setVoirMdp((v) => !v)} aria-label={voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600">
                {voirMdp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
            Continuer
          </button>
        </form>
      )}

      {etape === 2 && (
        <form onSubmit={creerCompte} className="space-y-4">
          <div>
            <label htmlFor="nom_agence" className={LABEL}>Nom de l'agence</label>
            <input id="nom_agence" required value={agence.nom_agence} onChange={(e) => majAgence("nom_agence", e.target.value)} className={INPUT} placeholder="Ex : Tour Shop Cocody" />
          </div>
          <div>
            <label htmlFor="code_agence" className={LABEL}>
              Code agence <span className="font-normal text-slate-400">(définitif)</span>
            </label>
            <input id="code_agence" required minLength={3} maxLength={20} value={agence.code_agence} onChange={(e) => majAgence("code_agence", e.target.value.toUpperCase())} className={INPUT} placeholder="Ex : ABJ-C01" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Pays</label>
              <SearchableDropdown
                options={pays}
                value={agence.code_pays}
                onSelect={(opt) => setAgence((p) => ({ ...p, code_pays: opt.id, commune_id: "" }))}
                placeholder="Choisir"
              />
            </div>
            <div>
              <label className={LABEL}>Commune</label>
              <SearchableDropdown
                options={communes.map((c) => ({ id: String(c.id), label: c.nom }))}
                value={String(agence.commune_id)}
                onSelect={(opt) => majAgence("commune_id", opt.id)}
                placeholder={agence.code_pays ? "Choisir" : "Pays d'abord"}
              />
            </div>
          </div>
          <div>
            <label htmlFor="adresse" className={LABEL}>Adresse</label>
            <input id="adresse" required value={agence.adresse} onChange={(e) => majAgence("adresse", e.target.value)} className={INPUT} placeholder="Rue, quartier, repère" />
          </div>
          <div>
            <label className={LABEL}>Position GPS</label>
            {gpsManuel ? null : agence.latitude && agence.longitude ? (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                <span className="flex items-center gap-2 text-emerald-700 font-medium">
                  <Check className="w-4 h-4" /> {agence.latitude}, {agence.longitude}
                </span>
                <button type="button" onClick={localiser} className="text-emerald-700 hover:underline">Actualiser</button>
              </div>
            ) : (
              <button type="button" onClick={localiser} disabled={gpsEnCours} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-blue-300 bg-blue-50/50 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60">
                <MapPin className="w-4 h-4" /> {gpsEnCours ? "Localisation…" : "Utiliser ma position actuelle"}
              </button>
            )}
            {gpsManuel && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <input inputMode="decimal" value={agence.latitude} onChange={(e) => majAgence("latitude", e.target.value)} className={INPUT} placeholder="Latitude" aria-label="Latitude" />
                <input inputMode="decimal" value={agence.longitude} onChange={(e) => majAgence("longitude", e.target.value)} className={INPUT} placeholder="Longitude" aria-label="Longitude" />
              </div>
            )}
            <p className="mt-1.5 text-xs text-slate-400">
              Faites-le depuis l'agence pour une position exacte.{" "}
              {!gpsManuel && (
                <button type="button" onClick={() => setGpsManuel(true)} className="text-blue-700 hover:underline">Saisir à la main</button>
              )}
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setErreur(""); setEtape(1); }} className="px-5 py-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Retour
            </button>
            <button type="submit" disabled={envoi} className="flex-1 py-3 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60">
              {envoi ? "Création…" : "Créer mon agence"}
            </button>
          </div>
        </form>
      )}

      {etape === 3 && <VerifyEmailForm email={admin.email} onSuccess={apresVerification} />}

      {etape !== 3 && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà inscrit ?{" "}
          <Link to="/connexion" className="font-medium text-blue-700 hover:text-blue-800">Se connecter</Link>
        </p>
      )}
    </AuthLayout>
  );
};

export default Inscription;
