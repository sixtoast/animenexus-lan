# AnimeNexus Lantern — SPA ↔ Next.js parity

Repo: **sixtoast/animenexus-lantern** · branch `main`

| Feature | Status | Evidence |
|--------|--------|----------|
| Shell (theme, toasts, FAB, cmdk, sakura) | done | `app/layout.tsx` |
| Browse / moods / seasonal / daily / airing | done | routes |
| Detail + vis-network ancestry | done | `AncestryGraph` (CDN) |
| Watchlist + AniList + MAL | done | Account, `lib/mal-user`, `/api/mal-list` |
| AI panel + Oracle modes | done | `AIPanel`, `oracle-cloud` |
| **Oracle vibe-cast cards** | **done** | JSON picks → `/api/search` → clickable cards |
| Fusion / dislike / completionist | done | tools |
| Challenge silhouette + confetti | done | `ChallengeClient`, `ConfettiBurst` |
| Radar upcoming | done | `RadarClient`, `/api/upcoming` |
| Stats | done | `/tools/stats` |
| Home + streak | done | `HomeDashboard`, `lib/streak` |
| Tonight / break / flashback | done | `SessionTools`, FAB, Q/B |
| Fan zone | done | `/tools/fanzone` |
| Sauce drop/paste/URL | done | `SauceClient` |
| **Motion studio** | **partial (A)** | sample grid (waifu.pics) + URL + recent; **no upscale** |
| Shortcuts `?`, loading theater, view modes | done | Sprint L |
| **PWA icons** | **done** | `public/icon.svg` + manifests |
| Night Signal ARG | **declined** | |
| Streaming AI | missing | optional Sprint N |

## Sprint M smoke (code-level verification)

- [x] M1 Vibecast: structured JSON prompt + `parseVibecastPicks` + resolve via list/`/api/search` + cards
- [x] M2 Motion option A: sample endpoints, preview, recent localStorage, honest upscale note
- [x] M3 Icons: `/icon.svg` referenced by manifests + layout metadata
- [x] M4 README matches this table
- [x] M5 Prior features left intact (no drive-by rewrites)

## Deploy note
Redeploy Vercel after pull. Manual UI smoke recommended for AI key paths (vibecast needs configured panel).
