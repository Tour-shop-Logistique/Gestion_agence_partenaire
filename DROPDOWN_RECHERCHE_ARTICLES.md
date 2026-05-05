# Dropdown avec Recherche pour les Articles

## 🎯 Objectif

Remplacer le `<select>` simple par un dropdown avec fonctionnalité de recherche pour faciliter la sélection des articles lors de la création d'une expédition.

---

## 🆕 Nouveau Composant : SearchableDropdown

### 📁 Emplacement
`src/components/common/SearchableDropdown.jsx`

### 🔧 Fonctionnalités

#### **1. Recherche en temps réel**
- Barre de recherche intégrée dans le dropdown
- Filtrage instantané des options
- Insensible à la casse

#### **2. Interface intuitive**
- Icône de recherche (loupe)
- Icône chevron qui tourne à l'ouverture
- Focus automatique sur l'input de recherche
- Fermeture automatique au clic extérieur

#### **3. Gestion des états**
- Affichage "Aucun résultat trouvé" si pas de correspondance
- Réinitialisation de la recherche à la fermeture
- Scroll automatique si beaucoup d'options

### 📝 Props du Composant

```javascript
<SearchableDropdown
    options={[]}           // Array [{id, label}]
    onSelect={function}    // Callback(option)
    placeholder="..."      // String
    className=""           // String (classes CSS)
/>
```

### 🎨 Design

#### **Bouton principal**
```
┌─────────────────────────────────┐
│ + Ajouter un article        ▼   │
└─────────────────────────────────┘
```

#### **Dropdown ouvert**
```
┌─────────────────────────────────┐
│ + Ajouter un article        ▲   │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 🔍 Rechercher...                │
├─────────────────────────────────┤
│ Vêtements                       │
│ Chaussures                      │
│ Électronique                    │
│ Livres                          │
│ ...                             │
└─────────────────────────────────┘
```

---

## 🔄 Intégration dans CreateExpedition

### **Avant (Select simple)**
```jsx
<select
    onChange={(e) => {
        if (e.target.value) {
            handleAddArticle(index, e.target.value);
            e.target.value = "";
        }
    }}
    className="..."
>
    <option value="">+ Ajouter un article</option>
    {products.map(p => (
        <option key={p.id} value={p.designation}>
            {p.designation}
        </option>
    ))}
</select>
```

### **Après (Dropdown avec recherche)**
```jsx
<SearchableDropdown
    options={products.map(p => ({
        id: p.id,
        label: p.designation
    }))}
    onSelect={(option) => handleAddArticle(index, option.label)}
    placeholder="+ Ajouter un article"
    className="mb-2"
/>
```

---

## 💡 Fonctionnement Technique

### **1. État du composant**
```javascript
const [isOpen, setIsOpen] = useState(false);      // Dropdown ouvert/fermé
const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche
```

