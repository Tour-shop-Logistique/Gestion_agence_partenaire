import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    EyeIcon, 
    PrinterIcon, 
    PencilIcon, 
    ClockIcon,
    EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';
import StatusTimeline from './StatusTimeline';
import PaymentBadge from './PaymentBadge';

/**
 * 📋 LIGNE D'EXPÉDITION (DESKTOP)
 * Style: Linear / Notion
 * - Hover effects
 * - Actions rapides
 * - Popover au survol
 * - Design moderne
 */

const ExpeditionRow = ({ 
    expedition, 
    onPrint, 
    getStatusBorderColor,
    getTypeStyle,
    getTypeLabel,
    formatPriceDual,
    getAgencyCommission
}) => {
    const navigate = useNavigate();
    const [showActions, setShowActions] = useState(false);
    const [showPopover, setShowPopover] = useState(false);

    const handleRowClick = (e) => {
        // Éviter la navigation si on clique sur un bouton d'action
        if (e.target.closest('.action-button')) {
            return;
        }
        navigate(`/expeditions/${expedition.id}`);
    };

    const formatRelativeDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: 'short' 
        });
    };

    return (
        <tr
            onClick={handleRowClick}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => { setShowActions(false); setShowPopover(false); }}
            className={`group relative hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer border-l-[3px] ${getStatusBorderColor(expedition.statut_expedition)}`}
        >
            {/* Référence + Date + Type */}
            <td className="px-5 py-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors tabular-nums tracking-tight">
                        {expedition.reference}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                        {formatRelativeDate(expedition.created_at)}
                    </span>
                    <span className={`mt-1 self-start px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${getTypeStyle(expedition.type_expedition)}`}>
                        {getTypeLabel(expedition.type_expedition)}
                    </span>
                </div>
            </td>

            {/* Expéditeur / Destinataire */}
            <td className="px-5 py-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                            E
                        </div>
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">
                            {expedition.expediteur?.nom_prenom || '—'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                            D
                        </div>
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">
                            {expedition.destinataire?.nom_prenom || '—'}
                        </span>
                    </div>
                </div>
            </td>

            {/* Trajet */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg whitespace-nowrap">
                        {expedition.pays_depart}
                    </span>
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-xs font-semibold text-indigo-600 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg whitespace-nowrap">
                        {expedition.pays_destination}
                    </span>
                </div>
            </td>

            {/* Montant + Colis */}
            <td className="px-5 py-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatPriceDual(expedition.montant_expedition)}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="font-semibold">{expedition.colis?.length || 0} colis</span>
                    </div>
                    {/* Commission badge */}
                    <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-[9px] text-indigo-400 font-medium">Com.</span>
                        <span className="text-[10px] font-bold text-indigo-600 tabular-nums">
                            {new Intl.NumberFormat('fr-FR').format(getAgencyCommission(expedition))} CFA
                        </span>
                    </div>
                </div>
            </td>

            {/* Statut (Timeline) */}
            <td className="px-5 py-4">
                <StatusTimeline currentStatus={expedition.statut_expedition} />
            </td>

            {/* Paiement */}
            <td className="px-5 py-4">
                <PaymentBadge
                    paymentStatus={expedition.statut_paiement_expedition}
                    fraisAnnexes={expedition.frais_annexes}
                    fraisStatus={expedition.statut_paiement_frais}
                />
            </td>

            {/* Actions */}
            <td className="px-5 py-4">
                <div className={`flex items-center gap-2 transition-all duration-200 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/expeditions/${expedition.id}`);
                        }}
                        className="action-button p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all hover:scale-110"
                        title="Voir les détails"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPrint(expedition);
                        }}
                        className="action-button p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all hover:scale-110"
                        title="Imprimer"
                    >
                        <PrinterIcon className="w-4 h-4" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/expeditions/${expedition.id}/edit`);
                        }}
                        className="action-button p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-all hover:scale-110"
                        title="Modifier"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>

                    <div className="relative">
                        <button
                            onMouseEnter={() => setShowPopover(true)}
                            className="action-button p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 transition-all hover:scale-110"
                            title="Plus d'actions"
                        >
                            <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>

                        {/* Popover au survol */}
                        {showPopover && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide">
                                    Aperçu rapide
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <ClockIcon className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium">
                                            Créée le {new Date(expedition.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                    {expedition.expediteur?.telephone && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span className="font-mono">{expedition.expediteur.telephone}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            Dernière mise à jour: {formatRelativeDate(expedition.updated_at || expedition.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
};

export default ExpeditionRow;
