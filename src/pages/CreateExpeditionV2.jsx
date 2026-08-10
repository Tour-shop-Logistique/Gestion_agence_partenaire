import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useExpedition } from "../hooks/useExpedition";
import { useTarifs } from "../hooks/useTarifs";
import { useAgency } from "../hooks/useAgency";
import { useDashboard } from "../hooks/useDashboard";
import PrintSuccessModal from "../components/Receipts/PrintSuccessModal";
import SearchableDropdown from "../components/common/SearchableDropdown";
import Spinner from "../components/common/Spinner";
import Skeleton from "../components/common/Skeleton";
import ConfirmationModal from "../components/ConfirmationModal";
import { getLogoUrl } from "../utils/apiConfig";
import { toast } from "../utils/toast";
import { markAsRecentlyCreated } from "../hooks/useWebSocket";
import { generateColisCode, parseColisCode } from "../utils/codeGenerator";
import { expeditionsApi } from "../utils/api/expeditions";
import { getCountryName } from "../utils/countries";
import PageHeader from "../components/ui/PageHeader";

// Correspondance entre la valeur de type_expedition du formulaire
// et le type attendu par generateColisCode (préfixe du code colis)
const CODE_COLIS_TYPE_MAP = {
    SIMPLE: "LD",
    GROUPAGE_DHD_AERIEN: "AERIEN",
    GROUPAGE_DHD_MARITIME: "MARITIME",
    GROUPAGE_AFRIQUE: "AFRIQUE",
    GROUPAGE_CA: "CA",
};

// Correspondance entre la valeur de type_expedition du formulaire
// et la valeur "type_expedition" renvoyée par l'API (dashboard/expéditions)
const FORM_TYPE_TO_API_TYPE = {
    SIMPLE: "simple",
    GROUPAGE_DHD_AERIEN: "groupage_dhd_aerien",
    GROUPAGE_DHD_MARITIME: "groupage_dhd_maritime",
    GROUPAGE_AFRIQUE: "groupage_afrique",
    GROUPAGE_CA: "groupage_ca",
};

// Un colis est valide pour la simulation/soumission s'il a un poids,
// une désignation et au moins un article
const isColisComplete = (c) => Boolean(c.poids && c.designation && c.articles && c.articles.length > 0);

