# 🎮 Guide de création de jeux

Ce guide détaillé vous accompagne dans la création d'un nouveau jeu pour le template Party Games.

## 📋 Prérequis

- Connaissance de base en TypeScript
- Compréhension des concepts de jeux multi-joueurs
- Familiarité avec Firebase Firestore

## 🎯 Exemple pas-à-pas : Créer un jeu de Pierre-Papier-Ciseaux

Nous allons créer ensemble un jeu de Pierre-Papier-Ciseaux multi-joueurs pour illustrer le processus.

### Étape 1 : Copier le template

```bash
cp -r src/games/_template src/games/rock-paper-scissors
```

### Étape 2 : Configuration du jeu

Éditez `src/games/rock-paper-scissors/game.config.ts`:

```typescript
import { GameConfig } from '@/types'

export const gameConfig: GameConfig = {
  id: 'rock-paper-scissors',
  name: 'Pierre-Papier-Ciseaux',
  description: 'Le classique jeu de Pierre-Papier-Ciseaux en multi-joueurs !',
  minPlayers: 2,
  maxPlayers: 8,
  estimatedDuration: 5,
  difficulty: 'easy',
  category: ['party', 'classic', 'quick']
}
```

### Étape 3 : Définir l'état du jeu

Éditez `src/games/rock-paper-scissors/game.state.ts`:

```typescript
import { Player } from '@/types'

export type RPSChoice = 'rock' | 'paper' | 'scissors'

export interface RPSGameState {
  currentTurn: number
  currentPlayerId: string
  phase: 'waiting' | 'choosing' | 'reveal' | 'finished'
  
  gameData: {
    // Choix des joueurs pour le tour actuel
    currentChoices: Record<string, RPSChoice>
    
    // Historique des manches
    roundHistory: Array<{
      roundNumber: number
      choices: Record<string, RPSChoice>
      winners: string[]
      timestamp: Date
    }>
    
    // Paramètres du jeu
    maxRounds: number
    currentRound: number
  }
  
  scores: Record<string, number>
  startedAt?: Date
  finishedAt?: Date
}

export function createInitialGameState(players: Player[]): RPSGameState {
  const initialState: RPSGameState = {
    currentTurn: 0,
    currentPlayerId: players[0].uid,
    phase: 'waiting',
    gameData: {
      currentChoices: {},
      roundHistory: [],
      maxRounds: 5,
      currentRound: 1
    },
    scores: {},
    startedAt: new Date()
  }
  
  // Initialiser les scores
  players.forEach(player => {
    initialState.scores[player.uid] = 0
  })
  
  return initialState
}

export interface RPSGameAction {
  type: 'MAKE_CHOICE' | 'START_GAME' | 'NEXT_ROUND'
  playerId: string
  data?: {
    choice?: RPSChoice
  }
}

export function validateGameAction(
  state: RPSGameState,
  action: RPSGameAction
): boolean {
  switch (action.type) {
    case 'START_GAME':
      return state.phase === 'waiting'
      
    case 'MAKE_CHOICE':
      if (state.phase !== 'choosing') return false
      if (state.gameData.currentChoices[action.playerId]) return false // Déjà choisi
      
      const choice = action.data?.choice
      return choice === 'rock' || choice === 'paper' || choice === 'scissors'
      
    case 'NEXT_ROUND':
      return state.phase === 'reveal'
      
    default:
      return false
  }
}
```

### Étape 4 : Implémenter la logique

Éditez `src/games/rock-paper-scissors/game.logic.ts`:

