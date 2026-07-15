# ⚠️ Erreur : Backend Ngrok Offline

## 🔴 Problème actuel

L'application affiche une **page blanche** avec ces erreurs dans la console :

```
❌ The endpoint fc60-102-212-190-197.ngrok-free.app is offline. ERR_NGROK_3200
❌ WebSocket connection failed
❌ channel.listen is not a function
```

---

## 🔍 Analyse

### Erreur principale : Ngrok Offline

```
The endpoint fc60-102-212-190-197.ngrok-free.app is offline.
```

Cela signifie que **le backend n'est PAS accessible** :
- 🔴 Le serveur Laravel n'est pas démarré
- 🔴 Ou ngrok n'est pas actif
- 🔴 Ou l'URL ngrok a changé

### Conséquences

1. ❌ L'API ne répond pas → Impossible de charger les données
2. ❌ Le WebSocket ne peut pas se connecter
3. ❌ La page reste blanche car les données ne se chargent pas

---

## ✅ Solutions appliquées (Frontend)

### 1. WebSocket temporairement désactivé

Pour éviter les erreurs qui bloquent l'application :

**Fichier : `src/App.jsx`**
```javascript
// WebSocket désactivé temporairement
// Sera réactivé une fois le backend accessible
```

### 2. Panel de debug désactivé

Le composant `WebSocketDebugPanel` est désactivé pour éviter qu'il ne plante.

### 3. Gestion d'erreur améliorée

Le composant vérifie maintenant si le canal existe avant d'écouter.

---

## 🚀 Actions requises (Backend)

### Étape 1 : Démarrer le serveur Laravel

```bash
# Dans le dossier du backend Laravel
php artisan serve

# Ou si vous utilisez un autre port
php artisan serve --port=8000
```

**Vérifier :** Ouvrir http://localhost:8000 dans le navigateur

### Étape 2 : Démarrer ngrok

```bash
# Exposer le serveur Laravel
ngrok http 8000
```

**Résultat attendu :**
```
Forwarding   https://abc123-xyz.ngrok-free.app -> http://localhost:8000
```

### Étape 3 : Noter la nouvelle URL

Ngrok génère une **nouvelle URL à chaque démarrage** :
```
https://abc123-xyz.ngrok-free.app
```

### Étape 4 : Mettre à jour le frontend

#### Dans `.env` (Frontend)
```env
# Remplacer par la NOUVELLE URL ngrok
VITE_API_PROXY_TARGET="https://abc123-xyz.ngrok-free.app"
VITE_PUSHER_HOST=abc123-xyz.ngrok-free.app
```

### Étape 5 : Redémarrer le frontend

```bash
# Arrêter (Ctrl+C)
# Relancer
npm run dev
```

---

## 🔄 Pour éviter ce problème

### Option 1 : Domaine ngrok fixe (Recommandé)

Avec un compte ngrok payant, vous pouvez avoir un domaine fixe :
```bash
ngrok http 8000 --domain=mon-domaine-fixe.ngrok-free.app
```

→ L'URL ne change plus jamais !

### Option 2 : Développement local

Si vous développez en local, utilisez directement :
```env
# Frontend .env
VITE_API_PROXY_TARGET="http://localhost:8000"
```

→ Pas besoin de ngrok pendant le développement

### Option 3 : Script de synchronisation

Créer un script qui met à jour automatiquement le `.env` :

**`update-ngrok.sh`** (Backend)
```bash
#!/bin/bash
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
echo "URL Ngrok: $NGROK_URL"
echo "À mettre dans le frontend .env:"
echo "VITE_API_PROXY_TARGET=\"$NGROK_URL\""
```

---

## ✅ Checklist de vérification

Avant de tester l'application, vérifier que :

- [ ] Le serveur Laravel est démarré (`php artisan serve`)
- [ ] Ngrok est actif (`ngrok http 8000`)
- [ ] L'URL ngrok est accessible dans le navigateur
- [ ] Le `.env` frontend a la bonne URL ngrok
- [ ] Le serveur de dev frontend est redémarré

---

## 🧪 Test rapide

### 1. Tester l'API

```bash
# Remplacer par votre URL ngrok
curl https://abc123-xyz.ngrok-free.app/api/health

# OU ouvrir dans le navigateur
https://abc123-xyz.ngrok-free.app
```

**Attendu :** Réponse du serveur (pas "offline")

### 2. Tester l'application

1. Ouvrir l'application
2. Page de login doit s'afficher (pas blanche)
3. Se connecter
4. Dashboard doit charger

---

## 📞 Une fois le backend accessible

### 1. Mettre à jour le frontend `.env`

```env
VITE_API_PROXY_TARGET="https://[NOUVELLE-URL].ngrok-free.app"
VITE_PUSHER_HOST=[NOUVELLE-URL].ngrok-free.app
```

### 2. Réactiver le WebSocket

Dans `src/App.jsx`, décommenter :
```javascript
// Ligne 110-126 : Décommenter ce bloc
if (isAuthenticated && status === "succeeded") {
  const echo = getEcho();
  // ...
}
```

### 3. Réactiver le Debug Panel

Dans `src/App.jsx`, décommenter :
```javascript
{import.meta.env.DEV && <WebSocketDebugPanel />}
```

### 4. Redémarrer et tester

```bash
npm run dev
```

---

## 🆘 Si le problème persiste

### Vérifier les logs backend

```bash
# Laravel logs
tail -f storage/logs/laravel.log
```

### Vérifier ngrok

```bash
# Interface web ngrok (voir les requêtes)
http://localhost:4040
```

### Vérifier le CORS

Le backend doit autoriser l'origine ngrok :

**`config/cors.php`** (Laravel)
```php
'allowed_origins' => ['*'], // En dev
```

---

## 📝 Résumé

**Problème :** Backend ngrok offline → Page blanche

**Solution temporaire :** WebSocket désactivé pour que l'app fonctionne

**Solution définitive :**
1. Démarrer le backend Laravel
2. Démarrer ngrok
3. Mettre à jour l'URL dans `.env` frontend
4. Redémarrer le frontend
5. Réactiver WebSocket

---

**L'application fonctionnera sans WebSocket** (pas de temps réel, mais fonctionnelle)

**Une fois le backend accessible, réactivez WebSocket pour avoir le temps réel**

---

*Document créé le 11 Juillet 2026*  
*Erreur : ERR_NGROK_3200 - Endpoint offline*
