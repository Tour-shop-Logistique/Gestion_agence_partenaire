# 🔇 Refresh silencieux sans notification pour les collègues

## 🎯 Objectif

Éviter de **déranger les agents** qui travaillent sur d'autres tâches quand un collègue crée des expéditions. Les données doivent se mettre à jour automatiquement en arrière-plan, mais **sans notification visuelle ni sonore**.

## 📋 Comportement souhaité

### Quand Agent A crée une expédition:

**Agent A (celui qui crée):**
- ✅ Voit le modal de succès normal
- ✅ Pas de notification WebSocket supplémentaire (évite la duplication)

**Agent B, C, D (collègues de la même agence):**
- ✅ Données rafraîchies automatiquement en arrière-plan
- 🔇 **AUCUNE notification** (pas de toast, pas de son)
- 🔇 **Aucune interruption** de leur travail en cours

### Pourquoi ?

1. **Plusieurs créations d'affilée**: Si Agent A crée 10 expéditions rapidement, Agent B ne sera pas bombardé de 10 notifications
2. **Concentration**: Les agents peuvent se concentrer sur leur propre travail
3. **Données synchronisées**: Quand un agent revient sur le Dashboard ou la liste, il voit les dernières données
4. **Notifications uniquement pour les événements importants**: Seuls les changements de statut, blocages, etc. méritent une notification

## 🔧 Implémentation

## 🔧 Implémentation technique

### Principe

Quand un agent crée une expédition:

1. **Agent A** crée l'expédition → Référence générée (ex: `EXP-2024-001`)
2. La référence est **marquée** comme "créée par moi" pendant 5 secondes
3. Le backend émet un événement WebSocket à toute l'agence
4. Le WebSocket arrive sur **tous** les appareils:

   **Agent A (créateur):**
   - Vérifie: "C'est ma référence" → **Ignore complètement** (il a déjà son modal de succès)
   - Log: `🔇 Création auto-générée ignorée`
   
   **Agent B, C, D (collègues):**
   - Vérifie: "Pas ma référence" → **Refresh silencieux** avec `meta.silent = true`
   - Les handlers vérifient `meta.silent` → Pas de toast, pas de son
   - Seulement refresh des données en arrière-plan
   - Log: `🔄 Refresh silencieux`

### Durée du marquage

La référence est marquée pendant **5 secondes** (largement suffisant pour que le WebSocket arrive).

## 📝 Code technique

### 1. Fonction de marquage (`useWebSocket.js`)

```javascript
// Stockage des références récemment créées
const recentlyCreatedRefs = new Set();

export function markAsRecentlyCreated(reference) {
  console.log(`🔇 [WebSocket] Marquage pour ignorer notification: ${reference}`);
  recentlyCreatedRefs.add(reference);
  
  // Retirer après 5 secondes
  setTimeout(() => {
    recentlyCreatedRefs.delete(reference);
    console.log(`🔊 [WebSocket] Réactivation notifications pour: ${reference}`);
  }, 5000);
}
```

### 2. Routage avec flag `silent` (`useWebSocket.js`)

```javascript
const isSelfCreated = shouldIgnoreNotification(references);

if (action === 'created' && handlersRef.current.onExpeditionCreated) {
  if (isSelfCreated) {
    // Créé par moi → Ignorer complètement
    console.log('🔇 [WebSocket] Création auto-générée ignorée');
  } else {
    // Créé par un collègue → Refresh silencieux SANS notification
    console.log('🔄 [WebSocket] Refresh silencieux');
    handlersRef.current.onExpeditionCreated(data, { 
      ids, references, changes, count, at, 
      silent: true  // ✅ Flag pour refresh silencieux
    });
  }
}
```

### 3. Handlers dans les pages - Pas de notification si `silent: true`