```typescript
import { GameLogic, Player } from '@/types'
import { 
  RPSGameState, 
  RPSGameAction, 
  RPSChoice,
  createInitialGameState, 
  validateGameAction 
} from './game.state'

export class RPSGameLogic implements GameLogic {
  
  validateMove(gameState: any, playerId: string, move: any): boolean {
    const state = gameState as RPSGameState
    const action = move as RPSGameAction
    
    return validateGameAction(state, { ...action, playerId })
  }
  
  processMove(gameState: any, playerId: string, move: any): RPSGameState {
    const state = { ...gameState } as RPSGameState
    const action = move as RPSGameAction
    
    switch (action.type) {
      case 'START_GAME':
        return this.processStartGame(state)
        
      case 'MAKE_CHOICE':
        return this.processMakeChoice(state, playerId, action.data?.choice!)
        
      case 'NEXT_ROUND':
        return this.processNextRound(state)
        
      default:
        throw new Error(`Action non reconnue: ${action.type}`)
    }
  }
  
  checkWinCondition(gameState: any): { 
    isFinished: boolean
    winner?: string
    scores?: Record<string, number> 
  } {
    const state = gameState as RPSGameState
    
    if (state.phase === 'finished') {
      return {
        isFinished: true,
        scores: state.scores,
        winner: this.determineOverallWinner(state.scores)
      }
    }
    
    // Vérifier si on a atteint le nombre maximum de manches
    if (state.gameData.currentRound > state.gameData.maxRounds) {
      return {
        isFinished: true,
        scores: state.scores,
        winner: this.determineOverallWinner(state.scores)
      }
    }
    
    return { isFinished: false }
  }
  
  getNextPlayer(gameState: any, currentPlayerId: string): string {
    // Dans Pierre-Papier-Ciseaux, tous les joueurs jouent simultanément
    return currentPlayerId
  }
  
  initializeGameState(players: Player[]): RPSGameState {
    const initialState = createInitialGameState(players)
    initialState.phase = 'choosing'
    return initialState
  }
  
  // --- Méthodes privées ---
  
  private processStartGame(state: RPSGameState): RPSGameState {
    state.phase = 'choosing'
    return state
  }
  
  private processMakeChoice(
    state: RPSGameState, 
    playerId: string, 
    choice: RPSChoice
  ): RPSGameState {
    // Enregistrer le choix du joueur
    state.gameData.currentChoices[playerId] = choice
    
    // Vérifier si tous les joueurs ont fait leur choix
    const playerIds = Object.keys(state.scores)
    const allPlayersChosen = playerIds.every(id => 
      state.gameData.currentChoices[id] !== undefined
    )
    
    if (allPlayersChosen) {
      // Passer à la phase de révélation
      state.phase = 'reveal'
      
      // Calculer les gagnants de cette manche
      const winners = this.calculateRoundWinners(state.gameData.currentChoices)
      
      // Attribuer les points
      winners.forEach(winnerId => {
        state.scores[winnerId] += 1
      })
      
      // Ajouter à l'historique
      state.gameData.roundHistory.push({
        roundNumber: state.gameData.currentRound,
        choices: { ...state.gameData.currentChoices },
        winners,
        timestamp: new Date()
      })
    }
    
    return state
  }
  
  private processNextRound(state: RPSGameState): RPSGameState {
    // Vérifier si c'était la dernière manche
    if (state.gameData.currentRound >= state.gameData.maxRounds) {
      state.phase = 'finished'
      state.finishedAt = new Date()
    } else {
      // Préparer la manche suivante
      state.gameData.currentRound += 1
      state.gameData.currentChoices = {}
      state.phase = 'choosing'
    }
    
    return state
  }
  
  private calculateRoundWinners(choices: Record<string, RPSChoice>): string[] {
    const playerIds = Object.keys(choices)
    const choiceValues = Object.values(choices)
    
    // Si tous les joueurs ont fait le même choix, égalité
    if (new Set(choiceValues).size === 1) {
      return [] // Pas de gagnant
    }
    
    // Si il y a les 3 choix, égalité
    if (new Set(choiceValues).size === 3) {
      return [] // Pas de gagnant
    }
    
    // Sinon, déterminer le choix gagnant
    const uniqueChoices = Array.from(new Set(choiceValues))
    const winningChoice = this.getWinningChoice(uniqueChoices[0], uniqueChoices[1])
    
    // Retourner les joueurs qui ont fait le choix gagnant
    return playerIds.filter(playerId => choices[playerId] === winningChoice)
  }
  
  private getWinningChoice(choice1: RPSChoice, choice2: RPSChoice): RPSChoice {
    const rules: Record<RPSChoice, RPSChoice> = {
      rock: 'scissors',     // Pierre bat Ciseaux
      paper: 'rock',        // Papier bat Pierre
      scissors: 'paper'     // Ciseaux bat Papier
    }
    
    if (rules[choice1] === choice2) {
      return choice1
    } else {
      return choice2
    }
  }
  
  private determineOverallWinner(scores: Record<string, number>): string | undefined {
    let maxScore = -1
    let winner: string | undefined
    
    Object.entries(scores).forEach(([playerId, score]) => {
      if (score > maxScore) {
        maxScore = score
        winner = playerId
      }
    })
    
    return winner
  }
}
```

