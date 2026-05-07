import React from "react";
import { Link } from "react-router-dom";
import {
    ArchiveBoxIcon,
    TruckIcon,
    BellAlertIcon,
    ArrowRightIcon,
    FireIcon
} from "@heroicons/react/24/outline";

/**
 * Section Actions Prioritaires
 * Affiche les actions urgentes que l'agent doit effectuer
 */
const PriorityActions = ({ operational, pendingDemandesCount }) => {
    const actions = [
        {
            id: 'reception',
            title: 'Colis à réceptionner',
            subtitle: 'Départ',
            count: operational.colis_attente_reception_depart || 0,
            urgent: (operational.colis_attente_reception_depart || 0) > 10,
            icon: ArchiveBoxIcon,
            link: '/colis',
            color: 'red',
            description: 'Colis clients en attente de réception physique'
        },
        {
            id: 'retrait',
            title: 'Colis à remettre',
            subtitle: 'Destination',
            count: operational.colis_attente_retrait_livraison || 0,
            urgent: (operational.colis_attente_retrait_livraison || 0) > 15,
            icon: TruckIcon,
            link: '/retrait-colis',
            color: 'emerald',
            description: 'Prêts pour retrait client'
        },
        {
            id: 'demandes',
            title: 'Demandes en attente',
            subtitle: 'À valider',
            count: pendingDemandesCount,
            urgent: pendingDemandesCount > 5,
            icon: BellAlertIcon,
            link: '/demandes',
            color: 'indigo',
            description: 'Demandes clients à accepter ou refuser'
        }
    ];

    const getColorClasses = (color, isUrgent) => {
        if (isUrgent) {
            return {
                bg: 'bg-gradient-to-br from-red-500 to-red-600',
                hover: 'hover:from-red-600 hover:to-red-700',
                iconBg: 'bg-white',
                iconColor: 'text-red-600',
                text: 'text-white',
                textSecondary: 'text-red-50',
                countText: 'text-white',
                subtitleText: 'text-red-100'
            };
        }

        const colorMap = {
            red: {
                bg: 'bg-gradient-to-br from-red-50 to-red-100',
                hover: 'hover:from-red-100 hover:to-red-200',
                iconBg: 'bg-red-500',
                iconColor: 'text-white',
                text: 'text-red-900',
                textSecondary: 'text-red-700',
                countText: 'text-red-900',
                subtitleText: 'text-red-600'
            },
            emerald: {
                bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
                hover: 'hover:from-emerald-100 hover:to-emerald-200',
                iconBg: 'bg-emerald-500',
                iconColor: 'text-white',
                text: 'text-emerald-900',
                textSecondary: 'text-emerald-700',
                countText: 'text-emerald-900',
                subtitleText: 'text-emerald-600'
            },
            indigo: {
                bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
                hover: 'hover:from-indigo-100 hover:to-indigo-200',
                iconBg: 'bg-indigo-500',
                iconColor: 'text-white',
                text: 'text-indigo-900',
                textSecondary: 'text-indigo-700',
                countText: 'text-indigo-900',
                subtitleText: 'text-indigo-600'
            }
        };

        return colorMap[color];
    };

    return (
        <div className="space-y-3">
            {/* Titre de section compact */}
            <div className="flex items-center gap-2">
                <FireIcon className="w-4 h-4 text-red-600" />
                <h2 className="text-sm font-bold text-slate-900">Actions prioritaires</h2>
            </div>

            {/* Cartes d'actions compactes - 3 colonnes sur toutes les tailles */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {actions.map((action) => {
                    const colors = getColorClasses(action.color, action.urgent);
                    const Icon = action.icon;

                    return (
                        <Link
                            key={action.id}
                            to={action.link}
                            className={`${colors.bg} ${colors.hover} rounded-lg p-2 sm:p-4 transition-all duration-200 border ${action.urgent ? 'border-red-400 shadow-md' : 'border-slate-200'} group relative hover:shadow-lg`}
                        >
                            {/* Layout vertical compact pour mobile */}
                            <div className="flex flex-col items-center gap-2 text-center">
                                {/* Icône */}
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.iconColor}`} />
                                </div>

                                {/* Compteur */}
                                <div className="flex-shrink-0">
                                    <div className={`text-xl sm:text-2xl font-black ${colors.countText} leading-none`}>
                                        {action.count}
                                    </div>
                                    <div className={`text-[8px] sm:text-[10px] font-semibold ${colors.subtitleText} uppercase mt-0.5`}>
                                        {action.subtitle}
                                    </div>
                                </div>

                                {/* Titre */}
                                <div className="flex-1 min-w-0 w-full">
                                    <h3 className={`text-[10px] sm:text-sm font-bold ${colors.text} leading-tight`}>
                                        {action.title}
                                    </h3>
                                    <p className={`text-[8px] sm:text-xs ${colors.textSecondary} mt-1 hidden sm:block leading-tight`}>
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default PriorityActions;
