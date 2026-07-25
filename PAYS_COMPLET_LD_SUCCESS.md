# ✅ Affichage du Nom Complet du Pays pour Livraison à Domicile

## 🎯 Objectif
Pour le type d'expédition **SIMPLE** (Livraison à Domicile), envoyer le nom complet du pays avec l'abréviation entre parenthèses au lieu de juste le nom du pays.

**Exemple :** `Argentine (AR)` au lieu de `Argentine`

## 🔧 Modification Effectuée

### Fichier : `CreateExpeditionV2.jsx` - Ligne ~906-929

**Ancien comportement :**
```javascript
onSelect={(country) => {
    // ...
    // Extraire le nom du pays (retirer le code entre parenthèses)
    const paysName = country.label.replace(/\([^)]+\)$/, '').trim();
    
    setFormData(prev => ({
        ...prev,
        pays_destination: paysName,      // "Argentine"
        destinataire_pays: paysName,     // "Argentine"
        destinataire_ville: "",
    }));
}
```

**Nouveau comportement :**
```javascript
onSelect={(country) => {
    // ...
    // Utiliser le label complet avec l'abréviation (ex: "Argentine (AR)")
    const paysNameComplet = country.label;
    
    setFormData(prev => ({
        ...prev,
        pays_destination: paysNameComplet,    // "Argentine (AR)"
        destinataire_pays: paysNameComplet,   // "Argentine (AR)"
        destinataire_ville: "",
    }));
}
```

## 📊 Impact

### Avant :
- Pays affiché dans la barre : `Argentine (AR)`
- Pays envoyé au backend : `Argentine`
- Pays stocké dans formData : `Argentine`

### Après :
- Pays affiché dans la barre : `Argentine (AR)`
- Pays envoyé au backend : `Argentine (AR)`
- Pays stocké dans formData : `Argentine (AR)`

## 🧪 Comment Tester

1. **Ouvrir la page de création d'expédition V2**
   - URL: `/expeditions/create-v2`

2. **Sélectionner le type "SIMPLE"** (Livraison à Domicile)

3. **Dans le champ "Pays de destination"**
   - Cliquer pour ouvrir le SearchableDropdown
   - Rechercher un pays, par exemple : "Argentine"
   - Sélectionner "Argentine (AR)"

4. **Vérifications**
   - ✅ Le placeholder affiche maintenant : `Argentine (AR)`
   - ✅ Le champ `pays_destination` contient : `Argentina (AR)`
   - ✅ Le champ `destinataire_pays` contient : `Argentina (AR)`

5. **Simuler et créer l'expédition**
   - Remplir les autres champs requis
   - Simuler le tarif
   - Vérifier que le payload envoyé au backend contient le nom complet

## 🔍 Vérification dans la Console

Pour vérifier le contenu du payload envoyé :

1. **Ouvrir la console du navigateur (F12)**
2. **Onglet Console**
3. **Avant la simulation, tapez :**
   ```javascript
   console.log("Pays destination:", formData.pays_destination);
   ```
4. **Vous devriez voir :** `Pays destination: Argentine (AR)`

## 📝 Structure des Données

Les pays dans `availableCountriesForLD` ont cette structure :
```javascript
{
    id: "Argentine (AR)",           // Identifiant unique
    label: "Argentine (AR)",        // Label affiché et envoyé
    zone: { /* données de zone */ },
    tarif: { /* données de tarif */ },
    tarifGroup: { /* groupe de tarifs */ }
}
```

## ⚠️ Points d'Attention

1. **Backend**
   - Vérifier que le backend accepte les noms de pays avec abréviation
   - Si le backend fait une recherche stricte, il faut soit :
     - Adapter le backend pour accepter le format complet
     - OU garder les deux versions (affichage + valeur)

2. **Validation**
   - Si des validations existent sur le format du pays, les adapter

3. **Autres Types d'Expédition**
   - Cette modification affecte UNIQUEMENT le type SIMPLE
   - Les types DHD, AFRIQUE, CA continuent avec leur logique existante

## 🔄 Types d'Expédition Non Affectés

Cette modification ne touche PAS :
- **GROUPAGE_DHD_AERIEN** : Utilise `handleRouteSelect` avec routes prédéfinies
- **GROUPAGE_DHD_MARITIME** : Utilise `handleRouteSelect` avec routes prédéfinies
- **GROUPAGE_AFRIQUE** : Utilise `handleRouteSelect` avec pays du tarif
- **GROUPAGE_CA** : Utilise `handleRouteSelect` avec routes prédéfinies

## 🚀 Alternative (si le backend ne supporte pas)

Si le backend n'accepte pas le format avec abréviation, voici une alternative :

```javascript
onSelect={(country) => {
    // ...
    // Séparer le nom et l'abréviation
    const fullLabel = country.label;  // "Argentine (AR)"
    const paysNameOnly = fullLabel.replace(/\s*\([^)]+\)$/, '').trim(); // "Argentine"
    const abbreviation = fullLabel.match(/\(([^)]+)\)$/)?.[1] || ""; // "AR"
    
    setFormData(prev => ({
        ...prev,
        pays_destination: paysNameOnly,        // Pour le backend
        destinataire_pays: paysNameOnly,       // Pour le backend
        pays_destination_display: fullLabel,   // Pour l'affichage
        pays_abbreviation: abbreviation,       // Si nécessaire
        destinataire_ville: "",
    }));
}
```

Date: 2026-07-21
