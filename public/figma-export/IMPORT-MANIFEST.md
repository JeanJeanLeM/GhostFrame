# GhostFrame — Figma asset import manifest

Figma file: [GhostFrame - UI Screens](https://www.figma.com/design/j43wCRpE1p7tB6Oq2zXS2N) → page **Assets**

## Status (2026-07-03) — Reorganization

Pairs renumbered to **12 accepted** (paire-01 … paire-12) with two Figma grids:

| Grid | Content | Frames |
|------|---------|--------|
| **Accepté** | 12 v2 pairs in new order | 24 × 270×480 |
| **Refusé** | 8 rejected v2 + 22 v1 libre pairs | 60 × 270×480 |

### Accepté order (new numbering)

| # | Theme | Images |
|---|-------|--------|
| 01 | chat | chat-maine-coon-mignon, chat-moche-sans-poils |
| 02 | shakira | shakira-coupe-monde-2060, shakira-waka-waka-2010 |
| 03 | complot lune | astronaute-lune-1969, astronaute-lune-plateau |
| 04 | elizabeth | reine-elizabeth-elegante, reine-elizabeth-jogging |
| 05 | musk | elon-mcdonalds-drive, elon-kfc-drive |
| 06 | chien | chien-golden-beau, chien-batard-triste |
| 07 | terre plate | terre-plate-espace, terre-ronde-espace |
| 08 | trump | trump-palestine-greta, trump-climate-greta |
| 09 | daft-eminem | daft-punk-voiture, eminem-cybertruck |
| 10 | macron | macron-gilet-jaune, macron-zadiste-ukulele |
| 11 | singe | chimpanze-echecs, chimpanze-voiture |
| 12 | frigo | frigo-range, frigo-bazar |

### Refusé v2 (old numbering)

paire-03, 05, 06, 07, 08, 15, 17, 20 — see `public/images-v2/rejected/pairs.json`

### Refusé v1

All 22 pairs from `public/images/pairs.json` — frames named `v1-paire-XX - A/B`

## Source paths

```
public/images-v2/paire-01/ … paire-12/     ← accepted (app + Figma Accepté)
public/images-v2/rejected/               ← rejected v2
public/images/paire-01/ … paire-22/        ← v1 libre (Figma Refusé only)
```

Drag-and-drop copies for accepted pairs: `public/figma-export/paire-01/` … `paire-12/`

## Known gaps

| Issue | Details |
|-------|---------|
| **paire-06 (cafe)** | Listed in rejected manifest but **both JPGs missing on disk**; frame still present in Figma Refusé from earlier upload |
| paire-17 B | `curry-dance-fortnite.jpg` never generated; using `lebron-dance-fortnite-clown-fallback.jpg` |
