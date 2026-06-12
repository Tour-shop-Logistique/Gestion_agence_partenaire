# 🧪 Guide de Test du Build Production

## Objectif
Tester les corrections des erreurs DOM `insertBefore` avant le déploiement en production.

## Prérequis
- Node.js installé
- Application buildée avec `npm run build`

## Tests à Effectuer

### 1️⃣ Test du Build Local

```bash
# Construire l'application en mode production
npm run build

# Démarrer le serveur de preview
npm run preview
```

L'application devrait s'ouvrir sur `http://localhost:4173`

### 2️⃣ Test Navigation Basique

✅ **Checklist :**
- [ ] Page de connexion s'affiche correctement
- [ ] Connexion réussie redirige vers le dashboard
- [ ] Menu latéral fonctionne
- [ ] Toutes les pages sont accessibles

### 3️⃣ Test des Pages Critiques

#### Test Tarifs Groupage
1. Aller sur `/tarifs-groupage`
2. Vérifier que la liste des tarifs s'affiche
3. Cliquer sur **"Ajouter"** → Modal doit s'ouvrir
4. Fermer le modal → Pas d'erreur
5. Cliquer sur **"Modifier"** un tarif existant
6. Modifier des valeurs et sauvegarder
7. Vérifier que **aucune page blanche** n'apparaît
8. Basculer entre les onglets "Mes Groupages" / "Tarifs de Base"
9. Utiliser les filtres et la recherche

#### Test Profil Agence
1. Aller sur `/agency-profile`
2. Cliquer sur **"Modifier"**
3. Modifier plusieurs champs :
   - Nom de l'agence
   - Adresse
   - Téléphone
   - Pays (dropdown)
   - Horaires
4. Télécharger un nouveau logo
5. Cliquer sur **"Enregistrer les modifications"**
6. Vérifier que **aucune page blanche** n'apparaît
7. Rafraîchir la page (F5)
8. Vérifier que les données sont persistées

### 4️⃣ Test des Error Boundaries

#### Simulation d'Erreur (Dev Tools)
1. Ouvrir la console du navigateur
2. Aller sur une page avec liste (tarifs, expéditions)
3. Forcer un re-render rapide :
   ```javascript
   // Exécuter dans la console
   setInterval(() => {
     document.querySelectorAll('tr').forEach(el => el.classList.toggle('test'))
   }, 10)
   ```
4. Vérifier que l'Error Boundary se déclenche si nécessaire
5. Cliquer sur "Réessayer" ou "Recharger la page"

### 5️⃣ Test de Performance

```bash
# Analyser la taille des bundles
npm run build

# Vérifier les fichiers générés
ls -lh dist/assets/
```

✅ **Vérifications :**
- [ ] Fichiers avec hash unique (`[name].[hash].js`)
- [ ] Taille des bundles raisonnable (<500KB par chunk)
- [ ] Pas d'erreurs de build

### 6️⃣ Test Multi-Navigateurs

Tester sur :
- [ ] Chrome/Edge (Windows)
- [ ] Firefox
- [ ] Safari (si disponible)
- [ ] Mobile (Chrome Android / Safari iOS)

### 7️⃣ Test Cache & Rafraîchissement

1. Charger une page
2. Faire `Ctrl+Shift+R` (hard refresh)
3. Vérifier qu'il n'y a pas de page blanche
4. Vider le cache navigateur complètement
5. Recharger l'application
6. Vérifier que tout fonctionne

### 8️⃣ Test Console Erreurs

Pendant tous les tests, **surveiller la console** :

✅ **Acceptable :**
- Avertissements mineurs
- Messages informatifs

❌ **Inacceptable :**
- Erreurs `insertBefore`
- Erreurs `removeChild`
- Erreurs `Failed to execute`
- Erreurs de chunk loading non gérées

## Résultats Attendus

### ✅ Succès
- Aucune page blanche
- Toutes les modifications sauvegardent correctement
- Navigation fluide entre les pages
- Pas d'erreurs DOM dans la console
- Error Boundary fonctionne si nécessaire

### ❌ Échec
Si vous voyez :
- Pages blanches après modifications
- Erreurs `insertBefore` dans la console
- Application qui freeze
- Rechargements automatiques en boucle

→ **Ne pas déployer**, vérifier les corrections

## Commandes Utiles

```bash
# Build production
npm run build

# Preview local du build
npm run preview

# Nettoyer et rebuilder
rm -rf dist node_modules/.vite
npm run build

# Analyser les bundles (si configuré)
npm run build -- --analyze
```

## Debugging

### Erreur persiste en local

1. **Vider le cache Vite**
   ```bash
   rm -rf node_modules/.vite
   npm run build
   ```

2. **Vérifier les dépendances**
   ```bash
   npm install
   ```

3. **Mode verbose**
   ```bash
   npm run build -- --debug
   ```

4. **Tester en dev**
   ```bash
   npm run dev
   ```
   Si ça marche en dev mais pas en prod, c'est un problème de minification.

## Validation Finale

Avant de déployer, confirmer :

- [ ] Build réussit sans erreurs
- [ ] Preview local fonctionne parfaitement
- [ ] Tous les tests passent
- [ ] Aucune erreur dans la console
- [ ] Performance acceptable
- [ ] Testé sur plusieurs navigateurs

## Déploiement

Si tous les tests passent :

```bash
git add .
git commit -m "fix: correction erreurs DOM insertBefore en production"
git push origin main
```

Puis suivre les instructions de déploiement spécifiques à votre plateforme (Netlify, Vercel, etc.)
