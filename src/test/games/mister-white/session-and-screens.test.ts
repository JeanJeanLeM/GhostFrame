import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MisterWhiteGameLogic } from '@games/mister-white/game.logic'
import { createInitialGameState, MisterWhiteGameState } from '@games/mister-white/game.state'
import { MisterWhiteGameUI } from '@games/mister-white/game.ui'
import { RULES_SUMMARY, smallGroupSpeechNote } from '@games/mister-white/playCopy'
import {
  cloneGameState,
  createGhostFrameSession,
  goBackInSession,
  isFinishedGame,
  isRightBackSwipe,
  loadPersistedGame,
  persistGameSession,
  reduceGameSession,
} from '@games/mister-white/gameSession'
import { Player } from '@/types'

const viewer: Player = {
  uid: 'local',
  displayName: 'Local',
  score: 0,
  isReady: true,
  isHost: true,
  isAnonymous: false,
  connected: true,
  lastSeen: new Date(),
}

function board(state: MisterWhiteGameState): HTMLElement {
  return new MisterWhiteGameUI().renderGameBoard(state, viewer)
}

describe('right swipe stays inside the game', () => {
  const logic = new MisterWhiteGameLogic()

  it('recognises a right swipe and ignores a scroll or a left swipe', () => {
    expect(isRightBackSwipe(120, 8)).toBe(true)
    expect(isRightBackSwipe(40, 0)).toBe(false)
    expect(isRightBackSwipe(-120, 0)).toBe(false)
    expect(isRightBackSwipe(100, 90)).toBe(false)
  })

  it('steps back one phase without touching browser history', () => {
    const back = vi.spyOn(window.history, 'back')
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')

    let session = createGhostFrameSession()
    session = reduceGameSession(session, { type: 'FINISH_LOADING' }, logic)
    expect(session.state.phase).toBe('home')
    expect(session.backStack).toHaveLength(0)

    session = reduceGameSession(session, { type: 'SHOW_RULES' }, logic)
    expect(session.state.phase).toBe('rules')

    session = goBackInSession(session)
    expect(session.state.phase).toBe('home')

    session = reduceGameSession(session, { type: 'START_FROM_RULES' }, logic)
    session = reduceGameSession(session, {
      type: 'SET_CONFIG',
      data: {
        playerCount: 4,
        rounds: 2,
        selectedPairKey: 'playing-pairs|paire-07',
        imagesByRound: [{ civil: '/expert.png', impostor: '/novice.png', id: 'paire-07' }],
      },
    }, logic)
    expect(session.state.phase).toBe('setup')
    const roles = session.state.players.map(player => player.role)

    session = goBackInSession(session)
    expect(session.state.phase).toBe('config')
    expect(session.state.config.playerCount).toBe(6)

    session = reduceGameSession(session, {
      type: 'SET_CONFIG',
      data: {
        playerCount: 4,
        rounds: 2,
        selectedPairKey: 'playing-pairs|paire-07',
        imagesByRound: [{ civil: '/expert.png', impostor: '/novice.png', id: 'paire-07' }],
      },
    }, logic)
    session.state.players.forEach((player, index) => {
      player.name = `Joueur ${index + 1}`
      player.cardConfigured = true
    })
    const setupRoles = session.state.players.map(player => player.role)
    session = reduceGameSession(session, { type: 'START_GAME' }, logic)
    expect(session.state.phase).toBe('game')
    session = goBackInSession(session)
    expect(session.state.phase).toBe('setup')
    expect(session.state.players.map(player => player.role)).toEqual(setupRoles)
    expect(session.state.gameData.currentImages?.id).toBe('paire-07')
    expect(roles).toHaveLength(4)

    expect(back).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    back.mockRestore()
    push.mockRestore()
    replace.mockRestore()
  })
})

