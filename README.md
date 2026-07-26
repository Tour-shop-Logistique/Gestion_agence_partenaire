# Tour Shop — Application Agence Partenaire

Portail web destiné aux agences partenaires de **Tour Shop Logistique** : création et suivi des expéditions, réception/remise de colis, tarification, comptabilité et administration de l'agence.

## Stack technique

- **React** `19.1.1` (Vite `7.1.2`)
- **State management** : Redux Toolkit `2.11.0`
- **Styling** : Tailwind CSS `3.4.17`
- **Routing** : React Router `7.8.2`
- **Icônes** : @heroicons/react, lucide-react
- **Temps réel** : Laravel Echo + Pusher-js `8.5.0`, connecté à un serveur [Laravel Reverb](https://laravel.com/docs/10.x/reverb) self-hosted
- **Scan QR** : html5-qrcode, qrcode.react
- **Export** : jsPDF + jspdf-autotable, xlsx
- **Notifications** : sonner (toasts) + API Notification native du navigateur

## Fonctionnalités principales

- **Expéditions** : création (simple et premium), suivi, gestion des demandes clients
- **Colis** : réception, colis à réceptionner, retrait
- **Tarification** : grilles simples et groupées
- **Comptabilité** : transactions, rapports
- **Agents** : gestion des comptes de l'agence
- **Notifications** : annonces reçues du backoffice en temps réel (toast + notification système du navigateur)
- **Dashboard** : vue d'ensemble de l'activité de l'agence

## Installation

```bash
npm install
cp .env.example .env
```

Variables d'environnement requises (voir `.env.example`) :
- `VITE_API_URL` — URL **racine** du backend (sans suffixe `/api`, ajouté automatiquement par le code)
- `VITE_APP_VERSION` — force la mise à jour du cache applicatif sur toutes les machines
- `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME` — doivent correspondre aux `REVERB_*` du backend

## Développement

```bash
npm run dev
```

En dev, les appels `/api/*` et `/storage/*` passent par le proxy Vite (voir `vite.config.js`) vers `VITE_API_URL`.

## Build

```bash
npm run build
```

Configuré pour un déploiement sur Vercel (`vercel.json`) ou Netlify (`netlify.toml`).

## Documentation

Voir le dossier [`doc/`](doc/) pour la documentation complémentaire (WebSocket, scanner QR, dashboard, historique des évolutions). [SECURITY.md](SECURITY.md) reste à la racine.