### Étape 5 : Créer l'interface utilisateur

Éditez `src/games/rock-paper-scissors/game.ui.ts`:

```typescript
import { GameUI, Player } from '@/types'
import { RPSGameState, RPSChoice } from './game.state'

export class RPSGameUI implements GameUI {
  
  renderGameBoard(gameState: any, currentPlayer: Player): HTMLElement {
    const state = gameState as RPSGameState
    
    const container = document.createElement('div')
    container.className = 'game-board bg-white rounded-xl shadow-lg p-6'
    
    // En-tête
    const header = document.createElement('div')
    header.className = 'mb-6 text-center'
    header.innerHTML = `
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🪨📄✂️ Pierre-Papier-Ciseaux</h2>
      <div class="text-sm text-gray-600">
        Manche ${state.gameData.currentRound} / ${state.gameData.maxRounds}
      </div>
    `
    
    // Zone principale selon la phase
    const mainArea = this.renderMainArea(state, currentPlayer)
    
    // Historique des manches
    const history = this.renderRoundHistory(state)
    
    container.appendChild(header)
    container.appendChild(mainArea)
    container.appendChild(history)
    
    return container
  }
  
  renderPlayerActions(gameState: any, currentPlayer: Player): HTMLElement {
    const state = gameState as RPSGameState
    
    const container = document.createElement('div')
    container.className = 'player-actions bg-white rounded-xl shadow-lg p-6'
    
    const title = document.createElement('h3')
    title.className = 'text-lg font-semibold text-gray-900 mb-4'
    title.textContent = 'Votre choix'
    
    const actionsContainer = document.createElement('div')
    actionsContainer.className = 'space-y-4'
    
    if (state.phase === 'waiting') {
      actionsContainer.innerHTML = `
        <p class="text-gray-600 mb-4">Prêt à jouer ?</p>
        <button class="btn-primary w-full" data-action='{"type": "START_GAME"}'>
          Commencer la partie
        </button>
      `
    } else if (state.phase === 'choosing') {
      const hasChosen = state.gameData.currentChoices[currentPlayer.uid] !== undefined
      
      if (hasChosen) {
        const choice = state.gameData.currentChoices[currentPlayer.uid]
        actionsContainer.innerHTML = `
          <div class="text-center py-4">
            <p class="text-success-600 mb-2">✓ Choix fait !</p>
            <div class="text-4xl mb-2">${this.getChoiceEmoji(choice)}</div>
            <p class="text-sm text-gray-500">En attente des autres joueurs...</p>
          </div>
        `
      } else {
        actionsContainer.innerHTML = `
          <p class="text-gray-700 mb-4 text-center">Faites votre choix :</p>
          
          <div class="grid grid-cols-1 gap-3">
            <button 
              class="choice-btn flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-colors"
              data-action='{"type": "MAKE_CHOICE", "data": {"choice": "rock"}}'
            >
              <span class="text-3xl mr-3">🪨</span>
              <span class="font-medium">Pierre</span>
            </button>
            
            <button 
              class="choice-btn flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-colors"
              data-action='{"type": "MAKE_CHOICE", "data": {"choice": "paper"}}'
            >
              <span class="text-3xl mr-3">📄</span>
              <span class="font-medium">Papier</span>
            </button>
            
            <button 
              class="choice-btn flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-colors"
              data-action='{"type": "MAKE_CHOICE", "data": {"choice": "scissors"}}'
            >
              <span class="text-3xl mr-3">✂️</span>
              <span class="font-medium">Ciseaux</span>
            </button>
          </div>
        `
      }
    } else if (state.phase === 'reveal') {
      const lastRound = state.gameData.roundHistory[state.gameData.roundHistory.length - 1]
      const isWinner = lastRound?.winners.includes(currentPlayer.uid)
      
      actionsContainer.innerHTML = `
        <div class="text-center">
          <div class="mb-4">
            ${isWinner ? `
              <div class="text-success-600 text-lg font-semibold mb-2">🎉 Vous avez gagné cette manche !</div>
            ` : `
              <div class="text-gray-600 mb-2">Manche terminée</div>
            `}
          </div>
          
          ${state.gameData.currentRound < state.gameData.maxRounds ? `
            <button class="btn-primary w-full" data-action='{"type": "NEXT_ROUND"}'>
              Manche suivante
            </button>
          ` : `
            <p class="text-lg font-semibold text-primary-600">Partie terminée !</p>
          `}
        </div>
      `
    } else if (state.phase === 'finished') {
      const winner = this.determineWinner(state.scores)
      const isWinner = winner === currentPlayer.uid
      
      actionsContainer.innerHTML = `
        <div class="text-center">
          <div class="text-4xl mb-4">${isWinner ? '🏆' : '🎮'}</div>
          <h4 class="text-lg font-bold mb-4">
            ${isWinner ? 'Félicitations !' : 'Partie terminée'}
          </h4>
          <button class="btn-secondary w-full" onclick="window.location.href='/'">
            Retour à l'accueil
          </button>
        </div>
      `
    }
    
    container.appendChild(title)
    container.appendChild(actionsContainer)
    
    return container
  }
  
  renderScoreboard(players: Player[]): HTMLElement {
    const container = document.createElement('div')
    container.className = 'scoreboard bg-white rounded-xl shadow-lg p-6'
    
    const title = document.createElement('h3')
    title.className = 'text-lg font-semibold text-gray-900 mb-4'
    title.textContent = 'Scores'
    
    const playersList = document.createElement('div')
    playersList.className = 'space-y-3'
    
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
    
    sortedPlayers.forEach((player, index) => {
      const playerItem = document.createElement('div')
      playerItem.className = `flex items-center justify-between p-3 rounded-lg ${
        index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
      }`
      
      playerItem.innerHTML = `
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full ${
            player.connected ? 'bg-success-500' : 'bg-gray-400'
          } flex items-center justify-center text-white text-sm font-medium mr-3">
            ${index + 1}
          </div>
          <div>
            <div class="font-medium text-gray-900">${player.displayName}</div>
            <div class="text-xs text-gray-500">
              ${player.connected ? '🟢 En ligne' : '🔴 Hors ligne'}
            </div>
          </div>
        </div>
        <div class="text-lg font-bold ${
          index === 0 ? 'text-yellow-600' : 'text-gray-900'
        }">
          ${player.score}
        </div>
      `
      
      playersList.appendChild(playerItem)
    })
    
    container.appendChild(title)
    container.appendChild(playersList)
    
    return container
  }
  
  onGameStateUpdate(gameState: any): void {
    const state = gameState as RPSGameState
    
    // Animations ou sons selon la phase
    if (state.phase === 'reveal') {
      this.playRevealAnimation()
    }
  }
  
  // --- Méthodes privées ---
  
  private renderMainArea(state: RPSGameState, currentPlayer: Player): HTMLElement {
    const mainArea = document.createElement('div')
    mainArea.className = 'mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg'
    
    if (state.phase === 'waiting') {
      mainArea.innerHTML = `
        <div class="text-center">
          <div class="text-6xl mb-4">🪨📄✂️</div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">
            Prêt pour le défi ?
          </h3>
          <p class="text-gray-600">
            ${state.gameData.maxRounds} manches de Pierre-Papier-Ciseaux !
          </p>
        </div>
      `
    } else if (state.phase === 'choosing') {
      const chosenCount = Object.keys(state.gameData.currentChoices).length
      const totalPlayers = Object.keys(state.scores).length
      
      mainArea.innerHTML = `
        <div class="text-center">
          <div class="text-4xl mb-4">🤔</div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            Manche ${state.gameData.currentRound}
          </h3>
          <p class="text-gray-600">
            ${chosenCount} / ${totalPlayers} joueurs ont fait leur choix
          </p>
          
          <div class="mt-4 bg-white p-3 rounded-lg inline-block">
            <div class="flex space-x-4">
              <div class="text-center">
                <div class="text-2xl">🪨</div>
                <div class="text-xs text-gray-500">Pierre</div>
              </div>
              <div class="text-center">
                <div class="text-2xl">📄</div>
                <div class="text-xs text-gray-500">Papier</div>
              </div>
              <div class="text-center">
                <div class="text-2xl">✂️</div>
                <div class="text-xs text-gray-500">Ciseaux</div>
              </div>
            </div>
          </div>
        </div>
      `
    } else if (state.phase === 'reveal') {
      const lastRound = state.gameData.roundHistory[state.gameData.roundHistory.length - 1]
      
      mainArea.innerHTML = `
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Résultats de la manche ${lastRound.roundNumber}
          </h3>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            ${Object.entries(lastRound.choices).map(([playerId, choice]) => `
              <div class="bg-white p-3 rounded-lg">
                <div class="text-2xl mb-1">${this.getChoiceEmoji(choice)}</div>
                <div class="text-sm font-medium text-gray-900">${this.getPlayerName(playerId)}</div>
                ${lastRound.winners.includes(playerId) ? 
                  '<div class="text-xs text-success-600">🏆 Gagnant</div>' : 
                  '<div class="text-xs text-gray-500">-</div>'
                }
              </div>
            `).join('')}
          </div>
          
          ${lastRound.winners.length === 0 ? 
            '<p class="text-gray-600">Égalité cette manche !</p>' :
            `<p class="text-success-600 font-medium">${lastRound.winners.length} gagnant(s) !</p>`
          }
        </div>
      `
    }
    
    return mainArea
  }
  
  private renderRoundHistory(state: RPSGameState): HTMLElement {
    const container = document.createElement('div')
    container.className = 'round-history'
    
    if (state.gameData.roundHistory.length === 0) {
      return container
    }
    
    const title = document.createElement('h4')
    title.className = 'text-sm font-medium text-gray-700 mb-3'
    title.textContent = 'Historique des manches'
    
    const list = document.createElement('div')
    list.className = 'space-y-2 max-h-32 overflow-y-auto'
    
    state.gameData.roundHistory.slice(-3).reverse().forEach(round => {
      const item = document.createElement('div')
      item.className = 'flex items-center justify-between p-2 bg-gray-50 rounded text-sm'
      
      item.innerHTML = `
        <span>Manche ${round.roundNumber}</span>
        <span>${round.winners.length === 0 ? 'Égalité' : `${round.winners.length} gagnant(s)`}</span>
      `
      
      list.appendChild(item)
    })
    
    container.appendChild(title)
    container.appendChild(list)
    
    return container
  }
  
  private getChoiceEmoji(choice: RPSChoice): string {
    switch (choice) {
      case 'rock': return '🪨'
      case 'paper': return '📄'
      case 'scissors': return '✂️'
      default: return '❓'
    }
  }
  
  private getPlayerName(playerId: string): string {
    // Dans un vrai contexte, on aurait accès aux noms des joueurs
    return `Joueur ${playerId.slice(-4)}`
  }
  
  private determineWinner(scores: Record<string, number>): string | undefined {
    let maxScore = -1
    let winner: string | undefined
    
    Object.entries(scores).forEach(([playerId, score]) => {
      if (score > maxScore) {
        maxScore = score
        winner = playerId
      }
    })
    
    return winner
  }
  
  private playRevealAnimation(): void {
    // Animation ou son pour la révélation des choix
    console.log('🎬 Animation de révélation')
  }
}
```

