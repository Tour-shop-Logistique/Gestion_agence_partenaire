# 📦 Format des Codes Colis - Documentation

## 🎯 Vue d'ensemble

Le nouveau format des codes colis est structuré pour identifier clairement le **type d'expédition** dès le code.

---

## 📐 Structure du Code

### Format Général
```
PREFIX-NUMERO-CODE_AGENCE
```

**Composants:**
- `PREFIX` : Identifie le type d'expédition (2 à 6 caractères)
- `NUMERO` : Numéro séquentiel du colis (3 chiffres)
- `CODE_AGENCE` : Code unique de l'agence (ex: AGC001)

---

## 🏷️ Préfixes par Type d'Expédition

| Type Expédition | Préfixe | Exemple Complet |
|-----------------|---------|-----------------|
| **DHD Aérien** | `DHD-AR` | `DHD-AR-001-AGC001` |
| **DHD Maritime** | `DHD-MR` | `DHD-MR-001-AGC001` |
| **Afrique** | `AF` | `AF-001-AGC001` |
| **Canada (CA)** | `CA` | `CA-001-AGC001` |
| **Livraison Domicile (LD)** | `LD` | `LD-001-AGC001` |
| **Simple (par défaut)** | `DHD-AR` | `DHD-AR-001-AGC001` |

---

## 📝 Exemples Concrets

### Expédition Aérienne (DHD)

```
Colis 1: DHD-AR-001-AGC001
Colis 2: DHD-AR-002-AGC001
Colis 3: DHD-AR-003-AGC001
...
Colis 10: DHD-AR-010-AGC001
Colis 100: DHD-AR-100-AGC001
```

### Expédition Maritime
```
Colis 1: DHD-MR-001-AGC001
Colis 2: DHD-MR-002-AGC001
Colis 3: DHD-MR-003-AGC001
```

### Expédition vers l'Afrique
```
Colis 1: AF-001-AGC001
Colis 2: AF-002-AGC001
Colis 3: AF-003-AGC001
```

### Expédition vers le Canada
```
Colis 1: CA-001-AGC001
Colis 2: CA-002-AGC001
```

### Livraison à Domicile
```
Colis 1: LD-001-AGC001
Colis 2: LD-002-AGC001
```

---

## 💻 Utilisation dans le Code

### Génération Simple

```javascript
import { generateColisCode } from './utils/codeGenerator';

// Générer un code pour un colis aérien
const code = generateColisCode({
    codeAgence: 'AGC-001',
    numeroColis: 1,
    typeExpedition: 'AERIEN'
});
// Résultat: "DHD-AR-001-AGC001"
```

### Génération Multiple

```javascript
import { generateMultipleColisCode } from './utils/codeGenerator';

// Générer 3 codes pour une expédition maritime
const codes = generateMultipleColisCode({
    codeAgence: 'AGC001',
    nombreColis: 3,
    typeExpedition: 'MARITIME',
    numeroDepart: 1
});
// Résultat: ["DHD-MR-001-AGC001", "DHD-MR-002-AGC001", "DHD-MR-003-AGC001"]
```

### Avec le Hook React

```javascript
import { useCodeGenerator } from './hooks/useCodeGenerator';

function MyComponent() {
    const { genererCodeColis, genererCodesMultiples } = useCodeGenerator();
    
    // Un seul colis
    const code = genererCodeColis({ 
        numeroColis: 5, 
        typeExpedition: 'AFRIQUE' 
    });
    // Résultat: "AF-005-AGC001"
    
    // Plusieurs colis
    const codes = genererCodesMultiples({
        nombreColis: 2,
        typeExpedition: 'CA',
        numeroDepart: 1
    });
    // Résultat: ["CA-001-AGC001", "CA-002-AGC001"]
}
```

---

## 🔍 Parsing et Validation

### Parser un Code

```javascript
import { parseColisCode } from './utils/codeGenerator';

const parsed = parseColisCode('DHD-AR-015-AGC001');
console.log(parsed);
// {
//   prefix: "DHD-AR",
//   typeExpedition: "AERIEN",
//   codeAgence: "AGC001",
//   numero: 15
// }
```

### Valider un Code

```javascript
import { isValidColisCode } from './utils/codeGenerator';

isValidColisCode('DHD-AR-001-AGC001'); // true
isValidColisCode('INVALID-CODE'); // false
```

### Formater pour Affichage

```javascript
import { formatColisCodeDisplay } from './utils/codeGenerator';

const formatted = formatColisCodeDisplay('DHD-AR-001-AGC001');
console.log(formatted);
// "DHD-AR / 001 / AGC001"
```

---

## 🔢 Numérotation Séquentielle

### Par Type d'Expédition

La numérotation est **indépendante par type d'expédition** :

```
AERIEN:    DHD-AR-001-AGC001, DHD-AR-002-AGC001, DHD-AR-003-AGC001
MARITIME:  DHD-MR-001-AGC001, DHD-MR-002-AGC001
AFRIQUE:   AF-001-AGC001, AF-002-AGC001, AF-003-AGC001
CA:        CA-001-AGC001, CA-002-AGC001
LD:        LD-001-AGC001, LD-002-AGC001
```

