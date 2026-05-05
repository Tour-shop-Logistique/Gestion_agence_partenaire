# 📖 Référence Rapide - Classes CSS

Guide de référence ultra-rapide de toutes les classes CSS disponibles.

---

## 🔤 TYPOGRAPHIE

### Titres

```css
text-h1              /* 28px / 700 / -0.02em / 1.2 */
text-h1-mobile       /* 24px / 700 / -0.02em / 1.2 */
text-h2              /* 24px / 600 / -0.01em / 1.3 */
text-h2-mobile       /* 20px / 600 / -0.01em / 1.3 */
text-h3              /* 20px / 600 / -0.01em / 1.4 */
text-h3-mobile       /* 18px / 600 / -0.01em / 1.4 */
text-h4              /* 18px / 600 / 1.4 */
```

### Corps de Texte

```css
text-body-lg         /* 16px / 400 / 1.6 */
text-body            /* 14px / 400 / 1.5 */
text-body-sm         /* 13px / 400 / 1.5 */
```

### Tableaux

```css
text-table-header    /* 13px / 600 / 0.01em / 1.4 */
text-table-cell      /* 14px / 500 / 1.4 */
text-table-cell-sm   /* 13px / 500 / 1.4 */
```

### Labels & Métadonnées

```css
text-label           /* 14px / 500 / 1.4 */
text-label-sm        /* 12px / 500 / 1.4 */
text-caption         /* 12px / 400 / 1.4 */
```

### Badges

```css
text-badge           /* 12px / 600 / 1.2 */
text-badge-sm        /* 11px / 600 / 1.2 */
```

---

## 🎨 POLICES

```css
font-sans            /* Inter (police principale) */
font-display         /* Poppins (titres) */
```

---

## 📏 LINE HEIGHT

```css
leading-tight        /* 1.2 */
leading-snug         /* 1.3 */
leading-normal       /* 1.4 */
leading-relaxed      /* 1.5 */
leading-loose        /* 1.6 */
```

---

## 🔠 LETTER SPACING

```css
tracking-tighter     /* -0.02em */
tracking-tight       /* -0.01em */
tracking-normal      /* 0 */
tracking-wide        /* 0.01em */
tracking-wider       /* 0.02em */
```

---

## 🎯 BOUTONS

### Variantes

```css
btn-primary          /* Bouton principal (jaune) */
btn-secondary        /* Bouton secondaire (gris) */
btn-danger           /* Bouton danger (rouge) */
btn-success          /* Bouton succès (vert) */
```

### Tailles

```css
btn-sm               /* Petit bouton */
/* (défaut)          /* Bouton normal */
btn-lg               /* Grand bouton */
```

### Base

```css
btn                  /* Classe de base (focus, transitions) */
```

---

## 📝 FORMULAIRES

### Inputs

```css
input-field          /* Champ de formulaire standard */
input-label          /* Label de formulaire */
input-error          /* Message d'erreur */
input-hint           /* Texte d'aide */
```

---

## 🃏 CARDS

### Structure

```css
card                 /* Card de base */
card-mobile          /* Card optimisée mobile */
card-header          /* En-tête de card */
card-title           /* Titre de card */
card-subtitle        /* Sous-titre de card */
card-body            /* Corps de card */
card-footer          /* Pied de card */
```

---

## 📊 TABLEAUX

### Conteneur

```css
table-container      /* Conteneur avec scroll */
table                /* Table de base */
```

### En-tête

```css
table-header         /* En-tête du tableau */
table-header-cell    /* Cellule d'en-tête (base) */
table-header-cell-left    /* En-tête aligné à gauche */
table-header-cell-center  /* En-tête centré */
table-header-cell-right   /* En-tête aligné à droite */
```

### Corps

