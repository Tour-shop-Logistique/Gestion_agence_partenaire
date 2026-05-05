# 🧪 Guide de Test - Expeditions v2.0

## 🎯 Objectif
Tester toutes les nouvelles fonctionnalités intégrées dans la page Expeditions.

---

## 🚀 Démarrage

1. **Lancer l'application**
   ```bash
   npm start
   # ou
   yarn start
   ```

2. **Naviguer vers la page Expeditions**
   - Ouvrir le navigateur
   - Aller sur `/expeditions`

---

## ✅ Checklist de Test

### 1. 🎨 Vérification Visuelle

#### Header
- [ ] Le titre "Expéditions" est visible
- [ ] Les filtres de date sont présents
- [ ] **Le nouveau filtre "Statut" est visible** (bouton avec icône filtre)
- [ ] La barre de recherche est présente
- [ ] Les boutons Refresh et Export PDF sont présents

#### Filtres Actifs (Nouveau)
- [ ] La section "Filtres actifs" apparaît quand un filtre est appliqué
- [ ] Les tags sont colorés selon le type de filtre
- [ ] Le bouton "Tout effacer" est visible

#### Résumé (Nouveau)
- [ ] 4 cartes KPI sont visibles :
  - Total expéditions (indigo)
  - Montant total (vert)
  - Commission (violet)
  - Taux de commission (orange)
- [ ] La section "Répartition par statut" est visible
- [ ] Les statuts avec des expéditions sont affichés
- [ ] La barre de progression est visible

#### Tableau
- [ ] Les en-têtes "Référence", "Montant", "Commission", "Statut" ont des flèches de tri
- [ ] Le tableau affiche les expéditions

---

### 2. 🔍 Test du Filtre par Statut

#### Ouverture du Dropdown
1. Cliquer sur le bouton "Statut"
2. **Vérifier** :
   - [ ] Le dropdown s'ouvre
   - [ ] Tous les statuts sont listés avec icônes
   - [ ] Les compteurs sont affichés (ex: "En attente (5)")
   - [ ] Les boutons "Tout" et "Aucun" sont présents

#### Sélection de Statuts
1. Cocher "En attente"
2. **Vérifier** :
   - [ ] La case est cochée
   - [ ] Le fond devient coloré (amber)
   - [ ] Le compteur en bas indique "1 statut sélectionné"

3. Cocher "Acceptée"
4. **Vérifier** :
   - [ ] Les deux cases sont cochées
   - [ ] Le compteur indique "2 statuts sélectionnés"

5. Cliquer sur "Appliquer"
6. **Vérifier** :
   - [ ] Le dropdown se ferme
   - [ ] Le bouton "Statut" devient coloré (indigo)
   - [ ] Le bouton affiche "(2)"
   - [ ] Le tableau ne montre que les expéditions avec ces statuts

#### Boutons Rapides
1. Cliquer sur "Tout"
2. **Vérifier** :
   - [ ] Tous les statuts sont cochés

3. Cliquer sur "Aucun"
4. **Vérifier** :
   - [ ] Tous les statuts sont décochés

---

### 3. 🏷️ Test des Filtres Actifs

#### Affichage des Tags
1. Appliquer un filtre par statut
2. **Vérifier** :
   - [ ] Un tag apparaît avec le nom du statut
   - [ ] Le tag a la couleur du statut
   - [ ] Le tag a une icône "×"

3. Taper une recherche
4. **Vérifier** :
   - [ ] Un tag "Recherche" apparaît
   - [ ] Le tag affiche le texte recherché

5. Sélectionner un type (ex: "Simple")
6. **Vérifier** :
   - [ ] Un tag "Type: Simple" apparaît

#### Suppression des Tags
1. Cliquer sur le "×" d'un tag de statut
2. **Vérifier** :
   - [ ] Le tag disparaît
   - [ ] Le filtre est retiré
   - [ ] Le tableau se met à jour

3. Cliquer sur "Tout effacer"
4. **Vérifier** :
   - [ ] Tous les tags disparaissent
   - [ ] Tous les filtres sont réinitialisés
   - [ ] Le tableau affiche toutes les expéditions

---

### 4. 📊 Test du Résumé

#### Cartes KPI
1. **Vérifier les valeurs** :
   - [ ] Total expéditions = nombre d'expéditions affichées
   - [ ] Montant total = somme des montants
   - [ ] Commission = somme des commissions
   - [ ] Taux = (Commission / Montant) × 100

2. Appliquer un filtre
3. **Vérifier** :
   - [ ] Les KPI se mettent à jour
   - [ ] Les valeurs correspondent aux expéditions filtrées

#### Répartition par Statut
1. **Vérifier** :
   - [ ] Chaque statut avec des expéditions est affiché
   - [ ] Le nombre est correct
   - [ ] Le pourcentage est correct
   - [ ] Les couleurs correspondent aux statuts

2. Appliquer un filtre
3. **Vérifier** :
   - [ ] La répartition se met à jour
   - [ ] Seuls les statuts filtrés sont affichés

#### Barre de Progression
1. **Vérifier** :
   - [ ] La barre affiche le nombre de terminées / total
   - [ ] Le pourcentage est correct
   - [ ] La barre est verte

---

### 5. 🔄 Test du Tri

#### Tri par Référence
1. Cliquer sur "Référence"
2. **Vérifier** :
   - [ ] La flèche haut devient bleue
   - [ ] Les expéditions sont triées A-Z

