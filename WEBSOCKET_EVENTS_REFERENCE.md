# 📡 Référence complète des événements WebSocket

## 📋 Table des matières
1. [Expedition](#expedition)
2. [Colis](#colis)
3. [Agence](#agence)
4. [Tarifs](#tarifs)
5. [Utilisation dans les pages](#utilisation-dans-les-pages)

---

## 🚚 Expedition

### `Expedition.created` ✨ NOUVEAU
**Quand:** Une nouvelle expédition est créée dans l'agence

**Payload:**
```json
{
  "model": "Expedition",
  "action": "created",
  "ids": ["uuid-123"],
  "references": ["EXP-2024-001"],
  "count": 1,
  "data": [{
    "id": "uuid-123",
    "reference": "EXP-2024-001",
    "statut_expedition": "en_attente",
    "montant_expedition": 25000,
    "agence_enlevement_id": "agence-1",
    "agence_destination_id": "agence-2",
    "colis": [...],
    "created_at": "2024-07-14 16:30:00"
  }],
  "at": "2024-07-14 16:30:00"
}
```

**Pages qui écoutent:**
- ✅ Dashboard → Rafraîchit stats + dernières expéditions
- ✅ Expeditions → Recharge la liste
- ✅ Demandes → Si `statut_expedition === 'en_attente'` + son

**Handler:**
```javascript
onExpeditionCreated: (data, meta) => {
    console.log('Nouvelle expédition:', meta.references);
    // Votre logique ici
}
```

---

### `Expedition.status_changed`
**Quand:** Le statut d'une expédition change (acceptée, en transit, livrée, etc.)

**Payload:**
```json
{
  "model": "Expedition",
  "action": "status_changed",
  "ids": ["uuid-123"],
  "references": ["EXP-2024-001"],
  "count": 1,
  "changes": {
    "statut_expedition": "en_transit"
  },
  "data": [{
    "id": "uuid-123",
    "reference": "EXP-2024-001",
    "statut_expedition": "en_transit",
    "updated_at": "2024-07-14 17:00:00"
  }],
  "at": "2024-07-14 17:00:00"
}
```

**Pages qui écoutent:**
- ✅ Dashboard
- ✅ Expeditions
- ✅ Demandes

**Handler:**
```javascript
onExpeditionStatusChanged: (data, meta) => {
    console.log('Statut changé:', meta.changes);
    // Votre logique ici
}
```

---

### `Expedition.payment_confirmed`
**Quand:** Un paiement est enregistré sur l'expédition

**Payload:**
```json
{
  "model": "Expedition",
  "action": "payment_confirmed",
  "ids": ["uuid-123"],
  "references": ["EXP-2024-001"],
  "count": 1,
  "changes": {
    "statut_paiement": "paid"
  },
  "data": [{
    "id": "uuid-123",
    "reference": "EXP-2024-001",
    "payment_object": "mobile_money",
    "amount": 25000,
    "statut_paiement": "paid",
    "paid_at": "2024-07-14 17:30:00"
  }],
  "at": "2024-07-14 17:30:00"
}
```

**Pages qui écoutent:**
- ✅ Dashboard
- ✅ Expeditions

**Handler:**
```javascript
onExpeditionPaymentConfirmed: (data, meta) => {
    console.log('Paiement confirmé:', meta.references);
    // Votre logique ici
}
```

---

### `Expedition.frais_annexes_updated`
**Quand:** Le backoffice modifie les frais annexes

**Payload:**
```json
{
  "model": "Expedition",
  "action": "frais_annexes_updated",
  "ids": ["uuid-123"],
  "references": ["EXP-2024-001"],
  "count": 1,
  "changes": {
    "frais_annexes": 5000
  },
  "data": [{
    "id": "uuid-123",
    "reference": "EXP-2024-001",
    "frais_annexes": 5000,
    "code_suivi_expedition": "TRACK-123"
  }],
  "at": "2024-07-14 18:00:00"
}
```

**Pages qui écoutent:**
- ✅ Dashboard
- ✅ Expeditions

**Handler:**
```javascript
onExpeditionFraisUpdated: (data, meta) => {
    console.log('Frais mis à jour:', meta.references);
    // Votre logique ici
}
```

---

## 📦 Colis

### `Colis.controlled`
**Quand:** Le backoffice valide le contrôle qualité

**Payload:**
```json
{
  "model": "Colis",
  "action": "controlled",
  "ids": ["colis-1", "colis-2"],
  "references": ["COL-001", "COL-002"],
  "count": 2,
  "changes": {
    "is_controlled": true
  },
  "data": [{
    "id": "colis-1",
    "code_colis": "COL-001",
    "is_controlled": true,
    "controlled_at": "2024-07-14 19:00:00"
  }],
  "at": "2024-07-14 19:00:00"
}
```

**Pages qui écoutent:**
- ✅ Dashboard

**Handler:**
```javascript
onColisControlled: (data, meta) => {
    console.log('Colis contrôlés:', meta.count);
    // Votre logique ici
}
```

---

### `Colis.blocked`
**Quand:** Le backoffice bloque un ou plusieurs colis

**Payload:**
```json
{
  "model": "Colis",
  "action": "blocked",
  "ids": ["colis-1"],
  "references": ["COL-001"],
  "count": 1,
  "changes": {
    "is_blocked": true,
    "motif_blocage": "Colis endommagé"
  },
  "data": [{
    "id": "colis-1",
    "code_colis": "COL-001",
    "is_blocked": true,
    "motif_blocage": "Colis endommagé"
  }],
  "at": "2024-07-14 20:00:00"
}
```

**Pages qui écoutent:**
- ✅ Dashboard

**Handler:**
```javascript
onColisBlocked: (data, meta) => {
    console.log('Colis bloqués:', meta.count);
    // Votre logique ici
}
```

---

### `Colis.unblocked`
**Quand:** Le backoffice débloque des colis

**Pages qui écoutent:**
- ✅ Dashboard

**Handler:**
```javascript
onColisUnblocked: (data, meta) => {
    console.log('Colis débloqués:', meta.count);
    // Votre logique ici
}
```

---

### `Colis.assigned`
**Quand:** Des colis sont assignés à votre agence comme destination

**Pages qui écoutent:**
- ✅ Dashboard

**Handler:**
```javascript
onColisAssigned: (data, meta) => {
    console.log('Colis assignés:', meta.count);
    // Votre logique ici
}
```

---

### `Colis.received_by_backoffice`
**Quand:** Le backoffice confirme avoir reçu des colis destinés à votre agence

**Pages qui écoutent:**
- ✅ Dashboard

**Handler:**
```javascript
onColisReceivedByBackoffice: (data, meta) => {
    console.log('Colis reçus par backoffice:', meta.count);
    // Votre logique ici
}
```

---

## 🏢 Agence

### `Agence.status_changed`
**Quand:** Le backoffice active/désactive votre agence

**Payload:**
```json
{
  "model": "Agence",
  "action": "status_changed",
  "ids": ["agence-1"],
  "references": ["AG-001"],
  "count": 1,
  "changes": {
    "actif": false
  },
  "data": [{
    "id": "agence-1",
    "nom": "Agence Principale",
    "actif": false
  }],
  "at": "2024-07-14 21:00:00"
}
```

**Pages qui écoutent:**
- ✅ Dashboard → Déconnexion forcée si `actif: false`

**Handler:**
```javascript
onAgenceStatusChanged: (data, meta) => {
    const agence = data[0];
    if (!agence.actif) {
        // Déconnecter l'utilisateur
        showToast('Votre agence a été désactivée', 'error');
        setTimeout(() => {
            localStorage.clear();
            navigate('/login');
        }, 3000);
    }
}
```

⚠️ **IMPORTANT:** Si votre agence est désactivée, déconnectez immédiatement l'utilisateur.

---

## 💰 Tarifs

### `TarifSimple.updated` / `TarifGroupage.updated`
**Quand:** Le backoffice modifie les tarifs de base

**Payload:**
```json
{
  "model": "TarifSimple",
  "action": "updated",
  "ids": ["tarif-1"],
  "references": [],
  "count": 1,
  "changes": {
    "montant_base": 5000,
    "pourcentage_prestation": 15
  },
  "data": [{
    "id": "tarif-1",
    "montant_base": 5000,
    "pourcentage_prestation": 15
  }],
  "at": "2024-07-14 22:00:00"
}
```

**Pages qui écoutent:**
- ✅ Dashboard → Info utilisateur

**Handler:**
```javascript
onTarifsUpdated: (data, meta) => {
    console.log('Tarifs mis à jour:', meta.model);
    showToast('Les tarifs ont été mis à jour', 'info');
    // Recharger les tarifs si nécessaire
}
```

---

## 📄 Utilisation dans les pages

### Template complet d'utilisation:

```javascript
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuth } from "../hooks/useAuth";
import { showToast } from "../utils/toast";

const MaPage = () => {
    const { currentUser } = useAuth();
    
    // Activer WebSocket avec tous les handlers
    useWebSocket(
        currentUser?.agence_id,
        {
            // Expéditions
            onExpeditionCreated: (data, meta) => {
                console.log('🎉 Nouvelle expédition:', meta.references);
                showToast(`${meta.count} nouvelle(s) expédition(s)`, 'success');
                // Votre logique de refresh
            },
            
            onExpeditionStatusChanged: (data, meta) => {
                console.log('📦 Statut changé:', meta.references);
                // Votre logique
            },
            
            onExpeditionPaymentConfirmed: (data, meta) => {
                console.log('💰 Paiement:', meta.references);
                // Votre logique
            },
            
            onExpeditionFraisUpdated: (data, meta) => {
                console.log('💵 Frais:', meta.references);
                // Votre logique
            },
            
            // Colis
            onColisControlled: (data, meta) => {
                console.log('✅ Colis contrôlés:', meta.count);
                // Votre logique
            },
            
            onColisBlocked: (data, meta) => {
                console.log('🚫 Colis bloqués:', meta.count);
                // Votre logique
            },
            
            onColisUnblocked: (data, meta) => {
                console.log('✅ Colis débloqués:', meta.count);
                // Votre logique
            },
            
            onColisAssigned: (data, meta) => {
                console.log('📍 Colis assignés:', meta.count);
                // Votre logique
            },
            
            onColisReceivedByBackoffice: (data, meta) => {
                console.log('📥 Colis reçus:', meta.count);
                // Votre logique
            },
            
            // Agence
            onAgenceStatusChanged: (data, meta) => {
                console.log('🏢 Statut agence:', data[0].actif);
                // Votre logique
            },
            
            // Tarifs
            onTarifsUpdated: (data, meta) => {
                console.log('💲 Tarifs mis à jour:', meta.model);
                // Votre logique
            }
        },
        !!currentUser?.agence_id // Activer si l'utilisateur est connecté
    );
    
    return (
        // Votre JSX
    );
};
```

### Utilisation simplifiée (refresh générique):

```javascript
import { useWebSocketRefresh } from "../hooks/useWebSocket";

const MaPage = () => {
    const { currentUser } = useAuth();
    
    const handleUpdate = (data, meta) => {
        console.log('📡 Mise à jour reçue:', meta);
        // Recharger vos données
        refreshData();
    };
    
    useWebSocketRefresh(
        currentUser?.agence_id,
        handleUpdate,
        !!currentUser?.agence_id
    );
    
    return (
        // Votre JSX
    );
};
```

---

## 🎯 Bonnes pratiques

### ✅ À faire:
- Toujours vérifier `currentUser?.agence_id` avant d'activer le WebSocket
- Logger les événements reçus pour le debugging
- Utiliser des refresh silencieux (`silentRefresh: true`) pour ne pas perturber l'UX
- Afficher des toasts discrets pour informer l'utilisateur
- Vérifier les conditions (ex: `statut_expedition === 'en_attente'`) avant d'agir

### ❌ À éviter:
- N'activez pas le WebSocket si l'utilisateur n'est pas connecté
- Ne faites pas de re-fetch complet à chaque événement (trop lourd)
- N'affichez pas de modal intrusif à chaque notification
- Ne créez pas plusieurs instances WebSocket (une seule suffit)

---

## 📊 Statistiques d'utilisation

| Événement | Fréquence | Impact UX |
|-----------|-----------|-----------|
| `Expedition.created` | Moyenne | ⭐⭐⭐ Important |
| `Expedition.status_changed` | Élevée | ⭐⭐ Moyen |
| `Expedition.payment_confirmed` | Moyenne | ⭐⭐⭐ Important |
| `Colis.controlled` | Moyenne | ⭐⭐ Moyen |
| `Colis.blocked` | Faible | ⭐⭐⭐ Important |
| `Agence.status_changed` | Très faible | ⭐⭐⭐⭐⭐ Critique |
| `Tarifs.updated` | Faible | ⭐⭐ Moyen |

---

**📡 Tous les événements sont maintenant documentés et implémentés ! 🎉**
