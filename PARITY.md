# AnimeNexus Lantern — SPA ↔ Next.js parity

Repo: **sixtoast/animenexus-lantern** · branch `main`

| Feature | Status | Evidence |
|--------|--------|----------|
| Shell / tools / lists / detail | done | prior sprints |
| Challenge silhouette + confetti | done | |
| Radar upcoming / Stats / Home / Session | done | |
| Fan zone / Sauce / MAL | done | |
| Oracle vibe-cast cards | done | Sprint M |
| Motion clip room (A) | partial | no upscale |
| PWA icon.svg + start_url `/` | done | |
| **Streaming AI** | **done** | `streamChatCompletions` + AI panel |
| Toast bounce / milestone | done | `sprint-n.css`, ToastProvider |
| Quote multi-fallback | done | animechan.io + xyz + local |
| SW shell cache v2 | done | no `/api` cache |
| View modes grid/poster/shelf | done | CSS under `data-view-mode` |
| Night Signal ARG | **declined** | |

## Sprint N (optional polish)
- [x] Streaming AI with non-stream fallback
- [x] Anime-style toast bounce + milestone flag
- [x] Quote API chain + expanded local fallbacks
- [x] Service worker: shell routes, skip API errors
- [x] View-mode CSS reinforcement
- [ ] Detail journal timeline — left thin (no scope creep)

## Smoke note (N)
AI panel streams when provider returns `text/event-stream`; otherwise falls back to full JSON response. ARG remains declined.
