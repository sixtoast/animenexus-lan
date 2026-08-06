# AnimeNexus — Lantern

Mood-based anime recommendations, a deep taste profile, and AI-powered tools — a late-night broadcast console.

**Next.js 15** project with an App Router shell. The full original SPA lives at `public/index.html` and is served at `/app`.

## Quick start

```bash
git clone https://github.com/sixtoast/animenexus-lantern.git
cd animenexus-lantern

# Add the full Lantern SPA (your original ~1MB index.html)
cp /path/to/your/index.html public/index.html

npm install
npm run dev
```

| URL | What |
|-----|------|
| http://localhost:3000 | Next.js hub / migration landing |
| http://localhost:3000/app | Full Lantern console (SPA) |

Repo: **https://github.com/sixtoast/animenexus-lantern**

## Project layout

```
animenexus-lantern/
├── app/                 # Next.js App Router
│   ├── layout.tsx       # metadata, fonts, theme
│   ├── page.tsx         # hub landing
│   └── globals.css      # shell tokens
├── components/          # future React ports
├── lib/                 # future API clients (AniList / Jikan)
├── public/
│   ├── index.html       # full SPA (add this file)
│   └── manifest.json
├── styles/              # optional extracted lantern.css
├── next.config.ts       # /app → /index.html rewrite
├── package.json
└── tsconfig.json
```

## Why this structure?

The source app is a large monolithic HTML file (~970KB of CSS + JS + markup). A line-by-line React rewrite of every feature (mood engine, watchlist, AI Night Desk, ARG lore, ancestry graph, etc.) is a multi-sprint effort.

This repo:

1. **Runs today** — drop in `public/index.html` and use `/app`.
2. **Is real Next.js** — App Router, TypeScript, image config for AniList covers.
3. **Supports gradual migration** — extract into `components/` and `lib/` over time.

## SPA features (when index.html is present)

- Mood recommendations & filters  
- Watchlist + AniList / MAL sign-in  
- Taste profile, achievements, genre heatmap  
- Ancestry graph, compare, stats, seasonal  
- Daily challenge, quotes, radar, fusion  
- Night Desk AI, sauce (trace.moe)  
- Session tools (queue, break timer, flashback)  
- Night Signal ARG / lore layer  

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # serve production
```

## License

All rights reserved by the original authors unless otherwise stated.  
Not affiliated with AniList, MyAnimeList, or any anime studio.
