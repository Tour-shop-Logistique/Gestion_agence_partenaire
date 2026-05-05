# 🛠️ Commandes Utiles - ExpeditionDetails v3.0

## 📋 Commandes de Vérification

### Vérifier les fichiers créés
```bash
# Lister les composants
ls -la src/components/expedition/

# Lister la page
ls -la src/pages/ExpeditionDetails.jsx

# Lister la documentation
ls -la *EXPEDITION*.md
```

### Vérifier la compilation
```bash
# Build du projet
npm run build

# Ou avec yarn
yarn build

# Vérifier les erreurs TypeScript (si applicable)
npm run type-check
```

### Vérifier les imports
```bash
# Rechercher les imports de expedition
grep -r "from '../components/expedition'" src/

# Ou avec ripgrep (plus rapide)
rg "from '../components/expedition'" src/
```

---

## 🧪 Commandes de Test

### Lancer les tests
```bash
# Tous les tests
npm test

# Tests en mode watch
npm test -- --watch

# Tests avec coverage
npm test -- --coverage

# Tests d'un fichier spécifique
npm test ExpeditionDetails
```

### Linter
```bash
# ESLint
npm run lint

# ESLint avec fix automatique
npm run lint -- --fix

# Prettier
npm run format
```

---

## 🚀 Commandes de Développement

### Démarrer le serveur de dev
```bash
# Avec npm
npm run dev

# Avec yarn
yarn dev

# Avec port spécifique
npm run dev -- --port 3001
```

### Build pour production
```bash
# Build optimisé
npm run build

# Preview du build
npm run preview

# Analyser le bundle
npm run build -- --analyze
```

---

## 📦 Commandes Git

### Commit des changements
```bash
# Ajouter les fichiers
git add src/components/expedition/
git add src/pages/ExpeditionDetails.jsx
git add *EXPEDITION*.md

# Commit
git commit -m "feat: refonte complète ExpeditionDetails v3.0

- Ajout de 7 nouveaux composants modulaires
- Refactorisation de la page ExpeditionDetails
- Amélioration de la lisibilité (< 3s)
- Ajout d'une barre d'actions rapides
- Amélioration du flux logistique visuel
- Documentation complète

BREAKING CHANGE: Aucun (rétrocompatible)"

# Push
git push origin feature/expedition-details-v3
```

### Créer une branche
```bash
# Créer et basculer sur une nouvelle branche
git checkout -b feature/expedition-details-v3

# Ou avec git switch (Git 2.23+)
git switch -c feature/expedition-details-v3
```

### Créer une Pull Request
```bash
# Avec GitHub CLI
gh pr create --title "feat: Refonte ExpeditionDetails v3.0" \
  --body "$(cat RECAP_REFONTE_EXPEDITION.md)" \
  --base main

# Ou manuellement sur GitHub
# https://github.com/votre-org/votre-repo/compare
```

---

## 🔍 Commandes de Diagnostic

### Vérifier les erreurs
```bash
# Erreurs TypeScript
npx tsc --noEmit

# Erreurs ESLint
npm run lint

# Erreurs de build
npm run build 2>&1 | grep -i error
```

### Analyser les performances
```bash
# Analyser le bundle
npm run build -- --analyze

# Lighthouse (si applicable)
npm run lighthouse

# Bundle analyzer
npx webpack-bundle-analyzer dist/stats.json
```

### Vérifier les dépendances
```bash
# Dépendances obsolètes
npm outdated

# Vulnérabilités
npm audit

# Fix automatique
npm audit fix
```

---

## 📊 Commandes de Statistiques

### Compter les lignes de code
```bash
# Tous les composants
find src/components/expedition -name "*.jsx" -exec wc -l {} + | tail -1

# Page ExpeditionDetails
wc -l src/pages/ExpeditionDetails.jsx

# Documentation
wc -l *EXPEDITION*.md | tail -1
```

### Taille des fichiers
```bash
# Taille des composants
du -sh src/components/expedition/

# Taille du build
du -sh dist/

# Détail par fichier
ls -lh src/components/expedition/
```

---

## 🧹 Commandes de Nettoyage

### Nettoyer le cache
```bash
# Cache npm
npm cache clean --force

# Node modules
rm -rf node_modules
npm install

# Build
rm -rf dist
npm run build
```

### Nettoyer les fichiers temporaires
```bash
# Fichiers de log
rm -f *.log

# Fichiers de cache
rm -rf .cache

# Coverage
rm -rf coverage
```