### Étape 6 : Assembler le module

Éditez `src/games/rock-paper-scissors/index.ts`:

```typescript
import { GameModule } from '@/types'
import { gameConfig } from './game.config'
import { RPSGameLogic } from './game.logic'
import { RPSGameUI } from './game.ui'

export const rpsGameModule: GameModule = {
  config: gameConfig,
  logic: new RPSGameLogic(),
  ui: new RPSGameUI()
}

export * from './game.config'
export * from './game.state'
export * from './game.logic'
export * from './game.ui'
```

### Étape 7 : Enregistrer le jeu

Éditez `src/games/gameRegistry.ts`:

```typescript
// Ajouter l'import
import { rpsGameModule } from './rock-paper-scissors'

// Ajouter l'enregistrement
gameRegistry.register(rpsGameModule)
```

### Étape 8 : Tester le jeu

```bash
# Lancer les tests
npm test

# Tester en développement
npm run dev
```

## 🎨 Conseils de design

### Interface utilisateur

1. **Cohérence visuelle** : Utilisez les classes Tailwind prédéfinies
2. **Responsive design** : Testez sur mobile et desktop
3. **Accessibilité** : Ajoutez des attributs ARIA appropriés
4. **Feedback utilisateur** : Animations et sons pour les actions importantes

### Logique de jeu

