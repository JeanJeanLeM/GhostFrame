import { GameUI, Player } from '@/types'
import { 
  MisterWhiteGameState, 
  MisterWhiteRole, 
  LocalPlayer,
  EmojiPair
} from './game.state'
import QRCode from 'qrcode'

/**
 * Interface utilisateur pour Ghost Frame
 */
export class MisterWhiteGameUI implements GameUI {
  private container: HTMLElement | null = null
  
  setContainer(container: HTMLElement): void {
    this.container = container
  }
  
  renderGameBoard(gameState: any, currentPlayer: Player): HTMLElement {
    const state = gameState as MisterWhiteGameState
    
    const container = document.createElement('div')
    container.className = 'game-board min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col'
    
    // Ajouter les styles CSS pour les animations 3D
    this.injectFlipCardStyles()
    
    switch (state.phase) {
      case 'loading':
        container.appendChild(this.renderLoadingScreen(state))
        break
      case 'rules':
        container.appendChild(this.renderRulesScreen(state))
        break
      case 'config':
        container.appendChild(this.renderConfigScreen(state))
        break
      case 'setup':
        container.appendChild(this.renderSetupScreen(state))
        break
      case 'game':
        container.appendChild(this.renderGameScreen(state))
        break
      case 'elimination':
        container.appendChild(this.renderEliminationScreen(state))
        break
      case 'scores':
        container.appendChild(this.renderScoresScreen(state))
        break
    }
    
    return container
  }
  
  renderPlayerActions(gameState: any, currentPlayer: Player): HTMLElement {
    const state = gameState as MisterWhiteGameState
    
    const container = document.createElement('div')
    container.className = 'player-actions'
    
    // Dans le mode single-device, les actions sont intégrées dans l'écran principal
    return container
  }
  
  renderScoreboard(players: Player[]): HTMLElement {
    const container = document.createElement('div')
    container.className = 'scoreboard'
    
    // Dans Ghost Frame, pas de scoreboard traditionnel
    return container
  }
  
  onGameStateUpdate(gameState: any): void {
    const state = gameState as MisterWhiteGameState
    
    // Re-rendre complètement l'interface lors d'un changement d'état
    if (this.container) {
      const dummyPlayer: Player = {
        uid: 'local',
        displayName: 'Local Player',
        score: 0,
        isReady: true,
        isHost: true,
        isAnonymous: false,
        connected: true,
        lastSeen: new Date()
      }
      
      const gameBoard = this.renderGameBoard(state, dummyPlayer)
      this.container.innerHTML = ''
      this.container.appendChild(gameBoard)
    }
    
    // Animations ou effets selon la phase
    // (Plus besoin de la phase 'voting' dans le nouveau système)
  }
  
  // --- Écrans du jeu (nouveau flow) ---
  
  private renderLoadingScreen(state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-loading flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    
    screen.innerHTML = `
      <div class="text-center w-full">
        <!-- Logo Ghost Frame en très grand - 100% largeur -->
        <div class="mb-16 w-full">
          <img src="/GhostFromelogoRBG.png" alt="Ghost Frame Logo" class="w-full max-w-md mx-auto drop-shadow-2xl animate-pulse" />
        </div>
        
        <!-- Barre de progression -->
        <div class="progress-container mb-4 max-w-lg mx-auto">
          <div class="w-full bg-slate-700 rounded-full h-2">
            <div id="loading-progress" class="bg-gradient-to-r from-red-500 to-purple-500 h-2 rounded-full transition-all duration-100" style="width: 0%"></div>
          </div>
        </div>
        
        <p class="text-gray-300 text-lg">Chargement en cours...</p>
      </div>
    `
    
    // Simuler la progression de chargement
    this.startLoadingAnimation(screen)
    
    return screen
  }
  
  private renderRulesScreen(state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-rules w-full px-2 pt-0 pb-4 max-w-2xl mx-auto'
    
    screen.innerHTML = `
      <img src="/GhostFromelogoRBG.png" alt="Ghost Frame" class="w-full max-w-xl h-52 object-contain mx-auto drop-shadow-2xl" />
      <p class="text-gray-300 text-sm mb-2 text-center">Jeu de déduction et de bluff</p>
      
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8">
        <h2 class="text-2xl font-bold text-white mb-6 text-center">🎯 Règles du jeu</h2>
        <div class="space-y-4 text-gray-300">
          <div class="flex items-start">
            <span class="text-2xl mr-4 mt-1">👥</span>
            <div>
              <strong class="text-white">Rôles :</strong> 
              Civils (voient le même emoji), Imposteurs (voient un emoji différent), Ghost Frame (ne voit rien)
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-2xl mr-4 mt-1">💭</span>
            <div>
              <strong class="text-white">Discussion :</strong> 
              Chaque joueur dit un mot à voix haute dans l'ordre pour décrire son emoji
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-2xl mr-4 mt-1">🗳️</span>
            <div>
              <strong class="text-white">Vote :</strong> 
              Éliminez la personne que vous pensez être le Ghost Frame
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-2xl mr-4 mt-1">🎯</span>
            <div>
              <strong class="text-white">Victoire Ghost Frame :</strong> 
              Reste en vie avec 1 autre personne OU devine le mot secret des civils si éliminé
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-2xl mr-4 mt-1">🏆</span>
            <div>
              <strong class="text-white">Victoire Civils/Imposteurs :</strong> 
              Éliminez le Ghost Frame et l'empêcher de deviner le mot secret
            </div>
          </div>
        </div>
      </div>
      
      <button 
        id="start-from-rules-btn"
        class="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 mb-6"
      >
        🚀 Démarrer une partie
      </button>
      
      <!-- QR Code pour partager l'app -->
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 text-center">
        <p class="text-gray-300 text-sm mb-3">📱 Partagez l'app avec vos amis</p>
        <div id="share-qr-code" class="flex justify-center mb-3">
          <div class="bg-white p-3 rounded-xl">
            <canvas id="qr-canvas" width="150" height="150"></canvas>
          </div>
        </div>
        <p class="text-gray-400 text-xs">Scannez pour accéder à Ghost Frame</p>
      </div>
    `
    
    this.attachRulesEventListeners(screen)
    this.generateShareQRCode(screen)
    
    return screen
  }
  
