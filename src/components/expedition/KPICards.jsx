import React from 'react';
import { Package, Weight, DollarSign, Activity } from 'lucide-react';
import { Badge } from '../ui';

/**
 * 📊 CARTES KPI
 * Indicateurs visuels en cartes séparées
 */
const KPICards = ({ expedition, formatCurrency }) => {
    const totalWeight = expedition.colis?.reduce((sum, c) => sum + parseFloat(c.poids || 0), 0) || 0;
    const totalParcels = expedition.colis?.length || 0;
    const totalAmount = parseFloat(expedition.montant_expedition || 0) + parseFloat(expedition.frais_annexes || 0);

    const getStatusBadge = (status) => {
        const configs = {
            en_attente: { variant: 'warning', label: 'En attente' },
            accepted: { variant: 'info', label: 'Acceptée' },
            refused: { variant: 'danger', label: 'Refusée' },
            recu_agence_depart: { variant: 'info', label: 'Reçu Agence' },
            depart_expedition_succes: { variant: 'primary', label: 'En Transit' },
            arrivee_expedition_succes: { variant: 'primary', label: 'Arrivée' },
            termined: { variant: 'success', label: 'Terminée' },
            delivered: { variant: 'success', label: 'Livrée' }
        };

        const config = configs[status] || { variant: 'default', label: status?.replace(/_/g, ' ') };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const kpis = [
        {
            icon: Package,
            label: 'Nombre de colis',
            value: totalParcels,
            unit: totalParcels > 1 ? 'unités' : 'unité',
            color: 'indigo',
            bgColor: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            borderColor: 'border-indigo-200'
        },
        {
            icon: Weight,
            label: 'Poids total',
            value: totalWeight.toFixed(1),
            unit: 'KG',
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200'
        },
        {
            icon: DollarSign,
            label: 'Montant total',
            value: new Intl.NumberFormat('fr-FR').format(totalAmount),
            unit: 'CFA',
            color: 'emerald',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            borderColor: 'border-emerald-200',
            highlight: true
        },
        {
            icon: Activity,
            label: 'Statut',
            value: getStatusBadge(expedition.statut_expedition),
            unit: '',
            color: 'slate',
            bgColor: 'bg-slate-50',
            iconColor: 'text-slate-600',
            borderColor: 'border-slate-200',
            isCustomValue: true
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                    <div
                        key={index}
                        className={`${kpi.bgColor} border-2 ${kpi.borderColor} rounded-xl p-5 transition-all hover:shadow-lg hover:scale-105 ${
                            kpi.highlight ? 'ring-2 ring-emerald-300 ring-offset-2' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} border ${kpi.borderColor} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                            {kpi.label}
                        </p>
                        {kpi.isCustomValue ? (
                            <div className="mt-1">{kpi.value}</div>
                        ) : (
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-bold ${kpi.iconColor}`}>
                                    {kpi.value}
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase">
                                    {kpi.unit}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default KPICards;
