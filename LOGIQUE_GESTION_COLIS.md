# 📦 Logique de Gestion des Colis

Documentation de la logique de filtrage et de gestion des colis dans l'application.

---

## 🎯 Vue d'Ensemble

La page **Gestion des Colis** permet de gérer deux flux distincts :

1. **Réception des colis en agence** (expéditions acceptées)
2. **Envoi des colis vers l'entrepôt** (colis reçus à l'agence de départ)

---

## 📊 Deux Onglets, Deux Flux

### 🏢 Onglet "En agence"

**Objectif** : Réceptionner les colis des expéditions acceptées qui arrivent à l'agence

**Filtrage** :
```javascript
expedition_status === 'accepted' && !is_received
```

**Critères** :
- ✅ Statut de l'expédition = `accepted`
- ✅ Colis non encore réceptionné (`is_received = false`)

**Action disponible** :
- **Confirmer la réception** : Marque les colis comme reçus à l'agence

**Workflow** :
```
Expédition créée → Expédition acceptée → Colis arrivent → Réception en agence
```

---

### 🚚 Onglet "Envoi pour expédition"

**Objectif** : Envoyer les colis reçus à l'agence de départ vers l'entrepôt

**Filtrage** :
```javascript
expedition_status === 'recu_agence_depart' && !is_sent
```

**Critères** :
- ✅ Statut de l'expédition = `recu_agence_depart`
- ✅ Colis pas encore expédié vers l'entrepôt (`is_sent = false`)

**Note importante** : Le filtre se base principalement sur le **statut de l'expédition** plutôt que sur les flags individuels des colis. Si l'expédition a le statut `recu_agence_depart`, tous ses colis non envoyés sont affichés.

**Action disponible** :
- **Envoyer à l'entrepôt** : Marque les colis comme expédiés vers l'entrepôt

**Workflow** :
```
Réception en agence → Statut "reçu agence départ" → Envoi vers entrepôt
```

---

## 🔄 Cycle de Vie d'un Colis

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. CRÉATION                                                │
│     └─ Expédition créée avec colis                          │
│                                                             │
│  2. ACCEPTATION                                             │
│     └─ Expédition acceptée (statut: accepted)               │
│        └─ 🏢 ONGLET "EN AGENCE"                            │
│           └─ Colis visible pour réception                   │
│                                                             │
│  3. RÉCEPTION EN AGENCE                                     │
│     └─ Agent confirme la réception                          │
│        └─ is_received = true                                │
│        └─ Statut expédition → recu_agence_depart            │
│                                                             │
│  4. PRÉPARATION ENVOI                                       │
│     └─ 🚚 ONGLET "ENVOI POUR EXPÉDITION"                   │
│        └─ Colis visible pour envoi                          │
│                                                             │
│  5. ENVOI VERS ENTREPÔT                                     │
│     └─ Agent initie l'envoi                                 │
│        └─ is_sent = true                                    │
│        └─ Statut expédition → en_transit_entrepot           │
│                                                             │
│  6. SUITE DU PROCESSUS                                      │
│     └─ Transit → Arrivée → Livraison                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Statuts des Expéditions

### Statuts Concernés par la Gestion des Colis

| Statut | Description | Onglet Concerné |
|--------|-------------|-----------------|
| `accepted` | Expédition acceptée, colis en attente de réception | 🏢 En agence |
| `recu_agence_depart` | Colis reçus à l'agence de départ | 🚚 Envoi pour expédition |
| `en_transit_entrepot` | Colis envoyés vers l'entrepôt | Aucun (traité) |

### Autres Statuts (Non Concernés)

- `en_attente` : En attente de validation
- `refused` : Expédition refusée
- `en_cours_enlevement` : Enlèvement en cours
- `en_cours_depot` : Dépôt en cours
- etc.

---

## 🎯 Actions Disponibles

### Action 1 : Confirmer la Réception (Onglet "En agence")

**Déclencheur** : Sélection de colis + Clic sur "Confirmer la réception"

**Fonction** : `receiveColisDepart(selectedCodes)`

**Effet** :
- Marque les colis comme reçus (`is_received = true`)
- Change le statut de l'expédition vers `recu_agence_depart`
- Les colis disparaissent de l'onglet "En agence"
- Les colis apparaissent dans l'onglet "Envoi pour expédition"

