import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    Package, Scissors, Loader2, Plus, Trash2, ArrowLeft, Pencil, ArrowRight,
    Check, X, ChevronDown, RefreshCw, Bell, AlertTriangle, CheckCircle2, ClipboardCheck,
    Weight, Ruler, Gift, Truck, CreditCard, MapPin,
} from 'lucide-react';
import Spinner from '../components/common/Spinner';
import { Button } from '../components/ui';
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
    recalculateExpeditionTarif,
    realtimeExpeditionPatched,
    realtimeCurrentExpeditionColisPatched,
} from '../store/slices/expeditionSlice';
import { getCurrencyLabel } from '../utils/format';
import { getCountryName } from '../utils/countries';

const formatFCFA = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0) + ' ' + getCurrencyLabel();

// Types tarifés par catégorie (voir ExpeditionTarificationService) : chaque
// colis doit alors avoir une category_id, sinon le recalcul échoue.
const TYPES_REQUERANT_CATEGORIE = ['groupage_dhd_aerien', 'groupage_dhd_maritime', 'groupage_ca', 'groupage_afrique'];

const TYPE_LABELS = {
    simple: 'Livraison directe',
    groupage_dhd_aerien: 'DHD Aérien',
    groupage_dhd_maritime: 'DHD Maritime',
    groupage_afrique: 'Groupage Afrique',
    groupage_ca: 'Colis accompagné',
    interville: 'Interville',
};

// Mêmes icônes que le choix du type à la création (CreateExpeditionV2).
const TYPE_ICONS = {
    simple: '📦',
    groupage_dhd_aerien: '✈️',
    groupage_dhd_maritime: '🚢',
    groupage_afrique: '🌍',
    groupage_ca: '📮',
    interville: '🏙️',
};

const STATUT_PAIEMENT_LABELS = {
    paye: 'Payé',
    en_attente: 'En attente',
};

const PERSON_FIELDS = [
    ['nom_prenom', 'Nom et prénom'], ['telephone', 'Téléphone'], ['email', 'Email'],
    ['adresse', 'Adresse'], ['ville', 'Ville'], ['quartier', 'Quartier'],
    ['societe', 'Société'], ['code_postal', 'Code postal'], ['etat', 'État / Région'],
];

const emptyPersonForm = () => Object.fromEntries(PERSON_FIELDS.map(([f]) => [f, '']));

const emptyPart = () => ({ poids: '', longueur: '', largeur: '', hauteur: '', prix_emballage: '', designation: '', category_id: '', articles: [] });

const toNumber = (v) => (v === '' || v === null || v === undefined ? 0 : parseFloat(v));

const inputCls = 'w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#007a8c]/20 focus:border-[#007a8c] transition';
const lockedCls = 'w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 flex items-center truncate';

// Pays distincts (code ISO) couverts par les tarifs groupage d'un type.
const paysDesTarifsGroupage = (tarifs, type) => {
    const byCode = {};
    tarifs.filter((t) => t.type_expedition === type && t.code_pays).forEach((t) => {
        const code = t.code_pays.toUpperCase();
        if (!byCode[code]) byCode[code] = { id: code, code, label: (getCountryName(code) || t.pays || code).toUpperCase() };
    });
    return Object.values(byCode).sort((a, b) => a.label.localeCompare(b.label));
};

// Pays couverts par les zones des tarifs simples (LD), agence + base backoffice.
const paysDesTarifsSimples = (tarifs) => {
    const byKey = {};
    tarifs.forEach((tarif) => {
        (Array.isArray(tarif.prix_zones) ? tarif.prix_zones : []).forEach(({ zone }) => {
            (Array.isArray(zone?.pays) ? zone.pays : []).forEach((pays, idx) => {
                const code = Array.isArray(zone.pays_codes) ? zone.pays_codes[idx] : null;
                const key = code || pays;
                if (pays && !byKey[key]) byKey[key] = { id: key, code, label: (code ? getCountryName(code) : pays).toUpperCase() };
            });
        });
    });
    return Object.values(byKey).sort((a, b) => a.label.localeCompare(b.label));
};

// Même logique que CreateExpeditionV2 : produits proposés selon le type et la catégorie du colis.
const produitsProposes = (products, type, categoryId) => {
    const liste = Array.isArray(products) ? products : [];
    if (type === 'groupage_ca') return liste.filter((p) => p.category?.nom === 'Colis Accompagnés');
    if (type.includes('dhd')) return categoryId ? liste.filter((p) => p.category_id === categoryId) : [];
    return liste;
};

// Formats triés du plus petit au plus grand (poids puis volume).
const formatsTries = (formats) => [...(Array.isArray(formats) ? formats : [])].sort((a, b) => {
    const pa = a.poids_max ?? Infinity, pb = b.poids_max ?? Infinity;
    return pa !== pb ? pa - pb : (a.volume_max ?? Infinity) - (b.volume_max ?? Infinity);
});

const Field = ({ label, required, children, className = '' }) => (
    <label className={`block ${className}`}>
        <span className="block text-xs font-semibold text-slate-600 mb-1">
            {label}{required && <span className="text-amber-600"> *</span>}
        </span>
        {children}
    </label>
);

// Poids, dimensions et emballage d'un colis (correction comme scission).
const MesuresColis = ({ value, onChange }) => (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Field label="Poids (kg)" required className="col-span-2 sm:col-span-1">
            <input type="number" inputMode="decimal" step="0.01" min="0.01" value={value.poids}
                onChange={(e) => onChange({ poids: e.target.value })} className={inputCls} />
        </Field>
        {[['longueur', 'Long. (cm)'], ['largeur', 'Larg. (cm)'], ['hauteur', 'Haut. (cm)']].map(([f, l]) => (
            <Field key={f} label={l}>
                <input type="number" inputMode="decimal" step="0.1" min="0" value={value[f]}
                    onChange={(e) => onChange({ [f]: e.target.value })} className={inputCls} />
            </Field>
        ))}
        <Field label={`Emballage (${getCurrencyLabel()})`}>
            <input type="number" inputMode="numeric" step="1" min="0" value={value.prix_emballage}
                onChange={(e) => onChange({ prix_emballage: e.target.value })} className={inputCls} />
        </Field>
    </div>
);

