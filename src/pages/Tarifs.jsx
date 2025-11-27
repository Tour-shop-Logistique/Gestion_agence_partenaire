import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import TarifSimpleComponent from "../components/tarifSimple";
import TarifGroupageComponent from "../components/tarifGroupage";

const Tarifs = () => {
 



  const [selectedTarif, setSelectedTarif] = useState("simple");



  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Gestion des tarifs
            </h1>
            <p className="text-gray-600 mt-1 text-md">
              Configurez les tarifs d'expédition pour votre agence
            </p>
          </div>

          <div className="flex items-center">
  <div className="bg-gray-100 p-1 rounded-xl flex shadow-sm">
    <button
      onClick={() => setSelectedTarif("simple")}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${selectedTarif === "simple"
          ? "bg-white shadow-sm text-green-600"
          : "text-gray-500 hover:text-gray-700"
        }`}
    >
      Tarif simple
    </button>

    <button
      onClick={() => setSelectedTarif("groupage")}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${selectedTarif === "groupage"
          ? "bg-white shadow-sm text-green-600"
          : "text-gray-500 hover:text-gray-700"
        }`}
    >
      Tarif groupage
    </button>
  </div>
</div>




        
        </div>
      </div>

      {selectedTarif === "simple" && (
  <TarifSimpleComponent />
)}

{selectedTarif === "groupage" && (
  <TarifGroupageComponent />
)}





  
    </DashboardLayout>
  );
};

export default Tarifs;
