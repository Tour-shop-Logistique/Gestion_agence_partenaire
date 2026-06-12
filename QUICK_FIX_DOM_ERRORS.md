# ⚡ Quick Fix - Erreurs DOM Production

## 🔴 Problème
Page blanche lors de modifications dans Tarifs et Agence avec erreur :
```
NotFoundError: Failed to execute 'insertBefore' on 'Node'
```

## ✅ Solution Rapide

### 1. Test Local (OBLIGATOIRE)
```bash
npm run build
npm run preview
# Tester sur http://localhost:4173
```

### 2. Déployer
```bash
git add .
git commit -m "fix: correction erreurs DOM insertBefore"
git push
```

### 3. Post-Déploiement
- Vider cache CDN (Netlify/Vercel)
- Tester en navigation privée
- Vider cache navigateur si besoin : `Ctrl+Shift+Delete`

## 🔧 Fichiers Modifiés
- `src/App.jsx` - Gestion erreurs DOM
- `src/components/tarifGroupage.jsx` - Clés React fixes
- `src/pages/TarifsGroupes.jsx` + `AgencyProfile.jsx` - ErrorBoundary
- `vite.config.js` - Build optimisé
- `src/components/ErrorBoundary.jsx` (nouveau)

## ✓ Tests Essentiels
1. Tarifs Groupage > Modifier > Sauvegarder ✓
2. Profil Agence > Modifier > Sauvegarder ✓
3. Console sans erreurs ✓
4. Refresh (Ctrl+F5) fonctionne ✓

## 🆘 Si Ça Ne Marche Pas
1. Vider cache CDN
2. Utilisateurs : vider cache navigateur
3. Forcer nouveau build : 
   ```bash
   rm -rf dist node_modules/.vite
   npm run build
   ```

## 📚 Documentation Complète
Voir : `FIX_ERREUR_DOM_INSERTBEFORE_PRODUCTION.md`
