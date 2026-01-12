import { Player } from '@/types'

export interface GuessingGameState {
  currentTurn: number
  currentPlayerId: string
  phase: 'setup' | 'guessing' | 'reveal' | 'finished'
  
  gameData: {
    // Le nombre secret (1-100)
    secretNumber: number
    
    // Historique des tentatives
    guesses: Array<{
      playerId: string
      playerName: string
      guess: number
      result: 'too_high' | 'too_low' | 'correct'
      timestamp: Date
    }>
    
    // État par joueur
    playerStates: Record<string, {
      hasGuessed: boolean
      lastGuess?: number
      guessCount: number
    }>
    
    // Paramètres du jeu
    maxGuesses: number
    range: { min: number; max: number }
  }
  
  scores: Record<string, number>
  startedAt?: Date
  finishedAt?: Date
}

export function createInitialGameState(players: Player[]): GuessingGameState {
  const secretNumber = Math.floor(Math.random() * 100) + 1
  const firstPlayer = players[0]
  
  const initialState: GuessingGameState = {
    currentTurn: 0,
    currentPlayerId: firstPlayer.uid,
    phase: 'setup',
    gameData: {
      secretNumber,
      guesses: [],
      playerStates: {},
      maxGuesses: 10, // Chaque joueur a 10 tentatives max
      range: { min: 1, max: 100 }
    },
    scores: {},
    startedAt: new Date()
  }
  
  // Initialiser les scores et états des joueurs
  players.forEach(player => {
    initialState.scores[player.uid] = 0
    initialState.gameData.playerStates[player.uid] = {
      hasGuessed: false,
      guessCount: 0
    }
  })
  
  return initialState
}

export interface GuessingGameAction {
  type: 'MAKE_GUESS' | 'START_GAME' | 'NEW_ROUND'
  playerId: string
  data?: {
    guess?: number
  }
}

export function validateGameAction(
  state: GuessingGameState,
  action: GuessingGameAction
): boolean {
  switch (action.type) {
    case 'START_GAME':
      return state.phase === 'setup'
      
    case 'MAKE_GUESS':
      if (state.phase !== 'guessing') return false
      if (action.playerId !== state.currentPlayerId) return false
      
      const playerState = state.gameData.playerStates[action.playerId]
      if (playerState.guessCount >= state.gameData.maxGuesses) return false
      
      const guess = action.data?.guess
      if (!guess || guess < state.gameData.range.min || guess > state.gameData.range.max) {
        return false
      }
      
      return true
      
    case 'NEW_ROUND':
      return state.phase === 'reveal'
      
    default:
      return false
  }
}
