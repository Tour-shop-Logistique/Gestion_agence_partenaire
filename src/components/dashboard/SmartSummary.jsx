import React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";

/**
 * Résumé intelligent de l'activité du jour
 */
const SmartSummary = ({ operational, pendingDemandesCount }) => {
    const generateSummary = () => {
        const parts = [];
        
        if (operational.expeditions_creees_aujourdhui > 0) {
            parts.push(`${operational.expeditions_creees_aujourdhui} expédition${operational.expeditions_creees_aujourdhui > 1 ? 's créées' : ' créée'}`);
        }

        if (operational.colis_attente_reception_depart > 0) {
            parts.push(`${operational.colis_attente_reception_depart} colis à réceptionner`);
        }

        if (operational.colis_attente_retrait_livraison > 0) {
            parts.push(`${operational.colis_attente_retrait_livraison} colis à remettre`);
        }

        if (pendingDemandesCount > 0) {
            parts.push(`${pendingDemandesCount} demande${pendingDemandesCount > 1 ? 's' : ''} en attente`);
        }

        if (parts.length === 0) {
            return "Aucune action urgente pour le moment. Tout est sous contrôle ! 🎉";
        }

        return `Aujourd'hui vous avez ${parts.join(', ')}.`;
    };

    const hasUrgentActions = 
        operational.colis_attente_reception_depart > 0 || 
        operational.colis_attente_retrait_livraison > 0 || 
        pendingDemandesCount > 0;

    return (
        <div className={`rounded-xl p-5 border ${hasUrgentActions ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'}`}>
            <div className="flex items-start gap-4">
                <div className={`p-2.5 ${hasUrgentActions ? 'bg-indigo-500' : 'bg-emerald-500'} rounded-lg flex-shrink-0`}>
                    <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className={`text-sm font-bold ${hasUrgentActions ? 'text-indigo-900' : 'text-emerald-900'} mb-1`}>
                        Résumé de votre journée
                    </h3>
                    <p className={`text-sm ${hasUrgentActions ? 'text-indigo-700' : 'text-emerald-700'} leading-relaxed`}>
                        {generateSummary()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SmartSummary;
