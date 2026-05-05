import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

/**
 * Cartes de statistiques (Top Destinations, Volume par Type, Autres indicateurs)
 */
const StatsCards = ({ logistics, operational }) => {
    return (
        <>
            {/* Top Destinations */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-900">Top Destinations</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ce mois</p>
                </div>
                <div className="p-5 space-y-3">
                    {logistics.top_destinations && logistics.top_destinations.length > 0 ? (
                        logistics.top_destinations.slice(0, 5).map((dest, index) => {
                            const colors = [
                                'bg-indigo-500',
                                'bg-purple-500',
                                'bg-blue-500',
                                'bg-emerald-500',
                                'bg-amber-500'
                            ];
                            return (
                                <div key={index} className="flex items-center justify-between group hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg ${colors[index]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                            <span className="text-sm font-black text-white">{index + 1}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                                            {dest.pays}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-black text-slate-900">{dest.total}</span>
                                        <span className="text-xs text-slate-400 font-medium">exp.</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-xs text-slate-400">Aucune donnée disponible</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Volume par Type */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-900">Volume par Type</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Répartition</p>
                </div>
                <div className="p-5 space-y-4">
                    {logistics.volume_par_type && logistics.volume_par_type.length > 0 ? (
                        logistics.volume_par_type.map((vol, index) => {
                            const colors = [
                                { bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
                                { bar: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
                                { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                                { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
                                { bar: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' }
                            ];
                            const color = colors[index % colors.length];
                            const maxTotal = Math.max(...logistics.volume_par_type.map(v => v.total));
                            const percentage = (vol.total / maxTotal) * 100;

                            return (
                                <div key={index} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                                            {vol.type}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900">{vol.total}</span>
                                            <span className={`text-xs font-bold ${color.text} ${color.bg} px-2 py-0.5 rounded-full`}>
                                                {Math.round(percentage)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className={`${color.bar} h-2.5 rounded-full transition-all duration-500 ease-out group-hover:opacity-90`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-xs text-slate-400">Aucune donnée disponible</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Autres indicateurs */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Autres indicateurs</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between group/item hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-xs font-medium text-slate-600 group-hover/item:text-slate-900 transition-colors">
                                En transit
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                <div className="absolute left-0 top-5 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Colis en transit vers votre agence</p>
                                    <p className="text-slate-300">Colis qui ont quitté l'entrepôt international et qui sont en route vers votre ville (rôle d'agence de destination).</p>
                                </div>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{operational.colis_en_transit_vers_agence || 0}</span>
                    </div>

                    <div className="flex items-center justify-between group/item hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-medium text-slate-600 group-hover/item:text-slate-900 transition-colors">
                                Vers entrepôt
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                <div className="absolute left-0 top-5 w-72 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Colis en attente d'expédition vers l'entrepôt</p>
                                    <p className="text-slate-300 mb-2">Colis déjà reçus à votre agence mais encore stockés chez vous. Ils attendent d'être regroupés et envoyés vers l'entrepôt central.</p>
                                    <p className="text-amber-300 font-semibold">→ Action : Préparer le transfert vers l'entrepôt</p>
                                </div>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{operational.colis_attente_expedition_entrepot || 0}</span>
                    </div>

                    <div className="flex items-center justify-between group/item hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="text-xs font-medium text-slate-600 group-hover/item:text-slate-900 transition-colors">
                                Demandes en attente
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                <div className="absolute left-0 top-5 w-72 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Expéditions en attente d'acceptation</p>
                                    <p className="text-slate-300 mb-2">Expédition (souvent créée par un client via l'application) assignée à votre agence mais pas encore validée officiellement.</p>
                                    <p className="text-indigo-300 font-semibold">→ Action : Valider ou refuser les demandes</p>
                                </div>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{operational.expeditions_attente_acceptation || 0}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatsCards;
