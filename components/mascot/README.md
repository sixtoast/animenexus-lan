# Mascot Engine (Companion)

## Milestone status

| # | Goal | Status |
|---|------|--------|
| 1–8 | Render → context | Done |
| 9 | Random idle skits | **Done** |
| 10 | Polish / optimise | Next |

## M9 — skits

`lib/mascot/skits.ts` + `run-skit.ts`

| Skit | Feel |
|------|------|
| stretch | Quick hop |
| yawn / read | Think hold |
| dance | Happy bounce |
| binoculars | Point → think |
| spin-peek | Wave |

Rules: 32% chance per 16s tick, **28s cooldown**, skipped while busy / loading / sleeping / celebrating. Weights lean on current emotions.
