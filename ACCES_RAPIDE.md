# 🚀 Accès rapide - Outils de dépannage

## 🔧 Page de réinitialisation

Si vous rencontrez des problèmes (erreur 429, page blanche, cache bloqué), utilisez la page de reset :

### En développement (localhost)
```
http://localhost:5173/reset-app.html
```

### En production
```
https://votre-domaine.com/reset-app.html
```

## 📋 Commandes utiles

### Nettoyer et rebuilder
```bash
# Windows (CMD)
rmdir /s /q dist & npm run build

# Windows (PowerShell)
Remove-Item -Recurse -Force dist; npm run build

# Ou utiliser le script
npm run build:clean
```

### Redémarrer le serveur dev
```bash
# Arrêter : Ctrl+C
# Relancer :
npm run dev
```

### Vider le cache navigateur
**Méthode 1 : Rapide**
```
F12 > Clic droit sur Actualiser > Vider le cache et actualiser
```

**Méthode 2 : Console**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Méthode 3 : Complète**
```
Ctrl+Shift+Delete > Cocher "Images et fichiers en cache" > Vider
```

## 🔍 Debugging rapide

### Voir les logs de l'app
```
F12 > Console
```

Cherchez ces emoji :
- 🔄 = Chargement en cours
- 📞 = Appel API
- ✅ = Succès
- ⏭️ = Skip (déjà chargé)
- ❌ = Erreur

### Compter les appels API
```
F12 > Network > Filtrer par "demande"
```

Devrait voir : **1 appel** (max 2)

### Vérifier la version en cache
```javascript
// Dans la console
localStorage.getItem('app_version')
```

## 📞 Si rien ne fonctionne

### 1. Vérifier les modifications
```bash
git status
git diff src/hooks/useExpedition.js
git diff src/pages/Dashboard.jsx
git diff src/components/Header.jsx
git diff src/pages/Demandes.jsx
```

### 2. Forcer un rebuild complet
```bash
# Supprimer node_modules et reinstaller
rmdir /s /q node_modules
del package-lock.json
npm install
npm run build
```

### 3. Tester en navigation privée
```
Ctrl+Shift+N (Chrome)
Ctrl+Shift+P (Firefox)
```

### 4. Changer de navigateur
Tester sur un autre navigateur pour isoler le problème.

## 📚 Documentation complète

- `FIX_PAGE_BLANCHE_PRODUCTION.md` - Correction page blanche
- `FIX_BOUCLE_API_DEMANDES.md` - Correction boucle API
- `TEST_FIX_BOUCLE.md` - Guide de test
- `RESUME_CORRECTIONS.md` - Récapitulatif complet

## ⚡ Checklist rapide

Problème : **Erreur 429 (Too Many Requests)**
- [ ] Attendre 5-10 minutes
- [ ] Vider le cache navigateur
- [ ] Redémarrer le serveur dev
- [ ] Vérifier : 1 seul appel API dans Network

Problème : **Page blanche après "Modifier"**
- [ ] Vider le cache CDN (production)
- [ ] Forcer refresh : Ctrl+Shift+R
- [ ] Vérifier : pas d'erreur dans Console
- [ ] Rebuilder et redéployer si nécessaire

Problème : **Pays avec fautes d'orthographe**
- [ ] Aller sur /agency-profile
- [ ] Modifier > Champ Pays
- [ ] Vérifier : liste de pays s'affiche
- [ ] Sélectionner un pays et sauvegarder

## 💡 Astuce Pro

Ajoutez ces bookmarks dans votre navigateur :

1. **Reset App (Dev)**
   ```
   http://localhost:5173/reset-app.html
   ```

2. **Clear Cache (Console)**
   ```javascript
   javascript:(function(){localStorage.clear();sessionStorage.clear();location.reload();})()
   ```

3. **Count API Calls (Console)**
   ```javascript
   javascript:(function(){alert(performance.getEntriesByType('resource').filter(r=>r.name.includes('demande')).length+' appels API demandes');})()
   ```
