# Mascot Engine — Lantern-ko

Separated from recommendation UI. Lives under `lib/mascot` + `components/mascot`.

## Milestone status

| # | Goal | Status |
|---|------|--------|
| 1 | Placeholder chibi + habitat | Done |
| 2 | Walk / navigation | Done |
| 3 | Animation state machine | Done |
| 4 | Behaviour goals | Done |
| 5 | Emotion → motion profile | Done |
| 6 | UI landmark awareness | Done |
| 7 | Physics (jump / land) | Done |
| 8 | Context reactions | Done |
| 9 | Spontaneous skits | Done |
| 10 | Polish / optimise | **Done** |

## Architecture

```
Emotion → Behaviour (goal) → Animation → Physics / motion profile
                ↑
         ContextBridge + UiAwareness + skits
```

| Path | Role |
|------|------|
| `lib/mascot/store.ts` | Zustand engine |
| `lib/mascot/behaviour.ts` | Goal picker |
| `lib/mascot/anim-machine.ts` | Priority / ambient |
| `lib/mascot/emotions.ts` | Drives + motion profile |
| `lib/mascot/physics.ts` | Kinematic body (Rapier-ready) |
| `lib/mascot/ui-registry.ts` | DOM landmarks |
| `lib/mascot/skits.ts` | Weighted ambient acts |
| `components/mascot/*` | R3F view + host |

## Extending

**New anim:** add to `MascotAnim` + priority + pose branch in `PlaceholderChibi`.

**New goal:** extend `MascotGoal` + `chooseBehaviour` + `applyGoal`.

**New skit:** entry in `SKITS` array.

**GLTF model:** replace `PlaceholderChibi` mesh tree; keep locomotion/physics API.

**Landmark:**
```html
data-mascot-landmark="card" data-mascot-id="x" data-mascot-priority="5"
```

## Events

```ts
mascotNotify({ type: "seal" })
window.dispatchEvent(new CustomEvent("animenexus:loading", { detail: { active: true }}))
```

Toggle: `localStorage.anime_nexus_mascot` = `on` | `off`

## M10 polish

- Unmount WebGL when tab hidden or modal open
- Dim habitat under dialogs
- Low-power mode: phone / Save-Data → lower DPR, slower ticks, no Environment map
- Reduced motion → demand frameloop, no shadows/env
