/**
 * Sprint 6 — Utility AI
 *
 * Score candidate goals; highest wins. Feels organic vs hard if/else chains.
 */

import type { MascotEmotions } from "./types";
import type { MascotGoal } from "./behaviour";
import { dayPart, routineBias, COMPANION } from "./personality";
import { bondStage, getMemory } from "./memory";

export type UtilityContext = {
  emotions: MascotEmotions;
  msSinceInteract: number;
  currentGoal: MascotGoal;
  busy: boolean;
  modalOpen?: boolean;
};

export type ScoredGoal = {
  goal: MascotGoal;
  score: number;
  reason: string;
};

type Scorer = (ctx: UtilityContext) => ScoredGoal;

const scorers: Scorer[] = [
  (ctx) => {
    const { sleepiness, energy } = ctx.emotions;
    const r = routineBias(dayPart());
    let score = sleepiness * 0.7 + (1 - energy) * 0.4;
    if (r.preferNap) score += 0.25;
    if (sleepiness < 0.4) score *= 0.3;
    return {
      goal: "nap",
      score,
      reason: r.preferNap ? "routine rest" : "tired",
    };
  },
  (ctx) => {
    const { stress, confidence } = ctx.emotions;
    const shy = COMPANION.traits.shyness;
    let score = stress * 0.85 + shy * 0.15 - confidence * 0.2;
    if (stress < 0.35) score *= 0.25;
    return { goal: "ponder", score, reason: "settle nerves" };
  },
  (ctx) => {
    const { attention, boredom } = ctx.emotions;
    const stage = bondStage(getMemory());
    const lonelyThreshold =
      stage === "close" ? 35_000 : stage === "stranger" ? 65_000 : 50_000;
    let score = 0;
    if (ctx.msSinceInteract > lonelyThreshold) {
      score =
        0.45 +
        (1 - attention) * 0.35 +
        boredom * 0.15 +
        (stage === "close" ? 0.15 : 0);
    }
    return {
      goal: "seek-attention",
      score,
      reason: "desk quiet too long",
    };
  },
  (ctx) => {
    const { curiosity, energy, boredom, confidence } = ctx.emotions;
    const r = routineBias(dayPart());
    let score =
      boredom * 0.35 +
      curiosity * 0.35 +
      energy * 0.2 +
      confidence * 0.1;
    if (r.preferExplore) score += 0.12;
    if (ctx.modalOpen) score += 0.18;
    if (energy < 0.3) score *= 0.4;
    // Slight preference to re-wander
    if (ctx.currentGoal === "wander") score *= 0.85;
    return { goal: "wander", score, reason: "explore signals" };
  },
  (ctx) => {
    const { happiness, energy } = ctx.emotions;
    let score = 0;
    // Celebrate is usually event-driven; ambient only if very happy
    if (happiness > 0.8 && ctx.msSinceInteract < 12_000) {
      score = happiness * 0.5 + energy * 0.2;
    }
    return { goal: "celebrate", score, reason: "afterglow" };
  },
  (ctx) => {
    const { happiness, stress, boredom } = ctx.emotions;
    // Idle as soft default — never zero so something always ranks
    let score =
      0.22 +
      happiness * 0.15 -
      boredom * 0.1 -
      stress * 0.05;
    if (ctx.currentGoal === "idle") score += 0.05;
    return { goal: "idle", score, reason: "content baseline" };
  },
];

export function scoreGoals(ctx: UtilityContext): ScoredGoal[] {
  if (ctx.busy) return [];
  return scorers
    .map((fn) => fn(ctx))
    .map((s) => ({
      ...s,
      // Tiny noise so ties don't feel robotic
      score: Math.max(0, s.score + (Math.random() - 0.5) * 0.04),
    }))
    .sort((a, b) => b.score - a.score);
}

export function pickUtilityGoal(ctx: UtilityContext): ScoredGoal | null {
  const ranked = scoreGoals(ctx);
  if (!ranked.length) return null;
  const best = ranked[0];
  // Don't thrash: require margin to leave current goal (except wander)
  if (
    best.goal === ctx.currentGoal &&
    ctx.currentGoal !== "wander" &&
    best.score < 0.55
  ) {
    return { goal: ctx.currentGoal, score: best.score, reason: "hold" };
  }
  // Minimum bar for switching away from idle
  if (best.goal !== "idle" && best.score < 0.28) {
    return ranked.find((g) => g.goal === "idle") ?? best;
  }
  return best;
}

/** Cooldown from score intensity */
export function utilityCooldownMs(picked: ScoredGoal): number {
  switch (picked.goal) {
    case "nap":
      return 12_000;
    case "ponder":
      return 8_000;
    case "seek-attention":
      return 10_000;
    case "wander":
      return 5_000;
    case "celebrate":
      return 6_000;
    default:
      return 5_000;
  }
}
