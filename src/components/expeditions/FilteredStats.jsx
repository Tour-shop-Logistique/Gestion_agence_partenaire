import React from 'react';
import { getCurrencyLabel } from '../../utils/format';

/**
 * Bandeau de stats sur la sélection filtrée, dans un seul cadre englobant.
 * Pas d'accent de couleur par item : seules les lignes de séparation
 * distinguent les colonnes, pour rester net et pas trop chargé.
 */

const FilteredStats = ({ expeditions, getAgencyCommission }) => {
    if (!expeditions || expeditions.length === 0) return null;

    const totalCount = expeditions.length;
    const totalAmount = expeditions.reduce((sum, e) => sum + parseFloat(e.montant_expedition || 0), 0);
    const totalCommission = expeditions.reduce((sum, e) => sum + getAgencyCommission(e), 0);
    const totalColis = expeditions.reduce((sum, e) => sum + (e.colis?.length || 0), 0);

    const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount);

    const items = [
        { label: 'Résultats', value: totalCount, unit: 'expéditions' },
        { label: 'Montant', value: formatCurrency(totalAmount), unit: getCurrencyLabel() },
        { label: 'Commission', value: formatCurrency(totalCommission), unit: `${getCurrencyLabel()} agence` },
        { label: 'Colis', value: totalColis, unit: 'total' },
    ];

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Sélection filtrée
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y divide-slate-200 sm:divide-y-0 sm:divide-x sm:divide-slate-200">
                {items.map((item, i) => (
                    <div key={item.label} className={`py-2 sm:py-0 ${i > 0 ? 'sm:pl-4' : ''} ${i < items.length - 1 ? 'sm:pr-4' : ''}`}>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                            {item.label}
                        </p>
                        <p className="text-lg font-bold text-slate-900 tabular-nums leading-tight">
                            {item.value}
                        </p>
                        <p className="text-[10px] text-slate-400">{item.unit}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilteredStats;
