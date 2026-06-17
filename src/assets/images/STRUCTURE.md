# 🖼️ Structure des Images Ghost Frame

## 📁 Organisation des Images

Chaque thème a un **manifeste** `pairs.json` qui liste les paires disponibles. Seuls les dossiers ayant **exactement 2 images** doivent être listés.

```
public/images/themes/
├── libre/
│   ├── pairs.json           ← Liste des paires (dossiers avec 2 images)
│   ├── paire-01/
│   │   ├── imageA.jpg       ← Noms libres (sans rôle)
│   │   └── imageB.jpg
│   ├── paire-02/
│   │   ├── fichier1.png
│   │   └── fichier2.png
│   └── ...
├── animaux/
│   ├── pairs.json
│   ├── paire-01/
│   └── ...
└── ...
```

## 🎯 Logique de jeu

- **Experts (civil)** : voient une des deux images de la paire.
- **Novices (imposteur)** : voient l’autre image.
- **Fantômes** : écran vide (aucune image).

L’application :
1. Charge le manifeste `pairs.json` du thème.
2. Choisit **une paire au hasard** parmi celles listées.
3. Détermine **aléatoirement** quelle image va aux Experts et laquelle aux Novices (à chaque partie/manche).

Les noms de fichiers n’ont pas de rôle (plus de civil.jpg / impostor.jpg) : l’assignation est faite au hasard par le jeu.

## 📄 Format de `pairs.json`

Un thème n’est utilisable en mode image que s’il contient un fichier `pairs.json` à la racine du thème :

```json
{
  "pairs": [
    { "id": "paire-01", "images": ["imageA.jpg", "imageB.jpg"] },
    { "id": "paire-02", "images": ["fichier1.png", "fichier2.png"] }
  ]
}
```

- **id** : nom du dossier (ex. `paire-01`, `paire-02`).
- **images** : tableau de **2** noms de fichiers présents dans ce dossier.
- Seules les paires avec **exactement 2 images** sont prises en compte.

## 📊 Ajouter des images

1. Créer le dossier : `public/images/themes/[theme]/paire-XX/`
2. Y mettre **2 images** (noms libres : `.jpg`, `.jpeg`, `.png`, etc.)
3. Créer ou éditer `public/images/themes/[theme]/pairs.json` et ajouter une entrée pour ce dossier avec les 2 noms de fichiers.
4. Seuls les thèmes ayant un `pairs.json` avec au moins une paire valide sont sélectionnables en mode image.

Vous pouvez ajouter des paires au fur et à mesure : seuls les dossiers déclarés dans `pairs.json` avec 2 images sont utilisés.

## 🔧 Mode Emoji vs Mode Image

- **Mode Emoji** : emojis définis dans le code, pas de manifeste.
- **Mode Image** : chargement du manifeste du thème, choix aléatoire d’une paire puis assignation aléatoire Expert/Novice ; Fantômes sans image.
