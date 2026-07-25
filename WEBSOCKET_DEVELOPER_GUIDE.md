# 👨‍💻 Guide Développeur - WebSocket

## 🎯 Objectif

Ce guide explique comment **étendre** et **maintenir** l'implémentation WebSocket existante.

---

## 📋 Table des matières

1. [Architecture](#architecture)
2. [Ajouter un nouvel événement](#ajouter-un-nouvel-événement)
3. [Créer une nouvelle page avec WebSocket](#créer-une-nouvelle-page-avec-websocket)
4. [Personnaliser les notifications](#personnaliser-les-notifications)
5. [Déboguer efficacement](#déboguer-efficacement)
6. [Best Practices](#best-practices)
7. [Patterns avancés](#patterns-avancés)

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────┐
│   Backend       │
│   (Laravel)     │
└────────┬────────┘
         │ Émet événement
         ▼
┌─────────────────┐
│  Serveur WS     │
│  (Pusher)       │
└────────┬────────┘
         │ Broadcast
         ▼
┌─────────────────┐
│  echo.js        │ ← Service de connexion
│  (src/services) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useWebSocket   │ ← Hook personnalisé
│  (src/hooks)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pages          │ ← Composants React
│  (src/pages)    │
└─────────────────┘
```

### Flux de données

1. **Backend** émet un événement via `WebSocketHelper::emitModelUpdate()`
2. **Pusher** broadcast l'événement sur le canal `private-agence.{id}`
3. **echo.js** reçoit l'événement sur le canal écouté
4. **useWebSocket** route l'événement vers le bon handler
5. **Page** exécute la logique métier (notification, refresh, etc.)

---

## 🆕 Ajouter un nouvel événement

### Étape 1 : Backend (Laravel)

#### Émettre l'événement
```php
use App\Helpers\WebSocketHelper;

// Dans votre contrôleur ou job
WebSocketHelper::emitModelUpdate(
    $agence,                    // Instance de l'agence concernée
    'NomDuModele',              // Ex: 'Livraison', 'Facture', etc.
    'action_effectuee',         // Ex: 'created', 'delivered', etc.
    [$instance1, $instance2],   // Instances concernées (array)
    ['champ' => 'valeur']       // Changements (optionnel)
);
```

#### Exemple concret
```php
// Nouvelle fonctionnalité : Notification de livraison
public function markAsDelivered($livraisonId)
{
    $livraison = Livraison::findOrFail($livraisonId);
    $livraison->statut = 'livree';
    $livraison->save();
    
    // Émettre l'événement WebSocket
    WebSocketHelper::emitModelUpdate(
        $livraison->agence,
        'Livraison',
        'delivered',
        [$livraison],
        ['statut' => 'livree', 'delivered_at' => now()]
    );
    
    return response()->json(['success' => true]);
}
```

### Étape 2 : Frontend - Hook

#### Ajouter le handler dans useWebSocket.js

```javascript
// src/hooks/useWebSocket.js

// 1. Ajouter dans la JSDoc du hook
/**
 * @param {Function} handlers.onLivraisonDelivered - Gestionnaire pour les livraisons livrées
 */

// 2. Ajouter dans le switch du handleModelUpdate
switch (model) {
  // ... cas existants ...
  
  case 'Livraison':
    if (action === 'delivered' && handlersRef.current.onLivraisonDelivered) {
      handlersRef.current.onLivraisonDelivered(data, { ids, references, changes, count, at });
    }
    break;
}
```

### Étape 3 : Frontend - Page

#### Utiliser le nouvel événement

```javascript
// src/pages/Livraisons.jsx
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import soundNotification from '../utils/soundNotification';

function Livraisons() {
  const { currentUser } = useAuth();
  const [livraisons, setLivraisons] = useState([]);
  
  // Écouter l'événement
  useWebSocket(
    currentUser?.agence_id,
    {
      onLivraisonDelivered: (data, meta) => {
        console.log('🚚 Livraison(s) livrée(s):', meta.references);
        
        // Notification
        showToast(
          `✅ ${meta.count} livraison(s) livrée(s): ${meta.references.join(', ')}`,
          'success'
        );
        
        // Son
        soundNotification.playSuccess();
        
        // Refresh des données
        fetchLivraisons();
      }
    },
    !!currentUser?.agence_id
  );
  
  // Reste du composant...
}
```

### Étape 4 : Tests

#### Test manuel
1. Déclencher l'action depuis le backend
2. Vérifier la console : `🚚 Livraison(s) livrée(s):`
3. Vérifier la notification toast
4. Vérifier que les données se rafraîchissent
5. Ouvrir le panel de debug (`Ctrl+Shift+D`) et vérifier l'événement

#### Test automatisé (optionnel)
```javascript
// src/hooks/__tests__/useWebSocket.test.js
describe('useWebSocket - Livraison events', () => {
  it('should handle onLivraisonDelivered event', () => {
    const handler = jest.fn();
    const { result } = renderHook(() => 
      useWebSocket('agence-123', { onLivraisonDelivered: handler }, true)
    );
    
    // Simuler l'événement
    const payload = {
      model: 'Livraison',
      action: 'delivered',
      ids: ['liv-1'],
      references: ['LIV-001'],
      count: 1,
      data: [{ id: 'liv-1', statut: 'livree' }]
    };
    
    // Trigger
    // ...
    
    expect(handler).toHaveBeenCalledWith(payload.data, expect.any(Object));
  });
});
```

---

## 🆕 Créer une nouvelle page avec WebSocket

### Template de base

```javascript
// src/pages/MaNouvellePage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { showToast } from '../utils/toast';
import soundNotification from '../utils/soundNotification';

function MaNouvellePage() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ========== WEBSOCKET INTEGRATION ==========
  useWebSocket(
    currentUser?.agence_id,
    {
      // Écouter les événements pertinents
      onMonEvenement: (data, meta) => {
        console.log('📡 [MaPage] Événement reçu:', meta.count);
        showToast(`Mise à jour: ${meta.references.join(', ')}`, 'info');
        fetchData(); // Recharger les données
      },
      
      // Ajouter d'autres handlers si nécessaire
      onAutreEvenement: (data, meta) => {
        // ...
      }
    },
    !!currentUser?.agence_id // Activer seulement si connecté
  );
  
  // Fonction pour charger les données
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/mon-endpoint');
      setData(response.data);
    } catch (error) {
      showToast('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger au montage
  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div>
      <h1>Ma Nouvelle Page</h1>
      {/* Votre contenu */}
    </div>
  );
}

export default MaNouvellePage;
```

---

## 🎨 Personnaliser les notifications

### Types de notifications

```javascript
// Info (bleu)
showToast('Information générale', 'info');

// Success (vert)
showToast('Action réussie', 'success');

// Warning (orange)
showToast('⚠️ Attention!', 'warning');

// Error (rouge)
showToast('❌ Erreur!', 'error');
```

### Avec icônes

```javascript
showToast('🎉 Nouveaux colis assignés', 'success');
showToast('⚠️ Colis bloqué', 'warning');
showToast('💰 Paiement confirmé', 'success');
showToast('📦 Expédition mise à jour', 'info');
```

### Avec sons

```javascript
// Son de succès
soundNotification.playSuccess();
showToast('✅ Opération réussie', 'success');

// Son d'alerte
soundNotification.playAlert();
showToast('⚠️ Attention requise', 'warning');
```

### Notifications personnalisées

```javascript
// Notification avec compteur
const count = meta.count;
const message = count > 1 
  ? `${count} colis contrôlés` 
  : `Colis ${meta.references[0]} contrôlé`;
showToast(message, 'success');

// Notification conditionnelle
if (meta.count > 10) {
  showToast(`⚠️ Attention: ${meta.count} colis à traiter`, 'warning');
  soundNotification.playAlert();
} else {
  showToast(`${meta.count} colis reçus`, 'info');
}
```

---

## 🐛 Déboguer efficacement

### 1. Utiliser le panel de debug

```javascript
// Ouvrir avec Ctrl+Shift+D
// ou cliquer sur le bouton en bas à droite
```

Le panel affiche :
- État de la connexion
- Socket ID
- Agence ID
- Nombre d'événements reçus
- Liste des 50 derniers événements
- Payload complet de chaque événement

### 2. Logs dans la console

```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'echo:*');

// Logs spécifiques
console.log('[MaPage] Événement reçu:', data, meta);
```

### 3. Inspecter Pusher

```javascript
// Console navigateur
const pusher = window.Pusher.instances[0];

// État de la connexion
console.log(pusher.connection.state);

// Canaux actifs
console.log(pusher.channels.channels);

// Forcer une déconnexion (test)
pusher.disconnect();

// Forcer une reconnexion
pusher.connect();
```

### 4. Simuler un événement

```javascript
// Pour tester sans le backend
const simulateEvent = () => {
  const event = new CustomEvent('websocket-test', {
    detail: {
      model: 'Colis',
      action: 'assigned',
      ids: ['test-123'],
      references: ['COL-TEST'],
      count: 1,
      data: [{ id: 'test-123', code_colis: 'COL-TEST' }]
    }
  });
  
  window.dispatchEvent(event);
};

// Appeler dans la console
simulateEvent();
```

---

## ✨ Best Practices

### 1. Un seul useWebSocket par page

❌ **Mauvais**
```javascript
// Ne pas faire
useWebSocket(agenceId, { onColisAssigned: handler1 }, true);
useWebSocket(agenceId, { onColisBlocked: handler2 }, true);
```

✅ **Bon**
```javascript
// Grouper tous les handlers
useWebSocket(
  agenceId,
  {
    onColisAssigned: handler1,
    onColisBlocked: handler2
  },
  true
);
```

### 2. Éviter les dépendances dans les handlers

❌ **Mauvais**
```javascript
const fetchData = useCallback(() => {
  // ...
}, [dependency1, dependency2]);

useWebSocket(
  agenceId,
  {
    onEvent: () => {
      fetchData(); // Risque de stale closure
    }
  },
  true
);
```

✅ **Bon**
```javascript
const fetchData = () => {
  // Pas de useCallback nécessaire
  // ...
};

useWebSocket(
  agenceId,
  {
    onEvent: () => {
      fetchData();
    }
  },
  true
);
```

### 3. Désactiver proprement

```javascript
// Désactiver si pas de agence_id
useWebSocket(
  currentUser?.agence_id,
  handlers,
  !!currentUser?.agence_id // enabled
);

// Désactiver conditionnellement
useWebSocket(
  agenceId,
  handlers,
  isPageActive && !!agenceId
);
```

### 4. Refresh silencieux

```javascript
// Préférer les refreshs silencieux pour ne pas perturber l'UX
onColisAssigned: (data, meta) => {
  showToast('Nouveaux colis', 'success');
  fetchData(true); // true = silencieux (pas de loader)
}
```

### 5. Gestion des erreurs

```javascript
onEvent: async (data, meta) => {
  try {
    await fetchData();
  } catch (error) {
    console.error('Erreur refresh:', error);
    showToast('Erreur de mise à jour', 'error');
  }
}
```

---

## 🚀 Patterns avancés

### 1. Debouncing des événements

```javascript
import { useRef } from 'react';

function MaPage() {
  const debounceTimer = useRef(null);
  
  useWebSocket(
    agenceId,
    {
      onEvent: (data, meta) => {
        // Annuler le timer précédent
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        
        // Nouveau timer
        debounceTimer.current = setTimeout(() => {
          fetchData(); // Exécuter après 500ms de calme
        }, 500);
      }
    },
    true
  );
}
```

### 2. Mise à jour optimiste

```javascript
onColisAssigned: (data, meta) => {
  // Mise à jour immédiate (optimiste)
  setData(prev => [...data, ...prev]);
  
  // Confirmation backend (en arrière-plan)
  fetchData(true);
}
```

### 3. Notifications groupées

```javascript
const notificationQueue = useRef([]);
const notificationTimer = useRef(null);

useWebSocket(
  agenceId,
  {
    onEvent: (data, meta) => {
      // Ajouter à la queue
      notificationQueue.current.push(meta);
      
      // Annuler le timer précédent
      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
      }
      
      // Afficher après 2 secondes
      notificationTimer.current = setTimeout(() => {
        const total = notificationQueue.current.reduce((sum, n) => sum + n.count, 0);
        showToast(`${total} événements reçus`, 'info');
        notificationQueue.current = [];
      }, 2000);
    }
  },
  true
);
```

### 4. Mise à jour sélective

```javascript
onColisAssigned: (data, meta) => {
  // Mettre à jour seulement les colis concernés
  setData(prev => 
    prev.map(item => {
      const update = data.find(d => d.id === item.id);
      return update ? { ...item, ...update } : item;
    })
  );
}
```

---

## 🧪 Tests

### Test d'intégration

```javascript
// src/pages/__tests__/MaPage.integration.test.js
import { render, screen, waitFor } from '@testing-library/react';
import { WebSocketProvider } from '../../contexts/WebSocketContext';
import MaPage from '../MaPage';

describe('MaPage - WebSocket Integration', () => {
  it('should update data when event is received', async () => {
    const { container } = render(
      <WebSocketProvider>
        <MaPage />
      </WebSocketProvider>
    );
    
    // Simuler un événement
    const event = {
      model: 'Colis',
      action: 'assigned',
      data: [{ id: '1', code_colis: 'COL-001' }]
    };
    
    // Trigger
    window.dispatchEvent(new CustomEvent('websocket-event', { detail: event }));
    
    // Vérifier la mise à jour
    await waitFor(() => {
      expect(screen.getByText('COL-001')).toBeInTheDocument();
    });
  });
});
```

---

## 📚 Ressources

- [WEBSOCKET_QUICK_START.md](./WEBSOCKET_QUICK_START.md) - Guide rapide
- [WEBSOCKET_TEST_GUIDE.md](./WEBSOCKET_TEST_GUIDE.md) - Tests
- [Laravel Broadcasting Docs](https://laravel.com/docs/broadcasting)
- [Pusher Docs](https://pusher.com/docs)

---

**Besoin d'aide ? Consultez la documentation ou contactez l'équipe ! 🚀**
