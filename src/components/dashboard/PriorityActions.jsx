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

            {/* Cartes d'actions compactes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {actions.map((action) => {
                    const colors = getColorClasses(action.color, action.urgent);
                    const Icon = action.icon;

                    return (
                        <Link
                            key={action.id}
                            to={action.link}
                            className={`${colors.bg} ${colors.hover} rounded-lg p-4 transition-all duration-200 border ${action.urgent ? 'border-red-400 shadow-md' : 'border-slate-200'} group relative hover:shadow-lg`}
                        >
                            {/* Layout horizontal compact */}
                            <div className="flex items-center gap-3">
                                {/* Icône */}
                                <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                                    <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                                </div>

                                {/* Contenu */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-sm font-bold ${colors.text} mb-0.5`}>
                                        {action.title}
                                    </h3>
                                    <p className={`text-xs ${colors.textSecondary}`}>
                                        {action.description}
                                    </p>
                                </div>

                                {/* Compteur */}
                                <div className="text-right flex-shrink-0">
                                    <div className={`text-2xl font-black ${colors.countText}`}>
                                        {action.count}
                                    </div>
                                    <div className={`text-[10px] font-semibold ${colors.subtitleText} uppercase`}>
                                        {action.subtitle}
                                    </div>
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
