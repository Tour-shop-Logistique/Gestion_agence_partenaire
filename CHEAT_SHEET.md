# 📋 Cheat Sheet - Système Typographique

> Aide-mémoire rapide pour le développement quotidien

---

## 🎯 COMPOSANTS - COPIER/COLLER

### Button
```jsx
<Button variant="primary">Texte</Button>
<Button variant="secondary">Texte</Button>
<Button variant="danger">Texte</Button>
<Button variant="success">Texte</Button>
<Button size="sm">Petit</Button>
<Button size="lg">Grand</Button>
```

### Input
```jsx
<Input
  label="Label"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Placeholder"
  hint="Texte d'aide"
  error="Message d'erreur"
  required
/>
```

### Card
```jsx
<Card
  title="Titre"
  subtitle="Sous-titre"
  headerActions={<Button size="sm">Action</Button>}
  footer={<Button>Action</Button>}
>
  Contenu
</Card>
```

### Table
```jsx
const columns = [
  { key: 'name', label: 'Nom', align: 'left' },
  { key: 'date', label: 'Date', align: 'center' },
  { key: 'amount', label: 'Montant', align: 'right', isAmount: true }
];

<Table
  columns={columns}
  data={data}
  onRowClick={(row) => handleClick(row)}
  loading={loading}
  emptyMessage="Aucune donnée"
/>
```

### Badge
```jsx
<StatusBadge status="delivered" label="Livré" />
<TypeBadge type="simple" />
<Badge variant="success">Texte</Badge>
```

### PageHeader
```jsx
<PageHeader
  title="Titre"
  description="Description"
  actions={<Button>Action</Button>}
/>
```

### DataList
```jsx
<DataList
  items={[
    { label: 'Nom', value: 'Jean' },
    { label: 'Montant', value: '1 250€', isAmount: true }
  ]}
/>
```

### StatCard
```jsx
<StatCard
  label="Revenus"
  value="15 450€"
  variant="primary"
  trend={{ direction: 'up', value: '+12%', label: 'vs mois dernier' }}
/>
```

---

## 🎨 CLASSES CSS - COPIER/COLLER

### Titres
```jsx
<h1 className="text-h1 font-display">Titre H1</h1>
<h2 className="text-h2 font-display">Titre H2</h2>
<h3 className="text-h3 font-display">Titre H3</h3>
<h4 className="text-h4">Titre H4</h4>
```

### Texte
```jsx
<p className="text-body-lg">Texte large</p>
<p className="text-body">Texte normal</p>
<p className="text-body-sm">Texte petit</p>
```

### Labels
```jsx
<label className="text-label">Label</label>
<span className="text-label-sm">Label petit</span>
<span className="text-caption">Caption</span>
```

### Couleurs
```jsx
<p className="text-gray-900">Titre principal</p>
<p className="text-gray-700">Texte standard</p>
<p className="text-gray-600">Texte secondaire</p>
<p className="text-gray-500">Texte d'aide</p>
```

### Montants
```jsx
<span className="amount">1 250,00 €</span>
<div className="amount-lg">15 450,00 €</div>
<span className="amount-success">+ 350,00 €</span>
<span className="amount-danger">- 150,00 €</span>
```

---

## 📊 TABLEAUX - TEMPLATE

```jsx
const columns = [
  {
    key: 'reference',
    label: 'Référence',
    align: 'left',
    render: (value) => <span className="font-semibold">{value}</span>
  },
  {
    key: 'client',
    label: 'Client',
    align: 'left'
  },
  {
    key: 'date',
    label: 'Date',
    align: 'center',
    render: (value) => formatDate(value)
  },
  {
    key: 'status',
    label: 'Statut',
    align: 'center',
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: 'montant',
    label: 'Montant',
    align: 'right',
    isAmount: true,
    render: (value) => formatPrice(value)
  }
];

<Table
  columns={columns}
  data={data}
  onRowClick={(row) => navigate(`/detail/${row.id}`)}
  loading={isLoading}
  emptyMessage="Aucune donnée trouvée"
/>
```

---

## 📝 FORMULAIRE - TEMPLATE

```jsx
<Card title="Formulaire">
  <div className="space-y-4">
    <Input
      label="Nom"
      value={nom}
      onChange={(e) => setNom(e.target.value)}
      required
    />
    
    <Input
      label="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={emailError}
      required
    />
    
    <Input
      label="Téléphone"
      value={tel}
      onChange={(e) => setTel(e.target.value)}
      hint="Format: +33 6 12 34 56 78"
    />
  </div>
  
  <div className="flex justify-end gap-3 mt-6">
    <Button variant="secondary" onClick={onCancel}>
      Annuler
    </Button>
    <Button variant="primary" onClick={onSubmit}>
      Enregistrer
    </Button>
  </div>
</Card>
```

---

## 🃏 CARD AVEC DONNÉES - TEMPLATE

