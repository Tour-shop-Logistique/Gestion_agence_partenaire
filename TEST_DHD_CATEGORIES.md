# 🧪 Test du filtrage DHD avec category_id

## 📊 Données de test fournies

Vous avez deux tarifs DHD AERIEN avec des `category_id` :

```json
{
  "ligne": "abidjan-lyon",
  "category_id": "482a2368-acd9-4cc8-84d5-87a3ab3c9152",
  "category": { "nom": "Denrée alimentaire" }
}

{
  "ligne": "abidjan-marseille", 
  "category_id": "482a2368-acd9-4cc8-84d5-87a3ab3c9152",
  "category": { "nom": "Denrée alimentaire" }
}
```

## ✅ Améliorations appliquées

### 1. Comparaison insensible à la casse
Les comparaisons sont maintenant normalisées :
```javascript
const tarifLigne = (tarif.ligne || "").toLowerCase().trim();
const selectedLigne = (routeLigne || "").toLowerCase().trim();
```

**Pourquoi ?**
- Base de données : `"abidjan-lyon"` (minuscules)
- Interface : Pourrait afficher `"Abidjan-Lyon"` (majuscules)
- La comparaison fonctionne dans les deux cas

### 2. Gestion des espaces
Les valeurs sont "trimmées" (espaces retirés) :
```javascript
.trim()
```

### 3. Protection contre null/undefined
```javascript
(tarif.ligne || "")
```

## 📋 Scénario de test

### Test 1 : Ligne "abidjan-marseille"
1. Sélectionner **GROUPAGE_DHD_AERIEN**
2. Sélectionner la ligne **abidjan-marseille**
3. **Résultat attendu** : Seule la catégorie "Denrée alimentaire" devrait être disponible

**Logs attendus :**
```
=== FILTRAGE CATEGORIES ===
Type actuel: "groupage_dhd_aerien"
Route sélectionnée: { ligne: "abidjan-marseille", ... }
Tous les tarifs: [tous vos tarifs DHD]
Tarifs après filtre par type: [X tarifs DHD AERIEN]
Filtrage par ligne: "abidjan-marseille" et pays: "..."
Tarif examiné: { ligne: "abidjan-lyon", pays: "...", category_id: "482a2368..." }
DHD - Comparaison ligne: "abidjan-lyon" vs "abidjan-marseille" (normalisé: "abidjan-lyon" === "abidjan-marseille") = false
Tarif examiné: { ligne: "abidjan-marseille", pays: "France", category_id: "482a2368..." }
DHD - Comparaison ligne: "abidjan-marseille" vs "abidjan-marseille" (normalisé: "abidjan-marseille" === "abidjan-marseille") = true
Tarifs après filtre par ligne: [1 tarif]
Category IDs extraits (sans null): ["482a2368-acd9-4cc8-84d5-87a3ab3c9152"]
Category IDs uniques: ["482a2368-acd9-4cc8-84d5-87a3ab3c9152"]
Catégories filtrées finales: [{ id: "482a2368...", nom: "Denrée alimentaire" }]
=========================
```

### Test 2 : Ligne "abidjan-lyon"
1. Sélectionner **GROUPAGE_DHD_AERIEN**
2. Sélectionner la ligne **abidjan-lyon**
3. **Résultat attendu** : Seule la catégorie "Denrée alimentaire" devrait être disponible

**Logs attendus :**
```
=== FILTRAGE CATEGORIES ===
...
Tarif examiné: { ligne: "abidjan-lyon", pays: "Côte d'Ivoire", category_id: "482a2368..." }
DHD - Comparaison ligne: "abidjan-lyon" vs "abidjan-lyon" (normalisé: "abidjan-lyon" === "abidjan-lyon") = true
Tarifs après filtre par ligne: [1 tarif]
Category IDs uniques: ["482a2368-acd9-4cc8-84d5-87a3ab3c9152"]
Catégories filtrées finales: [{ id: "482a2368...", nom: "Denrée alimentaire" }]
=========================
```

