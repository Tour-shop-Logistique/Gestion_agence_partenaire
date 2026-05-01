import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useExpedition } from "../hooks/useExpedition";
import { useTarifs } from "../hooks/useTarifs";
import { useAgency } from "../hooks/useAgency";
import PrintSuccessModal from "../components/Receipts/PrintSuccessModal";
import { getLogoUrl } from "../utils/apiConfig";
import { toast } from "../utils/toast";

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
        productStatus,
        productError,
        error,
        message,
        resetStatus,
        cleanSimulation,
        clearCurrentExpedition,
        currentExpedition,
        recordTransaction
    } = useExpedition();

    const { existingGroupageTarifs, fetchTarifGroupageAgence } = useTarifs();
    const { data: agencyData, fetchAgencyData } = useAgency();

    // État pour la navigation interne (1: Config & Colis, 2: Contacts & Finalize)
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paymentReference, setPaymentReference] = useState("");

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
        resetStatus();
        clearCurrentExpedition();
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
    useEffect(() => {
        if (message) {
            toast.success(message);
            resetStatus();
        }
    }, [message, resetStatus]);

    useEffect(() => {
        if (productError) {
            toast.error("Erreur produits: " + productError);
        }
    }, [productError]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            resetStatus();
        }
    }, [error, resetStatus]);

    useEffect(() => {
        console.log("Expedition Status:", status);
        console.log("Current Expedition Data:", currentExpedition);
    }, [status, currentExpedition]);

    // Raccourcis clavier pour saisie rapide
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ctrl + S pour simuler (étape 1)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (step === 1 && !simulating) {
                    handleSimulate();
                    // toast.info('Raccourci: Ctrl+S pour simuler');
                }
            }
            // Ctrl + Enter pour valider (étape 2)
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                if (step === 2 && status !== 'loading') {
                    handleSubmit();
                    // toast.info('Raccourci: Ctrl+Enter pour valider');
                }
            }
            // Ctrl + → pour passer à l'étape suivante
            if (e.ctrlKey && e.key === 'ArrowRight') {
                e.preventDefault();
                if (step === 1 && simulationResult) {
                    setStep(2);
                    // toast.info('Raccourci: Ctrl+→ pour étape suivante');
                }
            }
            // Ctrl + ← pour revenir à l'étape précédente
            if (e.ctrlKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                if (step === 2) {
                    setStep(1);
                    // toast.info('Raccourci: Ctrl+← pour étape précédente');
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [step, simulationResult, simulating, status]);

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
        newColis[index] = { ...newColis[index], [field]: value };
        setFormData(prev => ({ ...prev, colis: newColis }));
    };

    const handleAddArticle = (colisIndex, productDesignation) => {
        if (!productDesignation) return;
        const newColis = [...formData.colis];
        const currentArticles = newColis[colisIndex].articles || [];

        if (!currentArticles.includes(productDesignation)) {
            newColis[colisIndex] = {
                ...newColis[colisIndex],
                articles: [...currentArticles, productDesignation]
            };
            setFormData(prev => ({ ...prev, colis: newColis }));
        }
    };

    const handleRemoveArticle = (colisIndex, articleIndex) => {
        const newColis = [...formData.colis];
        newColis[colisIndex] = {
            ...newColis[colisIndex],
            articles: newColis[colisIndex].articles.filter((_, i) => i !== articleIndex)
        };
        setFormData(prev => ({ ...prev, colis: newColis }));
    };

    const addColis = () => {
        setFormData(prev => ({
            ...prev,
            colis: [...prev.colis, { designation: "", category_id: "", poids: "", longueur: "", largeur: "", hauteur: "", prix_emballage: 0, articles: [] }]
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
            toast.info("Veuillez renseigner le pays et la ville de destination.");
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
                    articles: c.articles || []
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
                    articles: c.articles || []
                };

                if (c.category_id) item.category_id = c.category_id;

                // Génération du code_colis comme dans l'exemple
                const typeCode = formData.type_expedition.replace('GROUPAGE_', '');
                item.code_colis = `COL-${typeCode}-${Date.now().toString().slice(-4)}-${index + 1}`;

                return item;
            })
        };

        console.log("creation Payload (Clean):", payload);
        const result = await createExpedition(payload);

        console.log("Result from createExpedition:", result);

        // Vérifier si la création a réussi et enregistrer la transaction si ce n'est pas un crédit
        if (result?.payload && !formData.is_paiement_credit) {
            // result.payload peut contenir l'expédition directement ou dans expedition/data
            const expeditionData = result.payload?.expedition || result.payload?.data || result.payload;
            
            console.log("Expedition data extracted:", expeditionData);
            
            // Vérifier que nous avons bien un ID
            if (!expeditionData?.id) {
                console.error("Pas d'ID d'expédition trouvé dans:", expeditionData);
                toast.error("Expédition créée mais impossible d'enregistrer le paiement (ID manquant)");
                return;
            }
            
            // Calculer le montant total à encaisser
            const montantExpedition = parseFloat(simulationTarif?.montant_expedition || simulationResult?.total_price || simulationResult?.amount || 0);
            const montantTotal = montantExpedition + totalEmballage;
            
            console.log("Enregistrement transaction:", {
                expedition_id: expeditionData.id,
                amount: montantTotal,
                payment_method: paymentMethod
            });

            // Enregistrer la transaction
            try {
                const transactionData = {
                    expedition_id: expeditionData.id,
                    amount: montantTotal,
                    payment_method: paymentMethod,
                    payment_object: "montant_expedition",
                    type: "encaissement",
                    description: `Paiement expédition ${expeditionData.reference || ''}`,
                };

                // Ajouter la référence uniquement si c'est mobile money
                if (paymentMethod === 'mobile_money' && paymentReference) {
                    transactionData.reference = paymentReference;
                }

                console.log("Transaction data to send:", transactionData);
                await recordTransaction(transactionData);
                console.log("Transaction enregistrée avec succès");
                // Note: Le toast de succès est géré par le useEffect qui écoute 'message'
            } catch (error) {
                console.error("Erreur lors de l'enregistrement de la transaction:", error);
                toast.error("Expédition créée mais erreur lors de l'enregistrement du paiement");
            }
        } else if (formData.is_paiement_credit) {
            console.log("Paiement à crédit - Aucune transaction enregistrée");
        }
    };

    const totalWeight = formData.colis.reduce((sum, c) => sum + (parseFloat(c.poids) || 0), 0);
    const totalEmballage = formData.colis.reduce((sum, c) => sum + (parseFloat(c.prix_emballage) || 0), 0);

    // Extraction sécurisée des infos de tarification
    const simulationTarif = useMemo(() => {
        if (!simulationResult) return null;
        return simulationResult.tarif || simulationResult.data?.tarif || null;
    }, [simulationResult]);

    // Helper pour les bordures visuelles des champs
    const getInputBorderClass = (value, isRequired = false, isDisabled = false) => {
        if (isDisabled) {
            return 'border-slate-200 bg-slate-50';
        }
        if (isRequired && !value) {
            return 'border-2 border-amber-400 bg-amber-50/30 focus:border-amber-500 focus:ring-amber-500/20';
        }
        if (value) {
            return 'border-2 border-emerald-400 bg-emerald-50/30 focus:border-emerald-500 focus:ring-emerald-500/20';
        }
        return 'border-2 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20';
    };

    return (
        <>
            <div className="min-h-screen bg-slate-100">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nouvelle expédition</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Enregistrement et tarification des envois clients
                            </p>
                        </div>
                        {/* Step indicator */}
                        <div className="flex items-center gap-0 bg-white border border-slate-200 rounded-xl p-1 shadow-sm self-start md:self-auto">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${step === 1 ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${step === 1 ? 'border-white/30 bg-white/10' : 'border-slate-300 text-slate-400'}`}>1</span>
                                Config & Colis
                            </div>
                            <svg className="w-4 h-4 text-slate-300 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${step === 2 ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${step === 2 ? 'border-white/30 bg-white/10' : 'border-slate-300 text-slate-400'}`}>2</span>
                                Contacts & Finalisation
                            </div>
                        </div>
                    </div>


                    <div className={simulationResult && step === 1 ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "space-y-6"}>
                        <div className={simulationResult && step === 1 ? "lg:col-span-2 space-y-6" : "space-y-6"}>
                            {step === 1 ? (
                                <>
                                    {/* SECTION 1: CONFIGURATION */}
                                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-800">Paramètres du service</h2>
                                                <p className="text-xs text-slate-400">Type d'envoi et destination</p>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Nature de l'expédition */}
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-600">Type d'expédition</label>
                                                    <select
                                                        value={formData.type_expedition}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, type_expedition: e.target.value }))}
                                                        className="w-full border-slate-300 rounded-lg text-sm font-semibold focus:ring-slate-500 bg-white h-10"
                                                    >
                                                        {['SIMPLE', 'GROUPAGE_DHD_AERIEN', 'GROUPAGE_DHD_MARITIME', 'GROUPAGE_AFRIQUE', 'GROUPAGE_CA'].map(t => (
                                                            <option key={t} value={t}>
                                                                {t === 'SIMPLE' ? 'LD' : t.replace('GROUPAGE_', '').replace('_', ' ')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Sélection du Trajet (Route) basé sur les tarifs agence */}
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-600">
                                                        Trajet disponible
                                                    </label>
                                                    <select
                                                        onChange={handleRouteSelect}
                                                        disabled={formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE'}
                                                        className={`w-full border-slate-300 rounded-lg text-sm font-semibold focus:ring-slate-500 h-10 ${formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE' ? 'bg-slate-100 text-slate-400' : 'bg-white'}`}
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
                                                <p className="text-xs text-orange-600 font-bold flex items-center gap-2 bg-orange-50 p-2 rounded border border-orange-100 mt-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    Aucun trajet configuré pour ce service.
                                                </p>
                                            )} */}

                                            {/* Destination + Départ dans un bloc groupé */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-500">
                                                        Pays destination {formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE' ? <span className="text-amber-600">*</span> : ''}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="pays_destination"
                                                        value={formData.pays_destination}
                                                        onChange={handleInputChange}
                                                        placeholder={formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE' ? "Ex: France..." : "Via trajet"}
                                                        disabled={formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'SIMPLE'}
                                                        className={`w-full rounded-md text-sm font-semibold h-9 ${getInputBorderClass(
                                                            formData.pays_destination, 
                                                            formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE',
                                                            formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'SIMPLE'
                                                        )}`}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-500">
                                                        Ville destination <span className="text-amber-600">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="destinataire_ville"
                                                        value={formData.destinataire_ville}
                                                        onChange={handleInputChange}
                                                        placeholder="Ex: Paris..."
                                                        disabled={formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'GROUPAGE_AFRIQUE' && formData.type_expedition !== 'SIMPLE'}
                                                        className={`w-full rounded-md text-sm font-semibold h-9 ${getInputBorderClass(
                                                            formData.destinataire_ville,
                                                            true,
                                                            formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'GROUPAGE_AFRIQUE' && formData.type_expedition !== 'SIMPLE'
                                                        )}`}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-500">Pays départ</label>
                                                    <input type="text" value={formData.pays_depart} disabled className="w-full bg-slate-50 border-2 border-slate-200 rounded-md text-sm font-semibold h-9 text-slate-400" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-500">
                                                        Ville départ {formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE' ? <span className="text-amber-600">*</span> : ''}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="expediteur_ville"
                                                        value={formData.expediteur_ville}
                                                        onChange={handleInputChange}
                                                        disabled={formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'SIMPLE'}
                                                        className={`w-full rounded-md text-sm font-semibold h-9 ${getInputBorderClass(
                                                            formData.expediteur_ville,
                                                            formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE',
                                                            formData.type_expedition !== 'GROUPAGE_CA' && formData.type_expedition !== 'SIMPLE'
                                                        )}`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Options - Mode de paiement et Livraison */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Mode de paiement - Tabs */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Mode de paiement</label>
                                                    <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, is_paiement_credit: false }))}
                                                            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                                                                !formData.is_paiement_credit
                                                                    ? 'bg-emerald-500 text-white shadow-sm'
                                                                    : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            💰 Comptant
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, is_paiement_credit: true }))}
                                                            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                                                                formData.is_paiement_credit
                                                                    ? 'bg-amber-500 text-white shadow-sm'
                                                                    : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            📋 Crédit
                                                        </button>
                                                    </div>
                                                    {formData.is_paiement_credit && (
                                                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Paiement ultérieur
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Mode de livraison - Tabs */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Mode de livraison</label>
                                                    <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, is_livraison_domicile: true }))}
                                                            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                                                                formData.is_livraison_domicile
                                                                    ? 'bg-indigo-500 text-white shadow-sm'
                                                                    : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            🏠 Domicile
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, is_livraison_domicile: false }))}
                                                            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                                                                !formData.is_livraison_domicile
                                                                    ? 'bg-slate-600 text-white shadow-sm'
                                                                    : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            🏢 Agence
                                                        </button>
                                                    </div>
                                                    {formData.is_livraison_domicile && (
                                                        <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1.5">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Livraison à l'adresse
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* SECTION 2: COLIS */}
                                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                                </div>
                                                <div>
                                                    <h2 className="text-sm font-bold text-slate-800">Inventaire des colis</h2>
                                                    <p className="text-xs text-slate-400">{formData.colis.length} colis enregistré(s) — poids total : {totalWeight} kg</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={addColis}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                Ajouter
                                            </button>
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            {formData.colis.map((c, index) => (
                                                <div key={index} className="p-5">
                                                    {/* En-tête du colis */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                                                                {index + 1}
                                                            </span>
                                                            <span className="text-xs font-semibold text-slate-500">Colis {index + 1}</span>
                                                        </div>
                                                        {formData.colis.length > 1 && (
                                                            <button
                                                                onClick={() => removeColis(index)}
                                                                className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                                                title="Supprimer ce colis"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4s" /></svg>
                                                                Supprimer
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Ligne 1: Désignation + Catégorie + Poids */}
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                                        <div className={formData.type_expedition.includes('DHD') ? "md:col-span-2" : "md:col-span-3"}>
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                                                Désignation <span className="text-amber-600">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={c.designation}
                                                                onChange={(e) => handleColisChange(index, 'designation', e.target.value)}
                                                                placeholder="Ex: Effets personnels, Électronique..."
                                                                className={`w-full rounded-md text-sm font-semibold h-9 ${getInputBorderClass(c.designation, true)}`}
                                                            />
                                                        </div>

                                                        {formData.type_expedition.includes('DHD') && (
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Catégorie</label>
                                                                <select
                                                                    value={c.category_id}
                                                                    onChange={(e) => handleColisChange(index, 'category_id', e.target.value)}
                                                                    className="w-full border-2 border-slate-300 rounded-md text-sm font-semibold h-9 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white"
                                                                >
                                                                    <option value="">-- Choisir --</option>
                                                                    {Array.isArray(categories) && categories.map(cat => (
                                                                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                                                Poids (kg) <span className="text-amber-600">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={c.poids}
                                                                onChange={(e) => handleColisChange(index, 'poids', e.target.value)}
                                                                placeholder="0"
                                                                className={`w-full rounded-md text-sm font-semibold h-9 ${getInputBorderClass(c.poids, true)}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Ligne 2: Articles + Dimensions */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Articles */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Articles contenus</label>
                                                            <select
                                                                onChange={(e) => {
                                                                    if (e.target.value) {
                                                                        handleAddArticle(index, e.target.value);
                                                                        e.target.value = "";
                                                                    }
                                                                }}
                                                                className="w-full border-slate-300 rounded-md text-xs font-semibold h-9 focus:ring-slate-500 bg-white mb-2"
                                                            >
                                                                <option value="">+ Ajouter un article</option>
                                                                {Array.isArray(products) && products.map(p => (
                                                                    <option key={p.id} value={p.designation}>{p.designation}</option>
                                                                ))}
                                                            </select>
                                                            <div className="flex flex-wrap gap-1.5 min-h-[34px] p-2 bg-slate-50 rounded-md border border-slate-200">
                                                                {(c.articles || []).length > 0 ? (
                                                                    c.articles.map((art, artIdx) => (
                                                                        <span key={artIdx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-slate-700 text-xs font-semibold rounded border border-slate-300">
                                                                            {art}
                                                                            <button onClick={() => handleRemoveArticle(index, artIdx)} className="text-slate-400 hover:text-red-500 transition-colors ml-0.5">
                                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                            </button>
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs text-slate-400 italic py-0.5">Aucun article ajouté</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Dimensions + Emballage */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Dimensions & Emballage</label>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                <div>
                                                                    <label className="block text-xs font-semibold text-slate-400 text-center mb-1">Long. cm</label>
                                                                    <input type="number" placeholder="0" value={c.longueur} onChange={(e) => handleColisChange(index, 'longueur', e.target.value)} className="w-full border-slate-300 rounded-md text-xs p-2 bg-slate-50 text-center h-9" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-semibold text-slate-400 text-center mb-1">Larg. cm</label>
                                                                    <input type="number" placeholder="0" value={c.largeur} onChange={(e) => handleColisChange(index, 'largeur', e.target.value)} className="w-full border-slate-300 rounded-md text-xs p-2 bg-slate-50 text-center h-9" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-semibold text-slate-400 text-center mb-1">Haut. cm</label>
                                                                    <input type="number" placeholder="0" value={c.hauteur} onChange={(e) => handleColisChange(index, 'hauteur', e.target.value)} className="w-full border-slate-300 rounded-md text-xs p-2 bg-slate-50 text-center h-9" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-semibold text-slate-400 text-center mb-1">Emb. CFA</label>
                                                                    <input type="number" value={c.prix_emballage} onChange={(e) => handleColisChange(index, 'prix_emballage', e.target.value)} className="w-full border-slate-300 rounded-md text-xs p-2 bg-slate-50 text-center font-semibold text-slate-700 h-9" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Bouton de simulation déplacé ici */}
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleSimulate}
                                            disabled={simulating}
                                            className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-semibold text-sm hover:bg-slate-900 transition-all shadow-sm flex items-center justify-center gap-2.5 disabled:opacity-50"
                                        >
                                            {simulating ? (
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            )}
                                            {simulating ? 'Calcul en cours...' : 'Calculer le tarif'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                    {/* EXPEDITEUR */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-800">Expéditeur</h2>
                                                <p className="text-xs text-slate-400">Informations de l'envoyeur</p>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4 flex-1">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-500">Nom complet *</label>
                                                <input 
                                                    type="text" 
                                                    name="expediteur_nom_prenom" 
                                                    value={formData.expediteur_nom_prenom} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Ex: Jean Dupont"
                                                    autoFocus={step === 2}
                                                    className={`w-full rounded-md text-sm font-semibold h-10 ${getInputBorderClass(formData.expediteur_nom_prenom, true)}`}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-500">Téléphone *</label>
                                                    <input 
                                                        type="tel" 
                                                        name="expediteur_telephone" 
                                                        value={formData.expediteur_telephone} 
                                                        onChange={handleInputChange} 
                                                        placeholder="Ex: 0779061621"
                                                        className={`w-full rounded-md text-sm font-semibold h-10 ${getInputBorderClass(formData.expediteur_telephone, true)}`}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-500">Email</label>
                                                    <input 
                                                        type="email" 
                                                        name="expediteur_email" 
                                                        value={formData.expediteur_email} 
                                                        onChange={handleInputChange} 
                                                        placeholder="Ex: jean@email.com"
                                                        className={`w-full rounded-md text-sm font-semibold h-10 ${getInputBorderClass(formData.expediteur_email, false)}`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-500">Adresse physique</label>
                                                <input 
                                                    type="text" 
                                                    name="expediteur_adresse" 
                                                    value={formData.expediteur_adresse} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Ex: Cocody, Angré 7ème tranche"
                                                    className={`w-full rounded-md text-sm font-semibold h-10 ${getInputBorderClass(formData.expediteur_adresse, false)}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* DESTINATAIRE */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-800">Destinataire</h2>
                                                <p className="text-xs text-slate-400">Informations du receveur</p>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4 flex-1">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-500">Nom complet *</label>
                                                <input 
                                                    type="text" 
                                                    name="destinataire_nom_prenom" 
                                                    value={formData.destinataire_nom_prenom} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Ex: Marie Kouassi"
                                                    className={`w-full rounded-md text-sm font-semibold h-10 ${getInputBorderClass(formData.destinataire_nom_prenom, true)}`}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-500">Téléphone *</label>
                                                    <input 
                                                        type="tel" 
                                                        name="destinataire_telephone" 
                                                        value={formData.destinataire_telephone} 
                                                        onChange={handleInputChange} 
                                                        placeholder="Ex: +33612345678"
                                                        className={`w-full rounded-md text-sm font-semibold h-10 ${getInputBorderClass(formData.destinataire_telephone, true)}`}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-500">Email</label>
                                                    <input 
                                                        type="email" 
                                                        name="destinataire_email" 
                                                        value={formData.destinataire_email} 
                                                        onChange={handleInputChange} 
                                                        placeholder="Ex: marie@email.com"
                                                        className={`w-full rounded-md text-sm font-semibold h-10 ${getInputBorderClass(formData.destinataire_email, false)}`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-500">Adresse complète de livraison</label>
                                                <textarea 
                                                    name="destinataire_adresse" 
                                                    value={formData.destinataire_adresse} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Rue, Quartier, Repères..."
                                                    className={`w-full rounded-md text-sm font-semibold p-3 h-24 ${getInputBorderClass(formData.destinataire_adresse, false)}`}
                                                />
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
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-800">Récapitulatif tarif</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">{formData.colis.length} colis · {totalWeight} kg · {formData.destinataire_ville || "—"}</p>
                                        </div>

                                        <div className="p-6 space-y-5">
                                            <div className="bg-slate-800 rounded-lg p-5 text-white">
                                                <p className="text-xs text-slate-400 mb-1">Total à payer</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-mono font-bold tracking-tight">
                                                        {(parseFloat(simulationTarif?.montant_expedition || simulationResult.total_price || simulationResult.amount || 0) + totalEmballage).toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-slate-400 font-semibold">CFA</span>
                                                </div>
                                            </div>

                                            {simulationTarif && (
                                                <div className="space-y-2.5 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Base transport</span>
                                                        <span className="font-semibold text-slate-700">{(parseFloat(simulationTarif.montant_base || 0)).toLocaleString()} CFA</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Frais de service</span>
                                                        <span className="font-semibold text-slate-700">{(parseFloat(simulationTarif.montant_prestation || 0)).toLocaleString()} CFA</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Emballage</span>
                                                        <span className="font-semibold text-slate-700">{totalEmballage.toLocaleString()} CFA</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2 pt-1">
                                                <button
                                                    onClick={() => setStep(2)}
                                                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95"
                                                >
                                                    Continuer vers finalisation
                                                </button>
                                                <button
                                                    onClick={() => { cleanSimulation(); }}
                                                    className="w-full py-2 text-slate-400 text-xs font-semibold hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    Masquer le tarif
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recapitulatif pour l'étape 2 (toujours sur le côté) */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="sticky top-24">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-800">Récapitulatif final</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">{formData.type_expedition.replace('GROUPAGE_', '').replace('_', ' ')} · {formData.destinataire_ville || "—"}</p>
                                        </div>

                                        <div className="p-6 space-y-5">
                                            <div className="bg-slate-800 rounded-lg p-5 text-white">
                                                <p className="text-xs text-slate-400 mb-1">Montant à régler</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-mono font-bold">
                                                        {(parseFloat(simulationTarif?.montant_expedition || simulationResult?.total_price || simulationResult?.amount || 0) + totalEmballage).toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-slate-400 font-semibold">CFA</span>
                                                </div>
                                            </div>

                                            {!formData.is_paiement_credit ? (
                                                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                    <label className="block text-xs font-semibold text-slate-600">Mode de règlement</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {/* Espèces */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setPaymentMethod('cash')}
                                                            className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                                                paymentMethod === 'cash' 
                                                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            Espèces
                                                        </button>

                                                        {/* Mobile Money */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setPaymentMethod('mobile_money')}
                                                            className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                                                paymentMethod === 'mobile_money' 
                                                                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                            Mobile Money
                                                        </button>

                                                        {/* Virement bancaire */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setPaymentMethod('bank_transfer')}
                                                            className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                                                paymentMethod === 'bank_transfer' 
                                                                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                                            </svg>
                                                            Virement
                                                        </button>

                                                        {/* Carte bancaire */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setPaymentMethod('card')}
                                                            className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                                                paymentMethod === 'card' 
                                                                    ? 'bg-purple-500 text-white border-purple-500 shadow-sm' 
                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                            </svg>
                                                            Carte
                                                        </button>

                                                        {/* Autre */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setPaymentMethod('other')}
                                                            className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 col-span-2 ${
                                                                paymentMethod === 'other' 
                                                                    ? 'bg-slate-600 text-white border-slate-600 shadow-sm' 
                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                            Autre
                                                        </button>
                                                    </div>

                                                    {/* Champ référence pour Mobile Money */}
                                                    {paymentMethod === 'mobile_money' && (
                                                        <div className="space-y-1.5 animate-fadeIn">
                                                            <label className="block text-xs font-semibold text-slate-500">Référence transaction</label>
                                                            <input
                                                                type="text"
                                                                value={paymentReference}
                                                                onChange={(e) => setPaymentReference(e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                                                placeholder="Ex: OM-123456789"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                                    <div className="flex items-start gap-2">
                                                        <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-xs font-semibold text-amber-800">Paiement à crédit</p>
                                                            <p className="text-xs text-amber-600 mt-0.5">Aucune transaction ne sera enregistrée. Le paiement sera effectué ultérieurement.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={status === 'loading'}
                                                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {status === 'loading' ? 'Traitement...' : 'Confirmer et expédier'}
                                                </button>
                                                <button
                                                    onClick={() => setStep(1)}
                                                    className="w-full py-2 text-slate-400 text-xs font-semibold hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                    Retour
                                                </button>
                                            </div>
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
        </>
    );
};

export default CreateExpedition;

