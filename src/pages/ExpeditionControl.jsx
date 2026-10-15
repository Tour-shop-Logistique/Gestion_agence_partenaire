import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Package, Scissors, Calculator, Loader2, Plus, Trash2, ArrowLeft, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import { Button, PageHeader } from '../components/ui';
import SearchableDropdown from '../components/common/SearchableDropdown';
import { useExpedition } from '../hooks/useExpedition';
import { useAuth } from '../hooks/useAuth';
import { useTarifs } from '../hooks/useTarifs';
import { useAgency } from '../hooks/useAgency';
import { useWebSocket } from '../hooks/useWebSocket';
import useHasPermission from '../hooks/useHasPermission';
import { toast } from '../utils/toast';
import { expeditionsApi } from '../utils/api/expeditions';
import {
    updateColisControl,
    splitColisControl,
    recalculateExpeditionTarif,
    realtimeExpeditionPatched,
    realtimeCurrentExpeditionColisPatched,
} from '../store/slices/expeditionSlice';
import { getCurrencyLabel } from '../utils/format';

const formatFCFA = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0) + ' ' + getCurrencyLabel();

// Types nécessitant une category_id par colis pour le calcul du tarif
// (voir ExpeditionTarificationService côté backend) - si l'expédition change
// vers l'un de ces types et qu'un colis existant n'a pas de catégorie, le
// recalcul échoue sans ce champ.
const TYPES_REQUERANT_CATEGORIE = ['groupage_dhd_aerien', 'groupage_dhd_maritime', 'groupage_ca', 'groupage_afrique'];

const TYPE_LABELS = {
    simple: 'Livraison directe (LD)',
    groupage_dhd_aerien: 'Groupage DHD Aérien',
    groupage_dhd_maritime: 'Groupage DHD Maritime',
    groupage_afrique: 'Groupage Afrique',
    groupage_ca: 'Groupage CA',
    interville: 'Interville (National)',
};

const STATUT_PAIEMENT_LABELS = {
    paye: 'Payé',
    en_attente: 'En attente',
};