---

### Action 2 : Envoyer à l'Entrepôt (Onglet "Envoi pour expédition")

**Déclencheur** : Sélection de colis + Clic sur "Envoyer à l'entrepôt"

**Fonction** : `sendColisToEntrepot(selectedCodes)`

**Effet** :
- Marque les colis comme expédiés (`is_sent = true`)
- Change le statut de l'expédition vers `en_transit_entrepot`
- Les colis disparaissent de l'onglet "Envoi pour expédition"

---

## 🔍 Filtrage et Recherche

### Recherche Locale

La recherche s'effectue sur les champs suivants :
- Code colis
- Désignation
- Référence expédition
- Catégorie
- Articles

### Filtrage par Onglet

Le filtrage est automatique selon l'onglet actif :
- **En agence** : `accepted` + non reçu
- **Envoi pour expédition** : `recu_agence_depart` + reçu + non envoyé

---

## 📊 Statistiques Affichées

### Compteur de Colis

Chaque onglet affiche le nombre de colis correspondant aux critères :
- Badge bleu pour "En agence"
- Badge violet pour "Envoi pour expédition"

### Sélection Multiple

- Compteur de colis sélectionnés
- Barre d'action flottante en bas de page
- Bouton d'action contextuel selon l'onglet

---

## 🎨 Interface Utilisateur

### Indicateurs Visuels

**Colis Traité** :
- Icône verte avec badge "Reçu" ou "Expédié"
- Non sélectionnable

**Colis Sélectionnable** :
- Checkbox active
- Clic sur la ligne pour sélectionner

**Bannière d'Information** :
- Bleue pour "En agence"
- Violette pour "Envoi pour expédition"
- Affiche le nombre de colis et la description

---

## 🔧 Fonctions Techniques

### `tabColis` (useMemo)

Filtre les colis selon l'onglet actif :

```javascript
const tabColis = useMemo(() => {
    if (activeTab === 'agence') {
        return allColis.filter(c => 
            c.expedition_status === 'accepted' && !c.is_received
        );
    } else {
        return allColis.filter(c => 
            c.expedition_status === 'recu_agence_depart' && 
            c.is_received_depart && 
            !c.is_sent
        );
    }
}, [allColis, activeTab]);
```

### `selectableColis` (useMemo)

Filtre les colis sélectionnables (non traités) :

```javascript
const selectableColis = useMemo(() =>
    filteredColis.filter(c => 
        activeTab === 'agence' ? !c.is_received : !c.is_sent
    ),
    [filteredColis, activeTab]
);
```

---

## ✅ Validation et Contrôles

### Contrôles de Sélection

- ✅ Seuls les colis non traités sont sélectionnables
- ✅ Checkbox "Tout sélectionner" ne sélectionne que les colis sélectionnables
- ✅ Les colis traités affichent un badge visuel

### Contrôles d'Action

- ✅ Bouton d'action désactivé si aucun colis sélectionné
- ✅ Bouton d'action désactivé pendant le traitement
- ✅ Animation de chargement pendant le traitement

---

## 🐛 Debugging

### Logs Console

Le système affiche des logs pour le debugging :

```javascript
console.log("📦 Tous les colis:", colis);
console.log("📊 Statistiques colis:", { ... });
console.log("🏢 Onglet 'En agence' - Expéditions acceptées:", { ... });
console.log("🚚 Onglet 'Envoi pour expédition' - Colis reçus:", { ... });
```

### Vérifications

Pour vérifier le bon fonctionnement :
1. Ouvrir la console du navigateur
2. Naviguer vers la page Colis
3. Vérifier les logs de filtrage
4. Comparer avec les données affichées

---

## 🚀 Améliorations Futures

### Possibles Évolutions

- [ ] Filtrage par date de réception
- [ ] Filtrage par agence (multi-agences)
- [ ] Export des listes de colis
- [ ] Impression d'étiquettes
- [ ] Scan de codes-barres
- [ ] Notifications de réception
- [ ] Historique des mouvements

---

## 📞 Support

Pour toute question sur la logique de gestion des colis :
1. Consulter ce document
2. Vérifier les logs console
3. Examiner le code dans `src/pages/Colis.jsx`

---

**Version** : 1.0.0
**Dernière mise à jour** : Mai 2026
