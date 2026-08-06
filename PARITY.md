# AnimeNexus Lantern — SPA ↔ Next.js parity

Repo: **sixtoast/animenexus-lantern** · branch `main`

| Feature | Status |
|--------|--------|
| Product surface | done |
| Craft cycles 1–4 | done |
| Craft cycle 5 (rooms, kit, stats portrait) | done |
| Night Signal ARG | declined |

## Cycle 5 (cohesion)
- **`RoomEnter`**: soft fade/slide on every route change (shared “room” continuity)
- **Interaction kit**: unified button transitions, `:active` press, `btn-ghost`, overlay enter keyframes
- **Stats portrait**: editorial lead line (shelf depth · finisher lean · genre signal) matching Taste

## Honest gap vs SPA
- Interaction quality still below the monolith’s density of micro-effects
- Architecture/maintainability remain the migration win
- Optional later: deeper Lantern agency, opt-in sound, full sprint-a CSS dissolve
