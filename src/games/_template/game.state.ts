import { Player } from '@/types'

/**
 * Interface pour l'état spécifique du jeu template
 * 
 * Définissez ici la structure des données que votre jeu stockera
 * dans Firestore. Cette interface sera utilisée par la logique du jeu.
 */
export interface TemplateGameState {
  // Tour actuel (0-based)
  currentTurn: number
  
  // Joueur dont c'est le tour
  currentPlayerId: string
  
  // Phase du jeu
  phase: 'waiting' | 'playing' | 'finished'
  
  // Données spécifiques au jeu template
  gameData: {
    // Exemple: compteur global
    globalCounter: number
    
    // Exemple: historique des actions
    actionHistory: Array<{
      playerId: string
      action: string
      timestamp: Date
    }>
    
    // Exemple: état par joueur
    playerStates: Record<string, {
      hasPlayed: boolean
      lastAction?: string
    }>
  }
  
  // Scores en temps réel
  scores: Record<string, number>
  
  // Métadonnées
  startedAt?: Date
  finishedAt?: Date
}

/**
 * Crée l'état initial du jeu
 */
export function createInitialGameState(players: Player[]): TemplateGameState {
  const firstPlayer = players[0]
  
  const initialState: TemplateGameState = {
    currentTurn: 0,
    currentPlayerId: firstPlayer.uid,
    phase: 'waiting',
    gameData: {
      globalCounter: 0,
      actionHistory: [],
      playerStates: {}
    },
    scores: {},
    startedAt: new Date()
  }
  
  // Initialiser les scores et états des joueurs
  players.forEach(player => {
    initialState.scores[player.uid] = 0
    initialState.gameData.playerStates[player.uid] = {
      hasPlayed: false
    }
  })
  
  return initialState
}

/**
 * Types pour les actions du jeu
 */
export interface TemplateGameAction {
  type: 'EXAMPLE_ACTION' | 'PASS_TURN' | 'END_GAME'
  playerId: string
  data?: any
}

/**
 * Valide une action de jeu
 */
export function validateGameAction(
  state: TemplateGameState, 
  action: TemplateGameAction
): boolean {
  // Vérifications de base
  if (state.phase !== 'playing') {
    return false
  }
  
  if (action.playerId !== state.currentPlayerId) {
    return false
  }
  
  // Vérifications spécifiques par type d'action
  switch (action.type) {
    case 'EXAMPLE_ACTION':
      // Vérifier que le joueur n'a pas encore joué ce tour
      return !state.gameData.playerStates[action.playerId]?.hasPlayed
      
    case 'PASS_TURN':
      // Toujours autorisé
      return true
      
    case 'END_GAME':
      // Seulement si certaines conditions sont remplies
      return state.currentTurn >= 5 // Exemple: minimum 5 tours
      
    default:
      return false
  }
}
