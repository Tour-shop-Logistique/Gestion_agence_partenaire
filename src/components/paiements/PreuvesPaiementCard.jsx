import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, ReceiptText, Check, X, Upload, ExternalLink } from "lucide-react";
import {
  fetchPreuvesExpedition,
  deciderPreuve,
  payerLivreur,
} from "../../store/slices/paiementsSlice";
import { toast } from "../../utils/toast";

/**
 * Preuves de paiement d'une expédition. Le paiement se fait toujours hors
 * plateforme : le client règle sur un des moyens de paiement de l'agence
 * puis dépose sa preuve, que l'agence confirme ou rejette ici. La même
 * carte sert à l'agence pour déclarer le paiement d'un livreur.
 */

const LABELS_OBJET = {
  montant_expedition: "Montant de l'expédition",
  frais_annexes: "Frais annexes",
  frais_enlevement: "Frais d'enlèvement",
  frais_livraison: "Frais de livraison",
  tout_compris: "Tout compris",
  remboursement: "Remboursement",
  autre: "Autre",
};

const LABELS_METHODE = {
  mobile_money: "Mobile Money",
  bank_transfer: "Virement bancaire",
  cash: "Espèces",
  card: "Carte bancaire",
  other: "Autre",
};

const BADGES_STATUT = {
  en_attente: { label: "En attente", className: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmee: { label: "Confirmée", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejetee: { label: "Rejetée", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

const PreuvesPaiementCard = ({ expeditionId, missions = [], formatCurrency, canDecide = true }) => {
  const dispatch = useDispatch();
  const { preuves, preuvesStatus, preuvesExpeditionId, isSaving } = useSelector(
    (state) => state.paiements
  );

  const [rejectingId, setRejectingId] = useState(null);
  const [motifRejet, setMotifRejet] = useState("");
  const [paiementLivreur, setPaiementLivreur] = useState(null);

  useEffect(() => {
    if (expeditionId) dispatch(fetchPreuvesExpedition(expeditionId));
  }, [dispatch, expeditionId]);

  // Les preuves du store peuvent encore appartenir à l'expédition
  // précédemment consultée le temps du chargement.
  const preuvesAffichees = preuvesExpeditionId === expeditionId ? preuves : [];

  const handleConfirmer = async (id) => {
    const result = await dispatch(deciderPreuve({ id, action: "confirmer" }));
    if (result.meta.requestStatus === "fulfilled") toast.success("Paiement confirmé.");
    else toast.error(result.payload || "Erreur lors de la confirmation.");
  };

  const handleRejeter = async () => {
    if (!motifRejet.trim()) return;
    const result = await dispatch(
      deciderPreuve({ id: rejectingId, action: "rejeter", motifRejet })
    );
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Preuve rejetée.");
      setRejectingId(null);
      setMotifRejet("");
    } else {
      toast.error(result.payload || "Erreur lors du rejet.");
    }
  };

  const handlePayerLivreur = async () => {
    const { missionId, montant, methodePaiement, referenceTransaction, photo } = paiementLivreur;
    if (!missionId || !montant || !photo) return;

    const result = await dispatch(
      payerLivreur({ missionId, montant, methodePaiement, referenceTransaction, photo })
    );
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Paiement du livreur enregistré.");
      setPaiementLivreur(null);
      dispatch(fetchPreuvesExpedition(expeditionId));
    } else {
      toast.error(result.payload || "Erreur lors de l'enregistrement.");
    }
  };

  // Seules les missions réellement terminées peuvent être payées.
  const missionsPayables = missions.filter((m) => m.statut === "terminee");

  const inputClasses =
    "w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400";

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-800">Preuves de paiement</h2>
          {preuvesAffichees.length > 0 && (
            <span className="text-xs text-slate-400">({preuvesAffichees.length})</span>
          )}
        </div>

        {canDecide && missionsPayables.length > 0 && !paiementLivreur && (
          <button
            type="button"
            onClick={() =>
              setPaiementLivreur({
                missionId: missionsPayables[0].id,
                montant: missionsPayables[0].montant_final || "",
                methodePaiement: "mobile_money",
                referenceTransaction: "",
                photo: null,
              })
            }
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            Déclarer un paiement livreur
          </button>
        )}
      </div>

      {paiementLivreur && (
        <div className="px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <p className="text-xs font-medium text-slate-600">
            Paiement du livreur — le versement se fait hors plateforme, joignez-en la preuve.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Mission</label>
              <select
                value={paiementLivreur.missionId}
                onChange={(e) => {
                  const mission = missionsPayables.find((m) => m.id === e.target.value);
                  setPaiementLivreur((p) => ({
                    ...p,
                    missionId: e.target.value,
                    montant: mission?.montant_final || p.montant,
                  }));
                }}
                className={inputClasses}
              >
                {missionsPayables.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.type === "enlevement" ? "Enlèvement" : "Livraison"}
                    {m.montant_final ? ` — ${m.montant_final}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Montant versé</label>
              <input
                type="number"
                min="0"
                value={paiementLivreur.montant}
                onChange={(e) => setPaiementLivreur((p) => ({ ...p, montant: e.target.value }))}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Méthode</label>
              <select
                value={paiementLivreur.methodePaiement}
                onChange={(e) =>
                  setPaiementLivreur((p) => ({ ...p, methodePaiement: e.target.value }))
                }
                className={inputClasses}
              >
                {Object.entries(LABELS_METHODE).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Référence (optionnel)
              </label>
              <input
                type="text"
                value={paiementLivreur.referenceTransaction}
                onChange={(e) =>
                  setPaiementLivreur((p) => ({ ...p, referenceTransaction: e.target.value }))
                }
                placeholder="N° de transaction"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Preuve (capture ou reçu)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={(e) =>
                setPaiementLivreur((p) => ({ ...p, photo: e.target.files?.[0] || null }))
              }
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPaiementLivreur(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handlePayerLivreur}
              disabled={isSaving || !paiementLivreur.photo || !paiementLivreur.montant}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg transition-colors"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 py-4">
        {preuvesStatus === "loading" && preuvesAffichees.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : preuvesAffichees.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Aucune preuve de paiement pour cette expédition.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {preuvesAffichees.map((preuve) => {
              const badge = BADGES_STATUT[preuve.statut] || BADGES_STATUT.en_attente;
              const enAttente = preuve.statut === "en_attente";

              return (
                <div key={preuve.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-800">
                          {LABELS_OBJET[preuve.objet_paiement] || preuve.objet_paiement}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-900 mt-1 tabular-nums">
                        {formatCurrency ? formatCurrency(preuve.montant) : preuve.montant}
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        {LABELS_METHODE[preuve.methode_paiement] || preuve.methode_paiement}
                        {preuve.reference_transaction && ` — ${preuve.reference_transaction}`}
                      </p>

                      {preuve.emetteur && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Déposée par {preuve.emetteur.nom} {preuve.emetteur.prenoms || ""}
                          {preuve.emetteur.telephone && ` (${preuve.emetteur.telephone})`}
                        </p>
                      )}

                      {preuve.motif_rejet && (
                        <p className="text-xs text-rose-600 mt-1">Motif : {preuve.motif_rejet}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {preuve.photo_path && (
                        <a
                          href={preuve.photo_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Voir la preuve"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Voir
                        </a>
                      )}

                      {canDecide && enAttente && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleConfirmer(preuve.id)}
                            disabled={isSaving}
                            title="Confirmer la réception du paiement"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Confirmer
                          </button>
                          <button
                            type="button"
                            onClick={() => { setRejectingId(preuve.id); setMotifRejet(""); }}
                            disabled={isSaving}
                            title="Rejeter cette preuve"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Rejeter
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {rejectingId === preuve.id && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-lg space-y-2">
                      <label className="block text-xs font-medium text-rose-700">
                        Motif du rejet (communiqué au client)
                      </label>
                      <textarea
                        value={motifRejet}
                        onChange={(e) => setMotifRejet(e.target.value)}
                        rows={2}
                        placeholder="Ex : montant incomplet, capture illisible…"
                        className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setRejectingId(null); setMotifRejet(""); }}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={handleRejeter}
                          disabled={isSaving || !motifRejet.trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 rounded-lg transition-colors"
                        >
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          Confirmer le rejet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreuvesPaiementCard;
