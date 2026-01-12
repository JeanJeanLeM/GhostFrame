import { describe, it, expect, beforeEach } from 'vitest'
import { GameModule, GameConfig } from '@/types'

// Créer une classe GameRegistry pour les tests (basée sur celle du registre)
class GameRegistry {
  private games: Map<string, GameModule> = new Map()

  register(gameModule: GameModule): void {
    this.games.set(gameModule.config.id, gameModule)
  }

  getGame(gameId: string): GameModule | undefined {
    return this.games.get(gameId)
  }

  getAllGames(): GameModule[] {
    return Array.from(this.games.values())
  }

  hasGame(gameId: string): boolean {
    return this.games.has(gameId)
  }

  unregister(gameId: string): boolean {
    return this.games.delete(gameId)
  }

  filterGames(criteria: {
    minPlayers?: number
    maxPlayers?: number
    difficulty?: string
    category?: string
    maxDuration?: number
  }): GameModule[] {
    return this.getAllGames().filter(game => {
      const config = game.config

      if (criteria.minPlayers && config.maxPlayers < criteria.minPlayers) {
        return false
      }

      if (criteria.maxPlayers && config.minPlayers > criteria.maxPlayers) {
        return false
      }

      if (criteria.difficulty && config.difficulty !== criteria.difficulty) {
        return false
      }

      if (criteria.category && !config.category.includes(criteria.category)) {
        return false
      }

      if (criteria.maxDuration && config.estimatedDuration > criteria.maxDuration) {
        return false
      }

      return true
    })
  }

  getStats(): {
    totalGames: number
    gamesByDifficulty: Record<string, number>
    gamesByCategory: Record<string, number>
    averageDuration: number
  } {
    const games = this.getAllGames()
    const configs = games.map(g => g.config)

    const gamesByDifficulty: Record<string, number> = {}
    const gamesByCategory: Record<string, number> = {}
    let totalDuration = 0

    configs.forEach(config => {
      gamesByDifficulty[config.difficulty] = (gamesByDifficulty[config.difficulty] || 0) + 1

      config.category.forEach(cat => {
        gamesByCategory[cat] = (gamesByCategory[cat] || 0) + 1
      })

      totalDuration += config.estimatedDuration
    })

    return {
      totalGames: games.length,
      gamesByDifficulty,
      gamesByCategory,
      averageDuration: games.length > 0 ? Math.round(totalDuration / games.length) : 0
    }
  }
}

// Mock game module pour les tests
const mockGameConfig: GameConfig = {
  id: 'test-game',
  name: 'Test Game',
  description: 'A test game',
  minPlayers: 2,
  maxPlayers: 4,
  estimatedDuration: 15,
  difficulty: 'easy',
  category: ['test', 'party']
}

const mockGameModule: GameModule = {
  config: mockGameConfig,
  logic: {
    validateMove: () => true,
    processMove: (state) => state,
    checkWinCondition: () => ({ isFinished: false }),
    getNextPlayer: () => 'player1',
    initializeGameState: () => ({})
  } as any,
  ui: {
    renderGameBoard: () => document.createElement('div'),
    renderPlayerActions: () => document.createElement('div'),
    renderScoreboard: () => document.createElement('div'),
    onGameStateUpdate: () => {}
  } as any
}

