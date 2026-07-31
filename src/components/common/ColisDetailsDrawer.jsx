import React from "react";
import { CubeIcon, ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Tiroir latéral affichant le détail d'UN colis (pas l'expédition entière) :
 * statut, articles, dimensions, valeur/frais, code de validation retrait.
 * Réutilisé par RetraitColis.jsx et ColisAReceptionner.jsx.
 *
 * @param {object|null} colis - Le colis à afficher, ou null pour ne rien rendre.
 * @param {() => void} onClose
 */
const ColisDetailsDrawer = ({ colis, onClose }) => {
    if (!colis) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">{colis.code_colis}</h3>
                        <p className="text-xs text-slate-500 font-medium">{colis.designation || 'Sans désignation'}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Statut : le libellé dépend du contexte d'appel - suivi de
                        réception en agence (ColisAReceptionner, is_received)
                        ou remise finale au client (RetraitColis, is_collected_by_client). */}
                    <div className="flex flex-wrap gap-2">
                        {colis.is_blocked && (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border-2 bg-rose-50 text-rose-700 border-rose-200">
                                Bloqué
                            </span>
                        )}
                        {colis.is_collected_by_client ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                                Retiré par le client
                            </span>
                        ) : colis.is_received_by_backoffice === false ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border-2 bg-amber-50 text-amber-700 border-amber-200">
                                En transit
                            </span>
                        ) : colis.is_received ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                                Réceptionné en agence
                            </span>
                        ) : colis.is_received_by_agence_destination === false ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border-2 bg-blue-50 text-blue-700 border-blue-200">
                                À réceptionner en agence
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border-2 bg-blue-50 text-blue-700 border-blue-200">
                                En attente de retrait
                            </span>
                        )}
                    </div>

                    {colis.motif_blocage && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 font-medium">
                            Motif de blocage : {colis.motif_blocage}
                        </div>
                    )}

                    {/* Articles */}
                    {Array.isArray(colis.articles) && colis.articles.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Articles</p>
                            <ul className="space-y-1.5">
                                {colis.articles.map((a, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                        <CubeIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        {a.designation || a}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Catégorie */}
                    {colis.category?.nom && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catégorie</p>
                            <p className="text-sm font-semibold text-slate-800">{colis.category.nom}</p>
                        </div>
                    )}

                    {/* Dimensions & poids */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dimensions &amp; poids</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Poids</p>
                                <p className="text-sm font-bold text-slate-900">{parseFloat(colis.poids || 0).toFixed(2)} kg</p>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Volume</p>
                                <p className="text-sm font-bold text-slate-900">{parseFloat(colis.volume || 0).toFixed(2)} cm³</p>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg col-span-2">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">L × l × H</p>
                                <p className="text-sm font-bold text-slate-900">
                                    {parseFloat(colis.longueur || 0)} × {parseFloat(colis.largeur || 0)} × {parseFloat(colis.hauteur || 0)} cm
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Valeur & frais */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Valeur &amp; frais</p>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Valeur estimée</span>
                                <span className="font-bold text-slate-900">{new Intl.NumberFormat('fr-FR').format(colis.prix_estimation || 0)} CFA</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Frais</span>
                                <span className="font-bold text-slate-900">{new Intl.NumberFormat('fr-FR').format(colis.total_a_payer_client || 0)} CFA</span>
                            </div>
                            {parseFloat(colis.frais_retard_retrait || 0) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-amber-600">Frais de retard</span>
                                    <span className="font-bold text-amber-700">{new Intl.NumberFormat('fr-FR').format(colis.frais_retard_retrait)} CFA</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Code de validation retrait */}
                    {(colis.code_validation_retrait || colis.date_limite_retrait) && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Code de validation</p>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                <ShieldCheckIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="text-sm font-mono font-bold text-slate-900">
                                    {colis.code_validation_retrait || 'N/A'}
                                </span>
                            </div>
                            {colis.date_limite_retrait && (
                                <p className="text-xs text-amber-600 font-medium mt-1.5">
                                    Limite de retrait : {new Date(colis.date_limite_retrait).toLocaleDateString('fr-FR')}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-200 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColisDetailsDrawer;
