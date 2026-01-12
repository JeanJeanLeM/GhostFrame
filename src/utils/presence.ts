import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseFirestore } from '@core/firebase'

export class PresenceService {
  private db = getFirebaseFirestore()
  private presenceInterval: number | null = null
  private currentGameId: string | null = null
  private currentPlayerId: string | null = null

  /**
   * Démarre le suivi de présence pour un joueur dans une partie
   */
  startPresenceTracking(gameId: string, playerId: string): void {
    this.currentGameId = gameId
    this.currentPlayerId = playerId
    
    // Marquer le joueur comme connecté
    this.updatePresence(true)
    
    // Configurer la déconnexion automatique
    this.setupDisconnectHandler()
    
    // Mettre à jour la présence toutes les 30 secondes
    this.presenceInterval = window.setInterval(() => {
      this.updatePresence(true)
    }, 30000)
    
    console.log('✅ Suivi de présence démarré pour', playerId)
  }

  /**
   * Arrête le suivi de présence
   */
  stopPresenceTracking(): void {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval)
      this.presenceInterval = null
    }
    
    // Marquer comme déconnecté
    if (this.currentGameId && this.currentPlayerId) {
      this.updatePresence(false)
    }
    
    this.currentGameId = null
    this.currentPlayerId = null
    
    console.log('✅ Suivi de présence arrêté')
  }

  /**
   * Met à jour le statut de présence d'un joueur
   */
  private async updatePresence(connected: boolean): Promise<void> {
    if (!this.currentGameId || !this.currentPlayerId) return

    try {
      // Mettre à jour dans le document principal
      await updateDoc(doc(this.db, 'games', this.currentGameId), {
        [`players.${this.currentPlayerId}.connected`]: connected,
        [`players.${this.currentPlayerId}.lastSeen`]: serverTimestamp()
      })

      // Mettre à jour dans le sous-document
      await updateDoc(doc(this.db, 'games', this.currentGameId, 'players', this.currentPlayerId), {
        connected,
        lastSeen: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de présence:', error)
    }
  }

  /**
   * Configure le gestionnaire de déconnexion
   */
  private setupDisconnectHandler(): void {
    if (!this.currentGameId || !this.currentPlayerId) return

    try {
      // Configurer les actions à effectuer lors de la déconnexion
      const playerRef = doc(this.db, 'games', this.currentGameId, 'players', this.currentPlayerId)
      const gamePlayerRef = doc(this.db, 'games', this.currentGameId)
      
      // Note: onDisconnect n'existe pas dans Firestore (seulement dans Realtime Database)
      // La déconnexion sera gérée via des heartbeats ou des event listeners
      console.log('Presence configurée pour:', this.currentPlayerId)
    } catch (error) {
      console.error('Erreur lors de la configuration du gestionnaire de déconnexion:', error)
    }
  }

  /**
   * Vérifie si un joueur est considéré comme connecté
   */
  static isPlayerOnline(lastSeen: Date, connected: boolean): boolean {
    if (!connected) return false
    
    const now = new Date()
    const timeDiff = now.getTime() - lastSeen.getTime()
    const maxOfflineTime = 60000 // 1 minute
    
    return timeDiff < maxOfflineTime
  }

  /**
   * Obtient le temps depuis la dernière activité
   */
  static getTimeSinceLastSeen(lastSeen: Date): string {
    const now = new Date()
    const timeDiff = now.getTime() - lastSeen.getTime()
    
    const seconds = Math.floor(timeDiff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `il y a ${hours}h`
    } else if (minutes > 0) {
      return `il y a ${minutes}min`
    } else if (seconds > 30) {
      return `il y a ${seconds}s`
    } else {
      return 'à l\'instant'
    }
  }
}
