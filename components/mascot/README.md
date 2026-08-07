# Mascot Engine — Lantern-ko

> Personality first. Systems second.

## Sprint status

| Sprint | Focus | Status |
|--------|--------|--------|
| 1 | Identity, tastes, routine | Done |
| **2** | Thought → decision → emotion → action | **Done** |
| 3 | Living world / locomotion polish | Next |

## Decision pipeline (Sprint 2)

```
Event → decide() → Thought + ReactionPlan
                 → executeDecision()
                 → emotions + anim + optional goal
                 → optional thought bubble
```

| File | Role |
|------|------|
| `personality.ts` | Who they are |
| `decision.ts` | Think + choose intent |
| `reactions.ts` | Intent → anim / emotion deltas |
| `execute.ts` | Apply plan to store |
| `ThoughtBubble.tsx` | Rare soft speech |

Events routed through the layer: **pet, drag, seal, complete, idle-long, route**, plus ambient ticks.

## Character

Shy-curious desk spirit. Hides from horror, softens for romance, celebrates seals, returns to the corner after exploring.
