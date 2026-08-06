# Mascot Engine (Companion)

## Milestone status

| # | Goal | Status |
|---|------|--------|
| 1 | Placeholder + habitat | Done |
| 2 | Walk / wander | Done |
| 3 | Animation state machine | Done |
| 4 | Behaviour system (goals) | **Done** |
| 5 | Richer emotion coupling | Next |
| 6+ | UI terrain / physics | Planned |

## M4 — behaviour

`lib/mascot/behaviour.ts` — pure `chooseBehaviour(emotions, context)`.

Goals:

| Goal | Meaning |
|------|--------|
| `idle` | Baseline |
| `wander` | Roam habitat |
| `nap` | Sleep pose |
| `ponder` | Think |
| `seek-attention` | Walk forward + wave |
| `celebrate` | User-driven joy |

Pipeline: **Emotion → Goal → Animation**

`runBehaviourTick()` every ~3s (and on `tick` / idle-long). Cooldowns prevent thrashing.
