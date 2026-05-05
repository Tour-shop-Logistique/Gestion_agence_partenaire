# 🎨 Dashboard - Guide Visuel

## 📐 Structure Visuelle

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER                                   │
│  Logo + "Bonjour, Agent 👋"  |  [Actualiser] [Nouvelle expéd.]  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔔 ALERTE : 3 demandes en attente  [Voir les demandes]    [X]  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔥 ACTIONS PRIORITAIRES                                         │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  📦 Colis à     │  🚚 Colis à     │  🔔 Demandes                │
│  réceptionner   │  remettre       │  en attente                 │
│                 │                 │                             │
│  [URGENT] 12    │  8              │  3                          │
│  Départ         │  Arrivée        │  À valider                  │
└─────────────────┴─────────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ✨ RÉSUMÉ INTELLIGENT                                           │
│  "Aujourd'hui vous avez 12 colis à réceptionner, 8 à remettre   │
│   et 3 demandes en attente."                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  💰 PERFORMANCE FINANCIÈRE                                       │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│  💵 CA      │  📊 Commis. │  ❌ Impayés │  ⏰ Encours         │
│  1,250,000  │  125,000    │  50,000     │  30,000             │
│  CFA        │  CFA        │  CFA        │  CFA                │
└─────────────┴─────────────┴─────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🚚 ACTIVITÉ OPÉRATIONNELLE                                      │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│  📦 Créées  │  📥 À récep.│  🚚 À remet.│  ✅ Reçus           │
│  5          │  12 [URGENT]│  8          │  15                 │
│  Aujourd'hui│  Départ     │  Arrivée    │  Aujourd'hui        │
└─────────────┴─────────────┴─────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔄 FLUX LOGISTIQUE                                              │
│                                                                  │
│  📥 Réception → 🏪 Stock → 🚚 Transit → 📍 Arrivée → ✅ Livré  │
│     12           5          8           8            15         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬──────────────────────────┐
│  📦 DERNIÈRES EXPÉDITIONS            │  📊 STATISTIQUES         │
│                                      │                          │
│  📦 EXP-2024-001  [Transit]  50,000  │  🏆 Top Destinations     │
│  📦 EXP-2024-002  [Arrivé]   75,000  │  1. France      25       │
│  📦 EXP-2024-003  [Reçu]     30,000  │  2. USA         18       │
│  📦 EXP-2024-004  [Livré]    45,000  │  3. Canada      12       │
│  📦 EXP-2024-005  [Transit]  60,000  │                          │
│                                      │  📊 Volume par Type      │
│  [Voir tout →]                       │  DHD Aérien  ████ 40%   │
│                                      │  Simple      ███  30%   │
│                                      │  CA          ██   20%   │
│                                      │                          │
│                                      │  📈 Autres indicateurs   │
│                                      │  • En transit      8     │
│                                      │  • Vers entrepôt   5     │
│                                      │  • Demandes        3     │
└──────────────────────────────────────┴──────────────────────────┘
```

---

## 🎨 Palette de Couleurs

### Couleurs Principales

```css
/* Actions Urgentes */
🔴 Rouge (Urgent)     : from-red-500 to-red-600
🟠 Ambre (Attention)  : from-amber-50 to-amber-100
🟢 Émeraude (OK)      : from-emerald-50 to-emerald-100
🔵 Indigo (Action)    : from-indigo-50 to-indigo-100

/* KPI Financiers */
💚 Vert (CA)          : bg-emerald-50 text-emerald-600
💙 Indigo (Commis.)   : bg-indigo-50 text-indigo-600
❤️ Rouge (Impayés)    : bg-red-50 text-red-600
🧡 Ambre (Encours)    : bg-amber-50 text-amber-600

/* KPI Opérationnels */
💙 Bleu (Créées)      : bg-blue-50 text-blue-600
🧡 Ambre (Récep.)     : bg-amber-50 text-amber-600
💚 Émeraude (Remet.)  : bg-emerald-50 text-emerald-600
💚 Vert (Reçus)       : bg-green-50 text-green-600

/* Flux Logistique */
🧡 Ambre (Réception)  : bg-amber-50 border-amber-200
💙 Bleu (Stock)       : bg-blue-50 border-blue-200
💜 Violet (Transit)   : bg-purple-50 border-purple-200
💙 Indigo (Arrivée)   : bg-indigo-50 border-indigo-200
💚 Émeraude (Livré)   : bg-emerald-50 border-emerald-200
```

---

## 📏 Espacements et Tailles

### Grilles

```css
/* Actions Prioritaires */
grid-cols-1 md:grid-cols-3 gap-4

