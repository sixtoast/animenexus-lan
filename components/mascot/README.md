# Mascot Engine (Companion)

## Milestone status

| # | Goal | Status |
|---|------|--------|
| 1–6 | Render → UI awareness | Done |
| 7 | Physics (jump / land / bounce) | **Done** |
| 8 | Context-aware reactions | Next |
| 9–10 | Random skits / polish | Planned |

## M7 — physics

`lib/mascot/physics.ts` — kinematic body (no Rapier dependency yet).

- Gravity, floor collision, bounce, friction
- `steerToward` for walk
- `applyJump` / `jumpQueued` from store
- Anims: `jump`, `land`
- Celebrate / energetic wander may hop

Rapier can replace `stepPhysics` later without changing goals/emotions.
