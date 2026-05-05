# 🎨 Système Typographique - Guide Complet

## 📖 Vue d'ensemble

Ce document décrit le système typographique professionnel implémenté dans l'application de gestion d'expédition. Il garantit une interface cohérente, lisible et moderne type SaaS.

---

## 🔤 Polices

### Police Principale
- **Inter** - Pour tout le contenu (corps de texte, tableaux, formulaires)
- Poids disponibles : 300, 400, 500, 600, 700, 800

### Police Display (Titres)
- **Poppins** - Pour les titres et éléments de hiérarchie
- Poids disponibles : 400, 500, 600, 700, 800

---

## 📏 Hiérarchie Typographique

### Titres

| Élément | Classe Tailwind | Taille | Poids | Line Height | Usage |
|---------|----------------|--------|-------|-------------|-------|
| H1 | `text-h1` | 28px | 700 | 1.2 | Titres de page principaux |
| H1 Mobile | `text-h1-mobile` | 24px | 700 | 1.2 | Titres de page sur mobile |
| H2 | `text-h2` | 24px | 600 | 1.3 | Sections principales |
| H2 Mobile | `text-h2-mobile` | 20px | 600 | 1.3 | Sections sur mobile |
| H3 | `text-h3` | 20px | 600 | 1.4 | Sous-sections |
| H3 Mobile | `text-h3-mobile` | 18px | 600 | 1.4 | Sous-sections sur mobile |
| H4 | `text-h4` | 18px | 600 | 1.4 | Titres de cards |

### Corps de Texte

| Élément | Classe Tailwind | Taille | Poids | Line Height | Usage |
|---------|----------------|--------|-------|-------------|-------|
| Large | `text-body-lg` | 16px | 400 | 1.6 | Texte important, descriptions |
| Normal | `text-body` | 14px | 400 | 1.5 | Texte standard |
| Small | `text-body-sm` | 13px | 400 | 1.5 | Texte secondaire |

### Tableaux (CRITIQUE)

| Élément | Classe Tailwind | Taille | Poids | Line Height | Usage |
|---------|----------------|--------|-------|-------------|-------|
| En-tête | `text-table-header` | 13px | 600 | 1.4 | Headers de colonnes |
| Cellule | `text-table-cell` | 14px | 500 | 1.4 | Données principales |
| Cellule Small | `text-table-cell-sm` | 13px | 500 | 1.4 | Données sur mobile |

### Labels & Métadonnées

| Élément | Classe Tailwind | Taille | Poids | Line Height | Usage |
|---------|----------------|--------|-------|-------------|-------|
| Label | `text-label` | 14px | 500 | 1.4 | Labels de formulaires |
| Label Small | `text-label-sm` | 12px | 500 | 1.4 | Labels compacts |
| Caption | `text-caption` | 12px | 400 | 1.4 | Texte d'aide, notes |

### Badges & Statuts

| Élément | Classe Tailwind | Taille | Poids | Line Height | Usage |
|---------|----------------|--------|-------|-------------|-------|
| Badge | `text-badge` | 12px | 600 | 1.2 | Statuts, tags |
| Badge Small | `text-badge-sm` | 11px | 600 | 1.2 | Badges compacts |

---

## 🎯 Classes de Composants

### Boutons

```jsx
// Bouton principal
<button className="btn-primary">Enregistrer</button>

// Bouton secondaire
<button className="btn-secondary">Annuler</button>

// Bouton danger
<button className="btn-danger">Supprimer</button>

// Bouton success
<button className="btn-success">Valider</button>

// Tailles
<button className="btn-primary btn-sm">Petit</button>
<button className="btn-primary">Normal</button>
<button className="btn-primary btn-lg">Grand</button>
```

### Formulaires

```jsx
// Label + Input
<label className="input-label">Nom du client</label>
<input type="text" className="input-field" placeholder="Entrez le nom" />
<p className="input-hint">Le nom complet du client</p>

// Message d'erreur
<p className="input-error">Ce champ est requis</p>
```

### Cards

```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Détails de l'expédition</h3>
    <p className="card-subtitle">Informations complètes</p>
  </div>
  
  <div className="card-body">
    {/* Contenu */}
  </div>
  
  <div className="card-footer">
    {/* Actions */}
  </div>
</div>

// Card mobile optimisée
<div className="card-mobile">
  {/* Contenu */}
</div>
```

### Tableaux (TRÈS IMPORTANT)

```jsx
<div className="table-container">
  <table className="table">
    <thead className="table-header">
      <tr>
        <th className="table-header-cell-left">Client</th>
        <th className="table-header-cell-center">Date</th>
        <th className="table-header-cell-right">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr className="table-row">
        <td className="table-cell-left">Jean Dupont</td>
        <td className="table-cell-center">15/01/2024</td>
        <td className="table-cell-amount">1 250,00 €</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Règles d'alignement des tableaux :**
- Texte → `table-cell-left`
- Dates → `table-cell-center`
- Montants → `table-cell-right` ou `table-cell-amount`
- Données secondaires → `table-cell-secondary`

### Badges & Statuts

```jsx
// Statuts colorés
<span className="badge-success">Livré</span>
<span className="badge-warning">En cours</span>
<span className="badge-danger">Annulé</span>
<span className="badge-info">En attente</span>
<span className="badge-neutral">Brouillon</span>
<span className="badge-primary">Nouveau</span>

// Badge compact
<span className="badge-success badge-sm">Actif</span>
```

### Listes de Données

```jsx
<div className="data-list">
  <div className="data-item">
    <span className="data-label">Client</span>
    <span className="data-value">Jean Dupont</span>
  </div>
  
  <div className="data-item">
    <span className="data-label">Montant total</span>
    <span className="data-value-amount">1 250,00 €</span>
  </div>
