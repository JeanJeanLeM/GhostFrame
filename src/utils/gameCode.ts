/**
 * Génère un code de partie aléatoire de 6 caractères
 * Format: ABCDEF (lettres majuscules uniquement, pas de chiffres pour éviter la confusion)
 */
export function generateGameCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  
  for (let i = 0; i < 6; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  
  return code
}

/**
 * Valide un code de partie
 */
export function validateGameCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false
  }
  
  // Le code doit faire exactement 6 caractères et ne contenir que des lettres
  const cleanCode = code.trim().toUpperCase()
  return /^[A-Z]{6}$/.test(cleanCode)
}

/**
 * Formate un code de partie pour l'affichage
 */
export function formatGameCode(code: string): string {
  if (!code) return ''
  
  const cleanCode = code.trim().toUpperCase()
  
  // Ajouter des espaces pour la lisibilité: ABC DEF
  if (cleanCode.length === 6) {
    return `${cleanCode.slice(0, 3)} ${cleanCode.slice(3)}`
  }
  
  return cleanCode
}
