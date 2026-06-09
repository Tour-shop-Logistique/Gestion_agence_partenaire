# ✨ Ajout du champ ID Expédition dans le modal de transaction

## Modifications apportées

### RecordTransactionModal.jsx

#### 1. Ajout du champ dans le state du formulaire
```javascript
const [formData, setFormData] = useState({
  type: defaultType,
  amount: defaultAmount || '',
  payment_method: 'cash',
  payment_object: defaultObject,
  reference: '',
  description: '',
  recorded_at: '',
  expedition_id_input: '' // ✨ Nouveau champ pour saisie manuelle
});
```

#### 2. Ajout du champ de saisie dans le formulaire
Un nouveau champ input a été ajouté après la section "Type de transaction", visible uniquement si aucun `expeditionId` n'est fourni en prop :

```jsx
{/* ID Expédition (si vide) */}
{!expeditionId && (
  <div>
    <label>ID Expédition (optionnel)</label>
    <input
      type="text"
      value={formData.expedition_id_input}
      placeholder="Ex: 7b00cdc1-0194-4a5a-9619-fc3c28936971"
      className="font-mono" // Police monospace pour UUID
    />
    <p className="text-xs text-slate-500">
      UUID de l'expédition pour lier cette transaction. 
      Laissez vide pour une transaction générale.
    </p>
  </div>
)}
```

#### 3. Modification de la logique de soumission
La fonction `handleSubmit` utilise maintenant soit l'ID passé en prop, soit celui saisi manuellement :

```javascript
// Ajouter expedition_id : soit celui passé en prop, soit celui saisi manuellement
const finalExpeditionId = expeditionId || formData.expedition_id_input?.trim();
if (finalExpeditionId) {
  transactionData.expedition_id = finalExpeditionId;
}
```

## Comportement

### Cas 1 : Modal ouvert depuis une page d'expédition
- Le prop `expeditionId` est fourni
- Le champ de saisie est **masqué**
- L'ID est automatiquement inclus dans la transaction
- **Exemple** : Modal ouvert depuis la page détails d'une expédition

### Cas 2 : Modal ouvert depuis la page Transactions
- Aucun `expeditionId` fourni
- Le champ de saisie est **visible**
- L'utilisateur peut :
  - **Laisser vide** : Transaction générale (non liée à une expédition)
  - **Saisir un UUID** : Transaction liée à l'expédition correspondante

## Caractéristiques du champ

### Style
- ✅ Police **monospace** (`font-mono`) pour faciliter la lecture des UUID
- ✅ Placeholder avec exemple d'UUID complet
- ✅ Bordure adaptative (rouge en cas d'erreur)
- ✅ Design cohérent avec les autres champs

### Validation
- ⚠️ Champ **optionnel** (pas de validation stricte pour l'instant)
- 🔄 Trimming automatique (espaces supprimés)
- 📝 Le champ est envoyé uniquement s'il contient une valeur

### Message d'aide
```
UUID de l'expédition pour lier cette transaction. 
Laissez vide pour une transaction générale.
```

## Exemples d'utilisation

### Transaction liée à une expédition (UUID saisi)
```json
{
  "expedition_id": "7b00cdc1-0194-4a5a-9619-fc3c28936971",
  "amount": 50000,
  "payment_method": "cash",
  "payment_object": "montant_expedition",
  "type": "encaissement"
}
```

### Transaction générale (champ vide)
```json
{
  "amount": 25000,
  "payment_method": "mobile_money",
  "payment_object": "autre",
  "type": "decaissement",
  "reference": "OM-123456"
}
```

## Améliorations futures possibles

1. 🔍 **Validation du format UUID**
   - Vérifier que l'ID saisi respecte le format UUID v4
   - Afficher une erreur si le format est invalide

2. 🔗 **Recherche par référence d'expédition**
   - Ajouter un deuxième champ pour rechercher par référence (EXP-2024-001)
   - Convertir automatiquement la référence en UUID via l'API

3. 📋 **Autocomplétion**
   - Suggérer les expéditions récentes lors de la saisie
   - Afficher la référence et le client associé à l'UUID

4. ✅ **Vérification d'existence**
   - Vérifier via l'API que l'UUID existe avant soumission
   - Afficher des infos sur l'expédition trouvée (référence, client)

5. 📸 **Scanner de QR Code**
   - Permettre de scanner le QR code d'une expédition
   - Remplir automatiquement le champ ID

6. 🎯 **Bouton de sélection rapide**
   - Modal pour sélectionner une expédition depuis une liste
   - Filtres par date, client, statut

## Notes techniques

### Priorité des sources d'expedition_id
```javascript
const finalExpeditionId = expeditionId || formData.expedition_id_input?.trim();
```

1. **Prop `expeditionId`** : Si fourni, utilisé en priorité
2. **Champ saisi** : Si prop vide, utilise la valeur saisie manuellement
3. **Aucun** : Si les deux sont vides, transaction générale

### Format attendu
- **Type** : String (UUID v4)
- **Format** : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Exemple** : `7b00cdc1-0194-4a5a-9619-fc3c28936971`

### Gestion des espaces
Le champ utilise `.trim()` pour supprimer les espaces avant/après lors de la soumission.

## Tests recommandés

1. ✅ Ouvrir le modal depuis la page Transactions
2. ✅ Vérifier que le champ ID Expédition est visible
3. ✅ Saisir un UUID valide et soumettre
4. ✅ Laisser le champ vide et soumettre (transaction générale)
5. ✅ Copier-coller un UUID depuis une page d'expédition
6. ✅ Vérifier que les espaces sont bien supprimés
7. ✅ Tester avec un UUID invalide (comportement actuel : envoyé tel quel à l'API)
