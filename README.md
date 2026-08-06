# AnimeNexus — Lantern

Migrating the monolith SPA into **Next.js 15**.  
**Repo:** https://github.com/sixtoast/animenexus-lantern

See **[SPRINTS.md](./SPRINTS.md)** for the roadmap.

## Current: Sprint 2

- Live AniList trending on home
- **`/browse`** — feed tabs, search, filters, load more
- Shareable URL query params

```bash
npm install
npm run dev
```

- Home: http://localhost:3000  
- Browse: http://localhost:3000/browse  

## Stack

Next.js 15 · React 19 · TypeScript · AniList GraphQL

## Layout

```
app/page.tsx          # home + trending
app/browse/page.tsx   # catalog browse
components/           # Navbar, cards, BrowseClient
lib/anilist.ts        # GraphQL client
lib/genres.ts         # filter constants
```
