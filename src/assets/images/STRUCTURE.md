# 🖼️ Structure des Images Ghost Frame

## 📁 Organisation des Images

```
public/images/themes/          ← Images accessibles par le navigateur
├── libre/
│   ├── paire-01/
│   │   ├── civil.jpg      (ex: Pomme)
│   │   └── impostor.jpg   (ex: Orange)
│   ├── paire-02/
│   │   ├── civil.jpg      (ex: Chien)
│   │   └── impostor.jpg   (ex: Chat)
│   └── ...
├── animaux/
│   ├── paire-01/
│   │   ├── civil.jpg      (ex: Lion)
│   │   └── impostor.jpg   (ex: Tigre)
│   └── ...
├── nourriture/
├── metiers/
├── objets/
└── emotions/
```

## 🎯 Règles des Paires d'Images

### Civils vs Imposteurs
- **Civils** : Voient tous la même image (civil.jpg)
- **Imposteurs** : Voient tous la même image différente (impostor.jpg)
- **Ghost Frame** : Ne voit aucune image

### Format des Images
- **Format** : JPG, PNG, WebP
- **Taille** : 500x500px maximum
- **Noms** : Exactement "civil.jpg" et "impostor.jpg"

### Exemples de Paires
- **Paire Fruits** : Pomme (civil) vs Orange (impostor)  
- **Paire Animaux** : Chien (civil) vs Chat (impostor)
- **Paire Transports** : Voiture (civil) vs Moto (impostor)

## 🔧 Mode de Jeu

### Mode Emoji 😀
- Utilise les emojis définis dans le code
- Ghost Frame devine l'emoji exact

### Mode Image 🖼️  
- Utilise les images que vous fournissez
- Ghost Frame devine le mot/concept de l'image

## 📊 Pour Ajouter des Images

1. Créez le dossier : `public/images/themes/[theme]/paire-XX/`
2. Ajoutez : `civil.jpg` et `impostor.jpg`  
3. Mettez à jour `src/assets/images/imageRegistry.ts`
4. Les images seront automatiquement détectées

Le système supporte maintenant les deux modes ! 🎉




