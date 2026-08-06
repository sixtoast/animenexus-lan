# Mascot Engine — Lantern-ko

## Status: M1–M10 + extras

### Extras (post-roadmap)
| Feature | How |
|---------|-----|
| **Climb ledges** | Click brown platforms in habitat |
| **Drag** | Click-drag the character (complains playfully) |
| **Pet** | Double-click character |
| **GLTF** | Drop `public/mascot/companion.glb` |

### Interactions
- Click floor → walk
- Click ledge → jump-climb
- Single click body → celebrate hop
- Double-click → pet (same joy path)
- Drag → teleport + surprised

### Architecture
See prior milestones. Physics supports `floorY` platforms in `lib/mascot/physics.ts`.
