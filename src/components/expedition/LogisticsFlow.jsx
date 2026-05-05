import React from 'react';
import { 
    FileText, 
    CheckCircle2, 
    Package, 
    Plane, 
    MapPin, 
    Truck,
    AlertCircle 
} from 'lucide-react';

/**
 * 🔄 FLUX LOGISTIQUE
 * Pipeline visuel du parcours de l'expédition
 */
const LogisticsFlow = ({ expedition, formatDate }) => {
    const getFlowSteps = () => {
        const status = expedition.statut_expedition;
        
        return [
            {
                id: 'registration',
                label: 'Enregistrement',
                sublabel: 'Dossier créé',
                icon: FileText,
                date: expedition.created_at,
                completed: true,
                active: status === 'en_attente'
            },
            {
                id: 'acceptance',
                label: 'Validation',
                sublabel: 'Agence départ',
                icon: CheckCircle2,
                date: null,
                completed: !['en_attente', 'refused'].includes(status),
                active: status === 'accepted',
                blocked: status === 'refused'
            },
            {
                id: 'reception',
                label: 'Réception',
                sublabel: 'Colis reçus',
                icon: Package,
                date: null,
                completed: ['recu_agence_depart', 'en_transit_entrepot', 'depart_expedition_succes', 'arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison', 'termined'].includes(status),
                active: status === 'recu_agence_depart'
            },
            {
                id: 'hub',
                label: 'HUB / Contrôle',
                sublabel: 'Backoffice',
                icon: AlertCircle,
                date: null,
                completed: ['depart_expedition_succes', 'arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison', 'termined'].includes(status),
                active: status === 'en_transit_entrepot',
                blocked: parseFloat(expedition.frais_annexes || 0) > 0 && expedition.statut_paiement_frais === 'en_attente'
            },
            {
                id: 'transit',
                label: 'Transit',
                sublabel: 'International',
                icon: Plane,
                date: null,
                completed: ['arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison', 'termined'].includes(status),
                active: status === 'depart_expedition_succes'
            },
            {
                id: 'arrival',
                label: 'Arrivée',
                sublabel: 'Agence destination',
                icon: MapPin,
                date: null,
                completed: ['recu_agence_destination', 'en_cours_livraison', 'termined'].includes(status),
                active: status === 'arrivee_expedition_succes'
            },
            {
                id: 'delivery',
                label: 'Livraison',
                sublabel: 'Client final',
                icon: Truck,
                date: null,
                completed: ['termined', 'delivered'].includes(status),
                active: status === 'en_cours_livraison'
            }
        ];
    };

    const steps = getFlowSteps();

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Flux Logistique
                </h2>
                <p className="text-xs text-slate-500 mt-1">Suivi en temps réel du parcours</p>
            </div>

            <div className="p-6">
                {/* Version Desktop - Horizontal */}
                <div className="hidden lg:block">
                    <div className="flex items-center justify-between relative">
                        {/* Ligne de connexion */}
                        <div className="absolute top-6 left-0 right-0 h-1 bg-slate-100 -z-10"></div>
                        <div 
                            className="absolute top-6 left-0 h-1 bg-indigo-500 -z-10 transition-all duration-500"
                            style={{ 
                                width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` 
                            }}
                        ></div>

                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.id} className="flex flex-col items-center flex-1">
                                    {/* Icône */}
                                    <div className={`
                                        w-12 h-12 rounded-full border-4 flex items-center justify-center mb-3 transition-all
                                        ${step.blocked 
                                            ? 'bg-red-500 border-red-200 animate-pulse' 
                                            : step.completed 
                                                ? 'bg-indigo-600 border-indigo-200' 
                                                : step.active
                                                    ? 'bg-blue-500 border-blue-200 animate-pulse'
                                                    : 'bg-white border-slate-200'
                                        }
                                    `}>
                                        <Icon className={`
                                            w-6 h-6
                                            ${step.blocked 
                                                ? 'text-white' 
                                                : step.completed 
                                                    ? 'text-white' 
                                                    : step.active
                                                        ? 'text-white'
                                                        : 'text-slate-400'
                                            }
                                        `} />
                                    </div>

                                    {/* Label */}
                                    <div className="text-center">
                                        <p className={`
                                            text-xs font-bold uppercase tracking-tight
                                            ${step.blocked 
                                                ? 'text-red-600' 
                                                : step.completed 
                                                    ? 'text-slate-900' 
                                                    : step.active
                                                        ? 'text-blue-600'
                                                        : 'text-slate-400'
                                            }
                                        `}>
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{step.sublabel}</p>
                                        {step.date && (
                                            <p className="text-xs text-slate-400 mt-1 font-mono">
                                                {formatDate(step.date)}
                                            </p>
                                        )}
                                        {step.blocked && (
                                            <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">
                                                Bloqué
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Version Mobile - Vertical */}
                <div className="lg:hidden space-y-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isLast = index === steps.length - 1;

                        return (
                            <div key={step.id} className="flex gap-4 relative">
                                {/* Ligne verticale */}
                                {!isLast && (
                                    <div className={`
                                        absolute left-6 top-12 bottom-0 w-1 -ml-0.5
                                        ${step.completed ? 'bg-indigo-500' : 'bg-slate-100'}
                                    `}></div>
                                )}

                                {/* Icône */}
                                <div className={`
                                    w-12 h-12 rounded-full border-4 flex items-center justify-center flex-shrink-0 transition-all z-10
                                    ${step.blocked 
                                        ? 'bg-red-500 border-red-200 animate-pulse' 
                                        : step.completed 
                                            ? 'bg-indigo-600 border-indigo-200' 
                                            : step.active
                                                ? 'bg-blue-500 border-blue-200 animate-pulse'
                                                : 'bg-white border-slate-200'
                                    }
                                `}>
                                    <Icon className={`
                                        w-6 h-6
                                        ${step.blocked 
                                            ? 'text-white' 
                                            : step.completed 
                                                ? 'text-white' 
                                                : step.active
                                                    ? 'text-white'
                                                    : 'text-slate-400'
                                        }
                                    `} />
                                </div>

                                {/* Contenu */}
                                <div className="flex-1 pb-4">
                                    <p className={`
                                        text-sm font-bold uppercase tracking-tight
                                        ${step.blocked 
                                            ? 'text-red-600' 
                                            : step.completed 
                                                ? 'text-slate-900' 
                                                : step.active
                                                    ? 'text-blue-600'
                                                    : 'text-slate-400'
                                        }
                                    `}>
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{step.sublabel}</p>
                                    {step.date && (
                                        <p className="text-xs text-slate-400 mt-1 font-mono">
                                            {formatDate(step.date)}
                                        </p>
                                    )}
                                    {step.blocked && (
                                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">
                                            ⚠️ Action requise
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LogisticsFlow;
