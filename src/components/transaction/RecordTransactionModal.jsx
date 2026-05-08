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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

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
  // États du formulaire
  const [formData, setFormData] = useState({
    type: defaultType,
    amount: defaultAmount || '',
    payment_method: 'cash',
    payment_object: defaultObject,
    reference: '',
    description: '',
    recorded_at: '',
    expedition_reference: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
        expedition_reference: ''
      });
      setErrors({});
      setIsSubmitting(false);
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
    { value: 'frais_livraison', label: 'Frais de livraison', description: 'Livraison à domicile' },
    { value: 'remboursement', label: 'Remboursement', description: 'Retour de fonds' },
    { value: 'autre', label: 'Autre', description: 'Autre type de transaction' }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        expedition_id: expeditionId,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        payment_object: formData.payment_object,
        type: formData.type,
        ...(formData.reference && { reference: formData.reference }),
        ...(formData.description && { description: formData.description }),
        ...(formData.recorded_at && { recorded_at: formData.recorded_at })
      };

      await onSubmit(transactionData);
      onClose();
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

  return (
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

            {/* Référence expédition (si vide) */}
            {!expeditionId && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Référence expédition <span className="text-xs text-slate-500 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={formData.expedition_reference || ''}
                  onChange={(e) => handleChange('expedition_reference', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: EXP-2024-001"
                  disabled={isSubmitting}
                />
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                  Laissez vide pour une transaction générale
                </p>
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

            {/* Description (optionnel) */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Description <span className="text-xs text-slate-500 font-normal">(optionnel)</span>
              </label>
              <div className="relative">
                <DocumentTextIcon className="absolute left-2.5 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Commentaire libre sur cette transaction..."
                  disabled={isSubmitting}
                />
              </div>
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
  );
};

export default RecordTransactionModal;