describe('local game resume', () => {
  const logic = new MisterWhiteGameLogic()

  beforeEach(() => {
    localStorage.clear()
  })

  it('saves phase, players and pair, then restores them', () => {
    let session = createGhostFrameSession()
    session = reduceGameSession(session, { type: 'FINISH_LOADING' }, logic)
    session = reduceGameSession(session, { type: 'START_FROM_RULES' }, logic)
    session = reduceGameSession(session, {
      type: 'SET_CONFIG',
      data: {
        playerCount: 4,
        rounds: 3,
        selectedPairKey: 'playing-pairs|paire-12',
        imagesByRound: [{ civil: '/a.png', impostor: '/b.png', id: 'paire-12' }],
      },
    }, logic)
    session.state.players[0].name = 'Camille'
    session.state.players[0].cardConfigured = true
    session.state.startedAt = new Date('2026-11-26T08:00:00.000Z')
    persistGameSession(session)

    const loaded = loadPersistedGame()
    expect(loaded).not.toBeNull()
    expect(loaded!.state.phase).toBe('setup')
    expect(loaded!.state.players[0].name).toBe('Camille')
    expect(loaded!.state.config.selectedPairKey).toBe('playing-pairs|paire-12')
    expect(loaded!.state.gameData.currentImages).toEqual({
      civil: '/a.png',
      impostor: '/b.png',
      id: 'paire-12',
    })
    expect(loaded!.state.startedAt).toBeInstanceOf(Date)
    expect(loaded!.backStack.at(-1)?.phase).toBe('config')
  })

  it('starts clean after a finished game', () => {
    const session = createGhostFrameSession()
    session.state.phase = 'scores'
    session.state.config.rounds = 1
    session.state.config.currentRound = 1
    session.state.winner = { type: 'civils', survivors: [] }
    expect(isFinishedGame(session.state)).toBe(true)
    persistGameSession(session)
    expect(loadPersistedGame()).toBeNull()
    expect(localStorage.getItem('ghostframe-live-game')).toBeNull()
  })

  it('keeps a scores screen when another round remains', () => {
    const session = createGhostFrameSession()
    session.state.phase = 'scores'
    session.state.config.rounds = 3
    session.state.config.currentRound = 1
    session.state.config.selectedPairKey = 'playing-pairs|paire-02'
    session.state.players = [{ id: 'player-0', name: 'Noa', role: 'civil', score: 2 }]
    persistGameSession(session)
    const loaded = loadPersistedGame()
    expect(loaded!.state.phase).toBe('scores')
    expect(loaded!.state.players[0].name).toBe('Noa')
    expect(loaded!.state.config.selectedPairKey).toBe('playing-pairs|paire-02')
  })

  it('clears the previous game when a new game or a reset starts', () => {
    let session = createGhostFrameSession()
    session.state.phase = 'scores'
    session.state.config.rounds = 1
    session.state.config.currentRound = 1
    session.state.players = [{ id: 'player-0', name: 'Léa', role: 'impostor' }]
    session.backStack = [cloneGameState(createInitialGameState())]
    session.state.winner = { type: 'impostors', survivors: ['player-0'] }

    session = reduceGameSession(session, { type: 'NEW_GAME' }, logic)
    expect(session.state.phase).toBe('config')
    expect(session.backStack).toHaveLength(0)
    expect(session.state.config.playerNames).toEqual(['Léa'])
    persistGameSession(session)
    expect(loadPersistedGame()!.state.phase).toBe('config')

    session = reduceGameSession(session, { type: 'RESET_GAME' }, logic)
    expect(session.state.phase).toBe('loading')
    expect(session.backStack).toHaveLength(0)
    persistGameSession(session)
    expect(loadPersistedGame()).toBeNull()
  })
})

describe('rules summary and small-table note', () => {
  it('states the rules in one paragraph before the existing detail', () => {
    const state = createInitialGameState()
    state.phase = 'rules'
    const screen = board(state)
    const text = screen.textContent ?? ''
    const summaryAt = text.indexOf(RULES_SUMMARY)
    const detailAt = text.indexOf('Règles rapides')
    expect(summaryAt).toBeGreaterThanOrEqual(0)
    expect(detailAt).toBeGreaterThan(summaryAt)
    expect(screen.querySelectorAll('[data-rules-summary]')).toHaveLength(1)
  })

  it('shows the speaking-turn note for 3 and 4 players only', () => {
    expect(smallGroupSpeechNote(3)).toMatch(/tours de parole/)
    expect(smallGroupSpeechNote(4)).toMatch(/tours de parole/)
    expect(smallGroupSpeechNote(2)).toBeNull()
    expect(smallGroupSpeechNote(5)).toBeNull()
    expect(smallGroupSpeechNote(8)).toBeNull()

    for (const count of [3, 4, 5]) {
      const state = createInitialGameState()
      state.phase = 'game'
      state.config.playerCount = count
      state.gameData.firstPlayer = 'Sam'
      const screen = board(state)
      const note = screen.querySelector('[data-small-group-note]')
      if (count < 5) {
        expect(note?.textContent).toContain('tours de parole')
      } else {
        expect(note).toBeNull()
      }
    }
  })

  it('shows the cleaned Ghost Frame artwork on every logo screen', () => {
    vi.useFakeTimers()
    try {
      for (const phase of ['loading', 'home', 'config', 'setup', 'game'] as const) {
        const state = createInitialGameState()
        state.phase = phase
        const screen = board(state)
        const logo = screen.querySelector('img.gf-logo')
        expect(logo, phase).not.toBeNull()
        expect(logo?.getAttribute('alt')).toBe('Ghost Frame')
        expect(logo?.getAttribute('src')).toBe('/logo/ghost-frame.webp')
        expect(screen.querySelector('svg.gf-logo')).toBeNull()
      }
    } finally {
      vi.clearAllTimers()
      vi.useRealTimers()
    }
  })
})
