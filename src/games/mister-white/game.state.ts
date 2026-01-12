import { Player } from '@/types'

/**
 * Les rôles possibles dans Ghost Frame
 */
export type MisterWhiteRole = 'civil' | 'impostor' | 'ghost-frame'

/**
 * Les phases du jeu (nouveau flow adapté)
 */
export type MisterWhitePhase = 
  | 'loading'        // 1. Écran de chargement avec vidéo
  | 'rules'          // 2. Écran des règles du jeu
  | 'config'         // 3. Configuration (joueurs + paramètres)
  | 'setup'          // 4. Setup des cartes/noms + rôles en une fois
  | 'game'           // 5. Discussion + Vote
  | 'elimination'    // 6. Élimination + devinette Ghost Frame
  | 'scores'         // 7. Scores et résultats

/**
 * Structure pour les emojis du jeu
 */
export interface EmojiPair {
  civil: string
  impostor: string
}

/**
 * Structure pour les images du jeu
 */
export interface ImagePair {
  civil: string    // Chemin vers l'image civil
  impostor: string // Chemin vers l'image imposteur
  id: string       // Identifiant de la paire (ex: "paire-01")
}

/**
 * Mode de jeu : emoji ou image
 */
export type GameMode = 'emoji' | 'image'

/**
 * Joueur local pour le mode single-device
 */
export interface LocalPlayer {
  id: string
  name: string
  role?: MisterWhiteRole
  isEliminated?: boolean
  cardSeen?: boolean
  cardConfigured?: boolean  // Si la carte a été configurée (nom + rôle vu)
  score?: number
  hasGuessed?: boolean  // Pour Ghost Frame qui tente de deviner
}

/**
 * État du jeu Ghost Frame
 */
export interface MisterWhiteGameState {
  // Phase actuelle du jeu
  phase: MisterWhitePhase
  
  // Joueurs locaux
  players: LocalPlayer[]
  
  // Configuration de la partie
  config: {
    playerCount: number
    playerNames: string[]
    mode: GameMode          // Mode emoji ou image
    theme: string           // Thème choisi (Animaux, Nourriture, etc.)
    difficulty: 'easy' | 'medium' | 'hard'
    rounds: number          // Nombre de manches
    currentRound: number    // Manche actuelle
  }
  
  // Données de jeu
  gameData: {
    // Emojis choisis pour cette partie
    currentEmojis: EmojiPair | null
    // Images choisies pour cette partie
    currentImages: ImagePair | null
    
    // Premier joueur (celui qui commence la discussion)
    firstPlayer: string | null
    
    // Joueurs éliminés
    eliminatedPlayers: string[]
    
    // Historique des éliminations
    eliminationHistory: Array<{
      playerId: string
      playerName: string
      role: MisterWhiteRole
      timestamp: Date
    }>
    
    // Attribution des rôles par joueur
    roleAssignments: Record<string, MisterWhiteRole>
    
    // Cartes vues (pour suivre la progression)
    cardsSeen: Record<string, boolean>
    
    // Phase de devinette Ghost Frame
    guessPhase: {
      isActive: boolean
      eliminatedGhostFrame?: string  // ID du Ghost Frame éliminé
      guessWord?: string           // Mot deviné par Ghost Frame
      isCorrect?: boolean          // Si la devinette est correcte
      secretWord?: string          // Le vrai mot secret des civils
      needsValidation?: boolean    // Si la devinette attend validation manuelle
      validationVotes?: Record<string, 'accept' | 'reject'>  // Votes des joueurs
    }
    
    // État de la discussion/vote
    gamePhase: {
      discussionStarted: boolean
      votingStarted: boolean
      eliminationRevealed: boolean
    }
  }
  
  // Métadonnées
  startedAt?: Date
  finishedAt?: Date
  winner?: {
    type: 'civils' | 'impostors' | 'ghost-frame'
    survivors: string[]
  }
}

/**
 * Thèmes disponibles avec leurs paires d'emojis
 */
