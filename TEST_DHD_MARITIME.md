# 🧪 Test DHD MARITIME - Filtrage des catégories

## ✅ Confirmation : Le filtre est déjà actif !

Le code utilise `currentType.includes('dhd')` qui **inclut automatiquement** :
- ✅ `groupage_dhd_aerien`
- ✅ `groupage_dhd_maritime`

**Le même filtrage s'applique aux deux !**

## 📋 Test à effectuer

### Étape 1 : Vérifier l'affichage du sélecteur
1. Sélectionner **GROUPAGE_DHD_MARITIME**
2. Vérifier que le champ **"Catégorie"** apparaît bien dans le formulaire colis
3. Si vous ne le voyez pas → Problème avec la condition `formData.type_expedition.includes('DHD')`

### Étape 2 : Vérifier le nombre de catégories
1. Regarder le label : **"Catégorie (X disponibles)"**
2. Noter le nombre X

**Interprétation :**
- `(0 disponible)` → Aucun tarif DHD MARITIME trouvé OU aucun avec category_id
- `(15 disponibles)` → Tous les tarifs DHD MARITIME ont category_id = null (universel)
- `(2-3 disponibles)` → Filtrage actif, tarifs avec category_id spécifiques ✅

### Étape 3 : Sélectionner une ligne
1. Sélectionner une ligne dans "Trajet disponible"
2. Observer si le nombre de catégories change
3. Ouvrir la console et chercher :

```
🔵 useMemo filteredCategories DÉCLENCHÉ
=== FILTRAGE CATEGORIES ===
Type actuel: "groupage_dhd_maritime"
Route sélectionnée: { ligne: "...", ... }
Tarifs après filtre par type: [X tarifs]
DHD - Comparaison ligne: "..." vs "..." = true/false
Tarifs après filtre par ligne: [Y tarifs]
Category IDs uniques: [...]
Catégories filtrées finales: [...]
=========================
```

## 🔍 Diagnostics possibles

### Cas A : "0 disponible"
**Cause 1 : Aucun tarif DHD MARITIME**
```
Tarifs après filtre par type: []
```
→ Vous n'avez aucun tarif configuré pour DHD MARITIME

**Cause 2 : Aucune correspondance de ligne**
```
Tarifs après filtre par type: [3 tarifs]
Tarifs après filtre par ligne: []
```
→ La ligne sélectionnée ne correspond à aucun tarif

**Cause 3 : Tous les category_id sont null**
```
Category IDs extraits (sans null): []
⚠️ Aucun category_id dans les tarifs (tarifs universels)
```
→ Vos tarifs DHD MARITIME n'ont pas de category_id (voir Cas B)

### Cas B : Toutes les catégories affichées
```
⚠️ Aucun category_id dans les tarifs (tarifs universels) - Retour de toutes les catégories
```

**Cela signifie :**
Vos tarifs DHD MARITIME ont `category_id: null`

**Exemple de vos données :**
```json
{
  "type_expedition": "groupage_dhd_maritime",
  "ligne": "abidjan-marseille",
  "category_id": null,  ← Tarif universel
  "montant_base": 3000
}
```

**C'est normal si :**
- Vous voulez que toutes les catégories soient disponibles pour DHD MARITIME
- Vous n'avez pas encore configuré de restrictions par catégorie

**Pour activer le filtrage :**
Configurez des tarifs avec des `category_id` spécifiques :
```json
{
  "type_expedition": "groupage_dhd_maritime",
  "ligne": "abidjan-marseille",
  "category_id": "482a2368-acd9-4cc8-84d5-87a3ab3c9152",  ← ID de catégorie
  "montant_base": 3000
}
```

### Cas C : Quelques catégories seulement (filtrage actif) ✅
```
Category IDs uniques: ["482a2368...", "abc123..."]
Catégories filtrées finales: [2 catégories]
```

**Parfait !** Le filtrage fonctionne correctement.

## 📊 Exemple concret

### Scénario : 2 lignes DHD MARITIME

**Tarifs configurés :**
```json
// Ligne 1 : abidjan-marseille
{
  "ligne": "abidjan-marseille",
  "type_expedition": "groupage_dhd_maritime",
  "category_id": "482a2368...",  // Denrée alimentaire
}

// Ligne 2 : abidjan-paris
{
  "ligne": "abidjan-paris",
  "type_expedition": "groupage_dhd_maritime",
  "category_id": "abc123...",     // Documents
}
{
  "ligne": "abidjan-paris",
  "type_expedition": "groupage_dhd_maritime",
  "category_id": "def456...",     // Électronique
}
```

**Résultat attendu :**
- Sélection **abidjan-marseille** → 1 catégorie : "Denrée alimentaire"
- Sélection **abidjan-paris** → 2 catégories : "Documents", "Électronique"

## 🎯 Actions à faire maintenant

### Option 1 : Vérifier l'état actuel
1. Tester DHD MARITIME avec une ligne
2. Regarder le nombre de catégories affichées
3. M'envoyer les logs de la console

### Option 2 : Configurer des category_id
Si vous voyez toutes les catégories (tarif universel) et voulez filtrer :
1. Aller dans votre interface de gestion des tarifs
2. Éditer les tarifs DHD MARITIME
3. Attribuer un `category_id` à chaque tarif
4. Retester

### Option 3 : Garder les tarifs universels
Si vous voulez que toutes les catégories soient disponibles pour DHD MARITIME :
→ **Ne rien faire**, c'est le comportement actuel et c'est normal !

## 📝 Résumé

| Type | Filtre par ligne | Filtre par catégorie | Depuis |
|------|------------------|----------------------|---------|
| DHD AERIEN | ✅ | ✅ (si category_id) | Déjà actif |
| DHD MARITIME | ✅ | ✅ (si category_id) | **Déjà actif** |
| AFRIQUE | ✅ (par pays) | ✅ (si category_id) | Déjà actif |
| CA | ✅ (ligne+pays) | ✅ (si category_id) | Déjà actif |
| SIMPLE | ❌ | ❌ (toutes) | Normal |

**Le filtre pour DHD MARITIME est déjà en place et fonctionne de la même manière que DHD AERIEN !**

La question est : **Avez-vous des tarifs DHD MARITIME avec des `category_id` ?**

Si oui → Le filtrage devrait fonctionner
Si non → Toutes les catégories sont affichées (comportement normal pour tarif universel)
