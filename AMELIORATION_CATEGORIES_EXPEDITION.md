# Amélioration du filtrage des catégories dans CreateExpedition

## 📋 Contexte
L'affichage des catégories dans la création d'expédition était basé uniquement sur le **type d'expédition**, ce qui pouvait afficher des catégories non disponibles pour une ligne spécifique.

## ✨ Améliorations apportées

### 1. Filtrage intelligent des catégories
Les catégories sont maintenant filtrées en fonction de **deux critères** :
- **Type d'expédition** (SIMPLE, GROUPAGE_DHD_AERIEN, GROUPAGE_DHD_MARITIME, GROUPAGE_AFRIQUE, GROUPAGE_CA)
- **Ligne sélectionnée** (si applicable)

### 2. Logique de filtrage par type

#### Type SIMPLE
- Affiche **toutes les catégories** disponibles
- Pas de restriction de ligne

#### Types DHD (AERIEN ou MARITIME)
- Filtre les catégories selon le **type d'expédition**
- Si une **ligne est sélectionnée**, filtre également par cette ligne
- Format de ligne : "VilleA-VilleB" (ex: "Abidjan-Paris")

#### Type GROUPAGE_AFRIQUE
- Filtre les catégories selon le **type d'expédition**
- Si un **pays est sélectionné**, filtre également par ce pays

#### Type GROUPAGE_CA
- Filtre les catégories selon le **type d'expédition**
- Si une **ligne ET un pays sont sélectionnés**, filtre par ces deux critères

### 3. État de la route sélectionnée
Ajout d'un nouvel état `selectedRoute` qui :
- Se met à jour lors de la sélection d'un trajet
- Se réinitialise lors du changement de type d'expédition
- Permet le filtrage précis des catégories

### 4. Réinitialisation automatique des catégories
Lorsque la route change ou que le type d'expédition change :
- Les catégories sélectionnées dans les colis sont **automatiquement réinitialisées** si elles ne sont plus valides
- Évite les erreurs de catégories incompatibles

## 🔧 Modifications techniques

### Nouveau state
```javascript
const [selectedRoute, setSelectedRoute] = useState(null);
```

### Filtrage amélioré
```javascript
const filteredCategories = useMemo(() => {
    // ... logique de base par type
    
    // Si une ligne est sélectionnée, filtrer aussi par la ligne
    if (selectedRoute) {
        filteredTarifs = filteredTarifs.filter(tarif => {
            // Logique selon le type (DHD, AFRIQUE, CA)
        });
    }
    
    // ... retour des catégories filtrées
}, [categories, existingGroupageTarifs, formData.type_expedition, selectedRoute]);
```

### Mise à jour de handleRouteSelect
```javascript
const handleRouteSelect = (e) => {
    const routeId = e.target.value;
    if (!routeId) {
        setSelectedRoute(null); // Réinitialisation
        return;
    }
    
    const route = availableRoutes.find(r => String(r.id) === String(routeId));
    if (route) {
        setSelectedRoute(route); // Sauvegarde de la route
        // ... reste de la logique
    }
};
```

### Réinitialisation automatique
```javascript
useEffect(() => {
    if (selectedRoute !== null) {
        const validCategoryIds = filteredCategories.map(cat => String(cat.id));
        
        setFormData(prev => ({
            ...prev,
            colis: prev.colis.map(c => {
                if (c.category_id && !validCategoryIds.includes(String(c.category_id))) {
                    return { ...c, category_id: "" };
                }
                return c;
            })
        }));
    }
}, [selectedRoute, filteredCategories]);
```

## ✅ Avantages

1. **Précision accrue** : Les catégories affichées sont exactement celles disponibles pour la ligne/pays sélectionné
2. **Évite les erreurs** : Impossible de sélectionner une catégorie non tarifée pour un trajet
3. **Expérience utilisateur améliorée** : L'utilisateur voit uniquement les options pertinentes
4. **Sécurité** : Les catégories invalides sont automatiquement réinitialisées

## 🎯 Cas d'usage

### Exemple 1 : DHD Aérien
1. Sélection de "GROUPAGE_DHD_AERIEN"
2. Sélection du trajet "Abidjan-Paris"
3. → Les catégories affichées sont uniquement celles tarifées pour "Abidjan-Paris" en aérien

### Exemple 2 : Groupage Afrique
1. Sélection de "GROUPAGE_AFRIQUE"
2. Sélection du pays "Burkina Faso"
3. → Les catégories affichées sont uniquement celles tarifées pour le Burkina Faso

### Exemple 3 : Changement de ligne
1. Sélection du trajet "Abidjan-Paris" avec catégorie "Documents"
2. Changement vers "Abidjan-Lyon"
3. → Si "Documents" n'est pas disponible pour Lyon, la catégorie est réinitialisée automatiquement

## 📝 Notes
- Pour le type **SIMPLE**, toutes les catégories restent disponibles
- Le filtrage est **réactif** et se met à jour automatiquement
- Les dépendances des `useMemo` et `useEffect` sont correctement définies
