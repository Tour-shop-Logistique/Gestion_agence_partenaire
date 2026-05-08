# 🎨 Composant Transaction - Guide Visuel

## 📱 Aperçu du Modal

```
┌─────────────────────────────────────────────────────────────┐
│  💰  Enregistrer une transaction                        ✕   │
│      Expédition: EXP-2024-001                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Type de transaction                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │  ⬇️  Encaissement    │  │  ⬆️  Décaissement    │       │
│  │  Entrée d'argent     │  │  Sortie d'argent     │       │
│  └──────────────────────┘  └──────────────────────┘       │
│                                                             │
│  Montant *                                                  │
│  ┌─────────────────────────────────────────────┐          │
│  │  15500                                  CFA │          │
│  └─────────────────────────────────────────────┘          │
│  Montant: 15 500 CFA                                       │
│                                                             │
│  Mode de paiement *                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│  │   💵   │ │   📱   │ │   🏦   │ │   ❓   │            │
│  │Espèces │ │ Mobile │ │ Virement│ │ Autre  │            │
│  └────────┘ └────────┘ └────────┘ └────────┘            │
│                                                             │
│  Objet du paiement *                                        │
│  ┌─────────────────────────────────────────────┐          │
│  │ Frais annexes - Assurance, emballage, etc. ▼│          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  Date et heure (optionnel)                                 │
│  ┌─────────────────────────────────────────────┐          │
│  │ 📅  2024-03-26T14:30                        │          │
│  └─────────────────────────────────────────────┘          │
│  Laissez vide pour utiliser la date actuelle               │
│                                                             │
│  Description (optionnel)                                    │
│  ┌─────────────────────────────────────────────┐          │
│  │ 📄  Commentaire libre...                    │          │
│  │                                              │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Annuler]              [✓ Enregistrer la transaction]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Variantes de boutons

### Primary (Bleu)
```
┌──────────────────────────┐
│  💰  Enregistrer paiement │  ← Bleu (bg-blue-600)
└──────────────────────────┘
```

### Success (Vert)
```
┌──────────────────────────┐
│  💰  Paiement reçu        │  ← Vert (bg-emerald-600)
└──────────────────────────┘
```

### Warning (Orange)
```
┌──────────────────────────┐
│  💰  Frais annexes        │  ← Orange (bg-amber-600)
└──────────────────────────┘
```

### Danger (Rouge)
```
┌──────────────────────────┐
│  💰  Rembourser           │  ← Rouge (bg-rose-600)
└──────────────────────────┘
```

### Secondary (Gris)
```
┌──────────────────────────┐
│  💰  Autre paiement       │  ← Gris (bg-slate-600)
└──────────────────────────┘
```

### Outline (Blanc)
```
┌──────────────────────────┐
│  💰  Enregistrer          │  ← Blanc avec bordure
└──────────────────────────┘
```

---

## 📏 Tailles de boutons

### Small (sm)
```
┌─────────────┐
│ 💰 Payer    │  ← Petit (px-3 py-1.5 text-xs)
└─────────────┘
```

### Medium (md) - Défaut
```
┌──────────────────────────┐
│  💰  Enregistrer paiement │  ← Moyen (px-4 py-2 text-sm)
└──────────────────────────┘
```

### Large (lg)
```
┌────────────────────────────────┐
│   💰  Confirmer le paiement    │  ← Grand (px-6 py-3 text-base)
└────────────────────────────────┘
```

---

## 🎯 Cas d'usage dans ExpeditionDetails

```
┌─────────────────────────────────────────────────────────────┐
│  Expédition EXP-2024-001                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 Informations générales                                  │
│  • Référence: EXP-2024-001                                  │
│  • Statut: En transit                                       │
│  • Date: 26/03/2024                                         │
│                                                             │
│  💰 Informations financières                                │
│  • Montant expédition: 15 500 CFA                           │
│  • Frais annexes: 2 500 CFA                                 │
│  • Total: 18 000 CFA                                        │
│  • Statut paiement: En attente                              │
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐│
│  │  💰  Encaisser le montant │  │  💰  Frais annexes       ││
│  └──────────────────────────┘  └──────────────────────────┘│
│         ↑ Vert (success)              ↑ Orange (warning)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Vue Mobile

