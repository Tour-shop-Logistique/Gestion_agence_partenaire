import React from 'react';
import { MagnifyingGlassIcon, FunnelIcon, InboxIcon } from '@heroicons/react/24/outline';

/**
 * 📭 ÉTAT VIDE AMÉLIORÉ
 * Affichage engageant quand aucune expédition n'est trouvée
 */

const EmptyState = ({ hasFilters, onResetFilters }) => {
    if (hasFilters) {
        // Aucun résultat avec filtres actifs
        return (
            <div className="text-center py-16 px-4">
                <div className="relative w-32 h-32 mx-auto mb-6">
                    {/* Cercles animés */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <MagnifyingGlassIcon className="w-16 h-16 text-indigo-400" />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Aucun résultat trouvé
                </h3>
                <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                    Aucune expédition ne correspond à vos critères de recherche.
                    Essayez de modifier ou supprimer certains filtres.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={onResetFilters}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105"
                    >
                        <FunnelIcon className="w-5 h-5" />
                        Réinitialiser les filtres
                    </button>
                </div>

                {/* Suggestions */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-md mx-auto">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">
                        💡 Suggestions
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1 text-left">
                        <li>• Vérifiez l'orthographe de votre recherche</li>
                        <li>• Essayez des mots-clés plus généraux</li>
                        <li>• Élargissez la plage de dates</li>
                        <li>• Supprimez certains filtres de statut</li>
                    </ul>
                </div>
            </div>
        );
    }

    // Aucune expédition du tout
    return (
        <div className="text-center py-20 px-4">
            <div className="relative w-40 h-40 mx-auto mb-8">
                {/* Boîte 3D */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl rotate-6 shadow-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white rounded-3xl -rotate-6 shadow-2xl"></div>
                <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl flex items-center justify-center border-2 border-slate-100">
                    <InboxIcon className="w-20 h-20 text-slate-300" />
                </div>
            </div>

            <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Aucune expédition
            </h3>
            <p className="text-base text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                Il n'y a aucune expédition pour la période sélectionnée.
                Essayez de modifier les dates ou créez une nouvelle expédition.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-105">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer une expédition
                </button>
            </div>

            {/* Statistiques vides */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                    { label: 'Expéditions', value: '0', icon: '📦' },
                    { label: 'Montant', value: '0 CFA', icon: '💰' },
                    { label: 'Commission', value: '0 CFA', icon: '📊' }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmptyState;
