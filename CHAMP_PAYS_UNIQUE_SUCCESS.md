# ✅ Champ Unique pour la Sélection du Pays (Type SIMPLE)

## 🎯 Objectif
Pour le type d'expédition **SIMPLE** (Livraison à Domicile), garder uniquement le SearchableDropdown pour la sélection du pays et masquer le champ input texte en doublon.

## 🔧 Modification Effectuée

### Fichier : `CreateExpeditionV2.jsx` - Ligne ~975-985

**Avant :**
```javascript
// Deux champs pour le pays :
// 1. SearchableDropdown (en haut) - avec recherche
// 2. Input texte (en bas) - manuel

<div className="grid grid-cols-2 gap-3 ...">
    <div className="space-y-1.5">
        <label>Pays destination *</label>
        <input
            type="text" name="pays_destination"
            value={formData.pays_destination}
            onChange={handleInputChange}
            placeholder="France…"
        />
    </div>
    <div className="space-y-1.5">
        <label>Ville destination *</label>
        <input type="text" name="destinataire_ville" ... />
    </div>
    ...
</div>
```

**Après :**
```javascript
// Un seul champ pour le pays :
// SearchableDropdown (en haut) - masquage du champ input pour SIMPLE

<div className="grid grid-cols-2 gap-3 ...">
    {/* Masquer le champ pays_destination pour le type SIMPLE */}
    {formData.type_expedition !== 'SIMPLE' && (
        <div className="space-y-1.5">
            <label>Pays destination *</label>
            <input
                type="text" name="pays_destination"
                value={formData.pays_destination}
                onChange={handleInputChange}
                placeholder="France…"
            />
        </div>
    )}
    <div className="space-y-1.5">
        <label>Ville destination *</label>
        <input type="text" name="destinataire_ville" ... />
    </div>
    ...
</div>
```

## 📊 Comportement par Type d'Expédition

### Type SIMPLE (Livraison à Domicile)
**Avant :**
- ✅ SearchableDropdown "Pays de destination" (en haut)
- ✅ Input texte "Pays destination" (en bas) 
- ❌ **Problème :** Doublon, confusion possible

**Après :**
- ✅ SearchableDropdown "Pays de destination" (en haut) - **SEUL CHAMP VISIBLE**
- ❌ Input texte "Pays destination" (en bas) - **MASQUÉ**
- ✅ **Avantage :** Un seul champ, expérience utilisateur simplifiée

### Autres Types (DHD, AFRIQUE, CA)
**Comportement inchangé :**
- ✅ Select/Dropdown "Trajet disponible" (en haut)
- ✅ Input texte "Pays destination" (en bas) - **VISIBLE**
- Les deux champs restent visibles car ils servent des objectifs différents

## 🎨 Impact Visuel

### Pour le type SIMPLE :

**Section "Destination + Départ"**
```
┌─────────────────────────────────────────┐
│  Ville destination *    │  Pays départ  │
│  [Paris...]             │  [Côte d'Iv...│
└─────────────────────────────────────────┘
```

Le champ "Pays destination" disparaît car déjà géré par le SearchableDropdown en haut.

### Pour les autres types (DHD, AFRIQUE, CA) :

**Section "Destination + Départ"**
```
┌─────────────────────────────────────────┐
│ Pays destination *     │  Ville dest. * │
│ [France...]            │  [Paris...]    │
│ Pays départ            │  Ville départ  │
│ [Côte d'Ivoire...]     │  [Abidjan...]  │
└─────────────────────────────────────────┘
```

Tous les champs restent visibles comme avant.

## 🧪 Comment Tester

### Test 1 : Type SIMPLE
1. **Ouvrir la page de création d'expédition V2**
2. **Sélectionner le type "SIMPLE"**
3. **Vérifications :**
   - ✅ Le SearchableDropdown "Pays de destination" est visible en haut
   - ✅ On peut rechercher et sélectionner un pays
   - ✅ Le champ input "Pays destination" n'apparaît PAS dans la section "Destination + Départ"
   - ✅ Seuls "Ville destination" et "Pays départ" sont visibles dans cette section

### Test 2 : Type DHD AERIEN
1. **Sélectionner le type "GROUPAGE_DHD_AERIEN"**
2. **Vérifications :**
   - ✅ Le select "Trajet disponible" est visible en haut
   - ✅ Le champ input "Pays destination" EST visible dans la section "Destination + Départ"
   - ✅ Tous les champs classiques sont présents

### Test 3 : Type AFRIQUE
1. **Sélectionner le type "GROUPAGE_AFRIQUE"**
2. **Vérifications :**
   - ✅ Le select "Trajet disponible" est visible en haut
   - ✅ Le champ input "Pays destination" EST visible dans la section "Destination + Départ"

### Test 4 : Type CA
1. **Sélectionner le type "GROUPAGE_CA"**
2. **Vérifications :**
   - ✅ Le select "Trajet disponible" est visible (mais désactivé)
   - ✅ Le champ input "Pays destination" EST visible dans la section "Destination + Départ"

## 🔍 Logique de la Condition

```javascript
{formData.type_expedition !== 'SIMPLE' && (
    <div className="space-y-1.5">
        {/* Champ pays destination */}
    </div>
)}
```

**Signification :**
- Si le type **N'EST PAS** SIMPLE → Afficher le champ
- Si le type **EST** SIMPLE → Masquer le champ (car géré par SearchableDropdown)

## ✅ Avantages

1. **Expérience utilisateur simplifiée**
   - Un seul endroit pour sélectionner le pays pour le type SIMPLE
   - Évite la confusion entre deux champs

2. **Cohérence**
   - Le SearchableDropdown offre la recherche et la sélection
   - Pas besoin de champ manuel supplémentaire

3. **Données toujours synchronisées**
   - Le SearchableDropdown remplit automatiquement `pays_destination`
   - Pas de risque de désynchronisation entre deux champs

4. **Maintenabilité**
   - Un seul point de modification pour le pays (type SIMPLE)
   - Code plus clair et logique

## 📝 Flux de Données (Type SIMPLE)

```
1. Utilisateur clique sur SearchableDropdown "Pays de destination"
   ↓
2. Recherche et sélectionne un pays (ex: "Argentine (AR)")
   ↓
3. Le onSelect remplit automatiquement :
   - formData.pays_destination = "Argentine (AR)"
   - formData.destinataire_pays = "Argentine (AR)"
   ↓
4. Ces valeurs sont utilisées pour :
   - La simulation du tarif
   - La création de l'expédition
   - L'affichage dans le récapitulatif
```

## ⚠️ Points d'Attention

1. **Validation**
   - S'assurer que le champ `pays_destination` est bien rempli via le SearchableDropdown
   - La validation doit fonctionner même si le champ input n'est pas visible

2. **Affichage du pays sélectionné**
   - Le placeholder du SearchableDropdown affiche le pays sélectionné
   - Pas besoin du champ input pour voir le choix

3. **Modification du pays**
   - Pour changer le pays : cliquer à nouveau sur le SearchableDropdown
   - Pas de champ input à modifier manuellement

## 🚀 Améliorations Futures Possibles

1. **Ajouter un bouton "Réinitialiser"** à côté du SearchableDropdown pour effacer la sélection
2. **Afficher le pays sélectionné** sous forme de badge visuellement distinctif
3. **Permettre la désélection** en cliquant sur une croix dans le SearchableDropdown

Date: 2026-07-21
