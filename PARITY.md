# AnimeNexus Lantern — SPA ↔ Next.js parity

Repo: **sixtoast/animenexus-lantern** · branch `main`

| Feature | Status | Evidence |
|--------|--------|----------|
| Shell / tools / lists / detail | done | prior sprints |
| Challenge silhouette + confetti | done | dissolve reveal + lantern pulse |
| Radar / Stats / Home / Session | done | session `data-session` env |
| Fan zone / Sauce / MAL | done | |
| Oracle vibe-cast cards | done | |
| Motion clip room | partial | no upscale |
| PWA icon.svg | done | |
| Streaming AI | done | |
| **Craft elevation** | **in progress** | cards, motion, skeletons, desk, seal |
| Night Signal ARG | **declined** | |

## Craft pass (Awwwards elevation — no new features)

### Critical (shipped)
- Elevated **AnimeCard**: on-list flame, hover glow, stagger entrance, view-transition name
- **motion.css**: easing tokens, reduced-motion, poster skeletons, FAB pulse, session ambient
- **Watchlist seal**: milestone toast + `animenexus:lantern-pulse` → FAB reacts
- Browse **PosterSkeleton** while filters pending

### High (shipped)
- **desk.css** + tools hub stagger cards
- Challenge silhouette **dissolve → revealed**
- Session **Tonight/Break** sets `html[data-session]` (sakura speed/alpha + body wash)
- Sakura respects reduced-motion + low hardware concurrency

### Still open (next craft cycles)
- Shared-element cover on detail (View Transitions full path)
- Tool page desk-band on every tool route
- Oracle band-switch deal animation
- `next/image` on cards (domains already in next.config)
- CSS consolidation (merge sprint-* files)
