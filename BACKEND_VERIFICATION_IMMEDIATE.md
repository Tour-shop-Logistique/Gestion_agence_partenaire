# ⚠️ Backend - Vérification Immédiate WebSocket

## 🔴 Problème actuel

Le frontend essaie de se connecter à :
```
wss://974a-102-212-190-197.ngrok-free.app/app/tourshop-key
```

Mais cette URL retourne une **erreur 404** → **Le serveur WebSocket n'est PAS démarré**.

---

## ✅ Test rapide (1 minute)

### Étape 1 : Ouvrir cette URL dans votre navigateur

```
https://974a-102-212-190-197.ngrok-free.app/app/tourshop-key
```

### Résultat attendu

#### ✅ SI vous voyez un JSON comme ceci :
```json
{
  "version": "...",
  "supports": "..."
}
```
→ **Le serveur WebSocket fonctionne !** Le problème est ailleurs.

#### ❌ SI vous voyez "404 Not Found" ou "Page not found"
→ **Le serveur WebSocket n'est PAS démarré.** Suivez les étapes ci-dessous.

---

## 🚀 Démarrer le serveur WebSocket

### Option A : Laravel Reverb (Laravel 11+)

#### 1. Vérifier l'installation
```bash
composer show laravel/reverb
```

Si erreur → Installer :
```bash
composer require laravel/reverb
php artisan reverb:install
```

#### 2. Configurer .env
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=tourshop-app
REVERB_APP_KEY=tourshop-key
REVERB_APP_SECRET=tourshop-secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=http
```

#### 3. Démarrer le serveur
```bash
php artisan reverb:start
```

**Vous devriez voir :**
```
[2026-07-11 16:00:00] Reverb server started on 0.0.0.0:8080
```

#### 4. Exposer avec ngrok (si nécessaire)
Si le serveur tourne sur le port 8080 :
```bash
# Dans un nouveau terminal
ngrok http 8080
```

Ngrok affichera quelque chose comme :
```
Forwarding   https://xyz123.ngrok-free.app -> http://localhost:8080
```

→ Utilisez `xyz123.ngrok-free.app` comme `VITE_PUSHER_HOST`

---

### Option B : Soketi (Alternative)

#### 1. Installer Soketi
```bash
npm install -g @soketi/soketi
```

#### 2. Créer fichier `soketi.json`
```json
{
  "debug": true,
  "port": 6001,
  "host": "0.0.0.0",
  "appManager": {
    "array": {
      "apps": [{
        "id": "tourshop-app",
        "key": "tourshop-key",
        "secret": "tourshop-secret",
        "maxConnections": 1000,
        "enableClientMessages": true,
        "enabled": true
      }]
    }
  }
}
```

#### 3. Configurer Laravel .env
```env
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=tourshop-app
PUSHER_APP_KEY=tourshop-key
PUSHER_APP_SECRET=tourshop-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

#### 4. Démarrer Soketi
```bash
soketi start --config=soketi.json
```

**Vous devriez voir :**
```
[2026-07-11] Soketi server started on port 6001
```

#### 5. Exposer avec ngrok
```bash
# Dans un nouveau terminal
ngrok http 6001
```

→ Utilisez l'URL ngrok comme `VITE_PUSHER_HOST`

---

## 🔄 Configuration avec ngrok

### Cas 1 : Même tunnel pour API et WebSocket

Si le serveur WebSocket répond sur **le même serveur** que l'API :
```
API : https://974a-102-212-190-197.ngrok-free.app
WebSocket : https://974a-102-212-190-197.ngrok-free.app
```

→ Le frontend est **déjà configuré correctement** avec cette URL.

**Il suffit de démarrer le serveur WebSocket !**

### Cas 2 : Tunnels séparés

Si vous avez créé un nouveau tunnel ngrok pour le WebSocket :
```bash
# Résultat de ngrok http 6001 ou ngrok http 8080
Forwarding   https://abc123-xyz.ngrok-free.app -> http://localhost:6001
```

→ **Informez le frontend** de changer `VITE_PUSHER_HOST` vers cette nouvelle URL :
```env
VITE_PUSHER_HOST=abc123-xyz.ngrok-free.app
```

---

## ✅ Vérification finale

### 1. Le serveur WebSocket tourne ?
```bash
# Vous devez avoir un terminal qui affiche :
Reverb server started on 0.0.0.0:8080
# OU
Soketi server started on port 6001
```

### 2. L'URL répond ?
Ouvrir dans le navigateur :
```
https://[URL-NGROK]/app/tourshop-key
```

**Attendu :** Réponse JSON (pas 404)

### 3. Routes Broadcasting configurées ?

**Vérifier :** `routes/channels.php`
```php
<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('agence.{agenceId}', function ($user, $agenceId) {
    return (int) $user->agence_id === (int) $agenceId;
});
```

**Vérifier :** `bootstrap/app.php` (Laravel 11) ou `BroadcastServiceProvider`
```php
// Dans boot()
Broadcast::routes();
```

### 4. Test d'authentification
```bash
curl -X POST https://974a-102-212-190-197.ngrok-free.app/api/broadcasting/auth \
  -H "Authorization: Bearer [TOKEN_VALIDE]" \
  -H "Content-Type: application/json" \
  -d '{"socket_id":"123.456","channel_name":"private-agence.1"}'
```

**Attendu :**
```json
{
  "auth": "tourshop-key:signature..."
}
```

---

## 📞 Une fois démarré

Informez le frontend que :
- ✅ Le serveur WebSocket est démarré
- ✅ Il tourne sur le port XXX
- ✅ L'URL ngrok est : `https://_____.ngrok-free.app`
- ✅ L'endpoint `/app/tourshop-key` répond

Le frontend pourra alors tester la connexion immédiatement.

---

## 🆘 Problèmes courants

### Le serveur WebSocket démarre mais s'arrête immédiatement
→ Vérifier les logs d'erreur et la configuration `.env`

### Port déjà utilisé
```bash
# Changer le port dans .env
REVERB_PORT=8081  # Au lieu de 8080
# OU
soketi start --port=6002  # Au lieu de 6001
```

### Ngrok demande une vérification
→ C'est normal, cliquer sur "Visit Site"

### L'authentification Broadcasting échoue
→ Vérifier que `Broadcast::routes()` est appelé
→ Vérifier que la route existe dans `routes/channels.php`

---

**Document à consulter pour plus de détails : `BACKEND_WEBSOCKET_SETUP.md`**