  private renderConfigScreen(state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-config w-full px-2 pt-0 pb-4 max-w-md mx-auto'
    
    screen.innerHTML = `
      <img src="/GhostFromelogoRBG.png" alt="Ghost Frame" class="w-full max-w-lg h-44 object-contain mx-auto drop-shadow-lg" />
      <div class="flex items-center justify-center mb-1">
        <span class="text-xl mr-2">⚙️</span>
        <h2 class="text-lg font-bold text-white">CONFIGURATION</h2>
      </div>
      <p class="text-gray-300 mb-2 text-xs text-center">Paramètres de la partie</p>
      
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 space-y-6">
        <div>
          <label class="block text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
            Nombre de joueurs (3-10)
          </label>
          <input 
            type="number" 
            id="player-count" 
            min="3" 
            max="10"
            value="${state.config.playerCount}"
            class="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 text-white rounded-xl text-lg focus:outline-none focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all"
          >
        </div>
        
        <div>
          <label class="block text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
            Mode de jeu
          </label>
          <select 
            id="mode-select"
            class="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 text-white rounded-xl text-lg focus:outline-none focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all"
          >
            <option value="emoji" ${state.config.mode === 'emoji' ? 'selected' : ''}>😀 Emojis</option>
            <option value="image" ${state.config.mode === 'image' ? 'selected' : ''}>🖼️ Images</option>
          </select>
        </div>
        
        <div>
          <label class="block text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
            Thème
          </label>
          <select 
            id="theme-select"
            class="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 text-white rounded-xl text-lg focus:outline-none focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all"
          >
            <option value="libre" ${state.config.theme === 'libre' ? 'selected' : ''}>🎲 Libre</option>
            <option value="animaux" ${state.config.theme === 'animaux' ? 'selected' : ''}>🐶 Animaux</option>
            <option value="nourriture" ${state.config.theme === 'nourriture' ? 'selected' : ''}>🍕 Nourriture</option>
            <option value="metiers" ${state.config.theme === 'metiers' ? 'selected' : ''}>👨‍💼 Métiers</option>
            <option value="objets" ${state.config.theme === 'objets' ? 'selected' : ''}>📱 Objets</option>
            <option value="emotions" ${state.config.theme === 'emotions' ? 'selected' : ''}>😊 Émotions</option>
          </select>
        </div>
        
        <div>
          <label class="block text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
            Difficulté
          </label>
          <select 
            id="difficulty-select"
            class="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 text-white rounded-xl text-lg focus:outline-none focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all"
          >
            <option value="easy" ${state.config.difficulty === 'easy' ? 'selected' : ''}>😊 Facile</option>
            <option value="medium" ${state.config.difficulty === 'medium' ? 'selected' : ''}>🤔 Moyen</option>
            <option value="hard" ${state.config.difficulty === 'hard' ? 'selected' : ''}>😈 Difficile</option>
          </select>
        </div>
        
        <div>
          <label class="block text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
            Nombre de manches
          </label>
          <select 
            id="rounds-select"
            class="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 text-white rounded-xl text-lg focus:outline-none focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all"
          >
            <option value="1" ${state.config.rounds === 1 ? 'selected' : ''}>1 manche</option>
            <option value="3" ${state.config.rounds === 3 ? 'selected' : ''}>3 manches</option>
            <option value="5" ${state.config.rounds === 5 ? 'selected' : ''}>5 manches</option>
          </select>
        </div>
        
        <button 
          id="validate-config-btn"
          class="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25"
        >
          Créer les cartes →
        </button>
      </div>
    `
    
    this.attachConfigEventListeners(screen)
    
    return screen
  }
  
  private renderSetupScreen(state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-setup w-full px-2 pt-0 pb-4 mx-auto'
    
    const configuredCount = state.players.filter(p => p.cardConfigured).length
    const allConfigured = configuredCount === state.config.playerCount
    
    screen.innerHTML = `
      <img src="/GhostFromelogoRBG.png" alt="Ghost Frame" class="w-full max-w-lg h-44 object-contain mx-auto drop-shadow-lg" />
      <div class="flex items-center justify-center mb-1">
        <span class="text-xl mr-2">🃏</span>
        <h2 class="text-lg font-bold text-white">SETUP DES CARTES</h2>
      </div>
      <p class="text-gray-300 mb-1 text-xs text-center">Cliquez sur une carte libre pour vous enregistrer</p>
      <div class="text-xs text-gray-400 mb-2 text-center">
        ${configuredCount} / ${state.config.playerCount} joueurs configurés
      </div>
      
      <div class="cards-grid grid grid-cols-3 gap-3 px-4 mb-6">
        ${this.renderSetupCards(state)}
      </div>
      
      ${allConfigured ? `
        <div class="text-center mt-6">
          <button 
            id="start-game-btn"
            class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/25"
          >
            🚀 Passer au jeu
          </button>
        </div>
      ` : `
        <div class="bg-amber-500/20 border border-amber-500 rounded-2xl p-4 max-w-2xl mx-auto text-center mt-6">
          <div class="text-amber-300 font-semibold mb-2">⚠️ Instructions</div>
          <p class="text-gray-300 text-sm">
            Chaque joueur doit cliquer sur une carte libre, saisir son prénom, voir son rôle, et valider.
          </p>
        </div>
      `}
    `
    
    this.attachSetupEventListeners(screen, state)
    
    return screen
  }
  
  
  private renderGameScreen(state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-game w-full px-2 pt-0 pb-4 mx-auto'
    
    screen.innerHTML = `
      <img src="/GhostFromelogoRBG.png" alt="Ghost Frame" class="w-full max-w-md h-36 object-contain mx-auto drop-shadow-lg" />
      
      <div class="bg-red-500/20 border-2 border-red-500 rounded-xl p-2 mb-2 text-center max-w-md mx-auto">
        <p class="text-gray-300 text-xs">Premier joueur :</p>
        <div class="text-lg font-bold text-red-400">${state.gameData.firstPlayer}</div>
      </div>
      
      <p class="text-yellow-300 font-semibold text-xs text-center mb-2">⚠️ Cliquez sur un joueur pour l'éliminer</p>
      
      <div class="game-cards grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        ${this.renderGameCards(state)}
      </div>
    `
    
    this.attachGameEventListeners(screen, state)
    
    return screen
  }
  
