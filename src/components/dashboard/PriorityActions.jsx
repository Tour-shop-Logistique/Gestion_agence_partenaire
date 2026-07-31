import React from "react";
import { Link } from "react-router-dom";
import {
    ArchiveBoxIcon,
    TruckIcon,
    FireIcon
} from "@heroicons/react/24/outline";

/**
 * Section Actions Prioritaires
 * Affiche les actions urgentes que l'agent doit effectuer
 * (les demandes en attente sont signalées séparément via la bande d'alerte DemandesAlert)
 */
const PriorityActions = ({ operational }) => {
    const actions = [
        {
            id: 'reception',
            title: 'Colis à réceptionner',
            subtitle: 'Départ',
            count: operational.colis_attente_reception_depart || 0,
            urgent: (operational.colis_attente_reception_depart || 0) > 10,
            icon: ArchiveBoxIcon,
            link: '/colis',
            color: 'orange',
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
        }
    ];

    const getColorClasses = (color, isUrgent) => {
        if (isUrgent) {
            return {
                iconBg: 'bg-red-500',
                countText: 'text-red-900',
                badge: 'bg-red-500 text-white',
                cardBg: 'bg-red-50',
                cardBorder: 'border-red-200',
                cardHoverBorder: 'hover:border-red-300'
            };
        }

        const colorMap = {
            orange: {
                iconBg: 'bg-orange-500',
                countText: 'text-orange-900',
                badge: null,
                cardBg: 'bg-orange-50',
                cardBorder: 'border-orange-100',
                cardHoverBorder: 'hover:border-orange-200'
            },
            emerald: {
                iconBg: 'bg-emerald-500',
                countText: 'text-emerald-900',
                badge: null,
                cardBg: 'bg-emerald-50',
                cardBorder: 'border-emerald-100',
                cardHoverBorder: 'hover:border-emerald-200'
            }
        };

        return colorMap[color];
    };

    return (
        <div className="space-y-3">
            {/* Titre de section compact */}
            <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 sm:h-6 rounded-full bg-gradient-to-b from-red-400 to-red-600"></div>
                <FireIcon className="w-4 h-4 text-red-600" />
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-1.5">Actions prioritaires</h2>
            </div>

            {/* Cartes horizontales, alignées avec le style des KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                {actions.map((action) => {
                    const colors = getColorClasses(action.color, action.urgent);
                    const Icon = action.icon;

                    return (
                        <Link
                            key={action.id}
                            to={action.link}
                            className={`${colors.cardBg} p-4 sm:p-5 rounded-2xl border ${colors.cardBorder} shadow-sm hover:shadow-md ${colors.cardHoverBorder} hover:-translate-y-0.5 transition-all duration-200 group relative flex items-center gap-3 sm:gap-4`}
                        >
                            {colors.badge && (
                                <span className={`absolute top-3 right-3 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${colors.badge}`}>
                                    Urgent
                                </span>
                            )}

                            {/* Icône */}
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colors.iconBg} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>

                            {/* Libellé + compteur */}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{action.title}</p>
                                <h3 className={`text-xl sm:text-2xl font-extrabold ${colors.countText} mt-1 leading-none`}>
                                    {action.count}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 truncate">{action.subtitle} · {action.description}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default PriorityActions;
