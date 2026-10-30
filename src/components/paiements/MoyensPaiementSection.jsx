import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import {
  fetchMoyensPaiement,
  createMoyenPaiement,
  updateMoyenPaiement,
  deleteMoyenPaiement,
} from "../../store/slices/paiementsSlice";
import Switch from "../common/Switch";
import { toast } from "../../utils/toast";

/**
 * Les clients voient ces coordonnées dans leur application pour payer à
 * distance. Le paiement lui-même se fait hors plateforme : le client
 * envoie l'argent sur l'un de ces numéros, puis dépose une preuve que
 * l'agence confirme depuis le détail de l'expédition.
 *
 * Section autonome : chaque moyen s'enregistre immédiatement, indépendamment
 * du formulaire de profil.
 */

// Types génériques : l'app sert plusieurs pays, l'opérateur (Wave, Orange
// Money, M-Pesa…) est saisi librement dans le libellé.
const FOURNISSEURS = [
  { key: "mobile_money", label: "Mobile money", methode: "mobile_money", bg: "#f97316", fg: "#ffffff" },
  { key: "bank_transfer", label: "Virement bancaire", methode: "bank_transfer", bg: "#3b82f6", fg: "#ffffff" },
  { key: "cash", label: "Espèces", methode: "cash", bg: "#10b981", fg: "#ffffff" },
  { key: "other", label: "Autre", methode: "other", bg: "#a855f7", fg: "#ffffff" },
];

const LIBELLES_NUMERO = {
  mobile_money: {
    label: "Numéro de téléphone", placeholder: "Avec l'indicatif du pays",
    libelle: "Opérateur", exemple: "Ex : Wave, Orange Money, M-Pesa…",
  },
  bank_transfer: {
    label: "IBAN ou numéro de compte", placeholder: "IBAN / RIB",
    libelle: "Banque et titulaire", exemple: "Ex : Ecobank, au nom de Soma Xpress",
  },
  cash: {
    label: "Où payer en espèces", placeholder: "Au guichet de l'agence",
    libelle: "Précision", exemple: "Ex : du lundi au samedi",
  },
  other: {
    label: "Référence", placeholder: "Coordonnées de paiement",
    libelle: "Nom du moyen", exemple: "Ex : PayPal",
  },
};

// Les anciens moyens de type « carte » s'affichent comme « Autre ».
const fournisseurDe = (moyen) =>
  FOURNISSEURS.find((f) => f.key === moyen.methode) || FOURNISSEURS[FOURNISSEURS.length - 1];

const Pastille = ({ f, size = "md" }) => (
  <span
    className={`inline-flex items-center justify-center rounded-xl font-black shrink-0 ${
      size === "sm" ? "w-8 h-8 text-[11px]" : "w-11 h-11 text-sm"
    }`}
    style={{ background: f.bg, color: f.fg }}
    aria-hidden="true"
  >
    {f.label.replace(/^Autre /, "").slice(0, 2).toUpperCase()}
  </span>
);

const FORM_VIDE = { fournisseur: "mobile_money", numero: "", precision: "" };

