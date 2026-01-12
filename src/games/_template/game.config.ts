import { GameConfig } from '@/types'

/**
 * Configuration du jeu template
 * 
 * Ce fichier définit les métadonnées de base du jeu.
 * Copiez ce template et modifiez les valeurs pour créer un nouveau jeu.
 */
export const gameConfig: GameConfig = {
  // Identifiant unique du jeu (utilisé dans l'URL et la base de données)
  id: 'template',
  
  // Nom affiché du jeu
  name: 'Jeu Template',
  
  // Description courte du jeu
  description: 'Un template de base pour créer de nouveaux jeux',
  
  // Nombre minimum de joueurs requis
  minPlayers: 2,
  
  // Nombre maximum de joueurs autorisés
  maxPlayers: 8,
  
  // Durée estimée en minutes
  estimatedDuration: 15,
  
  // Niveau de difficulté
  difficulty: 'easy',
  
  // Catégories du jeu (pour le filtrage)
  category: ['party', 'template']
}
