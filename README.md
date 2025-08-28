# 🚢 Agence Partenaire - Plateforme d'Exportation Ivoirienne

Une application web moderne pour la gestion des agences partenaires d'exportation en Côte d'Ivoire. Cette plateforme permet aux entreprises ivoiriennes de gérer leurs tarifs d'exportation, de présenter leurs services et de développer leurs activités internationales.

## ✨ Fonctionnalités

### 🔐 Authentification
- **Inscription** : Création de compte agence avec validation complète
- **Connexion** : Authentification sécurisée avec gestion des sessions
- **Gestion de profil** : Modification des informations d'agence

### 💰 Gestion des Tarifs
- **Ajout de tarifs** : Configuration de tarifs par destination, poids et type de service
- **Modification** : Mise à jour des tarifs existants
- **Suppression** : Gestion complète du cycle de vie des tarifs
- **Types de services** : Express, Standard, Maritime, Terrestre, Aérien, Multimodal
- **Produits diversifiés** : Textiles, produits manufacturés, cosmétiques, artisanat, etc.

### 🌍 Consultation Publique
- **Tarifs publics** : Affichage des tarifs disponibles pour consultation
- **Filtres avancés** : Recherche par destination, poids, type de service, produit
- **Interface responsive** : Optimisé pour desktop et mobile

### 📊 Tableau de Bord
- **Vue d'ensemble** : Statistiques et métriques de l'agence
- **Gestion des tarifs** : Interface complète de gestion CRUD
- **Profil agence** : Modification des informations de l'entreprise

## 🛠️ Technologies Utilisées

- **Frontend** : React 18 + Vite
- **Styling** : Tailwind CSS
- **Routing** : React Router DOM
- **State Management** : React Context API
- **Stockage** : LocalStorage (temporaire)
- **Build Tool** : Vite
- **Package Manager** : npm

## 📁 Structure du Projet

```
agence-partenaire/
├── public/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Header.jsx
│   │   ├── Input.jsx
│   │   └── Select.jsx
│   ├── contexts/           # Gestion d'état globale
│   │   ├── AuthContext.jsx
│   │   └── TariffContext.jsx
│   ├── data/              # Données mock
│   │   └── mockData.js
│   ├── pages/             # Pages de l'application
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Tariffs.jsx
│   ├── utils/             # Utilitaires et services
│   │   ├── api.js
│   │   └── validation.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd agence-partenaire
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir l'application**
   - L'application sera accessible à l'adresse : `http://localhost:5173`
   - Le serveur se relance automatiquement lors des modifications

### Scripts Disponibles

- `npm run dev` : Démarre le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run preview` : Prévisualise la version de production

## 📱 Pages Disponibles

### 🏠 Page d'Accueil (`/`)
- Présentation de la plateforme
- Statistiques d'exportation ivoirienne
- Témoignages d'entreprises
- Call-to-action pour l'inscription

### 📝 Inscription (`/register`)
- Formulaire complet d'inscription
- Validation en temps réel
- Champs : nom, email, mot de passe, localisation, horaires, téléphone, adresse, description

### 🔐 Connexion (`/login`)
- Authentification sécurisée
- Gestion des erreurs
- Redirection vers le tableau de bord

### 📊 Tableau de Bord (`/dashboard`)
- **Vue d'ensemble** : Statistiques et métriques
- **Gestion des tarifs** : CRUD complet des tarifs
- **Profil** : Modification des informations d'agence

### 💰 Tarifs Publics (`/tariffs`)
- Consultation des tarifs disponibles
- Filtres avancés
- Interface de recherche
- Statistiques d'exportation

## 🎨 Design et UX

### Palette de Couleurs
- **Couleurs ivoiriennes** : Orange, Jaune, Vert (drapeau ivoirien)
- **Couleurs neutres** : Gris pour le contenu
- **Couleurs d'accent** : Bleu pour les liens et actions

### Composants
- **Boutons** : Variantes primary, secondary, danger, outline
- **Cartes** : Conteneurs avec ombres et bordures arrondies
- **Formulaires** : Validation en temps réel avec messages d'erreur
- **Navigation** : Header responsive avec menu adaptatif

### Responsive Design
- **Mobile First** : Optimisé pour les petits écrans
- **Breakpoints** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation** : Menu hamburger sur mobile

## ⚙️ Configuration

### Tailwind CSS
- Configuration personnalisée avec couleurs primaires
- Composants utilitaires personnalisés
- Optimisation pour la production

### Vite
- Configuration de développement et production
- Optimisation des bundles
- Support des variables d'environnement

### PostCSS
- Intégration avec Tailwind CSS
- Autoprefixer pour la compatibilité navigateur

## 🔮 Fonctionnalités Avancées

### Gestion d'État
- **AuthContext** : Gestion de l'authentification globale
- **TariffContext** : Gestion des tarifs avec persistance locale
- **LocalStorage** : Persistance des données utilisateur

### Validation
- **Client-side** : Validation en temps réel des formulaires
- **Utilitaires** : Fonctions de validation réutilisables
- **Messages d'erreur** : Interface utilisateur claire

### Performance
- **Lazy Loading** : Chargement à la demande des composants
- **Optimisation des images** : Compression et formats modernes
- **Bundle Splitting** : Séparation du code pour un chargement optimisé

## 🚀 Évolutions Futures

### Backend Integration
- **Node.js + Express** : API RESTful
- **Supabase** : Base de données et authentification
- **Upload de fichiers** : Logos et images d'agence

### Fonctionnalités Avancées
- **Notifications** : Système de notifications en temps réel
- **Analytics** : Statistiques détaillées d'utilisation
- **API publique** : Accès aux tarifs via API
- **Multi-langues** : Support français/anglais

### Déploiement
- **Vercel** : Déploiement automatique
- **Netlify** : Alternative de déploiement
- **Docker** : Containerisation pour la production

## 🤝 Contribution

### Guidelines
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code
- **ESLint** : Linting JavaScript/React
- **Prettier** : Formatage automatique du code
- **Conventions** : Nommage cohérent des composants et fonctions

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- **Email** : support@agence-partenaire.ci
- **Documentation** : [Lien vers la documentation]
- **Issues** : [Lien vers les issues GitHub]

---

**Développé avec ❤️ pour les entreprises ivoiriennes d'exportation** 🇨🇮
