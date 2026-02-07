import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useExpedition } from '../hooks/useExpedition';
import {
    ArrowLeft,
    Box,
    Calendar,
    CreditCard,
    FileText,
    Globe,
    Layers,
    Mail,
    MapPin,
    Package,
    Phone,
    Truck,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Copy
} from 'lucide-react';

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
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute animate-ping inline-flex h-12 w-12 rounded-full bg-indigo-100 opacity-75"></div>
                        <div className="relative inline-flex rounded-full h-12 w-12 bg-indigo-50 border border-indigo-100 items-center justify-center">
                            <Truck className="h-6 w-6 text-indigo-600 animate-pulse" />
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <h3 className="text-sm font-semibold text-slate-900">Chargement de l'expédition</h3>
                        <p className="text-xs text-slate-500 mt-1">Récupération des données logistiques...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
                    <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-100 shadow-xl shadow-red-50/50 text-center">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Impossible de charger l'expédition</h3>
                        <p className="text-sm text-slate-500 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/expeditions')}
                            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all w-full"
                        >
                            Retour à la liste
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!expedition) return null;

    // --- Helpers Design & Format ---

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' CFA';
    };

    const StatusBadge = ({ status }) => {
        const config = {
            accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2, label: 'Acceptée' },
            pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'En attente' },
            cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle, label: 'Annulée' },
            delivered: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle2, label: 'Livrée' },
            in_transit: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Truck, label: 'En transit' }
        };

        const current = config[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: AlertCircle, label: status };
        const Icon = current.icon;

        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${current.bg} ${current.border} ${current.text} shadow-sm shadow-slate-100`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wide">{current.label}</span>
            </div>
        );
    };

    const PaymentBadge = ({ status }) => {
        const isPaid = status === 'paye';
        return (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isPaid
                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700'
                : 'bg-amber-50/50 border-amber-100 text-amber-700'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="text-[11px] font-bold uppercase tracking-wide">
                    {isPaid ? 'Payé' : 'En attente'}
                </span>
            </div>
        );
    };



    // --- Data Normalization (Handle Flat vs Nested API Responses) ---
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
            <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6 pb-20">

                {/* --- HEADER: MISSION CONTROL --- */}
                <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-4 sm:mb-8">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">

                            {/* Left: Breadcrumb & Title */}
                            <div className="space-y-0.5 sm:space-y-1">
                                <button
                                    onClick={() => navigate('/expeditions')}
                                    className="group flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Expéditions
                                </button>

                                <div className="flex items-center gap-2 sm:gap-3">
                                    <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                                        <span className="font-mono text-slate-400 font-normal opacity-50 hidden sm:inline">#</span>
                                        {expedition.reference}
                                    </h1>
                                    <button className="p-1 rounded-md text-slate-400 hover:bg-slate-100 transition-all">
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-slate-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    {expedition.type_expedition?.replace(/_/g, ' ')}
                                    <span className="text-slate-300">•</span>
                                    <span className="truncate">{formatDate(expedition.created_at)}</span>
                                </div>
                            </div>

                            {/* Right: Key Metrics Hero */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-100">
                                {/* Status Block - Shown on mobile as well but compact */}
                                <div className="px-2 sm:px-4 sm:border-r border-slate-200/60">
                                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 sm:mb-1">Statut</p>
                                    <StatusBadge status={expedition.statut_expedition} />
                                </div>

                                {/* Total Hero */}
                                <div className="px-2 sm:px-5">
                                    <p className="text-[9px] uppercase font-bold text-slate-400 text-right mb-0.5">Total</p>
                                    <div className="flex items-baseline justify-end gap-1">
                                        <span className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
                                            {formatCurrency(expedition.montant_expedition).split(' ')[0]}
                                        </span>
                                        <span className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase">CFA</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

                    {/* --- LEFT COLUMN: MAIN DATA (Route & Colis) --- */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* 1. VISUAL TRACKING CARD */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                                <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-500" />
                                    Itinéraire
                                </h2>
                            </div>

                            <div className="p-6 relative">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-4 relative">

                                    {/* Mobile Vertical Line */}
                                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100 sm:hidden"></div>

                                    {/* Depart Node */}
                                    <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0 w-full sm:w-auto relative z-10">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center sm:mb-3 shadow-sm shrink-0">
                                            <span className="text-xl">🛫</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Départ</p>
                                            <p className="text-base font-black text-slate-900">{expedition.pays_depart}</p>
                                            <p className="text-[10px] font-medium text-slate-500">{expediteur.ville || 'Abidjan'}</p>
                                        </div>
                                    </div>

                                    {/* Desktop Visual Line */}
                                    <div className="hidden sm:flex flex-1 items-center relative px-4">
                                        <div className="h-0.5 w-full bg-slate-100 rounded-full">
                                            <div className="h-full bg-indigo-500 w-1/2 rounded-full relative"></div>
                                        </div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full border border-slate-100 shadow-sm">
                                            <Truck className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>

                                    {/* Arrival Node */}
                                    <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0 w-full sm:w-auto relative z-10">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center sm:mb-3 shadow-sm shrink-0">
                                            <span className="text-xl">🛬</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Arrivée</p>
                                            <p className="text-base font-black text-slate-900">{expedition.pays_destination}</p>
                                            <p className="text-[10px] font-medium text-slate-500">{destinataire.ville || expedition.destinataire?.ville}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* 2. PARCELS / COLIS DATA GRID */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                                    <Layers className="w-4 h-4 text-slate-400" />
                                    Contenu ( {expedition.colis?.length || 0} )
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {expedition.colis?.map((parcel, index) => (
                                    <div key={parcel.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="p-4 flex gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                <Package className="w-6 h-6 text-slate-300" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-sm truncate">{parcel.designation}</h3>
                                                        <p className="text-[10px] text-slate-500 font-mono uppercase truncate">
                                                            {parcel.code_colis || `COL-${index + 1}`}
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-slate-900 text-xs">{formatCurrency(parcel.montant_colis_total)}</p>
                                                </div>

                                                {/* Mobile Triple Data Row */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pt-2 border-t border-slate-50">
                                                    <div className="flex gap-1.5">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Poids:</span>
                                                        <span className="text-[10px] font-bold text-slate-700 font-mono">{parcel.poids}kg</span>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Vol:</span>
                                                        <span className="text-[10px] font-bold text-slate-700 font-mono">{parcel.volume}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: SIDEBAR (Actors & Finance) --- */}
                    <div className="space-y-6">

                        {/* 1. ACTORS CARD */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <User className="w-4 h-4 text-slate-400" />
                                Contact & Adresse
                            </h2>

                            <div className="space-y-4">
                                {/* Sender */}
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Expéditeur</p>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <h4 className="font-bold text-slate-900 text-xs">{expediteur.nom_prenom || 'N/A'}</h4>
                                        <a href={`tel:${expediteur.telephone}`} className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                                            <Phone className="w-3 h-3" />
                                            {expediteur.telephone || '-'}
                                        </a>
                                    </div>
                                </div>

                                {/* Receiver */}
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Destinataire</p>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <h4 className="font-bold text-slate-900 text-xs">{destinataire.nom_prenom || 'N/A'}</h4>
                                        <div className="mt-1 space-y-1">
                                            <a href={`tel:${destinataire.telephone}`} className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <Phone className="w-3 h-3" />
                                                {destinataire.telephone || '-'}
                                            </a>
                                            <div className="flex items-start gap-2 text-[11px] text-slate-500">
                                                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                                <span>{destinataire.adresse || destinataire.ville || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. FINANCE CARD */}
                        <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg shadow-slate-200/50">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Facturation
                            </h2>

                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-400">Montant HT</span>
                                    <span className="font-mono">{formatCurrency(expedition.montant_base)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-400">Emballage</span>
                                    <span className="font-mono">{formatCurrency(expedition.frais_emballage)}</span>
                                </div>

                                {parseFloat(expedition.montant_prestation) > 0 && (
                                    <div className="flex justify-between items-center text-[11px] text-emerald-400">
                                        <span>Commission</span>
                                        <span className="font-mono">+{formatCurrency(expedition.montant_prestation)}</span>
                                    </div>
                                )}

                                <div className="h-px bg-white/10 my-2"></div>

                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase">Net à payer</span>
                                    <span className="text-lg font-bold text-white tracking-tight">{formatCurrency(expedition.montant_expedition)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ExpeditionDetails;
