# ✅ Catégorie uniquement pour DHD

## 🎯 Modifications appliquées dans CreateExpeditionV2.jsx

### 1. Champ catégorie affiché uniquement pour DHD
Le champ de sélection de catégorie n'apparaît maintenant **QUE** pour les types :
- ✅ **GROUPAGE_DHD_AERIEN**
- ✅ **GROUPAGE_DHD_MARITIME**

Les autres types n'affichent **PAS** le champ catégorie :
- ❌ SIMPLE
- ❌ GROUPAGE_AFRIQUE  
- ❌ GROUPAGE_CA

### 2. Filtrage désactivé pour les types non-DHD
Pour les types SIMPLE, AFRIQUE et CA :
- **Toutes les catégories** sont disponibles (pas de filtrage)
- Pas de restriction par ligne/pays
- Liste complète des produits

## 📊 Comportement par type

| Type d'expédition | Champ catégorie affiché ? | Filtrage des catégories ? | Obligatoire ? |
|-------------------|---------------------------|---------------------------|---------------|
| **DHD AERIEN** | ✅ Oui | ✅ Oui (par ligne) | ✅ Oui |
| **DHD MARITIME** | ✅ Oui | ✅ Oui (par ligne) | ✅ Oui |
| **SIMPLE** | ❌ Non | ❌ Non (toutes) | ❌ Non |
| **AFRIQUE** | ❌ Non | ❌ Non (toutes) | ❌ Non |
| **CA** | ❌ Non | ❌ Non (toutes) | ❌ Non |

## 🎨 Interface utilisateur

### Pour DHD (AERIEN ou MARITIME)
```
┌─────────────────────────────────────┐
│ Désignation *                       │
│ ┌─────────────────────────────────┐ │
│ │ Effets personnels             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Catégorie * (3 disponibles)         │ ← AFFICHÉ
│ ┌─────────────────────────────────┐ │
│ │ Denrée alimentaire            ▼ │ │
│ └─────────────────────────────────┘ │
│ ⚠️ Catégorie obligatoire pour DHD   │
└─────────────────────────────────────┘
```

### Pour SIMPLE, AFRIQUE, CA
```
┌─────────────────────────────────────┐
│ Désignation *                       │
│ ┌─────────────────────────────────┐ │
│ │ Effets personnels             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

[PAS DE CHAMP CATÉGORIE]  ← NON AFFICHÉ

┌─────────────────────────────────────┐
│ Poids (kg) *                        │
│ ┌─────────────────────────────────┐ │
│ │ 10.5                          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔍 Logique de filtrage mise à jour

```javascript
const filteredCategories = useMemo(() => {
    const currentType = formData.type_expedition.toLowerCase();
    const isDHD = currentType.includes('dhd');
    
    // Pour les types NON-DHD, retourner TOUTES les catégories
    if (!isDHD) {
        return categories; // Pas de filtrage
    }
    
    // === Pour DHD uniquement ===
    // Filtrage par type + ligne sélectionnée
    // ...
}, [categories, existingGroupageTarifs, formData.type_expedition, selectedRoute]);
```

## ✅ Avantages

### Pour les types DHD
1. **Catégorie obligatoire** - Validée avant soumission
2. **Filtrage intelligent** - Uniquement les catégories tarifées pour la ligne
3. **Compteur visible** - Nombre de catégories disponibles affiché
4. **Message d'avertissement** - Si catégorie non sélectionnée

### Pour les types non-DHD
1. **Interface simplifiée** - Pas de champ catégorie inutile
2. **Tous les produits** - Liste complète sans restriction
3. **Flexibilité** - Pas de contrainte de sélection
4. **UX optimisée** - Moins de champs à remplir

## 🧪 Test

### Test 1 : DHD AERIEN
1. Sélectionner **GROUPAGE_DHD_AERIEN**
2. ✅ Le champ **"Catégorie *"** doit apparaître
3. ✅ Affiche le nombre de catégories disponibles
4. ✅ Message d'avertissement si non rempli
5. ✅ Validation bloque la soumission si vide

### Test 2 : SIMPLE
1. Sélectionner **SIMPLE**
2. ❌ Le champ **"Catégorie"** ne doit PAS apparaître
3. ✅ Passer directement au poids/dimensions
4. ✅ Soumission fonctionne sans catégorie

### Test 3 : AFRIQUE
1. Sélectionner **GROUPAGE_AFRIQUE**
2. ❌ Le champ **"Catégorie"** ne doit PAS apparaître
3. ✅ Tous les produits disponibles sans restriction
4. ✅ Soumission fonctionne sans catégorie

### Test 4 : Changement de type
1. Sélectionner **DHD AERIEN** → Champ catégorie visible
2. Sélectionner une catégorie
3. Changer pour **SIMPLE** → Champ catégorie disparaît
4. Revenir à **DHD AERIEN** → Champ catégorie réapparaît (vide)

## 📝 Notes techniques

### Condition d'affichage
```jsx
{formData.type_expedition.includes('DHD') && (
    <div>
        {/* Champ catégorie */}
    </div>
)}
```

Cette condition capture :
- ✅ `GROUPAGE_DHD_AERIEN` (contient "DHD")
- ✅ `GROUPAGE_DHD_MARITIME` (contient "DHD")
- ❌ `SIMPLE` (ne contient pas "DHD")
- ❌ `GROUPAGE_AFRIQUE` (ne contient pas "DHD")
- ❌ `GROUPAGE_CA` (ne contient pas "DHD")

### Validation conditionnelle
La validation dans `handleSubmit` vérifie uniquement pour DHD :

```javascript
const isDHD = formData.type_expedition.includes('DHD');

if (isDHD) {
    // Vérifier que les catégories sont sélectionnées
    const missingCategories = formData.colis.filter(c => !c.category_id);
    if (missingCategories.length > 0) {
        toast.error("Veuillez sélectionner une catégorie pour les colis");
        return; // Bloquer la soumission
    }
}
```

### Payload envoyé
- **Pour DHD** : `category_id` inclus dans le payload (obligatoire)
- **Pour autres types** : `category_id` peut être absent ou vide (optionnel)

## 🎯 Résultat final

Le champ catégorie est maintenant :
- ✅ **Visible et obligatoire** pour DHD (AERIEN et MARITIME)
- ✅ **Filtré intelligemment** par ligne sélectionnée
- ✅ **Masqué pour les autres types** (SIMPLE, AFRIQUE, CA)
- ✅ **Liste complète des produits** pour les types non-DHD

**L'interface s'adapte automatiquement au type d'expédition sélectionné !** 🚀
