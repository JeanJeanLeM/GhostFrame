# 🎮 GhostFrame

Un jeu de déduction multi-joueurs en temps réel où civils et imposteurs s'affrontent, tandis que le Ghost Frame tente de survivre sans connaître son rôle !

Site public : https://ghostframe-mocha.vercel.app (Vercel, équipe Charles' projects). Les pull requests reçoivent une preview.

## 🎯 À propos

GhostFrame est un jeu de soirée joué sur un seul appareil, passé de main en main. Il n'utilise pas de base de données. Le jeu principal est un jeu de rôles déductif où les joueurs doivent découvrir qui est qui, tandis qu'un joueur mystère (le Ghost Frame) doit survivre sans connaître son propre rôle.

## ⚙️ Pile technologique

- **Frontend**: Vite + TypeScript + Tailwind CSS
- **Hébergement**: Vercel (fichiers statiques)
- **Tests**: Vitest
- **Utilitaires**: QRCode, UUID

Le jeu public est en mode un seul appareil. Aucune base de données.

### Versions minimales

- Vite ^5.0
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

### 2. Lancement en développement

Aucun fichier `.env` n'est nécessaire.

```bash
# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:3000`.

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
│   └── GameSelector.ts # Sélecteur de jeux (non monté par l'app)
├── core/               # Modules core
│   ├── router.ts       # Routage (non démarré par l'app)
│   └── errorHandler.ts # Gestion d'erreurs
├── games/              # Modules de jeux
│   ├── _template/      # Template pour créer de nouveaux jeux
│   ├── guessing-game/  # Jeu de devinettes
│   ├── mister-white/   # Ghost Frame (jeu principal)
│   └── gameRegistry.ts # Registre des jeux
├── utils/              # Utilitaires
│   ├── gameCode.ts     # Codes de partie
│   └── qrCode.ts       # Génération QR
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
```

## 🔐 Données

La partie en cours vit dans la page. Le compteur de parties jouées est dans `localStorage` (`ghostframe-games-played`). Il n'y a pas de compte ni de base de données.

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
npm run dev
```

### Production

Le site public est https://ghostframe-mocha.vercel.app (Vercel, équipe Charles' projects). La branche `main` est la production. Chaque pull request reçoit une preview.

```bash
npm run build
```

### Variables d'environnement

Aucune. Le jeu local et le site public fonctionnent sans `.env`. `env.example` ne fait que le rappeler.

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
