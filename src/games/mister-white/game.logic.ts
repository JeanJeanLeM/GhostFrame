import { GameLogic, Player } from '@/types'
import { 
  MisterWhiteGameState, 
  MisterWhiteAction, 
  MisterWhiteRole,
  LocalPlayer,
  createInitialGameState, 
  validateGameAction,
  distributeRoles,
  generateSecretWord,
  shuffleArray
} from './game.state'

/**
 * Logique du jeu Ghost Frame
 */
export class MisterWhiteGameLogic implements GameLogic {
  
  validateMove(gameState: any, playerId: string, move: any): boolean {
    const state = gameState as MisterWhiteGameState
    const action = move as MisterWhiteAction
    
    return validateGameAction(state, action)
  }
  
  processMove(gameState: any, playerId: string, move: any): MisterWhiteGameState {
    const state = { ...gameState } as MisterWhiteGameState
    const action = move as MisterWhiteAction
    
    switch (action.type) {
      case 'FINISH_LOADING':
        return this.processFinishLoading(state)

      case 'SHOW_RULES':
        return this.processShowRules(state)

      case 'BACK_TO_HOME':
        return this.processBackToHome(state)
        
      case 'START_FROM_RULES':
        return this.processStartFromRules(state)
        
      case 'SET_CONFIG':
        return this.processSetConfig(state, action.data!)
        
      case 'CONFIGURE_CARD':
        return this.processConfigureCard(state, action.data!.cardIndex!, action.data!.playerName!)
        
      case 'START_GAME':
        return this.processStartGame(state)
        
      case 'START_VOTING':
        return this.processStartVoting(state)
        
      case 'ELIMINATE_PLAYER':
        return this.processEliminatePlayer(state, action.data!.playerId!)
        
      case 'SUBMIT_GUESS':
        return this.processSubmitGuess(state, action.data!.guessWord!)
        
      case 'ACCEPT_GUESS_COLLECTIVE':
        return this.processAcceptGuessCollective(state)
        
      case 'REJECT_GUESS_COLLECTIVE':
        return this.processRejectGuessCollective(state)
        
      case 'CONTINUE_GAME':
        return this.processContinueGame(state)
        
      case 'NEXT_ROUND':
        return this.processNextRound(state, action.data)
        
      case 'NEW_GAME':
        return this.processNewGame(state)
        
      case 'RESET_GAME':
        return this.processResetGame()
        
      default:
        throw new Error(`Action non reconnue: ${action.type}`)
    }
  }
  
  checkWinCondition(gameState: any): { 
    isFinished: boolean
    winner?: string
    scores?: Record<string, number> 
  } {
    const state = gameState as MisterWhiteGameState
    
    if (state.phase === 'scores' && state.winner) {
      return {
        isFinished: true,
        winner: state.winner.type,
        scores: this.calculateScores(state)
      }
    }
    
    return { isFinished: false }
  }
  
  getNextPlayer(gameState: any, currentPlayerId: string): string {
    // Dans Ghost Frame, il n'y a pas de tour par tour strict
    return currentPlayerId
  }
  
  initializeGameState(players: Player[]): MisterWhiteGameState {
    // Pour le mode single-device, on ignore les players réseau
    return createInitialGameState()
  }
  
  // --- Méthodes privées pour le nouveau flow ---
  
  private processFinishLoading(state: MisterWhiteGameState): MisterWhiteGameState {
    state.phase = 'home'
    return state
  }

  private processShowRules(state: MisterWhiteGameState): MisterWhiteGameState {
    state.phase = 'rules'
    return state
  }

  private processBackToHome(state: MisterWhiteGameState): MisterWhiteGameState {
    state.phase = 'home'
    return state
  }
  
  private processStartFromRules(state: MisterWhiteGameState): MisterWhiteGameState {
    state.phase = 'config'
    return state
  }
  
