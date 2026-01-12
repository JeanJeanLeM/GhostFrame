# 🤖 Guide MODE AGENT - Création automatisée de jeux

## 🎯 Pourquoi MODE AGENT > Script JavaScript ?

### ✅ Avantages du MODE AGENT
- **Intelligence contextuelle** : Cursor comprend le code existant
- **Adaptation dynamique** : S'ajuste selon la complexité détectée
- **Intégration native** : Utilise l'IDE et ses fonctionnalités
- **Debugging intégré** : Correction automatique des erreurs
- **Évolutif** : S'améliore avec les mises à jour de Cursor

### ❌ Limites des scripts JavaScript
- Logique figée et prédéfinie
- Pas d'adaptation au contexte
- Maintenance manuelle requise
- Gestion d'erreurs basique
- Pas d'intelligence sur le code

## 🚀 Utilisation du MODE AGENT

### Étape 1 : Préparer l'artefact
```bash
# Sauvegarder votre artefact HTML Claude
# Exemple: mon-jeu.html
```

### Étape 2 : Activer le MODE AGENT
1. Ouvrir Cursor
2. Appuyer sur `Cmd/Ctrl + Shift + P`
3. Chercher "Cursor: Enable Agent Mode"
4. Ou utiliser le raccourci `Cmd/Ctrl + K`

### Étape 3 : Donner les instructions
```
🎮 MISSION: Créer un nouveau jeu multi-joueurs

📄 ARTEFACT: mon-jeu.html
🎯 NOM DU JEU: "Mon Super Jeu"

📋 PROCÉDURE: Suivre GAME_CREATION_PROCEDURE.md
📊 PLAN: Suivre GAME_CREATION_PROCEDURE.md

🎯 OBJECTIF: Module de jeu complet et fonctionnel
```

### Étape 4 : Supervision et validation
- Cursor exécute automatiquement les tâches
- Valider les étapes importantes
- Corriger si nécessaire
- Tester le résultat final

## 📋 Template d'instructions pour l'AGENT

### Instructions de base
```
Créer un nouveau jeu multi-joueurs à partir de l'artefact HTML fourni.

ARTEFACT: {chemin-vers-fichier.html}
NOM: "{Nom du Jeu}"

ÉTAPES:
1. Analyser l'artefact HTML
2. Créer la structure de fichiers
3. Implémenter la logique multi-joueurs
4. Créer l'interface utilisateur
5. Intégrer dans le registre
6. Créer les tests de base

RÉFÉRENCES:
- Procédure: GAME_CREATION_PROCEDURE.md
- Exemple: src/games/guessing-game/
```

### Instructions avancées
```
Créer un jeu multi-joueurs avancé avec les spécifications suivantes:

ARTEFACT: {fichier.html}
NOM: "{Nom du Jeu}"
TYPE: {quiz|drawing|cards|word|numbers|party}
JOUEURS: {min}-{max}
DURÉE: {minutes} minutes
COMPLEXITÉ: {easy|medium|hard}

FONCTIONNALITÉS SPÉCIALES:
- [ ] Timer en temps réel
- [ ] Animations avancées
- [ ] Sons et effets
- [ ] Mode spectateur
- [ ] Statistiques détaillées

CONTRAINTES:
- Compatible mobile obligatoire
- Performance optimisée
- Accessibilité (ARIA)
- Tests complets
```

## 🎨 Personnalisation par type de jeu

### Quiz/Trivia
```
FOCUS: Système de questions-réponses
- Gestion des questions multiples
- Timer par question
- Système de scoring avancé
- Catégories de questions
- Niveaux de difficulté
```

### Jeux de dessin
```
FOCUS: Canvas et interaction créative
- Outils de dessin
- Système de devinettes
- Galerie des œuvres
- Mode collaboration
- Export des créations
```

### Jeux de cartes
```
FOCUS: Logique de cartes et stratégie
- Gestion du deck
- Distribution des cartes
- Règles complexes
- IA pour joueurs manquants
- Variantes de règles
```

## 🔧 Commandes utiles pendant le développement

### Validation continue
```bash
# Vérifier la compilation en temps réel
npm run dev

# Tests automatiques
npm test -- --watch

# Linting continu
npm run lint -- --watch
```

### Debugging avec l'AGENT
```
AGENT: Analyser les erreurs TypeScript actuelles
AGENT: Optimiser les performances du jeu
AGENT: Ajouter des tests manquants
AGENT: Améliorer l'accessibilité
AGENT: Corriger les bugs de synchronisation
```

## 📊 Métriques de qualité

### Critères automatiques
- [ ] **Compilation** : 0 erreur TypeScript
- [ ] **Tests** : 100% de couverture des fonctions critiques
- [ ] **Performance** : < 100ms de latence
- [ ] **Accessibilité** : Score ARIA > 90%
- [ ] **Mobile** : Responsive sur tous écrans

### Critères fonctionnels
- [ ] **Gameplay** : Logique cohérente et amusante
- [ ] **Multi-joueurs** : Synchronisation parfaite
- [ ] **UX** : Interface intuitive
- [ ] **Robustesse** : Gestion d'erreurs complète
- [ ] **Évolutivité** : Code maintenable

## 🎯 Exemples de prompts efficaces

### Création basique
```
Créer le jeu "Quiz Musical" à partir de quiz-musical.html
- Type: trivia
- 2-6 joueurs
- Questions sur la musique
- Timer de 30s par question
```

### Création avancée
```
Transformer l'artefact drawing-game.html en jeu multi-joueurs:
- Nom: "Dessine et Devine"
- Canvas collaboratif
- Système de tours
- Galerie des dessins
- Mode équipes
- Scoring créatif
```

### Amélioration existante
```
Améliorer le jeu existant "guessing-game":
- Ajouter des niveaux de difficulté
- Implémenter des indices
- Créer un mode tournoi
- Optimiser l'interface mobile
```

## 🚀 Workflow recommandé

### 1. Préparation (5 min)
- Analyser l'artefact HTML
- Définir les objectifs
- Préparer les instructions

### 2. Création automatisée (30-60 min)
- Lancer le MODE AGENT
- Superviser l'exécution
- Valider les étapes clés

### 3. Personnalisation (15-30 min)
- Affiner la logique
- Améliorer l'interface
- Ajouter des fonctionnalités

### 4. Tests et validation (15 min)
- Tests multi-joueurs
- Validation mobile
- Performance check

### 5. Déploiement (5 min)
- Build final
- Documentation
- Partage avec l'équipe

## 💡 Conseils d'optimisation

### Pour l'AGENT
- **Instructions claires** : Soyez précis dans vos demandes
- **Contexte complet** : Fournissez tous les éléments nécessaires
- **Validation étapes** : Vérifiez les résultats intermédiaires
- **Itération rapide** : Corrigez et relancez si nécessaire

### Pour le code généré
- **Lisibilité** : Code auto-documenté
- **Performance** : Optimisations automatiques
- **Maintenabilité** : Structure modulaire
- **Évolutivité** : Extensibilité future

---

**🎯 RÉSULTAT** : Un jeu multi-joueurs complet, testé et prêt à l'emploi en moins d'une heure, avec la puissance de l'IA de Cursor ! 🚀
