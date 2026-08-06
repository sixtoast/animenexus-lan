# AnimeNexus Lantern — SPA ↔ Next.js parity

Repo: **sixtoast/animenexus-lantern** · branch `main`

| Feature | Status |
|--------|--------|
| Product surface | done |
| Craft cycle 1 (cards, motion, seal, session) | done |
| Craft cycle 2 (DeskShell, VT names, oracle deal, next/image) | done |
| Craft cycle 3 (VT nav, radar sweep, taste portrait) | done |
| Night Signal ARG | declined |

## Cycle 3
- **View Transitions**: card click uses `document.startViewTransition` → `router.push` when supported
- **Radar**: dish + sweeping beam while scanning; results **ping** in
- **Taste portrait**: editorial header from list stats + peak title chip
- Navbar badge: **Lantern** (not sprint labels)

## Optional later
- Full CSS merge of `sprint-*` files
- Sound (opt-in)
- Parallel routes / streaming shells
