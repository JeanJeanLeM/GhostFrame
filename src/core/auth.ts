import { 
  User as FirebaseUser, 
  signInAnonymously, 
  onAuthStateChanged, 
  updateProfile,
  Unsubscribe
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'
import { User } from '@/types'

export class AuthService {
  private auth = getFirebaseAuth()
  private currentUser: User | null = null
  private authStateListeners: ((user: User | null) => void)[] = []
  private unsubscribeAuth: Unsubscribe | null = null

  constructor() {
    this.setupAuthStateListener()
  }

  /**
   * Initialise le service d'authentification
   */
  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      // Si on a déjà un utilisateur, on résout immédiatement
      if (this.currentUser) {
        resolve()
        return
      }

      // Sinon on attend le premier changement d'état
      const unsubscribe = this.onAuthStateChange((user) => {
        unsubscribe()
        resolve()
      })
    })
  }

  /**
   * Configure l'écoute des changements d'état d'authentification
   */
  private setupAuthStateListener(): void {
    this.unsubscribeAuth = onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        this.currentUser = this.mapFirebaseUserToUser(firebaseUser)
      } else {
        this.currentUser = null
      }
      
      // Notifier tous les listeners
      this.authStateListeners.forEach(listener => listener(this.currentUser))
    })
  }

  /**
   * Convertit un utilisateur Firebase en utilisateur de l'app
   */
  private mapFirebaseUserToUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'Joueur Anonyme',
      isAnonymous: firebaseUser.isAnonymous,
      connected: true,
      lastSeen: new Date()
    }
  }

  /**
   * Connexion anonyme
   */
  async signInAnonymously(): Promise<User> {
    try {
      const result = await signInAnonymously(this.auth)
      const user = this.mapFirebaseUserToUser(result.user)
      
      console.log('✅ Connexion anonyme réussie:', user.uid)
      return user
    } catch (error) {
      console.error('❌ Erreur lors de la connexion anonyme:', error)
      throw new Error('Impossible de se connecter de manière anonyme')
    }
  }

  /**
   * Met à jour le nom d'affichage de l'utilisateur
   */
  async updateDisplayName(displayName: string): Promise<void> {
    if (!this.auth.currentUser) {
      throw new Error('Aucun utilisateur connecté')
    }

    try {
      await updateProfile(this.auth.currentUser, { displayName })
      
      // Mettre à jour l'utilisateur local
      if (this.currentUser) {
        this.currentUser.displayName = displayName
        this.authStateListeners.forEach(listener => listener(this.currentUser))
      }
      
      console.log('✅ Nom d\'affichage mis à jour:', displayName)
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du nom:', error)
      throw new Error('Impossible de mettre à jour le nom d\'affichage')
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    try {
      await this.auth.signOut()
      console.log('✅ Déconnexion réussie')
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error)
      throw new Error('Impossible de se déconnecter')
    }
  }

  /**
   * Obtient l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * Vérifie si un utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  /**
   * Ajoute un listener pour les changements d'état d'authentification
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback)
    
    // Appeler immédiatement avec l'état actuel
    callback(this.currentUser)
    
    // Retourner une fonction de désabonnement
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  /**
   * Nettoie les listeners
   */
  destroy(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth()
    }
    this.authStateListeners = []
  }
}
