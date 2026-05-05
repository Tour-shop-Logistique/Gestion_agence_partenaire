import React from "react";
import { Link } from "react-router-dom";
import {
    CurrencyDollarIcon,
    ChartBarIcon,
    XCircleIcon,
    ClockIcon,
    CubeIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    TruckIcon,
    InformationCircleIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";

/**
 * Carte KPI réutilisable
 */
const KPICard = ({ 
    icon: Icon, 
    label, 
    value, 
    unit, 
    badge, 
    tooltip, 
    colorScheme = 'slate',
    link = null,
    isClickable = false
}) => {
    const colorMap = {
        emerald: {
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            badgeBg: 'bg-emerald-50',
            badgeText: 'text-emerald-600'
        },
        indigo: {
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            badgeBg: 'bg-indigo-50',
            badgeText: 'text-indigo-600'
        },
        red: {
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
            badgeBg: 'bg-red-50',
            badgeText: 'text-red-600'
        },
        amber: {
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            badgeBg: 'bg-amber-50',
            badgeText: 'text-amber-600'
        },
        blue: {
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            badgeBg: 'bg-blue-50',
            badgeText: 'text-blue-600'
        },
        green: {
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
            badgeBg: 'bg-green-50',
            badgeText: 'text-green-600'
        }
    };

    const colors = colorMap[colorScheme];

    const content = (
        <>
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 ${colors.iconBg} ${colors.iconColor} rounded-lg ${isClickable ? 'group-hover:scale-110 transition-transform' : ''}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                    <span className={`text-xs font-semibold ${colors.badgeBg} ${colors.badgeText} px-2 py-0.5 rounded-full`}>
                        {badge}
                    </span>
                    {tooltip && (
                        <div className="relative group/tooltip">
                            <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-help" />
                            <div className="absolute right-0 top-6 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                {tooltip}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-slate-900">
                {typeof value === 'number' ? new Intl.NumberFormat('fr-FR').format(value) : value}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {unit}
                {isClickable && <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </p>
        </>
    );

    if (link) {
        return (
            <Link 
                to={link}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group relative"
            >
                {content}
            </Link>
        );
    }

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group relative">
            {content}
        </div>
    );
};

/**
 * Section KPI organisée par catégories métier
 */
const KPISection = ({ financial, operational }) => {
    return (
        <div className="space-y-6">
            {/* 💰 Performance Financière */}
            <div>
                <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-emerald-600">💰</span>
                        Performance financière
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Indicateurs de revenus et trésorerie</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        icon={CurrencyDollarIcon}
                        label="Chiffre d'affaires"
                        value={financial.chiffre_affaires_mois || 0}
                        unit="CFA"
                        badge="Ce mois"
                        colorScheme="emerald"
                        tooltip="Montant total des expéditions créées par votre agence au cours du mois en cours, tous statuts de paiement confondus."
                    />
                    <KPICard
                        icon={ChartBarIcon}
                        label="Commissions"
                        value={financial.commissions_mois || 0}
                        unit="CFA"
                        badge="Gains"
                        colorScheme="indigo"
                        tooltip="Montant total des commissions que votre agence a gagnées sur les expéditions du mois en cours."
                    />
                    <KPICard
                        icon={XCircleIcon}
                        label="Impayés"
                        value={financial.statut_paiements?.impaye || 0}
                        unit="CFA"
                        badge="À recouvrer"
                        colorScheme="red"
                        tooltip="Montant total des expéditions dont le paiement n'a pas encore été effectué par les clients."
                    />
                    <KPICard
                        icon={ClockIcon}
                        label="Encours"
                        value={financial.encours_a_recouvrer || 0}
                        unit="CFA"
                        badge="En cours"
                        colorScheme="amber"
                        tooltip="Montant total des créances en cours de recouvrement auprès de vos clients."
                    />
                </div>
            </div>

            {/* 🚚 Activité Opérationnelle */}
            <div>
                <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-blue-600">🚚</span>
                        Activité opérationnelle
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Volume et flux de colis</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        icon={CubeIcon}
                        label="Expéditions créées"
                        value={operational.expeditions_creees_aujourdhui || 0}
                        unit="Nouvelles fiches"
                        badge="Aujourd'hui"
                        colorScheme="blue"
                        tooltip="Nombre total de nouvelles fiches d'expéditions enregistrées par votre agence depuis ce matin."
                    />
                    <KPICard
                        icon={ArchiveBoxIcon}
                        label="À réceptionner (Départ)"
                        value={operational.colis_attente_reception_depart || 0}
                        unit="Colis clients"
                        badge={(operational.colis_attente_reception_depart || 0) > 10 ? 'Urgent' : 'Départ'}
                        colorScheme="amber"
                        link="/colis-a-receptionner"
                        isClickable={true}
                        tooltip={
                            <>
                                <p className="font-semibold mb-1">Colis en attente de réception (Départ)</p>
                                <p className="text-slate-300 mb-2">Colis déclarés dans une expédition au départ de votre agence, mais pas encore scannés ou marqués comme "reçus physiquement" à votre comptoir.</p>
                                <p className="text-amber-300 font-semibold">→ Action : Réceptionner les colis apportés par les clients</p>
                            </>
                        }
                    />
                    <KPICard
                        icon={TruckIcon}
                        label="À remettre"
                        value={operational.colis_attente_retrait_livraison || 0}
                        unit="Prêts en agence"
                        badge="Arrivée"
                        colorScheme="emerald"
                        link="/retrait-colis"
                        isClickable={true}
                        tooltip={
                            <>
                                <p className="font-semibold mb-1">Colis en attente de retrait/livraison</p>
                                <p className="text-slate-300 mb-2">Colis physiquement arrivés dans votre agence de destination, mais que le client final n'a pas encore récupérés (ou qui n'ont pas encore été livrés à domicile).</p>
                                <p className="text-emerald-300 font-semibold">→ Action : Contacter les clients pour le retrait</p>
                            </>
                        }
                    />
                    <KPICard
                        icon={CheckCircleIcon}
                        label="Colis reçus"
                        value={operational.colis_recus_aujourdhui || 0}
                        unit="Arrivages du jour"
                        badge="Aujourd'hui"
                        colorScheme="green"
                        tooltip="Nombre total de colis que votre agence a scannés comme 'arrivés à destination' au cours de la journée actuelle."
                    />
                </div>
            </div>
        </div>
    );
};

export default KPISection;
