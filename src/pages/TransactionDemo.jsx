import React, { useState } from 'react';
import { RecordTransactionButton, RecordTransactionModal } from '../components/transaction';
import { 
  BanknotesIcon, 
  CreditCardIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from '../utils/toast';

/**
 * Page de démonstration du composant de transaction
 * Cette page montre tous les cas d'usage possibles
 */
const TransactionDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Données d'exemple
  const expeditionExample = {
    id: "7b00cdc1-0194-4a5a-9619-fc3c28936971",
    reference: "EXP-2024-001",
    montant_expedition: 15500,
    frais_annexes: 2500,
    frais_enlevement: 1000,
    frais_livraison: 1500
  };

  const handleSuccess = (data) => {
    console.log('Transaction enregistrée:', data);
    setLastTransaction(data);
  };

  const handleModalSubmit = async (data) => {
    console.log('Modal submit:', data);
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastTransaction(data);
    toast.success('Transaction enregistrée avec succès');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Composant de Transaction - Démonstration
        </h1>
        <p className="text-slate-600">
          Exemples d'utilisation du composant RecordTransactionButton et RecordTransactionModal
        </p>
      </div>

      {/* Dernière transaction */}
      {lastTransaction && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                Transaction enregistrée avec succès !
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-emerald-600 font-medium">Type:</span>
                  <span className="ml-2 text-emerald-900">{lastTransaction.type}</span>
                </div>
                <div>
                  <span className="text-emerald-600 font-medium">Montant:</span>
                  <span className="ml-2 text-emerald-900">{lastTransaction.amount} CFA</span>
                </div>
                <div>
                  <span className="text-emerald-600 font-medium">Mode:</span>
                  <span className="ml-2 text-emerald-900">{lastTransaction.payment_method}</span>
                </div>
                <div>
                  <span className="text-emerald-600 font-medium">Objet:</span>
                  <span className="ml-2 text-emerald-900">{lastTransaction.payment_object}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 1 : Variantes de style */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">1. Variantes de style</h2>
          <p className="text-slate-600">Différentes couleurs pour différents contextes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Primary (Bleu)</h3>
              <p className="text-xs text-slate-500">Action principale, encaissement standard</p>
            </div>
            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              variant="primary"
              label="Encaisser"
              onSuccess={handleSuccess}
            />
          </div>

          {/* Success */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Success (Vert)</h3>
              <p className="text-xs text-slate-500">Paiement confirmé, validation</p>
            </div>
            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              variant="success"
              label="Paiement reçu"
              onSuccess={handleSuccess}
            />
          </div>

          {/* Warning */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Warning (Orange)</h3>
              <p className="text-xs text-slate-500">Frais annexes, paiement partiel</p>
            </div>
            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.frais_annexes}
              defaultObject="frais_annexes"
              variant="warning"
              label="Frais annexes"
              onSuccess={handleSuccess}
            />
          </div>

          {/* Danger */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Danger (Rouge)</h3>
              <p className="text-xs text-slate-500">Décaissement, remboursement</p>
            </div>
            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              defaultType="decaissement"
              defaultObject="remboursement"
              variant="danger"
              label="Rembourser"
              onSuccess={handleSuccess}
            />
          </div>

          {/* Secondary */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Secondary (Gris)</h3>
              <p className="text-xs text-slate-500">Action secondaire</p>
            </div>
            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              variant="secondary"
              label="Autre paiement"
              onSuccess={handleSuccess}
            />
          </div>

          {/* Outline */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Outline</h3>
              <p className="text-xs text-slate-500">Style minimaliste</p>
            </div>
            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              variant="outline"
              label="Enregistrer"
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </section>

      {/* Section 2 : Tailles */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">2. Tailles</h2>
          <p className="text-slate-600">Trois tailles disponibles : sm, md, lg</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-8">
          <div className="flex flex-wrap items-center gap-4">
            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              size="sm"
              label="Petit (sm)"
              onSuccess={handleSuccess}
            />

            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              size="md"
              label="Moyen (md)"
              onSuccess={handleSuccess}
            />

            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              size="lg"
              label="Grand (lg)"
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </section>

      {/* Section 3 : Cas d'usage métier */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">3. Cas d'usage métier</h2>
          <p className="text-slate-600">Exemples concrets d'utilisation dans l'application</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Encaissement montant principal */}
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BanknotesIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Encaissement montant principal</h3>
                <p className="text-xs text-slate-600 mb-3">
                  Expédition: {expeditionExample.reference}<br />
                  Montant: {expeditionExample.montant_expedition.toLocaleString()} CFA
                </p>
                <RecordTransactionButton
                  expeditionId={expeditionExample.id}
                  expeditionReference={expeditionExample.reference}
                  defaultAmount={expeditionExample.montant_expedition}
                  defaultType="encaissement"
                  defaultObject="montant_expedition"
                  variant="success"
                  size="md"
                  label="Encaisser le montant"
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          </div>

          {/* Frais annexes */}
          <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <CreditCardIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Frais annexes</h3>
                <p className="text-xs text-slate-600 mb-3">
                  Assurance, emballage, etc.<br />
                  Montant: {expeditionExample.frais_annexes.toLocaleString()} CFA
                </p>
                <RecordTransactionButton
                  expeditionId={expeditionExample.id}
                  expeditionReference={expeditionExample.reference}
                  defaultAmount={expeditionExample.frais_annexes}
                  defaultType="encaissement"
                  defaultObject="frais_annexes"
                  variant="warning"
                  size="md"
                  label="Encaisser frais annexes"
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          </div>

          {/* Frais d'enlèvement */}
          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <ArrowPathIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Frais d'enlèvement</h3>
                <p className="text-xs text-slate-600 mb-3">
                  Collecte à domicile<br />
                  Montant: {expeditionExample.frais_enlevement.toLocaleString()} CFA
                </p>
                <RecordTransactionButton
                  expeditionId={expeditionExample.id}
                  expeditionReference={expeditionExample.reference}
                  defaultAmount={expeditionExample.frais_enlevement}
                  defaultType="encaissement"
                  defaultObject="frais_enlevement"
                  variant="primary"
                  size="md"
                  label="Encaisser enlèvement"
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          </div>

          {/* Remboursement */}
          <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                <ArrowPathIcon className="w-5 h-5 text-rose-600 rotate-180" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Remboursement client</h3>
                <p className="text-xs text-slate-600 mb-3">
                  Retour de fonds<br />
                  Montant: {expeditionExample.montant_expedition.toLocaleString()} CFA
                </p>
                <RecordTransactionButton
                  expeditionId={expeditionExample.id}
                  expeditionReference={expeditionExample.reference}
                  defaultAmount={expeditionExample.montant_expedition}
                  defaultType="decaissement"
                  defaultObject="remboursement"
                  variant="danger"
                  size="md"
                  label="Rembourser le client"
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 : Modal direct */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">4. Utilisation du Modal directement</h2>
          <p className="text-slate-600">Pour un contrôle total sur l'ouverture/fermeture</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-8">
          <div className="text-center space-y-4">
            <p className="text-slate-600">
              Vous pouvez aussi utiliser le modal directement sans passer par le bouton
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Ouvrir le modal directement
            </button>
          </div>
        </div>

        <RecordTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          expeditionId={expeditionExample.id}
          expeditionReference={expeditionExample.reference}
          defaultAmount={0}
          defaultType="encaissement"
          defaultObject="autre"
        />
      </section>

      {/* Section 5 : Sans icône */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">5. Options d'affichage</h2>
          <p className="text-slate-600">Avec ou sans icône</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-8">
          <div className="flex flex-wrap items-center gap-4">
            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              showIcon={true}
              label="Avec icône"
              onSuccess={handleSuccess}
            />

            <RecordTransactionButton
              expeditionId={expeditionExample.id}
              expeditionReference={expeditionExample.reference}
              defaultAmount={expeditionExample.montant_expedition}
              showIcon={false}
              label="Sans icône"
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-8 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          Composant de Transaction v1.0.0 - Documentation complète disponible dans GUIDE_COMPOSANT_TRANSACTION.md
        </p>
      </div>
    </div>
  );
};

export default TransactionDemo;
