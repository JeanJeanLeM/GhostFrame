// Types de base pour l'application

export interface User {
  uid: string
  displayName: string
  isAnonymous: boolean
  connected: boolean
  lastSeen: Date
}

export interface Player extends User {
  score: number
  isReady: boolean
  isHost: boolean
}

export type GameStatus = 'CREATED' | 'IN_PROGRESS' | 'FINISHED'

export interface GameSession {
  id: string
  code: string
  gameType: string
  status: GameStatus
  currentTurn: number
  maxPlayers: number
  minPlayers: number
  createdAt: Date
  createdBy: string
  players: Record<string, Player>
  state: Record<string, any>
}

export interface GameConfig {
  id: string
  name: string
  description: string
  minPlayers: number
  maxPlayers: number
  estimatedDuration: number // en minutes
  difficulty: 'easy' | 'medium' | 'hard'
  category: string[]
}

export interface GameLogic {
  validateMove(gameState: any, playerId: string, move: any): boolean
  processMove(gameState: any, playerId: string, move: any): any
  checkWinCondition(gameState: any): { isFinished: boolean; winner?: string; scores?: Record<string, number> }
  getNextPlayer(gameState: any, currentPlayerId: string): string
  initializeGameState(players: Player[]): any
}

export interface GameUI {
  renderGameBoard(gameState: any, currentPlayer: Player): HTMLElement
  renderPlayerActions(gameState: any, currentPlayer: Player): HTMLElement
  renderScoreboard(players: Player[]): HTMLElement
  onGameStateUpdate(gameState: any): void
}

export interface GameModule {
  config: GameConfig
  logic: GameLogic
  ui: GameUI
}

// Types pour les erreurs
export interface AppError {
  code: string
  message: string
  details?: any
}

// Types pour les événements temps réel
export interface RealtimeEvent {
  type: string
  data: any
  timestamp: Date
  playerId?: string
}

// Types pour la navigation
export type Route = 'home' | 'lobby' | 'game' | 'results'

export interface RouteParams {
  gameId?: string
  [key: string]: string | undefined
}
