import { GameUI, Player } from '@/types'
import { TemplateGameState } from './game.state'

/**
 * Interface utilisateur du jeu template
 * 
 * Cette classe est responsable du rendu de l'interface du jeu.
 * Elle génère les éléments HTML pour l'affichage du plateau,
 * des actions disponibles et du tableau des scores.
 */
export class TemplateGameUI implements GameUI {
  
  /**
   * Rend le plateau de jeu principal
   */
  renderGameBoard(gameState: any, currentPlayer: Player): HTMLElement {
    const state = gameState as TemplateGameState
    
    const container = document.createElement('div')
    container.className = 'game-board bg-white rounded-xl shadow-lg p-6'
    
    // Titre et informations de base
    const header = document.createElement('div')
    header.className = 'mb-6'
    header.innerHTML = `
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Jeu Template</h2>
      <div class="flex items-center space-x-4 text-sm text-gray-600">
        <span>Tour ${state.currentTurn + 1}</span>
        <span>Phase: ${this.getPhaseLabel(state.phase)}</span>
        <span>Compteur: ${state.gameData.globalCounter}</span>
      </div>
    `
    
    // Indicateur du joueur actuel
    const currentPlayerIndicator = document.createElement('div')
    currentPlayerIndicator.className = 'mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200'
    
    if (state.currentPlayerId === currentPlayer.uid) {
      currentPlayerIndicator.innerHTML = `
        <div class="flex items-center">
          <div class="w-3 h-3 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
          <span class="font-medium text-primary-700">C'est votre tour !</span>
        </div>
      `
    } else {
      const currentPlayerName = this.getPlayerName(state.currentPlayerId, currentPlayer)
      currentPlayerIndicator.innerHTML = `
        <div class="flex items-center">
          <div class="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
          <span class="text-gray-600">Tour de ${currentPlayerName}</span>
        </div>
      `
    }
    
    // Zone de jeu principale
    const gameArea = document.createElement('div')
    gameArea.className = 'mb-6 p-4 bg-gray-50 rounded-lg min-h-32'
    
    if (state.phase === 'playing') {
      gameArea.innerHTML = `
        <div class="text-center">
          <p class="text-lg text-gray-700 mb-4">
            Exemple de zone de jeu interactive
          </p>
          <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            ${Array.from({ length: 9 }, (_, i) => `
              <button 
                class="game-cell w-16 h-16 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-colors"
                data-cell="${i}"
              >
                ${i + 1}
              </button>
            `).join('')}
          </div>
        </div>
      `
    } else {
      gameArea.innerHTML = `
        <div class="text-center text-gray-500">
          <p>Le jeu va bientôt commencer...</p>
        </div>
      `
    }
    
    // Historique des actions (optionnel)
    const history = this.renderActionHistory(state)
    
    container.appendChild(header)
    container.appendChild(currentPlayerIndicator)
    container.appendChild(gameArea)
    container.appendChild(history)
    
    return container
  }
  
  /**
   * Rend les actions disponibles pour le joueur
   */
  renderPlayerActions(gameState: any, currentPlayer: Player): HTMLElement {
    const state = gameState as TemplateGameState
    
    const container = document.createElement('div')
    container.className = 'player-actions bg-white rounded-xl shadow-lg p-6'
    
    const title = document.createElement('h3')
    title.className = 'text-lg font-semibold text-gray-900 mb-4'
    title.textContent = 'Actions disponibles'
    
    const actionsContainer = document.createElement('div')
    actionsContainer.className = 'space-y-3'
    
    // Vérifier si c'est le tour du joueur
    const isPlayerTurn = state.currentPlayerId === currentPlayer.uid
    const hasPlayed = state.gameData.playerStates[currentPlayer.uid]?.hasPlayed
    
    if (state.phase !== 'playing') {
      actionsContainer.innerHTML = `
        <p class="text-gray-500 text-center py-4">
          En attente du début de la partie...
        </p>
      `
    } else if (!isPlayerTurn) {
      actionsContainer.innerHTML = `
        <p class="text-gray-500 text-center py-4">
          En attente de votre tour...
        </p>
      `
    } else if (hasPlayed) {
      actionsContainer.innerHTML = `
        <p class="text-success-600 text-center py-4">
          ✓ Vous avez joué ce tour
        </p>
      `
    } else {
      // Actions disponibles
      const actions = [
        {
          id: 'example-action',
          label: 'Action d\'exemple',
          description: 'Effectuer une action d\'exemple (+10 points)',
          className: 'btn-primary',
          data: { type: 'EXAMPLE_ACTION' }
        },
        {
          id: 'pass-turn',
          label: 'Passer le tour',
          description: 'Passer votre tour sans jouer',
          className: 'btn-secondary',
          data: { type: 'PASS_TURN' }
        }
      ]
      
      // Ajouter l'action de fin si les conditions sont remplies
      if (state.currentTurn >= 5) {
        actions.push({
          id: 'end-game',
          label: 'Terminer la partie',
          description: 'Terminer la partie maintenant',
          className: 'btn-danger',
          data: { type: 'END_GAME' }
        })
      }
      
      actions.forEach(action => {
        const button = document.createElement('button')
        button.className = `w-full ${action.className} text-left`
        button.dataset.action = JSON.stringify(action.data)
        button.innerHTML = `
          <div>
            <div class="font-medium">${action.label}</div>
            <div class="text-sm opacity-75">${action.description}</div>
          </div>
        `
        actionsContainer.appendChild(button)
      })
    }
    
    container.appendChild(title)
    container.appendChild(actionsContainer)
    
    return container
  }
  