export const GAME_THEMES = {
  libre: [
    { civil: '🍆', impostor: '🥒' },
    { civil: '🍕', impostor: '🍔' },
    { civil: '🐶', impostor: '🐱' },
    { civil: '🌙', impostor: '⭐' },
    { civil: '🍎', impostor: '🍊' },
    { civil: '⚽', impostor: '🏀' },
    { civil: '🚗', impostor: '🚙' },
    { civil: '🎸', impostor: '🎹' },
    { civil: '🌲', impostor: '🌴' },
    { civil: '☕', impostor: '🍵' },
    { civil: '🦁', impostor: '🐯' },
    { civil: '🏔️', impostor: '🗻' }
  ],
  animaux: [
    { civil: '🐶', impostor: '🐱' },
    { civil: '🦁', impostor: '🐯' },
    { civil: '🐘', impostor: '🦏' },
    { civil: '🐧', impostor: '🦆' },
    { civil: '🦅', impostor: '🦉' },
    { civil: '🐝', impostor: '🐞' }
  ],
  nourriture: [
    { civil: '🍕', impostor: '🍔' },
    { civil: '🍎', impostor: '🍊' },
    { civil: '🥖', impostor: '🥨' },
    { civil: '☕', impostor: '🍵' },
    { civil: '🍰', impostor: '🧁' },
    { civil: '🌮', impostor: '🌯' }
  ],
  metiers: [
    { civil: '👨‍⚕️', impostor: '👨‍🔬' },
    { civil: '👨‍🏫', impostor: '👨‍💼' },
    { civil: '👨‍🚒', impostor: '👨‍✈️' },
    { civil: '👨‍🎨', impostor: '👨‍🎤' },
    { civil: '👨‍🍳', impostor: '👨‍🌾' },
    { civil: '👨‍💻', impostor: '👨‍🔧' }
  ],
  objets: [
    { civil: '📱', impostor: '💻' },
    { civil: '⚽', impostor: '🏀' },
    { civil: '🚗', impostor: '🚙' },
    { civil: '🎸', impostor: '🎹' },
    { civil: '📚', impostor: '📖' },
    { civil: '⌚', impostor: '🕰️' }
  ],
  emotions: [
    { civil: '😊', impostor: '😢' },
    { civil: '😍', impostor: '😡' },
    { civil: '😂', impostor: '😱' },
    { civil: '🤗', impostor: '🤔' },
    { civil: '😎', impostor: '🤓' },
    { civil: '🥳', impostor: '😴' }
  ]
}

/**
 * Emojis disponibles (compatibilité avec l'ancien code)
 */
export const EMOJI_PAIRS: EmojiPair[] = GAME_THEMES.libre

/**
 * Import du registre des images depuis assets
 */
import { IMAGE_REGISTRY } from '@assets/images/imageRegistry'

/**
 * Configuration des paires d'images par thème (utilise le registre)
 */
export const IMAGE_THEMES = IMAGE_REGISTRY

/**
 * Actions possibles dans le jeu (nouveau flow)
 */
export interface MisterWhiteAction {
  type: 
    | 'FINISH_LOADING'        // Terminer le chargement
    | 'START_FROM_RULES'      // Démarrer depuis les règles
    | 'SET_CONFIG'            // Définir la configuration
    | 'CONFIGURE_CARD'        // Configurer une carte (nom + voir rôle)
    | 'START_GAME'            // Démarrer le jeu (passer de setup à game)
    | 'START_VOTING'          // Démarrer le vote
    | 'ELIMINATE_PLAYER'      // Éliminer un joueur
    | 'SUBMIT_GUESS'          // Ghost Frame soumet sa devinette
    | 'ACCEPT_GUESS_COLLECTIVE' // Accepter collectivement la devinette (Ghost Frame gagne)
    | 'REJECT_GUESS_COLLECTIVE' // Refuser collectivement la devinette (survivants gagnent)
    | 'CONTINUE_GAME'         // Continuer le jeu après élimination
    | 'NEXT_ROUND'            // Passer à la manche suivante
    | 'NEW_GAME'              // Nouvelle partie
    | 'RESET_GAME'            // Reset complet
  data?: {
    // Configuration
    playerCount?: number
    mode?: GameMode
    theme?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    rounds?: number
    
    // Configuration de carte
    cardIndex?: number
    playerName?: string
    
    // Joueurs
    playerNames?: string[]
    playerId?: string
    
    // Devinette
    guessWord?: string
    secretWord?: string
  }
}

/**
 * Crée l'état initial du jeu
 */
