# ⚡ Guide d'Intégration Rapide - Expeditions v2.0

## 🎯 Objectif
Intégrer les nouveaux composants dans `Expeditions.jsx` pour améliorer le filtrage et l'UX.

---

## 📦 Étape 1 : Imports

Ajouter en haut du fichier `Expeditions.jsx` :

```jsx
import {
    StatusFilter,
    ActiveFilters,
    ExpeditionsSummary,
    SortableHeader
} from '../components/expeditions';
```

---

## 🔧 Étape 2 : Nouveaux États

Ajouter après les états existants :

```jsx
// Filtre par statut
const [selectedStatuses, setSelectedStatuses] = useState([]);

// Tri
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

// Fonction de tri
const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
};

// Reset tous les filtres
const resetAllFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery('');
    setType('');
    setDateDebut(getFirstDayOfMonth());
    setDateFin(getTodayDate());
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
};
```

---

## 🔍 Étape 3 : Améliorer le useMemo

Remplacer le `filteredExpeditions` existant par :

```jsx
const filteredExpeditions = useMemo(() => {
    let result = expeditions;

    // 1. Filtre par type
    if (type) {
        result = result.filter(exp => exp.type_expedition === type);
    }

    // 2. Filtre par statut (NOUVEAU)
    if (selectedStatuses.length > 0) {
        result = result.filter(exp => selectedStatuses.includes(exp.statut_expedition));
    }

    // 3. Filtre par recherche (amélioré)
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase().trim();
        result = result.filter(exp =>
            exp.reference?.toLowerCase().includes(lowerQuery) ||
            exp.expediteur?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
            exp.destinataire?.nom_prenom?.toLowerCase().includes(lowerQuery) ||
            exp.pays_depart?.toLowerCase().includes(lowerQuery) ||
            exp.pays_destination?.toLowerCase().includes(lowerQuery) ||
            exp.type_expedition?.toLowerCase().includes(lowerQuery)
        );
    }

    // 4. Tri (NOUVEAU)
    if (sortConfig.key) {
        result = [...result].sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case 'montant':
                    aValue = parseFloat(a.montant_expedition || 0);
                    bValue = parseFloat(b.montant_expedition || 0);
                    break;
                case 'date':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case 'reference':
                    aValue = a.reference || '';
                    bValue = b.reference || '';
                    break;
                case 'statut':
                    aValue = a.statut_expedition || '';
                    bValue = b.statut_expedition || '';
                    break;
                case 'commission':
                    aValue = getAgencyCommission(a);
                    bValue = getAgencyCommission(b);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return result;
}, [expeditions, type, selectedStatuses, searchQuery, sortConfig]);
```

---

## 🎨 Étape 4 : Ajouter les Composants dans le JSX

### A. Ajouter le filtre par statut dans le header

Trouver la section avec les filtres de date et ajouter :

```jsx
<div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
    {/* Date Filters (existant) */}
    <div className="flex items-center gap-2 w-full sm:w-auto">
        ...
    </div>

    {/* NOUVEAU: Filtre par statut */}
    <StatusFilter
        selectedStatuses={selectedStatuses}
        onStatusChange={setSelectedStatuses}
        expeditions={expeditions}
    />

    {/* Search Bar (existant) */}
    <div className="relative group w-full sm:w-64 lg:w-96">
        ...
    </div>

    {/* Refresh & Export (existant) */}
    ...
</div>
```

### B. Ajouter les filtres actifs

Après le header principal, avant le résumé :

```jsx
{/* Filtres actifs */}
<ActiveFilters
    selectedStatuses={selectedStatuses}
    onRemoveStatus={(status) => setSelectedStatuses(prev => prev.filter(s => s !== status))}
    searchQuery={searchQuery}
    onClearSearch={() => setSearchQuery('')}
    type={type}
    onClearType={() => {
        setType('');
        setCurrentPage(1);
    }}
    dateDebut={dateDebut}
    dateFin={dateFin}
    onClearDates={() => {
        setDateDebut(getFirstDayOfMonth());
        setDateFin(getTodayDate());
        setCurrentPage(1);
    }}
    onResetAll={resetAllFilters}
/>
```

### C. Ajouter le résumé

Après les filtres actifs :

```jsx
{/* Résumé et indicateurs */}
<ExpeditionsSummary
    expeditions={filteredExpeditions}
    getAgencyCommission={getAgencyCommission}
/>
```

### D. Ajouter le tri dans le tableau

Remplacer les `<th>` du tableau par :

