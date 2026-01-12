import { GameModule } from '@/types'
import { gameConfig } from './game.config'
import { MisterWhiteGameLogic } from './game.logic'
import { MisterWhiteGameUI } from './game.ui'

/**
 * Module complet du jeu Ghost Frame
 */
export const ghostFrameGameModule: GameModule = {
  config: gameConfig,
  logic: new MisterWhiteGameLogic(),
  ui: new MisterWhiteGameUI()
}

// Exports pour utilisation externe
export * from './game.config'
export * from './game.state'
export * from './game.logic'
export * from './game.ui'






