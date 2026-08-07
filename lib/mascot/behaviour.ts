import type { MascotEmotions } from "./types";
import { dayPart, routineBias, COMPANION } from "./personality";

export type MascotGoal =
  | "idle"
  | "wander"
  | "nap"
  | "ponder"
  | "seek-attention"
  | "celebrate";

export type BehaviourDecision = {
  goal: MascotGoal;
  reason: string;
  cooldownMs: number;
};

export function chooseBehaviour(
  emotions: MascotEmotions,
  opts: {
    msSinceInteract: number;
    currentGoal: MascotGoal;
    busy: boolean;
  },
): BehaviourDecision | null {
  if (opts.busy) return null;

  const {
    curiosity,
    energy,
    happiness,
    boredom,
    sleepiness,
    attention,
    confidence,
    stress,
  } = emotions;

  const part = dayPart();
  const routine = routineBias(part);
  const shy = COMPANION.traits.shyness;

  // Late night / dawn — personality prefers rest
  if (routine.preferNap && sleepiness > 0.55 && energy < 0.45) {
    return {
      goal: "nap",
      reason: `routine ${part} — lantern dimming`,
      cooldownMs: 14_000,
    };
  }

  if (sleepiness > 0.75 && energy < 0.4) {
    return {
      goal: "nap",
      reason: "sleepiness high, energy low",
      cooldownMs: 12_000,
    };
  }

  if (stress > 0.7) {
    return {
      goal: "ponder",
      reason: "stressed — settle (shy spirit)",
      cooldownMs: 8_000,
    };
  }

  // Shy: wait longer before seeking attention
  const lonelyMs = 40_000 + shy * 25_000;
  if (opts.msSinceInteract > lonelyMs && attention < 0.4) {
    return {
      goal: "seek-attention",
      reason: "quiet desk — soft check-in",
      cooldownMs: 10_000,
    };
  }

  if (boredom > 0.55 && curiosity > 0.45 && confidence > 0.3) {
    return {
      goal: "wander",
      reason: "bored but curious — look for signals",
      cooldownMs: 5_000,
    };
  }

  if (boredom > 0.5 && energy < 0.45) {
    return {
      goal: "ponder",
      reason: "bored and low energy",
      cooldownMs: 7_000,
    };
  }

  if (
    routine.preferExplore &&
    energy > 0.55 &&
    curiosity > 0.5 &&
    opts.currentGoal !== "wander"
  ) {
    return {
      goal: "wander",
      reason: `routine ${part} — explore desk`,
      cooldownMs: 5_000,
    };
  }

  if (happiness > 0.75 && opts.msSinceInteract < 8_000) {
    return {
      goal: "idle",
      reason: "content after interaction",
      cooldownMs: 6_000,
    };
  }

  if (opts.currentGoal === "idle" && Math.random() < 0.35 * (1 - shy * 0.3)) {
    return {
      goal: "wander",
      reason: "ambient roam",
      cooldownMs: 6_000,
    };
  }

  return {
    goal: "idle",
    reason: "baseline",
    cooldownMs: 5_000,
  };
}
