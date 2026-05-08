# 📘 Guide d'utilisation - Composant de Gestion des Transactions

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser les composants modernes de gestion des transactions financières dans l'application SaaS de gestion d'expédition/logistique.

## 📦 Composants disponibles

### 1. **RecordTransactionModal**
Modal complet pour enregistrer une transaction financière (encaissement ou décaissement).

### 2. **RecordTransactionButton**
Bouton réutilisable qui déclenche le modal de transaction.

---

## 🚀 Installation et Import

```javascript
// Import du modal seul
import { RecordTransactionModal } from '../components/transaction';

// Import du bouton (qui inclut le modal)
import { RecordTransactionButton } from '../components/transaction';

// Import des deux
import { RecordTransactionModal, RecordTransactionButton } from '../components/transaction';
```

---

## 📋 Utilisation du Modal (RecordTransactionModal)

### Props

| Prop | Type | Requis | Défaut | Description |
|------|------|--------|--------|-------------|
| `isOpen` | boolean | ✅ | - | État d'ouverture du modal |
| `onClose` | function | ✅ | - | Fonction de fermeture |
| `onSubmit` | function | ✅ | - | Fonction de soumission (transactionData) => Promise |
| `expeditionId` | string | ✅ | - | UUID de l'expédition |
| `expeditionReference` | string | ❌ | '' | Référence de l'expédition (affichage) |
| `defaultAmount` | number | ❌ | 0 | Montant par défaut |
| `defaultType` | string | ❌ | 'encaissement' | Type: 'encaissement' ou 'decaissement' |
| `defaultObject` | string | ❌ | 'frais_annexes' | Objet du paiement |

### Exemple d'utilisation

```javascript
import React, { useState } from 'react';
import { RecordTransactionModal } from '../components/transaction';
import { useExpedition } from '../hooks/useExpedition';
import { toast } from '../utils/toast';

const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { recordTransaction } = useExpedition();

  const handleSubmit = async (transactionData) => {
    try {
      await recordTransaction(transactionData);
      toast.success('Transaction enregistrée avec succès');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
      throw error; // Important pour que le modal affiche l'erreur
    }
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Enregistrer un paiement
      </button>

      <RecordTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        expeditionId="7b00cdc1-0194-4a5a-9619-fc3c28936971"
        expeditionReference="EXP-2024-001"
        defaultAmount={15500}
        defaultType="encaissement"
        defaultObject="frais_annexes"
      />
    </>
  );
};
```

---

## 🎨 Utilisation du Bouton (RecordTransactionButton)

### Props

| Prop | Type | Requis | Défaut | Description |
|------|------|--------|--------|-------------|
| `expeditionId` | string | ✅ | - | UUID de l'expédition |
| `expeditionReference` | string | ❌ | '' | Référence de l'expédition |
| `defaultAmount` | number | ❌ | 0 | Montant par défaut |
| `defaultType` | string | ❌ | 'encaissement' | Type de transaction |
| `defaultObject` | string | ❌ | 'frais_annexes' | Objet du paiement |
| `variant` | string | ❌ | 'primary' | Style: 'primary', 'secondary', 'danger', 'success', 'warning', 'outline' |
| `size` | string | ❌ | 'md' | Taille: 'sm', 'md', 'lg' |
| `label` | string | ❌ | 'Enregistrer paiement' | Texte du bouton |
| `showIcon` | boolean | ❌ | true | Afficher l'icône |
| `onSuccess` | function | ❌ | - | Callback après succès |
| `className` | string | ❌ | '' | Classes CSS additionnelles |

### Exemples d'utilisation

#### Exemple 1 : Bouton simple

```javascript
import { RecordTransactionButton } from '../components/transaction';

<RecordTransactionButton
  expeditionId="7b00cdc1-0194-4a5a-9619-fc3c28936971"
  expeditionReference="EXP-2024-001"
  defaultAmount={15500}
/>
```

#### Exemple 2 : Bouton personnalisé

```javascript
<RecordTransactionButton
  expeditionId="7b00cdc1-0194-4a5a-9619-fc3c28936971"
  expeditionReference="EXP-2024-001"
  defaultAmount={25000}
  defaultType="decaissement"
  defaultObject="remboursement"
  variant="danger"
  size="lg"
  label="Rembourser le client"
  onSuccess={(data) => {
    console.log('Transaction enregistrée:', data);
    // Rafraîchir les données, etc.
  }}
/>
```

#### Exemple 3 : Différentes variantes

