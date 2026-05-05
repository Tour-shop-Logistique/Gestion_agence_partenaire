import React from 'react';
import { MapPin, Package, Weight, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * 🔥 RÉSUMÉ OPÉRATIONNEL
 * Carte colorée affichant les infos essentielles en un coup d'œil
 */
const OperationalSummary = ({ expedition, formatCurrency }) => {
    const totalWeight = expedition.colis?.reduce((sum, c) => sum + parseFloat(c.poids || 0), 0) || 0;
    const totalParcels = expedition.colis?.length || 0;

    // Déterminer le statut visuel
    const getStatusConfig = (status) => {
        const configs = {
            en_attente: { 
                bg: 'bg-amber-50', 
                border: 'border-amber-200', 
                text: 'text-amber-900',
                icon: AlertCircle,
                iconColor: 'text-amber-600',
                label: 'En attente de validation'
            },
            accepted: { 
                bg: 'bg-blue-50', 
                border: 'border-blue-200', 
                text: 'text-blue-900',
                icon: CheckCircle2,
                iconColor: 'text-blue-600',
                label: 'Acceptée - En préparation'
            },
            recu_agence_depart: { 
                bg: 'bg-indigo-50', 
                border: 'border-indigo-200', 
                text: 'text-indigo-900',
                icon: Package,
                iconColor: 'text-indigo-600',
                label: 'Reçu à l\'agence de départ'
            },
            depart_expedition_succes: { 
                bg: 'bg-purple-50', 
                border: 'border-purple-200', 
                text: 'text-purple-900',
                icon: MapPin,
                iconColor: 'text-purple-600',
                label: 'En transit international'
            },
            arrivee_expedition_succes: { 
                bg: 'bg-emerald-50', 
                border: 'border-emerald-200', 
                text: 'text-emerald-900',
                icon: CheckCircle2,
                iconColor: 'text-emerald-600',
                label: 'Arrivée à destination'
            },
            termined: { 
                bg: 'bg-green-50', 
                border: 'border-green-200', 
                text: 'text-green-900',
                icon: CheckCircle2,
                iconColor: 'text-green-600',
                label: 'Expédition terminée'
            },
            refused: { 
                bg: 'bg-red-50', 
                border: 'border-red-200', 
                text: 'text-red-900',
                icon: AlertCircle,
                iconColor: 'text-red-600',
                label: 'Demande refusée'
            }
        };

        return configs[status] || configs.en_attente;
    };

    const statusConfig = getStatusConfig(expedition.statut_expedition);
    const StatusIcon = statusConfig.icon;

    return (
        <div className={`${statusConfig.bg} ${statusConfig.border} border-2 rounded-2xl p-6 shadow-sm`}>
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center`}>
                        <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Statut actuel</p>
                        <h3 className={`text-lg font-bold ${statusConfig.text}`}>{statusConfig.label}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Destination */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-bold text-slate-500 uppercase">Destination</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                        {expedition.pays_depart} → {expedition.pays_destination}
                    </p>
                </div>

                {/* Nombre de colis */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-bold text-slate-500 uppercase">Colis</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{totalParcels} unité{totalParcels > 1 ? 's' : ''}</p>
                </div>

                {/* Poids total */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex items-center gap-2 mb-2">
                        <Weight className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-bold text-slate-500 uppercase">Poids</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{totalWeight.toFixed(1)} KG</p>
                </div>

                {/* Date estimée */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-bold text-slate-500 uppercase">Créé le</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                        {new Date(expedition.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </p>
                </div>
            </div>

            {/* Alerte blocage */}
            {parseFloat(expedition.frais_annexes || 0) > 0 && expedition.statut_paiement_frais === 'en_attente' && (
                <div className="mt-4 bg-red-100 border-2 border-red-300 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-900">⚠️ Expédition bloquée</p>
                        <p className="text-xs text-red-700 mt-1">
                            Frais annexes impayés : {formatCurrency(expedition.frais_annexes)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperationalSummary;
