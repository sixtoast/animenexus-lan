# AnimeNexus Lantern — Migration Sprints

Goal: replace the monolithic `index.html` SPA with a maintainable Next.js App Router app, feature by feature, without losing the warm “late-night broadcast” identity.

---

## Sprint overview

| Sprint | Theme | Outcome |
|--------|--------|---------|
| **1** | Foundation | Design tokens, types, AniList client, app shell, live trending grid |
| **2** | Browse & filters | Genre/status/format/year filters, sort, pagination, search |
| **3** | Detail experience | Anime modal/page, characters, trailer, relations, binge calc |
| **4** | Watchlist | Local persistence, status tabs, import/export |
| **5** | Mood engine | Mood chips → recommendation feeds |
| **6** | Auth | AniList / MAL username login + list sync |
| **7** | Taste profile | Stats, heatmap, badges, hours watched |
| **8** | Discover extras | Seasonal, airing schedule, radar, daily pick |
| **9** | Playful tools | Fusion, reverse (dislike), completionist, challenge, quotes |
| **10** | AI & sauce | Night Desk, AI panel, trace.moe sauce |
| **11** | Polish | Theme toggle, PWA, command palette, ARG/lore (optional) |

Each sprint ends with: working UI on `/`, types covered, and a short note in this file.

---

## Sprint 1 — Foundation (this sprint)

**In scope**

- [x] Document multi-sprint plan
- [x] Design tokens (Lantern palette) in `app/globals.css`
- [x] Shared `Anime` types
- [x] AniList GraphQL client + `mapAniListMedia`
- [x] App shell: navbar, footer strip
- [x] Home page: fetch trending media, render card grid
- [x] `AnimeCard` presentational component
- [x] Loading / empty / error states

**Out of scope (later sprints)**

- Filters, search, modal detail, watchlist, mood, auth, AI

**Done when**

- `npm run dev` shows a dark Lantern-styled home with real AniList trending posters and titles.

---

## Sprint 2 — Preview

Filter panel, URL-aware browse state, “Load more”, basic search (AniList `search` query).

---

## Conventions

- Client components only where needed (`"use client"`).
- Data fetching: server components preferred for first paint; client for interactive grids if needed.
- API keys for user AI stay in `localStorage` (never committed).
- Prefer AniList; Jikan as optional fallback in a later sprint if rate limits bite.
