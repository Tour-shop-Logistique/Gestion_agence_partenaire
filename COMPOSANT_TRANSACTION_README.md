# 🏗️ Composant de Gestion des Transactions - Documentation Technique

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Composants créés](#composants-créés)
4. [API et flux de données](#api-et-flux-de-données)
5. [Intégration](#intégration)
6. [Exemples d'utilisation](#exemples-dutilisation)

---

## 🎯 Vue d'ensemble

Ce module fournit une solution complète et moderne pour enregistrer des transactions financières (encaissements et décaissements) dans l'application SaaS de gestion d'expédition/logistique.

### Fonctionnalités principales

✅ **Modal interactif** pour enregistrer des transactions  
✅ **Bouton réutilisable** avec modal intégré  
✅ **Validation en temps réel** des champs  
✅ **Support multi-modes de paiement** (espèces, mobile money, virement, autre)  
✅ **Gestion des erreurs** avec feedback visuel  
✅ **Design responsive** (mobile, tablette, desktop)  
✅ **Intégration Redux** via useExpedition hook  
✅ **Notifications toast** automatiques  

---

## 🏛️ Architecture

### Structure des fichiers

```
src/
├── components/
│   └── transaction/
│       ├── RecordTransactionModal.jsx    # Modal principal
│       ├── RecordTransactionButton.jsx   # Bouton avec modal intégré
│       └── index.js                      # Export centralisé
├── pages/
│   └── Transactions.jsx                  # Page mise à jour avec le composant
└── hooks/
    └── useExpedition.js                  # Hook Redux (déjà existant)
```

### Dépendances

- **React** : Composants fonctionnels avec hooks
- **Redux** : Gestion d'état via `useExpedition`
- **Heroicons** : Icônes modernes
- **Tailwind CSS** : Styling responsive
- **Toast personnalisé** : Notifications (src/utils/toast.js)

---

## 📦 Composants créés

### 1. RecordTransactionModal.jsx

**Rôle** : Modal complet pour enregistrer une transaction

**Props** :
```typescript
interface RecordTransactionModalProps {
  isOpen: boolean;                    // État d'ouverture
  onClose: () => void;                // Fonction de fermeture
  onSubmit: (data: TransactionData) => Promise<void>; // Soumission
  expeditionId: string;               // UUID de l'expédition
  expeditionReference?: string;       // Référence (affichage)
  defaultAmount?: number;             // Montant par défaut
  defaultType?: 'encaissement' | 'decaissement'; // Type
  defaultObject?: string;             // Objet du paiement
}
```

**Fonctionnalités** :
- Sélection du type (encaissement/décaissement)
- Saisie du montant avec formatage
- Choix du mode de paiement (4 options)
- Référence obligatoire si non-cash
- Sélection de l'objet du paiement
- Date/heure optionnelle
- Description optionnelle
- Validation en temps réel
- Gestion des erreurs
- État de chargement

**États internes** :
```javascript
const [formData, setFormData] = useState({
  type: 'encaissement',
  amount: '',
  payment_method: 'cash',
  payment_object: 'frais_annexes',
  reference: '',
  description: '',
  recorded_at: ''
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [errors, setErrors] = useState({});
```

---

### 2. RecordTransactionButton.jsx

**Rôle** : Bouton réutilisable qui déclenche le modal

**Props** :
```typescript
interface RecordTransactionButtonProps {
  expeditionId: string;
  expeditionReference?: string;
  defaultAmount?: number;
  defaultType?: 'encaissement' | 'decaissement';
  defaultObject?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showIcon?: boolean;
  onSuccess?: (data: TransactionData) => void;
  className?: string;
}
```

**Fonctionnalités** :
- Gère l'état du modal
- Appelle `recordTransaction` via `useExpedition`
- Affiche les notifications toast
- Callback `onSuccess` après enregistrement
- Styles personnalisables (variant, size)

---

### 3. index.js

**Rôle** : Export centralisé pour faciliter les imports

```javascript
export { default as RecordTransactionModal } from './RecordTransactionModal';
export { default as RecordTransactionButton } from './RecordTransactionButton';
```

---

## 🔄 API et flux de données

### Endpoint API

```
POST /api/agence/record-transaction
```

### Format de la requête

```json
{
  "expedition_id": "7b00cdc1-0194-4a5a-9619-fc3c28936971",
  "amount": 15500,
  "payment_method": "cash",
  "payment_object": "frais_annexes",
  "type": "encaissement",
  "reference": "OM-123456789",
  "description": "Paiement total à la livraison",
  "recorded_at": "2024-03-26 14:30:00"
}
```

### Flux de données

```
1. Utilisateur clique sur le bouton
   ↓
2. Modal s'ouvre avec valeurs par défaut
   ↓
3. Utilisateur remplit le formulaire
   ↓
4. Validation côté client
   ↓
5. Soumission via useExpedition.recordTransaction()
   ↓
6. Redux dispatch → API call
   ↓
7. Réponse API
   ↓
8. Toast de succès/erreur
   ↓
9. Callback onSuccess (optionnel)
   ↓
10. Fermeture du modal
```

### Intégration Redux

Le composant utilise le hook `useExpedition` qui gère :

```javascript
// Dans useExpedition.js
const { recordTransaction } = useExpedition();

// Appel
await recordTransaction({
  expedition_id: "...",
  amount: 15500,
  payment_method: "cash",
  payment_object: "frais_annexes",
  type: "encaissement"
});
```

Le hook dispatch l'action Redux :
```javascript
dispatch(recordTransactionThunk(transactionData))
```

---

## 🔧 Intégration

### Étape 1 : Import

```javascript
import { RecordTransactionButton } from '../components/transaction';
// ou
import { RecordTransactionModal } from '../components/transaction';
```

### Étape 2 : Utilisation basique

```javascript
<RecordTransactionButton
  expeditionId="7b00cdc1-0194-4a5a-9619-fc3c28936971"
  expeditionReference="EXP-2024-001"
  defaultAmount={15500}
/>
```

### Étape 3 : Utilisation avancée avec callback

```javascript
<RecordTransactionButton
  expeditionId={expedition.id}
  expeditionReference={expedition.reference}
  defaultAmount={expedition.montant_expedition}
  defaultType="encaissement"
  defaultObject="montant_expedition"
  variant="success"
  size="lg"
  label="Encaisser maintenant"
  onSuccess={(data) => {
    console.log('Transaction enregistrée:', data);
    // Rafraîchir les données
    fetchExpeditionDetails(expedition.id);
  }}
/>
```

---

## 💡 Exemples d'utilisation

### Exemple 1 : Dans ExpeditionDetails.jsx

```javascript
import { RecordTransactionButton } from '../components/transaction';

const ExpeditionDetails = ({ expedition }) => {
  const { fetchExpeditionDetails } = useExpedition();

  return (
    <div>
      {/* Encaisser le montant principal */}
      {expedition.statut_paiement !== 'paye' && (
        <RecordTransactionButton
          expeditionId={expedition.id}
          expeditionReference={expedition.reference}
          defaultAmount={expedition.montant_expedition}
          defaultType="encaissement"
          defaultObject="montant_expedition"
          variant="success"
          label="Encaisser"
          onSuccess={() => fetchExpeditionDetails(expedition.id)}
        />
      )}

      {/* Encaisser les frais annexes */}
      {expedition.frais_annexes > 0 && (
        <RecordTransactionButton
          expeditionId={expedition.id}
          expeditionReference={expedition.reference}
          defaultAmount={expedition.frais_annexes}
          defaultType="encaissement"
          defaultObject="frais_annexes"
          variant="warning"
          label="Frais annexes"
          onSuccess={() => fetchExpeditionDetails(expedition.id)}
        />
      )}
    </div>
  );
};
```

### Exemple 2 : Dans CreateExpedition.jsx

```javascript
import { RecordTransactionButton } from '../components/transaction';

const CreateExpedition = () => {
  const { currentExpedition } = useExpedition();

  return (
    <div>
      {currentExpedition && (
        <RecordTransactionButton
          expeditionId={currentExpedition.id}
          expeditionReference={currentExpedition.reference}
          defaultAmount={currentExpedition.montant_expedition}
          defaultType="encaissement"
          defaultObject="montant_expedition"
          variant="primary"
          label="Encaisser maintenant"
        />
      )}
    </div>
  );
};
```

### Exemple 3 : Dans Transactions.jsx (transaction générale)

```javascript
import { RecordTransactionModal } from '../components/transaction';
import { useExpedition } from '../hooks/useExpedition';

const Transactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { recordTransaction } = useExpedition();

  const handleSubmit = async (transactionData) => {
    await recordTransaction(transactionData);
    // Rafraîchir la liste des transactions
    dispatch(fetchTransactions({ date_debut: dateDebut, date_fin: dateFin }));
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Nouvelle transaction
      </button>

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
    </>
  );
};
```

---

## 🎨 Personnalisation

### Variantes de style

```javascript
// Bleu (défaut)
<RecordTransactionButton variant="primary" />

// Vert
<RecordTransactionButton variant="success" />

// Rouge
<RecordTransactionButton variant="danger" />

// Orange
<RecordTransactionButton variant="warning" />

// Gris
<RecordTransactionButton variant="secondary" />

// Outline
<RecordTransactionButton variant="outline" />
```

### Tailles

```javascript
// Petit
<RecordTransactionButton size="sm" />

// Moyen (défaut)
<RecordTransactionButton size="md" />

// Grand
<RecordTransactionButton size="lg" />
```

### Classes CSS personnalisées

```javascript
<RecordTransactionButton
  className="shadow-xl hover:shadow-2xl"
/>
```

---

## ✅ Validation

### Règles de validation

1. **Montant** : 
   - Doit être > 0
   - Type: number

2. **Mode de paiement** :
   - Obligatoire
   - Valeurs: 'cash', 'mobile_money', 'bank_transfer', 'other'

3. **Référence** :
   - Obligatoire si payment_method !== 'cash'
   - Type: string

4. **Objet du paiement** :
   - Obligatoire
   - Valeurs: 'montant_expedition', 'frais_annexes', 'frais_enlevement', 'frais_livraison', 'remboursement', 'autre'

### Gestion des erreurs

```javascript
const [errors, setErrors] = useState({
  amount: '',
  payment_method: '',
  reference: '',
  payment_object: '',
  submit: ''
});
```

Affichage des erreurs :
```jsx
{errors.amount && (
  <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600">
    <ExclamationTriangleIcon className="w-4 h-4" />
    <span>{errors.amount}</span>
  </div>
)}
```

---

## 📱 Responsive Design

### Breakpoints

- **Mobile** : < 640px
- **Tablet** : 640px - 1024px
- **Desktop** : > 1024px

### Adaptations

```javascript
// Tailles de texte responsive
className="text-xs sm:text-sm"

// Padding responsive
className="px-3 sm:px-4 py-2 sm:py-3"

// Grille responsive
className="grid grid-cols-2 sm:grid-cols-4 gap-2"

// Affichage conditionnel
<span className="hidden sm:inline">Texte complet</span>
<span className="sm:hidden">Court</span>
```

---

## 🧪 Tests

### Tests unitaires recommandés

```javascript
// Test 1 : Rendu du modal
test('renders modal when isOpen is true', () => {
  render(<RecordTransactionModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} expeditionId="123" />);
  expect(screen.getByText('Enregistrer une transaction')).toBeInTheDocument();
});

// Test 2 : Validation du montant
test('shows error when amount is 0', async () => {
  // ...
});

// Test 3 : Référence obligatoire pour non-cash
test('requires reference for mobile_money', async () => {
  // ...
});

// Test 4 : Soumission réussie
test('calls onSubmit with correct data', async () => {
  // ...
});
```

---

## 🐛 Débogage

### Logs utiles

```javascript
// Dans handleSubmit
console.log('Transaction data:', transactionData);
console.log('Expedition ID:', expeditionId);
console.log('Form data:', formData);
```

### Erreurs courantes

1. **"expedition_id is required"**
   - Vérifier que `expeditionId` est fourni et valide (UUID)

2. **"reference is required"**
   - La référence est obligatoire si payment_method !== 'cash'

3. **"amount must be greater than 0"**
   - Vérifier que le montant est un nombre > 0

---

## 🚀 Performance

### Optimisations

1. **Mémoïsation** : Les composants utilisent `useState` et `useEffect` de manière optimale
2. **Validation lazy** : La validation ne se déclenche qu'à la soumission
3. **Debouncing** : Pas nécessaire car pas de recherche en temps réel
4. **Code splitting** : Les composants peuvent être lazy-loaded si nécessaire

---

## 📚 Ressources

- **API Endpoint** : `/api/agence/record-transaction`
- **Hook** : `useExpedition` (src/hooks/useExpedition.js)
- **Redux Slice** : `expeditionSlice` (src/store/slices/expeditionSlice.js)
- **API Service** : `agenciesApi.recordTransaction` (src/utils/api/agencies.js)

---

## 🔄 Changelog

### Version 1.0.0 (8 Mai 2026)
- ✅ Création du composant RecordTransactionModal
- ✅ Création du composant RecordTransactionButton
- ✅ Intégration dans la page Transactions
- ✅ Documentation complète
- ✅ Support responsive
- ✅ Validation des champs
- ✅ Gestion des erreurs

---

## 📝 TODO / Améliorations futures

- [ ] Ajouter des tests unitaires
- [ ] Ajouter des tests d'intégration
- [ ] Support multi-devises
- [ ] Historique des transactions dans le modal
- [ ] Impression de reçu
- [ ] Export PDF du reçu
- [ ] Signature électronique
- [ ] Photo du reçu (upload)

---

**Auteur** : Kiro AI  
**Date** : 8 Mai 2026  
**Version** : 1.0.0  
**Licence** : Propriétaire
