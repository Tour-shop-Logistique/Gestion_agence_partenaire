import React, { useState, useEffect } from "react";
import { useTarifs } from "../hooks/useTarifs";
import AddAgencyTarifModal from "../components/groupageForm"

const TarifGroupageComponent = () => {
  const [showTarifGroupage, setShowTarifGroupage] = useState(false);
  const [activeTab, setActiveTab] = useState("base");
  const [editingTarif, setEditingTarif] = useState(null);
  const [selectedBaseRate, setSelectedBaseRate] = useState(null);

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

  // Utilitaire de groupement des tarifs
  const groupRates = (rates) => {
    if (!rates || !Array.isArray(rates)) return [];

    const groups = {};
    rates.forEach((rate) => {
      const categoryName = rate.category?.nom || (rate.type_expedition === 'groupage_afrique' ? 'Expédition Afrique' : (rate.type_expedition === 'groupage_ca' ? 'Expédition CA' : 'Général'));
      const key = `${categoryName}-${rate.pays}-${rate.type_expedition}`;

      if (!groups[key]) {
        groups[key] = {
          id: key,
          categoryName,
          pays: rate.pays,
          type_expedition: rate.type_expedition,
          modes: []
        };
      }
      groups[key].modes.push(rate);
    });

    return Object.values(groups);
  };

  const handleNewTarif = (baseRate = null) => {
    setEditingTarif(null);
    setSelectedBaseRate(baseRate);
    setShowTarifGroupage(true);
  };

  const handleEditTarif = (tarif) => {
    setEditingTarif(tarif);
    setSelectedBaseRate(null);
    setShowTarifGroupage(true);
  };

  const handleDeleteTarif = (tarif) => {
    setEditingTarif({ ...tarif, delete: true });
    setSelectedBaseRate(null);
    setShowTarifGroupage(true);
  };

  const groupedBaseTarifs = groupRates(groupageTarifs);
  const groupedAgencyTarifs = groupRates(existingGroupageTarifs);

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
                onClick={() => handleNewTarif()}
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
        <div className={`mb-6 p-4 rounded-lg ${message.includes("succès") ? "bg-green-50 border border-green-200 text-green-600" : "bg-red-50 border border-red-200 text-red-600"}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("agency")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "agency" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Tarifs agence ({existingGroupageTarifs?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("base")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "base" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Tarifs de base ({groupageTarifs?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Détails</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Pays</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Modes Actifs et Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupedAgencyTarifs.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${group.type_expedition?.includes('dhd') ? 'bg-blue-100 text-blue-700' : group.type_expedition?.includes('afrique') ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                        {group.type_expedition?.replace('groupage_', '').toUpperCase() || 'GROUPAGE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {group.categoryName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{group.pays}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-2">
                        {group.modes.map((mode) => (
                          <div key={mode.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 group/mode transition-all hover:bg-white hover:shadow-sm">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700 uppercase text-[10px]">{mode.mode} {mode.ligne ? `(${mode.ligne})` : ''}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600 font-black text-sm">{mode.montant_expedition?.toLocaleString()} FCFA</span>
                                <span className="text-gray-400 text-[10px]">({mode.pourcentage_prestation}%)</span>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover/mode:opacity-100 transition-all">
                              <button
                                onClick={() => handleEditTarif(mode)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button
                                onClick={() => handleDeleteTarif(mode)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4s" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "base" && groupageTarifs?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Détails</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Pays</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Modes de base</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupedBaseTarifs.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${group.type_expedition?.includes('dhd') ? 'bg-blue-100 text-blue-700' : group.type_expedition?.includes('afrique') ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                        {group.type_expedition?.replace('groupage_', '').toUpperCase() || 'GROUPAGE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{group.categoryName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{group.pays}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-2">
                        {group.modes.map((mode) => (
                          <div key={mode.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 hover:border-blue-200 group transition-all shadow-sm">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700 uppercase text-[10px]">{mode.mode} {mode.ligne ? `(${mode.ligne})` : ''}</span>
                              <span className="text-blue-700 font-black text-xs">{mode.montant_base?.toLocaleString()} FCFA</span>
                            </div>
                            <button
                              onClick={() => handleNewTarif(mode)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[10px] font-bold transition-all opacity-0 group-hover:opacity-100"
                            >
                              Ajouter
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun tarif configuré</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">Commencez par créer votre premier tarif d'expédition pour commencer à gérer vos prix.</p>
            <button
              onClick={() => handleNewTarif()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Créer le premier tarif
            </button>
          </div>
        )}
      </div>

      {showTarifGroupage && (
        <AddAgencyTarifModal
          show={showTarifGroupage}
          onClose={() => {
            setShowTarifGroupage(false);
            setEditingTarif(null);
            setSelectedBaseRate(null);
          }}
          editingTarif={editingTarif}
          selectedBaseRate={selectedBaseRate}
        />
      )}
    </div>
  );
};

export default TarifGroupageComponent;
