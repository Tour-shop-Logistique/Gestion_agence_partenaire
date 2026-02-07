import React from "react";
import { formatPrice } from "../utils/format";
import {
  XMarkIcon,
  InformationCircleIcon,
  CheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const TarifConfigModal = ({
  isOpen,
  onClose,
  selectedIndex,
  editingZones,
  loading,
  onZoneChange,
  onSave,
  onSaveZone,
  isSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative inline-block w-full max-w-4xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all">
          {/* Header */}
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <InformationCircleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Configuration du tarif - Indice {selectedIndex}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Ajustez les marges de prestation par zone géographique
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <ArrowPathIcon className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Chargement des données...</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Zone</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Base</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">% Prestation</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Marge</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editingZones.map((zone) => (
                      <tr key={zone.zone_destination_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm font-black text-slate-900 border-r border-slate-50">
                          Zone {zone.zone_destination_id.replace(/z/i, "")}
                        </td>
                        <td className="px-6 py-3 text-sm font-medium text-slate-500">
                          {formatPrice(zone.montant_base || 0, "XOF")}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center group/input">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={zone.pourcentage_prestation || ""}
                              onChange={(e) => onZoneChange(zone.zone_destination_id, e.target.value)}
                              className="w-20 px-3 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                            <span className="ml-2 text-xs font-black text-slate-400">%</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm font-bold text-indigo-600">
                          {formatPrice(zone.montant_prestation || 0, "XOF")}
                        </td>
                        <td className="px-6 py-3 text-sm font-black text-slate-900">
                          {formatPrice(zone.montant_expedition || 0, "XOF")}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => onSaveZone && zone.id && onSaveZone(zone.id, zone.pourcentage_prestation)}
                            disabled={isSaving || !zone.id}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Sauvegarder cette zone uniquement"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Fermer sans enregistrer
            </button>
            <button
              onClick={onSave}
              disabled={isSaving || editingZones.length === 0}
              className={`inline-flex items-center px-6 py-2 rounded-lg text-sm font-black text-white shadow-sm transition-all ${!isSaving && editingZones.length > 0
                ? "bg-slate-950 hover:bg-slate-800"
                : "bg-slate-300 cursor-not-allowed"
                }`}
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Appliquer les tarifs
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarifConfigModal;