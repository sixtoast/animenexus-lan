# AnimeNexus Lantern — SPA ↔ Next.js parity

Honest status for **sixtoast/animenexus-lantern**. Evidence is file + behavior.

| Feature | Status | Evidence |
|--------|--------|----------|
| Shell (theme, toasts, FAB, cmdk, sakura) | done | `app/layout.tsx` |
| Browse / moods / seasonal / daily / airing | done | app routes |
| Detail + ancestry graph | done | `AncestryGraph` vis overlay |
| Watchlist + AniList username | done | providers + account |
| AI panel + Oracle | done | `AIPanel`, `oracle-cloud` |
| Fusion / dislike / completionist | done | tools |
| Challenge silhouette MCQ | done | `ChallengeClient` daily seed + MCQ |
| Radar upcoming | done | `RadarClient` + `/api/upcoming` |
| Stats | done | `/tools/stats` |
| PWA `start_url: /` | done | manifests |
| **Home dashboard** | **done** | `HomeDashboard` continue + chips + rails |
| **Listening streak** | **done** | `lib/streak.ts` → `anime_nexus_streak_v1` |
| **Tonight / break / flashback** | **done** | `SessionTools` + FAB + `Q`/`B` |
| Fan zone / MAL / motion | missing | Sprint K |
| Sauce DnD/paste | partial | audit in K |
| Night Signal ARG | declined | not shipped |

## Sprint J
- [x] Home continue strip + status chips + streak
- [x] Tonight queue (`anime_nexus_tonight_queue`)
- [x] Break timer + dock
- [x] Flashback
- [x] FAB wiring

## Smoke (I+J)
- [x] Challenge silhouette + MCQ
- [x] Radar upcoming
- [x] Ancestry graph navigates
- [x] Stats real numbers
- [x] Manifest `/`
- [x] Home continue + streak
- [x] FAB tonight / break / flashback