1. **Validation stricte** : Vérifiez tous les mouvements côté client ET serveur
2. **État immutable** : Toujours retourner un nouvel état
3. **Gestion d'erreurs** : Prévoir les cas d'erreur et les déconnexions
4. **Performance** : Évitez les calculs lourds dans l'UI

### Expérience multijoueur

1. **Synchronisation** : Minimisez les conflits d'état
2. **Présence** : Indiquez clairement qui est en ligne
3. **Tour par tour** : Gérez les timeouts et les joueurs inactifs
4. **Équité** : Assurez-vous que tous les joueurs ont les mêmes chances

## 🧪 Tests recommandés

### Tests unitaires

```typescript
// game.logic.test.ts
describe('RPSGameLogic', () => {
  it('should validate correct moves', () => {
    // Test de validation des mouvements
  })
  
  it('should calculate winners correctly', () => {
    // Test de calcul des gagnants
  })
  
  it('should handle edge cases', () => {
    // Test des cas limites
  })
})
```

### Tests d'intégration

```typescript
// game.integration.test.ts
describe('RPS Game Integration', () => {
  it('should complete a full game flow', () => {
    // Test du flux complet de jeu
  })
})
```

## 🚀 Optimisations avancées

### Performance

1. **Lazy loading** : Chargez les modules de jeu à la demande
2. **Memoization** : Mettez en cache les calculs coûteux
3. **Debouncing** : Limitez les mises à jour Firestore

### Fonctionnalités avancées

1. **Spectateurs** : Permettez aux non-joueurs de regarder
2. **Replay** : Enregistrez et rejouez les parties
3. **Statistiques** : Trackez les performances des joueurs
4. **Tournois** : Organisez des compétitions multi-parties

## 📚 Ressources supplémentaires

- [Documentation Firebase](https://firebase.google.com/docs)
- [Guide Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Patterns de jeux multijoueurs](https://www.gabrielgambetta.com/client-server-game-architecture.html)

---

**Bon développement ! 🎮**
