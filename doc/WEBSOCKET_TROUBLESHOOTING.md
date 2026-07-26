# 🔧 WebSocket - Guide de Dépannage

## ❌ Erreur : WebSocket connection failed

### Symptôme
```
WebSocket connection to 'wss://xxx.ngrok-free.app/app/tourshop-key?...' failed
```

### Causes possibles

#### 1. 🔴 URL incorrecte dans `.env`

**Vérification :**
```env
# Doit correspondre à l'URL de votre backend
VITE_PUSHER_HOST=fc60-102-212-190-197.ngrok-free.app
```

**Solution :**
1. Vérifier l'URL de l'API dans `VITE_API_PROXY_TARGET`
2. Utiliser la **même URL** pour `VITE_PUSHER_HOST` (sans le protocole https://)

```env
# Exemple correct
VITE_API_PROXY_TARGET="https://fc60-102-212-190-197.ngrok-free.app"
VITE_PUSHER_HOST=fc60-102-212-190-197.ngrok-free.app
```

⚠️ **Important** : Après modification du `.env`, **redémarrer le serveur de développement** !

```bash
# Arrêter (Ctrl+C)
# Relancer
npm run dev
```

#### 2. 🔴 Serveur WebSocket non démarré

**Vérification :**
Le backend Laravel doit avoir le serveur WebSocket actif.

**Solution :**
Vérifier avec le développeur backend que :
- Laravel Reverb ou Soketi est démarré
- Le serveur écoute sur le bon port (443 ou autre)
- Pusher est correctement configuré

#### 3. 🔴 Port bloqué

**Vérification :**
Testez l'accès au serveur WebSocket :
```bash
# Dans le navigateur, essayer d'accéder à :
https://votre-host.ngrok-free.app
```

**Solution :**
- Vérifier les pare-feu
- Vérifier que ngrok est actif
- Vérifier que le port 443 est ouvert

#### 4. 🔴 Configuration Pusher incorrecte

**Vérification :**
```env
VITE_PUSHER_APP_KEY=tourshop-key  # Doit correspondre au backend
VITE_PUSHER_PORT=443               # Port standard HTTPS
VITE_PUSHER_SCHEME=https           # Utiliser https en production
```

**Solution :**
Demander au développeur backend de vérifier :
- `PUSHER_APP_KEY` côté Laravel
- Configuration de Broadcasting

#### 5. 🔴 Certificat SSL invalide (ngrok)

**Vérification :**
Avec ngrok, parfois les certificats causent des problèmes.

**Solution temporaire (DEV uniquement) :**
```javascript
// Dans echo.js, ajouter :
echoInstance = new Echo({
  // ... config existante
  disableStats: true,
  encrypted: true,
});
```

## ✅ Checklist de dépannage

```
[ ] 1. L'URL VITE_PUSHER_HOST correspond à l'URL de l'API ?
[ ] 2. Le serveur de dev a été redémarré après modif du .env ?
[ ] 3. Le backend est bien démarré ?
[ ] 4. Le serveur WebSocket est actif côté backend ?
[ ] 5. L'URL est accessible dans le navigateur ?
[ ] 6. La console montre d'autres erreurs ?
```

## 🔍 Diagnostic pas à pas

### Étape 1 : Vérifier la configuration

```bash
# Ouvrir le fichier .env
code .env
```

Vérifier :
```env
# Ces deux URLs doivent être cohérentes
VITE_API_PROXY_TARGET="https://fc60-102-212-190-197.ngrok-free.app"
VITE_PUSHER_HOST=fc60-102-212-190-197.ngrok-free.app
```

### Étape 2 : Redémarrer l'application

```bash
# 1. Arrêter le serveur de dev (Ctrl+C)
# 2. Relancer
npm run dev
```

### Étape 3 : Vérifier les logs

Ouvrir la console navigateur (`F12`) et chercher :
```
✅ [Echo] Initialisation de la connexion WebSocket...
✅ [Echo] WebSocket connecté avec succès
```

Si erreur :
```
❌ [Echo] Erreur WebSocket: ...
```

### Étape 4 : Tester l'URL backend

Dans le navigateur, ouvrir :
```
https://fc60-102-212-190-197.ngrok-free.app
```

Si la page s'ouvre → Backend OK  
Si erreur → Backend non accessible

### Étape 5 : Vérifier le token

```javascript
// Console navigateur
localStorage.getItem('auth_token')
```

Si `null` → Se reconnecter  
Si présent → Token OK

### Étape 6 : Mode debug

Ouvrir le panel de debug (`Ctrl+Shift+D`) et vérifier :
- État de connexion
- Socket ID
- Erreurs

## 🛠️ Solutions rapides

### Solution 1 : Réinitialiser la connexion

```javascript
// Console navigateur
localStorage.clear()
location.reload()
```

Puis se reconnecter.

### Solution 2 : Forcer une nouvelle URL

```javascript
// Console navigateur (temporaire)
localStorage.setItem('debug_ws_host', 'nouvelle-url.ngrok-free.app')
location.reload()
```

### Solution 3 : Vérifier le backend

Demander au développeur backend d'exécuter :

```bash
# Laravel
php artisan reverb:start
# ou
php artisan queue:work

# Vérifier les logs
tail -f storage/logs/laravel.log
```

## 📞 Contacter le support

Si le problème persiste après toutes ces vérifications, fournir :

1. **Fichier .env** (sans les secrets !)
```env
VITE_PUSHER_APP_KEY=tourshop-key
VITE_PUSHER_HOST=votre-host.ngrok-free.app
VITE_PUSHER_PORT=443
```

2. **Logs console complète** (copier/coller)

3. **Checklist complétée**

4. **Capture d'écran** du panel de debug

## 🔄 Après correction

Une fois corrigé :

1. ✅ Vérifier l'indicateur vert dans le header
2. ✅ Tester un événement depuis le backoffice
3. ✅ Vérifier que les notifications s'affichent
4. ✅ Documenter la solution pour l'équipe

---

## 💡 Note importante

**ngrok génère de nouvelles URLs à chaque redémarrage !**

Si vous redémarrez ngrok, vous devez :
1. Mettre à jour `VITE_PUSHER_HOST` dans `.env`
2. Redémarrer le serveur de dev
3. Rafraîchir le navigateur

Pour éviter ça en développement, utilisez un **domaine ngrok fixe** (nécessite un compte payant) ou **Soketi en local**.

---

*Ce guide sera mis à jour avec de nouveaux problèmes rencontrés*
