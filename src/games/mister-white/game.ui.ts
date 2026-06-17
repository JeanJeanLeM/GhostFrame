import { GameUI, Player } from '@/types'
import { 
  MisterWhiteGameState, 
  MisterWhiteRole, 
  LocalPlayer,
  getRoleDistributionRows
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
    container.className = 'game-board min-h-screen bg-gradient-to-br from-beige-100 via-beige-200 to-beige-100 flex flex-col'
    
    // Ajouter les styles CSS pour les animations 3D
    this.injectFlipCardStyles()
    
    switch (state.phase) {
      case 'loading':
        container.appendChild(this.renderLoadingScreen(state))
        break
      case 'home':
        container.appendChild(this.renderHomeScreen(state))
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
    screen.className = 'mister-white-game screen-loading relative flex flex-col min-h-screen overflow-hidden'
    
    screen.innerHTML = `
      <img
        src="/home-background-9x16.png"
        alt=""
        class="absolute inset-0 w-full h-full object-cover object-center"
        aria-hidden="true"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-beige-900/50 via-beige-900/25 to-beige-900/55"></div>
      <div id="loading-flashes" class="absolute inset-0 pointer-events-none overflow-hidden z-[1]"></div>
      <div id="screen-flash" class="absolute inset-0 bg-white pointer-events-none opacity-0 z-[2]"></div>

      <div class="relative z-10 text-center w-full flex flex-col items-center justify-center min-h-screen px-6">
        <div class="mb-16 w-full">
          <img src="/LogoGF.png" alt="Ghost Frame Logo" class="w-full max-w-md mx-auto drop-shadow-2xl animate-pulse" />
        </div>

        <div class="progress-container mb-4 max-w-lg mx-auto w-full">
          <div class="w-full bg-beige-300/50 rounded-full h-2 backdrop-blur-sm">
            <div id="loading-progress" class="bg-gradient-to-r from-primary-400 to-primary-500 h-2 rounded-full transition-all duration-100 shadow-lg shadow-primary-500/30" style="width: 0%"></div>
          </div>
        </div>

        <p class="text-beige-100 text-lg drop-shadow-md font-medium">Chargement en cours...</p>
      </div>
    `
    
    this.startLoadingAnimation(screen)
    
    return screen
  }
  
  private renderHomeScreen(_state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-home relative flex flex-col items-center justify-center min-h-screen overflow-hidden'

    screen.innerHTML = `
      <img
        src="/home-background-9x16.png"
        alt=""
        class="absolute inset-0 w-full h-full object-cover object-center"
        aria-hidden="true"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-beige-100/75 via-beige-50/80 to-beige-100/85 backdrop-blur-[2px]"></div>

      <div class="relative z-10 w-full max-w-sm flex flex-col items-center justify-center flex-1 px-4 py-6">
        <img src="/LogoGF.png" alt="Ghost Frame" class="w-full max-w-[220px] h-auto object-contain mx-auto drop-shadow-2xl mb-4" />
        <p class="text-beige-800 text-sm text-center mb-8 leading-snug font-medium drop-shadow-sm">
          Jeu de déduction et de bluff<br>Qui a la bonne photo ?
        </p>

        <div class="w-full flex flex-col gap-3">
          <button
            id="start-game-btn"
            type="button"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25"
          >
            Démarrer une partie
          </button>
          <button
            id="show-rules-btn"
            type="button"
            class="w-full border-2 border-beige-400/80 bg-beige-50/90 hover:bg-beige-100 text-beige-900 font-semibold py-3.5 px-6 rounded-xl text-base transition-all backdrop-blur-sm shadow-sm"
          >
            Règles du jeu
          </button>
          <button
            id="share-game-btn"
            type="button"
            class="w-full border-2 border-beige-400/80 bg-beige-50/90 hover:bg-beige-100 text-beige-900 font-semibold py-3.5 px-6 rounded-xl text-base transition-all backdrop-blur-sm shadow-sm"
          >
            Partager le jeu
          </button>
        </div>
      </div>
    `

    this.attachHomeEventListeners(screen)

    return screen
  }

  private renderRulesScreen(_state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-rules flex flex-col min-h-screen px-4 py-4 max-w-lg mx-auto bg-gradient-to-br from-beige-100 via-beige-200 to-beige-100'

    screen.innerHTML = `
      <div class="flex flex-col flex-1 min-h-0">
        <button
          id="back-to-home-btn"
          type="button"
          class="text-beige-700 hover:text-beige-900 text-sm font-medium mb-3 flex items-center gap-1 transition-colors flex-shrink-0"
        >
          ← Retour
        </button>

        <div class="flex-1 overflow-y-auto min-h-0 pb-4">
          <h1 class="text-xl font-bold text-beige-900 text-center mb-1">Règles rapides</h1>
          <p class="text-beige-700 text-sm text-center mb-4">
            Le jeu se joue sur un seul téléphone. Chaque joueur découvre secrètement son image à son tour.
          </p>

          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-3 bg-beige-200/80 rounded-xl p-2.5 border border-beige-400">
              <img src="/Expert.png" alt="Expert" class="w-14 h-14 object-contain flex-shrink-0 rounded-lg" />
              <div class="text-sm text-beige-800">
                <strong class="text-beige-900 block mb-0.5">Expert</strong>
                A la bonne image — la vraie scène capturée.
              </div>
            </div>
            <div class="flex items-center gap-3 bg-beige-200/80 rounded-xl p-2.5 border border-beige-400">
              <img src="/Novice.png" alt="Novice" class="w-14 h-14 object-contain flex-shrink-0 rounded-lg" />
              <div class="text-sm text-beige-800">
                <strong class="text-beige-900 block mb-0.5">Novice</strong>
                A une autre image — proche, mais pas la bonne.
              </div>
            </div>
            <div class="flex items-center gap-3 bg-beige-200/80 rounded-xl p-2.5 border border-beige-400">
              <img src="/Fantome.png" alt="Fantôme" class="w-14 h-14 object-contain flex-shrink-0 rounded-lg" />
              <div class="text-sm text-beige-800">
                <strong class="text-beige-900 block mb-0.5">Fantôme</strong>
                N'a pas d'image — carte SD vide, il doit bluffer.
              </div>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <h2 class="text-sm font-bold text-beige-900 uppercase tracking-wide">Répartition des rôles</h2>
            <div class="bg-beige-200/80 rounded-xl border border-beige-400 overflow-hidden">
              <table class="w-full text-xs text-beige-800">
                <thead>
                  <tr class="border-b border-beige-400 bg-beige-300/50">
                    <th class="py-2 px-2 font-semibold text-beige-900 text-center">Joueurs</th>
                    <th class="py-2 px-1 font-semibold text-beige-900 text-center">Experts</th>
                    <th class="py-2 px-1 font-semibold text-beige-900 text-center">Novices</th>
                    <th class="py-2 px-1 font-semibold text-beige-900 text-center">Fantômes</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderRoleDistributionRows()}
                </tbody>
              </table>
            </div>
            <p class="text-beige-600 text-xs text-center">Pas de Fantôme en dessous de 5 joueurs.</p>
          </div>

          <div class="space-y-2 mb-4">
            <h2 class="text-sm font-bold text-beige-900 uppercase tracking-wide">Déroulement</h2>
            <div class="flex items-start gap-2.5 bg-beige-200/80 rounded-xl p-2.5 border border-beige-400">
              <span class="text-lg leading-none mt-0.5">💭</span>
              <div class="text-sm text-beige-800">
                <strong class="text-beige-900 block mb-0.5">Discussion</strong>
                Chaque joueur dit un mot pour décrire sa photo, sans la montrer. Puis échange libre pour repérer les incohérences.
              </div>
            </div>
            <div class="flex items-start gap-2.5 bg-beige-200/80 rounded-xl p-2.5 border border-beige-400">
              <span class="text-lg leading-none mt-0.5">🗳️</span>
              <div class="text-sm text-beige-800">
                <strong class="text-beige-900 block mb-0.5">Vote</strong>
                Désignez la personne que vous pensez être le Fantôme. Le joueur éliminé est dévoilé.
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h2 class="text-sm font-bold text-beige-900 uppercase tracking-wide">Conditions de victoire</h2>
            <div class="flex items-start gap-2.5 bg-beige-200/80 rounded-xl p-2.5 border border-beige-400">
              <span class="text-lg leading-none mt-0.5">👻</span>
              <div class="text-sm text-beige-800">
                <strong class="text-beige-900 block mb-0.5">Fantôme</strong>
                Reste en vie avec 1 autre joueur, ou devine le mot secret s'il est éliminé.
              </div>
            </div>
            <div class="flex items-start gap-2.5 bg-beige-200/80 rounded-xl p-2.5 border border-beige-400">
              <span class="text-lg leading-none mt-0.5">📸</span>
              <div class="text-sm text-beige-800">
                <strong class="text-beige-900 block mb-0.5">Experts</strong>
                Éliminent le Fantôme et l'empêchent de deviner le mot secret.
              </div>
            </div>
            <div class="flex items-start gap-2.5 bg-beige-200/80 rounded-xl p-2.5 border border-beige-400">
              <span class="text-lg leading-none mt-0.5">🎯</span>
              <div class="text-sm text-beige-800">
                <strong class="text-beige-900 block mb-0.5">Novices</strong>
                Tous les Experts sont éliminés et le Fantôme aussi.
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 space-y-2 flex-shrink-0 border-t border-beige-300/60">
          <button
            id="extended-rules-btn"
            type="button"
            class="w-full border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold py-2.5 px-6 rounded-xl text-sm transition-all"
          >
            Règles complètes
          </button>
          <button
            id="start-from-rules-btn"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3.5 px-6 rounded-xl text-base transition-all"
          >
            Démarrer une partie
          </button>
        </div>
      </div>
    `

    this.attachRulesEventListeners(screen)

    return screen
  }

  private renderRoleDistributionRows(): string {
    return getRoleDistributionRows(3, 10).map((row, index) => `
      <tr class="${index % 2 === 0 ? 'bg-beige-100/40' : ''}">
        <td class="py-1.5 px-2 text-center font-medium text-beige-900">${row.players}</td>
        <td class="py-1.5 px-1 text-center">${row.experts}</td>
        <td class="py-1.5 px-1 text-center">${row.novices}</td>
        <td class="py-1.5 px-1 text-center">${row.fantomes > 0 ? row.fantomes : '—'}</td>
      </tr>
    `).join('')
  }
  
  private renderConfigScreen(state: MisterWhiteGameState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'mister-white-game screen-config w-full px-2 pt-0 pb-4 max-w-md mx-auto'
    
    screen.innerHTML = `
      <img src="/LogoGF.png" alt="Ghost Frame" class="w-full max-w-lg h-44 object-contain mx-auto drop-shadow-lg" />
      <div class="flex items-center justify-center mb-1">
        <span class="text-xl mr-2">⚙️</span>
        <h2 class="text-lg font-bold text-beige-900">CONFIGURATION</h2>
      </div>
      <p class="text-beige-700 mb-2 text-xs text-center">Paramètres de la partie</p>
      
      <div class="bg-beige-200/80 backdrop-blur-sm rounded-2xl p-6 border border-beige-400 space-y-6">
        <div>
          <label class="block text-beige-800 text-sm font-semibold mb-3 uppercase tracking-wide">
            Nombre de joueurs (3-10)
          </label>
          <input 
            type="number" 
            id="player-count" 
            min="3" 
            max="10"
            value="${state.config.playerCount}"
            class="w-full px-4 py-3 bg-beige-100 border-2 border-beige-400 text-beige-900 rounded-xl text-lg focus:outline-none focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/20 transition-all"
          >
        </div>
        
        <div>
          <label class="block text-beige-800 text-sm font-semibold mb-3 uppercase tracking-wide">
            Paire de photos (dossier images)
          </label>
          <select 
            id="pair-select"
            class="w-full px-4 py-3 bg-beige-100 border-2 border-beige-400 text-beige-900 rounded-xl text-lg focus:outline-none focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/20 transition-all"
          >
            <option value="">Chargement…</option>
          </select>
          <p class="text-beige-600 text-xs mt-1">Les paires sont lues depuis public/images-v2/pairs.json et public/images-v2/paire-XX/</p>
        </div>
        
        <div>
          <label class="block text-beige-800 text-sm font-semibold mb-3 uppercase tracking-wide">
            Difficulté
          </label>
          <select 
            id="difficulty-select"
            class="w-full px-4 py-3 bg-beige-100 border-2 border-beige-400 text-beige-900 rounded-xl text-lg focus:outline-none focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/20 transition-all"
          >
            <option value="easy" ${state.config.difficulty === 'easy' ? 'selected' : ''}>😊 Facile</option>
            <option value="medium" ${state.config.difficulty === 'medium' ? 'selected' : ''}>🤔 Moyen</option>
            <option value="hard" ${state.config.difficulty === 'hard' ? 'selected' : ''}>😈 Difficile</option>
          </select>
        </div>
        
        <div>
          <label class="block text-beige-800 text-sm font-semibold mb-3 uppercase tracking-wide">
            Nombre de manches
          </label>
          <select 
            id="rounds-select"
            class="w-full px-4 py-3 bg-beige-100 border-2 border-beige-400 text-beige-900 rounded-xl text-lg focus:outline-none focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/20 transition-all"
          >
            <option value="1" ${state.config.rounds === 1 ? 'selected' : ''}>1 manche</option>
            <option value="3" ${state.config.rounds === 3 ? 'selected' : ''}>3 manches</option>
            <option value="5" ${state.config.rounds === 5 ? 'selected' : ''}>5 manches</option>
          </select>
        </div>
        
        <button 
          id="validate-config-btn"
          class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25"
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
      <img src="/LogoGF.png" alt="Ghost Frame" class="w-full max-w-lg h-44 object-contain mx-auto drop-shadow-lg" />
      <div class="flex items-center justify-center mb-1">
        <span class="text-xl mr-2">🃏</span>
        <h2 class="text-lg font-bold text-beige-900">SETUP DES CARTES</h2>
      </div>
      <p class="text-beige-700 mb-1 text-xs text-center">Cliquez sur une carte libre pour vous enregistrer</p>
      <div class="text-xs text-beige-600 mb-2 text-center">
        ${configuredCount} / ${state.config.playerCount} joueurs configurés
      </div>
      
      <div class="cards-grid grid grid-cols-3 gap-3 px-4 mb-6">
        ${this.renderSetupCards(state)}
      </div>
      
      ${allConfigured ? `
        <div class="text-center mt-6">
          <button 
            id="start-game-btn"
            class="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-success-500/25"
          >
            🚀 Passer au jeu
          </button>
        </div>
      ` : `
        <div class="bg-warning-100 border border-warning-500 rounded-2xl p-4 max-w-2xl mx-auto text-center mt-6">
          <div class="text-warning-700 font-semibold mb-2">⚠️ Instructions</div>
          <p class="text-beige-800 text-sm">
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
      <img src="/LogoGF.png" alt="Ghost Frame" class="w-full max-w-md h-36 object-contain mx-auto drop-shadow-lg" />
      
      <div class="bg-error-100 border-2 border-error-500 rounded-xl p-2 mb-2 text-center max-w-md mx-auto">
        <p class="text-beige-800 text-xs">Premier joueur :</p>
        <div class="text-lg font-bold text-error-600">${state.gameData.firstPlayer}</div>
      </div>
      
      <p class="text-warning-700 font-semibold text-xs text-center mb-2">⚠️ Cliquez sur un joueur pour l'éliminer</p>
      
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
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent mb-4 tracking-wider">
          🎯 ÉLIMINATION
        </h1>
      </div>
      
      ${lastEliminated ? `
        <div class="bg-beige-200/80 backdrop-blur-sm rounded-2xl p-6 border border-beige-400 mb-8 text-center">
          <div class="text-6xl mb-4">💀</div>
          <h2 class="text-2xl font-bold text-beige-900 mb-4">${lastEliminated.playerName} a été éliminé</h2>
        </div>
        
        ${isMissWhiteEliminated && state.gameData.guessPhase.isActive ? `
          <div class="bg-primary-100 border-2 border-primary-500 rounded-2xl p-6 mb-8">
            <div class="text-center mb-6">
              <div class="text-4xl mb-3">📱</div>
              <h3 class="text-xl font-bold text-primary-700 mb-2">Passez le téléphone !</h3>
              <p class="text-beige-800">
                Donnez le téléphone à <strong class="text-beige-900">${lastEliminated.playerName}</strong>
              </p>
              <p class="text-sm text-beige-600 mt-2">
                Le Fantôme peut tenter de deviner le mot secret pour gagner !
              </p>
            </div>
            
            <div class="bg-beige-200/80 rounded-xl p-4 mb-6 border border-beige-300">
              <h4 class="text-lg font-semibold text-beige-900 mb-3">🎯 Dernière chance !</h4>
              <p class="text-beige-800 mb-2">
                Devinez ce que les Experts ont capturé :
              </p>
              <p class="text-beige-600 text-sm mb-4">
                Décrivez l'image ou le concept que les Experts ont vu
              </p>
              
              <div class="space-y-4">
                <input 
                  type="text" 
                  id="guess-input"
                  placeholder="Décrivez l'image (ex: Pomme)"
                  class="w-full px-4 py-3 bg-beige-100 border-2 border-beige-400 text-beige-900 rounded-xl text-lg focus:outline-none focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/20 transition-all"
                  maxlength="100"
                >
                
                <button 
                  id="submit-guess-btn"
                  class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all transform hover:scale-105"
                >
                  ✨ Deviner l'image
                </button>
              </div>
            </div>
          </div>
        ` : ''}
        
        ${!state.gameData.guessPhase.isActive && !state.winner ? `
          <div class="text-center">
            <button 
              id="continue-btn"
              class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
            >
              ▶️ Continuer le jeu
            </button>
          </div>
        ` : ''}
        
        ${!state.gameData.guessPhase.isActive && state.winner ? `
          <div class="text-center">
            <button 
              id="continue-btn"
              class="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
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
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent mb-4 tracking-wider">
          🏆 ${isLastRound ? 'RÉSULTATS FINAUX' : 'SCORES'}
        </h1>
        <p class="text-beige-700">
          ${isLastRound ? 'Partie terminée !' : `Manche ${state.config.currentRound} / ${state.config.rounds}`}
        </p>
      </div>
      
      <div class="winner-banner text-6xl mb-6">
        ${winnerInfo.emoji}
      </div>
      
      <h2 class="text-2xl font-bold text-beige-900 mb-8">${winnerInfo.text}</h2>
      
      ${this.renderRoundImagesRecap(state)}
      
      ${state.gameData.guessPhase.guessWord ? `
        <div class="bg-primary-100 border border-primary-500 rounded-2xl p-4 mb-8">
          <div class="text-lg font-semibold text-primary-700 mb-2">🎯 Devinette du Fantôme</div>
          <p class="text-beige-800 mb-4">
            Le Fantôme a deviné : 
            <strong class="text-beige-900">${state.gameData.guessPhase.guessWord}</strong>
          </p>
          <p class="text-beige-800 mb-4">
            Mot secret des Experts : 
            <strong class="text-beige-900">${state.gameData.guessPhase.secretWord || 'À définir par les joueurs'}</strong>
          </p>
          
          ${state.gameData.guessPhase.needsValidation ? `
            <!-- Validation collective par les joueurs -->
            <div class="bg-beige-200/80 rounded-xl p-4 mt-4 border border-beige-300">
              <h4 class="text-lg font-semibold text-beige-900 mb-3">🗳️ Décision collective</h4>
              <p class="text-beige-800 mb-4 text-sm">
                Tous les joueurs se mettent d'accord à l'oral pour décider si la devinette du Fantôme est acceptable.
                Soyez indulgents avec les descriptions d'images !
              </p>
              
              <!-- Boutons de décision collective -->
              <div class="grid grid-cols-2 gap-4">
                <button 
                  id="accept-guess-btn"
                  class="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-bold py-4 px-6 rounded-xl transition-all text-center"
                >
                  ✅ Accepter<br>
                  <span class="text-sm font-normal">Le Fantôme gagne</span>
                </button>
                <button 
                  id="reject-guess-btn"
                  class="bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white font-bold py-4 px-6 rounded-xl transition-all text-center"
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
                ? '<span class="text-success-600 font-bold">✅ Devinette acceptée ! Le Fantôme gagne la partie !</span>'
                : '<span class="text-error-600 font-bold">❌ Devinette refusée - Victoire aux survivants !</span>'
              }
            </div>
          `}
        </div>
      ` : ''}
      
      <div class="bg-beige-200/80 backdrop-blur-sm rounded-2xl p-6 border border-beige-400 mb-8">
        <h3 class="text-xl font-bold text-beige-900 mb-4">🎖️ Classement</h3>
        <div class="space-y-3">
          ${this.renderScoresList(sortedPlayers, state)}
        </div>
      </div>
      
      <div class="flex flex-col gap-4">
        ${!isLastRound ? `
          <button 
            id="next-round-btn"
            class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
          >
            🔄 Manche suivante
          </button>
        ` : ''}
        
        <div class="flex flex-col sm:flex-row gap-4">
          <button 
            id="new-game-btn"
            class="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
          >
            🆕 Nouvelle partie
          </button>
          <button 
            id="reset-btn"
            class="flex-1 bg-gradient-to-r from-beige-600 to-beige-700 hover:from-beige-700 hover:to-beige-800 text-white font-bold py-4 px-6 rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105"
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
      const emoji = this.getPlayerThemeEmoji(index)
      
      let cardClass = 'free'
      if (isConfigured) {
        cardClass = 'configured'
      } else if (needsToSeeRole) {
        cardClass = 'needs-reveal'  // Nouvelle manche - doit voir son nouveau rôle
      }
      
      return `
        <div class="card setup-card ${cardClass}" data-card-index="${index}">
          <div class="card-inner">
            <div class="card-face card-front setup-card-face">
              <div class="game-card-emoji">${isConfigured ? '✅' : emoji}</div>
              <div class="game-card-separator"></div>
              <div class="game-card-name">${isConfigured ? player.name : needsToSeeRole ? player.name : 'Carte Libre'}</div>
            </div>
          </div>
        </div>
      `
    }).join('')
  }
  
  private renderRoleCards(state: MisterWhiteGameState): string {
    const imgs = state.gameData.currentImages
    if (!imgs) return ''
    const shuffledIndices = [...Array(state.players.length).keys()]
    this.shuffleArray(shuffledIndices)
    return shuffledIndices.map(playerIndex => {
      const player = state.players[playerIndex]
      const role = player.role!
      const isFlipped = state.gameData.cardsSeen[player.id] || false
      const imgUrl = role === 'ghost-frame' ? '/Fantome.png' : (role === 'civil' ? imgs.civil : imgs.impostor)
      return `
        <div class="card ${isFlipped ? 'flipped' : ''}" data-player-index="${playerIndex}">
          <div class="card-inner">
            <div class="card-face card-front">
              <div class="card-icon text-6xl mb-4">👤</div>
              <div class="card-role text-xl font-bold tracking-wide">${player.name}</div>
            </div>
            <div class="card-face card-back ${role}">
              <img src="${imgUrl}" alt="Rôle" class="w-24 h-24 object-contain mx-auto mb-2 rounded-lg" onerror="this.style.display='none'"/>
              <div class="card-player-name text-sm opacity-80">${player.name}</div>
            </div>
          </div>
        </div>
      `
    }).join('')
  }
  
  /** Emojis par thème : photo, mode, star, cinema, politicien, choc */
  private static readonly PLAYER_THEME_EMOJIS = ['📷', '👗', '⭐', '🎬', '🎩', '😱']

  private getPlayerThemeEmoji(playerIndex: number): string {
    const emojis = MisterWhiteGameUI.PLAYER_THEME_EMOJIS
    return emojis[playerIndex % emojis.length]
  }

  private renderGameCards(state: MisterWhiteGameState): string {
    return state.players.map((player, index) => {
      const isEliminated = state.gameData.eliminatedPlayers.includes(player.id)
      const canVote = state.gameData.gamePhase.votingStarted && !isEliminated
      const emoji = this.getPlayerThemeEmoji(index)
      
      return `
        <div class="game-card ${isEliminated ? 'eliminated' : canVote ? 'votable' : 'normal'}" data-player-id="${player.id}">
          <div class="game-card-emoji">${isEliminated ? '💀' : emoji}</div>
          <div class="game-card-separator"></div>
          <div class="game-card-name">${player.name}</div>
          ${isEliminated ? `
            <div class="game-card-status">Éliminé</div>
          ` : ''}
        </div>
      `
    }).join('')
  }
  
  private renderSurvivors(state: MisterWhiteGameState): string {
    const survivors = state.players.filter(p => !p.isEliminated)
    
    return survivors.map(player => `
      <div class="flex items-center justify-between p-3 bg-beige-200 rounded-lg border border-beige-400">
        <span class="font-semibold text-beige-900">${player.name}</span>
        <span class="text-beige-600 text-sm">En jeu</span>
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
        background: linear-gradient(135deg, #3d3229 0%, #5c4d42 50%, #2d2520 100%);
        border-color: rgba(184, 92, 74, 0.6);
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
        background: linear-gradient(135deg, #3d3229 0%, #5c4d42 100%);
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
        border-color: #6b8c69;
        background: linear-gradient(135deg, #5a7a58 0%, #7d9b7a 50%, #8fab8c 100%);
        box-shadow: 0 15px 35px rgba(125, 155, 122, 0.4), 0 5px 15px rgba(125, 155, 122, 0.2);
      }
      
      .mister-white-game .card-back.impostor {
        border-color: #a04a3a;
        background: linear-gradient(135deg, #8a3d2e 0%, #b85c4a 50%, #c97a6a 100%);
        box-shadow: 0 15px 35px rgba(184, 92, 74, 0.4), 0 5px 15px rgba(184, 92, 74, 0.2);
      }
      
      .mister-white-game .card-back.ghost-frame {
        border-color: #6b5b4f;
        background: linear-gradient(135deg, #a68b5b 0%, #c4a574 50%, #ebe5dc 100%);
        color: #3d3229;
        box-shadow: 0 15px 35px rgba(107, 91, 79, 0.4), 0 5px 15px rgba(107, 91, 79, 0.2);
      }
      
      .mister-white-game .game-card {
        aspect-ratio: 1/1;
        background: #ffffff;
        padding: 0;
        border-radius: 16px;
        text-align: center;
        transition: all 0.3s ease;
        border: 1px solid #e8e4df;
        color: #3d3229;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(61, 50, 41, 0.08);
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: stretch;
        min-height: 160px;
      }
      
      .mister-white-game .game-card .game-card-emoji {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        min-height: 0;
        padding: 16px 12px 8px;
        background: linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%);
      }
      
      .mister-white-game .game-card .game-card-separator {
        height: 2px;
        background: linear-gradient(90deg, transparent, #e0d9cf, transparent);
        flex-shrink: 0;
      }
      
      .mister-white-game .game-card .game-card-name {
        flex-shrink: 0;
        font-size: 0.95rem;
        font-weight: 600;
        padding: 10px 12px 14px;
        color: #3d3229;
        letter-spacing: 0.3px;
        line-height: 1.2;
        word-break: break-word;
        background: #ffffff;
      }
      
      .mister-white-game .game-card .game-card-status {
        flex-shrink: 0;
        font-size: 0.75rem;
        font-weight: 500;
        color: #a04a3a;
        padding-bottom: 8px;
      }
      
      .mister-white-game .game-card.normal {
        cursor: default;
      }
      
      .mister-white-game .game-card.votable {
        cursor: pointer;
        border-color: #c4a574;
        box-shadow: 0 4px 16px rgba(166, 139, 91, 0.2);
      }
      
      .mister-white-game .game-card.votable:hover {
        transform: translateY(-4px);
        border-color: #a68b5b;
        box-shadow: 0 8px 24px rgba(166, 139, 91, 0.25);
        background: #ffffff;
      }
      
      .mister-white-game .game-card.eliminated {
        opacity: 0.65;
        pointer-events: none;
        border-color: #d4c4a8;
        background: #f5f0e8;
        filter: grayscale(0.5);
      }
      
      .mister-white-game .game-card.eliminated .game-card-emoji {
        background: #ebe5dc;
      }
      
      .mister-white-game .game-card.eliminated .game-card-name {
        background: #f5f0e8;
        color: #6b5b4f;
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
      
      .mister-white-game .setup-card .card-front.setup-card-face {
        background: #ffffff;
        border: 1px solid #e8e4df;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(61, 50, 41, 0.08);
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: stretch;
      }
      
      .mister-white-game .setup-card .card-front.setup-card-face::before,
      .mister-white-game .setup-card .card-front.setup-card-face::after {
        display: none;
      }
      
      .mister-white-game .setup-card .card-front .game-card-emoji {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        min-height: 0;
        padding: 16px 12px 8px;
        background: linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%);
      }
      
      .mister-white-game .setup-card .card-front .game-card-separator {
        height: 2px;
        background: linear-gradient(90deg, transparent, #e0d9cf, transparent);
        flex-shrink: 0;
      }
      
      .mister-white-game .setup-card .card-front .game-card-name {
        flex-shrink: 0;
        font-size: 0.95rem;
        font-weight: 600;
        padding: 10px 12px 14px;
        color: #3d3229;
        letter-spacing: 0.3px;
        line-height: 1.2;
        word-break: break-word;
        background: #ffffff;
      }
      
      .mister-white-game .setup-card .card-front .game-card-status {
        flex-shrink: 0;
        font-size: 0.75rem;
        font-weight: 500;
        color: #6b8c69;
        padding-bottom: 8px;
      }
      
      .mister-white-game .setup-card.configured .card-front.setup-card-face {
        border-color: #6b8c69;
        box-shadow: 0 2px 12px rgba(107, 140, 105, 0.15);
      }
      
      .mister-white-game .setup-card.configured .card-front .game-card-emoji {
        background: linear-gradient(180deg, #f0f5ef 0%, #e0ebe0 100%);
      }
      
      .mister-white-game .setup-card.needs-reveal {
        cursor: pointer;
      }
      
      .mister-white-game .setup-card.needs-reveal:hover {
        transform: translateY(-4px) scale(1.02);
      }
      
      .mister-white-game .setup-card.needs-reveal .card-front.setup-card-face {
        border-color: #c4a574;
        box-shadow: 0 4px 16px rgba(166, 139, 91, 0.2);
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
        background: linear-gradient(135deg, #7d9b7a 0%, #8fab8c 100%);
        color: white;
        border-color: #6b8c69;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .mister-white-game .role-reveal.impostor {
        background: linear-gradient(135deg, #b85c4a 0%, #c97a6a 100%);
        color: white;
        border-color: #a04a3a;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .mister-white-game .role-reveal.ghost-frame {
        background: linear-gradient(135deg, #c4a574 0%, #ebe5dc 100%);
        color: #3d3229;
        border-color: #6b5b4f;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
      }
      
      .mister-white-game .game-card {
        aspect-ratio: 1/1;
        background: #ffffff;
        padding: 0;
        border-radius: 16px;
        text-align: center;
        transition: all 0.3s ease;
        border: 1px solid #e8e4df;
        color: #3d3229;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(61, 50, 41, 0.08);
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: stretch;
        min-height: 160px;
      }
      
      .mister-white-game .game-card .game-card-emoji {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        min-height: 0;
        padding: 16px 12px 8px;
        background: linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%);
      }
      
      .mister-white-game .game-card .game-card-separator {
        height: 2px;
        background: linear-gradient(90deg, transparent, #e0d9cf, transparent);
        flex-shrink: 0;
      }
      
      .mister-white-game .game-card .game-card-name {
        flex-shrink: 0;
        font-size: 0.95rem;
        font-weight: 600;
        padding: 10px 12px 14px;
        color: #3d3229;
        letter-spacing: 0.3px;
        line-height: 1.2;
        word-break: break-word;
        background: #ffffff;
      }
      
      .mister-white-game .game-card .game-card-status {
        flex-shrink: 0;
        font-size: 0.75rem;
        font-weight: 500;
        color: #a04a3a;
        padding-bottom: 8px;
      }
      
      .mister-white-game .game-card.normal {
        cursor: default;
      }
      
      .mister-white-game .game-card.votable {
        cursor: pointer;
        border-color: #c4a574;
        box-shadow: 0 4px 16px rgba(166, 139, 91, 0.2);
      }
      
      .mister-white-game .game-card.votable:hover {
        transform: translateY(-4px);
        border-color: #a68b5b;
        box-shadow: 0 8px 24px rgba(166, 139, 91, 0.25);
        background: #ffffff;
      }
      
      .mister-white-game .game-card.eliminated {
        opacity: 0.65;
        pointer-events: none;
        border-color: #d4c4a8;
        background: #f5f0e8;
        filter: grayscale(0.5);
      }
      
      .mister-white-game .game-card.eliminated .game-card-emoji {
        background: #ebe5dc;
      }
      
      .mister-white-game .game-card.eliminated .game-card-name {
        background: #f5f0e8;
        color: #6b5b4f;
      }

      .mister-white-game .camera-flash {
        position: absolute;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,248,230,0.85) 12%, rgba(255,230,180,0.35) 38%, transparent 68%);
        opacity: 0;
        pointer-events: none;
        mix-blend-mode: screen;
      }

      .mister-white-game .camera-flash::before,
      .mister-white-game .camera-flash::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent);
        transform: translate(-50%, -50%);
      }

      .mister-white-game .camera-flash::before {
        width: 220%;
        height: 3px;
      }

      .mister-white-game .camera-flash::after {
        width: 3px;
        height: 220%;
        background: linear-gradient(180deg, transparent, rgba(255,255,255,0.95), transparent);
      }

      .mister-white-game .camera-flash.active {
        animation: cameraFlashPop 0.35s ease-out forwards;
      }

      @keyframes cameraFlashPop {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.15); }
        10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.7); }
      }

      #screen-flash.screen-flash-active {
        animation: screenFlashBurst 0.45s ease-out forwards;
      }

      @keyframes screenFlashBurst {
        0% { opacity: 0; }
        8% { opacity: 0.3; }
        30% { opacity: 0; }
        100% { opacity: 0; }
      }
    `
    
    document.head.appendChild(style)
  }
  
  // --- Event Listeners (nouveau flow) ---
  
  private startLoadingAnimation(screen: HTMLElement): void {
    const progressBar = screen.querySelector('#loading-progress') as HTMLElement
    let progress = 0
    const flashInterval = this.startCameraFlashAnimation(screen)
    
    const interval = setInterval(() => {
      progress += 2
      progressBar.style.width = `${progress}%`
      
      if (progress >= 100) {
        clearInterval(interval)
        clearInterval(flashInterval)
        setTimeout(() => {
          this.dispatchGameAction({ type: 'FINISH_LOADING' })
        }, 500)
      }
    }, 100)
  }

  private startCameraFlashAnimation(screen: HTMLElement): ReturnType<typeof setInterval> {
    const flashesContainer = screen.querySelector('#loading-flashes') as HTMLElement
    const screenFlash = screen.querySelector('#screen-flash') as HTMLElement

    const triggerFlash = () => {
      const flash = document.createElement('div')
      flash.className = 'camera-flash'
      const size = 50 + Math.random() * 90
      flash.style.top = `${8 + Math.random() * 84}%`
      flash.style.left = `${8 + Math.random() * 84}%`
      flash.style.width = `${size}px`
      flash.style.height = `${size}px`
      flashesContainer.appendChild(flash)

      requestAnimationFrame(() => flash.classList.add('active'))

      if (Math.random() < 0.22 && screenFlash) {
        screenFlash.classList.remove('screen-flash-active')
        void screenFlash.offsetWidth
        screenFlash.classList.add('screen-flash-active')
      }

      setTimeout(() => flash.remove(), 400)
    }

    triggerFlash()

    return setInterval(() => {
      triggerFlash()
      if (Math.random() < 0.45) {
        setTimeout(triggerFlash, 60 + Math.random() * 120)
      }
    }, 280 + Math.random() * 420)
  }
  
  private attachHomeEventListeners(screen: HTMLElement): void {
    const startBtn = screen.querySelector('#start-game-btn')
    const rulesBtn = screen.querySelector('#show-rules-btn')
    const shareBtn = screen.querySelector('#share-game-btn')

    startBtn?.addEventListener('click', () => {
      this.dispatchGameAction({ type: 'START_FROM_RULES' })
    })
    rulesBtn?.addEventListener('click', () => {
      this.dispatchGameAction({ type: 'SHOW_RULES' })
    })
    shareBtn?.addEventListener('click', () => {
      this.showShareModal()
    })
  }

  private attachRulesEventListeners(screen: HTMLElement): void {
    const startBtn = screen.querySelector('#start-from-rules-btn')
    const extendedRulesBtn = screen.querySelector('#extended-rules-btn')
    const backBtn = screen.querySelector('#back-to-home-btn')

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.dispatchGameAction({ type: 'START_FROM_RULES' })
      })
    }
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.dispatchGameAction({ type: 'BACK_TO_HOME' })
      })
    }
    if (extendedRulesBtn) {
      extendedRulesBtn.addEventListener('click', () => {
        this.showExtendedRulesModal()
      })
    }
  }

  private showShareModal(): void {
    const appUrl = 'https://misswhite-fbb6f.web.app'

    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-label', 'Partager le jeu')
    modal.innerHTML = `
      <div class="bg-gradient-to-br from-beige-200 to-beige-300 rounded-2xl shadow-2xl border-2 border-beige-400 max-w-sm w-full p-6 text-center">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-beige-900">Partager le jeu</h2>
          <button id="close-share-btn" type="button" class="text-beige-700 hover:text-beige-900 text-2xl leading-none w-8 h-8 flex items-center justify-center" aria-label="Fermer">×</button>
        </div>
        <p class="text-beige-700 text-sm mb-4">Invitez vos amis à rejoindre Ghost Frame</p>
        <button type="button" id="share-link-btn" class="w-full mb-4 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors">
          Copier / Partager le lien
        </button>
        <div class="flex justify-center mb-2">
          <div class="bg-beige-50 p-3 rounded-xl border border-beige-200">
            <canvas id="qr-canvas" width="150" height="150"></canvas>
          </div>
        </div>
        <p class="text-beige-600 text-xs">Scannez le QR code pour ouvrir l'app</p>
      </div>
    `

    const closeModal = () => modal.remove()
    modal.querySelector('#close-share-btn')?.addEventListener('click', closeModal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal()
    })

    const shareLinkBtn = modal.querySelector('#share-link-btn')
    shareLinkBtn?.addEventListener('click', async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            url: appUrl,
            title: 'Ghost Frame',
            text: 'Rejoins la partie Ghost Frame – jeu de déduction et de bluff !'
          })
          const btn = shareLinkBtn as HTMLButtonElement
          const orig = btn.textContent
          btn.textContent = 'Partagé !'
          setTimeout(() => { btn.textContent = orig }, 2000)
        } else {
          await navigator.clipboard.writeText(appUrl)
          const btn = shareLinkBtn as HTMLButtonElement
          const orig = btn.textContent
          btn.textContent = 'Lien copié !'
          setTimeout(() => { btn.textContent = orig }, 2000)
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(appUrl)
            const btn = shareLinkBtn as HTMLButtonElement
            const orig = btn.textContent
            btn.textContent = 'Lien copié !'
            setTimeout(() => { btn.textContent = orig }, 2000)
          } catch {
            alert('Lien : ' + appUrl)
          }
        }
      }
    })

    document.body.appendChild(modal)
    this.generateShareQRCode(modal)
  }
  
  /**
   * Règles étendues en mode « livre » : un écran à la fois, navigation Précédent / Suivant, pas d'animation, images grandes.
   */
  private showExtendedRulesModal(): void {
    const PAGES: { title: string; content: string }[] = [
      {
        title: '1. L\'histoire',
        content: `
          <p class="text-beige-800 leading-relaxed mb-4">
            Cette nuit, quelque chose d'extraordinaire s'est produit. Tous les paparazzis de la ville ont convergé vers le même endroit au même moment. Les flashs ont crépité ; chacun a mitraillé la scène, espérant LA photo qui fera la une.
          </p>
          <p class="text-beige-800 leading-relaxed mb-4">
            À l'aube, vous voilà réunis au QG de l'agence. Le rédacteur en chef veut savoir : qui a vraiment capturé le bon moment ? Tout le monde prétend avoir la photo parfaite. Mais les <strong class="text-beige-900">Experts</strong> ont capturé LA vraie scène. Les <strong class="text-beige-900">Novices</strong> ont une photo différente – proche, mais pas la bonne. Les <strong class="text-beige-900">Fantômes</strong> n'ont pas réussi à prendre de photo : leur carte SD est vide, mais ils ne peuvent pas l'avouer – leur crédibilité en dépend.
          </p>
          <p class="text-beige-800 leading-relaxed">
            Dans cette salle de rédaction, chacun va décrire sa photo sans la montrer. Repérez qui bluffe, qui s'est planté, et qui ment. Car publier la mauvaise photo, c'est la fin de votre carrière.
          </p>
        `
      },
      {
        title: '2. Rôle Expert',
        content: `
          <div class="flex flex-col items-center mb-6">
            <img src="/Expert.png" alt="Expert" class="w-56 h-56 object-contain rounded-xl border-2 border-beige-300 mb-4" />
            <h3 class="text-xl font-bold text-beige-900 mb-2">Expert</h3>
          </div>
          <p class="text-beige-800 leading-relaxed">
            Vous étiez au bon endroit au bon moment. Vous avez capturé <strong class="text-beige-900">LA vraie scène</strong>. Repérez les Novices et le Fantôme, et prouvez votre légitimité aux autres Experts.
          </p>
        `
      },
      {
        title: '3. Rôle Novice',
        content: `
          <div class="flex flex-col items-center mb-6">
            <img src="/Novice.png" alt="Novice" class="w-56 h-56 object-contain rounded-xl border-2 border-beige-300 mb-4" />
            <h3 class="text-xl font-bold text-beige-900 mb-2">Novice</h3>
          </div>
          <p class="text-beige-800 leading-relaxed">
            Votre photo montre une scène différente – proche, mais pas la bonne. Fondez-vous dans la masse, restez vague, faites croire que vous décrivez la même scène.
          </p>
        `
      },
      {
        title: '4. Rôle Fantôme',
        content: `
          <div class="flex flex-col items-center mb-6">
            <img src="/Fantome.png" alt="Fantôme" class="w-56 h-56 object-contain rounded-xl border-2 border-beige-300 mb-4" />
            <h3 class="text-xl font-bold text-beige-900 mb-2">Fantôme</h3>
          </div>
          <p class="text-beige-800 leading-relaxed">
            Votre carte SD est vide – pas de photo. Survivez en improvisant : écoutez les descriptions, déduisez le thème, et ne laissez rien paraître.
          </p>
        `
      },
      {
        title: '5. Déroulement',
        content: `
          <ul class="text-beige-800 space-y-3 list-disc list-inside leading-relaxed">
            <li><strong class="text-beige-900">Configuration</strong> : nombre de joueurs, paire de photos (choix dans le dossier images).</li>
            <li><strong class="text-beige-900">Setup</strong> : chaque joueur reçoit sa « photo » (rôle et image, ou rien pour le Fantôme).</li>
            <li><strong class="text-beige-900">Discussion</strong> : tour de parole (un mot chacun), puis échange libre – décrivez sans montrer.</li>
            <li><strong class="text-beige-900">Vote</strong> : qui n'a pas la bonne photo ? Désignation puis révélation simultanée.</li>
            <li><strong class="text-beige-900">Élimination</strong> : le joueur éliminé est dévoilé. Si c'est le Fantôme, il peut tenter de deviner le mot secret des Experts (validation collective).</li>
            <li>On enchaîne votes et éliminations jusqu'à ce qu'une condition de victoire soit atteinte.</li>
          </ul>
        `
      },
      {
        title: '6. Conditions de victoire',
        content: `
          <ul class="text-beige-800 space-y-3 list-disc list-inside leading-relaxed">
            <li><strong class="text-beige-900">Victoire du Fantôme</strong> : rester en vie avec exactement 1 autre joueur, OU être éliminé et deviner correctement le mot secret (validé par les joueurs).</li>
            <li><strong class="text-beige-900">Victoire des Experts</strong> : éliminer le Fantôme et l'empêcher de deviner le mot secret.</li>
            <li><strong class="text-beige-900">Victoire des Novices</strong> : tous les Experts sont éliminés et le Fantôme aussi.</li>
          </ul>
        `
      }
    ]

    let currentPage = 0
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-label', 'Règles étendues')
    modal.innerHTML = `
      <div class="bg-gradient-to-br from-beige-200 to-beige-300 rounded-2xl shadow-2xl border-2 border-beige-400 max-w-lg w-full max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-beige-400 rounded-t-2xl bg-beige-200/95">
          <h2 class="text-lg font-bold text-beige-900" id="extended-rules-title">${PAGES[0].title}</h2>
          <button id="close-extended-rules-btn" type="button" class="text-beige-700 hover:text-beige-900 text-2xl leading-none w-8 h-8 flex items-center justify-center" aria-label="Fermer">×</button>
        </div>
        <div class="p-6 overflow-y-auto flex-1 min-h-0" id="extended-rules-content">
          ${PAGES[0].content}
        </div>
        <div class="px-6 pb-6 pt-2 flex gap-3 border-t border-beige-400">
          <button id="extended-rules-prev" type="button" class="flex-1 py-3 px-4 bg-beige-400 hover:bg-beige-500 text-beige-900 font-semibold rounded-xl transition-colors" style="display:none">← Précédent</button>
          <button id="extended-rules-next" type="button" class="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors">Suivant</button>
        </div>
      </div>
    `
    document.body.appendChild(modal)

    const titleEl = modal.querySelector('#extended-rules-title') as HTMLElement
    const contentEl = modal.querySelector('#extended-rules-content') as HTMLElement
    const prevBtn = modal.querySelector('#extended-rules-prev') as HTMLButtonElement
    const nextBtn = modal.querySelector('#extended-rules-next') as HTMLButtonElement

    const renderPage = (index: number) => {
      currentPage = index
      const page = PAGES[index]
      titleEl.textContent = page.title
      contentEl.innerHTML = page.content
      prevBtn.style.display = index === 0 ? 'none' : 'block'
      nextBtn.textContent = index === PAGES.length - 1 ? 'Fermer' : 'Suivant'
    }

    const closeModal = () => {
      if (modal.parentNode) document.body.removeChild(modal)
    }

    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) renderPage(currentPage - 1)
    })
    nextBtn.addEventListener('click', () => {
      if (currentPage < PAGES.length - 1) {
        renderPage(currentPage + 1)
      } else {
        closeModal()
      }
    })
    modal.querySelector('#close-extended-rules-btn')?.addEventListener('click', closeModal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal()
    })
  }
  
  private attachConfigEventListeners(screen: HTMLElement): void {
    const pairSelect = screen.querySelector('#pair-select') as HTMLSelectElement
    if (pairSelect) {
      import('@assets/images/imageRegistry').then(({ fetchAllPairs }) => {
        fetchAllPairs().then((pairs) => {
          pairSelect.innerHTML = ''
          if (pairs.length === 0) {
            pairSelect.innerHTML = '<option value="">Aucune paire (ajoutez public/images-v2/pairs.json et dossiers public/images-v2/paire-XX/)</option>'
            return
          }
          pairs.forEach((p) => {
            const opt = document.createElement('option')
            opt.value = `${p.theme}|${p.id}`
            opt.textContent = p.label
            pairSelect.appendChild(opt)
          })
        }).catch(() => {
          pairSelect.innerHTML = '<option value="">Erreur chargement</option>'
        })
      })
    }

    const validateBtn = screen.querySelector('#validate-config-btn')
    if (validateBtn) {
      validateBtn.addEventListener('click', async () => {
        const playerCount = parseInt((screen.querySelector('#player-count') as HTMLInputElement).value)
        const pairValue = (screen.querySelector('#pair-select') as HTMLSelectElement).value
        const difficulty = (screen.querySelector('#difficulty-select') as HTMLSelectElement).value
        const rounds = parseInt((screen.querySelector('#rounds-select') as HTMLSelectElement).value)
        
        if (playerCount < 3 || playerCount > 10) {
          alert('Le nombre de joueurs doit être entre 3 et 10!')
          return
        }
        if (!pairValue) {
          alert('Choisissez une paire de photos dans le dossier images.')
          return
        }
        const [theme, pairId] = pairValue.split('|')
        validateBtn.setAttribute('disabled', 'true')
        ;(validateBtn as HTMLButtonElement).textContent = 'Chargement…'
        const { getImagePairsForRounds } = await import('@assets/images/imageRegistry')
        const imagesByRound = await getImagePairsForRounds(theme, pairId, rounds)
        validateBtn.removeAttribute('disabled')
        ;(validateBtn as HTMLButtonElement).textContent = 'Créer les cartes →'
        if (!imagesByRound.length) {
          alert('Impossible de charger les paires. Vérifiez public/images-v2/' + pairId + '/')
          return
        }
        this.dispatchGameAction({
          type: 'SET_CONFIG',
          data: { playerCount, selectedPairKey: pairValue, difficulty, rounds, imagesByRound }
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
    // Logs : ouverture d'une carte (pour debug chargement images)
    const currentImages = state.gameData?.currentImages
    const imageUrl = role === 'civil' ? currentImages?.civil : role === 'impostor' ? currentImages?.impostor : null
    const hasImageRole = role === 'civil' || role === 'impostor'
    console.log('[Card] Ouverture carte', { cardIndex, role, selectedPairKey: state.config?.selectedPairKey, imageUrl: imageUrl ?? '(fantôme)' })
    if (!currentImages && role !== 'ghost-frame') {
      if (!currentImages) {
        console.warn('[Card] currentImages est null/undefined : les images n’ont pas été chargées au SET_CONFIG (vérifier le thème et pairs.json)')
      } else if (!imageUrl) {
        console.warn('[Card] URL image vide pour le rôle', role)
      }
    }

    const modal = document.createElement('div')
    const player = state.players[cardIndex]
    const hasExistingName = player.name && player.name.trim() !== ''
    const isSubsequentRound = state.config.currentRound > 1
    const skipNameStep = isSubsequentRound || (hasExistingName && !player.cardConfigured)

    const newRoundBanner = skipNameStep ? `
      <div class="bg-warning-100 border border-warning-500 rounded-xl p-3 mb-3">
        <div class="text-warning-700 font-semibold">🔄 Nouvelle manche</div>
        <div class="text-beige-900 text-lg font-bold mt-1">${player.name}</div>
        <div class="text-beige-700 text-sm">Score actuel : ${player.score || 0} pts</div>
      </div>
    ` : ''

    const nameInputBlock = !skipNameStep ? `
      <div>
        <label class="block text-beige-800 text-sm font-semibold mb-2">Votre prénom :</label>
        <input 
          type="text" 
          id="player-name-input"
          class="w-full px-4 py-3 bg-beige-100 border-2 border-beige-400 text-beige-900 rounded-xl text-lg focus:outline-none focus:border-primary-500 transition-all"
          placeholder="Entrez votre prénom..."
          maxlength="20"
        >
      </div>
    ` : `
      <input type="hidden" id="player-name-input" value="${player.name}">
    `

    const actionButtons = `
      <div class="flex space-x-3">
        <button 
          id="confirm-card-btn"
          class="flex-1 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
        >
          ✅ ${skipNameStep ? 'J\'ai vu mon rôle' : 'Valider'}
        </button>
        <button 
          id="cancel-card-btn"
          class="flex-1 bg-gradient-to-r from-beige-500 to-beige-600 hover:from-beige-600 hover:to-beige-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
        >
          ❌ Annuler
        </button>
      </div>
    `

    if (hasImageRole) {
      this.showImageRoleCardModal(cardIndex, imageUrl || '', skipNameStep, player, state)
      return
    }

    const content = this.getRoleContent(role as any, state)
    modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50'
    modal.innerHTML = `
      <div class="bg-beige-200 rounded-2xl p-6 border border-beige-400 max-w-md mx-4">
        <div class="text-center mb-6">
          ${newRoundBanner}
          ${content.display}
          <h3 class="text-xl font-bold text-beige-900 mb-2">${skipNameStep ? 'Votre nouveau rôle' : 'Configuration de votre carte'}</h3>
          ${content.description}
        </div>
        <div class="space-y-4">
          ${nameInputBlock}
          ${actionButtons}
        </div>
      </div>
    `

    document.body.appendChild(modal)
    this.attachCardConfigListeners(modal, cardIndex, state, skipNameStep, () => {
      document.body.removeChild(modal)
    })
    modal.addEventListener('click', (e) => {
      if (e.target === modal) document.body.removeChild(modal)
    })
  }

  /**
   * Flux en 3 étapes pour Expert/Novice (1 seule à la 1re manche) :
   * 1. Saisie du prénom — uniquement manche 1
   * 2. Affichage de l'image en grand
   * 3. Validation et fermeture
   * Manches suivantes : étapes 2 et 3 seulement (prénom conservé).
   */
  private showImageRoleCardModal(
    cardIndex: number,
    imageUrl: string,
    skipNameStep: boolean,
    player: any,
    state: any
  ): void {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 z-50 flex flex-col'
    document.body.appendChild(modal)

    let step = skipNameStep ? 2 : 1
    let savedPlayerName = skipNameStep ? player.name : ''

    const newRoundBanner = skipNameStep ? `
      <div class="bg-warning-100 border border-warning-500 rounded-xl p-3 mb-3">
        <div class="text-warning-700 font-semibold">🔄 Nouvelle manche</div>
        <div class="text-beige-900 text-lg font-bold mt-1">${player.name}</div>
        <div class="text-beige-700 text-sm">Score actuel : ${player.score || 0} pts</div>
      </div>
    ` : ''

    const imageBlock = `
      <div class="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
        <img
          id="role-image-preview"
          src="${imageUrl}"
          alt="Votre image"
          class="max-w-[95vw] max-h-[calc(100vh-180px)] w-auto h-auto object-contain rounded-xl shadow-2xl"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; console.warn('[Card] Échec chargement image:', this.src)"
        >
        <div class="hidden flex-col items-center justify-center p-8 text-white min-h-[200px]">
          <div class="text-6xl mb-4">🖼️</div>
          <p class="text-lg">Image non disponible</p>
        </div>
      </div>
    `

    const closeModal = () => {
      document.body.removeChild(modal)
    }

    const validateName = (): boolean => {
      const input = modal.querySelector('#player-name-input') as HTMLInputElement
      const playerName = input?.value.trim() ?? savedPlayerName

      if (!playerName) {
        alert('Veuillez saisir votre prénom !')
        return false
      }

      const existingNames = state.players
        .filter((p: any, i: number) => i !== cardIndex && p.cardConfigured)
        .map((p: any) => p.name.toLowerCase())

      if (existingNames.includes(playerName.toLowerCase())) {
        alert('Ce prénom est déjà utilisé !')
        return false
      }

      savedPlayerName = playerName
      return true
    }

    const confirmCard = () => {
      this.dispatchGameAction({
        type: 'CONFIGURE_CARD',
        data: { cardIndex, playerName: savedPlayerName }
      })
      closeModal()
    }

    const attachImageLogs = () => {
      const roleImage = modal.querySelector('#role-image-preview') as HTMLImageElement
      if (roleImage) {
        roleImage.addEventListener('load', () => console.log('[Card] Image chargée:', roleImage.src))
        roleImage.addEventListener('error', () => console.warn('[Card] Échec chargement image:', roleImage.src))
      }
    }

    const stepLabel = (viewStep: 2 | 3): string => {
      if (skipNameStep) {
        return viewStep === 2 ? 'Étape 1 / 2' : 'Étape 2 / 2'
      }
      return viewStep === 2 ? 'Étape 2 / 3' : 'Étape 3 / 3'
    }

    const renderStep = () => {
      if (step === 1) {
        modal.className = 'fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4'
        modal.innerHTML = `
          <div class="bg-beige-200 rounded-2xl p-6 border border-beige-400 max-w-md w-full mx-4">
            <div class="text-center mb-6">
              <p class="text-beige-600 text-sm mb-2">Étape 1 / 3</p>
              <h3 class="text-xl font-bold text-beige-900">Qui êtes-vous ?</h3>
              <p class="text-beige-700 text-sm mt-2">Entrez votre prénom avant de découvrir votre image.</p>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-beige-800 text-sm font-semibold mb-2">Votre prénom :</label>
                <input 
                  type="text" 
                  id="player-name-input"
                  class="w-full px-4 py-3 bg-beige-100 border-2 border-beige-400 text-beige-900 rounded-xl text-lg focus:outline-none focus:border-primary-500 transition-all"
                  placeholder="Entrez votre prénom..."
                  maxlength="20"
                  value="${savedPlayerName}"
                >
              </div>
              <div class="flex space-x-3">
                <button id="next-step-btn" class="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                  Continuer →
                </button>
                <button id="cancel-card-btn" class="flex-1 bg-gradient-to-r from-beige-500 to-beige-600 hover:from-beige-600 hover:to-beige-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        `

        const nameInput = modal.querySelector('#player-name-input') as HTMLInputElement
        nameInput?.focus()

        const goToImage = () => {
          if (!validateName()) return
          nameInput?.blur()
          step = 2
          renderStep()
        }

        modal.querySelector('#next-step-btn')?.addEventListener('click', goToImage)
        modal.querySelector('#cancel-card-btn')?.addEventListener('click', closeModal)
        nameInput?.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') goToImage()
        })
        return
      }

      modal.className = 'fixed inset-0 bg-black/95 z-50 flex flex-col'

      if (step === 2) {
        modal.innerHTML = `
          ${imageBlock}
          <div class="flex-shrink-0 bg-beige-200 border-t border-beige-400 p-4 space-y-3">
            ${newRoundBanner}
            <p class="text-beige-600 text-xs text-center">${stepLabel(2)}</p>
            <p class="text-beige-800 text-sm text-center font-semibold">Mémorisez bien votre image !</p>
            <button id="next-step-btn" class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
              J'ai mémorisé →
            </button>
          </div>
        `

        attachImageLogs()
        modal.querySelector('#next-step-btn')?.addEventListener('click', () => {
          step = 3
          renderStep()
        })
        return
      }

      modal.innerHTML = `
        ${imageBlock}
        <div class="flex-shrink-0 bg-beige-200 border-t border-beige-400 p-4 space-y-3">
          ${newRoundBanner}
          <p class="text-beige-600 text-xs text-center">${stepLabel(3)}</p>
          <p class="text-beige-800 text-sm text-center">
            Prêt à valider votre carte, <strong class="text-beige-900">${savedPlayerName}</strong> ?
          </p>
          <div class="flex space-x-3">
            <button id="confirm-card-btn" class="flex-1 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
              ✅ ${skipNameStep ? 'J\'ai vu mon rôle' : 'Valider'}
            </button>
            <button id="cancel-card-btn" class="flex-1 bg-gradient-to-r from-beige-500 to-beige-600 hover:from-beige-600 hover:to-beige-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
              ❌ Annuler
            </button>
          </div>
        </div>
      `

      attachImageLogs()
      modal.querySelector('#confirm-card-btn')?.addEventListener('click', confirmCard)
      modal.querySelector('#cancel-card-btn')?.addEventListener('click', closeModal)
    }

    renderStep()
  }

  private attachCardConfigListeners(
    modal: HTMLElement,
    cardIndex: number,
    state: any,
    skipNameStep: boolean,
    closeModal: () => void
  ): void {
    const nameInput = modal.querySelector('#player-name-input') as HTMLInputElement
    if (!skipNameStep && nameInput) {
      nameInput.focus()
    }

    const handleConfirm = () => {
      const playerName = skipNameStep ? (nameInput?.value.trim() || state.players[cardIndex].name) : nameInput.value.trim()

      if (!playerName) {
        alert('Veuillez saisir votre prénom !')
        return
      }

      if (!skipNameStep) {
        const existingNames = state.players
          .filter((p: any, i: number) => i !== cardIndex && p.cardConfigured)
          .map((p: any) => p.name.toLowerCase())

        if (existingNames.includes(playerName.toLowerCase())) {
          alert('Ce prénom est déjà utilisé !')
          return
        }
      }

      this.dispatchGameAction({
        type: 'CONFIGURE_CARD',
        data: { cardIndex, playerName }
      })
      closeModal()
    }

    modal.querySelector('#confirm-card-btn')?.addEventListener('click', handleConfirm)
    modal.querySelector('#cancel-card-btn')?.addEventListener('click', closeModal)
    nameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleConfirm()
    })
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
      <div class="bg-gradient-to-br from-beige-200 to-beige-300 rounded-2xl shadow-2xl border-2 border-error-500/30 max-w-sm w-full mx-4 animate-scale-in">
        <!-- Header -->
        <div class="bg-gradient-to-r from-error-600 to-error-700 text-white p-6 rounded-t-2xl text-center">
          <div class="text-4xl mb-3">⚠️</div>
          <h3 class="text-xl font-bold">Confirmation d'élimination</h3>
        </div>
        
        <!-- Content -->
        <div class="p-6 text-center">
          <p class="text-beige-800 mb-4 leading-relaxed">
            Voulez-vous vraiment éliminer
          </p>
          <div class="bg-beige-100 rounded-lg p-3 mb-4 border border-beige-400">
            <span class="text-beige-900 font-bold text-lg">${playerName}</span>
          </div>
          <p class="text-warning-700 text-sm font-medium">
            ⚠️ Cette action révélera son rôle à tout le monde !
          </p>
        </div>
        
        <!-- Actions -->
        <div class="p-6 pt-0">
          <div class="grid grid-cols-2 gap-3">
            <button id="cancel-elimination-btn" class="bg-beige-600 hover:bg-beige-500 text-white font-bold py-4 px-4 rounded-xl transition-colors touch-manipulation">
              Annuler
            </button>
            <button id="confirm-elimination-btn" class="bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 text-white font-bold py-4 px-4 rounded-xl transition-all transform hover:scale-105 touch-manipulation">
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
  
  private getRoleImageUrl(role: MisterWhiteRole): string {
    switch (role) {
      case 'civil': return '/Expert.png'
      case 'impostor': return '/Novice.png'
      case 'ghost-frame': return '/Fantome.png'
    }
  }
  
  private getRoleContent(role: MisterWhiteRole, state: any): { display: string, description: string } {
    return {
      display: `
        <div class="mb-4">
          <img src="/Fantome.png" alt="Fantôme" class="w-32 h-32 object-contain mx-auto rounded-xl border-2 border-beige-300" />
        </div>
      `,
      description: `
        <div class="text-beige-800 text-sm">Vous ne voyez rien - soyez malin !</div>
      `
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
      } else {
        pointsExplanation = isWinner ? 'pts (gagnant)' : 'pts (0 si défaite)'
      }
      
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'
      
      return `
        <div class="flex items-center justify-between p-3 bg-beige-200 rounded-lg border border-beige-400">
          <div class="flex items-center">
            <span class="text-2xl mr-3">${medal}</span>
            <div>
              <div class="font-semibold text-beige-900">${player.name}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xl font-bold text-beige-900">${player.score || 0}</div>
            <div class="text-xs text-beige-600">${pointsExplanation}</div>
          </div>
        </div>
      `
    }).join('')
  }
  
  private renderRoundImagesRecap(state: MisterWhiteGameState): string {
    const images = state.gameData.currentImages
    if (!images?.civil || !images?.impostor) return ''

    return `
      <div class="bg-beige-200/80 backdrop-blur-sm rounded-2xl p-6 border border-beige-400 mb-8 text-left">
        <h3 class="text-xl font-bold text-beige-900 mb-2 text-center">🖼️ Récap des images</h3>
        <p class="text-beige-700 text-sm mb-5 text-center">
          Les deux photos de la manche — chaque équipe peut enfin voir celle de l'autre.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="bg-beige-100 rounded-xl p-3 border border-beige-300">
            <div class="flex items-center justify-center gap-2 mb-3">
              <img src="/Expert.png" alt="Expert" class="w-8 h-8 object-contain rounded" />
              <span class="font-semibold text-beige-900">Image Experts</span>
            </div>
            <img
              src="${images.civil}"
              alt="Image Experts"
              class="w-full max-h-64 object-contain rounded-lg mx-auto bg-black/5"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
            >
            <div class="hidden flex-col items-center justify-center min-h-[160px] rounded-lg bg-beige-300/50 text-beige-600 text-sm">
              <span class="text-3xl mb-2">🖼️</span>
              <span>Image non disponible</span>
            </div>
          </div>
          <div class="bg-beige-100 rounded-xl p-3 border border-beige-300">
            <div class="flex items-center justify-center gap-2 mb-3">
              <img src="/Novice.png" alt="Novice" class="w-8 h-8 object-contain rounded" />
              <span class="font-semibold text-beige-900">Image Novices</span>
            </div>
            <img
              src="${images.impostor}"
              alt="Image Novices"
              class="w-full max-h-64 object-contain rounded-lg mx-auto bg-black/5"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
            >
            <div class="hidden flex-col items-center justify-center min-h-[160px] rounded-lg bg-beige-300/50 text-beige-600 text-sm">
              <span class="text-3xl mb-2">🖼️</span>
              <span>Image non disponible</span>
            </div>
          </div>
        </div>
      </div>
    `
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
        return { emoji: '🎉', text: 'Les Experts ont gagné !' }
      case 'impostors':
        return { emoji: '🎭', text: 'Les Novices ont gagné !' }
      case 'ghost-frame':
        return { emoji: '👻', text: 'Le Fantôme a gagné !' }
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
          dark: '#5c4d42',
          light: '#fdfbf7'
        },
        errorCorrectionLevel: 'M'
      })
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error)
    }
  }
}