```css
table-row            /* Ligne du tableau */
table-cell           /* Cellule (base) */
table-cell-left      /* Cellule alignée à gauche */
table-cell-center    /* Cellule centrée */
table-cell-right     /* Cellule alignée à droite */
table-cell-amount    /* Cellule de montant (droite + tabular) */
table-cell-secondary /* Cellule secondaire (gris) */
```

---

## 🏷️ BADGES

### Variantes

```css
badge                /* Badge de base */
badge-sm             /* Badge compact */
badge-success        /* Badge succès (vert) */
badge-warning        /* Badge avertissement (jaune) */
badge-danger         /* Badge danger (rouge) */
badge-info           /* Badge info (bleu) */
badge-neutral        /* Badge neutre (gris) */
badge-primary        /* Badge primaire (jaune) */
```

---

## 📋 LISTES DE DONNÉES

```css
data-list            /* Liste de données */
data-item            /* Item de liste */
data-label           /* Label de donnée */
data-value           /* Valeur de donnée */
data-value-amount    /* Valeur montant (tabular) */
```

---

## 🎨 SECTIONS & LAYOUTS

### Page

```css
page-header          /* En-tête de page */
page-title           /* Titre de page */
page-description     /* Description de page */
```

### Section

```css
section-title        /* Titre de section */
section-subtitle     /* Sous-titre de section */
```

---

## 🔢 MONTANTS

```css
amount               /* Montant standard */
amount-lg            /* Montant large (dashboard) */
amount-primary       /* Montant primaire (jaune) */
amount-success       /* Montant succès (vert) */
amount-danger        /* Montant danger (rouge) */
tabular-nums         /* Chiffres tabulaires (alignement) */
```

---

## 💬 HELPERS

```css
tooltip              /* Texte de tooltip */
help-text            /* Texte d'aide */
```

---

## 🎨 COULEURS DE TEXTE

### Hiérarchie de Gris

```css
text-gray-900        /* Titres principaux */
text-gray-800        /* Titres secondaires */
text-gray-700        /* Corps de texte, labels */
text-gray-600        /* Texte secondaire */
text-gray-500        /* Texte d'aide */
text-gray-400        /* Placeholders */
text-gray-300        /* Bordures */
text-gray-200        /* Backgrounds */
text-gray-100        /* Backgrounds clairs */
```

### Couleurs Sémantiques

```css
/* Succès */
text-green-700       /* Texte succès */
text-green-600       /* Texte succès hover */
text-green-800       /* Texte succès foncé */

/* Erreur */
text-red-700         /* Texte erreur */
text-red-600         /* Texte erreur hover */
text-red-800         /* Texte erreur foncé */

/* Avertissement */
text-yellow-700      /* Texte avertissement */
text-yellow-600      /* Texte avertissement hover */
text-yellow-800      /* Texte avertissement foncé */

/* Information */
text-blue-700        /* Texte info */
text-blue-600        /* Texte info hover */
text-blue-800        /* Texte info foncé */

/* Primaire */
text-primary-700     /* Texte primaire */
text-primary-600     /* Texte primaire hover */
text-primary-900     /* Texte primaire foncé */
```

---

## 🎯 UTILITAIRES

### Animations

```css
animate-slide-in     /* Slide depuis la droite */
animate-slide-out    /* Slide vers la droite */
animate-fade-in      /* Fade in */
animate-fade-in-down /* Fade in depuis le haut */
animate-fade-in-up   /* Fade in depuis le bas */
animate-blob         /* Animation blob */
```

### Délais d'Animation

```css
animation-delay-2000 /* Délai de 2s */
animation-delay-4000 /* Délai de 4s */
```

### Interactions

```css
touch-manipulation   /* Optimisation tactile */
scroll-smooth        /* Scroll fluide */
focus-ring           /* Ring de focus */
```

### Typographie

```css
text-balance         /* Équilibrage du texte */
tabular-nums         /* Chiffres tabulaires */
```

---

## 📱 RESPONSIVE

### Breakpoints Tailwind

