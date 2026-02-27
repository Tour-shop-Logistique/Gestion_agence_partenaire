import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useExpedition } from "../hooks/useExpedition";
import { useAgency } from "../hooks/useAgency";
import { formatPriceDual } from "../utils/format";
import { Link } from "react-router-dom";
import { toast } from "../utils/toast";
import { Check, X, Eye, Package, Calendar, MapPin, User, ArrowRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";

const Demandes = () => {
    const {
        demandes,
        demandesMeta,
        status,
        loadDemandes,
        acceptDemande,
        refuseDemande,
        message,
        error,
        resetStatus
    } = useExpedition();
    const { agencyData, fetchAgencyData } = useAgency();
    const [currentPage, setCurrentPage] = useState(1);
    const [processingId, setProcessingId] = useState(null);
    const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [idToRefuse, setIdToRefuse] = useState(null);
    const [idToAccept, setIdToAccept] = useState(null);
    const [motifRefus, setMotifRefus] = useState("");

    useEffect(() => {
        loadDemandes({ page: currentPage });
    }, [currentPage, loadDemandes]);

    useEffect(() => {
        fetchAgencyData();
    }, [fetchAgencyData]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            resetStatus();
        }
    }, [message, resetStatus]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            resetStatus();
        }
    }, [error, resetStatus]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (demandesMeta?.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const handleAccept = (id) => {
        setIdToAccept(id);
        setIsAcceptModalOpen(true);
    };

    const confirmAccept = async () => {
        if (!idToAccept) return;
        setProcessingId(idToAccept);
        await acceptDemande(idToAccept);
        setProcessingId(null);
        setIsAcceptModalOpen(false);
        setIdToAccept(null);
    };

    const handleRefuse = (id) => {
        setIdToRefuse(id);
        setIsRefuseModalOpen(true);
    };

    const confirmRefuse = async () => {
        if (!idToRefuse) return;
        setProcessingId(idToRefuse);
        await refuseDemande(idToRefuse, { motif_refus: motifRefus });
        setProcessingId(null);
        setIsRefuseModalOpen(false);
        setIdToRefuse(null);
        setMotifRefus("");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'simple':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'groupage_dhd_aerien':
                return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'groupage_dhd_maritine':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            case 'groupage_afrique':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'groupage_ca':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'simple': return 'Simple';
            case 'groupage_dhd_aerien': return 'DHD Aérien';
            case 'groupage_dhd_maritine': return 'DHD Maritime';
            case 'groupage_afrique': return 'Afrique';
            case 'groupage_ca': return 'CA';
            default: return type || 'Inconnu';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
                {/* Premium Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                            Demandes Clients
                        </h1>
                        <p className="text-sm font-medium text-slate-500 tracking-wide max-w-xl">
                            Gérez les demandes d'expédition effectuées par les clients via l'application
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => loadDemandes({ page: currentPage }, true)}
                            disabled={status === 'loading'}
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                            title="Rafraîchir la liste"
                        >
                            <RefreshCw className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="group relative bg-gradient-to-br from-white to-slate-50/50 px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm transition-all duration-200">
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-[0.15em]">En attente</span>
                                    <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">{demandesMeta?.total || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Main Content Card */}
                <div className="relative bg-gradient-to-br from-white via-white to-slate-50/30 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none"></div>

                    <div className="relative overflow-x-auto">
                        {/* Mobile view: Cards */}
                        <div className="lg:hidden p-4 space-y-4">
                            {status === 'loading' && demandes.length === 0 ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 animate-pulse space-y-3">
                                        <div className="flex justify-between items-center"><div className="h-4 bg-slate-200 rounded w-1/3"></div><div className="h-6 bg-slate-100 rounded-full w-20"></div></div>
                                        <div className="h-3 bg-slate-100 rounded w-full"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                    </div>
                                ))
                            ) : demandes.length > 0 ? (
                                demandes.map((demande) => (
                                    <div key={demande.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                    <User className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{demande.expediteur?.nom_prenom}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{formatDate(demande.created_at)}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border shrink-0 ${getTypeStyle(demande.type_expedition)}`}>
                                                {getTypeLabel(demande.type_expedition)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50/50 p-2 rounded-lg">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{demande.pays_depart}</span>
                                            <ArrowRight className="w-3 h-3 text-slate-300" />
                                            <span className="text-indigo-600">{demande.pays_destination}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contenu</span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                    <Package className="w-3.5 h-3.5 text-slate-400" />
                                                    {demande.colis?.length || 0} Colis
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-0.5 items-end">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valeur</span>
                                                <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                    {formatPriceDual(demande.montant_expedition)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-50 flex items-center gap-2">
                                            <Link
                                                to={`/expeditions/${demande.id}`}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" /> Détails
                                            </Link>
                                            <button
                                                onClick={() => handleRefuse(demande.id)}
                                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAccept(demande.id)}
                                                className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors"
                                            >
                                                <Check className="w-4 h-4" /> Accepter
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : null}
                        </div>

                        {/* Desktop view: Table */}
                        <table className="hidden lg:table w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60">
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Client / Date</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Type & Trajet</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Détails Colis</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Montant Estimé</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {status === 'loading' && demandes.length === 0 ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-8"><div className="h-4 bg-slate-200 rounded w-32 mb-2"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                                            <td className="px-8 py-8"><div className="h-6 bg-slate-200 rounded-lg w-24 mb-2"></div><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="px-8 py-8"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                            <td className="px-8 py-8"><div className="h-5 bg-slate-200 rounded w-24"></div></td>
                                            <td className="px-8 py-8 text-right"><div className="flex justify-end gap-2"><div className="h-10 w-10 bg-slate-200 rounded-xl"></div><div className="h-10 w-10 bg-slate-200 rounded-xl"></div></div></td>
                                        </tr>
                                    ))
                                ) : demandes.length > 0 ? (
                                    demandes.map((demande) => (
                                        <tr key={demande.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-slate-500" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {demande.expediteur?.nom_prenom}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 ml-10">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(demande.created_at)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-flex self-start px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shadow-sm ${getTypeStyle(demande.type_expedition)}`}>
                                                        {getTypeLabel(demande.type_expedition)}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">{demande.pays_depart}</span>
                                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">{demande.pays_destination}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                        <Package className="w-4 h-4 text-slate-400" />
                                                        {demande.colis?.length || 0} Colis
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                        {demande.colis?.map(c => c.produit_nom).join(', ')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-base font-bold text-slate-900 tabular-nums">
                                                        {formatPriceDual(demande.montant_expedition)}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Tarif calculé</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        to={`/expeditions/${demande.id}`}
                                                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all"
                                                        title="Détails"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleRefuse(demande.id)}
                                                        disabled={processingId === demande.id}
                                                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg transition-all disabled:opacity-50"
                                                        title="Refuser"
                                                    >
                                                        {processingId === demande.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAccept(demande.id)}
                                                        disabled={processingId === demande.id}
                                                        className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center gap-2"
                                                        title="Accepter"
                                                    >
                                                        {processingId === demande.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                                        <span className="text-xs font-bold px-1">Accepter</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center max-w-md mx-auto">
                                                <div className="relative w-24 h-24 mb-6">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-3xl rotate-6"></div>
                                                    <div className="relative w-full h-full bg-white rounded-3xl shadow-xl flex items-center justify-center border border-amber-100">
                                                        <Package className="w-10 h-10 text-amber-200" />
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Aucune demande en attente</h3>
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                                    Les nouvelles demandes d'expédition de vos clients apparaîtront ici.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {demandesMeta && demandesMeta.last_page > 1 && (
                        <div className="px-6 sm:px-8 py-6 bg-slate-50/50 backdrop-blur-sm border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Page <span className="text-indigo-600 font-bold">{demandesMeta.current_page}</span> sur <span className="text-slate-900 font-bold">{demandesMeta.last_page}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(demandesMeta.current_page - 1)}
                                    disabled={demandesMeta.current_page === 1}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 disabled:text-slate-300 hover:bg-white rounded-xl transition-all"
                                >
                                    Précédent
                                </button>
                                <button
                                    onClick={() => handlePageChange(demandesMeta.current_page + 1)}
                                    disabled={demandesMeta.current_page === demandesMeta.last_page}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 disabled:text-slate-300 hover:bg-white rounded-xl transition-all"
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={isRefuseModalOpen}
                onClose={() => {
                    setIsRefuseModalOpen(false);
                    setIdToRefuse(null);
                    setMotifRefus("");
                }}
                onConfirm={confirmRefuse}
                title="Refuser la demande"
                message="Êtes-vous sûr de vouloir refuser cette demande d'expédition ? Veuillez indiquer le motif du refus ci-dessous."
                confirmText="Refuser la demande"
                type="danger"
                isLoading={processingId === idToRefuse}
            >
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Motif du refus
                    </label>
                    <textarea
                        value={motifRefus}
                        onChange={(e) => setMotifRefus(e.target.value)}
                        placeholder="Ex: Articles non autorisés, poids incorrect, etc..."
                        className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none"
                    />
                </div>
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={isAcceptModalOpen}
                onClose={() => {
                    setIsAcceptModalOpen(false);
                    setIdToAccept(null);
                }}
                onConfirm={confirmAccept}
                title="Accepter la demande"
                message="Voulez-vous accepter cette demande d'expédition ? Elle sera ajoutée à votre liste d'expéditions actives."
                confirmText="Accepter la demande"
                type="success"
                isLoading={processingId === idToAccept}
            />
        </DashboardLayout>
    );
};

export default Demandes;