```javascript
// Bouton principal (bleu)
<RecordTransactionButton
  expeditionId={id}
  variant="primary"
  label="Encaisser"
/>

// Bouton de succès (vert)
<RecordTransactionButton
  expeditionId={id}
  variant="success"
  label="Paiement reçu"
/>

// Bouton de danger (rouge)
<RecordTransactionButton
  expeditionId={id}
  variant="danger"
  defaultType="decaissement"
  label="Décaisser"
/>

// Bouton d'avertissement (orange)
<RecordTransactionButton
  expeditionId={id}
  variant="warning"
  label="Paiement partiel"
/>

// Bouton outline
<RecordTransactionButton
  expeditionId={id}
  variant="outline"
  label="Autre paiement"
/>
```

#### Exemple 4 : Différentes tailles

```javascript
// Petit
<RecordTransactionButton
  expeditionId={id}
  size="sm"
  label="Payer"
/>

// Moyen (défaut)
<RecordTransactionButton
  expeditionId={id}
  size="md"
  label="Enregistrer paiement"
/>

// Grand
<RecordTransactionButton
  expeditionId={id}
  size="lg"
  label="Confirmer le paiement"
/>
```

---

## 📊 Structure des données de transaction

### Format d'envoi à l'API

```javascript
{
  "expedition_id": "7b00cdc1-0194-4a5a-9619-fc3c28936971", // UUID de l'expédition
  "amount": 15500,                                         // Montant (nombre)
  "payment_method": "cash",                                // cash, mobile_money, bank_transfer, other
  "payment_object": "frais_annexes",                       // Objet du paiement
  "type": "encaissement",                                  // encaissement ou decaissement
  "reference": "OM-123456789",                             // Optionnel (obligatoire si non-cash)
  "description": "Paiement total à la livraison",          // Optionnel
  "recorded_at": "2024-03-26 14:30:00"                     // Optionnel (date précise)
}
```

### Modes de paiement disponibles

- `cash` : Espèces 💵
- `mobile_money` : Mobile Money 📱
- `bank_transfer` : Virement bancaire 🏦
- `other` : Autre ❓

### Objets de paiement disponibles

- `montant_expedition` : Montant expédition (frais de transport principal)
- `frais_annexes` : Frais annexes (assurance, emballage, etc.)
- `frais_enlevement` : Frais d'enlèvement (collecte à domicile)
- `frais_livraison` : Frais de livraison (livraison à domicile)
- `remboursement` : Remboursement (retour de fonds)
- `autre` : Autre type de transaction

---

## 🎯 Cas d'usage courants

### 1. Enregistrer un paiement à la création d'expédition

```javascript
// Dans CreateExpedition.jsx
import { RecordTransactionButton } from '../components/transaction';

<RecordTransactionButton
  expeditionId={currentExpedition.id}
  expeditionReference={currentExpedition.reference}
  defaultAmount={currentExpedition.montant_expedition}
  defaultType="encaissement"
  defaultObject="montant_expedition"
  variant="success"
  label="Encaisser maintenant"
  onSuccess={() => {
    // Rafraîchir l'expédition
    fetchExpeditionDetails(currentExpedition.id);
  }}
/>
```

### 2. Enregistrer des frais annexes

```javascript
<RecordTransactionButton
  expeditionId={expedition.id}
  expeditionReference={expedition.reference}
  defaultAmount={expedition.frais_annexes}
  defaultType="encaissement"
  defaultObject="frais_annexes"
  variant="warning"
  label="Encaisser frais annexes"
/>
```

### 3. Enregistrer un remboursement

```javascript
<RecordTransactionButton
  expeditionId={expedition.id}
  expeditionReference={expedition.reference}
  defaultAmount={expedition.montant_expedition}
  defaultType="decaissement"
  defaultObject="remboursement"
  variant="danger"
  label="Rembourser le client"
/>
```

### 4. Transaction générale (sans expédition)

```javascript
// Dans la page Transactions
<RecordTransactionModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleSubmit}
  expeditionId="" // Vide pour transaction générale
  expeditionReference=""
  defaultAmount={0}
  defaultType="encaissement"
  defaultObject="autre"
/>
```

---

## 🔧 Validation et règles métier

### Règles de validation

1. **Montant** : Doit être supérieur à 0
2. **Mode de paiement** : Obligatoire
3. **Référence** : Obligatoire si le mode de paiement n'est pas "cash"
4. **Objet du paiement** : Obligatoire

### Gestion des erreurs

Le composant gère automatiquement :
- ✅ Validation des champs
- ✅ Affichage des erreurs
- ✅ État de chargement pendant la soumission
- ✅ Désactivation des boutons pendant le traitement

---

## 🎨 Personnalisation du style

### Classes CSS personnalisées

```javascript
<RecordTransactionButton
  expeditionId={id}
  className="shadow-lg hover:shadow-xl"
/>
```

