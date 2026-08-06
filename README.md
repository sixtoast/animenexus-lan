# AnimeNexus — Lantern

Mood-based anime recommendations, a deep taste profile, and AI-powered tools — a late-night broadcast console.

This repository is a **Next.js** project that hosts the full original single-page application while providing an App Router shell for incremental migration to React components.

## Quick start

```bash
npm install
npm run dev
```

- **Hub page:** [http://localhost:3000](http://localhost:3000)  
- **Full Lantern console:** [http://localhost:3000/app](http://localhost:3000/app)

## Architecture

| Path | Role |
|------|------|
| `app/` | Next.js App Router (layout, landing, future React pages) |
| `public/index.html` | Complete original SPA (CSS + JS + markup in one file) |
| `styles/lantern.css` | Extracted design tokens & UI styles from the SPA |
| `components/` | Reserved for React extractions (cards, modals, etc.) |
| `lib/` | Reserved for API clients (AniList, Jikan, AI providers) |

The root rewrite maps `/app` → `/index.html` so the battle-tested console keeps working while you migrate features into `app/` and `components/`.

### Original features (SPA)

- Mood-based recommendations & filters  
- Watchlist + AniList / MAL sign-in  
- Taste profile, achievements, genre heatmap  
- Ancestry graph, compare, stats, seasonal charts  
- Daily challenge, quotes, radar, fusion, reverse recommendations  
- Night Desk AI, sauce (trace.moe), session tools (queue, break timer, flashback)  
- ARG / lore layer (“Night Signal”)  
- PWA-ready meta + optional service worker  

Data sources: **AniList** (primary), **Jikan/MAL** (fallback), optional user AI keys (OpenRouter, etc.).

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
```

## Migration path

1. Keep using `/app` for full functionality.  
2. Extract pure utilities into `lib/` (API wrappers, localStorage helpers).  
3. Port UI pieces to `components/` with `"use client"` where needed.  
4. Replace SPA routes with App Router pages when each feature is ready.  
5. Import `styles/lantern.css` (or split it) into layout as components land.

## License

All rights reserved by the original authors unless otherwise stated.  
Not affiliated with AniList, MyAnimeList, or any anime studio.