  /**
   * Rend le tableau des scores
   */
  renderScoreboard(players: Player[]): HTMLElement {
    const container = document.createElement('div')
    container.className = 'scoreboard bg-white rounded-xl shadow-lg p-6'
    
    const title = document.createElement('h3')
    title.className = 'text-lg font-semibold text-gray-900 mb-4'
    title.textContent = 'Scores'
    
    const playersList = document.createElement('div')
    playersList.className = 'space-y-3'
    
    // Trier les joueurs par score
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
    
    sortedPlayers.forEach((player, index) => {
      const playerItem = document.createElement('div')
      
      // Classes CSS dynamiques pour la carte
      let cardClasses = 'player-card !p-4'
      if (index === 0) cardClasses += ' !border-yellow-300 !bg-gradient-to-br !from-yellow-50 !to-white'
      else if (player.connected) cardClasses += ' online'
      else cardClasses += ' offline'
      
      playerItem.className = cardClasses
      
      playerItem.innerHTML = `
        ${index === 0 ? '<div class="player-role-indicator !bg-gradient-to-br !from-yellow-400 !to-yellow-500">🏆</div>' : ''}
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="player-avatar ${player.connected ? 'online' : 'offline'} !w-10 !h-10 !text-base">
              ${index + 1}
            </div>
            
            <div class="flex-1">
              <div class="font-bold text-gray-900 text-lg">
                ${player.displayName}
              </div>
              <div class="flex items-center space-x-2 mt-1">
                <span class="player-status-badge ${player.connected ? 'online' : 'offline'}">
                  ${player.connected ? '🟢 En ligne' : '🔴 Hors ligne'}
                </span>
                ${player.isHost ? '<span class="text-xs text-yellow-600 font-medium">👑 Hôte</span>' : ''}
              </div>
            </div>
          </div>
          
          <div class="text-2xl font-bold ${
            index === 0 ? 'text-yellow-600' : 'text-gray-900'
          }">
            ${player.score}
          </div>
        </div>
      `
      
      playersList.appendChild(playerItem)
    })
    
    container.appendChild(title)
    container.appendChild(playersList)
    
    return container
  }
  
  /**
   * Appelé quand l'état du jeu est mis à jour
   */
  onGameStateUpdate(gameState: any): void {
    const state = gameState as TemplateGameState
    
    // Mettre à jour les éléments dynamiques
    this.updateGameCells(state)
    this.updateActionButtons(state)
    
    // Jouer des sons ou animations si nécessaire
    if (state.gameData.actionHistory.length > 0) {
      const lastAction = state.gameData.actionHistory[state.gameData.actionHistory.length - 1]
      this.playActionFeedback(lastAction.action)
    }
  }
  
  // --- Méthodes utilitaires privées ---
  
  private getPhaseLabel(phase: string): string {
    switch (phase) {
      case 'waiting': return 'En attente'
      case 'playing': return 'En cours'
      case 'finished': return 'Terminé'
      default: return phase
    }
  }
  
  private getPlayerName(playerId: string, currentPlayer: Player): string {
    // Dans un vrai jeu, vous auriez accès à la liste complète des joueurs
    return playerId === currentPlayer.uid ? 'Vous' : 'Autre joueur'
  }
  
  private renderActionHistory(state: TemplateGameState): HTMLElement {
    const container = document.createElement('div')
    container.className = 'action-history'
    
    if (state.gameData.actionHistory.length === 0) {
      return container
    }
    
    const title = document.createElement('h4')
    title.className = 'text-sm font-medium text-gray-700 mb-2'
    title.textContent = 'Dernières actions'
    
    const list = document.createElement('div')
    list.className = 'space-y-1 max-h-32 overflow-y-auto'
    
    // Afficher les 5 dernières actions
    const recentActions = state.gameData.actionHistory.slice(-5).reverse()
    
    recentActions.forEach(action => {
      const item = document.createElement('div')
      item.className = 'text-xs text-gray-600 p-2 bg-gray-50 rounded'
      item.textContent = `${action.action} par ${action.playerId}`
      list.appendChild(item)
    })
    
    container.appendChild(title)
    container.appendChild(list)
    
    return container
  }
  
  private updateGameCells(state: TemplateGameState): void {
    // Mettre à jour l'apparence des cellules de jeu
    const cells = document.querySelectorAll('.game-cell')
    cells.forEach((cell, index) => {
      // Exemple de logique de mise à jour
      if (state.gameData.globalCounter > index) {
        cell.classList.add('bg-primary-100', 'border-primary-300')
      }
    })
  }
  
  private updateActionButtons(state: TemplateGameState): void {
    // Mettre à jour l'état des boutons d'action
    const buttons = document.querySelectorAll('[data-action]')
    buttons.forEach(button => {
      const buttonElement = button as HTMLButtonElement
      // Logique de mise à jour des boutons
    })
  }
  
  private playActionFeedback(actionType: string): void {
    // Jouer un son ou une animation selon l'action
    console.log(`Feedback pour l'action: ${actionType}`)
  }
}
