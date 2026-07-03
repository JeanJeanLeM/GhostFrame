const STORAGE_KEY = 'ghostframe-games-played'

/** Nombre de parties déjà jouées (persisté entre les sessions). */
export function getStoredGamesPlayed(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return Math.max(0, parseInt(raw ?? '0', 10) || 0)
  } catch {
    return 0
  }
}

export function saveGamesPlayed(count: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Math.max(0, Math.floor(count))))
  } catch {
    // localStorage indisponible (mode privé, etc.)
  }
}

/** Après une partie lancée avec `usedCount`, enregistre usedCount + 1 pour la prochaine fois. */
export function recordGameSessionCompleted(usedGamesPlayed: number): void {
  saveGamesPlayed(usedGamesPlayed + 1)
}
