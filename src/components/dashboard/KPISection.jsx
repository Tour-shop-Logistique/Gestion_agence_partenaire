import React from "react";
import { Link } from "react-router-dom";
import {
    CurrencyDollarIcon,
    ChartBarIcon,
    XCircleIcon,
    ClockIcon,
    CubeIcon,
    CheckCircleIcon,
    BuildingOfficeIcon,
    ArrowsRightLeftIcon,
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
        emerald: { iconBg: 'bg-emerald-500' },
        indigo: { iconBg: 'bg-indigo-500' },
        red: { iconBg: 'bg-red-500' },
        amber: { iconBg: 'bg-amber-500' },
        blue: { iconBg: 'bg-blue-500' },
        green: { iconBg: 'bg-green-500' }
    };

    const colors = colorMap[colorScheme];

    const content = (
        <div className="flex items-start gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${colors.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm ${isClickable ? 'group-hover:scale-105 transition-transform' : ''}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{label}</p>
                    {tooltip && (
                        <div className="relative group/tooltip hidden sm:block">
                            <InformationCircleIcon className="w-3.5 h-3.5 text-slate-300 hover:text-slate-400 cursor-help" />
                            <div className="absolute left-0 top-5 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                                {tooltip}
                            </div>
                        </div>
                    )}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 leading-none truncate">
                    {typeof value === 'number' ? new Intl.NumberFormat('fr-FR').format(value) : value}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    {badge && <span className="font-medium text-slate-500">{badge}</span>}
                    {badge && unit && <span>·</span>}
                    <span className="truncate">{unit}</span>
                    {isClickable && <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />}
                </p>
            </div>
        </div>
    );

    if (link) {
        return (
            <Link
                to={link}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200 group relative"
            >
                {content}
            </Link>
        );
    }

    return (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 group relative">
            {content}
        </div>
    );
};

/**
 * Section KPI organisée par catégories métier
 */
const KPISection = ({ financial, operational }) => {
    return (
        <div className="space-y-5 sm:space-y-8">
            {/* 💰 Performance Financière */}
            <div>
                <div className="mb-3 sm:mb-4 flex items-center gap-2.5">
                    <div className="w-1 h-5 sm:h-6 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
                    <div>
                        <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>💰</span>
                            Performance financière
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Indicateurs de revenus et trésorerie</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
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
                <div className="mb-3 sm:mb-4 flex items-center gap-2.5">
                    <div className="w-1 h-5 sm:h-6 rounded-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
                    <div>
                        <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>🚚</span>
                            Activité opérationnelle
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Volume et flux de colis</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    <KPICard
                        icon={CubeIcon}
                        label="Expéditions créées"
                        value={operational.expeditions_creees_aujourdhui || 0}
                        unit="Nouvelles fiches"
                        badge="Aujourd'hui"
                        colorScheme="blue"
                        link="/expeditions"
                        isClickable={true}
                        tooltip="Nombre total de nouvelles fiches d'expéditions enregistrées par votre agence depuis ce matin."
                    />
                    <KPICard
                        icon={BuildingOfficeIcon}
                        label="Vers entrepôt"
                        value={operational.colis_attente_expedition_entrepot || 0}
                        unit="Colis en agence"
                        badge="À transférer"
                        colorScheme="amber"
                        link="/colis"
                        isClickable={true}
                        tooltip={
                            <>
                                <p className="font-semibold mb-1">Colis en attente d'expédition vers l'entrepôt</p>
                                <p className="text-slate-300 mb-2">Colis déjà reçus à votre agence mais encore stockés chez vous. Ils attendent d'être regroupés et envoyés vers l'entrepôt central.</p>
                                <p className="text-amber-300 font-semibold">→ Action : Préparer le transfert vers l'entrepôt</p>
                            </>
                        }
                    />
                    <KPICard
                        icon={ArrowsRightLeftIcon}
                        label="En transit"
                        value={operational.colis_en_transit_vers_agence || 0}
                        unit="Vers votre agence"
                        badge="En route"
                        colorScheme="blue"
                        tooltip={
                            <>
                                <p className="font-semibold mb-1">Colis en transit vers votre agence</p>
                                <p className="text-slate-300">Colis qui ont quitté l'entrepôt international et qui sont en route vers votre ville (rôle d'agence de destination).</p>
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
                        link="/colis-a-receptionner"
                        isClickable={true}
                        tooltip="Nombre total de colis que votre agence a scannés comme 'arrivés à destination' au cours de la journée actuelle."
                    />
                </div>
            </div>
        </div>
    );
};

export default KPISection;