3. Cliquer à nouveau sur "Référence"
4. **Vérifier** :
   - [ ] La flèche bas devient bleue
   - [ ] Les expéditions sont triées Z-A

#### Tri par Montant
1. Cliquer sur "Montant"
2. **Vérifier** :
   - [ ] Les expéditions sont triées du plus petit au plus grand

3. Cliquer à nouveau
4. **Vérifier** :
   - [ ] Les expéditions sont triées du plus grand au plus petit

#### Tri par Commission
1. Cliquer sur "Commission"
2. **Vérifier** :
   - [ ] Les expéditions sont triées par commission croissante

3. Cliquer à nouveau
4. **Vérifier** :
   - [ ] Les expéditions sont triées par commission décroissante

#### Tri par Statut
1. Cliquer sur "Statut"
2. **Vérifier** :
   - [ ] Les expéditions sont triées par statut A-Z

---

### 6. 🔗 Test de Combinaison

#### Filtres + Tri
1. Appliquer un filtre par statut (ex: "En attente")
2. Appliquer une recherche (ex: "Paris")
3. Sélectionner un type (ex: "Simple")
4. Cliquer sur tri par montant
5. **Vérifier** :
   - [ ] Tous les filtres sont appliqués
   - [ ] Le tri fonctionne sur les résultats filtrés
   - [ ] Les KPI correspondent aux résultats
   - [ ] Les tags sont tous affichés

#### Reset Complet
1. Avec plusieurs filtres actifs
2. Cliquer sur "Tout effacer"
3. **Vérifier** :
   - [ ] Tous les filtres sont retirés
   - [ ] Le tri est réinitialisé
   - [ ] Les dates sont réinitialisées au mois en cours
   - [ ] Le tableau affiche toutes les expéditions

---

### 7. 📱 Test Responsive

#### Mobile (< 768px)
1. Réduire la fenêtre ou utiliser les DevTools
2. **Vérifier** :
   - [ ] Les cartes KPI sont en 1 colonne
   - [ ] Le filtre par statut est en pleine largeur
   - [ ] Les filtres actifs sont en colonne
   - [ ] La répartition par statut est en 2 colonnes
   - [ ] Le tableau devient des cartes

#### Tablet (768px - 1024px)
1. Ajuster la largeur
2. **Vérifier** :
   - [ ] Les cartes KPI sont en 2 colonnes
   - [ ] La répartition par statut est en 3 colonnes

#### Desktop (> 1024px)
1. Pleine largeur
2. **Vérifier** :
   - [ ] Les cartes KPI sont en 4 colonnes
   - [ ] La répartition par statut est en 5 colonnes
   - [ ] Le tableau est visible

---

### 8. ⚡ Test de Performance

#### Temps de Chargement
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Performance"
3. Recharger la page
4. **Vérifier** :
   - [ ] Le temps de chargement est < 2s
   - [ ] Pas de lag visible

#### Filtrage
1. Appliquer un filtre
2. **Vérifier** :
   - [ ] Le filtrage est instantané (< 100ms)
   - [ ] Pas de freeze de l'interface

#### Tri
1. Cliquer sur un en-tête de tri
2. **Vérifier** :
   - [ ] Le tri est instantané
   - [ ] Pas de lag

---

### 9. 🐛 Test d'Erreurs

#### Aucune Expédition
1. Appliquer des filtres qui ne retournent aucun résultat
2. **Vérifier** :
   - [ ] Un message "Aucune expédition trouvée" s'affiche
   - [ ] Les KPI affichent 0
   - [ ] Pas d'erreur dans la console

#### Données Manquantes
1. Vérifier avec des expéditions sans commission
2. **Vérifier** :
   - [ ] La commission affiche 0
   - [ ] Pas d'erreur dans la console

---

## 🎨 Test Visuel Détaillé

### Couleurs
- [ ] Les couleurs sont cohérentes
- [ ] Les contrastes sont bons
- [ ] Les états hover sont visibles

### Animations
- [ ] Les transitions sont fluides
- [ ] Les hover effects fonctionnent
- [ ] Les animations ne sont pas trop rapides/lentes

### Typographie
- [ ] Les textes sont lisibles
- [ ] Les tailles sont cohérentes
- [ ] Les espacements sont corrects

---

## 📝 Rapport de Test

### Bugs Trouvés
```
1. [Description du bug]
   - Étapes pour reproduire
   - Comportement attendu
   - Comportement observé

2. [Description du bug]
   ...
```

### Améliorations Suggérées
```
1. [Suggestion]
   - Pourquoi
   - Comment

2. [Suggestion]
   ...
```

---

## ✅ Validation Finale

- [ ] Tous les tests sont passés
- [ ] Aucun bug bloquant
- [ ] Les performances sont bonnes
- [ ] Le responsive fonctionne
- [ ] L'UX est intuitive

---

## 🚀 Prochaines Étapes

Si tous les tests sont OK :
1. Merger le code
2. Déployer en production
3. Former les utilisateurs
4. Monitorer les retours

Si des bugs sont trouvés :
1. Créer des tickets
2. Prioriser les corrections
3. Corriger et re-tester

---

**Bon test ! 🎉**

**Temps estimé** : 15-20 minutes  
**Difficulté** : Facile  
**Importance** : Élevée
