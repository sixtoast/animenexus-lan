# AnimeNexus — Lantern

Mood-based anime recommendations and late-night broadcast tools — migrating from a monolith SPA into **Next.js 15**.

**Repo:** https://github.com/sixtoast/animenexus-lantern

See **[SPRINTS.md](./SPRINTS.md)** for the full migration plan.

## Sprint 1 (current)

Foundation is live:

- Lantern design tokens
- Shared `Anime` types
- AniList GraphQL client (`lib/anilist.ts`)
- Navbar + home hero
- **Live trending grid** from AniList

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- AniList GraphQL (no API key required for public queries)

## Layout

```
app/           # routes + globals.css
components/    # Navbar, AnimeCard, AnimeGrid
lib/           # types, anilist client
SPRINTS.md     # roadmap
```

## Next up — Sprint 2

Browse filters, search, pagination.
