# 📦 Guide des Composants avec Typographie Standardisée

Ce guide explique comment utiliser les composants React avec la nouvelle typographie professionnelle.

---

## 🎯 Composants Disponibles

### 1. **Button** - Boutons standardisés

```jsx
import Button from '../components/Button';

// Variantes
<Button variant="primary">Enregistrer</Button>
<Button variant="secondary">Annuler</Button>
<Button variant="danger">Supprimer</Button>
<Button variant="success">Valider</Button>
<Button variant="outline">Voir plus</Button>

// Tailles
<Button size="sm">Petit</Button>
<Button size="md">Normal</Button>
<Button size="lg">Grand</Button>

// État désactivé
<Button disabled>Désactivé</Button>
```

---

### 2. **Input** - Champs de formulaire

```jsx
import Input from '../components/Input';

<Input
  label="Nom du client"
  type="text"
  placeholder="Entrez le nom"
  value={name}
  onChange={(e) => setName(e.target.value)}
  hint="Le nom complet du client"
  required
/>

// Avec erreur
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error="Email invalide"
/>
```

---

### 3. **Card** - Cartes de contenu

```jsx
import Card from '../components/Card';

<Card
  title="Détails de l'expédition"
  subtitle="Informations complètes"
  headerActions={
    <>
      <Button size="sm" variant="secondary">Modifier</Button>
      <Button size="sm" variant="primary">Imprimer</Button>
    </>
  }
  footer={
    <div className="flex justify-end gap-3">
      <Button variant="secondary">Annuler</Button>
      <Button variant="primary">Enregistrer</Button>
    </div>
  }
>
  {/* Contenu de la card */}
  <p>Votre contenu ici...</p>
</Card>
```

---

### 4. **Table** - Tableaux de données

```jsx
import Table from '../components/Table';

const columns = [
  { 
    key: 'reference', 
    label: 'Référence', 
    align: 'left' 
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
  data={expeditions}
  onRowClick={(row) => navigate(`/expedition/${row.id}`)}
  emptyMessage="Aucune expédition trouvée"
  loading={isLoading}
/>
```

**Règles d'alignement :**
- Texte → `align: 'left'`
- Dates → `align: 'center'`
- Montants → `align: 'right'` + `isAmount: true`

---

### 5. **Badge** - Badges et statuts

```jsx
import Badge, { StatusBadge, TypeBadge } from '../components/Badge';

// Badge simple
<Badge variant="success">Actif</Badge>
<Badge variant="warning">En attente</Badge>
<Badge variant="danger">Annulé</Badge>
<Badge variant="info">Information</Badge>
<Badge variant="neutral">Neutre</Badge>
<Badge variant="primary">Nouveau</Badge>

// Badge compact
<Badge variant="success" size="sm">Actif</Badge>

// Badge de statut (mapping automatique)
<StatusBadge status="delivered" label="Livré" />
<StatusBadge status="en_attente" label="En attente" />

// Badge de type d'expédition
<TypeBadge type="simple" />
<TypeBadge type="groupage_dhd_aerien" />
```

---

### 6. **PageHeader** - En-têtes de page

```jsx
import PageHeader, { SectionHeader, Breadcrumb } from '../components/PageHeader';

// En-tête de page complet
<PageHeader
  title="Gestion des Expéditions"
  description="Gérez toutes vos expéditions en temps réel"
  breadcrumb={
    <Breadcrumb items={[
      { label: 'Accueil', href: '/' },
      { label: 'Expéditions', href: '/expeditions' },
      { label: 'Détails' }
    ]} />
  }
  actions={
    <>
      <Button variant="secondary">Exporter</Button>
      <Button variant="primary">Nouvelle expédition</Button>
    </>
  }
/>

// En-tête de section
<SectionHeader
  title="Expéditions récentes"
  subtitle="Les 10 dernières expéditions créées"
  actions={
    <Button size="sm" variant="outline">Voir tout</Button>
  }
/>
```

---

### 7. **DataList** - Listes de données

```jsx
import DataList, { DataCard, StatCard } from '../components/DataList';

// Liste verticale
<DataList
  items={[
    { label: 'Client', value: 'Jean Dupont' },
    { label: 'Téléphone', value: '+33 6 12 34 56 78' },
    { label: 'Email', value: 'jean@example.com' },
    { label: 'Montant', value: '1 250,00 €', isAmount: true }
  ]}
/>

// Liste horizontale (grille)
<DataList
  layout="horizontal"
  items={[
    { label: 'Référence', value: 'EXP-2024-001' },
    { label: 'Date', value: '15/01/2024' },
    { label: 'Statut', value: 'Livré' },
    { label: 'Montant', value: '1 250,00 €', isAmount: true }
  ]}
/>

// Card avec données
<DataCard
  title="Informations client"
  items={[
    { label: 'Nom', value: 'Jean Dupont' },
    { label: 'Email', value: 'jean@example.com' }
  ]}
/>

// Card de statistique
<StatCard
  label="Revenus du mois"
  value="15 450,00 €"
  subtitle="Toutes expéditions confondues"
  variant="primary"
  trend={{
    direction: 'up',
    value: '+12%',
    label: 'vs mois dernier'
  }}
  icon={
    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
      <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  }
/>
```

---

## 🎨 Classes CSS Utilitaires

