# AnimeNexus Lantern — SPA ↔ Next.js parity

**Source of truth:** original ~21k-line `index.html` SPA  
**Target:** Next.js 15 App Router (`sixtoast/animenexus-lantern`)

Status legend: `done` · `partial` · `missing`

---

## A. Information architecture

| SPA surface | Next route / surface | Status |
|-------------|----------------------|--------|
| Home dashboard + browse workspace | `/` + `/browse` | **partial** — home is thin trending/moods; no dual dashboard/continue strip/rails/stats |
| Recommendations / mood | `/` chips + `/mood/[slug]` | **partial** |
| Search / cmdk | — | **missing** (API `/api/search` only) |
| Watchlist | `/watchlist` | **partial** — statuses + progress; no export/import/tags depth |
| Fusion | `/tools/fusion` | **partial** — score/blurb only, not API rec cards |
| Completionist | — | **missing** |
| Dislike / reverse | — | **missing** |
| Seasonal | `/seasonal` | **partial** |
| Airing schedule | — | **missing** |
| Challenge (silhouette) | `/tools/challenge` | **partial** — text quiz, not silhouette |
| Fan zone | — | **missing** |
| Oracle / Night Desk | `/tools/oracle` | **partial** — local heuristics only (not cloud AI) |
| Sauce | `/tools/sauce` | **partial** |
| Motion / upscale | — | **missing** |
| Radar | — | **missing** |
| Stats overlay | — | **missing** |
| Compare | `/tools/compare` | **partial** |
| Taste | `/taste` | **partial** |
| Account AniList + MAL | `/account` | **partial** — AniList only |
| Anime detail / modal | `/anime/[id]` | **partial** |
| Ancestry (vis-network) | — | **missing** |
| Tonight / break / flashback | — | **missing** |
| AI chat panel | — | **missing** |
| Night Signal ARG | — | **missing** |
| PWA | manifest only | **partial** |
| Shortcuts `?` | — | **missing** |

---

## B. Design system & atmosphere

| Item | Status |
|------|--------|
| Dark lantern tokens | **done** |
| Light theme `html[data-theme="light"]` | **done** |
| Theme toggle + `anime_nexus_theme` | **done** |
| Sticky glass navbar + mobile menu | **partial** |
| Hero time-of-day greeting | **done** |
| Scroll progress bar | **done** |
| Loading theater (Lottie) | **missing** |
| Anime-style toasts | **done** |
| Confetti | **missing** |
| Sakura / sky ambient | **missing** |
| FAB menu | **partial** — chrome + links; tonight/break/AI still missing |
| Quote carousel banner | **partial** — banner + fetch chain; autoplay/save later |
| Card hover / heart / view modes grid·poster·shelf | **partial** — view modes done |
| Overlay system (Esc, click-outside) | **partial** |

---

## C. Data & API

| Item | Status |
|------|--------|
| AniList GraphQL primary | **done** |
| Jikan/MAL fallback | **missing** |
| Discover feeds / filters | **partial** |
| Mood recommendations | **partial** |
| Random / surprise | **missing** |
| Detail depth | **partial** |
| Themes OP/ED | **missing** |
| Watchlist key `anime_nexus_watchlist` | **partial** — uses `animenexus.watchlist.v1` (migrate) |
| Export/import JSON | **missing** |
| AniList username sync | **done** |
| MAL path | **missing** |
| Taste DNA / heatmap / badges | **missing** |
| trace.moe proxy | **partial** |
| Quote multi-API | **partial** |
| Cloud AI | **missing** |
| Confessions remote | **missing** |

---

## Storage key alignment

| SPA key | Next today |
|---------|------------|
| `anime_nexus_watchlist` | `animenexus.watchlist.v1` |
| `anime_nexus_auth` | `animenexus.session.v1` |
| `anime_nexus_theme` | **done** |
| `anime_nexus_view_mode` | **done** |
| `anime_nexus_streak_v1` | — |
| `anime_nexus_ai_settings` | — |

---

## Sprint plan

| Sprint | Theme | Status |
|--------|--------|--------|
| **A** | Shell & CSS | **done** |
| B | Detail depth | next |
| C | Lists & taste | |
| D | AI | |
| E | Discovery tools | |
| F | Sauce & challenge | |
| G | Fan + session | |
| H | Ancestry + motion + ARG + PWA | |