  private renderEliminationScreen(state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-elimination mx-auto px-2 pt-0 pb-4 max-w-2xl'
    
    const eliminatedPlayer = state.players.find(p => p.isEliminated && !state.gameData.eliminationHistory.some(h => h.playerId === p.id && h.timestamp))
    const lastEliminated = state.gameData.eliminationHistory[state.gameData.eliminationHistory.length - 1]
    const isMissWhiteEliminated = lastEliminated?.role === 'ghost-frame'
    
    screen.innerHTML = `
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-red-500 to-purple-400 bg-clip-text text-transparent mb-4 tracking-wider">
          🎯 ÉLIMINATION
        </h1>
      </div>
      
      ${lastEliminated ? `
        <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8 text-center">
          <div class="text-6xl mb-4">💀</div>
          <h2 class="text-2xl font-bold text-white mb-4">${lastEliminated.playerName} a été éliminé!</h2>
          <div class="role-reveal ${lastEliminated.role} inline-block px-6 py-3 rounded-xl font-bold text-lg">
            ${this.getRoleLabel(lastEliminated.role)}
          </div>
        </div>
        
        ${isMissWhiteEliminated && state.gameData.guessPhase.isActive ? `
          <div class="bg-purple-500/20 border-2 border-purple-500 rounded-2xl p-6 mb-8">
            <div class="text-center mb-6">
              <div class="text-4xl mb-3">📱</div>
              <h3 class="text-xl font-bold text-purple-300 mb-2">Passez le téléphone !</h3>
              <p class="text-gray-300">
                Donnez le téléphone à <strong class="text-white">${lastEliminated.playerName}</strong>
              </p>
              <p class="text-sm text-gray-400 mt-2">
                Le Ghost Frame peut tenter de deviner le mot secret des civils pour gagner !
              </p>
            </div>
            
            <div class="bg-slate-800/60 rounded-xl p-4 mb-6">
              <h4 class="text-lg font-semibold text-white mb-3">🎯 Dernière chance !</h4>
              <p class="text-gray-300 mb-2">
                Devinez ce que les <strong>civils</strong> ont vu :
              </p>
              <p class="text-gray-400 text-sm mb-4">
                ${state.config.mode === 'emoji' 
                  ? 'Tapez l\'emoji exact que les civils ont vu' 
                  : 'Décrivez l\'image/concept que les civils ont vu'
                }
              </p>
              
              <div class="space-y-4">
                <input 
                  type="text" 
                  id="guess-input"
                  placeholder="${state.config.mode === 'emoji' 
                    ? 'Tapez l\'emoji (ex: 🍎)' 
                    : 'Décrivez l\'image (ex: Pomme)'
                  }"
                  class="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 text-white rounded-xl text-lg focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all ${state.config.mode === 'emoji' ? 'text-center' : ''}"
                  maxlength="${state.config.mode === 'emoji' ? '10' : '100'}"
                >
                
                <button 
                  id="submit-guess-btn"
                  class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all transform hover:scale-105"
                >
                  ✨ ${state.config.mode === 'emoji' ? 'Deviner l\'emoji' : 'Deviner l\'image'}
                </button>
              </div>
            </div>
          </div>
        ` : ''}
        
        ${!state.gameData.guessPhase.isActive && !state.winner ? `
          <div class="text-center">
            <button 
              id="continue-btn"
              class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
            >
              ▶️ Continuer le jeu
            </button>
          </div>
        ` : ''}
        
        ${!state.gameData.guessPhase.isActive && state.winner ? `
          <div class="text-center">
            <button 
              id="continue-btn"
              class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
            >
              📊 Voir les scores
            </button>
          </div>
        ` : ''}
      ` : ''}
    `
    
    this.attachEliminationEventListeners(screen, state)
    
    return screen
  }
  
  private renderScoresScreen(state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-scores mx-auto px-2 pt-0 pb-4 max-w-2xl text-center'
    
    const winnerInfo = this.getWinnerInfo(state)
    const sortedPlayers = [...state.players].sort((a, b) => (b.score || 0) - (a.score || 0))
    const isLastRound = state.config.currentRound >= state.config.rounds
    
    screen.innerHTML = `
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-red-500 to-purple-400 bg-clip-text text-transparent mb-4 tracking-wider">
          🏆 ${isLastRound ? 'RÉSULTATS FINAUX' : 'SCORES'}
        </h1>
        <p class="text-gray-300">
          ${isLastRound ? 'Partie terminée !' : `Manche ${state.config.currentRound} / ${state.config.rounds}`}
        </p>
      </div>
      
      <div class="winner-banner text-6xl mb-6">
        ${winnerInfo.emoji}
      </div>
      
      <h2 class="text-2xl font-bold text-white mb-8">${winnerInfo.text}</h2>
      
      ${state.gameData.guessPhase.guessWord ? `
        <div class="bg-purple-500/20 border border-purple-500 rounded-2xl p-4 mb-8">
          <div class="text-lg font-semibold text-purple-300 mb-2">🎯 Devinette du Ghost Frame</div>
          <p class="text-gray-300 mb-4">
            Le Ghost Frame a deviné: 
            <strong class="text-white ${state.config.mode === 'emoji' ? 'text-2xl' : ''}">${state.gameData.guessPhase.guessWord}</strong>
          </p>
          <p class="text-gray-300 mb-4">
            ${state.config.mode === 'emoji' ? 'Emoji' : 'Mot'} des civils: 
            <strong class="text-white ${state.config.mode === 'emoji' ? 'text-2xl' : ''}">${
              state.config.mode === 'emoji' 
                ? state.gameData.currentEmojis?.civil 
                : state.gameData.guessPhase.secretWord || 'À définir par les joueurs'
            }</strong>
          </p>
          
          ${state.gameData.guessPhase.needsValidation ? `
            <!-- Validation collective par les joueurs -->
            <div class="bg-slate-800/60 rounded-xl p-4 mt-4">
              <h4 class="text-lg font-semibold text-white mb-3">🗳️ Décision collective</h4>
              <p class="text-gray-300 mb-4 text-sm">
                Tous les joueurs se mettent d'accord à l'oral pour décider si la devinette du Ghost Frame est acceptable.
                ${state.config.mode === 'image' ? 'Pour les images, soyez indulgents avec les descriptions !' : 'Pour les emojis, vérifiez bien la correspondance.'}
              </p>
              
              <!-- Boutons de décision collective -->
              <div class="grid grid-cols-2 gap-4">
                <button 
                  id="accept-guess-btn"
                  class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all text-center"
                >
                  ✅ Accepter<br>
                  <span class="text-sm font-normal">Ghost Frame gagne</span>
                </button>
                <button 
                  id="reject-guess-btn"
                  class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all text-center"
                >
                  ❌ Refuser<br>
                  <span class="text-sm font-normal">Survivants gagnent</span>
                </button>
              </div>
            </div>
          ` : `
            <!-- Résultat final -->
            <div class="mt-4">
              ${state.gameData.guessPhase.isCorrect 
                ? '<span class="text-green-400 font-bold">✅ Devinette acceptée ! Le Ghost Frame gagne la partie!</span>'
                : '<span class="text-red-400 font-bold">❌ Devinette refusée - Victoire aux survivants !</span>'
              }
            </div>
          `}
        </div>
      ` : ''}
      
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8">
        <h3 class="text-xl font-bold text-white mb-4">🎖️ Classement</h3>
        <div class="space-y-3">
          ${this.renderScoresList(sortedPlayers, state)}
        </div>
      </div>
      
      <div class="flex flex-col gap-4">
        ${!isLastRound ? `
          <button 
            id="next-round-btn"
            class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
          >
            🔄 Manche suivante
          </button>
        ` : ''}
        
        <div class="flex flex-col sm:flex-row gap-4">
          <button 
            id="new-game-btn"
            class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
          >
            🆕 Nouvelle partie
          </button>
          <button 
            id="reset-btn"
            class="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-4 px-6 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
          >
            🔄 Reset complet
          </button>
        </div>
      </div>
    `
    
    this.attachScoresEventListeners(screen, state)
    
    return screen
  }
  
