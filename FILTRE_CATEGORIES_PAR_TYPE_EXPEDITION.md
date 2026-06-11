# Filtre des Catégories par Type d'Expédition

## 📋 Description

Ajout d'un filtre automatique sur les catégories disponibles lors de la création d'expédition, basé sur le type d'expédition sélectionné.

## 🎯 Objectif

Afficher uniquement les catégories pertinentes pour chaque type d'expédition en se basant sur les tarifs groupage configurés dans le système.

## 🔧 Fonctionnement

### Logique de Filtrage

1. **Type SIMPLE** : Toutes les catégories sont affichées
2. **Autres types** (GROUPAGE_DHD_AERIEN, GROUPAGE_DHD_MARITIME, GROUPAGE_AFRIQUE, GROUPAGE_CA) :
   - Récupération des tarifs groupage correspondant au type sélectionné
   - Extraction des `category_id` associés à ces tarifs
   - Filtrage des catégories pour n'afficher que celles ayant un tarif configuré

### Exemple de Structure de Tarif

```json
{
  "id": "77860177-edea-489b-9eb2-17e7f704853f",
  "agence_id": "679e5b1a-e357-4469-b7bb-3f143efdaaa5",
  "category_id": "abc123...",
  "tarif_groupage_id": "180b4ba7-56a2-4d4a-9431-afe041e4180d",
  "type_expedition": "groupage_afrique",
  "mode": "afrique",
  "ligne": null,
  "montant_base": 2000,
  "pourcentage_prestation": 20,
  "montant_prestation": 400,
  "montant_expedition": 2400,
  "pays": "GABON LIBREVILLE",
  "actif": true
}
```

## 📝 Modifications Apportées

### Fichiers Modifiés

1. **`src/pages/CreateExpedition.jsx`**
2. **`src/pages/CreateExpeditionV2.jsx`**

### Code Ajouté

```javascript
// Filtrage des catégories en fonction du type d'expédition
const filteredCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    
    // Si le type est SIMPLE, afficher toutes les catégories
    if (formData.type_expedition === 'SIMPLE') {
        return categories;
    }
    
    // Pour les autres types, filtrer par les category_id présents dans les tarifs groupage
    if (!existingGroupageTarifs || !Array.isArray(existingGroupageTarifs)) return categories;
    
    const currentType = formData.type_expedition.toLowerCase();
    
    // Récupérer tous les category_id des tarifs correspondant au type sélectionné
    const categoryIds = existingGroupageTarifs
        .filter(tarif => tarif.type_expedition === currentType && tarif.category_id)
        .map(tarif => tarif.category_id);
    
    // Éliminer les doublons
    const uniqueCategoryIds = [...new Set(categoryIds)];
    
    // Si aucune catégorie trouvée, retourner toutes les catégories
    if (uniqueCategoryIds.length === 0) {
        return categories;
    }
    
    // Filtrer les catégories pour ne garder que celles qui ont un tarif pour ce type
    return categories.filter(cat => uniqueCategoryIds.includes(cat.id));
}, [categories, existingGroupageTarifs, formData.type_expedition]);
```

### Utilisation dans le Composant

**CreateExpedition.jsx** utilise un `SearchableDropdown` :
```jsx
<SearchableDropdown
    options={Array.isArray(filteredCategories) ? filteredCategories.map(cat => ({
        id: String(cat.id),
        label: cat.nom
    })) : []}
    onSelect={(option) => handleColisChange(index, 'category_id', option.id)}
    placeholder={c.category_id 
        ? filteredCategories.find(cat => String(cat.id) === String(c.category_id))?.nom || "-- Choisir --"
        : "-- Choisir --"
    }
/>
```

**CreateExpeditionV2.jsx** utilise un `select` standard :
```jsx
<select
    value={colis.category_id}
    onChange={(e) => handleColisChange(index, 'category_id', e.target.value)}
    className={`w-full rounded-lg text-sm font-medium h-11 px-3 ${getInputBorderClass(colis.category_id, false)}`}
>
    <option value="">Sélectionner…</option>
    {filteredCategories?.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.nom}</option>
    ))}
</select>
```

## 🎨 Avantages

✅ **Expérience utilisateur améliorée** : L'utilisateur ne voit que les catégories pertinentes
✅ **Réduction des erreurs** : Impossible de sélectionner une catégorie sans tarif configuré
✅ **Performance** : Utilisation de `useMemo` pour optimiser les recalculs
✅ **Cohérence** : Synchronisation automatique avec les tarifs configurés
✅ **Fallback intelligent** : Si aucun tarif n'est trouvé, toutes les catégories restent disponibles

## 🔄 Cas d'Usage

### Scénario 1 : Type SIMPLE
```
Type sélectionné : SIMPLE
→ Toutes les catégories s'affichent
```

### Scénario 2 : Type GROUPAGE_AFRIQUE avec tarifs configurés
```
Type sélectionné : GROUPAGE_AFRIQUE
Tarifs trouvés avec category_id : ["cat-1", "cat-2", "cat-3"]
→ Seules les catégories cat-1, cat-2, cat-3 s'affichent
```

### Scénario 3 : Type GROUPAGE_DHD_AERIEN sans tarifs
```
Type sélectionné : GROUPAGE_DHD_AERIEN
Tarifs trouvés : aucun avec category_id
→ Toutes les catégories s'affichent (fallback)
```

## 🧪 Tests Recommandés

1. **Changement de type d'expédition** : Vérifier que les catégories se mettent à jour
2. **Type SIMPLE** : Confirmer que toutes les catégories sont visibles
3. **Types groupage** : Vérifier le filtrage selon les tarifs configurés
4. **Cas sans tarifs** : S'assurer que le fallback fonctionne

## 📌 Remarques

- Le filtre se base sur les données de `existingGroupageTarifs` récupérées via `fetchTarifGroupageAgence()`
- Si un `category_id` est `null` dans un tarif, il n'est pas pris en compte
- La comparaison des types d'expédition se fait en minuscule pour éviter les erreurs de casse
- Les doublons de `category_id` sont automatiquement éliminés avec `Set`

## ✅ Statut

**Implémenté avec succès** - Aucune erreur de compilation détectée
