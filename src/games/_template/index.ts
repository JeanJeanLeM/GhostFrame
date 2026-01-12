import { GameModule } from '@/types'
import { gameConfig } from './game.config'
import { TemplateGameLogic } from './game.logic'
import { TemplateGameUI } from './game.ui'

/**
 * Module de jeu template
 * 
 * Ce fichier exporte le module complet du jeu template.
 * Il combine la configuration, la logique et l'interface utilisateur.
 * 
 * Pour créer un nouveau jeu:
 * 1. Copiez le dossier _template
 * 2. Renommez-le avec le nom de votre jeu
 * 3. Modifiez les fichiers selon vos besoins
 * 4. Importez et enregistrez le module dans gameRegistry.ts
 */

export const templateGameModule: GameModule = {
  config: gameConfig,
  logic: new TemplateGameLogic(),
  ui: new TemplateGameUI()
}

// Export des types et utilitaires pour faciliter l'extension
export * from './game.config'
export * from './game.state'
export * from './game.logic'
export * from './game.ui'
