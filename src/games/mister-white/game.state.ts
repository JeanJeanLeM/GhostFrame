import { Player } from '@/types'

/**
 * Les rôles possibles dans Ghost Frame
 */
export type MisterWhiteRole = 'civil' | 'impostor' | 'ghost-frame'

/**
 * Les phases du jeu (nouveau flow adapté)
 */
export type MisterWhitePhase = 
  | 'loading'        // 1. Écran de chargement
  | 'home'           // 2. Écran d'accueil
  | 'rules'          // 3. Règles rapides du jeu
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
 * Mode de jeu : uniquement image (sélection des photos dans le dossier images)
 */
export type GameMode = 'image'

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
    mode: GameMode          // Toujours 'image'
    /** Clé de la paire choisie (theme|pairId) pour recharger en manche suivante */
    selectedPairKey: string
    difficulty: 'easy' | 'medium' | 'hard'
    rounds: number          // Nombre de manches
    currentRound: number    // Manche actuelle
  }
  
  // Données de jeu
  gameData: {
    // Images pour la manche en cours
    currentImages: ImagePair | null
    // Une paire par manche (index 0 = manche 1, etc.)
    imagesByRound: ImagePair[]

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
 * Import du registre des images depuis assets (manifeste par thème)
 */
import { chooseRandomImagePair } from '@assets/images/imageRegistry'

/**
 * Actions possibles dans le jeu (nouveau flow)
 */
export interface MisterWhiteAction {
  type: 
    | 'FINISH_LOADING'        // Terminer le chargement
    | 'SHOW_RULES'            // Afficher les règles rapides
    | 'BACK_TO_HOME'          // Retour à l'accueil
    | 'START_FROM_RULES'      // Démarrer une partie (accueil ou règles)
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
    /** Clé de la paire choisie (theme|pairId) */
    selectedPairKey?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    rounds?: number
    /** Paires d'images choisies : passées par l'UI après sélection dans le dossier images */
    currentImages?: ImagePair | null
    /** Une paire par manche (index 0 = manche 1) pour varier les images entre manches */
    imagesByRound?: ImagePair[]

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
      mode: 'image',
      selectedPairKey: '',
      difficulty: 'medium',
      rounds: 1,
      currentRound: 1
    },
    gameData: {
      currentImages: null,
      imagesByRound: [],
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
 * Répartition optimale des rôles selon le nombre de joueurs
 * civils = Experts, impostors = Novices, ghostFrame = Fantômes
 */
export const ROLE_DISTRIBUTION_TABLE: Record<number, { civils: number, impostors: number, ghostFrame: number }> = {
  3: { civils: 2, impostors: 1, ghostFrame: 0 },
  4: { civils: 3, impostors: 1, ghostFrame: 0 },
  5: { civils: 3, impostors: 1, ghostFrame: 1 },
  6: { civils: 4, impostors: 1, ghostFrame: 1 },
  7: { civils: 5, impostors: 1, ghostFrame: 1 },
  8: { civils: 5, impostors: 2, ghostFrame: 1 },
  9: { civils: 6, impostors: 2, ghostFrame: 1 },
  10: { civils: 7, impostors: 2, ghostFrame: 1 },
  11: { civils: 8, impostors: 2, ghostFrame: 1 },
  12: { civils: 8, impostors: 3, ghostFrame: 1 },
  13: { civils: 9, impostors: 3, ghostFrame: 1 },
  14: { civils: 10, impostors: 3, ghostFrame: 1 },
  15: { civils: 11, impostors: 3, ghostFrame: 1 }
}

export interface RoleDistributionDisplay {
  experts: number
  novices: number
  fantomes: number
}

export function getRoleDistribution(playerCount: number): RoleDistributionDisplay {
  const distribution = ROLE_DISTRIBUTION_TABLE[playerCount]

  if (!distribution) {
    const fantomes = playerCount >= 5 ? 1 : 0
    const novices = Math.max(1, Math.floor(playerCount / 4))
    const experts = playerCount - novices - fantomes
    return { experts, novices, fantomes }
  }

  return {
    experts: distribution.civils,
    novices: distribution.impostors,
    fantomes: distribution.ghostFrame
  }
}

export function getRoleDistributionRows(minPlayers = 3, maxPlayers = 10): Array<{ players: number } & RoleDistributionDisplay> {
  return Array.from({ length: maxPlayers - minPlayers + 1 }, (_, index) => {
    const players = minPlayers + index
    return { players, ...getRoleDistribution(players) }
  })
}

/**
 * Distribue les rôles selon le tableau d'équilibrage optimal
 * Pas de Fantôme en dessous de 5 joueurs : 3 joueurs = 2 experts + 1 novice ; 4 = 3 experts + 1 novice
 * À partir de 5 joueurs : 1 Ghost Frame + impostors + civils
 */
export function distributeRoles(playerCount: number): MisterWhiteRole[] {
  const distribution = ROLE_DISTRIBUTION_TABLE[playerCount]
  
  // Si le nombre de joueurs n'est pas dans le tableau, utiliser une formule de fallback
  if (!distribution) {
    const numGhostFrame = playerCount >= 5 ? 1 : 0
    const numImpostors = Math.max(1, Math.floor(playerCount / 4)) // ≈ 25% d'impostors
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
 * Choisit une paire aléatoire pour le thème et assigne aléatoirement
 * quelle image va aux Experts et laquelle aux Novices (async : chargement du manifeste).
 */
export async function chooseRandomImages(theme: string = 'libre'): Promise<ImagePair | null> {
  const pair = await chooseRandomImagePair(theme)
  if (!pair) {
    console.warn(`Aucune paire d'images disponible pour le thème: ${theme}`)
  }
  return pair
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

    case 'SHOW_RULES':
      return state.phase === 'home'

    case 'BACK_TO_HOME':
      return state.phase === 'rules'
      
    case 'START_FROM_RULES':
      return state.phase === 'home' || state.phase === 'rules'
      
    case 'SET_CONFIG':
      const hasImages = (action.data?.imagesByRound?.length ?? 0) > 0 || action.data?.currentImages !== undefined
      return state.phase === 'config' &&
             action.data?.playerCount !== undefined &&
             action.data.playerCount >= 3 &&
             action.data.playerCount <= 10 &&
             hasImages
             
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