export function createInitialGameState(): MisterWhiteGameState {
  return {
    phase: 'loading',  // Commence par l'écran de chargement
    players: [],
    config: {
      playerCount: 6,
      playerNames: [],
      mode: 'emoji',     // Mode par défaut
      theme: 'libre',
      difficulty: 'medium',
      rounds: 1,
      currentRound: 1
    },
    gameData: {
      currentEmojis: null,
      currentImages: null,
      firstPlayer: null,
      eliminatedPlayers: [],
      eliminationHistory: [],
      roleAssignments: {},
      cardsSeen: {},
      guessPhase: {
        isActive: false,
        needsValidation: false,
        validationVotes: {}
      },
      gamePhase: {
        discussionStarted: false,
        votingStarted: false,
        eliminationRevealed: false
      }
    }
  }
}

/**
 * Distribue les rôles selon le tableau d'équilibrage optimal
 * Toujours 1 Ghost Frame, nombre variable d'Undercover/Impostors
 */
export function distributeRoles(playerCount: number): MisterWhiteRole[] {
  // Tableau de répartition optimale selon le nombre de joueurs
  const roleDistribution: Record<number, { civils: number, impostors: number, ghostFrame: number }> = {
    3: { civils: 1, impostors: 1, ghostFrame: 1 },  // Minimum technique
    4: { civils: 2, impostors: 1, ghostFrame: 1 },  // Minimum technique
    5: { civils: 3, impostors: 1, ghostFrame: 1 },  // 2 cachés pour pimenter, majorité civils
    6: { civils: 4, impostors: 1, ghostFrame: 1 },  // Ratio ≈ 4 civils pour 2 cachés
    7: { civils: 5, impostors: 1, ghostFrame: 1 },  // Une seule cible cachée + Ghost Frame
    8: { civils: 5, impostors: 2, ghostFrame: 1 },  // 2 Undercover + 1 Ghost Frame = bon bluff stratégique
    9: { civils: 6, impostors: 2, ghostFrame: 1 },  // Toujours 3 rôles cachés max pour tension
    10: { civils: 7, impostors: 2, ghostFrame: 1 }, // Doublage civil pour garder majorité sûre
    11: { civils: 8, impostors: 2, ghostFrame: 1 }, // Rôles cachés stables sans dominer
    12: { civils: 8, impostors: 3, ghostFrame: 1 }, // 3 cachés ajoutent du chaos contrôlé
    13: { civils: 9, impostors: 3, ghostFrame: 1 }, // Majorité civils, plusieurs suspects
    14: { civils: 10, impostors: 3, ghostFrame: 1 }, // Ghost Frame dans le paquet ajoute incertitude
    15: { civils: 11, impostors: 3, ghostFrame: 1 }  // Toujours civils en forte majorité
  }
  
  // Récupérer la distribution pour ce nombre de joueurs
  const distribution = roleDistribution[playerCount]
  
  // Si le nombre de joueurs n'est pas dans le tableau, utiliser une formule de fallback
  if (!distribution) {
    const numImpostors = Math.max(1, Math.floor(playerCount / 4)) // ≈ 25% d'impostors
    const numGhostFrame = 1
    const numCivils = playerCount - numImpostors - numGhostFrame
    
    console.warn(`⚠️ Nombre de joueurs ${playerCount} non prévu dans le tableau, utilisation formule: ${numCivils} civils, ${numImpostors} impostors, ${numGhostFrame} ghost-frame`)
    
    const roles: MisterWhiteRole[] = []
    for (let i = 0; i < numCivils; i++) roles.push('civil')
    for (let i = 0; i < numImpostors; i++) roles.push('impostor')
    for (let i = 0; i < numGhostFrame; i++) roles.push('ghost-frame')
    
    return shuffleArray(roles)
  }
  
  // Créer le tableau des rôles selon la distribution optimale
  const roles: MisterWhiteRole[] = []
  
  // Ajouter les civils
  for (let i = 0; i < distribution.civils; i++) {
    roles.push('civil')
  }
  
  // Ajouter les impostors (Undercover)
  for (let i = 0; i < distribution.impostors; i++) {
    roles.push('impostor')
  }
  
  // Ajouter le Ghost Frame (toujours 1)
  for (let i = 0; i < distribution.ghostFrame; i++) {
    roles.push('ghost-frame')
  }
  
  console.log(`🎯 Distribution pour ${playerCount} joueurs: ${distribution.civils} civils, ${distribution.impostors} impostors, ${distribution.ghostFrame} ghost-frame`)
  
  // Mélanger aléatoirement
  return shuffleArray(roles)
}

