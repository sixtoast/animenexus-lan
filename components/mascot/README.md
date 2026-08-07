# Mascot Engine — Lantern-ko

> Not just systems — a **character**: shy-curious desk spirit who helps you find the next anime worth staying up for.

## Sprint status (personality roadmap)

| Sprint | Focus | Status |
|--------|--------|--------|
| **1** | Character identity, tastes, routine, reaction intents | **Done** |
| 2 | Thought → decision → emotion → action | Next |
| 3 | Living world / time-of-day polish | Planned |
| 4+ | Deep UI, cursor, memory, guide mode | Planned |

## Who they are

`lib/mascot/personality.ts`

- **Name:** Lantern-ko
- **Traits:** curious, a bit shy, loyal, low mischief
- **Loves:** slice-of-life, soft romance, seals, pets
- **Avoids:** horror / gore (hides / thinks)
- **Routine:** naps late night & dawn; explores evening

Genre reactions (intent → anim via `reactions.ts`):

| Intent | When |
|--------|------|
| `hide` | Horror / gore affinity |
| `blush` | Romance / soft genres |
| `pilot` | Mecha |
| `curious` / `point` | Strong positive affinity |
| `shy_wave` / `trust` | Pet |
| `celebrate` | Seal / complete |

## Architecture (existing)

```
Personality → Emotions → Goals → Animation → Physics / terrain
```

| Path | Role |
|------|------|
| `personality.ts` | Identity, genres, routine, intents |
| `reactions.ts` | Intent → anim + emotion deltas |
| `emotions.ts` | Drives + motion profile |
| `behaviour.ts` | Goal picker (routine-aware) |
| `store.ts` | Zustand engine |
| `LiveTerrain.tsx` | Corner home + occasional climbs |

## Toggle

`localStorage.anime_nexus_mascot` = `on` | `off`
