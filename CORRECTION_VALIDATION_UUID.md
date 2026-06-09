# 🔧 Correction : Validation du format UUID pour l'ID expédition

## Problème identifié

L'utilisateur a saisi une **référence d'expédition** (`EXP202605051539004158`) au lieu d'un **UUID** dans le champ ID Expédition, ce qui a causé une erreur SQL :

```
SQLSTATE[22P02]: Invalid text representation: 7 ERROR:  
invalid input syntax for type uuid: "EXP202605051539004158"
```

### Cause
- Le champ `expedition_id` dans la base de données est de type **UUID**
- L'utilisateur a confondu la **référence** (ex: `EXP202605051539004158`) avec l'**UUID** (ex: `7b00cdc1-0194-4a5a-9619-fc3c28936971`)
- Aucune validation n'était en place pour vérifier le format

## Corrections apportées

### 1. Validation du format UUID

Ajout d'une validation dans la fonction `validateForm()` :

```javascript
// Validation du format UUID si un ID d'expédition est saisi
if (!expeditionId && formData.expedition_id_input && formData.expedition_id_input.trim()) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const inputValue = formData.expedition_id_input.trim();
  
  if (!uuidRegex.test(inputValue)) {
    newErrors.expedition_id_input = 'Format UUID invalide. Utilisez un UUID (ex: 7b00cdc1-0194-4a5a-9619-fc3c28936971), pas une référence.';
  }
}
```

### 2. Amélioration du label et du placeholder

**Avant :**
```jsx
<label>ID Expédition (optionnel)</label>
<input placeholder="Ex: 7b00cdc1-0194-4a5a-9619-fc3c28936971" />
```

**Après :**
```jsx
<label>ID Expédition (UUID) (optionnel)</label>
<input placeholder="7b00cdc1-0194-4a5a-9619-fc3c28936971" />
```

### 3. Message d'aide amélioré

Remplacement du message simple par un message d'avertissement plus clair :

```jsx
<div className="mt-1.5 p-2 bg-amber-50 border border-amber-100 rounded-lg">
  <p className="text-xs text-amber-700 flex items-start gap-1.5">
    <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
    <span>
      <strong>UUID uniquement</strong> (pas de référence EXP-xxx). 
      L'UUID se trouve dans les détails de l'expédition. 
      Laissez vide pour une transaction générale.
    </span>
  </p>
</div>
```

## Format UUID

### Caractéristiques
- **Type** : UUID version 4
- **Format** : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Longueur** : 36 caractères (32 hex + 4 tirets)
- **Caractères** : `0-9`, `a-f` (case insensitive)

### Regex de validation
```regex
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
```

### Exemples valides ✅
- `7b00cdc1-0194-4a5a-9619-fc3c28936971`
- `550e8400-e29b-41d4-a716-446655440000`
- `A1B2C3D4-E5F6-7890-ABCD-EF1234567890` (majuscules acceptées)

### Exemples invalides ❌
- `EXP202605051539004158` → Référence d'expédition
- `7b00cdc1-0194-4a5a-9619` → UUID incomplet
- `7b00cdc1_0194_4a5a_9619_fc3c28936971` → Mauvais séparateur
- `12345678-1234-1234-1234-123456789012G` → Caractère invalide

## Comportement

### Cas 1 : UUID valide
- ✅ Validation passe
- ✅ Transaction liée à l'expédition
- ✅ Soumission réussie

### Cas 2 : UUID invalide
- ❌ Validation échoue
- ❌ Message d'erreur affiché sous le champ
- ❌ Soumission bloquée
- 💡 Message : *"Format UUID invalide. Utilisez un UUID (ex: 7b00cdc1...), pas une référence."*

### Cas 3 : Champ vide
- ✅ Validation passe (champ optionnel)
- ✅ Transaction générale (non liée)
- ✅ Soumission réussie

### Cas 4 : Référence saisie (ex: EXP202605051539004158)
- ❌ Validation échoue
- 💡 Message guide l'utilisateur vers l'UUID

## Message d'erreur utilisateur

Lorsqu'un format invalide est détecté :

