# AnimeNexus Lantern — SPA ↔ Next.js parity

Honest status for **https://github.com/sixtoast/animenexus-lantern**.

| Feature | Status | Evidence |
|--------|--------|----------|
| Shell (theme, toasts, FAB, cmdk, sakura) | done | `app/layout.tsx` |
| Browse / moods / seasonal / daily / airing | done | routes |
| Detail + ancestry vis-network | done | `AncestryGraph` |
| Watchlist + AniList + **MAL** | done | Account + Jikan |
| AI panel + Oracle modes | done | `AIPanel`, `OracleClient` |
| Fusion / dislike / completionist | done | tools |
| Challenge silhouette MCQ + confetti | done | `ChallengeClient` + `ConfettiHost` |
| Radar upcoming | done | `RadarClient` + `/api/upcoming` |
| Stats | done | `/tools/stats` |
| PWA `start_url: /` | done | manifests |
| Home dashboard + streak | done | `HomeDashboard`, `lib/streak.ts` |
| Tonight / break / flashback | done | `SessionTools` + FAB + Q/B |
| Fan zone | done | `/tools/fanzone` |
| Sauce drop/paste/URL | done | `SauceClient` |
| Motion studio | partial | clip preview; no fake upscale |
| View modes grid/poster/shelf | done | `data-view-mode` CSS |
| Shortcuts `?` | done | `ShortcutsHelp` |
| Confetti + loading theater | done | Sprint L |
| Oracle vibe-cast cards | partial | text modes; soft card resolve |
| Night Signal ARG | **declined** | not shipped |
| Streaming AI tokens | missing | nice-to-have |

## Sprints
- **I** — Challenge, Radar, Ancestry, Stats, PWA ✅
- **J** — Home + session tools ✅
- **K** — Fanzone, MAL, Sauce, Motion ✅ (oracle cards partial)
- **L** — Atmosphere polish ✅ · ARG declined

Migration is **feature-complete** for the mission product paths (ARG declined by design).
