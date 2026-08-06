# AnimeNexus Lantern — SPA ↔ Next.js parity

Repo: **sixtoast/animenexus-lantern** · branch `main`

| Feature | Status | Evidence |
|--------|--------|----------|
| Product features (browse→tools) | done | prior sprints |
| Challenge + confetti + dissolve | done | |
| Ancestry vis-network | done | restored on detail |
| Oracle vibe-cast + card deal | done | |
| Craft: cards / motion / seal / session env | done | cycle 1 |
| Craft: DeskShell / VT cover / next/image | done | cycle 2 |
| Motion upscale | partial | |
| Night Signal ARG | **declined** | |

## Craft cycle 2
- `DeskShell` on all tool routes (shared band + panel)
- Detail cover `view-transition-name: cover-{id}` (matches cards)
- `AncestryGraph` restored on detail when relations exist
- Oracle band flash + vibe-cast **card deal** stagger
- `AnimeCard` uses `next/image` when host is allowlisted

## Still open
- Client-side `document.startViewTransition` on link clicks (progressive)
- CSS file merge (sprint-* → motion/desk/globals)
- Radar scan motif / Taste editorial portrait
