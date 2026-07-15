import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

/**
 * 📍 TIMELINE DE STATUT
 * Style: FedEx / UPS Tracking
 * - Visualisation progression
 * - Étapes claires
 * - Design moderne
 */

const StatusTimeline = ({ currentStatus, compact = false }) => {
    // Mapping des statuts vers les étapes de progression
    const stages = [
        {
            id: 'created',
            label: 'Créée',
            icon: '📝',
            statuses: ['en_attente', 'accepted']
        },
        {
            id: 'pickup',
            label: 'Enlèvement',
            icon: '📦',
            statuses: ['en_cours_enlevement', 'en_cours_depot']
        },
        {
            id: 'warehouse',
            label: 'Entrepôt',
            icon: '🏢',
            statuses: ['recu_agence_depart', 'en_transit_entrepot']
        },
        {
            id: 'transit',
            label: 'Transit',
            icon: '🚚',
            statuses: ['depart_expedition_succes', 'arrivee_expedition_succes']
        },
        {
            id: 'destination',
            label: 'Destination',
            icon: '🏁',
            statuses: ['recu_agence_destination', 'en_cours_livraison']
        },
        {
            id: 'delivered',
            label: 'Livrée',
            icon: '✅',
            statuses: ['termined', 'delivered']
        }
    ];

    // Statuts spéciaux
    const isRefused = currentStatus === 'refused';
    const isAccepted = currentStatus === 'accepted';

    // Trouver l'étape actuelle
    const currentStageIndex = stages.findIndex(stage => 
        stage.statuses.includes(currentStatus)
    );

    // Si refusée, afficher un statut spécial
    if (isRefused) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
                <span className="text-lg leading-none">❌</span>
                <span className="text-xs font-bold text-red-600">Refusée</span>
            </div>
        );
    }

    // Mode compact (pour mobile ou espace réduit)
    if (compact) {
        const progress = currentStageIndex >= 0 
            ? Math.round(((currentStageIndex + 1) / stages.length) * 100) 
            : 0;

        return (
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                        {currentStageIndex >= 0 ? stages[currentStageIndex].label : 'En attente'}
                    </span>
                    <span className="font-bold text-indigo-600">{progress}%</span>
                </div>
                <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    // Mode complet (pour desktop)
    return (
        <div className="inline-flex items-center gap-1">
            {stages.map((stage, index) => {
                const isCompleted = index < currentStageIndex || (index === currentStageIndex && stage.statuses.includes(currentStatus));
                const isCurrent = index === currentStageIndex;
                const isPending = index > currentStageIndex;

                return (
                    <React.Fragment key={stage.id}>
                        {/* Stage dot */}
                        <div 
                            className={`relative flex items-center justify-center transition-all duration-300 ${
                                isCompleted 
                                    ? 'w-7 h-7' 
                                    : isCurrent 
                                    ? 'w-8 h-8' 
                                    : 'w-6 h-6'
                            }`}
                            title={stage.label}
                        >
                            {isCompleted ? (
                                <div className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                                    <CheckIcon className="w-4 h-4 text-white" />
                                </div>
                            ) : isCurrent ? (
                                <>
                                    <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20"></div>
                                    <div className="relative w-full h-full rounded-full bg-indigo-500 flex items-center justify-center shadow-lg border-2 border-white">
                                        <span className="text-[10px] leading-none">{stage.icon}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                                    <span className="text-[10px] leading-none opacity-40">{stage.icon}</span>
                                </div>
                            )}
                        </div>

                        {/* Connector line */}
                        {index < stages.length - 1 && (
                            <div 
                                className={`h-0.5 transition-all duration-300 ${
                                    isCompleted 
                                        ? 'w-3 bg-emerald-500' 
                                        : 'w-2 bg-slate-200'
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StatusTimeline;
