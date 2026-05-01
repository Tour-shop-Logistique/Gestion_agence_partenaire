# Design System - Tour Shop

## 🎨 Principes de Design

### Couleurs
- **Principal**: Slate (fond, texte, structure)
- **Action**: Indigo
- **Succès**: Emerald
- **Erreur**: Rose
- **Attention**: Amber

### Typographie
- **Titres**: `font-semibold` ou `font-bold`
- **Texte normal**: `text-sm`
- **Labels**: `text-xs uppercase tracking-wide`

### Espacement
- **Standard**: `p-6`, `gap-4`, `space-y-6`
- **Compact**: `p-4`, `gap-2`, `space-y-4`

## 📦 Composants

### Button
```jsx
import { Button } from '@/components/ui';

// Variantes
<Button variant="primary">Enregistrer</Button>
<Button variant="secondary">Annuler</Button>
<Button variant="danger">Supprimer</Button>
<Button variant="ghost">Fermer</Button>

// Avec icône
<Button icon={PlusIcon}>Ajouter</Button>
<Button icon={ArrowPathIcon} loading>Chargement...</Button>

// Tailles
<Button size="sm">Petit</Button>
<Button size="md">Moyen</Button>
<Button size="lg">Grand</Button>
```

### Card
```jsx
import { Card, CardHeader, CardSection } from '@/components/ui';

<Card>
  <CardHeader 
    title="Titre" 
    subtitle="Sous-titre"
    action={<Button size="sm">Action</Button>}
  />
  <CardSection>
    Contenu
  </CardSection>
</Card>
```

### Input
```jsx
import { Input, Select } from '@/components/ui';

<Input 
  label="Nom" 
  placeholder="Entrez le nom"
  icon={UserIcon}
  error="Champ requis"
/>

<Select label="Type">
  <option>Option 1</option>
  <option>Option 2</option>
</Select>
```

### Badge
```jsx
import { Badge } from '@/components/ui';

<Badge variant="success">Actif</Badge>
<Badge variant="warning">En attente</Badge>
<Badge variant="danger">Erreur</Badge>
```

### Table
```jsx
import { 
  Table, 
  TableHeader, 
  TableHeaderCell, 
  TableBody, 
  TableRow, 
  TableCell,
  TableEmpty,
  TableLoading 
} from '@/components/ui';

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
        <TableRow key={item.id} onClick={() => handleClick(item)}>
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

### KPI
```jsx
import { KPI } from '@/components/ui';

<KPI 
  label="Total Expéditions"
  value="1,234"
  subtitle="Ce mois"
  icon={TruckIcon}
  trend={12.5}
  variant="default"
/>
```

### PageHeader
```jsx
import { PageHeader } from '@/components/ui';

<PageHeader 
  title="Expéditions"
  subtitle="Gérez vos expéditions"
  actions={
    <>
      <Button variant="secondary">Filtrer</Button>
      <Button variant="primary">Nouvelle expédition</Button>
    </>
  }
/>
```

## 🎯 Structure de Page Standard

```jsx
<div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
  {/* Header */}
  <PageHeader 
    title="Titre de la page"
    subtitle="Description"
    actions={<Button>Action</Button>}
  />
  
  {/* KPIs */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <KPI label="KPI 1" value="100" />
    <KPI label="KPI 2" value="200" />
    <KPI label="KPI 3" value="300" />
    <KPI label="KPI 4" value="400" />
  </div>
  
  {/* Filtres */}
  <Card>
    <div className="flex items-center gap-4">
      <Input placeholder="Rechercher..." />
      <Select>
        <option>Tous</option>
      </Select>
    </div>
  </Card>
  
  {/* Contenu principal */}
  <Card padding={false}>
    <Table>
      {/* ... */}
    </Table>
  </Card>
</div>
```

## ❌ À Éviter

- ❌ Gradients agressifs
- ❌ Couleurs multiples inutiles
- ❌ `font-black` partout
- ❌ Animations exagérées
- ❌ Ombres multiples
- ❌ Composants collés
- ❌ Icônes décoratives inutiles

## ✅ Bonnes Pratiques

- ✅ Utiliser les composants du Design System
- ✅ Respecter l'espacement standard
- ✅ Alignement cohérent (texte à gauche, montants à droite)
- ✅ États clairs (loading, vide, erreur)
- ✅ Transitions subtiles (200ms)
- ✅ Ombres légères (`shadow-sm`)