### **2. Filtrage des options**
```javascript
const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### **3. Gestion du focus**
```javascript
useEffect(() => {
    if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus(); // Focus auto sur l'input
    }
}, [isOpen]);
```

### **4. Fermeture au clic extérieur**
```javascript
useEffect(() => {
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
            setSearchTerm('');
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### **5. Sélection d'une option**
```javascript
const handleSelect = (option) => {
    onSelect(option);      // Callback parent
    setIsOpen(false);      // Fermer le dropdown
    setSearchTerm('');     // Réinitialiser la recherche
};
```

---

## 🎨 Styles et Classes

### **Bouton principal**
- `border-slate-300` : Bordure grise
- `hover:border-slate-400` : Bordure plus foncée au survol
- `focus:ring-2 focus:ring-slate-500` : Anneau de focus

### **Dropdown**
- `absolute z-50` : Positionnement au-dessus des autres éléments
- `shadow-lg` : Ombre portée
- `max-h-64` : Hauteur maximale

### **Barre de recherche**
- `sticky top-0` : Reste en haut lors du scroll
- `bg-white` : Fond blanc pour masquer les options en dessous

### **Liste des options**
- `max-h-48 overflow-y-auto` : Scroll si trop d'options
- `hover:bg-slate-50` : Fond gris clair au survol

---

## 📊 Comparaison Avant/Après

| Aspect | Select Simple | Dropdown avec Recherche |
|--------|---------------|-------------------------|
| **Recherche** | ❌ Non | ✅ Oui (temps réel) |
| **Scroll** | Natif navigateur | Personnalisé |
| **Design** | Basique | Moderne et professionnel |
| **UX** | Standard | Optimisée |
| **Accessibilité** | Bonne | Excellente |
| **Longues listes** | Difficile | Facile avec recherche |

---

## ✨ Avantages

### **Pour l'utilisateur**
- ✅ **Recherche rapide** dans une longue liste d'articles
- ✅ **Pas besoin de scroller** pour trouver un article
- ✅ **Feedback visuel** clair (résultats filtrés)
- ✅ **Expérience fluide** avec focus automatique
- ✅ **Fermeture intuitive** (clic extérieur ou sélection)

### **Pour le développeur**
- ✅ **Composant réutilisable** pour d'autres dropdowns
- ✅ **Props simples** et claires
- ✅ **Code propre** et maintenable
- ✅ **Gestion des états** robuste
- ✅ **Pas de dépendance externe** (React pur)

---

## 🔄 Réutilisabilité

Ce composant peut être réutilisé partout où vous avez besoin d'un dropdown avec recherche :

### **Exemples d'utilisation**
```jsx
// Sélection de catégories
<SearchableDropdown
    options={categories.map(c => ({ id: c.id, label: c.nom }))}
    onSelect={(cat) => setSelectedCategory(cat)}
    placeholder="Sélectionner une catégorie"
/>

// Sélection de clients
<SearchableDropdown
    options={clients.map(c => ({ id: c.id, label: c.nom }))}
    onSelect={(client) => setSelectedClient(client)}
    placeholder="Rechercher un client"
/>

// Sélection de destinations
<SearchableDropdown
    options={destinations.map(d => ({ id: d.id, label: d.ville }))}
    onSelect={(dest) => setDestination(dest)}
    placeholder="Choisir une destination"
/>
```

---

## 🎯 Cas d'Usage dans CreateExpedition

### **Scénario 1 : Peu d'articles**
```
Utilisateur clique sur le dropdown
  ↓
Tous les articles sont visibles
  ↓
Sélection directe
```

### **Scénario 2 : Beaucoup d'articles**
```
Utilisateur clique sur le dropdown
  ↓
Liste longue avec scroll
  ↓
Utilisateur tape "vêt" dans la recherche
  ↓
Seuls les articles contenant "vêt" s'affichent
  ↓
Sélection rapide
```

### **Scénario 3 : Article non trouvé**
```
Utilisateur tape "xyz" dans la recherche
  ↓
Aucun résultat
  ↓
Message "Aucun résultat trouvé"
  ↓
Utilisateur efface et cherche autre chose
```

---

## 🚀 Améliorations Futures Possibles

### **1. Tri des résultats**
- Afficher les correspondances exactes en premier
- Trier par pertinence

### **2. Raccourcis clavier**
- Flèches haut/bas pour naviguer
- Enter pour sélectionner
- Escape pour fermer

### **3. Affichage enrichi**
- Icônes pour chaque type d'article
- Catégorie en sous-titre
- Nombre d'utilisations

### **4. Multi-sélection**
- Checkbox pour sélectionner plusieurs articles
- Bouton "Tout sélectionner"

---

## 📝 Notes Techniques

- Le composant utilise `useRef` pour gérer les références DOM
- `useEffect` pour les événements (clic extérieur, focus)
- `useState` pour l'état local (ouverture, recherche)
- Pas de dépendance externe (React pur + Heroicons)
- Compatible avec Tailwind CSS
- Accessible (focus, keyboard navigation possible)

---

## ✅ Résultat Final

Le dropdown avec recherche offre maintenant une **expérience utilisateur moderne et efficace** pour la sélection des articles lors de la création d'une expédition :

- Interface intuitive et professionnelle
- Recherche instantanée dans la liste
- Gestion fluide des interactions
- Design cohérent avec le reste de l'application
- Composant réutilisable pour d'autres besoins

🎉 **La sélection d'articles est maintenant rapide et agréable !**
