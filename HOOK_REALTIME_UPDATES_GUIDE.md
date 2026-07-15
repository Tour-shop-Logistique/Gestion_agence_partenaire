# 📖 Guide d'utilisation - useRealtimeUpdates

## 🎯 Objectif

Le hook `useRealtimeUpdates` est une version **simplifiée** de `useWebSocket` pour les cas d'usage courants où vous voulez juste rafraîchir vos données quand quelque chose change.

---

## 🚀 Utilisation basique

### Exemple 1 : Rafraîchir toutes les données

```javascript
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

function MaPage() {
  const [data, setData] = useState([]);
  
  const fetchData = () => {
    // Votre logique de chargement
    apiService.get('/my-endpoint').then(setData);
  };
  
  // Simple : rafraîchir à chaque changement
  useRealtimeUpdates(fetchData);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return <div>{/* Votre contenu */}</div>;
}
```

### Exemple 2 : Avec options

```javascript
useRealtimeUpdates(
  () => fetchData(),
  {
    only: ['expeditions'], // Écouter seulement les expéditions
    showNotifications: false, // Pas de toasts
    enabled: isPageActive // Activer conditionnellement
  }
);
```

---

## 📦 Hooks spécialisés

### Pour les expéditions uniquement

```javascript
import { useRealtimeExpeditions } from '../hooks/useRealtimeUpdates';

function Expeditions() {
  const fetchExpeditions = () => {
    // Charger expéditions
  };
  
  // Écoute SEULEMENT les événements d'expéditions
  useRealtimeExpeditions(fetchExpeditions);
  
  return <div>{/* Liste d'expéditions */}</div>;
}
```

### Pour les colis uniquement

```javascript
import { useRealtimeColis } from '../hooks/useRealtimeUpdates';

function Colis() {
  const fetchColis = () => {
    // Charger colis
  };
  
  // Écoute SEULEMENT les événements de colis
  useRealtimeColis(fetchColis);
  
  return <div>{/* Liste de colis */}</div>;
}
```

### Pour les tarifs uniquement

```javascript
import { useRealtimeTarifs } from '../hooks/useRealtimeUpdates';

function TarifsSimples() {
  const fetchTarifs = () => {
    // Charger tarifs
  };
  
  // Écoute SEULEMENT les événements de tarifs
  useRealtimeTarifs(fetchTarifs);
  
  return <div>{/* Grille de tarifs */}</div>;
}
```

---

## 🔔 Avec notifications automatiques

```javascript
import { useRealtimeWithNotifications } from '../hooks/useRealtimeUpdates';

function Dashboard() {
  const fetchDashboard = () => {
    // Charger données
  };
  
  // Affiche automatiquement des notifications toast
  // ET joue des sons selon le type d'événement
  useRealtimeWithNotifications(fetchDashboard);
  
  return <div>{/* Dashboard */}</div>;
}
```

**Notifications affichées automatiquement :**
- 📦 Expédition mise à jour → Toast info
- 💰 Paiement confirmé → Toast success
- ✅ Colis contrôlé → Toast success
- ⚠️ Colis bloqué → Toast warning + **Son d'alerte**
- 🎉 Nouveau colis → Toast success + **Son de succès**
- ⛔ Agence désactivée → Toast error

---

## 🚨 Détecter la désactivation de l'agence

```javascript
import { useAgenceDeactivation } from '../hooks/useRealtimeUpdates';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function App() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Déconnecter automatiquement si l'agence est désactivée
  useAgenceDeactivation(() => {
    console.warn('Agence désactivée - Déconnexion');
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 3000);
  });
  
  return <div>{/* Votre app */}</div>;
}
```

---

## ⏰ Auto-refresh avec temps réel

```javascript
import { useAutoRefreshWithRealtime } from '../hooks/useRealtimeUpdates';

function MaPage() {
  const fetchData = () => {
    // Charger données
  };
  
  // Refresh automatique toutes les 30 secondes
  // + Refresh immédiat quand un événement arrive
  useAutoRefreshWithRealtime(
    fetchData,
    30000 // 30 secondes
  );
  
  return <div>{/* Contenu */}</div>;
}
```

---

## 🎛️ Options disponibles

### useRealtimeUpdates(onUpdate, options)

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `showNotifications` | boolean | `true` | Afficher les toasts |
| `playSound` | boolean | `true` | Jouer les sons |
| `only` | array | `null` | Filtrer les événements (ex: `['expeditions', 'colis']`) |
| `enabled` | boolean | `true` | Activer/désactiver le hook |

### Valeurs possibles pour `only`

- `'expeditions'` - Tous les événements d'expéditions
- `'colis'` - Tous les événements de colis
- `'agence'` - Changements de statut d'agence
- `'tarifs'` - Mises à jour de tarifs

**Exemple :**
```javascript
useRealtimeUpdates(fetchData, {
  only: ['expeditions', 'colis'], // Seulement ces deux types
  showNotifications: false
});
```

---

## 📊 Accéder aux détails de l'événement

```javascript
useRealtimeUpdates((data, meta, eventType) => {
  console.log('Type:', eventType); // Ex: 'expedition.payment_confirmed'
  console.log('Données:', data);    // Tableau des entités modifiées
  console.log('Meta:', meta);       // { ids, references, count, changes, at }
  
  // Logique personnalisée
  if (eventType === 'colis.blocked') {
    alert(`Attention: ${meta.references.join(', ')} bloqué(s)`);
  }
  
  // Puis rafraîchir
  fetchData();
});
```

---

## 🔀 Comparaison des hooks

