# 🚀 WebSocket - Quick Start

## ✅ Installation terminée !

Les WebSockets sont maintenant **100% opérationnels** dans votre application.

## 🎯 Ce qui a été fait

### 1. Infrastructure ✅
- [x] Laravel Echo + Pusher installés
- [x] Service de connexion créé (`src/services/echo.js`)
- [x] Hook personnalisé créé (`src/hooks/useWebSocket.js`)
- [x] Variables d'environnement configurées

### 2. Intégration dans les pages ✅
- [x] **Dashboard** - Vue d'ensemble avec tous les événements
- [x] **Expeditions** - Changements de statut et paiements
- [x] **Colis** - Contrôle, blocages, assignations
- [x] **Colis à Réceptionner** - Nouveaux colis et mises à jour
- [x] **Demandes** - Nouvelles demandes et changements
- [x] **Comptabilité** - Paiements et frais annexes
- [x] **Tarifs Simples** - Mises à jour de tarifs
- [x] **Tarifs Groupage** - Mises à jour de tarifs

### 3. Interface utilisateur ✅
- [x] Indicateur de connexion dans le header (point vert/rouge)
- [x] Notifications toast pour chaque événement
- [x] Sons d'alerte pour événements importants
- [x] Composant `WebSocketStatus` réutilisable

### 4. Documentation ✅
- [x] Documentation technique complète
- [x] Guide de test exhaustif
- [x] Guide Quick Start (ce fichier)

## 🔧 Configuration actuelle

### Variables d'environnement (`.env`)
```env
VITE_PUSHER_APP_KEY=tourshop-key
VITE_PUSHER_HOST=fc60-102-212-190-197.ngrok-free.app
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
VITE_PUSHER_APP_CLUSTER=mt1
```

⚠️ **Important** : Mettre à jour `VITE_PUSHER_HOST` avec l'URL finale du serveur

## 🎬 Démarrer l'application

```bash
# 1. Installer les dépendances (déjà fait)
npm install

# 2. Démarrer l'application
npm run dev

# 3. Se connecter avec un compte agence

# 4. Vérifier l'indicateur WebSocket dans le header
# → Un point vert doit apparaître = Connecté ✅
```

## 🧪 Test rapide

### Test 1 : Vérifier la connexion
1. Ouvrir la console (`F12`)
2. Rechercher : `✅ [Echo] WebSocket connecté avec succès`
3. Vérifier l'indicateur vert dans le header

### Test 2 : Tester un événement
1. Depuis le backoffice : Modifier le statut d'une expédition
2. L'application doit :
   - Afficher une notification toast
   - Mettre à jour les données automatiquement
   - Logger dans la console : `📦 [Dashboard] Expédition(s) mise(s) à jour`

### Test 3 : Tester les sons
1. Depuis le backoffice : Assigner un nouveau colis à votre agence
2. L'application doit :
   - Jouer un son de succès 🔔
   - Afficher "🎉 X nouveau(x) colis pour votre agence"

## 📊 Événements disponibles

### Expéditions
- `onExpeditionStatusChanged` - Statut modifié
- `onExpeditionPaymentConfirmed` - Paiement validé
- `onExpeditionFraisUpdated` - Frais modifiés

### Colis
- `onColisControlled` - Colis contrôlé ✅
- `onColisBlocked` - Colis bloqué 🚫 (avec son)
- `onColisUnblocked` - Colis débloqué ✅
- `onColisAssigned` - Nouveau colis 📦 (avec son)
- `onColisReceivedByBackoffice` - Reçu par backoffice 📥

### Agence & Tarifs
- `onAgenceStatusChanged` - Agence activée/désactivée ⚠️
- `onTarifsUpdated` - Tarifs modifiés 💲

## 🎨 Exemple d'utilisation

```javascript
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';

function MaPage() {
  const { currentUser } = useAuth();
  
  useWebSocket(
    currentUser?.agence_id,
    {
      // Écouter les nouveaux colis
      onColisAssigned: (data, meta) => {
        showToast(`${meta.count} nouveau(x) colis!`, 'success');
        // Recharger vos données
        refetchData();
      },
      
      // Écouter les paiements
      onExpeditionPaymentConfirmed: (data, meta) => {
        showToast(`Paiement: ${meta.references.join(', ')}`, 'success');
        refetchData();
      }
    },
    !!currentUser?.agence_id // enabled
  );
  
  return <div>Ma page</div>;
}
```

## 🐛 Dépannage rapide

### Pas de connexion ?
1. Vérifier les variables `.env`
2. Vérifier que le backend est démarré
3. Vérifier le token dans localStorage (`auth_token`)
4. Regarder la console pour les erreurs

### Événements non reçus ?
1. Vérifier que `agence_id` est correct
2. Vérifier les logs : `📡 [WebSocketStatus]`
3. Vérifier que le backend émet bien l'événement

### Point rouge dans le header ?
- Rouge = Erreur de connexion
- Gris = Déconnecté
- Jaune (pulsant) = Connexion en cours
- Vert (pulsant) = Connecté ✅

## 📚 Documentation complète

- 📖 **WEBSOCKET_IMPLEMENTATION_SUCCESS.md** - Documentation technique
- 🧪 **WEBSOCKET_TEST_GUIDE.md** - Guide de test détaillé
- 📘 **GUIDE-WEBSOCKET-AGENCE.md** - Guide du backend

## 🎉 C'est tout !

Votre application est maintenant **temps réel** !

Chaque modification dans le backoffice se reflète instantanément dans l'interface sans rafraîchir la page.

**Questions ? Consultez la documentation ou vérifiez les logs ! 🚀**

---

Développé avec ❤️ pour TourShop