</div>
```

### Sections & Layouts

```jsx
// En-tête de page
<div className="page-header">
  <h1 className="page-title">Gestion des Expéditions</h1>
  <p className="page-description">
    Gérez toutes vos expéditions en un seul endroit
  </p>
</div>

// Section
<div>
  <h2 className="section-title">Expéditions récentes</h2>
  <p className="section-subtitle">
    Les 10 dernières expéditions créées
  </p>
</div>
```

### Montants & Nombres

```jsx
// Montant standard
<span className="amount">1 250,00 €</span>

// Montant large (dashboard)
<div className="amount-lg">15 450,00 €</div>

// Montants colorés
<span className="amount-primary">1 250,00 €</span>
<span className="amount-success">+ 350,00 €</span>
<span className="amount-danger">- 150,00 €</span>
```

---

## 🎨 Couleurs de Texte

### Hiérarchie de Gris

```jsx
text-gray-900  // Titres principaux (H1, H2)
text-gray-800  // Titres secondaires (H3, H4)
text-gray-700  // Corps de texte, labels
text-gray-600  // Texte secondaire, descriptions
text-gray-500  // Texte d'aide, hints
text-gray-400  // Placeholders
```

### Couleurs Sémantiques

```jsx
text-green-700   // Succès, montants positifs
text-red-700     // Erreurs, montants négatifs
text-yellow-700  // Avertissements
text-blue-700    // Informations
text-primary-700 // Éléments de marque
```

---

## 📱 Responsive Design

Le système s'adapte automatiquement aux mobiles :

- **Desktop** : Tailles complètes
- **Mobile** : Tailles réduites automatiquement
- Les classes `-mobile` sont appliquées automatiquement sous 640px

---

## ✅ Checklist d'Application

Lors de la création/modification d'un composant :

- [ ] Utiliser `font-sans` (Inter) pour le contenu
- [ ] Utiliser `font-display` (Poppins) pour les titres
- [ ] Respecter la hiérarchie H1 → H2 → H3 → H4
- [ ] Tableaux : utiliser les classes `table-*`
- [ ] Alignement tableaux : texte gauche, dates centre, montants droite
- [ ] Badges : utiliser les classes sémantiques (`badge-success`, etc.)
- [ ] Formulaires : toujours un `input-label` + `input-field`
- [ ] Montants : utiliser `tabular-nums` pour l'alignement
- [ ] Contraste : minimum 4.5:1 pour le texte normal
- [ ] Mobile : tester la lisibilité sur petit écran

---

## 🚀 Exemples Complets

### Page d'Expéditions

```jsx
<div className="p-6">
  {/* En-tête */}
  <div className="page-header">
    <h1 className="page-title">Expéditions</h1>
    <p className="page-description">
      Gérez toutes vos expéditions en temps réel
    </p>
  </div>

  {/* Tableau */}
  <div className="table-container">
    <table className="table">
      <thead className="table-header">
        <tr>
          <th className="table-header-cell-left">Référence</th>
          <th className="table-header-cell-left">Client</th>
          <th className="table-header-cell-center">Date</th>
          <th className="table-header-cell-center">Statut</th>
          <th className="table-header-cell-right">Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr className="table-row">
          <td className="table-cell-left font-semibold">EXP-2024-001</td>
          <td className="table-cell-left">Jean Dupont</td>
          <td className="table-cell-center">15/01/2024</td>
          <td className="table-cell-center">
            <span className="badge-success">Livré</span>
          </td>
          <td className="table-cell-amount">1 250,00 €</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Formulaire de Création

```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Nouvelle Expédition</h3>
    <p className="card-subtitle">Remplissez les informations</p>
  </div>

  <div className="card-body">
    <div className="space-y-4">
      <div>
        <label className="input-label">Nom du client</label>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Entrez le nom"
        />
        <p className="input-hint">Le nom complet du client</p>
      </div>

      <div>
        <label className="input-label">Montant</label>
        <input 
          type="number" 
          className="input-field" 
          placeholder="0.00"
        />
      </div>
    </div>
  </div>

  <div className="card-footer flex justify-end gap-3">
    <button className="btn-secondary">Annuler</button>
    <button className="btn-primary">Créer l'expédition</button>
  </div>
</div>
```

### Dashboard Card

```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Revenus du mois</h3>
  </div>
  
  <div className="card-body">
    <div className="amount-lg text-primary-700">
      15 450,00 €
    </div>
    <p className="text-body-sm text-gray-600 mt-2">
      <span className="amount-success">+12%</span> par rapport au mois dernier
    </p>
  </div>
</div>
```

---

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

- Utiliser les classes prédéfinies
- Respecter la hiérarchie typographique
- Tester sur mobile ET desktop
- Utiliser `tabular-nums` pour les montants
- Maintenir un contraste suffisant
- Utiliser les badges sémantiques

### ❌ À ÉVITER

- Mélanger trop de tailles de police
- Utiliser des polices fantaisie
- Ignorer la hiérarchie (H1 → H3 sans H2)
- Texte trop petit (< 12px)
- Mauvais alignement dans les tableaux
- Couleurs de texte trop claires

---

## 📚 Ressources

- **Inter** : https://fonts.google.com/specimen/Inter
- **Poppins** : https://fonts.google.com/specimen/Poppins
- **Tailwind CSS** : https://tailwindcss.com/docs
- **WCAG Contrast** : https://webaim.org/resources/contrastchecker/

---

**Dernière mise à jour** : Mai 2026
**Version** : 1.0.0