  // --- Système de cartes flip 3D ---
  
  private renderSetupCards(state: MisterWhiteGameState): string {
    return state.players.map((player, index) => {
      const isConfigured = player.cardConfigured
      const hasName = player.name && player.name.trim() !== ''
      const needsToSeeRole = hasName && !isConfigured  // A un nom mais doit voir son rôle
      
      let cardClass = 'free'
      if (isConfigured) {
        cardClass = 'configured'
      } else if (needsToSeeRole) {
        cardClass = 'needs-reveal'  // Nouvelle manche - doit voir son nouveau rôle
      }
      
      return `
        <div class="card setup-card ${cardClass}" data-card-index="${index}">
          <div class="card-inner">
            <div class="card-face card-front">
              ${isConfigured ? `
                <div class="card-icon text-3xl mb-2">✅</div>
                <div class="card-name text-sm font-bold text-white">${player.name}</div>
                <div class="text-xs text-green-400 mt-1">Rôle vu</div>
              ` : needsToSeeRole ? `
                <div class="card-icon text-3xl mb-2">👤</div>
                <div class="card-name text-sm font-bold text-white">${player.name}</div>
              ` : `
                <div class="card-icon text-4xl mb-2">👤</div>
                <div class="card-text text-sm font-bold tracking-wide text-gray-300">Carte Libre</div>
              `}
            </div>
          </div>
        </div>
      `
    }).join('')
  }
  
  private renderRoleCards(state: MisterWhiteGameState): string {
    // Mélanger les indices pour l'affichage aléatoire
    const shuffledIndices = [...Array(state.players.length).keys()]
    this.shuffleArray(shuffledIndices)
    
    return shuffledIndices.map(playerIndex => {
      const player = state.players[playerIndex]
      const role = player.role!
      const emoji = this.getRoleEmoji(role, state.gameData.currentEmojis!)
      const isFlipped = state.gameData.cardsSeen[player.id] || false
      
      return `
        <div class="card ${isFlipped ? 'flipped' : ''}" data-player-index="${playerIndex}">
          <div class="card-inner">
            <div class="card-face card-front">
              <div class="card-icon text-6xl mb-4">👤</div>
              <div class="card-role text-xl font-bold tracking-wide">${player.name}</div>
            </div>
            <div class="card-face card-back ${role}">
              <div class="card-role text-xl font-bold tracking-wide mb-4">${this.getRoleLabel(role)}</div>
              <div class="card-emoji text-6xl mb-4">${emoji}</div>
              <div class="card-player-name text-sm opacity-80">${player.name}</div>
            </div>
          </div>
        </div>
      `
    }).join('')
  }
  
  private renderGameCards(state: MisterWhiteGameState): string {
    return state.players.map(player => {
      const isEliminated = state.gameData.eliminatedPlayers.includes(player.id)
      const canVote = state.gameData.gamePhase.votingStarted && !isEliminated
      
      return `
        <div class="game-card ${isEliminated ? 'eliminated' : canVote ? 'votable' : 'normal'}" data-player-id="${player.id}">
          <div class="card-icon">${isEliminated ? '💀' : '👤'}</div>
          <div class="player-name">${player.name}</div>
          ${isEliminated ? `
            <div class="role-reveal ${player.role}">
              ${this.getRoleLabel(player.role!)}
            </div>
          ` : ''}
        </div>
      `
    }).join('')
  }
  
  private renderSurvivors(state: MisterWhiteGameState): string {
    const survivors = state.players.filter(p => !p.isEliminated)
    
    return survivors.map(player => `
      <div class="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg border border-slate-600">
        <span class="font-semibold text-white">${player.name}</span>
        <span class="role-reveal ${player.role} px-3 py-1 rounded-full text-sm font-medium">
          ${this.getRoleLabel(player.role!)}
        </span>
      </div>
    `).join('')
  }
  
  // --- Styles CSS pour les cartes 3D ---
  
