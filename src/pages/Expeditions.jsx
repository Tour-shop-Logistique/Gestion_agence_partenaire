import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useExpedition } from "../hooks/useExpedition";
import { Link } from "react-router-dom";

const Expeditions = () => {
    const { expeditions, meta, loadExpeditions, status } = useExpedition();
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadExpeditions(currentPage);
    }, [currentPage, loadExpeditions]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (meta?.last_page || 1)) {
            setCurrentPage(page);
        }
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'delivered':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'accepted': return 'Acceptée';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulée';
            case 'delivered': return 'Livrée';
            case 'in_transit': return 'En transit';
            default: return status || 'Inconnu';
        }
    };

    const getPaymentStatusStyle = (status) => {
        switch (status) {
            case 'paye':
                return 'bg-emerald-50 text-emerald-600';
            case 'en_attente':
                return 'bg-orange-50 text-orange-600';
            case 'partiel':
                return 'bg-blue-50 text-blue-600';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Liste des <span className="text-blue-600">Expéditions</span>
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Gérez et suivez toutes vos expéditions en temps réel
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-sm font-bold text-gray-700">{meta?.total || 0} Expéditions au total</span>
                        </div>
                    </div>
                </div>

                {/* Main Table Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Référence & Date</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Expéditeur / Destinataire</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Trajet</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Montant</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Statuts</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {status === 'loading' ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="6" className="px-6 py-8">
                                                <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : expeditions.length > 0 ? (
                                    expeditions.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {exp.reference}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-gray-400 mt-0.5">
                                                        {formatDate(exp.created_at)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black">E</span>
                                                        <span className="text-xs font-bold text-gray-700">{exp.expediteur?.nom_prenom}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-4 h-4 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-[8px] font-black">D</span>
                                                        <span className="text-xs font-bold text-gray-700">{exp.destinataire?.nom_prenom}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] font-black text-gray-400">{exp.pays_depart}</span>
                                                        <svg className="w-4 h-4 text-blue-500 my-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                        </svg>
                                                        <span className="text-[10px] font-black text-blue-600">{exp.pays_destination}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900">
                                                        {parseFloat(exp.montant_expedition).toLocaleString()} CFA
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        {exp.colis?.length || 0} Colis
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(exp.statut_expedition)}`}>
                                                        {getStatusLabel(exp.statut_expedition)}
                                                    </span>
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${getPaymentStatusStyle(exp.statut_paiement)}`}>
                                                        {exp.statut_paiement === 'en_attente' ? 'Paiement en attente' : exp.statut_paiement}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all text-gray-400 hover:text-blue-600 border border-transparent hover:border-blue-100">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900">Aucune expédition trouvée</h3>
                                                <p className="text-gray-500 text-sm max-w-xs mt-1">
                                                    Nous n'avons trouvé aucune expédition correspondant à vos critères.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Section */}
                    {meta && meta.last_page > 1 && (
                        <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Page <span className="text-blue-600">{meta.current_page}</span> sur <span className="text-gray-900">{meta.last_page}</span>
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(meta.current_page - 1)}
                                    disabled={meta.current_page === 1}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meta.current_page === 1
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    Précédent
                                </button>

                                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                <span className="px-2 text-gray-300">...</span>
                                            )}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${meta.current_page === page
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                        : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    ))}

                                <button
                                    onClick={() => handlePageChange(meta.current_page + 1)}
                                    disabled={meta.current_page === meta.last_page}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meta.current_page === meta.last_page
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Expeditions;
