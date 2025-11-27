import React, { useState, useEffect } from "react";
import { useTarifs } from "../hooks/useTarifs";
import AddAgencyTarifModal from "../components/groupageForm"

const TarifGroupageComponent = () => {
  const [showTarifGroupage, setShowTarifGroupage] = useState(false);
  const [activeTab, setActiveTab] = useState("base");
  const [editingTarif, setEditingTarif] = useState(null);

  const {
    loading,
    error,
    message,

    // Tarifs
    groupageTarifs,
    existingGroupageTarifs,

    // Actions du hook
    fetchTarifsGroupageBase,
    fetchTarifGroupageAgence,
    saveTarif,
    selectIndex,
    updateZonePercentage,
    updateNewTarifZones,
    getCurrentTarif,
  } = useTarifs();

  // Charger les tarifs groupage au montage
  useEffect(() => {
    fetchTarifsGroupageBase();      // tarifs base groupage
    fetchTarifGroupageAgence();     // tarifs agence groupage
  }, []);

const handleNewTarif = () => {
  setEditingTarif(null);      // création
  setShowTarifGroupage(true);
};

const handleEditTarif = (tarif) => {
  setEditingTarif(tarif);     // modification
  setShowTarifGroupage(true);
};

const handleDeleteTarif = (tarif) => {
  setEditingTarif({ ...tarif, delete: true });   // suppression
  setShowTarifGroupage(true);
};


  return (
    <div>

      {/* Section statistiques améliorée */}
      {(groupageTarifs?.length > 0 || existingGroupageTarifs?.length > 0) && (
        <div className="mb-6 sm:mb-8">

          <div className="flex flex-row sm:justify-between sm:items-center gap-3">

            {/* Bloc stats qui prend tout l'espace */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm mx flex-1">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex flex-row sm:items-center gap-4">

                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">
                      Tarifs agence: {existingGroupageTarifs?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">
                      Tarifs de base: {groupageTarifs?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">
                      Total: {(groupageTarifs?.length || 0) + (existingGroupageTarifs?.length || 0)}
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Bouton */}
            <div className="flex items-center">
              <button
                onClick={handleNewTarif}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6"></path>
                </svg>
                Ajouter un tarif
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("succès")
              ? "bg-green-50 border border-green-200 text-green-600"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("agency")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "agency"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tarifs agence ({existingGroupageTarifs?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("base")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "base"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tarifs de base ({groupageTarifs?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
       {loading ? (
  // ---- LOADING ----
  <div className="p-6">
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
        >
          <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
) : activeTab === "agency" && existingGroupageTarifs?.length > 0 ? (

  // ---- LISTE DES TARIFS DE L'AGENCE ----
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-left">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-sm font-semibold text-gray-700">Catégorie</th>
          <th className="px-4 py-3 text-sm font-semibold text-gray-700">Pays</th>
          <th className="px-4 py-3 text-sm font-semibold text-gray-700">Tarif minimum</th>
          <th className="px-4 py-3 text-sm font-semibold text-gray-700">Modes d'expédition</th>
          <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {existingGroupageTarifs.map((tarif) => (
          <tr key={tarif.id} className={`${tarif.actif ? "" : "opacity-60"}`}>
            <td className="px-4 py-3 text-sm text-gray-800">{tarif.category?.nom}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{tarif.pays}</td>
            <td className="px-4 py-3 text-sm text-gray-800">{tarif.tarif_minimum} FCFA</td>
            <td className="px-4 py-3 text-sm">
              <div className="flex flex-wrap gap-2">
                {tarif.prix_modes.map((mode, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {mode.mode}: {mode.montant_base} FCFA ({mode.pourcentage_prestation}%)
                  </span>
                ))}
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-center">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleEditTarif(tarif)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteTarif(tarif)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

) : activeTab === "base" && groupageTarifs?.length > 0 ? (

  // ---- LISTE DES TARIFS DE BASE ----
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-left">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-sm font-semibold text-gray-700">Catégorie</th>
          <th className="px-4 py-3 text-sm font-semibold text-gray-700">Pays</th>
          <th className="px-4 py-3 text-sm font-semibold text-gray-700">Tarif minimum</th>
          <th className="px-4 py-3 text-sm font-semibold text-gray-700">Modes d'expédition</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {groupageTarifs.map((tarif) => (
          <tr key={tarif.id} className={`${tarif.actif ? "" : "opacity-60"}`}>
            <td className="px-4 py-3 text-sm text-gray-800">{tarif.category?.nom}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{tarif.pays}</td>
            <td className="px-4 py-3 text-sm text-gray-800">{tarif.tarif_minimum} FCFA</td>
            <td className="px-4 py-3 text-sm">
              <div className="flex flex-wrap gap-2">
                {tarif.prix_modes.map((mode, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {mode.mode}: {mode.montant_base} FCFA ({mode.pourcentage_prestation}%)
                  </span>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

) : (
  // ---- ÉTAT VIDE ----
  <div className="p-8 text-center">
    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
      <svg
        className="w-10 h-10 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      </svg>
    </div>

    <h3 className="text-xl font-semibold text-gray-900 mb-3">
      Aucun tarif configuré
    </h3>

    <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
      Commencez par créer votre premier tarif d'expédition pour
      commencer à gérer vos prix.
    </p>

    <button
      onClick={handleNewTarif}
      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      Créer le premier tarif
    </button>
  </div>
)} </div>


{
  showTarifGroupage && (
   <AddAgencyTarifModal
  show={showTarifGroupage}
  onClose={() => {
    setShowTarifGroupage(false);
    setEditingTarif(null);
  }}
  editingTarif={editingTarif}
/>
  )
}

    </div>
  );
};

export default TarifGroupageComponent;
