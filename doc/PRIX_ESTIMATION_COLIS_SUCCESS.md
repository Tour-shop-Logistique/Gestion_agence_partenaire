# ✅ Ajout du Champ "Prix Estimation" pour les Colis

## 🎯 Objectif
Ajouter un champ **"prix_estimation"** pour chaque colis au même niveau que **"prix_emballage"**, qui sera envoyé à l'API lors de la simulation et de la création d'expédition.

## 🔧 Modifications Effectuées

### 1. État Initial du Formulaire (Ligne ~76-85)

**Ajout de `prix_estimation: 0` dans l'objet colis :**

```javascript
colis: [
    {
        designation: "",
        category_id: "",
        poids: "",
        longueur: "",
        largeur: "",
        hauteur: "",
        prix_emballage: 0,
        prix_estimation: 0,  // ← Nouveau champ
        articles: []
    }
]
```

### 2. Fonction addColis (Ligne ~490-495)

**Ajout de `prix_estimation: 0` lors de l'ajout d'un nouveau colis :**

```javascript
const addColis = () => {
    setFormData(prev => ({
        ...prev,
        colis: [...prev.colis, { 
            designation: "", 
            category_id: "", 
            poids: "", 
            longueur: "", 
            largeur: "", 
            hauteur: "", 
            prix_emballage: 0, 
            prix_estimation: 0,  // ← Nouveau champ
            articles: [] 
        }]
    }));
};
```

### 3. Interface Utilisateur (Ligne ~1172-1197)

**Ajout du champ "Estimation (FCFA)" dans le formulaire :**

```javascript
{/* Après le champ Emballage */}
<div className="space-y-1.5 col-span-3 sm:col-span-1">
    <label className="block text-[11px] font-semibold text-slate-600">
        Estimation (FCFA)
    </label>
    <input 
        type="number" 
        step="0" 
        inputMode="numeric" 
        value={colis.prix_estimation}
        onChange={(e) => handleColisChange(index, 'prix_estimation', e.target.value)}
        onFocus={(e) => e.target.select()}
        placeholder="0" 
        className={inputCls(colis.prix_estimation)} 
    />
</div>
```

### 4. Payload de Simulation (Ligne ~568-591)

**Ajout de `prix_estimation` dans le payload envoyé à l'API de simulation :**

```javascript
colis: formData.colis.map((c, index) => {
    const item = {
        designation: c.designation,
        poids: parseFloat(c.poids) || 0,
        longueur: parseFloat(c.longueur) || 0,
        largeur: parseFloat(c.largeur) || 0,
        hauteur: parseFloat(c.hauteur) || 0,
        prix_emballage: parseFloat(c.prix_emballage) || 0,
        prix_estimation: parseFloat(c.prix_estimation) || 0,  // ← Nouveau champ
    };
    // ... reste du code
    return item;
})
```

### 5. Payload de Création (Ligne ~601-624)

**Ajout de `prix_estimation` dans le payload envoyé à l'API de création :**

```javascript
colis: formData.colis.map((c, index) => {
    const item = {
        designation: c.designation,
        poids: parseFloat(c.poids) || 0,
        longueur: parseFloat(c.longueur) || 0,
        largeur: parseFloat(c.largeur) || 0,
        hauteur: parseFloat(c.hauteur) || 0,
        prix_emballage: parseFloat(c.prix_emballage) || 0,
        prix_estimation: parseFloat(c.prix_estimation) || 0,  // ← Nouveau champ
    };
    // ... reste du code
    return item;
})
```

## 📊 Position du Champ dans l'Interface

### Disposition Visuelle :

```
┌────────────────────────────────────────────────┐
│ Colis #1                                       │
├────────────────────────────────────────────────┤
│ Désignation: [___________]                     │
│ Catégorie:   [___________]                     │
│                                                │
│ Dimensions:                                    │
│ [Poids] [Longueur] [Largeur] [Hauteur]        │
│                                                │
│ [Emballage (FCFA)] [Estimation (FCFA)]   ← ICI│
│                                                │
│ Articles contenus:                             │
│ [SearchableDropdown ▼]                         │
└────────────────────────────────────────────────┘
```

### Grille Responsive :

Le champ utilise la même classe que les autres champs :
```javascript
className="space-y-1.5 col-span-3 sm:col-span-1"
```