```
┌─────────────────────────┐
│  💰  Enregistrer une    │
│      transaction    ✕   │
│  Expédition: EXP-2024-001│
├─────────────────────────┤
│                         │
│  Type de transaction    │
│  ┌─────────────────────┐│
│  │  ⬇️  Encaissement   ││
│  │  Entrée d'argent    ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │  ⬆️  Décaissement   ││
│  │  Sortie d'argent    ││
│  └─────────────────────┘│
│                         │
│  Montant *              │
│  ┌─────────────────────┐│
│  │  15500          CFA ││
│  └─────────────────────┘│
│                         │
│  Mode de paiement *     │
│  ┌─────┐ ┌─────┐       │
│  │ 💵  │ │ 📱  │       │
│  │Cash │ │Mobile│       │
│  └─────┘ └─────┘       │
│  ┌─────┐ ┌─────┐       │
│  │ 🏦  │ │ ❓  │       │
│  │Bank │ │Other│       │
│  └─────┘ └─────┘       │
│                         │
│  [Annuler]              │
│  [✓ Enregistrer]        │
│                         │
└─────────────────────────┘
```

---

## 🎨 États du formulaire

### État initial
```
┌─────────────────────────────────────┐
│  Montant *                          │
│  ┌─────────────────────────────────┐│
│  │  0                          CFA ││  ← Bordure grise
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### État focus
```
┌─────────────────────────────────────┐
│  Montant *                          │
│  ┌─────────────────────────────────┐│
│  │  15500                      CFA ││  ← Bordure bleue
│  └─────────────────────────────────┘│
│  Montant: 15 500 CFA                │  ← Aide contextuelle
└─────────────────────────────────────┘
```

### État erreur
```
┌─────────────────────────────────────┐
│  Montant *                          │
│  ┌─────────────────────────────────┐│
│  │  0                          CFA ││  ← Bordure rouge
│  └─────────────────────────────────┘│
│  ⚠️  Le montant doit être > 0       │  ← Message d'erreur
└─────────────────────────────────────┘
```

### État chargement
```
┌─────────────────────────────────────┐
│  [Annuler]                          │
│  [⏳ Enregistrement...]             │  ← Spinner + texte
│         ↑ Bouton désactivé          │
└─────────────────────────────────────┘
```

---

## 🎯 Sélection du mode de paiement

### Non sélectionné
```
┌────────┐
│   💵   │  ← Bordure grise, fond blanc
│Espèces │
└────────┘
```

### Sélectionné
```
┌────────┐
│   💵   │  ← Bordure verte, fond vert clair
│Espèces │  ← Icône verte
│   ✓    │  ← Checkmark
└────────┘
```

### Hover
```
┌────────┐
│   💵   │  ← Bordure grise foncée
│Espèces │  ← Légère élévation
└────────┘
```

---

## 📊 Sélection du type de transaction

### Encaissement sélectionné
```
┌──────────────────────┐  ┌──────────────────────┐
│  ⬇️  Encaissement    │  │  ⬆️  Décaissement    │
│  Entrée d'argent     │  │  Sortie d'argent     │
│         ✓            │  │                      │
└──────────────────────┘  └──────────────────────┘
   ↑ Bordure verte            ↑ Bordure grise
   ↑ Fond vert clair          ↑ Fond blanc
```

### Décaissement sélectionné
```
┌──────────────────────┐  ┌──────────────────────┐
│  ⬇️  Encaissement    │  │  ⬆️  Décaissement    │
│  Entrée d'argent     │  │  Sortie d'argent     │
│                      │  │         ✓            │
└──────────────────────┘  └──────────────────────┘
   ↑ Bordure grise            ↑ Bordure rouge
   ↑ Fond blanc               ↑ Fond rouge clair
