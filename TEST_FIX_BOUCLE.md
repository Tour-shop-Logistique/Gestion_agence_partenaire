# 🧪 Guide de test - Correction boucle API Demandes

## ⚠️ Situation actuelle
Vous avez l'erreur **429 Too Many Requests** parce que le backend a détecté trop d'appels répétés et a bloqué temporairement votre IP/session.

## ✅ Les corrections sont appliquées !

Tous les fichiers ont été corrigés :
- ✅ `useExpedition.js` - Détection correcte du chargement
- ✅ `Dashboard.jsx` - Protection avec useRef
- ✅ `Header.jsx` - Protection avec useRef + cleanup
- ✅ `Demandes.jsx` - Protection avec useRef

## 🚀 Étapes pour tester

### 1. Attendre que le rate limiting expire
Le backend bloque temporairement après trop de requêtes. Attendez **5-10 minutes** ou :
- Redémarrez le serveur backend (si vous en avez le contrôle)
- Changez de réseau (4G/WiFi)
- Utilisez un navigateur en navigation privée

### 2. Effacer le cache du navigateur
Dans votre navigateur (Chrome/Edge/Firefox) :
```
1. Appuyez sur F12 (ouvrir DevTools)
2. Clic droit sur le bouton Actualiser
3. Sélectionnez "Vider le cache et actualiser de force"
```

Ou :
```
1. Ctrl + Shift + Delete
2. Cocher "Images et fichiers en cache"
3. Vider
```

### 3. Redémarrer le serveur de développement
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

### 4. Ouvrir la console et observer
```
1. F12 pour ouvrir DevTools
2. Onglet Console
3. Actualiser la page (F5)
```

### ✅ Logs attendus (CORRECT)
```
🔄 Dashboard: Début du chargement initial
📞 Header: Chargement des demandes pour le compteur  
📞 Appel API fetchDemandesClients avec params: {page: 1}
✅ Dashboard: Données chargées
```

**Vous devriez voir UN SEUL appel à `/expedition/agence/list?is_demande_client=true`**

### ❌ Logs à NE PAS voir (INCORRECT)
```
📞 Appel API fetchDemandesClients... (répété 100 fois)
📞 Appel API fetchDemandesClients... (répété 100 fois)
📞 Appel API fetchDemandesClients... (répété 100 fois)
Error 429: Too Many Requests
```

### 5. Vérifier dans l'onglet Network
```
1. F12 > Onglet Network
2. Filtrer par "demande" ou "expedition"
3. Actualiser la page
4. Compter les requêtes
```

**Résultat attendu** : 1 seule requête vers `/expedition/agence/list?is_demande_client=true`

### 6. Naviguer dans l'application
```
1. Aller au Dashboard
2. Aller à une autre page (ex: Expéditions)
3. Revenir au Dashboard
```

**Log attendu dans la console** :
```
⏭️ Dashboard: Données déjà chargées, skip
```

Aucun nouvel appel API ne devrait être fait !

## 🔧 Si le problème persiste après 10 minutes

### Option A : Vider le localStorage
Dans la console DevTools :
```javascript
localStorage.clear();
location.reload();
```

### Option B : Forcer un nouveau build
```bash
npm run build:clean
npm run dev
```

### Option C : Vérifier qu'aucun autre composant n'appelle loadDemandes
Cherchez dans le code :
```bash
# Dans le terminal
grep -r "loadDemandes" src/
```

Tous les appels devraient avoir une protection ou être intentionnels.

## 📊 Métriques de succès

| Métrique | Avant | Après |
|----------|-------|-------|
| Appels API au démarrage | 100+ | 1 |
| Temps de chargement | 5-10s | <1s |
| Erreurs 429 | Oui | Non |
| Console saturée | Oui | Non |

## 🎯 Checklist finale

- [ ] Attendre 5-10 minutes (rate limiting)
- [ ] Vider le cache navigateur
- [ ] Redémarrer le serveur dev
- [ ] Ouvrir la console (F12)
- [ ] Actualiser la page (F5)
- [ ] Vérifier : 1 seul appel API demandes
- [ ] Vérifier : Pas d'erreur 429
- [ ] Naviguer dans l'app : logs "skip" visibles
- [ ] Tester sur plusieurs pages

## 💡 Astuces de debugging

### Activer les logs détaillés
Les logs avec emoji sont déjà en place :
- 🔄 = Chargement en cours
- 📞 = Appel API
- ✅ = Succès
- ⏭️ = Skip (déjà chargé)
- ❌ = Erreur

### Compter les appels API
Dans la console :
```javascript
// Compter tous les appels demandes
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('is_demande_client'))
  .length
```

Résultat attendu : **1** (ou 2 max)

### Surveiller les re-renders
Installer React DevTools Profiler et surveiller les composants :
- Dashboard
- Header
- Demandes

Ils ne devraient pas re-render en boucle.

## 📞 Support

Si après toutes ces étapes le problème persiste :
1. Copier les logs de la console
2. Copier les requêtes de l'onglet Network
3. Vérifier les modifications dans les 4 fichiers
4. Partager ces informations

## ✨ Résultat final attendu

✅ Application rapide et fluide  
✅ 1 seul appel API au démarrage  
✅ Navigation sans rechargements inutiles  
✅ Pas d'erreur 429  
✅ Console propre avec logs informatifs  
✅ Backend soulagé  
