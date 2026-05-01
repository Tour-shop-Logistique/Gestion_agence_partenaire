# Refactoring - Page Détails d'Expédition

## 📋 État Actuel

La page `ExpeditionDetails.jsx` présente les problèmes suivants :
- ❌ Typographie agressive : `font-black`, `font-bold` partout
- ❌ Tailles de texte incohérentes : `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`
- ❌ Tracking exagéré : `tracking-widest`, `tracking-[0.2em]`
- ❌ Tout en MAJUSCULES : `uppercase` sur presque tous les labels
- ❌ Composants custom au lieu du Design System
- ❌ Styles répétitifs et non maintenables
- ❌ Bordures arrondies exagérées : `rounded-2xl`, `rounded-3xl`

## ✅ Améliorations Recommandées

### 1. Typographie
- Remplacer `font-black` par `font-semibold` ou `font-bold`
- Remplacer `text-[8px]`, `text-[9px]`, `text-[10px]` par `text-xs`
- Remplacer `text-[11px]` par `text-sm`
- Supprimer `tracking-widest` et `tracking-[0.2em]`
- Supprimer `uppercase` sur les labels (garder casse normale)

### 2. Composants à Remplacer
- ✅ `StatusBadge` → Utiliser `<Badge>` du Design System
- ⏳ Sections de cartes → Utiliser `<Card>`, `<CardHeader>`, `<CardSection>`
- ⏳ Boutons custom → Utiliser `<Button>` avec variantes
- ⏳ Tableau → Utiliser composants `<Table>`

### 3. Espacement
- Remplacer `p-8` par `p-6`
- Standardiser les gaps : `gap-4`, `gap-6`
- Utiliser `space-y-6` pour les sections

### 4. Bordures
- Remplacer `rounded-2xl` et `rounded-3xl` par `rounded-xl`
- Utiliser `border-slate-200` de manière cohérente

## 🎯 Priorités

### Haute Priorité (Fait)
1. ✅ Import des composants du Design System
2. ✅ Refactoring du `StatusBadge`
3. ✅ Simplification du header
4. ✅ Amélioration du loading state

### Moyenne Priorité (À faire)
1. ⏳ Refactoring de la timeline avec `<Card>`
2. ⏳ Refactoring du tableau des colis avec `<Table>`
3. ⏳ Refactoring des sections de contact
4. ⏳ Refactoring de la section financière

### Basse Priorité
1. ⏳ Optimisation des modales
2. ⏳ Amélioration responsive

## 📝 Notes

- Le fichier fait plus de 730 lignes
- Refactoring complet nécessite une approche progressive
- La logique métier doit rester intacte
- Les composants du Design System sont déjà importés

## 🚀 Prochaines Étapes

1. Continuer le refactoring section par section
2. Tester chaque modification
3. Vérifier qu'aucune régression fonctionnelle
4. Documenter les changements

