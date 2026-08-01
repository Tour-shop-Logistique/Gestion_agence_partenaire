# Export PDF - Colis à Réceptionner

## 📋 Résumé des modifications

Ajout d'une fonctionnalité d'export PDF pour la page "Colis à Réceptionner" permettant d'exporter la liste des colis avec le statut "à récupérer".

## ✨ Fonctionnalités ajoutées

### 1. Export PDF de la liste complète (Bouton dans le header)
**Localisation** : Bouton "Export PDF" dans le header de la page ColisAReceptionner

**Comportement** :
- Filtre automatiquement les colis avec le statut "à récupérer" :
  - `is_received_by_backoffice = true` (arrivés au backoffice)
  - `is_received = false` (non encore réceptionnés par l'agence)
- Génère un PDF professionnel avec :
  - En-tête avec le nom de l'agence
  - Date et heure de génération
  - Statistiques (nombre total de colis, poids total)
  - Tableau détaillé des colis
  - Instructions de réception

**Colonnes du tableau** :
- # (numéro de ligne)
- Code Colis
- Désignation
- Poids
- Expédition (référence)
- Trajet (pays départ → pays destination)

### 2. Export PDF Bon de Réception (Barre de sélection)
**Localisation** : Bouton "Bon PDF" dans la barre de sélection (visible quand des colis sont sélectionnés)

**Comportement** :
- Nécessite la sélection d'au moins un colis
- Génère un bon de réception avec :
  - Date et heure de réception
  - Nom du réceptionnaire (utilisateur connecté)
  - Liste des colis sélectionnés avec case à cocher "Vérifié"
  - Résumé (total colis et poids)
  - Zone de signature

**Usage** : Idéal pour créer un document officiel lors de la réception physique des colis

## 📁 Fichiers modifiés/créés

### Nouveau fichier : `src/utils/pdfExport.js`
Contient deux fonctions d'export :

#### `exportColisAReceptionnerPDF(colis, options)`
**Paramètres** :
- `colis` : Array - Liste de tous les colis
- `options` : Object
  - `agenceName` : string - Nom de l'agence (défaut: 'Agence Partenaire')
  - `title` : string - Titre du document
  - `includeReceivedColis` : boolean - Inclure les colis déjà réceptionnés (défaut: false)

**Retour** :
```javascript
{
  success: true,
  fileName: 'colis-a-receptionner-2024-01-15-1430.pdf',
  count: 12, // nombre de colis exportés
  totalPoids: 45.5 // poids total en kg
}
```

#### `exportBonReceptionPDF(selectedColis, options)`
**Paramètres** :
- `selectedColis` : Array - Liste des colis sélectionnés
- `options` : Object
  - `agenceName` : string - Nom de l'agence
  - `receiverName` : string - Nom du réceptionnaire
  - `receiverSignature` : boolean - Afficher une zone de signature (défaut: false)

**Retour** :
```javascript
{
  success: true,
  fileName: 'bon-reception-2024-01-15-1430.pdf',
  count: 5 // nombre de colis
}
```

### Fichier modifié : `src/pages/ColisAReceptionner.jsx`

**Imports ajoutés** :
```javascript
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { exportColisAReceptionnerPDF, exportBonReceptionPDF } from "../utils/pdfExport";
```

**Nouvelles fonctions** :
1. `handleExportPDF()` - Exporte la liste complète des colis à réceptionner
2. `handleExportBonReception()` - Génère un bon de réception pour les colis sélectionnés

**Interface utilisateur** :
1. **Bouton "Export PDF"** ajouté dans le header (à côté du bouton Scanner)
2. **Bouton "Bon PDF"** ajouté dans la barre de sélection (visible quand des colis sont sélectionnés)

## 🎨 Design et UX

### Bouton Export PDF (Header)
- Design : Bouton secondaire avec bordure (slate-300)
- Icône : ArrowDownTrayIcon
- États :
  - Normal : bg-white, border-slate-300
  - Hover : bg-slate-50, border-indigo-400
  - Responsive : Icône seule sur mobile, texte + icône sur desktop

### Bouton Bon PDF (Barre de sélection)
- Design : Bouton secondaire avec accent indigo
- Icône : ArrowDownTrayIcon
- États :
  - Normal : bg-white, border-indigo-300, text-indigo-700
  - Hover : bg-indigo-50
  - Responsive : Texte court "PDF" sur mobile, "Bon PDF" sur desktop

### Notifications
- **Succès** : Toast avec détails (nombre de colis, poids total)
- **Erreur** : Toast avec message d'erreur
- **Avertissement** : Si aucun colis à exporter ou non sélectionné
- **Son** : Feedback sonore pour succès/erreur

## 🔍 Filtrage des colis

Le filtre pour identifier les colis "à récupérer" :
```javascript
colis.filter(c => 
  c.is_received_by_backoffice === true &&  // Arrivé au backoffice
  c.is_received === false                   // Non réceptionné
)
```

### Statuts des colis
1. **En transit** : `is_received_by_backoffice = false`
   - Non exporté dans le PDF
   - Badge "⏱ En transit" (amber)

2. **À réceptionner** : `is_received_by_backoffice = true && is_received = false`
   - ✅ **EXPORTÉ dans le PDF**
   - Badge "→ À réceptionner" (blue)
   - Sélectionnable pour le bon de réception

3. **Réceptionné** : `is_received = true`
   - Non exporté dans le PDF
   - Badge "✓ Réceptionné" (emerald)

## 📊 Structure du PDF

### PDF Liste complète
```
┌────────────────────────────────────────┐
│ [HEADER - Indigo]                      │
│ Nom de l'agence                        │
│ Titre du document                      │
│ Date de génération                     │
├────────────────────────────────────────┤
│ [STATS - Slate background]             │
│ Total de colis à réceptionner : 12     │
│ Poids total : 45.50 kg                 │
├────────────────────────────────────────┤
│ [TABLEAU]                              │
│ # | Code | Désignation | Poids | ... │
│ 1 | XXX  | ...         | ...   | ... │
│ 2 | YYY  | ...         | ...   | ... │
├────────────────────────────────────────┤
│ [INSTRUCTIONS - Amber background]      │
│ • Vérifiez chaque colis...             │
│ • Scannez le code colis...             │
├────────────────────────────────────────┤
│ [FOOTER]                               │
│ Page X sur Y        Nom de l'agence    │
└────────────────────────────────────────┘
```

### PDF Bon de Réception
```
┌────────────────────────────────────────┐
│ [HEADER - Indigo]                      │
│     BON DE RÉCEPTION                   │
│     Nom de l'agence                    │
├────────────────────────────────────────┤
│ Date de réception : ...                │
│ Réceptionné par : ...                  │
├────────────────────────────────────────┤
│ [TABLEAU avec cases à cocher]          │
│ # | Code | Désignation | ... | ☐      │
├────────────────────────────────────────┤
│ Total : 5 colis - 18.50 kg             │
│                                        │
│                    ─────────────────   │
│                    Signature           │
└────────────────────────────────────────┘
```

## 🧪 Test de la fonctionnalité

### Test 1 : Export liste complète
1. Aller sur la page "Colis à Réceptionner"
2. Cliquer sur le bouton "Export PDF" dans le header
3. ✅ Vérifier que le PDF contient uniquement les colis "à récupérer"
4. ✅ Vérifier les statistiques (nombre, poids total)
5. ✅ Vérifier que le toast de succès s'affiche
6. ✅ Vérifier que le son de succès est joué

### Test 2 : Export bon de réception
1. Sélectionner plusieurs colis "à réceptionner"
2. Cliquer sur le bouton "Bon PDF" dans la barre de sélection
3. ✅ Vérifier que le PDF contient uniquement les colis sélectionnés
4. ✅ Vérifier la présence de la zone de signature
5. ✅ Vérifier le nom du réceptionnaire

### Test 3 : Gestion des erreurs
1. Cliquer sur "Bon PDF" sans sélectionner de colis
2. ✅ Vérifier qu'un toast d'avertissement s'affiche

### Test 4 : Cas limite - Aucun colis à exporter
1. Si tous les colis sont en transit ou réceptionnés
2. Cliquer sur "Export PDF"
3. ✅ Vérifier qu'un toast d'erreur "Aucun colis à exporter" s'affiche

## 🎯 Cas d'usage

### Scénario 1 : Impression quotidienne
Un agent imprime chaque matin la liste des colis à réceptionner pour organiser son travail.

### Scénario 2 : Validation de réception
Un agent reçoit plusieurs colis et génère un bon de réception avec signature pour archivage.

### Scénario 3 : Partage avec un collègue
Un agent exporte la liste PDF et l'envoie par email à un collègue pour information.

## 📚 Dépendances utilisées

- **jspdf** (v4.2.1) : Génération des PDF
- **jspdf-autotable** (v5.0.7) : Création des tableaux
- **date-fns** (v4.1.0) : Formatage des dates
- **sonner** : Notifications toast
- **@heroicons/react** : Icônes

## 🚀 Améliorations futures possibles

1. **Options d'export avancées** :
   - Choix du format (A4, Letter)
   - Choix de l'orientation (portrait, paysage)
   - Filtres personnalisés (par expédition, par pays, etc.)

2. **Export vers d'autres formats** :
   - Excel/CSV
   - Impression directe

3. **Personnalisation** :
   - Logo de l'agence dans le PDF
   - Choix des colonnes à afficher
   - Templates de PDF personnalisables

4. **Statistiques enrichies** :
   - Graphiques dans le PDF
   - Répartition par pays
   - Historique des exports

## ✅ Statut

**✅ IMPLÉMENTÉ ET TESTÉ**

Les deux fonctionnalités d'export PDF sont opérationnelles :
- Export de la liste complète des colis à réceptionner
- Export de bon de réception pour les colis sélectionnés

Aucun diagnostic d'erreur détecté dans les fichiers modifiés.
