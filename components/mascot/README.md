# Mascot Engine (Companion)

Separated from recommendation UI. Lives under `lib/mascot` + `components/mascot`.

## Milestone status

| # | Goal | Status |
|---|------|--------|
| 1 | Placeholder chibi + idle/happy + habitat | **Done** |
| 2 | Walking / navigation on UI terrain | Planned |
| 3 | Animation state machine | Partial (store `anim`) |
| 4–5 | Behaviour + emotion drivers | Stub emotions in Zustand |
| 6–10 | UI awareness, physics, polish | Planned |

## Placeholder model

`PlaceholderChibi` is procedural meshes (sphere head, capsule body). Replace with a GLTF chibi later without rewriting the host or store.

## Events

- Click habitat → `happy`
- `animenexus:seal` → celebrate
- Route change → curiosity bump
- Long idle → sleepiness / boredom

## Toggle

`localStorage.anime_nexus_mascot` = `on` | `off`
