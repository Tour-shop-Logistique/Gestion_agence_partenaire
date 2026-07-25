import React from "react";
import {
    ArchiveBoxIcon,
    BuildingStorefrontIcon,
    TruckIcon,
    MapPinIcon,
    CheckCircleIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";

/**
 * Visualisation du flux logistique
 * Pipeline : Réception → Stock → Transit → Arrivée → Livraison
 */
const LogisticsFlow = ({ operational }) => {
    const stages = [
        {
            id: 'reception',
            label: 'Réception',
            sublabel: 'Départ',
            icon: ArchiveBoxIcon,
            count: operational.colis_attente_reception_depart || 0,
            color: 'amber',
            description: 'En attente de réception'
        },
        {
            id: 'stock',
            label: 'Stock',
            sublabel: 'Agence',
            icon: BuildingStorefrontIcon,
            count: operational.colis_attente_expedition_entrepot || 0,
            color: 'blue',
            description: 'Vers entrepôt'
        },
        {
            id: 'transit',
            label: 'Transit',
            sublabel: 'En route',
            icon: TruckIcon,
            count: operational.colis_en_transit_vers_agence || 0,
            color: 'purple',
            description: 'Vers votre agence'
        },
        {
            id: 'arrivee',
            label: 'Arrivée',
            sublabel: 'Destination',
            icon: MapPinIcon,
            count: operational.colis_attente_retrait_livraison || 0,
            color: 'indigo',
            description: 'Prêts pour retrait'
        },
        {
            id: 'livraison',
            label: 'Livré',
            sublabel: 'Terminé',
            icon: CheckCircleIcon,
            count: operational.colis_recus_aujourdhui || 0,
            color: 'emerald',
            description: 'Aujourd\'hui'
        }
    ];

    const colorMap = {
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon: 'text-amber-600',
            text: 'text-amber-900',
            badge: 'bg-amber-500'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: 'text-blue-600',
            text: 'text-blue-900',
            badge: 'bg-blue-500'
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            icon: 'text-purple-600',
            text: 'text-purple-900',
            badge: 'bg-purple-500'
        },
        indigo: {
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            icon: 'text-indigo-600',
            text: 'text-indigo-900',
            badge: 'bg-indigo-500'
        },
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            icon: 'text-emerald-600',
            text: 'text-emerald-900',
            badge: 'bg-emerald-500'
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-purple-600">🔄</span>
                    Flux logistique
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Pipeline de traitement des colis</p>
            </div>

            {/* Pipeline */}
            <div className="relative">
                <div className="flex items-center justify-between gap-2">
                    {stages.map((stage, index) => {
                        const colors = colorMap[stage.color];
                        const Icon = stage.icon;
                        const isLast = index === stages.length - 1;

                        return (
                            <React.Fragment key={stage.id}>
                                {/* Étape */}
                                <div className="flex-1 min-w-0">
                                    <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 transition-all hover:shadow-md relative group`}>
                                        {/* Badge de compteur */}
                                        {stage.count > 0 && (
                                            <div className="absolute -top-2 -right-2">
                                                <div className={`${colors.badge} text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white`}>
                                                    {stage.count > 99 ? '99+' : stage.count}
                                                </div>
                                            </div>
                                        )}

                                        {/* Icône */}
                                        <div className="flex justify-center mb-3">
                                            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center border-2 ${colors.border} group-hover:scale-110 transition-transform`}>
                                                <Icon className={`w-6 h-6 ${colors.icon}`} />
                                            </div>
                                        </div>

                                        {/* Texte */}
                                        <div className="text-center">
                                            <p className={`text-sm font-bold ${colors.text} mb-0.5`}>
                                                {stage.label}
                                            </p>
                                            <p className="text-xs text-slate-500 mb-2">
                                                {stage.sublabel}
                                            </p>
                                            <p className="text-xs text-slate-600 font-medium">
                                                {stage.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Flèche de connexion */}
                                {!isLast && (
                                    <div className="flex-shrink-0 px-1">
                                        <ArrowRightIcon className="w-5 h-5 text-slate-300" />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Légende */}
            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                    <span className="font-semibold text-slate-700">Pipeline complet :</span> De la réception client jusqu'à la livraison finale
                </p>
            </div>
        </div>
    );
};

export default LogisticsFlow;
