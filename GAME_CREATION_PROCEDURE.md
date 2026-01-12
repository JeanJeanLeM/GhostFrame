# 🎮 Procédure de création de jeu - MODE AGENT

Cette procédure guide Cursor en MODE AGENT pour créer automatiquement un nouveau jeu à partir d'un artefact HTML Claude.

## 🎯 Objectif

Transformer un artefact HTML Claude en module de jeu complet intégré dans le template Party Games, en utilisant l'intelligence de Cursor pour automatiser le processus.

## 📋 Inputs requis

### Input principal
- **Artefact HTML** : Fichier HTML créé avec Claude contenant votre jeu
- **Nom du jeu** : Nom descriptif pour le jeu (ex: "Quiz Party", "Dessine et Devine")

### Informations optionnelles
- **Type de jeu** : quiz, drawing, cards, word, numbers, party (détecté automatiquement)
- **Nombre de joueurs** : min/max (estimé automatiquement)
- **Durée estimée** : en minutes (calculée automatiquement)

## 🤖 Instructions pour MODE AGENT

### Phase 1 : Analyse de l'artefact HTML

**AGENT TASK**: Analyser le fichier HTML fourni et extraire :

1. **Métadonnées du jeu**
   - Titre (balise `<title>` ou premier `<h1>`)
   - Description (meta description ou premier `<p>`)
   - Type de jeu basé sur le contenu

2. **Éléments interactifs**
   - Compter les `<button>`, `<input>`, `<canvas>`
   - Détecter les event listeners JavaScript
   - Identifier les mécaniques de jeu

3. **Estimation de complexité**
   - Simple : < 5 éléments interactifs
   - Moyen : 5-15 éléments interactifs  
   - Complexe : > 15 éléments interactifs

4. **Configuration recommandée**
   - Nombre de joueurs selon le type
   - Durée selon la complexité
   - Catégories appropriées

### Phase 2 : Génération de la structure

**AGENT TASK**: Créer la structure complète du jeu :

1. **Copier le template de base**
   ```
   src/games/_template/ → src/games/{game-id}/
   ```

2. **Générer l'ID du jeu**
   - Convertir le nom en kebab-case
   - Vérifier l'unicité

3. **Personnaliser game.config.ts**
   ```typescript
   export const gameConfig: GameConfig = {
     id: '{game-id}',
     name: '{game-name}',
     description: '{extracted-description}',
     minPlayers: {estimated-min},
     maxPlayers: {estimated-max},
     estimatedDuration: {estimated-duration},
     difficulty: '{estimated-difficulty}',
     category: ['{detected-categories}']
   }
   ```

### Phase 3 : Définition de l'état du jeu

**AGENT TASK**: Analyser la logique du jeu HTML et créer les interfaces TypeScript

1. **Analyser les variables JavaScript** dans l'artefact
2. **Identifier les états du jeu** (score, tour, phase, données)
3. **Générer l'interface GameState**
   ```typescript
   export interface {PascalCase}GameState {
     currentTurn: number
     currentPlayerId: string
     phase: 'setup' | 'playing' | 'finished'
     gameData: {
       // Extraire de l'analyse HTML
     }
     scores: Record<string, number>
   }
   ```

4. **Définir les actions possibles**
   ```typescript
   export interface {PascalCase}GameAction {
     type: 'ACTION_1' | 'ACTION_2' | 'ACTION_3'
     playerId: string
     data?: any
   }
   ```

### Phase 4 : Implémentation de la logique

**AGENT TASK**: Convertir la logique JavaScript en logique multi-joueurs

1. **Analyser les fonctions JavaScript** de l'artefact
2. **Identifier les règles du jeu**
3. **Implémenter les méthodes requises**
   - `validateMove()` : Validation des actions
   - `processMove()` : Traitement des actions
   - `checkWinCondition()` : Conditions de victoire
   - `getNextPlayer()` : Gestion des tours
   - `initializeGameState()` : État initial

### Phase 5 : Création de l'interface utilisateur

**AGENT TASK**: Adapter l'HTML/CSS pour l'architecture multi-joueurs

1. **Extraire les styles CSS** de l'artefact
2. **Adapter pour Tailwind CSS** (convertir les styles custom)
3. **Créer les méthodes de rendu**
   - `renderGameBoard()` : Plateau principal
   - `renderPlayerActions()` : Actions disponibles
   - `renderScoreboard()` : Tableau des scores

4. **Gérer la responsivité** mobile/desktop

