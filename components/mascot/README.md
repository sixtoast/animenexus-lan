# Mascot Engine (Companion)

## Milestone status

| # | Goal | Status |
|---|------|--------|
| 1 | Placeholder chibi + idle/happy + habitat | Done |
| 2 | Walking / navigation in habitat | **Done** |
| 3 | Full animation state machine | Partial |
| 4–5 | Behaviour + emotion drivers | Stub + wander |
| 6+ | UI terrain, physics, polish | Planned |

## M2 navigation

- XZ movement clamped to `HABITAT_BOUNDS`
- `go-to` event / click floor → walk to point
- Autonomous wander every ~4.5s when idle
- Walk gait: bob + arm swing; speed scales with `energy`
- Celebrations pause locomotion via `busyUntil`

## Placeholder

Still procedural meshes — replace with GLTF without changing navigation API.
