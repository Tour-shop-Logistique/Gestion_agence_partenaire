# 🎨 GUIDE VISUEL - Interface Expéditions Premium

## Structure Globale

```
┌────────────────────────────────────────────────────────────────┐
│ HEADER PREMIUM                                                  │
│ ┌──────────────────┐  ┌────────────────────────────────────┐  │
│ │ Expéditions      │  │ [Date Range] [🔄] [PDF] [+ New]   │  │
│ │ Gérez vos 247    │  │                                      │  │
│ │ expéditions 🟢   │  │                                      │  │
│ └──────────────────┘  └────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ DASHBOARD KPI (7 cartes cliquables)                            │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ │
│ │ 📦    │ │ 🟡    │ │ 🚚    │ │ ✅    │ │ ❌    │ │ 💰    │ │
│ │ Total │ │ Attente│ │Transit│ │Livrées│ │Refusées│ │ CA    │ │
│ │ 247   │ │  42   │ │  89   │ │  104  │ │   12  │ │ 2.4M  │ │
│ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 🔍 RECHERCHE INTELLIGENTE                          [⌘K]        │
│ [_____________________________________________________]         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ FILTRES RAPIDES (Chips horizontaux scrollables)                │
│ [📦 Toutes 247] [🌅 Aujourd'hui 12] [🟡 En attente 42] ...    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TABLEAU DESKTOP                                                 │
│ ┌──┬────────────┬────────────┬────────┬────────┬────────┬────┐│
│ │☑│ Référence  │ Exp./Dest. │ Trajet │ Montant│ Statut │ ... ││
│ ├──┼────────────┼────────────┼────────┼────────┼────────┼────┤│
│ │☐│ REF-001    │ E: John    │ FR     │ 25,000 │●●●●○○  │ 👁 ││
│ │ │ Il y a 2h  │ D: Jane    │   →    │ 250€   │Transit │    ││
│ │ │ [Simple]   │            │ SN     │ 2 colis│ 60%    │    ││
│ └──┴────────────┴────────────┴────────┴────────┴────────┴────┘│
│                                                                 │
│ [← Précédent]  [1] [2] 3 [4] ... [12]  [Suivant →]           │
└────────────────────────────────────────────────────────────────┘
```

---

## Header Premium

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  🎯 Expéditions                    📅 01/06/2026 → 15/07/2026        │
│  Gérez vos 247 expéditions        [🔄 Refresh] [📄 PDF] [+ New]     │
│  en temps réel                                                        │
│                                                                       │
│  📅 Mardi 15 juillet 2026  |  🕐 Dernière sync: Il y a 2min          │
│  🟢 Live                                                              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Éléments:
- **Titre** : "Expéditions" (2XL, gras)
- **Sous-titre** : Nombre d'expéditions
- **Badge Live** : Indicateur animé
- **Date range picker** : Sélecteur de période
- **Actions** : Rafraîchir, Export PDF, Nouvelle expédition
- **Métadonnées** : Date actuelle, dernière synchronisation

---

## Dashboard KPI

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   📦     │  │   🟡     │  │   🚚     │  │   ✅     │
│          │  │          │  │          │  │          │
│  TOTAL   │  │ ATTENTE  │  │ TRANSIT  │  │ LIVRÉES  │
│   247    │  │    42    │  │    89    │  │   104    │
│          │  │          │  │          │  │          │
│expéditions│  │à traiter │  │en cours  │  │complétées│
└──────────┘  └──────────┘  └──────────┘  └──────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐
│   ❌     │  │   💰     │  │   💵     │
│          │  │          │  │          │
│ REFUSÉES │  │ CA TOTAL │  │COMMISSION│
│    12    │  │   2.4M   │  │   180K   │
│          │  │          │  │          │
│rejetées  │  │   CFA    │  │   CFA    │
└──────────┘  └──────────┘  └──────────┘
```

### Interactions:
- **Hover** : Scale 1.02 + shadow-xl
- **Click** : Filtre automatique
- **Active** : Border colored + scale 1.05
- **Animation** : Gradient overlay on hover

---

## Recherche Intelligente

```
┌───────────────────────────────────────────────────────────────┐
│ 🔍  Rechercher une expédition...                     [⌘K]     │
│                                                        42      │
└───────────────────────────────────────────────────────────────┘

