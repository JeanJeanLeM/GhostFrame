import { GameConfig } from '@/types'

export const gameConfig: GameConfig = {
  id: 'guessing-game',
  name: 'Jeu de Devinettes',
  description: 'Devinez le nombre secret choisi par les autres joueurs !',
  minPlayers: 2,
  maxPlayers: 6,
  estimatedDuration: 10,
  difficulty: 'easy',
  category: ['party', 'numbers', 'guessing']
}
