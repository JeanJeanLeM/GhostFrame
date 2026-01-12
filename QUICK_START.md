# 🚀 Quick Start - Créer votre premier jeu

Ce guide vous accompagne pour créer rapidement un nouveau jeu à partir d'un artefact Claude HTML en utilisant le **MODE AGENT** de Cursor.

## 🎯 Processus en 3 étapes

### 1. Préparer votre artefact HTML

Si vous avez un jeu HTML créé avec Claude :

```bash
# Sauvegarder votre artefact HTML dans le projet
# Par exemple: mon-jeu-claude.html
```

### 2. Activer le MODE AGENT de Cursor

1. Ouvrir Cursor
2. Appuyer sur `Cmd/Ctrl + K` (MODE AGENT)
3. Donner les instructions à l'agent

### 3. Instructions pour l'AGENT

```
🎮 MISSION: Créer un nouveau jeu multi-joueurs

📄 ARTEFACT: mon-jeu-claude.html
🎯 NOM DU JEU: "Mon Super Jeu"

📋 PROCÉDURE: Suivre GAME_CREATION_PROCEDURE.md
📊 PLAN: Suivre GAME_CREATION_PROCEDURE.md

🎯 OBJECTIF: Module de jeu complet et fonctionnel
```

## 📁 Ce qui est créé automatiquement par l'AGENT

```
src/games/mon-super-jeu/
├── game.config.ts          # ✅ Configuré automatiquement
├── game.state.ts           # ✅ Interfaces TypeScript générées
├── game.logic.ts           # ✅ Logique implémentée
├── game.ui.ts             # ✅ Interface créée
├── index.ts               # ✅ Module complet
└── tests/                 # ✅ Tests unitaires
```

## 🎮 Exemples d'instructions pour l'AGENT

### Exemple 1 : Jeu de Quiz

```
Créer le jeu "Quiz Party" à partir de quiz-claude.html
- Type: trivia  
- 2-6 joueurs
- Questions à choix multiples
- Timer de 30s par question
```

### Exemple 2 : Jeu de Dessin

```
Transformer dessin.html en jeu multi-joueurs "Dessine et Devine"
- Canvas collaboratif
- Système de devinettes
- Tours de 2 minutes
- Mode équipes optionnel
```

### Exemple 3 : Création avancée

```
Créer "Bataille Navale" multi-joueurs
- Grille 10x10 par joueur
- Placement automatique des navires
- Tour par tour en temps réel
- Animations des tirs
```

## 🔧 Personnalisation rapide

### 1. Ajuster la configuration (`game.config.ts`)

```typescript
export const gameConfig: GameConfig = {
  id: 'mon-super-jeu',
  name: 'Mon Super Jeu',
  description: 'Description de votre jeu', // ← Modifier ici
  minPlayers: 2,                          // ← Ajuster
  maxPlayers: 6,                          // ← Ajuster
  estimatedDuration: 15,                  // ← En minutes
  difficulty: 'medium',                   // ← easy/medium/hard
  category: ['party', 'custom']           // ← Ajouter des catégories
}
```

### 2. Définir l'état du jeu (`game.state.ts`)

```typescript
export interface MonSuperJeuGameState {
  currentTurn: number
  currentPlayerId: string
  phase: 'setup' | 'playing' | 'finished'
  gameData: {
    // Vos données spécifiques ici
    score: number
    level: number
    // etc.
  }
  scores: Record<string, number>
}
```

### 3. Implémenter la logique (`game.logic.ts`)

Suivez la procédure dans `GAME_CREATION_PROCEDURE.md` avec le MODE AGENT de Cursor.

## 🧪 Tester votre jeu

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
# Votre jeu apparaîtra dans la liste !
```

## 📋 Checklist de validation

- [ ] Le jeu apparaît dans la liste des jeux disponibles
- [ ] La création de partie fonctionne
- [ ] Le lobby affiche correctement les informations
- [ ] Les joueurs peuvent rejoindre la partie
- [ ] La logique de base fonctionne
- [ ] L'interface est responsive (mobile + desktop)
- [ ] Les scores sont mis à jour correctement

## 🆘 Problèmes courants

### Le jeu n'apparaît pas dans la liste

**Solution** : Vérifiez que le jeu est bien enregistré dans `src/games/gameRegistry.ts`

### Erreurs TypeScript

**Solution** : Vérifiez les types dans `game.state.ts` et `game.logic.ts`

### Interface cassée

**Solution** : Vérifiez les classes CSS dans `game.ui.ts`

## 🎯 Prochaines étapes

1. **Améliorer l'UI** : Ajouter des animations, sons, effets visuels
2. **Optimiser la logique** : Gérer les cas limites, améliorer les performances
3. **Ajouter des fonctionnalités** : Spectateurs, replay, statistiques
4. **Tester en multi-joueurs** : Inviter des amis pour tester l'expérience

## 📚 Ressources utiles

- **Guide complet** : `GAME_CREATION_GUIDE.md`
- **Exemple de référence** : `src/games/guessing-game/`
- **Template de base** : `src/games/_template/`
- **Documentation API** : `README.md`

---

**💡 Astuce** : Commencez simple ! Implémentez d'abord une version basique qui fonctionne, puis ajoutez progressivement les fonctionnalités avancées.

**🎮 Bon développement !**
