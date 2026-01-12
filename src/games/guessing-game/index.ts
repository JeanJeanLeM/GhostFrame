import { GameModule } from '@/types'
import { gameConfig } from './game.config'
import { GuessingGameLogic } from './game.logic'
import { GuessingGameUI } from './game.ui'

export const guessingGameModule: GameModule = {
  config: gameConfig,
  logic: new GuessingGameLogic(),
  ui: new GuessingGameUI()
}

export * from './game.config'
export * from './game.state'
export * from './game.logic'
export * from './game.ui'