### Typographie

```jsx
// Titres
<h1 className="text-h1 font-display">Titre H1</h1>
<h2 className="text-h2 font-display">Titre H2</h2>
<h3 className="text-h3 font-display">Titre H3</h3>
<h4 className="text-h4">Titre H4</h4>

// Corps de texte
<p className="text-body-lg">Texte large</p>
<p className="text-body">Texte normal</p>
<p className="text-body-sm">Texte petit</p>

// Labels
<label className="text-label">Label</label>
<span className="text-label-sm">Label petit</span>
<span className="text-caption">Caption</span>

// Tableaux
<th className="text-table-header">En-tête</th>
<td className="text-table-cell">Cellule</td>

// Badges
<span className="text-badge">Badge</span>
```

### Couleurs de Texte

```jsx
// Hiérarchie
<p className="text-gray-900">Texte principal</p>
<p className="text-gray-700">Texte standard</p>
<p className="text-gray-600">Texte secondaire</p>
<p className="text-gray-500">Texte d'aide</p>

// Sémantiques
<p className="text-green-700">Succès</p>
<p className="text-red-700">Erreur</p>
<p className="text-yellow-700">Avertissement</p>
<p className="text-blue-700">Information</p>
```

### Montants

```jsx
// Montant standard
<span className="amount">1 250,00 €</span>

// Montant large
<div className="amount-lg">15 450,00 €</div>

// Montants colorés
<span className="amount-primary">1 250,00 €</span>
<span className="amount-success">+ 350,00 €</span>
<span className="amount-danger">- 150,00 €</span>
```

---

## 📋 Exemple Complet : Page d'Expéditions

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import { StatusBadge, TypeBadge } from '../components/Badge';
import { StatCard } from '../components/DataList';
import { formatPrice, formatDate } from '../utils/format';

const Expeditions = () => {
  const navigate = useNavigate();
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Colonnes du tableau
  const columns = [
    {
      key: 'reference',
      label: 'Référence',
      align: 'left',
      render: (value) => (
        <span className="font-semibold text-gray-900">{value}</span>
      )
    },
    {
      key: 'type_expedition',
      label: 'Type',
      align: 'left',
      render: (value) => <TypeBadge type={value} size="sm" />
    },
    {
      key: 'expediteur',
      label: 'Expéditeur',
      align: 'left',
      render: (value) => value?.nom_prenom || '—'
    },
    {
      key: 'destinataire',
      label: 'Destinataire',
      align: 'left',
      render: (value) => value?.nom_prenom || '—'
    },
    {
      key: 'created_at',
      label: 'Date',
      align: 'center',
      render: (value) => formatDate(value)
    },
    {
      key: 'statut_expedition',
      label: 'Statut',
      align: 'center',
      render: (value, row) => (
        <StatusBadge status={value} label={getStatusLabel(value)} />
      )
    },
    {
      key: 'montant_expedition',
      label: 'Montant',
      align: 'right',
      isAmount: true,
      render: (value) => formatPrice(value)
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Expéditions"
        description="Gérez toutes vos expéditions en temps réel"
        actions={
          <>
            <Button variant="secondary">
              Exporter
            </Button>
            <Button 
              variant="primary"
              onClick={() => navigate('/create-expedition')}
            >
              Nouvelle expédition
            </Button>
          </>
        }
      />

      {/* Statistiques */}
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
          trend={{
            direction: 'up',
            value: '+12%',
            label: 'vs mois dernier'
          }}
        />
        <StatCard
          label="En cours"
          value="23"
          variant="warning"
        />
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex gap-4">
          <Input
            placeholder="Rechercher une expédition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="secondary">Filtrer</Button>
        </div>
      </div>

      {/* Tableau */}
      <Table
        columns={columns}
        data={expeditions}
        onRowClick={(row) => navigate(`/expedition/${row.id}`)}
        loading={loading}
        emptyMessage="Aucune expédition trouvée"
      />
    </div>
  );
};

export default Expeditions;
```

---

## ✅ Checklist de Migration

Lors de la migration d'une page existante :

- [ ] Remplacer les boutons par le composant `Button`
- [ ] Remplacer les inputs par le composant `Input`
- [ ] Utiliser `Card` pour les conteneurs
- [ ] Utiliser `Table` pour les tableaux de données
- [ ] Utiliser `Badge` pour les statuts
- [ ] Utiliser `PageHeader` pour l'en-tête
- [ ] Utiliser `DataList` pour les paires clé-valeur
- [ ] Appliquer les classes typographiques (`text-h1`, `text-body`, etc.)
- [ ] Vérifier l'alignement des tableaux (texte gauche, dates centre, montants droite)
- [ ] Tester sur mobile et desktop

---

## 🎯 Bonnes Pratiques

1. **Toujours utiliser les composants** plutôt que recréer des styles
2. **Respecter l'alignement des tableaux** : texte à gauche, dates au centre, montants à droite
3. **Utiliser les badges sémantiques** pour les statuts
4. **Appliquer `isAmount: true`** pour les colonnes de montants
5. **Tester la lisibilité** sur mobile et desktop
6. **Maintenir la cohérence** en utilisant les mêmes composants partout

---

**Version** : 1.0.0
**Dernière mise à jour** : Mai 2026
