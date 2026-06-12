# 🔍 Debug du filtrage des catégories

## Problème identifié
Le filtrage des catégories basé sur la ligne sélectionnée ne fonctionne pas actuellement.

## 🛠️ Outils de debug ajoutés

### Console logs dans `filteredCategories`
Les logs suivants ont été ajoutés pour tracer l'exécution :

```
=== FILTRAGE CATEGORIES ===
Type actuel: [type d'expédition]
Route sélectionnée: [objet route complet]
Tous les tarifs: [tous les tarifs groupage]
Tarifs après filtre par type: [tarifs filtrés]
Filtrage par ligne: [ligne] et pays: [pays]
Tarif examiné: [détails de chaque tarif]
DHD/AFRIQUE/CA - Comparaison: [résultat de la comparaison]
Tarifs après filtre par ligne: [tarifs après filtrage]
Category IDs uniques: [IDs des catégories]
Catégories filtrées finales: [résultat final]
=========================
```

### Console logs dans `handleRouteSelect`
```
=== SELECTION ROUTE ===
Route ID sélectionné: [ID]
Route trouvée: [objet route]
Route sauvegardée dans le state: [objet route]
======================
```

## 📋 Étapes pour diagnostiquer

### 1. Ouvrir la console du navigateur
- Appuyez sur `F12` ou clic droit > "Inspecter"
- Onglet "Console"

### 2. Tester le scénario
1. Sélectionner un **type d'expédition** (ex: GROUPAGE_DHD_AERIEN)
2. Sélectionner une **ligne/trajet** dans le dropdown
3. Observer les logs dans la console

### 3. Analyser les logs

#### ✅ Vérifications à faire

**A. La route est-elle bien sauvegardée ?**
```javascript
=== SELECTION ROUTE ===
Route ID sélectionné: "123"
Route trouvée: { id: 123, ligne: "Abidjan-Paris", pays: "France", ... }
Route sauvegardée dans le state: { id: 123, ligne: "Abidjan-Paris", pays: "France", ... }
```
- ✅ Si vous voyez ces 3 lignes → La route est bien sauvegardée
- ❌ Si "Route trouvée" est `undefined` → Le tarif n'existe pas dans `availableRoutes`

**B. Le filtrage est-il déclenché ?**
```javascript
=== FILTRAGE CATEGORIES ===
Type actuel: "groupage_dhd_aerien"
Route sélectionnée: { id: 123, ligne: "Abidjan-Paris", ... }
```
- ✅ Si "Route sélectionnée" n'est pas `null` → Le filtrage devrait se faire
- ❌ Si "Route sélectionnée" est `null` → Le state n'est pas mis à jour

**C. Les tarifs sont-ils bien filtrés par type ?**
```javascript
Tous les tarifs: [tableau de 50 tarifs]
Tarifs après filtre par type: [tableau de 10 tarifs]
```
- ✅ Si le nombre diminue → Le filtrage par type fonctionne
- ❌ Si le tableau est vide → Aucun tarif ne correspond au type

**D. Les tarifs sont-ils bien filtrés par ligne ?**
```javascript
Filtrage par ligne: "Abidjan-Paris" et pays: "France"
Tarif examiné: { ligne: "Abidjan-Paris", pays: "France", category_id: 5 }
DHD - Comparaison ligne: Abidjan-Paris === Abidjan-Paris = true
Tarifs après filtre par ligne: [tableau de 3 tarifs]
```
- ✅ Si des comparaisons sont `true` → Le filtrage fonctionne
- ❌ Si toutes les comparaisons sont `false` → Problème de format/valeur

**E. Les catégories finales sont-elles correctes ?**
```javascript
Category IDs uniques: [5, 7, 12]
Catégories filtrées finales: [{ id: 5, nom: "Documents" }, ...]
```
- ✅ Si le tableau n'est pas vide → Le filtrage a fonctionné
- ❌ Si "Aucune catégorie trouvée" → Retour de toutes les catégories (fallback)

## 🐛 Problèmes possibles et solutions

### Problème 1 : Route non trouvée
**Symptôme** : `Route trouvée: undefined`

**Causes possibles** :
- L'ID de la route ne correspond pas aux IDs dans `availableRoutes`
- Le type de données ne correspond pas (string vs number)

**Solution** :
```javascript
// Vérifier le type de conversion dans handleRouteSelect
const route = availableRoutes.find(r => String(r.id) === String(routeId));
```

### Problème 2 : Comparaison de ligne échoue
**Symptôme** : Toutes les comparaisons retournent `false`

**Causes possibles** :
- Espaces en trop dans les valeurs
- Casse différente (majuscules/minuscules)
- Format de ligne différent

**Solution** :
```javascript
// Normaliser les valeurs avant comparaison
const normalizedTarifLigne = tarif.ligne?.trim().toLowerCase();
const normalizedRouteLigne = routeLigne?.trim().toLowerCase();
return normalizedTarifLigne === normalizedRouteLigne;
```

### Problème 3 : State non mis à jour
**Symptôme** : `Route sélectionnée: null` même après sélection

**Causes possibles** :
- React n'a pas encore mis à jour le state
- Le `useMemo` n'est pas déclenché

**Solution** :
- Vérifier que `selectedRoute` est bien dans les dépendances du `useMemo`
- Attendre un cycle de rendu supplémentaire

### Problème 4 : Aucun tarif correspondant
**Symptôme** : `Tarifs après filtre par ligne: []`

**Causes possibles** :
- Aucun tarif n'a été configuré pour cette ligne/catégorie
- Le champ `category_id` est `null` dans les tarifs

**Solution** :
- Vérifier dans la base de données que les tarifs ont bien un `category_id`
- S'assurer que les tarifs ont été créés pour la ligne sélectionnée

## 🎯 Actions recommandées

1. **Tester avec les logs activés** et copier les résultats de la console
2. **Identifier à quelle étape le filtrage échoue** selon les logs
3. **Appliquer la solution correspondante** (voir ci-dessus)
4. **Retirer les console.log** une fois le problème résolu

## 📝 Notes
- Les logs sont très verbeux pour faciliter le debug
- Une fois le problème identifié, nous pourrons les retirer
- Gardez un œil sur les valeurs `null` vs `undefined` vs chaînes vides
