# ⚡ Guide de Migration Rapide - Typographie

Guide ultra-rapide pour migrer une page vers le nouveau système typographique.

---

## 🎯 En 5 Minutes

### 1. Importer les Composants

```jsx
// En haut de votre fichier
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Badge, { StatusBadge, TypeBadge } from '../components/Badge';
import { StatCard, DataList } from '../components/DataList';
```

---

### 2. Remplacer les Éléments Courants

#### Avant → Après

**Boutons**
```jsx
// ❌ Avant
<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded">
  Enregistrer
</button>

// ✅ Après
<Button variant="primary">Enregistrer</Button>
```

**Inputs**
```jsx
// ❌ Avant
<div>
  <label className="block text-sm font-medium mb-2">Nom</label>
  <input className="w-full px-3 py-2 border rounded" />
</div>

// ✅ Après
<Input label="Nom" value={nom} onChange={setNom} />
```

**Titres**
```jsx
// ❌ Avant
<h1 className="text-2xl font-bold">Titre</h1>

// ✅ Après
<h1 className="text-h1 font-display">Titre</h1>
// OU
<PageHeader title="Titre" description="Description" />
```

**Badges**
```jsx
// ❌ Avant
<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
  Livré
</span>

// ✅ Après
<StatusBadge status="delivered" label="Livré" />
```

**Cards**
```jsx
// ❌ Avant
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">Titre</h3>
  {/* contenu */}
</div>

// ✅ Après
<Card title="Titre">
  {/* contenu */}
</Card>
```

---

### 3. Migrer un Tableau (IMPORTANT)

```jsx
// ❌ Avant
<table className="w-full">
  <thead>
    <tr>
      <th className="text-left">Client</th>
      <th className="text-right">Montant</th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id}>
        <td>{item.client}</td>
        <td className="text-right">{item.montant}</td>
      </tr>
    ))}
  </tbody>
</table>

// ✅ Après
const columns = [
  { key: 'client', label: 'Client', align: 'left' },
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
  onRowClick={(row) => handleClick(row)}
/>
```

---

## 📋 Checklist Ultra-Rapide

Cochez au fur et à mesure :

### Structure de Page
- [ ] `<PageHeader>` pour l'en-tête
- [ ] `<Card>` pour les conteneurs
- [ ] `<Table>` pour les tableaux

### Composants
- [ ] `<Button>` pour tous les boutons
- [ ] `<Input>` pour tous les champs
- [ ] `<Badge>` pour tous les statuts

### Typographie
- [ ] `text-h1`, `text-h2`, `text-h3` pour les titres
- [ ] `text-body` pour le texte normal
- [ ] `text-label` pour les labels
- [ ] `text-caption` pour les petits textes

### Tableaux
- [ ] Colonnes définies avec `align`
- [ ] Texte → `align: 'left'`
- [ ] Dates → `align: 'center'`
- [ ] Montants → `align: 'right'` + `isAmount: true`

### Test
- [ ] Vérifier sur desktop
- [ ] Vérifier sur mobile
- [ ] Vérifier les couleurs de statut

---

## 🎨 Classes CSS les Plus Utilisées

### Copier-Coller Rapide

```jsx
// Titres
className="text-h1 font-display"
className="text-h2 font-display"
className="text-h3 font-display"

// Texte
className="text-body"
className="text-body-lg"
className="text-body-sm"

// Labels
className="text-label"
className="text-label-sm"
className="text-caption"

// Couleurs
className="text-gray-900"  // Titre principal
className="text-gray-700"  // Texte standard
className="text-gray-600"  // Texte secondaire
className="text-gray-500"  // Texte d'aide

// Montants
className="amount"
className="amount-lg"
className="tabular-nums"
```

---

## 🚀 Template de Page Complet

Copiez ce template pour démarrer rapidement :

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

  // Définir les colonnes du tableau
  const columns = [
    { 
      key: 'reference', 
      label: 'Référence', 
      align: 'left',
      render: (value) => <span className="font-semibold">{value}</span>
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

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Titre de la Page"
        description="Description de la page"
        actions={
          <>
            <Button variant="secondary">Action 2</Button>
            <Button variant="primary">Action 1</Button>
          </>
        }
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Métrique 1"
          value="123"
          variant="default"
        />
        <StatCard
          label="Métrique 2"
          value="456"
          variant="primary"
        />
        <StatCard
          label="Métrique 3"
          value="789"
          variant="success"
        />
      </div>

      {/* Filtres */}
      <Card>
        <div className="flex gap-4">
          <Input
            placeholder="Rechercher..."
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
        emptyMessage="Aucune donnée"
      />
    </div>
  );
};

export default MaPage;
```

---

## 🎯 Règles d'Or

### 1. Alignement des Tableaux
```
Texte     → Gauche
Dates     → Centre
Montants  → Droite + isAmount: true
```

### 2. Hiérarchie des Titres
```
H1 → Titre de page (PageHeader)
H2 → Section principale
H3 → Sous-section (Card title)
H4 → Petit titre
```

### 3. Variantes de Boutons
```
primary   → Action principale
secondary → Action secondaire
danger    → Suppression
success   → Validation
```

### 4. Variantes de Badges
```
success → Positif (livré, validé)
warning → Attente (en cours, pending)
danger  → Négatif (annulé, refusé)
info    → Information (transit)
```

---

## ⚠️ Erreurs Courantes à Éviter

### ❌ Ne PAS faire

```jsx
// Mélanger les tailles
<h1 className="text-xl">Titre</h1>  // ❌

// Créer des boutons custom
<button className="bg-blue-500...">  // ❌

// Tableaux sans alignement
<td>{montant}</td>  // ❌

// Badges custom
<span className="bg-green-100...">  // ❌
```

### ✅ À faire

```jsx
// Utiliser les classes standardisées
<h1 className="text-h1 font-display">Titre</h1>  // ✅

// Utiliser les composants
<Button variant="primary">Action</Button>  // ✅

// Tableaux avec alignement
{ key: 'montant', align: 'right', isAmount: true }  // ✅

// Badges standardisés
<StatusBadge status="success" />  // ✅
```

---

## 📚 Ressources

- **Documentation complète** : `SYSTEME_TYPOGRAPHIQUE.md`
- **Guide des composants** : `GUIDE_COMPOSANTS_TYPOGRAPHIE.md`
- **Résumé complet** : `REFACTORING_TYPOGRAPHIE_COMPLETE.md`
- **Composants** : `src/components/`
- **Classes CSS** : `src/index.css`

---

## 🆘 Aide Rapide

**Problème** : Le texte est trop petit
**Solution** : Utiliser `text-body` au lieu de `text-sm`

**Problème** : Les montants ne s'alignent pas
**Solution** : Ajouter `isAmount: true` dans la colonne

**Problème** : Le badge n'a pas la bonne couleur
**Solution** : Utiliser `<StatusBadge>` qui fait le mapping automatique

**Problème** : Le bouton n'a pas le bon style
**Solution** : Utiliser `<Button variant="primary">` au lieu de classes custom

---

**Temps de migration moyen** : 15-30 minutes par page
**Difficulté** : ⭐⭐ (Facile)
**Impact** : ⭐⭐⭐⭐⭐ (Très élevé)

---

✅ **Vous êtes prêt à migrer !**
