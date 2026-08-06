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

---

## Sprint 1 — Foundation ✅

Design tokens, types, AniList client, shell, trending grid.

---

## Sprint 2 — Browse & filters ✅

`/browse` with URL params, feed tabs, search, filters, load more.

---

## Sprint 3 — Detail experience ✅

**In scope**

- [x] `/anime/[id]` route + metadata
- [x] Cover, banner, titles, score, format, status, season
- [x] Genre chips → browse filter links
- [x] Synopsis, studios, AniList external link
- [x] Trailer embed (YouTube when available)
- [x] Character grid (role + image)
- [x] Cards link to detail pages
- [x] `not-found` state

---

## Sprint 4 — Preview

Watchlist with localStorage, status tabs (watching / planning / completed), add/remove from detail.

---

## Conventions

- Client components only where needed (`"use client"`).
- Prefer AniList; server fetch for first paint.
