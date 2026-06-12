# 🔧 Correction erreur 422 - Catégorie manquante

## ❌ Problème identifié

**Erreur HTTP 422** lors de la création d'expédition DHD (AERIEN ou MARITIME)

### Cause
L'API rejette le payload car le `category_id` est **obligatoire** pour les types DHD, mais il n'était pas inclus dans le payload si l'utilisateur ne sélectionnait pas de catégorie.

**Code problématique :**
```javascript
if (c.category_id) item.category_id = c.category_id;
```

Si `c.category_id` est vide (`""`), cette condition est `false` et le champ n'est pas ajouté au payload.

**Résultat :**
```json
{
  "colis": [
    {
      "designation": "Effets personnels",
      "poids": 10,
      // ❌ category_id manquant !
    }
  ]
}
```

→ API retourne **422 Unprocessable Entity**

## ✅ Solutions appliquées

### 1. Validation avant soumission
Empêcher la soumission si une catégorie DHD n'est pas sélectionnée :

```javascript
const handleSubmit = async () => {
    // Validation: Vérifier si les catégories sont requises et renseignées
    const isDHD = formData.type_expedition.includes('DHD');
    
    if (isDHD) {
        const missingCategories = formData.colis.filter(c => !c.category_id || c.category_id === "");
        if (missingCategories.length > 0) {
            toast.error(`❌ Veuillez sélectionner une catégorie pour ${missingCategories.length === 1 ? 'le colis' : `les ${missingCategories.length} colis`}`);
            return; // Arrête la soumission
        }
    }
    
    // ... suite du code
};
```

**Résultat :**
- Si catégorie manquante → Toast d'erreur + pas d'appel API
- Si catégorie présente → Soumission normale

### 2. Indicateur visuel obligatoire
Le label affiche maintenant une astérisque rouge :

```javascript
<label>
    Catégorie <span className="text-amber-600">*</span>
    <span className="text-xs text-slate-400 ml-2">
        ({filteredCategories.length} disponibles)
    </span>
</label>
```

### 3. Message d'avertissement
Si la catégorie n'est pas sélectionnée, un message s'affiche :

```javascript
{!c.category_id && (
    <p className="text-xs text-amber-600 mt-1">
        ⚠️ Catégorie obligatoire pour DHD
    </p>
)}
```

### 4. Logs détaillés du payload
Ajout de logs pour voir exactement ce qui est envoyé :

```javascript
console.log("✅ Validation passée - Payload à envoyer:", payload);
console.log("📦 Détails colis:", payload.colis.map((c, i) => ({
    index: i,
    designation: c.designation,
    category_id: c.category_id || "❌ MANQUANT",
    poids: c.poids
})));
```

## 🎯 Comportement après correction

### Scénario 1 : Catégorie sélectionnée ✅
```
1. Utilisateur sélectionne DHD AERIEN
2. Sélectionne une ligne "abidjan-marseille"
3. Sélectionne la catégorie "Denrée alimentaire"
4. Clique sur "Valider"
→ ✅ Validation OK
→ ✅ Payload envoyé avec category_id
→ ✅ Expédition créée
```

### Scénario 2 : Catégorie non sélectionnée ❌
```
1. Utilisateur sélectionne DHD AERIEN
2. Sélectionne une ligne "abidjan-marseille"
3. Ne sélectionne PAS de catégorie
4. Clique sur "Valider"
→ ❌ Toast: "Veuillez sélectionner une catégorie pour le colis"
→ ❌ Pas d'appel API
→ Le formulaire reste ouvert pour correction
```

### Scénario 3 : Type non-DHD
```
1. Utilisateur sélectionne GROUPAGE_AFRIQUE
2. Pas de champ catégorie affiché (optionnel)
3. Clique sur "Valider"
→ ✅ Validation OK (catégorie non requise)
→ ✅ Expédition créée
```

## 📊 Interface utilisateur

### Avant
```
┌─────────────────────────────┐
│ Catégorie                   │
│ ┌─────────────────────────┐ │
│ │ -- Choisir --         ▼ │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Après
```
┌─────────────────────────────┐
│ Catégorie * (3 disponibles) │
│ ┌─────────────────────────┐ │
│ │ -- Choisir --         ▼ │ │
│ └─────────────────────────┘ │
│ ⚠️ Catégorie obligatoire    │
│    pour DHD                 │
└─────────────────────────────┘
```

## 🔍 Logs dans la console

### Si catégorie manquante
```
❌ Colis sans catégorie: [
  { designation: "Effets", category_id: "", poids: "10" }
]
```
→ Toast d'erreur
→ Pas d'appel API

### Si catégorie présente
```
✅ Validation passée - Payload à envoyer: { ... }
📦 Détails colis: [
  {
    index: 0,
    designation: "Effets personnels",
    category_id: "482a2368-acd9-4cc8-84d5-87a3ab3c9152",
    poids: 10
  }
]
```
→ Appel API
→ Expédition créée

## ✅ Avantages

1. **Prévention de l'erreur 422** - Validation côté client avant l'API
2. **UX améliorée** - Message clair sur ce qui manque
3. **Indicateur visuel** - Astérisque rouge + compteur de catégories
4. **Debuggable** - Logs détaillés du payload et des validations
5. **Cohérent** - Appliqué à tous les types DHD (AERIEN et MARITIME)

## 🧪 Test

1. Sélectionner **GROUPAGE_DHD_AERIEN**
2. Sélectionner une **ligne**
3. Remplir les infos colis **SANS sélectionner de catégorie**
4. Cliquer sur **Valider**
5. Vérifier le toast d'erreur : "Veuillez sélectionner une catégorie pour le colis"
6. Sélectionner une **catégorie**
7. Cliquer sur **Valider**
8. Vérifier que l'expédition est créée ✅

## 📝 Notes

- La validation s'applique uniquement aux types **DHD** (AERIEN et MARITIME)
- Les autres types (AFRIQUE, CA, SIMPLE) peuvent avoir un `category_id` optionnel
- Le message d'avertissement "⚠️ Catégorie obligatoire pour DHD" s'affiche dès qu'aucune catégorie n'est sélectionnée

**L'erreur 422 ne devrait plus se produire pour cause de catégorie manquante !** ✅
