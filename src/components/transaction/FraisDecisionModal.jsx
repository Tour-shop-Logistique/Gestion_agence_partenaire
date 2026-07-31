import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Spinner from '../common/Spinner';
import RecordTransactionModal from './RecordTransactionModal';
import { decisionFraisAnnexes } from '../../store/slices/expeditionSlice';
import { recordTransaction } from '../../store/slices/expeditionSlice';
import { toast } from '../../utils/toast';
import {
  XMarkIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/**
 * Écran de décision bloquant affiché à l'agence de départ dès que le
 * backoffice fixe des frais annexes sur une de ses expéditions (event
 * temps réel "frais_annexes_updated"). L'agence doit choisir explicitement
 * entre "le client a payé maintenant" ou "à percevoir à l'arrivée" avant
 * que le backoffice puisse confirmer le départ de l'expédition.
 *
 * Monté globalement (voir App.jsx) : reste affichable/relançable depuis
 * n'importe quelle page tant qu'une décision est en attente.
 */
const FraisDecisionModal = ({ expedition, onClose }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  if (!expedition) return null;

  const montant = Number(expedition.frais_annexes || 0);

  const handleAPercevoirArrivee = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(decisionFraisAnnexes({ id: expedition.id, decision: 'a_percevoir_arrivee' })).unwrap();
      toast.success('Décision enregistrée : frais à percevoir à l\'arrivée.');
      onClose();
    } catch (error) {
      toast.error(error?.message || error || 'Erreur lors de l\'enregistrement de la décision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientAPaye = () => {
    setShowTransactionModal(true);
  };

  const handleTransactionSubmit = async (transactionData) => {
    setIsSubmitting(true);
    try {
      await dispatch(recordTransaction({
        ...transactionData,
        expedition_id: expedition.id,
        payment_object: 'frais_annexes',
        type: 'encaissement',
      })).unwrap();

      await dispatch(decisionFraisAnnexes({ id: expedition.id, decision: 'paye_maintenant' })).unwrap();

      toast.success('Décision enregistrée : frais annexes payés par le client.');
      setShowTransactionModal(false);
      onClose();
    } catch (error) {
      toast.error(error?.message || error || 'Erreur lors de l\'enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showTransactionModal) {
    return (
      <RecordTransactionModal
        isOpen={true}
        onClose={() => setShowTransactionModal(false)}
        onSubmit={handleTransactionSubmit}
        expeditionId={expedition.id}
        expeditionReference={expedition.reference}
        defaultAmount={montant}
        defaultType="encaissement"
        defaultObject="frais_annexes"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">Frais annexes à régler</h2>
              <p className="text-xs text-slate-500 truncate">Réf : {expedition.reference}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Le backoffice a fixé des frais annexes sur cette expédition. Le départ ne pourra être confirmé
            qu'une fois votre décision enregistrée.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Montant des frais</span>
            <span className="text-lg font-bold text-slate-900">
              {montant.toLocaleString('fr-FR')} <span className="text-xs text-slate-500">CFA</span>
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleClientAPaye}
              disabled={isSubmitting}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <BanknotesIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-emerald-900">Le client a payé</p>
                <p className="text-xs text-emerald-700">Enregistrer l'encaissement maintenant</p>
              </div>
            </button>

            <button
              onClick={handleAPercevoirArrivee}
              disabled={isSubmitting}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                {isSubmitting ? <Spinner size="xs" color="slate" /> : <ClockIcon className="w-5 h-5 text-slate-600" />}
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-slate-900">À percevoir à l'arrivée</p>
                <p className="text-xs text-slate-500">Le montant sera encaissé à destination</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <XMarkIcon className="w-4 h-4" />
            Décider plus tard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FraisDecisionModal;
