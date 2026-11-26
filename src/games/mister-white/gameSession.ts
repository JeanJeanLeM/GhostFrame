import { MisterWhiteGameLogic } from './game.logic'
import {
  MisterWhiteAction,
  MisterWhiteGameState,
  MisterWhitePhase,
  createInitialGameState,
} from './game.state'

const STORAGE_KEY = 'ghostframe-live-game'

const PHASES: MisterWhitePhase[] = [
  'loading',
  'home',
  'rules',
  'config',
  'setup',
  'game',
  'elimination',
  'scores',
]

/** In-memory play session. The back stack is not the browser history. */
export interface GhostFrameSession {
  state: MisterWhiteGameState
  backStack: MisterWhiteGameState[]
}

export function createGhostFrameSession(
  state: MisterWhiteGameState = createInitialGameState()
): GhostFrameSession {
  return { state, backStack: [] }
}

export function cloneGameState<T>(value: T): T {
  return structuredClone(value)
}

/** A decided last round. A scores screen with rounds left, or a guess still to validate, stays resumable. */
export function isFinishedGame(state: MisterWhiteGameState): boolean {
  if (state.phase !== 'scores') return false
  if (state.config.currentRound < state.config.rounds) return false
  if (state.gameData.guessPhase?.needsValidation) return false
  return true
}

export function shouldPersistGame(state: MisterWhiteGameState): boolean {
  if (state.phase === 'loading') return false
  if (isFinishedGame(state)) return false
  return true
}

function reviveState(state: MisterWhiteGameState): MisterWhiteGameState {
  if (state.startedAt) state.startedAt = new Date(state.startedAt)
  if (state.finishedAt) state.finishedAt = new Date(state.finishedAt)
  state.gameData.imagesByRound ??= []
  state.gameData.eliminatedPlayers ??= []
  state.gameData.eliminationHistory ??= []
  state.gameData.roleAssignments ??= {}
  state.gameData.cardsSeen ??= {}
  state.config.playerNames ??= []
  for (const entry of state.gameData.eliminationHistory) {
    if (entry.timestamp) entry.timestamp = new Date(entry.timestamp)
  }
  return state
}

function isGameState(value: unknown): value is MisterWhiteGameState {
  if (!value || typeof value !== 'object') return false
  const state = value as MisterWhiteGameState
  if (!PHASES.includes(state.phase)) return false
  if (!state.config || typeof state.config !== 'object') return false
  if (!Array.isArray(state.players)) return false
  if (!state.gameData || typeof state.gameData !== 'object') return false
  if (!state.gameData.guessPhase || !state.gameData.gamePhase) return false
  return true
}

export function persistGameSession(session: GhostFrameSession): void {
  try {
    if (!shouldPersistGame(session.state)) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      state: session.state,
      backStack: session.backStack,
    }))
  } catch {
    // localStorage indisponible (mode privé, quota)
  }
}

export function loadPersistedGame(): GhostFrameSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: unknown; backStack?: unknown }
    if (!isGameState(parsed.state) || !shouldPersistGame(parsed.state)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    const backStack = Array.isArray(parsed.backStack)
      ? parsed.backStack.filter(isGameState).map(entry => reviveState(entry))
      : []
    return { state: reviveState(parsed.state), backStack }
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    return null
  }
}

export function clearPersistedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** Horizontal swipe to the right, large enough to mean "back" and not a scroll. */
export function isRightBackSwipe(dx: number, dy: number): boolean {
  if (dx < 64) return false
  if (Math.abs(dy) > 80) return false
  if (Math.abs(dx) < Math.abs(dy) * 1.2) return false
  return true
}

/** One screen back when the session has no saved snapshot. */
export function stepBack(state: MisterWhiteGameState): MisterWhiteGameState | null {
  const next = cloneGameState(state)
  switch (next.phase) {
    case 'rules':
    case 'config':
      next.phase = 'home'
      return next
    case 'setup':
      next.phase = 'config'
      next.players = []
      return next
    case 'game':
      next.phase = 'setup'
      next.gameData.firstPlayer = null
      next.gameData.gamePhase = {
        discussionStarted: false,
        votingStarted: false,
        eliminationRevealed: false,
      }
      next.startedAt = undefined
      return next
    case 'elimination': {
      const last = next.gameData.eliminationHistory.pop()
      if (last) {
        next.gameData.eliminatedPlayers = next.gameData.eliminatedPlayers.filter(id => id !== last.playerId)
        const player = next.players.find(entry => entry.id === last.playerId)
        if (player) player.isEliminated = false
        if (last.role === 'ghost-frame') {
          next.gameData.guessPhase.isActive = false
          next.gameData.guessPhase.eliminatedGhostFrame = undefined
        }
      }
      next.phase = 'game'
      next.gameData.gamePhase.discussionStarted = true
      next.gameData.gamePhase.votingStarted = true
      next.gameData.gamePhase.eliminationRevealed = false
      next.winner = undefined
      next.finishedAt = undefined
      return next
    }
    default:
      return null
  }
}

export function goBackInSession(session: GhostFrameSession): GhostFrameSession {
  if (session.backStack.length > 0) {
    const backStack = session.backStack.slice(0, -1)
    const state = cloneGameState(session.backStack[session.backStack.length - 1])
    return { state, backStack }
  }
  const stepped = stepBack(session.state)
  if (!stepped) return session
  return { state: stepped, backStack: [] }
}

/**
 * Applies one game action. Forward phase changes push a snapshot.
 * Back, a new game, and a full reset do not use the browser history.
 */
export function reduceGameSession(
  session: GhostFrameSession,
  action: MisterWhiteAction,
  logic: MisterWhiteGameLogic
): GhostFrameSession {
  if (action.type === 'BACK_TO_HOME') {
    return goBackInSession(session)
  }

  if (action.type === 'RESET_GAME' || action.type === 'NEW_GAME') {
    if (!logic.validateMove(session.state, 'local-player', action)) return session
    const state = logic.processMove(cloneGameState(session.state), 'local-player', action)
    return { state, backStack: [] }
  }

  if (!logic.validateMove(session.state, 'local-player', action)) return session

  const before = cloneGameState(session.state)
  const state = logic.processMove(cloneGameState(before), 'local-player', action)
  const backStack = session.backStack.slice()
  if (state.phase !== before.phase && before.phase !== 'loading') {
    backStack.push(before)
  }
  return { state, backStack }
}
