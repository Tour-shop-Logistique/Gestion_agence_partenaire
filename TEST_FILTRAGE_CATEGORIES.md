# 🧪 Guide de test du filtrage des catégories

## 🔍 Nouveaux logs ajoutés

### 1. Traçage du changement de selectedRoute
```
🎯 selectedRoute a changé: { id: 123, ligne: "Abidjan-Paris", ... }
```
- Se déclenche **chaque fois** que selectedRoute change
- Devrait apparaître quand vous sélectionnez une ligne

### 2. Traçage du useEffect de réinitialisation
```
🔄 useEffect déclenché - selectedRoute a changé: { ... }
🔄 Catégories disponibles: 5
🔄 IDs de catégories valides: ["1", "2", "3"]
```

### 3. Logs de filtrage (déjà présents)
```
=== SELECTION ROUTE ===
Route ID sélectionné: "123"
...
=== FILTRAGE CATEGORIES ===
Type actuel: "groupage_dhd_aerien"
...
```

## 📋 Procédure de test

### Étape 1 : Préparer l'environnement
1. Ouvrir la page de création d'expédition
2. Ouvrir la console du navigateur (F12)
3. Vider la console (clic droit > Clear console)

### Étape 2 : Sélectionner un type
1. Sélectionner un type d'expédition (ex: **GROUPAGE_DHD_AERIEN**)
2. **Observer dans la console** - Vous devriez voir :
   ```
   🎯 selectedRoute a changé: null
   === FILTRAGE CATEGORIES ===
   Type actuel: "groupage_dhd_aerien"
   Route sélectionnée: null
   ...
   ```

### Étape 3 : Sélectionner une ligne
1. Dans le dropdown "Trajet disponible", sélectionner une ligne (ex: **Abidjan-Paris**)
2. **Observer dans la console** - Vous devriez voir **DANS CET ORDRE** :
   ```
   === SELECTION ROUTE ===
   Route ID sélectionné: "123"
   Route trouvée: { id: 123, ligne: "Abidjan-Paris", pays: "France", ... }
   Route sauvegardée dans le state: { id: 123, ligne: "Abidjan-Paris", ... }
   ======================
   
   🎯 selectedRoute a changé: { id: 123, ligne: "Abidjan-Paris", ... }
   
   === FILTRAGE CATEGORIES ===
   Type actuel: "groupage_dhd_aerien"
   Route sélectionnée: { id: 123, ligne: "Abidjan-Paris", ... }
   Tous les tarifs: [array de tarifs]
   Tarifs après filtre par type: [array réduit]
   Filtrage par ligne: "Abidjan-Paris" et pays: "France"
   Tarif examiné: { ligne: "...", pays: "...", category_id: ... }
   DHD - Comparaison ligne: ... === ... = true/false
   ...
   Tarifs après filtre par ligne: [array final]
   Category IDs uniques: [1, 2, 3]
   Catégories filtrées finales: [array de catégories]
   =========================
   ```

## ❌ Diagnostics des problèmes

### Problème A : Aucun log n'apparaît
**Symptôme** : La console reste vide

**Causes possibles** :
1. La console est filtrée (vérifier qu'elle affiche "All levels")
2. Le fichier n'a pas été sauvegardé/rechargé
3. Le build n'a pas été relancé

**Solutions** :
- Rafraîchir la page (Ctrl+F5)
- Vérifier que le serveur de dev tourne
- Redémarrer le serveur si nécessaire

### Problème B : Logs de sélection mais pas de filtrage
**Symptôme** :
```
=== SELECTION ROUTE ===
...
======================

🎯 selectedRoute a changé: { ... }

❌ PAS DE "=== FILTRAGE CATEGORIES ==="
```

**Cause** : Le `useMemo` ne se re-exécute pas

**Solutions** :
1. Vérifier que `selectedRoute` est dans les dépendances du `useMemo`
2. Vérifier qu'il n'y a pas d'erreur JavaScript dans la console
3. Copier **tous les logs** et me les envoyer

### Problème C : selectedRoute reste null
**Symptôme** :
```
=== SELECTION ROUTE ===
Route ID sélectionné: "123"
Route trouvée: undefined
...

🎯 selectedRoute a changé: null
```

**Cause** : La route n'est pas trouvée dans `availableRoutes`

**Solutions** :
1. Vérifier que des trajets sont configurés pour ce type
2. Ajouter un log pour voir `availableRoutes` :
   ```javascript
   console.log("Routes disponibles:", availableRoutes);
   ```

### Problème D : Filtrage s'exécute mais retourne toutes les catégories
**Symptôme** :
```
=== FILTRAGE CATEGORIES ===
...
Tarifs après filtre par ligne: []
Category IDs uniques: []
Aucune catégorie trouvée, retour de toutes les catégories
Catégories filtrées finales: [toutes les catégories]
```

**Cause** : Aucun tarif ne correspond à la ligne sélectionnée

**Solutions possibles** :
1. **Problème de données** : Vérifier dans la BDD que des tarifs existent pour cette ligne
2. **Problème de format** : Les valeurs de `ligne` ou `pays` ne correspondent pas exactement
   - Vérifier les espaces en trop
   - Vérifier la casse (majuscules/minuscules)
3. **Problème de type** : Le `type_expedition` dans les tarifs ne correspond pas

### Problème E : Comparaisons toujours false
**Symptôme** :
```
Tarif examiné: { ligne: "Abidjan-Paris", pays: "France", category_id: 5 }
DHD - Comparaison ligne: Abidjan-Paris === Abidjan-Paris = false
```

**Cause** : Problème de format/type des données

**Solutions** :
1. Ajouter des logs pour voir le type exact :
   ```javascript
   console.log("Type de tarif.ligne:", typeof tarif.ligne, `"${tarif.ligne}"`);
   console.log("Type de routeLigne:", typeof routeLigne, `"${routeLigne}"`);
   ```
2. Normaliser la comparaison :
   ```javascript
   return tarif.ligne?.trim() === routeLigne?.trim();
   ```

## 📊 Informations à fournir si ça ne marche pas

Si le filtrage ne fonctionne toujours pas, copiez-moi :

1. **Tous les logs de la console** (de préférence en format texte)
2. **Le type d'expédition sélectionné**
3. **La ligne sélectionnée**
4. **Le nombre de catégories affichées** (toutes ou filtrées ?)

### Format pour copier les logs
1. Clic droit dans la console
2. "Save as..." ou copier le texte
3. Me l'envoyer

## 🎯 Résultat attendu

Une fois que tout fonctionne, vous devriez voir :

1. ✅ Logs de sélection de route
2. ✅ Log `🎯 selectedRoute a changé`
3. ✅ Logs de filtrage des catégories
4. ✅ Les catégories affichées dans l'interface sont filtrées selon la ligne

**Et surtout** : Quand vous changez de ligne, les catégories disponibles changent aussi !

## 🚀 Test final

Pour vérifier que tout fonctionne :
1. Sélectionner "GROUPAGE_DHD_AERIEN"
2. Sélectionner une ligne "Abidjan-Paris"
3. Noter les catégories disponibles
4. Changer pour une autre ligne "Abidjan-Lyon"
5. Les catégories devraient être différentes (si les tarifs diffèrent)
