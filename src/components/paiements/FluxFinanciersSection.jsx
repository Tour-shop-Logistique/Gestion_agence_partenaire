import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUpRight, ArrowDownLeft, Loader2, Check, Upload, ExternalLink } from "lucide-react";
import { fetchFluxFinanciers, payerFlux } from "../../store/slices/paiementsSlice";
import { getCurrencyLabel } from "../../utils/format";
import { toast } from "../../utils/toast";

/**
 * Règlements entre l'agence et le backoffice. L'agence qui encaisse le
 * client garde sa commission et reverse le reste au backoffice, qui
 * redistribue ensuite la commission de l'autre agence. Les virements se
 * font hors plateforme ; on trace ici ce qui est dû, réglé, puis confirmé.
 *
 * `agenceId` sert à savoir de quel côté du flux on se trouve : un flux
 * sortant est à payer, un flux entrant est à recevoir.
 */

const BADGES_STATUT = {
  du: { label: "À régler", className: "bg-amber-50 text-amber-700 border-amber-200" },
  paye: { label: "Réglé", className: "bg-sky-50 text-sky-700 border-sky-200" },
  confirme: { label: "Confirmé", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const FluxFinanciersSection = ({ agenceId, formatCurrency, canPay = true }) => {
  const dispatch = useDispatch();
  const { flux, fluxStatus, isSaving } = useSelector((state) => state.paiements);

  const [filtreStatut, setFiltreStatut] = useState("");
  const [reglement, setReglement] = useState(null);

  useEffect(() => {
    dispatch(fetchFluxFinanciers(filtreStatut ? { statut: filtreStatut } : {}));
  }, [dispatch, filtreStatut]);

  const totaux = useMemo(() => {
    return flux.reduce(
      (acc, f) => {
        const sortant = f.emetteur_agence_id === agenceId;
        if (f.statut === "du") {
          if (sortant) acc.aRegler += Number(f.montant) || 0;
          else acc.aRecevoir += Number(f.montant) || 0;
        }
        return acc;
      },
      { aRegler: 0, aRecevoir: 0 }
    );
  }, [flux, agenceId]);

  const handlePayer = async () => {
    const { id, notes, referenceTransaction, photo } = reglement;
    const result = await dispatch(payerFlux({ id, notes, referenceTransaction, photo }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Règlement enregistré.");
      setReglement(null);
    } else {
      toast.error(result.payload || "Erreur lors de l'enregistrement.");
    }
  };

  const montant = (value) => (formatCurrency ? formatCurrency(value) : value);

  const inputClasses =
    "w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-tight">
            Règlements avec le backoffice
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
            Virements hors plateforme, tracés ici avec leurs preuves.
          </p>
        </div>

        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-44"
        >
          <option value="">Tous les statuts</option>
          <option value="du">À régler</option>
          <option value="paye">Réglés</option>
          <option value="confirme">Confirmés</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 sm:p-4 rounded-lg border border-slate-200 bg-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
              À reverser au backoffice
            </p>
            <ArrowUpRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-600 opacity-40" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-xl font-bold tabular-nums text-amber-600">
              {montant(totaux.aRegler)}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400">
              {getCurrencyLabel()}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg border border-slate-200 bg-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
              À recevoir du backoffice
            </p>
            <ArrowDownLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600 opacity-40" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-xl font-bold tabular-nums text-emerald-600">
              {montant(totaux.aRecevoir)}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400">
              {getCurrencyLabel()}
            </span>
          </div>
        </div>
      </div>

      {reglement && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <p className="text-xs font-medium text-slate-600">
            Déclarer le règlement de {montant(reglement.montantAffiche)} {getCurrencyLabel()}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Référence (optionnel)
              </label>
              <input
                type="text"
                value={reglement.referenceTransaction}
                onChange={(e) =>
                  setReglement((p) => ({ ...p, referenceTransaction: e.target.value }))
                }
                placeholder="N° de transaction"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Preuve (optionnel)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={(e) => setReglement((p) => ({ ...p, photo: e.target.files?.[0] || null }))}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Notes (optionnel)
            </label>
            <textarea
              value={reglement.notes}
              onChange={(e) => setReglement((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className={inputClasses}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setReglement(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handlePayer}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg transition-colors"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Confirmer le règlement
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {fluxStatus === "loading" && flux.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : flux.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">
            Aucun règlement pour le moment. Les flux apparaissent dès qu'une expédition est terminée.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {flux.map((f) => {
              const sortant = f.emetteur_agence_id === agenceId;
              const badge = BADGES_STATUT[f.statut] || BADGES_STATUT.du;
              const preuve = f.preuves_paiement?.[0];

              return (
                <div
                  key={f.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      sortant ? "bg-amber-50" : "bg-emerald-50"
                    }`}
                  >
                    {sortant ? (
                      <ArrowUpRight className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-800">
                        {sortant ? "À reverser au backoffice" : "À recevoir du backoffice"}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {f.expedition?.reference || "—"}
                      {f.commission_retenue > 0 &&
                        ` · commission retenue ${montant(f.commission_retenue)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        sortant ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {montant(f.montant)}
                    </span>

                    {preuve?.photo_path && (
                      <a
                        href={preuve.photo_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Voir la preuve"
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {canPay && sortant && f.statut === "du" && (
                      <button
                        type="button"
                        onClick={() =>
                          setReglement({
                            id: f.id,
                            montantAffiche: f.montant,
                            notes: "",
                            referenceTransaction: "",
                            photo: null,
                          })
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Régler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FluxFinanciersSection;