### Phase 6 : Intégration et tests

**AGENT TASK**: Finaliser l'intégration

1. **Mettre à jour gameRegistry.ts**
   - Ajouter l'import du nouveau module
   - Enregistrer le jeu

2. **Créer les tests de base**
   - Tests unitaires pour la logique
   - Tests d'intégration basiques

3. **Valider le fonctionnement**
   - Le jeu apparaît dans la liste
   - Création de partie possible
   - Logique de base fonctionnelle

## 📊 Mapping des types de jeux

### Quiz/Trivia
- **Détection** : mots-clés "quiz", "question", "answer"
- **Config** : 2-8 joueurs, 10-20 min, catégories ["trivia", "party"]
- **État** : questions, réponses, scores, timer
- **Actions** : SUBMIT_ANSWER, NEXT_QUESTION

### Dessin
- **Détection** : balise `<canvas>`, mots-clés "draw", "paint"
- **Config** : 2-6 joueurs, 15-25 min, catégories ["drawing", "creative"]
- **État** : dessins, devinettes, timer
- **Actions** : SUBMIT_DRAWING, SUBMIT_GUESS

### Cartes
- **Détection** : mots-clés "card", "deck", "hand"
- **Config** : 2-4 joueurs, 10-30 min, catégories ["cards", "strategy"]
- **État** : deck, mains, défausse
- **Actions** : PLAY_CARD, DRAW_CARD

### Mots
- **Détection** : mots-clés "word", "letter", "spell"
- **Config** : 2-6 joueurs, 10-15 min, catégories ["word", "language"]
- **État** : mots, lettres, indices
- **Actions** : SUBMIT_WORD, GIVE_CLUE

## 🔧 Règles de conversion

### HTML → Multi-joueurs
1. **Variables globales** → État du jeu partagé
2. **Fonctions de jeu** → Méthodes de logique
3. **Event listeners** → Actions de jeu
4. **Affichage local** → Rendu synchronisé

### CSS → Tailwind
1. **Classes custom** → Classes Tailwind équivalentes
2. **Styles inline** → Classes utilitaires
3. **Animations CSS** → Animations Tailwind
4. **Media queries** → Classes responsives

### JavaScript → TypeScript
1. **Variables non typées** → Interfaces strictes
2. **Fonctions** → Méthodes de classe
3. **Callbacks** → Événements système
4. **DOM direct** → Rendu contrôlé

## ✅ Critères de validation

### Fonctionnel
- [ ] Le jeu apparaît dans la liste des jeux
- [ ] Création de partie fonctionnelle
- [ ] Lobby multi-joueurs opérationnel
- [ ] Logique de base implémentée
- [ ] Interface responsive

### Technique
- [ ] Types TypeScript corrects
- [ ] Pas d'erreurs de compilation
- [ ] Tests unitaires passent
- [ ] Code suit les conventions
- [ ] Performance acceptable

### Expérience utilisateur
- [ ] Interface intuitive
- [ ] Feedback visuel approprié
- [ ] Gestion d'erreurs gracieuse
- [ ] Compatible mobile/desktop
- [ ] Synchronisation temps réel

## 🚀 Commandes de validation

```bash
# Vérifier la compilation
npm run build

# Lancer les tests
npm test

# Tester en développement
npm run dev

# Vérifier le style de code
npm run lint
```

## 📝 Template de rapport

À la fin de la procédure, générer un rapport :

```markdown
# Rapport de création - {Game Name}

## ✅ Résumé
- **Jeu créé** : {game-name}
- **ID** : {game-id}
- **Type détecté** : {game-type}
- **Complexité** : {complexity}

## 📊 Analyse de l'artefact
- **Éléments interactifs** : {count}
- **Lignes de code** : {lines}
- **Fonctionnalités détectées** : {features}

## 🎯 Configuration générée
- **Joueurs** : {min}-{max}
- **Durée** : {duration} min
- **Difficulté** : {difficulty}
- **Catégories** : {categories}

## 🔧 Implémentation
- **Fichiers créés** : {file-count}
- **Lignes générées** : {generated-lines}
- **Tests créés** : {test-count}

## 🚀 Prochaines étapes
1. Tester le jeu en mode développement
2. Affiner la logique si nécessaire
3. Améliorer l'interface utilisateur
4. Ajouter des fonctionnalités avancées
```

---

**MODE AGENT** : Suivez cette procédure étape par étape pour transformer automatiquement un artefact HTML Claude en module de jeu complet.