  private injectFlipCardStyles(): void {
    if (document.getElementById('ghost-frame-styles')) return
    
    const style = document.createElement('style')
    style.id = 'ghost-frame-styles'
    style.textContent = `
      .mister-white-game .card {
        aspect-ratio: 1/1;
        perspective: 1000px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: none !important;
        border: none !important;
        padding: 0 !important;
        box-shadow: none !important;
      }
      
      .mister-white-game .card:hover {
        transform: translateY(-5px);
      }
      
      .mister-white-game .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform-style: preserve-3d;
      }
      
      .mister-white-game .card.flipped .card-inner {
        transform: rotateY(180deg);
      }
      
      .mister-white-game .card-face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2);
        border: 2px solid;
        position: relative;
        overflow: hidden;
      }
      
      .mister-white-game .card-face::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%);
        pointer-events: none;
      }
      
      .mister-white-game .card-front {
        background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%);
        border-color: rgba(239, 68, 68, 0.6);
        color: white;
        position: relative;
      }
      
      .mister-white-game .card-front::after {
        content: '';
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 15px;
        pointer-events: none;
      }
      
      .mister-white-game .card-back {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        transform: rotateY(180deg);
        color: white;
        position: relative;
      }
      
      .mister-white-game .card-back::after {
        content: '';
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 15px;
        pointer-events: none;
      }
      
      .mister-white-game .card-back.civil {
        border-color: #10b981;
        background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
        box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4), 0 5px 15px rgba(16, 185, 129, 0.2);
      }
      
      .mister-white-game .card-back.impostor {
        border-color: #ef4444;
        background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);
        box-shadow: 0 15px 35px rgba(239, 68, 68, 0.4), 0 5px 15px rgba(239, 68, 68, 0.2);
      }
      
      .mister-white-game .card-back.ghost-frame {
        border-color: #6b7280;
        background: linear-gradient(135deg, #9ca3af 0%, #d1d5db 50%, #f3f4f6 100%);
        color: #1f2937;
        box-shadow: 0 15px 35px rgba(107, 114, 128, 0.4), 0 5px 15px rgba(107, 114, 128, 0.2);
      }
      
      .mister-white-game .game-card {
        aspect-ratio: 1/1;
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%);
        padding: 32px 20px;
        border-radius: 24px;
        text-align: center;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 3px solid rgb(51, 65, 85);
        color: white;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }
      
      .mister-white-game .game-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%);
        pointer-events: none;
      }
      
      .mister-white-game .game-card::after {
        content: '';
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        bottom: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 18px;
        pointer-events: none;
      }
      
      .mister-white-game .game-card .card-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
      }
      
      .mister-white-game .game-card .player-name {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: 0.5px;
      }
      
      .mister-white-game .game-card.normal {
        cursor: default;
      }
      
      .mister-white-game .game-card.votable {
        cursor: pointer;
        border-color: #ef4444;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(30, 41, 59, 0.95) 100%);
      }
      
      .mister-white-game .game-card.votable:hover {
        transform: translateY(-8px) scale(1.05);
        border-color: #dc2626;
        box-shadow: 0 25px 50px rgba(239, 68, 68, 0.5), 0 15px 25px rgba(239, 68, 68, 0.3);
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(30, 41, 59, 0.95) 100%);
      }
      
      .mister-white-game .game-card.eliminated {
        opacity: 0.7;
        pointer-events: none;
        border-color: rgb(107, 114, 128);
        background: linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(55, 65, 81, 0.8) 100%);
        filter: grayscale(0.6);
      }
      
      .mister-white-game .setup-card {
        aspect-ratio: 1/1;
        width: 100%;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .mister-white-game .setup-card:hover:not(.configured) {
        transform: translateY(-8px) scale(1.02);
      }
      
      .mister-white-game .setup-card.configured {
        cursor: default;
      }
      
      .mister-white-game .setup-card.configured .card-front {
        background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
        border-color: #10b981;
        box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4), 0 5px 15px rgba(16, 185, 129, 0.2);
      }
      
      .mister-white-game .setup-card.free .card-front {
        background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%);
        border-color: rgba(239, 68, 68, 0.6);
      }
      
      .mister-white-game .setup-card.needs-reveal {
        cursor: pointer;
      }
      
      .mister-white-game .setup-card.needs-reveal:hover {
        transform: translateY(-8px) scale(1.02);
      }
      
      .mister-white-game .setup-card.needs-reveal .card-front {
        background: linear-gradient(135deg, #475569 0%, #64748b 50%, #334155 100%);
        border-color: #64748b;
        box-shadow: 0 15px 35px rgba(100, 116, 139, 0.3), 0 5px 15px rgba(100, 116, 139, 0.1);
      }
      
      .mister-white-game .role-reveal {
        font-size: 0.9rem;
        margin-top: 10px;
        padding: 10px 16px;
        border-radius: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        border: 2px solid;
        position: relative;
        overflow: hidden;
      }
      
      .mister-white-game .role-reveal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%);
        pointer-events: none;
      }
      
      .mister-white-game .role-reveal.civil {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        color: white;
        border-color: #059669;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .mister-white-game .role-reveal.impostor {
        background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
        color: white;
        border-color: #dc2626;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .mister-white-game .role-reveal.ghost-frame {
        background: linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%);
        color: #1f2937;
        border-color: #6b7280;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
      }
      
      .mister-white-game .game-card {
        aspect-ratio: 1/1;
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%);
        padding: 32px 20px;
        border-radius: 24px;
        text-align: center;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 3px solid rgb(51, 65, 85);
        color: white;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }
      
      .mister-white-game .game-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%);
        pointer-events: none;
      }
      
      .mister-white-game .game-card::after {
        content: '';
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        bottom: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 18px;
        pointer-events: none;
      }
      
      .mister-white-game .game-card .card-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
      }
      
      .mister-white-game .game-card .player-name {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: 0.5px;
      }
      
      .mister-white-game .game-card.normal {
        cursor: default;
      }
      
      .mister-white-game .game-card.votable {
        cursor: pointer;
        border-color: #ef4444;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(30, 41, 59, 0.95) 100%);
      }
      
      .mister-white-game .game-card.votable:hover {
        transform: translateY(-8px) scale(1.05);
        border-color: #dc2626;
        box-shadow: 0 25px 50px rgba(239, 68, 68, 0.5), 0 15px 25px rgba(239, 68, 68, 0.3);
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(30, 41, 59, 0.95) 100%);
      }
      
      .mister-white-game .game-card.eliminated {
        opacity: 0.7;
        pointer-events: none;
        border-color: rgb(107, 114, 128);
        background: linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(55, 65, 81, 0.8) 100%);
        filter: grayscale(0.6);
      }
    `
    
    document.head.appendChild(style)
  }
  
  // --- Event Listeners (nouveau flow) ---
  
  private startLoadingAnimation(screen: HTMLElement): void {
    const progressBar = screen.querySelector('#loading-progress') as HTMLElement
    let progress = 0
    
    const interval = setInterval(() => {
      progress += 2
      progressBar.style.width = `${progress}%`
      
      if (progress >= 100) {
        clearInterval(interval)
        // Transition automatique après le chargement
        setTimeout(() => {
          this.dispatchGameAction({ type: 'FINISH_LOADING' })
        }, 500)
      }
    }, 100) // 5 secondes au total
  }
  
