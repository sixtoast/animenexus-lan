# Mascot Engine (Companion)

## Milestone status

| # | Goal | Status |
|---|------|--------|
| 1–7 | Render → physics | Done |
| 8 | Context-aware reactions | **Done** |
| 9 | Random idle skits | Next |
| 10 | Polish / optimise | Planned |

## M8 — context

`ContextBridge` watches the real app:

| Signal | Reaction |
|--------|----------|
| Loading | Think → long wait sleeps |
| Loading done | Wave |
| Error box | Surprised + stress |
| Empty watchlist | Think |
| Fast scroll | Surprised |
| Theme change | Wave |
| Watching titles | Context flag |

Fire from anywhere:

```ts
window.dispatchEvent(new CustomEvent('animenexus:loading', { detail: { active: true }}))
window.dispatchEvent(new CustomEvent('animenexus:error'))
window.dispatchEvent(new CustomEvent('animenexus:theme', { detail: { theme: 'light' }}))
```