/* KPI Financiers */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4

/* KPI Opérationnels */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4

/* Expéditions + Stats */
grid-cols-1 lg:grid-cols-3 gap-6
  - Expéditions : lg:col-span-2
  - Stats       : lg:col-span-1
```

### Espacements Globaux

```css
/* Container principal */
max-w-[1600px] mx-auto space-y-8 pb-12 px-4 sm:px-6

/* Sections */
space-y-6  (entre sections)
space-y-4  (entre cartes)
space-y-3  (dans listes)
```

### Tailles d'Icônes

```css
/* Header */
w-16 h-16  (Logo agence)
w-5 h-5    (Icônes boutons)

/* Actions Prioritaires */
w-12 h-12  (Icônes principales)
w-5 h-5    (Icônes badges)

/* KPI */
w-5 h-5    (Icônes cartes)
w-4 h-4    (Icônes info)

/* Flux Logistique */
w-12 h-12  (Icônes étapes)
w-5 h-5    (Flèches)

/* Expéditions */
w-12 h-12  (Icônes expéditions)
w-5 h-5    (Flèches hover)
```

---

## 🎭 États et Interactions

### Hover States

```css
/* Cartes Cliquables */
hover:shadow-md
hover:border-{color}-300
hover:scale-110 (icônes)
hover:translate-x-1 (flèches)

/* Boutons */
hover:bg-{color}-700
hover:shadow-lg

/* Badges */
hover:bg-{color}-100
```

### Active States

```css
/* Badges URGENT */
animate-pulse
ring-2 ring-red-200
border-red-300
```

### Loading States

```css
/* Skeleton */
animate-pulse
bg-slate-100
rounded-xl
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)

```
┌─────────────────┐
│     HEADER      │
├─────────────────┤
│  🔔 ALERTE      │
├─────────────────┤
│  🔥 ACTION 1    │
├─────────────────┤
│  🔥 ACTION 2    │
├─────────────────┤
│  🔥 ACTION 3    │
├─────────────────┤
│  ✨ RÉSUMÉ      │
├─────────────────┤
│  💰 KPI 1       │
├─────────────────┤
│  💰 KPI 2       │
├─────────────────┤
│  ...            │
└─────────────────┘
```

### Tablet (640px - 1024px)

```
┌───────────────────────────┐
│         HEADER            │
├───────────────────────────┤
│       🔔 ALERTE           │
├─────────────┬─────────────┤
│  🔥 ACTION  │  🔥 ACTION  │
├─────────────┴─────────────┤
│  🔥 ACTION                │
├─────────────┬─────────────┤
│  💰 KPI 1   │  💰 KPI 2   │
├─────────────┼─────────────┤
│  💰 KPI 3   │  💰 KPI 4   │
└─────────────┴─────────────┘
```

### Desktop (> 1024px)

```
┌─────────────────────────────────────┐
│             HEADER                  │
├─────────────────────────────────────┤
│           🔔 ALERTE                 │
├───────────┬───────────┬─────────────┤
│ 🔥 ACTION │ 🔥 ACTION │ 🔥 ACTION   │
├───────────┴───────────┴─────────────┤
│         ✨ RÉSUMÉ                   │
├─────┬─────┬─────┬─────────────────┤
│ 💰  │ 💰  │ 💰  │ 💰              │
├─────┼─────┼─────┼─────────────────┤
│ 🚚  │ 🚚  │ 🚚  │ 🚚              │
├─────┴─────┴─────┴─────────────────┤
│       🔄 FLUX LOGISTIQUE            │
├─────────────────────┬───────────────┤
│  📦 EXPÉDITIONS     │  📊 STATS     │
└─────────────────────┴───────────────┘
```

---

## 🎯 Zones Cliquables

### Liens Directs

```
✅ Colis à réceptionner    → /colis-a-receptionner
✅ Colis à remettre        → /retrait-colis
✅ Demandes en attente     → /demandes
✅ Voir les demandes       → /demandes
✅ Voir tout (expéditions) → /expeditions
✅ Chaque expédition       → /expeditions/{id}
```

### Boutons d'Action

