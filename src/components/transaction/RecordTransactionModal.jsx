import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  QuestionMarkCircleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ListBulletIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useExpedition } from '../../hooks/useExpedition';

/**
 * Composant Modal pour enregistrer une transaction financière
 * @param {Object} props
 * @param {boolean} props.isOpen - État d'ouverture du modal
 * @param {Function} props.onClose - Fonction de fermeture
 * @param {Function} props.onSubmit - Fonction de soumission (transactionData) => Promise
 * @param {string} props.expeditionId - UUID de l'expédition
 * @param {string} props.expeditionReference - Référence de l'expédition (pour affichage)
 * @param {number} props.defaultAmount - Montant par défaut
 * @param {string} props.defaultType - Type par défaut: 'encaissement' ou 'decaissement'
 * @param {string} props.defaultObject - Objet par défaut: 'montant_expedition', 'frais_annexes', etc.
 */
const RecordTransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  expeditionId,
  expeditionReference = '',
  defaultAmount = 0,
  defaultType = 'encaissement',
  defaultObject = 'frais_annexes'
}) => {
  // Hook pour les expéditions
  const { expeditions, loadExpeditions, status: expeditionsStatus } = useExpedition();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    type: defaultType,
    amount: defaultAmount || '',
    payment_method: 'cash',
    payment_object: defaultObject,
    reference: '',
    description: '',
    recorded_at: '',
    expedition_id_input: '' // Pour permettre la saisie manuelle de l'ID
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState({});
  const [foundExpedition, setFoundExpedition] = useState(null);
  const [showExpeditionList, setShowExpeditionList] = useState(false);
  const [expeditionsSearchQuery, setExpeditionsSearchQuery] = useState('');

  // Utiliser les expéditions du store Redux au lieu d'un état local
  const expeditionsList = expeditions || [];
  const loadingExpeditions = expeditionsStatus === 'loading';

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: defaultType,
        amount: defaultAmount || '',
        payment_method: 'cash',
        payment_object: defaultObject,
        reference: '',
        description: '',
        recorded_at: '',
        expedition_id_input: ''
      });
      setErrors({});
      setIsSubmitting(false);
      setFoundExpedition(null);
    }
  }, [isOpen, defaultType, defaultAmount, defaultObject]);

  // Méthodes de paiement disponibles
  const paymentMethods = [
    { value: 'cash', label: 'Espèces', icon: BanknotesIcon, color: 'emerald' },
    { value: 'mobile_money', label: 'Mobile Money', icon: DevicePhoneMobileIcon, color: 'blue' },
    { value: 'bank_transfer', label: 'Virement bancaire', icon: BuildingLibraryIcon, color: 'purple' },
    { value: 'other', label: 'Autre', icon: QuestionMarkCircleIcon, color: 'slate' }
  ];

  // Types de transaction
  const transactionTypes = [
    { value: 'encaissement', label: 'Encaissement', subtitle: 'Entrée d\'argent', icon: ArrowDownLeftIcon, color: 'emerald' },
    { value: 'decaissement', label: 'Décaissement', subtitle: 'Sortie d\'argent', icon: ArrowUpRightIcon, color: 'rose' }
  ];

  // Objets de paiement
  const paymentObjects = [
    { value: 'montant_expedition', label: 'Montant expédition', description: 'Frais de transport principal' },
    { value: 'frais_annexes', label: 'Frais annexes', description: 'Assurance, emballage, etc.' },
    { value: 'frais_enlevement', label: 'Frais d\'enlèvement', description: 'Collecte à domicile' },
    // { value: 'tout_compris', label: 'Frais d\'enlèvement', description: 'Collecte à domicile' },
    { value: 'frais_livraison', label: 'Frais de livraison', description: 'Livraison à domicile' },
    { value: 'remboursement', label: 'Remboursement', description: 'Retour de fonds' },
    { value: ' ', label: 'Autre', description: 'Autre type de transaction' }
  ];

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Sélectionnez un mode de paiement';
    }

    if (formData.payment_method !== 'cash' && !formData.reference) {
      newErrors.reference = 'La référence est obligatoire pour ce mode de paiement';
    }

    if (!formData.payment_object) {
      newErrors.payment_object = 'Sélectionnez l\'objet du paiement';
    }

    // Validation de la description si l'objet est "autre" ou vide
    if ((formData.payment_object === ' ' || formData.payment_object === 'autre' || !formData.payment_object) && 
        (!formData.description || formData.description.trim() === '')) {
      newErrors.description = 'La description est obligatoire pour l\'objet "Autre"';
    }

    // Validation du format UUID si un ID d'expédition est saisi
    // Note: La validation est désactivée car on supporte maintenant les références
    // qui seront converties en UUID automatiquement

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction de recherche intelligente (UUID ou Référence)
  const handleSearchExpedition = async () => {
    const inputValue = formData.expedition_id_input?.trim();
    if (!inputValue) {
      setFoundExpedition(null);
      setErrors(prev => ({ ...prev, expedition_id_input: undefined }));
      return;
    }

    // Regex pour détecter un UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Si c'est déjà un UUID valide, chercher dans la liste chargée
    if (uuidRegex.test(inputValue)) {
      const found = expeditionsList.find(exp => exp.id === inputValue);
      if (found) {
        setFoundExpedition({
          id: found.id,
          reference: found.reference,
          expediteur: found.expediteur?.nom_prenom,
          destinataire: found.destinataire?.nom_prenom,
          montant: found.montant_expedition
        });
        setErrors(prev => ({ ...prev, expedition_id_input: undefined }));
      } else {
        setFoundExpedition({ id: inputValue, reference: 'UUID fourni' });
        setErrors(prev => ({ ...prev, expedition_id_input: undefined }));
      }
      return;
    }

    // Sinon, c'est probablement une référence, chercher dans la liste locale d'abord
    setIsSearching(true);
    setErrors(prev => ({ ...prev, expedition_id_input: undefined }));

    try {
      // Charger les expéditions si pas encore chargées
      if (expeditionsList.length === 0) {
        await loadExpeditions({ page: 1, per_page: 50 }, true);
      }

      // Chercher dans la liste locale (plus rapide et évite les appels API)
      const found = expeditionsList.find(exp => 
        exp.reference?.toLowerCase() === inputValue.toLowerCase()
      );

      if (found) {
        setFoundExpedition({
          id: found.id,
          reference: found.reference,
          expediteur: found.expediteur?.nom_prenom,
          destinataire: found.destinataire?.nom_prenom,
          montant: found.montant_expedition
        });
        // Mettre à jour le champ avec l'UUID trouvé
        setFormData(prev => ({ ...prev, expedition_id_input: found.id }));
      } else {
        throw new Error('Expédition non trouvée');
      }
    } catch (error) {
      console.error('Erreur recherche expédition:', error);
      setFoundExpedition(null);
      setErrors(prev => ({ 
        ...prev, 
        expedition_id_input: `Expédition "${inputValue}" non trouvée. Vérifiez la référence.`
      }));
    } finally {
      setIsSearching(false);
    }
  };

  // Charger la liste des expéditions depuis le store Redux
  const loadExpeditionsList = async () => {
    try {
      // Utiliser le hook Redux pour charger les expéditions
      // On force le refresh pour avoir les données les plus récentes
      await loadExpeditions({ page: 1, per_page: 50 }, true);
    } catch (error) {
      console.error('Erreur chargement expéditions:', error);
    }
  };

  // Sélectionner une expédition depuis la liste
  const handleSelectExpedition = (expedition) => {
    setFoundExpedition({
      id: expedition.id,
      reference: expedition.reference,
      expediteur: expedition.expediteur?.nom_prenom,
      destinataire: expedition.destinataire?.nom_prenom,
      montant: expedition.montant_expedition
    });
    setFormData(prev => ({ ...prev, expedition_id_input: expedition.id }));
    setShowExpeditionList(false);
    setErrors(prev => ({ ...prev, expedition_id_input: undefined }));
  };

  // Ouvrir le modal de sélection
  const handleOpenExpeditionList = () => {
    setShowExpeditionList(true);
    if (expeditionsList.length === 0) {
      loadExpeditionsList();
    }
  };

  // Gestion de la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Construction des données selon le format API attendu
      const transactionData = {
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        payment_object: formData.payment_object,
        type: formData.type
      };

      // Ajouter expedition_id : soit celui passé en prop, soit celui saisi manuellement
      const finalExpeditionId = expeditionId || formData.expedition_id_input?.trim();
      if (finalExpeditionId) {
        transactionData.expedition_id = finalExpeditionId;
      }

      // Ajouter reference seulement si fournie
      if (formData.reference && formData.reference.trim()) {
        transactionData.reference = formData.reference.trim();
      }

      // Ajouter description seulement si fournie
      if (formData.description && formData.description.trim()) {
        transactionData.description = formData.description.trim();
      }

      // Ajouter recorded_at seulement si fournie (format: YYYY-MM-DD HH:mm:ss)
      if (formData.recorded_at) {
        // Convertir le format datetime-local vers le format attendu
        const dateObj = new Date(formData.recorded_at);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        transactionData.recorded_at = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      console.log('Données transaction à envoyer:', transactionData);

      await onSubmit(transactionData);
      // Le modal ne se ferme pas ici car c'est géré par onSubmit qui appelle onClose
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setErrors({ submit: error.message || 'Erreur lors de l\'enregistrement' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion des changements de champs
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Formater le montant
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0);
  };

  if (!isOpen) return null;

  // Filtrer les expéditions selon la recherche interne au modal
  const filteredExpeditions = expeditionsList.filter(exp => {
    if (!expeditionsSearchQuery) return true;
    const query = expeditionsSearchQuery.toLowerCase();
    return (
      exp.reference?.toLowerCase().includes(query) ||
      exp.expediteur?.nom_prenom?.toLowerCase().includes(query) ||
      exp.destinataire?.nom_prenom?.toLowerCase().includes(query) ||
      exp.id?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {/* Modal principal de transaction */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <BanknotesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 truncate">Enregistrer une transaction</h2>
                {expeditionReference && (
                  <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                    Expéd: <span className="font-semibold text-slate-700">{expeditionReference}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            
            {/* Type de transaction */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Type de transaction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {transactionTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange('type', type.value)}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? `border-${type.color}-500 bg-${type.color}-50`
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? `bg-${type.color}-100` : 'bg-slate-100'
                        }`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            isSelected ? `text-${type.color}-600` : 'text-slate-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-semibold truncate ${
                            isSelected ? `text-${type.color}-900` : 'text-slate-700'
                          }`}>
                            {type.label}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-500 truncate">{type.subtitle}</p>
                        </div>
                        {isSelected && (
                          <CheckCircleIcon className={`w-4 h-4 sm:w-5 sm:h-5 text-${type.color}-600 flex-shrink-0`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ID Expédition (si vide) */}
            {!expeditionId && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Expédition <span className="text-xs text-slate-500 font-normal">(optionnel)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.expedition_id_input}
                    onChange={(e) => {
                      handleChange('expedition_id_input', e.target.value);
                      setFoundExpedition(null); // Reset quand on modifie
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchExpedition();
                      }
                    }}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg text-sm focus:outline-none transition-colors ${
                      errors.expedition_id_input
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-500'
                        : foundExpedition
                        ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-500'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                    placeholder="EXP202605051539004158 ou UUID"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={handleOpenExpeditionList}
                    disabled={isSubmitting}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    title="Sélectionner depuis la liste"
                  >
                    <ListBulletIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Liste</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSearchExpedition}
                    disabled={isSearching || isSubmitting || !formData.expedition_id_input?.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="hidden sm:inline">Recherche...</span>
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Rechercher</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Affichage de l'expédition trouvée */}
                {foundExpedition && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-900">
                          Expédition trouvée : {foundExpedition.reference}
                        </p>
                        {foundExpedition.expediteur && (
                          <p className="text-[10px] text-emerald-700 mt-0.5">
                            De {foundExpedition.expediteur} → {foundExpedition.destinataire}
                            {foundExpedition.montant && ` • ${new Intl.NumberFormat('fr-FR').format(foundExpedition.montant)} CFA`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Erreur de recherche */}
                {errors.expedition_id_input && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-rose-600">
                    <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{errors.expedition_id_input}</span>
                  </div>
                )}

                {/* Message d'aide */}
                {/* {!foundExpedition && !errors.expedition_id_input && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-blue-700 flex items-start gap-1.5">
                      <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        Saisissez une <strong>référence</strong> (ex: EXP202605051539004158) ou un <strong>UUID</strong>, 
                        puis cliquez sur Rechercher. Ou cliquez sur <strong>Liste</strong> pour sélectionner. 
                        Laissez vide pour une transaction générale.
                      </span>
                    </p>
                  </div>
                )} */}
              </div>
            )}

            {/* Montant */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Montant <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className={`w-full px-3 py-2 pr-14 border-2 rounded-lg text-base sm:text-lg font-semibold focus:outline-none transition-colors ${
                    errors.amount
                      ? 'border-rose-300 bg-rose-50 focus:border-rose-500'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                  placeholder="0"
                  disabled={isSubmitting}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-semibold text-slate-400">
                  CFA
                </div>
              </div>
              {errors.amount && (
                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-rose-600">
                  <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{errors.amount}</span>
                </div>
              )}
              {formData.amount > 0 && !errors.amount && (
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                  Montant: <span className="font-semibold">{formatCurrency(formData.amount)} CFA</span>
                </p>
              )}
            </div>

            {/* Mode de paiement */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Mode de paiement <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = formData.payment_method === method.value;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => handleChange('payment_method', method.value)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `border-${method.color}-500 bg-${method.color}-50`
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 ${
                        isSelected ? `text-${method.color}-600` : 'text-slate-400'
                      }`} />
                      <p className={`text-[10px] sm:text-xs font-semibold text-center truncate ${
                        isSelected ? `text-${method.color}-900` : 'text-slate-600'
                      }`}>
                        {method.label}
                      </p>
                    </button>
                  );
                })}
              </div>
              {errors.payment_method && (
                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-rose-600">
                  <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{errors.payment_method}</span>
                </div>
              )}
            </div>

            {/* Référence (obligatoire si non-cash) */}
            {formData.payment_method !== 'cash' && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Référence de transaction <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => handleChange('reference', e.target.value)}
                  className={`w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none transition-colors ${
                    errors.reference
                      ? 'border-rose-300 bg-rose-50 focus:border-rose-500'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                  placeholder="Ex: OM-123456789, TRF-2024-001"
                  disabled={isSubmitting}
                />
                {errors.reference && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-rose-600">
                    <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{errors.reference}</span>
                  </div>
                )}
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                  Numéro de transaction Mobile Money, référence de virement, etc.
                </p>
              </div>
            )}

            {/* Objet du paiement */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Objet du paiement <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.payment_object}
                onChange={(e) => handleChange('payment_object', e.target.value)}
                className={`w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none transition-colors appearance-none bg-white ${
                  errors.payment_object
                    ? 'border-rose-300 bg-rose-50 focus:border-rose-500'
                    : 'border-slate-200 focus:border-blue-500'
                }`}
                disabled={isSubmitting}
              >
                {paymentObjects.map((obj) => (
                  <option key={obj.value} value={obj.value}>
                    {obj.label} - {obj.description}
                  </option>
                ))}
              </select>
              {errors.payment_object && (
                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-rose-600">
                  <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{errors.payment_object}</span>
                </div>
              )}
            </div>

            {/* Date d'enregistrement (optionnel) */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Date et heure <span className="text-xs text-slate-500 font-normal">(optionnel)</span>
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="datetime-local"
                  value={formData.recorded_at}
                  onChange={(e) => handleChange('recorded_at', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                Laissez vide pour utiliser la date et l'heure actuelles
              </p>
            </div>

            {/* Description (obligatoire si objet = "autre") */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Description {(formData.payment_object === ' ' || formData.payment_object === 'autre' || !formData.payment_object) ? (
                  <span className="text-rose-500">*</span>
                ) : (
                  <span className="text-xs text-slate-500 font-normal">(optionnel)</span>
                )}
              </label>
              <div className="relative">
                <DocumentTextIcon className="absolute left-2.5 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  className={`w-full pl-9 pr-3 py-2 border-2 rounded-lg text-sm focus:outline-none transition-colors resize-none ${
                    errors.description
                      ? 'border-rose-300 bg-rose-50 focus:border-rose-500'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                  placeholder={
                    (formData.payment_object === ' ' || formData.payment_object === 'autre' || !formData.payment_object)
                      ? "Précisez l'objet de cette transaction..."
                      : "Commentaire libre sur cette transaction..."
                  }
                  disabled={isSubmitting}
                />
              </div>
              {errors.description && (
                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-rose-600">
                  <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{errors.description}</span>
                </div>
              )}
              {(formData.payment_object === ' ' || formData.payment_object === 'autre' || !formData.payment_object) && (
                <p className="text-[10px] sm:text-xs text-blue-600 mt-1 flex items-start gap-1">
                  <InformationCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                  <span>La description est obligatoire pour l'objet "Autre"</span>
                </p>
              )}
            </div>

            {/* Erreur de soumission */}
            {errors.submit && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-rose-900">Erreur d'enregistrement</p>
                    <p className="text-[10px] sm:text-xs text-rose-700 mt-0.5">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-2 rounded-lg border-2 border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 sm:px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>

      {/* Modal de sélection d'expéditions */}
      {showExpeditionList && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header du modal de liste */}
            <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <ListBulletIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">Sélectionner une expédition</h3>
                </div>
                <button
                  onClick={() => setShowExpeditionList(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Champ de recherche dans le modal */}
              <div className="mt-3 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={expeditionsSearchQuery}
                  onChange={(e) => setExpeditionsSearchQuery(e.target.value)}
                  placeholder="Rechercher par référence, expéditeur, destinataire..."
                  className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Liste des expéditions */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingExpeditions ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Chargement des expéditions...</p>
                </div>
              ) : filteredExpeditions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <ListBulletIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    {expeditionsSearchQuery ? 'Aucune expédition trouvée' : 'Aucune expédition disponible'}
                  </p>
                  {expeditionsSearchQuery && (
                    <button
                      onClick={() => setExpeditionsSearchQuery('')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredExpeditions.map((expedition) => (
                    <button
                      key={expedition.id}
                      onClick={() => handleSelectExpedition(expedition)}
                      className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                              {expedition.reference}
                            </span>
                            {expedition.statut && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                expedition.statut === 'livre' ? 'bg-emerald-100 text-emerald-700' :
                                expedition.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                                expedition.statut === 'en_attente' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {expedition.statut.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 space-y-0.5">
                            {expedition.expediteur?.nom_prenom && (
                              <p>
                                <span className="text-slate-500">De:</span> <span className="font-medium">{expedition.expediteur.nom_prenom}</span>
                              </p>
                            )}
                            {expedition.destinataire?.nom_prenom && (
                              <p>
                                <span className="text-slate-500">À:</span> <span className="font-medium">{expedition.destinataire.nom_prenom}</span>
                              </p>
                            )}
                            {expedition.montant_expedition && (
                              <p className="text-slate-500">
                                Montant: <span className="font-semibold text-slate-700">{new Intl.NumberFormat('fr-FR').format(expedition.montant_expedition)} CFA</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer du modal de liste */}
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-600">
                {filteredExpeditions.length} expédition{filteredExpeditions.length > 1 ? 's' : ''} affichée{filteredExpeditions.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setShowExpeditionList(false)}
                className="px-4 py-2 rounded-lg border-2 border-slate-200 text-slate-700 text-xs font-semibold hover:bg-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecordTransactionModal;