const emptyPersonForm = () => ({
    nom_prenom: '', telephone: '', email: '', adresse: '', ville: '',
    societe: '', code_postal: '', etat: '', quartier: '',
});

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

    const {
        currentExpedition: expedition, getExpeditionDetails, message, error, resetStatus,
        categories, loadCategories, updateExpedition,
    } = useExpedition();

    const [editingColisId, setEditingColisId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [splittingColisId, setSplittingColisId] = useState(null);
    const [splitParts, setSplitParts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);

    const [isEditingExpedition, setIsEditingExpedition] = useState(false);
    const [expeditionForm, setExpeditionForm] = useState(null);
    const [colisCategories, setColisCategories] = useState({});
    const [isSavingExpedition, setIsSavingExpedition] = useState(false);

    const { data: agencyData } = useAgency();
    const { intervilleTarifs, fetchTarifsInterville, formatsColis, fetchFormatsColis } = useTarifs();

    useEffect(() => { fetchTarifsInterville(); }, [fetchTarifsInterville]);
    useEffect(() => { fetchFormatsColis(); }, [fetchFormatsColis]);

    const communeDepartId = agencyData?.agence?.commune_id || agencyData?.commune_id || null;
    const intervilleAvailableCommunes = useMemo(() => {
        if (!communeDepartId) return [];
        const tarifs = Array.isArray(intervilleTarifs) ? intervilleTarifs : [];
        const byId = {};
        tarifs.forEach((t) => {
            if (t.commune_a_id === communeDepartId && t.commune_b) {
                byId[t.commune_b.id] = { id: t.commune_b.id, label: t.commune_b.nom };
            } else if (t.commune_b_id === communeDepartId && t.commune_a) {
                byId[t.commune_a.id] = { id: t.commune_a.id, label: t.commune_a.nom };
            }
        });
        return Object.values(byId).sort((a, b) => a.label.localeCompare(b.label));
    }, [intervilleTarifs, communeDepartId]);

    useEffect(() => {
        if (id) getExpeditionDetails(id);
    }, [id, getExpeditionDetails]);

    useEffect(() => {
        const onVisible = () => { if (!document.hidden && id) getExpeditionDetails(id); };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [id, getExpeditionDetails]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

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
            onExpeditionStatusChanged: (data) => {
                const items = Array.isArray(data) ? data : [data];
                if (items.some((e) => String(e?.id) === String(id)) && id) {
                    getExpeditionDetails(id);
                }
            },
            onExpeditionPaymentConfirmed: (data) => {
                const items = Array.isArray(data) ? data : [data];
                if (items.some((e) => String(e?.id) === String(id)) && id) {
                    getExpeditionDetails(id);
                }
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

    // Le contrôle physique se fait souvent après réception des colis, pas
    // seulement entre acceptation et réception - une expédition dont les
    // colis ont déjà été marqués reçus à l'agence de départ doit rester
    // contrôlable, sinon la fenêtre se referme avant que l'agence ait pu
    // vérifier poids/dimensions/frais.
    if (!['accepted', 'recu_agence_depart'].includes(expedition.statut_expedition)) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <p className="text-sm font-semibold text-slate-600">
                    Le contrôle n'est disponible qu'une fois la demande acceptée, avant confirmation du départ.
                </p>
                <Button className="mt-4" onClick={() => navigate(-1)}>Retour</Button>
            </div>
        );
    }

    if (expedition.statut_paiement_expedition === 'paye') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                    Les frais d'expédition ont déjà été encaissés.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                    Le contrôle n'est plus possible une fois le paiement confirmé.
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
            format_colis_id: colis.format_colis_id ?? '',
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
                ...(editForm.format_colis_id ? { format_colis_id: editForm.format_colis_id } : {}),
            };
            const result = await dispatch(updateColisControl({ expeditionId: expedition.id, colisId, data: payload }));
            if (!result.error) {
                cancelEdit();
                await handleRecalculate();
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

    const startEditExpedition = () => {
        setExpeditionForm({
            type_expedition: expedition.type_expedition || 'simple',
            pays_depart: expedition.pays_depart || '',
            pays_destination: expedition.pays_destination || '',
            code_pays_depart: expedition.code_pays_depart || '',
            code_pays_destination: expedition.code_pays_destination || '',
            is_paiement_credit: !!expedition.is_paiement_credit,
            is_livraison_domicile: !!expedition.is_livraison_domicile,
            statut_paiement: expedition.statut_paiement || 'en_attente',
            expediteur: { ...emptyPersonForm(), ...(expedition.expediteur || {}) },
            destinataire: { ...emptyPersonForm(), ...(expedition.destinataire || {}) },
            destinataire_commune_id: expedition.destinataire_commune_id || null,
        });
        // Pré-remplir avec les category_id déjà présentes, pour ne
        // redemander que celles qui manquent réellement.
        const initialCategories = {};
        (expedition.colis || []).forEach((c) => {
            if (c.category_id) initialCategories[c.id] = c.category_id;
        });
        setColisCategories(initialCategories);
        setIsEditingExpedition(true);
    };

    const cancelEditExpedition = () => {
        setIsEditingExpedition(false);
        setExpeditionForm(null);
        setColisCategories({});
    };

    const typeRequiresCategorie = TYPES_REQUERANT_CATEGORIE.includes(expeditionForm?.type_expedition);
    const colisSansCategorie = typeRequiresCategorie
        ? colisList.filter((c) => !colisCategories[c.id])
        : [];

    const saveExpedition = async () => {
        if (!expeditionForm) return;
        if (typeRequiresCategorie && colisSansCategorie.length > 0) {
            toast.error('Sélectionnez une catégorie pour chaque colis avant de continuer.');
            return;
        }

        setIsSavingExpedition(true);
        try {
            const payload = {
                type_expedition: expeditionForm.type_expedition,
                pays_depart: expeditionForm.pays_depart,
                pays_destination: expeditionForm.pays_destination,
                code_pays_depart: expeditionForm.code_pays_depart || null,
                code_pays_destination: expeditionForm.code_pays_destination || null,
                is_paiement_credit: expeditionForm.is_paiement_credit,
                is_livraison_domicile: expeditionForm.is_livraison_domicile,
                statut_paiement: expeditionForm.statut_paiement,
                ...(expeditionForm.type_expedition === 'interville' && expeditionForm.destinataire_commune_id
                    ? { destinataire_commune_id: expeditionForm.destinataire_commune_id }
                    : {}),
            };
            Object.entries(expeditionForm.expediteur).forEach(([k, v]) => {
                payload[`expediteur_${k}`] = v || null;
            });
            Object.entries(expeditionForm.destinataire).forEach(([k, v]) => {
                payload[`destinataire_${k}`] = v || null;
            });
            if (typeRequiresCategorie && Object.keys(colisCategories).length > 0) {
                payload.colis_categories = colisCategories;
            }

            const result = await updateExpedition(expedition.id, payload);
            if (!result.error) {
                cancelEditExpedition();
                if (result.payload?.montantAvant !== undefined && result.payload?.montantAvant !== result.payload?.montantApres) {
                    toast.success(`Nouveau montant : ${formatFCFA(result.payload.montantApres)} (avant : ${formatFCFA(result.payload.montantAvant)})`);
                }
            }
        } finally {
            setIsSavingExpedition(false);
        }
    };

    const saveAgenceArrivee = async (agenceId) => {
        setIsSavingAgenceArrivee(true);
        try {
            const result = await expeditionsApi.choisirAgenceArrivee(expedition.id, agenceId);
            if (result.success) {
                toast.success(result.message);
                getExpeditionDetails(id);
            } else {
                toast.error(result.message);
            }
        } finally {
            setIsSavingAgenceArrivee(false);
        }
    };

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            const result = await dispatch(recalculateExpeditionTarif(expedition.id));
            if (!result.error && result.payload) {
                const { montantAvant, montantApres } = result.payload;
                if (montantAvant !== montantApres) {
                    toast.success(`Nouveau montant : ${formatFCFA(montantApres)} (avant : ${formatFCFA(montantAvant)})`);
                }
            }
        } finally {
            setIsRecalculating(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
                {/* ── En-tête ── */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400" />
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <PageHeader
                            onBack={() => navigate(-1)}
                            eyebrow="Contrôle avant départ"
                            title={expedition.reference}
                            subtitle={`${colisList.length} colis • Montant actuel : ${formatFCFA(expedition.montant_expedition)}`}
                        />
                    </div>
                </div>

                {!canControl && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        Vous n'avez pas la permission de contrôler les expéditions. Contactez l'administrateur de votre agence.
                    </div>
                )}

                {/* Agence d'arrivée (Interville) : déplacée sur ExpeditionDetails,
                    page systématiquement visitée par l'agence, contrairement à
                    cet écran de contrôle qui reste optionnel si rien à ajuster. */}

                {/* ── Modifier l'expédition ── */}
                {canControl && (
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => isEditingExpedition ? cancelEditExpedition() : startEditExpedition()}
                            className="w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-50 to-white hover:from-indigo-100/60 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-800">Modifier l'expédition</span>
                                <span className="text-xs text-slate-400 hidden sm:inline">(type, expéditeur, destinataire, pays, paiement)</span>
                            </div>
                            {isEditingExpedition ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {isEditingExpedition && expeditionForm && (
                            <div className="border-t border-indigo-100">
                                {/* Sous-sections avec fond alterné */}
                                <div className="px-4 sm:px-5 py-4 space-y-6">
                                {/* Type d'expédition */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Type d'expédition</label>
                                    <select
                                        value={expeditionForm.type_expedition}
                                        onChange={(e) => setExpeditionForm({ ...expeditionForm, type_expedition: e.target.value })}
                                        className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                    >
                                        {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Catégories manquantes si le type l'exige */}
                                {typeRequiresCategorie && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                                        <p className="text-xs font-semibold text-amber-800">
                                            Ce type d'expédition nécessite une catégorie par colis pour calculer le tarif.
                                        </p>
                                        {colisList.map((colis) => (
                                            <div key={colis.id} className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-slate-600 w-32 truncate flex-shrink-0">{colis.code_colis}</span>
                                                <select
                                                    value={colisCategories[colis.id] || ''}
                                                    onChange={(e) => setColisCategories({ ...colisCategories, [colis.id]: e.target.value })}
                                                    className={`flex-1 px-2.5 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white ${!colisCategories[colis.id] ? 'border-amber-300' : 'border-slate-200'}`}
                                                >
                                                    <option value="">Sélectionner une catégorie...</option>
                                                    {(categories || []).map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pays */}
                                <div className="rounded-lg border border-slate-200 overflow-hidden">
                                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Trajet</p>
                                    </div>
                                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Pays de départ</label>
                                        <input
                                            type="text"
                                            value={expeditionForm.pays_depart}
                                            readOnly={expeditionForm.type_expedition === 'interville'}
                                            onChange={(e) => setExpeditionForm({ ...expeditionForm, pays_depart: e.target.value })}
                                            className={`w-full mt-1 px-2.5 py-1.5 text-sm border rounded-lg outline-none ${expeditionForm.type_expedition === 'interville' ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Pays de destination</label>
                                        <input
                                            type="text"
                                            value={expeditionForm.type_expedition === 'interville' ? expeditionForm.pays_depart : expeditionForm.pays_destination}
                                            readOnly={expeditionForm.type_expedition === 'interville'}
                                            onChange={(e) => setExpeditionForm({ ...expeditionForm, pays_destination: e.target.value })}
                                            className={`w-full mt-1 px-2.5 py-1.5 text-sm border rounded-lg outline-none ${expeditionForm.type_expedition === 'interville' ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                                        />
                                    </div>
                                </div>{/* fin grid pays */}
                                </div>{/* fin card Trajet */}

                                {/* Expéditeur */}
                                <div className="rounded-lg border border-blue-100 overflow-hidden">
                                    <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Expéditeur</p>
                                    </div>
                                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            ['nom_prenom', 'Nom et prénom'], ['telephone', 'Téléphone'], ['email', 'Email'],
                                            ['adresse', 'Adresse'], ['ville', 'Ville'], ['societe', 'Société'],
                                            ['code_postal', 'Code postal'], ['etat', 'État / Région'], ['quartier', 'Quartier'],
                                        ].map(([field, label]) => {
                                            const isVilleInterville = field === 'ville' && expeditionForm.type_expedition === 'interville';
                                            const villeAgence = agencyData?.agence?.commune?.nom || agencyData?.commune?.nom || '';
                                            return (
                                                <div key={field}>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
                                                    <input
                                                        type="text"
                                                        value={isVilleInterville ? villeAgence : (expeditionForm.expediteur[field] || '')}
                                                        readOnly={isVilleInterville}
                                                        onChange={(e) => !isVilleInterville && setExpeditionForm({
                                                            ...expeditionForm,
                                                            expediteur: { ...expeditionForm.expediteur, [field]: e.target.value },
                                                        })}
                                                        className={`w-full mt-1 px-2.5 py-1.5 text-sm border rounded-lg outline-none ${isVilleInterville ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>{/* fin grid expéditeur */}
                                </div>{/* fin card Expéditeur */}

                                {/* Destinataire */}
                                <div className="rounded-lg border border-emerald-100 overflow-hidden">
                                    <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Destinataire</p>
                                    </div>
                                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            ['nom_prenom', 'Nom et prénom'], ['telephone', 'Téléphone'], ['email', 'Email'],
                                            ['adresse', 'Adresse'], ['ville', 'Ville'], ['societe', 'Société'],
                                            ['code_postal', 'Code postal'], ['etat', 'État / Région'], ['quartier', 'Quartier'],
                                        ].map(([field, label]) => (
                                            <div key={field}>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
                                                {field === 'ville' && expeditionForm.type_expedition === 'interville' ? (
                                                    <div className="mt-1">
                                                        <SearchableDropdown
                                                            options={intervilleAvailableCommunes.map(c => ({ ...c, label: c.label.toUpperCase() }))}
                                                            onSelect={(commune) => setExpeditionForm({
                                                                ...expeditionForm,
                                                                destinataire: { ...expeditionForm.destinataire, ville: commune.label },
                                                                destinataire_commune_id: commune.id,
                                                            })}
                                                            placeholder={expeditionForm.destinataire.ville?.toUpperCase() || 'Rechercher une commune...'}
                                                            disabled={intervilleAvailableCommunes.length === 0}
                                                            buttonClassName="h-9 text-sm font-medium"
                                                        />
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={expeditionForm.destinataire[field] || ''}
                                                        onChange={(e) => setExpeditionForm({
                                                            ...expeditionForm,
                                                            destinataire: { ...expeditionForm.destinataire, [field]: e.target.value },
                                                        })}
                                                        className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>{/* fin grid destinataire */}
                                </div>{/* fin card Destinataire */}

                                {/* Paiement / livraison */}
                                <div className="rounded-lg border border-amber-100 overflow-hidden">
                                    <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Paiement & livraison</p>
                                    </div>
                                    <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Statut de paiement</label>
                                        <select
                                            value={expeditionForm.statut_paiement}
                                            onChange={(e) => setExpeditionForm({ ...expeditionForm, statut_paiement: e.target.value })}
                                            className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                        >
                                            {Object.entries(STATUT_PAIEMENT_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <label className="flex items-center gap-2 mt-1 sm:mt-5 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={expeditionForm.is_paiement_credit}
                                            onChange={(e) => setExpeditionForm({ ...expeditionForm, is_paiement_credit: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Paiement à crédit
                                    </label>
                                    <label className="flex items-center gap-2 mt-1 sm:mt-5 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={expeditionForm.is_livraison_domicile}
                                            onChange={(e) => setExpeditionForm({ ...expeditionForm, is_livraison_domicile: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Livraison à domicile
                                    </label>
                                    </div>{/* fin grid paiement */}
                                </div>{/* fin card Paiement */}

                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={cancelEditExpedition}
                                        disabled={isSavingExpedition}
                                        className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={saveExpedition}
                                        disabled={isSavingExpedition || (typeRequiresCategorie && colisSansCategorie.length > 0)}
                                        className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {isSavingExpedition && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        Enregistrer et recalculer le tarif
                                    </button>
                                </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Colis ── */}
                <div className="space-y-3">
                    {colisList.map((colis, idx) => (
                        <div key={colis.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
                                    {colis.format_colis && (
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Format</p>
                                            <p className="font-semibold text-slate-800">{colis.format_colis.nom}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Emballage</p>
                                        <p className="font-semibold text-slate-800">{formatFCFA(colis.prix_emballage)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total colis</p>
                                        <p className="font-semibold text-indigo-600">{formatFCFA(colis.montant_colis_total)}</p>
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
                                    {expedition.type_expedition === 'interville' && (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Format du colis</label>
                                            <select
                                                value={editForm.format_colis_id || ''}
                                                onChange={(e) => {
                                                    const formatId = e.target.value;
                                                    if (!formatId) {
                                                        setEditForm({ ...editForm, format_colis_id: '' });
                                                        return;
                                                    }
                                                    const grille = [...(Array.isArray(formatsColis) ? formatsColis : [])].sort((a, b) => {
                                                        const pa = a.poids_max ?? Infinity, pb = b.poids_max ?? Infinity;
                                                        if (pa !== pb) return pa - pb;
                                                        return (a.volume_max ?? Infinity) - (b.volume_max ?? Infinity);
                                                    });
                                                    const format = grille.find(f => String(f.id) === String(formatId));
                                                    if (!format) { setEditForm({ ...editForm, format_colis_id: formatId }); return; }
                                                    const rang = grille.indexOf(format);
                                                    const precedent = rang > 0 ? grille[rang - 1] : null;
                                                    const poidsMin = precedent?.poids_max ?? 0;
                                                    const poids = format.poids_max != null ? format.poids_max : poidsMin + 5;
                                                    const volumeMin = precedent?.volume_max ?? 0;
                                                    const volume = format.volume_max != null ? format.volume_max : volumeMin + 10000;
                                                    const cote = Math.round(Math.cbrt(volume));
                                                    setEditForm({
                                                        ...editForm,
                                                        format_colis_id: formatId,
                                                        poids: String(poids),
                                                        longueur: String(cote),
                                                        largeur: String(cote),
                                                        hauteur: String(cote),
                                                    });
                                                }}
                                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                            >
                                                <option value="">Calculer automatiquement</option>
                                                {[...(Array.isArray(formatsColis) ? formatsColis : [])].sort((a, b) => {
                                                    const pa = a.poids_max ?? Infinity, pb = b.poids_max ?? Infinity;
                                                    return pa !== pb ? pa - pb : (a.volume_max ?? Infinity) - (b.volume_max ?? Infinity);
                                                }).map((f) => (
                                                    <option key={f.id} value={f.id}>{f.nom}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Frais d'emballage ({getCurrencyLabel()})</label>
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
                                                    type="number" step="1" min="0" placeholder={`Frais emballage (${getCurrencyLabel()})`}
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

                {/* ── Recalcul du tarif ── */}
                <div className="bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="h-1 bg-gradient-to-r from-indigo-400 to-purple-400" />
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-slate-800">Montant actuel de l'expédition</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">{formatFCFA(expedition.montant_expedition)}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Après correction des colis, recalculez le tarif — le client sera notifié du nouveau montant.
                            </p>
                        </div>
                        {canControl && (
                            <button
                                onClick={handleRecalculate}
                                disabled={isRecalculating}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0 shadow-sm"
                            >
                                {isRecalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                                Recalculer le tarif
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-start">
                    <button
                        onClick={() => navigate(`/expeditions/${expedition.id}`)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à la fiche expédition
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpeditionControl;