### Variantes de couleur

Le composant utilise Tailwind CSS avec les variantes suivantes :
- `primary` : Bleu (bg-blue-600)
- `secondary` : Gris (bg-slate-600)
- `danger` : Rouge (bg-rose-600)
- `success` : Vert (bg-emerald-600)
- `warning` : Orange (bg-amber-600)
- `outline` : Blanc avec bordure (bg-white border-slate-300)

---

## 📱 Responsive Design

Les composants sont entièrement responsive :
- ✅ Mobile-first design
- ✅ Adaptation automatique sur tablette et desktop
- ✅ Modal scrollable sur petits écrans
- ✅ Boutons adaptés aux écrans tactiles

---

## 🔄 Intégration avec Redux

Le composant utilise le hook `useExpedition` qui gère :
- L'appel à l'API via `recordTransaction`
- La mise à jour du state Redux
- Les notifications de succès/erreur

```javascript
// Le hook est déjà intégré dans RecordTransactionButton
// Pas besoin de gérer Redux manuellement
```

---

## 🧪 Tests et débogage

### Logs de débogage

```javascript
const handleSubmit = async (transactionData) => {
  console.log('Transaction data:', transactionData);
  
  try {
    await recordTransaction(transactionData);
    console.log('✅ Transaction enregistrée');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};
```

### Vérification de l'API

L'API utilisée : `POST /api/agence/record-transaction`

---

## 📚 Ressources supplémentaires

- **API Endpoint** : `/api/agence/record-transaction`
- **Hook utilisé** : `useExpedition` (src/hooks/useExpedition.js)
- **Redux Slice** : `expeditionSlice` (src/store/slices/expeditionSlice.js)
- **API Service** : `agenciesApi.recordTransaction` (src/utils/api/agencies.js)

---

## ✅ Checklist d'intégration

- [ ] Importer le composant
- [ ] Fournir l'`expeditionId`
- [ ] Définir le `defaultAmount` si nécessaire
- [ ] Choisir le `defaultType` (encaissement/decaissement)
- [ ] Choisir le `defaultObject` approprié
- [ ] Implémenter le callback `onSuccess` si nécessaire
- [ ] Tester sur mobile et desktop
- [ ] Vérifier les notifications toast
- [ ] Vérifier la mise à jour des données après soumission

---

## 🎉 Exemple complet d'intégration

```javascript
import React, { useState } from 'react';
import { RecordTransactionButton } from '../components/transaction';
import { useExpedition } from '../hooks/useExpedition';

const ExpeditionDetails = ({ expedition }) => {
  const { fetchExpeditionDetails } = useExpedition();

  const handleTransactionSuccess = (transactionData) => {
    console.log('Transaction enregistrée:', transactionData);
    // Rafraîchir les détails de l'expédition
    fetchExpeditionDetails(expedition.id);
  };

  return (
    <div className="space-y-4">
      <h2>Expédition {expedition.reference}</h2>
      
      {/* Bouton pour encaisser le montant principal */}
      {expedition.statut_paiement !== 'paye' && (
        <RecordTransactionButton
          expeditionId={expedition.id}
          expeditionReference={expedition.reference}
          defaultAmount={expedition.montant_expedition}
          defaultType="encaissement"
          defaultObject="montant_expedition"
          variant="success"
          size="lg"
          label="Encaisser le montant"
          onSuccess={handleTransactionSuccess}
        />
      )}

      {/* Bouton pour encaisser les frais annexes */}
      {expedition.frais_annexes > 0 && (
        <RecordTransactionButton
          expeditionId={expedition.id}
          expeditionReference={expedition.reference}
          defaultAmount={expedition.frais_annexes}
          defaultType="encaissement"
          defaultObject="frais_annexes"
          variant="warning"
          size="md"
          label="Encaisser frais annexes"
          onSuccess={handleTransactionSuccess}
        />
      )}

      {/* Bouton pour rembourser */}
      <RecordTransactionButton
        expeditionId={expedition.id}
        expeditionReference={expedition.reference}
        defaultAmount={0}
        defaultType="decaissement"
        defaultObject="remboursement"
        variant="danger"
        size="md"
        label="Rembourser"
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default ExpeditionDetails;
```

---

## 🆘 Support et questions

Pour toute question ou problème :
1. Vérifier que l'API `/api/agence/record-transaction` est accessible
2. Vérifier que le hook `useExpedition` est correctement configuré
3. Consulter les logs de la console pour les erreurs
4. Vérifier que l'`expeditionId` est valide (UUID)

---

**Dernière mise à jour** : 8 Mai 2026
**Version** : 1.0.0
