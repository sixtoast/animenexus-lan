# Mascot Engine (Companion)

## Milestone status

| # | Goal | Status |
|---|------|--------|
| 1–4 | Render, walk, anim machine, behaviour | Done |
| 5 | Emotion system (drives + motion profile) | **Done** |
| 6 | UI awareness | Next |
| 7+ | Physics / polish | Planned |

## M5 — emotions

`lib/mascot/emotions.ts`

Drives (0–1): curiosity, energy, happiness, boredom, sleepiness, attention, **confidence**, **stress**.

`motionFromEmotions()` → walk speed, bob/arm amplitude, openness, tip glow, head droop, stress jitter.

Renderer samples profile every frame so tired = slower/smaller gait; happy = brighter lantern tip + stronger blush.
