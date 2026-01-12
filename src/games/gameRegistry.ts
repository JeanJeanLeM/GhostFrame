import { GameModule, GameConfig } from '@/types'
import { templateGameModule } from './_template'
import { guessingGameModule } from './guessing-game'
import { ghostFrameGameModule } from './mister-white'

/**
 * Registre des jeux disponibles
 * 
 * Ce fichier centralise tous les jeux disponibles dans l'application.
 * Pour ajouter un nouveau jeu:
 * 1. Importez le module du jeu
 * 2. Ajoutez-le au registre avec gameRegistry.register()
 * 3. Le jeu sera automatiquement disponible dans l'interface
 */

class GameRegistry {
  private games: Map<string, GameModule> = new Map()

  /**
   * Enregistre un nouveau jeu
   */
  register(gameModule: GameModule): void {
    const gameId = gameModule.config.id
    
    if (this.games.has(gameId)) {
      console.warn(`⚠️ Le jeu "${gameId}" est déjà enregistré. Il sera remplacé.`)
    }
    
    this.games.set(gameId, gameModule)
    console.log(`✅ Jeu "${gameModule.config.name}" enregistré avec l'ID: ${gameId}`)
  }

  /**
   * Récupère un jeu par son ID
   */
  getGame(gameId: string): GameModule | undefined {
    return this.games.get(gameId)
  }

  /**
   * Récupère tous les jeux disponibles
   */
  getAllGames(): GameModule[] {
    return Array.from(this.games.values())
  }

  /**
   * Récupère toutes les configurations de jeux
   */
  getAllGameConfigs(): GameConfig[] {
    return this.getAllGames().map(game => game.config)
  }

  /**
   * Filtre les jeux par critères
   */
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

  /**
   * Vérifie si un jeu existe
   */
  hasGame(gameId: string): boolean {
    return this.games.has(gameId)
  }

  /**
   * Supprime un jeu du registre
   */
  unregister(gameId: string): boolean {
    const success = this.games.delete(gameId)
    if (success) {
      console.log(`✅ Jeu "${gameId}" supprimé du registre`)
    }
    return success
  }

  /**
   * Obtient les statistiques du registre
   */
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
      // Compter par difficulté
      gamesByDifficulty[config.difficulty] = (gamesByDifficulty[config.difficulty] || 0) + 1

      // Compter par catégorie
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

// Instance singleton du registre
export const gameRegistry = new GameRegistry()

// Enregistrer les jeux disponibles
gameRegistry.register(templateGameModule)
gameRegistry.register(guessingGameModule)
gameRegistry.register(ghostFrameGameModule)

// TODO: Ajouter d'autres jeux ici
// gameRegistry.register(triviaGameModule)
// gameRegistry.register(drawingGameModule)
// gameRegistry.register(wordGameModule)

export default gameRegistry
