import React from 'react';
import {
    FileText,
    CheckCircle2,
    Package,
    Plane,
    MapPin,
    Truck,
    AlertCircle,
    Weight,
} from 'lucide-react';

/**
 * 🧭 VUE D'ENSEMBLE DU STATUT
 * Fusionne en un seul bloc ce qui était éclaté entre OperationalSummary,
 * KPICards et LogisticsFlow (mêmes infos - statut, colis, poids, blocage -
 * répétées trois fois de façon incohérente). Une seule timeline, un seul
 * jeu de chiffres clés, une seule alerte de blocage - basée sur la vraie
 * décision de l'agence (frais_decision_agence_prise) et non plus seulement
 * sur le statut de paiement, qui reste "en_attente" même quand l'agence a
 * validé un règlement à l'arrivée (cas normal, pas une urgence).
 */
const StatusOverview = ({ expedition }) => {
    const totalWeight = expedition.colis?.reduce((sum, c) => sum + parseFloat(c.poids || 0), 0) || 0;
    const totalParcels = expedition.colis?.length || 0;
    const totalAmount = parseFloat(expedition.montant_expedition || 0) + parseFloat(expedition.frais_annexes || 0);
    const status = expedition.statut_expedition;

    const hasFraisAnnexes = parseFloat(expedition.frais_annexes || 0) > 0;
    // Bloquant uniquement si des frais existent ET que l'agence n'a pas encore
    // choisi entre "payé maintenant" et "à percevoir à l'arrivée" - un choix
    // fait (même "à l'arrivée") lève le blocage, indépendamment du paiement réel.
    const decisionAgenceEnAttente = hasFraisAnnexes && !expedition.frais_decision_agence_prise;

    const steps = [
        {
            id: 'registration',
            label: 'Enregistrement',
            icon: FileText,
            completed: true,
            active: status === 'en_attente',
        },
        {
            id: 'acceptance',
            label: 'Validation',
            icon: CheckCircle2,
            completed: !['en_attente', 'refused'].includes(status),
            active: status === 'accepted',
            blocked: status === 'refused',
        },
        {
            id: 'reception',
            label: 'Réception',
            icon: Package,
            completed: ['recu_agence_depart', 'en_transit_entrepot', 'depart_expedition_succes', 'arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison', 'termined'].includes(status),
            active: status === 'recu_agence_depart',
        },
        {
            id: 'hub',
            label: 'HUB / Contrôle',
            icon: AlertCircle,
            completed: ['depart_expedition_succes', 'arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison', 'termined'].includes(status),
            active: status === 'en_transit_entrepot',
            blocked: decisionAgenceEnAttente,
        },
        {
            id: 'transit',
            label: 'Transit',
            icon: Plane,
            completed: ['arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison', 'termined'].includes(status),
            active: status === 'depart_expedition_succes',
        },
        {
            id: 'arrival',
            label: 'Arrivée',
            icon: MapPin,
            completed: ['recu_agence_destination', 'en_cours_livraison', 'termined'].includes(status),
            active: status === 'arrivee_expedition_succes',
        },
        {
            id: 'delivery',
            label: 'Livraison',
            icon: Truck,
            completed: ['termined', 'delivered'].includes(status),
            active: status === 'en_cours_livraison',
        },
    ];

    const statusLabels = {
        en_attente: 'En attente de validation',
        accepted: 'Acceptée - En préparation',
        recu_agence_depart: "Reçue à l'agence de départ",
        en_transit_entrepot: 'Au contrôle HUB',
        depart_expedition_succes: 'En transit international',
        arrivee_expedition_succes: 'Arrivée à destination',
        recu_agence_destination: 'Reçue à destination',
        en_cours_livraison: 'En cours de livraison',
        termined: 'Expédition terminée',
        delivered: 'Livrée',
        refused: 'Demande refusée',
    };

    const kpis = [
        { icon: Package, label: 'Colis', value: totalParcels, unit: totalParcels > 1 ? 'unités' : 'unité', color: 'indigo' },
        { icon: Weight, label: 'Poids', value: totalWeight.toFixed(1), unit: 'KG', color: 'blue' },
        {
            icon: MapPin,
            label: 'Trajet',
            value: `${expedition.pays_depart} → ${expedition.pays_destination}`,
            unit: '',
            color: 'purple',
        },
        {
            icon: FileText,
            label: 'Montant total',
            value: new Intl.NumberFormat('fr-FR').format(totalAmount),
            unit: 'CFA',
            color: 'emerald',
        },
    ];

    const kpiColors = {
        indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
        blue: 'bg-blue-50 border-blue-100 text-blue-600',
        purple: 'bg-purple-50 border-purple-100 text-purple-600',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Bandeau statut */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Statut actuel</p>
                    <h2 className="text-base font-bold text-slate-900">
                        {statusLabels[status] || status?.replace(/_/g, ' ')}
                    </h2>
                </div>
                {decisionAgenceEnAttente && (
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-red-700">
                            En attente de la décision de l'agence sur les frais annexes
                        </span>
                    </div>
                )}
            </div>

            {/* Timeline unique */}
            <div className="px-6 py-5 border-b border-slate-100 overflow-x-auto">
                <div className="flex items-center min-w-[640px]">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isLast = index === steps.length - 1;
                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                                            ${step.blocked
                                                ? 'bg-red-500'
                                                : step.completed
                                                    ? 'bg-emerald-500'
                                                    : step.active
                                                        ? 'bg-indigo-500 animate-pulse'
                                                        : 'bg-slate-100'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${step.completed || step.active || step.blocked ? 'text-white' : 'text-slate-400'}`} />
                                    </div>
                                    <p className={`mt-2 text-[10px] font-bold uppercase tracking-tight text-center
                                        ${step.blocked ? 'text-red-600' : step.completed ? 'text-slate-700' : step.active ? 'text-indigo-600' : 'text-slate-350'}`}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                                {!isLast && (
                                    <div className={`h-0.5 flex-1 -mt-5 ${step.completed ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Chiffres clés */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
                {kpis.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={index} className="p-4 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${kpiColors[kpi.color]}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{kpi.label}</p>
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {kpi.value} {kpi.unit && <span className="text-xs text-slate-500">{kpi.unit}</span>}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusOverview;
