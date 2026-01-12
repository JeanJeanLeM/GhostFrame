/**
 * Gestion centralisée des assets
 * 
 * Ce fichier centralise l'importation et l'export de tous les assets
 * pour faciliter leur utilisation dans l'application.
 */

// Images
// export { default as logo } from './images/logo.png'
// export { default as gameIcon } from './images/game-icon.svg'

// Sons
// export { default as clickSound } from './sounds/click.mp3'
// export { default as winSound } from './sounds/win.wav'

// Icônes
// export { default as homeIcon } from './icons/home.svg'
// export { default as settingsIcon } from './icons/settings.svg'

/**
 * Utilitaires pour les assets
 */

/**
 * Charge une image de manière asynchrone
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Précharge plusieurs images
 */
export async function preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(sources.map(loadImage))
}

/**
 * Joue un son (avec gestion d'erreur)
 */
export function playSound(src: string, volume: number = 1): void {
  try {
    const audio = new Audio(src)
    audio.volume = Math.max(0, Math.min(1, volume))
    audio.play().catch(error => {
      console.warn('Impossible de jouer le son:', error)
    })
  } catch (error) {
    console.warn('Erreur lors de la lecture du son:', error)
  }
}

/**
 * Crée un URL d'asset basé sur l'environnement
 */
export function getAssetUrl(path: string): string {
  // En développement, Vite gère automatiquement les assets
  // En production, les assets sont dans le dossier dist
  return new URL(path, import.meta.url).href
}
