import { GameConfig } from '@/types'
import { gameRegistry } from '@games/gameRegistry'

export class GameSelector {
  private container: HTMLElement
  private onGameSelected: (gameId: string) => void

  constructor(container: HTMLElement, onGameSelected: (gameId: string) => void) {
    this.container = container
    this.onGameSelected = onGameSelected
    this.render()
  }

  private render(): void {
    const games = gameRegistry.getAllGameConfigs()
    
    this.container.innerHTML = `
      <div class="game-selector">
        <h2 class="text-2xl font-bold text-beige-900 mb-6">Choisissez votre jeu</h2>
        
        <!-- Filtres -->
        <div class="filters mb-6 p-4 bg-beige-100 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-beige-700 mb-1">Joueurs</label>
              <select id="players-filter" class="input w-full">
                <option value="">Tous</option>
                <option value="2">2 joueurs</option>
                <option value="3">3 joueurs</option>
                <option value="4">4 joueurs</option>
                <option value="5+">5+ joueurs</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-beige-700 mb-1">Difficulté</label>
              <select id="difficulty-filter" class="input w-full">
                <option value="">Toutes</option>
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-beige-700 mb-1">Durée max</label>
              <select id="duration-filter" class="input w-full">
                <option value="">Toutes</option>
                <option value="10">10 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-beige-700 mb-1">Catégorie</label>
              <select id="category-filter" class="input w-full">
                <option value="">Toutes</option>
                <option value="party">Soirée</option>
                <option value="numbers">Nombres</option>
                <option value="guessing">Devinettes</option>
                <option value="template">Template</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Liste des jeux -->
        <div id="games-grid" class="game-selector grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${games.map(game => this.renderGameCard(game)).join('')}
        </div>
        
        <!-- Message si aucun jeu -->
        <div id="no-games-message" class="hidden text-center py-12">
          <div class="text-beige-500 text-6xl mb-4">🎮</div>
          <h3 class="text-lg font-medium text-beige-900 mb-2">Aucun jeu trouvé</h3>
          <p class="text-beige-600">Essayez de modifier vos filtres</p>
        </div>
      </div>
    `
    
    this.setupEventListeners()
    this.applyFilters()
  }

  private renderGameCard(game: GameConfig): string {
    const difficultyColors = {
      easy: 'bg-success-100 text-success-800',
      medium: 'bg-warning-100 text-warning-800',
      hard: 'bg-error-100 text-error-800'
    }

    const difficultyLabels = {
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile'
    }

    return `
      <div class="game-card card hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden" 
           data-game-id="${game.id}"
           data-min-players="${game.minPlayers}"
           data-max-players="${game.maxPlayers}"
           data-difficulty="${game.difficulty}"
           data-duration="${game.estimatedDuration}"
           data-categories="${game.category.join(',')}"
      >
        <!-- Gradient overlay for visual appeal -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-xl font-bold text-beige-900 leading-tight">${game.name}</h3>
          <span class="px-3 py-1.5 text-xs font-bold rounded-full ${difficultyColors[game.difficulty]} shadow-sm">
            ${difficultyLabels[game.difficulty]}
          </span>
        </div>
        
        <p class="text-beige-700 text-sm mb-6 leading-relaxed">${game.description}</p>
        
        <div class="space-y-3 text-sm text-beige-700 mb-6">
          <div class="flex items-center bg-beige-100 rounded-lg p-2">
            <span class="w-8 h-8 mr-3 text-lg flex items-center justify-center bg-primary-100 rounded-lg">👥</span>
            <span class="font-medium">${game.minPlayers}-${game.maxPlayers} joueurs</span>
          </div>
          
          <div class="flex items-center bg-beige-100 rounded-lg p-2">
            <span class="w-8 h-8 mr-3 text-lg flex items-center justify-center bg-success-100 rounded-lg">⏱️</span>
            <span class="font-medium">~${game.estimatedDuration} minutes</span>
          </div>
          
          <div class="flex items-center bg-beige-100 rounded-lg p-2">
            <span class="w-8 h-8 mr-3 text-lg flex items-center justify-center bg-primary-200 rounded-lg">🏷️</span>
            <span class="font-medium">${game.category.join(', ')}</span>
          </div>
        </div>
        
        <div class="mt-auto">
          <button class="btn-primary w-full select-game-btn !py-3 !text-base !font-bold uppercase tracking-wide">
            🎮 Choisir ce jeu
          </button>
        </div>
      </div>
    `
  }

  private setupEventListeners(): void {
    // Événements pour les filtres
    const filters = ['players-filter', 'difficulty-filter', 'duration-filter', 'category-filter']
    filters.forEach(filterId => {
      const filter = document.getElementById(filterId)
      if (filter) {
        filter.addEventListener('change', () => this.applyFilters())
      }
    })

    // Événements pour la sélection de jeu
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const gameCard = target.closest('.game-card') as HTMLElement
      
      if (gameCard && (target.classList.contains('select-game-btn') || gameCard === target)) {
        const gameId = gameCard.dataset.gameId
        if (gameId) {
          this.onGameSelected(gameId)
        }
      }
    })
  }

  private applyFilters(): void {
    const playersFilter = (document.getElementById('players-filter') as HTMLSelectElement)?.value
    const difficultyFilter = (document.getElementById('difficulty-filter') as HTMLSelectElement)?.value
    const durationFilter = (document.getElementById('duration-filter') as HTMLSelectElement)?.value
    const categoryFilter = (document.getElementById('category-filter') as HTMLSelectElement)?.value

    const gameCards = this.container.querySelectorAll('.game-card')
    let visibleCount = 0

    gameCards.forEach(card => {
      const cardElement = card as HTMLElement
      let isVisible = true

      // Filtre par nombre de joueurs
      if (playersFilter) {
        const minPlayers = parseInt(cardElement.dataset.minPlayers || '0')
        const maxPlayers = parseInt(cardElement.dataset.maxPlayers || '0')
        
        if (playersFilter === '5+') {
          if (maxPlayers < 5) isVisible = false
        } else {
          const targetPlayers = parseInt(playersFilter)
          if (targetPlayers < minPlayers || targetPlayers > maxPlayers) {
            isVisible = false
          }
        }
      }

      // Filtre par difficulté
      if (difficultyFilter && cardElement.dataset.difficulty !== difficultyFilter) {
        isVisible = false
      }

      // Filtre par durée
      if (durationFilter) {
        const duration = parseInt(cardElement.dataset.duration || '0')
        const maxDuration = parseInt(durationFilter)
        if (duration > maxDuration) {
          isVisible = false
        }
      }

      // Filtre par catégorie
      if (categoryFilter) {
        const categories = cardElement.dataset.categories || ''
        if (!categories.includes(categoryFilter)) {
          isVisible = false
        }
      }

      // Appliquer la visibilité
      if (isVisible) {
        cardElement.style.display = 'block'
        visibleCount++
      } else {
        cardElement.style.display = 'none'
      }
    })

    // Afficher/masquer le message "aucun jeu"
    const noGamesMessage = document.getElementById('no-games-message')
    if (noGamesMessage) {
      if (visibleCount === 0) {
        noGamesMessage.classList.remove('hidden')
      } else {
        noGamesMessage.classList.add('hidden')
      }
    }
  }

  /**
   * Met à jour la liste des jeux (utile si de nouveaux jeux sont ajoutés)
   */
  refresh(): void {
    this.render()
  }
}