/**
 * Mélange un tableau de façon aléatoire
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Choisit des emojis aléatoires selon le thème
 */
export function chooseRandomEmojis(theme: string = 'libre'): EmojiPair {
  const themeEmojis = GAME_THEMES[theme as keyof typeof GAME_THEMES] || GAME_THEMES.libre
  return themeEmojis[Math.floor(Math.random() * themeEmojis.length)]
}

/**
 * Choisit des images aléatoires selon le thème
 */
export function chooseRandomImages(theme: string = 'libre'): ImagePair | null {
  const themeImages = IMAGE_THEMES[theme as keyof typeof IMAGE_THEMES] || IMAGE_THEMES.libre
  
  if (!themeImages || themeImages.length === 0) {
    console.warn(`Aucune image disponible pour le thème: ${theme}`)
    return null
  }
  
  return themeImages[Math.floor(Math.random() * themeImages.length)]
}

/**
 * Génère un mot secret selon le thème (pour Ghost Frame)
 */
export function generateSecretWord(theme: string = 'libre'): string {
  const secretWords = {
    libre: ['Mystère', 'Secret', 'Énigme', 'Indice', 'Révélation'],
    animaux: ['Savane', 'Forêt', 'Océan', 'Ferme', 'Zoo'],
    nourriture: ['Restaurant', 'Cuisine', 'Recette', 'Ingrédient', 'Saveur'],
    metiers: ['Bureau', 'Travail', 'Profession', 'Compétence', 'Expertise'],
    objets: ['Technologie', 'Outil', 'Gadget', 'Équipement', 'Accessoire'],
    emotions: ['Sentiment', 'Humeur', 'Expression', 'Réaction', 'Émotion']
  }
  
  const words = secretWords[theme as keyof typeof secretWords] || secretWords.libre
  return words[Math.floor(Math.random() * words.length)]
}

/**
 * Valide une action de jeu
 */
export function validateGameAction(
  state: MisterWhiteGameState,
  action: MisterWhiteAction
): boolean {
  switch (action.type) {
    case 'FINISH_LOADING':
      return state.phase === 'loading'
      
    case 'START_FROM_RULES':
      return state.phase === 'rules'
      
    case 'SET_CONFIG':
      return state.phase === 'config' &&
             action.data?.playerCount !== undefined &&
             action.data.playerCount >= 3 &&
             action.data.playerCount <= 10 &&
             action.data?.mode !== undefined
             
    case 'CONFIGURE_CARD':
      return state.phase === 'setup' &&
             action.data?.cardIndex !== undefined &&
             action.data?.cardIndex >= 0 &&
             action.data?.cardIndex < state.config.playerCount &&
             action.data?.playerName !== undefined &&
             action.data.playerName.trim() !== ''
             
    case 'START_GAME':
      return state.phase === 'setup' &&
             state.players.length === state.config.playerCount &&
             state.players.every(p => p.cardConfigured)
             
    case 'START_VOTING':
      return state.phase === 'game' && state.gameData.gamePhase.discussionStarted
      
    case 'ELIMINATE_PLAYER':
      return state.phase === 'game' &&
             state.gameData.gamePhase.votingStarted &&
             action.data?.playerId !== undefined &&
             !state.gameData.eliminatedPlayers.includes(action.data.playerId)
             
    case 'SUBMIT_GUESS':
      return state.phase === 'elimination' &&
             state.gameData.guessPhase.isActive &&
             action.data?.guessWord !== undefined
             
    case 'ACCEPT_GUESS_COLLECTIVE':
    case 'REJECT_GUESS_COLLECTIVE':
      return state.phase === 'scores' &&
             state.gameData.guessPhase.needsValidation
             
    case 'CONTINUE_GAME':
      return state.phase === 'elimination' &&
             !state.gameData.guessPhase.isActive
             
    case 'NEXT_ROUND':
      return state.phase === 'scores' &&
             state.config.currentRound < state.config.rounds
             
    case 'NEW_GAME':
      return state.phase === 'scores'
      
    case 'RESET_GAME':
      return true // Toujours autorisé
      
    default:
      return false
  }
}

