# 🛣️ Déduplication des trajets dans le dropdown

## 🎯 Problème résolu

Lorsque plusieurs tarifs existent pour la même ligne/pays avec des catégories différentes, le dropdown "Trajet disponible" affichait des doublons.

### Exemple avant correction
```
Trajet disponible:
- abidjan-marseille (tarif catégorie "Denrée alimentaire")
- abidjan-marseille (tarif catégorie "Documents")
- abidjan-marseille (tarif catégorie "Électronique")
- abidjan-lyon (tarif catégorie "Denrée alimentaire")
```

→ **3 fois "abidjan-marseille"** 😕

### Exemple après correction
```
Trajet disponible:
- abidjan-marseille ✅
- abidjan-lyon ✅
```

→ **Chaque trajet une seule fois** 😊

## ✅ Solution appliquée

### Logique de déduplication

La déduplication se fait en fonction du **type d'expédition** :

#### 1. **DHD (AERIEN ou MARITIME)**
- **Clé unique** : La **ligne** (ex: "abidjan-marseille")
- **Résultat** : Une seule entrée par ligne, peu importe le nombre de catégories

```javascript
if (currentType.includes('dhd')) {
    key = (tarif.ligne || "").toLowerCase().trim();
    // "abidjan-marseille" → 1 seule fois dans le dropdown
}
```

#### 2. **AFRIQUE**
- **Clé unique** : Le **pays** (ex: "GABON LIBREVILLE")
- **Résultat** : Une seule entrée par pays

```javascript
if (currentType === 'groupage_afrique') {
    key = (tarif.pays || "").toLowerCase().trim();
    // "GABON LIBREVILLE" → 1 seule fois
}
```

#### 3. **CA (Continental Africain)**
- **Clé unique** : **Ligne + Pays** (ex: "abidjan-dakar|sénégal")
- **Résultat** : Une seule entrée par combinaison ligne/pays

```javascript
if (currentType === 'groupage_ca') {
    key = `${tarif.ligne}|${tarif.pays}`;
    // "abidjan-dakar|sénégal" → 1 seule fois
}
```

### Algorithme de déduplication

```javascript
const uniqueRoutes = [];
const seenKeys = new Set();

for (const tarif of tarifsByType) {
    // Créer une clé unique selon le type
    let key = generateKey(tarif, currentType);
    
    // Si cette clé n'a pas encore été vue, ajouter le tarif
    if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueRoutes.push(tarif);
    }
}
```

### Caractéristiques importantes

1. **Insensible à la casse** : "Abidjan-Marseille" === "abidjan-marseille"
2. **Ignore les espaces** : `.trim()` pour éliminer les espaces en trop
3. **Ordre préservé** : Le premier tarif trouvé est celui affiché
4. **Performance** : Utilise un `Set` pour des recherches O(1)

## 📊 Logs de debug

Dans la console, vous verrez maintenant :

```
🛣️ Trajets disponibles: {
  total: 15,            // Nombre total de tarifs pour ce type
  uniques: 5,           // Nombre de trajets uniques affichés
  doublons_elimines: 10 // Nombre de doublons supprimés
}
```

## 🎨 Impact sur l'interface

### Dropdown "Trajet disponible"

**Avant :**
```
┌─────────────────────────────┐
│ Sélectionner un trajet    ▼ │
├─────────────────────────────┤
│ abidjan-marseille           │ ← Tarif 1 (Denrée)
│ abidjan-marseille           │ ← Tarif 2 (Documents)
│ abidjan-marseille           │ ← Tarif 3 (Électronique)
│ abidjan-lyon                │
│ abidjan-paris               │
│ abidjan-paris               │ ← Doublon
└─────────────────────────────┘
```

**Après :**
```
┌─────────────────────────────┐
│ Sélectionner un trajet    ▼ │
├─────────────────────────────┤
│ abidjan-marseille           │ ✅ Une seule fois
│ abidjan-lyon                │ ✅
│ abidjan-paris               │ ✅
└─────────────────────────────┘
```