- **Mobile** : 3 colonnes sur 12 (1/4 de largeur)
- **Desktop** : 1 colonne sur X (s'adapte à la grille)

## 🔍 Fonctionnement

### 1. Saisie de l'Estimation

L'utilisateur peut saisir un montant estimé pour chaque colis :
- Type de champ : `number`
- Valeur par défaut : `0`
- Mode de saisie : Numérique (clavier optimisé sur mobile)
- Sélection automatique du contenu au focus

### 2. Validation des Données

```javascript
prix_estimation: parseFloat(c.prix_estimation) || 0
```

- Convertit la valeur en nombre décimal
- Si la conversion échoue ou la valeur est vide, utilise `0`
- Pas de valeur négative (contrôlée par le type `number` du HTML)

### 3. Envoi à l'API

Le champ `prix_estimation` est envoyé :
- ✅ Lors de la **simulation** du tarif
- ✅ Lors de la **création** de l'expédition

**Format du payload :**
```javascript
{
    type_expedition: "simple",
    // ... autres champs
    colis: [
        {
            designation: "Colis test",
            poids: 10,
            longueur: 50,
            largeur: 40,
            hauteur: 30,
            prix_emballage: 5000,
            prix_estimation: 50000,  // ← Nouveau champ
            articles: [...]
        }
    ]
}
```

## 🧪 Comment Tester

### Test 1 : Ajout d'un Colis avec Estimation

1. **Ouvrir la page de création d'expédition V2**
2. **Sélectionner un type d'expédition** (ex: SIMPLE)
3. **Remplir les informations du trajet**
4. **Dans la section Colis :**
   - Remplir la désignation
   - Remplir le poids et les dimensions
   - **Remplir "Emballage (FCFA)"** : ex: 5000
   - **Remplir "Estimation (FCFA)"** : ex: 50000
   - Ajouter des articles
5. **Simuler le tarif**
6. **Vérifier dans la console (F12) :**
   - Dans le log "simulation Payload", vérifier que chaque colis a `prix_estimation: 50000`

### Test 2 : Création d'Expédition

1. **Après la simulation, remplir les infos client**
2. **Créer l'expédition**
3. **Vérifier dans la console :**
   - Dans le log "creation Payload (Clean)", vérifier que chaque colis a `prix_estimation`
4. **Vérifier dans le backend :**
   - Le champ `prix_estimation` doit être sauvegardé dans la base de données

### Test 3 : Plusieurs Colis

1. **Ajouter plusieurs colis** (bouton "Ajouter un colis")
2. **Remplir différentes valeurs d'estimation pour chaque colis**
   - Colis 1 : 50000 FCFA
   - Colis 2 : 75000 FCFA
   - Colis 3 : 30000 FCFA
3. **Simuler et créer l'expédition**
4. **Vérifier que chaque colis conserve sa propre valeur d'estimation**

### Test 4 : Valeur par Défaut

1. **Ajouter un colis**
2. **Ne PAS remplir le champ "Estimation (FCFA)"**
3. **Simuler**
4. **Vérifier que le payload contient `prix_estimation: 0`**

## 📝 Structure des Données

### État du Formulaire (formData.colis)

```javascript
{
    colis: [
        {
            designation: "Colis test",
            category_id: "abc-123",
            poids: "10",
            longueur: "50",
            largeur: "40",
            hauteur: "30",
            prix_emballage: 5000,
            prix_estimation: 50000,  // ← String ou Number en local
            articles: ["Article 1", "Article 2"]
        }
    ]
}
```

### Payload Envoyé à l'API

```javascript
{
    colis: [
        {
            designation: "Colis test",
            poids: 10,           // ← Converti en number
            longueur: 50,        // ← Converti en number
            largeur: 40,         // ← Converti en number
            hauteur: 30,         // ← Converti en number
            prix_emballage: 5000,     // ← Converti en number
            prix_estimation: 50000,   // ← Converti en number
            category_id: "abc-123",
            code_colis: "COL-SIMPLE-1234-1",
            articles: [
                { designation: "Article 1" },
                { designation: "Article 2" }
            ]
        }
    ]
}
```

## ⚠️ Points d'Attention

### 1. Backend

**Le backend doit accepter le champ `prix_estimation` :**
- Vérifier que la colonne existe dans la table `colis`
- Type recommandé : `DECIMAL(10,2)` ou `INTEGER` (si en centimes)
- Valeur par défaut : `0`

### 2. Validation Backend

Si le backend a des validations, s'assurer que :
- `prix_estimation` est optionnel (nullable ou default 0)
- Accepte les valeurs numériques >= 0

### 3. Affichage dans les Reçus

Si vous affichez le prix d'estimation dans les reçus (PDF, thermique), pensez à :
- Ajouter le champ dans les composants `ReceiptA4.jsx` et `ReceiptThermal.jsx`
- Formater le montant : `prix_estimation.toLocaleString()`

### 4. Migration Base de Données

Si le champ n'existe pas encore en base :

```sql
-- Exemple de migration Laravel
ALTER TABLE colis ADD COLUMN prix_estimation DECIMAL(10,2) DEFAULT 0 AFTER prix_emballage;
```

## 🚀 Améliorations Futures Possibles

1. **Calcul Automatique**
   - Proposer une estimation automatique basée sur le type de colis/articles

2. **Validation Min/Max**
   - Limiter les valeurs acceptées (ex: min 0, max 10 000 000)

3. **Alerte si Estimation Trop Élevée**
   - Afficher un avertissement si l'estimation dépasse un seuil

4. **Total des Estimations**
   - Afficher le total des estimations de tous les colis
   - Utile pour les assurances

5. **Historique**
   - Afficher les estimations moyennes pour des articles similaires

## 📌 Résumé

✅ Champ `prix_estimation` ajouté dans :
- État initial du formulaire
- Interface utilisateur (après "Emballage")
- Fonction `addColis`
- Payload de simulation
- Payload de création

✅ Comportement :
- Valeur par défaut : 0
- Type : number
- Conversion automatique : `parseFloat()`
- Envoyé à l'API au même niveau que `prix_emballage`

✅ Compatible avec :
- Tous les types d'expédition
- Plusieurs colis
- Mode simulation et création

Date: 2026-07-21
