import './style.css'
import { ErrorHandler } from '@core/errorHandler'
import { App } from '@components/App'

async function startApp() {
  try {
    console.log('🎮 Initialisation de Ghost Frame...')
    ErrorHandler.initialize()
    new App()
    console.log('✅ Application initialisée avec succès')
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    ErrorHandler.handleError(error as Error, 'Erreur d\'initialisation')

    const appContainer = document.getElementById('app')
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
          <div class="text-center max-w-md mx-auto p-6">
            <div class="text-6xl text-error-500 mb-4">⚠️</div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Erreur d'initialisation</h2>
            <p class="text-gray-600 mb-6">
              L'application n'a pas pu démarrer. Rechargez la page.
            </p>
            <button onclick="window.location.reload()" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Réessayer
            </button>
          </div>
        </div>
      `
    }
  }
}

startApp()