  private processSetConfig(state: MisterWhiteGameState, data: any): MisterWhiteGameState {
    state.config.playerCount = data.playerCount
    state.config.mode = 'image'
    state.config.selectedPairKey = data.selectedPairKey ?? ''
    state.config.difficulty = data.difficulty || 'medium'
    state.config.rounds = data.rounds || 1
    
    // Préparer la phase de setup (créer slots pour les joueurs)
    state.phase = 'setup'
    
    // Images : une paire par manche (imagesByRound) ou une seule (currentImages)
    const imagesByRound = data.imagesByRound ?? []
    state.gameData.imagesByRound = imagesByRound
    state.gameData.currentImages = data.currentImages ?? (imagesByRound.length > 0 ? imagesByRound[0]! : null)
    const themeForSecret = state.config.selectedPairKey ? state.config.selectedPairKey.split('|')[0] : 'libre-v2'
    state.gameData.guessPhase.secretWord = generateSecretWord(themeForSecret)
    
    // IMPORTANT: Réinitialiser toutes les données de la manche
    state.gameData.eliminatedPlayers = []
    state.gameData.eliminationHistory = []
    state.gameData.firstPlayer = null
    state.gameData.cardsSeen = {}
    state.gameData.roleAssignments = {}
    state.gameData.guessPhase = {
      isActive: false,
      needsValidation: false,
      validationVotes: {},
      secretWord: generateSecretWord(themeForSecret)
    }
    state.gameData.gamePhase = {
      discussionStarted: false,
      votingStarted: false,
      eliminationRevealed: false
    }
    // Reset le flag de scores appliqués
    ;(state.gameData as any).scoresApplied = false
    state.winner = undefined
    state.finishedAt = undefined
    
    // Préparer les rôles
    const roles = distributeRoles(data.playerCount)
    const shuffledRoles = shuffleArray(roles)
    
    // Conserver les noms d'une éventuelle partie précédente (ex: bouton "Nouvelle partie").
    // Si un nom est déjà connu pour le slot, le joueur n'aura qu'à découvrir son nouveau rôle.
    const savedNames = state.config.playerNames ?? []
    
    // Créer les slots de joueurs avec des rôles pré-assignés
    state.players = Array.from({ length: data.playerCount }, (_, index) => ({
      id: `player-${index}`,
      name: savedNames[index] ?? '',
      role: shuffledRoles[index],
      cardConfigured: false,
      isEliminated: false,  // IMPORTANT: Réinitialiser le statut éliminé
      score: 0
    }))
    
    // Enregistrer les assignations
    state.players.forEach(player => {
      state.gameData.roleAssignments[player.id] = player.role!
    })
    
    return state
  }
  
  private processConfigureCard(state: MisterWhiteGameState, cardIndex: number, playerName: string): MisterWhiteGameState {
    // Configurer la carte avec le nom du joueur
    state.players[cardIndex].name = playerName.trim()
    state.players[cardIndex].cardConfigured = true
    state.players[cardIndex].cardSeen = true
    
    const playerId = state.players[cardIndex].id
    state.gameData.cardsSeen[playerId] = true
    
    return state
  }
  
  private processStartGame(state: MisterWhiteGameState): MisterWhiteGameState {
    // Choisir le premier joueur (jamais Ghost Frame)
    const eligiblePlayers = state.players.filter(p => p.role !== 'ghost-frame')
    const firstPlayerIndex = Math.floor(Math.random() * eligiblePlayers.length)
    state.gameData.firstPlayer = eligiblePlayers[firstPlayerIndex].name
    
    // Passer à la phase de jeu avec vote automatiquement activé
    state.phase = 'game'
    state.gameData.gamePhase.discussionStarted = true
    state.gameData.gamePhase.votingStarted = true  // Démarrer automatiquement la phase de vote
    state.startedAt = new Date()
    
    return state
  }
  
  
  private processStartVoting(state: MisterWhiteGameState): MisterWhiteGameState {
    state.gameData.gamePhase.votingStarted = true
    return state
  }
  
  private processEliminatePlayer(state: MisterWhiteGameState, playerId: string): MisterWhiteGameState {
    // Trouver le joueur
    const player = state.players.find(p => p.id === playerId)
    if (!player) return state
    
    // Marquer comme éliminé
    state.gameData.eliminatedPlayers.push(playerId)
    player.isEliminated = true
    
    // Ajouter à l'historique
    state.gameData.eliminationHistory.push({
      playerId,
      playerName: player.name,
      role: player.role!,
      timestamp: new Date()
    })
    
    // Passer à la phase d'élimination
    state.phase = 'elimination'
    state.gameData.gamePhase.eliminationRevealed = true
    
    // Si Ghost Frame est éliminé, activer la phase de devinette
    if (player.role && player.role === 'ghost-frame') {
      state.gameData.guessPhase.isActive = true
      state.gameData.guessPhase.eliminatedGhostFrame = playerId
    } else {
      // Sinon, vérifier les conditions de victoire
      const winner = this.checkVictoryConditions(state)
      
      if (winner) {
        state.winner = winner
        // Appliquer les scores avant de passer à la phase scores
        this.applyScores(state)
        state.phase = 'scores'
        state.finishedAt = new Date()
      } else {
        // Si pas de victoire, redéfinir un nouveau premier joueur
        const remainingPlayers = state.players.filter(p => !p.isEliminated && p.role !== 'ghost-frame')
        if (remainingPlayers.length > 0) {
          const newFirstPlayerIndex = Math.floor(Math.random() * remainingPlayers.length)
          state.gameData.firstPlayer = remainingPlayers[newFirstPlayerIndex].name
        }
      }
      // Si pas de victoire, rester en phase elimination 
      // L'UI proposera de continuer le jeu
    }
    
    return state
  }
  
