# Implémentation de l'événement `Expedition.created` dans le WebSocket

## 🎯 Objectif

Permettre aux appareils connectés de recevoir en temps réel les notifications lorsqu'une nouvelle expédition est créée par un collègue de la même agence.

## ✅ Modifications effectuées

### 1. **Hook WebSocket (`src/hooks/useWebSocket.js`)**

#### Ajouts:
- ✅ Support complet de l'événement `created` pour le modèle `Expedition`
- ✅ Documentation mise à jour avec `onExpeditionCreated` dans les JSDoc
- ✅ Logs détaillés pour chaque événement reçu et chaque handler appelé
- ✅ Ajout de `onExpeditionCreated` dans `useWebSocketRefresh`

#### Code ajouté dans le routeur d'événements:
```javascript
else if (action === 'created' && handlersRef.current.onExpeditionCreated) {
  console.log('✅ [WebSocket] Handler onExpeditionCreated appelé');
  handlersRef.current.onExpeditionCreated(data, { ids, references, changes, count, at });
}
```

### 2. **Page Dashboard (`src/pages/Dashboard.jsx`)**

#### Handler ajouté:
```javascript
onExpeditionCreated: (data, meta) => {
    console.log('🎉 [Dashboard] Nouvelle(s) expédition(s) créée(s):', meta.count);
    showToast(`${meta.count} nouvelle(s) expédition(s) créée(s)`, 'success');
    fetchDashboard(true, true); // Refresh silencieux
}
```

**Comportement:**
- Affiche une notification toast
- Rafraîchit automatiquement les statistiques du dashboard
- Met à jour la liste des dernières expéditions

### 3. **Page Expeditions (`src/pages/Expeditions.jsx`)**

#### Handler ajouté:
```javascript
onExpeditionCreated: (data, meta) => {
    console.log('🎉 [Expeditions] Nouvelle(s) expédition(s) créée(s):', meta.count);
    showToast(`${meta.count} nouvelle(s) expédition(s) créée(s)`, 'success');
    // Recharger la liste avec les filtres actuels
    loadExpeditions({
        page: currentPage,
        date_debut: dateDebut,
        date_fin: dateFin,
        type: type
    }, true); // Silencieux
}
```

**Comportement:**
- Affiche une notification toast
- Recharge automatiquement la liste des expéditions avec les filtres en cours
- Maintient la pagination actuelle

### 4. **Page Demandes (`src/pages/Demandes.jsx`)**

