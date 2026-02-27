import React, { useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    InboxArrowDownIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    CalendarIcon,
    CubeIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";
import { formatPriceDual } from "../utils/format";

// Mock data for the demo
const INITIAL_MOCK_DATA = [
    {
        id: 1,
        code_colis: "CL-230501-A1",
        reference_expedition: "EXP-24001",
        client_nom: "Jean Dupont",
        client_telephone: "+33 6 12 34 56 78",
        pays_origine: "France",
        ville_destination: "Abidjan",
        designation: "Vêtements et accessoires",
        poids: "12.5 kg",
        date_expedition: "2024-02-15",
        statut: "En transit", // En transit, Arrivé, Livré
        created_at: "2024-02-15T10:30:00Z"
    },
    {
        id: 2,
        code_colis: "CL-230501-B2",
        reference_expedition: "EXP-24002",
        client_nom: "Marie Kouassi",
        client_telephone: "+225 07 45 89 23",
        pays_origine: "France",
        ville_destination: "Abidjan",
        designation: "Ordinateur Portable Dell",
        poids: "3.2 kg",
        date_expedition: "2024-02-18",
        statut: "En transit",
        created_at: "2024-02-18T14:20:00Z"
    },
    {
        id: 3,
        code_colis: "CL-230501-C3",
        reference_expedition: "EXP-24003",
        client_nom: "Alain Traoré",
        client_telephone: "+226 70 12 34 56",
        pays_origine: "Chine",
        ville_destination: "Ouagadougou",
        designation: "Matériel électronique",
        poids: "45.0 kg",
        date_expedition: "2024-02-10",
        statut: "Arrivé",
        created_at: "2024-02-10T09:15:00Z"
    },
    {
        id: 4,
        code_colis: "CL-230501-D4",
        reference_expedition: "EXP-24004",
        client_nom: "Fatima Sidibé",
        client_telephone: "+223 66 77 88 99",
        pays_origine: "Turquie",
        ville_destination: "Bamako",
        designation: "Tissus et Wax",
        poids: "25.5 kg",
        date_expedition: "2024-02-20",
        statut: "En transit",
        created_at: "2024-02-20T16:45:00Z"
    }
];

const ReceptionColis = () => {
    const [colis, setColis] = useState(INITIAL_MOCK_DATA);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Filter logic
    const filteredColis = useMemo(() => {
        if (!searchQuery) return colis;
        const lowQuery = searchQuery.toLowerCase();
        return colis.filter(item =>
            item.code_colis.toLowerCase().includes(lowQuery) ||
            item.client_nom.toLowerCase().includes(lowQuery) ||
            item.reference_expedition.toLowerCase().includes(lowQuery) ||
            item.pays_origine.toLowerCase().includes(lowQuery)
        );
    }, [colis, searchQuery]);

    const handleValidateReception = (id) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setColis(prev => prev.map(item =>
                item.id === id ? { ...item, statut: "Arrivé" } : item
            ));
            setIsLoading(false);
        }, 1000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-1 sm:px-0">
                {/* Premium Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                                <InboxArrowDownIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                                Réception des Colis
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-slate-500 tracking-wide ml-1 ml-14">
                            Gérez l'arrivée des colis internationaux à votre agence
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                        {/* Search Bar */}
                        <div className="relative group flex-1 sm:w-80 lg:w-96">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                placeholder="Rechercher par code, client ou pays..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => {
                                setIsLoading(true);
                                setTimeout(() => setIsLoading(false), 800);
                            }}
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all active:scale-95"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "En Transit", count: colis.filter(c => c.statut === "En transit").length, color: "bg-amber-50 text-amber-700 border-amber-100" },
                        { label: "Reçus à l'agence", count: colis.filter(c => c.statut === "Arrivé").length, color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
                        { label: "Total en attente", count: colis.length, color: "bg-slate-50 text-slate-700 border-slate-100" }
                    ].map((stat, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${stat.color} flex items-center justify-between`}>
                            <span className="text-sm font-bold uppercase tracking-wider">{stat.label}</span>
                            <span className="text-2xl font-black">{stat.count}</span>
                        </div>
                    ))}
                </div>

                {/* Main List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredColis.length > 0 ? (
                        filteredColis.map((item) => (
                            <div
                                key={item.id}
                                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${item.statut === 'Arrivé' ? 'border-indigo-100 bg-indigo-50/10' : 'border-slate-200 hover:shadow-xl hover:shadow-slate-200/50'
                                    }`}
                            >
                                <div className="p-6 space-y-4">
                                    {/* Top Section: Badges and Code */}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-indigo-600 tracking-wider uppercase">#{item.code_colis}</span>
                                                {item.statut === 'Arrivé' && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        REÇU
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">{item.designation}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">
                                                {item.poids}
                                            </span>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Exp: {item.reference_expedition}</p>
                                        </div>
                                    </div>

                                    {/* Client Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 rounded-lg">
                                                    <UserIcon className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Client</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">{item.client_nom}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 rounded-lg">
                                                    <PhoneIcon className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Contact</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">{item.client_telephone}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 rounded-lg">
                                                    <MapPinIcon className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Trajet</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                        {item.pays_origine} → {item.ville_destination}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 rounded-lg">
                                                    <CalendarIcon className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Date Exp.</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">{formatDate(item.date_expedition)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <InformationCircleIcon className="w-4 h-4" />
                                            <span className="text-[11px] font-medium italic">En attente de réception physique</span>
                                        </div>

                                        {item.statut === 'En transit' ? (
                                            <button
                                                onClick={() => handleValidateReception(item.id)}
                                                className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center gap-2"
                                            >
                                                Valider la réception
                                            </button>
                                        ) : (
                                            <div className="px-6 py-2.5 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100 flex items-center gap-2">
                                                <CheckCircleIcon className="w-4 h-4" />
                                                Colis réceptionné
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto">
                                <CubeIcon className="w-12 h-12 text-slate-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-slate-900">Aucun colis trouvé</p>
                                <p className="text-sm text-slate-500 font-medium">Réessayez avec d'autres termes de recherche</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Help Footer */}
                <div className="bg-indigo-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden group">
                    <div className="relative z-10 space-y-4 max-w-2xl">
                        <h3 className="text-xl sm:text-2xl font-bold">Besoin d'aide avec la réception ?</h3>
                        <p className="text-indigo-100/80 text-sm font-medium leading-relaxed">
                            Cette page est une démonstration de l'interface de réception. Une fois le colis validé,
                            le client recevra automatiquement une notification (Email/SMS) l'informant que son colis
                            est prêt à être retiré à votre agence.
                        </p>
                        <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white text-indigo-900 px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
                            Consulter le guide
                        </button>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReceptionColis;
