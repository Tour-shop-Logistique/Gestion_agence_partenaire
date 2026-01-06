import React, { useState, useEffect } from "react";
import { useTarifs } from "../hooks/useTarifs";

const AddAgencyTarifModal = ({ show, onClose, editingTarif }) => {
 const { groupageTarifs, createTarifGroupage, updateTarifGroupage } = useTarifs();

  const [tarifData, setTarifData] = useState(null);
  const [tarifGroupageData, setTarifGroupageData] = useState(null);

  const [selectedTarifId, setSelectedTarifId] = useState("");

  // Charger les données du tarif sélectionné
  useEffect(() => {
    if (editingTarif) {

      // 🟩 MODE MODIFICATION
      const clonedModes = editingTarif.prix_modes.map((m) => ({
        ...m,
        pourcentage_prestation: Number(m.pourcentage_prestation),
      }));

      setTarifData({
        id: editingTarif.id,
        category_id: editingTarif.category_id,
        tarif_minimum: editingTarif.tarif_minimum,
        prix_modes: clonedModes,
      });

    } else {
      // 🟩 MODE CREATION : vide
     setTarifData({
  category_id: "",
  tarif_minimum: "",
  prix_modes: []
});

    }
  }, [editingTarif]);

useEffect(() => {
  if (!selectedTarifId || editingTarif) return;

  const tarif = groupageTarifs.find((t) => t.id === selectedTarifId);
  if (!tarif) return;

  const clonedModes = tarif.prix_modes.map((mode) => {
    const base = Number(mode.montant_base);
    const pct = Number(mode.pourcentage_prestation);

    const prestation = (base * pct) / 100;
    const total = base + prestation;

    return {
      mode: mode.mode,
      montant_base: base,
      pourcentage_prestation: pct,
      montant_prestation: prestation,
      montant_expedition: total,
    };
  });

  setTarifData({
    id : tarif.id,
    category_id: tarif.category_id,
    tarif_minimum: tarif.tarif_minimum,
    prix_modes: clonedModes,
  });
}, [selectedTarifId, editingTarif]);

  const handlePercentageChange = (index, value) => {
    if (!tarifData) return;

    const newModes = [...tarifData.prix_modes];
    const pct = Number(value);

    newModes[index].pourcentage_prestation = pct;

    newModes[index].montant_prestation = parseFloat(
      ((newModes[index].montant_base * pct) / 100).toFixed(2)
    );

    newModes[index].montant_expedition = parseFloat(
      (newModes[index].montant_base + newModes[index].montant_prestation).toFixed(2)
    );

    setTarifData({ ...tarifData, prix_modes: newModes });
  };

  // 🔥 Nettoyer avant envoi → seulement les données nécessaires
  const preparePayload = () => {
    console.log(tarifData,"🛜🛜")
    if (!editingTarif) {
      return {
        tarif_groupage_id: tarifData.id,
      prix_modes: tarifData.prix_modes.map((m) => ({
        mode: m.mode,
        // montant_base: Number(m.montant_base),
      pourcentage_prestation: Number(m.pourcentage_prestation),
    })),
    };
  }else {
    return {
      prix_modes: tarifData.prix_modes.map((m) => ({
        mode: m.mode,
      pourcentage_prestation: Number(m.pourcentage_prestation),
    })),
    };
  }
  }

const handleSave = () => {
  if (!tarifData) return;

  const payload = preparePayload();

  if (editingTarif) {
   
    updateTarifGroupage(editingTarif.id, payload);
     console.log(payload, "edit")
  } else {
    console.log(payload,"🛜🛜 create")
    createTarifGroupage(payload);
  }

  onClose();
};


  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl relative">

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Ajouter un tarif agence
        </h2>

        {/* Select */}
       {!editingTarif && (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-600 mb-2">
      Sélectionner un tarif de base
    </label>
    <select
      className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
      value={selectedTarifId}
      onChange={(e) => setSelectedTarifId(e.target.value)}
    >
      <option value="">-- Choisir un tarif --</option>
      {groupageTarifs.map((t) => (
        <option key={t.id} value={t.id}>
          {t.category?.nom}
        </option>
      ))}
    </select>
  </div>
)}

        {/* Liste des modes */}
        {tarifData && (
          <div className="space-y-4 max-h-80 overflow-auto pr-2">
            {tarifData.prix_modes.map((mode, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border"
              >
                <span className="font-semibold text-gray-800 text-lg min-w-[120px]">
                  {mode.mode}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-24 border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={mode.pourcentage_prestation}
                      onChange={(e) =>
                        handlePercentageChange(idx, e.target.value)
                      }
                    />
                    <span className="text-gray-600">%</span>
                  </div>

                  <span className="text-gray-700 text-sm">
                    Prestation:{" "}
                    <span className="font-medium">{mode.montant_prestation} FCFA</span>
                  </span>

                  <span className="text-gray-700 text-sm">
                    Total:{" "}
                    <span className="font-bold">{mode.montant_expedition} FCFA</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Boutons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAgencyTarifModal;