  private processSubmitGuess(state: MisterWhiteGameState, guessWord: string): MisterWhiteGameState {
    console.log('🎯 Processing Ghost Frame guess:', guessWord)
    
    // Enregistrer la devinette (emoji ou description d'image)
    state.gameData.guessPhase.guessWord = guessWord
    
    // PAS de validation automatique - les joueurs valideront manuellement à la fin
    state.gameData.guessPhase.needsValidation = true
    
    // Désactiver la phase de devinette
    state.gameData.guessPhase.isActive = false
    
    // Vérifier d'abord les conditions de victoire (imposteurs peuvent avoir gagné)
    const winner = this.checkVictoryConditions(state)
    
    if (winner) {
      // Une équipe a gagné !
      state.winner = winner
      this.applyScores(state)
      state.phase = 'scores'
      state.finishedAt = new Date()
      console.log('🏆 Victoire détectée après devinette:', winner.type)
    } else {
      // Le jeu continue - vérifier s'il reste assez de joueurs
      const remainingPlayers = state.players.filter(p => !p.isEliminated)
      
      if (remainingPlayers.length <= 1) {
        // Si pas assez de joueurs pour continuer, fin de partie naturelle
        state.phase = 'scores'
        state.finishedAt = new Date()
      } else {
        // La partie continue - redéfinir un nouveau premier joueur parmi les survivants
        const availableForFirstPlayer = remainingPlayers.filter(p => p.role !== 'ghost-frame')
        if (availableForFirstPlayer.length > 0) {
          const newFirstPlayerIndex = Math.floor(Math.random() * availableForFirstPlayer.length)
          state.gameData.firstPlayer = availableForFirstPlayer[newFirstPlayerIndex].name
        }
        
        // Retourner au jeu avec possibilité de voter
        state.phase = 'game'
        state.gameData.gamePhase.discussionStarted = true
        state.gameData.gamePhase.votingStarted = true
        state.gameData.gamePhase.eliminationRevealed = false
      }
      
      console.log('📋 Devinette enregistrée, le jeu continue...')
    }
    
    return state
  }
  
  private processAcceptGuessCollective(state: MisterWhiteGameState): MisterWhiteGameState {
    // Décision collective d'accepter la devinette du Ghost Frame
    console.log('✅ Devinette acceptée collectivement - Ghost Frame gagne !')
    
    state.gameData.guessPhase.isCorrect = true
    state.gameData.guessPhase.needsValidation = false
    
    // Ghost Frame gagne !
    state.winner = {
      type: 'ghost-frame',
      survivors: [state.gameData.guessPhase.eliminatedGhostFrame!]
    }
    
    // Calculer et appliquer les scores
    this.applyScores(state)
    
    // Passer à la phase des scores
    state.phase = 'scores'
    state.finishedAt = new Date()
    
    return state
  }
  
  private processRejectGuessCollective(state: MisterWhiteGameState): MisterWhiteGameState {
    // Décision collective de refuser la devinette du Ghost Frame
    console.log('❌ Devinette refusée collectivement - Les survivants gagnent')
    
    state.gameData.guessPhase.isCorrect = false
    state.gameData.guessPhase.needsValidation = false
    
    // Déterminer qui gagne parmi les survivants selon les règles normales
    const remainingPlayers = state.players.filter(p => !p.isEliminated)
    const survivorCivils = remainingPlayers.filter(p => p.role === 'civil')
    const survivorImpostors = remainingPlayers.filter(p => p.role === 'impostor')
    
    if (survivorCivils.length > 0 && survivorImpostors.length === 0) {
      state.winner = { type: 'civils', survivors: survivorCivils.map(p => p.id) }
    } else if (survivorImpostors.length > 0 && survivorCivils.length === 0) {
      state.winner = { type: 'impostors', survivors: survivorImpostors.map(p => p.id) }
    } else if (survivorCivils.length > 0 && survivorImpostors.length > 0) {
      // Les deux camps ont des survivants - victoire civils par défaut (ils ont éliminé Ghost Frame)
      state.winner = { type: 'civils', survivors: survivorCivils.map(p => p.id) }
    }
    
    console.log('🏆 Victoire des survivants:', state.winner?.type)
    
    // Calculer et appliquer les scores
    this.applyScores(state)
    
    // Passer à la phase des scores
    state.phase = 'scores'
    state.finishedAt = new Date()
    
    return state
  }
  
