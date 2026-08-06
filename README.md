# AnimeNexus — Lantern (Next.js)

Late-night anime console: moods, watchlist, discovery tools, and AI desk.

**Repo:** https://github.com/sixtoast/animenexus-lantern  
**Parity status:** see [`PARITY.md`](./PARITY.md)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features (honest)

- Browse, moods, seasonal, daily, airing
- Detail pages + **vis-network ancestry** (CDN)
- Local watchlist; **AniList** username sync; **MAL** public list via Jikan
- Tools: fusion, dislike, completionist, **radar (upcoming)**, **stats**, **silhouette challenge**, sauce, oracle, **fan zone**, motion clip room
- Home dashboard: continue strip, streak, rails
- Session tools: Tonight / Break / Flashback (FAB + `Q` / `B`)
- Shortcuts: `?` · Command palette: `Ctrl/⌘+K`
- PWA: `start_url: "/"`, SVG icon
- **Night Signal ARG: declined** (not shipped)

## AI keys

1. Open the **🤖** panel
2. Set provider base URL (OpenRouter / OpenAI-compatible / Groq) + API key
3. Keys stay in `localStorage` as `anime_nexus_ai_settings`

**Vibe cast** mode returns structured picks → resolved clickable cards via `/api/search`.

## Account sync

- **AniList:** public username → connect + sync lists into local watchlist
- **MAL:** public username → Jikan import (rate-limited; private lists fail). MAL ids may not match AniList ids for the same show.

## Deploy

Connect the repo to **Vercel**. Node `>=18.18`. Build: `next build`.

## Motion studio

**Option A:** sample clip grid (waifu.pics) + URL preview + recent list. Full upscale is **not** implemented (needs external key).