```css
sm:   /* ≥ 640px  - Tablette portrait */
md:   /* ≥ 768px  - Tablette paysage */
lg:   /* ≥ 1024px - Desktop */
xl:   /* ≥ 1280px - Large desktop */
2xl:  /* ≥ 1536px - Extra large */
```

### Exemples

```css
/* Titre responsive */
text-h1-mobile sm:text-h1

/* Padding responsive */
p-4 sm:p-6

/* Grid responsive */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## 🎯 COMBINAISONS COURANTES

### Titre de Page

```css
text-h1 font-display text-gray-900
```

### Titre de Section

```css
text-h2 font-display text-gray-900 mb-4
```

### Titre de Card

```css
text-h3 font-display text-gray-800
```

### Corps de Texte

```css
text-body text-gray-700
```

### Label de Formulaire

```css
text-label text-gray-700 mb-1.5
```

### Texte d'Aide

```css
text-caption text-gray-500 mt-1
```

### Message d'Erreur

```css
text-caption text-red-600 mt-1
```

### Montant

```css
amount tabular-nums
```

### Montant Large

```css
amount-lg text-primary-700
```

---

## 📊 EXEMPLES COMPLETS

### En-tête de Page

```jsx
<div className="page-header">
  <h1 className="page-title">Titre</h1>
  <p className="page-description">Description</p>
</div>
```

### Card Simple

```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Titre</h3>
  </div>
  <div className="card-body">
    <p className="text-body">Contenu</p>
  </div>
</div>
```

### Tableau

```jsx
<div className="table-container">
  <table className="table">
    <thead className="table-header">
      <tr>
        <th className="table-header-cell-left">Nom</th>
        <th className="table-header-cell-right">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr className="table-row">
        <td className="table-cell-left">Jean</td>
        <td className="table-cell-amount">1 250,00 €</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Formulaire

```jsx
<div>
  <label className="input-label">Nom</label>
  <input className="input-field" />
  <p className="input-hint">Texte d'aide</p>
</div>
```

### Badge

```jsx
<span className="badge-success">Actif</span>
```

### Bouton

```jsx
<button className="btn-primary">Enregistrer</button>
```

---

## 🔍 RECHERCHE RAPIDE

### Je veux...

**...un titre de page**
→ `text-h1 font-display`

**...un titre de section**
→ `text-h2 font-display`

**...un titre de card**
→ `text-h3 font-display`

**...du texte normal**
→ `text-body`

**...un label de formulaire**
→ `text-label`

**...un texte d'aide**
→ `text-caption`

**...un montant**
→ `amount tabular-nums`

**...un badge de succès**
→ `badge-success`

**...un bouton principal**
→ `btn-primary`

**...un champ de formulaire**
→ `input-field`

**...une card**
→ `card`

**...un tableau**
→ `table-container` + `table`

---

## 📋 CHECKLIST

Lors de la création d'un composant :

- [ ] Utiliser `font-display` pour les titres
- [ ] Utiliser `font-sans` (par défaut) pour le texte
- [ ] Respecter la hiérarchie H1 → H2 → H3 → H4
- [ ] Utiliser `text-body` pour le texte normal
- [ ] Utiliser `text-label` pour les labels
- [ ] Utiliser `tabular-nums` pour les montants
- [ ] Aligner les tableaux correctement
- [ ] Tester sur mobile

---

## 🎯 RÈGLES D'OR

1. **Titres** → `font-display`
2. **Texte** → `font-sans` (défaut)
3. **Tableaux** → Texte gauche, dates centre, montants droite
4. **Montants** → `tabular-nums`
5. **Badges** → Classes sémantiques
6. **Boutons** → Composant `<Button>`
7. **Inputs** → Composant `<Input>`
8. **Cards** → Composant `<Card>`

---

**Version** : 1.0.0
**Dernière mise à jour** : Mai 2026

---

💡 **Astuce** : Gardez ce fichier ouvert pendant le développement pour une référence rapide !