// Catégorie (types à catégorie) + articles contenus d'un colis : même saisie qu'à la création.
const ColisClassement = ({ type, categories, products, categoryId, articles, onChange }) => {
    const liste = articles || [];
    const avecCategorie = TYPES_REQUERANT_CATEGORIE.includes(type);
    const categoriesProposees = type === 'groupage_ca' ? (categories || []).filter((c) => c.is_default) : (categories || []);
    const options = produitsProposes(products, type, categoryId).map((p) => ({ id: p.id, label: p.designation }));

    const changerCategorie = (nouvelleCategorie) => {
        // Les articles d'une autre catégorie ne sont plus valides pour DHD.
        const gardes = type.includes('dhd')
            ? liste.filter((a) => (products || []).find((p) => p.id === a.produit_id)?.category_id === nouvelleCategorie)
            : liste;
        onChange({ category_id: nouvelleCategorie, articles: gardes });
    };

    return (
        <div className={`grid gap-3 ${avecCategorie ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]' : ''}`}>
            {avecCategorie && (
                <Field label="Catégorie" required>
                    <select
                        value={categoryId || ''}
                        onChange={(e) => changerCategorie(e.target.value)}
                        className={`${inputCls} ${categoryId ? '' : '!border-amber-300 bg-amber-50/40'}`}
                    >
                        <option value="">Choisir…</option>
                        {categoriesProposees.map((cat) => <option key={cat.id} value={cat.id}>{cat.nom}</option>)}
                    </select>
                </Field>
            )}
            <div>
                <span className="block text-xs font-semibold text-slate-600 mb-1">Contenu du colis</span>
                <SearchableDropdown
                    options={options}
                    onSelect={(o) => {
                        if (!liste.some((a) => a.produit_id === o.id)) {
                            onChange({ category_id: categoryId, articles: [...liste, { produit_id: o.id, designation: o.label }] });
                        }
                    }}
                    disabled={options.length === 0}
                    placeholder={options.length === 0 ? "Choisissez d'abord une catégorie" : 'Ajouter un article…'}
                    buttonClassName="h-10 text-sm"
                />
                {liste.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {liste.map((a, i) => (
                            <span key={`${a.produit_id || a.designation}-${i}`} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-[#007a8c]/10 text-[#005566] rounded-full text-xs font-semibold">
                                {a.designation}
                                <button
                                    type="button"
                                    aria-label={`Retirer ${a.designation}`}
                                    onClick={() => onChange({ category_id: categoryId, articles: liste.filter((_, j) => j !== i) })}
                                    className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#007a8c]/20"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Card = ({ children, className = '' }) => (
    <section className={`bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 ${className}`}>{children}</section>
);

// Titre d'étape : pastille numérotée verte + titre + aide.
const StepTitle = ({ n, title, hint, children }) => (
    <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-[#005566] to-[#007a8c] text-white text-sm font-bold flex items-center justify-center shadow-sm">{n}</span>
            <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-800">{title}</h2>
                {hint && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
        </div>
        {children}
    </div>
);

// Teintes des blocs de contact, pour distinguer d'un coup d'œil.
const PERSON_TONES = {
    expediteur: { box: 'bg-sky-50 ring-sky-100', icon: 'bg-sky-500', title: 'text-sky-700' },
    destinataire: { box: 'bg-emerald-50 ring-emerald-100', icon: 'bg-emerald-500', title: 'text-emerald-700' },
};

const ActionBar = ({ onCancel, onConfirm, busy, disabled, label, tone = 'brand' }) => (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} disabled={busy}
            className="h-10 px-4 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition">
            Annuler
        </button>
        <button type="button" onClick={onConfirm} disabled={busy || disabled}
            className={`h-10 px-5 text-sm font-semibold text-white rounded-lg transition disabled:opacity-50 inline-flex items-center justify-center gap-2 ${tone === 'amber' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#005566] hover:bg-[#00444f]'}`}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {label}
        </button>
    </div>
);

/**
 * CONTRÔLE PHYSIQUE D'UNE EXPÉDITION
 * À l'arrivée des colis en agence : vérifier/corriger chaque colis (mesures,
 * catégorie, contenu), le scinder si besoin, ajuster l'expédition (type,
 * destination, contacts), puis recalculer — le client est notifié du montant.
 */
const ExpeditionControl = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const canControl = useHasPermission('expeditions.control');
    const { currentUser } = useAuth();

    const {
        currentExpedition: expedition, getExpeditionDetails, message, error, resetStatus,
        categories, loadCategories, updateExpedition, products, loadProducts,
    } = useExpedition();

    // Un seul panneau d'édition ouvert à la fois : { kind: 'edit'|'split', colisId }.
    const [panel, setPanel] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [splitParts, setSplitParts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    // Recalcul du tarif en cours (animation) et clignotement du nouveau montant.
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [montantFlash, setMontantFlash] = useState(false);
    const [isNotifying, setIsNotifying] = useState(false);
    // Montant que le client connaissait avant le contrôle (pour le message de notification).
    const [montantInitial, setMontantInitial] = useState(null);

    const [isEditingExpedition, setIsEditingExpedition] = useState(false);
    const [expeditionForm, setExpeditionForm] = useState(null);

    const { data: agencyData } = useAgency();
    const {
        intervilleTarifs, fetchTarifsInterville, formatsColis, fetchFormatsColis,
        existingGroupageTarifs, fetchTarifGroupageAgence, existingTarifs, fetchAgencyTarifs,
        tarifs: baseTarifs, fetchTarifs: fetchBaseTarifs,
        groupageTarifs: baseGroupageTarifs, fetchTarifsGroupageBase: fetchBaseGroupageTarifs,
    } = useTarifs();

    useEffect(() => {
        fetchTarifsInterville();
        fetchFormatsColis();
        fetchTarifGroupageAgence();
        fetchAgencyTarifs();
        fetchBaseTarifs();
        fetchBaseGroupageTarifs();
        loadProducts();
        loadCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pays de destination proposés : uniquement ceux réellement couverts par un tarif du type choisi.
    const typeForm = expeditionForm?.type_expedition;
    const tarifsGroupage = useMemo(() => [
        ...(Array.isArray(existingGroupageTarifs) ? existingGroupageTarifs : []),
        ...(Array.isArray(baseGroupageTarifs) ? baseGroupageTarifs : []),
    ], [existingGroupageTarifs, baseGroupageTarifs]);
    const paysDisponibles = useMemo(() => {
        if (!typeForm || typeForm === 'interville') return [];
        if (typeForm === 'simple') {
            return paysDesTarifsSimples([
                ...(Array.isArray(existingTarifs) ? existingTarifs : []),
                ...(Array.isArray(baseTarifs) ? baseTarifs : []),
            ]);
        }
        return paysDesTarifsGroupage(tarifsGroupage, typeForm);
    }, [typeForm, existingTarifs, baseTarifs, tarifsGroupage]);

    // DHD : lignes (ville départ-ville arrivée) du pays choisi, sans doublon.
    const lignesDhd = useMemo(() => {
        if (!typeForm?.includes('dhd') || !expeditionForm?.code_pays_destination) return [];
        const code = expeditionForm.code_pays_destination.toUpperCase();
        const lignes = new Set(
            tarifsGroupage
                .filter((t) => t.type_expedition === typeForm && (t.code_pays || '').toUpperCase() === code && t.ligne)
                .map((t) => t.ligne.trim())
        );
        return [...lignes].sort().map((l) => ({ id: l, label: l.toUpperCase() }));
    }, [typeForm, expeditionForm?.code_pays_destination, tarifsGroupage]);

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

    // Temps réel : un collègue peut contrôler la même expédition en parallèle -
    // patch local pour Colis.controlled / tarif recalculé, refetch complet
    // pour Colis.split (les colis d'origine sont supprimés côté serveur).
    useWebSocket(
        currentUser?.agence_id,
        {
            onColisControlled: (data) => {
                dispatch(realtimeCurrentExpeditionColisPatched(Array.isArray(data) ? data : [data]));
            },
            onColisSplit: (data) => {
                const items = Array.isArray(data) ? data : [data];
                if (items.some((c) => c?.expedition_id === expedition?.id) && id) getExpeditionDetails(id);
            },
            onExpeditionTarifRecalculated: (data) => {
                const updated = Array.isArray(data) ? data[0] : data;
                if (updated) dispatch(realtimeExpeditionPatched(updated));
            },
            onExpeditionStatusChanged: (data) => {
                const items = Array.isArray(data) ? data : [data];
                if (items.some((e) => String(e?.id) === String(id)) && id) getExpeditionDetails(id);
            },
            onExpeditionPaymentConfirmed: (data) => {
                const items = Array.isArray(data) ? data : [data];
                if (items.some((e) => String(e?.id) === String(id)) && id) getExpeditionDetails(id);
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
                <p className="mt-4 text-sm font-medium text-slate-500">Chargement de l'expédition…</p>
            </div>
        );
    }

    // Le contrôle reste possible après réception à l'agence de départ, pas
    // seulement entre acceptation et réception.
    const bloque = !['accepted', 'recu_agence_depart'].includes(expedition.statut_expedition)
        ? "Le contrôle n'est disponible qu'une fois la demande acceptée, avant confirmation du départ."
        : expedition.statut_paiement_expedition === 'paye'
            ? "Les frais d'expédition ont déjà été encaissés : le contrôle n'est plus possible."
            : null;

    if (bloque) {
        return (
            <div className="max-w-md mx-auto px-4 py-16 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-sm font-semibold text-slate-700">{bloque}</p>
                <Button className="mt-5" onClick={() => navigate(`/expeditions/${expedition.id}`)}>Retour à l'expédition</Button>
            </div>
        );
    }

    const colisList = expedition.colis || [];
    const typeExp = expedition.type_expedition || 'simple';
    // Type pris en compte : celui en cours de modification s'il y en a un (les
    // catégories des colis se règlent alors sur ce nouveau type).
    const typeEffectif = expeditionForm?.type_expedition || typeExp;
    const typeAvecCategorie = TYPES_REQUERANT_CATEGORIE.includes(typeEffectif);
    const nomCategorie = (catId) => (categories || []).find((c) => c.id === catId)?.nom;
    const poidsTotal = colisList.reduce((s, c) => s + (parseFloat(c.poids) || 0), 0);
    const estIncomplet = (c) => (typeAvecCategorie && !c.category_id) || !c.articles?.length;
    const colisIncomplets = colisList.filter(estIncomplet).length;

    // DHD : seules les catégories tarifées sur la ligne sont proposées (sinon le
    // recalcul échoue), comme à la création. Aucune catégorie tarifée = toutes.
    const categoriesColis = (() => {
        const toutes = categories || [];
        if (typeEffectif === 'groupage_ca') return toutes.filter((c) => c.is_default);
        if (!typeEffectif.includes('dhd')) return toutes;
        const norm = (l) => (l || '').toLowerCase().replace(/\s*-\s*/g, '-').trim();
        const depart = expeditionForm ? expeditionForm.expediteur.ville : expedition.expediteur?.ville;
        const arrivee = expeditionForm ? expeditionForm.destinataire.ville : expedition.destinataire?.ville;
        const ligne = norm(`${depart || ''}-${arrivee || ''}`);
        const ids = new Set(
            tarifsGroupage
                .filter((t) => t.type_expedition === typeEffectif && norm(t.ligne) === ligne && t.category_id)
                .map((t) => t.category_id)
        );
        return ids.size === 0 ? toutes : toutes.filter((c) => ids.has(c.id));
    })();

    // Recalcule le tarif (animation) sans notifier le client ; renvoie le résultat.
    const recalculer = async () => {
        setMontantInitial((m) => m ?? parseFloat(expedition.montant_expedition));
        setIsRecalculating(true);
        try {
            const result = await dispatch(recalculateExpeditionTarif(expedition.id));
            if (!result.error && result.payload) {
                const { montantAvant, montantApres } = result.payload;
                setMontantFlash(true);
                setTimeout(() => setMontantFlash(false), 2000);
                if (montantAvant !== montantApres) {
                    toast.success(`Nouveau montant : ${formatFCFA(montantApres)} (avant : ${formatFCFA(montantAvant)})`);
                }
            }
            return result;
        } finally {
            setIsRecalculating(false);
            getExpeditionDetails(id);
        }
    };

    // ── Colis : correction ──
    const startEdit = (colis) => {
        setPanel({ kind: 'edit', colisId: colis.id });
        setEditForm({
            poids: colis.poids ?? '',
            longueur: colis.longueur ?? '',
            largeur: colis.largeur ?? '',
            hauteur: colis.hauteur ?? '',
            prix_emballage: colis.prix_emballage ?? '',
            format_colis_id: colis.format_colis_id ?? '',
            category_id: colis.category_id ?? '',
            articles: Array.isArray(colis.articles) ? colis.articles : [],
            designation: colis.designation ?? '',
        });
    };

    const closePanel = () => {
        setPanel(null);
        setEditForm({});
        setSplitParts([]);
    };

    // Enregistre le colis puis lance tout de suite le recalcul.
    const validerEdit = async (colisId) => {
        if (!editForm.poids || parseFloat(editForm.poids) <= 0) {
            toast.error('Renseignez le poids du colis.');
            return;
        }
        if (typeAvecCategorie && !editForm.category_id) {
            toast.error('Choisissez la catégorie de ce colis.');
            return;
        }
        setIsSubmitting(true);
        try {
            const r = await expeditionsApi.updateColis(expedition.id, colisId, colisPayload(editForm));
            if (!r?.success) { toast.error(r?.message || "Le colis n'a pas pu être enregistré."); return; }
            closePanel();
        } finally {
            setIsSubmitting(false);
        }
        await recalculer();
    };

    // Interville : choisir un format pré-remplit poids/dimensions à sa limite haute.
    const choisirFormat = (formatId) => {
        if (!formatId) { setEditForm({ ...editForm, format_colis_id: '' }); return; }
        const grille = formatsTries(formatsColis);
        const format = grille.find((f) => String(f.id) === String(formatId));
        if (!format) { setEditForm({ ...editForm, format_colis_id: formatId }); return; }
        const precedent = grille[grille.indexOf(format) - 1] || null;
        const poids = format.poids_max ?? (precedent?.poids_max ?? 0) + 5;
        const volume = format.volume_max ?? (precedent?.volume_max ?? 0) + 10000;
        const cote = String(Math.round(Math.cbrt(volume)));
        setEditForm({ ...editForm, format_colis_id: formatId, poids: String(poids), longueur: cote, largeur: cote, hauteur: cote });
    };

    // ── Colis : scission ──
    const startSplit = (colis) => {
        setPanel({ kind: 'split', colisId: colis.id });
        const part = () => ({
            ...emptyPart(),
            designation: colis.designation || '',
            category_id: colis.category_id ?? '',
            articles: Array.isArray(colis.articles) ? colis.articles : [],
        });
        setSplitParts([part(), part()]);
    };

    const updateSplitPart = (index, patch) => {
        setSplitParts((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
    };

    const validerSplit = async (colisId) => {
        if (splitParts.some((p) => !p.poids || parseFloat(p.poids) <= 0)) {
            toast.error('Renseignez le poids de chaque nouveau colis.');
            return;
        }
        if (typeAvecCategorie && splitParts.some((p) => !p.category_id)) {
            toast.error('Choisissez la catégorie de chaque nouveau colis.');
            return;
        }
        setIsSubmitting(true);
        try {
            const r = await expeditionsApi.splitColis(expedition.id, colisId, splitParts.map(colisPayload));
            if (!r?.success) { toast.error(r?.message || "Le colis n'a pas pu être scindé."); return; }
            closePanel();
        } finally {
            setIsSubmitting(false);
        }
        await recalculer();
    };

    // ── Expédition ──
    const startEditExpedition = () => {
        setExpeditionForm({
            type_expedition: typeExp,
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
        setIsEditingExpedition(true);
    };

    const cancelEditExpedition = () => {
        setIsEditingExpedition(false);
        setExpeditionForm(null);
    };

    const setForm = (patch) => setExpeditionForm((prev) => ({ ...prev, ...patch }));
    const setPerson = (who, patch) => setExpeditionForm((prev) => ({ ...prev, [who]: { ...prev[who], ...patch } }));

    const changerType = (type) => setExpeditionForm((prev) => ({
        ...prev,
        type_expedition: type,
        // La destination dépend du type (tarifs, lignes) : à rechoisir.
        pays_destination: '',
        code_pays_destination: '',
        destinataire: { ...prev.destinataire, ville: '' },
        destinataire_commune_id: null,
    }));

    const formType = expeditionForm?.type_expedition;
    const formIsDhd = !!formType?.includes('dhd');
    const formIsInterville = formType === 'interville';
    const typeRequiresCategorie = TYPES_REQUERANT_CATEGORIE.includes(formType);

    const colisPayload = (p) => ({
        poids: parseFloat(p.poids),
        longueur: toNumber(p.longueur),
        largeur: toNumber(p.largeur),
        hauteur: toNumber(p.hauteur),
        prix_emballage: toNumber(p.prix_emballage),
        ...(p.format_colis_id ? { format_colis_id: p.format_colis_id } : {}),
        ...(p.designation !== undefined ? { designation: p.designation || null } : {}),
        category_id: p.category_id || null,
        articles: p.articles,
    });

    const expeditionPayload = () => {
        const payload = {
            type_expedition: expeditionForm.type_expedition,
            pays_depart: expeditionForm.pays_depart,
            pays_destination: expeditionForm.pays_destination,
            code_pays_depart: expeditionForm.code_pays_depart || null,
            code_pays_destination: expeditionForm.code_pays_destination || null,
            is_paiement_credit: expeditionForm.is_paiement_credit,
            is_livraison_domicile: expeditionForm.is_livraison_domicile,
            statut_paiement: expeditionForm.statut_paiement,
            ...(formIsInterville && expeditionForm.destinataire_commune_id
                ? { destinataire_commune_id: expeditionForm.destinataire_commune_id }
                : {}),
        };
        Object.entries(expeditionForm.expediteur).forEach(([k, v]) => { payload[`expediteur_${k}`] = v || null; });
        Object.entries(expeditionForm.destinataire).forEach(([k, v]) => { payload[`destinataire_${k}`] = v || null; });
        return payload;
    };

    // Bouton « Recalculer » : enregistre l'expédition si elle est en cours de
    // modification (le serveur recalcule dans le même appel), sinon recalcule simplement.
    const enregistrerExpedition = async () => {
        if (panel) {
            toast.error('Validez ou annulez le colis en cours de modification.');
            return false;
        }
        if (!expeditionForm) {
            await recalculer();
            return true;
        }
        setMontantInitial((m) => m ?? parseFloat(expedition.montant_expedition));
        if (!formIsInterville && !expeditionForm.pays_destination) {
            toast.error('Choisissez le pays de destination.');
            return false;
        }
        if (formIsDhd && !expeditionForm.destinataire.ville) {
            toast.error('Choisissez la ligne DHD.');
            return false;
        }

        setIsSaving(true);
        setIsRecalculating(true);
        try {
            const result = await updateExpedition(expedition.id, expeditionPayload());
            if (result.error) return false;
            cancelEditExpedition();
            const { montantAvant, montantApres } = result.payload || {};
            setMontantFlash(true);
            setTimeout(() => setMontantFlash(false), 2000);
            if (montantAvant !== undefined && montantAvant !== montantApres) {
                toast.success(`Nouveau montant : ${formatFCFA(montantApres)} (avant : ${formatFCFA(montantAvant)})`);
            }
            return true;
        } finally {
            setIsSaving(false);
            setIsRecalculating(false);
            // Recharge pour afficher tout de suite les nouveaux codes colis.
            getExpeditionDetails(id);
        }
    };

    // Revient sur la page détails sans empiler d'entrée d'historique (le bouton
    // retour ne doit pas ramener ici) ; accès direct sans historique : remplace.
    const retourDetails = () => {
        if (window.history.state?.idx > 0) navigate(-1);
        else navigate(`/expeditions/${expedition.id}`, { replace: true });
    };

    const notifierClient = async () => {
        // Modification d'expédition en cours : on l'enregistre d'abord.
        if (expeditionForm) {
            if (!(await enregistrerExpedition())) return;
        }
        setIsNotifying(true);
        try {
            const r = await expeditionsApi.notifyClient(expedition.id, montantInitial ?? undefined);
            if (r.success) {
                toast.success(r.message || 'Le client a été notifié.');
                setMontantInitial(null);
                retourDetails();
            } else {
                toast.error(r.message || "La notification n'a pas pu être envoyée.");
            }
        } finally {
            setIsNotifying(false);
        }
    };

    const villeAgence = agencyData?.agence?.commune?.nom || agencyData?.commune?.nom || '';
    const exp = expedition.expediteur || {};
    const dest = expedition.destinataire || {};

    // Bloc de contacts (expéditeur/destinataire) : nom, téléphone, ville visibles, le reste replié.
    const renderPersonForm = (who, titre) => {
        const p = expeditionForm[who];
        const tone = PERSON_TONES[who];
        const champ = ([field, label]) => {
            const villeVerrouillee = field === 'ville' && (formIsDhd || formIsInterville);
            if (villeVerrouillee) {
                const valeur = who === 'expediteur' && formIsInterville ? villeAgence : p.ville;
                if (who === 'destinataire' && formIsInterville) {
                    return (
                        <Field key={field} label="Commune d'arrivée" required>
                            <SearchableDropdown
                                options={intervilleAvailableCommunes.map((c) => ({ ...c, label: c.label.toUpperCase() }))}
                                onSelect={(commune) => setExpeditionForm((prev) => ({
                                    ...prev,
                                    destinataire: { ...prev.destinataire, ville: commune.label },
                                    destinataire_commune_id: commune.id,
                                }))}
                                placeholder={p.ville?.toUpperCase() || 'Rechercher une commune…'}
                                disabled={intervilleAvailableCommunes.length === 0}
                                buttonClassName="h-10 text-sm"
                            />
                        </Field>
                    );
                }
                return (
                    <Field key={field} label={formIsDhd ? 'Ville (selon la ligne)' : 'Ville'}>
                        <div className={lockedCls}>{valeur || '—'}</div>
                    </Field>
                );
            }
            return (
                <Field key={field} label={label}>
                    <input type={field === 'email' ? 'email' : field === 'telephone' ? 'tel' : 'text'}
                        value={p[field] || ''} onChange={(e) => setPerson(who, { [field]: e.target.value })} className={inputCls} />
                </Field>
            );
        };
        return (
            <div className={`rounded-xl ring-1 p-3 sm:p-4 ${tone.box}`}>
                <p className={`flex items-center gap-2 text-sm font-bold mb-3 ${tone.title}`}>
                    <span className={`w-6 h-6 rounded-lg ${tone.icon} text-white flex items-center justify-center`}>
                        <MapPin className="w-3.5 h-3.5" />
                    </span>
                    {titre}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERSON_FIELDS.slice(0, 2).map(champ)}
                    {champ(PERSON_FIELDS[4])}
                </div>
                <details className="group mt-3">
                    <summary className={`cursor-pointer list-none inline-flex items-center gap-1 text-xs font-semibold ${tone.title}`}>
                        <ChevronDown className="w-3.5 h-3.5 transition group-open:rotate-180" /> Autres coordonnées
                    </summary>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {PERSON_FIELDS.filter((_, i) => i !== 0 && i !== 1 && i !== 4).map(champ)}
                    </div>
                </details>
            </div>
        );
    };

    const renderPersonSummary = (who, titre, person, pays) => {
        const tone = PERSON_TONES[who];
        return (
            <div className={`rounded-xl ring-1 p-3 sm:p-4 min-w-0 ${tone.box}`}>
                <p className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide ${tone.title}`}>
                    <span className={`w-5 h-5 rounded-md ${tone.icon} text-white flex items-center justify-center`}>
                        <MapPin className="w-3 h-3" />
                    </span>
                    {titre}
                </p>
                <p className="mt-2 font-semibold text-slate-800 truncate">{person.nom_prenom || '—'}</p>
                <p className="text-xs text-slate-600 truncate">{person.telephone || 'Pas de téléphone'}</p>
                <p className="text-xs text-slate-500 truncate">{[person.ville, pays].filter(Boolean).join(', ')}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-transparent">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">

                {/* ── En-tête ── */}
                <header className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#005566] via-[#007a8c] to-emerald-400" />
                    <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
                        <button onClick={retourDetails} aria-label="Retour"
                            className="w-10 h-10 flex-shrink-0 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="hidden sm:flex w-11 h-11 flex-shrink-0 rounded-xl bg-[#007a8c]/10 text-[#005566] items-center justify-center">
                            <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#007a8c]">Contrôle avant départ</p>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{expedition.reference}</h1>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
                            <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">{TYPE_ICONS[typeExp]} {TYPE_LABELS[typeExp] || typeExp}</span>
                            <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">{colisList.length} colis</span>
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">{poidsTotal.toLocaleString('fr-FR')} kg</span>
                        </div>
                    </div>
                    <div className="md:hidden px-4 pb-4 flex flex-wrap gap-1.5 text-xs font-semibold">
                        <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">{TYPE_ICONS[typeExp]} {TYPE_LABELS[typeExp] || typeExp}</span>
                        <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">{colisList.length} colis</span>
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">{poidsTotal.toLocaleString('fr-FR')} kg</span>
                    </div>
                </header>

                {!canControl && (
                    <div className="bg-amber-50 ring-1 ring-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        Vous n'avez pas la permission de contrôler les expéditions. Contactez l'administrateur de votre agence.
                    </div>
                )}

                {/* ── Étape 1 : expédition ── */}
                <StepTitle n={1} title="Vérifier l'expédition" hint="Type, trajet, contacts et paiement." />

                <Card className="overflow-hidden">
                    {!isEditingExpedition ? (
                        <div className="p-4 sm:p-5 space-y-4">
                            {/* Trajet */}
                            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#005566]/5 to-[#007a8c]/10">
                                <span className="text-2xl sm:text-3xl" aria-hidden>{TYPE_ICONS[typeExp]}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[#005566]">{TYPE_LABELS[typeExp] || typeExp}</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                                        <span className="truncate">{exp.ville || expedition.pays_depart || '—'}</span>
                                        <ArrowRight className="w-4 h-4 text-[#007a8c] flex-shrink-0" />
                                        <span className="truncate">{dest.ville || expedition.pays_destination || '—'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {renderPersonSummary('expediteur', 'Expéditeur', exp, expedition.pays_depart)}
                                {renderPersonSummary('destinataire', 'Destinataire', dest, expedition.pays_destination)}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                                        <Truck className="w-3.5 h-3.5" /> {expedition.is_livraison_domicile ? 'Livraison à domicile' : 'Retrait en agence'}
                                    </span>
                                    {expedition.is_paiement_credit && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                                            <CreditCard className="w-3.5 h-3.5" /> Paiement à crédit
                                        </span>
                                    )}
                                </div>
                                {canControl && (
                                    <button onClick={startEditExpedition}
                                        className="w-full sm:w-auto h-10 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 bg-[#007a8c]/10 text-[#005566] hover:bg-[#007a8c]/20 transition">
                                        <Pencil className="w-4 h-4" /> Modifier l'expédition
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-5 space-y-5">
                            {/* Type : mêmes tuiles qu'à la création */}
                            <div>
                                <span className="block text-xs font-semibold text-slate-600 mb-2">Type d'expédition</span>
                                <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                                    {Object.entries(TYPE_LABELS).map(([value, label]) => {
                                        const actif = formType === value;
                                        return (
                                            <button key={value} type="button" onClick={() => changerType(value)}
                                                className={`flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3 rounded-xl border-2 transition ${actif
                                                    ? 'border-[#007a8c] bg-[#007a8c]/10 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-[#007a8c]/50 hover:bg-[#007a8c]/5'}`}>
                                                <span className="text-xl sm:text-2xl" aria-hidden>{TYPE_ICONS[value]}</span>
                                                <span className={`text-[10px] sm:text-xs font-bold leading-tight text-center ${actif ? 'text-[#005566]' : 'text-slate-600'}`}>{label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {typeRequiresCategorie && formType !== typeExp && (
                                    <p className="mt-2 text-xs text-[#005566] bg-[#007a8c]/10 rounded-lg px-3 py-2">
                                        Ce type est tarifé par catégorie : définissez la catégorie de chaque colis à l'étape 2.
                                    </p>
                                )}
                            </div>

                            {/* Trajet */}
                            <div className="rounded-xl bg-violet-50 ring-1 ring-violet-100 p-3 sm:p-4">
                                <p className="text-sm font-bold text-violet-700 mb-3">Trajet</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Field label="Pays de départ">
                                        <div className={lockedCls}>{expeditionForm.pays_depart || '—'}</div>
                                    </Field>
                                    <Field label="Pays de destination" required={!formIsInterville}>
                                        {formIsInterville ? (
                                            <div className={lockedCls}>{expeditionForm.pays_depart || '—'}</div>
                                        ) : (
                                            <SearchableDropdown
                                                options={paysDisponibles}
                                                onSelect={(pays) => setExpeditionForm((prev) => ({
                                                    ...prev,
                                                    pays_destination: getCountryName(pays.code) || pays.label,
                                                    code_pays_destination: pays.code || '',
                                                    destinataire: { ...prev.destinataire, ville: '' },
                                                }))}
                                                disabled={paysDisponibles.length === 0}
                                                placeholder={expeditionForm.pays_destination?.toUpperCase() || (paysDisponibles.length === 0 ? 'Aucun pays configuré' : 'Rechercher un pays…')}
                                                buttonClassName="h-10 text-sm"
                                            />
                                        )}
                                    </Field>
                                    {formIsDhd && (
                                        <Field label="Ligne" required className="sm:col-span-2">
                                            <SearchableDropdown
                                                options={lignesDhd}
                                                onSelect={(ligne) => {
                                                    const [depart, arrivee] = ligne.id.split('-').map((v) => v.trim());
                                                    setExpeditionForm((prev) => ({
                                                        ...prev,
                                                        expediteur: { ...prev.expediteur, ville: depart || '' },
                                                        destinataire: { ...prev.destinataire, ville: arrivee || '' },
                                                    }));
                                                }}
                                                disabled={lignesDhd.length === 0}
                                                placeholder={!expeditionForm.code_pays_destination
                                                    ? "Choisissez d'abord le pays"
                                                    : expeditionForm.destinataire.ville
                                                        ? `${expeditionForm.expediteur.ville}-${expeditionForm.destinataire.ville}`.toUpperCase()
                                                        : 'Rechercher une ligne…'}
                                                buttonClassName="h-10 text-sm"
                                            />
                                        </Field>
                                    )}
                                </div>
                            </div>

                            {/* Contacts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {renderPersonForm('expediteur', 'Expéditeur')}
                                {renderPersonForm('destinataire', 'Destinataire')}
                            </div>

                            {/* Paiement et livraison */}
                            <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 p-3 sm:p-4">
                                <p className="text-sm font-bold text-amber-700 mb-3">Paiement et livraison</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Field label="Statut de paiement">
                                        <select value={expeditionForm.statut_paiement}
                                            onChange={(e) => setForm({ statut_paiement: e.target.value })} className={inputCls}>
                                            {Object.entries(STATUT_PAIEMENT_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    {[['is_paiement_credit', 'Paiement à crédit'], ['is_livraison_domicile', 'Livraison à domicile']].map(([field, label]) => (
                                        <label key={field} className="sm:self-end h-10 px-3 flex items-center gap-2.5 rounded-lg bg-white border border-amber-200 text-sm text-slate-700 cursor-pointer hover:bg-amber-50/50">
                                            <input type="checkbox" checked={expeditionForm[field]}
                                                onChange={(e) => setForm({ [field]: e.target.checked })}
                                                className="w-4 h-4 rounded border-slate-300 text-[#005566] focus:ring-[#007a8c]" />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button type="button" onClick={cancelEditExpedition}
                                    className="h-10 px-4 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition inline-flex items-center gap-2">
                                    <X className="w-4 h-4" /> Annuler les modifications de l'expédition
                                </button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* ── Étape 2 : colis ── */}
                <div className="pt-2">
                    <StepTitle n={2} title="Vérifier les colis" hint="Pesez, mesurez et contrôlez le contenu. Corrigez ou scindez si besoin.">
                        {colisIncomplets > 0 ? (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5" /> {colisIncomplets} à compléter
                            </span>
                        ) : colisList.length > 0 && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Tous complets
                            </span>
                        )}
                    </StepTitle>
                </div>

                {colisList.length === 0 && (
                    <Card className="p-6 text-center text-sm text-slate-500">Aucun colis dans cette expédition.</Card>
                )}

                <div className={`grid grid-cols-1 gap-4 items-start ${colisList.length > 1 ? 'xl:grid-cols-2' : ''}`}>
                    {colisList.map((colis) => {
                        const isEdit = panel?.kind === 'edit' && panel.colisId === colis.id;
                        const isSplit = panel?.kind === 'split' && panel.colisId === colis.id;
                        const contenuManquant = !colis.articles?.length;
                        const incomplet = estIncomplet(colis);
                        return (
                            <Card key={colis.id} className={`overflow-hidden border-l-4 ${incomplet ? 'border-l-amber-400' : 'border-l-emerald-500'} ${isEdit || isSplit ? 'ring-2 ring-[#007a8c]/40' : ''}`}>
                                {/* Bandeau du colis */}
                                <div className={`px-4 sm:px-5 py-3 flex items-center justify-between gap-3 ${incomplet ? 'bg-amber-50/70' : 'bg-emerald-50/60'}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-white ${incomplet ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono text-sm font-bold text-slate-800 truncate">{colis.code_colis}</p>
                                            <p className={`text-xs font-semibold ${incomplet ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                {typeAvecCategorie
                                                    ? (nomCategorie(colis.category_id) || 'Catégorie à définir')
                                                    : (colis.format_colis?.nom || (incomplet ? 'Contenu à déclarer' : 'Complet'))}
                                            </p>
                                        </div>
                                    </div>
                                    {isRecalculating ? (
                                        <span className="h-5 w-20 rounded-md bg-[#007a8c]/20 animate-pulse" aria-label="Recalcul en cours" />
                                    ) : (
                                        <p className="text-sm sm:text-base font-bold text-[#005566] whitespace-nowrap">{formatFCFA(colis.montant_colis_total)}</p>
                                    )}
                                </div>

                                <div className="p-4 sm:p-5">
                                    {/* Mesures */}
                                    <dl className="grid grid-cols-3 gap-2">
                                        {[
                                            [Weight, 'Poids', `${colis.poids || 0} kg`, 'bg-sky-50 text-sky-600'],
                                            [Ruler, 'Dimensions', `${colis.longueur || 0}×${colis.largeur || 0}×${colis.hauteur || 0}`, 'bg-violet-50 text-violet-600'],
                                            [Gift, 'Emballage', formatFCFA(colis.prix_emballage), 'bg-rose-50 text-rose-600'],
                                        ].map(([Icon, k, v, tint]) => (
                                            <div key={k} className="rounded-xl bg-slate-50 p-2.5 min-w-0">
                                                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                    <span className={`w-5 h-5 rounded-md flex items-center justify-center ${tint}`}><Icon className="w-3 h-3" /></span>
                                                    <span className="truncate">{k}</span>
                                                </dt>
                                                <dd className="mt-1 text-sm font-bold text-slate-800 truncate">{v}</dd>
                                            </div>
                                        ))}
                                    </dl>

                                    {/* Contenu */}
                                    <div className="mt-3">
                                        {contenuManquant ? (
                                            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                                                Contenu non déclaré{colis.designation ? ` — le client a écrit « ${colis.designation} »` : ''}
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {colis.designation && <p className="w-full text-xs text-slate-600 mb-0.5">{colis.designation}</p>}
                                                {colis.articles.map((a, i) => (
                                                    <span key={i} className="px-2.5 py-1 rounded-full bg-[#007a8c]/10 text-[#005566] text-xs font-semibold">{a.designation}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {canControl && !isEdit && !isSplit && (
                                        <div className="mt-4 grid grid-cols-2 sm:flex sm:justify-end gap-2">
                                            <button onClick={() => startEdit(colis)}
                                                className={`h-10 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition ${incomplet
                                                    ? 'bg-[#005566] text-white hover:bg-[#00444f] shadow-sm'
                                                    : 'bg-[#007a8c]/10 text-[#005566] hover:bg-[#007a8c]/20'}`}>
                                                <Pencil className="w-4 h-4" /> {incomplet ? 'Compléter' : 'Corriger'}
                                            </button>
                                            <button onClick={() => startSplit(colis)}
                                                className="h-10 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 text-amber-700 bg-amber-100/70 hover:bg-amber-100 transition">
                                                <Scissors className="w-4 h-4" /> Scinder
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Correction */}
                                {isEdit && (
                                    <div className="border-t border-[#007a8c]/15 bg-[#007a8c]/5 p-4 sm:p-5 space-y-4">
                                        <p className="text-sm font-bold text-[#005566]">Corriger ce colis</p>
                                        {typeEffectif === 'interville' && (
                                            <Field label="Format">
                                                <select value={editForm.format_colis_id || ''} onChange={(e) => choisirFormat(e.target.value)} className={inputCls}>
                                                    <option value="">Déterminé automatiquement</option>
                                                    {formatsTries(formatsColis).map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                                                </select>
                                            </Field>
                                        )}
                                        <MesuresColis value={editForm} onChange={(patch) => setEditForm({ ...editForm, ...patch })} />
                                        <ColisClassement
                                            type={typeEffectif}
                                            categories={categoriesColis}
                                            products={products}
                                            categoryId={editForm.category_id}
                                            articles={editForm.articles}
                                            onChange={(v) => setEditForm({ ...editForm, ...v })}
                                        />
                                        <Field label="Désignation">
                                            <input type="text" maxLength={255} value={editForm.designation || ''}
                                                onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                                                placeholder="Description du contenu" className={inputCls} />
                                        </Field>
                                        <ActionBar onCancel={closePanel} onConfirm={() => validerEdit(colis.id)} busy={isSubmitting}
                                            disabled={!editForm.poids} label="Valider et recalculer" />
                                    </div>
                                )}

                                {/* Scission */}
                                {isSplit && (
                                    <div className="border-t border-amber-200 bg-amber-50/60 p-4 sm:p-5 space-y-3">
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Scinder en {splitParts.length} colis</p>
                                            <p className="text-xs text-amber-700/80">Le colis {colis.code_colis} sera remplacé par les colis ci-dessous, chacun avec son propre code.</p>
                                        </div>
                                        {splitParts.map((part, index) => (
                                            <div key={index} className="p-3 sm:p-4 bg-white ring-1 ring-amber-200 rounded-xl space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
                                                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">{index + 1}</span>
                                                        Nouveau colis
                                                    </span>
                                                    {splitParts.length > 2 && (
                                                        <button onClick={() => setSplitParts((prev) => prev.filter((_, i) => i !== index))}
                                                            aria-label={`Retirer le colis ${index + 1}`}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <MesuresColis value={part} onChange={(patch) => updateSplitPart(index, patch)} />
                                                <ColisClassement
                                                    type={typeEffectif}
                                                    categories={categoriesColis}
                                                    products={products}
                                                    categoryId={part.category_id}
                                                    articles={part.articles}
                                                    onChange={(v) => updateSplitPart(index, v)}
                                                />
                                            </div>
                                        ))}
                                        <button onClick={() => setSplitParts((prev) => [...prev, emptyPart()])}
                                            className="w-full h-10 text-sm font-semibold text-amber-800 border-2 border-dashed border-amber-300 rounded-xl hover:bg-amber-100/50 transition inline-flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" /> Ajouter un colis
                                        </button>
                                        <ActionBar onCancel={closePanel} onConfirm={() => validerSplit(colis.id)} busy={isSubmitting}
                                            label="Scinder et recalculer" tone="amber" />
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* ── Barre du bas : montant, animation de recalcul, enregistrement ── */}
                <div className="sticky bottom-3 z-30">
                    <div className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r from-[#005566] to-[#007a8c] text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        {isRecalculating && <div className="absolute inset-x-0 top-0 h-1 bg-white/80 animate-pulse" />}
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70 flex items-center gap-1.5">
                                {isRecalculating ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Recalcul du tarif en cours
                                        <span className="inline-flex gap-0.5" aria-hidden>
                                            {[0, 150, 300].map((d) => (
                                                <span key={d} className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                            ))}
                                        </span>
                                    </>
                                ) : 'Montant actuel'}
                            </p>
                            <p className={`text-lg sm:text-xl font-bold text-white truncate transition-all duration-500 ${isRecalculating ? 'opacity-40 blur-[2px] animate-pulse' : ''} ${montantFlash ? 'scale-110 origin-left text-emerald-200' : ''}`}>
                                {formatFCFA(expedition.montant_expedition)}
                            </p>
                        </div>
                        {canControl && (
                            <div className="grid grid-cols-2 sm:flex gap-2">
                                <button onClick={enregistrerExpedition} disabled={isRecalculating || isSubmitting || isNotifying}
                                    className="h-11 px-4 sm:px-5 rounded-xl text-sm font-bold text-[#005566] bg-white hover:bg-emerald-50 disabled:opacity-60 inline-flex items-center justify-center gap-2 transition shadow-sm">
                                    {isRecalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    {isEditingExpedition ? "Enregistrer et recalculer" : 'Recalculer'}
                                </button>
                                <button onClick={notifierClient} disabled={isRecalculating || isSubmitting || isNotifying || !expedition.is_demande_client}
                                    title={expedition.is_demande_client ? undefined : "Expédition créée en agence : pas de client à notifier"}
                                    className="h-11 px-4 sm:px-5 rounded-xl text-sm font-bold text-white bg-white/15 hover:bg-white/25 ring-1 ring-white/40 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition">
                                    {isNotifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                                    Enregistrer et notifier le client
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpeditionControl;
