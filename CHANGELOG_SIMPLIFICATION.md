# 📋 CHANGELOG - Simplification Interface Expéditions

## [1.5.0] - 2026-07-15

### ❌ Supprimé
- **Sélection multiple d'expéditions**
  - Checkboxes dans le tableau desktop
  - SelectionToolbar (barre d'actions groupées)
  - State `selectedExpeditions` et ses handlers
  - Colonne checkbox dans le header du tableau

- **Barre de recherche au-dessus de la liste**
  - SmartSearchBar retiré du render
  - Import SmartSearchBar supprimé
  - La recherche reste disponible dans le panneau de filtres à gauche

### 🔄 Modifié
- **Format des montants : notation compacte → format complet**
  
  | Composant | Avant | Après |
  |-----------|-------|-------|
  | StatsCards (KPI) | `1k`, `1.5k` | `1 000`, `1 500` |
  | FilteredStats | `1.2k CFA` | `1 200 CFA` |
  | ExpeditionRow (commission) | `250` | `250` |
  | ExpeditionMobileCard | `1.5k` | `1 500` |

- **Structure du tableau**
  - 8 colonnes → 7 colonnes (suppression checkbox)
  - Layout plus épuré et lisible

### ✅ Préservé
- ✅ WebSocket temps réel
- ✅ Filtres avancés (panneau gauche)
- ✅ Tri des colonnes
- ✅ Pagination
- ✅ Export PDF
- ✅ Impression individuelle
- ✅ Navigation vers page détail
- ✅ KPI Dashboard cliquables
- ✅ Timeline de statut
- ✅ Badges de paiement
- ✅ Actions rapides (Voir, Imprimer, Modifier)
- ✅ Responsive desktop + mobile

---

## Exemples de changements visibles

### Montants KPI
```diff
- CA Total: 1.5M CFA
+ CA Total: 1 500 000 CFA

- Commission: 250k CFA
+ Commission: 250 000 CFA
```

### Tableau Desktop
```diff
- [✓] | Référence | Expéditeur | ... | Actions
+ Référence | Expéditeur | ... | Actions
```

### Stats filtrées
```diff
- Montant: 2.3M CFA
+ Montant: 2 300 000 CFA

- Commission: 115k CFA
+ Commission: 115 000 CFA
```

---

## Impact utilisateur

### ✅ Avantages
- Interface plus simple et épurée
- Montants lisibles sans conversion mentale
- Moins de distractions visuelles
- Focus sur les actions essentielles

### ℹ️ Changements comportementaux
- Impossible de sélectionner plusieurs expéditions simultanément
- Actions uniquement ligne par ligne (impression, export, etc.)
- Recherche uniquement dans le panneau de filtres (gauche)

---

## Fichiers modifiés
- `src/pages/ExpeditionsPremium.jsx`
- `src/components/expeditions/ExpeditionRow.jsx`
- `src/components/expeditions/ExpeditionMobileCard.jsx`
- `src/components/expeditions/StatsCards.jsx`
- `src/components/expeditions/FilteredStats.jsx`

## Diagnostics
✅ Aucune erreur détectée dans les 5 fichiers modifiés