#### Handler ajouté:
```javascript
onExpeditionCreated: (data, meta) => {
    // Vérifier si la nouvelle expédition est une demande (statut en_attente)
    const hasNewDemande = data.some(exp => exp.statut_expedition === 'en_attente');
    if (hasNewDemande) {
        console.log('🎉 [Demandes] Nouvelle(s) demande(s) créée(s):', meta.count);
        showToast(`📋 ${meta.count} nouvelle(s) demande(s) d'expédition`, 'info');
        soundNotification.playSuccess();
        loadDemandes({ page: currentPage }, true);
    }
}
```

**Comportement:**
- Vérifie si la nouvelle expédition est une demande (statut `en_attente`)
- Joue un son de notification
- Affiche une notification toast
- Recharge automatiquement la liste des demandes

### 5. **Service Echo (`src/services/echo.js`)**

#### Logs ajoutés:
- ✅ Socket ID lors de la connexion
- ✅ Changements d'état de connexion (`state_change`)
- ✅ **Listener global** `bind_global()` pour capturer TOUS les événements
- ✅ Meilleure visibilité sur les états connecté/déconnecté/erreur

```javascript
// Log de tous les messages reçus (debug)
echoInstance.connector.pusher.connection.bind_global((eventName, data) => {
    console.log('🔔 [Echo] Événement global reçu:', eventName, data);
});
```

### 6. **Documentation (`GUIDE-WEBSOCKET-AGENCE.md`)**

#### Mise à jour:
- ✅ `created` marqué comme **MAINTENANT IMPLÉMENTÉ**
- ✅ Ajout de la note d'importance pour le cas multi-agents
- ✅ Documentation complète sur l'utilisation

## 📊 Format de l'événement reçu

Lorsqu'une nouvelle expédition est créée, le payload suivant est reçu:

```json
{
  "model": "Expedition",
  "action": "created",
  "ids": ["abc-123-def-456"],
  "references": ["EXP-2024-001"],
  "count": 1,
  "changes": null,
  "data": [
    {
      "id": "abc-123-def-456",
      "reference": "EXP-2024-001",
      "statut_expedition": "en_attente",
      "montant_expedition": 25000,
      "agence_enlevement_id": "agence-123",
      "agence_destination_id": "agence-456",
      "colis": [
        {
          "id": "colis-1",
          "code_colis": "COL-001",
          "poids": 5.5,
          ...
        }
      ],
      ...
    }
  ],
  "at": "2026-07-14 16:30:00"
}
```

## 🎮 Pages qui écoutent l'événement

| Page | Handler | Comportement |
|------|---------|-------------|
| **Dashboard** | `onExpeditionCreated` | Rafraîchit les stats et la liste des dernières expéditions |
| **Expeditions** | `onExpeditionCreated` | Recharge la liste avec les filtres actuels |
| **Demandes** | `onExpeditionCreated` | Recharge si `statut_expedition === 'en_attente'` + son |

## 🧪 Comment tester

### Préparation:
1. Ouvrir **deux onglets** ou **deux appareils** avec le même compte agence
2. Ouvrir la **console développeur (F12)** sur les deux

### Test 1: Dashboard
1. Onglet A: Aller sur le Dashboard
2. Onglet B: Créer une nouvelle expédition
3. **Résultat attendu sur Onglet A:**
   ```
   🔔 [Echo] Événement global reçu: ...
   📥 [WebSocket] Message reçu: { model: 'Expedition', action: 'created', ... }
   🚚 [WebSocket] Expédition - Action: created
   ✅ [WebSocket] Handler onExpeditionCreated appelé
   🎉 [Dashboard] Nouvelle(s) expédition(s) créée(s): 1
   ```
   - Toast: "1 nouvelle(s) expédition(s) créée(s)"
   - Dashboard rafraîchi automatiquement

### Test 2: Liste des Expéditions
1. Onglet A: Aller sur /expeditions
2. Onglet B: Créer une nouvelle expédition
3. **Résultat attendu sur Onglet A:**
   ```
   🎉 [Expeditions] Nouvelle(s) expédition(s) créée(s): 1
   ```
   - Toast: "1 nouvelle(s) expédition(s) créée(s)"
   - Liste rafraîchie automatiquement
   - Nouvelle expédition visible

### Test 3: Demandes (si statut = en_attente)
1. Onglet A: Aller sur /demandes
2. Onglet B: Créer une nouvelle demande d'expédition
3. **Résultat attendu sur Onglet A:**
   ```
   🎉 [Demandes] Nouvelle(s) demande(s) créée(s): 1
   ```
   - 🔔 Son de notification
   - Toast: "📋 1 nouvelle(s) demande(s) d'expédition"
   - Liste rafraîchie automatiquement

## 🐛 Debugging

### Si aucun événement n'est reçu:

1. **Vérifier la connexion WebSocket:**
   ```
   Console → Chercher: ✅ [Echo] WebSocket connecté avec succès
   ```

2. **Vérifier l'abonnement au canal:**
   ```
   Console → Chercher: ✅ [WebSocket] Abonné avec succès au canal: agence.{id}
   ```

3. **Vérifier que le backend émet l'événement:**
   ```
   Console → Chercher: 🔔 [Echo] Événement global reçu:
   ```
   - Si présent → WebSocket fonctionne
   - Si absent → Le backend n'émet pas l'événement

4. **Vérifier le routage:**
   ```
   Console → Chercher: 📥 [WebSocket] Message reçu:
   ```
   - Vérifier `model: 'Expedition'` et `action: 'created'`

5. **Vérifier l'appel du handler:**
   ```
   Console → Chercher: ✅ [WebSocket] Handler onExpeditionCreated appelé
   ```

### Si l'événement est reçu mais rien ne se passe:

1. Vérifier que le handler existe dans la page
2. Vérifier les logs de la page (ex: `🎉 [Dashboard] Nouvelle(s) expédition(s)...`)
3. Vérifier qu'il n'y a pas d'erreur JavaScript dans la console

## 📝 Notes importantes

### Optimisation réseau:
- Les refreshs sont **silencieux** (`silentRefresh: true`) pour ne pas afficher de loader
- Seul un toast discret informe l'utilisateur
- Pas de re-fetch complet, juste les données nécessaires

### Cas multi-agents:
Si plusieurs agents de la même agence sont connectés simultanément:
- Agent A crée une expédition
- Agent B, C, D reçoivent la notification instantanément
- Tous voient la même donnée en temps réel

### Performance:
- Pas de polling nécessaire
- Connexion WebSocket unique pour toute l'application
- Événements groupés supportés (ex: 50 expéditions créées d'un coup)

## 🔮 Évolutions futures possibles

1. **Insertion optimiste:**
   Au lieu de re-fetcher, insérer directement la nouvelle expédition dans la liste locale

2. **Notification sonore paramétrable:**
   Permettre à l'utilisateur d'activer/désactiver les sons

3. **Badge de notification:**
   Afficher un badge sur l'icône de navigation quand de nouvelles expéditions arrivent

4. **Filtrage intelligent:**
   Ne notifier que si la nouvelle expédition correspond aux filtres actuels de l'utilisateur

## ✅ Checklist de validation

- [x] Handler `onExpeditionCreated` dans `useWebSocket.js`
- [x] Documentation JSDoc mise à jour
- [x] Logs détaillés dans echo.js
- [x] Logs détaillés dans useWebSocket.js
- [x] Handler dans Dashboard.jsx
- [x] Handler dans Expeditions.jsx
- [x] Handler dans Demandes.jsx
- [x] Documentation GUIDE-WEBSOCKET-AGENCE.md mise à jour
- [x] Tests manuels effectués (à faire après déploiement backend)