### Test 3 : Changement de ligne
1. Sélectionner **abidjan-marseille** → Catégories : ["Denrée alimentaire"]
2. Changer pour **abidjan-lyon** → Catégories : ["Denrée alimentaire"] (même résultat car même catégorie)
3. Si vous aviez une ligne avec une catégorie différente, les catégories changeraient

## 🎯 Exemple avec plusieurs catégories

Imaginons que vous ajoutiez ces tarifs :

```json
// Ligne abidjan-marseille
{ "ligne": "abidjan-marseille", "category_id": "482a2368...", "category": "Denrée alimentaire" }
{ "ligne": "abidjan-marseille", "category_id": "abc123...", "category": "Documents" }

// Ligne abidjan-lyon
{ "ligne": "abidjan-lyon", "category_id": "482a2368...", "category": "Denrée alimentaire" }
```

**Résultat :**
- Ligne **abidjan-marseille** → 2 catégories : "Denrée alimentaire", "Documents"
- Ligne **abidjan-lyon** → 1 catégorie : "Denrée alimentaire"

## ✅ Points à vérifier

### 1. La ligne apparaît-elle dans le dropdown ?
Vérifier que le select "Trajet disponible" affiche bien :
- abidjan-lyon
- abidjan-marseille

### 2. Les logs s'affichent-ils ?
Ouvrir la console et vérifier les logs "=== FILTRAGE CATEGORIES ==="

### 3. La catégorie est-elle filtrée ?
Vérifier que seules les catégories avec un tarif pour la ligne sélectionnée sont disponibles

### 4. La comparaison fonctionne-t-elle ?
Dans les logs, vérifier que :
```
DHD - Comparaison ligne: "abidjan-marseille" vs "abidjan-marseille" (normalisé: ...) = true
```

## 🐛 Diagnostics si ça ne fonctionne pas

### Problème A : Toutes les catégories s'affichent
**Symptôme** : Même après sélection de ligne, toutes les catégories sont disponibles

**Vérifier dans les logs :**
```
Tarifs après filtre par ligne: []  ❌ Aucun tarif trouvé
```

**Causes possibles :**
1. La ligne dans le tarif ne correspond pas
2. Le type d'expédition ne correspond pas
3. Problème de format

**Solution :**
Copier les logs complets et vérifier :
- La valeur exacte de `tarif.ligne`
- La valeur exacte de `routeLigne`
- Le résultat de la comparaison

### Problème B : Aucune catégorie ne s'affiche
**Symptôme** : Le dropdown de catégories est vide

**Vérifier dans les logs :**
```
Category IDs uniques: ["482a2368..."]
Catégories filtrées finales: []  ❌ Aucune catégorie trouvée
```

**Cause :** L'ID de catégorie dans le tarif ne correspond à aucune catégorie chargée

**Solution :**
1. Vérifier que les catégories sont bien chargées : `console.log("Toutes catégories:", categories)`
2. Vérifier que l'ID correspond : comparer `tarif.category_id` avec `categories[].id`

### Problème C : Les logs ne s'affichent pas
**Symptôme** : Aucun log "=== FILTRAGE CATEGORIES ===" n'apparaît

**Cause :** Le `useMemo` ne se re-exécute pas

**Solution :**
1. Vérifier que le log `🎯 selectedRoute a changé` apparaît
2. Si oui : problème avec les dépendances du `useMemo`
3. Si non : le state `selectedRoute` n'est pas mis à jour

## 📝 Résultats attendus

Avec vos données actuelles :

| Type | Ligne | Catégories disponibles |
|------|-------|------------------------|
| DHD AERIEN | abidjan-marseille | Denrée alimentaire |
| DHD AERIEN | abidjan-lyon | Denrée alimentaire |
| AFRIQUE | GABON LIBREVILLE | Toutes (category_id = null) |
| AFRIQUE | CONGO BRAZZAVILLE | Toutes (category_id = null) |

## 🚀 Prochaines étapes

1. **Tester** avec DHD AERIEN et sélectionner une ligne
2. **Copier les logs** de la console
3. **Vérifier** que seule "Denrée alimentaire" est disponible
4. **Me partager les logs** si ça ne fonctionne pas comme prévu

Le filtrage devrait maintenant fonctionner **parfaitement** pour vos lignes DHD ! 🎯
