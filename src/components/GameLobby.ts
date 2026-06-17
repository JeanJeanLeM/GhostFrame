import { GameSession, Player, User } from '@/types'
import { GameSessionService } from '@core/gameSession'
import { AuthService } from '@core/auth'
import { PresenceService } from '@utils/presence'
import { generateGameQRCode } from '@utils/qrCode'
import { formatGameCode } from '@utils/gameCode'
import { ErrorHandler } from '@core/errorHandler'
import { gameRegistry } from '@games/gameRegistry'

export class GameLobby {
  private container: HTMLElement
  private gameSession: GameSession
  private gameSessionService: GameSessionService
  private authService: AuthService
  private presenceService: PresenceService
  private unsubscribeGame: (() => void) | null = null
  private onGameStart: (gameSession: GameSession) => void

  constructor(
    container: HTMLElement,
    gameSession: GameSession,
    gameSessionService: GameSessionService,
    authService: AuthService,
    onGameStart: (gameSession: GameSession) => void
  ) {
    this.container = container
    this.gameSession = gameSession
    this.gameSessionService = gameSessionService
    this.authService = authService
    this.presenceService = new PresenceService()
    this.onGameStart = onGameStart
    
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
          
          // Vérifier si le jeu a commencé
          if (updatedGame.status === 'IN_PROGRESS') {
            this.onGameStart(updatedGame)
          }
        }
      }
    )

    this.render()
  }

  private render(): void {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return

    const gameConfig = gameRegistry.getGame(this.gameSession.gameType)?.config
    const isHost = this.gameSession.createdBy === currentUser.uid
    const players = Object.values(this.gameSession.players)
    const readyCount = players.filter(p => p.isReady).length
    const canStart = players.length >= (gameConfig?.minPlayers || 2) && readyCount === players.length

    this.container.innerHTML = `
      <div class="game-lobby max-w-4xl mx-auto">
        <!-- En-tête -->
        <div class="bg-beige-50 rounded-xl shadow-lg p-6 mb-6 border border-beige-200">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-beige-900">${gameConfig?.name || 'Jeu'}</h1>
              <p class="text-beige-700">${gameConfig?.description || ''}</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-beige-600">Code de la partie</div>
              <div class="text-2xl font-mono font-bold text-primary-600">
                ${formatGameCode(this.gameSession.code)}
              </div>
            </div>
          </div>
          
          <!-- Informations du jeu -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-beige-100 rounded-lg">
            <div class="text-center">
              <div class="text-2xl font-bold text-beige-900">${players.length}</div>
              <div class="text-sm text-beige-600">Joueurs</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-beige-900">${gameConfig?.minPlayers || 0}-${gameConfig?.maxPlayers || 0}</div>
              <div class="text-sm text-beige-600">Requis</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-beige-900">~${gameConfig?.estimatedDuration || 0}</div>
              <div class="text-sm text-beige-600">Minutes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-beige-900">${readyCount}/${players.length}</div>
              <div class="text-sm text-beige-600">Prêts</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Liste des joueurs -->
          <div class="lg:col-span-2">
            <div class="bg-beige-50 rounded-xl shadow-lg p-6 border border-beige-200">
              <h2 class="text-lg font-semibold text-beige-900 mb-4">
                Joueurs (${players.length}/${gameConfig?.maxPlayers || 8})
              </h2>
              
              <div class="space-y-3">
                ${players.map(player => this.renderPlayerItem(player, currentUser)).join('')}
              </div>
              
              ${players.length < (gameConfig?.maxPlayers || 8) ? `
                <div class="mt-4 p-4 border-2 border-dashed border-beige-300 rounded-lg text-center">
                  <p class="text-beige-600 text-sm">
                    En attente d'autres joueurs...
                  </p>
                  <p class="text-beige-500 text-xs mt-1">
                    Partagez le code de la partie : <strong>${this.gameSession.code}</strong>
                  </p>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Actions et QR Code -->
          <div class="space-y-6">
            <!-- Actions du joueur -->
            <div class="bg-beige-50 rounded-xl shadow-lg p-6 border border-beige-200">
              <h3 class="text-lg font-semibold text-beige-900 mb-4">Actions</h3>
              
              ${this.renderPlayerActions(currentUser, isHost, canStart)}
            </div>

            <!-- QR Code -->
            <div class="bg-beige-50 rounded-xl shadow-lg p-6 border border-beige-200">
              <h3 class="text-lg font-semibold text-beige-900 mb-4">Inviter des joueurs</h3>
              
              <div class="text-center">
                <div id="qr-code-container" class="mb-4">
                  <div class="w-48 h-48 bg-beige-100 rounded-lg flex items-center justify-center mx-auto">
                    <div class="loading-spinner"></div>
                  </div>
                </div>
                
                <p class="text-sm text-beige-700 mb-3">
                  Scannez ce QR code pour rejoindre
                </p>
                
                <div class="space-y-2">
                  <button id="copy-code-btn" class="btn-secondary w-full text-sm">
                    📋 Copier le code
                  </button>
                  <button id="share-link-btn" class="btn-secondary w-full text-sm">
                    🔗 Partager le lien
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
    this.loadQRCode()
  }

  private renderPlayerItem(player: Player, currentUser: User): string {
    const isCurrentUser = player.uid === currentUser.uid
    const isOnline = PresenceService.isPlayerOnline(player.lastSeen, player.connected)
    
    // Classes CSS dynamiques pour la carte
    let cardClasses = 'player-card'
    if (isCurrentUser) cardClasses += ' current-user'
    else if (player.isHost) cardClasses += ' host'
    else if (isOnline) cardClasses += ' online'
    else cardClasses += ' offline'
    
    return `
      <div class="${cardClasses}">
        ${player.isHost ? '<div class="player-role-indicator host">👑</div>' : ''}
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="player-avatar ${isOnline ? 'online' : 'offline'}">
              ${player.displayName.charAt(0).toUpperCase()}
            </div>
            
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <h3 class="font-bold text-beige-900 text-lg">
                  ${player.displayName}
                </h3>
                ${isCurrentUser ? '<span class="text-primary-600 text-sm font-medium">(Vous)</span>' : ''}
              </div>
              
              <div class="flex items-center space-x-2 mt-1">
                <span class="player-status-badge ${isOnline ? 'online' : 'offline'}">
                  ${isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
                </span>
                ${!isOnline ? `<span class="text-xs text-beige-600">${PresenceService.getTimeSinceLastSeen(player.lastSeen)}</span>` : ''}
              </div>
            </div>
          </div>
          
          <div class="flex flex-col items-end space-y-2">
            <span class="player-status-badge ${player.isReady ? 'ready' : 'waiting'}">
              ${player.isReady ? '✓ Prêt' : 'En attente'}
            </span>
          </div>
        </div>
      </div>
    `
  }

  private renderPlayerActions(currentUser: User, isHost: boolean, canStart: boolean): string {
    const currentPlayer = this.gameSession.players[currentUser.uid]
    const isReady = currentPlayer?.isReady || false

    let actions = ''

    // Bouton prêt/pas prêt
    if (!isReady) {
      actions += `
        <button id="ready-btn" class="btn-success w-full mb-3">
          ✓ Je suis prêt !
        </button>
      `
    } else {
      actions += `
        <button id="not-ready-btn" class="btn-secondary w-full mb-3">
          ⏸️ Pas encore prêt
        </button>
      `
    }

    // Bouton de démarrage (hôte uniquement)
    if (isHost) {
      if (canStart) {
        actions += `
          <button id="start-game-btn" class="btn-primary w-full mb-3">
            🚀 Démarrer la partie
          </button>
        `
      } else {
        const players = Object.values(this.gameSession.players)
        const gameConfig = gameRegistry.getGame(this.gameSession.gameType)?.config
        const minPlayers = gameConfig?.minPlayers || 2
        
        let reason = ''
        if (players.length < minPlayers) {
          reason = `Il faut au moins ${minPlayers} joueurs`
        } else {
          const notReady = players.filter(p => !p.isReady).length
          reason = `${notReady} joueur(s) pas encore prêt(s)`
        }
        
        actions += `
          <button class="btn-disabled w-full mb-3" disabled>
            En attente (${reason})
          </button>
        `
      }
    }

    // Bouton quitter
    actions += `
      <button id="leave-game-btn" class="btn-danger w-full">
        🚪 Quitter la partie
      </button>
    `

    return actions
  }

  private setupEventListeners(): void {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return

    // Bouton prêt
    const readyBtn = document.getElementById('ready-btn')
    if (readyBtn) {
      readyBtn.addEventListener('click', () => this.toggleReady(true))
    }

    // Bouton pas prêt
    const notReadyBtn = document.getElementById('not-ready-btn')
    if (notReadyBtn) {
      notReadyBtn.addEventListener('click', () => this.toggleReady(false))
    }

    // Bouton démarrer
    const startBtn = document.getElementById('start-game-btn')
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame())
    }

    // Bouton quitter
    const leaveBtn = document.getElementById('leave-game-btn')
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => this.leaveGame())
    }

    // Bouton copier code
    const copyBtn = document.getElementById('copy-code-btn')
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyGameCode())
    }

    // Bouton partager lien
    const shareBtn = document.getElementById('share-link-btn')
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareGameLink())
    }
  }

  private async toggleReady(isReady: boolean): Promise<void> {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return

    try {
      await this.gameSessionService.updatePlayerReady(
        this.gameSession.id,
        currentUser.uid,
        isReady
      )
      
      ErrorHandler.showSuccess(isReady ? 'Vous êtes prêt !' : 'Statut mis à jour')
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'Impossible de mettre à jour le statut')
    }
  }

  private async startGame(): Promise<void> {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return

    try {
      const gameModule = gameRegistry.getGame(this.gameSession.gameType)
      if (!gameModule) {
        throw new Error('Jeu non trouvé')
      }

      const players = Object.values(this.gameSession.players)
      const initialGameState = gameModule.logic.initializeGameState(players)

      await this.gameSessionService.startGame(
        this.gameSession.id,
        currentUser.uid,
        initialGameState
      )

      ErrorHandler.showSuccess('Partie démarrée !')
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'Impossible de démarrer la partie')
    }
  }

  private async leaveGame(): Promise<void> {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return

    if (confirm('Êtes-vous sûr de vouloir quitter cette partie ?')) {
      try {
        await this.gameSessionService.leaveGame(this.gameSession.id, currentUser.uid)
        
        // Naviguer vers l'accueil
        window.location.href = '/'
      } catch (error) {
        ErrorHandler.handleError(error as Error, 'Impossible de quitter la partie')
      }
    }
  }

  private async loadQRCode(): Promise<void> {
    try {
      const qrCodeDataUrl = await generateGameQRCode(this.gameSession.code)
      const container = document.getElementById('qr-code-container')
      
      if (container) {
        container.innerHTML = `
          <img 
            src="${qrCodeDataUrl}" 
            alt="QR Code pour rejoindre la partie"
            class="w-48 h-48 mx-auto rounded-lg"
          >
        `
      }
    } catch (error) {
      console.error('Erreur lors du chargement du QR code:', error)
      const container = document.getElementById('qr-code-container')
      if (container) {
        container.innerHTML = `
          <div class="w-48 h-48 bg-beige-100 rounded-lg flex items-center justify-center mx-auto">
            <span class="text-beige-600 text-sm">QR code indisponible</span>
          </div>
        `
      }
    }
  }

  private async copyGameCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.gameSession.code)
      ErrorHandler.showSuccess('Code copié dans le presse-papiers !')
    } catch (error) {
      // Fallback pour les navigateurs qui ne supportent pas clipboard
      const textArea = document.createElement('textarea')
      textArea.value = this.gameSession.code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      ErrorHandler.showSuccess('Code copié !')
    }
  }

  private async shareGameLink(): Promise<void> {
    const gameUrl = `${window.location.origin}/join/${this.gameSession.code}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez ma partie !',
          text: `Rejoignez ma partie avec le code: ${this.gameSession.code}`,
          url: gameUrl
        })
      } catch (error) {
        // L'utilisateur a annulé le partage
      }
    } else {
      // Fallback: copier le lien
      try {
        await navigator.clipboard.writeText(gameUrl)
        ErrorHandler.showSuccess('Lien copié dans le presse-papiers !')
      } catch (error) {
        ErrorHandler.handleError(error as Error, 'Impossible de partager le lien')
      }
    }
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    if (this.unsubscribeGame) {
      this.unsubscribeGame()
    }
    
    this.presenceService.stopPresenceTracking()
  }
}
