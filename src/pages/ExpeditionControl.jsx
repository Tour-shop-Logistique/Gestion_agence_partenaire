import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Package, Scissors, Calculator, Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import { Button, PageHeader } from '../components/ui';
import { useExpedition } from '../hooks/useExpedition';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import useHasPermission from '../hooks/useHasPermission';
import { toast } from '../utils/toast';
import {
    updateColisControl,
    splitColisControl,
    recalculateExpeditionTarif,
    realtimeExpeditionPatched,
    realtimeCurrentExpeditionColisPatched,
} from '../store/slices/expeditionSlice';

const formatCFA = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0) + ' CFA';

/**
 * 🔍 CONTRÔLE PHYSIQUE D'UNE EXPÉDITION
 * Écran dédié pour corriger poids/dimensions/frais des colis d'une demande
 * client une fois arrivés physiquement à l'agence (après acceptation, avant
 * confirmation du départ), scinder un colis en plusieurs, puis recalculer
 * explicitement le tarif - le client est notifié du nouveau montant.
 */
const ExpeditionControl = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const canControl = useHasPermission('expeditions.control');
    const { currentUser } = useAuth();

    const { currentExpedition: expedition, getExpeditionDetails, message, error, resetStatus } = useExpedition();

    const [editingColisId, setEditingColisId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [splittingColisId, setSplittingColisId] = useState(null);
    const [splitParts, setSplitParts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);

    useEffect(() => {
        if (id) getExpeditionDetails(id);
    }, [id, getExpeditionDetails]);

    // Temps réel : un collègue sur un autre poste peut contrôler la même
    // expédition en parallèle - patch local pour Colis.controlled et
    // Expedition.tarif_recalculated, refetch complet pour Colis.split (les
    // colis d'origine étant supprimés côté serveur, un patch partiel serait
    // incohérent, voir realtimeCurrentExpeditionColisPatched).
    useWebSocket(
        currentUser?.agence_id,
        {
            onColisControlled: (data) => {
                const items = Array.isArray(data) ? data : [data];
                dispatch(realtimeCurrentExpeditionColisPatched(items));
            },
            onColisSplit: (data) => {
                const items = Array.isArray(data) ? data : [data];
                if (items.some((c) => c?.expedition_id === expedition?.id) && id) {
                    getExpeditionDetails(id);
                }
            },
            onExpeditionTarifRecalculated: (data) => {
                const updated = Array.isArray(data) ? data[0] : data;
                if (updated) dispatch(realtimeExpeditionPatched(updated));
            },
        },
        !!currentUser?.agence_id
    );

    useEffect(() => {
        if (message) { toast.success(message); resetStatus(); }
    }, [message, resetStatus]);

    useEffect(() => {
        if (error) { toast.error(error); resetStatus(); }
    }, [error, resetStatus]);

    if (!expedition) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Spinner size="xl" color="indigo" />
                <p className="mt-4 text-sm font-medium text-slate-500">Chargement des données...</p>
            </div>
        );
    }

    if (expedition.statut_expedition !== 'accepted') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <p className="text-sm font-semibold text-slate-600">
                    Le contrôle n'est disponible qu'une fois la demande acceptée, avant confirmation du départ.
                </p>
                <Button className="mt-4" onClick={() => navigate(-1)}>Retour</Button>
            </div>
        );
    }

    const colisList = expedition.colis || [];

    const startEdit = (colis) => {
        setSplittingColisId(null);
        setEditingColisId(colis.id);
        setEditForm({
            poids: colis.poids ?? '',
            longueur: colis.longueur ?? '',
            largeur: colis.largeur ?? '',
            hauteur: colis.hauteur ?? '',
            prix_emballage: colis.prix_emballage ?? '',
            designation: colis.designation ?? '',
        });
    };

    const cancelEdit = () => {
        setEditingColisId(null);
        setEditForm({});
    };

    const saveEdit = async (colisId) => {
        setIsSubmitting(true);
        try {
            const payload = {
                poids: parseFloat(editForm.poids),
                longueur: editForm.longueur === '' ? 0 : parseFloat(editForm.longueur),
                largeur: editForm.largeur === '' ? 0 : parseFloat(editForm.largeur),
                hauteur: editForm.hauteur === '' ? 0 : parseFloat(editForm.hauteur),
                prix_emballage: editForm.prix_emballage === '' ? 0 : parseFloat(editForm.prix_emballage),
                designation: editForm.designation || null,
            };
            const result = await dispatch(updateColisControl({ expeditionId: expedition.id, colisId, data: payload }));
            if (!result.error) {
                cancelEdit();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const startSplit = (colis) => {
        setEditingColisId(null);
        setSplittingColisId(colis.id);
        setSplitParts([
            { poids: '', longueur: '', largeur: '', hauteur: '', prix_emballage: '', designation: colis.designation || '' },
            { poids: '', longueur: '', largeur: '', hauteur: '', prix_emballage: '', designation: colis.designation || '' },
        ]);
    };

    const cancelSplit = () => {
        setSplittingColisId(null);
        setSplitParts([]);
    };

    const addSplitPart = () => {
        setSplitParts(prev => [...prev, { poids: '', longueur: '', largeur: '', hauteur: '', prix_emballage: '', designation: '' }]);
    };

    const removeSplitPart = (index) => {
        setSplitParts(prev => prev.filter((_, i) => i !== index));
    };

    const updateSplitPart = (index, field, value) => {
        setSplitParts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    const confirmSplit = async (colisId) => {
        if (splitParts.length < 2) {
            toast.error('Un colis scindé doit donner au moins 2 nouveaux colis.');
            return;
        }
        if (splitParts.some(p => !p.poids || parseFloat(p.poids) <= 0)) {
            toast.error('Chaque nouveau colis doit avoir un poids renseigné.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = splitParts.map(p => ({
                poids: parseFloat(p.poids),
                longueur: p.longueur === '' ? 0 : parseFloat(p.longueur),
                largeur: p.largeur === '' ? 0 : parseFloat(p.largeur),
                hauteur: p.hauteur === '' ? 0 : parseFloat(p.hauteur),
                prix_emballage: p.prix_emballage === '' ? 0 : parseFloat(p.prix_emballage),
                designation: p.designation || null,
            }));
            const result = await dispatch(splitColisControl({ expeditionId: expedition.id, colisId, colis: payload }));
            if (!result.error) {
                cancelSplit();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            const result = await dispatch(recalculateExpeditionTarif(expedition.id));
            if (!result.error && result.payload) {
                const { montantAvant, montantApres } = result.payload;
                if (montantAvant !== montantApres) {
                    toast.success(`Nouveau montant : ${formatCFA(montantApres)} (avant : ${formatCFA(montantAvant)})`);
                }
            }
        } finally {
            setIsRecalculating(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <PageHeader
                            onBack={() => navigate(-1)}
                            eyebrow="Contrôle avant départ"
                            title={expedition.reference}
                            subtitle={`${colisList.length} colis • Montant actuel : ${formatCFA(expedition.montant_expedition)}`}
                        />
                    </div>
                </div>

                {!canControl && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                        Vous n'avez pas la permission de contrôler les expéditions. Contactez l'administrateur de votre agence.
                    </div>
                )}

                <div className="space-y-3">
                    {colisList.map((colis) => (
                        <div key={colis.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Package className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                    <span className="text-xs font-mono font-bold text-slate-700 truncate">{colis.code_colis}</span>
                                    <span className="text-sm text-slate-600 truncate">{colis.designation}</span>
                                </div>
                                {canControl && editingColisId !== colis.id && splittingColisId !== colis.id && (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => startEdit(colis)}
                                            className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            Corriger
                                        </button>
                                        <button
                                            onClick={() => startSplit(colis)}
                                            className="px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Scissors className="w-3.5 h-3.5" /> Scinder
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Affichage normal */}
                            {editingColisId !== colis.id && splittingColisId !== colis.id && (
                                <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Poids</p>
                                        <p className="font-semibold text-slate-800">{colis.poids} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Dimensions</p>
                                        <p className="font-semibold text-slate-800">
                                            {colis.longueur || 0}×{colis.largeur || 0}×{colis.hauteur || 0} cm
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Emballage</p>
                                        <p className="font-semibold text-slate-800">{formatCFA(colis.prix_emballage)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total colis</p>
                                        <p className="font-semibold text-indigo-600">{formatCFA(colis.montant_colis_total)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Formulaire de correction */}
                            {editingColisId === colis.id && (
                                <div className="px-4 py-4 space-y-3 bg-indigo-50/40">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Poids (kg) *</label>
                                            <input
                                                type="number" step="0.01" min="0.01"
                                                value={editForm.poids}
                                                onChange={(e) => setEditForm({ ...editForm, poids: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Longueur (cm)</label>
                                            <input
                                                type="number" step="0.1" min="0"
                                                value={editForm.longueur}
                                                onChange={(e) => setEditForm({ ...editForm, longueur: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Largeur (cm)</label>
                                            <input
                                                type="number" step="0.1" min="0"
                                                value={editForm.largeur}
                                                onChange={(e) => setEditForm({ ...editForm, largeur: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Hauteur (cm)</label>
                                            <input
                                                type="number" step="0.1" min="0"
                                                value={editForm.hauteur}
                                                onChange={(e) => setEditForm({ ...editForm, hauteur: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Frais d'emballage (CFA)</label>
                                            <input
                                                type="number" step="1" min="0"
                                                value={editForm.prix_emballage}
                                                onChange={(e) => setEditForm({ ...editForm, prix_emballage: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Désignation</label>
                                            <input
                                                type="text"
                                                value={editForm.designation}
                                                onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-1">
                                        <button
                                            onClick={cancelEdit}
                                            disabled={isSubmitting}
                                            className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={() => saveEdit(colis.id)}
                                            disabled={isSubmitting || !editForm.poids}
                                            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Formulaire de split */}
                            {splittingColisId === colis.id && (
                                <div className="px-4 py-4 space-y-3 bg-amber-50/40">
                                    <p className="text-xs font-semibold text-amber-700">
                                        Ce colis sera remplacé par les {splitParts.length} colis ci-dessous.
                                    </p>
                                    {splitParts.map((part, index) => (
                                        <div key={index} className="p-3 bg-white border border-amber-200 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-amber-700 uppercase">Colis {index + 1}</span>
                                                {splitParts.length > 2 && (
                                                    <button onClick={() => removeSplitPart(index)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                <input
                                                    type="number" step="0.01" min="0.01" placeholder="Poids (kg) *"
                                                    value={part.poids}
                                                    onChange={(e) => updateSplitPart(index, 'poids', e.target.value)}
                                                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                                />
                                                <input
                                                    type="number" step="0.1" min="0" placeholder="Longueur"
                                                    value={part.longueur}
                                                    onChange={(e) => updateSplitPart(index, 'longueur', e.target.value)}
                                                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                                />
                                                <input
                                                    type="number" step="0.1" min="0" placeholder="Largeur"
                                                    value={part.largeur}
                                                    onChange={(e) => updateSplitPart(index, 'largeur', e.target.value)}
                                                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                                />
                                                <input
                                                    type="number" step="0.1" min="0" placeholder="Hauteur"
                                                    value={part.hauteur}
                                                    onChange={(e) => updateSplitPart(index, 'hauteur', e.target.value)}
                                                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number" step="1" min="0" placeholder="Frais emballage (CFA)"
                                                    value={part.prix_emballage}
                                                    onChange={(e) => updateSplitPart(index, 'prix_emballage', e.target.value)}
                                                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                                />
                                                <input
                                                    type="text" placeholder="Désignation"
                                                    value={part.designation}
                                                    onChange={(e) => updateSplitPart(index, 'designation', e.target.value)}
                                                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addSplitPart}
                                        className="w-full py-2 text-xs font-bold text-amber-700 border-2 border-dashed border-amber-300 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Ajouter un colis
                                    </button>
                                    <div className="flex justify-end gap-2 pt-1">
                                        <button
                                            onClick={cancelSplit}
                                            disabled={isSubmitting}
                                            className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={() => confirmSplit(colis.id)}
                                            disabled={isSubmitting}
                                            className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            Confirmer la scission
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Recalcul du tarif */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-slate-800">Montant actuel de l'expédition</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCFA(expedition.montant_expedition)}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Après correction des colis, recalculez le tarif pour appliquer les changements — le client sera notifié du nouveau montant.
                        </p>
                    </div>
                    {canControl && (
                        <button
                            onClick={handleRecalculate}
                            disabled={isRecalculating}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                        >
                            {isRecalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                            Recalculer le tarif
                        </button>
                    )}
                </div>

                <button
                    onClick={() => navigate(`/expeditions/${expedition.id}`)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
                >
                    <ArrowLeft className="w-4 h-4" /> Retour à la fiche expédition
                </button>
            </div>
        </div>
    );
};

export default ExpeditionControl;