describe('GameRegistry', () => {
  let registry: GameRegistry

  beforeEach(() => {
    registry = new GameRegistry()
  })

  describe('register', () => {
    it('should register a new game', () => {
      registry.register(mockGameModule)
      
      expect(registry.hasGame('test-game')).toBe(true)
      expect(registry.getGame('test-game')).toBe(mockGameModule)
    })

    it('should replace existing game with same ID', () => {
      const firstModule = { ...mockGameModule }
      const secondModule = { 
        ...mockGameModule, 
        config: { ...mockGameConfig, name: 'Updated Game' }
      }

      registry.register(firstModule)
      registry.register(secondModule)
      
      const retrievedGame = registry.getGame('test-game')
      expect(retrievedGame?.config.name).toBe('Updated Game')
    })
  })

  describe('getGame', () => {
    it('should return undefined for non-existent game', () => {
      expect(registry.getGame('non-existent')).toBeUndefined()
    })

    it('should return registered game', () => {
      registry.register(mockGameModule)
      
      const game = registry.getGame('test-game')
      expect(game).toBe(mockGameModule)
    })
  })

  describe('getAllGames', () => {
    it('should return empty array when no games registered', () => {
      expect(registry.getAllGames()).toEqual([])
    })

    it('should return all registered games', () => {
      const game2Config: GameConfig = {
        ...mockGameConfig,
        id: 'test-game-2',
        name: 'Test Game 2'
      }
      const game2Module: GameModule = {
        ...mockGameModule,
        config: game2Config
      }

      registry.register(mockGameModule)
      registry.register(game2Module)
      
      const games = registry.getAllGames()
      expect(games).toHaveLength(2)
      expect(games.map(g => g.config.id)).toContain('test-game')
      expect(games.map(g => g.config.id)).toContain('test-game-2')
    })
  })

  describe('filterGames', () => {
    beforeEach(() => {
      // Enregistrer plusieurs jeux avec différentes caractéristiques
      const easyGame: GameModule = {
        ...mockGameModule,
        config: {
          ...mockGameConfig,
          id: 'easy-game',
          difficulty: 'easy',
          minPlayers: 2,
          maxPlayers: 4,
          estimatedDuration: 10,
          category: ['party']
        }
      }

      const hardGame: GameModule = {
        ...mockGameModule,
        config: {
          ...mockGameConfig,
          id: 'hard-game',
          difficulty: 'hard',
          minPlayers: 4,
          maxPlayers: 8,
          estimatedDuration: 30,
          category: ['strategy']
        }
      }

      registry.register(easyGame)
      registry.register(hardGame)
    })

    it('should filter by difficulty', () => {
      const easyGames = registry.filterGames({ difficulty: 'easy' })
      expect(easyGames).toHaveLength(1)
      expect(easyGames[0].config.id).toBe('easy-game')
    })

    it('should filter by player count', () => {
      const gamesFor3Players = registry.filterGames({ 
        minPlayers: 3, 
        maxPlayers: 3 
      })
      expect(gamesFor3Players).toHaveLength(1)
      expect(gamesFor3Players[0].config.id).toBe('easy-game')
    })

    it('should filter by duration', () => {
      const shortGames = registry.filterGames({ maxDuration: 15 })
      expect(shortGames).toHaveLength(1)
      expect(shortGames[0].config.id).toBe('easy-game')
    })

    it('should filter by category', () => {
      const partyGames = registry.filterGames({ category: 'party' })
      expect(partyGames).toHaveLength(1)
      expect(partyGames[0].config.id).toBe('easy-game')
    })

    it('should combine multiple filters', () => {
      const filteredGames = registry.filterGames({
        difficulty: 'easy',
        maxDuration: 15,
        category: 'party'
      })
      expect(filteredGames).toHaveLength(1)
      expect(filteredGames[0].config.id).toBe('easy-game')
    })

    it('should return empty array when no games match', () => {
      const filteredGames = registry.filterGames({
        difficulty: 'medium',
        category: 'nonexistent'
      })
      expect(filteredGames).toHaveLength(0)
    })
  })

  describe('unregister', () => {
    it('should remove registered game', () => {
      registry.register(mockGameModule)
      expect(registry.hasGame('test-game')).toBe(true)
      
      const success = registry.unregister('test-game')
      expect(success).toBe(true)
      expect(registry.hasGame('test-game')).toBe(false)
    })

    it('should return false for non-existent game', () => {
      const success = registry.unregister('non-existent')
      expect(success).toBe(false)
    })
  })

  describe('getStats', () => {
    beforeEach(() => {
      const games = [
        {
          ...mockGameModule,
          config: { ...mockGameConfig, id: 'game1', difficulty: 'easy' as const, estimatedDuration: 10, category: ['party'] }
        },
        {
          ...mockGameModule,
          config: { ...mockGameConfig, id: 'game2', difficulty: 'easy' as const, estimatedDuration: 20, category: ['party', 'strategy'] }
        },
        {
          ...mockGameModule,
          config: { ...mockGameConfig, id: 'game3', difficulty: 'hard' as const, estimatedDuration: 30, category: ['strategy'] }
        }
      ]

      games.forEach(game => registry.register(game))
    })

    it('should calculate correct statistics', () => {
      const stats = registry.getStats()
      
      expect(stats.totalGames).toBe(3)
      expect(stats.averageDuration).toBe(20) // (10 + 20 + 30) / 3
      expect(stats.gamesByDifficulty.easy).toBe(2)
      expect(stats.gamesByDifficulty.hard).toBe(1)
      expect(stats.gamesByCategory.party).toBe(2)
      expect(stats.gamesByCategory.strategy).toBe(2)
    })

    it('should handle empty registry', () => {
      const emptyRegistry = new GameRegistry()
      const stats = emptyRegistry.getStats()
      
      expect(stats.totalGames).toBe(0)
      expect(stats.averageDuration).toBe(0)
      expect(Object.keys(stats.gamesByDifficulty)).toHaveLength(0)
      expect(Object.keys(stats.gamesByCategory)).toHaveLength(0)
    })
  })
})
