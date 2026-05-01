# 🎨 Design System - Composants UI

## 📦 Composants Disponibles

### Button
Bouton avec variantes et états.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'indigo'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: Composant d'icône Heroicons
- `iconPosition`: 'left' | 'right'
- `loading`: boolean
- `disabled`: boolean

**Exemple:**
```jsx
<Button variant="primary" icon={PlusIcon}>
  Ajouter
</Button>
```

---

### Card
Carte conteneur avec header et sections.

**Composants:**
- `Card`: Conteneur principal
- `CardHeader`: En-tête avec titre, sous-titre et action
- `CardSection`: Section avec bordure

**Exemple:**
```jsx
<Card>
  <CardHeader 
    title="Titre" 
    subtitle="Description"
    action={<Button size="sm">Action</Button>}
  />
  <CardSection>
    Contenu
  </CardSection>
</Card>
```

---

### Input / Select
Champs de formulaire avec label et gestion d'erreur.

**Props:**
- `label`: string
- `error`: string
- `icon`: Composant d'icône
- `disabled`: boolean

**Exemple:**
```jsx
<Input 
  label="Nom" 
  placeholder="Entrez le nom"
  icon={UserIcon}
  error="Champ requis"
/>

<Select label="Type">
  <option>Option 1</option>
</Select>
```

---

### Badge
Badge de statut avec variantes.

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
- `size`: 'sm' | 'md' | 'lg'

**Exemple:**
```jsx
<Badge variant="success">Payé</Badge>
<Badge variant="warning">En attente</Badge>
```

---

### Table
Tableau complet avec états (loading, empty).

**Composants:**
- `Table`: Conteneur
- `TableHeader`: En-tête
- `TableHeaderCell`: Cellule d'en-tête
- `TableBody`: Corps
- `TableRow`: Ligne
- `TableCell`: Cellule
- `TableEmpty`: État vide
- `TableLoading`: État chargement

**Exemple:**
```jsx
<Table>
  <TableHeader>
    <tr>
      <TableHeaderCell>Nom</TableHeaderCell>
      <TableHeaderCell align="right">Montant</TableHeaderCell>
    </tr>
  </TableHeader>
  <TableBody>
    {loading ? (
      <TableLoading rows={5} cols={2} />
    ) : data.length > 0 ? (
      data.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell align="right">{item.amount}</TableCell>
        </TableRow>
      ))
    ) : (
      <TableEmpty message="Aucune donnée" icon={InboxIcon} />
    )}
  </TableBody>
</Table>
```

---

### KPI
Carte d'indicateur avec variantes.

**Props:**
- `label`: string
- `value`: string | number
- `subtitle`: string
- `icon`: Composant d'icône
- `trend`: number (pourcentage)
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'info'

**Exemple:**
```jsx
<KPI 
  label="Total Expéditions"
  value="1,234"
  subtitle="Ce mois"
  icon={TruckIcon}
  trend={12.5}
/>
```

---

### PageHeader
En-tête de page standardisé.

**Props:**
- `title`: string
- `subtitle`: string
- `actions`: ReactNode

**Exemple:**
```jsx
<PageHeader 
  title="Expéditions"
  subtitle="Gérez vos expéditions"
  actions={
    <>
      <Button variant="secondary">Filtrer</Button>
      <Button variant="primary">Nouvelle</Button>
    </>
  }
/>
```

---

## 🎨 Palette de Couleurs

### Variantes
- **default**: Slate (neutre)
- **primary**: Slate 900 (action principale)
- **success**: Emerald (succès, payé)
- **warning**: Amber (attention, en attente)
- **danger**: Rose (erreur, refusé)
- **info**: Indigo (information)

### Utilisation
```jsx
// Boutons
<Button variant="primary">Action principale</Button>
<Button variant="danger">Supprimer</Button>

// Badges
<Badge variant="success">Payé</Badge>
<Badge variant="warning">En attente</Badge>

// KPIs
<KPI variant="primary" />
<KPI variant="success" />
```

---

## 📐 Espacement Standard

```jsx
// Container principal
<div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">

// Grid KPIs
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Card padding
<Card> {/* p-6 par défaut */}
<Card padding={false}> {/* Pas de padding */}
```

---

## 🚀 Import

```jsx
// Import complet
import { 
  Button, 
  Card, 
  CardHeader,
  CardSection,
  Input, 
  Select,
  Badge, 
  Table, 
  TableHeader, 
  TableHeaderCell,
  TableBody, 
  TableRow, 
  TableCell,
  TableEmpty,
  TableLoading,
  KPI,
  PageHeader 
} from '../components/ui';
```

---

## 📚 Documentation Complète

Voir `DESIGN_SYSTEM.md` pour plus d'exemples et de détails.

---

## 🎯 Principes

1. **Cohérence**: Utiliser toujours les mêmes composants
2. **Simplicité**: Pas de props inutiles
3. **Accessibilité**: États disabled, loading, error
4. **Performance**: Composants légers
5. **Maintenabilité**: Code clair et documenté

---

**Version**: 1.0  
**Dernière mise à jour**: 2026-04-30