```jsx
<Card title="Informations">
  <DataList
    items={[
      { label: 'Client', value: client.nom },
      { label: 'Email', value: client.email },
      { label: 'Téléphone', value: client.tel },
      { label: 'Montant', value: formatPrice(montant), isAmount: true }
    ]}
  />
</Card>
```

---

## 📈 DASHBOARD - TEMPLATE

```jsx
<div className="p-6 space-y-6">
  <PageHeader
    title="Dashboard"
    description="Vue d'ensemble de votre activité"
  />
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <StatCard
      label="Total expéditions"
      value="156"
      variant="default"
    />
    <StatCard
      label="Revenus du mois"
      value="15 450,00 €"
      variant="primary"
      trend={{ direction: 'up', value: '+12%', label: 'vs mois dernier' }}
    />
    <StatCard
      label="En cours"
      value="23"
      variant="warning"
    />
  </div>
  
  <Card title="Activité récente">
    <Table columns={columns} data={data} />
  </Card>
</div>
```

---

## 🎯 PAGE COMPLÈTE - TEMPLATE

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { StatusBadge } from '../components/Badge';
import { StatCard } from '../components/DataList';

const MaPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    { key: 'ref', label: 'Référence', align: 'left' },
    { key: 'name', label: 'Nom', align: 'left' },
    { key: 'date', label: 'Date', align: 'center' },
    { 
      key: 'status', 
      label: 'Statut', 
      align: 'center',
      render: (v) => <StatusBadge status={v} />
    },
    { 
      key: 'amount', 
      label: 'Montant', 
      align: 'right',
      isAmount: true
    }
  ];

  useEffect(() => {
    // Charger les données
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // ... logique de chargement
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Ma Page"
        description="Description de la page"
        actions={
          <>
            <Button variant="secondary">Exporter</Button>
            <Button variant="primary" onClick={() => navigate('/create')}>
              Créer
            </Button>
          </>
        }
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Métrique 1" value="123" />
        <StatCard label="Métrique 2" value="456" variant="primary" />
        <StatCard label="Métrique 3" value="789" variant="success" />
      </div>

      {/* Filtres */}
      <Card>
        <div className="flex gap-4">
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="secondary">Filtrer</Button>
        </div>
      </Card>

      {/* Tableau */}
      <Table
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/detail/${row.id}`)}
        loading={loading}
        emptyMessage="Aucune donnée trouvée"
      />
    </div>
  );
};

export default MaPage;
```

---

## 🎨 COULEURS RAPIDES

```jsx
// Texte
text-gray-900  text-gray-800  text-gray-700
text-gray-600  text-gray-500  text-gray-400

// Succès
text-green-700  bg-green-50  border-green-200

// Erreur
text-red-700  bg-red-50  border-red-200

// Avertissement
text-yellow-700  bg-yellow-50  border-yellow-200

// Info
text-blue-700  bg-blue-50  border-blue-200

// Primaire
text-primary-700  bg-primary-50  border-primary-200
```

---

## 📏 ESPACEMENTS RAPIDES

```jsx
// Padding
p-4  p-6  px-4  py-2  pt-4  pb-6

// Margin
m-4  m-6  mx-4  my-2  mt-4  mb-6

// Gap
gap-2  gap-3  gap-4  gap-6

// Space
space-y-2  space-y-4  space-y-6  space-x-2  space-x-4
```

---

## 🎯 LAYOUTS RAPIDES

```jsx
// Flex
<div className="flex items-center justify-between gap-4">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Container
<div className="p-6 space-y-6">
```

---

## ✅ CHECKLIST RAPIDE

```
☐ Importer les composants
☐ <PageHeader> pour l'en-tête
☐ <Table> pour les tableaux
☐ <Button> pour les boutons
☐ <Input> pour les champs
☐ <Badge> pour les statuts
☐ Classes typographiques
☐ Alignement tableaux (← ↕ →)
☐ Test mobile
```

---

## 🎯 RÈGLES D'OR

```
1. Titres → font-display
2. Texte → font-sans
3. Tableaux → ← ↕ →
4. Montants → tabular-nums
5. Badges → sémantiques
6. Composants → toujours
7. Mobile → tester
8. Custom → éviter
```

---

## 🔍 RECHERCHE RAPIDE

| Je cherche... | J'utilise... |
|---------------|--------------|
| Titre page | `text-h1 font-display` |
| Titre section | `text-h2 font-display` |
| Titre card | `text-h3 font-display` |
| Texte normal | `text-body` |
| Label | `text-label` |
| Aide | `text-caption` |
| Montant | `amount tabular-nums` |
| Bouton | `<Button variant="primary">` |
| Input | `<Input label="..." />` |
| Tableau | `<Table columns={...} />` |
| Badge | `<StatusBadge status="..." />` |
| Card | `<Card title="...">` |

---

<div align="center">

**📋 CHEAT SHEET**

*Gardez ce fichier ouvert pendant le développement !*

[📖 Doc Complète](SYSTEME_TYPOGRAPHIQUE.md) • [⚡ Guide Rapide](MIGRATION_RAPIDE.md)

</div>
