import { Route, RouteParams } from '@/types'

export class Router {
  private currentRoute: Route = 'home'
  private routeParams: RouteParams = {}
  private routeListeners: ((route: Route, params: RouteParams) => void)[] = []
  private appContainer: HTMLElement | null = null

  constructor() {
    this.appContainer = document.getElementById('app')
    this.setupEventListeners()
  }

  /**
   * Configure les écouteurs d'événements pour la navigation
   */
  private setupEventListeners(): void {
    // Écouter les changements d'URL
    window.addEventListener('popstate', () => {
      this.handleRouteChange()
    })

    // Intercepter les clics sur les liens internes
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const link = target.closest('a[data-route]')
      
      if (link) {
        event.preventDefault()
        const route = link.getAttribute('data-route') as Route
        const gameId = link.getAttribute('data-game-id')
        
        this.navigate(route, gameId ? { gameId } : {})
      }
    })
  }

  /**
   * Démarre le routeur et analyse l'URL actuelle
   */
  start(): void {
    this.handleRouteChange()
  }

  /**
   * Navigue vers une nouvelle route
   */
  navigate(route: Route, params: RouteParams = {}): void {
    this.currentRoute = route
    this.routeParams = params

    // Construire l'URL
    let url = '/'
    switch (route) {
      case 'lobby':
        if (params.gameId) {
          url = `/lobby/${params.gameId}`
        }
        break
      case 'game':
        if (params.gameId) {
          url = `/game/${params.gameId}`
        }
        break
      case 'results':
        if (params.gameId) {
          url = `/results/${params.gameId}`
        }
        break
      case 'home':
      default:
        url = '/'
        break
    }

    // Mettre à jour l'URL sans recharger la page
    window.history.pushState({ route, params }, '', url)

    // Notifier les listeners
    this.notifyRouteChange()
  }

  /**
   * Gère les changements de route (URL)
   */
  private handleRouteChange(): void {
    const path = window.location.pathname
    const segments = path.split('/').filter(segment => segment.length > 0)

    let route: Route = 'home'
    let params: RouteParams = {}

    // Parser l'URL
    if (segments.length === 0) {
      route = 'home'
    } else if (segments[0] === 'lobby' && segments[1]) {
      route = 'lobby'
      params.gameId = segments[1]
    } else if (segments[0] === 'game' && segments[1]) {
      route = 'game'
      params.gameId = segments[1]
    } else if (segments[0] === 'results' && segments[1]) {
      route = 'results'
      params.gameId = segments[1]
    }

    this.currentRoute = route
    this.routeParams = params

    this.notifyRouteChange()
  }

  /**
   * Notifie tous les listeners du changement de route
   */
  private notifyRouteChange(): void {
    this.routeListeners.forEach(listener => {
      listener(this.currentRoute, this.routeParams)
    })
  }

  /**
   * Ajoute un listener pour les changements de route
   */
  onRouteChange(callback: (route: Route, params: RouteParams) => void): () => void {
    this.routeListeners.push(callback)
    
    // Appeler immédiatement avec la route actuelle
    callback(this.currentRoute, this.routeParams)
    
    // Retourner une fonction de désabonnement
    return () => {
      const index = this.routeListeners.indexOf(callback)
      if (index > -1) {
        this.routeListeners.splice(index, 1)
      }
    }
  }

  /**
   * Obtient la route actuelle
   */
  getCurrentRoute(): Route {
    return this.currentRoute
  }

  /**
   * Obtient les paramètres de la route actuelle
   */
  getRouteParams(): RouteParams {
    return this.routeParams
  }

  /**
   * Retourne à la page précédente
   */
  goBack(): void {
    window.history.back()
  }

  /**
   * Remplace la route actuelle (sans ajouter à l'historique)
   */
  replace(route: Route, params: RouteParams = {}): void {
    this.currentRoute = route
    this.routeParams = params

    let url = '/'
    switch (route) {
      case 'lobby':
        if (params.gameId) {
          url = `/lobby/${params.gameId}`
        }
        break
      case 'game':
        if (params.gameId) {
          url = `/game/${params.gameId}`
        }
        break
      case 'results':
        if (params.gameId) {
          url = `/results/${params.gameId}`
        }
        break
      case 'home':
      default:
        url = '/'
        break
    }

    window.history.replaceState({ route, params }, '', url)
    this.notifyRouteChange()
  }

  /**
   * Génère une URL pour une route donnée
   */
  generateUrl(route: Route, params: RouteParams = {}): string {
    switch (route) {
      case 'lobby':
        return params.gameId ? `/lobby/${params.gameId}` : '/lobby'
      case 'game':
        return params.gameId ? `/game/${params.gameId}` : '/game'
      case 'results':
        return params.gameId ? `/results/${params.gameId}` : '/results'
      case 'home':
      default:
        return '/'
    }
  }

  /**
   * Crée un lien de navigation
   */
  createLink(route: Route, params: RouteParams = {}, text: string, className: string = ''): HTMLAnchorElement {
    const link = document.createElement('a')
    link.href = this.generateUrl(route, params)
    link.textContent = text
    link.className = className
    link.setAttribute('data-route', route)
    
    if (params.gameId) {
      link.setAttribute('data-game-id', params.gameId)
    }

    return link
  }
}