// Les entrées Zone.pays sont au format "Nom(CODE)" (ex: "France(FR)") - on
// n'affiche ce format qu'à l'écran (dropdown), jamais en base : pays_destination
// doit rester un nom de pays "propre" ("France"), sinon les comparaisons
// backend (recherche du backoffice/agence de destination par pays) échouent
// silencieusement dès que le format diffère de celui stocké sur le backoffice.
const extractCountryName = (label) => (label || '').replace(/\s*\([^)]*\)\s*$/, '').trim();

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

    const {
        existingGroupageTarifs, fetchTarifGroupageAgence, existingTarifs, flatExistingTarifs, fetchAgencyTarifs,
        // Tarifs de base du backoffice - utilisés en complément des tarifs
        // personnalisés de l'agence pour proposer aussi les destinations que
        // l'agence n'a pas encore configurées elle-même (le calcul retombe
        // automatiquement sur ces tarifs de base, voir resoudreTarif* côté backend).
        tarifs: baseTarifs, fetchTarifs: fetchBaseTarifs,
        groupageTarifs: baseGroupageTarifs, fetchTarifsGroupageBase: fetchBaseGroupageTarifs,
        loading: tarifsLoading
    } = useTarifs();
    const { data: agencyData, fetchAgencyData, status: agencyStatus } = useAgency();
    const { logistics, fetchDashboard, status: dashboardStatus } = useDashboard();

    // État pour la navigation interne (4 étapes)
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paymentReference, setPaymentReference] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [selectedRouteId, setSelectedRouteId] = useState("");
    const [selectedRoute, setSelectedRoute] = useState(null);
    // Snapshot des colis au moment de la dernière simulation, pour détecter
    // si le tarif affiché est devenu obsolète suite à une modification
    const lastSimulatedColisRef = useRef(null);
    // Prochain numéro séquentiel de colis pour le type sélectionné,
    // déduit du dernier colis du même type trouvé dans les "dernières expéditions" du dashboard
    const [nextColisNumero, setNextColisNumero] = useState(1);

    const [formData, setFormData] = useState({
        type_expedition: "SIMPLE",
        pays_depart: "Côte d'Ivoire",
        code_pays_depart: "CI",
        pays_destination: "",
        code_pays_destination: "",
        is_paiement_credit: false,
        is_livraison_domicile: true,
        statut_paiement: "paye",

        // Expéditeur
        expediteur_nom_prenom: "",
        expediteur_telephone: "",
        expediteur_email: "",
        expediteur_adresse: "",
        expediteur_ville: "Abidjan",
        expediteur_pays: getCountryName("CI"),

        // Destinataire
        destinataire_nom_prenom: "",
        destinataire_telephone: "",
        destinataire_email: "",
        destinataire_adresse: "",
        destinataire_ville: "",
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
                prix_estimation: 0,
                articles: []
            }
        ]
    });

    // Nettoyage immédiat au montage du composant
    useEffect(() => {
        // Nettoyage synchrone dès le montage
        resetStatus();
        clearCurrentExpedition();
        cleanSimulation();
        
        // Chargement des données
        loadProducts();
        loadCategories();
        fetchTarifGroupageAgence();
        fetchAgencyTarifs(); // Charger aussi les tarifs simples
        fetchBaseTarifs(); // Tarifs de base backoffice (fallback destinations)
        fetchBaseGroupageTarifs(); // Idem pour le groupage
        fetchAgencyData();
        fetchDashboard(); // Nécessaire pour déduire le prochain numéro de code colis
            }, []);

    // Nettoyage au démontage
    useEffect(() => {
        return () => {
            resetStatus();
            clearCurrentExpedition();
            cleanSimulation();
        };
    }, []);

    // Gestion des pays par défaut selon le type
    useEffect(() => {
        const type = formData.type_expedition;
        if (type === "GROUPAGE_DHD_AERIEN" || type === "GROUPAGE_DHD_MARITIME" || type === "SIMPLE") {
            setFormData(prev => ({
                ...prev,
                pays_destination: "France",
                code_pays_destination: "FR",
                destinataire_ville: "",
                expediteur_ville: "Abidjan"
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                pays_destination: "",
                code_pays_destination: "",
                destinataire_ville: "",
                expediteur_ville: "Abidjan"
            }));
        }
        // Réinitialiser la route sélectionnée lorsque le type change
        setSelectedRoute(null);
        setSelectedRouteId(""); // Réinitialiser aussi l'ID pour le select
        cleanSimulation();
    }, [formData.type_expedition]);

    // Nombre maximal de pages de la liste complète des expéditions à parcourir
    // en repli si aucune expédition du même type n'est trouvée dans les 5 dernières du dashboard
    const MAX_EXPEDITIONS_FALLBACK_PAGES = 10;

    // Cherche, dans une liste d'expéditions (résumés), la première du type demandé
    const findExpeditionByType = (expeditions, apiType) =>
        (Array.isArray(expeditions) ? expeditions : []).find(
            (exp) => (exp.type_expedition || exp.type) === apiType
        );

    // Déduire le prochain numéro de code colis à partir de la dernière expédition du même
    // type : d'abord dans les "dernières expéditions" du dashboard, sinon en repli dans la
    // liste complète des expéditions (comme sur la page Expeditions.jsx)
    useEffect(() => {
        let cancelled = false;

        const computeNextColisNumero = async () => {
            const codeAgence = agencyData?.agence?.code_agence;
            const apiType = FORM_TYPE_TO_API_TYPE[formData.type_expedition];

            if (!codeAgence || !apiType) {
                if (!cancelled) setNextColisNumero(1);
                return;
            }

            // 1. D'abord dans les 5 dernières expéditions du dashboard
            let matchingExpedition = findExpeditionByType(logistics?.dernieres_expeditions, apiType);

            // 2. Sinon, repli sur la liste complète des expéditions (pagination), du plus récent au plus ancien
            if (!matchingExpedition?.id) {
                for (let page = 1; page <= MAX_EXPEDITIONS_FALLBACK_PAGES && !cancelled; page++) {
                    const listResult = await expeditionsApi.listExpeditions({ page });
                    if (!listResult?.success || !Array.isArray(listResult.data) || listResult.data.length === 0) {
                        break;
                    }

                    matchingExpedition = findExpeditionByType(listResult.data, apiType);
                    if (matchingExpedition?.id) break;

                    const lastPage = listResult.meta?.last_page;
                    if (lastPage && page >= lastPage) break;
                }
            }

            if (cancelled) return;

            if (!matchingExpedition?.id) {
                setNextColisNumero(1);
                return;
            }

            const result = await expeditionsApi.getExpedition(matchingExpedition.id);
            if (cancelled) return;

            if (!result?.success) {
                setNextColisNumero(1);
                return;
            }

            const cleanCodeAgence = codeAgence.replace(/[-\s]/g, '').toUpperCase();
            const shortType = CODE_COLIS_TYPE_MAP[formData.type_expedition] || 'LD';
            const colisList = Array.isArray(result.data?.colis) ? result.data.colis : [];

            const numeros = colisList
                .map((c) => parseColisCode(c.code_colis))
                .filter((p) => p && p.typeExpedition === shortType && p.codeAgence === cleanCodeAgence)
                .map((p) => p.numero);

            setNextColisNumero(numeros.length > 0 ? Math.max(...numeros) + 1 : 1);
        };

        computeNextColisNumero();
        return () => { cancelled = true; };
    }, [formData.type_expedition, agencyData?.agence?.code_agence, logistics?.dernieres_expeditions]);

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
                    setShowSubmitConfirm(true);
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


    // Liste des trajets disponibles pour le type sélectionné : tarifs
    // personnalisés de l'agence en priorité, complétés par les trajets de
    // base du backoffice (fallback) - évite les champs texte libre non
    // validés qui échouaient tardivement à la simulation.
    const availableRoutes = useMemo(() => {
        const currentType = formData.type_expedition.toLowerCase();

        const agenceTarifs = Array.isArray(existingGroupageTarifs) ? existingGroupageTarifs : [];
        const backofficeTarifs = Array.isArray(baseGroupageTarifs) ? baseGroupageTarifs : [];

        // Tarifs agence d'abord (priorité), puis tarifs backoffice en complément
        const tarifsByType = [
            ...agenceTarifs.filter(t => t.type_expedition === currentType),
            ...backofficeTarifs.filter(t => t.type_expedition === currentType),
        ];

        // Dédupliquer les trajets
        const uniqueRoutes = [];
        const seenKeys = new Set();
        const duplicatesInfo = {}; // Pour tracer les doublons
        
        for (const tarif of tarifsByType) {
            let key;
            let displayValue; // Pour le debug
            
            // Créer une clé unique selon le type
            if (currentType.includes('dhd')) {
                // Pour DHD, la clé est la ligne (ex: "abidjan-marseille")
                const rawLigne = tarif.ligne || "";
                key = rawLigne.toLowerCase().trim();
                displayValue = rawLigne;
                
            } else if (currentType === 'groupage_afrique') {
                // Pour AFRIQUE, la clé est le pays (ex: "GABON LIBREVILLE")
                const rawPays = tarif.pays || "";
                key = rawPays.toLowerCase().trim();
                displayValue = rawPays;
                
            } else if (currentType === 'groupage_ca') {
                // Pour CA, la clé est ligne + pays
                const rawLigne = tarif.ligne || "";
                const rawPays = tarif.pays || "";
                key = `${rawLigne.toLowerCase().trim()}|${rawPays.toLowerCase().trim()}`;
                displayValue = `${rawLigne} (${rawPays})`;
                
            } else {
                // Fallback: utiliser l'ID
                key = String(tarif.id);
                displayValue = tarif.id;
            }
            
            // Si cette clé n'a pas encore été vue, ajouter le tarif
            if (key && !seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueRoutes.push(tarif);
            } else {
                
                // Tracer les doublons pour statistiques
                if (!duplicatesInfo[key]) {
                    duplicatesInfo[key] = [];
                }
                duplicatesInfo[key].push(tarif.id);
            }
        }
        
        
        return uniqueRoutes;
    }, [existingGroupageTarifs, baseGroupageTarifs, formData.type_expedition]);

    // Options formatées (id + label en majuscules) pour le SearchableDropdown
    // de sélection de trajet (DHD Aérien/Maritime, Groupage Afrique).
    const availableRouteOptions = useMemo(() => {
        return availableRoutes.map(r => ({
            id: r.id,
            label: (
                (formData.type_expedition === 'GROUPAGE_DHD_AERIEN' || formData.type_expedition === 'GROUPAGE_DHD_MARITIME')
                    ? r.ligne
                    : formData.type_expedition === 'GROUPAGE_AFRIQUE'
                        ? r.pays
                        : `${r.ligne} (${r.pays}) - ${r.mode}`
            )?.toUpperCase() || '',
        }));
    }, [availableRoutes, formData.type_expedition]);

    // Pays disponibles pour les tarifs simples (LD) : fusionne les tarifs
    // personnalisés de l'agence (prioritaires, montant déjà connu) et les
    // tarifs de base du backoffice (fallback - le montant sera obtenu via la
    // simulation API classique, le calcul retombant automatiquement dessus
    // côté backend si l'agence n'a pas de tarif personnalisé).
    const availableCountriesForLD = useMemo(() => {
        if (formData.type_expedition !== 'SIMPLE') {
            return [];
        }

        // Clé de dédoublonnage : le code ISO si connu, sinon le nom brut en
        // repli (zones pas encore migrées) - évite d'afficher deux entrées
        // ("France" et "France(FR)") pour un même pays selon l'écriture
        // historique stockée dans zone.pays[].
        const countryByKey = {};

        // zone.pays[] (noms) et zone.pays_codes[] (codes ISO) sont deux
        // tableaux parallèles de même longueur/ordre - on les zippe pour
        // retrouver le code ISO exact de chaque pays affiché.
        const addFromTarifs = (tarifs, tarifIsAgence) => {
            (tarifs || []).forEach((tarif) => {
                const prixZones = tarif.prix_zones;
                if (!Array.isArray(prixZones)) return;

                prixZones.forEach((prixZone) => {
                    const zone = prixZone.zone;
                    const paysZone = zone?.pays;
                    const codesZone = zone?.pays_codes;
                    if (!Array.isArray(paysZone)) return;

                    paysZone.forEach((pays, idx) => {
                        if (!pays) return;
                        const code = Array.isArray(codesZone) ? codesZone[idx] : null;
                        const key = code || pays;
                        if (tarifIsAgence || !countryByKey[key]) {
                            countryByKey[key] = {
                                zone,
                                code,
                                label: code ? getCountryName(code) : extractCountryName(pays),
                                // Tarif complet avec montants si personnalisé par
                                // l'agence, sinon null (passera par la simulation).
                                tarif: tarifIsAgence ? prixZone : null,
                                tarifGroup: tarifIsAgence ? tarif : null,
                            };
                        }
                    });
                });
            });
        };

        // 1. Tarifs personnalisés de l'agence (priorité - montant déjà connu)
        addFromTarifs(existingTarifs, true);
        // 2. Tarifs de base du backoffice (fallback - complète la liste avec
        // les destinations que l'agence n'a pas encore personnalisées)
        addFromTarifs(baseTarifs, false);

        // Convertir en tableau d'objets pour le SearchableDropdown
        const countriesList = Object.entries(countryByKey).map(([key, info]) => ({
            id: key,
            ...info,
        })).sort((a, b) => a.label.localeCompare(b.label));

        return countriesList;
    }, [existingTarifs, flatExistingTarifs, baseTarifs, formData.type_expedition]);

    // Liste de tous les pays connus (zones du backoffice + tarifs agence),
    // indépendante du type d'expédition - utilisée pour les champs "Pays
    // destination" (DHD/CA) et "Pays départ", qui étaient auparavant du texte
    // libre non assisté.
    const allKnownCountries = useMemo(() => {
        // Même logique de dédoublonnage par code ISO que availableCountriesForLD
        // ci-dessus (voir commentaire), avec libellé dérivé du référentiel.
        const countryByKey = {};

        const collectFrom = (tarifsList) => {
            (tarifsList || []).forEach((tarif) => {
                const prixZones = tarif.prix_zones;
                if (!Array.isArray(prixZones)) return;
                prixZones.forEach((prixZone) => {
                    const paysZone = prixZone.zone?.pays;
                    const codesZone = prixZone.zone?.pays_codes;
                    if (!Array.isArray(paysZone)) return;
                    paysZone.forEach((pays, idx) => {
                        if (!pays) return;
                        const code = Array.isArray(codesZone) ? codesZone[idx] : null;
                        const key = code || pays;
                        if (!countryByKey[key]) {
                            countryByKey[key] = {
                                code,
                                label: code ? getCountryName(code) : extractCountryName(pays),
                            };
                        }
                    });
                });
            });
        };

        collectFrom(existingTarifs);
        collectFrom(baseTarifs);

        return Object.entries(countryByKey)
            .map(([key, info]) => ({ id: key, label: info.label, code: info.code }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [existingTarifs, baseTarifs]);

    // Filtrage des catégories en fonction du type d'expédition ET de la ligne sélectionnée
    const filteredCategories = useMemo(() => {
        if (!categories || !Array.isArray(categories)) return [];
        
        const currentType = formData.type_expedition.toLowerCase();
        const isDHD = currentType.includes('dhd');
        
        // Pour les types NON-DHD (SIMPLE, AFRIQUE, CA), retourner toutes les catégories SANS filtrage
        if (!isDHD) {
            return categories;
        }
        
        // === À partir d'ici, uniquement pour DHD (AERIEN et MARITIME) ===
        
        // Pour les autres types, filtrer par les category_id présents dans les tarifs groupage
        if (!existingGroupageTarifs || !Array.isArray(existingGroupageTarifs)) {
            return categories;
        }
        
        // Récupérer tous les tarifs correspondant au type sélectionné
        let filteredTarifs = existingGroupageTarifs
            .filter(tarif => tarif.type_expedition === currentType);
        
        // Si une ligne est sélectionnée, filtrer aussi par la ligne
        if (selectedRoute) {
            const routeLigne = selectedRoute.ligne;
            
            // Filtrer les tarifs qui correspondent à la ligne sélectionnée
            filteredTarifs = filteredTarifs.filter(tarif => {
                const tarifLigne = (tarif.ligne || "").toLowerCase().trim();
                const selectedLigne = (routeLigne || "").toLowerCase().trim();
                const match = tarifLigne === selectedLigne;
                return match;
            });
        }
        
        // Extraire les category_id (en ignorant les null)
        const categoryIds = filteredTarifs
            .map(tarif => tarif.category_id)
            .filter(id => id !== null && id !== undefined);
        
        // Éliminer les doublons
        const uniqueCategoryIds = [...new Set(categoryIds)];
        
        // Si aucune catégorie spécifique trouvée (tous les tarifs ont category_id null)
        // Cela signifie que le tarif est universel pour toutes les catégories
        if (uniqueCategoryIds.length === 0) {
            return categories;
        }
        
        // Filtrer les catégories pour ne garder que celles qui ont un tarif pour ce type/ligne
        const result = categories.filter(cat => uniqueCategoryIds.includes(cat.id));
        
        return result;
    }, [categories, existingGroupageTarifs, formData.type_expedition, selectedRoute]);

    // Sélection automatique des infos depuis un trajet configuré
    const handleRouteSelect = (routeId) => {
        // Mettre à jour l'ID de la route sélectionnée
        setSelectedRouteId(routeId);

        if (!routeId) {
            setSelectedRoute(null);
            return;
        }

        const route = availableRoutes.find(r => String(r.id) === String(routeId));

        if (route) {
            // Sauvegarder la route sélectionnée pour le filtrage des catégories
            setSelectedRoute(route);
            
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

            const isSimpleType = formData.type_expedition === 'SIMPLE';
            const paysDestination = isDHD || isSimpleType ? "France" : extractCountryName(route.pays || "");
            const codePaysDestination = isDHD || isSimpleType ? "FR" : (route.code_pays || "");

            setFormData(prev => ({
                ...prev,
                pays_destination: paysDestination,
                code_pays_destination: codePaysDestination,
                destinataire_ville: destVille,
                expediteur_ville: depVille,
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Copie les coordonnées de l'expéditeur vers le destinataire (cas d'un envoi entre
    // deux adresses de la même personne, ou d'un point relais local)
    const handleCopySenderToRecipient = () => {
        setFormData(prev => ({
            ...prev,
            destinataire_nom_prenom: prev.expediteur_nom_prenom,
            destinataire_telephone: prev.expediteur_telephone,
            destinataire_email: prev.expediteur_email,
            destinataire_adresse: prev.expediteur_adresse,
        }));
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
            colis: [...prev.colis, { designation: "", category_id: "", poids: "", longueur: "", largeur: "", hauteur: "", prix_emballage: 0, prix_estimation: 0, articles: [] }]
        }));
    };

    const removeColis = (index) => {
        if (formData.colis.length > 1) {
            const newColis = formData.colis.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, colis: newColis }));
        }
    };

    // Duplique un colis existant (pratique pour des envois multi-colis similaires)
    const duplicateColis = (index) => {
        setFormData(prev => {
            const newColis = [...prev.colis];
            newColis.splice(index + 1, 0, { ...prev.colis[index], articles: [...(prev.colis[index].articles || [])] });
            return { ...prev, colis: newColis };
        });
    };

    // Fonction pour obtenir les produits filtrés par catégorie ET type d'expédition
    const getFilteredProducts = (categoryId) => {
        if (!products || products.length === 0) {
            return [];
        }
        
        // Pour le type CA, filtrer uniquement les produits de la catégorie "Colis Accompagnés"
        if (formData.type_expedition === 'GROUPAGE_CA') {
            return products.filter(p => p.category && p.category.nom === 'Colis Accompagnés');
        }

        // Pour AFRIQUE et SIMPLE (LD), il n'y a pas de sélecteur de catégorie dans le
        // formulaire : on force l'affichage de tous les articles pour ne jamais avoir une
        // liste vide (un filtrage par category_id serait toujours vide car categoryId reste "")
        if (formData.type_expedition === 'GROUPAGE_AFRIQUE' || formData.type_expedition === 'SIMPLE') {
            return products;
        }

        // Pour les types DHD (Aérien/Maritime), filtrer par la catégorie sélectionnée
        if (!categoryId) {
            return [];
        }

        return products.filter(p => p.category_id === categoryId);
    };

    const handleSimulate = async () => {
        if (!formData.pays_destination || !formData.destinataire_ville) {
            toast.info("Veuillez renseigner le pays et la ville de destination.");
            return;
        }

        // Vérifier que chaque colis est complet (poids, désignation, au moins un article)
        const colisIncompletIndex = formData.colis.findIndex(c => !isColisComplete(c));
        if (colisIncompletIndex !== -1) {
            const c = formData.colis[colisIncompletIndex];
            const message = (!c.articles || c.articles.length === 0)
                ? `Colis #${colisIncompletIndex + 1} : veuillez sélectionner au moins un article.`
                : `Colis #${colisIncompletIndex + 1} : veuillez renseigner le poids et la désignation.`;
            toast.error(message);
            return;
        }

        const simulationPayload = {
            type_expedition: formData.type_expedition.toLowerCase(),
            pays_depart: formData.pays_depart,
            pays_destination: formData.pays_destination,
            code_pays_depart: formData.code_pays_depart || undefined,
            code_pays_destination: formData.code_pays_destination || undefined,
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
                    prix_estimation: parseFloat(c.prix_estimation) || 0,
                };

                // N'envoyer articles que s'il y en a, sous forme d'objets {designation}
                if (c.articles && c.articles.length > 0) {
                    item.articles = c.articles.map(a =>
                        typeof a === 'string' ? { designation: a } : a
                    );
                }

                if (c.category_id) item.category_id = c.category_id;

                item.code_colis = generateColisCode({
                    codeAgence: agencyData?.agence?.code_agence,
                    numeroColis: nextColisNumero + index,
                    typeExpedition: CODE_COLIS_TYPE_MAP[formData.type_expedition] || 'LD',
                });

                return item;
            })
        };
        simulateExpedition(simulationPayload);
        lastSimulatedColisRef.current = JSON.stringify(formData.colis);
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
                    prix_estimation: parseFloat(c.prix_estimation) || 0,
                };

                // N'envoyer articles que s'il y en a, sous forme d'objets {designation}
                if (c.articles && c.articles.length > 0) {
                    item.articles = c.articles.map(a =>
                        typeof a === 'string' ? { designation: a } : a
                    );
                }

                if (c.category_id) item.category_id = c.category_id;

                item.code_colis = generateColisCode({
                    codeAgence: agencyData?.agence?.code_agence,
                    numeroColis: nextColisNumero + index,
                    typeExpedition: CODE_COLIS_TYPE_MAP[formData.type_expedition] || 'LD',
                });

                return item;
            })
        };

        console.log("creation Payload (Clean):", payload);
        const result = await createExpedition(payload);

        // Si la création a réussi, activer le modal
        if (result?.payload && !result?.type?.includes('rejected')) {
            setShowSuccessModal(true);
        }

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

        // Marquer la référence comme récemment créée pour éviter notification auto-générée
        if (expeditionData?.reference) {
            markAsRecentlyCreated(expeditionData.reference);
        }

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

                await recordTransaction(transactionData);
            } catch (error) {
                console.error("Erreur lors de l'enregistrement de la transaction:", error);
                toast.error("Expédition créée mais erreur lors de l'enregistrement du paiement");
            }
        }
    };

    const totalWeight = formData.colis.reduce((sum, c) => sum + (parseFloat(c.poids) || 0), 0);
    const totalEmballage = formData.colis.reduce((sum, c) => sum + (parseFloat(c.prix_emballage) || 0), 0);

    const simulationTarif = useMemo(() => {
        if (!simulationResult) return null;
        return simulationResult.tarif || simulationResult.data?.tarif || null;
    }, [simulationResult]);

    // Le tarif simulé devient obsolète dès que les colis changent après coup
    // (poids, dimensions, articles…) : il faut alors recalculer avant de continuer
    const colisDirty = useMemo(() => {
        if (!simulationResult) return false;
        return JSON.stringify(formData.colis) !== lastSimulatedColisRef.current;
    }, [formData.colis, simulationResult]);

    // Chargement initial des données nécessaires au formulaire (produits, catégories,
    // tarifs, agence, dashboard) : évite d'afficher des listes vides le temps du fetch
    const initialLoading =
        (productStatus !== 'succeeded' && productStatus !== 'failed') ||
        (agencyStatus !== 'succeeded' && agencyStatus !== 'failed') ||
        (dashboardStatus !== 'succeeded' && dashboardStatus !== 'failed') ||
        tarifsLoading;

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

    // Liste lisible des champs qui bloquent encore le passage à l'étape 2
    const missingStep1Fields = [
        !formData.pays_destination && "pays de destination",
        !formData.destinataire_ville && "ville de destination",
    ].filter(Boolean);

    const canProceedToStep3 = () => {
        return formData.colis.every(isColisComplete) && simulationResult && !colisDirty;
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
            toast.info(colisDirty
                ? "Les colis ont été modifiés : veuillez recalculer le tarif avant de continuer"
                : "Veuillez enregistrer les colis et simuler le tarif");
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

    // Évite d'afficher un formulaire avec des listes vides (pays, catégories, tarifs…)
    // pendant que les données nécessaires sont encore en cours de chargement
    if (initialLoading) {
        return (
            <div className="min-h-screen bg-slate-100">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
                    <div className="flex items-center justify-between mb-4 sm:mb-8 gap-3">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-3 w-56 hidden sm:block" />
                        </div>
                        <Skeleton className="h-10 w-48 rounded-xl" />
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="p-4 sm:p-6 space-y-5">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-11 w-full" />
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-11 w-full" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Bandeau tarif mobile — affiché en bas quand simulationResult existe à l'étape 2 */}
            {step === 2 && simulationResult && (
                <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 text-white px-4 py-3 flex items-center justify-between shadow-lg ${colisDirty ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                    <div>
                        <p className={`text-[11px] font-medium ${colisDirty ? 'text-amber-100' : 'text-emerald-100'}`}>
                            {colisDirty ? 'Colis modifiés' : 'Total estimé'}
                        </p>
                        <p className="text-lg font-bold leading-tight">
                            {colisDirty
                                ? 'Tarif à recalculer'
                                : `${(parseFloat(simulationTarif?.montant_expedition || simulationResult?.total_price || 0) + totalEmballage).toLocaleString()} FCFA`}
                        </p>
                    </div>
                    <button
                        onClick={colisDirty ? handleSimulate : handleNextStep}
                        disabled={colisDirty ? (simulating || !formData.colis.every(isColisComplete)) : !canProceedToStep3()}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            (colisDirty ? !simulating : canProceedToStep3())
                                ? 'bg-white text-emerald-700 active:bg-emerald-50'
                                : 'bg-emerald-800/50 text-emerald-300 cursor-not-allowed'
                        }`}
                    >
                        {colisDirty ? 'Recalculer' : 'Continuer'}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            <div className={`min-h-screen bg-slate-100 ${step === 2 && simulationResult ? 'pb-20 lg:pb-0' : ''}`}>
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

                    {/* ── Header ── */}
                    <div className="mb-4 sm:mb-8">
                        <PageHeader
                            title="Nouvelle expédition"
                            subtitle={
                                <>
                                    <p className="hidden sm:block">Enregistrement et tarification des envois clients</p>
                                    <p className="text-[11px] text-slate-400 mt-1 hidden lg:block" aria-hidden="true">
                                        Raccourcis : <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500">Ctrl+S</kbd> simuler ·{' '}
                                        <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500">Ctrl+↵</kbd> valider ·{' '}
                                        <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500">Ctrl+←/→</kbd> naviguer
                                    </p>
                                </>
                            }
                            actions={
                                /* Stepper — compact sur mobile, complet sur desktop */
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
                            }
                        />
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
                                                { value: 'SIMPLE',                label: 'Livraison à domicile',           icon: '📦' },
                                                { value: 'GROUPAGE_DHD_AERIEN',   label: 'DHD Aérien',   icon: '✈️' },
                                                { value: 'GROUPAGE_DHD_MARITIME', label: 'DHD Maritime', icon: '🚢' },
                                                { value: 'GROUPAGE_AFRIQUE',      label: 'Afrique',      icon: '🌍' },
                                                { value: 'GROUPAGE_CA',           label: 'CA',           icon: '📮' },
                                            ].map(type => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, type_expedition: type.value }))}
                                                    aria-pressed={formData.type_expedition === type.value}
                                                    className={`relative p-2.5 sm:p-3 rounded-lg border-2 transition-all active:scale-95 ${
                                                        formData.type_expedition === type.value
                                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    {formData.type_expedition === type.value && (
                                                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-lg sm:text-xl">{type.icon}</span>
                                                        <span className={`text-[10px] sm:text-xs font-bold leading-tight text-center ${
                                                            formData.type_expedition === type.value ? 'text-indigo-700' : 'text-slate-600'
                                                        }`}>{type.label}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trajet/Pays disponible - Uniquement pour les types NON-SIMPLE */}
                                    {formData.type_expedition !== 'SIMPLE' && (
                                        <div className="space-y-1.5">
                                            <label htmlFor="route-select" className="block text-xs font-semibold text-slate-600">
                                                Trajet disponible
                                            </label>

                                            {formData.type_expedition === 'GROUPAGE_CA' ? (
                                                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
                                                    <svg className="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Non applicable pour les Colis Accompagnés — renseignez directement le pays et la ville de destination ci-dessous.
                                                </div>
                                            ) : (
                                                <SearchableDropdown
                                                    id="route-select"
                                                    options={availableRouteOptions}
                                                    onSelect={(option) => handleRouteSelect(option.id)}
                                                    placeholder={selectedRouteId
                                                        ? availableRouteOptions.find(r => r.id === selectedRouteId)?.label || "Rechercher un trajet..."
                                                        : "Rechercher un trajet..."}
                                                    className="w-full"
                                                    buttonClassName="h-11 text-sm font-medium"
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Destination + Départ — 2 colonnes sur mobile */}
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-lg border border-slate-200">
                                        <div className="space-y-1.5">
                                            <label htmlFor="pays_destination" className="block text-xs font-semibold text-slate-600">
                                                Pays destination <span className="text-amber-600">*</span>
                                            </label>
                                            {formData.type_expedition === 'SIMPLE' ? (
                                                <>
                                                    {/* Sélecteur de pays pour LD avec recherche */}
                                                    <SearchableDropdown
                                                        id="pays_destination"
                                                        options={availableCountriesForLD}
                                                        onSelect={(country) => {
                                                            setSelectedRouteId(country.id);

                                                            if (!country.zone) return;

                                                            // country.tarif peut être null si le pays n'est couvert
                                                            // que par le tarif de base du backoffice (pas encore
                                                            // personnalisé par l'agence) - le montant sera alors
                                                            // obtenu via la simulation API, qui applique déjà le
                                                            // même fallback côté backend.
                                                            setSelectedRoute(country.tarif || null);

                                                            // country.label garde l'abréviation pour l'affichage
                                                            // (ex: "Argentine(AR)"), mais on stocke le nom de
                                                            // pays propre - voir extractCountryName ci-dessus.
                                                            const paysName = extractCountryName(country.label);

                                                            setFormData(prev => ({
                                                                ...prev,
                                                                pays_destination: paysName,
                                                                code_pays_destination: country.code || "",
                                                                destinataire_ville: "",
                                                            }));
                                                        }}
                                                        placeholder={selectedRouteId ?
                                                            availableCountriesForLD.find(c => c.id === selectedRouteId)?.label || "Rechercher un pays..."
                                                            : "Rechercher un pays..."}
                                                        className="w-full"
                                                        buttonClassName="h-11 text-sm font-medium"
                                                    />
                                                    
                                                    {availableCountriesForLD.length === 0 && (
                                                        <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Aucun pays configuré
                                                        </p>
                                                    )}
                                                    {availableCountriesForLD.length > 0 && selectedRouteId && (
                                                        <p className="text-[10px] text-emerald-600 mt-1">
                                                            ✓ Pays sélectionné
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <SearchableDropdown
                                                    id="pays_destination"
                                                    options={allKnownCountries}
                                                    onSelect={(country) => {
                                                        const paysName = extractCountryName(country.label);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            pays_destination: paysName,
                                                            code_pays_destination: country.code || "",
                                                        }));
                                                    }}
                                                    placeholder={formData.pays_destination || "Rechercher un pays..."}
                                                    className="w-full"
                                                    buttonClassName="h-11 text-sm font-medium"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="destinataire_ville" className="block text-xs font-semibold text-slate-600">
                                                Ville destination <span className="text-amber-600">*</span>
                                            </label>
                                            <input
                                                id="destinataire_ville"
                                                type="text" name="destinataire_ville"
                                                value={formData.destinataire_ville} onChange={handleInputChange}
                                                placeholder="Paris…"
                                                className={inputCls(formData.destinataire_ville, true)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="pays_depart" className="block text-xs font-semibold text-slate-600">Pays départ</label>
                                            <SearchableDropdown
                                                id="pays_depart"
                                                options={allKnownCountries}
                                                onSelect={(country) => {
                                                    const paysName = extractCountryName(country.label);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        pays_depart: paysName,
                                                        code_pays_depart: country.code || "",
                                                        expediteur_pays: paysName,
                                                    }));
                                                }}
                                                placeholder={formData.pays_depart || "Rechercher un pays..."}
                                                className="w-full"
                                                buttonClassName="h-11 text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="expediteur_ville" className="block text-xs font-semibold text-slate-600">Ville départ</label>
                                            <input
                                                id="expediteur_ville"
                                                type="text" name="expediteur_ville"
                                                value={formData.expediteur_ville} onChange={handleInputChange}
                                                placeholder="Abidjan…"
                                                className={inputCls(formData.expediteur_ville)}
                                            />
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex flex-col items-end gap-1.5 pt-3 border-t border-slate-100">
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
                                        {missingStep1Fields.length > 0 && (
                                            <p className="text-[11px] text-amber-600">
                                                Champs requis manquants : {missingStep1Fields.join(', ')}
                                            </p>
                                        )}
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
                                            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
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
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => duplicateColis(index)}
                                                                className="text-xs text-slate-500 font-semibold flex items-center gap-1 py-1 px-2 rounded-md hover:bg-slate-100 active:bg-slate-200 transition-colors"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                                Dupliquer
                                                            </button>
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
                                                        
                                                        {/* Catégorie - Uniquement pour DHD (AERIEN et MARITIME) */}
                                                        {formData.type_expedition.includes('DHD') && (
                                                            <div className="space-y-1.5">
                                                                <label className="block text-xs font-semibold text-slate-600">
                                                                    Catégorie <span className="text-amber-600">*</span>
                                                                    <span className="text-xs text-slate-400 ml-2">
                                                                        ({filteredCategories.length} disponible{filteredCategories.length > 1 ? 's' : ''})
                                                                    </span>
                                                                </label>
                                                                <select
                                                                    value={colis.category_id}
                                                                    onChange={(e) => handleColisChange(index, 'category_id', e.target.value)}
                                                                    className={`w-full rounded-lg text-sm font-medium h-11 px-3 ${getInputBorderClass(colis.category_id, false)}`}
                                                                >
                                                                    <option value="">Sélectionner…</option>
                                                                    {filteredCategories?.map(cat => (
                                                                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                                                    ))}
                                                                </select>
                                                                {filteredCategories.length === 0 ? (
                                                                    <p className="text-xs text-amber-600 mt-1">⚠️ Aucune catégorie disponible pour ce trajet</p>
                                                                ) : !colis.category_id && (
                                                                    <p className="text-xs text-amber-600 mt-1">⚠️ Catégorie obligatoire pour DHD</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Poids (kg) <span className="text-amber-600">*</span></label>
                                                            <input 
                                                                type="number" 
                                                                step="0.1" 
                                                                inputMode="decimal" 
                                                                value={colis.poids}
                                                                onChange={(e) => handleColisChange(index, 'poids', e.target.value)}
                                                                onFocus={(e) => e.target.select()}
                                                                placeholder="0.0" 
                                                                className={inputCls(colis.poids, true)} 
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Long. (cm)</label>
                                                            <input 
                                                                type="number" 
                                                                step="0.1" 
                                                                inputMode="decimal" 
                                                                value={colis.longueur}
                                                                onChange={(e) => handleColisChange(index, 'longueur', e.target.value)}
                                                                onFocus={(e) => e.target.select()}
                                                                placeholder="0" 
                                                                className={inputCls(colis.longueur)} 
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Larg. (cm)</label>
                                                            <input 
                                                                type="number" 
                                                                step="0.1" 
                                                                inputMode="decimal" 
                                                                value={colis.largeur}
                                                                onChange={(e) => handleColisChange(index, 'largeur', e.target.value)}
                                                                onFocus={(e) => e.target.select()}
                                                                placeholder="0" 
                                                                className={inputCls(colis.largeur)} 
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Haut. (cm)</label>
                                                            <input 
                                                                type="number" 
                                                                step="0.1" 
                                                                inputMode="decimal" 
                                                                value={colis.hauteur}
                                                                onChange={(e) => handleColisChange(index, 'hauteur', e.target.value)}
                                                                onFocus={(e) => e.target.select()}
                                                                placeholder="0" 
                                                                className={inputCls(colis.hauteur)} 
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Emballage (FCFA)</label>
                                                            <input 
                                                                type="number" 
                                                                step="0" 
                                                                inputMode="numeric" 
                                                                value={colis.prix_emballage}
                                                                onChange={(e) => handleColisChange(index, 'prix_emballage', e.target.value)}
                                                                onFocus={(e) => e.target.select()}
                                                                placeholder="0" 
                                                                className={inputCls(colis.prix_emballage)} 
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                            <label className="block text-[11px] font-semibold text-slate-600">Estimation (FCFA)</label>
                                                            <input 
                                                                type="number" 
                                                                step="0" 
                                                                inputMode="numeric" 
                                                                value={colis.prix_estimation}
                                                                onChange={(e) => handleColisChange(index, 'prix_estimation', e.target.value)}
                                                                onFocus={(e) => e.target.select()}
                                                                placeholder="0" 
                                                                className={inputCls(colis.prix_estimation)} 
                                                            />
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
                                                                placeholder={
                                                                    formData.type_expedition === 'GROUPAGE_CA'
                                                                        ? "Rechercher un article (Colis Accompagnés)..."
                                                                        : (formData.type_expedition === 'SIMPLE' || formData.type_expedition === 'GROUPAGE_AFRIQUE')
                                                                            ? "Rechercher un article..."
                                                                            : (colis.category_id ? "Rechercher un article..." : "Sélectionnez d'abord une catégorie")
                                                                }
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
                                                                            aria-label={`Retirer l'article ${article}`}
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
                                                className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Ajouter un colis
                                            </button>

                                            {/* Résumé */}
                                            <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-200">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-semibold text-slate-700">Poids total :</span>
                                                    <span className="font-bold text-indigo-700">{totalWeight.toFixed(2)} kg</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm mt-1">
                                                    <span className="font-semibold text-slate-700">Frais d'emballage :</span>
                                                    <span className="font-bold text-indigo-700">{totalEmballage.toLocaleString()} FCFA</span>
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
                                                    disabled={simulating || !formData.colis.every(isColisComplete)}
                                                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 active:scale-95 ${
                                                        simulating || !formData.colis.every(isColisComplete)
                                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                                    }`}
                                                >
                                                    {simulating ? (
                                                        <>
                                                            <Spinner size="sm" color="current" />
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
                                            {colisDirty && (
                                                <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg flex items-start gap-2">
                                                    <svg className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <p className="text-xs font-semibold text-amber-800">
                                                        Les colis ont été modifiés depuis ce calcul. Le montant ci-dessous est obsolète — recalculez le tarif.
                                                    </p>
                                                </div>
                                            )}
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
                                            {colisDirty ? (
                                                <button
                                                    onClick={handleSimulate}
                                                    disabled={simulating || !formData.colis.every(isColisComplete)}
                                                    className="w-full mt-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 bg-white text-amber-700 hover:bg-amber-50 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {simulating ? <Spinner size="sm" color="current" /> : null}
                                                    Recalculer le tarif
                                                </button>
                                            ) : (
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
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Étape 3: Identifier les clients avec inputs uniformisés */}
                        {step === 3 && (
                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">Étape 3 — Clients</h2>
                                        <p className="text-xs text-slate-400">Expéditeur et destinataire</p>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 space-y-6">
                                    {/* Expéditeur */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-700">Expéditeur</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pl-0 sm:pl-8">
                                            <div className="space-y-1.5">
                                                <label htmlFor="expediteur_nom_prenom" className="block text-xs font-semibold text-slate-600">
                                                    Nom complet <span className="text-amber-600">*</span>
                                                </label>
                                                <input
                                                    id="expediteur_nom_prenom"
                                                    type="text"
                                                    name="expediteur_nom_prenom"
                                                    value={formData.expediteur_nom_prenom}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Jean Kouassi..."
                                                    className={inputCls(formData.expediteur_nom_prenom, true)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="expediteur_telephone" className="block text-xs font-semibold text-slate-600">
                                                    Téléphone <span className="text-amber-600">*</span>
                                                </label>
                                                <input
                                                    id="expediteur_telephone"
                                                    type="tel"
                                                    name="expediteur_telephone"
                                                    value={formData.expediteur_telephone}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: +225 07 XX XX XX XX..."
                                                    className={inputCls(formData.expediteur_telephone, true)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="expediteur_email" className="block text-xs font-semibold text-slate-600">Email</label>
                                                <input
                                                    id="expediteur_email"
                                                    type="email"
                                                    name="expediteur_email"
                                                    value={formData.expediteur_email}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: jean@example.com..."
                                                    className={inputCls(formData.expediteur_email, false)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="expediteur_adresse" className="block text-xs font-semibold text-slate-600">Adresse</label>
                                                <input
                                                    id="expediteur_adresse"
                                                    type="text"
                                                    name="expediteur_adresse"
                                                    value={formData.expediteur_adresse}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Cocody, Angré..."
                                                    className={inputCls(formData.expediteur_adresse, false)}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCopySenderToRecipient}
                                            disabled={!formData.expediteur_nom_prenom && !formData.expediteur_telephone}
                                            className="ml-0 sm:ml-8 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copier vers le destinataire
                                        </button>
                                    </div>

                                    {/* Destinataire */}
                                    <div className="space-y-4 pt-4 border-t border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-700">Destinataire</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pl-0 sm:pl-8">
                                            <div className="space-y-1.5">
                                                <label htmlFor="destinataire_nom_prenom" className="block text-xs font-semibold text-slate-600">
                                                    Nom complet <span className="text-amber-600">*</span>
                                                </label>
                                                <input
                                                    id="destinataire_nom_prenom"
                                                    type="text"
                                                    name="destinataire_nom_prenom"
                                                    value={formData.destinataire_nom_prenom}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Marie Dupont..."
                                                    className={inputCls(formData.destinataire_nom_prenom, true)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="destinataire_telephone" className="block text-xs font-semibold text-slate-600">
                                                    Téléphone <span className="text-amber-600">*</span>
                                                </label>
                                                <input
                                                    id="destinataire_telephone"
                                                    type="tel"
                                                    name="destinataire_telephone"
                                                    value={formData.destinataire_telephone}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: +33 6 XX XX XX XX..."
                                                    className={inputCls(formData.destinataire_telephone, true)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="destinataire_email" className="block text-xs font-semibold text-slate-600">Email</label>
                                                <input
                                                    id="destinataire_email"
                                                    type="email"
                                                    name="destinataire_email"
                                                    value={formData.destinataire_email}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: marie@example.com..."
                                                    className={inputCls(formData.destinataire_email, false)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="destinataire_adresse" className="block text-xs font-semibold text-slate-600">Adresse</label>
                                                <input
                                                    id="destinataire_adresse"
                                                    type="text"
                                                    name="destinataire_adresse"
                                                    value={formData.destinataire_adresse}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: 12 rue de la Paix..."
                                                    className={inputCls(formData.destinataire_adresse, false)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="destinataire_code_postal" className="block text-xs font-semibold text-slate-600">Code postal</label>
                                                <input
                                                    id="destinataire_code_postal"
                                                    type="text"
                                                    name="destinataire_code_postal"
                                                    value={formData.destinataire_code_postal}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: 75001..."
                                                    className={inputCls(formData.destinataire_code_postal, false)}
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
                                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 active:scale-95 ${
                                                canProceedToStep4()
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
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
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="lg:col-span-2">
                                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-800">Étape 4 — Paiement</h2>
                                                <p className="text-xs text-slate-400">Mode de paiement et finalisation</p>
                                            </div>
                                        </div>
                                        <div className="p-4 sm:p-6 space-y-6">
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
                                                        aria-pressed={formData.is_livraison_domicile}
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
                                                        onClick={() => setFormData(prev => ({ 
                                                            ...prev, 
                                                            is_paiement_credit: !prev.is_paiement_credit,
                                                            statut_paiement: !prev.is_paiement_credit ? 'en_attente' : 'paye'
                                                        }))}
                                                        aria-pressed={formData.is_paiement_credit}
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
                                                            aria-pressed={paymentMethod === 'cash'}
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
                                                            aria-pressed={paymentMethod === 'mobile_money'}
                                                            className={`p-4 rounded-lg border-2 transition-all active:scale-95 ${
                                                                paymentMethod === 'mobile_money'
                                                                    ? 'border-indigo-500 bg-indigo-50'
                                                                    : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                    paymentMethod === 'mobile_money' ? 'bg-indigo-100' : 'bg-slate-100'
                                                                }`}>
                                                                    <svg className={`w-5 h-5 ${paymentMethod === 'mobile_money' ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                                <span className={`text-xs font-semibold ${paymentMethod === 'mobile_money' ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                                    Mobile Money
                                                                </span>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={() => setPaymentMethod('bank_transfer')}
                                                            aria-pressed={paymentMethod === 'bank_transfer'}
                                                            className={`p-4 rounded-lg border-2 transition-all active:scale-95 ${
                                                                paymentMethod === 'bank_transfer'
                                                                    ? 'border-indigo-500 bg-indigo-50'
                                                                    : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                    paymentMethod === 'bank_transfer' ? 'bg-indigo-100' : 'bg-slate-100'
                                                                }`}>
                                                                    <svg className={`w-5 h-5 ${paymentMethod === 'bank_transfer' ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                    </svg>
                                                                </div>
                                                                <span className={`text-xs font-semibold ${paymentMethod === 'bank_transfer' ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                                    Virement
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>

                                                    {/* Référence pour Mobile Money */}
                                                    {paymentMethod === 'mobile_money' && (
                                                        <div className="space-y-1.5">
                                                            <label htmlFor="payment_reference" className="block text-xs font-semibold text-slate-600">
                                                                Référence de transaction
                                                            </label>
                                                            <input
                                                                id="payment_reference"
                                                                type="text"
                                                                value={paymentReference}
                                                                onChange={(e) => setPaymentReference(e.target.value)}
                                                                placeholder="Ex: MM123456789..."
                                                                className={inputCls(paymentReference, false)}
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
                                                    onClick={() => setShowSubmitConfirm(true)}
                                                    disabled={status === 'loading'}
                                                    className={`px-8 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                                        status === 'loading'
                                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg'
                                                    }`}
                                                >
                                                    {status === 'loading' ? (
                                                        <>
                                                            <Spinner size="sm" color="current" />
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

            {/* Confirmation avant création définitive de l'expédition */}
            <ConfirmationModal
                isOpen={showSubmitConfirm}
                onClose={() => setShowSubmitConfirm(false)}
                onConfirm={() => {
                    setShowSubmitConfirm(false);
                    handleSubmit();
                }}
                title="Confirmer l'expédition"
                message={
                    formData.is_paiement_credit
                        ? "Cette expédition sera enregistrée à crédit, sans encaissement immédiat. Confirmez-vous la création ?"
                        : `Un encaissement de ${(parseFloat(simulationTarif?.montant_expedition || simulationResult?.total_price || 0) + totalEmballage).toLocaleString()} FCFA sera enregistré. Confirmez-vous la création de cette expédition ?`
                }
                confirmText="Confirmer et créer"
                cancelText="Annuler"
                type="success"
                isLoading={status === 'loading'}
            />

            {/* Modal de succès */}
            {showSuccessModal && currentExpedition && (
                <PrintSuccessModal
                    expedition={currentExpedition}
                    agency={{
                        ...(agencyData?.agence || agencyData || {}),
                        logo: getLogoUrl(agencyData?.agence?.logo || agencyData?.logo)
                    }}
                    onClose={() => {
                        setShowSuccessModal(false);
                        resetStatus();
                        cleanSimulation();
                        clearCurrentExpedition();
                        navigate('/expeditions');
                    }}
                />
            )}
        </>
    );
};

export default CreateExpeditionV2;
