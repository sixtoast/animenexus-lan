# AnimeNexus — Lantern

Mood-based anime recommendations, a deep taste profile, and AI-powered tools — a late-night broadcast console.

This repository is a **Next.js 15** project that hosts the full original single-page application while providing an App Router shell for incremental migration to React components.

## Quick start

```bash
git clone https://github.com/sixtoast/animenexus-lantern.git
cd animenexus-lantern

# Restore the full SPA + design CSS from compressed assets
python3 scripts/reconstitute.py

npm install
npm run dev
```

- **Hub page:** http://localhost:3000  
- **Full Lantern console:** http://localhost:3000/app

## Architecture

| Path | Role |
|------|------|
| `app/` | Next.js App Router (layout, landing, future React pages) |
| `public/index.html` | Complete original SPA (after `reconstitute.py`) |
| `styles/lantern.css` | Extracted design system (after `reconstitute.py`) |
| `scripts/*.gz*` | Compressed source of the SPA (checked into git) |
| `components/` | Reserved for React extractions |
| `lib/` | Reserved for AniList / Jikan / AI clients |

`next.config.ts` rewrites `/app` → `/index.html` so the full console keeps working while you migrate features into React.

### Features (SPA)

Mood recommendations, watchlist, AniList/MAL auth, taste profile, ancestry graph, compare, stats, seasonal charts, daily challenge, Night Desk AI, sauce (trace.moe), session tools, ARG lore layer, and more.

## Scripts

```bash
python3 scripts/reconstitute.py   # restore public/index.html + styles/lantern.css
npm run dev
npm run build
npm run start
```

## License

All rights reserved by the original authors unless otherwise stated.  
Not affiliated with AniList, MyAnimeList, or any anime studio.