  private processContinueGame(state: MisterWhiteGameState): MisterWhiteGameState {
    // Vérifier d'abord les conditions de victoire
    const winner = this.checkVictoryConditions(state)
    
    if (winner) {
      // Une équipe a gagné !
      state.winner = winner
      this.applyScores(state)
      state.phase = 'scores'
      state.finishedAt = new Date()
      console.log('🏆 Victoire détectée:', winner.type)
      return state
    }
    
    // Revenir au jeu après une élimination sans victoire
    // Redéfinir un nouveau premier joueur parmi les non-éliminés (sauf Ghost Frame)
    const remainingPlayers = state.players.filter(p => !p.isEliminated && p.role !== 'ghost-frame')
    if (remainingPlayers.length > 0) {
      const newFirstPlayerIndex = Math.floor(Math.random() * remainingPlayers.length)
      state.gameData.firstPlayer = remainingPlayers[newFirstPlayerIndex].name
    }
    
    state.phase = 'game'
    state.gameData.gamePhase.discussionStarted = true
    state.gameData.gamePhase.votingStarted = true  // Réactiver la phase de vote pour permettre d'autres éliminations
    state.gameData.gamePhase.eliminationRevealed = false  // Reset l'état d'élimination
    return state
  }
  
  private processNextRound(state: MisterWhiteGameState, data?: { currentImages?: import('./game.state').ImagePair | null }): MisterWhiteGameState {
    // Incrémenter la manche
    state.config.currentRound++
    
    // Conserver les noms et scores des joueurs (ordre important)
    const playerData = state.players.map(player => ({
      name: player.name,
      score: player.score || 0
    }))
    
    // Réinitialiser avec la paire prévue pour la manche suivante (imagesByRound)
    const imagesByRound = state.gameData.imagesByRound ?? []
    const nextRoundImages = imagesByRound[state.config.currentRound - 1] ?? state.gameData.currentImages

    const configData: any = {
      playerCount: state.config.playerCount,
      mode: 'image',
      selectedPairKey: state.config.selectedPairKey,
      difficulty: state.config.difficulty,
      rounds: state.config.rounds,
      imagesByRound,
      currentImages: nextRoundImages
    }

    // Réinitialiser et reconfigurer (nouveaux rôles, images de la manche)
    const newState = this.processSetConfig(state, configData)

    // Utiliser la paire de la manche courante
    newState.gameData.currentImages = nextRoundImages

    // Restaurer les noms et scores MAIS réinitialiser les cartes
    // Les joueurs devront retourner leurs cartes pour voir leurs nouveaux rôles
    newState.config.playerNames = playerData.map(p => p.name)
    newState.players.forEach((player, index) => {
      if (playerData[index]) {
        player.name = playerData[index].name
        player.score = playerData[index].score
        // IMPORTANT: Ne pas marquer comme configuré - le joueur doit retourner sa carte
        player.cardConfigured = false
        player.cardSeen = false
      }
    })
    
    // Réinitialiser les cartes vues
    newState.gameData.cardsSeen = {}
    
    // Rester en phase setup pour que les joueurs retournent leurs cartes
    newState.phase = 'setup'
    
    return newState
  }
  
  private processNewGame(state: MisterWhiteGameState): MisterWhiteGameState {
    // Garder la configuration mais recommencer complètement
    const config = { ...state.config }
    // Conserver les noms des cartes de la partie précédente
    const previousNames = state.players.map(player => player.name)
    const newState = createInitialGameState()
    
    newState.config = { ...config, currentRound: 1, playerNames: previousNames }
    newState.phase = 'config'  // Retour à la configuration pour permettre des modifications
    
    return newState
  }
  
  private processResetGame(): MisterWhiteGameState {
    return createInitialGameState()
  }
  