### useWebSocket (Complet)
✅ Contrôle total sur chaque type d'événement  
✅ Handlers personnalisés pour chaque action  
❌ Plus verbeux

```javascript
useWebSocket(agenceId, {
  onExpeditionStatusChanged: (data, meta) => { /* ... */ },
  onExpeditionPaymentConfirmed: (data, meta) => { /* ... */ },
  onColisBlocked: (data, meta) => { /* ... */ },
  // ... 10 handlers
}, true);
```

### useRealtimeUpdates (Simplifié)
✅ Simple et concis  
✅ Un seul callback pour tout  
✅ Filtrage facile par type  
❌ Moins de contrôle granulaire

```javascript
useRealtimeUpdates(() => fetchData(), {
  only: ['expeditions']
});
```

### useRealtimeExpeditions (Spécialisé)
✅ Ultra simple  
✅ Nom explicite  
❌ Un seul type d'événement

```javascript
useRealtimeExpeditions(() => fetchData());
```

---

## 🎯 Quand utiliser quoi ?

### Utilisez `useRealtimeUpdates` si :
- ✅ Vous voulez juste rafraîchir vos données
- ✅ Vous n'avez pas besoin de logique différente par type
- ✅ Vous voulez du code simple et maintenable

### Utilisez `useRealtimeExpeditions/Colis/Tarifs` si :
- ✅ Votre page gère UN SEUL type d'entité
- ✅ Vous voulez un code ultra-lisible

### Utilisez `useRealtimeWithNotifications` si :
- ✅ Vous voulez des notifications automatiques
- ✅ Vous voulez des sons d'alerte
- ✅ Page dashboard ou principale

### Utilisez `useWebSocket` directement si :
- ✅ Vous avez besoin de logique complexe par événement
- ✅ Vous voulez un contrôle total
- ✅ Chaque événement nécessite un traitement différent

---

## ✨ Exemples complets

### Page Expéditions (Simple)

```javascript
import { useRealtimeExpeditions } from '../hooks/useRealtimeUpdates';

function Expeditions() {
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchExpeditions = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/expeditions');
      setExpeditions(data);
    } finally {
      setLoading(false);
    }
  };
  
  // Rafraîchir automatiquement quand une expédition change
  useRealtimeExpeditions(fetchExpeditions);
  
  useEffect(() => {
    fetchExpeditions();
  }, []);
  
  return (
    <div>
      {loading && <LoadingSpinner />}
      <ExpeditionsList data={expeditions} />
    </div>
  );
}
```

### Page Dashboard (Avec notifications)

```javascript
import { useRealtimeWithNotifications } from '../hooks/useRealtimeUpdates';

function Dashboard() {
  const { fetchDashboard } = useDashboard();
  
  // Notifications automatiques + Refresh
  useRealtimeWithNotifications(() => {
    fetchDashboard(true, true); // silent refresh
  });
  
  return <div>{/* Dashboard content */}</div>;
}
```

### Page avec plusieurs types d'événements

```javascript
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

function Comptabilite() {
  const fetchData = () => {
    // Recharger toutes les données comptables
    fetchTransactions();
    fetchPaiements();
    fetchFrais();
  };
  
  // Écouter expéditions (paiements) ET tarifs
  useRealtimeUpdates(fetchData, {
    only: ['expeditions', 'tarifs']
  });
  
  return <div>{/* Comptabilité */}</div>;
}
```

---

## 🔧 Activation conditionnelle

```javascript
function MaPage() {
  const [isActive, setIsActive] = useState(true);
  
  useRealtimeUpdates(
    () => fetchData(),
    {
      enabled: isActive // Activer/désactiver dynamiquement
    }
  );
  
  return (
    <div>
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Désactiver' : 'Activer'} temps réel
      </button>
    </div>
  );
}
```

---

## 📝 Bonnes pratiques

### ✅ À faire

```javascript
// 1. Utiliser le hook approprié
useRealtimeExpeditions(fetchData); // Si page d'expéditions

// 2. Refresh silencieux
useRealtimeUpdates(() => {
  fetchData(true); // true = pas de loader
});

// 3. Désactiver si non nécessaire
useRealtimeUpdates(fetchData, {
  enabled: isPageActive
});
```

### ❌ À éviter

```javascript
// 1. Ne pas utiliser plusieurs hooks pour le même type
useRealtimeExpeditions(fetch1);
useRealtimeExpeditions(fetch2); // ❌ Doublon

// Faire plutôt :
useRealtimeExpeditions(() => {
  fetch1();
  fetch2();
});

// 2. Ne pas créer de dépendances infinies
const fetch = () => {
  setData(newData); // ⚠️ Cause un re-render
};
useRealtimeUpdates(fetch); // ❌ Boucle

// Faire plutôt :
const fetch = useCallback(() => {
  setData(newData);
}, []); // ✅ Stable
```

---

## 🎓 Migration depuis useWebSocket

### Avant (useWebSocket)

```javascript
useWebSocket(
  currentUser?.agence_id,
  {
    onExpeditionStatusChanged: (data, meta) => {
      fetchData();
    },
    onExpeditionPaymentConfirmed: (data, meta) => {
      fetchData();
    },
    onExpeditionFraisUpdated: (data, meta) => {
      fetchData();
    }
  },
  !!currentUser?.agence_id
);
```

### Après (useRealtimeUpdates)

```javascript
useRealtimeExpeditions(() => fetchData());
```

**90% de code en moins ! 🎉**

---

**Besoin d'aide ? Consultez `WEBSOCKET_DEVELOPER_GUIDE.md` pour plus d'exemples !**
