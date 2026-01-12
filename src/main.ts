import './style.css'
import { initializeFirebase, validateFirebaseConfig } from '@core/firebase'
import { ErrorHandler } from '@core/errorHandler'
import { App } from '@components/App'

// Start the application
async function startApp() {
  try {
    console.log('🎮 Initialisation de Party Games Template...')
    
    // Vérifier la configuration Firebase (optionnelle pour le mode single-device)
    const hasFirebaseConfig = validateFirebaseConfig()
    
    if (hasFirebaseConfig) {
      // Initialize Firebase
      initializeFirebase()
      console.log('🔥 Mode multijoueur activé')
    } else {
      console.log('🎮 Mode single-device activé (Firebase désactivé)')
    }

    // Initialize global error handler
    ErrorHandler.initialize()
    
    // Initialize the main app
    new App()
    
    console.log('✅ Application initialisée avec succès')
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    ErrorHandler.handleError(error as Error, 'Erreur d\'initialisation')
    
    // Afficher un message d'erreur à l'utilisateur
    const appContainer = document.getElementById('app')
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
          <div class="text-center max-w-md mx-auto p-6">
            <div class="text-6xl text-error-500 mb-4">⚠️</div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Erreur d'initialisation</h2>
            <p class="text-gray-600 mb-6">
              L'application n'a pas pu démarrer. Vérifiez la configuration Firebase.
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
