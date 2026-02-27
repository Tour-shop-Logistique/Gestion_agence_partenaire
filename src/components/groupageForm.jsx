import React, { useState, useEffect } from "react";
import { useTarifs } from "../hooks/useTarifs";
import {
  XMarkIcon,
  InformationCircleIcon,
  MapPinIcon,
  CheckIcon,
  TrashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const AddAgencyTarifModal = ({ show, onClose, editingTarif, selectedBaseRate }) => {
  const {
    groupageTarifs,
    createTarifGroupage,
    updateTarifGroupage,
    deleteTarifGroupage,
    isSaving,
    error: apiError,
    fetchTarifGroupageAgence,
    clearMessage
  } = useTarifs();

  const [tarifData, setTarifData] = useState(null);
  const [localError, setLocalError] = useState("");
  const [selectedTarifId, setSelectedTarifId] = useState("");

  useEffect(() => {
    if (editingTarif) {
      setTarifData({
        id: editingTarif.id,
        categoryName: editingTarif.category?.nom || (editingTarif.type_expedition === 'groupage_afrique' ? 'Expédition Afrique' : (editingTarif.type_expedition === 'groupage_ca' ? 'Expédition CA' : 'Général')),
        pays: editingTarif.pays,
        mode: editingTarif.mode,
        ligne: editingTarif.ligne,
        montant_base: editingTarif.montant_base,
        pourcentage_prestation: Number(editingTarif.pourcentage_prestation) || 0,
        montant_prestation: editingTarif.montant_prestation,
        montant_expedition: editingTarif.montant_expedition,
      });
      setSelectedTarifId(editingTarif.tarif_groupage_id || "");
    } else if (selectedBaseRate) {
      const base = Number(selectedBaseRate.montant_base);
      const pct = Number(selectedBaseRate.pourcentage_prestation);
      const prestation = Number(selectedBaseRate.montant_prestation);
      const expedition = Number(selectedBaseRate.montant_expedition);

      setTarifData({
        tarif_groupage_id: selectedBaseRate.id,
        categoryName: selectedBaseRate.category?.nom || (selectedBaseRate.type_expedition === 'groupage_afrique' ? 'Expédition Afrique' : (selectedBaseRate.type_expedition === 'groupage_ca' ? 'Expédition CA' : 'Général')),
        pays: selectedBaseRate.pays,
        mode: selectedBaseRate.mode,
        ligne: selectedBaseRate.ligne,
        montant_base: base,
        pourcentage_prestation: pct,
        montant_prestation: prestation,
        montant_expedition: expedition,
      });
      setSelectedTarifId(selectedBaseRate.id);
    } else {
      setTarifData(null);
      setSelectedTarifId("");
    }
  }, [editingTarif, selectedBaseRate]);

  useEffect(() => {
    if (!selectedTarifId || editingTarif || selectedBaseRate) return;
    const baseRate = groupageTarifs.find((t) => t.id === selectedTarifId);
    if (!baseRate) return;
    const base = Number(baseRate.montant_base);
    const pct = Number(baseRate.pourcentage_prestation);
    setTarifData({
      tarif_groupage_id: baseRate.id,
      categoryName: baseRate.category?.nom || (baseRate.type_expedition === 'groupage_afrique' ? 'Expédition Afrique' : (baseRate.type_expedition === 'groupage_ca' ? 'Expédition CA' : 'Général')),
      pays: baseRate.pays,
      mode: baseRate.mode,
      ligne: baseRate.ligne,
      montant_base: base,
      pourcentage_prestation: pct,
      montant_prestation: parseFloat(((base * pct) / 100).toFixed(2)),
      montant_expedition: parseFloat((base + (base * pct) / 100).toFixed(2)),
    });
  }, [selectedTarifId, groupageTarifs, editingTarif, selectedBaseRate]);

  const handlePercentageChange = (value) => {
    if (!tarifData) return;
    const pct = value === "" ? "" : Number(value);
    const pctNum = pct === "" ? 0 : pct;
    const prestation = parseFloat(((tarifData.montant_base * pctNum) / 100).toFixed(2));
    const total = parseFloat((tarifData.montant_base + prestation).toFixed(2));
    setTarifData({
      ...tarifData,
      pourcentage_prestation: pct,
      montant_prestation: prestation,
      montant_expedition: total,
    });
  };

  const handleClose = () => {
    setLocalError("");
    setSelectedTarifId("");
    clearMessage();
    onClose();
  };

  const handleSave = async () => {
    if (!tarifData && !editingTarif?.delete) return;
    setLocalError("");
    try {
      let result;
      if (editingTarif) {
        if (editingTarif.delete) {
          result = await deleteTarifGroupage(editingTarif.id);
        } else {
          result = await updateTarifGroupage(editingTarif.id, {
            pourcentage_prestation: Number(tarifData.pourcentage_prestation)
          });
        }
      } else {
        if (!tarifData.tarif_groupage_id) {
          setLocalError("Veuillez sélectionner un tarif de base");
          return;
        }
        result = await createTarifGroupage({
          tarif_groupage_id: tarifData.tarif_groupage_id,
          pourcentage_prestation: Number(tarifData.pourcentage_prestation)
        });
      }
      if (result && result.success !== false) {
        await fetchTarifGroupageAgence(true);
        handleClose();
      }
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    }
  };

  if (!show) return null;
  const errorToShow = localError || apiError;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={handleClose}></div>

        <div className="relative inline-block w-full max-w-xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all">
          {/* Header */}
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${editingTarif?.delete ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {editingTarif?.delete ? <TrashIcon className="w-6 h-6" /> : <InformationCircleIcon className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {editingTarif ? (editingTarif.delete ? "Suppression du tarif" : "Modification du tarif") : "Ajout tarif agence"}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {editingTarif?.delete ? "Confirmez-vous le retrait de ce tarif ?" : "Définissez votre marge de prestation"}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            {errorToShow && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-xs font-bold">
                {errorToShow}
              </div>
            )}

            {!editingTarif && !selectedBaseRate && (
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Modèle d'expédition</label>
                <select
                  className="w-full px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={selectedTarifId}
                  onChange={(e) => setSelectedTarifId(e.target.value)}
                >
                  <option value="">-- Sélectionner un modèle --</option>
                  {groupageTarifs.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.type_expedition?.replace('groupage_', '').toUpperCase()}] {t.category?.nom || t.pays} - {t.mode}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {tarifData && !editingTarif?.delete && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-indigo-600 mb-1">
                        <MapPinIcon className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{tarifData.pays}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{tarifData.categoryName}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{tarifData.mode} {tarifData.ligne ? `(${tarifData.ligne})` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Base Modèle</p>
                      <p className="text-sm font-black text-slate-900">{tarifData.montant_base?.toLocaleString()} <span className="text-[10px] text-slate-400">FCFA</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Prestation (%)</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          className="w-full px-3 py-2 text-sm font-black text-indigo-600 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                          value={tarifData.pourcentage_prestation}
                          onChange={(e) => handlePercentageChange(e.target.value)}
                        />
                        <span className="ml-2 font-black text-slate-400">%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Tarif Final Agence</p>
                      <div className="flex items-baseline justify-end space-x-1">
                        <span className="text-2xl font-black text-slate-900">{tarifData.montant_expedition?.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editingTarif?.delete && (
              <p className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                L'indice et la zone <span className="font-black text-slate-900">{editingTarif.mode}</span> seront retirés de votre catalogue de prix. Cette action est irréversible.
              </p>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button onClick={handleClose} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || (!tarifData && !editingTarif?.delete)}
              className={`inline-flex items-center px-6 py-2 rounded-lg text-sm font-black text-white shadow-sm transition-all active:scale-95 ${editingTarif?.delete ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-950 hover:bg-slate-800'
                } disabled:bg-slate-300 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {editingTarif?.delete ? <TrashIcon className="w-4 h-4 mr-2" /> : <CheckIcon className="w-4 h-4 mr-2" />}
                  {editingTarif?.delete ? "Supprimer définitivement" : "Confirmer le tarif"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAgencyTarifModal;
