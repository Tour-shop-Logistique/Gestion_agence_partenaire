import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { STATUS_CONFIG } from './StatusFilter';
import { getStatusLabel, formatRelativeDate } from '../../utils/expeditionHelpers';

/**
 * 📋 LIGNE DE LISTE EXPÉDITION + COLIS
 * Design inspiré d'une vue de suivi colis :
 * - Ligne expédition compacte (référence, client, pays, type, montant, statut, accès rapide)
 * - Sous-lignes colis (code, désignation, statut de réception) pour un accès direct au détail
 */

const getStatusStyle = (status) => {
    const key = status === 'delivered' ? 'termined' : status;
    return STATUS_CONFIG[key] || {
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200'
    };
};

const getColisReceptionStatus = (colis) => {
    if (colis.is_collected_by_client) {
        return { label: 'Retiré client', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (colis.is_received) {
        return { label: 'Réceptionné', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (colis.is_received_by_backoffice) {
        return { label: 'Reçu backoffice', className: 'bg-green-50 text-green-700 border-green-200' };
    }
    return { label: 'En transit', className: 'bg-amber-50 text-amber-700 border-amber-200' };
};

const ExpeditionListItem = ({
    expedition,
    getTypeStyle,
    getTypeLabel,
    formatPriceDual,
    onSelectColis
}) => {
    const navigate = useNavigate();
    const colisList = Array.isArray(expedition.colis) ? expedition.colis : [];
    const statusStyle = getStatusStyle(expedition.statut_expedition);
    const clientName = expedition.expediteur?.nom_prenom || expedition.destinataire?.nom_prenom || '—';

    const goToDetails = () => navigate(`/expeditions/${expedition.id}`);

    return (
        <div className="group/exp">
            {/* Ligne expédition */}
            <div
                onClick={goToDetails}
                className="flex flex-wrap lg:flex-nowrap items-center gap-3 lg:gap-4 px-4 py-3.5 cursor-pointer hover:bg-indigo-50/30 transition-colors"
            >
                {/* Icône + référence + sous-titre */}
                <div className="flex items-center gap-3 min-w-0 flex-1 basis-full lg:basis-auto">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base flex-shrink-0">
                        📦
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{expedition.reference}</p>
                        <p className="text-xs text-slate-500 truncate">
                            {clientName} · {formatRelativeDate(expedition.created_at)}
                        </p>
                    </div>
                </div>

                {/* Pays */}
                <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 w-28 flex-shrink-0">
                    <MapPinIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{expedition.pays_destination || expedition.pays_depart || '—'}</span>
                </div>

                {/* Badge type */}
                <span className={`hidden lg:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border flex-shrink-0 ${getTypeStyle(expedition.type_expedition)}`}>
                    {getTypeLabel(expedition.type_expedition)}
                </span>

                {/* Montant */}
                <span className="text-sm font-bold text-slate-900 tabular-nums w-24 flex-shrink-0 lg:text-right">
                    {formatPriceDual(expedition.montant_expedition)}
                </span>

                {/* Badge statut */}
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}>
                    {getStatusLabel(expedition.statut_expedition)}
                </span>

                {/* Compteur colis (mobile) */}
                <span className="lg:hidden text-[10px] font-semibold text-slate-400">
                    {colisList.length} colis
                </span>

                {/* Voir détails */}
                <button
                    onClick={(e) => { e.stopPropagation(); goToDetails(); }}
                    className="ml-auto lg:ml-0 w-8 h-8 rounded-full bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center hover:bg-sky-100 transition-all flex-shrink-0"
                    title="Voir les détails"
                >
                    <EyeIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Sous-lignes colis */}
            {colisList.length > 0 && (
                <div className="bg-slate-50/60 border-t border-slate-100">
                    {colisList.map((item) => {
                        const receptionStatus = getColisReceptionStatus(item);
                        return (
                            <div
                                key={item.id || item.code_colis}
                                onClick={() => onSelectColis?.(item)}
                                className="flex items-center gap-2.5 pl-8 pr-4 py-2.5 border-t border-slate-100 first:border-t-0 hover:bg-white cursor-pointer transition-colors"
                            >
                                <span className="text-slate-300 text-xs flex-shrink-0">└</span>
                                <span className="text-sm flex-shrink-0">📦</span>
                                <span className="text-xs font-bold text-indigo-600 truncate">{item.code_colis}</span>
                                <span className="text-xs text-slate-400 truncate hidden sm:inline">· {item.designation || 'Sans désignation'}</span>
                                <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border flex-shrink-0 ${receptionStatus.className}`}>
                                    {receptionStatus.label}
                                </span>
                                <ChevronRightIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ExpeditionListItem;