Au focus:
┌───────────────────────────────────────────────────────────────┐
│ 🔍  jean                                              2 résultats│
└───────────────────────────────────────────────────────────────┘
│  💡 Recherche intelligente                                     │
│  [REF-] Rechercher par référence                               │
│  [Nom]  Expéditeur ou destinataire                            │
│  [Pays] Départ ou destination                                 │
└───────────────────────────────────────────────────────────────┘
```

### Fonctionnalités:
- **Raccourci** : `Cmd/Ctrl + K`
- **Escape** : Effacer
- **Multi-critères** : Automatique
- **Compteur** : Résultats en temps réel
- **Tips** : Au focus

---

## Filtres Rapides (Chips)

```
┌────────────────────────────────────────────────────────────────┐
│ [📦 Toutes 247] [🌅 Aujourd'hui 12] [🌄 Hier 8] [📅 Semaine 45]│
│ [🟡 En attente 42] [🚚 Transit 89] [✅ Livrée 104]             │
│ [💳 Impayée 23] [📮 Simple 120] [✈️ Aérien 45] ...            │
└────────────────────────────────────────────────────────────────┘
                                                                 →
```

### Chips States:
- **Inactive** : Blanc, border-slate-200
- **Active** : Indigo-600, shadow-lg, scale-105
- **Hover** : border-indigo-300, shadow-md
- **Count** : Badge avec nombre

---

## Timeline de Statut

### Version Complète (Desktop):
```
●──●──●──●──○──○
✅  ✅  ✅  ⏰  ○  ○
Créée  Enlèvement  Entrepôt  Transit  Destination  Livrée
```

### Version Compacte (Mobile):
```
Transit (60%)
████████████░░░░░░░░
```

### États:
- ✅ **Complété** : Vert, check icon
- ⏰ **En cours** : Indigo, pulsant
- ○ **Pending** : Gris, vide

---

## Badge Paiement

```
┌──────────────┐
│ ✅ Payé      │  → Vert
└──────────────┘

┌──────────────┐
│ ⏰ Impayé    │  → Orange
└──────────────┘

┌──────────────┐
│ ⚠ Frais: Bloqué│  → Rouge
└──────────────┘
```

### Modes:
- **Normal** : Badge complet avec icône
- **Compact** : Dots colorés seulement

---

## Ligne d'Expédition (Desktop)

```
┌──┬───────────────┬──────────────┬─────────┬─────────┬───────────┬──────────┬────────┐
│☐│ REF-001       │ E: [👤] John │ FR  →  │ 25,000  │●●●●○○    │ 🟢 Payé  │ 👁 🖨 ✏│
│ │ Il y a 2h     │    Smith     │   SN    │  CFA    │ Transit   │          │        │
│ │ [Simple]      │ D: [👤] Jane │         │ 2 colis │ 60%       │          │        │
│ │               │    Doe       │         │         │           │          │        │
└──┴───────────────┴──────────────┴─────────┴─────────┴───────────┴──────────┴────────┘
          │                │            │        │         │           │         │
    Référence        Personnes     Trajet   Montant   Timeline   Paiement   Actions
      + Date          + Icons      + Flèche  + Colis  Visuelle    Badge     (hover)
      + Type
```

### Hover Effects:
- Background: indigo-50/30
- Actions apparaissent
- Border-left coloré selon statut
- Popover au survol du bouton "⋮"

---

## Carte Mobile

```
┌─────────────────────────────────────┐
│ REF-001                   [Simple]  │
│                                     │
│ Transit (60%)                       │
│ ████████████░░░░░░░░                │
│                                     │
│ FR  →  →  →  SN                     │
│                                     │
│ ───────────────────────────────────│
│ 25,000 CFA        💵180  🖨  →     │
│                [Com]                │
└─────────────────────────────────────┘
```

### Éléments:
- **Header** : Référence + Type
- **Timeline** : Barre de progression
- **Trajet** : Avec flèches
- **Footer** : Montant + Commission + Actions

---

## Popover Aperçu Rapide

```
┌──────────────────────────────────┐
│ 💡 Aperçu rapide                 │
│ ──────────────────────────────── │
│ 🕐 Créée le 15/07/2026          │
│ 📞 +33 6 12 34 56 78            │
│ 📍 75001 Paris, France          │
│                                  │
│ Dernière MAJ: Il y a 30min      │
└──────────────────────────────────┘
```

### Apparition:
- Au survol du bouton "⋮ Plus"
- Animation: fade-in + slide-in
- Position: right-0 top-full

---

## Toolbar Sélection Multiple

```
             ┌────────────────────────────────────────┐
             │ [✕] 3 sélectionnées                     │
             │ Choisissez une action                   │
             │                                         │
             │ [📄] [🖨] [✓] [💰] [🗑]                │
             └────────────────────────────────────────┘
                     Position: Bottom center, fixed
```

### Actions:
- 📄 Exporter
- 🖨 Imprimer
- ✓ Changer statut
- 💰 Marquer payé
- 🗑 Supprimer

---

## Statistiques Filtrées

```
┌────────────────────────────────────────────────────────────┐
│ 📊 Statistiques de sélection                               │
│                                                             │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │RÉSULTATS│ │ MONTANT│ │COMMISSION│ │ COLIS │ │MOYENNE │  │
│ │   42   │ │  1.2M  │ │   90K   │ │  156  │ │ 28,571 │  │
│ │expéd.  │ │  CFA   │ │  CFA    │ │ total │ │ CFA/exp│  │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Affichage:
- Apparaît quand filtres actifs
- Gradient background (indigo → purple)
- 5 métriques compactes

---

## Pagination

```
┌───────────────────────────────────────────────────────────┐
│ Page 3 sur 12                                              │
│                                                             │
│ [← Précédent] [1] ... [2] [3] [4] ... [12] [Suivant →]   │
└───────────────────────────────────────────────────────────┘
```

### États:
- **Active** : Indigo gradient, shadow-lg, scale-105
- **Inactive** : Slate-600, hover bg-white
- **Disabled** : Slate-300, cursor-not-allowed

---

## Empty State

```
┌────────────────────────────────────────┐
│                                         │
│            ┌──────────┐                │
│            │    📦    │                │
│            └──────────┘                │
│                                         │
│       Aucune expédition                │
│  Aucun résultat ne correspond          │
│     à vos critères.                    │
│                                         │
└────────────────────────────────────────┘
```

---

## Loading State

```
┌─────────────────────────────────────────┐
│ ████░░░░░░░░░░░░░░░░░░░░ (pulse)       │
│ ████████░░░░░░░░░░░░░░░░ (pulse)       │
│ ████████████░░░░░░░░░░░░ (pulse)       │
└─────────────────────────────────────────┘
```

---

## Codes Couleur

### Statuts d'Expédition:
- 🟡 **En attente** : Amber (amber-400)
- ✅ **Acceptée** : Emerald (emerald-400)
- ❌ **Refusée** : Red (red-400)
- 🔵 **Enlèvement** : Sky (sky-400)
- 🔷 **Entrepôt** : Blue (blue-500)
- 💜 **Transit** : Indigo (indigo-500)
- 🟣 **Destination** : Purple (purple-500)
- 🟢 **Livrée** : Emerald (emerald-600)

### Types d'Expédition:
- 📮 **Simple** : Blue
- ✈️ **Aérien** : Sky
- 🚢 **Maritime** : Cyan
- 🌍 **Afrique** : Orange
- 📋 **CA** : Purple

### Paiement:
- 🟢 **Payé** : Emerald
- 🟠 **Impayé** : Orange
- 🔴 **Bloqué** : Red/Rose

---

## Responsive Breakpoints

### Desktop (lg: 1024px+)
```
┌─────────────────────────────────────────┐
│ [Sidebar]     [Main Content]            │
│ [Filters]     [KPI Cards]               │
│              [Search]                   │
│              [Chips]                    │
│              [Table]                    │
│              [Pagination]               │
└─────────────────────────────────────────┘
```

### Tablet (md: 768px - 1023px)
```
┌──────────────────────────────┐
│ [Main Content]               │
│ [KPI Cards - 3 cols]         │
│ [Search]                     │
│ [Chips]                      │
│ [Table - Columns reduced]    │
└──────────────────────────────┘
```

### Mobile (sm: < 768px)
```
┌───────────────────┐
│ [KPI - 2 cols]    │
│ [Search]          │
│ [Chips →]         │
│ [Card]            │
│ [Card]            │
│ [Card]            │
│ [Pagination]      │
└───────────────────┘
```

---

## 🎨 Design Tokens

### Border Radius:
- `rounded-lg` : 0.5rem (8px)
- `rounded-xl` : 0.75rem (12px)
- `rounded-2xl` : 1rem (16px)
- `rounded-3xl` : 1.5rem (24px)

### Shadows:
- `shadow-sm` : Légère
- `shadow` : Normale
- `shadow-lg` : Grande
- `shadow-xl` : Extra grande
- `shadow-2xl` : Maximum

### Spacing:
- `gap-2` : 0.5rem (8px)
- `gap-3` : 0.75rem (12px)
- `gap-4` : 1rem (16px)
- `gap-6` : 1.5rem (24px)

### Typography:
- `text-xs` : 0.75rem (12px)
- `text-sm` : 0.875rem (14px)
- `text-base` : 1rem (16px)
- `text-lg` : 1.125rem (18px)
- `text-xl` : 1.25rem (20px)
- `text-2xl` : 1.5rem (24px)
- `text-3xl` : 1.875rem (30px)

---

**Version:** 2.0.0 Premium  
**Guide Visuel** - Interface Expéditions  
**Date:** 15 juillet 2026