```jsx
<thead className="sticky top-0 z-10">
    <tr className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60">
        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[12%]">
            <SortableHeader
                label="Référence"
                sortKey="reference"
                currentSort={sortConfig}
                onSort={handleSort}
            />
        </th>
        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[18%]">
            Expéditeur / Destinataire
        </th>
        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[10%]">
            Trajet
        </th>
        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[14%]">
            <SortableHeader
                label="Montant"
                sortKey="montant"
                currentSort={sortConfig}
                onSort={handleSort}
            />
        </th>
        <th className="px-6 py-5 text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50/30 w-[13%]">
            <SortableHeader
                label="Commission"
                sortKey="commission"
                currentSort={sortConfig}
                onSort={handleSort}
                className="text-indigo-600"
            />
        </th>
        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide w-[18%]">
            <SortableHeader
                label="Statut"
                sortKey="statut"
                currentSort={sortConfig}
                onSort={handleSort}
            />
        </th>
        <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wide text-right w-[15%]">
            Actions
        </th>
    </tr>
</thead>
```

---

## ✅ Étape 5 : Vérification

### Checklist
- [ ] Les imports sont corrects
- [ ] Les nouveaux états sont ajoutés
- [ ] Le useMemo est mis à jour
- [ ] StatusFilter est affiché
- [ ] ActiveFilters est affiché
- [ ] ExpeditionsSummary est affiché
- [ ] SortableHeader est dans le tableau
- [ ] Le filtrage fonctionne
- [ ] Le tri fonctionne
- [ ] Les tags sont supprimables
- [ ] Le reset fonctionne

### Tests
1. **Filtre par statut**
   - Ouvrir le dropdown
   - Sélectionner plusieurs statuts
   - Vérifier que le tableau se filtre

2. **Filtres actifs**
   - Vérifier que les tags apparaissent
   - Cliquer sur un tag pour le supprimer
   - Cliquer sur "Tout effacer"

3. **Résumé**
   - Vérifier les KPI
   - Vérifier la répartition par statut
   - Vérifier la barre de progression

4. **Tri**
   - Cliquer sur "Référence" → tri A-Z
   - Cliquer à nouveau → tri Z-A
   - Tester avec "Montant", "Date", "Statut"

5. **Combinaison**
   - Appliquer plusieurs filtres
   - Ajouter un tri
   - Vérifier que tout fonctionne ensemble

---

## 🎨 Étape 6 : Personnalisation (Optionnel)

### Couleurs
Modifier dans `StatusFilter.jsx` :
```jsx
const STATUS_CONFIG = {
    en_attente: {
        color: 'amber', // Changer ici
        ...
    }
}
```

### Icônes
Changer les icônes dans `StatusFilter.jsx` :
```jsx
import { VotreIcone } from '@heroicons/react/24/outline';

en_attente: {
    icon: VotreIcone, // Changer ici
    ...
}
```

### Animations
Ajouter dans le CSS ou Tailwind :
```jsx
className="transition-all duration-300 hover:scale-105"
```

---

## 🐛 Dépannage

### Le filtre ne fonctionne pas
- Vérifier que `selectedStatuses` est bien dans les dépendances du useMemo
- Vérifier que `onStatusChange` met bien à jour l'état

### Le tri ne fonctionne pas
- Vérifier que `sortConfig` est dans les dépendances du useMemo
- Vérifier que `handleSort` met bien à jour l'état

### Les composants ne s'affichent pas
- Vérifier les imports
- Vérifier que le dossier `src/components/expeditions` existe
- Vérifier la console pour les erreurs

### Erreur "Cannot find module"
```bash
# Vérifier que les fichiers existent
ls -la src/components/expeditions/

# Réinstaller si nécessaire
npm install
```

---

## 📊 Résultat Final

### Structure de la page
```
┌─────────────────────────────────────┐
│ Header (Titre + Filtres)           │
│ - Date début/fin                    │
│ - Filtre par statut (NOUVEAU)      │
│ - Recherche                         │
│ - Refresh + Export                  │
├─────────────────────────────────────┤
│ Filtres actifs (NOUVEAU)           │
│ [Tag 1] [Tag 2] [Tout effacer]     │
├─────────────────────────────────────┤
│ Résumé (NOUVEAU)                   │
│ [KPI 1] [KPI 2] [KPI 3] [KPI 4]   │
│ Répartition par statut              │
├─────────────────────────────────────┤
│ Filtres rapides (Type)             │
│ [Tout] [Simple] [Aérien] ...       │
├─────────────────────────────────────┤
│ Tableau avec tri (AMÉLIORÉ)       │
│ ↕ Référence | Exp/Dest | ↕ Montant│
│ ...                                 │
├─────────────────────────────────────┤
│ Pagination                          │
└─────────────────────────────────────┘
```

---

## 🚀 Prochaines Améliorations

### Court terme
- [ ] Highlight du texte recherché
- [ ] Tooltips sur les icônes
- [ ] Animation de filtrage
- [ ] Export avec filtres appliqués

### Moyen terme
- [ ] Sauvegarde des filtres (localStorage)
- [ ] Filtres favoris
- [ ] Vue personnalisable
- [ ] Colonnes masquables

---

**Temps d'intégration estimé:** 15-30 minutes  
**Difficulté:** Facile  
**Impact:** Élevé

**Bon courage ! 🚀**
