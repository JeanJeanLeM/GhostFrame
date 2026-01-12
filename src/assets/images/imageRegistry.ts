import { ImagePair } from '@games/mister-white/game.state'

/**
 * Registre des images pour chaque thème
 * Les chemins seront automatiquement gérés par Vite
 */
export const IMAGE_REGISTRY = {
  libre: [
    {
      id: 'paire-01',
      civil: '/images/themes/libre/paire-01/civil.jpg',
      impostor: '/images/themes/libre/paire-01/impostor.jpeg'
    },
    {
      id: 'paire-02', 
      civil: '/images/themes/libre/paire-02/civil.jpg',
      impostor: '/images/themes/libre/paire-02/imposteur.jpg'
    },
    {
      id: 'paire-03',
      civil: '/images/themes/libre/paire-03/civil.jpg', 
      impostor: '/images/themes/libre/paire-03/imposteur.jpg'
    }
  ] as ImagePair[],
  
  animaux: [
    {
      id: 'paire-01',
      civil: '/images/themes/animaux/paire-01/civil.jpg',
      impostor: '/images/themes/animaux/paire-01/impostor.jpg'
    },
    {
      id: 'paire-02',
      civil: '/images/themes/animaux/paire-02/civil.jpg',
      impostor: '/images/themes/animaux/paire-02/impostor.jpg'
    }
  ] as ImagePair[],
  
  // Autres thèmes à développer quand vous fournirez les images
  nourriture: [] as ImagePair[],
  metiers: [] as ImagePair[],
  objets: [] as ImagePair[],
  emotions: [] as ImagePair[]
}

/**
 * Vérifie si des images sont disponibles pour un thème
 */
export function hasImagesForTheme(theme: string): boolean {
  const themeImages = IMAGE_REGISTRY[theme as keyof typeof IMAGE_REGISTRY]
  return themeImages && themeImages.length > 0
}

/**
 * Récupère les images disponibles pour un thème
 */
export function getImagesForTheme(theme: string): ImagePair[] {
  return IMAGE_REGISTRY[theme as keyof typeof IMAGE_REGISTRY] || []
}

/**
 * Vérifie si une image existe (utilitaire pour le développement)
 */
export function validateImagePath(path: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = path
  })
}





