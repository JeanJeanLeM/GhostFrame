# Agent notes

- Dev server: `npm run dev` on port 3000. Local single-device play needs no `.env`.
- Vitest uses `environment: 'jsdom'`. Keep `jsdom` declared as a devDependency.
- The live game is pass-the-phone on one device. It does not use Firebase or a database.
- Build is `npm run build`. Output is `dist`.
- Do not commit a lockfile change that only renames the root package from `party-games-template` to `ghostframe`.
- Preview and production deploys are on Vercel, team Charles' projects. Production branch is `main`. Production: https://ghostframe-mocha.vercel.app