## 🔍 Comportement détaillé

### Scénario 1 : DHD AERIEN avec 3 tarifs pour la même ligne

**Tarifs en base :**
```json
[
  { "ligne": "abidjan-marseille", "category_id": "A", "montant": 1500 },
  { "ligne": "abidjan-marseille", "category_id": "B", "montant": 1800 },
  { "ligne": "abidjan-marseille", "category_id": "C", "montant": 2000 }
]
```

**Dropdown affiche :**
- abidjan-marseille (1 seule fois)

**Lors de la sélection :**
- Le premier tarif trouvé est utilisé pour récupérer `ligne` et `pays`
- Le filtrage des catégories affichera **toutes les catégories** (A, B, C) pour cette ligne

### Scénario 2 : AFRIQUE avec plusieurs tarifs par pays

**Tarifs en base :**
```json
[
  { "pays": "GABON LIBREVILLE", "category_id": null, "montant": 2000 },
  { "pays": "GABON LIBREVILLE", "category_id": "A", "montant": 2500 },
  { "pays": "CONGO BRAZZAVILLE", "category_id": null, "montant": 1800 }
]
```

**Dropdown affiche :**
- GABON LIBREVILLE (1 seule fois)
- CONGO BRAZZAVILLE (1 seule fois)

### Scénario 3 : Lignes avec variations de casse

**Tarifs en base :**
```json
[
  { "ligne": "Abidjan-Marseille", ... },
  { "ligne": "abidjan-marseille", ... },
  { "ligne": "ABIDJAN-MARSEILLE", ... }
]
```

**Dropdown affiche :**
- Abidjan-Marseille (ou abidjan-marseille, selon le premier trouvé)

→ Les 3 sont considérés comme identiques grâce à `.toLowerCase()`

## ✅ Avantages

1. **UX améliorée** - Liste claire sans répétition
2. **Performance** - Moins d'options à afficher
3. **Clarté** - Un trajet = une sélection
4. **Compatible** - Fonctionne avec le filtrage des catégories
5. **Robuste** - Gère les variations de casse et espaces

## 🧪 Test

### Test 1 : Vérifier la déduplication
1. Sélectionner **GROUPAGE_DHD_AERIEN**
2. Ouvrir le dropdown "Trajet disponible"
3. Vérifier qu'aucune ligne n'apparaît en double
4. Regarder la console :
   ```
   🛣️ Trajets disponibles: { total: 15, uniques: 5, doublons_elimines: 10 }
   ```

### Test 2 : Vérifier que le filtrage fonctionne toujours
1. Sélectionner une ligne dans le dropdown
2. Vérifier que les catégories sont bien filtrées
3. Toutes les catégories de cette ligne devraient être disponibles

### Test 3 : Tester les différents types
- **DHD AERIEN** → Déduplication par ligne
- **DHD MARITIME** → Déduplication par ligne
- **AFRIQUE** → Déduplication par pays
- **CA** → Déduplication par ligne+pays

## 📝 Notes techniques

### Ordre de préservation
Le **premier tarif** rencontré pour une ligne/pays est celui qui est gardé dans le dropdown. L'ordre dépend de l'ordre de retour de l'API.

### Filtrage des catégories
Même si un seul trajet est affiché, le **filtrage des catégories** examine **tous les tarifs** de cette ligne pour afficher toutes les catégories disponibles.

**Exemple :**
- Dropdown : "abidjan-marseille" (1 fois)
- Catégories : ["Denrée alimentaire", "Documents", "Électronique"] (3 catégories de 3 tarifs différents)

### Compatibilité
Cette modification est **100% compatible** avec le système de filtrage des catégories existant.

## 🎯 Résultat final

**Le dropdown "Trajet disponible" affiche maintenant chaque trajet une seule fois, ce qui améliore significativement l'expérience utilisateur !** ✅

Les logs dans la console vous montrent combien de doublons ont été éliminés.
