import { useEffect, useMemo } from "react";
import { ArrowLeftRight, Info, Loader2 } from "lucide-react";
import { useTarifs } from "../hooks/useTarifs";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { showToast } from "../utils/toast";
import PageHeader from "../components/ui/PageHeader";
import ExportButton from "../components/common/ExportButton";

const formatCFA = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0) + ' CFA';

// Palette cyclique par nom (hash stable) plutôt qu'un mapping figé ou un
// rang manuel ("ordre", retiré côté backend) : la grille de formats est
// extensible (voir FormatColis côté backend), un nom de format n'est pas
// une valeur connue à l'avance, mais un même nom doit toujours retomber sur
// la même couleur d'un rendu à l'autre.
const FORMAT_BADGE_PALETTE = [
    'bg-sky-50 text-sky-700 border-sky-100',
    'bg-violet-50 text-violet-700 border-violet-100',
    'bg-amber-50 text-amber-700 border-amber-100',
    'bg-emerald-50 text-emerald-700 border-emerald-100',
    'bg-rose-50 text-rose-700 border-rose-100',
];

const hashNomFormat = (nom) => {
    let hash = 0;
    for (let i = 0; i < (nom || '').length; i++) {
        hash = (hash * 31 + nom.charCodeAt(i)) % FORMAT_BADGE_PALETTE.length;
    }
    return hash;
};

const FormatBadge = ({ format }) => {
    const classes = FORMAT_BADGE_PALETTE[hashNomFormat(format?.nom)];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded border font-semibold text-xs ${classes}`}>
            {format?.nom || '—'}
        </span>
    );
};

/**
 * Consultation en lecture seule des tarifs interville concernant l'agence
 * (où sa commune apparaît comme point de départ ou d'arrivée). Aucune
 * action de modification : les commissions départ/arrivée sont fixées
 * uniquement par le back-office, une agence pouvant être "départ" sur une
 * ligne et "arrivée" sur une autre.
 */
const TarifsInterville = () => {
    const { currentUser } = useAuth();
    const { intervilleTarifs, loadingInterville, fetchTarifsInterville } = useTarifs();

    useWebSocket(
        currentUser?.agence_id,
        {
            onTarifsUpdated: (data, meta) => {
                if (meta.model === 'TarifInterville') {
                    showToast('⚠️ Les tarifs interville ont été mis à jour par le backoffice', 'warning');
                    fetchTarifsInterville();
                }
            }
        },
        !!currentUser?.agence_id
    );

    useEffect(() => {
        fetchTarifsInterville();
    }, [fetchTarifsInterville]);

    const exportColumns = useMemo(() => ([
        { header: 'Commune A', key: 'commune_a' },
        { header: 'Commune B', key: 'commune_b' },
        { header: 'Format', key: 'format' },
        { header: 'Montant Base (FCFA)', key: 'montant_base' },
        { header: '% Commission départ', key: 'pourcentage_commission_depart' },
        { header: '% Commission arrivée', key: 'pourcentage_commission_arrivee' },
    ]), []);

    const exportRows = useMemo(() => (intervilleTarifs || []).map((tarif) => ({
        commune_a: tarif.commune_a?.nom || '',
        commune_b: tarif.commune_b?.nom || '',
        format: tarif.format_colis?.nom || '',
        montant_base: parseFloat(tarif.montant_base) || 0,
        pourcentage_commission_depart: parseFloat(tarif.pourcentage_commission_depart) || 0,
        pourcentage_commission_arrivee: parseFloat(tarif.pourcentage_commission_arrivee) || 0,
    })), [intervilleTarifs]);

    return (
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
            <PageHeader
                title="Tarifs Interville (National)"
                subtitle="Tarifs de transport entre communes concernant votre agence"
                actions={
                    <ExportButton
                        columns={exportColumns}
                        rows={exportRows}
                        filename="tarifs-interville"
                        title="Tarifs Interville"
                        disabled={exportRows.length === 0}
                    />
                }
            />

            <div className="flex items-start gap-2.5 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                    Ces tarifs sont définis par le back-office et ne sont pas modifiables ici. Les deux commissions
                    (départ et arrivée) sont affichées côte à côte : celle qui s'applique dépend de votre rôle
                    (agence de départ ou d'arrivée) sur l'expédition concernée.
                </p>
            </div>

            <main className="relative animate-in slide-in-from-bottom-4 duration-500 mt-2">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {loadingInterville && intervilleTarifs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6">
                            <Loader2 className="h-8 w-8 text-slate-900 animate-spin mb-3" />
                            <p className="text-slate-500 text-sm font-medium">Chargement des tarifs...</p>
                        </div>
                    ) : intervilleTarifs.length === 0 ? (
                        <div className="py-16 text-center px-6">
                            <div className="bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                                <ArrowLeftRight className="text-slate-400" size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900">Aucun tarif interville</h3>
                            <p className="text-slate-500 text-sm mt-1">
                                Aucun tarif n'a encore été configuré pour la commune de votre agence.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Trajet</th>
                                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Format</th>
                                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Montant Base</th>
                                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Commission si départ</th>
                                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Commission si arrivée</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {intervilleTarifs.map((tarif) => (
                                            <tr key={tarif.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                                                        <span>{tarif.commune_a?.nom || '?'}</span>
                                                        <ArrowLeftRight size={12} className="text-slate-400 shrink-0" />
                                                        <span>{tarif.commune_b?.nom || '?'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <FormatBadge format={tarif.format_colis} />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <p className="font-medium text-slate-700">{formatCFA(tarif.montant_base)}</p>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100 font-bold">
                                                        {tarif.pourcentage_commission_depart}%
                                                    </span>
                                                    <span className="text-slate-500 font-medium ml-2 text-xs">
                                                        ({formatCFA(tarif.montant_commission_depart)})
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100 font-bold">
                                                        {tarif.pourcentage_commission_arrivee}%
                                                    </span>
                                                    <span className="text-slate-500 font-medium ml-2 text-xs">
                                                        ({formatCFA(tarif.montant_commission_arrivee)})
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile */}
                            <div className="md:hidden divide-y divide-slate-200">
                                {intervilleTarifs.map((tarif) => (
                                    <div key={tarif.id} className="p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-900 text-sm flex items-center gap-1 truncate">
                                                {tarif.commune_a?.nom} <ArrowLeftRight size={10} className="text-slate-400 shrink-0" /> {tarif.commune_b?.nom}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FormatBadge format={tarif.format_colis} />
                                            <p className="text-xs text-slate-500 font-bold uppercase">{formatCFA(tarif.montant_base)}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                                                <span className="text-[10px] text-slate-500 font-bold">Si départ</span>
                                                <span className="text-xs font-semibold text-orange-600">{tarif.pourcentage_commission_depart}%</span>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                                                <span className="text-[10px] text-slate-500 font-bold">Si arrivée</span>
                                                <span className="text-xs font-semibold text-orange-600">{tarif.pourcentage_commission_arrivee}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TarifsInterville;
