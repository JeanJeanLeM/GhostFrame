import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'

// Configuration Firebase depuis les variables d'environnement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

let app: FirebaseApp
let auth: Auth
let db: Firestore

export function initializeFirebase(): void {
  try {
    // Initialiser Firebase
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)

    // Connecter aux émulateurs en mode développement
    if (import.meta.env.VITE_APP_ENV === 'development') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
        connectFirestoreEmulator(db, 'localhost', 8080)
        console.log('🔧 Émulateurs Firebase connectés')
      } catch (error) {
        console.warn('⚠️ Impossible de se connecter aux émulateurs:', error)
      }
    }

    console.log('🔥 Firebase initialisé avec succès')
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Firebase:', error)
    throw new Error('Impossible d\'initialiser Firebase')
  }
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth n\'est pas initialisé')
  }
  return auth
}

export function getFirebaseFirestore(): Firestore {
  if (!db) {
    throw new Error('Firestore n\'est pas initialisé')
  }
  return db
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error('Firebase App n\'est pas initialisé')
  }
  return app
}

// Vérifier que toutes les variables d'environnement sont présentes
export function validateFirebaseConfig(): boolean {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ]

  const missing = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missing.length > 0) {
    console.warn('⚠️ Variables d\'environnement Firebase manquantes:', missing)
    console.warn('🎮 L\'application fonctionnera en mode single-device uniquement')
    return false
  }

  return true
}

// Vérifier si Firebase est disponible
export function isFirebaseAvailable(): boolean {
  return !!app && !!auth && !!db
}
