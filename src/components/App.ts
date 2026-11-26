import { ErrorHandler } from '@core/errorHandler'
import { MisterWhiteGameUI } from '@games/mister-white/game.ui'
import { MisterWhiteGameLogic } from '@games/mister-white/game.logic'
import { MisterWhiteAction } from '@games/mister-white/game.state'
import {
  GhostFrameSession,
  createGhostFrameSession,
  goBackInSession,
  isRightBackSwipe,
  loadPersistedGame,
  persistGameSession,
  reduceGameSession,
} from '@games/mister-white/gameSession'

/**
 * Application dédiée au jeu Ghost Frame
 * Pas de routeur, pas de Firebase - Juste Ghost Frame en mode single-device
 */
export class App {
  private container: HTMLElement
  private misterWhiteUI: MisterWhiteGameUI
  private misterWhiteLogic: MisterWhiteGameLogic
  private session: GhostFrameSession

  constructor() {
    this.container = document.getElementById('app')!
    this.misterWhiteUI = new MisterWhiteGameUI()
    this.misterWhiteUI.setContainer(this.container)
    this.misterWhiteLogic = new MisterWhiteGameLogic()
    this.session = loadPersistedGame() ?? createGhostFrameSession()
    this.initialize()
  }

  private async initialize(): Promise<void> {
    document.addEventListener('ghost-frame-action', (event: Event) => {
      const detail = (event as CustomEvent<MisterWhiteAction>).detail
      this.handleMisterWhiteAction(detail)
    })

    this.installSwipeBack()
    this.render()
  }

  private render(): void {
    this.misterWhiteUI.onGameStateUpdate(this.session.state)
    persistGameSession(this.session)
  }

  private handleMisterWhiteAction(action: MisterWhiteAction): void {
    try {
      console.log('🎮 Action Ghost Frame:', action.type, action.data)

      const next = reduceGameSession(this.session, action, this.misterWhiteLogic)
      if (next === this.session) {
        console.warn('⚠️ Action invalide:', action)
        return
      }

      this.session = next
      this.render()

      const winCondition = this.misterWhiteLogic.checkWinCondition(this.session.state)
      if (winCondition.isFinished) {
        console.log('🏆 Partie terminée !', winCondition)
      }

      console.log('🎯 État actuel:', this.session.state.phase)
    } catch (error) {
      console.error('❌ Erreur lors du traitement de l\'action:', error)
      ErrorHandler.handleError(error as Error, 'Erreur de jeu')
    }
  }

  /**
   * One step back inside the game. Does not call the History API.
   */
  private goBackOneStep(): void {
    if (this.misterWhiteUI.tryConsumeSwipeBack()) return
    const next = goBackInSession(this.session)
    if (next === this.session) return
    this.session = next
    this.render()
  }

  /**
   * A right swipe steps back in the game. The gesture is cancelled
   * before the browser can treat it as history navigation.
   */
  private installSwipeBack(): void {
    if (!document.getElementById('game-edge-guard')) {
      const guard = document.createElement('div')
      guard.id = 'game-edge-guard'
      guard.setAttribute('aria-hidden', 'true')
      document.body.appendChild(guard)
    }

    let startX = 0
    let startY = 0
    let active = false

    document.addEventListener('touchstart', (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        active = false
        return
      }
      const target = event.target
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) {
        active = false
        return
      }
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
      active = true
    }, { passive: true })

    document.addEventListener('touchmove', (event: TouchEvent) => {
      if (!active || event.touches.length !== 1) return
      const dx = event.touches[0].clientX - startX
      const dy = event.touches[0].clientY - startY
      if (dx > 12 && Math.abs(dx) > Math.abs(dy)) {
        event.preventDefault()
      }
    }, { passive: false })

    document.addEventListener('touchend', (event: TouchEvent) => {
      if (!active) return
      active = false
      const touch = event.changedTouches[0]
      if (!touch) return
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      if (!isRightBackSwipe(dx, dy)) return
      this.goBackOneStep()
    }, { passive: true })
  }
}
