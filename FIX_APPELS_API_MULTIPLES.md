# 🔧 Fix : Appels API multiples - Demandes

## 🐛 Problème identifié

L'API de demandes était appelée de manière excessive, causant :
- Nombreuses requêtes répétées dans les logs
- Performances dégradées
- Charge serveur inutile

## 🔍 Cause racine

**Boucles infinies de useEffect causées par des dépendances instables dans les hooks personnalisés**

Les fonctions retournées par `useExpedition` et `useAgency` étaient recréées à chaque rendu car leurs `useCallback` avaient trop de dépendances (notamment les données elles-mêmes : `demandes`, `expeditions`, `users`, etc.).

### Exemple du problème :
```javascript
// ❌ AVANT (problématique)
const loadDemandes = useCallback(() => {
  // ...
}, [dispatch, demandes, demandesMeta, lastDemandesFilters, status]);
// demandes et demandesMeta changent → fonction recréée → useEffect déclenché → nouveau chargement → demandes changent → ...
```

## ✅ Solutions appliquées

### 1. **Nettoyage des dépendances dans `useExpedition.js`**

Suppression des dépendances qui causent des re-renders inutiles :

- `loadExpeditions` : retiré `expeditions.length`
- `loadColis` : retiré `colis`, `colisMeta`
- `loadDemandes` : retiré `demandes`, `demandesMeta`
- `loadReception` : retiré `reception`, `receptionMeta`
- `loadProducts` : retiré `products`
- `loadCategories` : retiré `categories`
- `getExpeditionDetails` : retiré `expeditions`, `demandes`

Les fonctions gardent uniquement :
- `dispatch` (stable)
- Les filtres de cache (`lastFilters`, `lastDemandesFilters`, etc.)
- Le `status` (nécessaire pour éviter les doubles appels)

### 2. **Nettoyage des dépendances dans `useAgency.js`**

- `fetchAgencyData` : retiré `agencyData`
- `fetchAgencyUsers` : retiré `users`

### 3. **Correction des useEffect dans `Demandes.jsx`**

```javascript
// ✅ APRÈS (corrigé)
useEffect(() => {
    loadDemandes({ page: currentPage });
}, [currentPage]); // Seulement currentPage

useEffect(() => {
    fetchAgencyData();
    loadExpeditions({ page: 1 });
}, []); // Exécution unique au montage
```

## 📊 Bénéfices

1. **Performance améliorée** : Un seul appel API au lieu de multiples appels en boucle
2. **Charge serveur réduite** : Moins de requêtes redondantes
3. **Expérience utilisateur** : Interface plus réactive
4. **Logs plus propres** : Facilite le débogage

## 🎯 Principe appliqué

**"Les fonctions de hooks ne doivent dépendre que de valeurs stables ou de références nécessaires pour la logique de cache"**

Les données (`demandes`, `expeditions`, etc.) ne doivent PAS être dans les dépendances des `useCallback` car :
- Elles changent à chaque mise à jour
- Elles sont déjà disponibles via Redux/state
- Elles causent des re-renders en cascade

## ⚠️ Points d'attention

- Les `useEffect` avec tableau de dépendances vide `[]` ne s'exécutent qu'au montage
- Pour forcer un refresh, utiliser la fonction avec `forceRefresh: true`
- Le cache via `lastFilters` et `status === 'succeeded'` évite les appels redondants

---

**Date de correction** : Juin 2026  
**Fichiers modifiés** :
- `src/hooks/useExpedition.js`
- `src/hooks/useAgency.js`
- `src/pages/Demandes.jsx`
