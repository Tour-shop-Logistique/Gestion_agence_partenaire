import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useExpedition } from '../hooks/useExpedition';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    Copy,
    Truck,
    Hash,
    Calendar,
    MapPin,
    Package,
    Phone,
    User,
    Mail,
    CreditCard
} from 'lucide-react';

// --- Sub-Components (Sober & Professional) ---

const StatusBadge = ({ status }) => {
    const config = {
        en_attente: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'En attente' },
        accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Acceptée' },
        refused: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Refusée' },
        en_cours_enlevement: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'En enlèvement' },
        en_cours_depot: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', label: 'Dépôt en cours' },
        recu_agence_depart: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Reçu Agence Départ' },
        en_transit_entrepot: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Transit Entrepôt' },
        depart_expedition_succes: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'En Transit (International)' },
        arrivee_expedition_succes: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Arrivée Destination' },
        recu_agence_destination: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', label: 'Reçu Agence Dest.' },
        en_cours_livraison: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', label: 'En cours de livraison' },
        termined: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'Terminée' },
        delivered: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'Terminée' }
    };

    const current = config[status] || {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        label: status?.replace(/_/g, ' ')
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${current.bg} ${current.border} ${current.text}`}>
            {current.label}
        </span>
    );
};

const ExpeditionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        currentExpedition: expedition,
        getExpeditionDetails,
        status,
        error
    } = useExpedition();

    useEffect(() => {
        if (id) {
            getExpeditionDetails(id);
        }
    }, [id, getExpeditionDetails]);

    if (status === 'loading') {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Traitement des données...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px] p-4">
                    <div className="max-w-md w-full bg-white border border-slate-200 p-6 text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Erreur système</h3>
                        <p className="text-xs text-slate-500 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/expeditions')}
                            className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                        >
                            Retour à la liste
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!expedition) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        const cfa = new Intl.NumberFormat('fr-FR').format(amount || 0) + ' CFA';
        const eur = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format((amount || 0) / 655.957);
        return `${cfa} (${eur})`;
    };

    // Data Normalization
    const expediteur = expedition.expediteur || {
        nom_prenom: expedition.expediteur_nom_prenom,
        telephone: expedition.expediteur_telephone,
        email: expedition.expediteur_email,
        adresse: expedition.expediteur_adresse,
        ville: expedition.expediteur_ville
    };

    const destinataire = expedition.destinataire || {
        nom_prenom: expedition.destinataire_nom_prenom,
        telephone: expedition.destinataire_telephone,
        email: expedition.destinataire_email,
        adresse: expedition.destinataire_adresse,
        ville: expedition.destinataire_ville
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50/50 -mt-6 -mx-8 px-8 py-6">

                {/* --- HEADER: TMS DOCUMENT STYLE --- */}
                <div className="bg-white border border-slate-200 mb-6">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/expeditions')}
                                className="p-2 hover:bg-slate-50 rounded border border-slate-200 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 text-slate-600" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Dossier Expédition</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{expedition.type_expedition?.replace(/_/g, ' ')}</span>
                                </div>
                                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    {expedition.reference}
                                    <button className="text-slate-300 hover:text-slate-500 transition-colors">
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Créé le</p>
                                <p className="text-xs font-semibold text-slate-700">{formatDate(expedition.created_at)}</p>
                            </div>
                            <div className="h-8 w-px bg-slate-100"></div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Statut</p>
                                <StatusBadge status={expedition.statut_expedition} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 divide-x divide-slate-100 bg-slate-50/30">
                        <div className="px-6 py-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trajet</p>
                            <p className="text-xs font-bold text-slate-900 uppercase">
                                {expedition.pays_depart} → {expedition.pays_destination}
                            </p>
                        </div>
                        <div className="px-6 py-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Poids Total</p>
                            <p className="text-xs font-bold text-slate-900">{expedition.colis?.reduce((sum, c) => sum + parseFloat(c.poids || 0), 0)} KG</p>
                        </div>
                        <div className="px-6 py-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre Colis</p>
                            <p className="text-xs font-bold text-slate-900">{expedition.colis?.length || 0} Unités</p>
                        </div>
                        <div className="px-6 py-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Net</p>
                            <p className="text-sm font-bold text-indigo-700">{formatCurrency(expedition.montant_expedition)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* --- MAIN COLUMN (8/12) --- */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">

                        {/* 1. TIMELINE PROFESSIONNELLE */}
                        <div className="bg-white border border-slate-200">
                            <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Suivi d'exécution</h2>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temps réel</span>
                            </div>
                            <div className="p-8">
                                <div className="space-y-0 relative">
                                    <div className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200"></div>

                                    {(() => {
                                        const s = expedition.statut_expedition;
                                        const steps = [
                                            { label: 'Enregistrement dossier', date: expedition.created_at, done: true },
                                            { label: 'Traitement Agence Départ', date: null, done: !['en_attente', 'refused'].includes(s) },
                                            { label: 'Transport International', date: null, done: ['depart_expedition_succes', 'arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison', 'termined'].includes(s) },
                                            { label: 'Arrivée Agence Destination', date: null, done: ['arrivee_expedition_succes', 'recu_agence_destination', 'en_cours_livraison', 'termined'].includes(s) },
                                            { label: 'Livraison Finale', date: null, done: ['termined', 'delivered'].includes(s) }
                                        ];

                                        return steps.map((step, i) => (
                                            <div key={i} className="flex gap-6 pb-8 last:pb-0 relative">
                                                <div className={`w-3.5 h-3.5 rounded-full border-2 z-10 bg-white ${step.done ? 'border-indigo-600' : 'border-slate-200'}`}>
                                                    {step.done && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full m-auto mt-[1px]"></div>}
                                                </div>
                                                <div className="flex-1 -mt-1">
                                                    <p className={`text-xs font-bold uppercase tracking-tight ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                                                    {step.date && <p className="text-[10px] text-slate-500 font-medium mt-0.5">{formatDate(step.date)}</p>}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* 2. TABLE DATA PRO (COLIS) */}
                        <div className="bg-white border border-slate-200 overflow-hidden">
                            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Inventaire Détaillé</h2>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/30">
                                        <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Code Colis</th>
                                        <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Désignation</th>
                                        <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Poids</th>
                                        <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Valeur</th>
                                        <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Frais</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(expedition.colis || []).map((parcel, idx) => (
                                        <tr key={parcel.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-[11px] font-mono font-semibold text-slate-600">
                                                {parcel.code_colis || `COL-${idx + 1}`}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-900 leading-none">{parcel.designation}</p>
                                                <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-tight truncate max-w-[200px]">
                                                    {Array.isArray(parcel.articles) ? parcel.articles.join(', ') : parcel.articles}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-700 text-right">
                                                {parcel.poids} KG
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-700 text-right uppercase">
                                                {parcel.category?.nom || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-900 text-right">
                                                {formatCurrency(parcel.montant_colis_total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!expedition.colis || expedition.colis.length === 0) && (
                                <div className="px-6 py-8 text-center text-xs font-medium text-slate-400 border-t border-slate-50">
                                    Aucun colis enregistré dans ce dossier.
                                </div>
                            )}
                        </div>

                    </div>

                    {/* --- SIDE COLUMN (4/12) --- */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">

                        {/* 1. FICHE CONTACT CRM */}
                        <div className="bg-white border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Informations Contacts</h2>
                            </div>

                            <div className="divide-y divide-slate-100">
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-3 bg-indigo-600 rounded-full"></div>
                                        <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Expéditeur</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nom</span>
                                            <span className="text-xs font-bold text-slate-900 text-right">{expediteur.nom_prenom || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</span>
                                            <span className="text-xs font-bold text-slate-900 text-right">{expediteur.telephone || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localisation</span>
                                            <span className="text-xs font-bold text-slate-900 text-right">{expediteur.ville || 'Abidjan'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-3 bg-blue-600 rounded-full"></div>
                                        <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Destinataire</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nom</span>
                                            <span className="text-xs font-bold text-slate-900 text-right">{destinataire.nom_prenom || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</span>
                                            <span className="text-xs font-bold text-slate-900 text-right">{destinataire.telephone || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</span>
                                            <span className="text-xs font-bold text-slate-900 text-right">{destinataire.ville || expedition.pays_destination}</span>
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Adresse complète</p>
                                            <p className="text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                                {destinataire.adresse || 'Sans adresse physique renseignée'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. FINANCE: STYLE FACTURATION */}
                        <div className="bg-white border border-slate-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Résumé Financier</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2 text-xs font-medium">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Frais de transport</span>
                                        <span>{formatCurrency(expedition.montant_base)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Frais d'emballage</span>
                                        <span>{formatCurrency(expedition.frais_emballage)}</span>
                                    </div>
                                    {parseFloat(expedition.montant_prestation) > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Frais de service (Agence)</span>
                                            <span>+{formatCurrency(expedition.montant_prestation)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="h-px bg-slate-100"></div>

                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Montant Net à Payer</span>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <div className="flex items-baseline gap-1 text-indigo-700">
                                            <span className="text-2xl font-bold tracking-tight">{new Intl.NumberFormat('fr-FR').format(expedition.montant_expedition)}</span>
                                            <span className="text-[10px] font-bold uppercase">CFA</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-500 italic">
                                            ≈ {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(expedition.montant_expedition / 655.957)}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <div className={`flex items-center justify-center gap-2 py-3 border rounded ${expedition.statut_paiement === 'paye' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest">
                                            Paiement : {expedition.statut_paiement === 'paye' ? 'Effectué' : 'En attente'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Document généré par le système • {new Date().getFullYear()}</p>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default ExpeditionDetails;

