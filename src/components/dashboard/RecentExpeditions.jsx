import React from "react";
import { Link } from "react-router-dom";
import {
    CubeIcon,
    MapPinIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";

/**
 * Liste des dernières expéditions avec design amélioré
 */
const RecentExpeditions = ({ expeditions = [] }) => {
    // Afficher les 10 dernières expéditions au lieu de 5
    const getStatusColor = (statut) => {
        const colors = {
            'recu_agence_depart': 'bg-blue-50 text-blue-700 border-blue-200',
            'en_transit_vers_agence_arrivee': 'bg-purple-50 text-purple-700 border-purple-200',
            'recu_agence_arrivee': 'bg-indigo-50 text-indigo-700 border-indigo-200',
            'en_cours_livraison': 'bg-amber-50 text-amber-700 border-amber-200',
            'livre': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'recupere': 'bg-green-50 text-green-700 border-green-200'
        };
        return colors[statut] || 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const getStatusLabel = (statut) => {
        const labels = {
            'recu_agence_depart': 'Reçu',
            'en_transit_vers_agence_arrivee': 'Transit',
            'recu_agence_arrivee': 'Arrivé',
            'en_cours_livraison': 'Livraison',
            'livre': 'Livré',
            'recupere': 'Récupéré'
        };
        return labels[statut] || statut;
    };

    const getTypeLabel = (type) => {
        const labels = {
            'groupage_dhd_aerien': 'DHD Aérien',
            'groupage_dhd_maritime': 'DHD Maritime',
            'groupage_ca': 'CA',
            'groupage_afrique': 'Afrique',
            'simple': 'Simple'
        };
        return labels[type] || type;
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Header compact */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Dernières Expéditions</h3>
                    <span className="text-xs text-slate-500">(10 plus récentes)</span>
                </div>
                <Link 
                    to="/expeditions"
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded transition-colors flex items-center gap-1"
                >
                    Tout voir
                    <ArrowRightIcon className="w-3 h-3" />
                </Link>
            </div>

            {/* Liste compacte */}
            {expeditions && expeditions.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {expeditions.slice(0, 10).map((expedition) => (
                        <Link
                            key={expedition.id}
                            to={`/expeditions/${expedition.id}`}
                            className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                        >
                            {/* Icône compacte */}
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                                <CubeIcon className="w-4 h-4 text-indigo-600" />
                            </div>

                            {/* Infos */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {expedition.reference}
                                    </p>
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${getStatusColor(expedition.statut)}`}>
                                        {getStatusLabel(expedition.statut)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <MapPinIcon className="w-3 h-3" />
                                        {expedition.pays_destination}
                                    </span>
                                    <span>•</span>
                                    <span>{getTypeLabel(expedition.type)}</span>
                                    <span>•</span>
                                    <span className="font-semibold">{expedition.nombre_colis} colis</span>
                                </div>
                            </div>

                            {/* Montant */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {new Intl.NumberFormat('fr-FR').format(expedition.montant || 0)}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">CFA</p>
                            </div>

                            {/* Flèche */}
                            <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="px-6 py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center">
                        <CubeIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">Aucune expédition</p>
                    <p className="text-xs text-slate-400">Les expéditions créées apparaîtront ici</p>
                </div>
            )}
        </div>
    );
};

export default RecentExpeditions;