```
⚠️ Format UUID invalide. Utilisez un UUID (ex: 7b00cdc1-0194-4a5a-9619-fc3c28936971), pas une référence.
```

## Où trouver l'UUID d'une expédition ?

### Méthode 1 : Page détails de l'expédition
1. Accéder à la page de détails d'une expédition
2. L'UUID se trouve dans l'URL : `/expeditions/{uuid}`
3. Copier l'UUID depuis l'URL

### Méthode 2 : API / Console développeur
1. Inspecter les requêtes réseau
2. Les réponses API contiennent le champ `id` (UUID)

### Méthode 3 : Base de données
1. Requête SQL : `SELECT id, reference FROM expeditions WHERE reference = 'EXP202605051539004158'`
2. Le champ `id` contient l'UUID

## Amélioration future : Recherche par référence

Pour faciliter l'utilisation, une amélioration possible serait d'ajouter un système de recherche :

### Concept
```jsx
{/* Option 1 : Choisir le mode */}
<select value={searchMode} onChange={setSearchMode}>
  <option value="uuid">UUID</option>
  <option value="reference">Référence</option>
</select>

{searchMode === 'uuid' ? (
  <input type="text" placeholder="7b00cdc1-..." />
) : (
  <input type="text" placeholder="EXP-2024-001" />
)}

{/* Option 2 : Détection automatique */}
<input
  type="text"
  placeholder="UUID ou Référence"
  onChange={handleSmartSearch}
/>
```

### Implémentation
```javascript
const handleSmartSearch = async (value) => {
  // Détecter si c'est un UUID ou une référence
  if (uuidRegex.test(value)) {
    // C'est un UUID, utiliser directement
    setExpeditionId(value);
  } else {
    // C'est probablement une référence, rechercher l'UUID
    try {
      const expedition = await api.searchExpeditionByReference(value);
      setExpeditionId(expedition.id);
      toast.success(`Expédition trouvée : ${expedition.reference}`);
    } catch (error) {
      toast.error('Expédition non trouvée');
    }
  }
};
```

### Avantages
- ✅ Plus intuitif pour l'utilisateur
- ✅ Accepte référence ou UUID
- ✅ Conversion automatique
- ✅ Meilleure UX

### Inconvénients
- ⚠️ Nécessite une route API supplémentaire
- ⚠️ Appels réseau supplémentaires
- ⚠️ Gestion du cache à prévoir

## Tests recommandés

### Test 1 : UUID valide ✅
```
Input: 7b00cdc1-0194-4a5a-9619-fc3c28936971
Expected: Validation passe, transaction liée
```

### Test 2 : UUID invalide ❌
```
Input: 7b00cdc1-0194-4a5a-9619
Expected: Erreur "Format UUID invalide..."
```

### Test 3 : Référence ❌
```
Input: EXP202605051539004158
Expected: Erreur "Format UUID invalide..."
```

### Test 4 : Champ vide ✅
```
Input: (vide)
Expected: Validation passe, transaction générale
```

### Test 5 : UUID avec espaces ✅
```
Input: " 7b00cdc1-0194-4a5a-9619-fc3c28936971 "
Expected: Trim + validation passe
```

### Test 6 : Majuscules ✅
```
Input: 7B00CDC1-0194-4A5A-9619-FC3C28936971
Expected: Validation passe (case insensitive)
```

## Résumé des changements

| Fichier | Modification | Impact |
|---------|-------------|--------|
| `RecordTransactionModal.jsx` | Ajout validation UUID | ✅ Prévient erreurs SQL |
| `RecordTransactionModal.jsx` | Label "ID Expédition (UUID)" | ✅ Plus clair |
| `RecordTransactionModal.jsx` | Message d'aide amélioré | ✅ Guide l'utilisateur |
| `RecordTransactionModal.jsx` | Placeholder simplifié | ✅ Exemple visible |

## Conclusion

La validation empêche maintenant l'envoi de références au lieu d'UUID, évitant les erreurs SQL. L'utilisateur est guidé par :
- 📝 Un label explicite "ID Expédition (UUID)"
- 💡 Un message d'aide détaillé
- ⚠️ Un message d'erreur clair en cas de format invalide
- ✅ Un placeholder avec exemple d'UUID valide