```
✅ Actualiser              → fetchDashboard(true)
✅ Nouvelle expédition     → /create-expedition
✅ Fermer alerte           → setShowDemandesAlert(false)
```

---

## 💡 Tooltips

### Emplacements

```
📍 Tous les KPI financiers
📍 Tous les KPI opérationnels
📍 Autres indicateurs (Stats)
```

### Contenu Type

```
┌─────────────────────────────────┐
│  Titre en gras                  │
│  Description détaillée          │
│  → Action recommandée (si app.) │
└─────────────────────────────────┘
```

### Déclenchement

```
Hover sur l'icône ℹ️
Apparition : opacity-0 → opacity-100
Transition : transition-all
Position : absolute avec z-10
```

---

## 🔢 Formatage des Données

### Nombres

```javascript
// Montants
new Intl.NumberFormat('fr-FR').format(1250000)
// → "1 250 000"

// Compteurs
{count > 99 ? '99+' : count}
// → "99+" si > 99
```

### Dates

```javascript
// Aujourd'hui
"Aujourd'hui"

// Ce mois
"Ce mois"
```

### Statuts

```javascript
// Mapping
'recu_agence_depart' → 'Reçu'
'en_transit_vers_agence_arrivee' → 'Transit'
'recu_agence_arrivee' → 'Arrivé'
'en_cours_livraison' → 'Livraison'
'livre' → 'Livré'
'recupere' → 'Récupéré'
```

---

## 🎬 Animations

### Entrée

```css
/* Skeleton loading */
animate-pulse

/* Alerte demandes */
animate-pulse (si urgent)
```

### Hover

```css
/* Cartes */
transition-all duration-200
hover:shadow-md
hover:scale-110 (icônes)

/* Flèches */
opacity-0 → opacity-100
translate-x-0 → translate-x-1
```

### Transitions

```css
/* Globales */
transition-colors
transition-all
transition-transform
transition-opacity
```

---

## 📊 Hiérarchie Visuelle

### Niveau 1 : URGENT
```
🔥 Actions Prioritaires
- Taille : Grande
- Couleur : Forte (rouge si urgent)
- Position : En haut
- Animation : Pulse si urgent
```

### Niveau 2 : IMPORTANT
```
✨ Résumé Intelligent
💰 KPI Financiers
🚚 KPI Opérationnels
- Taille : Moyenne
- Couleur : Modérée
- Position : Milieu
```

### Niveau 3 : CONTEXTE
```
🔄 Flux Logistique
📦 Expéditions
📊 Statistiques
- Taille : Standard
- Couleur : Neutre
- Position : Bas
```

---

## ✨ Points Clés du Design

### 1. Clarté
- **Espacement généreux** entre sections
- **Typographie hiérarchisée**
- **Couleurs distinctes** par catégorie

### 2. Action
- **Cartes cliquables** avec hover
- **Badges URGENT** visibles
- **Flèches d'indication**

### 3. Feedback
- **Tooltips explicatifs**
- **États hover** clairs
- **Animations subtiles**

### 4. Cohérence
- **Palette limitée** et métier
- **Espacements constants**
- **Patterns répétés**

---

## 🎨 Inspiration Design

### Style
```
✅ SaaS moderne (Notion, Stripe, Linear)
✅ Dashboard opérationnel (Shopify, Intercom)
✅ Logistique (ShipStation, Easyship)
```

### Principes
```
✅ Minimalisme fonctionnel
✅ Hiérarchie claire
✅ Couleurs métier
✅ Feedback immédiat
✅ Mobile-first
```

---

## 📝 Checklist Qualité

### Design
- [x] Hiérarchie visuelle claire
- [x] Couleurs métier cohérentes
- [x] Espacements harmonieux
- [x] Typographie lisible
- [x] Icônes appropriées

### UX
- [x] Actions prioritaires visibles
- [x] Cartes cliquables
- [x] Tooltips explicatifs
- [x] Feedback hover
- [x] États vides élégants

### Responsive
- [x] Mobile (< 640px)
- [x] Tablet (640-1024px)
- [x] Desktop (> 1024px)
- [x] Grilles adaptatives
- [x] Textes lisibles

### Performance
- [x] Composants optimisés
- [x] Pas de re-renders inutiles
- [x] Animations légères
- [x] Loading states

---

**Guide visuel complet pour le Dashboard refactorisé ! 🎨**
