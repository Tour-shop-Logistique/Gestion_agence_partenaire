import React, { useState, useEffect } from "react";
import { useExpedition } from "../hooks/useExpedition";
import { useAgency } from "../hooks/useAgency";

const AddExpeditionModal = ({ isOpen, onClose }) => {
    const { createExpedition, loadProducts, products, status, error, message, resetStatus, loadExpeditions } = useExpedition();
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

    useEffect(() => {
        if (isOpen) {
            loadProducts();
            setCurrentStep(1);
        }
    }, [isOpen]);

    useEffect(() => {
        if (status === 'succeeded') {
            const timer = setTimeout(() => {
                resetStatus();
                loadExpeditions();
                onClose();
            }, 1500);
            return () => clearTimeout(timer);
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
        const payload = {
            ...formData,
            colis: formData.colis.map(c => ({
                ...c,
                poids: parseFloat(c.poids) || 0,
                longueur: parseFloat(c.longueur) || 0,
                largeur: parseFloat(c.largeur) || 0,
                hauteur: parseFloat(c.hauteur) || 0,
                prix_emballage: parseFloat(c.prix_emballage) || 0,
            }))
        };

        createExpedition(payload);
    };

    if (!isOpen) return null;

    const totalWeight = formData.colis.reduce((sum, c) => sum + (parseFloat(c.poids) || 0), 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Nouvelle Expédition</h2>
                        <p className="text-gray-500 text-sm">Remplissez les informations pour générer un bordereau</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    {/* Stepper Compact */}
                    <div className="max-w-md mx-auto mb-10">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                            {[1, 2].map(step => (
                                <div key={step} className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep >= step ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white text-gray-400 border-2 border-gray-200"
                                        }`}>
                                        {step}
                                    </div>
                                    <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${currentStep >= step ? "text-blue-600" : "text-gray-400"}`}>
                                        {step === 1 ? "Expédition & Contacts" : "Détails Colis"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {status === 'succeeded' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3 animate-bounce">
                            <span className="text-xl">✅</span>
                            <span className="font-bold">{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    {currentStep === 1 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                            {/* Colonne 1: Général & Expéditeur */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">Général</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, type_expedition: "simple" }))}
                                            className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${formData.type_expedition === "simple" ? "border-blue-600 bg-blue-50" : "border-gray-50 hover:border-gray-200"}`}
                                        >
                                            <span className="text-2xl">📦</span>
                                            <span className="text-xs font-bold text-gray-900">Simple</span>
                                        </button>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, type_expedition: "groupage" }))}
                                            className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${formData.type_expedition === "groupage" ? "border-blue-600 bg-blue-50" : "border-gray-50 hover:border-gray-200"}`}
                                        >
                                            <span className="text-2xl">🚛</span>
                                            <span className="text-xs font-bold text-gray-900">Groupage</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Départ</label>
                                            <select name="pays_depart" value={formData.pays_depart} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-md text-sm font-medium">
                                                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                                                <option value="France">France</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Destination</label>
                                            <select name="pays_destination" value={formData.pays_destination} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-md text-sm font-medium">
                                                <option value="France">France</option>
                                                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                                                <option value="Sénégal">Sénégal</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" name="is_livraison_domicile" checked={formData.is_livraison_domicile} onChange={handleInputChange} className="rounded-sm text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                            <span className="text-[11px] font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Domicile</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" name="is_paiement_credit" checked={formData.is_paiement_credit} onChange={handleInputChange} className="rounded-sm text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                            <span className="text-[11px] font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Crédit</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">Expéditeur</h3>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            name="expediteur_nom_prenom"
                                            value={formData.expediteur_nom_prenom}
                                            onChange={handleInputChange}
                                            placeholder="Nom & Prénom *"
                                            className="w-full border-b border-gray-100 py-2 focus:border-blue-600 transition-all font-bold placeholder:text-gray-300"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="tel"
                                                name="expediteur_telephone"
                                                value={formData.expediteur_telephone}
                                                onChange={handleInputChange}
                                                placeholder="Téléphone *"
                                                className="w-full border-b border-gray-100 py-2 focus:border-blue-600 transition-all text-sm placeholder:text-gray-300"
                                            />
                                            <input
                                                type="email"
                                                name="expediteur_email"
                                                value={formData.expediteur_email}
                                                onChange={handleInputChange}
                                                placeholder="Email"
                                                className="w-full border-b border-gray-100 py-2 focus:border-blue-600 transition-all text-sm placeholder:text-gray-300"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            name="expediteur_adresse"
                                            value={formData.expediteur_adresse}
                                            onChange={handleInputChange}
                                            placeholder="Adresse complète"
                                            className="w-full border-b border-gray-100 py-2 focus:border-blue-600 transition-all text-sm placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Colonne 2: Destinataire */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
                                    <h3 className="text-sm font-black text-green-600 uppercase tracking-widest mb-6">Destinataire</h3>
                                    <div className="space-y-6 flex-1">
                                        <input
                                            type="text"
                                            name="destinataire_nom_prenom"
                                            value={formData.destinataire_nom_prenom}
                                            onChange={handleInputChange}
                                            placeholder="Nom & Prénom *"
                                            className="w-full border-b border-gray-100 py-3 focus:border-blue-600 transition-all font-bold text-lg placeholder:text-gray-200"
                                        />
                                        <div className="grid grid-cols-2 gap-6">
                                            <input
                                                type="tel"
                                                name="destinataire_telephone"
                                                value={formData.destinataire_telephone}
                                                onChange={handleInputChange}
                                                placeholder="Téléphone *"
                                                className="w-full border-b border-gray-100 py-2 focus:border-blue-600 transition-all text-sm"
                                            />
                                            <input
                                                type="email"
                                                name="destinataire_email"
                                                value={formData.destinataire_email}
                                                onChange={handleInputChange}
                                                placeholder="Email"
                                                className="w-full border-b border-gray-100 py-2 focus:border-blue-600 transition-all text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <input
                                                type="text"
                                                name="destinataire_ville"
                                                value={formData.destinataire_ville}
                                                onChange={handleInputChange}
                                                placeholder="Ville *"
                                                className="w-full border-b border-gray-100 py-2 focus:border-blue-600 transition-all text-sm"
                                            />
                                            <input
                                                type="text"
                                                name="destinataire_code_postal"
                                                value={formData.destinataire_code_postal}
                                                onChange={handleInputChange}
                                                placeholder="Code Postal"
                                                className="w-full border-b border-gray-100 py-2 focus:border-blue-600 transition-all text-sm"
                                            />
                                        </div>
                                        <textarea
                                            name="destinataire_adresse"
                                            value={formData.destinataire_adresse}
                                            onChange={handleInputChange}
                                            placeholder="Adresse complète du destinataire..."
                                            rows="3"
                                            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300 pb-12">
                            {/* Recap Summary */}
                            <div className="bg-blue-600 rounded-xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex gap-6 items-center">
                                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-md">
                                        <span className="text-3xl">✈️</span>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">De: {formData.expediteur_nom_prenom}</p>
                                        <h4 className="text-xl font-black">Vers: {formData.destinataire_nom_prenom}</h4>
                                        <p className="text-blue-100 text-xs">{formData.destinataire_ville}, {formData.pays_destination}</p>
                                    </div>
                                </div>
                                <div className="bg-black/10 px-6 py-3 rounded-lg backdrop-blur-md border border-white/10 text-center">
                                    <p className="text-[10px] text-blue-200 font-bold uppercase">Nombre de Colis</p>
                                    <p className="text-2xl font-black">{formData.colis.length}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {formData.colis.map((c, index) => (
                                    <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="md:w-1/3">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center text-xs font-black">{index + 1}</span>
                                                    <h4 className="font-bold text-gray-900">Identification</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Désignation *</label>
                                                        <input
                                                            type="text"
                                                            value={c.designation}
                                                            onChange={(e) => handleColisChange(index, 'designation', e.target.value)}
                                                            placeholder="Ex: Effets personnels"
                                                            className="w-full border-b border-gray-100 py-1 focus:border-blue-600 transition-all font-medium text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Code de suivi interne</label>
                                                        <input
                                                            type="text"
                                                            value={c.code_colis}
                                                            onChange={(e) => handleColisChange(index, 'code_colis', e.target.value)}
                                                            placeholder="Ex: LD-001"
                                                            className="w-full border-b border-gray-100 py-1 focus:border-blue-600 transition-all text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:w-1/3 border-l border-gray-50 md:pl-6">
                                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                                                    Poids & Prix
                                                </h4>
                                                <div className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Poids (kg)</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={c.poids}
                                                                onChange={(e) => handleColisChange(index, 'poids', e.target.value)}
                                                                className="w-full border-b border-gray-100 py-1 font-black text-blue-600 text-lg"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Emballage</label>
                                                            <input
                                                                type="number"
                                                                value={c.prix_emballage}
                                                                onChange={(e) => handleColisChange(index, 'prix_emballage', e.target.value)}
                                                                className="w-full border-b border-gray-100 py-1 font-bold text-gray-900"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:w-1/3 border-l border-gray-50 md:pl-6">
                                                <h4 className="font-bold text-gray-900 mb-4">Dimensions (cm)</h4>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="text-[8px] font-black text-gray-300 uppercase">Long.</label>
                                                        <input type="number" value={c.longueur} onChange={(e) => handleColisChange(index, 'longueur', e.target.value)} className="w-full bg-gray-50 border-none rounded-md p-2 text-center text-xs" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[8px] font-black text-gray-300 uppercase">Larg.</label>
                                                        <input type="number" value={c.largeur} onChange={(e) => handleColisChange(index, 'largeur', e.target.value)} className="w-full bg-gray-50 border-none rounded-md p-2 text-center text-xs" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[8px] font-black text-gray-300 uppercase">Haut.</label>
                                                        <input type="number" value={c.hauteur} onChange={(e) => handleColisChange(index, 'hauteur', e.target.value)} className="w-full bg-gray-50 border-none rounded-md p-2 text-center text-xs" />
                                                    </div>
                                                </div>
                                            </div>

                                            {formData.colis.length > 1 && (
                                                <button onClick={() => removeColis(index)} className="absolute top-4 right-4 text-red-200 hover:text-red-500 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Articles Section if Groupage */}
                                        {formData.type_expedition === "groupage" && (
                                            <div className="mt-6 pt-6 border-t border-gray-50">
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block">Articles détaillés</label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {products.map(product => (
                                                        <label key={product.id} className={`flex flex-col p-3 rounded-lg border transition-all cursor-pointer ${c.articles.includes(product.id) ? "border-blue-600 bg-blue-50/50" : "border-gray-100 bg-white hover:border-gray-200"
                                                            }`}>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-bold truncate pr-2">{product.designation}</span>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={c.articles.includes(product.id)}
                                                                    onChange={(e) => {
                                                                        const newArticles = e.target.checked
                                                                            ? [...c.articles, product.id]
                                                                            : c.articles.filter(id => id !== product.id);
                                                                        handleColisChange(index, 'articles', newArticles);
                                                                    }}
                                                                    className="rounded-sm text-blue-600 w-3 h-3"
                                                                />
                                                            </div>
                                                            <span className="text-[8px] text-gray-400 font-medium">{product.reference}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <button
                                    onClick={addColis}
                                    className="w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    Ajouter un autre colis pour cette destination
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="px-8 py-6 bg-white border-t border-gray-100 flex justify-between items-center sticky bottom-0 z-10">
                    <div className="hidden md:block">
                        {currentStep === 2 && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Poids total</p>
                                    <p className="text-lg font-black text-gray-900">{totalWeight} KG</p>
                                </div>
                                <div className="w-px h-8 bg-gray-100"></div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Expédition</p>
                                    <p className="text-sm font-bold text-blue-600">{formData.type_expedition.toUpperCase()}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        {currentStep === 1 ? (
                            <>
                                <button
                                    onClick={onClose}
                                    className="flex-1 md:flex-none px-8 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="flex-1 md:flex-none px-10 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Suivant
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                                >
                                    Retour
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={status === 'loading'}
                                    className="flex-1 md:flex-none px-12 py-3 bg-green-600 text-white rounded-lg font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Enregistrement...
                                        </>
                                    ) : "Confirmer l'expédition"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes in {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-in {
                    animation: in 0.3s ease-out forwards;
                }
            `}} />
        </div>
    );
};

export default AddExpeditionModal;
