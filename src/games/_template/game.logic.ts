import { GameLogic, Player } from '@/types'
import { 
  TemplateGameState, 
  TemplateGameAction, 
  createInitialGameState, 
  validateGameAction 
} from './game.state'

/**
 * Logique du jeu template
 * 
 * Cette classe implémente toutes les règles et mécaniques du jeu.
 * Elle est responsable de la validation des mouvements, du traitement
 * des actions et de la détermination des conditions de victoire.
 */
export class TemplateGameLogic implements GameLogic {
  
  /**
   * Valide si un mouvement est autorisé
   */
  validateMove(gameState: any, playerId: string, move: any): boolean {
    const state = gameState as TemplateGameState
    const action = move as TemplateGameAction
    
    // Utiliser la fonction de validation de l'état
    return validateGameAction(state, { ...action, playerId })
  }
  
  /**
   * Traite un mouvement et retourne le nouvel état
   */
  processMove(gameState: any, playerId: string, move: any): TemplateGameState {
    const state = { ...gameState } as TemplateGameState
    const action = move as TemplateGameAction
    
    // Ajouter l'action à l'historique
    state.gameData.actionHistory.push({
      playerId,
      action: action.type,
      timestamp: new Date()
    })
    
    // Traiter l'action selon son type
    switch (action.type) {
      case 'EXAMPLE_ACTION':
        return this.processExampleAction(state, playerId, action.data)
        
      case 'PASS_TURN':
        return this.processPassTurn(state, playerId)
        
      case 'END_GAME':
        return this.processEndGame(state)
        
      default:
        throw new Error(`Action non reconnue: ${action.type}`)
    }
  }
  
  /**
   * Vérifie les conditions de victoire
   */
  checkWinCondition(gameState: any): { 
    isFinished: boolean
    winner?: string
    scores?: Record<string, number> 
  } {
    const state = gameState as TemplateGameState
    
    // Vérifier si le jeu est terminé
    if (state.phase === 'finished') {
      return {
        isFinished: true,
        scores: state.scores,
        winner: this.determineWinner(state.scores)
      }
    }
    
    // Vérifier les conditions de fin automatique
    // Exemple: si on a atteint 10 tours
    if (state.currentTurn >= 10) {
      return {
        isFinished: true,
        scores: state.scores,
        winner: this.determineWinner(state.scores)
      }
    }
    
    // Exemple: si un joueur a atteint 100 points
    const maxScore = Math.max(...Object.values(state.scores))
    if (maxScore >= 100) {
      return {
        isFinished: true,
        scores: state.scores,
        winner: this.determineWinner(state.scores)
      }
    }
    
    return { isFinished: false }
  }
  
  /**
   * Détermine le joueur suivant
   */
  getNextPlayer(gameState: any, currentPlayerId: string): string {
    const state = gameState as TemplateGameState
    const playerIds = Object.keys(state.scores)
    const currentIndex = playerIds.indexOf(currentPlayerId)
    const nextIndex = (currentIndex + 1) % playerIds.length
    
    return playerIds[nextIndex]
  }
  
  /**
   * Initialise l'état du jeu
   */
  initializeGameState(players: Player[]): TemplateGameState {
    const initialState = createInitialGameState(players)
    initialState.phase = 'playing'
    return initialState
  }
  
  // --- Méthodes privées pour traiter les actions ---
  
  private processExampleAction(
    state: TemplateGameState, 
    playerId: string, 
    data: any
  ): TemplateGameState {
    // Marquer le joueur comme ayant joué
    state.gameData.playerStates[playerId].hasPlayed = true
    state.gameData.playerStates[playerId].lastAction = 'EXAMPLE_ACTION'
    
    // Incrémenter le compteur global
    state.gameData.globalCounter += 1
    
    // Donner des points au joueur (exemple)
    state.scores[playerId] += 10
    
    // Passer au joueur suivant si tous ont joué
    if (this.allPlayersHavePlayed(state)) {
      return this.nextTurn(state)
    }
    
    return state
  }
  
  private processPassTurn(state: TemplateGameState, playerId: string): TemplateGameState {
    // Marquer le joueur comme ayant joué (passé)
    state.gameData.playerStates[playerId].hasPlayed = true
    state.gameData.playerStates[playerId].lastAction = 'PASS_TURN'
    
    // Passer au joueur suivant si tous ont joué
    if (this.allPlayersHavePlayed(state)) {
      return this.nextTurn(state)
    }
    
    return state
  }
  
  private processEndGame(state: TemplateGameState): TemplateGameState {
    state.phase = 'finished'
    state.finishedAt = new Date()
    return state
  }
  
  private allPlayersHavePlayed(state: TemplateGameState): boolean {
    return Object.values(state.gameData.playerStates)
      .every(playerState => playerState.hasPlayed)
  }
  
  private nextTurn(state: TemplateGameState): TemplateGameState {
    // Réinitialiser les états des joueurs pour le prochain tour
    Object.keys(state.gameData.playerStates).forEach(playerId => {
      state.gameData.playerStates[playerId].hasPlayed = false
    })
    
    // Incrémenter le tour
    state.currentTurn += 1
    
    // Le premier joueur recommence (ou logique plus complexe)
    const playerIds = Object.keys(state.scores)
    state.currentPlayerId = playerIds[0]
    
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
}