**Dashboard.jsx:**
```javascript
onExpeditionCreated: (data, meta) => {
    if (meta.silent) {
        // Refresh silencieux (collègue a créé)
        console.log('🔄 [Dashboard] Refresh silencieux');
        fetchDashboard(true, true); // Pas de toast
    } else {
        // Ne devrait jamais arriver (auto-créations ignorées)
        showToast('Nouvelle expédition', 'success');
        fetchDashboard(true, true);
    }
}
```

**Expeditions.jsx:**
```javascript
onExpeditionCreated: (data, meta) => {
    if (meta.silent) {
        // Refresh silencieux
        loadExpeditions({...filters}, true); // Pas de toast
    }
}
```

**Demandes.jsx:**
```javascript
onExpeditionCreated: (data, meta) => {
    if (meta.silent) {
        // Refresh silencieux, pas de son
        const hasNewDemande = data.some(exp => exp.statut_expedition === 'en_attente');
        if (hasNewDemande) {
            loadDemandes({page: currentPage}, true); // Pas de toast ni son
        }
    }
}
```

## 🎭 Scénarios

### Scénario 1: Agent A crée une expédition

**Agent A (celui qui crée):**
```
1. Clique sur "Créer expédition"
2. Remplit le formulaire
3. Soumet → Expédition EXP-2024-001 créée
4. ✅ Voit le modal de succès avec le reçu
5. Marque "EXP-2024-001" comme récemment créée
6. Backend émet WebSocket
7. Reçoit l'événement WebSocket
8. Vérifie: "EXP-2024-001" est marquée → IGNORER 🔇
9. Rien ne se passe (pas de notification en double)
```

**Agent B (collègue sur le Dashboard):**
```
1. Travaille sur le Dashboard
2. Reçoit l'événement WebSocket { references: ['EXP-2024-001'], silent: true }
3. Vérifie: "EXP-2024-001" n'est pas marquée → REFRESH SILENCIEUX 🔄
4. Pas de toast, pas de son
5. Dashboard rafraîchi en arrière-plan
6. Continue son travail sans interruption
7. Quand il regarde les stats → Voit les nouvelles données
```

**Agent C (collègue sur Expeditions):**
```
1. Consulte la liste des expéditions
2. Reçoit l'événement WebSocket { silent: true }
3. Liste rafraîchie silencieusement
4. Pas de notification
5. La nouvelle expédition apparaît dans la liste
6. Pas d'interruption
```

### Scénario 2: Agent A crée 10 expéditions rapidement

**Agent A:**
```
Crée EXP-001, EXP-002, EXP-003... EXP-010
→ Voit 10 modals de succès (normal)
→ Ne reçoit PAS 10 notifications WebSocket en plus
```

**Agents B, C, D:**
```
Reçoivent 10 événements WebSocket
→ Refresh silencieux 10 fois en arrière-plan
→ PAS de bombardement de 10 toasts
→ Pas de sons répétés
→ Continuent leur travail tranquillement
```

## 📊 Logs dans la console

### Sur l'appareil qui crée (Agent A):
```
✅ Expédition créée: EXP-2024-001
🔇 Référence marquée pour ignorer notification: EXP-2024-001
✅ Modal de succès affiché
...
📥 [WebSocket] Message reçu: { references: ['EXP-2024-001'] }
🔇 [WebSocket] Création auto-générée ignorée (notification déjà affichée)
...
(après 5 secondes)
🔊 [WebSocket] Réactivation notifications pour: EXP-2024-001
```

### Sur les autres appareils (Agents B, C, D):
```
📥 [WebSocket] Message reçu: { references: ['EXP-2024-001'] }
🔄 [WebSocket] Refresh silencieux
🔄 [Dashboard] Expédition créée par un collègue (refresh silencieux)
(Pas de toast, pas de son)
```

## 🧪 Comment tester

### Test 1: Créer une expédition (1 seul appareil)
1. Ouvre **1 seul onglet**
2. Console ouverte (F12)
3. Crée une nouvelle expédition
4. **Résultat attendu:**
   ```
   ✅ Modal de succès affiché
   🔇 Référence marquée: EXP-2024-XXX
   🔇 [WebSocket] Création auto-générée ignorée
   ```
   → Pas de toast "nouvelle expédition créée" en plus du modal

