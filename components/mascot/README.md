# Mascot Engine (Companion)

## Milestone status

| # | Goal | Status |
|---|------|--------|
| 1 | Placeholder + habitat | Done |
| 2 | Walk / wander in habitat | Done |
| 3 | Animation state machine | **Done** |
| 4–5 | Richer behaviour loops | Next |
| 6+ | UI terrain / physics | Planned |

## M3 — state machine

`lib/mascot/anim-machine.ts`

- **Priority stack**: sleep < idle < walk < think < wave < happy < surprised
- **`requestAnim({ anim, holdMs, force })`** — gated interrupts
- **`preferredAmbient(emotions)`** — sleep / think / idle from drives
- **Emotion decay** each second + `tick` event
- **Sleep → click** = surprised → happy wake

Flow: **Emotion → ambient preference → animation** (reactions still force high priority).
