import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore'
import { getFirebaseFirestore } from './firebase'
import { GameSession, Player, User, GameStatus } from '@/types'
import { generateGameCode } from '@utils/gameCode'

export class GameSessionService {
  private db = getFirebaseFirestore()
  private gameListeners: Map<string, Unsubscribe> = new Map()

  /**
   * Crée une nouvelle session de jeu
   */
  async createGame(
    gameType: string,
    host: User,
    minPlayers: number,
    maxPlayers: number
  ): Promise<GameSession> {
    try {
      const gameCode = generateGameCode()
      const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const hostPlayer: Player = {
        ...host,
        score: 0,
        isReady: false,
        isHost: true
      }

      const gameData: Omit<GameSession, 'id'> = {
        code: gameCode,
        gameType,
        status: 'CREATED',
        currentTurn: 0,
        maxPlayers,
        minPlayers,
        createdAt: new Date(),
        createdBy: host.uid,
        players: {
          [host.uid]: hostPlayer
        },
        state: {}
      }

      // Créer le document principal de la partie
      const gameRef = doc(this.db, 'games', gameId)
      await updateDoc(gameRef, {
        ...gameData,
        createdAt: serverTimestamp()
      })

      // Créer le sous-document pour l'hôte
      const playerRef = doc(this.db, 'games', gameId, 'players', host.uid)
      await setDoc(playerRef, hostPlayer)

      console.log('✅ Partie créée:', gameId, 'Code:', gameCode)
      
      return {
        id: gameId,
        ...gameData
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la partie:', error)
      throw new Error('Impossible de créer la partie')
    }
  }

  /**
   * Rejoint une partie existante par son code
   */
  async joinGameByCode(code: string, player: User): Promise<GameSession> {
    try {
      // Rechercher la partie par code
      const gamesRef = collection(this.db, 'games')
      const q = query(gamesRef, where('code', '==', code.toUpperCase()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error('Partie non trouvée')
      }

      const gameDoc = querySnapshot.docs[0]
      const gameData = gameDoc.data() as Omit<GameSession, 'id'>
      const gameId = gameDoc.id

      // Vérifier si la partie peut accueillir un nouveau joueur
      const playerCount = Object.keys(gameData.players).length
      if (playerCount >= gameData.maxPlayers) {
        throw new Error('Partie complète')
      }

      if (gameData.status !== 'CREATED') {
        throw new Error('Partie déjà commencée')
      }

      // Vérifier si le joueur n'est pas déjà dans la partie
      if (gameData.players[player.uid]) {
        throw new Error('Vous êtes déjà dans cette partie')
      }

      // Ajouter le joueur
      const newPlayer: Player = {
        ...player,
        score: 0,
        isReady: false,
        isHost: false
      }

      // Mettre à jour le document principal
      await updateDoc(doc(this.db, 'games', gameId), {
        [`players.${player.uid}`]: newPlayer
      })

      // Créer le sous-document pour le joueur
      const playerRef = doc(this.db, 'games', gameId, 'players', player.uid)
      await setDoc(playerRef, newPlayer)

      console.log('✅ Joueur ajouté à la partie:', gameId)

      return {
        id: gameId,
        ...gameData,
        players: {
          ...gameData.players,
          [player.uid]: newPlayer
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la connexion à la partie:', error)
      throw error
    }
  }

  /**
   * Met à jour le statut "prêt" d'un joueur
   */
  async updatePlayerReady(gameId: string, playerId: string, isReady: boolean): Promise<void> {
    try {
      // Mettre à jour dans le document principal
      await updateDoc(doc(this.db, 'games', gameId), {
        [`players.${playerId}.isReady`]: isReady
      })

      // Mettre à jour dans le sous-document
      await updateDoc(doc(this.db, 'games', gameId, 'players', playerId), {
        isReady
      })

      console.log(`✅ Statut prêt mis à jour pour ${playerId}:`, isReady)
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error)
      throw new Error('Impossible de mettre à jour le statut')
    }
  }

  /**
   * Démarre une partie (seulement pour l'hôte)
   */
  async startGame(gameId: string, hostId: string, initialGameState: any): Promise<void> {
    try {
      // Vérifier que l'utilisateur est bien l'hôte
      const gameDoc = await getDoc(doc(this.db, 'games', gameId))
      if (!gameDoc.exists()) {
        throw new Error('Partie non trouvée')
      }

      const gameData = gameDoc.data() as Omit<GameSession, 'id'>
      if (gameData.createdBy !== hostId) {
        throw new Error('Seul l\'hôte peut démarrer la partie')
      }

      // Vérifier que tous les joueurs sont prêts
      const players = Object.values(gameData.players)
      const allReady = players.every(player => player.isReady)
      if (!allReady) {
        throw new Error('Tous les joueurs doivent être prêts')
      }

      // Vérifier le nombre minimum de joueurs
      if (players.length < gameData.minPlayers) {
        throw new Error(`Il faut au minimum ${gameData.minPlayers} joueurs`)
      }

      // Mettre à jour le statut et l'état initial
      await updateDoc(doc(this.db, 'games', gameId), {
        status: 'IN_PROGRESS',
        state: initialGameState
      })

      console.log('✅ Partie démarrée:', gameId)
    } catch (error) {
      console.error('❌ Erreur lors du démarrage de la partie:', error)
      throw error
    }
  }

  /**
   * Met à jour l'état du jeu
   */
  async updateGameState(gameId: string, newState: any): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'games', gameId), {
        state: newState
      })
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'état:', error)
      throw new Error('Impossible de mettre à jour l\'état du jeu')
    }
  }

  /**
   * Termine une partie
   */
  async finishGame(gameId: string, finalScores: Record<string, number>): Promise<void> {
    try {
      // Mettre à jour les scores finaux
      const updates: any = {
        status: 'FINISHED'
      }

      Object.entries(finalScores).forEach(([playerId, score]) => {
        updates[`players.${playerId}.score`] = score
      })

      await updateDoc(doc(this.db, 'games', gameId), updates)

      console.log('✅ Partie terminée:', gameId)
    } catch (error) {
      console.error('❌ Erreur lors de la fin de partie:', error)
      throw new Error('Impossible de terminer la partie')
    }
  }

  /**
   * Quitte une partie
   */
  async leaveGame(gameId: string, playerId: string): Promise<void> {
    try {
      const gameRef = doc(this.db, 'games', gameId)
      const gameDoc = await getDoc(gameRef)
      
      if (!gameDoc.exists()) {
        throw new Error('Partie non trouvée')
      }

      const gameData = gameDoc.data() as Omit<GameSession, 'id'>
      
      // Si c'est l'hôte qui quitte, supprimer la partie
      if (gameData.createdBy === playerId) {
        await deleteDoc(gameRef)
        console.log('✅ Partie supprimée (hôte parti):', gameId)
      } else {
        // Sinon, juste retirer le joueur
        const updatedPlayers = { ...gameData.players }
        delete updatedPlayers[playerId]

        await updateDoc(gameRef, {
          players: updatedPlayers
        })

        // Supprimer le sous-document du joueur
        await deleteDoc(doc(this.db, 'games', gameId, 'players', playerId))
        
        console.log('✅ Joueur retiré de la partie:', playerId)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sortie de partie:', error)
      throw new Error('Impossible de quitter la partie')
    }
  }

  /**
   * Écoute les changements d'une partie en temps réel
   */
  subscribeToGame(gameId: string, callback: (game: GameSession | null) => void): () => void {
    const gameRef = doc(this.db, 'games', gameId)
    
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as Omit<GameSession, 'id'>
        callback({
          id: doc.id,
          ...gameData,
          createdAt: gameData.createdAt || new Date()
        })
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('❌ Erreur lors de l\'écoute de la partie:', error)
      callback(null)
    })

    this.gameListeners.set(gameId, unsubscribe)
    
    return () => {
      unsubscribe()
      this.gameListeners.delete(gameId)
    }
  }

  /**
   * Nettoie tous les listeners
   */
  cleanup(): void {
    this.gameListeners.forEach(unsubscribe => unsubscribe())
    this.gameListeners.clear()
  }
}
