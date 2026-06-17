import { ImagePair } from '@games/mister-white/game.state'

const BASE_IMAGES = '/images/themes'
/** Manifeste v2 (dossier public/images-v2/ avec paire-01, paire-02, …) */
const GLOBAL_PAIRS_V2_MANIFEST = '/images-v2/pairs.json'

export interface PairManifestEntry {
  id: string
  images: string[]
}

export interface PairsManifest {
  pairs: PairManifestEntry[]
}

/**
 * URL du manifeste des paires pour un thème.
 * Pour "libre-v2", utilise le manifeste global public/images-v2/pairs.json.
 */
export function getPairsManifestUrl(theme: string): string {
  if (theme === 'libre-v2') return GLOBAL_PAIRS_V2_MANIFEST
  return `${BASE_IMAGES}/${theme}/pairs.json`
}

/**
 * Préfixe pour les URLs d'images d'une paire.
 */
function getBasePathForPair(theme: string, pairId: string): string {
  if (theme === 'libre-v2') return `/images-v2/${pairId}`
  return `${BASE_IMAGES}/${theme}/${pairId}`
}

/**
 * Charge les paires disponibles pour un thème (dossiers avec exactement 2 images).
 * Retourne un tableau vide si le manifeste n'existe pas ou est invalide.
 */
export async function fetchPairsForTheme(theme: string): Promise<PairManifestEntry[]> {
  const url = getPairsManifestUrl(theme)
  console.log('[Images] Chargement manifeste:', url)
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn('[Images] Manifeste non trouvé ou erreur:', res.status, res.statusText, url)
      return []
    }
    const text = await res.text()
    if (text.trimStart().startsWith('<')) {
      console.warn('[Images] Le serveur a renvoyé du HTML au lieu de JSON (fichier absent?). URL:', url, '— Vérifier que le fichier existe dans public/images-v2/ ou public/images/themes/' + theme + '/')
      return []
    }
    const data = JSON.parse(text) as PairsManifest
    const pairs = (data?.pairs ?? []).filter((p) => Array.isArray(p.images) && p.images.length === 2)
    console.log('[Images] Manifeste chargé:', pairs.length, 'paire(s) valide(s) pour thème', theme, pairs)
    return pairs
  } catch (e) {
    console.warn('[Images] Erreur chargement manifeste:', url, e)
    return []
  }
}

/**
 * Vérifie si un thème a au moins une paire d'images disponible.
 */
export async function hasImagesForTheme(theme: string): Promise<boolean> {
  const pairs = await fetchPairsForTheme(theme)
  return pairs.length > 0
}

/**
 * Choisit une paire aléatoire pour le thème, puis assigne aléatoirement
 * quelle image va aux Experts (civil) et laquelle aux Novices (impostor).
 * Les Fantômes ont toujours un écran vide (géré dans l'UI).
 */
export async function chooseRandomImagePair(theme: string): Promise<ImagePair | null> {
  const pairs = await fetchPairsForTheme(theme)
  if (pairs.length === 0) {
    console.warn('[Images] Aucune paire pour le thème', theme, theme === 'libre-v2' ? '— vérifier public/images-v2/pairs.json et public/images-v2/paire-XX/' : '— vérifier public/images/themes/' + theme + '/pairs.json')
    return null
  }

  const pair = pairs[Math.floor(Math.random() * pairs.length)]
  const basePath = getBasePathForPair(theme, pair.id)

  const [imgA, imgB] = pair.images
  const swap = Math.random() < 0.5
  const civilPath = swap ? `${basePath}/${imgB}` : `${basePath}/${imgA}`
  const impostorPath = swap ? `${basePath}/${imgA}` : `${basePath}/${imgB}`

  const result = {
    id: pair.id,
    civil: civilPath,
    impostor: impostorPath
  }
  console.log('[Images] Paire choisie:', pair.id, '| URLs Expert/Novice:', civilPath, impostorPath)
  return result
}

/**
 * Liste des thèmes (dossiers sous /images/themes/) à scanner pour les paires.
 */
export const IMAGE_THEMES = ['libre-v2', 'animaux', 'nourriture', 'metiers', 'objets', 'emotions'] as const

export interface PairOption {
  theme: string
  id: string
  folder: string
  images: string[]
  label: string
}

/**
 * Charge toutes les paires disponibles depuis tous les thèmes (dossier images).
 * Retourne une liste plate pour affichage dans un sélecteur.
 */
export async function fetchAllPairs(): Promise<PairOption[]> {
  const result: PairOption[] = []
  for (const theme of IMAGE_THEMES) {
    const pairs = await fetchPairsForTheme(theme)
    for (const pair of pairs) {
      result.push({
        theme,
        id: pair.id,
        folder: `${theme}/${pair.id}`,
        images: pair.images,
        label: `${theme} – ${pair.id}`
      })
    }
  }
  console.log('[Images] Paires disponibles:', result.length, result)
  return result
}

/**
 * Mélange un tableau (Fisher-Yates).
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Retourne autant de paires d'images que de manches : la première est la paire sélectionnée,
 * les suivantes sont d'autres paires distinctes (répétées si besoin).
 * Chaque manche aura ainsi des images différentes.
 */
export async function getImagePairsForRounds(
  theme: string,
  selectedPairId: string,
  rounds: number
): Promise<ImagePair[]> {
  const pairs = await fetchPairsForTheme(theme)
  if (pairs.length === 0) return []

  const selected = await getImagePairById(theme, selectedPairId)
  if (!selected) return []

  if (rounds <= 1) return [selected]

  const otherIds = pairs.filter((p) => p.id !== selectedPairId).map((p) => p.id)
  const shuffled = shuffle(otherIds)
  const idsForRounds: string[] = [selectedPairId]
  for (let i = 0; i < rounds - 1; i++) {
    idsForRounds.push(shuffled[i % shuffled.length] ?? selectedPairId)
  }

  const result: ImagePair[] = [selected]
  for (let i = 1; i < idsForRounds.length; i++) {
    const p = await getImagePairById(theme, idsForRounds[i])
    if (p) result.push(p)
    else result.push(selected)
  }
  console.log('[Images] Paires pour', rounds, 'manche(s):', result.map((r) => r.id))
  return result
}

/**
 * Retourne la paire d'images pour un thème et un id de paire donnés.
 * Utilisé quand l'utilisateur choisit une paire dans le sélecteur.
 */
export async function getImagePairById(theme: string, pairId: string): Promise<ImagePair | null> {
  const pairs = await fetchPairsForTheme(theme)
  const pair = pairs.find((p) => p.id === pairId)
  if (!pair) {
    console.warn('[Images] Paire introuvable:', theme, pairId)
    return null
  }
  const basePath = getBasePathForPair(theme, pair.id)
  const [imgA, imgB] = pair.images
  const swap = Math.random() < 0.5
  const civilPath = swap ? `${basePath}/${imgB}` : `${basePath}/${imgA}`
  const impostorPath = swap ? `${basePath}/${imgA}` : `${basePath}/${imgB}`
  return {
    id: pair.id,
    civil: civilPath,
    impostor: impostorPath
  }
}

/**
 * Vérifie si une image existe (utilitaire pour le développement)
 */
export function validateImagePath(path: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = path
  })
}
