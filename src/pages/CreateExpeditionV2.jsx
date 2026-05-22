import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useExpedition } from "../hooks/useExpedition";
import { useTarifs } from "../hooks/useTarifs";
import { useAgency } from "../hooks/useAgency";
import PrintSuccessModal from "../components/Receipts/PrintSuccessModal";
import SearchableDropdown from "../components/common/SearchableDropdown";
import { getLogoUrl } from "../utils/apiConfig";
import { toast } from "../utils/toast";

const CreateExpeditionV2 = () => {
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

    // État pour la navigation interne (4 étapes)
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

    useEffect(() => {
        if (message && status !== 'succeeded') {
            toast.success(message);
            resetStatus();
        }
    }, [message, status, resetStatus]);

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
            // Ctrl + S pour simuler (étape 2)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (step === 2 && !simulating) {
                    handleSimulate();
                }
            }
            // Ctrl + Enter pour valider (étape 4)
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                if (step === 4 && status !== 'loading') {
                    handleSubmit();
                }
            }
            // Ctrl + → pour passer à l'étape suivante
            if (e.ctrlKey && e.key === 'ArrowRight') {
                e.preventDefault();
                handleNextStep();
            }
            // Ctrl + ← pour revenir à l'étape précédente
            if (e.ctrlKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                if (step > 1) {
                    setStep(step - 1);
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

            if (route.ligne && route.ligne.includes('-')) {
                const parts = route.ligne.split('-');
                depVille = parts[0]?.trim() || "Abidjan";
                destVille = parts[1]?.trim() || "";
            } else {
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

    const handleAddArticle = (colisIndex, option) => {
        if (!option || !option.label) return;
        const productDesignation = option.label;
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

    // Fonction pour obtenir les produits filtrés par catégorie
    const getFilteredProducts = (categoryId) => {
        if (!categoryId || !products || products.length === 0) {
            return products || [];
        }
        return products.filter(p => p.category_id === categoryId);
    };

    const handleSimulate = async () => {
        console.log("Simulation Payload:", formData);
        if (!formData.pays_destination || !formData.destinataire_ville) {
            toast.info("Veuillez renseigner le pays et la ville de destination.");
            return;
        }

        // Vérifier que chaque colis a au moins un article
        const colisManquantArticles = formData.colis.findIndex(
            c => !c.articles || c.articles.length === 0
        );
        if (colisManquantArticles !== -1) {
            toast.error(`Colis #${colisManquantArticles + 1} : veuillez sélectionner au moins un article.`);
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
                };

                // N'envoyer articles que s'il y en a, sous forme d'objets {designation}
                if (c.articles && c.articles.length > 0) {
                    item.articles = c.articles.map(a =>
                        typeof a === 'string' ? { designation: a } : a
                    );
                }

                if (c.category_id) item.category_id = c.category_id;

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
                };

                // N'envoyer articles que s'il y en a, sous forme d'objets {designation}
                if (c.articles && c.articles.length > 0) {
                    item.articles = c.articles.map(a =>
                        typeof a === 'string' ? { designation: a } : a
                    );
                }

                if (c.category_id) item.category_id = c.category_id;

                const typeCode = formData.type_expedition.replace('GROUPAGE_', '');
                item.code_colis = `COL-${typeCode}-${Date.now().toString().slice(-4)}-${index + 1}`;

                return item;
            })
        };

        console.log("creation Payload (Clean):", payload);
        const result = await createExpedition(payload);

        console.log("Result from createExpedition:", result);

        // result est l'action Redux : { type, payload } en fulfilled, ou { type, error } en rejected
        if (result?.type?.includes('rejected')) {
            // L'erreur est déjà gérée par le slice (state.error) et affichée via useEffect
            return;
        }

        // Extraire l'expédition depuis la réponse — plusieurs structures possibles
        const rawPayload = result?.payload;
        const expeditionData =
            rawPayload?.expedition ||
            rawPayload?.data?.expedition ||
            rawPayload?.data ||
            rawPayload;

        console.log("Expedition data extracted:", expeditionData);

        if (!formData.is_paiement_credit) {
            if (!expeditionData?.id) {
                console.error("Pas d'ID d'expédition trouvé dans:", rawPayload);
                toast.error("Expédition créée mais impossible d'enregistrer le paiement (ID manquant)");
                return;
            }

            const montantExpedition = parseFloat(
                simulationTarif?.montant_expedition ||
                simulationResult?.total_price ||
                simulationResult?.amount ||
                0
            );
            const montantTotal = montantExpedition + totalEmballage;

            console.log("Enregistrement transaction:", {
                expedition_id: expeditionData.id,
                amount: montantTotal,
                payment_method: paymentMethod
            });

            try {
                const transactionData = {
                    expedition_id: expeditionData.id,
                    amount: montantTotal,
                    payment_method: paymentMethod,
                    payment_object: "montant_expedition",
                    type: "encaissement",
                    description: `Paiement expédition ${expeditionData.reference || ''}`,
                };

                if (paymentMethod === 'mobile_money' && paymentReference) {
                    transactionData.reference = paymentReference;
                }

                console.log("Transaction data to send:", transactionData);
                await recordTransaction(transactionData);
                console.log("Transaction enregistrée avec succès");
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

    const simulationTarif = useMemo(() => {
        if (!simulationResult) return null;
        return simulationResult.tarif || simulationResult.data?.tarif || null;
    }, [simulationResult]);

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

    // Validation des étapes
    const canProceedToStep2 = () => {
        return formData.type_expedition && formData.pays_destination && formData.destinataire_ville;
    };

    const canProceedToStep3 = () => {
        return formData.colis.every(c => c.poids && c.designation && c.articles && c.articles.length > 0) && simulationResult;
    };

    const canProceedToStep4 = () => {
        return formData.expediteur_nom_prenom && formData.expediteur_telephone &&
               formData.destinataire_nom_prenom && formData.destinataire_telephone;
    };

    const handleNextStep = () => {
        if (step === 1 && !canProceedToStep2()) {
            toast.info("Veuillez compléter le type d'expédition et la destination");
            return;
        }
        if (step === 2 && !canProceedToStep3()) {
            toast.info("Veuillez enregistrer les colis et simuler le tarif");
            return;
        }
        if (step === 3 && !canProceedToStep4()) {
            toast.info("Veuillez identifier l'expéditeur et le destinataire");
            return;
        }
        setStep(step + 1);
    };


    // Classes communes pour les inputs — touch-friendly (h-11 = 44px)
    const inputCls = (value, required = false) =>
        `w-full rounded-lg text-sm font-medium h-11 px-3 outline-none transition-colors ${getInputBorderClass(value, required)}`;

    const steps = [
        { num: 1, label: "Trajet",   short: "1" },
        { num: 2, label: "Colis",    short: "2" },
        { num: 3, label: "Clients",  short: "3" },
        { num: 4, label: "Paiement", short: "4" },
    ];

    return (
        <>
            {/* Bandeau tarif mobile — affiché en bas quand simulationResult existe à l'étape 2 */}
            {step === 2 && simulationResult && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-emerald-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-[11px] font-medium text-emerald-100">Total estimé</p>
                        <p className="text-lg font-bold leading-tight">
                            {(parseFloat(simulationTarif?.montant_expedition || simulationResult?.total_price || 0) + totalEmballage).toLocaleString()} FCFA
                        </p>
                    </div>
                    <button
                        onClick={handleNextStep}
                        disabled={!canProceedToStep3()}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            canProceedToStep3()
                                ? 'bg-white text-emerald-700 active:bg-emerald-50'
                                : 'bg-emerald-800/50 text-emerald-300 cursor-not-allowed'
                        }`}
                    >
                        Continuer
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            <div className={`min-h-screen bg-slate-100 ${step === 2 && simulationResult ? 'pb-20 lg:pb-0' : ''}`}>
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between mb-4 sm:mb-8 gap-3">
                        <div>
                            <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">Nouvelle expédition</h1>
                            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                                Enregistrement et tarification des envois clients
                            </p>
                        </div>

                        {/* Stepper — compact sur mobile, complet sur desktop */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                            {steps.map((s, idx) => (
                                <React.Fragment key={s.num}>
                                    <button
                                        type="button"
                                        onClick={() => { if (step > s.num) setStep(s.num); }}
                                        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all ${
                                            step === s.num
                                                ? 'bg-slate-800 text-white'
                                                : step > s.num
                                                    ? 'text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                                                    : 'text-slate-400 cursor-default'
                                        }`}
                                    >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold border flex-shrink-0 ${
                                            step === s.num
                                                ? 'border-white/30 bg-white/10'
                                                : step > s.num
                                                    ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                                                    : 'border-slate-300 text-slate-400'
                                        }`}>
                                            {step > s.num ? '✓' : s.num}
                                        </span>
                                        <span className="hidden sm:inline">{s.label}</span>
                                    </button>
                                    {idx < 3 && (
                                        <svg className="w-3 h-3 text-slate-300 mx-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        {/* ÉTAPE 1: CHOISIR LE TRAJET */}
                        {step === 1 && (
                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">Étape 1 — Trajet</h2>
                                        <p className="text-xs text-slate-400">Type d'expédition et destination</p>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 space-y-5">

                                    {/* Types d'expédition */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-slate-600">
                                            Type d'expédition <span className="text-amber-600">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                            {[
                                                { value: 'SIMPLE',                label: 'LD',           icon: '📦', color: 'blue' },
                                                { value: 'GROUPAGE_DHD_AERIEN',   label: 'DHD Aérien',   icon: '✈️', color: 'sky' },
                                                { value: 'GROUPAGE_DHD_MARITIME', label: 'DHD Maritime', icon: '🚢', color: 'cyan' },
                                                { value: 'GROUPAGE_AFRIQUE',      label: 'Afrique',      icon: '🌍', color: 'emerald' },
                                                { value: 'GROUPAGE_CA',           label: 'CA',           icon: '📮', color: 'purple' },
                                            ].map(type => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, type_expedition: type.value }))}
                                                    className={`relative p-2.5 sm:p-3 rounded-lg border-2 transition-all active:scale-95 ${
                                                        formData.type_expedition === type.value
                                                            ? `border-${type.color}-500 bg-${type.color}-50 shadow-sm`
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    {formData.type_expedition === type.value && (
                                                        <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 bg-${type.color}-500 rounded-full flex items-center justify-center`}>
                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-lg sm:text-xl">{type.icon}</span>
                                                        <span className={`text-[10px] sm:text-xs font-bold leading-tight text-center ${
                                                            formData.type_expedition === type.value ? `text-${type.color}-700` : 'text-slate-600'
                                                        }`}>{type.label}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trajet disponible */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-600">Trajet disponible</label>
                                        <select
                                            onChange={handleRouteSelect}
                                            disabled={formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE'}
                                            className={`w-full rounded-lg text-sm font-semibold h-11 px-3 ${
                                                formData.type_expedition === 'GROUPAGE_CA' || formData.type_expedition === 'SIMPLE'
                                                    ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                                    : getInputBorderClass('', false)
                                            }`}
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

                                    {/* Destination + Départ — 2 colonnes sur mobile */}
                                    <div className="grid grid-cols-2 gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-500">
                                                Pays destination <span className="text-amber-600">*</span>
                                            </label>
                                            <input
                                                type="text" name="pays_destination"
                                                value={formData.pays_destination} onChange={handleInputChange}
                                                placeholder="France…"
                                                className={inputCls(formData.pays_destination, true)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-500">
                                                Ville destination <span className="text-amber-600">*</span>
                                            </label>
                                            <input
                                                type="text" name="destinataire_ville"
                                                value={formData.destinataire_ville} onChange={handleInputChange}
                                                placeholder="Paris…"
                                                className={inputCls(formData.destinataire_ville, true)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-500">Pays départ</label>
                                            <input
                                                type="text" name="pays_depart"
                                                value={formData.pays_depart} onChange={handleInputChange}
                                                placeholder="Côte d'Ivoire…"
                                                className={inputCls(formData.pays_depart)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-500">Ville départ</label>
                                            <input
                                                type="text" name="expediteur_ville"
                                                value={formData.expediteur_ville} onChange={handleInputChange}
                                                placeholder="Abidjan…"
                                                className={inputCls(formData.expediteur_ville)}
                                            />
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex justify-end pt-3 border-t border-slate-100">
                                        <button
                                            onClick={handleNextStep}
                                            disabled={!canProceedToStep2()}
                                            className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                                                canProceedToStep2()
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            Suivant : Colis
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}


                        {/* ÉTAPE 2: ENREGISTRER LES COLIS */}
                        {step === 2 && (
                            <div className={simulationResult ? "grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6" : "space-y-4 sm:space-y-6"}>
                                <div className={simulationResult ? "lg:col-span-2 space-y-4 sm:space-y-6" : "space-y-4 sm:space-y-6"}>
                                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-800">Étape 2 — Colis</h2>
                                                <p className="text-xs text-slate-400">Poids, dimensions, contenu</p>
                                            </div>
                                        </div>
                                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                                            {formData.colis.map((colis, index) => (
                                                <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 sm:space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-xs font-bold text-slate-700">Colis #{index + 1}</h3>
                                                        {formData.colis.length > 1 && (
                                                            <button
                                                                onClick={() => removeColis(index)}
                                                                className="text-xs text-red-500 font-semibold flex items-center gap-1 py-1 px-2 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Supprimer
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <label className="block text-xs font-semibold text-slate-600">
                                                                Désignation <span className="text-amber-600">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={colis.designation}
                                                                onChange={(e) => handleColisChange(index, 'designation', e.target.value)}
                                                                placeholder="Ex: Carton de vêtements…"
                                                                className={inputCls(colis.designation, true)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-xs font-semibold text-slate-600">Catégorie</label>
                                                            <select
                                                                value={colis.category_id}
                                                                onChange={(e) => handleColisChange(index, 'category_id', e.target.value)}
                                                                className={`w-full rounded-lg text-sm font-medium h-11 px-3 ${getInputBorderClass(colis.category_id, false)}`}
                                                            >
                                                                <option value="">Sélectionner…</option>
                                                                {categories?.map(cat => (
                                                                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Poids (kg) <span className="text-amber-600">*</span></label>
                                                            <input type="number" step="0.1" inputMode="decimal" value={colis.poids}
                                                                onChange={(e) => handleColisChange(index, 'poids', e.target.value)}
                                                                placeholder="0.0" className={inputCls(colis.poids, true)} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Long. (cm)</label>
                                                            <input type="number" step="0.1" inputMode="decimal" value={colis.longueur}
                                                                onChange={(e) => handleColisChange(index, 'longueur', e.target.value)}
                                                                placeholder="0" className={inputCls(colis.longueur)} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Larg. (cm)</label>
                                                            <input type="number" step="0.1" inputMode="decimal" value={colis.largeur}
                                                                onChange={(e) => handleColisChange(index, 'largeur', e.target.value)}
                                                                placeholder="0" className={inputCls(colis.largeur)} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Haut. (cm)</label>
                                                            <input type="number" step="0.1" inputMode="decimal" value={colis.hauteur}
                                                                onChange={(e) => handleColisChange(index, 'hauteur', e.target.value)}
                                                                placeholder="0" className={inputCls(colis.hauteur)} />
                                                        </div>
                                                        <div className="space-y-1.5 col-span-3 sm:col-span-1">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Emballage (FCFA)</label>
                                                            <input type="number" inputMode="numeric" value={colis.prix_emballage}
                                                                onChange={(e) => handleColisChange(index, 'prix_emballage', e.target.value)}
                                                                placeholder="0" className={inputCls(colis.prix_emballage)} />
                                                        </div>
                                                    </div>

                                                    {/* Articles */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <label className="block text-xs font-semibold text-slate-600">
                                                                Articles contenus <span className="text-amber-600">*</span>
                                                            </label>
                                                            {(!colis.articles || colis.articles.length === 0) && (
                                                                <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                                    </svg>
                                                                    Requis
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`flex gap-2 rounded-md border ${(!colis.articles || colis.articles.length === 0) ? 'border-amber-300 bg-amber-50/40' : 'border-transparent'}`}>
                                                            <SearchableDropdown
                                                                options={getFilteredProducts(colis.category_id).map(p => ({ 
                                                                    id: p.id,
                                                                    label: p.designation 
                                                                }))}
                                                                onSelect={(option) => handleAddArticle(index, option)}
                                                                placeholder={colis.category_id ? "Rechercher un article..." : "Sélectionnez d'abord une catégorie"}
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                        {colis.articles && colis.articles.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {colis.articles.map((article, artIdx) => (
                                                                    <span key={artIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                                                                        {article}
                                                                        <button
                                                                            onClick={() => handleRemoveArticle(index, artIdx)}
                                                                            className="hover:text-indigo-900"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[11px] text-amber-600 mt-1">
                                                                Ajoutez au moins un article pour pouvoir calculer le tarif.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={addColis}
                                                className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Ajouter un colis
                                            </button>

                                            {/* Résumé */}
                                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-semibold text-slate-700">Poids total :</span>
                                                    <span className="font-bold text-emerald-700">{totalWeight.toFixed(2)} kg</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm mt-1">
                                                    <span className="font-semibold text-slate-700">Frais d'emballage :</span>
                                                    <span className="font-bold text-emerald-700">{totalEmballage.toLocaleString()} FCFA</span>
                                                </div>
                                            </div>

                                            {/* Bouton simuler */}
                                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={() => setStep(1)}
                                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    Retour
                                                </button>
                                                <button
                                                    onClick={handleSimulate}
                                                    disabled={simulating || !formData.colis.every(c => c.poids && c.designation && c.articles && c.articles.length > 0)}
                                                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                                                        simulating || !formData.colis.every(c => c.poids && c.designation)
                                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                                    }`}
                                                >
                                                    {simulating ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Calcul en cours...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                            Calculer le tarif (Ctrl+S)
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Panneau de tarification */}
                                {simulationResult && (
                                    <div className="lg:col-span-1">
                                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-lg p-6 text-white sticky top-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <h3 className="text-sm font-bold">Tarification calculée</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center pb-3 border-b border-emerald-500/30">
                                                    <span className="text-xs font-medium text-emerald-100">Frais d'expédition</span>
                                                    <span className="text-lg font-bold">{parseFloat(simulationTarif?.montant_expedition || simulationResult?.total_price || 0).toLocaleString()} FCFA</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-emerald-100">Frais d'emballage</span>
                                                    <span className="text-sm font-bold">{totalEmballage.toLocaleString()} FCFA</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-3 border-t border-emerald-500/30">
                                                    <span className="text-sm font-bold">TOTAL</span>
                                                    <span className="text-2xl font-bold">{(parseFloat(simulationTarif?.montant_expedition || simulationResult?.total_price || 0) + totalEmballage).toLocaleString()} FCFA</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleNextStep}
                                                disabled={!canProceedToStep3()}
                                                className={`w-full mt-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                                    canProceedToStep3()
                                                        ? 'bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm'
                                                        : 'bg-emerald-800/50 text-emerald-300 cursor-not-allowed'
                                                }`}
                                            >
                                                Suivant : Identifier les clients
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* ÉTAPE 3: IDENTIFIER LES CLIENTS */}
                        {step === 3 && (
                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">Étape 3 : Identifier les clients</h2>
                                        <p className="text-xs text-slate-400">Expéditeur et destinataire</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Expéditeur */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-700">Expéditeur</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-600">
                                                    Nom complet <span className="text-amber-600">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="expediteur_nom_prenom"
                                                    value={formData.expediteur_nom_prenom}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Jean Kouassi..."
                                                    className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(formData.expediteur_nom_prenom, true)}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-600">
                                                    Téléphone <span className="text-amber-600">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="expediteur_telephone"
                                                    value={formData.expediteur_telephone}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: +225 07 XX XX XX XX..."
                                                    className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(formData.expediteur_telephone, true)}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-600">Email</label>
                                                <input
                                                    type="email"
                                                    name="expediteur_email"
                                                    value={formData.expediteur_email}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: jean@example.com..."
                                                    className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(formData.expediteur_email, false)}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-600">Adresse</label>
                                                <input
                                                    type="text"
                                                    name="expediteur_adresse"
                                                    value={formData.expediteur_adresse}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Cocody, Angré..."
                                                    className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(formData.expediteur_adresse, false)}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Destinataire */}
                                    <div className="space-y-4 pt-4 border-t border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-700">Destinataire</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-600">
                                                    Nom complet <span className="text-amber-600">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="destinataire_nom_prenom"
                                                    value={formData.destinataire_nom_prenom}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Marie Dupont..."
                                                    className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(formData.destinataire_nom_prenom, true)}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-600">
                                                    Téléphone <span className="text-amber-600">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="destinataire_telephone"
                                                    value={formData.destinataire_telephone}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: +33 6 XX XX XX XX..."
                                                    className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(formData.destinataire_telephone, true)}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-600">Email</label>
                                                <input
                                                    type="email"
                                                    name="destinataire_email"
                                                    value={formData.destinataire_email}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: marie@example.com..."
                                                    className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(formData.destinataire_email, false)}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-600">Adresse</label>
                                                <input
                                                    type="text"
                                                    name="destinataire_adresse"
                                                    value={formData.destinataire_adresse}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: 12 rue de la Paix..."
                                                    className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(formData.destinataire_adresse, false)}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-slate-600">Code postal</label>
                                                <input
                                                    type="text"
                                                    name="destinataire_code_postal"
                                                    value={formData.destinataire_code_postal}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: 75001..."
                                                    className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(formData.destinataire_code_postal, false)}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Boutons navigation */}
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Retour
                                        </button>
                                        <button
                                            onClick={handleNextStep}
                                            disabled={!canProceedToStep4()}
                                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                                                canProceedToStep4()
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            Suivant : Encaisser et valider
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}


                        {/* ÉTAPE 4: ENCAISSER ET VALIDER */}
                        {step === 4 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-800">Étape 4 : Encaisser et valider</h2>
                                                <p className="text-xs text-slate-400">Mode de paiement et finalisation</p>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {/* Récapitulatif de l'expédition */}
                                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Récapitulatif</h3>
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <span className="text-slate-500 font-medium">Type :</span>
                                                        <span className="ml-2 font-semibold text-slate-800">
                                                            {formData.type_expedition === 'SIMPLE' ? 'LD' : formData.type_expedition.replace('GROUPAGE_', '').replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 font-medium">Trajet :</span>
                                                        <span className="ml-2 font-semibold text-slate-800">
                                                            {formData.expediteur_ville} → {formData.destinataire_ville}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 font-medium">Colis :</span>
                                                        <span className="ml-2 font-semibold text-slate-800">{formData.colis.length} colis</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 font-medium">Poids total :</span>
                                                        <span className="ml-2 font-semibold text-slate-800">{totalWeight.toFixed(2)} kg</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-slate-500 font-medium">Expéditeur :</span>
                                                        <span className="ml-2 font-semibold text-slate-800">
                                                            {formData.expediteur_nom_prenom} ({formData.expediteur_telephone})
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-slate-500 font-medium">Destinataire :</span>
                                                        <span className="ml-2 font-semibold text-slate-800">
                                                            {formData.destinataire_nom_prenom} ({formData.destinataire_telephone})
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Options de service */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold text-slate-700">Options de service</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {/* Livraison à domicile */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, is_livraison_domicile: !prev.is_livraison_domicile }))}
                                                        className={`flex items-center gap-3 p-3.5 rounded-lg border-2 text-left transition-all ${
                                                            formData.is_livraison_domicile
                                                                ? 'border-indigo-500 bg-indigo-50'
                                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                            formData.is_livraison_domicile ? 'bg-indigo-100' : 'bg-slate-100'
                                                        }`}>
                                                            <svg className={`w-5 h-5 ${formData.is_livraison_domicile ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-semibold ${formData.is_livraison_domicile ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                                Livraison à domicile
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                {formData.is_livraison_domicile ? 'Activée' : 'Désactivée'}
                                                            </p>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                                            formData.is_livraison_domicile
                                                                ? 'border-indigo-500 bg-indigo-500'
                                                                : 'border-slate-300'
                                                        }`}>
                                                            {formData.is_livraison_domicile && (
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </button>

                                                    {/* Paiement à crédit */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, is_paiement_credit: !prev.is_paiement_credit }))}
                                                        className={`flex items-center gap-3 p-3.5 rounded-lg border-2 text-left transition-all ${
                                                            formData.is_paiement_credit
                                                                ? 'border-amber-500 bg-amber-50'
                                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                            formData.is_paiement_credit ? 'bg-amber-100' : 'bg-slate-100'
                                                        }`}>
                                                            <svg className={`w-5 h-5 ${formData.is_paiement_credit ? 'text-amber-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-semibold ${formData.is_paiement_credit ? 'text-amber-700' : 'text-slate-600'}`}>
                                                                Paiement à crédit
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                {formData.is_paiement_credit ? 'Sans encaissement immédiat' : 'Paiement immédiat'}
                                                            </p>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                                            formData.is_paiement_credit
                                                                ? 'border-amber-500 bg-amber-500'
                                                                : 'border-slate-300'
                                                        }`}>
                                                            {formData.is_paiement_credit && (
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Mode de paiement */}
                                            {!formData.is_paiement_credit && (
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-slate-700">Mode de paiement</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <button
                                                            onClick={() => setPaymentMethod('cash')}
                                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                                paymentMethod === 'cash'
                                                                    ? 'border-emerald-500 bg-emerald-50'
                                                                    : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                    paymentMethod === 'cash' ? 'bg-emerald-100' : 'bg-slate-100'
                                                                }`}>
                                                                    <svg className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-emerald-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                    </svg>
                                                                </div>
                                                                <span className={`text-xs font-semibold ${paymentMethod === 'cash' ? 'text-emerald-700' : 'text-slate-600'}`}>
                                                                    Espèces
                                                                </span>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={() => setPaymentMethod('mobile_money')}
                                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                                paymentMethod === 'mobile_money'
                                                                    ? 'border-amber-500 bg-amber-50'
                                                                    : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                    paymentMethod === 'mobile_money' ? 'bg-amber-100' : 'bg-slate-100'
                                                                }`}>
                                                                    <svg className={`w-5 h-5 ${paymentMethod === 'mobile_money' ? 'text-amber-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                                <span className={`text-xs font-semibold ${paymentMethod === 'mobile_money' ? 'text-amber-700' : 'text-slate-600'}`}>
                                                                    Mobile Money
                                                                </span>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={() => setPaymentMethod('bank_transfer')}
                                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                                paymentMethod === 'bank_transfer'
                                                                    ? 'border-blue-500 bg-blue-50'
                                                                    : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                    paymentMethod === 'bank_transfer' ? 'bg-blue-100' : 'bg-slate-100'
                                                                }`}>
                                                                    <svg className={`w-5 h-5 ${paymentMethod === 'bank_transfer' ? 'text-blue-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                    </svg>
                                                                </div>
                                                                <span className={`text-xs font-semibold ${paymentMethod === 'bank_transfer' ? 'text-blue-700' : 'text-slate-600'}`}>
                                                                    Virement
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>

                                                    {/* Référence pour Mobile Money */}
                                                    {paymentMethod === 'mobile_money' && (
                                                        <div className="space-y-1.5">
                                                            <label className="block text-xs font-semibold text-slate-600">
                                                                Référence de transaction
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={paymentReference}
                                                                onChange={(e) => setPaymentReference(e.target.value)}
                                                                placeholder="Ex: MM123456789..."
                                                                className={`w-full rounded-md text-sm font-semibold h-9 px-3 ${getInputBorderClass(paymentReference, false)}`}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {formData.is_paiement_credit && (
                                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs font-bold text-amber-800">Paiement à crédit</p>
                                                        <p className="text-xs text-amber-700 mt-1">Cette expédition sera enregistrée sans encaissement immédiat.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Boutons navigation */}
                                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={() => setStep(3)}
                                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    Retour
                                                </button>
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={status === 'loading'}
                                                    className={`px-8 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                                        status === 'loading'
                                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg'
                                                    }`}
                                                >
                                                    {status === 'loading' ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Création en cours...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Valider l'expédition (Ctrl+Enter)
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Panneau récapitulatif du montant */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white sticky top-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            <h3 className="text-sm font-bold">Montant à encaisser</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                                                <span className="text-xs font-medium text-slate-300">Frais d'expédition</span>
                                                <span className="text-lg font-bold">{parseFloat(simulationTarif?.montant_expedition || simulationResult?.total_price || 0).toLocaleString()} FCFA</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-slate-300">Frais d'emballage</span>
                                                <span className="text-sm font-bold">{totalEmballage.toLocaleString()} FCFA</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                                                <span className="text-sm font-bold">TOTAL</span>
                                                <span className="text-3xl font-bold text-emerald-400">{(parseFloat(simulationTarif?.montant_expedition || simulationResult?.total_price || 0) + totalEmballage).toLocaleString()}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-slate-400">FCFA</span>
                                            </div>
                                        </div>
                                        {!formData.is_paiement_credit && (
                                            <div className="mt-6 p-3 bg-slate-700/50 rounded-lg">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-slate-300 font-medium">
                                                        Paiement par {paymentMethod === 'cash' ? 'espèces' : paymentMethod === 'mobile_money' ? 'Mobile Money' : 'virement'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de succès */}
            {status === 'succeeded' && currentExpedition && (
                <PrintSuccessModal
                    expedition={currentExpedition}
                    onClose={() => {
                        resetStatus();
                        navigate('/expeditions');
                    }}
                    agencyData={agencyData}
                />
            )}
        </>
    );
};

export default CreateExpeditionV2;
