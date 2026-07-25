# 🔧 Configuration WebSocket - Instructions Backend

## ⚠️ Problème actuel

L'erreur `WebSocket connection to 'wss://.../app/tourshop-key' failed` indique que **le serveur WebSocket n'est pas configuré/démarré** côté backend.

## 📋 Ce qui doit être fait (Backend)

### Option 1 : Laravel Reverb (Recommandé - Laravel 11+)

#### Installation

```bash
# 1. Installer Reverb
composer require laravel/reverb

# 2. Publier la configuration
php artisan reverb:install

# 3. Migrer la base de données (si demandé)
php artisan migrate
```

#### Configuration (.env Backend)

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=tourshop-app
REVERB_APP_KEY=tourshop-key
REVERB_APP_SECRET=tourshop-secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=https

# Pour ngrok
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080
```

#### Démarrer le serveur

```bash
# Dans un terminal séparé
php artisan reverb:start

# Ou en arrière-plan
php artisan reverb:start --debug
```

#### Vérification

```bash
# Le serveur doit afficher
[2026-07-11 15:30:00] Reverb server started on 0.0.0.0:8080
```

---

### Option 2 : Soketi (Alternative gratuite)

#### Installation

```bash
# Installer Soketi globalement
npm install -g @soketi/soketi

# Ou avec Docker
docker run -p 6001:6001 quay.io/soketi/soketi:latest-16-alpine
```

#### Configuration (créer soketi.json)

```json
{
  "debug": true,
  "port": 6001,
  "host": "0.0.0.0",
  "appManager": {
    "array": {
      "apps": [
        {
          "id": "tourshop-app",
          "key": "tourshop-key",
          "secret": "tourshop-secret",
          "maxConnections": 1000,
          "enableClientMessages": true,
          "enabled": true,
          "maxBackendEventsPerSecond": 100,
          "maxClientEventsPerSecond": 100,
          "maxReadRequestsPerSecond": 100
        }
      ]
    }
  }
}
```

#### Configuration (.env Backend)

```env
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=tourshop-app
PUSHER_APP_KEY=tourshop-key
PUSHER_APP_SECRET=tourshop-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
PUSHER_ENCRYPTED=true
```

#### Démarrer le serveur

```bash
# Avec le fichier de config
soketi start --config=soketi.json

# Ou directement
soketi start --port=6001
```

#### Vérification

```bash
# Le serveur doit afficher
[2026-07-11] Soketi server started on port 6001
```

---

### Option 3 : Pusher Cloud (Payant)

Si vous ne voulez pas gérer un serveur :

1. Créer un compte sur [pusher.com](https://pusher.com)
2. Créer une nouvelle app
3. Récupérer les credentials

#### Configuration (.env Backend)

```env
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=your-app-id-from-pusher
PUSHER_APP_KEY=your-key-from-pusher
PUSHER_APP_SECRET=your-secret-from-pusher
PUSHER_CLUSTER=eu  # ou us2, ap1, etc.
```

---

## 📝 Configuration Laravel (Obligatoire pour toutes les options)

### 1. Vérifier config/broadcasting.php

```php
<?php

return [
    'default' => env('BROADCAST_CONNECTION', 'reverb'),

    'connections' => [
        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => env('REVERB_SERVER_HOST', '127.0.0.1'),
                'port' => env('REVERB_SERVER_PORT', 8080),
                'scheme' => env('REVERB_SCHEME', 'http'),
                'useTLS' => env('REVERB_SCHEME') === 'https',
            ],
        ],

        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'host' => env('PUSHER_HOST', '127.0.0.1'),
                'port' => env('PUSHER_PORT', 6001),
                'scheme' => env('PUSHER_SCHEME', 'http'),
                'encrypted' => true,
                'useTLS' => env('PUSHER_SCHEME') === 'https',
            ],
        ],
    ],
];
```

### 2. Configurer routes/channels.php

```php
<?php

use Illuminate\Support\Facades\Broadcast;

