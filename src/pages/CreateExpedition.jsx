import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useExpedition } from "../hooks/useExpedition";
import { useTarifs } from "../hooks/useTarifs";
import { useAgency } from "../hooks/useAgency";
import PrintSuccessModal from "../components/Receipts/PrintSuccessModal";
import { getLogoUrl } from "../utils/apiConfig";

const CreateExpedition = () => {
    const navigate = useNavigate();
    const {
        createExpedition,
        simulateExpedition,
        loadProducts,
        loadCategories,
        products,
        categories,
        status,
        simulationStatus,
        simulationResult,
        simulating,
        error,
        message,
        resetStatus,
        cleanSimulation,
        currentExpedition
    } = useExpedition();

    const { existingGroupageTarifs, fetchTarifGroupageAgence } = useTarifs();
    const { data: agencyData, fetchAgencyData } = useAgency();

    // État pour la navigation interne (1: Config & Colis, 2: Contacts & Finalize)
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        type_expedition: "SIMPLE",
        pays_depart: "Côte d'Ivoire",
        pays_destination: "",
        is_paiement_credit: false,
        is_livraison_domicile: true,
        statut_paiement: "en_attente",

        // Expéditeur
        expediteur_nom_prenom: "",
        expediteur_telephone: "",
        expediteur_email: "",
        expediteur_adresse: "",
        expediteur_ville: "Abidjan",
        expediteur_pays: "Côte d'Ivoire",

        // Destinataire
        destinataire_nom_prenom: "",
        destinataire_telephone: "",
        destinataire_email: "",
        destinataire_adresse: "",
        destinataire_ville: "",
        destinataire_pays: "",
        destinataire_code_postal: "",

        colis: [
            {
                designation: "",
                category_id: "",
                poids: "",
                longueur: "",
                largeur: "",
                hauteur: "",
                prix_emballage: 0,
                articles: []
            }
        ]
    });

    useEffect(() => {
        loadProducts();
        loadCategories();
        fetchTarifGroupageAgence();
        fetchAgencyData();
    }, []);

    // Gestion des pays par défaut selon le type
    useEffect(() => {
        const type = formData.type_expedition;
        if (type === "GROUPAGE_DHD_AERIEN" || type === "GROUPAGE_DHD_MARITIME" || type === "SIMPLE") {
            setFormData(prev => ({
                ...prev,
                pays_destination: "France",
                destinataire_pays: "France",
                destinataire_ville: "",
                expediteur_ville: "Abidjan"
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                pays_destination: "",
                destinataire_pays: "",
                destinataire_ville: "",
                expediteur_ville: "Abidjan"
            }));
        }
        cleanSimulation();
    }, [formData.type_expedition]);

    // Effet pour la navigation retardée améliorée
    /* useEffect(() => {
        if (status === 'succeeded') {
            const timer = setTimeout(() => {
                resetStatus();
                cleanSimulation();
                navigate("/dashboard");
            }, 10000); // On laisse 10s pour voir la modale ou on l'enlève carrément
            return () => clearTimeout(timer);
        }
    }, [status]); */
    // On commente l'auto redirect pour laisser l'utilisateur choisir dans la modale de succès
    useEffect(() => {
        console.log("Expedition Status:", status);
        console.log("Current Expedition Data:", currentExpedition);
    }, [status, currentExpedition]);

    // Liste des trajets configurés par l'agence pour le type sélectionné
    const availableRoutes = useMemo(() => {
        if (!existingGroupageTarifs || !Array.isArray(existingGroupageTarifs)) return [];
        const currentType = formData.type_expedition.toLowerCase();
        return existingGroupageTarifs.filter(t => t.type_expedition === currentType);
    }, [existingGroupageTarifs, formData.type_expedition]);

    // Sélection automatique des infos depuis un trajet configuré
    const handleRouteSelect = (e) => {
        const routeId = e.target.value;
        if (!routeId) return;

        const route = availableRoutes.find(r => String(r.id) === String(routeId));
        if (route) {
            const isDHD = formData.type_expedition.toUpperCase().includes('DHD');

            let depVille = "Abidjan";
            let destVille = "";

            // On extrait les villes depuis la ligne (format "VilleA-VilleB")
            if (route.ligne && route.ligne.includes('-')) {
                const parts = route.ligne.split('-');
                depVille = parts[0]?.trim() || "Abidjan";
                destVille = parts[1]?.trim() || "";
            } else {
                // Fallback si pas de tiret : on utilise le pays ou on laisse vide
                destVille = isDHD ? "" : (route.pays || "");
            }

            setFormData(prev => ({
                ...prev,
                pays_destination: isDHD || formData.type_expedition === 'SIMPLE' ? "France" : (route.pays || ""),
                destinataire_pays: isDHD || formData.type_expedition === 'SIMPLE' ? "France" : (route.pays || ""),
                destinataire_ville: destVille,
                expediteur_ville: depVille,
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === "pays_destination") {
                newData.destinataire_pays = value;
            }
            return newData;
        });
    };

    const handleColisChange = (index, field, value) => {
        const newColis = [...formData.colis];

        if (field === 'articles') {
            // On stocke la chaîne brute pour l'input, mais on préparera l'array pour l'API
            newColis[index] = { ...newColis[index], articles_raw: value };
        } else {
            newColis[index] = { ...newColis[index], [field]: value };
        }

        setFormData(prev => ({ ...prev, colis: newColis }));
    };

    const addColis = () => {
        setFormData(prev => ({
            ...prev,
            colis: [...prev.colis, { designation: "", category_id: "", poids: "", longueur: "", largeur: "", hauteur: "", prix_emballage: 0, articles_raw: "" }]
        }));
    };

    const removeColis = (index) => {
        if (formData.colis.length > 1) {
            const newColis = formData.colis.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, colis: newColis }));
        }
    };

    const handleSimulate = async () => {
        console.log("Simulation Payload:", formData);
        if (!formData.pays_destination || !formData.destinataire_ville) {
            alert("Veuillez renseigner le pays et la ville de destination.");
            return;
        }

        const simulationPayload = {
            type_expedition: formData.type_expedition.toLowerCase(),
            pays_depart: formData.pays_depart,
            pays_destination: formData.pays_destination,
            is_paiement_credit: formData.is_paiement_credit,
            is_livraison_domicile: formData.is_livraison_domicile,
            expediteur_ville: formData.expediteur_ville,
            destinataire_ville: formData.destinataire_ville,
            statut_paiement: formData.statut_paiement,
            colis: formData.colis.map((c, index) => {
                const item = {
                    designation: c.designation,
                    poids: parseFloat(c.poids) || 0,
                    longueur: parseFloat(c.longueur) || 0,
                    largeur: parseFloat(c.largeur) || 0,
                    hauteur: parseFloat(c.hauteur) || 0,
                    prix_emballage: parseFloat(c.prix_emballage) || 0,
                    articles: c.articles_raw
                        ? c.articles_raw.split(/[,\n]/).map(a => a.trim()).filter(a => a !== "")
                        : []
                };
                if (c.category_id) item.category_id = c.category_id;

                // Optionnel: code_colis pour la simulation si nécessaire
                const typeCode = formData.type_expedition.replace('GROUPAGE_', '');
                item.code_colis = `SIM-${typeCode}-${index + 1}`;

                return item;
            })
        };
        console.log("simulation Payload:", simulationPayload);
        simulateExpedition(simulationPayload);
    };

    const handleSubmit = async () => {
        const payload = {
            ...formData,
            type_expedition: formData.type_expedition.toLowerCase(),
            colis: formData.colis.map((c, index) => {
                const item = {
                    designation: c.designation,
                    poids: parseFloat(c.poids) || 0,
                    longueur: parseFloat(c.longueur) || 0,
                    largeur: parseFloat(c.largeur) || 0,
                    hauteur: parseFloat(c.hauteur) || 0,
                    prix_emballage: parseFloat(c.prix_emballage) || 0,
                    articles: c.articles_raw
                        ? c.articles_raw.split(/[,\n]/).map(a => a.trim()).filter(a => a !== "")
                        : []
                };

                if (c.category_id) item.category_id = c.category_id;

                // Génération du code_colis comme dans l'exemple
                const typeCode = formData.type_expedition.replace('GROUPAGE_', '');
                item.code_colis = `COL-${typeCode}-${Date.now().toString().slice(-4)}-${index + 1}`;

                return item;
            })
        };

        console.log("creation Payload (Clean):", payload);
        createExpedition(payload);
    };

    const totalWeight = formData.colis.reduce((sum, c) => sum + (parseFloat(c.poids) || 0), 0);
    const totalEmballage = formData.colis.reduce((sum, c) => sum + (parseFloat(c.prix_emballage) || 0), 0);

    // Extraction sécurisée des infos de tarification
    const simulationTarif = useMemo(() => {
        if (!simulationResult) return null;
        return simulationResult.tarif || simulationResult.data?.tarif || null;
    }, [simulationResult]);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header Moderne */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Nouvelle expédition</h1>
                            <p className="text-xs text-slate-500 font-medium">Enregistrement et tarification des envois clients</p>
                        </div>
                        <div className="flex items-center bg-white p-1 rounded-lg border border-slate-300 shadow-sm">
                            <div className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${step === 1 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}>
                                1. Configuration & Colis
                            </div>
                            <div className="w-8 flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                            <div className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${step === 2 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}>
                                2. Finalisation
                            </div>
                        </div>
                    </div>

                    {message && <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded">✅ {message}</div>}
                    {error && <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded">⚠️ {error}</div>}

                    <div className={simulationResult && step === 1 ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "space-y-6"}>
                        <div className={simulationResult && step === 1 ? "lg:col-span-2 space-y-6" : "space-y-6"}>
                            {step === 1 ? (
                                <>
                                    {/* SECTION 1: CONFIGURATION */}
                                    <section className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
                                        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Paramètres du service</h2>
                                                <p className="text-[10px] text-slate-400 font-medium">Type d'envoi et destination du transport</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Nature de l'expédition */}
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nature de l'expédition</label>
                                                    <select
                                                        value={formData.type_expedition}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, type_expedition: e.target.value }))}
                                                        className="w-full border-slate-300 rounded-lg text-sm font-bold focus:ring-slate-500 bg-white py-2.5 shadow-sm h-11"
                                                    >
                                                        {['SIMPLE', 'GROUPAGE_DHD_AERIEN', 'GROUPAGE_DHD_MARITIME', 'GROUPAGE_AFRIQUE', 'GROUPAGE_CA'].map(t => (
                                                            <option key={t} value={t}>
                                                                {t === 'SIMPLE' ? 'LD' : t.replace('GROUPAGE_', '').replace('_', ' ')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Sélection du Trajet (Route) basé sur les tarifs agence */}
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                        Trajets disponibles
                                                    </label>
                                                    <select
                                                        onChange={handleRouteSelect}
                                                        disabled={formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE'}
                                                        className={`w-full border-slate-300 rounded-lg text-sm font-bold focus:ring-slate-500 py-2.5 shadow-sm h-11 ${formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE' ? 'bg-slate-100 text-slate-400' : 'bg-white'}`}
                                                    >
                                                        <option value="">Sélectionner un trajet</option>
                                                        {availableRoutes.map(r => (
                                                            <option key={r.id} value={r.id}>
                                                                {(formData.type_expedition === 'GROUPAGE_DHD_AERIEN' || formData.type_expedition === 'GROUPAGE_DHD_MARITIME')
                                                                    ? r.ligne
                                                                    : formData.type_expedition === 'GROUPAGE_AFRIQUE'
                                                                        ? r.pays
                                                                        : `${r.ligne} (${r.pays}) - ${r.mode}`
                                                                }
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* {availableRoutes.length === 0 && formData.type_expedition !== 'GROUPAGE_CA' && (
                                                <p className="text-[10px] text-orange-600 font-bold flex items-center gap-2 bg-orange-50 p-2 rounded border border-orange-100 mt-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    Aucun trajet configuré pour ce service.
                                                </p>
                                            )} */}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pays de Destination</label>
                                                    <input
                                                        type="text"
                                                        name="pays_destination"
                                                        value={formData.pays_destination}
                                                        onChange={handleInputChange}
                                                        placeholder={formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE' ? "Ex: France, Canada..." : "Sélectionner un trajet ci-dessus"}
                                                        disabled={formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'SIMPLE'}
                                                        className={`w-full border-slate-300 rounded-md text-sm font-bold h-10 focus:ring-slate-500 ${formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'SIMPLE' ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ville de Destination</label>
                                                    <input
                                                        type="text"
                                                        name="destinataire_ville"
                                                        value={formData.destinataire_ville}
                                                        onChange={handleInputChange}
                                                        placeholder="Ex: Paris, Lyon..."
                                                        disabled={formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'GROUPAGE_AFRIQUE' && formData.type_expedition !== 'SIMPLE'}
                                                        className={`w-full border-slate-300 rounded-md text-sm font-bold h-10 focus:ring-slate-500 ${formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'GROUPAGE_AFRIQUE' && formData.type_expedition !== 'SIMPLE' ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pays de Départ</label>
                                                    <input type="text" value={formData.pays_depart} disabled className="w-full bg-slate-100 border-slate-300 rounded-md text-sm font-bold h-10 text-slate-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ville de Départ</label>
                                                    <input
                                                        type="text"
                                                        name="expediteur_ville"
                                                        value={formData.expediteur_ville}
                                                        onChange={handleInputChange}
                                                        disabled={formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'SIMPLE'}
                                                        className={`w-full border-slate-300 rounded-md text-sm font-bold h-10 focus:ring-slate-500 ${formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'SIMPLE' ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-200">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" name="is_livraison_domicile" checked={formData.is_livraison_domicile} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-400 text-slate-800 focus:ring-slate-500/20 cursor-pointer" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight group-hover:text-slate-800 transition-colors">Livraison à domicile</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" name="is_paiement_credit" checked={formData.is_paiement_credit} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-400 text-slate-800 focus:ring-slate-500/20 cursor-pointer" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight group-hover:text-slate-800 transition-colors">Paiement à crédit</span>
                                                </label>
                                            </div>


                                        </div>
                                    </section>

                                    {/* SECTION 2: COLIS */}
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <div>
                                                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Inventaire des colis</h2>
                                                <p className="text-[10px] text-slate-400 font-medium">{formData.colis.length} colis enregistré(s)</p>
                                            </div>
                                            <button
                                                onClick={addColis}
                                                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[10px] font-bold text-slate-700 shadow-sm hover:shadow hover:border-slate-400 transition-all flex items-center gap-2"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                Ajouter un colis
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {formData.colis.map((c, index) => (
                                                <div key={index} className="group bg-white rounded-lg border border-slate-300 shadow-sm hover:border-slate-400 transition-all p-4 relative overflow-hidden">
                                                    {/* Badge Numéro */}
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                    <div className="flex flex-col md:flex-row gap-6">
                                                        {/* ID & Désignation */}
                                                        <div className="flex-none flex items-start gap-4">
                                                            <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-200">
                                                                {index + 1}
                                                            </span>
                                                        </div>

                                                        <div className="flex-1 space-y-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                                <div className={formData.type_expedition.includes('DHD') ? "md:col-span-2" : "md:col-span-3"}>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Désignation</label>
                                                                    <input
                                                                        type="text"
                                                                        value={c.designation}
                                                                        onChange={(e) => handleColisChange(index, 'designation', e.target.value)}
                                                                        placeholder="Ex: Effets personnels..."
                                                                        className="w-full border-slate-300 rounded-md text-sm font-bold h-9 focus:ring-slate-500"
                                                                    />
                                                                </div>

                                                                {formData.type_expedition.includes('DHD') && (
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Catégorie</label>
                                                                        <select
                                                                            value={c.category_id}
                                                                            onChange={(e) => handleColisChange(index, 'category_id', e.target.value)}
                                                                            className="w-full border-slate-300 rounded-md text-sm font-bold h-9 focus:ring-slate-500 bg-white"
                                                                        >
                                                                            <option value="">-- Choisir --</option>
                                                                            {Array.isArray(categories) && categories.map(cat => (
                                                                                <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Poids (kg)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={c.poids}
                                                                        onChange={(e) => handleColisChange(index, 'poids', e.target.value)}
                                                                        className="w-full border-slate-300 rounded-md text-sm font-black text-slate-800 bg-slate-50 h-9 focus:ring-slate-500"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Articles détaillés</label>
                                                                    <textarea
                                                                        value={c.articles_raw || ""}
                                                                        onChange={(e) => handleColisChange(index, 'articles', e.target.value)}
                                                                        placeholder="Liste des objets..."
                                                                        rows="1"
                                                                        className="w-full border-slate-300 rounded-md text-xs font-medium resize-none bg-slate-50 p-2 h-9 focus:h-16 focus:ring-slate-500"
                                                                    ></textarea>
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-2">
                                                                    <div className="col-span-3 grid grid-cols-3 gap-1.5">
                                                                        <div className="space-y-1">
                                                                            <label className="block text-[9px] font-bold text-slate-500 uppercase text-center">L</label>
                                                                            <input type="number" placeholder="cm" value={c.longueur} onChange={(e) => handleColisChange(index, 'longueur', e.target.value)} className="w-full border-slate-300 rounded-md text-[10px] p-2 bg-slate-50 text-center" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="block text-[9px] font-bold text-slate-500 uppercase text-center">l</label>
                                                                            <input type="number" placeholder="cm" value={c.largeur} onChange={(e) => handleColisChange(index, 'largeur', e.target.value)} className="w-full border-slate-300 rounded-md text-[10px] p-2 bg-slate-50 text-center" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="block text-[9px] font-bold text-slate-500 uppercase text-center">H</label>
                                                                            <input type="number" placeholder="cm" value={c.hauteur} onChange={(e) => handleColisChange(index, 'hauteur', e.target.value)} className="w-full border-slate-300 rounded-md text-[10px] p-2 bg-slate-50 text-center" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="block text-[9px] font-bold text-slate-500 uppercase text-center">Emb.</label>
                                                                        <input type="number" value={c.prix_emballage} onChange={(e) => handleColisChange(index, 'prix_emballage', e.target.value)} className="w-full border-slate-300 rounded-md text-[10px] p-2 bg-slate-50 text-center font-bold text-slate-700" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {formData.colis.length > 1 && (
                                                            <div className="flex items-start">
                                                                <button
                                                                    onClick={() => removeColis(index)}
                                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                    title="Supprimer ce colis"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4s" /></svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Bouton de simulation déplacé ici */}
                                    <div className="flex justify-end pt-4 border-t border-slate-200">
                                        <button
                                            onClick={handleSimulate}
                                            disabled={simulating}
                                            className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {simulating ? (
                                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            )}
                                            {simulating ? 'Calcul...' : 'Calculer Tarif'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                                    {/* EXPEDITEUR */}
                                    <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
                                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                                                Expéditeur
                                            </h2>
                                        </div>
                                        <div className="p-8 space-y-6 flex-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest ">
                                            <div className="space-y-2">
                                                <label>Nom Complet *</label>
                                                <input type="text" name="expediteur_nom_prenom" value={formData.expediteur_nom_prenom} onChange={handleInputChange} className="w-full border-slate-300 rounded-md text-sm font-bold h-11 focus:ring-slate-800" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label>Téléphone *</label>
                                                    <input type="tel" name="expediteur_telephone" value={formData.expediteur_telephone} onChange={handleInputChange} className="w-full border-slate-300 rounded-md text-sm font-bold h-11 focus:ring-slate-800" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label>Email</label>
                                                    <input type="email" name="expediteur_email" value={formData.expediteur_email} onChange={handleInputChange} className="w-full border-slate-300 rounded-md text-sm font-bold h-11 focus:ring-slate-800" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label>Adresse physique</label>
                                                <input type="text" name="expediteur_adresse" value={formData.expediteur_adresse} onChange={handleInputChange} className="w-full border-slate-300 rounded-md text-sm font-bold h-11 focus:ring-slate-800" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* DESTINATAIRE */}
                                    <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
                                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                                                Destinataire
                                            </h2>
                                        </div>
                                        <div className="p-8 space-y-6 flex-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                            <div className="space-y-2">
                                                <label>Nom du destinataire *</label>
                                                <input type="text" name="destinataire_nom_prenom" value={formData.destinataire_nom_prenom} onChange={handleInputChange} className="w-full border-slate-300 rounded-md text-sm font-bold h-11 focus:ring-slate-800" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label>Téléphone *</label>
                                                    <input type="tel" name="destinataire_telephone" value={formData.destinataire_telephone} onChange={handleInputChange} className="w-full border-slate-300 rounded-md text-sm font-bold h-11 focus:ring-slate-800" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label>Email</label>
                                                    <input type="email" name="destinataire_email" value={formData.destinataire_email} onChange={handleInputChange} className="w-full border-slate-300 rounded-md text-sm font-bold h-11 focus:ring-slate-800" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label>Adresse complète de livraison</label>
                                                <textarea name="destinataire_adresse" value={formData.destinataire_adresse} onChange={handleInputChange} className="w-full border-slate-300 rounded-md text-sm font-bold p-4 h-24 focus:ring-slate-800" placeholder="Rue, Quartier, Repères..." />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar Simulation - Affichée uniquement si on a un résultat et qu'on est à l'étape 1 */}
                        {simulationResult && step === 1 && (
                            <div className="space-y-6">
                                <div className="sticky top-24">
                                    <div className="bg-white rounded-lg border border-slate-300 shadow-md overflow-hidden flex flex-col h-fit">
                                        <div className="p-8 border-b border-slate-200 bg-slate-50">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Récapitulatif</h3>
                                                <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[11px] font-bold">
                                                    <span className="text-slate-400 uppercase tracking-widest leading-relaxed">Service</span>
                                                    <span className="text-slate-700">{formData.type_expedition.replace('GROUPAGE_', '').replace('_', ' ')}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-bold">
                                                    <span className="text-slate-400 uppercase tracking-widest leading-relaxed">Destination</span>
                                                    <span className="text-slate-700 break-words text-right max-w-[150px]">{formData.destinataire_ville || "-"}, {formData.pays_destination || "-"}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-bold">
                                                    <span className="text-slate-400 uppercase tracking-widest leading-relaxed">Volume</span>
                                                    <span className="text-slate-700">{formData.colis.length} Colis • {totalWeight} KG</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 space-y-6">
                                            <div className="space-y-6">
                                                <div className="bg-slate-800 rounded-lg p-6 text-white shadow-inner relative overflow-hidden">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total à Payer</p>
                                                    <div className="flex items-baseline gap-2 relative z-10">
                                                        <span className="text-3xl font-mono font-bold tracking-tighter">
                                                            {(parseFloat(simulationTarif?.montant_expedition || simulationResult.total_price || simulationResult.amount || 0) + totalEmballage).toLocaleString()}
                                                        </span>
                                                        <span className="text-xs font-sans text-slate-400 font-bold">CFA</span>
                                                    </div>
                                                </div>

                                                {/* Breakdown si disponible */}
                                                {simulationTarif && (
                                                    <div className="space-y-2 px-1">
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span className="text-slate-400 uppercase tracking-widest">Base Transport</span>
                                                            <span className="text-slate-600">{(parseFloat(simulationTarif.montant_base || 0)).toLocaleString()} CFA</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span className="text-slate-400 uppercase tracking-widest">Frais de Service</span>
                                                            <span className="text-slate-600">{(parseFloat(simulationTarif.montant_prestation || 0)).toLocaleString()} CFA</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span className="text-slate-400 uppercase tracking-widest">Frais Emballage</span>
                                                            <span className="text-slate-600">{(totalEmballage).toLocaleString()} CFA</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    <button
                                                        onClick={() => setStep(2)}
                                                        className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold uppercase tracking-widest text-[11px] shadow-sm transition-all transform active:scale-95"
                                                    >
                                                        Continuer vers finalisation
                                                    </button>

                                                    <button
                                                        onClick={() => { cleanSimulation(); }}
                                                        className="w-full py-3 text-slate-400 text-[10px] font-bold uppercase hover:text-slate-600 transition-colors tracking-widest flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        Masquer le tarif
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium">Vos données sont sécurisées et conformes aux protocoles de transport.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recapitulatif pour l'étape 2 (toujours sur le côté) */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="sticky top-24">
                                    <div className="bg-white rounded-lg border border-slate-300 shadow-md overflow-hidden flex flex-col h-fit">
                                        <div className="p-8 border-b border-slate-200 bg-slate-50">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Récapitulatif Final</h3>
                                                <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                </div>
                                            </div>

                                            <div className="bg-slate-800 rounded-lg p-6 text-white shadow-inner mb-6">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Montant à régler</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-mono font-bold">
                                                        {(parseFloat(simulationTarif?.montant_expedition || 0) + totalEmballage).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-sans text-slate-400 font-bold">CFA</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleSubmit}
                                                disabled={status === 'loading'}
                                                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold uppercase tracking-widest text-[11px] shadow-sm transition-all transform active:scale-95 disabled:opacity-50 mb-3"
                                            >
                                                {status === 'loading' ? 'Traitement...' : 'Confirmer et expédier'}
                                            </button>

                                            <button
                                                onClick={() => setStep(1)}
                                                className="w-full py-3 text-slate-400 text-[10px] font-bold uppercase hover:text-slate-600 transition-colors tracking-widest flex items-center justify-center gap-2"
                                            >
                                                Précédent
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print Modal on Success */}
            {status === 'succeeded' && currentExpedition && (
                <PrintSuccessModal
                    expedition={currentExpedition}
                    agency={{
                        ...(agencyData?.agence || agencyData),
                        logo: getLogoUrl(agencyData?.agence?.logo || agencyData?.logo)
                    }}
                    onClose={() => {
                        resetStatus();
                        cleanSimulation();
                        navigate("/dashboard");
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default CreateExpedition;
