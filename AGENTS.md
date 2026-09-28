## Cursor Cloud specific instructions

GhostFrame is one Vite + TypeScript app. The running UI is single-device Ghost Frame (`src/components/App.ts`). Firebase Auth/Firestore code is present but not used by that entry point, so no Firebase project or emulators are required to play locally.

- Dev server: `npm run dev` (see `package.json`). Vite is pinned to port **3000** in `vite.config.ts`. The README’s `5173` is the Vite default and does not apply.
- The opening screen is a ~6 second loading animation, then the home screen (`Démarrer une partie`). A local round needs 3–10 players: create cards, enter each name and confirm the role or image, then `Passer au jeu`.
- Tests: `npx vitest run`. Vitest uses `environment: 'jsdom'` in `vite.config.ts`, but `jsdom` is not listed in `package.json`. The VM startup script installs it with `npm install --no-save jsdom`. `npm ci` removes that package until the extra install is run again.
- `npm install` rewrites the root name in `package-lock.json` from `party-games-template` to `ghostframe`. Do not commit that name-only change. The startup script restores the lockfile after installing `jsdom`.
- There is no ESLint config and no `lint` script. Typecheck with `npx tsc --noEmit`. `npm run build` runs that typecheck and then `vite build`.
- Agent videos live on one page: `http://localhost:3000/videos/` (`public/videos/index.html`). To add a film, put the mp4 and poster under `public/` and append a project to `public/videos/catalog.json` (`id`, `title`, `film`, `description`, `src`, `poster`, `duration`). Do not browse the page to prove playback. `vercel.json` builds the Vite app; `/videos` is the catalog on Vercel too.