// Canal privé par agence
Broadcast::channel('agence.{agenceId}', function ($user, $agenceId) {
    // Vérifier que l'utilisateur appartient à l'agence
    return (int) $user->agence_id === (int) $agenceId;
});
```

### 3. Activer Broadcasting dans AppServiceProvider

```php
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    // Activer Broadcasting
    Broadcast::routes();
}
```

### 4. Vérifier le middleware

```php
// bootstrap/app.php (Laravel 11) ou app/Http/Kernel.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(append: [
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ]);
})
```

---

## 🧪 Tester la configuration

### Test 1 : Vérifier que le serveur écoute

```bash
# Pour Reverb (port 8080)
curl http://localhost:8080

# Pour Soketi (port 6001)
curl http://localhost:6001
```

Devrait retourner un JSON de configuration.

### Test 2 : Tester l'authentification

```bash
# Avec un token valide
curl -X POST http://localhost:8000/api/broadcasting/auth \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "socket_id": "123.456",
    "channel_name": "private-agence.1"
  }'
```

Devrait retourner une signature d'authentification.

### Test 3 : Émettre un événement de test

```php
// Dans tinker ou un contrôleur
use App\Helpers\WebSocketHelper;

$agence = Agence::find(1);
$colis = Colis::first();

WebSocketHelper::emitModelUpdate(
    $agence,
    'Colis',
    'test',
    [$colis],
    ['test' => true]
);
```

---

## 🔄 Avec ngrok

Si vous utilisez ngrok pour exposer votre backend :

### Configuration

```bash
# 1. Exposer l'API Laravel (port 8000)
ngrok http 8000

# 2. Exposer le serveur WebSocket (port 8080 pour Reverb ou 6001 pour Soketi)
ngrok http 8080  # Dans un autre terminal
```

### Mettre à jour les .env

**Backend (.env) :**
```env
APP_URL=https://abc123.ngrok-free.app
REVERB_HOST=0.0.0.0
REVERB_SERVER_HOST=0.0.0.0
```

**Frontend (.env) :**
```env
VITE_API_PROXY_TARGET="https://abc123.ngrok-free.app"
VITE_PUSHER_HOST=def456.ngrok-free.app  # L'URL du tunnel WebSocket
```

⚠️ **Important** : Vous aurez **2 tunnels ngrok** :
1. Un pour l'API (port 8000)
2. Un pour WebSocket (port 8080 ou 6001)

---

## ✅ Checklist finale

Après configuration, vérifier que :

- [ ] Le serveur WebSocket est démarré
- [ ] L'endpoint `/app/{key}` est accessible
- [ ] L'authentification Broadcasting fonctionne
- [ ] Les événements sont émis correctement
- [ ] Le frontend peut se connecter

### Logs à surveiller

**Backend (Laravel) :**
```bash
tail -f storage/logs/laravel.log
```

**Reverb :**
```bash
# Voir les connexions en temps réel
php artisan reverb:start --debug
```

**Soketi :**
```bash
# Voir les logs
soketi start --debug=true
```

---

## 📞 Une fois configuré

Informer le frontend que WebSocket est prêt :

1. ✅ Serveur WebSocket démarré sur le port XXX
2. ✅ URL ngrok du WebSocket : `wss://xxx.ngrok-free.app`
3. ✅ PUSHER_APP_KEY : `tourshop-key`

Le frontend pourra alors :
1. Mettre à jour `VITE_PUSHER_HOST` dans `.env`
2. Décommenter le code WebSocket dans `App.jsx`
3. Redémarrer et tester

---

## 🆘 Support

Si problème, vérifier :
1. Logs Laravel (`storage/logs/laravel.log`)
2. Logs serveur WebSocket (console où il tourne)
3. Firewall/ports ouverts
4. Configuration ngrok

---

**Documentation officielle :**
- Laravel Reverb : https://laravel.com/docs/11.x/reverb
- Soketi : https://docs.soketi.app/
- Laravel Broadcasting : https://laravel.com/docs/11.x/broadcasting