```

---

## 🔔 Notifications Toast

### Succès
```
┌─────────────────────────────────────┐
│  ✓  Transaction enregistrée         │  ← Fond vert
│     avec succès                     │
└─────────────────────────────────────┘
```

### Erreur
```
┌─────────────────────────────────────┐
│  ✕  Erreur lors de                  │  ← Fond rouge
│     l'enregistrement                │
└─────────────────────────────────────┘
```

---

## 🎨 Palette de couleurs

### Primary (Bleu)
```
bg-blue-50    #EFF6FF  ░░░░░░░░
bg-blue-100   #DBEAFE  ▒▒▒▒▒▒▒▒
bg-blue-600   #2563EB  ████████
bg-blue-700   #1D4ED8  ████████
```

### Success (Vert)
```
bg-emerald-50    #ECFDF5  ░░░░░░░░
bg-emerald-100   #D1FAE5  ▒▒▒▒▒▒▒▒
bg-emerald-600   #059669  ████████
bg-emerald-700   #047857  ████████
```

### Warning (Orange)
```
bg-amber-50    #FFFBEB  ░░░░░░░░
bg-amber-100   #FEF3C7  ▒▒▒▒▒▒▒▒
bg-amber-600   #D97706  ████████
bg-amber-700   #B45309  ████████
```

### Danger (Rouge)
```
bg-rose-50    #FFF1F2  ░░░░░░░░
bg-rose-100   #FFE4E6  ▒▒▒▒▒▒▒▒
bg-rose-600   #E11D48  ████████
bg-rose-700   #BE123C  ████████
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
```
┌─────────────────┐
│  [💰 Nouveau]   │  ← Texte court
└─────────────────┘
```

### Tablet/Desktop (≥ 640px)
```
┌──────────────────────────────┐
│  [💰 Nouvelle transaction]   │  ← Texte complet
└──────────────────────────────┘
```

---

## 🎯 Intégration dans la page Transactions

```
┌─────────────────────────────────────────────────────────────┐
│  Historique financier                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [💰 Nouvelle transaction]  [📥 Exporter]  [🔄 Actualiser] │
│                                                             │
│  📅 01/03/2024  →  31/03/2024                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Entrées          Sorties          Solde Net               │
│  125 000 CFA      45 000 CFA       80 000 CFA              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Rechercher...                                           │
│                                                             │
│  [Tout]  [Entrées]  [Sorties]                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ⬇️  Montant expédition    EXP-2024-001    +15 500 CFA    │
│  ⬇️  Frais annexes         EXP-2024-002    +2 500 CFA     │
│  ⬆️  Remboursement         EXP-2024-003    -10 000 CFA    │
│  ⬇️  Frais livraison       EXP-2024-004    +1 500 CFA     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Animation d'ouverture du modal

```
Frame 1 (0ms):
┌─────────────────────────────────────┐
│  [Bouton cliqué]                    │
└─────────────────────────────────────┘
        ↓

Frame 2 (50ms):
┌─────────────────────────────────────┐
│  [Bouton cliqué]                    │
│                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Overlay fade-in
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────┘
        ↓

Frame 3 (100ms):
┌─────────────────────────────────────┐
│  ████████████████████████████████  │  ← Overlay opaque
│  ████████████████████████████████  │
│  ████┌─────────────────┐████████  │
│  ████│  Modal zoom-in  │████████  │  ← Modal scale 0.95 → 1
│  ████└─────────────────┘████████  │
└─────────────────────────────────────┘
        ↓

Frame 4 (200ms):
┌─────────────────────────────────────┐
│  ████████████████████████████████  │
│  ████┌─────────────────────┐████  │
│  ████│  💰  Enregistrer    │████  │  ← Modal complètement visible
│  ████│      une transaction│████  │
│  ████└─────────────────────┘████  │
└─────────────────────────────────────┘
```

---

## ✅ Feedback visuel de validation

### Champ valide
```
┌─────────────────────────────────────┐
│  Montant *                          │
│  ┌─────────────────────────────────┐│
│  │  15500                      CFA ││  ← Bordure bleue
│  └─────────────────────────────────┘│
│  ✓ Montant: 15 500 CFA              │  ← Texte vert
└─────────────────────────────────────┘
```

### Champ invalide
```
┌─────────────────────────────────────┐
│  Montant *                          │
│  ┌─────────────────────────────────┐│
│  │  0                          CFA ││  ← Bordure rouge
│  └─────────────────────────────────┘│
│  ⚠️  Le montant doit être > 0       │  ← Texte rouge
└─────────────────────────────────────┘
```

---

## 🎯 Conclusion

Ce guide visuel montre tous les états et variantes du composant de transaction. Le design est :

✅ **Moderne** : Interface épurée et professionnelle  
✅ **Intuitif** : Navigation claire et logique  
✅ **Responsive** : Adapté à tous les écrans  
✅ **Accessible** : Contrastes et zones de clic optimisés  
✅ **Cohérent** : Palette de couleurs harmonieuse  

**Version** : 1.0.0  
**Date** : 8 Mai 2026