  private attachRulesEventListeners(screen: HTMLElement): void {
    const startBtn = screen.querySelector('#start-from-rules-btn')
    
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.dispatchGameAction({ type: 'START_FROM_RULES' })
      })
    }
  }
  
  private attachConfigEventListeners(screen: HTMLElement): void {
    const validateBtn = screen.querySelector('#validate-config-btn')
    
    if (validateBtn) {
      validateBtn.addEventListener('click', () => {
        const playerCount = parseInt((screen.querySelector('#player-count') as HTMLInputElement).value)
        const mode = (screen.querySelector('#mode-select') as HTMLSelectElement).value
        const theme = (screen.querySelector('#theme-select') as HTMLSelectElement).value
        const difficulty = (screen.querySelector('#difficulty-select') as HTMLSelectElement).value
        const rounds = parseInt((screen.querySelector('#rounds-select') as HTMLSelectElement).value)
        
        if (playerCount < 3 || playerCount > 10) {
          alert('Le nombre de joueurs doit être entre 3 et 10!')
          return
        }
        
        this.dispatchGameAction({
          type: 'SET_CONFIG',
          data: { playerCount, mode, theme, difficulty, rounds }
        })
      })
    }
  }
  
  private attachSetupEventListeners(screen: HTMLElement, state: MisterWhiteGameState): void {
    // Event listeners pour les cartes de setup
    const setupCards = screen.querySelectorAll('.setup-card')
    
    setupCards.forEach(card => {
      card.addEventListener('click', () => {
        const cardIndex = parseInt((card as HTMLElement).dataset.cardIndex!)
        const player = state.players[cardIndex]
        
        // Si déjà configurée, ne rien faire
        if (player.cardConfigured) {
          return
        }
        
        // Ouvrir le modal de configuration
        this.showCardConfigModal(cardIndex, player.role!, state)
      })
    })
    
    // Bouton pour démarrer le jeu
    const startGameBtn = screen.querySelector('#start-game-btn')
    if (startGameBtn) {
      startGameBtn.addEventListener('click', () => {
        this.dispatchGameAction({ type: 'START_GAME' })
      })
    }
  }
  
  private showCardConfigModal(cardIndex: number, role: string, state: any): void {
    // Créer le modal
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50'
    
    const content = this.getRoleContent(role as any, state)
    const player = state.players[cardIndex]
    const hasExistingName = player.name && player.name.trim() !== ''
    const isNewRound = hasExistingName && !player.cardConfigured  // Nouvelle manche
    
    modal.innerHTML = `
      <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-md mx-4">
        <div class="text-center mb-6">
          ${isNewRound ? `
            <div class="bg-yellow-500/20 border border-yellow-500 rounded-xl p-3 mb-4">
              <div class="text-yellow-300 font-semibold">🔄 Nouvelle manche</div>
              <div class="text-white text-lg font-bold mt-1">${player.name}</div>
              <div class="text-gray-300 text-sm">Score actuel : ${player.score || 0} pts</div>
            </div>
          ` : ''}
          ${content.display}
          <h3 class="text-xl font-bold text-white mb-2">${isNewRound ? 'Votre nouveau rôle' : 'Configuration de votre carte'}</h3>
          ${content.description}
        </div>
        
        <div class="space-y-4">
          ${!isNewRound ? `
            <div>
              <label class="block text-gray-300 text-sm font-semibold mb-2">Votre prénom :</label>
              <input 
                type="text" 
                id="player-name-input"
                class="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 text-white rounded-xl text-lg focus:outline-none focus:border-red-500 transition-all"
                placeholder="Entrez votre prénom..."
                maxlength="20"
              >
            </div>
          ` : `
            <input type="hidden" id="player-name-input" value="${player.name}">
          `}
          
          <div class="flex space-x-3">
            <button 
              id="confirm-card-btn"
              class="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              ✅ ${isNewRound ? 'J\'ai vu mon rôle' : 'Valider'}
            </button>
            <button 
              id="cancel-card-btn"
              class="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              ❌ Annuler
            </button>
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Focus sur l'input (seulement si visible, pas pour nouvelle manche)
    const nameInput = modal.querySelector('#player-name-input') as HTMLInputElement
    if (!isNewRound && nameInput) {
      nameInput.focus()
    }
    
    // Event listener pour agrandir l'image (mode image uniquement)
    const roleImage = modal.querySelector('#role-image-preview') as HTMLImageElement
    if (roleImage && state.config.mode === 'image') {
      roleImage.addEventListener('click', () => {
        this.showEnlargedImage(roleImage.src, role as any)
      })
    }
    
    // Event listeners pour le modal
    const confirmBtn = modal.querySelector('#confirm-card-btn')
    const cancelBtn = modal.querySelector('#cancel-card-btn')
    
    const handleConfirm = () => {
      const playerName = nameInput.value.trim()
      
      if (!playerName) {
        alert('Veuillez saisir votre prénom !')
        return
      }
      
      // Vérifier l'unicité du nom (seulement pour les nouvelles cartes, pas les nouvelles manches)
      if (!isNewRound) {
        const existingNames = state.players
          .filter((p: any, i: number) => i !== cardIndex && p.cardConfigured)
          .map((p: any) => p.name.toLowerCase())
        
        if (existingNames.includes(playerName.toLowerCase())) {
          alert('Ce prénom est déjà utilisé !')
          return
        }
      }
      
      // Configurer la carte
      this.dispatchGameAction({
        type: 'CONFIGURE_CARD',
        data: { cardIndex, playerName }
      })
      
      // Fermer le modal
      document.body.removeChild(modal)
    }
    
    const handleCancel = () => {
      document.body.removeChild(modal)
    }
    
    confirmBtn?.addEventListener('click', handleConfirm)
    cancelBtn?.addEventListener('click', handleCancel)
    nameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleConfirm()
    })
    
    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
      if (e.target === modal) handleCancel()
    })
  }

  /**
   * Affiche l'image de rôle en grand dans un modal dédié
   */
  private showEnlargedImage(imageUrl: string, role: MisterWhiteRole): void {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4'
    
    modal.innerHTML = `
      <div class="relative max-w-4xl max-h-4xl w-full h-full flex items-center justify-center">
        <!-- Bouton fermer -->
        <button id="close-enlarged-btn" class="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors">
          ✕
        </button>
        
        <!-- Image agrandie -->
        <div class="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
          <img 
            src="${imageUrl}" 
            alt="Image ${this.getRoleLabel(role)}" 
            class="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
          >
          <div class="hidden flex-col items-center justify-center p-8 text-white">
            <div class="text-6xl mb-4">🖼️</div>
            <p class="text-lg">Image non disponible</p>
          </div>
        </div>
        
        <!-- Info sur le rôle -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          <span class="font-semibold">${this.getRoleLabel(role)}</span>
        </div>
        
        <!-- Instruction -->
        <div class="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
          Cliquez n'importe où pour fermer
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Event listeners pour fermer le modal
    const closeBtn = modal.querySelector('#close-enlarged-btn')
    
    const handleClose = () => {
      document.body.removeChild(modal)
    }
    
    closeBtn?.addEventListener('click', handleClose)
    
    // Fermer en cliquant n'importe où
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target === modal.firstElementChild) {
        handleClose()
      }
    })
    
    // Fermer avec la touche Échap
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
        document.removeEventListener('keydown', handleKeydown)
      }
    }
    
    document.addEventListener('keydown', handleKeydown)
  }

  /**
   * Affiche un modal de confirmation pour l'élimination d'un joueur
   * Compatible mobile-first et web
   */
  private showEliminationConfirmModal(playerName: string, onConfirm: () => void): void {
    // Créer le modal
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4'
    
    modal.innerHTML = `
      <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-red-500/30 max-w-sm w-full mx-4 animate-scale-in">
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl text-center">
          <div class="text-4xl mb-3">⚠️</div>
          <h3 class="text-xl font-bold">Confirmation d'élimination</h3>
        </div>
        
        <!-- Content -->
        <div class="p-6 text-center">
          <p class="text-gray-300 mb-4 leading-relaxed">
            Voulez-vous vraiment éliminer
          </p>
          <div class="bg-slate-700/50 rounded-lg p-3 mb-4 border border-slate-600">
            <span class="text-white font-bold text-lg">${playerName}</span>
          </div>
          <p class="text-yellow-300 text-sm font-medium">
            ⚠️ Cette action révélera son rôle à tout le monde !
          </p>
        </div>
        
        <!-- Actions -->
        <div class="p-6 pt-0">
          <div class="grid grid-cols-2 gap-3">
            <button id="cancel-elimination-btn" class="bg-slate-600 hover:bg-slate-500 text-white font-bold py-4 px-4 rounded-xl transition-colors touch-manipulation">
              Annuler
            </button>
            <button id="confirm-elimination-btn" class="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-4 rounded-xl transition-all transform hover:scale-105 touch-manipulation">
              Éliminer
            </button>
          </div>
        </div>
      </div>
    `
    
    // Ajouter les styles d'animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes scale-in {
        0% { transform: scale(0.7); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .animate-scale-in {
        animation: scale-in 0.2s ease-out;
      }
      
      /* Améliore l'expérience tactile sur mobile */
      .touch-manipulation {
        touch-action: manipulation;
        user-select: none;
      }
      
      /* Responsive pour les très petits écrans */
      @media (max-width: 320px) {
        .max-w-sm { max-width: 280px; }
      }
    `
    document.head.appendChild(style)
    
    document.body.appendChild(modal)
    
    // Event listeners pour les boutons
    const confirmBtn = modal.querySelector('#confirm-elimination-btn')
    const cancelBtn = modal.querySelector('#cancel-elimination-btn')
    
    const cleanup = () => {
      document.body.removeChild(modal)
      document.head.removeChild(style)
    }
    
    const handleConfirm = () => {
      cleanup()
      onConfirm()
    }
    
    const handleCancel = () => {
      cleanup()
    }
    
    confirmBtn?.addEventListener('click', handleConfirm)
    cancelBtn?.addEventListener('click', handleCancel)
    
    // Fermer en cliquant à l'extérieur (zone noire)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        handleCancel()
      }
    })
    
    // Support clavier (Échap pour annuler, Entrée pour confirmer)
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
        document.removeEventListener('keydown', handleKeydown)
      } else if (e.key === 'Enter') {
        handleConfirm()
        document.removeEventListener('keydown', handleKeydown)
      }
    }
    
    document.addEventListener('keydown', handleKeydown)
    
    // Focus sur le bouton d'annulation par défaut (plus sûr)
    setTimeout(() => {
      (cancelBtn as HTMLElement)?.focus()
    }, 100)
  }
  
  
  private attachGameEventListeners(screen: HTMLElement, state: MisterWhiteGameState): void {
    // Event listeners pour les cartes de vote avec confirmation
    const voteCards = screen.querySelectorAll('.game-card.votable')
    
    voteCards.forEach(card => {
      card.addEventListener('click', () => {
        const playerId = (card as HTMLElement).dataset.playerId!
        const playerName = state.players.find(p => p.id === playerId)?.name || 'ce joueur'
        
        // Confirmation avant élimination avec modal personnalisé
        this.showEliminationConfirmModal(playerName, () => {
          this.dispatchGameAction({
            type: 'ELIMINATE_PLAYER',
            data: { playerId }
          })
        })
      })
    })
  }
  
  private attachEliminationEventListeners(screen: HTMLElement, state: MisterWhiteGameState): void {
    const submitGuessBtn = screen.querySelector('#submit-guess-btn')
    const continueBtn = screen.querySelector('#continue-btn')
    
    if (submitGuessBtn) {
      submitGuessBtn.addEventListener('click', () => {
        const guessInput = screen.querySelector('#guess-input') as HTMLInputElement
        const guessWord = guessInput.value.trim()
        
        if (!guessWord) {
          alert('Veuillez saisir votre devinette!')
          return
        }
        
        this.dispatchGameAction({
          type: 'SUBMIT_GUESS',
          data: { guessWord }
        })
      })
    }
    
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (state.winner) {
          // Si il y a un gagnant, pas d'action nécessaire - on reste sur les scores
        } else {
          // Sinon, continuer le jeu
          this.dispatchGameAction({ type: 'CONTINUE_GAME' })
        }
      })
    }
  }
  
  private attachScoresEventListeners(screen: HTMLElement, state: MisterWhiteGameState): void {
    const nextRoundBtn = screen.querySelector('#next-round-btn')
    const newGameBtn = screen.querySelector('#new-game-btn')
    const resetBtn = screen.querySelector('#reset-btn')
    
    if (nextRoundBtn) {
      nextRoundBtn.addEventListener('click', () => {
        this.dispatchGameAction({ type: 'NEXT_ROUND' })
      })
    }
    
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        this.dispatchGameAction({ type: 'NEW_GAME' })
      })
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.dispatchGameAction({ type: 'RESET_GAME' })
      })
    }
    
    // Event listeners pour la validation collective de devinette
    const acceptGuessBtn = screen.querySelector('#accept-guess-btn')
    const rejectGuessBtn = screen.querySelector('#reject-guess-btn')
    
    if (acceptGuessBtn) {
      acceptGuessBtn.addEventListener('click', () => {
        // Accepter la devinette - Ghost Frame gagne
        this.dispatchGameAction({
          type: 'ACCEPT_GUESS_COLLECTIVE'
        })
      })
    }
    
    if (rejectGuessBtn) {
      rejectGuessBtn.addEventListener('click', () => {
        // Refuser la devinette - Survivants gagnent selon règles normales
        this.dispatchGameAction({
          type: 'REJECT_GUESS_COLLECTIVE'
        })
      })
    }
  }
  
  // --- Utilitaires ---
  
  private getRoleEmoji(role: MisterWhiteRole, emojis: EmojiPair): string {
    switch (role) {
      case 'civil': return emojis.civil
      case 'impostor': return emojis.impostor
      case 'ghost-frame': return '❓'
    }
  }
  
  private getRoleContent(role: MisterWhiteRole, state: any): { display: string, description: string } {
    if (role === 'ghost-frame') {
      return {
        display: '<div class="text-6xl mb-4">👤</div>',
        description: `
          <div class="bg-gray-500 text-white inline-block px-4 py-2 rounded-lg font-semibold mb-4">
            GHOST FRAME
          </div>
          <div class="text-gray-300 text-sm">Vous ne voyez rien - soyez malin !</div>
        `
      }
    }
    
    if (state.config.mode === 'emoji') {
      const emoji = this.getRoleEmoji(role, state.gameData.currentEmojis!)
      return {
        display: `<div class="text-6xl mb-4">${emoji}</div>`,
        description: `
          <div class="text-gray-300 text-sm">Votre emoji : ${emoji}</div>
          <div class="text-gray-400 text-xs mt-2">Mémorisez-le bien !</div>
        `
      }
    } else {
      // Mode image
      const imageUrl = role === 'civil' 
        ? state.gameData.currentImages?.civil 
        : state.gameData.currentImages?.impostor
      
      return {
        display: `
          <div class="mb-4">
            <img id="role-image-preview" src="${imageUrl}" alt="Votre image" class="w-32 h-32 object-cover rounded-xl mx-auto border-4 border-white/20 cursor-pointer hover:border-blue-400 transition-colors" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"
                 title="Cliquez pour agrandir">
            <div class="text-6xl" style="display:none">🖼️</div>
          </div>
        `,
        description: `
          <div class="text-gray-300 text-sm">Votre image de ${role === 'civil' ? 'civil' : 'imposteur'}</div>
          <div class="text-gray-400 text-xs mt-2">Mémorisez-la bien ! <span class="text-blue-300">Cliquez sur l'image pour l'agrandir</span></div>
        `
      }
    }
  }
  
  private renderScoresList(sortedPlayers: any[], state: MisterWhiteGameState): string {
    const totalCivils = state.players.filter(p => p.role === 'civil').length
    const totalImpostors = state.players.filter(p => p.role === 'impostor').length
    
    return sortedPlayers.map((player, index) => {
      const isWinner = state.winner && (
        (state.winner.type === 'civils' && player.role === 'civil') ||
        (state.winner.type === 'impostors' && player.role === 'impostor') ||
        (state.winner.type === 'ghost-frame' && player.role === 'ghost-frame')
      )
      
      let pointsExplanation = ''
      if (player.role === 'ghost-frame') {
        const elimIndex = state.gameData.eliminationHistory.findIndex((e: any) => e.playerId === player.id)
        const elimPoints = elimIndex === -1 ? state.gameData.eliminationHistory.length : elimIndex
        const bonusPoints = state.gameData.guessPhase.isCorrect ? 2 : 0
        pointsExplanation = `pts (${elimPoints} élim${bonusPoints > 0 ? ' + ' + bonusPoints + ' bonus' : ''})`
      } else if (player.role === 'civil') {
        pointsExplanation = isWinner ? `pts (${totalImpostors} imposteur${totalImpostors > 1 ? 's' : ''})` : 'pts (0 si défaite)'
      } else {
        pointsExplanation = isWinner ? `pts (${totalCivils} civil${totalCivils > 1 ? 's' : ''})` : 'pts (0 si défaite)'
      }
      
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'
      
      return `
        <div class="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg border border-slate-600">
          <div class="flex items-center">
            <span class="text-2xl mr-3">${medal}</span>
            <div>
              <div class="font-semibold text-white">${player.name}</div>
              <div class="role-reveal ${player.role} text-xs px-2 py-1 rounded">
                ${this.getRoleLabel(player.role!)}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xl font-bold text-white">${player.score || 0}</div>
            <div class="text-xs text-gray-400">${pointsExplanation}</div>
          </div>
        </div>
      `
    }).join('')
  }
  
  private getRoleLabel(role: MisterWhiteRole): string {
    switch (role) {
      case 'civil': return 'CIVIL'
      case 'impostor': return 'IMPOSTEUR'
      case 'ghost-frame': return 'GHOST FRAME'
    }
  }
  
  private getWinnerInfo(state: MisterWhiteGameState): { emoji: string, text: string } {
    switch (state.winner?.type) {
      case 'civils':
        return { emoji: '🎉', text: 'Les Civils ont gagné !' }
      case 'impostors':
        return { emoji: '🎭', text: 'Les Imposteurs ont gagné !' }
      case 'ghost-frame':
        return { emoji: '👻', text: 'Ghost Frame a gagné !' }
      default:
        return { emoji: '🎮', text: 'Partie terminée' }
    }
  }
  
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
  
  private playVotingAnimation(): void {
    // Animation pour la phase de vote
    console.log('🎬 Animation de vote')
  }
  
  private dispatchGameAction(action: any): void {
    // Dans un vrai contexte, ceci serait connecté au système de jeu
    const event = new CustomEvent('ghost-frame-action', { detail: action })
    document.dispatchEvent(event)
  }
  
  /**
   * Génère un QR code pour partager l'application
   */
  private async generateShareQRCode(screen: HTMLElement): Promise<void> {
    try {
      const canvas = screen.querySelector('#qr-canvas') as HTMLCanvasElement
      if (!canvas) return
      
      // URL de production Firebase Hosting
      const appUrl = 'https://misswhite-fbb6f.web.app'
      
      await QRCode.toCanvas(canvas, appUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: '#7c3aed', // Violet pour matcher le thème
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error)
    }
  }
}
