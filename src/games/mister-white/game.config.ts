import { GameConfig } from '@/types'

/**
 * Configuration du jeu Ghost Frame
 */
export const gameConfig: GameConfig = {
  id: 'ghost-frame',
  name: 'Ghost Frame',
  description: 'Un jeu de rôles déductif où civils et imposteurs s\'affrontent, tandis que le Ghost Frame tente de survivre sans connaître son rôle !',
  minPlayers: 3,
  maxPlayers: 10,
  estimatedDuration: 15,
  difficulty: 'medium',
  category: ['party', 'deduction', 'social', 'roles']
}