### Test 2: Multi-appareils (comportement silencieux)
1. Ouvre **2 onglets** avec le même compte
2. Consoles ouvertes (F12) sur les deux
3. **Onglet 1 (Agent A)**: Va sur "Créer expédition"
4. **Onglet 2 (Agent B)**: Va sur le Dashboard et observe

**Résultat attendu Onglet 1 (Créateur):**
```
✅ Expédition créée avec succès
✅ Modal de succès affiché
🔇 Référence marquée
🔇 [WebSocket] Création ignorée
```
→ Juste le modal de succès (normal)

**Résultat attendu Onglet 2 (Collègue):**
```
📥 [WebSocket] Message reçu
🔄 [Dashboard] Refresh silencieux
```
→ **PAS de toast**
→ **PAS de son**
→ Dashboard rafraîchi en arrière-plan
→ Quand tu regardes les stats, elles sont à jour

### Test 3: Créations multiples rapides
1. **Onglet 1**: Crée 5 expéditions rapidement
2. **Onglet 2**: Observe

**Résultat attendu:**
- Onglet 1: 5 modals de succès (normal)
- Onglet 2: **PAS de bombardement** de toasts
- Onglet 2: Refresh silencieux en arrière-plan

## ⚙️ Configuration

### Modifier le délai de marquage

Si 5 secondes ne suffisent pas (connexion très lente):

```javascript
// Dans useWebSocket.js, ligne ~18
setTimeout(() => {
  recentlyCreatedRefs.delete(reference);
}, 10000); // 10 secondes au lieu de 5
```

### Désactiver complètement le filtrage

Si tu veux voir toutes les notifications (debug):

```javascript
// Dans useWebSocket.js, commenter la vérification:
// if (shouldIgnoreNotification(references)) {
//   return;
// }
```

## 🎨 Avantages de cette approche

### ✅ Avantages:
- **Pas de distraction**: Les agents ne sont pas interrompus par des notifications constantes
- **Données synchronisées**: Tout le monde a les dernières données quand il en a besoin
- **Efficace pour les créations en masse**: Pas de bombardement de notifications
- **Expérience utilisateur fluide**: Refresh en arrière-plan, transparent
- **Notifications pertinentes uniquement**: Réservées pour les événements importants (blocages, changements de statut)
- **Performance**: Refresh intelligent sans rechargement complet

### 🎯 Cas d'usage idéal:
- Agence avec plusieurs agents qui créent des expéditions simultanément
- Périodes de forte activité (rush)
- Agents concentrés sur des tâches différentes
- Évite la "fatigue des notifications"

### ⚠️ Note importante:
Les autres événements (changements de statut, paiements confirmés, colis bloqués, etc.) **continuent d'afficher des notifications** car ce sont des événements importants qui nécessitent l'attention de l'agent.

## 🔮 Évolutions futures possibles

1. **Marquage par ID au lieu de référence**
   - Plus robuste si les références peuvent être dupliquées
   
2. **Marquage côté backend**
   - Le backend pourrait inclure `created_by_socket_id` dans le payload
   - Chaque client ignorerait les événements avec son propre socket ID
   
3. **Durée adaptative**
   - Mesurer la latence WebSocket et ajuster le timeout automatiquement

4. **Statistiques de notifications**
   - Compter combien de notifications sont ignorées vs affichées
   - Utile pour monitorer le système

## ✅ Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/hooks/useWebSocket.js` | Ajout de `markAsRecentlyCreated()` et `shouldIgnoreNotification()` |
| `src/pages/CreateExpeditionV2.jsx` | Appel de `markAsRecentlyCreated()` après création |
| `src/pages/CreateExpedition.jsx` | Appel de `markAsRecentlyCreated()` après création |

---

**🔇 Les collègues ne sont plus dérangés, les données restent synchronisées ! 🎉**
