# ⚡ Guide Rapide - ExpeditionDetails v3.0

## 🎯 En 30 secondes

La page ExpeditionDetails a été **complètement refactorisée** pour être :
- ✅ **Ultra lisible** (< 3 secondes)
- ✅ **Orientée action** (boutons toujours visibles)
- ✅ **Moderne** (design SaaS)

---

## 📦 Structure des Composants

```
src/components/expedition/
├── OperationalSummary.jsx  → Résumé coloré en haut
├── ActionBar.jsx           → Boutons d'action
├── KPICards.jsx            → 4 cartes métriques
├── LogisticsFlow.jsx       → Pipeline visuel
├── ParcelTable.jsx         → Table des colis
├── ContactCard.jsx         → Fiches contact
├── FinanceCard.jsx         → Résumé financier
└── index.js                → Exports
```

---

## 🚀 Utilisation Rapide

### Import
```jsx
import {
    OperationalSummary,
    ActionBar,
    KPICards,
    LogisticsFlow,
    ParcelTable,
    ContactCard,
    FinanceCard
} from '../components/expedition';
```

### Exemple
```jsx
<OperationalSummary 
    expedition={expedition} 
    formatCurrency={formatCurrency}
/>

<ActionBar
    expedition={expedition}
    onAccept={() => setIsAcceptModalOpen(true)}
    onRefuse={() => setIsRefuseModalOpen(true)}
    onConfirmReception={() => setIsConfirmReceptionModalOpen(true)}
    onRecordTransaction={handleRecordTransaction}
/>

<KPICards 
    expedition={expedition} 
    formatCurrency={formatCurrency}
/>

<LogisticsFlow 
    expedition={expedition}
    formatDate={formatDate}
/>

<ParcelTable 
    colis={expedition.colis || []}
    formatCurrency={formatCurrency}
/>

<ContactCard 
    type="shipper"
    contact={expediteur}
    country={expedition.pays_depart}
/>

<FinanceCard
    expedition={expedition}
    formatCurrency={formatCurrency}
    onRecordTransaction={handleRecordTransaction}
/>
```

---

## 🎨 Palette de Couleurs

```
🔴 Rouge    → Problème / Blocage
🟠 Orange   → Attention / En attente
🟢 Vert     → OK / Payé
🔵 Indigo   → Actions principales
⚪ Gris     → Neutre
```

---

## 📱 Layout

```
┌─────────────────────────────────────┐
│  Header (référence + retour)       │
├─────────────────────────────────────┤
│  Résumé Opérationnel (coloré)      │
├─────────────────────────────────────┤
│  Barre d'Actions Rapides            │
├─────────────────────────────────────┤
│  4 Cartes KPI                       │
├─────────────────────────────────────┤
│  ┌──────────────┬─────────────────┐ │
│  │ Flux         │ Contacts        │ │
│  │ Logistique   │ (Expéditeur +   │ │
│  │              │  Destinataire)  │ │
│  ├──────────────┤                 │ │
│  │ Table        │ Finance         │ │
│  │ Colis        │                 │ │
│  └──────────────┴─────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔧 Props des Composants

### OperationalSummary
```typescript
{
  expedition: Expedition,
  formatCurrency: (amount: number) => string
}
```

### ActionBar
```typescript
{
  expedition: Expedition,
  onAccept: () => void,
  onRefuse: () => void,
  onConfirmReception: () => void,
  onRecordTransaction: (type: string) => void
}
```

### KPICards
```typescript
{
  expedition: Expedition,
  formatCurrency: (amount: number) => string
}
```

### LogisticsFlow
```typescript
{
  expedition: Expedition,
  formatDate: (date: string) => string
}
```

### ParcelTable
```typescript
{
  colis: Colis[],
  formatCurrency: (amount: number) => string
}
```

### ContactCard
```typescript
{
  type: 'shipper' | 'receiver',
  contact: Contact,
  country: string
}
```

### FinanceCard
```typescript
{
  expedition: Expedition,
  formatCurrency: (amount: number) => string,
  onRecordTransaction: (type: string) => void
}
```

---

## 🐛 Debugging

### Composant ne s'affiche pas
```bash
# Vérifier l'import
import { ComponentName } from '../components/expedition';

# Vérifier les props
console.log({ expedition, formatCurrency });
```

### Erreur de style
```bash
# Vérifier Tailwind
npm run build:css

# Vérifier les classes
className="bg-indigo-50 border-2 border-indigo-200"
```

---

## 📊 Checklist de Test

- [ ] Affichage correct sur desktop
- [ ] Affichage correct sur mobile
- [ ] Actions fonctionnelles
- [ ] Flux logistique correct
- [ ] Table des colis lisible
- [ ] Contacts affichés
- [ ] Finance correcte
- [ ] Modales fonctionnelles

---

## 🚨 Points d'Attention

### Performance
- ✅ Composants légers
- ✅ Pas de re-render inutile
- ⚠️ Attention aux listes longues (colis)

### Accessibilité
- ⚠️ Ajouter ARIA labels
- ⚠️ Tester au clavier
- ⚠️ Vérifier le contraste

### Responsive
- ✅ Mobile first
- ✅ Breakpoints cohérents
- ✅ Overflow géré

---

## 💡 Tips

### Personnaliser les couleurs
```jsx
// Dans chaque composant
const config = {
  shipper: {
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    // ...
  }
};
```

### Ajouter un statut
```jsx
// Dans OperationalSummary.jsx
const getStatusConfig = (status) => {
  const configs = {
    nouveau_statut: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      // ...
    }
  };
};
```

### Modifier le flux
```jsx
// Dans LogisticsFlow.jsx
const steps = [
  { id: 'nouvelle_etape', label: 'Nouvelle Étape', ... }
];
```

---

## 📚 Ressources

- [Documentation complète](./REFONTE_EXPEDITION_DETAILS.md)
- [Changelog](./CHANGELOG_EXPEDITION_DETAILS_V3.md)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

---

## 🆘 Support

### Problème ?
1. Vérifier la console
2. Vérifier les props
3. Vérifier les imports
4. Consulter la doc complète

### Question ?
- Slack: #dev-frontend
- Email: dev@tousshop.com

---

**Version:** 3.0.0  
**Dernière mise à jour:** 2026-05-04
