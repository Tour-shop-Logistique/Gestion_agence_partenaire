# Logs WebSocket ajoutés pour le debugging

## 📌 Résumé

Des logs détaillés ont été ajoutés dans tout le système WebSocket pour diagnostiquer pourquoi les nouvelles expéditions ne sont pas reçues en temps réel sur les autres appareils.

## 🔧 Fichiers modifiés

### 1. `src/services/echo.js`
**Logs ajoutés:**
- ✅ Socket ID lors de la connexion
- ✅ Changements d'état de la connexion (`state_change`)
- ✅ **Tous les événements globaux** avec `bind_global()` pour voir TOUT ce qui arrive
- ✅ Meilleure visibilité sur les états de connexion

**Pourquoi:** Pour vérifier que le WebSocket est bien connecté et qu'il reçoit des messages du serveur.

### 2. `src/hooks/useWebSocket.js`
**Logs ajoutés:**
- ✅ Résumé de chaque message reçu (model, action, count, références, timestamp)
- ✅ Données complètes du payload pour inspection détaillée
- ✅ Confirmation quand un handler est appelé
- ✅ **Avertissement quand une action n'est pas gérée** ou qu'un handler manque
- ✅ Logs d'abonnement/désabonnement des canaux
- ✅ Confirmation de souscription au canal
- ✅ Support pour l'événement `created` (préparé pour le backend)

**Pourquoi:** Pour voir exactement quels événements arrivent, s'ils sont routés correctement, et si les handlers sont bien appelés.

### 3. `src/pages/Dashboard.jsx`
**Handler ajouté:**
```javascript
onExpeditionCreated: (data, meta) => {
    console.log('🎉 [Dashboard] Nouvelle(s) expédition(s) créée(s):', meta.count);
    showToast(`${meta.count} nouvelle(s) expédition(s) créée(s)`, 'success');
    fetchDashboard(true, true);
}
```

**Pourquoi:** Pour être prêt à recevoir l'événement `created` une fois que le backend l'émettra.

### 4. `GUIDE-WEBSOCKET-AGENCE.md`
**Documentation mise à jour:**
- ✅ Ajout de l'événement `created` avec mention **NON IMPLÉMENTÉ ACTUELLEMENT**
- ✅ Note d'avertissement expliquant le problème

## 📊 Exemples de logs que vous verrez maintenant

### Lors de la connexion WebSocket:
```
[Echo] Initialisation de la connexion WebSocket...
✅ [Echo] WebSocket connecté avec succès
📊 [Echo] Socket ID: 123456.789012
🔌 [WebSocket] Tentative d'abonnement au canal: agence.42
✅ [WebSocket] Abonné avec succès au canal: agence.42
👂 [WebSocket] Écoute de l'événement '.model.updated' sur agence.42
```

### Lors de la réception d'un événement:
```
🔔 [Echo] Événement global reçu: pusher:subscription_succeeded {...}
📥 [WebSocket] Message reçu: {
  model: 'Expedition',
  action: 'status_changed',
  count: 1,
  ids: ['abc-123'],
  references: ['EXP-2024-001'],
  at: '2024-07-14 15:30:00'
}
📄 [WebSocket] Données complètes: {...}
🚚 [WebSocket] Expédition - Action: status_changed
✅ [WebSocket] Handler onExpeditionStatusChanged appelé
📦 [Dashboard] Expédition(s) mise(s) à jour: 1
```

### Si un événement non géré arrive:
```
📥 [WebSocket] Message reçu: {
  model: 'Expedition',
  action: 'created',
  count: 1,
  ...
}
🚚 [WebSocket] Expédition - Action: created
⚠️ [WebSocket] Action 'created' non gérée pour Expedition ou handler manquant
```

## 🎯 Comment utiliser ces logs

### Pour vérifier la connexion:
1. Ouvrir la console développeur (F12)
2. Chercher `✅ [Echo] WebSocket connecté avec succès`
3. Vérifier qu'il y a un Socket ID
4. Vérifier l'abonnement au canal `agence.{votre_id_agence}`

### Pour vérifier la réception d'événements:
1. Faire une action (créer une expédition, changer un statut, etc.)
2. Chercher `🔔 [Echo] Événement global reçu:`
3. Chercher `📥 [WebSocket] Message reçu:`
4. Vérifier le model et l'action

### Pour diagnostiquer un problème:
1. Si vous ne voyez **aucun** événement global → Problème de connexion WebSocket
2. Si vous voyez des événements globaux mais pas de `Message reçu` → L'événement ne correspond pas au canal écouté
3. Si vous voyez `Message reçu` mais `Action non gérée` → Le handler n'existe pas dans le code
4. Si vous voyez `Handler appelé` mais rien ne se passe → Problème dans la logique du handler

## 🐛 Diagnostic du problème actuel

Avec ces logs, nous avons confirmé que:
- ✅ La connexion WebSocket fonctionne correctement
- ✅ Les événements `status_changed`, `payment_confirmed`, etc. sont bien reçus
- ❌ **Aucun événement `created` n'est émis par le backend** lors de la création d'une expédition

→ **Solution:** Le backend doit être modifié pour émettre l'événement `created` (voir `PROBLEME_WEBSOCKET_NOUVELLE_EXPEDITION.md`)

## 🧹 Nettoyage futur (optionnel)

Une fois le problème résolu, vous pouvez réduire la verbosité des logs:
- Garder les logs d'erreur et d'avertissement
- Retirer ou mettre en commentaire les logs de debug très détaillés
- Ou les mettre derrière un flag de développement:
  ```javascript
  const DEBUG_WEBSOCKET = import.meta.env.DEV;
  if (DEBUG_WEBSOCKET) console.log(...);
  ```
