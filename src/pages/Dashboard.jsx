import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    PlusIcon,
    ArrowPathIcon,
    CurrencyDollarIcon,
    ArchiveBoxIcon,
    TruckIcon,
    CubeIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ArrowRightIcon,
    BellAlertIcon,
    XMarkIcon,
    MapPinIcon,
    ChartBarIcon,
    CalendarIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";

import { useAuth } from "../hooks/useAuth";
import { useAgency } from "../hooks/useAgency";
import { useExpedition } from "../hooks/useExpedition";
import { useDashboard } from "../hooks/useDashboard";
import { getLogoUrl } from "../utils/apiConfig";

const Dashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { data: agencyData, fetchAgencyData } = useAgency();
    const { demandesMeta, loadDemandes } = useExpedition();
    const { operational, financial, logistics, loading: dashboardLoading, fetchDashboard } = useDashboard();
    const [showDemandesAlert, setShowDemandesAlert] = useState(true);

    useEffect(() => {
        fetchAgencyData();
        loadDemandes({ page: 1 });
        fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const displayName = currentUser?.name || 
                       [currentUser?.nom, currentUser?.prenoms].filter(Boolean).join(" ") || 
                       "Agent";

    const pendingDemandesCount = demandesMeta?.total || 0;

    if (dashboardLoading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse p-6">
                <div className="h-20 w-full bg-slate-100 rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
                </div>
                <div className="h-96 bg-slate-50 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6">
            
            {/* Alerte Demandes en attente */}
            {pendingDemandesCount > 0 && showDemandesAlert && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                        <BellAlertIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-amber-900 mb-1">
                            {pendingDemandesCount} {pendingDemandesCount === 1 ? 'demande en attente' : 'demandes en attente'}
                        </h3>
                        <p className="text-xs text-amber-700 mb-3">
                            Des clients ont soumis des demandes d'expédition qui nécessitent votre validation.
                        </p>
                        <button
                            onClick={() => navigate('/demandes')}
                            className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                        >
                            Voir les demandes
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowDemandesAlert(false)}
                        className="flex-shrink-0 p-1 text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {agencyData?.agence?.logo ? (
                            <img src={getLogoUrl(agencyData.agence.logo)} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{(agencyData?.agence?.nom_agence || "A")[0]}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Bonjour, {displayName}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {agencyData?.agence?.nom_agence || "Agence Partenaire"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fetchDashboard(true)}
                        disabled={dashboardLoading}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                        title="Actualiser"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${dashboardLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => navigate('/create-expedition')}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Nouvelle expédition
                    </button>
                </div>
            </div>

            {/* KPI Cards - Ligne 1 : Financier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chiffre d'affaires */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group relative">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CurrencyDollarIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Ce mois
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute right-0 top-6 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Chiffre d'affaires du mois</p>
                                    <p className="text-slate-300">Montant total des expéditions créées par votre agence au cours du mois en cours, tous statuts de paiement confondus.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Chiffre d'affaires</p>
                    <h3 className="text-2xl font-bold text-slate-900">
                        {new Intl.NumberFormat('fr-FR').format(financial.chiffre_affaires_mois || 0)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">CFA</p>
                </div>

                {/* Commissions */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group relative">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <ChartBarIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                Gains
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute right-0 top-6 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Commissions du mois</p>
                                    <p className="text-slate-300">Montant total des commissions que votre agence a gagnées sur les expéditions du mois en cours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Commissions</p>
                    <h3 className="text-2xl font-bold text-slate-900">
                        {new Intl.NumberFormat('fr-FR').format(financial.commissions_mois || 0)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">CFA</p>
                </div>

                {/* Impayés */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group relative">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <XCircleIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                À recouvrer
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute right-0 top-6 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Montant des impayés</p>
                                    <p className="text-slate-300">Montant total des expéditions dont le paiement n'a pas encore été effectué par les clients.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Impayés</p>
                    <h3 className="text-2xl font-bold text-slate-900">
                        {new Intl.NumberFormat('fr-FR').format(financial.statut_paiements?.impaye || 0)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">CFA</p>
                </div>

                {/* Encours */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group relative">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <ClockIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                En cours
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute right-0 top-6 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Encours à recouvrer</p>
                                    <p className="text-slate-300">Montant total des créances en cours de recouvrement auprès de vos clients.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Encours</p>
                    <h3 className="text-2xl font-bold text-slate-900">
                        {new Intl.NumberFormat('fr-FR').format(financial.encours_a_recouvrer || 0)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">CFA</p>
                </div>
            </div>

            {/* KPI Cards - Ligne 2 : Opérationnel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Créées aujourd'hui */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group relative">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <CubeIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                Aujourd'hui
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute right-0 top-6 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Expéditions créées aujourd'hui</p>
                                    <p className="text-slate-300">Nombre total de nouvelles fiches d'expéditions enregistrées par votre agence depuis ce matin.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expéditions créées</p>
                    <h3 className="text-2xl font-bold text-slate-900">
                        {operational.expeditions_creees_aujourdhui || 0}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Nouvelles fiches</p>
                </div>

                {/* À réceptionner (Départ) */}
                <Link 
                    to="/colis-a-receptionner"
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group relative"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
                            <ArchiveBoxIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                (operational.colis_attente_reception_depart || 0) > 10 
                                    ? 'bg-red-50 text-red-600' 
                                    : 'bg-amber-50 text-amber-600'
                            }`}>
                                {(operational.colis_attente_reception_depart || 0) > 10 ? 'Urgent' : 'Départ'}
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute right-0 top-6 w-72 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Colis en attente de réception (Départ)</p>
                                    <p className="text-slate-300 mb-2">Colis déclarés dans une expédition au départ de votre agence, mais pas encore scannés ou marqués comme "reçus physiquement" à votre comptoir.</p>
                                    <p className="text-amber-300 font-semibold">→ Action : Réceptionner les colis apportés par les clients</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">À réceptionner (Départ)</p>
                    <h3 className="text-2xl font-bold text-slate-900">
                        {operational.colis_attente_reception_depart || 0}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        Colis clients
                        <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                </Link>

                {/* À remettre (Destination) */}
                <Link 
                    to="/retrait-colis"
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group relative"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                            <TruckIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Arrivée
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute right-0 top-6 w-72 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Colis en attente de retrait/livraison</p>
                                    <p className="text-slate-300 mb-2">Colis physiquement arrivés dans votre agence de destination, mais que le client final n'a pas encore récupérés (ou qui n'ont pas encore été livrés à domicile).</p>
                                    <p className="text-emerald-300 font-semibold">→ Action : Contacter les clients pour le retrait</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">À remettre</p>
                    <h3 className="text-2xl font-bold text-slate-900">
                        {operational.colis_attente_retrait_livraison || 0}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        Prêts en agence
                        <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                </Link>

                {/* Reçus aujourd'hui (Destination) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group relative">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                Aujourd'hui
                            </span>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute right-0 top-6 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                    <p className="font-semibold mb-1">Colis reçus aujourd'hui (Destination)</p>
                                    <p className="text-slate-300">Nombre total de colis que votre agence a scannés comme "arrivés à destination" au cours de la journée actuelle.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Colis reçus</p>
                    <h3 className="text-2xl font-bold text-slate-900">
                        {operational.colis_recus_aujourdhui || 0}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Arrivages du jour</p>
                </div>
            </div>

            {/* Grille 2 colonnes : Dernières expéditions + Statistiques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Dernières Expéditions - 2/3 */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Dernières Expéditions</h3>
                            <p className="text-xs text-slate-500 mt-0.5">5 expéditions les plus récentes</p>
                        </div>
                        <Link 
                            to="/expeditions"
                            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            Voir tout
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {logistics.dernieres_expeditions && logistics.dernieres_expeditions.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {logistics.dernieres_expeditions.map((expedition) => {
                                const getStatusColor = (statut) => {
                                    const colors = {
                                        'recu_agence_depart': 'bg-blue-50 text-blue-700 border-blue-200',
                                        'en_transit_vers_agence_arrivee': 'bg-purple-50 text-purple-700 border-purple-200',
                                        'recu_agence_arrivee': 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
                                        'recu_agence_arrivee': 'Arrivé',
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

                                return (
                                    <Link
                                        key={expedition.id}
                                        to={`/expeditions/${expedition.id}`}
                                        className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group"
                                    >
                                        {/* Icône */}
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <CubeIcon className="w-5 h-5 text-indigo-600" />
                                        </div>

                                        {/* Infos */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-bold text-slate-900">
                                                    {expedition.reference}
                                                </p>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getStatusColor(expedition.statut)}`}>
                                                    {getStatusLabel(expedition.statut)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPinIcon className="w-3.5 h-3.5" />
                                                    {expedition.pays_destination}
                                                </span>
                                                <span>•</span>
                                                <span>{getTypeLabel(expedition.type)}</span>
                                                <span>•</span>
                                                <span>{expedition.nombre_colis} colis</span>
                                            </div>
                                        </div>

                                        {/* Montant */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-slate-900">
                                                {new Intl.NumberFormat('fr-FR').format(expedition.montant || 0)}
                                            </p>
                                            <p className="text-xs text-slate-400">CFA</p>
                                        </div>

                                        {/* Flèche */}
                                        <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                <CubeIcon className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600 mb-1">Aucune expédition</p>
                            <p className="text-xs text-slate-400">Les expéditions créées apparaîtront ici</p>
                        </div>
                    )}
                </div>

                {/* Statistiques - 1/3 */}
                <div className="space-y-6">
                    
                    {/* Top Destinations */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900">Top Destinations</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Ce mois</p>
                        </div>
                        <div className="p-5 space-y-3">
                            {logistics.top_destinations && logistics.top_destinations.length > 0 ? (
                                logistics.top_destinations.slice(0, 5).map((dest, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 truncate">{dest.pays}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 flex-shrink-0">{dest.total}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4">Aucune donnée</p>
                            )}
                        </div>
                    </div>

                    {/* Volume par Type */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900">Volume par Type</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Répartition</p>
                        </div>
                        <div className="p-5 space-y-3">
                            {logistics.volume_par_type && logistics.volume_par_type.length > 0 ? (
                                logistics.volume_par_type.map((vol, index) => {
                                    const colors = [
                                        'bg-blue-500',
                                        'bg-purple-500',
                                        'bg-emerald-500',
                                        'bg-amber-500',
                                        'bg-rose-500'
                                    ];
                                    return (
                                        <div key={index}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-semibold text-slate-600">{vol.type}</span>
                                                <span className="text-xs font-bold text-slate-900">{vol.total}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div 
                                                    className={`${colors[index % colors.length]} h-2 rounded-full transition-all`}
                                                    style={{ 
                                                        width: `${Math.min((vol.total / Math.max(...logistics.volume_par_type.map(v => v.total))) * 100, 100)}%` 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4">Aucune donnée</p>
                            )}
                        </div>
                    </div>

                    {/* Autres indicateurs */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Autres indicateurs</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between group/item relative">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-500">En transit</span>
                                    <div className="relative group/tooltip">
                                        <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                        <div className="absolute left-0 top-5 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                            <p className="font-semibold mb-1">Colis en transit vers votre agence</p>
                                            <p className="text-slate-300">Colis qui ont quitté l'entrepôt international et qui sont en route vers votre ville (rôle d'agence de destination).</p>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-900">{operational.colis_en_transit_vers_agence || 0}</span>
                            </div>
                            <div className="flex items-center justify-between group/item relative">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-500">Vers entrepôt</span>
                                    <div className="relative group/tooltip">
                                        <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                        <div className="absolute left-0 top-5 w-72 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                            <p className="font-semibold mb-1">Colis en attente d'expédition vers l'entrepôt</p>
                                            <p className="text-slate-300 mb-2">Colis déjà reçus à votre agence mais encore stockés chez vous. Ils attendent d'être regroupés et envoyés vers l'entrepôt central.</p>
                                            <p className="text-amber-300 font-semibold">→ Action : Préparer le transfert vers l'entrepôt</p>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-900">{operational.colis_attente_expedition_entrepot || 0}</span>
                            </div>
                            <div className="flex items-center justify-between group/item relative">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-500">Demandes en attente</span>
                                    <div className="relative group/tooltip">
                                        <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                        <div className="absolute left-0 top-5 w-72 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                            <p className="font-semibold mb-1">Expéditions en attente d'acceptation</p>
                                            <p className="text-slate-300 mb-2">Expédition (souvent créée par un client via l'application) assignée à votre agence mais pas encore validée officiellement.</p>
                                            <p className="text-indigo-300 font-semibold">→ Action : Valider ou refuser les demandes</p>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-900">{operational.expeditions_attente_acceptation || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
