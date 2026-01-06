import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useExpedition } from "../hooks/useExpedition";
import { useAgency } from "../hooks/useAgency";

const CreateExpedition = () => {
    const navigate = useNavigate();
    const { createExpedition, loadProducts, products, status, error, message, resetStatus } = useExpedition();
    const { data: agencyData } = useAgency();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        type_expedition: "simple",
        pays_depart: "Côte d'Ivoire",
        pays_destination: "France",
        is_paiement_credit: false,
        is_livraison_domicile: true,
        statut_paiement: "en_attente",

        // Expéditeur
        expediteur_nom_prenom: "",
        expediteur_telephone: "",
        expediteur_email: "",
        expediteur_adresse: "",
        expediteur_ville: "",
        expediteur_pays: "Côte d'Ivoire",
        expediteur_societe: "",
        expediteur_code_postal: "",
        expediteur_etat: "",
        expediteur_quartier: "",

        // Destinataire
        destinataire_nom_prenom: "",
        destinataire_telephone: "",
        destinataire_email: "",
        destinataire_adresse: "",
        destinataire_ville: "",
        destinataire_pays: "France",
        destinataire_code_postal: "",
        destinataire_etat: "",
        destinataire_quartier: "",

        colis: [
            {
                code_colis: "",
                designation: "",
                poids: "",
                longueur: "",
                largeur: "",
                hauteur: "",
                prix_emballage: 0,
                articles: []
            }
        ]
    });

    const [expandedSender, setExpandedSender] = useState(true);
    const [expandedReceiver, setExpandedReceiver] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        if (status === 'succeeded') {
            setTimeout(() => {
                resetStatus();
                navigate("/dashboard");
            }, 2000);
        }
    }, [status]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleColisChange = (index, field, value) => {
        const newColis = [...formData.colis];
        newColis[index] = { ...newColis[index], [field]: value };
        setFormData(prev => ({ ...prev, colis: newColis }));
    };

    const addColis = () => {
        setFormData(prev => ({
            ...prev,
            colis: [
                ...prev.colis,
                {
                    code_colis: "",
                    designation: "",
                    poids: "",
                    longueur: "",
                    largeur: "",
                    hauteur: "",
                    prix_emballage: 0,
                    articles: []
                }
            ]
        }));
    };

    const removeColis = (index) => {
        if (formData.colis.length > 1) {
            const newColis = formData.colis.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, colis: newColis }));
        }
    };

    const handleSubmit = async () => {
        // Préparer le payload final
        const payload = {
            ...formData,
            // Convertir les nombres
            colis: formData.colis.map(c => ({
                ...c,
                poids: parseFloat(c.poids) || 0,
                longueur: parseFloat(c.longueur) || 0,
                largeur: parseFloat(c.largeur) || 0,
                hauteur: parseFloat(c.hauteur) || 0,
                prix_emballage: parseFloat(c.prix_emballage) || 0,
            }))
        };

        await createExpedition(payload);
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const totalWeight = formData.colis.reduce((sum, c) => sum + (parseFloat(c.poids) || 0), 0);

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto pb-20">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Nouvelle Expédition</h1>
                    <p className="text-gray-500">Enregistrer un nouveau colis pour votre agence</p>
                </div>

                {/* Stepper */}
                <div className="mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                        {[1, 2, 3, 4].map(step => (
                            <div key={step} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= step ? "bg-blue-600 text-white shadow-lg scale-110" : "bg-white text-gray-400 border-2 border-gray-200"
                                    }`}>
                                    {step}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${currentStep >= step ? "text-blue-600" : "text-gray-400"}`}>
                                    {step === 1 && "Type"}
                                    {step === 2 && "Contacts"}
                                    {step === 3 && "Colis"}
                                    {step === 4 && "Récap"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                {message && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">{message}</div>}
                {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* STEP 1: Type & Params */}
                    {currentStep === 1 && (
                        <div className="p-8 space-y-8 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, type_expedition: "simple" }))}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${formData.type_expedition === "simple" ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-gray-200"
                                        }`}
                                >
                                    <span className="text-3xl">📦</span>
                                    <span className="font-bold text-gray-900">Simple (LD)</span>
                                    <p className="text-xs text-center text-gray-500">Un colis sans détail de produits</p>
                                </button>
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, type_expedition: "groupage" }))}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${formData.type_expedition === "groupage" ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-gray-200"
                                        }`}
                                >
                                    <span className="text-3xl">🚛</span>
                                    <span className="font-bold text-gray-900">Groupage</span>
                                    <p className="text-xs text-center text-gray-500">Plusieurs colis avec articles détaillés</p>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pays de départ</label>
                                    <select
                                        name="pays_depart"
                                        value={formData.pays_depart}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                                        <option value="France">France</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pays de destination</label>
                                    <select
                                        name="pays_destination"
                                        value={formData.pays_destination}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        <option value="France">France</option>
                                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                                        <option value="Sénégal">Sénégal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 p-4 bg-gray-50 rounded-2xl">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="is_livraison_domicile"
                                            checked={formData.is_livraison_domicile}
                                            onChange={handleInputChange}
                                            className="peer sr-only"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Livraison à domicile</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="is_paiement_credit"
                                            checked={formData.is_paiement_credit}
                                            onChange={handleInputChange}
                                            className="peer sr-only"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Paiement à crédit</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Contacts */}
                    {currentStep === 2 && (
                        <div className="p-8 space-y-6 animate-fadeIn">
                            {/* Expéditeur */}
                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setExpandedSender(!expandedSender)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                                        <span className="font-bold text-gray-900">Information Expéditeur</span>
                                    </div>
                                    <span>{expandedSender ? "🔼" : "🔽"}</span>
                                </button>
                                {expandedSender && (
                                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100">
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nom & Prénom *</label>
                                            <input
                                                type="text"
                                                name="expediteur_nom_prenom"
                                                value={formData.expediteur_nom_prenom}
                                                onChange={handleInputChange}
                                                placeholder="Jean Dupont"
                                                className="w-full mt-1 border-b-2 border-gray-100 py-2 focus:border-blue-600 transition-all text-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Téléphone *</label>
                                            <input
                                                type="tel"
                                                name="expediteur_telephone"
                                                value={formData.expediteur_telephone}
                                                onChange={handleInputChange}
                                                className="w-full mt-1 border-b-2 border-gray-100 py-2 focus:border-blue-600 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                                            <input
                                                type="email"
                                                name="expediteur_email"
                                                value={formData.expediteur_email}
                                                onChange={handleInputChange}
                                                className="w-full mt-1 border-b-2 border-gray-100 py-2 focus:border-blue-600 transition-all"
                                            />
                                        </div>
                                        <div className="sm:col-span-2 pt-4">
                                            <h4 className="text-sm font-bold text-blue-600 mb-4">Adresse avancée</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="text-xs text-gray-500">Adresse complète</label>
                                                    <input type="text" name="expediteur_adresse" value={formData.expediteur_adresse} onChange={handleInputChange} className="w-full mt-1 border-b border-gray-200 py-1" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Ville</label>
                                                    <input type="text" name="expediteur_ville" value={formData.expediteur_ville} onChange={handleInputChange} className="w-full mt-1 border-b border-gray-200 py-1" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Quartier</label>
                                                    <input type="text" name="expediteur_quartier" value={formData.expediteur_quartier} onChange={handleInputChange} className="w-full mt-1 border-b border-gray-200 py-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Destinataire */}
                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setExpandedReceiver(!expandedReceiver)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">2</span>
                                        <span className="font-bold text-gray-900">Information Destinataire</span>
                                    </div>
                                    <span>{expandedReceiver ? "🔼" : "🔽"}</span>
                                </button>
                                {expandedReceiver && (
                                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100">
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nom & Prénom *</label>
                                            <input
                                                type="text"
                                                name="destinataire_nom_prenom"
                                                value={formData.destinataire_nom_prenom}
                                                onChange={handleInputChange}
                                                className="w-full mt-1 border-b-2 border-gray-100 py-2 focus:border-blue-600 transition-all text-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Téléphone *</label>
                                            <input
                                                type="tel"
                                                name="destinataire_telephone"
                                                value={formData.destinataire_telephone}
                                                onChange={handleInputChange}
                                                className="w-full mt-1 border-b-2 border-gray-100 py-2 focus:border-blue-600 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                                            <input
                                                type="email"
                                                name="destinataire_email"
                                                value={formData.destinataire_email}
                                                onChange={handleInputChange}
                                                className="w-full mt-1 border-b-2 border-gray-100 py-2 focus:border-blue-600 transition-all"
                                            />
                                        </div>
                                        <div className="sm:col-span-2 pt-4">
                                            <h4 className="text-sm font-bold text-green-600 mb-4">Adresse avancée</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="text-xs text-gray-500">Adresse complète</label>
                                                    <input type="text" name="destinataire_adresse" value={formData.destinataire_adresse} onChange={handleInputChange} className="w-full mt-1 border-b border-gray-200 py-1" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Ville</label>
                                                    <input type="text" name="destinataire_ville" value={formData.destinataire_ville} onChange={handleInputChange} className="w-full mt-1 border-b border-gray-200 py-1" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Code Postal</label>
                                                    <input type="text" name="destinataire_code_postal" value={formData.destinataire_code_postal} onChange={handleInputChange} className="w-full mt-1 border-b border-gray-200 py-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Colis */}
                    {currentStep === 3 && (
                        <div className="p-8 space-y-6 animate-fadeIn">
                            {formData.colis.map((c, index) => (
                                <div key={index} className="relative p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <span className="text-xl">📦</span> Colis #{index + 1}
                                        </h3>
                                        {formData.colis.length > 1 && (
                                            <button onClick={() => removeColis(index)} className="text-red-500 text-sm font-medium hover:underline">Supprimer</button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Désignation *</label>
                                            <input
                                                type="text"
                                                value={c.designation}
                                                onChange={(e) => handleColisChange(index, 'designation', e.target.value)}
                                                placeholder="Ex: Vêtements, Électronique..."
                                                className="w-full mt-1 border-b-2 border-gray-200 py-2 bg-transparent focus:border-blue-600 transition-all text-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Code Colis</label>
                                            <input
                                                type="text"
                                                value={c.code_colis}
                                                onChange={(e) => handleColisChange(index, 'code_colis', e.target.value)}
                                                placeholder="LD-001"
                                                className="w-full mt-1 border-b border-gray-200 py-1 bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Poids (kg) *</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={c.poids}
                                                onChange={(e) => handleColisChange(index, 'poids', e.target.value)}
                                                className="w-full mt-1 border-b border-gray-200 py-1 bg-transparent"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Dimensions (cm)</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <input type="number" placeholder="L" value={c.longueur} onChange={(e) => handleColisChange(index, 'longueur', e.target.value)} className="w-full border-b border-gray-200 py-1 bg-transparent text-center" />
                                                <input type="number" placeholder="l" value={c.largeur} onChange={(e) => handleColisChange(index, 'largeur', e.target.value)} className="w-full border-b border-gray-200 py-1 bg-transparent text-center" />
                                                <input type="number" placeholder="H" value={c.hauteur} onChange={(e) => handleColisChange(index, 'hauteur', e.target.value)} className="w-full border-b border-gray-200 py-1 bg-transparent text-center" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Prix emballage</label>
                                            <input
                                                type="number"
                                                value={c.prix_emballage}
                                                onChange={(e) => handleColisChange(index, 'prix_emballage', e.target.value)}
                                                className="w-full mt-1 border-b border-gray-200 py-1 bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Articles if Groupage */}
                                    {formData.type_expedition === "groupage" && (
                                        <div className="mt-8 pt-8 border-t border-gray-200">
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-4 block">Articles dans ce colis</label>
                                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                                                {products.map(product => (
                                                    <label key={product.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-blue-400 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            checked={c.articles.includes(product.id)}
                                                            onChange={(e) => {
                                                                const newArticles = e.target.checked
                                                                    ? [...c.articles, product.id]
                                                                    : c.articles.filter(id => id !== product.id);
                                                                handleColisChange(index, 'articles', newArticles);
                                                            }}
                                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-gray-900">{product.designation}</p>
                                                            <p className="text-xs text-gray-500">{product.reference}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                                {products.length === 0 && <p className="text-sm text-gray-400 italic">Aucun produit disponible</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <button
                                onClick={addColis}
                                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold hover:border-blue-400 hover:text-blue-600 transition-all"
                            >
                                + Ajouter un colis
                            </button>
                        </div>
                    )}

                    {/* STEP 4: Recap */}
                    {currentStep === 4 && (
                        <div className="p-8 space-y-8 animate-fadeIn">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 uppercase">Récapitulatif</h3>
                                    <p className="text-gray-500">Vérifiez les informations avant validation</p>
                                </div>
                                <div className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold text-sm">
                                    {formData.type_expedition.toUpperCase()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">De</h4>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="font-bold text-gray-900">{formData.expediteur_nom_prenom}</p>
                                        <p className="text-sm text-gray-600">{formData.expediteur_telephone}</p>
                                        <p className="text-sm text-gray-500 mt-2">{formData.expediteur_adresse}, {formData.expediteur_ville}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">À</h4>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="font-bold text-gray-900">{formData.destinataire_nom_prenom}</p>
                                        <p className="text-sm text-gray-600">{formData.destinataire_telephone}</p>
                                        <p className="text-sm text-gray-500 mt-2">{formData.destinataire_adresse}, {formData.destinataire_ville}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Détails des colis</h4>
                                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                                    {formData.colis.map((c, i) => (
                                        <div key={i} className="p-4 flex justify-between items-center bg-white">
                                            <div>
                                                <p className="font-bold text-gray-900">{c.designation || "Colis sans nom"}</p>
                                                <p className="text-xs text-gray-500">{c.poids || 0} kg • {c.longueur || 0}x{c.largeur || 0}x{c.hauteur || 0} cm</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-blue-600">{c.prix_emballage || 0} FCFA</p>
                                                <p className="text-xs text-gray-400">Emballage</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-4 bg-blue-50 flex justify-between items-center">
                                        <span className="font-bold text-blue-900">Total</span>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-blue-700">{totalWeight} KG</p>
                                            <p className="text-xs text-blue-600">{formData.colis.length} colis</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Navigation */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        {currentStep > 1 ? (
                            <button
                                onClick={prevStep}
                                className="px-6 py-3 text-gray-600 font-bold hover:text-gray-900 transition-colors"
                            >
                                ← Précédent
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {currentStep < 4 ? (
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                            >
                                Suivant →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={status === 'loading'}
                                className="px-10 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                {status === 'loading' ? "Enregistrement..." : "Confirmer & Enregistrer"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}} />
        </DashboardLayout>
    );
};

export default CreateExpedition;
