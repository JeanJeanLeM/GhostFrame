import { GameUI, Player } from '@/types'
import { GuessingGameState } from './game.state'

export class GuessingGameUI implements GameUI {
  
  renderGameBoard(gameState: any, currentPlayer: Player): HTMLElement {
    const state = gameState as GuessingGameState
    
    const container = document.createElement('div')
    container.className = 'game-board bg-beige-50 rounded-xl shadow-lg p-6 border border-beige-200'
    
    // En-tête du jeu
    const header = this.renderHeader(state)
    
    // Zone principale selon la phase
    const mainArea = this.renderMainArea(state, currentPlayer)
    
    // Historique des tentatives
    const history = this.renderGuessHistory(state)
    
    container.appendChild(header)
    container.appendChild(mainArea)
    container.appendChild(history)
    
    return container
  }
  
  renderPlayerActions(gameState: any, currentPlayer: Player): HTMLElement {
    const state = gameState as GuessingGameState
    
    const container = document.createElement('div')
    container.className = 'player-actions bg-beige-50 rounded-xl shadow-lg p-6 border border-beige-200'
    
    const title = document.createElement('h3')
    title.className = 'text-lg font-semibold text-beige-900 mb-4'
    title.textContent = 'Votre action'
    
    const actionsContainer = document.createElement('div')
    actionsContainer.className = 'space-y-4'
    
    if (state.phase === 'setup') {
      actionsContainer.innerHTML = `
        <p class="text-beige-700 mb-4">Prêt à commencer ?</p>
        <button class="btn-primary w-full" data-action='{"type": "START_GAME"}'>
          Commencer la partie
        </button>
      `
    } else if (state.phase === 'guessing') {
      const isPlayerTurn = state.currentPlayerId === currentPlayer.uid
      const playerState = state.gameData.playerStates[currentPlayer.uid]
      const canGuess = playerState.guessCount < state.gameData.maxGuesses
      
      if (!isPlayerTurn) {
        actionsContainer.innerHTML = `
          <div class="text-center py-4">
            <p class="text-beige-600 mb-2">En attente de votre tour...</p>
            <p class="text-sm text-beige-500">
              Tentatives restantes: ${state.gameData.maxGuesses - playerState.guessCount}
            </p>
          </div>
        `
      } else if (!canGuess) {
        actionsContainer.innerHTML = `
          <div class="text-center py-4">
            <p class="text-error-600 mb-2">Vous avez épuisé vos tentatives</p>
            <p class="text-sm text-beige-600">En attente des autres joueurs...</p>
          </div>
        `
      } else {
        actionsContainer.innerHTML = `
          <div>
            <p class="text-beige-800 mb-4">
              Devinez le nombre entre ${state.gameData.range.min} et ${state.gameData.range.max}
            </p>
            <p class="text-sm text-beige-600 mb-4">
              Tentatives restantes: ${state.gameData.maxGuesses - playerState.guessCount}
            </p>
            
            <div class="space-y-3">
              <input 
                type="number" 
                id="guess-input" 
                class="input w-full text-center text-lg font-bold"
                min="${state.gameData.range.min}" 
                max="${state.gameData.range.max}"
                placeholder="Votre nombre"
              >
              
              <button 
                class="btn-primary w-full" 
                onclick="this.submitGuess()"
                id="submit-guess-btn"
              >
                Valider ma tentative
              </button>
              
              <div class="grid grid-cols-5 gap-2">
                ${this.renderQuickNumbers(state.gameData.range)}
              </div>
            </div>
          </div>
        `
        
        // Ajouter les événements après insertion
        setTimeout(() => this.setupGuessInput(), 10)
      }
    } else if (state.phase === 'reveal') {
      const correctGuess = state.gameData.guesses.find(g => g.result === 'correct')
      
      actionsContainer.innerHTML = `
        <div class="text-center">
          <div class="mb-4 p-4 bg-primary-50 rounded-lg">
            <h4 class="text-lg font-bold text-primary-700 mb-2">
              Nombre secret: ${state.gameData.secretNumber}
            </h4>
            ${correctGuess ? 
              `<p class="text-success-600">🎉 Trouvé par ${correctGuess.playerName} !</p>` :
              `<p class="text-beige-700">Personne n'a trouvé le nombre...</p>`
            }
          </div>
          
          <button class="btn-primary w-full" data-action='{"type": "NEW_ROUND"}'>
            Nouvelle manche
          </button>
        </div>
      `
    } else if (state.phase === 'finished') {
      actionsContainer.innerHTML = `
        <div class="text-center">
          <p class="text-success-600 text-lg font-semibold mb-4">
            🏆 Partie terminée !
          </p>
          <button class="btn-secondary w-full" onclick="window.location.href='/'">
            Retour à l'accueil
          </button>
        </div>
      `
    }
    
    container.appendChild(title)
    container.appendChild(actionsContainer)
    
    return container
  }
  
  renderScoreboard(players: Player[]): HTMLElement {
    const container = document.createElement('div')
    container.className = 'scoreboard bg-beige-50 rounded-xl shadow-lg p-6 border border-beige-200'
    
    const title = document.createElement('h3')
    title.className = 'text-lg font-semibold text-beige-900 mb-4'
    title.textContent = 'Classement'
    
    const playersList = document.createElement('div')
    playersList.className = 'space-y-3'
    
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
    
    sortedPlayers.forEach((player, index) => {
      const playerItem = document.createElement('div')
      playerItem.className = `flex items-center justify-between p-3 rounded-lg ${
        index === 0 ? 'bg-warning-50 border border-warning-500' : 'bg-beige-100'
      }`
      
      const rankIcon = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      
      playerItem.innerHTML = `
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full ${
            player.connected ? 'bg-success-500' : 'bg-beige-400'
          } flex items-center justify-center text-white font-bold mr-3">
            ${rankIcon}
          </div>
          <div>
            <div class="font-medium text-beige-900">${player.displayName}</div>
            <div class="text-xs text-beige-600">
              ${player.connected ? '🟢 En ligne' : '🔴 Hors ligne'}
              ${player.isHost ? ' • 👑 Hôte' : ''}
            </div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold ${
            index === 0 ? 'text-warning-600' : 'text-beige-900'
          }">
            ${player.score} pts
          </div>
        </div>
      `
      
      playersList.appendChild(playerItem)
    })
    
    container.appendChild(title)
    container.appendChild(playersList)
    
    return container
  }
  
  onGameStateUpdate(gameState: any): void {
    const state = gameState as GuessingGameState
    
    // Mettre à jour les éléments dynamiques
    this.updateRangeDisplay(state)
    
    // Jouer des sons selon les événements
    if (state.gameData.guesses.length > 0) {
      const lastGuess = state.gameData.guesses[state.gameData.guesses.length - 1]
      this.playGuessFeedback(lastGuess.result)
    }
  }
  
  // --- Méthodes privées ---
  
  private renderHeader(state: GuessingGameState): HTMLElement {
    const header = document.createElement('div')
    header.className = 'mb-6'
    
    header.innerHTML = `
      <h2 class="text-2xl font-bold text-beige-900 mb-2">🎯 Jeu de Devinettes</h2>
      <div class="flex items-center space-x-4 text-sm text-beige-700">
        <span>Manche ${state.currentTurn + 1}</span>
        <span>Phase: ${this.getPhaseLabel(state.phase)}</span>
        <span>Range: ${state.gameData.range.min}-${state.gameData.range.max}</span>
      </div>
    `
    
    return header
  }
  
  private renderMainArea(state: GuessingGameState, currentPlayer: Player): HTMLElement {
    const mainArea = document.createElement('div')
    mainArea.className = 'mb-6 p-6 bg-gradient-to-br from-beige-100 to-beige-200 rounded-lg border border-beige-200'
    
    if (state.phase === 'setup') {
      mainArea.innerHTML = `
        <div class="text-center">
          <h3 class="text-xl font-semibold text-beige-800 mb-4">
            🎲 Prêt pour le défi ?
          </h3>
          <p class="text-beige-700 mb-4">
            Je pense à un nombre entre 1 et 100. À vous de le deviner !
          </p>
          <div class="bg-beige-50 p-4 rounded-lg inline-block border border-beige-200">
            <p class="text-sm text-beige-600">Règles:</p>
            <ul class="text-sm text-beige-700 text-left mt-2">
              <li>• Chaque joueur a ${state.gameData.maxGuesses} tentatives maximum</li>
              <li>• Plus vous trouvez vite, plus vous gagnez de points</li>
              <li>• Je vous dirai si c'est trop haut ou trop bas</li>
            </ul>
          </div>
        </div>
      `
    } else if (state.phase === 'guessing') {
      const isPlayerTurn = state.currentPlayerId === currentPlayer.uid
      const currentPlayerName = isPlayerTurn ? 'Vous' : 'Un autre joueur'
      
      mainArea.innerHTML = `
        <div class="text-center">
          <div class="mb-4">
            <div class="inline-flex items-center px-4 py-2 bg-beige-50 rounded-full shadow-sm border border-beige-200">
              <div class="w-3 h-3 ${isPlayerTurn ? 'bg-primary-500 animate-pulse' : 'bg-beige-400'} rounded-full mr-2"></div>
              <span class="font-medium ${isPlayerTurn ? 'text-primary-700' : 'text-beige-700'}">
                ${isPlayerTurn ? 'À votre tour !' : `Tour de ${currentPlayerName}`}
              </span>
            </div>
          </div>
          
          <div class="text-4xl font-bold text-beige-800 mb-2">🤔</div>
          <p class="text-lg text-beige-800">
            Quel est le nombre mystère ?
          </p>
          
          ${this.renderHints(state)}
        </div>
      `
    } else if (state.phase === 'reveal') {
      const correctGuess = state.gameData.guesses.find(g => g.result === 'correct')
      
      mainArea.innerHTML = `
        <div class="text-center">
          <div class="text-6xl mb-4">
            ${correctGuess ? '🎉' : '😅'}
          </div>
          <h3 class="text-2xl font-bold text-beige-800 mb-4">
            Le nombre était: ${state.gameData.secretNumber}
          </h3>
          ${correctGuess ? 
            `<p class="text-success-600 text-lg">Bravo ${correctGuess.playerName} !</p>` :
            `<p class="text-beige-700">Personne n'a trouvé cette fois...</p>`
          }
        </div>
      `
    }
    
    return mainArea
  }
  
  private renderHints(state: GuessingGameState): string {
    if (state.gameData.guesses.length === 0) {
      return '<p class="text-sm text-beige-600 mt-4">Aucune tentative pour le moment</p>'
    }
    
    const lastGuess = state.gameData.guesses[state.gameData.guesses.length - 1]
    const hintText = lastGuess.result === 'too_high' ? 
      `${lastGuess.guess} est trop grand 📈` :
      `${lastGuess.guess} est trop petit 📉`
    
    return `
      <div class="mt-4 p-3 bg-beige-50 rounded-lg inline-block border border-beige-200">
        <p class="text-sm text-beige-700">Dernier indice:</p>
        <p class="font-medium text-beige-900">${hintText}</p>
      </div>
    `
  }
  
  private renderGuessHistory(state: GuessingGameState): HTMLElement {
    const container = document.createElement('div')
    container.className = 'guess-history'
    
    if (state.gameData.guesses.length === 0) {
      return container
    }
    
    const title = document.createElement('h4')
    title.className = 'text-sm font-medium text-beige-700 mb-3'
    title.textContent = 'Historique des tentatives'
    
    const list = document.createElement('div')
    list.className = 'space-y-2 max-h-40 overflow-y-auto'
    
    // Afficher les tentatives les plus récentes en premier
    const recentGuesses = [...state.gameData.guesses].reverse().slice(0, 10)
    
    recentGuesses.forEach(guess => {
      const item = document.createElement('div')
      item.className = `flex items-center justify-between p-2 rounded text-sm ${
        guess.result === 'correct' ? 'bg-success-50 text-success-700' :
        guess.result === 'too_high' ? 'bg-error-50 text-error-700' :
        'bg-warning-50 text-warning-700'
      }`
      
      const resultIcon = guess.result === 'correct' ? '✅' :
        guess.result === 'too_high' ? '📈' : '📉'
      
      item.innerHTML = `
        <span>${guess.playerName}: ${guess.guess}</span>
        <span>${resultIcon}</span>
      `
      
      list.appendChild(item)
    })
    
    container.appendChild(title)
    container.appendChild(list)
    
    return container
  }
  
  private renderQuickNumbers(range: { min: number; max: number }): string {
    const quickNumbers = [
      Math.floor((range.min + range.max) / 2), // Milieu
      Math.floor(range.min + (range.max - range.min) * 0.25), // Premier quart
      Math.floor(range.min + (range.max - range.min) * 0.75), // Troisième quart
      range.min + 10, // Début + 10
      range.max - 10  // Fin - 10
    ]
    
    return quickNumbers.map(num => `
      <button 
        class="btn-secondary text-sm py-1 quick-number-btn" 
        data-number="${num}"
      >
        ${num}
      </button>
    `).join('')
  }
  
  private setupGuessInput(): void {
    const input = document.getElementById('guess-input') as HTMLInputElement
    const submitBtn = document.getElementById('submit-guess-btn') as HTMLButtonElement
    const quickBtns = document.querySelectorAll('.quick-number-btn')
    
    if (!input || !submitBtn) return
    
    // Fonction de soumission
    const submitGuess = () => {
      const guess = parseInt(input.value)
      if (isNaN(guess)) return
      
      const event = new CustomEvent('gameAction', {
        detail: {
          type: 'MAKE_GUESS',
          data: { guess }
        }
      })
      document.dispatchEvent(event)
    }
    
    // Événements
    submitBtn.onclick = submitGuess
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitGuess()
    })
    
    // Boutons rapides
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const number = btn.getAttribute('data-number')
        if (number) {
          input.value = number
          input.focus()
        }
      })
    })
    
    // Focus automatique
    input.focus()
  }
  
  private getPhaseLabel(phase: string): string {
    switch (phase) {
      case 'setup': return 'Préparation'
      case 'guessing': return 'Devinettes'
      case 'reveal': return 'Révélation'
      case 'finished': return 'Terminé'
      default: return phase
    }
  }
  
  private updateRangeDisplay(state: GuessingGameState): void {
    // Mettre à jour l'affichage de la plage si nécessaire
  }
  
  private playGuessFeedback(result: string): void {
    // Jouer un son ou une animation selon le résultat
    console.log(`Feedback pour: ${result}`)
  }
}