const MoyensPaiementSection = ({ canEdit = true }) => {
  const dispatch = useDispatch();
  const { moyensPaiement, moyensStatus, isSaving } = useSelector((state) => state.paiements);

  const [formOuvert, setFormOuvert] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (moyensStatus === "idle") dispatch(fetchMoyensPaiement());
  }, [dispatch, moyensStatus]);

  const f = FOURNISSEURS.find((x) => x.key === form.fournisseur);
  const champNumero = LIBELLES_NUMERO[f.methode];

  const fermerForm = () => {
    setForm(FORM_VIDE);
    setFormOuvert(false);
    setEditingId(null);
  };

  const ouvrirAjout = () => {
    setEditingId(null);
    setForm(FORM_VIDE);
    setConfirmDeleteId(null);
    setFormOuvert(true);
  };

  const ouvrirEdition = (moyen) => {
    const fm = fournisseurDe(moyen);
    setEditingId(moyen.id);
    setConfirmDeleteId(null);
    setForm({ fournisseur: fm.key, numero: moyen.numero_destinataire, precision: moyen.libelle || "" });
    setFormOuvert(true);
  };

  const enregistrer = async () => {
    if (!form.numero.trim()) return;
    const data = {
      methode: f.methode,
      numero_destinataire: form.numero.trim(),
      libelle: form.precision.trim() || null,
    };
    const result = await dispatch(
      editingId ? updateMoyenPaiement({ id: editingId, data }) : createMoyenPaiement(data)
    );
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(editingId ? "Moyen de paiement modifié." : "Moyen de paiement ajouté.");
      fermerForm();
    } else {
      toast.error(result.payload || "Enregistrement impossible.");
    }
  };

  const supprimer = async (id) => {
    setDeletingId(id);
    const result = await dispatch(deleteMoyenPaiement(id));
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (result.meta.requestStatus === "fulfilled") toast.success("Moyen de paiement supprimé.");
    else toast.error(result.payload || "Suppression impossible.");
  };

  const basculerVisibilite = async (moyen) => {
    const result = await dispatch(updateMoyenPaiement({ id: moyen.id, data: { actif: !moyen.actif } }));
    if (result.meta.requestStatus !== "fulfilled") toast.error(result.payload || "Modification impossible.");
  };

  const copier = (texte) => {
    navigator.clipboard?.writeText(texte).then(() => toast.success("Copié."));
  };

  const input =
    "w-full h-12 px-3.5 text-[15px] text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005566]/25 focus:border-[#005566] transition placeholder:text-slate-400";

  useEffect(() => {
    if (!formOuvert) return;
    const onKey = (e) => { if (e.key === "Escape" && !isSaving) fermerForm(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [formOuvert, isSaving]);

  /* ── Modal d'ajout / modification ── */
  const formulaire = formOuvert && createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-sm sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !isSaving) fermerForm(); }}
    >
    <form
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-moyen-paiement"
      onSubmit={(e) => { e.preventDefault(); enregistrer(); }}
      className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Pastille f={f} />
          <div>
            <p id="titre-moyen-paiement" className="text-base font-bold text-slate-900">
              {editingId ? "Modifier le moyen de paiement" : "Nouveau moyen de paiement"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Choisissez le type, puis indiquez les coordonnées.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={fermerForm}
          className="p-2 -m-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Fermer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type de paiement">
        {FOURNISSEURS.map((x) => {
          const actif = x.key === form.fournisseur;
          return (
            <button
              key={x.key}
              type="button"
              role="radio"
              aria-checked={actif}
              onClick={() => setForm((p) => ({ ...p, fournisseur: x.key }))}
              className={`flex items-center gap-2.5 p-2 pr-3 rounded-xl border-2 text-left transition ${
                actif
                  ? "border-[#005566] bg-white shadow-sm"
                  : "border-transparent bg-white/70 hover:bg-white hover:border-slate-200"
              }`}
            >
              <Pastille f={x} size="sm" />
              <span className={`text-xs font-semibold leading-tight ${actif ? "text-slate-900" : "text-slate-600"}`}>
                {x.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">{champNumero.label}</span>
          <input
            type="text"
            inputMode={f.methode === "mobile_money" ? "tel" : "text"}
            value={form.numero}
            onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))}
            placeholder={champNumero.placeholder}
            className={`${input} font-semibold tabular-nums`}
            autoFocus
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            {champNumero.libelle} <span className="font-normal text-slate-400">(optionnel)</span>
          </span>
          <input
            type="text"
            value={form.precision}
            onChange={(e) => setForm((p) => ({ ...p, precision: e.target.value }))}
            placeholder={champNumero.exemple}
            maxLength={100}
            className={input}
          />
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
        <button
          type="button"
          onClick={fermerForm}
          className="h-11 px-5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSaving || !form.numero.trim()}
          className="h-11 px-5 inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#005566] hover:bg-[#00434f] disabled:bg-slate-300 rounded-xl transition"
        >
          {isSaving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
          {editingId ? "Enregistrer" : "Ajouter ce moyen"}
        </button>
      </div>
      {!editingId && (
        <p className="text-xs text-slate-500 text-center sm:text-right -mt-2">Il sera visible par vos clients dès l'ajout.</p>
      )}
    </form>
    </div>,
    document.body
  );

  if (moyensStatus === "loading" && moyensPaiement.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-400">
        <ArrowPathIcon className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  const aucunVisible = !moyensPaiement.some((m) => m.actif);

  return (
    <div className="space-y-4">
      {moyensPaiement.length > 0 && aucunVisible && (
        <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
          Aucun moyen n'est visible : vos clients ne peuvent pas encore payer à distance.
        </p>
      )}

      {formulaire}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {moyensPaiement.map((moyen) => {
          const fm = fournisseurDe(moyen);
          return (
            <article
              key={moyen.id}
              className={`relative overflow-hidden rounded-2xl border transition ${
                moyen.actif ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-dashed border-slate-300"
              }`}
            >
              <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: moyen.actif ? fm.bg : "#cbd5e1" }} />
              <div className={`flex items-start gap-3 p-4 pl-5 ${moyen.actif ? "" : "opacity-60"}`}>
                <Pastille f={fm} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 truncate">
                    {fm.label}
                    {moyen.libelle && <span className="normal-case tracking-normal font-semibold text-slate-700"> · {moyen.libelle}</span>}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-lg font-extrabold text-slate-900 tabular-nums break-all">{moyen.numero_destinataire}</p>
                    <button
                      type="button"
                      onClick={() => copier(moyen.numero_destinataire)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#005566] hover:bg-cyan-50 transition shrink-0"
                      aria-label="Copier"
                      title="Copier"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 px-4 pl-5 py-2.5 border-t border-slate-100 bg-slate-50/60">
                {canEdit ? (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <Switch
                      checked={!!moyen.actif}
                      onChange={() => basculerVisibilite(moyen)}
                      label="Visible par les clients"
                    />
                    <span className={`text-xs font-semibold ${moyen.actif ? "text-emerald-700" : "text-slate-500"}`}>
                      {moyen.actif ? "Visible par les clients" : "Masqué aux clients"}
                    </span>
                  </label>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${moyen.actif ? "text-emerald-700" : "text-slate-500"}`}>
                    {!moyen.actif && <EyeSlashIcon className="w-4 h-4" />}
                    {moyen.actif ? "Visible par les clients" : "Masqué aux clients"}
                  </span>
                )}

                {canEdit && (
                  <div className="flex items-center gap-1 shrink-0">
                    {confirmDeleteId === moyen.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          Garder
                        </button>
                        <button
                          type="button"
                          onClick={() => supprimer(moyen.id)}
                          disabled={deletingId === moyen.id}
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-60"
                        >
                          {deletingId === moyen.id && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
                          Supprimer
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => ouvrirEdition(moyen)}
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[#005566] hover:bg-cyan-50 rounded-lg transition"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Modifier</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(moyen.id)}
                          className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          aria-label="Supprimer"
                          title="Supprimer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {canEdit && (
          <button
            type="button"
            onClick={ouvrirAjout}
            className={`group flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#005566] hover:bg-cyan-50/50 text-slate-500 hover:text-[#005566] transition ${
              moyensPaiement.length === 0 ? "md:col-span-2 py-10 flex-col" : "min-h-[128px]"
            }`}
          >
            <span className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#005566] group-hover:text-white flex items-center justify-center transition">
              <PlusIcon className="w-5 h-5" />
            </span>
            <span className="text-sm font-bold">
              {moyensPaiement.length === 0 ? "Ajouter votre premier moyen de paiement" : "Ajouter un moyen de paiement"}
            </span>
          </button>
        )}
      </div>

      {!canEdit && moyensPaiement.length === 0 && (
        <p className="text-sm text-slate-500 py-6 text-center">Aucun moyen de paiement enregistré.</p>
      )}
    </div>
  );
};

export default MoyensPaiementSection;
