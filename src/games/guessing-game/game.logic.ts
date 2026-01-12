import { GameLogic, Player } from '@/types'
import { 
  GuessingGameState, 
  GuessingGameAction, 
  createInitialGameState, 
  validateGameAction 
} from './game.state'

export class GuessingGameLogic implements GameLogic {
  
  validateMove(gameState: any, playerId: string, move: any): boolean {
    const state = gameState as GuessingGameState
    const action = move as GuessingGameAction
    
    return validateGameAction(state, { ...action, playerId })
  }
  
  processMove(gameState: any, playerId: string, move: any): GuessingGameState {
    const state = { ...gameState } as GuessingGameState
    const action = move as GuessingGameAction
    
    switch (action.type) {
      case 'START_GAME':
        return this.processStartGame(state)
        
      case 'MAKE_GUESS':
        return this.processMakeGuess(state, playerId, action.data?.guess!)
        
      case 'NEW_ROUND':
        return this.processNewRound(state)
        
      default:
        throw new Error(`Action non reconnue: ${action.type}`)
    }
  }
  
  checkWinCondition(gameState: any): { 
    isFinished: boolean
    winner?: string
    scores?: Record<string, number> 
  } {
    const state = gameState as GuessingGameState
    
    if (state.phase === 'finished') {
      return {
        isFinished: true,
        scores: state.scores,
        winner: this.determineWinner(state.scores)
      }
    }
    
    // Vérifier si quelqu'un a trouvé le nombre
    const correctGuess = state.gameData.guesses.find(g => g.result === 'correct')
    if (correctGuess) {
      return {
        isFinished: false, // On continue pour que les autres puissent voir
        scores: state.scores
      }
    }
    
    // Vérifier si tous les joueurs ont épuisé leurs tentatives
    const allPlayersExhausted = Object.values(state.gameData.playerStates)
      .every(playerState => playerState.guessCount >= state.gameData.maxGuesses)
    
    if (allPlayersExhausted && state.phase === 'guessing') {
      return {
        isFinished: false, // Passer à la phase de révélation
        scores: state.scores
      }
    }
    
    return { isFinished: false }
  }
  
  getNextPlayer(gameState: any, currentPlayerId: string): string {
    const state = gameState as GuessingGameState
    const playerIds = Object.keys(state.scores)
    
    // Trouver le prochain joueur qui peut encore jouer
    let currentIndex = playerIds.indexOf(currentPlayerId)
    let attempts = 0
    
    do {
      currentIndex = (currentIndex + 1) % playerIds.length
      const nextPlayerId = playerIds[currentIndex]
      const playerState = state.gameData.playerStates[nextPlayerId]
      
      // Si ce joueur peut encore jouer, le retourner
      if (playerState.guessCount < state.gameData.maxGuesses) {
        return nextPlayerId
      }
      
      attempts++
    } while (attempts < playerIds.length)
    
    // Si aucun joueur ne peut jouer, retourner le premier
    return playerIds[0]
  }
  
  initializeGameState(players: Player[]): GuessingGameState {
    const initialState = createInitialGameState(players)
    initialState.phase = 'guessing'
    return initialState
  }
  
  // --- Méthodes privées ---
  
  private processStartGame(state: GuessingGameState): GuessingGameState {
    state.phase = 'guessing'
    return state
  }
  
  private processMakeGuess(
    state: GuessingGameState, 
    playerId: string, 
    guess: number
  ): GuessingGameState {
    const playerState = state.gameData.playerStates[playerId]
    const secretNumber = state.gameData.secretNumber
    
    // Déterminer le résultat
    let result: 'too_high' | 'too_low' | 'correct'
    if (guess === secretNumber) {
      result = 'correct'
    } else if (guess > secretNumber) {
      result = 'too_high'
    } else {
      result = 'too_low'
    }
    
    // Ajouter la tentative à l'historique
    state.gameData.guesses.push({
      playerId,
      playerName: this.getPlayerName(playerId, state),
      guess,
      result,
      timestamp: new Date()
    })
    
    // Mettre à jour l'état du joueur
    playerState.hasGuessed = true
    playerState.lastGuess = guess
    playerState.guessCount += 1
    
    // Calculer les points
    if (result === 'correct') {
      // Points basés sur le nombre de tentatives (moins de tentatives = plus de points)
      const basePoints = 100
      const penaltyPerGuess = 10
      const points = Math.max(10, basePoints - (playerState.guessCount - 1) * penaltyPerGuess)
      state.scores[playerId] += points
      
      // Passer à la phase de révélation
      state.phase = 'reveal'
    } else {
      // Passer au joueur suivant
      state.currentPlayerId = this.getNextPlayer(state, playerId)
      
      // Vérifier si tous les joueurs ont épuisé leurs tentatives
      const allExhausted = Object.values(state.gameData.playerStates)
        .every(ps => ps.guessCount >= state.gameData.maxGuesses)
      
      if (allExhausted) {
        state.phase = 'reveal'
      }
    }
    
    return state
  }
  
  private processNewRound(state: GuessingGameState): GuessingGameState {
    // Générer un nouveau nombre secret
    state.gameData.secretNumber = Math.floor(Math.random() * 100) + 1
    
    // Réinitialiser les états des joueurs
    Object.keys(state.gameData.playerStates).forEach(playerId => {
      state.gameData.playerStates[playerId] = {
        hasGuessed: false,
        guessCount: 0
      }
    })
    
    // Vider l'historique des tentatives
    state.gameData.guesses = []
    
    // Recommencer avec le premier joueur
    const playerIds = Object.keys(state.scores)
    state.currentPlayerId = playerIds[0]
    state.currentTurn += 1
    state.phase = 'guessing'
    
    return state
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
  
  private getPlayerName(playerId: string, state: GuessingGameState): string {
    // Dans un vrai contexte, on aurait accès aux noms des joueurs
    return `Joueur ${playerId.slice(-4)}`
  }
}
