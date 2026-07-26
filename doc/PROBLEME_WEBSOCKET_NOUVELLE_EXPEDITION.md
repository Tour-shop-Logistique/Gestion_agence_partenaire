# Problème: Les nouvelles expéditions ne sont pas reçues en temps réel

## 🔍 Diagnostic

Après avoir ajouté des logs détaillés dans le système WebSocket, voici ce qui a été découvert:

### Symptôme
Lorsqu'une nouvelle expédition est créée sur un appareil, les autres appareils connectés au même compte ne reçoivent pas la notification en temps réel et ne voient pas la nouvelle expédition sans rafraîchir manuellement.

### Cause racine
Le backend **n'émet pas d'événement WebSocket** lors de la création d'une nouvelle expédition. 

D'après le guide WebSocket (`GUIDE-WEBSOCKET-AGENCE.md`), les événements actuellement émis pour le modèle `Expedition` sont:
- ✅ `status_changed` - Changement de statut d'une expédition existante
- ✅ `payment_confirmed` - Confirmation de paiement
- ✅ `frais_annexes_updated` - Mise à jour des frais annexes
- ❌ `created` - **NON IMPLÉMENTÉ** - Création d'une nouvelle expédition

## 🔧 Modifications apportées côté frontend

### 1. Logs détaillés dans `echo.js`
Ajout de logs pour suivre:
- La connexion WebSocket (`connected`, `disconnected`, `error`)
- Les changements d'état (`state_change`)
- **Tous les événements reçus** avec `bind_global()` pour debugging
- L'ID du socket pour vérifier la connexion

### 2. Logs détaillés dans `useWebSocket.js`
Ajout de logs pour:
- Chaque message reçu avec un résumé (model, action, count, références)
- Le routage vers les handlers appropriés
- Les actions non gérées ou les handlers manquants
- L'abonnement et le désabonnement des canaux
- La confirmation de souscription au canal

### 3. Handler préparé pour `onExpeditionCreated`
Le Dashboard a maintenant un handler prêt à recevoir l'événement `created`:
```javascript
onExpeditionCreated: (data, meta) => {
    console.log('🎉 [Dashboard] Nouvelle(s) expédition(s) créée(s):', meta.count);
    showToast(`${meta.count} nouvelle(s) expédition(s) créée(s)`, 'success');
    fetchDashboard(true, true);
}
```

## 🎯 Solution requise côté Backend

Le backend doit émettre un événement WebSocket lors de la création d'une expédition:

```php
// Dans le contrôleur ou service qui crée l'expédition
// Après la création de l'expédition avec succès:

broadcast(new ModelUpdated(
    model: 'Expedition',
    action: 'created',
    agenceIds: [$expedition->agence_enlevement_id], // Notifier l'agence qui a créé
    data: [$expedition],
    ids: [$expedition->id],
    references: [$expedition->reference]
));
```

### Exemple complet probable (à adapter selon votre code backend):

```php
public function store(CreateExpeditionRequest $request)
{
    DB::beginTransaction();
    try {
        // Création de l'expédition
        $expedition = Expedition::create($validated);
        
        // ... logique métier (colis, paiements, etc.)
        
        DB::commit();
        
        // ✅ AJOUTER CET ÉVÉNEMENT
        broadcast(new ModelUpdated(
            model: 'Expedition',
            action: 'created',
            agenceIds: [$expedition->agence_enlevement_id],
            data: [$expedition->load(['agenceEnlevement', 'agenceDestination', 'colis'])],
            ids: [$expedition->id],
            references: [$expedition->reference]
        ));
        
        return response()->json([
            'success' => true,
            'expedition' => $expedition
        ]);
        
    } catch (\Exception $e) {
        DB::rollback();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
```

## 📋 Checklist de vérification

### Frontend (✅ Déjà fait)
- [x] Logs détaillés dans `echo.js`
- [x] Logs détaillés dans `useWebSocket.js`
- [x] Handler `onExpeditionCreated` ajouté dans le Dashboard
- [x] Documentation mise à jour dans `GUIDE-WEBSOCKET-AGENCE.md`

### Backend (⚠️ À faire)
- [ ] Émettre l'événement `{ model: "Expedition", action: "created" }` après la création
- [ ] Tester l'émission avec deux appareils connectés
- [ ] Vérifier que les logs frontend affichent bien l'événement reçu

## 🧪 Comment tester après la correction backend

1. **Ouvrir deux onglets ou appareils** avec l'application connectée au même compte agence
2. **Ouvrir la console développeur** (F12) sur les deux appareils
3. **Créer une nouvelle expédition** sur le premier appareil
4. **Observer la console du second appareil**, vous devriez voir:
   ```
   🔔 [Echo] Événement global reçu: ...
   📥 [WebSocket] Message reçu: { model: 'Expedition', action: 'created', ... }
   🚚 [WebSocket] Expédition - Action: created
   ✅ [WebSocket] Handler onExpeditionCreated appelé
   🎉 [Dashboard] Nouvelle(s) expédition(s) créée(s): 1
   ```
5. **Le Dashboard du second appareil devrait se rafraîchir automatiquement** et afficher la nouvelle expédition

## 📝 Notes

- Les logs sont très verbeux pour le debugging. Une fois le problème résolu, on peut réduire le niveau de log.
- Le système WebSocket est fonctionnel pour tous les autres événements (status_changed, payment_confirmed, etc.)
- C'est uniquement l'événement `created` qui manque côté backend.
