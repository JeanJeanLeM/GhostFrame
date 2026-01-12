# 🎮 GhostFrame

Un jeu de déduction multi-joueurs en temps réel où civils et imposteurs s'affrontent, tandis que le Ghost Frame tente de survivre sans connaître son rôle !

## 🎯 À propos

GhostFrame est une application web de jeux de soirée multi-joueurs développée avec Firebase et TypeScript. Le jeu principal est un jeu de rôles déductif où les joueurs doivent découvrir qui est qui, tandis qu'un joueur mystère (le Ghost Frame) doit survivre sans connaître son propre rôle.

## ⚙️ Pile technologique

- **Frontend**: Vite + TypeScript + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **Temps réel**: Firestore onSnapshot
- **Tests**: Vitest
- **Utilitaires**: QRCode, UUID

### Versions minimales

- Vite ^5.0
- Firebase ^10.0
- TypeScript ^5.0
- Node.js 18+

## 🚀 Démarrage rapide

### 1. Installation

```bash
# Cloner le repository
git clone https://github.com/JeanJeanLeM/GhostFrame.git
cd GhostFrame

# Installer les dépendances
npm install
```

### 2. Configuration Firebase

1. Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
2. Activez Authentication (méthode anonyme)
3. Activez Firestore Database
4. Copiez la configuration Firebase

```bash
# Créer le fichier de configuration
cp env.example .env

# Éditer .env avec vos vraies valeurs Firebase
# Ouvrez .env et remplissez les variables d'environnement
```

### 3. Configuration Firestore

```bash
# Installer Firebase CLI (si pas déjà installé)
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser le projet (optionnel si déjà fait)
firebase init

# Déployer les règles Firestore
firebase deploy --only firestore:rules
```

### 4. Lancement en développement

```bash
# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173` (ou le port indiqué par Vite)

## 🎮 Jeux disponibles

### Ghost Frame
- **ID**: `ghost-frame`
- **Description**: Un jeu de rôles déductif où civils et imposteurs s'affrontent, tandis que le Ghost Frame tente de survivre sans connaître son rôle !
- **Joueurs**: 3-10
- **Durée**: ~15 min
- **Complexité**: Moyenne

### Jeu de devinettes
- **ID**: `guessing-game`
- **Description**: Devinez le nombre secret entre 1 et 100
- **Joueurs**: 2-6
- **Durée**: ~10 min

## 🛠️ Développement

### Structure du projet

```
src/
├── components/          # Composants UI réutilisables
│   ├── App.ts          # Application principale
│   ├── GameSelector.ts # Sélecteur de jeux
│   ├── GameLobby.ts    # Lobby de partie
│   └── GameView.ts     # Vue de jeu
├── core/               # Modules core
│   ├── auth.ts         # Authentification
│   ├── firebase.ts     # Configuration Firebase
│   ├── gameSession.ts  # Gestion des sessions
│   ├── router.ts       # Routage
│   └── errorHandler.ts # Gestion d'erreurs
├── games/              # Modules de jeux
│   ├── _template/      # Template pour créer de nouveaux jeux
│   ├── guessing-game/  # Jeu de devinettes
│   ├── mister-white/   # Ghost Frame (jeu principal)
│   └── gameRegistry.ts # Registre des jeux
├── utils/              # Utilitaires
│   ├── gameCode.ts     # Codes de partie
│   ├── qrCode.ts       # Génération QR
│   └── presence.ts     # Suivi de présence
├── types/              # Types TypeScript
└── test/               # Tests unitaires
```

### Commandes disponibles

```bash
# Développement
npm run dev              # Démarrer le serveur de développement

# Build
npm run build            # Compiler pour la production
npm run preview          # Prévisualiser le build de production

# Tests
npm test                 # Lancer les tests
npm run test:ui          # Tests avec interface UI

# Firebase
npm run firebase:emulators  # Démarrer les émulateurs Firebase
npm run firebase:deploy     # Déployer sur Firebase
```

## 🔐 Sécurité

### Règles Firestore

Les règles de sécurité garantissent que:
- Seuls les utilisateurs authentifiés peuvent accéder aux parties
- Les joueurs ne peuvent modifier que leurs propres données
- L'hôte peut contrôler le statut de la partie
- Les données sensibles sont protégées

### Authentification

- Connexion anonyme par défaut
- Possibilité d'ajouter Google Auth ou email/password
- Gestion automatique des sessions
- Suivi de présence en temps réel

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm test -- --watch

# Tests avec interface UI
npm run test:ui

# Coverage
npm test -- --coverage
```

## 📦 Déploiement

### Développement

```bash
# Émulateurs Firebase (optionnel)
npm run firebase:emulators

# Serveur de développement
npm run dev
```

### Production

```bash
# Build de production
npm run build

# Déploiement Firebase
npm run firebase:deploy

# Ou déploiement complet
firebase deploy
```

### Variables d'environnement

```bash
# .env (développement)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_APP_ENV=development
VITE_BASE_URL=http://localhost:5173
```

## 📚 Documentation

- **Guide de création de jeux**: `GAME_CREATION_GUIDE.md`
- **Procédure de création**: `GAME_CREATION_PROCEDURE.md`
- **Guide MODE AGENT**: `AGENT_MODE_GUIDE.md`
- **Démarrage rapide**: `QUICK_START.md`

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

### Guidelines

1. Suivre les conventions TypeScript
2. Ajouter des tests pour les nouvelles fonctionnalités
3. Documenter les APIs publiques
4. Utiliser les hooks de commit (lint, format)

### Structure des commits

```bash
feat: ajouter nouveau jeu de cartes
fix: corriger bug de synchronisation
docs: mettre à jour README
test: ajouter tests pour gameLogic
```

## 📄 Licence

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/JeanJeanLeM/GhostFrame/issues)
- **Discussions**: [GitHub Discussions](https://github.com/JeanJeanLeM/GhostFrame/discussions)

---

**Créé avec ❤️ pour la communauté des développeurs de jeux**
