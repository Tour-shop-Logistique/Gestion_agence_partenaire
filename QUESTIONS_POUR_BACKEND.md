# ❓ Questions pour le Backend - Configuration WebSocket

## 🎯 Contexte

Le frontend est prêt pour WebSocket mais nous avons besoin de ces informations pour finaliser la connexion.

---

## Questions urgentes

### 1. Le serveur WebSocket est-il démarré ?
- [ ] Oui, il tourne
- [ ] Non, pas encore configuré
- [ ] Je ne sais pas

**Si non → Consultez `BACKEND_WEBSOCKET_SETUP.md` pour l'installation**

---

### 2. Quelle est l'URL/HOST du serveur WebSocket ?

**Option A : Même serveur que l'API**
```
URL API : https://fc60-102-212-190-197.ngrok-free.app
URL WebSocket : https://fc60-102-212-190-197.ngrok-free.app
```

**Option B : Serveur séparé (tunnel ngrok différent)**
```
URL API : https://fc60-102-212-190-197.ngrok-free.app
URL WebSocket : https://_____________________________.ngrok-free.app
                      👆 À compléter
```

**Option C : Même serveur, port différent**
```
URL API : https://fc60-102-212-190-197.ngrok-free.app
URL WebSocket : https://fc60-102-212-190-197.ngrok-free.app
Port WebSocket : ________ (ex: 6001, 8080)
                 👆 À compléter
```

---

### 3. Quelle technologie utilisez-vous ?

- [ ] **Laravel Reverb** (Laravel 11+)
  - Commande de démarrage : `php artisan reverb:start`
  - Port par défaut : 8080
  
- [ ] **Soketi** (Serveur WebSocket gratuit)
  - Commande de démarrage : `soketi start`
  - Port par défaut : 6001
  
- [ ] **Pusher Cloud** (Service payant)
  - Pas de serveur local à démarrer
  - Credentials Pusher requis

---

### 4. La clé d'application est-elle correcte ?

**Clé actuelle configurée frontend :**
```
VITE_PUSHER_APP_KEY=tourshop-key
```

**Clé configurée backend (.env Laravel) :**
```
PUSHER_APP_KEY=________________
REVERB_APP_KEY=________________
              👆 À compléter (doit correspondre)
```

---

### 5. L'endpoint d'authentification existe-t-il ?

**URL à tester :**
```
POST https://fc60-102-212-190-197.ngrok-free.app/api/broadcasting/auth
```

**Test avec curl :**
```bash
curl -X POST https://fc60-102-212-190-197.ngrok-free.app/api/broadcasting/auth \
  -H "Authorization: Bearer [TOKEN_VALIDE]" \
  -H "Content-Type: application/json" \
  -d '{"socket_id":"123.456","channel_name":"private-agence.1"}'
```

**Résultat attendu :**
```json
{
  "auth": "tourshop-key:signature...",
  "channel_data": null
}
```

- [ ] Oui, l'endpoint fonctionne
- [ ] Non, erreur 404
- [ ] Autre erreur : _______________________

---

### 6. Les routes Broadcasting sont-elles activées ?

**Vérifier dans :**
- `routes/channels.php` → Doit contenir la route `agence.{agenceId}`
- `bootstrap/app.php` ou `app/Providers/BroadcastServiceProvider.php` → `Broadcast::routes()` appelé

```php
// routes/channels.php
Broadcast::channel('agence.{agenceId}', function ($user, $agenceId) {
    return (int) $user->agence_id === (int) $agenceId;
});
```

- [ ] Oui, configuré
- [ ] Non, à faire

---

## 📋 Configuration à fournir

**Une fois que vous avez les réponses, remplissez :**

### Frontend (.env à mettre à jour)
```env
VITE_PUSHER_APP_KEY=tourshop-key
VITE_PUSHER_HOST=_________________________________
VITE_PUSHER_PORT=_________________________________
VITE_PUSHER_SCHEME=https
VITE_PUSHER_APP_CLUSTER=mt1
```

### Backend (.env - pour référence)
```env
BROADCAST_CONNECTION=___________________ (reverb ou pusher)
REVERB_APP_KEY=tourshop-key
REVERB_APP_ID=tourshop-app
REVERB_APP_SECRET=tourshop-secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
```

---

## ✅ Tests de validation

### Test 1 : Accès au serveur WebSocket
```bash
# Dans le navigateur ou curl
https://[HOST-WEBSOCKET]/app/tourshop-key
```
**Attendu :** Réponse JSON (pas d'erreur 404)

### Test 2 : Authentification Broadcasting
```bash
curl -X POST [URL-API]/api/broadcasting/auth \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"socket_id":"123.456","channel_name":"private-agence.1"}'
```
**Attendu :** Signature d'authentification

### Test 3 : Émission d'un événement test
```php
// Dans tinker ou un contrôleur
use App\Helpers\WebSocketHelper;

$agence = Agence::first();
WebSocketHelper::emitModelUpdate(
    $agence,
    'Test',
    'ping',
    [],
    ['message' => 'test']
);
```
**Attendu :** Pas d'erreur

---

## 📞 Contact

**Une fois ces informations collectées, transmettez-les au frontend pour mise à jour du `.env`**

**Documents à consulter si besoin :**
- `BACKEND_WEBSOCKET_SETUP.md` - Installation serveur WebSocket
- `WEBSOCKET_TROUBLESHOOTING.md` - Dépannage

---

**Merci ! 🙏**
