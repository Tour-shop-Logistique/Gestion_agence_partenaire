# Guide de Refactoring - Application du Design System

## 🎯 Design System Créé

Le Design System complet est disponible dans `src/components/ui/`:

### Composants Disponibles
- ✅ **Button** - Boutons avec variantes (primary, secondary, danger, ghost, indigo)
- ✅ **Card** - Cartes avec header et sections
- ✅ **Input / Select** - Champs de formulaire
- ✅ **Badge** - Badges de statut
- ✅ **Table** - Tableaux avec états (loading, empty)
- ✅ **KPI** - Cartes d'indicateurs
- ✅ **PageHeader** - En-tête de page standardisé

## 📋 Checklist de Refactoring par Page

### 1. Imports
```jsx
// Remplacer les composants custom par le Design System
import { 
  Button, 
  Card, 
  Input, 
  Badge, 
  Table, 
  TableHeader, 
  TableHeaderCell,
  TableBody, 
  TableRow, 
  TableCell,
  KPI,
  PageHeader 
} from '../components/ui';
```

### 2. Structure de Page

#### Avant (Incohérent)
```jsx
<div className="p-8 space-y-10">
  <div className="flex justify-between">
    <h1 className="text-4xl font-black">Titre</h1>
    <button className="bg-gradient-to-r from-indigo-500 to-purple-600...">
      Action
    </button>
  </div>
  {/* ... */}
</div>
```

#### Après (Design System)
```jsx
<div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
  <PageHeader 
    title="Titre"
    subtitle="Description claire"
    actions={<Button variant="primary">Action</Button>}
  />
  {/* ... */}
</div>
```

### 3. KPIs

#### Avant
```jsx
<div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
  <p className="text-[11px] font-black text-purple-600 uppercase">Label</p>
  <p className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
    1,234
  </p>
</div>
```

#### Après
```jsx
<KPI 
  label="Label"
  value="1,234"
  subtitle="Description"
  icon={IconComponent}
  variant="default"
/>
```

### 4. Tableaux

#### Avant
```jsx
<table className="w-full">
  <thead className="bg-gradient-to-r from-slate-800 to-slate-900">
    <tr>
      <th className="px-8 py-5 text-[10px] font-black text-white uppercase tracking-[0.15em]">
        Colonne
      </th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr className="hover:bg-gradient-to-r from-slate-50 to-indigo-50/20 transition-all duration-300">
        <td className="px-8 py-4 text-sm font-bold">{item.name}</td>
      </tr>
    ))}
  </tbody>
</table>
```

#### Après
```jsx
<Table>
  <TableHeader>
    <tr>
      <TableHeaderCell>Colonne</TableHeaderCell>
    </tr>
  </TableHeader>
  <TableBody>
    {loading ? (
      <TableLoading rows={5} cols={3} />
    ) : data.length > 0 ? (
      data.map(item => (
        <TableRow key={item.id} onClick={() => handleClick(item)}>
          <TableCell>{item.name}</TableCell>
        </TableRow>
      ))
    ) : (
      <TableEmpty message="Aucune donnée" icon={InboxIcon} />
    )}
  </TableBody>
</Table>
```

### 5. Boutons

#### Avant
```jsx
<button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/50 hover:shadow-3xl hover:scale-105 transition-all duration-300 active:scale-95">
  Action
</button>
```

#### Après
```jsx
<Button variant="primary" icon={PlusIcon}>
  Action
</Button>
```

### 6. Badges de Statut

#### Avant
```jsx
<span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/50">
  Actif
</span>
```

#### Après
```jsx
<Badge variant="success">Actif</Badge>
```

### 7. Inputs

#### Avant
```jsx
<div>
  <label className="block text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2">
    Nom
  </label>
  <input className="w-full px-4 py-3 border-2 border-indigo-300 rounded-2xl focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all duration-300 shadow-lg" />
</div>
```

#### Après
```jsx
<Input 
  label="Nom"
  placeholder="Entrez le nom"
  icon={UserIcon}
/>
```

## 🎨 Règles de Couleurs

### Statuts
```jsx
// Succès
<Badge variant="success">Payé</Badge>
<KPI variant="success" />

// Attention
<Badge variant="warning">En attente</Badge>
<KPI variant="warning" />

// Erreur
<Badge variant="danger">Refusé</Badge>
<Button variant="danger">Supprimer</Button>

// Info
<Badge variant="info">Information</Badge>
<KPI variant="info" />

// Principal
<Button variant="primary">Action principale</Button>
<KPI variant="primary" />
```

## 📐 Espacement Standard

```jsx
// Container principal
<div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">

// Grid KPIs
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Card padding
<Card> {/* padding: p-6 par défaut */}

// Sections
<div className="space-y-4"> {/* Entre éléments */}
```

## ✅ Checklist Finale

### Pour chaque page:
- [ ] Remplacer les boutons custom par `<Button>`
- [ ] Utiliser `<PageHeader>` pour l'en-tête
- [ ] Remplacer les KPIs par `<KPI>`
- [ ] Utiliser les composants `<Table>` avec états
- [ ] Remplacer les badges par `<Badge>`
- [ ] Utiliser `<Input>` et `<Select>` pour les formulaires
- [ ] Wrapper le contenu dans `<Card>` si nécessaire
- [ ] Vérifier l'espacement (space-y-6, gap-4)
- [ ] Supprimer les gradients inutiles
- [ ] Supprimer les animations exagérées
- [ ] Vérifier l'alignement (texte gauche, montants droite)
- [ ] Ajouter les états loading/empty dans les tableaux

## 🚀 Exemple Complet

Voir `src/components/ui/DESIGN_SYSTEM.md` pour des exemples détaillés.

## 📝 Notes Importantes

1. **Ne pas modifier la logique métier** - Seulement le design
2. **Garder les fonctions existantes** - Juste changer les composants UI
3. **Tester après refactoring** - Vérifier que tout fonctionne
4. **Cohérence avant tout** - Même look sur toutes les pages

## 🎯 Résultat Attendu

- Interface professionnelle et sobre
- Cohérence visuelle totale
- Lisibilité maximale
- Impression de logiciel métier pro (ERP/Dashboard)
- Pas d'effet "design IA"
- Productivité métier optimale