---

## 📝 Commandes de Documentation

### Générer la documentation
```bash
# JSDoc (si configuré)
npm run docs

# TypeDoc (si TypeScript)
npx typedoc src/

# Storybook (si configuré)
npm run storybook
```

### Lire la documentation
```bash
# Avec cat
cat REFONTE_EXPEDITION_DETAILS.md

# Avec less (pagination)
less REFONTE_EXPEDITION_DETAILS.md

# Avec bat (coloré, si installé)
bat REFONTE_EXPEDITION_DETAILS.md

# Ouvrir dans l'éditeur
code REFONTE_EXPEDITION_DETAILS.md
```

---

## 🔄 Commandes de Mise à Jour

### Mettre à jour les dépendances
```bash
# Mise à jour mineure
npm update

# Mise à jour majeure (attention!)
npx npm-check-updates -u
npm install

# Mise à jour interactive
npx npm-check-updates -i
```

### Mettre à jour le projet
```bash
# Pull les derniers changements
git pull origin main

# Installer les nouvelles dépendances
npm install

# Rebuild
npm run build
```

---

## 🐛 Commandes de Debug

### Debug React
```bash
# Avec React DevTools
# Installer l'extension Chrome/Firefox

# Debug mode
REACT_APP_DEBUG=true npm run dev

# Verbose logging
DEBUG=* npm run dev
```

### Debug Build
```bash
# Build avec source maps
npm run build -- --sourcemap

# Build en mode debug
NODE_ENV=development npm run build

# Analyser les erreurs
npm run build 2>&1 | tee build.log
```

---

## 📱 Commandes de Test Responsive

### Tester sur différents devices
```bash
# Avec Chrome DevTools
# F12 > Toggle device toolbar (Ctrl+Shift+M)

# Avec Playwright (si configuré)
npx playwright test --project=mobile

# Avec Cypress (si configuré)
npx cypress open --config viewportWidth=375,viewportHeight=667
```

---

## 🚢 Commandes de Déploiement

### Déployer sur staging
```bash
# Build
npm run build

# Deploy (exemple avec Vercel)
vercel --prod=false

# Ou avec Netlify
netlify deploy --dir=dist

# Ou avec custom script
npm run deploy:staging
```

### Déployer sur production
```bash
# Build production
NODE_ENV=production npm run build

# Deploy (exemple avec Vercel)
vercel --prod

# Ou avec Netlify
netlify deploy --prod --dir=dist

# Ou avec custom script
npm run deploy:production
```

---

## 📊 Commandes de Monitoring

### Vérifier les performances
```bash
# Lighthouse
npx lighthouse https://votre-site.com --view

# WebPageTest
# https://www.webpagetest.org/

# Bundle size
npm run build
ls -lh dist/assets/*.js
```

### Vérifier l'accessibilité
```bash
# axe-core
npm run test:a11y

# Pa11y
npx pa11y https://votre-site.com

# Lighthouse accessibility
npx lighthouse https://votre-site.com --only-categories=accessibility
```

---

## 🔧 Commandes Utilitaires

### Rechercher dans le code
```bash
# Rechercher un texte
grep -r "OperationalSummary" src/

# Rechercher avec ripgrep (plus rapide)
rg "OperationalSummary" src/

# Rechercher et remplacer
find src/ -type f -name "*.jsx" -exec sed -i 's/oldText/newText/g' {} +
```

### Comparer les fichiers
```bash
# Diff entre deux fichiers
diff file1.jsx file2.jsx

# Diff coloré
git diff --no-index file1.jsx file2.jsx

# Avec vimdiff
vimdiff file1.jsx file2.jsx
```

---

## 📦 Commandes Package.json

### Scripts personnalisés
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "analyze": "vite-bundle-visualizer"
  }
}
```

---

## 🎯 Commandes Rapides

### Workflow complet
```bash
# 1. Vérifier le code
npm run lint && npm run type-check

# 2. Lancer les tests
npm test

# 3. Build
npm run build

# 4. Preview
npm run preview

# 5. Commit
git add .
git commit -m "feat: votre message"
git push

# 6. Deploy
npm run deploy
```

### One-liner pour tout vérifier
```bash
npm run lint && npm run type-check && npm test && npm run build && echo "✅ Tout est OK!"
```

---

## 📚 Ressources

### Documentation
- [React](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)
- [Vitest](https://vitest.dev)

### Outils
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**Dernière mise à jour:** 2026-05-04  
**Version:** 3.0.0
