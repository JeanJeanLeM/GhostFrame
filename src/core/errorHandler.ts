import { AppError } from '@/types'

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorContainer: HTMLElement | null = null

  static initialize(): void {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
      ErrorHandler.instance.setupErrorContainer()
      ErrorHandler.instance.setupGlobalErrorHandlers()
    }
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.initialize()
    }
    return ErrorHandler.instance
  }

  private setupErrorContainer(): void {
    // Créer le conteneur pour les notifications d'erreur
    this.errorContainer = document.createElement('div')
    this.errorContainer.id = 'error-notifications'
    this.errorContainer.className = 'fixed top-4 right-4 z-50 space-y-2'
    document.body.appendChild(this.errorContainer)
  }

  private setupGlobalErrorHandlers(): void {
    // Gestionnaire d'erreurs JavaScript globales
    window.addEventListener('error', (event) => {
      console.error('Erreur JavaScript globale:', event.error)
      ErrorHandler.handleError(event.error, 'Erreur inattendue')
    })

    // Gestionnaire de promesses rejetées non gérées
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Promesse rejetée non gérée:', event.reason)
      ErrorHandler.handleError(event.reason, 'Erreur de connexion')
    })
  }

  /**
   * Gère une erreur et affiche une notification
   */
  static handleError(error: Error | AppError | any, context?: string): void {
    const instance = ErrorHandler.getInstance()
    instance.processError(error, context)
  }

  private processError(error: Error | AppError | any, context?: string): void {
    let message: string
    let code: string = 'UNKNOWN_ERROR'

    // Déterminer le message d'erreur
    if (this.isAppError(error)) {
      message = error.message
      code = error.code
    } else if (error instanceof Error) {
      message = this.getErrorMessage(error, context)
      code = this.getErrorCode(error)
    } else if (typeof error === 'string') {
      message = error
    } else {
      message = context || 'Une erreur inattendue s\'est produite'
    }

    // Logger l'erreur
    console.error(`[${code}] ${message}`, error)

    // Afficher la notification
    this.showErrorNotification(message, code)
  }

  private isAppError(error: any): error is AppError {
    return error && typeof error.code === 'string' && typeof error.message === 'string'
  }

  private getErrorMessage(error: Error, context?: string): string {
    // Messages d'erreur spécifiques pour Firebase
    if (error.message.includes('auth/')) {
      return this.getFirebaseAuthErrorMessage(error.message)
    }
    
    if (error.message.includes('firestore/')) {
      return this.getFirestoreErrorMessage(error.message)
    }

    // Messages d'erreur réseau
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Problème de connexion réseau. Vérifiez votre connexion internet.'
    }

    // Message par défaut avec contexte
    return context ? `${context}: ${error.message}` : error.message
  }

  private getErrorCode(error: Error): string {
    if (error.message.includes('auth/')) {
      return 'AUTH_ERROR'
    }
    if (error.message.includes('firestore/')) {
      return 'FIRESTORE_ERROR'
    }
    if (error.message.includes('network')) {
      return 'NETWORK_ERROR'
    }
    return 'UNKNOWN_ERROR'
  }

  private getFirebaseAuthErrorMessage(errorMessage: string): string {
    if (errorMessage.includes('auth/user-not-found')) {
      return 'Utilisateur non trouvé'
    }
    if (errorMessage.includes('auth/wrong-password')) {
      return 'Mot de passe incorrect'
    }
    if (errorMessage.includes('auth/email-already-in-use')) {
      return 'Cette adresse email est déjà utilisée'
    }
    if (errorMessage.includes('auth/weak-password')) {
      return 'Le mot de passe doit contenir au moins 6 caractères'
    }
    if (errorMessage.includes('auth/invalid-email')) {
      return 'Adresse email invalide'
    }
    if (errorMessage.includes('auth/network-request-failed')) {
      return 'Problème de connexion. Vérifiez votre réseau.'
    }
    return 'Erreur d\'authentification'
  }

  private getFirestoreErrorMessage(errorMessage: string): string {
    if (errorMessage.includes('permission-denied')) {
      return 'Vous n\'avez pas les permissions nécessaires'
    }
    if (errorMessage.includes('not-found')) {
      return 'Données non trouvées'
    }
    if (errorMessage.includes('already-exists')) {
      return 'Ces données existent déjà'
    }
    if (errorMessage.includes('unavailable')) {
      return 'Service temporairement indisponible'
    }
    return 'Erreur de base de données'
  }

  private showErrorNotification(message: string, code: string): void {
    if (!this.errorContainer) return

    // Créer l'élément de notification
    const notification = document.createElement('div')
    notification.className = `
      bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-lg shadow-lg
      transform transition-all duration-300 translate-x-full opacity-0
      max-w-sm
    `
    
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-error-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">${message}</p>
          ${code !== 'UNKNOWN_ERROR' ? `<p class="text-xs text-error-600 mt-1">Code: ${code}</p>` : ''}
        </div>
        <div class="ml-4 flex-shrink-0">
          <button class="text-error-400 hover:text-error-600 focus:outline-none" onclick="this.parentElement.parentElement.parentElement.remove()">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    `

    this.errorContainer.appendChild(notification)

    // Animation d'entrée
    setTimeout(() => {
      notification.classList.remove('translate-x-full', 'opacity-0')
      notification.classList.add('translate-x-0', 'opacity-100')
    }, 10)

    // Auto-suppression après 5 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full', 'opacity-0')
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove()
          }
        }, 300)
      }
    }, 5000)
  }

  /**
   * Affiche une notification de succès
   */
  static showSuccess(message: string): void {
    const instance = ErrorHandler.getInstance()
    instance.showSuccessNotification(message)
  }

  private showSuccessNotification(message: string): void {
    if (!this.errorContainer) return

    const notification = document.createElement('div')
    notification.className = `
      bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg shadow-lg
      transform transition-all duration-300 translate-x-full opacity-0
      max-w-sm
    `
    
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-success-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button class="text-success-400 hover:text-success-600 focus:outline-none" onclick="this.parentElement.parentElement.parentElement.remove()">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    `

    this.errorContainer.appendChild(notification)

    setTimeout(() => {
      notification.classList.remove('translate-x-full', 'opacity-0')
      notification.classList.add('translate-x-0', 'opacity-100')
    }, 10)

    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full', 'opacity-0')
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove()
          }
        }, 300)
      }
    }, 3000)
  }
}
