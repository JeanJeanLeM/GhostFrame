import { GameSession, Player, User } from '@/types'
import { GameSessionService } from '@core/gameSession'
import { AuthService } from '@core/auth'
import { PresenceService } from '@utils/presence'
import { ErrorHandler } from '@core/errorHandler'
import { gameRegistry } from '@games/gameRegistry'

export class GameView {
  private container: HTMLElement
  private gameSession: GameSession
  private gameSessionService: GameSessionService
  private authService: AuthService
  private presenceService: PresenceService
  private unsubscribeGame: (() => void) | null = null
  private onGameEnd: (gameSession: GameSession) => void

  constructor(
    container: HTMLElement,
    gameSession: GameSession,
    gameSessionService: GameSessionService,
    authService: AuthService,
    onGameEnd: (gameSession: GameSession) => void
  ) {
    this.container = container
    this.gameSession = gameSession
    this.gameSessionService = gameSessionService
    this.authService = authService
    this.presenceService = new PresenceService()
    this.onGameEnd = onGameEnd
    
    this.initialize()
  }

  private async initialize(): Promise<void> {
    // Démarrer le suivi de présence
    const currentUser = this.authService.getCurrentUser()
    if (currentUser) {
      this.presenceService.startPresenceTracking(this.gameSession.id, currentUser.uid)
    }

    // Écouter les changements de la session
    this.unsubscribeGame = this.gameSessionService.subscribeToGame(
      this.gameSession.id,
      (updatedGame) => {
        if (updatedGame) {
          this.gameSession = updatedGame
          this.render()
          
          // Vérifier si le jeu est terminé
          if (updatedGame.status === 'FINISHED') {
            this.onGameEnd(updatedGame)
          }
        }
      }
    )

    // Écouter les actions de jeu
    document.addEventListener('gameAction', this.handleGameAction.bind(this))

    this.render()
  }

