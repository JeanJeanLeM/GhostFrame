import { describe, it, expect, beforeEach } from 'vitest'
import { GuessingGameLogic } from '@games/guessing-game/game.logic'
import { GuessingGameState, createInitialGameState } from '@games/guessing-game/game.state'
import { Player } from '@/types'

describe('GuessingGameLogic', () => {
  let logic: GuessingGameLogic
  let mockPlayers: Player[]
  let initialState: GuessingGameState

  beforeEach(() => {
    logic = new GuessingGameLogic()
    
    mockPlayers = [
      {
        uid: 'player1',
        displayName: 'Alice',
        isAnonymous: true,
        connected: true,
        lastSeen: new Date(),
        score: 0,
        isReady: true,
        isHost: true
      },
      {
        uid: 'player2',
        displayName: 'Bob',
        isAnonymous: true,
        connected: true,
        lastSeen: new Date(),
        score: 0,
        isReady: true,
        isHost: false
      }
    ]

    initialState = createInitialGameState(mockPlayers)
    initialState.phase = 'guessing'
    initialState.gameData.secretNumber = 50 // Nombre fixe pour les tests
  })

  describe('validateMove', () => {
    it('should validate correct guess moves', () => {
      const move = { type: 'MAKE_GUESS', data: { guess: 25 } }
      const isValid = logic.validateMove(initialState, 'player1', move)
      expect(isValid).toBe(true)
    })

    it('should reject moves from wrong player', () => {
      const move = { type: 'MAKE_GUESS', data: { guess: 25 } }
      const isValid = logic.validateMove(initialState, 'player2', move)
      expect(isValid).toBe(false)
    })

    it('should reject guesses outside range', () => {
      const move1 = { type: 'MAKE_GUESS', data: { guess: 0 } }
      const move2 = { type: 'MAKE_GUESS', data: { guess: 101 } }
      
      expect(logic.validateMove(initialState, 'player1', move1)).toBe(false)
      expect(logic.validateMove(initialState, 'player1', move2)).toBe(false)
    })

    it('should reject moves when player has no guesses left', () => {
      // Épuiser les tentatives du joueur
      initialState.gameData.playerStates['player1'].guessCount = 10
      
      const move = { type: 'MAKE_GUESS', data: { guess: 25 } }
      const isValid = logic.validateMove(initialState, 'player1', move)
      expect(isValid).toBe(false)
    })

    it('should reject moves in wrong phase', () => {
      initialState.phase = 'setup'
      
      const move = { type: 'MAKE_GUESS', data: { guess: 25 } }
      const isValid = logic.validateMove(initialState, 'player1', move)
      expect(isValid).toBe(false)
    })
  })

  describe('processMove', () => {
    it('should process correct guess', () => {
      const move = { type: 'MAKE_GUESS', data: { guess: 50 } }
      const newState = logic.processMove(initialState, 'player1', move)
      
      expect(newState.phase).toBe('reveal')
      expect(newState.gameData.guesses).toHaveLength(1)
      expect(newState.gameData.guesses[0].result).toBe('correct')
      expect(newState.scores['player1']).toBeGreaterThan(0)
    })

    it('should process too high guess', () => {
      const move = { type: 'MAKE_GUESS', data: { guess: 75 } }
      const newState = logic.processMove(initialState, 'player1', move)
      
      expect(newState.phase).toBe('guessing')
      expect(newState.gameData.guesses[0].result).toBe('too_high')
      expect(newState.currentPlayerId).toBe('player2') // Tour suivant
    })

    it('should process too low guess', () => {
      const move = { type: 'MAKE_GUESS', data: { guess: 25 } }
      const newState = logic.processMove(initialState, 'player1', move)
      
      expect(newState.phase).toBe('guessing')
      expect(newState.gameData.guesses[0].result).toBe('too_low')
      expect(newState.currentPlayerId).toBe('player2')
    })

    it('should update player state after guess', () => {
      const move = { type: 'MAKE_GUESS', data: { guess: 25 } }
      const newState = logic.processMove(initialState, 'player1', move)
      
      const playerState = newState.gameData.playerStates['player1']
      expect(playerState.hasGuessed).toBe(true)
      expect(playerState.lastGuess).toBe(25)
      expect(playerState.guessCount).toBe(1)
    })

    it('should move to reveal phase when all players exhausted', () => {
      // Épuiser les tentatives de tous les joueurs sauf une
      initialState.gameData.playerStates['player1'].guessCount = 9
      initialState.gameData.playerStates['player2'].guessCount = 10
      
      const move = { type: 'MAKE_GUESS', data: { guess: 25 } }
      const newState = logic.processMove(initialState, 'player1', move)
      
      expect(newState.phase).toBe('reveal')
    })
  })

  describe('checkWinCondition', () => {
    it('should detect finished game in reveal phase', () => {
      initialState.phase = 'finished'
      
      const result = logic.checkWinCondition(initialState)
      expect(result.isFinished).toBe(true)
      expect(result.scores).toBeDefined()
    })

    it('should not finish game during guessing phase', () => {
      const result = logic.checkWinCondition(initialState)
      expect(result.isFinished).toBe(false)
    })
  })

  describe('getNextPlayer', () => {
    it('should return next player in rotation', () => {
      const nextPlayer = logic.getNextPlayer(initialState, 'player1')
      expect(nextPlayer).toBe('player2')
    })

    it('should wrap around to first player', () => {
      const nextPlayer = logic.getNextPlayer(initialState, 'player2')
      expect(nextPlayer).toBe('player1')
    })

    it('should skip players with no guesses left', () => {
      // Épuiser les tentatives du deuxième joueur
      initialState.gameData.playerStates['player2'].guessCount = 10
      
      const nextPlayer = logic.getNextPlayer(initialState, 'player1')
      expect(nextPlayer).toBe('player1') // Reste sur player1
    })
  })

  describe('initializeGameState', () => {
    it('should create valid initial state', () => {
      const state = logic.initializeGameState(mockPlayers)
      
      expect(state.phase).toBe('guessing')
      expect(state.currentTurn).toBe(0)
      expect(state.currentPlayerId).toBe('player1')
      expect(Object.keys(state.scores)).toHaveLength(2)
      expect(Object.keys(state.gameData.playerStates)).toHaveLength(2)
    })

    it('should initialize all player scores to 0', () => {
      const state = logic.initializeGameState(mockPlayers)
      
      Object.values(state.scores).forEach(score => {
        expect(score).toBe(0)
      })
    })

    it('should initialize all players as not having played', () => {
      const state = logic.initializeGameState(mockPlayers)
      
      Object.values(state.gameData.playerStates).forEach(playerState => {
        expect(playerState.hasGuessed).toBe(false)
        expect(playerState.guessCount).toBe(0)
      })
    })
  })
})
