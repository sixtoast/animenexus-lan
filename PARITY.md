# AnimeNexus Lantern — SPA ↔ Next.js parity

Repo: **sixtoast/animenexus-lantern** · branch `main`

| Feature | Status |
|--------|--------|
| Product surface | done |
| Craft cycles 1–3 | done |
| Craft cycle 4 (CSS merge + loading shells) | done |
| Night Signal ARG | declined |

## Cycle 4
- Merged `sprint-l.css`, `sprint-n.css`, `card-link.css` → **`motion.css`**
- Layout drops those three imports (fewer CSS requests)
- `app/browse/loading.tsx` + `app/anime/[id]/loading.tsx` skeleton shells
- `sprint-a.css` kept (base shell / cards / filters — larger surface)

## Intentionally not done
- Opt-in sound (scope; a11y default off)
- Full parallel routes (optional Next architecture)
- Deleting `sprint-a.css` wholesale (risk without full visual regression suite)
