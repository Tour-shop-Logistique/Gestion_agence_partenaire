import React, { useState, useEffect } from "react";
import { useTarifs } from "../hooks/useTarifs";

const AddAgencyTarifModal = ({ show, onClose, editingTarif, selectedBaseRate }) => {
  const {
    groupageTarifs,
    createTarifGroupage,
    updateTarifGroupage,
    deleteTarifGroupage,
    isSaving,
    error: apiError,
    fetchTarifGroupageAgence
  } = useTarifs();

  const [tarifData, setTarifData] = useState(null);
  const [localError, setLocalError] = useState("");
  const [selectedTarifId, setSelectedTarifId] = useState("");

  // Initialisation des données
  useEffect(() => {
    if (editingTarif) {
      // MODE MODIFICATION (Tarif Agence existant)
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
      // MODE CREATION (Depuis un tarif de base spécifique)
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
      // MODE CREATION (Générique)
      setTarifData(null);
      setSelectedTarifId("");
    }
  }, [editingTarif, selectedBaseRate]);

  // Chargement auto quand on change via le select (si mode générique)
  useEffect(() => {
    if (!selectedTarifId || editingTarif || selectedBaseRate) return;

    const baseRate = groupageTarifs.find((t) => t.id === selectedTarifId);
    if (!baseRate) return;

    const base = Number(baseRate.montant_base);
    const pct = Number(baseRate.pourcentage_prestation);
    const prestation = Number(baseRate.montant_prestation);
    const expedition = Number(baseRate.montant_expedition);

    setTarifData({
      tarif_groupage_id: baseRate.id,
      categoryName: baseRate.category?.nom || (baseRate.type_expedition === 'groupage_afrique' ? 'Expédition Afrique' : (baseRate.type_expedition === 'groupage_ca' ? 'Expédition CA' : 'Général')),
      pays: baseRate.pays,
      mode: baseRate.mode,
      ligne: baseRate.ligne,
      montant_base: base,
      pourcentage_prestation: pct,
      montant_prestation: prestation,
      montant_expedition: expedition,
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

  const handleSave = async () => {
    if (!tarifData && !editingTarif?.delete) return;
    setLocalError("");

    try {
      let result;
      if (editingTarif) {
        // Suppression si demandé
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
        if (!editingTarif?.delete) {
          await fetchTarifGroupageAgence(true);
        }
        onClose();
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
    }
  };

  if (!show) return null;

  const errorToShow = localError || apiError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-500">

        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 hover:bg-gray-100 w-10 h-10 rounded-xl flex items-center justify-center transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-3xl font-black mb-2 text-gray-900">
          {editingTarif ? (editingTarif.delete ? "Supprimer le tarif" : "Modifier le tarif") : "Ajouter un tarif agence"}
        </h2>
        <p className="text-gray-500 font-medium mb-8">
          {editingTarif?.delete ? "Voulez-vous vraiment supprimer ce tarif ?" : "Configurez la marge bénéficiaire pour ce mode d'expédition"}
        </p>

        {errorToShow && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {errorToShow}
          </div>
        )}

        {!editingTarif && !selectedBaseRate && (
          <div className="mb-6">
            <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Choisir un tarif de base</label>
            <select
              className="w-full border-2 border-gray-100 rounded-xl p-4 bg-gray-50 font-bold text-gray-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
              value={selectedTarifId}
              onChange={(e) => setSelectedTarifId(e.target.value)}
            >
              <option value="">-- Sélectionner --</option>
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
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Détails de l'expédition</p>
                  <p className="text-xl font-black text-blue-900">{tarifData.categoryName}</p>
                  <p className="text-sm font-bold text-blue-600">{tarifData.pays} • {tarifData.mode} {tarifData.ligne ? `(${tarifData.ligne})` : ''}</p>
                </div>
                <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
                  <span className="text-[10px] font-black text-blue-600 uppercase">Base: {tarifData.montant_base?.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-blue-100">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Prestation (%)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-full border-2 border-blue-200 rounded-xl p-3 font-black text-blue-600 focus:border-blue-500 outline-none transition-all"
                      value={tarifData.pourcentage_prestation}
                      onChange={(e) => handlePercentageChange(e.target.value)}
                    />
                    <span className="font-bold text-blue-400 text-xl">%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Prix Final</p>
                  <p className="text-4xl font-black text-gray-900 leading-none">
                    {tarifData.montant_expedition?.toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-gray-400 mt-2">FCFA</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-end gap-4">
          <button onClick={onClose} disabled={isSaving} className="px-6 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition-all disabled:opacity-50">Annuler</button>
          <button
            onClick={handleSave}
            disabled={isSaving || (!tarifData && !editingTarif?.delete)}
            className={`px-8 py-3 rounded-2xl text-white font-black shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 ${editingTarif?.delete ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
          >
            {isSaving ? "Traitement..." : (editingTarif?.delete ? "Confirmer la suppression" : "Sauvegarder")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAgencyTarifModal;