### Obtenir le Prochain Numéro

```javascript
import { getNextColisNumber } from './utils/codeGenerator';

const existingCodes = [
    'DHD-AR-001-AGC001',
    'DHD-AR-002-AGC001',
    'DHD-MR-001-AGC001'  // Autre type, ne compte pas
];

const nextNumber = getNextColisNumber(
    existingCodes, 
    'AGC001', 
    'AERIEN'
);
console.log(nextNumber); // 3
```

---

## 🎨 Affichage dans l'Interface

### Badge de Type

```jsx
function TypeBadge({ code }) {
    const parsed = parseColisCode(code);
    
    const colors = {
        'AERIEN': 'bg-sky-100 text-sky-700',
        'MARITIME': 'bg-blue-100 text-blue-700',
        'AFRIQUE': 'bg-amber-100 text-amber-700',
        'CA': 'bg-red-100 text-red-700',
        'LD': 'bg-green-100 text-green-700'
    };
    
    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[parsed.typeExpedition]}`}>
            {parsed.prefix}
        </span>
    );
}
```

### Code Complet Formaté

```jsx
function ColisCodeDisplay({ code }) {
    const formatted = formatColisCodeDisplay(code);
    
    return (
        <div className="font-mono text-sm">
            {formatted}
        </div>
    );
}
```

---

## 🔄 Migration de l'Ancien Format

### Ancien Format
```
AGC001-2412-0001
(CODE_AGENCE-JJMM-NUMERO)
```

### Nouveau Format
```
DHD-AR-001-AGC001
(PREFIX-NUMERO-CODE_AGENCE)
```

### Avantages du Nouveau Format

✅ **Identification rapide** du type d'expédition
✅ **Codes plus courts** et lisibles
✅ **Numérotation indépendante** par type
✅ **Scalabilité** (999 colis par type)
✅ **Pas de dépendance à la date** (simplifie la logique)

---

## 📊 Statistiques et Reporting

### Grouper par Type

```javascript
const expeditions = [...]; // Liste d'expéditions

const byType = expeditions.reduce((acc, exp) => {
    exp.colis.forEach(colis => {
        const parsed = parseColisCode(colis.code_colis);
        if (parsed) {
            acc[parsed.typeExpedition] = (acc[parsed.typeExpedition] || 0) + 1;
        }
    });
    return acc;
}, {});

console.log(byType);
// {
//   AERIEN: 45,
//   MARITIME: 12,
//   AFRIQUE: 8,
//   CA: 5,
//   LD: 3
// }
```

---

## ⚠️ Points d'Attention

### 1. Type d'Expédition Requis

Le type d'expédition doit **toujours être fourni** lors de la génération :

```javascript
// ✅ BON
generateColisCode({ 
    codeAgence: 'AGC001', 
    numeroColis: 1, 
    typeExpedition: 'MARITIME' 
});

// ⚠️ Fonctionne mais utilise AERIEN par défaut
generateColisCode({ 
    codeAgence: 'AGC001', 
    numeroColis: 1 
});
```

### 2. Normalisation du Type

Le type est **normalisé en majuscules** automatiquement :

```javascript
generateColisCode({ 
    codeAgence: 'AGC001', 
    numeroColis: 1, 
    typeExpedition: 'aerien' // minuscules
});
// Résultat: "DHD-AR-001-AGC001" (converti en AERIEN)
```

### 3. Validation Backend

Le **backend doit aussi implémenter** cette logique pour :
- Générer les codes au moment de la création
- Valider les codes reçus
- Maintenir la séquence par type

---

## 🧪 Tests

### Tests Unitaires Disponibles

Les tests sont dans `src/utils/codeGenerator.test.js` (à mettre à jour) :

```bash
npm test codeGenerator.test.js
```

### Scénarios à Tester

- ✅ Génération avec chaque type
- ✅ Parsing des nouveaux formats
- ✅ Numérotation séquentielle par type
- ✅ Validation des codes
- ✅ Formatage pour affichage
- ✅ Migration depuis ancien format

---

## 📚 Références

### Fichiers Modifiés

- `src/utils/codeGenerator.js` - Générateur principal
- `src/hooks/useCodeGenerator.js` - Hook React
- `src/utils/codeGenerator.test.js` - Tests (à mettre à jour)

### Types d'Expédition Constants

```javascript
export const TYPE_PREFIXES = {
    'AERIEN': 'DHD-AR',
    'MARITIME': 'DHD-MR',
    'AFRIQUE': 'AF',
    'CA': 'CA',
    'LD': 'LD',
    'SIMPLE': 'DHD-AR' // Par défaut
};
```

---

## 🚀 Déploiement

### Checklist

- [ ] Mettre à jour les tests unitaires
- [ ] Tester avec tous les types d'expédition
- [ ] Vérifier l'affichage dans toutes les pages
- [ ] Synchroniser avec le backend
- [ ] Former les utilisateurs au nouveau format
- [ ] Documenter dans le guide utilisateur

---

**Version:** 2.0
**Date:** 25 juillet 2026
**Auteur:** Équipe Dev

🎉 **Le nouveau format de code colis est maintenant opérationnel !**
