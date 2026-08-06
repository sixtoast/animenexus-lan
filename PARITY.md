# AnimeNexus Lantern — SPA ↔ Next.js parity

Honest status for **sixtoast/animenexus-lantern**. Evidence is file + behavior.

| Feature | Status | Evidence |
|--------|--------|----------|
| Shell (theme, toasts, FAB, cmdk, sakura) | done | `app/layout.tsx` |
| Browse / moods / seasonal / daily / airing | done | app routes |
| Detail (trailer, chars, relations, binge, notes, AI) | done | `app/anime/[id]` |
| Watchlist + AniList username | done | providers + account |
| AI panel + Oracle modes | done | `AIPanel`, `oracle-cloud` |
| Fusion / dislike / completionist | done | tools routes |
| **Challenge silhouette MCQ** | **done** | `ChallengeClient.tsx` — daily seed, `brightness(0)`, MCQ + hard tab |
| **Radar upcoming** | **done** | `RadarClient.tsx` + `/api/upcoming` + `fetchUpcoming` |
| **Ancestry vis-network** | **done** | `AncestryGraph.tsx` full-screen overlay + list fallback |
| **Stats** | **done** | `/tools/stats` + `StatsClient` + `lib/stats.ts` |
| **PWA start_url `/`** | **done** | `public/manifest.json` + `.webmanifest` |
| Home dashboard (continue, streak, rails) | partial / missing | still hero + trending |
| Tonight / break / flashback | missing | FAB mostly links |
| Fan zone / MAL / motion | missing | not on this branch |
| Night Signal ARG | declined | not shipped |

## Sprint I (this pass)
- [x] I1 Silhouette daily challenge
- [x] I2 Upcoming radar
- [x] I3 Interactive ancestry graph
- [x] I4 Stats page
- [x] I5 PWA manifests

Next: Sprint J (home dashboard + session tools) when ready.
