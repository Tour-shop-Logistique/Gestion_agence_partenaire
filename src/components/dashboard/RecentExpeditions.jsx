import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CubeIcon,
    MapPinIcon,
    ArrowRightIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import { formatPriceDual } from "../../utils/format";
import { useExpedition } from "../../hooks/useExpedition";

/**
 * Liste des dernières expéditions avec leurs colis (style groupé comme page Colis à Envoyer)
 */
const RecentExpeditions = ({ expeditions = [] }) => {
    const { getExpeditionDetails } = useExpedition();
    const [expeditionsWithColis, setExpeditionsWithColis] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Charger les détails de chaque expédition (avec les colis)
    useEffect(() => {
        const loadExpeditionsDetails = async () => {
            if (!expeditions || expeditions.length === 0) {
                setExpeditionsWithColis([]);
                return;
            }

            setLoadingDetails(true);
            
            try {
                // Charger les détails des 5 premières expéditions
                const expeditionsToLoad = expeditions.slice(0, 5);
                const detailsPromises = expeditionsToLoad.map(exp => 
                    getExpeditionDetails(exp.id)
                );
                
                const results = await Promise.all(detailsPromises);
                
                // Extraire les données des résultats
                const loadedExpeditions = results.map((result, index) => {
                    if (result?.payload) {
                        return result.payload;
                    }
                    // Fallback sur l'expédition de base si le chargement échoue
                    return expeditionsToLoad[index];
                });
                
                setExpeditionsWithColis(loadedExpeditions);
            } catch (error) {
                console.error("Erreur lors du chargement des détails des expéditions:", error);
                // En cas d'erreur, afficher quand même les expéditions de base
                setExpeditionsWithColis(expeditions.slice(0, 5));
            } finally {
                setLoadingDetails(false);
            }
        };

        loadExpeditionsDetails();
    }, [expeditions, getExpeditionDetails]);

    const getStatusColor = (statut) => {
        const colors = {
            'recu_agence_depart': 'bg-blue-50 text-blue-700 border-blue-200',
            'en_transit_vers_agence_arrivee': 'bg-purple-50 text-purple-700 border-purple-200',
            'recu_agence_destination': 'bg-indigo-50 text-indigo-700 border-indigo-200',
            'en_cours_livraison': 'bg-amber-50 text-amber-700 border-amber-200',
            'livre': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'recupere': 'bg-green-50 text-green-700 border-green-200'
        };
        return colors[statut] || 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const getStatusLabel = (statut) => {
        const labels = {
            'recu_agence_depart': 'Reçu',
            'en_transit_vers_agence_arrivee': 'Transit',
            'recu_agence_destination': 'Arrivé',
            'en_cours_livraison': 'Livraison',
            'livre': 'Livré',
            'recupere': 'Récupéré'
        };
        return labels[statut] || statut;
    };

    const getTypeLabel = (type) => {
        const labels = {
            'groupage_dhd_aerien': 'DHD Aérien',
            'groupage_dhd_maritime': 'DHD Maritime',
            'groupage_ca': 'CA',
            'groupage_afrique': 'Afrique',
            'simple': 'Simple'
        };
        return labels[type] || type;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Header compact */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Dernières Expéditions</h3>
                    <span className="text-xs text-slate-500">(5 plus récentes)</span>
                    {loadingDetails && (
                        <span className="text-xs text-indigo-600 animate-pulse">Chargement...</span>
                    )}
                </div>
                <Link 
                    to="/expeditions"
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded transition-colors flex items-center gap-1"
                >
                    Tout voir
                    <ArrowRightIcon className="w-3 h-3" />
                </Link>
            </div>

            {/* Liste groupée avec colis (style page Colis à Envoyer) */}
            {expeditionsWithColis && expeditionsWithColis.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto">
                    {expeditionsWithColis.map((exp, expIndex) => {
                        // S'assurer que exp.colis existe et est un tableau
                        const colisList = Array.isArray(exp.colis) ? exp.colis : [];
                        
                        return (
                            <React.Fragment key={exp.id || `exp-${expIndex}`}>
                                {/* ══ SÉPARATEUR ENTRE EXPÉDITIONS ══ */}
                                {expIndex > 0 && (
                                    <div className="h-3 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-t-4 border-slate-200"></div>
                                )}

                                {/* 📦 EXPEDITION HEADER - Design Card-like avec ombre */}
                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Badge référence avec lien */}
                                            <Link 
                                                to={`/expeditions/${exp.id}`}
                                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                            >
                                                <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <span className="text-sm font-bold text-white tracking-wide">
                                                    {exp.reference}
                                                </span>
                                            </Link>
                                            
                                            {/* Séparateur vertical */}
                                            <div className="w-px h-4 bg-white/30"></div>
                                            
                                            {/* Trajet */}
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-medium text-white/90">{exp.pays_depart}</span>
                                                <svg className="w-3.5 h-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                <span className="text-xs font-medium text-white">{exp.pays_destination}</span>
                                            </div>

                                            {/* Type */}
                                            <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold text-white uppercase border border-white/30">
                                                {getTypeLabel(exp.type)}
                                            </span>

                                            {/* Statut */}
                                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${getStatusColor(exp.statut_expedition || exp.statut)}`}>
                                                {getStatusLabel(exp.statut_expedition || exp.statut)}
                                            </span>
                                        </div>

                                        {/* Compteur colis + Montant */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-2.5 py-1 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30">
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span className="text-xs font-bold text-white">{colisList.length}</span>
                                                <span className="text-xs font-medium text-white/80">colis</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">
                                                    {new Intl.NumberFormat('fr-FR').format(exp.montant_expedition || exp.montant || 0)}
                                                </p>
                                                <p className="text-[9px] text-white/70 font-medium">CFA</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Ligne de transition header → colis (bordure fine) ── */}
                                <div className="h-0.5 bg-indigo-100 border-b border-indigo-200"></div>

                                {/* 📋 COLIS ROWS (si présents) */}
                                {colisList.length > 0 ? (
                                    colisList.slice(0, 3).map((colis, colisIndex) => {
                                        const isLastColis = colisIndex === Math.min(colisList.length, 3) - 1;
                                        
                                        return (
                                            <div
                                                key={colis.id || `${exp.id}-colis-${colisIndex}`}
                                                className={`flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 transition-colors ${
                                                    isLastColis 
                                                        ? 'border-b-2 border-slate-200' 
                                                        : 'border-b border-slate-100'
                                                }`}
                                            >
                                                {/* Icône colis */}
                                                <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                    <CubeIcon className="w-3.5 h-3.5 text-slate-600" />
                                                </div>

                                                {/* Code colis + désignation */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-indigo-600 truncate">
                                                        {colis.code_colis}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 truncate">
                                                        {colis.designation || 'Sans désignation'}
                                                    </p>
                                                </div>

                                                {/* Catégorie */}
                                                {colis.category?.nom && (
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase rounded border border-indigo-100 flex-shrink-0">
                                                        {colis.category.nom}
                                                    </span>
                                                )}

                                                {/* Poids */}
                                                <div className="text-right flex-shrink-0 min-w-[60px]">
                                                    <p className="text-xs font-bold text-slate-900">
                                                        {parseFloat(colis.poids || 0).toFixed(2)} kg
                                                    </p>
                                                </div>

                                                {/* Montant */}
                                                <div className="text-right flex-shrink-0 min-w-[90px]">
                                                    <p className="text-xs font-bold text-slate-900">
                                                        {formatPriceDual(colis.montant_colis_total)}
                                                    </p>
                                                </div>

                                                {/* État */}
                                                {colis.is_received_by_agence_destination && (
                                                    <div className="flex-shrink-0">
                                                        <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-3 text-center bg-slate-50 border-b-2 border-slate-200">
                                        <p className="text-[10px] text-slate-400 italic">Chargement des colis...</p>
                                    </div>
                                )}

                                {/* Indicateur "voir plus" si plus de 3 colis */}
                                {colisList.length > 3 && (
                                    <Link
                                        to={`/expeditions/${exp.id}`}
                                        className="block px-4 py-2 text-center bg-slate-50 hover:bg-indigo-50 transition-colors border-b-2 border-slate-200"
                                    >
                                        <p className="text-[10px] font-bold text-indigo-600">
                                            + {colisList.length - 3} colis supplémentaire{colisList.length - 3 > 1 ? 's' : ''} • Voir tous les détails →
                                        </p>
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            ) : (
                <div className="px-6 py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center">
                        <CubeIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">Aucune expédition</p>
                    <p className="text-xs text-slate-400">Les expéditions créées apparaîtront ici</p>
                </div>
            )}
        </div>
    );
};

export default RecentExpeditions;
