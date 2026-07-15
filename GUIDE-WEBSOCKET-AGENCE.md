# Guide WebSocket — Appli Agence

Ce document explique comment te connecter au serveur temps réel du backend pour
recevoir les mises à jour en direct (colis, expéditions, tarifs...) sans avoir à
raffraîchir ou re-fetch en boucle.

## 1. Installer les dépendances

```bash
npm install laravel-echo pusher-js
```

## 2. Se connecter

Le serveur WebSocket est **séparé** de l'API HTTP classique — c'est un autre
port/tunnel. :"https://974a-102-212-190-197.ngrok-free.app"
- l'URL de l'API (`VITE_API_URL`, déjà en ta possession)
- l'URL/host du serveur WebSocket (`VITE_PUSHER_HOST`)
- la clé d'application (`VITE_PUSHER_APP_KEY`)

Ajoute dans ton `.env` :

```env
VITE_PUSHER_APP_KEY=tourshop-key
VITE_PUSHER_HOST=<host communiqué>
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
VITE_PUSHER_APP_CLUSTER=mt1
```

Crée un fichier `src/services/echo.js` (adapte à ton client API existant — il
doit juste envoyer le header `Authorization: Bearer <token>`) :

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from './api'; // ton instance axios existante, avec le token en header

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho() {
  if (echoInstance) return echoInstance;

  const token = localStorage.getItem('token'); // ou ta clé de stockage du token
  if (!token) return null;

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    wssPort: import.meta.env.VITE_PUSHER_PORT,
    forceTLS: import.meta.env.VITE_PUSHER_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
    // Important : le backend authentifie par token (Bearer), pas par cookie/session.
    // Il faut un authorizer custom qui réutilise ton client HTTP habituel.
    authorizer: (channel) => ({
      authorize(socketId, callback) {
        api
          .post('/broadcasting/auth', { socket_id: socketId, channel_name: channel.name })
          .then((res) => callback(false, res.data))
          .catch((err) => callback(true, err));
      },
    }),
  });

  return echoInstance;
}
```

## 3. S'abonner et écouter

Ton appli écoute le canal privé de **ton agence**. Un seul event à écouter,
peu importe ce qui a changé :

```js
import { getEcho } from './services/echo';

const echo = getEcho();
const agenceId = /* l'id de l'agence de l'utilisateur connecté */;

echo.private(`agence.${agenceId}`)
  .listen('.model.updated', (payload) => {
    console.log(payload);
    // payload.model, payload.action, payload.data, ... (voir forme ci-dessous)
  });
```

Pense à te désabonner à la déconnexion : `echo.leave('agence.' + agenceId)`.

## 4. La forme du message reçu (payload)

**Toujours la même structure**, quel que soit ce qui a changé :

```jsonc
{
  "model": "Colis",             // quelle entité a changé — voir tableau ci-dessous
  "action": "controlled",       // quel type de changement — voir tableau ci-dessous
  "ids": ["uuid-1", "uuid-2"],  // toujours un tableau, même pour 1 seul élément
  "references": ["COL-001"],    // identifiant lisible (reference ou code_colis), même ordre que ids
  "count": 2,                   // nombre d'éléments concernés
  "changes": { "motif_blocage": "Colis endommagé" }, // champs qui ont changé, ou null
  "data": [                     // toujours un tableau, un ou plusieurs éléments complets/partiels
    { "id": "uuid-1", "code_colis": "COL-001", "is_blocked": true, ... }
  ],
  "at": "2026-07-11 14:32:00"   // horodatage du changement
}
```

**Conseil** : filtre sur `payload.model` et `payload.action` pour ne réagir
qu'à ce qui t'intéresse, ignore le reste. `payload.data` contient toujours un
tableau (même pour un seul élément) — pense à des changements groupés (ex. 50
colis contrôlés d'un coup).

## 5. Les entités (`model`) et actions (`action`) disponibles

Ce sont les tables de la base de données concernées, et les verbes qui peuvent
leur arriver. Cette liste s'enrichira avec le temps — si tu reçois un
`model`/`action` que tu ne connais pas encore, ignore-le simplement (ne fais
pas planter ton code sur une valeur inconnue).

### `model: "Expedition"`

| `action` | Quand | Champs utiles dans `data[]` |
|---|---|---|
| `created` | ✅ **MAINTENANT IMPLÉMENTÉ** — Une nouvelle expédition vient d'être créée dans ton agence (par toi ou un collègue) | Objet expédition complet, y compris `colis[]` (déjà créés et tarifés à ce stade) |
| `status_changed` | Le statut de l'expédition change (acceptée, en transit, livrée, etc.) | `id`, `reference`, `statut_expedition` |
| `payment_confirmed` | Un paiement vient d'être enregistré sur l'expédition | `id`, `reference`, `payment_object`, `amount`, `statut_paiement` |
| `frais_annexes_updated` | Le backoffice vient de fixer/modifier les frais annexes à collecter | `id`, `reference`, `frais_annexes`, `code_suivi_expedition` |

⚠️ **Cas important pour `created`**: C'est ce qui te permet d'afficher en temps réel qu'un collègue de ton agence vient d'enregistrer une expédition (utile si plusieurs agents sont connectés en même temps sur le même poste/agence) — insère l'élément dans ta liste locale plutôt que de tout re-fetcher.

### `model: "Colis"`

| `action` | Quand | Champs utiles dans `data[]` |
|---|---|---|
| `controlled` | Le backoffice valide le contrôle qualité d'un ou plusieurs colis | `id`, `code_colis`, `is_controlled`, `controlled_at`, ... |
| `blocked` | Le backoffice bloque un ou plusieurs colis | `id`, `code_colis`, `is_blocked`, `motif_blocage` |
| `unblocked` | Le backoffice débloque un ou plusieurs colis | `id`, `code_colis`, `is_blocked` (false) |
| `assigned` | Colis assignés à ton agence comme destination | `id`, `code_colis`, `agence_destination_id` |
| `received_by_backoffice` | Le backoffice confirme avoir reçu des colis destinés à ton agence | `id`, `code_colis`, `is_received_by_backoffice`, `received_at_backoffice` |

### `model: "Agence"`

| `action` | Quand | Champs utiles dans `data[]` |
|---|---|---|
| `status_changed` | Ton agence vient d'être activée ou désactivée par le backoffice | `id`, `actif` |

⚠️ Cas important : si tu reçois `{ model: "Agence", action: "status_changed", data: [{ actif: false }] }`
pour ta propre agence, ton compte vient d'être désactivé — prévois une
réaction (déconnexion forcée, message de blocage), le backend refusera aussi
les futurs appels API entretemps.

### `model: "TarifSimple"` / `model: "TarifGroupage"`

| `action` | Quand | Champs utiles dans `data[]` |
|---|---|---|
| `updated` | Le backoffice modifie un tarif de base qui impacte tes tarifs d'agence | `id`, `montant_base`, `pourcentage_prestation` |

Si tu reçois ça, tes prix affichés (simulation, grilles tarifaires) sont
potentiellement obsolètes — pense à recharger tes tarifs d'agence depuis
l'API à ce moment-là plutôt que de patcher localement.

## 6. Besoin d'un nouveau cas ?

Si tu as besoin d'un event que le backend n'émet pas encore (ex. une nouvelle
action sur une entité), demande — c'est un ajout simple côté backend (une seule
ligne d'appel à un helper existant), pas une nouvelle architecture.
