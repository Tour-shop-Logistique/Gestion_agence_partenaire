import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BanknotesIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  fetchMoyensPaiement,
  createMoyenPaiement,
  updateMoyenPaiement,
  deleteMoyenPaiement,
} from "../../store/slices/paiementsSlice";

/**
 * Les clients voient ces coordonnées dans leur application pour payer à
 * distance. Le paiement lui-même se fait hors plateforme : le client
 * envoie l'argent sur l'un de ces numéros, puis dépose une preuve que
 * l'agence confirme depuis le détail de l'expédition.
 *
 * Section autonome : son propre cycle d'édition/sauvegarde, indépendant
 * du formulaire de profil qui enregistre tout en un seul submit.
 */

const METHODES = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Virement bancaire" },
  { value: "cash", label: "Espèces" },
  { value: "card", label: "Carte bancaire" },
  { value: "other", label: "Autre" },
];

const labelMethode = (value) =>
  METHODES.find((m) => m.value === value)?.label || value;

const FORM_VIDE = { methode: "mobile_money", numero_destinataire: "", libelle: "" };

const MoyensPaiementSection = ({ canEdit = true }) => {
  const dispatch = useDispatch();
  const { moyensPaiement, moyensStatus, isSaving } = useSelector((state) => state.paiements);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (moyensStatus === "idle") dispatch(fetchMoyensPaiement());
  }, [dispatch, moyensStatus]);

  const resetForm = () => {
    setForm(FORM_VIDE);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.numero_destinataire.trim()) return;

    const action = editingId
      ? updateMoyenPaiement({ id: editingId, data: form })
      : createMoyenPaiement(form);

    const result = await dispatch(action);
    if (result.meta.requestStatus === "fulfilled") resetForm();
  };

  const startEdit = (moyen) => {
    setEditingId(moyen.id);
    setIsAdding(false);
    setForm({
      methode: moyen.methode,
      numero_destinataire: moyen.numero_destinataire,
      libelle: moyen.libelle || "",
    });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await dispatch(deleteMoyenPaiement(id));
    setDeletingId(null);
  };

  const toggleActif = (moyen) =>
    dispatch(updateMoyenPaiement({ id: moyen.id, data: { actif: !moyen.actif } }));

  const inputClasses =
    "w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors placeholder:text-slate-300";

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <BanknotesIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-800">Moyens de paiement</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Coordonnées que vos clients verront pour payer à distance.
            </p>
          </div>
        </div>

        {canEdit && !isAdding && !editingId && (
          <button
            type="button"
            onClick={() => { setIsAdding(true); setForm(FORM_VIDE); }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Méthode</label>
              <select
                value={form.methode}
                onChange={(e) => setForm((p) => ({ ...p, methode: e.target.value }))}
                className={inputClasses}
              >
                {METHODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Numéro / référence
              </label>
              <input
                type="text"
                value={form.numero_destinataire}
                onChange={(e) => setForm((p) => ({ ...p, numero_destinataire: e.target.value }))}
                placeholder="Ex : 07 00 00 00 00"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Libellé (optionnel)
            </label>
            <input
              type="text"
              value={form.libelle}
              onChange={(e) => setForm((p) => ({ ...p, libelle: e.target.value }))}
              placeholder="Ex : Orange Money — Compte principal"
              className={inputClasses}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || !form.numero_destinataire.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg transition-colors"
            >
              {isSaving
                ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                : <CheckIcon className="w-4 h-4" />}
              {editingId ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {moyensStatus === "loading" && moyensPaiement.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <ArrowPathIcon className="w-5 h-5 animate-spin" />
        </div>
      ) : moyensPaiement.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">
          Aucun moyen de paiement enregistré. Vos clients ne peuvent pas encore payer à distance.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {moyensPaiement.map((moyen) => (
            <div
              key={moyen.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">
                    {labelMethode(moyen.methode)}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    moyen.actif
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {moyen.actif ? "Visible" : "Masqué"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
                  {moyen.numero_destinataire}
                </p>
                {moyen.libelle && (
                  <p className="text-xs text-slate-400 mt-0.5">{moyen.libelle}</p>
                )}
              </div>

              {canEdit && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleActif(moyen)}
                    title={moyen.actif ? "Masquer aux clients" : "Rendre visible"}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {moyen.actif
                      ? <XMarkIcon className="w-4 h-4" />
                      : <CheckIcon className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(moyen)}
                    title="Modifier"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(moyen.id)}
                    disabled={deletingId === moyen.id}
                    title="Supprimer"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === moyen.id
                      ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      : <TrashIcon className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoyensPaiementSection;