  private render(): void {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return

    const gameModule = gameRegistry.getGame(this.gameSession.gameType)
    if (!gameModule) {
      this.container.innerHTML = `
        <div class="text-center py-12">
          <h2 class="text-xl font-semibold text-error-600 mb-4">Jeu non trouvé</h2>
          <p class="text-gray-600">Le type de jeu "${this.gameSession.gameType}" n'est pas disponible.</p>
        </div>
      `
      return
    }

    const players = Object.values(this.gameSession.players)
    const currentPlayer = this.gameSession.players[currentUser.uid]

    if (!currentPlayer) {
      this.container.innerHTML = `
        <div class="text-center py-12">
          <h2 class="text-xl font-semibold text-error-600 mb-4">Accès refusé</h2>
          <p class="text-gray-600">Vous ne faites pas partie de cette partie.</p>
        </div>
      `
      return
    }

    this.container.innerHTML = `
      <div class="game-view max-w-7xl mx-auto">
        <!-- En-tête de la partie -->
        <div class="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h1 class="text-xl font-bold text-gray-900">${gameModule.config.name}</h1>
              <span class="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
                En cours
              </span>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-500">
                Code: <span class="font-mono font-bold">${this.gameSession.code}</span>
              </div>
              
              <button id="leave-game-btn" class="btn-secondary text-sm">
                🚪 Quitter
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <!-- Zone de jeu principale -->
          <div class="xl:col-span-3 space-y-6">
            <!-- Plateau de jeu -->
            <div id="game-board-container">
              ${this.renderGameBoard(gameModule, currentPlayer)}
            </div>
            
            <!-- Actions du joueur -->
            <div id="player-actions-container">
              ${this.renderPlayerActions(gameModule, currentPlayer)}
            </div>
          </div>

          <!-- Barre latérale -->
          <div class="space-y-6">
            <!-- Tableau des scores -->
            <div id="scoreboard-container">
              ${this.renderScoreboard(gameModule, players)}
            </div>
            
            <!-- Informations de la partie -->
            <div class="bg-white rounded-xl shadow-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Informations</h3>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Statut:</span>
                  <span class="font-medium">${this.getStatusLabel(this.gameSession.status)}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Tour:</span>
                  <span class="font-medium">${this.gameSession.currentTurn + 1}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Joueurs:</span>
                  <span class="font-medium">${players.length}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Créé:</span>
                  <span class="font-medium">${this.formatTime(this.gameSession.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <!-- Joueurs connectés -->
            <div class="bg-white rounded-xl shadow-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Joueurs</h3>
              
              <div class="space-y-2">
                ${players.map(player => this.renderPlayerStatus(player, currentUser)).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
    
    // Notifier le module de jeu de la mise à jour
    if (gameModule.ui.onGameStateUpdate) {
      gameModule.ui.onGameStateUpdate(this.gameSession.state)
    }
  }

  private renderGameBoard(gameModule: any, currentPlayer: Player): string {
    try {
      const boardElement = gameModule.ui.renderGameBoard(this.gameSession.state, currentPlayer)
      return boardElement.outerHTML
    } catch (error) {
      console.error('Erreur lors du rendu du plateau:', error)
      return `
        <div class="bg-white rounded-xl shadow-lg p-6 text-center">
          <p class="text-error-600">Erreur lors du chargement du plateau de jeu</p>
        </div>
      `
    }
  }

  private renderPlayerActions(gameModule: any, currentPlayer: Player): string {
    try {
      const actionsElement = gameModule.ui.renderPlayerActions(this.gameSession.state, currentPlayer)
      return actionsElement.outerHTML
    } catch (error) {
      console.error('Erreur lors du rendu des actions:', error)
      return `
        <div class="bg-white rounded-xl shadow-lg p-6 text-center">
          <p class="text-error-600">Erreur lors du chargement des actions</p>
        </div>
      `
    }
  }

  private renderScoreboard(gameModule: any, players: Player[]): string {
    try {
      const scoreboardElement = gameModule.ui.renderScoreboard(players)
      return scoreboardElement.outerHTML
    } catch (error) {
      console.error('Erreur lors du rendu du tableau des scores:', error)
      return `
        <div class="bg-white rounded-xl shadow-lg p-6 text-center">
          <p class="text-error-600">Erreur lors du chargement des scores</p>
        </div>
      `
    }
  }

  private renderPlayerStatus(player: Player, currentUser: User): string {
    const isCurrentUser = player.uid === currentUser.uid
    const isOnline = PresenceService.isPlayerOnline(player.lastSeen, player.connected)
    
    // Classes CSS dynamiques pour la carte compacte
    let cardClasses = 'player-card !p-2 !shadow-md'
    if (isCurrentUser) cardClasses += ' current-user'
    else if (player.isHost) cardClasses += ' host'
    else if (isOnline) cardClasses += ' online'
    else cardClasses += ' offline'
    
    return `
      <div class="${cardClasses}">
        ${player.isHost ? '<div class="player-role-indicator host !w-6 !h-6 !text-sm">👑</div>' : ''}
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="player-avatar !w-8 !h-8 !text-sm ${isOnline ? 'online' : 'offline'}">
              ${player.displayName.charAt(0).toUpperCase()}
            </div>
            
            <div class="flex-1">
              <div class="flex items-center space-x-1">
                <span class="text-sm font-semibold text-gray-900">
                  ${player.displayName}
                </span>
                ${isCurrentUser ? '<span class="text-blue-600 text-xs">(Vous)</span>' : ''}
              </div>
            </div>
          </div>
          
          <div class="player-status-badge !px-2 !py-0.5 !text-xs ${isOnline ? 'online' : 'offline'}">
            ${isOnline ? '🟢' : '🔴'}
          </div>
        </div>
      </div>
    `
  }

  private setupEventListeners(): void {
    // Bouton quitter
    const leaveBtn = document.getElementById('leave-game-btn')
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => this.leaveGame())
    }

    // Délégation d'événements pour les actions de jeu
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const actionData = target.dataset.action
      
      if (actionData) {
        try {
          const action = JSON.parse(actionData)
          this.handleGameAction({ detail: action } as CustomEvent)
        } catch (error) {
          console.error('Erreur lors du parsing de l\'action:', error)
        }
      }
    })
  }

  private async handleGameAction(event: CustomEvent): Promise<void> {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return

    const action = event.detail
    const gameModule = gameRegistry.getGame(this.gameSession.gameType)
    
    if (!gameModule) {
      ErrorHandler.handleError(new Error('Module de jeu non trouvé'), 'Erreur de jeu')
      return
    }

    try {
      // Valider l'action
      const isValid = gameModule.logic.validateMove(
        this.gameSession.state,
        currentUser.uid,
        action
      )

      if (!isValid) {
        ErrorHandler.handleError(new Error('Action non autorisée'), 'Action invalide')
        return
      }

      // Traiter l'action
      const newState = gameModule.logic.processMove(
        this.gameSession.state,
        currentUser.uid,
        action
      )

      // Mettre à jour l'état dans Firestore
      await this.gameSessionService.updateGameState(this.gameSession.id, newState)

      // Vérifier les conditions de victoire
      const winCondition = gameModule.logic.checkWinCondition(newState)
      
      if (winCondition.isFinished && winCondition.scores) {
        await this.gameSessionService.finishGame(this.gameSession.id, winCondition.scores)
      }

    } catch (error) {
      ErrorHandler.handleError(error as Error, 'Erreur lors de l\'action')
    }
  }

  private async leaveGame(): Promise<void> {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return

    if (confirm('Êtes-vous sûr de vouloir quitter cette partie en cours ?')) {
      try {
        await this.gameSessionService.leaveGame(this.gameSession.id, currentUser.uid)
        
        // Naviguer vers l'accueil
        window.location.href = '/'
      } catch (error) {
        ErrorHandler.handleError(error as Error, 'Impossible de quitter la partie')
      }
    }
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'CREATED': return 'Créée'
      case 'IN_PROGRESS': return 'En cours'
      case 'FINISHED': return 'Terminée'
      default: return status
    }
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  /**
   * Met à jour l'affichage du jeu
   */
  refresh(): void {
    this.render()
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    if (this.unsubscribeGame) {
      this.unsubscribeGame()
    }
    
    this.presenceService.stopPresenceTracking()
    
    // Supprimer l'écouteur d'événements
    document.removeEventListener('gameAction', this.handleGameAction.bind(this))
  }
}
