import React, { useState } from 'react';
import { BanknotesIcon, PlusIcon } from '@heroicons/react/24/outline';
import RecordTransactionModal from './RecordTransactionModal';
import { useExpedition } from '../../hooks/useExpedition';
import { toast } from '../../utils/toast';

/**
 * Bouton pour déclencher l'enregistrement d'une transaction
 * @param {Object} props
 * @param {string} props.expeditionId - UUID de l'expédition
 * @param {string} props.expeditionReference - Référence de l'expédition
 * @param {number} props.defaultAmount - Montant par défaut
 * @param {string} props.defaultType - Type par défaut: 'encaissement' ou 'decaissement'
 * @param {string} props.defaultObject - Objet par défaut
 * @param {string} props.variant - Style du bouton: 'primary', 'secondary', 'danger', 'success'
 * @param {string} props.size - Taille: 'sm', 'md', 'lg'
 * @param {string} props.label - Texte du bouton
 * @param {boolean} props.showIcon - Afficher l'icône
 * @param {Function} props.onSuccess - Callback après succès
 * @param {string} props.className - Classes CSS additionnelles
 */
const RecordTransactionButton = ({
  expeditionId,
  expeditionReference = '',
  defaultAmount = 0,
  defaultType = 'encaissement',
  defaultObject = 'frais_annexes',
  variant = 'primary',
  size = 'md',
  label = 'Enregistrer paiement',
  showIcon = true,
  onSuccess,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { recordTransaction } = useExpedition();

  // Styles selon la variante
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
  };

  // Styles selon la taille
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleSubmit = async (transactionData) => {
    try {
      await recordTransaction(transactionData);
      toast.success('Transaction enregistrée avec succès');
      setIsModalOpen(false);
      
      // Callback de succès
      if (onSuccess) {
        onSuccess(transactionData);
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
      throw error;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          inline-flex items-center justify-center gap-2 
          rounded-lg border-2 font-semibold 
          transition-all shadow-sm hover:shadow-md
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant] || variantStyles.primary}
          ${sizeStyles[size] || sizeStyles.md}
          ${className}
        `}
      >
        {showIcon && (
          <BanknotesIcon className={iconSizes[size] || iconSizes.md} />
        )}
        <span>{label}</span>
      </button>

      <RecordTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        expeditionId={expeditionId}
        expeditionReference={expeditionReference}
        defaultAmount={defaultAmount}
        defaultType={defaultType}
        defaultObject={defaultObject}
      />
    </>
  );
};

export default RecordTransactionButton;