  private checkVictoryConditions(state: MisterWhiteGameState): { type: 'civils' | 'impostors' | 'ghost-frame', survivors: string[] } | null {
    const survivors = state.players.filter(p => !p.isEliminated)
    const allPlayers = state.players
    
    const survivorCivils = survivors.filter(p => p.role === 'civil')
    const survivorImpostors = survivors.filter(p => p.role === 'impostor')
    const survivorWhite = survivors.filter(p => p.role === 'ghost-frame')
    
    const allCivils = allPlayers.filter(p => p.role === 'civil')
    const allImpostors = allPlayers.filter(p => p.role === 'impostor')
    const allWhite = allPlayers.filter(p => p.role === 'ghost-frame')
    
    // Cas spécial : Ghost Frame éliminé et a deviné correctement (validé à la fin)
    if (state.gameData.guessPhase.isCorrect && state.gameData.guessPhase.eliminatedGhostFrame) {
      return {
        type: 'ghost-frame',
        survivors: [state.gameData.guessPhase.eliminatedGhostFrame]
      }
    }
    
    // Victoire Ghost Frame : Il reste seulement lui + 1 autre joueur (2 joueurs au total)
    if (survivorWhite.length === 1 && survivors.length === 2) {
      return {
        type: 'ghost-frame',
        survivors: survivorWhite.map(p => p.id)
      }
    }
    
    // Victoire Imposteurs : Tous les civils sont éliminés ET Ghost Frame éliminé
    if (survivorCivils.length === 0 && survivorWhite.length === 0 && allCivils.length > 0) {
      return {
        type: 'impostors',
        survivors: survivorImpostors.map(p => p.id)
      }
    }
    
    // Victoire Civils : Tous les imposteurs ET le Ghost Frame sont éliminés
    if (survivorImpostors.length === 0 && survivorWhite.length === 0 && (allImpostors.length > 0 || allWhite.length > 0)) {
      return {
        type: 'civils',
        survivors: survivorCivils.map(p => p.id)
      }
    }
    
    return null
  }
  
  /**
   * Applique les scores calculés aux joueurs
   * 
   * Règles de points :
   * - Ghost Frame : points = nombre de joueurs éliminés avant lui + 2 bonus si devinette correcte
   * - Imposteurs gagnants : points = nombre de civils dans la partie
   * - Civils gagnants : points = nombre d'imposteurs dans la partie
   */
  private applyScores(state: MisterWhiteGameState): void {
    // IMPORTANT: Éviter la double attribution de points
    if ((state.gameData as any).scoresApplied) {
      console.log('⚠️ Scores déjà attribués pour cette manche, ignoré')
      return
    }
    
    // Marquer les scores comme appliqués
    (state.gameData as any).scoresApplied = true
    
    // Compter les rôles pour le calcul des points
    const totalCivils = state.players.filter(p => p.role === 'civil').length
    const totalImpostors = state.players.filter(p => p.role === 'impostor').length
    
    state.players.forEach(player => {
      let roundPoints = 0
      
      if (player.role === 'ghost-frame') {
        // Ghost Frame : points = nombre de joueurs éliminés avant lui
        const ghostFrameElimIndex = state.gameData.eliminationHistory.findIndex(e => e.playerId === player.id)
        
        if (ghostFrameElimIndex === -1) {
          // Ghost Frame non éliminé (victoire) = tous les joueurs éliminés comptent
          roundPoints = state.gameData.eliminationHistory.length
        } else {
          // Ghost Frame éliminé = seulement les joueurs éliminés avant lui
          roundPoints = ghostFrameElimIndex
        }
        
        // +2 points bonus s'il a trouvé le mot des civils
        if (state.gameData.guessPhase.isCorrect) {
          roundPoints += 2
        }
        
        console.log(`👻 Ghost Frame: ${roundPoints} pts (${ghostFrameElimIndex === -1 ? 'survécu' : ghostFrameElimIndex + ' éliminés avant'} + ${state.gameData.guessPhase.isCorrect ? '2 bonus' : '0 bonus'})`)
        
      } else if (state.winner) {
        const winnerType = state.winner.type
        const playerRole = player.role
        
        // Vérifier si le joueur fait partie du camp gagnant
        const isWinningCamp = 
          (winnerType === 'civils' && playerRole === 'civil') ||
          (winnerType === 'impostors' && playerRole === 'impostor')
        
        if (isWinningCamp) {
          if (playerRole === 'civil') {
            // Civils gagnants : points = nombre d'imposteurs
            roundPoints = totalImpostors
            console.log(`🏠 Civil gagnant: ${roundPoints} pts (${totalImpostors} imposteurs)`)
          } else if (playerRole === 'impostor') {
            // Imposteurs gagnants : points = nombre de civils
            roundPoints = totalCivils
            console.log(`🔴 Imposteur gagnant: ${roundPoints} pts (${totalCivils} civils)`)
          }
        }
      }
      
      // Ajouter les points de la manche au score total
      player.score = (player.score || 0) + roundPoints
      
      console.log(`📊 ${player.name} (${player.role}): +${roundPoints} pts → Total: ${player.score}`)
    })
  }
  
  private calculateScores(state: MisterWhiteGameState): Record<string, number> {
    const scores: Record<string, number> = {}
    
    state.players.forEach(player => {
      scores[player.id] = player.score || 0
    })
    
    return scores
  }
}
