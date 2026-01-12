import { ErrorHandler } from '@core/errorHandler'
import { MisterWhiteGameUI } from '@games/mister-white/game.ui'
import { MisterWhiteGameLogic } from '@games/mister-white/game.logic'
import { createInitialGameState, MisterWhiteAction } from '@games/mister-white/game.state'

/**
 * Application dédiée au jeu Ghost Frame
 * Pas de routeur, pas de Firebase - Juste Ghost Frame en mode single-device
 */
export class App {
  private container: HTMLElement
  private misterWhiteUI: MisterWhiteGameUI
  private misterWhiteLogic: MisterWhiteGameLogic
  private misterWhiteState: any

  constructor() {
    this.container = document.getElementById('app')!
    
    // Initialiser Ghost Frame directement
    this.misterWhiteUI = new MisterWhiteGameUI()
    this.misterWhiteUI.setContainer(this.container) // Définir le conteneur pour les mises à jour automatiques
    this.misterWhiteLogic = new MisterWhiteGameLogic()
    this.misterWhiteState = createInitialGameState()
    
    this.initialize()
  }

  private async initialize(): Promise<void> {
    // Écouter les actions du jeu Ghost Frame
    document.addEventListener('ghost-frame-action', (event: any) => {
      this.handleMisterWhiteAction(event.detail)
    })
    
    // Démarrer directement le jeu
    this.renderMisterWhite()
  }

  private handleMisterWhiteAction(action: MisterWhiteAction): void {
    try {
      console.log('🎮 Action Ghost Frame:', action.type, action.data)
      
      // Valider et traiter l'action
      if (this.misterWhiteLogic.validateMove(this.misterWhiteState, 'local-player', action)) {
        this.misterWhiteState = this.misterWhiteLogic.processMove(this.misterWhiteState, 'local-player', action)
        
        // Re-rendre l'interface avec les event listeners
        this.misterWhiteUI.onGameStateUpdate(this.misterWhiteState)
        
        // Vérifier les conditions de victoire
        const winCondition = this.misterWhiteLogic.checkWinCondition(this.misterWhiteState)
        if (winCondition.isFinished) {
          console.log('🏆 Partie terminée !', winCondition)
        }
        
        console.log('🎯 État actuel:', this.misterWhiteState.phase)
      } else {
        console.warn('⚠️ Action invalide:', action)
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement de l\'action:', error)
      ErrorHandler.handleError(error as Error, 'Erreur de jeu')
    }
  }
  private renderMisterWhite(): void {
    // Créer un joueur fictif pour l'interface
    const dummyPlayer = {
      uid: 'local-player',
      displayName: 'Joueur Local',
      isAnonymous: true,
      connected: true,
      lastSeen: new Date(),
      score: 0,
      isReady: true,
      isHost: true
    }
    
    // Rendre le jeu
    const gameBoard = this.misterWhiteUI.renderGameBoard(this.misterWhiteState, dummyPlayer)
    this.container.innerHTML = ''
    this.container.appendChild(gameBoard)
  }
}
